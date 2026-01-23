import React, { JSX } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { searchBarStyles as styles } from "./styles";
import { webNoOutline } from "../../../shared/styles/web";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onOpenFilters: () => void;
  theme: {
    surface: string;
    border: string;
    background: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  };
};

export function HomeSearchBar(props: Props): JSX.Element {
  const { value, onChange, placeholder, onOpenFilters, theme } = props;

  return (
    <View testID="home.search" style={styles.searchWrap}>
      <View
        style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text style={{ fontSize: 18, color: theme.textSecondary }}>🔍</Text>

        <TextInput
          testID="home.search.input"
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          style={[styles.searchInput, { color: theme.textPrimary }, webNoOutline]}
          returnKeyType="search"
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <Pressable
        testID="home.filters.open"
        onPress={() => {
          Keyboard.dismiss();
          onOpenFilters();
        }}
        style={({ pressed }) => [
          styles.filterBtn,
          {
            borderColor: theme.border,
            backgroundColor: pressed ? theme.background : "transparent",
          },
        ]}
      >
        <Text style={{ fontSize: 18, color: theme.textSecondary }}>⚙️</Text>
      </Pressable>
    </View>
  );
}
