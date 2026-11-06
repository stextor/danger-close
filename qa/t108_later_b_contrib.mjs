// t108_later_b_contrib.mjs — v6.44 (D-71, D-72, D-73; docs/SCOPE_D71_D72_D73_V644.md, DE-1 (a) … DE-6 (a)).
//
// WHAT IT PINS.
//   D-71 · When spouse B retires after spouse A, B's planned contributions in the years between were counted three ways: Engines A, B and C
//          put all of them into the retirement-start balance at A's year (`retireStartBalances` ran B to her own year), where they earned
//          returns before they were made; Engine D, What Breaks and Backtest left them out (v6.43's DD-7); only the Monte Carlo added them as
//          they were made. From v6.44 one helper, `laterBContribAt(yr, retireYr)`, says what B adds in a year — at face value, from the
//          engine's own retirement year to the year before B's, from the as-of year, while B is alive, never below 0 — and every deterministic
//          projection adds it at the END of that year (DE-2 (a)): Engines B and C (pre-tax), Engine A (from P: `P.laterB`), Engine D (placed by
//          the contribution mix), the Roth ladder and its RMD cards, What Breaks and Backtest. `retireStartBalances` stops B at A's year.
//   D-72 · On a single plan an income stream stored under spouse B was dropped from every figure. From v6.44 `streamsMonthlyAt` reads it as
//          the one person's (the stored owner is untouched), and the three owner labels name the one person.
//   D-73 · On a single plan the Monte Carlo still added spouse B's stored contribution (`spouseBMonthly`). From v6.44 both Monte Carlo engines
//          read it as 0 on a single plan.
//
// Both legs: node t108_later_b_contrib.mjs v643 | node t108_later_b_contrib.mjs v644. The v6.43 leg pins each defect as a dated
// [KNOWN DEFECT 2026-11-03, D-71 — flips at v6.44] (D-72, D-73 alike). Sections:
//   A · the source, by AST — the helper and who calls it; Engine A reads P only; `retireStartBalances` stops B at A's year; the stream
//       helper's single-plan rule and the three labels; both Monte Carlo engines gate spouse B's contribution
//   B · the extinction invariant — on the later-B plans (the example and every fixture with B retiring later, a plan already retired, one
//       whose retirement year is before its as-of year, one where B dies before retiring, one where B is at RMD age and still working) and
//       the plans where B is not later: (1) the helper equals an oracle computed HERE from the plan's own fields, for the engine's year and the
//       selector's year either side; (2) a TWIN pair differing only in B's retirement year by one (so only that one year's contribution
//       differs) is identical in every year before it, in every engine; in that year Engine D's Traditional, Roth and buckets and Engine A's
//       wealth rise by exactly the contribution, and Engines B and C do not move until the next year, when B's RMD rises by exactly the
//       Traditional part ÷ the IRS divisor (zero before B's RMD age); Engines B and C agree on that rise in every year; the Monte Carlo's
//       planned path first moves in a quarter of the same year; (3) once B has died nothing is added; (4) Engine D's shares sum to at most 1
//   C · bit-identity — every plan where B does not retire later (the example and every fixture as they stand, B retiring first) is v6.43's
//       to the bit across Engines A–D, the bridge, the Monte Carlo's tax schedule, both seeded Monte Carlo engines and the What Breaks /
//       Backtest start; and the Roth (the ladder and its RMD cards), What Breaks, Backtest and Withdrawal tabs render v6.43's text, save the
//       version string (current leg, when the run folder holds app_v643.mjs and dom_v643.cjs)
//   D · hand pins — the example with B working six more years at $2,000 + $500 Roth a month
//   E · D-72 and D-73
//   F · rendered — the notes, the RMD card's hand pin, What Breaks and Backtest moving the right way, the Field Manual, METHODOLOGY
//
// WHAT IS NOT AN EXACT PER-YEAR ORACLE HERE (stated, not implied): the Roth ladder, its RMD cards, What Breaks and Backtest are computed
// inside components and cannot be called from a suite. They are covered by §A (each calls the helper, with the engine's year; What Breaks
// and Backtest enter it at face value, as What Breaks enters a fixed pension), §C (bit-identity where B is not later), §F (the no-conversion RMD card's figure to the
// dollar; the ladder's with-conversion card, What Breaks and Backtest rising as B works later) and the controls, which remove the step from
// each in turn.
// Controls: qa/tools/controls_v644_later_b.py (repo-only). Exits with process.exit (the rendered app leaves timers running).
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(108); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v644";
const DUMP = process.argv[3] === "--dumpdom";
const KNOWN_VERSIONS = ["v643", "v644", "v645", "v646", "v647"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v644", "v645", "v646", "v647"].includes(VER);   // an array, so the next registration widens it
const C_PRIOR = "v643";                // §C's prior module — a constant, so the registrar cannot widen it
const KD71 = "[KNOWN DEFECT 2026-11-03, D-71 — flips at v6.44]", KD72 = "[KNOWN DEFECT 2026-11-03, D-72 — flips at v6.44]",
  KD73 = "[KNOWN DEFECT 2026-11-03, D-73 — flips at v6.44]";
const require = createRequire(import.meta.url);
const clone = o => JSON.parse(JSON.stringify(o));
const canon = v => JSON.stringify(v, (k, x) => (typeof x === "number" && !Number.isFinite(x)) ? String(x) : x);
const near = (a, b, tol = 0.005) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;

// ── the rendered app (used by §C's dump and §F) ──────────────────────────────────────────────────────────────
const mountApp = async ver => {
  require(`./dom_${ver}.cjs`);
  const React = require("react");
  const body = () => window.document.body;
  let root, act, DangerClose;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === name);
  const text = () => { const c = body().cloneNode(true); c.querySelectorAll("style,script").forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " "); };
  const el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush();
  const ex = [...body().querySelectorAll("button, [role=button], div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(ex); await flush(); await flush();
  const DG = window.__g;
  const DP0 = clone(DG.PORTFOLIO()), DX0 = clone(DG.EXPENSES());
  const visit = async (tab, P, X = DX0) => { await act(async () => { DG.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); }); await flush(); await flush();
    await click(tabBtn("dashboard")); await flush(100); await click(tabBtn(tab)); await flush(200); return text(); };
  const unmount = async () => { try { await act(async () => { root.unmount(); }); } catch (e) {} };
  return { DG, DP0, DX0, visit, unmount };
};
// §C's DOM plans: B not later. The same list in both processes.
const DOM_PLANS = P0 => [["example", clone(P0)], ["B retires first", { ...clone(P0), retireYearB: 2027 }]];
const DOM_TABS = ["roth", "what breaks", "backtest", "withdrawal"];
const normVer = t => t.replace(/v?6\.4[34]/g, "v6.4x").replace(/v64[34]/g, "v64x");
if (DUMP) {
  const app = await mountApp(VER), out = {};
  for (const [nm, P] of DOM_PLANS(app.DP0)) for (const tab of DOM_TABS) { _src = mulberry(108); out[`${nm}|${tab}`] = await app.visit(tab, P); }
  await app.unmount();
  process.stdout.write("\n@@DUMP@@" + JSON.stringify(out) + "@@END@@\n");
  process.exit(0);
}

const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = M.__g, E = M.__engines;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const callsOf = (root, name) => all(root, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === name);
const topFn = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
const SRCOF = n => SRC.slice(n.range[0], n.range[1]);
// the innermost enclosing named function (declaration, or a `const name = …` arrow/function) of an ancestor chain
const encl = anc => { for (let i = anc.length - 1; i >= 0; i--) { const a = anc[i];
  if (a.type === "FunctionDeclaration" && a.id) return a.id.name;
  if ((a.type === "ArrowFunctionExpression" || a.type === "FunctionExpression") && i > 0 && anc[i - 1].type === "VariableDeclarator" && anc[i - 1].id.type === "Identifier") return anc[i - 1].id.name; }
  return null; };

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T108_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t108 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
console.log(`t108 — A SPOUSE WHO RETIRES LATER, AND SPOUSE-B DATA ON A SINGLE PLAN (${VER})`);

