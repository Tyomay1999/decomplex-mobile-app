import React, { JSX, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import { applicationActiveFiltersStyles as styles } from "./styles";

function Chip({
  theme,
  label,
  showX,
  onPress,
}: {
  theme: Theme;
  label: string;
  showX: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: theme.border, backgroundColor: pressed ? theme.background : "transparent" },
      ]}
    >
      <View style={styles.chipContent}>
        <Text style={[styles.chipText, { color: theme.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
        {showX ? <Text style={[styles.chipClose, { color: theme.textSecondary }]}>✕</Text> : null}
      </View>
    </Pressable>
  );
}

export function ActiveFilters({
  theme,
  t,
  sortLabel,
  filtersActive,
  onClearSort,
  onClear,
}: {
  theme: Theme;
  t: TFunction;
  sortLabel: string;
  filtersActive: boolean;
  onClearSort: () => void;
  onClear: () => void;
}): JSX.Element {
  const newestLabel = useMemo(
    () => String(t("profile.sortNewest", { defaultValue: "Newest" })),
    [t],
  );

  const sortIsDefault = sortLabel === newestLabel;

  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
    >
      <Chip theme={theme} label={sortLabel} showX={!sortIsDefault} onPress={onClearSort} />

      {filtersActive ? (
        <Chip
          theme={theme}
          label={String(t("profile.clearFilters", { defaultValue: "Clear" }))}
          showX={false}
          onPress={onClear}
        />
      ) : null}
    </View>
  );
}
