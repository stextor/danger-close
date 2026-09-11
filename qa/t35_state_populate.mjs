// t35 — POPULATED income-conditioned states: hand-computed cells, boundary pins, parity (v5.65)
// Run: node t35_state_populate.mjs v564   ·   node t35_state_populate.mjs v565
//
// WHAT THIS SUITE IS. `t34` proves the EVALUATOR against the statutory tables through a synthetic
// jurisdiction. This one proves a REAL STATE, populated in `STATE_RULES`, priced through the real
// engines. The two are deliberately separate: t34's synthetic cases would still pass if the state
// row were never written, and this file's would still pass if the evaluator were only ever exercised
// from here. Scope `docs/SCOPE_INCOME_CONDITIONING.md` §5 splits them the same way.
//
// ⚠ IT RUNS ON BOTH LEGS, and that is the point. v5.64 carries Connecticut UNPOPULATED
// (`excl65: 0`, no `exclTest`), so it grants no exemption at all and taxes the whole retirement
// base — the PESSIMISTIC simplification this release exists to remove. Every §B case therefore
// asserts a DIFFERENT figure on each leg, and the prior leg's figure is the pre-fix pin. A suite
// that only ran on the current leg could not show that anything moved (OPERATIONS §B2).
//
// ⚠ CONNECTICUT IS THE ONE OF THE FIVE THAT MOVES IN THE OPTIMISTIC DIRECTION. Populating it makes
// plans look BETTER, which is the direction this project is most reluctant to move in. That is why
// every cell below was computed BY HAND from the Form CT-1040ES (Rev. 01/26) table transcribed in
// `docs/FINDINGS-v5_63-state-statutes.md` §3, and compared to engine output afterwards. No
// expectation was edited until it matched.
//
// ⚠ THE BOUNDARY PINS IN §C ARE THE LOAD-BEARING ONES. Connecticut is the only one of the five
// statutes that is EXCLUSIVE at the band top (`cmp: 'lt'`, decision B-2). A pin one dollar below
// and one dollar above a threshold passes with the comparator inverted; only the pin AT the
// threshold discriminates `lt` from `lte`. All nine thresholds are pinned in both filing columns.

import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };

const VER = process.argv[2] || "v565";
const _vt = Number(String(VER).replace(/[^0-9]/g, "")) || 0;
const KNOWN_VERSIONS = ["v564", "v565", "v566", "v567", "v568", "v569", "v570"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    t35 needs the `exclTest` machinery, which does not exist before v5.64.");
  console.log("    Add the tag to KNOWN_VERSIONS and decide each gated expectation BEFORE running.");
  process.exit(1);
}
const _v = Number(String(VER).replace(/[^0-9]/g, "")) || 0;
const POPULATED = _v >= 565;   // v5.65 is the release that populates Connecticut

const MOD = await import(`./app_${VER}.mjs`);
const __g = MOD.__g, __engines = MOD.__engines;
const ST = __g.stateTaxAnnual;
const R = __g.STATE_RULES();
// v5.69: the shipped example household, captured BEFORE any section mutates PORTFOLIO (§E replaces it with a
// Connecticut fixture). §F prices Rhode Island through the engine on this household, which crosses RI's cliff.
const __BASE_PORTFOLIO = JSON.parse(JSON.stringify(__g.PORTFOLIO()));

let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log(`  \u2717 ${name}`); } };
const EQ = (name, got, want, tol = 0.005) => T(`${name} (got ${got}, want ${want})`, Math.abs(got - want) <= tol);

console.log(`t35 — POPULATED STATES: Connecticut (${VER}${POPULATED ? "" : " — PRE-POPULATE leg"})`);

// Connecticut priced through `stateTaxAnnual` at its REAL shipped rate (5%), not at rate 1. Every
// expectation below is a state TAX in dollars, so a wiring error between the exclusion and the tax
// cannot pass here the way it could in a suite that recovers the exclusion algebraically.
const ctTax = (args) => ST({
  code: "CT", fallbackRate: 0, ageA: 70, ageB: 70, single: false,
  retIncome: 0, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ...args,
});

