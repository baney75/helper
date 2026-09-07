import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "/Users/baney/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173/helper/";
const evidenceDir = process.argv[3] ?? join(process.cwd(), "browser-evidence");
const chromiumPath = "/Users/baney/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ executablePath: chromiumPath, headless: true });

const performanceContext = await browser.newContext({
  serviceWorkers: "block",
  viewport: { width: 1280, height: 800 },
});
const performancePage = await performanceContext.newPage();
const performanceClient = await performanceContext.newCDPSession(performancePage);
await performanceClient.send("Network.enable");
await performanceClient.send("Network.setCacheDisabled", { cacheDisabled: true });
await performanceClient.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: 209715,
  uploadThroughput: 98304,
  connectionType: "cellular3g",
});
await performanceClient.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await performancePage.goto(`${baseUrl}?case=performance#pages`, { waitUntil: "networkidle" });
const labPerformance = await performancePage.evaluate(() => {
  const navigation = performance.getEntriesByType("navigation")[0];
  const firstContentfulPaint = performance.getEntriesByName("first-contentful-paint")[0];
  return {
    responseStart: navigation ? Math.round(navigation.responseStart) : null,
    domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd) : null,
    load: navigation ? Math.round(navigation.loadEventEnd) : null,
    firstContentfulPaint: firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : null,
    transferSize: navigation?.transferSize ?? null,
  };
});
await performanceContext.close();

const context = await browser.newContext({ serviceWorkers: "allow" });
const page = await context.newPage();
const requests = [];
const pageErrors = [];

page.on("request", (request) => {
  requests.push({ method: request.method(), url: request.url(), hasBody: Boolean(request.postData()) });
});
page.on("pageerror", (error) => pageErrors.push(error.message));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function open(url, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator("#zip").waitFor();
}

async function cleanOpen(caseName, width = 1280, height = 800) {
  await page.goto(`${baseUrl}?case=${caseName}#pages`, { waitUntil: "domcontentloaded" });
  await page.locator("#clear-device").click();
  await page.locator("#erase-yes").click();
  await open(`${baseUrl}?case=${caseName}-clean#pages`, width, height);
}

async function fillInput(id, value) {
  const field = page.locator(`#${id}`);
  await field.fill(value);
  await field.dispatchEvent("change");
}

async function snap(name) {
  await page.screenshot({ path: join(evidenceDir, name), fullPage: false });
}

await cleanOpen("start");
assert(await page.locator("#zip").evaluate((element) => element === document.activeElement), "ZIP field did not receive initial keyboard focus");
await snap("01-start-desktop.png");

await page.locator("#clear-device").click();
assert(await page.locator("#erase-keep").evaluate((element) => element === document.activeElement), "Erase dialog did not move focus inside");
await page.keyboard.press("Shift+Tab");
assert(await page.locator("#erase-yes").evaluate((element) => element === document.activeElement), "Erase dialog did not wrap backward focus");
await page.keyboard.press("Tab");
assert(await page.locator("#erase-keep").evaluate((element) => element === document.activeElement), "Erase dialog did not wrap forward focus");
await page.keyboard.press("Escape");
assert(await page.locator("#clear-device").evaluate((element) => element === document.activeElement), "Erase dialog did not restore trigger focus");

await cleanOpen("keyboard");
await page.keyboard.type("19103");
await page.keyboard.press("Tab");
assert(await page.locator("#state").evaluate((element) => element === document.activeElement), "Tab did not move from ZIP to state");
await page.keyboard.press("Tab");
assert(await page.locator("#snap-link").evaluate((element) => element === document.activeElement), "Tab did not reach the revealed official SNAP link");
await page.locator("#step-next").focus();
await page.keyboard.press("Enter");
assert(await page.locator("#step-packet h2").evaluate((element) => element === document.activeElement), "Packet heading did not receive focus after keyboard navigation");
await page.keyboard.press("Tab");
assert(await page.locator("#packet-snap-link").evaluate((element) => element === document.activeElement), "Packet did not put its official SNAP link first in keyboard order");
await page.keyboard.press("Tab");
assert(await page.locator('#packet-list input[type="checkbox"]').first().evaluate((element) => element === document.activeElement), "Packet checklist was not next in keyboard order");
await page.keyboard.press("Space");
assert(await page.locator('#packet-list input[type="checkbox"]').first().isChecked(), "Space did not toggle the packet checkbox");

