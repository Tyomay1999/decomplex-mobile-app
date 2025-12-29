export type ThemeName = "light" | "dark";

export type Theme = {
  name: ThemeName;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  divider: string;
  primary: string;
};

export const lightTheme: Theme = {
  name: "light",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  textPrimary: "#171717",
  textSecondary: "#737373",
  textTertiary: "#A3A3A3",
  border: "#E5E5E5",
  divider: "#E5E5E5",
  primary: "#3B82F6",
};

export const darkTheme: Theme = {
  name: "dark",
  background: "#0F0F0F",
  surface: "#1A1A1A",
  textPrimary: "#E5E5E5",
  textSecondary: "#A3A3A3",
  textTertiary: "#737373",
  border: "#2A2A2A",
  divider: "#2A2A2A",
  primary: "#3B82F6",
};