// ── §A · The row itself ───────────────────────────────────────────────────────────────────────
{
  if (POPULATED) {
    T("A-1: CT carries an `exclTest`", R.CT.exclTest !== undefined);
    T("A-2: ten rows in each filing column — the statute's ten bands, the tenth being \"and up -> 0\"",
      R.CT.exclTest.rows.joint.length === 10 && R.CT.exclTest.rows.single.length === 10);
    T("A-3: `exclAge: 0` — Connecticut conditions on income ALONE and the engine's default floor is 65",
      R.CT.exclAge === 0);
    T(_v >= 569 ? "A-4: the comparator is EXCLUSIVE (B-2) — CT is one of the two that are (Rhode Island joined at v5.69)"
              : "A-4: the comparator is EXCLUSIVE (B-2) — CT is the only one of the five that is",
      R.CT.exclTest.cmp === "lt");
    T("A-5: the base is federal AGI, and the unit is the RETURN, not the person",
      R.CT.exclTest.base === "agi" && R.CT.exclTest.unit === "household");
    // The top band is 100% and the bottom is 0 — read from the table, so a transcription slip shows.
    T("A-6: the first joint row grants 100% below $100,000 and the last grants nothing",
      R.CT.exclTest.rows.joint[0].pct === 1 && R.CT.exclTest.rows.joint[0].upTo === 100000 &&
      R.CT.exclTest.rows.joint[9].pct === 0);
    T("A-7: the first single row grants 100% below $75,000",
      R.CT.exclTest.rows.single[0].pct === 1 && R.CT.exclTest.rows.single[0].upTo === 75000);
  } else {
    T("A-1 [pre-v5.65]: CT carries NO `exclTest` — the exemption is not modelled at all",
      R.CT.exclTest === undefined);
    T("A-3 [pre-v5.65]: and no `exclAge`, because there was no exclusion for an age gate to govern",
      R.CT.exclAge === undefined);
  }
  // TRUE ON BOTH LEGS, and it is the D-3 (b) invariant scope §5 requires of every populated state:
  // the scalar must not become a second source of truth beside the table.
  //
  // ⚠ FOR CONNECTICUT THE TABLE IS PERCENTAGES, so "what the table yields at zero income" is
  // 1 x $0 = $0, and the honest content of this check is that CT's scalar carries NO INDEPENDENT
  // DOLLAR FIGURE. It is not vacuous: if a later session writes a dollar amount into CT's `excl65`
  // — the obvious wrong repair, since `excl65` is unread once `exclTest` is present — this fails.
  // New Mexico's amount table will exercise the same invariant non-degenerately when it converts.
  EQ("A-8: CT's scalar `excl65` equals what its table yields at zero income (D-3 (b)) — a percentage table carries no dollar scalar",
    R.CT.excl65, 0);
}

