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
// ══ FLIPPED AT v5.36 — the basis tracker is BACK, on a corrected target ═══════════════
// The four assertions below stood as extinction checks from v5.34, guarding against the layer
// returning before the sequencer defect was fixed. v5.35 fixed the sequencer; v5.36 re-lands the
// layer against `_spendFromTaxable` — the brokerage sale — rather than `drawFromTaxable`, which
// since v5.35 is that sale PLUS a sleeve RMD that sells nothing. Two of the four were inverted
// when the tracker landed; the two naming Engine B/C consumption stood as extinction checks
// until the consumption half landed LATER IN THE SAME RELEASE (session 2, scope decision 3,
// shape (b)) — all four are now positive statements. Engine B takes `gainByYr` as `_gainByYr`,
// Engine C as `_gainByYrI`; both DEFAULT to {} so this suite's own direct calls (and t17/t18's)
// run gain-free, which is why inverting these is safe for every fixture above.
console.log("\n  v5.36 \u2014 the basis tracker is back, on the spending sale only");
{
  const row = r.schedule[0];
  ck("[FLIPPED v5.36, was EXTINCTION] the schedule row publishes capGain_y", "capGain_y" in row);
  ck("[FLIPPED v5.36, was EXTINCTION] the schedule row publishes taxBasis", "taxBasis" in row);
  // AST would be better; a text scan is sufficient here because these identifiers do not occur
  // in DOCS_HTML and the one-line blob is excluded by length, as elsewhere in this suite.
  const body = SRC.split("\n").filter(l => l.length < 5000).join("\n");
  ck("[FLIPPED v5.36, was EXTINCTION] Engine B consumes the gain series (_gainByYr is wired)",
     body.includes("_gainByYr"), "no engine reads a per-year gain series");
  ck("[FLIPPED v5.36, was EXTINCTION] Engine B's hardcoded `const capGains_y = 0;` is GONE",
     !body.includes("const capGains_y = 0;"), "the disclosed hardcoded 0 is back");
  ck("[NEW v5.36] Engine C consumes its own gain series (_gainByYrI is wired \u2014 the substring above matches B alone or both, this one binds C)",
     body.includes("_gainByYrI"), "Engine C's MAGI does not read a gain series");
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

// ══ v5.36 — THE DRAWDOWN REALIZES CAPITAL GAINS (S-7) ════════════════════════
// The release exists to make ONE distinction: a brokerage sale realizes gain, a required
// distribution routed through the taxable sleeve does not. Both live inside `drawFromTaxable`
// since v5.35, so a literal port of the v5.34 plan taxes both — the defect that made v5.34 back
// S-7 out. Every assertion below is written to FAIL on that literal port.
//
// ⚠ EVERY HOUSEHOLD HERE IS BUILT EXPLICITLY, not inherited. The first draft of this block
// reused whatever the preceding block left in PORTFOLIO and produced ZERO RMD-covered years —
// the discriminating case was not being exercised at all, and only the PRECONDITION checks said
// so. That is the OPERATIONS §B2 failure caught by its own guard rather than shipped.
console.log("\n  v5.36 — gain on the SPENDING SALE only");
{
  const PSAVE3 = JSON.parse(JSON.stringify(g.PORTFOLIO()));
  const RETIRE = () => g.PLAN_TIMELINE().targetRetireYear;
  const planFor = (P) => { g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(P)) });
    return g.computeWithdrawalPlan({ retireYear: RETIRE(), rothAmount: 0, scenarioPreset: "base" }); };
  const lifeGain = (plan) => plan.schedule.reduce((t, x) => t + x.capGain_y, 0);

  // ── (1) THE DISCRIMINATING CASE ────────────────────────────────────────────────────────
  // A named IRA under Other accounts, plus a pension large enough to cover the spending need.
  // In every such year the taxable draw is PURELY the sleeve's RMD — nothing is sold — so the
  // gain must be exactly zero. A literal port reports gain in all of them.
  const sleeveHH = (taxType) => {
    const P = JSON.parse(JSON.stringify(PSAVE3));
    P.otherAccounts = [{ name: "Rollover IRA", balance: 600000, owner: "A", taxType }];
    P.household = (P.total401k || 0) + 600000;
    P.single = false; P.lifeExpA = 95; P.lifeExpB = 95;
    const zSS = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
    P.incomeSources = { ssA: { ...zSS }, ssB: { ...zSS }, pension: { amount: 150000 / 12 } };
    P.taxableGainPct = 40;
    return P;
  };
  const sl = planFor(sleeveHH("trad"));
  const covered = sl.schedule.filter(x => x.rmd_y >= x.drawNeeded);
  const leaked = covered.filter(x => x.capGain_y > 0.005);
  const maxCoveredDraw = Math.max(...covered.map(x => x.drawFromTaxable), 0);
  ck("PRECONDITION: the sleeve household really does have RMD-covered years",
     covered.length > 5, `${covered.length} covered years`);
  ck("PRECONDITION: and those years DO draw from the taxable sleeve (not a vacuous check)",
     maxCoveredDraw > 1000, `max draw in a covered year ${$(maxCoveredDraw)}`);
  ck("NO capital gain in ANY year the RMD covered the spending need — nothing was sold",
     leaked.length === 0,
     leaked.length ? `${leaked.length} leaking, first ${leaked[0].yr} gain ${$(leaked[0].capGain_y)}`
                   : `0 leaking across ${covered.length} years, largest sleeve draw ${$(maxCoveredDraw)}`);

  // ── (2) GAIN ON A GENUINE SALE, HAND-COMPUTED TO THE CENT ──────────────────────────────
  // No Other accounts at all, so the heterogeneous-pool correction cannot confound the figure:
  // the whole pool is gains-bearing. Opening basis = 400,000 − 0.40 × 400,000 = 240,000, basis
  // fraction 0.60. Sale 16,240.00 → gain 6,496.00, basis 240,000 − 9,744 = 230,256.00.
  const PC = JSON.parse(JSON.stringify(PSAVE3));
  PC.otherAccounts = [];
  PC.household = (PC.total401k || 0) + 400000;
  PC.taxableGainPct = 40;
  const cl = planFor(PC);
  const y0 = cl.schedule[0];
  const _sale = y0.drawFromTaxable;               // no named IRA ⇒ the sleeve RMD is 0
  const _basis0 = 400000 - 400000 * 0.40;
  const _handGain = _sale * (1 - _basis0 / 400000);
  const _handBasis = _basis0 - _sale * (_basis0 / 400000);
  ck("PRECONDITION: the clean household sells in its first year", _sale > 1000, `sale ${$(_sale)}`);
  ck("gain on a genuine sale matches the hand computation to the cent",
     Math.abs(y0.capGain_y - _handGain) < 0.01,
     `engine ${y0.capGain_y.toFixed(2)} vs hand ${_handGain.toFixed(2)}`);
  ck("...and so does the cost basis it leaves behind",
     Math.abs(y0.taxBasis - _handBasis) < 0.01,
     `engine ${y0.taxBasis.toFixed(2)} vs hand ${_handBasis.toFixed(2)}`);

  // ── (3) rmdToTaxable ENTERS AT FULL BASIS ──────────────────────────────────────────────
  // Unspent RMD cash has already been taxed as income. If it landed without its basis the model
  // would charge capital-gains tax on it later — the same dollar taxed twice by a second route.
  const surplusYrs = sl.schedule.filter(x => x.rmd_y > x.drawNeeded + 1);
  ck("PRECONDITION: the sleeve household banks RMD surplus into the taxable pool",
     surplusYrs.length > 3, `${surplusYrs.length} surplus years`);
  // ⚠ THE IDENTITY, STATED CORRECTLY — two earlier drafts of this check were wrong, and BOTH
  // failed against correct code. The first compared the change in EMBEDDED GAIN against the
  // surplus, which conflates the surplus with the growth that also accrues that year. The second
  // asserted "basis rises by at least the surplus", which ignores that the SAME year's sleeve RMD
  // removes basis on its way out. In a covered year nothing is sold, so `drawFromTaxable` IS the
  // sleeve RMD, and the exact statement is:
  //     Δbasis = surplus − sleeveRmdDraw + (growth on the non-gains-bearing remainder),  all ≥ 0
  // so Δbasis must be AT LEAST (surplus − drawFromTaxable). If the surplus arrived without its
  // basis, Δbasis falls short of that bound by the whole surplus. Recorded because a check that
  // fails against correct code is as expensive as one that passes against broken code.
  const noSale = surplusYrs.filter(x => x.rmd_y >= x.drawNeeded);
  const shortfall = noSale.filter((x) => {
    const i = sl.schedule.indexOf(x); if (i < 1) return false;
    const dBasis = x.taxBasis - sl.schedule[i - 1].taxBasis;
    return dBasis < (Math.max(0, x.rmd_y - x.drawNeeded) - x.drawFromTaxable) - 0.01;
  });
  ck("PRECONDITION: there are surplus years in which nothing is sold",
     noSale.length > 3, `${noSale.length} no-sale surplus years`);
  ck("banked RMD surplus enters at FULL BASIS — basis rises by the surplus net of the sleeve RMD",
     shortfall.length === 0,
     `${shortfall.length} of ${noSale.length} years fell short of (surplus − sleeveRmdDraw)`);

  // ── (4) BASIS CONSERVATION on every household this suite builds ────────────────────────
  for (const [label, plan] of [["sleeve", sl], ["clean", cl], ["baseline", r]]) {
    const bad = plan.schedule.filter(x =>
      !(x.taxBasis >= -0.005 && x.taxBasis <= x.taxable + 0.005 && x.capGain_y >= -0.005));
    ck(`basis conservation holds every year on the ${label} household`, bad.length === 0,
       bad.length ? `${bad.length} violations, first ${bad[0].yr}: basis ${$(bad[0].taxBasis)} pool ${$(bad[0].taxable)}`
                  : `${plan.schedule.length} years clean`);
  }

  // ── (5) THE EXCLUSION SURVIVES GROWTH — stated as a COMPARISON, not a threshold ────────
  // ONE household, ONE $600,000 Other-accounts row, and only its `taxType` changes. Ordinary and
  // HSA money cannot carry a capital gain, so those two must realize far less than the same row
  // typed `taxable` — even though the `trad` case SELLS MORE THAN TWICE AS MUCH, because its RMD
  // keeps pulling money through the sleeve.
  //
  // This is deliberately a ratio between measured runs rather than a tuned constant. It is also
  // the assertion that catches the defect found during this build: excluding ordinary and HSA
  // only at INITIALISATION is undone by growth, because growth is applied to the whole
  // heterogeneous pool while cost basis is not. Before the growth-basis credit the `trad` case
  // realized $25,799 with $107,265 of embedded gain by 2038, on a pool holding no asset that can
  // carry one. Revert that credit and this fails.
  const sellHH = (taxType) => {
    const P = JSON.parse(JSON.stringify(PSAVE3));
    P.otherAccounts = [{ name: "Big Account", balance: 600000, owner: "A", taxType }];
    P.household = (P.total401k || 0) + 600000;
    P.taxableGainPct = 40;
    return P;
  };
  const gTrad = lifeGain(planFor(sellHH("trad")));
  const gHsa  = lifeGain(planFor(sellHH("hsa")));
  const gTax  = lifeGain(planFor(sellHH("taxable")));
  const drawTrad = planFor(sellHH("trad")).schedule.reduce((t, x) => t + x.drawFromTaxable, 0);
  const drawTax  = planFor(sellHH("taxable")).schedule.reduce((t, x) => t + x.drawFromTaxable, 0);
  ck("PRECONDITION: the brokerage-typed row really does realize gain (bar is not trivially met)",
     gTax > 50000, `taxable-typed lifetime gain ${$(gTax)}`);
  // The bound is ">" and not a tuned multiple: the CLAIM is that the trad row realizes less gain
  // despite selling MORE, so "more" is the whole precondition. (An earlier draft asserted 1.5x, a
  // figure taken from a run using a different retire year — measured here it is ~1.3x. The
  // constant was wrong, not the code, and a constant carried between fixtures is worth nothing.)
  ck("PRECONDITION: and the trad-typed row SELLS MORE, so the comparison is not just about volume",
     drawTrad > drawTax, `trad draw ${$(drawTrad)} vs taxable draw ${$(drawTax)} (${(drawTrad / drawTax).toFixed(2)}x)`);
  // EXACT, not an order of magnitude. The sub-pool model makes this a structural property rather
  // than a numerical outcome: a pool with nothing gains-bearing in it holds `taxGainPool === 0`
  // for every year of the plan, so no sale can realize a cent no matter how long the horizon or
  // how fast the growth. The earlier whole-pool tracker could only manage "small" here — $1,518,
  // rising with horizon — and an "order of magnitude" assertion cannot tell $1,518 from $0.
  ck("an ORDINARY-typed row realizes EXACTLY zero capital gain",
     Math.round(gTrad * 100) === 0, `trad ${gTrad.toFixed(2)} vs taxable ${$(gTax)}`);
  ck("an HSA-typed row realizes EXACTLY zero too (scope decision 7)",
     Math.round(gHsa * 100) === 0, `hsa ${gHsa.toFixed(2)} vs taxable ${$(gTax)}`);
  // ...and the DIRECT statement, on the balance itself rather than on its consequence. A gain
  // series reads zero both when the exclusion works and when the tracker is never consulted at
  // all; the sub-pool balance distinguishes those two.
  // ⚠ STATED CAREFULLY. An earlier draft asserted `taxGainPool === 0` in EVERY year and failed
  // against correct code at $790,749 — because banked RMD surplus legitimately JOINS this pool
  // (it is after-tax brokerage cash from then on, and that is a recorded modelling decision).
  // The claim that actually holds is that none of the ORIGINAL ordinary balance is ever in it:
  // the pool is exactly zero at retirement and stays zero until the first dollar of surplus is
  // banked. That is the statement the exclusion makes, and it is the one asserted.
  const tradSched = planFor(sellHH("trad")).schedule;
  const taxSched = planFor(sellHH("taxable")).schedule;
  const firstSurplus = tradSched.findIndex(x => x.rmd_y > x.drawNeeded + 1);
  const preSurplus = firstSurplus < 0 ? tradSched : tradSched.slice(0, firstSurplus);
  ck("PRECONDITION: the ordinary-typed household runs for years before it banks any surplus",
     preSurplus.length > 3, `${preSurplus.length} pre-surplus years`);
  ck("the gains-bearing sub-pool is EXACTLY zero for an ordinary-typed row until surplus is banked",
     preSurplus.every(x => x.taxGainPool < 0.005),
     `max taxGainPool over ${preSurplus.length} pre-surplus years: ${$(Math.max(...preSurplus.map(x => x.taxGainPool)))}`);
  ck("PRECONDITION: and NON-zero from year one for the brokerage-typed row (the tracker is live)",
     taxSched.every(x => x.taxGainPool > 0.005),
     `min taxGainPool ${$(Math.min(...taxSched.map(x => x.taxGainPool)))}`);

  // ── (6) THE MIXED POOL — added because a negative control did NOT fire (§B2) ────────────
  // Reverting the line that depletes the sub-pool on a sale broke NOTHING in this suite. Every
  // fixture above is homogeneous: all-ordinary (sub-pool 0, so the depletion is a no-op), all-HSA
  // (same), or all-brokerage (where `Math.min(taxable, …)` at growth re-clamps the sub-pool back
  // to the pool every year and hides the drift). The most common real household — brokerage AND
  // an IRA AND an HSA together, which is the shipped example's own shape — was not tested at all.
  // Measured on this fixture: the revert takes lifetime gain from $89,673 to $194,928 and drives
  // the gains-bearing share from a flat 41.7% to 100% by year ten, with the whole suite green.
  const mixHH = () => {
    const P = JSON.parse(JSON.stringify(PSAVE3));
    P.otherAccounts = [
      { name: "Rollover IRA", balance: 300000, owner: "A", taxType: "trad" },
      { name: "Brokerage",    balance: 250000, owner: "A", taxType: "taxable" },
      { name: "HSA",          balance:  50000, owner: "A", taxType: "hsa" },
    ];
    P.household = (P.total401k || 0) + 600000;
    P.taxableGainPct = 40;
    return P;
  };
  const mxPlan = planFor(mixHH());
  const mx = mxPlan.schedule;
  const share = (x) => x.taxable > 0 ? x.taxGainPool / x.taxable : 0;
  // The sub-pool opens at the brokerage share of the pool: 250,000 / 600,000 = 41.667%.
  ck("mixed pool: the gains-bearing share opens at the brokerage share of the pool",
     Math.abs(share(mx[0]) - 250000 / 600000) < 0.005,
     `${(100 * share(mx[0])).toFixed(2)}% vs 41.67% expected`);
  // A proportional sale takes from the sub-pool and the rest of the pool alike, so in a year that
  // sells but has no RMD activity — nothing forced out, nothing banked in — the share must not
  // move. This is the assertion the control demanded: it is false the moment the sale stops
  // depleting the sub-pool, and it cannot be satisfied by the growth clamp.
  const pureSaleYrs = mx.filter((x, i) => i > 0 && x.drawFromTaxable > 1 && x.rmd_y < 0.005);
  ck("PRECONDITION: the mixed household has sale-only years (no RMD in or out)",
     pureSaleYrs.length > 3, `${pureSaleYrs.length} sale-only years`);
  const drift = pureSaleYrs.filter((x) => {
    const i = mx.indexOf(x);
    return Math.abs(share(x) - share(mx[i - 1])) > 0.0005;
  });
  ck("mixed pool: a sale does NOT change the gains-bearing share — it depletes both sides alike",
     drift.length === 0,
     drift.length ? `${drift.length} of ${pureSaleYrs.length} drifted, first ${drift[0].yr}: ${(100 * share(drift[0])).toFixed(2)}%`
                  : `share held at ${(100 * share(pureSaleYrs[0])).toFixed(2)}% across ${pureSaleYrs.length} years`);
  ck("mixed pool: the gains-bearing share never exceeds 100% of the pool",
     mx.every(x => share(x) <= 1.000005), `max ${(100 * Math.max(...mx.map(share))).toFixed(2)}%`);

  // ── (7) v5.37 — THE ORDINARY SUB-POOL GROWS, AND CONSERVATION IS REPORTED (scope §6-4/§8-3) ──
  // v5.37 adds one line to Engine D: `taxOrd = min(taxable − taxGainPool, taxOrd × (1+growth.tax))`
  // at the same point `taxGainPool` grows. The blast radius was measured by AST census before the
  // edit: `taxOrd` is write-only into MAGI (its only consumers are `_ordFrac → othOrdDraw → magi`),
  // so the GAINS side of this household cannot move — and did not, to the microdollar:
  ck("mixed pool: lifetime realized gain is EXACTLY $89,673 — UNCHANGED by v5.37 (census: gains side never reads taxOrd)",
     Math.round(mx.reduce((s, x) => s + (x.capGain_y || 0), 0)) === 89673,
     `$${Math.round(mx.reduce((s, x) => s + (x.capGain_y || 0), 0)).toLocaleString()}`);
  // What DOES move is MAGI, through othOrdDraw: measured v5.36 → v5.37 on this exact household
  // and these exact ARGS, 3,132,745.819315 → 3,162,820.292311 (+$30,074.47 of ordinary growth
  // recognised over the plan). Pinned to the dollar; the v5.36 figure is recorded here so the
  // next re-derivation has both ends.
  ck("mixed pool: lifetime MAGI is EXACTLY $3,162,820 — the ordinary growth is recognised (was $3,132,746 at v5.36)",
     Math.round(mx.reduce((s, x) => s + (x.magi || 0), 0)) === 3162820,
     `$${Math.round(mx.reduce((s, x) => s + (x.magi || 0), 0)).toLocaleString()}`);

  // THE INDEPENDENT LEDGER — the same instrument that derived v5.37's exacts before the engine
  // was edited, carried here so the suite re-runs the derivation instead of trusting it. It
  // re-implements the whole taxable-sleeve arithmetic with its OWN copy of the IRS Uniform
  // Lifetime divisors (Pub 590-B) and SECURE 2.0 start ages, walks the engine's published
  // mechanical series, and must reproduce the published balances to the cent — only then is its
  // internal `taxOrd` (which the engine does not publish) trusted for the conservation report.
  {
    const DIV = { 72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22.0,79:21.1,80:20.2,81:19.4,
      82:18.5,83:17.7,84:16.8,85:16.0,86:15.2,87:14.4,88:13.7,89:12.9,90:12.2,91:11.5,92:10.8,
      93:10.1,94:9.5,95:8.9,96:8.4,97:7.8,98:7.3,99:6.8,100:6.4 };           // IRS Pub 590-B
    const dv = (age) => DIV[age] || 6.4;
    const startAge = (by) => !by ? 75 : by <= 1950 ? 72 : by <= 1959 ? 73 : 75;  // SECURE 2.0
    const gr = mxPlan.growth.tax;
    const dobA = mxPlan._dobAYr, dobB = mxPlan._tlW.dobB.year, single = !!mxPlan._tlW.single;
    const rA = startAge(dobA), rB = startAge(dobB);
    const port = g.PORTFOLIO();
    const bal = (f) => (port.otherAccounts || []).filter(f).reduce((s, a) => s + (a.balance || 0), 0);
    const taxInit = Math.max(0, (port.household || 0) - (port.total401k || 0));
    const ordInit = bal(a => a.taxType === "trad" || a.taxType === "annuity");
    const hsaInit = bal(a => a.taxType === "hsa");
    const shareOpen = (port.taxableGainPct != null ? port.taxableGainPct : 40) / 100;
    let T = taxInit, taxOrd = Math.min(ordInit, taxInit);
    let taxRmdA = bal(a => a.taxType === "trad" && a.owner === "A");
    let taxRmdB = bal(a => a.taxType === "trad" && a.owner === "B");
    let gp = Math.max(0, Math.min(taxInit, Math.max(0, taxInit - ordInit - hsaInit)));
    let basis = Math.max(0, gp * (1 - shareOpen));
    let worstT = 0, worstGp = 0, worstGain = 0, worstBasis = 0;
    const binds = [], viol = [];
    for (const R of mx) {
      const ageA = R.yr - dobA, ageB = R.yr - dobB;
      const rmdFromSleeve = (ageA >= rA && taxRmdA > 0 ? taxRmdA / dv(ageA) : 0)
                          + (!single && ageB >= rB && taxRmdB > 0 ? taxRmdB / dv(ageB) : 0);
      const T_boy = T;
      const sleeve = Math.min(Math.max(0, rmdFromSleeve), T_boy);
      const spend = R.drawFromTaxable - sleeve;
      const poolPostRmd = Math.max(0, T_boy - sleeve);
      const ordFrac = poolPostRmd > 0 ? Math.min(1, Math.max(0, taxOrd - sleeve) / poolPostRmd) : 0;
      const othOrd = Math.max(0, spend) * ordFrac;
      const gainShare = poolPostRmd > 0 ? Math.min(1, gp / poolPostRmd) : 0;
      const sale = Math.max(0, spend) * gainShare;
      const basisFrac = gp > 0 ? Math.min(1, basis / gp) : 1;
      const gain = Math.max(0, sale * (1 - basisFrac));
      basis = Math.max(0, basis - sale * basisFrac);
      gp = Math.max(0, gp - sale);
      taxOrd = Math.max(0, taxOrd - othOrd - sleeve);
      const shrink = T_boy > 0 ? R.drawFromTaxable / T_boy : 0;
      taxRmdA = Math.max(0, taxRmdA - taxRmdA * shrink);
      taxRmdB = Math.max(0, taxRmdB - taxRmdB * shrink);
      T = T_boy - R.drawFromTaxable;
      const u = Math.max(0, R.taxable / (1 + gr) - T);   // RMD-surplus deposit, from published EOY
      T += u; gp += u; basis += u;
      T *= (1 + gr);
      gp = Math.min(T, gp * (1 + gr));
      // v5.37's line, re-derived independently — with the binding-year report §8-3 requires:
      const grown = taxOrd * (1 + gr), cap = T - gp;
      if (grown > cap + 0.005) binds.push({ yr: R.yr, by: grown - cap });
      taxOrd = Math.min(cap, grown);
      if (taxOrd + gp > T + 0.01) viol.push({ yr: R.yr, by: taxOrd + gp - T });
      worstT = Math.max(worstT, Math.abs(T - R.taxable));
      worstGp = Math.max(worstGp, Math.abs(gp - R.taxGainPool));
      worstGain = Math.max(worstGain, Math.abs(gain - (R.capGain_y || 0)));
      const basisPub = Math.max(0, Math.min(T, T - gp + basis));
      worstBasis = Math.max(worstBasis, Math.abs(basisPub - (R.taxBasis || 0)));
    }
    ck("LEDGER: the independent re-computation reproduces the published pool to the cent every year",
       worstT < 0.01, `worst |Δ taxable| ${worstT.toFixed(6)}`);
    ck("LEDGER: ...and the gains sub-pool", worstGp < 0.01, `worst |Δ taxGainPool| ${worstGp.toFixed(6)}`);
    ck("LEDGER: ...and the realized gain", worstGain < 0.01, `worst |Δ capGain_y| ${worstGain.toFixed(6)}`);
    ck("LEDGER: ...and the published basis", worstBasis < 0.01, `worst |Δ taxBasis| ${worstBasis.toFixed(6)}`);
    // §8-3, both halves. Conservation is ONE-SIDED by design: the HSA share is the untaxed
    // remainder, so `taxOrd + taxGainPool` may sit BELOW `taxable` by the grown HSA slack —
    // asserting equality here would be wrong. What must never happen is the sum EXCEEDING the
    // pool (a dollar carrying two characters at once).
    ck("CONSERVATION (§8-3): taxOrd + taxGainPool ≤ taxable every simulated year",
       viol.length === 0, viol.length ? `${viol.length} violations, first ${viol[0].yr} by ${viol[0].by.toFixed(2)}`
                                      : "one-sided invariant holds all years");
    ck("CONSERVATION (§8-3): the growth cap binds ZERO years on this household (the required report)",
       binds.length === 0, binds.length ? `${binds.length} binding years, first ${binds[0].yr} by ${binds[0].by.toFixed(2)}`
                                        : "0 binding years — both sub-pools grow at the same rate");
  }

  g.applyLoadedData({ portfolio: PSAVE3 });
  const back3 = g.computeWithdrawalPlan(ARGS);
  ck("fixture restored after the S-7 households — baseline figures return",
     Math.round(back3.totalDrawn) === Math.round(r.totalDrawn),
     `${$(back3.totalDrawn)} vs ${$(r.totalDrawn)}`);
}

console.log(`\nt19 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
