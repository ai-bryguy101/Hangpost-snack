import { useState, type ReactNode } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, BadgeCheck, GraduationCap, MapPin, ShieldAlert, Users } from "lucide-react-native";

import { useStore, type Me } from "../lib/store";
import { DEMO_ME } from "../data/seed";
import { HOBBY_GROUPS, INTEREST_GROUPS, LIKE_GROUPS } from "../data/interests";
import { PLACES, RADII, type Place } from "../lib/places";
import { CITIES } from "../lib/cities";
import { COLLEGES } from "../lib/colleges";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "../components/ui/Button";
import { GroupedTagPicker } from "../components/GroupedTagPicker";
import { PlacePicker } from "../components/PlacePicker";
import { ComboField } from "../components/ComboField";

/** 5-step onboarding: about → what you're into → intro + photo verify →
 * home base → contacts. Every field is structured (no free bio — ADR-0008's
 * capped intro is the only prose). */

const STEPS = 5;

const PRONOUNS = ["she/her", "he/him", "they/them"];
const PHOTO_OPTIONS = [5, 11, 15, 32, 49, 56].map((n) => `https://i.pravatar.cc/150?img=${n}`);

export function OnboardingScreen({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { setMe, syncContacts } = useStore();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [dob, setDob] = useState("");
  const [pronouns, setPronouns] = useState<string | null>(null);
  const [hometown, setHometown] = useState("");
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [job, setJob] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [intro, setIntro] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [photoVerified, setPhotoVerified] = useState(false);
  const [place, setPlace] = useState<Place>(PLACES[0]);
  const [radiusIdx, setRadiusIdx] = useState(2);
  const [newInTown, setNewInTown] = useState(true);

  // 18+ only: birthday is the gate, not a free-text age (how the big apps
  // do it — DOB at signup, hard block under 18, ID escalation later).
  const dobAge = (() => {
    const m = dob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const birth = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
    if (Number.isNaN(birth.getTime()) || birth.getFullYear() < 1900) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const beforeBirthday =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (beforeBirthday) years -= 1;
    return years;
  })();
  const underage = dobAge !== null && dobAge < 18;

  const pickedTotal = hobbies.length + interests.length + likes.length;
  const canNext =
    step === 0
      ? name.trim().length > 0 && handle.trim().length >= 3 && dobAge !== null && !underage
      : step === 1
        ? pickedTotal >= 3
        : true;

  function finish(withContacts: boolean) {
    const me: Me = {
      ...DEMO_ME,
      name: name.trim(),
      handle: handle.trim().toLowerCase(),
      age: dobAge,
      pronouns,
      hometown: hometown.trim() || null,
      college: college.trim() || null,
      major: major.trim() || null,
      job: job.trim() || null,
      hobbies,
      interests,
      likes,
      intro: intro.trim() || null,
      avatar,
      verified: photoVerified,
      photoVerified,
      phoneVerified: true,
      homeLabel: place.label,
      radiusMi: [3, 5, 9, 15][radiusIdx],
      newInTown,
      newSince: newInTown ? new Date().toISOString() : null,
    };
    setMe(me);
    if (withContacts) {
      const found = syncContacts();
      showToast(`Found ${found} people you already know 👋`);
    }
    onDone();
  }

  if (underage) {
    return (
      <View style={[sh.root, { paddingTop: insets.top }]}>
        <View style={[sh.center, { gap: 14 }]}>
          <ShieldAlert size={40} color={colors.amber} />
          <Text style={{ fontSize: 19, fontWeight: "800", color: colors.foreground }}>
            Hangpost is 18+
          </Text>
          <Text style={sh.centerSub}>
            For everyone's trust and safety, you have to be 18 or older to use Hangpost. We'd love
            to see you when you get there.
          </Text>
          <Button variant="outlined" onPress={() => setDob("")} style={{ borderRadius: 999 }}>
            I mistyped my birthday
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => (step === 0 ? onBack() : setStep(step - 1))} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>
          {["About you", "What are you into?", "Your intro", "Your home base", "Find your people"][step]}
        </Text>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && { backgroundColor: colors.primaryDark }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 110 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Text style={sh.centerSub}>
              Structured details — the connections engine uses these to introduce you to people
              worth meeting.
            </Text>
            <Field label="Your name">
              <TextInput value={name} onChangeText={setName} placeholder="Alex Rivera" placeholderTextColor={colors.placeholder} style={sh.input} maxLength={50} />
            </Field>
            <Field label="Handle">
              <TextInput value={handle} onChangeText={setHandle} placeholder="alexrivera" autoCapitalize="none" placeholderTextColor={colors.placeholder} style={sh.input} maxLength={30} />
            </Field>
            <Field label="Birthday" hint="Hangpost is 18+ — your birthday is never shown, just your age">
              <TextInput
                value={dob}
                onChangeText={setDob}
                placeholder="MM/DD/YYYY"
                keyboardType="numbers-and-punctuation"
                placeholderTextColor={colors.placeholder}
                style={sh.input}
                maxLength={10}
              />
            </Field>
            <Field label="Pronouns" hint="optional — shown on your profile only if you pick one">
              <View style={styles.chipRow}>
                {PRONOUNS.map((p) => {
                  const on = pronouns === p;
                  return (
                    <Pressable key={p} onPress={() => setPronouns(on ? null : p)} style={[styles.choiceChip, on ? styles.choiceOn : styles.choiceOff]}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: on ? colors.white : colors.muted }}>{p}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
            <ComboField
              label="Hometown"
              hint="a strong friendship signal — people from home rank higher"
              value={hometown}
              onChangeText={setHometown}
              options={CITIES}
              placeholder="Columbus, OH"
              icon={MapPin}
            />
            <ComboField
              label="College"
              hint="optional — pick yours so fellow alumni match"
              value={college}
              onChangeText={setCollege}
              options={COLLEGES}
              placeholder="Ohio State University"
              icon={GraduationCap}
            />
            <Field label="Major" hint="a surprisingly strong friendship signal — optional">
              <TextInput value={major} onChangeText={setMajor} placeholder="Finance" placeholderTextColor={colors.placeholder} style={sh.input} />
            </Field>
            <Field label="Job" hint='works best as "role at employer" — optional'>
              <TextInput value={job} onChangeText={setJob} placeholder="Consulting analyst at Deloitte" placeholderTextColor={colors.placeholder} style={sh.input} />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={sh.centerSub}>
              The more you share, the better we match you — and the better the hangouts and tips we
              can put in front of you. From your weekly run club to the niche band only you know. Tap
              everything that's actually you.
            </Text>
            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                {pickedTotal === 0
                  ? "Nothing picked yet — start tapping 👇"
                  : pickedTotal < 5
                    ? `${pickedTotal} picked · a few more makes your matches way better`
                    : `${pickedTotal} picked · love it 🎉`}
              </Text>
            </View>
            <Field label="What do you actually do?" hint="your weekly hobbies — the stuff you'd invite someone along to">
              <GroupedTagPicker groups={HOBBY_GROUPS} selected={hobbies} onChange={setHobbies} addPlaceholder="Add a hobby…" />
            </Field>
            <Field label="What are you into around town?" hint="the scenes and things you're drawn to">
              <GroupedTagPicker groups={INTEREST_GROUPS} selected={interests} onChange={setInterests} addPlaceholder="Add an interest…" />
            </Field>
            <Field label="Your taste — what you'd talk about all night" hint="music, shows, books… add the niche artist only you know">
              <GroupedTagPicker groups={LIKE_GROUPS} selected={likes} onChange={setLikes} addPlaceholder="Add a band, artist, show, author…" />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Your intro" hint={`one line people see first · ${140 - intro.length} left`}>
              <TextInput
                value={intro}
                onChangeText={(v) => v.length <= 140 && setIntro(v)}
                placeholder="New in DC — down for coffee, climbs, and live music."
                placeholderTextColor={colors.placeholder}
                multiline
                style={[sh.input, { minHeight: 70 }]}
              />
            </Field>
            <Field label="Profile photo" hint="one photo — so people recognize the real you at the meetup">
              <View style={styles.photoRow}>
                {PHOTO_OPTIONS.map((uri) => (
                  <Pressable key={uri} onPress={() => { setAvatar(uri); setPhotoVerified(false); }}>
                    <Image
                      source={{ uri }}
                      style={[styles.photo, avatar === uri && { borderColor: colors.primaryDark, borderWidth: 3 }]}
                    />
                  </Pressable>
                ))}
              </View>
            </Field>
            {avatar && (
              <Pressable
                onPress={() => { setPhotoVerified(true); showToast("Photo verified — that's really you ✓"); }}
                style={[styles.verifyRow, photoVerified && { backgroundColor: colors.primaryLight }]}
              >
                <BadgeCheck size={18} color={colors.primaryDark} />
                <Text style={styles.verifyText}>
                  {photoVerified ? "Photo verified" : "Verify it's you (quick selfie check)"}
                </Text>
              </Pressable>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <Text style={sh.centerSub}>
              Hangpost is scoped to ONE place you choose. You'll see and post to this area — even
              while travelling. Moving soon? Set your future city for a head start.
            </Text>
            <PlacePicker selected={place} onSelect={setPlace} />
            <Field label="Radius">
              <View style={styles.chipRow}>
                {RADII.map((r, i) => {
                  const on = radiusIdx === i;
                  return (
                    <Pressable key={r.label} onPress={() => setRadiusIdx(i)} style={[styles.choiceChip, on ? styles.choiceOn : styles.choiceOff]}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: on ? colors.white : colors.muted }}>{r.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
            <Pressable onPress={() => setNewInTown((v) => !v)} style={[styles.verifyRow, newInTown && { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 18 }}>👋</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.verifyText}>I'm new in town</Text>
                <Text style={sh.hint}>Other newcomers can find you — two people who just moved are a great match.</Text>
              </View>
            </Pressable>
          </>
        )}

        {step === 4 && (
          <View style={[sh.center, { gap: 16, paddingTop: 24 }]}>
            <View style={styles.contactsIcon}>
              <Users size={30} color={colors.primaryDark} />
            </View>
            <Text style={styles.bigTitle}>Friends-of-friends is the #1 way people make friends</Text>
            <Text style={sh.centerSub}>
              Sync contacts to find people you already know — and unlock connections through them. We
              only check scrambled hashes; your contacts never leave your phone.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: insets.bottom + 12 }]}>
        {step < 4 ? (
          <Button onPress={() => setStep(step + 1)} disabled={!canNext} style={{ alignSelf: "stretch" }}>
            Continue
          </Button>
        ) : (
          <View style={{ gap: 8 }}>
            <Button onPress={() => finish(true)} style={{ alignSelf: "stretch" }}>
              Sync contacts &amp; finish
            </Button>
            <Button variant="outlined" onPress={() => finish(false)} style={{ alignSelf: "stretch" }}>
              Skip for now
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View>
      <Text style={sh.fieldLabel}>{label}</Text>
      {children}
      {hint && <Text style={sh.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: "row", gap: 5 },
  dot: { height: 6, width: 6, borderRadius: 3, backgroundColor: colors.border },
  counterPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: { fontSize: 12, fontWeight: "700", color: colors.primaryDeep },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choiceChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  choiceOn: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  choiceOff: { backgroundColor: colors.surface, borderColor: colors.border },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photo: { height: 64, width: 64, borderRadius: 32, borderWidth: 3, borderColor: "transparent" },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  verifyText: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  contactsIcon: {
    height: 72,
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  bigTitle: { textAlign: "center", fontSize: 18, fontWeight: "700", lineHeight: 25, color: colors.foreground },
  footerBar: {
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
