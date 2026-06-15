import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Search } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Avatar } from "../components/ui/Avatar";
import { PostCard } from "../components/PostCard";

/** One box, three result types: people (name / interests / hometown / job /
 * major), communities, and posts. */
export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { people, communities, hangs, blocked } = useStore();
  const [q, setQ] = useState("");

  const needle = q.trim().toLowerCase();
  const match = (s: string | null) => (s ? s.toLowerCase().includes(needle) : false);

  const foundPeople = needle
    ? Object.values(people).filter(
        (p) =>
          !blocked.includes(p.id) &&
          (match(p.name) || match(p.hometown) || match(p.job) || match(p.major) ||
            [...p.hobbies, ...p.interests, ...p.likes].some((tag) => tag.toLowerCase().includes(needle))),
      )
    : [];
  const foundCommunities = needle ? communities.filter((c) => match(c.name) || match(c.desc)) : [];
  const foundPosts = needle
    ? hangs.filter(
        (h) => !blocked.includes(h.authorId) && (match(h.body) || match(h.venue) || h.hashtags.some((t) => t.includes(needle))),
      )
    : [];

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <View style={styles.searchBox}>
          <Search size={15} color={colors.placeholder} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="People, communities, posts…"
            placeholderTextColor={colors.placeholder}
            autoFocus
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        {!needle && (
          <Text style={sh.centerSub}>
            Try "running", "Columbus", "happy hour", or someone's name.
          </Text>
        )}
        {foundPeople.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>People</Text>
            {foundPeople.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push({ pathname: "/person/[id]", params: { id: p.id } })}
                style={[sh.personRow, sh.cardShadow]}
              >
                <Avatar name={p.name} src={p.avatar} verified={p.verified} />
                <View style={{ flex: 1 }}>
                  <Text style={sh.personName}>{p.name}</Text>
                  <Text style={sh.personMeta} numberOfLines={1}>{p.intro ?? `@${p.handle}`}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        {foundCommunities.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>Communities</Text>
            {foundCommunities.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push({ pathname: "/community/[id]", params: { id: c.id } })}
                style={[sh.personRow, sh.cardShadow]}
              >
                <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={sh.personName}>{c.name}</Text>
                  <Text style={sh.personMeta}>{c.members} members</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        {foundPosts.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={sh.sectionLabel}>Posts</Text>
            {foundPosts.map((h) => (
              <PostCard key={h.id} hang={h} />
            ))}
          </View>
        )}
        {needle.length > 0 &&
          foundPeople.length + foundCommunities.length + foundPosts.length === 0 && (
            <Text style={sh.centerSub}>Nothing for "{q}" — yet. Maybe you post it first?</Text>
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 0 },
});
