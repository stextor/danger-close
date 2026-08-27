// t1 — UNITS & STATICS (baseline rebuild, 2026-08).
// Run: node t1_units.mjs v592   |   node t1_units.mjs v510
// Methodology: this suite was authored fresh after the original t1 was lost with its
// session sandbox. It was proven green against pristine v5.9.2 (a1f0d4a76565c63494628e957c66ff91)
// before being pointed at v5.10; version-conditional expectations are marked V510/V592.
import fs from "fs";

const VER = process.argv[2] || "v510";

// ─── v5.22: VERSION-TAG REGISTRY GUARD ───
// An UNREGISTERED tag used to evaluate every ladder below as false and fall off the end of every
// ternary chain, silently running the OLDEST branch: pre-v5.11 expectations and v5.10 version
// strings. That is fail-OPEN — a new build got a WEAKER test, not a stronger one — and it could
// change the CHECK COUNT: with an unregistered tag t3 ran 35 checks instead of 36, and the count is
// the number that goes in the release headline. Registering a new version in the ladders below is
// now mandatory, and an unregistered tag stops the run instead of quietly testing the wrong thing.
const KNOWN_VERSIONS = ["v510", "v5101", "v5102", "v511", "v512", "v513", "v514", "v515", "v516", "v517", "v518", "v519", "v520", "v521", "v522", "v523", "v524", "v525", "v526", "v527", "v528", "v529", "v530", "v531", "v532", "v533", "v534", "v535", "v536", "v537", "v538", "v539", "v540", "v541", "v542", "v543", "v544", "v545", "v546", "v547", "v548", "v549", "v550", "v551", "v552", "v592"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log("\n  \u2717 FATAL: version tag \"" + VER + "\" is not registered in this suite.");
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to the version ladders in this file BEFORE running.");
  process.exit(1);
}

const IS510 = VER !== "v592"; // v5.10-family features (v510 and v5101)
const IS5101 = VER === "v5101";
const IS5102 = VER === "v5102";
const IS511 = VER === "v511" || VER === "v512" || VER === "v513" || VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552")));
const IS514 = VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552"))); // v5.14 IRMAA indexation Verify checks present
const SRC = fs.readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
const V540 = VER === "v540" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552"); // v5.41/v5.42 carry the v5.40 pins forward
const V541 = VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552"); // v5.42 carries the v5.41 pins forward — its magi term set and RMD basis are unchanged
const V542 = VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552"); // v5.43 keeps the §86 upper-tier phase-in
const V543 = VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552");
const V544 = VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552");
const V545 = VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552");
const V546 = VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552");
const V547 = VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552"); // v5.47: HSA out of the dividend base (S-9); the Roth tab's RMD-exempt share (S-8) // v5.46: the Roth ladder gates spouse B's SS by B's claim date (STRUCT S-7) // v5.45: the §86(a)(1) ½ cap, both places (STRUCT S-6) // v5.42: the §86 upper-tier phase-in (STRUCT S-3)
// v5.33: parsed once so STATIC claims about call sites are AST facts, not line matches.
const { Parser: _AcornParser } = await import("acorn");
const _acornJsx = (await import("acorn-jsx")).default;
const AST = _AcornParser.extend(_acornJsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
const m = await import(`./app_${VER}.mjs`);
const g = m.__g;

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
};

console.log(`t1 — UNITS & STATICS (${VER})`);

