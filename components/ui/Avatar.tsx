import { Image, Text, View } from "react-native";
import { BadgeCheck } from "lucide-react-native";

import { colors } from "../../theme/colors";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const dim: Record<Size, number> = { xs: 20, sm: 24, md: 40, lg: 56, xl: 84 };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Avatar with optional photo-verified check (drop-21 decision: the badge
 * means "this photo is really them" — recognition at the meetup). */
export function Avatar({
  name,
  src,
  size = "md",
  verified = false,
}: {
  name: string;
  src?: string | null;
  size?: Size;
  verified?: boolean;
}) {
  const d = dim[size];
  const check = Math.max(14, Math.round(d * 0.32));
  return (
    <View style={{ width: d, height: d }}>
      {src ? (
        <Image source={{ uri: src }} style={{ width: d, height: d, borderRadius: d / 2 }} />
      ) : (
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
      )}
      {verified && size !== "xs" && size !== "sm" && (
        <View
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            borderRadius: 999,
            backgroundColor: colors.surface,
          }}
        >
          <BadgeCheck size={check} color={colors.primaryDark} fill={colors.primaryLight} />
        </View>
      )}
    </View>
  );
}
