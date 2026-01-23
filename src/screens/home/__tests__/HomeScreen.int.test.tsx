import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";

import { HomeScreen } from "../HomeScreen";

import type { VacancyDto } from "../../../features/vacancies/vacanciesTypes";

type Theme = {
  name: string;
  surface: string;
  border: string;
  background: string;
  primary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
};

type JobTypeOption = { key: string; value: string | null; label: string };

type ListState = {
  isFetching: boolean;
  isError: boolean;
};

type HookModel = {
  t: (key: string, opts?: { defaultValue?: string; count?: number }) => string;
  themeCtx: { toggleTheme: () => void } | null;
  theme: Theme | null;

  language: "en" | "ru" | "hy";
  isAuthed: boolean;

  items: VacancyDto[];
  search: string;
  setSearch: (next: string) => void;

  initialLoading: boolean;
  listState: ListState;

  openVacancy: (vacancyId: string) => void;

  langOpen: boolean;
  setLangOpen: (v: boolean) => void;
  onSelectLanguage: (next: "en" | "ru" | "hy") => Promise<void>;

  filtersOpen: boolean;
  openFilters: () => void;
  closeFilters: () => void;

  sheetAnim: unknown;
  sheetHeight: number;
  platformIsIOS: boolean;

  jobTypeOptions: JobTypeOption[];

  jobType: string | null;
  salaryOnly: boolean;
  newOnly: boolean;

  draftJobType: string | null;
  setDraftJobType: (v: string | null) => void;
  draftSalaryOnly: boolean;
  setDraftSalaryOnly: (v: boolean | ((prev: boolean) => boolean)) => void;
  draftNewOnly: boolean;
  setDraftNewOnly: (v: boolean | ((prev: boolean) => boolean)) => void;

  resetDraftFilters: () => void;
  applyDraftFilters: () => void;
  hasPendingDraft: boolean;

  loadNextPage: () => Promise<void>;

  refreshing: boolean;
  refresh: () => void;
};

const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
  });
};

const baseTheme: Theme = {
  name: "light",
  surface: "#fff",
  border: "#ddd",
  background: "#f5f5f5",
  primary: "#000",
  textPrimary: "#111",
  textSecondary: "#555",
  textTertiary: "#777",
};

const mockT: HookModel["t"] = (key, opts) => {
  if (opts?.defaultValue) return String(opts.defaultValue);
  if (typeof opts?.count === "number") return key;
  return key;
};

const makeVacancy = (id: string): VacancyDto =>
  ({
    id,
  }) as unknown as VacancyDto;

let mockHookState: HookModel;

jest.mock("../hooks", () => ({
  useHomeScreen: () => mockHookState,
}));

jest.mock("../../../components/LanguageMenu", () => {
  const RN = require("react-native") as typeof import("react-native");

  return {
    LanguageMenu: (props: {
      visible: boolean;
      value: string;
      title: string;
      cancelLabel: string;
      onClose: () => void;
      onSelect: (next: string) => void;
      theme: unknown;
    }) => {
      if (!props.visible) return null;

      return (
        <RN.View testID="language.menu">
          <RN.Text>{props.title}</RN.Text>
          <RN.Pressable testID="language.close" onPress={props.onClose}>
            <RN.Text>{props.cancelLabel}</RN.Text>
          </RN.Pressable>
          <RN.Pressable testID="language.select.en" onPress={() => props.onSelect("en")}>
            <RN.Text>en</RN.Text>
          </RN.Pressable>
        </RN.View>
      );
    },
  };
});