await cleanOpen("pennsylvania");
await fillInput("zip", "19103");
const pa = await page.evaluate(() => ({
  state: document.querySelector("#state").value,
  snap: document.querySelector("#snap-link").href,
  liheap: document.querySelector("#liheap-link").href,
  status: document.querySelector("#zip-status").textContent,
}));
assert(pa.state === "PA", `19103 selected ${pa.state}, not PA`);
assert(pa.snap === "https://www.compass.dhs.pa.gov/", `Wrong PA SNAP link: ${pa.snap}`);
assert(pa.liheap === "https://www.pa.gov/agencies/dhs/resources/liheap", `Wrong PA LIHEAP link: ${pa.liheap}`);
await snap("02-pennsylvania-desktop.png");

await page.locator("#state").selectOption("PA");
await fillInput("zip", "90210");
const manual = await page.evaluate(() => ({
  state: document.querySelector("#state").value,
  status: document.querySelector("#zip-status").textContent,
}));
assert(manual.state === "PA", "Manual Pennsylvania selection did not survive a California ZIP");
assert(/California/.test(manual.status) && /Pennsylvania/.test(manual.status), "State conflict message is unclear");

await cleanOpen("california");
await fillInput("zip", "90210");
const ca = await page.evaluate(() => ({
  state: document.querySelector("#state").value,
  snap: document.querySelector("#snap-link").href,
  liheap: document.querySelector("#liheap-link").href,
  label: document.querySelector("#snap-link").textContent,
}));
assert(ca.state === "CA", `90210 selected ${ca.state}, not CA`);
assert(ca.snap === "https://www.benefitscal.com/", `Wrong CA SNAP link: ${ca.snap}`);
assert(ca.liheap === "https://csd.ca.gov/Pages/LIHEAPProgram.aspx", `Wrong CA LIHEAP link: ${ca.liheap}`);
assert(/application/i.test(ca.label), "California link is not identified as an application");

await cleanOpen("fishers-island");
await fillInput("zip", "06390");
const fishers = await page.evaluate(() => ({
  state: document.querySelector("#state").value,
  snap: document.querySelector("#snap-link").href,
  status: document.querySelector("#zip-status").textContent,
}));
assert(fishers.state === "NY", `06390 selected ${fishers.state}, not NY`);
assert(/New York/.test(fishers.status), "06390 did not identify New York");
assert(fishers.snap === "https://otda.ny.gov/programs/apply/", `Wrong NY SNAP link: ${fishers.snap}`);
await snap("16-fishers-island-new-york.png");

await fillInput("zip", "06389");
const nearbyConnecticut = await page.evaluate(() => ({
  state: document.querySelector("#state").value,
  status: document.querySelector("#zip-status").textContent,
}));
assert(nearbyConnecticut.state === "CT", `06389 selected ${nearbyConnecticut.state}, not CT`);
assert(/Connecticut/.test(nearbyConnecticut.status), "Nearby 06389 did not remain Connecticut");

await cleanOpen("invalid");
await fillInput("zip", "00000");
const invalid = await page.evaluate(() => ({
  state: document.querySelector("#state").value,
  status: document.querySelector("#zip-status").textContent,
  nextDisabled: document.querySelector("#step-next").disabled,
}));
assert(invalid.state === "", "Invalid ZIP retained a state");
assert(/not assigned/i.test(invalid.status), "Invalid ZIP did not explain the error");
assert(invalid.nextDisabled, "Invalid ZIP allowed progress without a state");
await snap("03-invalid-zip-desktop.png");

