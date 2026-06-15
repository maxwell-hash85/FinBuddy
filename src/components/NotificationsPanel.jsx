import { useTheme } from "../context/useTheme";
import { useNotifications } from "../hooks/useNotifications";

const GREEN = "#2bc62c";

export default function NotificationsPanel({ onClose }) {
  const { colors: COLORS } = useTheme();
  const { notifications, markAllRead, markRead, isRead } = useNotifications();

  function handleOpen(id) {
    markRead(id);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        zIndex: 200,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(100%, 400px)",
          height: "100%",
          background: COLORS.bg,
          borderLeft: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: 600 }}>Notifications</span>
          <div style={{ display: "flex", gap: "8px" }}>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: GREEN,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                color: COLORS.textMuted,
                fontSize: "22px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {notifications.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontSize: "14px", textAlign: "center", padding: "2rem" }}>
              No notifications — enable them in Profile settings.
            </p>
          ) : (
            notifications.map((n) => {
              const read = isRead(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleOpen(n.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: read ? COLORS.surface : "rgba(43, 198, 44, 0.08)",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "8px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "inherit",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    {!read && (
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: GREEN,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span style={{ fontSize: "13px", fontWeight: 600, color: COLORS.textPrimary }}>
                      {n.title}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: COLORS.textSecondary, lineHeight: 1.5, margin: 0 }}>
                    {n.body}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
