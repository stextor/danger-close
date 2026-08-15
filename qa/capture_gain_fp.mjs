// Captures a full-precision fingerprint of every engine that touches the realized-gain rule.
// Used ONLY to prove that extracting `realizeGain()` is a behaviour no-op (OPERATIONS §M
// pattern: refactor, prove every figure identical, THEN change behaviour in a later step).
// usage: node capture_gain_fp.mjs <outfile>
import fs from "fs";

let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

const MOD = await import("./app_testable.mjs");
const g = MOD.__g, E = MOD.__engines;

const out = {};

// Engine D across a spread of params AND a spread of declared shares — the share is the input
// the helper is being extracted around, so a single share would prove almost nothing.
const P0 = g.PORTFOLIO();
for (const share of [0, 15, 40, 95]) {
  P0.taxableGainPct = share;
  for (const rothAmount of [0, 35000, 70000]) {
    for (const preset of ["base", "bear"]) {
      const r = g.computeWithdrawalPlan({ retireYear: 2027, rothAmount, scenarioPreset: preset });
      out[`D|${share}|${rothAmount}|${preset}`] = {
        totalDrawn: r.totalDrawn, totalConverted: r.totalConverted, avgWR: r.avgWR,
        rows: r.schedule.map(x => [x.yr, x.capGain_y, x.taxBasis, x.taxable, x.magi, x.drawFromTaxable]),
      };
    }
  }
}
P0.taxableGainPct = 0;

// Engines B and C consume D's series, so they witness the extraction too.
for (const share of [0, 40]) {
  P0.taxableGainPct = share;
  const A = { retireYear: 2027, rothAmount: 0, qcdAnnual: 0, taxYield: 1.5 };
  const b = E.computeTaxPlan(A);
  const c = E.computeIrmaaPlan(A);
  out[`B|${share}`] = b.rows.map(x => [x.yr, x.capGains_y, x.qdcg_y, x.magi]);
  out[`C|${share}`] = c.rows.map(x => [x.yr, x.magi]);
}
P0.taxableGainPct = 0;

fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
const n = Object.keys(out).length;
console.log(`captured ${n} series -> ${process.argv[2]}`);
