import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertCircle, ArrowLeft } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { colors } from "../theme/colors";
import { Button } from "../components/ui/Button";

/** Port of apps/native/app/sign-in.tsx. Clerk can't run in Snack, so the mock
 * accepts any email/password ("Sign in" = the returning demo account;
 * "Create account" walks the email-code → onboarding path like live). */

type Mode = "sign-in" | "sign-up";

export function SignInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeSignIn } = useAuth();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    setTimeout(() => {
      completeSignIn("existing");
      setBusy(false);
      router.back();
    }, 500);
  }

  async function handleSignUp() {
    setBusy(true);
    setError(null);
    setTimeout(() => {
      setPendingVerification(true);
      setBusy(false);
    }, 500);
  }

  async function handleVerify() {
    setBusy(true);
    setError(null);
    setTimeout(() => {
      completeSignIn("new");
      setBusy(false);
      // New account → straight into profile + home-base setup.
      router.replace("/onboarding");
    }, 500);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {pendingVerification ? "Verify your email" : mode === "sign-in" ? "Sign in" : "Create account"}
        </Text>
      </View>

      <View style={styles.form}>
        {pendingVerification ? (
          <>
            <Text style={styles.helper}>
              We emailed a 6-digit code to {email}. Enter it below.
            </Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              style={styles.input}
            />
            <Button onPress={handleVerify} loading={busy} disabled={code.trim().length === 0}>
              Verify &amp; continue
            </Button>
          </>
        ) : (
          <>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={styles.input}
            />
            <Button
              onPress={mode === "sign-in" ? handleSignIn : handleSignUp}
              loading={busy}
              disabled={email.trim().length === 0 || password.length === 0}
            >
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </Button>

            <Pressable
              onPress={() => {
                setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"));
                setError(null);
              }}
            >
              <Text style={styles.switchText}>
                {mode === "sign-in" ? (
                  <>
                    New to Hangpost?{" "}
                    <Text style={styles.switchLink}>Create an account</Text>
                  </>
                ) : (
                  <>
                    Already have an account? <Text style={styles.switchLink}>Sign in</Text>
                  </>
                )}
              </Text>
            </Pressable>

            <Text style={styles.demoNote}>
              Snack mirror: any email + password works. “Sign in” loads a returning demo account;
              “Create an account” walks the real new-user path (live uses Clerk).
            </Text>
          </>
        )}

        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={colors.redIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
  form: { flex: 1, justifyContent: "center", gap: 16, paddingHorizontal: 24 },
  helper: { fontSize: 14, color: colors.muted },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
  },
  switchText: { textAlign: "center", fontSize: 14, color: colors.muted },
  switchLink: { fontWeight: "600", color: colors.primaryDark },
  demoNote: { textAlign: "center", fontSize: 11, lineHeight: 16, color: colors.placeholder },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.redBg,
    padding: 12,
  },
  errorText: { flex: 1, fontSize: 14, color: colors.redText },
});
