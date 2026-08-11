// t3 — ROTH STRATEGY ENGINE (baseline rebuild, 2026-08).
// Run: node t3_roth.mjs v592 | node t3_roth.mjs v510
// All checks use EXPLICIT hand-built P objects (never the demo portfolio), so they are
// version-neutral by construction: v5.10 changed how P is assembled at call sites, not
// the engine, and t2's fingerprint proves engine identity. This suite tests engine
// BEHAVIOR: tax mechanics, conversion effects, funding modes, ACA, survivor, IRMAA.
let seed = 1;
Math.random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648; // pre-import: d3 captures Math.random at load

const VER = process.argv[2] || "v510";

// ─── v5.22: VERSION-TAG REGISTRY GUARD ───
// An UNREGISTERED tag used to evaluate every ladder below as false and fall off the end of every
// ternary chain, silently running the OLDEST branch: pre-v5.11 expectations and v5.10 version
// strings. That is fail-OPEN — a new build got a WEAKER test, not a stronger one — and it could
// change the CHECK COUNT: with an unregistered tag t3 ran 35 checks instead of 36, and the count is
// the number that goes in the release headline. Registering a new version in the ladders below is
// now mandatory, and an unregistered tag stops the run instead of quietly testing the wrong thing.
const KNOWN_VERSIONS = ["v510", "v5101", "v5102", "v511", "v512", "v513", "v514", "v515", "v516", "v517", "v518", "v519", "v520", "v521", "v522", "v523", "v524"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log("\n  \u2717 FATAL: version tag \"" + VER + "\" is not registered in this suite.");
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to the version ladders in this file BEFORE running.");
  process.exit(1);
}

const m = await import(`./app_${VER}.mjs`);
const g = m.__g;

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
};

const baseP = () => ({
  single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2058,
  ladderEnd: 2037, ladderEndA: 2037, ladderEndB: 2039,
  dobAYr: 1964, dobBYr: 1966, deathYr1: 2052, survivor: "B",
  ssA: 2800, ssB: 1400, ssAYr: 2031, ssAMo: 3, ssBYr: 2033, ssBMo: 6,
  pen: 800, stateRate: 0.04, stateCode: "GA",
  convTaxFunding: "taxable", taxableGainFrac: 0.5,
  acaPremium: 0, acaSize: 0, taxYieldPct: 1.5, currentConv: 70000,
  tradInit: 1000000, rothInit: 200000,
  tradInitA: 600000, tradInitB: 400000, rothInitA: 150000, rothInitB: 50000,
  taxableInit: 300000,
});

console.log(`t3 — ROTH STRATEGY ENGINE (${VER})`);

// ═══ Strategy set & result contract ═══
{
  const res = g.runRothStrategies(baseP());
  T("SET: six standard strategies", res.length === 6, String(res.length));
  T("SET: keys stable", ["none", "fill12", "fill22", "fill24", "irmaa1", "current"].every(k => res.some(r => r.key === k)));
  T("SET: slider strategy labeled with its amount", /\$70K/.test(res.find(r => r.key === "current").label));
  const fields = ["totTax", "totIrmaa", "totNiit", "widowTax", "totConv", "endTrad", "endRoth", "endTaxable", "estate"];
  T("SET: every strategy carries the full field contract", res.every(r => fields.every(f => Number.isFinite(r[f]))));
  T("SET: per-person end balances sum to household", res.every(r =>
    Math.abs((r.endTradA + r.endTradB) - r.endTrad) < 1 && Math.abs((r.endRothA + r.endRothB) - r.endRoth) < 1));
  T("SET: wealth series present for every strategy", res.every(r => r.wealthByYr && Object.keys(r.wealthByYr).length > 20));
  T("SET: wealth series finite everywhere", res.every(r => Object.values(r.wealthByYr).every(Number.isFinite)));
}

