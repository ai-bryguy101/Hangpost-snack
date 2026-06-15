import { Pressable } from "react-native";
import { MoreHorizontal } from "lucide-react-native";

import { useAuth } from "../lib/auth";
import { showAlert, type DialogButton } from "../lib/dialog";
import { blockUser, fileReport } from "../lib/mockApi";
import { colors } from "../theme/colors";

/** Reusable "···" safety menu — port of apps/native/components/SafetyMenu.tsx
 * (RN Alert swapped for the web-safe dialog). */
interface SafetyMenuProps {
  targetUserId?: string;
  targetPostId?: string;
  targetName?: string;
  onBlocked?: () => void;
}

export function SafetyMenu({ targetUserId, targetPostId, targetName, onBlocked }: SafetyMenuProps) {
  const { getToken } = useAuth();
  const who = targetName ?? "this person";

  async function report(reason: string) {
    const token = await getToken();
    if (!token) return;
    try {
      await fileReport(
        { target_user_id: targetUserId, target_post_id: targetPostId, reason },
        token,
      );
      showAlert("Reported", "Thanks — our team will review this.");
    } catch {
      showAlert("Couldn't submit", "Please try again in a moment.");
    }
  }

  function confirmReport() {
    showAlert("Report", "Why are you reporting this?", [
      { text: "Spam", onPress: () => void report("spam") },
      { text: "Harassment", onPress: () => void report("harassment") },
      { text: "Inappropriate", onPress: () => void report("inappropriate") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function block() {
    if (!targetUserId) return;
    const token = await getToken();
    if (!token) return;
    try {
      await blockUser(targetUserId, token);
      onBlocked?.();
      showAlert("Blocked", `You won't see ${who} anymore.`);
    } catch {
      showAlert("Couldn't block", "Please try again in a moment.");
    }
  }

  function confirmBlock() {
    showAlert("Block", `Block ${who}? You won't see each other on Hangpost.`, [
      { text: "Block", style: "destructive", onPress: () => void block() },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function openMenu() {
    const buttons: DialogButton[] = [{ text: "Report", onPress: confirmReport }];
    if (targetUserId) {
      buttons.push({ text: "Block", style: "destructive", onPress: confirmBlock });
    }
    buttons.push({ text: "Cancel", style: "cancel" });
    showAlert("Options", undefined, buttons);
  }

  return (
    <Pressable onPress={openMenu} hitSlop={8} accessibilityLabel="More options">
      <MoreHorizontal size={18} color={colors.placeholder} />
    </Pressable>
  );
}
