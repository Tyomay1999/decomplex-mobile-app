import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  subTitle: { fontSize: 13, marginTop: 6, opacity: 0.9 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  title: { fontSize: 18, fontWeight: "600", letterSpacing: -0.2, lineHeight: 24 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: "600" },
  desc: { marginTop: 12, fontSize: 14, lineHeight: 20, opacity: 0.95 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  meta: { fontSize: 14, opacity: 0.8 },
  actionsRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionBtnPrimary: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: { fontSize: 13, fontWeight: "700" },
  actionTextPrimary: { fontSize: 13, fontWeight: "800" },
  guestHint: { fontSize: 12, opacity: 0.8 },
});
