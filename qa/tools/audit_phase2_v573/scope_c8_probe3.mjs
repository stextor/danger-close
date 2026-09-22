// scope_c8_probe3.mjs — C-8 / SCOPE_TAXES_DRAWDOWN §3.4. ASSERTS NOTHING; counted in no total.
//
// WHAT IT MEASURES. A PARTIAL counterfactual: what Engine B's federal tax becomes if it taxes Engine D's
// ordinary draws as ordinary income, with Engine B's own balance path — and therefore its RMDs —
// UNCHANGED. That isolates the EARLY half of C-8 (the missed tax) from the LATE half (the overstated
// RMDs), which pushes the other way. It is NOT the lifetime counterfactual; that one depends on the
// design chosen in the scope's §6 and is the build session's first task.
//
// HOW. The draw is injected as one ordinary, non-work, non-COLA income stream per drawing year, through
// `applyLoadedData` (a WRAPPER — OPERATIONS §C; `setPortfolio` does not rebuild PLAN_TIMELINE and Engine B
// reads both). Federal treatment of such a stream is identical to a Traditional draw: ordinary income,
// no FICA.
//
// ⚠ TWO LIMITS, BOTH MEASURED, BOTH LOAD-BEARING — do not quote this output without them.
//
//   1. THE 2029-2031 ROWS ARE CONTAMINATED AND ARE LABELLED AS SUCH BELOW. Any real income stream
//      suppresses the demo spouse-B work taper (the engine's documented behaviour: the taper is 0 once
//      the user has entered real streams). Measured: work_y 20,000 → 0 in 2029, 18,000 → 0 in 2030,
//      15,000 → 0 in 2031, with the FICA on it. Those three years therefore lose income in the fixture
//      and their deltas understate. 2032-2038 are clean — the household's only other ordinary income in
//      those years is the $4,800 pension.
//   2. THE STATE / TOTAL-TAX COLUMN IS NOT USABLE. The example household has stateCode undefined and a
//      fallback rate of 0, and the fixture routes the draw through the state module's WORK base rather
//      than its retirement base. Read the FEDERAL delta only.
//
// NEGATIVE CONTROL, run first and printed first: the same applyLoadedData round-trip with NO streams
// added must move Engine B by $0. If it does not, the deltas below are the fixture's and not the draws'.
//
// RUN: from a folder built by qa/mk_runfolder.sh, in qa/tools/audit_phase2_v573/:
//   node scope_c8_probe3.mjs
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

// ── negative control: the round-trip alone ──────────────────────────────────────────────────────
const Pc = JSON.parse(JSON.stringify(g.PORTFOLIO()));
g.applyLoadedData({ portfolio: Pc });
const Bc = E.computeTaxPlan(args);
let cFed = 0, cState = 0;
for (const a of B0.rows) { const b = Bc.rows.find(r => r.yr === a.yr); cFed += b.fedTax - a.fedTax; cState += b.stateTax - a.stateTax; }
console.log(`CONTROL — applyLoadedData round-trip with no streams: lifetime fed delta $${Math.round(cFed)}, state delta $${Math.round(cState)} (both must be 0)`);

// ── the draw series, recovered as in scope_c8_probe.mjs ─────────────────────────────────────────
const D = g.computeWithdrawalPlan({ retireYear: retire, rothAmount: 0, scenarioPreset: "base" });
const draw = {};
for (const d of D.schedule) {
  const r = d.magi - (0.85 * (d.ssA_y + d.ssB_y) + d.pen_y + d.work_y + d.rmd_y + d.conv_y + d.capGain_y);
  if (r > 1) draw[d.yr] = r;
}

const P = JSON.parse(JSON.stringify(g.PORTFOLIO()));
P.incomeStreams = Object.entries(draw).map(([yr, amt], i) => ({
  id: "c8_" + i, name: "C8 draw " + yr, monthly: amt / 12, startYear: +yr, endYear: +yr,
  owner: "joint", tax: "ordinary", kind: "other", cola: false,
}));
g.applyLoadedData({ portfolio: P });
const B1 = E.computeTaxPlan(args);

console.log("\nyr   | draw    | B work_y before→after | B fed now | B fed w/ draws | delta fed | note");
let clean = 0, quoted = 0;   // `quoted` = the scope's basis: 2032-2038, each year rounded
for (const yr of Object.keys(draw).map(Number)) {
  const a = B0.rows.find(r => r.yr === yr), b = B1.rows.find(r => r.yr === yr);
  const contaminated = a.work_y > 0;              // the taper years — see limit 1
  if (!contaminated) {
    clean += b.fedTax - a.fedTax;
    if (yr >= 2032 && yr <= 2038) quoted += Math.round(b.fedTax) - Math.round(a.fedTax);
  }
  console.log(`${yr} | ${String(Math.round(draw[yr]).toLocaleString()).padStart(7)} | ${String(Math.round(a.work_y).toLocaleString()).padStart(8)} → ${String(Math.round(b.work_y).toLocaleString()).padStart(6)} | ${String(Math.round(a.fedTax).toLocaleString()).padStart(9)} | ${String(Math.round(b.fedTax).toLocaleString()).padStart(14)} | ${String("+" + Math.round(b.fedTax - a.fedTax).toLocaleString()).padStart(9)} | ${contaminated ? "⚠ CONTAMINATED — taper suppressed, do not quote" : "clean"}`);
}
console.log(`\nFEDERAL UNDERSTATEMENT, CLEAN YEARS:`);
console.log(`  2032-2038, per-year figures rounded then summed: +$${Math.round(quoted).toLocaleString()}  ← the basis SCOPE_TAXES_DRAWDOWN §3.4 quotes`);
console.log(`  every clean year, unrounded (adds 2039's +$1):   +$${Math.round(clean).toLocaleString()}`);
console.log(`  The $2 spread is rounding, not disagreement. Quote a basis, never a bare number.`);
console.log(`Engine B lifetime RMD unchanged by the fixture? ${Math.round(B0.rows.reduce((s, r) => s + r.rmd_y, 0)) === Math.round(B1.rows.reduce((s, r) => s + r.rmd_y, 0)) ? "yes — this is the PARTIAL counterfactual by construction" : "NO — the fixture moved the balance path; the figure above is not what it claims"}`);
