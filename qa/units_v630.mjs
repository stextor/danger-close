// units_v630.mjs — v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): the dollar-unit facts the suites' own models need, written here once.
//
// From v6.30 every tax engine computes each year in that year's own dollars on one clock from the as-of year: Social Security, COLA streams
// and a real balance's dividends × (1+i)^(yr − as-of); a fixed amount (pension, non-COLA stream, built-in work, slider, QCD) as stated; today's
// balances carried to retirement × (1+i)^(retire − as-of), the planned-contribution accrual at face value (`carryHold`); the bracket family indexed at (1+i−0.0025)^(yr − as-of) (C-CPI-U), IRMAA tiers and the
// FPL at (1+i) (CPI-U); IRMAA surcharges × (1+i)^(premium year − as-of). `i` is the PLAN's inflation — Σ prob × inflation over the scenario
// table under the active prior — read here from the SCENARIOS a suite passes in (the DOM app's live table under its BULL-LEANING default, or an
// ESM module's at load, BASE), never from the app's own helpers, so a model built on these is independent of the code it checks.
// An array of tags, so register_tag2 widens it each release.
export const V630_TAGS = ["v630"];
export const isV630 = VER => V630_TAGS.includes(VER);
export const CHAINED_GAP = 0.0025;   // C-CPI-U below CPI-U, CBO Budget Options, 12 December 2024
export const planInflation = scenarios => Object.values(scenarios).reduce((s, sc) => s + sc.prob * sc.inflation, 0);
export const factor = (i, yr, asOf) => Math.pow(1 + i, yr - asOf);                       // today's → year yr's dollars
export const chained = (i, yr, asOf) => Math.pow(1 + i - CHAINED_GAP, yr - asOf);        // the §1(f)(3) family's index
// The preset weights applied to the table's inflation, for a suite that knows which preset the app runs under.
export const presetInflation = (scenarios, probs) => Object.entries(probs).reduce((s, [k, p]) => s + p * scenarios[k].inflation, 0);
// The carry from today to a start year (DU-7 (a)): today's holdings × RB, the planned-contribution accrual at FACE value (the v5.10 rule —
// never carried). `acc` is the accrual inside `amount` (the constructor's acc* fields, or 0 for a household that accrues nothing). Added
// after the v6.30 build review found the app — and every model here — carrying the accrual too (t93 §O pins the app against raw inputs).
export const carryHold = (amount, acc, RB) => (amount - (acc || 0)) * RB + (acc || 0);
