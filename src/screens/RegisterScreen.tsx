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

import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authActions } from "../features/auth/authSlice";
import { persistSession } from "../storage/sessionStorage";
import type { Locale } from "../storage/sessionStorage";
import { LanguageMenu } from "../components/LanguageMenu";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

type AccountType = "candidate" | "company";

export function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.auth.language) as Locale;

  const [langOpen, setLangOpen] = useState(false);

  const [type, setType] = useState<AccountType>("candidate");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    Alert.alert(t("auth.register.title"), t("auth.register.notConnected"), [
      { text: "OK", onPress: () => navigation.replace("Login") },
    ]);
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

          <Text style={styles.topTitle}>{t("auth.register.title")}</Text>

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
            <Text style={styles.h1}>{t("auth.register.headline")}</Text>
            <Text style={styles.sub}>{t("auth.register.subtitle")}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.group}>
              <Text style={styles.label}>{t("auth.register.accountType")}</Text>

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
                    {t("auth.register.candidate")}
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
                    {t("auth.register.company")}
                  </Text>
                </Pressable>
              </View>
            </View>

            {type === "candidate" ? (
              <>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t("auth.register.firstName")}
                  style={styles.input}
                  placeholderTextColor={"rgba(0,0,0,0.45)"}
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t("auth.register.lastName")}
                  style={styles.input}
                  placeholderTextColor={"rgba(0,0,0,0.45)"}
                />
              </>
            ) : (
              <TextInput
                value={companyName}
                onChangeText={setCompanyName}
                placeholder={t("auth.register.companyName")}
                style={styles.input}
                placeholderTextColor={"rgba(0,0,0,0.45)"}
              />
            )}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.register.email")}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor={"rgba(0,0,0,0.45)"}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.register.password")}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
              placeholderTextColor={"rgba(0,0,0,0.45)"}
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
              <Text style={styles.primaryBtnText}>{t("auth.register.submit")}</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{t("auth.register.haveAccount")}</Text>
              <Pressable onPress={() => navigation.replace("Login")}>
                <Text style={styles.link}> {t("auth.register.login")}</Text>
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
  group: { gap: 10 },
  label: { fontSize: 15, fontWeight: "600" },

  toggleRow: { flexDirection: "row", gap: 12 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "transparent",
  },
  toggleBtnActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  toggleText: { fontSize: 15, fontWeight: "700" },
  toggleTextActive: { color: "#FFFFFF" },
  pressed: { opacity: 0.9 },

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
