import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, MapPin, Pencil } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { fetchMyProfile } from "../lib/mockApi";
import { colors, radiusCard } from "../theme/colors";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";

/** Port of apps/native/app/(tabs)/profile.tsx. */
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken, isSignedIn, signOut } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchMyProfile(token);
    },
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My profile</Text>
        {isSignedIn && profile && (
          <Pressable
            onPress={() => router.push("/profile-edit")}
            hitSlop={8}
            accessibilityLabel="Edit profile"
            style={styles.editButton}
          >
            <Pencil size={16} color={colors.primaryDark} />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        )}
      </View>

      {!isSignedIn ? (
        <View style={styles.center}>
          <Text style={styles.centerSub}>
            Sign in to see your profile and match with people nearby.
          </Text>
          <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
        </View>
      ) : isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : !profile ? (
        <View style={styles.center}>
          <Text style={styles.centerSub}>
            Let&apos;s set up your profile so people nearby can find you.
          </Text>
          <Button onPress={() => router.push("/onboarding")}>Set up profile</Button>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
          <View style={styles.hero}>
            <Avatar name={profile.display_name} src={profile.avatar_url} size="lg" />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profile.display_name}</Text>
              <Text style={styles.handle}>@{profile.handle}</Text>
            </View>
          </View>

          <View style={[styles.card, { gap: 8 }]}>
            {profile.age && <Text style={styles.fact}>{profile.age} years old</Text>}
            {profile.hometown && <Text style={styles.fact}>From {profile.hometown}</Text>}
            {profile.college && <Text style={styles.fact}>{profile.college}</Text>}
          </View>

          {/* Home base location (ADR-0009) */}
          <Pressable onPress={() => router.push("/set-location")} style={[styles.card, styles.homeRow]}>
            <MapPin size={16} color={colors.primaryDark} />
            <Text style={styles.homeLabel}>Home base location</Text>
            <ChevronRight size={16} color={colors.placeholder} />
          </Pressable>

          {profile.interests.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Interests</Text>
              <View style={styles.chipsRow}>
                {profile.interests.map((tag) => (
                  <Chip key={tag} label={tag} variant="tinted" />
                ))}
              </View>
            </View>
          )}

          {profile.liked_topics.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Liked topics</Text>
              <View style={styles.chipsRow}>
                {profile.liked_topics.map((tag) => (
                  <Chip key={tag} label={tag} />
                ))}
              </View>
            </View>
          )}

          <Pressable
            onPress={async () => {
              await signOut();
              queryClient.clear();
            }}
            style={{ alignItems: "center", paddingVertical: 8 }}
          >
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24 },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerSub: { textAlign: "center", fontSize: 14, color: colors.muted },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { flex: 1, fontSize: 18, fontWeight: "700", color: colors.foreground },
  editButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  editText: { fontSize: 14, fontWeight: "600", color: colors.primaryDark },
  hero: { flexDirection: "row", alignItems: "center", gap: 16 },
  name: { fontSize: 18, fontWeight: "700", color: colors.foreground },
  handle: { fontSize: 14, color: colors.muted },
  card: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 16 },
  fact: { fontSize: 14, color: colors.foreground },
  homeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  homeLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.foreground },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.muted,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  signOut: { fontSize: 14, fontWeight: "600", color: colors.muted },
});
