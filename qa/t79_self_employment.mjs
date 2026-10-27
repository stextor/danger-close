// t79 — SELF-EMPLOYMENT TAX ON A SELF-EMPLOYED JOB ROW FOLLOWS THE LAW (v6.16 — D-36)
// Run: node t79_self_employment.mjs v616   |   node t79_self_employment.mjs v615
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_D36_SELF_EMPLOYMENT_V616.md). Through v6.15 every job row was taxed as a paycheck — the
// employee's 7.65% — so a self-employed person's payroll tax was understated by about half (disclosed, not modelled, since v6.14). From
// v6.16 a job row can be marked "Job — self-employed (1099)"; the one helper, `payrollTax`, then applies self-employment tax:
//   26 U.S.C. §1401(a)    12.4% Social Security, and §1401(b)(1) 2.9% Medicare, on self-employment income;
//   26 U.S.C. §1402(a)(12) net earnings are the profit less half the (a) and (b)(1) rates — 92.35% of the profit;
//   26 U.S.C. §1402(b)(1)  the 12.4% stops at the contribution and benefit base MINUS that person's wages;
//   26 U.S.C. §1402(b)(2)  nothing at all if net earnings are under $400;
//   26 U.S.C. §1401(b)(2)  0.9% above $250,000 joint / $200,000 otherwise, the threshold reduced by wages — i.e. on wages + net earnings.
// Not taken, and disclosed (scope DC-2, DC-5): the §164(f) deduction for half the tax, and the §199A QBI deduction (MissingFeatures D-37).
//
// GATED PER LEG (OPERATIONS §B2). The v6.15 leg pins its rule — every job row taxed as wages — as dated [KNOWN DEFECT] checks, reproduced
// by v6.15's own rule and NOT by the law; the v6.16 leg asserts the law. §C needs both modules and runs for the v6.15 → v6.16 pair only
// (printed skip on the other leg). PRECISION: to the cent — Engine B publishes `fica` per row. INDEPENDENCE: every rate, the 0.9235 factor,
// the $400 floor and the thresholds are typed here from the statute (never read from TAX_CONSTS); each person's wages and profit come from
// the household's own rows. The one figure shared with the app is the projection's wage-base indexing (2%/yr from the as-of year), which
// t77 and t29 already hold.
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(79); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP: the CJS bundle resolves a bare FileReader to Node's global
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v616";
const KNOWN_VERSIONS = ["v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633"].includes(VER);   // an array, so the next registration widens it
// The differential's pair — two constants, NOT `VER === "v616"`, so the registrar cannot widen it (t76 records why).
const D_PRIOR = "v615", D_CUR = "v616";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g } = M;
// v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): the OASDI wage base (§230 of the Social Security Act) is indexed by the national average
// wage index; the model now projects it at the plan's inflation (CPI-U as the proxy — DU-3 (a), disclosed as slightly optimistic, since wages
// historically outrun prices), not a flat 2%. WBR is that rate: Σ prob × inflation over this module's SCENARIOS table (units_v630.mjs) on the
// v6.30 leg, 2% on every earlier one. The §3101(b)(2) 0.9% thresholds are statutory and unindexed on every leg.
const WBR = ["v630", "v631", "v632", "v633"].includes(VER) ? Object.values(g.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0) : 0.02;   // an array, so register_tag2 widens it
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
process.on("exit", () => { if (!finished) { console.log(`t79 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const usd = n => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const KD = "[KNOWN DEFECT 2026-10-16, D-36 — flips at v6.16]";
console.log(`t79 — SELF-EMPLOYMENT TAX (${VER})\n`);

// ── the law, typed from the sources ──────────────────────────────────────────────────────────────────────────────────────
const SS = 0.062, MED = 0.0145, ADDL = 0.009, THR_SGL = 200000, THR_MFJ = 250000, BASE26 = 184500;   // §3101(a),(b)(1),(b)(2); SSA 2026
const SE_SS = 0.124, SE_MED = 0.029, NET = 0.9235, FLOOR = 400;                                         // §1401(a),(b)(1); §1402(a)(12),(b)(2)
// One entry per person: { w: paycheck wages, p: self-employment profit }.
const lawTax = (people, base, single) => {
  let t = 0, Wsum = 0, Nsum = 0;
  for (const { w, p } of people) {
    const n0 = p * NET, n = n0 >= FLOOR ? n0 : 0;
    t += Math.min(w, base) * SS + Math.min(n, Math.max(0, base - w)) * SE_SS + w * MED + n * SE_MED;
    Wsum += w; Nsum += n;
  }
  return t + ADDL * Math.max(0, Wsum + Nsum - (single ? THR_SGL : THR_MFJ));
};
// v6.15's rule (v6.14 C-14/D-17's law for wages), applied to every job row as if it were a paycheck — reproduced so the prior leg pins it.
const oldTax = (people, base, single) => {
  const e = people.map(x => x.w + x.p), Wh = e.reduce((a, b) => a + b, 0);
  return Wh > 0 ? e.reduce((t, w) => t + Math.min(w, base) * SS, 0) + Wh * MED + ADDL * Math.max(0, Wh - (single ? THR_SGL : THR_MFJ)) : 0;
};

// ── households: the scope's §0.3 set, plus a joint-owned self-employed row and a survivor who crosses joint → Single ────────────
const BASE = clone(g.PORTFOLIO());
g.applyLoadedData({ portfolio: clone(BASE) }); const TL0 = g.buildPlanTimeline(); const RY = TL0.targetRetireYear;
const job = (owner, perYr, se, label = `job ${owner}`, ey = RY + 4) => ({ label, kind: "work", owner, monthly: perYr / 12, startYear: RY, endYear: ey,
  cola: false, tax: "ordinary", ...(se ? { selfEmployed: true } : {}) });
const bDies = RY + 2 - TL0.dobB.year;   // B's life expectancy set so B dies in the third plan year, inside A's job years
// [label, portfolio, has a self-employed row]
const H = [
  ["EXAMPLE (no job rows)", BASE, false],
  ["A employee $60K", { ...BASE, incomeStreams: [job("A", 60000, false)] }, false],
  ["A employee $150K + B employee $150K", { ...BASE, incomeStreams: [job("A", 150000, false), job("B", 150000, false)] }, false],
  ["A self-employed $60K", { ...BASE, incomeStreams: [job("A", 60000, true)] }, true],
  ["A self-employed $30K + B employee $40K", { ...BASE, incomeStreams: [job("A", 30000, true), job("B", 40000, false)] }, true],
  ["A employee $150K + A self-employed $60K", { ...BASE, incomeStreams: [job("A", 150000, false), job("A", 60000, true, "A side")] }, true],
  ["A employee $200K + A self-employed $60K", { ...BASE, incomeStreams: [job("A", 200000, false), job("A", 60000, true, "A side")] }, true],
  ["A self-employed $250K", { ...BASE, incomeStreams: [job("A", 250000, true)] }, true],
  ["single, A self-employed $120K", { ...BASE, single: true, incomeStreams: [job("A", 120000, true)] }, true],
  ["single, A self-employed $250K", { ...BASE, single: true, incomeStreams: [job("A", 250000, true)] }, true],
  ["A self-employed $430", { ...BASE, incomeStreams: [job("A", 430, true)] }, true],
  ["joint-owned self-employed $300K", { ...BASE, incomeStreams: [job("joint", 300000, true)] }, true],
  ["survivor: A self-employed $230K, B dies in year 3", { ...BASE, lifeExpB: bDies, incomeStreams: [job("A", 230000, true, "A", RY + 5)] }, true],
];
const byLbl = l => H.find(h => h[0] === l)[1];
// Each person's paycheck wages and self-employment profit, from the household's own rows: A's and B's rows are theirs; a joint row is split
// equally while both live and is all the survivor's after a death; B's built-in taper ($20K / $18K / $15K) is B's paycheck and applies only
// when no stream is entered (structural, as t77).
const peopleOf = (p, tl, yr) => {
  const single = !!p.single, dA = tl.dobA.year + tl.lifeExpA, dB = single ? Infinity : tl.dobB.year + tl.lifeExpB;
  const aliveA = yr < dA, aliveB = !single && yr < dB, onePerson = single || yr >= Math.min(dA, dB);
  const a = { w: 0, p: 0 }, b = { w: 0, p: 0 }, j = { w: 0, p: 0 }; const ss = p.incomeStreams || [];
  for (const s of ss) { if (s.kind !== "work" || yr < s.startYear || yr > s.endYear) continue; const amt = s.monthly * 12, k = s.selfEmployed ? "p" : "w";
    if (s.owner === "A") { if (aliveA) a[k] += amt; } else if (s.owner === "B") { if (aliveB) b[k] += amt; } else j[k] += amt; }
  if (!ss.length && !single) { const k = yr - tl.targetRetireYear; b.w += k === 0 ? 20000 : k === 1 ? 18000 : k === 2 ? 15000 : 0; }
  return onePerson ? [{ w: a.w + b.w + j.w, p: a.p + b.p + j.p }] : [{ w: a.w + j.w / 2, p: a.p + j.p / 2 }, { w: b.w + j.w / 2, p: b.p + j.p / 2 }];
};
const planB = (mod, p) => { const G = mod.__g, EN = mod.__engines; G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline();
  const S = G.withdrawalPlanSeries({ retireYear: tl.targetRetireYear, rothAmount: 70000, scenarioPreset: "base" });
  const A = { retireYear: tl.targetRetireYear, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr };
  return { tl, rows: EN.computeTaxPlan(A).rows, A, S }; };

// ── §A · the oracle against Engine B, every year, every household ────────────────────────────────────────────────────────
console.log("  A — Engine B (the Taxes tab) against the statute, every year");
for (const [lbl, p, se] of H) {
  const { tl, rows } = planB(M, p);
  let n = 0, wagesOk = true, diffYrs = 0, ownMiss = [], otherHit = 0, joint = 0, single = 0;
  for (const r of rows) {
    const ppl = peopleOf(p, tl, r.yr), Wh = ppl.reduce((a, x) => a + x.w + x.p, 0);
    if (Math.abs(Wh - (r.work_y || 0)) > 0.5) wagesOk = false;
    if (!(Wh > 0)) continue;
    n++; r.filingSingle ? single++ : joint++;
    const base = BASE26 * Math.pow(1 + WBR, r.yr - tl.asOfYear);
    const law = lawTax(ppl, base, r.filingSingle), old = oldTax(ppl, base, r.filingSingle);
    const want = POST ? law : old, other = POST ? old : law;
    if (Math.abs(r.fica - want) >= 0.005) ownMiss.push(`${r.yr}: ${usd(r.fica)} vs ${usd(want)}`);
    if (Math.abs(law - old) >= 0.005) { diffYrs++; if (Math.abs(r.fica - other) < 0.005) otherHit++; }
  }
  T(`A-0 ${lbl}: SETUP — the oracle's per-person wages and profit sum to the engine's work_y in every year (${n} job years; ${joint} joint, ${single} Single)`,
    wagesOk && (lbl.startsWith("EXAMPLE") ? n === 3 : n >= 5), `n=${n}`);
  T(POST ? `A-1 ${lbl}: Engine B's payroll tax is the statute — wages as wages, a self-employed row both halves on 92.35% over $400 — to the cent in all ${n} job years`
         : `A-1 ${lbl}: ${se ? KD + " " : ""}Engine B's payroll tax is v6.15's rule — every job row taxed as wages — to the cent in all ${n} job years`,
    ownMiss.length === 0, ownMiss.slice(0, 3).join(", "));
  T(se ? `A-2 ${lbl}: the two rules differ here (${diffYrs} yr), and the engine matches only its own leg's rule`
       : `A-2 ${lbl}: CONTROL — no self-employed row, so the two rules agree in every year (nothing for the fix to move)`,
    se ? diffYrs > 0 && otherHit === 0 : diffYrs === 0, `${diffYrs} yr differ, ${otherHit} matched the other rule`);
}
{
  const p = byLbl("survivor: A self-employed $230K, B dies in year 3"), { tl, rows } = planB(M, p);
  const j = rows.filter(r => (r.work_y || 0) > 0);
  T("A-3: SETUP — the survivor household crosses joint → Single inside its self-employed years (the 0.9% threshold falls to $200,000)",
    j.some(r => !r.filingSingle) && j.some(r => r.filingSingle), j.map(r => `${r.yr}${r.filingSingle ? "S" : "J"}`).join(" "));
  // net 230,000 × 0.9235 = 212,405: under $250,000 while joint, over $200,000 once Single — the 0.9% appears at the crossing, on net earnings.
  const jr = j.find(r => !r.filingSingle), sr = j.find(r => r.filingSingle);
  const add = r => r.fica - (Math.min(212405, BASE26 * Math.pow(1 + WBR, r.yr - tl.asOfYear)) * SE_SS + 212405 * SE_MED);
  T(POST ? "A-4: and the 0.9% on net earnings appears exactly at the crossing — $0 while joint, 0.9% × $12,405 = $111.65 once Single"
         : `A-4 ${KD}: the survivor's 0.9% is charged on the full $230,000 as wages once Single`,
    POST ? !!jr && !!sr && Math.abs(add(jr)) < 0.006 && Math.abs(add(sr) - 111.645) < 0.006 : !!sr && Math.abs(sr.fica - oldTax([{ w: 0, p: 230000 }], BASE26 * Math.pow(1 + WBR, sr.yr - tl.asOfYear), true)) < 0.006,
    jr && sr ? `${usd(add(jr))} / ${usd(add(sr))}` : "no rows");
}

// ── §B · one helper, no stray rate, the floor read not typed (AST) ───────────────────────────────────────────────────────────
console.log("  B — one rule, in one place (AST)");
{
  const fnOf = anc => { for (let i = anc.length - 1; i >= 0; i--) { const a = anc[i];
    if (a.type === "FunctionDeclaration" && a.id) return a.id.name;
    if (a.type === "VariableDeclarator" && a.id && a.id.name && a.init && /Function/.test(a.init.type)) return a.id.name; } return "<module>"; };
  const calls = [], lits = [], floorReads = [], floorLits = [];
  walk.ancestor(AST, {
    CallExpression(n, anc) { if (n.callee.type === "Identifier" && n.callee.name === "payrollTax") calls.push(fnOf(anc)); },
    MemberExpression(n, anc) { if (!n.computed && n.property.type === "Identifier" && n.property.name === "SE_MIN_NET") floorReads.push(fnOf(anc)); },
    Literal(n, anc) {
      if (typeof n.value !== "number") return;
      // HISTORICAL_RETURNS holds annual market returns (data, not rates): 0.029 and 0.124 occur there as returns (measured: 6 sites).
      if ([0.124, 0.029, 0.153, 0.9235].includes(n.value) && !anc.some(a => a.type === "VariableDeclarator" && a.id && a.id.name === "HISTORICAL_RETURNS"))
        lits.push(`${n.value}@L${n.loc.start.line}`);
      if (n.value === 400 && ["payrollTax", "workEarners"].includes(fnOf(anc))) floorLits.push(`L${n.loc.start.line}`);
    } }, W);
  T(POST ? "B-1: `payrollTax` is still called at exactly three sites — Engine A twice and Engine B once (the self-employment rule added no caller)"
         : "B-1 (prior leg): `payrollTax` is called at the three payroll sites (v6.14)",
    calls.length === 3 && calls.filter(c => c === "computeTaxPlan").length === 1, `${calls.length}: ${calls.join(", ")}`);
  T("B-2 [EXTINCTION]: no 0.124, 0.029, 0.153 or 0.9235 literal anywhere outside the historical-returns table — every self-employment rate is derived from the payroll constants",
    lits.length === 0, lits.join(", "));
  T(POST ? "B-3: the $400 floor is read from TAX_CONSTS.SE_MIN_NET inside `payrollTax`, and no 400 literal appears in `payrollTax` or `workEarners`"
         : `B-3 ${KD}: there is no self-employment floor — SE_MIN_NET is read nowhere`,
    POST ? floorReads.includes("payrollTax") && floorLits.length === 0 && g.TAX_CONSTS().SE_MIN_NET === FLOOR : floorReads.length === 0 && g.TAX_CONSTS().SE_MIN_NET === undefined,
    `reads: ${floorReads.join(", ") || "none"}; literals: ${floorLits.join(", ") || "none"}`);
}

// ── §C · what cannot move, and Engine A, across the pair (needs both modules) ──────────────────────────────────────────────
const PRI = join(HERE, `app_${D_PRIOR}.mjs`);
if (VER === D_CUR && existsSync(PRI)) {
  console.log(`  C — ${D_PRIOR} → ${D_CUR}: what moves and what cannot`);
  const M0 = await import(pathToFileURL(PRI).href);
  const strat = (mod, p) => { const G = mod.__g; G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline(), r = tl.targetRetireYear;
    const P = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: r, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
      deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(),
      ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month, pen: G.getPension(), penOwner: G.getPensionOwner(),
      stateRate: tl.stateTaxRate || 0, stateCode: G.PORTFOLIO().stateCode || null, convTaxFunding: "taxable", taxableGainFrac: 0,
      acaPremium: (G.PORTFOLIO().acaBridge || {}).premium || 0, acaSize: (G.PORTFOLIO().acaBridge || {}).size || 0, ...G.retireStartBalances(r),
      ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
      taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: 70000, ordDrawByYr: G.withdrawalPlanSeries({ retireYear: r, rothAmount: 70000, scenarioPreset: "bull" }).ordDrawByYr };
    return G.runRothStrategies(P); };
  // Engines C and D, the drawdown bridge series, and both Monte Carlo engines (reseeded identically before each). None calls `payrollTax`.
  const others = (mod, p) => { const { A, tl } = planB(mod, p); const G = mod.__g, r = tl.targetRetireYear;
    _src = mulberry(2026); const mc = G.runMonteCarlo(r, 200);
    _src = mulberry(2027); const ext = G.runExtendedMC(r, 30, 200);
    return JSON.stringify({ C: mod.__engines.computeIrmaaPlan(A).rows, D: G.computeWithdrawalPlan({ retireYear: r, rothAmount: 70000, scenarioPreset: "base" }).schedule,
      S: G.withdrawalPlanSeries({ retireYear: r, rothAmount: 70000, scenarioPreset: "base" }), MC: mc, EXT: ext }); };
  const FIRST_ORDER = ["A self-employed $60K", "A self-employed $30K + B employee $40K", "A employee $150K + A self-employed $60K", "A employee $200K + A self-employed $60K"];
  let c4exact = 0;
  for (const [lbl, p, se] of H) {
    T(`C-1 ${lbl}: Engines C (IRMAA) and D (Withdrawal), the bridge series and both Monte Carlo engines are bit-identical ${D_PRIOR} → ${D_CUR}`, others(M0, p) === others(M, p));
    if (!se) {
      const b0 = JSON.stringify(planB(M0, p).rows), b1 = JSON.stringify(planB(M, p).rows), a0 = JSON.stringify(strat(M0, p)), a1 = JSON.stringify(strat(M, p));
      T(`C-2 ${lbl}: and Engines A and B are bit-identical too — no self-employed row, nothing moves`, b0 === b1 && a0 === a1);
    } else {
      // Engine B: the lifetime change in total tax is the payroll change and nothing else (scope §0.3, every row).
      const r0 = planB(M0, p).rows, r1 = planB(M, p).rows, sum = (rs, k) => rs.reduce((t, r) => t + r[k], 0);
      const dB = sum(r1, "fica") - sum(r0, "fica"), dTot = sum(r1, "totalTax") - sum(r0, "totalTax");
      T(`C-3 ${lbl}: Engine B's lifetime total tax moves by its payroll change (${usd(dB)}) and nothing else, within $1`, Math.abs(dTot - dB) <= 1, `${usd(dTot)} vs ${usd(dB)}`);
      // Engine A's "none" strategy (no conversions). Engine A carries account balances forward, so a larger payroll bill leaves less
      // invested and can lower LATER tax (IRMAA, the survivor's years, NIIT) — Engine B takes the draws as given and cannot. So: exact,
      // within $1, where nothing downstream reacts (the four FIRST_ORDER households, measured); elsewhere the same direction and no larger,
      // the residual bounded by the measured worst case (joint $300K: $74,573 of $96,160.50 = 77.6%). ⚠ The scope's §3 C said "exactly"
      // for every household — that overstated it; owned in its §7. (Instrumented session-only: in the first plan year every strategy's tax
      // moves by exactly Engine B's payroll change on every household here.)
      const n1 = strat(M, p).find(s => s.key === "none"), n0 = strat(M0, p).find(s => s.key === "none"), dA = n1.totTax - n0.totTax;
      if (FIRST_ORDER.includes(lbl)) { c4exact++;
        T(`C-4 ${lbl}: Engine A (strategy comparison) — the "none" strategy's lifetime tax moves by exactly Engine B's payroll change, ${usd(dB)}, within $1`,
          Math.abs(dA - dB) <= 1, `${dA.toFixed(2)} vs ${dB.toFixed(2)}`);
      } else
        T(`C-4 ${lbl}: Engine A — the "none" strategy's lifetime tax moves the same way as Engine B's payroll change (${usd(dB)}) and by no more, at least 75% of it`,
          Math.sign(dA) === Math.sign(dB) && Math.abs(dA) <= Math.abs(dB) + 1 && Math.abs(dA) >= 0.75 * Math.abs(dB), `${dA.toFixed(2)} vs ${dB.toFixed(2)}`);
      T(`C-5 ${lbl}: and Engine A's "none" estate moves the other way — more tax, a smaller estate`, Math.sign(n1.estate - n0.estate) === -Math.sign(dB), `${n1.estate - n0.estate}`);
    }
  }
  T("C-6: SETUP — the exact form of C-4 ran on all four first-order households (a renamed household cannot silently drop it)", c4exact === 4, `${c4exact}`);
} else console.log(`  C — skipped by design (the ${D_PRIOR} → ${D_CUR} pair only, with both modules; this leg is ${VER})`);

// ── §D · the hand pins (scope §0.3; each worked by hand below) ──────────────────────────────────────────────────────────────
// 2029 (the first plan year): base 184,500 × 1.02³ = 195,792.876.
console.log("  D — the hand pins");
{
  const pin = (id, lbl, law, old, how) => { const { rows } = planB(M, byLbl(lbl)); const r = rows.find(x => x.yr === RY);
    T(POST ? `${id} ${lbl}, ${RY}: payroll tax ${usd(law)} — ${how}` : `${id} ${KD} ${lbl}, ${RY}: payroll tax ${usd(old)}, as wages`,
      !!r && Math.abs(r.fica - (POST ? law : old)) < 0.006, r ? usd(r.fica) : "no row"); };
  // 60,000 × 0.9235 = 55,410.00 × 15.3% = 8,477.73.  v6.15: 60,000 × 7.65% = 4,590.00.
  pin("D-1", "A self-employed $60K", 8477.73, 4590.00, "60,000 × 92.35% = 55,410 × 15.3%");
  // Wages 150,000 × 7.65% = 11,475.00; SS room 195,792.876 − 150,000 = 45,792.876 × 12.4% = 5,678.32; 55,410 × 2.9% = 1,606.89; 205,410 < 250,000.
  // = 18,760.21. v6.15: 195,792.876 × 6.2% + 210,000 × 1.45% = 12,139.16 + 3,045 = 15,184.16.
  // v6.30: the same hand arithmetic on the 2029 base at the plan's rate, WB = 184,500 × (1 + WBR)³ (the three pins below that read the base).
  const WB = BASE26 * Math.pow(1 + WBR, RY - 2026), U30 = WBR !== 0.02;
  const d2 = 150000 * 0.0765 + Math.min(55410, WB - 150000) * 0.124 + 55410 * 0.029;
  // D-3 at v6.30's rate: the 2029 base (≈ $200,085) now sits just ABOVE the $200,000 of wages, so a few dollars of Social Security room
  // are left for the profit — the general form, not the 2% one's "no room left" (a first draft here kept that shortcut and was $5.29 short).
  const d3 = Math.min(200000, WB) * 0.062 + Math.min(55410, Math.max(0, WB - 200000)) * 0.124 + 200000 * 0.0145 + 55410 * 0.029 + 0.009 * (200000 + 55410 - 250000);
  const d4 = Math.min(230875, WB) * 0.124 + 230875 * 0.029 + 0.009 * (230875 - 200000);
  if (U30) console.log(`    (v6.30: the ${RY} wage base at the plan's rate is ${WB.toFixed(3)}; D-2 ${d2.toFixed(2)}, D-3 ${d3.toFixed(2)}, D-4 ${d4.toFixed(2)})`);
  pin("D-2", "A employee $150K + A self-employed $60K", U30 ? d2 : 18760.21, 15184.16, "the base shared with the same person's paycheck");
  // Wages 200,000 ≥ the base: 195,792.876 × 6.2% = 12,139.16, no SS room left for the profit; 200,000 × 1.45% = 2,900.00; 55,410 × 2.9% = 1,606.89;
  // 0.9% × (200,000 + 55,410 − 250,000) = 48.69. = 16,694.74. v6.15: 12,139.16 + 260,000 × 1.45% (3,770) + 0.9% × 10,000 (90) = 15,999.16.
  pin("D-3", "A employee $200K + A self-employed $60K", U30 ? d3 : 16694.74, 15999.16, U30 ? "the profit gets only the base's last dollars above the wages; the 0.9% on wages + net earnings" : "no Social Security room left after the wages; the 0.9% on wages + net earnings");
  // Single: 250,000 × 0.9235 = 230,875; 195,792.876 × 12.4% = 24,278.32; 230,875 × 2.9% = 6,695.38; 0.9% × (230,875 − 200,000) = 277.88. = 31,251.57.
  // v6.15: 12,139.16 + 3,625 + 0.9% × 50,000 (450) = 16,214.16.
  pin("D-4", "single, A self-employed $250K", U30 ? d4 : 31251.57, 16214.16, "the 0.9% on net earnings over $200,000");
  // 430 × 0.9235 = 397.11 < 400 → no self-employment tax (§1402(b)(2)). v6.15: 430 × 7.65% = 32.895 → 32.90.
  pin("D-5", "A self-employed $430", 0, 32.895, "net earnings $397.11, under the $400 floor");
}

// ── §E · the input: offered, saved, exported, imported; an old row is an employee ───────────────────────────────────────────
console.log("  E — the input (My Data, Save & Apply, Export Backup, Import)");
{
  const PREFIX = "dc:";
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
  };
  const grab = b => { window.__lastBlob = b; return "blob:t79"; };
  window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {};
  globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  const text = () => body().textContent || "";
  let root, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const render = async () => { el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush(); };
  const revisit = async (tab = "my data") => { try { await act(async () => { root.unmount(); }); } catch (e) {} if (el) el.remove(); await render(); const t = tabBtn(tab); if (t) { await click(t); await flush(); } };
  const save = async () => { await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush(); return JSON.parse(window.localStorage.getItem(PREFIX + K.portfolio) || "null"); };
  const typeSel = () => [...body().querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "work") && [...s.options].some(o => o.value === "rental"));
  const choose = async (s, v) => { try { await act(async () => { s.value = v; s.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {} await flush(); };
  const importFile = async payload => {
    const inp = [...body().querySelectorAll('input[type="file"]')].find(i => /json/.test(i.getAttribute("accept") || ""));
    if (!inp) return false;
    const file = new window.File([payload], "backup.json", { type: "application/json" });
    Object.defineProperty(inp, "files", { value: [file], configurable: true });
    try { await act(async () => { inp.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
    for (let i = 0; i < 8; i++) await flush();
    await flush(600); return true;
  };

  window.localStorage.clear(); await render();
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  await click(tabBtn("my data")); await flush();
  const first = await save();
  // A plan saved before v6.16: one job row with no `selfEmployed` field.
  const OLD = { ...first, incomeStreams: [{ ...job("A", 60000, false, "Consulting"), id: 1 }] };
  window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify(OLD));
  await revisit();
  const s0 = typeSel();
  T("E-0: SETUP — My Data shows the stored job row with its Type dropdown", !!s0 && !!first, s0 ? s0.value : "no dropdown");
  const opts = s0 ? [...s0.options].map(o => o.textContent).join("|") : "";
  T(POST ? "E-1: the Type dropdown offers both job types — \"Job — employee (W-2)\" and \"Job — self-employed (1099)\""
         : `E-1 ${KD}: the Type dropdown offers one job type, "Job (part/full-time)"`,
    POST ? opts === "Rental|Job — employee (W-2)|Job — self-employed (1099)|Annuity|Other" : opts.includes("Job (part/full-time)") && !opts.includes("1099"), opts);
  T("E-2: a job row saved without the field reads as an employee (both legs)", !!s0 && s0.value === "work", s0 ? s0.value : "");
  T("E-3: and an employee's figures are the employee's half — Engine B taxes the old row as wages (both legs)",
    (() => { const { rows } = planB(M, OLD); const r = rows.find(x => x.yr === RY); return !!r && Math.abs(r.fica - 4590) < 0.006; })());
  if (POST) {
    await choose(s0, "work_se");
    const S1 = await save(), row1 = S1 && (S1.incomeStreams || [])[0];
    T("E-4: choosing \"Job — self-employed (1099)\" and pressing Save & Apply stores kind \"work\" with selfEmployed: true",
      !!row1 && row1.kind === "work" && row1.selfEmployed === true, JSON.stringify(row1));
    T("E-5: the applied plan carries it too — Engine B's payroll tax on the applied plan is the self-employed figure, $8,477.73",
      (() => { const r = M.__engines && planB(M, clone(DG.PORTFOLIO())).rows.find(x => x.yr === RY); return !!r && Math.abs(r.fica - 8477.73) < 0.006; })());
    await revisit();
    T("E-6: reopening My Data shows the row as self-employed", !!typeSel() && typeSel().value === "work_se", typeSel() ? typeSel().value : "");
    await click(tabBtn("income")); await flush();
    T("E-7: the Income tab labels the row self-employed", /self-employed · no COLA/.test(text()));
    await click(tabBtn("my data")); await flush();
    window.__lastBlob = null; await click(btn(/EXPORT BACKUP/)); await flush();
    const bk = window.__lastBlob ? JSON.parse(await window.__lastBlob.text()) : null, brow = bk && bk.portfolio && (bk.portfolio.incomeStreams || [])[0];
    T("E-8: Export Backup carries selfEmployed: true", !!brow && brow.selfEmployed === true && brow.kind === "work", JSON.stringify(brow));
    T("E-9: and the backup's Ask AI context calls the row self-employed work", !!bk && typeof bk.masterPrompt === "string" && bk.masterPrompt.includes("self-employed work"));
    await choose(typeSel(), "work");
    const S2 = await save(), row2 = S2 && (S2.incomeStreams || [])[0];
    T("E-10: switching the row back to employee and saving clears the field", !!row2 && row2.kind === "work" && !row2.selfEmployed, JSON.stringify(row2));
    await importFile(JSON.stringify(bk));
    const irow = (DG.PORTFOLIO().incomeStreams || [])[0], stored = JSON.parse(window.localStorage.getItem(PREFIX + K.portfolio) || "null"), srow = stored && (stored.incomeStreams || [])[0];
    T("E-11: importing the backup restores selfEmployed: true — in the applied plan and in storage", !!irow && irow.selfEmployed === true && !!srow && srow.selfEmployed === true,
      `${JSON.stringify(irow)} / ${JSON.stringify(srow)}`);
    await revisit();
    T("E-12: and My Data shows it self-employed again after the import", !!typeSel() && typeSel().value === "work_se", typeSel() ? typeSel().value : "");
  } else {
    // v6.15 does not know the field: a row carrying it is saved without it (the editor's field list drops it).
    window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify({ ...first, incomeStreams: [{ ...job("A", 60000, true, "Consulting"), id: 1 }] }));
    await revisit();
    const S1 = await save(), row1 = S1 && (S1.incomeStreams || [])[0];
    T(`E-4 ${KD}: a row marked self-employed loses the mark on Save & Apply`, !!row1 && row1.kind === "work" && !("selfEmployed" in row1), JSON.stringify(row1));
  }
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

// ── §F · what the user reads ───────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — the copy");
{
  const texts = []; walk.full(AST, n => { if ((n.type === "Literal" && typeof n.value === "string") || n.type === "JSXText") texts.push(String(n.value));
    else if (n.type === "TemplateElement") texts.push(n.value.cooked || ""); }, W);
  const has = s => texts.some(t => t.includes(s));
  const TAXES = "A self-employed row pays self-employment tax: both halves on 92.35% of the profit (12.4% Social Security on what the same person's wages leave of the wage base, 2.9% Medicare), nothing if that is under $400, and it counts toward the 0.9%.";
  const TAXES_SIMP = "Half of that tax is not deducted from income and the 20% qualified-business-income deduction is not taken, so a self-employed person's income tax runs a little high.";
  const MYD = "an employee row the employee's half, as wages; a self-employed row both halves, on 92.35% of the profit";
  const JOBNOTE = "A job row saved before v6.16 counts as an employee until you change it.";
  const FM = "a job row marked self-employed pays self-employment tax instead — both halves, on 92.35% of the profit, with Social Security only on what the same person’s wages leave of the wage base and nothing below $400";
  const FM_SIMP = "half of that tax is not deducted from income and the qualified-business-income deduction is not taken";
  // v6.15's three self-employment disclosures, verbatim (the generic "which is not modelled" also describes two state rules — not these).
  const OLD_PHRASES = ["a self-employed person owes both halves of these taxes, which the app does not model", "a self-employed person owes both halves, which is not modelled",
    "so a self-employed person's tax is understated"];
  T(POST ? "F-1: the Taxes tab's method note states the self-employment rule — both halves, 92.35%, the shared base, the $400 floor, the 0.9%" : "F-1 (prior leg): not yet", POST ? has(TAXES) : !has(TAXES));
  T(POST ? "F-2: and discloses both simplifications — half the tax not deducted (§164(f)), and no QBI deduction" : "F-2 (prior leg): not yet", POST ? has(TAXES_SIMP) : !has(TAXES_SIMP));
  T(POST ? "F-3: My Data's streams note tells an employee row from a self-employed one" : "F-3 (prior leg): not yet", POST ? has(MYD) : !has(MYD));
  T(POST ? "F-4: the job-row note says an older row counts as an employee until changed" : "F-4 (prior leg): not yet", POST ? has(JOBNOTE) : !has(JOBNOTE));
  T(POST ? "F-5: the Field Manual's streams entry states the rule and both simplifications" : "F-5 (prior leg): not yet", POST ? has(FM) && has(FM_SIMP) : !has(FM) && !has(FM_SIMP));
  const old = OLD_PHRASES.filter(has);
  T(POST ? "F-6 [EXTINCTION]: no \"not modelled\" / \"understated\" self-employment disclosure survives anywhere in the source's text"
         : `F-6 ${KD}: the app discloses that self-employment is not modelled (three surfaces)`,
    POST ? old.length === 0 : old.length === 3, old.join(" | ") || "none");
  const MP = [join(HERE, "..", "METHODOLOGY.md"), join(HERE, "METHODOLOGY.md")].find(existsSync);
  if (POST && MP) {
    const md = readFileSync(MP, "utf8");
    T("F-7: METHODOLOGY's payroll section states the rule (92.35%, $400, §1402) and discloses §164(f) and the QBI deduction",
      /92\.35%/.test(md) && /\$400/.test(md) && /§1402/.test(md) && /§164\(f\)/.test(md) && /qualified[- ]business[- ]income|§199A/i.test(md));
  } else console.log(`  F-7 — skipped by design (${POST ? "METHODOLOGY.md not found beside this run" : "the current leg only: the run folder carries one METHODOLOGY.md"})`);
}

finished = true;
console.log(`\nt79 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
