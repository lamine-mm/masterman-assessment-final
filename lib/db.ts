/**
 * Supabase client + CRUD for leads and results tables.
 * Schema:
 *   leads   (id, name, email, phone, convertkit_subscriber_id, created_at)
 *   results (id, lead_id, type_code, stage, axis_a, axis_g, axis_s, axis_c,
 *            midpoint_flags, total_score, married, created_at)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AssessmentResult, Lead, ScoredResult } from "./types";

let supabaseSingleton: SupabaseClient | null = null;

/** Lazy client so `next build` can run without Supabase env (set vars on the host, e.g. Vercel). */
export function getSupabase(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  if (!supabaseSingleton) {
    supabaseSingleton = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseSingleton;
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export async function createLead(data: {
  name: string;
  email: string;
  phone?: string;
}): Promise<Lead> {
  const { data: row, error } = await getSupabase()
    .from("leads")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create lead: ${error.message}`);
  return rowToLead(row);
}

export async function getLeadById(
  leadId: string
): Promise<Lead | null> {
  const { data: row, error } = await getSupabase()
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error?.code === "PGRST116") return null; // not found
  if (error) throw new Error(`Failed to fetch lead: ${error.message}`);
  return rowToLead(row);
}

export async function updateLeadCKSubscriberId(
  leadId: string,
  subscriberId: string
): Promise<void> {
  const { error } = await getSupabase()
    .from("leads")
    .update({ convertkit_subscriber_id: subscriberId })
    .eq("id", leadId);

  if (error) throw new Error(`Failed to update CK subscriber ID: ${error.message}`);
}

// ─── Results ─────────────────────────────────────────────────────────────────

export async function createResult(
  leadId: string,
  result: AssessmentResult,
  married: boolean
): Promise<ScoredResult> {
  const { data: row, error } = await getSupabase()
    .from("results")
    .insert({
      lead_id: leadId,
      type_code: result.type,
      stage: result.stage,
      axis_a: result.axisScores.A,
      axis_g: result.axisScores.G,
      axis_s: result.axisScores.S,
      axis_c: result.axisScores.C,
      midpoint_flags: result.midpointFlags,
      total_score: result.totalScore,
      married,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create result: ${error.message}`);
  return rowToScoredResult(row);
}

export async function getResultById(resultId: string): Promise<ScoredResult | null> {
  const { data: row, error } = await getSupabase()
    .from("results")
    .select("*")
    .eq("id", resultId)
    .single();

  if (error?.code === "PGRST116") return null; // not found
  if (error) throw new Error(`Failed to fetch result: ${error.message}`);
  return rowToScoredResult(row);
}

// ─── Row mappers ─────────────────────────────────────────────────────────────

function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | undefined,
    convertkitSubscriberId: row.convertkit_subscriber_id as string | undefined,
    createdAt: row.created_at as string,
  };
}

function rowToScoredResult(row: Record<string, unknown>): ScoredResult {
  return {
    resultId: row.id as string,
    leadId: row.lead_id as string,
    type: row.type_code as string,
    stage: row.stage as 1 | 2 | 3 | 4,
    axisScores: {
      A: row.axis_a as number,
      G: row.axis_g as number,
      S: row.axis_s as number,
      C: row.axis_c as number,
    },
    midpointFlags: ((row.midpoint_flags as string[]) ?? []) as import("./types").AxisKey[],
    totalScore: row.total_score as number,
    married: row.married as boolean,
    answeredAt: row.created_at as string,
  };
}
