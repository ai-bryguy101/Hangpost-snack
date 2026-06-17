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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { MapPin, MessageCircle, Plus, RotateCw, Search, Sparkles } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { fetchFeed, fetchTips, getMyLocation } from "../lib/mockApi";
import type { Post } from "../lib/types";
import { colors } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { PostCard } from "../components/PostCard";
import { CommunitiesTab } from "../components/CommunitiesTab";

/** Port of apps/native/app/(tabs)/index.tsx — the feed with its three lenses
 * (ADR-0018, amended 2026-06-17): Nearby (the location-scoped feed, newest
 * first — upcoming hangouts surface here, so "This week" was merged in) · City
 * Guide · Communities. */

type FeedTab = "nearby" | "cityguide" | "communities";

const TABS: { key: FeedTab; label: string }[] = [
  { key: "nearby", label: "Nearby" },
  { key: "cityguide", label: "City Guide" },
  { key: "communities", label: "Communities" },
];

const EMPTY: Record<"nearby" | "cityguide", { title: string; sub: string }> = {
  nearby: { title: "Nothing nearby yet", sub: "Be the first to post here." },
  cityguide: {
    title: "No tips yet",
    sub: "Share a local tip — best happy hour, transit hacks, hidden gems.",
  },
};

export function FeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const [tab, setTab] = useState<FeedTab>("nearby");
  const [tipSearch, setTipSearch] = useState("");

  const locationQuery = useQuery({
    queryKey: ["location", "me"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return getMyLocation(token);
    },
  });

  const hasLocation = !!locationQuery.data;
  const place = locationQuery.data?.label ?? "your area";

  const feedQuery = useQuery({
    queryKey: ["feed"],
    enabled: !!isSignedIn && hasLocation && tab === "nearby",
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchFeed({ bearerToken: token });
    },
  });

  const tipsQuery = useQuery({
    queryKey: ["tips", tipSearch],
    enabled: !!isSignedIn && hasLocation && tab === "cityguide",
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchTips({ bearerToken: token, q: tipSearch.trim() || undefined });
    },
  });

  const listQuery = tab === "cityguide" ? tipsQuery : feedQuery;
  const posts: Post[] = listQuery.data?.posts ?? [];

  const headline =
    tab === "cityguide"
      ? `City Guide · ${place}`
        : tab === "communities"
          ? "Communities"
          : `Nearby in ${place}`;

  if (!isSignedIn) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Sparkles size={32} color={colors.primaryDark} />
          <Text style={styles.centerTitle}>Sign in to see what&apos;s nearby</Text>
          <Text style={styles.centerSub}>
            Hangpost shows hangouts and local info around the place you set as your home base.
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
        <View style={styles.headerTopRow}>
          <Text style={styles.wordmark}>Hangpost</Text>
          <Pressable onPress={() => router.push("/messages")} hitSlop={8}>
            <MessageCircle size={22} color={colors.primaryDark} />
          </Pressable>
        </View>
        <Text style={styles.headline}>{headline}</Text>
        <Pressable onPress={() => router.push("/set-location")} style={styles.locationRow} hitSlop={6}>
          <MapPin size={12} color={colors.primaryDark} />
          <Text style={styles.locationText}>
            {hasLocation ? "Change home base" : "Set your home base"}
          </Text>
        </Pressable>

        {/* Lens switcher */}
        <View style={styles.lensRow}>
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={[styles.lens, active && { backgroundColor: colors.surface }]}
              >
                <Text
                  style={[
                    styles.lensText,
                    active
                      ? { fontWeight: "600", color: colors.foreground }
                      : { fontWeight: "500", color: colors.muted },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* City Guide search */}
        {tab === "cityguide" && (
          <View style={styles.searchRow}>
            <Search size={15} color={colors.placeholder} />
            <TextInput
              value={tipSearch}
              onChangeText={setTipSearch}
              placeholder="Search tips — happy hour, parking, brunch…"
              placeholderTextColor={colors.placeholder}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
        )}
      </View>

      {/* Body */}
      {tab === "communities" ? (
        <CommunitiesTab />
      ) : locationQuery.isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : !hasLocation ? (
        <View style={styles.center}>
          <MapPin size={28} color={colors.primaryDark} />
          <Text style={styles.emptyTitle}>Set your home base</Text>
          <Text style={styles.centerSub}>
            Pick a place and a radius to see hangouts and local info around it.
          </Text>
          <Button onPress={() => router.push("/set-location")}>Set location</Button>
        </View>
      ) : listQuery.isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : listQuery.isError ? (
        <View style={styles.center}>
          <Text style={styles.centerSub}>
            Couldn&apos;t load this. The API may be waking up — give it a moment.
          </Text>
          <Pressable onPress={() => listQuery.refetch()} style={styles.retryButton}>
            <RotateCw size={14} color={colors.white} />
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>{EMPTY[tab].title}</Text>
          <Text style={styles.centerSub}>{EMPTY[tab].sub}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p: Post) => p.id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshing={listQuery.isFetching}
          onRefresh={listQuery.refetch}
        />
      )}

      {/* Floating compose button */}
      <Pressable onPress={() => router.push("/create")} style={[styles.fab, fabShadow]}>
        <Plus size={26} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 24 },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerTitle: { fontWeight: "600", color: colors.foreground },
  centerSub: { textAlign: "center", fontSize: 14, color: colors.muted },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
  },
  headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { fontSize: 18, fontWeight: "700", color: colors.foreground },
  headline: { marginTop: 4, fontSize: 20, fontWeight: "700", color: colors.foreground },
  locationRow: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 12, fontWeight: "500", color: colors.primaryDark },
  lensRow: {
    marginTop: 12,
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: colors.background,
    padding: 4,
  },
  lens: { flex: 1, borderRadius: 999, paddingVertical: 6 },
  lensText: { textAlign: "center", fontSize: 12 },
  searchRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 0 },
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    height: 56,
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
  },
});

const fabShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};
