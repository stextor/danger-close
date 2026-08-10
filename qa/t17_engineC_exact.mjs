// t17 — ENGINE C (IRMAA PLANNER), DOLLAR-EXACT.
//
// WHAT THIS IS. The first test to reach Engine C's arithmetic directly. v5.17 hoisted the engine
// out of the React component body into the module-level `computeIrmaaPlan`; v5.18 exports it
// through the shim. This file calls it and compares to the cent.
//
// WHY IT EXISTS. Until now the ONLY way to observe this engine was the rendered DOM, where every
// figure is printed as Math.round(x / 1000) — a ±$500 ceiling on MAGI and ±$50 on the surcharge
// (OPERATIONS §M). t13 still reads it that way, by regex over page text, and t13's job is
// different: it is the survivor extinction invariant for C-2C-5 and it also proves the tab
// actually renders. This file asserts the engine's numbers against statute. Both are kept.
//
// The gap that ceiling hid is not hypothetical. On the example household the engine computes
// 2039 MAGI of $159,598.05 and the DOM showed "$160K" — $402 of invisible error, and an IRMAA
// boundary is a CLIFF where one dollar costs a four-figure sum for the year.
//
// ══ WHAT IS ASSERTED INDEPENDENTLY, AND WHAT IS NOT — read before adding cases ══
//
// INDEPENDENT (the substance): the 2026 tier THRESHOLDS, the tier SELECTION rule, the
// premium-year indexation, the statutory top-tier freeze, the 2-year lookback, the QCD
// exclusion, the per-person count, and the survivor filing switch. All three IRMAA defects this
// project has found lived in exactly these (F-2B-1 premium-year indexing, F-2B-2 the freeze,
// C-2B-3 a drifted inflator). Thresholds below are typed from the CMS figures published
// 2025-11-14, not read from the app.
//
// NOT INDEPENDENT, DELIBERATELY: the surcharge AMOUNT. `IRMAA_CONSTS.SUR` is rounded to the
// nearest $10 and the source says so on the line above it — "SUR = approximate annual Part B +
// Part D surcharge per person." The Phase 2B audit derived the per-tier deltas (≤$5) and closed
// them as a DISCLOSED ROUNDING, not a defect. So this file does NOT pin them as a defect and does
// NOT assert CMS-exact surcharges, either of which would assert that correct, documented
// behaviour is wrong.
//
// What it does instead — case A — is the guard that was missing: assert every constant sits
// WITHIN $5 of the CMS-exact figure, computed here from the published monthly Part B and Part D
// amounts. That is derived from the primary source rather than from the app, so it is not the
// tautology t16 was rewritten to avoid; it documents the approximation as a BOUNDED one, and it
// fails loudly if a constant ever drifts or a future CMS update is transcribed wrongly.
//
// HARNESS NOTES (both verified; neither applies to t15, so neither is covered by precedent):
//   1. `setPortfolio` does NOT rebuild PLAN_TIMELINE — only `applyLoadedData` does. Engine C
//      reads both, so configuring with setPortfolio alone silently tests a stale timeline.
//      `applyLoadedData` takes a WRAPPER: applyLoadedData({ portfolio: P }).
//   2. Social Security is set through `incomeSources.ssA.planned`, NOT `.amount` — setting
//      `.amount` is a silent no-op and leaves the demo benefit in place, which would put ~$47K of
//      phantom SS into every MAGI here and quietly move every border case into the wrong tier.
//   3. The example household proves nothing about IRMAA — its MAGI never approaches a threshold.
//      Every case below builds a purpose-built household where pension is the ONLY MAGI source.
//
// Run: node t17_engineC_exact.mjs [version-tag]
//   No argument tests app_testable.mjs, the current leg — same self-maintaining convention t15
//   adopted at v5.18 and t7/t8 have always used. An explicit tag drives a frozen leg.
const VER = process.argv[2] || null;
const MOD = await import(VER ? `./app_${VER}.mjs` : "./app_testable.mjs");
const G = MOD.__g, E = MOD.__engines;

let pass = 0, fail = 0; const fails = [];
const T = (name, got, exp, tol = 0) => {
  const ok = Math.abs(got - exp) <= tol;
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; const m = `  \u2717 ${name}: got ${got} exp ${exp} \u0394 ${(got - exp).toFixed(2)}`; console.log(m); fails.push(m); }
};
const CK = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; const m = `  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`; console.log(m); fails.push(m); }
};

console.log("t17 \u2014 ENGINE C (IRMAA) DOLLAR-EXACT \u2014 module-level engine, no DOM");

