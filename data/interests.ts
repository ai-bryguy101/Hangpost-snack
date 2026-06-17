/** The vocabulary behind the "What are you into?" page. Grouped so the picker
 * reads as themed sections (engaging, scannable) instead of one flat wall of
 * chips. The richer this is, the more signal the connections engine gets — and
 * the better the hangouts and tips we can suggest. Free-text "add your own"
 * (in GroupedTagPicker) is the escape hatch for the niche stuff no list can
 * hold (that one indie band only you know). */

export type TagGroup = {
  label: string;
  emoji: string;
  options: string[];
};

/** Hobbies — things you ACTUALLY do, ideally weekly. */
export const HOBBY_GROUPS: TagGroup[] = [
  {
    label: "Sports & fitness",
    emoji: "🏃",
    options: [
      "running", "lifting", "yoga", "pilates", "climbing", "bouldering", "cycling",
      "swimming", "tennis", "pickleball", "basketball", "soccer", "volleyball",
      "boxing", "martial arts", "golf", "spin",
    ],
  },
  {
    label: "Outdoors",
    emoji: "🏞️",
    options: [
      "hiking", "trail running", "camping", "backpacking", "kayaking", "surfing",
      "skiing", "snowboarding", "fishing", "gardening", "birdwatching",
    ],
  },
  {
    label: "Making & creating",
    emoji: "🎨",
    options: [
      "photography", "painting", "drawing", "pottery", "knitting", "woodworking",
      "sewing", "calligraphy", "journaling", "film photography", "DIY",
    ],
  },
  {
    label: "Music & stage",
    emoji: "🎸",
    options: [
      "guitar", "piano", "singing", "producing music", "DJing", "drums",
      "improv", "theater", "dancing",
    ],
  },
  {
    label: "Food & drink",
    emoji: "🍳",
    options: [
      "cooking", "baking", "coffee brewing", "mixology", "wine tasting",
      "craft beer", "trying new restaurants",
    ],
  },
  {
    label: "Games & mind",
    emoji: "🎲",
    options: ["board games", "video games", "D&D", "chess", "trivia", "puzzles", "poker"],
  },
];

/** Interests — scenes and things you're drawn to around town. */
export const INTEREST_GROUPS: TagGroup[] = [
  {
    label: "Going out",
    emoji: "🌃",
    options: [
      "live music", "concerts", "happy hours", "dive bars", "dancing",
      "comedy shows", "festivals", "karaoke",
    ],
  },
  {
    label: "Culture",
    emoji: "🎭",
    options: [
      "museums", "art galleries", "indie films", "theater", "bookstores",
      "history", "architecture",
    ],
  },
  {
    label: "Food scene",
    emoji: "🍜",
    options: [
      "coffee shops", "food trucks", "farmers markets", "brunch", "supper clubs",
      "street food",
    ],
  },
  {
    label: "Community & causes",
    emoji: "🤝",
    options: [
      "volunteering", "run clubs", "book clubs", "climate", "mutual aid",
      "faith community", "LGBTQ+ community",
    ],
  },
  {
    label: "Ideas & hustle",
    emoji: "💡",
    options: [
      "startups", "tech", "design", "investing", "writing", "podcasting",
      "side projects", "languages",
    ],
  },
  {
    label: "Wellness",
    emoji: "🧘",
    options: [
      "meditation", "saunas", "cold plunge", "sober-curious", "therapy-positive",
      "breathwork",
    ],
  },
];

/** Likes — your taste, the stuff you could talk about all night. This is where
 * the niche signal lives: music genres, the artists on heavy rotation, screen,
 * and reading/pods. Add-your-own is the point here. */
export const LIKE_GROUPS: TagGroup[] = [
  {
    label: "Music you love",
    emoji: "🎵",
    options: [
      "indie rock", "hip-hop", "jazz", "electronic", "house", "techno", "R&B",
      "pop", "country", "classical", "metal", "punk", "folk", "k-pop",
      "afrobeats", "lo-fi", "shoegaze", "hyperpop",
    ],
  },
  {
    label: "Artists on repeat",
    emoji: "🎧",
    options: [
      "Phoebe Bridgers", "Mac DeMarco", "Tame Impala", "SZA", "Frank Ocean",
      "Bon Iver", "Fred again..", "Alex G", "Clairo", "MJ Lenderman",
    ],
  },
  {
    label: "Screen",
    emoji: "🎬",
    options: [
      "A24 films", "sci-fi", "fantasy", "anime", "K-dramas", "true crime",
      "documentaries", "horror", "rom-coms", "reality TV",
    ],
  },
  {
    label: "Reading & pods",
    emoji: "📚",
    options: [
      "fantasy novels", "sci-fi books", "literary fiction", "memoirs", "poetry",
      "manga", "true crime pods", "history pods", "comedy pods",
    ],
  },
];
