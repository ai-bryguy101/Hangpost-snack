import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Check, MapPin, Search } from "lucide-react-native";

import { searchPlaces, type Place } from "../lib/places";
import { colors } from "../theme/colors";

/** Searchable home-base picker — port of apps/native/components/PlacePicker.tsx. */
export function PlacePicker({
  selected,
  onSelect,
}: {
  selected: Place;
  onSelect: (place: Place) => void;
}) {
  const [q, setQ] = useState("");
  const results = searchPlaces(q, q.trim() ? 20 : 8);

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.searchBox}>
        <Search size={15} color={colors.placeholder} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search a city or neighborhood"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="words"
          style={styles.searchInput}
        />
      </View>

      {results.length === 0 ? (
        <Text style={styles.noMatch}>No cities found — try a major city name.</Text>
      ) : (
        results.map((place) => {
          const active = place.label === selected.label;
          return (
            <Pressable
              key={place.label}
              onPress={() => onSelect(place)}
              style={[styles.row, active ? styles.rowActive : styles.rowIdle]}
            >
              <View style={styles.rowLeft}>
                <MapPin size={15} color={active ? colors.primaryDark : colors.muted} />
                <Text
                  style={[
                    styles.rowLabel,
                    active && { fontWeight: "600", color: colors.primaryDark },
                  ]}
                >
                  {place.label}
                </Text>
              </View>
              {active && <Check size={16} color={colors.primaryDark} />}
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 0 },
  noMatch: { paddingHorizontal: 4, paddingVertical: 8, fontSize: 12, color: colors.muted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowIdle: { borderColor: colors.border, backgroundColor: colors.surface },
  rowActive: { borderColor: colors.primaryDark, backgroundColor: colors.primaryLight },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowLabel: { fontSize: 14, color: colors.foreground },
});
