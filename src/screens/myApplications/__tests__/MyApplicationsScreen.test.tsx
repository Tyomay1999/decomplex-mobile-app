import React from "react";
import { render } from "@testing-library/react-native";

import { MyApplicationsScreen } from "../MyApplicationsScreen";

const {
  __mocks__: { ActiveFiltersMock, FiltersModalMock, SearchHeaderMock, TopBarMock },
} = jest.requireMock("../components") as {
  __mocks__: Record<string, jest.Mock>;
};

const {
  __mocks__: { LanguageMenuMock },
} = jest.requireMock("../../../components/LanguageMenu") as {
  __mocks__: Record<string, jest.Mock>;
};

type Theme = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
};

type HookResult = {
  theme: Theme | null;
  [key: string]: unknown;
};

const mockUseMyApplicationsScreen = jest.fn<HookResult, []>();

jest.mock("../hooks", () => ({
  useMyApplicationsScreen: () => mockUseMyApplicationsScreen(),
}));

jest.mock("../components", () => {
  const ActiveFiltersMock = jest.fn();
  const ApplicationCardMock = jest.fn();
  const ApplicationCardSkeletonMock = jest.fn();
  const EmptyStateMock = jest.fn();
  const FiltersModalMock = jest.fn();
  const GuestGateMock = jest.fn();
  const SearchHeaderMock = jest.fn();
  const TopBarMock = jest.fn();

  return {
    ActiveFilters: (p: Record<string, unknown>) => ActiveFiltersMock(p),
    ApplicationCard: (p: Record<string, unknown>) => ApplicationCardMock(p),
    ApplicationCardSkeleton: (p: Record<string, unknown>) => ApplicationCardSkeletonMock(p),
    EmptyState: (p: Record<string, unknown>) => EmptyStateMock(p),
    FiltersModal: (p: Record<string, unknown>) => FiltersModalMock(p),
    GuestGate: (p: Record<string, unknown>) => GuestGateMock(p),
    SearchHeader: (p: Record<string, unknown>) => SearchHeaderMock(p),
    TopBar: (p: Record<string, unknown>) => TopBarMock(p),
    __mocks__: {
      ActiveFiltersMock,
      ApplicationCardMock,
      ApplicationCardSkeletonMock,
      EmptyStateMock,
      FiltersModalMock,
      GuestGateMock,
      SearchHeaderMock,
      TopBarMock,
    },
  };
});

jest.mock("../../../components/LanguageMenu", () => {
  const LanguageMenuMock = jest.fn();

  return {
    LanguageMenu: (p: Record<string, unknown>) => LanguageMenuMock(p),
    __mocks__: { LanguageMenuMock },
  };
});

test("renders GuestGate and LanguageMenu when user is not logged in", () => {
  mockUseMyApplicationsScreen.mockReturnValue({
    theme: {
      background: "#000",
      surface: "#111",
      border: "#222",
      textPrimary: "#fff",
      textSecondary: "#aaa",
      primary: "#0af",
    },
    user: null,
    t: (k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? k,
    language: "en",
    langOpen: false,
    setLangOpen: jest.fn(),
    onSelectLanguage: jest.fn(),
    goBack: jest.fn(),
    goLogin: jest.fn(),
    goRegister: jest.fn(),
  });

  const ui = render(<MyApplicationsScreen />);
  expect(ui.toJSON()).not.toBeNull();
});

describe("authenticated branch", () => {
  test("renders top sections and modals when user is logged in", () => {
    const setLangOpen: jest.MockedFunction<(v: boolean) => void> = jest.fn();
    const setTitleInput: jest.MockedFunction<(v: string) => void> = jest.fn();
    const openFilters: jest.MockedFunction<() => void> = jest.fn();
    const clearSortOnly: jest.MockedFunction<() => void> = jest.fn();
    const clearFilters: jest.MockedFunction<() => void> = jest.fn();
    const closeFilters: jest.MockedFunction<() => void> = jest.fn();
    const setSortDraft: jest.MockedFunction<(v: string) => void> = jest.fn();
    const applyFilters: jest.MockedFunction<() => void> = jest.fn();
    const goBack: jest.MockedFunction<() => void> = jest.fn();
    const goBrowseJobs: jest.MockedFunction<() => void> = jest.fn();
    const loadMore: jest.MockedFunction<() => void> = jest.fn();
    const onScroll: jest.MockedFunction<() => void> = jest.fn();
    const openVacancy: jest.MockedFunction<(id: string) => void> = jest.fn();
    const onVacancyMeta: jest.MockedFunction<
      (vacancyId: string, meta: { title?: string; location?: string }) => void
    > = jest.fn();

    const listRef = {
      current: {
        scrollToOffset: jest.fn(),
      },
    };

    const t = (key: string, arg?: unknown) =>
      typeof arg === "object" && arg && "defaultValue" in arg
        ? ((arg as { defaultValue?: string }).defaultValue ?? key)
        : key;

    mockUseMyApplicationsScreen.mockReturnValue({
      theme: {
        background: "#000",
        surface: "#111",
        border: "#222",
        textPrimary: "#fff",
        textSecondary: "#aaa",
        primary: "#0af",
      },
      user: { id: "u1" },
      t,
      language: "en",
      langOpen: false,
      setLangOpen,
      onSelectLanguage: jest.fn(),

      goBack,
      goLogin: jest.fn(),
      goRegister: jest.fn(),

      titleInput: "",
      setTitleInput,
      listRef,

      openFilters,
      activeFiltersCount: 0,

      sortLabel: "Sort",
      filtersActive: false,
      clearSortOnly,
      clearFilters,

      queryState: { isError: false, isLoading: false, isFetching: false },
      filteredSortedItems: [],
      items: [],
      loadMore,
      onScroll,

      filtersOpen: false,
      closeFilters,
      sortDraft: "date",
      setSortDraft,
      applyFilters,

      goBrowseJobs,
      openVacancy,
      onVacancyMeta,
      vacancyMetaById: {},
    });

    render(<MyApplicationsScreen />);

    expect(TopBarMock).toHaveBeenCalledTimes(1);
    expect(SearchHeaderMock).toHaveBeenCalledTimes(1);
    expect(ActiveFiltersMock).toHaveBeenCalledTimes(1);
    expect(FiltersModalMock).toHaveBeenCalledTimes(1);
    expect(LanguageMenuMock).toHaveBeenCalledTimes(1);
  });
});
