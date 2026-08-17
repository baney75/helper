export type EnergySeason = "heating" | "cooling" | "shoulder";

export function calendarMonth(at: Date): number {
  return at.getMonth() + 1;
}

export function energySeason(month: number): EnergySeason {
  if (month >= 10 || month <= 4) return "heating";
  if (month >= 6 && month <= 9) return "cooling";
  return "shoulder";
}

export const SNAP_YEAR_ROUND =
  "SNAP food help is open all year. You can apply in any month.";

export function energySeasonCopy(month: number): string {
  const season = energySeason(month);
  if (season === "heating") {
    return "This time of year, energy help is often heating. Programs open and close. Money can run out. If the page is closed, call 2-1-1 or 1-866-674-6327.";
  }
  if (season === "cooling") {
    return "This time of year, energy help is often cooling or a shutoff crisis, not winter heating. Heating programs usually open in the fall. Money can run out. If the page is closed, call 2-1-1 or 1-866-674-6327.";
  }
  return "Energy help is seasonal. Ask the official page whether cooling, crisis, or heating intake is open now. Money can run out. If the page is closed, call 2-1-1 or 1-866-674-6327.";
}

export function energyButtonFallback(month: number): string {
  const season = energySeason(month);
  if (season === "heating") return "Official heating or energy help";
  if (season === "cooling") return "Official cooling or crisis energy help";
  return "Official energy help search";
}

export function packetSeasonLine(month: number): string {
  return `${SNAP_YEAR_ROUND} ${energySeasonCopy(month)}`;
}
