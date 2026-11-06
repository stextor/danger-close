// t107_opening_balances.mjs — v6.43 (D-64, D-70; docs/SCOPE_D64_D70_V643.md, DD-1 (a) … DD-9 (a)).
//
// WHAT IT PINS.
//   D-64 · Engine D (the Withdrawal tab) filled its buckets from today's holdings, carried to retirement, but took its Traditional and Roth
//          SHARES from `retireStartBalances`, which includes the planned contributions — so the shares summed past 1 (1.068 on the example)
//          and the balance was short by every contribution. What Breaks and Backtest started from today's household, without them. From
//          v6.43 the three start with the contributions (`openingAccrual`: at face, never below 0, a later-retiring spouse B only to A's
//          retirement year — DD-7 (a)), placed by the contribution mix, else the buckets' own mix (DD-1 (a)); a one-time row before
//          retirement larger than today's money is charged against them too (DD-6 (a)); What Breaks and Backtest through one helper,
//          `retireStartToday` (DD-2 (a)); the Withdrawal tab's "Holdings, by sleeve" card shows the schedule's own opening (DD-8 (a)).
//   D-70 · On a single plan a row stored under spouse B was counted as B's, and no engine takes B's RMD on a single plan. From v6.43
//          `retireStartBalances` counts every row of a single plan as A's (DD-3 (a)); the stored owner is untouched.
//
// Both legs: node t107_opening_balances.mjs v642 | node t107_opening_balances.mjs v643. The v6.42 leg pins each defect as a dated
// [KNOWN DEFECT 2026-11-03, D-64 — flips at v6.43] or […, D-70 …]. Sections:
//   A · the source, by AST — openingAccrual / retireStartToday and who calls them; the guard; the weights; the single rule; no other
//       engine-side owner read
//   B · the extinction invariant — on every fixture household and seven built here (later retirements, an unsplit holding, B retiring after
//       A, no contribution mix, a messy bucket mix), $0/$70K/$250K, BASE/BULL: Engine D's opening Traditional, Roth and buckets equal the
//       holdings carried plus the contributions, computed HERE from the plan's own fields (not the app's helpers); Engine D's Traditional plus
//       its pool's ordinary money equals Engine C's carried Traditional less the B contributions DD-7 leaves out; the shares sum to at most 1
//   C · hand pins — the example's buckets, shares and spouse B's RMD split; DD-7's and DD-6's cases; the What Breaks / Backtest start
//   D · D-70 — a single plan with every row stored under B equals the same plan with every row under A, everywhere probed, to the bit
//   E · what does not move — plans with no contributions and a plan already retired are v6.42's to the bit (v6.43 leg, when the run folder
//       holds app_v642.mjs)
//   F · rendered — the Withdrawal tab (the sleeve card, the units note, the D-44 sentence), Backtest, What Breaks, the Monte Carlo tab, My
//       Data's accrual readout; the Field Manual; METHODOLOGY (current leg)
// Controls: qa/tools/controls_v643_opening.py (repo-only). Exits with process.exit (the rendered app leaves timers running).
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(107); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v643";
const KNOWN_VERSIONS = ["v642", "v643", "v644", "v645", "v646", "v647"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v643", "v644", "v645", "v646", "v647"].includes(VER);   // an array, so the next registration widens it
const E_PRIOR = "v642";
// v6.44 (D-71, docs/SCOPE_D71_D72_D73_V644.md): DD-7's "only to the first retirement" is replaced by the in-year rule — `retireStartBalances`
// stops B at A's year too, `laterBLeftOut` is gone, and B's later contributions join every projection in the years they are made (t108).
// The checks below that pinned DD-7's leave-out read v6.44's rule on this leg. An array, so the registrar widens it.
const D71 = ["v644", "v645", "v646", "v647"].includes(VER);        // v6.44's in-year rule — an array, so the next registration widens it (v6.45: this comment read "a constant, so the registrar cannot widen it", which was false)
const KD64 = "[KNOWN DEFECT 2026-11-03, D-64 — flips at v6.43]", KD70 = "[KNOWN DEFECT 2026-11-03, D-70 — flips at v6.43]";
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
const topFn = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
const SRCOF = n => SRC.slice(n.range[0], n.range[1]);

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T107_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t107 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const canon = v => JSON.stringify(v, (k, x) => (typeof x === "number" && !Number.isFinite(x)) ? String(x) : x);
const near = (a, b, tol = 0.005) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
console.log(`t107 — THE OPENING BALANCES (${VER})`);

const P0 = clone(g.PORTFOLIO()), X0 = clone(g.EXPENSES());
const load = (G, P, X = X0) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); return G.PLAN_TIMELINE(); };
const { HOUSEHOLDS } = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
// the plan's inflation, from the scenario table under the module's own weights (units_v630's rule — never the app's helper)
const infl = () => Object.values(g.SCENARIOS()).reduce((s, sc) => s + sc.prob * sc.inflation, 0);
const carry = (yr, asOf) => Math.pow(1 + infl(), yr - asOf);
// the one-time rows dated before `R` removed, for §B's cases (the D-44 charge is §C's)
const noPre = (X, R) => X.filter(r => !(r.freq === "once" && Number(String(r.start).slice(0, 4)) < R));
// the planned contributions to retirement, computed HERE from the plan's own fields (the v5.10 rule; DD-7 caps B at A's year when asked)
const accIndep = (P, tl, R, capB) => {
  const c = P.contributions || {}, asOf = tl.asOfYear, z = x => Math.max(0, Number(x) || 0);
  const rB0 = tl.single ? R : (tl.targetRetireYearB || R), rB = capB ? Math.min(rB0, R) : rB0;
  const yA = Math.max(0, R - asOf), yB = Math.max(0, rB - asOf);
  const bonus = (Number(c.annualBonus) || 0) * (((Number(c.bonusDeferralPct) || 0) + (Number(c.bonusMatchPct) || 0)) / 100);
  return { tradA: z(12 * (c.contribPreTaxA || 0) * yA + bonus * yA), rothA: z(12 * (c.contribRothA || 0) * yA),
           tradB: tl.single ? 0 : z(12 * (c.contribPreTaxB || 0) * yB), rothB: tl.single ? 0 : z(12 * (c.contribRothB || 0) * yB) };
};
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

