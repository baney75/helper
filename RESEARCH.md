# What this repo should build

Cutoff: 15 August 2026.

GiveWell still finds the highest lives-per-dollar in malaria prevention, vitamin A, and vaccine incentives (about $3,500–$5,500 per life saved). Those need distribution networks. This repo can ship software. The three options below are the strongest *software-shaped* problems that still have a last mile.

## 1. Safety-net last mile (build this)

**Problem.** SNAP reached 88% of people eligible under federal rules in FY2022 (~38 million eligible, ~34 million participating). Older adults (60+) were at 55%; older adults living with others were at 32%. LIHEAP reached 17% of 35.5 million income-eligible households in FY2024 (5.9 million served). Remaining SNAP non-participation is concentrated in older adults, working-poor households above 100% of poverty, and a few low-take-up states.

**Why software.** Administrative burden, not “people don’t want help,” is the documented mechanism. GetCalFresh cut California’s SNAP apply time from ~60 minutes to ~12, and Code for America reports 6.2 million people and $12.8 billion in food benefits (2017–2025). Homonoff, Somerville, and colleagues (NBER w31239) randomized ~65,000 Los Angeles SNAP applicants: access to a flexible interview line raised 30-day approvals by 6.2 percentage points (13%) and five-month participation by 2.2 points. Denial after a missed interview is a process failure, not ineligibility.

**What to ship.** Unofficial screening + official apply links + document checklist + interview/recertification reminders, aimed at older adults (SNAP + LIHEAP). Do not submit applications without a government partner. Do not treat screening as an eligibility determination.

**Sources.** [USDA FNS SNAP rates FY2022](https://www.fns.usda.gov/research/snap/national-participation-rates/fy20and22); Vigil and Rahimi 2024; [ACF LIHEAP](https://acf.gov/ocs/fact-sheet/liheap-fact-sheet) and FY2024 national profile (17% of 35.5 million); [NBER w31239](https://doi.org/10.3386/w31239); [GetCalFresh](https://codeforamerica.org/success-stories/simplifying-californias-online-application-for-food-benefits/).

Do not cite $80B / $140B / $228B “unclaimed benefits” figures. They conflict across vendors and are not an official series.

## 2. Heat last mile (later module)

**Problem.** CDC recorded 2,415 heat-related deaths in 2023 and 2,394 in 2024. Heat is the leading weather killer in the US. Deaths are undercounted.

**Why not first.** CDC/NWS already ship HeatRisk. Systematic reviews (Toloo et al.; later US/Canada reviews) find mixed mortality effects from warnings alone. People often do not change behavior; AC cost and isolation are the binding constraints. A phone-message RCT improved knowledge and behavior, so a check-in product is plausible, but it is seasonal and needs a way to reach isolated people.

**Keep.** Pair HeatRisk alerts with LIHEAP/cooling-center links for the same older-adult users.

**Sources.** [CDC Heat and Health Initiative, 22 Apr 2024](https://www.cdc.gov/media/releases/2024/p0422-heat-protection.html); CDC NVSS heat-death counts reported for 2023–2024; Toloo et al., *Int J Public Health* (heat-warning review); BMJ Public Health 2024 community heat-adaptation review.

## 3. Eviction navigation (do not build legal advice)

**Problem.** About 3.6 million eviction cases are filed in a typical year; about 7.6 million people are threatened. Roughly 96% of tenants have no lawyer; most landlords do.

**Why not first.** The intervention with RCT evidence is an attorney, and even then a Memphis trial found the 50% drop in 90-day judgments collapsed when emergency rental assistance ended. Software cannot replace counsel. Generating legal advice is unauthorized practice of law.

**Keep.** Later: court-date reminders and legal-aid / rental-assistance matching, with a hard “this is not legal advice” boundary.

**Sources.** [Eviction Lab](https://evictionlab.org/); Greiner et al. housing-court RCTs; Cassidy and colleagues, Memphis attorney RCT (SSRN 4621983).

## Decision

Build option 1. It is the only option where (a) the remaining gap is large, (b) software is the proven lever, and (c) an MVP does not need a court feed, a medical license, or a government contract.

First slice: ZIP → official SNAP and LIHEAP pages, document packet, interview reminder, older-adult screening labeled unofficial.
