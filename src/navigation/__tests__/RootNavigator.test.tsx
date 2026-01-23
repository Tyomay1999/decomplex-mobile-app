import React from "react";
import { render } from "@testing-library/react-native";
import { RootNavigator } from "../RootNavigator";

const screenCalls: Array<{ name: string; component: unknown }> = [];

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: ({ name, component }: { name: string; component: unknown }) => {
      screenCalls.push({ name, component });
      return null;
    },
  }),
}));

jest.mock("../tabs", () => ({
  MainTabs: () => null,
}));

jest.mock("../../screens", () => ({
  MyApplicationsScreen: () => null,
  VacancyDetailsScreen: () => null,
  LoginScreen: () => null,
  RegisterScreen: () => null,
}));

describe("navigation/RootNavigator", () => {
  beforeEach(() => {
    screenCalls.length = 0;
  });

  it("registers expected screens in the root stack", () => {
    render(<RootNavigator />);

    const names = screenCalls.map((x) => x.name);

    expect(names).toEqual(["MainTabs", "VacancyDetails", "MyApplications", "Login", "Register"]);
  });
});
