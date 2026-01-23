import React from "react";
import { render } from "@testing-library/react-native";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { MainTabs } from "../tabs/MainTabs";

type RouteContext = {
  route: {
    name: string;
  };
};

const tabScreens: string[] = [];
let capturedScreenOptions: ((ctx: RouteContext) => BottomTabNavigationOptions) | undefined;

const mockGetMainTabOptions = jest.fn<
  BottomTabNavigationOptions,
  [{ routeName: string; t: (key: string, opts?: { defaultValue?: string }) => string }]
>(() => ({}));

const mockGetMainTabsScreenOptions = jest.fn<BottomTabNavigationOptions, []>(() => ({
  headerShown: false,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
  }),
}));

jest.mock("@react-navigation/bottom-tabs", () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({
      children,
      screenOptions,
    }: {
      children: React.ReactNode;
      screenOptions?: (ctx: RouteContext) => BottomTabNavigationOptions;
    }) => {
      capturedScreenOptions = screenOptions;
      return <>{children}</>;
    },
    Screen: ({ name }: { name: string }) => {
      tabScreens.push(name);
      return null;
    },
  }),
}));

jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: () => null,
  }),
}));

jest.mock("../../screens/home", () => ({
  HomeScreen: () => null,
}));

jest.mock("../../screens/profile", () => ({
  ProfileScreen: () => null,
}));

jest.mock("../tabs/tabOptions", () => ({
  getMainTabOptions: (args: {
    routeName: string;
    t: (key: string, opts?: { defaultValue?: string }) => string;
  }) => mockGetMainTabOptions(args),
  getMainTabsScreenOptions: () => mockGetMainTabsScreenOptions(),
}));

describe("navigation/tabs/MainTabs", () => {
  beforeEach(() => {
    tabScreens.length = 0;
    capturedScreenOptions = undefined;
    mockGetMainTabOptions.mockClear();
    mockGetMainTabsScreenOptions.mockClear();
  });

  it("registers HomeTab and ProfileTab screens", () => {
    render(<MainTabs />);
    expect(tabScreens).toEqual(["HomeTab", "ProfileTab"]);
  });

  it("screenOptions composes base options with route-specific options", () => {
    render(<MainTabs />);

    expect(typeof capturedScreenOptions).toBe("function");

    capturedScreenOptions?.({ route: { name: "HomeTab" } });

    expect(mockGetMainTabsScreenOptions).toHaveBeenCalledTimes(1);
    expect(mockGetMainTabOptions).toHaveBeenCalledTimes(1);
    expect(mockGetMainTabOptions.mock.calls[0]?.[0]?.routeName).toBe("HomeTab");
  });
});
