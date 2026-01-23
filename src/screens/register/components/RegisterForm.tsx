import React, { JSX } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import { formStyles as styles } from "./styles";
import { webNoOutline } from "../../../shared/styles/web";

export function RegisterForm({
  theme,
  t,
  firstName,
  lastName,
  email,
  password,
  onChangeFirstName,
  onChangeLastName,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  loading,
  canSubmit,
  placeholderColor,
  onGoLogin,
}: {
  theme?: Theme;
  t: TFunction;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  onChangeFirstName: (v: string) => void;
  onChangeLastName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  canSubmit: boolean;
  placeholderColor: string;
  onGoLogin: () => void;
}): JSX.Element {
  const border = theme?.border ?? "rgba(0,0,0,0.12)";
  const surface = theme?.surface ?? "#FFFFFF";
  const textPrimary = theme?.textPrimary ?? "#171717";
  const textSecondary = theme?.textSecondary ?? "#737373";
  const primary = theme?.primary ?? "#3B82F6";

  return (
    <View style={styles.form}>
      <TextInput
        testID="register.firstName"
        value={firstName}
        onChangeText={onChangeFirstName}
        placeholder={t("auth.register.firstName", "First name")}
        style={[
          styles.input,
          { borderColor: border, color: textPrimary, backgroundColor: surface },
          webNoOutline,
        ]}
        placeholderTextColor={placeholderColor}
        autoCorrect={false}
      />

      <TextInput
        testID="register.lastName"
        value={lastName}
        onChangeText={onChangeLastName}
        placeholder={t("auth.register.lastName", "Last name")}
        style={[
          styles.input,
          { borderColor: border, color: textPrimary, backgroundColor: surface },
          webNoOutline,
        ]}
        placeholderTextColor={placeholderColor}
        autoCorrect={false}
      />

      <TextInput
        testID="register.email"
        value={email}
        onChangeText={onChangeEmail}
        placeholder={t("auth.register.email", "Email address")}
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
        testID="register.password"
        value={password}
        onChangeText={onChangePassword}
        placeholder={t("auth.register.password", "Password")}
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
        testID="register.submit"
        onPress={() => void onSubmit()}
        disabled={!canSubmit || loading}
        style={({ pressed }) => [
          styles.primaryBtn,
          { backgroundColor: primary, opacity: !canSubmit || loading ? 0.55 : pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.primaryBtnText}>
          {loading
            ? t("auth.register.loading", "Loading...")
            : t("auth.register.submit", "Create account")}
        </Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: textSecondary }]}>
          {t("auth.register.haveAccount", "Already have an account?")}
        </Text>

        <Pressable testID="register.goLogin" onPress={onGoLogin}>
          <Text style={[styles.link, { color: primary }]}>
            {" "}
            {t("auth.register.login", "Log in")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
