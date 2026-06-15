import { useRef, useState } from "react";
import { useTheme } from "../../context/useTheme";
import { useProfile } from "../../hooks/useProfile";
import { useTransactions } from "../../hooks/useTransactions";
import { parseBankStatementFile } from "../../utils/parseBankStatement";
import Modal from "../Modal";

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
  const {
    profile,
    currencyLabel,
    updateProfile,
    connectEmailAlerts,
    disconnectEmailAlerts,
    setNotificationsEnabled,
    signOut,
    currencies,
  } = useProfile();
  const { transactions, importTransactions } = useTransactions();

  const fileInputRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [editForm, setEditForm] = useState({ name: profile.name, email: profile.email });

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

  function handleBankUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseBankStatementFile(String(reader.result));
        const count = importTransactions(rows);
        setImportMessage(
          count > 0
            ? `Imported ${count} transaction${count !== 1 ? "s" : ""} from ${file.name}.`
            : "No valid transactions found in that file.",
        );
      } catch {
        setImportMessage("Could not parse that file. Use CSV or JSON with amount, type, and category.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  function saveProfile() {
    updateProfile({
      name: editForm.name.trim() || profile.name,
      email: editForm.email.trim() || profile.email,
    });
    setShowEditModal(false);
  }

  function handleSignOut() {
    if (window.confirm("Sign out? Your local data will be cleared.")) {
      signOut();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        style={{ display: "none" }}
        onChange={handleBankUpload}
      />

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

      {importMessage && (
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "12px 14px",
            fontSize: "13px",
            color: COLORS.textSecondary,
            marginBottom: "8px",
          }}
        >
          {importMessage}
        </div>
      )}

      <SettingGroup title="Data">
        <SettingRow
          icon="ti-upload"
          label="Upload bank statement"
          onClick={() => fileInputRef.current?.click()}
          isFirst
        />
        <SettingRow
          icon="ti-mail"
          label="Connect email alerts"
          value={profile.emailAlertsConnected ? "Connected" : "Off"}
          onClick={() => setShowEmailModal(true)}
        />
        <SettingRow icon="ti-download" label="Export my data" onClick={exportData} isLast />
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
          toggleOn={profile.notificationsEnabled}
          onToggle={() => setNotificationsEnabled(!profile.notificationsEnabled)}
        />
        <SettingRow
          icon="ti-currency-naira"
          label="Currency"
          value={currencyLabel}
          onClick={() => setShowCurrencyModal(true)}
          isLast
        />
      </SettingGroup>

      <SettingGroup title="Account">
        <SettingRow
          icon="ti-user-edit"
          label="Edit profile"
          onClick={() => {
            setEditForm({ name: profile.name, email: profile.email });
            setShowEditModal(true);
          }}
          isFirst
        />
        <SettingRow icon="ti-logout" label="Sign out" onClick={handleSignOut} danger isLast />
      </SettingGroup>

      {showEditModal && (
        <Modal title="Edit profile" onClose={() => setShowEditModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ fontSize: "12px", color: COLORS.textSecondary }}>Name</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                padding: "12px",
                color: COLORS.textPrimary,
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
            <label style={{ fontSize: "12px", color: COLORS.textSecondary }}>Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                padding: "12px",
                color: COLORS.textPrimary,
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
            <button
              type="button"
              onClick={saveProfile}
              style={{
                marginTop: "8px",
                height: "42px",
                background: GREEN,
                color: "#0d0d0d",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {showCurrencyModal && (
        <Modal title="Currency" onClose={() => setShowCurrencyModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Object.entries(currencies).map(([code, { label }]) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  updateProfile({ currency: code });
                  setShowCurrencyModal(false);
                }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px",
                  background: profile.currency === code ? "rgba(43,198,44,0.12)" : COLORS.surface,
                  border: `1px solid ${profile.currency === code ? GREEN : COLORS.border}`,
                  borderRadius: "10px",
                  color: COLORS.textPrimary,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }}
              >
                {label}
                {profile.currency === code && (
                  <i className="ti ti-check" style={{ color: GREEN }} />
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showEmailModal && (
        <Modal title="Email alerts" onClose={() => setShowEmailModal(false)}>
          <p style={{ fontSize: "14px", color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: "16px" }}>
            {profile.emailAlertsConnected
              ? `Alerts are connected to ${profile.email}. You'll receive spending summaries and budget warnings.`
              : `Connect ${profile.email} to receive spending alerts and weekly summaries.`}
          </p>
          <button
            type="button"
            onClick={() => {
              if (profile.emailAlertsConnected) {
                disconnectEmailAlerts();
              } else {
                connectEmailAlerts();
              }
              setShowEmailModal(false);
            }}
            style={{
              width: "100%",
              height: "42px",
              background: profile.emailAlertsConnected ? COLORS.surface : GREEN,
              color: profile.emailAlertsConnected ? COLORS.textPrimary : "#0d0d0d",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {profile.emailAlertsConnected ? "Disconnect" : "Connect email"}
          </button>
        </Modal>
      )}
    </div>
  );
}