const P0 = clone(g.PORTFOLIO()), X0 = clone(g.EXPENSES());
const load = (G, P, X = X0) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); return G.PLAN_TIMELINE(); };
const { HOUSEHOLDS } = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
// the one-time rows dated before `R` removed — a plan retired in its as-of year should not carry the example's pre-retirement rows
const noPre = (X, R) => X.filter(r => !(r.freq === "once" && Number(String(r.start).slice(0, 4)) < R));

// ── the oracle, from the plan's own fields (never the app's helpers) ─────────────────────────────────────────────
// IRS Uniform Lifetime Table (Pub. 590-B, Table III, from 2022), ages 72–95; SECURE 2.0's start ages by birth year.
const ULT = { 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8,
  85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9 };
const rmdStart = by => by <= 1950 ? 72 : by <= 1959 ? 73 : 75;
const yearOf = d => Number(String(d || "").slice(0, 4)) || null;
// B's later contributions for the engine year R: { [yr]: { trad, roth } }, years R..rB-1 from the as-of year, while B is alive, face value
const orc = (P, R) => {
  if (P.single) return {};
  const asOf = yearOf(P.asOf), rB = Number(P.retireYearB) || Number(P.retireYear), dB = yearOf(P.dobB), leB = Number(P.lifeExpB);
  const c = P.contributions || {}, z = x => Math.max(0, Number(x) || 0), t = 12 * z(c.contribPreTaxB), r = 12 * z(c.contribRothB), out = {};
  if (!(t || r)) return {};
  for (let y = Math.max(R, asOf); y < rB; y++) { if (dB && Number.isFinite(leB) && y >= dB + leB) break; out[y] = { trad: t, roth: r }; }
  return out;
};

// every engine on the loaded plan, for one retirement year, conversion amount and scenario
const runAll = (G, Eng, roth, pre, R) => {
  const tl = G.PLAN_TIMELINE(), Pl = G.PORTFOLIO(), rsb = G.retireStartBalances(R);
  const ser = G.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: pre });
  const B = Eng.computeTaxPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows;
  const C = Eng.computeIrmaaPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows;
  const w = G.computeWithdrawalPlan({ retireYear: R, rothAmount: roth, scenarioPreset: pre });
  // Engine A's P as its three builders make it (the builders' own `laterB:` is §A's)
  const PO = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R,
    horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.single ? 0 : tl.dobB.year + tl.lifeExpB), ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB ? tl.dobB.year : tl.dobA.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
    pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: Pl.stateCode || null,
    convTaxFunding: "taxable", taxableGainFrac: 0, acaPremium: (Pl.acaBridge || {}).premium || 0, acaSize: (Pl.acaBridge || {}).size || 0,
    ...rsb, laterB: G.laterBContribSeries ? G.laterBContribSeries(R) : undefined, ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
    survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    taxableInit: G.taxableInitAll(), workMagi: G.workMagi(), taxYieldPct: 2.0, currentConv: 0, ordDrawByYr: ser.ordDrawByYr };
  const A = G.runRothStrategies(PO, [{ key: "f", label: "x", policy: { kind: "fixed", amount: roth } }, { key: "b", label: "x", policy: { kind: "fillBracket", rate: 22 } }]);
  return { tl, rsb, ser, B, C, D: w.schedule, open: w._opening, A, S: G.mcIncomeTaxSchedule(R, { rothAmount: roth, scenarioPreset: pre }) };
};

