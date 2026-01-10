import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  actionsWrap: { paddingHorizontal: 16, paddingTop: 24 },
  card: { borderWidth: 1, borderRadius: 16, padding: 20 },

  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  secondaryBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
