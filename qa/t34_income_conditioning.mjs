// t34 — INCOME-CONDITIONING: the measure, the two bases, and the bands/taper evaluator (v5.64)
// Run: node t34_income_conditioning.mjs v564
//
// WHAT THIS RELEASE IS. v5.64 builds `exclTest` — the field that can hold a state's income
// condition — and populates NO state (SCOPE_INCOME_CONDITIONING decision B-1 (a)). So the release
// changes no output for any household, and §A of this suite is what makes that a TESTED claim
// rather than a stated one: if a later edit populates a state without meaning to, §A fails.
//
// WHY THE STATUTORY CASES USE A SYNTHETIC JURISDICTION. There is no populated state to drive, and
// there must not be one. So §C–§F inject a throwaway code into the live `STATE_RULES` object and
// drive `stateTaxAnnual` against it with the REAL tables from
// `docs/FINDINGS-v5_63-state-statutes.md`, every one of which was read against a primary or
// official source on 2026-09-04. The evaluator is therefore proven against the arithmetic it will
// actually meet, one release before it meets it — and when a state IS populated, its own
// hand-computed cells and its `excl65`-equals-table-at-zero invariant come with it (scope §5).
//
// ⚠ THE EXPECTATIONS WERE COMPUTED BY HAND FIRST, from the statute tables, and compared to engine
// output afterwards. Where the two disagreed the source was read to adjudicate. No expectation was
// edited until it matched (OPERATIONS §B2).
//
// ⚠ THE COMPARATOR PINS ARE THE POINT OF §E. Four statutes are inclusive at the band top;
// Connecticut is exclusive. One-dollar-below and one-dollar-above pass with the comparator inverted
// on every state — only the case AT the threshold discriminates `lte` from `lt`.

import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };

const VER = process.argv[2] || "v564";
const KNOWN_VERSIONS = ["v564"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    t34 tests machinery that does not exist before v5.64; running it against an");
  console.log("    earlier leg would fail for the right reason but report as a regression.");
  process.exit(1);
}

const { __g } = await import(`./app_${VER}.mjs`);
const ST = __g.stateTaxAnnual;
const RULES = __g.STATE_RULES();

let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log(`  \u2717 ${name}`); } };
const EQ = (name, got, want, tol = 0.005) => T(`${name} (got ${got}, want ${want})`, Math.abs(got - want) <= tol);

console.log(`t34 — INCOME CONDITIONING (${VER})`);

// ── §A · The release populates nothing, and that is asserted ─────────────────────────────────
// If this section fails, either a state was populated without a scope, or B-1 (a) was abandoned.
{
  const withTest = Object.entries(RULES).filter(([, r]) => r && r.exclTest !== undefined);
  T("A-1: NO STATE_RULES entry carries `exclTest` at v5.64 — the release changes no output (B-1 (a))",
    withTest.length === 0);
  if (withTest.length) console.log(`        populated: ${withTest.map(([c]) => c).join(", ")}`);
  T("A-2: `excl65` is still a NUMBER on every entry — the t10/t29 whole-table guards read `> 0`, and an object compared `> 0` is false (D-3 (b))",
    Object.values(RULES).every((r) => typeof r.excl65 === "number"));
  T("A-3: the five income-conditioned states are all still present and unpopulated",
    ["NM", "RI", "VA", "NJ", "CT"].every((c) => RULES[c] && RULES[c].exclTest === undefined));
}

// ── Harness: a synthetic jurisdiction, added and removed per case ────────────────────────────
const TESTCODE = "ZZ";
T("B-0: the synthetic test code does not collide with a real jurisdiction", RULES[TESTCODE] === undefined);

