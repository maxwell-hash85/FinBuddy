export { PROFILE_KEY } from "../context/ProfileProvider";

export function getFirstName(fullName) {
  const first = (fullName || "").trim().split(/\s+/)[0];
  return first || "there";
}

/** @deprecated Use useProfile().profile — kept for non-hook callers */
export function loadProfile() {
  try {
    const raw = localStorage.getItem("finbuddy_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.name) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { name: "FinBuddy User", email: "user@finbuddy.app" };
}
