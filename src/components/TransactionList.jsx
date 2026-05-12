import { useState } from "react";
import { useTheme } from "../context/useTheme";
import { fmt } from "../utils/calcFinance";

export default function TransactionList({ transactions, onDelete }) {
  const { colors: COLORS } = useTheme();
  const [hoveredId, setHoveredId] = useState(null);

  if (transactions.length === 0) {
    return (
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "12px",
          textAlign: "center",
          padding: "2.5rem 1rem",
          color: COLORS.textMuted,
          fontSize: "12px",
          letterSpacing: "0.05em",
          marginBottom: "2rem",
        }}
      >
        NO TRANSACTIONS YET — ADD ONE ABOVE
      </div>
    );
  }

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "2rem",
      }}
    >
      {transactions.map((txn, i) => {
        const isIncome = txn.type === "income";
        const color = isIncome ? COLORS.green : COLORS.red;
        const isLast = i === transactions.length - 1;
        const isHovered = hoveredId === txn.id;

        return (
          <div
            key={txn.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 1.25rem",
              borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`,
              background: isHovered ? COLORS.surfaceHover : "transparent",
              transition: "background 0.1s",
            }}
            onMouseEnter={() => setHoveredId(txn.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              style={{
                width: "3px",
                height: "32px",
                borderRadius: "2px",
                background: color,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                  letterSpacing: "0.02em",
                }}
              >
                {txn.type.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: COLORS.textSecondary,
                  marginTop: "2px",
                }}
              >
                {txn.category}
                {txn.date && (
                  <span style={{ marginLeft: "8px", color: COLORS.textMuted }}>
                    {new Date(txn.date).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color,
              }}
            >
              {isIncome ? "+" : "-"}
              {fmt(txn.amount)}
            </div>
            <button
              style={{
                background: "none",
                border: "none",
                color: isHovered ? COLORS.red : COLORS.textMuted,
                cursor: "pointer",
                padding: "4px 6px",
                fontSize: "16px",
                lineHeight: 1,
                fontFamily: "inherit",
                transition: "color 0.15s",
              }}
              onClick={() => onDelete(txn.id)}
              title="Delete"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}