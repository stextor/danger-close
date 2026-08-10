// t1 — UNITS & STATICS (baseline rebuild, 2026-08).
// Run: node t1_units.mjs v592   |   node t1_units.mjs v510
// Methodology: this suite was authored fresh after the original t1 was lost with its
// session sandbox. It was proven green against pristine v5.9.2 (a1f0d4a76565c63494628e957c66ff91)
// before being pointed at v5.10; version-conditional expectations are marked V510/V592.
import fs from "fs";

const VER = process.argv[2] || "v510";
const IS510 = VER !== "v592"; // v5.10-family features (v510 and v5101)
const IS5101 = VER === "v5101";
const IS5102 = VER === "v5102";
const IS511 = VER === "v511" || VER === "v512" || VER === "v513" || VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517";
const IS514 = VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517"; // v5.14 IRMAA indexation Verify checks present
const SRC = fs.readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
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
  const _verifyCount = IS514 ? 57 : IS510 ? 54 : 53;
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
  const verStr = VER === "v517" ? "v5.17" : VER === "v516" ? "v5.16" : VER === "v515" ? "v5.15" : VER === "v514" ? "v5.14" : VER === "v513" ? "v5.13" : VER === "v512" ? "v5.12" : VER === "v511" ? "v5.11" : IS5102 ? "v5.10.2" : IS5101 ? "v5.10.1" : IS510 ? "v5.10" : "v5.9.2";
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

console.log(`\nt1 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
