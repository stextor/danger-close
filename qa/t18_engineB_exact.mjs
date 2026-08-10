// t18 — ENGINE B (TAXES PLANNER), DOLLAR-EXACT, plus the Engine A vs Engine B agreement invariant.
//
// WHAT THIS IS. The first test to reach Engine B's arithmetic directly. v5.19 hoisted it out of the
// component body into module-level `computeTaxPlan`; v5.21 exports it through the shim. This file
// calls it and compares to the cent.
//
// WHY IT MATTERS MOST HERE. Engine B produces the lifetime tax estimate and is what the Roth
// conversion decision leans on. Until v5.21 the only way to observe it was the rendered DOM, where
// every figure is Math.round(x / 1000) — a ±$500 ceiling (OPERATIONS §M). It was the last engine
// behind that ceiling.
//
// ══ THE HEADLINE: ENGINE A AND ENGINE B ARE PARALLEL IMPLEMENTATIONS ══
// Verified at v5.20 by counting call sites inside each function:
//
//     helper              Engine A   Engine B
//     fedOrdinaryTax          0          1
//     ltcgTax                 0          2
//     marginalBracket         0          1
//     taxFactsFor             1          9
//
// Engine A calls NONE of the shared bracket / LTCG / marginal-rate helpers — it carries its own
// inline copies. AMT differs too: A reads TAX_CONSTS.SGL_AMT_EXEMPT directly, B goes through
// inflate(taxFactsFor(effSingle).amtEx, yr). v5.16's consolidation reached B thoroughly and A
// barely. So two implementations of the same statute exist, `t10` asserts A to the dollar, nothing
// asserted B at all, and NOTHING checked that they agree. Case 10 is that check.
//
// That is the defect class this project keeps finding — two code paths answering one question and
// drifting silently: C-2B-3 (ladder vs comparator), D-2D-3 (otherAccounts), and the v5.20 age-65
// deduction, which was the ladder disagreeing with the engine beside it.
//
// ══ WHAT IS INDEPENDENT ══
// Brackets, standard deductions, the age-65 extra, FICA rates and wage base are typed here from IRS
// Rev. Proc. 2025-32 / SSA figures, NOT read from the app. The 2%/yr indexation proxy is the app's
// disclosed modeling assumption (METHODOLOGY §6); WHICH figures it applies to is statute and is what
// is asserted. Case 10 compares two engines rather than an engine to a table, so it is independent
// by construction.
//
// HARNESS NOTES (verified):
//  1. `computeTaxPlan` reads module globals. Configure with applyLoadedData({ portfolio: P }) — a
//     WRAPPER — because setPortfolio does NOT rebuild PLAN_TIMELINE and Engine B reads both.
//  2. Social Security is set through incomeSources.ssA.planned (MONTHLY), not .amount. Setting
//     .amount is a silent no-op that leaves the demo benefit in place.
//  3. Engine A takes an explicit P object; Engine B reads globals. Case 10 therefore builds Engine
//     A's inputs FROM Engine B's own reported row (pen_y / 12, dobYr = yr - age, ...) so that a
//     misconfiguration cannot manufacture a false divergence.
//
// Run: node t18_engineB_exact.mjs [version-tag]
//   No argument tests app_testable.mjs, the current leg — the self-maintaining convention t15
//   adopted at v5.18 and t17 followed.
const VER = process.argv[2] || null;
const MOD = await import(VER ? `./app_${VER}.mjs` : "./app_testable.mjs");
const G = MOD.__g, E = MOD.__engines;

let pass = 0, fail = 0; const fails = [];
const T = (name, got, exp, tol = 0.01) => {
  const ok = Math.abs(got - exp) <= tol;
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; const m = `  \u2717 ${name}: got ${Number(got).toFixed(2)} exp ${Number(exp).toFixed(2)} \u0394 ${(got - exp).toFixed(2)}`; console.log(m); fails.push(m); }
};
const CK = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; const m = `  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`; console.log(m); fails.push(m); }
};

console.log("t18 \u2014 ENGINE B (TAXES) DOLLAR-EXACT + A/B AGREEMENT \u2014 module-level engine, no DOM");

// ══ INDEPENDENT REFERENCE — IRS Rev. Proc. 2025-32, SSA 2026 ══
const STD_REF = { S: 16100, M: 32200 };
const SR_REF  = { S: 2050,  M: 1650  };          // §63(f) age-65 additional, per person for MFJ
const BR_REF  = {                                 // [rate, upper bound of band] in 2026 dollars
  S: [[0.10, 12400], [0.12, 50400], [0.22, 105700], [0.24, 201775], [0.32, 256225], [0.35, 640600], [0.37, Infinity]],
  M: [[0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550], [0.32, 512450], [0.35, 768700], [0.37, Infinity]],
};
const IDX = (yr) => Math.pow(1.02, yr - 2026);

