// t100_whatbreaks_tax.mjs — v6.36 (D-66; docs/SCOPE_D66_WHATBREAKS_TAX.md, DB-1 (a) … DB-5 (a)).
//
// WHAT IT PINS.
//   D-66 · What Breaks charged a yearly tax averaged from Engine A (the Roth tab's strategy engine: totTaxToday + totIrmaaToday over the
//          plan's years), while the Monte Carlo charged mcIncomeTaxSchedule (Engine B's tax plus Engine C's surcharges in their premium
//          years). Engine A taxes the spending draw without draining it, figures dividends on a pool that is never spent, and ends each
//          spouse's conversions at that spouse's own year, so the two stress views disagreed — on the example at the defaults by $2,480 a
//          year of tax (scope §0.3). From v6.36 What Breaks calls `whatBreaksAnnualTax`, a module-level helper that averages the Monte
//          Carlo's own schedule at the Monte Carlo's own four inputs. Engines A, B, C and D are untouched.
//
// Both legs: node t100_whatbreaks_tax.mjs v635 | node t100_whatbreaks_tax.mjs v636. The v6.35 leg pins the defect as a dated
// [KNOWN DEFECT 2026-10-28, D-66 — flips at v6.36]. Sections:
//   A · the source, by AST — the helper and what it calls; What Breaks' one call and its four inputs (the Monte Carlo's set); Engine A's
//       callers and the readers of its totals
//   B · the extinction invariant — on every fixture household, the D-66 households and three more (a QCD, working-year MAGI, a retirement in
//       the as-of year), under BASE and BULL-LEANING at $0, $70K and $250K: the helper's average equals Engine B's tax plus Engine C's
//       in-horizon surcharges, summed here from the engines' rows
//   C · what is rendered — the estimate on three plans, the basis line and footer, the four answers on the example under BASE, the estimate
//       with the Social Security trust-fund cut on (it no longer moves with the cut); the Field Manual and METHODOLOGY
//   D · what does not move — Engine A's rows and the Monte Carlo's schedule bit-identical to v6.35's module (v6.36 leg, when the run folder
//       holds the prior module)
// Controls: qa/tools/controls_v636_whatbreaks.py (repo-only). Exits with process.exit (the rendered app leaves timers running).
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(100); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v636";
const KNOWN_VERSIONS = ["v635", "v636"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v636"].includes(VER);   // an array, so the next registration widens it
const D_PRIOR = "v635";                // §D's prior module — a constant, so the registrar cannot widen it (t76 records why)
const KD = "[KNOWN DEFECT 2026-10-28, D-66 — flips at v6.36]";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = M.__g, E = M.__engines;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const callsOf = (root, name) => all(root, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === name);
const inside = (x, outer) => x.n.range[0] >= outer.range[0] && x.n.range[1] <= outer.range[1];

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T100_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t100 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const canon = v => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]" : (v && typeof v === "object") ? "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v);
console.log(`t100 — WHAT BREAKS PAYS THE MONTE CARLO'S TAX (${VER})`);

// ── §A · the source, by AST ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source, by AST");
const topFn = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
const MAIN = topFn("DangerCloseMain");
// What Breaks' render function: the nearest arrow function enclosing the declaration of `estAnnualTax`
const estDecl = all(AST, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "estAnnualTax");
const WB = estDecl.length === 1 ? [...estDecl[0].anc].reverse().find(a => a.type === "ArrowFunctionExpression") : null;
T("A-0 SETUP: one `estAnnualTax` declaration, inside an arrow function in DangerCloseMain (What Breaks' render)", estDecl.length === 1 && !!WB && !!MAIN
  && WB.range[0] > MAIN.range[0] && WB.range[1] < MAIN.range[1], String(estDecl.length));
const rrsAll = callsOf(AST, "runRothStrategies"), rrsWB = WB ? rrsAll.filter(x => inside(x, WB)) : [];
// the Roth tab: inside an `activeTab === "roth" && …` render, or the solve-for grid's memo (`rothSolve`), which only the Roth tab reads
const SRCOF = n => SRC.slice(n.range[0], n.range[1]);
const onRothTab = x => x.anc.some(a => (a.type === "LogicalExpression" && a.left.type === "BinaryExpression" && SRCOF(a.left).replace(/\s+/g, "") === 'activeTab==="roth"')
  || (a.type === "VariableDeclarator" && a.id.type === "Identifier" && a.id.name === "rothSolve"));
