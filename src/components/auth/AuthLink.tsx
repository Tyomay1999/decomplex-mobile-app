import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  prefix: string;
  linkText: string;
  onPress: () => void;
};

export function AuthLink({ prefix, linkText, onPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>{prefix} </Text>
      <Pressable onPress={onPress}>
        <Text style={styles.link}>{linkText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  prefix: {
    fontSize: 15,
    opacity: 0.7,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
  },
});
