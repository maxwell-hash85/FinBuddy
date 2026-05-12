/**
 * FinBuddy themes — green accent throughout.
 * Dark: black / near-black surfaces (brand default).
 * Light: soft gray canvas + white cards.
 */

const dark = {
  bg: "#050505",
  surface: "#0c0c0c",
  surfaceHover: "#141414",
  border: "#27272a",
  borderAccent: "#3f3f46",

  green: "#22c55e",
  greenDark: "#16a34a",
  greenGlow: "rgba(34, 197, 94, 0.18)",

  /** Primary accent for buttons / links (green — maps legacy “blue” slots) */
  blue: "#22c55e",
  blueDark: "#16a34a",
  blueSoft: "rgba(34, 197, 94, 0.12)",
  blueStroke: "rgba(34, 197, 94, 0.38)",

  amber: "#fbbf24",
  red: "#f87171",
  redSoft: "rgba(248, 113, 113, 0.14)",

  textPrimary: "#fafafa",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",

  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.35)",
  shadowChat: "0 16px 48px rgba(0, 0, 0, 0.5)",
};

const light = {
  bg: "#ececef",
  surface: "#ffffff",
  surfaceHover: "#f4f4f5",
  border: "#d4d4d8",
  borderAccent: "#c4c4cc",

  green: "#15803d",
  greenDark: "#166534",
  greenGlow: "rgba(21, 128, 61, 0.14)",

  blue: "#16a34a",
  blueDark: "#15803d",
  blueSoft: "rgba(22, 163, 74, 0.1)",
  blueStroke: "rgba(22, 163, 74, 0.28)",

  amber: "#d97706",
  red: "#dc2626",
  redSoft: "rgba(220, 38, 38, 0.08)",

  textPrimary: "#18181b",
  textSecondary: "#52525b",
  textMuted: "#a1a1aa",

  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.06)",
  shadowChat: "0 12px 40px rgba(0, 0, 0, 0.1)",
};

export const THEMES = {
  dark,
  light,
};
