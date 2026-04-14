/**
 * Scoring engine — pure functions, no side effects, no I/O.
 * Input: 20 answers + questions + config
 * Output: AssessmentResult
 */

import type { Answer, AssessmentResult, AxisKey, Question } from "./types";
import scoringConfig from "@/config/scoring.json";

// Likert value map: UI value (1–5) → raw score
const LIKERT_MAP: Record<number, number> = {
  1: scoringConfig.likertValues.stronglyDisagree, // -2
  2: scoringConfig.likertValues.disagree,          // -1
  3: scoringConfig.likertValues.neutral,            //  0
  4: scoringConfig.likertValues.agree,              // +1
  5: scoringConfig.likertValues.stronglyAgree,      // +2
};

const SCENARIO_WEIGHT = scoringConfig.scenarioWeight;          // 2
const AXIS_RAW_MIN   = scoringConfig.axisRawMin;               // -12
const AXIS_RAW_MAX   = scoringConfig.axisRawMax;               // +12
const STAGE_THRESHOLDS = scoringConfig.stageThresholds;        // [25, 50, 75]
const MIDPOINT_SENSITIVITY = scoringConfig.midpointSensitivity; // 0.10

const AXES: AxisKey[] = ["A", "G", "S", "C"];

// Which letter wins each axis pole
const POLE_A_LETTER: Record<AxisKey, string> = { A: "A", G: "G", S: "S", C: "C" };
const POLE_B_LETTER: Record<AxisKey, string> = { A: "D", G: "R", S: "P", C: "I" };

export function scoreAssessment(
  answers: Answer[],
  questions: Question[]
): AssessmentResult {
  const axisRaw: Record<AxisKey, number> = { A: 0, G: 0, S: 0, C: 0 };

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const axis = question.axis;

    if (question.type === "likert") {
      let raw = LIKERT_MAP[answer.value] ?? 0;
      if (question.scoringDirection === "B") raw = -raw;
      axisRaw[axis] += raw; // weight = 1 for Likert
    }

    if (question.type === "scenario") {
      const option = question.options[answer.value];
      if (!option) continue;
      const signed = option.pole === "A" ? 1 : -1;
      axisRaw[axis] += option.score * signed * SCENARIO_WEIGHT;
    }
  }

  // Normalize each axis to 0–1
  const range = AXIS_RAW_MAX - AXIS_RAW_MIN; // 24
  const axisScores = Object.fromEntries(
    AXES.map((axis) => [
      axis,
      (axisRaw[axis] - AXIS_RAW_MIN) / range,
    ])
  ) as Record<AxisKey, number>;

  // Build 4-letter type code
  const typeCode = AXES.map((axis) =>
    axisScores[axis] > 0.5 ? POLE_A_LETTER[axis] : POLE_B_LETTER[axis]
  ).join("");

  // Total score normalized to 0–100
  const totalRaw = AXES.reduce((sum, axis) => sum + axisRaw[axis], 0);
  const totalMin = AXIS_RAW_MIN * 4; // -48
  const totalMax = AXIS_RAW_MAX * 4; // +48
  const totalScore = Math.round(((totalRaw - totalMin) / (totalMax - totalMin)) * 100);

  // Stage lookup
  let stage: 1 | 2 | 3 | 4;
  if (totalScore <= STAGE_THRESHOLDS[0]) stage = 1;
  else if (totalScore <= STAGE_THRESHOLDS[1]) stage = 2;
  else if (totalScore <= STAGE_THRESHOLDS[2]) stage = 3;
  else stage = 4;

  // Midpoint flags
  const midpointFlags = AXES.filter(
    (axis) => Math.abs(axisScores[axis] - 0.5) < MIDPOINT_SENSITIVITY
  );

  return { type: typeCode, stage, axisScores, midpointFlags, totalScore };
}
