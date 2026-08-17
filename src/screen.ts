import {
  ELDERLY_RESOURCE_CAP,
  regionForState,
  snapMonthlyLimits,
} from "./data/fpl";

export type ScreenResult = "likely_worth_applying" | "maybe" | "probably_not";

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
    body: "Federal SNAP rules for people 60 and older use a net income test and count some medical and housing costs. This is not a decision that you qualify. Only your state SNAP office can decide. Apply anyway if you want an official answer.",
  },
  maybe: {
    headline: "An application is the only official way to find out.",
    body: "Deductions, state rules, and categorical eligibility can change the result. This helper cannot see your full case. This is not a decision that you qualify or do not qualify.",
  },
  probably_not: {
    headline: "A SNAP benefit looks less likely from these numbers.",
    body: "That is not a denial. State rules, medical costs, housing costs, and categorical eligibility can still change the result. Applying is the only official determination.",
  },
};

export function screenOlderAdult(input: ScreenInput): ScreenOutput {
  const copy = (result: ScreenResult): ScreenOutput => ({
    result,
    ...COPY[result],
  });

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
  const maybeCeiling = limits.net100 * 2;
  const overResourceCap =
    input.countableResources !== null && input.countableResources > ELDERLY_RESOURCE_CAP;

  if (overResourceCap && income <= limits.separate165) {
    return copy("maybe");
  }

  if (income <= limits.net100) {
    return copy("likely_worth_applying");
  }
  if (income <= limits.gross130) {
    return copy("likely_worth_applying");
  }
  if (income <= limits.separate165) {
    return copy("likely_worth_applying");
  }
  if (input.highShelterOrMedical && income <= maybeCeiling) {
    return copy("maybe");
  }
  if (income <= maybeCeiling) {
    return copy("maybe");
  }
  if (
    input.countableResources !== null &&
    input.countableResources > ELDERLY_RESOURCE_CAP &&
    !input.highShelterOrMedical
  ) {
    return copy("probably_not");
  }
  return copy("probably_not");
}
