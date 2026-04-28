/**
 * Scoring engine unit tests — full coverage.
 *
 * Covers:
 *   - All-Pole-A answers → type AGSC, stage 4, scores ~1.0
 *   - All-Pole-B answers → type DRPI, stage 1, scores ~0.0
 *   - All-neutral Likert → axis scores at 0.5
 *   - Scenario weight (1×) verified numerically
 *   - Exact midpoint flags (score within 0.10 of 0.50)
 *   - Stage boundaries (25, 50, 75)
 *   - Mixed-pole type codes (e.g. AGPI, DRSC)
 *   - B-direction Likert questions (scoringDirection: "B")
 *   - Every Likert value (1–5) maps to correct signed raw
 *   - Single-axis isolation (only axis A questions answered positively)
 */

import { describe, it, expect } from "vitest";
import { scoreAssessment } from "../scoring";
import type { Answer, Question } from "../types";

// ─── Minimal question fixtures ────────────────────────────────────────────────
// We build precise fixture sets so we can predict exact numeric outputs.

/** 4 Likert (direction A) + 1 Scenario for a single axis */
function makeAxisQuestions(
  axis: "A" | "G" | "S" | "C",
  module: "identity" | "nafs" | "marriage" | "brotherhood",
  idPrefix: string
): Question[] {
  return [
    { id: `${idPrefix}1`, module, axis, type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
    { id: `${idPrefix}2`, module, axis, type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
    { id: `${idPrefix}3`, module, axis, type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
    { id: `${idPrefix}4`, module, axis, type: "likert", text: "Q", scoringDirection: "B", weight: 1 },
    {
      id: `${idPrefix}5`,
      module,
      axis,
      type: "scenario",
      text: "Q",
      weight: 2,
      options: [
        { label: "Strong A", score: 2, pole: "A" },
        { label: "Weak A",   score: 1, pole: "A" },
        { label: "Weak B",   score: 1, pole: "B" },
        { label: "Strong B", score: 2, pole: "B" },
      ],
    },
  ];
}

const ALL_QUESTIONS: Question[] = [
  ...makeAxisQuestions("A", "identity",    "A"),
  ...makeAxisQuestions("G", "nafs",        "G"),
  ...makeAxisQuestions("S", "marriage",    "S"),
  ...makeAxisQuestions("C", "brotherhood", "C"),
];

/** Build answer array: Likert = likertVal (1–5), scenario = scenarioOpt (0–3) */
function buildAnswers(
  questions: Question[],
  likertVal: number,
  scenarioOpt: number
): Answer[] {
  return questions.map((q) => ({
    questionId: q.id,
    value: q.type === "scenario" ? scenarioOpt : likertVal,
  }));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("scoreAssessment", () => {
  // ── Pole A sweep ────────────────────────────────────────────────────────────

  it("all max pole-A answers → AGSC, stage 4, axisScores ≈ 22/24, totalScore = 92", () => {
    // To maximise the A axis we must:
    //   A-dir Likert → value 5 (+2 raw)
    //   B-dir Likert → value 1 (LIKERT_MAP[1] = -2, ×-1 flip = +2 raw)
    //   Scenario     → option 0 (strong A: score 2 × +1 × weight 1 = +2 raw)
    // Per-axis raw max: 3×(+2) + 1×(+2) + (+2) = +10 → axisScore = 22/24 ≈ 0.917
    const answers = ALL_QUESTIONS.map((q) => {
      if (q.type === "scenario") return { questionId: q.id, value: 0 };
      return { questionId: q.id, value: q.scoringDirection === "A" ? 5 : 1 };
    });
    const result = scoreAssessment(answers, ALL_QUESTIONS);

    expect(result.type).toBe("AGSC");
    expect(result.stage).toBe(4);
    expect(result.axisScores.A).toBeCloseTo(22 / 24, 5);
    expect(result.axisScores.G).toBeCloseTo(22 / 24, 5);
    expect(result.axisScores.S).toBeCloseTo(22 / 24, 5);
    expect(result.axisScores.C).toBeCloseTo(22 / 24, 5);
    expect(result.totalScore).toBe(92);
    expect(result.midpointFlags).toHaveLength(0);
  });

  // ── Pole B sweep ────────────────────────────────────────────────────────────

  it("all strongly agree toward pole B → DRPI, stage 1, scores ≈ 2/24", () => {
    // A-dir question: likertMap[1] = -2, no flip → -2
    // B-dir question: likertMap[5] = +2, flip → -2
    // Scenario opt 3 = strong B = score 2 × pole B (-1) × weight 1 = -2
    // Per axis: 3×(-2) + 1×(-2) + (-2) = -10 → axisScore = (-10+12)/24 = 2/24 ≈ 0.083
    const answers = ALL_QUESTIONS.map((q) => {
      if (q.type === "scenario") return { questionId: q.id, value: 3 }; // strong B
      if (q.type === "likert") {
        return {
          questionId: q.id,
          value: q.scoringDirection === "A" ? 1 : 5,
        };
      }
      const _never: never = q;
      return { questionId: (_never as unknown as { id: string }).id, value: 1 };
    });

    const result = scoreAssessment(answers, ALL_QUESTIONS);
    expect(result.type).toBe("DRPI");
    expect(result.stage).toBe(1);
    expect(result.axisScores.A).toBeCloseTo(2 / 24, 5);
    expect(result.axisScores.G).toBeCloseTo(2 / 24, 5);
    expect(result.axisScores.S).toBeCloseTo(2 / 24, 5);
    expect(result.axisScores.C).toBeCloseTo(2 / 24, 5);
    expect(result.totalScore).toBe(8);
  });

  // ── Neutral Likert ──────────────────────────────────────────────────────────

  it("all neutral Likert + weak-A scenario → axisScores between 0.5 and 0.6", () => {
    // Likert 3 = 0; scenario opt 1 = weak A = score 1 × A × weight 2 = +2
    // Per axis raw: 0+0+0+0 + 2 = +2 → score = (2+12)/24 = 14/24 ≈ 0.583
    const answers = buildAnswers(ALL_QUESTIONS, 3, 1);
    const result = scoreAssessment(answers, ALL_QUESTIONS);

    for (const axis of ["A", "G", "S", "C"] as const) {
      expect(result.axisScores[axis]).toBeGreaterThan(0.5);
      expect(result.axisScores[axis]).toBeLessThan(0.65);
    }
    expect(result.type).toBe("AGSC"); // all slightly above 0.5
  });

  it("all neutral Likert + weak-B scenario → axisScores between 0.4 and 0.5", () => {
    // Scenario opt 2 = weak B = score 1 × B × weight 2 = -2
    // Per axis raw: 0+0+0+0 + (-2) = -2 → score = (-2+12)/24 = 10/24 ≈ 0.417
    const answers = buildAnswers(ALL_QUESTIONS, 3, 2);
    const result = scoreAssessment(answers, ALL_QUESTIONS);

    for (const axis of ["A", "G", "S", "C"] as const) {
      expect(result.axisScores[axis]).toBeGreaterThan(0.35);
      expect(result.axisScores[axis]).toBeLessThan(0.5);
    }
    expect(result.type).toBe("DRPI"); // all below 0.5
  });

  // ── Scenario weight verification ────────────────────────────────────────────

  it("scenario option 0 (strong A, score 2) contributes ±2 to axis raw", () => {
    // Only Q: 1 scenario question for axis A
    const singleScenario: Question[] = [
      {
        id: "S1",
        module: "identity",
        axis: "A",
        type: "scenario",
        text: "Q",
        weight: 2,
        options: [
          { label: "Strong A", score: 2, pole: "A" },
          { label: "Weak A",   score: 1, pole: "A" },
          { label: "Weak B",   score: 1, pole: "B" },
          { label: "Strong B", score: 2, pole: "B" },
        ],
      },
    ];

    // Strong A: raw = 2 × +1 × 1 = +2; axisScore = (2+12)/24 = 14/24 ≈ 0.583
    const strongA = scoreAssessment([{ questionId: "S1", value: 0 }], singleScenario);
    expect(strongA.axisScores.A).toBeCloseTo(14 / 24, 5);

    // Weak A: raw = 1 × +1 × 1 = +1; axisScore = (1+12)/24 = 13/24 ≈ 0.542
    const weakA = scoreAssessment([{ questionId: "S1", value: 1 }], singleScenario);
    expect(weakA.axisScores.A).toBeCloseTo(13 / 24, 5);

    // Weak B: raw = 1 × -1 × 1 = -1; axisScore = (-1+12)/24 = 11/24 ≈ 0.458
    const weakB = scoreAssessment([{ questionId: "S1", value: 2 }], singleScenario);
    expect(weakB.axisScores.A).toBeCloseTo(11 / 24, 5);

    // Strong B: raw = 2 × -1 × 1 = -2; axisScore = (-2+12)/24 = 10/24 ≈ 0.417
    const strongB = scoreAssessment([{ questionId: "S1", value: 3 }], singleScenario);
    expect(strongB.axisScores.A).toBeCloseTo(10 / 24, 5);
  });

  // ── Midpoint flags ──────────────────────────────────────────────────────────

  it("axisScore exactly 0.50 triggers midpoint flag", () => {
    // Raw = 0 → axisScore = 12/24 = 0.5 exactly → |0.5 - 0.5| = 0 < 0.10 → flagged
    // Neutral Likert (3 = 0) and no scenario gives raw 0
    const neutralLikerts: Question[] = [
      { id: "L1", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
      { id: "L2", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
      { id: "L3", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
      { id: "L4", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "B", weight: 1 },
    ];
    // raw A: 3×0 + 1×0(neutral, B-dir) = 0 → score = 0.5 → flagged
    const answers = neutralLikerts.map((q) => ({ questionId: q.id, value: 3 }));
    const result = scoreAssessment(answers, neutralLikerts);
    expect(result.midpointFlags).toContain("A");
  });

  it("axisScore 0.41 (just within 0.10) triggers midpoint flag", () => {
    // Need raw close to 0 but slightly negative
    // single weak-B scenario: raw A = -2 → score = 10/24 ≈ 0.417 → |0.417 - 0.5| = 0.083 < 0.10
    const singleScenario: Question[] = [{
      id: "S1", module: "identity", axis: "A", type: "scenario", text: "Q", weight: 2,
      options: [
        { label: "A2", score: 2, pole: "A" }, { label: "A1", score: 1, pole: "A" },
        { label: "B1", score: 1, pole: "B" }, { label: "B2", score: 2, pole: "B" },
      ],
    }];
    const result = scoreAssessment([{ questionId: "S1", value: 2 }], singleScenario);
    expect(result.midpointFlags).toContain("A");
  });

  it("axisScore 0.83 (far from midpoint) does NOT trigger midpoint flag", () => {
    // Raw A = +8 (4 Likert × +2) → score = 20/24 ≈ 0.833 → |0.833 - 0.5| = 0.333 > 0.10
    const fourLikerts: Question[] = [
      { id: "L1", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
      { id: "L2", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
      { id: "L3", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
      { id: "L4", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
    ];
    const answers = fourLikerts.map((q) => ({ questionId: q.id, value: 5 }));
    const result = scoreAssessment(answers, fourLikerts);
    expect(result.midpointFlags).not.toContain("A");
  });

  // ── Stage boundaries ────────────────────────────────────────────────────────

  it("neutral Likert + weak-A scenario → stage 2", () => {
    // Per axis raw: 0+0+0+0 + (1×+1×1) = +1; total raw = 4
    // totalScore = (4+48)/96 × 100 ≈ 54 → stage 2 (≤ threshold 55)
    const neutralAnswers = buildAnswers(ALL_QUESTIONS, 3, 1);
    const result = scoreAssessment(neutralAnswers, ALL_QUESTIONS);
    expect(result.stage).toBe(2);
  });

  it("all pole-B → stage 1, totalScore = 8", () => {
    const answers = ALL_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: q.type === "scenario" ? 3 : q.scoringDirection === "A" ? 1 : 5,
    }));
    const result = scoreAssessment(answers, ALL_QUESTIONS);
    expect(result.stage).toBe(1);
    expect(result.totalScore).toBe(8);
  });

  it("all pole-A → stage 4, totalScore = 92", () => {
    // Correct max-A answers: A-dir Likert=5, B-dir Likert=1, scenario opt 0
    const answers = ALL_QUESTIONS.map((q) => {
      if (q.type === "scenario") return { questionId: q.id, value: 0 };
      return { questionId: q.id, value: q.scoringDirection === "A" ? 5 : 1 };
    });
    const result = scoreAssessment(answers, ALL_QUESTIONS);
    expect(result.stage).toBe(4);
    expect(result.totalScore).toBe(92);
  });

  // ── Type code derivation ────────────────────────────────────────────────────

  it("mixed axes: A and G above 0.5, S and C below → AGPI", () => {
    // A and G questions → strongly agree toward pole A (Likert 5, scenario strong-A)
    // S and C questions → strongly agree toward pole B (Likert 1 A-dir / 5 B-dir, scenario strong-B)
    const answers = ALL_QUESTIONS.map((q) => {
      if (q.axis === "A" || q.axis === "G") {
        if (q.type === "scenario") return { questionId: q.id, value: 0 };
        return { questionId: q.id, value: q.scoringDirection === "A" ? 5 : 1 };
      } else {
        if (q.type === "scenario") return { questionId: q.id, value: 3 };
        return { questionId: q.id, value: q.scoringDirection === "A" ? 1 : 5 };
      }
    });
    const result = scoreAssessment(answers, ALL_QUESTIONS);
    expect(result.type).toBe("AGPI");
    expect(result.axisScores.A).toBeGreaterThan(0.5);
    expect(result.axisScores.G).toBeGreaterThan(0.5);
    expect(result.axisScores.S).toBeLessThan(0.5);
    expect(result.axisScores.C).toBeLessThan(0.5);
  });

  it("only C axis negative → type ends in I", () => {
    const answers = ALL_QUESTIONS.map((q) => {
      if (q.axis === "C") {
        if (q.type === "scenario") return { questionId: q.id, value: 3 };
        return { questionId: q.id, value: q.scoringDirection === "A" ? 1 : 5 };
      }
      if (q.type === "scenario") return { questionId: q.id, value: 0 };
      return { questionId: q.id, value: q.scoringDirection === "A" ? 5 : 1 };
    });
    const result = scoreAssessment(answers, ALL_QUESTIONS);
    expect(result.type.endsWith("I")).toBe(true);
    expect(result.axisScores.C).toBeLessThan(0.5);
  });

  // ── B-direction Likert ──────────────────────────────────────────────────────

  it("B-direction Likert value 5 scores negatively toward pole A", () => {
    const bdirQuestion: Question[] = [
      { id: "B1", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "B", weight: 1 },
    ];
    // value 5 = +2 in LIKERT_MAP, then × -1 for B-dir = -2
    const result = scoreAssessment([{ questionId: "B1", value: 5 }], bdirQuestion);
    // axisRaw A = -2 → axisScore = (-2+12)/24 = 10/24 ≈ 0.417 < 0.5
    expect(result.axisScores.A).toBeCloseTo(10 / 24, 5);
    expect(result.type).toBe("DRPI"); // A below 0.5, G/S/C unset = 0.5 → flags but D
  });

  it("B-direction Likert value 1 scores positively toward pole A", () => {
    const bdirQuestion: Question[] = [
      { id: "B1", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "B", weight: 1 },
    ];
    // value 1 = -2 in LIKERT_MAP, then × -1 for B-dir = +2
    const result = scoreAssessment([{ questionId: "B1", value: 1 }], bdirQuestion);
    // axisRaw A = +2 → axisScore = (2+12)/24 = 14/24 ≈ 0.583
    expect(result.axisScores.A).toBeCloseTo(14 / 24, 5);
  });

  // ── All five Likert values ──────────────────────────────────────────────────

  it.each([
    [1, -2], [2, -1], [3, 0], [4, 1], [5, 2],
  ])("Likert value %i maps to raw %i (A-dir)", (value, expectedRaw) => {
    const q: Question[] = [
      { id: "L1", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
    ];
    const result = scoreAssessment([{ questionId: "L1", value }], q);
    const expectedScore = (expectedRaw + 12) / 24;
    expect(result.axisScores.A).toBeCloseTo(expectedScore, 5);
  });

  // ── Empty answers ───────────────────────────────────────────────────────────

  it("empty answer array → all axes at 0.5, type AGSC (ties go to Pole A)", () => {
    const result = scoreAssessment([], ALL_QUESTIONS);
    for (const axis of ["A", "G", "S", "C"] as const) {
      expect(result.axisScores[axis]).toBeCloseTo(0.5);
    }
    // All exactly 0.5 → all flagged as midpoint
    expect(result.midpointFlags).toHaveLength(4);
    // At 0.5 exactly, >0.5 is false so type should be all B-poles: DRPI
    expect(result.type).toBe("DRPI");
  });

  // ── Real questions smoke test ──────────────────────────────────────────────

  it("real questions.json: all agree answers → valid AGSC result", async () => {
    const { getQuestions } = await import("../content");
    const questions = getQuestions();
    expect(questions).toHaveLength(20);

    const answers = questions.map((q) => ({
      questionId: q.id,
      value: q.type === "scenario" ? 0 : 4, // agree on Likert, first (A-pole) scenario option
    }));

    const result = scoreAssessment(answers, questions);
    expect(result.type).toHaveLength(4);
    expect([1, 2, 3, 4]).toContain(result.stage);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});
