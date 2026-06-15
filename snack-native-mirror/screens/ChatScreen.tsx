import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useLocalSearchParams, useRouter } from "../lib/router";
import { fetchMessages, fetchMyProfile, markThreadRead, sendMessage } from "../lib/mockApi";
import type { ChatMessage } from "../lib/types";
import { colors } from "../theme/colors";

/** Port of apps/native/app/chat/[threadId].tsx — bubbles, composer, polling,
 * mark-read on open. */
export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { threadId, title } = useLocalSearchParams<{ threadId: string; title?: string }>();
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const { data: me } = useQuery({
    queryKey: ["profile", "me"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchMyProfile(token);
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["messages", threadId],
    enabled: !!isSignedIn && !!threadId,
    refetchInterval: 5_000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchMessages(threadId ?? "", token);
    },
  });

  const messageCount = data?.messages.length ?? 0;

  // Mark read on open and whenever new messages arrive; refresh the inbox.
  useEffect(() => {
    if (!threadId) return;
    void (async () => {
      const token = await getToken();
      if (!token) return;
      await markThreadRead(threadId, token).catch(() => {});
      void queryClient.invalidateQueries({ queryKey: ["threads"] });
    })();
  }, [threadId, messageCount, getToken, queryClient]);

  const messages = data?.messages ?? [];

  const send = useMutation({
    mutationFn: async (body: string) => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return sendMessage(threadId ?? "", body, token);
    },
    onSuccess: () => {
      setText("");
      void queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
      void queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  function handleSend() {
    const body = text.trim();
    if (!body || send.isPending) return;
    send.mutate(body);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ?? "Chat"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m: ChatMessage) => m.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = me?.user_id === item.sender_id;
            return (
              <View style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
                {!mine && item.sender_name ? (
                  <Text style={styles.senderName}>{item.sender_name}</Text>
                ) : null}
                <View
                  style={[
                    styles.bubble,
                    { backgroundColor: mine ? colors.primaryDark : colors.surface },
                  ]}
                >
                  <Text style={{ fontSize: 14, color: mine ? colors.white : colors.foreground }}>
                    {item.body}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 48 }}>
              <Text style={{ fontSize: 14, color: colors.muted }}>
                No messages yet — say hi.
              </Text>
            </View>
          }
        />
      )}

      <View style={[styles.composer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={colors.placeholder}
          multiline
          style={styles.composerInput}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || send.isPending}
          style={[
            styles.sendButton,
            { backgroundColor: text.trim() ? colors.primaryDark : colors.border },
          ]}
        >
          <Send size={16} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
  senderName: { marginBottom: 2, marginLeft: 4, fontSize: 12, color: colors.muted },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
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
    maxHeight: 96,
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.foreground,
  },
  sendButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
});
