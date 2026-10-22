// t84 — A CAR IS AN EXPENSE ROW; THE "AFTER THE PAYMENTS END" FIGURE, THE STRESS TAB'S PLANNED PATH AND THE STATE LINES COME FROM THE
// PLAN (v6.21 — D-42, D-43, D-47, D-50)
// Run: node t84_car_rows.mjs v621   |   node t84_car_rows.mjs v620
//
// THE DEFECTS THIS EXISTS FOR (docs/SCOPE_D42_CAR_V621.md):
//   D-42 — through v6.20 `AUTO_REPLACE_COST = 40000` was spent by the 30-year Monte Carlo in the March quarter of retirement years 8, 16, 24
//          and 32 on EVERY plan (when the run's `autoReplace` option was on), was left out of the planned path its guardrails steer by, never
//          reached the Withdrawal / Taxes / IRMAA / Roth tabs, and was paid twice by a household that entered its cars as expenses. From v6.21
//          a car is a one-time expense row: the example carries four; a plan saved before v6.21 keeps the old schedule as visible rows.
//   D-43 — six displays (Income and Social Security tabs) subtracted the example's $400 car payment from every plan's spending.
//   D-47 — the Stress tab's "Planned" column was household × 1.04^years, which ignores withdrawals.
//   D-50 — the mortgage what-if, and (found at the scope) the Roth tab's rules box, told every plan it lives in Florida.
//
// GATED PER LEG (OPERATIONS §B2). The v6.20 leg pins what v6.21 changes as dated [KNOWN DEFECT] checks.
// §B and §C need both legs' modules (the v6.20 → v6.21 pair only; printed skip otherwise). §D–§G mount the DOM bundle.
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(84); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v621";
const KNOWN_VERSIONS = ["v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629"].includes(VER);   // an array, so the next registration widens it
const POST_D49 = ["v623", "v624", "v625", "v626", "v627", "v628", "v629"].includes(VER);   // v6.23 (D-49): H-2's taper sentence. An array, so the registrar widens it
// The differential's pair — constants, NOT `VER === "v621"`, so the registrar cannot widen them (t76 records why).
const D_PRIOR = "v620", D_CUR = "v621";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g } = M;
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
const AST = JP.parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true });

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t84 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const KD = "[KNOWN DEFECT 2026-10-19, D-42/43/47/50 — flips at v6.21]";
const CAR = "Replacement car";
console.log(`t84 — CARS ARE EXPENSE ROWS; THE PLAN'S OWN FIGURES (${VER})\n`);

const BASE = clone(g.PORTFOLIO()), XB = clone(g.EXPENSES());
const XNOCAR = XB.filter(e => !(e && e.label === CAR));   // v6.20's table (the four rows are the only difference — A-5)
const RY = g.buildPlanTimeline().targetRetireYear;
// Every node of a type, with the name of the top-level function (or declarator) it sits in.
const nodes = (pred) => { const out = []; walk.fullAncestor(AST, (n, anc) => { if (pred(n)) {
  const top = anc.find(a => a.type === "FunctionDeclaration" || (a.type === "VariableDeclarator" && anc.indexOf(a) <= 2));
  out.push({ n, fn: top ? (top.id && top.id.name) : null }); } }, W); return out; };
const fnBody = name => { let f = null; walk.full(AST, n => { if (n.type === "FunctionDeclaration" && n.id && n.id.name === name) f = n; }, W); return f; };
const inFn = (name, pred) => { const f = fnBody(name); if (!f) return null; let k = 0; walk.full(f, n => { if (pred(n)) k++; }, W); return k; };
const textOf = n => n.type === "Literal" && typeof n.value === "string" ? n.value : n.type === "TemplateElement" ? n.value.cooked : n.type === "JSXText" ? n.value : null;
const allText = (() => { const t = []; walk.full(AST, n => { const s = textOf(n); if (s) t.push(s); }, W); return t.join("\n"); })();

