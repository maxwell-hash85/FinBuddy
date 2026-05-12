import { useMemo } from "react";
import { useTheme } from "../context/useTheme";
import { getPrimaryProactiveInsight } from "../utils/proactiveInsights";
import { IconSparkles } from "./icons";

/** Locally computed proactive insight — no network calls. */
export default function FinBuddyInsightCard({ transactions }) {
  const { colors: COLORS } = useTheme();
  const insight = useMemo(() => getPrimaryProactiveInsight(transactions), [transactions]);

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
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <IconSparkles size={18} color={COLORS.green} />
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.textSecondary,
            fontWeight: 600,
          }}
        >
          Proactive insight
        </div>
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
        {insight}
      </p>
    </div>
  );
}
