// t83 — THE MONTE CARLO PAYS THE TAXES TAB'S TAX, AND CHARGES ONE-TIME EXPENSES IN THE QUARTER THEY FALL (v6.20 — D-40, D-44, D-45)
// Run: node t83_mc_tax.mjs v620   |   node t83_mc_tax.mjs v619
//
// THE DEFECTS THIS EXISTS FOR (docs/SCOPE_D40_MC_TAX_V620.md). Through v6.19 the only income tax either Monte Carlo engine charged was
// ROTH_TAX_DRAG_Q — a flat, never-inflated $4,000 a quarter during the conversion ladder, whatever the plan converted or owed, and nothing
// after it (D-40). Both engines read the expense table at each quarter's last month, so a one-time row dated in any other month was never
// charged (D-45) and one that was charged was charged in today's dollars beside inflated monthly rows (D-44, the Monte Carlo half); monthly
// rows that start or end inside a quarter were counted for whole quarters. From v6.20: one schedule — the Taxes tab's totalTax, year by
// year, at the live conversion slider, QCD and dividend yield (mcIncomeTaxSchedule) — paid in every retirement quarter and grown with each
// path's inflation (DC-1..DC-4 (a)); one quarter read (mcQuarterSeries) that sums the quarter's counted months for one-time rows (inflated)
// and averages them for monthly rows (DC-6 (a)).
//
// GATED PER LEG (OPERATIONS §B2). The v6.19 leg pins the old behaviour as dated [KNOWN DEFECT] checks where it is observable from outside
// (the flat drag, an April row never charged, a June row charged uninflated, the Income card's $4K). §H's oracle differential and §R's
// attribution build an ORACLE MODULE from the v6.19 source with ROTH_TAX_DRAG_Q = 0 (the t80 §A builder) and need both legs' modules
// (the current leg only; printed skip otherwise).
import { createRequire } from "module";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { execFileSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(83); Math.random = () => _src();   // installed BEFORE the app loads: d3 captures Math.random at load
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v620";
const KNOWN_VERSIONS = ["v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628"].includes(VER);   // an array, so the next registration widens it
const POST_D49 = ["v623", "v624", "v625", "v626", "v627", "v628"].includes(VER);   // v6.23 (D-49): the Field Manual's Monte Carlo sentence on the built-in work (I-8). An array, so the registrar widens it
// The differential's pair — constants, NOT `VER === "v620"`, so the registrar cannot widen them (t76 records why).
const D_PRIOR = "v619", D_CUR = "v620";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = M.__g, E = M.__engines;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
const JP = Parser.extend(jsx());
const W = Object.assign({}, walk.base, {
  JSXElement(n, st, c) { c(n.openingElement, st); (n.children || []).forEach(x => c(x, st)); },
  JSXFragment(n, st, c) { (n.children || []).forEach(x => c(x, st)); },
  JSXOpeningElement(n, st, c) { (n.attributes || []).forEach(a => c(a, st)); }, JSXClosingElement() {},
  JSXAttribute(n, st, c) { if (n.value) c(n.value, st); }, JSXSpreadAttribute(n, st, c) { c(n.argument, st); },
  JSXExpressionContainer(n, st, c) { c(n.expression, st); }, JSXEmptyExpression() {}, JSXText() {},
  JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {} });
const AST = JP.parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t83 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const KD = "[KNOWN DEFECT 2026-10-18, D-40/D-44/D-45 — flips at v6.20]";
console.log(`t83 — THE MONTE CARLO PAYS THE TAXES TAB'S TAX (${VER})\n`);

// BEFORE anything applies a preset: what SCENARIOS holds when the module loads (the schedule's default preset must match it, §A)
const LOAD_PROBS = Object.fromEntries(Object.entries(g.SCENARIOS()).map(([k, v]) => [k, v.prob]));

const BASE = clone(g.PORTFOLIO()), EX = clone(g.EXPENSES());
const load = (P, X = EX) => { g.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); return g.PLAN_TIMELINE(); };
const preset = (G, k) => G.applyScenarioProbs(G.PROB_PRESETS()[k].probs);
const TL0 = load(BASE);
const RY0 = TL0.targetRetireYear;
const ymd = o => `${o.year}-${String(o.month).padStart(2, "0")}-${String(o.day || 1).padStart(2, "0")}`;
const sh = (d, n) => String(d).replace(/^(\d{4})/, y => String(+y + n));
const shifted = n => {
  const p = clone(BASE);
  p.dobA = ymd({ ...TL0.dobA, year: TL0.dobA.year + n }); p.dobB = ymd({ ...TL0.dobB, year: TL0.dobB.year + n });
  p.retireYear = TL0.targetRetireYear + n; p.retireYearB = TL0.targetRetireYearB + n; p.lifeExpA = TL0.lifeExpA; p.lifeExpB = TL0.lifeExpB;
  return { p, ex: EX.map(e => ({ ...e, start: sh(e.start, n), end: String(e.end).startsWith("2070") ? e.end : sh(e.end, n) })) };
};
const withAsOf = (P, asOf) => ({ ...clone(P), asOf });
const GA = P => ({ ...clone(P), stateCode: "GA", _stateFromForm: true });
const BASE_GROWTH = (() => { const m = SRC.match(/const BASE_GROWTH = ([0-9.]+);/); return m ? +m[1] : NaN; })();
const ONE_TIME = (d, amt = 10000, name = "t83 probe") => ({ name, amount: amt, freq: "once", start: d, end: d, category: "Other" });

// ── the independent quarter oracle (from dates; no app formula) ──────────────────────────────────────────────────────────────────────
// Quarter 0 is the calendar quarter containing the as-of date; quarter q its q-th successor. In quarter 0 only the months from the as-of
// month count. retireQ: the quarter containing 1 January of the retirement year.
const oQ = (asOf, q) => {
  const aq = Math.floor((asOf.month - 1) / 3), cq = q + aq, yr = asOf.year + Math.floor(cq / 4), firstM = (cq % 4) * 3 + 1;
  const fromM = q === 0 ? asOf.month : firstM;
  return { yr, firstM, fromM, fq: (firstM + 3 - fromM) / 3 };
};
const oRetireQ = (asOf, RY) => (RY - asOf.year) * 4 - Math.floor((asOf.month - 1) / 3);
const oInfl = (asOf, n, ei) => { const a = []; let x = 1; for (let q = 0; q < n; q++) { x *= 1 + ei / 4 * oQ(asOf, q).fq; a.push(x); } return a; };   // after quarter q's step
const oTax = (byYr, yr) => { const ys = Object.keys(byYr).map(Number); if (yr in byYr) return byYr[yr]; return ys.length && yr > Math.max(...ys) ? byYr[Math.max(...ys)] : 0; };
// The planned path's difference when a charge c_q (already × inflator × share) is subtracted in quarter q and grown at BASE_GROWTH after it.
const compounded = (asOf, n, charge) => { const d = [0]; let x = 0; for (let q = 0; q < n; q++) { x = (x + charge(q)) * (1 + BASE_GROWTH / 4 * oQ(asOf, q).fq); d.push(x); } return d; };
const maxRel = (a, b, want) => { let m = 0, at = -1; for (let i = 0; i < want.length; i++) { const e = Math.abs((a[i] - b[i]) - want[i]) / Math.max(1, Math.abs(want[i])); if (e > m) { m = e; at = i; } } return { m, at }; };

// ── the households ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const fx = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
const HH = [["example", { p: clone(BASE), ex: clone(EX) }]];
for (const n of Object.keys(fx.HOUSEHOLDS)) { load(BASE); HH.push([`fixture:${n}`, { p: fx.build(g, n), ex: clone(EX) }]); }
HH.push(["shifted +3", shifted(3)]);
{ const p = clone(BASE); p.single = true; HH.push(["single", { p, ex: clone(EX) }]); }
load(BASE);

