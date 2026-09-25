// REPO-ONLY PROBE for SCOPE_SS86_ONE_RULE (C-4, D-1, §1f). Asserts nothing; reproduces §1's figures.
// Run from qa/tools/scope_ss86/ with a module path relative to qa/:
//     node ss86_worksheet_grid.mjs app_v576.mjs
// Prints (1) Engines B and C against the IRS Social Security Benefits Worksheet (2025 Form 1040, lines 1-18,
// written below independently of any engine) on a 160-cell grid, and (2) the single-household IRMAA case.
// Expected on v5.76: B disagrees 0/160; C disagrees 55/160 (worst 7,000); IRMAA case tier 0, $0.
// Expected once fixed (v5.77): both 0/160; IRMAA case tier 1, $1,150.
const m = await import(`../../${process.argv[2]}`); const G = m.__g, E = m.__engines;
const worksheet = (L1, L3, joint) => {              // lines 4 and 6 are zero for these households
  const L2 = 0.5 * L1, L7 = L2 + L3, L8 = joint ? 32000 : 25000;
  if (!(L8 < L7)) return 0;                          // "Is line 8 less than line 7?" No -> none taxable
  const L9 = L7 - L8, L10 = joint ? 12000 : 9000;
  const L11 = Math.max(0, L9 - L10), L13 = 0.5 * Math.min(L9, L10), L14 = Math.min(L2, L13);   // line 14: THE limb C-4 drops
  return Math.min(L14 + 0.85 * L11, 0.85 * L1);     // line 18
};
const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
const load = (S, P, joint) => { const X = JSON.parse(JSON.stringify(BASE));
  Object.assign(X, { positions: [], otherAccounts: [], stateCode: null, _incomeFromForm: true, single: !joint,
    dobA: "1958-01-01", dobB: "1958-01-01", lifeExpA: 95, lifeExpB: 95,
    incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
  X.incomeSources = { ...X.incomeSources, pension: { amount: P / 12 },
    ssA: { tableByAge: {}, planned: S / 12, plannedAge: 62 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 62 } };
  G.applyLoadedData({ portfolio: X }); };
const A = { retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0 };
let n = 0, badB = 0, badC = 0, wB = 0, wC = 0; const ex = [];
for (const joint of [false, true]) for (const S of [3000, 6000, 8000, 9000, 11000, 12500, 20000, 40000])
  for (const P of [10000, 20000, 25000, 28000, 30000, 32000, 34000, 38000, 44000, 60000]) {
    load(S, P, joint); n++;
    const b = E.computeTaxPlan(A).rows.find(r => r.yr === 2026), c = E.computeIrmaaPlan(A).rows.find(r => r.yr === 2026);
    const law = worksheet(b.ssTotal, P, joint);
    const dB = Math.abs(b.ssTaxable - law), dC = Math.abs((c.magi - P) - law);   // C: MAGI minus the only other income
    if (dB > 0.005) { badB++; wB = Math.max(wB, dB); }
    if (dC > 0.005) { badC++; wC = Math.max(wC, dC); if (ex.length < 3) ex.push(`  C ${joint ? "MFJ" : "Sgl"} SS ${S} pension ${P}: ${(c.magi - P).toFixed(2)} vs worksheet ${law.toFixed(2)} (filingSingleI ${c.filingSingleI})`); }
  }
console.log(`${process.argv[2]}: ${n} cells | Engine B disagrees ${badB} (worst ${wB.toFixed(2)}) | Engine C disagrees ${badC} (worst ${wC.toFixed(2)})`);
if (ex.length) console.log(ex.join("\n"));
load(60000, 62500, false); const C = E.computeIrmaaPlan(A), r = C.rows.find(x => x.yr === 2026);
console.log(`IRMAA case — single, SS 60,000, pension 62,500: MAGI ${Math.round(r.magi)} (worksheet ${Math.round(62500 + worksheet(60000, 62500, false))}), tier ${r.tier}, lifetime IRMAA $${Math.round(C.totalIrmaa).toLocaleString()}`);
