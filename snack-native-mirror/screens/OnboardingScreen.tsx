import { useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ShieldAlert } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { ApiError, createProfile, postUserLocation } from "../lib/mockApi";
import { PLACES, RADII, DEFAULT_RADIUS_M, type Place } from "../lib/places";
import { colors } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { PlacePicker } from "../components/PlacePicker";

/** Port of apps/native/app/onboarding.tsx — profile fields + home base in one
 * flow, so a new sign-up becomes operational entirely in-app. */

function splitList(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const cleaned = part.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken, isSignedIn } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [dob, setDob] = useState("");
  const [hometown, setHometown] = useState("");
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [job, setJob] = useState("");
  const [interests, setInterests] = useState("");
  const [likedTopics, setLikedTopics] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place>(PLACES[0]);
  const [radiusM, setRadiusM] = useState(DEFAULT_RADIUS_M);
  const [error, setError] = useState<string | null>(null);

  // 18+ only: birthday is the gate (mirrors live: DOB at signup, hard block).
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

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      try {
        await createProfile(
          {
            display_name: displayName.trim(),
            handle: handle.trim(),
            age: dobAge,
            hometown: hometown.trim() || null,
            college: college.trim() || null,
            major: major.trim() || null,
            job: job.trim() || null,
            interests: splitList(interests),
            liked_topics: splitList(likedTopics),
          },
          token,
        );
      } catch (err) {
        // 409 = a profile already exists; keep going to set the location.
        if (!(err instanceof ApiError && err.status === 409)) throw err;
      }
      const place = selectedPlace;
      await postUserLocation(
        {
          latitude: place.latitude,
          longitude: place.longitude,
          radius_m: radiusM,
          label: place.label,
        },
        token,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["location", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      router.replace("/first-picks");
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    },
  });

  const canSubmit =
    displayName.trim().length > 0 &&
    handle.trim().length >= 3 &&
    dobAge !== null &&
    !underage &&
    !mutation.isPending;

  if (!isSignedIn) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Text style={styles.centerSub}>Sign in to set up your profile.</Text>
          <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
        </View>
      </View>
    );
  }

  if (underage) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <ShieldAlert size={40} color={colors.amber} />
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
            Hangpost is 18+
          </Text>
          <Text style={styles.centerSub}>
            For everyone's trust and safety, you have to be 18 or older to use Hangpost. We'd love
            to see you when you get there.
          </Text>
          <Button variant="outlined" onPress={() => setDob("")}>
            I mistyped my birthday
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set up your profile</Text>
        <Button
          size="sm"
          onPress={() => mutation.mutate()}
          disabled={!canSubmit}
          loading={mutation.isPending}
          style={{ borderRadius: 999 }}
        >
          Done
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.centerSub}>
          A few details so the connections engine can introduce you to people worth meeting. You can
          edit all of this later.
        </Text>

        <Field label="Display name">
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={50}
            placeholder="Your name"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </Field>
        <Field label="Handle" hint="3–30 chars: letters, digits, underscore">
          <TextInput
            value={handle}
            onChangeText={setHandle}
            maxLength={30}
            autoCapitalize="none"
            placeholder="yourhandle"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </Field>
        <Field label="Birthday" hint="Hangpost is 18+ — your birthday is never shown, just your age">
          <TextInput
            value={dob}
            onChangeText={setDob}
            keyboardType="numbers-and-punctuation"
            placeholder="MM/DD/YYYY"
            placeholderTextColor={colors.placeholder}
            maxLength={10}
            style={styles.input}
          />
        </Field>
        <Field label="Hometown" hint="a soft matching signal — optional">
          <TextInput
            value={hometown}
            onChangeText={setHometown}
            maxLength={120}
            placeholder="e.g. Chicago, IL"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </Field>
        <Field label="College" hint="optional">
          <TextInput
            value={college}
            onChangeText={setCollege}
            maxLength={160}
            placeholder="e.g. University of Michigan"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </Field>
        <Field label="Major" hint="a surprisingly strong friendship signal — optional">
          <TextInput
            value={major}
            onChangeText={setMajor}
            maxLength={120}
            placeholder="e.g. Finance"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </Field>
        <Field label="Job" hint={'works best as "role at employer" — optional'}>
          <TextInput
            value={job}
            onChangeText={setJob}
            maxLength={160}
            placeholder="e.g. Consulting analyst at Deloitte"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </Field>
        <Field label="Interests" hint="comma-separated">
          <TextInput
            value={interests}
            onChangeText={setInterests}
            autoCapitalize="none"
            placeholder="hiking, coffee, live music"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </Field>
        <Field label="Liked topics" hint="comma-separated">
          <TextInput
            value={likedTopics}
            onChangeText={setLikedTopics}
            autoCapitalize="none"
            placeholder="startups, sci-fi, food"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </Field>

        {/* Home base */}
        <View>
          <Text style={styles.fieldLabel}>Home base</Text>
          <Text style={[styles.hint, { marginBottom: 8 }]}>
            The place you&apos;ll see and post to — even while travelling.
          </Text>
          <PlacePicker selected={selectedPlace} onSelect={setSelectedPlace} />
        </View>

        {/* Radius */}
        <View>
          <Text style={styles.fieldLabel}>Radius</Text>
          <View style={styles.radiusRow}>
            {RADII.map((r) => {
              const active = r.meters === radiusM;
              return (
                <Pressable
                  key={r.label}
                  onPress={() => setRadiusM(r.meters)}
                  style={[styles.radiusChip, active ? styles.radiusOn : styles.radiusOff]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: active ? colors.white : colors.muted,
                    }}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={colors.redIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24 },
  centerSub: { textAlign: "center", fontSize: 14, color: colors.muted },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.muted,
  },
  hint: { marginTop: 4, fontSize: 12, color: colors.muted },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
  },
  radiusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  radiusChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  radiusOn: { borderColor: colors.primaryDark, backgroundColor: colors.primaryDark },
  radiusOff: { borderColor: colors.border, backgroundColor: colors.surface },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.redBg,
    padding: 12,
  },
  errorText: { flex: 1, fontSize: 14, color: colors.redText },
});