// ── §A · the car is data (AST) ──────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the car is data; nothing subtracts the example's $400; the Stress tab reads the engine (AST)");
{
  const ids = name => nodes(n => (n.type === "Identifier" && n.name === name) || (n.type === "Property" && !n.computed && n.key.type === "Identifier" && n.key.name === name)).length;
  const minus400 = nodes(n => n.type === "BinaryExpression" && n.operator === "-" && n.right.type === "Literal" && n.right.value === 400).length;
  const pow104 = nodes(n => n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.property.name === "pow"
    && n.arguments.some(a => a.type === "Literal" && a.value === 1.04)).length;
  if (POST) {
    T("A-1 [EXTINCTION]: AUTO_REPLACE_COST and the autoReplace option exist nowhere", ids("AUTO_REPLACE_COST") === 0 && ids("autoReplace") === 0,
      `${ids("AUTO_REPLACE_COST")} / ${ids("autoReplace")}`);
    const lits = ["runExtendedMC", "runMonteCarlo", "computeWithdrawalPlan", "runStressTests"].map(f => inFn(f, n => n.type === "Literal" && n.value === 40000));
    T("A-2 [EXTINCTION]: no 40000 literal in either Monte Carlo engine, the stress set or Engine D", lits.every(k => k === 0), lits.join(","));
    T("A-3 [EXTINCTION]: no expression subtracts a literal 400 anywhere in the source (D-43's six sites)", minus400 === 0, minus400);
    T("A-4 [EXTINCTION]: no Math.pow(…, 1.04) anywhere — the Stress tab's planned column (D-47)", pow104 === 0, pow104);
    const rows = XB.filter(e => e.label === CAR);
    T("A-5: the example's table carries exactly four Replacement car rows — $40,000, one-time, March of retirement years 8, 16, 24, 32",
      rows.length === 4 && rows.every((e, i) => e.amount === 40000 && e.freq === "once" && e.start === `${RY + 8 * (i + 1)}-03` && e.end === e.start)
      && XNOCAR.length === XB.length - 4, JSON.stringify(rows.map(e => e.start)));
    const markers = nodes(n => n.type === "Property" && !n.computed && n.key.type === "Identifier" && n.key.name === "carRowsV621" && n.value.type === "Literal" && n.value.value === true);
    const where = markers.map(m => m.fn || "?").sort().join(",");
    T("A-6: carRowsV621: true is written by the example, Start Fresh, the wizard and every My Data save — four sites, no more",
      markers.length === 4 && /DEFAULT_PORTFOLIO/.test(where) && /DataLoader/.test(where) && /GuidedWizard/.test(where) && /MyDataEditor/.test(where), where);
    // the Stress table: `planned` reads base30.plannedPath; the bands read GUARDRAILS
    const pl = nodes(n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "_pp" && n.init
      && JSON.stringify(n.init).includes('"plannedPath"') && JSON.stringify(n.init).includes('"base30"'));
    const bands = nodes(n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && ["lower", "upper"].includes(n.id.name) && n.init
      && n.init.type === "BinaryExpression" && n.init.right.type === "MemberExpression" && n.init.right.object.name === "GUARDRAILS");
    // …and the row's `planned` is taken from `_pp` (controls C10 found `_pp` alone could stay declared while `planned` went back to 1.04)
    const plUse = nodes(n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "planned" && n.init
      && JSON.stringify(n.init).includes('"name":"_pp"'));
    T("A-7: the Stress table's planned figure reads base30.plannedPath, and its bands read GUARDRAILS' own percentages", pl.length === 1 && plUse.length === 1 && bands.length === 2,
      `${pl.length} / ${plUse.length} / ${bands.length}`);
  } else {
    T(`A-1 ${KD}: AUTO_REPLACE_COST = 40000 exists and runExtendedMC gates it on autoReplace`, g.AUTO_REPLACE_COST() === 40000 && ids("autoReplace") > 0);
    T(`A-2 ${KD}: six expressions subtract a literal 400 (the example's car payment)`, minus400 === 6, minus400);
    T(`A-3 ${KD}: the Stress tab's planned column is household × 1.04^years`, pow104 === 1, pow104);
    T(`A-4 ${KD}: the example's table has no replacement car`, !XB.some(e => /replacement car/i.test(e.label || "")));
  }
}

// ── §B · the engine is unchanged: v6.21's example equals v6.20 with the four rows in its table and its own car switched off ──────────
const PRI = join(HERE, `app_${D_PRIOR}.mjs`);
const M0 = (VER === D_CUR && existsSync(PRI)) ? await import(pathToFileURL(PRI).href) : null;
const xm = (G, opts = {}) => { G.applyScenarioProbs(G.PROB_PRESETS().base.probs); const sch = G.mcResolveTaxSchedule(RY, {});
  const r = G.runExtendedMC(RY, 30, 200, { ltcShocks: true, mortality: true, taxSchedule: sch, rng: mulberry(11), ...opts }); return { r, s: JSON.stringify(r.results) }; };
