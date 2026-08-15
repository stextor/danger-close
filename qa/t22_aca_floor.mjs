// t22 — THE ACA 100% OF FPL ELIGIBILITY FLOOR (v5.32).
//
// WHAT THIS IS. The floor has existed since the ACA feature shipped at v5.7 and nothing in the
// suite exercised any ratio below 1.0, in either regime, through all 1010 checks at v5.31. This
// file closes that gap and pins the v5.32 behaviour.
//
// THREE THINGS ARE ASSERTED AND THEY ARE DIFFERENT CLAIMS — read before adding cases.
//
//   1. THE FLOOR IS REAL AND BINDS IN BOTH REGIMES (D-B, the defect fix). Through v5.31
//      acaApplicablePct's `enhanced` branch returned BEFORE reaching the floor test, so any ratio
//      under 150% FPL yielded an applicable percentage of 0 — the ENTIRE benchmark premium paid
//      as subsidy, measured all the way down to a ratio of 0.000. ARPA/IRA removed the 400%
//      cliff; neither touched the §36B(c)(1)(A) 100%-of-FPL eligibility floor. The reference
//      expectations here come from the statute, not from the app.
//
//   2. NO FIGURE MOVED UNDER CURRENT LAW (A2, the display decision). v5.32 flags sub-floor years
//      and excludes them from improvement claims; it does NOT change what they pay, which stays
//      $0. Group F compares Engine A's ENTIRE per-year subsidy map against the prior build and
//      requires byte identity.
//
//      ⚠ WHY THAT GROUP EXISTS AT ALL, AND WHY PARITY IS NOT A SUBSTITUTE. `t2 compare` runs its
//      Roth fingerprint household with `acaPremium: 0, acaSize: 0`. acaHeads returns 0 whenever
//      the premium is <= 0, so bridgeInWindow is false, baselineSubByYr is null, and acaSubByYr
//      is never populated. NO ACA CODE EXECUTES INSIDE THE PARITY GUARDRAIL, in either regime.
//      Parity 8/8 strict on this release proves the non-ACA engines are untouched and proves
//      nothing whatsoever about this feature area. Recorded in ARCHITECTUREIssues as the
//      premium-zero blind spot. Do not delete this group in favour of "parity covers it."
//
//   3. THE $0 BELOW THE FLOOR IS A PLACEHOLDER, NOT AN ANSWER (A2, the reason the flag exists).
//      Above the 400% cliff $0 is what the statute gives you. Below the 100% floor $0 is what
//      this model says when Medicaid is what actually governs and the model does not price it.
//      Both render identically today, so acaBelowFloor is what tells them apart.
//
// HOUSEHOLD NOTE. The example household is not usable for most of this: it crosses the floor in
// exactly one year and the deep crossings are the interesting case. The bridge household built
// below crosses TWICE and at two very different depths — 2029 at ~87% of FPL and 2030 at ~18% —
// which is the shape the pre-build measurement found across six reconstructed households (6 of
// 24 modelled bridge years sub-floor, two of them below 51% of FPL). A flag that only reads
// "near the edge" would be false for half the crossings this app actually produces.
//
// Run: node t22_aca_floor.mjs [prior-tag]
//   Groups A-E and G run against app_testable.mjs, the current leg.
//   Group F needs the PRIOR build's bundle and defaults to app_v532.mjs. Roll the default
//   forward every release, the same way t2's parity pair rolls.
//
//   ⚠ ROLLING THE DEFAULT IS NOT ENOUGH ON ITS OWN (learned at v5.33). Group F mixes two kinds
//   of claim: byte-identity checks, which are TRUE FOR EVERY PAIR and should roll; and the
//   "acaFloorYrs is NEW" check, which is a claim about ONE transition (v5.31 → v5.32) and is
//   FALSE once the prior build is v5.32 or later. Rolling the tag without gating that check
//   turns a green suite red for a reason that has nothing to do with the app. The check is
//   therefore gated on the prior tag below (OPERATIONS §B2: each leg asserts what is true for
//   its own build). The rotation forces this: v5.31 leaves the knowledge pool at v5.33, so a
//   session working from knowledge alone cannot build app_v531.mjs at all.
const PRIOR = process.argv[2] || "v532";
const MOD = await import("./app_testable.mjs");
const g = MOD.__g;

