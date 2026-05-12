import { COLORS } from "../styles/colors";
import { fmt, getTopCategory, getSpendingByCategory } from "../utils/calcFinance";

function Message({ transactions, balance, savingsRate, topCat }) {
  if (!transactions || transactions.length === 0) {
    return (
      <>
        <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>
          Your financial insights will appear here.
        </span>
        <br />
        Add transactions and FinBuddy will surface smart summaries about your
        spending patterns.
      </>
    );
  }

  const incomeTx = transactions.filter((t) => t.type === "income");
  const expenseTx = transactions.filter((t) => t.type === "expense");
  const totalExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
  const avgIncome = incomeTx.length > 0 ? totalIncome / incomeTx.length : 0;

  if (incomeTx.length > 0 && totalExpenses > avgIncome) {
    return (
      <>
        <span style={{ color: COLORS.red, fontWeight: 700 }}>
          Caution: spending is outpacing your typical income.
        </span>
        <br />
        Your total expenses are <span style={{ color: COLORS.red, fontWeight: 700 }}>{fmt(totalExpenses)}</span>,
        which is higher than your average income of{" "}
        <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>{fmt(avgIncome)}</span>.
        {topCat && (
          <>
            {" "}Consider cutting back on <span style={{ color: COLORS.red }}>{topCat}</span>.
          </>
        )}
      </>
    );
  }

  if (balance > 0) {
    return (
      <>
        <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>
          You&apos;re in good shape.
        </span>
        <br />
        Saved{" "}
        <span style={{ color: COLORS.green, fontWeight: 700 }}>{fmt(balance)}</span>{" "}
        with a savings rate of{" "}
        <span style={{ color: COLORS.green, fontWeight: 700 }}>{savingsRate}%</span>.
        {topCat && (
          <>
            {" "}Top spend category:{" "}
            <span style={{ color: COLORS.green }}>{topCat}</span>.
          </>
        )}
      </>
    );
  }

  if (balance === 0 && transactions.length > 0) {
    return (
      <>
        <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>
          Breaking even.
        </span>
        <br />
        Income and expenses are perfectly equal.
        {topCat && (
          <>
            {" "}Watch your{" "}
            <span style={{ color: COLORS.green }}>{topCat}</span> spending.
          </>
        )}
      </>
    );
  }

  return (
    <>
      <span style={{ color: COLORS.red, fontWeight: 700 }}>
        Expenses exceed income.
      </span>
      <br />
      You&apos;re{" "}
      <span style={{ color: COLORS.red, fontWeight: 700 }}>
        {fmt(Math.abs(balance))}
      </span>{" "}
      over budget.
      {topCat && (
        <>
          {" "}Cut back on{" "}
          <span style={{ color: COLORS.red }}>{topCat}</span>.
        </>
      )}
    </>
  );
}

export default function Insights({ transactions, balance, savingsRate }) {
  const topCat = getTopCategory(transactions);
  const breakdown = getSpendingByCategory(transactions);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Main insight */}
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: COLORS.blue,
            marginTop: "6px",
            flexShrink: 0,
            boxShadow: `0 0 12px ${COLORS.blueSoft}`,
          }}
        />
        <div
          style={{
            fontSize: "13px",
            color: COLORS.textSecondary,
            lineHeight: "1.7",
          }}
        >
          <Message
            transactions={transactions}
            balance={balance}
            savingsRate={savingsRate}
            topCat={topCat}
          />
        </div>
      </div>

      {/* Category breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: COLORS.textSecondary,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Spending breakdown
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {breakdown.map((cat) => (
              <div key={cat.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: "12px", color: COLORS.textPrimary, fontWeight: 700 }}>
                    {cat.percent}% &mdash; {fmt(cat.amount)}
                  </span>
                </div>
                <div
                  style={{
                    height: "3px",
                    background: COLORS.border,
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${cat.percent}%`,
                      background: COLORS.blue,
                      borderRadius: "2px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}