const mc6 = G => { G.applyScenarioProbs(G.PROB_PRESETS().base.probs); _src = mulberry(3); return JSON.stringify(G.runMonteCarlo(RY, 200).results); };
const wd = G => JSON.stringify(G.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" }).schedule);
const load = (G, P, X) => G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) });
if (M0) {
  console.log(`  B — ${D_PRIOR} → ${D_CUR}: the change is the rows, not the engine`);
  const G0 = M0.__g;
  load(G0, BASE, XB); load(g, BASE, XB);
  T("B-1: the 30-year engine on the example (LTC, mortality) — v6.21 equals v6.20 run on the same table with autoReplace off, bit for bit",
    xm(g).s === xm(G0, { autoReplace: false }).s);
  T("B-2: and a run that skipped the car before (mortality off, no LTC: runs A/B's shape) charges the rows now, the same way",
    xm(g, { mortality: false, ltcShocks: false }).s === xm(G0, { autoReplace: false, mortality: false, ltcShocks: false }).s);
  T("B-3: the 6-year engine and Engine D — bit for bit too", mc6(g) === mc6(G0) && wd(g) === wd(G0));
  const ppWith = xm(g).r.plannedPath; load(g, BASE, XNOCAR); const ppNo = xm(g).r.plannedPath; load(g, BASE, XB);
  const qCar = g.mcQuarterOf(g.buildPlanTimeline(), { year: RY + 8, month: 3 });
  const firstDiff = ppWith.findIndex((v, i) => v !== ppNo[i]);
  // The drop must be the car itself, not only its tax: Engine D's extra 2037 draw also raises that year's tax schedule, which alone moves the
  // path from the same quarter by a few hundred dollars (controls C2 found B-4 passing on that alone). $40,000 grown by inflation is ≥ $40,000.
  T("B-4: the planned path pays the car — it first departs in the quarter that holds March of retirement year 8, by at least the $40,000 row", firstDiff === qCar + 1 && ppNo[qCar + 1] - ppWith[qCar + 1] >= 40000,
    `first diff at ${firstDiff}, car quarter ${qCar}, drop ${Math.round(ppNo[qCar + 1] - ppWith[qCar + 1])}`);
  load(G0, BASE, XNOCAR); const a = xm(G0), b = xm(G0, { autoReplace: false });
  T(`B-5 ${KD.replace("flips at v6.21", "the v6.20 engine, read across the pair")}: v6.20's car moved the paths but not the planned path`,
    a.s !== b.s && JSON.stringify(a.r.plannedPath) === JSON.stringify(b.r.plannedPath));
} else console.log(`  B — skipped: needs the ${D_PRIOR} → ${D_CUR} pair (this leg is ${VER})`);

// ── §C · the attribution: on v6.20's table, v6.21 IS v6.20 — so every re-pinned figure is the four rows ────────────────────────────
if (M0) {
  console.log(`  C — the attribution: v6.21 on v6.20's table reproduces v6.20`);
  const G0 = M0.__g;
  const strat = (G, p) => { G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline(), r = tl.targetRetireYear;
    const P = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: r, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
      deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(),
      ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month, pen: G.getPension(), penOwner: G.getPensionOwner(),
      stateRate: tl.stateTaxRate || 0, stateCode: G.PORTFOLIO().stateCode || null, convTaxFunding: "taxable", taxableGainFrac: 0,
      acaPremium: (G.PORTFOLIO().acaBridge || {}).premium || 0, acaSize: (G.PORTFOLIO().acaBridge || {}).size || 0, ...G.retireStartBalances(r),
      ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
      taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: 70000, ordDrawByYr: G.withdrawalPlanSeries({ retireYear: r, rothAmount: 70000, scenarioPreset: "bull" }).ordDrawByYr };
    return G.runRothStrategies(P); };
  const engines = (mod, p, X) => { const G = mod.__g, EN = mod.__engines; G.applyLoadedData({ portfolio: clone(p), expenses: clone(X) });
    const r = G.buildPlanTimeline().targetRetireYear;
    const S = G.withdrawalPlanSeries({ retireYear: r, rothAmount: 70000, scenarioPreset: "base" });
    const A = { retireYear: r, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr };
    return JSON.stringify({ A: strat(G, p), B: EN.computeTaxPlan(A).rows, C: EN.computeIrmaaPlan(A).rows,
      D: G.computeWithdrawalPlan({ retireYear: r, rothAmount: 70000, scenarioPreset: "base" }).schedule, S, sched: G.mcIncomeTaxSchedule(r, {}) }); };
  const HH = [["the example", BASE], ["the example, single", { ...clone(BASE), single: true }], ["the example in Georgia", { ...clone(BASE), stateCode: "GA", stateName: "Georgia" }],
    ["the example, holdings ×0.6", (() => { const p = clone(BASE); (p.positions || []).forEach(x => { for (const k of ["balance", "trad", "roth"]) if (typeof x[k] === "number") x[k] *= 0.6; }); p.household = Math.round(p.household * 0.6); return p; })()]];
  for (const [lab, p] of HH)
    T(`C-1 ${lab}: on v6.20's table Engines A, B, C, D, the bridge and the Monte Carlo tax schedule are bit-identical v6.20 → v6.21`,
      engines(M0, p, XNOCAR) === engines(M, p, XNOCAR));
  load(G0, BASE, XNOCAR); load(g, BASE, XNOCAR);
  T("C-2: and so are both Monte Carlo engines — against v6.20 with its own car off (the only engine change, B)",
    xm(g).s === xm(G0, { autoReplace: false }).s && mc6(g) === mc6(G0));
  // The hand pin: Engine D's 2037 spending moves by exactly the row, inflated by Engine D's own rule.
  load(g, BASE, XNOCAR); const s0 = g.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" }).schedule;
  load(g, BASE, XB); const s1 = g.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" }).schedule;
  const y37 = RY + 8, r0 = s0.find(r => r.yr === y37), r1 = s1.find(r => r.yr === y37);
  const tdiff = g.tableYearExpense(y37) - (load(g, BASE, XNOCAR), g.tableYearExpense(y37)); load(g, BASE, XB);
  // The hand figure: Engine D inflates from the retirement year (the v5.10 house rule) at expectedInflation() — 2.74% on the example — so
  // the 2037 car is 40,000 × 1.0274^8 = $49,656.54, $49,657 to the dollar. Computed here from the rate and the years, not read back from
  // the engine. (The scope's draft said $49,656 — a truncation, not a rounding; corrected at the build.)
  const infl = Math.pow(1 + g.expectedInflation(), y37 - RY), hand = 40000 * infl;
  T(`C-3: the year's table grows by exactly $40,000 in ${y37}, and Engine D spends 40,000 × 1.0274^8 more — $49,657 to the dollar, by hand`,
    g.expectedInflation() === 0.0274 && y37 - RY === 8 && tdiff === 40000 && Math.abs((r1.exp_y - r0.exp_y) - hand) < 1e-6 && Math.round(r1.exp_y - r0.exp_y) === 49657 && Math.round(hand) === 49657,
    `${tdiff} | ${r1.exp_y - r0.exp_y} vs ${hand}`);
  const others = s1.filter(r => ![RY + 8, RY + 16, RY + 24].includes(r.yr) && r.yr < RY + 8).every(r => JSON.stringify(r) === JSON.stringify(s0.find(x => x.yr === r.yr)));
  T("C-4: every Withdrawal row before the first car is untouched", others);
} else console.log(`  C — skipped: needs the ${D_PRIOR} → ${D_CUR} pair (this leg is ${VER})`);

