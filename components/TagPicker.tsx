import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Plus } from "lucide-react-native";

import { colors } from "../theme/colors";

/** Multi-select tag chips + a free "add your own" input — onboarding/edit use
 * this for hobbies / interests / likes (structured fields, never a free bio). */
export function TagPicker({
  suggestions,
  selected,
  onChange,
}: {
  suggestions: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const all = [...new Set([...suggestions, ...selected])];

  function toggle(tag: string) {
    onChange(selected.includes(tag) ? selected.filter((x) => x !== tag) : [...selected, tag]);
  }

  function addCustom() {
    const tag = custom.trim().toLowerCase();
    if (!tag) return;
    if (!selected.includes(tag)) onChange([...selected, tag]);
    setCustom("");
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.wrap}>
        {all.map((tag) => {
          const on = selected.includes(tag);
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
      <View style={styles.addRow}>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          placeholder="Add your own…"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          onSubmitEditing={addCustom}
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