const totReads = all(AST, n => n.type === "MemberExpression" && !n.computed && ["totIrmaaToday", "totTaxToday"].includes(n.property.name));
const totWB = WB ? totReads.filter(x => inside(x, WB)) : [];
const HELP = topFn("whatBreaksAnnualTax");
const MC_KEYS = ["qcdAnnual", "rothAmount", "scenarioPreset", "taxYield"];
const objKeys = o => o && o.type === "ObjectExpression" ? o.properties.map(p => p.key && (p.key.name || p.key.value)).sort() : null;
const shorthandOnly = o => o && o.type === "ObjectExpression" && o.properties.every(p => p.shorthand);
if (POST) {
  T("A-1 `whatBreaksAnnualTax` is a top-level function declaration (module-level, so t83 E-6's three in-component schedule calls stay three)", !!HELP);
  const hc = HELP ? callsOf(HELP, "mcIncomeTaxSchedule") : [];
  const direct = HELP ? ["runRothStrategies", "computeTaxPlan", "computeIrmaaPlan", "computeWithdrawalPlan", "withdrawalPlanSeries"].flatMap(n => callsOf(HELP, n)) : [];
  T("A-2 the helper calls mcIncomeTaxSchedule once, with its own two parameters, and no engine directly", hc.length === 1 && direct.length === 0
    && hc[0].n.arguments.length === 2 && canon(hc[0].n.arguments.map(a => a.name)) === canon([0, 2].map(i => HELP.params[i].type === "AssignmentPattern" ? HELP.params[i].left.name : HELP.params[i].name)) && callsOf(HELP, "mcTaxForYear").length === 1, `${hc.length} / ${direct.length}`);
  const wbc = callsOf(AST, "whatBreaksAnnualTax");
  const ryDecl = WB ? all(WB, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "_retireYr") : [];
  T("A-3 What Breaks calls it once, from its own render, with `_retireYr`, `_horizonYr` and exactly the Monte Carlo's four inputs, shorthand",
    wbc.length === 1 && WB && inside(wbc[0], WB) && wbc[0].n.arguments[0].name === "_retireYr" && wbc[0].n.arguments[1].name === "_horizonYr"
    && canon(objKeys(wbc[0].n.arguments[2])) === canon(MC_KEYS) && shorthandOnly(wbc[0].n.arguments[2])
    && ryDecl.length === 1 && ryDecl[0].n.init.type === "Identifier" && ryDecl[0].n.init.name === "retireYear", String(wbc.length));
  const mcc = MAIN ? callsOf(MAIN, "mcIncomeTaxSchedule") : [];
  T(`A-4 the Monte Carlo's in-component schedule calls (${mcc.length}) pass that same key set — one schedule, one set of inputs (DB-2 (a))`,
    mcc.length === 3 && mcc.every(x => canon(objKeys(x.n.arguments[1])) === canon(MC_KEYS)), mcc.map(x => x.n.loc.start.line).join(","));
  T(`A-5 runRothStrategies has ${rrsAll.length} app callers — the Roth tab's three — and none in What Breaks`, rrsAll.length === 3 && rrsWB.length === 0 && rrsAll.every(onRothTab),
    rrsAll.map(x => x.n.loc.start.line).join(","));
  T(`A-6 Engine A's totals (.totTaxToday / .totIrmaaToday) are read ${totReads.length} times, all on the Roth tab — none in What Breaks`,
    totReads.length === 8 && totWB.length === 0 && totReads.every(onRothTab), totReads.map(x => x.n.loc.start.line).join(","));
  const est = WB ? all(WB, n => n.type === "AssignmentExpression" && n.left.type === "Identifier" && n.left.name === "estAnnualTax") : [];
  T("A-7 the estimate is assigned once, from the helper's `annual`", est.length === 1 && est[0].n.right.type === "MemberExpression" && est[0].n.right.property.name === "annual");
  // A-8 (added at the build review): the Roth comparator's description no longer says it uses the Taxes tab's engine (D-68 found it does not)
  const JTXT = all(AST, n => n.type === "JSXText").map(x => x.n.value.replace(/\s+/g, " ")).join(" ");
  T("A-8 the Roth comparator says its rules are the Taxes tab's but its income projection is its own, running high on most plans; \"same tax engine as the Taxes tab\" is gone",
    JTXT.includes("(the same tax rules as the Taxes tab: brackets,") && !JTXT.includes("same tax engine as the Taxes tab")
    && JTXT.includes("Its income projection is its own, built to compare strategies: it taxes your spending from Traditional without taking it out of the balance, so its lifetime tax and IRMAA run above the Taxes and IRMAA tabs' on most plans (from v6.36 What Breaks no longer uses it)."));
} else {
  T(`A-1 ${KD} no whatBreaksAnnualTax; What Breaks runs Engine A itself and reads its two totals`, !HELP && rrsWB.length === 1 && totWB.length === 4 && rrsAll.length === 4,
    `${rrsWB.length} / ${totWB.length} / ${rrsAll.length}`);
}

