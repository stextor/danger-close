// t98_irmaa_onetime.mjs — v6.35 (D-62, D-65, D-44; docs/SCOPE_D62_D65_D44_V635.md).
//
// WHAT IT PINS.
//   D-62 · STAY UNDER IRMAA solved its conversion against the year's income BEFORE the sale that pays the year's tax, whose gain then went
//          into the lookback MAGI (cause 1), and rounded its answer to the nearest dollar on a solve that landed exactly on the threshold
//          (cause 2). Every fixture crossed the cliff it is named for in some conversion year. From v6.35: the largest whole-dollar
//          conversion whose estimated lookback MAGI is at least IRMAA_SOLVER_MARGIN under the cliff AND one margin more is still under it,
//          found by bisection on an estimate shared with the ACA strategy (which stays bit-identical).
//   D-65 · the first two premium years after retirement carried no surcharge anywhere. From v6.35 an optional My Data figure (`workMagi`,
//          today's dollars) seeds Engine A's lookback and gives Engine C two working rows; the Monte Carlo bills them; blank is v6.34.
//   D-44 · a one-time row dated between the as-of month and the retirement year never reached the Withdrawal tab, Backtest or What Breaks.
//          From v6.35 their starting money is today's holdings less those rows (after-tax money first, then the buckets pro rata, untaxed).
//
// Both legs: node t98_irmaa_onetime.mjs v634 | node t98_irmaa_onetime.mjs v635. The v6.34 leg pins each defect as a dated
// [KNOWN DEFECT 2026-10-28, D-…], read from outside (the seams below do not exist there). Sections:
//   A · D-62 — the solver's invariants on 70+ households; every other strategy bit-identical to v6.34; one year by hand; the margin is its
//       own; the copy
//   B · D-65 — blank changes nothing (against the v6.34 module); the working years by hand (Engine A and Engine C); A and C agree; the
//       Monte Carlo schedule bills them; every runRothStrategies P builder carries workMagi (AST); the round trip through the real controls;
//       the copy on four surfaces and the Field Manual; the flag; Ask AI's line
//   C · D-44 — Engine D's opening state by hand; which rows count; the overflow into the buckets; the example at +1 YEAR on the three tabs;
//       nothing else moves; the bridge; the copy
// The seams (v6.35 only): each runRothStrategies row's non-enumerable `magiByYr`, `convByYr`, `irmaaSolveByYr` (with `__dcIrmaaGrid` set,
// a grid of the estimate); computeWithdrawalPlan's non-enumerable `_opening`.
// Controls: qa/tools/controls_v635_irmaa_onetime.py (repo-only). Exits with process.exit (the rendered app leaves timers running).
import { createRequire } from "module";
import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(98); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v635";
const KNOWN_VERSIONS = ["v634", "v635", "v636", "v637", "v638", "v639", "v640"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v635", "v636", "v637", "v638", "v639", "v640"].includes(VER);   // an array, so the next registration widens it
const D_PRIOR = "v634";                // the differential's prior leg — a constant, so the registrar cannot widen it (t76 records why)
const KD = "[KNOWN DEFECT 2026-10-28, D-62 — flips at v6.35]", KW = "[KNOWN DEFECT 2026-10-28, D-65 — flips at v6.35]", KO = "[KNOWN DEFECT 2026-10-28, D-44 — flips at v6.35]";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = M.__g, E = M.__engines, TS = M.__test || {};
const X = n => (g[n] !== undefined ? g[n] : TS[n]);   // the v6.35 helpers live in the shim's __test object
const PRIOR_PATH = join(HERE, `app_${D_PRIOR}.mjs`);
const PM = POST && existsSync(PRIOR_PATH) ? await import(pathToFileURL(PRIOR_PATH).href) : null;
// v6.36: in a LATER pair's run folder (v635 → v636) no v6.34 module is built, so the differentials against it are skipped with a printed
// line rather than failed — the v634 → v635 folder they belong to is the one that must hold it (t93's and t96's skips, the same shape).
const LATER = readdirSync(HERE).some(f => { const m = /^app_v(\d)(\d\d)\.mjs$/.exec(f); return m && +(m[1] + m[2]) > +VER.slice(1); });
// The differentials belong to the v634 → v635 pair: they are REQUIRED on the v6.35 leg of that pair's folder, and skipped on any later build's
// leg (v6.36 on) and on v6.35 as the prior leg of a later pair.
const SKIP_PM = POST && !PM && (VER !== "v635" || LATER);
if (SKIP_PM) console.log(`     (the v6.34 differentials — A-2, A-2b, B-1, C-3b, C-4, C-5 — skipped: ${VER}${LATER ? " as the prior leg of a later pair" : ", a later build"}; this run folder builds no app_v634.mjs)`);
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const W = Object.assign({}, walk.base, {
  JSXElement(n, st, c) { c(n.openingElement, st); (n.children || []).forEach(x => c(x, st)); },
  JSXFragment(n, st, c) { (n.children || []).forEach(x => c(x, st)); },
  JSXOpeningElement(n, st, c) { (n.attributes || []).forEach(a => c(a, st)); }, JSXClosingElement() {},
  JSXAttribute(n, st, c) { if (n.value) c(n.value, st); }, JSXSpreadAttribute(n, st, c) { c(n.argument, st); },
  JSXExpressionContainer(n, st, c) { c(n.expression, st); }, JSXEmptyExpression() {}, JSXText() {},
  JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {} });

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T98_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t98 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const canon = v => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]" : (v && typeof v === "object") ? "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v);
const same = (a, b) => canon(a) === canon(b);
console.log(`t98 — STAY UNDER IRMAA, THE LAST WORKING YEARS, ONE-TIME ROWS BEFORE RETIREMENT (${VER})`);

const P0 = clone(g.PORTFOLIO()), X0 = clone(g.EXPENSES());
const TL0 = g.PLAN_TIMELINE();
const thrFor = TS.irmaaThresholdFor || g.irmaaThresholdFor;
// the first-tier threshold of a premium year, for a filing status — the leg's own table and rule (the threshold is not under test here; t44 holds it)
const thr1 = (premYr, single) => { const t = g.irmaaTableFor(premYr), u = single ? t.SGL : t.MFJ; return thrFor(u[0], u.length === 2, premYr); };
const MARGIN = 500;   // DI-2 (a), typed — the decision, not read from the build
// the plan's inflation, Σ prob × inflation (t44's RATE) — the CPI-U rate the tables index at and the dollar carry
const RATE = Object.values(g.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0);
// the published 2026 IRMAA table (CMS, 2026 Medicare Parts B & D premiums fact sheet) — typed, as t44 types it
const MFJ26 = [218000, 274000, 342000, 410000, 750000, Infinity], SGL26 = [109000, 137000, 171000, 205000, 500000, Infinity];
const SUR26 = [0, 1150, 2880, 4620, 6360, 6940];

// ── households for the Roth engine (hand-built P objects: asOfYr is mandatory — OPERATIONS §C) ─────────────────────────────────────────────
const T3 = () => ({ single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2058, ladderEnd: 2037, ladderEndA: 2037, ladderEndB: 2039,
  dobAYr: 1964, dobBYr: 1966, deathYr1: 2052, survivor: "B", ssA: 2800, ssB: 1400, ssAYr: 2031, ssAMo: 3, ssBYr: 2033, ssBMo: 6,
  pen: 800, stateRate: 0.04, stateCode: "GA", convTaxFunding: "taxable", taxableGainFrac: 0.5, acaPremium: 0, acaSize: 0, taxYieldPct: 1.5, currentConv: 70000,
  tradInit: 1000000, rothInit: 200000, tradInitA: 600000, tradInitB: 400000, rothInitA: 150000, rothInitB: 50000, taxableInit: 300000 });
const BRIDGE = { single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035, dobAYr: 1965, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
  ssA: 3000, ssB: 1800, ssAYr: 2032, ssAMo: 6, ssBYr: 2033, ssBMo: 6, pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.5,
  acaPremium: 1600, acaSize: 2, taxYieldPct: 1.5, currentConv: 0, tradInit: 900000, rothInit: 100000, tradInitA: 600000, tradInitB: 300000,
  rothInitA: 60000, rothInitB: 40000, taxableInit: 250000 };
