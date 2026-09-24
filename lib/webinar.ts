/**
 * Free live class (webinar) CTA on the result page.
 *
 * Topic, wording and date come from the apply.* webinar registry at request
 * time — the same `GET /api/webinar/current` the event landing reads — so a
 * new webinar rolls the CTA forward on its own, no redeploy and no copy edit.
 * Every hardcoded webinar topic we ever shipped went stale within weeks.
 * When the endpoint is unreachable or the webinar has no custom landing copy,
 * the caller falls back to the evergreen wording in content/copy.json.
 */
const WEBINAR_URL = "https://event.mastermangroup.com";

const CURRENT_WEBINAR_URL =
  process.env.NEXT_PUBLIC_WEBINAR_CURRENT_URL ??
  "https://apply.mastermangroup.com/api/webinar/current";

/** utm_content — which CTA on the result page produced the click. */
export type WebinarPlacement = "result-top-banner" | "result-code-card";

export function getWebinarUrl(placement: WebinarPlacement, stage?: number): string {
  const url = new URL(WEBINAR_URL);
  url.searchParams.set("utm_source", "assessment");
  url.searchParams.set("utm_medium", "result-page");
  url.searchParams.set("utm_campaign", "masterman-assessment");
  url.searchParams.set("utm_content", placement);
  if (stage) url.searchParams.set("utm_term", `stage-${stage}`);
  return url.toString();
}

export type CurrentWebinar = {
  /** Hero headline of the live landing page, e.g. "Why You Keep Starting Over". */
  title: string | null;
  /** Hero subheadline — one line on what the class covers. */
  body: string | null;
  /** e.g. "Saturday, October 3rd · 12:00 PM CST / 1:00 PM EST". */
  dateLine: string | null;
};

const EMPTY: CurrentWebinar = { title: null, body: null, dateLine: null };

/**
 * Current webinar, best-effort. Cached 60s (same window as the landing) and
 * never throws — the result page must render even if apply.* is down.
 */
export async function fetchCurrentWebinar(): Promise<CurrentWebinar> {
  try {
    const res = await fetch(CURRENT_WEBINAR_URL, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return EMPTY;
    const w = (await res.json()) as {
      date_line?: string | null;
      landing_content?: {
        headline?: string;
        headlineHighlight?: string;
        subheadline?: string;
      } | null;
    };
    const content = w.landing_content ?? {};
    // The landing renders headline + headlineHighlight as one sentence.
    const title = [content.headline, content.headlineHighlight]
      .filter(Boolean)
      .join(" ")
      .trim();
    return {
      title: title || null,
      body: content.subheadline?.trim() || null,
      dateLine: w.date_line?.trim() || null,
    };
  } catch {
    return EMPTY;
  }
}
