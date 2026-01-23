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

type PressEventLike = { stopPropagation?: () => void };

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

  const handleContainerPress = (e?: PressEventLike): void => {
    e?.stopPropagation?.();
  };

  const isApplyDisabled = Boolean(applyDisabled);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable testID="home.filters.overlay" style={styles.overlay} onPress={onClose}>
        <Pressable testID="home.filters.container" onPress={handleContainerPress}>
          <Animated.View
            testID="home.filters.sheet"
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
              <Text
                testID="home.filters.title"
                style={[styles.title, { color: theme.textPrimary }]}
              >
                {title}
              </Text>

              <Pressable testID="home.filters.close" onPress={onClose} style={styles.closeBtn}>
                <Text style={{ color: theme.textSecondary, fontSize: 18 }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              testID="home.filters.scroll"
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text
                testID="home.filters.jobType.label"
                style={[styles.sectionLabel, { color: theme.textTertiary }]}
              >
                {jobTypeLabel}
              </Text>

              <View testID="home.filters.jobType.options" style={styles.chipsRow}>
                {options.map((x) => {
                  const active = value === x.value;

                  return (
                    <Pressable
                      testID={`home.filters.jobType.${x.key}`}
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
                testID="home.filters.salaryOnly"
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

                <Text
                  testID="home.filters.salaryOnly.value"
                  style={{ color: theme.textSecondary, fontWeight: "700" }}
                >
                  {salaryOnly
                    ? t("common.on", { defaultValue: "ON" })
                    : t("common.off", { defaultValue: "OFF" })}
                </Text>
              </Pressable>

              <Pressable
                testID="home.filters.newOnly"
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

                <Text
                  testID="home.filters.newOnly.value"
                  style={{ color: theme.textSecondary, fontWeight: "700" }}
                >
                  {newOnly
                    ? t("common.on", { defaultValue: "ON" })
                    : t("common.off", { defaultValue: "OFF" })}
                </Text>
              </Pressable>
            </ScrollView>

            <View testID="home.filters.actions" style={styles.actions}>
              <Pressable
                testID="home.filters.reset"
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
                testID="home.filters.apply"
                onPress={onApply}
                disabled={isApplyDisabled}
                accessibilityState={{ disabled: isApplyDisabled }}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  {
                    backgroundColor: theme.primary,
                    opacity: isApplyDisabled ? 0.55 : pressed ? 0.92 : 1,
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
