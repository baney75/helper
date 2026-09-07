import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputPath = process.argv[2] ?? join(process.cwd(), "link-audit.json");
const source = await readFile(join(process.cwd(), "src/data/programs.ts"), "utf8");
const rows = Array.from(source.matchAll(/\{ code: "([A-Z]{2})", name: "([^"]+)", snapApplyUrl: "([^"]+)",[\s\S]*?liheapUrl: "([^"]+)"/g), (match) => ({
  code: match[1],
  name: match[2],
  snapApplyUrl: match[3],
  liheapUrl: match[4],
}));

if (rows.length !== 51) throw new Error(`Expected 51 jurisdictions, parsed ${rows.length}`);

const targets = rows.flatMap((row) => ([
  { code: row.code, name: row.name, kind: "SNAP", url: row.snapApplyUrl },
  { code: row.code, name: row.name, kind: "LIHEAP", url: row.liheapUrl },
]));

async function probe(target) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(target.url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Helper link maintenance check (baney75/helper; no household data)",
        Range: "bytes=0-2047",
      },
      signal: controller.signal,
    });
    return {
      ...target,
      status: response.status,
      ok: response.ok,
      finalUrl: response.url,
      result: response.ok ? "reachable" : response.status === 401 || response.status === 403 || response.status === 429 ? "automation-blocked" : "http-error",
    };
  } catch (error) {
    return {
      ...target,
      status: null,
      ok: false,
      finalUrl: null,
      result: error?.name === "AbortError" ? "timeout" : "network-error",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

const results = [];
const queue = [...targets];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const target = queue.shift();
    if (target) results.push(await probe(target));
  }
}));
results.sort((a, b) => a.code.localeCompare(b.code) || a.kind.localeCompare(b.kind));

const report = {
  checkedAt: new Date().toISOString(),
  method: "Bounded GET with redirects, a 2 KB Range header, and 12-second timeout. A success or redirect is transport evidence only; it does not prove that applications are open. Blocks and timeouts require manual review, not automatic replacement.",
  jurisdictions: rows.length,
  urls: results.length,
  counts: results.reduce((counts, item) => ({ ...counts, [item.result]: (counts[item.result] ?? 0) + 1 }), {}),
  results,
};
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, jurisdictions: report.jurisdictions, urls: report.urls, counts: report.counts }, null, 2));
