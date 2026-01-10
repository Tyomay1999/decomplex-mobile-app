import React, { JSX } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from "react-native";

import { LanguageMenu } from "../../components/LanguageMenu";
import { useRegisterScreen } from "./hooks/useRegisterScreen";
import { Header, RegisterForm, TopBar } from "./components";
import { screenStyles as styles } from "./components/styles";

export function RegisterScreen(): JSX.Element {
  const h = useRegisterScreen();
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
            title={h.t("auth.register.title", "Create account")}
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
            title={h.t("auth.register.headline", "Create your account")}
            subtitle={h.t("auth.register.subtitle", "Fill in the details below")}
          />

          <RegisterForm
            theme={theme}
            t={h.t}
            firstName={h.firstName}
            lastName={h.lastName}
            email={h.email}
            password={h.password}
            onChangeFirstName={h.setFirstName}
            onChangeLastName={h.setLastName}
            onChangeEmail={h.setEmail}
            onChangePassword={h.setPassword}
            onSubmit={h.onSubmit}
            loading={h.isLoading}
            canSubmit={h.canSubmit}
            placeholderColor={h.placeholderColor}
            onGoLogin={h.goLogin}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