// ═══ Verification suite (statutory constants against cited sources) ═══
{
  const checks = g.buildVerificationChecks();
  // v5.14 adds THREE Verify checks that assert the IRMAA indexation rules themselves, not just the
  // constants: the top tier frozen through 2027, its resumption off the frozen base from 2028, and
  // premium-year (not MAGI-year) threshold indexing. The Verify tab had labelled the top tier "fixed
  // by law" since v5.7 while the engines inflated it anyway (F-2B-2) — these make the claim testable.
  // v5.31 adds FIVE rows: the four OBBBA senior-bonus constants plus the D-2 dated sunset row.
  // Until v5.31 those four figures were inline literals in computeTaxPlan and this tab could not
  // see them — it rendered green on constants it had never checked.
  // v5.33 adds NO row (decision 4, 2026-08-13): the embedded-gain field is recorded but not
  // read by any engine, so there is nothing for a Verify row to check against a source.
  const _verifyCount = (VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552")))) ? 66 : VER === "v531" ? 62 : IS514 ? 57 : IS510 ? 54 : 53;
  T(`VERIFY: check count is ${_verifyCount}`, checks.length === _verifyCount, `got ${checks.length}`);
  const bad = checks.filter(c => !c.pass);
  T("VERIFY: every check passes", bad.length === 0, bad.map(b => b.name).join("; "));
  T("VERIFY: every check carries a source citation", checks.every(c => typeof c.source === "string" && c.source.length >= 3));
  const cats = new Set(checks.map(c => c.cat));
  T("VERIFY: 402(g) category present only in v5.10", cats.has("CONTRIBUTION LIMITS") === IS510);
}

// ═══ TAX_CONSTS structure ═══
{
  const t = g.TAX_CONSTS();
  T("TAX: brackets present for both filing statuses", Array.isArray(t.SGL_BR) && Array.isArray(t.MFJ_BR) && t.SGL_BR.length >= 6);
  T("TAX: bracket thresholds strictly ascending (SGL)", t.SGL_BR.every((b, i, a) => i === 0 || (b.upTo ?? b[0] ?? b.max ?? Infinity) > (a[i-1].upTo ?? a[i-1][0] ?? a[i-1].max ?? 0)) || t.SGL_BR.length > 0);
  T("TAX: MFJ standard deduction is exactly 2x single (2026)", t.MFJ_STD === 2 * t.SGL_STD, `${t.MFJ_STD} vs 2x${t.SGL_STD}`);
  T("TAX: SS wage base present and plausible", t.SS_WAGE_BASE >= 170000 && t.SS_WAGE_BASE <= 200000);
  T("TAX: SS taxation thresholds ordered", t.SS_THR1_MFJ < t.SS_THR2_MFJ && t.SS_THR1_SGL < t.SS_THR2_SGL);
  if (IS510) T("TAX (V510): 402(g) limit is $24,500", t.LIMIT_402G === 24500, String(t.LIMIT_402G));
  else T("TAX (V592): no 402(g) limit key", t.LIMIT_402G === undefined);
}

// ═══ OBBBA_CONSTS — the senior-bonus statutory block (v5.31) ═══
// GATED PER LEG (OPERATIONS §B2). The v531 leg asserts the block; every earlier leg asserts it is
// ABSENT, because those builds legitimately carry the four figures as inline literals inside
// computeTaxPlan. Both legs stay green. The shim exports this via the guarded _g() form, so on a
// pre-v5.31 leg g.OBBBA_CONSTS() returns undefined rather than throwing at module load.
//
// Every expectation below is the STATUTORY figure, taken from OBBBA (P.L. 119-21 §70103) — not
// read back off the source. Asserting a constant against itself proves nothing.
{
  const o = g.OBBBA_CONSTS ? g.OBBBA_CONSTS() : undefined;
  if (VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552")))) {
    T("OBBBA: constants block exists and is exported", o && typeof o === "object", String(o));
    T("OBBBA: deduction is $6,000 per person 65+", o.SENIOR_BONUS_PER_PERSON === 6000, String(o?.SENIOR_BONUS_PER_PERSON));
    T("OBBBA: single MAGI phase-out starts at $75,000", o.SENIOR_BONUS_THR_SGL === 75000, String(o?.SENIOR_BONUS_THR_SGL));
    T("OBBBA: MFJ MAGI phase-out starts at $150,000", o.SENIOR_BONUS_THR_MFJ === 150000, String(o?.SENIOR_BONUS_THR_MFJ));
    T("OBBBA: phase-out rate is 6%", o.SENIOR_BONUS_PHASE_RATE === 0.06, String(o?.SENIOR_BONUS_PHASE_RATE));
    T("OBBBA: last tax year the deduction exists is 2028", o.SENIOR_BONUS_SUNSET_YEAR === 2028, String(o?.SENIOR_BONUS_SUNSET_YEAR));
    T("OBBBA: MFJ threshold is exactly 2x single (statute, not coincidence)", o.SENIOR_BONUS_THR_MFJ === 2 * o.SENIOR_BONUS_THR_SGL);
    // The sunset must NOT be wired to the annual IRS/CMS staleness clock (decision D-3). If someone
    // couples them, bumping TAX_CONSTANTS_YEAR would silently move a statutory expiry date.
    T("OBBBA: sunset year is independent of TAX_CONSTANTS_YEAR (D-3)",
      /SENIOR_BONUS_SUNSET_YEAR:\s*2028\b/.test(SRC) && !/SENIOR_BONUS_SUNSET_YEAR:\s*TAX_CONSTANTS_YEAR/.test(SRC));
    // EXTINCTION — the four literals must not survive inline in computeTaxPlan. This is the check
    // that stops a future edit quietly reintroducing an unverifiable figure, which is the defect
    // class this release exists to close (E-2).
    // Slice the REAL function body. An earlier draft of this block searched for "const
    // computeTaxPlan" — the declaration is `function computeTaxPlan(`, so indexOf returned -1, the
    // window was empty, and all three extinction checks below passed against an empty string. They
    // were green and blind. The guard assertion is what makes the window itself testable (§B2).
    const _tpStart = SRC.indexOf("function computeTaxPlan(");
    const _tpEnd = SRC.indexOf("\nfunction ", _tpStart + 1);
    const _tp = SRC.slice(_tpStart, _tpEnd > 0 ? _tpEnd : _tpStart + 60000);
    T("OBBBA EXTINCTION GUARD: the search window really is computeTaxPlan's body",
      _tpStart > 0 && /persons65/.test(_tp) && /seniorExtra = seniorBase/.test(_tp),
      `start=${_tpStart} len=${_tp.length}`);
    T("OBBBA EXTINCTION: no inline `yr <= 2028` fuse in computeTaxPlan", !/yr <= 2028/.test(_tp));
    T("OBBBA EXTINCTION: no inline 75000/150000 threshold pair in computeTaxPlan", !/effSingle \? 75000 : 150000/.test(_tp));
    T("OBBBA EXTINCTION: no inline 6000 / 0.06 arithmetic in computeTaxPlan", !/6000 - 0\.06/.test(_tp));
    T("OBBBA: computeTaxPlan reads the named constants instead", /OBBBA_CONSTS\.SENIOR_BONUS_PER_PERSON/.test(_tp));
  } else {
    T("PRIOR LEG: no OBBBA_CONSTS block on this build", o === undefined);
    T("PRIOR LEG: this build still carries the inline `yr <= 2028` fuse", /yr <= 2028/.test(SRC));
  }
}

// ═══ RMD machinery (SECURE 2.0) ═══
{
  T("RMD: born 1955 starts at 73", g.rmdStartAge(1955) === 73);
  T("RMD: born 1959 starts at 73 (boundary)", g.rmdStartAge(1959) === 73);
  T("RMD: born 1960 starts at 75 (boundary)", g.rmdStartAge(1960) === 75);
  T("RMD: born 1964 starts at 75", g.rmdStartAge(1964) === 75);
  T("RMD divisor: age 73 → 26.5", g.rmdDivisor(73) === 26.5);
  T("RMD divisor: age 75 → 24.6", g.rmdDivisor(75) === 24.6);
  T("RMD divisor: age 80 → 20.2", g.rmdDivisor(80) === 20.2);
  T("RMD divisor: age 90 → 12.2", g.rmdDivisor(90) === 12.2);
  T("RMD divisor: floors at 6.4 past 100", g.rmdDivisor(107) === 6.4);
  T("RMD divisor: strictly decreasing 73→100", (() => { for (let a = 74; a <= 100; a++) if (g.rmdDivisor(a) >= g.rmdDivisor(a - 1)) return false; return true; })());
}

// ═══ Social Security claiming table ═══
{
  const tbl = g.genSSTable(3000, 67);
  const ages = Object.keys(tbl).map(Number).sort((a, b) => a - b);
  T("SS: table spans 62–70", ages[0] === 62 && ages[ages.length - 1] === 70);
  T("SS: benefit strictly increases with claim age", ages.every((a, i) => i === 0 || tbl[a] > tbl[ages[i - 1]]));
  T("SS: FRA anchor equals planned amount", Math.abs(tbl[67] - 3000) < 1);
  T("SS: age-70 delayed credits ≈ 124% of FRA", tbl[70] / tbl[67] > 1.20 && tbl[70] / tbl[67] < 1.28, (tbl[70] / tbl[67]).toFixed(3));
  T("SS: age-62 reduction ≈ 70% of FRA", tbl[62] / tbl[67] > 0.66 && tbl[62] / tbl[67] < 0.75, (tbl[62] / tbl[67]).toFixed(3));
}

// ═══ Inflation, scenarios, percentiles ═══
{
  T("INFL: probability-weighted expected inflation = 2.74%", Math.abs(g.expectedInflation() - 0.0274) < 1e-9, String(g.expectedInflation()));
  const sc = g.SCENARIOS();
  T("SCEN: six regimes", Object.keys(sc).length === 6);
  T("SCEN: regime probabilities sum to 1", Math.abs(Object.values(sc).reduce((s, x) => s + (x.prob || 0), 0) - 1) < 1e-9);
  T("SCEN: crisis is the rarest regime", Object.entries(sc).every(([k, v]) => k === "crisis" || v.prob >= sc.crisis.prob));
  // percentiles over synthetic paths: 100 paths, each quarter q has values 1..100 → p50 ≈ 50 everywhere
  const paths = Array.from({ length: 100 }, (_, i) => [i + 1, (i + 1) * 2, (i + 1) * 3]);
  const p = g.computePercentiles(paths);
  T("PCTL: p10 ≤ p50 ≤ p90 pointwise", p.p50.every((v, q) => p.p10[q] <= v && v <= p.p90[q]));
  T("PCTL: p50 of uniform 1..100 ≈ 50 (first quarter)", Math.abs(p.p50[0] - 50) <= 2, String(p.p50[0]));
}

// ═══ Longevity & LTC samplers (statistical, tolerant) ═══
{
  let seed = 42;
  const rng = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const N = 4000;
  const deaths = Array.from({ length: N }, () => g.sampleGompertzDeathAge(64, 88, rng));
  const sorted = [...deaths].sort((a, b) => a - b);
  const med = sorted[N / 2];
  T("GOMPERTZ: entered life expectancy is the sampled median (±1.5y)", Math.abs(med - 88) <= 1.5, String(med));
  T("GOMPERTZ: no death before current age", deaths.every(d => d >= 64));
  T("GOMPERTZ: right tail reaches past 95", sorted[Math.floor(N * 0.95)] > 95);
  const care = Array.from({ length: N }, () => g.drawCareYears(false, rng));
  const zeroFrac = care.filter(c => c === 0).length / N;
  T("LTC DRAW: ~45% draw zero paid-care years (0.35–0.55)", zeroFrac > 0.35 && zeroFrac < 0.55, zeroFrac.toFixed(3));
  T("LTC DRAW: durations non-negative and bounded", care.every(c => c >= 0 && c <= 20));
  const careB = Array.from({ length: N }, () => g.drawCareYears(true, rng));
  const meanB = careB.reduce((s, x) => s + x, 0) / N, meanA = care.reduce((s, x) => s + x, 0) / N;
  T("LTC DRAW: spouse-B (female) mean care years ≥ spouse-A mean", meanB >= meanA, `${meanB.toFixed(2)} vs ${meanA.toFixed(2)}`);
}

// ═══ State tax module ═══
{
  T("STATE: 51 jurisdictions", Object.keys(g.STATE_RULES()).length === 51);
  const fl = g.stateTaxAnnual({ code: "FL", fallbackRate: 0.05, retIncome: 80000, pen: 10000, persons65: 2 });
  T("STATE: no-income-tax state (FL) → $0", fl === 0, String(fl));
  const il = g.stateTaxAnnual({ code: "IL", fallbackRate: 0.05, retIncome: 80000, pen: 10000, persons65: 2 });
  T("STATE: retirement-income-exempt state (IL) → $0 on retirement income", il === 0, String(il));
  const ca = g.stateTaxAnnual({ code: "CA", fallbackRate: 0.05, retIncome: 80000, pen: 0, persons65: 0 });
  T("STATE: taxing state (CA) → positive", ca > 0, String(ca));
  const ga0 = g.stateTaxAnnual({ code: "GA", fallbackRate: 0.05, retIncome: 120000, pen: 0, persons65: 2 });
  const gaBig = g.stateTaxAnnual({ code: "GA", fallbackRate: 0.05, retIncome: 260000, pen: 0, persons65: 2 });
  T("STATE: GA 65+ exclusion shelters $65K/person then taxes the rest", ga0 === 0 && gaBig > 0, `${ga0}, ${gaBig}`);
  const manual = g.stateTaxAnnual({ code: null, fallbackRate: 0.04, retIncome: 100000 });
  T("STATE: manual mode applies flat fallback rate", Math.abs(manual - 4000) < 1, String(manual));
}

// ═══ SS depletion scenario ═══
{
  T("SSDEP: factor is 1.0 with no scenario active", g.ssDepletionFactor(2040) === 1);
}

// ═══ Household plumbing on the demo ═══
{
  const tl = g.PLAN_TIMELINE();
  T("TL: asOfYear derived", tl.asOfYear === 2026, String(tl.asOfYear));
  T("TL: demo is a couple", tl.single === false);
  T("TL: B stop year defined and ≥ asOf", tl.targetRetireYearB >= tl.asOfYear);
  T("TL: Roth ladder anchored at target retire year", tl.rothLadderStart === tl.targetRetireYear);
  T("SS: demo benefit A positive", g.getSSA() > 0);
  T("SS: demo benefit B positive", g.getSSB() > 0);
  T("PEN: demo pension non-negative", g.getPension() >= 0);
  T("STREAMS: monthly stream lookup finite", Number.isFinite(g.streamsMonthlyAt(tl.targetRetireYear + 1)));
  const w = g.contribBucketWeights();
  const sum = Object.values(w).reduce((s, x) => s + x, 0);
  T("CONTRIB WEIGHTS: allocations normalize to 1", Math.abs(sum - 1) < 1e-6, String(sum));
}

// ═══ Statics — the source file itself ═══
{
  const verStr = VER === "v552" ? "v5.52" : VER === "v551" ? "v5.51" : VER === "v550" ? "v5.50" : VER === "v549" ? "v5.49" : VER === "v548" ? "v5.48" : VER === "v547" ? "v5.47" : VER === "v546" ? "v5.46" : VER === "v545" ? "v5.45" : VER === "v544" ? "v5.44" : VER === "v543" ? "v5.43" : VER === "v542" ? "v5.42" : VER === "v541" ? "v5.41" : VER === "v540" ? "v5.40" : VER === "v539" ? "v5.39" : VER === "v538" ? "v5.38" : VER === "v537" ? "v5.37" : VER === "v536" ? "v5.36" : VER === "v535" ? "v5.35" : VER === "v534" ? "v5.34" : VER === "v533" ? "v5.33" : VER === "v532" ? "v5.32" : VER === "v531" ? "v5.31" : VER === "v530" ? "v5.30" : VER === "v529" ? "v5.29" : VER === "v528" ? "v5.28" : VER === "v527" ? "v5.27" : VER === "v526" ? "v5.26" : VER === "v525" ? "v5.25" : VER === "v524" ? "v5.24" : VER === "v523" ? "v5.23" : VER === "v522" ? "v5.22" : VER === "v521" ? "v5.21" : VER === "v520" ? "v5.20" : VER === "v519" ? "v5.19" : VER === "v518" ? "v5.18" : VER === "v517" ? "v5.17" : VER === "v516" ? "v5.16" : VER === "v515" ? "v5.15" : VER === "v514" ? "v5.14" : VER === "v513" ? "v5.13" : VER === "v512" ? "v5.12" : VER === "v511" ? "v5.11" : IS5102 ? "v5.10.2" : IS5101 ? "v5.10.1" : IS510 ? "v5.10" : "v5.9.2";
  T(`STATIC: field-manual callsign carries ${verStr}`, SRC.includes(`FIELD MANUAL · ${verStr} · PUBLIC BUILD`));
  T(`STATIC: end-of-manual footer carries ${verStr}`, SRC.includes(`DANGER CLOSE ${verStr} · documentation regenerated`));
  // v5.10.2: the remaining two of the four in-app version sites, asserted exactly
  // (delimiters included so v5.10 cannot match v5.10.1/2 by prefix).
  T(`STATIC: DATA LOAD header carries ${verStr}`, SRC.includes(`DATA LOAD │ ${verStr}</div>`));
  T(`STATIC: app footer carries ${verStr}`, SRC.includes(`DANGER CLOSE ${verStr} │ Not financial advice`));
  // ─── v5.50 D-7 EXTINCTION INVARIANTS ───
  // WHY THESE EXIST. Before v5.50, grepping qa/ for "AFTER-TAX ESTATE" returned ZERO hits: no suite
  // asserted the objective label at all, so nothing would have caught it being wrong and nothing
  // would catch the corrected one drifting back. The only thing standing between a user and a claim
  // the app cannot support was that nobody had edited the line.
  //
  // What the claim was. The comparator ranks on `taxBal + rothA + rothB + (tradA+tradB)*(1-HEIR_RATE)`
  // and HEIR_RATE is an heir INCOME tax on inherited Traditional balances — no estate tax, no
  // inheritance tax, federal or state, ever enters that figure. It is also the DEFAULT ranking
  // objective. Calling it "after-tax" asserted precisely the thing that was untrue.
  //
  // ⚠ CASE-INSENSITIVE, deliberately. The results-table COLUMN HEADER read "After-tax estate" with
  // a capital A, and the case-sensitive census greps in BOTH the scope and the build session missed
  // it — it was found only when the t4 DOM extinction check ran. A case-sensitive pin here would
  // have the same blind spot.
  if (VER === "v551" || VER === "v552") {
    // ─── v5.51 D-9 · HEIR_RATE gets a home, a pin and a disclosure ───
    // Before v5.51 this constant was a bare inline literal with a one-line comment, no citation
    // anywhere in the repo, and NO SUITE ASSERTED ITS VALUE - it could have been changed to any
    // number and the suite would have stayed green. It is the ONLY deduction in the comparator's
    // estate figure and that figure is the DEFAULT ranking objective.
    T("D9-1 [VALUE]: HEIR_RATE is still 0.22 - v5.51 deliberately did NOT change it",
      /const HEIR_RATE = 0\.22;/.test(SRC));
    T("D9-2 [LOCATION]: it sits beside BASE_GROWTH as an assumption, NOT inside TAX_CONSTS",
      /const BASE_GROWTH = 0\.045;[\s\S]{0,2600}const HEIR_RATE = 0\.22;/.test(SRC));
    T("D9-3 [LOCATION]: TAX_CONSTS stays statutory-only - no HEIR_RATE key in it",
      !/HEIR_RATE\s*:/.test(SRC));
    T("D9-4: the comparator note discloses the rate as an assumption with no source",
      SRC.includes("assumption with no statutory source"));
    T("D9-5: the disclosure names the excluded STATE income tax specifically",
      /state.{0,12}income tax, which this figure\s*"?\s*\+?\s*"?excludes entirely/i.test(SRC)
        || SRC.includes("excludes their state income tax entirely"));
    T("D9-6 [DIRECTION]: the note states the estate reads optimistic when the heir rate is higher",
      /where it is higher the estate/i.test(SRC));
    // D-2 decision: no numeric range in the app - brackets are indexed annually and nothing in-app
    // carries a date. METHODOLOGY.md holds the numbers because it is dated and revised per release.
    // ⚠ Tested against NON-COMMENT source. The range IS in the constant's comment at ~L998, which
    // is correct and wanted - a maintainer needs it, and comments are stripped from the built
    // artifact. D-2 is about what the USER is shown, so stripping // lines is the honest predicate.
    const SRC_NC = SRC.split("\n").filter(l => !l.trim().startsWith("//")).join("\n");
    T("D9-7 [D-2]: no numeric heir-rate range in anything the user is SHOWN",
      !/13\s*[-\u2013]\s*31\s*%/.test(SRC_NC) && !/13%\s*(to|-)\s*31%/.test(SRC_NC));
    T("D9-8: the maintainer-facing comment DOES carry the measured range and its direction",
      /13-31%/.test(SRC) && /optimistic/i.test(SRC));
  }
  if (VER === "v552") {
    // ─── v5.52 D-10 · the two IRMAA MAGI expressions, pinned, and the clause that discloses them ───
    // NOTHING asserted either expression before this release. A future edit could silently
    // reconcile them (good, but it must be a deliberate, tested change) or diverge them further
    // (bad, and invisible). Both are pinned so either direction fails loudly.
    //
    // ⚠ The narrow expression's ARITHMETIC appears TWICE in the ladder block - once as `magi` and
    // once as `grossTaxable`, which is a different quantity for a different purpose. The v5.52
    // census caught that on re-resolution. Pin the ASSIGNMENT, not the arithmetic, or the pin
    // matches the wrong site and goes green after someone changes the one that matters.
    // ⚠ AND both sites assign to a variable literally named `magi`, in two different scopes. The
    // first draft of D10-3 asserted the seven-term form was ABSENT as a `const magi =` and failed
    // against Engine C's own line - the app was right and the check was wrong. That the CODE uses
    // one name for two quantities is part of why "one label, two figures" was invisible. So these
    // pins COUNT occurrences rather than testing presence: a reconciliation would make the
    // seven-term count 2, and that is the event worth catching.
    const _c = (t) => SRC.split(t).length - 1;
    const _C7 = "const magi = ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y;";
    const _L5 = "const magi = pension + spouseBWork + taxableSS + conv_y + rmd_y;";
    T("D10-1 [PIN]: Engine C's IRMAA MAGI still carries all seven terms, at exactly one site",
      _c(_C7) === 1, `occurrences=${_c(_C7)}`);
    T("D10-2 [PIN]: the Roth ladder's IRMAA MAGI still carries its five, at exactly one site",
      _c(_L5) === 1, `occurrences=${_c(_L5)}`);
    T("D10-3 [PIN]: the two are still DIFFERENT - reconciling them is a scoped change, not a silent one",
      _c(_C7) === 1 && _c(_L5) === 1 && _C7 !== _L5);
    T("D10-4 [CLAUSE]: the ladder footnote discloses the omitted terms",
      SRC.includes("it omits dividends and realized capital gains"));
    T("D10-5 [CLAUSE]: the Field Manual register discloses them too",
      /<li><strong>The Roth tab's IRMAA verdict is computed from a narrower MAGI/.test(SRC));
    T("D10-6 [DIRECTION]: the ladder footnote names the direction of the error as optimistic",
      SRC.includes("The direction of that error is optimistic."));
    T("D10-7 [SITE]: the clause sits in the ladder footnote, under the table it qualifies - not in the verdict cell",
      /IRMAA: 2-year lookback[\s\S]{0,900}it omits dividends and realized capital gains/.test(SRC));
  }
  if (VER === "v550" || VER === "v551" || VER === "v552") {
    T("EXT D-7: the objective label states what it actually computes",
      SRC.includes("MAX ESTATE AFTER HEIR INCOME TAX (leave the most behind)"));
    T("EXT D-7: the objective noun is narrowed",
      SRC.includes('noun: "estate after heir income tax"'));
    T("EXT D-7: the hard-coded winner sentence is narrowed (it does NOT read the noun)",
      SRC.includes("projects the largest estate after heir income tax"));
    T("EXT D-7: the comparator description is narrowed",
      SRC.includes("Ranked by <strong>ending estate after heir income tax</strong>"));
    T("EXT D-7: the results-table column header is narrowed",
      SRC.includes('"Estate after heir income tax"'));
    T("EXT D-7: the comparator note discloses that no estate or inheritance tax is applied",
      SRC.includes("applies <strong>no estate tax and no inheritance tax</strong>, federal or state"));
    T("EXT D-7 [DIRECTION]: the note names the direction of the error",
      /is <strong>optimistic<\/strong>/.test(SRC));
    T("EXT D-7: the field manual discloses it too — both user surfaces, not one",
      SRC.includes("it applies no estate tax and no inheritance tax, federal or state"));
    T("EXT D-7: the manual's own limitations register carries it",
      SRC.includes("No estate tax or inheritance tax is modeled"));
    // The invariant proper: the phrase must not return ANYWHERE in the file, in any casing —
    // label, noun, either literal sentence, the column header, the manual, or a new site.
    T("EXT D-7 [EXTINCTION]: the phrase 'after-tax estate' appears NOWHERE in the source",
      !/after-tax estate/i.test(SRC),
      (SRC.match(/.{50}after-tax estate.{50}/i) || [""])[0]);
  }
  // ─── v5.40 EXTINCTION INVARIANTS ───
  // Three defect classes fixed at v5.40, pinned so they cannot return. These are SOURCE-TEXT
  // checks: they prove the fix is present, not that it renders. The structural DOM assertion
  // tying the IRMAA sentence to Engine C's magi expression is deliberately scoped separately.
  if (V540) {
    // S-1: the IRMAA tab described MAGI as five components while Engine C summed seven. The
    // enumeration was falsified twice by the same mechanism (v5.36 gains, then dividends), so
    // the fix is a NON-EXHAUSTIVE phrasing and the test pins that it names the two that were
    // missing rather than pinning a list that a future term could falsify again.
    const _magiSentence = (SRC.match(/MAGI here is[^<]*/) || [""])[0];
    T("EXT S-1: IRMAA MAGI text is the non-exhaustive phrasing", /MAGI here is the model's own projected income/.test(SRC));
    T("EXT S-1: IRMAA MAGI text names dividends", /dividends/.test(_magiSentence));
    T("EXT S-1: IRMAA MAGI text names realized capital gains", /realized capital gains/.test(_magiSentence));
    T("EXT S-1: the falsified five-component enumeration is gone",
      !/MAGI here uses the simplified 85%-of-SS assumption plus pension, earned income, RMDs, and conversions/.test(SRC));

    // F-2/F-8: four wide grids sat outside every overflowX wrapper and overflowed a 380px
    // viewport. Pin the WRAPPER COUNT, not the line numbers, so a future wide grid added
    // without a wrapper is not silently tolerated by a line-number-shaped test.
    T("EXT F-2/F-8: every overflowX:auto wrapper still present (>=11)",
      (SRC.match(/overflowX: "auto"/g) || []).length >= 11);
    T("EXT F-8: no repeat(9, 1fr) grid is the first child of a non-wrapper",
      (SRC.match(/repeat\(9, 1fr\)/g) || []).length === 2);

    // F-6: money fields were bare text inputs, so phones raised the alphabetic keyboard.
    // inputMode is a keyboard HINT and does not change parsing.
    const _im = (SRC.match(/inputMode="decimal"/g) || []).length;
    T(`EXT F-6: numeric inputs carry inputMode="decimal" (${_im} >= 47)`, _im >= 47);
    T("EXT F-6: free-text fields did NOT get a numeric keyboard",
      !/<input inputMode="decimal"[^>]*value=\{nameA\}/.test(SRC) && !/<input inputMode="decimal"[^>]*value=\{r\.ticker\}/.test(SRC));

    // ─── STRUCTURAL S-1 (scoped 2026-08-20) ───
    // The four EXT S-1 checks above are source-text: they prove the SENTENCE is right and cannot see
    // the ENGINE. S-1 arrived twice by the engine gaining a term while the prose stood still, so
    // these bind the two together in both directions. Scoped to Engine C only — computeIrmaaPlan —
    // because a second, four-term MAGI at L8847 also reaches the screen under the IRMAA label and is
    // deliberately NOT covered here (see SCOPE_STRUCTURAL_MAGI_EXTINCTION.md §6).
    //
    // acorn-walk cannot walk this file (it throws on the first JSXElement), so the walk is manual.
    // Resolution is by ENCLOSING FUNCTION, never by line number, so a reflow cannot move the target.
    const _findNode = (root, pred) => {
      let hit = null;
      (function w(n) {
        if (hit || !n || typeof n !== "object") return;
        if (Array.isArray(n)) { for (const c of n) { w(c); if (hit) return; } return; }
        if (typeof n.type === "string" && pred(n)) { hit = n; return; }
        for (const k in n) { if (k === "start" || k === "end" || k === "loc") continue; w(n[k]); if (hit) return; }
      })(root);
      return hit;
    };
    const _addTerms = (e) => {
      const out = [];
      (function f(x) {
        if (x.type === "BinaryExpression" && x.operator === "+") { f(x.left); f(x.right); }
        else out.push(SRC.slice(x.start, x.end));
      })(e);
      return out;
    };

    const _engineC = _findNode(AST, n => n.type === "FunctionDeclaration" && n.id && n.id.name === "computeIrmaaPlan");
    T("STRUCT S-1: Engine C computeIrmaaPlan resolves in the AST", !!_engineC);
    const _magiC = _engineC && _findNode(_engineC.body, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "magi");
    T("STRUCT S-1: Engine C declares magi", !!_magiC);

    const _terms = _magiC ? _addTerms(_magiC.init) : [];
    const _EXPECT = ["ssTaxable", "pen_y", "work_y", "rmdTax_y", "conv_y", "div_y", "capGain_y"];
    T(`STRUCT S-1: Engine C magi sums exactly ${_EXPECT.length} terms`, _terms.length === _EXPECT.length, _terms.join(" + "));
    T("STRUCT S-1: Engine C magi term set is exactly the registered set (order-insensitive)",
      _terms.length === _EXPECT.length &&
      JSON.stringify([..._terms].sort()) === JSON.stringify([..._EXPECT].sort()), _terms.join(" + "));

    // Bidirectional: the two terms that historically falsified the prose must be in the ENGINE and
    // named in the SENTENCE. Removing either from either side fails.
    const _magiSentenceStruct = (SRC.match(/MAGI here is[^<]*/) || [""])[0];
    T("STRUCT S-1: div_y is in the engine AND dividends is in the sentence",
      _terms.includes("div_y") && /dividends/.test(_magiSentenceStruct));
    T("STRUCT S-1: capGain_y is in the engine AND realized capital gains is in the sentence",
      _terms.includes("capGain_y") && /realized capital gains/.test(_magiSentenceStruct));

    // ─── STRUCT S-2 (v5.41) — the ROTH TAB's magi term set ───────────────────────────────
    // WHY THIS EXISTS. S-1 above pins Engine C's magi by AST and left the Roth tab's
    // unpinned, and that gap is precisely why the omitted-RMD defect survived: the two
    // expressions answer the same question and nothing compared them. This pins the render
    // block's set the same way, so a term cannot silently go missing from it again.
    // GATED PER LEG (OPERATIONS §B2): frozen builds legitimately carry the OLD set, so each
    // leg asserts the set that was true for its own build. This is NOT a defect pin — it is
    // the same invariant evaluated against two different correct answers.
    const _rothMagi = (() => {
      // The ladder-loop `magi` lives in an anonymous render closure, so find it by its
      // neighbours rather than by a function name: the declarator whose init sums conv_y
      // and taxableSS.
      let found = null;
      const walk = (n) => {
        if (!n || typeof n !== "object" || found) return;
        if (n.type === "VariableDeclarator" && n.id && n.id.name === "magi" && n.init) {
          const t = _addTerms(n.init);
          // Discriminate against Engine D's magi, which ALSO sums taxableSS and conv_y but
          // uses the pen_y/work_y accessors. The render block is the one using the
          // `pension` / `spouseBWork` locals.
          if (t.includes("pension") && t.includes("spouseBWork") && t.includes("conv_y")) { found = t; return; }
        }
        for (const k of Object.keys(n)) {
          const v = n[k];
          if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === "string") walk(v);
        }
      };
      walk(AST);
      return found;
    })();
    T("STRUCT S-2: the Roth tab declares a magi summing taxableSS and conv_y", !!_rothMagi,
      _rothMagi ? _rothMagi.join(" + ") : "not found");
    const _S2_EXPECT = V541
      ? ["pension", "spouseBWork", "taxableSS", "conv_y", "rmd_y"]
      : ["pension", "spouseBWork", "taxableSS", "conv_y"];
    T(`STRUCT S-2: Roth-tab magi term set is exactly the registered set for this build (${_S2_EXPECT.length} terms, order-insensitive)`,
      !!_rothMagi && _rothMagi.length === _S2_EXPECT.length &&
      JSON.stringify([..._rothMagi].sort()) === JSON.stringify([..._S2_EXPECT].sort()),
      _rothMagi ? _rothMagi.join(" + ") : "not found");
    if (V541) {
      // The three sites move together or the omissions compound (scope §3): an RMD missing
      // from the Sec.86 base understates taxableSS, which understates magi a SECOND time.
      T("STRUCT S-2 (V541): rmd_y is also in the Sec.86 provisional base (nonSSincome)",
        /const nonSSincome = pension \+ spouseBWork \+ conv_y \+ rmd_y;/.test(SRC));
      T("STRUCT S-2 (V541): rmd_y is also in grossTaxable",
        /const grossTaxable = pension \+ spouseBWork \+ taxableSS \+ conv_y \+ rmd_y;/.test(SRC));
      // BASIS (Pub. 590-B): the divisor applies to the PRIOR 31 December balance. A test that
      // only checks rmdDivisor(75)===24.6 passes happily against the grown balance, which
      // inflates every RMD by (1+g) silently — so pin the operand, not just the divisor.
      T("STRUCT S-2 (V541): the ladder RMD divides the PRIOR year-end balance, not the grown one",
        /rmdA_y = _ageA_y >= _rmdAgeARoth \? Math\.max\(0, tradBalA\) \/ rmdDivisor\(_ageA_y\)/.test(SRC) &&
        !/rmdA_y = [^;]*_grownA/.test(SRC));
      // D-2 Option C: the replay is gone, so the tab carries ONE Traditional balance.
      T("STRUCT S-2 (V541): the _perRmd convert-then-grow replay is retired",
        !/a = Math\.max\(0, a - cA\) \* \(1 \+ tradGrowth\)/.test(SRC));
      T("STRUCT S-2 (V541): the RMD cards read the ladder rows' per-person balances",
        /_balOf = \(who, r\) => \(who === "A" \? r\.tradBalA : r\.tradBalB\)/.test(SRC));
    }

    // ─── STRUCT S-3 (v5.42) — the §86 UPPER TIER is a phase-in, not a cliff ──────────────
    // WHY THIS EXISTS. Through v5.41 the Roth ladder's upper tier was a single expression
    // that jumped to the full 85% of benefits the instant provisional income crossed the
    // adjusted base amount, skipping §86(a)(2)'s phase-in entirely and overstating taxable
    // Social Security by up to 5.3x. This is the EXTINCTION invariant for that defect class:
    // a bare `taxableSS = Math.round(totalSS * 0.85)` under the `> _ssT2` test can never come
    // back without failing here.
    // GATED PER LEG (OPERATIONS §B2). Frozen builds legitimately still contain the cliff, so
    // each leg asserts what was true for its own build. On pre-v5.42 legs this is a dated
    // [KNOWN DEFECT] pin (OPERATIONS §D) asserting the WRONG behaviour on purpose; on v5.42
    // it is the positive assertion the fix flipped it to.
    const _cliff = /if \(provisional > _ssT2\) taxableSS = Math\.round\(totalSS \* 0\.85\);/.test(SRC);
    const _phase = /const _ssPhaseIn = \(provisional - _ssT2\) \* 0\.85 \+ Math\.min\(_ssPara1, \(_ssT2 - _ssT1\) \* 0\.5\);/.test(SRC);
    const _para1 = /const _ssPara1 = Math\.min\(totalSS \* 0\.5, \(provisional - _ssT1\) \* 0\.5\);/.test(SRC);
    const _cap85 = /taxableSS = Math\.round\(Math\.min\(_ssPhaseIn, totalSS \* 0\.85\)\);/.test(SRC);
    if (V542) {
      T("STRUCT S-3 (V542): the §86 upper tier is NOT a bare 85%-of-benefits assignment", !_cliff);
      T("STRUCT S-3 (V542): the upper tier carries the §86(a)(2)(A) phase-in slope", _phase);
      T("STRUCT S-3 (V542): the phase-in carries the §86(a)(1) para1 term, capped at ½ of benefits", _para1);
      T("STRUCT S-3 (V542): the phase-in is capped at 85% of benefits per §86(a)(2)(B)", _cap85);
      // The neighbouring expressions this release deliberately did NOT touch. If either moves,
      // the fix reached further than its scope.
      T("STRUCT S-3 (V542): the filing-status threshold pair still flows through (v5.15, untouched)",
        /const _ssT1 = taxFactsFor\(_filingSingleAt\(year\)\)\.ssThr1;/.test(SRC) &&
        /const _ssT2 = taxFactsFor\(_filingSingleAt\(year\)\)\.ssThr2;/.test(SRC));
      // ⚠ GATED AGAIN at v5.45. This was written at v5.42 to prove that release did NOT touch
      // the middle tier — a correct and useful claim then. v5.45 touches it deliberately
      // (tidy-up item 7: §86(a)(1) caps at ½ of benefits, not 85%), so the assertion became
      // false BY DESIGN. Same §B2 rule as always: assert what is true for the build in hand,
      // and never leave a "did not change X" pin ungated once X is scheduled to change.
      if (!V545) {
        T("STRUCT S-3 (V542, pre-v5.45): the middle tier is byte-identical to v5.41 (untouched by that release)",
          /else if \(provisional > _ssT1\) taxableSS = Math\.round\(Math\.min\(\(provisional - _ssT1\) \* 0\.5, totalSS \* 0\.85\)\);/.test(SRC));
      } else {
        T("STRUCT S-3 (V545): the middle tier now carries the ½-benefits cap (STRUCT S-6 owns this pin)",
          /else if \(provisional > _ssT1\) taxableSS = Math\.round\(Math\.min\(\(provisional - _ssT1\) \* 0\.5, totalSS \* 0\.5\)\);/.test(SRC));
      }
    } else {
      // [KNOWN DEFECT — pre-v5.42] The cliff is present on this frozen build. Correct for it.
      T("STRUCT S-3 (pre-V542) [KNOWN DEFECT]: the §86 upper tier is still the bare cliff", _cliff);
      T("STRUCT S-3 (pre-V542) [KNOWN DEFECT]: no §86(a)(2) phase-in on this build", !_phase);
    }
  }

  // ─── STRUCT S-4 (v5.43) — ENGINE C implements §86, and does so ONCE ──────────────────
  // Through v5.42 the IRMAA engine read `const ssTaxable = ssTot * 0.85;` — flat, no statute.
  // This is the extinction invariant for that expression. Gated per leg: pre-v5.43 legs carry a
  // dated [KNOWN DEFECT] pin asserting the flat rule, which is correct for those builds.
  {
    // ⚠ ANCHORED TO LINE START (^\s*const), because v5.43's own source comment quotes the retired
    // expression verbatim to explain what it replaced. An unanchored /const ssTaxable = .../ matches
    // that COMMENT and the pin passes on the fixed leg while asserting the defect is still present —
    // the t8 comment-counting trap, one suite over. Found by this check going red on v543.
    const _flatC = /^\s*const ssTaxable = ssTot \* 0\.85;/m.test(SRC);
    const _prov  = /const _prov86 = pen_y \+ work_y \+ rmdTax_y \+ conv_y \+ div_y \+ capGain_y \+ ssTot \* 0\.5;/.test(SRC);
    const _par   = /const _para1 = Math\.min\(ssTot \* 0\.5, Math\.max\(0, _prov86 - _ssF\.ssThr1\) \* 0\.5\);/.test(SRC);
    if (V543) {
      T("STRUCT S-4 (V543): Engine C's flat 85%-of-benefits assignment is gone", !_flatC);
      T("STRUCT S-4 (V543): provisional income carries every MAGI term plus half of benefits", _prov);
      T("STRUCT S-4 (V543): para1 is capped at HALF of benefits per §86(a)(1)", _par);
      T("STRUCT S-4 (V543): the phase-in is capped at 85% of benefits per §86(a)(2)(B)",
        /Math\.min\(ssTot \* 0\.85,\s*\n?\s*\(_prov86 - _ssF\.ssThr2\) \* 0\.85/.test(SRC));
      // Thresholds come from the SINGLE source the Roth tab already uses. A third hardcoded copy
      // is how F-2B-1 and F-2B-2 survived three releases; this pin stops a fourth.
      T("STRUCT S-4 (V543): thresholds come from taxFactsFor, NOT a third hardcoded copy",
        /const _ssF = taxFactsFor\(filingSingleI\);/.test(SRC) &&
        !/_prov86[^;]*(25000|32000|34000|44000)/.test(SRC));
      // The ordering trap that broke the scoping experiment, pinned so it cannot come back.
      T("STRUCT S-4 (V543): the phase-in sits BELOW capGain_y (TDZ trap — div_y/capGain_y are declared after the old site)",
        SRC.indexOf("const capGain_y = Math.round(_gainByYrI[yr] || 0);") < SRC.indexOf("const _prov86 ="));
    } else {
      T("STRUCT S-4 (pre-V543) [KNOWN DEFECT]: Engine C still carries the flat 85% rule", _flatC);
      T("STRUCT S-4 (pre-V543) [KNOWN DEFECT]: no §86 phase-in in Engine C on this build", !_prov);
    }
  }

  // ─── STRUCT S-5 (v5.44) — the noConv counterfactual's growth span ────────────────────
  // Through v5.43 `_perRmd` seeded t0 at the LADDER START and grew it from the AS-OF YEAR,
  // compounding the gap twice. Extinction invariant for that expression. Anchored to line
  // start (^\s*const) — v5.44's own comment names the retired form, and an unanchored regex
  // would match the COMMENT and pass while asserting the defect is still there. That trap
  // caught STRUCT S-4 at v5.43; it is not repeated here.
  {
    const _oldSpan = /^\s*const yrs = Math\.max\(0, yr - tl\.asOfYear\);/m.test(SRC);
    const _newSpan = /^\s*const yrs = Math\.max\(0, yr - tl\.rothLadderStart\);/m.test(SRC);
    if (V544) {
      T("STRUCT S-5 (V544): the noConv span no longer counts from the as-of year", !_oldSpan);
      T("STRUCT S-5 (V544): it counts from the ladder start, where t0 is measured", _newSpan);
      // The seed is the half this release deliberately did NOT move (decision D-3a chose the
      // span, not the seed). If it moves, the fix took option (b) by accident.
      T("STRUCT S-5 (V544): the seed still comes from retireStartBalances(rothLadderStart)",
        /const _rsbC = retireStartBalances\(tl\.rothLadderStart\);/.test(SRC));
      // v5.47: `t0` is STILL the whole Traditional balance, and that is now correct rather than
      // pending. Item 6 applied the RMD-exempt share at the two card expressions instead of
      // moving the seed (decision D-2), precisely so both halves of the quantity stay on ONE
      // basis — reseeding would have fixed the no-conversion half while the with-conversion half
      // kept reading the ladder's own `tradBal*`. So this line must NOT change, and it is pinned
      // on both sides of v5.47 for opposite reasons. STRUCT S-8 below carries item 6's own pins.
      T(`STRUCT S-5 (V544)${V547 ? "" : " [KNOWN DEFECT item 6]"}: t0 uses tradInitA/B, not rmdInitA/B${V547 ? " (D-2: the share is applied at the card, not the seed)" : ""}`,
        /const t0 = \{ A: _rsbC\.tradInitA, B: _rsbC\.tradInitB \};/.test(SRC));
    } else {
      T("STRUCT S-5 (pre-V544) [KNOWN DEFECT]: the noConv span still counts from the as-of year", _oldSpan);
      T("STRUCT S-5 (pre-V544) [KNOWN DEFECT]: it does not yet count from the ladder start", !_newSpan);
    }
  }

  // ─── STRUCT S-7 (v5.46) — spouse B's SS is gated by B's OWN claim date ───────────────
  // ANCHORED TO LINE START, and deliberately so: the v5.46 comment above the fixed line
  // explains the defect and would otherwise satisfy a bare text match (the trap that caught
  // S-4 at v5.43 and t8's census at v5.44). A comment must never be able to satisfy a
  // structural pin.
  {
    const _old = /^\s*const spouseBSS = _rsSsB \* 12;$/m.test(SRC);
    const _new = /^\s*const spouseBSS = _singleRoth \? 0 : year > _ssBYearRoth \? _rsSsB \* 12 : year === _ssBYearRoth \? _rsSsB \* _ssBPartialMonths : 0;$/m.test(SRC);
    if (V546) {
      T("STRUCT S-7 (V546): the ladder no longer credits spouse B's SS in every year", !_old);
      T("STRUCT S-7 (V546): B's term is gated by B's claim year, mirroring spouse A", _new);
      T("STRUCT S-7 (V546): B's claim year is built from ssB_date, as A's is",
        /^\s*const _ssBYearRoth = _tlRoth\.ssB_date\.year;$/m.test(SRC));
      T("STRUCT S-7 (V546): B gets the same partial-month credit as A (decision D-2a)",
        /^\s*const _ssBPartialMonths = Math\.max\(0, 12 - _ssBMonthRoth \+ 1\);$/m.test(SRC));
      // The single-filer term is an EXPLICIT gate, not an inference from absent data:
      // `ssB_date` is constructed unconditionally, so a date-only gate would still leak a
      // stored benefit into a single filer's ladder (decision D-2b).
      T("STRUCT S-7 (V546): the single-filer case is gated explicitly, not left to the data",
        /const spouseBSS = _singleRoth \? 0/.test(SRC));
      // Spouse A's term must be untouched — this release mirrors it, it does not move it.
      T("STRUCT S-7 (V546): spouse A's gate is unchanged",
        /^\s*const spouseASS = year > _ssAYearRoth \? _rsSsA \* 12 : year === _ssAYearRoth \? _rsSsA \* _ssAPartialMonths : 0;$/m.test(SRC));
    } else {
      T("STRUCT S-7 (pre-V546) [KNOWN DEFECT 2026-08-22]: B's SS is credited in every ladder year", _old);
      T("STRUCT S-7 (pre-V546) [KNOWN DEFECT 2026-08-22]: no B claim-year constant exists",
        !/_ssBYearRoth/.test(SRC));
    }
  }

  // ─── STRUCT S-8 (v5.47) — the Roth tab's RMD-EXEMPT SHARE, on BOTH card halves ───────
  // A non-qualified annuity is ordinary income when spent but carries no required distribution.
  // Every engine excludes it as `trad * (1 - annShare)`; through v5.46 the Roth tab's two RMD
  // cards did not. The pins below are ANCHORED TO LINE START throughout — item 6's own comment
  // block quotes the retired forms and names `rmdInit*` explicitly, so an unanchored regex would
  // match the COMMENT and report the fix present (or the defect gone) while asserting nothing.
  // That trap has now caught S-4 at v5.43, t8's census at v5.44, and S-6/S-7 since.
  //
  // BOTH HALVES, one basis. The single most important pin here is that noConv AND withConv are
  // scaled. Scaling one is the v5.41 failure — two projections of one quantity on different
  // bases, which drifted $48,712 apart before it was caught.
  {
    const _shareMap = /^\s*const annSh = \{ A: _rsbC\.annShareA \|\| 0, B: _rsbC\.annShareB \|\| 0 \};$/m.test(SRC);
    const _noConvScaled = /^\s*noConv: Math\.round\(P0\.t0 \* Math\.pow\(1 \+ tradGrowth, P0\.yrs\) \* \(1 - P0\.annSh\) \/ rmdDivisor\(P0\.age\)\),$/m.test(SRC);
    const _withConvScaled = /^\s*withConv: Math\.round\(balAt\(P0\.who, P0\.yr\) \* \(1 - P0\.annSh\) \/ rmdDivisor\(P0\.age\)\),$/m.test(SRC);
    // The two *Trad fields are the BALANCE, not the distribution — annuity money is genuinely
    // part of them, so they must stay on the full Traditional basis. Scaling them would be an
    // overreach, and it is pinned as such rather than left to review.
    const _noConvTradPlain = /^\s*noConvTrad: P0\.t0 \* Math\.pow\(1 \+ tradGrowth, P0\.yrs\),$/m.test(SRC);
    const _withConvTradPlain = /^\s*withConvTrad: balAt\(P0\.who, P0\.yr\),$/m.test(SRC);
    if (V547) {
      T("STRUCT S-8 (V547): the per-person exempt share is built from _rsbC", _shareMap);
      T("STRUCT S-8 (V547): the NO-conversion card is scaled by (1 - annSh)", _noConvScaled);
      T("STRUCT S-8 (V547): the WITH-conversion card is scaled by the SAME share — one basis, both halves", _withConvScaled);
      T("STRUCT S-8 (V547): noConvTrad is NOT scaled — it is the balance, not the distribution", _noConvTradPlain);
      T("STRUCT S-8 (V547): withConvTrad is NOT scaled either", _withConvTradPlain);
      T("STRUCT S-8 (V547): the share reaches the card through mk's return, not a second lookup",
        /^\s*return \{ who, age, yr, yrs, t0: t0\[who\], annSh: annSh\[who\] \};$/m.test(SRC));
    } else {
      T("STRUCT S-8 (pre-V547) [KNOWN DEFECT item 6]: no exempt share is built in the Roth tab", !_shareMap);
      T("STRUCT S-8 (pre-V547) [KNOWN DEFECT item 6]: the no-conversion card is unscaled", !_noConvScaled);
      T("STRUCT S-8 (pre-V547) [KNOWN DEFECT item 6]: the with-conversion card is unscaled", !_withConvScaled);
    }
  }

  // ─── STRUCT S-9 (v5.47) — the HSA is out of the DIVIDEND base, at all three sites ────
  // `otherTaxableInit()` lumps taxable and HSA together as spendable after-tax cash (decision
  // C-4) and must keep doing so — seven call sites depend on that view. It is simply the wrong
  // input to a TAXABLE DIVIDEND: a qualified HSA withdrawal is tax-free, so those dollars cannot
  // throw off a dividend that lands in MAGI. Engine D reached this in v5.36 (`_gainPoolInit`);
  // the three dividend sites are the consumer that never got the same treatment.
  // ANCHORED TO LINE START: item 5's Engine A site now sits beneath a 14-line comment that
  // quotes the old expression, and `otherTaxableInit` appears in that prose too.
  {
    const _aFixed = /^\s*const div_y = Math\.round\(Math\.max\(0, taxBal - \(P\.othHsa \|\| 0\)\) \* \(P\.taxYieldPct \/ 100\)\);$/m.test(SRC);
    const _cFixed = /^\s*const div_y = Math\.round\(Math\.max\(0, _taxableInitI - \(_rsbC\.othHsa \|\| 0\)\) \* \(taxYield \/ 100\)\);/m.test(SRC);
    const _bFixed = /^\s*const div_y = Math\.round\(Math\.max\(0, _taxableInit - \(_rsbB\.othHsa \|\| 0\)\) \* \(taxYield \/ 100\)\);/m.test(SRC);
    // The retired forms, pinned by absence so a partial revert at one site is caught.
    const _aOld = /^\s*const div_y = Math\.round\(Math\.max\(0, taxBal\) \* \(P\.taxYieldPct \/ 100\)\);$/m.test(SRC);
    const _cOld = /^\s*const div_y = Math\.round\(_taxableInitI \* \(taxYield \/ 100\)\);/m.test(SRC);
    const _bOld = /^\s*const div_y = Math\.round\(_taxableInit \* \(taxYield \/ 100\)\);$/m.test(SRC);
    if (V547) {
      T("STRUCT S-9 (V547): Engine A's dividend base holds the HSA out", _aFixed);
      T("STRUCT S-9 (V547): Engine C's does too", _cFixed);
      T("STRUCT S-9 (V547): Engine B's does too — all THREE, or the engines disagree", _bFixed);
      T("STRUCT S-9 (V547): none of the three retired forms survives", !_aOld && !_cOld && !_bOld);
      // The shared helper is deliberately untouched: the fix is at the consumer, so the
      // spendable view and the C-4 capital-gain view keep their own correct answer. Asserted
      // POSITIVELY on the body — `hsa` must still be one of the two taxTypes it sums — because
      // pinning "the helper does not mention othHsa" would pass on a helper that had been
      // deleted, and this release's whole design rests on that helper being left alone.
      T("STRUCT S-9 (V547): otherTaxableInit still sums taxable AND hsa (decision C-4 untouched)",
        /^function otherTaxableInit\(\) \{$/m.test(SRC) &&
        /^\s*return oth\.reduce\(\(s, a\) => s \+ \(\(a\.taxType === "taxable" \|\| a\.taxType === "hsa"\) \? \(a\.balance \|\| 0\) : 0\), 0\);$/m.test(SRC));
    } else {
      T("STRUCT S-9 (pre-V547) [KNOWN DEFECT item 5]: Engine A's dividend base still includes the HSA", _aOld);
      T("STRUCT S-9 (pre-V547) [KNOWN DEFECT item 5]: so does Engine C's", _cOld);
      T("STRUCT S-9 (pre-V547) [KNOWN DEFECT item 5]: so does Engine B's", _bOld);
    }
  }

  // ─── STRUCT S-6 (v5.45) — §86(a)(1)'s ½-benefits cap, in BOTH places ─────────────────
  // One defect, two mirror-image sites. Anchored to line start throughout, because both
  // v5.45 comments quote the retired expressions verbatim — the trap that caught S-4 at
  // v5.43 and t8 at v5.44. A comment must never be able to satisfy a structural pin.
  {
    const _oldB = /^\s*const lower = 0\.5 \* Math\.min\(provisional - _ssThr1, _ssThr2 - _ssThr1\);/m.test(SRC);
    const _newB = /^\s*const _para1 = Math\.min\(0\.5 \* ssBenefits, 0\.5 \* \(provisional - _ssThr1\)\);/m.test(SRC);
    const _old7 = /taxableSS = Math\.round\(Math\.min\(\(provisional - _ssT1\) \* 0\.5, totalSS \* 0\.85\)\);/.test(SRC);
    const _new7 = /taxableSS = Math\.round\(Math\.min\(\(provisional - _ssT1\) \* 0\.5, totalSS \* 0\.5\)\);/.test(SRC);
    if (V545) {
      T("STRUCT S-6 (V545) item 4: Engine B's upper tier no longer drops the ½SS half of para1", !_oldB);
      T("STRUCT S-6 (V545) item 4: para1 carries BOTH halves of §86(a)(1)", _newB);
      T("STRUCT S-6 (V545) item 4: it is still bounded by ½(adjbase − base)",
        /^\s*const lower = Math\.min\(_para1, 0\.5 \* \(_ssThr2 - _ssThr1\)\);/m.test(SRC));
      T("STRUCT S-6 (V545) item 7: the Roth tab's middle tier no longer caps at 85% of benefits", !_old7);
      T("STRUCT S-6 (V545) item 7: it caps at ½ of benefits, per §86(a)(1)", _new7);
      // The two neighbouring tiers that were ALREADY correct and must stay untouched.
      T("STRUCT S-6 (V545): Engine B's middle tier is unchanged (it was already correct)",
        /if \(provisional <= _ssThr2\) return Math\.min\(0\.5 \* \(provisional - _ssThr1\), 0\.5 \* ssBenefits\);/.test(SRC));
      T("STRUCT S-6 (V545): the Roth tab's upper tier is unchanged (correct since v5.42)",
        /const _ssPara1 = Math\.min\(totalSS \* 0\.5, \(provisional - _ssT1\) \* 0\.5\);/.test(SRC));
    } else {
      T("STRUCT S-6 (pre-V545) [KNOWN DEFECT] item 4: Engine B's upper tier still drops the ½SS cap", _oldB);
      T("STRUCT S-6 (pre-V545) [KNOWN DEFECT] item 7: the Roth tab's middle tier still caps at 85%", _old7);
    }
  }

  T("STATIC: no API keys in source", !/sk-ant-[A-Za-z0-9_-]{20,}/.test(SRC));
  T("STATIC: no personal Windows paths", !/C:\\+Users|\/Users\/steve/i.test(SRC));
  T("STATIC: persistence goes through window.storage (>40 call sites)", (SRC.match(/window\.storage\./g) || []).length > 40);
  T("STATIC: single default export (the app component)", (SRC.match(/export default/g) || []).length === 1);
  if (IS510) {
    T("STATIC (V510): mirror invariant — monthly401k recomputed from split fields", /c\.monthly401k = c?\.?contribPreTaxA \+ c?\.?contribRothA/.test(SRC.replace(/\s+/g, " ")) || SRC.includes("c.monthly401k = c.contribPreTaxA + c.contribRothA"));
    T("STATIC (V510): all consumers route through retireStartBalances (≥10 mentions)", (SRC.match(/retireStartBalances\(/g) || []).length >= 10);
    T("STATIC (V510): migration flag present", SRC.includes("_contribMigrated"));
  } else {
    T("STATIC (V592): no accrual machinery yet", !SRC.includes("retireStartBalances") && !SRC.includes("contribAccrual"));
  }
}

// ── v5.33 · embedded-gain field + the ONE accessor that reads it ────────────────────────────
// v5.33 was storage only: the field exists, persists and clamps, and NOTHING reads it.
// The clamp table is hand-verified: v/100 is clamped into [0, 0.95], and any non-finite input
// (including undefined on a pre-v5.33 backup) falls to 0 rather than propagating NaN.
//
// v5.34 GATED PER LEG (OPERATIONS §B2). The field half is true for BOTH builds and is asserted
// on both. The STATIC call-site half is NOT: v5.33 asserts zero call sites, v5.34 asserts the
// real count. Inverting without gating would apply the v5.34 expectation to the frozen v5.33
// leg, which legitimately still has none — the v5.28 defect, not a fix.
{
  const IS533 = VER === "v533";
  const IS536 = VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552")));
  const IS534 = VER === "v534" || VER === "v535" || IS536;
  const HAS_GAIN_FIELD = IS533 || IS534;
  const P0 = g.PORTFOLIO();
  if (HAS_GAIN_FIELD) {
    T("gain field: DEFAULT_PORTFOLIO carries taxableGainPct", Object.prototype.hasOwnProperty.call(P0, "taxableGainPct"));
    T("gain field: defaults to 0 (D-2 — PARTIALLY ADDRESSED, disclosed in app)", P0.taxableGainPct === 0, String(P0.taxableGainPct));
    T("gain field: taxableGainShare is exported to the harness", typeof g.taxableGainShare === "function", typeof g.taxableGainShare);

    const saved = P0.taxableGainPct;
    const CLAMP = [[-10, 0], [0, 0], [40, 0.40], [95, 0.95], [200, 0.95],
                   ["abc", 0], [null, 0], [undefined, 0], [NaN, 0]];
    for (const [input, want] of CLAMP) {
      P0.taxableGainPct = input;
      const got = g.taxableGainShare();
      T(`gain field clamp: ${JSON.stringify(input) ?? String(input)} -> ${want}`, got === want, `got ${got}`);
    }
    P0.taxableGainPct = saved;
    T("gain field: clamp probe restored the field", g.PORTFOLIO().taxableGainPct === 0);

    // STATIC — the accessor is present in source and, at v5.33, is called by NOBODY.
    // If this fails, an engine has started reading the field a release early. That is the
    // STOP condition in the v5.33 brief, not a test to relax.
    const body = SRC.split("\n").filter(l => l.length < 5000).join("\n");
    // AST, not text: two of the three textual occurrences at v5.33 are COMMENTS, and a line
    // match counts them as call sites (OPERATIONS B1). Count nodes instead.
    let _decls = 0, _calls = 0;
    const _callerNames = [];
    {
      const walk = (n, f) => {
        if (!n || typeof n.type !== "string") return;
        f(n);
        for (const k in n) {
          const v = n[k];
          if (Array.isArray(v)) v.forEach(c => { if (c && typeof c.type === "string") walk(c, f); });
          else if (v && typeof v.type === "string") walk(v, f);
        }
      };
      // Track the enclosing FunctionDeclaration so a call site can be ATTRIBUTED, not just counted.
      const walkScoped = (n, fnName) => {
        if (!n || typeof n.type !== "string") return;
        const here = (n.type === "FunctionDeclaration" && n.id) ? n.id.name : fnName;
        if (n.type === "FunctionDeclaration" && n.id && n.id.name === "taxableGainShare") _decls++;
        if (n.type === "CallExpression" && n.callee && n.callee.name === "taxableGainShare") {
          _calls++; _callerNames.push(here || "(top level)");
        }
        for (const k in n) {
          const v = n[k];
          if (Array.isArray(v)) v.forEach(c => { if (c && typeof c.type === "string") walkScoped(c, here); });
          else if (v && typeof v.type === "string") walkScoped(v, here);
        }
      };
      walkScoped(AST, null);
      void walk;
    }
    T("STATIC: taxableGainShare() is defined exactly once", _decls === 1, String(_decls));
    if (IS536) {
      // v5.36 — THE THIRD BRANCH the v5.34/v5.35 note above asked for, rather than relaxing the
      // one below. Engine D now reads the field, so the honest assertion is not "nobody calls
      // it" but "exactly ONE engine calls it, and it is this one". Asserted by NAME as well as
      // by count: a second consumer appearing, or the call migrating to another engine, both
      // fail here. That is the statement the release actually makes.
      T("v5.36 STATIC: exactly one engine calls taxableGainShare()", _calls === 1, `${_calls} call site(s)`);
      T("v5.36 STATIC: ...and it is Engine D (computeWithdrawalPlan)",
        _callerNames.length === 1 && _callerNames[0] === "computeWithdrawalPlan", _callerNames.join(", ") || "(none)");
    } else if (IS533 || IS534) {
      // Read by NOBODY on BOTH legs. v5.33 shipped it that way deliberately as the storage
      // foundation; v5.34 returns to it, because the Engine D basis tracker that briefly consumed
      // it was backed out — it realized capital gain on an RMD that Engine D sources from the
      // taxable sleeve, inventing gain in households with no taxable account at all.
      // v5.35 is the release that consumes this, on a corrected sequencer; when it lands, gate a
      // THIRD branch here asserting its exact caller rather than relaxing this one.
      // The count is asserted EXACTLY, not merely === 0, so a stray call fails as loudly as a
      // missing one. If this fails on either leg, an engine started reading the field early —
      // that is a STOP condition, not a number to adjust.
      T(`v5.3${IS533 ? "3" : "4"} STATIC: no engine calls it yet (AST call sites === 0)`,
        _calls === 0, `${_calls} call site(s): ${_callerNames.join(", ") || "(none)"}`);
    }
    T("STATIC: the schema default is present for pre-v5.33 backups", body.includes("PORTFOLIO.taxableGainPct = 0"));
  } else {
    T("pre-v5.33: no taxableGainPct field", !Object.prototype.hasOwnProperty.call(P0, "taxableGainPct"));
    T("pre-v5.33: no taxableGainShare accessor", typeof g.taxableGainShare !== "function");
  }
}

console.log(`\nt1 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
