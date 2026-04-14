/**
 * GET /api/result/:id
 * Fetches a persisted result row by UUID.
 * Used by the result page server component.
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

  return NextResponse.json(result);
}
