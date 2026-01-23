import React from "react";
import { render } from "@testing-library/react-native";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import type { TFunction } from "i18next";
import { getMainTabOptions, getMainTabsScreenOptions } from "../tabs/tabOptions";

type TMock = TFunction<"translation", undefined>;

type TabBarIconFn = NonNullable<BottomTabNavigationOptions["tabBarIcon"]>;
type TabBarIconProps = Parameters<TabBarIconFn>[0];

describe("navigation/tabs/tabOptions", () => {
  it("getMainTabsScreenOptions returns base tab options", () => {
    const opts = getMainTabsScreenOptions();

    expect(opts.headerShown).toBe(false);
    expect(opts.tabBarLabelStyle).toEqual({ fontSize: 11, fontWeight: "600" });
  });

  it("getMainTabOptions returns HomeTab options with title and icon", () => {
    const t: TMock = jest.fn(
      (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
    ) as unknown as TMock;

    const opts = getMainTabOptions({ routeName: "HomeTab", t });

    expect(t).toHaveBeenCalledWith("navigation.home", { defaultValue: "Home" });
    expect(opts.title).toBe("Home");
    expect(typeof opts.tabBarIcon).toBe("function");

    const iconProps: TabBarIconProps = {
      focused: false,
      color: "",
      size: 0,
    };

    const Icon = opts.tabBarIcon?.(iconProps);
    const { getByText } = render(<>{Icon}</>);
    expect(getByText("🏠")).toBeTruthy();
  });

  it("getMainTabOptions returns ProfileTab options with title and icon", () => {
    const t: TMock = jest.fn(
      (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
    ) as unknown as TMock;

    const opts = getMainTabOptions({ routeName: "ProfileTab", t });

    expect(t).toHaveBeenCalledWith("navigation.profile", { defaultValue: "Profile" });
    expect(opts.title).toBe("Profile");
    expect(typeof opts.tabBarIcon).toBe("function");

    const iconProps: TabBarIconProps = {
      focused: false,
      color: "",
      size: 0,
    };

    const Icon = opts.tabBarIcon?.(iconProps);
    const { getByText } = render(<>{Icon}</>);
    expect(getByText("👤")).toBeTruthy();
  });

  it("getMainTabOptions returns empty object for unknown route", () => {
    const t: TMock = jest.fn(
      (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
    ) as unknown as TMock;

    const opts = getMainTabOptions({ routeName: "Unknown", t });

    expect(opts).toEqual({});
  });
});
