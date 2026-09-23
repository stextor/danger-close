// t41 — THE SURVIVOR'S AGE DEDUCTIONS (C-3) AND THE UNUSED DEDUCTION AGAINST GAINS (C-6)
// (SCOPE_SURVIVOR_AGE_AND_GAINS_DEDUCTION; added for v5.75). Runs on BOTH legs:
//     node t41_survivor_age_gains.mjs v574   |   node t41_survivor_age_gains.mjs v575
//
// SOURCES (read 2026-09-22 from the IRS text itself, not a summary):
//   C-3  26 U.S.C. §63(f) — the age-65 additional deduction is per INDIVIDUAL on the return.
//        IRS Pub. 501 (2025), "Death of spouse": a spouse who dies during the year counts as 65
//        only if 65 AT DEATH (born 1960-02-14: counts if she dies 2025-02-13, not 2025-02-12).
//        2025 Form 1040 instructions, Schedule 1-A Part V, "Death of a taxpayer in 2025" (added
//        after first print): the OBBBA $6,000 bonus takes the SAME rule and the SAME example.
//        => on a SINGLE return only the FILER's age can grant either deduction.
//   C-6  26 U.S.C. §1(h)(1) — the preferential rates apply to gains "or, if less, taxable income."
//        2025 Form 1040 instructions, Qualified Dividends and Capital Gain Tax Worksheet—Line 16:
//        line 1 is taxable income AFTER the deduction, line 5 floors the ordinary part at zero, and
//        line 10 takes the SMALLER of line 1 or the gains. So a deduction ordinary income does not
//        use absorbs the gains first. The worksheet was executed line by line against `law()` below
//        on all five cases at build; it agrees to the cent.
//
// EVERY EXPECTED FIGURE IS WORKED BY HAND BELOW, then compared to engine output — never read back.
// The C-3 household: A born 1955 (dies after 2027), B born 1966, pension $50,000, no SS, no state.
// B survives at 62/63/64 in 2028/2029/2030 and reaches 65 in 2031. Single, 2026 base year, so with
// `stdDed = round(16,100 × 1.02^n)` and the 10% bracket top `12,400 × 1.02^n` (UNROUNDED — the model
// indexes the bracket edge, not a rounded dollar), taxable income is 50,000 − stdDed and the tax is
//   0.12 × TI − 0.02 × (12,400 × 1.02^n)      [TI is inside the 12% band in all three years]
//   2028: stdDed 16,750, TI 33,250 -> 3,731.98      2029: stdDed 17,085, TI 32,915 -> 3,686.62
//   2030: stdDed 17,427, TI 32,573 -> 3,640.32
//
// ⚠ THE PRIOR LEG PINS THE DEFECTS AS DATED KNOWN DEFECTS. On v574 the survivor takes the deceased
//   spouse's age (2028: 2,756.02 against 3,731.98 — $975.96 too little) and an unused deduction never
//   reaches the gains. Gate per leg; never soften a figure so both legs agree.
// ⚠ AMT = 0 IN EVERY C-6 CASE IS THE PHANTOM-AMT GUARD, NOT A FORMALITY. Fixing only the regular
//   path moves the overcharge into AMT instead of removing it: measured at build on BOTH engines
//   (Engine B: 1,583.00 / 1,215.00 / 82.00 of pure AMT; Engine A: totals unmoved at 1,583 / 3,083).
//   A test that checked only the total would have passed that half-fix.
import { createRequire } from "module";

const VER = process.argv[2];
const KNOWN_VERSIONS = ["v574", "v575"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.\n    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST = VER === "v575";

// argv[3] (optional) is a module path, so the negative controls can point this suite at a mutated
// build while still gating its expectations by leg — the convention t40 uses.
const mod = await import(process.argv[3] || `./app_${VER}.mjs`);
const G = mod.__g, E = mod.__engines, TEST = mod.__test;

let pass = 0, fail = 0; const fails = [];
const EPS = 0.01;
const T = (name, got, exp) => {
  const ok = typeof exp === "number" ? Math.abs(got - exp) < EPS : got === exp;
  if (ok) pass++; else { fail++; fails.push(`  \u2717 ${name}: got ${got}  exp ${exp}`); }
};
console.log(`t41 \u2014 SURVIVOR AGE DEDUCTIONS / UNUSED DEDUCTION VS GAINS (${VER})`);

// ── shared household construction (same shape the scope probe used) ──────────────────────────────
const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
const ss0 = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
const load = (o) => { const P = JSON.parse(JSON.stringify(BASE));
  Object.assign(P, { positions: [], otherAccounts: [], stateCode: null, _incomeFromForm: true,
    incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] }, o);
  G.applyLoadedData({ portfolio: P }); };
