import { act, renderHook } from "@testing-library/react-native";
import type { ApplicationDto } from "../../../../features/applications/applicationsTypes";
import type { Locale } from "../../../../storage/sessionStorage";
import type { VacancyMeta } from "../useMyApplicationsScreen";
import { useMyApplicationsScreen } from "../useMyApplicationsScreen";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
  }),
}));

type NavMock = {
  goBack: jest.Mock<void, []>;
  navigate: jest.Mock<void, [string, Record<string, unknown>?]>;
};

const mockFocusCallbacks: Array<() => void> = [];

const mockNav: NavMock = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNav,
  useFocusEffect: (cb: () => void) => {
    mockFocusCallbacks.push(cb);
  },
}));

const mockDispatch = jest.fn();

type SelectorState = {
  auth: {
    user: unknown;
    language: Locale;
  };
};

let mockSelectorUser: unknown = null;
let mockSelectorLanguage: Locale = "en";

jest.mock("../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: (s: SelectorState) => unknown) =>
    sel({ auth: { user: mockSelectorUser, language: mockSelectorLanguage } }),
}));

jest.mock("../../../../features/auth/authSlice", () => ({
  authActions: {
    setLanguage: (language: Locale) => ({ type: "auth/setLanguage", payload: language }),
  },
}));

type PersistPayload = Partial<{ language: Locale }>;

const mockPersistSession = jest.fn<Promise<void>, [PersistPayload]>(() => Promise.resolve());

jest.mock("../../../../storage/sessionStorage", () => ({
  persistSession: (p: PersistPayload) => mockPersistSession(p),
}));

type TriggerArgs = { limit?: number; cursor?: string };
type TriggerUnwrap = { items: ApplicationDto[]; nextCursor: string | null };
type TriggerReturn = { unwrap: () => Promise<TriggerUnwrap> };

const mockTrigger = jest.fn<TriggerReturn, [TriggerArgs, boolean]>();
let mockQueryState: { isFetching: boolean } = { isFetching: false };

jest.mock("../../../../features/applications/applicationsApi", () => ({
  useLazyListMyApplicationsQuery: () => [mockTrigger, mockQueryState] as const,
}));

const mockTheme = {
  name: "light",
  surface: "#fff",
  border: "rgba(0,0,0,0.12)",
  background: "#f5f5f5",
  primary: "#3b82f6",
  textPrimary: "#111",
  textSecondary: "#666",
  textTertiary: "#999",
};

jest.mock("../../../../app/ThemeProvider", () => ({
  ThemeContext: { _currentValue: { theme: mockTheme } },
}));

function makeApp(id: string, vacancyId: string, createdAt: string): ApplicationDto {
  return {
    id,
    vacancyId,
    candidateId: "c1",
    cvFilePath: "/cv.pdf",
    coverLetter: null,
    status: "applied",
    createdAt,
    updatedAt: createdAt,
  };
}

function resolveOnce(items: ApplicationDto[], nextCursor: string | null) {
  mockTrigger.mockImplementationOnce(() => ({
    unwrap: async () => ({ items, nextCursor }),
  }));
}

type RafGlobal = {
  requestAnimationFrame?: (cb: (t: number) => void) => number;
};

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  mockFocusCallbacks.splice(0, mockFocusCallbacks.length);

  mockNav.goBack.mockReset();
  mockNav.navigate.mockReset();

  mockDispatch.mockReset();
  mockPersistSession.mockReset();

  mockTrigger.mockReset();
  mockQueryState = { isFetching: false };

  mockSelectorUser = null;
  mockSelectorLanguage = "en";

  mockTrigger.mockImplementation(() => ({
    unwrap: async () => ({ items: [], nextCursor: null }),
  }));

  const g = global as unknown as RafGlobal;
  g.requestAnimationFrame = (cb: (t: number) => void) => {
    cb(Date.now());
    return 0;
  };
});

test("does not auto-reload when user is null", async () => {
  mockSelectorUser = null;

  const { result } = renderHook(() => useMyApplicationsScreen());
  await flush();

  expect(result.current.user).toBeNull();
  expect(mockTrigger).toHaveBeenCalledTimes(0);
});

test("auto reloads on mount when user exists and list empty", async () => {
  mockSelectorUser = { id: "u1" };

  resolveOnce([makeApp("a1", "v1", "2024-01-01T00:00:00Z")], "c2");

  const { result } = renderHook(() => useMyApplicationsScreen());
  await flush();

  expect(mockTrigger).toHaveBeenCalledWith({ limit: 20 }, true);
  expect(result.current.items.map((x) => x.id)).toEqual(["a1"]);
});