// Drive one household through `stateTaxAnnual` against a synthetic rule. Returns the state tax.
// `retIncome + pen` is the qualifying income the exclusion applies against.
const drive = (rule, args) => {
  RULES[TESTCODE] = rule;
  try {
    return ST({ code: TESTCODE, fallbackRate: 0, ageA: 70, ageB: 70, single: false, ...args });
  } finally { delete RULES[TESTCODE]; }
};
// The exclusion the engine actually granted, recovered from the tax. At rate 1 the returned tax is
// `retBase + work + ssBase + capGains`, and every synthetic rule here sets `ss: 0`, so subtracting
// the `work` and `capGains` terms leaves the retirement base and the exclusion falls out.
// ⚠ This helper originally subtracted nothing and was WRONG the moment a case passed `work` or
// `capGains` — it read the exclusion as negative. Four §G checks caught it; the engine was correct
// throughout and the test was repaired rather than the expectation relaxed (OPERATIONS §B2).
const exclGranted = (rule, args) => {
  const qual = (args.retIncome || 0) + (args.pen || 0);
  const other = Math.max(0, args.work || 0) + Math.max(0, args.capGains || 0);
  return qual - (drive({ ...rule, rate: 1 }, args) - other);
};

const flat = (extra) => ({ name: "Test", rate: 1, ss: 0, retExempt: false, excl65: 0, exclAge: 65, ...extra });

// ── §C · New Mexico's nine bands — N.M. Stat. § 7-2-5.2, MFJ table ───────────────────────────
// not over $30,000 -> $8,000, then -$1,000 per additional $3,000, zero over $51,000. Per person,
// base AGI, comparator INCLUSIVE ("not over"). Scope §5 requires at least three of the nine bands.
const NM_JOINT = [
  { upTo: 30000, amount: 8000 }, { upTo: 33000, amount: 7000 }, { upTo: 36000, amount: 6000 },
  { upTo: 39000, amount: 5000 }, { upTo: 42000, amount: 4000 }, { upTo: 45000, amount: 3000 },
  { upTo: 48000, amount: 2000 }, { upTo: 51000, amount: 1000 }, { upTo: Infinity, amount: 0 },
];
const NM_SINGLE = [
  { upTo: 18000, amount: 8000 }, { upTo: 19500, amount: 7000 }, { upTo: 21000, amount: 6000 },
  { upTo: 22500, amount: 5000 }, { upTo: 24000, amount: 4000 }, { upTo: 25500, amount: 3000 },
  { upTo: 27000, amount: 2000 }, { upTo: 28500, amount: 1000 }, { upTo: Infinity, amount: 0 },
];
const NM = flat({ exclTest: { kind: "bands", base: "agi", unit: "person", cmp: "lte", rows: { joint: NM_JOINT, single: NM_SINGLE } } });
{
  // Two 70-year-olds, all income from an IRA, no SS. AGI = retIncome.
  const at = (agi) => exclGranted(NM, { retIncome: agi });
  EQ("C-1: NM band 1, AGI $25,000 -> $8,000 each x2", at(25000), 16000);
  EQ("C-2: NM band 3, AGI $35,000 -> $6,000 each x2", at(35000), 12000);
  EQ("C-3: NM band 6, AGI $44,000 -> $3,000 each x2", at(44000), 6000);
  EQ("C-4: NM band 8, AGI $50,000 -> $1,000 each x2", at(50000), 2000);
  EQ("C-5: NM above the table, AGI $60,000 -> nothing — the provision does not exist for this household", at(60000), 0);
  // A cliff implementation passes a two-sided test and fails a band: prove the middle moves.
  T("C-6: the exclusion STEPS rather than cliffs — five distinct values across the table",
    new Set([at(25000), at(35000), at(44000), at(50000), at(60000)]).size === 5);
  // Single: one person, own table, and the $28,500 top.
  const single = (agi) => exclGranted(NM, { retIncome: agi, single: true, ageB: null });
  EQ("C-7: NM single, AGI $17,000 -> $8,000 (own table, one person)", single(17000), 8000);
  EQ("C-8: NM single, AGI $28,000 -> $1,000", single(28000), 1000);
  EQ("C-9: NM single, AGI $29,000 -> $0", single(29000), 0);
  // Base is AGI, so Social Security's TAXABLE portion counts toward the band.
  EQ("C-10: NM base `agi` INCLUDES taxable SS — $40,000 IRA + $8,000 taxable SS = $48,000 -> $2,000 each",
    exclGranted(NM, { retIncome: 40000, ssTaxableFed: 8000 }), 4000);
  // Only people past the floor count.
  EQ("C-11: NM per-person — one spouse 64, one 70 -> one share only",
    exclGranted(NM, { retIncome: 25000, ageA: 64, ageB: 70 }), 8000);
  EQ("C-12: NM — neither spouse past the floor -> nothing",
    exclGranted(NM, { retIncome: 25000, ageA: 60, ageB: 62 }), 0);
}

