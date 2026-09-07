import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "/Users/baney/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs";

const evidenceDir = process.argv[2] ?? join(process.cwd(), "browser-evidence");
const distDir = join(process.cwd(), "dist");
const chromiumPath = "/Users/baney/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
let release = 1;

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
    let body = await readFile(join(distDir, relative));
    if (relative === "sw.js" && release === 2) {
      body = Buffer.concat([body, Buffer.from("\n// Helper update-persistence release 2\n")]);
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

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not start update test server");
const baseUrl = `http://127.0.0.1:${address.port}/helper/`;

const browser = await chromium.launch({ executablePath: chromiumPath, headless: true });
const context = await browser.newContext({ serviceWorkers: "allow", viewport: { width: 390, height: 844 } });
const page = await context.newPage();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await page.goto(`${baseUrl}#pages`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload({ waitUntil: "networkidle" });
  }
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await page.locator("#zip").fill("19103");
  await page.locator("#zip").dispatchEvent("change");
  await page.locator("#step-next").click();
  await page.locator("#step-next").click();
  await page.locator("#interview-date").fill("2026-09-19");
  await page.locator("#interview-note").fill("Bring the notice");
  await page.locator("#save-reminder").click();

  release = 2;
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) throw new Error("No service-worker registration");
    await registration.update();
  });
  await page.locator("#update-banner").waitFor({ state: "visible", timeout: 15000 });
  assert(await page.locator("#reload-update").isVisible(), "Update prompt lost its reload button");

  await Promise.all([
    page.waitForEvent("framenavigated", { timeout: 15000 }),
    page.locator("#reload-update").click(),
  ]);
  await page.locator("#interview-date").waitFor();
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("helper-progress-v1") ?? "null"));
  assert(progress?.state === "PA", "Normal update lost the selected state");
  assert(progress?.interviewDate === "2026-09-19", "Normal update lost the saved date");
  assert(progress?.interviewNote === "Bring the notice", "Normal update lost the saved note");
  assert(await page.locator("#interview-date").inputValue() === "2026-09-19", "Updated UI did not restore the date");

  await page.screenshot({ path: join(evidenceDir, "12-update-survives-phone.png"), fullPage: false });
  const report = {
    ok: true,
    browser: "Chrome for Testing 151 headless",
    route: baseUrl,
    scenario: "Install current production build, save PA and a date locally, serve a byte-different service worker, accept the update prompt, and reload.",
    preserved: {
      state: progress.state,
      interviewDate: progress.interviewDate,
      interviewNote: progress.interviewNote,
    },
  };
  await writeFile(join(evidenceDir, "update-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
