// SESSION-ONLY audit probe (Phase 2, candidate C-3). Not a suite; asserts nothing.
const mod = await import("../../app_v573.mjs");
const G = mod.__g, E = mod.__engines;
const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
const run = (dobA, dobB, lifeExpA, lifeExpB) => {
  const P = JSON.parse(JSON.stringify(BASE));
  P.positions = []; P.otherAccounts = []; P.stateCode = null; P.single = false;
  P.dobA = dobA; P.dobB = dobB; P.lifeExpA = lifeExpA; P.lifeExpB = lifeExpB;
  P.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
  const ss = (m) => ({ tableByAge: { 62: m, 63: m, 64: m, 65: m, 67: m, 70: m }, planned: m, plannedAge: 67 });
  P.incomeSources = { ssA: ss(0), ssB: ss(0), pension: { amount: 50000 / 12 } };
  P._incomeFromForm = true;
  G.applyLoadedData({ portfolio: P });
  const tl = G.PLAN_TIMELINE();
  const plan = E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
  return { tl, plan };
};
const { tl, plan } = run("1955-01-01", "1966-01-01", 72, 95);
console.log("dobA", JSON.stringify(tl.dobA), "dobB", JSON.stringify(tl.dobB), "lifeExpA", tl.lifeExpA, "single", tl.single);
const r0 = plan.rows[0]; console.log("row keys:", Object.keys(r0).join(","));
for (const r of plan.rows.filter(r => r.yr >= 2026 && r.yr <= 2032))
  console.log(JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => /yr|age|filing|single|widow|ded|senior|std|taxable|fedTax|pension|ordinary/i.test(k)))));
