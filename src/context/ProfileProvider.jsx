import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const PROFILE_KEY = "finbuddy_profile";
const CURRENCIES = {
  NGN: { label: "NGN ₦", symbol: "₦" },
  USD: { label: "USD $", symbol: "$" },
  GBP: { label: "GBP £", symbol: "£" },
};

const ProfileContext = createContext(null);

function loadStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.name) return normalizeProfile(parsed);
    }
  } catch {
    /* ignore */
  }
  return normalizeProfile({ name: "FinBuddy User", email: "user@finbuddy.app" });
}

function normalizeProfile(p) {
  return {
    name: p.name || "FinBuddy User",
    email: p.email || "user@finbuddy.app",
    currency: CURRENCIES[p.currency] ? p.currency : "NGN",
    emailAlertsConnected: Boolean(p.emailAlertsConnected),
    notificationsEnabled: p.notificationsEnabled !== false,
  };
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(loadStoredProfile);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);

  const value = useMemo(
    () => ({
      profile,
      currencyLabel: CURRENCIES[profile.currency]?.label ?? "NGN ₦",
      updateProfile: (patch) => setProfile((prev) => normalizeProfile({ ...prev, ...patch })),
      connectEmailAlerts: () => setProfile((prev) => ({ ...prev, emailAlertsConnected: true })),
      disconnectEmailAlerts: () => setProfile((prev) => ({ ...prev, emailAlertsConnected: false })),
      setNotificationsEnabled: (enabled) =>
        setProfile((prev) => ({ ...prev, notificationsEnabled: enabled })),
      signOut: () => {
        const theme = localStorage.getItem("finbuddy_theme");
        localStorage.removeItem("finbuddy_transactions");
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem("finbuddy_notifications_read");
        if (theme) localStorage.setItem("finbuddy_theme", theme);
        window.location.reload();
      },
      currencies: CURRENCIES,
    }),
    [profile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