// ── §B · the extinction invariant: What Breaks pays the Monte Carlo's tax ───────────────────────────────────────────────────────────
console.log("  B — the extinction invariant");
const fx = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
const P0 = clone(g.PORTFOLIO()), X0 = clone(g.EXPENSES());
const load = P => { g.applyLoadedData({ portfolio: clone(P), expenses: clone(X0) }); return g.PLAN_TIMELINE(); };
const preset = k => g.applyScenarioProbs(g.PROB_PRESETS()[k].probs);
const NY3 = (() => { const p = clone(P0); p.positions.forEach(q => { for (const f of ["balance", "trad", "roth"]) if (typeof q[f] === "number") q[f] *= 3; });
  (p.otherAccounts || []).forEach(a => a.balance *= 3); p.total401k *= 3; p.household *= 3; p.stateCode = "NY"; p.stateName = "New York"; return p; })();
const HH = [["example", clone(P0), 0], ["example made single", { ...clone(P0), single: true }, 0], ["New York ×3", NY3, 0],
  ["example, QCD $4,000", clone(P0), 4000], ["example, working-year MAGI $300,000", { ...clone(P0), workMagi: 300000 }, 0],
  ["example, retiring in the as-of year", { ...clone(P0), retireYear: g.PLAN_TIMELINE().asOfYear }, 0]];
for (const n of Object.keys(fx.HOUSEHOLDS)) { load(P0); HH.push([`fixture:${n}`, fx.build(g, n), 0]); }
// Engine A's current-slider row, built as v6.35's What Breaks built it (t94 D's shape)
const engineA = (roth, pre) => { const tl = g.PLAN_TIMELINE(), P = g.PORTFOLIO(); const R = tl.targetRetireYear;
  const hz = Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
  const pT = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R, horizonYr: hz, ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ssA: g.getSSA(), ssB: tl.single ? 0 : g.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month || 1, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month || 1,
    pen: g.getPension(), penOwner: g.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: P.stateCode || null, ...g.retireStartBalances(R),
    ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    taxableInit: g.taxableInitAll(), workMagi: g.workMagi ? g.workMagi() : 0, taxYieldPct: 2.0, currentConv: roth,
    ordDrawByYr: g.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: pre }).ordDrawByYr };
  return g.runRothStrategies(pT).find(r => r.key === "current"); };
