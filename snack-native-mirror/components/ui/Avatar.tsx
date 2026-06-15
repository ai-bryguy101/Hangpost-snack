import { Image, Text, View } from "react-native";

import { colors } from "../../theme/colors";

type Size = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: Size;
}

const dim: Record<Size, number> = { sm: 24, md: 40, lg: 56 };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const d = dim[size];
  if (src) {
    return <Image source={{ uri: src }} style={{ width: d, height: d, borderRadius: d / 2 }} />;
  }
  return (
    <View
      style={{
        width: d,
        height: d,
        borderRadius: d / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primaryLight,
      }}
    >
      <Text style={{ fontSize: d * 0.36, fontWeight: "700", color: colors.primaryDark }}>
        {initials(name)}
      </Text>
    </View>
  );
}
