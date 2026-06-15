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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { useRouter } from "../lib/router";
import { createCommunity } from "../lib/mockApi";
import { colors } from "../theme/colors";
import { Button } from "../components/ui/Button";

/** Port of apps/native/app/community-new.tsx. */
export function CommunityNewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      return createCommunity({ name: name.trim(), description: description.trim() || null }, token);
    },
    onSuccess: (community) => {
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
      router.replace({
        pathname: "/community/[communityId]",
        params: { communityId: community.id, name: community.name },
      });
    },
    onError: (err: unknown) =>
      setError(err instanceof Error ? err.message : "Something went wrong."),
  });

  const canSubmit = name.trim().length >= 2 && !mutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>New community</Text>
        <Button
          size="sm"
          onPress={() => mutation.mutate()}
          disabled={!canSubmit}
          loading={mutation.isPending}
          style={{ borderRadius: 999 }}
        >
          Create
        </Button>
      </View>

      <View style={{ gap: 16, padding: 16 }}>
        <View>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (error) setError(null);
            }}
            maxLength={80}
            placeholder="e.g. DC Boulderers"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </View>
        <View>
          <Text style={styles.fieldLabel}>Description (optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            maxLength={500}
            multiline
            placeholder="What's this community about?"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { minHeight: 80 }]}
            textAlignVertical="top"
          />
        </View>
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
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.muted,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
  },
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
