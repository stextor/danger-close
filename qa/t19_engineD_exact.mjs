// t19 — ENGINE D (Withdrawal projection), module-level.
//
// WHY THIS SUITE EXISTS. Engine D was hoisted to module level at v5.23. Before that it computed
// inside the component body and was observable only through the rendered DOM, which prints every
// figure $K-rounded — the ±$500 ceiling in STOP-REPORT-EngineBC-render-precision.md.
//
// It also exists because of a finding made DURING the v5.23 build: the existing suite does not
// witness Engine D at all. A +10% inflation perturbation inside the engine moves totalDrawn by
// $50,320 and BOTH t4 (90 checks) and t12 (23 checks) still pass. Engine D has therefore never had
// discriminating coverage. This suite is the first.
//
// SECTION B carries three dated [KNOWN DEFECT] pins (OPERATIONS §D): they assert TODAY'S WRONG
// behaviour, so they pass now and FAIL the moment releases (b)/(c) fix it. That flip is the fix's
// own verification.
//
// usage: node t19_engineD_exact.mjs
import { readFileSync } from "fs";

let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

const { __g: g } = await import("./app_testable.mjs");

let pass = 0, fail = 0;
const ck = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
const $ = (n) => "$" + Math.round(n).toLocaleString();

console.log("t19 \u2014 ENGINE D (module-level)\n");

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A — the hoist itself: reachable, and shaped as the render expects
// ─────────────────────────────────────────────────────────────────────────────
console.log("A. Hoist \u2014 reachability and contract");

ck("computeWithdrawalPlan is exported at module level",
   typeof g.computeWithdrawalPlan === "function", typeof g.computeWithdrawalPlan);

const ARGS = { retireYear: 2027, rothAmount: 70000, scenarioPreset: "base" };
const r = g.computeWithdrawalPlan(ARGS);

// The 17 names the Withdrawal tab's JSX destructures. If this set changes, the render breaks —
// so this is the contract between the engine and its only consumer.
const CONTRACT = ["_dobAYr","_horizonYr","_ladderEnd","_rmdAgeA_w","_rmdAgeB_w","_rmdStartYr",
  "_rothInit","_taxInit","_tlW","_tradInit","_wInfl","avgWR","growth","phaseColor","schedule",
  "totalConverted","totalDrawn"];
const keys = Object.keys(r).sort();
ck(`returns exactly the ${CONTRACT.length} keys the JSX consumes`,
   keys.length === CONTRACT.length && CONTRACT.every(k => k in r),
   `got ${keys.length}: ${keys.join(", ")}`);

ck("schedule is a non-trivial year array", Array.isArray(r.schedule) && r.schedule.length > 10,
   `${r.schedule && r.schedule.length} rows`);
ck("engine is deterministic \u2014 two calls return identical totals",
   Math.round(g.computeWithdrawalPlan(ARGS).totalDrawn) === Math.round(r.totalDrawn));
ck("engine is pure w.r.t. its parameters \u2014 a different rothAmount moves totalConverted",
   Math.round(g.computeWithdrawalPlan({ ...ARGS, rothAmount: 0 }).totalConverted)
     !== Math.round(r.totalConverted));

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B — [KNOWN DEFECT] pins, dated 2026-08-11
// Governing scope: SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md (releases b and c)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nB. [KNOWN DEFECT] pins \u2014 dated 2026-08-11, flipped by releases (b) and (c)");

const P0 = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const oaTotal = (P0.otherAccounts || []).reduce((t, a) => t + (a.balance || 0), 0);

// ── B-1 · every dollar of otherAccounts is treated as taxable, to the dollar.
// On the example household that is $147,000, of which $90,000 is NAMED traditional IRA
// (Rollover IRA (A) $70K + Traditional IRA (A) $20K) and $15,000 is an HSA.
// Source: _taxInit = Math.max(0, PORTFOLIO.household - PORTFOLIO.total401k).
// RELEASE (c) FIXES THIS \u2014 this assertion must then FAIL and be replaced.
ck("[KNOWN DEFECT 2026-08-11 | rel c] Engine D taxable pot == otherAccounts total, to the dollar",
   Math.round(r._taxInit) === Math.round(oaTotal),
   `_taxInit ${$(r._taxInit)} vs otherAccounts ${$(oaTotal)}`);