const cases = []; const bad = []; const badI = []; let reachTax = 0, reachIrm = 0, aDiffI = 0, aBelow = 0, spanBad = 0;
for (const [lab, P, qcd] of HH) for (const pre of ["base", "bull"]) for (const roth of [0, 70000, 250000]) {
  const tl = load(P); preset(pre); const R = tl.targetRetireYear;
  const hz = Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), yrs = hz - R + 1;
  const ser = g.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: pre });
  const A = { retireYear: R, rothAmount: roth, qcdAnnual: qcd, taxYield: 2.0, gainByYr: ser.gainByYr, ordDrawByYr: ser.ordDrawByYr };
  const Brows = E.computeTaxPlan(A).rows, Crows = E.computeIrmaaPlan(A).rows;
  const Byrs = Brows.map(r => r.yr); if (Byrs[0] !== R || Byrs[Byrs.length - 1] !== hz || Byrs.length !== yrs) spanBad++;
  const taxSum = Brows.filter(r => r.yr >= R && r.yr <= hz).reduce((s, r) => s + r.totalTaxToday, 0);
  const irmSum = Crows.filter(r => r.irmaaYr >= R && r.irmaaYr <= hz && Byrs.includes(r.irmaaYr)).reduce((s, r) => s + (r.surchargeToday > 0 ? r.surchargeToday : 0), 0);
  const expect = (taxSum + irmSum) / yrs;
  const a = engineA(roth, pre), aY = (a.totTaxToday + a.totIrmaaToday) / yrs;
  if (Math.abs(a.totIrmaaToday - irmSum) >= 1) aDiffI++;
  if (aY < expect) aBelow++;
  if (Math.abs(aY - expect) > 100) reachTax++;
  if (irmSum > 0) reachIrm++;
  const c = { lab, pre, roth, R, hz, expect, irmSum, aY, aI: a.totIrmaaToday };
  if (POST) { const h = g.whatBreaksAnnualTax(R, hz, { rothAmount: roth, qcdAnnual: qcd, taxYield: 2.0, scenarioPreset: pre });
    c.h = h.annual; if (!(Math.abs(h.annual - expect) < 0.005) || h.years !== yrs) bad.push(c);
    if (!(Math.abs(h.irmaaTotal - irmSum) < 0.005) || !(Math.abs(h.taxTotal - taxSum) < 0.005)) badI.push(c); }
  cases.push(c);
}
T(`B-0 SETUP: ${cases.length} cases (${HH.length} households × 2 priors × 3 sliders), every schedule spans retirement through the horizon`,
  cases.length === HH.length * 6 && HH.length === 6 + Object.keys(fx.HOUSEHOLDS).length && Object.keys(fx.HOUSEHOLDS).length >= 17 && spanBad === 0, String(spanBad));
T(`B-1 ANTI-VACUITY: the cases reach the change — Engine A's yearly figure is more than $100 off the schedule's in ${reachTax}, a surcharge is charged in ${reachIrm}, `
  + `Engine A's IRMAA differs from Engine C's in ${aDiffI}, and Engine A is below the schedule in ${aBelow}`, reachTax >= 100 && reachIrm >= 30 && aDiffI >= 30 && aBelow >= 1,
  `${reachTax}/${reachIrm}/${aDiffI}/${aBelow}`);
if (POST) {
  T(`B-2 on all ${cases.length} cases the helper's average equals Engine B's tax plus Engine C's in-horizon surcharges over the years, to the cent (summed here from the rows)`,
    bad.length === 0, bad.slice(0, 3).map(c => `${c.lab} ${c.pre} ${c.roth}: ${c.h} vs ${c.expect}`).join(" | "));
  T(`B-3 …and its two parts are those sums: the IRMAA What Breaks charges is Engine C's inside the horizon, on every case (D-66's claim)`, badI.length === 0,
    badI.slice(0, 3).map(c => `${c.lab} ${c.pre} ${c.roth}`).join(" | "));
  const ex = cases.find(c => c.lab === "example" && c.pre === "base" && c.roth === 70000);
  T(`B-4 the example at $70,000 under BASE: $${ex && ex.h.toFixed(2)} a year (scope §0.3: $8,048), against Engine A's $${ex && ex.aY.toFixed(2)} ($10,528)`,
    !!ex && Math.round(ex.h) === 8048 && Math.round(ex.aY) === 10528);
  const z = g.whatBreaksAnnualTax(2040, 2039, {});
  T("B-5 an empty span returns 0 with no years (no division by zero)", z.annual === 0 && z.years === 0);
} else {
  const ex = cases.find(c => c.lab === "example" && c.pre === "base" && c.roth === 70000);
  T(`B-2 ${KD} no helper on this leg, and What Breaks' Engine A figure is not the Monte Carlo's: the example at $70,000 under BASE $${ex && ex.aY.toFixed(2)} against $${ex && ex.expect.toFixed(2)}`,
    g.whatBreaksAnnualTax === undefined && !!ex && Math.round(ex.aY) === 10528 && Math.round(ex.expect) === 8048);
  T(`B-3 ${KD} Engine A's IRMAA, which What Breaks charged, differs from Engine C's on ${aDiffI} of ${cases.length} cases`, aDiffI >= 30);
}

