/** Wire types copied from packages/api-client/src/types.ts so the mirror's
 * screens consume the exact shapes the live API returns. Keep in sync. */

export interface MatchBreakdown {
  total_score: number;
  has_mutual_friends: boolean;
  has_shared_background: boolean;
  has_both_shared_background: boolean;
  social_boost: number;
  interest_overlap: number;
  liked_topic_overlap: number;
  mutual_friends: number;
  hometown_match: number;
  college_match: number;
  major_match: number;
  job_match: number;
  age_compatibility: number;
  semantic_similarity: number;
}

export interface RecommendationResult {
  impression_id: string;
  user_id: string;
  display_name: string;
  handle: string;
  hometown: string | null;
  college: string | null;
  major: string | null;
  job: string | null;
  rank_position: number;
  score: number;
  breakdown: MatchBreakdown;
}

export interface RecommendationsResponse {
  source_user_id: string;
  radius_m: number;
  model_version: string;
  results: RecommendationResult[];
}

export interface ProfileInput {
  display_name: string;
  handle: string;
  age: number | null;
  hometown: string | null;
  college: string | null;
  major: string | null;
  job: string | null;
  interests: string[];
  liked_topics: string[];
}

export interface ProfileRead {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  age: number | null;
  hometown: string | null;
  college: string | null;
  major: string | null;
  job: string | null;
  interests: string[];
  liked_topics: string[];
  bio_synthesized: string | null;
  onboarded_at: string | null;
  new_arrival_at: string | null;
  is_new_arrival: boolean;
  updated_at: string;
}

export interface ProfileUpdateInput {
  display_name?: string;
  age?: number | null;
  hometown?: string | null;
  college?: string | null;
  major?: string | null;
  job?: string | null;
  interests?: string[];
  liked_topics?: string[];
  avatar_url?: string | null;
}

export interface AvatarUploadTarget {
  upload_url: string;
  public_url: string;
}

export interface LocationInput {
  latitude: number;
  longitude: number;
  radius_m?: number;
  label?: string | null;
  accuracy_m?: number | null;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
  radius_m: number;
  label: string | null;
  accuracy_m: number | null;
  updated_at: string;
}

export interface PostAuthor {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  city_expert: boolean;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface AttendeePreview {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  type: "hangout" | "local_info";
  visibility: string;
  body: string;
  distance_m: number | null;
  created_at: string;
  author: PostAuthor;
  venue: string | null;
  venue_time: string | null;
  recurrence: string | null;
  rsvp_count: number;
  interested_count: number;
  attendees: AttendeePreview[];
  max_rsvps: number | null;
  my_rsvp: "going" | "interested" | null;
  comment_count: number;
  hashtags: string[];
  image_urls: string[];
  reactions: ReactionSummary[];
  saved_count: number;
  saved: boolean;
}

export interface FeedResponse {
  posts: Post[];
  total: number;
}

export interface CreatePostInput {
  type: "hangout" | "local_info";
  body: string;
  latitude: number;
  longitude: number;
  radius_m?: number;
  venue?: string | null;
  starts_at?: string | null;
  capacity?: number | null;
  recurrence?: "weekly";
  community_id?: string | null;
  venue_time?: string | null;
}

export interface RsvpResponse {
  post_id: string;
  rsvp_count: number;
  interested_count: number;
  going: boolean;
  status: string;
}

export interface ReactionListResponse {
  post_id: string;
  reactions: ReactionSummary[];
}

export interface SaveResponse {
  post_id: string;
  saved_count: number;
  saved: boolean;
}

export interface ReportInput {
  target_user_id?: string;
  target_post_id?: string;
  reason: string;
  detail?: string | null;
}

export type NotifKind =
  | "new_match"
  | "hangout_invite"
  | "rsvp"
  | "comment"
  | "friend_request";

export interface AppNotification {
  id: string;
  kind: NotifKind;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unread_count: number;
}

export interface ThreadSummary {
  thread_id: string;
  kind: "hangout" | "dm";
  title: string;
  hangout_post_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  member_count: number;
}

export interface ThreadListResponse {
  threads: ThreadSummary[];
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string | null;
  body: string;
  created_at: string;
}

export interface MessageListResponse {
  thread_id: string;
  messages: ChatMessage[];
}

export interface CommunitySummary {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  joined: boolean;
  created_at: string;
}

export interface CommunityListResponse {
  communities: CommunitySummary[];
}

export interface CommunityCreateInput {
  name: string;
  description?: string | null;
}

export interface CommunityEventsResponse {
  community_id: string;
  events: Post[];
}

export type FriendshipState = "pending" | "accepted" | "blocked";

export interface Connection {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  state: FriendshipState;
  outgoing: boolean;
  created_at: string;
}

export interface ConnectionListResponse {
  connections: Connection[];
}

export interface ConnectionSuggestion {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  met_venue: string | null;
  met_at: string;
}

export interface SuggestionListResponse {
  suggestions: ConnectionSuggestion[];
}

export interface FamiliarFace {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  shared_hangouts: number;
  last_venue: string | null;
  last_at: string;
  connected: boolean;
}

export interface FamiliarFaceListResponse {
  faces: FamiliarFace[];
}

export interface Newcomer {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  new_since: string;
  hometown: string | null;
}

export interface NewcomerListResponse {
  newcomers: Newcomer[];
}

export interface ContactImportResult {
  imported_count: number;
  matched_count: number;
}

export interface PersonYouMayKnow {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
}

export interface PeopleYouMayKnowResponse {
  people: PersonYouMayKnow[];
}

export type OutcomeAction =
  | "viewed"
  | "profile_opened"
  | "friend_request_sent"
  | "blocked"
  | "hangout_rsvped";
