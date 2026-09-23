// SESSION-ONLY. The example household: C-3 exposure (survivor ages in single years) and C-6's effect (Patch 2) on lifetime federal.
const load = async m => { const x = await import(`../../${m}`); return { g: x.__g, E: x.__engines }; };
const V = await load("app_v574.mjs"), P2 = await load("app_scp2.mjs");
const r = V.g.PLAN_TIMELINE().targetRetireYear, tl = V.g.PLAN_TIMELINE();
const view = (M, roth, yld) => { const s = M.g.withdrawalPlanSeries({ retireYear: r, rothAmount: roth, scenarioPreset: "base" });
  return M.E.computeTaxPlan({ retireYear: r, rothAmount: roth, qcdAnnual: 0, taxYield: yld, gainByYr: s.gainByYr, ordDrawByYr: s.ordDrawByYr }); };
const t = view(V, 0, 2.0);
const single = t.rows.filter(x => x.filing === "Single");
console.log(`example: dobA ${tl.dobA.year} lifeExpA ${tl.lifeExpA} | dobB ${tl.dobB.year} lifeExpB ${tl.lifeExpB} | single-filing years ${single.length ? single[0].yr + "–" + single.at(-1).yr : "none"}`);
if (single.length) console.log(`  survivor ages in those years: A ${single[0].ageA}–${single.at(-1).ageA}, B ${single[0].ageB}–${single.at(-1).ageB}`);
for (const [lbl, roth, yld] of [["as-is (0, 2%)", 0, 2.0], ["first open (70K, 2%)", 70000, 2.0]]) {
  const a = view(V, roth, yld), b = view(P2, roth, yld); const tot = x => x.rows.reduce((s, y) => s + y.fedTax + y.capGainsTax + y.amt_y, 0);
  const hit = a.rows.filter(x => x.grossOrdinary < x.stdDed + x.seniorExtra && x.capGains_y + x.div_y > 0).length;
  console.log(`C-6 ${lbl}: lifetime fed+cg+AMT ${Math.round(tot(a)).toLocaleString()} -> ${Math.round(tot(b)).toLocaleString()} (${Math.round(tot(b) - tot(a))}) | years with ordinary below the deduction AND gains/dividends: ${hit}`);
}
