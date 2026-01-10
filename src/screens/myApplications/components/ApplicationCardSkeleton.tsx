import React, { JSX, useMemo } from "react";
import { View } from "react-native";
import type { Theme } from "../../../app/theme";
import { applicationCardStyles as styles } from "./styles";

type Props = {
  theme: Theme;
};

export function ApplicationCardSkeleton({ theme }: Props): JSX.Element {
  const block = useMemo(
    () => ({
      backgroundColor: theme.border,
      borderRadius: 10,
      opacity: 0.6,
    }),
    [theme.border],
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[block, { height: 18, width: "82%" }]} />
      <View style={[block, { height: 14, width: "58%", marginTop: 10 }]} />
      <View style={[block, { height: 14, width: "46%", marginTop: 8 }]} />
      <View style={[block, { height: 14, width: "66%", marginTop: 8 }]} />
      <View style={[block, { height: 10, width: "28%", marginTop: 14, opacity: 0.45 }]} />
    </View>
  );
}
