// t81 — THE WITHDRAWAL TAB SPENDS THE EXPENSE TABLE AT THE PLAN'S OWN DATES, YEAR BY YEAR (v6.18 — D-41)
// Run: node t81_engine_d_spending.mjs v618   |   node t81_engine_d_spending.mjs v617
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md). Through v6.17 Engine D (the Withdrawal tab), Backtest and
// What-Breaks spent two snapshots of the expense table — getMonthlyExpense("2029-06") before spouse B's Medicare year and
// getMonthlyExpense("2031-06") after — the example household's dates, typed in, for EVERY plan. A plan on another calendar spent the
// wrong rows (retiring in 2032, a month that still held the current home's costs and none of the retirement rows); a row ending after
// June 2031 was charged for life; one starting later never; one-time rows never arrived. The Taxes, IRMAA and Roth tabs inherited it
// through the bridge. From v6.18 one function, `tableYearExpense(yr, survivorFromYr)`, sums each calendar year's own months and one-time
// rows; the three display snapshots take their months from the plan's timeline by one rule (the example's three months are unchanged).
//
// GATED PER LEG (OPERATIONS §B2). The v6.17 leg pins the snapshots as dated [KNOWN DEFECT] checks. §A's ORACLE is independent of the
// spending code: it reads the EXPENSES rows itself — its own month loop and one-time sum — and calls no app function that computes
// spending. It takes the plan's dates (retirement, first death) from PLAN_TIMELINE and the rate from expectedInflation(): inputs, not
// the computation under test. §D needs both legs' modules (the current leg only; printed skip on the other).
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(81); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v618";
const KNOWN_VERSIONS = ["v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER);   // an array, so the next registration widens it
// The differential's pair — constants, NOT `VER === "v618"`, so the registrar cannot widen them (t76 records why).
const D_PRIOR = "v617", D_CUR = "v618";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g } = M;
const E = M.__engines;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
// v6.21 (D-42): the example's table carries four $40,000 car rows from 2037, which Engine D now spends, so every example figure here that
// rides on its draws after 2036 moved. PIN21 picks the v6.21 figures (measured at the build). The v6.21 leg is ALSO run with
// DC_V620_TABLE=1 — the example's table without its car rows, which is v6.20's — and there every v6.20 figure must come out exactly: that
// second run attributes each move to the rows alone (runsuite.sh, "<suite>-<cur>-table620"; t84 C proves v6.21 on that table IS v6.20).
const POST_D42 = ["v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER);   // an array, so the registrar widens it
const TABLE620 = POST_D42 && process.env.DC_V620_TABLE === "1";
const PIN21 = POST_D42 && !TABLE620;
const P42 = (v620, v621) => PIN21 ? v621 : v620;
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
process.on("exit", () => { if (!finished) { console.log(`t81 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const KD = "[KNOWN DEFECT 2026-10-18, D-41 — flips at v6.18]";
console.log(`t81 — THE WITHDRAWAL TAB'S SPENDING (${VER})\n`);

const BASE = clone(g.PORTFOLIO()), EX = clone(g.EXPENSES()).filter(e => !(TABLE620 && e && e.label === "Replacement car"));   // v6.21: TABLE620 → v6.20's table
if (TABLE620) console.log("  (DC_V620_TABLE=1 — v6.20's table, the car rows removed: every v6.20 figure must come out exactly)");
const load = (P, X = EX) => { g.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); return g.PLAN_TIMELINE(); };
const TL0 = load(BASE);
const ymd = o => `${o.year}-${String(o.month).padStart(2, "0")}-${String(o.day || 1).padStart(2, "0")}`;
const sh = (d, n) => String(d).replace(/^(\d{4})/, y => String(+y + n));
// The same plan on a later calendar: both birth dates, both retirement years and every dated row move by n years (open-ended rows keep
// their 2070 end). Life expectancies are ages, so they ride along.
const shifted = n => {
  const p = clone(BASE);
  p.dobA = ymd({ ...TL0.dobA, year: TL0.dobA.year + n }); p.dobB = ymd({ ...TL0.dobB, year: TL0.dobB.year + n });
  p.retireYear = TL0.targetRetireYear + n; p.retireYearB = TL0.targetRetireYearB + n; p.lifeExpA = TL0.lifeExpA; p.lifeExpB = TL0.lifeExpB;
  const ex = EX.map(e => ({ ...e, start: sh(e.start, n), end: String(e.end).startsWith("2070") ? e.end : sh(e.end, n) }));
  return { p, ex };
};

// ── the independent oracle ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// SURVIVOR_SPEND_FACTOR is read from the source text (it is a constant, not the computation under test).
const SURV = (() => { const m = SRC.match(/const SURVIVOR_SPEND_FACTOR = ([0-9.]+);/); return m ? +m[1] : NaN; })();
const ymOf = (yr, m) => `${yr}-${String(m).padStart(2, "0")}`;
const oMonth = (X, d) => X.reduce((s, e) => s + (e.freq !== "once" && d >= e.start && d <= e.end ? +e.amount : 0), 0);
const oOnce = (X, d) => X.reduce((s, e) => s + (e.freq === "once" && String(e.start).slice(0, 7) === d ? +e.amount : 0), 0);
const oYear = (X, yr, survFrom = Infinity) => {
  let mo = 0, once = 0;
  for (let m = 1; m <= 12; m++) { mo += oMonth(X, ymOf(yr, m)); once += oOnce(X, ymOf(yr, m)); }
  return mo * (yr >= survFrom ? SURV : 1) + once;
};
const deathYr1 = t => t.single ? Infinity : Math.min(t.dobA.year + t.lifeExpA, t.dobB.year + t.lifeExpB);
const sched = (RY, ra = 70000) => g.computeWithdrawalPlan({ retireYear: RY, rothAmount: ra, scenarioPreset: "base" }).schedule;

// ── households ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const fx = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
const HH = [["example", { p: clone(BASE), ex: clone(EX) }]];
for (const n of Object.keys(fx.HOUSEHOLDS)) { load(BASE); HH.push([`fixture:${n}`, { p: fx.build(g, n), ex: clone(EX) }]); }
HH.push(["shifted +3", shifted(3)], ["shifted +6", shifted(6)]);
{ const p = clone(BASE); p.single = true; HH.push(["single", { p, ex: clone(EX) }]); }
{ const p = clone(BASE); p.dobB = "1962-03-01"; HH.push(["spouse B on Medicare before retirement", { p, ex: clone(EX) }]); }
{ const p = clone(BASE); p.lifeExpA = 2036 - TL0.dobA.year; HH.push(["first death in 2036", { p, ex: clone(EX) }]); }
// A table built to stress the rule: a one-time row mid-year in retirement, a row ending mid-year, a row starting after the Medicare year.
const STRESS_EX = [...clone(EX),
  { cat: "Retirement Life", name: "t81 roof", amount: 15000, freq: "once", start: "2033-07", end: "2033-07" },
  { cat: "Housing", name: "t81 ends mid-2032", amount: 250, freq: "monthly", start: "2029-04", end: "2032-08" },
  { cat: "Healthcare", name: "t81 starts 2036", amount: 300, freq: "monthly", start: "2036-03", end: "2070-12" }];
HH.push(["stress table", { p: clone(BASE), ex: STRESS_EX }]);

// ── §A · Engine D's spending equals the oracle, to the cent ───────────────────────────────────────────────────────────────────────────
console.log("  A — Engine D's spending against an independent oracle");
T("A-0: SETUP — SURVIVOR_SPEND_FACTOR read from the source", Number.isFinite(SURV) && SURV > 0 && SURV < 1, String(SURV));
const infl = g.expectedInflation();
// v6.30 (D-60, DU-1 (a); docs/SCOPE_D60_DOLLAR_UNITS_V630.md): ONE inflation clock — Engine D now inflates the table from the as-of year, as
// the Monte Carlo always has; through v6.29 it inflated from the retirement year (a second clock). The oracle's exponent follows the leg.
// An array, so register_tag2 widens it each release.
const U630 = ["v630", "v631", "v632", "v633", "v634"].includes(VER);
const clock0 = (t, RY) => U630 ? t.asOfYear : RY;
const oracleSched = (X, t, RY) => yr => oYear(X, yr, deathYr1(t)) * Math.pow(1 + infl, Math.max(0, yr - clock0(t, RY)));
let hhDiffer = 0;
for (const [name, { p, ex }] of HH) {
  const t = load(p, ex), RY = t.targetRetireYear, S = sched(RY), O = oracleSched(ex, t, RY);
  const bad = S.filter(r => Math.abs(r.exp_y - O(r.yr)) > 0.005);
  if (POST) T(`A-1 ${name}: every year's spending equals the oracle to the cent (${S.length} years, ${S[0].yr}–${S[S.length - 1].yr})`,
    S.length > 0 && bad.length === 0, bad.slice(0, 3).map(r => `${r.yr}: ${r.exp_y.toFixed(2)} vs ${O(r.yr).toFixed(2)}`).join("; "));
  else if (bad.length) hhDiffer++;
}
if (!POST) T(`A-1 ${KD} the snapshots disagree with the oracle on most households (${hhDiffer} of ${HH.length})`, hhDiffer >= HH.length - 1, String(hhDiffer));
// The retirement-year buttons (DC-5 (a)): the table stays on its calendar dates, as the Monte Carlo reads it.
{
  const t = load(BASE);
  for (const RY of [t.targetRetireYear - 1, t.targetRetireYear + 1]) {
    const S = sched(RY), O = oracleSched(EX, t, RY), bad = S.filter(r => Math.abs(r.exp_y - O(r.yr)) > 0.005);
    if (POST) T(`A-2 example, retiring ${RY} (a retirement-year button): every year equals the oracle`, bad.length === 0, bad.slice(0, 2).map(r => r.yr).join(","));
  }
}
// Hand pins on the oracle and the engine — the example's table, read by eye: through March 2029 the current home's rows, from April
// the retirement rows; the golf cart ($20,000) and closing costs ($8,000) in April 2029; the car payment ($400) April 2029 – April 2034.
{
  const t = load(BASE), S = sched(t.targetRetireYear), at = y => S.find(r => r.yr === y);
  T("A-3 hand: the example table at June 2029 and June 2031 is $8,170 and $8,020 a month", oMonth(EX, "2029-06") === 8170 && oMonth(EX, "2031-06") === 8020);
  T("A-4 hand: the example's 2029 one-time rows are $28,000 (golf cart $20,000 + closing costs $8,000)", oYear(EX, 2029) - [...Array(12)].reduce((s, _, i) => s + oMonth(EX, ymOf(2029, i + 1)), 0) === 28000);
  T("A-5 hand: 2033 is twelve months at $8,020 = $96,240; 2034 drops the car after April: $96,240 − 8 × $400 = $93,040", oYear(EX, 2033) === 96240 && oYear(EX, 2034) === 93040);
  if (POST) {
    const k29 = Math.pow(1 + infl, 2029 - clock0(t, t.targetRetireYear));
    T(U630 ? `A-6 the example's first year (2029) is $126,280 — $98,280 of monthly rows for the months they run + $28,000 one-time — × (1+i)^3 from the as-of year: $${(126280 * k29).toFixed(2)}`
           : "A-6 the example's first year (2029, no inflation yet) is $126,280: $98,280 of monthly rows for the months they run + $28,000 one-time", Math.abs(at(2029).exp_y - 126280 * k29) < 0.005, at(2029) && at(2029).exp_y);
    const s44 = at(2044), d1 = deathYr1(t);
    T(`A-7 the survivor year (${d1}): its monthly rows are $7,620 × 12 = $91,440 (the car long paid off), × the survivor factor ${SURV}, × inflation`,
      d1 === 2044 && Math.abs(s44.exp_y - 91440 * SURV * Math.pow(1 + infl, 2044 - clock0(t, t.targetRetireYear))) < 0.005, s44 && s44.exp_y);
  } else {
    T(`A-6 ${KD} the example's 2029 is the June 2029 snapshot × 12 = $98,040 (no one-time rows)`, Math.abs(at(2029).exp_y - 98040) < 0.005, at(2029) && at(2029).exp_y);
    const s34 = at(2034);
    T(`A-7 ${KD} 2034 still charges the car for twelve months: $8,020 × 12 × inflation`, Math.abs(s34.exp_y - 8020 * 12 * Math.pow(1 + infl, 2034 - t.targetRetireYear)) < 0.005, s34 && s34.exp_y);
  }
  const { p, ex } = shifted(3), t3 = load(p, ex), S3 = sched(t3.targetRetireYear);
  if (U630) T(`A-8 the same plan 3 years later spends the same first year in today's dollars: $126,280 in 2032 — × (1+i)^6 from the as-of year, $${(126280 * Math.pow(1 + infl, 2032 - t3.asOfYear)).toFixed(2)}`,
    Math.abs(S3[0].exp_y - 126280 * Math.pow(1 + infl, 2032 - t3.asOfYear)) < 0.005, S3[0].exp_y);
  else if (POST) T("A-8 the same plan 3 years later spends the same first year: $126,280 in 2032", Math.abs(S3[0].exp_y - 126280) < 0.005, S3[0].exp_y);
  else T(`A-8 ${KD} the same plan 3 years later spends $6,700 × 12 = $80,400 in 2032 — the June 2029 table, still holding the current home`, Math.abs(S3[0].exp_y - 80400) < 0.005, S3[0].exp_y);
}
// The one function, unit-tested against the oracle across the table's whole range.
if (POST) {
  const t = load(BASE), d1 = deathYr1(t); let bad = [];
  for (let yr = 2026; yr <= 2060; yr++) for (const sf of [Infinity, d1]) if (g.tableYearExpense(yr, sf) !== oYear(EX, yr, sf)) bad.push(`${yr}/${sf}`);
  T("A-9 tableYearExpense equals the oracle exactly, 2026–2060, with and without a survivor year", bad.length === 0, bad.slice(0, 5).join(","));
  load(BASE, STRESS_EX); bad = [];
  for (let yr = 2026; yr <= 2060; yr++) if (g.tableYearExpense(yr, d1) !== oYear(STRESS_EX, yr, d1)) bad.push(yr);
  T("A-10 …and on the stress table (a mid-year one-time row, a row ending mid-year, a row starting after the Medicare year)", bad.length === 0, bad.join(","));
  T("A-11 the default survivor year is none: tableYearExpense(2050) has no survivor factor", g.tableYearExpense(2050) === oYear(STRESS_EX, 2050));
  // A-12: the survivor factor applies to the monthly rows only — a one-time row after the first death is spent whole. With the survivor
  // year set to 2030, the stress table's 2033 roof ($15,000, July) must enter at $15,000, not $11,250.
  T("A-12 after the first death a one-time row is spent whole: 2033 with a 2030 survivor year = monthly × " + SURV + " + $15,000",
    g.tableYearExpense(2033, 2030) === oYear(STRESS_EX, 2033, 2030) && oYear(STRESS_EX, 2033, 2030) - oYear(STRESS_EX.filter(e => e.name !== "t81 roof"), 2033, 2030) === 15000,
    `${g.tableYearExpense(2033, 2030)} vs ${oYear(STRESS_EX, 2033, 2030)}`);
  load(BASE);
} else T(`A-9 ${KD} there is no shared year-by-year read: tableYearExpense is absent`, typeof g.tableYearExpense === "undefined");

// ── §B · one read, no typed dates (AST) ──────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — one read, no typed dates (AST)");
{
  const SNAP = new Set(["PRE_MONTHLY", "POST_MONTHLY_EARLY", "POST_MONTHLY_FULL"]);
  const fnNode = name => AST.body.find(n => n.type === "FunctionDeclaration" && n.id && n.id.name === name);
  const idsIn = (node, set) => { const out = []; walk.full(node, n => { if (n.type === "Identifier" && set.has(n.name)) out.push(n.name); }, W); return out; };
  // B-1: no "YYYY-MM" string literal is handed to either table reader
  const typed = [];
  walk.full(AST, n => {
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && /^(getMonthlyExpense|getOneTimeExpenses)$/.test(n.callee.name)
      && n.arguments[0] && n.arguments[0].type === "Literal" && /^\d{4}-\d{2}$/.test(String(n.arguments[0].value))) typed.push(`L${n.loc.start.line}`);
  }, W);
  if (POST) T("B-1 EXTINCTION: no typed \"YYYY-MM\" date is passed to getMonthlyExpense or getOneTimeExpenses anywhere", typed.length === 0, typed.join(","));
  else T(`B-1 ${KD} six typed dates feed the snapshots (L90–92, L96–98)`, typed.length === 6, typed.join(","));
  // B-2 / B-3: Engine D reads no snapshot and spends tableYearExpense
  const D = fnNode("computeWithdrawalPlan");
  T("B-2 SETUP: computeWithdrawalPlan is a module-level function", !!D);
  if (D) {
    const snaps = idsIn(D, SNAP), tye = idsIn(D, new Set(["tableYearExpense"]));
    if (POST) T("B-2 EXTINCTION: Engine D reads none of the three snapshots, and spends tableYearExpense", snaps.length === 0 && tye.length >= 1, `snapshots ${snaps.join(",") || "none"}; tableYearExpense ×${tye.length}`);
    else T(`B-2 ${KD} Engine D spends POST_MONTHLY_EARLY / POST_MONTHLY_FULL`, snaps.includes("POST_MONTHLY_EARLY") && snaps.includes("POST_MONTHLY_FULL"), snaps.join(","));
  }
  // B-4: engines A, B, C and the bridge never read a snapshot (both legs)
  for (const f of ["runRothStrategies", "computeTaxPlan", "computeIrmaaPlan", "withdrawalPlanSeries", "runMonteCarlo", "runExtendedMC"]) {
    const n = fnNode(f); T(`B-4 ${f} reads none of the three snapshots`, !!n && idsIn(n, SNAP).length === 0, n ? idsIn(n, SNAP).join(",") : "not found");
  }
  // B-5: Backtest and What-Breaks — both `baseMonthly` declarators call tableYearExpense and read no snapshot
  const bm = [];
  walk.full(AST, n => { if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "baseMonthly") bm.push(n); }, W);
  T("B-5 SETUP: two `baseMonthly` declarations (Backtest, What-Breaks)", bm.length === 2, String(bm.length));
  if (POST) T("B-5 EXTINCTION: both read the table through tableYearExpense and read no snapshot",
    bm.length === 2 && bm.every(n => idsIn(n, new Set(["tableYearExpense"])).length === 1 && idsIn(n, SNAP).length === 0), bm.map(n => `L${n.loc.start.line}`).join(","));
  else T(`B-5 ${KD} both pick POST_MONTHLY_EARLY or POST_MONTHLY_FULL by spouse B's Medicare year`, bm.length === 2 && bm.every(n => idsIn(n, SNAP).length === 2));
  if (POST) {
    const wb = bm.find(n => /_deathYr1W/.test(SRC.slice(n.start, n.end))), bt = bm.find(n => n !== wb);
    T("B-6 What-Breaks passes its survivor year (_deathYr1W); Backtest passes none (it has never applied one)", !!wb && !!bt && !/_deathYr1/.test(SRC.slice(bt.start, bt.end)));
    // B-6b: and each reads the year it is called for — the argument is exactly the retirement year plus the plan-year index (an off-by-one
    // here would pass every check above, and Backtest's and What-Breaks' figures are reachable only through the rendered DOM).
    T("B-6b both read the year they are called for: tableYearExpense(_retireYr + <index>, …) with the declarator's own parameter",
      bm.every(n => { const f = n.init, prm = f && f.params && f.params[0] && f.params[0].name; return !!prm && new RegExp(`tableYearExpense\\(_retireYr \\+ ${prm}[,)]`).test(SRC.slice(n.start, n.end)); }),
      bm.map(n => SRC.slice(n.start, n.end).replace(/\s+/g, " ").slice(0, 90)).join(" | "));
  }
  // B-7: the snapshots are assigned only in recomputeDerivedExpenses (and saved/restored by applyLoadedData), and their declarations call nothing
  const asg = []; walk.ancestor(AST, { AssignmentExpression(n, anc) { if (n.left.type === "Identifier" && SNAP.has(n.left.name)) {
    const fn = [...anc].reverse().find(a => a.type === "FunctionDeclaration"); asg.push(fn && fn.id ? fn.id.name : "<module>"); } } }, W);
  T("B-7 the three snapshots are assigned only in recomputeDerivedExpenses and applyLoadedData's restore", asg.length > 0 && asg.every(f => f === "recomputeDerivedExpenses" || f === "applyLoadedData"), asg.join(","));
  const decl = AST.body.filter(n => n.type === "VariableDeclaration").flatMap(n => n.declarations).filter(d => SNAP.has(d.id.name));
  if (POST) T("B-8 their declarations are plain 0 — set once PLAN_TIMELINE exists", decl.length === 3 && decl.every(d => d.init && d.init.type === "Literal" && d.init.value === 0));
  // B-9: recomputeDerivedExpenses() runs at module level right after `let PLAN_TIMELINE = buildPlanTimeline();`
  if (POST) {
    const i = AST.body.findIndex(n => n.type === "VariableDeclaration" && n.declarations.some(d => d.id.name === "PLAN_TIMELINE"));
    const nx = AST.body[i + 1];
    T("B-9 the module sets the snapshots right after the first PLAN_TIMELINE", i >= 0 && nx && nx.type === "ExpressionStatement" && nx.expression.type === "CallExpression" && nx.expression.callee.name === "recomputeDerivedExpenses");
    const rd = fnNode("recomputeDerivedExpenses");
    T("B-10 recomputeDerivedExpenses builds its own timeline (buildPlanTimeline) and reads no PLAN_TIMELINE", !!rd && idsIn(rd, new Set(["buildPlanTimeline"])).length === 1 && idsIn(rd, new Set(["PLAN_TIMELINE"])).length === 0);
  }
  // B-11: every reset path that puts the example back recomputes the snapshots afterwards (both legs)
  const resets = []; walk.ancestor(AST, { AssignmentExpression(n, anc) {
    if (n.left.type === "Identifier" && n.left.name === "PORTFOLIO" && n.right.type === "Identifier" && n.right.name === "DEFAULT_PORTFOLIO") {
      const blk = [...anc].reverse().find(a => a.type === "BlockStatement");
      const later = blk ? blk.body.filter(s => s.start > n.end) : [];
      resets.push(later.some(s => /recomputeDerivedExpenses\(\)|applyLoadedData\(/.test(SRC.slice(s.start, s.end)))); } } }, W);
  T("B-11 every reset to the example recomputes the snapshots afterwards", resets.length >= 3 && resets.every(Boolean), `${resets.filter(Boolean).length} of ${resets.length}`);
}

// ── §C · the display snapshots follow the plan ──────────────────────────────────────────────────────────────────────────────────────
console.log("  C — the display figures follow the plan's dates");
{
  const snap = () => g.snapshots();
  load(BASE); const s0 = snap();
  T("C-1 the example's three figures are $6,700 / $8,170 / $8,020 on both legs (the rule reproduces 2026-06 / 2029-06 / 2031-06)",
    s0.pre === 6700 && s0.early === 8170 && s0.full === 8020, JSON.stringify(s0));
  const { p, ex } = shifted(3); load(p, ex); const s3 = snap();
  if (POST) T("C-2 the same plan 3 years later reads its own June 2032 and June 2034: $8,170 / $8,020", s3.pre === oMonth(ex, "2026-06") && s3.early === oMonth(ex, "2032-06") && s3.full === oMonth(ex, "2034-06") && s3.early === 8170 && s3.full === 8020, JSON.stringify(s3));
  else T(`C-2 ${KD} the same plan 3 years later reads June 2029 and June 2031 — $6,700 both, its pre-retirement table`, s3.early === 6700 && s3.full === 6700, JSON.stringify(s3));
  if (POST) {
    let q = clone(BASE); q.dobB = "1962-03-01"; let t = load(q); let s = snap();
    T("C-3 spouse B on Medicare before retirement: FULL is taken at the retirement date (June of 2029), so EARLY = FULL", s.early === oMonth(EX, "2029-06") && s.full === oMonth(EX, "2029-06"), JSON.stringify(s));
    q = clone(BASE); q.retireYear = 2024; q.retireYearB = 2024; t = load(q); s = snap();
    T("C-4 already retired (2024): EARLY falls back to the as-of month; FULL is still spouse B's Medicare (June 2031)", t.targetRetireYear === 2024 && s.early === oMonth(EX, ymOf(t.asOf.year, t.asOf.month)) && s.full === oMonth(EX, "2031-06"), JSON.stringify(s));
    q = clone(BASE); q.single = true; t = load(q); s = snap();
    const fullM = t.medicareB.year * 12 + t.medicareB.month >= t.retireDate.year * 12 + 1 ? t.medicareB : t.retireDate;
    T(`C-5 single: FULL at spouse A's Medicare (${t.medicareB.year}) by the same rule`, s.full === oMonth(EX, ymOf(fullM.year, Math.max(fullM.month, 6))), JSON.stringify(s));
    q = clone(BASE); q.dobB = "1966-09-01";
    const X6 = [...clone(EX), { cat: "Housing", name: "t81 ends July 2031", amount: 333, freq: "monthly", start: "2029-04", end: "2031-07" }];
    t = load(q, X6); s = snap();
    T("C-6 a Medicare month after June (September 2031) is taken as is, not June (a row ending July 2031 tells them apart)", t.medicareB.month === 9 && s.full === oMonth(X6, "2031-09") && s.full !== oMonth(X6, "2031-06"), JSON.stringify(s));
  }
  // C-7: recomputeDerivedExpenses reads the CURRENT plan even when PLAN_TIMELINE was not rebuilt (the three reset paths do exactly that)
  load(BASE); const { p: p3 } = shifted(3); g.setPortfolio(clone(p3)); g.recomputeDerivedExpenses(); const s7 = snap();
  if (POST) T("C-7 recompute without a timeline rebuild still uses the plan's own dates (example table at June 2032 / June 2034: $8,020 / $7,620)", s7.early === 8020 && s7.full === 7620, JSON.stringify(s7));
  else T(`C-7 ${KD} recompute ignores the plan: $8,170 / $8,020 whatever its dates`, s7.early === 8170 && s7.full === 8020, JSON.stringify(s7));
  load(BASE);
}

// ── §C2 · D-45, pinned: the Monte Carlo charges a one-time row only when its month is a quarter's last ──────────────────────────────
// Found at the v6.18 build by an independent review (the scope's §0.1 said the Monte Carlo subtracts one-time rows "when they fall" —
// wrong). Both engines sample the table at months 03/06/09/12 and getOneTimeExpenses needs an exact month, so the example's April 2029
// golf cart and closing costs never reach either engine. Not changed at v6.18 (the Monte Carlo is out of scope); pinned as a dated
// [KNOWN DEFECT] on both legs so its fix flips these and cannot go unnoticed. MissingFeatures D-45; disclosed in the Field Manual.
console.log("  C2 — D-45: the Monte Carlo's one-time rows (pinned)");
{
  const KD45 = "[KNOWN DEFECT 2026-10-18, D-45]";
  const t = load(BASE), RY = t.targetRetireYear;
  const mcOf = X => { load(BASE, X); _src = mulberry(2026); const a = g.runMonteCarlo(RY, 60);
    _src = mulberry(2027); const b = g.runExtendedMC(RY, 30, 60, { ltcShocks: true, autoReplace: true, mortality: true, rng: mulberry(11) });
    return JSON.stringify({ a: a.results, b: b.results }); };
  const noOnce = EX.filter(e => e.freq !== "once"), june = EX.map(e => e.freq === "once" ? { ...e, start: "2029-06", end: "2029-06" } : e);
  // v6.21 (D-42): the example's table also holds four one-time "Replacement car" rows (2037–2061); this section's subject is the 2029 rows.
  const ONCE29 = EX.filter(e => e.freq === "once" && e.label !== "Replacement car");
  T(`C2-1 SETUP: the example's one-time rows other than its cars are dated April 2029 ($28,000)`, ONCE29.length > 0 && ONCE29.every(e => String(e.start).slice(0, 7) === "2029-04") && oOnce(EX, "2029-04") === 28000);
  const base = mcOf(EX);
  // v6.20 (D-45 fixed — docs/SCOPE_D40_MC_TAX_V620.md): a one-time row is charged in the quarter that contains its month, so the April
  // rows now move both engines; C2-3's April-vs-June control no longer discriminates (they are the same quarter, charged identically) and
  // is retired in favour of t83 C (every month of two years, exact on both planned paths). An array, so the registrar widens it.
  const FIXED45 = ["v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER);
  if (FIXED45) T("C2-2 [FIXED v6.20 — was KNOWN DEFECT 2026-10-18, D-45] the April rows now reach both Monte Carlo engines: output differs with and without them", base !== mcOf(noOnce));
  else {
    T(`C2-2 ${KD45} both Monte Carlo engines give byte-identical output with or without the April rows — they are never charged`, base === mcOf(noOnce));
    T(`C2-3 CONTROL: the same rows dated June 2029 DO move both engines (so C2-2 discriminates)`, mcOf(june) !== base);
  }
  load(BASE);
}

// ── §D · what must not move (the current leg, with both modules) ────────────────────────────────────────────────────────────────────
const PRI = join(HERE, `app_${D_PRIOR}.mjs`);
if (VER === D_CUR && existsSync(PRI)) {
  console.log(`  D — ${D_PRIOR} → ${D_CUR}: what cannot move`);
  const P0 = await import(pathToFileURL(PRI).href), g0 = P0.__g, E0 = P0.__engines;
  const loadOn = (G, P, X) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); return G.PLAN_TIMELINE(); };
  const mcRun = (G, P, X) => {
    const t = loadOn(G, P, X), RY = t.targetRetireYear;
    _src = mulberry(2026); const mc = G.runMonteCarlo(RY, 120);
    _src = mulberry(2027); const ext = G.runExtendedMC(RY, 30, 120, { ltcShocks: true, autoReplace: true, mortality: true, rng: mulberry(11) });
    return JSON.stringify({ mc, ext: { results: ext.results, p50: ext.p50, ruin: ext.ruin } });
  };
  for (const [name, { p, ex }] of HH) T(`D-1 ${name}: both Monte Carlo engines are bit-identical across the pair`, mcRun(g0, p, ex) === mcRun(g, p, ex));
  // D-2: a flat table — no one-time rows, every row changing only in January of the retirement year or of spouse B's Medicare year —
  // reads the same under the snapshots and year by year, so every engine must agree across the pair: the negative control that only the
  // read changed. SINGLE: bit for bit. A COUPLE: to 1e-6 — v6.17 applied the survivor factor after inflating, v6.18 before, so the
  // survivor years differ in the last bits of a double (measured: 1.5e-11 on a year's spending), and nothing else differs.
  {
    const t = loadOn(g, BASE, EX), RY = t.targetRetireYear, MB = t.medicareB.year;
    const FLAT2 = [
      { cat: "Housing", name: "flat core", amount: 5200, freq: "monthly", start: "2020-01", end: "2070-12" },
      { cat: "Housing", name: "flat pre-retirement", amount: 1500, freq: "monthly", start: "2020-01", end: `${RY - 1}-12` },
      { cat: "Healthcare", name: "flat bridge", amount: 650, freq: "monthly", start: `${RY}-01`, end: `${MB - 1}-12` },
      { cat: "Healthcare", name: "flat Medicare", amount: 420, freq: "monthly", start: `${MB}-01`, end: "2070-12" }];
    // single: spouse A's Medicare (the year Engine D switches on) is the retirement year here, so no bridge row
    const FLAT1 = FLAT2.filter(e => e.name !== "flat bridge").map(e => e.name === "flat Medicare" ? { ...e, start: `${RY}-01` } : e);
    const run = (G, EN, P, X) => { const tt = loadOn(G, P, X), ry = tt.targetRetireYear;
      const S = G.computeWithdrawalPlan({ retireYear: ry, rothAmount: 70000, scenarioPreset: "base" });
      const B = G.withdrawalPlanSeries({ retireYear: ry, rothAmount: 70000, scenarioPreset: "base" });
      const A = { retireYear: ry, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, gainByYr: B.gainByYr, ordDrawByYr: B.ordDrawByYr };
      return { S: S.schedule, B, tax: EN.computeTaxPlan(A), irmaa: EN.computeIrmaaPlan(A) }; };
    const P1 = { ...clone(BASE), single: true };
    T(`D-2a a flat table, single: Engine D, the bridge and Engines B and C are bit-identical across the pair`, JSON.stringify(run(g0, E0, P1, FLAT1)) === JSON.stringify(run(g, E, P1, FLAT1)));
    const diffs = []; const cmp = (x, y, path) => {
      if (typeof x === "function" && typeof y === "function") return;   // helpers carried on a result (JSON drops them too)
      if (typeof x === "number" && typeof y === "number") { if (!(x === y || Math.abs(x - y) <= 1e-6)) diffs.push(`${path}: ${x} vs ${y}`); return; }
      if (x && y && typeof x === "object" && typeof y === "object") { const ks = new Set([...Object.keys(x), ...Object.keys(y)]); for (const k of ks) cmp(x[k], y[k], `${path}.${k}`); return; }
      if (x !== y) diffs.push(`${path}: ${x} vs ${y}`); };
    const c0 = run(g0, E0, BASE, FLAT2), c1 = run(g, E, BASE, FLAT2); cmp(c0, c1, "");
    T(`D-2b a flat table, couple (rows change only in January ${RY} and January ${MB}): every figure of Engine D, the bridge and Engines B and C agrees across the pair to 1e-6`, diffs.length === 0, diffs.slice(0, 3).join("; "));
    const exact = c0.S.filter(r => r.yr < deathYr1(t)).every((r, i) => JSON.stringify(r) === JSON.stringify(c1.S[i]));
    T("D-2c …and Engine D's rows before the first death are bit-identical", exact);
  }
  // D-3: on the example, only the years the oracle says differ do differ
  {
    loadOn(g0, BASE, EX); loadOn(g, BASE, EX); const RY = g.PLAN_TIMELINE().targetRetireYear;
    const a = g0.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" }).schedule;
    const b = g.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" }).schedule;
    const moved = b.filter((r, i) => Math.abs(r.exp_y - a[i].exp_y) > 1e-6).map(r => r.yr);   // a tolerance: the survivor factor is applied in a different order
    const expect = b.filter(r => oYear(EX, r.yr, 2044) !== (r.yr < 2031 ? 8170 : 8020) * 12 * (r.yr >= 2044 ? SURV : 1)).map(r => r.yr);
    T("D-3 the example's spending moves in exactly the years the oracle says (2029's one-time rows; 2034 on, the car paid off) and no other",
      JSON.stringify(moved) === JSON.stringify(expect) && moved[0] === 2029 && !moved.includes(2030) && !moved.includes(2033) && moved.includes(2034), `moved ${moved.join(",")}`);
  }
  // D-4: the tool the re-pinned suites use to attribute their moves (qa/tools/v617_spending.mjs) — v6.17's two snapshots written as a
  // table — makes v6.18's Engine D reproduce v6.17's on every household. Without this the re-pins would rest on an unchecked helper.
  {
    const { withV617Spending } = await import(pathToFileURL(join(HERE, "tools", "v617_spending.mjs")).href);
    for (const [name, { p, ex }] of HH) {
      const t = loadOn(g0, p, ex), ry = t.targetRetireYear;
      const a = g0.computeWithdrawalPlan({ retireYear: ry, rothAmount: 70000, scenarioPreset: "base" }).schedule;
      loadOn(g, p, ex);
      const b = withV617Spending(g, p, () => g.computeWithdrawalPlan({ retireYear: ry, rothAmount: 70000, scenarioPreset: "base" }).schedule);
      let worst = 0; a.forEach((r, i) => Object.keys(r).forEach(k => { if (typeof r[k] === "number") worst = Math.max(worst, Math.abs(r[k] - (b[i] || {})[k])); }));
      T(`D-4 ${name}: v6.18 fed v6.17's spending as a table reproduces v6.17's Engine D schedule, every field, to 1e-6`, a.length === b.length && worst <= 1e-6, `max |Δ| ${worst}`);
    }
  }
} else console.log(`  D — skipped by design (the ${D_PRIOR} → ${D_CUR} pair only, with both modules; this leg is ${VER})`);

// ── §E · rendered ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — rendered: the Withdrawal tab, Backtest, What Breaks, the Expenses tab");
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
  const cellOf = (year, header) => {   // the schedule is an 11-column CSS grid of divs: a header row of 11 cells, then 11 per year
    const H = ["Year", "Age A/B", "Guaranteed", "Work", "Expenses", "Draw Need", "RMD", "From Source(s)", "Conv", "Bracket", "EOY Portfolio"];
    const grid = [...body().querySelectorAll("div")].find(d => d.children.length > H.length && H.every((h, i) => d.children[i].textContent.trim() === h));
    if (!grid) return null;
    const cells = [...grid.children], ci = H.indexOf(header);
    for (let r = H.length; r + H.length <= cells.length; r += H.length) if (cells[r].textContent.trim() === String(year)) return cells[r + ci].textContent.trim();
    return null;
  };
  await render();
  if (TABLE620) { await act(async () => { window.__g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(window.__g.PORTFOLIO())), expenses: window.__g.EXPENSES().filter(e => !(e && e.label === "Replacement car")) }); }); await flush(); await flush(); }
  const w = await tab("withdrawal");
  T("E-0 SETUP: the app renders the example and the Withdrawal tab", /WITHDRAWAL STRATEGY/i.test(w));
  const c29 = cellOf(2029, "Expenses"), c33 = cellOf(2033, "Expenses");
  // v6.30: the page runs under its default prior; its inflation is read off the DOM bundle's live table (Σ prob × inflation)
  const _iD = Object.values(window.__g.SCENARIOS()).reduce((u, x) => u + x.prob * x.inflation, 0), KD3 = y => Math.pow(1 + _iD, y - window.__g.PLAN_TIMELINE().asOfYear);
  if (POST) {
    T("E-1 the Withdrawal tab says where its spending comes from, and claims nothing about the Monte Carlo", !!body().querySelector("[data-dc-spend-source]") && /each year's own dates/.test(w) && /one-time row dated before 2029 is not in this schedule\./.test(w) && !/Monte Carlo takes it/.test(w));
    if (U630) T(`E-2 the schedule's 2029 Expenses cell carries the one-time rows: $126,280 × (1+i)^3 at the page's inflation = $${Math.round(126280 * KD3(2029) / 1000)}K`, c29 === `$${Math.round(126280 * KD3(2029) / 1000)}K`, c29);
    else T("E-2 the schedule's 2029 Expenses cell carries the one-time rows: $126K", c29 === "$126K", c29);
  } else {
    T(`E-1 ${KD} the Withdrawal tab never says where its spending comes from`, !body().querySelector("[data-dc-spend-source]") && !/each year's own dates/.test(w));
    T(`E-2 ${KD} the schedule's 2029 Expenses cell is the June 2029 snapshot: $98K`, c29 === "$98K", c29);
  }
  if (U630) T(`E-3 2033's Expenses cell is $8,020 × 12 × (1+i)^7 from the as-of year at the page's inflation (the car still running): $${Math.round(96240 * KD3(2033) / 1000)}K`, c33 === `$${Math.round(96240 * KD3(2033) / 1000)}K`, c33);
  else T("E-3 2033's Expenses cell is the same on both legs ($8,020 × 12 × inflation, the car still running): $106K", c33 === "$106K", c33);
  const bt = await tab("backtest");
  const btWorst = (bt.match(/Worst start year\s*(\d{4})\s*ended \$([\d.]+)M real/) || []);
  T("E-4 SETUP: Backtest renders its worst start year", btWorst.length === 3, bt.slice(0, 200));
  if (POST) T(`E-5 Backtest on the example: the worst start (1966) now ends ${P42("$1.43M real — lower lifetime spending (the car paid off from 2034) outweighs 2029's one-time rows (measured at the build)", "$1.21M real (v6.21, D-42: the four car rows; $1.43M at v6.18–v6.20)")}`, btWorst[1] === "1966" && btWorst[2] === P42("1.43", "1.21"), btWorst.slice(1).join(" / "));
  else T(`E-5 ${KD} Backtest on the example: the worst start (1966) ends $1.31M real on the snapshots`, btWorst[1] === "1966" && btWorst[2] === "1.31", btWorst.slice(1).join(" / "));
  T("E-6 the Backtest comparison no longer says the backtest omits one-time expenses, and says when the MC charges one", ["v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER)
    ? /\(Both spend your one-time expenses: this backtest from v6\.18, the MC in the quarter each one falls from v6\.20\.\)/.test(bt) && !/one-time expenses, and Roth-conversion tax drag/.test(bt)
    : POST ? /From v6\.18 this backtest spends your one-time expenses; the MC charges one only when it is dated in March, June, September or December\./.test(bt) && !/one-time expenses, and Roth-conversion tax drag that this backtest deliberately omits/.test(bt)
    : /one-time expenses, and Roth-conversion tax drag that this backtest deliberately omits/.test(bt));
  const wb = await tab("what breaks");
  const spendX = (wb.match(/([\d.]+)× current spending/) || [])[1];
  T("E-7 SETUP: What Breaks renders its spending headroom", !!spendX, wb.slice(0, 200));
  if (POST) T(`E-8 What Breaks on the example: ${P42("1.40× current spending (the car paid off from 2034; measured at the build)", "1.35× current spending (v6.21, D-42: the four car rows; 1.40× at v6.18–v6.20)")}`, spendX === P42("1.40", "1.35"), spendX);
  else T(`E-8 ${KD} What Breaks on the example: 1.35× current spending on the snapshots`, spendX === "1.35", spendX);
  const xp = await tab("expenses");
  T("E-9 the Expenses tab's headers on the example are unchanged on both legs ($6,700 pre; $8,170 → $8,020 post)", /PRE-RETIREMENT — \$6,?700\/mo/i.test(xp) && /POST-RETIREMENT — \$8,?170\/mo → \$8,?020\/mo/i.test(xp), (xp.match(/PRE-RETIREMENT[^)]{0,80}/i) || [""])[0]);
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

// ── §F · the copy ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — the copy");
{
  const docs = g.DOCS_HTML();
  if (POST) T("F-1 the Field Manual's Withdrawal Strategy entry says how spending is read, when the Monte Carlo charges a one-time row (D-45), and dates the fix",
    /<strong>Spending<\/strong> is your expense table at each year's own dates/.test(docs) && (["v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER) ? /From v6\.20 the Monte Carlo charges a one-time row in the quarter that contains its month/.test(docs) && /only when the row was dated in one of those months/.test(docs) : /only when the row is dated in one of those months/.test(docs)) && /never arrived \(v6\.18\)/.test(docs) && !/takes it from the portfolio when it falls/.test(docs));
  else T(`F-1 ${KD} the Field Manual never says how the Withdrawal tab's spending is read`, !/each year's own dates/.test(docs));
  if (POST) T("F-2 the stale \"Defaults: $7,047 … $8,313\" comment is gone", !/Defaults: \$7,047 pre-retire, \$8,313 post-retire/.test(SRC));
  else T(`F-2 ${KD} the stale "Defaults: $7,047 … $8,313" comment is present`, /Defaults: \$7,047 pre-retire, \$8,313 post-retire/.test(SRC));
  const MP = [join(HERE, "..", "METHODOLOGY.md"), join(HERE, "METHODOLOGY.md")].find(existsSync);
  if (POST && MP) {
    const md = readFileSync(MP, "utf8");
    T("F-3 METHODOLOGY has the section, the rule, the measurements and the limitations (D-41, D-44)",
      /## The Withdrawal tab spends the expense table year by year \(v6\.18\)/.test(md) && /tableYearExpense/.test(md) && /D-41/.test(md) && /D-44/.test(md) && /\$126,280/.test(md));
  } else console.log(`  F-3 — skipped by design (${POST ? "METHODOLOGY.md not found beside this run" : "the current leg only: the run folder carries one METHODOLOGY.md"})`);
}

finished = true;
console.log(`\nt81 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
