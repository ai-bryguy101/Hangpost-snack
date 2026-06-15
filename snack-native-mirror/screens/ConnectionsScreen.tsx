import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RotateCw, Sparkles, Users } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import {
  ApiError,
  fetchRecommendations,
  getOrCreateDm,
  postOutcome,
  sendFriendRequest,
} from "../lib/mockApi";
import type { RecommendationResult } from "../lib/types";
import { colors } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { ConnectionCard } from "../components/ConnectionCard";

/** Port of apps/native/app/(tabs)/connections.tsx — daily picks from the
 * matching engine, with outcome logging + the connect/message loop. */
export function ConnectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const viewedFired = useRef(false);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["recommendations"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      return fetchRecommendations({ bearerToken: token, limit: 10 });
    },
  });

  // Fire "viewed" outcome once per surfaced impression. Fire-and-forget.
  useEffect(() => {
    if (!data || viewedFired.current) return;
    viewedFired.current = true;
    void (async () => {
      const token = await getToken();
      if (!token) return;
      for (const r of data.results) {
        void postOutcome(r.impression_id, "viewed", token).catch(() => {});
      }
    })();
  }, [data, getToken]);

  const connectMutation = useMutation({
    mutationFn: async (result: RecommendationResult) => {
      const token = await getToken();
      if (!token) return;
      // Real friendship edge + the ML outcome label.
      await sendFriendRequest(result.user_id, token).catch(() => {});
      await postOutcome(result.impression_id, "friend_request_sent", token).catch(() => {});
    },
  });

  async function openDm(result: RecommendationResult) {
    const token = await getToken();
    if (!token) return;
    try {
      const thread = await getOrCreateDm(result.user_id, token);
      router.push({
        pathname: "/chat/[threadId]",
        params: { threadId: thread.thread_id, title: result.display_name },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        showAlert("Not connected yet", "You can message once they accept your connection request.");
      } else {
        showAlert("Couldn't open chat", "Please try again in a moment.");
      }
    }
  }

  if (!isSignedIn) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Sparkles size={32} color={colors.primaryDark} />
          <Text style={styles.centerTitle}>Sign in to see connections worth exploring</Text>
          <Text style={styles.centerSub}>
            The connections engine ranks nearby people by shared background, interests, and mutual
            connections.
          </Text>
          <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Connections</Text>
          <Text style={styles.subtitle}>
            Worth exploring — picked for you, with reasons.
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/connections-list")}
          hitSlop={8}
          style={styles.myConnections}
        >
          <Users size={16} color={colors.primaryDark} />
          <Text style={styles.myConnectionsText}>My connections</Text>
        </Pressable>
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.centerSub}>
            Couldn&apos;t load your picks. The API may be waking up — give it a moment.
          </Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <RotateCw size={14} color={colors.white} />
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : !data?.results.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No picks yet</Text>
          <Text style={styles.centerSub}>
            Complete your profile so the connections engine has more to work with.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data.results}
          keyExtractor={(r: RecommendationResult) => r.impression_id}
          renderItem={({ item }) => (
            <ConnectionCard
              result={item}
              onConnect={(r) => connectMutation.mutate(r)}
              onMessage={openDm}
            />
          )}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshing={isFetching}
          onRefresh={refetch}
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
  emptyTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 12, color: colors.muted },
  myConnections: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myConnectionsText: { fontSize: 12, fontWeight: "600", color: colors.primaryDark },
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
});
