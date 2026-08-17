export type ReminderKind = "interview" | "recert" | "energy";

export type Reminder = {
  date: string;
  note: string;
  kind?: ReminderKind;
};

export function isReminderKind(value: string): value is ReminderKind {
  return value === "interview" || value === "recert" || value === "energy";
}

export function reminderSummary(kind: ReminderKind): string {
  if (kind === "recert") return "SNAP recertification reminder";
  if (kind === "energy") return "Energy-help appointment reminder";
  return "SNAP interview reminder";
}

export function icsFilename(kind: ReminderKind): string {
  if (kind === "recert") return "snap-recert.ics";
  if (kind === "energy") return "energy-help.ics";
  return "snap-interview.ics";
}

export function icsForReminder(reminder: Reminder): string {
  const day = reminder.date.replaceAll("-", "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const kind = reminder.kind && isReminderKind(reminder.kind) ? reminder.kind : "interview";
  const desc = (reminder.note || reminderSummary(kind))
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
    `SUMMARY:${reminderSummary(kind)}`,
    `DESCRIPTION:${desc}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