// ── B-2 · misclassified money never enters MAGI as tradDraw.
//
// ⚠ REWORDED 2026-08-11 (v5.24). This pin previously read "Engine D magi omits
// drawFromTaxable" and was tagged `rel b`, instructing the next session to ADD
// drawFromTaxable to magi. That would introduce a defect, not fix one:
//   * drawFromTaxable is a withdrawal from a TAXABLE BROKERAGE account. It is mostly
//     return of basis; only realized gain is income, and at preferential rates. Adding
//     the whole draw to MAGI would tax returned principal as ordinary income.
//   * The source already says so at the line (v5.24 L4161-4162), and Engine B agrees:
//     computeTaxPlan sets capGains_y = 0, "conservatively 0 unless a sale is modeled."
//     Neither engine models realized gains. That is a disclosed, consistent simplification.
// So the magi expression is CORRECT and must stay as it is. What is wrong is the
// CLASSIFICATION feeding it: _taxInit swallows every otherAccounts dollar (pin B-1), so
// money that ought to be traditional is spent as brokerage and therefore never enters MAGI
// as tradDraw. Fixing the classification is release (c); the magi expression needs no edit.
//
// The assertion below is unchanged and still passes — only its label and reasoning were wrong.
// This finding has now been stated wrongly four times across three documents; if you are
// about to "fix" magi, read SCOPE_ENGINE_D_MAGI_v5_24.md §1 before touching anything.
// RELEASE (c) CHANGES THIS \u2014 when the pot is classified, re-point this pin at tradDraw.
const SRC = readFileSync("../DangerClose.jsx", "utf8");
const magiLine = SRC.split("\n").find(l => /const magi\s*=/.test(l) && /streamsOrd_y/.test(l));
ck("source: the Engine D magi expression was located", !!magiLine);
ck("[KNOWN DEFECT 2026-08-11 | rel c] misclassified pot never reaches MAGI (magi correctly excludes brokerage draws)",
   !!magiLine && !/drawFromTaxable/.test(magiLine),
   magiLine && magiLine.trim().slice(0, 110));
ck("...and it does name the components it DOES count (guards against a renamed variable)",
   !!magiLine && /rmd_y/.test(magiLine) && /conv_y/.test(magiLine) && /pen_y/.test(magiLine));

// ── B-3 · named traditional IRA money inside otherAccounts never reaches the balance
// RMDs are computed on. Perturb the named IRA and watch where the money lands.
//
// NOTE, and it matters: lifetime RMD *does* move under this perturbation \u2014 but only
// INDIRECTLY, because a larger taxable pot means less traditional drawdown, leaving a
// larger traditional balance at RMD age. The defect is that _tradInit itself is
// untouched. An earlier statement of this pin ("the $90K IRA produces no RMD anywhere")
// was wrong as an assertion and would have failed; corrected 2026-08-11.
// RELEASE (c) FIXES THIS \u2014 this assertion must then FAIL and be replaced.
const P1 = JSON.parse(JSON.stringify(P0));
const namedIRA = (P1.otherAccounts || []).find(a => /Rollover IRA/i.test(a.label || a.name || ""));
ck("fixture: the example household has a NAMED traditional IRA inside otherAccounts",
   !!namedIRA, "not found");
if (namedIRA) {
  const BUMP = 100000;
  namedIRA.balance += BUMP;
  P1.household = (P1.household || 0) + BUMP;
  g.setPortfolio(P1);
  const after = g.computeWithdrawalPlan(ARGS);
  // PIN FLIPPED AT v5.26 — this is the fix's own verification. The two assertions below are the
  // EXACT INVERSE of what stood here through v5.25, when adding $100K to a named IRA left the
  // pre-tax basis untouched and the money was spent as already-taxed cash.
  ck("[FIXED v5.26, was KNOWN DEFECT] +$100K of NAMED IRA now RAISES _tradInit by exactly $100K",
     Math.round(after._tradInit - r._tradInit) === BUMP,
     `${$(r._tradInit)} -> ${$(after._tradInit)}`);
  ck("[FIXED v5.26] ...and the Priority-1 pool still grows by it, because the DRAW ORDER is unchanged",
     Math.round(after._taxInit - r._taxInit) === BUMP,
     `delta ${$(after._taxInit - r._taxInit)}, expected ${$(BUMP)}`);
  // The distinction that makes the two compatible: the money is still SPENT first, but it is no
  // longer spent TAX-FREE. Releases (a)-(c) never moved this money; they changed what it costs.
  ck("[FIXED v5.26] the extra IRA also raises the RMD basis by $100K (it is Traditional)",
     Math.round(after._tradInit - r._tradInit) === BUMP);
  g.setPortfolio(P0);
  const restored = g.computeWithdrawalPlan(ARGS);
  ck("fixture restored \u2014 figures return to baseline",
     Math.round(restored._taxInit) === Math.round(r._taxInit) &&
     Math.round(restored.totalDrawn) === Math.round(r.totalDrawn));
}

