import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

export type HomeStackParamList = {
  Home: undefined;
  Login?: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator(): React.JSX.Element {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

export type MainTabsParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};

const Tabs = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs(): React.JSX.Element {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? "🏠" : "🏠"}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? "👤" : "👤"}</Text>
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
