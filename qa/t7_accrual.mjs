// t7 — v5.10 contribution accrual: hand-verified cases, migration parity, round-trip.
// AUTHORED BEFORE THE ENGINE EDITS (scope §6/§8 build order). Expected values computed by hand:
//   couple: A $2,000/mo pre-tax + $500/mo Roth × 4 yrs; B $1,000/mo pre-tax × 6 yrs
//     tradA = 12·2000·4 = $96,000 · rothA = 12·500·4 = $24,000 · tradB = 12·1000·6 = $72,000
//   single-filer: $1,500/mo pre-tax × 3 yrs → tradA = $54,000, B fields = 0
//   already retired (yearsX = 0): all zeros
//   bonus: $20,000 lump, 15% deferral + 6% match → $4,200/yr × yearsA, pre-tax to A
import { __test as T } from "./app_testable.mjs";

let pass = 0, fail = 0;
const ck = (name, actual, expect) => {
  const ok = typeof expect === "number" ? Math.abs(actual - expect) < 1e-6 : actual === expect;
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expect)}`); }
};

// Minimal portfolio factory around the demo shape; asOf pinned so years are exact.
const NOW = new Date().getFullYear();
const mkPortfolio = (over = {}, contrib = {}) => ({
  ...JSON.parse(JSON.stringify(T.PORTFOLIO)),
  asOf: `${NOW}-01-15`,
  single: false,
  retireYear: NOW + 4,
  retireYearB: NOW + 6,
  dobA: { year: 1966, month: 6 }, dobB: { year: 1968, month: 3 },
  lifeExpA: 88, lifeExpB: 90,
  _incomeFromForm: true,
  ...over,
  contributions: { hsaMonthly: 300, allocations: {}, ...contrib },
});

console.log("t7 — HAND-VERIFIED ACCRUAL");

// ── Case 1: the scope's couple, exact dollars ──
T.applyLoadedData({ portfolio: mkPortfolio({}, { contribPreTaxA: 2000, contribRothA: 500, contribPreTaxB: 1000, contribRothB: 0 }), expenses: [], incomeFromForm: true });
{
  const a = T.contribAccrual(NOW + 4);
  ck("couple tradA = $96,000 exactly", a.tradA, 96000);
  ck("couple rothA = $24,000 exactly", a.rothA, 24000);
  ck("couple tradB = $72,000 exactly (B works 6 yrs)", a.tradB, 72000);
  ck("couple rothB = $0", a.rothB, 0);
}

// ── Case 2: single filer ──
T.applyLoadedData({ portfolio: mkPortfolio({ single: true, retireYear: NOW + 3, retireYearB: undefined, nameB: "", dobB: undefined, lifeExpB: undefined }, { contribPreTaxA: 1500, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0 }), expenses: [], incomeFromForm: true });
{
  const a = T.contribAccrual(NOW + 3);
  ck("single tradA = $54,000", a.tradA, 54000);
  ck("single rothA = $0", a.rothA, 0);
  ck("single tradB = $0 (no spouse)", a.tradB, 0);
  ck("single rothB = $0 (no spouse)", a.rothB, 0);
}

// ── Case 3: already retired — zero accrual, retirees see zero change ──
T.applyLoadedData({ portfolio: mkPortfolio({ retireYear: NOW - 1, retireYearB: NOW - 1 }, { contribPreTaxA: 2000, contribRothA: 500, contribPreTaxB: 1000, contribRothB: 250 }), expenses: [], incomeFromForm: true });
{
  const a = T.contribAccrual(NOW - 1);
  ck("retired tradA = 0", a.tradA, 0);
  ck("retired rothA = 0", a.rothA, 0);
  ck("retired tradB = 0", a.tradB, 0);
  ck("retired rothB = 0", a.rothB, 0);
}

// ── Case 4: bonus deferral accrues pre-tax to A (its stated behavior) ──
T.applyLoadedData({ portfolio: mkPortfolio({}, { contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, annualBonus: 20000, bonusDeferralPct: 15, bonusMatchPct: 6 }), expenses: [], incomeFromForm: true });
{
  const a = T.contribAccrual(NOW + 4);
  ck("bonus: tradA = $4,200/yr × 4 = $16,800", a.tradA, 16800);
  ck("bonus: rothA untouched = 0", a.rothA, 0);
  ck("bonus: nothing to B", a.tradB, 0);
}

// ── Case 5: nominal — no growth applied (value is linear in years) ──
T.applyLoadedData({ portfolio: mkPortfolio({ retireYear: NOW + 8, retireYearB: NOW + 8 }, { contribPreTaxA: 2000, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0 }), expenses: [], incomeFromForm: true });
{
  const a8 = T.contribAccrual(NOW + 8);
  ck("nominal dollars: 8 yrs = exactly 2× the 4-yr figure (no compounding)", a8.tradA, 2 * 96000);
}

console.log("\nt7 — MIGRATION & MC SUM-PARITY");

// ── Old backup (v5.9.x shape): monthly401k/spouseBMonthly only → migrates 100% pre-tax ──
const oldStyle = mkPortfolio({}, { monthly401k: 2692, spouseBMonthly: 350 });
delete oldStyle.contributions.contribPreTaxA; // ensure genuinely old shape
T.applyLoadedData({ portfolio: oldStyle, expenses: [], incomeFromForm: true });
{
  const c = T.PORTFOLIO.contributions;
  ck("migration: monthly401k → contribPreTaxA", c.contribPreTaxA, 2692);
  ck("migration: Roth A defaults 0", c.contribRothA, 0);
  ck("migration: spouseBMonthly → contribPreTaxB", c.contribPreTaxB, 350);
  ck("migration: Roth B defaults 0", c.contribRothB, 0);
  // MC parity: the MC reads contributions.monthly401k (+hsa) and .spouseBMonthly. The mirrors
  // must equal the OLD totals exactly, so the accumulation path is byte-identical pre/post.
  ck("MC parity: mirror monthly401k equals old total exactly", c.monthly401k, 2692);
  ck("MC parity: mirror spouseBMonthly equals old total exactly", c.spouseBMonthly, 350);
  ck("migration notice flag set (nonzero carried amounts)", !!T.PORTFOLIO._contribMigrated, true);
}

// ── New-shape backup with a real Roth split: mirrors = sums (v5.9.x runs it) ──
T.applyLoadedData({ portfolio: mkPortfolio({}, { contribPreTaxA: 2000, contribRothA: 500, contribPreTaxB: 1000, contribRothB: 250 }), expenses: [], incomeFromForm: true });
{
  const c = T.PORTFOLIO.contributions;
  ck("forward-compat: mirror monthly401k = preTaxA + rothA", c.monthly401k, 2500);
  ck("forward-compat: mirror spouseBMonthly = preTaxB + rothB", c.spouseBMonthly, 1250);
  ck("no migration notice for new-shape data", !!T.PORTFOLIO._contribMigrated, false);
  // v5.9.x line 1406 computes contributions.monthly401k + contributions.hsaMonthly with no guard:
  ck("v5.9.x read path is finite (monthly401k + hsaMonthly)", Number.isFinite(c.monthly401k + c.hsaMonthly), true);
}

// ── Round-trip: new fields survive a JSON round-trip and re-apply identically ──
{
  const snap = JSON.parse(JSON.stringify(T.PORTFOLIO));
  T.applyLoadedData({ portfolio: snap, expenses: [], incomeFromForm: true });
  const c = T.PORTFOLIO.contributions;
  ck("round-trip: contribPreTaxA survives export/import", c.contribPreTaxA, 2000);
  ck("round-trip: contribRothA survives export/import", c.contribRothA, 500);
  ck("round-trip: contribPreTaxB survives export/import", c.contribPreTaxB, 1000);
  ck("round-trip: contribRothB survives export/import", c.contribRothB, 250);
}

// ── Zero-contribution old backup: migrated, but NO notice (nothing carried over) ──
const zeroOld = mkPortfolio({}, { monthly401k: 0, spouseBMonthly: 0 });
delete zeroOld.contributions.contribPreTaxA;
T.applyLoadedData({ portfolio: zeroOld, expenses: [], incomeFromForm: true });
ck("zero-amount old backup: no migration notice", !!T.PORTFOLIO._contribMigrated, false);

console.log("\nt7 — ENGINE CONSUMPTION (cross-tab agreement at the P level)");

// The four engine construction sites all build tradInitA/B, rothInitA/B as
// (position reduce) + accrual. Reproduce that construction from the same primitives
// and verify the engine helper agrees — the DOM-level agreement is asserted in t8's
// source invariant plus the repo's t4 once re-run there.
T.applyLoadedData({ portfolio: mkPortfolio({}, { contribPreTaxA: 2000, contribRothA: 500, contribPreTaxB: 1000, contribRothB: 0 }), expenses: [], incomeFromForm: true });
{
  const P = T.PORTFOLIO, acc = T.contribAccrual(NOW + 4);
  const base = {
    tradA: (P.positions || []).reduce((s, p) => s + (p.owner === "B" ? 0 : (p.trad || 0)), 0),
    tradB: (P.positions || []).reduce((s, p) => s + (p.owner === "B" ? (p.trad || 0) : 0), 0),
  };
  const rsb = T.retireStartBalances(NOW + 4);
  ck("engine tradInitA = positions + $96,000 accrual", rsb.tradInitA, base.tradA + 96000);
  ck("engine tradInitB = positions + $72,000 accrual", rsb.tradInitB, base.tradB + 72000);
  ck("engine rothInitA = positions-Roth + $24,000 accrual", rsb.rothInitA, (T.PORTFOLIO.positions || []).reduce((x, p) => x + (p.owner === "B" ? 0 : (p.roth || 0)), 0) + 24000);
  ck("pooled tradInit = tradInitA + tradInitB", rsb.tradInit, rsb.tradInitA + rsb.tradInitB);
  ck("accrual figures internally consistent", acc.tradA + acc.tradB, 96000 + 72000);
}

console.log(`\nt7 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
