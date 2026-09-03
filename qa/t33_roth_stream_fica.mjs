// t33 — ROTH COMPARATOR: FICA IS CHARGED ON EARNED INCOME ONLY (new at v5.63)
// Run: node t33_roth_stream_fica.mjs v562 | node t33_roth_stream_fica.mjs v563
//
// ══ WHY THIS SUITE EXISTS ══
// Through v5.62 `runRothStrategies` folded EVERY ordinary income stream into `work`, and both of
// its FICA sites charged 7.65% on that total — so rental, annuity and royalty income was charged
// payroll tax it has never been subject to. The Taxes engine has always split work from non-work
// (`kind: "work"` / `excludeKind: "work"`) for exactly this reason; this engine never did. The
// defect changed which strategy scored best on `estate`, the field the Roth tab ranks on.
//
// ══ WHY NO EXISTING SUITE CAUGHT IT ══
// Measured by AST at the v5.63 build: 15 sites across the suite set `incomeStreams`, and every one
// of them was `monthly: 0` or `[]`. Eleven are the identical line `P.incomeStreams = [{ monthly: 0,
// ... }]` — the deliberate convention that neutralises the demo part-time taper so cross-engine
// comparisons stay clean (see t17, t32). The convention is right; its side effect was that the
// changed code path was UNREACHABLE from every fixture the suite had. 2,934 checks were green
// against a live defect for as long as the feature existed.
//
// **These are the first stream-bearing fixtures in this suite.** Do not "tidy" them to monthly: 0.
//
// ══ GATING ══
// The v5.62 leg is frozen and legitimately still carries the defect, so it asserts the DEFECTIVE
// behaviour and the v5.63 leg asserts the fixed behaviour. Both legs are green and honest
// (OPERATIONS §B2: inverting an assertion without gating it applies the new expectation to frozen
// builds and stops the prior leg replaying). The PROOF that the fixed assertion discriminates is a
// negative control, run ungated and once, in controls_v563.sh — not this file.

let seed = 1;
Math.random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648; // pre-import: d3 captures Math.random at load

const VER = process.argv[2] || "v563";

// ─── VERSION-TAG REGISTRY GUARD (t3 convention) ───
// An unregistered tag would fall off the end of the gate below and silently run the WRONG
// expectation. New suite at v5.63, so its registry starts at the active pair; EXTEND it every
// release, then RUN — never extend and assume.
const KNOWN_VERSIONS = ["v562", "v563"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log("\n  \u2717 FATAL: version tag \"" + VER + "\" is not registered in this suite.");
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to KNOWN_VERSIONS and to POST_FIX below BEFORE running.");
  process.exit(1);
}
// The fix landed at v5.63. Every later tag is post-fix and must be added here as well.
const POST_FIX = VER === "v563";

