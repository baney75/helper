import type { ZipLookup } from "./zip";

export type StateSelectionOrigin = "none" | "zip" | "manual";

export type StateSelection = {
  code: string;
  origin: StateSelectionOrigin;
};

export function isStateSelectionOrigin(value: string): value is StateSelectionOrigin {
  return value === "none" || value === "zip" || value === "manual";
}

/**
 * A ZIP is a convenience, not a commitment. Keep an explicit state selection,
 * but never leave a former ZIP match in place after that ZIP changes.
 */
export function stateForZip(
  selection: StateSelection,
  result: ZipLookup,
): StateSelection {
  if (result.kind === "state" && selection.origin !== "manual") {
    return { code: result.state, origin: "zip" };
  }
  if (result.kind !== "state" && selection.origin === "zip") {
    return { code: "", origin: "none" };
  }
  return selection;
}
