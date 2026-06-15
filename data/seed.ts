/** The seed world: a believable week of Hangpost-DC activity. Times are built
 * relative to "now" so Today/This-week/past states always render correctly. */

import type {
  Community,
  EdgeState,
  FamiliarEntry,
  Hang,
  Me,
  Notif,
  Person,
  Thread,
} from "../lib/store";

const av = (n: number) => `https://i.pravatar.cc/150?img=${n}`;

export function t(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 3600_000).toISOString();
}

export const PEOPLE: Record<string, Person> = {
  maya: {
    id: "maya", name: "Maya Chen", handle: "mayachen", avatar: av(47), verified: true,
    intro: "Coffee-shop hopper, amateur potter, will walk anywhere.",
    age: 24, pronouns: "she/her", hometown: "Columbus, OH", college: "Ohio State University", major: "Graphic Design", job: "Product designer at a fintech",
    hobbies: ["pottery", "long walks", "cooking"], interests: ["coffee", "design", "live music"],
    likes: ["indie music", "food trucks"], newSince: null, sharedContacts: ["sam"], reliable: true, attended: 14,
  },
  sam: {
    id: "sam", name: "Sam Okafor", handle: "samokafor", avatar: av(12), verified: true,
    intro: "Transplant from ATL. Pickup soccer + good ramen.",
    age: 25, pronouns: "he/him", hometown: "Atlanta, GA", college: "Georgia Tech", major: "Computer Science", job: "Software engineer at Capital One",
    hobbies: ["soccer", "cycling"], interests: ["ramen", "sneakers"], likes: ["afrobeats"],
    newSince: null, sharedContacts: [], reliable: true, attended: 11,
  },
  priya: {
    id: "priya", name: "Priya Patel", handle: "priyap", avatar: av(31), verified: true,
    intro: "Plant mom. Farmers-market regular. Ask me about bread.",
    age: 23, pronouns: "she/her", hometown: "Edison, NJ", college: "Rutgers", major: "Biology", job: "Research assistant at NIH",
    hobbies: ["baking", "gardening"], interests: ["markets", "yoga"], likes: ["sourdough"],
    newSince: null, sharedContacts: [], reliable: true, attended: 9,
  },
  jordan: {
    id: "jordan", name: "Jordan Lee", handle: "jordanlee", avatar: av(59), verified: true,
    intro: "Organizing pickup soccer since 2019. All skill levels, always.",
    age: 26, pronouns: "he/him", hometown: "Chicago, IL", college: "UIUC", major: "Math", job: "High-school math teacher",
    hobbies: ["soccer", "board games"], interests: ["sports", "strategy games"], likes: ["FC Barcelona"],
    newSince: null, sharedContacts: ["sam", "priya"], reliable: true, attended: 21,
  },
  chris: {
    id: "chris", name: "Chris Donnelly", handle: "chrisd", avatar: av(53), verified: false,
    intro: "Runner, early riser, perpetually training for something.",
    age: 27, pronouns: "he/him", hometown: "Boston, MA", college: "BU", major: "Economics", job: "Consultant at Deloitte",
    hobbies: ["running", "swimming"], interests: ["marathons", "coffee"], likes: ["podcasts"],
    newSince: null, sharedContacts: ["sam"], reliable: true, attended: 8,
  },
  taylor: {
    id: "taylor", name: "Taylor Brooks", handle: "tbrooks", avatar: av(9), verified: true,
    intro: "Brunch scientist. Weekend museum wanderer.",
    age: 24, pronouns: "she/her", hometown: "Raleigh, NC", college: "NC State", major: "Communications", job: "Marketing coordinator at a nonprofit",
    hobbies: ["photography"], interests: ["brunch", "museums"], likes: ["true crime pods"],
    newSince: null, sharedContacts: [], reliable: false, attended: 2,
  },
  dana: {
    id: "dana", name: "Dana Kim", handle: "danakim", avatar: av(44), verified: true,
    intro: "DC lifer happy to show transplants the good spots.",
    age: 28, pronouns: "she/her", hometown: "Fairfax, VA", college: "Georgetown", major: "Urban Studies", job: "Urban planner at DC government",
    hobbies: ["climbing", "biking"], interests: ["city history", "happy hours"], likes: ["jazz"],
    newSince: null, sharedContacts: [], reliable: true, attended: 12,
  },
  leo: {
    id: "leo", name: "Leo Martinez", handle: "leomtz", avatar: av(68), verified: true,
    intro: "New-ish here too — building the run club one Saturday at a time.",
    age: 25, pronouns: "he/him", hometown: "San Antonio, TX", college: "UT Austin", major: "Accounting", job: "Audit associate at PwC",
    hobbies: ["running", "trivia"], interests: ["live music", "tacos"], likes: ["indie music"],
    newSince: null, sharedContacts: [], reliable: true, attended: 17,
  },
  nia: {
    id: "nia", name: "Nia Washington", handle: "niaw", avatar: av(24), verified: true,
    intro: "Your unofficial DC concierge. I have a tip for everything.",
    age: 29, pronouns: "she/her", hometown: "Washington, DC", college: "Howard", major: "Hospitality", job: "Event producer",
    hobbies: ["food tours"], interests: ["restaurants", "neighborhoods"], likes: ["go-go"],
    newSince: null, sharedContacts: [], reliable: true, attended: 15,
  },
  omar: {
    id: "omar", name: "Omar Haddad", handle: "omarh", avatar: av(60), verified: false,
    intro: "Moved for work, stayed for the museums.",
    age: 26, pronouns: "he/him", hometown: "Dearborn, MI", college: "Michigan", major: "Civil Engineering", job: "Transit analyst at WMATA",
    hobbies: ["chess", "biking"], interests: ["museums", "transit"], likes: ["history books"],
    newSince: t(-12 * 24), sharedContacts: ["sam"], reliable: true, attended: 5,
  },
  emma: {
    id: "emma", name: "Emma Sullivan", handle: "emmasull", avatar: av(16), verified: true,
    intro: "Just moved from Columbus! Looking for a running crew + book people.",
    age: 23, pronouns: "she/her", hometown: "Columbus, OH", college: "Ohio State University", major: "Political Science", job: "Paralegal at a law firm",
    hobbies: ["running", "reading"], interests: ["book clubs", "coffee"], likes: ["fantasy novels"],
    newSince: t(-4 * 24), sharedContacts: [], reliable: true, attended: 3,
  },
  dev: {
    id: "dev", name: "Dev Sharma", handle: "devsharma", avatar: av(33), verified: true,
    intro: "Board game shelf threatening structural integrity. Send help/players.",
    age: 24, pronouns: "he/him", hometown: "Cary, NC", college: "Ohio State University", major: "Statistics", job: "Data analyst at Capital One",
    hobbies: ["board games", "cooking"], interests: ["strategy games", "sci-fi"], likes: ["Catan"],
    newSince: null, sharedContacts: [], reliable: true, attended: 10,
  },
  grace: {
    id: "grace", name: "Grace Liu", handle: "graceliu", avatar: av(26), verified: true,
    intro: "Climber, trail runner, weekend explorer.",
    age: 24, pronouns: "she/her", hometown: "Columbus, OH", college: "Ohio State University", major: "Finance", job: "Analyst at a real-estate firm",
    hobbies: ["bouldering", "trail running"], interests: ["outdoors", "coffee"], likes: ["climbing films"],
    newSince: null, sharedContacts: [], reliable: true, attended: 13,
  },
  ben: {
    id: "ben", name: "Ben Carter", handle: "bencarter", avatar: av(70), verified: false,
    intro: "Free-events radar. If it's outdoors and costs $0 I'm there.",
    age: 30, pronouns: "he/him", hometown: "Richmond, VA", college: "VCU", major: "Film", job: "Freelance video editor",
    hobbies: ["frisbee", "hiking"], interests: ["free events", "movies"], likes: ["film scores"],
    newSince: t(-20 * 24), sharedContacts: [], reliable: false, attended: 4,
  },
};

