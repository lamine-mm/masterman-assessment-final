/**
 * Scoring engine unit tests — v2.2.
 *
 * The engine derives per-axis raw min/max from the question set,
 * so these tests build fixtures matching the v2.2 layout
 * (Module 1: 7 questions / Modules 2–4: 6 questions each = 25 total).
 *
 *   Axis A (Identity):     6 Likert + 1 Scenario → raw range ±14
 *   Axis G/S/C (the rest): 5 Likert + 1 Scenario → raw range ±12
 *
 *   Total raw range:       ±50  →  totalScore is normalized 0–100
 */

import { describe, it, expect } from "vitest";
import { scoreAssessment } from "../scoring";
import type { Answer, Question, QuestionModule, AxisKey } from "../types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

/**
 * Build a module's worth of questions: `likertCount` Likerts (last one is B-dir,
 * the rest A-dir) + 1 standard scenario with options [strong-A, weak-A, weak-B, strong-B].
 */
function makeAxisQuestions(
  axis: AxisKey,
  module: QuestionModule,
  idPrefix: string,
  likertCount: number
): Question[] {
  const out: Question[] = [];
  for (let i = 1; i < likertCount; i++) {
    out.push({
      id: `${idPrefix}${i}`,
      module,
      axis,
      type: "likert",
      text: "Q",
      scoringDirection: "A",
      weight: 1,
    });
  }
  // Last Likert is B-dir to exercise direction flipping
  out.push({
    id: `${idPrefix}${likertCount}`,
    module,
    axis,
    type: "likert",
    text: "Q",
    scoringDirection: "B",
    weight: 1,
  });
  out.push({
    id: `${idPrefix}_S`,
    module,
    axis,
    type: "scenario",
    text: "Q",
    weight: 1,
    options: [
      { label: "Strong A", score: 2, pole: "A" },
      { label: "Weak A",   score: 1, pole: "A" },
      { label: "Weak B",   score: 1, pole: "B" },
      { label: "Strong B", score: 2, pole: "B" },
    ],
  });
  return out;
}

// v2.2 layout: 7/6/6/6 = 25
const ALL_QUESTIONS: Question[] = [
  ...makeAxisQuestions("A", "identity",    "A", 6),
  ...makeAxisQuestions("G", "nafs",        "G", 5),
  ...makeAxisQuestions("S", "marriage",    "S", 5),
  ...makeAxisQuestions("C", "brotherhood", "C", 5),
];

// Per-axis raw max (Likert × 2 + scenario × 2)
const AXIS_MAX = { A: 14, G: 12, S: 12, C: 12 } as const;

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

/** Max-pole-A answers for any question set. */
function answerAllPoleA(questions: Question[]): Answer[] {
  return questions.map((q) => {
    if (q.type === "scenario") return { questionId: q.id, value: 0 };
    return { questionId: q.id, value: q.scoringDirection === "A" ? 5 : 1 };
  });
}

