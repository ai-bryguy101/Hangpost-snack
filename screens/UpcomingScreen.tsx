import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CalendarDays, MessageCircle } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { hangoutTime } from "../lib/format";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";

/** Your private lineup — the hangouts you're in, time-sorted. Nobody else
 * ever sees this list. */
export function UpcomingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { myUpcoming, threadForHang, withdraw, personOf } = useStore();
  const upcoming = myUpcoming();

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={sh.headerTitle}>Your hangouts</Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Only you can see this</Text>
        </View>
      </View>

      {upcoming.length === 0 ? (
        <View style={sh.center}>
          <CalendarDays size={28} color={colors.primaryDark} />
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>Nothing lined up</Text>
          <Text style={sh.centerSub}>Tap "I'm in" on something in the feed — it lands here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {upcoming.map((h) => {
            const host = personOf(h.authorId);
            const thread = threadForHang(h.id);
            const isMine = h.authorId === "me";
            return (
              <Pressable
                key={h.id}
                onPress={() => router.push({ pathname: "/post/[id]", params: { id: h.id } })}
                style={[styles.row, sh.cardShadow]}
              >
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{h.time ? hangoutTime(h.time) : "TBD"}</Text>
                  {h.recurrence === "weekly" && <Text style={styles.weekly}>weekly</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={sh.personName} numberOfLines={1}>
                    {h.venue ?? h.body.slice(0, 40)}
                  </Text>
                  <Text style={sh.personMeta} numberOfLines={1}>
                    {isMine ? "You're hosting" : `Hosted by ${host.name.split(" ")[0]}`} · {h.goingIds.length} going
                  </Text>
                </View>
                {thread && (
                  <Pressable
                    onPress={() => router.push({ pathname: "/chat/[id]", params: { id: thread.id } })}
                    style={styles.chatBtn}
                    hitSlop={6}
                  >
                    <MessageCircle size={16} color={colors.primaryDark} />
                  </Pressable>
                )}
                {!isMine && (
                  <Pressable
                    onPress={() =>
                      showAlert("Can't make it?", "Withdrawing frees your spot for someone else.", [
                        { text: "Keep my spot", style: "cancel" },
                        {
                          text: "Withdraw",
                          style: "destructive",
                          onPress: () => {
                            withdraw(h.id);
                            showToast("Spot freed — thanks for the heads up");
                          },
                        },
                      ])
                    }
                    hitSlop={6}
                    style={{ paddingHorizontal: 4 }}
                  >
                    <Text style={sh.linkMuted}>Out</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radiusCard, backgroundColor: colors.surface, padding: 14 },
  timeCol: { width: 88 },
  timeText: { fontSize: 13, fontWeight: "800", color: colors.primaryDark },
  weekly: { fontSize: 10, fontWeight: "700", color: colors.muted, textTransform: "uppercase" },
  chatBtn: {
    height: 34,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
});
