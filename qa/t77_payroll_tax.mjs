// t77 — PAYROLL TAX ON JOB INCOME FOLLOWS THE LAW (v6.14 — D-17, C-14)
// Run: node t77_payroll_tax.mjs v614   |   node t77_payroll_tax.mjs v613
//
// THE DEFECTS THIS EXISTS FOR (docs/SCOPE_D17_PAYROLL_TAX_V614.md). Every payroll site — Engine A twice, Engine B once — took
//   min(household wages, wage base) × 6.2% + wages × 1.45%
// so (C-14) two earners shared ONE Social Security wage cap, where 26 U.S.C. §3121(a)(1) caps each person's wages; and (D-17) the
// Additional Medicare Tax — 0.9% on household wages above $200,000 single / $250,000 joint, unindexed (§3101(b)(2); IRS Instructions for
// Form 8959) — was never charged. Both take too little tax. From v6.14 one helper, `payrollTax`, applies the rule.
//
// GATED PER LEG (OPERATIONS §B2). The v6.13 leg pins both defects as dated [KNOWN DEFECT] checks, reproduced by v6.13's own rule; the
// v6.14 leg asserts the law. §C and the Engine A differential need both modules and run for the v6.13 → v6.14 pair only (printed skip).
// PRECISION: to the cent — Engine B publishes `fica` per row. INDEPENDENCE: the oracle's rates and thresholds are typed here from the
// statute and the IRS instructions (never read from TAX_CONSTS); each person's wages come from the household's own stream rows. The only
// figure it shares with the app is the projection's wage-base indexing (2%/yr from the plan's as-of year), which is not this suite's
// subject — and t29's census row and this suite would both go red if it moved.
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v614";
const KNOWN_VERSIONS = ["v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635"].includes(VER);   // an array, so the next registration widens it
// v6.16 (D-36, docs/SCOPE_D36_SELF_EMPLOYMENT_V616.md): self-employment is modelled — the Verify tab gains a sixth payroll check (the
// §1402(b)(2) floor) and the "not modelled" disclosure E-4 locked goes false. Gated per leg (§B2); an array, so the next registration widens it.
const SE = ["v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635"].includes(VER);
// The differential's pair — two constants, NOT `VER === "v614"`, so the registrar cannot widen it (t76 records why).
const D_PRIOR = "v613", D_CUR = "v614";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g, __engines: E } = M;
// v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): the OASDI wage base (§230 of the Social Security Act) is indexed by the national average
// wage index; the model now projects it at the plan's inflation (CPI-U as the proxy — DU-3 (a), disclosed as slightly optimistic, since wages
// historically outrun prices), not a flat 2%. WBR is that rate: Σ prob × inflation over this module's SCENARIOS table (units_v630.mjs) on the
// v6.30 leg, 2% on every earlier one. The §3101(b)(2) 0.9% thresholds are statutory and unindexed on every leg.
const WBR = ["v630", "v631", "v632", "v633", "v634", "v635"].includes(VER) ? Object.values(g.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0) : 0.02;   // an array, so register_tag2 widens it
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

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const clone = o => JSON.parse(JSON.stringify(o));
const usd = n => "$" + (Math.round(n * 100) / 100).toLocaleString();
const KD = "[KNOWN DEFECT 2026-10-15, C-14/D-17 — flips at v6.14]";
console.log(`t77 — PAYROLL TAX ON JOB INCOME (${VER})\n`);

// ── the law, typed from the sources ──────────────────────────────────────────────────────────────────────────────────────
const SS = 0.062, MED = 0.0145, ADDL = 0.009, THR_SGL = 200000, THR_MFJ = 250000, BASE26 = 184500;   // §3101(a),(b)(1),(b)(2); SSA 2026
const lawTax = (earners, W, base, single) => earners.reduce((t, w) => t + Math.min(w, base) * SS, 0) + W * MED + ADDL * Math.max(0, W - (single ? THR_SGL : THR_MFJ));
const oldTax = (W, base) => W > 0 ? Math.min(W, base) * SS + W * MED : 0;   // v6.13's rule, reproduced so the prior leg pins it

