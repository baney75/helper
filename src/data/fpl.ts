/**
 * SNAP monthly income standards by federal fiscal year (1 Oct to 30 Sep).
 *
 * FY2027 (1 Oct 2026 to 30 Sep 2027)
 *   Source: USDA Food and Nutrition Administration memo "SNAP - Fiscal Year 2027
 *   Cost-of-Living Adjustments", dated 21 Aug 2026. Income eligibility standards
 *   are on page 3; the asset limit is on page 2.
 *   URL: https://www.usda.gov/sites/default/files/guidance-documents/fna.snap-cola2027.pdf
 *   Checked 10 Oct 2026 against the FNS tables:
 *   https://www.fns.usda.gov/sites/default/files/resource-files/snap-fy27-incomeEligibilityStandards.pdf
 *   (see research/SOURCES.md).
 * FY2026 (1 Oct 2025 to 30 Sep 2026)
 *   Source: FNS COLA, https://www.fns.usda.gov/snap/allotment/COLA
 *
 * A new fiscal-year table needs a source review before the optional screen can
 * use it. Outside every table's window the screen pauses. The weekly workflow
 * (.github/workflows/table-expiry.yml) fails when the newest table ends within
 * 30 days. Keep each `end:` value on one line; scripts/check-table-expiry.mjs
 * reads them.
 */

export type Region = "contiguous" | "alaska" | "hawaii";

export type MonthlyLimits = {
  net100: number;
  gross130: number;
};

type RowTable = Record<number, MonthlyLimits>;

export type FiscalYearTable = {
  label: string;
  start: string;
  end: string;
  /** Asset limit for a household with a member 60 or older, or disabled. */
  elderlyResourceCap: number;
  rows: Record<Region, RowTable>;
  /** Added for each member beyond eight. */
  extra: Record<Region, MonthlyLimits>;
};

const FY2026_CONTIGUOUS: RowTable = {
  1: { net100: 1305, gross130: 1696 },
  2: { net100: 1763, gross130: 2292 },
  3: { net100: 2221, gross130: 2888 },
  4: { net100: 2680, gross130: 3483 },
  5: { net100: 3138, gross130: 4079 },
  6: { net100: 3596, gross130: 4675 },
  7: { net100: 4055, gross130: 5271 },
  8: { net100: 4513, gross130: 5867 },
};

const FY2026_ALASKA: RowTable = {
  1: { net100: 1630, gross130: 2118 },
  2: { net100: 2203, gross130: 2864 },
  3: { net100: 2776, gross130: 3609 },
  4: { net100: 3350, gross130: 4354 },
  5: { net100: 3923, gross130: 5100 },
  6: { net100: 4496, gross130: 5845 },
  7: { net100: 5070, gross130: 6590 },
  8: { net100: 5643, gross130: 7336 },
};

const FY2026_HAWAII: RowTable = {
  1: { net100: 1500, gross130: 1949 },
  2: { net100: 2027, gross130: 2635 },
  3: { net100: 2555, gross130: 3321 },
  4: { net100: 3082, gross130: 4007 },
  5: { net100: 3610, gross130: 4692 },
  6: { net100: 4137, gross130: 5378 },
  7: { net100: 4665, gross130: 6064 },
  8: { net100: 5192, gross130: 6750 },
};

export const FY2026: FiscalYearTable = {
  label: "FY2026",
  start: "2025-10-01",
  end: "2026-09-30",
  elderlyResourceCap: 4500,
  rows: {
    contiguous: FY2026_CONTIGUOUS,
    alaska: FY2026_ALASKA,
    hawaii: FY2026_HAWAII,
  },
  extra: {
    contiguous: { net100: 459, gross130: 596 },
    alaska: { net100: 574, gross130: 746 },
    hawaii: { net100: 528, gross130: 686 },
  },
};

