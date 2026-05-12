import { COLORS } from "../styles/colors";
import { fmt } from "../utils/calcFinance";

export default function Stats({ income, expense }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          padding: "1.25rem",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxShadow: COLORS.shadowSm,
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: COLORS.textSecondary,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: COLORS.green,
            }}
          />
          Income
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            color: COLORS.green,
          }}
        >
          {fmt(income)}
        </div>
      </div>

      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          padding: "1.25rem",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxShadow: COLORS.shadowSm,
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: COLORS.textSecondary,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: COLORS.red,
            }}
          />
          Expenses
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            color: COLORS.red,
          }}
        >
          {fmt(expense)}
        </div>
      </div>
    </div>
  );
}