// ── §B · Hand-computed cells, MFJ, at Connecticut's real 5% rate ──────────────────────────────
// Model: retBase = max(0, retIncome + pen - exclFinal); ssBase = 0.5 x ssTaxableFed;
//        tax = 0.05 x (retBase + work + ssBase + capGains).
//
// Scope §5 requires cells INSIDE at least three of the ten bands, because a cliff implementation
// passes a two-sided test and fails a band. Five interior bands are exercised here (1, 5, 6, 7, 8)
// plus the zero band, and each has a pre-populate figure on the other leg.
{
  // band 1 — under $100,000 joint, the whole retirement base is exempt.
  //   populated : factor 1 x $90,000 = $90,000 excl -> retBase 0            -> 0.05 x 0       = $0
  //   pre-pop   : no exclusion at all -> retBase $90,000                    -> 0.05 x 90,000  = $4,500
  EQ("B-1: MFJ $90,000 retirement income — band 1 (100%)",
    ctTax({ retIncome: 90000 }), POPULATED ? 0 : 4500);

  // band 5 — $115,000-$119,999 -> 40%.
  //   populated : 0.40 x $118,000 = $47,200 excl -> retBase $70,800 -> 0.05 x 70,800 = $3,540
  //   pre-pop   : 0.05 x 118,000 = $5,900
  EQ("B-2: MFJ $118,000 — band 5 (40%)",
    ctTax({ retIncome: 118000 }), POPULATED ? 3540 : 5900);

  // band 6 — $120,000-$124,999 -> 25%.
  //   populated : 0.25 x $122,000 = $30,500 -> retBase $91,500 -> 0.05 x 91,500 = $4,575
  EQ("B-3: MFJ $122,000 — band 6 (25%)",
    ctTax({ retIncome: 122000 }), POPULATED ? 4575 : 6100);

  // band 7 — $125,000-$129,999 -> 10%.
  //   populated : 0.10 x $128,000 = $12,800 -> retBase $115,200 -> 0.05 x 115,200 = $5,760
  EQ("B-4: MFJ $128,000 — band 7 (10%)",
    ctTax({ retIncome: 128000 }), POPULATED ? 5760 : 6400);

  // band 8 — $130,000-$139,999 -> 5%.
  //   populated : 0.05 x $135,000 = $6,750 -> retBase $128,250 -> 0.05 x 128,250 = $6,412.50
  EQ("B-5: MFJ $135,000 — band 8 (5%)",
    ctTax({ retIncome: 135000 }), POPULATED ? 6412.50 : 6750);

  // the zero band — at and above $150,000 joint the statute grants nothing, so BOTH legs agree.
  // ⚠ THIS IS THE AGREEMENT POINT, and it is what stops §B being read as "the model is simply
  // always different now". Without it, an implementation that returned zero exemption everywhere
  // would pass none of the above but this case would not notice.
  EQ("B-6: MFJ $160,000 — above the table entirely, and the two legs AGREE",
    ctTax({ retIncome: 160000 }), 8000);

  // ⚠ THE BASE INCLUDES FEDERALLY-TAXABLE SOCIAL SECURITY (`agi`, decision D-2). This case is the
  // one that discriminates it: $80,000 of retirement income alone would be band 1 and exempt
  // everything, and the household would owe $750. It is the $30,000 of taxable SS that carries the
  // measure to $110,000 and into the 55% band.
  //   populated : measure $110,000 -> 0.55 x $80,000 qualifying = $44,000 excl
  //               retBase $36,000; ssBase 0.5 x $30,000 = $15,000
  //               0.05 x (36,000 + 15,000) = $2,550
  //   pre-pop   : 0.05 x (80,000 + 15,000) = $4,750
  EQ("B-7: MFJ $80,000 retirement + $30,000 taxable SS — the SS carries the measure into band 4",
    ctTax({ retIncome: 80000, ssTaxableFed: 30000 }), POPULATED ? 2550 : 4750);

  // ⚠ CAPITAL GAINS COUNT TOWARD THE MEASURE and are also taxed as ordinary income by the model.
  //   populated : measure $130,000 -> 0.05 x $90,000 = $4,500 excl -> retBase $85,500
  //               0.05 x (85,500 + 40,000) = $6,275
  //   pre-pop   : 0.05 x (90,000 + 40,000) = $6,500
  EQ("B-8: MFJ $90,000 retirement + $40,000 capital gains — the gains move the band",
    ctTax({ retIncome: 90000, capGains: 40000 }), POPULATED ? 6275 : 6500);

  // ⚠ `work` IS NOT WAGES — since v5.63 it carries `work + otherOrd`, so rental, annuity and
  // royalty income ride in this slot and reach the measure. CT's note must not call it wages.
  //   populated : measure $120,000 -> 0.25 x $90,000 = $22,500 -> retBase $67,500
  //               0.05 x (67,500 + 30,000) = $4,875
  EQ("B-9: MFJ $90,000 retirement + $30,000 other ordinary income — it reaches the measure",
    ctTax({ retIncome: 90000, work: 30000 }), POPULATED ? 4875 : 6000);

  // NO AGE GATE. A 55-year-old Connecticut couple gets the whole exemption, because the statute
  // has no age test. This is the case `exclAge: 0` exists for: without that key the engine's
  // default floor of 65 would deny it and the release would be silently pessimistic again.
  EQ("B-10: MFJ aged 55 — Connecticut has NO age test, so the exemption still applies in full",
    ctTax({ retIncome: 90000, ageA: 55, ageB: 55 }), POPULATED ? 0 : 4500);
  // and the non-vacuity control for it: a 65+ couple gets the same figure, so B-10 is not just
  // reading a household that would have qualified anyway on the default floor.
  EQ("B-11: and a 70-year-old couple gets exactly the same — the floor is not doing any work",
    ctTax({ retIncome: 90000, ageA: 70, ageB: 70 }), POPULATED ? 0 : 4500);

  // SINGLE FILER — the single column is half the story and has its own thresholds.
  //   populated : $70,000 measure < $75,000 -> 100% -> retBase 0 -> $0
  EQ("B-12: single $70,000 — band 1 of the SINGLE column (100%)",
    ctTax({ retIncome: 70000, single: true, ageB: null }), POPULATED ? 0 : 3500);
  //   populated : $86,000 -> band $85,000-$87,499 -> 25% -> $21,500 excl -> retBase $64,500
  //               0.05 x 64,500 = $3,225
  EQ("B-13: single $86,000 — band 6 of the single column (25%)",
    ctTax({ retIncome: 86000, single: true, ageB: null }), POPULATED ? 3225 : 4300);

  // ⚠ THE LEGACY COUNT PATH. A caller that supplies no ages cannot be asked how many people clear
  // the floor, so `_qual` falls back to `persons65`. With a HOUSEHOLD unit and persons65 = 0 that
  // yields NOTHING — the conservative degradation, and it must stay that way rather than silently
  // granting a full exemption to a partial caller.
  EQ("B-14: a caller supplying neither ages nor persons65 gets NO exemption — conservative degradation",
    ctTax({ retIncome: 90000, ageA: null, ageB: null, persons65: 0 }), 4500);
}

