import { useState, useEffect } from "react";

const STORAGE_KEY = "finbuddy_transactions";

export function useTransactions() {
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

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function clearAll() {
    setTransactions([]);
  }

  return { transactions, addTransaction, deleteTransaction, clearAll };
}