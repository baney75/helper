export const VIEWS = ["pages", "screen", "packet", "interview"] as const;

export type Step = (typeof VIEWS)[number];

const FLOW = ["pages", "packet", "interview"] as const;

export function isStep(value: string): value is Step {
  return (VIEWS as readonly string[]).includes(value);
}

export function parseStep(hash: string): Step {
  const raw = hash.replace(/^#/, "");
  return isStep(raw) ? raw : "pages";
}

function flowIndex(step: Step): number {
  if (step === "screen") return 0;
  return FLOW.indexOf(step);
}

export function prevStep(step: Step): Step | null {
  if (step === "screen") return "pages";
  const index = flowIndex(step);
  if (index <= 0) return null;
  return FLOW[index - 1] ?? null;
}

export function nextStep(step: Step): Step | null {
  if (step === "screen") return "packet";
  const index = flowIndex(step);
  if (index < 0 || index >= FLOW.length - 1) return null;
  return FLOW[index + 1] ?? null;
}

export function stepLabel(step: Step): string {
  if (step === "screen") return "Optional screen";
  if (step === "pages") return "1 of 3 · Food help";
  if (step === "packet") return "2 of 3 · Papers";
  return "3 of 3 · Dates";
}

export function persistableStep(step: Step): Step {
  return step === "screen" ? "pages" : step;
}

export function hashStep(hash: string): Step | null {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;
  return isStep(raw) ? raw : null;
}

export function continueLabel(step: Step): string {
  const upcoming = nextStep(step);
  if (!upcoming) return "Print";
  if (upcoming === "packet") return "Papers";
  return "Dates";
}

export function continueAria(step: Step): string {
  const upcoming = nextStep(step);
  if (!upcoming) return "Print this packet";
  if (upcoming === "packet") return "Continue to papers";
  return "Continue to dates";
}
