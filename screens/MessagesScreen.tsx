import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, MessageCircle, Users } from "lucide-react-native";

import { useStore, type Thread } from "../lib/store";
import { useRouter } from "../lib/router";
import { hangoutTime, relativeTime } from "../lib/format";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";

/** The inbox leads with hangout group chats — coordinating the meet IS the
 * point. DMs follow. */
export function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { threads, hangOf, personOf } = useStore();

  const unreadOf = (th: Thread) =>
    th.messages.filter((m) => m.fromId !== "me" && (th.lastReadAt === null || m.at > th.lastReadAt)).length;

  const sorted = [...threads].sort((a, b) => {
    const la = a.messages[a.messages.length - 1]?.at ?? "";
    const lb = b.messages[b.messages.length - 1]?.at ?? "";
    return lb.localeCompare(la);
  });
  const hangThreads = sorted.filter((t) => t.kind === "hangout");
  const dms = sorted.filter((t) => t.kind === "dm");

  function ThreadRow({ th }: { th: Thread }) {
    const hang = th.hangId ? hangOf(th.hangId) : undefined;
    const person = th.withId ? personOf(th.withId) : null;
    const last = th.messages[th.messages.length - 1];
    const unread = unreadOf(th);
    const title = hang ? (hang.venue ?? hang.body.slice(0, 36)) : person?.name ?? "Chat";
    return (
      <Pressable
        onPress={() => router.push({ pathname: "/chat/[id]", params: { id: th.id } })}
        style={[styles.row, sh.cardShadow]}
      >
        {person ? (
          <Avatar name={person.name} src={person.avatar} verified={person.verified} />
        ) : (
          <View style={styles.groupIcon}>
            <Users size={18} color={colors.primaryDark} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.title, { flex: 1 }]} numberOfLines={1}>{title}</Text>
            {last && <Text style={styles.time}>{relativeTime(last.at)}</Text>}
          </View>
          {hang && hang.time && (
            <Text style={styles.plan} numberOfLines={1}>
              📍 {hang.venue} · {hangoutTime(hang.time)} · {hang.goingIds.length} going
            </Text>
          )}
          <Text style={styles.preview} numberOfLines={1}>
            {last
              ? `${last.fromId === "me" ? "You: " : `${personOf(last.fromId).name.split(" ")[0]}: `}${last.body}`
              : "Say hi 👋"}
          </Text>
        </View>
        {unread > 0 && (
          <View style={styles.unread}>
            <Text style={styles.unreadText}>{unread}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>Messages</Text>
      </View>

      {threads.length === 0 ? (
        <View style={sh.center}>
          <MessageCircle size={28} color={colors.primaryDark} />
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>No chats yet</Text>
          <Text style={sh.centerSub}>Tap "I'm in" on a hangout to join its group chat.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {hangThreads.length > 0 && <Text style={sh.sectionLabel}>Hangout chats</Text>}
          {hangThreads.map((th) => (
            <ThreadRow key={th.id} th={th} />
          ))}
          {dms.length > 0 && <Text style={[sh.sectionLabel, { marginTop: 6 }]}>Direct</Text>}
          {dms.map((th) => (
            <ThreadRow key={th.id} th={th} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radiusCard, backgroundColor: colors.surface, padding: 14 },
  groupIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  title: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  time: { marginLeft: 8, fontSize: 11, color: colors.muted },
  plan: { marginTop: 1, fontSize: 12, fontWeight: "600", color: colors.primaryDark },
  preview: { marginTop: 1, fontSize: 12, color: colors.muted },
  unread: {
    height: 20,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 6,
  },
  unreadText: { fontSize: 11, fontWeight: "700", color: colors.white },
});
