import { useEffect, useMemo, useRef, useState } from "react";
import { COLORS } from "../styles/colors";

const bubbleBase = {
  padding: "10px 12px",
  borderRadius: "12px",
  border: `1px solid ${COLORS.border}`,
  fontSize: "13px",
  lineHeight: "1.55",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

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
    return "Noted. If you paste a few expenses, I can spot patterns and suggest a simple rule to tighten things up.";
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
  const [messages, setMessages] = useState(() => [
    {
      id: "seed-1",
      role: "buddy",
      text: "I’m FinBuddy.\nLog spending → I analyze → you get actions.\nWhat’s on your mind today?",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState({ mode: "ui", error: null });
  const listRef = useRef(null);

  const canSend = useMemo(() => draft.trim().length > 0 && !isTyping, [draft, isTyping]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  async function send() {
    const text = draft.trim();
    if (!text || isTyping) return;

    setDraft("");
    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    setIsTyping(true);
    setStatus((s) => ({ ...s, error: null }));

    try {
      const recent = [...messages, userMsg].slice(-16).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        text: m.text,
      }));

      const replyText = await fetchBuddyReply({ messages: recent, context });
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: "buddy", text: replyText }]);
      setStatus({ mode: "ai", error: null });
    } catch (err) {
      const replyText = makeFakeReply(text);
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, role: "buddy", text: replyText },
        ]);
        setIsTyping(false);
      }, 500);
      setStatus({
        mode: "ui",
        error: err instanceof Error ? err.message : "AI request failed",
      });
      return;
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.textPrimary }}>
            FinBuddy Chat
          </div>
          <div style={{ fontSize: "11px", color: COLORS.textSecondary, letterSpacing: "0.08em" }}>
            {status.mode === "ai" ? "AI connected" : "Fake responses"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            color: COLORS.textSecondary,
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: COLORS.green,
              boxShadow: `0 0 8px ${COLORS.green}`,
              display: "inline-block",
            }}
          />
          {status.error ? "degraded" : "online"}
        </div>
      </div>

      {status.error && (
        <div
          style={{
            padding: "10px 1.25rem",
            borderBottom: `1px solid ${COLORS.border}`,
            background: "rgba(239,68,68,0.08)",
            color: COLORS.textSecondary,
            fontSize: "12px",
            lineHeight: "1.5",
          }}
        >
          AI unavailable: <span style={{ color: COLORS.textPrimary }}>{status.error}</span>
        </div>
      )}

      <div
        ref={listRef}
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          height: "280px",
          overflowY: "auto",
          background: COLORS.bg,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...bubbleBase,
                maxWidth: "92%",
                background: m.role === "user" ? COLORS.surface : "rgba(34,197,94,0.06)",
                borderColor: m.role === "user" ? COLORS.border : "rgba(34,197,94,0.25)",
                color: COLORS.textPrimary,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                ...bubbleBase,
                background: "rgba(34,197,94,0.06)",
                borderColor: "rgba(34,197,94,0.25)",
                color: COLORS.textSecondary,
              }}
            >
              FinBuddy is typing…
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "0.9rem 1.25rem",
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
            if (e.key === "Enter") send();
          }}
          placeholder="Ask FinBuddy…"
          style={{
            flex: 1,
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "10px",
            padding: "10px 12px",
            color: COLORS.textPrimary,
            outline: "none",
            fontSize: "13px",
          }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          style={{
            background: canSend ? COLORS.green : COLORS.border,
            border: `1px solid ${canSend ? COLORS.greenDark : COLORS.border}`,
            color: canSend ? "#04130a" : COLORS.textMuted,
            padding: "10px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: canSend ? "pointer" : "not-allowed",
            transition: "transform 0.06s ease",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

