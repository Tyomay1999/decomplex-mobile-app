import { renderHook } from "@testing-library/react-native";

import { useProfileScreen } from "../useProfileScreen";

import type { RootState } from "../../../../store/store";
import type { Locale } from "../../../../storage/sessionStorage";

type NavMock = {
  navigate: (name: string) => void;
  reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
};

const mockNavigate: jest.MockedFunction<(name: string) => void> = jest.fn();
const mockReset: jest.MockedFunction<
  (state: { index: number; routes: Array<{ name: string }> }) => void
> = jest.fn();

const nav: NavMock = {
  navigate: (name) => mockNavigate(name),
  reset: (state) => mockReset(state),
};

let mockState: RootState;

const mockDispatch: jest.MockedFunction<(action: unknown) => unknown> = jest.fn();

const mockSetLanguage: jest.MockedFunction<(next: Locale) => { type: string; payload: Locale }> =
  jest.fn();

const mockPersistSession = jest.fn<Promise<void>, [{ language?: Locale }]>(() => Promise.resolve());

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, defaultValue?: string) => defaultValue ?? _key,
  }),
}));

jest.mock("@react-navigation/native", () => {
  const actual: unknown = jest.requireActual("@react-navigation/native");
  return {
    ...(actual as Record<string, unknown>),
    useNavigation: () => nav,
  };
});

jest.mock("../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: (s: RootState) => unknown) => sel(mockState),
}));

jest.mock("../../../../features/auth/authSlice", () => ({
  authActions: {
    setLanguage: (next: Locale) => mockSetLanguage(next),
    clearAuth: () => ({ type: "auth/clearAuth" }),
  },
}));

jest.mock("../../../../storage/sessionStorage", () => ({
  persistSession: (data: { language?: Locale }) => mockPersistSession(data),
  clearSession: () => Promise.resolve(),
}));

jest.mock("../../../../api/api", () => ({
  api: {
    util: {
      resetApiState: () => ({ type: "api/resetApiState" }),
    },
  },
}));

jest.mock("../../../../features/auth/authApi", () => ({
  useLogoutMutation: () => [() => ({ unwrap: async () => undefined })],
}));

describe("useProfileScreen hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      auth: {
        user: null,
        language: "en",
        refreshToken: null,
      },
    } as RootState;
  });

  test("guest derived values", () => {
    const { result } = renderHook(() => useProfileScreen());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.displayName).toBe("Guest User");
    expect(result.current.displayEmail).toBe("Not logged in");
    expect(result.current.language).toBe("en");
  });

  test("logged-in derived values", () => {
    mockState = {
      auth: {
        user: { firstName: "John", lastName: "Smith", email: "john@acme.com" },
        language: "en",
        refreshToken: null,
      },
    } as RootState;

    const { result } = renderHook(() => useProfileScreen());

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.displayName).toBe("John Smith");
    expect(result.current.displayEmail).toBe("john@acme.com");
  });

  test("onSelectLanguage dispatches and persists", async () => {
    const { result } = renderHook(() => useProfileScreen());

    await result.current.onSelectLanguage("ru");

    expect(mockSetLanguage).toHaveBeenCalledTimes(1);
    expect(mockSetLanguage).toHaveBeenCalledWith("ru");

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(mockSetLanguage.mock.results[0].value);

    expect(mockPersistSession).toHaveBeenCalledTimes(1);
    expect(mockPersistSession).toHaveBeenCalledWith({ language: "ru" });
  });
});