// ── §A · the source, by AST ───────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source, by AST");
{
  const OA = topFn("openingAccrual"), RST = topFn("retireStartToday"), W = topFn("computeWithdrawalPlan"), RSB = topFn("retireStartBalances");
  const startDecls = all(AST, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "startBal");
  if (POST) {
    const caInOA = OA ? callsOf(OA, "contribAccrual") : [];
    T("A-1 `openingAccrual` is module-level and calls `contribAccrual` once, with `bStopsAtA: true` (DD-7 (a))", !!OA && caInOA.length === 1
      && /bStopsAtA:\s*true/.test(SRCOF(caInOA[0].n)));
    // three from the build review's fixes: `laterBLeftOut` compares the two (uncapped and capped) to say when DD-7 leaves B's contributions out
    const LB = topFn("laterBLeftOut");
    if (D71) T("A-2 `contribAccrual` is called exactly twice in the source: by `retireStartBalances` and by `openingAccrual` (v6.44: `laterBLeftOut` is gone)",
      callsOf(AST, "contribAccrual").length === 2 && !!RSB && callsOf(RSB, "contribAccrual").length === 1 && !LB);
    else T("A-2 `contribAccrual` is called exactly three times in the source: by `retireStartBalances`, by `openingAccrual`, and by `laterBLeftOut` (which only says what DD-7 leaves out)",
      callsOf(AST, "contribAccrual").length === 3 && !!RSB && callsOf(RSB, "contribAccrual").length === 1 && !!LB && callsOf(LB, "contribAccrual").length === 1
      && callsOf(LB, "openingAccrual").length === 1);
    // v6.44 (D-71): a second `contribAllocationWeights` call places a later-retiring spouse B's contributions in the years they are made
    T(`A-3 Engine D calls \`openingAccrual\` once and \`contribAllocationWeights\` ${D71 ? "twice (the opening, and from v6.44 B's later contributions)" : "once"}, and never \`contribAccrual\` directly`,
      !!W && callsOf(W, "openingAccrual").length === 1 && callsOf(W, "contribAllocationWeights").length === (D71 ? 2 : 1) && callsOf(W, "contribAccrual").length === 0);
    const guard = W ? all(W, n => n.type === "IfStatement" && /_accT\s*!==\s*0\s*\|\|\s*_accR\s*!==\s*0\s*\|\|\s*_accRaw\b/.test(SRCOF(n.test))) : [];
    const raw = W ? all(W, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "_accRaw")[0] : null;
    // the build review (finding 1): the guard also runs when `retireStartBalances` counted a contribution into the shares — a plan already
    // retired whose spouse still contributes opens with none (DD-7) but its v6.42 shares counted them
    T("A-4 Engine D's step is guarded on a contribution of either kind (`_accT !== 0 || _accR !== 0 || _accRaw`, the last from `retireStartBalances`' four accrual parts), so a plan without one runs none of it",
      guard.length === 1 && callsOf(guard[0].n.consequent, "contribAllocationWeights").length === 1
      && !!raw && ["accTradA", "accTradB", "accRothA", "accRothB"].every(f => SRCOF(raw.n.init).includes(`_rsbW.${f}`)));
    T("A-5 What Breaks and Backtest: exactly two `startBal` declarations, each `retireStartToday(retireYear)`; neither reads PORTFOLIO.household",
      startDecls.length === 2 && startDecls.every(d => d.n.init && d.n.init.type === "CallExpression" && d.n.init.callee.name === "retireStartToday"
        && !/household/.test(SRCOF(d.n.init))));
    T("A-6 `retireStartToday` takes its contributions from `openingAccrual` (one helper) and its rows from `preRetireOneTime`",
      !!RST && callsOf(topFn("retireStartTodayParts") || RST, "openingAccrual").length === 1 && callsOf(topFn("retireStartTodayParts") || RST, "preRetireOneTime").length === 1);
    // D-70: the single flag before any owner test; holdings and Other accounts mapped through one function
    const decl = nm => RSB ? all(RSB, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === nm)[0] : null;
    const pos = decl("pos"), oth = decl("oth"), sgl = decl("_single"), asA = decl("_asA");
    T("A-7 `retireStartBalances` reads the plan's single flag, and `pos` and `oth` are both mapped through `_asA` (DD-3 (a))",
      !!sgl && /PLAN_TIMELINE\.single/.test(SRCOF(sgl.n)) && !!asA && /owner\s*===\s*"B"/.test(SRCOF(asA.n))
      && !!pos && /\.map\(_asA\)$/.test(SRCOF(pos.n.init)) && !!oth && /\.map\(_asA\)$/.test(SRCOF(oth.n.init))
      && sgl.n.range[0] < pos.n.range[0]);
  } else {
    T(`A-1 ${KD64} no \`openingAccrual\`, \`retireStartToday\` or \`contribAllocationWeights\`; What Breaks and Backtest start from PORTFOLIO.household`,
      !OA && !RST && !topFn("contribAllocationWeights") && startDecls.length === 2 && startDecls.every(d => /PORTFOLIO\.household/.test(SRCOF(d.n.init))));
    T(`A-2 ${KD70} \`retireStartBalances\` tests owners without the plan's single flag`, !!RSB && !/PLAN_TIMELINE\.single/.test(SRCOF(RSB)));
  }
  // no engine-side owner read outside retireStartBalances (both legs: it was true at v6.42 too, and the D-70 rule depends on it)
  const ENG = ["computeWithdrawalPlan", "computeTaxPlan", "computeIrmaaPlan", "runRothStrategies", "runMonteCarlo", "runExtendedMC", "carryStartBalances"];
  const ownerReads = ENG.flatMap(nm => { const f = topFn(nm); return f ? all(f, n => n.type === "MemberExpression" && !n.computed && n.property.name === "owner") : []; });
  T("A-8 no engine reads a row's `owner` itself — `retireStartBalances` is the one engine-side reader (the pension's owner comes through `getPensionOwner`)",
    ENG.every(nm => !!topFn(nm)) && ownerReads.length === 0, String(ownerReads.length));
}

