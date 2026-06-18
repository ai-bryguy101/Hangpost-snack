import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CalendarPlus, Hand, Lock, MessageCircle, Plus } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { STATUS_KIND_MAP, STATUS_REACTIONS, expiryPhrase, freePhrase } from "../data/statuses";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";
import { StatusComposer } from "../components/StatusComposer";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The "Tonight" surface (brief §3–4): an ambient read of which connections are
 * free right now, with the one-tap payoff actions — react, "I'm around too",
 * reply, or turn it into a real plan. Pull-friendly; checked when *you're* in
 * the mood, so statuses never depend on push. Connection-scoped only. */
export function TonightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { me, myStatus, connectionStatuses, clearStatus, reactStatus, toggleAround, openDm, personOf } =
    useStore();
  const [composing, setComposing] = useState(false);
  const mine = myStatus();
  const others = connectionStatuses();

  function reply(personId: string) {
    const id = openDm(personId);
    if (id) router.push({ pathname: "/chat/[id]", params: { id } });
    else showToast("Connect first to reply");
  }

  function around(personId: string) {
    const was = others.find((s) => s.userId === personId)?.aroundIds.includes("me");
    toggleAround(personId);
    if (!was) showToast(`${personOf(personId).name.split(" ")[0]} will see you're around 👋`);
  }

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>Tonight</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={styles.lede}>
          {others.length > 0
            ? `${others.length} of your connections ${others.length === 1 ? "is" : "are"} free right now. Say hi, or make a plan.`
            : "No one's posted a status yet — be the first and your connections will see you're around."}
        </Text>

        {/* Your status / share CTA */}
        {mine ? (
          <View style={styles.mineCard}>
            <View style={styles.mineTop}>
              <Text style={styles.mineLabel}>YOUR STATUS</Text>
              <Text style={styles.mineExpiry}>{expiryPhrase(mine.expiresLabel)}</Text>
            </View>
            <Text style={styles.mineBody}>
              {STATUS_KIND_MAP[mine.kind].emoji} {mine.body}
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => setComposing(true)} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Change</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  clearStatus();
                  showToast("Status cleared");
                }}
                style={styles.smallBtnGhost}
              >
                <Text style={styles.smallBtnGhostText}>Clear</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setComposing(true)} style={styles.ctaCard}>
            <View style={styles.ctaIcon}>
              <Plus size={18} color={colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Share your status</Text>
              <Text style={styles.ctaSub}>One tap. Only connections see it. Gone by morning.</Text>
            </View>
          </Pressable>
        )}

        {/* Connections who are free */}
        {others.map((s) => {
          const p = personOf(s.userId);
          const def = STATUS_KIND_MAP[s.kind];
          const isAround = s.aroundIds.includes("me");
          return (
            <View key={s.id} style={[styles.card, sh.cardShadow]}>
              <Pressable
                style={styles.cardHead}
                onPress={() => router.push({ pathname: "/person/[id]", params: { id: p.id } })}
              >
                <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {p.name} <Text style={styles.kindEmoji}>{def.emoji}</Text>
                  </Text>
                  <Text style={styles.free}>{cap(freePhrase(s.expiresLabel))}</Text>
                </View>
              </Pressable>

              <Text style={styles.body}>{s.body}</Text>

              <View style={styles.reactRow}>
                {STATUS_REACTIONS.map((e) => {
                  const ids = s.reactions[e] ?? [];
                  const mineR = ids.includes("me");
                  return (
                    <Pressable
                      key={e}
                      onPress={() => reactStatus(s.userId, e)}
                      style={[styles.reactChip, mineR && styles.reactChipOn]}
                    >
                      <Text style={styles.reactEmoji}>{e}</Text>
                      {ids.length > 0 && (
                        <Text style={[styles.reactCount, mineR && { color: colors.primaryDark }]}>
                          {ids.length}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => around(s.userId)}
                  style={[styles.actionBtn, isAround && styles.actionBtnOn]}
                >
                  <Hand size={15} color={isAround ? colors.white : colors.primaryDark} />
                  <Text style={[styles.actionText, isAround && { color: colors.white }]}>
                    {isAround ? "You're around" : "I'm around too"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => reply(s.userId)} style={styles.actionGhost}>
                  <MessageCircle size={15} color={colors.primaryDark} />
                  <Text style={styles.actionGhostText}>Reply</Text>
                </Pressable>
                <Pressable onPress={() => router.push("/create")} style={styles.actionGhost}>
                  <CalendarPlus size={15} color={colors.primaryDark} />
                  <Text style={styles.actionGhostText}>Make a plan</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={styles.safetyNote}>
          <Lock size={13} color={colors.muted} />
          <Text style={styles.safetyText}>
            Statuses are only shown to your connections — never to nearby strangers, and never with
            your location.
          </Text>
        </View>
      </ScrollView>

      <StatusComposer visible={composing} onClose={() => setComposing(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  lede: { fontSize: 13, lineHeight: 19, color: colors.muted },
  mineCard: { borderRadius: radiusCard, backgroundColor: colors.primaryLight, padding: 14, gap: 8 },
  mineTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mineLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5, color: colors.primaryDeep },
  mineExpiry: { fontSize: 11, fontWeight: "600", color: colors.primaryDark },
  mineBody: { fontSize: 15, fontWeight: "700", lineHeight: 21, color: colors.foreground },
  smallBtn: { borderRadius: 999, backgroundColor: colors.primaryDark, paddingHorizontal: 14, paddingVertical: 7 },
  smallBtnText: { fontSize: 12, fontWeight: "700", color: colors.white },
  smallBtnGhost: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  smallBtnGhostText: { fontSize: 12, fontWeight: "700", color: colors.primaryDark },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    padding: 14,
  },
  ctaIcon: {
    height: 38,
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  ctaTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  ctaSub: { marginTop: 2, fontSize: 12, color: colors.muted },
  card: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 14, gap: 10 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  kindEmoji: { fontSize: 15 },
  free: { marginTop: 2, fontSize: 12, fontWeight: "700", color: colors.primaryDark },
  body: { fontSize: 14, lineHeight: 20, color: colors.foreground },
  reactRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  reactChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reactChipOn: { borderColor: colors.primaryDark, backgroundColor: colors.primaryLight },
  reactEmoji: { fontSize: 14 },
  reactCount: { fontSize: 12, fontWeight: "700", color: colors.muted },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtnOn: { backgroundColor: colors.primaryDark },
  actionText: { fontSize: 12, fontWeight: "700", color: colors.primaryDark },
  actionGhost: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 8 },
  actionGhostText: { fontSize: 12, fontWeight: "600", color: colors.primaryDark },
  safetyNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 4, paddingTop: 4 },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.muted },
});
