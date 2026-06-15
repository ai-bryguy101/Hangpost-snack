# Hangpost — Design Brief: building a friend app people *love* (2026)

> **Purpose.** This is the "what to look at and think about" companion to the
> prototype. It synthesizes what works and what fails across the social/
> friend-app landscape, maps it onto Hangpost's thesis, and turns it into a
> prioritized set of UI/UX moves. It is a *product/design* document — mock
> data, public competitor analysis, no internal/business specifics.
>
> **Method + honesty note.** This brief draws on (a) competitor + design
> research, (b) the friendship-science and engagement literature already cited
> in our product strategy, and (c) several live research streams that completed
> with sourced findings — two competitor teardowns (Wink, Friended), a
> **permission-priming/onboarding** study, and a **Laws of UX** review (both
> with real source URLs, see §8–§9). A larger live web fan-out was throttled by
> a transient server-side rate limit, so the broad competitor detail here leans
> on established (≈Jan 2026) knowledge rather than freshly-fetched pages — treat
> specific figures as directional and spot-verify before quoting externally.
> Where a section carries source URLs, those were retrieved this session.

---

## 0. The one-paragraph thesis (read this first)

Every successful "make new friends" product in 2026 has converged on the same
realization: **the feed is not the product — the meet is.** Apps that optimize
for time-in-app (swipe decks, infinite scrolls, vanity counts) generate
engagement but not friendship, and users feel used and churn. Apps that
optimize for **a real-world meeting that repeats** (Timeleft dinners, run
clubs, Bumble's pivot to *groups*, Partiful's IRL parties) are the ones growing.
Hangpost is already designed around the right atomic action — *post a hangout →
tap I'm in* — so our job is not to copy social-media mechanics; it's to remove
every gram of friction between "I opened the app" and "I'm standing next to a
new person," and then to make that meeting *happen again*. That second meeting
is where 90% of competitors lose the user and where our entire differentiation
lives.

---

## 1. The consensus — UI/UX patterns that repeatedly WORK

Synthesized across Bumble BFF, Timeleft, Meetup, Partiful, 222, Geneva,
Discord, BeReal, Hinge, and the design literature.

| Pattern | Evidence | What it means for us |
|---|---|---|
| **Fast time-to-first-value; ask for data *after* the aha** | Onboarding-completion research; BeReal's zero-setup open; permission-priming studies (staged asks ≫ at-install for opt-in rate) | We already stage the notif ask after first "I'm in." Push the *first value* (seeing a real nearby hangout) even earlier. |
| **A single, low-vulnerability atomic action** | Timeleft ("just show up to dinner"), run clubs, Partiful ("you're invited") all avoid the cold 1:1 DM | "Post a hangout / tap I'm in" is exactly this. Protect it. |
| **Group-first, not 1:1** | Bumble *shut down* old BFF 1:1 and relaunched on Geneva around **friend groups & communities** (Sept 2025); 222 curates *small groups* | Our hangouts + communities are group-first. Lean harder into "join the group," away from "message the person." |
| **Commitment devices that fight no-shows** | Meetup's chronic ~40% flake rate; Timeleft/222 use fixed small groups, confirmation, reminders, light stakes | Caps + honorable withdraw + reminders + who's-going are the right primitives. Make them more visible. |
| **Explainable, reason-based matching (no score)** | Hinge "we met because…"; user distrust of opaque % | Our "In common" chips + tier reasons, never a number — keep and strengthen. |
| **Delightful, sharable artifacts** | Partiful's playful invites/texts are its growth engine | A hangout/plan should be a beautiful, sharable object. |
| **Liveness / "right now" pull** | location apps live or die on "what's happening near me *now*" | Our liveness strip + "Happening today" rail — make them the emotional core of the feed. |
| **Identity floor + visible safety** | every survivor (Bumble, Timeleft) verifies; every casualty (Wink, Yik Yak) didn't | Phone + photo verification + Safety center — already a strength; surface it at the moments of doubt. |

