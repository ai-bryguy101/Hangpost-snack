/** In-memory stand-in for @hangpost/api-client + the live Render API.
 *
 * Snack can't reach the real backend (Clerk auth + CORS + workspace dep), so
 * this module re-implements the same exported function names/signatures over
 * mutable local state, mirroring live server SEMANTICS:
 *  - RSVP going/interested counts, capacity-free seeds, group-chat join
 *  - emoji reactions (server allowlist), saves, City Guide ranked by
 *    helpfulness (reactions + saves) then recency
 *  - DMs 403 until a connection is accepted; blocks hide a person everywhere
 *  - profile create 409 when one exists; avatar upload 503 (R2 unconfigured
 *    on live — same alert you'd see in Expo Go today)
 *
 * The post corpus is the actual DC seed from apps/api seed_posts.py.
 */

import type {
  AppNotification,
  AvatarUploadTarget,
  ChatMessage,
  CommunityCreateInput,
  CommunityEventsResponse,
  CommunityListResponse,
  CommunitySummary,
  Connection,
  ConnectionListResponse,
  ContactImportResult,
  CreatePostInput,
  FamiliarFaceListResponse,
  FeedResponse,
  LocationInput,
  LocationResponse,
  MessageListResponse,
  NewcomerListResponse,
  NotificationListResponse,
  OutcomeAction,
  PeopleYouMayKnowResponse,
  Post,
  ProfileInput,
  ProfileRead,
  ProfileUpdateInput,
  ReactionListResponse,
  RecommendationsResponse,
  ReportInput,
  RsvpResponse,
  SaveResponse,
  SuggestionListResponse,
  ThreadListResponse,
  ThreadSummary,
} from "./types";
import { buildSeedState, type MockState, type SeedPost } from "../data/seed";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const DC_FEED = {
  city: "Washington DC",
  latitude: 38.9072,
  longitude: -77.0369,
};

/** Server emoji allowlist (ADR-0017) — must match apps/api. */
const ALLOWED_EMOJIS = ["👍", "❤️", "🎉", "😂", "👀", "🔥"];

const ME = "me";

let db: MockState = buildSeedState("fresh");

/** Snack-only: swap the world for the "returning demo user" persona. */
export function resetToDemoUser(): void {
  db = buildSeedState("demo");
}

/** Snack-only: swap the world for a brand-new account (no profile/home base). */
export function resetToFreshUser(): void {
  db = buildSeedState("fresh");
}

/** Simulated network latency so loading states render like the real API. */
function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 250));
}

function requireAuth(token: string | null | undefined): void {
  if (!token) throw new ApiError(401, "Not authenticated");
}

function cityExperts(): Set<string> {
  // Live rule (ADR-0018): authors whose local_info tips earned >= 3 reactions.
  const totals = new Map<string, number>();
  for (const p of db.posts) {
    if (p.type !== "local_info") continue;
    const n = p.reactions.reduce((acc, r) => acc + r.count, 0);
    totals.set(p.authorId, (totals.get(p.authorId) ?? 0) + n);
  }
  return new Set([...totals.entries()].filter(([, n]) => n >= 3).map(([id]) => id));
}

function toPost(p: SeedPost, experts: Set<string>): Post {
  const author =
    p.authorId === ME && db.myProfile
      ? { display_name: db.myProfile.display_name, handle: db.myProfile.handle, hometown: null }
      : db.people[p.authorId];
  // Who's-going preview: earliest RSVPs first, capped at 3 (mirrors the
  // server's AttendeePreview); the viewer appears once they're going.
  const attendees = p.attendeeIds
    .filter((id) => !db.blocked.has(id))
    .slice(0, 3)
    .map((id) => ({
      user_id: id,
      display_name: db.people[id]?.display_name ?? "Member",
      avatar_url: null,
    }));
  if (p.myRsvp === "going" && attendees.length < 3 && db.myProfile) {
    attendees.push({
      user_id: ME,
      display_name: db.myProfile.display_name,
      avatar_url: null,
    });
  }
  return {
    id: p.id,
    type: p.type,
    visibility: "public_in_area",
    body: p.body,
    distance_m: p.distance_m,
    created_at: p.created_at,
    author: {
      user_id: p.authorId,
      display_name: author?.display_name ?? "Member",
      handle: author?.handle ?? "member",
      avatar_url: null,
      city_expert: experts.has(p.authorId),
    },
    venue: p.venue,
    venue_time: p.venue_time,
    recurrence: p.recurrence,
    rsvp_count: p.rsvp_count,
    interested_count: p.interested_count,
    attendees,
    max_rsvps: p.maxRsvps,
    my_rsvp: p.myRsvp,
    comment_count: p.comment_count,
    hashtags: p.hashtags,
    image_urls: [],
    reactions: p.reactions.map((r) => ({ ...r })),
    saved_count: p.saved_count,
    saved: p.saved,
  };
}