// ── §B · the extinction invariant ──────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the extinction invariant");
const CASES = [["example", P => P]]
  .concat(Object.keys(HOUSEHOLDS).map(n => [n, P => { HOUSEHOLDS[n].apply(P); return P; }]))
  .concat([
    ["retire2035", P => { P.dobA = "1970-01-01"; P.dobB = "1972-01-01"; P.retireYear = 2035; return P; }],
    ["retire2041", P => { P.dobA = "1976-01-01"; P.dobB = "1978-01-01"; P.retireYear = 2041; return P; }],
    // an UNSPLIT holding — Traditional halved, no Roth, so the holdings' own split fraction is 0.395 and the contributions raise it
    ["unsplit", P => { P.positions = P.positions.map(q => ({ ...q, trad: (q.trad || 0) / 2, roth: 0 })); return P; }],
    // spouse B retires five years after A (DD-7)
    ["laterB", P => { P.retireYearB = 2034; return P; }],
    // no contribution mix set: the buckets' own mix (DD-1 (a))
    ["noMix", P => { P.contributions = { ...P.contributions, allocations: {} }; return P; }],
    // a stored bucket mix that does not sum to 1, and no contribution mix (the weights must still sum to 1)
    ["messyMix", P => { P.bucketActuals = { 1: 0.1, 2: 0.3, 3: 0.57, 4: 0 }; P.contributions = { ...P.contributions, allocations: {} }; return P; }],
    // Roth contributions and a bonus deferral
    ["rothBonus", P => { P.contributions = { ...P.contributions, contribRothA: 500, contribRothB: 100, annualBonus: 20000, bonusDeferralPct: 10, bonusMatchPct: 5 }; return P; }],
    // A retired in the as-of year, B still contributing $2,000 a month to 2032: Engine D opens with none of B's (DD-7), and the shares must
    // be the holdings' own (the build review's finding 1; the first v6.43 build kept v6.42's shares here, summing to 1.16)
    ["retiredLaterB", P => { P.retireYear = 2026; P.retireYearB = 2032; P.contributions = { ...P.contributions, contribPreTaxB: 2000 }; return P; }],
  ]);
