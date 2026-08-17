import { ENERGYHELP, FNS_DIRECTORY, NEAR_PHONE, PROGRAMS, programForState } from "./data/programs";
import { packetItems } from "./packet";
import { icsFilename, icsForReminder, isReminderKind, type ReminderKind } from "./reminder";
import { screenOlderAdult } from "./screen";
import { lookupZip } from "./zip";
import { watchNetwork } from "./online";
import {
  calendarMonth,
  energyButtonFallback,
  energySeasonCopy,
  packetSeasonLine,
} from "./season";
import {
  clearProgress,
  loadProgress,
  saveProgress,
  type Progress,
} from "./progress";
import { continueLabel, hashStep, nextStep, persistableStep, prevStep, stepLabel, type Step } from "./steps";

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
}

function input(id: string): HTMLInputElement {
  return $(id) as HTMLInputElement;
}

function select(id: string): HTMLSelectElement {
  return $(id) as HTMLSelectElement;
}

function fillStateSelect(): void {
  const el = select("state");
  for (const row of PROGRAMS) {
    const opt = document.createElement("option");
    opt.value = row.code;
    opt.textContent = `${row.name} (${row.code})`;
    el.append(opt);
  }
}

function bindOfficial(anchor: HTMLAnchorElement, href: string, label: string): void {
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = label;
}

function setOfficialLinks(code: string): void {
  const row = programForState(code);
  const snap = $("snap-link") as HTMLAnchorElement;
  const liheap = $("liheap-link") as HTMLAnchorElement;
  const packetSnap = $("packet-snap-link") as HTMLAnchorElement;
  const packetLiheap = $("packet-liheap-link") as HTMLAnchorElement;
  if (!row) {
    bindOfficial(snap, FNS_DIRECTORY, "Official SNAP state directory");
    bindOfficial(liheap, ENERGYHELP, energyButtonFallback(monthNow));
    bindOfficial(packetSnap, FNS_DIRECTORY, "FNS SNAP state directory");
    bindOfficial(packetLiheap, ENERGYHELP, "Energyhelp search");
    return;
  }
  bindOfficial(
    snap,
    row.snapApplyUrl,
    row.snapOnline
      ? `Official SNAP apply or how-to page for ${row.name}`
      : `Official SNAP how-to page for ${row.name}`,
  );
  bindOfficial(liheap, row.liheapUrl, `Official energy help page for ${row.name}`);
  bindOfficial(packetSnap, row.snapApplyUrl, `${row.name} SNAP page`);
  bindOfficial(packetLiheap, row.liheapUrl, `${row.name} energy help page`);
  $("liheap-note").textContent = `${row.energyHelpNote} National referral: ${NEAR_PHONE}. Or search by state at Energyhelp.`;
}

function currentState(): string {
  return select("state").value;
}

function reminderKind(): ReminderKind {
  const value = select("reminder-kind").value;
  return isReminderKind(value) ? value : "interview";
}

const monthNow = calendarMonth(new Date());

function numberOrNull(id: string): number | null {
  const raw = input(id).value.trim();
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function checkedPacketIds(): string[] {
  return Array.from(document.querySelectorAll<HTMLInputElement>("#packet-list input[type=checkbox]"))
    .filter((box) => box.checked && box.dataset.item)
    .map((box) => box.dataset.item ?? "");
}

function collectProgress(step: Step): Progress {
  return {
    v: 1,
    step,
    zip: input("zip").value,
    state: currentState(),
    age: input("age").value,
    household: input("household").value,
    income: input("income").value,
    resources: input("resources").value,
    shelter: input("shelter").checked,
    checked: checkedPacketIds(),
    interviewDate: input("interview-date").value,
    interviewNote: input("interview-note").value,
    reminderKind: reminderKind(),
    screenHeadline: $("screen-headline").textContent ?? "",
    screenBody: $("screen-body").textContent ?? "",
  };
}

let current: Step = "pages";
let persistTimer = 0;
let saveBannerTimer = 0;
let saveFailed = false;

function flashSaved(ok: boolean): void {
  const banner = $("save-banner");
  banner.hidden = false;
  banner.textContent = ok
    ? "Saved on this device."
    : "This browser blocked saving. Download the calendar file if you need a copy.";
  window.clearTimeout(saveBannerTimer);
  saveFailed = !ok;
  if (!ok) return;
  saveBannerTimer = window.setTimeout(() => {
    banner.hidden = true;
  }, 2500);
}

function persist(showBanner = false): boolean {
  const ok = saveProgress(collectProgress(persistableStep(current)));
  if (!ok || showBanner || saveFailed) flashSaved(ok);
  return ok;
}

function schedulePersist(): void {
  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => persist(false), 250);
}

function renderPacket(age: number | null, checked: string[]): void {
  const list = $("packet-list");
  list.replaceChildren();
  const age60Plus = age === null || age >= 60;
  for (const item of packetItems({ age60Plus })) {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.dataset.item = item.id;
    box.checked = checked.includes(item.id);
    box.addEventListener("change", schedulePersist);
    const wrap = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const detail = document.createElement("p");
    detail.textContent = item.detail;
    wrap.append(title, detail);
    label.append(box, wrap);
    li.append(label);
    list.append(li);
  }
}

