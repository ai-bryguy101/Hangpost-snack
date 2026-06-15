import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, MessageCircle, UserPlus } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";

import type { RecommendationResult } from "../lib/types";
import { colors, radiusCard } from "../theme/colors";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { SafetyMenu } from "./SafetyMenu";

/** Port of apps/native/components/ConnectionCard.tsx — no numeric score,
 * ever: the card earns the tap with REASONS, background first. */

function whyChips(r: RecommendationResult): string[] {
  const b = r.breakdown;
  const chips: string[] = [];
  if (b.mutual_friends > 0)
    chips.push(`${b.mutual_friends} mutual connection${b.mutual_friends > 1 ? "s" : ""}`);
  if (b.hometown_match > 0)
    chips.push(r.hometown ? `Both from ${r.hometown.split(",")[0]}` : "Same hometown");
  if (b.college_match > 0) chips.push(r.college ?? "Same college");
  // major/job chips key off the engine's breakdown (same parse as the
  // score — scoring.majors_match / jobs_match), not a client-side compare.
  if (b.major_match > 0 && r.major) chips.push(`Both studied ${r.major}`);
  if (b.job_match > 0 && r.job) {
    const employer = r.job.includes(" at ") ? r.job.split(" at ").pop()?.trim() : undefined;
    chips.push(employer ? `Both at ${employer}` : `Both work as ${r.job}`);
  }
  if (b.interest_overlap > 0.3) chips.push("Shared interests");
  if (b.liked_topic_overlap > 0.3) chips.push("Shared tastes");
  if (b.age_compatibility > 0.7) chips.push("Close in age");
  return chips.slice(0, 4);
}

function tierBlurb(r: RecommendationResult): string {
  const b = r.breakdown;
  const name = r.display_name.split(" ")[0];
  if (b.has_mutual_friends && b.has_both_shared_background)
    return `You and ${name} share mutual connections, the same hometown, and the same college — well worth exploring.`;
  if (b.has_mutual_friends && b.has_shared_background)
    return `You share mutual connections and common background with ${name}.`;
  if (b.has_mutual_friends)
    return `You and ${name} have connections in common — the most reliable path to a real friendship.`;
  if (b.has_both_shared_background)
    return `You and ${name} are from the same hometown and went to the same college.`;
  if (b.has_shared_background)
    return `You and ${name} share background — hometown, school, studies, or work.`;
  return `You and ${name} are into a lot of the same things.`;
}

interface ConnectionCardProps {
  result: RecommendationResult;
  onConnect: (result: RecommendationResult) => void;
  onMessage: (result: RecommendationResult) => void;
}

export function ConnectionCard({ result, onConnect, onMessage }: ConnectionCardProps) {
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();
  const chips = whyChips(result);
  const contextLine = result.job ?? (result.major ? `Studied ${result.major}` : `@${result.handle}`);

  function handleConnect() {
    setConnected(true);
    onConnect(result);
  }

  return (
    <View style={[styles.card, cardShadow]}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={result.display_name} size="lg" />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{result.display_name}</Text>
          <Text style={styles.handle}>{contextLine}</Text>
        </View>
        <SafetyMenu
          targetUserId={result.user_id}
          targetName={result.display_name}
          onBlocked={() => void queryClient.invalidateQueries({ queryKey: ["recommendations"] })}
        />
      </View>

      {/* Why chips — the reasons ARE the ranking story */}
      {chips.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.whyLabel}>In common</Text>
          <View style={styles.chipsRow}>
            {chips.map((chip) => (
              <Chip key={chip} label={chip} variant="tinted" />
            ))}
          </View>
        </View>
      )}

      {/* Tier blurb */}
      <Text style={styles.blurb}>{tierBlurb(result)}</Text>

      {/* CTAs */}
      <View style={styles.ctaRow}>
        <Button
          variant={connected ? "secondary" : "primary"}
          onPress={handleConnect}
          disabled={connected}
          style={{ flex: 1 }}
        >
          <View style={styles.ctaInner}>
            {connected ? (
              <Check size={16} color={colors.primaryDark} />
            ) : (
              <UserPlus size={16} color={colors.white} />
            )}
            <Text
              style={{
                fontWeight: "600",
                color: connected ? colors.primaryDark : colors.white,
              }}
            >
              {connected ? "Request sent" : "Connect"}
            </Text>
          </View>
        </Button>
        <Button variant="outlined" onPress={() => onMessage(result)} style={{ flex: 1 }}>
          <View style={styles.ctaInner}>
            <MessageCircle size={16} color={colors.muted} />
            <Text style={{ fontWeight: "600", color: colors.foreground }}>Message</Text>
          </View>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radiusCard, backgroundColor: colors.surface, padding: 16 },
  header: { marginBottom: 12, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  name: { fontWeight: "600", color: colors.foreground },
  handle: { marginTop: 2, fontSize: 12, color: colors.muted },
  whyLabel: { marginBottom: 6, fontSize: 12, fontWeight: "500", color: colors.muted },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  blurb: { marginBottom: 16, fontSize: 12, lineHeight: 20, color: colors.muted },
  ctaRow: { flexDirection: "row", gap: 8 },
  ctaInner: { flexDirection: "row", alignItems: "center", gap: 8 },
});

const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
