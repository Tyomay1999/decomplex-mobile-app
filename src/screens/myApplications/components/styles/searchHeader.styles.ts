import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  filtersBtn: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    paddingLeft: 12,
    paddingRight: 44,
    height: 44,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },

  clearBtn: {
    position: "absolute",
    right: 8,
    top: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
