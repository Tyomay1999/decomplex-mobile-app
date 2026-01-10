import React, { JSX } from "react";
import { Animated, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import type { TFunction } from "i18next";
import { filterSheetStyles as styles } from "./styles";

type Option<T> = { key: string; value: T; label: string };

type Props<T> = {
  visible: boolean;
  onClose: () => void;
  sheetAnim: Animated.Value;
  sheetHeight: number;

  t: TFunction;

  title: string;
  jobTypeLabel: string;

  options: Array<Option<T>>;
  value: T;
  onChange: (v: T) => void;

  salaryOnly: boolean;
  onToggleSalaryOnly: () => void;

  newOnly: boolean;
  onToggleNewOnly: () => void;

  resetLabel: string;
  applyLabel: string;

  onReset: () => void;
  onApply: () => void;

  theme: {
    surface: string;
    border: string;
    background: string;
    primary: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  };

  applyDisabled?: boolean;
};

export function FiltersSheet<T>(props: Props<T>): JSX.Element {
  const {
    visible,
    onClose,
    sheetAnim,
    sheetHeight,
    t,
    title,
    jobTypeLabel,
    options,
    value,
    onChange,
    salaryOnly,
    onToggleSalaryOnly,
    newOnly,
    onToggleNewOnly,
    resetLabel,
    applyLabel,
    onReset,
    onApply,
    theme,
    applyDisabled,
  } = props;

  const iosBottomPad = Platform.OS === "ios" ? 22 : 12;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[
              styles.sheet,
              {
                maxHeight: sheetHeight,
                minHeight: "55%",
                paddingBottom: iosBottomPad,
                backgroundColor: theme.surface,
                borderColor: theme.border,
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [sheetHeight, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.grabberWrap}>
              <View style={[styles.grabber, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={{ color: theme.textSecondary, fontSize: 18 }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
                {jobTypeLabel}
              </Text>

              <View style={styles.chipsRow}>
                {options.map((x) => {
                  const active = value === x.value;

                  return (
                    <Pressable
                      key={x.key}
                      onPress={() => onChange(x.value)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          borderColor: active ? theme.primary : theme.border,
                          backgroundColor: active ? theme.background : "transparent",
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: active ? theme.primary : theme.textSecondary,
                          fontWeight: "800",
                        }}
                      >
                        {x.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ height: 12 }} />

              <Pressable
                onPress={onToggleSalaryOnly}
                style={({ pressed }) => [
                  styles.toggleRow,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: "800" }}>
                  {t("home.filters.salaryOnly", { defaultValue: "Salary only" })}
                </Text>

                <Text style={{ color: theme.textSecondary, fontWeight: "700" }}>
                  {salaryOnly
                    ? t("common.on", { defaultValue: "ON" })
                    : t("common.off", { defaultValue: "OFF" })}
                </Text>
              </Pressable>

              <Pressable
                onPress={onToggleNewOnly}
                style={({ pressed }) => [
                  styles.toggleRow,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: "800" }}>
                  {t("home.filters.newOnly", { defaultValue: "New only" })}
                </Text>

                <Text style={{ color: theme.textSecondary, fontWeight: "700" }}>
                  {newOnly
                    ? t("common.on", { defaultValue: "ON" })
                    : t("common.off", { defaultValue: "OFF" })}
                </Text>
              </Pressable>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                onPress={onReset}
                style={({ pressed }) => [
                  styles.btn,
                  {
                    borderColor: theme.border,
                    backgroundColor: pressed ? theme.background : "transparent",
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: "900" }}>{resetLabel}</Text>
              </Pressable>

              <Pressable
                onPress={onApply}
                disabled={Boolean(applyDisabled)}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  {
                    backgroundColor: theme.primary,
                    opacity: applyDisabled ? 0.55 : pressed ? 0.92 : 1,
                  },
                ]}
              >
                <Text style={{ color: theme.surface, fontWeight: "900" }}>{applyLabel}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
