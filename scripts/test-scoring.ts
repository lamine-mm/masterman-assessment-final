/**
 * Automated scoring tests — 16 profiles, one per type code.
 * Run: npx tsx scripts/test-scoring.ts
 */

import { scoreAssessment } from "../lib/scoring";
import rawQuestions from "../content/questions.json";
import rawTypes from "../content/types.json";
import rawStages from "../content/stages.json";
import type { Answer, Question } from "../lib/types";

const questions = rawQuestions.questions as Question[];
const types = (rawTypes as { types: Record<string, { code: string; name: string }> }).types;
const stages = (rawStages as { stages: { number: number; name: string }[] }).stages;

// Question IDs by module
const IDENTITY_LIKERT = ["Q1", "Q2", "Q3", "Q4"]; // axis A
const IDENTITY_SCENARIO = "Q5";
const NAFS_LIKERT = ["Q6", "Q7", "Q8", "Q9"]; // axis G
const NAFS_SCENARIO = "Q10";
const MARRIAGE_LIKERT = ["Q11", "Q12", "Q13", "Q14"]; // axis S
const MARRIAGE_SCENARIO = "Q15";
const BROTHERHOOD_LIKERT = ["Q16", "Q17", "Q18", "Q19"]; // axis C
const BROTHERHOOD_SCENARIO = "Q20";

// Build answers for a specific pole combination
// poleA = true means score high on pole A for that axis
function buildAnswers(
  aHigh: boolean,
  gHigh: boolean,
  sHigh: boolean,
  cHigh: boolean,
  intensity: "strong" | "moderate" | "mild"
): Answer[] {
  const answers: Answer[] = [];
  const strongAgree = 5;
  const strongDisagree = 1;
  const mildAgree = 4;
  const mildDisagree = 2;
  const moderate = 3;

  function likertValue(high: boolean): number {
    if (intensity === "strong") return high ? strongAgree : strongDisagree;
    if (intensity === "moderate") return high ? mildAgree : mildDisagree;
    return moderate; // mild = neutral-ish
  }

  function likertValueReversed(high: boolean): number {
    // For scoringDirection "B" questions, agreeing = pole B
    // So if we want pole A high, we disagree with B-direction questions
    return likertValue(!high);
  }

  // Identity axis (A) — Q1(A), Q2(B), Q3(A), Q4(B)
  answers.push({ questionId: "Q1", value: likertValue(aHigh) });
  answers.push({ questionId: "Q2", value: likertValueReversed(aHigh) });
  answers.push({ questionId: "Q3", value: likertValue(aHigh) });
  answers.push({ questionId: "Q4", value: likertValueReversed(aHigh) });
  // Q5 scenario: option 0 or 3 = pole A (score 1 or 2), option 1 or 2 = pole B
  answers.push({ questionId: "Q5", value: aHigh ? (intensity === "strong" ? 3 : 0) : (intensity === "strong" ? 1 : 2) });

  // Nafs axis (G) — Q6(A), Q7(A), Q8(B), Q9(A)
  answers.push({ questionId: "Q6", value: likertValue(gHigh) });
  answers.push({ questionId: "Q7", value: likertValue(gHigh) });
  answers.push({ questionId: "Q8", value: likertValueReversed(gHigh) });
  answers.push({ questionId: "Q9", value: likertValue(gHigh) });
  // Q10 scenario: option 0 = strongest A, option 3 = strongest B
  answers.push({ questionId: "Q10", value: gHigh ? (intensity === "strong" ? 0 : 1) : (intensity === "strong" ? 3 : 2) });

  // Marriage axis (S) — Q11(A), Q12(B), Q13(A), Q14(B)
  answers.push({ questionId: "Q11", value: likertValue(sHigh) });
  answers.push({ questionId: "Q12", value: likertValueReversed(sHigh) });
  answers.push({ questionId: "Q13", value: likertValue(sHigh) });
  answers.push({ questionId: "Q14", value: likertValueReversed(sHigh) });
  // Q15 scenario: option 0 = strongest A, option 2 = strongest B
  answers.push({ questionId: "Q15", value: sHigh ? (intensity === "strong" ? 0 : 3) : (intensity === "strong" ? 2 : 1) });

  // Brotherhood axis (C) — Q16(A), Q17(B), Q18(A), Q19(B)
  answers.push({ questionId: "Q16", value: likertValue(cHigh) });
  answers.push({ questionId: "Q17", value: likertValueReversed(cHigh) });
  answers.push({ questionId: "Q18", value: likertValue(cHigh) });
  answers.push({ questionId: "Q19", value: likertValueReversed(cHigh) });
  // Q20 scenario: option 0 = strongest A, option 3 = strongest B
  answers.push({ questionId: "Q20", value: cHigh ? (intensity === "strong" ? 0 : 1) : (intensity === "strong" ? 3 : 2) });

  return answers;
}

