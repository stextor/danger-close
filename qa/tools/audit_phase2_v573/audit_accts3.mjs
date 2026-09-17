// SESSION-ONLY (Phase 2): account reach with `household` maintained as buildPortfolio does (L12181–12227).
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const run = (other) => { const P = JSON.parse(JSON.stringify(BASE)); P.stateCode = null;
  P.otherAccounts = other ? [other] : [];
  P.total401k = (P.positions || []).reduce((s, p) => s + p.balance, 0);
  P.household = P.total401k + P.otherAccounts.reduce((s, a) => s + a.balance, 0);
  g.applyLoadedData({ portfolio: P }); const ry = g.PLAN_TIMELINE().targetRetireYear;
  const D = g.computeWithdrawalPlan({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
  const f = D.schedule[0];
  return { tradInit: D._tradInit, rothInit: D._rothInit, taxInit: D._taxInit, start: Math.round(f.portfolioTotal + f.totalDraw), end: Math.round(D.schedule.at(-1).portfolioTotal), hh: P.household };
};
const b = run(null);
console.log("base:", JSON.stringify(b));
for (const t of ["taxable", "trad", "roth", "hsa", "annuity"]) {
  const s = run({ name: `probe ${t}`, balance: 100000, taxType: t, owner: "A" });
  console.log(`${t.padEnd(8)} +100k (household +${s.hh - b.hh}) → D tradInit ${s.tradInit - b.tradInit}, rothInit ${s.rothInit - b.rothInit}, taxInit ${s.taxInit - b.taxInit} ⇒ counted ${(s.tradInit - b.tradInit) + (s.rothInit - b.rothInit) + (s.taxInit - b.taxInit)} times-dollars; first-year total ${s.start - b.start}`);
}
{ // C-10 probe: realized gains Engine D reports, by Other-account type (household maintained)
  const gains = (other) => { const P = JSON.parse(JSON.stringify(BASE)); P.stateCode = null; P.otherAccounts = other ? [other] : [];
    P.total401k = (P.positions || []).reduce((s, p) => s + p.balance, 0); P.household = P.total401k + P.otherAccounts.reduce((s, a) => s + a.balance, 0);
    P.taxableGainPct = 50; P.taxableGainShare = 0.5;
    g.applyLoadedData({ portfolio: P }); const ry = g.PLAN_TIMELINE().targetRetireYear;
    const D = g.computeWithdrawalPlan({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
    return { gain: Math.round(D.schedule.reduce((s, r) => s + (r.capGain_y || 0), 0)), share: g.taxableGainShare() };
  };
  const g0 = gains(null);
  console.log(`declared gain share ${g0.share}; base lifetime realized gains ${g0.gain}`);
  for (const t of ["taxable", "roth", "trad", "hsa", "annuity"]) {
    const x = gains({ name: `probe ${t}`, balance: 100000, taxType: t, owner: "A" });
    console.log(`  +100k ${t.padEnd(8)} → lifetime realized gains +${x.gain - g0.gain}`);
  }
}