function visiblePosts(): SeedPost[] {
  return db.posts.filter((p) => !db.blocked.has(p.authorId));
}

/** Live behavior: a full capped hangout drops out of the feed lenses so
 * nobody taps "I'm in" on a closed spot (withdrawals re-surface it). */
function notFull(p: SeedPost): boolean {
  return p.type !== "hangout" || p.maxRsvps === null || p.rsvp_count < p.maxRsvps;
}

// ---------------------------------------------------------------- location

export async function getMyLocation(token: string): Promise<LocationResponse | null> {
  await delay();
  requireAuth(token);
  return db.myLocation ? { ...db.myLocation } : null;
}

export async function postUserLocation(
  input: LocationInput,
  token: string,
): Promise<LocationResponse> {
  await delay();
  requireAuth(token);
  db.myLocation = {
    latitude: input.latitude,
    longitude: input.longitude,
    radius_m: input.radius_m ?? 5000,
    label: input.label ?? null,
    accuracy_m: input.accuracy_m ?? null,
    updated_at: new Date().toISOString(),
  };
  return { ...db.myLocation };
}

// -------------------------------------------------------------------- feed

export async function fetchFeed(opts: { bearerToken: string }): Promise<FeedResponse> {
  await delay();
  requireAuth(opts.bearerToken);
  const experts = cityExperts();
  const posts = visiblePosts()
    .filter(notFull)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((p) => toPost(p, experts));
  return { posts, total: posts.length };
}

export async function fetchUpcoming(opts: {
  bearerToken: string;
  days?: number;
}): Promise<FeedResponse> {
  await delay();
  requireAuth(opts.bearerToken);
  const horizon = Date.now() + (opts.days ?? 7) * 24 * 3600 * 1000;
  const experts = cityExperts();
  const posts = visiblePosts()
    .filter(notFull)
    .filter(
      (p) =>
        p.type === "hangout" &&
        p.venue_time !== null &&
        new Date(p.venue_time).getTime() >= Date.now() &&
        new Date(p.venue_time).getTime() <= horizon,
    )
    .sort((a, b) => (a.venue_time ?? "").localeCompare(b.venue_time ?? ""))
    .map((p) => toPost(p, experts));
  return { posts, total: posts.length };
}

export async function fetchTips(opts: {
  bearerToken: string;
  q?: string;
  hashtag?: string;
}): Promise<FeedResponse> {
  await delay();
  requireAuth(opts.bearerToken);
  const q = opts.q?.trim().toLowerCase();
  const tag = opts.hashtag?.trim().toLowerCase();
  const experts = cityExperts();
  const score = (p: SeedPost) =>
    p.reactions.reduce((acc, r) => acc + r.count, 0) + p.saved_count;
  const posts = visiblePosts()
    .filter((p) => p.type === "local_info")
    .filter((p) => (tag ? p.hashtags.includes(tag) : true))
    .filter((p) =>
      q ? p.body.toLowerCase().includes(q) || p.hashtags.some((h) => h.includes(q)) : true,
    )
    .sort((a, b) => score(b) - score(a) || b.created_at.localeCompare(a.created_at))
    .map((p) => toPost(p, experts));
  return { posts, total: posts.length };
}

const HASHTAG_RE = /#([a-z0-9_]+)/gi;

