/**
 * POST /api/register
 * Captures lead before the assessment begins.
 * Creates Supabase lead row + ConvertKit subscriber.
 * Returns { leadId } — stored in a cookie for the assessment session.
 * Also stores married status in a cookie so the assessment can pre-fill Module 3.
 */

import { NextResponse, after } from "next/server";
import { z } from "zod";
import { createLead, updateLeadCKSubscriberId } from "@/lib/db";
import { onLeadRegistered } from "@/lib/convertkit";
import { fireLeadCaptured } from "@/lib/webhooks";

const BodySchema = z.object({
  name:    z.string().min(1, "Name is required"),
  email:   z.string().email("Valid email required"),
  phone:   z.string().optional(),
  country: z.string().optional(),
  age:     z.number().int().min(10).max(120).optional(),
  married: z.boolean().optional(),
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

  const { name, email, phone, country, age, married } = parsed.data;

  // 1. Persist lead to Supabase
  const lead = await createLead({ name, email, phone, country, age });

  // 2. CK + webhook run after response is sent (function stays alive via after())
  after(() => {
    onLeadRegistered({ email, firstName: name, phone })
      .then((subscriberId) => {
        if (subscriberId) {
          updateLeadCKSubscriberId(lead.id, subscriberId).catch((err) =>
            console.error("[register] Failed to store CK subscriber ID:", err)
          );
        }
      })
      .catch((err) => console.error("[register] CK registration failed:", err));

    fireLeadCaptured({ leadId: lead.id, name, email, phone }).catch((err) =>
      console.error("[register] Webhook fanout failed:", err)
    );
  });

  const response = NextResponse.json({ leadId: lead.id }, { status: 201 });

  // leadId cookie — read by /api/submit
  response.cookies.set("lead_id", lead.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
    path: "/",
  });

  // married cookie — read by /assessment to pre-fill Module 3 toggle
  if (married !== undefined) {
    response.cookies.set("married", married ? "1" : "0", {
      httpOnly: false, // client-readable so AssessmentClient can pick it up
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2,
      path: "/",
    });
  }

  return response;
}
