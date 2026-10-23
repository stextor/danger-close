// validate_v630.mjs — the reference ledger's v6.30 mode must reproduce the v6.30 engine EXACTLY before any figure is derived from it
// (D-60, docs/SCOPE_D60_DOLLAR_UNITS_V630.md; the v5.38 STAGE-1 discipline of validate.mjs, applied to the new units).
// Run from qa/:  node tools/validate_v630.mjs [tag]   (default v630; reads ./app_<tag>.mjs)
import { ledger, EXPECTED_INFL_SIM } from "./sim_ledger.mjs";
const TAG = process.argv[2] || "v630";
const g = (await import(new URL(`../app_${TAG}.mjs`, import.meta.url).href)).__g;

// The ledger's own transcription of the BASE prior's inflation must be the module's table, or the two are not on one clock.
const planInfl = Object.values(g.SCENARIOS()).reduce((s, sc) => s + sc.prob * sc.inflation, 0);
let pass = 0, fail = 0;
if (Math.abs(planInfl - EXPECTED_INFL_SIM) < 1e-12) pass++;
else { fail++; console.log(`✗ the ledger's inflation ${EXPECTED_INFL_SIM} is not the module's ${planInfl}`); }

const BRIDGE = { // t22's bridge household, verbatim
  single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035,
  dobAYr: 1965, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
  ssA: 3000, ssB: 1800, ssAYr: 2032, ssAMo: 6, ssBYr: 2033, ssBMo: 6,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.5,
  acaPremium: 1600, acaSize: 2, taxYieldPct: 1.5, currentConv: 0,
  tradInit: 900000, rothInit: 100000, tradInitA: 600000, tradInitB: 300000,
  rothInitA: 60000, rothInitB: 40000, taxableInit: 250000,
};
const PEN = { ...BRIDGE, pen: 2500, taxYieldPct: 0, taxableGainFrac: 0.6, taxableInit: 400000,
  tradInitA: 900000, tradInitB: 500000, tradInit: 1400000 };
// t22 group I's households (CASE1, BR60) and the late-retiring PEN variant, so every figure group I pins is inside the validated set.
const CASE1 = { ...BRIDGE, taxableGainFrac: 0.6, tradInitA: 1200000, tradInitB: 600000, taxableInit: 400000 };
const BR60 = { ...CASE1, taxableGainFrac: 0.5, taxableInit: 250000, tradInitA: 600000, tradInitB: 300000 };
const LATE = { ...PEN, asOfYr: 2026, retireYr: 2031 };

const near = (a, b, tol) => Math.abs(a - b) <= tol;
function compare(label, P, amounts) {
  const menu = amounts.map(a => ({ key: `fx${a}`, label: String(a), policy: { kind: "fixed", amount: a } }));
  const eng = g.runRothStrategies(P, menu);
  const simBase = ledger(P, 0, null, "v630");
  for (let i = 0; i < amounts.length; i++) {
    const e = eng[i], s = ledger(P, amounts[i], simBase.acaSubByYr, "v630");
    for (const n of ["totTax", "totIrmaa", "totNiit", "totConv", "totAcaLoss", "endTrad", "endRoth", "endTaxable", "estate"]) {
      if (near(e[n], s[n], 1)) pass++;
      else { fail++; console.log(`✗ ${label}/fx${amounts[i]} ${n}: engine ${e[n]} sim ${s[n]} (Δ ${s[n] - e[n]})`); }
    }
    let wOK = true, sOK = true;
    for (const y of Object.keys(e.wealthByYr)) if (!near(e.wealthByYr[y], s.wealthByYr[y], 1)) {
      wOK = false; console.log(`✗ ${label}/fx${amounts[i]} wealth[${y}]: ${e.wealthByYr[y]} vs ${s.wealthByYr[y]}`); break; }
    for (const y of Object.keys(e.acaSubByYr)) if (!near(e.acaSubByYr[y], s.acaSubByYr[y] ?? -9, 0.01)) {
      sOK = false; console.log(`✗ ${label}/fx${amounts[i]} sub[${y}]: ${e.acaSubByYr[y]} vs ${s.acaSubByYr[y]}`); break; }
    if (wOK) pass++; else fail++;
    if (sOK) pass++; else fail++;
    if (JSON.stringify(Object.keys(e.acaFloorYrs)) === JSON.stringify(Object.keys(s.acaFloorYrs))) pass++;
    else { fail++; console.log(`✗ ${label}/fx${amounts[i]} floorYrs keys differ`); }
  }
}
compare("BRIDGE", BRIDGE, [0, 40000, 60000]);
compare("PEN", PEN, [0, 30000, 80000]);
compare("CASE1", CASE1, [0, 186000]);
compare("BR60", BR60, [0, 60000]);
compare("CASE1-noACA", { ...CASE1, acaPremium: 0, acaSize: 0 }, [0, 186000]);
compare("LATE", LATE, [0, 50000]);
console.log(`\nVALIDATION (v630 mode vs app_${TAG}) ${fail === 0 ? "CLEAN" : "FAILED"} — ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
