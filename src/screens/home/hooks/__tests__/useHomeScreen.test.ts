import { act, renderHook } from "@testing-library/react-native";
import type { TFunction } from "i18next";

import { useHomeScreen } from "../useHomeScreen";

type Locale = "en" | "ru" | "hy";

type TriggerArgs = {
  q?: string;
  limit: number;
  status: "active";
  cursor?: string;
  jobType?: string;
  salaryOnly?: true;
  newOnly?: true;
};

type TriggerResult = { items: Array<{ id: string }>; nextCursor: string | null };

type TriggerCall = (
  args: TriggerArgs,
  preferCacheValue?: boolean,
) => {
  unwrap: () => Promise<TriggerResult>;
};

type ListState = { isFetching: boolean };

const flush = async (): Promise<void> => {
  await Promise.resolve();
};

type DispatchFn = (action: unknown) => unknown;
const mockDispatch = jest.fn<ReturnType<DispatchFn>, Parameters<DispatchFn>>((a) => a);

let mockLanguage: Locale = "en";
let mockUser: { id: string } | null = null;
let mockBootstrapped = true;

type ChangeLanguageFn = (lng: string) => Promise<void>;
const mockChangeLanguage = jest.fn<ReturnType<ChangeLanguageFn>, Parameters<ChangeLanguageFn>>(
  async () => undefined,
);

type PersistSessionFn = (p: { language: Locale }) => Promise<void>;
const mockPersistSession = jest.fn<ReturnType<PersistSessionFn>, Parameters<PersistSessionFn>>(
  async () => undefined,
);

type TFn = (key: string, opts?: Record<string, unknown>) => string;
const mockT = jest.fn<ReturnType<TFn>, Parameters<TFn>>((key, opts) => {
  if (!opts) return key;
  return `${key}:${JSON.stringify(opts)}`;
});

type NavigateFn = (name: string, params?: unknown) => void;
const mockNavigate = jest.fn<ReturnType<NavigateFn>, Parameters<NavigateFn>>(() => undefined);

type TriggerUnwrapFn = () => Promise<TriggerResult>;
const mockTriggerUnwrap = jest.fn<ReturnType<TriggerUnwrapFn>, Parameters<TriggerUnwrapFn>>();

type TriggerListFn = (args: TriggerArgs, preferCacheValue?: boolean) => ReturnType<TriggerCall>;
const mockTriggerList = jest.fn<ReturnType<TriggerListFn>, Parameters<TriggerListFn>>();

const mockListState: ListState = { isFetching: false };

jest.mock("react-native", () => {
  class Value {
    public constructor() {}
    public setValue(): void {}
  }

  const timing = jest.fn(
    () =>
      ({
        start: (cb?: (r: { finished: boolean }) => void) => {
          if (cb) cb({ finished: true });
        },
      }) as { start: (cb?: (r: { finished: boolean }) => void) => void },
  );

  const out = (e: unknown) => e;
  const inn = (e: unknown) => e;

  const select = <T>(spec: { ios?: T; android?: T; default?: T; web?: T }): T | undefined => {
    if (spec.ios !== undefined) return spec.ios;
    if (spec.default !== undefined) return spec.default;
    if (spec.web !== undefined) return spec.web;
    if (spec.android !== undefined) return spec.android;
    return undefined;
  };

  return {
    Animated: { Value, timing },
    Easing: { out, in: inn, cubic: {} },
    Dimensions: { get: () => ({ height: 800 }) },
    Platform: { OS: "ios", select },
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT as unknown as TFunction,
    i18n: { changeLanguage: mockChangeLanguage },
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("../../../../app/ThemeProvider", () => {
  const React = require("react") as typeof import("react");
  return {
    ThemeContext: React.createContext<{ theme?: { name: string } } | null>({
      theme: { name: "light" },
    }),
  };
});

jest.mock("../../../../features/vacancies/vacanciesApi", () => ({
  useLazyListVacanciesQuery: (): [TriggerCall, ListState] => [
    mockTriggerList as unknown as TriggerCall,
    mockListState,
  ],
}));

jest.mock("../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    sel: (s: {
      auth: { language: Locale; user: { id: string } | null; bootstrapped: boolean };
    }) => unknown,
  ) => sel({ auth: { language: mockLanguage, user: mockUser, bootstrapped: mockBootstrapped } }),
}));

jest.mock("../../../../features/auth/authSlice", () => ({
  authActions: { setLanguage: (lng: Locale) => ({ type: "auth/setLanguage", payload: lng }) },
}));

jest.mock("../../../../ui/notifications", () => ({
  notificationsActions: {
    push: (payload: { kind: "success" | "error"; message: string; title?: string }) => ({
      type: "notifications/push",
      payload,
    }),
  },
}));

jest.mock("../../../../storage/sessionStorage", () => ({
  persistSession: (p: { language: Locale }) => mockPersistSession(p),
}));