export async function createPost(input: CreatePostInput, token: string): Promise<Post> {
  await delay();
  requireAuth(token);
  const hashtags = [...input.body.matchAll(HASHTAG_RE)].map((m) => m[1].toLowerCase());
  const id = `local-${db.nextId++}`;
  const post: SeedPost = {
    id,
    authorId: ME,
    type: input.type,
    body: input.body,
    distance_m: 0,
    created_at: new Date().toISOString(),
    venue: input.type === "hangout" ? (input.venue ?? null) : null,
    venue_time: input.starts_at ?? null,
    recurrence: input.type === "hangout" ? (input.recurrence ?? null) : null,
    rsvp_count: 0,
    interested_count: 0,
    attendeeIds: [],
    maxRsvps: input.type === "hangout" ? (input.capacity ?? null) : null,
    comment_count: 0,
    hashtags: [...new Set(hashtags)],
    reactions: [],
    saved_count: 0,
    saved: false,
    communityId: input.community_id ?? null,
    myRsvp: null,
  };
  db.posts.unshift(post);
  // Live behavior: creating a hangout also creates its group thread with the
  // author as the first member.
  if (input.type === "hangout") {
    ensureHangoutThread(post, true);
  }
  const experts = cityExperts();
  return toPost(post, experts);
}

// -------------------------------------------------------------------- rsvp

function ensureHangoutThread(post: SeedPost, mine: boolean): string {
  let thread = db.threads.find((t) => t.hangout_post_id === post.id);
  if (!thread) {
    // Members = the author + everyone going (when I'm joining, my RSVP was
    // already counted into rsvp_count by the caller).
    thread = {
      thread_id: `thread-${db.nextId++}`,
      kind: "hangout",
      title: post.venue ?? post.body.slice(0, 40),
      hangout_post_id: post.id,
      member_count: Math.max(1, post.rsvp_count + 1),
      mine,
      lastReadAt: null,
      messages: [],
    };
    db.threads.push(thread);
  } else if (mine && !thread.mine) {
    thread.mine = true;
    thread.member_count += 1;
  }
  return thread.thread_id;
}

export async function rsvpToHangout(
  postId: string,
  token: string,
  status: "going" | "interested" = "going",
): Promise<RsvpResponse> {
  await delay();
  requireAuth(token);
  const post = db.posts.find((p) => p.id === postId);
  if (!post || post.type !== "hangout") throw new ApiError(404, "No hangout for that post.");

  // Capacity gate (going only — "interested" is uncapped), mirroring live.
  if (
    status === "going" &&
    post.myRsvp !== "going" &&
    post.maxRsvps !== null &&
    post.rsvp_count >= post.maxRsvps
  ) {
    throw new ApiError(409, "This hangout is full.");
  }

  if (post.myRsvp !== status) {
    if (post.myRsvp === "going") post.rsvp_count -= 1;
    if (post.myRsvp === "interested") post.interested_count -= 1;
    if (status === "going") post.rsvp_count += 1;
    else post.interested_count += 1;
    post.myRsvp = status;
  }
  // Live behavior: "going" materializes your membership in the hangout's
  // group chat ("interested" deliberately doesn't — ADR-0016).
  if (status === "going") ensureHangoutThread(post, true);
  return {
    post_id: postId,
    rsvp_count: post.rsvp_count,
    interested_count: post.interested_count,
    going: status === "going",
    status,
  };
}

export async function withdrawRsvp(postId: string, token: string): Promise<RsvpResponse> {
  await delay();
  requireAuth(token);
  const post = db.posts.find((p) => p.id === postId);
  if (!post || post.type !== "hangout") throw new ApiError(404, "No hangout for that post.");
  if (post.myRsvp === "going") {
    post.rsvp_count -= 1;
    // Leaving a "going" leaves the group chat (membership derives from RSVPs,
    // ADR-0010) — unless it's your own hangout.
    const thread = db.threads.find((t) => t.hangout_post_id === postId);
    if (thread && thread.mine && post.authorId !== ME) {
      thread.mine = false;
      thread.member_count -= 1;
    }
  }
  if (post.myRsvp === "interested") post.interested_count -= 1;
  post.myRsvp = null;
  return {
    post_id: postId,
    rsvp_count: post.rsvp_count,
    interested_count: post.interested_count,
    going: false,
    status: "none",
  };
}

