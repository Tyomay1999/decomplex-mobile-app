import type { MutableRefObject } from "react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { TFunction } from "i18next";

import { ThemeContext } from "../../../app/ThemeProvider";
import type { Theme } from "../../../app/theme";
import type { RootStackParamList } from "../../../navigation/types";
import { useLazyListMyApplicationsQuery } from "../../../features/applications/applicationsApi";
import type { ApplicationDto } from "../../../features/applications/applicationsTypes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import type { UserDto } from "../../../features/auth/authTypes";
import { authActions } from "../../../features/auth/authSlice";
import { persistSession } from "../../../storage/sessionStorage";
import type { Locale } from "../../../storage/sessionStorage";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type MyAppsQueryState = ReturnType<typeof useLazyListMyApplicationsQuery>[1];

export type VacancyMeta = { title: string; location: string | null };

export type SortKey = "time_desc" | "time_asc" | "title_asc" | "title_desc" | "location_asc";

function safeLower(v: string): string {
  return v.trim().toLowerCase();
}
function normalizeSpaces(v: string): string {
  return v.replace(/\s+/g, " ").trim();
}
function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}
function toTime(v?: string | null): number {
  if (!v) return 0;
  const ts = new Date(v).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}
function sortKeyLabel(key: SortKey, t: TFunction): string {
  if (key === "time_desc") return String(t("profile.sortNewest", { defaultValue: "Newest" }));
  if (key === "time_asc") return String(t("profile.sortOldest", { defaultValue: "Oldest" }));
  if (key === "title_asc") return String(t("profile.sortTitleAz", { defaultValue: "Title A–Z" }));
  if (key === "title_desc") return String(t("profile.sortTitleZa", { defaultValue: "Title Z–A" }));
  return String(t("profile.sortLocationAz", { defaultValue: "Location" }));
}

export type UseMyApplicationsScreen = {
  t: TFunction;
  theme: Theme | undefined;
  user: UserDto | null;

  listRef: MutableRefObject<FlatList<ApplicationDto> | null>;

  items: ApplicationDto[];
  filteredSortedItems: ApplicationDto[];

  vacancyMetaById: Record<string, VacancyMeta>;
  onVacancyMeta: (vacancyId: string, meta: VacancyMeta) => void;

  titleInput: string;
  setTitleInput: (v: string) => void;

  sortApplied: SortKey;

  sortDraft: SortKey;
  setSortDraft: (v: SortKey) => void;

  sortLabel: string;
  filtersActive: boolean;
  activeFiltersCount: number;

  filtersOpen: boolean;
  openFilters: () => void;
  closeFilters: () => void;

  applyFilters: () => void;
  clearFilters: () => void;

  clearSortOnly: () => void;

  queryState: MyAppsQueryState;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;

  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;

  goBack: () => void;
  goLogin: () => void;
  goRegister: () => void;
  goBrowseJobs: () => void;
  openVacancy: (vacancyId: string) => void;

  language: Locale;
  langOpen: boolean;
  setLangOpen: (v: boolean) => void;
  onSelectLanguage: (next: Locale) => void;
};

