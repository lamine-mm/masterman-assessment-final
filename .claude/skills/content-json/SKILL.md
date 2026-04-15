# Content JSON Schema

## When to use
Any time you touch `/content/*.json` or `/config/scoring.json`. Also: when designing anything that reads content, so you respect the schema.

## Principle
Non-developers (Lamine, Faizan, Shaykh Abdullah) must be able to edit content without touching code. Code reads from these files. Code never hardcodes copy, names, Qur'an anchors, question text, or disclaimer language.

## File: `content/questions.json`

```json
{
  "questions": [
    {
      "id": "Q1",
      "module": "identity",
      "axis": "A",
      "type": "likert",
      "text": "I know exactly why Allah put me on this earth, and I can say it in one sentence.",
      "scoringDirection": "A",
      "weight": 1
    },
    {
      "id": "Q5",
      "module": "identity",
      "axis": "A",
      "type": "scenario",
      "text": "Your boss asks you to do something that crosses an Islamic line. Nothing illegal, just wrong. What do you actually do?",
      "weight": 2,
      "options": [
        { "label": "Push back respectfully and refuse, even if it costs me.", "score": 2, "pole": "A" },
        { "label": "Do it this once and tell myself I'll fix it later.", "score": 2, "pole": "D" },
        { "label": "Find a workaround so I don't have to choose.", "score": 1, "pole": "D" },
        { "label": "Refuse and explain my reasoning openly.", "score": 2, "pole": "A" }
      ]
    }
  ]
}
```

**Rules:**
- Every question has `id`, `module`, `axis`, `type`, `text`, `weight`
- Likert questions have `scoringDirection` (which pole "agree" scores toward)
- Scenario questions have `options` array with explicit `score` and `pole` per option
- `module` values: `"identity" | "nafs" | "marriage" | "brotherhood"`
- `axis` values: `"A" | "G" | "S" | "C"` (always Pole A letter)

## File: `content/types.json`

```json
{
  "types": {
    "AGSC": {
      "code": "AGSC",
      "name": "The Anchored Shepherd",
      "identity": "Your house runs toward you, not away from you.",
      "strength": "You lead from conviction, not approval.",
      "blindSpot": "You can mistake silence for agreement from those you love.",
      "quranAnchor": "And We made them leaders, guiding by Our command. — Qur'an 21:73",
      "anchorSource": "Qur'an 21:73",
      "nextStep": "Ask your wife one hard question this week — and sit with the answer."
    }
  }
}
```

**Rules:**
- All 16 type codes must be present before launch
- `name`, `identity`, `strength`, `blindSpot`, `nextStep` are all edited by Shaykh Abdullah
- `quranAnchor` and `anchorSource` must match an approved reference — never invented
- Target 150 words total across all fields per type

## File: `content/stages.json`

```json
{
  "stages": [
    {
      "number": 1,
      "name": "The Drifter",
      "meaning": "Going through the motions. Praying maybe. Providing maybe. Heart not in it.",
      "guidance": "The first step is waking up to where you actually are — not where you tell people you are.",
      "scoreRange": [0, 25]
    }
  ]
}
```

## File: `content/copy.json`

```json
{
  "landing": { "hero": "...", "subhero": "...", "cta": "..." },
  "intro": { "title": "...", "body": "...", "cta": "Begin" },
  "emailCapture": { "teaser": "...", "cta": "..." },
  "disclaimer": {
    "short": "P.S. This assessment is a personal growth tool...",
    "long": "The Masterman Assessment is an educational and self-reflection tool..."
  },
  "share": { "whatsappMessage": "...", "tweetText": "..." }
}
```

## File: `config/scoring.json`

```json
{
  "likertValues": { "stronglyAgree": 2, "agree": 1, "neutral": 0, "disagree": -1, "stronglyDisagree": -2 },
  "scenarioWeight": 2,
  "stageThresholds": [25, 50, 75, 100],
  "midpointSensitivity": 0.10
}
```

## Rules for code reading these files
- Fail loudly if a required field is missing (don't silently fall back)
- Validate on load using a schema (Zod or similar)
- Never cache content across deploys — content is expected to change
- If a type is missing from `types.json`, show a graceful fallback ("Your full result is being prepared — check your email") rather than crash

## When Shaykh Abdullah or Faizan approves the final review doc
1. Paste questions into `content/questions.json`
2. Paste type write-ups into `content/types.json`
3. Paste stage definitions into `content/stages.json`
4. Paste disclaimer + landing copy into `content/copy.json`
5. Commit with message: `content: apply reviewed copy from [date] review doc`
6. No code changes needed. Deploy.