// ── households: the scope's §0.3 set, plus a survivor crossing and one person holding two jobs ───────────────────────────────
const BASE = clone(g.PORTFOLIO());
g.applyLoadedData({ portfolio: clone(BASE) }); const TL0 = g.buildPlanTimeline(); const RY = TL0.targetRetireYear;
const job = (owner, perYr, sy, ey, label = `job ${owner}`) => ({ label, kind: "work", owner, monthly: perYr / 12, startYear: sy, endYear: ey, cola: false, tax: "ordinary" });
const bDies = RY + 2 - TL0.dobB.year;   // B's life expectancy set so B dies in the third plan year, mid-job
const H = [
  ["EXAMPLE", BASE, false],
  ["A job $300K", { ...BASE, incomeStreams: [job("A", 300000, RY, RY + 4)] }, true],
  ["A $150K + B $150K", { ...BASE, incomeStreams: [job("A", 150000, RY, RY + 4), job("B", 150000, RY, RY + 4)] }, true],
  ["A $120K + B $120K", { ...BASE, incomeStreams: [job("A", 120000, RY, RY + 4), job("B", 120000, RY, RY + 4)] }, true],
  ["A $60K + B $60K", { ...BASE, incomeStreams: [job("A", 60000, RY, RY + 4), job("B", 60000, RY, RY + 4)] }, false],
  ["single, A $250K", { ...BASE, single: true, incomeStreams: [job("A", 250000, RY, RY + 4)] }, true],
  ["joint-owned job $300K", { ...BASE, incomeStreams: [job("joint", 300000, RY, RY + 4)] }, true],
  ["B: two jobs $150K + $110K", { ...BASE, incomeStreams: [job("B", 150000, RY, RY + 4, "B main"), job("B", 110000, RY, RY + 4, "B side")] }, true],   // ONE earner: one cap, not two
  ["survivor: A $230K, B dies in year 3", { ...BASE, lifeExpB: bDies, incomeStreams: [job("A", 230000, RY, RY + 5)] }, true],
];
// Each person's wages, from the household's own rows: A's and B's rows are theirs; a joint row is split equally while both live and is
// all the survivor's after a death; B's built-in taper ($20K / $18K / $15K) applies only when no stream is entered (structural).
const earnersOf = (p, tl, yr) => {
  const single = !!p.single, dA = tl.dobA.year + tl.lifeExpA, dB = single ? Infinity : tl.dobB.year + tl.lifeExpB;
  const aliveA = yr < dA, aliveB = !single && yr < dB, onePerson = single || yr >= Math.min(dA, dB);
  let a = 0, b = 0, j = 0; const ss = p.incomeStreams || [];
  for (const s of ss) { if (s.kind !== "work" || yr < s.startYear || yr > s.endYear) continue; const amt = s.monthly * 12;
    if (s.owner === "A") { if (aliveA) a += amt; } else if (s.owner === "B") { if (aliveB) b += amt; } else j += amt; }
  if (!ss.length && !single) { const k = yr - tl.targetRetireYear; b += k === 0 ? 20000 : k === 1 ? 18000 : k === 2 ? 15000 : 0; }
  return onePerson ? [a + b + j] : [a + j / 2, b + j / 2];
};
const planB = (mod, p) => { const G = mod.__g, EN = mod.__engines; G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline();
  const S = G.withdrawalPlanSeries({ retireYear: tl.targetRetireYear, rothAmount: 70000, scenarioPreset: "base" });
  const A = { retireYear: tl.targetRetireYear, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr };
  return { tl, rows: EN.computeTaxPlan(A).rows, A, S }; };

