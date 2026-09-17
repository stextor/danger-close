// SESSION-ONLY (Phase 2, C-5): Engine D's schedule bracket/MAGI columns vs Engine B, single household. Asserts nothing.
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const load = (single) => { const P = JSON.parse(JSON.stringify(BASE));
  Object.assign(P, { stateCode: null, single, lifeExpA: 95, lifeExpB: 95 });
  g.applyLoadedData({ portfolio: P }); };
for (const single of [true, false]) {
  load(single);
  const tl = g.PLAN_TIMELINE();
  const D = g.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, scenarioPreset: "base" });
  const B = E.computeTaxPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
  const rowsD = D.schedule || D.rows || [];
  let shown = 0, mism = 0; const ex = [];
  for (const d of rowsD) {
    const b = B.rows.find(x => x.yr === d.yr); if (!b) continue;
    shown++;
    if (d.bracket !== b.bracket) { mism++; if (ex.length < 6) ex.push(`${d.yr}: D bracket ${d.bracket} (MAGI ${Math.round(d.magi)}) vs B bracket ${b.bracket} (taxable ${Math.round(b.taxableOrdinary)}, ${b.filing}, ssTaxable ${Math.round(b.ssTaxable)} of ${Math.round(b.ssTotal)})`); }
  }
  console.log(`${single ? "SINGLE" : "JOINT"} example household: ${shown} common years, ${mism} with a different bracket from Engine B`);
  ex.forEach(x => console.log("   " + x));
}
