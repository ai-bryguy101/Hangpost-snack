import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, RotateCw, Users } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { fetchThreads } from "../lib/mockApi";
import { relativeTime } from "../lib/format";
import type { ThreadSummary } from "../lib/types";
import { colors, radiusCard } from "../theme/colors";
import { Button } from "../components/ui/Button";

/** Port of apps/native/app/messages.tsx — the inbox (hangout group chats + DMs). */
export function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["threads"],
    enabled: !!isSignedIn,
    refetchInterval: 20_000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchThreads(token);
    },
  });

  const threads = data?.threads ?? [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {!isSignedIn ? (
        <View style={styles.center}>
          <Text style={styles.centerSub}>Sign in to see your chats.</Text>
          <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
        </View>
      ) : isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.centerSub}>Couldn&apos;t load messages. Give it a moment.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <RotateCw size={14} color={colors.white} />
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : threads.length === 0 ? (
        <View style={styles.center}>
          <MessageCircle size={28} color={colors.primaryDark} />
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.centerSub}>RSVP to a hangout to join its group chat.</Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(t: ThreadSummary) => t.thread_id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshing={isFetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/chat/[threadId]",
                  params: { threadId: item.thread_id, title: item.title },
                })
              }
              style={styles.row}
            >
              <View style={styles.rowIcon}>
                {item.kind === "hangout" ? (
                  <Users size={18} color={colors.primaryDark} />
                ) : (
                  <MessageCircle size={18} color={colors.primaryDark} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.last_message_at && (
                    <Text style={styles.rowTime}>{relativeTime(item.last_message_at)}</Text>
                  )}
                </View>
                <Text style={styles.rowPreview} numberOfLines={1}>
                  {item.last_message ??
                    (item.kind === "hangout" ? `${item.member_count} going` : "Say hi")}
                </Text>
              </View>
              {item.unread_count > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread_count}</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24 },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerSub: { textAlign: "center", fontSize: 14, color: colors.muted },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: { fontSize: 14, fontWeight: "600", color: colors.white },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    backgroundColor: colors.surface,
    padding: 16,
  },
  rowIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.foreground },
  rowTime: { marginLeft: 8, fontSize: 12, color: colors.muted },
  rowPreview: { marginTop: 2, fontSize: 12, color: colors.muted },
  unreadBadge: {
    height: 20,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 6,
  },
  unreadText: { fontSize: 12, fontWeight: "700", color: colors.white },
});