const rowsB = (o, extra = {}) => { load(o);
  return E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0, ...extra }).rows; };

// ── C-3 · Engine B, the survivor household, to the cent ──────────────────────────────────────────
const C3 = rowsB({ single: false, dobA: "1955-01-01", dobB: "1966-01-01", lifeExpA: 72, lifeExpB: 95,
  incomeSources: { ssA: ss0, ssB: ss0, pension: { amount: 50000 / 12 } } });
const yB = (yr) => C3.find(r => r.yr === yr);
// the joint years are unchanged by this release and pin that the fix did not touch them
T("A-1 2026 MFJ, both alive: fedTax", yB(2026).fedTax, 1015.00);
T("A-2 2027 MFJ, the DEATH YEAR files jointly (Pub. 501): fedTax", yB(2027).fedTax, 947.30);
T("A-3 2027 the death year still grants both deductions: seniorExtra", yB(2027).seniorExtra, 7683);
T("A-4 2031 the survivor has reached 65: fedTax", yB(2031).fedTax, 3321.51);
T("A-5 2031 the survivor's own age grants it: seniorExtra", yB(2031).seniorExtra, 2263);
if (POST) {
  T("A-6 2028 survivor aged 62 takes NO 65+ deduction: seniorExtra", yB(2028).seniorExtra, 0);
  T("A-7 2029 survivor aged 63: seniorExtra", yB(2029).seniorExtra, 0);
  T("A-8 2030 survivor aged 64: seniorExtra", yB(2030).seniorExtra, 0);
  T("A-9  2028 fedTax (hand: 0.12 x 33,250 - 0.02 x 12,900.96)", yB(2028).fedTax, 3731.98);
  T("A-10 2029 fedTax (hand: 0.12 x 32,915 - 0.02 x 13,158.98)", yB(2029).fedTax, 3686.62);
  T("A-11 2030 fedTax (hand: 0.12 x 32,573 - 0.02 x 13,422.16)", yB(2030).fedTax, 3640.32);
} else {
  //   v574: Math.max(ageA, ageB) grants the deduction through the DECEASED spouse's age, and 2028
  //   is inside the OBBBA bonus window, so 2028 carries the $2,050 + $6,000 (indexed) as well.
  T("A-6 [KNOWN DEFECT pre-v5.75] 2028 survivor 62 still gets 65+ AND the bonus", yB(2028).seniorExtra, 8133);
  T("A-7 [KNOWN DEFECT pre-v5.75] 2029 survivor 63 still gets 65+", yB(2029).seniorExtra, 2175);
  T("A-8 [KNOWN DEFECT pre-v5.75] 2030 survivor 64 still gets 65+", yB(2030).seniorExtra, 2219);
  T("A-9  [KNOWN DEFECT pre-v5.75] 2028 fedTax understated by 975.96", yB(2028).fedTax, 2756.02);
  T("A-10 [KNOWN DEFECT pre-v5.75] 2029 fedTax understated by 261.00", yB(2029).fedTax, 3425.62);
  T("A-11 [KNOWN DEFECT pre-v5.75] 2030 fedTax understated by 266.28", yB(2030).fedTax, 3374.04);
}
// the bonus is the SECOND deduction and had its own copy of the age rule until v5.75
T("A-12 2028 is inside the OBBBA bonus window (2025-2028) for the leg's rule", yB(2028).yr, 2028);