// the review's case (scope §6, B1): a single filer in an ACA household of three or four, where the IRMAA target sits near the ACA cliff
const SGLB = { single: true, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035, dobAYr: 1966, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
  ssA: 2500, ssB: 0, ssAYr: 2028, ssAMo: 6, ssBYr: 2099, ssBMo: 6, pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.9,
  acaPremium: 5000, acaSize: 3, taxYieldPct: 1.5, currentConv: 0, tradInit: 1500000, rothInit: 0, tradInitA: 1500000, tradInitB: 0, rothInitA: 0, rothInitB: 0, taxableInit: 600000 };
// the app's P builder, reproduced from the loaded plan (L7296's shape) — the example and the fixtures through the same constructor the tab uses
const mkP = (G, gainPct, funding, extra = {}) => { const t = G.PLAN_TIMELINE(), ry = t.targetRetireYear;
  return { single: !!t.single, asOfYr: t.asOfYear, retireYr: ry, horizonYr: Math.max(t.dobA.year + t.lifeExpA, t.dobB.year + t.lifeExpB), ladderEnd: t.rothLadderEnd,
    dobAYr: t.dobA.year, dobBYr: t.dobB.year, deathYr1: t.single ? Infinity : Math.min(t.dobA.year + t.lifeExpA, t.dobB.year + t.lifeExpB),
    ssA: G.getSSA(), ssB: t.single ? 0 : G.getSSB(), ssAYr: t.ssA_date.year, ssAMo: t.ssA_date.month, ssBYr: t.ssB_date.year, ssBMo: t.ssB_date.month,
    pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: t.stateTaxRate || 0, stateCode: G.PORTFOLIO().stateCode || null,
    convTaxFunding: funding, taxableGainFrac: gainPct / 100, acaPremium: (G.PORTFOLIO().acaBridge || {}).premium || 0, acaSize: (G.PORTFOLIO().acaBridge || {}).size || 0,
    ...G.retireStartBalances(ry), ladderEndA: t.rothLadderEndA, ladderEndB: t.rothLadderEndB,
    survivor: t.single ? "A" : ((t.dobA.year + t.lifeExpA) >= (t.dobB.year + t.lifeExpB) ? "A" : "B"), taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: 70000,
    ordDrawByYr: G.withdrawalPlanSeries({ retireYear: ry, rothAmount: 70000, scenarioPreset: "base" }).ordDrawByYr, ...extra }; };
const fx = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
const load = (G, P, X = X0) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); return G.PLAN_TIMELINE(); };
const HH = [];
for (const gf of [0, 0.3, 0.5, 0.8]) for (const f of ["taxable", "withhold"]) HH.push([`t3 ${gf * 100}% ${f}`, { ...T3(), taxableGainFrac: gf, convTaxFunding: f }]);
HH.push(["t3 made single 50%", { ...T3(), single: true, deathYr1: Infinity, survivor: "A", tradInitB: 0, rothInitB: 0, tradInitA: 1000000, rothInitA: 200000, ssB: 0 }]);
HH.push(["t22 ACA bridge", { ...BRIDGE }]);
for (const size of [3, 4]) for (const prem of [1500, 5000]) for (const gf of [0.5, 0.9]) HH.push([`single bridge, ACA ${size}, $${prem}/mo, ${gf * 100}%`, { ...SGLB, acaSize: size, acaPremium: prem, taxableGainFrac: gf }]);
load(g, P0);
for (const [gp, f] of [[0, "taxable"], [30, "taxable"], [60, "taxable"], [30, "withhold"]]) HH.push([`example ${gp}% ${f}`, mkP(g, gp, f)]);
for (const n of Object.keys(fx.HOUSEHOLDS)) { load(g, P0); const p = fx.build(g, n); load(g, p); for (const gp of [0, 40]) HH.push([`fixture:${n} ${gp}%`, mkP(g, gp, "taxable")]); }
load(g, P0);
const fileOf = (P, yr) => !!P.single || yr > P.deathYr1;

// ── §A · D-62 — the solver ───────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — STAY UNDER IRMAA (D-62)");
T(`A-0: SETUP — ${HH.length} households (t3 ×8, single, the ACA bridge, 8 single-filer bridges, the example ×4, ${Object.keys(fx.HOUSEHOLDS).length} fixtures ×2)`,
  HH.length === 8 + 1 + 1 + 8 + 4 + 2 * Object.keys(fx.HOUSEHOLDS).length && Object.keys(fx.HOUSEHOLDS).length >= 17, String(HH.length));
