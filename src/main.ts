import { ENERGYHELP, FNS_DIRECTORY, NEAR_PHONE, PROGRAMS, programForState } from "./data/programs";
import { packetItems } from "./packet";
import { icsForReminder, loadReminder, saveReminder } from "./reminder";
import { screenOlderAdult } from "./screen";
import { lookupZip } from "./zip";

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
}

function fillStateSelect(): void {
  const select = $("state") as HTMLSelectElement;
  for (const row of PROGRAMS) {
    const opt = document.createElement("option");
    opt.value = row.code;
    opt.textContent = `${row.name} (${row.code})`;
    select.append(opt);
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
    bindOfficial(liheap, ENERGYHELP, "Official energy help search");
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
  return ($("state") as HTMLSelectElement).value;
}

function numberOrNull(id: string): number | null {
  const raw = ($("" + id) as HTMLInputElement).value.trim();
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function renderPacket(age: number | null): void {
  const list = $("packet-list");
  list.replaceChildren();
  for (const item of packetItems({ age60Plus: age !== null && age >= 60 })) {
    const li = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const detail = document.createElement("p");
    detail.textContent = item.detail;
    li.append(title, detail);
    list.append(li);
  }
}

function onZip(): void {
  const zip = ($("zip") as HTMLInputElement).value;
  const result = lookupZip(zip);
  const status = $("zip-status");
  if (result.kind === "state") {
    ($("state") as HTMLSelectElement).value = result.state;
    status.textContent = `That ZIP maps to ${result.state}. If you live in another state, pick it below.`;
    setOfficialLinks(result.state);
    return;
  }
  status.textContent = result.reason;
}

function onScreen(): void {
  const age = numberOrNull("age");
  const out = screenOlderAdult({
    age,
    householdSize: numberOrNull("household"),
    state: currentState(),
    grossMonthlyIncome: numberOrNull("income"),
    countableResources: numberOrNull("resources"),
    highShelterOrMedical: ($("shelter") as HTMLInputElement).checked,
  });
  $("screen-headline").textContent = out.headline;
  $("screen-body").textContent = out.body;
  renderPacket(age);
}

function onReminderSave(): void {
  const date = ($("interview-date") as HTMLInputElement).value;
  const note = ($("interview-note") as HTMLInputElement).value;
  if (!date) {
    $("reminder-status").textContent = "Pick a date first.";
    return;
  }
  saveReminder({ date, note });
  $("reminder-status").textContent = "Saved on this device.";
}

function onReminderDownload(): void {
  const date = ($("interview-date") as HTMLInputElement).value;
  const note = ($("interview-note") as HTMLInputElement).value;
  if (!date) {
    $("reminder-status").textContent = "Pick a date first.";
    return;
  }
  const blob = new Blob([icsForReminder({ date, note })], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "snap-interview.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function restoreReminder(): void {
  const saved = loadReminder();
  if (!saved) return;
  ($("interview-date") as HTMLInputElement).value = saved.date;
  ($("interview-note") as HTMLInputElement).value = saved.note;
  $("reminder-status").textContent = "Loaded the date saved on this device.";
}

fillStateSelect();
($("energyhelp") as HTMLAnchorElement).href = ENERGYHELP;
($("fns-directory") as HTMLAnchorElement).href = FNS_DIRECTORY;
$("zip").addEventListener("change", onZip);
$("zip").addEventListener("blur", onZip);
$("state").addEventListener("change", () => setOfficialLinks(currentState()));
$("see-result").addEventListener("click", onScreen);
$("screen-form").addEventListener("submit", (event) => {
  event.preventDefault();
});
$("save-reminder").addEventListener("click", onReminderSave);
$("download-ics").addEventListener("click", onReminderDownload);
$("print-packet").addEventListener("click", () => window.print());
restoreReminder();
renderPacket(null);
