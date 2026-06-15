import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Navigation } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { getMyLocation, postUserLocation } from "../lib/mockApi";
import { PLACES, RADII, DEFAULT_RADIUS_M, type Place } from "../lib/places";
import { colors } from "../theme/colors";
import { Button } from "../components/ui/Button";
import { PlacePicker } from "../components/PlacePicker";

/** Port of apps/native/app/set-location.tsx — the home-base picker
 * (ADR-0009: one user-set place + radius; live GPS deliberately deferred). */
export function SetLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const [selectedPlace, setSelectedPlace] = useState<Place>(PLACES[0]);
  const [radiusM, setRadiusM] = useState(DEFAULT_RADIUS_M);

  const { data: saved, isLoading } = useQuery({
    queryKey: ["location", "me"],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("no token");
      return getMyLocation(token);
    },
  });

  useEffect(() => {
    if (!saved) return;
    setRadiusM(saved.radius_m);
    setSelectedPlace({
      label: saved.label ?? "Saved location",
      latitude: saved.latitude,
      longitude: saved.longitude,
    });
  }, [saved]);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      return postUserLocation(
        {
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
          radius_m: radiusM,
          label: selectedPlace.label,
        },
        token,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["location", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      router.back();
    },
  });

  if (!isSignedIn) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Text style={styles.centerSub}>Sign in to set your location.</Text>
          <Button onPress={() => router.push("/sign-in")}>Sign in</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>Your home base</Text>
        <Button
          size="sm"
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          style={{ borderRadius: 999 }}
        >
          Save
        </Button>
      </View>

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.centerSub}>
            Hangpost is scoped to a place you choose — your home base. You&apos;ll see and post to
            this area even while travelling. Moving somewhere new? Set it there to get a head start.
          </Text>

          <View>
            <Text style={styles.fieldLabel}>Place — {selectedPlace.label}</Text>
            <PlacePicker selected={selectedPlace} onSelect={setSelectedPlace} />
          </View>

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

          {/* Optional one-time GPS convenience — deferred (ADR-0009). */}
          <Pressable disabled style={styles.gpsButton}>
            <Navigation size={15} color={colors.placeholder} />
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.muted }}>
              Use my current location (soon)
            </Text>
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
  centerSub: { fontSize: 14, color: colors.muted },
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
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.muted,
  },
  radiusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  radiusChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  radiusOn: { borderColor: colors.primaryDark, backgroundColor: colors.primaryDark },
  radiusOff: { borderColor: colors.border, backgroundColor: colors.surface },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: 12,
    opacity: 0.6,
  },
});