// ── §D · what does not move (v6.36 leg, against v6.35's module) ─────────────────────────────────────────────────────────────────────
console.log("  D — Engine A and the Monte Carlo's schedule do not move");
const PRIOR_PATH = join(HERE, `app_${D_PRIOR}.mjs`);
if (POST && existsSync(PRIOR_PATH)) {
  const PM = await import(pathToFileURL(PRIOR_PATH).href), pg = PM.__g;
  let nA = 0, nS = 0, diffA = [], diffS = [];
  for (const [lab, P, qcd] of HH) for (const pre of ["base", "bull"]) for (const roth of [0, 70000]) {
    for (const G of [g, pg]) { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X0) }); G.applyScenarioProbs(G.PROB_PRESETS()[pre].probs); }
    const mk = G => { const tl = G.PLAN_TIMELINE(), PP = G.PORTFOLIO(), R = tl.targetRetireYear; const hz = Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
      return { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R, horizonYr: hz, ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
        deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
        ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month || 1, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month || 1,
        pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: PP.stateCode || null, ...G.retireStartBalances(R),
        ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
        taxableInit: G.taxableInitAll(), workMagi: G.workMagi(), taxYieldPct: 2.0, currentConv: roth,
        ordDrawByYr: G.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: pre }).ordDrawByYr }; };
    const rn = g.runRothStrategies(mk(g)), rp = pg.runRothStrategies(mk(pg)); nA++;
    if (canon(rn) !== canon(rp) || canon(rn.map(r => r.magiByYr)) !== canon(rp.map(r => r.magiByYr))) diffA.push(`${lab} ${pre} ${roth}`);
    const R = g.PLAN_TIMELINE().targetRetireYear, I = { rothAmount: roth, qcdAnnual: qcd, taxYield: 2.0, scenarioPreset: pre };
    const sn = g.mcIncomeTaxSchedule(R, I), sp = pg.mcIncomeTaxSchedule(R, I); nS++;
    if (canon(sn) !== canon(sp)) diffS.push(`${lab} ${pre} ${roth}`);
  }
  T(`D-1 Engine A's rows (every strategy, and their lookback seam) are bit-identical to v6.35's on ${nA} cases — the Roth tab does not move`, diffA.length === 0 && nA >= 90, diffA.slice(0, 3).join(" | "));
  T(`D-2 the Monte Carlo's schedule is bit-identical to v6.35's on ${nS} cases — What Breaks reads it; nothing in it moved`, diffS.length === 0 && nS >= 90, diffS.slice(0, 3).join(" | "));
} else console.log(`     (§D: ${POST ? `no app_${D_PRIOR}.mjs in this run folder — skipped` : "the v6.35 leg has no prior to compare with — skipped"})`);