// ══ INDEPENDENT REFERENCE — CMS 2026, published 2025-11-14, effective 2026-01-01 ══
// Monthly IRMAA amounts per person. Part B and Part D are billed separately and use the same
// income tiers; the app carries their annualised sum as one figure.
const PARTB_MO = [0, 81.20, 202.90, 324.60, 446.30, 487.00];
const PARTD_MO = [0, 14.50,  37.50,  60.40,  83.30,  91.00];
const CMS_ANNUAL = PARTB_MO.map((b, i) => (b + PARTD_MO[i]) * 12);
// 2026 MAGI thresholds (upper bound of each tier; the last entry is the open-ended top).
const SGL_R = [109000, 137000, 171000, 205000, 500000, Infinity];
const MFJ_R = [218000, 274000, 342000, 410000, 750000, Infinity];
// The app's DISCLOSED approximate annual surcharge (see the header). Case A bounds it.
const APP_SUR = [0, 1150, 2880, 4620, 6360, 6940];
// Indexation rules. The 2%/yr proxy is the app's disclosed modeling assumption (METHODOLOGY §6);
// WHICH YEAR it applies to, and the freeze, are statute and are the part asserted here.
// BBA-2018 (P.L. 115-123) §53114 froze the top tier through 2027, indexing only from 2028.
const IDX = 1.02, BASE_YR = 2026, TOP_FROZEN_THROUGH = 2027;
const thrRef = (upper, isTop, premiumYr) => !Number.isFinite(upper) ? upper
  : upper * Math.pow(IDX, isTop ? Math.max(0, premiumYr - TOP_FROZEN_THROUGH) : premiumYr - BASE_YR);

// ══ HOUSEHOLD BUILDER — pension is the only MAGI source ══
const BASE_P = JSON.parse(JSON.stringify(G.PORTFOLIO()));
const build = ({ magi, single = false, lifeExpA = 95, lifeExpB = 95, qcd = 0 }) => {
  const P = JSON.parse(JSON.stringify(BASE_P));
  P.positions = []; P.otherAccounts = [];
  P.single = single;
  P.lifeExpA = lifeExpA; P.lifeExpB = lifeExpB;
  // one explicit zero stream replaces the demo part-time taper (see the Field Manual)
  P.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
  const zeroSS = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
  P.incomeSources = { ssA: { ...zeroSS }, ssB: { ...zeroSS }, pension: { amount: magi / 12 } };
  G.applyLoadedData({ portfolio: P });
  const tl = G.PLAN_TIMELINE();
  const plan = E.computeIrmaaPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: qcd, taxYield: 0 });
  return { plan, tl, rowAt: (yr) => plan.rows.find(r => r.yr === yr) };
};

// ── sanity: the household builder actually neutralises everything it claims to ──
console.log("\n  setup \u2014 the purpose-built household");
{
  const { plan, tl, rowAt } = build({ magi: 300000 });
  CK("engine is exported and callable at module level", typeof E?.computeIrmaaPlan === "function");
  T("as-of year is the 2026 constants base", tl.asOfYear, BASE_YR);
  const r = rowAt(2031);
  T("MAGI is exactly the pension \u2014 SS, work, RMD, conversions and dividends all zero", r.magi, 300000, 0.01);
  CK("...and it is NOT a rounded-to-thousands figure (this is the whole point)",
     Number.isFinite(r.magi) && Math.abs(r.magi - 300000) < 0.01);
}

// ══ CASE A — the app's surcharge constants are a BOUNDED approximation ══
// Not a defect pin. The constant is labelled approximate in the source and the Phase 2B audit
// closed it; this asserts the bound, from the primary source, so drift cannot hide inside it.
console.log("\n  case A \u2014 surcharge constants within $5 of CMS-exact (disclosed rounding, bounded)");
for (let i = 0; i < 6; i++) {
  const d = APP_SUR[i] - CMS_ANNUAL[i];
  CK(`tier ${i}: app $${APP_SUR[i]} vs CMS $${CMS_ANNUAL[i].toFixed(2)} (\u0394 ${d >= 0 ? "+" : ""}${d.toFixed(2)}) within $5`,
     Math.abs(d) <= 5, `delta ${d.toFixed(2)}`);
}

