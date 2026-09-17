// SESSION-ONLY audit probe (Phase 2, C-3 in Engine A). Asserts nothing.
const g = (await import("../../app_v573.mjs")).__g;
g.setPortfolio({ positions: [], stateCode: null,
  incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const base = (o = {}) => ({ single: false, asOfYr: 2026, retireYr: 2028, horizonYr: 2028,
  ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1955, dobBYr: 1966, survivor: "B", deathYr1: 2027,
  ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 50000 / 12, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0,
  acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const run = (P) => g.runRothStrategies(P).find(r => r.key === "none");
for (const [label, o] of [
  ["2028, survivor B (62) — the defect case", {}],
  ["2028, survivor B, but B born 1955 too (65+ legitimately) — control", { dobBYr: 1955 }],
  ["2031, survivor B turns 65 — control", { retireYr: 2031, horizonYr: 2031 }],
]) {
  const r = run(base(o));
  console.log(label, "→ totTax", r.totTax, "| keys:", Object.keys(r).slice(0, 12).join(","));
}