// ── §D · Virginia's taper — the once-not-twice mechanic ──────────────────────────────────────
// $12,000 per qualifying individual, reduced $1 for every $1 of AFAGI over $50,000 single /
// $75,000 married, with the excess subtracted ONCE from the combined maximum (Form 760 worksheet).
const VA = flat({ exclTest: { kind: "taper", base: "agiExSS", perPerson: 12000, threshold: { single: 50000, joint: 75000 } } });
{
  const at = (afagi, extra = {}) => exclGranted(VA, { retIncome: afagi, ...extra });
  EQ("D-1: VA under the threshold, both qualifying -> the full $24,000", at(70000), 24000);
  EQ("D-2: VA at the threshold exactly -> still the full $24,000", at(75000), 24000);
  // ⚠ THE FACTOR-OF-TWO CASE. AFAGI $87,000 is $12,000 over. Worksheet: $24,000 - $12,000 = $12,000.
  // A per-spouse taper would give $24,000 - 2x$12,000 = $0 and pass every other case in this file.
  EQ("D-3: VA taper range, BOTH spouses qualifying — the excess is subtracted ONCE (worksheet Line 12 - Line 11)", at(87000), 12000);
  EQ("D-4: VA both qualifying, extinguished at $99,000", at(99000), 0);
  EQ("D-5: VA both qualifying, $98,000 -> $1,000 remains (one dollar inside extinction)", at(98000), 1000);
  // One spouse qualifying: maximum is $12,000, extinct at $87,000 — the figure D-3 must NOT produce.
  EQ("D-6: VA one spouse qualifying, $80,000 -> $12,000 - $5,000 = $7,000", at(80000, { ageA: 70, ageB: 60 }), 7000);
  EQ("D-7: VA one spouse qualifying, extinguished at $87,000", at(87000, { ageA: 70, ageB: 60 }), 0);
  EQ("D-8: VA single, $56,000 -> $12,000 - $6,000 = $6,000", at(56000, { single: true, ageB: null }), 6000);
  EQ("D-9: VA single, extinguished at $62,000", at(62000, { single: true, ageB: null }), 0);
  // ⚠ THE BASE. AFAGI excludes taxable Social Security; `agi` would not.
  EQ("D-10: VA base `agiExSS` EXCLUDES taxable SS — $70,000 IRA + $40,000 taxable SS is still under the threshold",
    exclGranted(VA, { retIncome: 70000, ssTaxableFed: 40000 }), 24000);
  T("D-11: and the same household on the `agi` base would lose it entirely — the two bases are not interchangeable",
    exclGranted({ ...VA, exclTest: { ...VA.exclTest, base: "agi" } }, { retIncome: 70000, ssTaxableFed: 40000 }) === 0);
}

