import { useEffect, useState } from "react";
import { TransactionsContext } from "./transactionsContext";

const STORAGE_KEY = "finbuddy_transactions";

function useTransactionsState() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  function addTransaction({ amount, type, category }) {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return false;
    setTransactions((prev) => [
      {
        id: Date.now(),
        amount: parsed,
        type,
        category: category.trim() || "General",
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    return true;
  }

  function updateTransaction(id, { amount, type, category }) {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return false;
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              amount: parsed,
              type,
              category: category.trim() || "General",
            }
          : t,
      ),
    );
    return true;
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function importTransactions(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return 0;
    const normalized = rows
      .filter((r) => r && r.amount > 0)
      .map((r, i) => ({
        id: r.id || Date.now() + i,
        amount: r.amount,
        type: r.type === "income" ? "income" : "expense",
        category: (r.category || "Import").trim() || "Import",
        date: r.date || new Date().toISOString(),
      }));
    setTransactions((prev) => [...normalized, ...prev]);
    return normalized.length;
  }

  function clearAll() {
    setTransactions([]);
  }

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    clearAll,
  };
}

export function TransactionsProvider({ children }) {
  const value = useTransactionsState();
  return (
    <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
  );
}

