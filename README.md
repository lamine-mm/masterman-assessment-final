# Masterman Assessment — Final

A 4-minute diagnostic lead-magnet for Muslim professionals. Outputs a 4-letter type code (AGSC model, 16 types) + a stage (1–4). Goal: earn trust → email opt-in → strategy call.

**Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS · Supabase · ConvertKit v3

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/lamine-mm/masterman-assessment-final.git
cd masterman-assessment-final
npm install
```

### 2. Create `.env.local`

Copy the template below into `.env.local` at the project root. Never commit this file.

```env
# ── Supabase ──────────────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── ConvertKit (v3 API — uses api_secret, not v4 token) ───────────────────────
CONVERTKIT_API_KEY=your-api-key
CONVERTKIT_API_SECRET=your-api-secret
CONVERTKIT_TAG_ASSESSMENT_STARTED=tag-id-number
CONVERTKIT_TAG_ASSESSMENT_COMPLETE=tag-id-number
CONVERTKIT_SEQUENCE_RESULT=sequence-id-number

# ── App ────────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BOOKING_URL=https://calendly.com/your-link

# ── Outbound webhooks (optional — leave blank to disable) ────────────────────
# These fire to n8n / Zapier / Make for Google Sheets logging and CRM sync.
# OUTBOUND_WEBHOOK_LEAD_URL=https://your-n8n-instance.com/webhook/lead-captured
# OUTBOUND_WEBHOOK_RESULT_URL=https://your-n8n-instance.com/webhook/assessment-completed
```

### 3. Run database migrations

Open **Supabase Dashboard → SQL Editor → New query**, paste the contents of `supabase/migration.sql`, and click Run. This creates three tables: `leads`, `results`, and `webhook_log`.

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

The app validates all required env vars at boot via `instrumentation.ts`. Missing vars produce a clear error before the first request.

---

## Environment Variables

### Required

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (not the anon key — needed for server-side writes) |
| `CONVERTKIT_API_SECRET` | ConvertKit API secret (v3 auth — not the v4 bearer token) |
| `CONVERTKIT_TAG_ASSESSMENT_STARTED` | Tag ID applied when a lead registers |
| `CONVERTKIT_TAG_ASSESSMENT_COMPLETE` | Tag ID applied when assessment is submitted |
| `CONVERTKIT_SEQUENCE_RESULT` | Sequence ID for the result email |
| `NEXT_PUBLIC_BASE_URL` | Full URL of the deployment (e.g. `https://yourdomain.com`) |

### Optional

| Variable | Description | Effect if missing |
|---|---|---|
| `NEXT_PUBLIC_BOOKING_URL` | Calendly or booking link | Button on `/thank-you` shows `#` |
| `OUTBOUND_WEBHOOK_LEAD_URL` | n8n/Zapier URL for lead-captured events | Webhook silently skipped |
| `OUTBOUND_WEBHOOK_RESULT_URL` | n8n/Zapier URL for assessment-completed events | Webhook silently skipped |
| `CONVERTKIT_TAG_TYPE_AGSC` (×16) | Per-type ConvertKit tag IDs | Type-specific tagging skipped |
| `CONVERTKIT_TAG_STAGE_1` (×4) | Per-stage ConvertKit tag IDs | Stage-specific tagging skipped |

---

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | Static | Landing page — reads `content/copy.json` |
| `/register` | Static | Lead capture — name, email, phone |
| `/start` | Static | Intro screen with full disclaimer |
| `/assessment` | Client | Paginated quiz — 4 pages × 5 questions |
| `/result/[id]` | SSR | Full result page — type + stage + chart |
| `/thank-you` | SSR | Post-result CTA — book a call |
| `POST /api/register` | API | Create lead → Supabase + ConvertKit + webhook |
| `POST /api/submit` | API | Score answers → persist → ConvertKit + webhook |
| `GET /api/result/[id]` | API | Fetch result by UUID |

---

## Content Files

All user-facing copy, questions, and Islamic references live in `content/`. These files are the only ones non-developers should ever edit.

