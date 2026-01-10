import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { statesStyles as styles } from "./styles";

export function ScreenLoading({ theme, label }: { theme: Theme; label: string }): JSX.Element {
  return (
    <View style={styles.box}>
      <Text style={{ color: theme.textSecondary }}>{label}</Text>
    </View>
  );
}

export function ScreenError({
  theme,
  label,
  retryLabel,
  onRetry,
}: {
  theme: Theme;
  label: string;
  retryLabel: string;
  onRetry: () => void;
}): JSX.Element {
  return (
    <View style={styles.box}>
      <Text style={{ color: theme.textSecondary }}>{label}</Text>
      <Pressable onPress={onRetry} style={{ marginTop: 10 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>{retryLabel}</Text>
      </Pressable>
    </View>
  );
}
