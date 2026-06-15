import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";

import { colors } from "../../theme/colors";

type Variant = "primary" | "secondary" | "outlined";
type Size = "sm" | "md";

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.white : colors.primaryDark}
        />
      ) : (
        <View style={styles.row}>
          {typeof children === "string" ? (
            <Text style={[styles.text, textStyles[variant], { fontSize: size === "sm" ? 14 : 16 }]}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { fontWeight: "600" },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primaryDark },
  secondary: { backgroundColor: colors.primaryLight },
  outlined: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
};

const textStyles: Record<Variant, { color: string }> = {
  primary: { color: colors.white },
  secondary: { color: colors.primaryDark },
  outlined: { color: colors.foreground },
};

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { height: 36, paddingHorizontal: 16, borderRadius: 12 },
  md: { height: 48, paddingHorizontal: 20, borderRadius: 12 },
};