if (POST) {
  T("A-0b: SETUP — the margin constant is $500 and its own (not ACA_CONSTS.solverMargin's binding)", X("IRMAA_SOLVER_MARGIN") === MARGIN
    && /const IRMAA_SOLVER_MARGIN = 500;/.test(SRC), String(X("IRMAA_SOLVER_MARGIN")));
  let years = 0, under = 0, maximal = 0, agree = 0, worstUnder = -Infinity, worstGap = 0, worstBridge = 0, bad = [], capBound = 0;
  for (const [lab, P] of HH) {
    for (const res of [g.runRothStrategies(P), g.runRothStrategies(P, [{ key: "gIrmaa", label: "UNDER IRMAA", policy: { kind: "irmaaCap" } }])]) {
      const r = res.find(x => x.key === "irmaa1" || x.key === "gIrmaa");
      const S = r.irmaaSolveByYr || {}, m = r.magiByYr || {}, cv = r.convByYr || {};
      for (const y of Object.keys(cv).map(Number)) {
        if (!(cv[y] > 0)) continue;
        years++; const s = S[y], th = thr1(y + 2, fileOf(P, y)), d = m[y] - (th - MARGIN);
        worstUnder = Math.max(worstUnder, d);
        if (d <= 0.5) under++; else bad.push(`${lab} ${y}: MAGI ${m[y].toFixed(2)} vs ${(th - MARGIN).toFixed(2)}`);
        if (s && s.thr === th && Math.abs(s.target - (th - MARGIN)) < 1e-9 && s.est <= th - MARGIN && (s.est1 > th - MARGIN || s.conv === s.hi)) { maximal++; if (s.conv === s.hi) capBound++; } else bad.push(`${lab} ${y}: not maximal ${JSON.stringify(s)}`);
        // 50¢, bridge years included: the estimate makes the engine's four ACA subsidy evaluations (a 3-pass estimate missed by up to $14.16
        // near the ACA cliff — the v6.35 build review). A year whose engine conversion is not the solver's answer fails here, not silently.
        const bridgeYr = r.acaSubByYr && (y in r.acaSubByYr);
        const gap = s && cv[y] === s.conv ? Math.abs(s.est - m[y]) : Infinity; if (bridgeYr) worstBridge = Math.max(worstBridge, gap); else worstGap = Math.max(worstGap, gap);
        if (gap <= 0.5) agree++; else bad.push(`${lab} ${y}: ${s && cv[y] === s.conv ? `estimate ${s.est.toFixed(2)} vs engine ${m[y].toFixed(2)}` : `engine converts ${cv[y]}, solver ${s && s.conv}`}`);
      }
    }
  }
  T(`A-1a: in every conversion year (${years}, across both the strategy and the optimizer's UNDER IRMAA cell), the engine's lookback MAGI is at or below the cliff less $500 (+50¢; worst ${worstUnder.toFixed(2)})`,
    years > 400 && under === years, bad.slice(0, 3).join(" | "));
  T(`A-1b: …and the conversion is the largest such whole dollar: its estimate is at or below the cliff less $500 (typed), one dollar more is above it (${maximal}/${years}; ${capBound} bound by the convertible balance instead)`, maximal === years, bad.slice(0, 3).join(" | "));
  T(`A-1c: …and the solver's estimate equals the engine's own lookback MAGI within 50¢, the engine converting exactly the solver's answer (worst $${worstGap.toFixed(2)} off the ACA bridge, $${worstBridge.toFixed(2)} on it)`, agree === years, bad.slice(0, 3).join(" | "));
  // A-1d: what the bisection needs. Not that the estimate never falls — it can (decided 2026-10-28, scope §7.2/§7.5: where a candidate lifts
  // MAGI over the ACA 100%-of-FPL floor a subsidy appears and the ACA-premium sale shrinks; found once in 624 year-grids, on the ACA bridge
  // household in 2028, a $10,226 drop at MAGI ≈ $33K) — but that the acceptable conversions form ONE range: along the headroom, once the
  // estimate is above the target it never comes back to or below it. Every household, every conversion year, a 201-point grid.
  globalThis.__dcIrmaaGrid = 200;
  let grids = 0, interval = 0, drops = 0, nearest = Infinity, ivBad = [];
  for (const [lab, P] of HH) {
    const r = g.runRothStrategies(P).find(x => x.key === "irmaa1");
    for (const [y, s] of Object.entries(r.irmaaSolveByYr || {})) { if (!s.grid) continue; grids++;
      let over = false, ok = true;
      for (let k = 0; k < s.grid.length; k++) { const v = s.grid[k];
        if (k && v < s.grid[k - 1] - 1e-6) { drops++; nearest = Math.min(nearest, s.target - s.grid[k - 1]); }
        if (v > s.target) over = true; else if (over) ok = false; }
      if (ok) interval++; else ivBad.push(`${lab} ${y}`); }
  }
  globalThis.__dcIrmaaGrid = 0;
  T(`A-1d: the acceptable conversions form one range in every year-grid (${interval}/${grids}, 201 points each) — the property the bisection needs`, grids > 500 && interval === grids, ivBad.slice(0, 4).join(", "));
  T(`A-1d2: where the estimate falls at all (${drops} step${drops === 1 ? "" : "s"}), it is far under the target (nearest $${Number.isFinite(nearest) ? Math.round(nearest).toLocaleString() : "—"}; bound $100,000)`,
    !Number.isFinite(nearest) || nearest > 100000, String(nearest));
  // the cases that cycled a fixed point (scope §6, B1): now under, every year, and no surcharge of its own making
  { const sb = HH.filter(([l]) => /single bridge/.test(l)).map(([l, P]) => [l, g.runRothStrategies(P).find(x => x.key === "irmaa1")]);
    T(`A-1e: the eight single-filer ACA-bridge households land under in every conversion year — the fixed point's period-2 cycle cannot recur in a search`,
      sb.length === 8 && sb.every(([, r]) => Object.entries(r.convByYr).filter(([, c]) => c > 0).every(([y]) => r.magiByYr[y] <= thr1(+y + 2, true) - MARGIN + 0.5)),
      sb.map(([l, r]) => `${l}:${r.totIrmaa}`).join(" "));
  }
  // the defect, from outside: on t3's household STAY UNDER IRMAA paid $10,645 (50%, sale) and $3,986 (withheld, two sub-dollar crossings)
  const t3s = g.runRothStrategies({ ...T3() }), t3w = g.runRothStrategies({ ...T3(), convTaxFunding: "withhold" });
  T("A-1f: t3's household — STAY UNDER IRMAA now pays $0 of IRMAA, paid from the brokerage or withheld (v6.34: $10,645 and $3,986, where NO CONVERSIONS pays $0)",
    t3s.find(r => r.key === "irmaa1").totIrmaa === 0 && t3w.find(r => r.key === "irmaa1").totIrmaa === 0 && t3s.find(r => r.key === "none").totIrmaa === 0,
    `${t3s.find(r => r.key === "irmaa1").totIrmaa} / ${t3w.find(r => r.key === "irmaa1").totIrmaa}`);
} else {
  const t3s = g.runRothStrategies({ ...T3() }), t3w = g.runRothStrategies({ ...T3(), convTaxFunding: "withhold" });
  T(`A-1 ${KD}: on t3's household (50%, sold from the brokerage) STAY UNDER IRMAA pays $10,645 of IRMAA where NO CONVERSIONS pays $0`,
    t3s.find(r => r.key === "irmaa1").totIrmaa === 10645 && t3s.find(r => r.key === "none").totIrmaa === 0, String(t3s.find(r => r.key === "irmaa1").totIrmaa));
  T(`A-1b ${KD}: …and withheld from the conversion it still pays $3,986 — two crossings under a dollar, from rounding (cause 2)`,
    t3w.find(r => r.key === "irmaa1").totIrmaa === 3986, String(t3w.find(r => r.key === "irmaa1").totIrmaa));
  T(`A-1c ${KD}: the seams and the margin constant do not exist on this leg`, X("IRMAA_SOLVER_MARGIN") === undefined && !("magiByYr" in t3s[0]) && !/IRMAA_SOLVER_MARGIN/.test(SRC));
}

// A-2: every other strategy bit-identical to v6.34, field for field (enumerable fields: the JSON a caller sees)
if (POST && PM) {
  const pg = PM.__g;
  let rows = 0, same_ = 0, diffs = [];
  for (const [lab, P] of HH) {
    if (/^example|^fixture/.test(lab)) continue;   // hand-built Ps only here: the app-built ones are below, on both modules' own loads
    const a = g.runRothStrategies(P), b = pg.runRothStrategies(P);
    for (const r of a) { if (r.key === "irmaa1") continue; const o = b.find(x => x.key === r.key); rows++; if (o && JSON.stringify(r) === JSON.stringify(o)) same_++; else diffs.push(`${lab}/${r.key}`); }
  }
  for (const n of [null, ...Object.keys(fx.HOUSEHOLDS)]) {
    load(g, P0); const p = n ? fx.build(g, n) : clone(P0); load(g, p); load(pg, p);
    for (const gp of [0, 40]) { const a = g.runRothStrategies(mkP(g, gp, "taxable")), b = pg.runRothStrategies(mkP(pg, gp, "taxable"));
      for (const r of a) { if (r.key === "irmaa1") continue; const o = b.find(x => x.key === r.key); rows++; if (o && JSON.stringify(r) === JSON.stringify(o)) same_++; else diffs.push(`${n || "example"} ${gp}%/${r.key}`); } }
  }
  load(g, P0); load(pg, P0);
  T(`A-2: every other strategy — none, fill12, fill22, fill24, current, and acaCliff where it runs — is bit-identical to v6.34 (${same_}/${rows} rows)`,
    rows > 200 && same_ === rows, diffs.slice(0, 5).join(", "));
  const acaRows = (() => { const a = g.runRothStrategies(BRIDGE), b = pg.runRothStrategies(BRIDGE); const x = a.find(r => r.key === "acaCliff"), y = b.find(r => r.key === "acaCliff");
    return x && y && JSON.stringify(x) === JSON.stringify(y) && x.totConv > 0; })();
  T("A-2b: STAY UNDER ACA CLIFF — the strategy whose estimate was lifted out — runs and is bit-identical on the ACA-bridge household", acaRows);
} else if (POST && !SKIP_PM) T("A-2: SETUP — the v6.34 module is beside this one", false, PRIOR_PATH);

// the hand cases run with a plan that is NOT the example loaded: Engine A's work income reads the example's built-in spouse-B work (D-49)
// from the loaded plan, so a hand-built P run beside the example gets $20,000 of wages in its first year (t33 records the same)
const notExample = P => { const Q = clone(P); Q.positions = Q.positions.map((x, i) => { if (i) return x; const y = { ...x, balance: (x.balance || 0) + 1000 };
  if ((y.trad || 0) > 0) y.trad += 1000; else if ((y.roth || 0) > 0) y.roth += 1000; return y; }); Q.household = (Q.household || 0) + 1000; return Q; };
