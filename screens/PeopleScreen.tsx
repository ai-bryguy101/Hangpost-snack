import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChevronRight, UserCheck, Users } from "lucide-react-native";

import { useStore, type Person } from "../lib/store";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { relativeTime } from "../lib/format";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { GradientHero } from "../components/GradientHero";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Commonalities } from "../components/Commonalities";
import { SafetyMenu } from "../components/SafetyMenu";
import { HangAgain } from "../components/HangAgain";

/** Discovery: daily picks (reasons, never scores) + every lane that
 * re-introduces the same nearby people until they're friends. */
export function PeopleScreen() {
  const router = useRouter();
  const store = useStore();
  const {
    me, edges, blocked, dismissedMet, contactsSynced, familiar, pickIds, pymkIds,
    personOf, hangs, connect, accept, dismissMet, syncContacts, openDm,
  } = store;

  const visible = (id: string) => !blocked.includes(id);
  const incoming = Object.entries(edges).filter(([id, s]) => s === "in" && visible(id));
  const pastHang = hangs.find((h) => h.id === "h-past");
  const met = (pastHang?.goingIds ?? [])
    .filter((id) => id !== "me" && visible(id) && edges[id] !== "connected" && !dismissedMet.includes(id));
  const picks = pickIds.filter((id) => visible(id) && edges[id] !== "connected");
  const newcomers = Object.values(store.people)
    .filter((p) => p.newSince !== null && visible(p.id) && edges[p.id] !== "connected")
    .sort((a, b) => (b.newSince ?? "").localeCompare(a.newSince ?? ""));
  const pymk = pymkIds.filter((id) => visible(id) && !edges[id]);

  function handleConnect(p: Person) {
    connect(p.id);
    showToast(edges[p.id] === "in" ? `You and ${p.name.split(" ")[0]} are connected 🎉` : "Request sent");
  }

  function handleMessage(p: Person) {
    const threadId = openDm(p.id);
    if (threadId) router.push({ pathname: "/chat/[id]", params: { id: threadId } });
    else
      showAlert("Not connected yet", `You can message ${p.name.split(" ")[0]} once they accept your connection request.`);
  }

  return (
    <View style={sh.root}>
      <GradientHero
        title="Connections"
        subtitle="Worth exploring — picked for you, with reasons."
        right={
          <Pressable onPress={() => router.push("/connections")} style={styles.heroBtn}>
            <Users size={15} color={colors.white} />
            <Text style={styles.heroBtnText}>My connections</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        {/* Requests */}
        {incoming.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>Requests</Text>
            {incoming.map(([id]) => {
              const p = personOf(id);
              return (
                <View key={id} style={[sh.personRow, sh.cardShadow]}>
                  <Pressable onPress={() => router.push({ pathname: "/person/[id]", params: { id } })}>
                    <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={sh.personName}>{p.name}</Text>
                    <Text style={sh.personMeta}>wants to connect</Text>
                  </View>
                  <Button size="sm" onPress={() => { accept(id); showToast(`You and ${p.name.split(" ")[0]} are connected 🎉`); }} style={{ borderRadius: 999 }}>
                    Accept
                  </Button>
                </View>
              );
            })}
          </View>
        )}

        {/* People you met — the post-hangout activation loop */}
        {met.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>People you met</Text>
            <Text style={sh.hint}>
              The second hang is where it sticks — invite them to something, no planning required.
            </Text>
            {met.map((id) => {
              const p = personOf(id);
              return (
                <View key={id} style={[styles.metCard, sh.cardShadow]}>
                  <View style={sh.row}>
                    <Pressable onPress={() => router.push({ pathname: "/person/[id]", params: { id } })}>
                      <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={sh.personName}>{p.name}</Text>
                      <Text style={sh.personMeta} numberOfLines={1}>
                        Met at {pastHang?.venue} · {relativeTime(pastHang?.time ?? "")}
                      </Text>
                    </View>
                    <Pressable onPress={() => dismissMet(id)} hitSlop={8} style={{ paddingHorizontal: 4 }}>
                      <Text style={sh.linkMuted}>Dismiss</Text>
                    </Pressable>
                  </View>
                  <HangAgain person={p} onInvited={() => dismissMet(id)} />
                </View>
              );
            })}
          </View>
        )}

        {/* Daily picks */}
        <View style={{ gap: 10 }}>
          <Text style={sh.sectionLabel}>Connections worth exploring today</Text>
          {picks.map((id) => {
            const p = personOf(id);
            const sent = edges[id] === "out";
            return (
              <View key={id} style={[styles.pickCard, sh.cardShadow]}>
                <View style={styles.pickHeader}>
                  <Pressable
                    style={[sh.row, { flex: 1 }]}
                    onPress={() => router.push({ pathname: "/person/[id]", params: { id } })}
                  >
                    <Avatar name={p.name} src={p.avatar} size="lg" verified={p.verified} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickName}>{p.name}</Text>
                      {p.intro && (
                        <Text style={styles.pickIntro} numberOfLines={2}>
                          {p.intro}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                  <SafetyMenu targetId={id} targetName={p.name} />
                </View>
                <Commonalities person={p} />
                <View style={styles.pickCtas}>
                  <Button
                    variant={sent ? "secondary" : "primary"}
                    onPress={() => !sent && handleConnect(p)}
                    style={{ flex: 1, borderRadius: 999 }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {sent && <UserCheck size={15} color={colors.primaryDark} />}
                      <Text style={{ fontSize: 14, fontWeight: "700", color: sent ? colors.primaryDark : colors.white }}>
                        {sent ? "Request sent" : "Connect"}
                      </Text>
                    </View>
                  </Button>
                  <Button variant="outlined" onPress={() => handleMessage(p)} style={{ flex: 1, borderRadius: 999 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Say hi</Text>
                  </Button>
                </View>
              </View>
            );
          })}
        </View>

        {/* Familiar faces */}
        {familiar.filter((f) => visible(f.id)).length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>Familiar faces</Text>
            <Text style={sh.hint}>You keep crossing paths — that's how friendships actually start.</Text>
            {familiar
              .filter((f) => visible(f.id))
              .map((f) => {
                const p = personOf(f.id);
                const connected = edges[f.id] === "connected";
                return (
                  <View key={f.id} style={[sh.personRow, sh.cardShadow]}>
                    <Pressable onPress={() => router.push({ pathname: "/person/[id]", params: { id: f.id } })}>
                      <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={sh.personName}>{p.name}</Text>
                      <Text style={sh.personMeta} numberOfLines={1}>
                        Crossed paths {f.count}× · last at {f.lastVenue}
                      </Text>
                    </View>
                    {connected ? (
                      <Button size="sm" variant="secondary" onPress={() => handleMessage(p)} style={{ borderRadius: 999 }}>
                        Message
                      </Button>
                    ) : (
                      <Button size="sm" onPress={() => handleConnect(p)} style={{ borderRadius: 999 }}>
                        {edges[f.id] === "out" ? "Sent ✓" : "Say hi"}
                      </Button>
                    )}
                  </View>
                );
              })}
          </View>
        )}

        {/* New here */}
        {newcomers.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>New here, like you</Text>
            {newcomers.map((p) => (
              <View key={p.id} style={[sh.personRow, sh.cardShadow]}>
                <Pressable onPress={() => router.push({ pathname: "/person/[id]", params: { id: p.id } })}>
                  <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={sh.personName}>{p.name}</Text>
                  <Text style={sh.personMeta} numberOfLines={1}>
                    👋 New here · from {p.hometown?.split(",")[0]}
                  </Text>
                </View>
                <Button
                  size="sm"
                  variant={edges[p.id] === "out" ? "secondary" : "primary"}
                  onPress={() => edges[p.id] !== "out" && handleConnect(p)}
                  style={{ borderRadius: 999 }}
                >
                  {edges[p.id] === "out" ? "Sent ✓" : "Connect"}
                </Button>
              </View>
            ))}
          </View>
        )}

        {/* Contacts */}
        {!contactsSynced ? (
          <Pressable
            onPress={() => {
              const found = syncContacts();
              showToast(`Found ${found} people you already know 👋`);
            }}
            style={[styles.syncCard, sh.cardShadow]}
          >
            <Users size={20} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={sh.personName}>Find friends from your contacts</Text>
              <Text style={sh.personMeta}>
                Friends-of-friends is the #1 path to new friends. We only check hashes — contacts never leave your phone.
              </Text>
            </View>
            <ChevronRight size={18} color={colors.placeholder} />
          </Pressable>
        ) : (
          pymk.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={sh.sectionLabel}>From your contacts</Text>
              {pymk.map((id) => {
                const p = personOf(id);
                return (
                  <View key={id} style={[sh.personRow, sh.cardShadow]}>
                    <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                    <View style={{ flex: 1 }}>
                      <Text style={sh.personName}>{p.name}</Text>
                      <Text style={sh.personMeta}>In your contacts</Text>
                    </View>
                    <Button size="sm" onPress={() => handleConnect(p)} style={{ borderRadius: 999 }}>
                      Connect
                    </Button>
                  </View>
                );
              })}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroBtnText: { fontSize: 12, fontWeight: "700", color: colors.white },
  metCard: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 14, gap: 12 },
  pickCard: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 16, gap: 12 },
  pickHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  pickName: { fontSize: 16, fontWeight: "700", color: colors.foreground },
  pickIntro: { marginTop: 2, fontSize: 13, lineHeight: 18, color: colors.muted },
  pickCtas: { flexDirection: "row", gap: 8 },
  syncCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    backgroundColor: colors.surface,
    padding: 16,
  },
});
