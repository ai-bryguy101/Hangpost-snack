import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Bookmark, CheckCircle2, MessageCircle, ThumbsUp, Users } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import {
  addReaction,
  rsvpToHangout,
  withdrawRsvp,
  savePost,
  unsavePost,
} from "../lib/mockApi";
import { hangoutTime, metersToMiles, relativeTime } from "../lib/format";
import type { Post } from "../lib/types";
import { colors, radiusCard } from "../theme/colors";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { SafetyMenu } from "./SafetyMenu";

/** Port of apps/native/components/PostCard.tsx (NativeWind → StyleSheet). */

const THANKS_EMOJI = "👍";

export function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const isHangout = post.type === "hangout";
  const distance = metersToMiles(post.distance_m);
  const posted = relativeTime(post.created_at);
  const imageUrl = post.image_urls[0];

  // Seeded from the server (my_rsvp) so the card survives a refresh without
  // forgetting you're in.
  const [going, setGoing] = useState(post.my_rsvp === "going");
  const [interested, setInterested] = useState(post.my_rsvp === "interested");
  const [rsvpCount, setRsvpCount] = useState(post.rsvp_count);
  const [interestedCount, setInterestedCount] = useState(post.interested_count);
  const [thanked, setThanked] = useState(
    post.reactions.find((r) => r.emoji === THANKS_EMOJI)?.reacted ?? false,
  );
  const [thanksPending, setThanksPending] = useState(false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(post.saved);
  const [savedCount, setSavedCount] = useState(post.saved_count);
  const [savePending, setSavePending] = useState(false);

  const spotsLeft = post.max_rsvps !== null ? Math.max(0, post.max_rsvps - rsvpCount) : null;
  const attendeeNames = post.attendees.map((a) => a.display_name.split(" ")[0]);
  const moreGoing = Math.max(0, rsvpCount - post.attendees.length);

  async function handleRsvp(status: "going" | "interested") {
    if (pending || (status === "going" && going)) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    // Tapping "Interested ✓" again backs out of the soft RSVP.
    if (status === "interested" && interested) {
      await handleWithdraw();
      return;
    }
    setPending(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("no token");
      const res = await rsvpToHangout(post.id, token, status);
      setRsvpCount(res.rsvp_count);
      setInterestedCount(res.interested_count);
      setGoing(res.status === "going");
      setInterested(res.status === "interested");
    } catch {
      // Counts come back authoritative from the server; nothing to roll back.
    } finally {
      setPending(false);
    }
  }

  async function handleWithdraw() {
    if (pending) return;
    setPending(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("no token");
      const res = await withdrawRsvp(post.id, token);
      setRsvpCount(res.rsvp_count);
      setInterestedCount(res.interested_count);
      setGoing(false);
      setInterested(false);
    } catch {
      // Leave state as-is on failure.
    } finally {
      setPending(false);
    }
  }

  // Reliability v1: an explicit exit beats a silent no-show — withdrawing
  // frees the spot and tells the host the real headcount.
  function confirmWithdraw() {
    showAlert("Can't make it?", "Withdrawing frees your spot for someone else.", [
      { text: "Keep my spot", style: "cancel" },
      { text: "Withdraw", style: "destructive", onPress: () => void handleWithdraw() },
    ]);
  }

  async function sendThanks() {
    if (thanksPending || thanked) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setThanksPending(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("no token");
      await addReaction(post.id, THANKS_EMOJI, token);
      setThanked(true);
    } catch {
      // Leave the current state on failure.
    } finally {
      setThanksPending(false);
    }
  }

  async function toggleSave() {
    if (savePending) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setSavePending(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("no token");
      const res = saved ? await unsavePost(post.id, token) : await savePost(post.id, token);
      setSaved(res.saved);
      setSavedCount(res.saved_count);
    } catch {
      // Leave the current save state on failure.
    } finally {
      setSavePending(false);
    }
  }

  return (
    <View style={[styles.card, cardShadow]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar name={post.author.display_name} src={post.author.avatar_url} size="md" />
          <View style={{ flexShrink: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>{post.author.display_name}</Text>
              {post.author.city_expert && (
                <View style={styles.expertBadge}>
                  <Text style={styles.expertText}>City Expert</Text>
                </View>
              )}
            </View>
            <Text style={styles.metaText}>
              {distance ? `${distance} · ` : ""}
              {posted}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {isHangout && <Chip label="Hangout" variant="tinted" />}
          <SafetyMenu
            targetUserId={post.author.user_id}
            targetPostId={post.id}
            targetName={post.author.display_name}
            onBlocked={() => {
              void queryClient.invalidateQueries({ queryKey: ["feed"] });
              void queryClient.invalidateQueries({ queryKey: ["recommendations"] });
            }}
          />
        </View>
      </View>

      {/* Body */}
      <Text style={styles.body}>{post.body}</Text>

      {/* Image */}
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />}

      {/* Venue */}
      {post.venue && (
        <Text style={styles.venue}>
          📍 {post.venue}
          {post.venue_time ? `, ${hangoutTime(post.venue_time)}` : ""}
        </Text>
      )}

      {/* Who's going — the pre-meet trust signal: you can see you won't be
          walking up to strangers alone. */}
      {isHangout && post.attendees.length > 0 && (
        <View style={styles.attendRow}>
          <View style={styles.attendStack}>
            {post.attendees.map((a, i) => (
              <View key={a.user_id} style={i > 0 ? styles.attendOverlap : undefined}>
                <Avatar name={a.display_name} src={a.avatar_url} size="sm" />
              </View>
            ))}
          </View>
          <Text style={styles.attendText} numberOfLines={1}>
            {attendeeNames.join(", ")}
            {moreGoing > 0 ? ` +${moreGoing}` : ""} going
          </Text>
        </View>
      )}

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <View style={styles.hashtags}>
          {post.hashtags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.statItem}>
            <MessageCircle size={15} color={colors.muted} />
            <Text style={styles.metaText}>{post.comment_count}</Text>
          </View>
          <Pressable onPress={toggleSave} disabled={savePending} style={styles.statItem} hitSlop={6}>
            <Bookmark
              size={15}
              color={saved ? colors.primaryDark : colors.muted}
              fill={saved ? colors.primaryDark : "none"}
            />
            {savedCount > 0 && <Text style={styles.metaText}>{savedCount}</Text>}
          </Pressable>
          {isHangout && rsvpCount > 0 && (
            <View style={styles.statItem}>
              <Users size={15} color={colors.muted} />
              <Text style={styles.metaText}>
                {rsvpCount}
                {post.max_rsvps !== null ? `/${post.max_rsvps}` : ""} in
              </Text>
            </View>
          )}
          {isHangout && spotsLeft !== null && spotsLeft <= 2 && (
            <Text style={styles.spotsText}>
              {spotsLeft === 0 ? "Full" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
            </Text>
          )}
          {isHangout && interestedCount > 0 && (
            <Text style={styles.metaText}>{interestedCount} interested</Text>
          )}
        </View>

        {isHangout ? (
          <View style={styles.ctaRow}>
            {!going && (
              <Button
                size="sm"
                variant={interested ? "secondary" : "outlined"}
                onPress={() => handleRsvp("interested")}
                disabled={pending}
                style={styles.pill}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: interested ? colors.primaryDark : colors.muted,
                  }}
                >
                  {interested ? "Interested ✓" : "Interested"}
                </Text>
              </Button>
            )}
            <Button
              size="sm"
              variant={going ? "secondary" : "primary"}
              onPress={() => (going ? confirmWithdraw() : void handleRsvp("going"))}
              loading={pending}
              disabled={pending}
              style={styles.pill}
            >
              <View style={styles.ctaInner}>
                <CheckCircle2 size={14} color={going ? colors.primaryDark : colors.white} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: going ? colors.primaryDark : colors.white,
                  }}
                >
                  {going ? "You're in" : "I'm in"}
                </Text>
              </View>
            </Button>
          </View>
        ) : (
          <Button
            size="sm"
            variant={thanked ? "secondary" : "outlined"}
            onPress={() => void sendThanks()}
            loading={thanksPending}
            disabled={thanked || thanksPending}
            style={styles.pill}
          >
            <View style={styles.ctaInner}>
              <ThumbsUp size={13} color={thanked ? colors.primaryDark : colors.muted} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: thanked ? colors.primaryDark : colors.muted,
                }}
              >
                {thanked ? "Thanked ✓" : "Thanks!"}
              </Text>
            </View>
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 16 },
  header: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  authorName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  expertBadge: {
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  expertText: { fontSize: 10, fontWeight: "600", color: colors.primaryDark },
  metaText: { fontSize: 12, color: colors.muted },
  body: { marginBottom: 12, fontSize: 14, lineHeight: 20, color: colors.foreground },
  image: { marginBottom: 12, height: 160, width: "100%", borderRadius: 12 },
  venue: { marginBottom: 12, fontSize: 12, color: colors.muted },
  attendRow: { marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  attendStack: { flexDirection: "row" },
  attendOverlap: { marginLeft: -8 },
  attendText: { flex: 1, fontSize: 12, color: colors.muted },
  spotsText: { fontSize: 12, fontWeight: "500", color: colors.amber },
  hashtags: { marginBottom: 12, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctaInner: { flexDirection: "row", alignItems: "center", gap: 4 },
  pill: { borderRadius: 999 },
});

const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
