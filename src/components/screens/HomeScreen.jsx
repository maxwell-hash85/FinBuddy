import { useMemo } from "react";
import { useTheme } from "../../context/useTheme";
import { useTransactions } from "../../hooks/useTransactions";
import { calcTotals, fmt } from "../../utils/calcFinance";
import { getPrimaryProactiveInsight } from "../../utils/proactiveInsights";
import { getFirstName, loadProfile } from "../../utils/profile";
import { formatTxnDate, txnIcon } from "../../utils/transactionDisplay";

const GREEN = "#2bc62c";
const RED = "#ef4444";
const ICON_BTN_BG = "#161616";
const ICON_BTN_BORDER = "#1e1e1e";

function highlightInsightFigures(text) {
  const parts = text.split(/(₦[\d,]+\.?\d*|\d+%)/g);
  return parts.map((part, i) => {
    if (/^(₦[\d,]+\.?\d*|\d+%)$/.test(part)) {
      return (
        <span key={i} style={{ color: GREEN, fontWeight: 600 }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

function formatHeaderDate(date = new Date()) {
  const day = date.toLocaleDateString("en-NG", { weekday: "long" }).toUpperCase();
  const rest = date
    .toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
  return `${day} · ${rest}`;
}

function timeAwareGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Hey";
  return "Good evening";
}

function IconButton({ icon, label, onClick, badge }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "38px",
        height: "38px",
        borderRadius: "12px",
        border: `1px solid ${ICON_BTN_BORDER}`,
        background: ICON_BTN_BG,
        color: "#a1a1aa",
        cursor: "pointer",
        fontFamily: "inherit",
        flexShrink: 0,
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: "18px" }} />
      {badge && (
        <span
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: GREEN,
            border: `2px solid ${ICON_BTN_BG}`,
          }}
        />
      )}
    </button>
  );
}

export default function HomeScreen({ userName, onOpenSettings }) {
  const { colors: COLORS } = useTheme();
  const { transactions } = useTransactions();

  const firstName = useMemo(() => {
    if (userName) return getFirstName(userName);
    return getFirstName(loadProfile().name);
  }, [userName]);

  const headerDate = useMemo(() => formatHeaderDate(), []);
  const greeting = useMemo(() => timeAwareGreeting(), []);

  const { income, expense, balance } = useMemo(
    () => calcTotals(transactions),
    [transactions],
  );

  const recentTransactions = useMemo(() => transactions.slice(0, 3), [transactions]);

  const insightText = useMemo(
    () => getPrimaryProactiveInsight(transactions),
    [transactions],
  );

  const card = {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "4px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: COLORS.textMuted,
              marginBottom: "6px",
            }}
          >
            {headerDate}
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.25,
            }}
          >
            {greeting}, {firstName} 👋
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexShrink: 0, paddingTop: "2px" }}>
          <IconButton icon="ti-bell" label="Notifications" badge />
          <IconButton icon="ti-settings" label="Settings" onClick={onOpenSettings} />
        </div>
      </header>

      {/* Balance hero */}
      <div style={{ ...card, padding: "1.5rem" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COLORS.textSecondary,
            marginBottom: "8px",
          }}
        >
          Total Balance
        </div>
        <div
          style={{
            fontSize: "44px",
            fontWeight: 700,
            color: GREEN,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "8px",
          }}
        >
          {fmt(balance)}
        </div>
        <div style={{ fontSize: "13px", color: COLORS.textMuted }}>
          {transactions.length === 0
            ? "No transactions yet"
            : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Income / Expenses grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        <div style={{ ...card, padding: "1rem 1.1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: GREEN,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COLORS.textSecondary,
              }}
            >
              Income
            </span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: GREEN }}>{fmt(income)}</div>
        </div>

        <div style={{ ...card, padding: "1rem 1.1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: RED,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COLORS.textSecondary,
              }}
            >
              Expenses
            </span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: RED }}>{fmt(expense)}</div>
        </div>
      </div>

      {/* Buddy Insight */}
      <div
        style={{
          ...card,
          padding: "1.15rem 1.25rem",
          borderLeft: `3px solid ${GREEN}`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: GREEN,
            background: "rgba(43, 198, 44, 0.1)",
            borderRadius: "6px",
            padding: "4px 8px",
            marginBottom: "10px",
          }}
        >
          Buddy Insight
        </div>
        <p
          style={{
            fontSize: "13px",
            color: COLORS.textSecondary,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {highlightInsightFigures(insightText)}
        </p>
      </div>

      {/* Recent transactions */}
      <div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: COLORS.textPrimary,
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}
        >
          Recent
        </div>

        {recentTransactions.length === 0 ? (
          <div
            style={{
              ...card,
              padding: "2rem 1.25rem",
              textAlign: "center",
              fontSize: "13px",
              color: COLORS.textMuted,
            }}
          >
            No recent activity — add a transaction to get started.
          </div>
        ) : (
          <div style={{ ...card, overflow: "hidden" }}>
            {recentTransactions.map((txn, i) => {
              const isIncome = txn.type === "income";
              const amountColor = isIncome ? GREEN : RED;
              const isLast = i === recentTransactions.length - 1;

              return (
                <div
                  key={txn.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 1rem",
                    borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: COLORS.bg,
                      border: `1px solid ${COLORS.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: amountColor,
                    }}
                  >
                    <i className={`ti ${txnIcon(txn)}`} style={{ fontSize: "18px" }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: COLORS.textPrimary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {txn.category}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: COLORS.textMuted,
                        marginTop: "2px",
                      }}
                    >
                      {txn.category}
                      {txn.date && (
                        <>
                          {" · "}
                          {formatTxnDate(txn.date)}
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: amountColor,
                      flexShrink: 0,
                    }}
                  >
                    {isIncome ? "+" : "−"}
                    {fmt(txn.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
