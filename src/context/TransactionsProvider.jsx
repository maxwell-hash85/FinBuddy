import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "finbuddy_transactions";

const TransactionsContext = createContext(null);

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

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function clearAll() {
    setTransactions([]);
  }

  return { transactions, addTransaction, deleteTransaction, clearAll };
}

export function TransactionsProvider({ children }) {
  const value = useTransactionsState();
  return (
    <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return ctx;
}
