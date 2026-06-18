import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Plus } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { STATUS_KIND_MAP, expiryPhrase, freePhrase } from "../data/statuses";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "./ui/Avatar";
import { StatusComposer } from "./StatusComposer";

/** The feed's status on-ramp: your active status (or a one-tap prompt to post
 * one) + a "who's free" rail of your connections' live statuses. The
 * highest-visibility surface for the lowest-friction posting unlock (brief
 * §1–3). Connection-scoped — the rail only ever shows your connections. */
export function StatusStrip() {
  const router = useRouter();
  const { me, myStatus, connectionStatuses, clearStatus, personOf } = useStore();
  const [composing, setComposing] = useState(false);
  const mine = myStatus();
  const others = connectionStatuses();

  const reactTotal = mine
    ? Object.values(mine.reactions).reduce((n, ids) => n + ids.length, 0)
    : 0;
  const aroundTotal = mine ? mine.aroundIds.length : 0;
  const mineMeta =
    reactTotal + aroundTotal === 0
      ? "Only your connections can see this"
      : [
          reactTotal > 0 ? `${reactTotal} reaction${reactTotal === 1 ? "" : "s"}` : null,
          aroundTotal > 0 ? `${aroundTotal} around` : null,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <View style={{ gap: 12 }}>
      {mine ? (
        <View style={[styles.mineCard, sh.cardShadow]}>
          <View style={styles.mineTop}>
            <Text style={styles.mineLabel}>YOUR STATUS</Text>
            <Text style={styles.mineExpiry}>{expiryPhrase(mine.expiresLabel)}</Text>
          </View>
          <Text style={styles.mineBody}>
            {STATUS_KIND_MAP[mine.kind].emoji} {mine.body}
          </Text>
          <View style={styles.mineActions}>
            <Text style={styles.mineMeta} numberOfLines={1}>
              {mineMeta}
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
        </View>
      ) : (
        <Pressable onPress={() => setComposing(true)} style={[styles.prompt, sh.cardShadow]}>
          <Avatar name={me.name} src={me.avatar} size="md" />
          <View style={{ flex: 1 }}>
            <Text style={styles.promptTitle}>What are you up to?</Text>
            <Text style={styles.promptSub}>
              Let connections know you're around — one tap, gone by morning.
            </Text>
          </View>
          <View style={styles.shareBtn}>
            <Plus size={14} color={colors.white} />
            <Text style={styles.shareText}>Status</Text>
          </View>
        </Pressable>
      )}

      {others.length > 0 && (
        <View style={{ gap: 8 }}>
          <View style={styles.railHead}>
            <Text style={styles.railTitle}>🌙 Who's free</Text>
            <Pressable onPress={() => router.push("/tonight")} style={styles.seeAll} hitSlop={6}>
              <Text style={styles.seeAllText}>
                {others.length} connection{others.length === 1 ? "" : "s"}
              </Text>
              <ChevronRight size={14} color={colors.primaryDark} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
          >
            {others.map((s) => {
              const p = personOf(s.userId);
              const def = STATUS_KIND_MAP[s.kind];
              return (
                <Pressable key={s.id} onPress={() => router.push("/tonight")} style={styles.railCard}>
                  <View style={styles.railTop}>
                    <Avatar name={p.name} src={p.avatar} size="sm" />
                    <Text style={styles.railName} numberOfLines={1}>
                      {p.name.split(" ")[0]}
                    </Text>
                    <Text style={styles.railEmoji}>{def.emoji}</Text>
                  </View>
                  <Text style={styles.railBody} numberOfLines={2}>
                    {s.body}
                  </Text>
                  <Text style={styles.railFree}>{freePhrase(s.expiresLabel)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <StatusComposer visible={composing} onClose={() => setComposing(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  mineCard: { borderRadius: radiusCard, backgroundColor: colors.primaryLight, padding: 14, gap: 8 },
  mineTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mineLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5, color: colors.primaryDeep },
  mineExpiry: { fontSize: 11, fontWeight: "600", color: colors.primaryDark },
  mineBody: { fontSize: 15, fontWeight: "700", lineHeight: 21, color: colors.foreground },
  mineActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  mineMeta: { flex: 1, fontSize: 12, color: colors.primaryDeep },
  smallBtn: {
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  smallBtnText: { fontSize: 12, fontWeight: "700", color: colors.white },
  smallBtnGhost: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  smallBtnGhostText: { fontSize: 12, fontWeight: "700", color: colors.primaryDark },
  prompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  promptTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  promptSub: { marginTop: 2, fontSize: 12, lineHeight: 16, color: colors.muted },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shareText: { fontSize: 12, fontWeight: "700", color: colors.white },
  railHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  railTitle: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 12, fontWeight: "600", color: colors.primaryDark },
  railCard: {
    width: 168,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 6,
  },
  railTop: { flexDirection: "row", alignItems: "center", gap: 7 },
  railName: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.foreground },
  railEmoji: { fontSize: 15 },
  railBody: { fontSize: 12, lineHeight: 16, color: colors.foreground, minHeight: 32 },
  railFree: { fontSize: 11, fontWeight: "700", color: colors.primaryDark },
});