---

## 2. What's useless or actively HARMFUL — the "do not build" list

This is as important as the build list. Every item below killed or capped a
real competitor.

- **Vanity metrics** (followers, likes, leaderboards). Parasocial, the *opposite*
  shape of reciprocal friendship. → we already ban these.
- **Infinite algorithmic feed of strangers.** Drives time-in-app, not meets;
  invites doom-scroll and comparison. → our feed is location-bounded and
  meet-oriented, not an endless stranger-stream. Keep it finite and "caught up."
- **Swipe-on-people decks.** Bumble BFF's original model bred swipe fatigue and
  a cold-DM dead-end; Wink gem-gated swiping → bots + paywall + grooming risk →
  forced 18+ pivot. → never add a swipe deck.
- **Gating the core action behind a paywall.** Wink (pay-to-swipe) and Friended
  ("can't see a single message without paying," deletion timers) are textbook
  failures — the #1 review complaint for both. → posting, RSVPing, and the first
  message must always be free.
- **Anonymity / pseudonymity in a local board.** Yik Yak died (twice) of
  anonymous local toxicity; Nextdoor rots through identity-attached negativity.
  → our "places, never people" board rule + real identity is the antidote. Keep
  it loud.
- **Read receipts / typing pressure, streaks, FOMO-bait notifications.** Manufacture
  anxiety, not connection; classic dark patterns. → notifications must be tied to
  *real plans* (a hangout you joined, a request), never engagement bait.
- **Free-text bios.** Invite the dating-app "sell yourself" UX and bypass our
  structured-field matching. → structured fields only (already decided).
- **A public people-map / live location.** Trilateration risk; we already killed it.

---

## 3. The five hard truths for a "friends in a new city" app

These are the structural problems; everything we build should attack one.

1. **Cold-start density (the ghost town).** Hyperlocal social dies in the empty
   quadrant — a newcomer opens the app, sees nothing nearby, and churns in one
   session. *Antidote:* value before density (city tips/starter pack), seed
   liveness, never show a truly empty screen, launch one atomic network at a time.
2. **The no-show problem.** A free "I'm in" with no teeth manufactures silent
   flakes (Meetup ~40%). *Antidote:* small caps, who's-going social proof,
   reminders, day-of check-in, honorable withdraw that frees the spot, and a
   *positive-only* reliability signal.
