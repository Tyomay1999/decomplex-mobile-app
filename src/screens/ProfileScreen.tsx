import React, { useContext } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";

import { ThemeContext } from "../app/ThemeProvider";
import type { Theme } from "../app/theme";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authActions } from "../features/auth/authSlice";
import { clearSession } from "../storage/sessionStorage";

export function ProfileScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);

  const isLoggedIn = Boolean(accessToken);

  if (!theme) return <View style={{ flex: 1 }} />;

  const logout = async () => {
    dispatch(authActions.clearAuth());
    await clearSession();
  };

  const goToLogin = () => {
    navigation.navigate("Login");
  };

  const goToRegister = () => {
    navigation.navigate("Register" as string);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />

      <View
        style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      >
        <Text style={[styles.topTitle, { color: theme.textPrimary }]}>
          {t("profile.title", "Profile")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View
            style={[styles.avatar, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>

          <Text style={[styles.name, { color: theme.textPrimary }]}>
            {isLoggedIn
              ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
                t("profile.user", "User")
              : t("profile.guest", "Guest User")}
          </Text>

          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {isLoggedIn ? (user?.email ?? "") : t("profile.notLogged", "Not logged in")}
          </Text>
        </View>

        {!isLoggedIn ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
            <View style={{ alignItems: "center", paddingVertical: 34 }}>
              <Text style={{ fontSize: 56, opacity: 0.35 }}>🔒</Text>
              <Text style={{ color: theme.textSecondary, marginTop: 12 }}>
                {t("profile.needLogin", "Please log in to view your profile")}
              </Text>
            </View>

            <Pressable
              onPress={goToLogin}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: theme.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 17 }}>
                {t("auth.login.title", "Log In")}
              </Text>
            </Pressable>

            <Pressable
              onPress={goToRegister}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: theme.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: "700", fontSize: 17 }}>
                {t("auth.register.title", "Create Account")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
            <View
              style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 17,
                  fontWeight: "700",
                  marginBottom: 16,
                }}
              >
                {t("profile.accountInfo", "Account Information")}
              </Text>

              <Row label={t("profile.email", "Email")} value={user?.email ?? "-"} theme={theme} />
              <Row
                label={t("profile.type", "Account Type")}
                value={user?.userType ?? "-"}
                theme={theme}
              />
              <Row label={t("profile.role", "Role")} value={user?.role ?? "-"} theme={theme} />
            </View>

            <Pressable
              onPress={logout}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: theme.border, marginTop: 12 },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: "700", fontSize: 17 }}>
                {t("profile.logout", "Log Out")}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: Theme;
}): React.JSX.Element {
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.textSecondary, fontSize: 15 }}>{label}</Text>
      <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: { height: 44 },

  topBar: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },

  header: { alignItems: "center", paddingVertical: 32, borderBottomWidth: 1, marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3, marginBottom: 4 },
  email: { fontSize: 15, opacity: 0.85 },

  card: { borderWidth: 1, borderRadius: 16, padding: 20 },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  primaryBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
