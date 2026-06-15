import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Users } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import {
  ApiError,
  acceptFriendRequest,
  clearNewArrival,
  dismissSuggestion,
  fetchFriends,
  fetchIncomingRequests,
  fetchMyProfile,
  fetchNewcomers,
  fetchPeopleYouMayKnow,
  fetchRegulars,
  fetchSuggestions,
  getOrCreateDm,
  importContacts,
  markNewArrival,
  removeFriendship,
  sendFriendRequest,
} from "../lib/mockApi";
import { relativeTime } from "../lib/format";
import type { Connection } from "../lib/types";
import { colors, radiusCard } from "../theme/colors";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";

/** Port of apps/native/app/connections-list.tsx — the full friend-graph
 * screen: new-in-town toggle (ADR-0019), contact import → "people you may
 * know" (ADR-0020), people you met (ADR-0012), familiar faces, requests,
 * connections. On live, the contact import hashes your address book on-device
 * (expo-contacts + expo-crypto); the mirror simulates a contact list since
 * Snack web has no contacts permission. */
export function ConnectionsListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const requests = useQuery({
    queryKey: ["incoming-requests"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchIncomingRequests(token);
    },
  });

  const friends = useQuery({
    queryKey: ["friends"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchFriends(token);
    },
  });

  const suggestions = useQuery({
    queryKey: ["suggestions"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchSuggestions(token);
    },
  });

  // Familiar faces — people you've co-attended >= 2 ended hangouts with.
  const regulars = useQuery({
    queryKey: ["regulars"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchRegulars(token);
    },
  });

  // New arrivals nearby + my own "new in town" flag (ADR-0019).
  const newcomers = useQuery({
    queryKey: ["newcomers"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchNewcomers(token);
    },
  });

  const myProfile = useQuery({
    queryKey: ["my-profile"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchMyProfile(token);
    },
  });

  function refetchAll() {
    void queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
    void queryClient.invalidateQueries({ queryKey: ["friends"] });
    void queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    void queryClient.invalidateQueries({ queryKey: ["regulars"] });
    void queryClient.invalidateQueries({ queryKey: ["newcomers"] });
    void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    void queryClient.invalidateQueries({ queryKey: ["pymk"] });
  }

  const newArrivalMutation = useMutation({
    mutationFn: async (makeNew: boolean) => {
      const token = await getToken();
      if (!token) return;
      if (makeNew) await markNewArrival(token);
      else await clearNewArrival(token);
    },
    onSuccess: refetchAll,
    onError: () => showAlert("Couldn't update", "Please try again in a moment."),
  });

  // Contact import → "people you may know" (ADR-0020). Live hashes the
  // address book on-device; the mirror sends a simulated hash list.
  const peopleYouMayKnow = useQuery({
    queryKey: ["pymk"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return fetchPeopleYouMayKnow(token);
    },
  });

  const contactsMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      const simulatedHashes = Array.from({ length: 42 }, (_, i) => `sha256-demo-${i}`);
      return importContacts(simulatedHashes, token);
    },
    onSuccess: (res) => {
      refetchAll();
      showAlert("Contacts checked", `Found ${res.matched_count} already on Hangpost.`);
    },
    onError: () => {
      showAlert("Couldn't check contacts", "Please try again in a moment.");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      if (!token) return;
      await acceptFriendRequest(userId, token);
    },
    onSuccess: refetchAll,
    onError: () => showAlert("Couldn't accept", "Please try again in a moment."),
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      if (!token) return;
      await removeFriendship(userId, token);
    },
    onSuccess: refetchAll,
    onError: () => showAlert("Couldn't update", "Please try again in a moment."),
  });

  // "Keep in touch" = a friend request (ADR-0012); dismiss hides the suggestion.
  const keepMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      if (!token) return;
      await sendFriendRequest(userId, token);
    },
    onSuccess: refetchAll,
    onError: () => showAlert("Couldn't send", "Please try again in a moment."),
  });

  const dismissMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      if (!token) return;
      await dismissSuggestion(userId, token);
    },
    onSuccess: refetchAll,
    onError: () => showAlert("Couldn't dismiss", "Please try again in a moment."),
  });

  async function openDm(c: { user_id: string; display_name: string }) {
    const token = await getToken();
    if (!token) return;
    try {
      const thread = await getOrCreateDm(c.user_id, token);
      router.push({
        pathname: "/chat/[threadId]",
        params: { threadId: thread.thread_id, title: c.display_name },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        showAlert("Not connected yet", "You can message once you're connected.");
      } else {
        showAlert("Couldn't open chat", "Please try again in a moment.");
      }
    }
  }

  function confirmRemove(c: Connection) {
    showAlert("Remove connection?", `Remove ${c.display_name} from your connections?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeMutation.mutate(c.user_id) },
    ]);
  }

  const met = suggestions.data?.suggestions ?? [];
  const familiar = regulars.data?.faces ?? [];
  const newArrivals = newcomers.data?.newcomers ?? [];
  const pymk = peopleYouMayKnow.data?.people ?? [];
  const isNew = myProfile.data?.is_new_arrival ?? false;
  const incoming = requests.data?.connections ?? [];
  const accepted = friends.data?.connections ?? [];
  const loading =
    requests.isLoading ||
    friends.isLoading ||
    suggestions.isLoading ||
    regulars.isLoading ||
    newcomers.isLoading ||
    myProfile.isLoading ||
    peopleYouMayKnow.isLoading;
  const refreshing =
    requests.isFetching ||
    friends.isFetching ||
    suggestions.isFetching ||
    regulars.isFetching ||
    newcomers.isFetching ||
    peopleYouMayKnow.isFetching;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>My connections</Text>
      </View>

      {!isSignedIn ? (
        <View style={styles.center}>
          <Text style={styles.centerSub}>Sign in to see your connections.</Text>
          <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
        </View>
      ) : loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} />}
        >
          {/* New-in-town self toggle + nearby newcomers (ADR-0019) */}
          <Pressable
            onPress={() => newArrivalMutation.mutate(!isNew)}
            style={[
              styles.bannerRow,
              { backgroundColor: isNew ? colors.primaryLight : colors.surface },
            ]}
          >
            <MapPin size={18} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {isNew ? "You're new in town" : "New to town?"}
              </Text>
              <Text style={styles.bannerSub}>
                {isNew
                  ? "Nearby newcomers can find you. Tap to turn off."
                  : "Let other people who just moved here find you."}
              </Text>
            </View>
            <View
              style={[
                styles.switchTrack,
                { backgroundColor: isNew ? colors.primary : colors.border },
              ]}
            >
              <View style={[styles.switchThumb, { alignSelf: isNew ? "flex-end" : "flex-start" }]} />
            </View>
          </Pressable>

          {/* Find friends from contacts → people you may know (ADR-0020) */}
          <Pressable
            onPress={() => contactsMutation.mutate()}
            disabled={contactsMutation.isPending}
            style={[styles.bannerRow, { backgroundColor: colors.surface }]}
          >
            <Users size={18} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Find friends from your contacts</Text>
              <Text style={styles.bannerSub}>
                We only check hashes — your contacts never leave your phone.
              </Text>
            </View>
            {contactsMutation.isPending && <ActivityIndicator color={colors.primaryDark} />}
          </Pressable>

          {pymk.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.sectionLabel}>People you may know</Text>
              {pymk.map((p) => (
                <View key={p.user_id} style={styles.personRow}>
                  <Avatar name={p.display_name} src={p.avatar_url} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {p.display_name}
                    </Text>
                    <Text style={styles.personMeta} numberOfLines={1}>
                      In your contacts
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    onPress={() => keepMutation.mutate(p.user_id)}
                    loading={keepMutation.isPending && keepMutation.variables === p.user_id}
                  >
                    Connect
                  </Button>
                </View>
              ))}
            </View>
          )}

          {newArrivals.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.sectionLabel}>New here</Text>
              {newArrivals.map((n) => (
                <View key={n.user_id} style={styles.personRow}>
                  <Avatar name={n.display_name} src={n.avatar_url} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {n.display_name}
                    </Text>
                    <Text style={styles.personMeta} numberOfLines={1}>
                      {n.hometown ? `New here · from ${n.hometown}` : "New to town"}
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    onPress={() => keepMutation.mutate(n.user_id)}
                    loading={keepMutation.isPending && keepMutation.variables === n.user_id}
                  >
                    Connect
                  </Button>
                </View>
              ))}
            </View>
          )}

          {met.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.sectionLabel}>People you met</Text>
              {met.map((s) => (
                <View key={s.user_id} style={styles.personRow}>
                  <Avatar name={s.display_name} src={s.avatar_url} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {s.display_name}
                    </Text>
                    <Text style={styles.personMeta} numberOfLines={1}>
                      {s.met_venue
                        ? `Met at ${s.met_venue} · ${relativeTime(s.met_at)}`
                        : `Met ${relativeTime(s.met_at)}`}
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    onPress={() => keepMutation.mutate(s.user_id)}
                    loading={keepMutation.isPending && keepMutation.variables === s.user_id}
                  >
                    Keep
                  </Button>
                  <Pressable
                    onPress={() => dismissMutation.mutate(s.user_id)}
                    hitSlop={8}
                    style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                  >
                    <Text style={styles.linkMuted}>Dismiss</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {familiar.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.sectionLabel}>Familiar faces</Text>
              {familiar.map((f) => (
                <View key={f.user_id} style={styles.personRow}>
                  <Avatar name={f.display_name} src={f.avatar_url} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {f.display_name}
                    </Text>
                    <Text style={styles.personMeta} numberOfLines={1}>
                      {`Crossed paths ${f.shared_hangouts}×`}
                      {f.last_venue ? ` · last at ${f.last_venue}` : ` · ${relativeTime(f.last_at)}`}
                    </Text>
                  </View>
                  {f.connected ? (
                    <Button size="sm" variant="secondary" onPress={() => openDm(f)}>
                      Message
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onPress={() => keepMutation.mutate(f.user_id)}
                      loading={keepMutation.isPending && keepMutation.variables === f.user_id}
                    >
                      Connect
                    </Button>
                  )}
                </View>
              ))}
            </View>
          )}

          {incoming.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.sectionLabel}>Requests</Text>
              {incoming.map((c) => (
                <View key={c.user_id} style={styles.personRow}>
                  <Avatar name={c.display_name} src={c.avatar_url} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {c.display_name}
                    </Text>
                    <Text style={styles.personMeta} numberOfLines={1}>
                      @{c.handle}
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    onPress={() => acceptMutation.mutate(c.user_id)}
                    loading={acceptMutation.isPending && acceptMutation.variables === c.user_id}
                  >
                    Accept
                  </Button>
                  <Pressable
                    onPress={() => removeMutation.mutate(c.user_id)}
                    hitSlop={8}
                    style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                  >
                    <Text style={styles.linkMuted}>Decline</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={{ gap: 8 }}>
            {incoming.length > 0 && <Text style={styles.sectionLabel}>Connections</Text>}
            {accepted.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Users size={28} color={colors.primaryDark} />
                <Text style={styles.emptyTitle}>No connections yet</Text>
                <Text style={styles.centerSub}>
                  When you connect with people from your daily picks, they&apos;ll show up here.
                </Text>
              </View>
            ) : (
              accepted.map((c) => (
                <View key={c.user_id} style={styles.personRow}>
                  <Avatar name={c.display_name} src={c.avatar_url} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName} numberOfLines={1}>
                      {c.display_name}
                    </Text>
                    <Text style={styles.personMeta} numberOfLines={1}>
                      @{c.handle}
                    </Text>
                  </View>
                  <Button size="sm" variant="secondary" onPress={() => openDm(c)}>
                    Message
                  </Button>
                  <Pressable
                    onPress={() => confirmRemove(c)}
                    hitSlop={8}
                    style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                  >
                    <Text style={styles.linkMuted}>Remove</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
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
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    padding: 12,
  },
  bannerTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  bannerSub: { fontSize: 12, color: colors.muted },
  switchTrack: { height: 24, width: 44, borderRadius: 999, padding: 2 },
  switchThumb: { height: 20, width: 20, borderRadius: 999, backgroundColor: colors.surface },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.muted,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    backgroundColor: colors.surface,
    padding: 12,
  },
  personName: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  personMeta: { fontSize: 12, color: colors.muted },
  linkMuted: { fontSize: 12, fontWeight: "500", color: colors.muted },
  emptyBlock: { alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24, paddingVertical: 64 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground },
});
