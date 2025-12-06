import { useContext } from "react";
import type { ThemeProviderState } from "./theme-types";
import { ThemeProviderContext } from "./use-theme-context";

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  if (
    !context ||
    typeof context.theme !== "string" ||
    typeof context.toggleTheme !== "function"
  ) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
