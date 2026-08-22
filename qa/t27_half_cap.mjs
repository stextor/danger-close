// t27 — §86(a)(1)'s ½-BENEFITS CAP, in the two places that dropped it (v5.45)
// Run: node t27_half_cap.mjs v545   |   node t27_half_cap.mjs v544
//
// ONE DEFECT, TWO PLACES, MIRROR IMAGES.
//   item 4 — Engine B `taxableSSPortion`: middle tier correct, UPPER tier dropped the ½SS half
//            of para1, keeping only the ½(adjbase − base) ceiling.
//   item 7 — the Roth tab: upper tier correct since v5.42, MIDDLE tier capped at 85% of
//            benefits where §86(a)(1) caps at ½.
//
// ⚠ THE BANDS ARE CONTIGUOUS AND NEVER OVERLAP. Swept across benefits × income, not one cell
// diverges in both. Item 7 runs up to the adjusted base amount ($44,000 joint); item 4 starts
// one step above it. A household with small benefits and rising income leaves one defect and
// enters the other AT THAT DOLLAR. Fixing one alone would leave a discontinuity at the
// threshold — a worse artefact than the symmetric error it replaced. §C asserts the absence of
// that discontinuity, and is the check that would have caught a half-done release.
//
// ⚠ NEITHER DEFECT IS REACHABLE FROM THE EXAMPLE HOUSEHOLD. At $55,200 of benefits and at
// $15,600, both diverge in ZERO cells: any joint household at or above $12,000 of benefits is
// outside both bands, because the overall 85%-of-benefits cap binds first ($9,000 single).
// **Assertions on the shipped household prove nothing about this release.** This is the third
// consecutive release with that property — v5.42's defect hid behind a slider default, item 2's
// hides behind a claim date, and these two hide behind benefit size. A FIXTURE IS MANDATORY.
//
// ⚠ PARITY IS NOT THE GUARDRAIL FOR ITEM 4. Patching it moves zero fingerprint keys — but so
// does perturbing `taxableSSPortion`'s return for EVERY input, because `computeTaxPlan` is on no
// fingerprinted path. That was established with a control during scoping. A 9/9 parity result on
// this release is not evidence of containment; THIS SUITE is. Parity covers only item 7, which
// sits in the Roth tab's render block.
//
// PRECISION. Item 4 is asserted DOLLAR-EXACT through `computeTaxPlan` — no DOM, no §M ceiling.
// Item 7's arithmetic is asserted against the same oracle at expression level, with `t1`
// STRUCT S-6 carrying the structural pin; the Roth tab's own render path is component-inline and
// its band is unreachable from any household the ladder can show, so a DOM assertion there would
// be theatre.
//
// HARNESS (t18's verified notes, reused): `computeTaxPlan` reads MODULE GLOBALS. Configure with
// `applyLoadedData({ portfolio: P })` — a WRAPPER — because `setPortfolio` does not rebuild
// PLAN_TIMELINE and the engine reads both. Social Security goes in through
// `incomeSources.ssA.planned` (MONTHLY); setting `.amount` is a silent no-op.
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v545";
const KNOWN_VERSIONS = ["v543", "v544", "v545"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST_FIX = VER === "v545";
const CAND = [join(HERE, "hand_86.mjs"), join(HERE, "tools", "hand_86.mjs")];
const ORACLE = CAND.find(existsSync);
if (!ORACLE) { console.log("t27 SUITE: 0 passed, 1 failed\n  \u2717 \u00a786 oracle not found"); process.exit(1); }
const { statute86 } = await import(pathToFileURL(ORACLE).href);
const MOD = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const G = MOD.__g, E = MOD.__engines;

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
const usd = n => "$" + Math.round(n).toLocaleString();
const T1 = 32000, T2 = 44000;                       // joint pair; the fixture is MFJ

console.log(`t27 \u2014 \u00a786(a)(1) \u00bd-BENEFITS CAP (${VER})\n     oracle: ${ORACLE}\n`);

// ── the two shipped expressions, transcribed verbatim, for the leg that carries them ────
const oldEngineB = (ss, other) => {
  const p = other + 0.5 * ss;
  if (p <= T1) return 0;
  if (p <= T2) return Math.min(0.5 * (p - T1), 0.5 * ss);
  return Math.min(ss * 0.85, 0.5 * Math.min(p - T1, T2 - T1) + 0.85 * (p - T2));
};
const oldRothMid = (ss, other) => {
  const p = other + ss * 0.5;
  if (p > T2 || p <= T1) return null;
  return Math.round(Math.min((p - T1) * 0.5, ss * 0.85));
};
const newRothMid = (ss, other) => {
  const p = other + ss * 0.5;
  if (p > T2 || p <= T1) return null;
  return Math.round(Math.min((p - T1) * 0.5, ss * 0.5));
};

// ── §A · the fixture: benefits small enough for the ½ cap to bind ───────────────────────
// $7,050/yr = $587.50/mo. The sweep put both defects' worst cases at ~$7,000 of benefits.
const SS_MONTHLY = 587.5, SS_ANNUAL = 7050;
T("A-1: the fixture's benefits are inside the affected band (< $12,000 joint)", SS_ANNUAL < 12000);
T("A-2: the EXAMPLE household is outside it \u2014 which is why a fixture is mandatory here",
  55200 >= 12000 && 15600 >= 12000);
T("A-3: at the example household's benefits the two formulas agree, so it can prove nothing",
  Math.round(statute86(55200, 40000, true)) === Math.round(oldEngineB(55200, 40000)));

// ── §B · ITEM 4 through the real engine, DOLLAR-EXACT ───────────────────────────────────
{
  const P = JSON.parse(JSON.stringify(G.PORTFOLIO()));
  const ss = m => ({ tableByAge: { 62: m, 63: m, 64: m, 65: m, 67: m, 70: m }, planned: m, plannedAge: 67 });
  P.incomeSources = { ssA: ss(SS_MONTHLY), ssB: ss(0), pension: { amount: 3600 } };
  G.applyLoadedData({ portfolio: P });                       // WRAPPER — §C trap
  const tl = G.PLAN_TIMELINE();
  const plan = E.computeTaxPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
  const rows = plan.rows || [];
  T("B-1: the engine ran on the fixture and returned rows", rows.length > 0, `${rows.length}`);
  // Every row whose provisional income lands in the upper tier is checked against the statute.
  // Field names verified against a live row, not assumed: the engine reports `ssTotal` and
  // `ssTaxable`, and the "other income" the §86 test uses is what the engine itself passes in —
  // `ordinaryIncome + qdcg_y` at the call site. Reconstructing it from `magi_y` would fold the
  // taxable-SS answer back into its own input.
  let bad = [], checked = 0;
  for (const r of rows) {
    if (r.ssTotal == null || r.ssTaxable == null) continue;
    // ⚠ `ordinaryIncome` does NOT already contain ssTaxable — verified against a live row
    // (pen_y 43,200 → ordinaryIncome 43,200). An earlier version of this line subtracted
    // ssTaxable anyway, which understated `other` by exactly the answer being checked and
    // made the oracle agree with a WRONG engine: negative controls N1 and N3, which revert
    // the two defects outright, passed this suite. A false green, caught only because the
    // controls fired t1 and not t27 and that gap was investigated rather than shrugged at.
    // The call site is `taxableSSPortion(ssTotal, ordinaryIncome + qdcg_y)`, so this mirrors it.
    const other = (r.ordinaryIncome ?? 0) + (r.capGains_y ?? 0) + (r.div_y ?? 0);
    const prov = other + 0.5 * r.ssTotal;
    if (prov <= T2) continue;                                 // item 4's band only
    checked++;
    const want = POST_FIX ? Math.round(statute86(r.ssTotal, other, true)) : Math.round(oldEngineB(r.ssTotal, other));
    if (Math.round(r.ssTaxable) !== want) bad.push(`${r.yr}: want ${usd(want)} got ${usd(r.ssTaxable)}`);
  }
  T(`B-2: every upper-tier row matches the ${POST_FIX ? "\u00a786 statute" : "shipped expression"} TO THE DOLLAR`,
    bad.length === 0, bad.slice(0, 3).join(" | "));
  T("B-3: the fixture actually exercised the upper tier (a zero-row pass would be vacuous)",
    checked > 0, `${checked} rows in band`);
}

// ── §C · CONTINUITY at the adjusted base amount \u2014 the half-done-release check ──────────
// The two bands meet at $44,000. If only one item were fixed, the includible amount would jump
// or drop as provisional income crosses it. Walk across the boundary and require smoothness.
{
  const at = (ss, prov) => {
    const other = prov - 0.5 * ss;
    return prov <= T2 ? (POST_FIX ? newRothMid(ss, other) : oldRothMid(ss, other))
                      : Math.round(POST_FIX ? statute86(ss, other, true) : oldEngineB(ss, other));
  };
  const ss = SS_ANNUAL;
  const below = at(ss, T2 - 1), above = at(ss, T2 + 1);
  T("C-1: the two bands meet at the adjusted base amount and the value is continuous there",
    Math.abs(above - below) <= 2, `${usd(below)} \u2192 ${usd(above)}`);
  // And on the fixed leg both sides must equal the statute; on the prior leg both are wrong,
  // symmetrically, which is why the discontinuity did not exist before either.
  if (POST_FIX) {
    T("C-2: below the boundary the middle tier equals the statute",
      below === Math.round(statute86(ss, T2 - 1 - 0.5 * ss, true)), usd(below));
    T("C-2: above the boundary the upper tier equals the statute",
      above === Math.round(statute86(ss, T2 + 1 - 0.5 * ss, true)), usd(above));
  }
}

// ── §D · the measured bounds, both items, both filing statuses ──────────────────────────
{
  const sweep = (fn, joint) => {
    const [t1, t2] = joint ? [32000, 44000] : [25000, 34000];
    let worst = 0, n = 0;
    for (let ss = 0; ss <= 20000; ss += 25)
      for (let other = 0; other <= 80000; other += 25) {
        const v = fn(ss, other, t1, t2);
        if (v === null) continue;
        const law = Math.round(statute86(ss, other, joint));
        if (Math.round(v) !== law) { n++; worst = Math.max(worst, Math.round(v) - law); }
      }
    return { worst, n };
  };
  const b4 = sweep((ss, o, t1, t2) => {
    const p = o + 0.5 * ss;
    if (p <= t2) return null;
    return Math.min(ss * 0.85, 0.5 * Math.min(p - t1, t2 - t1) + 0.85 * (p - t2));
  }, true);
  const b7 = sweep((ss, o, t1, t2) => {
    const p = o + ss * 0.5;
    if (p > t2 || p <= t1) return null;
    return Math.round(Math.min((p - t1) * 0.5, ss * 0.85));
  }, true);
  T("D-1: item 4's joint overstatement is bounded at $2,463", b4.worst === 2463, usd(b4.worst));
  T("D-2: item 7's joint overstatement is bounded at $2,468", b7.worst === 2468, usd(b7.worst));
  T("D-3: both defects overstate \u2014 the correction runs in the OPTIMISTIC direction",
    b4.worst > 0 && b7.worst > 0);
  // The corrected forms must diverge from the statute NOWHERE.
  if (POST_FIX) {
    const fixed7 = sweep((ss, o, t1, t2) => {
      const p = o + ss * 0.5;
      if (p > t2 || p <= t1) return null;
      return Math.round(Math.min((p - t1) * 0.5, ss * 0.5));
    }, true);
    T("D-4 (V545): the corrected middle tier matches the statute in EVERY cell", fixed7.n === 0, `${fixed7.n} diverging`);
    const fixed4 = sweep((ss, o, t1, t2) => {
      const p = o + 0.5 * ss;
      if (p <= t2) return null;
      const para1 = Math.min(0.5 * ss, 0.5 * (p - t1));
      return Math.min(ss * 0.85, Math.min(para1, 0.5 * (t2 - t1)) + 0.85 * (p - t2));
    }, true);
    T("D-4 (V545): the corrected upper tier matches the statute in EVERY cell", fixed4.n === 0, `${fixed4.n} diverging`);
  }
}

// ── §E · the neighbouring tiers this release must NOT touch ─────────────────────────────
T("E-1: Engine B's MIDDLE tier was already correct and stays correct",
  Math.round(Math.min(0.5 * (38000 - T1), 0.5 * 7050)) === Math.round(statute86(7050, 38000 - 3525, true)));
T("E-2: the Roth tab's UPPER tier was already correct (v5.42) and stays correct",
  (() => { const ss = 7050, other = 60000, p = other + ss * 0.5;
    const para1 = Math.min(ss * 0.5, (p - T1) * 0.5);
    return Math.round(Math.min((p - T2) * 0.85 + Math.min(para1, (T2 - T1) * 0.5), ss * 0.85))
      === Math.round(statute86(ss, other, true)); })());

// ── §F · WHAT THIS SUITE CANNOT WITNESS, stated rather than left as folklore (§B2) ─────
// Of six negative controls, only two fire here; the rest fire t1's STRUCT S-6. That split is
// by design and is recorded so nobody reads it as weak coverage:
//   · N3/N4 (item 7 perturbed) and N5 (Engine B's middle tier perturbed) cannot reach this
//     suite, because item 7's band is unreachable from any household the Roth ladder can
//     render, so its arithmetic is checked here against TRANSCRIBED expressions. A source edit
//     does not move a transcription. t1's structural pin is the coverage, and it fired.
//   · N2 (item 4's ½(adjbase − base) ceiling removed) is a genuine behavioural NO-OP on this
//     fixture: para1 is $3,525 and the ceiling is $6,000, so the ceiling never binds at
//     $7,050 of benefits. It binds only above $12,000 — where the defect itself vanishes.
//     Asserted below so the reasoning is checked rather than remembered.
T("F-1: the ½(adjbase − base) ceiling does NOT bind on this fixture (why N2 is a no-op here)",
  Math.min(0.5 * SS_ANNUAL, 0.5 * (46725 - T1)) < 0.5 * (T2 - T1),
  `para1 ${usd(Math.min(0.5 * SS_ANNUAL, 0.5 * (46725 - T1)))} vs ceiling ${usd(0.5 * (T2 - T1))}`);
T("F-2: it binds only where benefits exceed $12,000 — outside the defect's own band",
  0.5 * 12000 >= 0.5 * (T2 - T1));

console.log(`\nt27 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
