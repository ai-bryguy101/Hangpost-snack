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
import { ArrowLeft, Plus, Users } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useLocalSearchParams, useRouter } from "../lib/router";
import { fetchCommunityEvents, getCommunity, joinCommunity, leaveCommunity } from "../lib/mockApi";
import type { Post } from "../lib/types";
import { colors } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { PostCard } from "../components/PostCard";

/** Port of apps/native/app/community/[communityId].tsx. */
export function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { communityId, name } = useLocalSearchParams<{ communityId: string; name?: string }>();
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: community } = useQuery({
    queryKey: ["community", communityId],
    enabled: !!isSignedIn && !!communityId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return getCommunity(communityId ?? "", token);
    },
  });

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["community", communityId, "events"],
    enabled: !!isSignedIn && !!communityId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchCommunityEvents(communityId ?? "", token);
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) return;
      if (community?.joined) await leaveCommunity(communityId ?? "", token);
      else await joinCommunity(communityId ?? "", token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });

  const events = eventsData?.events ?? [];
  const title = community?.name ?? name ?? "Community";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {community && (
          <Button
            size="sm"
            variant={community.joined ? "secondary" : "primary"}
            onPress={() => toggle.mutate()}
            style={{ borderRadius: 999 }}
          >
            {community.joined ? "Joined" : "Join"}
          </Button>
        )}
      </View>

      <FlatList
        data={events}
        keyExtractor={(p: Post) => p.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View style={{ gap: 12, paddingBottom: 4 }}>
            <View style={styles.heroRow}>
              <View style={styles.heroIcon}>
                <Users size={22} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>{title}</Text>
                <Text style={styles.heroMeta}>{community?.member_count ?? 0} members</Text>
              </View>
            </View>
            {community?.description ? (
              <Text style={styles.description}>{community.description}</Text>
            ) : null}
            {community?.joined && (
              <Button
                variant="outlined"
                onPress={() =>
                  router.push({
                    pathname: "/create",
                    params: { communityId: communityId ?? "", communityName: title },
                  })
                }
                style={{ borderRadius: 999 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Plus size={16} color={colors.primaryDark} />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                    Post an event
                  </Text>
                </View>
              </Button>
            )}
            <Text style={styles.sectionLabel}>Upcoming events</Text>
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ alignItems: "center", paddingTop: 32 }}>
              <ActivityIndicator color={colors.primaryDark} />
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingTop: 32 }}>
              <Text style={{ fontSize: 14, color: colors.muted }}>No events yet.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIcon: {
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  heroTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  heroMeta: { fontSize: 12, color: colors.muted },
  description: { fontSize: 14, color: colors.muted },
  sectionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.muted,
  },
});