// ── §C · Boundary pins AT every threshold, both columns ───────────────────────────────────────
// ⚠ THE ONLY CASES THAT DISCRIMINATE THE COMPARATOR. At exactly $150,000 joint the TY2026 table
// reads "and up -> 0" and eligibility is phrased as *less than*, so the factor is ZERO, not 2.5%.
// With `cmp: 'lte'` every one of these would take the band BELOW it and the release would overstate
// the exemption at nine income points in each column.
{
  // [threshold, factor AT it, factor one dollar BELOW it] — hand-read from FINDINGS §3.
  const JOINT = [
    [100000, 0.85, 1],    [105000, 0.70, 0.85], [110000, 0.55, 0.70],
    [115000, 0.40, 0.55], [120000, 0.25, 0.40], [125000, 0.10, 0.25],
    [130000, 0.05, 0.10], [140000, 0.025, 0.05], [150000, 0, 0.025],
  ];
  const SINGLE = [
    [75000, 0.85, 1],    [77500, 0.70, 0.85], [80000, 0.55, 0.70],
    [82500, 0.40, 0.55], [85000, 0.25, 0.40], [87500, 0.10, 0.25],
    [90000, 0.05, 0.10], [95000, 0.025, 0.05], [100000, 0, 0.025],
  ];
  // The exclusion the engine granted, recovered from the tax at CT's real 5% rate:
  //   tax = 0.05 x (income - excl)  ->  excl = income - tax/0.05
  const exclAt = (income, single) =>
    income - ctTax({ retIncome: income, single, ageB: single ? null : 70 }) / 0.05;

  for (const [label, table, single] of [["joint", JOINT, false], ["single", SINGLE, true]]) {
    for (const [thr, atF, belowF] of table) {
      EQ(`C-${label} AT $${thr.toLocaleString()} — factor ${atF} (cmp 'lt'; 'lte' would give ${belowF})`,
        exclAt(thr, single), POPULATED ? atF * thr : 0);
      EQ(`C-${label} one dollar BELOW $${thr.toLocaleString()} — factor ${belowF}`,
        exclAt(thr - 1, single), POPULATED ? belowF * (thr - 1) : 0);
      EQ(`C-${label} one dollar ABOVE $${thr.toLocaleString()} — still factor ${atF}`,
        exclAt(thr + 1, single), POPULATED ? atF * (thr + 1) : 0);
    }
  }
  // NOT VACUOUS: the AT and BELOW factors must actually differ at every threshold, or the pins
  // above could not tell the two comparators apart no matter how they were written.
  T("C-control: every pinned threshold really does change the factor — the pins can discriminate",
    JOINT.every(([, a, b]) => a !== b) && SINGLE.every(([, a, b]) => a !== b));
}

