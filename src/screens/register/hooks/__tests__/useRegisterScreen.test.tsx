import { act, renderHook } from "@testing-library/react-native";

import { useRegisterScreen } from "../useRegisterScreen";
import { notificationsActions } from "../../../../ui/notifications";

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

type RegisterArgs = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  language: SupportedLocale;
};

type TOptions = {
  defaultValue?: string;
  count?: number;
};

type TFunction = (key: string, opts?: TOptions) => string;

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

type Nav = {
  canGoBack: jest.Mock<boolean, []>;
  goBack: jest.Mock<void, []>;
  reset: jest.Mock<void, [unknown]>;
  replace: jest.Mock<void, [string, unknown?]>;
};

const mockNav: Nav = {
  canGoBack: jest.fn(() => true),
  goBack: jest.fn(),
  reset: jest.fn(),
  replace: jest.fn(),
};

let mockRouteParams: RouteParams = undefined;

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNav,
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock("../../../../app/ThemeProvider", () => {
  const React = require("react") as typeof import("react");

  return {
    ThemeContext: React.createContext<{ theme: unknown }>({ theme: undefined }),
  };
});

const mockDispatch: jest.MockedFunction<(action: unknown) => unknown> = jest.fn();

let mockSelectorState: RootState = { auth: { language: "en" } };

jest.mock("../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: <T,>(sel: (state: RootState) => T) => sel(mockSelectorState),
}));

const mockUnwrap = jest.fn<Promise<unknown>, [RegisterArgs]>();

jest.mock("../../../../features/auth/authApi", () => ({
  useRegisterCandidateMutation: () => [
    (args: RegisterArgs) => ({
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

type FetchBaseQueryErrorLike = {
  __fbq?: boolean;
  data?: unknown;
};

jest.mock("../../../../types/api", () => ({
  isFetchBaseQueryError: (e: unknown) => {
    if (typeof e !== "object" || e === null) return false;
    return Boolean((e as FetchBaseQueryErrorLike).__fbq);
  },
  getFetchErrorData: (e: unknown) => {
    if (typeof e !== "object" || e === null) return undefined;
    return (e as FetchBaseQueryErrorLike).data;
  },
}));

describe("useRegisterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectorState = { auth: { language: "en" } };
    mockRouteParams = undefined;
    mockNav.canGoBack.mockReturnValue(true);
  });

  test("canSubmit is false initially and becomes true when all fields set", () => {
    const { result } = renderHook(() => useRegisterScreen());

    expect(result.current.canSubmit).toBe(false);

    act(() => {
      result.current.setFirstName("John");
      result.current.setLastName("Doe");
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });

    expect(result.current.canSubmit).toBe(true);
  });

  test("submit success resets navigation to MainTabs by default", async () => {
    mockUnwrap.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useRegisterScreen());

    act(() => {
      result.current.setFirstName(" John ");
      result.current.setLastName(" Doe ");
      result.current.setEmail(" a@b.com ");
      result.current.setPassword("secret");
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockUnwrap).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "secret",
      firstName: "John",
      lastName: "Doe",
      language: "en",
    });

    expect(mockNav.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "MainTabs" }] });
  });

  test("submit success redirects to VacancyDetails when route params ask for it", async () => {
    mockRouteParams = { redirect: "VacancyDetails", params: { vacancyId: "v1" } };
    mockUnwrap.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useRegisterScreen());

    act(() => {
      result.current.setFirstName("John");
      result.current.setLastName("Doe");
      result.current.setEmail("a@b.com");
      result.current.setPassword("secret");
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockNav.reset).toHaveBeenCalledWith({
      index: 1,
      routes: [{ name: "MainTabs" }, { name: "VacancyDetails", params: { vacancyId: "v1" } }],
    });
  });

  test("email conflict pushes specific error toast", async () => {
    mockUnwrap.mockRejectedValueOnce({
      __fbq: true,
      status: 409,
      data: { code: "EMAIL_CONFLICT" },
    });

    const { result } = renderHook(() => useRegisterScreen());

    act(() => {
      result.current.setFirstName("John");
      result.current.setLastName("Doe");
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

  test("onSelectLanguage changes language and persists session", async () => {
    const { result } = renderHook(() => useRegisterScreen());

    await act(async () => {
      await result.current.onSelectLanguage("ru");
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith("ru");
    expect(mockPersistSession).toHaveBeenCalledWith({ language: "ru" });
  });

  test("goLogin replaces to Login with redirect", () => {
    mockRouteParams = { redirect: "MyApplications" };

    const { result } = renderHook(() => useRegisterScreen());

    act(() => {
      result.current.goLogin();
    });

    expect(mockNav.replace).toHaveBeenCalledWith("Login", { redirect: "MyApplications" });
  });
});
