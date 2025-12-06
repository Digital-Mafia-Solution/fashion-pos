import { useEffect, useState } from "react";
import type { Theme, ThemeProviderProps } from "./theme-types";
import { ThemeProviderContext } from "./use-theme-context";

export function ThemeProvider({
  children,
  storageKey = "app-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Check if the user has manually set a preference previously
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    if (storedTheme) {
      return storedTheme;
    }

    // 2. If not, check the system/browser preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    // 3. If system is light, return light
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    toggleTheme: () => {
      const newTheme = theme === "light" ? "dark" : "light";
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
