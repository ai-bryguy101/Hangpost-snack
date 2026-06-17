import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Plus } from "lucide-react-native";

import { colors } from "../theme/colors";
import type { TagGroup } from "../data/interests";

/** Themed, multi-select tag chips + a free "add your own" input. The grouped
 * cousin of TagPicker: the "What are you into?" page uses it so a long option
 * list reads as scannable sections (Music / Outdoors / …) instead of a flat
 * wall. All groups write into ONE `selected` array (a single profile field);
 * anything the user types that isn't in a group surfaces under "Yours" so it's
 * never lost. Matching is case-insensitive, so curated chips and typed-in
 * additions de-dupe sensibly. */
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
  const rendered: TagGroup[] = yours.length
    ? [...groups, { label: "Yours", emoji: "✨", options: yours }]
    : groups;

  return (
    <View style={{ gap: 14 }}>
      {rendered.map((g) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { fontSize: 13, fontWeight: "700", color: colors.foreground },
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.foreground,
  },
  addButton: {
    height: 34,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
});
