import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Home, User, Users } from "lucide-react-native";

import { colors } from "../theme/colors";

/** Visual stand-in for the expo-router <Tabs> bar in apps/native/(tabs)/_layout.tsx:
 * white bar, top hairline, teal active tint, 11pt semibold labels, and the
 * red unread badge on Alerts. */

export type TabKey = "feed" | "connections" | "alerts" | "profile";

const TABS: { key: TabKey; label: string; Icon: typeof Home }[] = [
  { key: "feed", label: "Feed", Icon: Home },
  { key: "connections", label: "Connections", Icon: Users },
  { key: "alerts", label: "Alerts", Icon: Bell },
  { key: "profile", label: "Profile", Icon: User },
];

export function TabBar({
  active,
  onChange,
  alertsBadge,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  alertsBadge?: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {TABS.map(({ key, label, Icon }) => {
        const tint = active === key ? colors.primaryDark : colors.muted;
        const showBadge = key === "alerts" && !!alertsBadge && alertsBadge > 0;
        return (
          <Pressable key={key} onPress={() => onChange(key)} style={styles.item}>
            <View>
              <Icon size={24} color={tint} />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{alertsBadge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: tint }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  item: { flex: 1, alignItems: "center", gap: 2 },
  label: { fontSize: 11, fontWeight: "600" },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: colors.white },
});
