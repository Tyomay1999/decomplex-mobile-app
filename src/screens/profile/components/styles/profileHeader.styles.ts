import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: { alignItems: "center", paddingVertical: 32, borderBottomWidth: 1, marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3, marginBottom: 4 },
  email: { fontSize: 15, opacity: 0.85 },
});
