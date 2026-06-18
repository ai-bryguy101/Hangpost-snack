import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  buildCommunities,
  buildHangs,
  buildNotifs,
  buildStatuses,
  buildThreads,
  DEMO_EDGES,
  DEMO_ME,
  FAMILIAR,
  PEOPLE,
  PICK_IDS,
  PYMK_IDS,
  t,
} from "../data/seed";
import { computeExpiry } from "../data/statuses";

/** The whole prototype's world state + every mutation the UI performs.
 * Synchronous on purpose — this build is for feeling the flows, not for
 * simulating the network (the mirror does that). */

export interface Person {
  id: string;
  name: string;
  handle: string;
  avatar: string | null;
  verified: boolean;
  intro: string | null;
  age: number | null;
  pronouns: string | null;
  hometown: string | null;
  college: string | null;
  /** Critical background signals just under hometown & college (operator). */
  major: string | null;
  job: string | null;
  hobbies: string[];
  interests: string[];
  likes: string[];
  newSince: string | null;
  sharedContacts: string[];
  /** Show-up signal: positive-only (badge + count, never a public %). */
  reliable?: boolean;
  attended?: number;
}

/** Notification preferences. `push` stands in for the OS-level permission —
 * off until the user says yes to the staged ask (after their first "I'm in",
 * never at install — asks come after the aha, PRODUCT_STRATEGY §1). */
export interface NotifPrefs {
  push: boolean;
  reminders: boolean;
  requests: boolean;
  digest: boolean;
  nearby: boolean;
}

export interface Me extends Person {
  homeLabel: string;
  radiusMi: number;
  newInTown: boolean;
  planShare: boolean;
  phoneVerified: boolean;
  photoVerified: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  at: string;
}

export type Audience = "everyone" | "connections" | "invite";

export interface Hang {
  id: string;
  type: "hangout" | "tip";
  authorId: string;
  body: string;
  venue: string | null;
  time: string | null;
  distanceM: number | null;
  /** Display label: "Daily", "Weekly", "Mon · Wed · Fri", or null = one-off. */
  recurrence: string | null;
  communityId: string | null;
  audience: Audience;
  /** Optional demographic refinements for "everyone" posts (poster-side). */
  audienceAge: [number, number] | null;
  audiencePronouns: string[] | null;
  capacity: number | null;
  goingIds: string[];
  interestedIds: string[];
  /** "Thanks!" on tips — the helpfulness signal (replaces emoji reactions). */
  thanks: number;
  thankedByMe: boolean;
  saves: number;
  savedByMe: boolean;
  comments: Comment[];
  hashtags: string[];
  createdAt: string;
}

export type MsgKind = "text" | "checkin" | "icebreaker";

export interface Msg {
  id: string;
  fromId: string;
  body: string;
  at: string;
  kind: MsgKind;
}

export interface Thread {
  id: string;
  kind: "hangout" | "dm";
  hangId: string | null;
  withId: string | null;
  messages: Msg[];
  lastReadAt: string | null;
}

export type NotifKind =
  | "request"
  | "accepted"
  | "rsvp"
  | "invite"
  | "joined_nearby"
  | "reminder"
  | "digest"
  | "comment"
  | "status";

export interface Notif {
  id: string;
  kind: NotifKind;
  fromId: string | null;
  hangId: string | null;
  body: string | null;
  at: string;
  read: boolean;
}

export type StatusKind = "going_out" | "active" | "cowork" | "food" | "open";

/** One-tap "I'm around" availability broadcast to your connections — ephemeral
 * and no-rejection (brief: Hangpost-Full-Stack/docs/briefs/STATUS_POSTS.md). One
 * active per user; posting a new one supersedes the last. Connection-scoped
 * only — never shown to nearby strangers (the key safety line vs a public post). */