// ── §D · a plan saved before v6.21 keeps the old schedule as visible rows (module level) ───────────────────────────────────────────
console.log("  D — a plan saved before v6.21 (no carRowsV621): the old schedule as rows");
if (POST) {
  const old = (asOf, retireYear) => { const p = clone(BASE); delete p.carRowsV621; if (asOf) p.asOf = asOf; if (retireYear) p.retireYear = retireYear; return p; };
  const carRows = () => g.EXPENSES().filter(e => e && e.label === g.CAR_SCHEDULE_V620().label).map(e => e.start);
  const X0 = clone(XNOCAR), X0len = X0.length;
  g.applyLoadedData({ portfolio: old(), expenses: X0 });
  T("D-1: four rows named for v6.21's addition, $40,000, one-time, dated March of retirement years 8–32 — the old schedule exactly",
    JSON.stringify(carRows()) === JSON.stringify([8, 16, 24, 32].map(k => `${RY + k}-03`))
    && g.EXPENSES().filter(e => e.label === g.CAR_SCHEDULE_V620().label).every(e => e.amount === 40000 && e.freq === "once" && e.end === e.start)
    && JSON.stringify(g.PORTFOLIO()._carRowsAdded) === JSON.stringify(carRows()), JSON.stringify(carRows()));
  T("D-2: the table passed in is not touched (nothing is written until Save & Apply)", X0.length === X0len && !X0.some(e => e.label === g.CAR_SCHEDULE_V620().label));
  const wOld = wd(g); load(g, BASE, XB);
  T("D-3: the migrated plan's Withdrawal schedule equals the example's own (the rows differ only in their label)", wOld === wd(g));
  g.applyLoadedData({ portfolio: clone(BASE), expenses: clone(XNOCAR) });
  T("D-4: a plan WITH the field gains nothing", carRows().length === 0 && g.PORTFOLIO()._carRowsAdded === null);
  g.applyLoadedData({ portfolio: old() });
  T("D-5: a portfolio-only load (no table passed) gains nothing", g.PORTFOLIO()._carRowsAdded === null || g.PORTFOLIO()._carRowsAdded === undefined);
  g.applyLoadedData({ portfolio: old("2040-06-15", 2029), expenses: clone(XNOCAR) });
  T("D-6: a plan already retired (as of June 2040) gains only the rows from its as-of month on — 2045, 2053, 2061, 2069; 2037 is past",
    JSON.stringify(carRows()) === JSON.stringify(["2045-03", "2053-03", "2061-03", "2069-03"]), JSON.stringify(carRows()));
  g.applyLoadedData({ portfolio: old("2045-02-01", 2029), expenses: clone(XNOCAR) });
  T("D-7: as of February 2045, March 2045 is still ahead and is added", carRows()[0] === "2045-03", JSON.stringify(carRows()));
  g.applyLoadedData({ portfolio: old(null, 2031), expenses: clone(XNOCAR) });
  T("D-8: the rows are dated from the plan's own retirement year (2031 → 2039, 2047, 2055)", carRows().slice(0, 3).join(",") === "2039-03,2047-03,2055-03", JSON.stringify(carRows()));
  g.applyLoadedData({ portfolio: old(), expenses: clone(XNOCAR) }); const once = clone(g.EXPENSES());
  g.applyLoadedData({ portfolio: old(), expenses: once });
  T("D-9: loading the migrated table again adds nothing twice, and still lists the rows for the notice", carRows().length === 4 && (g.PORTFOLIO()._carRowsAdded || []).length === 4);
  load(g, BASE, XB);
} else {
  const p = clone(BASE); delete p.carRowsV621;
  g.applyLoadedData({ portfolio: p, expenses: clone(XB) });
  T(`D-1 ${KD}: a saved plan gains no rows — its car is the constant, charged by the 30-year runs only`, !g.EXPENSES().some(e => /replacement car/i.test(e.label || "")));
}

