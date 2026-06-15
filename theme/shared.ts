import { StyleSheet } from "react-native";

import { colors, radiusCard } from "./colors";

/** Shared style fragments so screens stay small and visually consistent. */
export const sh = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24 },
  centerSub: { textAlign: "center", fontSize: 14, lineHeight: 20, color: colors.muted },
  card: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 16 },
  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.muted,
  },
  hint: { marginTop: 4, fontSize: 12, color: colors.muted },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.muted,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    backgroundColor: colors.surface,
    padding: 12,
  },
  personName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  personMeta: { fontSize: 12, color: colors.muted },
  metaText: { fontSize: 12, color: colors.muted },
  linkMuted: { fontSize: 12, fontWeight: "500", color: colors.muted },
  pill: { borderRadius: 999 },
});