// ── §A · the oracle against Engine B, every year, every household ────────────────────────────────────────────────────────
console.log("  A — Engine B (the Taxes tab) against the law, every year");
const RES = {};
for (const [lbl, p, moves] of H) {
  const { tl, rows } = planB(M, p);
  let n = 0, bad = [], wagesOk = true, diffYrs = 0, ownMiss = [], otherHit = 0, joint = 0, single = 0;
  for (const r of rows) {
    const e = earnersOf(p, tl, r.yr), Wh = e.reduce((a, b) => a + b, 0);
    if (Math.abs(Wh - (r.work_y || 0)) > 0.5) wagesOk = false;
    if (!(Wh > 0)) continue;
    n++; r.filingSingle ? single++ : joint++;
    const base = BASE26 * Math.pow(1 + WBR, r.yr - tl.asOfYear);
    const law = lawTax(e, r.work_y, base, r.filingSingle), old = oldTax(r.work_y, base);
    const want = POST ? law : old, other = POST ? old : law;
    if (Math.abs(r.fica - want) >= 0.005) ownMiss.push(`${r.yr}: ${usd(r.fica)} vs ${usd(want)}`);
    if (Math.abs(law - old) >= 0.005) { diffYrs++; if (Math.abs(r.fica - other) < 0.005) otherHit++; }
  }
  RES[lbl] = { n, diffYrs };
  T(`A-0 ${lbl}: SETUP — the oracle's per-person wages sum to the engine's work_y in every year (${n} job years; ${joint} joint, ${single} Single)`,
    wagesOk && (lbl === "EXAMPLE" ? n === 3 : n >= 5), `n=${n}`);
  T(POST ? `A-1 ${lbl}: Engine B's FICA is the law — per-earner cap, Medicare, 0.9% over $200K/$250K — to the cent in all ${n} job years`
         : `A-1 ${lbl}: ${moves ? KD + " " : ""}Engine B's FICA is v6.13's rule — one household cap, no 0.9% — to the cent in all ${n} job years`,
    ownMiss.length === 0, ownMiss.slice(0, 3).join(", "));
  T(moves ? `A-2 ${lbl}: the two rules differ here (${diffYrs} yr), and the engine matches only its own leg's rule`
          : `A-2 ${lbl}: CONTROL — the two rules agree here in every year (nothing for the fix to move)`,
    moves ? diffYrs > 0 && otherHit === 0 : diffYrs === 0, `${diffYrs} yr differ, ${otherHit} matched the other rule`);
}
T("A-3: the survivor household crosses joint → Single inside its job years (the threshold falls from $250,000 to $200,000)",
  (() => { const p = H.find(h => h[0].startsWith("survivor"))[1]; const { rows } = planB(M, p);
    const j = rows.filter(r => (r.work_y || 0) > 0); return j.some(r => !r.filingSingle) && j.some(r => r.filingSingle); })());

