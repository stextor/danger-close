// t15 — ENGINE A DEATH-YEAR FILING STATUS (audit finding C-2C-6, fixed at v5.14).
//
// Through v5.13 the Roth strategy engine derived filing status from a single flag:
//
//     const widowed   = !P.single && yr >= P.deathYr1;
//     const effSingle = P.single || widowed;          // ONE flag doing TWO jobs
//
// so a survivor was filed Single for the WHOLE year of death. IRS Pub. 501 treats the survivor as
// married for that entire year, with Single beginning the year after — which Engines B (v5.12) and
// C (v5.13) already did. Engine A was the last engine on the old rule, and the v5.12/v5.13
// corrections therefore CREATED a cross-engine divergence: the same household, in the same year,
// filed two different ways depending on which tab you opened.
//
// WHY THIS SUITE IS DOLLAR-EXACT AND THE OTHER SURVIVOR SUITES ARE NOT. Engine A is module-level, so
// the harness reaches `runRothStrategies` directly rather than through rendered DOM. t11/t12/t13 are
// stuck at +/-$500 by the render ceiling (OPERATIONS §M); this one is exact to the dollar, and the
// expectations below are hand-computed from the bracket tables rather than read back from the engine.
//
// THE ISOLATION. Social Security is set to $0 and Traditional balances to $0 in every case, so
// neither the survivor SS rule nor the spousal rollover — both correctly keyed to `widowed`, both
// asserted elsewhere — can move the result. Income is pension-only. The ONLY thing under test is
// which filing status the death year receives.
//
// NEGATIVE CONTROL — run against pre-fix v5.13, 2026-08-09:
//   income tax, death year:  $100K pension 8,744 vs 5,207 correct   (over-taxed 3,537)
//                            $150K pension 19,744 vs 11,207          (over-taxed 8,537)
//                            $300K pension 55,207 vs 39,740          (over-taxed 15,467)
//   8 of 11 assertions fail on v5.13. The THREE that pass are named here rather than counted as wins:
//     case 2 (both) — "the year after the death is Single" was true pre-fix too, because pre-fix
//       EVERY year from the death onward was Single. Right answer, wrong reason. It earns its place
//       as the other half of the boundary: without it, a fix could file MFJ forever and still pass.
//     case 3 — "identical whichever spouse survives" also held pre-fix (both were Single). It pins
//       that the fix did not accidentally key filing status to survivor identity.
//   One honesty note on case 5: it DOES fail pre-fix, but not cleanly. Pre-fix the death year is
//   filed Single, and that tax increase swamps the Social Security reduction it is trying to isolate,
//   so the comparison comes out the wrong way for a reason unrelated to what the case is guarding.
//   Its real job is forward-looking — it fails loudly if a future edit moves the SS rule off
//   `widowed` and onto the filing flag.
//
// A DIRECTION SUBTLETY WORTH KEEPING. The defect ran conservative on income tax at every income
// level, but its IRMAA half did NOT: `effSingle` both narrows the thresholds (raising the tier) and
// halves the person count (lowering the charge). Below ~$500K MAGI the threshold effect dominates and
// the death year is over-charged; once both filing statuses reach the TOP tier the threshold effect
// saturates and only the halving remains, so the death year was UNDER-charged. Measured pre-fix:
// -$5,780 at $700K MAGI and -$6,940 at $1.2M. Case 4 pins that boundary so a future change cannot
// quietly reintroduce the optimistic half.
//
// Run: node t15_engineA_death_filing.mjs [version-tag]
//   With no argument it tests app_testable.mjs — the copy of the CURRENT leg made during
//   setup — which is how t7 and t8 resolve their build. That is deliberate: a hardcoded
//   default tag rots. This file used to default to "v514", and once that leg stopped being
//   built the suite died with ERR_MODULE_NOT_FOUND. Worse would have been surviving: had the
//   default been bumped each release instead, it would keep resolving LAST release's bundle,
//   pass green, and quietly stop testing the build it was supposed to be guarding.
//   An explicit tag still works, and is how a frozen prior leg is driven for negative controls.
const VER = process.argv[2] || null;
const g = (await import(VER ? `./app_${VER}.mjs` : "./app_testable.mjs")).__g;
g.setPortfolio({ positions: [], stateCode: null,
  incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });

