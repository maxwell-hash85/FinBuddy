import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { useTransactions } from "../../hooks/useTransactions";
import { fmt } from "../../utils/calcFinance";
import {
  formatTxnDate,
  groupTransactionsByMonth,
  matchesFilterPill,
  txnIcon,
} from "../../utils/transactionDisplay";
import Modal from "../Modal";
import TransactionForm from "../TransactionForm";

const GREEN = "#2bc62c";
const RED = "#ef4444";

const FILTER_PILLS = ["All", "Income", "Food", "Transport", "Subscriptions"];

export default function TransactionsScreen() {
  const { colors: COLORS } = useTheme();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions();

  const [search, setSearch] = useState("");
  const [activePill, setActivePill] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((txn) => {
      if (!matchesFilterPill(txn, activePill)) return false;
      if (!q) return true;
      const category = (txn.category || "").toLowerCase();
      const type = (txn.type || "").toLowerCase();
      return category.includes(q) || type.includes(q);
    });
  }, [transactions, search, activePill]);

  const grouped = useMemo(() => groupTransactionsByMonth(filtered), [filtered]);

  function handleAdd(data) {
    const ok = addTransaction(data);
    if (ok) setShowAddForm(false);
    return ok;
  }

  function handleEdit(data) {
    if (!editingTxn) return false;
    const ok = updateTransaction(editingTxn.id, data);
    if (ok) setEditingTxn(null);
    return ok;
  }

  function handleDelete(id) {
    if (window.confirm("Delete this transaction?")) {
      deleteTransaction(id);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: COLORS.textPrimary,
            letterSpacing: "-0.03em",
          }}
        >
          Transactions
        </h1>
        <button
          type="button"
          aria-label="Add transaction"
          onClick={() => setShowAddForm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            border: `1px solid ${COLORS.border}`,
            background: COLORS.surface,
            color: GREEN,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Plus size={20} strokeWidth={2} />
          </motion.div>
        </button>
      </header>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <i
          className="ti ti-search"
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "18px",
            color: COLORS.textMuted,
            pointerEvents: "none",
          }}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions…"
          aria-label="Search transactions"
          style={{
            width: "100%",
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "12px 14px 12px 42px",
            color: COLORS.textPrimary,
            fontSize: "14px",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>

      {/* Filter pills */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {FILTER_PILLS.map((pill) => {
          const isActive = activePill === pill;
          return (
            <button
              key={pill}
              type="button"
              onClick={() => setActivePill(pill)}
              style={{
                flexShrink: 0,
                padding: "8px 16px",
                borderRadius: "999px",
                border: `1px solid ${isActive ? GREEN : COLORS.border}`,
                background: isActive ? GREEN : COLORS.surface,
                color: isActive ? "#0d0d0d" : COLORS.textSecondary,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "16px",
            padding: "2.5rem 1.25rem",
            textAlign: "center",
            color: COLORS.textMuted,
            fontSize: "14px",
          }}
        >
          {transactions.length === 0
            ? "No transactions yet — tap + to add one."
            : "No transactions match your search or filter."}
        </div>
      ) : (
        grouped.map((group) => (
          <section key={group.key}>
            <h2
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: COLORS.textMuted,
                marginBottom: "10px",
              }}
            >
              {group.label}
            </h2>
            <div
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {group.items.map((txn, i) => {
                const isIncome = txn.type === "income";
                const amountColor = isIncome ? GREEN : RED;
                const isLast = i === group.items.length - 1;

                return (
                  <div
                    key={txn.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 1rem",
                      borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`,
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: COLORS.bg,
                          border: `1px solid ${COLORS.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: amountColor,
                        }}
                      >
                        <i className={`ti ${txnIcon(txn)}`} style={{ fontSize: "18px" }} />
                      </div>
                    </motion.div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: COLORS.textPrimary,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {txn.category}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: COLORS.textMuted,
                          marginTop: "2px",
                        }}
                      >
                        {txn.category}
                        {txn.date && (
                          <>
                            {" · "}
                            {formatTxnDate(txn.date)}
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: amountColor,
                        flexShrink: 0,
                      }}
                    >
                      {isIncome ? "+" : "−"}
                      {fmt(txn.amount)}
                    </div>

                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <button
                        type="button"
                        aria-label="Edit transaction"
                        onClick={() => setEditingTxn(txn)}
                        style={{
                          background: "none",
                          border: "none",
                          color: COLORS.textMuted,
                          cursor: "pointer",
                          padding: "4px",
                          fontFamily: "inherit",
                        }}
                      >
                        <i className="ti ti-pencil" style={{ fontSize: "16px" }} />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete transaction"
                        onClick={() => handleDelete(txn.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: RED,
                          cursor: "pointer",
                          padding: "4px",
                          fontFamily: "inherit",
                        }}
                      >
                        <i className="ti ti-trash" style={{ fontSize: "16px" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {showAddForm && (
        <Modal title="New transaction" onClose={() => setShowAddForm(false)}>
          <TransactionForm onAdd={handleAdd} />
        </Modal>
      )}

      {editingTxn && (
        <Modal title="Edit transaction" onClose={() => setEditingTxn(null)}>
          <TransactionForm
            initialValues={editingTxn}
            onSubmit={handleEdit}
            submitLabel="SAVE CHANGES"
          />
        </Modal>
      )}
    </div>
  );
}
