import { describe, expect, it } from "vitest";
import {
  FISCAL_YEAR_TABLES,
  SNAP_TABLES_END,
  hasCurrentSnapScreenRules,
  snapMonthlyLimits,
  snapScreenRulesNote,
} from "../src/data/fpl";
import { screenOlderAdult } from "../src/screen";
import { PROGRAMS, LINKS_CHECKED_ON } from "../src/data/programs";
import { daysUntil, newestEnd } from "../scripts/check-table-expiry.mjs";
import fplSrc from "../src/data/fpl.ts?raw";

// Source: USDA FNA memo "SNAP - Fiscal Year 2027 Cost-of-Living Adjustments",
// 21 Aug 2026, page 3 (income eligibility standards) and page 2 (asset limit).
// https://www.usda.gov/sites/default/files/guidance-documents/fna.snap-cola2027.pdf
describe("FY2027 SNAP income standards", () => {
  const fy27 = new Date("2026-10-10T12:00:00");

  it("starts on October 1, 2026 and FY2026 ends the day before", () => {
    expect(hasCurrentSnapScreenRules(new Date("2026-09-30T23:00:00"))).toBe(true);
    expect(snapScreenRulesNote(new Date("2026-09-30T12:00:00"))).toContain("FY2026");
    expect(snapScreenRulesNote(new Date("2026-10-01T00:30:00"))).toContain("FY2027");
    expect(snapScreenRulesNote(fy27)).toContain("September 30, 2027");
  });

  it("matches the memo for the 48 states and DC", () => {
    expect(snapMonthlyLimits("contiguous", 1, fy27)).toEqual({ net100: 1330, gross130: 1729 });
    expect(snapMonthlyLimits("contiguous", 2, fy27)).toEqual({ net100: 1804, gross130: 2345 });
    expect(snapMonthlyLimits("contiguous", 4, fy27)).toEqual({ net100: 2750, gross130: 3575 });
    expect(snapMonthlyLimits("contiguous", 8, fy27)).toEqual({ net100: 4644, gross130: 6037 });
    expect(snapMonthlyLimits("contiguous", 10, fy27)).toEqual({
      net100: 4644 + 2 * 474,
      gross130: 6037 + 2 * 616,
    });
  });

  it("matches the memo for Alaska and Hawaii", () => {
    expect(snapMonthlyLimits("alaska", 1, fy27)).toEqual({ net100: 1663, gross130: 2162 });
    expect(snapMonthlyLimits("alaska", 8, fy27)).toEqual({ net100: 5805, gross130: 7546 });
    expect(snapMonthlyLimits("hawaii", 1, fy27)).toEqual({ net100: 1530, gross130: 1989 });
    expect(snapMonthlyLimits("hawaii", 8, fy27)).toEqual({ net100: 5340, gross130: 6941 });
    expect(snapMonthlyLimits("hawaii", 9, fy27)).toEqual({
      net100: 5340 + 545,
      gross130: 6941 + 708,
    });
  });

  it("uses the $4,750 older-or-disabled asset limit", () => {
    const base = {
      age: 70,
      householdSize: 1,
      state: "PA",
      grossMonthlyIncome: 1000,
      highShelterOrMedical: false,
    };
    expect(screenOlderAdult({ ...base, countableResources: 4750 }, fy27).result).toBe(
      "likely_worth_applying",
    );
    expect(screenOlderAdult({ ...base, countableResources: 4751 }, fy27).result).toBe("maybe");
  });

  it("screens against the FY2027 gross limit", () => {
    const base = {
      age: 70,
      householdSize: 1,
      state: "PA",
      countableResources: 0,
      highShelterOrMedical: false,
    };
    // 1,700 is over the FY2026 limit (1,696) and under FY2027 (1,729).
    expect(screenOlderAdult({ ...base, grossMonthlyIncome: 1700 }, fy27).result).toBe(
      "likely_worth_applying",
    );
    expect(screenOlderAdult({ ...base, grossMonthlyIncome: 1730 }, fy27).result).toBe("maybe");
  });

  it("keeps each table internally ordered", () => {
    for (const fy of FISCAL_YEAR_TABLES) {
      for (const region of ["contiguous", "alaska", "hawaii"] as const) {
        for (let size = 1; size <= 8; size++) {
          const row = fy.rows[region][size]!;
          expect(row.gross130).toBeGreaterThan(row.net100);
          if (size > 1) expect(row.net100).toBeGreaterThan(fy.rows[region][size - 1]!.net100);
        }
      }
    }
  });
});

describe("table expiry guard", () => {
  it("reads the same newest end date the app uses", () => {
    expect(newestEnd(fplSrc)).toBe(SNAP_TABLES_END);
  });

  it("flags expiry inside 30 days and passes outside it", () => {
    expect(daysUntil(SNAP_TABLES_END, "2027-08-31")).toBe(30);
    expect(daysUntil(SNAP_TABLES_END, "2026-10-10")).toBeGreaterThan(30);
  });
});

describe("state link check dates", () => {
  it("gives every state an ISO checkedOn date that is not in the future", () => {
    expect(PROGRAMS.length).toBe(51);
    for (const row of PROGRAMS) {
      expect(row.checkedOn, row.code).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.checkedOn <= "2026-10-10", row.code).toBe(true);
    }
    expect(LINKS_CHECKED_ON).toBe("2026-09-07");
  });
});
