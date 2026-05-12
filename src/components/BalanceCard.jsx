import { COLORS } from "../styles/colors";

export default function BalanceCard({ balance, transactions }) {
  const balanceColor =
    balance > 0 ? COLORS.green : balance < 0 ? COLORS.red : COLORS.textPrimary;

  function fmt(n) {
    return (
      "₦" +
      Math.abs(n).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "12px",
        position: "relative",
        overflow: "hidden",
        boxShadow: COLORS.shadowSm,
      }}
    >
      {/* green glow blob */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "200px",
          height: "200px",
          background: COLORS.blueSoft,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontSize: "11px",
          color: COLORS.textSecondary,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "8px",
          fontWeight: 600,
        }}
      >
        Total balance
      </div>

      <div
        style={{
          fontSize: "48px",
          fontWeight: "700",
          letterSpacing: "-2px",
          lineHeight: "1",
          marginBottom: "6px",
          color: balanceColor,
        }}
      >
        {fmt(balance)}
      </div>

      <div style={{ fontSize: "12px", color: COLORS.textMuted }}>
        {transactions.length === 0
          ? "No transactions yet"
          : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} recorded`}
      </div>
    </div>
  );
}