// ── C-3 · Engine A (the Roth tab's engine): the same household, whole dollars ─────────────────────
// Engine A is driven directly, so the portfolio only has to be emptied of positions and streams.
G.setPortfolio({ positions: [], stateCode: null,
  incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const baseA = (o = {}) => ({ single: false, asOfYr: 2026, retireYr: 2028, horizonYr: 2028,
  ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1955, dobBYr: 1966, survivor: "B", deathYr1: 2027,
  ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 50000 / 12, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0,
  acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const runA = (o) => G.runRothStrategies(baseA(o)).find(r => r.key === "none").totTax;
// Engine A does not model the OBBBA bonus (disclosed simplification), so 2028 differs from Engine B
// by the bonus alone: 3,731.98 rounds to 3,732 here.
T("B-1 2028 survivor B aged 62 — Engine A", runA({}), POST ? 3732 : 3476);
T("B-2 2028 control: B also born 1955, legitimately 65+ — unchanged by this release", runA({ dobBYr: 1955 }), 3476);
T("B-3 2031 control: the survivor has reached 65 — unchanged", runA({ retireYr: 2031, horizonYr: 2031 }), 3322);
// A SINGLE household whose spouse-B birth date is stale: only the FILER's age may grant it.
// Measured at build: live in Engine A on v574 ($246/yr = the $2,050 deduction at 12%), NOT in Engine B.
const staleA = (dobBYr) => G.runRothStrategies(baseA({ single: true, retireYr: 2026, horizonYr: 2026,
  dobAYr: 1966, dobBYr, survivor: "A", deathYr1: 2099 })).find(r => r.key === "none").totTax;
T("B-4 single filer aged 60, no stale date: hand 1,240 + 0.12 x 21,500 = 3,820", staleA(1966), 3820);
T("B-5 single filer aged 60 with a STALE 1950 spouse date takes only A's age", staleA(1950), POST ? 3820 : 3574);

// ── C-3 · the Roth tab's bracket projection (hoisted at v5.75, D-7) ──────────────────────────────
// Before the hoist this tab's figures were reachable only through the DOM, where Math.round(x/1000)
// puts a +/-$500 floor under any invariant (OPERATIONS §M) — larger than the $2,050 deduction at 12%.
if (POST) {
  const pb = (yr, sgl, ageA, ageB) => TEST.projectBracketsAt(yr,
    { asOfYr: 2026, filingSingle: sgl, survivorIsA: false, ageA, ageB, irmaaUpper0: 218000 });
  //   2028 single: round(16,100 x 1.02^2) = 16,750, survivor aged 62 adds nothing
  //   2031 single: round(16,100 x 1.02^5) = 17,776 + round(2,050 x 1.02^5) = 2,263 -> 20,039
  T("C-1 2028 the projection agrees with Engine B's deduction for a survivor aged 62", pb(2028, true, 68, 62).stdDed, 16750);
  T("C-2 2031 the survivor's own age grants it: 17,776 + 2,263", pb(2031, true, 71, 65).stdDed, 20039);
  T("C-3 the projection is reachable from the harness at all (the hoist's purpose)", typeof TEST.projectBracketsAt, "function");
} else {
  T("C-1 [pre-v5.75] the projection is inline on the tab and unreachable", typeof (TEST || {}).projectBracketsAt, "undefined");
}

// ── C-6 · an unused deduction against preferential income ────────────────────────────────────────
// `law` IS the 2025 QD&CG worksheet for a single filer in 2026, written out: taxable income after the
// deduction, the ordinary part floored at zero, the preferential part capped at taxable income, the
// 0% band filled from the bottom. Executed line by line against the worksheet at build; agrees exactly.
const DED = 16100, B10 = 12400, ZERO_TOP = 49450, TWENTY = 545500;
const law = (ord, Gn) => { const TI = Math.max(0, ord + Gn - DED); const pref = Math.min(Gn, TI); const O = TI - pref;
  return (O <= B10 ? .1 * O : 1240 + .12 * (O - B10)) + .15 * Math.max(0, Math.min(TI, TWENTY) - Math.max(O, ZERO_TOP)); };
const CASES = [[0, 60000], [8000, 70000], [15551, 50000], [16100, 60000], [30000, 60000]];
const bC6 = (ord, Gn) => rowsB({ single: true, dobA: "1970-01-01", dobB: "1970-01-01", lifeExpA: 95, lifeExpB: 95,
  incomeSources: { ssA: ss0, ssB: ss0, pension: { amount: ord / 12 } } }, { gainByYr: { 2026: Gn } }).find(x => x.yr === 2026);
//   v574 pins: the deduction never reaches the gains, so the first four cases are overcharged.
const PRE_B = { "0,60000": 1582.50, "8000,70000": 3082.50, "15551,50000": 82.50, "16100,60000": 1582.50, "30000,60000": 5087.50 };
for (const [ord, Gn] of CASES) {
  const r = bC6(ord, Gn); const tot = r.fedTax + r.capGainsTax + r.amt_y;
  T(`D-1 Engine B ord ${ord} pref ${Gn}: total tax`, tot, POST ? law(ord, Gn) : PRE_B[`${ord},${Gn}`]);
  // THE PHANTOM-AMT GUARD. Fixing only the regular path leaves the total right and moves the
  // overcharge into AMT; this line, not the total, is what catches that.
  T(`D-2 Engine B ord ${ord} pref ${Gn}: AMT is zero`, r.amt_y, 0);
}
// Engine A, whole dollars, same cases.
const aC6 = (ord, Gn) => G.runRothStrategies({ ...baseA({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2026,
  dobAYr: 1970, dobBYr: 1970, survivor: "A", deathYr1: 2099, pen: ord / 12, taxableInit: Gn * 20, taxYieldPct: 5 }) })
  .find(r => r.key === "none").totTax;
const PRE_A = { "0,60000": 1583, "8000,70000": 3083, "15551,50000": 83, "16100,60000": 1583, "30000,60000": 5088 };
for (const [ord, Gn] of CASES)
  T(`D-3 Engine A ord ${ord} pref ${Gn}: total tax`, aC6(ord, Gn), POST ? Math.round(law(ord, Gn)) : PRE_A[`${ord},${Gn}`]);

// ── C-6 · the SALE gross-up sites (Engine A, four of the eleven) ─────────────────────────────────
// These sites are only reached when the year has a bill to fund, and an unused federal deduction
// normally means no federal tax at all — so the reachable case is a STATE bill: state tax creates
// the cash need while the federal deduction is still unspent. Without this case the four sale sites
// are exercised by nothing (control M6 is what proves it: floor the sale stack and D-4 must fire).
//   single filer, no ordinary income, $48,000 of dividends, brokerage all gain (gfEff = 1)
//   state: flat rate on the dividends ....................... 5% x 48,000 = 2,400
//   federal: TI = 48,000 - 16,100 = 31,900, all preferential, below the 49,450 top of the 0% band
//   the sale raises exactly the 2,400 due, realizing 2,400 of gain; 31,900 + 2,400 = 34,300 is
//   still inside the 0% band, so the gross-up adds nothing and the total IS the state bill.
//   (v574 floors the stack at 48,000, pushing 950 of the sale past 49,450 — and the gross-up then
//   chases its own tax: 2,545 and 4,784.)
const saleA = (stateRate) => G.runRothStrategies(baseA({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2026,
  dobAYr: 1970, dobBYr: 1970, survivor: "A", deathYr1: 2099, pen: 0, stateRate,
  convTaxFunding: "sell", taxableGainFrac: 1, taxYieldPct: 5, taxableInit: 48000 * 20 }))
  .find(r => r.key === "none").totTax;
T("D-4 sale gross-up, state 5%: the unused deduction absorbs the sale gain (2,400 + 0)", saleA(0.05), POST ? 2400 : 2545);
T("D-5 sale gross-up, state 9%: 9% x 48,000, gain still absorbed", saleA(0.09), POST ? 4320 : 4784);

// ── EXTINCTION · a sweep across the deduction edge and the 0% top ────────────────────────────────
// Defect class: any stack floored at zero anywhere on either path. The sweep walks ordinary income
// through the deduction and preferential income through the top of the 0% band, so a floor
// reintroduced at ANY one site shows up here even if the five cases above were special-cased.
if (POST) {
  let worst = 0, worstAt = "";
  for (const ord of [0, 5000, 12000, 16099, 16100, 16101, 20000, 40000])
    for (const Gn of [1000, 20000, 33350, 49450, 49451, 60000, 80000]) {
      const r = bC6(ord, Gn); const d = Math.abs((r.fedTax + r.capGainsTax + r.amt_y) - law(ord, Gn));
      if (d > worst) { worst = d; worstAt = `ord ${ord} pref ${Gn}`; }
      if (r.amt_y !== 0) { worst = Infinity; worstAt = `AMT fired at ord ${ord} pref ${Gn}`; }
    }
  T(`X-1 56-cell sweep: Engine B equals the worksheet everywhere (worst ${worst.toFixed(2)} at ${worstAt})`, worst < EPS ? 1 : 0, 1);
}
// X-2: BOTH deductions follow ONE rule. The OBBBA bonus kept its own copy of the age test until
// v5.75, so this is behavioural, not a text search: a survivor who IS 65 in 2028 must receive the
// §63(f) extra AND the bonus together — round(2,050 x 1.02^2) = 2,133 plus the UNINDEXED 6,000.
// (A-6 is the other half: a survivor under 65 in 2028 must receive neither.)
const c3at65 = rowsB({ single: false, dobA: "1955-01-01", dobB: "1963-01-01", lifeExpA: 72, lifeExpB: 95,
  incomeSources: { ssA: ss0, ssB: ss0, pension: { amount: 50000 / 12 } } }).find(r => r.yr === 2028);
T("X-2 2028 survivor aged 65 receives both deductions under one rule: 2,133 + 6,000", c3at65.seniorExtra, 8133);

console.log(`t41 SUITE (${VER}): ${pass} passed, ${fail} failed`);
if (fails.length) console.log(fails.join("\n"));
process.exit(fail ? 1 : 0);