// --------------------------------------------------------- reactions/saves

export async function addReaction(
  postId: string,
  emoji: string,
  token: string,
): Promise<ReactionListResponse> {
  await delay();
  requireAuth(token);
  if (!ALLOWED_EMOJIS.includes(emoji)) throw new ApiError(400, "Unsupported emoji.");
  const post = db.posts.find((p) => p.id === postId);
  if (!post) throw new ApiError(404, "Post not found.");
  const existing = post.reactions.find((r) => r.emoji === emoji);
  if (existing) {
    if (!existing.reacted) {
      existing.reacted = true;
      existing.count += 1;
    }
  } else {
    post.reactions.push({ emoji, count: 1, reacted: true });
  }
  return { post_id: postId, reactions: post.reactions.map((r) => ({ ...r })) };
}

export async function removeReaction(
  postId: string,
  emoji: string,
  token: string,
): Promise<ReactionListResponse> {
  await delay();
  requireAuth(token);
  const post = db.posts.find((p) => p.id === postId);
  if (!post) throw new ApiError(404, "Post not found.");
  const existing = post.reactions.find((r) => r.emoji === emoji);
  if (existing?.reacted) {
    existing.reacted = false;
    existing.count -= 1;
    if (existing.count <= 0) {
      post.reactions = post.reactions.filter((r) => r !== existing);
    }
  }
  return { post_id: postId, reactions: post.reactions.map((r) => ({ ...r })) };
}

export async function savePost(postId: string, token: string): Promise<SaveResponse> {
  await delay();
  requireAuth(token);
  const post = db.posts.find((p) => p.id === postId);
  if (!post) throw new ApiError(404, "Post not found.");
  if (!post.saved) {
    post.saved = true;
    post.saved_count += 1;
  }
  return { post_id: postId, saved_count: post.saved_count, saved: post.saved };
}

export async function unsavePost(postId: string, token: string): Promise<SaveResponse> {
  await delay();
  requireAuth(token);
  const post = db.posts.find((p) => p.id === postId);
  if (!post) throw new ApiError(404, "Post not found.");
  if (post.saved) {
    post.saved = false;
    post.saved_count -= 1;
  }
  return { post_id: postId, saved_count: post.saved_count, saved: post.saved };
}

// ----------------------------------------------------------------- profile

export async function fetchMyProfile(token: string): Promise<ProfileRead | null> {
  await delay();
  requireAuth(token);
  return db.myProfile ? { ...db.myProfile } : null;
}

export async function createProfile(input: ProfileInput, token: string): Promise<ProfileRead> {
  await delay();
  requireAuth(token);
  if (db.myProfile) throw new ApiError(409, "Profile already exists.");
  db.myProfile = {
    user_id: ME,
    display_name: input.display_name,
    handle: input.handle,
    avatar_url: null,
    age: input.age,
    hometown: input.hometown,
    college: input.college,
    major: input.major,
    job: input.job,
    interests: input.interests,
    liked_topics: input.liked_topics,
    bio_synthesized: null,
    onboarded_at: new Date().toISOString(),
    new_arrival_at: null,
    is_new_arrival: false,
    updated_at: new Date().toISOString(),
  };
  return { ...db.myProfile };
}

export async function updateMyProfile(
  input: ProfileUpdateInput,
  token: string,
): Promise<ProfileRead> {
  await delay();
  requireAuth(token);
  if (!db.myProfile) throw new ApiError(404, "No profile yet.");
  db.myProfile = {
    ...db.myProfile,
    ...(input.display_name !== undefined ? { display_name: input.display_name } : {}),
    ...(input.age !== undefined ? { age: input.age } : {}),
    ...(input.hometown !== undefined ? { hometown: input.hometown } : {}),
    ...(input.college !== undefined ? { college: input.college } : {}),
    ...(input.major !== undefined ? { major: input.major } : {}),
    ...(input.job !== undefined ? { job: input.job } : {}),
    ...(input.interests !== undefined ? { interests: input.interests } : {}),
    ...(input.liked_topics !== undefined ? { liked_topics: input.liked_topics } : {}),
    ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
    updated_at: new Date().toISOString(),
  };
  return { ...db.myProfile };
}