let nB = 0, nBreach = 0, nBodd = []; const bBad = [];
{
  for (const [name, f] of CASES) {
    const P = f(clone(P0));
    let tl = load(g, P); const R = tl.targetRetireYear;
    tl = load(g, P, noPre(X0, R));
    const Pl = g.PORTFOLIO(), asOf = tl.asOfYear, rb = carry(R, asOf);
    // the buckets hold Σ bucketActuals × total401k today — less than total401k when a stored mix sums below 1 (the loader renormalises only
    // below 0.95). Such a plan's shares can pass 1 with or without contributions (a stored-data inconsistency, out of scope — scope §4), so
    // the at-most-1 check applies only where the mix sums to 1.
    const baSum = [1, 2, 3, 4].reduce((s, b) => s + (Pl.bucketActuals[b] || 0), 0), baOne = Math.abs(baSum - 1) < 1e-9;
    const tH = Pl.positions.reduce((s, q) => s + (q.trad || 0), 0), rH = Pl.positions.reduce((s, q) => s + (q.roth || 0), 0);
    const othOrd = (Pl.otherAccounts || []).filter(a => ["trad", "annuity"].includes(a.taxType)).reduce((s, a) => s + (a.balance || 0), 0);
    const othRoth = (Pl.otherAccounts || []).filter(a => a.taxType === "roth").reduce((s, a) => s + (a.balance || 0), 0);
    const a = accIndep(Pl, tl, R, true), aFull = accIndep(Pl, tl, R, false);
    const accT = a.tradA + a.tradB, accR = a.rothA + a.rothB, acc = accT + accR;
    for (const roth of [0, 70000, 250000]) for (const pre of ["base", "bull"]) {
      const o = g.computeWithdrawalPlan({ retireYear: R, rothAmount: roth, scenarioPreset: pre })._opening;
      const bk = o.b1 + o.b2 + o.b3 + o.b4, dT = bk * o.tradFrac, dR = bk * o.rothFrac, shares = o.tradFrac + o.rothFrac;
      nB++;
      if (POST) {
        const rsb = g.retireStartBalances(R), cs = g.carryStartBalances(rsb, rb);
        // v6.44 (D-71): `retireStartBalances` stops B at A's year too, so Engine C's carried balances leave out the same later contributions
        const lT = D71 ? 0 : aFull.tradB - a.tradB, lR = D71 ? 0 : aFull.rothB - a.rothB;
        const cT = cs.tradInitA + cs.tradInitB - lT, cR = cs.rothInitA + cs.rothInitB - lR;
        const ok = near(bk, baSum * Pl.total401k * rb + acc, 0.01) && near(dT, tH * rb + accT, 0.01) && near(dR, rH * rb + accR, 0.01)
          && near(dT + o.taxOrd, cT, 0.01) && near(dR + othRoth * rb, cR, 0.01) && near(o.taxOrd, othOrd * rb, 0.01) && (!baOne || shares <= 1 + 1e-12);
        if (!ok) { nBreach++; if (bBad.length < 4) bBad.push(`${name}@${roth}/${pre}: bk ${bk.toFixed(2)} vs ${(baSum * Pl.total401k * rb + acc).toFixed(2)}, T ${dT.toFixed(2)} vs ${(tH * rb + accT).toFixed(2)}, R ${dR.toFixed(2)} vs ${(rH * rb + accR).toFixed(2)}, C ${(dT + o.taxOrd).toFixed(2)} vs ${cT.toFixed(2)}, shares ${shares}`); }
      } else if (baOne && acc > 0 && shares > 1 + 1e-9) nBodd.push(name);
    }
  }
  if (POST) {
    T(`B-1 on ${CASES.length} plans × $0/$70K/$250K × BASE/BULL (${nB} cases): Engine D's opening buckets, Traditional and Roth are the holdings carried plus the contributions (computed here from the plan's fields); its Traditional plus its pool's ordinary money is Engine C's carried Traditional less the B contributions DD-7 leaves out, and its Roth plus the pool's Other-account Roth is Engine C's Roth likewise, to the cent; the shares sum to at most 1 wherever the stored mix sums to 1`,
      nB === CASES.length * 6 && nBreach === 0, bBad.join(" | "));
    // anti-vacuity: the cases reach what they are there for
    const reach = {};
    for (const nm of ["unsplit", "laterB", "messyMix", "noMix", "retiredLaterB"]) { const P = CASES.find(c => c[0] === nm)[1](clone(P0)); const tl = load(g, P); const R = tl.targetRetireYear;
      const o = g.computeWithdrawalPlan({ retireYear: R, rothAmount: 0, scenarioPreset: "base" })._opening; reach[nm] = { s: o.tradFrac + o.rothFrac, acc: o.accrual, fullB: accIndep(g.PORTFOLIO(), tl, R, false).tradB }; }
    T(`B-2 SETUP: the unsplit plan's shares sum below 1 but above its holdings' own 0.395 (${reach.unsplit.s.toFixed(4)}); the later-B plan has $${reach.laterB.fullB} of B contributions to 2034, of which Engine D opens with $12,600 (total $${reach.laterB.acc}); the messy and no-mix plans carry contributions; the retired plan's spouse contributes $${reach.retiredLaterB.fullB} after it, and Engine D opens with $${reach.retiredLaterB.acc}`,
      reach.unsplit.s < 0.5 && reach.unsplit.s > 0.395 && reach.laterB.fullB === 33600 && reach.laterB.acc === 102600 && reach.messyMix.acc > 0 && reach.noMix.acc > 0
      && reach.retiredLaterB.fullB === 144000 && reach.retiredLaterB.acc === 0, JSON.stringify(reach));
  } else {
    T(`B-1 ${KD64} on every plan with contributions the shares sum past 1 (${nBodd.length / 6} of ${CASES.length} plans; the example 1.068)`,
      nBodd.length > 0 && nBodd.includes("example") && nBodd.includes("retire2041"), nBodd.join(","));
  }
  load(g, P0);
}