// ══ CASE B — tier borders at ±$1, both filing statuses, all five boundaries ══
// The cliff is the entire point of this engine and has never been testable to the dollar.
// Income year 2031 => premium year 2033. Both spouses are 65+ by 2031, both alive (lifeExp 95).
console.log("\n  case B \u2014 tier borders \u00b11, premium-year thresholds, both filing statuses");
const Y = 2031, PY = Y + 2;
for (const [label, uppers, single] of [["MFJ", MFJ_R, false], ["SGL", SGL_R, true]]) {
  for (let i = 0; i < 5; i++) {
    const isTop = i === uppers.length - 2;              // last real threshold; [5] is the sentinel
    const THR = thrRef(uppers[i], isTop, PY);
    const persons = single ? 1 : 2;
    {
      const r = build({ magi: THR - 1, single }).rowAt(Y);
      T(`${label} tier ${i} border $${Math.round(THR)} \u2212 $1 stays in tier ${i}`, r.tier, i);
      T(`${label} tier ${i} border \u2212 $1: surcharge`, r.surchargeAnnual, APP_SUR[i] * persons);
    }
    {
      const r = build({ magi: THR + 1, single }).rowAt(Y);
      T(`${label} tier ${i} border $${Math.round(THR)} + $1 moves to tier ${i + 1}`, r.tier, i + 1);
    }
  }
}

// ══ CASE C — the 2-year lookback, and WHICH year's table applies ══
// F-2B-1: CMS applies the PREMIUM year's thresholds to income from two years earlier. The
// lookback shifts the income, not the table. A MAGI between the two tables discriminates.
console.log("\n  case C \u2014 2-year lookback and premium-year indexation (F-2B-1)");
{
  const { plan } = build({ magi: 300000 });
  CK("every row's premium year is exactly income year + 2", plan.rows.every(r => r.irmaaYr === r.yr + 2));
  const THR_income = thrRef(MFJ_R[0], false, Y);        // wrong rule: income-year table
  const THR_premium = thrRef(MFJ_R[0], false, PY);      // correct rule: premium-year table
  CK(`the two rules differ by ~2 years of indexation ($${Math.round(THR_premium - THR_income)})`,
     THR_premium - THR_income > 9000);
  const mid = (THR_income + THR_premium) / 2;           // over the old boundary, under the correct one
  const r = build({ magi: mid }).rowAt(Y);
  T(`MAGI between the two tables scores against the PREMIUM year => tier 0`, r.tier, 0);
  T(`...and therefore no surcharge`, r.surchargeAnnual, 0);
}

// ══ CASE D — the top tier is frozen through 2027 (F-2B-2) ══
console.log("\n  case D \u2014 top tier frozen through 2027, indexed only from 2028 (BBA-2018 \u00a753114)");
{
  const frozen = thrRef(MFJ_R[4], true, PY);            // 750000 * 1.02^(2033-2027)
  const ifIndexed = MFJ_R[4] * Math.pow(IDX, PY - BASE_YR); // the pre-v5.14 (wrong) behaviour
  CK(`frozen base differs from a fully-indexed one by $${Math.round(ifIndexed - frozen)}`,
     ifIndexed - frozen > 10000);
  const rLo = build({ magi: frozen - 1 }).rowAt(Y);
  T("one dollar under the frozen top threshold stays in tier 4", rLo.tier, 4);
  const rHi = build({ magi: frozen + 1 }).rowAt(Y);
  T("one dollar over it reaches tier 5", rHi.tier, 5);
  const rMid = build({ magi: (frozen + ifIndexed) / 2 }).rowAt(Y);
  T("a MAGI between frozen and fully-indexed is TOP tier (the freeze is applied)", rMid.tier, 5);
}

// ══ CASE E — the surcharge is per person, counted in the PREMIUM year ══
// Spouse A born 1964 (Medicare 2029), Spouse B born 1966 (Medicare 2031).
console.log("\n  case E \u2014 per-person count, gated on the premium year");
{
  const { plan, rowAt } = build({ magi: 300000 });
  const medA = plan._medAYr;
  T("both on Medicare once the premium year passes B's 65th", rowAt(2031).personsOnMedicare, 2);
  const oneRow = plan.rows.find(r => r.personsOnMedicare === 1);
  CK("there is a window where exactly one spouse is on Medicare", !!oneRow,
     `persons seen: ${[...new Set(plan.rows.map(r => r.personsOnMedicare))].join(",")}`);
  if (oneRow) T("...and in it the surcharge is charged once, not twice",
                oneRow.surchargeAnnual, APP_SUR[oneRow.tier] * 1);
  const zeroRow = plan.rows.find(r => r.irmaaYr < medA);
  CK("before either spouse is on Medicare nothing is charged", !zeroRow || zeroRow.surchargeAnnual === 0);
}