export async function requestAvatarUploadUrl(
  _contentType: string,
  token: string,
): Promise<AvatarUploadTarget> {
  await delay();
  requireAuth(token);
  // Mirrors live today: R2 isn't configured yet, so the API returns 503 and
  // the app shows "Photos not enabled yet" (ADR-0013).
  throw new ApiError(503, "Photo storage not configured.");
}

export async function markNewArrival(token: string): Promise<ProfileRead> {
  await delay();
  requireAuth(token);
  if (!db.myProfile) throw new ApiError(404, "No profile yet.");
  db.myProfile.new_arrival_at = new Date().toISOString();
  db.myProfile.is_new_arrival = true;
  return { ...db.myProfile };
}

export async function clearNewArrival(token: string): Promise<ProfileRead> {
  await delay();
  requireAuth(token);
  if (!db.myProfile) throw new ApiError(404, "No profile yet.");
  db.myProfile.new_arrival_at = null;
  db.myProfile.is_new_arrival = false;
  return { ...db.myProfile };
}

// --------------------------------------------------------- recommendations

export async function fetchRecommendations(opts: {
  bearerToken: string;
  limit?: number;
}): Promise<RecommendationsResponse> {
  await delay();
  requireAuth(opts.bearerToken);
  // Live: no profile yet → nothing to rank against.
  const results = (db.myProfile ? db.recommendations : [])
    .filter((r) => !db.blocked.has(r.user_id))
    .slice(0, opts.limit ?? 10);
  return {
    source_user_id: ME,
    radius_m: db.myLocation?.radius_m ?? 5000,
    model_version: "rules-v1",
    results: results.map((r) => ({ ...r, breakdown: { ...r.breakdown } })),
  };
}

export async function postOutcome(
  _impressionId: string,
  _action: OutcomeAction,
  token: string,
): Promise<void> {
  requireAuth(token);
  // Live: writes a recommendation_outcomes row (the ML loop's labels).
}

// ------------------------------------------------------------------ social

function personOrThrow(userId: string) {
  const person = db.people[userId];
  if (!person) throw new ApiError(404, "User not found.");
  return person;
}

export async function sendFriendRequest(userId: string, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  personOrThrow(userId);
  const edge = db.edges.get(userId);
  if (edge?.state === "accepted") return;
  if (edge && !edge.outgoing && edge.state === "pending") {
    // Live behavior: requesting back auto-accepts the reverse request.
    edge.state = "accepted";
    return;
  }
  db.edges.set(userId, { state: "pending", outgoing: true, created_at: new Date().toISOString() });
}

export async function acceptFriendRequest(userId: string, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  const edge = db.edges.get(userId);
  if (!edge || edge.outgoing || edge.state !== "pending") {
    throw new ApiError(404, "No pending request from that user.");
  }
  edge.state = "accepted";
}

export async function removeFriendship(userId: string, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  db.edges.delete(userId);
}

function edgeConnections(filter: "accepted" | "incoming"): Connection[] {
  const rows: Connection[] = [];
  for (const [userId, edge] of db.edges) {
    if (db.blocked.has(userId)) continue;
    const keep =
      filter === "accepted"
        ? edge.state === "accepted"
        : edge.state === "pending" && !edge.outgoing;
    if (!keep) continue;
    const p = db.people[userId];
    if (!p) continue;
    rows.push({
      user_id: userId,
      display_name: p.display_name,
      handle: p.handle,
      avatar_url: null,
      state: edge.state,
      outgoing: edge.outgoing,
      created_at: edge.created_at,
    });
  }
  return rows;
}

export async function fetchFriends(token: string): Promise<ConnectionListResponse> {
  await delay();
  requireAuth(token);
  return { connections: edgeConnections("accepted") };
}

