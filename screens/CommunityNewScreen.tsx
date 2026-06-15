import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { useStore } from "../lib/store";
import { useRouter } from "../lib/router";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "../components/ui/Button";

const EMOJIS = ["🏃", "🧗", "🍜", "🎲", "📚", "🎸", "⚽", "🎨", "🥾", "☕"];

export function CommunityNewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createCommunity } = useStore();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("🏃");

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>New community</Text>
        <Button
          size="sm"
          disabled={name.trim().length < 2}
          onPress={() => {
            const id = createCommunity(name.trim(), emoji, desc.trim() || "A new Hangpost community.");
            showToast(`${name.trim()} is live ${emoji}`);
            router.replace({ pathname: "/community/[id]", params: { id } });
          }}
          style={{ borderRadius: 999 }}
        >
          Create
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={sh.fieldLabel}>Emoji</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {EMOJIS.map((e) => (
              <Pressable key={e} onPress={() => setEmoji(e)} style={[styles.emojiBtn, emoji === e && { borderColor: colors.primaryDark, backgroundColor: colors.primaryLight }]}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View>
          <Text style={sh.fieldLabel}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={80}
            placeholder="e.g. DC Boulderers"
            placeholderTextColor={colors.placeholder}
            style={sh.input}
          />
        </View>
        <View>
          <Text style={sh.fieldLabel}>What's it about?</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            maxLength={300}
            multiline
            placeholder="Who's it for, what do you do, how often?"
            placeholderTextColor={colors.placeholder}
            style={[sh.input, { minHeight: 80, textAlignVertical: "top" }]}
          />
        </View>
        <Text style={sh.hint}>
          Communities run on the same hangout loop — post events, people tap "I'm in", everyone
          lands in the group chat.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiBtn: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
