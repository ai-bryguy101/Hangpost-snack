import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

/** Cross-platform replacement for RN `Alert.alert`, which is a NO-OP in
 * react-native-web (Snack's browser preview). Same call shape; renders an
 * iOS-style centered dialog that works on web + device. */

export interface DialogButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

interface DialogOptions {
  title: string;
  message?: string;
  buttons: DialogButton[];
}

let presenter: ((opts: DialogOptions) => void) | null = null;

export function showAlert(title: string, message?: string, buttons?: DialogButton[]): void {
  const opts = { title, message, buttons: buttons?.length ? buttons : [{ text: "OK" }] };
  if (presenter) presenter(opts);
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<DialogOptions | null>(null);

  useEffect(() => {
    presenter = setOpts;
    return () => {
      presenter = null;
    };
  }, []);

  function press(b: DialogButton) {
    setOpts(null);
    b.onPress?.();
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Modal visible={opts !== null} transparent animationType="fade">
        <View style={styles.backdrop}>
          {opts && (
            <View style={styles.card}>
              <Text style={styles.title}>{opts.title}</Text>
              {opts.message ? <Text style={styles.message}>{opts.message}</Text> : null}
              <View style={styles.buttons}>
                {opts.buttons.map((b) => (
                  <Pressable key={b.text} onPress={() => press(b)} style={styles.button}>
                    <Text
                      style={[
                        styles.buttonText,
                        b.style === "destructive" && { color: "#dc2626" },
                        b.style === "cancel" && { color: colors.muted, fontWeight: "500" },
                      ]}
                    >
                      {b.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 32,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.foreground, textAlign: "center" },
  message: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    textAlign: "center",
  },
  buttons: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  button: { paddingVertical: 12, alignItems: "center" },
  buttonText: { fontSize: 15, fontWeight: "600", color: colors.primaryDark },
});
