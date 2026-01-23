import React, { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import { render, RenderOptions } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { makeTestStore, TestStore } from "./makeStore";
import { I18nBridge } from "../i18n/I18nBridge";
import { initI18n } from "../i18n/i18n";
import { ThemeProvider } from "../app/ThemeProvider";
import { navigationRef } from "../navigation/navigationRef";

type Options = {
  store?: TestStore;
  language?: "en" | "ru" | "hy";
  withNavigation?: boolean;
};

function AppTestProviders({
  children,
  store,
  language,
  withNavigation,
}: PropsWithChildren<{
  store: TestStore;
  language: "en" | "ru" | "hy";
  withNavigation: boolean;
}>) {
  initI18n(language);

  const content = withNavigation ? (
    <NavigationContainer ref={navigationRef}>{children}</NavigationContainer>
  ) : (
    children
  );

  return (
    <Provider store={store}>
      <I18nBridge>
        <ThemeProvider>
          <SafeAreaProvider
            initialMetrics={{
              frame: { x: 0, y: 0, width: 390, height: 844 },
              insets: { top: 0, left: 0, right: 0, bottom: 0 },
            }}
          >
            {content}
          </SafeAreaProvider>
        </ThemeProvider>
      </I18nBridge>
    </Provider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  opts?: Options & Omit<RenderOptions, "wrapper">,
) {
  const store = opts?.store ?? makeTestStore();
  const language = opts?.language ?? "en";
  const withNavigation = opts?.withNavigation ?? false;

  const result = render(ui, {
    ...(opts ?? {}),
    wrapper: ({ children }) => (
      <AppTestProviders store={store} language={language} withNavigation={withNavigation}>
        {children}
      </AppTestProviders>
    ),
  });

  return { ...result, store };
}
