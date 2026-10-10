// Fails (exit 1) when the newest SNAP fiscal-year table in src/data/fpl.ts
// ends within WARN_DAYS days, or has already ended. Run weekly by
// .github/workflows/table-expiry.yml so an expired table never goes unnoticed.
//
// Usage: node scripts/check-table-expiry.mjs [--today YYYY-MM-DD]
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const WARN_DAYS = 30;

/** Newest `end: "YYYY-MM-DD"` value in the fpl.ts source text. */
export function newestEnd(source) {
  const ends = Array.from(source.matchAll(/^\s*end: "(\d{4}-\d{2}-\d{2})",$/gm), (m) => m[1]);
  if (ends.length === 0) throw new Error("no `end:` dates found in src/data/fpl.ts");
  return ends.sort().at(-1);
}

/** Whole days from `today` to `end` (both YYYY-MM-DD, UTC). Negative once ended. */
export function daysUntil(end, today) {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
}

async function main() {
  const flag = process.argv.indexOf("--today");
  const today = flag > -1 ? process.argv[flag + 1] : new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today ?? "")) throw new Error("--today needs YYYY-MM-DD");
  const source = await readFile(new URL("../src/data/fpl.ts", import.meta.url), "utf8");
  const end = newestEnd(source);
  const days = daysUntil(end, today);
  if (Number.isNaN(days)) throw new Error("--today or a table end is not a real date");
  if (days <= WARN_DAYS) {
    const state = days < 0 ? `ended ${-days} days ago` : `ends in ${days} days`;
    console.error(
      `FAIL: the newest SNAP table ends ${end} (${state}). Load the next fiscal year from the official FNS COLA memo in src/data/fpl.ts and research/SOURCES.md.`,
    );
    process.exit(1);
  }
  console.log(`ok: the newest SNAP table ends ${end} (${days} days from ${today}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
