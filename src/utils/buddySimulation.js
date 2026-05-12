import { fmt } from "./calcFinance";

/**
 * Rule-based “AI” replies using live props — friendly financial buddy tone.
 * Returns null to allow optional fallback to server API.
 */
export function simulateBuddyReply(userText, props) {
  const {
    balance = 0,
    savingsRate = 0,
    transactions = [],
    topCategory = null,
    spendingBreakdown = [],
    income = 0,
    expense = 0,
  } = props;

  const text = (userText || "").trim();
  const t = text.toLowerCase();

  if (!text) {
    return "Ask me anything — spending, savings, or whether a purchase fits your numbers.";
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(t)) {
    return `Hey — I’ve got you at ${fmt(balance)} with a ${savingsRate}% savings rate on logged income. ${topCategory ? `Your top spend bucket is ${topCategory}.` : "Log a few expenses and I’ll pinpoint where cash goes."}`;
  }

  if (/spend|spent|spending|expense|where.*money|cost|leak|category/.test(t)) {
    if (!transactions.length) {
      return "Once you add transactions, I’ll break down spending by category. Try logging last week’s expenses.";
    }
    const top3 = spendingBreakdown.slice(0, 3).map((x) => `${x.name} (${x.percent}%)`).join(", ");
    return `You’ve spent ${fmt(expense)} so far. ${topCategory ? `Largest category: ${topCategory}.` : ""} Split looks like: ${top3 || "keep logging for detail."} Want a simple cap on one category this week?`;
  }

  if (/save|savings|save more|put away/.test(t)) {
    if (income <= 0) {
      return "Log some income entries — then I can coach savings as a % of what you actually earn.";
    }
    return `Your savings rate is ${savingsRate}% (${fmt(balance)} net). Rule of thumb: automate one small transfer on payday — even 5% locks in progress while you tune habits.`;
  }

  if (/buy|afford|purchase|worth it|should i|can i get|iphone|laptop|car|bag|shoes/.test(t)) {
    if (balance <= 0 && expense > income) {
      return `Right now expenses edge past income — I’d pause optional buys until you’re net positive again. When balance is green, we’ll size the purchase vs your goals.`;
    }
    if (balance > 0) {
      return `You’re ${fmt(balance)} ahead overall. For any purchase, try the 48-hour rule: if it still feels essential after two sleeps and won’t blow your top category, it’s usually fair game.`;
    }
    return `Log income + expenses so I can say whether a purchase fits — I’ll weigh it against your balance and savings rate.`;
  }

  if (/budget|plan|goal|debt/.test(t)) {
    return `${topCategory ? `Your biggest lever is probably ${topCategory}.` : "Pick one category to cap."} Keep the rule stupid-simple (e.g. max ₦X/day) so you don’t have to think twice.`;
  }

  if (/balance|how much|left|net/.test(t)) {
    return `Net position: ${fmt(balance)} (income ${fmt(income)} vs expenses ${fmt(expense)}).`;
  }

  if (/thank|thanks|ty\b/.test(t)) {
    return "Anytime — that’s what I’m here for. Tap me when you’re about to spend and we’ll sanity-check it.";
  }

  return `Quick snapshot: balance ${fmt(balance)}, savings rate ${savingsRate}%. ${topCategory ? `Top category: ${topCategory}.` : ""} Ask about spending, saving, or a purchase you’re weighing.`;
}
