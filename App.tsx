import { ensureDomExceptionPolyfill } from "./src/polyfills/domException";

ensureDomExceptionPolyfill();
import React, {useEffect, useState, useContext, JSX} from "react";
import { Provider } from "react-redux";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";

import { store } from "./src/store/store";
import { loadSession, clearSession } from "./src/storage/sessionStorage";
import { authActions } from "./src/features/auth/authSlice";
import { initI18n } from "./src/i18n/i18n";
import { I18nBridge } from "./src/i18n/I18nBridge";
import { RootNavigator } from "./src/navigation/RootNavigator";

import { ThemeProvider, ThemeContext } from "./src/app/ThemeProvider";
import { authApi } from "./src/features/auth/authApi";
import {NotificationHost} from "./src/ui/notifications";
import {navigationRef} from "./src/navigation/navigationRef";

function ThemedNavigation(): JSX.Element {
    const themeCtx = useContext(ThemeContext);
    const isDark = themeCtx?.themeName === "dark";

    return (
        <NavigationContainer ref={navigationRef} theme={isDark ? DarkTheme : DefaultTheme}>
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

  const meCall = store.dispatch(authApi.endpoints.me.initiate());

  try {
    const user = await meCall.unwrap();
    store.dispatch(authActions.setUser(user));
  } catch {
    store.dispatch(authActions.clearAuth());
    await clearSession();
  } finally {
    meCall.unsubscribe();
  }
}

function Bootstrap(): JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        await bootstrapAuth();
      } catch (e) {
        console.error("[Bootstrap] failed:", e);
        initI18n("en");
        store.dispatch(authActions.setUser(null));
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
        <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
        >
          <ActivityIndicator size="large" />
        </View>
    );
  }

  return (
      <I18nBridge>
        <ThemeProvider>
            <NotificationHost />
            <ThemedNavigation />
        </ThemeProvider>
      </I18nBridge>
  );
}

export default function App(): JSX.Element {
  return (
      <Provider store={store}>
        <Bootstrap />
      </Provider>
  );
}