/** The mirror's world state. The post corpus is the real DC seed from
 * apps/api/src/hangpost_api/seed_posts.py (12 prototype posts + the 8-tip
 * "city starter pack"), with timestamps rebuilt relative to "now" so the
 * feed reads the way the live one does.
 *
 * Two personas:
 *  - "demo"  — a returning user (profile, DC home base, a small but coherent
 *    social graph) so every surface has something to show.
 *  - "fresh" — a brand-new account: no profile, no home base, empty lanes.
 *    This is exactly what a new sign-up sees on live.
 */

import type {
  AppNotification,
  ChatMessage,
  CommunitySummary,
  ConnectionSuggestion,
  FamiliarFace,
  LocationResponse,
  Newcomer,
  PersonYouMayKnow,
  ProfileRead,
  ReactionSummary,
  RecommendationResult,
  FriendshipState,
} from "../lib/types";

export interface SeedPost {
  id: string;
  authorId: string;
  type: "hangout" | "local_info";
  body: string;
  distance_m: number | null;
  created_at: string;
  venue: string | null;
  venue_time: string | null;
  recurrence: string | null;
  rsvp_count: number;
  interested_count: number;
  /** First few people going (ids into PEOPLE) — the who's-going preview. */
  attendeeIds: string[];
  maxRsvps: number | null;
  comment_count: number;
  hashtags: string[];
  reactions: ReactionSummary[];
  saved_count: number;
  saved: boolean;
  communityId: string | null;
  myRsvp: "going" | "interested" | null;
}

export interface MockThread {
  thread_id: string;
  kind: "hangout" | "dm";
  title: string;
  hangout_post_id: string | null;
  member_count: number;
  /** Whether the current user is a member (live: an RSVP materializes it). */
  mine: boolean;
  dmWith?: string;
  lastReadAt: string | null;
  messages: ChatMessage[];
}

export interface Edge {
  state: FriendshipState;
  outgoing: boolean;
  created_at: string;
}

export interface MockPerson {
  display_name: string;
  handle: string;
  hometown: string | null;
  college: string | null;
  major: string | null;
  job: string | null;
}

export interface MockState {
  posts: SeedPost[];
  people: Record<string, MockPerson>;
  myProfile: ProfileRead | null;
  myLocation: LocationResponse | null;
  edges: Map<string, Edge>;
  blocked: Set<string>;
  dismissed: Set<string>;
  suggestions: ConnectionSuggestion[];
  regulars: FamiliarFace[];
  newcomers: Newcomer[];
  pymk: PersonYouMayKnow[];
  contactsImported: boolean;
  recommendations: RecommendationResult[];
  notifications: AppNotification[];
  threads: MockThread[];
  communities: CommunitySummary[];
  nextId: number;
}

const PEOPLE: Record<string, MockPerson> = {
  maya: { display_name: "Maya Chen", handle: "mayachen", hometown: "Columbus, OH", college: "Ohio State University", major: "Graphic Design", job: "Product designer at a fintech" },
  sam: { display_name: "Sam Okafor", handle: "samokafor", hometown: "Atlanta, GA", college: "Georgia Tech", major: "Computer Science", job: "Software engineer at Capital One" },
  priya: { display_name: "Priya Patel", handle: "priyap", hometown: "Edison, NJ", college: "Rutgers", major: "Biology", job: "Research assistant at NIH" },
  jordan: { display_name: "Jordan Lee", handle: "jordanlee", hometown: "Chicago, IL", college: "UIUC", major: "Math", job: "High-school math teacher" },
  chris: { display_name: "Chris Donnelly", handle: "chrisd", hometown: "Boston, MA", college: "BU", major: "Economics", job: "Consultant at Deloitte" },
  taylor: { display_name: "Taylor Brooks", handle: "tbrooks", hometown: "Raleigh, NC", college: "NC State", major: "Communications", job: "Marketing coordinator at a nonprofit" },
  dana: { display_name: "Dana Kim", handle: "danakim", hometown: "Fairfax, VA", college: "Georgetown", major: "Urban Studies", job: "Urban planner at DC government" },
  leo: { display_name: "Leo Martinez", handle: "leomtz", hometown: "San Antonio, TX", college: "UT Austin", major: "Accounting", job: "Audit associate at PwC" },
  nia: { display_name: "Nia Washington", handle: "niaw", hometown: "Washington, DC", college: "Howard", major: "Hospitality", job: "Event producer" },
  omar: { display_name: "Omar Haddad", handle: "omarh", hometown: "Dearborn, MI", college: "Michigan", major: "Civil Engineering", job: "Transit analyst at WMATA" },
  emma: { display_name: "Emma Sullivan", handle: "emmasull", hometown: "Columbus, OH", college: "Ohio State University", major: "Political Science", job: "Paralegal at a law firm" },
  dev: { display_name: "Dev Sharma", handle: "devsharma", hometown: "Cary, NC", college: "Ohio State University", major: "Statistics", job: "Data analyst at Capital One" },
  grace: { display_name: "Grace Liu", handle: "graceliu", hometown: "Columbus, OH", college: "Ohio State University", major: "Finance", job: "Analyst at a real-estate firm" },
  ben: { display_name: "Ben Carter", handle: "bencarter", hometown: "Richmond, VA", college: "VCU", major: "Film", job: "Freelance video editor" },
};

