import React, { JSX } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import { applicationSearchHeaderStyles as styles } from "./styles";
import { webNoOutline } from "../../../shared/styles/web";

export function SearchHeader({
  theme,
  t,
  value,
  onChange,
  onSubmit,
  onOpenFilters,
  filtersCount,
}: {
  theme: Theme;
  t: TFunction;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onOpenFilters: () => void;
  filtersCount: number;
}): JSX.Element {
  const hasValue = value.trim().length > 0;

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit();
  };

  const handleClear = () => {
    Keyboard.dismiss();
    onChange("");
  };

  return (
    <View
      style={[styles.wrap, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.searchBox,
            { borderColor: theme.border, backgroundColor: theme.background },
          ]}
        >
          <Text style={[styles.searchIcon, { color: theme.textSecondary }]}>🔍</Text>

          <TextInput
            value={value}
            onChangeText={onChange}
            onSubmitEditing={handleSubmit}
            placeholder={t("profile.searchPlaceholder", { defaultValue: "Search" })}
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.textPrimary }, webNoOutline]}
            returnKeyType="search"
            blurOnSubmit
            autoCorrect={false}
            autoCapitalize="none"
          />

          {hasValue ? (
            <Pressable
              onPress={handleClear}
              hitSlop={12}
              style={({ pressed }) => [
                styles.clearBtn,
                { backgroundColor: pressed ? theme.surface : "transparent" },
              ]}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 18, lineHeight: 18 }}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            onOpenFilters();
          }}
          style={({ pressed }) => [
            styles.filtersBtn,
            {
              borderColor: theme.border,
              backgroundColor: pressed ? theme.background : theme.surface,
            },
          ]}
        >
          <Text style={{ color: theme.textPrimary, fontWeight: "900" }}>
            {t("profile.filters", { defaultValue: "Filters" })}
          </Text>

          {filtersCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.surface, fontWeight: "900", fontSize: 12 }}>
                {filtersCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
