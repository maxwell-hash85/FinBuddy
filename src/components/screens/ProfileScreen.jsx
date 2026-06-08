import { useEffect, useState } from "react";
import { useTheme } from "../../context/useTheme";
import { useTransactions } from "../../hooks/useTransactions";
import { loadProfile, PROFILE_KEY } from "../../utils/profile";

const GREEN = "#2bc62c";
const RED = "#ef4444";
const ROW_BG = "#161616";
const AVATAR_BG = "#1a2a1a";

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function SettingGroup({ title, children }) {
  const { colors: COLORS } = useTheme();

  return (
    <section style={{ marginBottom: "24px" }}>
      <h2
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: COLORS.textMuted,
          marginBottom: "8px",
          paddingLeft: "4px",
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onClick,
  danger,
  toggle,
  toggleOn,
  onToggle,
  isFirst,
  isLast,
}) {
  const { colors: COLORS } = useTheme();

  let borderRadius = "0";
  if (isFirst && isLast) borderRadius = "12px";
  else if (isFirst) borderRadius = "12px 12px 0 0";
  else if (isLast) borderRadius = "0 0 12px 12px";

  const content = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        {icon && (
          <i
            className={`ti ${icon}`}
            style={{ fontSize: "18px", color: danger ? RED : COLORS.textSecondary, flexShrink: 0 }}
          />
        )}
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: danger ? RED : COLORS.textPrimary,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {value && (
          <span style={{ fontSize: "13px", color: COLORS.textMuted }}>{value}</span>
        )}
        {toggle ? (
          <button
            type="button"
            role="switch"
            aria-checked={toggleOn}
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            style={{
              width: "44px",
              height: "26px",
              borderRadius: "999px",
              border: "none",
              background: toggleOn ? GREEN : COLORS.borderAccent,
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s ease",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: toggleOn ? "21px" : "3px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#ffffff",
                transition: "left 0.2s ease",
              }}
            />
          </button>
        ) : (
          !danger && <i className="ti ti-chevron-right" style={{ fontSize: "18px", color: COLORS.textMuted }} />
        )}
      </div>
    </>
  );

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 16px",
    background: ROW_BG,
    borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`,
    borderRadius,
    width: "100%",
    fontFamily: "inherit",
    textAlign: "left",
    cursor: onClick || toggle ? "pointer" : "default",
    border: "none",
    color: "inherit",
  };

  if (onClick && !toggle) {
    return (
      <button type="button" onClick={onClick} style={rowStyle}>
        {content}
      </button>
    );
  }

  return <div style={rowStyle}>{content}</div>;
}

export default function ProfileScreen() {
  const { mode, toggleTheme, colors: COLORS } = useTheme();
  const { transactions } = useTransactions();

  const [profile, setProfile] = useState(loadProfile);
  const [notifications, setNotifications] = useState(() => {
    try {
      return localStorage.getItem("finbuddy_notifications") === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem("finbuddy_notifications", String(notifications));
    } catch {
      /* ignore */
    }
  }, [notifications]);

  function editProfile() {
    const name = window.prompt("Your name", profile.name);
    if (name === null) return;
    const email = window.prompt("Your email", profile.email);
    if (email === null) return;
    setProfile({
      name: name.trim() || profile.name,
      email: email.trim() || profile.email,
    });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ profile, transactions }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finbuddy-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function signOut() {
    if (window.confirm("Sign out of FinBuddy?")) {
      window.alert("Signed out (demo — no auth backend yet).");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Profile header */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 0 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: AVATAR_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: 700,
            color: GREEN,
            marginBottom: "12px",
          }}
        >
          {getInitials(profile.name)}
        </div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: COLORS.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          {profile.name}
        </div>
        <div style={{ fontSize: "14px", color: COLORS.textMuted, marginTop: "4px" }}>
          {profile.email}
        </div>
      </header>

      <SettingGroup title="Data">
        <SettingRow
          icon="ti-upload"
          label="Upload bank statement"
          onClick={() => window.alert("Bank statement upload coming soon.")}
          isFirst
        />
        <SettingRow
          icon="ti-mail"
          label="Connect email alerts"
          onClick={() => window.alert("Email alerts coming soon.")}
        />
        <SettingRow
          icon="ti-download"
          label="Export my data"
          onClick={exportData}
          isLast
        />
      </SettingGroup>

      <SettingGroup title="Preferences">
        <SettingRow
          icon="ti-moon"
          label="Dark mode"
          toggle
          toggleOn={mode === "dark"}
          onToggle={toggleTheme}
          isFirst
        />
        <SettingRow
          icon="ti-bell"
          label="Notifications"
          toggle
          toggleOn={notifications}
          onToggle={() => setNotifications((n) => !n)}
        />
        <SettingRow icon="ti-currency-naira" label="Currency" value="NGN ₦" isLast />
      </SettingGroup>

      <SettingGroup title="Account">
        <SettingRow icon="ti-user-edit" label="Edit profile" onClick={editProfile} isFirst />
        <SettingRow icon="ti-logout" label="Sign out" onClick={signOut} danger isLast />
      </SettingGroup>
    </div>
  );
}
