import React, { JSX, useEffect } from "react";
import { Keyboard, Modal, Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import type { SortKey } from "../hooks";
import { applicationModalStyles as styles } from "./styles";

function SortChip({
  theme,
  active,
  label,
  onPress,
}: {
  theme: Theme;
  active: boolean;
  label: string;
  onPress: () => void;
}): JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sortChip,
        {
          borderColor: active ? theme.primary : theme.border,
          backgroundColor: active ? theme.background : pressed ? theme.background : "transparent",
        },
      ]}
    >
      <Text style={{ color: theme.textPrimary, fontWeight: "900", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function FiltersModal({
  theme,
  t,
  visible,
  onClose,
  sortKey,
  onChangeSort,
  onClear,
  onApply,
}: {
  theme: Theme;
  t: TFunction;
  visible: boolean;
  onClose: () => void;
  sortKey: SortKey;
  onChangeSort: (v: SortKey) => void;
  onClear: () => void;
  onApply: () => void;
}): JSX.Element {
  useEffect(() => {
    if (visible) Keyboard.dismiss();
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleClear = () => {
    Keyboard.dismiss();
    onClear();
  };

  const handleApply = () => {
    Keyboard.dismiss();
    onApply();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={styles.header}>
            <Text style={{ color: theme.textPrimary, fontWeight: "900", fontSize: 18 }}>
              {t("profile.filters", { defaultValue: "Filters" })}
            </Text>

            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.close,
                { backgroundColor: pressed ? theme.background : "transparent" },
              ]}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 18 }}>✕</Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { color: theme.textTertiary }]}>
            {t("profile.sortBy", { defaultValue: "Sort by" })}
          </Text>

          <View style={styles.chipsRow}>
            <SortChip
              theme={theme}
              active={sortKey === "time_desc"}
              label={String(t("profile.sortNewest", { defaultValue: "Newest" }))}
              onPress={() => onChangeSort("time_desc")}
            />
            <SortChip
              theme={theme}
              active={sortKey === "time_asc"}
              label={String(t("profile.sortOldest", { defaultValue: "Oldest" }))}
              onPress={() => onChangeSort("time_asc")}
            />
            <SortChip
              theme={theme}
              active={sortKey === "title_asc"}
              label={String(t("profile.sortTitleAz", { defaultValue: "Title A–Z" }))}
              onPress={() => onChangeSort("title_asc")}
            />
            <SortChip
              theme={theme}
              active={sortKey === "title_desc"}
              label={String(t("profile.sortTitleZa", { defaultValue: "Title Z–A" }))}
              onPress={() => onChangeSort("title_desc")}
            />
            <SortChip
              theme={theme}
              active={sortKey === "location_asc"}
              label={String(t("profile.sortLocationAz", { defaultValue: "Location" }))}
              onPress={() => onChangeSort("location_asc")}
            />
          </View>

          <View style={{ height: 16 }} />

          <View style={styles.actions}>
            <Pressable
              onPress={handleClear}
              style={({ pressed }) => [
                styles.btn,
                {
                  borderColor: theme.border,
                  backgroundColor: pressed ? theme.background : "transparent",
                },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: "900" }}>
                {t("profile.clearFilters", { defaultValue: "Clear" })}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={{ color: theme.surface, fontWeight: "900" }}>
                {t("profile.applyFilters", { defaultValue: "Apply" })}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