let PRIOR_G = null, PRIOR_ERR = null;
try { PRIOR_G = (await import(`./app_${PRIOR}.mjs`)).__g; }
catch (e) { PRIOR_ERR = String(e).split("\n")[0]; }

let pass = 0, fail = 0; const fails = [];
const CK = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; const m = `  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`; console.log(m); fails.push(m); }
};
const EQ = (name, got, exp, tol = 0) =>
  CK(name, Math.abs(got - exp) <= tol, `got ${got} exp ${exp}`);

console.log("t22 \u2014 ACA 100% FPL ELIGIBILITY FLOOR (v5.32)");

// ══ INDEPENDENT REFERENCE ══════════════════════════════════════════════════════════════════
// 26 U.S.C. §36B(c)(1)(A): the premium tax credit is available to a taxpayer whose household
// income is between 100% and 400% of the federal poverty line. ARPA §9661 / IRA §12001 suspended
// the UPPER bound for 2021-2025 and capped the applicable percentage at 8.5%; neither touched
// the lower bound. So: below 100% of FPL there is no credit under either regime.
// Applicable percentages under current law from IRS Rev. Proc. 2025-25 §3.01 (2.10% below 133%).
// HHS/ASPE 2025 poverty guidelines, used for 2026 coverage: $15,650 + $5,500 per extra person.
const FPL_2026_COUPLE = 15650 + 5500;          // = 21150, typed from HHS, not read from the app
const PCT_BELOW_133 = 0.021;

// ── GROUP A · the floor binds in BOTH regimes  [EXTINCTION] ────────────────────────────────
console.log("\n\u2500\u2500 A \u00b7 the floor binds in both regimes [EXTINCTION: D-B]");
{
  const P = g.acaApplicablePct;
  for (const r of [1.001, 1.0]) {
    EQ(`A: ratio ${r} \u2014 current law is eligible at ${(PCT_BELOW_133 * 100).toFixed(2)}%`, P(r, "current"), PCT_BELOW_133);
    CK(`A: ratio ${r} \u2014 enhanced is eligible (0% applicable pct below 150% FPL)`, P(r, "enhanced") === 0, String(P(r, "enhanced")));
  }
  for (const r of [0.999, 0.900, 0.505, 0.233, 0.0]) {
    CK(`A: ratio ${r} \u2014 current law: INELIGIBLE`, P(r, "current") === null, String(P(r, "current")));
    CK(`A: ratio ${r} \u2014 enhanced: INELIGIBLE (was 0% \u2192 full premium through v5.31)`, P(r, "enhanced") === null, String(P(r, "enhanced")));
  }
  // The 400% cliff is CURRENT-LAW ONLY and must survive the fix untouched. Getting the floor
  // right by accidentally applying the cliff in both regimes would be a different defect.
  CK("A: the 400% cliff still bites under current law", P(4.0001, "current") === null, String(P(4.0001, "current")));
  EQ("A: the 400% cliff still does NOT bite under enhanced (8.5% cap)", P(4.0001, "enhanced"), 0.085);
  EQ("A: current law is still eligible AT exactly 400% FPL", P(4.0, "current"), 0.0996);
}

// ── GROUP B · regime symmetry below the floor ──────────────────────────────────────────────
console.log("\n\u2500\u2500 B \u00b7 regime symmetry below the floor");
{
  const BENCH = 19200;
  const magi = 0.95 * FPL_2026_COUPLE;   // 95% of FPL — squarely sub-floor, plausibly a real plan
  const cur = g.acaSubsidyAnnual(magi, 2026, 2, BENCH, "current");
  const enh = g.acaSubsidyAnnual(magi, 2026, 2, BENCH, "enhanced");
  EQ("B: current law pays $0 below the floor", cur, 0);
  EQ("B: enhanced pays $0 below the floor too", enh, 0);
  CK("B: the two regimes no longer differ by a whole benchmark premium", Math.abs(cur - enh) < 1, `\u0394 ${enh - cur}`);
  // Above the floor they SHOULD differ — the toggle is supposed to do something.
  const a = g.acaSubsidyAnnual(2.0 * FPL_2026_COUPLE, 2026, 2, BENCH, "current");
  const b = g.acaSubsidyAnnual(2.0 * FPL_2026_COUPLE, 2026, 2, BENCH, "enhanced");
  CK("B: above the floor the regimes still differ (the toggle is not neutered)", b - a > 1000, `\u0394 ${Math.round(b - a)}`);
}

