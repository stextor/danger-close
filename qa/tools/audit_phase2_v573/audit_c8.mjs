// SESSION-ONLY (Phase 2, C-8): Traditional withdrawals Engine D makes that Engine B never taxes. Example household, as shipped.
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const tl = g.PLAN_TIMELINE();
const D = g.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, scenarioPreset: "base" });
const B = E.computeTaxPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
let unseen = 0, yrs = 0, first = null; const lines = [];
for (const d of D.schedule) {
  const b = B.rows.find(x => x.yr === d.yr); if (!b) continue;
  const tot = (d.tradNotional || 0) + (d.rothNotional || 0);
  const tf = tot > 0 ? d.tradNotional / tot : 0;
  const k401 = d.drawFromB1 + d.drawFromB2 + d.drawFromB3 + d.drawFromB4;
  const tradDraw = Math.max(0, k401 * tf - (d.rmd_y || 0));     // spending draws from Traditional beyond the RMD
  if (tradDraw > 1) { unseen += tradDraw; yrs++; if (!first) first = d.yr;
    if (lines.length < 8) lines.push(`${d.yr}: D draws ${Math.round(k401)} from retirement buckets (~${Math.round(tf * 100)}% Traditional → ~${Math.round(tradDraw)} taxable beyond RMD ${Math.round(d.rmd_y)}); B ordinary income ${Math.round(b.ordinaryIncome)}, B fed tax ${Math.round(b.fedTax)}`); }
}
console.log(`single=${tl.single}, retire ${tl.targetRetireYear}. Years with Traditional spending draws Engine B does not see: ${yrs} (first ${first}); total ≈ $${Math.round(unseen).toLocaleString()} nominal`);
lines.forEach(l => console.log("  " + l));
console.log(`lifetime fed tax — Engine B (Taxes tab): $${Math.round(B.rows.reduce((s, r) => s + r.fedTax, 0)).toLocaleString()}`);
const rmdB = B.rows.reduce((s, r) => s + (r.rmd_y || 0), 0), rmdD = D.schedule.reduce((s, r) => s + (r.rmd_y || 0), 0);
console.log(`lifetime RMDs — Engine B $${Math.round(rmdB).toLocaleString()} vs Engine D $${Math.round(rmdD).toLocaleString()}`);
