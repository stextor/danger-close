// scope_c8_probe.mjs — C-8 / SCOPE_TAXES_DRAWDOWN §3.1, §3.2, §3.3. ASSERTS NOTHING; counted in no total.
//
// WHAT IT MEASURES. The quantity a C-8 fix would have to bridge, plus the two engine disagreements the
// audit did not record: growth rate and units.
//
//   1. Engine D's OWN ordinary-draw recognition, backed out of its published `magi` identity. Engine D
//      computes `tradDraw` (L5302) and `othOrdDraw` (L5241) and does NOT publish either in the schedule
//      row (L5382-5401), so they are recovered as the residual of L5372:
//         magi = 0.85*(ssA+ssB) + pen + work + streamsOrd + rmd + tradDraw + othOrdDraw + conv + capGain
//      ⚠ VALID ONLY WHERE `streamsOrd_y` IS 0. The shipped example household has no income streams
//      (incomeSources carries ssA, ssB and pension only — printed below so the reader can check), so the
//      residual is exactly tradDraw + othOrdDraw. On a household WITH ordinary streams this over-reports
//      by the stream amount. Publish the two terms and this probe ages out.
//   2. Lifetime RMDs, Engine B against Engine D.
//   3. Engine D's scenario-derived bucket growth against Engine B's flat BASE_GROWTH (L5546 / L993).
//   4. The unit check: Engine D COLAs Social Security, Engine B holds it flat in today's dollars while
//      inflating brackets 2%/yr (its own comment, L5573-5575).
//
// WHY THE FIGURE DIFFERS FROM audit_c8.mjs. That probe counts post-2031 BUCKET draws net of RMD
// (≈$238,144). This one counts every dollar of draw Engine D taxes, which starts at retirement and
// includes the taxable sleeve's ordinary share ($352,485 on base). Both are correct measures of
// different quantities; the BRIDGE quantity is this one.
//
// RUN: from a folder built by qa/mk_runfolder.sh, in qa/tools/audit_phase2_v573/:
//   node scope_c8_probe.mjs
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const tl = g.PLAN_TIMELINE();
const src = g.PORTFOLIO().incomeSources || {};
console.log("incomeSources on the example household (no streams → the residual below is exact):");
console.log("  " + JSON.stringify(src).slice(0, 300));
const D = g.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, scenarioPreset: "base" });
const B = E.computeTaxPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });

let tot = 0, totB = 0, totD = 0;
console.log("\nyr | D ordinary draw (residual) | D rmd | B rmd | D tradNotional | B ordinaryIncome | B fedTax");
for (const d of D.schedule) {
  const b = B.rows.find(x => x.yr === d.yr); if (!b) continue;
  const resid = d.magi - (0.85 * (d.ssA_y + d.ssB_y) + d.pen_y + d.work_y + d.rmd_y + d.conv_y + d.capGain_y);
  tot += Math.max(0, resid); totD += d.rmd_y; totB += b.rmd_y;
  if (d.yr <= tl.targetRetireYear + 13 || d.yr % 5 === 0)
    console.log(`${d.yr} | ${Math.round(resid).toLocaleString()} | ${Math.round(d.rmd_y).toLocaleString()} | ${Math.round(b.rmd_y).toLocaleString()} | ${Math.round(d.tradNotional).toLocaleString()} | ${Math.round(b.ordinaryIncome).toLocaleString()} | ${Math.round(b.fedTax).toLocaleString()}`);
}
console.log(`\nlifetime ordinary draw Engine D recognises and Engine B does not: $${Math.round(tot).toLocaleString()}`);
console.log(`lifetime RMD — D $${Math.round(totD).toLocaleString()} | B $${Math.round(totB).toLocaleString()}`);
console.log(`first year each engine shows an RMD — D ${D.schedule.find(r => r.rmd_y > 0)?.yr}, B ${B.rows.find(r => r.rmd_y > 0)?.yr}`);

const P = g.PORTFOLIO();
const w = [1, 2, 3, 4].reduce((s, i) => s + (P.bucketActuals[i] || 0) * D.growth["b" + i], 0);
console.log(`\nGROWTH — Engine D weighted 401k growth (base preset) ${(w * 100).toFixed(3)}% vs Engine B tradGrowth 4.500% (BASE_GROWTH, L993)`);
console.log(`  per-bucket: ${JSON.stringify(D.growth)}  bucketActuals: ${JSON.stringify(P.bucketActuals)}`);

const d5 = D.schedule[5], b5 = B.rows.find(r => r.yr === d5.yr);
console.log(`\nUNITS — ${d5.yr}: D ssA ${Math.round(d5.ssA_y).toLocaleString()} (COLA'd) vs B ssA ${Math.round(b5.ssA_y).toLocaleString()} (flat, today's dollars); D pen ${Math.round(d5.pen_y).toLocaleString()} vs B pen ${Math.round(b5.pen_y).toLocaleString()}`);
console.log(`horizon D ${D.schedule[D.schedule.length - 1].yr}, B ${B.rows[B.rows.length - 1].yr}; retire ${tl.targetRetireYear}; single ${tl.single}`);
