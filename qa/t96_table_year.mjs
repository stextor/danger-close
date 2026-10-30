// t96 — THE TABLES INDEX FROM THEIR OWN YEAR (v6.33 — D-67, F-28; docs/SCOPE_TY2027_REFRESH_V633_V634.md)
// Run: node t96_table_year.mjs v633   |   node t96_table_year.mjs v632
//
// THE DEFECT THIS EXISTS FOR.
//  D-67 — through v6.32 every tax engine indexed the published tables from the PLAN's as-of year: `inflateTaxConst(base, yr, P.asOfYr)`,
//    `seniorExtraFor(…, yr, asOfYr, …)`, `irmaaThresholdFor(…, premiumYr, asOfYr)`, `irmaaTierFor(…, asOfYr)`, `inflateWageBase(…, asOfYr)` —
//    18 calls — and grew the IRMAA surcharge with the dollar clock, `SUR × planDollarFactor(premiumYr, asOfYr)`, at 3 more sites. The 2026
//    figures were treated as if published in whatever year the plan is dated. For a plan dated 2026 that is the same number; for a plan dated
//    2027 every year was priced with one year of indexing missing (thresholds low, so tax and IRMAA high), for 2025 one year too many. No check
//    in the suite saw it: every fixture is dated 2026 (scope §0.4). From v6.33 each table carries its year and a year reads its own table,
//    or the newest held before it indexed forward from THAT table's year, or — before every held table — the oldest as it stands (DT-2 (a)).
//  F-28 — the Taxes tab's "net taxable income by federal bracket" panel drew the selected year against Engine B's `brackets2026`: the 2026
//    table at the filing status of the plan's LAST year, through Engine B's as-of `inflate`. On a plan that ends with a survivor every joint
//    year was drawn against Single bounds — on the example's opening view, 2029's $144,646 of taxable income, in the 22% bracket, was drawn
//    with about $31K in 24%. Found at the v6.33 build, at a D-67 site (filed and fixed together).
//
// WHAT IS CHECKED. §A the source by AST — the five helpers' parameters and table reads, no as-of argument at any call, no surcharge grown by
// the dollar clock, no engine reading an indexed figure from the 2026 table directly, TAX_CONSTANTS_YEAR read from the table, the ACA table
// keyed by coverage year, the panel's table. §B THE EXTINCTION INVARIANT: one household dated 2025, 2026, 2027 and 2028 with every other input
// fixed in nominal dollars (a fixed pension, a fixed work stream above the wage base, a fixed conversion and fixed gains, no Social Security,
// no balance-driven income) — Engines A, B and C and `projectBracketsAt` give the same figures in all four runs; and a tier-placement case, a
// MAGI between the as-of-indexed and the table-indexed tier-1 threshold. §B2 the Roth tab's rendered IRMAA threshold (component-inline,
// OPERATIONS §M) to the $K it prints, against an oracle. §C nothing moves for a plan dated 2026: Engines A–D, the bridge, the Monte Carlo's schedule,
// both seeded Monte Carlo engines, the Verify checks and the rendered Roth ladder, v6.32 → v6.33, bit-identical. §D the moves against the
// independent federal oracle (`tools/fed_oracle_v630.mjs`, its base year TYPED as the table's, never read from the app), and scope §0.3's
// measured deltas reproduced. §E copy. §F the panel.
//
// THE ORACLES. §B's oracle is the household's own other runs: the claim is invariance, so no figure is typed. §B2's threshold is typed:
// $218,000 (CMS 2026, MFJ tier 1) × (1 + i)^(premium year − 2026), i the plan's inflation read from the scenario table (an input). §D's is
// the statute oracle. §0.3's deltas in §D are MEASURED at the build (session probe `measure.mjs`), not independently derived, and say so.
// NOT COVERED behaviourally, and why (the build review): Engine D's bracket column across as-of dates (its draws follow the plan's spending,
// which the as-of date moves — §B reads `projectBracketsAt`, the function Engine D's column calls); Engine A's LTCG and AMT figures (§B's
// household has no taxable account, and Engine A takes no gain series); Engine C's QCD cap (it changes Engine C's MAGI only through an RMD,
// and §B's household has none inside its horizon — its RMDs would follow the as-of date). Those three are held by §A (each reads only the
// year's table) and §C (unchanged for a plan dated 2026).
//
// GATED PER LEG (OPERATIONS §B2). The v6.32 leg pins each defect as a dated [KNOWN DEFECT 2026-10-26, D-67] / [KNOWN DEFECT 2026-10-27, F-28].
// §C needs the v6.32 module and bundle in the run folder (a v6.32 → v6.33 run); in a later release's run, where v6.33 is the PRIOR leg, it
// prints a skip. DT-2 REVISED (Steve, 2026-10-27, after the build review): a year before every held table reads the oldest DEFLATED from
// its year — what v6.32 did for a plan dated 2026 that is already retired — so §C includes such a plan and B-8 pins the deflation.
// Module facts run in a child process (--module); the rendered checks mount the DOM bundle with Math.random seeded before the
// bundle loads (t11's TRAP 1). Controls: qa/tools/controls_v633_table_year.py (repo-only). Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(96); Math.random = () => _src();   // installed BEFORE any app module loads: d3 captures Math.random at load
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v633";
const MODULE = process.argv.includes("--module"), DUMP = process.argv.includes("--roth-dump");
const KNOWN_VERSIONS = ["v632", "v633", "v634", "v635", "v636", "v637", "v638"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-26, D-67 — flips at v6.33]";
const KP = "[KNOWN DEFECT 2026-10-27, F-28 — flips at v6.33]";
const PRIOR_TAG = "v632";   // §C's reference build: the last one that indexed from the as-of year
const clone = o => JSON.parse(JSON.stringify(o));
const sq = s => String(s || "").replace(/\s+/g, " ");
const require = createRequire(import.meta.url);
const ASOFS = ["2025-06-15", "2026-04-18", "2027-01-15", "2028-01-15"];   // 2026-04-18 is the example's own date
const planI = SC => Object.values(SC).reduce((s, sc) => s + sc.prob * sc.inflation, 0);   // the plan's CPI-U, an input read from the scenario table

// The §B household: nothing in it moves with the as-of date except the published tables. Single, born 1966 (65 in 2031, 71 in 2037, RMDs
// from 2041 — after its 2038 horizon), Florida, a $3M IRA, no Social Security, a $4,000/mo pension (a fixed amount: the dollars paid), a
// non-COLA work stream of $21,000/mo in 2029–2030 (above the wage base), no taxable account, no ACA bridge.
const neutral = (BASE, asOf, o = {}) => { const P = { ...clone(BASE), asOf, single: true, nameB: "", dobB: "", dobA: "1966-01-01", lifeExpA: 72, retireYear: 2029,
  positions: [], otherAccounts: [{ name: "IRA", balance: 3000000, owner: "A", taxType: "trad", planType: "ira" }],
  contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  total401k: 3000000, household: 3000000, homeMoveCash: 0, stateName: "Florida", stateTaxRate: 0, stateCode: "FL",
  incomeSources: { ssA: { tableByAge: {}, planned: 0, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 4000, owner: "A" } },
  incomeStreams: [{ id: "w1", label: "Consulting", kind: "work", owner: "A", monthly: 21000, startYear: 2029, endYear: 2030, cola: false, tax: "ordinary" }], ...o };
  delete P.acaBridge; return P; };
