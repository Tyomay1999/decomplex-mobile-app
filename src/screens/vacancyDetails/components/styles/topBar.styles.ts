import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  topBar: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },
});
