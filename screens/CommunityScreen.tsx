import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Plus } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useLocalSearchParams, useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "../components/ui/Button";
import { PostCard } from "../components/PostCard";

/** A community: identity, join/leave, members-feel, and its events (which are
 * just hangouts — same loop, same chat machinery). */
export function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { communities, hangs, joinCommunity, leaveCommunity } = useStore();

  const c = communities.find((x) => x.id === id);
  if (!c) return null;
  const events = hangs
    .filter((h) => h.communityId === c.id)
    .filter((h) => h.time !== null && new Date(h.time).getTime() > Date.now())
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle} numberOfLines={1}>
          {c.name}
        </Text>
        <Button
          size="sm"
          variant={c.joined ? "secondary" : "primary"}
          onPress={() => {
            if (c.joined) leaveCommunity(c.id);
            else {
              joinCommunity(c.id);
              showToast(`Joined ${c.name} ${c.emoji}`);
            }
          }}
          style={{ borderRadius: 999 }}
        >
          {c.joined ? "Joined" : "Join"}
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={[sh.card, sh.cardShadow, sh.row]}>
          <Text style={{ fontSize: 34 }}>{c.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{c.name}</Text>
            <Text style={sh.personMeta}>{c.members} members</Text>
            <Text style={styles.desc}>{c.desc}</Text>
          </View>
        </View>

        {c.joined && (
          <Button
            variant="outlined"
            onPress={() => router.push({ pathname: "/create", params: { communityId: c.id } })}
            style={{ borderRadius: 999 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Plus size={16} color={colors.primaryDark} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>Post an event</Text>
            </View>
          </Button>
        )}

        <Text style={sh.sectionLabel}>Upcoming events</Text>
        {events.length === 0 ? (
          <Text style={sh.centerSub}>
            Nothing on the calendar. {c.joined ? "Post the first one — someone has to." : "Join to post the first one."}
          </Text>
        ) : (
          events.map((h) => <PostCard key={h.id} hang={h} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 17, fontWeight: "800", color: colors.foreground },
  desc: { marginTop: 4, fontSize: 13, lineHeight: 18, color: colors.muted },
});
