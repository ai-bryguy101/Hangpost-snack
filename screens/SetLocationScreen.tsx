import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Navigation } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { PLACES, RADII, type Place } from "../lib/places";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "../components/ui/Button";
import { PlacePicker } from "../components/PlacePicker";

/** Home base (the Hinge model): ONE chosen place + radius. It never follows
 * your phone; movers can set their future city today. */
export function SetLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { me, setHomeBase } = useStore();

  const found = PLACES.find((p) => p.label === me.homeLabel);
  const [place, setPlace] = useState<Place>(found ?? PLACES[0]);
  const radiusValues = [3, 5, 9, 15];
  const [radiusIdx, setRadiusIdx] = useState(Math.max(0, radiusValues.indexOf(me.radiusMi)));

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>Your home base</Text>
        <Button
          size="sm"
          onPress={() => {
            setHomeBase(place.label, radiusValues[radiusIdx]);
            showToast(`Home base set: ${place.label}`);
            router.back();
          }}
          style={{ borderRadius: 999 }}
        >
          Save
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={sh.centerSub}>
          Hangpost is scoped to one place you choose. You'll see and post to this area even while
          travelling. Moving somewhere new? Set it there for a head start.
        </Text>

        <View>
          <Text style={sh.fieldLabel}>Place — {place.label}</Text>
          <PlacePicker selected={place} onSelect={setPlace} />
        </View>

        <View>
          <Text style={sh.fieldLabel}>Radius</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {RADII.map((r, i) => {
              const on = radiusIdx === i;
              return (
                <Pressable key={r.label} onPress={() => setRadiusIdx(i)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: on ? colors.white : colors.muted }}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable disabled style={styles.gpsBtn}>
          <Navigation size={15} color={colors.placeholder} />
          <Text style={{ fontSize: 14, fontWeight: "500", color: colors.muted }}>
            Use my current location (one-time)
          </Text>
        </Pressable>
        <Text style={sh.hint}>
          No live tracking, ever — GPS would only fill the point once, and your exact location is
          never shown to anyone.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  chipOff: { backgroundColor: colors.surface, borderColor: colors.border },
  gpsBtn: {
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
