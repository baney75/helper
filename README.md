# Helper

Live site: https://baney75.github.io/helper/

Type a ZIP. The official SNAP page for that state appears. Print a papers checklist. Save the interview or recertification date on this device.

This is unofficial. It is not a government website. It does not decide whether you qualify, and it does not file an application. Your answers stay in the browser. There is no account.

SNAP food help is open all year. Energy help is seasonal: heating is usually fall through spring; cooling or shutoff-crisis help is more often summer. Three steps: official pages, papers, then the date to keep. The unofficial screen is optional. Use Continue, Back, or the browser back button. Progress saves on this device as you type. If the internet drops, the packet and the date still work. Official apply pages need the internet. When the network is back, the page can update itself. Your answers still do not leave the device.

If you already know your state, skip the ZIP box and pick it from the list.

## Why this exists

SNAP still misses a lot of older adults. USDA reported that 55% of eligible people 60 and older were on SNAP in FY2022, versus 88% overall. LIHEAP reached about 17% of income-eligible households in FY2024. A Los Angeles field experiment found that a missed SNAP interview is a common denial path, and that making the interview easier raised 30-day approvals.

A website without a state contract cannot submit the application. It can still get you to the official page, name the papers to bring, and keep the interview date from getting lost.

LIHEAP is a block grant. States set the rules and the money can run out. Meeting an income cutoff does not mean you will get a benefit. If this page conflicts with an official notice or a worker, follow the official source.

## Run it locally

```bash
npm install
npm test
npm run dev
```

Open the URL Vite prints. The production build assumes GitHub Pages at `/helper/`:

```bash
npm run build
```

## Data

State links live in `src/data/programs.ts`. SNAP income tables for FY2026 (1 Oct 2025 through 30 Sep 2026) live in `src/data/fpl.ts`. Sources are in `research/SOURCES.md`.

If a portal is down, keep the official how-to page. Do not invent URLs. Screening copy may say `likely_worth_applying`, `maybe`, or `probably_not`. It must not say eligible or ineligible.

## If you post this

The demo is the ZIP box. `19103` should surface Pennsylvania's official COMPASS SNAP page and the LIHEAP page. `90210` should surface California. Then print the packet and save an interview date.

Quote, if you want one: USDA FY2022, 55% of eligible people 60+ were on SNAP, versus 88% overall.

## License

MIT. See `LICENSE`.

If this saved you a trip:
https://buymeacoffee.com/baneydonovan
