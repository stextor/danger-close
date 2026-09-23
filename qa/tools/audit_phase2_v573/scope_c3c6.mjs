// Scope probe for SCOPE_SURVIVOR_AGE_AND_GAINS_DEDUCTION (2026-09-22), repo-only. Run from qa/tools/audit_phase2_v573/ in a run folder. Asserts nothing. usage: node scope_c3c6.mjs <module path relative to qa/>
const mod = await import(`../../${process.argv[2]}`); const G = mod.__g, E = mod.__engines;
const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO())); const f2 = v => (v ?? 0).toFixed(2);
const load = (o) => { const P = JSON.parse(JSON.stringify(BASE)); Object.assign(P, { positions: [], otherAccounts: [], stateCode: null, _incomeFromForm: true,
  incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] }, o); G.applyLoadedData({ portfolio: P }); };
const ss0 = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
if (process.argv[3] !== "c6only") {
  load({ single: false, dobA: "1955-01-01", dobB: "1966-01-01", lifeExpA: 72, lifeExpB: 95, incomeSources: { ssA: ss0, ssB: ss0, pension: { amount: 50000 / 12 } } });
  for (const r of E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }).rows.filter(r => r.yr <= 2031))
    console.log(`C-3 B ${r.yr} ${r.filing.padEnd(6)} ageB ${r.ageB} seniorExtra ${r.seniorExtra} fedTax ${f2(r.fedTax)}`);
}
const law = (ord, Gn) => { const TI = Math.max(0, ord + Gn - 16100); const pref = Math.min(Gn, TI); const O = TI - pref;
  return (O <= 12400 ? .1 * O : 1240 + .12 * (O - 12400)) + .15 * Math.max(0, Math.min(TI, 545500) - Math.max(O, 49450)); };
for (const [ord, Gn] of [[0, 60000], [8000, 70000], [15551, 50000], [16100, 60000], [30000, 60000]]) {
  load({ single: true, dobA: "1970-01-01", dobB: "1970-01-01", lifeExpA: 95, lifeExpB: 95, incomeSources: { ssA: ss0, ssB: ss0, pension: { amount: ord / 12 } } });
  const r = E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0, gainByYr: { 2026: Gn } }).rows.find(x => x.yr === 2026);
  console.log(`C-6 B ord ${String(ord).padStart(5)} pref ${Gn}: fed ${f2(r.fedTax)} + cg ${f2(r.capGainsTax)} + AMT ${f2(r.amt_y)} = ${f2(r.fedTax + r.capGainsTax + r.amt_y)} | law ${f2(law(ord, Gn))}`);
}
