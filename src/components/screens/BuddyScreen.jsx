import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { useTransactions } from "../../hooks/useTransactions";
import { streamBuddyReply } from "../../utils/buddyChatApi";
import { buildTransactionsSummary } from "../../utils/buildTransactionsSummary";
import {
  calcTotals,
  getSpendingByCategory,
  getTopCategory,
} from "../../utils/calcFinance";
import { simulateBuddyReply } from "../../utils/buddySimulation";
import { streamText } from "../../utils/streamText";
import BuddyAvatar from "../BuddyAvatar";

const GREEN = "#2bc62c";
const USER_BG = "#1a2a1a";
const USER_TEXT = "#6fcf6f";
const BUDDY_BG = "#161616";
const NAV_HEIGHT = 72;

function highlightFigures(text, accent = GREEN) {
  const parts = text.split(/(₦[\d,]+\.?\d*|\d+%)/g);
  return parts.map((part, i) => {
    if (/^(₦[\d,]+\.?\d*|\d+%)$/.test(part)) {
      return (
        <span key={i} style={{ color: accent, fontWeight: 600 }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function BuddyScreen() {
  const { colors: COLORS } = useTheme();
  const { transactions } = useTransactions();

  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "buddy",
      text: "Hey — I'm Buddy. Ask me anything about your spending, savings, or whether a purchase fits your budget.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sendLaunch, setSendLaunch] = useState(0);
  const listRef = useRef(null);
  const abortRef = useRef(null);

  const transactionsSummary = useMemo(
    () => buildTransactionsSummary(transactions),
    [transactions],
  );

  const simProps = useMemo(() => {
    const totals = calcTotals(transactions);
    return {
      ...totals,
      transactions,
      topCategory: getTopCategory(transactions),
      spendingBreakdown: getSpendingByCategory(transactions),
    };
  }, [transactions]);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const canSend = draft.trim().length > 0 && !isStreaming;

  async function send() {
    const text = draft.trim();
    if (!text || isStreaming) return;

    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    const buddyId = `b-${Date.now()}`;
    const buddyMsg = { id: buddyId, role: "buddy", text: "" };

    setDraft("");
    setSendLaunch((k) => k + 1);
    setMessages((prev) => [...prev, userMsg, buddyMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const onDelta = (chunk) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === buddyId ? { ...m, text: m.text + chunk } : m)),
      );
    };

    try {
      try {
        await streamBuddyReply({
          messages: [...messages, userMsg],
          transactionsSummary,
          signal: controller.signal,
          onDelta,
        });
      } catch (apiErr) {
        if (apiErr.name === "AbortError") throw apiErr;
        const reply = simulateBuddyReply(text, simProps);
        await streamText(reply, onDelta, controller.signal);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === buddyId ? { ...m, text: m.text || `Sorry — ${message}` } : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: `calc(100vh - ${NAV_HEIGHT}px - env(safe-area-inset-bottom, 0px))`,
        maxWidth: "720px",
        margin: "0 auto",
        background: COLORS.bg,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: `1px solid ${COLORS.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <motion.div
            animate={isStreaming ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={
              isStreaming
                ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          >
            <BuddyAvatar size={40} />
          </motion.div>
          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              <span style={{ color: "#ffffff" }}>Fin</span>
              <span style={{ color: GREEN }}>Buddy</span>
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: GREEN,
                letterSpacing: "0.04em",
                marginTop: "2px",
              }}
            >
              ● ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minHeight: 0,
        }}
      >
        {messages.map((m, index) => {
          const isUser = m.role === "user";
          const isTyping =
            !isUser && isStreaming && index === messages.length - 1 && !m.text;

          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: isUser ? 0 : "8px",
              }}
            >
              {!isUser && (
                <motion.div
                  animate={isTyping ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={
                    isTyping
                      ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                      : undefined
                  }
                >
                  <BuddyAvatar size={28} />
                </motion.div>
              )}
              <div
                style={{
                  maxWidth: isUser ? "85%" : "78%",
                  padding: "12px 14px",
                  borderRadius: isUser ? "14px 0 14px 14px" : "0 14px 14px 14px",
                  background: isUser ? USER_BG : BUDDY_BG,
                  fontSize: "14px",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: isUser ? USER_TEXT : COLORS.textSecondary,
                }}
              >
                {isUser ? m.text : isTyping ? "…" : highlightFigures(m.text)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input row */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          padding: "12px 16px",
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.bg,
          flexShrink: 0,
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Message Buddy…"
          aria-label="Message Buddy"
          disabled={isStreaming}
          style={{
            flex: 1,
            background: COLORS.surface,
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
          aria-label="Send message"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            flexShrink: 0,
            background: canSend ? GREEN : COLORS.surface,
            border: `1px solid ${canSend ? GREEN : COLORS.border}`,
            borderRadius: "12px",
            cursor: canSend ? "pointer" : "not-allowed",
            color: canSend ? "#0d0d0d" : COLORS.textMuted,
            fontFamily: "inherit",
            transition: "opacity 0.15s ease",
          }}
        >
          <motion.div
            key={sendLaunch}
            animate={{ x: [0, 4, 0] }}
            whileTap={{ scale: 0.75, rotate: 15 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Send size={18} strokeWidth={2} />
          </motion.div>
        </button>
      </div>
    </div>
  );
}