await page.locator("#state").selectOption("PA");
await page.locator("#step-next").click();
assert(page.url().endsWith("#packet"), "Could not open packet step");
await page.locator('#packet-list input[type="checkbox"]').first().check();
await snap("04-packet-desktop.png");
await page.pdf({
  path: join(evidenceDir, "05-packet-print.pdf"),
  format: "Letter",
  printBackground: true,
  margin: { top: "0.35in", right: "0.35in", bottom: "0.35in", left: "0.35in" },
});

await page.locator("#step-next").click();
await fillInput("interview-date", "2026-09-15");
await fillInput("interview-note", "Call the number on the notice");
await page.locator("#save-reminder").click();
const saved = await page.evaluate(() => ({
  status: document.querySelector("#reminder-status").textContent,
  progress: JSON.parse(localStorage.getItem("helper-progress-v1")),
}));
assert(saved.progress.interviewDate === "2026-09-15", "Saved date missing from local storage");
assert(saved.progress.interviewNote === "Call the number on the notice", "Saved note missing from local storage");
await snap("06-date-saved-desktop.png");

await fillInput("interview-date", "2026-09-16");
await page.locator("#save-reminder").click();
await page.reload({ waitUntil: "networkidle" });
assert(await page.locator("#interview-date").inputValue() === "2026-09-16", "Edited date did not survive reload");
await page.locator("#remove-reminder").click();
const removed = await page.evaluate(() => ({
  date: document.querySelector("#interview-date").value,
  note: document.querySelector("#interview-note").value,
  progress: JSON.parse(localStorage.getItem("helper-progress-v1")),
}));
assert(removed.date === "" && removed.note === "", "Remove date did not clear the fields");
assert(removed.progress.interviewDate === "" && removed.progress.interviewNote === "", "Remove date did not clear saved data");

await page.locator("#step-back").click();
assert(page.url().endsWith("#packet"), "App Back did not return to packet");
await page.goBack({ waitUntil: "domcontentloaded" });
assert(["#pages", "#packet", "#interview"].includes(new URL(page.url()).hash), "Browser Back left the Helper flow");
await page.goForward({ waitUntil: "domcontentloaded" });
assert(["#packet", "#interview"].includes(new URL(page.url()).hash), "Browser Forward left the Helper flow");

await cleanOpen("phone", 320, 568);
await fillInput("zip", "19103");
const phone = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  stepScrollHeight: document.querySelector("#step-pages").scrollHeight,
  stepClientHeight: document.querySelector("#step-pages").clientHeight,
  activeOverflow: getComputedStyle(document.querySelector("#step-pages")).overflowY,
  snapVisible: !document.querySelector("#snap-link").hidden,
}));
assert(phone.scrollWidth <= phone.clientWidth, `Phone overflows horizontally: ${phone.scrollWidth} > ${phone.clientWidth}`);
assert(phone.snapVisible, "Phone did not show the state SNAP link");
assert(["auto", "scroll"].includes(phone.activeOverflow), "Phone step is not vertically scrollable");
await snap("07-pennsylvania-phone.png");
await page.locator("#step-next").click();
await snap("08-packet-phone.png");
await page.locator("#step-next").click();
await snap("09-date-phone.png");

await page.emulateMedia({ reducedMotion: "reduce" });
assert(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), "Reduced-motion preference was not active");
const reduced = await page.evaluate(() => getComputedStyle(document.body).transitionDuration);
assert(["0.00001s", "1e-05s", "0s"].includes(reduced), `Motion was not reduced: ${reduced}`);

await cleanOpen("zoom", 640, 700);
await fillInput("zip", "90210");
const zoom = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
assert(zoom.scrollWidth <= zoom.clientWidth, `200% proxy viewport overflows horizontally: ${zoom.scrollWidth} > ${zoom.clientWidth}`);
await snap("10-two-hundred-percent-proxy.png");

