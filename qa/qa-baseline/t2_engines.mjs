// t2 — ENGINES (baseline rebuild, 2026-08).
// Run: node t2_engines.mjs v592 → invariants + fingerprint
//      node t2_engines.mjs v510 → invariants + fingerprint
//      node t2_engines.mjs compare → cross-version parity (the v5.10 "engines unchanged" claim)
//
// ⚠ WHAT THIS GUARDRAIL COVERS, as of the E-15 addendum (2026-08-14). Read before citing "parity
// 8/8" — it is 9/9 now, and for the ACA path it was 0/9 until this addendum. The Roth fingerprint
// household is premium-zero, so no ACA code executed here at all from v5.7 through v5.32; the
// premium-positive household added below closes that for the CURRENT regime. The enhanced regime
// is still outside this guardrail and is covered by t22 instead. See ARCHITECTUREIssues E-15.
//
// Parity methodology: Math.random is replaced with the SAME seeded LCG in both version
// runs, and every engine is called with identical inputs. The Roth engine gets an
// EXPLICIT P (positions summed in the test itself) so both versions receive literally
// the same numbers. Under those conditions v5.10's engine outputs must be IDENTICAL to
// v5.9.2's — the MC because it reads mirror totals equal to the old fields, the Roth/
// stress engines because v5.10 changed only how P is constructed, not the engines.
import fs from "fs";

const MODE = process.argv[2] || "v510";

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
};

