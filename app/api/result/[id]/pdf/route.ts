/**
 * GET /api/result/:id/pdf
 * Redirects to the static stage-based PDF for this result.
 */

import { NextResponse } from "next/server";
import { getResultById } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing result ID" }, { status: 400 });
  }

  const result = await getResultById(id);
  if (!result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  const stage = result.stage;
  const pdfPath = `/pdfs/stage-${stage}-roadmap.pdf`;

  return NextResponse.redirect(
    new URL(pdfPath, process.env.NEXT_PUBLIC_BASE_URL ?? "https://assessment.mastermangroup.com"),
    302
  );
}