// ── §P · what the v6.19 leg pins, and the v6.20 leg must reverse ───────────────────────────────────────────────────────────────────────
console.log("  P — the flat drag, observable on both legs");
if (!POST) {
  T(`P-1 ${KD} the Monte Carlo's only income tax is ROTH_TAX_DRAG_Q, a flat $4,000 a quarter`, g.ROTH_TAX_DRAG_Q() === 4000, String(g.ROTH_TAX_DRAG_Q()));
  T(`P-2 ${KD} no schedule function exists (the Taxes tab's tax never reaches the Monte Carlo)`, g.mcIncomeTaxSchedule === undefined && g.mcQuarterSeries === undefined);
} else T("P-1 the flat drag is gone from the module (ROTH_TAX_DRAG_Q is undefined)", g.ROTH_TAX_DRAG_Q() === undefined);

// ── §A · the schedule is the Taxes tab's ───────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the schedule is the Taxes tab's totalTax, year by year");
if (POST) {
  T("A-0 SCENARIOS holds BASE's weights when the module loads (so the schedule's default preset and the engines' weights agree)",
    Object.keys(g.PROB_PRESETS().base.probs).every(k => Math.abs(LOAD_PROBS[k] - g.PROB_PRESETS().base.probs[k]) < 1e-12), JSON.stringify(LOAD_PROBS));
  let n = 0, bad = [];
  for (const [name, { p, ex }] of HH) {
    for (const pr of ["base", "bull"]) for (const ra of [0, 70000, 150000]) for (const [qcd, ty] of [[0, 2.0], [10000, 3.5]]) {
      if (qcd && (ra !== 70000 || name !== "example")) continue;   // QCD and yield set: on the example at the opening slider
      const t = load(p, ex); preset(g, pr); const RY = t.targetRetireYear;
      const A = { retireYear: RY, rothAmount: ra, qcdAnnual: qcd, taxYield: ty, scenarioPreset: pr };
      const S = g.withdrawalPlanSeries(A), rows = E.computeTaxPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows;
      const sc = g.mcIncomeTaxSchedule(RY, { rothAmount: ra, qcdAnnual: qcd, taxYield: ty, scenarioPreset: pr });
      const ok = rows.length > 0 && Object.keys(sc.byYr).length === rows.length && rows.every(r => sc.byYr[r.yr] === r.totalTax)
        && sc.firstYr === rows[0].yr && sc.lastYr === rows[rows.length - 1].yr && sc.last === rows[rows.length - 1].totalTax;
      n++; if (!ok) bad.push(`${name}/${pr}/${ra}/${qcd}`);
    }
  }
  T(`A-1 on ${HH.length} households × BASE and BULL × sliders $0 / $70K / $150K (and QCD $10,000 with a 3.5% yield on the example): every year's tax equals the Taxes tab's row exactly (${n} schedules)`,
    bad.length === 0 && n >= HH.length * 6, bad.slice(0, 5).join(", "));
  const t = load(BASE); preset(g, "base");
  T("A-2 the default inputs are the Taxes tab's opening values under BASE: { $70,000, $0 QCD, 2.0% yield, \"base\" }",
    JSON.stringify(g.mcIncomeTaxSchedule(t.targetRetireYear)) === JSON.stringify(g.mcIncomeTaxSchedule(t.targetRetireYear, { rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "base" }))
    && /function mcIncomeTaxSchedule\(retireYear, \{ rothAmount = 70000, qcdAnnual = 0, taxYield = 2\.0, scenarioPreset = "base" \} = \{\}\)/.test(SRC));
  const sc = g.mcIncomeTaxSchedule(t.targetRetireYear);
  T("A-3 SETUP: the example's schedule runs 2029–2053 (retirement to the second death at life expectancy) and every row is positive",
    sc.firstYr === 2029 && sc.lastYr === 2053 && Object.values(sc.byYr).every(v => v > 0), `${sc.firstYr}–${sc.lastYr}`);
  T("A-4 a plain { year: tax } map is accepted for opts.taxSchedule (first and last year and the last row derived from it)",
    JSON.stringify(g.mcTaxScheduleOf({ 2030: 5, 2031: 7 })) === JSON.stringify({ byYr: { 2030: 5, 2031: 7 }, firstYr: 2030, lastYr: 2031, last: 7 })
    && JSON.stringify(g.mcTaxScheduleOf({})) === JSON.stringify({ byYr: {}, firstYr: null, lastYr: null, last: 0 }));
  load(BASE);
} else console.log("  A — skipped by design on the v6.19 leg (no schedule exists; P-2 pins that)");

// ── §B · the planned paths, exactly ────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the planned paths move by the compounded tax, exactly");
let HAND = null;
if (POST) {
  const t = load(BASE); preset(g, "base"); const RY = t.targetRetireYear, rq = oRetireQ(t.asOf, RY);
  const S = g.mcIncomeTaxSchedule(RY), ei = g.expectedInflation();
  const run6 = sch => { _src = mulberry(1); return g.runMonteCarlo(RY, 2, { taxSchedule: sch }).plannedPath; };
  const run30 = sch => g.runExtendedMC(RY, 30, 1, { taxSchedule: sch, rng: mulberry(1) }).plannedPath;
  for (const [lab, run, n] of [["runMonteCarlo (24 quarters)", run6, g.RETIRE_OPTIONS()[RY].totalQuarters], ["runExtendedMC (120 quarters)", run30, 120]]) {
    const z = run({}), s = run(S), inf = oInfl(t.asOf, n, ei);
    const want = compounded(t.asOf, n, q => (q >= rq ? oTax(S.byYr, oQ(t.asOf, q).yr) / 4 * inf[q] * oQ(t.asOf, q).fq : 0));
    const floors = s.some(v => v <= 0) || z.some(v => v <= 0);
    const { m, at } = maxRel(z, s, want);
    T(`B-1 ${lab}: with the schedule and with zeros injected, the planned paths differ at every quarter by the compounded tax series (1e-6), and neither floors`,
      z.length === n + 1 && !floors && m < 1e-6 && want[n] > 0, `max rel ${m} at ${at}`);
    T(`B-2 ${lab}: nothing is charged before retirement (the paths agree through the retirement quarter's start, quarter ${rq})`, z.slice(0, rq + 1).every((v, i) => v === s[i]));
  }
  // the hand pin: the example's first two retirement quarters (2029 Q1 and Q2), from the 2029 row and plannedInfl, to the cent
  const z = run6({}), s = run6(S);
  HAND = { row2029: S.byYr[2029], ei, d12: z[rq + 1] - s[rq + 1], d13: z[rq + 2] - s[rq + 2] };
  // Hand-computed at the v6.20 build in exact decimal arithmetic, independently of the engine: BASE's expected inflation is
  // Σ prob × inflation over SCENARIOS = .45×.028 + .20×.02 + .15×.035 + .10×.01 + .07×.065 + .03×0 = 2.74%, so one quarter's step is
  // 1.00685 and twelve full quarters (April 2026 – March 2029) give 1.0853687; growth is 1 + 4.5% / 4 = 1.01125.
  T("B-3 HAND PIN: the example's 2029 row is $20,506.62 (BASE, $70K slider) and BASE's expected inflation 2.74% (the inputs below)",
    Math.abs(S.byYr[2029] - 20506.62) < 0.005 && Math.abs(ei - 0.0274) < 1e-12, `${S.byYr[2029]} / ${ei}`);
  T("B-4 HAND PIN: after 2029 Q1 the planned path is $5,626.91 lower — $20,506.62 / 4 × 1.00685^12 × 1.01125",
    Math.abs(HAND.d12 - 5626.91) < 0.005, HAND.d12.toFixed(4));
  T("B-5 HAND PIN: after 2029 Q2, $11,355.67 lower — ($5,626.91 + $20,506.62 / 4 × 1.00685^13) × 1.01125",
    Math.abs(HAND.d13 - 11355.67) < 0.005, HAND.d13.toFixed(4));
  load(BASE);
} else T("B-0 the v6.19 leg takes no schedule (runMonteCarlo has no options)", !/function runMonteCarlo\(retireYear, iterations = 10000, opts = \{\}\)/.test(SRC));

