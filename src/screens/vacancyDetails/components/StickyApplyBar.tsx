import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { stickyApplyStyles as styles } from "./styles";

export function StickyApplyBar({
  theme,
  label,
  disabled,
  onPress,
}: {
  theme: Theme;
  label: string;
  disabled: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <View style={[styles.sticky, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: theme.primary,
            opacity: disabled ? 0.55 : pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[styles.text, { color: theme.surface }]}>{label}</Text>
      </Pressable>
    </View>
  );
}