jest.mock("../components", () => {
  const RN = require("react-native") as typeof import("react-native");

  return {
    HomeTopBar: (props: {
      title: string;
      languageLabel: string;
      onOpenLanguage: () => void;
      onToggleTheme: () => void;
      theme: unknown;
    }) => (
      <RN.View testID="home.topbar">
        <RN.Text testID="home.topbar.title">{props.title}</RN.Text>
        <RN.Text testID="home.topbar.langLabel">{props.languageLabel}</RN.Text>
        <RN.Pressable testID="home.topbar.openLanguage" onPress={props.onOpenLanguage}>
          <RN.Text>openLanguage</RN.Text>
        </RN.Pressable>
        <RN.Pressable testID="home.topbar.toggleTheme" onPress={props.onToggleTheme}>
          <RN.Text>toggleTheme</RN.Text>
        </RN.Pressable>
      </RN.View>
    ),

    HomeSearchBar: (props: {
      value: string;
      onChange: (next: string) => void;
      placeholder: string;
      onOpenFilters: () => void;
      theme: unknown;
    }) => (
      <RN.View testID="home.searchbar">
        <RN.Text testID="home.searchbar.value">{props.value}</RN.Text>
        <RN.Pressable testID="home.searchbar.change" onPress={() => props.onChange("dev")}>
          <RN.Text>change</RN.Text>
        </RN.Pressable>
        <RN.Pressable testID="home.searchbar.openFilters" onPress={props.onOpenFilters}>
          <RN.Text>openFilters</RN.Text>
        </RN.Pressable>
        <RN.Text testID="home.searchbar.placeholder">{props.placeholder}</RN.Text>
      </RN.View>
    ),

    HomeSectionHeader: (props: { title: string; countLabel: string; theme: unknown }) => (
      <RN.View testID="home.sectionHeader">
        <RN.Text testID="home.sectionHeader.title">{props.title}</RN.Text>
        <RN.Text testID="home.sectionHeader.count">{props.countLabel}</RN.Text>
      </RN.View>
    ),

    VacancyCardSkeleton: () => <RN.View testID="vacancy.skeleton" />,

    VacancyCard: (props: {
      item: VacancyDto;
      t: HookModel["t"];
      isAuthed: boolean;
      onOpen: (vacancyId: string) => void;
      theme: unknown;
    }) => (
      <RN.Pressable
        testID={`vacancy.card.${props.item.id}`}
        onPress={() => props.onOpen(props.item.id)}
      >
        <RN.Text>{String(props.item.id)}</RN.Text>
      </RN.Pressable>
    ),

    FiltersSheet: (props: {
      visible: boolean;
      onClose: () => void;
      onReset: () => void;
      onApply: () => void;
      applyDisabled: boolean;
      title: string;
      resetLabel: string;
      applyLabel: string;
      theme: unknown;
    }) => {
      if (!props.visible) return null;

      return (
        <RN.View testID="filters.sheet">
          <RN.Text testID="filters.title">{props.title}</RN.Text>
          <RN.Pressable testID="filters.close" onPress={props.onClose}>
            <RN.Text>close</RN.Text>
          </RN.Pressable>
          <RN.Pressable testID="filters.reset" onPress={props.onReset}>
            <RN.Text>{props.resetLabel}</RN.Text>
          </RN.Pressable>
          <RN.Pressable
            testID="filters.apply"
            onPress={props.onApply}
            disabled={props.applyDisabled}
          >
            <RN.Text>{props.applyLabel}</RN.Text>
          </RN.Pressable>
        </RN.View>
      );
    },
  };
});

