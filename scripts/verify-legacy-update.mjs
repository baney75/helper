import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "/Users/baney/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs";

const legacyDistDir = resolve(process.argv[2] ?? "");
const evidenceDir = resolve(process.argv[3] ?? join(process.cwd(), "browser-evidence"));
const currentDistDir = join(process.cwd(), "dist");
const chromiumPath = "/Users/baney/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
let release = "legacy";

if (!process.argv[2]) throw new Error("Usage: node scripts/verify-legacy-update.mjs OLD_DIST EVIDENCE_DIR");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
    if (!pathname.startsWith("/helper/")) {
      response.writeHead(404).end("Not found");
      return;
    }
    const requested = pathname.slice("/helper/".length) || "index.html";
    const relative = normalize(requested).replace(/^(\.\.[/\\])+/, "");
    const root = release === "legacy" ? legacyDistDir : currentDistDir;
    let body = await readFile(join(root, relative));
    if (relative === "sw.js" && release === "future") {
      body = Buffer.concat([body, Buffer.from("\n// Helper future-update prompt test\n")]);
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(relative)] ?? "application/octet-stream",
      "Cache-Control": relative === "sw.js" ? "no-cache" : "no-store",
      "Service-Worker-Allowed": "/helper/",
    });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((done) => server.listen(0, "127.0.0.1", done));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not start legacy-update server");
const baseUrl = `http://127.0.0.1:${address.port}/helper/`;

const browser = await chromium.launch({ executablePath: chromiumPath, headless: true });
const context = await browser.newContext({ serviceWorkers: "allow", viewport: { width: 390, height: 844 } });
const page = await context.newPage();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForController() {
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload({ waitUntil: "networkidle" });
  }
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}

async function requestUpdate() {
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) throw new Error("No service-worker registration");
    await registration.update();
  });
}

try {
  await page.goto(`${baseUrl}#pages`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await waitForController();
  const legacyScripts = await page.locator("script[src]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src")));
  assert(legacyScripts.some((src) => src?.includes("index-B3TIe2ML.js")), `Did not start on the legacy client: ${legacyScripts}`);

  await page.locator("#zip").fill("19103");
  await page.locator("#zip").dispatchEvent("change");
  await page.locator("#step-next").click();
  await page.locator("#step-next").click();
  await page.locator("#interview-date").fill("2026-09-21");
  await page.locator("#interview-note").fill("Keep this through the release");
  await page.locator("#save-reminder").click();

  release = "current";
  const legacyMigration = page.waitForEvent("framenavigated", { timeout: 20000 });
  await requestUpdate();
  await legacyMigration;
  await page.locator("#reload-update").waitFor({ state: "attached" });
  const currentScripts = await page.locator("script[src]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src")));
  assert(!currentScripts.some((src) => src?.includes("index-B3TIe2ML.js")), `Legacy asset still executes after migration: ${currentScripts}`);
  assert(await page.locator("#interview-date").inputValue() === "2026-09-21", "Legacy migration lost the saved date");
  assert(await page.locator("#interview-note").inputValue() === "Keep this through the release", "Legacy migration lost the saved note");
  assert(await page.locator("#state").inputValue() === "PA", "Legacy migration lost Pennsylvania");

  await waitForController();
  const legacyStillCached = await page.evaluate(async () => Boolean(await caches.match("/helper/assets/index-B3TIe2ML.js")));
  assert(!legacyStillCached, "Legacy precache entry remained after current worker activation");

  release = "future";
  await requestUpdate();
  await page.locator("#update-banner").waitFor({ state: "visible", timeout: 15000 });
  assert(await page.locator("#reload-update").isVisible(), "Future release did not expose the Reload control");
  await Promise.all([
    page.waitForEvent("framenavigated", { timeout: 15000 }),
    page.locator("#reload-update").click(),
  ]);
  await page.locator("#interview-date").waitFor();
  assert(await page.locator("#interview-date").inputValue() === "2026-09-21", "Accepted future update lost the saved date");

  await page.screenshot({ path: join(evidenceDir, "15-legacy-migration-and-future-update.png"), fullPage: false });
  const report = {
    ok: true,
    browser: "Chrome for Testing 151 headless",
    route: baseUrl,
    legacyAsset: "index-B3TIe2ML.js",
    legacyMigration: "automatic one-time activation and reload",
    futureUpdate: "waited for visible Reload control",
    preserved: {
      state: await page.locator("#state").inputValue(),
      interviewDate: await page.locator("#interview-date").inputValue(),
      interviewNote: await page.locator("#interview-note").inputValue(),
    },
  };
  await writeFile(join(evidenceDir, "legacy-update-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await new Promise((done, reject) => server.close((error) => error ? reject(error) : done()));
}
