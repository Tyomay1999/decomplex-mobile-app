import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootState } from "../../store/store";
import type { RootStackParamList, AuthRedirect } from "../../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type RequireAuthOptions = {
  redirect?: AuthRedirect;
};

export function useRequireAuth(): {
  requireAuth: (opts?: RequireAuthOptions) => boolean;
  bootstrapped: boolean;
  user: RootState["auth"]["user"];
} {
  const navigation = useNavigation<Nav>();
  const bootstrapped = useSelector((s: RootState) => s.auth.bootstrapped);
  const user = useSelector((s: RootState) => s.auth.user);

  const requireAuth = useCallback(
    (opts?: RequireAuthOptions) => {
      if (!bootstrapped) return false;

      if (!user) {
        navigation.navigate("Login", opts?.redirect ?? { redirect: "MainTabs" });
        return false;
      }

      return true;
    },
    [bootstrapped, user, navigation],
  );

  return { requireAuth, bootstrapped, user };
}