const setBaseHookState = (overrides: Partial<HookModel> = {}): void => {
  mockHookState = {
    t: mockT,
    themeCtx: { toggleTheme: jest.fn() },
    theme: baseTheme,

    language: "en",
    isAuthed: true,

    items: [],
    search: "",
    setSearch: jest.fn(),

    initialLoading: false,
    listState: { isFetching: false, isError: false },

    openVacancy: jest.fn(),

    langOpen: false,
    setLangOpen: jest.fn(),
    onSelectLanguage: jest.fn(async () => undefined),

    filtersOpen: false,
    openFilters: jest.fn(),
    closeFilters: jest.fn(),

    sheetAnim: {},
    sheetHeight: 320,
    platformIsIOS: false,

    jobTypeOptions: [{ key: "all", value: null, label: "all" }],

    jobType: null,
    salaryOnly: false,
    newOnly: false,

    draftJobType: null,
    setDraftJobType: jest.fn(),
    draftSalaryOnly: false,
    setDraftSalaryOnly: jest.fn(),
    draftNewOnly: false,
    setDraftNewOnly: jest.fn(),

    resetDraftFilters: jest.fn(),
    applyDraftFilters: jest.fn(),
    hasPendingDraft: false,

    loadNextPage: jest.fn(async () => undefined),

    refreshing: false,
    refresh: jest.fn(),

    ...overrides,
  };
};

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setBaseHookState();
  });

  test("renders basic layout when theme exists", () => {
    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId("home.topbar")).toBeTruthy();
    expect(getByTestId("home.searchbar")).toBeTruthy();
    expect(getByTestId("home.sectionHeader")).toBeTruthy();
    expect(getByTestId("home.list")).toBeTruthy();
  });

  test("shows skeletons during initialLoading", () => {
    setBaseHookState({
      initialLoading: true,
      items: [],
      listState: { isFetching: false, isError: false },
    });

    const { getAllByTestId, queryByTestId } = render(<HomeScreen />);

    expect(getAllByTestId("vacancy.skeleton")).toHaveLength(6);
    expect(queryByTestId("home.inlineState")).toBeNull();
  });

  test("shows empty inline state when items empty and not fetching/error", () => {
    setBaseHookState({
      initialLoading: false,
      items: [],
      listState: { isFetching: false, isError: false },
      search: "",
      salaryOnly: false,
      newOnly: false,
      jobType: null,
      jobTypeOptions: [{ key: "all", value: null, label: "all" }],
    });

    const { getByTestId, queryByTestId } = render(<HomeScreen />);

    expect(getByTestId("home.inlineState")).toBeTruthy();
    expect(queryByTestId("home.retry")).toBeNull();
    expect(queryByTestId("home.clear")).toBeNull();
  });

  test("shows empty inline state with Retry + Clear when search active and no results", () => {
    setBaseHookState({
      initialLoading: false,
      items: [],
      listState: { isFetching: false, isError: false },
      search: "react",
      salaryOnly: false,
      newOnly: false,
      jobType: null,
      jobTypeOptions: [{ key: "all", value: null, label: "all" }],
    });

    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId("home.inlineState")).toBeTruthy();
    expect(getByTestId("home.retry")).toBeTruthy();
    expect(getByTestId("home.clear")).toBeTruthy();
  });

  test("pressing Retry calls refresh()", () => {
    const mockRefresh = jest.fn();
    setBaseHookState({
      initialLoading: false,
      items: [],
      listState: { isFetching: false, isError: true },
      refresh: mockRefresh,
    });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("home.retry"));
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  test("pressing Clear calls setSearch('') and refresh()", () => {
    const mockRefresh = jest.fn();
    const mockSetSearch = jest.fn();
    setBaseHookState({
      initialLoading: false,
      items: [],
      listState: { isFetching: false, isError: false },
      search: "dev",
      setSearch: mockSetSearch,
      refresh: mockRefresh,
      jobType: null,
      salaryOnly: false,
      newOnly: false,
      jobTypeOptions: [{ key: "all", value: null, label: "all" }],
    });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("home.clear"));
    expect(mockSetSearch).toHaveBeenCalledWith("");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  test("renders list items and opens vacancy on card press", () => {
    const mockOpenVacancy = jest.fn();
    setBaseHookState({
      items: [makeVacancy("v1"), makeVacancy("v2")],
      openVacancy: mockOpenVacancy,
    });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("vacancy.card.v1"));
    expect(mockOpenVacancy).toHaveBeenCalledWith("v1");
  });

  test("onEndReached triggers loadNextPage()", async () => {
    const mockLoadNextPage = jest.fn(async () => undefined);
    setBaseHookState({
      items: [makeVacancy("v1")],
      loadNextPage: mockLoadNextPage,
    });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent(getByTestId("home.list"), "onEndReached");
    await flush();

    expect(mockLoadNextPage).toHaveBeenCalledTimes(1);
  });

  test("pull-to-refresh triggers refresh()", () => {
    const mockRefresh = jest.fn();
    setBaseHookState({
      items: [makeVacancy("v1")],
      refresh: mockRefresh,
    });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent(getByTestId("home.list"), "onRefresh");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  test("top bar: open language calls setLangOpen(true)", () => {
    const mockSetLangOpen = jest.fn();
    setBaseHookState({ setLangOpen: mockSetLangOpen });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("home.topbar.openLanguage"));
    expect(mockSetLangOpen).toHaveBeenCalledWith(true);
  });

  test("search bar: open filters calls openFilters()", () => {
    const mockOpenFilters = jest.fn();
    setBaseHookState({ openFilters: mockOpenFilters });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId("home.searchbar.openFilters"));
    expect(mockOpenFilters).toHaveBeenCalledTimes(1);
  });

  test("renders LanguageMenu when langOpen=true", () => {
    setBaseHookState({ langOpen: true });

    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId("language.menu")).toBeTruthy();
  });

  test("renders FiltersSheet when filtersOpen=true", () => {
    setBaseHookState({ filtersOpen: true });

    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId("filters.sheet")).toBeTruthy();
  });

  test("theme missing renders fallback container", () => {
    setBaseHookState({ theme: null });

    const { queryByTestId } = render(<HomeScreen />);

    expect(queryByTestId("home.topbar")).toBeNull();
    expect(queryByTestId("home.list")).toBeNull();
  });
});
