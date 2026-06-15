import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CalendarDays, ChevronRight, MapPin, Pencil, Settings, ShieldCheck, Users } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { GradientHero } from "../components/GradientHero";
import { Avatar } from "../components/ui/Avatar";
import { Chip } from "../components/ui/Chip";

/** Your profile: hero + tappable stats (Hangouts = your PRIVATE lineup),
 * structured fields, home base, new-in-town, safety center, sign out. */
export function ProfileScreen({ onSignOut }: { onSignOut: () => void }) {
  const router = useRouter();
  const { me, edges, communities, myUpcoming, toggleNewInTown } = useStore();

  const upcoming = myUpcoming();
  const connectionCount = Object.values(edges).filter((s) => s === "connected").length;
  const communityCount = communities.filter((c) => c.joined).length;

  return (
    <View style={sh.root}>
      <GradientHero
        title="My profile"
        right={
          <Pressable onPress={() => router.push("/profile-edit")} style={styles.editBtn} hitSlop={8}>
            <Pencil size={14} color={colors.white} />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        }
      >
        <View style={styles.heroRow}>
          <Avatar name={me.name} src={me.avatar} size="xl" verified={me.photoVerified} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{me.name}</Text>
            <Text style={styles.handle}>
              @{me.handle}
              {me.pronouns ? ` · ${me.pronouns}` : ""}
            </Text>
            {me.intro && (
              <Text style={styles.intro} numberOfLines={2}>
                {me.intro}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.statsRow}>
          <Pressable onPress={() => router.push("/upcoming")} style={styles.stat}>
            <Text style={styles.statNum}>{upcoming.length}</Text>
            <Text style={styles.statLabel}>Hangouts</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/connections")} style={styles.stat}>
            <Text style={styles.statNum}>{connectionCount}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </Pressable>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{communityCount}</Text>
            <Text style={styles.statLabel}>Communities</Text>
          </View>
        </View>
      </GradientHero>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        {/* Next up */}
        {upcoming.length > 0 && (
          <Pressable onPress={() => router.push("/upcoming")} style={[sh.card, sh.cardShadow, sh.row]}>
            <CalendarDays size={18} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={sh.personName}>Next up: {upcoming[0].venue ?? upcoming[0].body.slice(0, 32)}</Text>
              <Text style={sh.personMeta}>Your private lineup — only you can see it</Text>
            </View>
            <ChevronRight size={16} color={colors.placeholder} />
          </Pressable>
        )}

        <View style={[sh.card, sh.cardShadow, { gap: 6 }]}>
          <Text style={sh.sectionLabel}>About</Text>
          {me.age && <Text style={styles.fact}>{me.age} years old</Text>}
          {me.hometown && <Text style={styles.fact}>From {me.hometown}</Text>}
          {me.college && <Text style={styles.fact}>{me.college}{me.major ? ` · ${me.major}` : ""}</Text>}
          {me.job && <Text style={styles.fact}>{me.job}</Text>}
        </View>

        {[
          { label: "Hobbies", items: me.hobbies, tinted: true },
          { label: "Interests", items: me.interests, tinted: true },
          { label: "Likes", items: me.likes, tinted: false },
        ]
          .filter((s) => s.items.length > 0)
          .map((s) => (
            <View key={s.label} style={[sh.card, sh.cardShadow]}>
              <Text style={[sh.sectionLabel, { marginBottom: 8 }]}>{s.label}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {s.items.map((tag) => (
                  <Chip key={tag} label={tag} variant={s.tinted ? "tinted" : "default"} />
                ))}
              </View>
            </View>
          ))}

        <Pressable onPress={() => router.push("/set-location")} style={[sh.card, sh.cardShadow, sh.row]}>
          <MapPin size={17} color={colors.primaryDark} />
          <View style={{ flex: 1 }}>
            <Text style={sh.personName}>Home base</Text>
            <Text style={sh.personMeta}>
              {me.homeLabel} · {me.radiusMi} mi radius
            </Text>
          </View>
          <ChevronRight size={16} color={colors.placeholder} />
        </Pressable>

        <Pressable onPress={toggleNewInTown} style={[sh.card, sh.cardShadow, sh.row, me.newInTown && { backgroundColor: colors.primaryLight }]}>
          <Text style={{ fontSize: 18 }}>👋</Text>
          <View style={{ flex: 1 }}>
            <Text style={sh.personName}>{me.newInTown ? "You're new in town" : "New to town?"}</Text>
            <Text style={sh.personMeta}>
              {me.newInTown ? "Nearby newcomers can find you. Tap to turn off." : "Let people who just moved here find you."}
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: me.newInTown ? colors.primary : colors.border }]}>
            <View style={[styles.thumb, { alignSelf: me.newInTown ? "flex-end" : "flex-start" }]} />
          </View>
        </Pressable>

        <Pressable onPress={() => router.push("/safety")} style={[sh.card, sh.cardShadow, sh.row]}>
          <ShieldCheck size={17} color={colors.primaryDark} />
          <View style={{ flex: 1 }}>
            <Text style={sh.personName}>Safety center</Text>
            <Text style={sh.personMeta}>Verification, plan sharing, blocked people, guidelines</Text>
          </View>
          <ChevronRight size={16} color={colors.placeholder} />
        </Pressable>

        <Pressable onPress={() => router.push("/connections")} style={[sh.card, sh.cardShadow, sh.row]}>
          <Users size={17} color={colors.primaryDark} />
          <View style={{ flex: 1 }}>
            <Text style={sh.personName}>My connections</Text>
            <Text style={sh.personMeta}>{connectionCount} people</Text>
          </View>
          <ChevronRight size={16} color={colors.placeholder} />
        </Pressable>

        <Pressable onPress={() => router.push("/settings")} style={[sh.card, sh.cardShadow, sh.row]}>
          <Settings size={17} color={colors.primaryDark} />
          <View style={{ flex: 1 }}>
            <Text style={sh.personName}>Settings</Text>
            <Text style={sh.personMeta}>Notifications, account, the fine print</Text>
          </View>
          <ChevronRight size={16} color={colors.placeholder} />
        </Pressable>

        <Pressable onPress={onSignOut} style={{ alignItems: "center", paddingVertical: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editText: { fontSize: 12, fontWeight: "700", color: colors.white },
  heroRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 14 },
  name: { fontSize: 20, fontWeight: "800", color: colors.white },
  handle: { marginTop: 1, fontSize: 13, color: "rgba(255,255,255,0.85)" },
  intro: { marginTop: 5, fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.92)" },
  statsRow: {
    marginTop: 16,
    flexDirection: "row",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingVertical: 10,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "800", color: colors.white },
  statLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
  fact: { fontSize: 14, color: colors.foreground },
  track: { height: 24, width: 44, borderRadius: 999, padding: 2 },
  thumb: { height: 20, width: 20, borderRadius: 999, backgroundColor: colors.surface },
});