// ── §E · D-43: the "after the payments end" figure, from the table ───────────────────────────────────────────────────────────────────
console.log("  E — the figure after the payments end (D-43)");
{
  // Independent oracle: month arithmetic in integers, rows running at the FULL month that end before the horizon year.
  const ym = s => { const [y, m] = s.split("-").map(Number); return y * 12 + m - 1; };
  const sOf = k => `${Math.floor(k / 12)}-${String(k % 12 + 1).padStart(2, "0")}`;
  const oracle = () => { const tl = g.buildPlanTimeline(), X = g.EXPENSES();
    const ev = (tl.medicareB.year * 12 + (tl.medicareB.month || 1) - 1) >= (tl.retireDate.year * 12 + (tl.retireDate.month || 1) - 1) ? tl.medicareB : tl.retireDate;
    const fk = Math.max(ev.year * 12 + (ev.month || 1) - 1, ev.year * 12 + 5, tl.asOf.year * 12 + (tl.asOf.month || 1) - 1);
    const H = Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
    const run = X.filter(e => e.freq !== "once" && ym(e.start) <= fk && fk <= ym(e.end) && Math.floor(ym(e.end) / 12) < H);
    if (!run.length) return null;
    const after = Math.max(...run.map(e => ym(e.end))) + 1;
    const monthly = X.filter(e => e.freq !== "once" && ym(e.start) <= after && after <= ym(e.end)).reduce((a, e) => a + e.amount, 0);
    return monthly > 0 ? { monthly, from: sOf(after), n: run.length } : null; };   // nothing spent after them: they were the plan's spending
  const got = () => { const p = g.postPayments(); return p ? { monthly: p.monthly, from: `${p.from.year}-${String(p.from.month).padStart(2, "0")}`, n: p.labels.length } : null; };
  if (POST) {
    load(g, BASE, XB);
    const pp = g.postPayments();
    T("E-1: the example — $7,620 a month from May 2034, after the Car Payment ends: v6.20's own figure ($8,020 − $400)",
      !!pp && pp.monthly === 7620 && pp.from.year === 2034 && pp.from.month === 5 && pp.labels.join() === "Car Payment" && g.postPaymentsWhat() === "Car Payment"
      && pp.monthly === g.snapshots().full - 400, JSON.stringify(pp));
    const tables = [
      ["no row ends before the horizon", XB.filter(e => e.label !== "Car Payment")],
      ["two rows end (Apr 2034, Dec 2036)", [...XB, { cat: "Housing", label: "Home equity loan", amount: 300, freq: "monthly", start: "2029-04", end: "2036-12", deductible: false, phase: "post" }]],
      ["a row ends after the horizon", XB.map(e => e.label === "Car Payment" ? { ...e, end: "2060-12" } : e)],
      ["a row ends before the Medicare month (not running then)", XB.map(e => e.label === "Car Payment" ? { ...e, end: "2030-12" } : e)],
      ["a new row starts the month the payment ends", [...XB, { cat: "Travel", label: "Travel", amount: 250, freq: "monthly", start: "2034-05", end: "2070-12", deductible: false, phase: "post" }]],
      ["the table's only spending ends before the horizon (a guided-wizard plan's living row, D-54)", [{ cat: "Other", label: "Living expenses (wizard)", amount: 6000, freq: "monthly", start: "2026-01", end: "2040-12", deductible: false, phase: "both" }]],
    ];
    for (const [lab, X] of tables) { load(g, BASE, X); const a = got(), b = oracle();
      T(`E-2 ${lab}: the rule matches an independent oracle`, JSON.stringify(a) === JSON.stringify(b), `${JSON.stringify(a)} vs ${JSON.stringify(b)}`); }
    load(g, { ...clone(BASE), single: true }, XB);
    T("E-3 a single plan: the rule matches the oracle", JSON.stringify(got()) === JSON.stringify(oracle()), JSON.stringify(got()));
    load(g, { ...clone(BASE), lifeExpA: 100, lifeExpB: 100 }, tables[1][1]);
    T("E-3b a plan with longer lives (a later horizon) and two ending rows: the rule matches the oracle", JSON.stringify(got()) === JSON.stringify(oracle()) && got() !== null, JSON.stringify(got()));
    load(g, BASE, tables[1][1]);
    T("E-5: two ending rows read \"2 payments end\"; one reads \"Car Payment ends\"", g.postPaymentsEnd() === "2 payments end" && (load(g, BASE, XB), g.postPaymentsEnd() === "Car Payment ends"), g.postPaymentsEnd());
    load(g, BASE, tables[5][1]);
    T("E-6: a table that spends nothing once its rows end has no figure (null, not $0)", g.postPayments() === null);
    load(g, BASE, tables[0][1]);
    T("E-4: with no ending row there is no figure (the displays leave it out)", g.postPayments() === null);
    load(g, BASE, XB);
  } else {
    T(`E-1 ${KD}: the six displays subtract $400 from every plan's spending (no table read exists)`, g.postPayments() === undefined);
  }
}

