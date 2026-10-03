I've read all 566 lines and verified the load-bearing claims. Here's the analysis.

---

# `gamefortoddler.html` against the Taste Guide

## Verdict

This is a competent artifact with an incoherent theory of its own product. Every line of it is defensible in isolation; almost none of the *accumulated* decisions agree with each other. It reads like features were added to satisfy a checklist rather than a problem, which is the exact anti-pattern the guide names first.

The good news: the deployment decisions are excellent and most of the damage is concentrated in one place — the menu.

---

## The core problem was never identified

The guide opens with "identify the single core problem you're solving." This product doesn't have one. It has a **curriculum inventory**.

The evidence is the `SUBJ` table (line 526) — 33 tiles across 7 subjects, every one tagged with an official reference (`Математика 9–10`, `Околен свят 17`). The author answered *"what does Наредба № 5 contain for group 1?"* instead of *"what can a 3-year-old do for ninety seconds?"*

That substitution has a concrete cost, and it's visible on line 528: **the first screen a 3-year-old sees is a wall of small Bulgarian text they cannot read.**

```js
b.innerHTML = `<span class="e">${G[k].e}</span><b>${G[k].n}</b><small>${G[k].r}</small>`
```

`Плодове и зеленчуци`, `Равни по височина`, `Превозни средства`. 33 words, plus 7 `<h2>` headings, in a `minmax(150px, 1fr)` grid. The end user of this product is three years old. The menu is built for the teacher — but the menu is also the empty state, and the empty state is optimized for the wrong person.

The guide: *"DO optimize the empty state to be welcoming and clear"* and *"ensure the first ten seconds feel effortless."* Here the first ten seconds are a kindergarten's filing system.

---

## What it genuinely gets right

Credit where it's due — these are taste decisions, not accidents:

- **One file, 38 KB, zero network, zero dependencies** (verified: no CDN, no URL, no fetch). A Bulgarian kindergarten tablet on bad wifi opens this from a USB stick and it just works. That is a correct decision about a real constraint.
- **Bulgarian TTS tuned for a small ear**: `u.rate = .8; u.pitch = 1.25` (line 450). Someone thought about the listener's age, not just their language.
- **130×130 minimum tap targets**, emoji-as-UI so there's nothing to load and nothing to 404. Instant response on cheap hardware.
- **`stopFx()` (line 537)** genuinely cleans up — `clearInterval`, every tracked timeout via the `later()` helper, `removeEventListener('devicemotion')`, `innerHTML = ''`. No zombie balloons after a toddler hits "Назад." Most prototypes skip this.
- **No login, no ads, no tracking, no text input, no score pressure.** Restrained for the target user.
- `shake` has a real **tap-the-bear fallback** (`$('#dz').onclick = dance`, line 548) when the accelerometer is refused. That's a considered degradation path.

---

## Taste test: the 33 games

Applying the guide's six questions to the central structural decision:

| Question | Verdict |
|---|---|
| Necessity | Games 6–33 add nothing a3-year-old can perceive over games 1–5 |
| Externalities | 17 data tables (`FR`, `AN`, `MN`, `WE`, `SH`, `WLD`, `POL`, `JOB`, `HOL`, `CTR`, `PLC`, `CAR`, `RYM`, `TL`, `QS`, `GA`, `COL`) — every one more content a teacher must trust is pedagogically sound |
| Coherence | The menu implies 33 activities; the child experiences ~4 |
| Calibration | The wrong amount — by roughly 6× |
| Omission | Nothing.33 was chosen as "cover the checklist," which is the guide's *"DON'T build for feature parity with competitors"* verbatim |
| Unarticulated Need | Not served |

**25 of 33 games are the identical interaction**: show a prompt, show 2–3 large targets, tap one, hear praise or "опитай пак."

That's `ng()` ×3 (line 529) + `qz()` ×6 (line 530) + 16 bespoke `gen()` functions that all return `{p, s, o}` and render through the same `round()` (line 539) → `ans()` (line 542) → `good()`/`bad()` path. The child experiences four mechanics: *tap-the-right-emoji* (25×), *tap-in-order* (`seq`), *paged story* (`tale`), *motor/draw* (6).

The irony worth naming: **the author's two highest-quality pieces are the smallest.** `tale()` (line 535) is 5 lines, has a real narrative arc, and — uniquely — respects a 3-year-old's attention span by having a *shape* instead of infinite repetition. `gait` (line 551) is a paragraph that grades a self-report.

