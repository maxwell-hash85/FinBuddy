import { useMemo } from "react";
import { useTheme } from "./context/useTheme";
import { calcTotals, getTopCategory, getSpendingByCategory } from "./utils/calcFinance";
import { buildBuddyContext } from "./utils/buildBuddyContext";
import { useTransactions } from "./hooks/useTransactions";
import BalanceCard from "./components/BalanceCard";
import Stats from "./components/Stats";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import Insights from "./components/Insights";
import FinBuddyInsightCard from "./components/FinBuddyInsightCard";
import TopCategoryStrip from "./components/TopCategoryStrip";
import Charts from "./components/Charts";
import BuddyChat from "./components/BuddyChat";
import { IconMoon, IconSun } from "./components/icons";

const fontStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function greetingPrefix() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function FinBuddy() {
  const { mode, toggleTheme, colors: COLORS } = useTheme();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { income, expense, balance, savingsRate } = useMemo(
    () => calcTotals(transactions),
    [transactions]
  );
  const buddyContext = useMemo(() => buildBuddyContext(transactions), [transactions]);
  const spendingBreakdown = useMemo(() => getSpendingByCategory(transactions), [transactions]);
  const topCategory = useMemo(() => getTopCategory(transactions), [transactions]);
  const topBreakdownEntry = useMemo(
    () => spendingBreakdown.find((x) => x.name === topCategory),
    [spendingBreakdown, topCategory]
  );

  const sectionTitle = {
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    color: COLORS.textPrimary,
    marginBottom: "12px",
  };

  const sectionHint = {
    fontSize: "12px",
    color: COLORS.textSecondary,
    marginBottom: "14px",
    lineHeight: 1.45,
    maxWidth: "520px",
  };

  const section = {
    marginBottom: "2.25rem",
  };

  const greeting = greetingPrefix();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.textPrimary,
        fontFamily: fontStack,
        margin: 0,
        padding: 0,
        WebkitFontSmoothing: "antialiased",
        transition: "background 0.25s ease, color 0.2s ease",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.bg}; }
        input::placeholder { color: ${COLORS.textMuted}; }
        select option { background: ${COLORS.surface}; color: ${COLORS.textPrimary}; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "clamp(1.25rem, 4vw, 2rem) clamp(1rem, 4vw, 1.5rem) 3rem",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "2rem",
            paddingBottom: "1.25rem",
            borderBottom: `1px solid ${COLORS.border}`,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "clamp(22px, 5vw, 26px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              Fin<span style={{ color: COLORS.green }}>Buddy</span>
            </div>
            <div style={{ fontSize: "13px", color: COLORS.textSecondary, marginTop: "6px" }}>
              Your AI finance companion
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={mode === "dark" ? "Light theme" : "Dark theme"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "999px",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                color: COLORS.textPrimary,
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "inherit",
                boxShadow: COLORS.shadowSm,
                transition: "transform 0.08s ease, border-color 0.2s ease",
              }}
            >
              {mode === "dark" ? (
                <IconMoon size={16} color={COLORS.textSecondary} />
              ) : (
                <IconSun size={16} color={COLORS.amber} />
              )}
              <span>{mode === "dark" ? "Dark" : "Light"}</span>
            </button>
            <div
              style={{
                fontSize: "11px",
                color: COLORS.textSecondary,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "999px",
                padding: "6px 12px",
                letterSpacing: "0.06em",
                fontWeight: 600,
                boxShadow: COLORS.shadowSm,
              }}
            >
              MVP
            </div>
          </div>
        </header>

        {/* SECTION 1 — Overview */}
        <section style={section} aria-labelledby="overview-heading">
          <h2 id="overview-heading" style={sectionTitle}>
            Overview
          </h2>
          <p style={{ ...sectionHint, fontSize: "15px", fontWeight: 500, color: COLORS.textPrimary }}>
            {greeting} — here&apos;s your money snapshot.
          </p>
          <p style={sectionHint}>Balance and cash flow at a glance.</p>
          <BalanceCard balance={balance} transactions={transactions} />
          <Stats income={income} expense={expense} />
        </section>

        {/* SECTION 2 — Insights */}
        <section style={section} aria-labelledby="insights-heading">
          <h2 id="insights-heading" style={sectionTitle}>
            Insights
          </h2>
          <p style={sectionHint}>Patterns, alerts, and category breakdown.</p>
          <Insights transactions={transactions} balance={balance} savingsRate={savingsRate} />
          <TopCategoryStrip
            topCategory={topCategory}
            topCategoryAmount={topBreakdownEntry?.amount ?? 0}
            topCategoryPercent={topBreakdownEntry?.percent}
          />
          <FinBuddyInsightCard transactions={transactions} />
        </section>

        {/* SECTION 3 — Transactions */}
        <section style={section} aria-labelledby="tx-heading">
          <h2 id="tx-heading" style={sectionTitle}>
            Transactions
          </h2>
          <p style={sectionHint}>Log income and expenses — FinBuddy uses this for coaching.</p>
          <TransactionForm onAdd={addTransaction} />
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        </section>

        {/* SECTION 4 — Charts */}
        <section style={section} aria-labelledby="charts-heading">
          <h2 id="charts-heading" style={sectionTitle}>
            Charts
          </h2>
          <p style={sectionHint}>Visual split of where spending goes.</p>
          <Charts transactions={transactions} />
        </section>

        {/* SECTION 5 — FinBuddy chat */}
        <section style={{ ...section, marginBottom: 0 }} aria-labelledby="chat-heading">
          <h2 id="chat-heading" style={sectionTitle}>
            FinBuddy AI chat
          </h2>
          <p style={sectionHint}>
            Ask about spending, savings, or purchases — answers use your numbers on this page.
          </p>
          <BuddyChat
            balance={balance}
            savingsRate={savingsRate}
            transactions={transactions}
            topCategory={topCategory}
            spendingBreakdown={spendingBreakdown}
            income={income}
            expense={expense}
            context={buddyContext}
          />
        </section>
      </div>
    </div>
  );
}
