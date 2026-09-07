import { ENERGYHELP, FNS_DIRECTORY, NEAR_PHONE, PROGRAMS, programForState } from "./data/programs";
import { snapScreenRulesNote } from "./data/fpl";
import { packetItems } from "./packet";
import { fillWithPhoneLinks } from "./phone";
import { icsFilename, icsForReminder, isReminderKind, type ReminderKind } from "./reminder";
import { screenOlderAdult } from "./screen";
import { stateForZip, type StateSelectionOrigin } from "./state-selection";
import { lookupZip } from "./zip";
import { watchNetwork } from "./online";
import {
  calendarMonth,
  energyButtonFallback,
  energySeasonShort,
  packetSeasonLine,
} from "./season";
import {
  clearProgress,
  loadProgress,
  saveProgress,
  type Progress,
} from "./progress";
import { continueAria, continueLabel, hashStep, nextStep, persistableStep, prevStep, stepLabel, type Step } from "./steps";

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

function bindOfficial(
  anchor: HTMLAnchorElement,
  href: string,
  label: string,
  ariaLabel = label,
): void {
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = label;
  anchor.setAttribute("aria-label", ariaLabel);
}

function snapLinkLabel(
  row: NonNullable<ReturnType<typeof programForState>>,
  includeState = false,
): string {
  const label = row.snapLinkKind === "application"
    ? "Open official SNAP application"
    : row.snapOnline
      ? "Open official SNAP start page"
      : "Read official SNAP information";
  return includeState ? `${label} · ${row.name}` : label;
}

function setSnapReady(ready: boolean): void {
  const snap = $("snap-link") as HTMLAnchorElement;
  const fallback = $("fns-fallback");
  snap.hidden = !ready;
  if (ready) {
    snap.removeAttribute("aria-disabled");
    snap.removeAttribute("tabindex");
  } else {
    snap.setAttribute("aria-disabled", "true");
    snap.tabIndex = -1;
  }
  fallback.hidden = ready;
}

function setOfficialLinks(code: string): void {
  const row = programForState(code);
  const snap = $("snap-link") as HTMLAnchorElement;
  const liheap = $("liheap-link") as HTMLAnchorElement;
  const packetSnap = $("packet-snap-link") as HTMLAnchorElement;
  const packetLiheap = $("packet-liheap-link") as HTMLAnchorElement;
  const note = $("liheap-note");
  if (!row) {
    bindOfficial(snap, FNS_DIRECTORY, "Open official SNAP page");
    bindOfficial(liheap, ENERGYHELP, energyButtonFallback(monthNow));
    bindOfficial(packetSnap, FNS_DIRECTORY, "Open official SNAP page");
    bindOfficial(packetLiheap, ENERGYHELP, "Energyhelp search");
    setSnapReady(false);
    note.hidden = true;
    return;
  }
  bindOfficial(snap, row.snapApplyUrl, snapLinkLabel(row), `${snapLinkLabel(row)} for ${row.name}`);
  bindOfficial(liheap, row.liheapUrl, `Energy help · ${row.name}`);
  bindOfficial(packetSnap, row.snapApplyUrl, snapLinkLabel(row, true));
  bindOfficial(packetLiheap, row.liheapUrl, `${row.name} energy help page`);
  fillWithPhoneLinks(
    note,
    `${row.energyHelpNote} National referral: ${NEAR_PHONE}. Or search by state at Energyhelp.`,
  );
  note.hidden = false;
  setSnapReady(true);
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
    stateOrigin: stateSelectionOrigin,
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
let stateSelectionOrigin: StateSelectionOrigin = "none";

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

function flashReset(cleared: boolean): void {
  const banner = $("save-banner");
  banner.hidden = false;
  banner.textContent = cleared
    ? "Answers erased on this device."
    : "This browser did not confirm erasing saved answers. Close this tab before sharing the device.";
  window.clearTimeout(saveBannerTimer);
  saveFailed = !cleared;
  if (!cleared) return;
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
    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const detail = document.createElement("p");
    detail.textContent = item.detail;
    text.append(title, detail);
    label.append(box, text);
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
    line.hidden = true;
    line.textContent = "";
    return;
  }
  line.hidden = false;
  line.textContent = note ? `${label}: ${date}. ${note}` : `${label}: ${date}.`;
}

function showStep(step: Step, mode: "push" | "replace" | "hash"): void {
  current = step;
  document.body.dataset.step = step;
  const legal = document.querySelector("details.legal");
  if (legal instanceof HTMLDetailsElement) legal.open = false;
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
  next.setAttribute("aria-label", continueAria(step));
  next.classList.add("secondary");
  syncContinue();
  const heading = document.querySelector<HTMLElement>(`section.step[data-step="${step}"] h2`);
  if (step === "pages") input("zip").focus({ preventScroll: true });
  else heading?.focus({ preventScroll: true });
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
  const digits = zip.replace(/\D/g, "");
  const result = lookupZip(zip);
  const status = $("zip-status");
  const selection = stateForZip(
    { code: currentState(), origin: stateSelectionOrigin },
    result,
  );
  stateSelectionOrigin = selection.origin;
  if (currentState() !== selection.code) select("state").value = selection.code;
  setOfficialLinks(selection.code);

  if (!digits) {
    status.textContent = "";
    syncContinue();
    return;
  }
  if (result.kind === "state") {
    const row = programForState(result.state);
    const shown = programForState(currentState());
    if (stateSelectionOrigin === "manual" && currentState() !== result.state && shown) {
      status.textContent = row
        ? `ZIP maps to ${row.name}. You picked ${shown.name}. The official page below is for ${shown.name}.`
        : `That ZIP maps to ${result.state}. The official page below is for the state you picked.`;
    } else {
      status.textContent = row
        ? row.snapLinkKind === "application"
          ? `ZIP ${digits.slice(0, 5)} is ${row.name}. The navy button opens the official SNAP application.`
          : row.snapOnline
            ? `ZIP ${digits.slice(0, 5)} is ${row.name}. The navy button opens the official SNAP start page.`
            : `ZIP ${digits.slice(0, 5)} is ${row.name}. The navy button has official SNAP information. Call 2-1-1 if you need a local office.`
        : `That ZIP maps to ${result.state}.`;
    }
    syncContinue();
    return;
  }
  const shown = programForState(currentState());
  status.textContent = shown
    ? `${result.reason} The official page below is for ${shown.name}.`
    : result.reason;
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
  persist(false);
}

