import { calcTotals, getTopCategory } from "./calcFinance";
import { getPrimaryProactiveInsight } from "./proactiveInsights";

export function buildNotifications(transactions) {
  const items = [];
  const { balance, income, expense, savingsRate } = calcTotals(transactions);
  const topCategory = getTopCategory(transactions);
  const now = Date.now();

  if (transactions.length === 0) {
    items.push({
      id: "onboard",
      title: "Get started",
      body: "Add your first transaction so Buddy can track spending and give you insights.",
      at: now,
    });
    return items;
  }

  items.push({
    id: `insight-${now}`,
    title: "Buddy Insight",
    body: getPrimaryProactiveInsight(transactions),
    at: now,
  });

  if (balance < 0) {
    items.push({
      id: "negative-balance",
      title: "Spending alert",
      body: `Your expenses exceed income by ₦${Math.abs(balance).toLocaleString("en-NG")}. Review recent spending.`,
      at: now,
    });
  } else if (savingsRate >= 20) {
    items.push({
      id: "savings-win",
      title: "Savings milestone",
      body: `You're saving ${savingsRate}% of income — keep it up!`,
      at: now,
    });
  }

  if (topCategory) {
    items.push({
      id: `top-cat-${topCategory}`,
      title: "Top category",
      body: `${topCategory} is your biggest expense category this period.`,
      at: now,
    });
  }

  if (income > 0 && expense > income * 0.9) {
    items.push({
      id: "budget-pressure",
      title: "Budget pressure",
      body: "You've used over 90% of logged income on expenses. Consider pausing discretionary buys.",
      at: now,
    });
  }

  return items;
}