// ── §C · hand pins ─────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — hand pins");
{
  const tl = load(g, P0), R = tl.targetRetireYear, rb = carry(R, tl.asOfYear);
  const o = g.computeWithdrawalPlan({ retireYear: R, rothAmount: 70000, scenarioPreset: "base" })._opening;
  const bk = o.b1 + o.b2 + o.b3 + o.b4;
  // typed from the example: holdings $1,500,000 (Traditional $1,185,000, Roth $315,000; spouse B's Traditional $140,000 + $45,000);
  // contributions $2,500 × 12 × 3 (A) and $350 × 12 × 3 (B) = $102,600, all Traditional; the carry 2026 → 2029 under the module's BASE
  T(`C-0 SETUP: the example retires in 2029 from 2026, the carry is 1.08447 (got ${rb.toFixed(7)})`, R === 2029 && tl.asOfYear === 2026 && near(rb, 1.0844728, 5e-7));
  if (POST) {
    T(`C-1 the example's opening buckets: $1,500,000 × ${rb.toFixed(7)} + $102,600 = $1,729,309 (got $${bk.toFixed(2)})`, Math.round(bk) === 1729309 && near(bk, 1500000 * rb + 102600, 0.01));
    T(`C-2 the shares: Traditional (1,185,000 × carry + 102,600) ÷ buckets = 0.802459, Roth 0.197541, together 1 (got ${o.tradFrac.toFixed(6)} / ${o.rothFrac.toFixed(6)})`,
      o.tradFrac.toFixed(6) === "0.802459" && o.rothFrac.toFixed(6) === "0.197541" && near(o.tradFrac + o.rothFrac, 1, 1e-12));
    const fb = (185000 * rb + 12600) / (1185000 * rb + 102600);
    T(`C-3 spouse B's part of the Traditional (which splits the RMD): (185,000 × carry + 12,600) ÷ (1,185,000 × carry + 102,600) = ${fb.toFixed(6)} (got ${o.fracB.toFixed(6)})`,
      near(o.fracB, fb, 1e-12));
    T("C-4 the contributions are placed by the example's contribution mix (VTI 50%, VXUS 15%, VWO 5%, BND 30% → bonds 30%, equities 70%)",
      near(o.b2 - 450000 * rb, 0.3 * 102600, 0.01) && near(o.b3 - 900000 * rb, 0.7 * 102600, 0.01) && near(o.b1 - 150000 * rb, 0, 0.01) && near(o.b4, 0, 0.01));
    // DD-7: spouse B retires in 2034 — only 2026-2028 of B's contributions open in 2029
    load(g, { ...clone(P0), retireYearB: 2034 });
    const oB = g.computeWithdrawalPlan({ retireYear: 2029, rothAmount: 0, scenarioPreset: "base" })._opening;
    const rsbB = g.retireStartBalances(2029);
    if (D71) T(`C-5 DD-7, and from v6.44 Engines A–C too: with spouse B retiring in 2034, every start carries B's $12,600 to 2029 (B's later contributions join in the years they are made, t108) (got $${oB.accrual}; B's accrual $${rsbB.accTradB})`,
      oB.accrual === 102600 && rsbB.accTradB === 12600 && near(oB.b1 + oB.b2 + oB.b3 + oB.b4, 1500000 * rb + 102600, 0.01));
    else T(`C-5 DD-7: with spouse B retiring in 2034, Engine D opens with B's $12,600 to 2029, not the $33,600 to 2034 that Engines A–C carry (got $${oB.accrual} against $${(rsbB.accTradA || 0) + (rsbB.accTradB || 0)})`,
      oB.accrual === 102600 && rsbB.accTradB === 33600 && near(oB.b1 + oB.b2 + oB.b3 + oB.b4, 1500000 * rb + 102600, 0.01));
    // DD-6: holdings $150,000, no Other accounts, a $200,000 one-time row in June 2028
    const small = clone(P0); small.positions = small.positions.map(q => ({ ...q, balance: q.balance / 10, trad: (q.trad || 0) / 10, roth: (q.roth || 0) / 10 }));
    small.otherAccounts = []; small.total401k = 150000; small.household = 150000;
    const Xs = X0.concat([{ cat: "Housing", label: "Roof", amount: 200000, freq: "once", start: "2028-06", end: "2028-06", deductible: false, phase: "pre" }]);
    load(g, small, Xs);
    const oS = g.computeWithdrawalPlan({ retireYear: 2029, rothAmount: 0, scenarioPreset: "base" })._opening;
    const wantS = 102600 - 50000 * rb;   // $150,000 of the row from today's money; the $50,000 left, carried, from the contributions
    T(`C-6 DD-6: a $200,000 row before retirement against $150,000 of holdings: the $50,000 left (× carry = $${(50000 * rb).toFixed(2)}) comes out of the $102,600 of contributions — buckets $${wantS.toFixed(2)} (got $${(oS.b1 + oS.b2 + oS.b3 + oS.b4).toFixed(2)})`,
      near(oS.b1 + oS.b2 + oS.b3 + oS.b4, wantS, 0.01) && near(oS.preLeft, 50000, 0.01));
    T(`C-7 …and What Breaks and Backtest start from $150,000 + $102,600 ÷ carry − $200,000 = $${(150000 + 102600 / rb - 200000).toFixed(2)} (got $${g.retireStartToday(2029).toFixed(2)})`,
      near(g.retireStartToday(2029), 150000 + 102600 / rb - 200000, 0.01));
    load(g, P0);
    T(`C-8 the example's What Breaks / Backtest start: $1,647,000 + $102,600 ÷ carry = $1,741,608 (got $${g.retireStartToday(2029).toFixed(2)})`,
      Math.round(g.retireStartToday(2029)) === 1741608 && g.retireStartNote(2029) === "plus $95K of contributions planned before retirement, in today's dollars");
    // a negative entry adds nothing
    load(g, { ...clone(P0), contributions: { ...P0.contributions, contribPreTaxA: -1000 } });
    const oN = g.computeWithdrawalPlan({ retireYear: 2029, rothAmount: 0, scenarioPreset: "base" })._opening;
    T(`C-9 a negative contribution adds nothing (A at −$1,000 a month): the opening carries only B's $12,600 (got $${oN.accrual})`, oN.accrual === 12600);
    load(g, P0);
  } else {
    T(`C-1 ${KD64} the example's opening buckets are today's holdings carried, $1,626,709, without the $102,600 (got $${bk.toFixed(2)}); its shares sum to 1.0684`,
      Math.round(bk) === 1626709 && o.tradFrac.toFixed(4) === "0.8584" && o.rothFrac.toFixed(4) === "0.2100");
  }
}