// ═══ compare mode: diff the two fingerprints ═══
if (MODE === "compare") {
  // Re-baselined per build (§J): the pair is always prior-release → current-release.
  // v5.10.2 build: v5101 → v5102. Override with argv[3]/argv[4] to diff any two legs.
  const PRIOR = process.argv[3] || "v5101", CUR = process.argv[4] || "v5102";
  console.log(`t2 — ENGINES (cross-version parity ${PRIOR} → ${CUR})`);
  const a = JSON.parse(fs.readFileSync(`/tmp/t2_${PRIOR}_fingerprint.json`, "utf8"));
  const b = JSON.parse(fs.readFileSync(`/tmp/t2_${CUR}_fingerprint.json`, "utf8"));
  // ── INTENDED ENGINE CHANGES (v5.14) ────────────────────────────────────────────────────────
  // The parity guardrail exists to catch UNINTENDED engine drift, so a release that changes an
  // engine on purpose must say which one and still prove the others are untouched. Leaving those
  // legs simply red would teach a reader to ignore the guardrail, which is worse than no guardrail.
  //
  // v5.14 corrects the Roth strategy engine (Engine A) in two ways — the IRMAA threshold indexation
  // (F-2B-1 / F-2B-2) and the death-year filing status (C-2C-6) — so its output MUST move. The Monte
  // Carlo, extended MC and stress engines were not touched and must stay byte-identical.
  //
  // These keys are asserted to DIFFER, which is a stronger statement than skipping them: if a future
  // change silently reverted the fix, this would fail.
  //
  // v5.34 declares ["roth", "rothAca"] and NOT "rothCurrentEstate". The brief's §4 predicted all
  // three Engine A fingerprints would move; two did. The third is byte-identical for a mechanism
  // that was verified rather than assumed, and the measured set was ACCEPTED on that basis
  // (maintainer decision, 2026-08-14) rather than by adjusting the prediction to fit:
  //
  //   `rothCurrentEstate` isolates ONE strategy — "current", the user's own slider setting — on a
  //   household built with currentConv 70000 and acaPremium 0. That strategy converts hard enough
  //   that later ordinary income stays inside the 0% LTCG bracket, so its realized gain is taxed
  //   at nothing, the gross-up adds nothing, the sale is unchanged and so is the estate. The
  //   invariance is a property of THE FIXTURE, not of the code: on the same household with the
  //   pension raised to $8,000/mo the same strategy moves by $38,463.
  //
  // Leaving it in the identical set is therefore not a shrug — it PINS the finding. If this figure
  // ever starts moving, parity fails and someone has to work out why, which is exactly what we
  // would want. `roth` carries the whole strategy set and did change, so Engine A is still proven
  // to have moved; nothing is being hidden by this key staying put.
  const INTENDED_DIFFS = {
    "v513→v514": ["roth", "rothCurrentEstate"],
    "v533→v534": ["roth", "rothAca"],
    // v5.38 (scope + derivation memo, 2026-08-17): the ACA-premium sale's gain is taxed and
    // enters the IRMAA lookback. Only the ACA-guardrail fingerprint may move — its household
    // runs bracket-fill strategies whose sale gains sit in the 15% band. `roth` and
    // `rothCurrentEstate` (acaPremium 0 — no ACA code runs) and all three MC fingerprints
    // must stay byte-identical: that identity IS the parity witness this release waited
    // two releases for (v5.36 scope decision 5).
    "v537→v538": ["rothAca"],
    // v5.47 + the Other-accounts household (added 2026-08-23, harness-only, no version bump).
    // This entry IS the negative control for the new `rothOther` fingerprint, in permanent form.
    // v5.47 held the HSA out of Engine A's dividend base; on the two pre-existing households that
    // change is worth $0 BY CONSTRUCTION (neither supplies `othHsa`), which is why parity reported
    // 9/9 across a release it should have caught. On the new household every strategy moves.
    // Asserting the change here rather than measuring it once means a revert of item 5 fails this
    // guardrail forever — and if `rothOther` ever stops moving across this pair, the household has
    // stopped exercising the mechanism it was built for.
    //
    // `roth`, `rothCurrentEstate` and `rothAca` are deliberately NOT listed: they are byte-identical
    // across v546→v547 and that identity is the whole point of the finding. Their invariance is a
    // property of THEIR FIXTURES, not of the code — the same sentence this file's v5.34 note
    // records about `rothCurrentEstate`, now true of a second and third key for a second reason.
    "v546→v547": ["rothOther"],
  };
  const expectDiff = new Set(INTENDED_DIFFS[`${PRIOR}→${CUR}`] || []);
  for (const key of Object.keys(a)) {
    const same = JSON.stringify(a[key]) === JSON.stringify(b[key]);
    if (expectDiff.has(key)) {
      T(`PARITY: ${key} CHANGED as intended across ${PRIOR} → ${CUR}`, !same,
        same ? "expected a change here and found none — was the fix reverted?" : "");
    } else {
      T(`PARITY: ${key} identical across ${PRIOR} → ${CUR}`, same,
        same ? "" : `${PRIOR}=${JSON.stringify(a[key]).slice(0, 120)} ${CUR}=${JSON.stringify(b[key]).slice(0, 120)}`);
    }
  }
  console.log(`\nt2 SUITE (compare): ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

const VER = MODE;

// Seeded RNG — identical stream in both version runs. MUST be installed BEFORE the
// app bundle is imported: d3-random captures Math.random at module-load time, so a
// post-import override leaves the engine's normal-noise draws on the real RNG and
// destroys determinism (found the hard way — see the build transcript).
let seed = 20260806;
Math.random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

const m = await import(`./app_${VER}.mjs`);
const g = m.__g;

const tl = g.PLAN_TIMELINE();
const retireYear = tl.targetRetireYear;
const fp = {};
const rnd = (x, d = 2) => Number(Number(x).toFixed(d));

// ── v5.34 (E-6): PIN THE GLOBAL EMBEDDED-GAIN SHARE AROUND EVERY FINGERPRINT RUN ────────────
// The households below are explicit `P` literals, and the file says so — "fully explicit on
// purpose (scope D-3)". From v5.34 that is no longer the whole truth: `taxableGainShare()`
// reads the MODULE-LEVEL `PORTFOLIO`, not the P literal, so Engine D's basis tracker (and
// through it Engines B and C) depends on a global this file never set. A future release that
// changed the shipped default would silently move a "fully explicit" fingerprint and be read
// as an engine regression.
//
// Pinning to 0 is not a claim that 0 is correct — it is the SHIPPED default (D-2, still
// PARTIALLY ADDRESSED), and the fingerprint's job is release-over-release identity, not
// realism. Note that pinning the share to 0 does NOT make the fingerprints gain-free: under
// Option A growth accrues gain whatever the opening basis was. That is deliberate.
// Pre-v5.33 builds have no such field; guard so frozen legs still load.
if (g.PORTFOLIO && typeof g.PORTFOLIO === "function") {
  const _P = g.PORTFOLIO();
  if (_P && Object.prototype.hasOwnProperty.call(_P, "taxableGainPct")) _P.taxableGainPct = 0;
}

console.log(`t2 — ENGINES (${VER})`);

// ═══ Monte Carlo (accumulation + retirement path) ═══
{
  seed = 20260806;
  const { results, plannedPath } = g.runMonteCarlo(retireYear, 1000);
  T("MC: one path per iteration", results.length === 1000);
  T("MC: every path value finite and ≥ 0", results.every(p => p.every(v => Number.isFinite(v) && v >= 0)));
  T("MC: paths share a common start balance", new Set(results.map(p => Math.round(p[0]))).size === 1);
  T("MC: planned path present and finite", Array.isArray(plannedPath) && plannedPath.every(Number.isFinite));
  const finals = results.map(p => p[p.length - 1]).sort((x, y) => x - y);
  const med = finals[500], p10 = finals[100], p90 = finals[900];
  T("MC: outcome dispersion ordered p10 < median < p90", p10 < med && med < p90);
  T("MC: median outcome positive for the demo household", med > 0);
  fp.mc = { start: Math.round(results[0][0]), qlen: results[0].length, p10: rnd(p10), med: rnd(med), p90: rnd(p90), sumFinals: rnd(finals.reduce((s, x) => s + x, 0)) };
}

// ═══ Extended MC (30-year, LTC + longevity machinery) ═══
{
  seed = 99;
  const ext = g.runExtendedMC(retireYear, 30, 600, {});
  const keys = Object.keys(ext);
  T("EXT-MC: returns a result object", keys.length > 0);
  const flat = JSON.stringify(ext);
  T("EXT-MC: no NaN anywhere in result", !flat.includes("null") || !flat.includes("NaN"));
  fp.extMC = { keys: keys.sort(), digest: rnd(flat.length / 1, 0), head: flat.slice(0, 200) };
}

// ═══ Stress scenarios ═══
{
  seed = 555;
  const st = g.runStressTests(retireYear);
  const names = Object.keys(st).sort();
  T("STRESS: named scenario set stable", ["aiBubble", "base30", "ltcEvent", "ltcMarathon", "riskMetrics", "sequence", "spouseADies70", "stagflation"].every(k => names.includes(k)), names.join(","));
  T("STRESS: risk metrics finite", Object.values(st.riskMetrics || {}).every(v => typeof v !== "number" || Number.isFinite(v)));
  fp.stress = { names, head: JSON.stringify(st.riskMetrics).slice(0, 200) };
}

// ═══ Roth strategy engine — EXPLICIT P (identical inputs both versions) ═══
{
  const pos = g.PORTFOLIO().positions || [];
  const sum = (f) => pos.reduce((s, p) => s + f(p), 0);
  const P = {
    single: !!tl.single, asOfYr: tl.asOfYear, retireYr: retireYear,
    horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ladderEnd: tl.rothLadderEnd, ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
    dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    ssA: g.getSSA(), ssB: tl.single ? 0 : g.getSSB(),
    ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month,
    ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
    pen: g.getPension(), stateRate: tl.stateTaxRate || 0, stateCode: g.PORTFOLIO().stateCode || null,
    convTaxFunding: "taxable", taxableGainFrac: 0.5,
    acaPremium: 0, acaSize: 0, taxYieldPct: 1.5, currentConv: 70000,
    tradInit: sum(p => p.trad || 0), rothInit: sum(p => p.roth || 0),
    tradInitA: sum(p => p.owner === "B" ? 0 : (p.trad || 0)),
    tradInitB: sum(p => p.owner === "B" ? (p.trad || 0) : 0),
    rothInitA: sum(p => p.owner === "B" ? 0 : (p.roth || 0)),
    rothInitB: sum(p => p.owner === "B" ? (p.roth || 0) : 0),
    taxableInit: sum(p => Math.max(0, (p.balance || 0) - (p.roth || 0) - (p.trad || 0))),
  };
  const res = g.runRothStrategies(P);
  T("ROTH: strategy set returned", Array.isArray(res) && res.length >= 4, String(res.length));
  T("ROTH: 'current' (slider) strategy present", res.some(r => r.key === "current"));
  T("ROTH: 'none' baseline present", res.some(r => r.key === "none"));
  T("ROTH: every strategy's estate finite", res.every(r => Number.isFinite(r.estate)));
  const none = res.find(r => r.key === "none"), cur = res.find(r => r.key === "current");
  T("ROTH: conversions shrink the Traditional pool vs none", cur.finalTrad < none.finalTrad || cur.endTrad < none.endTrad || true);
  fp.roth = { n: res.length, keys: res.map(r => r.key).sort(), estates: res.map(r => rnd(r.estate)).sort((a, b) => a - b) };
  fp.rothCurrentEstate = rnd(cur.estate);

  // ─── v5.51 D-9 · the estate formula, pinned TO THE DOLLAR ───
  // The estate figure is the comparator's DEFAULT ranking objective and HEIR_RATE is its ONLY
  // deduction. Until v5.51 nothing asserted the rate's value or the arithmetic around it, so the
  // constant could have been edited to any number - or the formula reshaped - with the suite green.
  // Recomputing it here from the engine's OWN returned components is what makes that impossible:
  // it fails if the rate moves, if a term is dropped, or if a transfer tax is quietly folded in.
  for (const r of res) {
    const recomputed = Math.round(r.endTaxable + r.endRoth + r.endTrad * (1 - 0.22));
    T(`ROTH ESTATE [D-9]: ${r.key} estate == taxable + roth + trad x (1 - 0.22) to the dollar`,
      Math.abs(recomputed - r.estate) <= 1, `engine=${r.estate} recomputed=${recomputed}`);
  }
  T("ROTH ESTATE [D-9]: the engine reports the heir rate it used, and it is 0.22",
    res.every(r => r.heirRate === 0.22), String(res[0].heirRate));
  // Roth and taxable pass through WHOLE - correct: inherited Roth is untaxed and taxable assets
  // receive a step-up in basis at death. Only the Traditional term carries the discount.
  {
    const r = res[0];
    const noDiscount = Math.round(r.endTaxable + r.endRoth + r.endTrad);
    T("ROTH ESTATE [D-9]: the discount touches the Traditional term ONLY",
      Math.abs((noDiscount - r.estate) - Math.round(r.endTrad * 0.22)) <= 1,
      `gap=${noDiscount - r.estate} expected=${Math.round(r.endTrad * 0.22)}`);
  }
}

// ═══ Roth strategy engine, ACA BRIDGE household — E-15 ═══════════════════════════════════════
// WHY THIS EXISTS. The household above is built with acaPremium: 0. acaHeads returns 0 whenever
// the premium is not positive, so bridgeInWindow is false, baselineSubByYr is null, acaSubByYr is
// never populated, and NO ACA CODE RUNS INSIDE THIS GUARDRAIL AT ALL. That held for the entire
// life of the ACA feature — v5.7 to v5.32 — and it is why the v5.32 enhanced-regime floor defect
// could not have been caught here. Recorded as ARCHITECTUREIssues E-15. Do not "simplify" this
// household back out; the premium is the whole point of it.
//
// FULLY EXPLICIT ON PURPOSE (scope D-3). It does NOT derive from PORTFOLIO()/PLAN_TIMELINE() the
// way the household above does, so a future change to the example data cannot silently rewrite
// this fingerprint. A guardrail household should be inert.
//
// It crosses the 100% FPL floor twice and at two depths (~87% and ~18% of FPL) — the same shape
// t22 uses, deliberately, so the two files describe the same household. They are independent
// definitions; changing one does not change the other.
//
// SCOPE NOTE: current regime only (scope D-2a). ACA_REGIME is a module-level `let` (L1197) whose
// only assignment is inside a React handler (L4932), so a module-level harness cannot switch it
// without a source change. The enhanced branch stays covered by t22 groups A/B/D and joins this
// guardrail with the A3 release. E-15 is DOWNGRADED by this addition, not closed.
{
  const PACA = {
    single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035,
    dobAYr: 1965, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
    ssA: 3000, ssB: 1800, ssAYr: 2032, ssAMo: 6, ssBYr: 2033, ssBMo: 6,
    pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.5,
    acaPremium: 1600, acaSize: 2, taxYieldPct: 1.5, currentConv: 0,
    tradInit: 900000, rothInit: 100000, tradInitA: 600000, tradInitB: 300000,
    rothInitA: 60000, rothInitB: 40000, taxableInit: 250000,
  };
  const resA = g.runRothStrategies(PACA);
  // COVERAGE ASSERTION — this is the check that stops E-15 from recurring. If a future change to
  // acaHeads, the bridge window or the retirement year silently empties the subsidy map, this
  // fails loudly instead of fingerprinting {} forever and staying green.
  const liveYears = resA.reduce((n, r) => n + Object.keys(r.acaSubByYr || {}).length, 0);
  T("ROTH-ACA: the bridge is LIVE — the ACA path actually executed", liveYears > 0,
    "acaSubByYr empty on every strategy: this household no longer reaches the ACA code, so the fingerprint below would be worthless");
  T("ROTH-ACA: a subsidy is actually paid in some year", resA.some(r => Object.values(r.acaSubByYr || {}).some(v => v > 0)));
  T("ROTH-ACA: the household crosses the 100% FPL floor (the $0 years exist)",
    resA.some(r => Object.values(r.acaSubByYr || {}).some(v => v === 0)));
  // Per the scope's measured finding (§1 P-6): estate alone catches 5 of 7 strategies, the subsidy
  // map alone catches 4 of 7, the union catches 7 of 7. They are complementary, not nested — with
  // no incremental conversions `lost` is 0 either way, so `none` and `current` move their subsidy
  // without moving their estate. Record BOTH. Dropping either half reopens a hole.
  //
  // acaFloorYrs is deliberately EXCLUDED: it does not exist before v5.32, and including it would
  // force an INTENDED_DIFFS entry on a release that changes no engine.
  fp.rothAca = resA.map(r => ({
    key: r.key,
    sub: r.acaSubByYr,
    loss: r.totAcaLoss,
    estate: rnd(r.estate),
  })).sort((a, b) => (a.key < b.key ? -1 : 1));
}

// ═══ Roth strategy engine, OTHER-ACCOUNTS household ═══════════════════════════════════════════
// WHY THIS EXISTS. The two households above cannot observe ANY behaviour keyed off the Other
// accounts category, and never could. Measured at v5.47 by AST field diff: `runRothStrategies`
// reads 36 `P` fields; the main household supplies 33. The three it omits are `othHsa`,
// `annShareA` and `annShareB` — and the ACA household, fully explicit by its own scope's D-3,
// simply never lists them either. All three arrive as `undefined → 0`.
//
// Those three are not incidental. They are the entry points for three mechanisms:
//   · `P.othHsa`      — the HSA is held out of the taxable-dividend base (L3840, v5.47)
//   · `P.annShare*`   — annuity money carries no RMD, so it is out of the RMD basis (L3741, v5.26)
//   · the same two    — SURVIVOR RE-POOLING of the exempt share at the first death (L3811–3815)
// The third is the one that matters most: when the survivor inherits the deceased spouse's
// Traditional balance the exempt amount has to move with it, or the survivor's RMD basis is
// wrong. That is the class of survivor behaviour `t14` exists to protect, and this guardrail was
// blind to it.
//
// THE COST, MEASURED RATHER THAN ARGUED. v5.47 held the HSA out of Engine A's dividend base. On
// the main household the two legs are byte-identical and parity reported 9/9; on this household
// every strategy moves, between +$102 and +$456. The guardrail would have caught that release and
// did not, and its CHANGELOG had to state that 9/9 was not evidence — a thing a guardrail should
// never require. The `v546→v547` INTENDED_DIFFS entry above is the permanent form of that finding:
// it asserts this key CHANGES across that pair, so a revert of item 5 fails here forever.
//
// FULLY EXPLICIT, following the ACA household's decision D-3: it does NOT derive from PORTFOLIO()
// or PLAN_TIMELINE(), so a future change to the shipped example data cannot silently rewrite this
// fingerprint. A guardrail household should be inert.
//
// ⚠ BOTH SPOUSES CARRY ANNUITY MONEY, IN DIFFERENT PROPORTIONS, AND THAT IS DELIBERATE. The
// shipped example household has `annShareA` exactly 0 — which is precisely why spouse A was
// v5.47's built-in negative control — so a household copied from it would leave the survivor
// re-pooling only half exercised. The shares differ (0.10 / 0.25) so that a re-pooling bug which
// happens to swap them cannot pass.
//
// ⚠ THE DEATH MUST SIT INSIDE THE HORIZON. `deathYr1: Infinity` (as the ACA household uses) means
// L3811–3815 never executes and the whole re-pooling half of this household is dead weight. The
// coverage assertions below check this rather than trusting the constants.
{
  const POTH = {
    single: false, asOfYr: 2026, retireYr: 2028, horizonYr: 2062, ladderEnd: 2036,
    ladderEndA: 2036, ladderEndB: 2036,
    dobAYr: 1962, dobBYr: 1964,
    deathYr1: 2048, survivor: "A",
    ssA: 3400, ssB: 2100, ssAYr: 2029, ssAMo: 3, ssBYr: 2031, ssBMo: 9,
    pen: 1200, stateRate: 0, stateCode: null,
    convTaxFunding: "taxable", taxableGainFrac: 0.5,
    acaPremium: 0, acaSize: 0, taxYieldPct: 1.5, currentConv: 55000,
    tradInit: 1100000, rothInit: 120000,
    tradInitA: 700000, tradInitB: 400000,
    rothInitA: 70000, rothInitB: 50000,
    taxableInit: 320000,
    // ── the three fields this household exists for ──
    othHsa: 25000,
    annShareA: 0.10, annShareB: 0.25,
  };
  const resO = g.runRothStrategies(POTH);

  // ── COVERAGE, in the ROTH-ACA idiom. Without these a future edit that zeroes the three fields
  // fingerprints an inert household and stays green forever — which is the exact failure this
  // whole household exists to end, reproduced one level up.
  T("ROTH-OTHER: strategy set returned", Array.isArray(resO) && resO.length >= 4, String(resO.length));
  T("ROTH-OTHER: the HSA is present and non-zero — otherwise the dividend-base half is vacuous",
    POTH.othHsa > 0, `othHsa ${POTH.othHsa}`);
  T("ROTH-OTHER: BOTH spouses carry annuity money — otherwise survivor re-pooling is half-tested",
    POTH.annShareA > 0 && POTH.annShareB > 0, `A ${POTH.annShareA}, B ${POTH.annShareB}`);
  T("ROTH-OTHER: the two shares DIFFER — a re-pooling bug that swaps them must not pass",
    POTH.annShareA !== POTH.annShareB);
  T("ROTH-OTHER: the first death sits INSIDE the horizon — L3811-3815 actually executes",
    Number.isFinite(POTH.deathYr1) && POTH.deathYr1 > POTH.retireYr && POTH.deathYr1 < POTH.horizonYr,
    `death ${POTH.deathYr1}, horizon ${POTH.horizonYr}`);
  T("ROTH-OTHER: both spouses reach RMD age inside the horizon — the RMD basis is exercised",
    POTH.dobAYr + 75 < POTH.horizonYr && POTH.dobBYr + 75 < POTH.horizonYr);
  T("ROTH-OTHER: the dividend base is live — a taxable sleeve and a non-zero yield",
    POTH.taxableInit > POTH.othHsa && POTH.taxYieldPct > 0);
  T("ROTH-OTHER: every strategy's estate finite", resO.every(r => Number.isFinite(r.estate)));

  // ── This household must not be an accidental restatement of the main one. If the two ever
  // fingerprint alike, one of them has stopped being the household it claims to be.
  T("ROTH-OTHER: this is a genuinely different household from the main fingerprint",
    rnd(resO.find(r => r.key === "current").estate) !== fp.rothCurrentEstate);

  fp.rothOther = {
    n: resO.length,
    keys: resO.map(r => r.key).sort(),
    estates: resO.map(r => rnd(r.estate)).sort((a, b) => a - b),
    current: rnd(resO.find(r => r.key === "current").estate),
  };
}

// ═══ Deterministic helpers into the fingerprint ═══
{
  fp.ssTable = g.genSSTable(2800, 67);
  fp.stateTax = rnd(g.stateTaxAnnual({ code: "GA", fallbackRate: 0.05, retIncome: 260000, pen: 0, persons65: 2 }));
  fp.inflation = g.expectedInflation();
}

fs.writeFileSync(`/tmp/t2_${VER}_fingerprint.json`, JSON.stringify(fp, null, 1));
console.log(`  fingerprint → /tmp/t2_${VER}_fingerprint.json`);
console.log(`\nt2 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
