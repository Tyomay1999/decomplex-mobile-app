import React from "react";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import type { TFunction } from "i18next";

type ScreenOptionsArgs = {
  routeName: string;
  t: TFunction;
};

function tabIcon(routeName: string): string {
  if (routeName === "HomeTab") return "🏠";
  if (routeName === "ProfileTab") return "👤";
  return "•";
}

export function getMainTabsScreenOptions(): BottomTabNavigationOptions {
  return {
    headerShown: false,
    tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
  };
}

export function getMainTabOptions(args: ScreenOptionsArgs): BottomTabNavigationOptions {
  const { routeName, t } = args;

  if (routeName === "HomeTab") {
    return {
      title: String(t("navigation.home", { defaultValue: "Home" })),
      tabBarIcon: () => <Text style={{ fontSize: 22 }}>{tabIcon(routeName)}</Text>,
    };
  }

  if (routeName === "ProfileTab") {
    return {
      title: String(t("navigation.profile", { defaultValue: "Profile" })),
      tabBarIcon: () => <Text style={{ fontSize: 22 }}>{tabIcon(routeName)}</Text>,
    };
  }

  return {};
}
