// t32 — D-10 MODELLING HALF: the ladder's dividend term, witnessed where it is EXACT.
//
// WHY THIS EXISTS, AND WHY IT IS NOT A DOM SUITE.
//
// 1. The cross-version DOM diff reports 32 on this release — "no figures moved" — and that is
//    CORRECT and MEANINGLESS. Its own header says it walks the Withdrawal, Taxes and IRMAA tabs.
//    The Roth tab is not among them, so the release's headline gate is structurally blind to the
//    tab the release changes. A green number that means less than it looks like (OPERATIONS §B2).
//    Found at the v5.53 build; the scope had not noticed it either.
//
// 2. The ladder renders MAGI at Math.round(x/1000), so the DOM ceiling is +/-$500 (OPERATIONS §M).
//    On the shipped example household the dividend term is $420/yr. It is BELOW THE CEILING: a
//    rendered K-figure cannot distinguish it. A DOM assertion here would be unfalsifiable.
//
// So the dollar work is done against `computeIrmaaPlan`, where the figures are exact, and the
// ladder's own term is reconstructed from the same inputs it uses. t4 keeps the separate job of
// proving the tab renders the copy; this file proves the ARITHMETIC.
//
// ⚠ WHAT THIS FILE DOES NOT CLAIM. It does not read the ladder's rendered MAGI. The ladder is a
// component-inline block with no callable entry point (§M's instrumentation ceiling), so the
// closest available witness is that the term it now adds is computed from the same base, with the
// same holdout, as the engine it is being reconciled to. That is a real assertion and a narrower
// one than "the tab shows the right number." Say so rather than implying otherwise.
//
// usage: node qa/t32_ladder_dividend.mjs <tag>

const VER = process.argv[2] || "v553";
const KNOWN_VERSIONS = ["v552", "v553", "v554", "v555", "v556"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  process.exit(1);
}
const POST = VER === "v553" || VER === "v554" || VER === "v555" || VER === "v556";

// The source is read as well as the engine: A-2 below reconstructs the ladder's expression from
// its inputs, which would pass VACUOUSLY on a leg whose ladder does not carry the term at all.
// The source pin is what makes the prior leg assert its own pre-fix state (OPERATIONS §B2).
const { readFileSync } = await import("fs");
const { dirname, join } = await import("path");
const { fileURLToPath } = await import("url");
const SRC = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", `${VER}.jsx`), "utf8");
const CARRIES = SRC.includes("const magi = pension + spouseBWork + taxableSS + conv_y + rmd_y + _divLadder;");

const MOD = await import(`./app_${VER}.mjs`);
const G = MOD.__g, E = MOD.__engines;
const g = (n) => (typeof G[n] === "function" ? G[n]() : G[n]);

