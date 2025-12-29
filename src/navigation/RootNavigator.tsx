import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthDebugScreen } from "../screens/AuthDebugScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { MainTabs } from "./MainTabs";

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  Debug: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Debug" component={AuthDebugScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
