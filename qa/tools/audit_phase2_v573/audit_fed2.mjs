// SESSION-ONLY audit harness (Phase 2): LTCG 0/15/20 edges, NIIT edges, IRC §86 edges — Engine B, 2026.
// References typed from Rev. Proc. 2025-32 §4.03, 26 U.S.C. §1411(a)-(b) and §86(a),(c). Asserts nothing.
const mod = await import("../../app_v573.mjs");
const g = mod.__g, E = mod.__engines;
const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const run = ({ single, pension, gain = 0, dob = "1970-01-01", ssMo = 0 }) => {
  const P = JSON.parse(JSON.stringify(BASE));
  Object.assign(P, { positions: [], otherAccounts: [], stateCode: null, single, dobA: dob, dobB: dob, lifeExpA: 95, lifeExpB: 95, _incomeFromForm: true,
    incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
  const ss = (m) => ({ tableByAge: { 62: m, 63: m, 64: m, 65: m, 66: m, 67: m, 70: m }, planned: m, plannedAge: 67 });
  P.incomeSources = { ssA: ss(ssMo), ssB: ss(0), pension: { amount: pension / 12 } };
  g.applyLoadedData({ portfolio: P });
  return E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0, gainByYr: { 2026: gain } }).rows.find(x => x.yr === 2026);
};
const out = []; let worst = 0;
const chk = (label, got, want) => { const d = got - want; worst = Math.max(worst, Math.abs(d)); out.push(`${Math.abs(d) >= 1 ? "✗" : "✓"} ${label}: engine ${(+got).toFixed(2)} ref ${want.toFixed(2)} Δ ${d.toFixed(2)}`); };
// LTCG: ordinary taxable O fixed; total T = O + G crosses the 0% max and the 15% max.
const LT = { S: [49450, 545500], M: [98900, 613700] }, STD = { S: 16100, M: 32200 };
const ltRef = (O, G, st) => { const [z, f] = LT[st]; const T = O + G;
  const zero = Math.max(0, Math.min(T, z) - O); const fifteen = Math.max(0, Math.min(T, f) - Math.max(O, z)); const twenty = Math.max(0, T - Math.max(O, f));
  return 0.15 * fifteen + 0.20 * twenty; };
const niitRef = (magi, nii, st) => 0.038 * Math.min(nii, Math.max(0, magi - (st === "S" ? 200000 : 250000)));
for (const st of ["S", "M"]) {
  const O = 20000;
  for (const edge of LT[st]) for (const d of [-1, 0, 1]) {
    const G = edge - O + d; const r = run({ single: st === "S", pension: O + STD[st], gain: G });
    chk(`${st} LTCG, T=${O + G} (edge ${edge}${d ? (d > 0 ? "+1" : "−1") : ""}) capGainsTax`, r.capGainsTax, ltRef(O, G, st));
    chk(`${st}   …NIIT at MAGI ${r.magi_y} (Math.round in engine)`, r.niit_y, Math.round(niitRef(O + STD[st] + G, G, st)));
  }
  // NIIT threshold edge with investment income present
  const thr = st === "S" ? 200000 : 250000;
  for (const d of [-1, 0, 1]) {
    const r = run({ single: st === "S", pension: 100000, gain: thr - 100000 + d });
    chk(`${st} NIIT at MAGI ${thr + d}`, r.niit_y, Math.round(niitRef(thr + d, thr - 100000 + d, st)));
  }
}
// IRC §86: provisional income PI = other + ½SS crosses base and adjusted base.
const ssRef = (ss, other, st) => { const b = st === "S" ? 25000 : 32000, a = st === "S" ? 34000 : 44000; const pi = other + 0.5 * ss;
  if (pi <= b) return 0; if (pi <= a) return Math.min(0.5 * (pi - b), 0.5 * ss);
  const p1 = Math.min(0.5 * ss, 0.5 * (pi - b)); return Math.min(0.85 * ss, Math.min(p1, 0.5 * (a - b)) + 0.85 * (pi - a)); };
for (const st of ["S", "M"]) {
  const ssYr = st === "S" ? 24000 : 30000;
  for (const edge of (st === "S" ? [25000, 34000] : [32000, 44000])) for (const d of [-1, 0, 1]) {
    const other = edge - ssYr / 2 + d;
    const r = run({ single: st === "S", pension: other, dob: "1958-01-01", ssMo: ssYr / 12 });
    chk(`${st} §86 PI=${edge + d} (SS ${r.ssTotal}) ssTaxable`, r.ssTaxable, ssRef(ssYr, other, st));
  }
}
console.log(out.join("\n")); console.log(`worst |Δ| ${worst.toFixed(2)} over ${out.length} checks`);
