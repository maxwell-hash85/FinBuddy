import { useMemo } from "react";
import { COLORS } from "./styles/colors";
import { calcTotals } from "./utils/calcFinance";
import { buildBuddyContext } from "./utils/buildBuddyContext";
import { useTransactions } from "./hooks/useTransactions";
import BalanceCard from "./components/BalanceCard";
import Stats from "./components/Stats";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import Insights from "./components/Insights";
import FinBuddyInsightCard from "./components/FinBuddyInsightCard";
import BuddyChat from "./components/BuddyChat";

const fontStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const section = {
  marginBottom: "2.25rem",
};

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

export default function FinBuddy() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { income, expense, balance, savingsRate } = useMemo(
    () => calcTotals(transactions),
    [transactions]
  );
  const buddyContext = useMemo(() => buildBuddyContext(transactions), [transactions]);

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
              Fin<span style={{ color: COLORS.blue }}>Buddy</span>
            </div>
            <div style={{ fontSize: "13px", color: COLORS.textSecondary, marginTop: "6px" }}>
              Smarter daily money decisions
            </div>
          </div>
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
        </header>

        <section style={section} aria-labelledby="summary-heading">
          <h2 id="summary-heading" style={sectionTitle}>
            Dashboard
          </h2>
          <p style={sectionHint}>Your balance and cash-flow snapshot at a glance.</p>
          <BalanceCard balance={balance} transactions={transactions} />
          <Stats income={income} expense={expense} />
        </section>

        <section style={section} aria-labelledby="insights-heading">
          <h2 id="insights-heading" style={sectionTitle}>
            Insights
          </h2>
          <p style={sectionHint}>Patterns, budgets, and where your money went.</p>
          <FinBuddyInsightCard context={buddyContext} />
          <Insights transactions={transactions} balance={balance} savingsRate={savingsRate} />
        </section>

        <section style={section} aria-labelledby="tx-heading">
          <h2 id="tx-heading" style={sectionTitle}>
            Transactions
          </h2>
          <p style={sectionHint}>Log income and expenses — FinBuddy uses this for advice.</p>
          <TransactionForm onAdd={addTransaction} />
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        </section>

        <section style={{ ...section, marginBottom: 0 }} aria-labelledby="chat-heading">
          <h2 id="chat-heading" style={sectionTitle}>
            FinBuddy chat
          </h2>
          <p style={sectionHint}>
            Ask what to do next — answers use your live numbers from this session.
          </p>
          <BuddyChat context={buddyContext} />
        </section>
      </div>
    </div>
  );
}
