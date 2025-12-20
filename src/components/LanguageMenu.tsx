import React from "react";
import { Modal, Pressable, StyleSheet, Text } from "react-native";
import type { Locale } from "../storage/sessionStorage";

type LanguageOption = { value: Locale; label: string };

const OPTIONS: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "hy", label: "Հայերեն" },
];

type Props = {
  visible: boolean;
  value: Locale;
  title: string;
  cancelLabel: string;
  onClose: () => void;
  onSelect: (next: Locale) => void;
};

export function LanguageMenu({
  visible,
  value,
  title,
  cancelLabel,
  onClose,
  onSelect,
}: Props): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.title}>{title}</Text>

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
                  pressed && styles.pressed,
                  active && styles.activeItem,
                ]}
              >
                <Text style={[styles.itemText, active && styles.activeText]}>{opt.label}</Text>
                <Text style={[styles.check, active && styles.checkActive]}>
                  {active ? "✓" : ""}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
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
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.6,
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
    borderColor: "rgba(0,0,0,0.10)",
    marginBottom: 10,
  },
  pressed: { opacity: 0.85 },
  activeItem: { borderColor: "#3B82F6" },
  itemText: { fontSize: 16, fontWeight: "600" },
  activeText: { color: "#3B82F6" },
  check: { width: 24, textAlign: "right", fontSize: 18, opacity: 0.5 },
  checkActive: { opacity: 1, color: "#3B82F6" },
  cancel: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
  },
  cancelText: { fontSize: 16, fontWeight: "700" },
});
