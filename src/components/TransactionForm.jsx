import { useState } from "react";
import { COLORS } from "../styles/colors";

const inputStyle = {
  height: "40px",
  background: COLORS.bg,
  border: `1px solid ${COLORS.borderAccent}`,
  borderRadius: "8px",
  padding: "0 12px",
  fontSize: "13px",
  fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  color: COLORS.textPrimary,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function TransactionForm({ onAdd }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(false);

  function handleAdd() {
    const success = onAdd({ amount, type, category });
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 1200);
      return;
    }
    setAmount("");
    setCategory("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleAdd();
  }

  function focusStyle(e) {
    e.target.style.borderColor = COLORS.green;
    e.target.style.boxShadow = `0 0 0 2px ${COLORS.greenGlow}`;
  }

  function blurStyle(e) {
    e.target.style.borderColor = COLORS.borderAccent;
    e.target.style.boxShadow = "none";
  }

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "10px",
              color: COLORS.textSecondary,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Amount (₦)
          </label>
          <input
            style={{
              ...inputStyle,
              borderColor: error ? COLORS.red : COLORS.borderAccent,
              boxShadow: error ? `0 0 0 2px rgba(239,68,68,0.2)` : "none",
            }}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "10px",
              color: COLORS.textSecondary,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Type
          </label>
          <select
            style={inputStyle}
            value={type}
            onChange={(e) => setType(e.target.value)}
            onFocus={focusStyle}
            onBlur={blurStyle}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          style={{
            fontSize: "10px",
            color: COLORS.textSecondary,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Category
        </label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Salary, Food, Rent…"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={focusStyle}
          onBlur={blurStyle}
        />
      </div>

      <button
        style={{
          height: "42px",
          background: COLORS.green,
          color: "#000",
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "700",
          fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
          letterSpacing: "0.05em",
          cursor: "pointer",
        }}
        onClick={handleAdd}
        onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.greenDark)}
        onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.green)}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        + ADD TRANSACTION
      </button>
    </div>
  );
}