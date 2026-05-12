export function calcTotals(transactions) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  return { income, expense, balance, savingsRate };
}

export function getTopCategory(transactions) {
  const cats = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });

  if (Object.keys(cats).length === 0) return null;
  return Object.entries(cats).sort((a, b) => b[1] - a[1])[0][0];
}

export function getSpendingByCategory(transactions) {
  const cats = {};
  const total = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });

  return Object.entries(cats).map(([name, amount]) => ({
    name,
    amount,
    percent: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));
}

export function fmt(n) {
  return (
    "₦" +
    Math.abs(n).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfWeekMonday(d) {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(d.getDate() - diff);
  return x;
}

export function parseTxnDate(t) {
  if (!t?.date) return null;
  const x = new Date(t.date);
  return Number.isNaN(x.getTime()) ? null : x;
}

export function filterTransactionsInMonth(transactions, refDate = new Date()) {
  const start = startOfMonth(refDate);
  const next = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);
  return transactions.filter((t) => {
    const d = parseTxnDate(t);
    if (!d) return false;
    return d >= start && d < next;
  });
}

export function calcTotalsForTransactions(transactions) {
  return calcTotals(transactions);
}

/** Sum expenses per category for transactions (typically month-filtered). */
export function sumExpenseByCategory(transactions) {
  const cats = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const c = t.category?.trim() || "General";
      cats[c] = (cats[c] || 0) + t.amount;
    });
  return cats;
}

/**
 * Compare expense totals for this calendar week vs previous week (Mon–Sun).
 */
export function compareWeekOverWeekExpenses(transactions, refDate = new Date()) {
  const thisWeekStart = startOfWeekMonday(refDate);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);

  function sumExpensesInRange(start, end) {
    return transactions
      .filter((t) => t.type === "expense")
      .filter((t) => {
        const d = parseTxnDate(t);
        if (!d) return false;
        return d >= start && d < end;
      })
      .reduce((a, t) => a + t.amount, 0);
  }

  const thisWeek = sumExpensesInRange(thisWeekStart, new Date(thisWeekStart.getTime() + 7 * 86400000));
  const lastWeek = sumExpensesInRange(lastWeekStart, lastWeekEnd);

  let pctChange = null;
  if (lastWeek > 0) pctChange = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  else if (thisWeek > 0 && lastWeek === 0) pctChange = 100;

  let direction = "flat";
  if (thisWeek > lastWeek * 1.05) direction = "up";
  else if (thisWeek < lastWeek * 0.95) direction = "down";

  return {
    thisWeekExpenses: thisWeek,
    lastWeekExpenses: lastWeek,
    pctChange,
    direction,
    weekLabel: thisWeekStart.toISOString().slice(0, 10),
  };
}