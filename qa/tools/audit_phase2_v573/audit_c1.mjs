// SESSION-ONLY audit probe (Phase 2, C-1: IRMAA top-tier comparator). Asserts nothing.
const g = (await import("../../app_v573.mjs")).__g;
g.setPortfolio({ positions: [], stateCode: null,
  incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const base = (o = {}) => ({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2028,
  ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1955, dobBYr: 1955, survivor: "A", deathYr1: 2099,
  ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0,
  acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const run = (P) => g.runRothStrategies(P).find(r => r.key === "none");
const S = g.IRMAA_CONSTS().SUR;
console.log("SUR", JSON.stringify(S));
for (const [label, magi, o] of [
  ["single, top tier (2028 threshold 510,000)", 510000, {}],
  ["joint, top tier (2028 threshold 765,000)", 765000, { single: false }],
  ["single, tier-1 edge (2028 threshold 113,403.60)", 113403.6, {}],
]) {
  for (const d of [-1, 0, 1]) {
    const m = magi + d;
    const r = run(base({ pen: m / 12, ...o }));
    console.log(`${label}  MAGI ${(m).toFixed(2)} (pen×12 = ${((m/12)*12).toFixed(6)}) → totIrmaa ${r.totIrmaa}`);
  }
}
