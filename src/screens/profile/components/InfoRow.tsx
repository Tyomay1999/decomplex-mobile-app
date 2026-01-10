import React, { JSX } from "react";
import { Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { cardStyles as styles } from "./styles";

type Props = {
  label: string;
  value: string;
  theme: Theme;
};

export function InfoRow(props: Props): JSX.Element {
  const { label, value, theme } = props;

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.textSecondary, fontSize: 15 }}>{label}</Text>
      <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}
