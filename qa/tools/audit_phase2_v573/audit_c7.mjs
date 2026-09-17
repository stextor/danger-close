const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const P = JSON.parse(JSON.stringify(g.PORTFOLIO())); Object.assign(P, { stateCode: null, single: true, lifeExpA: 95, lifeExpB: 95 });
g.applyLoadedData({ portfolio: P });
const tl = g.PLAN_TIMELINE();
const D = g.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, scenarioPreset: "base" });
const B = E.computeTaxPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
console.log("D keys:", Object.keys(D).join(","));
for (const yr of [2029, 2032, 2040]) {
  const d = D.schedule.find(x => x.yr === yr), b = B.rows.find(x => x.yr === yr);
  const pick = (o, re) => Object.fromEntries(Object.entries(o).filter(([k]) => re.test(k)).map(([k, v]) => [k, typeof v === "number" ? Math.round(v) : v]));
  console.log(yr, "D:", JSON.stringify(pick(d, /ss|pen|work|rmd|conv|draw|capGain|magi|bracket|exp|guaranteed/i)));
  console.log(yr, "B:", JSON.stringify(pick(b, /ss|pen|work|rmd|conv|capG|div|magi|ordinary|taxable|fedTax|total/i)));
}
