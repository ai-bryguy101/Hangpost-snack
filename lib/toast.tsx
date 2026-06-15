import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2 } from "lucide-react-native";

import { colors } from "../theme/colors";

/** Auto-dismissing confirmation banner ("You're in — added to your Hangouts").
 * Rendered as a root overlay so it shows above any screen. */

let presenter: ((text: string) => void) | null = null;

export function showToast(text: string): void {
  presenter?.(text);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (t: string) => {
      setText(t);
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(
          () => setText(null),
        );
      }, 2200);
    },
    [opacity],
  );

  useEffect(() => {
    presenter = show;
    return () => {
      presenter = null;
    };
  }, [show]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {text !== null && (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { top: insets.top + 8, opacity }]}
        >
          <CheckCircle2 size={16} color={colors.white} />
          <Text style={styles.text}>{text}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.white },
});
