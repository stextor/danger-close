// SESSION-ONLY audit harness (Phase 2, §3 item 2: federal ordinary tax at every bracket border).
// The reference is Rev. Proc. 2025-32 §4.01's printed tables — base + rate × excess — typed here,
// NOT read from the app. Asserts nothing; prints engine vs reference.
const mod = await import("../../app_v573.mjs");
const g = mod.__g, E = mod.__engines;
const TBL = {   // [over, base, rate] from the Rev. Proc. tables
  S: [[0, 0, .10], [12400, 1240, .12], [50400, 5800, .22], [105700, 17966, .24], [201775, 41024, .32], [256225, 58448, .35], [640600, 192979.25, .37]],
  M: [[0, 0, .10], [24800, 2480, .12], [100800, 11600, .22], [211400, 35932, .24], [403550, 82048, .32], [512450, 116896, .35], [768700, 206583.50, .37]],
};
const STD = { S: 16100, M: 32200 };
const ref = (ti, st) => { if (ti <= 0) return 0; let row = TBL[st][0]; for (const r of TBL[st]) if (ti > r[0]) row = r; return row[1] + row[2] * (ti - row[0]); };
// Engine A
g.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const baseA = (o) => ({ single: false, asOfYr: 2026, retireYr: 2026, horizonYr: 2026, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1970, dobBYr: 1970, survivor: "A", deathYr1: 2099, ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const engA = (income, single) => { const r = g.runRothStrategies(baseA({ pen: income / 12, single })).find(x => x.key === "none"); return { tax: r.totTax, niit: r.totNiit }; };
// Engine B
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const engB = (income, single) => {
  const P = JSON.parse(JSON.stringify(BASE));
  Object.assign(P, { positions: [], otherAccounts: [], stateCode: null, single, dobA: "1970-01-01", dobB: "1970-01-01", lifeExpA: 95, lifeExpB: 95, _incomeFromForm: true,
    incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
  const z = { tableByAge: { 62: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
  P.incomeSources = { ssA: z, ssB: z, pension: { amount: income / 12 } };
  g.applyLoadedData({ portfolio: P });
  const r = E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }).rows.find(x => x.yr === 2026);
  return r;
};
let worstA = 0, worstB = 0, n = 0; const bad = [], edgeBad = [];
for (const st of ["S", "M"]) {
  const tops = TBL[st].slice(1).map(r => r[0]);
  for (const top of tops) for (const d of [-1, 0, 1]) {
    const ti = top + d, income = ti + STD[st], want = ref(ti, st);
    const a = engA(income, st === "S"), b = engB(income, st === "S");
    const dA = a.tax - want, dB = b.fedTax - want; n++;
    worstA = Math.max(worstA, Math.abs(dA)); worstB = Math.max(worstB, Math.abs(dB));
    // the EDGE itself: at the top the lower rate applies ("not over"); one dollar above, the higher one.
    const rates = TBL[st].map(r => r[2]); const k = TBL[st].findIndex(r => r[0] === top);
    const wantRate = d <= 0 ? rates[k - 1] : rates[k];
    const gotRate = typeof b.bracket === "number" ? (b.bracket > 1 ? b.bracket / 100 : b.bracket) : parseFloat(String(b.bracket)) / 100;
    if (Math.abs(gotRate - wantRate) > 1e-9) edgeBad.push(`${st} ti=${ti}: B marginal ${b.bracket} vs ${wantRate}`);
    if (Math.abs(dA) >= 1 || Math.abs(dB) >= 1 || b.taxableOrdinary !== ti)
      bad.push(`${st} ti=${ti}: ref ${want.toFixed(2)} | A ${a.tax} (Δ${dA.toFixed(2)}) | B ${b.fedTax} (Δ${dB.toFixed(2)}) taxable ${b.taxableOrdinary} ded ${b.totalDeductions}`);
  }
}
console.log(`federal ordinary borders: ${n} points (6 tops × 3 × 2 statuses). worst |Δ| — Engine A ${worstA.toFixed(2)}, Engine B ${worstB.toFixed(2)}`);
console.log(bad.length ? bad.join("\n") : "no point off by $1 or more in either engine");
console.log(edgeBad.length ? "EDGE MISMATCHES:\n" + edgeBad.join("\n") : "Engine B's marginal bracket is right at every top and one dollar above");
