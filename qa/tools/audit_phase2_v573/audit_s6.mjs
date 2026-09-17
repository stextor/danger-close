// SESSION-ONLY (Phase 2, session 6): indexation in Engines A and C; IRMAA top-tier freeze. Asserts nothing.
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
g.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const baseA = (o) => ({ single: true, asOfYr: 2026, retireYr: 2032, horizonYr: 2032, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1976, dobBYr: 1976, survivor: "A", deathYr1: 2099, ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const A = (o) => g.runRothStrategies(baseA(o)).find(x => x.key === "none");
const out = []; let fails = 0;
const chk = (l, got, want, tol = 0.999) => { const bad = !(Math.abs(got - want) <= tol); if (bad) fails++; out.push(`${bad ? "✗" : "✓"} ${l}: engine ${(+got).toFixed(2)} ref ${(+want).toFixed(2)}`); };
const f6 = 1.02 ** 6;
const BRs = [[.10, 12400], [.12, 50400], [.22, 105700], [.24, 201775]];
const fedI = (ti, f) => { let t = 0, p = 0; for (const [r, u0] of BRs) { const u = u0 * f; const s = Math.min(ti, u) - p; if (s > 0) t += s * r; p = u; if (ti <= u) break; } return t; };
// A · 2032 ordinary tax, indexed std (engine rounds std) and brackets
for (const P of [60000, 150000]) {
  const ti = P - Math.round(16100 * f6);
  chk(`A 2032 single pension ${P}: indexed brackets and std`, A({ pen: P / 12 }).totTax, fedI(ti, f6));
}
// A · NIIT unindexed in 2032 (qualified dividends 50,000; MAGI 201,000 → NIIT 38)
{ const r = A({ pen: 151000 / 12, taxableInit: 1000000, taxYieldPct: 5 });
  chk("A 2032 NIIT unindexed at MAGI 201,000", r.totNiit, 38); }
// A · §86 base unindexed in 2032: born 1958, SS 24,000/yr claimed 2025, pension 14,000 → PI 26,000 → taxable 500
{ const r = A({ dobAYr: 1958, dobBYr: 1958, ssA: 2000, ssAYr: 2025, pen: 14000 / 12 });
  const std = Math.round(16100 * f6) + Math.round(2050 * f6);
  const r0 = A({ dobAYr: 1958, dobBYr: 1958, ssA: 2000, ssAYr: 2025, pen: 0 });
  out.push(`  A 2032 §86 probe: totTax with pension 14,000 = ${r.totTax} (taxable SS 500 + 14,000 − ${std} deductions < 0 → 0 expected); without pension ${r0.totTax}`);
  chk("A 2032 §86 unindexed: taxable income stays under the deduction → no tax", r.totTax, 0); }
// A · IRMAA top tier: premium 2027 frozen at 500,000; 2029 indexed off the frozen base → 520,200
for (const [yr, top] of [[2027, 500000], [2029, 520200]]) {
  for (const [d, want] of [[-1, 6360], [1, 6940]]) {
    const r = g.runRothStrategies(baseA({ retireYr: yr - 2, horizonYr: yr, dobAYr: 1955, dobBYr: 1955, pen: (top + d) / 12 })).find(x => x.key === "none");
    // surcharge only in premium year `yr` (lookback yr-2); earlier premium years have no lookback or are pre-65
    out.push(`  A premium ${yr}, MAGI ${top + d}: totIrmaa ${r.totIrmaa}`);
  }
}
// C · headroom exposes the premium-year threshold. Single, 67+, MAGI 300,000 sits in tier 4; headroom = top − 300,000.
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const P = JSON.parse(JSON.stringify(BASE));
Object.assign(P, { positions: [], otherAccounts: [], stateCode: null, single: true, dobA: "1955-01-01", dobB: "1955-01-01", lifeExpA: 95, lifeExpB: 95, _incomeFromForm: true,
  incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const z = { tableByAge: { 62: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 70 };
P.incomeSources = { ssA: z, ssB: z, pension: { amount: 300000 / 12 } };
g.applyLoadedData({ portfolio: P });
const rows = E.computeIrmaaPlan({ retireYear: 2025, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }).rows;
for (const r of rows.filter(r => r.irmaaYr <= 2031)) {
  const want = 500000 * 1.02 ** Math.max(0, r.irmaaYr - 2027);
  if (r.tier === 4) chk(`C premium ${r.irmaaYr}: top-tier threshold (headroom + MAGI)`, r.headroom + r.magi, want, 0.01);
  else out.push(`  C premium ${r.irmaaYr}: tier ${r.tier} magi ${r.magi} (not tier 4 — threshold not exposed)`);
}
console.log(out.join("\n")); console.log(`${fails} failing`);
{ // discriminating §86-unindexed case for Engine A (added after the first probe could not discriminate)
  const f = 1.02 ** 6, ded = Math.round(16100 * f) + Math.round(2050 * f);
  const r = A({ dobAYr: 1958, dobBYr: 1958, ssA: 2000, ssAYr: 2025, pen: 30000 / 12 });
  const fixedThr = 30000 + 11300 - ded, idxThr = 30000 + 8222 - ded;
  console.log(`A 2032 §86 discriminating: engine ${r.totTax} | unindexed thresholds ${fedI(fixedThr, f).toFixed(2)} | if indexed ${fedI(idxThr, f).toFixed(2)}`);
}