const GAINS = { 2032: 600000, 2035: 500000 };   // fixed nominal realized gains: past the 20% LTCG breakpoint both years, and into AMT in 2032 (the AMT figures)

// ══ CHILD MODE (--module): every module-level figure, as JSON ═════════════════════════════════════════════════════════════════════════
if (MODULE) {
  const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
  const g = { ...M.__test, ...M.__g }, E = M.__engines;
  const BASE = clone(g.PORTFOLIO()), BASE_E = clone(g.EXPENSES());
  const load = (P, m = g) => { m.applyLoadedData({ portfolio: clone(P), expenses: clone(BASE_E) }); return m.PLAN_TIMELINE(); };
  const i = planI(g.SCENARIOS());
  const out = { i };
  const pOfA = (m, R, roth) => { const tl = m.PLAN_TIMELINE();
    return { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.single ? 0 : tl.dobB.year + tl.lifeExpB),
      ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.single ? tl.dobA.year : tl.dobB.year,
      deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ssA: m.getSSA(), ssB: tl.single ? 0 : m.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month,
      ssBYr: tl.single ? tl.ssA_date.year : tl.ssB_date.year, ssBMo: tl.single ? tl.ssA_date.month : tl.ssB_date.month,
      pen: m.getPension(), penOwner: m.getPensionOwner(), stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: m.taxableGainShare(),
      ...m.retireStartBalances(R), ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: "A", taxableInit: m.taxableInitAll(), taxYieldPct: 2,
      currentConv: roth, ordDrawByYr: {} }; };

  // §B — the extinction invariant: four runs, one household
  const rowB = r => [r.yr, r.stdDed, r.seniorExtra, r.fedTax, r.capGainsTax, r.amt_y, r.fica, r.qcd_y, r.bracket, r.totalTax];
  const rowC = r => [r.yr, r.irmaaYr, r.tier, r.surchargeAnnual, r.magi, r.headroom];
  out.B = {};
  for (const a of ASOFS) {
    const tl = load(neutral(BASE, a));
    const args = { retireYear: 2029, rothAmount: 100000, qcdAnnual: 500000, taxYield: 0, gainByYr: GAINS, ordDrawByYr: {} };
    const B = E.computeTaxPlan(args), C = E.computeIrmaaPlan(args);
    const A = g.runRothStrategies({ ...pOfA(g, 2029, 100000), taxableInit: 0, taxYieldPct: 0, taxableGainFrac: 0 });
    out.B[a] = { asOf: tl.asOfYear, single: !!tl.single, B: B.rows.map(rowB), C: C.rows.map(rowC),
      A: A.map(r => [r.key, r.totTax, r.totConv, r.totIrmaa, r.totNiit]) };
  }
  // the tier-placement case: MAGI = pension + conversion placed between 109,000 × (1+i)^4 and × (1+i)^5 — premium year 2031's tier-1 threshold
  // indexed from 2027 (v6.32, dated 2027) and from 2026 (the table's year). The 2029 row's premium year is 2031.
  const M_GAP = Math.round(109000 * Math.pow(1 + i, 4.5));
  out.tierCase = { M: M_GAP, lo: 109000 * Math.pow(1 + i, 4), hi: 109000 * Math.pow(1 + i, 5), runs: {} };
  for (const a of ASOFS) {
    load(neutral(BASE, a, { incomeStreams: [] }));
    const args = { retireYear: 2029, rothAmount: M_GAP - 48000, qcdAnnual: 0, taxYield: 0, gainByYr: {}, ordDrawByYr: {} };
    const c29 = E.computeIrmaaPlan(args).rows.find(r => r.yr === 2029);
    const A = g.runRothStrategies({ ...pOfA(g, 2029, M_GAP - 48000), taxableInit: 0, taxYieldPct: 0, taxableGainFrac: 0 },
      [{ key: "current", label: "C", policy: { kind: "fixed", amount: M_GAP - 48000 } }])[0];
    out.tierCase.runs[a] = { magi: c29 && c29.magi, tier: c29 && c29.tier, irmaaYr: c29 && c29.irmaaYr, totIrmaaA: A.totIrmaa };
  }
  // projectBracketsAt (Engine D's bracket column; the Roth ladder): 2030, joint, one spouse 65+. v6.32 takes the as-of year; v6.33 ignores it.
  out.PB = {};
  for (const y of [2025, 2026, 2027, 2028]) {
    const r = g.projectBracketsAt(2030, { asOfYr: y, filingSingle: false, survivorIsA: true, ageA: 66, ageB: 60, irmaaUpper0: g.IRMAA_CONSTS().MFJ[0] });
    out.PB[y] = { std: r.stdDed, br: r.brackets.map(b => b.upper === Infinity ? null : b.upper), thr: r.irmaaThreshold };
  }
  // helper facts (v6.33 shapes)
  if (POST) {
    const tb = { 2026: "a", 2027: "b" };
    let throwsSE = false; try { g.seniorExtraFor(true, 70, 70, 2030, 2026, true); } catch (e) { throwsSE = true; }
    let throwsACA = false; try { g.acaApplicablePct(2.0, "current"); } catch (e) { throwsACA = true; }
    const yl = g.taxFactsFor(false), yy = g.taxFactsFor(false, 2030);
    out.H = { held: [2020, 2026, 2027, 2030].map(y => g.heldTableYear(tb, y)), ty: g.TAX_CONSTANTS_YEAR(), fty2025: g.fedTableYear(2025), fty2040: g.fedTableYear(2040),
      itc2025: g.inflateTaxConst(100000, 2025), itc2025x: 100000 / (1 + i - 0.0025), itc2026: g.inflateTaxConst(100000, 2026), wb2026: g.wageBaseFor(2026),
      wb2025: g.wageBaseFor(2025), wb2025x: 184500 / (1 + i), thr2025: g.irmaaThresholdFor(109000, false, 2025), thr2025x: 109000 / (1 + i),
      wb2030: g.wageBaseFor(2030), wb2030x: 184500 * Math.pow(1 + i, 4), throwsSE, throwsACA,
      yearless: { std: yl.std, br: yl.br, niit: yl.niit, ssThr1: yl.ssThr1 }, withYr: { tableYear: yy.tableYear, std: yy.std, amt28: yy.amt28 },
      sur: [g.irmaaSurchargeFor(2, 1, 2026), g.irmaaSurchargeFor(2, 2, 2030), 2880 * 2 * Math.pow(1 + i, 4), g.irmaaSurchargeFor(9, 1, 2026)],
      topFrozen: [g.irmaaThresholdFor(g.irmaaTableFor(2027).SGL[4], true, 2027), g.irmaaThresholdFor(g.irmaaTableFor(2025).SGL[4], true, 2025)] };
  }
  // §D — the statute oracle on a household dated 2027, and the v6.32 base for the pin
  {
    const _o = [new URL("./tools/fed_oracle_v630.mjs", import.meta.url), new URL("./fed_oracle_v630.mjs", import.meta.url)].find(u => existsSync(u));
    const { makeFedOracle } = await import(_o.href);
    const tl = load(neutral(BASE, "2027-01-15"));
    const B = E.computeTaxPlan({ retireYear: 2029, rothAmount: 100000, qcdAnnual: 0, taxYield: 0, gainByYr: GAINS, ordDrawByYr: {} });
    const o26 = makeFedOracle(i, tl, 2026), o27 = makeFedOracle(i, tl, 2027);   // the table's year (typed), and v6.32's as-of base
    out.D = { asOf: tl.asOfYear, rows: B.rows.filter(r => r.yr === 2030 || r.yr === 2032 || r.yr === 2036).map(r => ({ yr: r.yr, fed: r.fedTax, cg: r.capGainsTax,
      ded: r.stdDed + r.seniorExtra, o26: o26(r), o27: o27(r) })) };
  }
  // §E — the Events tab's tax notice: the lead sentence, and (v6.33) each family named once a family's year differs
  {
    load(BASE); const d = new Date("2026-11-15T12:00:00");
    const tax = () => (g.computePlanEvents(d) || []).find(e => e.key === "tax");
    out.E = { title: tax().title, ins: tax().instructions.slice(0, 160) };
    if (POST) { const WB = g.WAGE_BASE_TABLES(); WB[2027] = 192300; out.E.differ = tax().instructions.slice(0, 220); out.E.differTitle = tax().title; delete WB[2027];
      out.E.restored = tax().instructions.slice(0, 160); }
  }
  // the panel's inputs (§F): the example's selected year (the retirement year) from Engine B
  {
    const tl = load(BASE); const R = tl.targetRetireYear;
    const s = g.withdrawalPlanSeries({ retireYear: R, rothAmount: 70000, scenarioPreset: g.DEFAULT_SCENARIO_PRESET });   // the tab's opening scenario
    const r = E.computeTaxPlan({ retireYear: R, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, ...s }).rows.find(x => x.yr === R);
    out.F = { yr: r.yr, filingSingle: r.filingSingle, bracket: r.bracket, taxableOrdinary: r.taxableOrdinary };
  }
  // §C — nothing moves for a plan dated 2026, v6.32 → v6.33 (current leg, with the prior module present)
  const PRI = join(HERE, `app_${PRIOR_TAG}.mjs`);
  if (POST && existsSync(PRI)) {
    const MP = await import(pathToFileURL(PRI).href); const gp = { ...MP.__test, ...MP.__g }, EP = MP.__engines;
    const HH = [["the example", BASE], ["the example at a $250K slider", BASE], ["the example filed single", { ...clone(BASE), single: true }],
      ["the example retiring in its as-of year", { ...clone(BASE), retireYear: 2026 }], ["the §B household dated 2026", neutral(BASE, "2026-04-18")],
      ["the example, A born 1958 (an early death, a survivor of 68)", { ...clone(BASE), dobA: "1958-01-01", lifeExpA: 76 }],
      ["the example already retired (a 2024 retirement year: rows in 2024 and 2025, before the table — the build review's case)", { ...clone(BASE), retireYear: 2024 }]];
    const snap = (m, e, P, roth) => { const tl = load(P, m); const R = tl.targetRetireYear; const o = {};
      const s = m.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: "base" }); o.series = s;
      // Engine B no longer returns `brackets2026` (its one reader, the Taxes tab's panel, reads the selected year's table — F-28): the
      // comparison drops that one key, and §A A-9 holds the panel's new source. Every figure Engine B returns is compared.
      o.B = e.computeTaxPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 30000, taxYield: 2, ...s }); delete o.B.brackets2026;
      o.C = e.computeIrmaaPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 30000, taxYield: 2, ...s });
      o.D = m.computeWithdrawalPlan({ retireYear: R, rothAmount: roth, scenarioPreset: "base" });
      o.A = m.runRothStrategies(pOfA(m, R, roth));
      o.mcs = m.mcIncomeTaxSchedule(R, { rothAmount: roth });
      _src = mulberry(7); o.mc = m.runMonteCarlo(R, 60, {});
      _src = mulberry(11); o.ext = m.runExtendedMC(R, 30, 40, { rng: mulberry(11) });
      o.PB = []; for (let y = 2026; y <= 2060; y += 3) for (const sg of [false, true]) o.PB.push(m.projectBracketsAt(y, { asOfYr: tl.asOfYear, filingSingle: sg, survivorIsA: true, ageA: y - 1964, ageB: y - 1966, irmaaUpper0: (sg ? m.IRMAA_CONSTS().SGL : m.IRMAA_CONSTS().MFJ)[0] }));
      return JSON.stringify(o); };
    out.C = HH.map(([lab, P], k) => { const roth = k === 1 ? 250000 : 70000; const a = snap(gp, EP, P, roth), b = snap(g, E, P, roth); return { lab, same: a === b, len: a.length,
      at: a === b ? -1 : [...a].findIndex((ch, j) => ch !== b[j]) }; });
    // and Verify: every check's actual value
    const vP = gp.buildVerificationChecks().map(c => [c.name, c.actual, c.pass]), vC = g.buildVerificationChecks().map(c => [c.name, c.actual, c.pass]);
    out.Cv = { same: JSON.stringify(vP) === JSON.stringify(vC), n: vC.length, allPass: vC.every(c => c[2]) };
    // §D's measured deltas (scope §0.3), the example dated 2027-01-15 — measured, not independently derived
    // with the drawdown series both tabs pass in, under the tab's opening scenario (the build review found the scope measured without it)
    const tot = (m, e, P, roth) => { const tl = load(P, m); const R = tl.targetRetireYear;
      const a = { retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2, ...m.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: m.DEFAULT_SCENARIO_PRESET }) };
      const sum = (rs, k) => rs.reduce((s, r) => s + (r[k] || 0), 0);
      return { tax: Math.round(sum(e.computeTaxPlan(a).rows, "totalTaxToday")), irmaa: Math.round(sum(e.computeIrmaaPlan(a).rows, "surchargeToday")) }; };
    const e27 = { ...clone(BASE), asOf: "2027-01-15" };
    out.delta = [70000, 250000].map(roth => { const p = tot(gp, EP, e27, roth), c = tot(g, E, e27, roth); return { roth, dTax: c.tax - p.tax, dIrmaa: c.irmaa - p.irmaa }; });
  }
  console.log("T96_MODULE " + JSON.stringify(out));
  process.exit(0);
}

