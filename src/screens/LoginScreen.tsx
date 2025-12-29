import React, { useContext, useMemo, useState } from "react";
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

import { mapLocaleToBackend } from "../api/locale";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authActions } from "../features/auth/authSlice";
import { useLoginMutation } from "../features/auth/authApi";
import { persistSession } from "../storage/sessionStorage";
import type { Locale } from "../storage/sessionStorage";
import { LanguageMenu } from "../components/LanguageMenu";
import { ThemeContext } from "../app/ThemeProvider";
import type { Theme } from "../app/theme";

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

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.auth.language) as Locale;

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const [langOpen, setLangOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  const styles = useMemo(() => createStyles(theme), [theme]);

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
        language: mapLocaleToBackend(language),
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

      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (e: unknown) {
      const apiMessage = getErrorMessage(e);

      Alert.alert(
        t("auth.login.title", "Log In"),
        apiMessage ?? t("auth.errors.loginFailed", "Login failed"),
      );
    }
  };

  const goHomeFallback = () => {
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const onBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else goHomeFallback();
  };

  const placeholderColor = theme?.textTertiary ?? "rgba(0,0,0,0.45)";

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.topBtn, pressed && styles.pressed]}
          >
            <Text style={styles.topBtnText}>‹</Text>
          </Pressable>

          <Text style={styles.topTitle}>{t("auth.login.title", "Log In")}</Text>

          <Pressable onPress={() => setLangOpen(true)} style={styles.langBtn}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </Pressable>
        </View>

        <LanguageMenu
          theme={
            theme
              ? {
                  surface: theme.surface,
                  border: theme.border,
                  textPrimary: theme.textPrimary,
                  textSecondary: theme.textSecondary,
                  primary: theme.primary,
                }
              : undefined
          }
          visible={langOpen}
          value={language}
          title={t("auth.language.label", "Language")}
          cancelLabel={t("auth.language.cancel", "Cancel")}
          onClose={() => setLangOpen(false)}
          onSelect={onSelectLanguage}
        />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.h1}>{t("auth.login.headline", "Welcome Back")}</Text>
            <Text style={styles.sub}>{t("auth.login.subtitle", "Log in to continue")}</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.login.email", "Email address")}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor={placeholderColor}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.login.password", "Password")}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
              placeholderTextColor={placeholderColor}
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
                {isLoading
                  ? t("auth.login.loading", "Loading...")
                  : t("auth.login.submit", "Log In")}
              </Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {t("auth.login.noAccount", "Don't have an account?")}
              </Text>
              <Pressable onPress={() => navigation.replace("Register")}>
                <Text style={styles.link}> {t("auth.login.signup", "Sign up")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme?: Theme) {
  const bg = theme?.background ?? "#F5F5F5";
  const surface = theme?.surface ?? "#FFFFFF";
  const border = theme?.border ?? "rgba(0,0,0,0.12)";
  const textPrimary = theme?.textPrimary ?? "#171717";
  const textSecondary = theme?.textSecondary ?? "#737373";
  const primary = theme?.primary ?? "#3B82F6";

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: bg },
    flex: { flex: 1 },

    topBar: {
      height: 56,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderColor: border,
      backgroundColor: surface,
    },
    topTitle: { fontSize: 20, fontWeight: "600", color: textPrimary },
    topBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    topBtnText: { fontSize: 28, lineHeight: 28, color: textPrimary },
    pressed: { opacity: 0.85 },

    langBtn: {
      height: 36,
      minWidth: 56,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surface,
    },
    langText: { fontWeight: "800", color: textPrimary },

    scroll: { paddingTop: 40, paddingHorizontal: 24, paddingBottom: 40 },
    header: { alignItems: "center", marginBottom: 40 },
    h1: { fontSize: 32, fontWeight: "700", letterSpacing: -0.5, color: textPrimary },
    sub: { marginTop: 8, fontSize: 16, color: textSecondary, opacity: 0.9 },

    form: { gap: 20 },
    input: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderRadius: 12,
      fontSize: 16,
      borderColor: border,
      color: textPrimary,
      backgroundColor: surface,
    },

    primaryBtn: {
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primary,
    },
    primaryBtnPressed: { opacity: 0.9 },
    primaryBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
    disabled: { opacity: 0.55 },

    footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
    footerText: { fontSize: 15, color: textSecondary, opacity: 0.9 },
    link: { fontSize: 15, fontWeight: "700", color: primary },
  });
}
