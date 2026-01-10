import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { topBarStyles as styles } from "./styles";

export function TopBar({
  theme,
  title,
  onBack,
}: {
  theme: Theme;
  title: string;
  onBack: () => void;
}): JSX.Element {
  return (
    <View
      style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
    >
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: pressed ? theme.background : "transparent" },
        ]}
      >
        <Text style={{ fontSize: 22, color: theme.textPrimary }}>‹</Text>
      </Pressable>

      <Text style={[styles.topTitle, { color: theme.textPrimary }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={{ width: 40 }} />
    </View>
  );
}