// ── §A · the source, by AST ────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source, by AST");
{
  const LB = topFn("laterBContribAt"), RSB = topFn("retireStartBalances");
  if (POST) {
    const calls = callsOf(AST, "laterBContribAt"), where = calls.map(c => encl(c.anc));
    const W = topFn("computeWithdrawalPlan"), Bf = topFn("computeTaxPlan"), Cf = topFn("computeIrmaaPlan");
    // the closures by their own names: Backtest's `runSequence`, What Breaks' `project`, the RMD cards' `_lbGrown`; the ladder's step sits in the
    // component body (its loop), so it is found by the variables it writes
    const inFn = (f, c) => !!f && c.n.range[0] >= f.range[0] && c.n.range[1] <= f.range[1];
    const nW = calls.filter(c => inFn(W, c)).length, nB = calls.filter(c => inFn(Bf, c)).length, nC = calls.filter(c => inFn(Cf, c)).length;
    const nSeq = where.filter(x => x === "runSequence").length, nProj = where.filter(x => x === "project").length, nLb = where.filter(x => x === "_lbGrown").length;
    const ladder = calls.filter(c => { const blk = c.anc.slice().reverse().find(a => a.type === "BlockStatement"); return blk && /tradBalB \+= _lb\.trad;\s*rothBal \+= _lb\.roth/.test(SRCOF(blk)); });
    const series = topFn("laterBContribSeries");
    T(`A-1 \`laterBContribAt\` is module-level and called by Engine D (1), Engine B (1), Engine C (1), Backtest's \`runSequence\` (1), What Breaks' \`project\` (1), the Roth ladder's year loop (1), the RMD cards' \`_lbGrown\` (1) and \`laterBContribSeries\` (1) — ${calls.length} calls`,
      !!LB && nW === 1 && nB === 1 && nC === 1 && nSeq === 1 && nProj === 1 && ladder.length === 1 && nLb === 1 && !!series && callsOf(series, "laterBContribAt").length === 1
      && calls.length === 8, JSON.stringify({ n: calls.length, nW, nB, nC, nSeq, nProj, ladder: ladder.length, nLb, where }));
    // Engine A reads P only: no call to the helper or its series inside it, and its step reads `P.laterB`
    const RR = topFn("runRothStrategies");
    const aStep = RR ? all(RR, n => n.type === "IfStatement" && /P\.laterB\s*&&\s*P\.laterB\[yr\]/.test(SRCOF(n.test))) : [];
    const pbs = all(AST, n => n.type === "Property" && !n.computed && n.key.type === "Identifier" && n.key.name === "laterB");
    T("A-2 Engine A reads B's later contributions only from P (`P.laterB[yr]`, guarded on `!_pooled`) — no helper call inside it — and exactly three object literals pass `laterB: laterBContribSeries(retireYear)`, each beside a `...retireStartBalances(retireYear)` spread",
      !!RR && callsOf(RR, "laterBContribAt").length === 0 && callsOf(RR, "laterBContribSeries").length === 0 && !/PORTFOLIO|PLAN_TIMELINE/.test(aStep.map(s => SRCOF(s.n)).join(""))
      && aStep.length === 1 && /!_pooled/.test(SRCOF(aStep[0].n.test))
      && pbs.length === 3 && pbs.every(p => /^laterBContribSeries\(retireYear\)$/.test(SRCOF(p.n.value)) && p.anc.length && p.anc[p.anc.length - 1].type === "ObjectExpression"
        && p.anc[p.anc.length - 1].properties.some(q => q.type === "SpreadElement" && /^retireStartBalances\(retireYear\)$/.test(SRCOF(q.argument)))), String(pbs.length));
    const ca = RSB ? callsOf(RSB, "contribAccrual") : [];
    T("A-3 `retireStartBalances` calls `contribAccrual` once, with `bStopsAtA: true` — B's accrual stops at A's year, as `openingAccrual`'s does",
      ca.length === 1 && /bStopsAtA:\s*true/.test(SRCOF(ca[0].n)) && callsOf(AST, "contribAccrual").length === 2, String(callsOf(AST, "contribAccrual").length));
    // no projection computes B's contribution inline: `contribPreTaxB` / `contribRothB` are read only by the helper, `contribAccrual`, the
    // loader/import/My Data paths (outside every engine)
    const ENG = ["computeWithdrawalPlan", "computeTaxPlan", "computeIrmaaPlan", "runRothStrategies", "runMonteCarlo", "runExtendedMC", "carryStartBalances", "retireStartBalances"];
    const inline = ENG.flatMap(nm => { const f = topFn(nm); return f ? all(f, n => n.type === "MemberExpression" && !n.computed && ["contribPreTaxB", "contribRothB"].includes(n.property.name)) : []; });
    const inLB = LB ? all(LB, n => n.type === "MemberExpression" && !n.computed && ["contribPreTaxB", "contribRothB"].includes(n.property.name)).length : 0;
    T("A-4 no engine reads `contribPreTaxB` or `contribRothB` itself; the helper reads both", ENG.every(nm => !!topFn(nm)) && inline.length === 0 && inLB === 2, String(inline.length));
    // the helper's guards: single, the engine's year, B's year, the as-of year, B alive, and never below 0
    const lbS = LB ? SRCOF(LB) : "";
    T("A-5 the helper returns nothing on a single plan, before the engine's year (its `retireYr` argument), from B's year, before the as-of year or once B has died, and floors each amount at 0",
      /tl\.single/.test(lbS) && /yr\s*>=\s*rA/.test(lbS) && /yr\s*<\s*rB/.test(lbS) && /yr\s*>=\s*tl\.asOfYear/.test(lbS) && /tl\.dobB\.year\s*\+\s*tl\.lifeExpB/.test(lbS)
      && /Math\.max\(0,/.test(lbS) && /Number\(retireYr\)/.test(lbS));
    // every deterministic step runs after its year's growth (DE-2 (a)): the helper call comes after the growth assignment it follows
    const after = (fn, growthRe) => { const f = topFn(fn); if (!f) return false; const c = callsOf(f, "laterBContribAt")[0]; if (!c) return false;
      const gs = all(f, n => n.type === "ExpressionStatement" && growthRe.test(SRCOF(n))); return gs.length > 0 && gs.some(s => s.n.range[1] <= c.n.range[0]); };
    T("A-6 in Engines B, C and D the step comes after the year's growth (end of year, DE-2 (a))",
      after("computeTaxPlan", /tradB\s*=\s*_pB\s*\*\s*\(1 \+ tradGrowth\)/) && after("computeIrmaaPlan", /tradB\s*=\s*_pB\s*\*\s*1\.045/) && after("computeWithdrawalPlan", /b4\s*\*=\s*\(1 \+ growth\.b4\)/));
    // What Breaks and Backtest: the contribution enters at the loop's year `_retireYr + k`, at FACE value — a fixed amount. Their balances are
    // nominal dollars ÷ the dollar factor to the retirement year, so a fixed amount enters ÷ that factor in every year, as What Breaks enters
    // its fixed pension (`_pen * 12 / _rbWB`) — never × the loop's inflation, which would index it (the build review's finding 2: the scope's
    // first form did, worth up to 29% more on a 1970s Backtest start)
    const loopStep = nm => { const c = calls.find((x, i) => where[i] === nm); if (!c) return null; const blk = c.anc.slice().reverse().find(a => a.type === "BlockStatement"); return blk ? SRCOF(blk) : null; };
    const seqB = loopStep("runSequence"), projB = loopStep("project");
    const fnSrc = nm => { const f = all(AST, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === nm)[0]; return f ? SRCOF(f.n) : ""; };
    const seqS = fnSrc("runSequence"), projS = fnSrc("project");
    const rbDecl = fnSrc("_rbWB"), penDecl = fnSrc("annualPenGuar");
    T("A-7 Backtest and What Breaks add `laterBContribAt(_retireYr + k, _retireYr)` at face value: ÷ the dollar factor to the retirement year (What Breaks through `_rbWB`, its fixed pension's divisor), never × the loop's inflation, at the end of the year",
      !!seqB && /laterBContribAt\(_retireYr \+ k, _retireYr\)/.test(seqB) && /bal \+= _la \/ planDollarFactor\(_retireYr, PLAN_TIMELINE\.asOfYear\);/.test(seqB) && !/cumInflation/.test(seqB)
      && seqS.indexOf("bal = bal * (1 + portReturn)") > -1 && seqS.indexOf("bal = bal * (1 + portReturn)") < seqS.indexOf("laterBContribAt")
      && !!projB && /laterBContribAt\(_retireYr \+ k, _retireYr\)/.test(projB) && /bal \+= _la \/ _rbWB;/.test(projB) && !/cumInf/.test(projB)
      && /^_rbWB = planDollarFactor\(_retireYr, _tlW\.asOfYear\)$/.test(rbDecl) && /_pen \* 12 \/ _rbWB/.test(penDecl)
      && projS.indexOf("bal = bal * (1 + realReturn + inflation)") > -1 && projS.indexOf("bal = bal * (1 + realReturn + inflation)") < projS.indexOf("laterBContribAt"), rbDecl);
    // D-72: the stream helper's single-plan rule, before the alive and owner tests; the three labels
    const SM = topFn("streamsMonthlyAt"), smS = SM ? SRCOF(SM) : "";
    const lbl = all(AST, n => n.type === "ConditionalExpression" && /s\.owner === "B"/.test(SRCOF(n.test)) && /single/.test(SRCOF(n.test)));
    T("A-8 D-72: `streamsMonthlyAt` maps a single plan's B-owned stream to A before its alive and owner tests; three owner labels read the single flag",
      /_single\s*&&\s*s0\s*&&\s*s0\.owner === "B"/.test(smS) && smS.indexOf("_single && s0") < smS.indexOf('s.owner === "B" && !aliveB') && lbl.length === 3, String(lbl.length));
    const mcS = ["runMonteCarlo", "runExtendedMC"].map(nm => topFn(nm) ? SRCOF(topFn(nm)) : "");
    T("A-9 D-73: both Monte Carlo engines read spouse B's contribution as 0 on a single plan", mcS.every(s => /PORTFOLIO\.single \? 0 : \(?PORTFOLIO\.contributions\.spouseBMonthly/.test(s)));
    T("A-10 `laterBLeftOut` (v6.43's 'left out' readout) is gone", !topFn("laterBLeftOut") && callsOf(AST, "laterBLeftOut").length === 0);
  } else {
    const ca = RSB ? callsOf(RSB, "contribAccrual") : [];
    T(`A-1 ${KD71} no \`laterBContribAt\`; \`retireStartBalances\` runs B's accrual to B's own year (no \`bStopsAtA\`), and \`laterBLeftOut\` names what DD-7 leaves out`,
      !LB && ca.length === 1 && !/bStopsAtA/.test(SRCOF(ca[0].n)) && !!topFn("laterBLeftOut"));
    const smS = topFn("streamsMonthlyAt") ? SRCOF(topFn("streamsMonthlyAt")) : "";
    T(`A-2 ${KD72} \`streamsMonthlyAt\` has no single-plan rule for a B-owned stream (its only single test is B's alive test)`, !!smS && !/_single/.test(smS) && /!tl\.single && tl\.dobB/.test(smS));
    const mcS = topFn("runMonteCarlo") ? SRCOF(topFn("runMonteCarlo")) : "";
    T(`A-3 ${KD73} \`runMonteCarlo\` reads spouse B's contribution without the single flag`, /spouseBMonthly/.test(mcS) && !/PORTFOLIO\.single \? 0/.test(mcS));
  }
}

// ── §B · the extinction invariant ──────────────────────────────────────────────────────────────────────────────
console.log("  B — the extinction invariant");
const later = (n, mo, roth = 0) => P => { const R = P.retireYear || 2029; P.retireYearB = R + n;
  P.contributions = { ...P.contributions, contribPreTaxB: mo, contribRothB: roth, spouseBMonthly: mo + roth }; return P; };
const LATER = [
  ["example, B +2y, $350/mo", later(2, 350)],
  ["example, B +6y, $2,000 + $500 Roth/mo", later(6, 2000, 500)],
  ["retired 2026, B to 2032, $2,000/mo", P => { P.retireYear = 2026; P.retireYearB = 2032; P.contributions = { ...P.contributions, contribPreTaxB: 2000, spouseBMonthly: 2000 }; return P; }],
  ["retirement year before the as-of year (2024), B to 2029, $1,500/mo", P => { P.retireYear = 2024; P.retireYearB = 2029; P.contributions = { ...P.contributions, contribPreTaxB: 1500, spouseBMonthly: 1500 }; return P; }],
  // B dies at the end of 2031 (born 1966, life expectancy 66), with B's retirement set for 2035
  ["B dies before retiring", P => { P.lifeExpB = 66; P.retireYearB = 2035; P.contributions = { ...P.contributions, contribPreTaxB: 1000, contribRothB: 200, spouseBMonthly: 1200 }; return P; }],
  // B at RMD age and still working: born 1952, A retired in the as-of year, B to 2030 — Engines B and C show each year's contribution in B's RMD
  ["B at RMD age, still working (born 1952), A retired 2026, B to 2030", P => { P.dobB = "1952-03-01"; P.retireYear = 2026; P.retireYearB = 2030;
    P.contributions = { ...P.contributions, contribPreTaxB: 2000, contribRothB: 500, spouseBMonthly: 2500 }; return P; }],
].concat(Object.keys(HOUSEHOLDS).filter(n => n !== "single").map(n => [`fixture ${n}, B +4y, $1,000/mo`, P => { HOUSEHOLDS[n].apply(P); return later(4, 1000)(P); }]));
const NOTLATER = [["example (B with A)", P => P], ["B retires first", P => { P.retireYearB = 2027; return P; }],
  ["single fixture", P => { HOUSEHOLDS.single.apply(P); return P; }]]
  .concat(Object.keys(HOUSEHOLDS).filter(n => n !== "single").map(n => [`fixture ${n}`, P => { HOUSEHOLDS[n].apply(P); return P; }]));
const COMBOS = [[0, "base"], [70000, "base"], [250000, "base"], [70000, "bull"]];
const prep = (G, f) => { const P = f(clone(P0)); const tl = load(G, P); const R = tl.targetRetireYear; load(G, P, noPre(X0, Math.max(R, tl.asOfYear))); return { P: G.PORTFOLIO(), R, tl: G.PLAN_TIMELINE(), X: noPre(X0, Math.max(R, tl.asOfYear)) }; };
{
  // (1) the helper against the oracle, at the engine's year and the selector's year either side
  let nH = 0; const hBad = []; let nonEmpty = 0;
  if (POST) {
    for (const [nm, f] of LATER.concat(NOTLATER)) {
      const { P, R, tl } = prep(g, f);
      for (const Rx of [R - 1, R, R + 1]) {
        const want = orc(P, Rx), got = g.laterBContribSeries(Rx); nH++;
        if (Object.keys(want).length) nonEmpty++;
        let ok = canon(want) === canon(got) && near(g.laterBTotal(Rx), Object.values(want).reduce((t, v) => t + v.trad + v.roth, 0), 1e-9);
        for (let y = tl.asOfYear - 3; y <= (tl.targetRetireYearB || R) + 3; y++) { const a = g.laterBContribAt(y, Rx), w = want[y] || { trad: 0, roth: 0 }; if (a.trad !== w.trad || a.roth !== w.roth) ok = false; }
        if (!ok && hBad.length < 4) hBad.push(`${nm}@${Rx}: want ${canon(want)} got ${canon(got)}`);
      }
    }
    T(`B-1 the helper equals the oracle computed here from each plan's fields (B's monthly pre-tax and Roth × 12, from the engine's year and the as-of year to the year before B's, while B is alive) on ${LATER.length + NOTLATER.length} plans × the engine's year and either side (${nH} cases, ${nonEmpty} non-empty)`,
      hBad.length === 0 && nH === (LATER.length + NOTLATER.length) * 3 && nonEmpty >= LATER.length * 2, hBad.join(" | "));
  }

  // (2) the twin pairs: B's retirement year y+1 against y — only year y's contribution differs
  let nTw = 0, nTwCase = 0; const bad = { pre: [], D: [], A: [], BC: [], rmd: [], agree: [], mc: [], shares: [] }; let rmdHits = 0, mcN = 0, agreeNZ = 0;
  const twinYears = (P, R) => { const ks = Object.keys(orc(P, R)).map(Number); return [...new Set([ks[0], ks[1], ks[ks.length - 1]].filter(Number.isFinite))]; };
  const kd = []; // v6.43 leg: what the twin shows
  for (const [nm, f] of LATER) {
    const { P, R, tl, X } = prep(g, f);
    const ys = twinYears(P, R);
    if (POST && !ys.length) { bad.pre.push(`${nm}: no later years`); continue; }
    if (!POST && nm !== "example, B +6y, $2,000 + $500 Roth/mo") continue;
    for (const y of (POST ? ys : [2031])) {
      const PX = { ...clone(P), retireYearB: y + 1 }, PY = { ...clone(P), retireYearB: y };
      const c = orc(P, R)[y] || { trad: 0, roth: 0 };
      nTw++;
      for (const [roth, pre] of (POST ? COMBOS : [[0, "base"]])) {
        load(g, PX, X); const x = runAll(g, E, roth, pre, R); load(g, PY, X); const yy = runAll(g, E, roth, pre, R); nTwCase++;
        const tag = `${nm} y=${y} @${roth}/${pre}`;
        if (!POST) { const dx = x.D.find(r => r.yr === y), dy = yy.D.find(r => r.yr === y);
          kd.push({ dT: dx.tradNotional - dy.tradNotional, rsbB: x.rsb.tradInitB - yy.rsb.tradInitB, dA: x.A[0].wealthByYr[R] - yy.A[0].wealthByYr[R] }); continue; }
        // every year before y identical in every engine (and y's own row in Engines B and C: the money lands at the year's end)
        const pre_ = ["B", "C"].filter(k => canon(x[k].filter(r => r.yr <= y)) !== canon(yy[k].filter(r => r.yr <= y)))
          .concat(canon(x.D.filter(r => r.yr < y)) !== canon(yy.D.filter(r => r.yr < y)) ? ["D"] : [])
          .concat(x.A.some((s, i) => Object.keys(s.wealthByYr).some(k => Number(k) < y && s.wealthByYr[k] !== yy.A[i].wealthByYr[k])) ? ["A"] : [])
          .concat(canon(x.rsb) !== canon(yy.rsb) || canon(x.open) !== canon(yy.open) ? ["start"] : []);
        if (pre_.length && bad.pre.length < 4) bad.pre.push(`${tag}: ${pre_.join(",")}`);
        // Engine D, year y: Traditional, Roth and the buckets rise by exactly the contribution
        const dx = x.D.find(r => r.yr === y), dy = yy.D.find(r => r.yr === y);
        const bk = r => r.b1 + r.b2 + r.b3 + r.b4;
        if (!(dx && dy && near(dx.tradNotional - dy.tradNotional, c.trad, 0.01) && near(dx.rothNotional - dy.rothNotional, c.roth, 0.01) && near(bk(dx) - bk(dy), c.trad + c.roth, 0.01)) && bad.D.length < 4)
          bad.D.push(`${tag}: ΔT ${dx && (dx.tradNotional - dy.tradNotional).toFixed(2)} ΔR ${dx && (dx.rothNotional - dy.rothNotional).toFixed(2)} Δbk ${dx && (bk(dx) - bk(dy)).toFixed(2)} want ${c.trad}/${c.roth}`);
        // Engine A, year y: both strategies' wealth rises by the contribution (its rows are whole dollars)
        if (!x.A.every((s, i) => y in s.wealthByYr && Math.abs((s.wealthByYr[y] - yy.A[i].wealthByYr[y]) - (c.trad + c.roth)) <= 1) && bad.A.length < 4)
          bad.A.push(`${tag}: ΔA ${x.A.map((s, i) => s.wealthByYr[y] - yy.A[i].wealthByYr[y]).join("/")} want ${c.trad + c.roth}`);
        // Engines B and C, year y+1: B's RMD rises by the Traditional part ÷ the divisor, when B is alive and at RMD age; otherwise not at all
        const dB = tl.dobB.year, age = y + 1 - dB, alive = y + 1 < dB + tl.lifeExpB;
        const wantR = alive && age >= rmdStart(dB) && ULT[age] ? c.trad / ULT[age] : 0;
        const r1 = k => { const a = x[k].find(r => r.yr === y + 1), b = yy[k].find(r => r.yr === y + 1); return a && b ? a.rmd_y - b.rmd_y : NaN; };
        if (wantR > 0) rmdHits++;
        if (!(near(r1("B"), wantR, 0.01) && near(r1("C"), wantR, 0.01)) && bad.rmd.length < 4) bad.rmd.push(`${tag}: ΔRMD B ${r1("B")} C ${r1("C")} want ${wantR.toFixed(4)} (age ${age})`);
        // Engines B and C agree on B's Traditional: their RMD rises match in every year
        const dis = x.B.filter(r => { const rc = x.C.find(q => q.yr === r.yr), yb = yy.B.find(q => q.yr === r.yr), yc = yy.C.find(q => q.yr === r.yr);
          return rc && yb && yc && Math.abs((r.rmd_y - yb.rmd_y) - (rc.rmd_y - yc.rmd_y)) > 0.01; });
        if (dis.length && bad.agree.length < 4) bad.agree.push(`${tag}: ${dis.slice(0, 3).map(r => r.yr).join(",")}`);
        agreeNZ += x.B.filter(r => { const yb = yy.B.find(q => q.yr === r.yr); return yb && Math.abs(r.rmd_y - yb.rmd_y) > 1; }).length;
        // Engine D's shares at most 1 in every year, where the stored bucket mix sums to 1
        const Pl = g.PORTFOLIO(), baOne = Math.abs([1, 2, 3, 4].reduce((s, b) => s + (Pl.bucketActuals[b] || 0), 0) - 1) < 1e-9;
        if (baOne && x.D.some(r => r.tradNotional + r.rothNotional > bk(r) * (1 + 1e-12) + 0.01) && bad.shares.length < 4) bad.shares.push(tag);
      }
      if (!POST) continue;
      // the Monte Carlo's planned path: identical before a quarter of year y, then moving
      const mcPath = Pp => { load(g, Pp, X); let s = 1; const r = g.runExtendedMC(R, 30, 1, { rng: () => (s = (s * 16807) % 2147483647) / 2147483647 }); return r.plannedPath; };
      const px = mcPath(PX), py = mcPath(PY); load(g, PX, X); const tlX = g.PLAN_TIMELINE();
      const i0 = px.findIndex((v, i) => v !== py[i]); mcN++;
      if (!(i0 > 0 && g.mcQuarterDate(tlX, i0 - 1).calYear === y) && bad.mc.length < 4) bad.mc.push(`${nm} y=${y}: first moves at index ${i0} (${i0 > 0 ? g.mcQuarterDate(tlX, i0 - 1).calYear : "—"})`);
    }
  }
  if (POST) {
    T(`B-2 the twin pairs (${nTw} pairs on ${LATER.length} later-B plans, × $0/$70K/$250K BASE and $70K BULL — ${nTwCase} cases): every engine's rows before the year that differs are identical, and the retirement-start balances too (B stops at A's year)`, nTw >= LATER.length * 2 && bad.pre.length === 0, bad.pre.join(" | "));
    T("B-3 …in that year Engine D's Traditional, Roth and buckets rise by exactly that year's contribution (face value, end of year)", bad.D.length === 0, bad.D.join(" | "));
    T("B-4 …and Engine A's wealth, for a fixed amount and for filling the 22% bracket, rises by exactly the contribution, to the dollar", bad.A.length === 0, bad.A.join(" | "));
    T(`B-5 …Engines B and C do not move in that year, and the next year B's RMD rises by exactly the Traditional part ÷ the IRS divisor at B's age — zero before B's RMD age (${rmdHits} cases with B at RMD age)`,
      bad.rmd.length === 0 && rmdHits >= 8, bad.rmd.join(" | "));
    // Engines B and C publish no balance; B's RMD is where B's Traditional shows, so the agreement is read there (the build review: it is 0 = 0
    // before B's RMD age, so the count of years where it moves is required too)
    T(`B-6 …Engines B and C agree on that rise in every year — B's Traditional, read through B's RMD, the same in both (${agreeNZ} case-years where it moves by more than $1)`,
      bad.agree.length === 0 && agreeNZ >= 100, bad.agree.join(" | "));
    T(`B-7 …the Monte Carlo's planned path first moves in a quarter of that same year (${mcN} pairs): every projection adds B's later contributions in the same years`, bad.mc.length === 0 && mcN === nTw, bad.mc.join(" | "));
    T("B-8 Engine D's Traditional and Roth shares sum to at most 1 in every year of every case", bad.shares.length === 0, bad.shares.join(" | "));
    // (3) once B has died nothing is added: B retiring in 2035 or in 2032 (B dies at the end of 2031) gives the same plan everywhere
    const { P: Pd, R: Rd, X: Xd } = prep(g, LATER.find(c => c[0] === "B dies before retiring")[1]);
    load(g, { ...clone(Pd), retireYearB: 2035 }, Xd); const d1 = runAll(g, E, 70000, "base", Rd); load(g, { ...clone(Pd), retireYearB: 2032 }, Xd); const d2 = runAll(g, E, 70000, "base", Rd);
    const dk = ["B", "C", "D", "open", "rsb", "S"].filter(k => canon(d1[k]) !== canon(d2[k])).concat(canon(d1.A.map(s => s.wealthByYr)) !== canon(d2.A.map(s => s.wealthByYr)) ? ["A"] : []);
    T("B-9 once B has died nothing more is added: B (dying at the end of 2031) set to retire in 2035 or in 2032 gives the same plan in Engines A–D, the start balances and the Monte Carlo's tax schedule, to the bit",
      dk.length === 0 && Object.keys(orc({ ...Pd, retireYearB: 2035 }, Rd)).map(Number).pop() === 2031, dk.join(","));
  } else {
    const k0 = kd[0] || {};
    T(`${"B-1"} ${KD71} the example with B working six more years: B's 2031 contribution never reaches Engine D (ΔTraditional in 2031 $${(k0.dT || 0).toFixed(2)}), while the start balance Engines A–C read already holds it ($${(k0.rsbB || 0).toFixed(2)} more Traditional), so Engine A's 2029 wealth is $${Math.round(k0.dA || 0)} higher, two years before it is made`,
      kd.length === 1 && near(k0.dT, 0, 1e-9) && near(k0.rsbB, 24000, 1e-6) && k0.dA > 30000, JSON.stringify(k0));
  }
  load(g, P0);
}

// ── §C · bit-identity where B does not retire later ───────────────────────────────────────────────────────────────
console.log("  C — bit-identity where B does not retire later");
if (POST && existsSync(join(HERE, `app_${C_PRIOR}.mjs`))) {
  const PM = await import(pathToFileURL(join(HERE, `app_${C_PRIOR}.mjs`)).href); const pg = PM.__g, pe = PM.__engines;
  const diffs = []; let n = 0;
  for (const [nm, f] of NOTLATER) {
    for (const [roth, pre] of [[0, "base"], [70000, "base"], [250000, "bull"]]) {
      const run = (G, Eng) => { const { R } = prep(G, f); const o = runAll(G, Eng, roth, pre, R); delete o.tl;
        o.start = G.retireStartToday(R); o.A = o.A.map(s => { const z = { ...s }; return z; });
        if (roth === 0) { const s1 = mulberry(4242); o.mcX = (({ success, p50, p10, plannedPath }) => ({ success, p50, p10, plannedPath }))(G.runExtendedMC(R, 30, 150, { rng: s1 }));
          _src = mulberry(77); const m = G.runMonteCarlo(R, 150); o.mc = (({ results, plannedPath }) => ({ results, plannedPath }))(m); _src = mulberry(108); }
        return o; };
      const a = run(g, E), b = run(pg, pe); n++;
      // D-73 moves the single fixture's two Monte Carlo runs (it keeps the example's $350 a month for B) — §E pins that; the rest must match
      const k = Object.keys(a).filter(x => !(nm === "single fixture" && ["mcX", "mc"].includes(x)) && canon(a[x]) !== canon(b[x]));
      if (k.length) diffs.push(`${nm}@${roth}/${pre}: ${k.join(",")}`);
    }
  }
  T(`C-1 ${NOTLATER.length} plans where B does not retire later (the example, B retiring first, the single fixture and ${NOTLATER.length - 3} fixtures as they stand) × $0 BASE, $70K BASE, $250K BULL (${n} cases): Engines A–D, the bridge, the start balances, the Monte Carlo's tax schedule, both seeded Monte Carlo engines and the What Breaks / Backtest start are v6.43's, to the bit`,
    n === NOTLATER.length * 3 && diffs.length === 0, diffs.slice(0, 4).join(" | "));
  load(g, P0); load(pg, P0);
  if (existsSync(join(HERE, `dom_${C_PRIOR}.cjs`))) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), C_PRIOR, "--dumpdom"], { cwd: HERE, encoding: "utf8", timeout: 900000, maxBuffer: 1 << 27 });
    const m = (r.stdout || "").match(/@@DUMP@@([\s\S]*)@@END@@/);
    const prior = m ? JSON.parse(m[1]) : null;
    const app = await mountApp(VER), cur = {};
    for (const [nm, P] of DOM_PLANS(app.DP0)) for (const tab of DOM_TABS) { _src = mulberry(108); cur[`${nm}|${tab}`] = await app.visit(tab, P); }
    await app.unmount();
    const dk = prior ? Object.keys(cur).filter(k => normVer(cur[k]) !== normVer(prior[k] || "")) : ["(no dump)"];
    const firstDiff = k => { const a = normVer(cur[k]), b = normVer(prior[k] || ""); let i = 0; while (i < a.length && a[i] === b[i]) i++; return `${k} @${i}: …${a.slice(Math.max(0, i - 60), i + 80)}… vs …${b.slice(Math.max(0, i - 60), i + 80)}…`; };
    T(`C-2 rendered, where B does not retire later (the example; B retiring first): the Roth tab (its ladder and RMD cards), What Breaks, Backtest and the Withdrawal tab are v6.43's text, save the version string (${Object.keys(cur).length} views)`,
      !!prior && Object.keys(cur).length === DOM_PLANS(P0).length * DOM_TABS.length && Object.keys(cur).every(k => cur[k].length > 2000) && dk.length === 0,
      prior ? dk.slice(0, 2).map(firstDiff).join(" | ") : (r.stderr || r.stdout || "").slice(-300));
  } else console.log(`     (§C-2: no dom_${C_PRIOR}.cjs in this run folder — skipped)`);
} else console.log(`     (§C: ${POST ? `no app_${C_PRIOR}.mjs in this run folder — skipped` : "the v6.43 leg has nothing to compare with — skipped"})`);

