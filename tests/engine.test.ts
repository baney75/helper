import { describe, expect, it } from "vitest";
import html from "../index.html?raw";
import css from "../src/styles.css?raw";
import mainSrc from "../src/main.ts?raw";
import { DISCLAIMER } from "../src/copy";
import { PROGRAMS } from "../src/data/programs";
import { lookupZip } from "../src/zip";
import { screenOlderAdult } from "../src/screen";
import { packetItems } from "../src/packet";
import { continueLabel, hashStep, nextStep, parseStep, persistableStep, prevStep, stepLabel } from "../src/steps";
import { icsFilename, icsForReminder } from "../src/reminder";
import { energySeason, energySeasonCopy, SNAP_YEAR_ROUND } from "../src/season";
import { parseProgress, saveProgress, loadProgress, clearProgress, PROGRESS_KEY, EMPTY_PROGRESS } from "../src/progress";

describe("disclaimer freeze", () => {
  it("is unofficial and never says eligible", () => {
    expect(DISCLAIMER).toMatch(/not a government website/i);
    expect(DISCLAIMER.toLowerCase()).not.toMatch(/\beligible\b|\bineligible\b/);
  });
});

describe("page hooks", () => {
  it("keeps the script targets, noscript path, and coffee link", () => {
    expect(html).toContain('id="packet-list"');
    expect(html).toContain('id="see-result"');
    expect(html).toContain('type="button"');
    expect(html).toContain("https://buymeacoffee.com/baneydonovan");
    expect(html).toContain("<noscript>");
    expect(html).toContain('id="see-result"');
    expect(html).toContain('id="step-back"');
    expect(html).toContain('id="step-next"');
    expect(html).toContain('id="skip-screen"');
    expect(html).toContain('id="open-screen"');
    expect(html).not.toContain('id="scroll-down"');
    expect(html).toContain("Your ZIP");
    expect(html).toContain("legal-scroll");
    expect(html).toContain("1 of 3");
    expect(html).not.toContain('name="age"');
    expect(html).not.toContain('name="income"');
    expect(html).toContain("open all year");
    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain("form-action 'none'");
    expect(html).not.toContain("onsubmit=");
    expect(html).not.toMatch(/<button[^>]*type="submit"/);
    expect(html.toLowerCase()).not.toMatch(/\beligible\b|\bineligible\b/);
    expect(html).not.toMatch(/It does\s*\n\s+not file/);
    expect(css).not.toMatch(/pre-wrap/);
    expect(html).toContain('id="erase-ask"');
    expect(html).toContain('id="erase-keep"');
    expect(mainSrc).not.toMatch(/window\.confirm/);
    expect(mainSrc).not.toMatch(/sendBeacon|XMLHttpRequest|gtag|analytics/i);
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
    expect(icsForReminder({ date: "2026-09-01", note: "", kind: "recert" })).toContain(
      "SNAP recertification reminder",
    );
    expect(icsFilename("recert")).toBe("snap-recert.ics");
  });
});

describe("steps", () => {
  it("parses hashes and walks back and continue", () => {
    expect(parseStep("#packet")).toBe("packet");
    expect(parseStep("interview")).toBe("interview");
    expect(parseStep("#nope")).toBe("pages");
    expect(prevStep("pages")).toBeNull();
    expect(nextStep("pages")).toBe("packet");
    expect(nextStep("screen")).toBe("packet");
    expect(nextStep("interview")).toBeNull();
    expect(prevStep("packet")).toBe("pages");
    expect(prevStep("interview")).toBe("packet");
    expect(stepLabel("screen")).toBe("Optional screen");
    expect(stepLabel("pages")).toBe("1 of 3 · Food help");
    expect(persistableStep("screen")).toBe("pages");
    expect(hashStep("#packet")).toBe("packet");
    expect(hashStep("#nope")).toBeNull();
    expect(hashStep("")).toBeNull();
    expect(continueLabel("pages")).toBe("Papers");
    expect(continueLabel("packet")).toBe("Dates");
    expect(continueLabel("interview")).toBe("Print");
  });
});

describe("progress", () => {
  it("roundtrips answers and ignores junk", () => {
    const store = new Map<string, string>();
    const fake = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };
    const ok = saveProgress(
      {
        v: 1,
        step: "packet",
        zip: "19103",
        state: "PA",
        age: "72",
        household: "1",
        income: "900",
        resources: "200",
        shelter: true,
        checked: ["id", "rent"],
        interviewDate: "2026-09-01",
        interviewNote: "Call the county",
        reminderKind: "recert",
        screenHeadline: "Worth applying",
        screenBody: "Unofficial.",
      },
      fake,
    );
    expect(ok).toBe(true);
    expect(loadProgress(fake)?.zip).toBe("19103");
    expect(loadProgress(fake)?.checked).toEqual(["id", "rent"]);
    expect(loadProgress(fake)?.reminderKind).toBe("recert");
    expect(
      saveProgress(EMPTY_PROGRESS, {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
        removeItem: () => undefined,
      }),
    ).toBe(false);
    expect(parseProgress('{"step":"nope","zip":12}')?.step).toBe("pages");
    clearProgress(fake);
    expect(store.has(PROGRESS_KEY)).toBe(false);
  });

  it("migrates the old interview reminder key", () => {
    const store = new Map<string, string>();
    const fake = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };
    store.set("helper-interview-reminder", JSON.stringify({ date: "2026-10-02", note: "Phone" }));
    const saved = loadProgress(fake);
    expect(saved?.interviewDate).toBe("2026-10-02");
    expect(saved?.interviewNote).toBe("Phone");
  });
});

describe("season", () => {
  it("keeps SNAP year-round and shifts energy copy", () => {
    expect(SNAP_YEAR_ROUND).toMatch(/all year/);
    expect(energySeason(8)).toBe("cooling");
    expect(energySeason(1)).toBe("heating");
    expect(energySeason(5)).toBe("shoulder");
    expect(energySeasonCopy(8).toLowerCase()).toMatch(/cooling|crisis/);
    expect(energySeasonCopy(8).toLowerCase()).not.toMatch(/\beligible\b/);
    expect(energySeasonCopy(1).toLowerCase()).toMatch(/heating/);
  });
});
