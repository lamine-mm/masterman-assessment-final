/**
 * POST /api/submit
 * Scores 20 answers, persists result, fires ConvertKit automation.
 * Returns { resultId } — client redirects to /result/:resultId.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getQuestions, getTypeContent, getStageContent } from "@/lib/content";
import { scoreAssessment } from "@/lib/scoring";
import { createResult, getSupabase } from "@/lib/db";
import { onAssessmentComplete } from "@/lib/convertkit";
import { fireAssessmentCompleted } from "@/lib/webhooks";

const AnswerSchema = z.object({
  questionId: z.string(),
  value: z.number().int().min(0).max(5),
});

const BodySchema = z.object({
  answers: z.array(AnswerSchema).min(1).max(20),
  married: z.boolean(),
});

export async function POST(request: Request) {
  // 1. Read leadId from cookie (set at /api/register)
  const cookieStore = await cookies();
  const leadId = cookieStore.get("lead_id")?.value;
  if (!leadId) {
    return NextResponse.json(
      { error: "No active session. Please start from the beginning." },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { answers, married } = parsed.data;

  // 3. Load questions and score
  const questions = getQuestions();
  const result = scoreAssessment(answers, questions);

  // 4. Persist result
  const scored = await createResult(leadId, result, married);

  // 5. Fire ConvertKit automation (non-blocking)
  const { data: lead } = await getSupabase()
    .from("leads")
    .select("name, email, convertkit_subscriber_id")
    .eq("id", leadId)
    .single();

  if (lead?.email) {
    // ConvertKit automation
    onAssessmentComplete({
      email: lead.email,
      firstName: lead.name ?? "",
      subscriberId: lead.convertkit_subscriber_id ?? null,
      typeCode: result.type,
      stage: result.stage,
    }).catch((err) => console.error("[submit] CK automation failed:", err));

    // Outbound webhook fanout (n8n / Zapier / Google Sheets)
    const typeContent = getTypeContent(result.type);
    const stageContent = getStageContent(result.stage);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

    fireAssessmentCompleted({
      resultId: scored.resultId,
      leadId,
      name: lead.name ?? "",
      email: lead.email,
      typeCode: result.type,
      typeName: typeContent?.name ?? result.type,
      stage: result.stage,
      stageName: stageContent?.name ?? `Stage ${result.stage}`,
      axisScores: result.axisScores as { A: number; G: number; S: number; C: number },
      totalScore: result.totalScore,
      midpointFlags: result.midpointFlags,
      resultUrl: `${baseUrl}/result/${scored.resultId}`,
    }).catch((err) => console.error("[submit] Webhook fanout failed:", err));
  }

  return NextResponse.json({ resultId: scored.resultId }, { status: 201 });
}
