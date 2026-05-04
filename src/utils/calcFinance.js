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