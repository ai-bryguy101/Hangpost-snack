# Hangpost — Snack mirror of the REAL native app (`apps/native`)

A browser-runnable copy of **what Expo Go shows today**, viewable at
[snack.expo.dev](https://snack.expo.dev) — so you can see and poke the
current state of the actual app without a phone or a Codespace.

> **How this differs from the root app:** the repo root holds the **target
> UX** — the complete product vision that runs *ahead* of the real app (flows +
> ideas, many not built yet). **This folder is the opposite: a faithful mirror
> of the native app as it exists right now**, same screens, same copy, same
> flows, same gaps. When the two look different, that difference IS the to-do
> list for porting prototype decisions into the real app.

## How to open it

This mirror lives in a subfolder, so the cleanest browser paths are:

1. **Codespace.** `cd snack-native-mirror && npm install && npx expo start
   --web` — the forwarded port opens it in a browser tab; `--tunnel` + Expo Go
   for a phone.
2. **Snack.** Go to <https://snack.expo.dev> → new Snack → drag the
   `snack-native-mirror/` files into the editor panel. (Snack's git import reads
   the repo root, which is the *full-vision* app — not this mirror.)

> ⚠️ Import only from a **slash-free branch** (i.e. after merging to
> `main`). Snack misparses `…/tree/claude/branch-name/…` URLs (it reads
> the branch as just `claude`) — same gotcha as the `snack/` folder.
>
> ⚠️ `app.json` deliberately has NO `sdkVersion` pin: Snack drops old
> SDKs, and a stale pin fails the import with "SDK version not
> supported". Unpinned, Snack picks its current default — nothing in
> this folder depends on a specific SDK. If an import ever errors on a
> dependency, accept Snack's suggested version in the prompt it shows.

## What you'll see (mirrors `apps/native` 1:1)

- **Signed-out gates** on every tab → **Sign in** (mock auth):
  - **Sign in** = a returning demo account (profile + DC home base +
    a small coherent graph: 2 connections, 1 incoming request,
    1 "met at trivia" suggestion, 1 familiar face, 2 unread alerts).
  - **Create an account** = the REAL new-user path: email code →
    onboarding (profile + home base + radius) → empty-state app,
    exactly like a fresh sign-up on live.
- **Feed** with the four lenses — Nearby · This week · City Guide
  (helpfulness-ranked, searchable, City Expert badges) · Communities —
  scoped to your saved home base, with the set/change home-base flow.
- **PostCard** with emoji reactions, saves/bookmarks, going +
  interested RSVPs (going drops you into the hangout's group chat),
  Thanks! on tips, and the ··· report/block menu (blocking really hides
  the person everywhere, like live).
- **Composer** incl. "Make it weekly" (ADR-0015) and posting an event
  into a community (ADR-0011). Your post lands at the top of the feed.
- **Connections** (daily picks with match % + why-chips + tier blurb +
  Connect/Message), **My connections** (new-in-town toggle, contact
  import → People you may know, New here, People you met, Familiar
  faces, Requests, Connections), **Alerts** (tap-to-read, mark-all,
  Accept), **Messages inbox + chat**, **Profile + edit + home base**.
- The **live data quirks**, on purpose: DMs 403 until a request is
  accepted ("Not connected yet"), photo upload → "Photos not enabled
  yet" (R2 unconfigured on live), recommendations empty until a profile
  exists.

The post corpus is the **actual DC seed** the live API serves
(`apps/api/src/hangpost_api/seed_posts.py`): the 12 prototype posts +
the 8-tip city starter pack, with timestamps rebuilt relative to now.

## What's swapped out (and why)

| Real thing | Snack can't | Mirror uses |
|---|---|---|
| `@clerk/clerk-expo` | native modules + secret key | `lib/auth.tsx` (any email/password works; both personas above) |
| `@hangpost/api-client` → live Render API | workspace `file:` dep; Clerk-locked endpoints; CORS | `lib/mockApi.ts` — same function names/signatures over in-memory state with simulated latency, mirroring live server semantics |
| `expo-router` (file-based) | needs its babel/metro setup | `lib/router.tsx` — tiny stack router with the same `useRouter` / `useLocalSearchParams` call shapes |
| NativeWind v4 `className` | custom babel config ignored | `StyleSheet` + `theme/colors.ts` (same brand hex as `apps/native/tailwind.config.js`) |
| `expo-contacts` + `expo-crypto` hashing | no contacts in a browser | simulated hash list → same "Found N already on Hangpost" flow |
| RN `Alert.alert` | **no-op in react-native-web** | `lib/dialog.tsx` — same API, renders a real dialog on web + device |
| `expo-image-picker` → R2 presigned PUT | R2 isn't configured on live anyway | "Add photo" goes straight to live's current 503 → "Photos not enabled yet" |

Known, deliberate divergences from live (each is a *data* state, not a
UI difference): the demo persona ships with a seeded social graph so
every lane renders (a fresh live account has empty lanes — use "Create
an account" to see that exactly); seed posts here have group chats when
you RSVP, whereas on live the 12 *seeded* posts predate messaging so
only in-app-created hangouts get chats; seed tips carry a few reactions
/saves so City Guide ranking + the City Expert badge are visible.

## File map (mirrors `apps/native`)

```
App.tsx                      ← providers + (tabs) shell + stack  (app/_layout.tsx + (tabs)/_layout.tsx)
screens/FeedScreen.tsx       ← app/(tabs)/index.tsx
screens/ConnectionsScreen.tsx← app/(tabs)/connections.tsx
screens/AlertsScreen.tsx     ← app/(tabs)/alerts.tsx
screens/ProfileScreen.tsx    ← app/(tabs)/profile.tsx
screens/SignInScreen.tsx     ← app/sign-in.tsx        (Clerk → mock)
screens/OnboardingScreen.tsx ← app/onboarding.tsx
screens/CreatePostScreen.tsx ← app/create.tsx
screens/ProfileEditScreen.tsx← app/profile-edit.tsx   (picker → live 503 path)
screens/SetLocationScreen.tsx← app/set-location.tsx
screens/MessagesScreen.tsx   ← app/messages.tsx
screens/ChatScreen.tsx       ← app/chat/[threadId].tsx
screens/ConnectionsListScreen.tsx ← app/connections-list.tsx
screens/CommunityScreen.tsx  ← app/community/[communityId].tsx
screens/CommunityNewScreen.tsx ← app/community-new.tsx
components/…                 ← components/… (PostCard, ConnectionCard, SafetyMenu,
                               CommunitiesTab, PlacePicker, ui/Button|Chip|Avatar)
components/TabBar.tsx        ← the expo-router <Tabs> bar, hand-rolled
lib/mockApi.ts + data/seed.ts← @hangpost/api-client + the live API + DC seed
lib/auth.tsx · lib/router.tsx · lib/dialog.tsx ← Clerk · expo-router · Alert
lib/types.ts · lib/format.ts · lib/places.ts   ← copied verbatim from the real packages
```

Keep this folder in sync with `apps/native` when screens change — it's
a mirror, not a playground. New UI/UX exploration belongs in the root app
(the full vision).
