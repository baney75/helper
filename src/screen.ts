import {
  ELDERLY_RESOURCE_CAP,
  hasCurrentSnapScreenRules,
  regionForState,
  snapMonthlyLimits,
} from "./data/fpl";

export type ScreenResult = "likely_worth_applying" | "maybe";

export type ScreenInput = {
  age: number | null;
  householdSize: number | null;
  state: string;
  grossMonthlyIncome: number | null;
  countableResources: number | null;
  highShelterOrMedical: boolean;
};

export type ScreenOutput = {
  result: ScreenResult;
  headline: string;
  body: string;
};

const COPY: Record<ScreenResult, { headline: string; body: string }> = {
  likely_worth_applying: {
    headline: "It is likely worth applying.",
    body: "Your gross income is within a conservative federal reference point. SNAP households with an older or disabled person use a net income test after allowed deductions. This is not a decision that you qualify. Only your state SNAP office can decide.",
  },
  maybe: {
    headline: "An application is the only official way to find out.",
    body: "Deductions, state rules, and categorical eligibility can change the result. This helper cannot see your full case. This is not a decision that you qualify or do not qualify.",
  },
};

export function screenOlderAdult(input: ScreenInput, now = new Date()): ScreenOutput {
  const copy = (result: ScreenResult): ScreenOutput => ({
    result,
    ...COPY[result],
  });

  if (!hasCurrentSnapScreenRules(now)) {
    return {
      result: "maybe",
      headline: "Use the official SNAP page for current rules.",
      body: "This optional income screen is paused because its FY2026 source ended September 30, 2026. Only the state SNAP office can decide your case.",
    };
  }

  if (input.age === null || Number.isNaN(input.age)) {
    return copy("maybe");
  }
  if (input.age < 60) {
    return {
      result: "maybe",
      headline: "This screen is written for people 60 and older.",
      body: "You can still apply. Federal SNAP has different income tests for younger households. This is not a decision that you qualify or do not qualify.",
    };
  }

  const size = input.householdSize && input.householdSize >= 1 ? input.householdSize : 1;
  const limits = snapMonthlyLimits(regionForState(input.state), size);

  if (input.grossMonthlyIncome === null) {
    return copy("maybe");
  }

  const income = input.grossMonthlyIncome;
  const overResourceCap =
    input.countableResources !== null && input.countableResources > ELDERLY_RESOURCE_CAP;

  // This is intentionally one-sided: a low gross figure can encourage an application,
  // but gross income alone cannot estimate an older household's net income after deductions.
  if (!overResourceCap && income <= limits.gross130) {
    return copy("likely_worth_applying");
  }
  return copy("maybe");
}