// ── §F · D-47: the Stress tab's planned path is the engine's own ─────────────────────────────────────────────────────────────────────
console.log("  F — the Stress tab's planned column (D-47)");
{
  load(g, BASE, XB);
  g.applyScenarioProbs(g.PROB_PRESETS().bull.probs);
  const r = g.runExtendedMC(RY, 30, 600, { ltcShocks: false, mortality: true, taxSchedule: g.mcResolveTaxSchedule(RY, {}), rng: mulberry(42) });
  const H = g.PORTFOLIO().household, GR = g.GUARDRAILS();
  const low = (planned) => r.pctByYear.p50.filter((med, yi) => med < planned(yi) * GR.lowerPct).length;
  const lowOld = low(yi => H * Math.pow(1.04, yi)), lowNew = low(yi => r.plannedPath[Math.min(4 * yi, r.plannedPath.length - 1)]);
  T("F-0: SETUP — snapshot yi is plannedPath[4·yi]: both start at the household's balance, 31 snapshots for 30 years",
    r.pctByYear.p50.length === 31 && r.plannedPath[0] === H, `${r.pctByYear.p50.length} / ${r.plannedPath[0]}`);
  T(`F-1: under BULL-LEANING (the first-visit preset) the old 4%-a-year benchmark marks the median low in many years (${lowOld}); the engine's own path in none`,
    lowOld >= 10 && lowNew === 0, `${lowOld} / ${lowNew}`);
  T("F-2: the guardrails' own bands are 80% and 120% (that the headers and bands read them is A-7's AST check)", GR.lowerPct === 0.8 && GR.upperPct === 1.2);
  load(g, BASE, XB);
}