// ── §D · hand pins ──────────────────────────────────────────────────────────────────────────────────────────────
console.log("  D — hand pins");
{
  // the example (as of 2026-04-18, A and B retiring in 2029, Traditional only at $2,500 and $350 a month) with B working to 2035 at $2,000
  // pre-tax and $500 Roth a month
  const ex6 = LATER.find(c => c[0] === "example, B +6y, $2,000 + $500 Roth/mo")[1];
  const P6 = ex6(clone(P0)); const tl6 = load(g, P6), R6 = tl6.targetRetireYear, rsb6 = g.retireStartBalances(R6);
  T(`D-0 SETUP: the plan is as of 2026, A retires in 2029, B in 2035 (got ${tl6.asOfYear}, ${R6}, ${tl6.targetRetireYearB})`, tl6.asOfYear === 2026 && R6 === 2029 && tl6.targetRetireYearB === 2035);
  if (POST) {
    const s6 = g.laterBContribSeries(2029);
    T("D-1 B's later contributions: 2029 through 2034, $24,000 Traditional ($2,000 × 12) and $6,000 Roth ($500 × 12) each year, $180,000 in all",
      canon(Object.keys(s6)) === canon(["2029", "2030", "2031", "2032", "2033", "2034"]) && Object.values(s6).every(v => v.trad === 24000 && v.roth === 6000) && g.laterBTotal(2029) === 180000);
    T(`D-2 the retirement-start balances carry B's contributions only to 2029: 3 years × $24,000 = $72,000 Traditional and 3 × $6,000 = $18,000 Roth (got $${rsb6.accTradB} / $${rsb6.accRothB})`,
      rsb6.accTradB === 72000 && rsb6.accRothB === 18000);
    T("D-3 the selector a year later (2030) starts B's later years in 2030; a year earlier (2028) in 2028",
      Object.keys(g.laterBContribSeries(2030))[0] === "2030" && Object.keys(g.laterBContribSeries(2028))[0] === "2028" && g.laterBTotal(2028) === 210000);
    // Engine D's 2029 buckets against the same plan with B retiring in 2029: the $30,000 placed by the example's contribution mix (VTI 50%,
    // VXUS 15%, VWO 5%, BND 30% → bonds 30%, equities 70%)
    load(g, P6); const w6 = g.computeWithdrawalPlan({ retireYear: 2029, rothAmount: 70000, scenarioPreset: "base" }).schedule.find(r => r.yr === 2029);
    load(g, { ...clone(P6), retireYearB: 2029 }); const w0 = g.computeWithdrawalPlan({ retireYear: 2029, rothAmount: 70000, scenarioPreset: "base" }).schedule.find(r => r.yr === 2029);
    T(`D-4 Engine D, end of 2029: bonds +$9,000 and equities +$21,000 (30% / 70% of $30,000), cash and hedge +$0; Traditional +$24,000, Roth +$6,000 (got ${[w6.b1 - w0.b1, w6.b2 - w0.b2, w6.b3 - w0.b3, w6.b4 - w0.b4].map(v => v.toFixed(2)).join(" / ")})`,
      near(w6.b1 - w0.b1, 0, 0.01) && near(w6.b2 - w0.b2, 9000, 0.01) && near(w6.b3 - w0.b3, 21000, 0.01) && near(w6.b4 - w0.b4, 0, 0.01)
      && near(w6.tradNotional - w0.tradNotional, 24000, 0.01) && near(w6.rothNotional - w0.rothNotional, 6000, 0.01));
    // the scope's measured figures (§0.2, on the prototype the build was verified against): IRMAA at $250K, the Withdrawal tab's end
    load(g, P6); const ser = g.withdrawalPlanSeries({ retireYear: 2029, rothAmount: 250000, scenarioPreset: "base" });
    const irm = E.computeIrmaaPlan({ retireYear: 2029, rothAmount: 250000, qcdAnnual: 0, taxYield: 2.0, ...ser }).totalIrmaaToday;
    T(`D-5 the scope's measured IRMAA at $250K a year on this plan: $24,180 in today's dollars, where v6.43 charged $26,480 (got $${Math.round(irm)})`, Math.abs(irm - 24180) < 5);
    if (existsSync(join(HERE, `app_${C_PRIOR}.mjs`))) {
      const PM = await import(pathToFileURL(join(HERE, `app_${C_PRIOR}.mjs`)).href); const pg = PM.__g;
      const endT = G => { load(G, P6); const w = G.computeWithdrawalPlan({ retireYear: 2029, rothAmount: 70000, scenarioPreset: "base" }); const r = w.schedule[w.schedule.length - 1];
        return r.portfolioTotal / Math.pow(1 + w._wInfl, r.yr - G.PLAN_TIMELINE().asOfYear); };
      const dEnd = endT(g) - endT(pg);
      T(`D-6 the scope's measured Withdrawal-tab end against v6.43, at $70K BASE: +$177,570 in today's dollars (deflated at the schedule's inflation; got +$${Math.round(dEnd)})`, Math.abs(dEnd - 177570) < 5);
      load(pg, P0);
    }
    // the build review (finding 4): a plan already retired opens with nothing planned before retirement, so What Breaks' and Backtest's start
    // note named nothing — it now names B's later contributions
    const { R: Rr } = prep(g, LATER.find(c => c[0] === "retired 2026, B to 2032, $2,000/mo")[1]);
    T(`D-7 a plan already retired (2026), B contributing to 2032: the What Breaks / Backtest start note names B's later contributions ("${g.retireStartNote(Rr)}")`,
      Rr === 2026 && g.retireStartTodayParts(Rr).contributions === 0 && g.retireStartNote(Rr) === `plus ${P0.nameB || "Spouse B"}'s contributions after retirement, added in the years they are made`);
  } else {
    T(`D-1 ${KD71} the retirement-start balances carry B's contributions to 2035: 9 years × $24,000 = $216,000 Traditional, $54,000 Roth (got $${rsb6.accTradB} / $${rsb6.accRothB})`,
      rsb6.accTradB === 216000 && rsb6.accRothB === 54000);
  }
  load(g, P0);
}