export interface UserStatus {
  id: string;
  userId: string;
  kind: StatusKind;
  body: string;
  createdAt: string;
  expiresAt: string;
  /** "tonight" | "this weekend" | "tomorrow" — drives display + auto-expiry. */
  expiresLabel: string;
  /** emoji -> reactor ids (mock; one reaction per person). */
  reactions: Record<string, string[]>;
  /** connection ids who tapped "I'm around too". */
  aroundIds: string[];
}

export interface Community {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  members: number;
  joined: boolean;
}

export type EdgeState = "out" | "in" | "connected";

export interface FamiliarEntry {
  id: string;
  count: number;
  lastVenue: string;
}

export interface CreateHangInput {
  type: "hangout" | "tip";
  body: string;
  venue: string | null;
  time: string | null;
  capacity: number | null;
  recurrence: string | null;
  audience: Audience;
  audienceAge: [number, number] | null;
  audiencePronouns: string[] | null;
  inviteIds: string[];
  communityId: string | null;
}

interface StoreApi {
  me: Me;
  people: Record<string, Person>;
  hangs: Hang[];
  threads: Thread[];
  notifs: Notif[];
  communities: Community[];
  edges: Record<string, EdgeState>;
  blocked: string[];
  dismissedMet: string[];
  contactsSynced: boolean;
  firstRun: boolean;
  notifPrefs: NotifPrefs;
  /** One-shot: has the staged notification ask already been shown? */
  notifAsked: boolean;
  familiar: FamiliarEntry[];
  pickIds: string[];
  pymkIds: string[];
  statuses: Record<string, UserStatus>;

  personOf: (id: string) => Person;
  hangOf: (id: string) => Hang | undefined;
  threadOf: (id: string) => Thread | undefined;
  threadForHang: (hangId: string) => Thread | undefined;
  unreadNotifs: () => number;
  unreadThreads: () => number;
  myUpcoming: () => Hang[];
  myStatus: () => UserStatus | null;
  connectionStatuses: () => UserStatus[];