const m = await import(`./app_${VER}.mjs`);
const g = m.__g;

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  \u2717 ${name}${detail ? " — " + detail : ""}`); }
};

console.log(`t33 — ROTH COMPARATOR FICA / EARNED-ONLY (${VER})`);

// ══ HOUSEHOLD ══
// An explicit hand-built P, the t3 convention: version-neutral by construction, and it never
// touches the demo portfolio. Streams are NOT part of P — `streamsAnnualAt` reads the GLOBAL
// PORTFOLIO — so the two are set separately and the setup group below proves the stream is live.
const baseP = (o = {}) => ({
  single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2058,
  ladderEnd: 2037, ladderEndA: 2037, ladderEndB: 2039,
  dobAYr: 1964, dobBYr: 1966, deathYr1: 2052, survivor: "B",
  ssA: 2800, ssB: 1400, ssAYr: 2031, ssAMo: 3, ssBYr: 2033, ssBMo: 6,
  pen: 800, stateRate: 0.04, stateCode: "GA",
  convTaxFunding: "taxable", taxableGainFrac: 0.5,
  acaPremium: 0, acaSize: 0, taxYieldPct: 1.5, currentConv: 70000,
  tradInit: 1000000, rothInit: 200000,
  tradInitA: 600000, tradInitB: 400000, rothInitA: 150000, rothInitB: 50000,
  taxableInit: 300000, ...o,
});

// owner "joint" on purpose: an A- or B-owned stream stops at that person's projected death, which
// would make the year count depend on the mortality path rather than on the FICA rule under test.
const stream = (kind, monthly = 2000, startYear = 2000, endYear = 9999) => {
  const s = { label: "t33", owner: "joint", monthly, startYear, endYear, cola: false, tax: "ordinary" };
  if (kind !== undefined) s.kind = kind;   // undefined = no kind at all (defaults to "other")
  return [s];
};
const setStreams = (arr) => { g.PORTFOLIO().incomeStreams = arr; };
const totTax = (streams, po = {}) => {
  setStreams(streams);
  return g.runRothStrategies(baseP(po)).find(r => r.key === "current").totTax;
};
const rowOf = (streams, po = {}) => {
  setStreams(streams);
  return g.runRothStrategies(baseP(po)).find(r => r.key === "current");
};

// Closing the second-order channel. A smaller tax bill leaves a bigger taxable pool, which pays
// more dividends, which are taxed — so on a household WITH a taxable sleeve the lifetime delta is
// NOT the raw FICA. Zeroing the sleeve and its yield isolates the FICA term so the invariant below
// can be hand-verified to the dollar. Group E then measures the second-order case deliberately
// rather than letting it contaminate the exact one.
const NO_SECOND_ORDER = { taxableInit: 0, taxYieldPct: 0 };

// ══ HAND-VERIFIED CONSTANTS ══
// $2,000/mo joint stream = $24,000/yr, far below the 2026 OASDI wage base, so the full rate applies:
//   OASDI   24,000 × 0.0620 = 1,488.00
//   Medicare 24,000 × 0.0145 =   348.00
//   total                    = 1,836.00   per year, per the two FICA sites' own expression
// Engine span is retireYr..horizonYr inclusive = 2027..2058 = 32 years (asserted in group C).
const STREAM_ANNUAL = 24000;
const FICA_YEAR = 1836;
const FICA_YEARS = 32;
const FICA_TOTAL = 58752;          // 32 × 1,836 — asserted, not pasted

// ═══ A · SETUP — the fixture really does carry a live stream ═══
// Without this group a future "tidy-up" could zero these streams and every check below would go
// green vacuously, which is precisely how the defect survived 2,934 checks.
console.log("\n  A — setup: the first stream-bearing fixtures");
{
  T("A-1: FICA arithmetic is the two sites' own expression, hand-computed",
    Math.round(STREAM_ANNUAL * 0.062) + Math.round(STREAM_ANNUAL * 0.0145) === FICA_YEAR,
    `${STREAM_ANNUAL} -> ${STREAM_ANNUAL * 0.062} + ${STREAM_ANNUAL * 0.0145}`);
  T("A-2: the stream sits far below the 2026 OASDI wage base, so the cap never binds",
    STREAM_ANNUAL < g.TAX_CONSTS().SS_WAGE_BASE, `${STREAM_ANNUAL} vs ${g.TAX_CONSTS().SS_WAGE_BASE}`);
  T("A-3: FICA_TOTAL is the product, not a pasted figure", FICA_YEARS * FICA_YEAR === FICA_TOTAL);

  setStreams(stream("rental"));
  T("A-4: the fixture is LIVE — a non-zero stream reaches the engine's own accessor",
    g.streamsAnnualAt(2030, { tax: "ordinary" }) === STREAM_ANNUAL,
    String(g.streamsAnnualAt(2030, { tax: "ordinary" })));
  T("A-5: getIncomeStreams sees exactly one stream", g.getIncomeStreams().length === 1);
}

// ═══ B · THE COMPLEMENT IDENTITY, EXECUTED WITH NON-ZERO READINGS ON BOTH SIDES ═══
// This replaces the mislabelled t10 §2E pin, which asserted that adding $12,000 to a taxed base
// changes the tax — something no release will ever falsify. A `0 === 0` version of this check is
// worse than none: it is how the false "otherOrd gap" claim survived into a shipped disclosure.
// So both sides are asserted non-zero BEFORE the identity is asserted.
console.log("\n  B — work / non-work complement, both sides non-zero");
{
  setStreams([
    { label: "job", kind: "work", owner: "joint", monthly: 1500, startYear: 2000, endYear: 9999, cola: false, tax: "ordinary" },
    { label: "rent", kind: "rental", owner: "joint", monthly: 2000, startYear: 2000, endYear: 9999, cola: false, tax: "ordinary" },
  ]);
  const all = g.streamsAnnualAt(2030, { tax: "ordinary" });
  const wrk = g.streamsAnnualAt(2030, { kind: "work", tax: "ordinary" });
  const oth = g.streamsAnnualAt(2030, { excludeKind: "work", tax: "ordinary" });
  T("B-1: the work side is NON-ZERO (the identity is not 0 === 0)", wrk > 0, String(wrk));
  T("B-2: the non-work side is NON-ZERO", oth > 0, String(oth));
  T("B-3: work side reads the job stream exactly", wrk === 18000, String(wrk));
  T("B-4: non-work side reads the rental stream exactly", oth === 24000, String(oth));
  T("B-5: the two halves partition the total", wrk + oth === all, `${wrk} + ${oth} vs ${all}`);
  T("B-6: total is both streams", all === 42000, String(all));
}

// ═══ C · EXTINCTION INVARIANT — a rental and a wage of equal size must differ by exactly FICA ═══
// The defect class this pins: any future change that lets non-work income back into `work`.
console.log("\n  C — extinction: equal rental and wage streams, second-order closed");
{
  const w1 = totTax(stream("work", 2000, 2030, 2030), NO_SECOND_ORDER);
  const r1 = totTax(stream("rental", 2000, 2030, 2030), NO_SECOND_ORDER);
  if (POST_FIX) {
    T("C-1: one stream-year — rental is cheaper than wage by EXACTLY one year of FICA",
      w1 - r1 === FICA_YEAR, `delta ${w1 - r1}, expected ${FICA_YEAR}`);
  } else {
    T("C-1 [PRE-FIX v5.62]: one stream-year — rental and wage are IDENTICAL (rental charged FICA)",
      w1 - r1 === 0, `delta ${w1 - r1}`);
  }

  const wF = totTax(stream("work"), NO_SECOND_ORDER);
  const rF = totTax(stream("rental"), NO_SECOND_ORDER);
  if (POST_FIX) {
    T("C-2: full span — delta is EXACTLY 32 years of FICA",
      wF - rF === FICA_TOTAL, `delta ${wF - rF}, expected ${FICA_TOTAL}`);
    T("C-3: the delta divides into whole stream-years at the hand-computed rate",
      (wF - rF) % FICA_YEAR === 0 && (wF - rF) / FICA_YEAR === FICA_YEARS);
  } else {
    T("C-2 [PRE-FIX v5.62]: full span — rental and wage are IDENTICAL",
      wF - rF === 0, `delta ${wF - rF}`);
    T("C-3 [PRE-FIX v5.62]: the defect is total, not partial — not one dollar of difference",
      wF === rF, `${wF} vs ${rF}`);
  }

  // Span bounds — these fix FICA_YEARS as a measured fact rather than an assumption.
  const dAt = (y) => totTax(stream("work", 2000, y, y), NO_SECOND_ORDER)
                   - totTax(stream("rental", 2000, y, y), NO_SECOND_ORDER);
  const inSpan = POST_FIX ? FICA_YEAR : 0;
  T("C-4: 2026 is BEFORE the engine's span — no FICA either way", dAt(2026) === 0, String(dAt(2026)));
  T("C-5: 2027 is the first modelled year", dAt(2027) === inSpan, String(dAt(2027)));
  T("C-6: 2058 is the last modelled year", dAt(2058) === inSpan, String(dAt(2058)));
  T("C-7: 2059 is past the horizon — no FICA either way", dAt(2059) === 0, String(dAt(2059)));
}

// ═══ D · EVERY NON-WORK KIND, INCLUDING THE UNTYPED DEFAULT ═══
// `streamsMonthlyAt` defaults a stream with no `kind` to "other", so an untyped stream is non-work
// and must NOT be charged FICA. A fix that special-cased only "rental" would pass C and fail here.
console.log("\n  D — annuity, royalty and untyped streams are non-work too");
{
  const wF = totTax(stream("work"), NO_SECOND_ORDER);
  const rF = totTax(stream("rental"), NO_SECOND_ORDER);
  const aF = totTax(stream("annuity"), NO_SECOND_ORDER);
  const oF = totTax(stream("other"), NO_SECOND_ORDER);
  const uF = totTax(stream(undefined), NO_SECOND_ORDER);   // no `kind` property at all
  T("D-1: annuity behaves as non-work", aF === rF, `${aF} vs ${rF}`);
  T("D-2: an explicit \"other\" kind behaves as non-work", oF === rF, `${oF} vs ${rF}`);
  T("D-3: an UNTYPED stream defaults to non-work", uF === rF, `${uF} vs ${rF}`);
  if (POST_FIX) {
    T("D-4: and all three are cheaper than the wage stream", aF < wF && oF < wF && uF < wF);
  } else {
    T("D-4 [PRE-FIX v5.62]: all three are charged FICA exactly as the wage stream is",
      aF === wF && oF === wF && uF === wF);
  }
}

// ═══ E · THE SECOND FICA SITE — the ACA sale sub-engine at _estSaleGain ═══
// The engine has TWO FICA sites, not one: `_estSaleGain` carries its own copy. A fix applied to
// only the main site leaves the ACA-bridge path defective — and that is exactly where income
// streams matter most, because the subsidy cliff is priced off MAGI.
//
// ⚠ READ THIS BEFORE EDITING. `_estSaleGain` is reached ONLY from the STAY UNDER ACA CLIFF
// strategy solver (`key: "acaCliff"`) — setting acaPremium/acaSize is NOT enough. The first
// version of this group set the ACA fields and then read the SLIDER row (`key: "current"`), which
// never enters that branch: it showed a large, real, entirely main-path delta and looked like
// coverage. Controls C2a and C4 — which corrupt the sale sub-engine alone — did not fire against
// it. That non-firing was the finding (§B2), and this is the repair. **Assert on `acaCliff`.**
//
// The discriminating field is `totConv`, not `totTax`: the cliff solver sizes each year's
// conversion against an estimated sale gain, and that estimate includes `ficaC`. Charging FICA on
// rental income inside the estimate therefore moves the CONVERSION the strategy chooses — a thing
// no other path in this suite can move.
console.log("\n  E — the ACA-bridge path (second FICA site, via the cliff solver)");
{
  const ACA = { taxableInit: 400000, taxYieldPct: 0, acaPremium: 1800, acaSize: 2, currentConv: 250000 };
  const row = (kind) => { setStreams(stream(kind)); return g.runRothStrategies(baseP(ACA)).find(r => r.key === "acaCliff"); };
  const w = row("work"), r = row("rental");
  T("E-1: the cliff strategy exists on this household (the branch is actually entered)",
    !!w && !!r && Number.isFinite(w.totConv));
  if (POST_FIX) {
    T("E-2: the cliff solver CONVERTS A DIFFERENT AMOUNT — only the sale sub-engine can do this",
      w.totConv !== r.totConv, `${w.totConv} vs ${r.totConv}`);
    T("E-3: conversions rise for the wage household, whose estimated bill is larger",
      w.totConv - r.totConv === 738, `delta ${w.totConv - r.totConv}`);
    T("E-4: lifetime tax on the cliff strategy falls for the non-work stream",
      w.totTax - r.totTax === 60041, `delta ${w.totTax - r.totTax}`);
  } else {
    T("E-2 [PRE-FIX v5.62]: the cliff solver converts the SAME amount either way",
      w.totConv === r.totConv, `${w.totConv} vs ${r.totConv}`);
    T("E-3 [PRE-FIX v5.62]: the sale sub-engine charges rental income FICA exactly as it does wages",
      w.totConv === 1203137 && r.totConv === 1203137, `${w.totConv} / ${r.totConv}`);
    T("E-4 [PRE-FIX v5.62]: lifetime tax on the cliff strategy is identical",
      w.totTax === r.totTax, `${w.totTax} vs ${r.totTax}`);
  }
}

// ═══ F · SECOND-ORDER PIN — IRMAA AND NIIT DO MOVE, AND THE RELEASE MUST NOT CLAIM OTHERWISE ═══
// A smaller tax bill changes the funding draw, which changes the taxable pool, which changes later
// dividends, which changes MAGI — familiar from v5.38. On the household below the fix pushes MAGI
// ACROSS an IRMAA tier, so the surcharge RISES even though lifetime tax falls. Pinned so the
// movement is asserted rather than rediscovered, and so no release claims these fields are inert.
console.log("\n  F — second-order: IRMAA and NIIT move on a tier-crossing household");
{
  const IRM = { currentConv: 250000, taxableInit: 400000, taxYieldPct: 2.0 };
  const w = rowOf(stream("work", 10000), IRM);
  const r = rowOf(stream("rental", 10000), IRM);
  if (POST_FIX) {
    T("F-1: lifetime tax falls when the stream is non-work", r.totTax < w.totTax, `${r.totTax} vs ${w.totTax}`);
    T("F-2: IRMAA RISES — the surcharge is not inert, and not in the same direction as tax",
      r.totIrmaa - w.totIrmaa === 2300, `delta ${r.totIrmaa - w.totIrmaa}`);
    T("F-3: NIIT rises too", r.totNiit - w.totNiit === 48, `delta ${r.totNiit - w.totNiit}`);
    T("F-4: the mechanism is the taxable pool, so IRMAA moves in tiers, not smoothly",
      (r.totIrmaa - w.totIrmaa) % 10 === 0, String(r.totIrmaa - w.totIrmaa));
  } else {
    T("F-1 [PRE-FIX v5.62]: lifetime tax is identical", r.totTax === w.totTax, `${r.totTax} vs ${w.totTax}`);
    T("F-2 [PRE-FIX v5.62]: IRMAA is identical", r.totIrmaa === w.totIrmaa, `${r.totIrmaa} vs ${w.totIrmaa}`);
    T("F-3 [PRE-FIX v5.62]: NIIT is identical", r.totNiit === w.totNiit, `${r.totNiit} vs ${w.totNiit}`);
    T("F-4 [PRE-FIX v5.62]: the whole result set is indistinguishable by stream kind",
      r.estate === w.estate, `${r.estate} vs ${w.estate}`);
  }
}

// ═══ G · INERTNESS CONTROL — the fix must move NOTHING for a household without streams ═══
// Ungated on purpose: this figure is identical on both legs, and that is the claim. If a future
// change makes the two legs disagree here, the fix has stopped being surgical.
console.log("\n  G — a stream-free household is untouched by this release");
{
  const noStream = totTax([]);
  T("G-1: no streams — lifetime tax is the same figure on both legs",
    noStream === 174883, String(noStream));
  T("G-2: and it differs from every stream-bearing reading above (the fixtures are doing work)",
    noStream !== totTax(stream("work"), NO_SECOND_ORDER));
}

console.log(`\nt33 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
