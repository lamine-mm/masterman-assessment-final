/**
 * Outbound webhook fanout module.
 *
 * Fires JSON POST requests to configured external URLs (n8n, Zapier, etc.)
 * with retry (1 retry on failure) and full audit logging to the webhook_log table.
 *
 * Non-blocking: callers fire-and-forget with .catch() — webhook failures
 * never interrupt the user-facing flow.
 *
 * Env vars (optional — if unset, the corresponding webhook is silently skipped):
 *   OUTBOUND_WEBHOOK_LEAD_URL    — fires on lead registration
 *   OUTBOUND_WEBHOOK_RESULT_URL  — fires on assessment completion
 */

import { getSupabase } from "@/lib/db";

type WebhookEvent = "lead_captured" | "assessment_completed";

export interface LeadCapturedPayload {
  event: "lead_captured";
  timestamp: string;
  leadId: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AssessmentCompletedPayload {
  event: "assessment_completed";
  timestamp: string;
  resultId: string;
  leadId: string;
  name: string;
  email: string;
  typeCode: string;
  typeName: string;
  stage: number;
  stageName: string;
  axisScores: { A: number; G: number; S: number; C: number };
  totalScore: number;
  midpointFlags: string[];
  resultUrl: string;
}

type WebhookPayload = LeadCapturedPayload | AssessmentCompletedPayload;

// ─── Core dispatch ────────────────────────────────────────────────────────────

async function dispatch(
  event: WebhookEvent,
  targetUrl: string,
  payload: WebhookPayload,
  attempt: number = 1
): Promise<void> {
  let statusCode: number | null = null;
  let errorMsg: string | null = null;
  let succeeded = false;

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    statusCode = res.status;
    succeeded = res.ok;

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      errorMsg = `HTTP ${res.status}: ${body.slice(0, 200)}`;
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  // ─── Audit log (best-effort, never throws) ────────────────────────────────
  try {
    await getSupabase().from("webhook_log").insert({
      event,
      target_url: targetUrl,
      payload,
      status_code: statusCode,
      error: errorMsg,
      attempt,
      succeeded,
    });
  } catch (logErr) {
    console.error("[webhooks] Failed to write audit log:", logErr);
  }

  // ─── One retry on failure ─────────────────────────────────────────────────
  if (!succeeded && attempt === 1) {
    console.warn(
      `[webhooks] ${event} → ${targetUrl} failed (attempt 1). Retrying…`
    );
    await new Promise((r) => setTimeout(r, 1000));
    return dispatch(event, targetUrl, payload, 2);
  }

  if (!succeeded) {
    console.error(
      `[webhooks] ${event} → ${targetUrl} failed after 2 attempts. Error: ${errorMsg}`
    );
  }
}

// ─── High-level helpers ───────────────────────────────────────────────────────

/**
 * Fire the lead-captured webhook.
 * Reads OUTBOUND_WEBHOOK_LEAD_URL from env — no-ops if unset.
 */
export async function fireLeadCaptured(
  data: Omit<LeadCapturedPayload, "event" | "timestamp">
): Promise<void> {
  const url = process.env.OUTBOUND_WEBHOOK_LEAD_URL;
  if (!url) return;

  const payload: LeadCapturedPayload = {
    event: "lead_captured",
    timestamp: new Date().toISOString(),
    ...data,
  };

  await dispatch("lead_captured", url, payload);
}

/**
 * Fire the assessment-completed webhook.
 * Reads OUTBOUND_WEBHOOK_RESULT_URL from env — no-ops if unset.
 */
export async function fireAssessmentCompleted(
  data: Omit<AssessmentCompletedPayload, "event" | "timestamp">
): Promise<void> {
  const url = process.env.OUTBOUND_WEBHOOK_RESULT_URL;
  if (!url) return;

  const payload: AssessmentCompletedPayload = {
    event: "assessment_completed",
    timestamp: new Date().toISOString(),
    ...data,
  };

  await dispatch("assessment_completed", url, payload);
}