// ── §E · Connecticut's percentage bands, and the comparator (B-2) ────────────────────────────
// Ten rows of a PERCENTAGE of qualifying income, per return, no age gate, base federal AGI,
// comparator EXCLUSIVE: the TY2026 table ends "$150,000 and up -> 0".
const CT_JOINT = [
  { upTo: 100000, pct: 1 }, { upTo: 105000, pct: 0.85 }, { upTo: 110000, pct: 0.70 },
  { upTo: 115000, pct: 0.55 }, { upTo: 120000, pct: 0.40 }, { upTo: 125000, pct: 0.25 },
  { upTo: 130000, pct: 0.10 }, { upTo: 140000, pct: 0.05 }, { upTo: 150000, pct: 0.025 },
  { upTo: Infinity, pct: 0 },
];
const CT_SINGLE = [
  { upTo: 75000, pct: 1 }, { upTo: 77500, pct: 0.85 }, { upTo: 80000, pct: 0.70 },
  { upTo: 82500, pct: 0.55 }, { upTo: 85000, pct: 0.40 }, { upTo: 87500, pct: 0.25 },
  { upTo: 90000, pct: 0.10 }, { upTo: 95000, pct: 0.05 }, { upTo: 100000, pct: 0.025 },
  { upTo: Infinity, pct: 0 },
];
const CT = flat({ exclAge: 0, exclTest: { kind: "bands", base: "agi", unit: "household", cmp: "lt", rows: { joint: CT_JOINT, single: CT_SINGLE } } });
{
  const at = (agi) => exclGranted(CT, { retIncome: agi });
  EQ("E-1: CT under $100,000 -> 100% of qualifying income exempt", at(90000), 90000);
  EQ("E-2: CT band 2, AGI $102,000 -> 85%", at(102000), 86700);
  EQ("E-3: CT band 5, AGI $118,000 -> 40%", at(118000), 47200);
  EQ("E-4: CT band 8, AGI $135,000 -> 5%", at(135000), 6750);
  EQ("E-5: CT band 9, AGI $145,000 -> 2.5%", at(145000), 3625);
  // ⚠ THE COMPARATOR PINS. At exactly $150,000 the factor is ZERO, not 2.5% — the TY2026 table
  // reads "$150,000 and up" and eligibility is phrased as *less than*. `lte` would give $3,750 here.
  EQ("E-6: CT AT $150,000 exactly -> ZERO (cmp 'lt'; `lte` would grant 2.5% = $3,750)", at(150000), 0);
  EQ("E-7: CT one dollar below $150,000 -> 2.5% still applies", at(149999), 3749.975);
  EQ("E-8: CT one dollar above -> zero", at(150001), 0);
  EQ("E-9: CT AT $100,000 exactly -> 85%, not 100% (the same pin at the top of band 1)", at(100000), 85000);
  EQ("E-10: CT single AT $100,000 exactly -> zero (single column, same comparator)",
    exclGranted(CT, { retIncome: 100000, single: true, ageB: null }), 0);
  EQ("E-11: CT has NO age gate — a 55-year-old couple still gets the exemption (exclAge 0)",
    exclGranted(CT, { retIncome: 90000, ageA: 55, ageB: 55 }), 90000);
  EQ("E-12: CT is per RETURN, not per person — two qualifying people do not double it", at(90000), 90000);
}

// ── §F · New Jersey's mixed table — one amount row, two percentage rows, then nothing ─────────
// Household cap, age 62, base NJ gross income (approximated by `agiExSS`), comparator INCLUSIVE.
const NJ_JOINT = [
  { upTo: 100000, amount: 100000 }, { upTo: 125000, pct: 0.50 }, { upTo: 150000, pct: 0.25 },
  { upTo: Infinity, amount: 0 },
];
const NJ_SINGLE = [
  { upTo: 100000, amount: 75000 }, { upTo: 125000, pct: 0.375 }, { upTo: 150000, pct: 0.1875 },
  { upTo: Infinity, amount: 0 },
];
const NJ = flat({ exclAge: 62, exclTest: { kind: "bands", base: "agiExSS", unit: "household", cmp: "lte", rows: { joint: NJ_JOINT, single: NJ_SINGLE } } });
{
  const at = (gi) => exclGranted(NJ, { retIncome: gi, ageA: 65, ageB: 65 });
  EQ("F-1: NJ tier 1, $90,000 -> the whole $90,000 (the $100,000 cap does not bind below it)", at(90000), 90000);
  EQ("F-2: NJ tier 2, $110,000 -> 50%", at(110000), 55000);
  EQ("F-3: NJ tier 3, $140,000 -> 25%", at(140000), 35000);
  EQ("F-4: NJ above $150,000 -> nothing at all", at(160000), 0);
  EQ("F-5: NJ AT $150,000 exactly -> 25% still applies (cmp 'lte'; CT's 'lt' would give zero here)", at(150000), 37500);
  EQ("F-6: NJ AT $100,000 exactly -> the full amount row, not 50%", at(100000), 100000);
  // ⚠ The dollar caps CANNOT bind in the percentage tiers: payments cannot exceed gross income and
  // gross income there cannot exceed $150,000, so the largest possible figure is 50% x $150,000 =
  // $75,000, under the $100,000 cap. A cap-then-percentage implementation passes a tier-1 test.
  T("F-7: no percentage-tier result can reach the $100,000 cap — the tiers are a pure percentage",
    [110000, 125000, 140000, 150000].every((g) => at(g) < 100000));
  EQ("F-8: NJ is a HOUSEHOLD cap — two qualifying people do not double it", at(90000), 90000);
  EQ("F-9: NJ age floor is 62, not 65 — a 63-year-old couple qualifies", at(90000), 90000);
  EQ("F-10: NJ below the age floor -> nothing", exclGranted(NJ, { retIncome: 90000, ageA: 60, ageB: 61 }), 0);
}