// Hand bracket walk — the same arithmetic t10 uses against Engine A, applied here to Engine B.
const fedRef = (taxable, status, yr) => {
  const i = IDX(yr);
  let tax = 0, prev = 0;
  for (const [rate, upper] of BR_REF[status]) {
    const cap = upper === Infinity ? Infinity : upper * i;
    if (taxable <= prev) break;
    tax += (Math.min(taxable, cap) - prev) * rate;
    prev = cap;
  }
  return tax;
};
const dedRef = (yr, status, n65) => Math.round(STD_REF[status] * IDX(yr))
  + (status === "S" ? (n65 > 0 ? Math.round(SR_REF.S * IDX(yr)) : 0) : n65 * Math.round(SR_REF.M * IDX(yr)));

// ══ HOUSEHOLD BUILDER ══
const BASE_P = JSON.parse(JSON.stringify(G.PORTFOLIO()));
const build = ({ pension = 0, single = false, ssMonthly = 0, ssAge = 67, stateCode = null,
                 positions = [], lifeExpA = 95, lifeExpB = 95, taxYield = 0, roth = 0, qcd = 0,
                 retireYear = null } = {}) => {
  const P = JSON.parse(JSON.stringify(BASE_P));
  P.positions = positions; P.otherAccounts = []; P.stateCode = stateCode;
  P.single = single; P.lifeExpA = lifeExpA; P.lifeExpB = lifeExpB;
  P.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
  const ss = (m) => ({ tableByAge: { 62: m, 63: m, 64: m, 65: m, 67: m, 70: m }, planned: m, plannedAge: ssAge });
  P.incomeSources = { ssA: ss(ssMonthly), ssB: ss(0), pension: { amount: pension / 12 } };
  G.applyLoadedData({ portfolio: P });
  const tl = G.PLAN_TIMELINE();
  const plan = E.computeTaxPlan({ retireYear: retireYear ?? tl.targetRetireYear, rothAmount: roth, qcdAnnual: qcd, taxYield });
  return { plan, tl, rowAt: (yr) => plan.rows.find(r => r.yr === yr) };
};

// ── setup sanity ────────────────────────────────────────────────────────────
console.log("\n  setup");
{
  CK("Engine B is exported and callable at module level", typeof E?.computeTaxPlan === "function");
  const { plan, rowAt, tl } = build({ pension: 120000 });
  T("as-of year is the constants base", tl.asOfYear, 2026);
  const r = rowAt(2029);
  T("MAGI is exactly the pension \u2014 SS, work, RMD, conversions, dividends all zero", r.magi_y, 120000);
  CK("...and the engine reports CENTS, not thousands (the whole point of the export)",
     Math.abs(r.fedTax - Math.round(r.fedTax)) > 0 || String(r.fedTax).includes("."),
     `fedTax=${r.fedTax}`);
}

// ══ CASE 1 — federal ordinary tax, hand-computed, both filing statuses ══
console.log("\n  case 1 \u2014 federal ordinary tax against a hand bracket walk");
for (const [label, single, status] of [["MFJ", false, "M"], ["Single", true, "S"]]) {
  for (const pension of [60000, 120000, 260000]) {
    const r = build({ pension, single }).rowAt(2029);
    const n65 = single ? (r.ageA >= 65 ? 1 : 0) : ((r.ageA >= 65 ? 1 : 0) + (r.ageB >= 65 ? 1 : 0));
    const expDed = dedRef(2029, status, n65);
    const expTaxable = Math.max(0, pension - expDed);
    T(`${label} $${(pension / 1000)}K pension: total deductions`, r.totalDeductions, expDed);
    T(`${label} $${(pension / 1000)}K pension: taxable ordinary`, r.taxableOrdinary, expTaxable);
    T(`${label} $${(pension / 1000)}K pension: federal tax to the cent`, r.fedTax, fedRef(expTaxable, status, 2029));
  }
}

