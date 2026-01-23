import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { topBarStyles as styles } from "./styles";

export function TopBar({
  theme,
  title,
  languageLabel,
  onBack,
  onOpenLanguage,
  languageTestId,
}: {
  theme?: Theme;
  title: string;
  languageLabel: string;
  onBack: () => void;
  onOpenLanguage: () => void;
  languageTestId?: string;
}): JSX.Element {
  const border = theme?.border ?? "rgba(0,0,0,0.12)";
  const surface = theme?.surface ?? "#FFFFFF";
  const textPrimary = theme?.textPrimary ?? "#171717";

  return (
    <View style={[styles.topBar, { borderColor: border, backgroundColor: surface }]}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.topBtn, pressed && { opacity: 0.85 }]}
      >
        <Text style={[styles.topBtnText, { color: textPrimary }]}>‹</Text>
      </Pressable>

      <Text style={[styles.topTitle, { color: textPrimary }]} numberOfLines={1}>
        {title}
      </Text>

      <Pressable
        testID={languageTestId}
        onPress={onOpenLanguage}
        style={[styles.langBtn, { borderColor: border, backgroundColor: surface }]}
      >
        <Text style={[styles.langText, { color: textPrimary }]}>{languageLabel}</Text>
      </Pressable>
    </View>
  );
}
