/**
 * ConvertKit API v3 integration.
 * Uses api_secret for all calls (v4 token not active on this account).
 *
 * Non-blocking: all functions log errors and return null rather than
 * crashing the assessment flow if CK is unavailable.
 */

const CK_BASE = "https://api.convertkit.com/v3";
const API_SECRET = process.env.CONVERTKIT_API_SECRET;

function isConfigured(): boolean {
  if (!API_SECRET) {
    console.warn("[ConvertKit] CONVERTKIT_API_SECRET not set — skipping CK calls.");
    return false;
  }
  return true;
}

// ─── Subscribe (create or update) with a tag ─────────────────────────────────
// v3: POST /tags/:tag_id/subscribe  → creates subscriber + applies tag in one call

async function subscribeWithTag(
  tagId: string,
  data: { email: string; firstName: string; fields?: Record<string, string> }
): Promise<string | null> {
  const res = await fetch(`${CK_BASE}/tags/${tagId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_secret: API_SECRET,
      first_name: data.firstName,
      email: data.email,
      fields: data.fields ?? {},
    }),
  });

  if (!res.ok) {
    console.error("[ConvertKit] subscribeWithTag failed:", await res.text());
    return null;
  }

  const json = await res.json();
  return json?.subscription?.subscriber?.id?.toString() ?? null;
}

// ─── Tag an existing subscriber by email ─────────────────────────────────────

async function tagByEmail(tagId: string, email: string, firstName: string): Promise<void> {
  const res = await fetch(`${CK_BASE}/tags/${tagId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_secret: API_SECRET,
      email,
      first_name: firstName,
    }),
  });

  if (!res.ok) {
    console.error("[ConvertKit] tagByEmail failed:", await res.text());
  }
}

// ─── Enroll in a sequence ─────────────────────────────────────────────────────

async function enrollInSequence(
  sequenceId: string,
  email: string,
  firstName: string
): Promise<void> {
  const res = await fetch(`${CK_BASE}/sequences/${sequenceId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_secret: API_SECRET,
      email,
      first_name: firstName,
    }),
  });

  if (!res.ok) {
    console.error("[ConvertKit] enrollInSequence failed:", await res.text());
  }
}

// ─── Get subscriber ID by email ───────────────────────────────────────────────

async function getSubscriberIdByEmail(email: string): Promise<string | null> {
  const res = await fetch(
    `${CK_BASE}/subscribers?api_secret=${API_SECRET}&email_address=${encodeURIComponent(email)}`
  );

  if (!res.ok) return null;
  const json = await res.json();
  const subscribers = json?.subscribers ?? [];
  return subscribers[0]?.id?.toString() ?? null;
}

// ─── Update subscriber custom fields ─────────────────────────────────────────

async function updateSubscriberFields(
  subscriberId: string,
  fields: Record<string, string>
): Promise<void> {
  const res = await fetch(`${CK_BASE}/subscribers/${subscriberId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_secret: API_SECRET, fields }),
  });

  if (!res.ok) {
    console.error("[ConvertKit] updateSubscriberFields failed:", await res.text());
  }
}

// ─── High-level helpers ───────────────────────────────────────────────────────

/**
 * Called at /api/register.
 * Creates subscriber + tags "assessment-started" + stores phone as custom field.
 * Returns the CK subscriber ID (stored on the lead row for future calls).
 */
export async function onLeadRegistered(data: {
  email: string;
  firstName: string;
  phone?: string;
}): Promise<string | null> {
  if (!isConfigured()) return null;

  const startTagId = process.env.CONVERTKIT_TAG_ASSESSMENT_STARTED;
  if (!startTagId) {
    console.warn("[ConvertKit] CONVERTKIT_TAG_ASSESSMENT_STARTED not set");
    return null;
  }

  const subscriberId = await subscribeWithTag(startTagId, {
    email: data.email,
    firstName: data.firstName,
    fields: { phone: data.phone ?? "" },
  });

  return subscriberId;
}

/**
 * Called at /api/submit after scoring.
 * Tags "assessment-complete", adds type + stage tags (if configured),
 * updates custom fields, and enrolls in the result email sequence.
 */
export async function onAssessmentComplete(data: {
  email: string;
  firstName: string;
  subscriberId: string | null;
  typeCode: string;
  stage: number;
}): Promise<void> {
  if (!isConfigured()) return;

  const { email, firstName, subscriberId, typeCode, stage } = data;

  // Tag: assessment-complete
  const completeTagId = process.env.CONVERTKIT_TAG_ASSESSMENT_COMPLETE;
  if (completeTagId) await tagByEmail(completeTagId, email, firstName);

  // Tag: type-specific (e.g. CONVERTKIT_TAG_TYPE_AGSC) — optional, add in .env when created
  const typeTagId = process.env[`CONVERTKIT_TAG_TYPE_${typeCode}`];
  if (typeTagId) await tagByEmail(typeTagId, email, firstName);

  // Tag: stage-specific (e.g. CONVERTKIT_TAG_STAGE_4) — optional
  const stageTagId = process.env[`CONVERTKIT_TAG_STAGE_${stage}`];
  if (stageTagId) await tagByEmail(stageTagId, email, firstName);

  // Update custom fields with type + stage (so Kit automations can branch on them)
  const subId = subscriberId ?? (await getSubscriberIdByEmail(email));
  if (subId) {
    await updateSubscriberFields(subId, {
      masterman_type: typeCode,
      masterman_stage: stage.toString(),
    });
  }

  // Enroll in result email sequence
  const sequenceId = process.env.CONVERTKIT_SEQUENCE_RESULT;
  if (sequenceId) await enrollInSequence(sequenceId, email, firstName);
}
