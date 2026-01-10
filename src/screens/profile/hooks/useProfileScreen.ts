import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemeContext } from "../../../app/ThemeProvider";
import type { RootStackParamList } from "../../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { authActions } from "../../../features/auth/authSlice";
import { clearSession, persistSession } from "../../../storage/sessionStorage";
import type { Locale } from "../../../storage/sessionStorage";
import { api } from "../../../api/api";
import { useLogoutMutation } from "../../../features/auth/authApi";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const language = useAppSelector((s) => s.auth.language) as Locale;
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);

  const [logout] = useLogoutMutation();

  const [langOpen, setLangOpen] = useState(false);

  const isLoggedIn = Boolean(user);

  const displayName = useMemo(() => {
    if (!isLoggedIn) return t("profile.guest.title", "Guest User");
    const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    return name || t("profile.user", "User");
  }, [isLoggedIn, t, user?.firstName, user?.lastName]);

  const displayEmail = useMemo(() => {
    if (!isLoggedIn) return t("profile.guest.subtitle", "Not logged in");
    return user?.email ?? "";
  }, [isLoggedIn, t, user?.email]);

  const onSelectLanguage = useCallback(
    async (next: Locale) => {
      dispatch(authActions.setLanguage(next));
      await persistSession({ language: next });
    },
    [dispatch],
  );

  const goToMyApplications = () => navigation.navigate("MyApplications");
  const goToLogin = () => navigation.navigate("Login");
  const goToRegister = () => navigation.navigate("Register");

  const logoutFunc = useCallback(async () => {
    try {
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
    } finally {
      dispatch(authActions.clearAuth());
      dispatch(api.util.resetApiState());
      await clearSession();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [dispatch, logout, navigation, refreshToken]);

  return {
    t,
    theme,
    user,
    isLoggedIn,
    displayName,
    displayEmail,

    language,
    langOpen,
    setLangOpen,
    onSelectLanguage,

    goToMyApplications,
    goToLogin,
    goToRegister,
    logout: logoutFunc,
    themeCtx,
  };
}
