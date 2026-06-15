import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { useRouter, useLocalSearchParams } from "../lib/router";
import { colors } from "../theme/colors";
import { sh } from "../theme/shared";

type Tab = "terms" | "privacy" | "guidelines";

interface Section {
  h: string;
  body: string;
}

/** Plain-language stand-ins for the real counsel-reviewed documents (the
 * drafts live in the Business repo's legal pack). The tone is the product:
 * honest, human, no dark patterns. */
const TERMS: Section[] = [
  { h: "Who can use Hangpost", body: "You must be 18 or older — no exceptions — and you get one account, as yourself. Pretending to be someone else gets the account removed." },
  { h: "The deal", body: "We host the board; you own what you post. You give us permission to show your posts and profile to nearby people — that's the entire point of the app — and nothing else." },
  { h: "Hangouts are yours", body: "Hangpost doesn't organize, host, vet, or supervise meetups. People you meet are strangers until they aren't: meet in groups, in public places, and use your judgment. You attend at your own risk." },
  { h: "Conduct", body: "No harassment, hate, spam, scams, or selling things. Tips should help your neighbors; hangouts should be real plans. Break the rules and we remove content, then accounts." },
  { h: "Leaving", body: "Delete your account any time in Settings — it's a real deletion, not a hide. We can suspend accounts that put others at risk, and we'll always say why." },
  { h: "Changes", body: "If these terms change in a way that matters, we'll tell you in the app before it takes effect." },
];

const PRIVACY: Section[] = [
  { h: "What we collect", body: "The profile fields you fill in, your home base (one point + a radius you choose), and what you do in the app — posts, RSVPs, connections — so your picks get better." },
  { h: "What we never do", body: "We never sell your data, never sell your location, and never run tracking-based ads. Our business doesn't depend on your attention — it depends on you actually meeting people." },
  { h: "Location, honestly", body: "There is no live GPS tracking. Your home base is a point you set by hand; distance is only used to decide what's nearby and never affects how people are ranked." },
  { h: "How picks work", body: "Daily picks are ranked on real commonalities — mutual contacts, hometown, school, work, interests. Every pick shows you why. There's no hidden compatibility score." },
  { h: "Who sees what", body: "People nearby see what you post and the profile you chose to share. Vendors that run our infrastructure (hosting, auth, storage) process data only to run the service." },
  { h: "Your controls", body: "Edit or delete anything of yours, export your data, or delete the whole account in Settings. Blocking hides you from each other everywhere, instantly." },
  { h: "Questions", body: "privacy@hangpost.app — a human reads it." },
];

const GUIDELINES: Section[] = [
  { h: "Show up", body: "RSVPs are promises with seats attached. Can't make it? Withdraw — it frees your spot and keeps the board trustworthy." },
  { h: "Groups, in public", body: "That's the Hangpost way. First meets happen in groups at public places. Anyone pushing to go 1:1 and private, fast, is a report-worthy red flag." },
  { h: "Welcome the new person", body: "Everyone here was new once. The 'New in town' badge means someone chose to be findable — say hi at the table." },
  { h: "Be the real you", body: "Verified photo, real first name, honest profile. Catfishing isn't a prank here; it's a ban." },
  { h: "Keep tips useful", body: "City Guide is for things that help neighbors — the good happy hour, the bus to avoid. Not ads, not rants." },
  { h: "Places, never people", body: "The board talks about things: the broken escalator, the pop-up market, the café worth the line. It is never about a person or a group of people — no naming, photographing, or describing identifiable neighbors, staff, or 'the people who hang out at X.' Review the café, not the barista. People-posts come down on sight; repeats lose the board; targeting someone is harassment and handled as such." },
  { h: "Zero tolerance", body: "Harassment, hate, or creepy behavior toward anyone gets fast action. Report anything that feels off — reports go to humans, and blocking works instantly both ways." },
];

const TABS: { key: Tab; label: string; sections: Section[] }[] = [
  { key: "terms", label: "Terms", sections: TERMS },
  { key: "privacy", label: "Privacy", sections: PRIVACY },
  { key: "guidelines", label: "Guidelines", sections: GUIDELINES },
];

export function LegalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [active, setActive] = useState<Tab>((tab as Tab) ?? "terms");

  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <View style={[sh.root, { paddingTop: insets.top }]}>
      <View style={sh.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={sh.headerTitle}>The fine print</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setActive(t.key)}
            style={[styles.tab, active === t.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, active === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <Text style={sh.hint}>
          Plain-language summary — the counsel-reviewed versions ship with the real app. Updated
          June 2026.
        </Text>
        {current.sections.map((s) => (
          <View key={s.h} style={[sh.card, sh.cardShadow, { gap: 4 }]}>
            <Text style={styles.h}>{s.h}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.background,
  },
  tabActive: { backgroundColor: colors.primaryDark },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.muted },
  tabTextActive: { color: colors.white },
  h: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  body: { fontSize: 13, lineHeight: 19, color: colors.muted },
});
