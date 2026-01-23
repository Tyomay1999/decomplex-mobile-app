import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";

import { renderWithProviders } from "../../../test/render";
import { LoginScreen } from "../LoginScreen";

import { persistSession } from "../../../storage/sessionStorage";

type LoginArg = { email: string; password: string; rememberUser: boolean };

type LoginCallResult = { unwrap: () => Promise<unknown> };
type LoginFn = (arg: LoginArg) => LoginCallResult;

const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockGoBack = jest.fn();

const mockLoginFn = jest.fn<LoginCallResult, [LoginArg]>();
const mockUnwrap = jest.fn<Promise<unknown>, []>();

jest.mock("@react-navigation/native", () => {
  const actual: unknown = jest.requireActual("@react-navigation/native");
  return {
    ...(actual as Record<string, unknown>),
    useNavigation: () => ({
      navigate: mockNavigate,
      reset: mockReset,
      canGoBack: mockCanGoBack,
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: undefined,
    }),
  };
});

jest.mock("../../../features/auth/authApi", () => {
  return {
    useLoginMutation: () => {
      const fn: LoginFn = (arg) => mockLoginFn(arg);
      return [fn, { isLoading: false }] as const;
    },
  };
});

jest.mock("../../../storage/sessionStorage", () => {
  const actual: unknown = jest.requireActual("../../../storage/sessionStorage");
  return {
    ...(actual as Record<string, unknown>),
    persistSession: jest.fn(async () => undefined),
  };
});

function setLoginSuccess(): void {
  mockUnwrap.mockResolvedValueOnce({});
  mockLoginFn.mockReturnValueOnce({ unwrap: mockUnwrap });
}

function setLoginError(): void {
  mockUnwrap.mockRejectedValueOnce(new Error("fail"));
  mockLoginFn.mockReturnValueOnce({ unwrap: mockUnwrap });
}

beforeEach(() => {
  mockNavigate.mockClear();
  mockReset.mockClear();
  mockGoBack.mockClear();
  mockLoginFn.mockClear();
  mockUnwrap.mockClear();
  (persistSession as unknown as jest.Mock).mockClear();
});

test("login success: calls mutation and resets to MainTabs", async () => {
  setLoginSuccess();

  const { getByTestId, store } = renderWithProviders(<LoginScreen />);

  fireEvent.changeText(getByTestId("login.email"), "test@mail.com");
  fireEvent.changeText(getByTestId("login.password"), "123");
  fireEvent.press(getByTestId("login.submit"));

  await waitFor(() => {
    expect(mockLoginFn).toHaveBeenCalledTimes(1);
  });

  expect(mockLoginFn).toHaveBeenCalledWith({
    email: "test@mail.com",
    password: "123",
    rememberUser: false,
  });

  await waitFor(() => {
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "MainTabs" }] });
  expect(store.getState().notifications.queue.length).toBe(0);
});

test("login error: pushes error notification", async () => {
  setLoginError();

  const { getByTestId, store } = renderWithProviders(<LoginScreen />);

  fireEvent.changeText(getByTestId("login.email"), "test@mail.com");
  fireEvent.changeText(getByTestId("login.password"), "bad");
  fireEvent.press(getByTestId("login.submit"));

  await waitFor(() => {
    expect(mockLoginFn).toHaveBeenCalledTimes(1);
  });

  await waitFor(() => {
    expect(store.getState().notifications.queue.length).toBe(1);
  });

  const [toast] = store.getState().notifications.queue;
  expect(toast.kind).toBe("error");
});

test("language change: opens menu and persists language", async () => {
  const { getByTestId, getByText, store } = renderWithProviders(<LoginScreen />, {
    language: "en",
  });

  fireEvent.press(getByTestId("login.openLanguage"));
  fireEvent.press(getByText("Русский"));

  await waitFor(() => {
    expect(persistSession as unknown as jest.Mock).toHaveBeenCalledTimes(1);
  });

  expect(persistSession as unknown as jest.Mock).toHaveBeenCalledWith({ language: "ru" });
  expect(store.getState().auth.language).toBe("ru");
});
