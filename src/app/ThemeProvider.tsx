import React, { createContext, JSX, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

import { darkTheme, lightTheme } from "./theme";
import type { Theme, ThemeName } from "./theme";

export type ThemeContextValue = {
  themeName: ThemeName;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (next: ThemeName) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren): JSX.Element {
  const [themeName, setThemeName] = useState<ThemeName>("light");

  const value = useMemo<ThemeContextValue>(() => {
    const theme = themeName === "dark" ? darkTheme : lightTheme;

    return {
      themeName,
      theme,
      toggleTheme: () => setThemeName((prev) => (prev === "light" ? "dark" : "light")),
      setTheme: (next) => setThemeName(next),
    };
  }, [themeName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
