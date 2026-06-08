export function formatTxnDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function txnIcon(txn) {
  if (txn.type === "income") return "ti-cash";
  const c = (txn.category || "").toLowerCase();
  if (c.includes("food") || c.includes("grocer") || c.includes("meal")) return "ti-tools-kitchen-2";
  if (c.includes("transport") || c.includes("uber") || c.includes("fuel")) return "ti-car";
  if (c.includes("subscri") || c.includes("netflix") || c.includes("spotify")) return "ti-repeat";
  if (c.includes("rent") || c.includes("home") || c.includes("housing")) return "ti-home";
  if (c.includes("entertain") || c.includes("fun")) return "ti-movie";
  if (c.includes("shop") || c.includes("retail")) return "ti-shopping-bag";
  return "ti-receipt";
}

export function matchesFilterPill(txn, pill) {
  if (pill === "All") return true;
  if (pill === "Income") return txn.type === "income";
  const c = (txn.category || "").toLowerCase();
  if (pill === "Food") {
    return c.includes("food") || c.includes("grocer") || c.includes("meal") || c.includes("eat");
  }
  if (pill === "Transport") {
    return c.includes("transport") || c.includes("uber") || c.includes("fuel") || c.includes("car");
  }
  if (pill === "Subscriptions") {
    return (
      c.includes("subscri") ||
      c.includes("netflix") ||
      c.includes("spotify") ||
      c.includes("premium")
    );
  }
  return true;
}

export function groupTransactionsByMonth(transactions) {
  const groups = new Map();

  for (const txn of transactions) {
    const d = new Date(txn.date || 0);
    const key = Number.isNaN(d.getTime())
      ? "unknown"
      : `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const label = Number.isNaN(d.getTime())
      ? "Unknown date"
      : d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

    if (!groups.has(key)) {
      groups.set(key, { key, label, items: [] });
    }
    groups.get(key).items.push(txn);
  }

  return Array.from(groups.values()).sort((a, b) => b.key.localeCompare(a.key));
}
