import en from "./locales/en.json";
import ru from "./locales/ru.json";
import hy from "./locales/hy.json";

export const resources = {
  en: { translation: en },
  ru: { translation: ru },
  hy: { translation: hy },
} as const;

export type SupportedLocale = keyof typeof resources; // "en" | "hy" | "ru"
