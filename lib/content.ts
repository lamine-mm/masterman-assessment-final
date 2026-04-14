/**
 * Content loader — validates and exports all content/*.json data.
 * Fails loudly on missing or malformed fields (never silently falls back).
 * All Islamic references, question text, and copy flow through here.
 */

import { z } from "zod";
import rawQuestions from "@/content/questions.json";
import rawTypes from "@/content/types.json";
import rawStages from "@/content/stages.json";
import rawAngles from "@/content/opening-angles.json";
import rawCopy from "@/content/copy.json";

// ─── Question schemas ────────────────────────────────────────────────────────

const LikertQuestionSchema = z.object({
  id: z.string(),
  module: z.enum(["identity", "nafs", "marriage", "brotherhood"]),
  axis: z.enum(["A", "G", "S", "C"]),
  type: z.literal("likert"),
  text: z.string().min(1),
  textHypothetical: z.string().optional(),
  scoringDirection: z.enum(["A", "B"]),
  weight: z.literal(1),
});

const ScenarioOptionSchema = z.object({
  label: z.string().min(1),
  score: z.number().min(1).max(2),
  pole: z.enum(["A", "B"]),
});

const ScenarioQuestionSchema = z.object({
  id: z.string(),
  module: z.enum(["identity", "nafs", "marriage", "brotherhood"]),
  axis: z.enum(["A", "G", "S", "C"]),
  type: z.literal("scenario"),
  text: z.string().min(1),
  weight: z.literal(2),
  options: z.array(ScenarioOptionSchema).length(4),
});

const QuestionSchema = z.discriminatedUnion("type", [
  LikertQuestionSchema,
  ScenarioQuestionSchema,
]);

const QuestionsFileSchema = z.object({
  questions: z.array(QuestionSchema),
});

// ─── Type write-up schema ────────────────────────────────────────────────────

const TypeContentSchema = z.object({
  code: z.string().length(4),
  name: z.string().min(1),
  identity: z.string().min(1),
  strength: z.string().min(1),
  blindSpot: z.string().min(1),
  quranAnchor: z.string().min(1),
  anchorSource: z.string().min(1),
  nextStep: z.string().min(1),
});

const TypesFileSchema = z.object({
  types: z.record(z.string(), TypeContentSchema),
});

// ─── Stage schema ────────────────────────────────────────────────────────────

const StageContentSchema = z.object({
  number: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  name: z.string().min(1),
  meaning: z.string().min(1),
  guidance: z.string().min(1),
  scoreRange: z.tuple([z.number(), z.number()]),
});

const StagesFileSchema = z.object({
  stages: z.array(StageContentSchema),
});

// ─── Copy schema ─────────────────────────────────────────────────────────────

const CopyFileSchema = z.object({
  landing: z.object({ hero: z.string(), subhero: z.string(), cta: z.string() }),
  register: z.object({ title: z.string(), body: z.string(), cta: z.string() }),
  intro: z.object({ title: z.string(), body: z.string(), cta: z.string() }),
  thankYou: z.object({
    title: z.string(),
    body: z.string(),
    cta: z.string(),
    callBullets: z.array(z.string()),
  }),
  disclaimer: z.object({ short: z.string(), long: z.string() }),
  share: z.object({ whatsappMessage: z.string(), copyLinkMessage: z.string() }),
  loading: z.object({ scoringMessage: z.string() }),
});

// ─── Parse and export ────────────────────────────────────────────────────────

function parse<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Content validation failed for ${label}:\n${result.error.toString()}`
    );
  }
  return result.data;
}

// These are called at runtime (server-side). They throw on invalid content —
// that is intentional: broken content should surface immediately, not silently.
export function getQuestions() {
  return parse(QuestionsFileSchema, rawQuestions, "questions.json").questions;
}

export function getTypes() {
  return parse(TypesFileSchema, rawTypes, "types.json").types;
}

export function getTypeContent(code: string) {
  const types = getTypes();
  return types[code] ?? null; // null triggers graceful fallback on result page
}

export function getStages() {
  return parse(StagesFileSchema, rawStages, "stages.json").stages;
}

export function getStageContent(stage: 1 | 2 | 3 | 4) {
  const stages = getStages();
  return stages.find((s) => s.number === stage) ?? null;
}

export function getCopy() {
  return parse(CopyFileSchema, rawCopy, "copy.json");
}

// ─── Opening angles schema ────────────────────────────────────────────────────

const AngleEntrySchema = z.object({
  stageEarly: z.string().min(1),
  stageLate: z.string().min(1),
  closeCallSuffix: z.string().min(1),
});

const AnglesFileSchema = z.object({
  angles: z.record(z.string().length(4), AngleEntrySchema),
});

export function getOpeningAngles() {
  return parse(AnglesFileSchema, rawAngles, "opening-angles.json").angles;
}
