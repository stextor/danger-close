// ⚠ HARNESS ARTEFACT, KEPT AS A RECORD (FlawsToFix-v5_73-Phase2 §2, session 6): this probe adds an Other account WITHOUT
//   updating PORTFOLIO.household, which the app maintains in buildPortfolio. Its Engine D lines therefore show Engine D
//   not moving — that is the artefact, NOT a finding. Use audit_accts3.mjs for Engine D. The Engine B / start-balance lines
//   are unaffected (they read retireStartBalances, not household); audit_accts2's annuity lines are the C-9 evidence.
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const run = (other) => { const P = JSON.parse(JSON.stringify(BASE)); P.otherAccounts = other ? [other] : []; P.stateCode = null;
  g.applyLoadedData({ portfolio: P }); const ry = g.PLAN_TIMELINE().targetRetireYear;
  return { sb: g.retireStartBalances(ry), B: E.computeTaxPlan({ retireYear: ry, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }).rows,
           D: g.computeWithdrawalPlan({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" }) }; };
const b0 = run(null), an = run({ name: "annuity", balance: 100000, taxType: "annuity", owner: "A" }), tx = run({ name: "brokerage", balance: 100000, taxType: "taxable", owner: "A" });
console.log("start balances, base vs annuity:", JSON.stringify({ tradInitA: [b0.sb.tradInitA, an.sb.tradInitA], rmdInitA: [b0.sb.rmdInitA, an.sb.rmdInitA], annShareA: [b0.sb.annShareA, an.sb.annShareA], othOrdA: [b0.sb.othOrdA, an.sb.othOrdA] }));
for (const yr of [2040, 2041, 2045, 2050, 2055]) {
  const r0 = b0.B.find(r => r.yr === yr), r1 = an.B.find(r => r.yr === yr);
  if (r0 && r1) console.log(`B ${yr} ageA ${r1.ageA}: rmd base ${Math.round(r0.rmd_y)} → annuity ${Math.round(r1.rmd_y)} (rmdTax ${Math.round(r0.rmdTax_y)} → ${Math.round(r1.rmdTax_y)})`);
}
const f0 = b0.D.schedule[0], f1 = tx.D.schedule[0];
console.log("D first row, base vs +100k Other taxable:", JSON.stringify({ yr: f0.yr, taxable: [Math.round(f0.taxable), Math.round(f1.taxable)], drawFromTaxable: [Math.round(f0.drawFromTaxable), Math.round(f1.drawFromTaxable)], portfolioTotal: [Math.round(f0.portfolioTotal), Math.round(f1.portfolioTotal)] }));
console.log("D last row portfolioTotal, base vs +taxable:", Math.round(b0.D.schedule.at(-1).portfolioTotal), Math.round(tx.D.schedule.at(-1).portfolioTotal));
