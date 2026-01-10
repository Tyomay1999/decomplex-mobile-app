import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  btn: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 17, fontWeight: "800" },
});
