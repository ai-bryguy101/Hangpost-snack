import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { colors } from "../theme/colors";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** A compact inline calendar (no native wheels — Snack-web-safe). Past days
 * are disabled; tapping a day selects it. */
export function CalendarPicker({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (day: Date) => void;
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isSelected = (day: number) =>
    selected !== null &&
    selected.getFullYear() === year &&
    selected.getMonth() === month &&
    selected.getDate() === day;

  return (
    <View style={styles.box}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => setMonthOffset((m) => Math.max(0, m - 1))}
          hitSlop={8}
          disabled={monthOffset === 0}
          style={{ opacity: monthOffset === 0 ? 0.3 : 1 }}
        >
          <ChevronLeft size={18} color={colors.muted} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={() => setMonthOffset((m) => Math.min(2, m + 1))} hitSlop={8}>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {DOW.map((d, i) => (
          <View key={`dow-${i}`} style={styles.cell}>
            <Text style={styles.dowText}>{d}</Text>
          </View>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <View key={`pad-${i}`} style={styles.cell} />;
          const date = new Date(year, month, day);
          const past = date.getTime() < today.getTime();
          const on = isSelected(day);
          return (
            <View key={`d-${day}`} style={styles.cell}>
              <Pressable
                onPress={() => !past && onSelect(date)}
                disabled={past}
                style={[styles.day, on && styles.dayOn, past && { opacity: 0.3 }]}
              >
                <Text style={[styles.dayText, on && { color: colors.white, fontWeight: "700" }]}>
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  monthLabel: { fontSize: 14, fontWeight: "700", color: colors.foreground },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", alignItems: "center", paddingVertical: 2 },
  dowText: { fontSize: 11, fontWeight: "700", color: colors.placeholder },
  day: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  dayOn: { backgroundColor: colors.primaryDark },
  dayText: { fontSize: 13, color: colors.foreground },
});
