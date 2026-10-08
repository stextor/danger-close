// t49 — ENGINE A (the Roth comparator) SEES THE SPENDING DRAW (D-7) · docs/SCOPE_ROTH_COMPARATOR_DRAW.md · v5.84
//
// WHAT v5.84 CHANGED. Engine A (`runRothStrategies`) formed its ordinary base as pen + work + otherOrd + rmd with NO spending
// draw; v5.74 (C-8) had put the draw into Engines B and C and excluded A on the reasoning that a draw common to every strategy
// "largely cancels". Measured at the scope, it does not: four of A's six strategies SIZE the conversion from this base, so the
// omission changed how much was converted (fill-12 % on the example household: $1.20M → $0.99M; its estate advantage $218,720 →
// $150,518; fill-22 % flipped sign). v5.84: A accepts `P.ordDrawByYr` (default {}), exactly as Engine B accepts `ordDrawByYr`,
// and TAXES it in the ordinary base — but does NOT drain it from the balances (K-1, which superseded H-1 a at the build: one shared
// draw series drained from every strategy decided the solver's winner by its own approximation — it changed in all 11 fixture
// households between the slider's series and each cell's exact one; tax-only moved it by ≈ $15K–$30K). The app's four callers pass
// the series Engines B and C already receive, `withdrawalPlanSeries(...).ordDrawByYr` at the slider amount (H-2 a; K-2: the stress
// solver too — under tax-only its lifetime-tax input RISES, $225,275 → $270,640 on the example, the conservative direction).
//
// WHY THERE IS NO PER-YEAR A-vs-B DRAW COMPARISON. Engine A publishes lifetime totals, not per-year rows. The scope said the build
// would state which terms are compared: agreement is BY CONSTRUCTION (§X proves every caller takes the one bridge function Engines
// B and C use, which `t40` asserts), and the tax effect is proved EXACTLY by §H — a hand-verified single-year household where a
// draw's tax is computed independently from IRS Rev. Proc. 2025-32 and cannot pass vacuously.
//
// Current leg only (the feature does not exist on the prior leg). Run: node t49_engineA_draw.mjs <tag>
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595"];
let pass = 0, fail = 0; const fails = [];
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; const m = `  \u2717 ${n}${d ? " \u2014 " + d : ""}`; console.log(m); fails.push(m); } };
const done = () => { console.log(`\nt49 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t49 \u2014 ENGINE A SEES THE SPENDING DRAW (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
const { existsSync, readFileSync } = await import("fs");
const MOD = await import(`./app_${VER}.mjs`); const g = MOD.__g;
const { HOUSEHOLDS, build } = await import("./tools/fixture/households.mjs");

// ── H · hand-verified: one year, pension only, no SS, no state tax, no balances — a draw's tax is its bracket arithmetic ──────
// Independent reference (NOT read from the app): 2026 brackets, IRS Rev. Proc. 2025-32, as t18 types them.
const BR = { S: [[0.10, 12400], [0.12, 50400], [0.22, 105700], [0.24, 201775], [0.32, 256225], [0.35, 640600], [0.37, Infinity]],
             M: [[0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550], [0.32, 512450], [0.35, 768700], [0.37, Infinity]] };
const STD = { S: 16100, M: 32200 };
const fed = (ti, st) => { let t = 0, p = 0; for (const [r, u] of BR[st]) { if (ti <= p) break; t += (Math.min(ti, u) - p) * r; p = u; } return t; };
const baseSingle = (o = {}) => ({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2026, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1966, dobBYr: 1966, deathYr1: Infinity, survivor: "A", ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, tradInitB: 0, rothInitA: 0, rothInitB: 0, taxableInit: 0, ...o });   // t10's builder, verbatim
const noneTax = P => g.runRothStrategies(P).find(r => r.key === "none").totTax;
// HARNESS TRAP (project instructions; t10 L26): Engine A reads work / other-ordinary income from the LOADED portfolio's income
// streams, not from P. A first draft ran this section with the example household loaded and read $2,160 for a $1,200 draw — the
// example's streams had pushed it into the 22 % band. t10's neutraliser, verbatim: one $0 stream (also suppresses B's work taper).
const EX = JSON.parse(JSON.stringify(g.PORTFOLIO()));
g.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
for (const [st, ti, draw] of [["S", 30000, 10000], ["S", 45000, 10000], ["M", 90000, 20000]]) {
  const P = st === "S" ? baseSingle({ pen: (ti + STD.S) / 12 }) : baseSingle({ single: false, pen: (ti + STD.M) / 12 });
  const exp = Math.round(fed(ti + draw, st) - fed(ti, st));
  const got = noneTax({ ...P, ordDrawByYr: { 2026: draw } }) - noneTax(P);
  CK(`H-${st}${ti}: a $${draw.toLocaleString()} draw on $${ti.toLocaleString()} taxable (${st === "S" ? "single" : "MFJ"}) adds exactly $${exp.toLocaleString()} of federal tax`,
     Math.abs(got - exp) <= 1, `engine ${got}, reference ${exp}`);
}

// ── I · inert when absent: an omitted, empty, or all-zero series changes NOTHING (13 suites pin Engine A with their own P) ──
const load = P => g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(P)) });
const rothP = (retireYear, rothAmount, extra = {}) => {       // the Roth tab's P, as the app builds it (source: the comparator site)
  const t = g.PLAN_TIMELINE(), PF = g.PORTFOLIO();
  return { single: !!t.single, asOfYr: t.asOfYear, retireYr: retireYear, horizonYr: Math.max(t.dobA.year + t.lifeExpA, t.dobB.year + t.lifeExpB),
    ladderEnd: t.rothLadderEnd, dobAYr: t.dobA.year, dobBYr: t.dobB.year,
    deathYr1: t.single ? Infinity : Math.min(t.dobA.year + t.lifeExpA, t.dobB.year + t.lifeExpB),
    ssA: g.getSSA(), ssB: t.single ? 0 : g.getSSB(), ssAYr: t.ssA_date.year, ssAMo: t.ssA_date.month, ssBYr: t.ssB_date.year, ssBMo: t.ssB_date.month,
    pen: g.getPension(), stateRate: t.stateTaxRate || 0, stateCode: PF.stateCode || null, convTaxFunding: "taxable", taxableGainFrac: 0,
    acaPremium: (PF.acaBridge || {}).premium || 0, acaSize: (PF.acaBridge || {}).size || 0, ...g.retireStartBalances(retireYear),
    ladderEndA: t.rothLadderEndA, ladderEndB: t.rothLadderEndB, survivor: t.single ? "A" : ((t.dobA.year + t.lifeExpA) >= (t.dobB.year + t.lifeExpB) ? "A" : "B"),
    taxableInit: g.taxableInitAll(), taxYieldPct: 2.0, currentConv: rothAmount, ...extra };
};
const HH = [["example", EX], ...Object.keys(HOUSEHOLDS).map(n => [n, (load(EX), build(g, n))])];
const sig = r => JSON.stringify(r.map(s => [s.key, s.totTax, s.totConv, s.estate, s.totIrmaa, s.endTrad]));
let inert = 0; const inertBad = [];
for (const [n, P] of HH) {
  load(P); const ry = g.PLAN_TIMELINE().targetRetireYear, s = g.withdrawalPlanSeries({ retireYear: ry, rothAmount: 70000, scenarioPreset: g.DEFAULT_SCENARIO_PRESET || "base" });
  const zero = Object.fromEntries(Object.keys(s.ordDrawByYr).map(y => [y, 0]));
  const a = sig(g.runRothStrategies(rothP(ry, 70000))), b = sig(g.runRothStrategies(rothP(ry, 70000, { ordDrawByYr: {} }))), c = sig(g.runRothStrategies(rothP(ry, 70000, { ordDrawByYr: zero })));
  if (a === b && a === c) inert++; else inertBad.push(n);
}
CK(`I-1 an omitted, empty or all-zero draw leaves Engine A unchanged on all ${HH.length} households`, inert === HH.length, `differs: ${inertBad}`);

// ── D · the draw takes effect: taxed (the estate pays its tax), and NOT drained from the balances (K-1) ─────────────────────────────────────────────
let spent = 0, kept = 0, withDraw = 0;
for (const [n, P] of HH) {
  load(P); const ry = g.PLAN_TIMELINE().targetRetireYear, s = g.withdrawalPlanSeries({ retireYear: ry, rothAmount: 70000, scenarioPreset: g.DEFAULT_SCENARIO_PRESET || "base" });
  if (!Object.values(s.ordDrawByYr).some(v => v > 0)) continue; withDraw++;
  const off = g.runRothStrategies(rothP(ry, 70000)).find(r => r.key === "none"), on = g.runRothStrategies(rothP(ry, 70000, { ordDrawByYr: s.ordDrawByYr })).find(r => r.key === "none");
  if (on.estate < off.estate) spent++; if (Math.abs(on.endTrad - off.endTrad) <= 1 && on.totConv === off.totConv) kept++;
}
CK(`D-0 the fixture exercises the draw (households with a non-zero series: ${withDraw} of ${HH.length})`, withDraw >= 5, String(withDraw));
// NOT "pays more lifetime tax": a first draft asserted that and it held on 1 of 11 households — correctly. Drawing from
// Traditional early removes money that would have GROWN and been taxed later as RMDs, so lifetime tax can fall. What must hold
// is that money spent leaves the household: the estate falls.
CK(`D-1 with the draw, NO CONVERSIONS leaves a SMALLER estate on every exercised household (spent money leaves)`, spent === withDraw, `${spent} of ${withDraw}`);
// K-1 extinction: the draw must NOT be drained. With no conversions and no drain, the traditional balance is untouched by it.
CK(`D-2 with the draw, NO CONVERSIONS leaves the traditional balance UNCHANGED on every exercised household (taxed, not drained — K-1)`, kept === withDraw, `${kept} of ${withDraw}`);

// ── X · source, by AST: Engine A's base carries the draw; every app caller passes it; the solver re-solves when it changes ──
const ROOT = new URL("..", import.meta.url).pathname, SRC = `${ROOT}${VER}.jsx`;
CK("X-0 the run folder's source for this tag exists", existsSync(SRC), SRC);
const { createRequire } = await import("module"); const req = createRequire(`${ROOT}package.json`);
const acorn = req("acorn"), jsx = req("acorn-jsx"), walk = req("acorn-walk");
const src = readFileSync(SRC, "utf8"), ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true, ranges: true });
const wb = { ...walk.base }; wb.JSXElement = (n, s, c) => { c(n.openingElement, s); n.children.forEach(ch => c(ch, s)); };
wb.JSXOpeningElement = (n, s, c) => n.attributes.forEach(a => c(a, s)); wb.JSXAttribute = (n, s, c) => { if (n.value) c(n.value, s); };
wb.JSXExpressionContainer = (n, s, c) => c(n.expression, s); wb.JSXFragment = (n, s, c) => n.children.forEach(ch => c(ch, s));
wb.JSXText = () => {}; wb.JSXEmptyExpression = () => {}; wb.JSXSpreadAttribute = (n, s, c) => c(n.argument, s);
const engA = ast.body.find(n => n.type === "FunctionDeclaration" && n.id.name === "runRothStrategies");
let baseOk = false;
walk.simple(engA, { VariableDeclarator(d) { if (d.id.name === "base" && /draw/i.test(src.slice(d.init.range[0], d.init.range[1]))) baseOk = true; } }, wb);
CK("X-1 Engine A's ordinary `base` includes the draw", baseOk);
const decls = {}; walk.simple(ast, { VariableDeclarator(d) { if (d.id.type === "Identifier" && d.init && d.init.type === "ObjectExpression") (decls[d.id.name] = decls[d.id.name] || []).push(d); } }, wb);
const calls = []; walk.simple(ast, { CallExpression(n) { if (n.callee.type === "Identifier" && n.callee.name === "runRothStrategies") calls.push(n); } }, wb);
const passes = calls.map(c => { const a = c.arguments[0]; if (!a || a.type !== "Identifier") return [c.loc.start.line, false];
  const ds = (decls[a.name] || []).filter(d => d.range[0] < c.range[0]); const d = ds[ds.length - 1];
  return [c.loc.start.line, !!d && d.init.properties.some(p => p.key && (p.key.name || p.key.value) === "ordDrawByYr" && /withdrawalPlanSeries\(/.test(src.slice(p.value.range[0], p.value.range[1])))]; });
CK(`X-2 every app call of runRothStrategies (${calls.length}) passes ordDrawByYr from withdrawalPlanSeries — the one bridge B and C use`,
   calls.length === 4 && passes.every(p => p[1]), JSON.stringify(passes));
let depsOk = null;
walk.simple(ast, { CallExpression(n) { if (n.callee.type === "Identifier" && n.callee.name === "useMemo" && /runRothStrategies\(PO, grid\)/.test(src.slice(n.range[0], n.range[1]))) {
  const deps = n.arguments[1]; depsOk = !!deps && ["rothAmount", "scenarioPreset"].every(k => deps.elements.some(e => e.type === "Identifier" && e.name === k)); } } }, wb);
CK("X-3 the solver's useMemo re-solves when the draw's inputs change (rothAmount, scenarioPreset in its dependencies)", depsOk === true, String(depsOk));
done();