// ── §G · rendered: the Income and SS tabs, the Stress table, the Roth tab's state line, the notices, Save & Apply ───────────────────────
console.log("  G — rendered (Income, Social Security, Stress, Roth, Monte Carlo, My Data)");
{
  const PREFIX = "dc:";
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
  };
  window.URL.createObjectURL = () => "blob:t84"; window.URL.revokeObjectURL = () => {};
  globalThis.URL.createObjectURL = () => "blob:t84"; globalThis.URL.revokeObjectURL = () => {};
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  const txt = () => body().textContent || "";
  const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  let root, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const render = async () => { el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush(); };
  const revisit = async (tab = "my data") => { try { await act(async () => { root.unmount(); }); } catch (e) {} if (el) el.remove(); await render(); const t = tabBtn(tab); if (t) { await click(t); await flush(); } };
  const go = async name => { await click(tabBtn(name)); await flush(); await flush(); };
  const stored = k => JSON.parse(window.localStorage.getItem(PREFIX + K[k]) || "null");
  const notice = w => body().querySelector(`[data-dc-car-rows-notice="${w}"]`);
  const waitFor = async (re, ms = 240000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (re.test(txt())) return true; await flush(500); } return false; };

  window.localStorage.clear(); await render();
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  await go("my data");
  T("G-0: SETUP — My Data rendered the example household", /RETIREMENT HOLDINGS/.test(txt()));
  await go("income");
  const inc = txt();
  if (POST) {
    T("G-1: the Income tab names the payment that ends and the month — no \"car paid off\" / \"Post-car\" wording",
      /Monthly Shortfall \(after Car Payment ends\)/.test(inc) && /Draw after Car Payment ends/.test(inc) && /From May 2034, after Car Payment ends, the shortfall is/.test(inc)
      && !/car paid off|Post-car/i.test(inc), inc.match(/(Draw after[^$]{0,40})/) ? RegExp.$1 : "no match");
    await go("ss");
    T("G-2: the Social Security tab's card reads \"Shortfall after Car Payment ends\"", /Shortfall after Car Payment ends/.test(txt()) && !/Post-car/.test(txt()));
  } else {
    T(`G-1 ${KD}: the Income tab speaks of the example's car to every plan ("car paid off", "Post-car draw")`, /car paid off/i.test(inc) && /Post-car draw/.test(inc));
    await go("ss");
    T(`G-2 ${KD}: the Social Security tab's card reads "Post-car shortfall"`, /Post-car shortfall/.test(txt()));
  }
  await go("roth");
  // The example chooses no state in My Data (no stateCode): its Florida is the master prompt's state line through v6.21, a field on
  // DEFAULT_PORTFOLIO from v6.22 (D-53) — the timeline reads it and the Taxes tab names it. The Roth line must say what the Taxes tab says.
  T("G-3: the example (Florida — its master prompt's state line through v6.21, a field from v6.22; no state chosen in My Data) — the Roth tab's rules box says Florida has no state income tax",
    !DG.PORTFOLIO().stateCode && DG.PLAN_TIMELINE().stateName === "Florida" && /Florida — no state income tax/.test(txt()));
  await go("monte carlo");
  const mcReady = await waitFor(/RUN C: FULL 30-YEAR/);
  const mc = txt();
  T("G-3b: SETUP — the Monte Carlo tab rendered its extended runs", mcReady);
  if (POST) T("G-6: the Monte Carlo tab says cars are the plan's one-time rows, and the mortgage what-if no longer names auto-replacement",
    !!body().querySelector("[data-dc-car-rows-mc]") && /Through v6\.20 every 30-year run also bought a \$40,000 car every 8 years/.test(mc) && !/auto-replacement/i.test(mc) && !notice("mc"));
  else T(`G-6 ${KD}: the mortgage what-if names auto-replacement`, /auto-replacement/.test(mc));
  await go("stress"); const stReady = await waitFor(/30-YEAR GUARDRAIL BOUNDARIES/, 240000);
  const st = txt();
  T("G-4: the Stress table rendered, and its headers show 80% / 120% (the values; A-7 checks they come from GUARDRAILS)", stReady && /Lower \(80%\)/.test(st) && /Upper \(120%\)/.test(st));
  if (POST) T("G-5: its note says Planned is the engine's own deterministic path", /Planned is the engine's own deterministic path/.test(st) && !/auto-replacement/i.test(st));
  else T(`G-5 ${KD}: its note says the run has auto-replacement`, /auto-replacement/.test(st));
  // A Georgia plan: the Roth tab's line follows the plan.
  // "Use example data" stores no portfolio (only the meta key), so each plan below is written from the live one.
  { const P = clone(DG.PORTFOLIO()); P.stateCode = "GA"; P.stateName = "Georgia";
    window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify(P)); await revisit("roth");
    if (POST) T("G-7: a Georgia plan's Roth tab says Georgia, with its own income tax — not Florida", /Georgia — its own state income tax, as on the Taxes tab/.test(txt()) && !/Florida — no state income tax/.test(txt()));
    else T(`G-7 ${KD}: a Georgia plan's Roth tab still says "Florida — no state income tax"`, /Florida — no state income tax/.test(txt())); }
  // A plan with no state chosen but a named flat rate (My Data's name and rate fields): the line names it and its rate.
  { const P = clone(DG.PORTFOLIO()); P.stateCode = null; P.stateName = "Ohio"; P.stateTaxRate = 0.035;
    window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify(P)); await revisit("roth");
    if (POST) T("G-7b: a plan taxed at a flat 3.5% in \"Ohio\" (no state chosen) — the Roth tab names it and the rate, as the Taxes tab does",
      /Ohio — a flat 3\.50% state tax on taxable income, as on the Taxes tab/.test(txt()) && !/Florida/.test(txt().match(/SS taxation[\s\S]{0,400}/)[0]));
    else T(`G-7b ${KD}: the same plan's Roth tab still says "Florida — no state income tax"`, /Florida — no state income tax/.test(txt())); }
  if (POST) {
    // A plan saved before v6.21: the stored portfolio without the field, the stored table without the rows.
    const OLD = clone(DG.PORTFOLIO()); delete OLD.carRowsV621; delete OLD._carRowsAdded;
    OLD.stateCode = BASE.stateCode; OLD.stateName = BASE.stateName; OLD.stateTaxRate = BASE.stateTaxRate;
    window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify(OLD));
    window.localStorage.setItem(PREFIX + K.expenses, JSON.stringify(XNOCAR));
    await revisit("my data");
    const n = notice("mydata"), nt = n ? n.textContent : "";
    T("G-8: an old plan opens with the My Data notice naming the four rows and their dates", !!n && /that schedule was added to your expense table as 4 rows named "Replacement car \(added by v6\.21/.test(nt)
      && /Mar 2037, Mar 2045, Mar 2053, Mar 2061/.test(nt) && /nothing is saved until you do/.test(nt), nt.slice(0, 200));
    T("G-9: nothing was written — storage still holds the plan without the field and the table without the rows",
      !("carRowsV621" in stored("portfolio")) && !stored("expenses").some(e => /Replacement car/.test(e.label)));
    await go("monte carlo");
    T("G-10: the Monte Carlo tab shows the notice too", !!notice("mc") && /keeps that schedule as 4 one-time rows/.test(notice("mc").textContent));
    await go("my data");
    await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush();
    const P1 = stored("portfolio"), X1 = stored("expenses");
    // [KNOWN DEFECT 2026-10-19, D-52] My Data's editor keeps a one-time row's YEAR only and stores it as June (buildExpenses, `${yr}-06`),
    // so Save & Apply re-dates the March rows to June — the same year in Engine D, Backtest and What Breaks; one quarter later in the Monte
    // Carlo. Filed at v6.21 (found by this check); pinned so a fix flips it.
    // The notices' list (_carRowsAdded) is written by the loader onto the object it is handed and reset on every load, so a stored copy is
    // harmless: My Data's save stores it as null (checked here); a backup import or restore can store the list itself, which the next load
    // recomputes.
    // v6.24 (D-52 fixed): My Data keeps each row's months, so the four rows stay in March. An array, so the registrar widens it.
    const _carMo = ["v624", "v625", "v626", "v627", "v628", "v629"].includes(VER) ? "03" : "06";
    T(`G-11: Save & Apply stores the field (and no list of added rows) and the table with the four rows${_carMo === "03" ? ", in March, where v6.21 dated them" : " — [KNOWN DEFECT 2026-10-19, D-52] re-dated June"}`,
      !!P1 && P1.carRowsV621 === true && !P1._carRowsAdded && Array.isArray(X1)
      && X1.filter(e => /Replacement car \(added by v6\.21/.test(e.label)).map(e => e.start).join() === ["2037", "2045", "2053", "2061"].map(y => `${y}-${_carMo}`).join(), JSON.stringify(X1 && X1.filter(e => /Replacement/.test(e.label)).map(e => e.start)));
    await revisit("my data");
    T("G-12: after Save & Apply the notice is gone from both tabs", !notice("mydata") && (await go("monte carlo"), !notice("mc")));
  }
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

