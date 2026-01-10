import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  form: { gap: 20 },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
  },
  errorBox: { borderWidth: 1, borderRadius: 12, padding: 12 },
  errorText: { fontWeight: "700" },

  primaryBtn: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },

  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  footerText: { fontSize: 15, opacity: 0.9 },
  link: { fontSize: 15, fontWeight: "700" },
});
