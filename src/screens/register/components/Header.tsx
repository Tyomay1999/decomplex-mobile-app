import React, { JSX } from "react";
import { Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { headerStyles as styles } from "./styles";

export function Header({
  theme,
  title,
  subtitle,
}: {
  theme?: Theme;
  title: string;
  subtitle: string;
}): JSX.Element {
  const textPrimary = theme?.textPrimary ?? "#171717";
  const textSecondary = theme?.textSecondary ?? "#737373";

  return (
    <View style={styles.header}>
      <Text style={[styles.h1, { color: textPrimary }]}>{title}</Text>
      <Text style={[styles.sub, { color: textSecondary }]}>{subtitle}</Text>
    </View>
  );
}
