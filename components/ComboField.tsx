import { useState, type ComponentType } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../theme/colors";
import { sh } from "../theme/shared";

type IconType = ComponentType<{ size?: number; color?: string }>;

/** Labeled autocomplete input: type freely, tap a suggestion to snap to a
 * canonical value, or keep exactly what you typed — the free-text escape hatch.
 *
 * Why the list matters (and why the escape hatch matters just as much):
 * hometown/college are matched by EXACT string equality in the connections
 * engine, so a curated list canonicalises the common case — everyone who picks
 * "Ohio State University" stores the identical string, so the shared-background
 * tier actually fires. The free-text fallback keeps coverage for anything not
 * on the list (a small school, a town we missed) without losing the canonical
 * win for the 95%. */
export function ComboField({
  label,
  hint,
  value,
  onChangeText,
  options,
  placeholder,
  icon: Icon,
  autoCapitalize = "words",
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (next: string) => void;
  options: readonly string[];
  placeholder?: string;
  icon?: IconType;
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
}) {
  const [focused, setFocused] = useState(false);

  const typed = value.trim();
  const q = typed.toLowerCase();
  // Already on the list, same casing → nothing left to canonicalise.
  const canonical = options.some((o) => o === typed);
  const matches =
    q.length === 0 || canonical
      ? []
      : [...options]
          .filter((o) => o.toLowerCase().includes(q))
          .sort(
            (a, b) =>
              Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q)),
          )
          .slice(0, 6);

  const showPanel = focused && matches.length > 0;
  const showEscape = focused && q.length > 0 && !canonical;

  return (
    <View>
      <Text style={sh.fieldLabel}>{label}</Text>

      <View style={styles.inputRow}>
        {Icon && <Icon size={15} color={colors.placeholder} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          // Delay so a tap on a suggestion lands before the list collapses.
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={styles.input}
        />
      </View>

      {showPanel && (
        <View style={[styles.panel, sh.cardShadow]}>
          {matches.map((opt, idx) => (
            <Pressable
              key={opt}
              onPress={() => {
                onChangeText(opt);
                setFocused(false);
              }}
              style={[styles.optRow, idx > 0 && styles.optDivider]}
            >
              {Icon && <Icon size={14} color={colors.muted} />}
              <Text style={styles.optText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {showEscape ? (
        <Text style={sh.hint}>
          {matches.length > 0
            ? `Tap a match, or keep “${typed}” as your own.`
            : `No match — “${typed}” saves as you typed it.`}
        </Text>
      ) : (
        hint ? <Text style={sh.hint}>{hint}</Text> : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 0 },
  panel: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  optDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  optText: { fontSize: 14, color: colors.foreground },
});