load(g, notExample(P0));
// A-3: one year by hand. One person, no Social Security, pension, dividends or state tax, retiring in the as-of year. Year 1 (2026): the
// pool is at its basis (no carry: retirement = as-of), so the sale realizes nothing in that year, and the lookback MAGI is the conversion
// alone. The search then makes it the largest whole dollar with conv ≤ thr − 500 and conv + 500 ≤ thr: thr − 500 rounded down.
// Year 2: the pool has grown and carries gain, so the sale's gain now counts — the year's conversion is lower than thr(2029) − 500 by it.
{
  const H = { single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2040, ladderEnd: 2035, dobAYr: 1961, dobBYr: 1961, deathYr1: Infinity, survivor: "A",
    ssA: 0, ssB: 0, ssAYr: 2099, ssAMo: 1, ssBYr: 2099, ssBMo: 1, pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0,
    acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0, tradInit: 2000000, rothInit: 0, tradInitA: 2000000, tradInitB: 0, rothInitA: 0, rothInitB: 0, taxableInit: 800000 };
  const r = g.runRothStrategies(H).find(x => x.key === "irmaa1");
  // the premium year 2028's first single threshold, by hand: $109,000 × (1 + i)^2 (2026's table indexed two years at CPI-U)
  const th28 = SGL26[0] * Math.pow(1 + RATE, 2);
  const want26 = Math.floor(th28 - MARGIN);
  if (POST) {
    T(`A-3: one year by hand — 2026, a pure-basis pool: the conversion is ⌊$109,000 × (1+i)² − $500⌋ = $${want26.toLocaleString()} and the lookback MAGI is that conversion`,
      r.convByYr[2026] === want26 && Math.abs(r.magiByYr[2026] - want26) < 1e-6, `${r.convByYr[2026]} / ${r.magiByYr[2026]}`);
    const th29 = SGL26[0] * Math.pow(1 + RATE, 3);
    T(`A-3b: 2027 — the pool now carries gain: conversion + the sale's gain + 0 = the lookback MAGI, at or below $${Math.round(th29 - MARGIN).toLocaleString()}, and the conversion is under the gain-free figure`,
      r.convByYr[2027] < Math.floor(th29 - MARGIN) && r.magiByYr[2027] <= th29 - MARGIN + 0.5 && r.magiByYr[2027] - r.convByYr[2027] > 0, `${r.convByYr[2027]} / ${r.magiByYr[2027]}`);
  } else T(`A-3 ${KD}: the same household's 2026 conversion is ⌊threshold⌋ exactly, with no margin`, r.totConv > 0 && !("convByYr" in r));
}
if (POST) {
  // A-4: the margin is IRMAA's alone — the ACA constant does not move STAY UNDER IRMAA
  const A0 = g.ACA_CONSTS(), was = A0.solverMargin;
  const before = JSON.stringify(g.runRothStrategies({ ...T3() }).find(r => r.key === "irmaa1"));
  A0.solverMargin = 1234; const after = JSON.stringify(g.runRothStrategies({ ...T3() }).find(r => r.key === "irmaa1")); A0.solverMargin = was;
  T("A-4: changing ACA_CONSTS.solverMargin leaves STAY UNDER IRMAA unchanged (its margin is IRMAA_SOLVER_MARGIN)", before === after);
}
// A-5: copy
{
  const strs = []; walk.full(AST, n => { if (n.type === "Literal" && typeof n.value === "string") strs.push(n.value); else if (n.type === "TemplateElement") strs.push(n.value.cooked || ""); else if (n.type === "JSXText") strs.push(n.value); }, W);
  const anyStr = s => strs.some(x => x.includes(s));
  const DOCS = String(g.DOCS_HTML());
  if (POST) {
    T("A-5: the Roth tab says STAY UNDER IRMAA keeps MAGI, the sale's gain included, at least $500 under the cliff",
      anyStr("\"STAY UNDER IRMAA\" converts the most it can while keeping the year's MAGI — the gain from the sale that pays the year's tax included — at least $500 under the first surcharge cliff."));
    T("A-5b: EXTINCTION (AST, every string) — the v6.29 sentence that it converts on income before the sale is gone",
      !anyStr("converts up to the first surcharge cliff on income before the year's tax-paying sale") && !anyStr("can still lift MAGI over it"));
    T("A-5c: the Field Manual's Roth section says the same, dated v6.35", DOCS.includes("Its sibling, <strong>STAY UNDER IRMAA</strong>, converts the most it can while keeping the year’s MAGI")
      && DOCS.includes("at least $500 under the first Medicare surcharge cliff (v6.35;"));
  } else T(`A-5 ${KD}: the Roth tab discloses the crossing (v6.29)`, anyStr("a gain that sale realizes can still lift MAGI over it."));
}

// ── §B · D-65 — the last working years ─────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the last working years' MAGI (D-65)");
// B-1: blank changes nothing, against the v6.34 module, on the example and every fixture
if (POST && PM) {
  const pg = PM.__g, pe = PM.__engines;
  let n = 0, ok = 0, bad = [];
  for (const name of [null, ...Object.keys(fx.HOUSEHOLDS)]) {
    load(g, P0); const p = name ? fx.build(g, name) : clone(P0); load(g, p); load(pg, p);
    const RY = g.PLAN_TIMELINE().targetRetireYear, args = { retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 };
    const c1 = E.computeIrmaaPlan(args), c0 = pe.computeIrmaaPlan(args);
    const s1 = g.mcIncomeTaxSchedule(RY, { rothAmount: 70000 }), s0 = pg.mcIncomeTaxSchedule(RY, { rothAmount: 70000 });
    const w1 = g.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" }).schedule, w0 = pg.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" }).schedule;
    const strip = c => ({ rows: c.rows, t: c.totalIrmaa, tt: c.totalIrmaaToday, y: c.yearsHit });
    const checks = [["Engine C", same(strip(c1), strip(c0))], ["MC schedule", same(s1, s0)], ["Engine D", same(w1, w0)]];
    for (const [k, v] of checks) { n++; if (v) ok++; else bad.push(`${name || "example"}: ${k}`); }
  }
  load(g, P0); load(pg, P0);
  T(`B-1: with the field blank, Engine C's rows and totals, the Monte Carlo's schedule and Engine D's schedule are bit-identical to v6.34 on the example and every fixture (${ok}/${n})`,
    n >= 54 && ok === n, bad.slice(0, 4).join(", "));
  // Engine A with the field blank: covered by A-2 (every strategy but irmaa1, both modules' own P builders, workMagi 0 on this leg)
}
// B-1b reads this leg's module only, so it runs whether or not the v6.34 module is beside it (v6.36: moved out of the block above)
if (POST) T("B-1b: a P object without workMagi seeds nothing: STAY UNDER IRMAA's lookback holds no year before retirement", (() => {
    const r = g.runRothStrategies(T3()).find(x => x.key === "irmaa1"); return Object.keys(r.magiByYr).every(y => +y >= 2027); })());
