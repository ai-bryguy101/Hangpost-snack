# Hangpost — Snack (UI/UX prototype)

**Hangpost is a location-based social app for making new friends in your current
city — the app you download when you move somewhere new.** A city-scoped
posterboard feed, explainable daily friend picks, and low-lift "post a hangout →
tap *I'm in*" group meetups.

This repo is the **public, browser-runnable prototype** — every screen and flow
on **mock data only**. There is no backend here: no real accounts, no API keys,
no secrets. It exists so you can open the app in a browser, walk the whole
journey, and judge how it *feels* — then iterate on the look and function before
wiring it into the native iOS app. Production code lives in the private
`hangpost-full-stack` repo.

## This is the design source of truth

**`/` (repo root) is the COMPLETE product vision — the target UX, and the one
place the design is iterated.** Every designed flow plus the research-backed
pieces a friend-making app needs. There are no other copies to keep in sync:
the old `snack-full/` / `snack-native-mirror/` duplicates were retired on
2026-06-18 so this repo is the single canonical design surface.

### The pipeline (where this fits)

```
DESIGN (here)        →  PORT                       →  WIRE                    →  SHIP
Hangpost-snack          hangpost-full-stack/          hangpost-full-stack/       EAS Build →
(this repo, Snack,      apps/native                   apps/api                   TestFlight →
 mock data)             (Expo + NativeWind)           (FastAPI backend)          App Store
```

Iterate the design here until a flow feels finished, then port it into
`hangpost-full-stack/apps/native` and wire it to the API. **The porting backlog
is the diff between this repo and `apps/native`** (screens/components that exist
here but not there yet — e.g. PersonProfile, PostDetail, Search, Settings,
Legal, Welcome, the richer tag-pickers, and the "The Bulletin" feed rename).

## Open it

Now that this repo is public, the browser paths all work again:

1. **Snack (fastest).** Go to <https://snack.expo.dev> → project menu (☰) →
   **Import git repository** → paste `https://github.com/ai-bryguy101/hangpost-snack`.
   The app boots in the web preview; switch to **iOS / Android** for a
   simulated device, or **My Device** to open it in Expo Go via QR.
2. **Codespace.** Open a Codespace on this repo, then `npm install &&
   npx expo start --web`. For your phone: `npx expo start --tunnel` and
   scan the QR with Expo Go.

> ⚠️ **Import from a slash-free branch** (i.e. `main`). Snack misparses
> `…/tree/claude/branch-name/…` URLs — it reads the branch as just `claude`.
> Once these files are on `main`, the import above just works.
>
> ⚠️ `app.json` deliberately has **no `sdkVersion` pin** — Snack drops old SDKs
> and a stale pin fails the import. Unpinned, Snack uses its current default;
> nothing here depends on a specific SDK. If an import errors on a dependency,
> accept Snack's suggested version in the prompt.
>
> ⚠️ **Keep the repo to `.tsx` / `.ts` / `.json` / `.md` files only.** Snack treats
> an unknown extension (e.g. a `.mjs` build script) as a binary *asset* and the
> import dies with *"Failed to upload file asset."* Dev utilities live as snippets
> in docs (see `COLLEGES.md`), never as committed script files.

## The full journey to walk (root app)

**Entry:** Welcome (brand + group-first safety framing) → *Get started* → phone
verification (any 6 digits) → 5-step onboarding: about (incl. **birthday — hard
18+ gate**, plus **major + job**, the background signals right under hometown &
college) → tag pickers (hobbies / interests / likes — type your own at the top or
tap an idea, all structured, no free bio) → 140-char intro + photo + "verify it's
you" → home base + radius + "I'm
new in town" → contacts sync with consent copy → **your first 10** (connections
worth exploring, ranked, connect before you even see the feed). Or *I have an
account* → straight in as a demo persona with a believable week of history.

**Feed:** liveness strip + a horizontal **Happening today** rail · three lenses
(The Bulletin / City Guide / Communities; "This week" merged into The Bulletin 2026-06-17) ·
first-run welcome nudge · **no
emoji reactions, by design** — hangouts carry *Interested* / *I'm in*, tips carry
*Thanks!* (which powers City Guide ranking + the City Expert badge) · City Guide
with search + hashtag chips + saved-tips filter + City Expert badges · post
detail with comments, the full who's-going list ("usually shows up" hints),
group-chat door, and **Share my plan** (send time/place/people to someone you
trust).

**Statuses (top of the feed):** **"What are you up to?"** → one-tap availability
presets (or write your own) that only your connections see and that auto-expire,
plus **🌙 Who's free** and the **Tonight** surface, where a status becomes a
react, an *"I'm around too,"* a reply, or a plan — the no-rejection on-ramp to an
actual hang, a rung below hosting a hangout.

**The hangout loop:** I'm in → toast → it's on your private **Your hangouts**
agenda and you're in the group chat. Chat has the **plan pinned**, an
**icebreaker** when the room is quiet, **"I'm here 📍"** check-in on the day, and
— on the seeded *yesterday* board-game night — the **"Run it back 🔁"** reconvene
banner. Withdraw frees your spot (confirm dialog); a full hangout shows **"Full ·
Notify me"** (waitlist); spots-left scarcity in amber; weekly chip on recurring
plans. Your first **I'm in** also triggers the one-time **staged notifications
ask** — the permission prompt is earned *after* the aha, never at install.

