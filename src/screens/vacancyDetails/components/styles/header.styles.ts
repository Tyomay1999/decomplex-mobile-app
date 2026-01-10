import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, lineHeight: 34 },
  company: { marginTop: 10, fontSize: 15, opacity: 0.9 },
  tagsWrap: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
});
