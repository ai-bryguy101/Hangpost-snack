import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useStore, type Person } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";

/** "Hang again?" — the re-meet loop, made one tap.
 *
 * The 2nd/3rd hangout is where acquaintances become friends, and it's where
 * almost every app loses people. Rather than ask someone to build another
 * hangout from scratch (the blank-page tax, again) — or fill out a survey —
 * we suggest a pre-defined plan and invite the person with a single tap.
 * Choosing to re-invite IS the "I'd hang again" signal (behavioral, not a
 * rating). See DESIGN_NOTES §10/§14 and DECISIONS_LOG (labels from behavior). */

type Suggestion = { emoji: string; label: string; body: string; hour: number };

const UNIVERSAL: Suggestion[] = [
  { emoji: "☕", label: "Coffee", body: "Want to grab coffee this week? ☕", hour: 10 },
  { emoji: "🚶", label: "Walk", body: "Up for a walk around the neighborhood this week? 🚶", hour: 17 },
  { emoji: "🍜", label: "Bite", body: "Grab a bite somewhere new this week? 🍜", hour: 19 },
];

/** Tailor the lead suggestion to something they actually do (their hobbies/
 * interests), so the invite feels personal — then fall back to universals. */
const ACTIVITY: Record<string, Suggestion> = {
  running: { emoji: "🏃", label: "Run", body: "Want to do an easy run together this week? All paces. 🏃", hour: 8 },
  "trail running": { emoji: "🏃", label: "Run", body: "Trail run this weekend? Easy pace. 🏃", hour: 9 },
  bouldering: { emoji: "🧗", label: "Climb", body: "Bouldering session this week — I'm down to flail around together. 🧗", hour: 18 },
  climbing: { emoji: "🧗", label: "Climb", body: "Climbing session this week? 🧗", hour: 18 },
  "board games": { emoji: "🎲", label: "Games", body: "Board-games night soon? Bring nothing but yourself. 🎲", hour: 19 },
  soccer: { emoji: "⚽", label: "Kickabout", body: "Pickup soccer this week — want in? ⚽", hour: 17 },
  cycling: { emoji: "🚲", label: "Ride", body: "Easy bike ride this weekend? 🚲", hour: 10 },
  biking: { emoji: "🚲", label: "Ride", body: "Easy bike ride this weekend? 🚲", hour: 10 },
  cooking: { emoji: "🍳", label: "Cook", body: "Want to cook something together this week? 🍳", hour: 18 },
  baking: { emoji: "🧁", label: "Bake", body: "Bake-and-hang this weekend? 🧁", hour: 14 },
  yoga: { emoji: "🧘", label: "Yoga", body: "Hit a yoga class together this week? 🧘", hour: 9 },
  photography: { emoji: "📷", label: "Photo walk", body: "Photo walk this weekend? 📷", hour: 11 },
  hiking: { emoji: "🥾", label: "Hike", body: "Want to get a hike in this weekend? 🥾", hour: 9 },
};

function suggestionsFor(p: Person): Suggestion[] {
  const out: Suggestion[] = [];
  for (const tag of [...p.hobbies, ...p.interests]) {
    const a = ACTIVITY[tag.toLowerCase()];
    if (a) {
      out.push(a);
      break;
    }
  }
  for (const u of UNIVERSAL) {
    if (out.length >= 3) break;
    if (!out.some((s) => s.label === u.label)) out.push(u);
  }
  return out.slice(0, 3);
}

function inDaysISO(hour: number, daysOut = 2): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOut);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export function HangAgain({ person, onInvited }: { person: Person; onInvited?: () => void }) {
  const router = useRouter();
  const { createHang } = useStore();
  const [invited, setInvited] = useState(false);
  const first = person.name.split(" ")[0];

  if (invited) {
    return <Text style={styles.done}>Invited {first} 🎉 — it's in your Hangouts</Text>;
  }

  function invite(s: Suggestion) {
    createHang({
      type: "hangout",
      body: s.body,
      venue: null,
      time: inDaysISO(s.hour),
      capacity: null,
      recurrence: null,
      audience: "invite",
      audienceAge: null,
      audiencePronouns: null,
      inviteIds: [person.id],
      communityId: null,
    });
    showToast(`Invited ${first} 🎉 — it's in your Hangouts`);
    setInvited(true);
    onInvited?.();
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>See {first} again?</Text>
      <Text style={styles.sub}>One tap to invite them — no planning from scratch.</Text>
      <View style={styles.row}>
        {suggestionsFor(person).map((s) => (
          <Pressable key={s.label} onPress={() => invite(s)} style={styles.chip}>
            <Text style={styles.chipText}>
              {s.emoji} {s.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => router.push({ pathname: "/create", params: { inviteId: person.id } })}
          style={[styles.chip, styles.ghost]}
        >
          <Text style={styles.ghostText}>Something else</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  title: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  sub: { fontSize: 12, color: colors.muted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.primaryDeep },
  ghost: { backgroundColor: colors.surface, borderColor: colors.border },
  ghostText: { fontSize: 13, fontWeight: "600", color: colors.muted },
  done: { fontSize: 13, fontWeight: "600", color: colors.primaryDark },
});