// All 16 type codes
const TYPE_CODES = [
  "AGSC", "AGSI", "AGPC", "AGPI",
  "ARSC", "ARSI", "ARPC", "ARPI",
  "DGSC", "DGSI", "DGPC", "DGPI",
  "DRSC", "DRSI", "DRPC", "DRPI",
];

console.log("=".repeat(80));
console.log("MASTERMAN SCORING ENGINE — 16 TYPE TESTS");
console.log("=".repeat(80));
console.log();

let passed = 0;
let failed = 0;
const errors: string[] = [];

for (const expectedCode of TYPE_CODES) {
  const aHigh = expectedCode[0] === "A";
  const gHigh = expectedCode[1] === "G";
  const sHigh = expectedCode[2] === "S";
  const cHigh = expectedCode[3] === "C";

  const answers = buildAnswers(aHigh, gHigh, sHigh, cHigh, "strong");
  const result = scoreAssessment(answers, questions);

  const typeMatch = result.type === expectedCode;
  const typeEntry = types[result.type];
  const stageEntry = stages.find((s) => s.number === result.stage);

  const status = typeMatch ? "PASS" : "FAIL";
  if (typeMatch) passed++;
  else {
    failed++;
    errors.push(`Expected ${expectedCode}, got ${result.type}`);
  }

  console.log(
    `[${status}] ${expectedCode.padEnd(4)} → got ${result.type.padEnd(4)} | ` +
    `Stage ${result.stage} (${stageEntry?.name ?? "?"}) | ` +
    `Score ${result.totalScore} | ` +
    `A=${result.axisScores.A.toFixed(2)} G=${result.axisScores.G.toFixed(2)} ` +
    `S=${result.axisScores.S.toFixed(2)} C=${result.axisScores.C.toFixed(2)} | ` +
    `${typeEntry?.name ?? "MISSING TYPE"}`
  );

  // Verify type content exists
  if (!typeEntry) {
    errors.push(`Type ${result.type} has no entry in types.json`);
  }
}

console.log();
console.log("=".repeat(80));

// Run edge cases: all neutral (stage 2, midpoint flags), all max, all min
console.log("EDGE CASE TESTS");
console.log("=".repeat(80));

// All strongly agree (max score)
const allMax = questions.map((q) => ({
  questionId: q.id,
  value: q.type === "scenario" ? 0 : 5,
}));
const maxResult = scoreAssessment(allMax, questions);
console.log(
  `[INFO] All max   → ${maxResult.type} | Stage ${maxResult.stage} | Score ${maxResult.totalScore} | ` +
  `A=${maxResult.axisScores.A.toFixed(2)} G=${maxResult.axisScores.G.toFixed(2)} ` +
  `S=${maxResult.axisScores.S.toFixed(2)} C=${maxResult.axisScores.C.toFixed(2)}`
);
if (maxResult.stage !== 4) {
  errors.push(`All max should be Stage 4, got Stage ${maxResult.stage}`);
  failed++;
} else passed++;

// All strongly disagree (min score)
const allMin = questions.map((q) => ({
  questionId: q.id,
  value: q.type === "scenario" ? 3 : 1,
}));
const minResult = scoreAssessment(allMin, questions);
console.log(
  `[INFO] All min   → ${minResult.type} | Stage ${minResult.stage} | Score ${minResult.totalScore} | ` +
  `A=${minResult.axisScores.A.toFixed(2)} G=${minResult.axisScores.G.toFixed(2)} ` +
  `S=${minResult.axisScores.S.toFixed(2)} C=${minResult.axisScores.C.toFixed(2)}`
);
if (minResult.stage !== 1) {
  errors.push(`All min should be Stage 1, got Stage ${minResult.stage}`);
  failed++;
} else passed++;

// All neutral (midpoint)
const allNeutral = questions.map((q) => ({
  questionId: q.id,
  value: q.type === "scenario" ? 1 : 3,
}));
const neutralResult = scoreAssessment(allNeutral, questions);
console.log(
  `[INFO] All neut  → ${neutralResult.type} | Stage ${neutralResult.stage} | Score ${neutralResult.totalScore} | ` +
  `A=${neutralResult.axisScores.A.toFixed(2)} G=${neutralResult.axisScores.G.toFixed(2)} ` +
  `S=${neutralResult.axisScores.S.toFixed(2)} C=${neutralResult.axisScores.C.toFixed(2)} | ` +
  `Midpoint flags: [${neutralResult.midpointFlags.join(", ")}]`
);

console.log();
console.log("=".repeat(80));
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (errors.length > 0) {
  console.log("ERRORS:");
  errors.forEach((e) => console.log(`  - ${e}`));
}
console.log("=".repeat(80));

process.exit(failed > 0 ? 1 : 0);