test("loadMore appends and de-duplicates by id", async () => {
  mockSelectorUser = { id: "u1" };

  resolveOnce([makeApp("a1", "v1", "2024-01-01T00:00:00Z")], "c2");
  resolveOnce(
    [makeApp("a1", "v1", "2024-01-01T00:00:00Z"), makeApp("a2", "v2", "2024-01-02T00:00:00Z")],
    null,
  );

  const { result } = renderHook(() => useMyApplicationsScreen());
  await flush();

  await act(async () => {
    await result.current.loadMore();
  });
  await flush();

  const calls = mockTrigger.mock.calls;
  const loadMoreCall = calls.find((c) => {
    const arg = c[0] as TriggerArgs;
    return typeof arg.cursor === "string" && arg.cursor.length > 0;
  });

  expect(loadMoreCall?.[0]).toEqual({ limit: 20, cursor: "c2" });
  expect(result.current.items.map((x) => x.id).sort()).toEqual(["a1", "a2"]);
});

test("filtering uses cached vacancy meta title and location", async () => {
  mockSelectorUser = { id: "u1" };

  resolveOnce(
    [makeApp("a1", "v1", "2024-01-01T00:00:00Z"), makeApp("a2", "v2", "2024-01-02T00:00:00Z")],
    null,
  );

  const { result } = renderHook(() => useMyApplicationsScreen());
  await flush();

  const meta1: VacancyMeta = { title: "React Developer", location: "Yerevan" };
  const meta2: VacancyMeta = { title: "Node Engineer", location: "Berlin" };

  act(() => {
    result.current.onVacancyMeta("v1", meta1);
    result.current.onVacancyMeta("v2", meta2);
  });
  await flush();

  act(() => {
    result.current.setTitleInput("react");
  });
  await flush();
  expect(result.current.filteredSortedItems.map((x) => x.id)).toEqual(["a1"]);

  act(() => {
    result.current.setTitleInput("ber");
  });
  await flush();
  expect(result.current.filteredSortedItems.map((x) => x.id)).toEqual(["a2"]);
});

test("sorting via filters changes activeFiltersCount only when non-default sort applied", async () => {
  mockSelectorUser = { id: "u1" };

  resolveOnce(
    [makeApp("a1", "v1", "2024-01-01T00:00:00Z"), makeApp("a2", "v2", "2024-01-03T00:00:00Z")],
    null,
  );

  const { result } = renderHook(() => useMyApplicationsScreen());
  await flush();

  expect(result.current.sortApplied).toBe("time_desc");
  expect(result.current.activeFiltersCount).toBe(0);

  act(() => {
    result.current.openFilters();
  });
  await flush();

  act(() => {
    result.current.setSortDraft("time_asc");
  });
  await flush();

  act(() => {
    result.current.applyFilters();
  });
  await flush();

  expect(result.current.sortApplied).toBe("time_asc");
  expect(result.current.activeFiltersCount).toBe(1);

  act(() => {
    result.current.clearSortOnly();
  });
  await flush();

  expect(result.current.sortApplied).toBe("time_desc");
  expect(result.current.activeFiltersCount).toBe(0);
});

test("onSelectLanguage dispatches and persists language", async () => {
  mockSelectorUser = { id: "u1" };
  mockSelectorLanguage = "en";

  const { result } = renderHook(() => useMyApplicationsScreen());
  await flush();

  act(() => {
    result.current.onSelectLanguage("hy");
  });
  await flush();

  expect(mockDispatch).toHaveBeenCalledTimes(1);
  expect(mockDispatch.mock.calls[0]?.[0]).toEqual({ type: "auth/setLanguage", payload: "hy" });

  expect(mockPersistSession).toHaveBeenCalledTimes(1);
  expect(mockPersistSession.mock.calls[0]?.[0]).toEqual({ language: "hy" });
});

type ScrollEvent = {
  nativeEvent: {
    contentOffset: {
      y: number;
    };
  };
};

test("restores scroll on focus when offset > 0", async () => {
  mockSelectorUser = { id: "u1" };

  resolveOnce([makeApp("a1", "v1", "2024-01-01T00:00:00Z")], null);

  const { result } = renderHook(() => useMyApplicationsScreen());
  await flush();

  type ListRef = NonNullable<typeof result.current.listRef.current>;
  type ScrollToOffsetParams = Parameters<NonNullable<ListRef["scrollToOffset"]>>[0];

  const scrollToOffset = jest.fn<void, [ScrollToOffsetParams]>();

  act(() => {
    const fakeList: Partial<ListRef> = { scrollToOffset };
    result.current.listRef.current = fakeList as ListRef;

    const e: ScrollEvent = { nativeEvent: { contentOffset: { y: 120 } } };
    result.current.onScroll(e as unknown as Parameters<typeof result.current.onScroll>[0]);
  });
  await flush();

  const cb = mockFocusCallbacks.at(-1);
  cb?.();
  await flush();

  expect(scrollToOffset).toHaveBeenCalledTimes(1);
  expect(scrollToOffset).toHaveBeenCalledWith({ offset: 120, animated: false });
});
