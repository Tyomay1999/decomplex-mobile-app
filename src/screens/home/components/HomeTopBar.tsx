import React, { JSX } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { topBarStyles as styles } from "./styles";

type Props = {
  title: string;
  languageLabel: string;
  onOpenLanguage: () => void;
  onToggleTheme: () => void;
  theme: {
    name: string;
    surface: string;
    border: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
  };
};

export function HomeTopBar(props: Props): JSX.Element {
  const { title, languageLabel, onOpenLanguage, onToggleTheme, theme } = props;

  const showStatusSpacer = Platform.OS !== "web";

  return (
    <>
      {showStatusSpacer && <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />}

      <View
        style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      >
        <Text style={[styles.topTitle, { color: theme.textPrimary }]}>{title}</Text>

        <View style={styles.topActions}>
          <Pressable
            onPress={onToggleTheme}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: pressed ? theme.background : "transparent" },
            ]}
          >
            <Text style={{ fontSize: 18, color: theme.textSecondary }}>
              {theme.name === "light" ? "🌙" : "☀️"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onOpenLanguage}
            style={({ pressed }) => [
              styles.langBtn,
              {
                borderColor: theme.border,
                backgroundColor: pressed ? theme.background : "transparent",
              },
            ]}
          >
            <Text style={{ color: theme.textSecondary, fontWeight: "800", letterSpacing: 0.4 }}>
              {languageLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
