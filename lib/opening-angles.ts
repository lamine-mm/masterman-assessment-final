/**
 * Opening-angle generator.
 *
 * Returns a personalized conversation opener for the sales/coaching call,
 * based on the lead's type code, stage, midpoint flags, and first name.
 *
 * Logic:
 *   1. Look up the type's entries in content/opening-angles.json
 *   2. Pick stageEarly (stages 1-2) or stageLate (stages 3-4)
 *   3. Replace {name} placeholder with firstName
 *   4. If midpointFlags exist, append the closeCallSuffix with axis names
 *
 * Falls back to a safe generic opener if the type code is not found.
 */

import rawAngles from "@/content/opening-angles.json";
import { AXIS_LABELS } from "@/lib/types";
import type { AxisKey } from "@/lib/types";

interface AngleEntry {
  stageEarly: string;
  stageLate: string;
  closeCallSuffix: string;
}

type AnglesFile = {
  angles: Record<string, AngleEntry>;
};

const angles = (rawAngles as AnglesFile).angles;

const FALLBACK_EARLY =
  "{name}, your result is ready and there is a lot to talk through. Let us start where your answers pointed most clearly.";
const FALLBACK_LATE =
  "{name}, your result shows real strengths and a clear next step. Let us talk through what that looks like for you.";

function axisNames(flags: AxisKey[]): string {
  if (flags.length === 0) return "";
  const names = flags.map((f) => AXIS_LABELS[f]);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
}

/**
 * @param typeCode  4-letter type code e.g. "AGSC"
 * @param stage     1 | 2 | 3 | 4
 * @param midpointFlags  axes where score is within 0.10 of 0.50
 * @param firstName  lead's first name
 * @returns         Ready-to-speak opening sentence(s)
 */
export function getOpeningAngle(
  typeCode: string,
  stage: 1 | 2 | 3 | 4,
  midpointFlags: AxisKey[],
  firstName: string
): string {
  const entry = angles[typeCode];
  const isEarly = stage <= 2;

  const template = entry
    ? isEarly
      ? entry.stageEarly
      : entry.stageLate
    : isEarly
      ? FALLBACK_EARLY
      : FALLBACK_LATE;

  let result = template.replace(/\{name\}/g, firstName);

  if (midpointFlags.length > 0 && entry) {
    const axisPhrase = axisNames(midpointFlags);
    const suffix = entry.closeCallSuffix.replace(/\{AXES\}/g, axisPhrase);
    result = `${result} ${suffix}`;
  }

  return result;
}
