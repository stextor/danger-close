// cf_growth_split.mjs — SCOPE_TAXES_DRAWDOWN §3.5, decision D-9. Separates the two changes A2 bundles — the C-8 DRAWDOWN fix and the adoption of Engine D's
// GROWTH assumption. Reimplements Engine B's Traditional balance loop (L5590-5601, L5698-5702) outside the
// engine, VALIDATED by reproducing B's shipped RMD series to the dollar before any draw is applied.
// ⚠ v5.74: BOUND BY ARGUMENT — `node <this> [tag]`, default v574 — and the binding is printed first.
// Verified at the v5.74 build: this probe's output is BYTE-IDENTICAL bound to v5.73 or v5.74, because
// every figure below comes from Engine B called WITHOUT the drawdown bridge, which is the v5.73 code
// path exactly. So it REPRODUCES the scope's measurements on either build — and it CANNOT confirm the
// fix on either. t40_cross_tab_agreement.mjs does that (and cf_growth_split.mjs's closing build check).
const TAG = process.argv[2] || "v574";
const mod = await import(`../../app_${TAG}.mjs`); const g = mod.__g, E = mod.__engines;
console.log(`[bound to app_${TAG}.mjs \u2014 ${typeof g.withdrawalPlanSeries === "function" ? "post-fix build: the drawdown bridge is present" : "pre-fix build: no drawdown bridge"}]`);
const tl = g.PLAN_TIMELINE(); const retire = tl.targetRetireYear;
const args = { retireYear: retire, rothAmount: 0, qcdAnnual: 0, taxYield: 0 };
const B0 = E.computeTaxPlan(args);
const D  = g.computeWithdrawalPlan({ retireYear: retire, rothAmount: 0, scenarioPreset: "base" });
const infl = g.expectedInflation(); const P0 = g.PORTFOLIO();
const rsb = g.retireStartBalances(retire);
const drawOf = d => Math.max(0, d.magi - (0.85*(d.ssA_y+d.ssB_y) + d.pen_y + d.work_y + d.rmd_y + d.conv_y + d.capGain_y));
const defl = (v, yr) => v / Math.pow(1 + infl, Math.max(0, yr - retire));

// ── Engine B's trad path, reimplemented. draws = {} reproduces the shipped path.
function simulate(growth, draws) {
  let tradA = rsb.tradInitA, tradB = rsb.tradInitB;   // the engine's own names (L5590 reads these)
  let shA = rsb.annShareA, shB = rsb.annShareB;
  const out = {}; let merged = false;
  // lifeExpA 80, lifeExpB 87 → B survives; the engine's own rows carry the widowed flag
  const survivorIsA = tl.lifeExpA > tl.lifeExpB;
  for (const r of B0.rows) {                       // same years, ages and survivor flags as the engine
    if (r.widowed && !merged) {                    // the merge (L5591-5593), once
      const exA = tradA * shA, exB = tradB * shB;
      if (survivorIsA) { tradA += tradB; tradB = 0; } else { tradB += tradA; tradA = 0; }
      shA = tradA > 0 ? Math.min(1, (exA + (survivorIsA ? exB : 0)) / tradA) : 0;
      shB = tradB > 0 ? Math.min(1, (exB + (survivorIsA ? 0 : exA)) / tradB) : 0;
      merged = true;
    }
    const baseA = tradA * (1 - shA), baseB = tradB * (1 - shB);
    const rmdA = r.ageA >= g.rmdStartAge(tl.dobA.year) && baseA > 0 ? baseA / g.rmdDivisor(r.ageA) : 0;
    const rmdB = !tl.single && r.ageB >= g.rmdStartAge(tl.dobB.year) && baseB > 0 ? baseB / g.rmdDivisor(r.ageB) : 0;
    out[r.yr] = rmdA + rmdB;
    const drawY = draws[r.yr] || 0;                // the C-8 fix: spending leaves the balance
    let postA = Math.max(0, tradA - rmdA), postB = Math.max(0, tradB - rmdB);
    const pool = postA + postB, fracA = pool > 0 ? postA / pool : 0;
    postA = Math.max(0, postA - drawY * fracA); postB = Math.max(0, postB - drawY * (1 - fracA));
    tradA = postA * (1 + growth); tradB = postB * (1 + growth);
  }
  return out;
}

// ── validation: no draws, B's own 4.5% → must reproduce the shipped RMD series to the dollar
const check = simulate(0.045, {});
let worst = 0, shipped = 0, simd = 0;
for (const r of B0.rows) { worst = Math.max(worst, Math.abs(check[r.yr] - r.rmd_y)); shipped += r.rmd_y; simd += check[r.yr]; }
console.log(`VALIDATION — reimplemented vs shipped RMD series: worst year $${worst.toFixed(2)}, lifetime $${Math.round(simd).toLocaleString()} vs $${Math.round(shipped).toLocaleString()}`);
if (worst > 1) { console.log("  ✗ NOT FAITHFUL — every figure below is void."); process.exit(1); }
console.log("  ✓ faithful to the dollar — the loop below is Engine B's, with one term added\n");

