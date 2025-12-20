import React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  value: string;
  onChangeText: (v: string) => void;
};

export function AuthTextField({ value, onChangeText, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, style]}
        placeholderTextColor={"rgba(0,0,0,0.45)"}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  input: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "transparent",
  },
});
