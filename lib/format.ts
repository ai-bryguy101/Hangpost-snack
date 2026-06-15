/** Display formatters — verbatim from packages/api-client/src/format.ts. */

const METERS_PER_MILE = 1609.344;

export function metersToMiles(meters: number | null): string | null {
  if (meters === null) return null;
  const miles = meters / METERS_PER_MILE;
  if (miles < 0.1) return "nearby";
  return `${miles.toFixed(1)} mi`;
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function hangoutTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date
    .toLocaleTimeString("en-US", { hour: "numeric", minute: undefined })
    .replace(":00", "");

  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return `Today ${time}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow ${time}`;

  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${day} ${time}`;
}
