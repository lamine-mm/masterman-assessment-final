/**
 * Environment variable validation.
 * Import this module at the start of any function that needs env vars.
 * Called from instrumentation.ts at server boot so missing vars fail loudly
 * before the first real request arrives.
 */

type EnvKey =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "CONVERTKIT_API_SECRET"
  | "CONVERTKIT_TAG_ASSESSMENT_STARTED"
  | "CONVERTKIT_TAG_ASSESSMENT_COMPLETE"
  | "CONVERTKIT_SEQUENCE_RESULT"
  | "NEXT_PUBLIC_BASE_URL";

const REQUIRED: EnvKey[] = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CONVERTKIT_API_SECRET",
  "CONVERTKIT_TAG_ASSESSMENT_STARTED",
  "CONVERTKIT_TAG_ASSESSMENT_COMPLETE",
  "CONVERTKIT_SEQUENCE_RESULT",
  "NEXT_PUBLIC_BASE_URL",
];

/** Optional vars — missing = feature disabled, not a crash. */
const OPTIONAL_DESCRIBED: Record<string, string> = {
  OUTBOUND_WEBHOOK_LEAD_URL: "Outbound webhook for lead-captured events (n8n / Zapier)",
  OUTBOUND_WEBHOOK_RESULT_URL: "Outbound webhook for assessment-completed events (n8n / Zapier)",
  NEXT_PUBLIC_BOOKING_URL: "Calendly or booking link shown on /thank-you",
  CONVERTKIT_TAG_TYPE_AGSC: "ConvertKit tag for type AGSC (and other CONVERTKIT_TAG_TYPE_* vars)",
  CONVERTKIT_TAG_STAGE_1: "ConvertKit tag for stage 1 (and other CONVERTKIT_TAG_STAGE_* vars)",
};

let validated = false;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `\n\n  ❌  Masterman Assessment — missing required environment variables:\n\n` +
        missing.map((k) => `     • ${k}`).join("\n") +
        `\n\n  Add them to .env.local for local dev, or to your Vercel project settings for production.\n  See README.md → Environment Variables.\n`
    );
  }

  if (!validated) {
    const disabledFeatures = Object.entries(OPTIONAL_DESCRIBED)
      .filter(([key]) => !process.env[key])
      .map(([key, desc]) => `     • ${key}  (${desc})`)
      .join("\n");

    if (disabledFeatures) {
      console.info(
        `[env] Optional env vars not set — features disabled:\n${disabledFeatures}`
      );
    }

    validated = true;
  }
}

/** Get a required env var — throws if missing (should not happen after validateEnv). */
export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(
      `[env] Required environment variable "${key}" is not set. ` +
        `Run validateEnv() at startup to catch this early.`
    );
  }
  return val;
}
