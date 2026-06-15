import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, MapPin, Repeat, Send, Sparkles } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useLocalSearchParams, useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { hangoutTime } from "../lib/format";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";

const ICEBREAKERS = [
  "Everyone drop your go-to order at this place 👇",
  "Quick intros: name + how long you've been in DC?",
  "Hot take to start us off: best neighborhood for food?",
];

/** Group chat = the coordination layer. The plan stays pinned; the scary
 * moments get tools: an icebreaker when it's quiet, "I'm here" on the day
 * (find the table without panic), and "run it back" after it's over. */
export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const { threadOf, hangOf, personOf, sendMessage, checkin, reconvene } = store;
  const [text, setText] = useState("");

  const thread = threadOf(id ?? "");
  if (!thread) return null;
  const hang = thread.hangId ? hangOf(thread.hangId) : undefined;
  const dmWith = thread.withId ? personOf(thread.withId) : null;
  const title = hang ? (hang.venue ?? hang.body.slice(0, 36)) : dmWith?.name ?? "Chat";

  const isToday = hang?.time ? new Date(hang.time).toDateString() === new Date().toDateString() : false;
  const isPast = hang?.time ? new Date(hang.time).getTime() < Date.now() - 3 * 3600_000 : false;
  const alreadyCheckedIn = thread.messages.some((m) => m.kind === "checkin" && m.fromId === "me");
  const icebreaker = ICEBREAKERS[(thread.id.length + (hang?.id.length ?? 0)) % ICEBREAKERS.length];

  function doCheckin() {
    showAlert("I'm here 📍", "Add a note so people can find you?", [
      {
        text: "Table in the back",
        onPress: () => { checkin(thread!.id, "table in the back"); showToast("Checked in — they can find you now"); },
      },
      {
        text: "By the bar",
        onPress: () => { checkin(thread!.id, "by the bar"); showToast("Checked in — they can find you now"); },
      },
      { text: "Just check in", onPress: () => { checkin(thread!.id, ""); showToast("Checked in"); } },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function doReconvene() {
    if (!hang) return;
    const newId = reconvene(hang.id);
    showToast("Posted for next week — same time, same place 🔁");
    sendMessage(thread!.id, "Ran it back — same time next week! Posted it, you're all invited 🔁");
    if (newId) router.push({ pathname: "/post/[id]", params: { id: newId } });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={sh.headerTitle} numberOfLines={1}>{title}</Text>
          {hang && <Text style={styles.memberCount}>{hang.goingIds.length + 1} people</Text>}
        </View>
      </View>

      {/* Pinned plan */}
      {hang && (
        <Pressable
          onPress={() => router.push({ pathname: "/post/[id]", params: { id: hang.id } })}
          style={styles.planPin}
        >
          <MapPin size={14} color={colors.primaryDark} />
          <Text style={styles.planText} numberOfLines={1}>
            {hang.venue}
            {hang.time ? ` · ${hangoutTime(hang.time)}` : ""} · {hang.goingIds.length} going
          </Text>
          {isToday && !isPast && !alreadyCheckedIn && (
            <Pressable onPress={doCheckin} style={styles.hereBtn}>
              <Text style={styles.hereText}>I'm here 📍</Text>
            </Pressable>
          )}
        </Pressable>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}>
        {/* Reconvene — the 50-hour engine */}
        {hang && isPast && (
          <Pressable onPress={doReconvene} style={styles.reconvene}>
            <Repeat size={16} color={colors.primaryDeep} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reconveneTitle}>Good one? Run it back 🔁</Text>
              <Text style={styles.reconveneSub}>
                Post next week, same time — everyone here gets invited. Repetition is how this crew becomes your crew.
              </Text>
            </View>
          </Pressable>
        )}

        {/* Icebreaker when the room is quiet */}
        {thread.messages.length === 0 && (
          <View style={styles.icebreaker}>
            <Sparkles size={15} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.icebreakerLabel}>Break the ice</Text>
              <Text style={styles.icebreakerText}>{icebreaker}</Text>
            </View>
            <Pressable
              onPress={() => sendMessage(thread.id, icebreaker, "icebreaker")}
              style={styles.useBtn}
            >
              <Text style={styles.useBtnText}>Send it</Text>
            </Pressable>
          </View>
        )}

        {thread.messages.map((m) => {
          const mine = m.fromId === "me";
          const p = personOf(m.fromId);
          if (m.kind === "checkin") {
            return (
              <View key={m.id} style={styles.checkinRow}>
                <Text style={styles.checkinText}>
                  {mine ? "You" : p.name.split(" ")[0]} {m.body.replace("📍 ", "").toLowerCase() || "checked in"} 📍
                </Text>
              </View>
            );
          }
          return (
            <View key={m.id} style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
              {!mine && <Text style={styles.sender}>{p.name.split(" ")[0]}</Text>}
              <View style={[styles.bubble, { backgroundColor: mine ? colors.primaryDark : colors.surface }]}>
                <Text style={{ fontSize: 14, lineHeight: 19, color: mine ? colors.white : colors.foreground }}>
                  {m.body}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={colors.placeholder}
          multiline
          style={styles.input}
        />
        <Pressable
          onPress={() => {
            const body = text.trim();
            if (!body) return;
            sendMessage(thread.id, body);
            setText("");
          }}
          disabled={!text.trim()}
          style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primaryDark : colors.border }]}
        >
          <Send size={16} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  memberCount: { fontSize: 11, color: colors.muted },
  planPin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  planText: { flex: 1, fontSize: 12, fontWeight: "700", color: colors.primaryDeep },
  hereBtn: { borderRadius: 999, backgroundColor: colors.primaryDark, paddingHorizontal: 12, paddingVertical: 6 },
  hereText: { fontSize: 12, fontWeight: "700", color: colors.white },
  reconvene: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radiusCard,
    backgroundColor: colors.primaryLight,
    padding: 14,
  },
  reconveneTitle: { fontSize: 14, fontWeight: "800", color: colors.primaryDeep },
  reconveneSub: { marginTop: 2, fontSize: 12, lineHeight: 17, color: colors.primaryDeep },
  icebreaker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radiusCard,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  icebreakerLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: colors.primaryDark },
  icebreakerText: { marginTop: 2, fontSize: 13, color: colors.foreground },
  useBtn: { borderRadius: 999, backgroundColor: colors.primaryDark, paddingHorizontal: 12, paddingVertical: 7 },
  useBtnText: { fontSize: 12, fontWeight: "700", color: colors.white },
  checkinRow: { alignItems: "center" },
  checkinText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryDeep,
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    overflow: "hidden",
  },
  sender: { marginBottom: 2, marginLeft: 4, fontSize: 11, color: colors.muted },
  bubble: { maxWidth: "80%", borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9 },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    maxHeight: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.foreground,
  },
  sendBtn: { height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 999 },
});
