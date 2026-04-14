/**
 * Opening-angle generator unit tests.
 *
 * Covers:
 *   - All 16 type codes return non-empty strings
 *   - Stage groups: stages 1-2 use stageEarly, stages 3-4 use stageLate
 *   - {name} placeholder is replaced with firstName
 *   - midpointFlags: closeCallSuffix is appended with correct axis names
 *   - Single flag, two flags, three flags, all four flags
 *   - Unknown type code → graceful fallback (non-empty, contains name)
 *   - Axis name rendering: single / two / three / four axes
 */

import { describe, it, expect } from "vitest";
import { getOpeningAngle } from "../opening-angles";

const ALL_TYPES = [
  "AGSC", "AGSI", "AGPC", "AGPI",
  "ARSC", "ARSI", "ARPC", "ARPI",
  "DGSC", "DGSI", "DGPC", "DGPI",
  "DRSC", "DRSI", "DRPC", "DRPI",
];

const FIRST_NAME = "Bilal";

// ─── All 16 types × 2 stage groups ───────────────────────────────────────────

describe("getOpeningAngle — all 16 types", () => {
  for (const typeCode of ALL_TYPES) {
    it(`${typeCode} stage 1 (early) → non-empty string containing name`, () => {
      const result = getOpeningAngle(typeCode, 1, [], FIRST_NAME);
      expect(result.length).toBeGreaterThan(10);
      expect(result).toContain(FIRST_NAME);
      expect(result).not.toContain("{name}");
    });

    it(`${typeCode} stage 2 (early) → same stageEarly branch as stage 1`, () => {
      const stage1 = getOpeningAngle(typeCode, 1, [], FIRST_NAME);
      const stage2 = getOpeningAngle(typeCode, 2, [], FIRST_NAME);
      expect(stage1).toBe(stage2); // same template, same name, same result
    });

    it(`${typeCode} stage 3 (late) → non-empty string containing name`, () => {
      const result = getOpeningAngle(typeCode, 3, [], FIRST_NAME);
      expect(result.length).toBeGreaterThan(10);
      expect(result).toContain(FIRST_NAME);
      expect(result).not.toContain("{name}");
    });

    it(`${typeCode} stage 4 (late) → same stageLate branch as stage 3`, () => {
      const stage3 = getOpeningAngle(typeCode, 3, [], FIRST_NAME);
      const stage4 = getOpeningAngle(typeCode, 4, [], FIRST_NAME);
      expect(stage3).toBe(stage4);
    });

    it(`${typeCode}: stageEarly and stageLate produce different text`, () => {
      const early = getOpeningAngle(typeCode, 1, [], FIRST_NAME);
      const late  = getOpeningAngle(typeCode, 4, [], FIRST_NAME);
      expect(early).not.toBe(late);
    });
  }
});

// ─── Name substitution ────────────────────────────────────────────────────────

describe("name placeholder substitution", () => {
  it("replaces {name} with the provided firstName", () => {
    const result = getOpeningAngle("AGSC", 1, [], "Yusuf");
    expect(result).toContain("Yusuf");
    expect(result).not.toContain("{name}");
  });

  it("works with names that include spaces or special chars", () => {
    const result = getOpeningAngle("DRPI", 2, [], "Abu Bakr");
    expect(result).toContain("Abu Bakr");
  });
});

// ─── Close-call (midpoint flag) suffix ───────────────────────────────────────

describe("closeCallSuffix with midpointFlags", () => {
  it("no flags → no closeCallSuffix appended", () => {
    const without = getOpeningAngle("AGSC", 1, [], FIRST_NAME);
    const withFlag = getOpeningAngle("AGSC", 1, ["A"], FIRST_NAME);
    expect(withFlag.length).toBeGreaterThan(without.length);
  });

  it("single flag A → suffix contains 'Identity'", () => {
    const result = getOpeningAngle("AGSC", 1, ["A"], FIRST_NAME);
    expect(result).toContain("Identity");
    expect(result).not.toContain("{AXES}");
  });

  it("single flag G → suffix contains 'Nafs'", () => {
    const result = getOpeningAngle("AGSC", 1, ["G"], FIRST_NAME);
    expect(result).toContain("Nafs");
  });

  it("single flag S → suffix contains 'Marriage'", () => {
    const result = getOpeningAngle("AGSC", 1, ["S"], FIRST_NAME);
    expect(result).toContain("Marriage");
  });

  it("single flag C → suffix contains 'Brotherhood'", () => {
    const result = getOpeningAngle("AGSC", 1, ["C"], FIRST_NAME);
    expect(result).toContain("Brotherhood");
  });

  it("two flags → both axis names appear in output", () => {
    const result = getOpeningAngle("DRPI", 2, ["A", "G"], FIRST_NAME);
    expect(result).toContain("Identity");
    expect(result).toContain("Nafs");
  });

  it("three flags → all three axis names appear", () => {
    const result = getOpeningAngle("ARSC", 3, ["A", "G", "S"], FIRST_NAME);
    expect(result).toContain("Identity");
    expect(result).toContain("Nafs");
    expect(result).toContain("Marriage");
  });

  it("four flags → all four axis names appear", () => {
    const result = getOpeningAngle("AGPC", 4, ["A", "G", "S", "C"], FIRST_NAME);
    expect(result).toContain("Identity");
    expect(result).toContain("Nafs");
    expect(result).toContain("Marriage");
    expect(result).toContain("Brotherhood");
  });

  it("{AXES} placeholder is fully replaced (no raw token in output)", () => {
    const result = getOpeningAngle("AGSC", 1, ["A", "C"], FIRST_NAME);
    expect(result).not.toContain("{AXES}");
  });
});

// ─── Graceful fallback ────────────────────────────────────────────────────────

describe("fallback for unknown type code", () => {
  it("unknown type → returns non-empty string containing name", () => {
    const result = getOpeningAngle("ZZZZ", 1, [], FIRST_NAME);
    expect(result.length).toBeGreaterThan(5);
    expect(result).toContain(FIRST_NAME);
  });

  it("unknown type stage 4 → non-empty string", () => {
    const result = getOpeningAngle("XXXX", 4, [], FIRST_NAME);
    expect(result.length).toBeGreaterThan(5);
  });

  it("unknown type with midpointFlags → no crash, no {AXES} token", () => {
    const result = getOpeningAngle("ZZZZ", 2, ["A", "G"], FIRST_NAME);
    // Fallback has no closeCallSuffix, so flags are silently ignored
    expect(result).not.toContain("{AXES}");
    expect(result.length).toBeGreaterThan(5);
  });
});
