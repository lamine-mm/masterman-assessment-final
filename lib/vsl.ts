/**
 * VSL (video sales letter) config for the /plan page.
 * Swapping the video or runtime is a one-line edit here — nowhere else.
 * NOTE: the visible "8 min" string lives in content/copy.json (plan.videoCaption).
 */
export const VSL_CONFIG = {
  /** YouTube video id (the part after v= or youtu.be/) */
  youtubeId: "5LxtKX-i9zg",
  /** Runtime in minutes */
  minutes: 8,
} as const;

/** youtube-nocookie embed URL — the video plays on our page, never links out. */
export function getVslEmbedUrl(): string {
  return `https://www.youtube-nocookie.com/embed/${VSL_CONFIG.youtubeId}?rel=0&modestbranding=1`;
}

/**
 * Book-a-call URL with UTM tracking. utm_content carries the stage so bookings
 * are traceable to the stage that produced them.
 */
export function getBookingUrl(stage?: number): string {
  // .trim() guards against stray whitespace/newlines in the env var value —
  // a trailing newline here once shipped a corrupted href to production.
  const base = (
    process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://apply.mastermangroup.com"
  ).trim();
  const utm =
    "utm_source=assessment&utm_medium=vsl-page&utm_campaign=masterman-assessment";
  return `${base}?${utm}${stage ? `&utm_content=stage-${stage}` : ""}`;
}