export function useMyApplicationsScreen(): UseMyApplicationsScreen {
  const { t } = useTranslation();
  const nav = useNavigation<Nav>();

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const language = useAppSelector((s) => s.auth.language) as Locale;

  const [langOpen, setLangOpen] = useState(false);

  const onSelectLanguage = useCallback(
    (next: Locale) => {
      dispatch(authActions.setLanguage(next));
      void persistSession({ language: next });
    },
    [dispatch],
  );

  const listRef = useRef<FlatList<ApplicationDto> | null>(null);
  const scrollOffsetRef = useRef(0);

  const [items, setItems] = useState<ApplicationDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [vacancyMetaById, setVacancyMetaById] = useState<Record<string, VacancyMeta>>({});

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [sortApplied, setSortApplied] = useState<SortKey>("time_desc");
  const [sortDraft, setSortDraft] = useState<SortKey>("time_desc");

  const [titleInput, setTitleInput] = useState("");

  const [trigger, queryState] = useLazyListMyApplicationsQuery();

  const reload = useCallback(async () => {
    const res = await trigger({ limit: 20 }, true).unwrap();
    setItems(res.items);
    setNextCursor(res.nextCursor);
  }, [trigger]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    if (queryState.isFetching) return;

    const res = await trigger({ limit: 20, cursor: nextCursor }, true).unwrap();

    setItems((prev) => {
      const merged = prev.concat(res.items);
      const seen = new Set<string>();
      return merged.filter((x) => {
        if (seen.has(x.id)) return false;
        seen.add(x.id);
        return true;
      });
    });

    setNextCursor(res.nextCursor);
  }, [nextCursor, queryState.isFetching, trigger]);

  const lastFocusReloadAtRef = useRef(0);

  const safeReloadOnFocus = useCallback(async () => {
    if (!user) return;
    if (queryState.isFetching) return;

    const now = Date.now();
    const minIntervalMs = 1500;

    if (now - lastFocusReloadAtRef.current < minIntervalMs) return;

    lastFocusReloadAtRef.current = now;

    try {
      await reload();
    } catch {
      lastFocusReloadAtRef.current = 0;
    }
  }, [queryState.isFetching, reload, user]);

  useFocusEffect(
    useCallback(() => {
      void safeReloadOnFocus();
    }, [safeReloadOnFocus]),
  );

  useEffect(() => {
    if (!user) return;
    if (items.length > 0) return;
    if (queryState.isFetching) return;
    void reload();
  }, [items.length, queryState.isFetching, reload, user]);

  useFocusEffect(
    useCallback(() => {
      const y = scrollOffsetRef.current;
      if (y > 0) {
        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset({ offset: y, animated: false });
        });
      }
    }, []),
  );

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
  }, []);

  const onVacancyMeta = useCallback((vacancyId: string, meta: VacancyMeta) => {
    setVacancyMetaById((prev) => {
      const existing = prev[vacancyId];
      if (existing && existing.title === meta.title && existing.location === meta.location)
        return prev;
      return { ...prev, [vacancyId]: meta };
    });
  }, []);

  const filtersActive = useMemo(() => sortApplied !== "time_desc", [sortApplied]);
  const activeFiltersCount = useMemo(() => (sortApplied !== "time_desc" ? 1 : 0), [sortApplied]);
  const sortLabel = useMemo(() => sortKeyLabel(sortApplied, t), [sortApplied, t]);

  const openFilters = useCallback(() => {
    setSortDraft(sortApplied);
    setFiltersOpen(true);
  }, [sortApplied]);

  const closeFilters = useCallback(() => {
    setSortDraft(sortApplied);
    setFiltersOpen(false);
  }, [sortApplied]);

  const applyFilters = useCallback(() => {
    setSortApplied(sortDraft);
    setFiltersOpen(false);
  }, [sortDraft]);

  const clearFilters = useCallback(() => {
    setSortApplied("time_desc");
    setSortDraft("time_desc");
    setFiltersOpen(false);
  }, []);

  const clearSortOnly = useCallback(() => {
    setSortApplied("time_desc");
    setSortDraft("time_desc");
  }, []);

  const filteredSortedItems = useMemo(() => {
    const q = safeLower(normalizeSpaces(titleInput));

    const base = items.filter((app) => {
      if (q.length === 0) return true;

      const meta = vacancyMetaById[app.vacancyId];
      const title = meta?.title ? safeLower(meta.title) : "";
      const loc = meta?.location ? safeLower(meta.location) : "";

      if (title.includes(q)) return true;
      if (loc.includes(q)) return true;

      return false;
    });

    const arr = base.slice();

    arr.sort((a, b) => {
      if (sortApplied === "time_desc") return toTime(b.createdAt) - toTime(a.createdAt);
      if (sortApplied === "time_asc") return toTime(a.createdAt) - toTime(b.createdAt);

      const metaA = vacancyMetaById[a.vacancyId];
      const metaB = vacancyMetaById[b.vacancyId];

      const titleA = metaA?.title?.trim() || "";
      const titleB = metaB?.title?.trim() || "";
      const locA = metaA?.location?.trim() || "";
      const locB = metaB?.location?.trim() || "";

      if (sortApplied === "title_asc") return compareText(titleA, titleB);
      if (sortApplied === "title_desc") return compareText(titleB, titleA);
      if (sortApplied === "location_asc") return compareText(locA, locB);

      return 0;
    });

    return arr;
  }, [items, sortApplied, titleInput, vacancyMetaById]);

  const goBack = useCallback(() => nav.goBack(), [nav]);
  const goLogin = useCallback(() => nav.navigate("Login"), [nav]);
  const goRegister = useCallback(() => nav.navigate("Register"), [nav]);

  const goBrowseJobs = useCallback(() => {
    nav.navigate("MainTabs");
  }, [nav]);

  const openVacancy = useCallback(
    (vacancyId: string) => {
      nav.navigate("VacancyDetails", { vacancyId });
    },
    [nav],
  );

  return {
    t,
    theme,
    user,

    listRef,

    items,
    filteredSortedItems,

    vacancyMetaById,
    onVacancyMeta,

    titleInput,
    setTitleInput,

    sortApplied,

    sortDraft,
    setSortDraft,

    sortLabel,
    filtersActive,
    activeFiltersCount,

    filtersOpen,
    openFilters,
    closeFilters,
    applyFilters,
    clearFilters,

    clearSortOnly,

    queryState,
    loadMore,
    reload,

    onScroll,

    goBack,
    goLogin,
    goRegister,
    goBrowseJobs,
    openVacancy,

    language,
    langOpen,
    setLangOpen,
    onSelectLanguage,
  };
}
