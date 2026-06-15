import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";

import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "../components/ui/Button";

/** Required SMS verification — one verified number = one account (the
 * anti-bot / anti-ban-evasion gate). UI-only here: any 6 digits work. */
export function PhoneVerifyScreen({ onVerified, onBack }: { onVerified: () => void; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={onBack} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>Verify your number</Text>
      </View>

      <View style={[sh.center, { gap: 20 }]}>
        <View style={styles.shieldWrap}>
          <ShieldCheck size={30} color={colors.primaryDark} />
        </View>
        <Text style={styles.title}>{sent ? `Code sent to ${phone}` : "Real people only"}</Text>
        <Text style={sh.centerSub}>
          {sent
            ? "Enter the 6-digit code we texted you."
            : "One verified phone number per person — it keeps bots and bad actors out of your city."}
        </Text>

        {!sent ? (
          <>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 555-0134"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              style={[sh.input, styles.bigInput]}
            />
            <Button onPress={() => setSent(true)} disabled={phone.trim().length < 7} style={{ alignSelf: "stretch" }}>
              Text me a code
            </Button>
          </>
        ) : (
          <>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="••••••"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              style={[sh.input, styles.bigInput, styles.codeInput]}
            />
            <Button onPress={onVerified} disabled={code.trim().length !== 6} style={{ alignSelf: "stretch" }}>
              Verify &amp; continue
            </Button>
            <Pressable onPress={() => setSent(false)}>
              <Text style={styles.resend}>Wrong number? Go back</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shieldWrap: {
    height: 64,
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.foreground },
  bigInput: { alignSelf: "stretch", paddingVertical: 14, fontSize: 16 },
  codeInput: { textAlign: "center", letterSpacing: 10, fontSize: 22, fontWeight: "700" },
  resend: { fontSize: 13, fontWeight: "600", color: colors.primaryDark },
});