// ══ CHILD MODE (--roth-dump): the Roth tab's ladder card, the example household, as text (§C byte identity) ════════════════════════════
if (DUMP) {
  const D = await domHarness(VER);
  await D.seed(); await D.click([...D.body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await D.flush();
  await D.go("roth"); await D.flush(300);
  const card = [...D.body().querySelectorAll("div.card")].find(c => /ROTH CONVERSION STRATEGY/.test(c.textContent || ""));
  console.log("ROTH_DUMP " + JSON.stringify(card ? sq(card.textContent) : null));
  process.exit(0);
}

console.log(`t96 — THE TABLES INDEX FROM THEIR OWN YEAR (${VER})\n`);
let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t96 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });

// ════ §A · the source, by AST ══════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log("  A — the source, by AST");
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const srcOf = n => SRC.slice(n.start, n.end);
const topDecl = name => { for (const s of AST.body) { if (s.type === "FunctionDeclaration" && s.id && s.id.name === name) return s;
  if (s.type === "VariableDeclaration") for (const d of s.declarations) if (d.id && d.id.name === name) return d; } return null; };
const fnOf = name => { const d = topDecl(name); return d ? (d.type === "FunctionDeclaration" ? d : d.init) : null; };
// a parameter with a default (`baseYr = fedTableYear(yr)`) is an AssignmentPattern: its name is its left side — an optional base year is
// the likeliest way back for D-67, so it must be seen (the build review found A-1 blind to it)
const pname = p => p.type === "Identifier" ? p.name : p.type === "AssignmentPattern" ? pname(p.left) : p.type === "ObjectPattern" ? "{" + p.properties.map(q => q.key.name).join(",") + "}" : p.type;
const params = name => { const f = fnOf(name); return f && f.params ? f.params.map(pname) : null; };
const fnName = anc => { for (let k = anc.length - 1; k >= 0; k--) { const a = anc[k]; if (a.type === "FunctionDeclaration" && a.id) return a.id.name;
  if (a.type === "VariableDeclarator" && a.id && a.id.name && a.init && /Function/.test(a.init.type) && anc[k - 1] && anc[k - 1].type === "VariableDeclaration" && anc[k - 2] && anc[k - 2].type === "Program") return a.id.name; } return "<top>"; };