// ══ v5.34 — EXTINCTION: the S-7 basis tracker is OUT, and must stay out until the
//    sequencer below is fixed ══════════════════════════════════════════════════════════
// v5.34 briefly gave Engine D a cost-basis tracker and published a realized-gain series that
// Engines B and C added to MAGI. It was backed out before shipping: the gain was computed on
// `drawFromTaxable`, which includes an RMD the sequencer routes THROUGH the taxable sleeve, so
// it invented gain in households with no taxable account at all ($24,657 in year one of t17
// case G, which holds a Traditional IRA and nothing else). These assertions exist so the layer
// cannot return before the defect pinned below is fixed. FLIP THEM AT v5.35, together.
console.log("\n  v5.34 \u2014 extinction: no basis tracker on the schedule, no engine reading one");
{
  const row = r.schedule[0];
  ck("EXTINCTION: the schedule row publishes no capGain_y", !("capGain_y" in row));
  ck("EXTINCTION: the schedule row publishes no taxBasis", !("taxBasis" in row));
  // AST would be better; a text scan is sufficient here because these identifiers do not occur
  // in DOCS_HTML and the one-line blob is excluded by length, as elsewhere in this suite.
  const body = SRC.split("\n").filter(l => l.length < 5000).join("\n");
  ck("EXTINCTION: no engine reads a per-year gain series (_gainByYr / _gainByYrI)",
     !body.includes("_gainByYr"), "a gain series is wired into an engine again");
  ck("EXTINCTION: Engine B's capGains_y is back to the disclosed hardcoded 0",
     body.includes("const capGains_y = 0;"), "Engine B is reading a gain series again");
}

