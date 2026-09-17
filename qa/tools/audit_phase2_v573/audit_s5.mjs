// SESSION-ONLY audit harness (Phase 2, session 5). References typed from primary sources. Asserts nothing.
const mod = await import("../../app_v573.mjs"); const g = mod.__g, E = mod.__engines;
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const load = ({ single, pension, dob, ssMo = 0 }) => {
  const P = JSON.parse(JSON.stringify(BASE));
  Object.assign(P, { positions: [], otherAccounts: [], stateCode: null, single, dobA: dob, dobB: dob, lifeExpA: 95, lifeExpB: 95, _incomeFromForm: true,
    incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
  const ss = (m) => ({ tableByAge: { 62: m, 63: m, 64: m, 65: m, 66: m, 67: m, 70: m }, planned: m, plannedAge: 67 });
  P.incomeSources = { ssA: ss(ssMo), ssB: ss(0), pension: { amount: pension / 12 } };
  g.applyLoadedData({ portfolio: P });
};
const B = (o, yr, gain = 0) => { load(o); return E.computeTaxPlan({ retireYear: yr, rothAmount: 0, qcdAnnual: 0, taxYield: 0, gainByYr: { [yr]: gain } }).rows.find(x => x.yr === yr); };
const C = (o, yr) => { load(o); return E.computeIrmaaPlan({ retireYear: yr, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }).rows.find(x => x.yr === yr); };
const out = []; let fails = 0;
const chk = (label, got, want, tol = 0.999) => { const bad = !(Math.abs(got - want) <= tol); if (bad) fails++; out.push(`${bad ? "✗" : "✓"} ${label}: engine ${typeof got === "number" ? got.toFixed(2) : got} ref ${typeof want === "number" ? want.toFixed(2) : want}`); };

// ── 1 · OBBBA senior bonus, Engine B, 2026 (IRS Sched. 1-A Part V): each 65+ person gets max(0, 6000 − 6% × (MAGI − thr))
const bonus = (magi, thr) => Math.max(0, 6000 - 0.06 * Math.max(0, magi - thr));
for (const [st, thr, zero, extra, n] of [["S", 75000, 175000, 2050, 1], ["M", 150000, 250000, 1650, 2]]) {
  for (const edge of [thr, zero]) for (const d of [-1, 0, 1]) {
    const m = edge + d; const r = B({ single: st === "S", pension: m, dob: "1959-01-01" }, 2026);
    chk(`bonus ${st} MAGI ${m}: seniorExtra`, r.seniorExtra, n * extra + Math.round(n * bonus(m, thr)));
  }
}
// sunset: 2029 has no bonus (still age-extra, indexed)
{ const r = B({ single: true, pension: 60000, dob: "1959-01-01" }, 2029);
  chk("bonus sunset: 2029 seniorExtra is the indexed age extra only", r.seniorExtra, Math.round(2050 * 1.02 ** 3)); }

// ── 2 · Indexation, Engine B, 2032 (6 years at the model's disclosed 2%/yr proxy) — indexed things move, statutory ones do not
{ const yr = 2032, f = 1.02 ** 6;
  const std = Math.round(16100 * f);
  // ordinary bracket top 50,400 indexed: check the marginal rate flips across it
  const top = 50400 * f;
  for (const [d, rate] of [[-1, 12], [1, 22]]) {
    const r = B({ single: true, pension: Math.round(top + d) + std, dob: "1970-01-01" }, yr);
    chk(`2032 indexed bracket top ${top.toFixed(2)} ${d > 0 ? "+1" : "−1"}: marginal`, r.bracket, rate, 0);
  }
  // NIIT: threshold stays 200,000 (unindexed) — investment income present, MAGI 200,000 ± 1000
  for (const d of [-1000, 1000]) {
    const r = B({ single: true, pension: 150000, dob: "1970-01-01" }, yr, 50000 + d);
    chk(`2032 NIIT unindexed: MAGI ${200000 + d}`, r.niit_y, Math.round(0.038 * Math.max(0, d)));
  }
  // §86: base 25,000 unindexed — SS 24,000, other so that PI = 25,000 + 1000
  { const r = B({ single: true, pension: 14000, dob: "1958-01-01", ssMo: 2000 }, yr);
    // SS itself is COLA'd by the model in 2032, so compute PI from the engine's own ssTotal
    // CORRECTED after session 5: the first version omitted this household's 2032 RMD (contributions accrue until the
    // retireYear passed below), so it reported a false failure; the engine was right. Other income is the row's own.
    const ss = r.ssTotal, other = r.pen_y + (r.rmd_y || 0) + (r.work_y || 0), pi = other + ss / 2;
    const want = pi <= 25000 ? 0 : pi <= 34000 ? Math.min(0.5 * (pi - 25000), 0.5 * ss) : Math.min(0.85 * ss, Math.min(Math.min(0.5 * ss, 0.5 * (pi - 25000)), 4500) + 0.85 * (pi - 34000));
    chk(`2032 §86 unindexed (SS ${ss.toFixed(0)}, PI ${pi.toFixed(0)}): ssTaxable`, r.ssTaxable, want); }
  // LTCG 0% top 49,450 indexed
  { const z = 49450 * f; const O = 20000; const r = B({ single: true, pension: O + std, dob: "1970-01-01" }, yr, Math.round(z - O) + 100);
    chk(`2032 LTCG 0% top indexed to ${z.toFixed(2)}: tax on the $100-ish above`, r.capGainsTax, 0.15 * (O + Math.round(z - O) + 100 - z)); }
  // senior extra indexed
  { const r = B({ single: true, pension: 60000, dob: "1959-01-01" }, yr);
    chk("2032 age-65 extra indexed (no bonus after 2028)", r.seniorExtra, Math.round(2050 * f)); }
}

// ── 3 · Engine C IRMAA tiers 1–4 at every edge (CMS: tiers 1–4 are "≤ upper"), premium year 2028 (2 years of index)
{ const f2 = 1.02 ** 2;
  for (const [st, ups] of [["S", [109000, 137000, 171000, 205000]], ["M", [218000, 274000, 342000, 410000]]])
    ups.forEach((u, i) => {
      const t = u * f2;
      for (const [d, tierWant] of [[0, i], [1, i + 1]]) {
        const r = C({ single: st === "S", pension: t + d, dob: "1959-01-01" }, 2026);
        chk(`C ${st} MAGI ${(t + d).toFixed(2)} (tier-${i} top ${t.toFixed(2)}${d ? " +1" : ""}): tier`, r.tier, tierWant, 0);
      }
    });
  // the top-tier comparator (C-1) in Engine C itself
  for (const [st, top, mfj] of [["S", 510000, false], ["M", 765000, true]]) {
    const r = C({ single: !mfj, pension: top, dob: "1959-01-01" }, 2026);
    out.push(`  (C-1 in Engine C) ${st} MAGI exactly ${top}: tier ${r.tier}, surcharge ${r.surchargeAnnual} — CMS puts this in tier 5`);
  }
}
console.log(out.join("\n")); console.log(`${fails} failing of ${out.filter(l => /^[✓✗]/.test(l)).length}`);