// ── §D · Note-vs-code: the disclosure has to keep up with the model ──────────────────────────
{
  const note = (R.CT.note || "");
  if (POPULATED) {
    // The old note said the exemption was "income-limited (not modeled)". That sentence became
    // FALSE the moment CT was populated, and an assertion that it is GONE is the lock OPERATIONS
    // §B2 asks for: a disclosure assertion turns harmful the moment its disclosure stops being true.
    T("D-1: CT's note no longer claims the pension/IRA exemption is unmodelled",
      !/not model?led/i.test(note));
    // ⚠ THE DISCLOSURE THIS RELEASE OWES ITS USERS. Neither income base carries dividend or
    // interest income, because `stateTaxAnnual` is never passed it. A household whose state income
    // is materially dividend-driven therefore sits LOWER on the band table than the statute would
    // put it, and receives a LARGER exemption than it should — an OPTIMISTIC error, in the release
    // that already moves Connecticut in the optimistic direction. It must be said in the note.
    // ⚠ THIS MATCHER ASSERTS THE NEGATION, NOT THE WORDS. Its first draft read
    // `/dividend/i.test(note) && /interest/i.test(note)` — which a note claiming the measure DOES
    // carry dividends would have passed, i.e. it locked in the presence of two nouns and was blind
    // to the claim reversing. The v5.65 negative control caught it and the TEST was repaired, not
    // the control weakened (OPERATIONS §B2).
    // ⚠ IT RECOGNISES A NEGATION WITHIN ~40 CHARACTERS OF "dividend", and no other phrasing — the
    // same deliberate narrowness as t10's `_AGE_NOTE`. A future rewording that negates some other
    // way would be invisible again; that limitation is recorded here rather than papered over.
    T("D-2: and it discloses that the income measure carries NO dividend or interest income — asserted as a NEGATION, not merely as the words appearing",
      /\b(not|no|never|excludes?|excluding|without)\b[^.]{0,40}\bdividend/i.test(note) && /interest/i.test(note));
    T("D-3: and it names the DIRECTION of that error rather than merely noting the omission",
      /overstat|too (large|generous)|lower on/i.test(note));
    T("D-4: the note names the tax year the table is drawn from, so a stale table is visible",
      /TY2026|2026/.test(note));
    T("D-5: and it states there is no age test, which is the fact `exclAge: 0` encodes",
      /no age test|without regard to age|any age/i.test(note));
  } else {
    T("D-1 [pre-v5.65]: CT's note admits the exemption is NOT modelled, which was honest then",
      /not model?led/i.test(note));
  }
  // TRUE ON BOTH LEGS — CT carries `ss: 0.5`, so the partial-SS disclosure t10 asserts must hold
  // through the rewrite. This is the check that would have caught dropping the SS sentence while
  // rewriting the pension one.
  T("D-6: CT still discloses its Social Security treatment — it carries ss 0.5",
    R.CT.ss > 0 && /social security|\bss\b/i.test(note));

  // ── THE EXTINCTION INVARIANT, in the only form that is honest today (scope §5).
  // "No state whose note claims an income limit may carry an unconditional exclusion" cannot be
  // asserted as a PASS yet: NM, RI, VA and NJ are all still exactly that, by decision B-1, and
  // they convert one release at a time. So it is written as a SHRINKING PIN — the offender set is
  // measured live and its size asserted. Each populate release lowers the expected count by one,
  // and the release that populates the last of them turns this into the clean invariant.
  //
  // ⚠ CONNECTICUT WAS NEVER IN THIS SET, because the set requires `excl65 > 0` and CT's scalar was
  // zero — its simplification was to grant NOTHING. That is exactly why CT ran pessimistic while
  // the other four run optimistic, and it is why this count does NOT drop at v5.65. Recording that
  // here stops a later session reading the unchanged count as a failed conversion.
  const offenders = Object.keys(R).filter((c) =>
    (R[c].excl65 || 0) > 0 &&
    R[c].exclTest === undefined &&
    /income[- ]limited|income limit/i.test(R[c].note || ""));
  // ⚠ GATED AT v566, NOT REWRITTEN — §B2's gate-the-inversion rule. New Mexico converted at v5.66,
  // so it leaves this set. The pre-v5.66 form is kept because it is the truth on the earlier legs.
  // ⚠ THE SET SHRINKS BY ONE PER CONVERSION AND MUST REACH ZERO. When the last of NJ, RI and VA
  // converts, D-8's non-empty guard below INVERTS and both must be gated together in that release.
  if (_vt >= 566) {
    const _expOff = _vt >= 569 ? "" : _vt >= 568 ? "RI" : _vt >= 567 ? "RI,VA" : "NJ,RI,VA";
    T(`D-7 [v5.67]: the income-limited-but-unconditional set is exactly ${_expOff || "EMPTY"} — ${_expOff ? _expOff.split(",").length : 0} states still to convert (found: ${offenders.sort().join(",") || "none"})`,
      offenders.sort().join(",") === _expOff);
    // ⚠ EXTINCTION INVARIANT: NM must be OUT of this set for the right reason — because it carries
    // a table, not because its note stopped saying "income-limited". Rewording the note out of the
    // guarded set would ALSO empty it here, silently, and that is the v5.54 New Jersey defect.
    T("D-7a [v5.66]: NM left the set by CONVERTING, not by rewording — its note still matches the income-limited selector AND it now carries an `exclTest`",
      /income[- ]limited|income limit/i.test(R.NM.note || "") && R.NM.exclTest !== undefined);
    // ⚠ D-7b — THE SAME PIN FOR NEW JERSEY, AND THE v5.67 BUILD NEEDED IT. The first draft of NJ's
    //   rewritten note said "income-conditioned" and dropped the phrase the selector matches, so NJ
    //   would have left this set by BOTH converting AND rewording — and the reword alone would have
    //   emptied it silently, which is the v5.54 New Jersey defect reproduced by the release fixing
    //   New Jersey. Caught by D-7a's shape, not by review. The phrase is back in the note.
    if (_vt >= 567)
      T("D-7b [v5.67]: NJ left the set by CONVERTING, not by rewording — its note still matches the income-limited selector AND it now carries an `exclTest`",
        /income[- ]limited|income limit/i.test(R.NJ.note || "") && R.NJ.exclTest !== undefined);
    // ⚠ D-7c — VIRGINIA (v5.68), the same pin a third time. Its note keeps "income-limited" on purpose.
    if (_vt >= 568) {
      T("D-7c [v5.68]: VA left the set by CONVERTING, not by rewording — its note still matches the income-limited selector AND it now carries an `exclTest`",
        /income[- ]limited|income limit/i.test(R.VA.note || "") && R.VA.exclTest !== undefined);
      // VA's note owes three disclosures. Each is asserted as a CLAIM, not as the presence of a noun
      // (the v5.65 D-2 lesson): a note saying the measure DOES carry dividends must fail D-10.
      const _van = R.VA.note || "";
      T("D-10 [v5.68]: VA's note discloses that the measure carries NO dividend or interest income — asserted as a negation within ~40 characters",
        /\b(omits?|not|no|never|without|excluding)\b[^.]{0,40}\bdividend/i.test(_van) && /interest/i.test(_van));
      T("D-11 [v5.68]: and names the DIRECTION of that error — the deduction is overstated",
        /overstat/i.test(_van));
      T("D-12 [v5.68]: and states the reduction is taken ONCE, not once per spouse — the mechanic this release exists to get right",
        /\bonce\b/i.test(_van) && /not once per spouse|not per spouse/i.test(_van));
      T("D-13 [v5.68]: and no longer claims the deduction is applied unconditionally — the pre-v5.68 disclosure is now false (OPERATIONS §B2 lock)",
        !/unconditional/i.test(_van));
    }
    // ⚠ D-7d — RHODE ISLAND (v5.69), the fourth and last time. Its note keeps "income-limited" on purpose.
    if (_vt >= 569) {
      T("D-7d [v5.69]: RI left the set by CONVERTING, not by rewording — its note still matches the income-limited selector AND it now carries an `exclTest`",
        /income[- ]limited|income limit/i.test(R.RI.note || "") && R.RI.exclTest !== undefined);
      // RI's note owes its disclosures as CLAIMS, not nouns (the v5.65 D-2 lesson) — SCOPE_RI_POPULATE §6.
      const _rin = R.RI.note || "";
      T("D-14 [v5.69]: RI's note no longer claims the model ignores the cliff — the pre-v5.69 disclosure is now false (OPERATIONS §B2 lock)",
        !/ignores the cliff/i.test(_rin));
      T("D-15 [v5.69]: and states the cliff is EXCLUSIVE — AGI must be less than the threshold",
        /less than the threshold/i.test(_rin));
      T("D-16 [v5.69]: and discloses that IRA distributions are NOT distinguished (D-RI-1) — asserted as the negated claim",
        /does not distinguish IRA/i.test(_rin));
      T("D-17 [v5.69]: and that each person's $50,000 is NOT capped at their own income (D-RI-3)",
        /does not cap each person/i.test(_rin));
      T("D-18 [v5.69]: and that the measure carries NO dividend or interest income — a negation within ~40 characters",
        /\b(omits?|not|no|never|without|excluding)\b[^.]{0,40}\bdividend/i.test(_rin) && /interest/i.test(_rin));
      T("D-19 [v5.69]: and names the DIRECTION of those gaps — the exclusion is overstated",
        /overstates the exclusion/i.test(_rin));
      T("D-20 [v5.69]: and dates its thresholds — TY2026 figures expected November 2026 (parent B-3)",
        /TY2026 expected November 2026/i.test(_rin));
    }
  } else {
    T(`D-7: the income-limited-but-unconditional set is exactly NM, NJ, RI, VA — four states still to convert (found: ${offenders.sort().join(",") || "none"})`,
      offenders.sort().join(",") === "NJ,NM,RI,VA");
  }
  // and the guard against the set going quiet for the wrong reason (OPERATIONS §B2's empty-set trap)
  // ⚠ v5.69: INVERTED, not weakened (SCOPE_RI_POPULATE D-RI-4). Rhode Island converted, so the set is EMPTY by
  //   design; D-7a..D-7d pin that each state left by CONVERTING, which is what keeps an empty set honest.
  if (_vt >= 569)
    T("D-8 [v5.69]: that set is EMPTY — all five income-limited statutes carry `exclTest`, and each left by converting (D-7a..D-7d)",
      offenders.length === 0);
  else
    T("D-8: that set is non-empty — an empty one would make D-7 pass vacuously once a note is reworded",
      offenders.length > 0);
  if (POPULATED) {
    T("D-9: and CT is NOT in it — a populated state must never read as an unconverted one",
      !offenders.includes("CT"));
  }
}