// ── §C · one-time rows: charged once, in the quarter that contains their month, inflated (D-45 extinction, D-44) ──────────────────────
console.log("  C — a one-time row is charged once, in its own quarter, grown with inflation");
{
  const t = load(BASE); preset(g, "base"); const RY = t.targetRetireYear;
  const FIX = POST ? g.mcIncomeTaxSchedule(RY) : null;   // held fixed: the row would otherwise move Engine D's draws and so the schedule
  const ei = g.expectedInflation();
  const pp6 = (X, asOf) => { load(asOf ? withAsOf(BASE, asOf) : BASE, X); preset(g, "base"); _src = mulberry(1); return g.runMonteCarlo(RY, 2, POST ? { taxSchedule: FIX } : undefined).plannedPath; };
  const pp30 = (X, asOf) => { load(asOf ? withAsOf(BASE, asOf) : BASE, X); preset(g, "base"); return g.runExtendedMC(RY, 30, 1, { rng: mulberry(1), ...(POST ? { taxSchedule: FIX } : {}) }).results[0]; };
  if (POST) {
    const pp30p = (X, asOf) => { load(asOf ? withAsOf(BASE, asOf) : BASE, X); preset(g, "base"); return g.runExtendedMC(RY, 30, 1, { rng: mulberry(1), taxSchedule: FIX }).plannedPath; };
    let bad = [], n = 0;
    for (const yr of [2027, 2030]) for (let m = 1; m <= 12; m++) {
      const d = `${yr}-${String(m).padStart(2, "0")}`;
      for (const [lab, run, nq] of [["6-yr", pp6, g.RETIRE_OPTIONS()[RY].totalQuarters], ["30-yr", pp30p, 120]]) {
        const a = run(EX), b = run([...EX, ONE_TIME(d)]), inf = oInfl(t.asOf, nq, ei);
        const qc = (yr - t.asOf.year) * 4 + Math.floor((m - 1) / 3) - Math.floor((t.asOf.month - 1) / 3);
        if (qc >= nq) continue;
        const want = compounded(t.asOf, nq, q => (q === qc ? 10000 * inf[q] : 0));
        const { m: e } = maxRel(a, b, want); n++;
        if (!(e < 1e-6 && a.slice(0, qc + 1).every((v, i) => v === b[i]))) bad.push(`${lab} ${d}: ${e}`);
      }
    }
    T(`C-1 a $10,000 row in each month of 2027 (before retirement) and of 2030 (retired) is charged once, in the quarter containing its month, × that quarter's planned inflator — exact on both planned paths (${n} cases)`,
      bad.length === 0 && n >= 36, bad.slice(0, 4).join("; "));
    const a = pp6([...EX, ONE_TIME("2030-04")]), b = pp6([...EX, ONE_TIME("2030-05")]), c = pp6([...EX, ONE_TIME("2030-06")]);
    T("C-2 rows dated April, May and June 2030 charge identically: the three planned paths are bit-identical", JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(b) === JSON.stringify(c));
    // in the as-of year (as of 15 May 2026): a row dated before the as-of month is never charged; in or after it, in quarter 0
    const am = "2026-05-15", base = pp6(EX, am);
    const apr = pp6([...EX, ONE_TIME("2026-04")], am), may = pp6([...EX, ONE_TIME("2026-05")], am), mar = pp6([...EX, ONE_TIME("2026-03")], am);
    const infM = oInfl({ year: 2026, month: 5 }, 24, ei);
    const wantM = compounded({ year: 2026, month: 5 }, 24, q => (q === 0 ? 10000 * infM[0] : 0));
    T("C-3 as of 15 May 2026: rows dated March and April 2026 (before the as-of month) are never charged — both planned paths equal the table's without them",
      JSON.stringify(apr) === JSON.stringify(base) && JSON.stringify(mar) === JSON.stringify(base));
    T("C-4 …and a row dated May 2026 is charged in quarter 0, × its two-thirds inflation step, exactly", maxRel(base, may, wantM).m < 1e-6, String(maxRel(base, may, wantM).m));
    // the example's own rows: April 2029, $28,000 (t81 C2-2's D-45 [KNOWN DEFECT], flipped)
    const noOnce = EX.filter(e => e.freq !== "once");
    T("C-5 the example's April 2029 rows ($28,000) now reach both engines (t81 C2-2 flips): the 6-year and 30-year paths differ with and without them",
      JSON.stringify(pp6(EX)) !== JSON.stringify(pp6(noOnce)) && JSON.stringify(pp30(EX)) !== JSON.stringify(pp30(noOnce)));
  } else {
    const KD45 = "[KNOWN DEFECT 2026-10-18, D-45]", KD44 = "[KNOWN DEFECT 2026-10-18, D-44]";
    const a = pp6(EX), apr = pp6([...EX, ONE_TIME("2030-04")]), jun = pp6([...EX, ONE_TIME("2030-06")]);
    T(`C-1 ${KD45} a $10,000 row dated April 2030 is never charged: the planned path is bit-identical`, JSON.stringify(a) === JSON.stringify(apr));
    const qc = (2030 - t.asOf.year) * 4 + 1 - Math.floor((t.asOf.month - 1) / 3);
    const want = compounded(t.asOf, a.length - 1, q => (q === qc ? 10000 : 0));
    T(`C-2 ${KD44} dated June 2030 it is charged in today's dollars — $10,000 flat, not inflated`, maxRel(a, jun, want).m < 1e-6, String(maxRel(a, jun, want).m));
  }
  load(BASE);
}

// ── §D · the quarter read adds up to the year (DC-6) ──────────────────────────────────────────────────────────────────────────────────
console.log("  D — the quarter read: four quarters add to tableYearExpense");
if (POST) {
  const noOnce = EX.filter(e => e.freq !== "once");
  for (const [lab, X] of [["the example's table", EX], ["the table without its one-time rows", noOnce], ["the table as of 15 November 2026", EX]]) {
    const t = load(lab.includes("November") ? withAsOf(BASE, "2026-11-15") : BASE, X), nq = 4 * 36;
    const qs = g.mcQuarterSeries(t, nq, oRetireQ(t.asOf, t.targetRetireYear), g.mcTaxScheduleOf({}));
    const byYr = {};
    for (let q = 0; q < nq; q++) { const o = oQ(t.asOf, q); byYr[o.yr] = (byYr[o.yr] || 0) + qs.monthly[q] * 3 * o.fq + qs.oneTime[q]; }
    const yrs = Object.keys(byYr).map(Number).filter(y => y > t.asOf.year && y < t.asOf.year + 35);
    const bad = yrs.filter(y => Math.abs(byYr[y] - g.tableYearExpense(y)) > 1e-6);
    let first = 0; for (let m = t.asOf.month; m <= 12; m++) { const d = `${t.asOf.year}-${String(m).padStart(2, "0")}`; first += g.getMonthlyExpense(d) + g.getOneTimeExpenses(d); }
    T(`D-1 ${lab}: every later year's four quarters (monthly mean × 3 + one-time sum) equal tableYearExpense to 1e-6 (${yrs.length} years), and the as-of year's quarters equal its months from the as-of month on`,
      bad.length === 0 && yrs.length >= 30 && Math.abs(byYr[t.asOf.year] - first) < 1e-6, bad.slice(0, 3).join(", ") + ` first ${byYr[t.asOf.year]} vs ${first}`);
  }
  // a row ending inside a quarter counts its own months: the example's car payment ends April 2034 — 2034 Q2's mean is one month in three
  const t = load(BASE); const qs = g.mcQuarterSeries(t, 40, 11, g.mcTaxScheduleOf({}));
  const q34 = (2034 - 2026) * 4 + 1 - 1;
  const car = EX.find(e => e.freq !== "once" && String(e.end).startsWith("2034-04"));
  T("D-2 SETUP: the example's car payment is a monthly row ending April 2034", !!car, car ? JSON.stringify(car) : "none");
  if (car) T("D-3 2034 Q2's monthly mean counts the car for April only: (April + May + June) / 3 — the quarter's last month alone would have dropped it",
    Math.abs(qs.monthly[q34] - (g.getMonthlyExpense("2034-04") + g.getMonthlyExpense("2034-05") + g.getMonthlyExpense("2034-06")) / 3) < 1e-9
    && Math.abs(g.getMonthlyExpense("2034-04") - g.getMonthlyExpense("2034-06") - car.amount) < 1e-9, String(qs.monthly[q34]));
  load(BASE);
} else T("D-0 the v6.19 leg reads one month per quarter (no quarter series)", g.mcQuarterSeries === undefined);