export async function fetchIncomingRequests(token: string): Promise<ConnectionListResponse> {
  await delay();
  requireAuth(token);
  return { connections: edgeConnections("incoming") };
}

export async function fetchSuggestions(token: string): Promise<SuggestionListResponse> {
  await delay();
  requireAuth(token);
  return {
    suggestions: db.suggestions.filter(
      (s) => !db.edges.has(s.user_id) && !db.dismissed.has(s.user_id) && !db.blocked.has(s.user_id),
    ),
  };
}

export async function dismissSuggestion(userId: string, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  db.dismissed.add(userId);
}

export async function fetchRegulars(token: string): Promise<FamiliarFaceListResponse> {
  await delay();
  requireAuth(token);
  return {
    faces: db.regulars
      .filter((f) => !db.blocked.has(f.user_id))
      .map((f) => ({ ...f, connected: db.edges.get(f.user_id)?.state === "accepted" })),
  };
}

export async function fetchNewcomers(token: string): Promise<NewcomerListResponse> {
  await delay();
  requireAuth(token);
  if (!db.myLocation) return { newcomers: [] };
  return {
    newcomers: db.newcomers.filter(
      (n) => !db.edges.has(n.user_id) && !db.blocked.has(n.user_id),
    ),
  };
}

export async function importContacts(
  hashes: string[],
  token: string,
): Promise<ContactImportResult> {
  await delay();
  requireAuth(token);
  db.contactsImported = true;
  return { imported_count: hashes.length, matched_count: db.pymk.length };
}

export async function fetchPeopleYouMayKnow(token: string): Promise<PeopleYouMayKnowResponse> {
  await delay();
  requireAuth(token);
  if (!db.contactsImported) return { people: [] };
  return {
    people: db.pymk.filter((p) => !db.edges.has(p.user_id) && !db.blocked.has(p.user_id)),
  };
}

// ------------------------------------------------------------------ safety

export async function blockUser(userId: string, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  db.blocked.add(userId);
  db.edges.delete(userId);
}

export async function fileReport(_input: ReportInput, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  // Live: writes a `reports` row for the admin triage queue.
}

// ----------------------------------------------------------- notifications

export async function fetchNotifications(
  token: string,
  _opts?: { limit?: number },
): Promise<NotificationListResponse> {
  await delay();
  requireAuth(token);
  const notifications = db.notifications
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    notifications,
    unread_count: notifications.filter((n) => n.read_at === null).length,
  };
}

export async function getUnreadCount(token: string): Promise<number> {
  requireAuth(token);
  return db.notifications.filter((n) => n.read_at === null).length;
}

export async function markNotificationRead(id: string, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  const n = db.notifications.find((x) => x.id === id);
  if (n && n.read_at === null) n.read_at = new Date().toISOString();
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await delay();
  requireAuth(token);
  const now = new Date().toISOString();
  for (const n of db.notifications) if (n.read_at === null) n.read_at = now;
}

// --------------------------------------------------------------- messaging

function toThreadSummary(t: MockState["threads"][number]): ThreadSummary {
  const last = t.messages[t.messages.length - 1] ?? null;
  const unread = t.messages.filter(
    (m) => m.sender_id !== ME && (t.lastReadAt === null || m.created_at > t.lastReadAt),
  ).length;
  return {
    thread_id: t.thread_id,
    kind: t.kind,
    title: t.title,
    hangout_post_id: t.hangout_post_id,
    last_message: last?.body ?? null,
    last_message_at: last?.created_at ?? null,
    unread_count: unread,
    member_count: t.member_count,
  };
}

export async function fetchThreads(token: string): Promise<ThreadListResponse> {
  await delay();
  requireAuth(token);
  const threads = db.threads
    .filter((t) => t.mine)
    .map(toThreadSummary)
    .sort((a, b) => (b.last_message_at ?? "").localeCompare(a.last_message_at ?? ""));
  return { threads };
}

