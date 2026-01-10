import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "100%",
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipText: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.2,
    maxWidth: 200,
  },
  chipClose: {
    fontSize: 12,
    fontWeight: "900",
  },
});
