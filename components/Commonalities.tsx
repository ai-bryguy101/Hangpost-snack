import { StyleSheet, Text, View } from "react-native";

import { useStore, type Person } from "../lib/store";
import { colors } from "../theme/colors";
import { Avatar } from "./ui/Avatar";

/** "In common" — the anti-score. Shared background renders FIRST (solid chips,
 * matching the tier order), then activity overlaps (tinted). Shared contacts
 * lead the whole block because a mutual person is the strongest signal. */
export function Commonalities({ person, compact = false }: { person: Person; compact?: boolean }) {
  const { me, personOf } = useStore();

  const background: string[] = [];
  if (person.hometown && me.hometown === person.hometown)
    background.push(`Both from ${person.hometown.split(",")[0]}`);
  if (person.college && me.college === person.college) background.push(person.college);
  if (person.major && me.major && person.major.toLowerCase() === me.major.toLowerCase())
    background.push(`Both studied ${person.major}`);
  const employer = (job: string | null) =>
    job && job.includes(" at ") ? job.split(" at ").pop()!.trim().toLowerCase() : null;
  if (employer(person.job) && employer(person.job) === employer(me.job))
    background.push(`Both at ${person.job!.split(" at ").pop()!.trim()}`);

  const overlap = (mine: string[], theirs: string[]) =>
    theirs.filter((x) => mine.map((m) => m.toLowerCase()).includes(x.toLowerCase()));
  const shared = [
    ...overlap(me.hobbies, person.hobbies),
    ...overlap(me.interests, person.interests),
    ...overlap(me.likes, person.likes),
  ].slice(0, compact ? 3 : 6);

  const mutuals = person.sharedContacts.map(personOf);
  if (background.length === 0 && shared.length === 0 && mutuals.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      {mutuals.length > 0 && (
        <View style={styles.mutualRow}>
          <View style={{ flexDirection: "row" }}>
            {mutuals.map((m, i) => (
              <View key={m.id} style={i > 0 ? { marginLeft: -6 } : undefined}>
                <Avatar name={m.name} src={m.avatar} size="xs" />
              </View>
            ))}
          </View>
          <Text style={styles.mutualText}>
            You both know {mutuals.map((m) => m.name.split(" ")[0]).join(" & ")}
          </Text>
        </View>
      )}
      {(background.length > 0 || shared.length > 0) && (
        <View>
          {!compact && <Text style={styles.label}>In common</Text>}
          <View style={styles.wrap}>
            {background.map((b) => (
              <View key={b} style={[styles.chip, styles.chipSolid]}>
                <Text style={[styles.chipText, { color: colors.white }]}>{b}</Text>
              </View>
            ))}
            {shared.map((s) => (
              <View key={s} style={[styles.chip, styles.chipTinted]}>
                <Text style={[styles.chipText, { color: colors.primaryDark }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mutualRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mutualText: { fontSize: 12, fontWeight: "600", color: colors.primaryDark },
  label: { marginBottom: 6, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4, color: colors.muted },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipSolid: { backgroundColor: colors.primaryDark },
  chipTinted: { backgroundColor: colors.primaryLight },
  chipText: { fontSize: 12, fontWeight: "600" },
});
