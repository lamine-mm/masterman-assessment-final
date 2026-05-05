/**
 * POST /api/result-feedback
 * Captures the user's accuracy rating (1–5) for a given result.
 * Body: { result_id: uuid, rating: 1..5 }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createResultFeedback, getResultById } from "@/lib/db";

const BodySchema = z.object({
  result_id: z.string().uuid("Invalid result_id"),
  rating: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
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

  const { result_id, rating } = parsed.data;

  // Prevent feedback for non-existent results
  const result = await getResultById(result_id);
  if (!result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  await createResultFeedback(result_id, rating);

  return NextResponse.json({ ok: true }, { status: 200 });
}
