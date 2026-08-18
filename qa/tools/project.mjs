// project.mjs — STAGE 2: v5.38 expected figures from the validated ledger,
// plus the numeric search for the IRMAA-crossing fixture (case 1a).
import { runHousehold, ledger } from "./sim_ledger.mjs";

const BRIDGE = {
  single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035,
  dobAYr: 1965, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
  ssA: 3000, ssB: 1800, ssAYr: 2032, ssAMo: 6, ssBYr: 2033, ssBMo: 6,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.5,
  acaPremium: 1600, acaSize: 2, taxYieldPct: 1.5, currentConv: 0,
  tradInitA: 600000, tradInitB: 300000, rothInitA: 60000, rothInitB: 40000, taxableInit: 250000,
};
const IDX = 1.02;
const thrTier1 = (premiumYr) => 218000 * Math.pow(IDX, premiumYr - 2026);

function diffReport(label, P, conv) {
  const a = runHousehold(P, conv, "v537").strat;
  const b = runHousehold(P, conv, "v538").strat;
  console.log(`\n── ${label} · fixed $${conv.toLocaleString()}`);
  for (const k of ["totTax", "totIrmaa", "totAcaLoss", "endTaxable", "endRoth", "endTrad", "estate"])
    if (a[k] !== b[k]) console.log(`  ${k}: ${a[k].toLocaleString()} → ${b[k].toLocaleString()}  (Δ ${(b[k] - a[k]).toLocaleString()})`);
  const saleYrs = b.trace.filter(t => t.acaSale > 0);
  for (const t of saleYrs) {
    const t37 = a.trace.find(x => x.yr === t.yr);
    console.log(`  ${t.yr}: lost $${t.lost.toLocaleString()} → sale $${t.acaSale.toLocaleString()} (v537 $${t37.acaSale.toLocaleString()}), gain $${t.acaGain.toLocaleString()} (v537 $${t37.acaGain.toLocaleString()}), gainTax $${t.acaGainTax.toLocaleString()}, lookM $${t.lookM.toLocaleString()} (v537 $${t37.lookM.toLocaleString()})`);
  }
  return { a, b };
}

diffReport("BRIDGE", BRIDGE, 60000);
diffReport("BRIDGE", BRIDGE, 40000);
diffReport("BRIDGE small (0%-bracket probe)", BRIDGE, 15000);

// Invariance checks: no-ACA household and the none strategy must be BYTE-identical across modes.
{
  const noAca = { ...BRIDGE, acaPremium: 0, acaSize: 0 };
  const a = runHousehold(noAca, 60000, "v537").strat, b = runHousehold(noAca, 60000, "v538").strat;
  const idA = JSON.stringify([a.totTax, a.totIrmaa, a.estate, a.wealthByYr]);
  const idB = JSON.stringify([b.totTax, b.totIrmaa, b.estate, b.wealthByYr]);
  console.log(`\nINVARIANCE acaPremium:0 identical across modes: ${idA === idB}`);
  const n537 = runHousehold(BRIDGE, 0, "v537").strat, n538 = runHousehold(BRIDGE, 0, "v538").strat;
  console.log(`INVARIANCE none-strategy identical across modes: ${JSON.stringify([n537.totTax, n537.estate, n537.wealthByYr]) === JSON.stringify([n538.totTax, n538.estate, n538.wealthByYr])}`);
}

// ── Case-1a search: a household + conv where the acaGain term flips a 2028→2030 IRMAA tier ──
// Requirements: gain year 2028 (premium year 2030, personsA=1); (magi+saleGain) just under
// thrTier1(2030) ≈ $235,970; acaGain pushes over. Larger balances give sale years real gains.
console.log(`\n── case-1a sweep (thr for premium-yr 2030 = $${Math.round(thrTier1(2030)).toLocaleString()})`);
outer:
for (const pen of [0, 1000, 2000]) {
  for (let conv = 150000; conv <= 230000; conv += 2500) {
    const P = { ...BRIDGE, pen, tradInitA: 1200000, tradInitB: 600000, taxableInit: 400000, taxableGainFrac: 0.6 };
    const r = runHousehold(P, conv, "v538").strat;
    const t = r.trace.find(x => x.yr === 2028);
    if (!t || t.acaGain <= 0) continue;
    const withoutTerm = t.magi + t.saleGain;       // what the lookback sees WITHOUT decision 1
    const withTerm = t.lookM;                       // with it
    const thr = thrTier1(2030);
    if (withoutTerm < thr && withTerm > thr) {
      console.log(`  FOUND pen=${pen} conv=${conv}: lookback ${Math.round(withoutTerm).toLocaleString()} < ${Math.round(thr).toLocaleString()} < ${Math.round(withTerm).toLocaleString()} (acaGain $${t.acaGain.toLocaleString()})`);
      const v537 = runHousehold(P, conv, "v537").strat;
      console.log(`  totIrmaa: v537 $${v537.totIrmaa.toLocaleString()} → v538 $${r.totIrmaa.toLocaleString()} (Δ $${(r.totIrmaa - v537.totIrmaa).toLocaleString()})`);
      // non-crossing year in the same schedule:
      const t29 = r.trace.find(x => x.yr === 2029);
      if (t29) console.log(`  2029 (non-crossing check): lookM $${t29.lookM.toLocaleString()} vs thr(2031) $${Math.round(thrTier1(2031)).toLocaleString()} — acaGain $${t29.acaGain.toLocaleString()}`);
      console.log(`  FIXTURE: pen ${pen}, conv ${conv}, trad 1.2M/600K, taxable 400K @ gainFrac 0.6`);
      break outer;
    }
  }
}