// ── §C · what is rendered ────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — What Breaks rendered, and the Field Manual");
{
  const FM = String(g.DOCS_HTML()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (POST) {
    T("C-1 Field Manual, What Breaks: an annual average of the tax the Monte Carlo pays; the Roth engine's sentence and its either-direction clause gone; D-65's phrase kept (t98 B-8g)",
      FM.includes("an annual average of the tax the Monte Carlo pays — the Taxes tab’s income tax, Roth-conversion taxes included, and the IRMAA tab’s surcharges, at the current conversion, QCD and dividend settings")
      && !FM.includes("an annual average from the Roth tab’s strategy engine") && !FM.includes("that engine projects income its own way")
      && FM.includes("the first two years’ premiums, which working-year income sets, only if you enter that income on My Data (from v6.35)")
      && FM.includes("Social Security at its scheduled amount even with the trust-fund cut on"));
    T("C-2 Field Manual, the Social Security cut: What Breaks keeps scheduled benefits, its tax estimate included; the exception is gone; the FAQ agrees",
      FM.includes("and so does What Breaks, its tax estimate included (from v6.36).") && !FM.includes("except for the tax estimate it takes from the Roth engine")
      && FM.includes("the Backtest, What Breaks' projection and tax estimate, and the Taxes, IRMAA, Withdrawal and Survivor tabs keep full scheduled benefits"));
    T("C-3 Field Manual, what's new: the v6.36 note names the change, the example's figures and the direction", FM.includes("What Breaks pays the Monte Carlo’s tax (v6.36).")
      && FM.includes("on the example by about $2,500 a year of tax") && FM.includes("the spending headroom rises from 1.20× to 1.25× and the shock it absorbs from $0.50M to $0.55M")
      && FM.includes("and on a few the estimate rises") && FM.indexOf("What Breaks pays the Monte Carlo’s tax (v6.36).") < FM.indexOf("STAY UNDER IRMAA stays under; your last working years' income"));
    const MP = [join(HERE, "..", "METHODOLOGY.md"), join(HERE, "METHODOLOGY.md")].find(existsSync);
    const MD = MP ? readFileSync(MP, "utf8").replace(/\s+/g, " ") : "";
    T("C-9 METHODOLOGY has the v6.36 section (the cause's three parts, the measured gap, the direction, D-68) and closes the v6.31 D-66 bullet in place",
      !!MP && MD.includes("## What Breaks pays the Monte Carlo's tax (v6.36)") && MD.includes("It taxes the spending draw from Traditional but never drains it")
      && MD.includes("Its dividend base is its own taxable pool") && MD.includes("It ends each spouse's conversions at that spouse's own ladder year")
      && MD.includes("**Direction: optimistic on most plans.**") && MD.includes("(MissingFeatures **D-68**, filed at this release)")
      && MD.includes("*(Closed at v6.36 for What Breaks, which now reads the Monte Carlo's schedule;"), MP || "no METHODOLOGY.md");
  } else {
    T(`C-1 ${KD} the Field Manual says What Breaks' tax is the Roth engine's, whose IRMAA can differ either way`, FM.includes("an annual average from the Roth tab’s strategy engine")
      && FM.includes("that engine projects income its own way") && FM.includes("except for the tax estimate it takes from the Roth engine"));
  }
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const body = () => window.document.body;
  let root, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === name);
  const text = () => { const c = body().cloneNode(true); c.querySelectorAll("style,script").forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " "); };
  el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush();
  const ex = [...body().querySelectorAll("button, [role=button], div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(ex); await flush(); await flush();
  const DG = window.__g;
  const read = t => ({ lab: (t.match(/Computed under the active ([A-Z-]+) scenario/) || [])[1], est: (t.match(/estimated taxes \(~\$(\d+)K\/yr/) || [])[1],
    spend: (t.match(/([\d.]+)× current spending/) || [])[1], shock: (t.match(/absorb[^$]{0,60}\$([\d.,]+[KM]?)/i) || [])[1],
    ret: (t.match(/real returns? (?:run|of) ~?(-?[\d.]+)%/i) || [])[1], crash: (t.match(/(\d+) consecutive/i) || [])[1] });
  const DP0 = clone(DG.PORTFOLIO()), DX0 = clone(DG.EXPENSES());
  const DNY3 = (() => { const p = clone(DP0); p.positions.forEach(q => { for (const f of ["balance", "trad", "roth"]) if (typeof q[f] === "number") q[f] *= 3; });
    (p.otherAccounts || []).forEach(a => a.balance *= 3); p.total401k *= 3; p.household *= 3; p.stateCode = "NY"; p.stateName = "New York"; return p; })();
  const R = {};
  for (const [lab, P] of [["example", DP0], ["single", { ...clone(DP0), single: true }], ["NY3", DNY3]]) {
    await act(async () => { DG.applyLoadedData({ portfolio: clone(P), expenses: clone(DX0) }); }); await flush(); await flush();
    await click(tabBtn("monte carlo")); await flush(200);
    await click([...body().querySelectorAll("button")].find(b => b.textContent.trim() === "BASE")); await flush(200);
    await click(tabBtn("dashboard")); await flush(100); await click(tabBtn("what breaks")); await flush(200);
    const t = text(); const tl = DG.PLAN_TIMELINE(), Ry = tl.targetRetireYear, hz = Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
    R[lab] = { ...read(t), t, h: POST ? DG.whatBreaksAnnualTax(Ry, hz, { rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "base" }).annual : null };
  }
  T("C-4 SETUP: What Breaks renders on all three plans, each under BASE (the header says so)", ["example", "single", "NY3"].every(k => R[k].lab === "BASE" && R[k].est && R[k].spend),
    JSON.stringify(Object.fromEntries(Object.entries(R).map(([k, v]) => [k, [v.lab, v.est, v.spend]]))));
  const wb = R.example.t;
  if (POST) {
    T(`C-5 the estimate printed is the helper's at the page's settings ($70,000, QCD $0, 2%), in thousands, on all three ($${["example", "single", "NY3"].map(k => Math.round(R[k].h)).join(", $")})`,
      ["example", "single", "NY3"].every(k => R[k].est === String(Math.round(R[k].h / 1000))) && Math.round(R.example.h) === 8048 && Math.round(R.single.h) === 14931 && Math.round(R.NY3.h) === 31526);
    T("C-6 the basis line names the Monte Carlo's tax — the Taxes tab's income tax and the IRMAA tab's surcharges — keeps D-65's clause (t98 B-8c), and drops the Roth engine",
      wb.includes("K/yr, the average of what the Monte Carlo pays at your current settings: the Taxes tab's income tax, Roth-conversion taxes included, and the IRMAA tab's surcharges — except the first two years' premiums, which working-year income sets, unless you enter it on My Data; Social Security at its scheduled amount, even with the trust-fund cut on)")
      && !wb.includes("Roth tab's strategy engine") && !wb.includes("its IRMAA differs"));
    T("C-7 the footer: its taxes are the Monte Carlo's, averaged over the plan's years", wb.includes("Its taxes are the Monte Carlo's — the Taxes tab's tax and the IRMAA tab's surcharges — averaged over the plan's years")
      && wb.includes("(the Monte Carlo pays those taxes year by year)"));
    const e = R.example;
    T(`C-8 the four answers on the example under BASE, measured at the build: 1.25× spending, $0.55M shock, −2.2% return, 1 crash year (v6.35: 1.20×, $0.50M, −2.2%, 1) — got ${[e.spend, e.shock, e.ret, e.crash].join(" / ")}`,
      e.spend === "1.25" && e.shock === "0.55M" && e.ret === "-2.2" && e.crash === "1");
  } else {
    const e = R.example;
    T(`C-5 ${KD} What Breaks names the Roth engine, prints its higher estimate ($11K on the example), and says its IRMAA can differ`, wb.includes("K/yr average from the Roth tab's strategy engine")
      && wb.includes("its IRMAA differs from the IRMAA tab's") && R.example.est === "11" && R.single.est === "16" && R.NY3.est === "38");
    T(`C-6 ${KD} the four answers on the example under BASE: 1.20× spending, $0.50M shock, −2.2% return, 1 crash year — got ${[e.spend, e.shock, e.ret, e.crash].join(" / ")}`,
      e.spend === "1.20" && e.shock === "0.50M" && e.ret === "-2.2" && e.crash === "1");
  }
  // C-10: the Social Security trust-fund cut (the SS tab's 2033 → 78% preset). The schedule keeps scheduled benefits (it never calls
  // ssDepletionFactor), so from v6.36 What Breaks' estimate does not move with the cut; through v6.35 Engine A applied it and the estimate fell.
  {
    await act(async () => { DG.applyLoadedData({ portfolio: clone(DP0), expenses: clone(DX0) }); }); await flush(); await flush();
    await click(tabBtn("monte carlo")); await flush(200);
    await click([...body().querySelectorAll("button")].find(b => b.textContent.trim() === "BASE")); await flush(200);
    const rd = async () => { await click(tabBtn("dashboard")); await flush(100); await click(tabBtn("what breaks")); await flush(200); return read(text()); };
    const before = await rd();
    await click(tabBtn("ss")); await flush(200);
    const cutBtn = [...body().querySelectorAll("button")].find(x => /2033 → 78%/.test(x.textContent || ""));
    await click(cutBtn); await flush(200);
    const after = await rd();
    await click(tabBtn("ss")); await flush(200);
    await click([...body().querySelectorAll("button")].find(x => /NO CUT/.test(x.textContent || ""))); await flush(200);
    if (POST) T(`C-10 with the trust-fund cut on (2033 → 78%), What Breaks' estimate does not move: $${before.est}K → $${after.est}K, headroom ${before.spend}× → ${after.spend}× (it keeps scheduled benefits, as the Monte Carlo's tax does)`,
      !!cutBtn && before.lab === "BASE" && after.lab === "BASE" && before.est === "8" && after.est === before.est && after.spend === before.spend, `${before.est}/${after.est}`);
    else T(`C-10 ${KD} with the trust-fund cut on (2033 → 78%), What Breaks' estimate falls with it — Engine A applies the cut: $${before.est}K → $${after.est}K`,
      !!cutBtn && before.est === "11" && +after.est < +before.est, `${before.est}/${after.est}`);
  }
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

finished = true;
console.log(`\nt100 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
