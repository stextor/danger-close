// SESSION-ONLY (Phase 2, candidate C-6): unused standard deduction vs preferential income. Asserts nothing.
// Law (Form 1040 QDCG worksheet): taxable income TI = ord + QD − ded; preferential portion = min(QD, TI);
// the 0% band is filled from the bottom of TI. Engines A and B.
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
g.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const baseA = (o) => ({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2026, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1970, dobBYr: 1970, survivor: "A", deathYr1: 2099, ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const A = (pen, D) => g.runRothStrategies(baseA({ pen: pen / 12, taxableInit: D * 20, taxYieldPct: 5 })).find(x => x.key === "none");
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const B = (pen, gain) => { const P = JSON.parse(JSON.stringify(BASE));
  Object.assign(P, { positions: [], otherAccounts: [], stateCode: null, single: true, dobA: "1970-01-01", dobB: "1970-01-01", lifeExpA: 95, lifeExpB: 95, _incomeFromForm: true,
    incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
  const z = { tableByAge: { 62: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 70 };
  P.incomeSources = { ssA: z, ssB: z, pension: { amount: pen / 12 } }; g.applyLoadedData({ portfolio: P });
  return E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0, gainByYr: { 2026: gain } }).rows.find(x => x.yr === 2026); };
const law = (ord, G) => { const TI = Math.max(0, ord + G - 16100); const pref = Math.min(G, TI); const O = TI - pref;
  const ordTax = O <= 12400 ? .1 * O : 1240 + .12 * (O - 12400); // O stays in the 12% band in these cases
  return ordTax + .15 * Math.max(0, Math.min(TI, 545500) - Math.max(O, 49450)); };
for (const [ord, G] of [[15549, 50000], [15550, 50000], [15551, 50000], [0, 60000], [8000, 70000], [16100, 60000], [30000, 60000]]) {
  const a = A(ord, G), b = B(ord, G);
  const bTot = b.fedTax + b.capGainsTax;
  console.log(`ordinary ${ord}, pref ${G}: law ${law(ord, G).toFixed(2)} | A ${a.totTax} | B fed+cg ${bTot.toFixed(2)} (taxableOrd ${b.taxableOrdinary})`);
}
