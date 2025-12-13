import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Button } from "react-native";
import { i18n } from "../i18n/i18n";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authActions } from "../features/auth/authSlice";
import { useLazyCurrentQuery, useLoginMutation, useLogoutMutation } from "../features/auth/authApi";
import { persistSession, clearSession } from "../storage/sessionStorage";
import type { Locale } from "../storage/sessionStorage";

export function AuthDebugScreen(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const auth = useAppSelector((s) => s.auth);

  const [login, loginState] = useLoginMutation();
  const [logout, logoutState] = useLogoutMutation();
  const [triggerCurrent, currentState] = useLazyCurrentQuery();

  const isLoggedIn = useMemo(
    () => Boolean(auth.accessToken && auth.refreshToken),
    [auth.accessToken, auth.refreshToken],
  );

  const onLogin = async (): Promise<void> => {
    const res = await login({
      email: "john.doe@example.com",
      password: "Candidate123!",
      rememberUser: true,
    }).unwrap();

    dispatch(
      authActions.setCredentials({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        fingerprintHash: res.fingerprintHash,
      }),
    );
    dispatch(authActions.setUser(res.user));

    await persistSession({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      fingerprintHash: res.fingerprintHash,
    });
  };

  const onLogout = async (): Promise<void> => {
    const refreshToken = auth.refreshToken;
    if (refreshToken) {
      await logout({ refreshToken })
        .unwrap()
        .catch(() => undefined);
    }

    dispatch(authActions.clearAuth());
    await clearSession();
  };

  const onCurrent = async (): Promise<void> => {
    const user = await triggerCurrent().unwrap();
    dispatch(authActions.setUser(user));
  };

  const setLang = async (lang: Locale): Promise<void> => {
    dispatch(authActions.setLanguage(lang));
    await persistSession({ language: lang });
  };
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: "700", fontSize: 18 }}>Decomplex RN Debug</Text>
      <Text>{t("auth.title")}</Text>

      <Text>i18n initialized: {String(i18n.isInitialized)}</Text>
      <Text>i18n.language: {String(i18n.language)}</Text>

      <Text>bootstrapped: {String(auth.bootstrapped)}</Text>
      <Text>isLoggedIn: {String(isLoggedIn)}</Text>
      <Text>language: {auth.language}</Text>
      <Text>fingerprint: {auth.fingerprintHash ? "YES" : "NO"}</Text>
      <Text>userId: {auth.user?.id ?? "-"}</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title="EN" onPress={() => void setLang("en")} />
        <Button title="RU" onPress={() => void setLang("ru")} />
        <Button title="HY" onPress={() => void setLang("hy")} />
      </View>

      <Button title={t("auth.login")} onPress={() => void onLogin()} />
      <Button
        title={logoutState.isLoading ? "Logging out..." : "LOGOUT"}
        onPress={() => void onLogout()}
      />
      <Button
        title={currentState.isFetching ? "Loading current..." : "AUTH/CURRENT"}
        onPress={() => void onCurrent()}
      />

      {loginState.error ? <Text>login error: {JSON.stringify(loginState.error)}</Text> : null}
      {currentState.error ? <Text>current error: {JSON.stringify(currentState.error)}</Text> : null}
    </View>
  );
}