// ═══ Conversion mechanics ═══
{
  const res = g.runRothStrategies(baseP());
  const none = res.find(r => r.key === "none"), cur = res.find(r => r.key === "current");
  T("CONV: no-conversion strategy converts $0", none.totConv === 0);
  T("CONV: slider strategy converts 70K x ladder years (±1yr tolerance)",
    Math.abs(cur.totConv - 70000 * 13) <= 70000, String(cur.totConv));
  T("CONV: conversions drain Traditional vs none", cur.endTrad < none.endTrad);
  T("CONV: conversions grow Roth vs none", cur.endRoth > none.endRoth);
  T("CONV: converting costs tax during the ladder (totTax structure sane)", cur.totTax > 0 && none.totTax > 0);
  T("CONV: conversions shrink the widow-year tax burden", cur.widowTax < none.widowTax, `${Math.round(cur.widowTax)} vs ${Math.round(none.widowTax)}`);
  T("CONV: RMD forcing shows up — 'none' still pays substantial lifetime tax", none.totTax > 100000, String(Math.round(none.totTax)));
  // Zero-amount slider degenerates to the none path
  const P0 = { ...baseP(), currentConv: 0 };
  const r0 = g.runRothStrategies(P0);
  const cur0 = r0.find(r => r.key === "current"), none0 = r0.find(r => r.key === "none");
  T("CONV: $0 slider ≡ no-conversions (estate)", Math.abs(cur0.estate - none0.estate) < 1, `${Math.round(cur0.estate)} vs ${Math.round(none0.estate)}`);
  T("CONV: $0 slider ≡ no-conversions (lifetime tax)", Math.abs(cur0.totTax - none0.totTax) < 1);
}

// ═══ Conversion-tax funding modes ═══
{
  const rTax = g.runRothStrategies({ ...baseP() }).find(r => r.key === "current");
  const rWith = g.runRothStrategies({ ...baseP(), convTaxFunding: "withhold" }).find(r => r.key === "current");
  T("FUND: withholding leaves a smaller Roth than outside-funds", rWith.endRoth < rTax.endRoth, `${Math.round(rWith.endRoth)} vs ${Math.round(rTax.endRoth)}`);
  T("FUND: outside-funds drains taxable faster than withholding", rTax.endTaxable < rWith.endTaxable);
  const rGain = g.runRothStrategies({ ...baseP(), taxableGainFrac: 0.9 }).find(r => r.key === "current");
  T("FUND: higher embedded gains → more lifetime tax (gross-up mechanics live)", rGain.totTax >= rTax.totTax, `${Math.round(rGain.totTax)} vs ${Math.round(rTax.totTax)}`);
}

// ═══ ACA bridge ═══
{
  const noAca = g.runRothStrategies(baseP());
  T("ACA: no premium → no subsidy modeling, no cliff strategy", noAca.length === 6 && noAca.every(r => r.totAcaLoss === 0));
  const withAca = g.runRothStrategies({ ...baseP(), acaPremium: 1800, acaSize: 2 });
  T("ACA: premium set → cliff strategy appears", withAca.some(r => /aca/i.test(r.key)), withAca.map(r => r.key).join(","));
  const curAca = withAca.find(r => r.key === "current");
  T("ACA: converting through bridge years forfeits subsidy (totAcaLoss > 0)", curAca.totAcaLoss > 0, String(Math.round(curAca.totAcaLoss)));
  const noneAca = withAca.find(r => r.key === "none");
  T("ACA: not converting forfeits less subsidy than converting", noneAca.totAcaLoss <= curAca.totAcaLoss);
  // The cliff strategy converts UP TO the cliff, so vs a small slider it can lose MORE
  // partial subsidy — its guarantee is never triggering the full forfeit. That guarantee
  // only holds when paying the conversion tax creates no MAGI: test under withholding.
  const bigSlider = g.runRothStrategies({ ...baseP(), acaPremium: 1800, acaSize: 2, currentConv: 250000, convTaxFunding: "withhold" });
  const cliff = bigSlider.find(r => r.key === "acaCliff");
  const naiveBig = bigSlider.find(r => r.key === "current");
  T("ACA: cliff strategy preserves partial subsidy under gain-free funding", Object.values(cliff.acaSubByYr).some(v => v > 0), JSON.stringify(cliff.acaSubByYr));
  T("ACA: cliff strategy beats a cliff-crossing slider (gain-free funding)", cliff.totAcaLoss < naiveBig.totAcaLoss, `${Math.round(cliff.totAcaLoss)} vs ${Math.round(naiveBig.totAcaLoss)}`);
  // ── KNOWN DEFECT PIN (pre-existing; present in v5.9.2 and v5.10 identically) ──
  // When conversion tax is funded by selling APPRECIATED brokerage (taxableGainFrac > 0),
  // the sale's realized gains feed ACA MAGI, but the cliff solver does not shrink its
  // bridge-year conversion to leave headroom for its own funding sale — so the household
  // is pushed over the very cliff the strategy exists to stay under and forfeits the
  // FULL subsidy. Found 2026-08-06 by this suite. This check pins today's behavior so
  // the defect is visible; when the solver is fixed, flip the expectation.
  const gainyRun = g.runRothStrategies({ ...baseP(), acaPremium: 1800, acaSize: 2, currentConv: 250000 });
  const gainy = gainyRun.find(r => r.key === "acaCliff");
  if (VER === "v5101" || VER === "v5102" || VER === "v511" || VER === "v512" || VER === "v513" || VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524") { // fixed at v5.10.1; holds for all later builds
    // ── FIXED in v5.10.1: the cliff solver now nets out the MAGI its own funding sale
    // realizes (fixed-point mirroring the funding gross-up), so under appreciated-sale
    // funding the strategy preserves a partial subsidy and beats a cliff-crossing
    // slider instead of matching its full forfeit. Prior legs keep the dated pin below
    // as frozen history (found 2026-08-06; fixed 2026-08-06, v5.10.1). ──
    const naiveGainy = gainyRun.find(r => r.key === "current");
    T("ACA: cliff solver nets out its own funding-sale gains (partial subsidy preserved)",
      Object.values(gainy.acaSubByYr).some(v => v > 0), JSON.stringify(gainy.acaSubByYr));
    T("ACA: cliff strategy beats a cliff-crossing slider under appreciated-sale funding",
      gainy.totAcaLoss <= naiveGainy.totAcaLoss, `${Math.round(gainy.totAcaLoss)} vs ${Math.round(naiveGainy.totAcaLoss)}`);
  } else {
    T("ACA [KNOWN DEFECT]: appreciated-sale funding pushes the cliff solver over its own cliff (full forfeit — fixed in v5.10.1; pre-fix state pinned here)",
      Object.values(gainy.acaSubByYr).every(v => v === 0) && gainy.totAcaLoss > cliff.totAcaLoss,
      JSON.stringify(gainy.acaSubByYr));
  }
}