// ── §D · D-70 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  D — a single plan's accounts are the one person's");
{
  const mk = owner => { const P = clone(P0); P.single = true; P.nameB = ""; P.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 67 };
    P.positions = P.positions.map(q => ({ ...q, owner: q.owner === "B" ? owner : q.owner })); P.otherAccounts = P.otherAccounts.map(a => ({ ...a, owner: a.owner === "B" ? owner : a.owner })); return P; };
  const probe = P => { const tl = load(g, P), R = tl.targetRetireYear, out = {};
    for (const roth of [0, 70000]) {
      out["W" + roth] = g.computeWithdrawalPlan({ retireYear: R, rothAmount: roth, scenarioPreset: "base" }).schedule;
      const ser = g.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: "base" });
      out["B" + roth] = E.computeTaxPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows;
      out["C" + roth] = E.computeIrmaaPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows;
      out["S" + roth] = g.mcIncomeTaxSchedule(R, { rothAmount: roth });
    }
    out.rsb = g.retireStartBalances(R); return out; };
  const keepB = probe(mk("B")), asA = probe(mk("A"));
  const rmd = o => o.W0.reduce((s, r) => s + (r.rmd_y || 0), 0);
  T("D-0 SETUP: the plan is single, and the stale-owner plan really stores rows under B", mk("B").single === true && mk("B").positions.some(q => q.owner === "B")
    && mk("B").otherAccounts.some(a => a.owner === "B") && !mk("A").positions.some(q => q.owner === "B"));
  if (POST) {
    const same = ["W0", "W70000", "B0", "B70000", "C0", "C70000", "S0", "S70000", "rsb"].filter(k => canon(keepB[k]) !== canon(asA[k]));
    T(`D-1 a single plan with every row stored under spouse B gives Engine D's schedule, Engines B and C's rows, the Monte Carlo's tax schedule and the opening balances of the same plan with every row under A, to the bit (lifetime RMDs $${Math.round(rmd(keepB))})`,
      same.length === 0 && keepB.rsb.tradInitB === 0 && keepB.rsb.rothInitB === 0, same.join(","));
  } else {
    T(`D-1 ${KD70} rows stored under B are counted as spouse B's ($${keepB.rsb.tradInitB} Traditional) and no RMD is taken on them: lifetime RMDs $${Math.round(rmd(keepB))} against $${Math.round(rmd(asA))} with owners A`,
      keepB.rsb.tradInitB === 206000 && Math.round(rmd(keepB)) === 262395 && Math.round(rmd(asA)) === 305824);
  }
  // a married plan still splits by owner (the rule is single-only), on both legs
  const tlm = load(g, P0); const rm = g.retireStartBalances(tlm.targetRetireYear);
  T("D-2 a married plan still splits by stored owner: the example's spouse B holds $218,600 of Traditional (positions $185,000 + her accrual $12,600 + her Other accounts $21,000)",
    rm.tradInitB === 218600);
}

// ── §E · what does not move ────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — what does not move");
if (POST && existsSync(join(HERE, `app_${E_PRIOR}.mjs`))) {
  const PM = await import(pathToFileURL(join(HERE, `app_${E_PRIOR}.mjs`)).href); const pg = PM.__g, pe = PM.__engines;
  const zero = P => { P.contributions = { ...P.contributions, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, annualBonus: 0, monthly401k: 0, spouseBMonthly: 0 }; return P; };
  const EC = [["example, no contributions", P => zero(P)], ["single, no contributions", P => { HOUSEHOLDS.single.apply(P); return zero(P); }],
    ["retired in its as-of year", P => { P.retireYear = 2026; return P; }]]
    .concat(Object.keys(HOUSEHOLDS).map(n => [`${n}, no contributions`, P => { HOUSEHOLDS[n].apply(P); return zero(P); }]));
  const diffs = []; let n = 0;
  for (const [nm, f] of EC) {
    const P = f(clone(P0));
    for (const roth of [0, 70000]) {
      const run = (G, Eng) => { const tl = load(G, P), R = tl.targetRetireYear; const w = G.computeWithdrawalPlan({ retireYear: R, rothAmount: roth, scenarioPreset: "base" });
        const o = { ...w._opening }; delete o.accrual; delete o.preLeft; delete o.fracB;
        const ser = G.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: "base" });
        return { W: w.schedule, o, B: Eng.computeTaxPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows,
          C: Eng.computeIrmaaPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows, S: G.mcIncomeTaxSchedule(R, { rothAmount: roth }),
          start: G.retireStartToday ? G.retireStartToday(R) : Math.max(0, G.PORTFOLIO().household - G.preRetireOneTime(R)) }; };
      const a = run(g, E), b = run(pg, pe); n++;
      const k = ["W", "o", "B", "C", "S", "start"].filter(x => canon(a[x]) !== canon(b[x]));
      if (k.length) diffs.push(`${nm}@${roth}: ${k.join(",")}`);
    }
  }
  T(`E-1 plans with no planned contributions (the example, a single plan, ${Object.keys(HOUSEHOLDS).length} fixtures) and a plan already retired: Engine D's schedule and opening, Engines B and C, the Monte Carlo's tax schedule and the What Breaks / Backtest start are v6.42's to the bit (${n} cases)`,
    n === EC.length * 2 && diffs.length === 0, diffs.slice(0, 4).join(" | "));
  load(g, P0); load(pg, P0);
  // the Monte Carlo's contribution weights are unchanged (the refactor that split out contribAllocationWeights)
  const cw = canon(g.contribBucketWeights()) === canon(pg.contribBucketWeights());
  load(g, { ...clone(P0), contributions: { ...P0.contributions, allocations: {} } }); load(pg, { ...clone(P0), contributions: { ...P0.contributions, allocations: {} } });
  T("E-2 the Monte Carlo's contribution weights (`contribBucketWeights`) are v6.42's, with a mix set and without one", cw && canon(g.contribBucketWeights()) === canon(pg.contribBucketWeights()));
  load(g, P0);
} else console.log(`     (§E: ${POST ? `no app_${E_PRIOR}.mjs in this run folder — skipped` : "the v6.42 leg has nothing to compare with — skipped"})`);

