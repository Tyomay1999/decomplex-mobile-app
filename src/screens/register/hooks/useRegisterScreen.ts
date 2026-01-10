import { useCallback, useContext, useMemo, useState } from "react";
import { Keyboard } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import type { AuthRedirect, RootStackParamList } from "../../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { authActions } from "../../../features/auth/authSlice";
import { useRegisterCandidateMutation } from "../../../features/auth/authApi";
import { persistSession } from "../../../storage/sessionStorage";
import { ThemeContext } from "../../../app/ThemeProvider";
import type { Theme } from "../../../app/theme";
import { mapLocaleToBackend } from "../../../api/locale";
import { getFetchErrorData, isFetchBaseQueryError } from "../../../types/api";
import type { ApiErrorShape } from "../../../types/api";
import type { Locale } from "../../../storage/sessionStorage";
import { notificationsActions } from "../../../ui/notifications";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RegisterRoute = RouteProp<RootStackParamList, "Register">;

function isEmailConflict(error: unknown): boolean {
  if (!isFetchBaseQueryError(error)) return false;

  const fe = error as FetchBaseQueryError;
  if (fe.status === 409) return true;

  const data = getFetchErrorData(fe);
  if (typeof data !== "object" || data === null) return false;

  const obj = data as ApiErrorShape;
  if (typeof obj.code === "string" && obj.code.includes("CONFLICT")) return true;
  if (typeof obj.message === "string" && obj.message.toLowerCase().includes("exists")) return true;

  return false;
}

function getRedirect(routeParams: AuthRedirect | undefined): AuthRedirect | undefined {
  if (!routeParams) return undefined;
  if (routeParams.redirect === "MainTabs") return { redirect: "MainTabs" };
  if (routeParams.redirect === "MyApplications") return { redirect: "MyApplications" };
  if (routeParams.redirect === "VacancyDetails") {
    return { redirect: "VacancyDetails", params: { vacancyId: routeParams.params.vacancyId } };
  }
  return undefined;
}

export type UseRegisterScreen = {
  t: ReturnType<typeof useTranslation>["t"];

  theme: Theme | undefined;

  language: Locale;
  langOpen: boolean;
  setLangOpen: (v: boolean) => void;
  onSelectLanguage: (next: Locale) => Promise<void>;

  firstName: string;
  lastName: string;
  email: string;
  password: string;

  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;

  canSubmit: boolean;
  isLoading: boolean;

  placeholderColor: string;

  onSubmit: () => Promise<void>;
  onBack: () => void;

  goLogin: () => void;
};

export function useRegisterScreen(): UseRegisterScreen {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RegisterRoute>();

  const redirect = getRedirect(route.params);

  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.auth.language);

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const [langOpen, setLangOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerCandidate, { isLoading }] = useRegisterCandidateMutation();

  const placeholderColor = useMemo(
    () => theme?.textTertiary ?? "rgba(0,0,0,0.45)",
    [theme?.textTertiary],
  );

  const canSubmit = useMemo(() => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!email.trim()) return false;
    if (!password) return false;
    return !isLoading;
  }, [email, firstName, isLoading, lastName, password]);

  const onSelectLanguage = useCallback(
    async (next: Locale) => {
      if (next === language) return;
      dispatch(authActions.setLanguage(next));
      await i18n.changeLanguage(next);
      await persistSession({ language: next });
    },
    [dispatch, i18n, language],
  );

  const goHomeFallback = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  }, [navigation]);

  const onBack = useCallback(() => {
    Keyboard.dismiss();
    if (navigation.canGoBack()) navigation.goBack();
    else goHomeFallback();
  }, [goHomeFallback, navigation]);

  const goLogin = useCallback(() => {
    Keyboard.dismiss();
    navigation.replace("Login", redirect);
  }, [navigation, redirect]);

  const applyRedirect = useCallback(() => {
    if (!redirect || redirect.redirect === "MainTabs") {
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      return;
    }

    if (redirect.redirect === "MyApplications") {
      navigation.reset({ index: 1, routes: [{ name: "MainTabs" }, { name: "MyApplications" }] });
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
      await registerCandidate({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        language: mapLocaleToBackend(language),
      }).unwrap();

      applyRedirect();
    } catch (e: unknown) {
      const title = t("toast.errorTitle", { defaultValue: "Error" });

      if (isEmailConflict(e)) {
        dispatch(
          notificationsActions.push({
            kind: "error",
            title,
            message: t("auth.errors.emailExists", {
              defaultValue: "This email is already registered.",
            }),
          }),
        );
        return;
      }

      dispatch(
        notificationsActions.push({
          kind: "error",
          title,
          message: t("auth.errors.registerFailed", { defaultValue: "Registration failed." }),
        }),
      );
    }
  }, [
    applyRedirect,
    canSubmit,
    dispatch,
    email,
    firstName,
    language,
    lastName,
    password,
    registerCandidate,
    t,
  ]);

  return {
    t,
    theme,
    language,
    langOpen,
    setLangOpen,
    onSelectLanguage,

    firstName,
    lastName,
    email,
    password,

    setFirstName,
    setLastName,
    setEmail,
    setPassword,

    canSubmit,
    isLoading,

    placeholderColor,

    onSubmit,
    onBack,

    goLogin,
  };
}
