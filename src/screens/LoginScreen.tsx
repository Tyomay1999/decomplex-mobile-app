import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authActions } from "../features/auth/authSlice";
import { useLoginMutation } from "../features/auth/authApi";
import { persistSession } from "../storage/sessionStorage";
import type { Locale } from "../storage/sessionStorage";
import { LanguageMenu } from "../components/LanguageMenu";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

type ApiErrorShape = { message?: string };

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

function getErrorMessage(error: unknown): string | null {
  if (isFetchBaseQueryError(error)) {
    const data = error.data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const msg = (data as ApiErrorShape).message;
      return typeof msg === "string" ? msg : null;
    }
    return null;
  }

  if (typeof error === "object" && error !== null) {
    const se = error as SerializedError;
    return typeof se.message === "string" ? se.message : null;
  }

  if (error instanceof Error) return error.message;

  return null;
}

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.auth.language) as Locale;

  const [langOpen, setLangOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  const onSelectLanguage = async (next: Locale) => {
    dispatch(authActions.setLanguage(next));
    await persistSession({ language: next });
  };

  const onSubmit = async () => {
    if (!canSubmit || isLoading) return;

    try {
      const data = await login({
        email: email.trim(),
        password,
        language,
      }).unwrap();

      const refreshToken = data.refreshToken ?? null;

      dispatch(
        authActions.setCredentials({
          accessToken: data.accessToken,
          refreshToken,
          fingerprintHash: data.fingerprintHash,
        }),
      );

      dispatch(authActions.setUser(data.user));

      await persistSession({
        accessToken: data.accessToken,
        refreshToken,
        fingerprintHash: data.fingerprintHash,
        language,
      });

      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (e: unknown) {
      const apiMessage = getErrorMessage(e);

      Alert.alert(
        t("auth.login.title", "Log In"),
        apiMessage ?? t("auth.errors.loginFailed", "Login failed"),
      );
    }
  };

  const onBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            disabled={!navigation.canGoBack()}
            style={({ pressed }) => [
              styles.topBtn,
              (!navigation.canGoBack() || pressed) && styles.topBtnPressed,
            ]}
          >
            <Text style={styles.topBtnText}>‹</Text>
          </Pressable>

          <Text style={styles.topTitle}>{t("auth.login.title")}</Text>

          <Pressable onPress={() => setLangOpen(true)} style={styles.langBtn}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </Pressable>
        </View>

        <LanguageMenu
          visible={langOpen}
          value={language}
          title={t("auth.language.label")}
          cancelLabel={t("auth.language.cancel")}
          onClose={() => setLangOpen(false)}
          onSelect={onSelectLanguage}
        />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.h1}>{t("auth.login.headline")}</Text>
            <Text style={styles.sub}>{t("auth.login.subtitle")}</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.login.email")}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor={"rgba(0,0,0,0.45)"}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.login.password")}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
              placeholderTextColor={"rgba(0,0,0,0.45)"}
            />

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit || isLoading}
              style={({ pressed }) => [
                styles.primaryBtn,
                (pressed || !canSubmit || isLoading) && styles.primaryBtnPressed,
                (!canSubmit || isLoading) && styles.disabled,
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {isLoading ? t("auth.login.loading") : t("auth.login.submit")}
              </Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{t("auth.login.noAccount")}</Text>
              <Pressable onPress={() => navigation.replace("Register")}>
                <Text style={styles.link}> {t("auth.login.signup")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },

  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  topTitle: { fontSize: 20, fontWeight: "600" },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topBtnPressed: { opacity: 0.35 },
  topBtnText: { fontSize: 28, lineHeight: 28 },

  langBtn: {
    height: 36,
    minWidth: 56,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  langText: { fontWeight: "800" },

  scroll: { paddingTop: 40, paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 40 },
  h1: { fontSize: 32, fontWeight: "700", letterSpacing: -0.5 },
  sub: { marginTop: 8, fontSize: 16, opacity: 0.7 },

  form: { gap: 20 },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
    borderColor: "rgba(0,0,0,0.12)",
  },

  primaryBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
  },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  disabled: { opacity: 0.55 },

  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  footerText: { fontSize: 15, opacity: 0.7 },
  link: { fontSize: 15, fontWeight: "700", color: "#3B82F6" },
});
