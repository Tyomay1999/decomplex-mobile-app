import { ensureDomExceptionPolyfill } from "./src/polyfills/domException";

ensureDomExceptionPolyfill();

import React, { useEffect, useState, useContext } from "react";
import { Provider } from "react-redux";
import { Text, View } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";

import { store } from "./src/store/store";
import { loadSession } from "./src/storage/sessionStorage";
import { authActions } from "./src/features/auth/authSlice";
import { initI18n } from "./src/i18n/i18n";
import { I18nBridge } from "./src/i18n/I18nBridge";
import { RootNavigator } from "./src/navigation/RootNavigator";

import { ThemeProvider, ThemeContext } from "./src/app/ThemeProvider";
import { authApi } from "./src/features/auth/authApi";

function ThemedNavigation(): React.JSX.Element {
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.themeName === "dark";

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

async function bootstrapAuth(): Promise<void> {
  const session = await loadSession();
  store.dispatch(authActions.hydrateFromStorage(session));
  initI18n(session.language);
  const hasAnyToken = Boolean(session.accessToken) || Boolean(session.refreshToken);

  if (!hasAnyToken) {
    store.dispatch(authActions.setUser(null));
    return;
  }

  try {
    const user = await store.dispatch(authApi.endpoints.me.initiate()).unwrap();
    store.dispatch(authActions.setUser(user));
  } catch {
    store.dispatch(authActions.setUser(null));
  } finally {
    store.dispatch(authApi.util.resetApiState());
  }
}

function Bootstrap(): React.JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        await bootstrapAuth();
      } catch (e) {
        console.error("[Bootstrap] failed:", e);
        initI18n("en");
      } finally {
        store.dispatch(authActions.setBootstrapped(true));
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Bootstrapping session...</Text>
      </View>
    );
  }

  return (
    <I18nBridge>
      <ThemeProvider>
        <ThemedNavigation />
      </ThemeProvider>
    </I18nBridge>
  );
}

export default function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <Bootstrap />
    </Provider>
  );
}
