# Sources

Initial directory retrieved 16–17 August 2026; targeted maintenance checks on 6 September 2026. Prefer these over vendor blogs.

## SNAP

- [FNS SNAP eligibility](https://www.fns.usda.gov/snap/recipient/eligibility) (FY2026: 1 Oct 2025–30 Sep 2026)
- [FNS Trends in USDA SNAP Participation Rates: FY2020 and FY2022](https://www.fns.usda.gov/research/snap/national-participation-rates/fy20and22) (source for the README's 88% overall and 55% elderly FY2022 comparison)
- [FNS elderly or disabled special rules](https://www.fns.usda.gov/snap/eligibility/elderly-disabled-special-rules)
- [FNS COLA / FY2026 income standards](https://www.fns.usda.gov/snap/allotment/COLA)
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

- The optional income screen is limited to FNS FY2026 monthly figures and automatically pauses after 30 September 2026. Do not extend it into FY2027 without replacing the table from the current FNS COLA source and rechecking its copy.
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

## Spot-fetch 17 Aug 2026

Official redirects or 200: FNS state directory; PA COMPASS; Your Texas Benefits; energyhelp.us → liheapch search-tool; DC SNAP page. CDSS CalFresh application redirected toward a login wall. This observation was superseded for California by the 6 September official CDSS guidance above.