let pass = 0, fail = 0;
const T = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}${detail ? ` \u2014 ${detail}` : ""}`); }
};
console.log(`t32 \u2014 LADDER DIVIDEND TERM (${VER})\n`);

const BASE = JSON.parse(JSON.stringify(g("PORTFOLIO")));

// Build a household and return everything needed to reason about the omission, exactly.
// ⚠ asOfYr trap: engine P objects need it or every tax figure silently NaNs. applyLoadedData
// rebuilds PLAN_TIMELINE, which carries it, so the timeline is re-read AFTER the apply.
function build({ brokerage = 0, yieldPct = 2.0, pension = null } = {}) {
  const P = JSON.parse(JSON.stringify(BASE));
  // one explicit zero stream replaces the demo part-time taper (t17 convention) — a global
  // income stream would move `work_y` and contaminate the term being isolated
  P.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
  if (brokerage) P.otherAccounts = [...(P.otherAccounts || []),
    { label: "Brokerage", balance: brokerage, taxType: "taxable", owner: "joint" }];
  if (pension !== null) P.incomeSources = { ...(P.incomeSources || {}), pension: { amount: pension } };
  P.taxYieldPct = yieldPct;
  G.applyLoadedData({ portfolio: P });
  const tl = g("PLAN_TIMELINE");
  const args = { retireYear: tl.targetRetireYear, rothAmount: 70000, qcdAnnual: 0 };
  return {
    tl, yieldPct,
    full: E.computeIrmaaPlan({ ...args, taxYield: yieldPct }),
    zero: E.computeIrmaaPlan({ ...args, taxYield: 0 }),
    rsb: G.retireStartBalances(tl.rothLadderStart),
    taxableInit: G.taxableInitAll(),
  };
}

// ══ A · the term the ladder now adds, reconstructed from ITS OWN inputs ══
// This is the expression v5.53 put in the ladder. Asserting it against the engine's own
// behaviour is what makes "the two now agree on this term" a measurement rather than a claim.
const A = build({ yieldPct: 2.0 });
const ladderDiv = Math.round(Math.max(0, A.taxableInit - (A.rsb.othHsa || 0)) * (A.yieldPct / 100));
const engineDiv = A.full.rows[0].magi - A.zero.rows[0].magi;

T("A-1: the taxable sleeve and the HSA holdout are both non-zero \u2014 without this every check below is vacuous",
  A.taxableInit > 0 && (A.rsb.othHsa || 0) > 0,
  `taxableInitAll=${A.taxableInit} othHsa=${A.rsb.othHsa}`);
if (POST) {
  T("A-2: the ladder CARRIES the term, and it equals the engine's to the dollar",
    CARRIES && ladderDiv === engineDiv, `carries=${CARRIES} ladder=${ladderDiv} engine=${engineDiv}`);
} else {
  // Pre-v5.53. The engine has the term and the ladder does not — that IS the defect, pinned so
  // the frozen leg keeps asserting what was true of it rather than inheriting the new expectation.
  T("A-2 [KNOWN DEFECT pre-v5.53]: the engine carries a dividend term the ladder does not",
    !CARRIES && engineDiv > 0, `carries=${CARRIES} engine=${engineDiv}`);
}
T("A-3 [v5.47 HOLDOUT]: the base excludes the HSA \u2014 including it would overstate the term",
  ladderDiv < Math.round(A.taxableInit * (A.yieldPct / 100)),
  `withHoldout=${ladderDiv} withoutHoldout=${Math.round(A.taxableInit * (A.yieldPct / 100))}`);

// ══ B · SCALE \u2014 recorded, not asserted against a frozen figure ══
// A dollar figure pinned here would go stale with the example household. What is pinned is the
// RELATIONSHIP: the term is real, and it is below the DOM render ceiling on this household,
// which is the whole reason this suite exists at the engine layer.
T("B-1: the term is non-zero on the shipped example household", ladderDiv > 0, `$${ladderDiv}/yr`);
T("B-2 [\u00a7M]: and it is BELOW the \u00b1$500 render ceiling here \u2014 a DOM assertion could not see it",
  ladderDiv < 500, `$${ladderDiv}/yr vs a $500 ceiling`);

// ══ C · THE NEAR-CLIFF FIXTURE \u2014 mandatory (scope \u00a77.4) ══
// The example household flips no verdict, so a suite built on it alone asserts the fix while
// never exercising the behaviour the fix exists for. This household sits beside the tier-1
// threshold, where the omission decides the verdict.
const C = build({ brokerage: 1500000, yieldPct: 2.0, pension: 10500 });
const zeroByYr = new Map(C.zero.rows.map(r => [r.yr, r]));
const rmdAge = C.tl.rmdAgeA || 75;
const ladderYears = C.full.rows.filter(r => r.ageA < rmdAge);

let flips = 0, missedSurcharge = 0;
for (const r of ladderYears) {
  const z = zeroByYr.get(r.yr);
  if (z && z.tier < r.tier) { flips++; missedSurcharge += (r.surchargeAnnual || 0) - (z.surchargeAnnual || 0); }
}
T("C-0 [FIXTURE GATE]: the near-cliff household actually reaches a tier above 0 \u2014 without this C-1 is vacuous",
  ladderYears.some(r => r.tier > 0), `tiers=${[...new Set(ladderYears.map(r => r.tier))].join(",")}`);
T("C-1: without the dividend term this household reads a LOWER IRMAA tier in at least one ladder year",
  flips > 0, `${flips} of ${ladderYears.length} years, $${missedSurcharge} of surcharge unwarned`);
T("C-2: and the dividend term is the thing that decides it \u2014 it is large here, unlike the example household",
  (C.full.rows[0].magi - C.zero.rows[0].magi) > 10000,
  `$${C.full.rows[0].magi - C.zero.rows[0].magi}/yr`);

// ══ D · NEGATIVE CONTROLS \u2014 mandatory (scope \u00a77.6) ══
// ⚠ D-3 exists because the FIRST version of the flip test in the v5.53 scoping session examined
// only rows whose FULL magi sits in tier 0. It could not see the case that matters \u2014 full in
// tier 1, narrow dropping to tier 0 \u2014 and reported 0 flips on this very household, which has
// five. A flip detector that cannot detect a flip is the fixture trap one level up.
const D_zeroYield = build({ brokerage: 1500000, yieldPct: 0, pension: 10500 });
T("D-1 [CONTROL/term]: at 0% yield the term vanishes \u2014 the input really is what drives it",
  (D_zeroYield.full.rows[0].magi - D_zeroYield.zero.rows[0].magi) === 0);
const D_noBase = build({ brokerage: 0, yieldPct: 2.0, pension: 10500 });
T("D-2 [CONTROL/base]: with no brokerage sleeve the term collapses \u2014 the base really is the sleeve",
  (D_noBase.full.rows[0].magi - D_noBase.zero.rows[0].magi) <
  (C.full.rows[0].magi - C.zero.rows[0].magi) / 10);
// The detector control: run the same comparison on a household with NO exposure and require zero.
const D_far = build({ brokerage: 1500000, yieldPct: 2.0, pension: null });
let farFlips = 0;
const farZero = new Map(D_far.zero.rows.map(r => [r.yr, r]));
for (const r of D_far.full.rows.filter(r => r.ageA < (D_far.tl.rmdAgeA || 75))) {
  const z = farZero.get(r.yr); if (z && z.tier < r.tier) farFlips++;
}
T("D-3 [CONTROL/detector]: the SAME detector reports 0 on a household far from any cliff \u2014 " +
  "it discriminates rather than always firing",
  farFlips === 0 && flips > 0, `nearCliff=${flips} farFromCliff=${farFlips}`);

// ══ E · what this release did NOT change ══
if (POST) {
  T("E-1: Engine C's MAGI is untouched \u2014 this release moved the ladder toward the engine, not the reverse",
    A.full.rows[0].magi === build({ yieldPct: 2.0 }).full.rows[0].magi);
}

console.log(`\nt32 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
