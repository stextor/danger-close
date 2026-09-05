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
const KNOWN_VERSIONS = ["v564", "v565"];
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
    T("A-4: the comparator is EXCLUSIVE (B-2) — CT is the only one of the five that is",
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
  T(`D-7: the income-limited-but-unconditional set is exactly NM, NJ, RI, VA — four states still to convert (found: ${offenders.sort().join(",") || "none"})`,
    offenders.sort().join(",") === "NJ,NM,RI,VA");
  // and the guard against the set going quiet for the wrong reason (OPERATIONS §B2's empty-set trap)
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

console.log(`\nt35: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