// ══ CASE 2 — the age-65 additional standard deduction, per spouse ══
// Spouse A born 1964 (65 in 2029), spouse B born 1966 (65 in 2031).
console.log("\n  case 2 \u2014 age-65 additional standard deduction (\u00a763(f)), counted per spouse");
{
  const { rowAt } = build({ pension: 120000 });
  const r29 = rowAt(2029), r31 = rowAt(2031);
  // The pre-65 boundary. Engine B's rows begin at retireYear, so 2027 is only reachable by passing
  // retireYear explicitly — an earlier draft read rowAt(2028) from a plan starting in 2029, got
  // undefined, and skipped the assertion silently behind an `if`. A check that does not run is
  // worse than no check, because it reports as coverage.
  const early = build({ pension: 120000, retireYear: 2027 });
  const r27 = early.rowAt(2027);
  CK("pre-65 year is reachable (retireYear passed explicitly)", !!r27,
     `first row ${early.plan.rows[0]?.yr}`);
  if (r27) {
    CK("2027: spouse A is 63, spouse B is 61 \u2014 confirm ages before asserting",
       r27.ageA === 63 && r27.ageB === 61, `ageA=${r27.ageA} ageB=${r27.ageB}`);
    T("2027: neither spouse 65 yet \u2014 NO age-65 extra", r27.seniorExtra, 0);
    T("2027: deduction is the bare indexed MFJ figure", r27.totalDeductions, Math.round(STD_REF.M * IDX(2027)));
  }
  T("2029: spouse A is 65, spouse B is 63 \u2014 exactly ONE extra",
    r29.seniorExtra, Math.round(SR_REF.M * IDX(2029)));
  T("2031: both spouses 65+ \u2014 TWO extras", r31.seniorExtra, 2 * Math.round(SR_REF.M * IDX(2031)));
  T("2029 base standard deduction is the indexed MFJ figure", r29.stdDed, Math.round(STD_REF.M * IDX(2029)));
  const s = build({ pension: 120000, single: true }).rowAt(2029);
  T("single filer aged 65+ gets the SINGLE extra, not the MFJ one", s.seniorExtra, Math.round(SR_REF.S * IDX(2029)));
}

// ══ CASE 3 — Social Security taxability (IRC §86) ══
// Provisional income = other income + 50% of benefits. MFJ tiers: $32,000 / $44,000, UNINDEXED by
// statute — the figures have never been adjusted since 1983/1993. Max 85% of benefits taxable.
console.log("\n  case 3 \u2014 Social Security taxability, IRC \u00a786 (thresholds are statutorily UNINDEXED)");
{
  // Spouse A claims at 67 => 2031. Read 2032 so a full year of benefit is running.
  const ssMo = 3000, ssYr = ssMo * 12;
  const lo = build({ pension: 10000, ssMonthly: ssMo }).rowAt(2032);
  const hi = build({ pension: 120000, ssMonthly: ssMo }).rowAt(2032);
  CK("a full year of benefit is running in the year read", lo && lo.ssTotal === ssYr,
     `ssTotal=${lo && lo.ssTotal} expected ${ssYr}`);
  if (lo && hi) {
    const prov = (other, ss) => other + 0.5 * ss;
    CK(`low-income case: provisional $${prov(10000, ssYr).toLocaleString()} is under the $32,000 tier`,
       prov(10000, ssYr) < 32000);
    T("...so none of the benefit is taxable", lo.ssTaxable, 0);
    CK(`high-income case: provisional $${prov(120000, ssYr).toLocaleString()} is far over the $44,000 tier`,
       prov(120000, ssYr) > 44000);
    T("...so the 85% ceiling binds exactly", hi.ssTaxable, Math.round(0.85 * ssYr));
  }
}

// ══ CASE 10 — [EXTINCTION] ENGINE A AND ENGINE B AGREE ══
// The headline. Engine A's inputs are derived FROM Engine B's own reported row, so the two see
// identical income by construction and a misconfiguration cannot fake a divergence.
// Engine A is driven with single-year isolation (t10's technique): retireYr == horizonYr == the
// year under test, so its totTax IS that year's tax.
console.log("\n  case 10 [EXTINCTION] \u2014 Engine A and Engine B agree on the same household");
{
  const engineA = (row, single, yr) => {
    const P = {
      single, asOfYr: 2026, retireYr: yr, horizonYr: yr, ladderEnd: yr, ladderEndA: yr, ladderEndB: yr,
      dobAYr: yr - row.ageA, dobBYr: yr - row.ageB, deathYr1: Infinity, survivor: "A",
      ssA: 0, ssB: 0, ssAYr: 9999, ssAMo: 1, ssBYr: 9999, ssBMo: 1,
      pen: row.pen_y / 12, stateRate: 0, stateCode: null, convTaxFunding: "withhold",
      taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
      tradInit: 0, rothInit: 0, tradInitA: 0, tradInitB: 0, rothInitA: 0, rothInitB: 0, taxableInit: 0,
    };
    const res = G.runRothStrategies(P).find(r => r.key === "none");
    return res;
  };
  for (const [label, single] of [["MFJ", false], ["Single", true]]) {
    for (const pension of [60000, 120000, 260000]) {
      const yr = 2029;
      const rowB = build({ pension, single }).rowAt(yr);
      const resA = engineA(rowB, single, yr);
      CK(`${label} $${pension / 1000}K: Engine A returned a comparable single-year result`, !!resA,
         `keys: ${resA ? Object.keys(resA).join(",") : "none"}`);
      if (resA) {
        T(`${label} $${pension / 1000}K [EXTINCTION]: A and B agree on federal tax`,
          resA.totTax, rowB.fedTax, 1.0);
      }
    }
  }
}

console.log(`\nt18 SUITE: ${pass} passed, ${fail} failed`);
if (fail) { console.log("\nFAILURES:"); fails.forEach(f => console.log(f)); process.exit(1); }