// ═══ IRMAA ═══
{
  // A large-conversion household should trip IRMAA tiers; verify surcharges accrue and scale.
  const big = g.runRothStrategies({ ...baseP(), tradInit: 3000000, tradInitA: 2000000, tradInitB: 1000000, currentConv: 300000 });
  const bigCur = big.find(r => r.key === "current"), bigNone = big.find(r => r.key === "none");
  T("IRMAA: heavy conversions incur surcharges", bigCur.totIrmaa > 0, String(Math.round(bigCur.totIrmaa)));
  T("IRMAA: RMD-heavy 'none' also incurs surcharges at this scale", bigNone.totIrmaa > 0);
}

// ═══ Single-filer branch ═══
{
  const PS = { ...baseP(), single: true, ssB: 0, deathYr1: Infinity, survivor: "A", tradInitB: 0, rothInitB: 0, tradInitA: 1000000, rothInitA: 200000 };
  const res = g.runRothStrategies(PS);
  T("SINGLE: engine runs and returns the strategy set", res.length >= 5);
  T("SINGLE: no widow-penalty component (widowTax = 0)", res.every(r => r.widowTax === 0), res.map(r => Math.round(r.widowTax)).join(","));
  T("SINGLE: B-side balances stay empty", res.every(r => r.endTradB === 0 && r.endRothB === 0));
  const none = res.find(r => r.key === "none"), cur = res.find(r => r.key === "current");
  T("SINGLE: conversion mechanics still work", cur.endTrad < none.endTrad && cur.endRoth > none.endRoth);
}

// ═══ Wealth-crossover raw material (v5.7.1 break-even mechanics) ═══
{
  const res = g.runRothStrategies(baseP());
  const cur = res.find(r => r.key === "current"), none = res.find(r => r.key === "none");
  const yrs = Object.keys(cur.wealthByYr).map(Number).sort((a, b) => a - b);
  T("XOVER: wealth series aligned between strategies", yrs.every(y => none.wealthByYr[y] !== undefined));
  const early = yrs[1], late = yrs[yrs.length - 1];
  T("XOVER: converting lags early (tax paid up front)", cur.wealthByYr[early] <= none.wealthByYr[early], `${Math.round(cur.wealthByYr[early])} vs ${Math.round(none.wealthByYr[early])}`);
  T("XOVER: strategies diverge by horizon (the comparison is non-trivial)", Math.abs(cur.wealthByYr[late] - none.wealthByYr[late]) > 1000);
}

console.log(`\nt3 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