describe("useHomeScreen: smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockLanguage = "en";
    mockUser = null;
    mockBootstrapped = true;
    mockListState.isFetching = false;

    mockTriggerUnwrap.mockImplementation(async () => ({ items: [], nextCursor: null }));
    mockTriggerList.mockImplementation(() => ({
      unwrap: () => mockTriggerUnwrap(),
    }));
  });

  test("mounts and returns basic shape", async () => {
    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    expect(result.current.language).toBe("en");
    expect(result.current.platformIsIOS).toBe(true);
    expect(Array.isArray(result.current.items)).toBe(true);
    expect(typeof result.current.setSearch).toBe("function");
  });
});

describe("useHomeScreen: openVacancy", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockLanguage = "en";
    mockUser = null;
    mockBootstrapped = true;
    mockListState.isFetching = false;

    mockTriggerUnwrap.mockImplementation(async () => ({ items: [], nextCursor: null }));
    mockTriggerList.mockImplementation(() => ({
      unwrap: () => mockTriggerUnwrap(),
    }));
  });

  test("does nothing when not bootstrapped", async () => {
    mockUser = { id: "u1" };
    mockBootstrapped = false;

    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    act(() => {
      result.current.openVacancy("v1");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("navigates to Login when not authed", async () => {
    mockUser = null;
    mockBootstrapped = true;

    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    act(() => {
      result.current.openVacancy("v1");
    });

    expect(mockNavigate).toHaveBeenCalledWith("Login");
  });

  test("navigates to VacancyDetails when authed", async () => {
    mockUser = { id: "u1" };
    mockBootstrapped = true;

    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    act(() => {
      result.current.openVacancy("v1");
    });

    expect(mockNavigate).toHaveBeenCalledWith("VacancyDetails", { vacancyId: "v1" });
  });
});

describe("useHomeScreen: onSelectLanguage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockLanguage = "en";
    mockUser = null;
    mockBootstrapped = true;
    mockListState.isFetching = false;

    mockTriggerUnwrap.mockImplementation(async () => ({ items: [], nextCursor: null }));
    mockTriggerList.mockImplementation(() => ({
      unwrap: () => mockTriggerUnwrap(),
    }));
  });

  test("does nothing when next language equals current", async () => {
    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    await act(async () => {
      await result.current.onSelectLanguage("en");
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockChangeLanguage).not.toHaveBeenCalled();
    expect(mockPersistSession).not.toHaveBeenCalled();
  });

  test("dispatches, changes i18n language and persists session", async () => {
    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    await act(async () => {
      await result.current.onSelectLanguage("hy");
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: "auth/setLanguage", payload: "hy" });
    expect(mockChangeLanguage).toHaveBeenCalledWith("hy");
    expect(mockPersistSession).toHaveBeenCalledWith({ language: "hy" });

    const dispatchOrder = mockDispatch.mock.invocationCallOrder[0] ?? 0;
    const changeOrder = mockChangeLanguage.mock.invocationCallOrder[0] ?? 0;
    const persistOrder = mockPersistSession.mock.invocationCallOrder[0] ?? 0;

    expect(dispatchOrder).toBeLessThan(changeOrder);
    expect(changeOrder).toBeLessThan(persistOrder);
  });
});

describe("useHomeScreen: draft filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockLanguage = "en";
    mockUser = null;
    mockBootstrapped = true;
    mockListState.isFetching = false;

    mockTriggerUnwrap.mockImplementation(async () => ({ items: [], nextCursor: null }));
    mockTriggerList.mockImplementation(() => ({
      unwrap: () => mockTriggerUnwrap(),
    }));
  });

  test("hasPendingDraft is false by default", async () => {
    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    expect(result.current.hasPendingDraft).toBe(false);
  });

  test("hasPendingDraft becomes true when draft changes", async () => {
    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    act(() => {
      result.current.setDraftSalaryOnly(true);
    });

    expect(result.current.hasPendingDraft).toBe(true);
  });

  test("resetDraftFilters resets draft values", async () => {
    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    act(() => {
      result.current.setDraftJobType("remote");
      result.current.setDraftSalaryOnly(true);
      result.current.setDraftNewOnly(true);
    });

    act(() => {
      result.current.resetDraftFilters();
    });

    expect(result.current.draftJobType).toBe(null);
    expect(result.current.draftSalaryOnly).toBe(false);
    expect(result.current.draftNewOnly).toBe(false);
    expect(result.current.hasPendingDraft).toBe(false);
  });
});

describe("useHomeScreen: applyDraftFilters (state only)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockLanguage = "en";
    mockUser = null;
    mockBootstrapped = true;
    mockListState.isFetching = false;

    mockTriggerUnwrap.mockImplementation(async () => ({ items: [], nextCursor: null }));
    mockTriggerList.mockImplementation(() => ({
      unwrap: () => mockTriggerUnwrap(),
    }));
  });

  test("draft changes make hasPendingDraft true", async () => {
    const { result } = renderHook(() => useHomeScreen());

    await act(async () => {
      await flush();
    });

    expect(result.current.hasPendingDraft).toBe(false);

    act(() => {
      result.current.setDraftJobType("remote");
      result.current.setDraftSalaryOnly(true);
      result.current.setDraftNewOnly(true);
    });

    expect(result.current.hasPendingDraft).toBe(true);
  });
});
