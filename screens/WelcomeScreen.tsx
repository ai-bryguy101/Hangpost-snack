import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, ShieldCheck, Users } from "lucide-react-native";

import { colors } from "../theme/colors";

/** The brand moment. Two doors: the full new-user path, or straight into the
 * demo world ("I have an account"). */
export function WelcomeScreen({
  onCreateAccount,
  onSignIn,
}: {
  onCreateAccount: () => void;
  onSignIn: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={["#0f5950", "#1a7a6e", "#28a18f"]} style={{ flex: 1 }}>
      <View style={[styles.inner, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}>
        <View style={{ flex: 1, justifyContent: "center", gap: 28 }}>
          <View>
            <Text style={styles.wordmark}>Hangpost</Text>
            <Text style={styles.tagline}>
              The app you download when you{"\n"}move somewhere new.
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <ValueProp
              Icon={MapPin}
              title="Your city's posterboard"
              sub="Hangouts and local tips from people actually near you."
            />
            <ValueProp
              Icon={Users}
              title="Join in one tap"
              sub={'See "drinks at 7, anyone in?" — tap I\'m in. That\'s it.'}
            />
            <ValueProp
              Icon={ShieldCheck}
              title="Groups, in public, verified"
              sub="Meet in groups at public places. Real, verified people."
            />
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Pressable onPress={onCreateAccount} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Get started</Text>
          </Pressable>
          <Pressable onPress={onSignIn} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>I have an account</Text>
          </Pressable>
          <Text style={styles.footnote}>
            No followers. No swiping. Just people nearby worth meeting.
          </Text>
          <Text style={styles.legalNote}>
            By continuing you agree to the Terms of Service & Privacy Policy
            (18+) — they live in Settings, in plain language.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function ValueProp({
  Icon,
  title,
  sub,
}: {
  Icon: typeof MapPin;
  title: string;
  sub: string;
}) {
  return (
    <View style={styles.propRow}>
      <View style={styles.propIcon}>
        <Icon size={20} color={colors.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.propTitle}>{title}</Text>
        <Text style={styles.propSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 28 },
  wordmark: { fontSize: 40, fontWeight: "800", color: colors.white, letterSpacing: -1 },
  tagline: { marginTop: 10, fontSize: 18, lineHeight: 26, fontWeight: "600", color: "rgba(255,255,255,0.92)" },
  propRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  propIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  propTitle: { fontSize: 15, fontWeight: "700", color: colors.white },
  propSub: { marginTop: 2, fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.8)" },
  primaryBtn: {
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingVertical: 15,
  },
  primaryText: { fontSize: 16, fontWeight: "700", color: colors.primaryDeep },
  secondaryBtn: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    paddingVertical: 14,
  },
  secondaryText: { fontSize: 15, fontWeight: "600", color: colors.white },
  footnote: { textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.65)" },
  legalNote: { textAlign: "center", fontSize: 11, lineHeight: 15, color: "rgba(255,255,255,0.45)" },
});
