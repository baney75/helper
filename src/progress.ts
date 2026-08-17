import { isStep, type Step } from "./steps";
import { isReminderKind, type ReminderKind } from "./reminder";

export const PROGRESS_KEY = "helper-progress-v1";
const LEGACY_REMINDER_KEY = "helper-interview-reminder";

export type Progress = {
  v: 1;
  step: Step;
  zip: string;
  state: string;
  age: string;
  household: string;
  income: string;
  resources: string;
  shelter: boolean;
  checked: string[];
  interviewDate: string;
  interviewNote: string;
  reminderKind: ReminderKind;
  screenHeadline: string;
  screenBody: string;
};

export const EMPTY_PROGRESS: Progress = {
  v: 1,
  step: "pages",
  zip: "",
  state: "",
  age: "",
  household: "",
  income: "",
  resources: "",
  shelter: false,
  checked: [],
  interviewDate: "",
  interviewNote: "",
  reminderKind: "interview",
  screenHeadline: "",
  screenBody: "",
};

export type ProgressStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function storage(): ProgressStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseProgress(raw: string): Progress | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const row = parsed as Record<string, unknown>;
    const step = asString(row.step);
    const checked = Array.isArray(row.checked)
      ? row.checked.filter((id): id is string => typeof id === "string")
      : [];
    const kindRaw = asString(row.reminderKind);
    return {
      v: 1,
      step: isStep(step) ? step : "pages",
      zip: asString(row.zip),
      state: asString(row.state),
      age: asString(row.age),
      household: asString(row.household),
      income: asString(row.income),
      resources: asString(row.resources),
      shelter: row.shelter === true,
      checked,
      interviewDate: asString(row.interviewDate),
      interviewNote: asString(row.interviewNote),
      reminderKind: isReminderKind(kindRaw) ? kindRaw : "interview",
      screenHeadline: asString(row.screenHeadline),
      screenBody: asString(row.screenBody),
    };
  } catch {
    return null;
  }
}

export function saveProgress(progress: Progress, store = storage()): boolean {
  if (!store) return false;
  try {
    store.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function loadProgress(store = storage()): Progress | null {
  if (!store) return null;
  const raw = store.getItem(PROGRESS_KEY);
  if (raw) return parseProgress(raw);
  const legacy = store.getItem(LEGACY_REMINDER_KEY);
  if (!legacy) return null;
  try {
    const parsed: unknown = JSON.parse(legacy);
    if (typeof parsed !== "object" || parsed === null) return null;
    const row = parsed as Record<string, unknown>;
    return {
      ...EMPTY_PROGRESS,
      interviewDate: asString(row.date),
      interviewNote: asString(row.note),
    };
  } catch {
    return null;
  }
}

export function clearProgress(store = storage()): void {
  try {
    store?.removeItem(PROGRESS_KEY);
    store?.removeItem(LEGACY_REMINDER_KEY);
  } catch {
    return;
  }
}
