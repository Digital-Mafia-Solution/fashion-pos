import { createContext } from "react";
import type { ThemeProviderState } from "./theme-types";
import { initialThemeState } from "./theme-types";

export const ThemeProviderContext = createContext<ThemeProviderState>(initialThemeState);
