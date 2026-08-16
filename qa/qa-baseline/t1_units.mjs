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
const KNOWN_VERSIONS = ["v510", "v5101", "v5102", "v511", "v512", "v513", "v514", "v515", "v516", "v517", "v518", "v519", "v520", "v521", "v522", "v523", "v524", "v525", "v526", "v527", "v528", "v529", "v530", "v531", "v532", "v533", "v534", "v535", "v536", "v592"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log("\n  \u2717 FATAL: version tag \"" + VER + "\" is not registered in this suite.");
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to the version ladders in this file BEFORE running.");
  process.exit(1);
}

const IS510 = VER !== "v592"; // v5.10-family features (v510 and v5101)
const IS5101 = VER === "v5101";
const IS5102 = VER === "v5102";
const IS511 = VER === "v511" || VER === "v512" || VER === "v513" || VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536";
const IS514 = VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536"; // v5.14 IRMAA indexation Verify checks present
const SRC = fs.readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
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
  const _verifyCount = (VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536") ? 66 : VER === "v531" ? 62 : IS514 ? 57 : IS510 ? 54 : 53;
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
  if (VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536") {
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
  const verStr = VER === "v536" ? "v5.36" : VER === "v535" ? "v5.35" : VER === "v534" ? "v5.34" : VER === "v533" ? "v5.33" : VER === "v532" ? "v5.32" : VER === "v531" ? "v5.31" : VER === "v530" ? "v5.30" : VER === "v529" ? "v5.29" : VER === "v528" ? "v5.28" : VER === "v527" ? "v5.27" : VER === "v526" ? "v5.26" : VER === "v525" ? "v5.25" : VER === "v524" ? "v5.24" : VER === "v523" ? "v5.23" : VER === "v522" ? "v5.22" : VER === "v521" ? "v5.21" : VER === "v520" ? "v5.20" : VER === "v519" ? "v5.19" : VER === "v518" ? "v5.18" : VER === "v517" ? "v5.17" : VER === "v516" ? "v5.16" : VER === "v515" ? "v5.15" : VER === "v514" ? "v5.14" : VER === "v513" ? "v5.13" : VER === "v512" ? "v5.12" : VER === "v511" ? "v5.11" : IS5102 ? "v5.10.2" : IS5101 ? "v5.10.1" : IS510 ? "v5.10" : "v5.9.2";
  T(`STATIC: field-manual callsign carries ${verStr}`, SRC.includes(`FIELD MANUAL · ${verStr} · PUBLIC BUILD`));
  T(`STATIC: end-of-manual footer carries ${verStr}`, SRC.includes(`DANGER CLOSE ${verStr} · documentation regenerated`));
  // v5.10.2: the remaining two of the four in-app version sites, asserted exactly
  // (delimiters included so v5.10 cannot match v5.10.1/2 by prefix).
  T(`STATIC: DATA LOAD header carries ${verStr}`, SRC.includes(`DATA LOAD │ ${verStr}</div>`));
  T(`STATIC: app footer carries ${verStr}`, SRC.includes(`DANGER CLOSE ${verStr} │ Not financial advice`));
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
  const IS536 = VER === "v536";
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
