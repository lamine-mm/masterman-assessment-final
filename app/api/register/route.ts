/**
 * POST /api/register
 * Captures lead (name, email, phone) before the assessment begins.
 * Creates Supabase lead row + ConvertKit subscriber.
 * Returns { leadId } — stored in a cookie for the assessment session.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead, updateLeadCKSubscriberId } from "@/lib/db";
import { onLeadRegistered } from "@/lib/convertkit";
import { fireLeadCaptured } from "@/lib/webhooks";

const BodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
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

  const { name, email, phone } = parsed.data;

  // 1. Persist lead to Supabase
  const lead = await createLead({ name, email, phone });

  // 2. Create ConvertKit subscriber (non-blocking — errors are logged, not thrown)
  const subscriberId = await onLeadRegistered({
    email,
    firstName: name,
    phone,
  });

  // 3. Store CK subscriber ID back on the lead row
  if (subscriberId) {
    await updateLeadCKSubscriberId(lead.id, subscriberId).catch((err) =>
      console.error("[register] Failed to store CK subscriber ID:", err)
    );
  }

  // 4. Fire outbound webhook (non-blocking)
  fireLeadCaptured({ leadId: lead.id, name, email, phone }).catch((err) =>
    console.error("[register] Webhook fanout failed:", err)
  );

  const response = NextResponse.json({ leadId: lead.id }, { status: 201 });

  // Store leadId in a cookie so /assessment can read it server-side
  response.cookies.set("lead_id", lead.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
    path: "/",
  });

  return response;
}