const HELPERS = ["inflateTaxConst", "inflateWageBase", "seniorExtraFor", "irmaaThresholdFor", "irmaaTierFor"];
const BASE_PARAM = /^base(Yr|Year)$|asof/i;

// A-1 the five helpers' parameters
for (const h of HELPERS) {
  const ps = params(h);
  if (POST) T(`A-1 ${h} takes no base-year parameter — (${(ps || []).join(", ")})`, !!ps && !ps.some(p => BASE_PARAM.test(p)));
  else T(`A-1 ${h} ${KD}: takes a base-year parameter — (${(ps || []).join(", ")})`, !!ps && ps.some(p => BASE_PARAM.test(p)));
}
// A-2 no call to any of them passes an as-of year
const asOfCalls = all(AST, n => n.type === "CallExpression" && n.callee.type === "Identifier" && HELPERS.includes(n.callee.name) && n.arguments.some(a => /asOf/i.test(srcOf(a))));
if (POST) T("A-2 no call to the five helpers passes an as-of year", asOfCalls.length === 0, asOfCalls.map(x => `${fnName(x.anc)}: ${srcOf(x.n).slice(0, 80)}`).join(" | "));
else T(`A-2 ${KD}: 18 calls to the five helpers pass an as-of year`, asOfCalls.length === 18, String(asOfCalls.length));
// A-3 no surcharge is grown by the dollar clock (an as-of factor)
const prodTops = all(AST, (n, anc) => n.type === "BinaryExpression" && n.operator === "*" && !(anc.length && anc[anc.length - 1].type === "BinaryExpression" && anc[anc.length - 1].operator === "*"));
const leaves = n => (n.type === "BinaryExpression" && n.operator === "*") ? [...leaves(n.left), ...leaves(n.right)] : [n];
const surClock = prodTops.filter(x => { const L = leaves(x.n); return L.some(l => /SUR\b|surchargePerPerson/.test(srcOf(l)))
  && L.some(l => l.type === "CallExpression" && l.callee.type === "Identifier" && /^(_kY|_kYL|planDollarFactor)$/.test(l.callee.name)); });
