import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";

import { renderWithProviders } from "../../../test/render";
import { RegisterScreen } from "../RegisterScreen";

import { persistSession } from "../../../storage/sessionStorage";

type RegisterArg = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  language: string;
};

type CallResult = { unwrap: () => Promise<unknown> };
type Fn = (arg: RegisterArg) => CallResult;

const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockGoBack = jest.fn();

const mockRegisterFn = jest.fn<CallResult, [RegisterArg]>();
const mockUnwrap = jest.fn<Promise<unknown>, []>();

jest.mock("@react-navigation/native", () => {
  const actual: unknown = jest.requireActual("@react-navigation/native");
  return {
    ...(actual as Record<string, unknown>),
    useNavigation: () => ({
      navigate: mockNavigate,
      reset: mockReset,
      replace: mockReplace,
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
    useRegisterCandidateMutation: () => {
      const fn: Fn = (arg) => mockRegisterFn(arg);
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

function setRegisterSuccess(): void {
  mockUnwrap.mockResolvedValueOnce({});
  mockRegisterFn.mockReturnValueOnce({ unwrap: mockUnwrap });
}

function setRegisterError(): void {
  mockUnwrap.mockRejectedValueOnce(new Error("fail"));
  mockRegisterFn.mockReturnValueOnce({ unwrap: mockUnwrap });
}

beforeEach(() => {
  mockNavigate.mockClear();
  mockReset.mockClear();
  mockReplace.mockClear();
  mockGoBack.mockClear();
  mockRegisterFn.mockClear();
  mockUnwrap.mockClear();
  (persistSession as unknown as jest.Mock).mockClear();
});

test("register success: calls mutation and resets to MainTabs", async () => {
  setRegisterSuccess();

  const { getByTestId, store } = renderWithProviders(<RegisterScreen />, { language: "en" });

  fireEvent.changeText(getByTestId("register.firstName"), "John");
  fireEvent.changeText(getByTestId("register.lastName"), "Doe");
  fireEvent.changeText(getByTestId("register.email"), "test@mail.com");
  fireEvent.changeText(getByTestId("register.password"), "123");
  fireEvent.press(getByTestId("register.submit"));

  await waitFor(() => {
    expect(mockRegisterFn).toHaveBeenCalledTimes(1);
  });

  expect(mockRegisterFn).toHaveBeenCalledWith({
    email: "test@mail.com",
    password: "123",
    firstName: "John",
    lastName: "Doe",
    language: "en",
  });

  await waitFor(() => {
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "MainTabs" }] });
  expect(store.getState().notifications.queue.length).toBe(0);
});

test("register error: pushes error notification", async () => {
  setRegisterError();

  const { getByTestId, store } = renderWithProviders(<RegisterScreen />, { language: "en" });

  fireEvent.changeText(getByTestId("register.firstName"), "John");
  fireEvent.changeText(getByTestId("register.lastName"), "Doe");
  fireEvent.changeText(getByTestId("register.email"), "test@mail.com");
  fireEvent.changeText(getByTestId("register.password"), "bad");
  fireEvent.press(getByTestId("register.submit"));

  await waitFor(() => {
    expect(mockRegisterFn).toHaveBeenCalledTimes(1);
  });

  await waitFor(() => {
    expect(store.getState().notifications.queue.length).toBe(1);
  });

  const [toast] = store.getState().notifications.queue;
  expect(toast.kind).toBe("error");
});

test("language change: opens menu and persists language", async () => {
  const { getByTestId, getByText, store } = renderWithProviders(<RegisterScreen />, {
    language: "en",
  });

  fireEvent.press(getByTestId("register.openLanguage"));
  fireEvent.press(getByText("Русский"));

  await waitFor(() => {
    expect(persistSession as unknown as jest.Mock).toHaveBeenCalledTimes(1);
  });

  expect(persistSession as unknown as jest.Mock).toHaveBeenCalledWith({ language: "ru" });
  expect(store.getState().auth.language).toBe("ru");
});
