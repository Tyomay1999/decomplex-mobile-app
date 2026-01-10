import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import { actionsStyles as styles } from "./styles";

type Props = {
  hint: string;
  loginLabel: string;
  registerLabel: string;
  onLogin: () => void;
  onRegister: () => void;
  theme: {
    primary: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
  };
};

export function GuestActions(props: Props): JSX.Element {
  const { hint, loginLabel, registerLabel, onLogin, onRegister, theme } = props;

  return (
    <View style={styles.actionsWrap}>
      <View style={styles.lockWrap}>
        <Text style={{ fontSize: 56, opacity: 0.35 }}>🔒</Text>
        <Text style={{ color: theme.textSecondary, marginTop: 12 }}>{hint}</Text>
      </View>

      <Pressable
        onPress={onLogin}
        style={({ pressed }) => [
          styles.primaryBtn,
          { backgroundColor: theme.primary },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 17 }}>{loginLabel}</Text>
      </Pressable>

      <Pressable
        onPress={onRegister}
        style={({ pressed }) => [
          styles.secondaryBtn,
          { borderColor: theme.border },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={{ color: theme.textPrimary, fontWeight: "700", fontSize: 17 }}>
          {registerLabel}
        </Text>
      </Pressable>
    </View>
  );
}