// ── §E · Cross-engine parity — the same household, the same state tax, at two call sites ─────
// ⚠ THE SINGLE MOST VALUABLE TEST IN THE RELEASE (scope §5). `stateTaxAnnual` has three call
// sites in two engines; a table populated in `STATE_RULES` must price identically at all of them,
// or the exemption a user sees on one tab differs from the one behind another.
//
// ⚠ HARNESS TRAPS, both real and both encoded here rather than "simplified" away (OPERATIONS §C):
//   1. `incomeStreams` is neutralised explicitly. The shipped example household carries streams,
//      and a global stream would move the measure and make the two sites disagree for a reason
//      that has nothing to do with Connecticut.
//   2. `applyLoadedData` is what rebuilds PLAN_TIMELINE; `setPortfolio` alone does not.
{
  const G = __g;
  const E = __engines;
  if (!E || !E.computeTaxPlan) {
    T("E-0: the tax engine is reachable from the shim (parity cannot be checked without it)", false);
  } else {
    const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
    const P = JSON.parse(JSON.stringify(BASE));
    P.positions = []; P.otherAccounts = []; P.single = false;
    P.stateCode = "CT"; P.stateName = "Connecticut";
    P.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
    G.applyLoadedData({ portfolio: P });

    const tl = G.PLAN_TIMELINE();
    const plan = E.computeTaxPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
    T("E-1: the engine produced a plan with rows to compare", !!(plan && plan.rows && plan.rows.length));

    // ⚠ THE ROW FIELDS ARE NOT THE ARGUMENT NAMES, and assuming they were is how the first draft of
    // this section reported 22 spurious mismatches. The engine's call site composes its arguments:
    //   retIncome: rmdTax_y + conv_y   pen: pen_y   work: work_y + otherOrd_y   capGains: qdcg_y
    // The row reports `capGains_y` and `div_y` separately rather than the `qdcg_y` it summed, and
    // does not report `otherOrd_y` at all — so the fixture is built to make both terms ZERO
    // (no positions, no otherAccounts, streams neutralised) and that is ASSERTED below rather than
    // assumed, because a fixture that quietly grew an `otherOrd` would make this section lie.
    const rows = plan.rows || [];
    T("E-2: the fixture carries no dividends and no capital gains, so `qdcg_y` is exactly zero and the reconstruction below is complete",
      rows.every((r) => !(r.div_y || 0) && !(r.capGains_y || 0)));

    let compared = 0, mismatched = 0, taxed = 0;
    for (const r of rows) {
      if (typeof r.stateTax !== "number") continue;
      compared++;
      if (r.stateTax > 0) taxed++;
      const direct = ST({
        code: "CT", fallbackRate: 0,
        retIncome: (r.rmdTax_y || 0) + (r.conv_y || 0), pen: r.pen_y || 0, work: r.work_y || 0,
        capGains: (r.capGains_y || 0) + (r.div_y || 0), ssTaxableFed: r.ssTaxable || 0,
        ssGrossA: r.ssA_y || 0, ssGrossB: r.ssB_y || 0,
        ageA: r.ageA, ageB: r.ageB, single: !!r.filingSingle,
      });
      if (Math.abs(direct - r.stateTax) > 0.01) mismatched++;
    }
    // ⚠ NOT ASSERTED AS "zero mismatches" ALONE. A loop that never executed reports zero mismatches
    // and reads green — the empty-set failure OPERATIONS §B2 names. Both the row count AND the
    // count of rows that actually carry a non-zero state tax are asserted first, because a plan of
    // 25 rows all taxed at zero would also agree trivially.
    T(`E-3: rows were actually compared (compared ${compared})`, compared > 0);
    T(`E-4: and the state tax is non-zero on real rows, so agreement is not a shared zero (taxed ${taxed})`,
      taxed > 0);
    T(`E-5: every engine row's Connecticut state tax re-prices identically through the module (mismatched ${mismatched} of ${compared})`,
      mismatched === 0);

    // ⚠ AND THE TABLE MUST ACTUALLY BE REACHED FROM THE ENGINE, not merely from the direct calls in
    // §B and §C. This is the discriminator: on the populated leg at least one engine row must have
    // been granted a non-zero exemption; on the pre-populate leg none can be, because CT's scalar
    // was zero. Without it, a `STATE_RULES` row that the engines never consult would pass E-5.
    const granted = rows.filter((r) => {
      const qual = (r.rmdTax_y || 0) + (r.conv_y || 0) + (r.pen_y || 0);
      if (qual <= 0) return false;
      const bare = ST({
        code: "CT", fallbackRate: 0, retIncome: 0, pen: 0,
        work: r.work_y || 0, capGains: 0, ssTaxableFed: r.ssTaxable || 0,
        ssGrossA: r.ssA_y || 0, ssGrossB: r.ssB_y || 0,
        ageA: r.ageA, ageB: r.ageB, single: !!r.filingSingle,
      });
      // With no qualifying income the exemption cannot bind, so `bare` is the un-exempted floor.
      // If the row's tax is below floor + rate x qual, an exemption was granted.
      return r.stateTax < bare + R.CT.rate * qual - 0.01;
    }).length;
    if (POPULATED) {
      T(`E-6: the engine path REACHES Connecticut's table — an exemption binds on real rows (${granted})`,
        granted > 0);
    } else {
      T(`E-6 [pre-v5.65]: no engine row is granted any exemption — CT's scalar is zero (${granted})`,
        granted === 0);
    }

    G.applyLoadedData({ portfolio: BASE });   // leave the module as it was found
  }
}


