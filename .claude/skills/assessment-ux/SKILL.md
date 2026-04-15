# Assessment UX Patterns

## When to use
Any time you're structuring the flow: question pagination, progress feedback, result reveal, share mechanics.

## Reference: 16personalities.com
Study this flow — it's the gold standard for this format. Specifically:
- Progress bar that fills as user advances (visible percentage + visual fill)
- Multiple questions per page, not one at a time (reduces perceived length)
- Smooth transitions between pages (slides or fades, never jarring)
- Clean Likert scale with generous tap targets (5 circles, biggest in the middle, or labeled buttons)
- Result page that opens with a hero visual — the type code + a radial/circular axis visual
- Shareable visual that screenshots well on mobile

## What to take, what to leave
**Take:**
- 4–5 questions per page pagination
- Progress bar + "X% complete" label
- Single-screen Likert with 5-point tap targets
- Hero result page with radial visual
- Separate "learn more about your type" long-form below the fold

**Leave:**
- Their color palette (Masterman has its own — echo from `masterman-assessment-main`)
- Their 16-type mega-content (we're lean — ~150 words per type)
- Their ads / subscription funnel (we're a lead magnet, one CTA: book a call)
- Their heavy gamification animations (we want serious, not playful)

## Mobile-first constraints
- Tap targets minimum 44px
- No text smaller than 16px
- Questions must be fully readable without zoom
- Progress bar sticky at top (always visible)
- Result page radial visual sized so it fits above the fold on a standard phone

## Pagination logic
- 20 questions ÷ 4 questions per page = 5 pages
- OR 20 questions ÷ 5 questions per page = 4 pages
- Recommend 5 pages (one page per module + one scenario page), because it maps to the mental model of "4 areas of your life"
- Back button allowed (editing answers is fine)
- Forward button disabled until all visible questions answered

## Scenario question pages
The scenario (Q5 of each module) gets its own treatment — larger card, story framing, optional icon/illustration. It should feel different from the Likert grid so the user takes it seriously.

## Micro-interactions
- Answer selection: subtle highlight, no celebration animation
- Page transition: 300ms slide or fade
- Final "See my result" button: primary color, full width, unmissable
- Loading state between "submit" and result: 1.5–2s intentional delay with a grounded message ("Reading your answers…") — not a fake progress bar, not a spinner alone

## Result page reveal sequence
1. **Hero strip:** type code + type name, centered, big
2. **Radial visual:** 4 axes as a quadrant chart / radar / circular diagram showing where user scored on each
3. **Identity line** (1 sentence, in a serif display type to feel weighty)
4. **Strength + blind spot** (two lines, side by side on desktop, stacked on mobile)
5. **Qur'an/Sunnah anchor** (pulled quote treatment, centered)
6. **Stage badge** + 1-line stage meaning
7. **Midpoint prompt** (conditional — only if `midpointFlags` is non-empty)
8. **Share block** (three buttons: WhatsApp, Instagram story, copy link — all optimized for screenshot-shareability)
9. **CTA card:** "Want your full result + your 30-day plan? Enter your email." → unlocks the long-form type write-up via email
10. **Disclaimer P.S.** (small, at the bottom, never omitted)

## Share optimization
The result page is our organic loop. Design so that when a user screenshots the top 2/3 of the page, they get:
- The 4-letter code
- The type name
- The radial visual
- The Masterman logo / wordmark (small but present)

That single screenshot, shared in a group chat, IS the ad.

## What NOT to do
- Do not show raw axis scores as numbers or percentages. Show them visually in the radial. Numbers make it feel like a test — visuals make it feel like a portrait.
- Do not gate the result behind email on first view. Show the summary, gate the long-form. Respect the user's time — trust is the primary conversion event, not email capture.
- Do not auto-play sound, video, or animations on result load.
- Do not show the cohort price anywhere on the result page. The CTA is "book a call" or "get the full plan by email." Selling happens later.