// ══ FIXED AT v5.35 — Engine D SOURCES THE RMD FROM WHERE THE MONEY LIVES ═════════════
// This was the [KNOWN DEFECT 2026-08-15] pin. Through v5.34 the sequencer folded the RMD into
// a generic `totalToWithdraw = drawNeeded + rmd_y` and satisfied the WHOLE of it from the
// taxable pool first, then handed the same cash back as RMD surplus. An RMD is a distribution
// from the retirement account and cannot be met by selling brokerage assets. The round trip is
// balance-neutral, which is why it survived many releases — and it is what made the v5.34
// basis tracker invent gain in households with no taxable account at all. PRE-EXISTING: v5.33
// and earlier behave identically, so this was never a v5.34 regression.
// v5.35 decomposes `rmd_y` by source — the share resting on the buckets is drawn B1→B4, the
// share resting on a named IRA under Other accounts is drawn from the taxable sleeve where
// that money has actually lived since v5.26 — and the spending need becomes the remainder.
// The pin is now flipped to the positive statement (OPERATIONS §D).
//
// ⚠ THE SECOND ASSERTION WAS REWRITTEN, NOT INVERTED, and the reason is worth keeping.
// It used to read "...and the pool GROWS across that year, so no money really left". Measured
// on BOTH builds: the taxable sleeve grows across 2039 either way — 206,339 → 213,455 on
// v5.34 and 206,339 → 302,153 on v5.35, because the unspent RMD surplus lands there in both
// cases. It therefore discriminated NOTHING, and inverting it would have asserted something
// false. Deleting it silently would have lost the coverage. It is replaced by the statement
// that is actually wrong on the old build: the BUCKETS fall by exactly `rmd_y`.
// (Checked and deliberately NOT used for the same reason: the per-bucket growth identity
// `b_eoy == (b_boy - draw) * (1 + growth)` holds to 6 decimal places on v5.34 AND v5.35 — it
// is a structural truth about the loop, not evidence about sourcing. OPERATIONS §B2.)
console.log("\n  v5.35 — the RMD is sourced from the buckets, not the taxable sleeve");
{
  // ⚠ t19's OWN fixture does not exercise this and cannot be made to. Measured: across its whole
  // schedule `drawNeeded` exceeds `rmd_y` every year, so every taxable draw it makes is a genuine
  // sale funding a genuine shortfall. Two earlier drafts of this pin were written against that
  // fixture and asserted nothing — 0 qualifying years both times. A purpose-built household is
  // therefore required, and the fact that it IS required is itself worth recording: the defect
  // needs guaranteed income large enough to cover expenses, which the demo household lacks.
  // applyLoadedData (not setPortfolio) because Engine D reads PLAN_TIMELINE, which only
  // applyLoadedData rebuilds, and it takes a WRAPPER object (OPERATIONS §C).
  const PSAVE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
  const PD = JSON.parse(JSON.stringify(PSAVE));
  PD.positions = [{ name: "IRA", balance: 2000000, trad: 2000000, roth: 0, type: "equity" }];
  PD.otherAccounts = [];
  PD.single = false; PD.lifeExpA = 95; PD.lifeExpB = 95;
  PD.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
  const zSS = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
  PD.incomeSources = { ssA: { ...zSS }, ssB: { ...zSS }, pension: { amount: 150000 / 12 } };
  g.applyLoadedData({ portfolio: PD });
  const d = g.computeWithdrawalPlan({
    retireYear: g.PLAN_TIMELINE().targetRetireYear, rothAmount: 0, scenarioPreset: "base" });
  const noSpend = d.schedule.filter(x => x.drawNeeded === 0 && x.rmd_y > 0 && x.taxable > x.rmd_y);
  const bucketDraw = (x) => x.drawFromB1 + x.drawFromB2 + x.drawFromB3 + x.drawFromB4;
  const y = noSpend[0];
  ck("a no-spend RMD year exists on the purpose-built household", !!y,
     y ? `${y.yr}` : "none \u2014 the household no longer produces one");
  if (y) {
    // FLIPPED FROM THE PIN. Was: drawFromTaxable === rmd_y. This household holds no Other
    // accounts, so `taxRmdA`/`taxRmdB` are zero and the whole RMD is bucket-attributable —
    // the sleeve must fund none of it. Measured 2039: v5.34 drew $85,740 from taxable and
    // $0 from the buckets; v5.35 draws $0 and $85,740.
    ck("the RMD is NOT drawn from the taxable sleeve when nothing is spent",
       y.drawFromTaxable === 0,
       `${y.yr}: drawNeeded ${$(y.drawNeeded)}, rmd ${$(y.rmd_y)}, drawFromTaxable ${$(y.drawFromTaxable)}`);
    // REWRITTEN, not inverted — see the block header. This is the statement that is false on
    // v5.34 and true on v5.35, asserted to the cent because the decomposition reuses the SAME
    // arithmetic that produces `rmd_y`, so the parts must sum back to it exactly.
    ck("...and the BUCKETS fall by exactly rmd_y, to the cent",
       Math.abs(bucketDraw(y) - y.rmd_y) < 0.01,
       `${y.yr}: bucket draw ${$(bucketDraw(y))} vs rmd ${$(y.rmd_y)} (delta ${(bucketDraw(y) - y.rmd_y).toFixed(4)})`);
    // EVERY such year, not just the first. A partial fix — one that corrects the first RMD
    // year and lets later years fall back to the sleeve — passes both checks above and fails
    // this one. Measured: 7 qualifying years on this household, 7 correct on v5.35, 0 on v5.34.
    const good = noSpend.filter(x => x.drawFromTaxable === 0 && Math.abs(bucketDraw(x) - x.rmd_y) < 0.01);
    ck("...and it holds in EVERY no-spend RMD year on this household, not just the first",
       good.length === noSpend.length && noSpend.length > 1,
       `${good.length} of ${noSpend.length} years`);
    // WIDENED FROM drawNeeded === 0 BECAUSE A NEGATIVE CONTROL DID NOT FIRE (§B2).
    // Reverting the sequencer's `spendNeed = Math.max(0, drawNeeded - rmdTaken)` to a bare
    // `drawNeeded` left BOTH suites green while moving this household's `totalDrawn` +34%
    // (1,765,076 -> 2,374,281) and its ending portfolio -18% (4,386,711 -> 3,593,203). The
    // no-spend years could not see it: `drawNeeded` is 0 there, so the two expressions agree.
    // The discriminating set is every year the RMD ALREADY COVERS the spending need — nothing
    // should be sold in those either. 23 such years here; the last 16 have drawNeeded > 0.
    const covered = d.schedule.filter(x => x.rmd_y > 0 && x.rmd_y >= x.drawNeeded);
    const clean = covered.filter(x => x.drawFromTaxable === 0);
    ck("nothing is sold from taxable in ANY year the RMD already covers the spending need",
       clean.length === covered.length && covered.filter(x => x.drawNeeded > 0).length > 0,
       `${clean.length} of ${covered.length} covered years clean; ` +
       `${covered.filter(x => x.drawNeeded > 0).length} of them have a real spending need`);
    // MAGI CARRIES EACH RMD DOLLAR EXACTLY ONCE — scope §5, and the second control that did
    // not fire. This household has zeroed SS, no conversions, no work income and no streams,
    // so MAGI must be the pension plus the RMD and nothing else. HAND-COMPUTED: pension is
    // $150,000/yr flat, so 2039 must read 150,000 + 85,740 = 235,740, and it does, to the cent.
    // Reverting `tradDraw` to `total401kDraw * tradFrac` hands the RMD's bucket draw back to
    // the draw term and this residual becomes $161,079 in year one; without this assertion that
    // revert moved lifetime MAGI +25% (7,015,076 -> 8,780,152) with the suite fully green.
    const resid = d.schedule.filter(x => x.rmd_y > 0)
                            .map(x => Math.abs(x.magi - (x.pen_y + x.rmd_y)));
    const worst = resid.length ? Math.max(...resid) : Infinity;
    ck("MAGI carries each RMD dollar exactly ONCE — magi === pension + rmd_y, to the cent",
       worst < 0.01 && resid.length > 1,
       `worst residual ${worst.toFixed(2)} across ${resid.length} RMD years`);
  }
  // EXTINCTION (OPERATIONS §D): the folded need must not come back. `totalToWithdraw` was the
  // single expression that made the defect possible; if it returns, the decomposition above has
  // been undone regardless of what the year-level assertions happen to measure.
  {
    // ⚠ COMMENT LINES ARE EXCLUDED, and that is not tidiness — the first draft of this check
    // FAILED against a correct build. v5.35's own explanatory comment at the sequencer quotes
    // the retired expression verbatim ("...folded the RMD into `totalToWithdraw = drawNeeded +
    // rmd_y`"), so a plain text scan reports the defect it is describing. AST resolution says
    // 0 hits in v5.35 and 3 in v5.34, which is the true answer; this filter reproduces it.
    // OPERATIONS §B1 is right that a scan is the weaker instrument — it is used here because
    // t19 has no AST dependency, and the residual risk is a TRAILING comment mentioning the
    // identifier, which would fail the release loudly rather than pass it quietly.
    const code = SRC.split("\n")
      .filter(l => l.length < 5000 && !l.trim().startsWith("//"))
      .join("\n");
    ck("EXTINCTION: the sequencer no longer folds the RMD into a generic totalToWithdraw",
       !code.includes("totalToWithdraw"), "the folded withdrawal need is back in the source");
  }
  g.applyLoadedData({ portfolio: PSAVE });
  const back = g.computeWithdrawalPlan(ARGS);
  ck("fixture restored after the defect pin \u2014 baseline figures return",
     Math.round(back.totalDrawn) === Math.round(r.totalDrawn),
     `${$(back.totalDrawn)} vs ${$(r.totalDrawn)}`);
}