load(g, notExample(P0));   // see A-3's note
// B-2: by hand — Engine A, a household whose last two working years are filed returns (DW-4 (a): taken as entered), both spouses on Medicare,
// nothing else near a tier: the two premium years' surcharges are the published tier-2 figure × 2 persons × the index to the premium year
{
  const HA = { single: false, asOfYr: 2027, retireYr: 2027, horizonYr: 2045, ladderEnd: 2030, dobAYr: 1960, dobBYr: 1961, deathYr1: Infinity, survivor: "A",
    ssA: 2000, ssB: 1500, ssAYr: 2027, ssAMo: 1, ssBYr: 2027, ssBMo: 1, pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0,
    acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0, tradInit: 400000, rothInit: 0, tradInitA: 300000, tradInitB: 100000, rothInitA: 0, rothInitB: 0, taxableInit: 500000 };
  const none = (wm) => g.runRothStrategies({ ...HA, ...(wm ? { workMagi: wm } : {}) }).find(r => r.key === "none");
  const a0 = none(0), a1 = none(300000);
  // 2027 premium: MAGI(2025) $300,000 against the 2027 MFJ tiers (2026's × (1+i)): above $274,000 × (1+i), at most $342,000 × (1+i) → tier 2
  const tier = m => { let i = 0; while (i < 4 && m > MFJ26[i] * Math.pow(1 + RATE, 1)) i++; return i; };
  const hand = [2027, 2028].reduce((t, py) => { const k = (m => { let i = 0; while (i < 4 && m > MFJ26[i] * Math.pow(1 + RATE, py - 2026)) i++; return i; })(300000);
    return t + SUR26[k] * 2 * Math.pow(1 + RATE, py - 2026); }, 0);
  if (POST) {
    T(`B-2: Engine A by hand — $300,000 entered for 2025 and 2026 (filed returns, taken as entered): tier ${tier(300000)}, two people, 2027 and 2028 billed $${hand.toFixed(2)} together`,
      tier(300000) === 2 && Math.abs((a1.totIrmaa - a0.totIrmaa) - hand) <= 1 && a0.totIrmaa === 0, `${a1.totIrmaa} − ${a0.totIrmaa} vs ${hand.toFixed(2)}`);
    T("B-2b: …the lookback holds the entry exactly for 2025 and 2026 (no deflation of a past year — DW-4 (a))", a1.magiByYr[2025] === 300000 && a1.magiByYr[2026] === 300000);
    T("B-2c: …and blank (0) seeds nothing: v6.34's figure", !(2025 in a0.magiByYr) && !(2026 in a0.magiByYr));
    // the single case: one person, $150,000 entered — above $137,000 × (1+i), at most $171,000 × (1+i): single tier 2, one person
    const HS = { ...HA, single: true, ssB: 0, tradInitA: 400000, tradInitB: 0 };
    const s0 = g.runRothStrategies(HS).find(r => r.key === "none"), s1 = g.runRothStrategies({ ...HS, workMagi: 150000 }).find(r => r.key === "none");
    const handS = [2027, 2028].reduce((t, py) => { let k = 0; while (k < 4 && 150000 > SGL26[k] * Math.pow(1 + RATE, py - 2026)) k++; return t + SUR26[k] * 1 * Math.pow(1 + RATE, py - 2026); }, 0);
    T(`B-2g: a single plan by hand — $150,000 entered: single tier 2, one person, $${handS.toFixed(2)} over 2027 and 2028`, Math.abs((s1.totIrmaa - s0.totIrmaa) - handS) <= 1 && handS > 0,
      `${s1.totIrmaa} − ${s0.totIrmaa} vs ${handS.toFixed(2)}`);
  } else T(`B-2 ${KW}: the same household's first two premium years carry no surcharge whatever its working income (no field exists)`, a1.totIrmaa === 0 && a0.totIrmaa === 0);
}
// B-2d/e: Engine C by hand on the example's calendar (as-of 2026, retiring 2029; A on Medicare from 2029, B from 2031): $300,000 entered,
// carried to 2027 and 2028 at the plan's inflation; tier 2; one person; $2,880 each in today's dollars
if (POST) {
  load(g, { ...clone(P0), workMagi: 300000 });
  const RY = g.PLAN_TIMELINE().targetRetireYear;
  const c = E.computeIrmaaPlan({ retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 });
  const w = c.rows.filter(r => r.working);
  const handMagi = y => 300000 * Math.pow(1 + RATE, y - 2026);
  const handNom = py => SUR26[2] * 1 * Math.pow(1 + RATE, py - 2026);
  T(`B-2d: Engine C prepends exactly two working rows, ${RY - 2} and ${RY - 1}, billed in ${RY} and ${RY + 1}`, w.length === 2 && c.rows[0].working && c.rows[1].working && !c.rows[2].working
    && w[0].yr === RY - 2 && w[1].yr === RY - 1 && w[0].irmaaYr === RY && w[1].irmaaYr === RY + 1, JSON.stringify(w.map(r => [r.yr, r.irmaaYr])));
  T("B-2e: …each row's MAGI is the entry carried at the plan's inflation, tier 2, one person, $2,880 in today's dollars, and its nominal surcharge by hand",
    w.every(r => Math.abs(r.magi - handMagi(r.yr)) < 1e-6 && r.tier === 2 && r.personsOnMedicare === 1 && Math.abs(r.surchargeToday - 2880) < 1e-6 && Math.abs(r.surchargeAnnual - handNom(r.irmaaYr)) < 1e-6
      && r.conv_y === 0 && r.headroom === Infinity), JSON.stringify(w.map(r => [r.magi, r.tier, r.surchargeToday])));
  T("B-2f: …and the totals include them: lifetime IRMAA in today's dollars rises by exactly $5,760", (() => { load(g, P0);
    const c0 = E.computeIrmaaPlan({ retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 }); return Math.abs((c.totalIrmaaToday - c0.totalIrmaaToday) - 5760) < 1e-6 && c.yearsHit === c0.yearsHit + 2; })());
  // B-3: the tier edge on the carried MAGI: entered so that 2028's carried figure sits exactly on 2030's first threshold → standard; $1 more → tier 1
  { const t30 = MFJ26[0] * Math.pow(1 + RATE, 4), entry = t30 / Math.pow(1 + RATE, 2);
    load(g, { ...clone(P0), workMagi: entry }); const r0 = E.computeIrmaaPlan({ retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 }).rows.find(r => r.yr === RY - 1);
    load(g, { ...clone(P0), workMagi: entry + 2 }); const r1 = E.computeIrmaaPlan({ retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 }).rows.find(r => r.yr === RY - 1);
    T(`B-3: the tier edge, on the carried MAGI — at the threshold (±1¢) is standard; $2 of entry above it is tier 1`, r0 && r1 && Math.abs(r0.magi - t30) < 0.01 && r0.tier === 0 && r1.tier === 1, `${r0 && r0.magi} ${r0 && r0.tier} / ${r1 && r1.tier}`); }
  // B-4: Engines A and C agree on the two working years — the same MAGI in the lookback, and Engine A's 'none' IRMAA rises by exactly Engine C's rows
  { load(g, { ...clone(P0), workMagi: 300000 }); const PA = mkP(g, 0, "taxable", { workMagi: X("workMagi")(), taxableInit: 0 });
    const a1 = g.runRothStrategies(PA).find(r => r.key === "none"), a0 = g.runRothStrategies({ ...PA, workMagi: 0 }).find(r => r.key === "none");
    const cw = E.computeIrmaaPlan({ retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 }).rows.filter(r => r.working);
    T("B-4: Engines A and C agree — Engine A's lookback holds Engine C's two working MAGIs, and its NO CONVERSIONS IRMAA rises by the two rows' surcharges (±$1)",
      cw.length === 2 && cw.every(r => Math.abs(a1.magiByYr[r.yr] - r.magi) < 1e-6) && Math.abs((a1.totIrmaa - a0.totIrmaa) - cw.reduce((t, r) => t + r.surchargeAnnual, 0)) <= 1,
      `${a1.totIrmaa} − ${a0.totIrmaa} vs ${cw.reduce((t, r) => t + r.surchargeAnnual, 0).toFixed(2)}`); }
  // B-5: the Monte Carlo's schedule bills them in their premium years
  { load(g, { ...clone(P0), workMagi: 300000 }); const s = g.mcIncomeTaxSchedule(RY, { rothAmount: 70000 });
    const cw = E.computeIrmaaPlan({ retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 }).rows.filter(r => r.working);
    load(g, P0); const s0 = g.mcIncomeTaxSchedule(RY, { rothAmount: 70000 });
    T(`B-5: the Monte Carlo's schedule gains ${RY} and ${RY + 1} at Engine C's surchargeToday, and nothing else moves`, cw.length === 2 && (s.irmaaByYr[RY] || 0) > 0 && cw.every(r => Math.abs((s.irmaaByYr[r.irmaaYr] || 0) - r.surchargeToday) < 1e-9)
      && !(RY in s0.irmaaByYr) && Object.keys(s.byYr).every(y => +y === RY || +y === RY + 1 ? Math.abs(s.byYr[y] - s0.byYr[y] - (s.irmaaByYr[y] || 0)) < 1e-9 : s.byYr[y] === s0.byYr[y]),
      JSON.stringify(Object.keys(s.irmaaByYr).slice(0, 4))); }
  load(g, P0);
} else T(`B-2d ${KW}: Engine C's first row is the retirement year (no working rows), on the example`, (() => { load(g, P0); const RY = g.PLAN_TIMELINE().targetRetireYear;
  const c = E.computeIrmaaPlan({ retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 }); return c.rows[0].yr === RY && !c.rows.some(r => r.working); })());
// B-6: every object passed to runRothStrategies carries workMagi (AST: the nearest preceding declaration of the argument)
{
  const calls = [], decls = [];
  walk.full(AST, n => {
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "runRothStrategies") calls.push(n);
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init && n.init.type === "ObjectExpression") decls.push(n);
  }, W);
  const carries = call => { const a = call.arguments[0]; if (!a) return false;
    const obj = a.type === "ObjectExpression" ? a : a.type === "Identifier" ? decls.filter(d => d.id.name === a.name && d.start < call.start).sort((x, y) => y.start - x.start)[0]?.init : null;
    return !!obj && obj.properties.some(p => p.type === "Property" && ((p.key.type === "Identifier" && p.key.name === "workMagi") || p.key.value === "workMagi")); };
  // v6.36 (D-66): What Breaks' builder left with its call (it reads the Monte Carlo's schedule), so three sites from v6.36. An array, so the registrar widens it.
  const B6_N = ["v636", "v637", "v638", "v639", "v640"].includes(VER) ? 3 : 4;
  if (POST) T(`B-6: every object passed to runRothStrategies carries workMagi — ${calls.length} call sites (${B6_N} expected; one more builder without it fails here)`, calls.length === B6_N && calls.every(carries),
    calls.filter(c => !carries(c)).map(c => `L${c.loc.start.line}`).join(", "));
  else T(`B-6 ${KW}: no object passed to runRothStrategies carries workMagi (${calls.length} call sites)`, calls.length === 4 && !calls.some(carries));
}