// ── §E · D-72 and D-73 ─────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — a single plan's spouse-B data");
const single = P => { P.single = true; P.nameB = ""; P.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 67 };
  P.contributions = { ...P.contributions, contribPreTaxB: 0, contribRothB: 0, spouseBMonthly: 0 }; return P; };
const rental = owner => P => { P.incomeStreams = [{ label: "Rental", kind: "rental", owner, monthly: 1500, startYear: 2029, endYear: 9999, cola: true, tax: "ordinary" }]; return P; };
const job = owner => P => { P.incomeStreams = [{ label: "Job", kind: "work", owner, monthly: 4000, startYear: 2029, endYear: 2031, cola: false, tax: "ordinary" }]; return P; };
const bcon = mo => P => { P.contributions = { ...P.contributions, contribPreTaxB: mo, contribRothB: 0, spouseBMonthly: mo }; return P; };
{
  const probe = P => { const tl = load(g, P), R = tl.targetRetireYear, o = runAll(g, E, 70000, "base", R);
    o.st = [2029, 2030, 2040].map(y => g.streamsAnnualAt(y)); o.stA = g.streamsAnnualAt(2030, { owner: "A" }); o.stB = g.streamsAnnualAt(2030, { owner: "B" });
    const s1 = mulberry(4242); const x = g.runExtendedMC(R, 30, 400, { rng: s1, taxSchedule: o.S }); o.succ = x.success; o.p50 = x.p50; delete o.tl; return o; };
  const rB = probe(rental("B")(single(clone(P0)))), rA = probe(rental("A")(single(clone(P0))));
  const jB = probe(job("B")(single(clone(P0)))), jA = probe(job("A")(single(clone(P0))));
  const fica = o => o.B.reduce((t, r) => t + (r.fica || 0), 0);
  T(`E-0 SETUP: with the rental under A the single plan has $18,000 a year from 2029 (got $${rA.st[1]}), and the job pays payroll tax ($${Math.round(fica(jA))})`, rA.st[1] === 18000 && fica(jA) > 0);
  if (POST) {
    const kR = Object.keys(rA).filter(k => canon(rA[k]) !== canon(rB[k]) && !["stA", "stB"].includes(k)), kJ = Object.keys(jA).filter(k => canon(jA[k]) !== canon(jB[k]) && !["stA", "stB"].includes(k));
    T(`E-1 D-72: a single plan with a $1,500/mo rental stored under spouse B equals the same plan with it under A — Engines A–D, the bridge, the Monte Carlo's tax schedule and a seeded Monte Carlo (${(rB.succ * 100).toFixed(2)}%), to the bit`,
      kR.length === 0, kR.join(","));
    T(`E-2 D-72: …and a $4,000/mo job stored under B is taxed as A's, payroll tax included ($${Math.round(fica(jB))} both ways)`, kJ.length === 0 && near(fica(jB), fica(jA), 1e-9), kJ.join(","));
    T("E-3 D-72: on that single plan a query for owner B finds nothing and one for owner A finds the rental", rB.stB === 0 && rB.stA === 18000);
    // a married plan is untouched: B's stream is B's, and stops at B's death (born 1966, life expectancy 87 → 2053)
    load(g, rental("B")(clone(P0)));
    T("E-4 a married plan still reads a B-owned stream as B's, and stops it at B's death (2053)", g.streamsAnnualAt(2030, { owner: "B" }) === 18000 && g.streamsAnnualAt(2030, { owner: "A" }) === 0
      && g.streamsAnnualAt(2052) > 0 && g.streamsAnnualAt(2053) === 0);
  } else {
    T(`E-1 ${KD72} the single plan's rental under B is dropped: $${rB.st[1]} a year against $${rA.st[1]} under A; the Monte Carlo ${(rB.succ * 100).toFixed(2)}% against ${(rA.succ * 100).toFixed(2)}%`,
      rB.st[1] === 0 && rA.st[1] === 18000 && rB.succ < rA.succ);
  }
  // D-73: B's stored contribution on a single plan, in both Monte Carlo engines
  const mcs = P => { const tl = load(g, P), R = tl.targetRetireYear;
    const s1 = mulberry(4242); const x = g.runExtendedMC(R, 30, 400, { rng: s1 });
    _src = mulberry(77); const m = g.runMonteCarlo(R, 400); _src = mulberry(108);
    return { x: canon({ s: x.success, p: x.p50, pp: x.plannedPath }), m: canon({ r: m.results, pp: m.plannedPath }), s: x.success }; };
  const s0 = mcs(bcon(0)(single(clone(P0)))), s5 = mcs(bcon(500)(single(clone(P0))));
  const m0 = mcs(bcon(0)(clone(P0))), m5 = mcs(bcon(500)(clone(P0)));
  T("E-5 SETUP: on a married plan B's $500 a month moves both Monte Carlo engines", m0.x !== m5.x && m0.m !== m5.m);
  if (POST) T(`E-6 D-73: on a single plan B's stored $500 a month moves neither Monte Carlo engine (extended ${(s5.s * 100).toFixed(2)}% both ways), to the bit`, s0.x === s5.x && s0.m === s5.m);
  else T(`E-6 ${KD73} on a single plan B's stored $500 a month still moves both Monte Carlo engines (extended ${(s0.s * 100).toFixed(2)}% → ${(s5.s * 100).toFixed(2)}%)`, s0.x !== s5.x && s0.m !== s5.m);
  load(g, P0);
}

