import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Dimensions, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemeContext } from "../../../app/ThemeProvider";
import { useLazyListVacanciesQuery } from "../../../features/vacancies/vacanciesApi";
import type { VacancyDto, VacancyJobType } from "../../../features/vacancies/vacanciesTypes";

import type { RootStackParamList } from "../../../navigation/types";
import type { Locale } from "../../../storage/sessionStorage";
import { persistSession } from "../../../storage/sessionStorage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { authActions } from "../../../features/auth/authSlice";
import { notificationsActions } from "../../../ui/notifications";

const screenH = Dimensions.get("window").height;
const SHEET_HEIGHT = Math.min(520, Math.max(300, Math.round(screenH * 0.65)));
const PAGE_LIMIT = 12;

type JobTypeFilter = VacancyJobType | null;

type RefreshStatus = "idle" | "refreshing" | "done";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useHomeScreen() {
  const { t, i18n } = useTranslation();

  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.auth.language);
  const user = useAppSelector((s) => s.auth.user);
  const bootstrapped = useAppSelector((s) => s.auth.bootstrapped);
  const isAuthed = Boolean(user);

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const navigation = useNavigation<Nav>();

  const [triggerList, listState] = useLazyListVacanciesQuery();

  const [items, setItems] = useState<VacancyDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [jobType, setJobType] = useState<JobTypeFilter>(null);
  const [salaryOnly, setSalaryOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);

  const [draftJobType, setDraftJobType] = useState<JobTypeFilter>(null);
  const [draftSalaryOnly, setDraftSalaryOnly] = useState(false);
  const [draftNewOnly, setDraftNewOnly] = useState(false);

  const sheetAnim = useRef(new Animated.Value(0)).current;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeqRef = useRef(0);
  const isPagingRef = useRef(false);

  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>("idle");
  const refreshDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const jobTypeOptions = useMemo(
    () => [
      { key: "all", value: null as JobTypeFilter, label: t("home.filters.all") },
      {
        key: "full_time",
        value: "full_time" as JobTypeFilter,
        label: t("vacancy.jobType_full_time"),
      },
      {
        key: "part_time",
        value: "part_time" as JobTypeFilter,
        label: t("vacancy.jobType_part_time"),
      },
      { key: "remote", value: "remote" as JobTypeFilter, label: t("vacancy.jobType_remote") },
      { key: "hybrid", value: "hybrid" as JobTypeFilter, label: t("vacancy.jobType_hybrid") },
    ],
    [t],
  );

  const onSelectLanguage = useCallback(
    async (next: Locale) => {
      if (next === language) return;
      dispatch(authActions.setLanguage(next));
      await i18n.changeLanguage(next);
      await persistSession({ language: next });
    },
    [dispatch, i18n, language],
  );

  const openVacancy = useCallback(
    (vacancyId: string) => {
      if (!bootstrapped) return;

      if (!isAuthed) {
        navigation.navigate("Login");
        return;
      }

      navigation.navigate("VacancyDetails", { vacancyId });
    },
    [bootstrapped, isAuthed, navigation],
  );

  const syncDraftFromApplied = useCallback(() => {
    setDraftJobType(jobType);
    setDraftSalaryOnly(salaryOnly);
    setDraftNewOnly(newOnly);
  }, [jobType, newOnly, salaryOnly]);

  const openFilters = useCallback(() => {
    syncDraftFromApplied();
    setFiltersOpen(true);

    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetAnim, syncDraftFromApplied]);

  const closeFilters = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setFiltersOpen(false);
    });
  }, [sheetAnim]);

  const buildArgs = useCallback(
    (q: string, cursor?: string) => ({
      q: q || undefined,
      limit: PAGE_LIMIT,
      status: "active" as const,
      cursor,
      jobType: jobType ?? undefined,
      salaryOnly: salaryOnly ? true : undefined,
      newOnly: newOnly ? true : undefined,
    }),
    [jobType, newOnly, salaryOnly],
  );

  const loadFirstPage = useCallback(
    async (q: string, mode: "initial" | "search" | "manual" | "refresh") => {
      const seq = ++requestSeqRef.current;

      if (mode === "refresh") {
        setRefreshStatus("refreshing");
      } else {
        setInitialLoading(true);
      }

      setItems([]);
      setNextCursor(null);

      try {
        const res = await triggerList(buildArgs(q), true).unwrap();

        if (seq !== requestSeqRef.current) return;

        setItems(res.items);
        setNextCursor(res.nextCursor);
      } finally {
        if (seq === requestSeqRef.current) {
          if (mode === "refresh") {
            setRefreshStatus("done");

            dispatch(
              notificationsActions.push({
                kind: "success",
                message: t("common.refreshed", { defaultValue: "Updated" }),
              }),
            );

            if (refreshDoneTimerRef.current) clearTimeout(refreshDoneTimerRef.current);
            refreshDoneTimerRef.current = setTimeout(() => setRefreshStatus("idle"), 900);
          } else {
            setInitialLoading(false);
          }
        }
      }
    },
    [buildArgs, dispatch, t, triggerList],
  );

  const loadNextPage = useCallback(async () => {
    if (!nextCursor) return;
    if (listState.isFetching) return;
    if (isPagingRef.current) return;
    if (refreshStatus === "refreshing") return;

    isPagingRef.current = true;
    try {
      const res = await triggerList(buildArgs(search.trim(), nextCursor), true).unwrap();
      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } finally {
      isPagingRef.current = false;
    }
  }, [buildArgs, listState.isFetching, nextCursor, refreshStatus, search, triggerList]);

  const resetDraftFilters = useCallback(() => {
    setDraftJobType(null);
    setDraftSalaryOnly(false);
    setDraftNewOnly(false);
  }, []);

  const applyDraftFilters = useCallback(() => {
    setJobType(draftJobType);
    setSalaryOnly(draftSalaryOnly);
    setNewOnly(draftNewOnly);

    closeFilters();
    void loadFirstPage(search.trim(), "manual");
  }, [closeFilters, draftJobType, draftNewOnly, draftSalaryOnly, loadFirstPage, search]);

  const refresh = useCallback(() => {
    if (initialLoading) return;
    if (listState.isFetching) return;
    if (refreshStatus === "refreshing") return;

    void loadFirstPage(search.trim(), "refresh");
  }, [initialLoading, listState.isFetching, loadFirstPage, refreshStatus, search]);

  useEffect(() => {
    void loadFirstPage("", "initial");
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (refreshDoneTimerRef.current) clearTimeout(refreshDoneTimerRef.current);
    };
  }, [loadFirstPage]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      void loadFirstPage(search.trim(), "search");
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [loadFirstPage, search]);

  const refreshing = refreshStatus === "refreshing";

  const hasPendingDraft = useMemo(() => {
    return draftJobType !== jobType || draftSalaryOnly !== salaryOnly || draftNewOnly !== newOnly;
  }, [draftJobType, draftNewOnly, draftSalaryOnly, jobType, newOnly, salaryOnly]);

  return {
    t,
    themeCtx,
    theme,
    language,
    isAuthed,
    items,
    search,
    setSearch,
    initialLoading,
    listState,
    openVacancy,

    langOpen,
    setLangOpen,
    onSelectLanguage,

    filtersOpen,
    openFilters,
    closeFilters,
    sheetAnim,
    sheetHeight: SHEET_HEIGHT,
    platformIsIOS: Platform.OS === "ios",

    jobTypeOptions,

    jobType,
    salaryOnly,
    newOnly,

    draftJobType,
    setDraftJobType,
    draftSalaryOnly,
    setDraftSalaryOnly,
    draftNewOnly,
    setDraftNewOnly,

    resetDraftFilters,
    applyDraftFilters,
    hasPendingDraft,

    loadNextPage,

    refreshing,
    refresh,
  };
}