---

## Coherence defects (verified, with line numbers)

### 1. Dark mode breaks the primary interaction — contrast ratio **1.05:1**

The author guarded `.tile` for dark mode (lines 106–109) and **forgot `.opt`**.

```css
.opt { color: #3a2c4a; background: var(--card); }   /* line 172-175 */
```

In dark mode `--card` flips to `#3a2f55` (line 27), but the text stays hardcoded `#3a2c4a`. I computed the luminances:

- L(`#3a2c4a`) = 0.03195
- L(`#3a2f55`) = 0.03588
- Contrast = **1.05:1** (WCAG AA needs 4.5:1, or 3:1 even for large text)

So on any device set to dark, **every answer button's label is invisible.** For `cmp` (line 513) — whose options are the pure text `Първата: 2` / `Втората: 3` — the entire option is unreadable and the game is literally unplayable.

This is the guide's *"DON'T separate aesthetics from function"* in its most literal form: a color token silently deleted the app's core verb.

### 2. The theme system has an entry point that was never wired

`:root[data-theme="dark"]` (line 33) and `:not([data-theme="light"])` (line 25) exist — but **nothing ever sets `data-theme`** (verified: no `setAttribute` for it in the file). The manual override is unreachable, and `:not([data-theme="light"])` matches unconditionally. A system was built; the door was never hung.

### 3. `prefers-reduced-motion` disables the wrong animations

Lines 350–356 disable `.opt` and `#fx` — a 1.5-second star burst. They leave running:

- `hop` (line 289) — a 150px emoji bouncing **infinitely** at 0.6s
- `up` (line 415) — the continuous balloon field in `pop`

The two largest, most persistent motions are the two that survive. For a vestibular-sensitive child the balloon field is the problem; the star burst is not.

### 4. `gait` is the same game implemented as a lie

Line 551 asks the child to *"Пълзи и провирай се под въже!"* (crawl under a rope) and *"Бягай в различни посоки!"* — and the only affordance is a button reading **"Направих го! 👍"**. No sensing, no timer, no camera. It grades a self-report and awards a star.

`throw` genuinely uses pointer physics; `shake` genuinely uses `devicemotion`. `gait` is in the same category and is fictional.

### 5. `throw` doesn't throw

Line 552. `ball.onpointerdown` assigns a **random** color and scales up; `bd.onpointerup` checks which basket you released over. **There is no `pointermove` handler for the ball.** The child taps the ball, it recolors, then taps a basket. The ball never moves.

The instruction says *"Хвърли топката в кошницата"* — throw. For a three-year-old, following the instruction *is* the entire game. The name, the copy, and the motion are three different contracts.

### 6. Dead UI: the 🔊 button

```js
$('#re').onclick = () => { if (q && !G[cur].m) say(q.say || q.p) }   // line 544
```

In the 6 motor/draw/music games `G[cur].m` is truthy, so the button **does nothing** — while remaining fully visible. A control that promises replay and silently ignores you.

7. **The wrong-answer path strands the child.** `bad()` (line 540) says `'Опитай пак!'` and never re-asks the question. The child is left with silence and an unanswered prompt. Recovery requires finding a 22px unlabeled 🔊 button in the corner — something a three-year-old cannot do. The guide's *"build for unarticulated user needs"* would say: a toddler who didn't catch the question needs it repeated **automatically**, gently, without being told to try again.

8. **The wrong answer gets a buzzer.** `bad()` plays a 200Hz **sawtooth**. `good()` gets a pleasant 660→880Hz triangle ramp. So the product has decided that a toddler's mistake deserves an abrasive sound while success gets a chime. Every other default in this file — rate 0.8, pitch 1.25, 130px targets — says *"we understand this is a three-year-old."* This one default says we don't. That's the guide's *"prioritize coherence across the entire product"* failing at a single line.

---

## Defaults that were never decided

The guide: *"DON'T defer taste decisions to 'later' — every default and omission is a taste decision."*

**Stars are unbankable.** `stars = 0` on every `open()` (line 538), and there is no persistence (verified: no `localStorage`/`sessionStorage`/`indexedDB`). The child collects stars, leaves, returns, and the collection is gone. Nobody decided whether a session score or a saved score was right — it just happens.

**The wrong-answer path strands the child.** `bad()` (line 540) says `'Опитай пак!'` and never re-asks the question. The child is left with silence and an unanswered prompt. Recovery requires finding a 22px unlabeled 🔊 button in the corner — something a three-year-old cannot do. The guide's *"build for unarticulated user needs"* would say: a toddler who didn't catch the question needs it repeated **automatically**, gently, without being told to try again.