interface SeedSpec {
  authorId: string;
  type: "hangout" | "local_info";
  body: string;
  hours_ago: number;
  distance_m: number;
  venue?: string;
  starts_in_h?: number;
  rsvp_count?: number;
  interested_count?: number;
  attendeeIds?: string[];
  maxRsvps?: number;
  comment_count?: number;
  reactions?: [string, number][];
  saved_count?: number;
  communityId?: string;
}

/** Verbatim post bodies from apps/api seed_posts.py `_SEED_POSTS`. */
const SEED_SPECS: SeedSpec[] = [
  {
    authorId: "maya",
    type: "hangout",
    body: "Grabbing coffee and getting some work done at Compass Coffee on 7th — anyone want to co-work for a couple hours? ☕",
    hours_ago: 0.2,
    distance_m: 700,
    venue: "Compass Coffee, Shaw",
    starts_in_h: 1,
    rsvp_count: 2,
    attendeeIds: ["sam", "priya"],
    interested_count: 1,
    comment_count: 1,
    reactions: [["👍", 2]],
  },
  {
    authorId: "sam",
    type: "local_info",
    body: "Heads up: Red Line is single-tracking between Dupont and Farragut North all weekend. Budget an extra 15 min. 🚇",
    hours_ago: 0.75,
    distance_m: 1300,
    comment_count: 2,
    reactions: [["👍", 4]],
    saved_count: 2,
  },
  {
    authorId: "jordan",
    type: "hangout",
    body: "Pickup soccer at the Mall fields around 6. Casual, all skill levels, just bring water. Who's in? ⚽",
    hours_ago: 1.5,
    distance_m: 2100,
    venue: "National Mall, west fields",
    starts_in_h: 4,
    rsvp_count: 7,
    attendeeIds: ["chris", "dana", "leo"],
    interested_count: 3,
    comment_count: 4,
    reactions: [["🔥", 3], ["🎉", 1]],
  },
  {
    authorId: "priya",
    type: "local_info",
    body: "The farmers market at Dupont Circle has the best peaches right now. Get there before noon, they sell out fast. 🍑",
    hours_ago: 2,
    distance_m: 900,
    comment_count: 1,
    reactions: [["❤️", 2]],
    saved_count: 1,
  },
  {
    authorId: "leo",
    type: "hangout",
    body: "New to DC and looking to meet people! Doing trivia at a bar in Adams Morgan tonight — come say hi, the more the merrier. 🍻",
    hours_ago: 3,
    distance_m: 1800,
    venue: "Town Tavern, Adams Morgan",
    starts_in_h: 6,
    rsvp_count: 5,
    attendeeIds: ["jordan", "maya", "emma"],
    interested_count: 2,
    comment_count: 3,
    reactions: [["🎉", 4], ["👍", 2]],
  },
  {
    authorId: "dana",
    type: "local_info",
    body: "Avoid 14th St NW around 5–6pm — protest march is routing through there. Side streets are clear. 🚶",
    hours_ago: 4,
    distance_m: 600,
    comment_count: 0,
    reactions: [["👍", 3]],
  },
  {
    authorId: "emma",
    type: "hangout",
    body: "Anyone up for a morning run along the Tidal Basin tomorrow? Easy 5k, meet by the MLK memorial at 7am. 🏃",
    hours_ago: 5,
    distance_m: 2600,
    venue: "MLK Memorial, Tidal Basin",
    starts_in_h: 16,
    rsvp_count: 3,
    attendeeIds: ["grace", "ben", "dev"],
    interested_count: 2,
    comment_count: 2,
    reactions: [["🔥", 2]],
  },
  {
    authorId: "ben",
    type: "local_info",
    body: "Free outdoor movie night at Yards Park on Friday — they're showing a classic. Bring a blanket! 🎬",
    hours_ago: 6,
    distance_m: 3400,
    comment_count: 1,
    reactions: [["🎉", 2], ["❤️", 1]],
    saved_count: 3,
  },
  {
    authorId: "dev",
    type: "hangout",
    body: "Board game night at my place in Navy Yard this Saturday. Got Catan, Codenames, and snacks. DM for the address. 🎲",
    hours_ago: 8,
    distance_m: 3700,
    venue: "Navy Yard",
    starts_in_h: 50,
    rsvp_count: 4,
    attendeeIds: ["taylor", "nia", "omar"],
    maxRsvps: 6,
    interested_count: 1,
    comment_count: 5,
    reactions: [["👀", 2], ["👍", 1]],
  },
  {
    authorId: "grace",
    type: "local_info",
    body: "PSA: the Georgetown Waterfront fountain is back on for the summer. Great spot to cool off in the evening. 💦",
    hours_ago: 10,
    distance_m: 2900,
    comment_count: 0,
    reactions: [["❤️", 1]],
  },
  {
    authorId: "taylor",
    type: "hangout",
    body: "Sunday brunch crew? Thinking Eastern Market then walking around Capitol Hill. Looking for 2–3 more people. 🥞",
    hours_ago: 14,
    distance_m: 3100,
    venue: "Eastern Market, Capitol Hill",
    starts_in_h: 40,
    rsvp_count: 2,
    attendeeIds: ["dana", "grace"],
    maxRsvps: 4,
    interested_count: 4,
    comment_count: 2,
  },
  {
    authorId: "nia",
    type: "local_info",
    body: "The new ramen spot in Shaw is worth the hype but the wait is ~45 min at dinner. Go for a late lunch instead. 🍜",
    hours_ago: 20,
    distance_m: 800,
    comment_count: 3,
    reactions: [["👍", 2], ["❤️", 1]],
    saved_count: 2,
  },
  // City "starter pack" tips (ADR-0018/0019)
  {
    authorId: "nia",
    type: "local_info",
    body: "Best happy hour downtown: Wednesdays at Dacha Beer Garden — half-price steins 4–7. #happyhour #drinks",
    hours_ago: 30,
    distance_m: 1100,
    comment_count: 2,
    reactions: [["🔥", 3], ["👍", 2]],
    saved_count: 4,
  },
  {
    authorId: "omar",
    type: "local_info",
    body: "New to DC? Put a SmarTrip card in Apple Wallet, not plastic — just tap straight through the faregates. #transit #newintown",
    hours_ago: 36,
    distance_m: 500,
    comment_count: 1,
    reactions: [["👍", 4]],
    saved_count: 3,
  },
  {
    authorId: "ben",
    type: "local_info",
    body: "Free museums aren't a myth here — the whole Smithsonian is $0. Start with Air & Space, go early. #freebies #thingstodo",
    hours_ago: 42,
    distance_m: 2200,
    comment_count: 0,
    reactions: [["❤️", 2]],
    saved_count: 2,
  },
  {
    authorId: "omar",
    type: "local_info",
    body: "Cheap eats: the half-smoke at Ben's Chili Bowl on U St is a rite of passage. Cash moves the line fastest. #food #hiddengems",
    hours_ago: 48,
    distance_m: 1500,
    comment_count: 2,
    reactions: [["🔥", 2], ["👍", 1]],
    saved_count: 1,
  },
  {
    authorId: "grace",
    type: "local_info",
    body: "Sunday runners: Rock Creek Park trails beat the Mall — shaded, car-free, and you'll actually meet people. #fitness #outdoors",
    hours_ago: 54,
    distance_m: 2700,
    comment_count: 1,
    reactions: [["👍", 2]],
    saved_count: 1,
  },
  {
    authorId: "nia",
    type: "local_info",
    body: "Cherry blossom crowds are brutal 10–4. Go at sunrise around the Tidal Basin and you'll have it to yourself. #thingstodo",
    hours_ago: 60,
    distance_m: 2500,
    comment_count: 0,
    reactions: [["❤️", 3]],
    saved_count: 2,
  },
  {
    authorId: "dana",
    type: "local_info",
    body: "Rent tip: a place on the Metro beats a cheaper one a 20-min walk away — DC summers and winters are real. #housing #newintown",
    hours_ago: 66,
    distance_m: 1900,
    comment_count: 1,
    reactions: [["👍", 1]],
    saved_count: 1,
  },
  {
    authorId: "leo",
    type: "local_info",
    body: "Best rooftop for a low-key first hang: the Watergate bar has the river view without bottle-service prices. #drinks #hiddengems",
    hours_ago: 72,
    distance_m: 2300,
    comment_count: 0,
    reactions: [["❤️", 1], ["👀", 1]],
    saved_count: 1,
  },
  // A community event (Run Club DMV) — community events also appear in the
  // location feed, like live.
  {
    authorId: "leo",
    type: "hangout",
    body: "Run Club DMV Saturday social run — 4 easy miles from Meridian Hill, coffee after. All paces welcome!",
    hours_ago: 9,
    distance_m: 1600,
    venue: "Meridian Hill Park",
    starts_in_h: 60,
    rsvp_count: 6,
    attendeeIds: ["emma", "chris", "sam"],
    interested_count: 2,
    comment_count: 1,
    reactions: [["🔥", 2]],
    communityId: "community-runclub",
  },
];

