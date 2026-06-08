import { useTheme } from "../context/useTheme";

export default function Modal({ title, onClose, children }) {
  const { colors: COLORS } = useTheme();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 200,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "16px 16px 0 0",
          padding: "1.25rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: 600, color: COLORS.textPrimary }}>
            {title}
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: COLORS.textMuted,
              cursor: "pointer",
              fontSize: "24px",
              lineHeight: 1,
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