if (POST) T("A-3 no IRMAA surcharge is multiplied by the dollar clock (`_kY` / `planDollarFactor`)", surClock.length === 0, surClock.map(x => srcOf(x.n).slice(0, 90)).join(" | "));
else T(`A-3 ${KD}: three surcharges are grown by the dollar clock from the as-of year`, surClock.length === 3, String(surClock.length));
// A-4 each helper reads its table's own year; the top-tier freeze survives
const callsIn = (name, callee) => { const f = fnOf(name); return f ? all(f, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === callee).length : 0; };
const refsIn = (name, id) => { const f = fnOf(name); return f ? all(f, n => n.type === "Identifier" && n.name === id).length : 0; };
if (POST) {
  T("A-4a inflateTaxConst indexes from `fedTableYear(yr)`", callsIn("inflateTaxConst", "fedTableYear") === 1);
  T("A-4b inflateWageBase indexes from the wage-base table's year", refsIn("inflateWageBase", "WAGE_BASE_TABLES") === 1 && callsIn("inflateWageBase", "heldTableYear") === 1);
  T("A-4c seniorExtraFor reads `fedTableFor(yr)`", callsIn("seniorExtraFor", "fedTableFor") >= 1 && refsIn("seniorExtraFor", "TAX_CONSTS") === 0);
  T("A-4d irmaaThresholdFor indexes tiers 1–4 from `irmaaTableYear(premiumYr)`", /: premiumYr - irmaaTableYear\(premiumYr\);/.test(srcOf(fnOf("irmaaThresholdFor"))));
  T("A-4e irmaaTierFor places against `irmaaThresholdFor` with three arguments", (() => { const f = fnOf("irmaaTierFor"); const c = f ? all(f, n => n.type === "CallExpression" && n.callee.name === "irmaaThresholdFor") : [];
    return c.length === 1 && c[0].n.arguments.length === 3; })());
  T("A-4f irmaaSurchargeFor reads the premium year's table and grows from its year", callsIn("irmaaSurchargeFor", "irmaaTableFor") === 1 && callsIn("irmaaSurchargeFor", "irmaaTableYear") === 1);
  T("A-4g acaApplicablePct reads the coverage year's table", callsIn("acaApplicablePct", "acaTableYear") === 1 && !/tableCurrent2026/.test(srcOf(fnOf("acaApplicablePct"))));
  T("A-4h the four indexers deflate before the oldest table (no `Math.max(0, …)` on their exponent; DT-2 revised); only the top tier's freeze clamps",
    ["inflateTaxConst", "inflateWageBase", "irmaaSurchargeFor"].every(h => !/Math\.max\(0, /.test(srcOf(fnOf(h))))
    && (srcOf(fnOf("irmaaThresholdFor")).match(/Math\.max\(0, /g) || []).length === 1);
}
T("A-4i the top tier's freeze is still a carve-out inside irmaaThresholdFor (`TOP_TIER_FROZEN_THROUGH`)", refsIn("irmaaThresholdFor", "TOP_TIER_FROZEN_THROUGH") === 1);
if (POST) T("A-4j the top tier indexes from the later of the freeze and its own table's year (a table for 2028 on is not indexed again from 2027)",
  /Math\.max\(IRMAA_CONSTS\.TOP_TIER_FROZEN_THROUGH, irmaaTableYear\(premiumYr\)\)/.test(srcOf(fnOf("irmaaThresholdFor"))));
// A-5 no engine reads an indexed figure from the 2026 table directly
const INDEXED = /^(SGL_STD|MFJ_STD|SGL_BR|MFJ_BR|SGL_LTCG|MFJ_LTCG|SGL_AMT_EXEMPT|MFJ_AMT_EXEMPT|SGL_AMT_PHASE|MFJ_AMT_PHASE|AMT_28_BREAK|SENIOR_EXTRA_SGL|SENIOR_EXTRA_MFJ|QCD_LIMIT|LIMIT_402G|SS_WAGE_BASE)$/;
const ENGINES = ["runRothStrategies", "computeIrmaaPlan", "computeTaxPlan", "computeWithdrawalPlan", "projectBracketsAt", "seniorExtraFor", "payrollTax", "taxFactsFor"];
const directReads = (fns) => { const hits = []; for (const fn of fns) { const f = fnOf(fn); if (!f) continue;
  for (const x of all(f, n => n.type === "MemberExpression" && n.object.type === "Identifier" && !n.computed &&
    ((n.object.name === "TAX_CONSTS" && INDEXED.test(n.property.name)) || (n.object.name === "IRMAA_CONSTS" && /^(SGL|MFJ|SUR)$/.test(n.property.name))))) hits.push(`${fn}: ${srcOf(x.n)}`);
  // a destructuring of the table that takes an indexed key, or an alias of it read for one (`const T = TAX_CONSTS; … T.SGL_STD`)
  for (const x of all(f, n => n.type === "VariableDeclarator" && n.init && n.init.type === "Identifier" && /^(TAX_CONSTS|IRMAA_CONSTS)$/.test(n.init.name))) {
    const id = x.n.id, isTax = x.n.init.name === "TAX_CONSTS", idx = k => isTax ? INDEXED.test(k) : /^(SGL|MFJ|SUR)$/.test(k);
    if (id.type === "ObjectPattern") { const ks = id.properties.map(q => q.key && q.key.name).filter(k => k && idx(k)); if (ks.length) hits.push(`${fn}: destructures ${ks.join(", ")}`); }
    else if (id.type === "Identifier") for (const y of all(f, n => n.type === "MemberExpression" && n.object.type === "Identifier" && n.object.name === id.name && !n.computed && idx(n.property.name)))
      hits.push(`${fn}: ${id.name} = ${x.n.init.name}; ${srcOf(y.n)}`); } }
  return hits; };
function n0(n) { return srcOf(n).slice(0, 60); }
const dr = directReads(ENGINES);
if (POST) T("A-5 no engine reads an indexed figure from the 2026 table (`TAX_CONSTS`, `IRMAA_CONSTS`) directly", dr.length === 0, dr.join(" | "));
else T(`A-5 ${KD}: the engines read the 2026 table directly (47 reads, measured at the v6.33 build)`, dr.length === 47, `${dr.length}: ${dr.slice(0, 6).join(" | ")}`);
// A-6 the component's remaining direct reads are the display set (labels of the 2026 table), and nothing else
if (POST) {
  const comp = []; for (const fn of ["DangerCloseMain", "MyDataEditor"]) { const f = fnOf(fn); if (!f) continue;
    for (const x of all(f, n => n.type === "MemberExpression" && n.object.type === "Identifier" && !n.computed &&
      ((n.object.name === "TAX_CONSTS" && INDEXED.test(n.property.name)) || (n.object.name === "IRMAA_CONSTS" && /^(SGL|MFJ|SUR)$/.test(n.property.name))))) comp.push(`${n0(x.n)}`); }
  const want = ["TAX_CONSTS.SGL_STD", "TAX_CONSTS.MFJ_STD", "IRMAA_CONSTS.SGL", "IRMAA_CONSTS.MFJ", "TAX_CONSTS.QCD_LIMIT",
    "TAX_CONSTS.LIMIT_402G", "TAX_CONSTS.LIMIT_402G", "TAX_CONSTS.LIMIT_402G"].sort();
  T("A-6 the component reads the 2026 table directly only for its labels (the Roth tab's rules note, its IRMAA headline, the QCD slider, My Data's §402(g) note)",
    JSON.stringify(comp.sort()) === JSON.stringify(want), comp.join(", "));
}
// A-7 TAX_CONSTANTS_YEAR is read from the table (DT-8 (a))
{ const d = topDecl("TAX_CONSTANTS_YEAR"); const init = d && d.init;
  if (POST) T("A-7 TAX_CONSTANTS_YEAR is the newest federal table's year, read from `FED_TABLES`", !!init && init.type !== "Literal" && /FED_TABLES/.test(srcOf(init)), init && srcOf(init));
  else T(`A-7 ${KD}: TAX_CONSTANTS_YEAR is a typed 2026`, !!init && init.type === "Literal" && init.value === 2026); }
// A-8 the ACA applicable-percentage table is keyed by coverage year (DT-3 (a))
{ const d = topDecl("ACA_CONSTS"); const keys = d && d.init && d.init.type === "ObjectExpression" ? d.init.properties.map(p => p.key && (p.key.name || p.key.value)) : [];
  if (POST) T("A-8 ACA_CONSTS holds `tableCurrentByCoverageYear` (no `tableCurrent2026`) and acaApplicablePct takes the coverage year",
    keys.includes("tableCurrentByCoverageYear") && !keys.includes("tableCurrent2026") && (params("acaApplicablePct") || []).length === 3, keys.join(","));
  else T(`A-8 ${KD}: one ACA table, \`tableCurrent2026\`, for every coverage year`, keys.includes("tableCurrent2026") && (params("acaApplicablePct") || []).length === 2); }
// A-9 the Taxes tab's panel iterates the selected year's own table (F-28)
{ const loops = all(fnOf("DangerCloseMain"), n => n.type === "ForOfStatement" && /inflate\(b\.upper, sel\.yr\)/.test(srcOf(n.body)));
  const rhs = loops.map(x => srcOf(x.n.right));
  if (POST) T("A-9 the bracket panel iterates `taxFactsFor(sel.filingSingle, sel.yr).br`", rhs.length === 1 && rhs[0] === "taxFactsFor(sel.filingSingle, sel.yr).br", rhs.join(" | "));
  else T(`A-9 ${KP}: the bracket panel iterates Engine B's \`brackets2026\``, rhs.length === 1 && rhs[0] === "brackets2026", rhs.join(" | ")); }

// ════ the module facts (child process) ══════════════════════════════════════════════════════════════════════════════════════════════════
const ch = spawnSync(process.execPath, [fileURLToPath(import.meta.url), VER, "--module"], { cwd: HERE, encoding: "utf8", maxBuffer: 1 << 28, timeout: 600000 });
const line = (ch.stdout || "").split("\n").find(l => l.startsWith("T96_MODULE "));
T("0-1 SETUP the module child ran and reported", !!line, (ch.stderr || "").slice(-300) || (ch.stdout || "").slice(-300));
const MD = line ? JSON.parse(line.slice(11)) : null;
if (!MD) { finished = true; console.log(`\nt96 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(1); }
const I = MD.i;

// ════ §B · the extinction invariant ═════════════════════════════════════════════════════════════════════════════════════════════════════
console.log("  B — one household dated 2025, 2026, 2027 and 2028: every published figure the same");
{
  const R = MD.B, ref = R["2026-04-18"];
  T("B-0 SETUP the four runs carry the four as-of years, single, and the household reaches every figure (a 65+ extra, wage-base work, a QCD at its cap, gains, IRMAA years)",
    ASOFS.map(a => R[a].asOf).join() === "2025,2026,2027,2028" && ASOFS.every(a => R[a].single)
    && ref.B.some(r => r[2] > 0) && ref.B.some(r => r[6] > 0) && ref.B.some(r => r[7] > 0) && ref.B.some(r => r[4] > 0) && ref.C.some(r => r[3] > 0));
  const same = (sel) => ASOFS.every(a => JSON.stringify(sel(R[a])) === JSON.stringify(sel(ref)));
  const diff27 = (sel) => JSON.stringify(sel(R["2027-01-15"])) !== JSON.stringify(sel(ref));
  const parts = [
    ["Engine B's standard deduction and §63(f) extra, year by year", r => r.B.map(x => [x[0], x[1], x[2]])],
    ["Engine B's ordinary tax and bracket (the bracket tops)", r => r.B.map(x => [x[0], x[3], x[8]])],
    ["Engine B's LTCG tax on fixed gains (the LTCG breakpoints)", r => r.B.map(x => [x[0], x[4]])],
    ["Engine B's payroll tax on fixed wages above the base (the wage base)", r => r.B.map(x => [x[0], x[6]])],
    ["Engine B's QCD at its cap", r => r.B.map(x => [x[0], x[7]])],
    ["Engine B's AMT (the exemption, its phase-out start, the 28% break)", r => r.B.map(x => [x[0], x[5]])],
    ["Engine B's total tax", r => r.B.map(x => [x[0], x[9]])],
    ["Engine C's tier, surcharge and headroom (the thresholds and surcharges)", r => r.C],
    ["Engine A's six strategies: total tax, conversions, IRMAA, NIIT", r => r.A],
  ];
  for (const [lab, sel] of parts) {
    if (POST) T(`B-1 ${lab}: the same in all four runs`, same(sel));
    else T(`B-1 ${lab} ${KD}: dated 2027, it moves`, diff27(sel));
  }
  T("B-2 SETUP every run reaches AMT in 2032 (the gains phase the exemption out), so the AMT figures are read", ASOFS.every(a => R[a].B.some(x => x[0] === 2032 && x[5] > 0)));
  // projectBracketsAt
  const pb = MD.PB, p26 = JSON.stringify(pb[2026]);
  if (POST) T("B-3 projectBracketsAt(2030): deduction, brackets and IRMAA threshold the same whatever as-of year a caller passes (it reads none)", [2025, 2027, 2028].every(y => JSON.stringify(pb[y]) === p26));
  else T(`B-3 projectBracketsAt(2030) ${KD}: each as-of year gives different figures (2030 standard deduction ${pb[2025].std} / ${pb[2026].std} / ${pb[2027].std} / ${pb[2028].std})`,
    new Set([2025, 2026, 2027, 2028].map(y => JSON.stringify(pb[y]))).size === 4);
  // the tier-placement case
  const tc = MD.tierCase, tr = tc.runs;
  T("B-4 SETUP the case's MAGI sits in the gap: above 109,000 × (1+i)^4, below × (1+i)^5, in every run's 2029 row (premium year 2031)",
    ASOFS.every(a => tr[a].irmaaYr === 2031 && Math.abs(tr[a].magi - tc.M) <= 1) && tc.M > tc.lo && tc.M < tc.hi, `${tc.lo.toFixed(0)} < ${tc.M} < ${tc.hi.toFixed(0)}`);
  if (POST) {
    T("B-5 Engine C places it in the standard tier in all four runs (the threshold is the table's, indexed from 2026)", ASOFS.every(a => tr[a].tier === 0), ASOFS.map(a => tr[a].tier).join());
    T("B-6 Engine A bills the same IRMAA in all four runs", ASOFS.every(a => tr[a].totIrmaaA === tr["2026-04-18"].totIrmaaA), ASOFS.map(a => tr[a].totIrmaaA).join());
  } else {
    T(`B-5 Engine C ${KD}: dated 2026 it is standard; dated 2027 and 2028 it is tier 1`, tr["2026-04-18"].tier === 0 && tr["2027-01-15"].tier === 1 && tr["2028-01-15"].tier === 1, ASOFS.map(a => tr[a].tier).join());
    T(`B-6 Engine A ${KD}: dated 2027 it bills more IRMAA than dated 2026`, tr["2027-01-15"].totIrmaaA > tr["2026-04-18"].totIrmaaA, `${tr["2026-04-18"].totIrmaaA} → ${tr["2027-01-15"].totIrmaaA}`);
  }
  // the helpers (v6.33 shapes)
  if (POST) {
    const H = MD.H;
    T("B-7 heldTableYear, on tables {2026, 2027}: 2020 → 2026 (the oldest), 2026 → 2026, 2027 → 2027, 2030 → 2027 (the newest)", H.held.join() === "2026,2026,2027,2027", H.held.join());
    T("B-8 a year before every table reads the oldest, deflated from its year (DT-2 revised): 2025 = 2026's ÷ (1 + rate) — the bracket family at i − 0.25, the wage base and an IRMAA tier at i",
      H.fty2025 === 2026 && Math.abs(H.itc2025 - H.itc2025x) < 1e-9 && H.itc2026 === 100000 && Math.abs(H.wb2025 - H.wb2025x) < 1e-9 && H.wb2026 === 184500
      && Math.abs(H.thr2025 - H.thr2025x) < 1e-9, `${H.itc2025} / ${H.wb2025} / ${H.thr2025}`);
    T("B-9 the wage base in 2030 is $184,500 × (1+i)^4 — from the table's year, at CPI-U (typed here)", Math.abs(H.wb2030 - H.wb2030x) < 1e-6, `${H.wb2030} vs ${H.wb2030x}`);
    T("B-10 TAX_CONSTANTS_YEAR is 2026, the newest federal table; a 2040 row reads the 2026 table", H.ty === 2026 && H.fty2040 === 2026);
    T("B-11 taxFactsFor without a year gives the statutory facts only — no deduction, no brackets", H.yearless.std === undefined && H.yearless.br === undefined && H.yearless.niit === 250000 && H.yearless.ssThr1 === 32000);
    T("B-12 taxFactsFor with a year gives that year's table and its year", H.withYr.tableYear === 2026 && H.withYr.std === 32200 && H.withYr.amt28 === 244500);
    T("B-13 a stale six-argument seniorExtraFor call throws on a single return (its base year lands in `filerIsA`)", H.throwsSE);
    T("B-14 acaApplicablePct without a coverage year throws", H.throwsACA);
    T("B-15 irmaaSurchargeFor: tier 2, one person, 2026 = $2,880; two people in 2030 = $5,760 × (1+i)^4; a tier past the table clamps to the top", H.sur[0] === 2880 && Math.abs(H.sur[1] - H.sur[2]) < 1e-9 && H.sur[3] === 6940, H.sur.join());
    T("B-16 the top tier is $500,000 in premium years 2025 and 2027 (frozen through 2027 — BBA-2018 §53114)", H.topFrozen.join() === "500000,500000", H.topFrozen.join());
  }
}

// ════ §D · the moves, against the statute oracle ═════════════════════════════════════════════════════════════════════════════════════
console.log("  D — a household dated 2027 against the federal oracle (base year typed: the table's)");
{
  const D = MD.D;
  T("D-0 SETUP the household is dated 2027", D.asOf === 2027);
  for (const r of D.rows) {
    if (POST) {
      T(`D-1 ${r.yr}: ordinary tax equals the oracle on the 2026 table indexed from 2026, to the cent ($${r.fed.toFixed(2)})`, Math.abs(r.fed - r.o26.fed) < 0.005, `engine ${r.fed}, oracle ${r.o26.fed}`);
      T(`D-2 ${r.yr}: the deduction equals the oracle's`, r.ded === r.o26.ded, `${r.ded} vs ${r.o26.ded}`);
      if (r.yr === 2032) T(`D-3 ${r.yr}: LTCG tax equals the oracle's, to the cent`, Math.abs(r.cg - r.o26.cg) < 0.005, `engine ${r.cg}, oracle ${r.o26.cg}`);
    } else {
      T(`D-1 ${r.yr} ${KD}: ordinary tax equals the oracle indexed from the AS-OF year (2027), not from the table's`, Math.abs(r.fed - r.o27.fed) < 0.005 && Math.abs(r.fed - r.o26.fed) > 1, `engine ${r.fed}, base 2027 ${r.o27.fed}, base 2026 ${r.o26.fed}`);
    }
  }
  if (POST && MD.delta) {
    const d = MD.delta;
    T("D-4 MEASURED at the build (not independent; the tabs' opening view): the example dated 2027, lifetime tax in today's dollars −$4,109 at $70K and −$3,306 at $250K",
      d[0].dTax === -4109 && d[1].dTax === -3306, JSON.stringify(d));
    T("D-5 MEASURED at the build: its IRMAA in today's dollars $0 at $70K and +$600 at $250K (the surcharges now grow from 2026, the thresholds too)",
      d[0].dIrmaa === 0 && d[1].dIrmaa === 600, JSON.stringify(d));
  }
}

// ════ §C · nothing moves for a plan dated 2026 ════════════════════════════════════════════════════════════════════════════════════════
if (POST) {
  if (!MD.C) console.log(`  C — skipped: this run folder has no app_${PRIOR_TAG}.mjs (a later release's run folder, which holds only its own two legs — v6.35: the line said ${VER} "is the prior leg" whichever leg ran)`);
  else {
    console.log(`  C — ${PRIOR_TAG} → ${VER}, plans dated 2026: bit-identical`);
    for (const c of MD.C) T(`C-1 ${c.lab}: Engines A–D, the bridge, the Monte Carlo's schedule, both seeded Monte Carlo engines and projectBracketsAt (2026–2060) — byte-identical JSON`,
      c.same, `first difference at character ${c.at} of ${c.len}`);
    T(`C-2 the Verify tab's ${MD.Cv.n} checks: the same actual values, all green`, MD.Cv.same && MD.Cv.allPass);
    // the rendered Roth ladder, byte for byte (each leg's bundle in its own process)
    const dump = tag => { const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), tag, "--roth-dump"], { cwd: HERE, encoding: "utf8", maxBuffer: 1 << 26, timeout: 600000 });
      const l = (r.stdout || "").split("\n").find(x => x.startsWith("ROTH_DUMP ")); return l ? JSON.parse(l.slice(10)) : null; };
    if (existsSync(join(HERE, `dom_${PRIOR_TAG}.cjs`))) {
      const a = dump(PRIOR_TAG), b = dump(VER);
      T("C-3 the Roth tab's ladder card on the example — byte-identical text", !!a && a === b, a && b ? `first difference at ${[...a].findIndex((x, j) => x !== b[j])}` : "a dump failed");
    } else console.log(`    (C-3 skipped: no dom_${PRIOR_TAG}.cjs)`);
  }
}