const HASHTAG_RE = /#([a-z0-9_]+)/gi;

function iso(msFromNow: number): string {
  return new Date(Date.now() + msFromNow).toISOString();
}

function buildPosts(): SeedPost[] {
  return SEED_SPECS.map((spec, i) => ({
    id: `seed-${i}`,
    authorId: spec.authorId,
    type: spec.type,
    body: spec.body,
    distance_m: spec.distance_m,
    created_at: iso(-spec.hours_ago * 3600_000),
    venue: spec.venue ?? null,
    venue_time: spec.starts_in_h !== undefined ? iso(spec.starts_in_h * 3600_000) : null,
    recurrence: null,
    rsvp_count: spec.rsvp_count ?? 0,
    interested_count: spec.interested_count ?? 0,
    attendeeIds: spec.attendeeIds ?? [],
    maxRsvps: spec.maxRsvps ?? null,
    comment_count: spec.comment_count ?? 0,
    hashtags: [...new Set([...spec.body.matchAll(HASHTAG_RE)].map((m) => m[1].toLowerCase()))],
    reactions: (spec.reactions ?? [])
      .filter(([, count]) => count > 0)
      .map(([emoji, count]) => ({ emoji, count, reacted: false })),
    saved_count: spec.saved_count ?? 0,
    saved: false,
    communityId: spec.communityId ?? null,
    myRsvp: null,
  }));
}

