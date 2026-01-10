import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { applicationTopBarStyles as styles } from "./styles";

export function TopBar({
  theme,
  title,
  onBack,

  languageLabel,
  onOpenLanguage,
}: {
  theme: Theme;
  title: string;
  onBack: () => void;

  languageLabel?: string;
  onOpenLanguage?: () => void;
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

      {languageLabel && onOpenLanguage ? (
        <Pressable
          onPress={onOpenLanguage}
          style={({ pressed }) => [
            styles.langBtn,
            {
              borderColor: theme.border,
              backgroundColor: pressed ? theme.background : "transparent",
            },
          ]}
        >
          <Text style={{ color: theme.textSecondary, fontWeight: "800", letterSpacing: 0.4 }}>
            {languageLabel}
          </Text>
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}
