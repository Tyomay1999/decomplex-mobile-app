import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type AccountType = "candidate" | "company";

type Props = {
  value: AccountType;
  onChange: (v: AccountType) => void;
};

export function AccountTypeToggle({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <ToggleBtn
        title="Candidate"
        active={value === "candidate"}
        onPress={() => onChange("candidate")}
      />
      <ToggleBtn title="Company" active={value === "company"} onPress={() => onChange("company")} />
    </View>
  );
}

function ToggleBtn({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        active && styles.btnActive,
        pressed && styles.btnPressed,
      ]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnActive: {
    // color will be applied from screen to keep it consistent
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
  },
  textActive: {
    // color will be applied from screen
  },
});
