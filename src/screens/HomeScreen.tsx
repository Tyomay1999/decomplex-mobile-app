import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authActions } from "../features/auth/authSlice";
import { clearSession } from "../storage/sessionStorage";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isLoggedIn = Boolean(accessToken);

  const onLogout = async () => {
    try {
      // если backend требует refreshToken/fingerprintHash — подстроим позже
      // await logout({} as any).unwrap();
    } catch {
      // logout может упасть, но мы всё равно чистим локально
    } finally {
      dispatch(authActions.clearAuth());
      await clearSession();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  const onLogin = async () => {
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.title}>{t("home.title", "Home")}</Text>
        <Text style={styles.sub}>{t("home.subtitle", "This is the main page.")}</Text>

        {isLoggedIn ? (
          <Pressable onPress={onLogout} style={styles.btn}>
            <Text style={styles.btnText}>{t("home.logout", "Log Out")}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={onLogin} style={styles.btn}>
            <Text style={styles.note}>{t("home.guest", "Guest mode: please log in.")}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  ) as React.JSX.Element;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrap: { flex: 1, padding: 24, justifyContent: "center", gap: 10 },
  title: { fontSize: 28, fontWeight: "800" },
  sub: { fontSize: 16, opacity: 0.7, marginBottom: 16 },
  note: { fontSize: 15, opacity: 0.6 },

  btn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
  },
  btnPressed: { opacity: 0.85 },
  btnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