// ══ v5.35 — THE SPLIT RMD: money in a named IRA under Other accounts, AND a spending need ═══
// ADDED BECAUSE A NEGATIVE CONTROL DID NOT FIRE (OPERATIONS §B2), and it is the second household
// this release needs rather than a nicety. The one above holds everything in the buckets, so its
// sleeve RMD is zero and `taxOrd` never matters; `t20`'s fixture has a sleeve RMD but its pool is
// diluted by returned surplus. Neither could see `othOrdDraw` being reverted to charge the WHOLE
// taxable draw instead of only the spending draw — the revert moved lifetime MAGI by +452,599 and
// both suites stayed green.
//
// The shape that discriminates: guaranteed income covering MOST of expenses, so the pool is not
// drained before RMD age and the sleeve RMD stays large, but a real spending draw still happens.
// Measured here: 23 RMD years, ALL sleeve-sourced, ALL with a genuine spending need, and 4 in
// which `rmd_y` exceeds the whole bucket total — which also exercises the shortfall path the
// scope asked for and the household above cannot reach.
console.log("\n  v5.35 — split RMD: bucket share and named-IRA share, with a real spending need");
{
  const PSAVE2 = JSON.parse(JSON.stringify(g.PORTFOLIO()));
  const PS = JSON.parse(JSON.stringify(PSAVE2));
  PS.positions = [{ name: "Bucket", balance: 200000, trad: 200000, roth: 0, type: "equity" }];
  PS.total401k = 200000; PS.household = 2200000;
  PS.otherAccounts = [{ name: "Rollover IRA (A)", balance: 2000000, owner: "A", taxType: "trad" }];
  PS.single = false; PS.lifeExpA = 95; PS.lifeExpB = 95;
  PS.incomeStreams = [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }];
  const z2 = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
  PS.incomeSources = { ssA: { ...z2 }, ssB: { ...z2 }, pension: { amount: 120000 / 12 } };
  g.applyLoadedData({ portfolio: PS });
  const ds = g.computeWithdrawalPlan({
    retireYear: g.PLAN_TIMELINE().targetRetireYear, rothAmount: 0, scenarioPreset: "base" });
  const bdraw = (x) => x.drawFromB1 + x.drawFromB2 + x.drawFromB3 + x.drawFromB4;
  const RY = ds.schedule.filter(x => x.rmd_y > 0);

  // NOT VACUOUS — three separate ways, because this suite's history is fixtures that asserted
  // nothing. `t20` found three vacuous ones in a single release.
  ck("PRECONDITION: the RMD is genuinely SPLIT — both sleeves contribute in the first RMD year",
     RY.length > 0 && RY[0].drawFromTaxable > 0 && bdraw(RY[0]) > 0,
     RY.length ? `${RY[0].yr}: sleeve ${$(RY[0].drawFromTaxable)} + buckets ${$(bdraw(RY[0]))}` : "no RMD year");
  ck("PRECONDITION: every RMD year here has a REAL spending need (this is what the all-bucket household lacks)",
     RY.length > 1 && RY.every(x => x.drawNeeded > 0),
     `${RY.filter(x => x.drawNeeded > 0).length} of ${RY.length}`);
  ck("PRECONDITION: the SHORTFALL path is exercised — rmd_y exceeds the whole bucket total in some years",
     RY.filter(x => x.rmd_y > x.b1 + x.b2 + x.b3 + x.b4).length > 0,
     `${RY.filter(x => x.rmd_y > x.b1 + x.b2 + x.b3 + x.b4).length} such years`);

  // THE TWO COMPONENTS SUM TO rmd_y TO THE CENT. The decomposition reuses the same arithmetic
  // that produces `rmd_y`, so in any year the RMD already covers the spending need, the entire
  // withdrawal IS the RMD and the parts must add back exactly. 2039 hand-checked:
  // sleeve 81,218.51 + buckets 11,022.09 = 92,240.60 against rmd_y 92,240.59.
  const cov = RY.filter(x => x.rmd_y >= x.drawNeeded);
  const summed = cov.filter(x => Math.abs((x.drawFromTaxable + bdraw(x)) - x.rmd_y) < 0.01);
  ck("the bucket share and the sleeve share sum to rmd_y, to the cent",
     summed.length === cov.length && cov.length > 1,
     `${summed.length} of ${cov.length} covered years`);

  // THE ONE THE CONTROL DEMANDED. Zeroed SS, no conversions, no work, no streams, flat pension —
  // so MAGI must be pension + rmd_y and nothing else. HAND-COMPUTED: 2039 is 120,000 + 92,240.59
  // = 212,240.59, and the engine reads 212,240.59. Reverting `othOrdDraw` alone drives the worst
  // residual to 57,861.81; reverting the sequencer, 13,456.48; reverting `tradDraw`, 16,010.34.
  const worst2 = Math.max(...RY.map(x => Math.abs(x.magi - (x.pen_y + x.rmd_y))));
  ck("MAGI carries each RMD dollar exactly ONCE on a SPLIT household too, to the cent",
     worst2 < 0.01, `worst residual ${worst2.toFixed(2)} across ${RY.length} RMD years`);

  g.applyLoadedData({ portfolio: PSAVE2 });
  const back2 = g.computeWithdrawalPlan(ARGS);
  ck("fixture restored after the split-RMD household \u2014 baseline figures return",
     Math.round(back2.totalDrawn) === Math.round(r.totalDrawn),
     `${$(back2.totalDrawn)} vs ${$(r.totalDrawn)}`);
}

console.log(`\nt19 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