// ════ §E (module) · the Events notice ═══════════════════════════════════════════════════════════════════════════════════════════════
console.log("  E — copy");
{
  const E = MD.E;
  T("E-1 the Events tab's tax notice, all families in one year: unchanged lead sentence and title", E.title === "Tax figures in this copy (2026)" && E.ins.startsWith("This copy's federal tax and Medicare (IRMAA) figures are for 2026. Each year's"), E.ins);
  if (POST) {
    T("E-2 a wage-base table one year ahead (the SSA publishes before the IRS) is named, and the strip still keys on the federal year",
      E.differ.startsWith("This copy's federal tax figures are for 2026; its Medicare (IRMAA) figures for 2026, Social Security wage base for 2027, ACA applicable percentages for 2026.")
      && E.differTitle === "Tax figures in this copy (2026)", E.differ);
    T("E-3 …and removed again, the sentence is restored", E.restored === E.ins);
  }
}
if (POST) {
  const MDOC = existsSync(join(HERE, "..", "METHODOLOGY.md")) ? readFileSync(join(HERE, "..", "METHODOLOGY.md"), "utf8") : "";
  T("E-4 METHODOLOGY has the section \"The tables index from their own year (v6.33)\"", /^## The tables index from their own year \(v6\.33\)$/m.test(MDOC));
  T("E-5 METHODOLOGY's one-clock passage says the clock is for dollars, not for published tables", /one clock is for dollars, not for the published tables/i.test(sq(MDOC)));
  const DOCS = String((await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href)).__g.DOCS_HTML());
  T("E-6 Field Manual §13 carries the v6.33 entry", DOCS.includes("<li><strong>Each published tax table indexes from its own year (v6.33).</strong>"));
  T("E-7 Field Manual §6: each indexed figure grows from the year its table was published for, never from the plan's date", DOCS.includes("never from the date your plan carries (v6.33)"));
}

