// scope_c8_probe2.mjs — C-8 / SCOPE_TAXES_DRAWDOWN §3.2, decision D-8. ASSERTS NOTHING; counted in no total.
//
// WHAT IT MEASURES. How far the bridge quantity moves with the two things the user can change:
//
//   1. THE MONTE CARLO SCENARIO. Engine D's schedule takes `scenarioPreset`; Engine B does not. The
//      gains bridge already follows the selected scenario (call site L10117-10118) and the tab says so
//      (L10140). If draws follow it too, the Taxes tab's lifetime figure starts moving with the scenario
//      picker — correct, but new, which is why D-8 is a decision and not an implementation detail.
//   2. THE ROTH CONVERSION SLIDER. Both engines take `rothAmount` but cap it differently (B at
//      tradBal − max(rmd,qcd), L5610; D at tradNotional_boy − rmd, L5155). The RMD divergence is printed
//      at both slider settings to show it is not an artifact of the default.
//
// The draw series is recovered as in scope_c8_probe.mjs — valid only on a household with no ordinary
// income streams. See that file's header.
//
// RUN: from a folder built by qa/mk_runfolder.sh, in qa/tools/audit_phase2_v573/:
//   node scope_c8_probe2.mjs
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const tl = g.PLAN_TIMELINE(); const retire = tl.targetRetireYear;
const drawOf = (s) => s.schedule.reduce((t, d) =>
  t + Math.max(0, d.magi - (0.85 * (d.ssA_y + d.ssB_y) + d.pen_y + d.work_y + d.rmd_y + d.conv_y + d.capGain_y)), 0);

console.log("SCENARIO SENSITIVITY (rothAmount 0)");
for (const sc of ["base", "bear", "bull"]) {
  const S = g.computeWithdrawalPlan({ retireYear: retire, rothAmount: 0, scenarioPreset: sc });
  console.log(`  ${sc.padEnd(5)} lifetime ordinary draw $${Math.round(drawOf(S)).toLocaleString()} | lifetime RMD $${Math.round(S.schedule.reduce((s, r) => s + r.rmd_y, 0)).toLocaleString()}`);
}

console.log("\nCONVERSION SENSITIVITY (base preset) — the RMD divergence at both slider settings");
for (const ra of [0, 70000]) {
  const S = g.computeWithdrawalPlan({ retireYear: retire, rothAmount: ra, scenarioPreset: "base" });
  const BB = E.computeTaxPlan({ retireYear: retire, rothAmount: ra, qcdAnnual: 0, taxYield: 0 });
  const rD = S.schedule.reduce((s, r) => s + r.rmd_y, 0), rB = BB.rows.reduce((s, r) => s + r.rmd_y, 0);
  console.log(`  rothAmount ${String(ra).padStart(6)} | D conv $${Math.round(S.schedule.reduce((s, r) => s + r.conv_y, 0)).toLocaleString()} vs B conv $${Math.round(BB.totConversions).toLocaleString()}`);
  console.log(`                   | D RMD $${Math.round(rD).toLocaleString()} vs B RMD $${Math.round(rB).toLocaleString()} (B is ${(rB / rD).toFixed(2)}x D) | D draw $${Math.round(drawOf(S)).toLocaleString()} | B lifetime fed $${Math.round(BB.totFed).toLocaleString()}`);
}
