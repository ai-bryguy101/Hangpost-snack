import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  FileText,
  HeartHandshake,
  Lock,
  MapPin,
  Pencil,
  ShieldCheck,
} from "lucide-react-native";

import { useStore, type NotifPrefs } from "../lib/store";
import { useRouter } from "../lib/router";
import { showAlert } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";
import { Button } from "../components/ui/Button";

const NOTIF_ROWS: { key: keyof NotifPrefs; label: string; sub: string }[] = [
  { key: "reminders", label: "Hangout reminders", sub: "A nudge before plans you joined" },
  { key: "requests", label: "Connection requests", sub: "When someone wants to connect" },
  { key: "digest", label: "Weekly digest", sub: "This week near you, once a week" },
  { key: "nearby", label: "Nearby activity", sub: "A new hangout that fits you posts nearby" },
];

/** Settings: the boring screen a finished app can't ship without — account
 * links, notification preferences (honoring the staged ask), the legal pack,
 * and account deletion (App Store requires it in-app). */
export function SettingsScreen({ onSignOut }: { onSignOut: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { me, notifPrefs, enablePush, toggleNotifPref } = useStore();

  function confirmDelete() {
    showAlert(
      "Delete your account?",
      "Your profile, posts, RSVPs, messages and connections are erased for good. There's no undo. (In this prototype it just signs you out.)",
      [
        { text: "Keep my account", style: "cancel" },
        {
          text: "Delete forever",
          style: "destructive",
          onPress: () => {
            showToast("Account deleted — take care 👋");
            onSignOut();
          },
        },
      ],
    );
  }

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        {/* Account */}
        <View style={[sh.card, sh.cardShadow, { gap: 2 }]}>
          <Text style={[sh.sectionLabel, { marginBottom: 6 }]}>Account</Text>
          <LinkRow
            Icon={Pencil}
            label="Edit profile"
            sub={`@${me.handle}`}
            onPress={() => router.push("/profile-edit")}
          />
          <LinkRow
            Icon={MapPin}
            label="Home base & radius"
            sub={`${me.homeLabel} · ${me.radiusMi} mi`}
            onPress={() => router.push("/set-location")}
          />
          <LinkRow
            Icon={ShieldCheck}
            label="Safety center"
            sub="Verification, plan sharing, blocked people"
            onPress={() => router.push("/safety")}
          />
        </View>

        {/* Notifications */}
        <View style={[sh.card, sh.cardShadow, { gap: 10 }]}>
          <View style={sh.row}>
            <Bell size={17} color={colors.primaryDark} />
            <Text style={sh.sectionLabel}>Notifications</Text>
          </View>
          {!notifPrefs.push ? (
            <View style={{ gap: 10 }}>
              <Text style={sh.hint}>
                Notifications are off. Hangpost only ever pings you about plans you joined and
                people who reached out — no streaks, no engagement bait.
              </Text>
              <Button
                onPress={() => {
                  enablePush();
                  showToast("You're set — reminders on 🔔");
                }}
                style={{ borderRadius: 999 }}
              >
                Turn on notifications
              </Button>
            </View>
          ) : (
            NOTIF_ROWS.map((row) => (
              <Pressable key={row.key} onPress={() => toggleNotifPref(row.key)} style={sh.row}>
                <View style={{ flex: 1 }}>
                  <Text style={sh.personName}>{row.label}</Text>
                  <Text style={sh.personMeta}>{row.sub}</Text>
                </View>
                <View
                  style={[
                    styles.track,
                    { backgroundColor: notifPrefs[row.key] ? colors.primary : colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.thumb,
                      { alignSelf: notifPrefs[row.key] ? "flex-end" : "flex-start" },
                    ]}
                  />
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Legal */}
        <View style={[sh.card, sh.cardShadow, { gap: 2 }]}>
          <Text style={[sh.sectionLabel, { marginBottom: 6 }]}>Legal</Text>
          <LinkRow
            Icon={FileText}
            label="Terms of Service"
            sub="The deal, in plain language"
            onPress={() => router.push({ pathname: "/legal", params: { tab: "terms" } })}
          />
          <LinkRow
            Icon={Lock}
            label="Privacy Policy"
            sub="What we collect — and what we never do"
            onPress={() => router.push({ pathname: "/legal", params: { tab: "privacy" } })}
          />
          <LinkRow
            Icon={HeartHandshake}
            label="Community Guidelines"
            sub="How Hangpost stays worth showing up for"
            onPress={() => router.push({ pathname: "/legal", params: { tab: "guidelines" } })}
          />
        </View>

        {/* Account actions */}
        <Pressable onPress={onSignOut} style={[sh.card, sh.cardShadow, { alignItems: "center" }]}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted }}>Sign out</Text>
        </Pressable>
        <Pressable onPress={confirmDelete} style={[sh.card, sh.cardShadow, { alignItems: "center", backgroundColor: colors.redBg }]}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.red }}>Delete account</Text>
        </Pressable>

        <Text style={styles.version}>Hangpost prototype 0.1.0 · the world resets on reload</Text>
      </ScrollView>
    </View>
  );
}

function LinkRow({
  Icon,
  label,
  sub,
  onPress,
}: {
  Icon: typeof Pencil;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[sh.row, { paddingVertical: 8 }]}>
      <Icon size={17} color={colors.primaryDark} />
      <View style={{ flex: 1 }}>
        <Text style={sh.personName}>{label}</Text>
        <Text style={sh.personMeta}>{sub}</Text>
      </View>
      <ChevronRight size={16} color={colors.placeholder} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { height: 24, width: 44, borderRadius: 999, padding: 2 },
  thumb: { height: 20, width: 20, borderRadius: 999, backgroundColor: colors.surface },
  version: { textAlign: "center", fontSize: 12, color: colors.placeholder, marginTop: 4 },
});