export const DEMO_ME: Me = {
  id: "me", name: "Alex Rivera", handle: "alexrivera", avatar: av(5), verified: true,
  intro: "New in DC — down for coffee, climbs, and live music.",
  age: 23, pronouns: "he/him", hometown: "Columbus, OH", college: "Ohio State University",
  major: "Finance", job: "Consulting analyst at Deloitte",
  hobbies: ["bouldering", "hiking", "guitar"], interests: ["coffee", "live music", "startups"],
  likes: ["indie music", "food"], newSince: t(-8 * 24), sharedContacts: [], reliable: true,
  homeLabel: "Washington DC (Downtown)", radiusMi: 9, newInTown: true,
  planShare: true, phoneVerified: true, photoVerified: true,
};

const hashtags = (body: string) =>
  [...body.matchAll(/#(\w+)/g)].map((m) => m[1].toLowerCase());

function hang(partial: Omit<Hang, "hashtags" | "thanks" | "thankedByMe" | "comments" | "audienceAge" | "audiencePronouns"> & {
  thanks?: number; comments?: Hang["comments"];
  audienceAge?: [number, number] | null; audiencePronouns?: string[] | null;
}): Hang {
  return {
    thanks: 0, thankedByMe: false, comments: [], audienceAge: null, audiencePronouns: null,
    ...partial, hashtags: hashtags(partial.body),
  };
}

export function buildHangs(): Hang[] {
  return [
    hang({
      id: "h-coffee", type: "hangout", authorId: "maya",
      body: "Grabbing coffee and getting some work done at Compass Coffee on 7th — anyone want to co-work for a couple hours? ☕",
      venue: "Compass Coffee, Shaw", time: t(1), distanceM: 700, recurrence: null,
      communityId: null, audience: "everyone", capacity: null,
      goingIds: ["sam", "priya"], interestedIds: ["dana"],
      comments: [{ id: "c1", authorId: "sam", body: "I'm by the window with a flag on my laptop 🙂", at: t(-0.2) }],
      saves: 0, savedByMe: false, createdAt: t(-0.3),
    }),
    hang({
      id: "tip-redline", type: "tip", authorId: "sam",
      body: "Heads up: Red Line is single-tracking between Dupont and Farragut North all weekend. Budget an extra 15 min. 🚇",
      venue: null, time: null, distanceM: 1300, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [], thanks: 4, saves: 2, savedByMe: false, createdAt: t(-0.75),
    }),
    hang({
      id: "h-soccer", type: "hangout", authorId: "jordan",
      body: "Pickup soccer at the Mall fields around 6. Casual, all skill levels, just bring water. Who's in? ⚽",
      venue: "National Mall, west fields", time: t(4), distanceM: 2100, recurrence: null,
      communityId: null, audience: "everyone", capacity: null,
      goingIds: ["chris", "dana", "leo", "ben"], interestedIds: ["emma", "omar"],
      comments: [
        { id: "c2", authorId: "chris", body: "Bringing an extra ball", at: t(-1) },
        { id: "c3", authorId: "dana", body: "First time — go easy 😅", at: t(-0.5) },
      ],
      saves: 0, savedByMe: false, createdAt: t(-1.5),
    }),
    hang({
      id: "tip-peaches", type: "tip", authorId: "priya",
      body: "The farmers market at Dupont Circle has the best peaches right now. Get there before noon, they sell out fast. 🍑",
      venue: null, time: null, distanceM: 900, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [], thanks: 2, saves: 1, savedByMe: false, createdAt: t(-2),
    }),
    hang({
      id: "h-trivia", type: "hangout", authorId: "leo",
      body: "New to DC and looking to meet people! Doing trivia at a bar in Adams Morgan tonight — come say hi, the more the merrier. 🍻",
      venue: "Town Tavern, Adams Morgan", time: t(6), distanceM: 1800, recurrence: null,
      communityId: null, audience: "everyone", audienceAge: [21, 30], capacity: 8,
      goingIds: ["jordan", "maya", "emma"], interestedIds: ["taylor", "ben"],
      comments: [
        { id: "c4", authorId: "emma", body: "Also new here — see everyone tonight!", at: t(-2) },
        { id: "c5", authorId: "taylor", body: "What time does it actually start?", at: t(-1.4) },
        { id: "c6", authorId: "leo", body: "Quiz kicks off 7:30, come at 7 to grab the table", at: t(-1.2) },
      ],
      saves: 0, savedByMe: false, createdAt: t(-3),
    }),
    hang({
      id: "tip-protest", type: "tip", authorId: "dana",
      body: "Avoid 14th St NW around 5–6pm — protest march is routing through there. Side streets are clear. 🚶",
      venue: null, time: null, distanceM: 600, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [], thanks: 3, saves: 0, savedByMe: false, createdAt: t(-4),
    }),
    hang({
      id: "h-run", type: "hangout", authorId: "emma",
      body: "Anyone up for a morning run along the Tidal Basin tomorrow? Easy 5k, meet by the MLK memorial at 7am. 🏃",
      venue: "MLK Memorial, Tidal Basin", time: t(16), distanceM: 2600, recurrence: "Weekly",
      communityId: null, audience: "everyone", capacity: null,
      goingIds: ["grace", "ben", "dev"], interestedIds: ["chris"],
      saves: 0, savedByMe: false, createdAt: t(-5),
    }),
    hang({
      id: "h-climb", type: "hangout", authorId: "grace",
      body: "Beginner bouldering intro at Movement on Saturday — I'll show you the ropes (well, no ropes). First-timers especially welcome! 🧗",
      venue: "Movement, Navy Yard", time: t(26), distanceM: 3700, recurrence: null,
      communityId: null, audience: "everyone", capacity: 4,
      goingIds: ["dev", "nia", "omar", "taylor"], interestedIds: ["ben"],
      saves: 0, savedByMe: false, createdAt: t(-8),
    }),
    hang({
      id: "h-past", type: "hangout", authorId: "dev",
      body: "Board game night at my place in Navy Yard. Got Catan, Codenames, and snacks. 🎲",
      venue: "Navy Yard", time: t(-20), distanceM: 3700, recurrence: null,
      communityId: null, audience: "everyone", capacity: 6,
      goingIds: ["me", "jordan", "nia"], interestedIds: [],
      saves: 0, savedByMe: false, createdAt: t(-44),
    }),
    hang({
      id: "h-brunch", type: "hangout", authorId: "taylor",
      body: "Sunday brunch crew? Thinking Eastern Market then walking around Capitol Hill. Looking for 2–3 more people. 🥞",
      venue: "Eastern Market, Capitol Hill", time: t(40), distanceM: 3100, recurrence: null,
      communityId: null, audience: "everyone", capacity: 4,
      goingIds: ["dana", "grace"], interestedIds: ["priya"],
      saves: 0, savedByMe: false, createdAt: t(-14),
    }),
    hang({
      id: "h-picnic", type: "hangout", authorId: "priya",
      body: "Low-key picnic on the Georgetown waterfront Sunday afternoon — I'll bring bread, you bring anything. 🧺",
      venue: "Georgetown Waterfront", time: t(45), distanceM: 2900, recurrence: null,
      communityId: null, audience: "connections", capacity: null,
      goingIds: ["sam"], interestedIds: [],
      saves: 0, savedByMe: false, createdAt: t(-6),
    }),
    hang({
      id: "h-runclub", type: "hangout", authorId: "leo",
      body: "Run Club DMV Saturday social run — 4 easy miles from Meridian Hill, coffee after. All paces welcome!",
      venue: "Meridian Hill Park", time: t(60), distanceM: 1600, recurrence: "Weekly",
      communityId: "c-runclub", audience: "everyone", capacity: null,
      goingIds: ["emma", "chris", "sam"], interestedIds: [],
      saves: 0, savedByMe: false, createdAt: t(-9),
    }),
    // City starter pack (the City Guide is never empty for a newcomer)
    hang({
      id: "tip-dacha", type: "tip", authorId: "nia",
      body: "Best happy hour downtown: Wednesdays at Dacha Beer Garden — half-price steins 4–7. #happyhour #drinks",
      venue: null, time: null, distanceM: 1100, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [],
      thanks: 5, saves: 4, savedByMe: true, createdAt: t(-30),
    }),
    hang({
      id: "tip-smartrip", type: "tip", authorId: "omar",
      body: "New to DC? Put a SmarTrip card in Apple Wallet, not plastic — just tap straight through the faregates. #transit #newintown",
      venue: null, time: null, distanceM: 500, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [], thanks: 4, saves: 3, savedByMe: false, createdAt: t(-36),
    }),
    hang({
      id: "tip-museums", type: "tip", authorId: "ben",
      body: "Free museums aren't a myth here — the whole Smithsonian is $0. Start with Air & Space, go early. #freebies #thingstodo",
      venue: null, time: null, distanceM: 2200, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [], thanks: 2, saves: 2, savedByMe: false, createdAt: t(-42),
    }),
    hang({
      id: "tip-chili", type: "tip", authorId: "omar",
      body: "Cheap eats: the half-smoke at Ben's Chili Bowl on U St is a rite of passage. Cash moves the line fastest. #food #hiddengems",
      venue: null, time: null, distanceM: 1500, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [], thanks: 3, saves: 1, savedByMe: false, createdAt: t(-48),
    }),
    hang({
      id: "tip-rockcreek", type: "tip", authorId: "grace",
      body: "Sunday runners: Rock Creek Park trails beat the Mall — shaded, car-free, and you'll actually meet people. #fitness #outdoors",
      venue: null, time: null, distanceM: 2700, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [], thanks: 2, saves: 1, savedByMe: false, createdAt: t(-54),
    }),
    hang({
      id: "tip-rent", type: "tip", authorId: "dana",
      body: "Rent tip: a place on the Metro beats a cheaper one a 20-min walk away — DC summers and winters are real. #housing #newintown",
      venue: null, time: null, distanceM: 1900, recurrence: null, communityId: null,
      audience: "everyone", capacity: null, goingIds: [], interestedIds: [], thanks: 1, saves: 1, savedByMe: false, createdAt: t(-66),
    }),
  ];
}

export function buildThreads(): Thread[] {
  return [
    {
      id: "t-past", kind: "hangout", hangId: "h-past", withId: null, lastReadAt: t(0),
      messages: [
        { id: "m1", fromId: "dev", body: "Thanks for coming everyone — that was a blast 🎲", at: t(-18), kind: "text" },
        { id: "m2", fromId: "jordan", body: "That last Codenames round 😂😂", at: t(-17.8), kind: "text" },
        { id: "m3", fromId: "me", body: "So fun. Thanks for hosting Dev!", at: t(-17.5), kind: "text" },
        { id: "m4", fromId: "nia", body: "Same crew again soon?", at: t(-17), kind: "text" },
      ],
    },
    {
      id: "t-dm-sam", kind: "dm", hangId: null, withId: "sam", lastReadAt: t(-3),
      messages: [
        { id: "m5", fromId: "me", body: "Good seeing you Saturday man", at: t(-26), kind: "text" },
        { id: "m6", fromId: "sam", body: "Likewise! We should hit that ramen spot", at: t(-25), kind: "text" },
        { id: "m7", fromId: "sam", body: "Yo — you going to Leo's trivia tonight?", at: t(-2), kind: "text" },
      ],
    },
  ];
}

export function buildNotifs(): Notif[] {
  return [
    { id: "n1", kind: "request", fromId: "chris", hangId: null, body: null, at: t(-1), read: false },
    { id: "n2", kind: "accepted", fromId: "sam", hangId: null, body: null, at: t(-26), read: false },
    { id: "n3", kind: "invite", fromId: "emma", hangId: "h-run", body: "Tidal Basin run is on again tomorrow 7am", at: t(-5), read: false },
    { id: "n4", kind: "joined_nearby", fromId: "omar", hangId: null, body: "you both know Sam", at: t(-30), read: true },
    { id: "n5", kind: "reminder", fromId: null, hangId: "h-trivia", body: "Tonight: trivia at Town Tavern, 7 PM — 3 going", at: t(-2), read: true },
    { id: "n6", kind: "digest", fromId: null, hangId: null, body: "Your week nearby: 7 hangouts, 3 new neighbors, 8 fresh tips", at: t(-50), read: true },
  ];
}

export function buildCommunities(): Community[] {
  return [
    { id: "c-newtodc", name: "New to DC", emoji: "👋", desc: "Just moved? Start here — weekly meetups + people in the same boat.", members: 67, joined: false },
    { id: "c-runclub", name: "Run Club DMV", emoji: "🏃", desc: "Easy-pace social runs around the District — all paces, coffee after.", members: 41, joined: false },
    { id: "c-boulder", name: "DC Boulderers", emoji: "🧗", desc: "Climbing + gym sessions. Beginners always welcome.", members: 24, joined: false },
    { id: "c-supper", name: "DC Supper Club", emoji: "🍜", desc: "Six strangers, one table, somewhere new every other week.", members: 18, joined: false },
  ];
}

export const DEMO_EDGES: Record<string, EdgeState> = { sam: "connected", priya: "connected", chris: "in" };

export const FAMILIAR: FamiliarEntry[] = [
  { id: "chris", count: 2, lastVenue: "National Mall, west fields" },
];

/** Daily picks order — reasons render from profile overlap, never a score. */
export const PICK_IDS = ["maya", "grace", "emma", "dev", "leo"];

export const PYMK_IDS = ["taylor", "dana"];
