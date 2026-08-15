// PROBE (not a suite — asserts nothing, counts toward no total).
// Question: under convTaxFunding === "withhold", does Engine A sell taxable assets and
// realize capital gain? The Field Manual and the Roth-tab helper text both say "no sale,
// no gains tax". usage: node probe_withhold_gain.mjs <app_vXXX.mjs>
let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

const MOD = await import(process.argv[2]);
const g = MOD.__g;

const baseP = () => ({
  single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2058,
  ladderEnd: 2037, ladderEndA: 2037, ladderEndB: 2039,
  dobAYr: 1964, dobBYr: 1966, deathYr1: 2052, survivor: "B",
  ssA: 2800, ssB: 1400, ssAYr: 2031, ssAMo: 3, ssBYr: 2033, ssBMo: 6,
  pen: 800, stateRate: 0.04, stateCode: "GA",
  convTaxFunding: "withhold", taxableGainFrac: 0,
  acaPremium: 0, acaSize: 0, taxYieldPct: 1.5, currentConv: 70000,
  tradInit: 1000000, rothInit: 200000,
  tradInitA: 600000, tradInitB: 400000, rothInitA: 150000, rothInitB: 50000,
  taxableInit: 300000,
});

const pick = (P) => {
  const r = g.runRothStrategies(P).find(x => x.key === "current");
  return { totTax: r.totTax, endRoth: r.endRoth, endTaxable: r.endTaxable, estate: r.estate };
};

console.log(`\n=== ${process.argv[2]} — convTaxFunding: "withhold" ===`);
for (const conv of [70000, 25000, 10000]) {
  const a = pick({ ...baseP(), currentConv: conv, taxableGainFrac: 0 });
  const b = pick({ ...baseP(), currentConv: conv, taxableGainFrac: 0.5 });
  const d = b.totTax - a.totTax;
  console.log(
    `conv $${(conv / 1000).toString().padStart(2)}K/yr  ` +
    `totTax  gain0%=${a.totTax.toLocaleString().padStart(9)}  gain50%=${b.totTax.toLocaleString().padStart(9)}  ` +
    `DELTA=${d.toLocaleString().padStart(8)}   ` +
    `endTaxable ${a.endTaxable.toLocaleString()} -> ${b.endTaxable.toLocaleString()}`
  );
}
