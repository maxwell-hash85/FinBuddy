import { calcTotals, fmt, getTopCategory } from "./calcFinance";

/** Compact snapshot for Buddy's system prompt. */
export function buildTransactionsSummary(transactions) {
  const { income, expense, balance, savingsRate } = calcTotals(transactions);
  const topCategory = getTopCategory(transactions);

  const recent = transactions.slice(0, 12).map((t) => ({
    type: t.type,
    category: t.category?.trim() || "General",
    amount: t.amount,
    amountFormatted: fmt(t.amount),
    date: t.date || null,
  }));

  return JSON.stringify(
    {
      currency: "NGN",
      totalIncome: income,
      totalIncomeFormatted: fmt(income),
      totalExpenses: expense,
      totalExpensesFormatted: fmt(expense),
      balance,
      balanceFormatted: fmt(balance),
      savingsRatePercent: savingsRate,
      transactionCount: transactions.length,
      topSpendingCategory: topCategory,
      recentTransactions: recent,
    },
    null,
    0,
  );
}