// ── the DOM harness (t95's, with t97's export capture) ─────────────────────────────────────────────────────────────────────────────────
const PREFIX = "dc:";
window.confirm = () => true;
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
const grab = b => { window.__lastBlob = b; return "blob:t98"; };
window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();
const DX = n => (DG[n] !== undefined ? DG[n] : (window.__test || {})[n]);
const DRAFT = "danger_close:mydata_draft_v1";
const body = () => window.document.body;
const txt = () => { const c = body().cloneNode(true); c.querySelectorAll("style,script").forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " "); };
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
let root = null, act, DangerClose, el;
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const setInput = async (x, v) => { if (!x) return false; try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(x, String(v)); x.dispatchEvent(new window.Event("input", { bubbles: true })); }); } catch (e) {} await flush(); return true; };
const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); await flush(); await flush(150); };
const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
const seed = async (portfolio, expenses = X0) => { await unmount(); window.localStorage.clear(); put("portfolio", portfolio); put("expenses", expenses); await render(); };
const stored = k => JSON.parse(window.localStorage.getItem(PREFIX + K[k]) || "null");
const save = async () => { await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush(); };
const exportB = async () => { window.__lastBlob = null; await click(btn(/EXPORT BACKUP/)); await flush(); try { return JSON.parse(await window.__lastBlob.text()); } catch (e) { return null; } };
const workIn = () => body().querySelector("[data-dc-work-magi]");
const pickYr = async tag => { const b = [...body().querySelectorAll("button.rbtn")].find(x => (x.textContent || "").includes(tag)); await click(b); await flush(200); return !!b; };

