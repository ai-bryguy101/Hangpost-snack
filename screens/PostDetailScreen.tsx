import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, MessageCircle, Send, Share2 } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useLocalSearchParams, useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { relativeTime } from "../lib/format";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { PostCard } from "../components/PostCard";

/** Full post: the card + who's exactly going (tap any of them), comments, the
 * group-chat door, and "share my plan" — the tell-a-friend safety habit. */
export function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const { hangOf, personOf, addComment, threadForHang, me } = store;
  const [draft, setDraft] = useState("");

  const hang = hangOf(id ?? "");
  if (!hang) {
    return (
      <View style={[sh.root, { paddingTop: insets.top }]}>
        <View style={sh.center}>
          <Text style={sh.centerSub}>This post is gone.</Text>
        </View>
      </View>
    );
  }

  const going = hang.goingIds.includes("me");
  const thread = threadForHang(hang.id);

  function sharePlan() {
    showAlert(
      "Share your plan",
      `Send "${hang?.venue ?? "this hangout"}" — time, place, and who's going — to someone you trust?`,
      [
        { text: "Send to a contact", onPress: () => showToast("Plan shared with your contact 💌") },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>{hang.type === "hangout" ? "Hangout" : "Local tip"}</Text>
        {hang.type === "hangout" && (
          <Pressable onPress={sharePlan} hitSlop={8}>
            <Share2 size={19} color={colors.primaryDark} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}>
        <PostCard hang={hang} />

        {hang.type === "hangout" && hang.goingIds.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>Who's going ({hang.goingIds.length})</Text>
            {hang.goingIds.map((pid) => {
              const p = personOf(pid);
              return (
                <Pressable
                  key={pid}
                  onPress={() => pid !== "me" && router.push({ pathname: "/person/[id]", params: { id: pid } })}
                  style={sh.personRow}
                >
                  <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                  <View style={{ flex: 1 }}>
                    <Text style={sh.personName}>{pid === "me" ? `${p.name} (you)` : p.name}</Text>
                    <Text style={sh.personMeta} numberOfLines={1}>
                      {p.intro ?? `@${p.handle}`}
                    </Text>
                  </View>
                  {p.reliable && pid !== "me" && (
                    <View style={styles.reliableChip}>
                      <Text style={styles.reliableText}>usually shows up</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {hang.type === "hangout" && going && thread && (
          <Button
            variant="secondary"
            onPress={() =>
              router.push({ pathname: "/chat/[id]", params: { id: thread.id } })
            }
            style={{ borderRadius: 999 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MessageCircle size={16} color={colors.primaryDark} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primaryDark }}>
                Open group chat
              </Text>
            </View>
          </Button>
        )}

        <View style={{ gap: 8 }}>
          <Text style={sh.sectionLabel}>Comments ({hang.comments.length})</Text>
          {hang.comments.map((c) => {
            const p = personOf(c.authorId);
            return (
              <View key={c.id} style={[sh.personRow, { alignItems: "flex-start" }]}>
                <Avatar name={p.name} src={p.avatar} size="sm" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentMeta}>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>{c.authorId === "me" ? "You" : p.name}</Text>
                    {"  "}
                    {relativeTime(c.at)}
                  </Text>
                  <Text style={styles.commentBody}>{c.body}</Text>
                </View>
              </View>
            );
          })}
          {hang.comments.length === 0 && (
            <Text style={sh.centerSub}>No comments yet — ask a question or just say you're curious.</Text>
          )}
        </View>
      </ScrollView>

      {/* Comment composer */}
      <View style={[styles.composer, { paddingBottom: insets.bottom + 8 }]}>
        <Avatar name={me.name} src={me.avatar} size="sm" />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Add a comment…"
          placeholderTextColor={colors.placeholder}
          style={styles.composerInput}
          multiline
        />
        <Pressable
          onPress={() => {
            const body = draft.trim();
            if (!body) return;
            addComment(hang.id, body);
            setDraft("");
          }}
          disabled={!draft.trim()}
          style={[styles.sendBtn, { backgroundColor: draft.trim() ? colors.primaryDark : colors.border }]}
        >
          <Send size={15} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  reliableChip: { borderRadius: 999, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3 },
  reliableText: { fontSize: 10, fontWeight: "700", color: colors.primaryDark },
  commentMeta: { fontSize: 12, color: colors.muted },
  commentBody: { marginTop: 2, fontSize: 14, lineHeight: 19, color: colors.foreground },
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
  composerInput: {
    flex: 1,
    maxHeight: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.foreground,
  },
  sendBtn: { height: 34, width: 34, alignItems: "center", justifyContent: "center", borderRadius: 999 },
});
