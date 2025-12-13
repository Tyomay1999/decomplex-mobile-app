import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";
import type { SupportedLocale } from "./resources";

export function initI18n(initialLanguage: SupportedLocale): void {
  if (i18n.isInitialized) return;

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
    returnNull: false,
    returnEmptyString: false,
  });
}

export { i18n };