// ── §H · the copy: the Field Manual and METHODOLOGY ──────────────────────────────────────────────────────────────────────────────────
console.log("  H — the Field Manual, METHODOLOGY and the extinct sentences");
{
  const DOCS = g.DOCS_HTML() || "";
  const METH = existsSync(join(HERE, "..", "METHODOLOGY.md")) ? readFileSync(join(HERE, "..", "METHODOLOGY.md"), "utf8") : null;
  if (POST) {
    T("H-1: the Field Manual's Monte Carlo entry has its v6.21 cars paragraph", DOCS.includes("<strong>Its cars (v6.21).</strong> A car is a one-time row in your expense table"));
    // v6.23 (D-49): the taper's half of the bullet follows its rule — every plan with no streams through v6.22, the example alone from v6.23 (t86 G-1)
    T(`H-2: the honest-limits bullet: cars are expense rows, and the spouse-B taper ${POST_D49 ? "belongs to the example household alone (v6.23)" : "applies to every plan with no income streams"}`,
      DOCS.includes("<strong>Cars are expense rows (v6.21).</strong>") && (POST_D49 ? /belongs to the example household alone; entering any income stream/.test(DOCS)
        : /applies to every plan with no income streams, single plans included; entering any income stream/.test(DOCS)));
    T("H-3 [EXTINCTION]: no text says the taper applies only to the demo data, or that auto-replacement is a fixed example schedule",
      !/applies only to the demo data/.test(allText) && !/Auto-replacement is a fixed example schedule/.test(allText));
    T("H-4 [EXTINCTION]: no text tells every plan it lives in Florida (the mortgage what-if; the Roth rules box reads the plan)",
      !/no FL income tax/.test(allText) && /The model gives mortgage interest no tax deduction — it takes the standard deduction and does not model itemizing/.test(allText));
    T("H-5: METHODOLOGY has the v6.21 section, and its D-47 limitation is closed", !!METH && /^## Cars are expense rows \(v6\.21\)/m.test(METH)
      && !/compares the median with `household × 1\.04\^years`, a benchmark that ignores withdrawals \(filed at v6\.19\)/.test(METH));
  } else {
    T(`H-1 ${KD}: the honest-limits bullet calls auto-replacement a fixed example schedule`, /Auto-replacement is a fixed example schedule/.test(DOCS));
    T(`H-2 ${KD}: the mortgage what-if says "no FL income tax" to every plan`, /no FL income tax/.test(allText));
  }
}

finished = true;
console.log(`\nt84 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);   // exit, not exitCode: the rendered app leaves timers running and the process would wait for them