// ── the split
const drawsNom = {}, drawsDef = {};
for (const d of D.schedule) { drawsNom[d.yr] = drawOf(d); drawsDef[d.yr] = defl(drawOf(d), d.yr); }
const variants = [
  ["shipped: no draws, 4.5% growth",            simulate(0.045, {})],
  ["C-8 fix ONLY: draws leave, 4.5% kept",      simulate(0.045, drawsNom)],
  ["C-8 fix, draws deflated, 4.5% kept",        simulate(0.045, drawsDef)],
  ["+ D's growth: draws leave, 3.518%",         simulate(0.03518, drawsNom)],
];
console.log("variant".padEnd(40), "lifetime RMD".padStart(14));
for (const [n, s] of variants) console.log(n.padEnd(40), ("$"+Math.round(Object.values(s).reduce((a,b)=>a+b,0)).toLocaleString()).padStart(14));
console.log(`${"Engine D's own lifetime RMD".padEnd(40)}${("$"+Math.round(D.schedule.reduce((s,r)=>s+r.rmd_y,0)).toLocaleString()).padStart(14)}`);

// ── feed each RMD series back through Engine B for the tax figure
const taper = {}; for (const r of B0.rows) if (r.work_y > 0) taper[r.yr] = r.work_y;
function taxOf(rmdSeries, drawSeries) {
  const P = JSON.parse(JSON.stringify(P0));
  P.positions = []; P.contributions = {};
  P.otherAccounts = (P.otherAccounts || []).filter(a => !["trad","annuity"].includes(a.taxType));
  const streams = [];
  for (const r of B0.rows) {
    const amt = (rmdSeries[r.yr] || 0) + (drawSeries[r.yr] || 0);
    if (amt > 1) streams.push({ id:"s"+r.yr, name:"s"+r.yr, monthly: amt/12, startYear:r.yr, endYear:r.yr, owner:"joint", tax:"ordinary", kind:"other", cola:false });
  }
  for (const [yr, amt] of Object.entries(taper)) streams.push({ id:"w"+yr, name:"w"+yr, monthly: amt/12, startYear:+yr, endYear:+yr, owner:"B", tax:"ordinary", kind:"work", cola:false });
  P.incomeStreams = streams; g.applyLoadedData({ portfolio: P });
  return E.computeTaxPlan(args).totFed;
}
console.log("\nLIFETIME FEDERAL TAX");
console.log(`  as shipped                                      $${Math.round(B0.totFed).toLocaleString()}`);
console.log(`  C-8 fix alone (draws leave, B keeps 4.5%)       $${Math.round(taxOf(simulate(0.045, drawsDef), drawsDef)).toLocaleString()}`);
console.log(`  C-8 fix + D's growth adopted (3.518%)           $${Math.round(taxOf(simulate(0.03518, drawsDef), drawsDef)).toLocaleString()}`);

// ── BUILD CHECK (v5.74) ── the one figure in the six C-8 probes that MOVES with the fix. ────────────────────
// Everything above measures Engine B WITHOUT the bridge, so it prints the same thing on every build and
// proves nothing about any of them. This block drives the REAL engine THROUGH the bridge and requires it
// to equal the reimplementation's prediction for the adopted design (draws deflated, B keeps 4.5%):
// the probe predicts the fix, the engine implements it, and they must agree to the dollar.
// A FRESH module instance (the "?buildcheck" URL is a separate ESM instance): taxOf() above rewrites
// this instance's portfolio through applyLoadedData, so reusing it would check the fixture, not the
// example household — and would still print a plausible number.
if (typeof g.withdrawalPlanSeries === "function") {
  const predRmd = Object.values(simulate(0.045, drawsDef)).reduce((a, b) => a + b, 0);
  const predFed = taxOf(simulate(0.045, drawsDef), drawsDef);
  const fm = await import(`../../app_${TAG}.mjs?buildcheck`); const fg = fm.__g, fE = fm.__engines;
  const fr = fg.PLAN_TIMELINE().targetRetireYear;
  const s = fg.withdrawalPlanSeries({ retireYear: fr, rothAmount: 0, scenarioPreset: "base" });
  const eng = fE.computeTaxPlan({ retireYear: fr, rothAmount: 0, qcdAnnual: 0, taxYield: 0, ordDrawByYr: s.ordDrawByYr });
  const engRmd = eng.rows.reduce((a, r) => a + r.rmd_y, 0);
  const okR = Math.abs(engRmd - predRmd) < 0.5, okF = Math.abs(eng.totFed - predFed) < 0.5;
  console.log("\nBUILD CHECK \u2014 the shipped engine, through the bridge, against this probe's prediction");
  console.log(`  lifetime RMD      engine $${Math.round(engRmd).toLocaleString()}   predicted $${Math.round(predRmd).toLocaleString()}   ${okR ? "\u2713" : "\u2717"}`);
  console.log(`  lifetime federal  engine $${Math.round(eng.totFed).toLocaleString()}   predicted $${Math.round(predFed).toLocaleString()}   ${okF ? "\u2713" : "\u2717"}`);
  if (!(okR && okF)) { console.log("  \u2717 THE BUILD DOES NOT IMPLEMENT THE DESIGN THIS PROBE MEASURED."); process.exit(1); }
} else {
  console.log("\nBUILD CHECK \u2014 skipped: no drawdown bridge on this build (pre-fix). Bind to v574 or later to run it.");
}