export async function getOrCreateDm(userId: string, token: string): Promise<ThreadSummary> {
  await delay();
  requireAuth(token);
  const edge = db.edges.get(userId);
  if (edge?.state !== "accepted") {
    throw new ApiError(403, "You can DM someone once you're connected.");
  }
  const person = personOrThrow(userId);
  let thread = db.threads.find((t) => t.kind === "dm" && t.dmWith === userId);
  if (!thread) {
    thread = {
      thread_id: `thread-${db.nextId++}`,
      kind: "dm",
      title: person.display_name,
      hangout_post_id: null,
      member_count: 2,
      mine: true,
      dmWith: userId,
      lastReadAt: null,
      messages: [],
    };
    db.threads.push(thread);
  }
  return toThreadSummary(thread);
}

export async function fetchMessages(threadId: string, token: string): Promise<MessageListResponse> {
  await delay();
  requireAuth(token);
  const thread = db.threads.find((t) => t.thread_id === threadId && t.mine);
  if (!thread) throw new ApiError(404, "Thread not found.");
  return { thread_id: threadId, messages: thread.messages.map((m) => ({ ...m })) };
}

export async function sendMessage(
  threadId: string,
  body: string,
  token: string,
): Promise<ChatMessage> {
  await delay();
  requireAuth(token);
  const thread = db.threads.find((t) => t.thread_id === threadId && t.mine);
  if (!thread) throw new ApiError(404, "Thread not found.");
  const msg: ChatMessage = {
    id: `msg-${db.nextId++}`,
    thread_id: threadId,
    sender_id: ME,
    sender_name: db.myProfile?.display_name ?? null,
    body,
    created_at: new Date().toISOString(),
  };
  thread.messages.push(msg);
  return msg;
}

export async function markThreadRead(threadId: string, token: string): Promise<void> {
  requireAuth(token);
  const thread = db.threads.find((t) => t.thread_id === threadId);
  if (thread) thread.lastReadAt = new Date().toISOString();
}

// ------------------------------------------------------------- communities

export async function fetchCommunities(
  token: string,
  q?: string,
): Promise<CommunityListResponse> {
  await delay();
  requireAuth(token);
  const needle = q?.trim().toLowerCase();
  const communities = db.communities
    .filter((c) => (needle ? c.name.toLowerCase().includes(needle) : true))
    .slice()
    .sort((a, b) => b.member_count - a.member_count);
  return { communities: communities.map((c) => ({ ...c })) };
}

export async function getCommunity(id: string, token: string): Promise<CommunitySummary> {
  await delay();
  requireAuth(token);
  const c = db.communities.find((x) => x.id === id);
  if (!c) throw new ApiError(404, "Community not found.");
  return { ...c };
}

export async function createCommunity(
  input: CommunityCreateInput,
  token: string,
): Promise<CommunitySummary> {
  await delay();
  requireAuth(token);
  const community: CommunitySummary = {
    id: `community-${db.nextId++}`,
    name: input.name,
    description: input.description ?? null,
    member_count: 1,
    joined: true,
    created_at: new Date().toISOString(),
  };
  db.communities.unshift(community);
  return { ...community };
}

export async function joinCommunity(id: string, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  const c = db.communities.find((x) => x.id === id);
  if (!c) throw new ApiError(404, "Community not found.");
  if (!c.joined) {
    c.joined = true;
    c.member_count += 1;
  }
}

export async function leaveCommunity(id: string, token: string): Promise<void> {
  await delay();
  requireAuth(token);
  const c = db.communities.find((x) => x.id === id);
  if (!c) throw new ApiError(404, "Community not found.");
  if (c.joined) {
    c.joined = false;
    c.member_count -= 1;
  }
}

export async function fetchCommunityEvents(
  id: string,
  token: string,
): Promise<CommunityEventsResponse> {
  await delay();
  requireAuth(token);
  const experts = cityExperts();
  const events = visiblePosts()
    .filter((p) => p.communityId === id && p.type === "hangout")
    .sort((a, b) => (a.venue_time ?? "9999").localeCompare(b.venue_time ?? "9999"))
    .map((p) => toPost(p, experts));
  return { community_id: id, events };
}
