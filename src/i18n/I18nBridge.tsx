import React, { useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import { i18n } from "./i18n";

export function I18nBridge({ children }: { children: React.ReactNode }): React.JSX.Element {
  const language = useAppSelector((s) => s.auth.language);

  useEffect(() => {
    if (!i18n.isInitialized) return;
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  return <>{children}</>;
}
