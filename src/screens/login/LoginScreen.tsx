import React, { JSX } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageMenu } from "../../components/LanguageMenu";
import { useLoginScreen } from "./hooks/useLoginScreen";
import { Header, LoginForm, TopBar } from "./components";
import { screenStyles as styles } from "./components/styles";

export function LoginScreen(): JSX.Element {
  const h = useLoginScreen();
  const theme = h.theme;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme?.background ?? "#F5F5F5" }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ backgroundColor: theme?.surface ?? "#FFFFFF" }}>
          <TopBar
            theme={theme}
            title={h.t("auth.login.title", "Log In")}
            languageLabel={String(h.language).toUpperCase()}
            onBack={h.onBack}
            onOpenLanguage={() => h.setLangOpen(true)}
          />
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
          visible={h.langOpen}
          value={h.language}
          title={h.t("auth.language.label", "Language")}
          cancelLabel={h.t("auth.language.cancel", "Cancel")}
          onClose={() => h.setLangOpen(false)}
          onSelect={h.onSelectLanguage}
        />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Header
            theme={theme}
            title={h.t("auth.login.headline", "Welcome Back")}
            subtitle={h.t("auth.login.subtitle", "Log in to continue")}
          />

          <LoginForm
            theme={theme}
            t={h.t}
            email={h.email}
            password={h.password}
            rememberUser={h.rememberUser}
            onToggleRememberUser={h.onToggleRememberUser}
            onChangeEmail={h.setEmail}
            onChangePassword={h.setPassword}
            onSubmit={h.onSubmit}
            loading={h.isLoading}
            canSubmit={h.canSubmit}
            placeholderColor={h.placeholderColor}
            onGoRegister={h.goRegister}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
