import { monthlyBudgetForCategory } from "../config/categoryBudgets";
import {
  calcTotals,
  compareWeekOverWeekExpenses,
  filterTransactionsInMonth,
  getTopCategory,
  getSpendingByCategory,
  sumExpenseByCategory,
} from "./calcFinance";

function readOptionalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Rich snapshot for AI + insights. Keeps numbers numeric (₦) for model reasoning.
 */
export function buildBuddyContext(transactions, refDate = new Date()) {
  const lifetime = calcTotals(transactions);
  const monthTx = filterTransactionsInMonth(transactions, refDate);
  const monthTotals = calcTotals(monthTx);
  const topCategory = getTopCategory(transactions);
  const spendingBreakdown = getSpendingByCategory(transactions);
  const monthExpenseByCat = sumExpenseByCategory(monthTx.filter((t) => t.type === "expense"));
  const weekTrend = compareWeekOverWeekExpenses(transactions, refDate);

  const categoryBudgetStatus = Object.entries(monthExpenseByCat).map(([category, spent]) => {
    const limit = monthlyBudgetForCategory(category);
    const remaining = Math.round((limit - spent) * 100) / 100;
    return {
      category,
      monthlyLimit: limit,
      spentThisMonth: spent,
      remainingThisMonth: remaining,
      percentUsed: limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0,
    };
  });

  categoryBudgetStatus.sort((a, b) => b.percentUsed - a.percentUsed);

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    })
    .slice(0, 12)
    .map((t) => ({
      type: t.type,
      category: t.category?.trim() || "General",
      amount: t.amount,
      date: t.date || null,
    }));

  const activeGoals = readOptionalJson("finbuddy_goals", []);
  const upcomingBills = readOptionalJson("finbuddy_bills", []);

  return {
    currency: "NGN",
    currencySymbol: "₦",
    asOf: refDate.toISOString(),
    totalsLifetime: {
      income: lifetime.income,
      expenses: lifetime.expense,
      balance: lifetime.balance,
      savingsRatePercent: lifetime.savingsRate,
    },
    currentMonth: {
      label: refDate.toLocaleString("en-NG", { month: "long", year: "numeric" }),
      income: monthTotals.income,
      expenses: monthTotals.expense,
      balance: monthTotals.balance,
      savingsRatePercent: monthTotals.savingsRate,
    },
    topSpendingCategory: topCategory,
    spendingBreakdownPct: spendingBreakdown.slice(0, 8),
    categoryBudgets: categoryBudgetStatus.slice(0, 12),
    recentTransactions,
    trends: {
      weekOverWeek: weekTrend,
    },
    activeGoals,
    upcomingBills,
  };
}
