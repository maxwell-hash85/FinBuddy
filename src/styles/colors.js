/**
 * Static fallback for rare imports/tests — runtime UI should use `useTheme().colors`.
 * Defaults match dark (green + black) brand theme.
 */
import { THEMES } from "./themes";

export const COLORS = THEMES.dark;
