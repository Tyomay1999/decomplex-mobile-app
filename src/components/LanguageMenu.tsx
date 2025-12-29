import React from "react";
import { Modal, Pressable, StyleSheet, Text } from "react-native";
import type { Locale } from "../storage/sessionStorage";
import type { Theme } from "../app/theme";

type LanguageOption = { value: Locale; label: string };

const OPTIONS: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "hy", label: "Հայերեն" },
];

type ThemeTokens = Pick<Theme, "surface" | "border" | "textPrimary" | "textSecondary" | "primary">;

type Props = {
  visible: boolean;
  value: Locale;
  title: string;
  cancelLabel: string;
  onClose: () => void;
  onSelect: (next: Locale) => void;
  theme?: ThemeTokens;
};

export function LanguageMenu({
  visible,
  value,
  title,
  cancelLabel,
  onClose,
  onSelect,
  theme,
}: Props): React.JSX.Element {
  const t = theme ?? {
    surface: "#FFFFFF",
    border: "rgba(0,0,0,0.10)",
    textPrimary: "#171717",
    textSecondary: "#737373",
    primary: "#3B82F6",
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: t.surface, borderColor: t.border }]}
          onPress={() => undefined}
        >
          <Text style={[styles.title, { color: t.textSecondary }]}>{title}</Text>

          {OPTIONS.map((opt) => {
            const active = opt.value === value;

            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.item,
                  { borderColor: active ? t.primary : t.border, backgroundColor: t.surface },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.itemText, { color: active ? t.primary : t.textPrimary }]}>
                  {opt.label}
                </Text>

                <Text style={[styles.check, { color: t.primary, opacity: active ? 1 : 0 }]}>✓</Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancel,
              { borderColor: t.border, backgroundColor: t.surface },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.cancelText, { color: t.textPrimary }]}>{cancelLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  item: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    marginBottom: 10,
  },
  pressed: { opacity: 0.85 },
  itemText: { fontSize: 16, fontWeight: "600" },
  check: { width: 24, textAlign: "right", fontSize: 18, fontWeight: "900" },
  cancel: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderWidth: 1,
  },
  cancelText: { fontSize: 16, fontWeight: "700" },
});
