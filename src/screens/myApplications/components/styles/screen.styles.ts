import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: { height: Platform.OS === "web" ? 0 : 44 },
  listContent: { padding: 16, paddingBottom: 24 },
});
