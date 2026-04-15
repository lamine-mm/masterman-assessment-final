// ─── Axis & Type ────────────────────────────────────────────────────────────

export type AxisKey = "A" | "G" | "S" | "C";

export const AXIS_POLE_A: Record<AxisKey, string> = {
  A: "Anchored",
  G: "Governed",
  S: "Shepherd",
  C: "Connected",
};

export const AXIS_POLE_B: Record<AxisKey, string> = {
  A: "Drifting",
  G: "Reactive",
  S: "Passive",
  C: "Isolated",
};

export const AXIS_LABELS: Record<AxisKey, string> = {
  A: "Identity",
  G: "Nafs",
  S: "Marriage",
  C: "Brotherhood",
};

// ─── Questions ──────────────────────────────────────────────────────────────

export type QuestionModule = "identity" | "nafs" | "marriage" | "brotherhood";

export interface LikertQuestion {
  id: string;
  module: QuestionModule;
  axis: AxisKey;
  type: "likert";
  text: string;
  textHypothetical?: string; // Module 3 only — for unmarried respondents
  scoringDirection: "A" | "B"; // which pole does "strongly agree" score toward
  weight: 1;
}

export interface ScenarioOption {
  label: string;
  score: number; // 1 or 2
  pole: "A" | "B";
}

export interface ScenarioQuestion {
  id: string;
  module: QuestionModule;
  axis: AxisKey;
  type: "scenario";
  text: string;
  weight: 2;
  options: ScenarioOption[];
}

export type Question = LikertQuestion | ScenarioQuestion;

// ─── Answers ────────────────────────────────────────────────────────────────

export interface Answer {
  questionId: string;
  value: number; // Likert: 1–5 | Scenario: 0–3 (option index)
}

// ─── Scoring output ─────────────────────────────────────────────────────────

export interface AssessmentResult {
  type: string;                          // e.g. "AGSC", "DRPI"
  stage: 1 | 2 | 3 | 4;
  axisScores: Record<AxisKey, number>;   // 0.0–1.0; >0.5 = Pole A
  midpointFlags: AxisKey[];             // axes within midpointSensitivity of 0.5
  totalScore: number;                    // 0–100, used for stage lookup
}

export interface ScoredResult extends AssessmentResult {
  resultId: string;
  leadId: string;
  married: boolean;
  answeredAt: string; // ISO timestamp
}

// ─── Content types (mirror content/*.json schemas) ──────────────────────────

export interface TypeContent {
  code: string;
  name: string;
  identity: string;
  strength: string;
  strengthDetail: string;
  blindSpot: string;
  blindSpotDetail: string;
  quranAnchor: string;
  anchorSource: string;
  nextStep: string;
}

export interface StageContent {
  number: 1 | 2 | 3 | 4;
  name: string;
  meaning: string;
  guidance: string;
  scoreRange: [number, number];
}

export interface CopyContent {
  landing: { hero: string; subhero: string; cta: string };
  register: { title: string; body: string; cta: string };
  intro: { title: string; body: string; cta: string };
  thankYou: { title: string; body: string; cta: string; callBullets: string[] };
  disclaimer: { short: string; long: string };
  share: { whatsappMessage: string; copyLinkMessage: string };
  loading: { scoringMessage: string };
}

// ─── Lead ────────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  age?: number;
  convertkitSubscriberId?: string;
  createdAt: string;
}