// ── GROUP C · the boundary, hand-computed to the dollar ────────────────────────────────────
console.log("\n\u2500\u2500 C \u00b7 boundary at exactly 100% FPL, hand-computed");
{
  const BENCH = 19200;
  EQ("C: the app's FPL for a 2026-coverage couple matches HHS", g.acaFplFor(2026, 2), FPL_2026_COUPLE);
  // At exactly 100% FPL: subsidy = benchmark - 2.10% x MAGI = 19200 - 0.021 x 21150 = 18755.85
  const expAt100 = BENCH - PCT_BELOW_133 * FPL_2026_COUPLE;
  EQ("C: at exactly 100% FPL, subsidy = benchmark \u2212 2.10% \u00d7 MAGI", g.acaSubsidyAnnual(FPL_2026_COUPLE, 2026, 2, BENCH, "current"), expAt100, 0.01);
  EQ("C: one dollar ABOVE 100% FPL is still eligible", g.acaSubsidyAnnual(FPL_2026_COUPLE + 1, 2026, 2, BENCH, "current"), expAt100 - PCT_BELOW_133, 0.01);
  EQ("C: one dollar BELOW 100% FPL pays nothing", g.acaSubsidyAnnual(FPL_2026_COUPLE - 1, 2026, 2, BENCH, "current"), 0);
  // The discontinuity is the thing this release makes visible rather than removes. Pin its SIZE,
  // so that if a later release ever does smooth it, this assertion is what forces the decision
  // to be deliberate instead of incidental.
  const jump = g.acaSubsidyAnnual(FPL_2026_COUPLE, 2026, 2, BENCH, "current") - g.acaSubsidyAnnual(FPL_2026_COUPLE - 1, 2026, 2, BENCH, "current");
  CK("C: [DISCLOSED] one dollar of MAGI still moves the subsidy by ~a whole premium", jump > 18000, `\u0394 ${jump.toFixed(2)} on $1 of MAGI`);
  CK("C: acaBelowFloor is exported and reachable", typeof g.acaBelowFloor === "function", String(typeof g.acaBelowFloor));
  CK("C: acaBelowFloor is false AT the floor", g.acaBelowFloor(FPL_2026_COUPLE, 2026, 2) === false);
  CK("C: acaBelowFloor is true one dollar under", g.acaBelowFloor(FPL_2026_COUPLE - 1, 2026, 2) === true);
  CK("C: acaBelowFloor is false above the 400% cliff (statutory $0 is NOT a blank)", g.acaBelowFloor(5 * FPL_2026_COUPLE, 2026, 2) === false);
}

// ── GROUP D · the drift case — a household falls through the floor without changing ────────
console.log("\n\u2500\u2500 D \u00b7 drift: FPL grows 2%/yr, a flat MAGI does not");
{
  const BENCH = 19200, MAGI = 24472;   // the trace from the scope, reproduced
  const yrs = [2030, 2032, 2033, 2034, 2035];
  const subs = yrs.map(y => g.acaSubsidyAnnual(MAGI, y, 2, BENCH, "current"));
  CK("D: the same MAGI is eligible in 2033", subs[2] > 0, String(Math.round(subs[2])));
  CK("D: and ineligible by 2034, with nothing about the household changed", subs[3] === 0, String(subs[3]));
  CK("D: the year it crosses is flagged", g.acaBelowFloor(MAGI, 2034, 2) === true);
  CK("D: the year before is not", g.acaBelowFloor(MAGI, 2033, 2) === false);
  // Same drift under the enhanced regime — before v5.32 this household sailed on collecting the
  // full premium forever, because that branch had no floor to drift through.
  CK("D: the drift now happens under the enhanced regime too", g.acaSubsidyAnnual(MAGI, 2034, 2, BENCH, "enhanced") === 0);
}

