import React, { JSX } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { topBarStyles as styles } from "./styles";

type Props = {
  title: string;

  languageLabel: string;
  onOpenLanguage: () => void;

  theme: {
    surface: string;
    border: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
  };
};

export function ProfileTopBar(props: Props): JSX.Element {
  const { title, languageLabel, onOpenLanguage, theme } = props;

  const showStatusSpacer = Platform.OS !== "web";

  return (
    <>
      {showStatusSpacer && <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />}

      <View
        style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      >
        <Text style={[styles.topTitle, { color: theme.textPrimary }]}>{title}</Text>

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
    </>
  );
}