| File | What it controls |
|---|---|
| `content/questions.json` | All 20 questions (text, scoring direction, options) |
| `content/types.json` | 16 type write-ups (name, identity, strength, blind spot, Qur'an anchor) |
| `content/stages.json` | 4 stage definitions (name, meaning, guidance) |
| `content/copy.json` | Landing copy, CTAs, disclaimer (short + long), share messages |
| `content/opening-angles.json` | Sales call openers — one per type, two stage groups (early/late) |
| `config/scoring.json` | Thresholds, weights, midpoint sensitivity — tunable without code changes |

**Do not edit field names or IDs.** Text values are safe to change. Structural changes require a developer.

---

## Scoring Engine

```
Input:  20 answers (Likert 1–5, scenario 0–3)
Output: { type, stage, axisScores, midpointFlags, totalScore }
```

- **Likert:** 1=−2, 2=−1, 3=0, 4=+1, 5=+2 (signed toward pole A; B-direction questions flipped)
- **Scenario:** `option.score × (pole === "A" ? +1 : −1) × 2` (double weight)
- **Axis score:** `(rawScore + 12) / 24` → [0.0, 1.0]; >0.5 = Pole A
- **Type code:** A>0.5→"A"/"D", G→"G"/"R", S→"S"/"P", C→"C"/"I"
- **Stage:** totalScore ≤25→1, ≤50→2, ≤75→3, >75→4 (thresholds in `config/scoring.json`)
- **Midpoint flag:** `|axisScore − 0.5| < 0.10` → triggers retake prompt

---

## Testing

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

The test suite covers the scoring engine (all Likert values, scenario weights, stage boundaries, type code derivation, midpoint flags) and the opening-angle generator (all 16 types × 2 stage groups × close-call combinations).

---

## Deploy to Vercel

1. Push to GitHub: `git push origin master`
2. Connect the repo to a new Vercel project (use root `/` as the project root — it is a Next.js app)
3. Add all required env vars in **Vercel → Project Settings → Environment Variables**
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain (e.g. `https://mastermanassessment.com`)
5. Deploy

Vercel auto-detects Next.js. No `vercel.json` needed.

---

## Outbound Webhooks (n8n / Zapier)

Two events are fired as JSON POST requests to the URLs you configure:

### `lead_captured` (fires at `/api/register`)
```json
{
  "event": "lead_captured",
  "timestamp": "2026-04-14T10:00:00.000Z",
  "leadId": "uuid",
  "name": "Ibrahim",
  "email": "ibrahim@example.com",
  "phone": "+1555000"
}
```

### `assessment_completed` (fires at `/api/submit`)
```json
{
  "event": "assessment_completed",
  "timestamp": "2026-04-14T10:04:00.000Z",
  "resultId": "uuid",
  "leadId": "uuid",
  "name": "Ibrahim",
  "email": "ibrahim@example.com",
  "typeCode": "AGSC",
  "typeName": "The Anchored Shepherd",
  "stage": 4,
  "stageName": "The Shepherd",
  "axisScores": { "A": 0.83, "G": 0.75, "S": 0.91, "C": 0.62 },
  "totalScore": 78,
  "midpointFlags": [],
  "resultUrl": "https://yourdomain.com/result/uuid"
}
```

Webhooks retry once on failure and log every attempt to the `webhook_log` Supabase table.

### Testing webhooks locally

Use [ngrok](https://ngrok.com) or `npx localtunnel` to expose your local server:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx ngrok http 3000
# Copy the HTTPS URL, e.g. https://abc123.ngrok.io

# Set in .env.local:
# OUTBOUND_WEBHOOK_LEAD_URL=https://abc123.ngrok.io/api/register  ← points to n8n
```

Or use a service like [webhook.site](https://webhook.site) to inspect payloads during development.

---

## Google Apps Script (Google Sheets Integration)

If using n8n to sync data to Google Sheets, you can also use a direct Apps Script webhook as an alternative.

1. Open your Google Sheet → **Extensions → Apps Script**
2. Paste this handler:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
  
  if (data.event === "lead_captured") {
    sheet.appendRow([
      new Date(), data.leadId, data.name, data.email, data.phone, "", "", ""
    ]);
  }
  
  if (data.event === "assessment_completed") {
    // Find and update existing row by leadId
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === data.leadId) {
        sheet.getRange(i + 1, 7).setValue(data.typeCode);   // col G
        sheet.getRange(i + 1, 8).setValue(data.stage);       // col H
        sheet.getRange(i + 1, 9).setValue(data.resultUrl);   // col I
        break;
      }
    }
  }
  
  return ContentService.createTextOutput("ok");
}
```

3. **Deploy → New deployment → Web app** → execute as Me, access Anyone
4. Copy the deployment URL → set as `OUTBOUND_WEBHOOK_LEAD_URL` and `OUTBOUND_WEBHOOK_RESULT_URL`

Sheet columns: Date | LeadId | Name | Email | Phone | — | TypeCode | Stage | ResultUrl

---

## Content Update Workflow

1. Faizan or Shaykh Abdullah approves edits in the Word review doc
2. Developer updates the relevant `content/*.json` file
3. `npm run build` — Zod validation catches any schema errors immediately
4. Commit and push → Vercel auto-deploys

No code changes needed for content updates.
