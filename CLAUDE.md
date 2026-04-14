# Masterman Assessment v2 — Project Context

## One-line purpose
A 4-minute, therapist- and scholar-verified mirror that shows a Muslim professional his type and his stage — so he trusts us enough to have the next conversation.

## What we're building
A lead-magnet assessment app. Not a quiz. A diagnostic. The output earns the right to the next conversation (email opt-in → strategy call). We are NOT trying to close the cohort sale on the result page.

## Audience
Muslim professionals, late 20s to mid-40s. Seasoned and young. Married, engaged, considering marriage, or single. Single respondents answer Module 3 hypothetically — based on the husband and father they intend to become, in shaa Allah.

## Voice
Shaykh Abdullah Oduro's voice: imam-as-older-brother, Qur'an and Sunnah grounded, never secular self-help vocabulary. Grade 5 reading level on all user-facing copy. See `.claude/skills/masterman-voice/SKILL.md`.

## Visual inspiration
- **Echo from:** `masterman-assessment-main` (existing repo) — fonts, colors, button style, card style
- **Structure inspired by:** 16personalities.com — progress bar, 4–5 questions per page, clean radial/circular visual for axis scores on the result page, shareable 4-letter code as hero
- **NOT copying either.** Masterman visual language layered on 16personalities structural pattern.

## Architecture: TYPE + STAGE

### TYPE = 4 binary axes = 16 types
| Module | Axis Letter | Pole A | Pole B |
|---|---|---|---|
| Identity & Leadership | A | **A**nchored | **D**rifting |
| Nafs & Discipline | G | **G**overned | **R**eactive |
| Marriage & Family | S | **S**hepherd | **P**assive |
| Brotherhood | C | **C**onnected | **I**solated |

Type code = 4 letters, e.g. `AGSC` = "The Anchored Shepherd". 16 total types.

### STAGE = 4 levels (calculated from total score across all modules)
1. **The Drifter** — going through motions, autopilot
2. **The Builder** — awake to the gap, inconsistent but moving
3. **The Anchored** — consistent in fundamentals, has blind spots
4. **The Shepherd** — living it, other men look to him

## Question structure
- **20 questions total**, 5 per module
- Per module: 4 Likert (5-point) + 1 scenario (4 options, 2x weight)
- Target completion time: 3.5–4 minutes
- Paginated: 4–5 questions per page + progress bar
- Module 3 has a "Are you currently married?" toggle at the start — if no, Likert questions auto-rephrase to hypothetical future tense ("When I marry, I will…")

## Scoring engine

**Input:** array of 20 answers
**Output:**
```ts
type AssessmentResult = {
  type: string;              // e.g. "AGSC"
  stage: 1 | 2 | 3 | 4;
  axisScores: {              // 0–1, >0.5 = Pole A
    A: number; G: number; S: number; C: number;
  };
  midpointFlags: string[];   // e.g. ["G", "C"] if within 0.10 of 0.50
  totalScore: number;
};
```

**Logic:**
- Likert: strongly agree = +2, agree = +1, neutral = 0, disagree = −1, strongly disagree = −2 (signed toward Pole A)
- Scenario: 2x weight
- Axis score = normalize to 0–1 where >0.5 = Pole A
- Stage thresholds: tunable in `config/scoring.json`
- Midpoint flag = axis within 0.10 of 0.50 → triggers retake-prompt copy

## Page/route map
1. `/` — Landing page (sell the value, disclaimer in footer)
2. `/start` — Intro screen (disclaimer, time expectation, "Begin")
3. `/assessment` — Paginated questions (4–5 per page, progress bar)
4. `/result/unlock` — Email capture (short teaser of result)
5. `/result/:id` — Full result page (type + stage + radial visual + share + CTA)
6. Email sequence — triggered on email capture

## Result page must include
- Hero: 4-letter type code + type name
- Radial/circular visual showing 4 axis scores (16personalities-style, Masterman palette)
- One-line identity
- Core strength (1 line)
- Core blind spot / nafs trap (1 line)
- One Qur'an or Sunnah anchor (pulled from `content/types.json`)
- Stage badge + 1-line stage meaning
- Midpoint retake prompt if applicable
- Share buttons (screenshot-optimized — this is the virality loop)
- CTA: "Get your full result by email"
- Disclaimer P.S.

## Content files (single source of truth)
- `content/questions.json` — 20 questions with scoring keys
- `content/types.json` — 16 type write-ups
- `content/stages.json` — 4 stage definitions
- `content/copy.json` — landing, CTAs, email templates, disclaimer (short + long)
- `config/scoring.json` — thresholds, weights, midpoint sensitivity

Content files are edited by non-developers. See `.claude/skills/content-json/SKILL.md` for schema.

## Disclaimer (must appear in 3 places)
- Landing page footer (long version)
- Intro screen before Q1 (long version)
- Result page P.S. + result email footer (short version)

Source: `content/copy.json` → `disclaimer.short` and `disclaimer.long`.

## What stays from v1 (`masterman-assessment-main`)
UI primitives only: fonts, colors, button component, card component, layout container.

## What gets replaced
Everything else: questions, scoring, results, data model, routes, state management.

## Tech stack (confirm or override)
Assume the v1 stack unless the audit says otherwise. Default: Next.js + TypeScript + Tailwind. Persistence for results so users can return to their result via a unique `/result/:id` URL.

## Hard constraints
- Grade 5 reading level on ALL user-facing copy
- No secular self-help vocabulary (no "mindset," "crushing it," "level up," "best self," etc.)
- All Islamic references pulled from Shaykh-approved `content/*.json` — never hardcoded
- Mobile-first
- Result page must be screenshot-beautiful (this is the social proof loop)
- Never display a result without the disclaimer P.S. visible

## Phase 2 (spec only, do not build in v2.0)
Post-opt-in, pre-call: optional 10-question "depth scan" that refines stage and feeds the sales call. Build in v2.1.

## Review workflow
All content originates in the Faizan + Shaykh Abdullah review doc (Word file). When they approve edits, we update the JSON — no code changes. The review doc is the source of truth for content; the code is the source of truth for logic.
