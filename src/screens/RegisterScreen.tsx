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

import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authActions } from "../features/auth/authSlice";
import { persistSession } from "../storage/sessionStorage";
import type { Locale } from "../storage/sessionStorage";
import { LanguageMenu } from "../components/LanguageMenu";
import { ThemeContext } from "../app/ThemeProvider";
import type { Theme } from "../app/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

type AccountType = "candidate" | "company";

export function RegisterScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.auth.language) as Locale;

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [langOpen, setLangOpen] = useState(false);

  const [type, setType] = useState<AccountType>("candidate");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const placeholderColor = theme?.textTertiary ?? "rgba(0,0,0,0.45)";

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password) return false;
    if (type === "company") return companyName.trim().length > 0;
    return true;
  }, [email, password, type, companyName]);

  const onSelectLanguage = async (next: Locale) => {
    dispatch(authActions.setLanguage(next));
    await persistSession({ language: next });
  };

  const onSubmit = () => {
    if (!canSubmit) return;

    Alert.alert(
      t("auth.register.title", "Create account"),
      t("auth.register.notConnected", "Registration is not connected yet."),
      [{ text: "OK", onPress: () => navigation.replace("Login") }],
    );
  };

  const goHomeFallback = () => {
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const onBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else goHomeFallback();
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
            style={({ pressed }) => [styles.topBtn, pressed && styles.pressed]}
          >
            <Text style={styles.topBtnText}>‹</Text>
          </Pressable>

          <Text style={styles.topTitle}>{t("auth.register.title", "Create account")}</Text>

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
            <Text style={styles.h1}>{t("auth.register.headline", "Create your account")}</Text>
            <Text style={styles.sub}>
              {t("auth.register.subtitle", "Fill in the details below")}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.group}>
              <Text style={styles.label}>{t("auth.register.accountType", "Account type")}</Text>

              <View style={styles.toggleRow}>
                <Pressable
                  onPress={() => setType("candidate")}
                  style={({ pressed }) => [
                    styles.toggleBtn,
                    type === "candidate" && styles.toggleBtnActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[styles.toggleText, type === "candidate" && styles.toggleTextActive]}
                  >
                    {t("auth.register.candidate", "Candidate")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setType("company")}
                  style={({ pressed }) => [
                    styles.toggleBtn,
                    type === "company" && styles.toggleBtnActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.toggleText, type === "company" && styles.toggleTextActive]}>
                    {t("auth.register.company", "Company")}
                  </Text>
                </Pressable>
              </View>
            </View>

            {type === "candidate" ? (
              <>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t("auth.register.firstName", "First name")}
                  style={styles.input}
                  placeholderTextColor={placeholderColor}
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t("auth.register.lastName", "Last name")}
                  style={styles.input}
                  placeholderTextColor={placeholderColor}
                />
              </>
            ) : (
              <TextInput
                value={companyName}
                onChangeText={setCompanyName}
                placeholder={t("auth.register.companyName", "Company name")}
                style={styles.input}
                placeholderTextColor={placeholderColor}
              />
            )}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.register.email", "Email address")}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor={placeholderColor}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.register.password", "Password")}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
              placeholderTextColor={placeholderColor}
            />

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.primaryBtn,
                (pressed || !canSubmit) && styles.primaryBtnPressed,
                !canSubmit && styles.disabled,
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {t("auth.register.submit", "Create account")}
              </Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {t("auth.register.haveAccount", "Already have an account?")}
              </Text>
              <Pressable onPress={() => navigation.replace("Login")}>
                <Text style={styles.link}> {t("auth.register.login", "Log in")}</Text>
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

    pressed: { opacity: 0.85 },

    scroll: { paddingTop: 40, paddingHorizontal: 24, paddingBottom: 40 },
    header: { alignItems: "center", marginBottom: 40 },
    h1: { fontSize: 32, fontWeight: "700", letterSpacing: -0.5, color: textPrimary },
    sub: { marginTop: 8, fontSize: 16, color: textSecondary, opacity: 0.9 },

    form: { gap: 20 },
    group: { gap: 10 },
    label: { fontSize: 15, fontWeight: "600", color: textPrimary },

    toggleRow: { flexDirection: "row", gap: 12 },
    toggleBtn: {
      flex: 1,
      paddingVertical: 14,
      borderWidth: 1,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderColor: border,
      backgroundColor: surface,
    },
    toggleBtnActive: {
      backgroundColor: primary,
      borderColor: primary,
    },
    toggleText: { fontSize: 15, fontWeight: "700", color: textPrimary },
    toggleTextActive: { color: "#FFFFFF" },

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
