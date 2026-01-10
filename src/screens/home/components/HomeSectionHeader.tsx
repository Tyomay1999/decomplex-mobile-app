import React, { JSX } from "react";
import { Text, View } from "react-native";
import { sectionHeaderStyles as styles } from "./styles";

type Props = {
  title: string;
  countLabel: string;
  theme: {
    textPrimary: string;
    textSecondary: string;
  };
};

export function HomeSectionHeader(props: Props): JSX.Element {
  const { title, countLabel, theme } = props;

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.sectionCount, { color: theme.textSecondary }]}>{countLabel}</Text>
    </View>
  );
}
