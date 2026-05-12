import { useMemo } from "react";
import { COLORS } from "./styles/colors";
import { calcTotals, getTopCategory } from "./utils/calcFinance";
import { useTransactions } from "./hooks/useTransactions";
import BalanceCard from "./components/BalanceCard";
import Stats from "./components/Stats";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import Insights from "./components/Insights";
import BuddyChat from "./components/BuddyChat";

const sectionLabel = {
  fontSize: "11px",
  color: COLORS.textSecondary,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "10px",
};

export default function FinBuddy() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { income, expense, balance, savingsRate } = useMemo(
    () => calcTotals(transactions),
    [transactions]
  );
  const topCategory = useMemo(() => getTopCategory(transactions), [transactions]);
  const buddyContext = useMemo(
    () => ({
      balance,
      topCategory,
      monthlyExpenses: expense,
      savingsRate,
    }),
    [balance, topCategory, expense, savingsRate]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.textPrimary,
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        margin: 0,
        padding: 0,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        input::placeholder { color: #404040; font-family: 'IBM Plex Mono', monospace; }
        select option { background: #111; color: #f5f5f5; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            paddingBottom: "1.5rem",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.5px" }}
          >
            Fin<span style={{ color: COLORS.green }}>Buddy</span>
          </div>
          <div
            style={{
              fontSize: "11px",
              color: COLORS.textSecondary,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "4px",
              padding: "4px 10px",
              letterSpacing: "0.1em",
            }}
          >
            PERSONAL FINANCE
          </div>
        </div>

        <div style={sectionLabel}>// buddy chat</div>
        <BuddyChat context={buddyContext} />

        <BalanceCard balance={balance} transactions={transactions} />
        <Stats income={income} expense={expense} />

        <div style={sectionLabel}>// add transaction</div>
        <TransactionForm onAdd={addTransaction} />

        <div style={sectionLabel}>// transactions</div>
        <TransactionList transactions={transactions} onDelete={deleteTransaction} />

        <div style={sectionLabel}>// insights</div>
        <Insights
          transactions={transactions}
          income={income}
          expense={expense}
          balance={balance}
          savingsRate={savingsRate}
        />
      </div>
    </div>
  );
}