**Stars can be farmed.** `good()` schedules `round()` after 1500ms but never disables the button. During that window `ans()` is still bound — rapid double-tap on the correct answer yields two stars. For this age group, that's the single most likely accidental interaction.

**The wrong answer gets a buzzer.** `bad()` plays a 200Hz **sawtooth**. `good()` gets a pleasant 660→880Hz triangle ramp. So the product has decided that a toddler's mistake deserves an abrasive sound while success gets a chime. Every other default in this file — rate 0.8, pitch 1.25, 130px targets — says *"we understand this is a three-year-old."* This one default says we don't. That's the guide's *"prioritize coherence across the entire product"* failing at a single line.

---

## Decoration substituting for judgment

```css
.tile:nth-child(3n+1) { background: #ffd9cf }   /* lines 94-104 */
```

`nth-child` counts **all** children of `#menu`, and line 528 interleaves `<h2>` headings among the tiles. So the color cycle is offset by however many headings preceded each group — **the colors don't align with subject groups.** A child cannot learn "teal means math." It looks intentional and isn't. That's the *"Aesthetic-Only Product"* anti-pattern: decoration in the place of a decision.

Related: `--c1` and `--c2` are declared (lines 14–15) and **never referenced anywhere**. Two colors in a palette that never ship.

And the curriculum tags (`<small>${G[k].r}</small>`) are, strictly, noise — the child ignores them and the teacher can already see the heading under which the tile sits. Information added to satisfy an imagined inspector, at the cost of the tile's legibility for the one person who has to use it.

---

## The unarticulated need, sitting right there

There is **no `user-select: none`** anywhere (verified), and `touch-action: none` is scoped only to `#bd` and `#cv`.

So on the main quiz screen, a three-year-old mashing and dragging — which is exactly what they do — will trigger text selection and the iOS/Android callout magnifier, on top of the game. This is the most predictable failure in the entire product and it isn't handled. It's also the purest example of the guide's *"DO build for unarticulated user needs, not just stated preferences."*

The guide's other unarticulated needs, unserved: **no voice fallback.** `say()` (line 450) assumes a `bg-BG` voice exists (verified: no `getVoices()` check). On a device without Bulgarian TTS, the entire product is silent — and every prompt is text a three-year-old cannot read. The app's only channel is the one channel it doesn't verify.

---

## The inversion worth naming

`draw` (line 500) is the only **open-ended** game in the file. It has no right answer, no failure state, no stars — and, whether by intent or oversight, the canvas handlers (lines 560–562) never touch `stars`, so its score display stays empty.

**The product's best moment is the one where it stops grading.**

That's the guide's ideal state arriving by accident: *"make the design invisible when well-executed — the product should just work quietly."* A toddler scribbling with no scoreboard is a better product than the other32 screens combined. And nothing in the code says anyone chose that.

---

## What I'd cut

The core problem, stated properly: *a three-year-old who cannot read needs to tap one big thing and hear a Bulgarian word.* The minimum set that solves that:

1. **One interaction.** Spoken prompt + one big visual + three giant targets + immediate warm feedback. Already built. That's `round()`/`ans()`.
2. **A deep content pool so it doesn't repeat.** Already built — `FR` (10 fruits), `AN`, `MN`, `WE`. These are the actual product.
3. **Voice, tuned.** Already right.

Everything else is the teacher's anxiety about covering a checklist.

Concretely: **33 tiles → 3.** One tap-the-answer game fed by the content tables, `draw` (already ungraded, already good), and one working motor game — `throw` or `shake`, once `throw` actually throws. Delete `gait` entirely rather than ship a lie. Keep the teacher-facing curriculum mapping, but move it off the child's first screen — a collapsed footer, or a second page the teacher opens.

Then fix, in order: the `.opt` dark-mode contrast (one line, and it currently makes the core verb invisible), `throw`'s missing drag, `reduced-motion` covering `hop` and `up`, and `user-select: none` on the tap surfaces.

The deepest fix is not a bug fix. It's deciding **which of the two products loads first** — the teacher's inventory or the child's screen. Right now they're on the same page, fighting, and the child loses.

---

I've only analyzed — no files were modified. Happy to apply any of the cuts above; I'd suggest starting with the four defect fixes, since those are uncontroversial and independently valuable.