// ── §B · one helper, no stray rate (AST) ───────────────────────────────────────────────────────────────────────────────────
console.log("  B — one rule, in one place (AST)");
{
  const fnOf = anc => { for (let i = anc.length - 1; i >= 0; i--) { const a = anc[i];
    if (a.type === "FunctionDeclaration" && a.id) return a.id.name;
    if (a.type === "VariableDeclarator" && a.id && a.id.name && a.init && /Function/.test(a.init.type)) return a.id.name; } return "<module>"; };
  const calls = [], lits = [];
  walk.ancestor(AST, {
    CallExpression(n, anc) { if (n.callee.type === "Identifier" && n.callee.name === "payrollTax") calls.push(fnOf(anc)); },
    Literal(n, anc) { if (typeof n.value === "number" && [0.062, 0.0145, 0.009].includes(n.value)) {
      const inConsts = anc.some(a => a.type === "VariableDeclarator" && a.id && (a.id.name === "TAX_CONSTS" || a.id.name === "HISTORICAL_RETURNS"));   // the return table holds data, not rates
      const inVerify = anc.some(a => a.type === "FunctionDeclaration" && a.id && a.id.name === "buildVerificationChecks");
      if (!inConsts && !inVerify) lits.push(`${n.value}@L${n.loc.start.line}`); } } }, W);
  const where = calls.map(c => c === "_estSaleGain" ? "run" : c).sort().join(", ");
  T(POST ? "B-1: `payrollTax` is called at exactly the three payroll sites — Engine A twice (its tax line and its sale-gain estimate) and Engine B once"
         : `B-1 ${KD}: there is no shared payroll helper`,
    POST ? calls.length === 3 && calls.filter(c => c === "computeTaxPlan").length === 1 : calls.length === 0, `${calls.length}: ${where}`);
  T(POST ? "B-2 [EXTINCTION]: no 0.062, 0.0145 or 0.009 literal survives outside TAX_CONSTS and its Verify checks — a fourth private copy fails here"
         : `B-2 ${KD}: the payroll rates are inline literals at the three sites (six literals)`,
    POST ? lits.length === 0 : lits.length === 6, lits.join(", ") || "none");
  const vc = g.buildVerificationChecks().filter(c => c.cat === "PAYROLL TAX");
  T(SE ? "B-3: the Verify tab checks the six payroll constants — the five employee-side ones citing §3101 or Form 8959, and the self-employment floor citing §1402(b)(2) — every one passing"
     : POST ? "B-3: the Verify tab checks the five payroll constants, every one passing and citing §3101 or Form 8959"
         : "B-3 (prior leg): the Verify tab has no payroll category yet",
    SE ? vc.length === 6 && vc.every(c => c.pass) && vc.filter(c => /3101|8959/.test(c.source)).length === 5 && vc.filter(c => /1402\(b\)\(2\)/.test(c.source)).length === 1
       : POST ? vc.length === 5 && vc.every(c => c.pass && /3101|8959/.test(c.source)) : vc.length === 0, `${vc.length}`);
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
  const others = (mod, p) => { const { A, tl } = planB(mod, p); const G = mod.__g;
    return JSON.stringify({ C: mod.__engines.computeIrmaaPlan(A).rows, D: G.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: 70000, scenarioPreset: "base" }).schedule,
      S: G.withdrawalPlanSeries({ retireYear: tl.targetRetireYear, rothAmount: 70000, scenarioPreset: "base" }) }); };
  for (const [lbl, p, moves] of H) {
    T(`C-1 ${lbl}: Engines C (IRMAA) and D (Withdrawal) and the bridge series are bit-identical ${D_PRIOR} → ${D_CUR}`, others(M0, p) === others(M, p));
    if (!moves) {
      const b0 = JSON.stringify(planB(M0, p).rows), b1 = JSON.stringify(planB(M, p).rows), a0 = JSON.stringify(strat(M0, p)), a1 = JSON.stringify(strat(M, p));
      T(`C-2 ${lbl}: and Engines A and B are bit-identical too — under every threshold, nothing moves`, b0 === b1 && a0 === a1);
    } else if (!lbl.startsWith("survivor") && !lbl.startsWith("B: two")) {
      // Engine A's "current" strategy: its lifetime tax moves by exactly the payroll difference Engine B shows (measured at the scope).
      const dB = planB(M, p).rows.reduce((t, r) => t + r.fica, 0) - planB(M0, p).rows.reduce((t, r) => t + r.fica, 0);
      const c1 = strat(M, p).find(s => s.key === "current"), c0 = strat(M0, p).find(s => s.key === "current");
      T(`C-3 ${lbl}: Engine A (strategy comparison) — the "current" strategy's lifetime tax rises by the payroll difference, ${usd(dB)}, within $1`,
        dB > 0 && Math.abs((c1.totTax - c0.totTax) - dB) <= 1, `${c1.totTax - c0.totTax} vs ${dB.toFixed(2)}`);
    }
  }
} else console.log(`  C — skipped by design (the ${D_PRIOR} → ${D_CUR} pair only, with both modules; this leg is ${VER})`);

// ── §D · the hand-verified pin (scope §0.3) ─────────────────────────────────────────────────────────────────────────────────
console.log("  D — the hand pin");
{
  const { rows } = planB(M, H.find(h => h[0] === "A $150K + B $150K")[1]); const r = rows.find(x => x.yr === RY);
  // 2029: base 184,500 × 1.02³ = 195,792.88. Law: 2 × 150,000 × 6.2% = 18,600 + 300,000 × 1.45% = 4,350 + 0.9% × 50,000 = 450 → 23,400.00.
  // v6.13: 195,792.88 × 6.2% = 12,139.16 + 4,350 = 16,489.16. (The scope's §0.3 wrote 195,793.10 and $16,489.17 — a slip, owned in its §6a.)
  T(POST ? `D-1: A $150K + B $150K, ${RY}: FICA $23,400.00 — worked by hand from §3101 and §3121`
         : `D-1 ${KD}: A $150K + B $150K, ${RY}: FICA $16,489.16 (one cap, no 0.9%)`,
    !!r && Math.abs(r.fica - (POST ? 23400 : 16489.16)) < 0.006, r ? usd(r.fica) : "no row");
}

