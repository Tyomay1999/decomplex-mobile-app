import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { TFunction } from "i18next";

import { LoginForm } from "../LoginForm";

const t: TFunction = ((key: string, options?: { defaultValue?: unknown; count?: number }) => {
  if (options?.defaultValue != null) return String(options.defaultValue);
  return key;
}) as unknown as TFunction;

describe("LoginForm", () => {
  test("renders inputs and buttons", () => {
    const onSubmit: jest.MockedFunction<() => Promise<void>> = jest.fn(async () => undefined);

    const r = render(
      <LoginForm
        t={t}
        email=""
        password=""
        rememberUser={false}
        onToggleRememberUser={() => undefined}
        onChangeEmail={() => undefined}
        onChangePassword={() => undefined}
        onSubmit={onSubmit}
        loading={false}
        canSubmit={false}
        placeholderColor="#999"
        onGoRegister={() => undefined}
      />,
    );

    expect(r.getByTestId("login.email")).toBeTruthy();
    expect(r.getByTestId("login.password")).toBeTruthy();
    expect(r.getByTestId("login.remember")).toBeTruthy();
    expect(r.getByTestId("login.submit")).toBeTruthy();
  });

  test("calls change handlers and toggles remember", () => {
    const onChangeEmail: jest.MockedFunction<(value: string) => void> = jest.fn();
    const onChangePassword: jest.MockedFunction<(value: string) => void> = jest.fn();
    const onToggleRememberUser: jest.MockedFunction<() => void> = jest.fn();

    const r = render(
      <LoginForm
        t={t}
        email=""
        password=""
        rememberUser={false}
        onToggleRememberUser={onToggleRememberUser}
        onChangeEmail={onChangeEmail}
        onChangePassword={onChangePassword}
        onSubmit={async () => undefined}
        loading={false}
        canSubmit={false}
        placeholderColor="#999"
        onGoRegister={() => undefined}
      />,
    );

    fireEvent.changeText(r.getByTestId("login.email"), "a@b.com");
    fireEvent.changeText(r.getByTestId("login.password"), "secret");
    fireEvent.press(r.getByTestId("login.remember"));

    expect(onChangeEmail).toHaveBeenCalledWith("a@b.com");
    expect(onChangePassword).toHaveBeenCalledWith("secret");
    expect(onToggleRememberUser).toHaveBeenCalledTimes(1);
  });

  test("submit is disabled when canSubmit=false or loading=true", () => {
    const onSubmit: jest.MockedFunction<() => Promise<void>> = jest.fn(async () => undefined);

    const r1 = render(
      <LoginForm
        t={t}
        email="a@b.com"
        password="secret"
        rememberUser={false}
        onToggleRememberUser={() => undefined}
        onChangeEmail={() => undefined}
        onChangePassword={() => undefined}
        onSubmit={onSubmit}
        loading={false}
        canSubmit={false}
        placeholderColor="#999"
        onGoRegister={() => undefined}
      />,
    );

    fireEvent.press(r1.getByTestId("login.submit"));
    expect(onSubmit).not.toHaveBeenCalled();

    const r2 = render(
      <LoginForm
        t={t}
        email="a@b.com"
        password="secret"
        rememberUser={false}
        onToggleRememberUser={() => undefined}
        onChangeEmail={() => undefined}
        onChangePassword={() => undefined}
        onSubmit={onSubmit}
        loading={true}
        canSubmit={true}
        placeholderColor="#999"
        onGoRegister={() => undefined}
      />,
    );

    fireEvent.press(r2.getByTestId("login.submit"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("pressing submit calls onSubmit when enabled", () => {
    const onSubmit: jest.MockedFunction<() => Promise<void>> = jest.fn(async () => undefined);

    const r = render(
      <LoginForm
        t={t}
        email="a@b.com"
        password="secret"
        rememberUser={false}
        onToggleRememberUser={() => undefined}
        onChangeEmail={() => undefined}
        onChangePassword={() => undefined}
        onSubmit={onSubmit}
        loading={false}
        canSubmit={true}
        placeholderColor="#999"
        onGoRegister={() => undefined}
      />,
    );

    fireEvent.press(r.getByTestId("login.submit"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
