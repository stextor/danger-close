// SESSION-ONLY (Phase 2): Engine A LTCG + NIIT through qualified dividends. Asserts nothing.
const g = (await import("../../app_v573.mjs")).__g;
g.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const base = (o) => ({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2026, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1970, dobBYr: 1970, survivor: "A", deathYr1: 2099, ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const run = (o) => g.runRothStrategies(base(o)).find(x => x.key === "none");
const fed = { S: [[0, 0, .10], [12400, 1240, .12], [50400, 5800, .22], [105700, 17966, .24], [201775, 41024, .32], [256225, 58448, .35], [640600, 192979.25, .37]],
              M: [[0, 0, .10], [24800, 2480, .12], [100800, 11600, .22], [211400, 35932, .24], [403550, 82048, .32], [512450, 116896, .35], [768700, 206583.5, .37]] };
const ord = (ti, st) => { if (ti <= 0) return 0; let r = fed[st][0]; for (const x of fed[st]) if (ti > x[0]) r = x; return r[1] + r[2] * (ti - r[0]); };
const LT = { S: [49450, 545500], M: [98900, 613700] }, STD = { S: 16100, M: 32200 }, NT = { S: 200000, M: 250000 };
const lt = (O, G, st) => { const [z, f] = LT[st], T = O + G; return 0.15 * Math.max(0, Math.min(T, f) - Math.max(O, z)) + 0.20 * Math.max(0, T - Math.max(O, f)); };
// probe the dividend amount the engine uses: D = taxableInit × pct/100 ?
const D = 50000;
for (const st of ["S", "M"]) {
  for (const target of [LT[st][0], LT[st][1], NT[st]]) for (const d of [-1, 0, 1]) {
    // ordinary income chosen so that total taxable (O + D) or MAGI lands on the edge
    const isNiit = target === NT[st];
    const P = isNiit ? target + d - D : target + d - D + STD[st];     // pension
    const O = Math.max(0, P - STD[st]);
    const r = run({ single: st === "S", pen: P / 12, taxableInit: 1000000, taxYieldPct: 5 });
    const want = ord(O, st) + lt(O, D, st);
    const niitWant = 0.038 * Math.min(D, Math.max(0, P + D - NT[st]));
    console.log(`${st} ${isNiit ? "NIIT MAGI" : "T"}=${isNiit ? P + D : O + D}: totTax ${r.totTax} ref ${want.toFixed(2)} Δ ${(r.totTax - want).toFixed(2)} | totNiit ${r.totNiit} ref ${niitWant.toFixed(2)}`);
  }
}
