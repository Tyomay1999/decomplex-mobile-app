import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrap: { paddingTop: 34, paddingHorizontal: 18, alignItems: "center" },
  iconWrap: {
    width: 74,
    height: 74,
    borderRadius: 22,
    borderWidth: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: "900", textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 20, textAlign: "center", maxWidth: 320 },
  actions: { marginTop: 16, width: "100%", gap: 10, maxWidth: 360 },
  primary: { height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  secondary: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
