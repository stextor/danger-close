// SESSION-ONLY audit probe (Phase 2, candidate C-4: Engine A's §86 upper tier). Asserts nothing.
const g = (await import("../../app_v573.mjs")).__g;
g.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const base = (o) => ({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2026, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1958, dobBYr: 1958, survivor: "A", deathYr1: 2099, ssA: 0, ssB: 0, ssAYr: 2025, ssAMo: 1, ssBYr: 2025, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const run = (o) => g.runRothStrategies(base(o)).find(x => x.key === "none");
const fed = (ti) => ti <= 12400 ? ti * .10 : ti <= 50400 ? 1240 + .12 * (ti - 12400) : 5800 + .22 * (ti - 50400);
const ssRef = (ss, other) => { const pi = other + ss / 2; if (pi <= 25000) return 0; if (pi <= 34000) return Math.min(.5 * (pi - 25000), .5 * ss);
  return Math.min(.85 * ss, Math.min(Math.min(.5 * ss, .5 * (pi - 25000)), 4500) + .85 * (pi - 34000)); };
const oldF = (ss, other) => { const pi = other + ss / 2; if (pi <= 34000) return ssRef(ss, other); return Math.min(.85 * ss, .5 * Math.min(pi - 25000, 9000) + .85 * (pi - 34000)); };
for (const [ssYr, pen] of [[6000, 32000], [6000, 34000], [8000, 31000], [24000, 40000]]) {
  const r = run({ ssA: ssYr / 12, pen: pen / 12 });
  const good = fed(pen + ssRef(ssYr, pen) - 16100 - 2050), old = fed(pen + oldF(ssYr, pen) - 16100 - 2050);
  console.log(`SS ${ssYr}, pension ${pen}: engine ${r.totTax} | §86-correct ${good.toFixed(2)} | pre-v5.45 formula ${old.toFixed(2)}  (taxable SS ${ssRef(ssYr, pen)} vs ${oldF(ssYr, pen)})`);
}
