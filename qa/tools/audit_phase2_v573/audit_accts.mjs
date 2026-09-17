// ⚠ HARNESS ARTEFACT, KEPT AS A RECORD (FlawsToFix-v5_73-Phase2 §2, session 6): this probe adds an Other account WITHOUT
//   updating PORTFOLIO.household, which the app maintains in buildPortfolio. Its Engine D lines therefore show Engine D
//   not moving — that is the artefact, NOT a finding. Use audit_accts3.mjs for Engine D. The Engine B / start-balance lines
//   are unaffected (they read retireStartBalances, not household); audit_accts2's annuity lines are the C-9 evidence.
// SESSION-ONLY (Phase 2, §3 item 6): does each account type reach each engine? Asserts nothing.
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const snap = (other) => {
  const P = JSON.parse(JSON.stringify(BASE)); P.otherAccounts = other ? [other] : []; P.stateCode = null;
  g.applyLoadedData({ portfolio: P });
  const tl = g.PLAN_TIMELINE(), ry = tl.targetRetireYear;
  const sb = g.retireStartBalances(ry);
  const D = g.computeWithdrawalPlan({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
  const B = E.computeTaxPlan({ retireYear: ry, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
  const C = E.computeIrmaaPlan({ retireYear: ry, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
  return { sbTrad: (sb.tradInitA || 0) + (sb.tradInitB || 0) + (sb.tradInit || 0), sbRoth: (sb.rothInitA || 0) + (sb.rothInitB || 0) + (sb.rothInit || 0),
    sbTax: g.taxableInitAll ? g.taxableInitAll() : null, dTrad: D._tradInit, dRoth: D._rothInit, dTax: D._taxInit,
    bRmd: B.rows.reduce((s, r) => s + (r.rmd_y || 0), 0), cMagi: C.rows.reduce((s, r) => s + r.magi, 0), dDrawn: D.totalDrawn, sbKeys: Object.keys(sb).join(",") };
};
const base = snap(null);
console.log("retireStartBalances keys:", base.sbKeys);
for (const t of ["taxable", "trad", "roth", "hsa", "annuity"]) {
  const s = snap({ name: `probe ${t}`, balance: 100000, taxType: t, owner: "A" });
  const d = (k) => Math.round((s[k] ?? 0) - (base[k] ?? 0));
  console.log(`${t.padEnd(8)} +100k → startTrad ${d("sbTrad")} startRoth ${d("sbRoth")} taxableAll ${d("sbTax")} | D trad ${d("dTrad")} roth ${d("dRoth")} tax ${d("dTax")} drawn ${d("dDrawn")} | B lifetime RMD ${d("bRmd")} | C lifetime MAGI ${d("cMagi")}`);
}
