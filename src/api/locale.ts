import type { Locale } from "../storage/sessionStorage";

export type BackendLocale = "en" | "ru" | "am";

export function mapLocaleToBackend(locale: Locale): BackendLocale {
  if (locale === "hy") return "am";
  return locale;
}
