// validate.mjs — STAGE 1: the sim must reproduce shipped v5.37 EXACTLY.
import { ledger } from "./sim_ledger.mjs";
const g = (await import("./qa/app_v537.mjs")).__g;

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

let pass = 0, fail = 0;
const near = (a, b, tol) => Math.abs(a - b) <= tol;
function compare(label, P, amounts) {
  const menu = amounts.map(a => ({ key: `fx${a}`, label: String(a), policy: { kind: "fixed", amount: a } }));
  const eng = g.runRothStrategies(P, menu);
  // Engine computes baseline internally; sim mirrors the two-stage wiring.
  const simBase = ledger(P, 0, null, "v537");
  for (let i = 0; i < amounts.length; i++) {
    const e = eng[i], s = ledger(P, amounts[i], simBase.acaSubByYr, "v537");
    const rows = [
      ["totTax", e.totTax, s.totTax, 1], ["totIrmaa", e.totIrmaa, s.totIrmaa, 1],
      ["totNiit", e.totNiit, s.totNiit, 1], ["totConv", e.totConv, s.totConv, 1],
      ["totAcaLoss", e.totAcaLoss, s.totAcaLoss, 1],
      ["endTrad", e.endTrad, s.endTrad, 1], ["endRoth", e.endRoth, s.endRoth, 1],
      ["endTaxable", e.endTaxable, s.endTaxable, 1], ["estate", e.estate, s.estate, 1],
    ];
    for (const [n, ev, sv, tol] of rows) {
      if (near(ev, sv, tol)) pass++;
      else { fail++; console.log(`✗ ${label}/fx${amounts[i]} ${n}: engine ${ev} sim ${sv} (Δ ${sv - ev})`); }
    }
    const yrs = Object.keys(e.wealthByYr);
    let wOK = true, sOK = true;
    for (const y of yrs) if (!near(e.wealthByYr[y], s.wealthByYr[y], 1)) {
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
console.log(`\nVALIDATION ${fail === 0 ? "CLEAN" : "FAILED"} — ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