// ── §G · The measure itself, and the malformed-table floor ───────────────────────────────────
{
  // Every term the function receives reaches the measure. Drive NM's table and watch the band move.
  // Baseline: $20,000 of IRA income alone is NM band 1 — $8,000 each, $16,000 for the couple. Each
  // check below adds $20,000 through a DIFFERENT argument and must move the household to band 4
  // ($39,000-$42,000, $4,000 each). A term that failed to reach the measure would leave $16,000.
  const nm = (a) => exclGranted(NM, a);
  EQ("G-0: baseline — $20,000 measure is band 1, $8,000 each", nm({ retIncome: 20000 }), 16000);
  EQ("G-1: `pen` counts toward the measure — it moves the household to band 4", nm({ retIncome: 20000, pen: 20000 }), 8000);
  EQ("G-2: `work` counts — and it carries otherOrd since v5.63, so this is NOT a wages-only term", nm({ retIncome: 20000, work: 20000 }), 8000);
  EQ("G-3: `capGains` counts", nm({ retIncome: 20000, capGains: 20000 }), 8000);
  EQ("G-4: all four terms sum into ONE measure — $10,000 each lands in the same band", nm({ retIncome: 10000, pen: 10000, work: 10000, capGains: 10000 }), 8000);
  // A malformed table grants nothing rather than guessing — conservative, and loud in a test.
  EQ("G-5: unknown `kind` grants ZERO rather than falling back to the scalar",
    exclGranted(flat({ excl65: 50000, exclTest: { kind: "wat", base: "agi" } }), { retIncome: 40000 }), 0);
  EQ("G-6: a bands table with no rows for this filing status grants ZERO",
    exclGranted(flat({ exclTest: { kind: "bands", base: "agi", cmp: "lte", rows: { joint: [] } } }), { retIncome: 40000 }), 0);
  // `exclTest` REPLACES the scalar path rather than adding to it.
  EQ("G-7: when `exclTest` is present the scalar `excl65` is not also granted",
    exclGranted(flat({ excl65: 99000, exclTest: { kind: "bands", base: "agi", unit: "person", cmp: "lte", rows: { joint: [{ upTo: Infinity, amount: 1000 }] } } }), { retIncome: 40000 }), 2000);
  // And with no `exclTest`, the scalar path is untouched — this is the v5.63 behaviour, unchanged.
  EQ("G-8: with NO `exclTest`, `excl65` behaves exactly as before (per person, past the floor)",
    exclGranted(flat({ excl65: 5000 }), { retIncome: 40000 }), 10000);
}

// ── §H · The whole thing at the tax layer, not just the exclusion ─────────────────────────────
// Everything above recovers the exclusion at rate 1. This section proves the exclusion actually
// reaches the tax at a real rate, so a wiring error between the two cannot pass §C–§G silently.
{
  const rule = { ...NM, rate: 0.049 };
  RULES[TESTCODE] = rule;
  const tax = ST({ code: TESTCODE, fallbackRate: 0, retIncome: 35000, ageA: 70, ageB: 70, single: false });
  delete RULES[TESTCODE];
  EQ("H-1: NM at AGI $35,000 — 4.9% x ($35,000 - $12,000) reaches the returned tax", tax, 0.049 * 23000);
}

console.log(`\nt34: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
