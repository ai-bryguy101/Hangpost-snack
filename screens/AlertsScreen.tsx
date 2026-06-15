import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BellRing, CalendarCheck, Check, Newspaper, Sparkles, UserPlus } from "lucide-react-native";

import { useStore, type Notif } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { relativeTime } from "../lib/format";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { GradientHero } from "../components/GradientHero";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";

/** Notifications that deep-link: requests (inline Accept), invites, the
 * tonight-reminder, "new person joined nearby", and the weekly digest. */
export function AlertsScreen() {
  const router = useRouter();
  const { notifs, personOf, readNotif, readAllNotifs, accept } = useStore();
  const unread = notifs.filter((n) => !n.read).length;
  const sorted = [...notifs].sort((a, b) => b.at.localeCompare(a.at));

  function describe(n: Notif): string {
    const who = n.fromId ? personOf(n.fromId).name : "";
    switch (n.kind) {
      case "request": return `${who} wants to connect`;
      case "accepted": return `${who} accepted — you're connected 🎉`;
      case "rsvp": return `${who} is coming to your hangout`;
      case "invite": return `${who} invited you: ${n.body ?? "a hangout"}`;
      case "joined_nearby": return `${who} just joined nearby${n.body ? ` — ${n.body}` : ""}`;
      case "reminder": return n.body ?? "Coming up soon";
      case "digest": return n.body ?? "Your week nearby";
      case "comment": return `${who} commented on your post`;
    }
  }

  function iconFor(n: Notif) {
    if (n.kind === "reminder" || n.kind === "rsvp" || n.kind === "invite") return CalendarCheck;
    if (n.kind === "request" || n.kind === "accepted") return UserPlus;
    if (n.kind === "joined_nearby") return Sparkles;
    if (n.kind === "digest") return Newspaper;
    return BellRing;
  }

  function open(n: Notif) {
    readNotif(n.id);
    if (n.hangId) router.push({ pathname: "/post/[id]", params: { id: n.hangId } });
    else if (n.fromId) router.push({ pathname: "/person/[id]", params: { id: n.fromId } });
  }

  return (
    <View style={sh.root}>
      <GradientHero
        title="Alerts"
        subtitle={unread > 0 ? `${unread} new` : "You're all caught up"}
        right={
          unread > 0 ? (
            <Pressable onPress={readAllNotifs} style={styles.markAll} hitSlop={8}>
              <Check size={14} color={colors.white} />
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}>
        {sorted.map((n) => {
          const Icon = iconFor(n);
          const person = n.fromId ? personOf(n.fromId) : null;
          const canAccept = n.kind === "request" && n.fromId;
          return (
            <Pressable
              key={n.id}
              onPress={() => open(n)}
              style={[styles.row, { backgroundColor: n.read ? colors.surface : colors.primaryLight }, sh.cardShadow]}
            >
              {person ? (
                <Avatar name={person.name} src={person.avatar} verified={person.verified} />
              ) : (
                <View style={styles.iconWrap}>
                  <Icon size={18} color={colors.primaryDark} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{describe(n)}</Text>
                <Text style={styles.rowTime}>{relativeTime(n.at)}</Text>
              </View>
              {canAccept ? (
                <Button
                  size="sm"
                  onPress={() => {
                    accept(n.fromId as string);
                    readNotif(n.id);
                    showToast(`Connected with ${person?.name.split(" ")[0]} 🎉`);
                  }}
                  style={{ borderRadius: 999 }}
                >
                  Accept
                </Button>
              ) : !n.read ? (
                <View style={styles.dot} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  markAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllText: { fontSize: 12, fontWeight: "700", color: colors.white },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radiusCard, padding: 14 },
  iconWrap: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  rowTitle: { fontSize: 14, fontWeight: "600", lineHeight: 19, color: colors.foreground },
  rowTime: { marginTop: 2, fontSize: 12, color: colors.muted },
  dot: { height: 8, width: 8, borderRadius: 4, backgroundColor: colors.primaryDark },
});
