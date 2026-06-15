import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CalendarCheck, Check, RotateCw, UserPlus } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import {
  acceptFriendRequest,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/mockApi";
import { relativeTime } from "../lib/format";
import type { AppNotification, NotifKind } from "../lib/types";
import { colors, radiusCard } from "../theme/colors";
import { Button } from "../components/ui/Button";

/** Port of apps/native/app/(tabs)/alerts.tsx — real notifications with
 * tap-to-read, mark-all, and Accept on connection requests. */

function describe(n: AppNotification): string {
  const event = typeof n.payload.event === "string" ? n.payload.event : undefined;
  const who =
    typeof n.payload.from_name === "string" && n.payload.from_name
      ? n.payload.from_name
      : "Someone";
  switch (n.kind) {
    case "friend_request":
      return event === "accepted"
        ? `${who} accepted your connection request`
        : `${who} wants to connect`;
    case "rsvp":
      return `${who} is coming to your hangout`;
    case "hangout_invite":
      return "You were invited to a hangout";
    case "new_match":
      return "You have a new match nearby";
    case "comment":
      return "New comment on your post";
    default:
      return "New notification";
  }
}

function iconFor(kind: NotifKind) {
  if (kind === "rsvp" || kind === "hangout_invite") return CalendarCheck;
  if (kind === "friend_request" || kind === "new_match") return UserPlus;
  return Bell;
}

export function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["notifications", "list"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchNotifications(token, { limit: 50 });
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const readOne = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) return;
      await markNotificationRead(id, token);
    },
    onSuccess: () => void invalidate(),
  });

  const readAll = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) return;
      await markAllNotificationsRead(token);
    },
    onSuccess: () => void invalidate(),
  });

  const accept = useMutation({
    mutationFn: async ({ id, from }: { id: string; from: string }) => {
      const token = await getToken();
      if (!token) return;
      await acceptFriendRequest(from, token);
      await markNotificationRead(id, token).catch(() => {});
    },
    onSuccess: () => void invalidate(),
  });

  const notifications = data?.notifications ?? [];
  const unread = data?.unread_count ?? 0;

  if (!isSignedIn) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Bell size={32} color={colors.primaryDark} />
          <Text style={styles.centerTitle}>Sign in to see your alerts</Text>
          <Text style={styles.centerSub}>
            Connection requests and hangout RSVPs show up here.
          </Text>
          <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        {unread > 0 && (
          <Pressable onPress={() => readAll.mutate()} hitSlop={8} style={styles.markAll}>
            <Check size={14} color={colors.primaryDark} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.centerSub}>
            Couldn&apos;t load alerts. The API may be waking up — give it a moment.
          </Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <RotateCw size={14} color={colors.white} />
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Bell size={28} color={colors.primaryDark} />
          </View>
          <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
          <Text style={styles.centerSub}>
            Connection requests and hangout RSVPs will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n: AppNotification) => n.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshing={isFetching}
          onRefresh={refetch}
          renderItem={({ item }) => {
            const Icon = iconFor(item.kind);
            const isUnread = item.read_at === null;
            const event = typeof item.payload.event === "string" ? item.payload.event : undefined;
            const from = typeof item.payload.from === "string" ? item.payload.from : undefined;
            const canAccept = item.kind === "friend_request" && event !== "accepted" && !!from;
            return (
              <Pressable
                onPress={() => isUnread && readOne.mutate(item.id)}
                style={[
                  styles.row,
                  { backgroundColor: isUnread ? colors.primaryLight : colors.surface },
                ]}
              >
                <View style={styles.rowIcon}>
                  <Icon size={18} color={colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{describe(item)}</Text>
                  <Text style={styles.rowTime}>{relativeTime(item.created_at)}</Text>
                </View>
                {canAccept && from ? (
                  <Button
                    size="sm"
                    onPress={() => accept.mutate({ id: item.id, from })}
                    style={{ borderRadius: 999 }}
                  >
                    Accept
                  </Button>
                ) : isUnread ? (
                  <View style={styles.unreadDot} />
                ) : null}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24 },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerTitle: { fontWeight: "600", color: colors.foreground },
  centerSub: { textAlign: "center", fontSize: 14, color: colors.muted },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground },
  emptyIcon: {
    height: 64,
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { flex: 1, fontSize: 18, fontWeight: "700", color: colors.foreground },
  markAll: { flexDirection: "row", alignItems: "center", gap: 4 },
  markAllText: { fontSize: 14, fontWeight: "600", color: colors.primaryDark },
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
    padding: 16,
  },
  rowIcon: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  rowTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  rowTime: { marginTop: 2, fontSize: 12, color: colors.muted },
  unreadDot: { height: 8, width: 8, borderRadius: 4, backgroundColor: colors.primaryDark },
});
