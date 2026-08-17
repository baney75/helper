/** SNAP FY2026 monthly limits (1 Oct 2025–30 Sep 2026). Source: FNS COLA. */

export type Region = "contiguous" | "alaska" | "hawaii";

export type MonthlyLimits = {
  net100: number;
  gross130: number;
  separate165: number;
};

const CONTIGUOUS: Record<number, MonthlyLimits> = {
  1: { net100: 1305, gross130: 1696, separate165: 2152 },
  2: { net100: 1763, gross130: 2292, separate165: 2909 },
  3: { net100: 2221, gross130: 2888, separate165: 3665 },
  4: { net100: 2680, gross130: 3483, separate165: 4421 },
  5: { net100: 3138, gross130: 4079, separate165: 5177 },
  6: { net100: 3596, gross130: 4675, separate165: 5934 },
  7: { net100: 4055, gross130: 5271, separate165: 6690 },
  8: { net100: 4513, gross130: 5867, separate165: 7446 },
};

const ALASKA: Record<number, MonthlyLimits> = {
  1: { net100: 1630, gross130: 2118, separate165: 2689 },
  2: { net100: 2203, gross130: 2864, separate165: 3635 },
  3: { net100: 2776, gross130: 3609, separate165: 4581 },
  4: { net100: 3350, gross130: 4354, separate165: 5527 },
  5: { net100: 3923, gross130: 5100, separate165: 6473 },
  6: { net100: 4496, gross130: 5845, separate165: 7419 },
  7: { net100: 5070, gross130: 6590, separate165: 8365 },
  8: { net100: 5643, gross130: 7336, separate165: 9311 },
};

const HAWAII: Record<number, MonthlyLimits> = {
  1: { net100: 1500, gross130: 1949, separate165: 2474 },
  2: { net100: 2027, gross130: 2635, separate165: 3344 },
  3: { net100: 2555, gross130: 3321, separate165: 4215 },
  4: { net100: 3082, gross130: 4007, separate165: 5085 },
  5: { net100: 3610, gross130: 4692, separate165: 5956 },
  6: { net100: 4137, gross130: 5378, separate165: 6826 },
  7: { net100: 4665, gross130: 6064, separate165: 7696 },
  8: { net100: 5192, gross130: 6750, separate165: 8567 },
};

const EXTRA: Record<Region, { net100: number; gross130: number; separate165: number }> =
  {
    contiguous: { net100: 459, gross130: 596, separate165: 757 },
    alaska: { net100: 574, gross130: 746, separate165: 946 },
    hawaii: { net100: 528, gross130: 686, separate165: 871 },
  };

const TABLES: Record<Region, Record<number, MonthlyLimits>> = {
  contiguous: CONTIGUOUS,
  alaska: ALASKA,
  hawaii: HAWAII,
};

export const ELDERLY_RESOURCE_CAP = 4500;

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
    separate165: base.separate165 + extra.separate165 * add,
  };
}
