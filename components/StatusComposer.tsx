import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, X } from "lucide-react-native";

import { useStore, type StatusKind } from "../lib/store";
import { showToast } from "../lib/toast";
import { STATUS_KINDS, STATUS_PLACEHOLDERS, inferKind } from "../data/statuses";
import { colors } from "../theme/colors";

/** The one-tap "status" composer (brief: STATUS_POSTS.md). Lowest-friction
 * posting in the app: tap a brand-voice preset and it's live — no blank box, no
 * date picker, no fear. Optional custom text on top. The presets carry the
 * voice; the trust copy ("only connections see it, it disappears") is what makes
 * it safe to post. */
export function StatusComposer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { postStatus } = useStore();
  const [text, setText] = useState("");
  // Re-roll the placeholder each time the sheet opens — the voice does the work.
  const placeholder = useMemo(
    () => STATUS_PLACEHOLDERS[Math.floor(Math.random() * STATUS_PLACEHOLDERS.length)],
    [visible],
  );

  function post(kind: StatusKind, body: string) {
    postStatus(kind, body);
    setText("");
    onClose();
    showToast("You're on the board 👋 connections can see you're around");
  }

  const trimmed = text.trim();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>What's your status?</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.muted} />
            </Pressable>
          </View>
          <Text style={styles.sub}>
            Only your connections see it, and it disappears on its own. No pressure — declining is
            invisible.
          </Text>

          <View style={styles.customRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              maxLength={90}
              onSubmitEditing={() => trimmed && post(inferKind(trimmed), trimmed)}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => trimmed && post(inferKind(trimmed), trimmed)}
              style={[styles.sendBtn, !trimmed && { opacity: 0.4 }]}
              disabled={!trimmed}
            >
              <Send size={16} color={colors.white} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 360 }}
            contentContainerStyle={{ gap: 16, paddingTop: 4, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {STATUS_KINDS.map((k) => (
              <View key={k.key} style={{ gap: 8 }}>
                <Text style={styles.groupLabel}>
                  {k.emoji} {k.label}
                </Text>
                <View style={styles.wrap}>
                  {k.presets.map((p) => (
                    <Pressable key={p} onPress={() => post(k.key, p)} style={styles.chip}>
                      <Text style={styles.chipText}>{p}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.foot}>Tap one to post it — no typing needed.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 17, fontWeight: "800", color: colors.foreground },
  sub: { marginTop: 4, marginBottom: 12, fontSize: 13, lineHeight: 18, color: colors.muted },
  customRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  input: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
  },
  sendBtn: {
    height: 38,
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
  },
  groupLabel: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  foot: { marginTop: 6, fontSize: 12, color: colors.muted, textAlign: "center" },
});
