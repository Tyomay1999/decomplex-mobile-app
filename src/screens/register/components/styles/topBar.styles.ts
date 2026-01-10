import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  topTitle: { fontSize: 20, fontWeight: "600" },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topBtnText: { fontSize: 28, lineHeight: 28 },
  langBtn: {
    height: 36,
    minWidth: 56,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  langText: { fontWeight: "800" },
});