  dismissFirstRun: () => void;
  rsvp: (hangId: string, status: "going" | "interested") => void;
  withdraw: (hangId: string) => void;
  thank: (hangId: string) => void;
  toggleSave: (hangId: string) => void;
  addComment: (hangId: string, body: string) => void;
  createHang: (input: CreateHangInput) => string;
  reconvene: (hangId: string) => string;
  connect: (personId: string) => void;
  accept: (personId: string) => void;
  removeEdge: (personId: string) => void;
  dismissMet: (personId: string) => void;
  block: (personId: string) => void;
  unblock: (personId: string) => void;
  syncContacts: () => number;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
  createCommunity: (name: string, emoji: string, desc: string) => string;
  sendMessage: (threadId: string, body: string, kind?: MsgKind) => void;
  markThreadRead: (threadId: string) => void;
  openDm: (personId: string) => string | null;
  readNotif: (id: string) => void;
  readAllNotifs: () => void;
  saveProfile: (patch: Partial<Me>) => void;
  setHomeBase: (label: string, radiusMi: number) => void;
  toggleNewInTown: () => void;
  togglePlanShare: () => void;
  markNotifAsked: () => void;
  enablePush: () => void;
  toggleNotifPref: (key: keyof NotifPrefs) => void;
  checkin: (threadId: string, note: string) => void;
  postStatus: (kind: StatusKind, body: string) => void;
  clearStatus: () => void;
  reactStatus: (userId: string, emoji: string) => void;
  toggleAround: (userId: string) => void;
  setMe: (me: Me) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

let nextId = 1000;
const newId = (prefix: string) => `${prefix}-${nextId++}`;
const now = () => new Date().toISOString();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [me, setMeState] = useState<Me>(DEMO_ME);
  const [hangs, setHangs] = useState<Hang[]>(buildHangs);
  const [threads, setThreads] = useState<Thread[]>(buildThreads);
  const [notifs, setNotifs] = useState<Notif[]>(buildNotifs);
  const [communities, setCommunities] = useState<Community[]>(buildCommunities);
  const [edges, setEdges] = useState<Record<string, EdgeState>>(DEMO_EDGES);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [dismissedMet, setDismissedMet] = useState<string[]>([]);
  const [contactsSynced, setContactsSynced] = useState(false);
  const [firstRun, setFirstRun] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    push: false,
    reminders: true,
    requests: true,
    digest: true,
    nearby: true,
  });
  const [notifAsked, setNotifAsked] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>(buildStatuses);

  const personOf = useCallback(
    (id: string): Person => (id === "me" ? me : PEOPLE[id]),
    [me],
  );

  const patchHang = useCallback((hangId: string, patch: (h: Hang) => Hang) => {
    setHangs((hs) => hs.map((h) => (h.id === hangId ? patch(h) : h)));
  }, []);

  const patchThread = useCallback((threadId: string, patch: (th: Thread) => Thread) => {
    setThreads((ts) => ts.map((th) => (th.id === threadId ? patch(th) : th)));
  }, []);

  const ensureHangThread = useCallback(
    (hang: Hang): string => {
      const existing = threads.find((th) => th.hangId === hang.id);
      if (existing) return existing.id;
      const id = newId("t");
      setThreads((ts) => [
        ...ts,
        { id, kind: "hangout", hangId: hang.id, withId: null, messages: [], lastReadAt: now() },
      ]);
      return id;
    },
    [threads],
  );

  const api = useMemo<StoreApi>(() => {
    const hangOf = (id: string) => hangs.find((h) => h.id === id);
    const threadOf = (id: string) => threads.find((th) => th.id === id);
    const threadForHang = (hangId: string) => threads.find((th) => th.hangId === hangId);

    return {
      me, people: PEOPLE, hangs, threads, notifs, communities, edges, blocked,
      dismissedMet, contactsSynced, firstRun, notifPrefs, notifAsked,
      familiar: FAMILIAR, pickIds: PICK_IDS, pymkIds: PYMK_IDS, statuses,

      personOf, hangOf, threadOf, threadForHang,

      unreadNotifs: () => notifs.filter((n) => !n.read).length,
      unreadThreads: () =>
        threads.filter((th) =>
          th.messages.some(
            (m) => m.fromId !== "me" && (th.lastReadAt === null || m.at > th.lastReadAt),
          ),
        ).length,
      myUpcoming: () =>
        hangs
          .filter((h) => h.type === "hangout" && (h.goingIds.includes("me") || h.authorId === "me"))
          .filter((h) => h.time !== null && new Date(h.time).getTime() > Date.now() - 3 * 3600_000)
          .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "")),

      myStatus: () => {
        const s = statuses["me"];
        return s && new Date(s.expiresAt).getTime() > Date.now() ? s : null;
      },
      connectionStatuses: () =>
        Object.values(statuses)
          .filter((s) => s.userId !== "me")
          .filter((s) => edges[s.userId] === "connected" && !blocked.includes(s.userId))
          .filter((s) => new Date(s.expiresAt).getTime() > Date.now())
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      dismissFirstRun: () => setFirstRun(false),

      markNotifAsked: () => setNotifAsked(true),
      enablePush: () => setNotifPrefs((p) => ({ ...p, push: true })),
      toggleNotifPref: (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] })),

      rsvp: (hangId, status) => {
        const hang = hangOf(hangId);
        if (!hang) return;
        patchHang(hangId, (h) => ({
          ...h,
          goingIds:
            status === "going"
              ? [...new Set([...h.goingIds, "me"])]
              : h.goingIds.filter((x) => x !== "me"),
          interestedIds:
            status === "interested"
              ? [...new Set([...h.interestedIds, "me"])]
              : h.interestedIds.filter((x) => x !== "me"),
        }));
        if (status === "going") ensureHangThread(hang);
      },

      withdraw: (hangId) => {
        patchHang(hangId, (h) => ({
          ...h,
          goingIds: h.goingIds.filter((x) => x !== "me"),
          interestedIds: h.interestedIds.filter((x) => x !== "me"),
        }));
        const th = threadForHang(hangId);
        const hang = hangOf(hangId);
        if (th && hang && hang.authorId !== "me") {
          setThreads((ts) => ts.filter((x) => x.id !== th.id));
        }
      },

      thank: (hangId) =>
        patchHang(hangId, (h) =>
          h.thankedByMe ? h : { ...h, thankedByMe: true, thanks: h.thanks + 1 },
        ),

      toggleSave: (hangId) =>
        patchHang(hangId, (h) => ({
          ...h,
          savedByMe: !h.savedByMe,
          saves: h.saves + (h.savedByMe ? -1 : 1),
        })),

      addComment: (hangId, body) =>
        patchHang(hangId, (h) => ({
          ...h,
          comments: [...h.comments, { id: newId("c"), authorId: "me", body, at: now() }],
        })),

      createHang: (input) => {
        const id = newId("h");
        const hang: Hang = {
          id,
          type: input.type,
          authorId: "me",
          body: input.body,
          venue: input.venue,
          time: input.type === "hangout" ? (input.time ?? now()) : null,
          distanceM: 0,
          recurrence: input.type === "hangout" ? input.recurrence : null,
          communityId: input.communityId,
          audience: input.audience,
          audienceAge: input.type === "hangout" ? input.audienceAge : null,
          audiencePronouns: input.type === "hangout" ? input.audiencePronouns : null,
          capacity: input.type === "hangout" ? input.capacity : null,
          goingIds: [],
          interestedIds: [],
          thanks: 0,
          thankedByMe: false,
          saves: 0,
          savedByMe: false,
          comments: [],
          hashtags: [...input.body.matchAll(/#(\w+)/g)].map((m) => m[1].toLowerCase()),
          createdAt: now(),
        };
        setHangs((hs) => [hang, ...hs]);
        if (input.type === "hangout") {
          const tid = newId("t");
          setThreads((ts) => [
            ...ts,
            { id: tid, kind: "hangout", hangId: id, withId: null, messages: [], lastReadAt: now() },
          ]);
        }
        return id;
      },

      reconvene: (hangId) => {
        const src = hangOf(hangId);
        if (!src) return "";
        const id = newId("h");
        const nextTime = new Date(
          (src.time ? new Date(src.time).getTime() : Date.now()) + 7 * 24 * 3600_000,
        ).toISOString();
        setHangs((hs) => [
          {
            ...src,
            id,
            time: nextTime,
            recurrence: "Weekly",
            authorId: src.authorId,
            goingIds: src.goingIds.includes("me") || src.authorId === "me" ? ["me"] : [],
            interestedIds: [],
            thanks: 0,
            thankedByMe: false,
            comments: [],
            saves: 0,
            savedByMe: false,
            createdAt: now(),
          },
          ...hs,
        ]);
        return id;
      },

      connect: (personId) =>
        setEdges((e) => ({ ...e, [personId]: e[personId] === "in" ? "connected" : "out" })),

      accept: (personId) => setEdges((e) => ({ ...e, [personId]: "connected" })),

      removeEdge: (personId) =>
        setEdges((e) => {
          const next = { ...e };
          delete next[personId];
          return next;
        }),

      dismissMet: (personId) => setDismissedMet((d) => [...d, personId]),

      block: (personId) => {
        setBlocked((b) => [...new Set([...b, personId])]);
        setEdges((e) => {
          const next = { ...e };
          delete next[personId];
          return next;
        });
      },

      unblock: (personId) => setBlocked((b) => b.filter((x) => x !== personId)),

      syncContacts: () => {
        setContactsSynced(true);
        return PYMK_IDS.length;
      },

      joinCommunity: (id) =>
        setCommunities((cs) =>
          cs.map((c) => (c.id === id && !c.joined ? { ...c, joined: true, members: c.members + 1 } : c)),
        ),

      leaveCommunity: (id) =>
        setCommunities((cs) =>
          cs.map((c) => (c.id === id && c.joined ? { ...c, joined: false, members: c.members - 1 } : c)),
        ),

      createCommunity: (name, emoji, desc) => {
        const id = newId("c");
        setCommunities((cs) => [{ id, name, emoji, desc, members: 1, joined: true }, ...cs]);
        return id;
      },

      sendMessage: (threadId, body, kind = "text") =>
        patchThread(threadId, (th) => ({
          ...th,
          messages: [...th.messages, { id: newId("m"), fromId: "me", body, at: now(), kind }],
          lastReadAt: now(),
        })),

      markThreadRead: (threadId) =>
        patchThread(threadId, (th) => ({ ...th, lastReadAt: now() })),

      openDm: (personId) => {
        if (edges[personId] !== "connected") return null;
        const existing = threads.find((th) => th.kind === "dm" && th.withId === personId);
        if (existing) return existing.id;
        const id = newId("t");
        setThreads((ts) => [
          ...ts,
          { id, kind: "dm", hangId: null, withId: personId, messages: [], lastReadAt: now() },
        ]);
        return id;
      },

      readNotif: (id) =>
        setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n))),

      readAllNotifs: () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true }))),

      saveProfile: (patch) => setMeState((m) => ({ ...m, ...patch })),

      setHomeBase: (label, radiusMi) => setMeState((m) => ({ ...m, homeLabel: label, radiusMi })),

      toggleNewInTown: () => setMeState((m) => ({ ...m, newInTown: !m.newInTown })),

      togglePlanShare: () => setMeState((m) => ({ ...m, planShare: !m.planShare })),

      checkin: (threadId, note) =>
        patchThread(threadId, (th) => ({
          ...th,
          messages: [
            ...th.messages,
            {
              id: newId("m"),
              fromId: "me",
              body: note ? `📍 Checked in — ${note}` : "📍 Checked in",
              at: now(),
              kind: "checkin",
            },
          ],
          lastReadAt: now(),
        })),

      postStatus: (kind, body) => {
        const text = body.trim();
        if (!text) return;
        const { expiresAt, label } = computeExpiry(text);
        setStatuses((prev) => ({
          ...prev,
          me: {
            id: newId("st"),
            userId: "me",
            kind,
            body: text,
            createdAt: now(),
            expiresAt,
            expiresLabel: label,
            reactions: {},
            aroundIds: [],
          },
        }));
      },

      clearStatus: () =>
        setStatuses((prev) => {
          const next = { ...prev };
          delete next["me"];
          return next;
        }),

      reactStatus: (userId, emoji) =>
        setStatuses((prev) => {
          const s = prev[userId];
          if (!s) return prev;
          // One reaction per person: drop "me" everywhere, then toggle this one.
          const cleaned: Record<string, string[]> = {};
          let had = false;
          for (const [e, ids] of Object.entries(s.reactions)) {
            if (e === emoji && ids.includes("me")) had = true;
            const without = ids.filter((x) => x !== "me");
            if (without.length) cleaned[e] = without;
          }
          if (!had) cleaned[emoji] = [...(cleaned[emoji] ?? []), "me"];
          return { ...prev, [userId]: { ...s, reactions: cleaned } };
        }),

      toggleAround: (userId) =>
        setStatuses((prev) => {
          const s = prev[userId];
          if (!s) return prev;
          const has = s.aroundIds.includes("me");
          return {
            ...prev,
            [userId]: {
              ...s,
              aroundIds: has
                ? s.aroundIds.filter((x) => x !== "me")
                : [...s.aroundIds, "me"],
            },
          };
        }),

      setMe: (next) => {
        setMeState(next);
        setFirstRun(true);
      },
    };
  }, [
    me, hangs, threads, notifs, communities, edges, blocked, dismissedMet,
    contactsSynced, firstRun, notifPrefs, notifAsked, statuses, personOf,
    patchHang, patchThread, ensureHangThread,
  ]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export { t as seedTime };
