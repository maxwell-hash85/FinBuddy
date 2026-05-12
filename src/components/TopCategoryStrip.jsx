import { useTheme } from "../context/useTheme";
import { fmt } from "../utils/calcFinance";

export default function TopCategoryStrip({ topCategory, topCategoryAmount, topCategoryPercent }) {
  const { colors: COLORS } = useTheme();

  if (!topCategory) {
    return (
      <div
        style={{
          padding: "12px 14px",
          borderRadius: "12px",
          border: `1px dashed ${COLORS.border}`,
          background: COLORS.surfaceHover,
          color: COLORS.textSecondary,
          fontSize: "13px",
          marginBottom: "12px",
        }}
      >
        Top spending category will appear once you log expenses.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        padding: "14px 16px",
        borderRadius: "14px",
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
        boxShadow: COLORS.shadowSm,
        marginBottom: "12px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: COLORS.textSecondary,
            marginBottom: "4px",
            fontWeight: 600,
          }}
        >
          Top spending category
        </div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: COLORS.textPrimary }}>{topCategory}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: COLORS.green }}>{fmt(topCategoryAmount)}</div>
        {typeof topCategoryPercent === "number" && (
          <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>{topCategoryPercent}% of expenses</div>
        )}
      </div>
    </div>
  );
}
