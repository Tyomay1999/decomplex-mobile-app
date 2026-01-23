import { renderHook } from "@testing-library/react-native";

import { useProfileScreen } from "../hooks";

import type { RootState } from "../../../store/store";
import type { Locale } from "../../../storage/sessionStorage";

type NavMock = {
  navigate: (name: string) => void;
  reset: (state: { index: number; routes: Array<{ name: string }> }) => void;
};

type NavigateFn = (name: string) => void;
type ResetFn = (state: { index: number; routes: Array<{ name: string }> }) => void;

const mockNavigate = jest.fn<ReturnType<NavigateFn>, Parameters<NavigateFn>>(() => undefined);
const mockReset = jest.fn<ReturnType<ResetFn>, Parameters<ResetFn>>(() => undefined);

const nav: NavMock = {
  navigate: (name) => mockNavigate(name),
  reset: (state) => mockReset(state),
};

let mockState: RootState;

type DispatchFn = (action: unknown) => unknown;
const mockDispatch = jest.fn<ReturnType<DispatchFn>, Parameters<DispatchFn>>((a) => a);

type SetLanguageFn = (next: Locale) => { type: string; payload: Locale };
const mockSetLanguage = jest.fn<ReturnType<SetLanguageFn>, Parameters<SetLanguageFn>>((next) => ({
  type: "auth/setLanguage",
  payload: next,
}));

type ClearAuthFn = () => { type: string };
const mockClearAuth = jest.fn<ReturnType<ClearAuthFn>, Parameters<ClearAuthFn>>(() => ({
  type: "auth/clearAuth",
}));

type PersistSessionFn = (data: { language?: Locale }) => Promise<void>;
const mockPersistSession = jest.fn<ReturnType<PersistSessionFn>, Parameters<PersistSessionFn>>(
  async () => undefined,
);

type ClearSessionFn = () => Promise<void>;
const mockClearSession = jest.fn<ReturnType<ClearSessionFn>, Parameters<ClearSessionFn>>(
  async () => undefined,
);

type ResetApiStateFn = () => { type: string };
const mockResetApiState = jest.fn<ReturnType<ResetApiStateFn>, Parameters<ResetApiStateFn>>(() => ({
  type: "api/resetApiState",
}));

type LogoutUnwrapFn = () => Promise<void>;
const mockLogoutUnwrap = jest.fn<ReturnType<LogoutUnwrapFn>, Parameters<LogoutUnwrapFn>>(
  async () => undefined,
);

type LogoutTriggerFn = (args: { refreshToken: string }) => { unwrap: () => Promise<void> };
const mockLogoutTrigger = jest.fn<ReturnType<LogoutTriggerFn>, Parameters<LogoutTriggerFn>>();

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

jest.mock("../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: (s: RootState) => unknown) => sel(mockState),
}));

jest.mock("../../../features/auth/authSlice", () => ({
  authActions: {
    setLanguage: (next: Locale) => mockSetLanguage(next),
    clearAuth: () => mockClearAuth(),
  },
}));

jest.mock("../../../storage/sessionStorage", () => ({
  persistSession: (data: { language?: Locale }) => mockPersistSession(data),
  clearSession: () => mockClearSession(),
}));

jest.mock("../../../api/api", () => ({
  api: {
    util: {
      resetApiState: () => mockResetApiState(),
    },
  },
}));

jest.mock("../../../features/auth/authApi", () => ({
  useLogoutMutation: () => [(args: { refreshToken: string }) => mockLogoutTrigger(args)],
}));

describe("useProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      auth: {
        user: null,
        language: "en",
        refreshToken: null,
      },
    } as RootState;

    mockLogoutTrigger.mockReset();
    mockLogoutTrigger.mockImplementation(() => ({ unwrap: mockLogoutUnwrap }));
  });

  test("guest state exposes derived fields", () => {
    const { result } = renderHook(() => useProfileScreen());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.displayName).toBe("Guest User");
    expect(result.current.displayEmail).toBe("Not logged in");
    expect(result.current.language).toBe("en");
  });

  test("logged-in state derives displayName and displayEmail", () => {
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

  test("logged-in state falls back to User when name is empty", () => {
    mockState = {
      auth: {
        user: { firstName: "", lastName: "", email: "x@y.com" },
        language: "en",
        refreshToken: null,
      },
    } as RootState;

    const { result } = renderHook(() => useProfileScreen());

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.displayName).toBe("User");
    expect(result.current.displayEmail).toBe("x@y.com");
  });

  describe("navigation handlers", () => {
    test("goToMyApplications navigates to MyApplications", () => {
      const { result } = renderHook(() => useProfileScreen());

      result.current.goToMyApplications();

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("MyApplications");
    });

    test("goToLogin navigates to Login", () => {
      const { result } = renderHook(() => useProfileScreen());

      result.current.goToLogin();

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("Login");
    });

    test("goToRegister navigates to Register", () => {
      const { result } = renderHook(() => useProfileScreen());

      result.current.goToRegister();

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("Register");
    });
  });

  describe("language selection", () => {
    test("onSelectLanguage dispatches setLanguage and persists session", async () => {
      const { result } = renderHook(() => useProfileScreen());

      await result.current.onSelectLanguage("ru");

      expect(mockSetLanguage).toHaveBeenCalledTimes(1);
      expect(mockSetLanguage).toHaveBeenCalledWith("ru");

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(mockSetLanguage.mock.results[0]?.value);

      expect(mockPersistSession).toHaveBeenCalledTimes(1);
      expect(mockPersistSession).toHaveBeenCalledWith({ language: "ru" });
    });
  });

  describe("logout", () => {
    test("logout clears auth, resets api, clears session and redirects to Login", async () => {
      mockState = {
        auth: {
          user: { firstName: "John", lastName: "Smith", email: "john@acme.com" },
          language: "en",
          refreshToken: "rt",
        },
      } as RootState;

      mockLogoutTrigger.mockReturnValueOnce({ unwrap: mockLogoutUnwrap });

      const { result } = renderHook(() => useProfileScreen());

      await result.current.logout();

      expect(mockLogoutTrigger).toHaveBeenCalledTimes(1);
      expect(mockLogoutTrigger).toHaveBeenCalledWith({ refreshToken: "rt" });

      expect(mockLogoutUnwrap).toHaveBeenCalledTimes(1);

      expect(mockClearAuth).toHaveBeenCalledTimes(1);
      expect(mockResetApiState).toHaveBeenCalledTimes(1);
      expect(mockClearSession).toHaveBeenCalledTimes(1);

      expect(mockDispatch).toHaveBeenCalledWith(mockClearAuth.mock.results[0]?.value);
      expect(mockDispatch).toHaveBeenCalledWith(mockResetApiState.mock.results[0]?.value);

      expect(mockReset).toHaveBeenCalledTimes(1);
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Login" }],
      });
    });
  });
});