let pass = 0, fail = 0; const fails = [];
const T = (name, got, exp, tol = 0) => {
  const ok = Math.abs(got - exp) <= tol;
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; const m = `  \u2717 ${name}: got ${got} exp ${exp} \u0394 ${got - exp}`; console.log(m); fails.push(m); }
};
const CK = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; const m = `  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`; console.log(m); fails.push(m); }
};

console.log("t15 \u2014 ENGINE A DEATH-YEAR FILING (C-2C-6 extinction invariant, dollar-exact)");

// ── Independent 2026 reference, from IRS Rev. Proc. 2025-32 — NOT read from the app ──
const STD = { S: 16100, M: 32200 }, SR = { S: 2050, M: 1650 };
const BR = {
  S: [[0.10,12400],[0.12,50400],[0.22,105700],[0.24,201775],[0.32,256225],[0.35,640600],[0.37,Infinity]],
  M: [[0.10,24800],[0.12,100800],[0.22,211400],[0.24,403550],[0.32,512450],[0.35,768700],[0.37,Infinity]] };
const fedRef = (ti, st) => { if (ti <= 0) return 0; let tax = 0, prev = 0;
  for (const [r, u] of BR[st]) { const s = Math.min(ti, u) - prev; if (s > 0) tax += s * r; prev = u; if (ti <= u) break; } return tax; };

