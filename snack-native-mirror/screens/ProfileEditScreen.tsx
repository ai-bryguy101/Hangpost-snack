import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Camera, CheckCircle2 } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { ApiError, fetchMyProfile, requestAvatarUploadUrl, updateMyProfile } from "../lib/mockApi";
import { colors } from "../theme/colors";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";

/** Port of apps/native/app/profile-edit.tsx. On live, "Add photo" opens the
 * system photo picker then requests an R2 presigned URL; R2 isn't configured
 * yet, so the API returns 503 and the app shows "Photos not enabled yet".
 * The mirror skips straight to that same 503 path (no picker in Snack web). */

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

export function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken, isSignedIn } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchMyProfile(token);
    },
  });

  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [hometown, setHometown] = useState("");
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [job, setJob] = useState("");
  const [interests, setInterests] = useState("");
  const [likedTopics, setLikedTopics] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name);
    setAge(profile.age ? String(profile.age) : "");
    setHometown(profile.hometown ?? "");
    setCollege(profile.college ?? "");
    setMajor(profile.major ?? "");
    setJob(profile.job ?? "");
    setInterests(profile.interests.join(", "));
    setLikedTopics(profile.liked_topics.join(", "));
    setAvatarUrl(profile.avatar_url);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      return updateMyProfile(
        {
          display_name: displayName.trim() || undefined,
          age: age ? parseInt(age, 10) : null,
          hometown: hometown.trim() || null,
          college: college.trim() || null,
          major: major.trim() || null,
          job: job.trim() || null,
          interests: splitList(interests),
          liked_topics: splitList(likedTopics),
        },
        token,
      );
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", "me"], updated);
      setSaved(true);
      setTimeout(() => router.back(), 800);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    },
  });

  async function pickAndUploadAvatar() {
    setUploadingAvatar(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      await requestAvatarUploadUrl("image/jpeg", token);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        showAlert("Photos not enabled yet", "Photo uploads aren't configured yet.");
      } else {
        showAlert("Couldn't update photo", "Please try again in a moment.");
      }
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <Button
          size="sm"
          variant="primary"
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending || saved}
          loading={mutation.isPending}
          style={{ borderRadius: 999 }}
        >
          {saved ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={14} color={colors.white} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.white }}>Saved</Text>
            </View>
          ) : (
            "Save"
          )}
        </Button>
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarBlock}>
            <Avatar name={displayName || "You"} src={avatarUrl} size="lg" />
            <Pressable
              onPress={pickAndUploadAvatar}
              disabled={uploadingAvatar}
              style={styles.photoButton}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={colors.primaryDark} />
              ) : (
                <Camera size={14} color={colors.primaryDark} />
              )}
              <Text style={styles.photoButtonText}>
                {avatarUrl ? "Change photo" : "Add photo"}
              </Text>
            </Pressable>
          </View>

          <Field label="Display name">
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={50}
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </Field>

          <Field label="Age">
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="e.g. 27"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </Field>

          <Field label="Hometown">
            <TextInput
              value={hometown}
              onChangeText={setHometown}
              maxLength={120}
              placeholder="e.g. Chicago, IL"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </Field>

          <Field label="College">
            <TextInput
              value={college}
              onChangeText={setCollege}
              maxLength={160}
              placeholder="e.g. University of Michigan"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </Field>

          <Field label="Major">
            <TextInput
              value={major}
              onChangeText={setMajor}
              maxLength={120}
              placeholder="e.g. Finance"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </Field>

          <Field label="Job">
            <TextInput
              value={job}
              onChangeText={setJob}
              maxLength={160}
              placeholder="e.g. Consulting analyst at Deloitte"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </Field>

          <Field label="Interests" hint="Comma-separated, e.g. hiking, jazz, cooking">
            <TextInput
              value={interests}
              onChangeText={setInterests}
              placeholder="hiking, coffee, live music"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              style={styles.input}
            />
          </Field>

          <Field label="Liked topics" hint="Things you enjoy talking about">
            <TextInput
              value={likedTopics}
              onChangeText={setLikedTopics}
              placeholder="startups, sci-fi, food policy"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              style={styles.input}
            />
          </Field>

          {error && (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color={colors.redIcon} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
  avatarBlock: { alignItems: "center", gap: 12, paddingBottom: 8 },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  photoButtonText: { fontSize: 12, fontWeight: "600", color: colors.primaryDark },
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
