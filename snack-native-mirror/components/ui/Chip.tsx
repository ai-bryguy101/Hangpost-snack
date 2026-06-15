import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/colors";

type Variant = "default" | "tinted";

interface ChipProps {
  label: string;
  variant?: Variant;
}

export function Chip({ label, variant = "default" }: ChipProps) {
  const tinted = variant === "tinted";
  return (
    <View style={[styles.base, tinted ? styles.tinted : styles.plain]}>
      <Text style={[styles.text, { color: tinted ? colors.primaryDark : colors.muted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  plain: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  tinted: { backgroundColor: colors.primaryLight },
  text: { fontSize: 12, fontWeight: "500" },
});
