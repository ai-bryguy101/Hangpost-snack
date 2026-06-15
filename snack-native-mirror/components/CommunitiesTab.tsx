import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Plus, Search, Users } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { fetchCommunities, joinCommunity, leaveCommunity } from "../lib/mockApi";
import type { CommunitySummary } from "../lib/types";
import { colors, radiusCard } from "../theme/colors";
import { Button } from "./ui/Button";

/** Port of apps/native/components/CommunitiesTab.tsx — rendered inside the
 * Feed screen's "Communities" lens. */
export function CommunitiesTab() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["communities", q],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchCommunities(token, q || undefined);
    },
  });

  const toggle = useMutation({
    mutationFn: async (c: CommunitySummary) => {
      const token = await getToken();
      if (!token) return;
      if (c.joined) await leaveCommunity(c.id, token);
      else await joinCommunity(c.id, token);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  const communities = data?.communities ?? [];

  if (!isSignedIn) {
    return (
      <View style={styles.center}>
        <Users size={32} color={colors.primaryDark} />
        <Text style={styles.centerText}>Sign in to find communities near you.</Text>
        <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topRow}>
        <View style={styles.searchBox}>
          <Search size={15} color={colors.placeholder} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search communities"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>
        <Pressable onPress={() => router.push("/community-new")} style={styles.addButton}>
          <Plus size={20} color={colors.white} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.centerText}>Couldn&apos;t load communities.</Text>
        </View>
      ) : communities.length === 0 ? (
        <View style={styles.center}>
          <Users size={28} color={colors.primaryDark} />
          <Text style={styles.emptyTitle}>{q ? "No matches" : "No communities yet"}</Text>
          <Text style={styles.centerText}>Start one with the + button.</Text>
        </View>
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(c: CommunitySummary) => c.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshing={isFetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/community/[communityId]",
                  params: { communityId: item.id, name: item.name },
                })
              }
              style={styles.row}
            >
              <View style={styles.rowIcon}>
                <Users size={20} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rowMeta}>
                  {item.member_count} member{item.member_count === 1 ? "" : "s"}
                </Text>
              </View>
              <Button
                size="sm"
                variant={item.joined ? "secondary" : "primary"}
                onPress={() => toggle.mutate(item)}
                style={{ borderRadius: 999 }}
              >
                {item.joined ? "Joined" : "Join"}
              </Button>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  centerText: { textAlign: "center", fontSize: 14, color: colors.muted },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 0 },
  addButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    backgroundColor: colors.surface,
    padding: 16,
  },
  rowIcon: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  rowName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  rowMeta: { fontSize: 12, color: colors.muted },
});
