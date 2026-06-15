import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, BadgeCheck, Share2, ShieldCheck, Smartphone } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";

const GUIDELINES = [
  "Meet in groups, at public places — that's the Hangpost way.",
  "Your exact location is never shown; only venue distance.",
  "Withdrawing beats no-showing — free your spot if plans change.",
  "The board is about places, never people — people-posts come down on sight.",
  "Block works both ways instantly. Report anything that feels off.",
];

/** Safety as a place, not a buried setting: verification status, plan
 * sharing, blocked people, and the house rules. */
export function SafetyCenterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { me, blocked, personOf, unblock, togglePlanShare } = useStore();

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>Safety center</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <View style={[sh.card, sh.cardShadow, { gap: 12 }]}>
          <Text style={sh.sectionLabel}>Your verification</Text>
          <View style={sh.row}>
            <Smartphone size={17} color={me.phoneVerified ? colors.primaryDark : colors.muted} />
            <Text style={[styles.verLabel, { flex: 1 }]}>Phone verified</Text>
            <Text style={styles.verState}>{me.phoneVerified ? "✓ Done" : "Not yet"}</Text>
          </View>
          <View style={sh.row}>
            <BadgeCheck size={17} color={me.photoVerified ? colors.primaryDark : colors.muted} />
            <Text style={[styles.verLabel, { flex: 1 }]}>Photo verified</Text>
            <Text style={styles.verState}>{me.photoVerified ? "✓ Done" : "Not yet"}</Text>
          </View>
          <Text style={sh.hint}>
            Verified badges mean the photo is really them — so you recognize the actual person at
            the meetup.
          </Text>
        </View>

        <Pressable onPress={togglePlanShare} style={[sh.card, sh.cardShadow, sh.row]}>
          <Share2 size={17} color={colors.primaryDark} />
          <View style={{ flex: 1 }}>
            <Text style={sh.personName}>Share my plans</Text>
            <Text style={sh.personMeta}>
              Offer to send hangout details (time, place, who's going) to a trusted contact when you
              RSVP.
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: me.planShare ? colors.primary : colors.border }]}>
            <View style={[styles.thumb, { alignSelf: me.planShare ? "flex-end" : "flex-start" }]} />
          </View>
        </Pressable>

        <View style={[sh.card, sh.cardShadow, { gap: 10 }]}>
          <Text style={sh.sectionLabel}>Blocked ({blocked.length})</Text>
          {blocked.length === 0 ? (
            <Text style={sh.hint}>Nobody. Blocking hides you from each other everywhere, instantly.</Text>
          ) : (
            blocked.map((id) => {
              const p = personOf(id);
              return (
                <View key={id} style={sh.row}>
                  <Avatar name={p.name} src={p.avatar} size="sm" />
                  <Text style={[sh.personName, { flex: 1 }]}>{p.name}</Text>
                  <Button size="sm" variant="outlined" onPress={() => { unblock(id); showToast(`Unblocked ${p.name.split(" ")[0]}`); }} style={{ borderRadius: 999 }}>
                    Unblock
                  </Button>
                </View>
              );
            })
          )}
        </View>

        <View style={[sh.card, sh.cardShadow, { gap: 10 }]}>
          <View style={sh.row}>
            <ShieldCheck size={17} color={colors.primaryDark} />
            <Text style={sh.personName}>House rules</Text>
          </View>
          {GUIDELINES.map((g) => (
            <Text key={g} style={styles.rule}>
              ·  {g}
            </Text>
          ))}
        </View>

        <Button variant="outlined" onPress={() => showToast("Thanks — our team will follow up")} style={{ borderRadius: 999 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Report a problem</Text>
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  verLabel: { fontSize: 14, fontWeight: "600", color: colors.foreground },
  verState: { fontSize: 13, fontWeight: "700", color: colors.primaryDark },
  track: { height: 24, width: 44, borderRadius: 999, padding: 2 },
  thumb: { height: 20, width: 20, borderRadius: 999, backgroundColor: colors.surface },
  rule: { fontSize: 13, lineHeight: 19, color: colors.muted },
});
