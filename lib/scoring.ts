/**
 * Scoring engine — pure functions, no side effects, no I/O.
 *
 * Inputs: array of Answer + array of Question + scoring config
 * Output: AssessmentResult
 *
 * Per-axis raw min/max are derived from the questions array at runtime,
 * so the engine produces correct outputs for any question count or
 * per-module distribution. No hardcoded counts or IDs.
 */

import type { Answer, AssessmentResult, AxisKey, Question } from "./types";
import scoringConfig from "@/config/scoring.json";

const LIKERT_MAP: Record<number, number> = {
  1: scoringConfig.likertValues.stronglyDisagree,
  2: scoringConfig.likertValues.disagree,
  3: scoringConfig.likertValues.neutral,
  4: scoringConfig.likertValues.agree,
  5: scoringConfig.likertValues.stronglyAgree,
};

const SCENARIO_WEIGHT = scoringConfig.scenarioWeight;
const STAGE_THRESHOLDS = scoringConfig.stageThresholds;
const MIDPOINT_SENSITIVITY = scoringConfig.midpointSensitivity;
const MAX_LIKERT = scoringConfig.likertValues.stronglyAgree;

const AXES: AxisKey[] = ["A", "G", "S", "C"];

const POLE_A_LETTER: Record<AxisKey, string> = { A: "A", G: "G", S: "S", C: "C" };
const POLE_B_LETTER: Record<AxisKey, string> = { A: "D", G: "R", S: "P", C: "I" };

/**
 * For a given axis, compute the maximum possible signed raw score
 * given the questions on that axis. Min is the negation.
 */
function axisRawMaxFor(axis: AxisKey, questions: Question[]): number {
  let max = 0;
  for (const q of questions) {
    if (q.axis !== axis) continue;
    if (q.type === "likert") {
      max += MAX_LIKERT;
    } else {
      const optionMax = Math.max(...q.options.map((o) => o.score));
      max += optionMax * SCENARIO_WEIGHT;
    }
  }
  return max;
}

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
      axisRaw[axis] += raw;
    }

    if (question.type === "scenario") {
      const option = question.options[answer.value];
      if (!option) continue;
      const signed = option.pole === "A" ? 1 : -1;
      axisRaw[axis] += option.score * signed * SCENARIO_WEIGHT;
    }
  }

  // Per-axis raw bounds derived from the question set
  const axisMax: Record<AxisKey, number> = {
    A: axisRawMaxFor("A", questions),
    G: axisRawMaxFor("G", questions),
    S: axisRawMaxFor("S", questions),
    C: axisRawMaxFor("C", questions),
  };

  // Each axis normalized to 0–1 (>0.5 = Pole A)
  const axisScores = Object.fromEntries(
    AXES.map((axis) => {
      const max = axisMax[axis];
      const score = max === 0 ? 0.5 : (axisRaw[axis] + max) / (2 * max);
      return [axis, score];
    })
  ) as Record<AxisKey, number>;

  // Build 4-letter type code
  const typeCode = AXES.map((axis) =>
    axisScores[axis] > 0.5 ? POLE_A_LETTER[axis] : POLE_B_LETTER[axis]
  ).join("");

  // Total score normalized to 0–100 across all axes
  const totalRaw = AXES.reduce((sum, axis) => sum + axisRaw[axis], 0);
  const totalMax = AXES.reduce((sum, axis) => sum + axisMax[axis], 0);
  const totalScore =
    totalMax === 0
      ? 50
      : Math.round(((totalRaw + totalMax) / (2 * totalMax)) * 100);

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
