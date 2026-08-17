import { describe, expect, it } from "vitest";
import { DISCLAIMER } from "../src/copy";
import { PROGRAMS } from "../src/data/programs";
import { lookupZip } from "../src/zip";
import { screenOlderAdult } from "../src/screen";
import { packetItems } from "../src/packet";
import { icsForReminder } from "../src/reminder";

describe("disclaimer freeze", () => {
  it("is unofficial and never says eligible", () => {
    expect(DISCLAIMER).toMatch(/not a government website/i);
    expect(DISCLAIMER.toLowerCase()).not.toMatch(/\beligible\b|\bineligible\b/);
  });
});

describe("programs freeze", () => {
  it("has 51 jurisdictions with apply URLs", () => {
    expect(PROGRAMS).toHaveLength(51);
    const codes = PROGRAMS.map((row) => row.code);
    expect(new Set(codes).size).toBe(51);
    for (const row of PROGRAMS) {
      expect(row.snapApplyUrl.startsWith("http")).toBe(true);
      expect(row.liheapUrl.startsWith("http")).toBe(true);
    }
  });
});

describe("lookupZip", () => {
  it("maps the freeze fixtures", () => {
    expect(lookupZip("20001")).toEqual({ kind: "state", state: "DC" });
    expect(lookupZip("10001")).toEqual({ kind: "state", state: "NY" });
    expect(lookupZip("90210")).toEqual({ kind: "state", state: "CA" });
    expect(lookupZip("99501")).toEqual({ kind: "state", state: "AK" });
    expect(lookupZip("96813")).toEqual({ kind: "state", state: "HI" });
    expect(lookupZip("82001")).toEqual({ kind: "state", state: "WY" });
    expect(lookupZip("00501")).toEqual({ kind: "state", state: "NY" });
    expect(lookupZip("19901")).toEqual({ kind: "state", state: "DE" });
    expect(lookupZip("02108")).toEqual({ kind: "state", state: "MA" });
    expect(lookupZip("33132")).toEqual({ kind: "state", state: "FL" });
    expect(lookupZip("60601")).toEqual({ kind: "state", state: "IL" });
    expect(lookupZip("75201")).toEqual({ kind: "state", state: "TX" });
    expect(lookupZip("98101")).toEqual({ kind: "state", state: "WA" });
    expect(lookupZip("85004")).toEqual({ kind: "state", state: "AZ" });
    expect(lookupZip("19103")).toEqual({ kind: "state", state: "PA" });
    expect(lookupZip("04101")).toEqual({ kind: "state", state: "ME" });
    expect(lookupZip("30303")).toEqual({ kind: "state", state: "GA" });
    expect(lookupZip("42223")).toEqual({ kind: "state", state: "KY" });
  });

  it("rejects invalid and out-of-scope ZIPs", () => {
    expect(lookupZip("00000").kind).toBe("invalid");
    expect(lookupZip("123").kind).toBe("invalid");
    expect(lookupZip("00601").kind).toBe("out_of_scope");
    expect(lookupZip("96799").kind).toBe("out_of_scope");
  });
});

describe("screenOlderAdult", () => {
  it("never returns eligible or ineligible tokens", () => {
    const samples = [
      screenOlderAdult({
        age: 72,
        householdSize: 1,
        state: "PA",
        grossMonthlyIncome: 900,
        countableResources: 200,
        highShelterOrMedical: false,
      }),
      screenOlderAdult({
        age: 45,
        householdSize: 1,
        state: "PA",
        grossMonthlyIncome: 900,
        countableResources: null,
        highShelterOrMedical: false,
      }),
      screenOlderAdult({
        age: 70,
        householdSize: 1,
        state: "PA",
        grossMonthlyIncome: 8000,
        countableResources: 80000,
        highShelterOrMedical: false,
      }),
    ];
    for (const out of samples) {
      expect(["likely_worth_applying", "maybe", "probably_not"]).toContain(out.result);
      expect(out.body.toLowerCase()).not.toMatch(/\beligible\b|\bineligible\b/);
      expect(out.headline.toLowerCase()).not.toMatch(/\beligible\b|\bineligible\b/);
    }
  });

  it("flags low income as likely worth applying", () => {
    const out = screenOlderAdult({
      age: 68,
      householdSize: 1,
      state: "OH",
      grossMonthlyIncome: 1100,
      countableResources: 500,
      highShelterOrMedical: false,
    });
    expect(out.result).toBe("likely_worth_applying");
  });

  it("does not call high resources likely", () => {
    const out = screenOlderAdult({
      age: 68,
      householdSize: 1,
      state: "OH",
      grossMonthlyIncome: 1100,
      countableResources: 80000,
      highShelterOrMedical: false,
    });
    expect(out.result).toBe("maybe");
  });

  it("treats under 60 and the $4501 resource edge as maybe", () => {
    expect(
      screenOlderAdult({
        age: 59,
        householdSize: 1,
        state: "OH",
        grossMonthlyIncome: 900,
        countableResources: 200,
        highShelterOrMedical: false,
      }).result,
    ).toBe("maybe");
    expect(
      screenOlderAdult({
        age: 68,
        householdSize: 1,
        state: "OH",
        grossMonthlyIncome: 1100,
        countableResources: 4501,
        highShelterOrMedical: false,
      }).result,
    ).toBe("maybe");
  });

  it("keeps 165 percent income with high resources at maybe", () => {
    const out = screenOlderAdult({
      age: 68,
      householdSize: 1,
      state: "OH",
      grossMonthlyIncome: 2000,
      countableResources: 80000,
      highShelterOrMedical: false,
    });
    expect(out.result).toBe("maybe");
  });
});

describe("packet and reminder", () => {
  it("adds medical proof for age 60+", () => {
    const young = packetItems({ age60Plus: false }).map((item) => item.id);
    const older = packetItems({ age60Plus: true }).map((item) => item.id);
    expect(young).not.toContain("medical");
    expect(older).toContain("medical");
  });

  it("builds an ICS event", () => {
    const ics = icsForReminder({ date: "2026-09-01", note: "Call the county" });
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260901");
    expect(ics).toContain("Call the county");
  });
});
