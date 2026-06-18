import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Coffee, UserCheck } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Commonalities } from "../components/Commonalities";

/** Straight out of onboarding: your first 10 — instant proof the city has
 * people worth meeting. Connect to any of them before you even see the feed. */
export function FirstPicksScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { me, people, pickIds, pymkIds, contactsSynced, edges, connect, personOf } = useStore();
  const [sent, setSent] = useState<string[]>([]);

  const ordered = [
    ...(contactsSynced ? pymkIds : []),
    ...pickIds,
    ...Object.keys(people),
  ];
  const top10 = [...new Set(ordered)].filter((id) => !edges[id]).slice(0, 10);

  function handleConnect(id: string) {
    connect(id);
    setSent((s) => [...s, id]);
    showToast("Request sent");
  }

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Coffee size={22} color={colors.primaryDark} />
        <Text style={styles.title}>
          {me.name.split(" ")[0]}, your first 10
        </Text>
        <Text style={sh.centerSub}>
          Connections worth exploring near {me.homeLabel.split(" (")[0]} — picked from your
          background, what you're into{contactsSynced ? ", and your contacts" : ""}. Connect to a
          few before you even see the feed.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 110 }}>
        {top10.map((id, i) => {
          const p = personOf(id);
          const isSent = sent.includes(id);
          const fromContacts = contactsSynced && pymkIds.includes(id);
          return (
            <View key={id} style={[styles.card, sh.cardShadow]}>
              <View style={[sh.row, { alignItems: "flex-start" }]}>
                <Text style={styles.rank}>{i + 1}</Text>
                <Pressable
                  style={[sh.row, { flex: 1, alignItems: "flex-start" }]}
                  onPress={() => router.push({ pathname: "/person/[id]", params: { id } })}
                >
                  <Avatar name={p.name} src={p.avatar} size="lg" verified={p.verified} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{p.name}</Text>
                    {fromContacts ? (
                      <Text style={styles.contactsTag}>In your contacts</Text>
                    ) : p.intro ? (
                      <Text style={styles.intro} numberOfLines={2}>
                        {p.intro}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
                <Button
                  size="sm"
                  variant={isSent ? "secondary" : "primary"}
                  onPress={() => !isSent && handleConnect(id)}
                  style={{ borderRadius: 999 }}
                >
                  {isSent ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <UserCheck size={13} color={colors.primaryDark} />
                      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primaryDark }}>Sent</Text>
                    </View>
                  ) : (
                    "Connect"
                  )}
                </Button>
              </View>
              <View style={{ marginTop: 10, marginLeft: 30 }}>
                <Commonalities person={p} compact />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button onPress={onDone} style={{ alignSelf: "stretch", borderRadius: 999 }}>
          {sent.length > 0 ? `Nice — take me to my feed (${sent.length} sent)` : "Take me to my feed"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 18, backgroundColor: colors.surface },
  title: { fontSize: 20, fontWeight: "800", color: colors.foreground },
  card: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 14 },
  rank: { width: 18, fontSize: 13, fontWeight: "800", color: colors.placeholder, marginTop: 16 },
  name: { fontSize: 15, fontWeight: "700", color: colors.foreground },
  intro: { marginTop: 2, fontSize: 12, lineHeight: 16, color: colors.muted },
  contactsTag: { marginTop: 2, fontSize: 12, fontWeight: "700", color: colors.primaryDark },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
