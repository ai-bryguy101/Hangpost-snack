import type { StatusKind } from "../lib/store";

/** The vocabulary + voice behind one-tap "statuses" — the lowest-friction way
 * to tell your connections you're around (canonical brief:
 * Hangpost-Full-Stack/docs/briefs/STATUS_POSTS.md). The whole point is no blank
 * box and no fear: tap a preset, it's live, it disappears on its own, and
 * declining is invisible. The copy carries the brand voice (warm, funny,
 * self-aware) — a status is a *vibe*, never "I'm lonely, please hang out." */

export interface StatusKindDef {
  key: StatusKind;
  label: string;
  emoji: string;
  /** Brand-voice presets — the plain default first, then the funnier ones. */
  presets: string[];
}

export const STATUS_KINDS: StatusKindDef[] = [
  {
    key: "going_out",
    label: "Going out",
    emoji: "🍻",
    presets: [
      "Free tonight, down for a drink 🍻",
      "Free tonight and powerless to say no",
      "Someone get me out of the house tonight",
      "Patio weather — who's out?",
    ],
  },
  {
    key: "active",
    label: "Get active",
    emoji: "🏃",
    presets: [
      "Free this weekend, want to get active 🏃",
      "Need to move my body, someone make me",
      "Going for a climb — come suffer with me 🧗",
      "Touching grass this weekend, join me 🌲",
    ],
  },
  {
    key: "cowork",
    label: "Cowork",
    emoji: "☕",
    presets: [
      "WFH at a café, come cowork ☕",
      "Working from a coffee shop, pull up",
      "Need to body-double to get anything done today",
    ],
  },
  {
    key: "food",
    label: "Food",
    emoji: "🍜",
    presets: [
      "Hungry and indecisive — dinner? 🍜",
      "Trying a new spot tonight, room for one more",
      "Brunch this weekend? I'll get the table",
    ],
  },
  {
    key: "open",
    label: "Down for whatever",
    emoji: "🎲",
    presets: [
      "Down for whatever 🤷",
      "No plans, open to chaos",
      "New here — show me something good 👋",
      "Bored, entertain me (respectfully)",
    ],
  },
];

export const STATUS_KIND_MAP: Record<StatusKind, StatusKindDef> = Object.fromEntries(
  STATUS_KINDS.map((k) => [k.key, k]),
) as Record<StatusKind, StatusKindDef>;

/** Rotating placeholders for the optional custom box — the voice sells it. */
export const STATUS_PLACEHOLDERS = [
  "Free tonight and powerless to say no…",
  "WFH and going feral, someone get me outside…",
  "No plans this weekend, want to do something…",
  "Down for whatever — say the word…",
];

/** One-tap reactions a connection can drop on your status. */
export const STATUS_REACTIONS = ["👋", "🙌", "🍻", "🔥", "😂"];

/** Guess a kind from custom text so the emoji fits — keeps the box one-step. */
export function inferKind(text: string): StatusKind {
  const s = text.toLowerCase();
  if (/\b(drink|bar|beer|wine|happy hour|out|party|club|dance)\b/.test(s)) return "going_out";
  if (/\b(run|gym|climb|hike|walk|bike|lift|active|workout|yoga|soccer|ball)\b/.test(s))
    return "active";
  if (/\b(wfh|cowork|co-work|work|café|cafe|coffee shop|study|laptop)\b/.test(s)) return "cowork";
  if (/\b(dinner|lunch|brunch|food|eat|hungry|coffee|ramen|tacos|pizza)\b/.test(s)) return "food";
  return "open";
}

/** Smart expiry — the user never sets a time (brief §2). "weekend" words push
 * it to Sunday night; everything else is "tonight" (~4am, the way Stories do). */
export function computeExpiry(text: string): { expiresAt: string; label: string } {
  const now = new Date();
  if (/\b(weekend|saturday|sunday|sat|sun)\b/i.test(text)) {
    const d = new Date(now);
    const daysToSun = (7 - d.getDay()) % 7;
    d.setDate(d.getDate() + daysToSun);
    d.setHours(23, 59, 0, 0);
    return { expiresAt: d.toISOString(), label: "this weekend" };
  }
  if (/\btomorrow\b/i.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    return { expiresAt: d.toISOString(), label: "tomorrow" };
  }
  const d = new Date(now);
  d.setDate(d.getDate() + (now.getHours() < 4 ? 0 : 1));
  d.setHours(4, 0, 0, 0);
  return { expiresAt: d.toISOString(), label: "tonight" };
}

/** "free tonight" / "free this weekend" — the short availability phrase. */
export function freePhrase(label: string): string {
  return label === "this weekend"
    ? "free this weekend"
    : label === "tomorrow"
      ? "free tomorrow"
      : "free tonight";
}

/** "Disappears tonight" — reassures it's ephemeral, no permanent record. */
export function expiryPhrase(label: string): string {
  return label === "this weekend"
    ? "Disappears Sunday"
    : label === "tomorrow"
      ? "Disappears tomorrow"
      : "Disappears tonight";
}
