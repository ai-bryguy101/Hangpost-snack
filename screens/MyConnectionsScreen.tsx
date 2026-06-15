import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Users } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";

/** Your actual graph: requests in, connections kept. Discovery lives on the
 * People tab; this is the roster. */
export function MyConnectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { edges, blocked, personOf, accept, removeEdge, openDm } = useStore();

  const incoming = Object.entries(edges).filter(([id, s]) => s === "in" && !blocked.includes(id));
  const connected = Object.entries(edges).filter(([id, s]) => s === "connected" && !blocked.includes(id));
  const outgoing = Object.entries(edges).filter(([id, s]) => s === "out" && !blocked.includes(id));

  function message(id: string, name: string) {
    const threadId = openDm(id);
    if (threadId) router.push({ pathname: "/chat/[id]", params: { id: threadId } });
    else showAlert("Not connected yet", `You can message ${name} once you're connected.`);
  }

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>My connections</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
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
                    <Text style={sh.personMeta}>@{p.handle}</Text>
                  </View>
                  <Button size="sm" onPress={() => { accept(id); showToast(`Connected with ${p.name.split(" ")[0]} 🎉`); }} style={{ borderRadius: 999 }}>
                    Accept
                  </Button>
                  <Pressable onPress={() => removeEdge(id)} hitSlop={8} style={{ paddingHorizontal: 6 }}>
                    <Text style={sh.linkMuted}>Decline</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ gap: 8 }}>
          <Text style={sh.sectionLabel}>Connections ({connected.length})</Text>
          {connected.length === 0 ? (
            <View style={[sh.center, { paddingVertical: 48 }]}>
              <Users size={28} color={colors.primaryDark} />
              <Text style={styles.emptyTitle}>No connections yet</Text>
              <Text style={sh.centerSub}>Connect with people from your daily picks — they'll land here.</Text>
            </View>
          ) : (
            connected.map(([id]) => {
              const p = personOf(id);
              return (
                <View key={id} style={[sh.personRow, sh.cardShadow]}>
                  <Pressable onPress={() => router.push({ pathname: "/person/[id]", params: { id } })}>
                    <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={sh.personName}>{p.name}</Text>
                    <Text style={sh.personMeta} numberOfLines={1}>{p.intro ?? `@${p.handle}`}</Text>
                  </View>
                  <Button size="sm" variant="secondary" onPress={() => message(id, p.name.split(" ")[0])} style={{ borderRadius: 999 }}>
                    Message
                  </Button>
                  <Pressable
                    onPress={() =>
                      showAlert("Remove connection?", `Remove ${p.name} from your connections?`, [
                        { text: "Cancel", style: "cancel" },
                        { text: "Remove", style: "destructive", onPress: () => removeEdge(id) },
                      ])
                    }
                    hitSlop={8}
                    style={{ paddingHorizontal: 6 }}
                  >
                    <Text style={sh.linkMuted}>Remove</Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {outgoing.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>Sent — waiting on them</Text>
            {outgoing.map(([id]) => {
              const p = personOf(id);
              return (
                <View key={id} style={sh.personRow}>
                  <Avatar name={p.name} src={p.avatar} size="sm" />
                  <Text style={[sh.personMeta, { flex: 1 }]}>{p.name}</Text>
                  <Pressable onPress={() => removeEdge(id)} hitSlop={8}>
                    <Text style={sh.linkMuted}>Cancel</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyTitle: { fontSize: 15, fontWeight: "700", color: colors.foreground },
});
