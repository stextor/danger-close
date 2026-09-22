// cf_a2.mjs — SCOPE_TAXES_DRAWDOWN §3.5 / §11 step 2: the A2 lifetime counterfactual. ASSERTS NOTHING.
// NOT A BUILD. No app source is modified. Engine B does ALL the tax arithmetic; the fixture only changes
// WHAT INCOME reaches it, which is exactly what A2 changes.
//
// A2 says: Engine B consumes Engine D's ordinary draws AND Engine D's balance path, so B's RMDs ARE D's.
// Emulated here by (a) removing Traditional/annuity balances from B's portfolio, which zeroes B's own RMD
// and its never-drawn balance path, and (b) injecting D's rmd_y + D's ordinary draws as ordinary income.
// D-3 says the imported series is deflated to Engine B's today's-dollar convention; both deflated and
// nominal are reported so the decision's cost is visible.
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
const B0 = E.computeTaxPlan(args);                       // as shipped
const D  = g.computeWithdrawalPlan({ retireYear: retire, rothAmount: 0, scenarioPreset: "base" });
const infl = g.expectedInflation();
const P0 = g.PORTFOLIO();

// the taper Engine B applies today, per year, so the fixture can restore it as a work stream
const taper = {}; for (const r of B0.rows) if (r.work_y > 0) taper[r.yr] = r.work_y;

const run = (deflate) => {
  const P = JSON.parse(JSON.stringify(P0));
  P.positions = [];                                             // no bucket money → no B-side RMD or trad path
  P.otherAccounts = (P.otherAccounts || []).filter(a => !["trad", "annuity"].includes(a.taxType));
  // ⚠ retireStartBalances ALSO adds contribAccrual (v5.10): 12 × monthly × years to retirement, which is
  // Traditional basis that no position carries. Stripping positions alone left B with $119,818 of lifetime
  // RMD on accrued contributions — caught by the fixture check, not by reading. Zero the schedule too.
  P.contributions = {};
  const streams = [];
  for (const d of D.schedule) {
    const draw = Math.max(0, d.magi - (0.85 * (d.ssA_y + d.ssB_y) + d.pen_y + d.work_y + d.rmd_y + d.conv_y + d.capGain_y));
    const nominal = draw + d.rmd_y;                             // A2's two imported terms
    if (nominal <= 1) continue;
    const amt = deflate ? nominal / Math.pow(1 + infl, Math.max(0, d.yr - retire)) : nominal;
    streams.push({ id: "a2_" + d.yr, name: "A2 " + d.yr, monthly: amt / 12, startYear: d.yr, endYear: d.yr,
      owner: "joint", tax: "ordinary", kind: "other", cola: false });
  }
  for (const [yr, amt] of Object.entries(taper))                // restore the demo work taper streams kill
    streams.push({ id: "w_" + yr, name: "work " + yr, monthly: amt / 12, startYear: +yr, endYear: +yr,
      owner: "B", tax: "ordinary", kind: "work", cola: false });
  P.incomeStreams = streams;
  g.applyLoadedData({ portfolio: P });
  return E.computeTaxPlan(args);
};

const Bdef = run(true), Bnom = run(false);
const sum = (r, k) => r.reduce((s, x) => s + x[k], 0);
// fixture integrity checks — a failed one invalidates the figures below
console.log("FIXTURE CHECKS");
console.log(`  B-side RMD zeroed?            ${Math.round(sum(Bdef.rows, "rmd_y"))} (must be 0)`);
console.log(`  work income preserved?        shipped ${Math.round(sum(B0.rows, "work_y")).toLocaleString()} vs fixture ${Math.round(sum(Bdef.rows, "work_y")).toLocaleString()}`);
console.log(`  FICA preserved?               shipped ${Math.round(sum(B0.rows, "fica")).toLocaleString()} vs fixture ${Math.round(sum(Bdef.rows, "fica")).toLocaleString()}`);
console.log(`  SS unchanged?                 shipped ${Math.round(sum(B0.rows, "ssTotal")).toLocaleString()} vs fixture ${Math.round(sum(Bdef.rows, "ssTotal")).toLocaleString()}`);
console.log(`  pension unchanged?            shipped ${Math.round(sum(B0.rows, "pen_y")).toLocaleString()} vs fixture ${Math.round(sum(Bdef.rows, "pen_y")).toLocaleString()}`);
console.log(`  same row count?               ${B0.rows.length} vs ${Bdef.rows.length}`);

console.log("\nLIFETIME FEDERAL INCOME TAX (Engine B's own arithmetic throughout)");
console.log(`  as shipped (C-8 live)                      $${Math.round(B0.totFed).toLocaleString()}`);
console.log(`  A2, draws+RMDs DEFLATED to B's units (D-3) $${Math.round(Bdef.totFed).toLocaleString()}   delta ${(Bdef.totFed - B0.totFed >= 0 ? "+" : "")}$${Math.round(Bdef.totFed - B0.totFed).toLocaleString()}`);
console.log(`  A2, same series NOMINAL (D-3 rejected)     $${Math.round(Bnom.totFed).toLocaleString()}   delta ${(Bnom.totFed - B0.totFed >= 0 ? "+" : "")}$${Math.round(Bnom.totFed - B0.totFed).toLocaleString()}`);
console.log(`  cost of the D-3 decision alone            $${Math.round(Bnom.totFed - Bdef.totFed).toLocaleString()}`);
console.log(`\nlifetime ordinary income reaching Engine B — shipped $${Math.round(sum(B0.rows,"ordinaryIncome")).toLocaleString()} | A2 deflated $${Math.round(sum(Bdef.rows,"ordinaryIncome")).toLocaleString()} | A2 nominal $${Math.round(sum(Bnom.rows,"ordinaryIncome")).toLocaleString()}`);
console.log(`Engine D's own lifetime RMD $${Math.round(D.schedule.reduce((s,r)=>s+r.rmd_y,0)).toLocaleString()} vs Engine B's shipped $${Math.round(sum(B0.rows,"rmd_y")).toLocaleString()}`);
console.log("\nfirst ten years — yr | shipped fed | A2 deflated fed | A2 nominal fed");
for (const r of B0.rows.slice(0, 10)) {
  const a = Bdef.rows.find(x => x.yr === r.yr), b = Bnom.rows.find(x => x.yr === r.yr);
  console.log(`  ${r.yr} | ${String(Math.round(r.fedTax).toLocaleString()).padStart(9)} | ${String(Math.round(a.fedTax).toLocaleString()).padStart(15)} | ${String(Math.round(b.fedTax).toLocaleString()).padStart(14)}`);
}
