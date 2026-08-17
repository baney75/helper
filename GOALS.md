# Team goals

Product: a static GitHub Pages helper that helps older adults apply for SNAP and LIHEAP and keep the interview. Unofficial. No accounts. No server. MIT. Repo: `baney75/helper`.

Done means a named artifact plus a check another person can rerun. Research finishes before frontend, backend, or production write product code.

## Research team

Must finish first. Freeze facts in `research/freeze.json` and `research/SOURCES.md`.

| ID | Goal | Done when | Check |
|----|------|-----------|-------|
| R1 | Official SNAP apply or portal URL for all 50 states + DC | 51 rows with `state`, `name`, `snapApplyUrl`, `retrieved` | Spot-fetch 8 URLs return HTTP 200 or an official redirect |
| R2 | Official LIHEAP apply or local-office finder URL for all 50 states + DC | 51 rows with `liheapApplyUrl` or `liheapOfficeUrl` | Same 8-state spot-fetch |
| R3 | ZIP → state mapping method that works offline | Documented method + dataset or generator | 20 known ZIPs map correctly, including DC and a PO box ZIP |
| R4 | Older-adult SNAP screen that never claims eligibility | Written rules + FY2026 (or latest) FPL table + resource notes + "unknown" path | Every output is `likely_worth_applying`, `maybe`, or `probably_not`, never eligible/ineligible |
| R5 | SNAP interview document list (generic, not legal advice) | Checklist with source for each item | No state-specific legal claims |
| R6 | Legal copy freeze | Disclaimer, privacy, "not a determination," "not legal advice" | Counsel-level review: no unauthorized practice, no false official branding |
| R7 | Older-adult UI constraints | Type size, contrast, no-account, print, phone, JS-failure | Maps to WCAG 2.2 AA targets we will actually hit |

Out of scope for research: eviction legal advice, HeatRisk module, submitting applications, storing PII on a server.

## Frontend team

Starts after research freeze is reviewed.

| ID | Goal | Done when | Check |
|----|------|-----------|-------|
| F1 | One-page flow: ZIP or state → programs → screen → packet → reminder | User can finish without an account | Manual path + Playwright or equivalent |
| F2 | Large type, high contrast, 44px targets, visible focus | CSS tokens + skip link + labels | axe or equivalent, 375 and 1280 screenshots |
| F3 | Printable packet | Print CSS produces a one-to-two page checklist | Print preview screenshot |
| F4 | Official links open in a new tab and are labeled official | Every apply button uses freeze URLs | Link audit against `research/freeze.json` |
| F5 | Reminder stays on this device | localStorage or ICS download | Refresh keeps the date; no network write of PII |
| F6 | Works if JS fails enough to show the disclaimer and a state list | `noscript` or server-rendered static fallback | Disable JS, still see official links by state |

## Backend team

Starts after research freeze is reviewed. "Backend" here is the client-side engine and data, because GitHub Pages has no server.

| ID | Goal | Done when | Check |
|----|------|-----------|-------|
| B1 | Typed program directory from the freeze | `src/data/programs.ts` generated or copied from freeze | Typecheck + 51 states |
| B2 | ZIP → state | Pure function + tests | 20 fixtures pass |
| B3 | Screen function | Pure function, never returns eligible/ineligible | Unit tests for under 60, high income, missing fields, older adult low income |
| B4 | Packet builder | Checklist filtered by answers | Snapshot or unit tests |
| B5 | Reminder model | Date in, ICS out + storage helpers | Unit tests; ICS validates |
| B6 | No PII leaves the browser | No fetch of user answers | Grep: no analytics, no form POST |

## Production team

Starts after frontend + backend review.

| ID | Goal | Done when | Check |
|----|------|-----------|-------|
| P1 | MIT license | `LICENSE` | File present |
| P2 | Public repo `baney75/helper` | `gh repo view baney75/helper` | Owner is baney75 |
| P3 | GitHub Pages live | Pages URL returns the app | `curl` the Pages URL |
| P4 | CI: test + typecheck on push | Workflow green | `gh run list` |
| P5 | README a person would actually read | Install, use, limits, sources, BMC | Humanizer pass; no em dashes; coffee link exact |
| P6 | Security hygiene | No secrets, dependabot or lockfile | `gh secret` unused; no API keys |

Buy Me a Coffee: `https://buymeacoffee.com/baneydonovan`

## Review rule

When a team says a goal is done, a separate adversarial reviewer reads the artifacts and the diff. That reviewer does not implement. Verdict is `SHIP` or `BLOCK`. BLOCK with any BLOCKER or MAJOR. Parent re-runs the named check before accepting SHIP.
