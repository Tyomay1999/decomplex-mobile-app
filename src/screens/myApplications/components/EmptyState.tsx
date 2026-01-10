import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { applicationEmptyStyles as styles } from "./styles";

export function EmptyState({
  theme,
  title,
  subtitle,
  primaryLabel,
  onPrimary,
}: {
  theme: Theme;
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimary: () => void;
}): JSX.Element {
  return (
    <View style={styles.wrap}>
      <View
        style={[styles.iconWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text style={{ fontSize: 34 }}>📥</Text>
      </View>

      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onPrimary}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={{ color: theme.surface, fontWeight: "900" }}>{primaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