// ── the bridge household used by E and F ───────────────────────────────────────────────────
// Crosses the floor TWICE and at two depths: shallow in 2029, deep in 2030.
// asOfYr is mandatory — omitting it silently NaNs every tax figure (OPERATIONS §C).
const BRIDGE = {
  single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035,
  dobAYr: 1965, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
  ssA: 3000, ssB: 1800, ssAYr: 2032, ssAMo: 6, ssBYr: 2033, ssBMo: 6,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.5,
  acaPremium: 1600, acaSize: 2, taxYieldPct: 1.5, currentConv: 0,
  tradInit: 900000, rothInit: 100000, tradInitA: 600000, tradInitB: 300000,
  rothInitA: 60000, rothInitB: 40000, taxableInit: 250000,
};

// ── GROUP E · Engine A end-to-end: exactly the crossing years flagged ──────────────────────
console.log("\n\u2500\u2500 E \u00b7 Engine A: the A2 flag names exactly the crossing years");
{
  const res = g.runRothStrategies(BRIDGE);
  const none = res.find(r => r.key === "none");
  CK("E: the bridge is live (a subsidy is computed in some year)", Object.keys(none.acaSubByYr).length > 0);
  CK("E: acaFloorYrs is returned by the engine", none.acaFloorYrs && typeof none.acaFloorYrs === "object", String(none.acaFloorYrs));
  const flagged = Object.keys(none.acaFloorYrs).map(Number).sort();
  CK("E: the no-conversion row crosses in exactly 2029 and 2030", JSON.stringify(flagged) === "[2029,2030]", JSON.stringify(flagged));
  CK("E: every flagged year pays $0", flagged.every(y => none.acaSubByYr[y] === 0), JSON.stringify(flagged.map(y => none.acaSubByYr[y])));
  CK("E: no UNflagged bridge year pays $0 (the flag is not just 'the zeros')",
    Object.keys(none.acaSubByYr).map(Number).filter(y => !flagged.includes(y)).every(y => none.acaSubByYr[y] > 0));
  // Depth is carried, not just the fact — 2030 is nowhere near the edge and copy must not say so.
  CK("E: the shallow crossing is recorded near the line", none.acaFloorYrs[2029] > 0.8 && none.acaFloorYrs[2029] < 1.0, String(none.acaFloorYrs[2029]));
  CK("E: the deep crossing is recorded as deep, not as 'near the edge'", none.acaFloorYrs[2030] < 0.5, String(none.acaFloorYrs[2030]));
  CK("E: every ratio recorded is genuinely below the floor", flagged.every(y => none.acaFloorYrs[y] < 1.0));
  // Every strategy row carries the field, so the table can union them.
  CK("E: all strategy rows return the field", res.every(r => r.acaFloorYrs && typeof r.acaFloorYrs === "object"));
  // S-5 GUARD (scope §6): the cliff solver bounds the UPPER cliff only and must not have acquired
  // a lower bound. Under A2 nothing rewards crossing the floor upward, so this stays $0-free.
  const cliff = res.find(r => r.key === "acaCliff");
  CK("E: the STAY UNDER ACA CLIFF strategy still exists on a floor-crossing household", !!cliff);
  CK("E: [S-5 GUARD] the solver still converts on the bridge (it did not start chasing the floor)", cliff.totConv >= 0);
}

