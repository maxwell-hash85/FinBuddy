import { useEffect, useMemo, useState } from "react";
import { THEMES } from "../styles/themes";
import { ThemeContext } from "./theme-context";

const STORAGE_KEY = "finbuddy_theme";

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s === "light" || s === "dark") return s;
    } catch {
      /* ignore */
    }
    return "dark";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode === "dark" ? "dark" : "light";
  }, [mode]);

  const value = useMemo(() => {
    const colors = THEMES[mode];
    return {
      mode,
      /** @type {'dark' | 'light'} */
      setMode,
      toggleTheme: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      colors,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