function dateKindLabel(): string {
  const kind = reminderKind();
  if (kind === "recert") return "Recertification date";
  if (kind === "energy") return "Energy-help date";
  return "Interview date";
}

function setPacketInterviewLine(): void {
  const date = input("interview-date").value;
  const note = input("interview-note").value.trim();
  const line = $("packet-interview-line");
  const label = dateKindLabel();
  if (!date) {
    line.textContent = `${label}: write it here once the office sets it.`;
    return;
  }
  line.textContent = note ? `${label}: ${date}. ${note}` : `${label}: ${date}.`;
}

function showStep(step: Step, mode: "push" | "replace" | "hash"): void {
  current = step;
  for (const section of Array.from(document.querySelectorAll<HTMLElement>("section.step"))) {
    const match = section.dataset.step === step;
    section.classList.toggle("is-off", !match);
    if (match) section.setAttribute("aria-current", "step");
    else section.removeAttribute("aria-current");
  }
  $("step-status").textContent = stepLabel(step);
  const back = $("step-back") as HTMLButtonElement;
  const next = $("step-next") as HTMLButtonElement;
  const previous = prevStep(step);
  back.disabled = previous === null;
  next.textContent = continueLabel(step);
  syncContinue();
  const heading = document.querySelector<HTMLElement>(`section.step[data-step="${step}"] h2`);
  window.scrollTo(0, 0);
  heading?.focus();
  const hash = `#${step}`;
  if (mode === "hash") return;
  if (mode === "replace") {
    history.replaceState(null, "", hash);
    return;
  }
  if (location.hash !== hash) location.hash = hash;
}

function onZip(): void {
  const zip = input("zip").value;
  const result = lookupZip(zip);
  const status = $("zip-status");
  if (result.kind === "state") {
    const picked = currentState();
    if (!picked) {
      select("state").value = result.state;
      setOfficialLinks(result.state);
    }
    const row = programForState(result.state);
    const shown = programForState(currentState());
    if (picked && picked !== result.state && shown) {
      status.textContent = row
        ? `ZIP ${zip.replace(/\D/g, "").slice(0, 5)} maps to ${row.name}. You picked ${shown.name}. Official pages follow ${shown.name}.`
        : `That ZIP maps to ${result.state}. Official pages follow the state you picked.`;
    } else {
      status.textContent = row
        ? `ZIP ${zip.replace(/\D/g, "").slice(0, 5)} maps to ${row.name}. Open the official pages below. If that is the wrong state, pick the right one.`
        : `That ZIP maps to ${result.state}.`;
      setOfficialLinks(currentState() || result.state);
    }
    syncContinue();
    return;
  }
  status.textContent = result.reason;
  syncContinue();
}

function syncContinue(): void {
  const next = $("step-next") as HTMLButtonElement;
  const needsState = current === "pages" || current === "screen";
  next.disabled = needsState && !currentState();
}

function onScreen(): void {
  const age = numberOrNull("age");
  const out = screenOlderAdult({
    age,
    householdSize: numberOrNull("household"),
    state: currentState(),
    grossMonthlyIncome: numberOrNull("income"),
    countableResources: numberOrNull("resources"),
    highShelterOrMedical: input("shelter").checked,
  });
  $("screen-headline").textContent = out.headline;
  $("screen-body").textContent = out.body;
  $("screen-result").classList.add("has-result");
  renderPacket(age, checkedPacketIds());
  persist(true);
}

function onReminderSave(): void {
  const date = input("interview-date").value;
  if (!date) {
    $("reminder-status").textContent = "Pick a date first.";
    return;
  }
  setPacketInterviewLine();
  const ok = persist(true);
  $("reminder-status").textContent = ok
    ? "Saved on this device. It will print on the packet."
    : "This browser blocked saving. Download the calendar file.";
}

