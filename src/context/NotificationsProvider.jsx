import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { buildNotifications } from "../utils/buildNotifications";
import { useProfile } from "./ProfileProvider";

const READ_KEY = "finbuddy_notifications_read";

const NotificationsContext = createContext(null);

function loadReadIds() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

export function NotificationsProvider({ children }) {
  const { transactions } = useTransactions();
  const { profile } = useProfile();
  const [readIds, setReadIds] = useState(loadReadIds);

  const notifications = useMemo(() => {
    if (!profile.notificationsEnabled) return [];
    return buildNotifications(transactions);
  }, [transactions, profile.notificationsEnabled]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds],
  );

  useEffect(() => {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...readIds]));
    } catch {
      /* ignore */
    }
  }, [readIds]);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAllRead,
      markRead,
      isRead: (id) => readIds.has(id),
    }),
    [notifications, unreadCount, markAllRead, markRead, readIds],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
