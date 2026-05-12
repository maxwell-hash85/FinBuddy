import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../context/useTheme";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function makeFakeReply(text) {
  const t = (text || "").trim().toLowerCase();
  if (!t) return "Say something and I’ll respond.";

  if (t.includes("hello") || t.includes("hi") || t.includes("hey")) {
    return "Hey — I’m FinBuddy. Tell me what you spent today and I’ll help you stay on track.";
  }

  if (t.includes("budget") || t.includes("plan")) {
    return "Got it. Quick win: pick one category to cap this week (food, shopping, etc.). What’s the one you want to control?";
  }

  if (t.includes("spent") || t.includes("expense") || t.includes("cost")) {
    return "Noted. Tell me which category feels leakiest — we’ll tighten it with one concrete rule.";
  }

  if (t.includes("save") || t.includes("savings")) {
    return "Nice. Small, repeatable moves win. What’s your goal this month: save more, spend less, or both?";
  }

  return "I’m here. Tell me what you want to improve this month and I’ll give you one clear next action.";
}

async function fetchBuddyReply({ messages, context }) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (typeof data?.text !== "string") throw new Error("Bad response from server");
  return data.text;
}

export default function BuddyChat({ context }) {
  const { colors: COLORS } = useTheme();
  const [messages, setMessages] = useState(() => {
    const at = Date.now();
    return [
      {
        id: "seed-1",
        role: "buddy",
        text: "I’m FinBuddy — ask me anything about your spending. I’ll use your live totals and categories from this session.",
        at,
      },
    ];
  });
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState({ mode: "ui", error: null });
  const listRef = useRef(null);

  const canSend = useMemo(() => draft.trim().length > 0 && !isTyping, [draft, isTyping]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  async function send() {
    const text = draft.trim();
    if (!text || isTyping) return;

    const userAt = Date.now();
    setDraft("");
    const userMsg = { id: `u-${userAt}`, role: "user", text, at: userAt };
    setMessages((prev) => [...prev, userMsg]);

    setIsTyping(true);
    setStatus((s) => ({ ...s, error: null }));

    const recent = [...messages, userMsg].slice(-24).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      text: m.text,
    }));

    try {
      const replyText = await fetchBuddyReply({ messages: recent, context });
      const botAt = Date.now();
      setMessages((prev) => [...prev, { id: `b-${botAt}`, role: "buddy", text: replyText, at: botAt }]);
      setStatus({ mode: "ai", error: null });
    } catch (err) {
      const replyText = makeFakeReply(text);
      const botAt = Date.now();
      window.setTimeout(() => {
        setMessages((prev) => [...prev, { id: `b-${botAt}`, role: "buddy", text: replyText, at: botAt }]);
        setIsTyping(false);
      }, 450);
      setStatus({
        mode: "ui",
        error: err instanceof Error ? err.message : "AI request failed",
      });
      return;
    }
    setIsTyping(false);
  }

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: COLORS.shadowChat,
      }}
    >
      <style>{`
        @keyframes fbDot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>

      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          background: COLORS.surface,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: COLORS.textPrimary, letterSpacing: "-0.02em" }}>
            FinBuddy
          </div>
          <div style={{ fontSize: "12px", color: COLORS.textSecondary, lineHeight: 1.35 }}>
            {status.mode === "ai" ? "Connected — answers use your numbers" : "Offline demo mode"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            color: COLORS.textSecondary,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: status.error ? COLORS.amber : COLORS.green,
              boxShadow: status.error ? "none" : `0 0 0 4px ${COLORS.greenGlow}`,
              display: "inline-block",
            }}
          />
          {status.error ? "Degraded" : "Ready"}
        </div>
      </div>

      {status.error && (
        <div
          style={{
            padding: "10px 1.25rem",
            borderBottom: `1px solid ${COLORS.border}`,
            background: COLORS.redSoft,
            color: COLORS.textSecondary,
            fontSize: "12px",
            lineHeight: "1.5",
          }}
        >
          AI unavailable — using offline replies:{" "}
          <span style={{ color: COLORS.textPrimary, fontWeight: 600 }}>{status.error}</span>
        </div>
      )}

      <div
        ref={listRef}
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minHeight: "min(52vh, 380px)",
          maxHeight: "min(52vh, 380px)",
          overflowY: "auto",
          background: COLORS.bg,
        }}
      >
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                gap: "6px",
              }}
            >
              <div
                style={{
                  maxWidth: "88%",
                  padding: "11px 14px",
                  borderRadius: isUser ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                  border: `1px solid ${isUser ? COLORS.border : COLORS.blueStroke}`,
                  fontSize: "14px",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: isUser ? COLORS.surface : COLORS.blueSoft,
                  color: COLORS.textPrimary,
                  boxShadow: isUser ? COLORS.shadowSm : "none",
                }}
              >
                {m.text}
              </div>
              <div style={{ fontSize: "11px", color: COLORS.textMuted, padding: isUser ? "0 6px 0 0" : "0 0 0 6px" }}>
                {typeof m.at === "number" ? formatTime(m.at) : ""}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "4px" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "18px",
                border: `1px solid ${COLORS.blueStroke}`,
                background: COLORS.surface,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "12px", color: COLORS.textSecondary, marginRight: "6px" }}>FinBuddy</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: COLORS.blue,
                    animation: `fbDot 1.2s infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "0.85rem 1rem",
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.surface,
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) send();
          }}
          placeholder="Ask FinBuddy…"
          aria-label="Message FinBuddy"
          style={{
            flex: 1,
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "12px 14px",
            color: COLORS.textPrimary,
            outline: "none",
            fontSize: "14px",
            fontFamily: "inherit",
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          style={{
            background: canSend ? COLORS.blue : COLORS.border,
            border: `1px solid ${canSend ? COLORS.blueDark : COLORS.border}`,
            color: canSend ? "#ffffff" : COLORS.textMuted,
            padding: "12px 14px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: canSend ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            transition: "background 0.15s ease, transform 0.08s ease",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
