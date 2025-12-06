// Shared types and constants for theme

export type Theme = "light" | "dark";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const initialThemeState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  toggleTheme: () => null,
};