// ── §E · what the user reads ───────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — copy, and the rendered Taxes tab");
{
  const texts = []; walk.full(AST, n => { if ((n.type === "Literal" && typeof n.value === "string") || n.type === "JSXText") texts.push(String(n.value)); }, W);
  const has = s => texts.some(t => t.includes(s));
  const NOTE = "Social Security 6.2% on each earner's wages up to the wage base, Medicare 1.45% on all of them, and the 0.9% Additional Medicare Tax on household wages above $200,000 single / $250,000 joint (not indexed)";
  const MYD = "Social Security is capped per earner, and a row owned jointly counts as half each spouse's";
  const FM = "Social Security up to the wage base for each earner, Medicare on all of it, and the 0.9% Additional Medicare Tax on household wages above $200,000 single or $250,000 joint";
  const SE_TXT = "a self-employed person owes both halves";
  T(POST ? "E-1: the Taxes tab's method note states the rule (per-earner cap, 0.9%, unindexed)" : "E-1 (prior leg): the method note says only that FICA applies to earned income", POST ? has(NOTE) : !has(NOTE));
  T(POST ? "E-2: My Data's job-row note says the cap is per earner and a joint row is split" : "E-2 (prior leg): not yet", POST ? has(MYD) : !has(MYD));
  T(POST ? "E-3: the Field Manual's streams entry states the rule" : "E-3 (prior leg): not yet", POST ? has(FM) : !has(FM));
  // v6.16: the disclosure is retired with the defect (t79 §F holds the rule's own text); on the v6.16 leg E-4 asserts the old sentence is gone.
  T(SE ? "E-4 [v6.16]: the \"owes both halves … not modelled\" disclosure is gone — self-employment is modelled (D-36)"
     : POST ? "E-4: the self-employment simplification is disclosed in-app (DC-5)" : "E-4 (prior leg): not yet disclosed",
    SE ? !has(SE_TXT) : POST ? texts.filter(t => t.includes(SE_TXT)).length >= 2 : !has(SE_TXT));
  // Rendered: the Taxes tab on the $150K + $150K household. Its detail panel renders FICA as $NK for the selected year.
  require(`./dom_${VER}.cjs`);
  const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
  const React = require("react");
  const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
  const body = () => window.document.body;
  const click = async el => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
  const tabBtn = name => [...body().querySelectorAll("button,div,span")].find(el => (el.textContent || "").trim().toLowerCase() === name);
  await act(async () => { root.render(React.createElement(DangerClose)); }); await flush(); await flush();
  await click([...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0]);
  const gd = window.__g;   // the DOM bundle's own module copy (OPERATIONS §C)
  const P2 = H.find(h => h[0] === "A $150K + B $150K")[1];
  await act(async () => { gd.applyLoadedData({ portfolio: clone(P2) }); }); await flush();
  await click(tabBtn("roth")); await click(tabBtn("taxes")); await flush(); await flush();
  const lbl = [...body().querySelectorAll("span")].find(s => s.textContent === "FICA (on earned income)");
  const shown = lbl && lbl.nextElementSibling ? lbl.nextElementSibling.textContent : null;
  const yrHdr = [...body().querySelectorAll("div")].find(d => d.children.length === 0 && /^NET TAXABLE INCOME BY FEDERAL BRACKET — \d{4}$/.test((d.textContent || "").trim()));
  const selYr = yrHdr ? +yrHdr.textContent.trim().slice(-4) : null;
  const streamsOk = (gd.PORTFOLIO().incomeStreams || []).length === 2;
  T("E-5: SETUP — the Taxes tab rendered the $150K + $150K household (read through window.__g) and its selected year is found", streamsOk && !!lbl && !!selYr, `${shown} @ ${selYr}`);
  const { rows } = planB(M, P2); const r = rows.find(x => x.yr === selYr);
  const e = r ? earnersOf(P2, gd.buildPlanTimeline(), selYr) : [], base = r ? BASE26 * Math.pow(1 + WBR, selYr - gd.buildPlanTimeline().asOfYear) : 0;
  const law = r ? lawTax(e, r.work_y, base, r.filingSingle) : 0, old = r ? oldTax(r.work_y, base) : 0;
  T(POST ? "E-6: the rendered FICA line is the law's figure for that year, in the panel's $K format (not v6.13's)"
         : `E-6 ${KD}: the rendered FICA line is v6.13's figure`,
    !!r && shown === `$${Math.round((POST ? law : old) / 1000)}K` && Math.round(law / 1000) !== Math.round(old / 1000), `${shown}; law $${Math.round(law / 1000)}K, v6.13 $${Math.round(old / 1000)}K`);
  await act(async () => { gd.applyLoadedData({ portfolio: clone(BASE) }); }); await act(async () => { root.unmount(); });
}

console.log(`\nt77 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