// ── §F · rendered ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — rendered, the Field Manual and METHODOLOGY");
{
  const FM = String(g.DOCS_HTML()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (POST) {
    T("F-1 Field Manual §13: the v6.43 note comes first and names the contributions, the example's opening and the single-plan rule",
      FM.includes("The money the Withdrawal tab, What Breaks and Backtest start from (v6.43).") && FM.includes("On the example the Withdrawal tab opens $102,600 higher, in 2029’s dollars")
      && FM.includes("now has that money counted as yours, so its required distributions are taken")
      && FM.includes("What Breaks and Backtest move more: on the example they start from $1.74M, where they started from $1.65M")
      && FM.includes("in the Withdrawal tab a part larger than your after-tax money, holdings and contributions together is still not charged")
      && FM.indexOf("start from (v6.43).") < FM.indexOf("UI SIZE and the phone layout (v6.42)."));
    T("F-2 Field Manual, Withdrawal Strategy and the units sentence: the three start with the contributions; a later spouse only to the first retirement",
      FM.includes("this schedule, Backtest and What Breaks start from today's holdings plus the contributions you plan to make before retiring, less those rows")
      && (D71 ? FM.includes("a spouse who retires later is counted to the first retirement here, and that spouse's later contributions join at the end of each year they are made")
              : FM.includes("a spouse who retires later is counted only to the first retirement, and the contributions after it are left out here"))
      && FM.includes("(planned contributions at their face value; from v6.43 the Withdrawal schedule, What Breaks and Backtest start with them too"
        + (D71 ? "; from v6.44 a spouse who retires later has the contributions made after the first retirement added in the years they are made, in every projection)" : ")")));
    const MP = [join(HERE, "..", "METHODOLOGY.md"), join(HERE, "METHODOLOGY.md")].find(existsSync);
    const MD = MP ? readFileSync(MP, "utf8").replace(/\s+/g, " ") : "";
    T("F-3 METHODOLOGY: the v6.43 section, the corrected accrual section (eight sites, not nine) and the single-plan rule",
      !!MP && MD.includes("## The money the Withdrawal tab, What Breaks and Backtest start from (v6.43)") && MD.includes("All eight consumer sites call a single constructor")
      && MD.includes("**A single plan's accounts are the one person's (v6.43).**") && MD.includes("buckets $1,500,000 × 1.0844728 + $102,600 = $1,729,309")
      && MD.includes("**Still not charged, stated:**") && MD.includes("A plan already retired whose spouse still contributes opens with none of them (DD-7)"), MP || "no METHODOLOGY.md");
  } else {
    T(`F-1 ${KD64} the Field Manual says the three start from today's holdings less the one-time rows`, FM.includes("this schedule, Backtest and What Breaks start from today's holdings less those rows"));
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
  const DP0 = clone(DG.PORTFOLIO()), DX0 = clone(DG.EXPENSES());
  const visit = async (tab, P, X = DX0) => { await act(async () => { DG.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); }); await flush(); await flush();
    await click(tabBtn("dashboard")); await flush(100); await click(tabBtn(tab)); await flush(200); return text(); };
  const k = v => `$${(v / 1000).toFixed(0)}K`;
  // the example
  const wd = await visit("withdrawal", DP0);
  const tlD = DG.PLAN_TIMELINE(), RD = tlD.targetRetireYear;
  const oD = DG.computeWithdrawalPlan({ retireYear: RD, rothAmount: 70000, scenarioPreset: "bull" })._opening, bkD = oD.b1 + oD.b2 + oD.b3 + oD.b4;
  const bt = await visit("backtest", DP0), wb = await visit("what breaks", DP0), mc = await visit("monte carlo", DP0);
  T("F-4 SETUP: the four tabs rendered on the example", wd.includes("Holdings, by sleeve") && /withdrawal rate/.test(bt) && /edges/.test(wb) && /Accumulation/.test(mc));
  if (POST) {
    T(`F-5 the sleeve card shows the schedule's own opening in ${RD}'s dollars: Traditional ${k(bkD * oD.tradFrac)}, Roth ${k(bkD * oD.rothFrac)} (DD-8 (a))`,
      wd.includes(`At the start of ${RD}, in that year's dollars, the contributions planned before then included: Traditional ${k(bkD * oD.tradFrac)}; Roth ${k(bkD * oD.rothFrac)}.`) && !wd.includes("Starting Traditional"));
    T("F-6 the Withdrawal tab's units note and D-44 sentence name the contributions", wd.includes(`plus the contributions planned before then, at their face value (from v6.43; through v6.42 they were left out of the balance)`)
      && wd.includes(`then your retirement accounts — the contributions planned before ${RD} included — with no tax on anything taken from them`));
    const st = DG.retireStartToday(RD);
    T(`F-7 Backtest's start is the helper's ($${(st / 1e6).toFixed(2)}M) and names the contributions`, bt.includes(`against your $${(st / 1e6).toFixed(2)}M (today's holdings ${DG.retireStartNote(RD)}), before tax`)
      && DG.retireStartNote(RD).startsWith("plus $"));
    T("F-8 What Breaks' basis names the same start", wb.includes(`the portfolio this projection starts from — today's holdings ${DG.retireStartNote(RD)}`));
    T("F-9 the Monte Carlo tab, on the example (both retire together): no exception", mc.includes("the model is drawdown-only (no salary or contributions).") && !mc.includes("contributions, which continue until"));
    const mcB = await visit("monte carlo", { ...clone(DP0), retireYearB: 2034 });
    T("F-10 the Monte Carlo tab, with spouse B retiring in 2034: her contributions continue until the start of 2034 (the quarter of January)",
      mcB.includes(`except ${DP0.nameB || "Spouse B"}'s contributions, which continue until the start of 2034${D71 ? " — here and, from v6.44, in every other projection." : "."}`));
    // DD-7 disclosed where it applies (the build review's findings 6 and 7): What Breaks, Backtest and the Withdrawal units note name B's cap
    const PB = { ...clone(DP0), retireYearB: 2034 }, nmB = DP0.nameB || "Spouse B";
    const wbB = await visit("what breaks", PB), btB = await visit("backtest", PB), wdB = await visit("withdrawal", PB);
    const noteB = DG.retireStartNote(RD);
    // v6.44 (D-71): the same three now say B's later contributions are added in the years they are made
    const capTxt = D71 ? `(${nmB}'s to ${RD}; ${nmB}'s later ones are added in the years they are made)` : `(${nmB}'s only to ${RD})`;
    const wdTxt = D71 ? `at their face value (${nmB}'s to ${RD}; ${nmB}'s later ones join the schedule at the end of each year they are made, through 2033 — from v6.44; through v6.43 they were left out) (from v6.43;`
      : `at their face value (${nmB}'s only to ${RD}) (from v6.43;`;
    T(`F-13 with spouse B retiring in 2034, What Breaks, Backtest and the Withdrawal tab say her contributions count ${D71 ? `to ${RD} at the start, the later ones in the years they are made` : `only to ${RD}`}`,
      noteB.includes(`of contributions planned before retirement ${capTxt}, in today's dollars`) && wbB.includes(`today's holdings ${noteB}`)
      && btB.includes(`(today's holdings ${noteB})`) && wdB.includes(wdTxt), noteB);
    const mcB0 = await visit("monte carlo", { ...PB, contributions: { ...DP0.contributions, contribPreTaxB: 0, contribRothB: 0 } });
    T("F-14 …and with B retiring later but contributing nothing, the Monte Carlo tab names no exception", mcB0.includes("the model is drawdown-only (no salary or contributions).") && !mcB0.includes("continue until"));
    // a plan with no planned contributions (the tab's selected year does not follow a loaded plan's retirement year, so this zeroes the
    // contributions rather than loading a plan already retired)
    const noC = { ...clone(DP0), contributions: { ...DP0.contributions, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, annualBonus: 0, monthly401k: 0, spouseBMonthly: 0 } };
    const wdR = await visit("withdrawal", noC), btR = await visit("backtest", noC);
    T("F-11 a plan with no planned contributions: the sleeve card and the units note name none, and Backtest's start is today's holdings", wdR.includes(`At the start of ${RD}, in that year's dollars: Traditional`)
      && /against your \$[\d.]+M, before tax/.test(btR) && !wdR.includes("plus the contributions planned before then") && wdR.includes("no real growth — and a fixed amount"));
  } else {
    T(`F-5 ${KD64} the sleeve card prints today's holdings plus the contributions, uncarried ($1288K / $315K), and Backtest starts from today's holdings`,
      wd.includes("Starting Traditional: $1288K; Roth: $315K.") && /against your \$1\.65M, before tax/.test(bt));
  }
  // My Data's accrual readout
  await act(async () => { DG.applyLoadedData({ portfolio: clone(DP0), expenses: clone(DX0) }); }); await flush();
  await click(tabBtn("my data")); await flush(200);
  const md = text();
  if (POST) T("F-12 My Data's accrual readout says where the contributions go, the three that start from them, and what the Monte Carlo does",
    md.includes("added at that face value to the retirement-start balances of the Roth, Taxes and IRMAA projections, and to the money the Withdrawal schedule, What Breaks and Backtest start from")
    && md.includes("The Monte Carlo adds the same contributions quarter by quarter, with growth, and the HSA's too.") && !md.includes("is unchanged."));
  else T(`F-12 ${KD64} My Data's readout says the contributions reach the Withdrawal projection and the Monte Carlo "is unchanged"`, md.includes("The Monte Carlo models these contributions separately and is unchanged."));
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

console.log(`\nt107 SUITE (${VER}): ${pass} passed, ${fail} failed`);
finished = true;
process.exit(fail ? 1 : 0);
