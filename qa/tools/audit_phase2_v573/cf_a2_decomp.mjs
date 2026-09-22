// cf_a2_decomp.mjs — SCOPE_TAXES_DRAWDOWN §3.5: which half of A2 moves the lifetime number. ASSERTS NOTHING.
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
const taper = {}; for (const r of B0.rows) if (r.work_y > 0) taper[r.yr] = r.work_y;
const drawOf = d => Math.max(0, d.magi - (0.85*(d.ssA_y+d.ssB_y) + d.pen_y + d.work_y + d.rmd_y + d.conv_y + d.capGain_y));
const defl = (v, yr) => v / Math.pow(1 + infl, Math.max(0, yr - retire));

// stripTrad: emulate B consuming D's BALANCE PATH (B's own RMD goes to 0, D's rmd_y is imported instead)
// withDraws: import D's ordinary spending draws
const run = ({ stripTrad, withDraws, withRmd, rmdNominal }) => {
  const P = JSON.parse(JSON.stringify(P0));
  if (stripTrad) {
    P.positions = [];
    P.otherAccounts = (P.otherAccounts || []).filter(a => !["trad","annuity"].includes(a.taxType));
    P.contributions = {};
  }
  const streams = [];
  for (const d of D.schedule) {
    let amt = 0;
    if (withDraws) amt += defl(drawOf(d), d.yr);
    if (withRmd)   amt += rmdNominal ? d.rmd_y : defl(d.rmd_y, d.yr);
    if (amt <= 1) continue;
    streams.push({ id:"x_"+d.yr, name:"x"+d.yr, monthly: amt/12, startYear:d.yr, endYear:d.yr,
      owner:"joint", tax:"ordinary", kind:"other", cola:false });
  }
  if (stripTrad || withDraws) for (const [yr, amt] of Object.entries(taper))
    streams.push({ id:"w_"+yr, name:"w"+yr, monthly: amt/12, startYear:+yr, endYear:+yr, owner:"B", tax:"ordinary", kind:"work", cola:false });
  P.incomeStreams = streams;
  g.applyLoadedData({ portfolio: P });
  const R = E.computeTaxPlan(args);
  return { fed: R.totFed, rmd: R.rows.reduce((s,r)=>s+r.rmd_y,0), ord: R.rows.reduce((s,r)=>s+r.ordinaryIncome,0) };
};

const rows = [
  ["as shipped (C-8 live)",                       { fed: B0.totFed, rmd: B0.rows.reduce((s,r)=>s+r.rmd_y,0), ord: B0.rows.reduce((s,r)=>s+r.ordinaryIncome,0) }],
  ["A1 — draws only, B keeps its own RMD path",   run({ stripTrad:false, withDraws:true,  withRmd:false })],
  ["balance path only — D's RMDs, no draws",      run({ stripTrad:true,  withDraws:false, withRmd:true  })],
  ["A2 — draws + balance path (both, deflated)",  run({ stripTrad:true,  withDraws:true,  withRmd:true  })],
  ["A2 — draws deflated, D's RMD left NOMINAL",   run({ stripTrad:true,  withDraws:true,  withRmd:true, rmdNominal:true })],
];
console.log("scenario".padEnd(46), "lifetime fed".padStart(13), "lifetime RMD".padStart(14), "lifetime ordinary".padStart(18));
for (const [n, r] of rows)
  console.log(n.padEnd(46), ("$"+Math.round(r.fed).toLocaleString()).padStart(13), ("$"+Math.round(r.rmd).toLocaleString()).padStart(14), ("$"+Math.round(r.ord).toLocaleString()).padStart(18));
console.log(`\nEngine D's own lifetime RMD, for reference: $${Math.round(D.schedule.reduce((s,r)=>s+r.rmd_y,0)).toLocaleString()}`);
