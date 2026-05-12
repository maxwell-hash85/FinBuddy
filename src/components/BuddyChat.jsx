import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { simulateBuddyReply } from "../utils/buddySimulation";
import { IconSend, IconSparkles } from "./icons";

/** iMessage-style dark chat chrome (fixed look regardless of app theme). */
const CHAT = {
  shell: "#0d0d0f",
  headerBg: "#141416",
  messagesBg: "#000000",
  buddyBubble: "#2c2c2e",
  userBubble: "#2563eb",
  textOnDark: "#f5f5f7",
  textMuted: "#8e8e93",
  borderSubtle: "rgba(255,255,255,0.1)",
  inputBg: "#1c1c1e",
  typingDot: "#a1a1a6",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
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

/**
 * FinBuddy chat — simulation-first using live financial props.
 * Set `VITE_CHAT_USE_API=true` to try `/api/chat` first, then fall back to simulation.
 */
export default function BuddyChat({
  balance,
  savingsRate,
  transactions,
  topCategory,
  spendingBreakdown,
  income,
  expense,
  context,
}) {
  const useApi = import.meta.env.VITE_CHAT_USE_API === "true";

  const simProps = useMemo(
    () => ({
      balance,
      savingsRate,
      transactions,
      topCategory,
      spendingBreakdown,
      income,
      expense,
    }),
    [balance, savingsRate, transactions, topCategory, spendingBreakdown, income, expense]
  );

  const [messages, setMessages] = useState(() => {
    const at = Date.now();
    return [
      {
        id: "seed-1",
        role: "buddy",
        text: "I’m FinBuddy — ask about spending, savings, or whether something’s worth buying. I’m using your live numbers from this page.",
        at,
      },
    ];
  });
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);

  const canSend = useMemo(() => draft.trim().length > 0 && !isTyping, [draft, isTyping]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const resolveReply = useCallback(
    async (userText, recentPayload) => {
      if (useApi && context) {
        try {
          return await fetchBuddyReply({ messages: recentPayload, context });
        } catch {
          /* fall through to simulation */
        }
      }
      return simulateBuddyReply(userText, simProps);
    },
    [useApi, context, simProps]
  );

  async function send() {
    const text = draft.trim();
    if (!text || isTyping) return;

    const userAt = Date.now();
    setDraft("");
    const userMsg = { id: `u-${userAt}`, role: "user", text, at: userAt };
    setMessages((prev) => [...prev, userMsg]);

    setIsTyping(true);

    const recent = [...messages, userMsg].slice(-24).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      text: m.text,
    }));

    await sleep(420);
    const replyText = await resolveReply(text, recent);
    const botAt = Date.now();
    setMessages((prev) => [...prev, { id: `b-${botAt}`, role: "buddy", text: replyText, at: botAt }]);
    setIsTyping(false);
  }

  return (
    <div
      style={{
        background: CHAT.shell,
        border: `1px solid ${CHAT.borderSubtle}`,
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
      }}
    >
      <style>{`
        @keyframes fbDotDark {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>

      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${CHAT.borderSubtle}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: CHAT.headerBg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <IconSparkles size={20} color="#10b981" />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: CHAT.textOnDark,
                letterSpacing: "-0.02em",
              }}
            >
              FinBuddy
            </div>
            <div style={{ fontSize: "11px", color: CHAT.textMuted, marginTop: "2px" }}>
              {useApi ? "Try API first · falls back to smart replies" : "Smart replies · uses your live totals"}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: CHAT.textMuted,
            border: `1px solid ${CHAT.borderSubtle}`,
            borderRadius: "999px",
            padding: "4px 10px",
          }}
        >
          CHAT
        </div>
      </div>

      <div
        ref={listRef}
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minHeight: "min(52vh, 380px)",
          maxHeight: "min(52vh, 380px)",
          overflowY: "auto",
          background: CHAT.messagesBg,
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
                  borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  border: `1px solid ${isUser ? "transparent" : CHAT.borderSubtle}`,
                  fontSize: "14px",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: isUser ? CHAT.userBubble : CHAT.buddyBubble,
                  color: CHAT.textOnDark,
                }}
              >
                {m.text}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: CHAT.textMuted,
                  padding: isUser ? "0 6px 0 0" : "0 0 0 6px",
                }}
              >
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
                border: `1px solid ${CHAT.borderSubtle}`,
                background: CHAT.buddyBubble,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "12px", color: CHAT.textMuted, marginRight: "4px" }}>FinBuddy</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: CHAT.typingDot,
                    animation: `fbDotDark 1.2s infinite`,
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
          padding: "12px 14px",
          borderTop: `1px solid ${CHAT.borderSubtle}`,
          background: CHAT.headerBg,
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
          placeholder="Message FinBuddy…"
          aria-label="Message FinBuddy"
          style={{
            flex: 1,
            background: CHAT.inputBg,
            border: `1px solid ${CHAT.borderSubtle}`,
            borderRadius: "12px",
            padding: "12px 14px",
            color: CHAT.textOnDark,
            outline: "none",
            fontSize: "14px",
            fontFamily: "inherit",
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          aria-label="Send message"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "46px",
            height: "46px",
            flexShrink: 0,
            background: canSend ? CHAT.userBubble : "#3a3a3c",
            border: `1px solid ${canSend ? "#1d4ed8" : CHAT.borderSubtle}`,
            borderRadius: "12px",
            cursor: canSend ? "pointer" : "not-allowed",
            transition: "opacity 0.15s ease, transform 0.08s ease",
          }}
        >
          <IconSend size={20} color={canSend ? "#ffffff" : CHAT.textMuted} />
        </button>
      </div>
    </div>
  );
}
