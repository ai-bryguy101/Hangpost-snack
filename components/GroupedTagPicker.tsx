import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Plus } from "lucide-react-native";

import { colors } from "../theme/colors";
import type { TagGroup } from "../data/interests";

/** Write-in-first, themed tag picker. People always have something specific in
 * mind that no curated list can hold (the one band only they know), so the free
 * "add your own" box sits at the TOP as the primary action; the themed chip
 * sections below are *ideas to tap*, not the only way in. All groups write into
 * ONE `selected` array (a single profile field); anything typed that isn't in a
 * group surfaces under "Yours" right beneath the box so it's never lost.
 * De-dupe is case-insensitive, so curated chips and typed-in additions merge
 * sensibly (typing "yoga" just lights up the curated "yoga" chip). */
export function GroupedTagPicker({
  groups,
  selected,
  onChange,
  addPlaceholder = "Add your own…",
}: {
  groups: TagGroup[];
  selected: string[];
  onChange: (next: string[]) => void;
  addPlaceholder?: string;
}) {
  const [custom, setCustom] = useState("");
  const has = (tag: string) => selected.some((s) => s.toLowerCase() === tag.toLowerCase());

  function toggle(tag: string) {
    if (has(tag)) onChange(selected.filter((s) => s.toLowerCase() !== tag.toLowerCase()));
    else onChange([...selected, tag]);
  }

  function addCustom() {
    const tag = custom.trim();
    if (tag && !has(tag)) onChange([...selected, tag]);
    setCustom("");
  }

  const known = new Set(groups.flatMap((g) => g.options.map((o) => o.toLowerCase())));
  const yours = selected.filter((s) => !known.has(s.toLowerCase()));
  // "Yours" rides at the top (right under the box) so write-ins land where you
  // typed them; the curated sections follow as suggestions.
  const ordered: TagGroup[] = yours.length
    ? [{ label: "Yours", emoji: "✨", options: yours }, ...groups]
    : groups;

  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 6 }}>
        <View style={styles.addRow}>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder={addPlaceholder}
            placeholderTextColor={colors.placeholder}
            onSubmitEditing={addCustom}
            returnKeyType="done"
            style={styles.addInput}
          />
          <Pressable onPress={addCustom} style={styles.addButton}>
            <Plus size={16} color={colors.primaryDark} />
          </Pressable>
        </View>
        <Text style={styles.caption}>Write your own — or tap any idea below.</Text>
      </View>

      {ordered.map((g) => (
        <View key={g.label} style={{ gap: 8 }}>
          <Text style={styles.groupLabel}>
            {g.emoji} {g.label}
          </Text>
          <View style={styles.wrap}>
            {g.options.map((tag) => {
              const on = has(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggle(tag)}
                  style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                >
                  <Text style={[styles.chipText, { color: on ? colors.white : colors.muted }]}>
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  caption: { fontSize: 12, color: colors.muted },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  chipOn: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  chipOff: { backgroundColor: colors.surface, borderColor: colors.border },
  chipText: { fontSize: 13, fontWeight: "600" },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addInput: {
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
  addButton: {
    height: 38,
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
});
