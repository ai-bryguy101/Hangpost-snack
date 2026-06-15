import { useState } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, MapPin } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useLocalSearchParams, useRouter } from "../lib/router";
import { createPost, getMyLocation, DC_FEED } from "../lib/mockApi";
import { colors } from "../theme/colors";
import { Button } from "../components/ui/Button";

/** Port of apps/native/app/create.tsx — the composer, incl. the "Make it
 * weekly" recurrence toggle (ADR-0015) and community-event banner (ADR-0011). */

type PostType = "hangout" | "local_info";

export function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { communityId, communityName } = useLocalSearchParams<{
    communityId?: string;
    communityName?: string;
  }>();

  const { data: savedLocation } = useQuery({
    queryKey: ["location", "me"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return getMyLocation(token);
    },
  });

  const [type, setType] = useState<PostType>("hangout");
  const [body, setBody] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  const [weekly, setWeekly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedCapacity = (() => {
    const n = parseInt(capacity, 10);
    return Number.isFinite(n) && n >= 1 && n <= 1000 ? n : null;
  })();

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      return createPost(
        {
          type,
          body: body.trim(),
          latitude: savedLocation?.latitude ?? DC_FEED.latitude,
          longitude: savedLocation?.longitude ?? DC_FEED.longitude,
          venue: venue.trim() || null,
          capacity: type === "hangout" ? parsedCapacity : null,
          recurrence: type === "hangout" && weekly ? "weekly" : undefined,
          community_id: communityId ?? null,
        },
        token,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["community"] });
      router.back();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    },
  });

  const canSubmit = body.trim().length > 0 && !mutation.isPending;

  if (!isSignedIn) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Text style={styles.centerSub}>Sign in to post something to {DC_FEED.city}.</Text>
          <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
          <Button variant="outlined" onPress={() => router.back()}>
            Go back
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
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>New post</Text>
        <Button
          size="sm"
          variant="primary"
          onPress={() => mutation.mutate()}
          disabled={!canSubmit}
          loading={mutation.isPending}
          style={{ borderRadius: 999 }}
        >
          Post
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} keyboardShouldPersistTaps="handled">
        {communityName && (
          <View style={styles.communityBanner}>
            <Text style={styles.communityBannerText}>Posting to {communityName}</Text>
          </View>
        )}
        {/* Type toggle */}
        <View>
          <Text style={styles.fieldLabel}>What kind of post?</Text>
          <View style={styles.toggleRow}>
            {(["hangout", "local_info"] as const).map((t) => {
              const active = type === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={[styles.toggle, active && { backgroundColor: colors.surface }]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      active
                        ? { fontWeight: "600", color: colors.foreground }
                        : { fontWeight: "500", color: colors.muted },
                    ]}
                  >
                    {t === "hangout" ? "Hangout" : "Local info"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>
            {type === "hangout"
              ? 'Invite nearby people to join you — "Anyone down for coffee at 3pm?"'
              : 'Share something useful to locals — "Avoid Dupont Metro, delays today."'}
          </Text>
        </View>

        {/* Body */}
        <View>
          <TextInput
            value={body}
            onChangeText={(t) => {
              setBody(t);
              if (error) setError(null);
            }}
            maxLength={2000}
            multiline
            placeholder={
              type === "hangout"
                ? "What are you up to? Who should join?"
                : "What do locals in DC need to know right now?"
            }
            placeholderTextColor={colors.placeholder}
            style={styles.bodyInput}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{body.length}/2000</Text>
        </View>

        {/* Venue (hangouts) */}
        {type === "hangout" && (
          <View>
            <Text style={styles.fieldLabel}>Venue (optional)</Text>
            <TextInput
              value={venue}
              onChangeText={setVenue}
              maxLength={200}
              placeholder="e.g. Compass Coffee, Dupont Circle"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </View>
        )}

        {/* Spot cap — scarcity keeps groups small enough to actually talk,
            and a visible cap gives "I'm in" weight (reliability v1). */}
        {type === "hangout" && (
          <View>
            <Text style={styles.fieldLabel}>Spots (optional)</Text>
            <TextInput
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="No limit — e.g. 6 keeps it cozy"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
            />
          </View>
        )}

        {/* Make it weekly — the repeat-contact engine (ADR-0015) */}
        {type === "hangout" && (
          <Pressable onPress={() => setWeekly((w) => !w)} style={styles.weeklyRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.weeklyTitle}>Make it weekly</Text>
              <Text style={styles.hint}>
                Repeats every week so the same people keep showing up — that&apos;s how
                acquaintances become friends.
              </Text>
            </View>
            <View
              style={[
                styles.switchTrack,
                { backgroundColor: weekly ? colors.primary : colors.border },
              ]}
            >
              <View style={[styles.switchThumb, { alignSelf: weekly ? "flex-end" : "flex-start" }]} />
            </View>
          </Pressable>
        )}

        {/* Location note */}
        <View style={styles.locationNote}>
          <MapPin size={12} color={colors.muted} />
          <Text style={styles.hint}>
            Pinned to {savedLocation?.label ?? DC_FEED.city} — visible to people nearby
          </Text>
        </View>

        {/* Error */}
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
  communityBanner: {
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  communityBannerText: { fontSize: 14, fontWeight: "500", color: colors.primaryDark },
  fieldLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.muted,
  },
  toggleRow: { flexDirection: "row", borderRadius: 999, backgroundColor: colors.background, padding: 4 },
  toggle: { flex: 1, borderRadius: 999, paddingVertical: 8 },
  toggleText: { textAlign: "center", fontSize: 14 },
  hint: { marginTop: 8, fontSize: 12, color: colors.muted },
  bodyInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
  },
  charCount: { marginTop: 4, textAlign: "right", fontSize: 12, color: colors.muted },
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
  weeklyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  weeklyTitle: { fontSize: 14, fontWeight: "500", color: colors.foreground },
  switchTrack: { height: 24, width: 44, borderRadius: 999, padding: 2 },
  switchThumb: { height: 20, width: 20, borderRadius: 999, backgroundColor: colors.surface },
  locationNote: { flexDirection: "row", alignItems: "center", gap: 6 },
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