const DEATH = 2044;
const base = (o = {}) => ({ single: false, asOfYr: 2026, retireYr: DEATH, horizonYr: DEATH,
  ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1966, dobBYr: 1966, survivor: "A", deathYr1: DEATH,
  ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0,
  acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const run = (P) => g.runRothStrategies(P).find(r => r.key === "none");
const infl = (b, yr) => b * Math.pow(1.02, yr - 2026);

// Both spouses are 65+ in 2044 (born 1966 => age 78), so MFJ gets two senior deductions and
// Single gets one. Deductions inflate at 2%/yr like the brackets.
const dedFor = (st, yr) => Math.round(infl(STD[st], yr)) + (st === "M" ? 2 * Math.round(infl(SR.M, yr)) : Math.round(infl(SR.S, yr)));

// ── CASE 1 — the death year is filed MFJ (the fix), dollar-exact against hand-computed brackets ──
console.log("\n  case 1 \u2014 the death year itself (Pub. 501: joint return permitted)");
for (const annual of [100000, 150000, 200000, 300000]) {
  const got = run(base({ pen: annual / 12 })).totTax;
  const tiM = Math.max(0, annual - dedFor("M", DEATH));
  const expM = Math.round(fedRef(tiM, "M") * Math.pow(1.02, 0)); // brackets already inflated below
  // brackets inflate too, so compute against inflated brackets rather than 2026 ones:
  const inflBR = BR.M.map(([r, u]) => [r, u === Infinity ? Infinity : Math.round(infl(u, DEATH))]);
  const fedInfl = (ti) => { let tax = 0, prev = 0; for (const [r, u] of inflBR) { const s = Math.min(ti, u) - prev; if (s > 0) tax += s * r; prev = u; if (ti <= u) break; } return tax; };
  T(`[EXTINCTION] pension $${annual}: death year taxed as MFJ`, got, Math.round(fedInfl(tiM)), 1);
}

// ── CASE 2 — the year AFTER the death is filed Single ──
console.log("\n  case 2 \u2014 the year after the death (Single begins)");
{
  const YR = DEATH + 1;
  const inflBRS = BR.S.map(([r, u]) => [r, u === Infinity ? Infinity : Math.round(infl(u, YR))]);
  const fedInflS = (ti) => { let tax = 0, prev = 0; for (const [r, u] of inflBRS) { const s = Math.min(ti, u) - prev; if (s > 0) tax += s * r; prev = u; if (ti <= u) break; } return tax; };
  for (const annual of [100000, 200000]) {
    const got = run(base({ pen: annual / 12, retireYr: YR, horizonYr: YR })).totTax;
    const tiS = Math.max(0, annual - dedFor("S", YR));
    T(`[EXTINCTION] pension $${annual}: year after death taxed as Single`, got, Math.round(fedInflS(tiS)), 1);
  }
}

// ── CASE 3 — both directions: which spouse dies must not change the death-year treatment ──
console.log("\n  case 3 \u2014 both direction configurations");
{
  const a = run(base({ pen: 150000 / 12, survivor: "A" })).totTax;
  const b = run(base({ pen: 150000 / 12, survivor: "B" })).totTax;
  CK("[EXTINCTION] death-year tax is identical whichever spouse survives", a === b, `A-survives ${a} vs B-survives ${b}`);
  // NOT DISCRIMINATING on its own: it also held pre-fix, where both were Single. It earns its place
  // by pinning that the fix did not accidentally key filing status to survivor identity.
}

// ── CASE 4 — the IRMAA half, including the tier where the defect ran NON-conservative ──
console.log("\n  case 4 \u2014 IRMAA in the death year (person count follows the death, D-3)");
{
  // Window 2042..2044 so the 2044 premium year has its lookback MAGI. Both spouses alive in the
  // death year, so BOTH are billed a premium — matching Engine C's premium-year rule.
  const P = (magi, o = {}) => base({ retireYr: 2042, horizonYr: 2044, pen: magi / 12, ...o });
  // $400K sits in MFJ tier 2 at premium year 2044, so the per-person multiply is visible:
  // two people => 2 x 2,880. Pre-fix this row was scored Single at ONE person (tier 4 => 6,360).
  const twoPeople = run(P(400000)).totIrmaa;
  CK("[EXTINCTION] the death year bills TWO people (both alive in the premium year)",
    twoPeople === 5760, `totIrmaa ${twoPeople}, expected 2 x 2,880 = 5,760 (pre-fix 6,360 at one person)`);
  // Pre-fix this row was scored against SINGLE thresholds at ONE person. Post-fix: MFJ thresholds,
  // two people. At $200K MAGI, MFJ tier 0 => $0 surcharge.
  T("[EXTINCTION] $200K MAGI in the death year: MFJ tier 0, no surcharge (pre-fix charged 2,880)",
    run(P(200000)).totIrmaa, 0);
  // The non-conservative corner: very high MAGI, where pre-fix the halved person count outlived the
  // narrowed thresholds and the death year was UNDER-charged.
  const hi = run(P(1200000)).totIrmaa;
  CK("[EXTINCTION] $1.2M MAGI in the death year bills two people, not one (the optimistic corner)",
    hi >= 13000, `totIrmaa ${hi} — pre-fix billed one person (6,940)`);
}

// ── CASE 5 — the death event itself must NOT have moved ──
console.log("\n  case 5 \u2014 the death event is untouched (SS + rollover stay on `widowed`)");
{
  // With real Social Security, the survivor keeps only the larger check FROM THE DEATH YEAR. If the
  // fix had moved the SS rule onto the filing flag, the death year would pay both checks.
  // Pension alongside SS so the provisional-income test actually bites; without other income the
  // whole benefit is untaxed and both runs return $0, which would prove nothing.
  const withSS = (dy) => run(base({ pen: 100000 / 12, ssA: 3000, ssB: 1000, ssAYr: 2030, ssBYr: 2030,
    deathYr1: dy })).totTax;
  const died = withSS(DEATH), alive = withSS(DEATH + 1);
  CK("[EXTINCTION] SS still drops in the DEATH year, not the year after",
    died < alive, `death-year tax ${died} vs both-alive ${alive} (lower = one check only)`);
}

console.log(`\nt15 SUITE: ${pass} passed, ${fail} failed`);
if (fails.length) console.log(fails.join("\n"));
process.exit(fail ? 1 : 0);
