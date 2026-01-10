import React, { JSX } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  MyApplicationsScreen,
  VacancyDetailsScreen,
  LoginScreen,
  RegisterScreen,
} from "../screens";
import { MainTabs } from "./tabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="VacancyDetails" component={VacancyDetailsScreen} />
      <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
