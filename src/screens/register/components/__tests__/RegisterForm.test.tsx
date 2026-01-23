import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { TFunction } from "i18next";

import { RegisterForm } from "../RegisterForm";

const mockT: TFunction = ((key: string, opts?: { defaultValue?: unknown }) => {
  if (opts?.defaultValue != null) return String(opts.defaultValue);
  return key;
}) as unknown as TFunction;

test("renders inputs and submit disabled by default", () => {
  const onChangeFirstName: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangeLastName: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangeEmail: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangePassword: jest.MockedFunction<(value: string) => void> = jest.fn();

  const onSubmit: jest.MockedFunction<() => Promise<void>> = jest.fn(async () => undefined);
  const onGoLogin: jest.MockedFunction<() => void> = jest.fn();

  const { getByTestId } = render(
    <RegisterForm
      t={mockT}
      firstName=""
      lastName=""
      email=""
      password=""
      onChangeFirstName={onChangeFirstName}
      onChangeLastName={onChangeLastName}
      onChangeEmail={onChangeEmail}
      onChangePassword={onChangePassword}
      onSubmit={onSubmit}
      loading={false}
      canSubmit={false}
      placeholderColor="#aaa"
      onGoLogin={onGoLogin}
    />,
  );

  expect(getByTestId("register.firstName")).toBeTruthy();
  expect(getByTestId("register.lastName")).toBeTruthy();
  expect(getByTestId("register.email")).toBeTruthy();
  expect(getByTestId("register.password")).toBeTruthy();

  const submit = getByTestId("register.submit");
  expect(submit.props.accessibilityState?.disabled ?? submit.props.disabled).toBe(true);
});

test("calls change handlers and goLogin", () => {
  const onChangeFirstName: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangeLastName: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangeEmail: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangePassword: jest.MockedFunction<(value: string) => void> = jest.fn();

  const onSubmit: jest.MockedFunction<() => Promise<void>> = jest.fn(async () => undefined);
  const onGoLogin: jest.MockedFunction<() => void> = jest.fn();

  const { getByTestId } = render(
    <RegisterForm
      t={mockT}
      firstName=""
      lastName=""
      email=""
      password=""
      onChangeFirstName={onChangeFirstName}
      onChangeLastName={onChangeLastName}
      onChangeEmail={onChangeEmail}
      onChangePassword={onChangePassword}
      onSubmit={onSubmit}
      loading={false}
      canSubmit={true}
      placeholderColor="#aaa"
      onGoLogin={onGoLogin}
    />,
  );

  fireEvent.changeText(getByTestId("register.firstName"), "John");
  fireEvent.changeText(getByTestId("register.lastName"), "Doe");
  fireEvent.changeText(getByTestId("register.email"), "a@b.com");
  fireEvent.changeText(getByTestId("register.password"), "secret");

  expect(onChangeFirstName).toHaveBeenCalledWith("John");
  expect(onChangeLastName).toHaveBeenCalledWith("Doe");
  expect(onChangeEmail).toHaveBeenCalledWith("a@b.com");
  expect(onChangePassword).toHaveBeenCalledWith("secret");

  fireEvent.press(getByTestId("register.goLogin"));
  expect(onGoLogin).toHaveBeenCalledTimes(1);
});

test("submit calls onSubmit when enabled and not loading", () => {
  const onChangeFirstName: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangeLastName: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangeEmail: jest.MockedFunction<(value: string) => void> = jest.fn();
  const onChangePassword: jest.MockedFunction<(value: string) => void> = jest.fn();

  const onSubmit: jest.MockedFunction<() => Promise<void>> = jest.fn(async () => undefined);
  const onGoLogin: jest.MockedFunction<() => void> = jest.fn();

  const { getByTestId } = render(
    <RegisterForm
      t={mockT}
      firstName="John"
      lastName="Doe"
      email="a@b.com"
      password="secret"
      onChangeFirstName={onChangeFirstName}
      onChangeLastName={onChangeLastName}
      onChangeEmail={onChangeEmail}
      onChangePassword={onChangePassword}
      onSubmit={onSubmit}
      loading={false}
      canSubmit={true}
      placeholderColor="#aaa"
      onGoLogin={onGoLogin}
    />,
  );

  fireEvent.press(getByTestId("register.submit"));
  expect(onSubmit).toHaveBeenCalledTimes(1);
});