const FY2027_CONTIGUOUS: RowTable = {
  1: { net100: 1330, gross130: 1729 },
  2: { net100: 1804, gross130: 2345 },
  3: { net100: 2277, gross130: 2960 },
  4: { net100: 2750, gross130: 3575 },
  5: { net100: 3224, gross130: 4191 },
  6: { net100: 3697, gross130: 4806 },
  7: { net100: 4170, gross130: 5421 },
  8: { net100: 4644, gross130: 6037 },
};

const FY2027_ALASKA: RowTable = {
  1: { net100: 1663, gross130: 2162 },
  2: { net100: 2255, gross130: 2931 },
  3: { net100: 2846, gross130: 3700 },
  4: { net100: 3438, gross130: 4469 },
  5: { net100: 4030, gross130: 5238 },
  6: { net100: 4621, gross130: 6008 },
  7: { net100: 5213, gross130: 6777 },
  8: { net100: 5805, gross130: 7546 },
};

const FY2027_HAWAII: RowTable = {
  1: { net100: 1530, gross130: 1989 },
  2: { net100: 2075, gross130: 2697 },
  3: { net100: 2619, gross130: 3404 },
  4: { net100: 3163, gross130: 4112 },
  5: { net100: 3707, gross130: 4819 },
  6: { net100: 4251, gross130: 5527 },
  7: { net100: 4795, gross130: 6234 },
  8: { net100: 5340, gross130: 6941 },
};

export const FY2027: FiscalYearTable = {
  label: "FY2027",
  start: "2026-10-01",
  end: "2027-09-30",
  elderlyResourceCap: 4750,
  rows: {
    contiguous: FY2027_CONTIGUOUS,
    alaska: FY2027_ALASKA,
    hawaii: FY2027_HAWAII,
  },
  extra: {
    contiguous: { net100: 474, gross130: 616 },
    alaska: { net100: 592, gross130: 770 },
    hawaii: { net100: 545, gross130: 708 },
  },
};

export const FISCAL_YEAR_TABLES: readonly FiscalYearTable[] = [FY2026, FY2027];

const LATEST = FISCAL_YEAR_TABLES[FISCAL_YEAR_TABLES.length - 1]!;

/** Last day covered by any loaded table. */
export const SNAP_TABLES_END = LATEST.end;

function localDate(now: Date): string {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

/** The table whose window contains `now`, or undefined when none is loaded. */
export function tableFor(now = new Date()): FiscalYearTable | undefined {
  const day = localDate(now);
  return FISCAL_YEAR_TABLES.find((t) => day >= t.start && day <= t.end);
}

export function hasCurrentSnapScreenRules(now = new Date()): boolean {
  return tableFor(now) !== undefined;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December",
];

export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

const NOT_LOADED = `Its limits are not loaded for today's date (the newest table, ${LATEST.label}, ended ${longDate(LATEST.end)}).`;

export function snapScreenRulesNote(now = new Date()): string {
  const table = tableFor(now);
  if (!table) {
    return `The optional income screen is paused. ${NOT_LOADED} Use the official SNAP page for current limits.`;
  }
  return `The optional income screen uses ${table.label} figures through ${longDate(table.end)}. Rules can change; the official SNAP page is the current source.`;
}

/** Body text for the screen result when no table covers today's date. */
export function snapScreenPausedBody(): string {
  return `This optional income screen is paused. ${NOT_LOADED} Only the state SNAP office can decide your case.`;
}

export function regionForState(state: string): Region {
  if (state === "AK") return "alaska";
  if (state === "HI") return "hawaii";
  return "contiguous";
}

export function elderlyResourceCap(now = new Date()): number | undefined {
  return tableFor(now)?.elderlyResourceCap;
}

export function snapMonthlyLimits(
  region: Region,
  householdSize: number,
  now = new Date(),
): MonthlyLimits {
  const fy = tableFor(now);
  if (!fy) {
    throw new Error(`no SNAP table loaded for ${localDate(now)}`);
  }
  const size = Math.max(1, Math.floor(householdSize));
  const table = fy.rows[region];
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
  const extra = fy.extra[region];
  const add = size - 8;
  return {
    net100: base.net100 + extra.net100 * add,
    gross130: base.gross130 + extra.gross130 * add,
  };
}
