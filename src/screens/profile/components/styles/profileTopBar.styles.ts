import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  statusBar: { height: Platform.OS === "web" ? 0 : 44 },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  langBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },
});
