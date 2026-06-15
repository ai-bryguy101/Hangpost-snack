import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, UserCheck } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useLocalSearchParams, useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { Commonalities } from "../components/Commonalities";
import { SafetyMenu } from "../components/SafetyMenu";
import { PostCard } from "../components/PostCard";

/** A person, profile-first: who they are, what you share, and — the Hangpost
 * twist — the hangouts you could simply JOIN instead of cold-DMing them. */
export function PersonProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const { personOf, edges, hangs, connect, openDm } = store;

  const p = personOf(id ?? "");
  if (!p) return null;
  const edge = edges[p.id];
  const connected = edge === "connected";

  const theirHangs = hangs
    .filter((h) => h.type === "hangout" && h.audience === "everyone")
    .filter((h) => h.time !== null && new Date(h.time).getTime() > Date.now())
    .filter((h) => h.authorId === p.id || h.goingIds.includes(p.id))
    .slice(0, 2);

  function handleMessage() {
    const threadId = openDm(p.id);
    if (threadId) router.push({ pathname: "/chat/[id]", params: { id: threadId } });
    else showAlert("Not connected yet", `You can message ${p.name.split(" ")[0]} once you're connected.`);
  }

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>@{p.handle}</Text>
        <SafetyMenu targetId={p.id} targetName={p.name} isConnection={connected} onAfter={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        <View style={{ alignItems: "center", gap: 10 }}>
          <Avatar name={p.name} src={p.avatar} size="xl" verified={p.verified} />
          <View style={{ alignItems: "center" }}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={sh.personMeta}>
              {[p.pronouns, p.age ? `${p.age}` : null, p.newSince ? "👋 new in town" : null]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
          {p.intro && <Text style={styles.intro}>{p.intro}</Text>}
          {p.reliable && (p.attended ?? 0) >= 5 && (
            <View style={styles.showsUp}>
              <Text style={styles.showsUpText}>
                ✓ Shows up · {p.attended} hangouts attended
              </Text>
            </View>
          )}
          {p.verified && <Text style={styles.verifiedNote}>Photo verified</Text>}
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            variant={edge === "out" ? "secondary" : "primary"}
            onPress={() => {
              if (edge === "out" || connected) return;
              connect(p.id);
              showToast(edge === "in" ? `You and ${p.name.split(" ")[0]} are connected 🎉` : "Request sent");
            }}
            style={{ flex: 1, borderRadius: 999 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {(edge === "out" || connected) && <UserCheck size={15} color={colors.primaryDark} />}
              <Text style={{ fontSize: 14, fontWeight: "700", color: edge === "out" || connected ? colors.primaryDark : colors.white }}>
                {connected ? "Connected" : edge === "out" ? "Request sent" : edge === "in" ? "Accept request" : "Connect"}
              </Text>
            </View>
          </Button>
          <Button variant="outlined" onPress={handleMessage} style={{ flex: 1, borderRadius: 999 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Message</Text>
          </Button>
        </View>

        <View style={[sh.card, sh.cardShadow, { gap: 10 }]}>
          <Commonalities person={p} />
        </View>

        {(p.hometown || p.college || p.major || p.job) && (
          <View style={[sh.card, sh.cardShadow, { gap: 6 }]}>
            <Text style={sh.sectionLabel}>Background</Text>
            {p.hometown && <Text style={styles.fact}>From {p.hometown}</Text>}
            {p.college && <Text style={styles.fact}>{p.college}{p.major ? ` · ${p.major}` : ""}</Text>}
            {!p.college && p.major && <Text style={styles.fact}>Studied {p.major}</Text>}
            {p.job && <Text style={styles.fact}>{p.job}</Text>}
          </View>
        )}

        {[
          { label: "Hobbies", items: p.hobbies, tinted: true },
          { label: "Interests", items: p.interests, tinted: true },
          { label: "Likes", items: p.likes, tinted: false },
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

        {theirHangs.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>Join {p.name.split(" ")[0]} at…</Text>
            <Text style={sh.hint}>
              The low-pressure way in: show up to the same thing. No cold DM needed.
            </Text>
            {theirHangs.map((h) => (
              <PostCard key={h.id} hang={h} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 22, fontWeight: "800", color: colors.foreground },
  intro: { textAlign: "center", fontSize: 14, lineHeight: 20, color: colors.muted, paddingHorizontal: 16 },
  verifiedNote: { fontSize: 11, fontWeight: "600", color: colors.primaryDark },
  showsUp: {
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  showsUpText: { fontSize: 12, fontWeight: "700", color: colors.primaryDeep },
  fact: { fontSize: 14, color: colors.foreground },
});
