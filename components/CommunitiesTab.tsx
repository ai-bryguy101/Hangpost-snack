import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Plus, Search } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { colors, radiusCard } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "./ui/Button";
import { PostCard } from "./PostCard";

/** The Communities lens: my communities → happening soon → discover/join. */
export function CommunitiesTab() {
  const router = useRouter();
  const { communities, hangs, joinCommunity, leaveCommunity } = useStore();
  const [q, setQ] = useState("");

  const mine = communities.filter((c) => c.joined);
  const discover = communities.filter(
    (c) => !c.joined && (q ? c.name.toLowerCase().includes(q.toLowerCase()) : true),
  );
  const upcomingEvents = hangs
    .filter((h) => h.communityId !== null && h.time !== null && new Date(h.time).getTime() > Date.now())
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 96 }}>
      <View style={styles.searchRow}>
        <Search size={15} color={colors.placeholder} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search communities"
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
        />
        <Pressable onPress={() => router.push("/community-new")} style={styles.addBtn}>
          <Plus size={18} color={colors.white} />
        </Pressable>
      </View>

      {mine.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={sh.sectionLabel}>My communities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {mine.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push({ pathname: "/community/[id]", params: { id: c.id } })}
                style={styles.mineChip}
              >
                <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
                <Text style={styles.mineName}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {upcomingEvents.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={sh.sectionLabel}>Happening soon</Text>
          {upcomingEvents.map((h) => (
            <PostCard key={h.id} hang={h} />
          ))}
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text style={sh.sectionLabel}>{q ? "Results" : "Recommended for you"}</Text>
        {discover.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: "/community/[id]", params: { id: c.id } })}
            style={[styles.row, sh.cardShadow]}
          >
            <Text style={{ fontSize: 26 }}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{c.name}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {c.members} members · {c.desc}
              </Text>
            </View>
            <Button
              size="sm"
              onPress={() => {
                joinCommunity(c.id);
                showToast(`Joined ${c.name} ${c.emoji}`);
              }}
              style={{ borderRadius: 999 }}
            >
              Join
            </Button>
          </Pressable>
        ))}
        {mine.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: "/community/[id]", params: { id: c.id } })}
            style={[styles.row, sh.cardShadow]}
          >
            <Text style={{ fontSize: 26 }}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{c.name}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {c.members} members · {c.desc}
              </Text>
            </View>
            <Button size="sm" variant="secondary" onPress={() => leaveCommunity(c.id)} style={{ borderRadius: 999 }}>
              Joined
            </Button>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 4 },
  addBtn: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
  },
  mineChip: {
    alignItems: "center",
    gap: 4,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mineName: { fontSize: 12, fontWeight: "700", color: colors.primaryDeep },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radiusCard,
    backgroundColor: colors.surface,
    padding: 14,
  },
  rowName: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  rowMeta: { marginTop: 1, fontSize: 12, color: colors.muted },
});