**Composer:** hangout/tip toggle · day + time chips · venue ("a public place —
that's the Hangpost way") · spots · make-it-weekly · **audience targeting**
(everyone nearby / connections only / specific people) · post-to-community
banner.

**Connections tab:** Requests (inline accept) · **People you met** (post-hangout
keep-in-touch / dismiss) · **Today's picks** with mutual-contact lines + "In
common" chips (background first, never a score) · **Familiar faces** ("crossed
paths 2×") · **New here, like you** · contacts-sync lane. Person profiles end
with **"Join them at…"** — their public hangouts, the no-cold-DM way in. DMs stay
locked until connected.

**Alerts:** requests (accept inline), accepted, invites, tonight reminder, "new
person joined nearby — you both know Sam", a **connection's status** ("Nia is
free tonight" → opens Tonight), and the weekly digest. All deep-link.

**Profile:** gradient hero, photo-verified badge, tappable stats (Hangouts =
private lineup), structured cards, home base, new-in-town toggle, and the
**Safety center** (verification status, share-my-plans default, blocked list with
unblock, house rules).

**Settings:** account links · **notification preferences** (off until the staged
ask; per-kind toggles; "no streaks, no spam" is policy) · **the fine print** —
Terms / Privacy / Community Guidelines in plain language (18+, assumption-of-risk
for meetups, no data sale, no live GPS) · sign out · **Delete account**
(destructive confirm; App Store requires it in-app).

## Deliberately NOT here (decided, don't re-add)

No map (location privacy) · no numeric match score · no follower counts or
likes-leaderboards · no swiping · no free-text bio · no live GPS · distance never
affects ranking.

## Mock notes

People photos are `pravatar.cc` placeholders; "any input works" on auth/verify;
the world resets on reload. The store (`lib/store.tsx`) is synchronous on purpose
— flows feel instant so the *design* is what you're judging.

## Repo cleanup (2026-06-18)

This repo is now the **single canonical design source**. The duplicate design
copies that used to be hand-synced alongside it (`hangpost-full-stack/snack-full`
and the `snack-native-mirror/` copies) were retired so there is exactly one place
to iterate the design. Port target is `hangpost-full-stack/apps/native`.

## Recent design updates (2026-06-18)

- **Statuses — one-tap "I'm free" (NEW).** The lowest-friction posting in the
  app. From the top of the feed, **Share status** → a sheet of brand-voice
  presets (*"Free tonight and powerless to say no"*, *"Touching grass this
  weekend — join me"*, *"WFH at a café, come cowork"*) or write your own; it
  posts in one tap, is **visible only to your connections**, and **disappears on
  its own** (no time-picker). The feed shows **🌙 Who's free** (your connections'
  live statuses) and a **Tonight** screen (`/tonight`) with one-tap **react**,
  **"I'm around too"**, **reply**, and **make a plan**. No-rejection by design;
  connection-scoped, never to nearby strangers, never with location. Built from
  the canonical brief `Hangpost-Full-Stack/docs/briefs/STATUS_POSTS.md`.
- **"What are you into?" is now write-in-first.** Each section (hobbies /
  interests / likes) leads with its **add-your-own box at the top** — people
  write in far more than any list can hold — and the curated themed chips sit
  below as *ideas to tap*. Your typed additions land in a "Yours ✨" row right
  under the box. Hobbies stays the first section.
- **No "match" language anywhere a user can see it.** We never say we "match"
  people or that people are "matched" — onboarding now talks about *finding the
  people you'd actually click with* and *finding your people* (brand rule:
  reasons in words, never a score, and never the word "match"). The autocomplete
  hints ("Tap a suggestion" / "Not listed") were reworded too.
- **Much bigger College list** for sign-up — added regional & directional state
  schools, the Cal State / SUNY campuses, more HBCUs, Catholic/faith-based and
  other private universities, art/music/design schools, the service academies,
  and the large online universities. The wedge user (a just-moved college grad)
  usually went to a state regional, not an Ivy, so the autocomplete now
  canonicalises where they actually went. Free-text fallback still covers the rest.
  Bigger again this pass (~594 hand-curated names); for the **exhaustive ~2,000
  four-year set**, the snippet in **`COLLEGES.md`** regenerates `lib/colleges.ts`
  from a public dataset (run it in a Codespace — it needs network the design
  sandbox doesn't have).

## Recent design updates (2026-06-17)

- **Main feed = "The Bulletin"** (was "Nearby" — the whole app is already
  location-scoped, so that name restated the premise). The city posterboard, named.
- **"What are you into?" is now themed + much richer** — categorized sections
  (sports / outdoors / making / music / food / games · going-out / culture /
  causes / ideas / wellness · music genres + **artists on repeat** + screen +
  reading) with a prominent "add your own" for the niche taste only you know.
- **First 10:** tap any pick to open that person's full profile.
- **Calendar icon in the feed header → "Your hangouts"** — your private lineup of
  the hangouts you've tapped *I'm in* for, with a count badge.

---

© 2026 Hangpost. UI/UX prototype on mock data. All rights reserved — this repo is
public for prototyping and is **not** an open-source grant.
