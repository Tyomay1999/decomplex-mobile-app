import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

export function AuthDebugScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Decomplex RN Debug</Text>

      <Pressable
        style={{
          height: 48,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
        }}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={{ fontWeight: "600" }}>LOGIN</Text>
      </Pressable>

      <Pressable
        style={{
          height: 48,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
        }}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={{ fontWeight: "600" }}>REGISTER</Text>
      </Pressable>
    </View>
  );
}
