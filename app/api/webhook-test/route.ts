/**
 * POST /api/webhook-test
 * Fires a fully-populated mock `assessment_completed` payload to all configured
 * outbound webhook URLs (OUTBOUND_WEBHOOK_RESULT_URL, OUTBOUND_WEBHOOK_GHL_URL).
 *
 * Purpose: let GHL "learn" all available fields so template variables work.
 * Requires: ?secret=<WEBHOOK_TEST_SECRET> query param (set in env vars).
 *
 * Usage:
 *   curl -X POST "https://your-domain.com/api/webhook-test?secret=YOUR_SECRET"
 */

import { NextResponse } from "next/server";
import { fireAssessmentCompleted } from "@/lib/webhooks";

const MOCK_PAYLOAD = {
  resultId: "test-result-00000000",
  leadId: "test-lead-00000000",
  name: "Ahmed Yusuf",
  email: "test@example.com",
  phone: "+12025550123",
  country: "United States",
  age: 34,
  typeCode: "AGSC",
  typeName: "The Anchored Shepherd",
  stage: 3 as const,
  stageName: "The Anchored",
  strength: "You lead from principle, not pressure.",
  blindSpot: "You can be so focused on your vision that you miss the people right next to you.",
  nextStep: "Build accountability with one brother who will tell you the truth.",
  axisScores: { A: 0.78, G: 0.65, S: 0.72, C: 0.58 },
  totalScore: 68,
  midpointFlags: [] as string[],
  resultUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://masterman.app"}/result/test-result-00000000`,
};

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const expectedSecret = process.env.WEBHOOK_TEST_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await fireAssessmentCompleted(MOCK_PAYLOAD);
    return NextResponse.json({
      ok: true,
      message: "Mock assessment_completed webhook fired.",
      payload: MOCK_PAYLOAD,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
