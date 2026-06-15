import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Bookmark,
  CheckCircle2,
  Lock,
  MessageCircle,
  Repeat,
  ThumbsUp,
  Users,
} from "lucide-react-native";

import { useStore, type Hang } from "../lib/store";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { hangoutTime, metersToMiles, relativeTime } from "../lib/format";
import { colors, radiusCard } from "../theme/colors";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { SafetyMenu } from "./SafetyMenu";

/** One posterboard card — the whole hangout loop lives here. */
export function PostCard({ hang }: { hang: Hang }) {
  const router = useRouter();
  const store = useStore();
  const { personOf, rsvp, withdraw, thank, toggleSave } = store;

  const author = personOf(hang.authorId);
  const isHangout = hang.type === "hangout";
  const going = hang.goingIds.includes("me");
  const interested = hang.interestedIds.includes("me");
  const goingCount = hang.goingIds.length;
  const spotsLeft = hang.capacity !== null ? Math.max(0, hang.capacity - goingCount) : null;
  const isFull = spotsLeft === 0 && !going;
  const isPast = hang.time !== null && new Date(hang.time).getTime() < Date.now() - 3 * 3600_000;
  const distance = metersToMiles(hang.distanceM);

  // City Expert: their tips have collectively earned recognition (ADR-0018).
  const expert =
    store.hangs
      .filter((h) => h.type === "tip" && h.authorId === hang.authorId)
      .reduce((acc, h) => acc + h.thanks + h.saves, 0) >= 5;

  const attendees = hang.goingIds.slice(0, 3).map(personOf);
  const moreGoing = Math.max(0, goingCount - attendees.length);

  function openDetail() {
    router.push({ pathname: "/post/[id]", params: { id: hang.id } });
  }

  function handleJoin() {
    rsvp(hang.id, "going");
    showToast("You're in — added to your Hangouts 🎉");
    // Staged permission ask: only after the first real "I'm in" (the aha),
    // never at install. One shot — declining defers to Settings.
    if (!store.notifAsked) {
      store.markNotifAsked();
      showAlert(
        "Get a heads-up before this one?",
        "We'll remind you before each hangout you join and ping you if the plan changes. Nothing else — no streaks, no spam.",
        [
          { text: "Not now", style: "cancel" },
          {
            text: "Turn on reminders",
            onPress: () => {
              store.enablePush();
              showToast("You're set — reminders on 🔔");
            },
          },
        ],
      );
    }
  }

  function confirmWithdraw() {
    showAlert("Can't make it?", "Withdrawing frees your spot for someone else.", [
      { text: "Keep my spot", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: () => {
          withdraw(hang.id);
          showToast("Spot freed — thanks for the heads up");
        },
      },
    ]);
  }

  return (
    <Pressable onPress={openDetail} style={[styles.card, cardShadow]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerLeft}
          onPress={() => router.push({ pathname: "/person/[id]", params: { id: author.id } })}
        >
          <Avatar name={author.name} src={author.avatar} size="md" verified={author.verified} />
          <View style={{ flexShrink: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>{author.name}</Text>
              {expert && (
                <View style={styles.expertBadge}>
                  <Text style={styles.expertText}>City Expert</Text>
                </View>
              )}
            </View>
            <Text style={styles.metaText}>
              {distance ? `${distance} · ` : ""}
              {relativeTime(hang.createdAt)}
            </Text>
          </View>
        </Pressable>
        <View style={styles.headerRight}>
          {hang.recurrence !== null && (
            <View style={styles.weeklyChip}>
              <Repeat size={11} color={colors.primaryDark} />
              <Text style={styles.weeklyText}>{hang.recurrence}</Text>
            </View>
          )}
          <SafetyMenu targetId={author.id} targetName={author.name} />
        </View>
      </View>

      {/* Body */}
      <Text style={styles.body}>{hang.body}</Text>

      {/* Venue + time */}
      {hang.venue && (
        <Text style={styles.venue}>
          📍 {hang.venue}
          {hang.time ? ` · ${hangoutTime(hang.time)}` : ""}
        </Text>
      )}

      {/* Audience (narrower than "everyone" shows the lock; demographic
          refinements show as "For:" so nobody shows up unwelcome) */}
      {hang.audience !== "everyone" ? (
        <View style={styles.audienceRow}>
          <Lock size={11} color={colors.muted} />
          <Text style={styles.metaText}>
            {hang.audience === "connections" ? "Connections only" : "Invite only"}
          </Text>
        </View>
      ) : hang.audienceAge !== null || hang.audiencePronouns !== null ? (
        <View style={styles.audienceRow}>
          <Users size={11} color={colors.muted} />
          <Text style={styles.metaText}>
            For:{" "}
            {[
              hang.audienceAge
                ? hang.audienceAge[1] >= 99
                  ? `${hang.audienceAge[0]}+`
                  : `ages ${hang.audienceAge[0]}–${hang.audienceAge[1]}`
                : null,
              hang.audiencePronouns ? hang.audiencePronouns.join(" / ") : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      ) : null}

      {/* Who's going */}
      {isHangout && attendees.length > 0 && (
        <View style={styles.attendRow}>
          <View style={{ flexDirection: "row" }}>
            {attendees.map((a, i) => (
              <View key={a.id} style={i > 0 ? { marginLeft: -8 } : undefined}>
                <Avatar name={a.name} src={a.avatar} size="sm" />
              </View>
            ))}
          </View>
          <Text style={styles.attendText} numberOfLines={1}>
            {attendees.map((a) => a.name.split(" ")[0]).join(", ")}
            {moreGoing > 0 ? ` +${moreGoing}` : ""} going
          </Text>
        </View>
      )}

      {/* Hashtags */}
      {hang.hashtags.length > 0 && (
        <View style={styles.tagRow}>
          {hang.hashtags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Pressable onPress={openDetail} style={styles.statItem} hitSlop={6}>
            <MessageCircle size={15} color={colors.muted} />
            <Text style={styles.metaText}>{hang.comments.length}</Text>
          </Pressable>
          {hang.type === "tip" && hang.thanks > 0 && (
            <View style={styles.statItem}>
              <ThumbsUp size={14} color={colors.muted} />
              <Text style={styles.metaText}>{hang.thanks}</Text>
            </View>
          )}
          <Pressable onPress={() => toggleSave(hang.id)} style={styles.statItem} hitSlop={6}>
            <Bookmark
              size={15}
              color={hang.savedByMe ? colors.primaryDark : colors.muted}
              fill={hang.savedByMe ? colors.primaryDark : "none"}
            />
            {hang.saves > 0 && <Text style={styles.metaText}>{hang.saves}</Text>}
          </Pressable>
          {isHangout && goingCount > 0 && (
            <View style={styles.statItem}>
              <Users size={15} color={colors.muted} />
              <Text style={styles.metaText}>
                {goingCount}
                {hang.capacity !== null ? `/${hang.capacity}` : ""} in
              </Text>
            </View>
          )}
          {isHangout && spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 2 && (
            <Text style={styles.spotsText}>
              {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
            </Text>
          )}
        </View>

        {isHangout ? (
          isPast ? (
            <Text style={styles.metaText}>happened {relativeTime(hang.time ?? hang.createdAt)}</Text>
          ) : isFull ? (
            <Button
              size="sm"
              variant="outlined"
              style={styles.pillBtn}
              onPress={() => showToast("We'll ping you if a spot opens 🤞")}
            >
              <Text style={styles.fullText}>Full · Notify me</Text>
            </Button>
          ) : (
            <View style={styles.ctaRow}>
              {!going && (
                <Button
                  size="sm"
                  variant={interested ? "secondary" : "outlined"}
                  style={styles.pillBtn}
                  onPress={() =>
                    interested ? withdraw(hang.id) : rsvp(hang.id, "interested")
                  }
                >
                  <Text
                    style={{
                      fontSize: 13,
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
                style={styles.pillBtn}
                onPress={() => (going ? confirmWithdraw() : handleJoin())}
              >
                <View style={styles.ctaInner}>
                  <CheckCircle2 size={14} color={going ? colors.primaryDark : colors.white} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: going ? colors.primaryDark : colors.white,
                    }}
                  >
                    {going ? "You're in" : "I'm in"}
                  </Text>
                </View>
              </Button>
            </View>
          )
        ) : (
          <Button
            size="sm"
            variant={hang.thankedByMe ? "secondary" : "outlined"}
            style={styles.pillBtn}
            onPress={() => {
              if (hang.thankedByMe) return;
              thank(hang.id);
              showToast("Thanks sent 🙌");
            }}
          >
            <View style={styles.ctaInner}>
              <ThumbsUp size={13} color={hang.thankedByMe ? colors.primaryDark : colors.muted} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: hang.thankedByMe ? colors.primaryDark : colors.muted,
                }}
              >
                {hang.thankedByMe ? "Thanked ✓" : "Thanks!"}
              </Text>
            </View>
          </Button>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 16 },
  header: { marginBottom: 10, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  authorName: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  expertBadge: { borderRadius: 999, backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2 },
  expertText: { fontSize: 10, fontWeight: "700", color: colors.primaryDark },
  metaText: { fontSize: 12, color: colors.muted },
  weeklyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  weeklyText: { fontSize: 11, fontWeight: "700", color: colors.primaryDark },
  body: { marginBottom: 10, fontSize: 14, lineHeight: 20, color: colors.foreground },
  venue: { marginBottom: 8, fontSize: 12, fontWeight: "500", color: colors.muted },
  audienceRow: { marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 4 },
  attendRow: { marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  attendText: { flex: 1, fontSize: 12, color: colors.muted },
  tagRow: { marginBottom: 10, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, fontWeight: "500", color: colors.muted },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  spotsText: { fontSize: 12, fontWeight: "600", color: colors.amber },
  fullText: { fontSize: 13, fontWeight: "600", color: colors.amber },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctaInner: { flexDirection: "row", alignItems: "center", gap: 4 },
  pillBtn: { borderRadius: 999 },
});

const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
