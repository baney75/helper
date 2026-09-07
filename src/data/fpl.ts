/** SNAP FY2026 monthly limits (1 Oct 2025–30 Sep 2026). Source: FNS COLA. */

/**
 * These figures are deliberately bounded. A new fiscal-year table needs a
 * source review before the optional screen can use it again.
 */
export const SNAP_FY2026_END = "2026-09-30";

export type Region = "contiguous" | "alaska" | "hawaii";

export type MonthlyLimits = {
  net100: number;
  gross130: number;
};

const CONTIGUOUS: Record<number, MonthlyLimits> = {
  1: { net100: 1305, gross130: 1696 },
  2: { net100: 1763, gross130: 2292 },
  3: { net100: 2221, gross130: 2888 },
  4: { net100: 2680, gross130: 3483 },
  5: { net100: 3138, gross130: 4079 },
  6: { net100: 3596, gross130: 4675 },
  7: { net100: 4055, gross130: 5271 },
  8: { net100: 4513, gross130: 5867 },
};

const ALASKA: Record<number, MonthlyLimits> = {
  1: { net100: 1630, gross130: 2118 },
  2: { net100: 2203, gross130: 2864 },
  3: { net100: 2776, gross130: 3609 },
  4: { net100: 3350, gross130: 4354 },
  5: { net100: 3923, gross130: 5100 },
  6: { net100: 4496, gross130: 5845 },
  7: { net100: 5070, gross130: 6590 },
  8: { net100: 5643, gross130: 7336 },
};

const HAWAII: Record<number, MonthlyLimits> = {
  1: { net100: 1500, gross130: 1949 },
  2: { net100: 2027, gross130: 2635 },
  3: { net100: 2555, gross130: 3321 },
  4: { net100: 3082, gross130: 4007 },
  5: { net100: 3610, gross130: 4692 },
  6: { net100: 4137, gross130: 5378 },
  7: { net100: 4665, gross130: 6064 },
  8: { net100: 5192, gross130: 6750 },
};

const EXTRA: Record<Region, MonthlyLimits> = {
  contiguous: { net100: 459, gross130: 596 },
  alaska: { net100: 574, gross130: 746 },
  hawaii: { net100: 528, gross130: 686 },
};

const TABLES: Record<Region, Record<number, MonthlyLimits>> = {
  contiguous: CONTIGUOUS,
  alaska: ALASKA,
  hawaii: HAWAII,
};

export const ELDERLY_RESOURCE_CAP = 4500;

export function hasCurrentSnapScreenRules(now = new Date()): boolean {
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return localDate <= SNAP_FY2026_END;
}

export function snapScreenRulesNote(now = new Date()): string {
  if (!hasCurrentSnapScreenRules(now)) {
    return "The optional income screen is paused because its FY2026 source ended September 30, 2026. Use the official SNAP page for current rules.";
  }
  return "The optional income screen uses FY2026 figures through September 30, 2026. Rules can change; the official SNAP page is the current source.";
}

export function regionForState(state: string): Region {
  if (state === "AK") return "alaska";
  if (state === "HI") return "hawaii";
  return "contiguous";
}

export function snapMonthlyLimits(
  region: Region,
  householdSize: number,
): MonthlyLimits {
  const size = Math.max(1, Math.floor(householdSize));
  const table = TABLES[region];
  if (size <= 8) {
    const row = table[size];
    if (!row) {
      throw new Error(`missing SNAP table row for ${region} size ${size}`);
    }
    return row;
  }
  const base = table[8];
  if (!base) {
    throw new Error(`missing SNAP table row for ${region} size 8`);
  }
  const extra = EXTRA[region];
  const add = size - 8;
  return {
    net100: base.net100 + extra.net100 * add,
    gross130: base.gross130 + extra.gross130 * add,
  };
}
