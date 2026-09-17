// SESSION-ONLY (Phase 2, §3 item 5): first-spouse death through Engine B, hand-checked. Asserts nothing.
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const P = JSON.parse(JSON.stringify(g.PORTFOLIO()));
Object.assign(P, { positions: [], otherAccounts: [], stateCode: null, single: false, dobA: "1956-01-01", dobB: "1956-01-01",
  lifeExpA: 74, lifeExpB: 95, _incomeFromForm: true, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const ss = (m) => ({ tableByAge: { 62: m, 63: m, 64: m, 65: m, 66: m, 67: m, 70: m }, planned: m, plannedAge: 67 });
P.incomeSources = { ssA: ss(2500), ssB: ss(20000 / 12), pension: { amount: 40000 / 12 } };
g.applyLoadedData({ portfolio: P });
const tl = g.PLAN_TIMELINE();
const rows = E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }).rows;
const pick = (r) => ({ yr: r.yr, filing: r.filing, widowed: r.widowed, ssA: r.ssA_y, ssB: r.ssB_y, ssTaxable: +r.ssTaxable.toFixed(2), pen: r.pen_y, ded: r.totalDeductions, taxable: +r.taxableOrdinary.toFixed(2), fed: +r.fedTax.toFixed(2) });
console.log("death year A:", tl.dobA.year + tl.lifeExpA);
for (const yr of [2029, 2030, 2031]) console.log(JSON.stringify(pick(rows.find(r => r.yr === yr))));
