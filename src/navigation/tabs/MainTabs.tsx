import React, { JSX } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { HomeStackParamList, MainTabsParamList } from "../types";
import { HomeScreen } from "../../screens/home";
import { ProfileScreen } from "../../screens/profile";
import { getMainTabOptions, getMainTabsScreenOptions } from "./tabOptions";

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator(): JSX.Element {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

const Tabs = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs(): JSX.Element {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      screenOptions={(ctx) => ({
        ...getMainTabsScreenOptions(),
        ...getMainTabOptions({ routeName: ctx.route.name, t }),
      })}
    >
      <Tabs.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tabs.Screen name="ProfileTab" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
