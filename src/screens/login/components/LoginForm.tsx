import React, { JSX } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import { formStyles as styles } from "./styles";
import { webNoOutline } from "../../../shared/styles/web";

export function LoginForm({
  theme,
  t,
  email,
  password,
  rememberUser,
  onToggleRememberUser,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  loading,
  canSubmit,
  placeholderColor,
  onGoRegister,
}: {
  theme?: Theme;
  t: TFunction;
  email: string;
  password: string;
  rememberUser: boolean;
  onToggleRememberUser: () => void;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  canSubmit: boolean;
  placeholderColor: string;
  onGoRegister: () => void;
}): JSX.Element {
  const border = theme?.border ?? "rgba(0,0,0,0.12)";
  const surface = theme?.surface ?? "#FFFFFF";
  const textPrimary = theme?.textPrimary ?? "#171717";
  const textSecondary = theme?.textSecondary ?? "#737373";
  const primary = theme?.primary ?? "#3B82F6";

  return (
    <View style={styles.form}>
      <TextInput
        value={email}
        onChangeText={onChangeEmail}
        placeholder={t("auth.login.email", "Email address")}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={[
          styles.input,
          { borderColor: border, color: textPrimary, backgroundColor: surface },
          webNoOutline,
        ]}
        placeholderTextColor={placeholderColor}
      />

      <TextInput
        value={password}
        onChangeText={onChangePassword}
        placeholder={t("auth.login.password", "Password")}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        style={[
          styles.input,
          { borderColor: border, color: textPrimary, backgroundColor: surface },
          webNoOutline,
        ]}
        placeholderTextColor={placeholderColor}
      />

      <Pressable
        onPress={onToggleRememberUser}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 4,
          paddingVertical: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: border,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: rememberUser ? primary : surface,
          }}
        >
          <Text style={{ color: rememberUser ? "#FFFFFF" : "transparent", fontWeight: "900" }}>
            ✓
          </Text>
        </View>

        <Text style={{ color: textSecondary, fontWeight: "700" }}>
          {t("auth.login.rememberMe", "Remember me")}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => void onSubmit()}
        disabled={!canSubmit || loading}
        style={({ pressed }) => [
          styles.primaryBtn,
          { backgroundColor: primary, opacity: !canSubmit || loading ? 0.55 : pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.primaryBtnText}>
          {loading ? t("auth.login.loading", "Loading...") : t("auth.login.submit", "Log In")}
        </Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: textSecondary }]}>
          {t("auth.login.noAccount", "Don't have an account?")}
        </Text>
        <Pressable onPress={onGoRegister}>
          <Text style={[styles.link, { color: primary }]}>
            {" "}
            {t("auth.login.signup", "Sign up")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
