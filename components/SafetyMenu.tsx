import { Pressable } from "react-native";
import { MoreHorizontal } from "lucide-react-native";

import { useStore } from "../lib/store";
import { showAlert, type DialogButton } from "../lib/dialog";
import { showToast } from "../lib/toast";
import { colors } from "../theme/colors";

/** The "···" menu: report a post/person, block, or remove a connection.
 * Safety is a first-class action on every card, not a settings page. */
export function SafetyMenu({
  targetId,
  targetName,
  isConnection = false,
  onAfter,
}: {
  targetId: string;
  targetName: string;
  isConnection?: boolean;
  onAfter?: () => void;
}) {
  const { block, removeEdge } = useStore();

  function confirmReport() {
    showAlert("Report", "Why are you reporting this?", [
      { text: "About a person or group", onPress: () => showToast("Reported — people-posts come down fast") },
      { text: "Spam", onPress: () => showToast("Reported — our team will review") },
      { text: "Harassment", onPress: () => showToast("Reported — our team will review") },
      { text: "Inappropriate", onPress: () => showToast("Reported — our team will review") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function confirmBlock() {
    showAlert("Block", `Block ${targetName}? You won't see each other on Hangpost.`, [
      {
        text: "Block",
        style: "destructive",
        onPress: () => {
          block(targetId);
          onAfter?.();
          showToast(`Blocked ${targetName}`);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function confirmRemove() {
    showAlert("Remove connection?", `Remove ${targetName} from your connections?`, [
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeEdge(targetId);
          onAfter?.();
          showToast("Connection removed");
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function openMenu() {
    const buttons: DialogButton[] = [{ text: "Report", onPress: confirmReport }];
    if (isConnection) buttons.push({ text: "Remove connection", onPress: confirmRemove });
    buttons.push({ text: "Block", style: "destructive", onPress: confirmBlock });
    buttons.push({ text: "Cancel", style: "cancel" });
    showAlert("Options", undefined, buttons);
  }

  return (
    <Pressable onPress={openMenu} hitSlop={8} accessibilityLabel="More options">
      <MoreHorizontal size={18} color={colors.placeholder} />
    </Pressable>
  );
}