function breakdown(partial: Partial<RecommendationResult["breakdown"]>) {
  return {
    total_score: 0,
    has_mutual_friends: false,
    has_shared_background: false,
    has_both_shared_background: false,
    social_boost: 0,
    interest_overlap: 0,
    liked_topic_overlap: 0,
    mutual_friends: 0,
    hometown_match: 0,
    college_match: 0,
    major_match: 0,
    job_match: 0,
    age_compatibility: 0,
    semantic_similarity: 0,
    ...partial,
  };
}

function buildRecommendations(): RecommendationResult[] {
  // Mirrors the live three-lane tier sort: mutual friends → shared
  // hometown/college → everyone else; score only orders within a lane.
  const rows: [string, number, Partial<RecommendationResult["breakdown"]>][] = [
    ["maya", 0.87, {
      has_mutual_friends: true, mutual_friends: 1, social_boost: 0.15,
      has_shared_background: true, has_both_shared_background: true,
      hometown_match: 1, college_match: 1, interest_overlap: 0.5,
      liked_topic_overlap: 0.34, age_compatibility: 0.95, semantic_similarity: 0.78,
    }],
    ["jordan", 0.79, {
      has_mutual_friends: true, mutual_friends: 2, social_boost: 0.22,
      interest_overlap: 0.41, liked_topic_overlap: 0.2,
      age_compatibility: 0.9, semantic_similarity: 0.66,
    }],
    ["grace", 0.71, {
      has_shared_background: true, has_both_shared_background: true,
      hometown_match: 1, college_match: 1, major_match: 1, interest_overlap: 0.28,
      liked_topic_overlap: 0.31, age_compatibility: 0.85, semantic_similarity: 0.61,
    }],
    ["emma", 0.68, {
      has_shared_background: true, hometown_match: 1, interest_overlap: 0.36,
      liked_topic_overlap: 0.18, age_compatibility: 0.9, semantic_similarity: 0.58,
    }],
    ["dev", 0.63, {
      has_shared_background: true, college_match: 1, interest_overlap: 0.22,
      liked_topic_overlap: 0.4, age_compatibility: 0.8, semantic_similarity: 0.55,
    }],
    ["leo", 0.52, {
      interest_overlap: 0.55, liked_topic_overlap: 0.37,
      age_compatibility: 0.85, semantic_similarity: 0.62,
    }],
    ["ben", 0.47, {
      interest_overlap: 0.44, liked_topic_overlap: 0.25,
      age_compatibility: 0.75, semantic_similarity: 0.52,
    }],
    ["dana", 0.44, {
      interest_overlap: 0.38, liked_topic_overlap: 0.31,
      age_compatibility: 0.9, semantic_similarity: 0.49,
    }],
    ["taylor", 0.38, {
      interest_overlap: 0.33, liked_topic_overlap: 0.12,
      age_compatibility: 0.7, semantic_similarity: 0.45,
    }],
    ["omar", 0.33, {
      interest_overlap: 0.24, liked_topic_overlap: 0.2,
      age_compatibility: 0.65, semantic_similarity: 0.41,
    }],
  ];
  return rows.map(([id, score, b], i) => ({
    impression_id: `imp-${id}`,
    user_id: id,
    display_name: PEOPLE[id].display_name,
    handle: PEOPLE[id].handle,
    hometown: PEOPLE[id].hometown,
    college: PEOPLE[id].college,
    major: PEOPLE[id].major,
    job: PEOPLE[id].job,
    rank_position: i + 1,
    score,
    breakdown: breakdown({ ...b, total_score: score }),
  }));
}