function onReminderDownload(): void {
  const date = input("interview-date").value;
  const note = input("interview-note").value;
  if (!date) {
    $("reminder-status").textContent = "Pick a date first.";
    return;
  }
  const kind = reminderKind();
  const blob = new Blob([icsForReminder({ date, note, kind })], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = icsFilename(kind);
  a.click();
  URL.revokeObjectURL(url);
}

function applyProgress(saved: Progress): void {
  input("zip").value = saved.zip;
  select("state").value = saved.state;
  input("age").value = saved.age;
  input("household").value = saved.household;
  input("income").value = saved.income;
  input("resources").value = saved.resources;
  input("shelter").checked = saved.shelter;
  input("interview-date").value = saved.interviewDate;
  input("interview-note").value = saved.interviewNote;
  select("reminder-kind").value = saved.reminderKind;
  if (saved.zip) onZip();
  if (saved.state) {
    select("state").value = saved.state;
    setOfficialLinks(saved.state);
  }
  if (saved.screenHeadline) {
    $("screen-headline").textContent = saved.screenHeadline;
    $("screen-body").textContent = saved.screenBody;
    $("screen-result").classList.add("has-result");
  }
  renderPacket(numberOrNull("age"), saved.checked);
  setPacketInterviewLine();
}

function resetDevice(): void {
  if (!window.confirm("Erase the answers saved on this device?")) return;
  clearProgress();
  input("zip").value = "";
  select("state").value = "";
  input("age").value = "";
  input("household").value = "";
  input("income").value = "";
  input("resources").value = "";
  input("shelter").checked = false;
  input("interview-date").value = "";
  input("interview-note").value = "";
  select("reminder-kind").value = "interview";
  $("zip-status").textContent = "";
  $("screen-headline").textContent = "";
  $("screen-body").textContent = "";
  $("screen-result").classList.remove("has-result");
  $("reminder-status").textContent = "Answers erased on this device.";
  setOfficialLinks("");
  renderPacket(null, []);
  setPacketInterviewLine();
  showStep("pages", "replace");
}

function onNext(): void {
  const upcoming = nextStep(current);
  if (upcoming) {
    showStep(upcoming, "push");
    persist(false);
    return;
  }
  window.print();
}

function onBack(): void {
  const previous = prevStep(current);
  if (!previous) return;
  showStep(previous, "replace");
  persist(false);
}

function restore(): void {
  const saved = loadProgress();
  if (saved) applyProgress(saved);
  else {
    renderPacket(null, []);
    setPacketInterviewLine();
  }
  const hashed = hashStep(location.hash);
  let start = hashed ?? persistableStep(saved?.step ?? "pages");
  if (start === "screen") start = "pages";
  showStep(start, hashed && hashed !== "screen" ? "hash" : "replace");
}

fillStateSelect();
($("energyhelp") as HTMLAnchorElement).href = ENERGYHELP;
($("fns-directory") as HTMLAnchorElement).href = FNS_DIRECTORY;
$("zip").addEventListener("change", onZip);
$("zip").addEventListener("blur", onZip);
$("zip").addEventListener("input", () => {
  const digits = input("zip").value.replace(/\D/g, "");
  if (digits.length >= 5) onZip();
  schedulePersist();
});
$("state").addEventListener("change", () => {
  setOfficialLinks(currentState());
  syncContinue();
  schedulePersist();
});
$("see-result").addEventListener("click", onScreen);
$("screen-form").addEventListener("submit", (event) => {
  event.preventDefault();
});
$("save-reminder").addEventListener("click", onReminderSave);
$("download-ics").addEventListener("click", onReminderDownload);
$("print-packet").addEventListener("click", () => window.print());
$("interview-date").addEventListener("input", () => {
  setPacketInterviewLine();
  schedulePersist();
});
$("interview-note").addEventListener("input", () => {
  setPacketInterviewLine();
  schedulePersist();
});
$("reminder-kind").addEventListener("change", () => {
  setPacketInterviewLine();
  schedulePersist();
});
for (const id of ["age", "household", "income", "resources", "shelter"] as const) {
  $(id).addEventListener("input", schedulePersist);
  $(id).addEventListener("change", schedulePersist);
}
$("step-back").addEventListener("click", onBack);
$("step-next").addEventListener("click", onNext);
$("open-screen").addEventListener("click", () => {
  if (!currentState()) {
    $("zip-status").textContent = "Pick a state or type a ZIP first.";
    return;
  }
  showStep("screen", "replace");
  persist(false);
});
$("skip-screen").addEventListener("click", () => {
  if (!currentState()) {
    showStep("pages", "replace");
    persist(false);
    return;
  }
  showStep("packet", "push");
  persist(false);
});
$("path-recert").addEventListener("click", () => {
  if (!currentState()) {
    $("zip-status").textContent = "Pick a state or type a ZIP first.";
    return;
  }
  select("reminder-kind").value = "recert";
  setPacketInterviewLine();
  showStep("interview", "push");
  persist(false);
});
$("clear-device").addEventListener("click", resetDevice);
window.addEventListener("hashchange", () => {
  const step = hashStep(location.hash);
  if (!step) return;
  showStep(step, "hash");
  persist(false);
});
window.addEventListener("pagehide", () => persist(false));
watchNetwork((online) => {
  $("net-banner").hidden = online;
});
restore();
$("now-energy").textContent = energySeasonCopy(monthNow);
$("packet-season").textContent = packetSeasonLine(monthNow);

if (import.meta.env.PROD) {
  void import("./pwa").then(({ startPwa }) => {
    startPwa({
      onOfflineReady: () => {
        if (saveFailed) return;
        const banner = $("update-banner");
        banner.hidden = false;
        banner.textContent = "This helper will keep working if the internet drops. Official apply pages still need the internet.";
      },
      onUpdated: () => {
        const banner = $("update-banner");
        banner.hidden = false;
      },
    });
  });
}