// ── §E · extinction (AST) ────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — extinction: the drag, the bare table reads, and every outflow named");
const fnNode = name => { let f = null; walk.simple(AST, { FunctionDeclaration(n) { if (n.id && n.id.name === name) f = n; } }, W); return f; };
const callsIn = (node, name) => { let c = 0; walk.simple(node, { CallExpression(n) { if (n.callee.type === "Identifier" && n.callee.name === name) c++; } }, W); return c; };
{
  let dragIds = 0; walk.full(AST, n => { if (n.type === "Identifier" && n.name === "ROTH_TAX_DRAG_Q") dragIds++; }, W);
  const MC = fnNode("runMonteCarlo"), XMC = fnNode("runExtendedMC");
  T("E-0 SETUP: both engines are found in the source", !!MC && !!XMC);
  if (POST) {
    T("E-1 the identifier ROTH_TAX_DRAG_Q does not exist anywhere in the source", dragIds === 0, String(dragIds));
    T("E-2 neither engine calls getOneTimeExpenses or getMonthlyExpense directly — only through mcQuarterSeries",
      [MC, XMC].every(f => callsIn(f, "getOneTimeExpenses") === 0 && callsIn(f, "getMonthlyExpense") === 0) && callsIn(fnNode("mcQuarterSeries"), "getOneTimeExpenses") === 1 && callsIn(fnNode("mcQuarterSeries"), "getMonthlyExpense") === 1);
    T("E-3 the tax helper is reached at all four former drag sites (twice in each engine), and the one-time helper at four",
      callsIn(MC, "mcTaxCharge") === 2 && callsIn(XMC, "mcTaxCharge") === 2 && callsIn(MC, "mcOneTimeCharge") === 2 && callsIn(XMC, "mcOneTimeCharge") === 2
      && callsIn(MC, "mcQuarterSeries") === 1 && callsIn(XMC, "mcQuarterSeries") === 1);
    // every subtraction from planned / _planned / portfolio inside either engine is one of a named list — a new outflow cannot arrive unnoticed
    const KINDS = [
      ["the spending draw", /^Math\.max\(0, netDraw\) \* _fq$|^Math\.max\(0, \(exp_m - spouseBSS - pension - spouseASS - _plOtherInc\) \* 3\) \* _fq$/],
      ["the tax", /^mcTaxCharge\(_qs, q, (plannedInfl|inflationCum|_plannedInfl), _fq\)$/],
      ["the one-time rows", /^mcOneTimeCharge\(_qs, q, (plannedInfl|inflationCum|_plannedInfl)\)$/],
      ["the mortgage payment", /^_vmMoPI \* 3 \* _fq$/],
      ["the LTC shock", /^\(LTC_SHOCK_MIN \+ rng\(\) \* LTC_SHOCK_RANGE\) \* inflationCum$/],
      ["the sustained-care term", /^\(care\.annual[AB] \/ 4\) \* careEsc \* _fq$/],
      ["the car", /^AUTO_REPLACE_COST \* inflationCum$/],
    ];
    const subs = [];
    for (const f of [MC, XMC]) walk.simple(f, { AssignmentExpression(n) {
      if (n.operator === "-=" && n.left.type === "Identifier" && ["planned", "_planned", "portfolio"].includes(n.left.name)) {
        const rhs = SRC.slice(n.right.start, n.right.end).replace(/\s+/g, " ");
        const k = KINDS.find(([, re]) => re.test(rhs));
        subs.push({ fn: f.id.name, line: n.loc.start.line, rhs, kind: k ? k[0] : null });
      } } }, W);
    const unknown = subs.filter(s => !s.kind), count = k => subs.filter(s => s.kind === k).length;
    T(`E-4 every one of the ${subs.length} subtractions from planned, _planned or portfolio in the two engines is a named outflow`, unknown.length === 0 && subs.length > 0,
      unknown.map(s => `${s.fn} L${s.line}: ${s.rhs}`).join(" | "));
    // v6.21 (D-42): the fixed car is gone — a car is a one-time row, charged as "the one-time rows". An array, so the registrar widens it.
    const CAR_N = ["v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628"].includes(VER) ? 0 : 1;
    T(`E-5 …in the counts the scope names: draw 4, tax 4, one-time 4, mortgage 2, LTC shock 2, care 2, car ${CAR_N}${CAR_N ? "" : " (v6.21: a car is an expense row)"}`,
      count("the spending draw") === 4 && count("the tax") === 4 && count("the one-time rows") === 4 && count("the mortgage payment") === 2
      && count("the LTC shock") === 2 && count("the sustained-care term") === 2 && count("the car") === CAR_N, KINDS.map(([k]) => `${k} ${count(k)}`).join(", "));
    // THE APP'S WIRING (found by the release's independent review: only the 6-year runs' schedule was exercised, through the DOM). Every
    // call to the three engines inside DangerCloseMain must carry a schedule built from the live state, and the effects must re-run on it.
    const MAIN = fnNode("DangerCloseMain"), engineCalls = [], schedCalls = [], effects = [];
    walk.ancestor(MAIN, { CallExpression(n, anc) {
      const c = n.callee.type === "Identifier" ? n.callee.name : null;
      if (["runMonteCarlo", "runExtendedMC", "runStressTests"].includes(c)) engineCalls.push(n);
      if (c === "mcIncomeTaxSchedule") schedCalls.push(SRC.slice(n.arguments[1].start, n.arguments[1].end).replace(/\s+/g, " "));
      if (c === "useEffect" && n.arguments.length === 2) effects.push({ body: SRC.slice(n.arguments[0].start, n.arguments[0].end), deps: (n.arguments[1].elements || []).map(e => e && e.name) });
    } }, W);
    // Resolved per OPTIONS OBJECT, not per call text: a conditional's two branches are checked separately (the first draft read the whole
    // call's text, so stripping the schedule from one branch of run C's `mcLtcDist ? {…} : {…}` passed — controls C11 caught it).
    const OPT_AT = { runMonteCarlo: 2, runExtendedMC: 3, runStressTests: 1 };
    const optsOf = a => !a ? [null] : a.type === "ConditionalExpression" ? [...optsOf(a.consequent), ...optsOf(a.alternate)] : [a];
    const objCarries = o => !!o && ((o.type === "Identifier" && o.name === "_tx")
      || (o.type === "ObjectExpression" && o.properties.some(pr => (pr.type === "SpreadElement" && pr.argument.type === "Identifier" && ["_tx", "base", "_tax"].includes(pr.argument.name))
        || (pr.type === "Property" && pr.key && (pr.key.name || pr.key.value) === "taxSchedule"))));
    const callCarries = n => optsOf(n.arguments[OPT_AT[n.callee.name]]).every(objCarries);
    const carries = n => callCarries(n);
    const stressCalls = []; walk.simple(fnNode("runStressTests"), { CallExpression(n) { if (n.callee.type === "Identifier" && n.callee.name === "runExtendedMC") stressCalls.push(n); } }, W);
    T("E-6 every engine call carries a schedule: the app's 9 (taxSchedule, ..._tx, or the mortgage what-if's base) and runStressTests' 7 (..._tax, resolved once from its options), and each of the app's 3 schedules is built from { rothAmount, qcdAnnual, taxYield, scenarioPreset }",
      engineCalls.length === 9 && engineCalls.every(carries) && stressCalls.length === 7 && stressCalls.every(callCarries)
      && /const _tax = \{ taxSchedule: mcResolveTaxSchedule\(retireYear, opts\) \};/.test(SRC) && schedCalls.length === 3 && schedCalls.every(a => a === "{ rothAmount, qcdAnnual, taxYield, scenarioPreset }")
      && /const _tx = \{ taxSchedule: mcIncomeTaxSchedule\(retireYear, \{ rothAmount, qcdAnnual, taxYield, scenarioPreset \}\) \}/.test(SRC) && /base = \{ ltcShocks: true, (autoReplace: true, )?mortality: true,\s+taxSchedule: mcIncomeTaxSchedule\(/.test(SRC),   // v6.21 (D-42): the car switch is gone
      `${engineCalls.length} app calls, ${stressCalls.length} stress calls, ${engineCalls.filter(x => !carries(x)).map(x => SRC.slice(x.start, x.end).replace(/\s+/g, " ").slice(0, 90)).join(" | ")}; schedules: ${schedCalls.join(" | ")}`);
    const mainFx = effects.filter(e => /runMonteCarlo\(/.test(e.body)), mortFx = effects.filter(e => /futureHomeMortgage: vmPrincipal/.test(e.body)), has3 = d => ["rothAmount", "qcdAnnual", "taxYield"].every(k => d.includes(k));
    T("E-7 the 6-year runs' effect re-runs on the slider, QCD and yield and clears the extended and stress caches; the mortgage what-if re-runs on them too",
      mainFx.length === 1 && has3(mainFx[0].deps) && /setExtendedSim\(\{\}\)/.test(mainFx[0].body) && /setStressData\(\{\}\)/.test(mainFx[0].body) && mortFx.length === 1 && has3(mortFx[0].deps),
      JSON.stringify([mainFx.map(e => e.deps), mortFx.map(e => e.deps)]));
  } else {
    T(`E-1 ${KD} ROTH_TAX_DRAG_Q is declared and read at the four engine sites`, dragIds === 5, String(dragIds));
    T(`E-2 ${KD} both engines read the table directly, at the quarter's last month`, callsIn(MC, "getOneTimeExpenses") === 2 && callsIn(XMC, "getOneTimeExpenses") === 2);
  }
}

// ── §F · tail and timing (DC-4) ────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — past the last row, before retirement, before the first row");
if (POST) {
  const t = load(BASE); preset(g, "base"); const RY = t.targetRetireYear, rq = oRetireQ(t.asOf, RY), ei = g.expectedInflation(), inf = oInfl(t.asOf, 140, ei);
  const p35 = sch => g.runExtendedMC(RY, 35, 1, { taxSchedule: sch, rng: mulberry(1), mortality: false, ltcShocks: false, autoReplace: false }).plannedPath;
  const SYN = { [RY]: 1000, [RY + 1]: 2000 };
  const want = compounded(t.asOf, 140, q => (q >= rq ? oTax(SYN, oQ(t.asOf, q).yr) / 4 * inf[q] * oQ(t.asOf, q).fq : 0));
  T("F-1 past the schedule's last row the last row's tax is charged, × the inflator: { 2029: $1,000, 2030: $2,000 } charges $2,000 a year through 2061 (35-year planned path, exact)",
    maxRel(p35({}), p35(SYN), want).m < 1e-6 && want[140] > want[rq + 8] * 2, String(maxRel(p35({}), p35(SYN), want).m));
  const PRE = { [RY - 2]: 50000, [RY - 1]: 50000, [RY + 2]: 3000 };
  const z = p35({}), pre = p35(PRE), rq2 = oRetireQ(t.asOf, RY + 2);
  T("F-2 rows for years before retirement charge nothing, and retired years before the first row charge nothing: with { 2027, 2028: $50,000; 2031: $3,000 } the path is untouched until 2031",
    z.slice(0, rq2 + 1).every((v, i) => v === pre[i]) && pre[rq2 + 1] < z[rq2 + 1]);
  // stochastic longevity: a survivor alive past the schedule pays the last row's tax every year (implicit tail === the same tail written out)
  const full = clone(g.mcIncomeTaxSchedule(RY).byYr), last = full[2053], lastFilled = { ...full }, zeroFilled = { ...full };
  for (let y = 2054; y <= 2070; y++) { lastFilled[y] = last; zeroFilled[y] = 0; }
  const runS = (sch, sto) => JSON.stringify(g.runExtendedMC(RY, 35, 200, { taxSchedule: sch, rng: mulberry(5), ltcShocks: true, autoReplace: true, mortality: true, stochasticMortality: sto }).results);
  T("F-3 under stochastic longevity the implicit tail is the last row written out: bit-identical to a schedule carrying 2053's tax through 2070", runS(full, true) === runS(lastFilled, true));
  T("F-4 …and some path lives past 2053 and pays it: a tail of zeros reads differently (so F-3 discriminates)", runS(full, true) !== runS(zeroFilled, true));
  T("F-5 with deaths at life expectancy (the schedule's own horizon) no path is alive after 2053, so the tail is never charged: zeros read the same", runS(full, false) === runS(zeroFilled, false));
  // the quarter read itself carries no tax before retirement — the engines also gate the charge on `retired`, so this is the check that
  // sees a schedule leaking into pre-retirement quarters (found by the release's independent review: without it the controls' C10 is an
  // equivalent mutant)
  const ROWS = {}; for (let y = 2026; y <= 2040; y++) ROWS[y] = 1000;
  const qs = g.mcQuarterSeries(t, 60, rq, g.mcTaxScheduleOf(ROWS));
  T("F-6 mcQuarterSeries puts no tax in any quarter before retirement (rows for 2026–2040 given), and a quarter of the year's row in every retired quarter",
    qs.tax.slice(0, rq).every(v => v === 0) && qs.tax.slice(rq, 56).every(v => v === 250), `${qs.tax.slice(rq - 2, rq + 2)}`);
  // a part first quarter that is retired: retired January 2029, saved 15 February 2029 — quarter 0 counts two months of three
  const P29 = { ...clone(BASE), retireYear: 2029, retireYearB: 2029, asOf: "2029-02-15" }, t29 = load(P29); preset(g, "base");
  const pp29 = sch => g.runExtendedMC(2029, 30, 1, { taxSchedule: sch, rng: mulberry(1), mortality: false, ltcShocks: false, autoReplace: false }).plannedPath;
  const f = 2 / 3, inf0 = 1 + g.expectedInflation() / 4 * f, want29 = 12000 / 4 * inf0 * f * (1 + BASE_GROWTH / 4 * f), d29 = pp29({})[1] - pp29({ 2029: 12000 })[1];
  T("F-7 a retired plan saved mid-quarter (as of 15 February 2029) pays two months of the year's tax in quarter 0: $12,000 / 4 × its inflation step × 2/3, grown × (1 + 4.5%/4 × 2/3), exact",
    oRetireQ(t29.asOf, 2029) === 0 && Math.abs(d29 - want29) < 1e-9 * want29, `${d29} vs ${want29}`);
  load(BASE);
  load(BASE);
} else T("F-0 the v6.19 leg charges nothing after the ladder (2040): its drag is gated on the ladder's end", /calYear <= _ladderEndYr\) planned -= ROTH_TAX_DRAG_Q/.test(SRC));

// ── §G · what it now reads, and what it still must not ───────────────────────────────────────────────────────────────────────────────
console.log("  G — the slider, the state, the QCD move it; tax type and plan type do not, with the schedule held fixed");
if (POST) {
  const RY = load(BASE).targetRetireYear;
  const mc = (P, opts) => { load(P); preset(g, "base"); _src = mulberry(3); return JSON.stringify(g.runMonteCarlo(RY, 40, opts).results); };
  const xm = (P, opts) => { load(P); preset(g, "base"); return JSON.stringify(g.runExtendedMC(RY, 30, 40, { ltcShocks: true, autoReplace: true, mortality: true, rng: mulberry(4), ...opts }).results); };
  const st = (P, opts) => { load(P); preset(g, "base"); _src = mulberry(6); return JSON.stringify(g.runStressTests(RY, opts), (k, v) => k === "plannedPath" ? undefined : v); };
  const ti = o => ({ taxInputs: { rothAmount: 70000, qcdAnnual: 0, taxYield: 2, scenarioPreset: "base", ...o } });
  T("G-1 the slider moves both engines: $0 and $150,000 give different 6-year and 30-year results", mc(BASE, ti({ rothAmount: 0 })) !== mc(BASE, ti({ rothAmount: 150000 })) && xm(BASE, ti({ rothAmount: 0 })) !== xm(BASE, ti({ rothAmount: 150000 })));
  T("G-2 the state moves both engines: Georgia and no state income tax differ", mc(GA(BASE), ti({})) !== mc(BASE, ti({})) && xm(GA(BASE), ti({})) !== xm(BASE, ti({})));
  load(BASE); preset(g, "base");
  const s0 = g.mcIncomeTaxSchedule(RY, { qcdAnnual: 0 }), s1 = g.mcIncomeTaxSchedule(RY, { qcdAnnual: 10000 });
  const firstDiff = Object.keys(s0.byYr).map(Number).find(y => s0.byYr[y] !== s1.byYr[y]);
  T("G-3 SETUP: a $10,000 QCD first changes the example's schedule in 2039 (the year spouse A turns 70½ and the QCD can start), after the 6-year run ends", firstDiff === 2039, String(firstDiff));
  T("G-4 the QCD moves runExtendedMC and runStressTests …", xm(BASE, ti({ qcdAnnual: 0 })) !== xm(BASE, ti({ qcdAnnual: 10000 })) && st(BASE, ti({ qcdAnnual: 0 })) !== st(BASE, ti({ qcdAnnual: 10000 })));
  T("G-5 …and not runMonteCarlo, whose 24 quarters end in 2032", mc(BASE, ti({ qcdAnnual: 0 })) === mc(BASE, ti({ qcdAnnual: 10000 })));
  // t20's guard, on its new footing: tax type is read by Engine B, so only with the schedule held fixed must the engines not move
  const FLIP = { taxable: "trad", trad: "taxable", roth: "hsa", hsa: "roth", annuity: "taxable" };
  const flipped = { ...clone(BASE), otherAccounts: BASE.otherAccounts.map(a => ({ ...a, taxType: FLIP[a.taxType] || a.taxType })) };
  load(BASE); preset(g, "base"); const FIX = g.mcIncomeTaxSchedule(RY);
  T("G-6 SETUP: the example has Other accounts and the permutation changes their tax types", BASE.otherAccounts.length > 0 && flipped.otherAccounts.some((a, i) => a.taxType !== BASE.otherAccounts[i].taxType));
  T("G-7 with the schedule held fixed, permuting every Other account's tax type moves neither Monte Carlo engine nor runStressTests (t20's guard)",
    mc(BASE, { taxSchedule: FIX }) === mc(flipped, { taxSchedule: FIX }) && xm(BASE, { taxSchedule: FIX }) === xm(flipped, { taxSchedule: FIX })
    && st(BASE, { taxSchedule: FIX }) === st(flipped, { taxSchedule: FIX }));
  T("G-8 CONTROL: with the schedule computed from the plan, the permutation DOES move the 30-year engine (it reads Engine B, which reads tax type)", xm(BASE, ti({})) !== xm(flipped, ti({})));
  // t56 F-1 / F-3's Monte Carlo half: plan type (Rhode Island reads it) moves no Monte Carlo figure with the schedule fixed
  const RI = { ...clone(BASE), stateCode: "RI", _stateFromForm: true };
  const EMP = clone(RI); EMP.positions.forEach(p => { if ((p.trad || 0) > 0) p.planType = "employer"; }); EMP.otherAccounts.forEach(a => { if (a.taxType === "trad") a.planType = "employer"; });
  load(RI); preset(g, "base"); const FIXRI = g.mcIncomeTaxSchedule(RY);
  T("G-9 in Rhode Island, with the schedule held fixed, every plan type \"employer\" moves no Monte Carlo figure (t56 F-1 / F-3)",
    mc(RI, { taxSchedule: FIXRI }) === mc(EMP, { taxSchedule: FIXRI }) && xm(RI, { taxSchedule: FIXRI }) === xm(EMP, { taxSchedule: FIXRI }));
  load(RI); preset(g, "base"); const sRI = g.mcIncomeTaxSchedule(RY); load(EMP); preset(g, "base"); const sEMP = g.mcIncomeTaxSchedule(RY);
  T("G-10 CONTROL: and the plan type does move Rhode Island's schedule (so the 30-year engine, computed from the plan, moves too)",
    JSON.stringify(sRI.byYr) !== JSON.stringify(sEMP.byYr) && xm(RI, ti({})) !== xm(EMP, ti({})));
  load(BASE);
} else T("G-0 the v6.19 leg's Monte Carlo reads no tax input", !/taxInputs|taxSchedule/.test(SRC));

// ── §H · what must not move: Engines B, C and D; and the oracle differential ─────────────────────────────────────────────────────────────
const PRI = join(HERE, `app_${D_PRIOR}.mjs`);
const pairHere = VER === D_CUR && existsSync(PRI);
const oracle = await (async () => {
  const src0 = join(HERE, "..", `${D_PRIOR}.jsx`), shim = join(HERE, "shim.txt");
  if (!pairHere || !existsSync(src0) || !existsSync(shim)) return null;
  const base = readFileSync(src0, "utf8"), DRAG = "const ROTH_TAX_DRAG_Q = 4000;";
  if (base.split(DRAG).length !== 2) return null;
  const tag = "_t83_oracle";
  const body = base.replace(DRAG, "const ROTH_TAX_DRAG_Q = 0;").replace("export default function DangerClose()", "function DangerClose()");
  writeFileSync(join(HERE, `${tag}.jsx`), body + readFileSync(shim, "utf8"));
  try {
    execFileSync("npx", ["esbuild", `${tag}.jsx`, "--loader:.jsx=jsx", "--jsx=automatic", "--format=esm", `--outfile=${tag}.mjs`, "--log-level=warning"], { cwd: HERE });
    return (await import(pathToFileURL(join(HERE, `${tag}.mjs`)).href)).__g;
  } finally { for (const f of [`${tag}.jsx`, `${tag}.mjs`]) { try { unlinkSync(join(HERE, f)); } catch (e) {} } }
})();
const noPP = (k, v) => (k === "plannedPath" ? undefined : v);
let G0 = null, E0 = null;
if (pairHere) {
  console.log(`  H — ${D_PRIOR} → ${D_CUR}: Engines B, C and D do not move; the oracle differential`);
  ({ __g: G0, __engines: E0 } = await import(pathToFileURL(PRI).href));
  const bcd = (G, EE, P, X) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); const RY = G.PLAN_TIMELINE().targetRetireYear;
    const A = { retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, scenarioPreset: "base" };
    const S = G.withdrawalPlanSeries(A); return JSON.stringify({ D: G.computeWithdrawalPlan(A).schedule, B: EE.computeTaxPlan({ ...A, ...S }).rows, C: EE.computeIrmaaPlan({ ...A, ...S }).rows }); };
  let bad = []; for (const [name, { p, ex }] of HH) if (bcd(G0, E0, p, ex) !== bcd(g, E, p, ex)) bad.push(name);
  T(`H-1 the Withdrawal schedule, the Taxes tab's rows and the IRMAA tab's rows are bit-identical on all ${HH.length} households (Engine A: t2's fingerprints)`, bad.length === 0, bad.join(", "));
  T("H-2 SETUP: the oracle module builds (the v6.19 source with ROTH_TAX_DRAG_Q = 0, and shim.txt, beside this run)", !!oracle);
  if (oracle) {
    // a table on which the quarter read cannot differ from the last-month read: integer amounts, every row starting in a quarter's first
    // month and ending in a quarter's last, no one-time rows
    const flat = X => X.filter(e => e.freq !== "once").map(e => {
      const snap = (d, end) => { const [y, m] = String(d).split("-").map(Number); const qm = Math.floor((m - 1) / 3) * 3 + (end ? 3 : 1); return `${y}-${String(qm).padStart(2, "0")}`; };
      return { ...e, amount: Math.round(e.amount), start: snap(e.start, false), end: snap(e.end, true) };
    });
    const runs = (G, P, X, opts) => {
      G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); preset(G, "base"); const RY = G.PLAN_TIMELINE().targetRetireYear;
      _src = mulberry(21); const mc = JSON.stringify(G.runMonteCarlo(RY, 60, opts));
      const r = (yrs, o, s) => JSON.stringify(G.runExtendedMC(RY, yrs, 40, { ...o, ...(opts || {}), rng: mulberry(s) }), noPP);
      return { mc, runB: r(10, { ltcShocks: false, autoReplace: false, mortality: false }, 1), runC: r(30, { ltcShocks: true, autoReplace: true, mortality: true }, 2),
        longevity: r(30, { ltcShocks: true, autoReplace: true, mortality: true, stochasticMortality: true }, 3), sustainedLTC: r(35, { sustainedLTC: true, autoReplace: true, mortality: true }, 4),
        mortgage: r(30, { ltcShocks: true, autoReplace: true, mortality: true, futureHomeMortgage: 80000 }, 5) };
    };
    let nh = 0;
    for (const [name, { p, ex }] of HH) {
      const X = flat(ex), a = runs(oracle, p, X, undefined), b = runs(g, p, X, { taxSchedule: {} }), diff = Object.keys(a).filter(k => a[k] !== b[k]); nh++;
      T(`H-3 ${name}: on a quarter-aligned integer table with no one-time rows, v6.20 with a zero schedule is bit-identical to the oracle — runMonteCarlo, runs B and C, longevity, sustained LTC, the mortgage what-if`,
        diff.length === 0, diff.join(", "));
    }
    const stress = (G, P, opts) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(flat(EX)) }); preset(G, "base"); _src = mulberry(22);
      return JSON.stringify(G.runStressTests(G.PLAN_TIMELINE().targetRetireYear, opts), noPP); };
    T("H-4 runStressTests (all seven runs) on the example and the single household: bit-identical to the oracle",
      stress(oracle, BASE) === stress(g, BASE, { taxSchedule: {} }) && stress(oracle, HH.find(h => h[0] === "single")[1].p) === stress(g, HH.find(h => h[0] === "single")[1].p, { taxSchedule: {} }));
    T("H-5 CONTROL: v6.19 itself (the $4,000 drag) differs from the oracle on that table (so H-3 discriminates)", runs(G0, BASE, flat(EX)).runC !== runs(oracle, BASE, flat(EX)).runC);
    T("H-6 CONTROL: and on the example's own table (non-aligned rows, one-time rows) v6.20's zero schedule differs from the oracle", runs(oracle, BASE, EX).runC !== runs(g, BASE, EX, { taxSchedule: {} }).runC);
  }
  load(BASE);
} else console.log(`  H — skipped (needs app_${D_PRIOR}.mjs beside the ${D_CUR} leg)`);