function buildCommunities(): CommunitySummary[] {
  return [
    {
      id: "community-newtodc",
      name: "New to DC",
      description: "Just moved? Start here — weekly meetups, starter tips, and people in the same boat.",
      member_count: 67,
      joined: false,
      created_at: iso(-40 * 24 * 3600_000),
    },
    {
      id: "community-runclub",
      name: "Run Club DMV",
      description: "Easy-pace social runs around the District — all paces, coffee after.",
      member_count: 41,
      joined: false,
      created_at: iso(-60 * 24 * 3600_000),
    },
    {
      id: "community-boulder",
      name: "DC Boulderers",
      description: "Climbing + gym sessions around the District. Beginners always welcome.",
      member_count: 24,
      joined: false,
      created_at: iso(-25 * 24 * 3600_000),
    },
  ];
}

export function buildSeedState(persona: "demo" | "fresh"): MockState {
  const base: MockState = {
    posts: buildPosts(),
    people: PEOPLE,
    myProfile: null,
    myLocation: null,
    edges: new Map(),
    blocked: new Set(),
    dismissed: new Set(),
    suggestions: [],
    regulars: [],
    newcomers: [
      {
        user_id: "emma",
        display_name: PEOPLE.emma.display_name,
        handle: PEOPLE.emma.handle,
        avatar_url: null,
        new_since: iso(-4 * 24 * 3600_000),
        hometown: PEOPLE.emma.hometown,
      },
      {
        user_id: "omar",
        display_name: PEOPLE.omar.display_name,
        handle: PEOPLE.omar.handle,
        avatar_url: null,
        new_since: iso(-12 * 24 * 3600_000),
        hometown: PEOPLE.omar.hometown,
      },
      {
        user_id: "ben",
        display_name: PEOPLE.ben.display_name,
        handle: PEOPLE.ben.handle,
        avatar_url: null,
        new_since: iso(-20 * 24 * 3600_000),
        hometown: PEOPLE.ben.hometown,
      },
    ],
    pymk: [
      {
        user_id: "taylor",
        display_name: PEOPLE.taylor.display_name,
        handle: PEOPLE.taylor.handle,
        avatar_url: null,
      },
      {
        user_id: "dana",
        display_name: PEOPLE.dana.display_name,
        handle: PEOPLE.dana.handle,
        avatar_url: null,
      },
    ],
    contactsImported: false,
    recommendations: buildRecommendations(),
    notifications: [],
    threads: [],
    communities: buildCommunities(),
    nextId: 1,
  };

  if (persona === "fresh") return base;

  // --- Returning demo user: profile, home base, and a coherent week of use.
  base.myProfile = {
    user_id: "me",
    display_name: "Alex Rivera",
    handle: "alexrivera",
    avatar_url: null,
    age: 23,
    hometown: "Columbus, OH",
    college: "Ohio State University",
    major: "Finance",
    job: "Consulting analyst at Deloitte",
    interests: ["hiking", "coffee", "live music", "bouldering"],
    liked_topics: ["indie music", "startups", "food"],
    bio_synthesized: null,
    onboarded_at: iso(-10 * 24 * 3600_000),
    new_arrival_at: iso(-8 * 24 * 3600_000),
    is_new_arrival: true,
    updated_at: iso(-1 * 24 * 3600_000),
  };
  base.myLocation = {
    latitude: 38.9072,
    longitude: -77.0369,
    radius_m: 14484,
    label: "Washington DC (Downtown)",
    accuracy_m: null,
    updated_at: iso(-10 * 24 * 3600_000),
  };
  base.edges = new Map([
    ["sam", { state: "accepted" as const, outgoing: true, created_at: iso(-5 * 24 * 3600_000) }],
    ["priya", { state: "accepted" as const, outgoing: false, created_at: iso(-3 * 24 * 3600_000) }],
    ["chris", { state: "pending" as const, outgoing: false, created_at: iso(-1 * 3600_000) }],
  ]);
  base.suggestions = [
    {
      user_id: "jordan",
      display_name: PEOPLE.jordan.display_name,
      handle: PEOPLE.jordan.handle,
      avatar_url: null,
      met_venue: "Town Tavern, Adams Morgan",
      met_at: iso(-2 * 24 * 3600_000),
    },
  ];
  base.regulars = [
    {
      user_id: "chris",
      display_name: PEOPLE.chris.display_name,
      handle: PEOPLE.chris.handle,
      avatar_url: null,
      shared_hangouts: 2,
      last_venue: "National Mall, west fields",
      last_at: iso(-2 * 24 * 3600_000),
      connected: false,
    },
  ];
  base.notifications = [
    {
      id: "notif-1",
      kind: "friend_request",
      payload: { from: "chris", from_name: "Chris Donnelly" },
      read_at: null,
      created_at: iso(-1 * 3600_000),
    },
    {
      id: "notif-2",
      kind: "friend_request",
      payload: { from: "sam", from_name: "Sam Okafor", event: "accepted" },
      read_at: null,
      created_at: iso(-26 * 3600_000),
    },
    {
      id: "notif-3",
      kind: "rsvp",
      payload: { from: "priya", from_name: "Priya Patel" },
      read_at: iso(-40 * 3600_000),
      created_at: iso(-45 * 3600_000),
    },
  ];
  return base;
}
