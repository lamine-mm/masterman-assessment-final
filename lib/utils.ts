import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const APPLY_URL_DEFAULT = "https://programs.mastermangroup.com";

/**
 * Build the Apply CTA URL with UTM params identifying the assessment as the source.
 * `campaign` should describe where the click originated (e.g. "stage-3", "thank-you").
 */
export function buildApplyUrl(campaign: string): string {
  const base = process.env.NEXT_PUBLIC_APPLY_URL ?? APPLY_URL_DEFAULT;
  const sep = base.includes("?") ? "&" : "?";
  const params = new URLSearchParams({
    utm_source: "masterman-assessment",
    utm_medium: "cta",
    utm_campaign: campaign,
  });
  return `${base}${sep}${params.toString()}`;
}