// ── §R · the re-pin's attribution: t42 D-4, the married example's 6-year planned path ───────────────────────────────────────────────────
// t42 D-4 pins runMonteCarlo(RY, 50).plannedPath's last value on the example. Each step below is exact on the planned path (1e-6):
//   F0 v6.19 → F1 the oracle (drag 0): + the drag's own compounded series;  F1 → F2o the oracle without the one-time rows: identical (v6.19
//   never charged the April rows — D-45);  F2o → F2n v6.20 with a zero schedule, same table: the monthly quarter read alone (pinned);
//   F2n → F3 the one-time rows restored: − §C's compounded charge;  F3 → F4 the default schedule: − §B's compounded tax.  F4 is the new pin.
if (pairHere && oracle) {
  console.log("  R — t42 D-4's move, attributed step by step");
  const t = load(BASE), RY = t.targetRetireYear, rq = oRetireQ(t.asOf, RY), n = g.RETIRE_OPTIONS()[RY].totalQuarters;
  const pp = (G, X, opts) => { G.applyLoadedData({ portfolio: clone(BASE), expenses: clone(X) }); return G.runMonteCarlo(RY, 50, opts).plannedPath; };
  const noOnce = EX.filter(e => e.freq !== "once");
  const F0 = pp(G0, EX), F1 = pp(oracle, EX), F2o = pp(oracle, noOnce), F2n = pp(g, noOnce, { taxSchedule: {} }), F3 = pp(g, EX, { taxSchedule: {} }), F4 = pp(g, EX);
  load(BASE); const ei = g.expectedInflation(), inf = oInfl(t.asOf, n, ei), S = g.mcIncomeTaxSchedule(RY);
  const ladderEnd = t.rothLadderEnd;
  const drag = compounded(t.asOf, n, q => (q >= rq && oQ(t.asOf, q).yr <= ladderEnd ? 4000 * oQ(t.asOf, q).fq : 0));
  const once = compounded(t.asOf, n, q => { const o = oQ(t.asOf, q); let s = 0; for (let m = o.fromM; m <= o.firstM + 2; m++) s += EX.reduce((a, e) => a + (e.freq === "once" && String(e.start).slice(0, 7) === `${o.yr}-${String(m).padStart(2, "0")}` ? +e.amount : 0), 0); return s * inf[q]; });
  const tax = compounded(t.asOf, n, q => (q >= rq ? oTax(S.byYr, oQ(t.asOf, q).yr) / 4 * inf[q] * oQ(t.asOf, q).fq : 0));
  T("R-0 SETUP: v6.19's figure is t42 D-4's pin, $2,128,443", Math.round(F0[n]) === 2128443, String(F0[n]));
  T("R-1 step 1: the oracle (drag 0) exceeds v6.19 by the drag's compounded series at every quarter (1e-6)", maxRel(F1, F0, drag).m < 1e-6, String(maxRel(F1, F0, drag).m));
  T("R-2 removing the example's one-time rows does not move the oracle (v6.19 never charged them — D-45)", JSON.stringify(F1) === JSON.stringify(F2o));
  const qr = F2n[n] - F2o[n];
  // derived, not only measured: the quarter read changes each retired quarter's draw by (mean of the counted months − the last month) × 3
  // × the inflator × the share, grown after it (the example's draw is never floored at zero). On the example that is the current home's
  // $300 homeowners row, ending April 2029, counted for April in 2029 Q2 (found by the review: 300 × 1.00685^13 × 1.01125^12 = $374.94).
  load(BASE, noOnce); const qsR = g.mcQuarterSeries(t, n, rq, g.mcTaxScheduleOf({}));
  const read = compounded(t.asOf, n, q => { if (q < rq) return 0; const o = oQ(t.asOf, q); return (qsR.monthly[q] - g.getMonthlyExpense(`${o.yr}-${String(o.firstM + 2).padStart(2, "0")}`)) * 3 * inf[q] * o.fq; });
  T("R-3 the monthly quarter read alone (no one-time rows, no tax) lowers the planned path by its derived compounded series at every quarter (1e-6) — −$375 at the end",
    maxRel(F2o, F2n, read).m < 1e-6 && Math.round(qr) === -375, `${qr.toFixed(2)} / max rel ${maxRel(F2o, F2n, read).m}`);
  T("R-4 step 2: restoring the one-time rows lowers v6.20's zero-schedule path by §C's compounded charge ($28,000 in 2029 Q2 × its inflator) at every quarter", maxRel(F2n, F3, once).m < 1e-6, String(maxRel(F2n, F3, once).m));
  T("R-5 step 3: the default schedule lowers it by §B's compounded tax at every quarter", maxRel(F3, F4, tax).m < 1e-6, String(maxRel(F3, F4, tax).m));
  T("R-6 the five steps add up: F4 = F0 + drag − 0 + quarter read − one-time − tax, to the cent", Math.abs(F4[n] - (F0[n] + drag[n] + qr - once[n] - tax[n])) < 0.005);
  T("R-7 THE NEW PIN: t42 D-4's planned path is $2,083,910 at v6.20 (−$44,533: drag +$56,285, quarter read −$375, one-time −$34,995, tax −$65,449)", Math.round(F4[n]) === 2083910, `${Math.round(F4[n])} (drag +${Math.round(drag[n])}, read ${Math.round(qr)}, one-time −${Math.round(once[n])}, tax −${Math.round(tax[n])})`);
  load(BASE);
} else console.log(`  R — skipped (needs app_${D_PRIOR}.mjs and the oracle beside the ${D_CUR} leg)`);