// ── §F · Rhode Island (assertions RI-0..RI-7 — not F-, which is t29's series), through the ENGINE (v5.69) and the Field Manual lock ───────────────────────────
// SCOPE_RI_POPULATE §7c. §E proves parity for Connecticut on a fixture with no positions; it cannot show
// Rhode Island's CLIFF is reached from `computeTaxPlan`, because that fixture never crosses it. This
// section uses the SHIPPED example household (captured at load, before §E replaced PORTFOLIO), placed in
// Rhode Island with streams neutralised, which crosses the cliff in real rows (measured at scope time).
{
  const G = __g, E = __engines;
  if (E && E.computeTaxPlan) {
    const P = JSON.parse(JSON.stringify(__BASE_PORTFOLIO));
    P.stateCode = "RI"; P.stateName = "Rhode Island";
    P.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
    G.applyLoadedData({ portfolio: P });
    const plan = E.computeTaxPlan({ retireYear: G.PLAN_TIMELINE().targetRetireYear, rothAmount: 0, qcdAnnual: 0, taxYield: 0 });
    const rows = (plan && plan.rows) || [];
    const r0 = R.RI, THR = (r) => (r.filingSingle ? 107000 : 133750);
    let compared = 0, mismatched = 0, above = 0, belowQual = 0, aboveGranted = 0;
    for (const r of rows) {
      if (typeof r.stateTax !== "number") continue;
      compared++;
      const ret = (r.rmdTax_y || 0) + (r.conv_y || 0), pen = r.pen_y || 0, work = r.work_y || 0;
      const cg = (r.capGains_y || 0) + (r.div_y || 0), ss = r.ssTaxable || 0;
      const direct = ST({ code: "RI", fallbackRate: 0, retIncome: ret, pen, work, capGains: cg, ssTaxableFed: ss,
                          ssGrossA: r.ssA_y || 0, ssGrossB: r.ssB_y || 0, ageA: r.ageA, ageB: r.ageB, single: !!r.filingSingle });
      if (Math.abs(direct - r.stateTax) > 0.01) mismatched++;
      const m = ret + pen + work + cg + ss, qualAges = (r.ageA >= 67) || (!r.filingSingle && r.ageB >= 67);
      const noExcl = r0.rate * (Math.max(0, ret + pen) + Math.max(0, work) + (r0.ss || 0) * Math.max(0, ss) + Math.max(0, cg));
      if (m >= THR(r) && qualAges && ret + pen > 0) { above++; if (r.stateTax < noExcl - 0.01) aboveGranted++; }
      if (m < THR(r) && qualAges && ret + pen > 0) belowQual++;
    }
    T(`RI-1: the engine priced Rhode Island rows to compare (compared ${compared})`, compared > 0);
    T(`RI-2: every engine row re-prices identically through the module (mismatched ${mismatched} of ${compared})`, mismatched === 0);
    T(`RI-3: the household crosses the cliff \u2014 qualifying rows exist BOTH at/above it (${above}) and below it (${belowQual}), so the section can discriminate`,
      above > 0 && belowQual > 0);
    if (_vt >= 569)
      T(`RI-4 [v5.69]: every qualifying row at or above its cliff is priced with NO exclusion \u2014 the engine reaches the table (granted anyway: ${aboveGranted} of ${above})`,
        above > 0 && aboveGranted === 0);
    else
      T(`RI-4 [KNOWN DEFECT pre-v5.69]: rows at or above the cliff WERE granted the exclusion (${aboveGranted} of ${above})`,
        aboveGranted > 0);
    G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(__BASE_PORTFOLIO)) });
  } else {
    T("RI-0: the tax engine is reachable from the shim", false);
  }
  // The Field Manual lock (scope F-4): until v5.69 NO assertion read the two sentences this release falsifies.
  const DOCS = (G => (G.DOCS_HTML ? G.DOCS_HTML() : ""))(__g);
  if (_vt >= 569) {
    T("RI-5 [v5.69]: the Field Manual no longer says Rhode Island is not yet conditioned", !DOCS.includes("Rhode Island is not yet"));
    T("RI-6 [v5.69]: nor that SEVERAL income-limited exclusions are treated as unconditional (OPERATIONS \u00a7B2 lock)",
      !/several income-limited exclusions (are treated )?as unconditional/i.test(DOCS));
    T("RI-7 [v5.69]: and names Rhode Island among the conditioned states, with the IRA money it still over-grants",
      /Rhode Island at v5\.69/.test(DOCS) && /still applied to IRA money/i.test(DOCS));
  } else {
    T("RI-5 [pre-v5.69]: the Field Manual said Rhode Island was not yet conditioned — true on this leg", DOCS.includes("Rhode Island is not yet"));
  }
}

console.log(`\nt35: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
