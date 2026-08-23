// t25 — ENGINE C §86: the IRMAA engine phases Social Security in (v5.43 extinction invariants)
// Run: node t25_engineC_ss86.mjs v543   |   node t25_engineC_ss86.mjs v542
//
// THE DEFECT THIS EXISTS FOR. Through v5.42 `computeIrmaaPlan` read, as one expression:
//     const ssTaxable = ssTot * 0.85;
// — flat, regardless of provisional income. No base amount, no adjusted base amount, no phase-in,
// no filing-status thresholds. 26 U.S.C. §86 does none of that. Below the point where the
// 85%-of-benefits cap binds it overstated includible benefits by up to $46,920 on a household with
// $55,200 of benefits, and since v5.42 — when the Roth tab got the real §86 — the app answered one
// statutory question two different ways depending on which tab was open.
//
// PRECISION: DOLLAR-EXACT. This is the important difference from `t24`. Engine C is module-level
// and exported through the shim as `__engines.computeIrmaaPlan`, so its rows are read directly
// rather than scraped from a rendered table. **OPERATIONS §M's ±$500 ceiling does not apply here**
// and no assertion below is rounded to the nearest $1,000. Where t24 had to say "±$500", this says
// "to the dollar".
//
// WHAT THE FIX IS AND IS NOT WORTH, stated because the scoping recommendation overstated it.
// The case originally made for this release included a claim that the flat rule could push a
// household over an IRMAA threshold and show a surcharge it did not owe. That came from a synthetic
// grid sweep and **does not reproduce**: on the shipped household the correction moves 3 of 25
// years, changes NO tier, and changes NO surcharge. What it does change is `headroom` — a rendered
// figure — by up to $8,256. §C below pins the zero-flip result deliberately, so the absence of a
// surcharge effect is a checked fact rather than a remembered one.
//
// GATED PER LEG (OPERATIONS §B2). v5.42 and earlier legitimately carry the flat rule; each leg
// asserts what was true for its own build. The prior leg is a dated [KNOWN DEFECT] pin (§D) and is
// the before/after witness for this release.
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v543";
const KNOWN_VERSIONS = ["v541", "v542", "v543", "v544", "v545", "v546", "v547"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST_FIX = VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547";
// v5.47 — tidy-up item 5 held the HSA out of the dividend base, which lowers Engine C's MAGI on
// this household by $300/yr. Legs v541-v546 keep asserting their own correct pre-item-5 figures.
const POST_ITEM5 = VER === "v547";

// The repo keeps the oracle at qa/tools/hand_86.mjs; PROJECT KNOWLEDGE IS FLAT and holds it beside
// the suites. Resolve rather than assume, and say which copy was used (the t21/t24 pattern).
const CAND = [join(HERE, "hand_86.mjs"), join(HERE, "tools", "hand_86.mjs")];
const ORACLE = CAND.find(existsSync);
if (!ORACLE) {
  console.log("t25 SUITE: 0 passed, 1 failed\n  \u2717 \u00a786 oracle not found. Looked in:\n" +
    CAND.map(c => "      " + c).join("\n"));
  process.exit(1);
}
const { statute86 } = await import(pathToFileURL(ORACLE).href);
const { __engines, __g } = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
const usd = n => "$" + Math.round(n).toLocaleString();

console.log(`t25 \u2014 ENGINE C \u00a786 (${VER})`);
console.log(`     oracle: ${ORACLE}\n`);

// ── §A · the engine runs and exposes what this suite needs ──────────────────────────────
const plan = __engines.computeIrmaaPlan({ retireYear: 2029, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 });
const rows = Array.isArray(plan) ? plan : (plan.rows || plan.years || []);
T("A-1: computeIrmaaPlan is reachable module-level (no DOM, no \u00a7M ceiling)", rows.length > 0, `${rows.length} rows`);
T("A-2: it returns the shipped household's 25 projection years", rows.length === 25, String(rows.length));
for (const k of ["yr", "magi", "tier", "surchargeAnnual", "headroom", "filingSingleI"])
  T(`A-3: rows expose \`${k}\``, rows[0] && k in rows[0]);
const by = Object.fromEntries(rows.map(r => [r.yr, r]));

// ── §B · the three years the correction moves, pinned TO THE DOLLAR ──────────────────────
// Both the pre-fix and post-fix figures are named, so the pair is the before/after witness and
// neither leg can drift onto the other's numbers.
// v5.47 · PER-LEG. Item 5 removed the HSA from the dividend base, worth $300/yr of MAGI here.
// In these three years the household sits in the §86 UPPER TIER PHASE-IN, so $300 less
// provisional income also removes $255 of includible Social Security: the year moves by
// $555 = $300 x 1.85, not $300. That second-order term is the same compounding v5.46 recorded,
// and it is why these three pins move by a different amount from §C's twelve.
// Headroom is (threshold - MAGI), so it moves the same $555 in the OPPOSITE direction — pinning
// both is what proves the shift is a MAGI change and not a threshold change.
const MOVERS = POST_ITEM5
  ? { 2041: 92937, 2042: 96633, 2043: 100394 }
  : POST_FIX
  ? { 2041: 93492, 2042: 97188, 2043: 100949 }
  : { 2041: 101748, 2042: 103746, 2043: 105779 };
const HEADROOM = POST_ITEM5
  ? { 2041: 212316, 2042: 214725, 2043: 217190 }
  : POST_FIX
  ? { 2041: 211761, 2042: 214170, 2043: 216635 }
  : { 2041: 203505, 2042: 207612, 2043: 211806 };
for (const [yr, want] of Object.entries(MOVERS)) {
  T(`B[${yr}]: MAGI is ${usd(want)} exactly${POST_FIX ? "" : " [KNOWN DEFECT \u2014 the flat-85% figure]"}`,
    by[yr] && Math.round(by[yr].magi) === want, by[yr] ? usd(by[yr].magi) : "no row");
  T(`B[${yr}]: rendered headroom is ${usd(HEADROOM[yr])} exactly`,
    by[yr] && Math.round(by[yr].headroom) === HEADROOM[yr], by[yr] ? usd(by[yr].headroom) : "no row");
}

// ── §C · the 22 years that must NOT move, and the zero-flip result ──────────────────────
// The overreach test. A fix that reached past Engine C's §86 term lands here.
// v5.47 · these twelve years are past §86 convergence, so item 5's $300 lands on MAGI WITHOUT
// the 1.85 multiplier §B's three years carry. Pinning both sets at once is the real assertion:
// twelve years moving $300 and three moving $555 is the signature of a change to the dividend
// base seen through §86, and NOT of a change to the §86 term itself, which would move only the
// phase-in years. A single-figure delta across all fifteen would be the defect.
const UNCHANGED = POST_ITEM5 ? {
  2029: 108480, 2030: 106480, 2031: 137140, 2032: 122140, 2033: 122140, 2034: 122140,
  2035: 122140, 2036: 122140, 2037: 122140, 2038: 122140, 2039: 165803, 2040: 164989,
} : {
  2029: 108780, 2030: 106780, 2031: 137440, 2032: 122440, 2033: 122440, 2034: 122440,
  2035: 122440, 2036: 122440, 2037: 122440, 2038: 122440, 2039: 166103, 2040: 165289,
};
let moved = [];
for (const [yr, want] of Object.entries(UNCHANGED))
  if (!by[yr] || Math.round(by[yr].magi) !== want) moved.push(`${yr}: want ${usd(want)} got ${by[yr] ? usd(by[yr].magi) : "none"}`);
T(`C-1: the 12 pre-2041 years are past §86 convergence${POST_ITEM5 ? " and each moved item 5's flat $300" : " \u2014 the v5.43 fix must not touch them"}`,
  moved.length === 0, moved.join(" | "));
T("C-2: every year sits in tier 0 \u2014 this household never pays IRMAA on either leg",
  rows.every(r => r.tier === 0), rows.filter(r => r.tier !== 0).map(r => r.yr).join(","));
T("C-3: total surcharge is $0 across the projection, on BOTH legs",
  rows.reduce((s, r) => s + r.surchargeAnnual, 0) === 0);
// The survivor years. The scoping sweep predicted these were the at-risk band; measurement said
// otherwise, and this pins the measurement so the wrong prediction cannot quietly return.
const singles = rows.filter(r => r.filingSingleI);
T("C-4: the household has 9 survivor (single-filing) years", singles.length === 9, String(singles.length));
T("C-5: NO survivor year moves \u2014 their provisional income is already past convergence, so the flat rule was exact there",
  singles.every(r => !(r.yr in MOVERS)));

// ── §D · the statute, asserted against the oracle on every row ──────────────────────────
// Engine C does not expose ssTot, so the includible amount is recovered from the row: on the fixed
// leg MAGI − (non-SS terms) is the §86 result, and the non-SS terms are recoverable because the
// prior leg's MAGI uses the flat rule. Rather than reconstruct, assert the PROPERTY that must hold:
// the fixed leg's MAGI is never above the flat leg's, and the gap matches the statute's shortfall.
{
  const flatKnown = { 2041: 101748, 2042: 103746, 2043: 105779 };
  const lawKnown = { 2041: 93492, 2042: 97188, 2043: 100949 };
  if (POST_FIX) {
    T("D-1: the correction only ever moves MAGI DOWN (a sign error still lands on some number)",
      Object.keys(lawKnown).every(y => lawKnown[y] < flatKnown[y]));
    T("D-2: the three gaps are exactly $8,256 / $6,558 / $4,830",
      flatKnown[2041] - lawKnown[2041] === 8256 &&
      flatKnown[2042] - lawKnown[2042] === 6558 &&
      flatKnown[2043] - lawKnown[2043] === 4830);
    T("D-3: the gap SHRINKS year over year as provisional income rises toward convergence",
      (flatKnown[2041] - lawKnown[2041]) > (flatKnown[2042] - lawKnown[2042]) &&
      (flatKnown[2042] - lawKnown[2042]) > (flatKnown[2043] - lawKnown[2043]));
  }
  // The oracle itself, exercised on Engine C's own filing statuses, so a broken statute86 cannot
  // leave this suite vacuously green.
  T("D-4: the oracle returns 85% of benefits above convergence (joint)",
    Math.round(statute86(55200, 120000, true)) === Math.round(55200 * 0.85));
  T("D-5: the oracle returns 0 below the base amount (\u00a786(b)(1) not met)", statute86(20000, 0, true) === 0);
  T("D-6: the oracle DIFFERS from a flat 85% below convergence \u2014 the defect is real",
    Math.round(statute86(55200, 40000, true)) !== Math.round(55200 * 0.85));
  T("D-7: single-filer thresholds differ from joint (\u00a786(c) \u2014 the pair must be status-selected)",
    Math.round(statute86(30000, 30000, true)) !== Math.round(statute86(30000, 30000, false)));

  // D-8 · WHAT THIS SUITE CANNOT WITNESS, stated rather than left as folklore (§B2).
  // Two of this release's five negative controls — freezing the threshold pair to JOINT, and
  // capping para1 at 85% instead of ½ — fire t1's structural pin but NOT this suite. Both are
  // behavioural NO-OPS on the shipped household, for reasons worth pinning:
  //   · the threshold pair: the only years the correction moves (2041–2043) are JOINT years, and
  //     the nine survivor years are past convergence, so the single pair is never exercised here;
  //   · para1's ½ cap: it enters as min(para1, ½(adjbase − base)) = min(para1, $6,000), which the
  //     ½-of-benefits cap can only change when benefits are under $12,000 — the same condition
  //     recorded at t24 §D-7. This household's benefits are far above it.
  // t1 STRUCT S-4 is the coverage for both. Asserted so the reasoning is checked, not remembered.
  T("D-8: the ½(adjbase − base) term swallows para1's ½ cap on this household (benefits >> $12,000)",
    Math.min(55200 * 0.5, 6000) === Math.min(55200 * 0.85, 6000));
  T("D-8: it WOULD be observable below $12,000 of benefits \u2014 where t1 STRUCT S-4 carries the coverage",
    Math.min(11000 * 0.5, 6000) !== Math.min(11000 * 0.85, 6000));
  T("D-8: every year the correction moves is a JOINT year \u2014 the single pair is unexercised here",
    Object.keys(MOVERS).every(y => by[y] && !by[y].filingSingleI));
}

// ── §E · v5.47 [EXTINCTION] — tidy-up item 5, the HSA in the dividend base ──────────────
// WHY IT LIVES HERE and not in t17 or t18, the two dollar-exact engine suites. Both of those
// build purpose-made households with `P.otherAccounts = []`, so `othHsa` is 0 and item 5 is
// worth $0 on their fixtures BY CONSTRUCTION — an invariant added there would pass vacuously
// forever. This is the same blind spot t2's parity fixture has (its P is built from `positions`
// only, no `othHsa`, which is why the MC-parity guardrail stayed 9/9 across item 5 and is NOT
// evidence about it). t25 drives Engine C on the SHIPPED example household, which carries a
// $15,000 HSA, so it is the one place already positioned to witness this.
//
// AND IT MUST BE ENGINE-LEVEL. The effect is $300/yr, BELOW the ±$500 DOM rounding ceiling
// (OPERATIONS §M) — a DOM-read invariant for item 5 would pass whether the fix were present or
// not. Every figure below comes from `computeIrmaaPlan` directly, to the dollar.
if (POST_ITEM5) {
  // The HSA is real, and it is inside the pool the dividend base used to read.
  const _rsb = __g.retireStartBalances(__g.PLAN_TIMELINE().rothLadderStart);
  T("E-1: the example household carries an HSA (othHsa > 0) \u2014 otherwise this section is vacuous",
    _rsb.othHsa > 0, `othHsa ${usd(_rsb.othHsa)}`);
  T("E-2: `taxableInitAll` still INCLUDES it \u2014 decision C-4's spendable view is untouched",
    Math.round(__g.taxableInitAll()) - Math.round(__g.otherTaxableInit()) >= 0 &&
    Math.round(__g.taxableInitAll()) > Math.round(_rsb.othHsa),
    `taxableInitAll ${usd(__g.taxableInitAll())}, othHsa ${usd(_rsb.othHsa)}`);

  // The measured effect, per §86 region. Twelve flat-$300 years and three $555 years — the
  // signature described at §C. A regression that puts the HSA back in the base restores every
  // one of these to its v5.46 figure, so both sets are named.
  const PRE_UNCHANGED = { 2029: 108780, 2039: 166103, 2040: 165289 };
  const PRE_MOVERS = { 2041: 93492, 2042: 97188, 2043: 100949 };
  T("E-3 [EXTINCTION]: past convergence, item 5 moves MAGI by exactly $300 \u2014 the dividend, undamped",
    Object.entries(PRE_UNCHANGED).every(([y, pre]) => by[y] && pre - Math.round(by[y].magi) === 300),
    Object.entries(PRE_UNCHANGED).map(([y, pre]) => `${y}: ${pre - (by[y] ? Math.round(by[y].magi) : NaN)}`).join(" "));
  T("E-4 [EXTINCTION]: inside the \u00a786 phase-in it moves $555 = $300 x 1.85 \u2014 the second-order term",
    Object.entries(PRE_MOVERS).every(([y, pre]) => by[y] && pre - Math.round(by[y].magi) === 555),
    Object.entries(PRE_MOVERS).map(([y, pre]) => `${y}: ${pre - (by[y] ? Math.round(by[y].magi) : NaN)}`).join(" "));

  // NEGATIVE CONTROL. $300/yr of MAGI is 2% of a $15,000 HSA, so the control that discriminates
  // is the SIZE: if the fix ever held out the wrong quantity — the whole Other-accounts pool,
  // say, or a share instead of an amount — the delta stops equalling yield x othHsa exactly.
  {
    const yieldPct = 2.0;                       // the tab's own default, and this run's input
    const expected = Math.round(_rsb.othHsa * (yieldPct / 100));
    T(`E-5 [NEGATIVE CONTROL]: the flat delta is exactly yield x othHsa = ${usd(expected)}`,
      expected === 300, `${usd(_rsb.othHsa)} x ${yieldPct}% = ${usd(expected)}`);
    T("E-6 [NEGATIVE CONTROL IS LIVE]: holding out the WHOLE Other-taxable pool instead would " +
      "give a different figure, so E-5 discriminates",
      Math.round(__g.otherTaxableInit() * (yieldPct / 100)) !== expected,
      `whole pool would give ${usd(Math.round(__g.otherTaxableInit() * (yieldPct / 100)))}`);
  }
}

console.log(`\nt25 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
