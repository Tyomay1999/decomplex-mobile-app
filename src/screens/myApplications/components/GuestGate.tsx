import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import { applicationGuestStyles as styles } from "./styles";

export function GuestGate({
  theme,
  title,
  subtitle,
  loginLabel,
  registerLabel,
  onBack,
  onLogin,
  onRegister,
}: {
  theme: Theme;
  t: TFunction;
  title: string;
  subtitle: string;
  loginLabel: string;
  registerLabel: string;
  onBack: () => void;
  onLogin: () => void;
  onRegister: () => void;
}): JSX.Element {
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />

      <View
        style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      >
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: pressed ? theme.background : "transparent" },
          ]}
        >
          <Text style={{ fontSize: 22, color: theme.textPrimary }}>‹</Text>
        </Pressable>

        <Text style={[styles.topTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <View
          style={[styles.iconWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={{ fontSize: 34 }}>🔒</Text>
        </View>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>

        <Pressable
          onPress={onLogin}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={{ color: theme.surface, fontWeight: "900", fontSize: 16 }}>
            {loginLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={onRegister}
          style={({ pressed }) => [
            styles.secondary,
            {
              borderColor: theme.border,
              backgroundColor: pressed ? theme.background : "transparent",
            },
          ]}
        >
          <Text style={{ color: theme.textPrimary, fontWeight: "900", fontSize: 16 }}>
            {registerLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
