import {
  compareWeekOverWeekExpenses,
  fmt,
  parseTxnDate,
  calcTotals,
} from "./calcFinance";

function startOfWeekMonday(d) {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(d.getDate() - diff);
  return x;
}

function sumCategoryExpensesInRange(transactions, start, end, matchFn) {
  return transactions
    .filter((t) => t.type === "expense")
    .filter((t) => {
      const d = parseTxnDate(t);
      if (!d) return false;
      return d >= start && d < end && matchFn(t.category || "");
    })
    .reduce((a, t) => a + t.amount, 0);
}

function matchFood(cat) {
  const c = (cat || "").toLowerCase();
  return c.includes("food") || c.includes("grocer") || c.includes("meal") || c === "eat";
}

function matchEntertainment(cat) {
  const c = (cat || "").toLowerCase();
  return c.includes("entertain") || c.includes("fun") || c === "movies";
}

/** Savings-style ratio for a window: (income - expense) / income when income > 0 */
function savingsRatioForWindow(transactions, start, end) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    const d = parseTxnDate(t);
    if (!d || d < start || d >= end) continue;
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expense += t.amount;
  }
  if (income <= 0) return null;
  return Math.round(((income - expense) / income) * 100);
}

/**
 * One-line proactive insight for the dashboard card (local-only, from transactions).
 */
export function getPrimaryProactiveInsight(transactions, refDate = new Date()) {
  if (!transactions?.length) {
    return "Add income and expenses — I’ll surface patterns like category spikes and savings momentum.";
  }

  const thisWeekStart = startOfWeekMonday(refDate);
  const nextWeek = new Date(thisWeekStart.getTime() + 7 * 86400000);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const foodThis = sumCategoryExpensesInRange(transactions, thisWeekStart, nextWeek, matchFood);
  const foodLast = sumCategoryExpensesInRange(transactions, lastWeekStart, thisWeekStart, matchFood);

  if (foodLast > 0 && foodThis > foodLast * 1.08) {
    const pct = Math.round(((foodThis - foodLast) / foodLast) * 100);
    return `You spent more on food this week than usual (${pct}% higher than last week). Try meal-planning or a ₦ cap for a few days.`;
  }

  const ratioThis = savingsRatioForWindow(transactions, thisWeekStart, nextWeek);
  const ratioLast = savingsRatioForWindow(transactions, lastWeekStart, thisWeekStart);

  if (
    ratioThis !== null &&
    ratioLast !== null &&
    ratioLast > 0 &&
    ratioThis < ratioLast - 3
  ) {
    return `Your savings rate dipped compared to last week (${ratioThis}% vs ${ratioLast}%). Pausing one discretionary category usually fixes it.`;
  }

  const trend = compareWeekOverWeekExpenses(transactions, refDate);
  if (trend.direction === "up" && typeof trend.pctChange === "number" && trend.pctChange >= 12) {
    return `Overall spending is up ${trend.pctChange}% vs last week — pick one category to trim until Sunday.`;
  }

  const totals = calcTotals(transactions);
  const entTotal = transactions
    .filter((t) => t.type === "expense")
    .filter((t) => matchEntertainment(t.category))
    .reduce((a, t) => a + t.amount, 0);

  if (totals.expense > 0 && entTotal / totals.expense >= 0.2 && entTotal >= 5000) {
    return `Reducing entertainment by ${fmt(5000)} this week keeps your goals closer without feeling drastic.`;
  }

  if (totals.balance > 0 && totals.income > 0) {
    return `You’re net positive by ${fmt(totals.balance)} with a ${totals.savingsRate}% savings rate — solid baseline to protect.`;
  }

  return "Review your top category each Sunday — small weekly tweaks beat one big budget overhaul.";
}
