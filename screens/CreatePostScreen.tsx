import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Lock, MapPin, Users } from "lucide-react-native";

import { useStore, type Audience } from "../lib/store";
import { useLocalSearchParams, useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { hangoutTime } from "../lib/format";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { CalendarPicker } from "../components/CalendarPicker";

/** The composer: hangout/tip toggle, a real calendar + time, recurrence
 * (daily / weekly / specific days), venue, spots, and audience targeting —
 * incl. optional demographic refinements (age range, pronouns) on
 * "everyone" posts. All privacy levers live with the POSTER. */

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const AGE_PRESETS: { label: string; range: [number, number] | null }[] = [
  { label: "Any age", range: null },
  { label: "18–24", range: [18, 24] },
  { label: "21–30", range: [21, 30] },
  { label: "25–35", range: [25, 35] },
  { label: "30+", range: [30, 99] },
];
const PRONOUN_OPTIONS = ["she/her", "he/him", "they/them"];

/** One-tap starters that prefill an editable draft — the fix for the
 * blank-page problem (the #1 reason people lurk instead of post). Tapping
 * one drops in a friendly, low-stakes draft (and a sensible time for
 * hangouts) that the user can edit. Research: low-friction posting + the
 * lurker→poster ladder (see DESIGN_NOTES §14). */
const HANGOUT_STARTERS: { emoji: string; label: string; body: string; hour: number }[] = [
  { emoji: "☕", label: "Coffee", body: "Grabbing coffee and getting some work done — anyone want to co-work for a couple hours? ☕", hour: 10 },
  { emoji: "🏃", label: "Run", body: "Easy morning run, all paces welcome — come say hi. 🏃", hour: 8 },
  { emoji: "🍻", label: "Drinks", body: "Grabbing a drink after work — pull up, the more the merrier. 🍻", hour: 18 },
  { emoji: "🍜", label: "Dinner", body: "Dinner crew? Trying somewhere new — looking for a few people to join. 🍜", hour: 19 },
  { emoji: "🎲", label: "Games", body: "Board-games night — bring nothing but yourself, all skill levels. 🎲", hour: 19 },
  { emoji: "🚶", label: "Walk", body: "Going for a walk to explore the neighborhood — join me? 🚶", hour: 17 },
];

const TIP_STARTERS: { emoji: string; label: string; body: string }[] = [
  { emoji: "🍴", label: "Food rec", body: "Local food rec: " },
  { emoji: "🚇", label: "Transit", body: "Transit heads-up: " },
  { emoji: "🎟️", label: "Free event", body: "Free thing to do this week: " },
  { emoji: "💡", label: "New in town", body: "If you just moved here: " },
];

function hourLabel(h: number): string {
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { me, createHang, communities, edges, personOf } = useStore();
  const { communityId } = useLocalSearchParams<{ communityId?: string }>();

  const [type, setType] = useState<"hangout" | "tip">("hangout");
  const [body, setBody] = useState("");
  const [venue, setVenue] = useState("");
  const [day, setDay] = useState<Date | null>(new Date());
  const [hour, setHour] = useState<number | null>(null);
  const [repeat, setRepeat] = useState<"none" | "daily" | "weekly" | "days">("none");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [capacity, setCapacity] = useState("");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [agePreset, setAgePreset] = useState(0);
  const [pronouns, setPronouns] = useState<string[]>([]);
  const [inviteIds, setInviteIds] = useState<string[]>([]);

  const community = communities.find((c) => c.id === communityId);
  const connections = Object.entries(edges)
    .filter(([, s]) => s === "connected")
    .map(([id]) => personOf(id));

  function whenISO(): string | null {
    if (!day) return null;
    const d = new Date(day);
    d.setHours(hour ?? 18, 0, 0, 0);
    if (d.getTime() < Date.now()) d.setTime(Date.now() + 2 * 3600_000);
    return d.toISOString();
  }

  function recurrenceLabel(): string | null {
    if (repeat === "daily") return "Daily";
    if (repeat === "weekly") return "Weekly";
    if (repeat === "days" && repeatDays.length > 0)
      return repeatDays
        .slice()
        .sort((a, b) => a - b)
        .map((i) => DAYS_SHORT[i])
        .join(" · ");
    return null;
  }

  function applyStarter(s: { body: string; hour?: number }) {
    setBody(s.body);
    if (type === "hangout" && s.hour !== undefined) setHour(s.hour);
  }

  function submit() {
    const cap = parseInt(capacity, 10);
    createHang({
      type,
      body: body.trim(),
      venue: venue.trim() || null,
      time: type === "hangout" ? whenISO() : null,
      capacity: Number.isFinite(cap) && cap >= 2 ? cap : null,
      recurrence: recurrenceLabel(),
      audience,
      audienceAge: audience === "everyone" ? AGE_PRESETS[agePreset].range : null,
      audiencePronouns: audience === "everyone" && pronouns.length > 0 ? pronouns : null,
      inviteIds,
      communityId: communityId ?? null,
    });
    showToast(type === "hangout" ? "Posted — it's in your Hangouts 🎉" : "Tip posted — thanks for the local knowledge");
    router.back();
  }

  const preview = whenISO();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>New post</Text>
        <Button size="sm" onPress={submit} disabled={body.trim().length === 0} style={{ borderRadius: 999 }}>
          Post
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }} keyboardShouldPersistTaps="handled">
        {community && (
          <View style={styles.communityBanner}>
            <Text style={{ fontSize: 16 }}>{community.emoji}</Text>
            <Text style={styles.communityText}>Posting to {community.name}</Text>
          </View>
        )}

        {/* Type */}
        <View>
          <View style={styles.toggleRow}>
            {(["hangout", "tip"] as const).map((tk) => {
              const on = type === tk;
              return (
                <Pressable key={tk} onPress={() => setType(tk)} style={[styles.toggle, on && { backgroundColor: colors.surface }]}>
                  <Text style={[styles.toggleText, on ? { fontWeight: "700", color: colors.foreground } : { fontWeight: "500", color: colors.muted }]}>
                    {tk === "hangout" ? "Hangout" : "Local tip"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={sh.hint}>
            {type === "hangout"
              ? 'Invite nearby people to join you — "Anyone down for coffee at 3?"'
              : "Share something useful — best happy hour, transit hacks, hidden gems. #hashtags make it searchable."}
          </Text>
          {type === "tip" && (
            <Text style={styles.boardRule}>
              Places, never people — tips about a person or group come down.
              Review the café, not the barista.
            </Text>
          )}
        </View>

        {/* Quick-start templates — the fix for the blank-page problem.
            Shown until there's a draft; tapping one prefills editable copy. */}
        {body.trim().length === 0 && (
          <View>
            <Text style={sh.fieldLabel}>Quick start</Text>
            <View style={styles.chipRow}>
              {(type === "hangout" ? HANGOUT_STARTERS : TIP_STARTERS).map((s) => (
                <Pressable key={s.label} onPress={() => applyStarter(s)} style={[styles.chip, styles.chipOff]}>
                  <Text style={styles.starterText}>
                    {s.emoji} {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {type === "hangout" && (
              <Text style={sh.hint}>
                Low-key counts — you're opening a door, not hosting an event. Tap one, then edit anything.
              </Text>
            )}
          </View>
        )}

        {/* Body */}
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={2000}
          placeholder={type === "hangout" ? "What are you up to? Who should join?" : "What do locals need to know?"}
          placeholderTextColor={colors.placeholder}
          style={[sh.input, { minHeight: 110, textAlignVertical: "top" }]}
        />

        {type === "hangout" && (
          <>
            <View>
              <Text style={sh.fieldLabel}>Venue</Text>
              <TextInput
                value={venue}
                onChangeText={setVenue}
                placeholder="e.g. Compass Coffee, Dupont Circle"
                placeholderTextColor={colors.placeholder}
                style={sh.input}
              />
              <Text style={sh.hint}>A public place — that's the Hangpost way.</Text>
            </View>

            {/* When: a real calendar + time */}
            <View>
              <Text style={sh.fieldLabel}>When{preview ? ` — ${hangoutTime(preview)}` : ""}</Text>
              <CalendarPicker selected={day} onSelect={setDay} />
              <View style={[styles.chipRow, { marginTop: 10 }]}>
                <Pressable onPress={() => setHour(null)} style={[styles.chip, hour === null ? styles.chipOn : styles.chipOff]}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: hour === null ? colors.white : colors.muted }}>
                    Flexible
                  </Text>
                </Pressable>
                {HOURS.map((h) => {
                  const on = hour === h;
                  return (
                    <Pressable key={h} onPress={() => setHour(on ? null : h)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: on ? colors.white : colors.muted }}>
                        {hourLabel(h)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Recurrence: daily / weekly / specific days */}
            <View>
              <Text style={sh.fieldLabel}>Repeats</Text>
              <View style={styles.chipRow}>
                {(
                  [
                    { key: "none", label: "One-off" },
                    { key: "daily", label: "Daily" },
                    { key: "weekly", label: "Weekly" },
                    { key: "days", label: "Specific days" },
                  ] as const
                ).map(({ key, label }) => {
                  const on = repeat === key;
                  return (
                    <Pressable key={key} onPress={() => setRepeat(key)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: on ? colors.white : colors.muted }}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {repeat === "days" && (
                <View style={[styles.chipRow, { marginTop: 8 }]}>
                  {DAYS_SHORT.map((d, i) => {
                    const on = repeatDays.includes(i);
                    return (
                      <Pressable
                        key={d}
                        onPress={() =>
                          setRepeatDays((ds) => (on ? ds.filter((x) => x !== i) : [...ds, i]))
                        }
                        style={[styles.dayChip, on ? styles.chipOn : styles.chipOff]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: on ? colors.white : colors.muted }}>{d}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {repeat !== "none" && (
                <Text style={sh.hint}>
                  The same people showing up again is how acquaintances become friends.
                </Text>
              )}
            </View>

            <View>
              <Text style={sh.fieldLabel}>Spots</Text>
              <TextInput
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="No limit — e.g. 6 keeps it cozy"
                placeholderTextColor={colors.placeholder}
                style={sh.input}
              />
            </View>

            {/* Audience */}
            <View>
              <Text style={sh.fieldLabel}>Who can see this</Text>
              <View style={{ gap: 8 }}>
                {(
                  [
                    { key: "everyone", label: "Everyone nearby", sub: `Within your ${me.radiusMi} mi radius`, Icon: MapPin },
                    { key: "connections", label: "My connections", sub: "Only people you've connected with", Icon: Users },
                    { key: "invite", label: "Specific people", sub: "Pick exactly who — always private", Icon: Lock },
                  ] as const
                ).map(({ key, label, sub, Icon }) => {
                  const on = audience === key;
                  return (
                    <Pressable key={key} onPress={() => setAudience(key)} style={[styles.audienceRow, on && { borderColor: colors.primaryDark, backgroundColor: colors.primaryLight }]}>
                      <Icon size={17} color={on ? colors.primaryDark : colors.muted} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rowTitle, on && { color: colors.primaryDeep }]}>{label}</Text>
                        <Text style={sh.hint}>{sub}</Text>
                      </View>
                      <View style={[styles.radio, on && { borderColor: colors.primaryDark }]}>
                        {on && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Demographic refinements — poster-side, optional */}
              {audience === "everyone" && (
                <View style={{ marginTop: 12, gap: 10 }}>
                  <View>
                    <Text style={styles.refineLabel}>Age range (optional)</Text>
                    <View style={styles.chipRow}>
                      {AGE_PRESETS.map((p, i) => {
                        const on = agePreset === i;
                        return (
                          <Pressable key={p.label} onPress={() => setAgePreset(i)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                            <Text style={{ fontSize: 13, fontWeight: "600", color: on ? colors.white : colors.muted }}>{p.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                  <View>
                    <Text style={styles.refineLabel}>Open to (optional — leave empty for everyone)</Text>
                    <View style={styles.chipRow}>
                      {PRONOUN_OPTIONS.map((pr) => {
                        const on = pronouns.includes(pr);
                        return (
                          <Pressable
                            key={pr}
                            onPress={() => setPronouns((ps) => (on ? ps.filter((x) => x !== pr) : [...ps, pr]))}
                            style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                          >
                            <Text style={{ fontSize: 13, fontWeight: "600", color: on ? colors.white : colors.muted }}>{pr}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={sh.hint}>
                      e.g. a she/her-only run club. Filters who SEES the post — they're shown on the
                      card so nobody shows up unwelcome.
                    </Text>
                  </View>
                </View>
              )}

              {audience === "invite" && (
                <View style={{ marginTop: 10, gap: 6 }}>
                  {connections.length === 0 ? (
                    <Text style={sh.hint}>You'll be able to pick people once you have connections.</Text>
                  ) : (
                    connections.map((p) => {
                      const on = inviteIds.includes(p.id);
                      return (
                        <Pressable
                          key={p.id}
                          onPress={() => setInviteIds((ids) => (on ? ids.filter((x) => x !== p.id) : [...ids, p.id]))}
                          style={[sh.personRow, on && { backgroundColor: colors.primaryLight }]}
                        >
                          <Avatar name={p.name} src={p.avatar} size="sm" />
                          <Text style={[sh.personName, { flex: 1 }]}>{p.name}</Text>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: on ? colors.primaryDark : colors.placeholder }}>
                            {on ? "Invited ✓" : "Invite"}
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MapPin size={12} color={colors.muted} />
          <Text style={sh.hint}>Pinned to {me.homeLabel} — your exact location is never shown.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  communityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  communityText: { fontSize: 14, fontWeight: "600", color: colors.primaryDeep },
  toggleRow: { flexDirection: "row", borderRadius: 999, backgroundColor: colors.background, padding: 4 },
  toggle: { flex: 1, borderRadius: 999, paddingVertical: 8 },
  toggleText: { textAlign: "center", fontSize: 14 },
  boardRule: { marginTop: 5, fontSize: 12, lineHeight: 17, fontWeight: "600", color: colors.amber },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 7 },
  dayChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  chipOn: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  chipOff: { backgroundColor: colors.surface, borderColor: colors.border },
  audienceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 13,
  },
  rowTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  refineLabel: { marginBottom: 6, fontSize: 12, fontWeight: "600", color: colors.muted },
  starterText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { height: 10, width: 10, borderRadius: 5, backgroundColor: colors.primaryDark },
});