// ── §F · rendered, the Field Manual and METHODOLOGY ─────────────────────────────────────────────────────────────
console.log("  F — rendered, the Field Manual and METHODOLOGY");
{
  const FM = String(g.DOCS_HTML()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (POST) {
    T("F-1 Field Manual §13: the v6.44 note comes first, before v6.43's, and names the three readings, the example unchanged, the $178,000, the selector, the wages not modeled, and D-72 / D-73",
      FM.includes("A spouse who retires later, and a single plan’s spouse-B data (v6.44).") && FM.includes("Every projection now adds them at the end of each year they are made, at their face value.")
      && FM.includes("The example is unchanged") && FM.includes("about $178,000 higher in today’s dollars") && FM.includes("Moving the retirement selector a year earlier")
      && FM.includes("The wages of a spouse who works on are not modeled") && FM.includes("now counts as yours") && FM.includes("is no longer added by the Monte Carlo")
      && FM.indexOf("spouse-B data (v6.44).") < FM.indexOf("start from (v6.43)."));
    T("F-2 Field Manual: the Withdrawal sentence and the v6.43 note say a later spouse's contributions join in the years they are made",
      FM.includes("a spouse who retires later is counted to the first retirement here, and that spouse's later contributions join at the end of each year they are made, as in every other projection")
      && FM.includes("a spouse who retires later was counted only to the first retirement (from v6.44 that spouse’s later contributions join in the years they are made)")
      && !FM.includes("the contributions after it are left out here"));
    const MP = [join(HERE, "..", "METHODOLOGY.md"), join(HERE, "METHODOLOGY.md")].find(existsSync);
    const MD = MP ? readFileSync(MP, "utf8").replace(/\s+/g, " ") : "";
    T("F-3 METHODOLOGY: the v6.44 section, and v6.43's later-spouse bullet marked superseded", !!MP && MD.includes("## A spouse who retires later, and spouse-B data on a single plan (v6.44)")
      && MD.includes("**A spouse who retires later** (DD-7)") && /Superseded at v6\.44/.test(MD.slice(MD.indexOf("**A spouse who retires later** (DD-7)"), MD.indexOf("**A spouse who retires later** (DD-7)") + 600)), MP || "no METHODOLOGY.md");
    // every string that says a later spouse is counted "only to the first retirement" also says what v6.44 does with the rest
    const lits = all(AST, n => (n.type === "Literal" && typeof n.value === "string") || n.type === "TemplateElement" || n.type === "JSXText")
      .map(x => x.n.type === "TemplateElement" ? x.n.value.cooked : x.n.value).filter(s => s && /only to the first retirement/.test(s));
    T(`F-4 no copy says a later spouse is counted only to the first retirement without saying the later contributions join in the years they are made (${lits.length} strings say it, each with v6.44's rule)`,
      lits.length >= 1 && lits.every(s => /v6\.44/.test(s.slice(s.indexOf("only to the first retirement"), s.indexOf("only to the first retirement") + 220))), lits.map(s => s.slice(0, 80)).join(" | "));
  } else {
    T(`F-1 ${KD71} the Field Manual says a later spouse's contributions after the first retirement are left out here`, FM.includes("the contributions after it are left out here"));
  }
  const app = await mountApp(VER), { DG, DP0, visit } = app;
  const nB = DP0.nameB || "Spouse B";
  const mk = rB => ({ ...clone(DP0), retireYearB: rB, contributions: { ...DP0.contributions, contribPreTaxB: 2000, contribRothB: 500, spouseBMonthly: 2500 } });
  const wd = await visit("withdrawal", mk(2035)), mc = await visit("monte carlo", mk(2035)), wb = await visit("what breaks", mk(2035));
  const note = DG.retireStartNote(2029);
  T("F-5 SETUP: the tabs rendered on the example with B working to 2035", /Section A — year-by-year operational schedule/.test(wd) && /Accumulation/.test(mc) && /edges/.test(wb));
  if (POST) {
    T("F-6 the Withdrawal tab's units note: B's contributions to 2029 in the opening, B's later ones joining at the end of each year through 2034",
      wd.includes(`plus the contributions planned before then, at their face value (${nB}'s to 2029; ${nB}'s later ones join the schedule at the end of each year they are made, through 2034 — from v6.44; through v6.43 they were left out)`));
    T("F-7 the Monte Carlo tab: B's contributions continue until 2035 — here and, from v6.44, in every other projection",
      mc.includes(`except ${nB}'s contributions, which continue until the start of 2035 — here and, from v6.44, in every other projection.`));
    // A's $2,500 × 12 × 3 = $90,000 and B's ($2,000 + $500) × 12 × 3 = $90,000, at face, deflated to today's dollars ("$166K" in the module at
    // its 2026-04-18 as-of; the rendered app's own as-of sets its figure, so the figure is read from its helper and the $180,000 checked)
    // the build review (finding 3): B dying at the end of 2031 with retirement set for 2035 — every projection adds 2029–2031 only, so the notes
    // say "through 2031", and the Monte Carlo's (which adds to B's retirement whatever her death, §4) says so
    const mkD = { ...mk(2035), lifeExpB: 66 };
    const wdD = await visit("withdrawal", mkD), mcD = await visit("monte carlo", mkD);
    T("F-6b B dying before retiring: the units note runs B's later contributions through 2031, the Monte Carlo note says the others stop there",
      wdD.includes(`${nB}'s later ones join the schedule at the end of each year they are made, through 2031 — from v6.44;`)
      && mcD.includes(`except ${nB}'s contributions, which continue until the start of 2035 here; from v6.44 every other projection adds them too, through 2031, the last year ${nB} is alive.`));
    T(`F-8 What Breaks' start names the rule: "${note.slice(0, 90)}…"`, near(DG.retireStartTodayParts(2029).contributions * Math.pow(1 + Object.values(DG.SCENARIOS()).reduce((s, sc) => s + sc.prob * sc.inflation, 0), 2029 - DG.PLAN_TIMELINE().asOfYear), 180000, 0.01)
      && note === `plus $${Math.round(DG.retireStartTodayParts(2029).contributions / 1000)}K of contributions planned before retirement (${nB}'s to 2029; ${nB}'s later ones are added in the years they are made), in today's dollars`
      && wb.includes(`today's holdings ${note}`));
    // the RMD card, to the dollar: B (born 1966) takes her first RMD at 75 in 2041 on her 31 December 2040 balance. B working to 2032 rather than
    // 2029 adds 2029–2031's $24,000, each grown at the module's BASE_GROWTH (4.5%) from the end of its year to the end of 2040, ÷ 24.6
    const rmdCard = t => { const m = t.match(/FIRST-YEAR RMDs — NO CONVERSION[^$]*\$[\d,]+ at \d+ \(\d+\)[^$]*\$([\d,]+) at 75 \(2041\)/); return m ? Number(m[1].replace(/,/g, "")) : NaN; };
    const t32 = await visit("roth", mk(2032)), t31 = await visit("roth", mk(2031)), t29 = await visit("roth", mk(2029));
    const r32 = rmdCard(t32), r29 = rmdCard(t29);
    const want = 24000 * (Math.pow(1.045, 11) + Math.pow(1.045, 10) + Math.pow(1.045, 9)) / 24.6;
    T(`F-9 the Roth tab's no-conversion RMD card for B: $24,000 × (1.045¹¹ + 1.045¹⁰ + 1.045⁹) ÷ 24.6 = $${want.toFixed(2)} more with B working to 2032 than to 2029 (got $${r32} − $${r29}; the card shows whole dollars)`,
      (typeof g.BASE_GROWTH === "function" ? g.BASE_GROWTH() : g.BASE_GROWTH) === 0.045 && Number.isFinite(r32) && Number.isFinite(r29) && Math.abs((r32 - r29) - want) <= 1);
    // the ladder: its WITH-conversion card for B reads the ladder's own 2040 row, so it carries B's later contributions only through the ladder's
    // year loop. Conversions are split between the spouses by balance, so the rise is not a closed form here — it must rise with each later year
    const withCard = t => { const m = t.match(/CONVERSION[^$]*\$[\d,]+ at \d+ \(\d+\)[^$]*\$([\d,]+) at 75 \(2041\)Combined RMDs/); return m ? Number(m[1].replace(/,/g, "")) : NaN; };
    const c29 = withCard(t29), c31 = withCard(t31), c32 = withCard(t32);
    T(`F-12 the Roth ladder carries them: B's first RMD with $70K a year converted rises as B works later — to 2029 $${c29}, 2031 $${c31}, 2032 $${c32}`,
      [c29, c31, c32].every(Number.isFinite) && c29 < c31 && c31 < c32 && c32 - c29 > 2000);
    // What Breaks and Backtest move up as B's later contributions grow (their loops are not callable from here — the controls remove the step)
    const num = (t, re) => { const m = t.match(re); return m ? Number(m[1].replace(/,/g, "")) : NaN; };
    const wbS = t => num(t, /You could spend up to ~\$([\d,]+)K\/yr/), btE = t => num(t, /ending \$([\d.]+)M real/);
    const w29 = wbS(await visit("what breaks", mk(2029))), w35 = wbS(await visit("what breaks", mk(2035)));
    const b29 = btE(await visit("backtest", mk(2029))), b35 = btE(await visit("backtest", mk(2035)));
    T(`F-10 What Breaks' spendable ceiling and Backtest's worst-start end rise with B working to 2035 rather than 2029 (~$${w29}K → ~$${w35}K a year; $${b29}M → $${b35}M real)`,
      Number.isFinite(w29) && Number.isFinite(b29) && w35 > w29 && b35 > b29);
    // D-72's labels: the Income tab of a single plan with the rental under B reads exactly as with it under A
    const sP = owner => { const P = single(clone(DP0)); return rental(owner)(P); };
    const iB = await visit("income", sP("B")), iA = await visit("income", sP("A"));
    T("F-11 D-72: the Income tab of a single plan with a rental stored under B is the same text as with it under A (the one person's name, the same figures)",
      iB === iA && iA.includes("Rental") && !iB.includes(nB), iB === iA ? "" : "differs");
  } else {
    T(`F-6 ${KD71} the Withdrawal tab's units note says B's contributions count only to 2029`, wd.includes(`at their face value (${nB}'s only to 2029)`));
  }
  await app.unmount();
}

console.log(`\nt108 SUITE (${VER}): ${pass} passed, ${fail} failed`);
finished = true;
process.exit(fail ? 1 : 0);
