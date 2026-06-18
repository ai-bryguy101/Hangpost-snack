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
`Hangpost-Full-Stack` repo.

## Two surfaces in this repo

| Path | What it is |
|---|---|
| **`/` (repo root)** | **The COMPLETE product vision — the target UX.** Every designed flow plus the research-backed pieces a friend-making app needs. **This is the surface to iterate on.** |
| `snack-native-mirror/` | A faithful mirror of what the native app actually is **today**. The diff between this and the root app is the porting backlog. |

## Open it

Now that this repo is public, the browser paths all work again:

1. **Snack (fastest).** Go to <https://snack.expo.dev> → project menu (☰) →
   **Import git repository** → paste `https://github.com/ai-bryguy101/Hangpost-snack`.
   The root app boots in the web preview; switch to **iOS / Android** for a
   simulated device, or **My Device** to open it in Expo Go via QR.
   *To preview the mirror,* import it as its own Snack by dragging the
   `snack-native-mirror/` files in, or use the Codespace path below.
2. **Codespace.** Open a Codespace on this repo, then `npm install &&
   npx expo start --web` (root app) or `cd snack-native-mirror && npm install &&
   npx expo start --web` (mirror). For your phone: `npx expo start --tunnel` and
   scan the QR with Expo Go.

> ⚠️ **Import from a slash-free branch** (i.e. `main`). Snack misparses
> `…/tree/claude/branch-name/…` URLs — it reads the branch as just `claude`.
> Once these files are on `main`, the import above just works.
>
> ⚠️ `app.json` deliberately has **no `sdkVersion` pin** — Snack drops old SDKs
> and a stale pin fails the import. Unpinned, Snack uses its current default;
> nothing here depends on a specific SDK. If an import errors on a dependency,
> accept Snack's suggested version in the prompt.

## The full journey to walk (root app)

**Entry:** Welcome (brand + group-first safety framing) → *Get started* → phone
verification (any 6 digits) → 5-step onboarding: about (incl. **birthday — hard
18+ gate**, plus **major + job**, the background signals right under hometown &
college) → tag pickers (hobbies / interests / likes, all structured — no free
bio) → 140-char intro + photo + "verify it's you" → home base + radius + "I'm
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
person joined nearby — you both know Sam", and the weekly digest. All deep-link.

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
