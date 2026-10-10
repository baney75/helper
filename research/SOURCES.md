# Sources

Initial directory retrieved 16–17 August 2026; targeted maintenance checks on 6 September 2026. Prefer these over vendor blogs.

## SNAP

- [FNS SNAP eligibility](https://www.fns.usda.gov/snap/recipient/eligibility) (FY2026: 1 Oct 2025–30 Sep 2026)
- [FNS Trends in USDA SNAP Participation Rates: FY2020 and FY2022](https://www.fns.usda.gov/research/snap/national-participation-rates/fy20and22) (source for the README's 88% overall and 55% elderly FY2022 comparison)
- [FNS elderly or disabled special rules](https://www.fns.usda.gov/snap/eligibility/elderly-disabled-special-rules)
- [FNS COLA / FY2026 income standards](https://www.fns.usda.gov/snap/allotment/COLA)
- [FNS FY 2027 Income Eligibility Standards](https://www.fns.usda.gov/sites/default/files/resource-files/snap-fy27-incomeEligibilityStandards.pdf) and [Maximum Allotments and Deductions](https://www.fns.usda.gov/sites/default/files/resource-files/snap-fy27maximumAllotments-deductions.pdf) (official tables; the FY2027 figures were checked against these)
- [USDA FNA memo, "SNAP - Fiscal Year 2027 Cost-of-Living Adjustments"](https://www.usda.gov/sites/default/files/guidance-documents/fna.snap-cola2027.pdf), dated 21 Aug 2026, effective 1 Oct 2026. Source of every FY2027 figure in `src/data/fpl.ts` (income eligibility standards on page 3, the $4,750 older-or-disabled asset limit on page 2). Retrieved 10 Oct 2026. See "FY2027 retrieval" below.
- [FNS state directory](https://www.fns.usda.gov/snap/state-directory)
- [FNS interview toolkit, regulatory basis](https://www.fns.usda.gov/snap/state/interview-toolkit/introduction/regulatory)
- [FNS Facts About SNAP](https://fns.usda.gov/snap/facts)
- 7 CFR 273.2 (application, interview, verification)

## Poverty guidelines (not SNAP COLA)

- [ASPE 2026 poverty guidelines](https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines)
- [Federal Register 91 FR 1797](https://www.govinfo.gov/content/pkg/FR-2026-01-15/html/2026-00755.htm) (effective 13 Jan 2026)

Do not mix HHS calendar-year FPL into SNAP FY2026 income tests. SNAP screens use FNS monthly COLA tables.

## LIHEAP

- [ACF LIHEAP fact sheet](https://acf.gov/ocs/fact-sheet/liheap-fact-sheet)
- [ACF LIHEAP program page](https://acf.gov/ocs/programs/liheap) (Energyhelp.us, NEAR 1-866-674-6327)
- [Energyhelp.us / Clearinghouse search](https://liheapch.acf.hhs.gov/search-tool) (state, territory, or tribe; no ZIP field)
- [ACF state and territory contacts](https://acf.gov/ocs/liheap-state-and-territory-contact-listing)

## Branding and practice limits

- [FNS SNAP logo guidance](https://www.fns.usda.gov/snap/logo-guidance)
- [USDA seal / logo](https://www.usda.gov/about-usda/policies-and-links/digital/usda-style-guide/logo)
- ABA Model Rule 5.5 (unauthorized practice of law)

## ZIP

- [USPS L002 ZIP prefix](https://postalpro.usps.com/node/2586)
- [USPS Fishers Island Post Office](https://tools.usps.com/locations/details/1434565) (confirms Fishers Island, NY 06390; exact exception to the otherwise Connecticut 063 prefix)
- [FNS NAP / Puerto Rico](https://www.fns.usda.gov/nap/pr/summary) (PR is NAP, not SNAP)

## Maintenance policy

- The optional income screen holds FNS monthly figures for FY2026 (to 30 Sep 2026) and FY2027 (1 Oct 2026 to 30 Sep 2027) and pauses on any date no table covers. Do not extend it past 30 Sep 2027 without adding the next table from the official FNS COLA memo and rechecking its copy. A weekly workflow (`.github/workflows/table-expiry.yml`) fails when the newest table ends within 30 days.
- The optional screen uses the 130% gross figure only as a conservative encouragement boundary. It returns a neutral result above that boundary because the collected gross income cannot estimate the net income of an older or disabled household after deductions. The FNS 165% table is not used: that figure applies to the income of other co-residents in a narrow separate-household provision, not the older applicant's gross-income limit.
- Recheck all state destinations at least each fiscal year and whenever a state page redirects, a seasonal program closes, or an official agency changes its application guidance. An HTTP success or redirect does not prove that a portal is accepting applications.

## Targeted check 6 Sep 2026

- Pennsylvania: [PA LIHEAP](https://www.pa.gov/agencies/dhs/resources/liheap) is the current canonical state route. It says the 2025–26 LIHEAP season is closed; the app labels it as information, not an open application.
- California: [CDSS CalFresh application guidance](https://www.cdss.ca.gov/calfresh/application) directs people to [BenefitsCal](https://www.benefitscal.com/) to apply. [California CSD LIHEAP](https://csd.ca.gov/Pages/LIHEAPProgram.aspx) says assistance is administered locally and availability can be limited.
- FNS notes that OBBB-related SNAP changes are still being incorporated. This reinforces the screen's fiscal-year cutoff; it is not evidence to infer a new numeric rule.

## Link maintenance 7 Sep 2026

A bounded transport audit covered both configured URLs for all 51 advertised jurisdictions. It found three confirmed 404 routes and three application routes that now return a 404 after redirect. Current official sources replaced them:

- Florida SNAP: [MyACCESS](https://myaccess.myflfamilies.com/) is the current DCF portal and accepts SNAP applications.
- Indiana energy help: [IHCDA Energy Assistance Program](https://www.in.gov/ihcda/homeowners-and-renters/low-income-home-energy-assistance-program-liheap/) is the current household page and says the 2025–26 season is closed until fall 2026.
- Maryland energy help: [Maryland Benefits](https://mydhr.benefits.maryland.gov/) includes Energy Assistance (OHEP) application and information routes.
- Ohio SNAP: current Ohio materials name Ohio Benefits, but both the former `/SNAP` path and portal root returned 404 during the check. Helper therefore uses the current [FNS Ohio directory entry](https://www.fns.usda.gov/snap-directory-entry/ohio) as an official information fallback instead of advertising a broken application link.
- Ohio energy help: [Ohio Consumers' Counsel HEAP](https://occ.ohio.gov/factsheet/home-energy-assistance-program-heap) is a current official state page with 2026–27 dates, online-application guidance, and local-provider fallback. The former portal currently redirects to a 404 page.
- Utah SNAP: [Utah Eligibility Services](https://jobs.utah.gov/eligibility/index.html) is the stable official start page and links to myCase; the former trailing-slash route returns 404.

The saved link-audit report distinguishes reachable routes from automation blocks, timeouts, and network errors. Those ambiguous results were not treated as broken without separate evidence.

## Design review references checked 6 Sep 2026

- [Webby judging criteria](https://www.webbyawards.com/judging-criteria/) — content, structure and navigation, visual design, functionality, interactivity, innovation, and the overall experience. For Helper, that means a complete official-link task, a clear three-step path, and no ornamental interaction that competes with the next action.
- [CSS Design Awards judging](https://www.cssdesignawards.com/judging/) — user interface, user experience, and innovation. Helper uses those as a quality lens, not an award claim: large controls, legible hierarchy, explicit state feedback, local-only persistence, offline recovery, and a printable handoff.
- [Awwwards evaluation system](https://www.awwwards.com/academy/course/understanding-the-awwwards-evaluation-system) and [Mobile Excellence guidelines](https://www.awwwards.com/mobile-excellence-award/) — design, usability, creativity, content, mobile usability, performance, and implementation. The current public criteria page was not available in a form suitable for exact quotation, so these links informed broad checks only.

Comparable public-service patterns:

- [USA.gov benefits](https://www.usa.gov/benefits) — plain-language category entry and a visible distinction between guidance and the agency that takes action.
- [Benefits.gov](https://www.benefits.gov/) — task-first benefit discovery and explicit handoff to the responsible government program.
- [211](https://www.211.org/) — prominent local-help routing and a phone fallback when a web destination is not enough.

The comparison led to concrete choices: keep one primary action per step, identify every government destination as external, show the selected jurisdiction before opening it, keep the phone fallback visible, and repeat the unofficial/local-only boundary at the moment it matters.

## FY2027 retrieval 10 Oct 2026

- Document: "SNAP - Fiscal Year 2027 Cost-of-Living Adjustments," USDA Food and Nutrition Administration memo to all SNAP state agencies, dated 21 Aug 2026. URL: https://www.usda.gov/sites/default/files/guidance-documents/fna.snap-cola2027.pdf
- How it was retrieved: usda.gov and fns.usda.gov refused automated requests from the build machine (HTTP 403, "Access Denied"). The PDF was read from the Internet Archive's copy of that exact URL (`https://web.archive.org/web/2026/https://www.usda.gov/sites/default/files/guidance-documents/fna.snap-cola2027.pdf`, SHA-256 `67039672203fb2b706fcb6bb560e5026a3ae4570b52c2e6687abcefbd0d2bc8f`). The PDF metadata names USDA Food and Nutrition Administration as author.
- Used: net monthly (100%) and gross monthly (130%) standards for household sizes 1 to 8 and each additional member, for the 48 states and D.C., Alaska, and Hawaii (the 48-state column also covers Guam and the U.S. Virgin Islands, which Helper does not serve). Asset limit for households with a member 60 or older or disabled: $4,750 (page 2), up from $4,500.
- Not used: the 165% table (see the policy above), maximum allotments, and deductions.
- Verified 10 Oct 2026 against FNS's own published tables, fetched directly from fns.usda.gov (linked from https://www.fns.usda.gov/snap/allotment/cola): [FY 2027 Income Eligibility Standards](https://www.fns.usda.gov/sites/default/files/resource-files/snap-fy27-incomeEligibilityStandards.pdf) (SHA-256 `774404361683d278571c4411dcda20c34d13f30e1c29f71b184e5ec481d1de31`) and [FY 2027 Maximum Allotments and Deductions](https://www.fns.usda.gov/sites/default/files/resource-files/snap-fy27maximumAllotments-deductions.pdf) (SHA-256 `9ab3399405573a65c15661224f2d1b2203ca8f68f1bc207d45b88ad92adf9840`). All 54 net and gross values in `src/data/fpl.ts` (sizes 1 to 8 and each additional member, three regions) match the FNS income table exactly, and the $4,750 asset limit matches Table 2 of the deductions sheet.
- Spot checks against these figures are in `tests/fy2027.test.ts`.

## Spot-fetch 17 Aug 2026

Official redirects or 200: FNS state directory; PA COMPASS; Your Texas Benefits; energyhelp.us → liheapch search-tool; DC SNAP page. CDSS CalFresh application redirected toward a login wall. This observation was superseded for California by the 6 September official CDSS guidance above.
