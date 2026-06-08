export const PROFILE_KEY = "finbuddy_profile";

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.name) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { name: "FinBuddy User", email: "user@finbuddy.app" };
}

export function getFirstName(fullName) {
  const first = (fullName || "").trim().split(/\s+/)[0];
  return first || "there";
}
