import { useEffect, useState } from "react";
import { COLORS } from "../styles/colors";

async function fetchInsight(context) {
  const res = await fetch("/api/insights", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ context }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  if (typeof data?.insight !== "string") throw new Error("Bad insight response");
  return data.insight;
}

function heuristicInsight(context) {
  const w = context?.trends?.weekOverWeek;
  const monthExp = context?.currentMonth?.expenses ?? 0;
  const monthInc = context?.currentMonth?.income ?? 0;
  const top = context?.topSpendingCategory;

  if (w?.direction === "up" && typeof w.pctChange === "number" && w.pctChange > 0) {
    return `You're spending faster this week than last (${w.pctChange}% higher). ${top ? `Tighten ${top} first — small cuts compound.` : "Pick one category to trim for a few days."}`;
  }

  if (monthInc > 0 && monthExp > monthInc * 0.85) {
    return `You're using most of this month's income on expenses. Pause optional buys for a few days so your balance stays healthy${top ? ` — especially ${top}.` : "."}`;
  }

  const strained = context?.categoryBudgets?.find((c) => c.percentUsed >= 85);
  if (strained) {
    return `${strained.category} is at ~${strained.percentUsed}% of its monthly cap. Slow spending there until month-end so you stay under ₦${strained.monthlyLimit.toLocaleString("en-NG")}.`;
  }

  return `You're tracking consistently. Next step: pick one habit (meal caps, transport days, or no-spend evenings) and repeat it this week.`;
}

export default function FinBuddyInsightCard({ context }) {
  const [text, setText] = useState(() => heuristicInsight(context));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const insight = await fetchInsight(context);
        if (!cancelled) setText(insight.trim());
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load insight");
          setText(heuristicInsight(context));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [context]);

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "16px",
        padding: "1.25rem 1.35rem",
        marginBottom: "14px",
        boxShadow: COLORS.shadowSm,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.textSecondary,
            fontWeight: 600,
          }}
        >
          FinBuddy insight
        </div>
        {loading && (
          <div style={{ fontSize: "11px", color: COLORS.blue, fontWeight: 600 }}>Updating…</div>
        )}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "15px",
          lineHeight: 1.55,
          color: COLORS.textPrimary,
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        {text}
      </p>
      {error && (
        <p style={{ margin: "10px 0 0", fontSize: "12px", color: COLORS.textSecondary }}>
          Showing offline insight ({error})
        </p>
      )}
    </div>
  );
}
