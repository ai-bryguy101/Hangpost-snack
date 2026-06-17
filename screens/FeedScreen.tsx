import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bookmark, CalendarDays, MapPin, MessageCircle, Plus, Search, X } from "lucide-react-native";

import { useStore, type Hang } from "../lib/store";
import { useRouter } from "../lib/router";
import { hangoutTime } from "../lib/format";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { PostCard } from "../components/PostCard";
import { CommunitiesTab } from "../components/CommunitiesTab";

// Lenses: The Bulletin (the city posterboard — upcoming hangouts + local info,
// newest first; the whole app is already location-scoped, so naming this lens
// "Nearby" was redundant), City Guide (helpfulness-ranked tips), Communities.
// The internal key stays "nearby" so the rest of the file doesn't churn.
// (ADR-0018, amended 2026-06-17: "This week" was merged in — the Bulletin already
// lists upcoming hangouts; the calendar icon → Your hangouts is the commitments view.)
type Lens = "nearby" | "cityguide" | "communities";

const LENSES: { key: Lens; label: string }[] = [
  { key: "nearby", label: "The Bulletin" },
  { key: "cityguide", label: "City Guide" },
  { key: "communities", label: "Communities" },
];

export function FeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useStore();
  const { me, hangs, blocked, firstRun, dismissFirstRun, unreadThreads, myUpcoming } = store;
  const upcomingCount = myUpcoming().length;
  const areaName = me.homeLabel.split(",")[0].split(" (")[0].trim();
  const [lens, setLens] = useState<Lens>("nearby");
  const [tipSearch, setTipSearch] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);

  const matchesDemographics = (h: Hang) => {
    if (h.authorId === "me") return true;
    if (h.audienceAge && me.age !== null && (me.age < h.audienceAge[0] || me.age > h.audienceAge[1]))
      return false;
    if (h.audiencePronouns && (!me.pronouns || !h.audiencePronouns.includes(me.pronouns)))
      return false;
    return true;
  };
  const visible = hangs.filter((h) => !blocked.includes(h.authorId) && matchesDemographics(h));
  const isToday = (h: Hang) =>
    h.time !== null && new Date(h.time).toDateString() === new Date().toDateString();
  const isFuture = (h: Hang) => h.time !== null && new Date(h.time).getTime() > Date.now() - 3600_000;

  const todayHangs = visible
    .filter((h) => h.type === "hangout" && isToday(h) && isFuture(h))
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

  const tipScore = (h: Hang) => h.thanks + h.saves;

  const list: Hang[] =
    lens === "nearby"
      ? visible
          .filter((h) => h.type === "tip" || isFuture(h))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : visible
          .filter((h) => h.type === "tip")
          .filter((h) => (savedOnly ? h.savedByMe : true))
          .filter((h) => {
            const q = tipSearch.trim().toLowerCase();
            if (!q) return true;
            return h.body.toLowerCase().includes(q) || h.hashtags.some((t) => t.includes(q));
          })
          .sort((a, b) => tipScore(b) - tipScore(a) || b.createdAt.localeCompare(a.createdAt));

  const liveCount = todayHangs.length;

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Text style={styles.wordmark}>Hangpost</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Pressable onPress={() => router.push("/search")} hitSlop={8}>
              <Search size={21} color={colors.primaryDark} />
            </Pressable>
            <Pressable onPress={() => router.push("/upcoming")} hitSlop={8} accessibilityLabel="Your hangouts">
              <CalendarDays size={21} color={colors.primaryDark} />
              {upcomingCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{upcomingCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push("/messages")} hitSlop={8}>
              <MessageCircle size={21} color={colors.primaryDark} />
              {unreadThreads() > 0 && <View style={styles.msgDot} />}
            </Pressable>
          </View>
        </View>
        <Text style={styles.headline}>
          {lens === "cityguide"
            ? "City Guide"
            : lens === "communities"
              ? "Communities"
              : `The ${areaName} bulletin`}
        </Text>
        <Pressable onPress={() => router.push("/set-location")} style={styles.locRow} hitSlop={6}>
          <MapPin size={12} color={colors.primaryDark} />
          <Text style={styles.locText}>
            {me.homeLabel} · {me.radiusMi} mi — change
          </Text>
        </Pressable>

        {/* Lens switcher */}
        <View style={styles.lensRow}>
          {LENSES.map(({ key, label }) => {
            const active = lens === key;
            return (
              <Pressable key={key} onPress={() => setLens(key)} style={[styles.lens, active && { backgroundColor: colors.surface }]}>
                <Text style={[styles.lensText, active ? { fontWeight: "700", color: colors.foreground } : { fontWeight: "500", color: colors.muted }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {lens === "cityguide" && (
          <View style={styles.searchRow}>
            <Search size={15} color={colors.placeholder} />
            <TextInput
              value={tipSearch}
              onChangeText={setTipSearch}
              placeholder="Search tips — happy hour, transit, brunch…"
              placeholderTextColor={colors.placeholder}
              style={styles.searchInput}
            />
            <Pressable onPress={() => setSavedOnly((v) => !v)} hitSlop={6}>
              <Bookmark
                size={16}
                color={savedOnly ? colors.primaryDark : colors.placeholder}
                fill={savedOnly ? colors.primaryDark : "none"}
              />
            </Pressable>
          </View>
        )}
      </View>

      {lens === "communities" ? (
        <CommunitiesTab />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}>
          {/* Liveness strip + today rail */}
          {lens === "nearby" && liveCount > 0 && (
            <View>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>
                  {liveCount} hangout{liveCount === 1 ? "" : "s"} happening near you today
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
                {todayHangs.map((h) => (
                  <Pressable
                    key={h.id}
                    onPress={() => router.push({ pathname: "/post/[id]", params: { id: h.id } })}
                    style={styles.todayChip}
                  >
                    <Text style={styles.todayTime}>{h.time ? hangoutTime(h.time) : ""}</Text>
                    <Text style={styles.todayBody} numberOfLines={1}>
                      {h.venue ?? h.body}
                    </Text>
                    <Text style={styles.todayGoing}>{h.goingIds.length} going</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* First-run nudge */}
          {lens === "nearby" && firstRun && (
            <View style={[styles.nudge, sh.cardShadow]}>
              <Pressable onPress={dismissFirstRun} style={styles.nudgeClose} hitSlop={8}>
                <X size={16} color={colors.muted} />
              </Pressable>
              <Text style={styles.nudgeTitle}>Welcome to {me.homeLabel.split(" (")[0]}, {me.name.split(" ")[0]} 👋</Text>
              <Text style={styles.nudgeSub}>
                The fastest way in: tap <Text style={{ fontWeight: "700" }}>I'm in</Text> on
                something below — or post your own low-key hangout. Coffee counts.
              </Text>
              <Pressable onPress={() => router.push("/create")} style={styles.nudgeBtn}>
                <Text style={styles.nudgeBtnText}>Post a hangout</Text>
              </Pressable>
            </View>
          )}

          {list.map((h) => (
            <PostCard key={h.id} hang={h} />
          ))}

          {/* Finite-feed floor — an honest stop cue, not infinite scroll
              (anti-doom-scroll; see DESIGN_NOTES §10). */}
          {list.length > 0 && lens === "nearby" && (
            <View style={styles.caughtUp}>
              <Text style={styles.caughtUpTitle}>You're all caught up ✓</Text>
              <Text style={styles.caughtUpSub}>
                That's the whole bulletin right now. No endless scroll here — go say hi to
                someone, or check back later.
              </Text>
            </View>
          )}

          {/* Empty state as a seeding invitation, not a dead end
              (cold-start "ghost town" fix; see DESIGN_NOTES §3 / §14). */}
          {list.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 34 }}>{savedOnly ? "🔖" : "👋"}</Text>
              <Text style={styles.emptyTitle}>
                {savedOnly ? "No saved tips yet" : `Be the first in ${me.homeLabel.split(" (")[0]}`}
              </Text>
              <Text style={sh.centerSub}>
                {savedOnly
                  ? "Tap the bookmark on any tip to keep it here."
                  : "Quiet right now — that's your opening. Post a low-key hangout and people nearby will see it."}
              </Text>
              {!savedOnly && (
                <Pressable onPress={() => router.push("/create")} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>Post the first hangout</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Compose FAB */}
      <Pressable onPress={() => router.push("/create")} style={[styles.fab, fabShadow]}>
        <Plus size={26} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 10 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { fontSize: 18, fontWeight: "800", color: colors.primaryDark, letterSpacing: -0.4 },
  msgDot: {
    position: "absolute",
    top: -2,
    right: -3,
    height: 9,
    width: 9,
    borderRadius: 5,
    backgroundColor: "#ff3b30",
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  countBadge: {
    position: "absolute",
    top: -7,
    right: -9,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDark,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  countBadgeText: { fontSize: 9, fontWeight: "800", color: colors.white },
  headline: { marginTop: 6, fontSize: 21, fontWeight: "800", color: colors.foreground },
  locRow: { marginTop: 3, flexDirection: "row", alignItems: "center", gap: 4 },
  locText: { fontSize: 12, fontWeight: "600", color: colors.primaryDark },
  lensRow: { marginTop: 12, flexDirection: "row", borderRadius: 999, backgroundColor: colors.background, padding: 4 },
  lens: { flex: 1, borderRadius: 999, paddingVertical: 6 },
  lensText: { textAlign: "center", fontSize: 12 },
  searchRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 0 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  liveDot: { height: 8, width: 8, borderRadius: 4, backgroundColor: colors.live },
  liveText: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  todayChip: {
    width: 170,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 2,
  },
  todayTime: { fontSize: 12, fontWeight: "700", color: colors.primaryDark },
  todayBody: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  todayGoing: { fontSize: 11, color: colors.muted },
  nudge: { borderRadius: radiusCard, backgroundColor: colors.primaryLight, padding: 16 },
  nudgeClose: { position: "absolute", right: 10, top: 10 },
  nudgeTitle: { fontSize: 15, fontWeight: "800", color: colors.primaryDeep },
  nudgeSub: { marginTop: 4, fontSize: 13, lineHeight: 19, color: colors.primaryDeep },
  nudgeBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  nudgeBtnText: { fontSize: 13, fontWeight: "700", color: colors.white },
  caughtUp: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 24, gap: 4 },
  caughtUpTitle: { fontSize: 14, fontWeight: "700", color: colors.primaryDark },
  caughtUpSub: { textAlign: "center", fontSize: 13, lineHeight: 19, color: colors.muted },
  emptyWrap: { alignItems: "center", paddingVertical: 44, paddingHorizontal: 24, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  emptyBtn: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyBtnText: { fontSize: 13, fontWeight: "700", color: colors.white },
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
