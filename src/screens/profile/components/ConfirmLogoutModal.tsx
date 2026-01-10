import React, { JSX } from "react";
import { Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import type { Theme } from "../../../app/theme";

export function ConfirmLogoutModal({
  theme,
  visible,
  loading,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onCancel,
  onConfirm,
}: {
  theme: Theme;
  visible: boolean;
  loading: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}): JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={s.overlay} onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            s.sheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={{ color: theme.textPrimary, fontWeight: "900", fontSize: 18 }}>{title}</Text>

          <Text style={{ color: theme.textSecondary, marginTop: 8, lineHeight: 18 }}>
            {message}
          </Text>

          <View style={{ height: 16 }} />

          <View style={s.actions}>
            <Pressable
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                s.btn,
                {
                  borderColor: theme.border,
                  backgroundColor: pressed ? theme.background : "transparent",
                  opacity: loading ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: "900" }}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                s.primary,
                {
                  backgroundColor: theme.primary,
                  opacity: loading ? 0.85 : pressed ? 0.9 : 1,
                },
              ]}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ActivityIndicator />
                  <Text style={{ color: theme.surface, fontWeight: "900" }}>{confirmLabel}</Text>
                </View>
              ) : (
                <Text style={{ color: theme.surface, fontWeight: "900" }}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  sheet: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  primary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
} as const;