await cleanOpen("offline", 390, 844);
await fillInput("zip", "19103");
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
await context.setOffline(true);
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("#zip").waitFor();
const offlineState = await page.locator("#state").inputValue();
assert(offlineState === "PA", "Offline revisit lost the selected state");
if (await page.locator("#net-banner").isHidden()) {
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
}
await page.locator("#net-banner").waitFor({ state: "visible" });
await snap("11-offline-revisit-phone.png");
await context.setOffline(false);

await cleanOpen("storage-failure", 390, 844);
await fillInput("zip", "19103");
await page.locator("#step-next").click();
await page.locator("#step-next").click();
await fillInput("interview-date", "2026-09-20");
await page.evaluate(() => {
  const storage = Storage.prototype;
  window.__helperOriginalSetItem = storage.setItem;
  storage.setItem = () => { throw new DOMException("Test quota failure", "QuotaExceededError"); };
});
await page.locator("#save-reminder").click();
const storageFailureMessage = await page.locator("#reminder-status").textContent();
assert(/blocked saving|could not save/i.test(storageFailureMessage ?? ""), `Storage failure was not explained: ${storageFailureMessage}`);
await page.evaluate(() => {
  Storage.prototype.setItem = window.__helperOriginalSetItem;
});
await snap("12-storage-failure-phone.png");

await page.evaluate(() => {
  const storage = Storage.prototype;
  window.__helperOriginalRemoveItem = storage.removeItem;
  storage.removeItem = () => { throw new DOMException("Test security failure", "SecurityError"); };
});
await page.locator("#clear-device").click();
await page.locator("#erase-yes").click();
const resetFailureMessage = await page.locator("#save-banner").textContent();
assert(await page.locator("#save-banner").isVisible(), "Reset failure warning was hidden after returning to the first step");
assert(/did not confirm erasing/i.test(resetFailureMessage ?? ""), `Reset failure was not explained: ${resetFailureMessage}`);
await page.evaluate(() => {
  Storage.prototype.removeItem = window.__helperOriginalRemoveItem;
});

const actionRequests = requests.filter((request) => !["GET", "HEAD", "OPTIONS"].includes(request.method));
assert(actionRequests.length === 0, `Form actions sent network requests: ${JSON.stringify(actionRequests)}`);
assert(pageErrors.length === 0, `Browser exceptions: ${pageErrors.join("; ")}`);

const navigation = await page.evaluate(() => {
  const entry = performance.getEntriesByType("navigation")[0];
  return entry ? {
    responseStart: Math.round(entry.responseStart),
    domContentLoaded: Math.round(entry.domContentLoadedEventEnd),
    load: Math.round(entry.loadEventEnd),
    transferSize: entry.transferSize,
  } : null;
});
const report = {
  browser: "Chrome for Testing 151 headless",
  userAgent: await page.evaluate(() => navigator.userAgent),
  baseUrl,
  checks: {
    pennsylvania: pa,
    california: ca,
    fishersIsland: fishers,
    nearbyConnecticut,
    manualStateConflict: manual,
    invalidZip: invalid,
    phoneLayout: phone,
    twoHundredPercentProxy: zoom,
    savedDateStatus: saved.status,
    storageFailureMessage,
    resetFailureMessage,
    offlineState,
    reducedMotionTransitionDuration: reduced,
    nonReadNetworkRequests: actionRequests,
    browserExceptions: pageErrors,
    navigation,
    labPerformance: {
      profile: "Desktop 1280x800, simulated Fast 3G (150 ms RTT, 1.6 Mbps down, 750 Kbps up), 4x CPU slowdown, service worker blocked, cold cache",
      route: `${baseUrl}?case=performance#pages`,
      timingsMs: labPerformance,
      note: "Local lab navigation timings, not field Core Web Vitals.",
    },
  },
  requests,
};
await writeFile(join(evidenceDir, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, evidenceDir, checks: report.checks }, null, 2));
await browser.close();