// ══ CASE F — survivor: the death, and the filing switch, are separate events ══
// IRS Pub. 501 permits a joint return FOR the year of death; Single starts the year after.
// C-2C-5 / C-2C-6: through v5.12 this engine paid both SS checks, kept MFJ thresholds, and
// charged for the decedent forever. All three are fixed; this asserts the filing half exactly.
console.log("\n  case F \u2014 survivor filing switch and the narrower Single table");
{
  // A dies first: dobA 1964 + 70 = 2034. B (1966 + 95) survives to 2061.
  const { plan, rowAt } = build({ magi: 300000, lifeExpA: 70, lifeExpB: 95 });
  const death = plan._deathYr1;
  T("first death lands where the life expectancies put it", death, 2034);
  CK("the death year itself is NOT filed Single (Pub. 501)", rowAt(death).filingSingleI === false);
  CK("the year AFTER the death is filed Single", rowAt(death + 1).filingSingleI === true);
  // Same $300K MAGI, scored against the Single table the year after: 300000 is under the MFJ
  // tier-1 boundary but well over the Single one, so the tier must rise.
  const before = rowAt(death), after = rowAt(death + 1);
  CK(`the same MAGI lands in a higher tier once filed Single (${before.tier} -> ${after.tier})`,
     after.tier > before.tier, `before ${before.tier}, after ${after.tier}`);
  T("survivor is one person on Medicare", after.personsOnMedicare, 1);
  T("survivor surcharge is that tier, charged once", after.surchargeAnnual, APP_SUR[after.tier] * 1);
}

// ══ CASE G — QCDs are excluded from MAGI, to the dollar ══
//
// WHY THIS IS NOT A DIFFERENCE TEST. The obvious design — run with and without a QCD and assert
// the MAGI gap equals the QCD — is WRONG here, and it failed by $3,759.59 when first written.
// QCDs begin at 70½ but RMDs do not begin until 73/75, so in the gap years the QCD withdraws from
// the IRA while no RMD is running. The two runs' BALANCES therefore diverge before the first RMD
// year, and from then on their RMDs differ too. The gap is the QCD plus years of compounded
// balance difference. That is correct modeling, not a defect — but it means no year exists where
// the difference is exactly the QCD.
//
// The exact assertion that IS available: make the QCD at least as large as the RMD. Then
// rmdTax_y = max(0, rmd_y - qcd_y) = 0, and MAGI must equal the pension EXACTLY — the whole RMD
// excluded, nothing left but the other income. Independent of the app's divisor table.
console.log("\n  case G \u2014 QCD exclusion: a QCD covering the RMD leaves MAGI at exactly the pension");
{
  const withTrad = (qcd) => {
    const P = JSON.parse(JSON.stringify(BASE_P));
    P.positions = [{ name: "IRA", balance: 2000000, trad: 2000000, roth: 0, type: "equity" }];
    P.otherAccounts = [];
    P.single = false; P.lifeExpA = 95; P.lifeExpB = 95;
    P.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
    const zeroSS = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
    P.incomeSources = { ssA: { ...zeroSS }, ssB: { ...zeroSS }, pension: { amount: PEN / 12 } };
    G.applyLoadedData({ portfolio: P });
    const tl = G.PLAN_TIMELINE();
    return E.computeIrmaaPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: qcd, taxYield: 0 });
  };
  const PEN = 150000, BIG_QCD = 150000;   // above the RMD, but small enough not to drain the IRA
  const noQ = withTrad(0), withQ = withTrad(BIG_QCD);
  // A year with an RMD running: MAGI must exceed the pension when nothing is excluded.
  // the FIRST RMD year: later years drain the balance, and an empty IRA would make
  // MAGI == PEN for the wrong reason (a test passing while proving nothing).
  const yr = noQ.rows.find(r => r.magi > PEN + 1)?.yr;
  CK("an RMD year exists to test against", !!yr,
     `max MAGI seen: ${Math.max(...noQ.rows.map(r => r.magi)).toFixed(2)}`);
  if (yr) {
    const ra = noQ.rows.find(r => r.yr === yr), rb = withQ.rows.find(r => r.yr === yr);
    CK(`without a QCD the RMD raises MAGI above the pension ($${ra.magi.toFixed(2)} > $${PEN})`,
       ra.magi > PEN + 1);
    T("with a QCD covering the RMD, MAGI is EXACTLY the pension \u2014 the RMD is fully excluded",
      rb.magi, PEN, 0.01);
    T("the full requested QCD applied \u2014 under both the per-person cap and the balance",
      rb.qcd_y, BIG_QCD, 0.01);
    T("a zero-QCD run excludes nothing", ra.qcd_y, 0);
  }
}

console.log(`\nt17 SUITE: ${pass} passed, ${fail} failed`);
if (fail) { console.log("\nFAILURES:"); fails.forEach(f => console.log(f)); process.exit(1); }
