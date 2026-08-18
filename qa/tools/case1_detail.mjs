// case1_detail.mjs — full expected figures + hand-verification inputs for the chosen fixture.
import { runHousehold, ledger } from "./sim_ledger.mjs";
const g = (await import("./qa/app_v537.mjs")).__g;

export const CASE1 = {
  single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035,
  dobAYr: 1965, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
  ssA: 3000, ssB: 1800, ssAYr: 2032, ssAMo: 6, ssBYr: 2033, ssBMo: 6,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.6,
  acaPremium: 1600, acaSize: 2, taxYieldPct: 1.5, currentConv: 0,
  tradInitA: 1200000, tradInitB: 600000, rothInitA: 60000, rothInitB: 40000, taxableInit: 400000,
};
const CONV = 186000;

// Guard: the sim must still match the engine on THIS fixture shape in v537 mode.
{
  const menu = [{ key: "n", policy: { kind: "fixed", amount: 0 } }, { key: "c", policy: { kind: "fixed", amount: CONV } }];
  const eng = g.runRothStrategies(CASE1, menu);
  const sim = runHousehold(CASE1, CONV, "v537");
  const pairs = [[eng[0], sim.baseline], [eng[1], sim.strat]];
  let ok = true;
  for (const [e, s] of pairs)
    for (const k of ["totTax", "totIrmaa", "totAcaLoss", "endTaxable", "endRoth", "endTrad", "estate"])
      if (Math.abs(e[k] - s[k]) > 1) { ok = false; console.log(`VALIDATION ✗ ${k}: ${e[k]} vs ${s[k]}`); }
  for (const [e, s] of pairs)
    for (const y of Object.keys(e.wealthByYr))
      if (Math.abs(e.wealthByYr[y] - s.wealthByYr[y]) > 1) { ok = false; console.log(`VALIDATION ✗ wealth[${y}]`); break; }
  console.log(`CASE1-shape validation vs engine: ${ok ? "CLEAN" : "FAILED"}`);
  if (!ok) process.exit(1);
}

const a = runHousehold(CASE1, CONV, "v537").strat;
const b = runHousehold(CASE1, CONV, "v538").strat;
console.log(`\n── CASE1 · fixed $${CONV.toLocaleString()} · v5.37 → v5.38 expected movement`);
for (const k of ["totTax", "totIrmaa", "totNiit", "totAcaLoss", "endTaxable", "endRoth", "endTrad", "estate"])
  console.log(`  ${k}: ${a[k].toLocaleString()} → ${b[k].toLocaleString()}${a[k] !== b[k] ? `  (Δ ${(b[k] - a[k]).toLocaleString()})` : "  (unchanged)"}`);

console.log(`\n── sale-year traces (v5.38)`);
for (const t of b.trace.filter(t => t.acaSale > 0 || t.acaGain > 0)) {
  const t37 = a.trace.find(x => x.yr === t.yr);
  console.log(`  ${t.yr}: lost $${t.lost.toLocaleString()} sale $${t.acaSale.toLocaleString()} (v537 $${t37.acaSale.toLocaleString()}) gain $${t.acaGain.toLocaleString()} gainTax $${t.acaGainTax.toLocaleString()} lookM $${t.lookM.toLocaleString()} (v537 $${t37.lookM.toLocaleString()}) sub $${t.sub.toLocaleString()}`);
}
console.log(`\n── per-year IRMAA (v537 → v538) where they differ`);
for (const t of b.trace) {
  const t37 = a.trace.find(x => x.yr === t.yr);
  if (t.irmaa !== t37.irmaa) console.log(`  ${t.yr}: $${t37.irmaa.toLocaleString()} → $${t.irmaa.toLocaleString()}`);
}

// Hand-verification inputs for the FIRST taxed-gain year: everything the memo's arithmetic needs.
console.log(`\n── hand-verification inputs`);
for (const yr of [2027, 2028]) {
  const t = b.trace.find(x => x.yr === yr);
  console.log(`  ${yr}: magi $${t.magi.toLocaleString()} · fundingSaleGain $${t.saleGain.toLocaleString()} · lost $${t.lost.toLocaleString()} · acaGain $${t.acaGain.toLocaleString()} · acaGainTax $${t.acaGainTax.toLocaleString()} · 0%-top(idx) $${Math.round(98900 * Math.pow(1.02, yr - 2026)).toLocaleString()}`);
}