// ════ the DOM ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const D = await domHarness(VER);
const examplePortfolio = async () => { await D.seed(); await D.click([...D.body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await D.flush(); return clone(D.DG.PORTFOLIO()); };
const EXP = await examplePortfolio();
const EXE = clone(D.DG.EXPENSES());
const seedPlan = async P => { await D.seed(P, EXE); for (let i = 0; i < 3; i++) await D.flush(); return D.DG.PLAN_TIMELINE(); };

// ── §B2 · the Roth tab's IRMAA lookback calendar (component-inline: the rendered text, ±$500) ───────────────────────────────────────────
console.log("  B2 — the Roth tab's IRMAA calendar, dated 2026 and 2027");
{
  const thr = async asOf => { const tl = await seedPlan({ ...clone(EXP), asOf }); await D.go("roth"); await D.flush(300);
    const t = D.txt(); const i0 = t.indexOf("IRMAA lookback calendar"); const seg = i0 < 0 ? "" : t.slice(i0, i0 + 4000);
    const cells = [...seg.matchAll(/Convert\s*(\d{4})\s*IRMAA hit\s*(\d{4})\s*MAGI \$(-?\d+)K\s*Thr \$(\d+)K/g)].map(m => ({ yr: +m[1], prem: +m[2], thr: +m[4] }));
    return { tl, cells }; };
  const a = await thr("2026-04-18"), b = await thr("2027-01-15");
  T("B2-0 SETUP both renders carry the calendar, for the same conversion years, dated 2026 and 2027", a.cells.length > 0 && JSON.stringify(a.cells.map(c => c.yr)) === JSON.stringify(b.cells.map(c => c.yr))
    && a.tl.asOfYear === 2026 && b.tl.asOfYear === 2027, `${a.cells.length} / ${b.cells.length}`);
  const i = planI(D.DG.SCENARIOS()), d1 = Math.min(a.tl.dobA.year + a.tl.lifeExpA, a.tl.dobB.year + a.tl.lifeExpB);
  const joint = a.cells.filter(c => c.yr <= d1);
  if (POST) {
    T("B2-1 dated 2027, every column's threshold is the one dated 2026", JSON.stringify(a.cells) === JSON.stringify(b.cells), JSON.stringify(b.cells.slice(0, 3)));
    T("B2-2 each joint year's threshold is $218,000 × (1+i)^(premium year − 2026), to the $K shown (typed: CMS 2026, MFJ tier 1)",
      joint.length > 0 && joint.every(c => Math.abs(c.thr - Math.round(Math.round(218000 * Math.pow(1 + i, c.prem - 2026)) / 1000)) <= 1), JSON.stringify(joint.slice(0, 3)));
  } else {
    T(`B2-1 ${KD}: dated 2027, every column's threshold is lower than dated 2026 (one year of indexing short)`, a.cells.length > 0 && a.cells.every((c, k) => b.cells[k] && b.cells[k].thr < c.thr),
      `${JSON.stringify(a.cells.slice(0, 2))} vs ${JSON.stringify(b.cells.slice(0, 2))}`);
  }
}

// ── §E (rendered) · the Taxes tab's sentence on a plan dated 2027 ──────────────────────────────────────────────────────────────────────
{
  await seedPlan({ ...clone(EXP), asOf: "2027-01-15" }); await D.go("taxes"); await D.flush(300);
  const t = D.txt();
  if (POST) T("E-8 the Taxes tab, dated 2027: the indexed figures are the published ones (2026) and grow from the 2026 figures — never \"from 2027\"",
    t.includes("are the IRS's published figures for each year it has published (2026) and, after 2026, grow from the 2026 figures (a row before 2026 deflates them) — from the year they were published for, whatever date the plan carries — at the chained-CPI rate")
    && !/grow from 2027/.test(t));
  else T(`E-8 ${KD}: the Taxes tab, dated 2027, says the figures "grow from 2027"`, /indexed figures grow from 2027 at the chained-CPI rate/.test(t));
}

// ── §F · the Taxes tab's bracket panel (F-28), the example ───────────────────────────────────────────────────────────────────────────
console.log("  F — the Taxes tab's bracket-by-bracket panel");
{
  await seedPlan(EXP); await D.go("taxes"); await D.flush(300);
  const t = D.txt(), F = MD.F;
  const head = `NET TAXABLE INCOME BY FEDERAL BRACKET — ${F.yr}`; const i0 = t.indexOf(head), i1 = t.indexOf("Estimates only", i0);
  const seg = i0 < 0 ? "" : t.slice(i0 + head.length, i1 < 0 ? i0 + 2000 : i1);
  const segs = [...seg.matchAll(/(\d+)%\s*\$(\d+)K\s*tax \$(\d+)K/g)].map(m => ({ rate: +m[1], k: +m[2] }));
  T(`F-0 SETUP the panel renders for ${F.yr}, a joint year, whose engine bracket is ${F.bracket}%`, segs.length > 0 && F.filingSingle === false, seg.slice(0, 200));
  const top = segs.length ? segs[segs.length - 1].rate : null;
  if (POST) {
    T(`F-1 the panel's last filled bracket is the engine's own (${F.bracket}%)`, top === F.bracket, `panel ${top}%`);
    T("F-2 its slices add to the row's taxable ordinary income (each shown to the $K)", Math.abs(segs.reduce((s, x) => s + x.k, 0) - F.taxableOrdinary / 1000) <= segs.length, `${segs.map(x => x.k).join("+")} vs ${(F.taxableOrdinary / 1000).toFixed(1)}`);
  } else T(`F-1 ${KP}: the panel's last filled bracket is above the engine's ${F.bracket}% (Single bounds on a joint year)`, top > F.bracket, `panel ${top}%`);
  // F-3 — the Roth tab's BRACKET UTILIZATION bar, the same class (found by the build review): its segment widths are (bracket span ÷ $300,000)
  // × 500 px. Typed here: the 2026 joint tops $24,800 / $100,800 / $211,400 / $403,550 (Rev. Proc. 2025-32 §2.01), indexed to the bar's
  // year at i − 0.25 (the C-CPI-U rate; CBO's 0.25-point gap) and rounded as the projection rounds.
  await D.go("roth"); await D.flush(300);
  const hd = [...D.body().querySelectorAll("div")].find(x => /^BRACKET UTILIZATION — \d{4}$/.test((x.textContent || "").trim()));
  const yr = hd ? +hd.textContent.trim().slice(-4) : null, bar = hd && hd.nextElementSibling;
  const w = bar ? [...bar.children].slice(0, 4).map(c => parseFloat(c.firstElementChild && c.firstElementChild.style.width)) : [];
  const ii = planI(D.DG.SCENARIOS()), f = Math.pow(1 + ii - 0.0025, (yr || 0) - 2026);
  const tops = (k) => [24800, 100800, 211400, 403550].map(u => Math.round(u * k));
  const px = T4 => [T4[0], T4[1] - T4[0], T4[2] - T4[1], T4[3] - T4[2]].map(m => Math.max(2, (m / 300000) * 500));
  const near = (a, b) => a.length === 4 && a.every((x, k) => Math.abs(x - b[k]) < 0.01);
  T("F-3 SETUP the Roth tab's bracket bar renders, for a joint year after 2026", !!hd && w.length === 4 && yr > 2026, hd ? hd.textContent : "no heading");
  if (POST) T(`F-3 the bracket bar's segments are ${yr}'s brackets (indexed), the year whose income it draws`, near(w, px(tops(f))), `${w.map(x => x.toFixed(2))} vs ${px(tops(f)).map(x => x.toFixed(2))}`);
  else T(`F-3 ${KP}: the bracket bar's segments are the 2026 table unindexed, against ${yr}'s income`, near(w, px(tops(1))), w.map(x => x.toFixed(2)).join());
}

// ════ the DOM harness (t95's) ═════════════════════════════════════════════════════════════════════════════════════════════════════
async function domHarness(tag) {
  const PREFIX = "dc:";
  window.confirm = () => true;
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
  };
  const grab = () => "blob:t96"; window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
  dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;
  require(`./dom_${tag}.cjs`);
  const React = require("react");
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  const txt = () => { const c = body().cloneNode(true); c.querySelectorAll("style,script").forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " "); };
  const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  let root = null, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
  const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
  const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); await flush(); await flush(); };
  const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
  const seed = async (portfolio, expenses, extra) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
    if (expenses !== undefined) put("expenses", expenses); if (extra) extra(); await render(); };
  const waitFor = async (pred, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (pred()) return true; await flush(400); } return false; };
  return { DG, body, txt, btn, go, seed, flush, click, waitFor, unmount, el: () => el, act: () => act };
}

finished = true;
console.log(`\nt96 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
