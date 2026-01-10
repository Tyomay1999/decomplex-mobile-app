import { useCallback, useContext, useMemo, useState } from "react";
import { Keyboard } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../../../app/ThemeProvider";
import type { Theme } from "../../../app/theme";
import type { RootStackParamList } from "../../../navigation/types";
import { notificationsActions } from "../../../ui/notifications";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useLoginMutation } from "../../../features/auth/authApi";
import { authActions } from "../../../features/auth/authSlice";
import { persistSession } from "../../../storage/sessionStorage";
import type { Locale } from "../../../storage/sessionStorage";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type LoginRoute = RouteProp<RootStackParamList, "Login">;

function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "ru" || v === "hy";
}

function safeLocale(v: unknown): Locale {
  return isLocale(v) ? v : "en";
}

function getRedirect(routeParams: RootStackParamList["Login"]): RootStackParamList["Login"] {
  if (!routeParams) return undefined;

  if (routeParams.redirect === "MainTabs") return { redirect: "MainTabs" };
  if (routeParams.redirect === "MyApplications") return { redirect: "MyApplications" };
  if (routeParams.redirect === "VacancyDetails") {
    return { redirect: "VacancyDetails", params: { vacancyId: routeParams.params.vacancyId } };
  }

  return undefined;
}

export type UseLoginScreen = {
  t: ReturnType<typeof useTranslation>["t"];
  theme: Theme | undefined;

  language: Locale;
  langOpen: boolean;
  setLangOpen: (v: boolean) => void;
  onSelectLanguage: (v: Locale) => Promise<void>;

  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;

  rememberUser: boolean;
  onToggleRememberUser: () => void;

  onBack: () => void;
  goRegister: () => void;

  onSubmit: () => Promise<void>;

  isLoading: boolean;
  canSubmit: boolean;
  placeholderColor: string;
};

export function useLoginScreen(): UseLoginScreen {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const route = useRoute<LoginRoute>();

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const storedLanguage = useAppSelector((s) => s.auth.language);
  const language = safeLocale(storedLanguage);

  const redirect = useMemo(() => getRedirect(route.params), [route.params]);

  const [langOpen, setLangOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUser, setRememberUser] = useState(false);

  const [login, loginState] = useLoginMutation();

  const placeholderColor = useMemo(() => theme?.textTertiary ?? "#A3A3A3", [theme?.textTertiary]);

  const canSubmit = useMemo(() => {
    if (loginState.isLoading) return false;
    return email.trim().length > 0 && password.trim().length > 0;
  }, [email, password, loginState.isLoading]);

  const onToggleRememberUser = useCallback(() => {
    setRememberUser((v) => !v);
  }, []);

  const onBack = useCallback(() => {
    Keyboard.dismiss();
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  }, [navigation]);

  const goRegister = useCallback(() => {
    Keyboard.dismiss();
    navigation.navigate("Register", redirect);
  }, [navigation, redirect]);

  const onSelectLanguage = useCallback(
    async (v: Locale) => {
      if (v === language) {
        setLangOpen(false);
        return;
      }

      dispatch(authActions.setLanguage(v));
      await i18n.changeLanguage(v);
      await persistSession({ language: v });
      setLangOpen(false);
    },
    [dispatch, i18n, language],
  );

  const applyRedirect = useCallback(() => {
    if (!redirect || redirect.redirect === "MainTabs") {
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      return;
    }

    if (redirect.redirect === "MyApplications") {
      navigation.reset({
        index: 1,
        routes: [{ name: "MainTabs" }, { name: "MyApplications" }],
      });
      return;
    }

    navigation.reset({
      index: 1,
      routes: [
        { name: "MainTabs" },
        { name: "VacancyDetails", params: { vacancyId: redirect.params.vacancyId } },
      ],
    });
  }, [navigation, redirect]);

  const onSubmit = useCallback(async () => {
    if (!canSubmit) return;

    Keyboard.dismiss();

    try {
      await login({
        email: email.trim(),
        password: password.trim(),
        rememberUser,
      }).unwrap();

      applyRedirect();
    } catch {
      dispatch(
        notificationsActions.push({
          kind: "error",
          title: t("toast.errorTitle", { defaultValue: "Error" }),
          message: t("auth.login.invalid", { defaultValue: "Invalid email or password." }),
        }),
      );
    }
  }, [applyRedirect, canSubmit, dispatch, email, login, password, rememberUser, t]);

  return {
    t,
    theme,

    language,
    langOpen,
    setLangOpen,
    onSelectLanguage,

    email,
    password,
    setEmail,
    setPassword,

    rememberUser,
    onToggleRememberUser,

    onBack,
    goRegister,

    onSubmit,

    isLoading: loginState.isLoading,
    canSubmit,
    placeholderColor,
  };
}
