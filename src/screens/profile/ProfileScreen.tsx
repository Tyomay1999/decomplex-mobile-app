import React, { JSX, useCallback, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";

import { LanguageMenu } from "../../components/LanguageMenu";
import { useProfileScreen } from "./hooks/useProfileScreen";
import {
  AccountCard,
  GuestActions,
  ProfileTopBar,
  ProfileHeader,
  ConfirmLogoutModal,
} from "./components";

export function ProfileScreen(): JSX.Element {
  const p = useProfileScreen();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const onRequestLogout = useCallback(() => {
    setLogoutOpen(true);
  }, []);

  const onCancelLogout = useCallback(() => {
    if (logoutLoading) return;
    setLogoutOpen(false);
  }, [logoutLoading]);

  const onConfirmLogout = useCallback(async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);
    try {
      await Promise.resolve(p.logout());
    } finally {
      setLogoutLoading(false);
      setLogoutOpen(false);
    }
  }, [logoutLoading, p]);

  if (!p.theme) return <View style={{ flex: 1 }} />;

  const languageLabel = p.t(`auth.language.${p.language}`, String(p.language).toUpperCase());

  return (
    <View style={[s.container, { backgroundColor: p.theme.background }]}>
      <ProfileTopBar
        title={p.t("profile.title", "Profile")}
        languageLabel={languageLabel}
        onOpenLanguage={() => p.setLangOpen(true)}
        theme={p.theme}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ProfileHeader
          name={p.displayName}
          email={p.displayEmail}
          theme={{
            surface: p.theme.surface,
            border: p.theme.border,
            textPrimary: p.theme.textPrimary,
            textSecondary: p.theme.textSecondary,
          }}
        />

        {!p.isLoggedIn ? (
          <GuestActions
            hint={p.t("profile.guest.hint", "Please log in to view your profile")}
            loginLabel={p.t("auth.login.title", "Log In")}
            registerLabel={p.t("auth.register.title", "Create Account")}
            onLogin={p.goToLogin}
            onRegister={p.goToRegister}
            theme={{
              primary: p.theme.primary,
              border: p.theme.border,
              textPrimary: p.theme.textPrimary,
              textSecondary: p.theme.textSecondary,
            }}
          />
        ) : (
          <AccountCard
            title={p.t("profile.account.sectionTitle", "Account Information")}
            emailLabel={p.t("profile.account.email", "Email")}
            typeLabel={p.t("profile.account.accountType", "Account Type")}
            roleLabel={p.t("profile.account.role", "Role")}
            emailValue={p.user?.email ?? "-"}
            typeValue={p.user?.userType ?? "-"}
            roleValue={p.user?.role ? p.t(`profile.roles.${p.user?.role}`) : "-"}
            myApplicationsLabel={p.t("profile.myApplications", "My applications")}
            logoutLabel={p.t("profile.logout", "Log Out")}
            onMyApplications={p.goToMyApplications}
            onLogout={onRequestLogout}
            theme={p.theme}
          />
        )}
      </ScrollView>

      <ConfirmLogoutModal
        theme={p.theme}
        visible={logoutOpen}
        loading={logoutLoading}
        title={p.t("profile.logoutConfirm.title", "Log out?")}
        message={p.t(
          "profile.logoutConfirm.message",
          "Are you sure you want to log out of your account?",
        )}
        confirmLabel={p.t("profile.logout", "Log Out")}
        cancelLabel={p.t("common.cancel", "Cancel")}
        onCancel={onCancelLogout}
        onConfirm={onConfirmLogout}
      />

      <LanguageMenu
        visible={p.langOpen}
        value={p.language}
        title={p.t("auth.language.label")}
        cancelLabel={p.t("common.cancel")}
        onClose={() => p.setLangOpen(false)}
        onSelect={p.onSelectLanguage}
        theme={{
          surface: p.theme.surface,
          border: p.theme.border,
          textPrimary: p.theme.textPrimary,
          textSecondary: p.theme.textSecondary,
          primary: p.theme.primary,
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
});
