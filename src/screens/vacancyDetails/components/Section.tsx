import React, { JSX } from "react";
import { Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { sectionStyles as styles } from "./styles";

export function Section({
  theme,
  title,
  text,
}: {
  theme: Theme;
  title: string;
  text: string;
}): JSX.Element {
  return (
    <View style={[styles.section, { borderBottomColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>{title}</Text>
      <Text style={[styles.sectionText, { color: theme.textPrimary }]}>{text}</Text>
    </View>
  );
}