// B-7: the round trip through the real controls
if (POST) {
  await seed(clone(P0)); await go("my data");
  T("B-7: SETUP — My Data shows the field, blank on the example", !!workIn() && workIn().value === "", workIn() && workIn().value);
  await setInput(workIn(), "300,000"); await save();
  T("B-7a: Save & Apply stores workMagi 300000", (stored("portfolio") || {}).workMagi === 300000, JSON.stringify((stored("portfolio") || {}).workMagi));
  const bk = await exportB();
  T("B-7b: Export Backup carries it, and Ask AI's plan description gains the line (B-10)", !!bk && bk.portfolio.workMagi === 300000
    && /LAST WORKING YEARS: household MAGI about \$300,000 a year \(today's dollars\)/.test(bk.masterPrompt || ""), bk && String(bk.masterPrompt || "").slice(-400));
  await go("my data");
  T("B-7c: the next visit shows the stored figure", workIn() && workIn().value === "300000", workIn() && workIn().value);
  await setInput(workIn(), "");
  try { await act(async () => { await new Promise(r => setTimeout(r, 2600)); }); } catch (e) {} await flush();
  let dr = null; try { dr = JSON.parse(window.localStorage.getItem(PREFIX + DRAFT)).portfolio; } catch (e) {}
  T("B-7d: blanking it writes a draft without the field (blank is not stored — it reads 0)", !!dr && !("workMagi" in dr && dr.workMagi != null));
  await save();
  T("B-7e: …and Save & Apply then stores none, and the plan reads 0", !((stored("portfolio") || {}).workMagi > 0) && DX("workMagi")() === 0);
  { const bk0 = await exportB(); T("B-10: blank — Ask AI's plan description has no LAST WORKING YEARS line", !!bk0 && typeof bk0.masterPrompt === "string" && !/LAST WORKING YEARS/.test(bk0.masterPrompt)); }
  // hostile values in a backup: text, negative, huge, "NaN"
  const hv = [];
  for (const v of ["abc", -5000, 1e12, "NaN", 250000]) { await seed({ ...clone(P0), workMagi: v }); hv.push(DX("workMagi")()); }
  T("B-7f: hostile values load as 0, 0, the $10,000,000 ceiling, 0 — and a good one as itself", same(hv, [0, 0, 10000000, 0, 250000]), JSON.stringify(hv));
  await seed(clone(P0));
  T("B-7g: a backup without the field loads blank and reads 0 (no key added)", DX("workMagi")() === 0 && !("workMagi" in DG.PORTFOLIO()));
  // Start Fresh and the guided setup write none (AST: their plan literals carry no workMagi key)
  const lits = []; walk.full(AST, n => { if (n.type === "ObjectExpression" && n.properties.some(p => p.key && (p.key.name === "homeMoveCash") && p.value && p.value.type === "Literal" && p.value.value === 0)) lits.push(n); }, W);
  T(`B-7h: Start Fresh and the guided setup (${lits.length} plan literals) write no workMagi`, lits.length === 2 && lits.every(o => !o.properties.some(p => p.key && p.key.name === "workMagi")));
}
// B-8 / B-9: the copy on four surfaces, blank and set; the flag
{
  await seed(clone(P0));
  await go("irmaa"); const ir0 = txt();
  await go("monte carlo"); const mc0 = txt();
  await go("what breaks"); const wb0 = txt();
  if (POST) {
    T("B-8: blank — the IRMAA tab keeps the v6.31 sentence and points to the field", /so those two years carry no surcharge here, in the Monte Carlo or in What Breaks — if your working income was above a tier, the model reads low for them\. Enter that income on My Data \(Household MAGI in your last working years\) to charge them\./.test(ir0)
      && /Form SSA-44/.test(ir0) && !/· your entry/.test(ir0), ir0.slice(ir0.indexOf("If you've just retired"), ir0.indexOf("If you've just retired") + 300));
    T("B-8b: blank — the Monte Carlo tab says the first two years' premiums are not charged unless entered", mc0.includes("(the first two years' premiums, which working-year income sets, are not charged unless you enter it on My Data)"));
    T("B-8c: blank — What Breaks says the same", wb0.includes("except the first two years' premiums, which working-year income sets, unless you enter it on My Data;"));
    T("B-9: the example (no salaries) shows no flag", !body().querySelector("[data-dc-irmaa-work-flag]") && !/salaries on My Data add up/.test(ir0));
    await seed({ ...clone(P0), workMagi: 300000 });
    await go("irmaa"); const ir1 = txt(), rows1 = body().querySelectorAll("[data-dc-irmaa-work-row]").length;
    await go("monte carlo"); const mc1 = txt();
    await go("what breaks"); const wb1 = txt();
    await go("income"); const in1 = txt();
    const RY = DG.PLAN_TIMELINE().targetRetireYear;
    T("B-8d: set — the IRMAA tab says they are charged, marks two rows · your entry, and keeps SSA-44", rows1 === 2 && ir1.includes("which you entered on My Data; they are charged here (the two rows marked · your entry), in the Monte Carlo and in What Breaks.")
      && /Form SSA-44/.test(ir1) && !ir1.includes("so those two years carry no surcharge here"), String(rows1));
    T("B-8e: set — the Monte Carlo tab and What Breaks say the first two years are included", mc1.includes("(the first two years' premiums included, from the working-year MAGI you entered on My Data)")
      && wb1.includes("the first two years' premiums from the working-year MAGI you entered on My Data;"));
    T(`B-8f: set — the Income tab's IRMAA line starts in the retirement year (${RY})`, new RegExp(`plus IRMAA from ${RY}:`).test(in1), (in1.match(/plus IRMAA from \d{4}/) || [])[0]);
    // the flag: salaries above the first joint threshold ($218,000) with the field blank
    await seed({ ...clone(P0), salaryA: 200000, salaryB: 40000 });
    await go("irmaa"); const fl = body().querySelector("[data-dc-irmaa-work-flag]");
    await go("my data"); const fl2 = body().querySelector("[data-dc-work-magi-flag]");
    // the bar in today's dollars, by hand: the first premium year's (2029) joint threshold, $218,000 × (1+i)^3, over the carry to the first
    // lookback year (2027), (1+i)^1 — the salaries are carried as the field would be
    // (the DOM bundle's own inflation: the rendered app runs under its scenario preset, t81's _iD)
    const RD = Object.values(DG.SCENARIOS()).reduce((u, x) => u + x.prob * x.inflation, 0);
    const bar = Math.round(MFJ26[0] * Math.pow(1 + RD, 3) / Math.pow(1 + RD, 1));
    T(`B-9b: blank field, salaries $240,000 above the bar ($${bar.toLocaleString()} today, joint) — the IRMAA tab and My Data flag it`, !!fl && !!fl2
      && fl.textContent.includes(`The salaries on My Data add up to $240,000, above the first surcharge tier ($${bar.toLocaleString()} joint)`),
      fl && fl.textContent.slice(0, 200));
    await setInput(workIn(), "150000");
    T("B-9c: …entering the figure clears My Data's flag", !body().querySelector("[data-dc-work-magi-flag]"));
    await seed({ ...clone(P0), salaryA: 200000, salaryB: 40000, dobA: "1975-01-01", dobB: "1976-01-01" });
    await go("irmaa"); const yf = !!body().querySelector("[data-dc-irmaa-work-flag]");
    await seed({ ...clone(P0), workMagi: 300000, dobA: "1975-01-01", dobB: "1976-01-01" });
    await go("irmaa"); const yt = txt();
    T("B-9e: nobody on Medicare in the two premium years (a couple born 1975–76 retiring in 2029): no flag, and the set field's sentence says it carries no surcharge",
      !yf && yt.includes("nobody in the plan is on Medicare in the two years it sets, so it carries no surcharge") && !yt.includes("they are charged here (the two rows marked"), String(yf));
    T("B-9d: workMagiFlag by unit — under the threshold no flag; single counts A only; set field no flag",
      DX("workMagiFlag")(100000, 100000, false, 2028, 2026, {}) === null && DX("workMagiFlag")(120000, 900000, true, 2028, 2026, {}) !== null && DX("workMagiFlag")(100000, 0, true, 2028, 2026, {}) === null
      && DX("workMagiFlag")(500000, 0, false, 2028, 2026, { workMagi: 1 }) === null && DX("workMagiFlag")(500000, 0, false, 2028, 2026, {}, false) === null && DX("workMagiFlag")("$250,000", "", false, 2028, 2026, {}).sum === 250000
      && Math.abs(DX("workMagiFlag")(250000, 0, false, 2028, 2026, {}).thr - MFJ26[0] * Math.pow(1 + Object.values(DG.SCENARIOS()).reduce((u, x) => u + x.prob * x.inflation, 0), 2)) < 1e-6);
  } else {
    T(`B-8 ${KW}: the IRMAA tab says the first two years carry no surcharge, with no field to enter`, /so those two years carry no surcharge here, in the Monte Carlo or in What Breaks — if your working income was above a tier, the model reads low for them\. Form SSA-44/.test(ir0));
    T(`B-8b ${KW}: My Data has no such field`, (await go("my data"), !workIn()));
  }
  // the Field Manual and METHODOLOGY
  const DOCS = String((POST ? DG : g).DOCS_HTML());
  if (POST) {
    T("B-8g: the Field Manual's three passages describe both cases, and §13's v6.35 entry comes before v6.34's", DOCS.includes("so the premiums priced off your last working years are charged only if you enter that income on My Data (<strong>Household MAGI in your last working years</strong>, from v6.35)")
      && DOCS.includes("they are charged here, on the IRMAA tab and in What Breaks only if you enter that income on My Data (from v6.35)") && DOCS.includes("the first two years’ premiums, which working-year income sets, only if you enter that income on My Data (from v6.35)")
      && DOCS.indexOf("(v6.35).</strong>") > 0 && DOCS.indexOf("(v6.35).</strong>") < DOCS.indexOf("(v6.34).</strong>"));
    T("B-8h: EXTINCTION — the Field Manual's v6.31 current-behaviour wording is gone; its v6.31 history entry stays", !DOCS.includes("which no tab projects, so they are not charged here, on the IRMAA tab or in What Breaks")
      && !DOCS.includes("are not projected at all — and, from v6.31, not charged in the Monte Carlo or What Breaks either") && DOCS.includes("Not charged anywhere: the first two years’ premiums after retirement") && /SSA-44/.test(DOCS));
    const MP = [join(HERE, "..", "METHODOLOGY.md"), join(HERE, "METHODOLOGY.md")].find(existsSync);
    if (MP) { const md = readFileSync(MP, "utf8");
      T("B-8i: METHODOLOGY has the v6.35 section naming D-62, D-65 and D-44, and the v6.31 section's D-65 bullet is rewritten",
        /^## STAY UNDER IRMAA, the last working years, and one-time rows before retirement \(v6\.35\)$/m.test(md) && /D-62/.test(md) && /workMagi/.test(md) && /preRetireOneTime/.test(md)
        && !/The first two premium years after retirement carry no surcharge anywhere\*\* \(MissingFeatures \*\*D-65\*\*, filed at this build\)\. They are set/.test(md));
    } else console.log("  B-8i — skipped by design (METHODOLOGY.md not found beside this run)");
  }
}

// ── §C · D-44 — one-time rows before retirement ──────────────────────────────────────────────────────────────────────────────────────
console.log("  C — one-time rows before retirement (D-44)");
const ROW = (amt, ym, name = "t98 row") => ({ cat: "Retirement Life", name, amount: amt, freq: "once", start: ym, end: ym });
const sched = (G, RY) => G.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" });
if (POST) {
  // C-1: by hand on the example — today: household $1,647,000, total401k $1,500,000; the after-tax brokerage rows add to $21,000 (typed: 5,000 ×3
  // + 6,000); a $30,000 row in May 2027 takes the $21,000 and then $9,000 from the buckets pro rata (× 1 − 9,000/1,500,000); then the carry
  load(g, P0); const RY = g.PLAN_TIMELINE().targetRetireYear, rb = Math.pow(1 + RATE, RY - 2026);
  const o0 = sched(g, RY)._opening; load(g, P0, [...X0, ROW(30000, "2027-05")]); const o1 = sched(g, RY)._opening;
  const k = 1 - 9000 / 1500000;
  T(`C-1: SETUP — the example's after-tax brokerage is $21,000 today (the four rows), and the helper reads the row: $30,000`, Math.abs(o0.taxGainPool / rb - 21000) < 1e-6 && o1.preRetireOneTime === 30000,
    `${o0.taxGainPool / rb} ${o1.preRetireOneTime}`);
  T("C-1a: by hand — the after-tax part falls by its whole $21,000 × the carry; the pool by the same; its basis to 0 (the gain share kept)",
    Math.abs(o1.taxGainPool) < 1e-6 && Math.abs((o0.taxable - o1.taxable) - 21000 * rb) < 1e-6 && Math.abs(o1.gainBasis) < 1e-9, `${o1.taxGainPool} ${o0.taxable - o1.taxable}`);
  T(`C-1b: by hand — each bucket × ${k.toFixed(6)} (the $9,000 rest, pro rata)`, ["b1", "b2", "b3", "b4"].every(b => Math.abs(o1[b] - o0[b] * k) < 1e-6), ["b1", "b2", "b3"].map(b => (o1[b] / o0[b]).toFixed(6)).join(" "));
  T("C-1c: …and the Traditional IRA, annuity and HSA parts of the pool, and tradFrac/rothFrac, are untouched", o1.taxOrd === o0.taxOrd && o1.taxRmdA === o0.taxRmdA && o1.taxRmdB === o0.taxRmdB
    && o1.tradFrac === o0.tradFrac && o1.rothFrac === o0.rothFrac);
  // a row smaller than the after-tax money: the buckets untouched; the basis scaled pro rata (the gain share kept)
  { load(g, { ...clone(P0), otherAccounts: P0.otherAccounts.map(a => a.taxType === "taxable" ? { ...a, balance: a.balance * 10 } : a), household: P0.household + 189000 }, [...X0, ROW(30000, "2027-05")]);
    const o2 = sched(g, RY)._opening; load(g, { ...clone(P0), otherAccounts: P0.otherAccounts.map(a => a.taxType === "taxable" ? { ...a, balance: a.balance * 10 } : a), household: P0.household + 189000 });
    const o3 = sched(g, RY)._opening;
    T("C-1d: a $30,000 row against $210,000 of after-tax money: the pool falls by $30,000 × the carry, the buckets do not move, and basis/pool is unchanged",
      Math.abs((o3.taxGainPool - o2.taxGainPool) - 30000 * rb) < 1e-6 && ["b1", "b2", "b3", "b4"].every(b => o2[b] === o3[b]) && Math.abs(o2.gainBasis / o2.taxGainPool - o3.gainBasis / o3.taxGainPool) < 1e-12); }
  // C-2: which rows count
  const pre = (XS, ry = RY) => { load(g, P0, XS); return X("preRetireOneTime")(ry); };
  T("C-2: the as-of month counts (April 2026); the month before it does not (March 2026)", pre([...X0, ROW(1000, "2026-04")]) === 1000 && pre([...X0, ROW(1000, "2026-03")]) === 0);
  T(`C-2b: December of the year before retirement counts (${RY - 1}-12); the retirement year does not (the example's April ${RY} rows: Engine D charges them in-year, as before)`,
    pre([...X0, ROW(1000, `${RY - 1}-12`)]) === 1000 && pre(X0) === 0 && pre([...X0, ROW(1000, `${RY}-01`)]) === 0);
  // C-3: the example at +1 YEAR — the April 2029 rows ($20,000 + $8,000) now fall before retirement
  T("C-3: at the +1 YEAR year the helper reads the April rows: $28,000", pre(X0, RY + 1) === 28000, String(pre(X0, RY + 1)));
  if (PM) {
  load(g, P0); load(PM.__g, P0);
  { const a = sched(g, RY + 1).schedule, b = sched(PM.__g, RY + 1).schedule;
    T(`C-3b: …and Engine D's schedule at ${RY + 1} ends lower than v6.34's (which never charged them)`, a[a.length - 1].portfolioTotal < b[b.length - 1].portfolioTotal - 20000, `${Math.round(a[a.length - 1].portfolioTotal)} vs ${Math.round(b[b.length - 1].portfolioTotal)}`); }
  // C-4: nothing else moves — the example at its planned year on every engine (B-1 holds Engine C, the MC schedule and Engine D; here the two
  // Monte Carlo engines, which already charged the row, on a household that has one)
  { load(g, P0, [...X0, ROW(30000, "2027-05")]); load(PM.__g, P0, [...X0, ROW(30000, "2027-05")]);
    const seedRun = (G) => { _src = mulberry(4242); return G.runMonteCarlo ? G.runMonteCarlo(RY, 400, { taxSchedule: { [RY]: 0 } }) : null; };
    let a = null, b = null; try { a = seedRun(g); b = seedRun(PM.__g); } catch (e) {}
    T("C-4: the Monte Carlo — which always charged the row — is bit-identical to v6.34 on a household with one (tax schedule held fixed)", !!a && !!b && same(a, b), a ? "" : "runMonteCarlo not callable");
    _src = mulberry(98); }
  // C-5: the bridge — with a $30,000 row, Engines B and C move only through withdrawalPlanSeries
  { load(g, P0, [...X0, ROW(30000, "2027-05")]); load(PM.__g, P0, [...X0, ROW(30000, "2027-05")]);
    const bridge = PM.__g.withdrawalPlanSeries({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" });
    const args = { retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, gainByYr: bridge.gainByYr, ordDrawByYr: bridge.ordDrawByYr };
    const c1 = E.computeIrmaaPlan(args), c0 = PM.__engines.computeIrmaaPlan(args), t1 = E.computeTaxPlan(args), t0 = PM.__engines.computeTaxPlan(args);
    const nb = g.withdrawalPlanSeries({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" });
    T("C-5: Engines B and C, handed v6.34's bridge, are bit-identical to v6.34; handed v6.35's own, they differ (the bridge carries the change)",
      same(c1.rows, c0.rows) && same(t1.rows, t0.rows) && !same(nb, bridge)); }
  load(g, P0); load(PM.__g, P0);
  } else if (!SKIP_PM) T("C-3b: SETUP — the v6.34 module is beside this one", false, PRIOR_PATH);
} else {
  load(g, P0); const RY = g.PLAN_TIMELINE().targetRetireYear;
  const a = sched(g, RY).schedule; load(g, P0, [...X0, ROW(30000, "2027-05")]); const b = sched(g, RY).schedule; load(g, P0);
  T(`C-1 ${KO}: a $30,000 row in May 2027 does not change the Withdrawal tab's schedule at all`, same(a, b));
  const c = sched(g, RY + 1).schedule; load(g, P0, X0.filter(e => !(e.freq === "once" && String(e.start).startsWith(String(RY))))); const d = sched(g, RY + 1).schedule; load(g, P0);
  T(`C-3 ${KO}: at +1 YEAR the example's April ${RY} rows ($28,000) are charged nowhere in the Withdrawal tab`, same(c, d));
}
// C-6: rendered — the example at +1 YEAR on the three tabs, and the copy
{
  await seed(clone(P0));
  const RY = DG.PLAN_TIMELINE().targetRetireYear;
  await go("withdrawal"); const w0 = txt();
  await go("backtest"); const bt0 = txt();
  await go("what breaks"); const wb0 = txt();
  if (POST) {
    T("C-6: the Withdrawal tab says a one-time row before retirement is paid from savings, after-tax money first, untaxed", w0.includes(`a one-time row dated before ${RY} is paid from your savings before it: the schedule starts from today's holdings less those rows, after-tax money first, with no tax on anything taken from your retirement accounts (from v6.35; before, such a row was not charged at all).`));
    T("C-6b: Backtest and What Breaks say so too; the v6.18/v6.20 Backtest sentence stays", bt0.includes("From v6.35 one dated before retirement comes out of this backtest's starting portfolio, untaxed; before, it was not charged here at all.")
      && /\(Both spend your one-time expenses: this backtest from v6\.18, the MC in the quarter each one falls from v6\.20\.\)/.test(bt0)
      && wb0.includes("One-time expenses dated before retirement come out of the starting portfolio, untaxed (from v6.35; before, they were not charged here)."));
    T("C-6c: at the planned year the Backtest's start is today's holdings ($1.65M) with no clause", /against your \$1\.65M, before tax\./.test(bt0));
    await go("roth"); await pickYr("+1 YEAR"); await go("backtest"); const bt1 = txt();
    await go("roth"); await pickYr("PLANNED");
    T("C-6d: at +1 YEAR the Backtest starts from $1.62M and names the $28K of one-time rows before retirement", /against your \$1\.62M \(today's holdings less \$28K of one-time expenses dated before retirement\), before tax\./.test(bt1),
      (bt1.match(/against your \$[\d.]+M[^,]*/) || [])[0]);
    // C-6e: What Breaks' start, by its one figure that divides by it — the last plan year's draw as a share of the starting portfolio. At the
    // planned year, a $300,000 row in May 2027 must raise that share by exactly 1,647,000 / 1,347,000 (to the 0.1% shown); an unreduced
    // start leaves it unchanged (control K24).
    const wr = t => +((t.match(/is ([\d.]+)% of (?:today's portfolio|the portfolio this projection starts from)/) || [])[1]);
    await seed(clone(P0), [...X0, ROW(300000, "2027-05")]); await go("what breaks"); const wb2 = txt();
    T("C-6e: What Breaks starts $300,000 lower with a $300,000 row in 2027 — its draw share rises by 1,647,000 / 1,347,000, and the sentence says why",
      wr(wb0) > 0 && Math.abs(wr(wb2) - wr(wb0) * 1647000 / 1347000) <= 0.11 && wb2.includes("of the portfolio this projection starts from — today's less $300K of one-time expenses dated before retirement"),
      `${wr(wb0)} → ${wr(wb2)} (want ${(wr(wb0) * 1647000 / 1347000).toFixed(2)})`);
    T("C-6g: the Withdrawal tab's first card names the $300K before retirement beside its starting balance", (await go("withdrawal"), txt().includes("; the $300K of one-time expenses dated before 2029 comes out of its after-tax money first")));
    const DOCS = String(DG.DOCS_HTML());
    T("C-6f: the Field Manual's Withdrawal Strategy entry says so, and EXTINCTION — the old \"is not in this schedule\" is gone everywhere", DOCS.includes("A one-time row dated between today and the retirement year is paid from your savings before it: this schedule, Backtest and What Breaks start from today's holdings less those rows")
      && !DOCS.includes("A one-time row dated before the retirement year is not in this schedule.") && !/is not in this schedule\./.test(w0));
  } else T(`C-6 ${KO}: the Withdrawal tab says a one-time row dated before ${RY} is not in its schedule`, w0.includes(`a one-time row dated before ${RY} is not in this schedule.`));
  await unmount();
}

finished = true;
console.log(`\nt98 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