/** Max-pole-B answers for any question set. */
function answerAllPoleB(questions: Question[]): Answer[] {
  return questions.map((q) => {
    if (q.type === "scenario") return { questionId: q.id, value: 3 };
    return { questionId: q.id, value: q.scoringDirection === "A" ? 1 : 5 };
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("scoreAssessment (v2.2 layout)", () => {
  // ── Pole A sweep ───────────────────────────────────────────────────────────

  it("all max pole-A → AGSC, stage 4, axisScores = 1.0, totalScore = 100", () => {
    const result = scoreAssessment(answerAllPoleA(ALL_QUESTIONS), ALL_QUESTIONS);
    expect(result.type).toBe("AGSC");
    expect(result.stage).toBe(4);
    for (const axis of ["A", "G", "S", "C"] as const) {
      expect(result.axisScores[axis]).toBeCloseTo(1.0, 5);
    }
    expect(result.totalScore).toBe(100);
    expect(result.midpointFlags).toHaveLength(0);
  });

  // ── Pole B sweep ───────────────────────────────────────────────────────────

  it("all max pole-B → DRPI, stage 1, axisScores = 0.0, totalScore = 0", () => {
    const result = scoreAssessment(answerAllPoleB(ALL_QUESTIONS), ALL_QUESTIONS);
    expect(result.type).toBe("DRPI");
    expect(result.stage).toBe(1);
    for (const axis of ["A", "G", "S", "C"] as const) {
      expect(result.axisScores[axis]).toBeCloseTo(0.0, 5);
    }
    expect(result.totalScore).toBe(0);
  });

  // ── All 16 type codes are reachable ────────────────────────────────────────

  it("every one of the 16 type codes is reachable", () => {
    const TYPES: string[] = [];
    for (const a of ["A", "D"]) {
      for (const g of ["G", "R"]) {
        for (const s of ["S", "P"]) {
          for (const c of ["C", "I"]) {
            TYPES.push(`${a}${g}${s}${c}`);
          }
        }
      }
    }
    expect(TYPES).toHaveLength(16);

    // For each type code, build answers that drive each axis to its target pole
    for (const code of TYPES) {
      const desired: Record<AxisKey, "A" | "B"> = {
        A: code[0] === "A" ? "A" : "B",
        G: code[1] === "G" ? "A" : "B",
        S: code[2] === "S" ? "A" : "B",
        C: code[3] === "C" ? "A" : "B",
      };
      const answers: Answer[] = ALL_QUESTIONS.map((q) => {
        const target = desired[q.axis];
        if (q.type === "scenario") {
          return { questionId: q.id, value: target === "A" ? 0 : 3 };
        }
        const wantPoleA = target === "A";
        const value =
          (q.scoringDirection === "A") === wantPoleA ? 5 : 1;
        return { questionId: q.id, value };
      });
      const result = scoreAssessment(answers, ALL_QUESTIONS);
      expect(result.type).toBe(code);
    }
  });

  // ── All 4 stages are reachable ─────────────────────────────────────────────

  it("each of the 4 stages is reachable with default thresholds", () => {
    // Stage 4: max pole-A
    expect(scoreAssessment(answerAllPoleA(ALL_QUESTIONS), ALL_QUESTIONS).stage).toBe(4);

    // Stage 1: max pole-B
    expect(scoreAssessment(answerAllPoleB(ALL_QUESTIONS), ALL_QUESTIONS).stage).toBe(1);

    // Stage 2: disagree (2) Likert + strong-A scenario
    //   A-dir Likert at v=2 → -1; B-dir Likert at v=2 → +1
    //   axis A (5A + 1B + 1 scenario): 5×(-1) + 1×(+1) + 1×2 = -2
    //   axis G/S/C (4A + 1B + 1 scenario): 4×(-1) + 1×(+1) + 1×2 = -1
    //   total raw = -2 + 3×(-1) = -5; totalScore = (-5+50)/100 × 100 = 45
    const stage2 = scoreAssessment(buildAnswers(ALL_QUESTIONS, 2, 0), ALL_QUESTIONS);
    expect(stage2.stage).toBe(2);
    expect(stage2.totalScore).toBe(45);

    // Stage 3: agree (4) Likert + strong-A scenario
    //   A-dir Likert at v=4 → +1; B-dir Likert at v=4 → -1
    //   axis A: 5×1 + 1×(-1) + 1×2 = 6
    //   axis G/S/C: 4×1 + 1×(-1) + 1×2 = 5
    //   total raw = 6 + 5 + 5 + 5 = 21; totalScore = 71
    const stage3 = scoreAssessment(buildAnswers(ALL_QUESTIONS, 4, 0), ALL_QUESTIONS);
    expect(stage3.stage).toBe(3);
    expect(stage3.totalScore).toBe(71);
  });

  // ── Neutral Likert ─────────────────────────────────────────────────────────

  it("all-neutral Likert → axisScores ≈ 0.5 (and all axes flagged)", () => {
    const answers = ALL_QUESTIONS.filter((q) => q.type === "likert").map((q) => ({
      questionId: q.id,
      value: 3,
    }));
    const result = scoreAssessment(answers, ALL_QUESTIONS);
    for (const axis of ["A", "G", "S", "C"] as const) {
      expect(result.axisScores[axis]).toBeCloseTo(0.5, 5);
    }
    expect(result.midpointFlags).toEqual(["A", "G", "S", "C"]);
  });

  // ── Scenario weight verification ───────────────────────────────────────────

  it("scenario contributions are signed pole × score (×scenarioWeight)", () => {
    const scenarioOnly: Question[] = [
      {
        id: "S1",
        module: "identity",
        axis: "A",
        type: "scenario",
        text: "Q",
        weight: 1,
        options: [
          { label: "Strong A", score: 2, pole: "A" },
          { label: "Weak A",   score: 1, pole: "A" },
          { label: "Weak B",   score: 1, pole: "B" },
          { label: "Strong B", score: 2, pole: "B" },
        ],
      },
    ];
    // Per-axis raw max = 2; axisScore = (raw + 2) / 4
    expect(scoreAssessment([{ questionId: "S1", value: 0 }], scenarioOnly).axisScores.A).toBeCloseTo(1.0, 5);
    expect(scoreAssessment([{ questionId: "S1", value: 1 }], scenarioOnly).axisScores.A).toBeCloseTo(0.75, 5);
    expect(scoreAssessment([{ questionId: "S1", value: 2 }], scenarioOnly).axisScores.A).toBeCloseTo(0.25, 5);
    expect(scoreAssessment([{ questionId: "S1", value: 3 }], scenarioOnly).axisScores.A).toBeCloseTo(0.0, 5);
  });

  // ── Midpoint flags ─────────────────────────────────────────────────────────

  it("axisScore exactly 0.50 triggers midpoint flag", () => {
    // A single Likert with value 3 (neutral) → raw 0 → score 0.5
    const q: Question[] = [
      { id: "L1", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
    ];
    const result = scoreAssessment([{ questionId: "L1", value: 3 }], q);
    expect(result.midpointFlags).toContain("A");
  });

  it("score 0.42 (within 0.10 of 0.5) triggers midpoint flag", () => {
    // Single scenario, weak-B → raw -1; score = 1/4 = 0.25 — too far
    // Use full ALL_QUESTIONS axis A, neutral + weak-B scenario:
    //   raw = -1; axisScore = (-1+14)/28 ≈ 0.464 → within 0.10 → flagged
    const answers = buildAnswers(ALL_QUESTIONS, 3, 2);
    const result = scoreAssessment(answers, ALL_QUESTIONS);
    expect(result.midpointFlags).toContain("A");
    expect(result.axisScores.A).toBeCloseTo((-1 + AXIS_MAX.A) / (2 * AXIS_MAX.A), 5);
  });

  it("axisScore far from 0.5 does NOT trigger midpoint flag", () => {
    const result = scoreAssessment(answerAllPoleA(ALL_QUESTIONS), ALL_QUESTIONS);
    expect(result.midpointFlags).toHaveLength(0);
  });

  // ── B-direction Likert ─────────────────────────────────────────────────────

  it("B-direction Likert flips raw sign", () => {
    const q: Question[] = [
      { id: "B1", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "B", weight: 1 },
    ];
    // value 5 = +2, B-dir flips → -2; per-axis raw max = 2; axisScore = 0
    expect(scoreAssessment([{ questionId: "B1", value: 5 }], q).axisScores.A).toBeCloseTo(0.0, 5);
    // value 1 = -2, B-dir flips → +2; axisScore = 1
    expect(scoreAssessment([{ questionId: "B1", value: 1 }], q).axisScores.A).toBeCloseTo(1.0, 5);
  });

  // ── Likert value mapping ───────────────────────────────────────────────────

  it.each([
    [1, -2],
    [2, -1],
    [3,  0],
    [4,  1],
    [5,  2],
  ])("Likert value %i (A-dir) maps to raw %i", (value, expectedRaw) => {
    const q: Question[] = [
      { id: "L1", module: "identity", axis: "A", type: "likert", text: "Q", scoringDirection: "A", weight: 1 },
    ];
    const result = scoreAssessment([{ questionId: "L1", value }], q);
    // Single Likert: per-axis max = 2; score = (raw + 2) / 4
    expect(result.axisScores.A).toBeCloseTo((expectedRaw + 2) / 4, 5);
  });

  // ── Single-axis isolation ──────────────────────────────────────────────────

  it("answering only axis A leaves other axes at 0.5", () => {
    const onlyA = ALL_QUESTIONS.filter((q) => q.axis === "A");
    const answers = answerAllPoleA(onlyA);
    const result = scoreAssessment(answers, ALL_QUESTIONS);
    expect(result.axisScores.A).toBeCloseTo(1.0, 5);
    for (const axis of ["G", "S", "C"] as const) {
      expect(result.axisScores[axis]).toBeCloseTo(0.5, 5);
    }
  });

  // ── Hypothetical text (Module 3) ───────────────────────────────────────────

  it("real questions.json: every Module 3 Likert has textHypothetical for unmarried respondents", async () => {
    const { getQuestions } = await import("../content");
    const qs = getQuestions();
    const m3Likerts = qs.filter((q) => q.module === "marriage" && q.type === "likert");
    expect(m3Likerts.length).toBeGreaterThan(0);
    for (const q of m3Likerts) {
      expect(q.textHypothetical).toBeDefined();
      expect(q.textHypothetical!.length).toBeGreaterThan(0);
    }
  });

  it("real questions.json: Module 3 scenario has textHypothetical", async () => {
    const { getQuestions } = await import("../content");
    const qs = getQuestions();
    const m3Scenario = qs.find((q) => q.module === "marriage" && q.type === "scenario");
    expect(m3Scenario).toBeDefined();
    expect((m3Scenario as { textHypothetical?: string }).textHypothetical).toBeDefined();
  });

  // ── Real questions smoke test ──────────────────────────────────────────────

  it("real questions.json has exactly 25 questions in the expected per-module distribution", async () => {
    const { getQuestions } = await import("../content");
    const qs = getQuestions();
    expect(qs).toHaveLength(25);

    const counts: Record<string, number> = {};
    for (const q of qs) counts[q.module] = (counts[q.module] ?? 0) + 1;
    expect(counts).toEqual({
      identity: 7,
      nafs: 6,
      marriage: 6,
      brotherhood: 6,
    });
  });

  it("real questions.json: max pole-A answers produce a valid AGSC result", async () => {
    const { getQuestions } = await import("../content");
    const qs = getQuestions();
    const result = scoreAssessment(answerAllPoleA(qs), qs);
    expect(result.type).toBe("AGSC");
    expect(result.stage).toBe(4);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});
