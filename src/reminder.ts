const KEY = "helper-interview-reminder";

export type Reminder = {
  date: string;
  note: string;
};

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveReminder(reminder: Reminder): void {
  try {
    storage()?.setItem(KEY, JSON.stringify(reminder));
  } catch {
    return;
  }
}

export function loadReminder(): Reminder | null {
  const raw = storage()?.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Reminder;
    if (typeof parsed.date !== "string") return null;
    return { date: parsed.date, note: typeof parsed.note === "string" ? parsed.note : "" };
  } catch {
    return null;
  }
}

export function icsForReminder(reminder: Reminder): string {
  const day = reminder.date.replaceAll("-", "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const desc = (reminder.note || "SNAP interview")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Stay Enrolled Helper//EN",
    "BEGIN:VEVENT",
    `UID:helper-${day}@baney75.github.io`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `SUMMARY:SNAP interview reminder`,
    `DESCRIPTION:${desc}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