function onReminderSave(): void {
  const date = input("interview-date").value;
  if (!date) {
    $("reminder-status").textContent =
      "No date yet. Watch the mail. Call the number on the notice.";
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
    $("reminder-status").textContent =
      "No date yet. Watch the mail. Call the number on the notice.";
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
  select("state").value = "";
  stateSelectionOrigin = "none";
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
    const matchesZip = saved.state === currentState();
    const origin = saved.stateOrigin;
    if (origin !== "none" || !matchesZip) {
      select("state").value = saved.state;
      stateSelectionOrigin = origin === "none" ? "manual" : origin;
    }
    onZip();
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
  const cleared = clearProgress();
  input("zip").value = "";
  select("state").value = "";
  stateSelectionOrigin = "none";
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
  $("reminder-status").textContent = "";
  setOfficialLinks("");
  renderPacket(null, []);
  setPacketInterviewLine();
  showStep("pages", "replace");
  flashReset(cleared);
}

function removeReminder(): void {
  input("interview-date").value = "";
  input("interview-note").value = "";
  setPacketInterviewLine();
  const ok = persist(true);
  $("reminder-status").textContent = ok
    ? "Date and note removed from this device."
    : "This browser blocked saving. The date is cleared on this screen, but an earlier saved copy may remain.";
}

function eraseAsk(): HTMLElement {
  return $("erase-ask");
}

function closeEraseAsk(): void {
  eraseAsk().hidden = true;
  $("clear-device").focus({ preventScroll: true });
}

function openEraseAsk(): void {
  const legal = document.querySelector("details.legal");
  if (legal instanceof HTMLDetailsElement) legal.open = false;
  eraseAsk().hidden = false;
  $("erase-keep").focus({ preventScroll: true });
}

function onEraseKey(event: KeyboardEvent): void {
  if (eraseAsk().hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeEraseAsk();
    return;
  }
  if (event.key !== "Tab") return;

  const first = $("erase-keep") as HTMLButtonElement;
  const last = $("erase-yes") as HTMLButtonElement;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
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
($("fns-fallback") as HTMLAnchorElement).href = FNS_DIRECTORY;
$("zip").addEventListener("change", onZip);
$("zip").addEventListener("blur", onZip);
$("zip").addEventListener("input", () => {
  onZip();
  schedulePersist();
});
$("state").addEventListener("change", () => {
  stateSelectionOrigin = currentState() ? "manual" : "none";
  onZip();
  schedulePersist();
});
$("see-result").addEventListener("click", onScreen);
$("screen-form").addEventListener("submit", (event) => {
  event.preventDefault();
});
$("save-reminder").addEventListener("click", onReminderSave);
$("download-ics").addEventListener("click", onReminderDownload);
$("remove-reminder").addEventListener("click", removeReminder);
$("print-packet").addEventListener("click", () => {
  window.print();
});
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
    $("zip-status").textContent = "Pick a state or type a ZIP first. Then open the official SNAP page.";
    return;
  }
  select("reminder-kind").value = "recert";
  setPacketInterviewLine();
  persist(false);
  const row = programForState(currentState());
  $("zip-status").textContent = row
    ? `Already get SNAP in ${row.name}? Open that official page to renew. Save a date after the notice comes.`
    : "Open the official SNAP page to renew. Save a date after the notice comes.";
  showStep("pages", "replace");
});
$("legal-close").addEventListener("click", () => {
  const legal = document.querySelector("details.legal");
  if (legal instanceof HTMLDetailsElement) legal.open = false;
});
$("clear-device").addEventListener("click", openEraseAsk);
$("erase-keep").addEventListener("click", closeEraseAsk);
$("erase-yes").addEventListener("click", () => {
  closeEraseAsk();
  resetDevice();
});
document.addEventListener("keydown", onEraseKey);
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
$("now-energy").textContent = energySeasonShort(monthNow);
$("packet-season").textContent = packetSeasonLine(monthNow);
$("screen-rules-note").textContent = snapScreenRulesNote();

function syncViewport(): void {
  const viewport = window.visualViewport;
  const height = viewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty("--vvh", `${Math.round(height)}px`);
}
syncViewport();
window.visualViewport?.addEventListener("resize", syncViewport);
window.addEventListener("resize", syncViewport);

if (import.meta.env.PROD) {
  void import("./pwa").then(({ startPwa }) => {
    const reloadForUpdate = startPwa({
      onOfflineReady: () => {
        if (saveFailed) return;
        const banner = $("ready-banner");
        banner.hidden = false;
        window.setTimeout(() => {
          if (!saveFailed) banner.hidden = true;
        }, 5000);
      },
      onUpdated: () => {
        const banner = $("update-banner");
        banner.hidden = false;
      },
    });
    $("reload-update").addEventListener("click", () => {
      if (!reloadForUpdate) return;
      reloadForUpdate();
    });
  });
}
