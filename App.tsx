import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { View, Text } from "react-native";
import { store } from "./src/store/store";
import { loadSession } from "./src/storage/sessionStorage";
import { authActions } from "./src/features/auth/authSlice";
import { initI18n } from "./src/i18n/i18n";
import { I18nBridge } from "./src/i18n/I18nBridge";
import { AuthDebugScreen } from "./src/screens/AuthDebugScreen";

function Bootstrap(): React.JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const session = await loadSession();
        store.dispatch(authActions.hydrateFromStorage(session));
        initI18n(session.language);
        store.dispatch(authActions.setBootstrapped(true));
      } catch (e) {
        console.error("[Bootstrap] failed:", e);
        initI18n("en");
        store.dispatch(authActions.setBootstrapped(true));
      } finally {
        setReady(true);
      }
    })();
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
      <AuthDebugScreen />
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