// ── §J · copy: METHODOLOGY ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  J — METHODOLOGY says what changed");
{
  const MP = join(HERE, "..", "METHODOLOGY.md"), MD = existsSync(MP) ? readFileSync(MP, "utf8") : "";
  if (POST) {
    T("J-1 METHODOLOGY has the section \"The Monte Carlo pays the Taxes tab's tax (v6.20)\"", /^## The Monte Carlo pays the Taxes tab's tax \(v6\.20\)$/m.test(MD), MP);
    const v618 = (MD.split(/^## The Withdrawal tab spends the expense table year by year \(v6\.18\)$/m)[1] || "").split(/^## /m)[0];
    T("J-2 the v6.18 section's two Monte Carlo simplifications are marked closed at v6.20", (v618.match(/\*\*Closed at v6\.20\*\*/g) || []).length === 2, String((v618.match(/\*\*Closed at v6\.20\*\*/g) || []).length));
    const v619 = (MD.split(/^## The Monte Carlo's calendar \(v6\.19\)$/m)[1] || "").split(/^## /m)[0];
    T("J-3 the v6.19 section's one-month-per-quarter simplification is marked closed at v6.20", /\*\*Closed at v6\.20\*\*/.test(v619));
  } else console.log("  J — skipped by design on the v6.19 leg (the run folder holds the current METHODOLOGY)");
}

// ── §I · rendered ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  I — rendered: the Income card, the slider, the Monte Carlo tab, Backtest, What Breaks, the Field Manual");
{
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const body = () => window.document.body;
  let root, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  const text = () => { const c = body().cloneNode(true); c.querySelectorAll("style,script").forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " "); };
  const render = async () => { el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush();
    const ex = [...body().querySelectorAll("button, [role=button], div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
    if (ex) { await click(ex); await flush(); await flush(); } };
  const tab = async name => { await click(tabBtn(name)); await flush(150); return text(); };
  const waitFor = async (pred, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (pred()) return true; await flush(300); } return false; };
  await render();
  const DG = window.__g;   // the DOM bundle's own module copy — the household and preset the page rendered (OPERATIONS §C)
  const RY = DG.PLAN_TIMELINE().targetRetireYear;
  const cardEl = () => body().querySelector("[data-dc-mc-tax-card]");
  const cardLine = () => cardEl() ? cardEl().parentElement.textContent.replace(/\s+/g, " ") : "";
  let inc = await tab("income");
  if (POST) {
    const ready = await waitFor(() => cardEl() && /^\$[\d,]+\/yr$/.test(cardEl().textContent.trim()));
    const want = r => `$${Math.round(DG.mcIncomeTaxSchedule(RY, { rothAmount: r, qcdAnnual: 0, taxYield: 2, scenarioPreset: "bull" }).byYr[RY]).toLocaleString()}/yr`;
    T("I-0 SETUP: the Income tab's card fills in (the 6-year runs finished)", ready, cardLine());
    T("I-1 the card is the schedule's first year at the opening $70K slider under BULL (the preset a first visit opens on), in today's dollars",
      cardEl() && cardEl().textContent.trim() === want(70000) && /Income tax the Monte Carlo pays/i.test(cardLine()) && /2029 in today's dollars: the Taxes tab's tax, year by year, at the \$70K conversion slider/.test(cardLine()), `${cardLine()} vs ${want(70000)}`);
    T("I-2 the old card is gone: no \"$4K/quarter modeled in MC sim\", no \"Roth conversion tax drag\"", !/4K\/quarter modeled in MC sim/.test(text()) && !/Roth conversion tax drag/i.test(text()));
    await tab("roth");
    const slider = () => [...body().querySelectorAll("input[type=range]")].find(s => s.max === "400000" && s.step === "5000");
    const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    T("I-3 SETUP: the Roth tab's conversion slider is found at $70,000", !!slider() && slider().value === "70000");
    if (slider()) { await act(async () => { setNative.call(slider(), "150000"); slider().dispatchEvent(new window.Event("input", { bubbles: true })); }); await flush(); }
    await tab("income");
    const moved = await waitFor(() => cardEl() && cardEl().textContent.trim() === want(150000));
    T("I-4 moving the slider to $150K moves the card to the schedule at $150K, and its line says so", moved && /at the \$150K conversion slider/.test(cardLine()), `${cardLine()} vs ${want(150000)}`);
    const mc = await tab("monte carlo"); const sp = body().querySelector("[data-dc-mc-tax]");
    T("I-5 the Monte Carlo tab says every run pays the Taxes tab's tax at the current slider ($150K), grown with inflation, and one-time expenses in the quarter they fall",
      !!sp && /Every run pays, in each year of retirement, the income tax the Taxes tab computes at the current conversion slider \(\$150K\), QCD and dividend-yield settings, grown with that run's inflation; one-time expenses are charged in the quarter they fall, grown the same way\. Before v6\.20 the simulation charged a flat \$4,000 a quarter during the conversion ladder and no income tax after it\./.test(sp.textContent.replace(/\s+/g, " ")), sp ? sp.textContent : "no span");
  } else {
    T(`I-1 ${KD} the Income card says "Roth conversion tax drag · ~$16K/yr · $4K/quarter modeled in MC sim"`, /Roth conversion tax drag/i.test(inc) && /~\$16K\/yr/.test(inc) && /\$4K\/quarter modeled in MC sim/.test(inc));
  }
  const bt = await tab("backtest");
  if (POST) T("I-6 Backtest: the MC charges the Taxes tab's income tax, and both spend one-time expenses — the March/June/September/December sentence and \"tax drag\" are gone",
    /the MC also charges LTC shocks and the Taxes tab's income tax, which this backtest deliberately omits\. \(Both spend your one-time expenses: this backtest from v6\.18, the MC in the quarter each one falls from v6\.20\.\)/.test(bt)
    && !/the MC charges one only when it is dated in March/.test(bt) && !/Roth-conversion tax drag/.test(bt));
  else T(`I-6 ${KD} Backtest says the MC charges a one-time expense only when dated in March, June, September or December`, /the MC charges one only when it is dated in March, June, September or December/.test(bt));
  const wb = await tab("what breaks");
  if (POST) T("I-7 What Breaks names the engine its tax comes from (the Roth tab's strategy engine), no longer says it does not model taxes, and does not credit the Monte Carlo with IRMAA",
    /average from the Roth tab's strategy engine, incl\. Roth-conversion taxes/.test(wb) && !/average from the Taxes engine/.test(wb) && !/It does not model taxes/.test(wb)
    && /Its taxes are a yearly average from the Roth tab's strategy engine/.test(wb) && /the Monte Carlo models market sequence, not IRMAA/.test(wb));
  else T(`I-7 ${KD} What Breaks says it "does not model taxes" while adding a tax estimate`, /It does not model taxes/.test(wb) && /average from the Taxes engine/.test(wb));
  // the Field Manual (the DOCS_HTML string the Docs tab serves)
  const FM = String(DG.DOCS_HTML()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (POST) {
    T("I-8 Field Manual, Monte Carlo entry: the income-tax paragraph — the schedule, the inflation reading, the same tax on every path, the omissions, the one-time rows, and what it did through v6.19",
      /Its income tax \(v6\.20\)\. Every run pays, in each year of retirement, the income tax the Taxes tab computes for that year/.test(FM)
      && /grows them with each run’s own inflation/.test(FM) && /The same yearly schedule is paid on every run/.test(FM)
      && /Not in it: IRMAA \(a Medicare premium, on its own tab\), the Social Security cut toggle/.test(FM)
      // v6.23 (D-49): the built-in wages are the example's alone, and the sentence says so (t86 G-3); through v6.22 it named every plan with no streams
      && (POST_D49 ? /For the example household, whose spouse B works part-time in its retirement year and the two after, the Taxes tab taxes those wages and the simulation does not credit them as income/.test(FM)
                   : /built-in part-time wages for spouse B/.test(FM)) && /Through v6\.19 the only income tax was a flat, never-inflated \$4,000 a quarter during the conversion ladder/.test(FM));
    T("I-9 Field Manual, Withdrawal entry: the one-time disclosure says what the Monte Carlo does from v6.20, and keeps what it did as history",
      /From v6\.20 the Monte Carlo charges a one-time row in the quarter that contains its month, grown with each run’s inflation like the monthly rows; through v6\.19 it read the table once a quarter/.test(FM)
      && !/so it charges a one-time row only when the row is dated in one of those months/.test(FM));
    T("I-10 Field Manual, What Breaks: the estimate's engine named, and the Monte Carlo no longer credited with IRMAA",
      /an annual average from the Roth tab’s strategy engine/.test(FM) && /the Monte Carlo tab covers market sequence, though not IRMAA\./.test(FM) && !/an annual average from the Taxes engine/.test(FM));
  } else T(`I-8 ${KD} the Field Manual says the Monte Carlo charges a one-time row only when it is dated in a quarter's last month, in today's dollars`, /so it charges a one-time row only when the row is dated in one of those months/.test(FM));
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

finished = true;
console.log(`\nt83 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
