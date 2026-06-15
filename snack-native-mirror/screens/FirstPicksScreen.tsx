import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, UserCheck } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import {
  fetchMyProfile,
  fetchRecommendations,
  postOutcome,
  sendFriendRequest,
} from "../lib/mockApi";
import type { RecommendationResult } from "../lib/types";
import { colors, radiusCard } from "../theme/colors";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";

/** Port of apps/native/app/first-picks.tsx — straight out of onboarding:
 * your first 10 connections worth exploring, before you even see the feed. */

function reasonChips(r: RecommendationResult): string[] {
  const b = r.breakdown;
  const chips: string[] = [];
  if (b.mutual_friends > 0) chips.push(`${b.mutual_friends} mutual`);
  if (b.hometown_match > 0)
    chips.push(r.hometown ? `Both from ${r.hometown.split(",")[0]}` : "Same hometown");
  if (b.college_match > 0) chips.push(r.college ?? "Same college");
  if (b.major_match > 0 && r.major) chips.push(`Both studied ${r.major}`);
  if (b.job_match > 0 && r.job) {
    const employer = r.job.includes(" at ") ? r.job.split(" at ").pop()?.trim() : undefined;
    chips.push(employer ? `Both at ${employer}` : `Both work as ${r.job}`);
  }
  if (b.interest_overlap > 0.3) chips.push("Shared interests");
  return chips.slice(0, 3);
}

export function FirstPicksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const [sent, setSent] = useState<string[]>([]);

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
    queryKey: ["recommendations", "first-picks"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchRecommendations({ bearerToken: token, limit: 10 });
    },
  });

  async function connect(r: RecommendationResult) {
    setSent((s) => [...s, r.user_id]);
    const token = await getToken();
    if (!token) return;
    await sendFriendRequest(r.user_id, token).catch(() => {});
    await postOutcome(r.impression_id, "friend_request_sent", token).catch(() => {});
  }

  const results = data?.results ?? [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <Sparkles size={22} color={colors.primaryDark} />
        <Text style={styles.title}>
          {me ? `${me.display_name.split(" ")[0]}, your first 10` : "Your first 10"}
        </Text>
        <Text style={styles.sub}>
          Connections worth exploring near you — picked from your background and what you're into.
          Connect to a few before you even see the feed.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerFill}>
          <Text style={styles.emptyTitle}>Nobody nearby yet</Text>
          <Text style={styles.sub}>
            Your area is still waking up — the feed has hangouts and tips to start with.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r: RecommendationResult) => r.impression_id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 110 }}
          renderItem={({ item, index }) => {
            const isSent = sent.includes(item.user_id);
            const chips = reasonChips(item);
            return (
              <View style={[styles.card, cardShadow]}>
                <View style={styles.row}>
                  <Text style={styles.rank}>{index + 1}</Text>
                  <Avatar name={item.display_name} size="md" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.display_name}</Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {item.job ?? (item.major ? `Studied ${item.major}` : `@${item.handle}`)}
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    variant={isSent ? "secondary" : "primary"}
                    onPress={() => !isSent && void connect(item)}
                    disabled={isSent}
                    style={{ borderRadius: 999 }}
                  >
                    {isSent ? (
                      <View style={styles.sentRow}>
                        <UserCheck size={13} color={colors.primaryDark} />
                        <Text style={styles.sentText}>Sent</Text>
                      </View>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </View>
                {chips.length > 0 && (
                  <View style={styles.chipsRow}>
                    {chips.map((chip) => (
                      <Chip key={chip} label={chip} variant="tinted" />
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button onPress={() => router.replace("/")} style={{ borderRadius: 999 }}>
          {sent.length > 0
            ? `Nice — take me to my feed (${sent.length} sent)`
            : "Take me to my feed"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: "center", gap: 8, backgroundColor: colors.surface, paddingHorizontal: 24, paddingVertical: 18 },
  title: { fontSize: 20, fontWeight: "700", color: colors.foreground },
  sub: { textAlign: "center", fontSize: 13, lineHeight: 18, color: colors.muted },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  card: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rank: { width: 20, fontSize: 13, fontWeight: "700", color: colors.muted },
  name: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  meta: { fontSize: 12, color: colors.muted },
  sentRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sentText: { fontSize: 13, fontWeight: "600", color: colors.primaryDark },
  chipsRow: { marginLeft: 32, marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
