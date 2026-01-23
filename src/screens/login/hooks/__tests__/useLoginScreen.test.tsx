import React from "react";
import { act, renderHook } from "@testing-library/react-native";

import { useLoginScreen } from "../useLoginScreen";
import { notificationsActions } from "../../../../ui/notifications";
import type { Theme } from "../../../../app/theme";

type SupportedLocale = "en" | "ru" | "hy";

type RootState = {
  auth: {
    language: SupportedLocale;
  };
};

type RouteParams =
  | {
      redirect?: string;
      params?: unknown;
    }
  | undefined;

type TOptions = {
  defaultValue?: string;
  count?: number;
};

type TFunction = (key: string, opts?: TOptions) => string;

type Nav = {
  canGoBack: jest.Mock<boolean, []>;
  goBack: jest.Mock<void, []>;
  reset: jest.Mock<void, [unknown]>;
  navigate: jest.Mock<void, [string, unknown?]>;
};

type LoginArgs = {
  email: string;
  password: string;
  rememberUser: boolean;
};

const mockChangeLanguage = jest.fn<Promise<void>, [SupportedLocale]>(async () => undefined);

const mockT: TFunction = (key, opts) => {
  if (opts?.defaultValue) return String(opts.defaultValue);
  return key;
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { changeLanguage: mockChangeLanguage },
  }),
}));

const mockNav: Nav = {
  canGoBack: jest.fn(() => true),
  goBack: jest.fn(),
  reset: jest.fn(),
  navigate: jest.fn(),
};

let mockRouteParams: RouteParams = undefined;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNav,
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock("../../../../app/ThemeProvider", () => {
  const ReactActual = jest.requireActual("react") as typeof React;

  const theme: Theme = {
    name: "light",
    surface: "#ffffff",
    border: "rgba(0,0,0,0.12)",
    divider: "rgba(0,0,0,0.08)",
    background: "#f5f5f5",
    primary: "#3b82f6",
    textPrimary: "#111111",
    textSecondary: "#666666",
    textTertiary: "#999999",
  };

  const ThemeContext = ReactActual.createContext<{ theme: Theme } | null>({ theme });

  return { ThemeContext };
});

const mockDispatch = jest.fn<void, [unknown]>();

let mockSelectorState: RootState = { auth: { language: "en" } };

jest.mock("../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: <T,>(sel: (state: RootState) => T) => sel(mockSelectorState),
}));

const mockUnwrap = jest.fn<Promise<unknown>, [LoginArgs]>();

jest.mock("../../../../features/auth/authApi", () => ({
  useLoginMutation: () => [
    (args: LoginArgs) => ({
      unwrap: () => mockUnwrap(args),
    }),
    { isLoading: false },
  ],
}));

const mockPersistSession = jest.fn<Promise<void>, [{ language: SupportedLocale }]>(
  async () => undefined,
);

jest.mock("../../../../storage/sessionStorage", () => ({
  persistSession: (args: { language: SupportedLocale }) => mockPersistSession(args),
}));

describe("useLoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectorState = { auth: { language: "en" } };
    mockRouteParams = undefined;
    mockNav.canGoBack.mockReturnValue(true);
  });

  test("canSubmit is false initially and becomes true when email+password set", () => {
    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.canSubmit).toBe(false);

    act(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });

    expect(result.current.canSubmit).toBe(true);
  });

  test("submit success resets navigation to MainTabs by default", async () => {
    mockUnwrap.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useLoginScreen());

    act(() => {
      result.current.setEmail(" a@b.com ");
      result.current.setPassword(" secret ");
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockUnwrap).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "secret",
      rememberUser: false,
    });

    expect(mockNav.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "MainTabs" }] });
  });

  test("submit success redirects to MyApplications when route params ask for it", async () => {
    mockRouteParams = { redirect: "MyApplications" };
    mockUnwrap.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useLoginScreen());

    act(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockNav.reset).toHaveBeenCalledWith({
      index: 1,
      routes: [{ name: "MainTabs" }, { name: "MyApplications" }],
    });
  });

  test("submit failure dispatches error notification", async () => {
    mockUnwrap.mockRejectedValueOnce(new Error("bad creds"));

    const { result } = renderHook(() => useLoginScreen());

    act(() => {
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: notificationsActions.push.type }),
    );
  });

  test("onSelectLanguage changes language, persists session and closes menu", async () => {
    const { result } = renderHook(() => useLoginScreen());

    act(() => {
      result.current.setLangOpen(true);
    });

    await act(async () => {
      await result.current.onSelectLanguage("ru");
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith("ru");
    expect(mockPersistSession).toHaveBeenCalledWith({ language: "ru" });
    expect(result.current.langOpen).toBe(false);
  });
});