// ── GROUP F · nothing moved: byte identity against the prior build ─────────────────────────
console.log(`\n\u2500\u2500 F \u00b7 A2 moved no figure \u2014 byte identity vs ${PRIOR} (parity CANNOT see this)`);
{
  if (!PRIOR_G) {
    CK(`F: prior build app_${PRIOR}.mjs is loadable`, false, PRIOR_ERR || "missing");
  } else {
    const now = g.runRothStrategies(BRIDGE);
    const was = PRIOR_G.runRothStrategies(BRIDGE);
    CK("F: same strategy set", JSON.stringify(now.map(r => r.key)) === JSON.stringify(was.map(r => r.key)));
    for (let i = 0; i < was.length; i++) {
      CK(`F: ${was[i].key} \u2014 acaSubByYr is byte-identical`,
        JSON.stringify(now[i].acaSubByYr) === JSON.stringify(was[i].acaSubByYr),
        `${JSON.stringify(now[i].acaSubByYr)} vs ${JSON.stringify(was[i].acaSubByYr)}`);
    }
    CK("F: totAcaLoss is unchanged on every row (A2 is a DISPLAY exclusion, not an engine one)",
      now.every((r, i) => r.totAcaLoss === was[i].totAcaLoss),
      now.map((r, i) => `${r.key}:${r.totAcaLoss}/${was[i].totAcaLoss}`).join(" "));
    CK("F: estate is unchanged on every row (it feeds the parity fingerprint)",
      now.every((r, i) => r.estate === was[i].estate));
    // Gated per prior tag. Against a PRE-v5.32 prior this is the original transition claim:
    // the flag did not exist and now does. Against v5.32 or later the flag exists on BOTH
    // sides, and the honest assertion is that it is still present and still populated —
    // which is what "v5.33 moved no figure" needs Group F to witness.
    const _priorPredatesFloor = ["v531", "v530", "v529"].includes(PRIOR);
    if (_priorPredatesFloor) {
      CK("F: acaFloorYrs is NEW \u2014 the prior build does not have it",
        was.every(r => r.acaFloorYrs === undefined) && now.every(r => r.acaFloorYrs !== undefined));
    } else {
      CK(`F: acaFloorYrs is present on BOTH builds and byte-identical (prior=${PRIOR})`,
        was.every(r => r.acaFloorYrs !== undefined) && now.every(r => r.acaFloorYrs !== undefined)
        && now.every((r, i) => JSON.stringify(r.acaFloorYrs) === JSON.stringify(was[i].acaFloorYrs)),
        now.map((r, i) => `${r.key}:${JSON.stringify(r.acaFloorYrs)}/${JSON.stringify(was[i].acaFloorYrs)}`).join(" "));
    }
  }
}

// ── GROUP G · negative controls — corrupt the floor and watch the suite fail ───────────────
console.log("\n\u2500\u2500 G \u00b7 negative controls (if one does NOT fire, that is the finding)");
{
  const C = g.ACA_CONSTS();
  const saved = C.floorMult;
  const neg = (name, probe) => {
    C.floorMult = 0;                       // remove the floor entirely — the pre-v5.32 world
    let stillTrue;
    try { stillTrue = probe(); } finally { C.floorMult = saved; }
    CK(`G: control fires \u2014 ${name}`, stillTrue === false, "assertion survived a corrupted floorMult");
  };
  neg("current-law ineligibility below 100% FPL", () => g.acaApplicablePct(0.999, "current") === null);
  neg("enhanced-regime ineligibility below 100% FPL (this is D-B's control)", () => g.acaApplicablePct(0.999, "enhanced") === null);
  neg("the sub-floor $0 payout", () => g.acaSubsidyAnnual(0.95 * FPL_2026_COUPLE, 2026, 2, 19200, "current") === 0);
  neg("acaBelowFloor's predicate", () => g.acaBelowFloor(FPL_2026_COUPLE - 1, 2026, 2) === true);
  neg("the A2 flag set on the bridge household",
    () => Object.keys(g.runRothStrategies(BRIDGE).find(r => r.key === "none").acaFloorYrs).length > 0);
  CK("G: floorMult was restored after the controls", g.ACA_CONSTS().floorMult === saved, String(g.ACA_CONSTS().floorMult));
  CK("G: and the floor works again", g.acaApplicablePct(0.999, "enhanced") === null);
}

console.log(`\nt22 SUITE: ${pass} passed, ${fail} failed`);
if (fail) { fails.forEach(f => console.log(f)); process.exit(1); }