3. **The post-meet crux (where everyone loses the user).** Apps engineer the
   first meeting and then… nothing. Friendship needs the 2nd, 3rd, 10th contact
   (Hall's ~50 hrs casual / ~200 close; propinquity). *Antidote:* "Run it back,"
   recurring hangouts, "regulars/familiar faces," keep-in-touch nudges. **This is
   our moat — it deserves the most design love.**
4. **Trust before showing up.** People (especially women) won't meet strangers
   without enough signal. *Antidote:* verification badges at the point of doubt,
   "who's going + usually shows up," public-venue norm, share-my-plan.
5. **The blank-page problem (the posting tax).** "I'm in" is easy; *being the one
   who posts* is scary and effortful — yet the whole marketplace dies without
   supply. *Antidote:* make posting one-tap-to-prefilled with templates/prompts,
   lower the perceived stakes ("low-key, all welcome"), and reward the host.

---

## 4. Where Hangpost already wins (do NOT "fix" these)

- **Atomic action = post a hangout → I'm in** (sidesteps the cold-DM tax). Our
  single best structural insight.
- **DMs gated behind an accepted connection** (anti-creep by design — exactly the
  hole that wrecks Friended/Wink).
- **Reasons/commonalities, never a numeric score** (anti-dating-app).
- **No vanity metrics, no map, no live GPS, distance never ranks** (values point
  at meets, not minutes).
- **"Places, never people" board rule + real-identity verification** (the
  anti-Yik-Yak / anti-Nextdoor design).
- **Group-first hangouts + communities** — already where Bumble *pivoted to* in 2025.

---

## 5. Where we're weak — the gaps, mapped to the journey

| Journey stage | Gap | Severity |
|---|---|---|
| First open (newcomer) | Feed can still *feel* empty/quiet; value-before-density not dramatized | 🔴 |
| First action (posting) | **Blank-page problem** — composer starts empty; posting feels high-effort/high-stakes | 🔴 |
| The meet | Reliability + who's-going present but under-surfaced; reminders not felt | 🟠 |
| **Post-meet (the crux)** | "Run it back"/regulars exist but are buried; the 2nd-meet is not *pushed* | 🔴 |
| Habit | Weekly "reason to return" (digest, tonight-near-you) is thin | 🟠 |
| Belonging | Host tooling + light reputation underdeveloped | 🟢 |

---

## 6. The design moves — prioritized (what goes into the prototype)

**P0 — flagship, this iteration:**
1. **Kill the blank-page problem.** A composer that opens with **one-tap starter
   templates** ("Coffee co-work ☕", "Pickup run 🏃", "Trivia night 🍻", "Museum
   wander 🖼️", "Post a city tip 💡") that prefill body + venue type + sensible
   defaults. Reframe posting as *low-stakes* ("Low-key, all welcome — you don't
   have to host, just open the door"). **Directly serves "get real users to
   post."**
2. **Make the board feel alive on first open.** A first-run "Here's what's
   happening near you tonight" moment; never a dead screen; a gentle "be the first
   to post" CTA when a lens is thin (turn emptiness into an invitation).
3. **Put the repeat-contact loop front-and-center.** Elevate "Run it back,"
   "you've now crossed paths with X twice — say hi," and post-hangout "keep in
   touch?" from buried states into first-class, celebrated moments. This is the
   moat; it should be the most delightful surface in the app.

**P1 — next:**
4. **Reliability felt, not stated.** Day-of reminder surface, clearer who's-going
   + "usually shows up," scarcity ("2 spots left") as a gentle nudge not a dark
   pattern.
5. **Weekly reason to return.** A "your week near you" digest surface + "tonight
   near you" — return triggers tied to *real plans*, never streaks.
6. **Host rewards.** Light, non-vanity recognition for people who open doors
   (e.g., "you've hosted 3 hangouts — you're a connector"), private and warm.

**P2 — later / discuss:**
7. Structured "looking for" prompt (needs an ADR — narrow, feeds matching).
8. Sharable plan artifact (Partiful-grade invite object).
9. Community-led recurring events as the density flywheel.

---

## 7. "How do we make a *new form* of social media people love?"

The pitch in one page — the contrarian bets that make Hangpost feel *new*:

1. **Optimize for leaving the app, not staying.** The success state is "I closed
   the app because I'm at the thing." This is the anti-doom-scroll promise, and
   it's a *marketing* wedge as much as a design one ("the social app that wants
   you to log off").
2. **The feed has a bottom.** You can be "all caught up." Finiteness is a feature
   — it signals respect and kills comparison spirals.
3. **Supply-side delight.** Most social apps obsess over consumers; the scarce,
   heroic user here is **the poster/host**. Treat hosting like the premium
   experience — make it effortless and celebrated.
4. **The 2nd meeting is the product.** Nobody else engineers it. We make
   re-meeting one tap and emotionally rewarding ("Run it back 🔁").
5. **Safety as a feature you can see, not a settings page.** Verification and
   "who's going" shown exactly when a user hesitates to commit.
6. **Belonging over broadcasting.** No audience, no performance — small rooms of
   nearby people with something in common. The opposite of the stage.

If we nail these six, the one-line story writes itself: *"Hangpost is the app you
download when you move somewhere new — it gets you to a real hangout this week,
and to the same good people again next week."*

---

---

# Part B — Research appendix (sourced this session)

> These sections carry source URLs retrieved during this session. Several primary
> domains (NN/g, Apple, lawsofux.com, vendor blogs) 403-block automated fetch, so
> quotes are via search summaries of those pages; figures are **directional** —
> verify before quoting externally.

## 8. Design-science: the Laws of UX, applied — and where to hold back

Most UX "laws" are pro-clarity (use freely); a few are engagement levers that,
pushed hard, become doom-scroll mechanics. For an anti-doom-scroll product we
apply them pointed at *the meetup*, not time-in-app.

| Law | Use it for | Restraint |
|---|---|---|
| **Hick's** (choices → decision time) | small daily picks; minimal composer fields; one recommended default | — |
| **Fitts's** (big/near targets) | make "I'm in" a large, thumb-zone button | — |
| **Jakob's** (familiarity) | IG-like feed + bottom tabs so movers pay no learning tax | borrow the chrome, *rewrite the meaning* (radius/audience) |
| **Zeigarnik** (open loops pull) | profile-completion progress; "confirm your RSVP" | ⚠️ only *finite, finishable* loops — never an infinite "N new" badge |
| **Peak-End** | engineer the peak = first "I'm in"/confirmed hangout; the end = "how was it? meet again?" | defuse negative peaks (nobody came; empty feed) |
| **Aesthetic-Usability** | polish buys trust for a vulnerable act (meeting strangers) | still usability-test the RSVP/match flow |
| **Doherty** (<400 ms) | snappy feed/RSVP via optimistic UI | ⚠️ speed for *intentional* actions, not a frictionless bottomless feed |
| **Miller's** (chunking, *not* "max 7") | chunk match reasons into the 3 tiers; who/what/when/where on cards | don't cap nav at 7 "because Miller" — the classic misread |

Source: lawsofux.com (Jon Yablonski) — `/hicks-law`, `/fittss-law`, `/jakobs-law`,
`/zeigarnik-effect`, `/peak-end-rule`, `/aesthetic-usability-effect`,
`/doherty-threshold`, `/millers-law` (+ `/chunking`); Miller-misuse via uxmyths.com.

## 9. Onboarding & permissions — the sourced playbook

- **Stage every permission ask *after* its feature's "aha," never at install.**
  Apple HIG: request only when the feature needs it. Deferred asks see ~28% higher
  grant rates; a good reason can lift grants up to ~81% (Localytics contacts study).
  [Apple HIG *Accessing private data*; Appcues *mobile-permission-priming*; NN/g *permission-requests*]
- **iOS shows each system prompt ONCE** — "Don't Allow" is permanent (only Settings
  recovers it). Gate every system dialog behind your own full-screen **soft-ask
  primer**; a "no" there is free, and post-primer denial drops to ~3%. [rnfirebase iOS permissions; Appcues]
- **Notifications: use provisional (quiet) push first** — deliver silently to
  Notification Center with zero prompt, then earn the opt-in after value. [OneSignal provisional push]
- **Location: request approximate / When-In-Use only, never "Always."** Our
  home-base radius model needs no precise/background GPS — frame it as the privacy
  *advantage* ("set it once; we never track you"). >60% opt-in achievable with priming.
  [radar.com approximate-location; MarTech]
- **Contacts LAST**, behind an explicit "Find friends" tap + consent copy (our
  `consent_hash`/`friendship_imports`) — the highest-suspicion permission. [NN/g; Dogtown Media]
- **Keep onboarding ≤5 screens** — completion drops ~15%/screen past five; ~72% want
  <60s; dating/social apps carry ~65% uninstall, so trust during asks is critical. [Lowcode onboarding 2026]

**Hangpost read:** our staged notif-ask (after first "I'm in") is *exactly right* —
validated. Add: location as a home-base primer (approximate only), contacts behind a
"Find people you know" tap, onboarding capped at 5 steps (snack-full already does most).

## 10. The engagement paradox + humane retention — the heart of "a new form of social media"

- **The cautionary tale that proves our thesis:** Facebook's 2018 "Meaningful Social
  Interactions" re-rank was *named* for wellbeing (Zuckerberg predicted — and reported
  — ~50M fewer hours/day), but "meaningful" was operationalized as engagement weight
  (comments/reshares/reactions; anger up to **5× a like**) and **amplified outrage +
  misinformation** (WSJ "Facebook Files," 2021). **Lesson: a metric named after user
  value is not user value.** Optimize the real outcome (the re-meet), not a proxy.
  [Washington Post 2021-10-26; about.fb.com MSI; SEC 8-K Q4-2017]
- **Active vs passive use:** directed close-tie interaction improves wellbeing; passive
  scrolling lowers it (envy/comparison) — Verduyn/Kross 2015; Facebook's own "Hard
  Questions" (2017). We're structurally active (post → RSVP → meet); lean in.
- **Bounded > infinite for *healthy* retention.** Winning triad = **scarcity +
  appointment + a completion cue**: Wordle (one/day, shareable grid), Duolingo
  (simplifying the streak to one lesson/day lifted D7 retention **+14%**), NYT Games
  ("come back tomorrow," explicitly *not* 24/7). Instagram shipped "You're All Caught
  Up" then bolted infinite Suggested Posts on top within 2 years — a stop cue *fights*
  the growth incentive. [TechCrunch/TIME Wordle; Lenny's Duolingo; MacRumors IG]
- **BeReal is the decisive warning:** finite/anti-performative design is a phenomenal
  *acquisition* engine but retains only as long as novelty (≈45× growth → DAU −48% in
  months → sold to Voodoo 2024). Wordle/Duolingo retained because the bounded act had
  **standalone repeatable value.** → our bounded loop must make the *act itself* worth
  repeating: relationships/reciprocity (the re-meet), not a once-a-day gimmick. [Sensor Tower; Platformer]
- **Attention-economy ethics** give the principled backing for "optimize for logging
  off": Harris/Center for Humane Technology ("Time Well Spent"); Wu, *The Attention
  Merchants*; Williams, *Stand Out of Our Light*.

**Hangpost moves:** (1) give the feed a real **"you're all caught up"** floor (finite —
no infinite stranger-stream); (2) make the **return trigger a real plan** ("tonight
near you," "your hangout is in 2h"), never a streak/FOMO; (3) celebrate the **re-meet**
as the success state.

## 11. Navigation & card craft (sourced specifics)

- **3–5 bottom tabs** — Apple HIG and Material both independently land on 3–5 top-level
  destinations (≥3 or use tabs; ≤5). Our Feed / People / Alerts / Profile = 4 is in
  range. [Apple HIG *tab-bars*; Material 3 *navigation-bar*]
- **Bottom tab bar beats a hamburger** for discoverability — hiding nav cuts
  discoverability ~½ (NN/g, 232+ participants). Keep nav persistent + visible. [NN/g *hamburger-menus*]
- **Card scannability:** lead each card with the most salient info (hangout headline +
  time/place at top); keep element positions identical card-to-card (lists out-scan
  cards *because* positions are predictable — recover it by enforcing a consistent
  template); strong headings trigger the efficient "layer-cake" scan. [NN/g *cards-component*, *layer-cake*, *f-shaped-pattern*]
- **Thumb-zone:** the repeated CTA ("I'm in") should sit **low and center** on the
  card, not a top corner (~49% one-handed, ~75% thumb-driven; Hoober). The bottom tab
  bar is the most reachable real estate. [Smashing *thumb-zone*]

## 12. Why-now & the moat (frameworks to argue the pitch)

- **Win one atomic network first** (Chen, *The Cold Start Problem*): the smallest stable
  network (a campus, a neighborhood, a just-moved cohort) — don't big-bang launch. Court
  the **"hard side"** = our *hosts/posters* (the scarce, heroic users). [coldstart.com]
- **"Different, not better"** — incumbents copy what fits their logic; they can't adopt a
  model that breaks their metrics. Bumble *pivoted to friend-groups* (Geneva, Sept 2025) —
  validation that group-first IRL is the frontier, and an opening to out-specialize them
  on the **newcomer + repeat-meet** wedge. [a16z *community-takes-all*; TechCrunch 2025-09-18]
- **Status-as-a-Service** (Eugene Wei): every breakout social app has a signature "proof
  of work" that mints status (a witty FB status, an interesting IG square). **Ours could
  be: being a great host / a reliable regular / a trusted local** — status earned by
  *showing up and bringing people together*, not by followers. (Counter-view: Gavin Baker —
  *utility* is the more durable moat; for us the utility is "I made real friends." Build both.)
- **"The next big thing looks like a toy"** (Chris Dixon): a small city board of low-key
  hangouts looks modest now — that's the camouflage.

## 13. The location-social graveyard — study your category's dead

Demand for location-social is real (Zenly had ~40M *loved* users), but the failure
modes are remarkably consistent. Study these so we don't repeat them:

| App | What happened | Lesson for us |
|---|---|---|
| **Zenly** (RIP 2023) | Beloved real-time friend map, ~40M users, playful "Ghost Mode" privacy — shut by Snap purely because it **never monetized** | Loved ≠ durable. Make privacy *delightful* (Ghost Mode is the template); but have a business model + an independent reason to exist. |
| **Yik Yak** (died 2017) | Anonymous + hyperlocal → explosive on campuses → imploded under bullying/threats it couldn't moderate | Anonymity + proximity = harassment fuel. Safety/moderation is **load-bearing from v1**, not Phase 6. (We already reject anonymity — keep it.) |
| **Foursquare** (consumer app killed 2024) | Check-in gamification drove novelty, not retention; the real value was B2B location data | A viral mechanic ≠ a retained habit. Anchor the loop to a **standing need** (meeting people). |
| **Highlight / Sonar / Banjo** (2012 "ambient social") | Passive "people near you right now" pings — creepy, battery-draining, empty outside dense tech crowds | **Intentional > passive location.** Validates ADR-0009 (no live GPS). Never build "see who's near you now." |
| **Color** ($41M raised, instant flop) | Nobody understood what it was for | Clarity in **30 seconds** or churn — especially for a just-moved user opening a not-yet-dense city. |
| **Meerkat** (killed when Twitter cut its graph) | Built its social graph on a platform that revoked access | Own your graph; don't be a feature inside a giant. |

**The composite:** these die from (a) empty feeds (thin density), (b) creepy passive
tracking, (c) harassment from unmoderated proximity, or (d) being a disposable feature
with no business model — **almost never from a weak initial hook.** Hangpost's design
(intentional, locally dense, safety-first, privacy-respecting, activity-anchored) already
dodges all four; the job is to *stay* disciplined. [TechCrunch (Zenly, Foursquare,
Meerkat); Failory (Yik Yak); Engadget (Highlight); FastCompany (Color)]

## 14. The posting playbook — killing the blank-page problem (the supply side)

Our marketplace dies without posts, and ~90% of users lurk (Nielsen's 90-9-1). The best
low-friction-posting products show exactly how to convert lurkers → posters:

- **Locket** (~80M downloads, *growing*): posting collapses to **one tap**; **in-app
  camera only** (no curation = no "perfect shot" paralysis); **small audience** (20-friend
  cap = low stakes); **reactions are uncounted** (no scoreboard anxiety). → For us: make
  posting a hangout near-one-tap with templates; keep audiences small/targeted; never show
  public RSVP-count leaderboards. [TechCrunch/imore]
- **Hinge prompts + "Convo Starters"** (Dec 2025): never a blank field — you **react to a
  specific thing**. Hinge's data: a like *with a comment* is **2× as likely to lead to a
  date**, and **comments on prompts beat photo comments by 47%**; their AI Convo Starters
  (3 personalized, *write-it-yourself* tips, not copy-paste) made **35% of users feel more
  confident reaching out.** → For us: the composer opens with **starter templates/prompts**,
  not an empty box. [hinge.co/newsroom/convo-starters; TechCrunch 2025-12-08]
- **Nikita Bier doctrine** (TBH/Gas): "**every tap is a miracle**"; the **3-second rule**
  (grasp value in 3s); strip onboarding friction; make sharing more rewarding than solo
  use. *But* Gas/TBH also show tap-only positivity mechanics convert fast yet **struggle to
  retain** — so the act must produce real value (a meetup), not just validation. [Lenny's Newsletter]
- **Fogg (B=MAP):** the hard behavior is "actually show up." Maximize **Ability** (make
  posting/RSVP dead-simple — we do) and use **Signals** (gentle, well-timed reminders),
  never manipulative high-frequency nags. [behaviormodel.org]

**Cold-start density gates (so the feed is never a ghost town):** launch *one* dense atomic
network with an explicit density bar — precedents: **Nextdoor "10 verified members / 21
days"** before a neighborhood goes live; **Airbnb ~300 listings / ~100 reviewed** per market
before booking growth steps up. **~77% of users churn within 3 days** (Quettra/Andrew Chen),
so first-session value is everything — seed with *real* hosts/events, never fake nearby users
(Reddit's fake-account trick is wrong for an in-person-safety product). [Nextdoor Help;
Jonathan Golden/Airbnb; andrewchen.com]

**The north-star instrument (steal this):** Hinge measures offline success with a **"We Met"
survey** ("is this the type of person you'd see again?") fired a few days after a number
exchange, and treats **"good churn"** (deleting because it worked) as success. **Our direct
analog: a post-hangout "Did you meet up? Would you hang again?" prompt** that both *is* our
"meets that re-meet" metric and feeds the ranker. [TechCrunch 2018; The Drum]

## 15. Source index (retrieved this session)

Friendship/behavior: simplypsychology (50/200-hr), propinquity; Verduyn & Kross 2015
(active/passive); Facebook "Hard Questions" 2017. Engagement ethics: humanetech.com;
Wu *Attention Merchants*; Williams *Stand Out of Our Light*; WaPo 2021-10-26 + SEC 8-K
(Facebook MSI). Retention loops: TechCrunch/TIME (Wordle), Lenny's Newsletter
(Duolingo), MacRumors/TechCrunch (IG "All Caught Up"), Platformer + Sensor Tower
(BeReal). Design science: lawsofux.com; nngroup.com (hamburger-menus, cards-component,
layer-cake, f-shaped-pattern, touch-target-size, permission-requests); Apple HIG
(tab-bars, accessing-private-data); Material 3 (navigation-bar); Smashing (thumb-zone).
Permissions: Appcues, OneSignal (provisional push), radar.com (approximate location),
MarTech, Lowcode. Frameworks: coldstart.com (Chen), nfx.com (network effects),
a16z.com (community-takes-all), eugenewei.com (Status as a Service), cdixon.org (toy).
Competitor teardowns: Wink + Friended (both: paywalling the core action + bots +
friend-app-as-dating-app creep = decline); Discord (always-on rooms, onboarding-question
→ personalized space, 90-9-1 lurking, ghost-town problem). *Many per-app competitor
searches were rate-limited; the above are the streams that completed with sources.*

---

## 16. Open questions for you (steer me)

- **Launch network:** which single atomic network do we design the empty-state
  copy/seed around — a DC neighborhood, one university, or a "new-grads who just
  moved" cohort? (Density strategy needs one answer.)
- **Host incentive:** how warm/explicit should host recognition be without
  drifting toward vanity? (My instinct: private, qualitative, never a public
  leaderboard.)
- **Tone:** how playful vs. earnest should the copy be? (Partiful = playful;
  Timeleft = warm/earnest. I'd lean warm-earnest with light moments.)
- **Sharable plan artifact:** worth a Partiful-grade invite object now, or after
  density?

---

*This brief informs the next prototype iteration. The "do not build" list (§2)
and the locked decisions in `DECISIONS_LOG` are guardrails — propose an ADR
before crossing any of them.*
