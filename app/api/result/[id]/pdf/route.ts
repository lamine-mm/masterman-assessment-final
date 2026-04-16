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

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
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
