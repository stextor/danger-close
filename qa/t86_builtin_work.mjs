// t86 — THE BUILT-IN PART-TIME WORK FOR SPOUSE B REACHES THE EXAMPLE ONLY (v6.23 — D-49)
// Run: node t86_builtin_work.mjs v623   |   node t86_builtin_work.mjs v622
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_D49_WORK_TAPER_V623.md):
//   spouseBWorkTaper paid $20,000, $18,000 and $15,000 of spouse-B wages in the retirement year and the two after to EVERY plan with no
//   income streams — Start Fresh, the guided setup, a backup, single plans included — because its one test was "no streams". The
//   Withdrawal tab (Engine D) spent the wages as cash; Engines A, B and C, the Roth tab's ladder and (from v6.20) the Monte Carlo's tax
//   schedule taxed them. The example's spouse B does work (its demo prompt), so on the example the wages are its own. From v6.23 the taper
//   pays only a plan that holds the example's holdings, is married and has no streams (builtinWorkApplies, DC-1 (a), DC-3 (a)); a plan
//   saved before v6.23 that loses the wages is told so on My Data and the Monte Carlo tab until Save & Apply writes workRowsV623 (DC-2 (a)).
//
// GATED PER LEG (OPERATIONS §B2). The v6.22 leg pins what v6.23 changes as dated [KNOWN DEFECT] checks. §B and §C need both legs' modules
// (the v6.22 → v6.23 pair only; printed skip otherwise). §E mounts the DOM bundle.
// HARNESS: one module across renders — the example is rendered FIRST, on the fresh page (t85 records why). Math.random is seeded before the
// app loads (d3 captures it), and reseeded identically before every Monte Carlo pair compared.
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(86); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v623";
const KNOWN_VERSIONS = ["v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631"].includes(VER);   // an array, so the next registration widens it
// The differential's pair — constants, NOT `VER === "v623"`, so the registrar cannot widen them (t76 records why).
const D_PRIOR = "v622", D_CUR = "v623";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g, __test: t, __engines: E } = M;
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
process.on("exit", () => { if (!finished) { console.log(`t86 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const KD = "[KNOWN DEFECT 2026-10-20, D-49 — flips at v6.23]";
console.log(`t86 — THE BUILT-IN SPOUSE-B WORK REACHES THE EXAMPLE ONLY (${VER})\n`);

// ── households ──
const BASE = clone(g.PORTFOLIO()), XB = clone(g.EXPENSES());
const RY0 = g.PLAN_TIMELINE().targetRetireYear;
// Start Fresh's blank plan and a guided-setup plan, as v6.22 builds them (no workRowsV623 — a plan saved before v6.23).
const blank = () => ({ asOf: "2026-10-20", single: false, nameA: "", nameB: "", positions: [], otherAccounts: [], total401k: 0, household: 0,
  bucketActuals: { 1: 0, 2: 0, 3: 0, 4: 0 },
  contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  incomeSources: { ssA: { tableByAge: {}, planned: 0, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 0 } },
  _incomeFromForm: true, homeMoveCash: 0, carRowsV621: true });
const wizard = () => ({ ...blank(), nameA: "Ann", nameB: "Bo", dobA: "1970-06", dobB: "1972-06", retireYear: 2035, retireYearB: 2035,
  lifeExpA: 88, lifeExpB: 90, stateName: "", stateTaxRate: 0, stateCode: null,
  positions: [{ ticker: "VTI", owner: "A", name: "Total US Stock Market", balance: 400000, bucket: 3, type: "equity-lb", roth: 0, trad: 400000, er: 0.03, planType: "ira" }],
  total401k: 400000, household: 400000 });
const unmarked = p => { const q = clone(p); delete q.workRowsV623; return q; };
const offByOne = () => { const p = clone(BASE); p.positions[0].balance += 1; return p; };           // the example's figures, as another plan
const scaled = k => { const p = clone(BASE); p.positions.forEach(x => { x.balance *= k; x.roth *= k; x.trad *= k; }); p.otherAccounts.forEach(x => { x.balance *= k; });
  if (p.total401k) p.total401k *= k; if (p.household) p.household *= k; if (p.bucketActuals) for (const b in p.bucketActuals) p.bucketActuals[b] *= k; return p; };
const single = p => ({ ...clone(p), single: true });
const ZERO = [{ label: "none", kind: "other", owner: "joint", monthly: 0, startYear: 2026, endYear: 2026, cola: false, tax: "ordinary" }];   // the suite's neutraliser
const load = (G, p, x = XB) => G.applyLoadedData({ portfolio: clone(p), expenses: clone(x) });
const paid = (G, p) => { load(G, p); const ry = G.PLAN_TIMELINE().targetRetireYear; return [0, 1, 2].map(k => g.spouseBWorkTaper(ry + k, ry)); };

// ── §A · who is paid the built-in work ──────────────────────────────────────────────────────────────────────
console.log("  A — who is paid the built-in work");
{
  T("A-0: SETUP — the taper is exported on this leg", typeof g.spouseBWorkTaper === "function");
  T("A-1: the example is paid $20,000, $18,000 and $15,000 in its retirement year and the two after (both legs)", paid(g, BASE).join() === "20000,18000,15000", paid(g, BASE).join());
  const cases = [["A-2", "the example made single", single(BASE)], ["A-3", "the example's figures with one balance a dollar off (not the example by its holdings)", offByOne()],
    ["A-4", "a Start Fresh plan", blank()], ["A-5", "a guided-setup plan", wizard()], ["A-6", "holdings × 0.6", scaled(0.6)]];
  for (const [id, what, p] of cases) {
    const v = paid(g, p).join();
    if (POST) T(`${id}: ${what} is paid none`, v === "0,0,0", v);
    else T(`${id} ${KD}: ${what} is paid the example's spouse-B wages`, v === "20000,18000,15000", v);
  }
  T("A-7: any plan with an income stream — the example included — is paid none (both legs: any stream turns it off)",
    paid(g, { ...clone(BASE), incomeStreams: ZERO }).join() === "0,0,0" && paid(g, { ...blank(), incomeStreams: ZERO }).join() === "0,0,0");
  load(g, BASE);
  if (POST) {
    const fn = name => { let f = null; walk.full(AST, n => { if (n.type === "FunctionDeclaration" && n.id && n.id.name === name) f = n; }, W); return f; };
    const bw = fn("builtinWorkApplies"), tp = fn("spouseBWorkTaper");
    const bwSrc = bw ? SRC.slice(bw.start, bw.end) : "";
    T("A-8: builtinWorkApplies tests no streams, not single, and the example's holdings — and nothing else",
      !!bw && /getIncomeStreams\(\)\.length === 0/.test(bwSrc) && /!PORTFOLIO\.single/.test(bwSrc) && /holdsExampleHoldings\(PORTFOLIO\)/.test(bwSrc)
      && bw.body.body.length === 1 && bw.body.body[0].type === "ReturnStatement", bwSrc.replace(/\s+/g, " ").slice(0, 200));
    const first = tp && tp.body.body[0];
    T("A-9: spouseBWorkTaper's first statement returns 0 unless builtinWorkApplies() — the only gate",
      !!first && first.type === "IfStatement" && SRC.slice(first.test.start, first.test.end) === "!builtinWorkApplies()", first ? SRC.slice(first.start, first.end) : "");
    let calls = 0; walk.full(AST, n => { if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "spouseBWorkTaper") calls++; }, W);
    T("A-10: spouseBWorkTaper is still read at exactly the six sites of the scope's census (no engine changed)", calls === 6, `${calls}`);
    // The marker: written by the four places that build a plan, each `true`.
    const props = []; walk.full(AST, n => { if (n.type === "Property" && !n.computed && (n.key.name || n.key.value) === "workRowsV623") props.push(n); }, W);
    T("A-11: workRowsV623 is written true in exactly four object literals — DEFAULT_PORTFOLIO, the guided setup, Start Fresh, buildPortfolio",
      props.length === 4 && props.every(n => n.value.type === "Literal" && n.value.value === true), `${props.length}`);
    const owners = props.map(n => { let a = null; walk.fullAncestor(AST, (x, anc) => { if (x === n) a = anc.filter(y => y.type === "FunctionDeclaration" || y.type === "VariableDeclarator" || y.type === "ArrowFunctionExpression").map(y => (y.id && y.id.name) || (y.type === "ArrowFunctionExpression" ? "=>" : "?")).join(">"); }, W); return a; });
    // each writer named, once — so a marker MOVED from one writer to another (the count still 4) fails here
    const one = re => owners.filter(o => re.test(o)).length === 1;
    T("A-12: …one each in DEFAULT_PORTFOLIO, the guided setup (GuidedWizard), Start Fresh (DataLoader) and buildPortfolio (Save & Apply)",
      one(/^DEFAULT_PORTFOLIO/) && one(/GuidedWizard/) && one(/DataLoader/) && one(/buildPortfolio/), owners.join(" | "));
    // The loader's flag
    const flag = p => { t.applyLoadedData({ portfolio: clone(p), expenses: clone(XB) }); return g.PORTFOLIO()._builtinWorkDropped; };
    T("A-13: the loader names what a plan saved before v6.23 lost — 'joint' for Start Fresh, 'single' for a single plan",
      flag(blank()) === "joint" && flag(single(blank())) === "single" && flag(unmarked(single(BASE))) === "single" && flag(unmarked(offByOne())) === "joint",
      [flag(blank()), flag(single(blank())), flag(unmarked(single(BASE))), flag(unmarked(offByOne()))].join());
    T("A-14: …and nothing for the example, a plan with a stream, or a plan carrying the marker",
      flag(unmarked(BASE)) === null && flag({ ...blank(), incomeStreams: [{ ...ZERO[0], monthly: 500 }] }) === null && flag({ ...blank(), workRowsV623: true }) === null,
      [flag(unmarked(BASE)), flag({ ...blank(), incomeStreams: [{ ...ZERO[0], monthly: 500 }] }), flag({ ...blank(), workRowsV623: true })].join());
    T("A-15: the example the module loads carries the marker", BASE.workRowsV623 === true);
    load(g, BASE);
  } else {
    T(`A-8 ${KD}: the taper's one test is "no streams" — no holdings test, no single test`, typeof g.builtinWorkApplies === "undefined"
      && /function spouseBWorkTaper\(yr, retireYr\) \{\n  if \(getIncomeStreams\(\)\.length > 0\) return 0;\n  const k/.test(SRC));
  }
}

// ── the engines, compared as JSON, for §B and §C ──
const rothP = (G, retireYear, rothAmount, extra = {}) => { const tl = G.PLAN_TIMELINE(), PF = G.PORTFOLIO();
  return { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: retireYear, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), ladderEnd: tl.rothLadderEnd,
    dobAYr: tl.dobA.year, dobBYr: tl.dobB.year, deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
    pen: G.getPension(), stateRate: tl.stateTaxRate || 0, stateCode: PF.stateCode || null, convTaxFunding: "taxable", taxableGainFrac: 0,
    acaPremium: (PF.acaBridge || {}).premium || 0, acaSize: (PF.acaBridge || {}).size || 0, ...G.retireStartBalances(retireYear),
    ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: rothAmount, ...extra }; };
const sig = (mod, p, { ra = 70000, pr = "base", mc = false } = {}) => {
  const G = mod.__g, EE = mod.__engines; load(G, p); G.applyScenarioProbs(G.PROB_PRESETS()[pr].probs);
  const RY = G.PLAN_TIMELINE().targetRetireYear, A = { retireYear: RY, rothAmount: ra, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: pr };
  const S = G.withdrawalPlanSeries(A), o = {
    D: G.computeWithdrawalPlan(A).schedule, S, B: EE.computeTaxPlan({ ...A, ...S }).rows, C: EE.computeIrmaaPlan({ ...A, ...S }).rows,
    sch: G.mcIncomeTaxSchedule(RY, A), roth: G.runRothStrategies(rothP(G, RY, ra, { ordDrawByYr: S.ordDrawByYr })) };
  if (mc) { _src = mulberry(4); o.mc6 = G.runMonteCarlo(RY, 60, { taxSchedule: o.sch }).results;
    o.mc30 = G.runExtendedMC(RY, 30, 40, { taxSchedule: o.sch, ltcShocks: true, mortality: true, rng: mulberry(5) }).results; }
  return o; };
const diffKeys = (a, b) => Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
const PRIOR_PATH = join(HERE, `app_${D_PRIOR}.mjs`);
const PAIR = VER === D_CUR && existsSync(PRIOR_PATH);
const P0 = PAIR ? await import(pathToFileURL(PRIOR_PATH).href) : null;

// ── §B · the example is unmoved ─────────────────────────────────────────────────────────────────────
console.log(`  B — the example is unmoved across ${D_PRIOR} → ${D_CUR}`);
if (PAIR) {
  for (const pr of ["base", "bull"]) for (const ra of [0, 70000, 150000]) {
    const mc = ra === 70000, a = sig(P0, BASE, { ra, pr, mc }), b = sig(M, BASE, { ra, pr, mc });
    const d = diffKeys(a, b);
    T(`B-1 ${pr} $${ra / 1000}K: the example's Engines B, C, D, the bridge, the tax schedule and the Roth strategies${mc ? ", and both Monte Carlo engines" : ""} are bit-identical`, d.length === 0, d.join(","));
  }
  load(g, BASE); load(P0.__g, BASE);
} else console.log(`    (skipped: §B needs app_${D_PRIOR}.mjs beside the ${D_CUR} leg — printed, by design)`);

// ── §C · every other plan equals v6.22 with the built-in work switched off ─────────────────────────────────
console.log(`  C — every other plan, on ${D_CUR}, equals ${D_PRIOR} with the work switched off (a $0 stream)`);
if (PAIR) {
  const HH = [["the example's figures as another plan", offByOne()], ["the same, single", single(offByOne())], ["holdings × 0.6", scaled(0.6)],
    ["holdings × 0.6, single", single(scaled(0.6))], ["the example made single", single(BASE)], ["a Start Fresh plan", blank()], ["a guided-setup plan", wizard()]];
  for (const [name, p] of HH) {
    const a = sig(P0, { ...clone(p), incomeStreams: ZERO }, { mc: true }), b = sig(M, p, { mc: true });
    const d = diffKeys(a, b);
    T(`C-1 ${name}: every engine on ${D_CUR} equals ${D_PRIOR} with a $0 stream — bit for bit, both Monte Carlo engines included`, d.length === 0, d.join(","));
  }
  // …and the work was really there on the prior leg, so C-1 is not comparing two empty runs.
  const wv = sig(P0, offByOne()).D.filter(r => r.yr >= RY0 && r.yr <= RY0 + 2).map(r => r.work_y).join();
  T(`C-2: SETUP — on ${D_PRIOR}, the example's figures as another plan were paid the wages (Engine D's work_y)`, wv === "20000,18000,15000", wv);
  load(g, BASE); load(P0.__g, BASE);
} else console.log(`    (skipped: §C needs app_${D_PRIOR}.mjs beside the ${D_CUR} leg — printed, by design)`);

// ── §D · a single plan is paid and taxed on no spouse-B wage ────────────────────────────────────────────
console.log("  D — single plans");
for (const [name, p] of [["the example made single", single(BASE)], ["holdings × 0.6, single", single(scaled(0.6))], ["a single Start Fresh plan", single(blank())]]) {
  const s = sig(M, p); const RYh = M.__g.PLAN_TIMELINE().targetRetireYear, yrs = r => r.yr >= RYh && r.yr <= RYh + 2;   // the household's own retirement year
  const dW = s.D.filter(yrs).map(r => r.work_y), bW = s.B.filter(yrs).map(r => r.work_y), bF = s.B.filter(yrs).map(r => Math.round(r.fica));
  if (POST) T(`D-1 ${name}: Engine D spends, and Engine B taxes and charges payroll tax on, no wage in the three years`,
    dW.every(v => v === 0) && bW.every(v => v === 0) && bF.every(v => v === 0), `${dW} / ${bW} / ${bF}`);
  else T(`D-1 ${KD}: ${name} — Engine D spends the spouse-B wages and Engine B taxes them`, dW.join() === "20000,18000,15000" && bW.join() === "20000,18000,15000" && bF.every(v => v > 0), `${dW} / ${bW} / ${bF}`);
}
load(g, BASE);

// ── §F · the extinction, over the fixture households ────────────────────────────────────────────────────
console.log("  F — no plan that is not the example by its holdings, or is single, is paid built-in work");
{
  const fx = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
  let n = 0, bad = [];
  for (const name of Object.keys(fx.HOUSEHOLDS)) {
    load(g, BASE); const p = fx.build(g, name);
    for (const q of [p, single(p)]) {
      load(g, q); const tl = g.PLAN_TIMELINE(), ex = !q.single && JSON.stringify((q.positions || []).map(r => [r.ticker || "", Number(r.balance) || 0])) === JSON.stringify(BASE.positions.map(r => [r.ticker || "", Number(r.balance) || 0]));
      const streams = Array.isArray(q.incomeStreams) && q.incomeStreams.length > 0;
      for (let y = tl.asOfYear; y <= tl.asOfYear + 45; y++) { const v = g.spouseBWorkTaper(y, tl.targetRetireYear); if (v > 0 && (!ex || streams)) bad.push(`${name}${q.single ? "/single" : ""}:${y}`); }
      n++;
    }
  }
  if (POST) T(`F-1: across ${n} fixture households (each married and single), none that is not the example is paid built-in work in any year`, bad.length === 0, bad.slice(0, 6).join(","));
  else T(`F-1 ${KD}: fixture households that are not the example are paid built-in work`, bad.length > 0, `${bad.length}`);
  load(g, BASE);
}

// ── §E · rendered: the notices, the marker, the wording ─────────────────────────────────────────────────
console.log("  E — rendered (the example first; the notices; Save & Apply; the wording)");
{
  const PREFIX = "dc:";
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
  };
  window.confirm = () => true;
  window.URL.createObjectURL = () => "blob:t86"; window.URL.revokeObjectURL = () => {};
  globalThis.URL.createObjectURL = () => "blob:t86"; globalThis.URL.revokeObjectURL = () => {};
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  const txt = () => body().textContent || "";
  const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  let root = null, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
  const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
  const go = async name => { await click(tabBtn(name)); await flush(); await flush(); };
  const raw = k => window.localStorage.getItem(PREFIX + K[k]);
  const stored = k => JSON.parse(raw(k) || "null");
  const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
  const seed = async (portfolio, expenses) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
    if (expenses !== undefined) put("expenses", expenses); await render(); };
  const q = sel => body().querySelector(sel);
  const MONEY = "$20,000, $18,000 and $15,000";

  // E-1 — the example, FIRST, on the fresh page (the landing's "Use example data")
  await seed();
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await flush();
  await go("my data");
  T("E-1: the example shows no notice on My Data", !q('[data-dc-builtin-work-notice="mydata"]'));
  if (POST) T("E-2: My Data's note says the built-in work is the example's alone", /Only the example household also carries built-in part-time work for spouse B/.test(txt()));
  else T(`E-2 ${KD}: My Data's note calls it "the built-in example part-time-work schedule" with no word on who gets it`, /replaces the built-in example part-time-work schedule/.test(txt()));
  await go("withdrawal");
  if (POST) T("E-3: the example's Withdrawal tab Step 1 names its income streams and its built-in work, not spouse B's work income",
    // v6.28 (F-23): the steps were rewritten; Step 1 still names the streams and the example's built-in work
    (["v628", "v629", "v630", "v631"].includes(VER) ? /Step 1: Income — Social Security, the pension and income streams \(and the example's built-in work\) — covers what it can\./
      : /Take Social Security \+ pension \+ other income \(income streams and the example's built-in work\) — guaranteed floor/).test(txt()) && !/Spouse B work income/.test(txt())
    && /column itemizes post-retirement job income \(from My Data → Other Income Streams, and the example household's built-in part-time work for spouse B\)/.test(txt()));
  else T(`E-3 ${KD}: the Withdrawal tab's Step 1 tells every plan it takes "Spouse B work income"`, /Spouse B work income — guaranteed floor/.test(txt()));
  await go("taxes");
  if (POST) T("E-4: the example's Taxes-tab line names job rows and the example's built-in work", /Earned income \(job rows and the example's built-in work\)/.test(txt()));
  else T(`E-4 ${KD}: the Taxes-tab line is named for spouse B whoever earns it`, /Spouse B earned income/.test(txt()));
  await go("monte carlo");
  T("E-5: the example shows no notice on the Monte Carlo tab", !q('[data-dc-builtin-work-notice="mc"]'));

  // E-14 — the sixth read site, the Roth tab's ladder (inside a render block, so only a render reaches it): in the retirement year the
  // example's ladder MAGI carries the $20,000 the same plan with one balance a dollar off does not (v6.23); on v6.22 both carry it.
  const ladder = () => { const t = txt(), i = t.indexOf("TRAD BALROTH BAL"); if (i < 0) return null; const seg = t.slice(i, i + 6000), out = {};
    const re = /(20\d\d)\$(\d+)K\$(\d+)K(\d+)%\$([\d.]+)K\$(\d+)K/g; let m; while ((m = re.exec(seg)) !== null) out[+m[1]] = +m[6]; return out; };
  const toRoth = async () => { const b = [...body().querySelectorAll("button, div, span")].find(x => (x.textContent || "").trim().toLowerCase() === "roth"); await click(b); await flush(); await flush(); };
  await toRoth(); const lEx = ladder();
  await seed(offByOne(), clone(XB)); await toRoth(); const lOff = ladder();
  const dM = lEx && lOff && lEx[RY0] != null && lOff[RY0] != null ? lEx[RY0] - lOff[RY0] : null;
  if (POST) T(`E-14: the Roth tab's ladder — ${RY0} MAGI on the example exceeds the same plan a dollar off by at least the $20,000 wage`, dM !== null && dM >= 19, `${dM}K (${lEx && lEx[RY0]} vs ${lOff && lOff[RY0]})`);
  else T(`E-14 ${KD}: the Roth tab's ladder pays the same plan a dollar off the example's wages (${RY0} MAGI within $1K)`, dM !== null && Math.abs(dM) <= 1, `${dM}K`);

  // E-6 — a Start Fresh plan saved before v6.23 (no marker), stored, reloaded
  await seed(blank(), []);
  await go("my data");
  const nmd = q('[data-dc-builtin-work-notice="mydata"]');
  if (POST) T("E-6: a Start Fresh plan saved before v6.23 is told on My Data what it lost and how to enter work",
    !!nmd && nmd.textContent.includes(MONEY) && /Only the example household is paid them now/.test(nmd.textContent) && /add a job row/.test(nmd.textContent), nmd ? nmd.textContent.slice(0, 160) : "none");
  else T(`E-6 ${KD}: a Start Fresh plan is told nothing (and is paid the wages)`, !nmd);
  if (POST) {
    await click(btn(/works after retirement/)); await flush();
    T("E-6b: adding a job row in My Data's draft hides the notice at once (it says the plan has no work income)", !q('[data-dc-builtin-work-notice="mydata"]'));
    await seed(blank(), []); await go("my data");
  }
  await go("taxes");
  if (POST) T("E-7: its Taxes tab shows no built-in-work line (the line lists only figures above zero)", !/built-in work\)/.test(txt()) && !/Spouse B earned income/.test(txt()));
  await go("withdrawal");
  if (POST) T("E-7c: its Withdrawal tab's Step 1 names income streams only, and the Work column note no built-in work",
    (["v628", "v629", "v630", "v631"].includes(VER) ? /Step 1: Income — Social Security, the pension and income streams — covers what it can\./   // v6.28 (F-23): Step 1 rewritten
      : /Take Social Security \+ pension \+ other income \(income streams\) — guaranteed floor/).test(txt()) && /column itemizes post-retirement job income \(from My Data → Other Income Streams\) separately/.test(txt()));
  await go("monte carlo");
  const nmc = q('[data-dc-builtin-work-notice="mc"]');
  // the Monte Carlo never credited the wages, only their tax — so its notice says the tax is gone (the figures rise slightly), not that income was lost
  if (POST) T("E-8: …and on the Monte Carlo tab, saying the simulation never paid the wages in and no longer charges their tax",
    !!nmc && /charged every plan with no income streams the income tax on \$20,000, \$18,000 and \$15,000/.test(nmc.textContent) && /wages this simulation never paid in/.test(nmc.textContent)
    && /no longer include that tax/.test(nmc.textContent), nmc ? nmc.textContent.slice(0, 160) : "none");
  else T(`E-8 ${KD}: no Monte Carlo notice`, !nmc);
  await go("my data");
  await click(btn(/SAVE\s*&\s*APPLY/)); for (let i = 0; i < 3; i++) await flush();
  if (POST) {
    T("E-9: Save & Apply stores workRowsV623 and ends the notice", (stored("portfolio") || {}).workRowsV623 === true && !q('[data-dc-builtin-work-notice="mydata"]'), String((stored("portfolio") || {}).workRowsV623));
    await render(); await go("my data");
    T("E-10: …and it stays gone across a reload", !q('[data-dc-builtin-work-notice="mydata"]'));
  }

  // E-7b — a plan with a job row: the Taxes-tab line names job rows only
  await seed({ ...wizard(), workRowsV623: true, incomeStreams: [{ label: "Consulting", kind: "work", owner: "B", monthly: 2000, startYear: 2026, endYear: 2070, cola: false, tax: "ordinary" }] }, []);
  await go("taxes");
  if (POST) T("E-7b: a plan with a job row reads \"Earned income (job rows)\" on the Taxes tab", /Earned income \(job rows\)/.test(txt()) && !/built-in work\)/.test(txt()), (txt().match(/Earned income[^$]{0,60}/) || ["none"])[0]);
  else T(`E-7b ${KD}: the Taxes-tab line is named for spouse B ("Bo earned income") whoever earns it`, /Bo earned income/.test(txt()));

  // E-11 — a single plan saved before v6.23
  await seed(single(blank()), []);
  await go("my data");
  const ns = q('[data-dc-builtin-work-notice="mydata"]');
  if (POST) T("E-11: a single plan's notice says it has no spouse B and is paid none now", !!ns && /This plan has no spouse B, and it is paid none now/.test(ns.textContent) && /single plans included/.test(ns.textContent), ns ? ns.textContent.slice(0, 160) : "none");
  else T(`E-11 ${KD}: a single plan is told nothing`, !ns);

  // E-12 — a plan with a real stream, saved before v6.23: it never had the work, so no notice
  await seed({ ...blank(), incomeStreams: [{ label: "Rental", kind: "rental", owner: "joint", monthly: 800, startYear: 2026, endYear: 9999, cola: true, tax: "ordinary" }] }, []);
  await go("my data");
  T("E-12: a plan with an income stream shows no notice (both legs)", !q('[data-dc-builtin-work-notice="mydata"]'));

  // E-13 — Start Fresh from the landing (v6.23 writes the marker; no notice)
  await seed();
  await click(btn(/start fresh/i)); for (let i = 0; i < 4; i++) await flush();
  await go("my data");
  if (POST) T("E-13: Start Fresh stores workRowsV623 and shows no notice", (stored("portfolio") || {}).workRowsV623 === true && !q('[data-dc-builtin-work-notice="mydata"]'), String((stored("portfolio") || {}).workRowsV623));
  await unmount();
}

// ── §G · the Field Manual and METHODOLOGY ───────────────────────────────────────────────────────────────
console.log("  G — the Field Manual and METHODOLOGY");
{
  const meth = existsSync(join(HERE, "..", "METHODOLOGY.md")) ? readFileSync(join(HERE, "..", "METHODOLOGY.md"), "utf8") : "";
  if (POST) {
    T("G-1: the Field Manual's limitations entry says the built-in work belongs to the example alone, and what changed", /belongs to the example household alone/.test(SRC) && /Through v6\.22 it was paid to every plan with no income streams, single plans included/.test(SRC));
    T("G-2: …and no longer says it applies to every plan", !/applies to every plan with no income streams, single plans included/.test(SRC));
    T("G-3: the Monte Carlo entry speaks of the example household only", /For the example household, whose spouse B works part-time in its retirement year and the two after/.test(SRC) && !/For a plan with no other income streams entered, the Taxes tab also taxes/.test(SRC));
    T("G-4: the Field Manual says Backtest and What Breaks count no income stream (D-57)", /Backtest and What Breaks count no income stream/.test(SRC));
    T("G-5: the Field Manual's D-10 sentence no longer says the ladder reads one spouse's earned income as a live gap", (["v629", "v630", "v631"].includes(VER)   // v6.29 (F-25, 1749): the ladder's MAGI misses TWO terms — the spending draw's ordinary income (Engine C's since v5.74) and gains
      ? /<strong>Two terms are still missing<\/strong>: the ordinary-income dollars the withdrawal plan spends each year/.test(SRC) && !/One smaller term is still missing/.test(SRC)
      : /One smaller term is still missing<\/strong>: realized capital gains/.test(SRC)) && !/Two smaller terms are still missing/.test(SRC));
    T("G-6: METHODOLOGY has the v6.23 section and no longer says streams flow through What-Breaks", /## Built-in work is the example's alone \(v6\.23\)/.test(meth)
      && !/both Monte Carlo engines,\s+what-breaks,/i.test(meth) && /\*\*Backtest and What-Breaks credit no stream\*\*/.test(meth), meth ? "" : "METHODOLOGY.md not found");
    T("G-7: the Field Manual's streams FAQ and My Data's note no longer say streams reach every engine (Backtest and What Breaks count none — D-57)",
      /Roth (optimizer|comparator) — but not Backtest or What Breaks, which count Social Security and the pension only/.test(SRC)   /* v6.28 (F-23): "optimizer" became "comparator" */ && !/These streams flow through every projection/.test(SRC)
      && /not Backtest or What Breaks, which count Social Security and the pension only\./.test(SRC));
  } else T(`G-1 ${KD}: the Field Manual says the built-in work applies to every plan with no income streams`, /applies to every plan with no income streams, single plans included/.test(SRC));
}

finished = true;
console.log(`\nt86 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
