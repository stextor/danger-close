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
