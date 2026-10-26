// boundaries.mjs — THE BOUNDARY CENSUS (qa/tools; asserts nothing, counted in no total — §B1)
//
// WHAT THIS ANSWERS. At scope time, for a defect about to be written up: **does the household
// exercise the behaviour in question, or is it $0 there?** Point it at the shipped example
// household to learn whether a brief can quote example-data figures at all; point it at a
// PROPOSED FIXTURE to learn whether that fixture actually clears the boundary it was built for.
//
// WHY IT EXISTS. Two releases running, a defect was $0 on the example household and the $0
// property was discovered MID-BUILD, after the brief had been written: v5.45 (benefits far above
// the §86(a)(1) ½-cap band) and v5.46 (spouse B claims in January of the ladder's first year).
// Both briefs carried the line "expected figures NOT derived — the fixture is the work."
//   ⚠ The v5.46 brief claimed FOUR consecutive releases with that property. That is wrong.
//   v5.42 was non-zero on the example household at lower slider positions ($0 only at the
//   $70,000 default) and v5.44 was non-zero outright ($102,205 -> $89,562). Those are a
//   default-VIEW problem and a nobody-looked problem respectively, and this tool does not claim
//   to catch either. The honest streak is two.
//
// THE FIXTURE USE IS THE STRONGER ONE. v5.46's fixture (spouse B delaying to 70) exercised the
// claim gate across seven years and looked complete — but B claimed in JANUARY, so a pro-rata
// gate and a whole-year gate produced identical figures and the release's actual modelling
// decision would have shipped UNVERIFIED. A second fixture with a July claim was needed. This
// census would have flagged `dobB_month` on the proposed fixture before any test code was written.
//
// NO CONSTANT IS HARDCODED HERE. Every numeric threshold is read live from the app through the
// test shim — `TAX_CONSTS()` for the §86 thresholds, `rmdStartAge()` for the SECURE 2.0 split.
// A tool that keeps its own copy of a constant is a second answer that drifts, which is this
// project's recurring failure. What IS written down are the STRUCTURAL relationships (is the DOB
// month January; does B's claim year equal the ladder start) — those have no source of truth to
// read, and they are kept honest by the maintenance rule in OPERATIONS §K1 instead.

// ── the census ───────────────────────────────────────────────────────────────────────────
// Pure function of the shim object `G`, so the suite can drive it directly with no CLI, no
// module resolution and no environment. Returns rows; printing is somebody else's job.
// v6.28 (F-24): the LTC label test — the leg's exported isLTCLabel where present, else the v6.27 pattern
const ltcTest = (G) => (typeof G.isLTCLabel === "function" ? (l) => G.isLTCLabel(l) : (l) => /ltc|long.?term/i.test(String(l || "")));

export function census(G) {
  const P = G.PORTFOLIO();
  const tl = G.PLAN_TIMELINE();
  const T = G.TAX_CONSTS();
  const single = !!tl.single;
  const ssA = G.getSSA() * 12, ssB = single ? 0 : G.getSSB() * 12;

  // §86(a)(1)'s ½-benefits cap can only bind while provisional income sits in the MIDDLE tier,
  // and the widest (provisional − base) can get inside that tier is the tier's own width. So the
  // affected band is exactly THR2 − THR1 — DERIVED, not the "$12,000" figure v5.45 quoted.
  const THR1 = single ? T.SS_THR1_SGL : T.SS_THR1_MFJ;
  const THR2 = single ? T.SS_THR2_SGL : T.SS_THR2_MFJ;
  const halfCapBand = THR2 - THR1;

  const rows = [];
  const row = (id, param, value, boundary, onBoundary, note) =>
    rows.push({ id, param, value: String(value), boundary, onBoundary, note });

  row("filing", "filing status", single ? "single" : "married filing jointly",
    "single vs MFJ", true,
    single ? "single — the MFJ path is unexercised by this household"
           : "MFJ — the single path is unexercised by this household");

  for (const [k, dob] of [["A", tl.dobA], ["B", single ? null : tl.dobB]]) {
    if (!dob) { row(`dob${k}_month`, `dob${k} month`, "n/a", "1 = January", false, "single filer — no spouse B"); continue; }
    row(`dob${k}_month`, `dob${k} month`, dob.month, "1 = January", dob.month === 1,
      dob.month === 1 ? "DEGENERATE — every partial-month calculation is a no-op on this household"
                      : "exercises partial-month arithmetic");
    // SECURE 2.0 §107 — read through the app's own helper so a rule change moves this row too.
    const age = G.rmdStartAge(dob.year);
    const other = G.rmdStartAge(dob.year >= 1960 ? 1959 : 1960);
    row(`rmd_age_${k}`, `${k} RMD start age`, `${age} (born ${dob.year})`,
      `${other} vs ${age}`, true, `only the ${age} branch is exercised by this spouse`);
  }

  const start = tl.rothLadderStart;
  for (const [k, d] of [["A", tl.ssA_date], ["B", single ? null : tl.ssB_date]]) {
    if (!d) { row(`ss${k}_claim`, `${k} claim year`, "n/a", `ladder start ${start}`, false, "single filer — no spouse B"); continue; }
    const after = d.year > start;
    row(`ss${k}_claim`, `${k} claim year`, `${d.year}-${String(d.month).padStart(2, "0")}`,
      `ladder start ${start}`, !after,
      after ? "mid-ladder — the claim gate is exercised"
            : `DEGENERATE — claim ${d.year === start ? "equals" : "precedes"} the ladder start, so the gate can never fire`);
  }

  for (const [k, amt] of [["A", ssA], ["B", ssB]]) {
    if (single && k === "B") { row("ssB_band", "B benefits/yr", "n/a", `< $${halfCapBand.toLocaleString()}`, false, "single filer — no spouse B"); continue; }
    const inside = amt > 0 && amt < halfCapBand;
    row(`ss${k}_band`, `${k} benefits/yr`, "$" + amt.toLocaleString(),
      `§86(a)(1) ½-cap band < $${halfCapBand.toLocaleString()}`, !inside,
      inside ? "inside the band — the ½ cap is reachable"
             : "OUTSIDE — the ½ cap is unreachable from this household");
  }

  // ── STATE TAX · three rows, because one row could not tell three behaviours apart ──────────
  // Until 2026-08-28 this was a single `state_tax` row keyed on `P.stateTaxRate`. That row reads
  // ON for the LEGACY FLAT-RATE FALLBACK only. The 51-jurisdiction `STATE_RULES` module is
  // selected by `P.stateCode` and is a different code path — `stateTaxAnnual` branches on
  // `STATE_RULES[code]` before it ever looks at the fallback rate — so a household with a real
  // state code and no legacy rate showed this census a muted state-tax path while exercising the
  // module fully. One row, three behaviours, and the census could not say which was live.
  const rate = Number(P.stateTaxRate || 0);
  const code = P.stateCode || null;
  const RULES = (G.STATE_RULES && G.STATE_RULES()) || {};
  const rule = code ? RULES[code] : null;

  row("state_tax", "legacy flat rate", rate ? rate : "0 / unset", "0 vs non-zero", !rate,
    rate ? "exercises the LEGACY fallback path" : "ZERO — the legacy fallback is muted");

  row("state_code", "state code", code || "unset", "unset vs in STATE_RULES", !rule,
    rule ? `exercises the ${Object.keys(RULES).length}-jurisdiction module (${rule.name})`
         : "UNSET — the state module is unexercised; only the legacy path can run");

  // ── RETIRED at v5.69: the `state_excl_limited` row (D-3c, "income-limited in law, unconditional in
  //   the model"). SCOPE_RI_POPULATE D-RI-4. From v5.69 every exclusion known to be income-limited in law
  //   carries `exclTest`, so the row could only ever read OUT — a boundary nothing can cross, which this
  //   census exists to avoid. Its fixture retired with it; t29 F-6 now asserts the set is EMPTY, and
  //   t35 D-7/D-8 assert the same from the note-and-flag side. The v5.68 lesson it carried — select on
  //   DATA (`!r.exclTest`), not prose — stays recorded at the ssOffset row below and in OPERATIONS §D2.

  // v5.56 — the SS-offset class. ⚠ KEYED ON THE `ssOffset` FLAG, NOT ON NOTE PROSE. The row above
  // keys on a note "flagging an income limit", and that is exactly what broke when NJ's note was
  // reworded at v5.54: the phrase moved, the state silently left the set, and t29's F-7 failed.
  // A flag is data; prose is not. The audit's own finding was that a note-keyed row reads OFF for
  // MD, ME and CO — the states where the defect is worse — so this row must not repeat the shape.
  const ssOff = Object.entries(RULES).filter(([, r]) => !!r.ssOffset).map(([c]) => c);
  const onSsOff = !!(code && ssOff.includes(code));
  row("state_ss_offset", "SS-offset 65+ exclusion",
    onSsOff ? `${code} (cap $${(rule.excl65 || 0).toLocaleString()})` : (code || "unset"),
    `state in {${ssOff.join(",") || "none found"}}`, !onSsOff,
    onSsOff ? "exercises the SS-offset class — the exclusion is reduced by Social Security received"
            : `OUT — the SS-offset paths are unexercised; ${ssOff.length} state(s) carry ssOffset`);

  const streams = (P.incomeStreams || []).length;
  row("income_streams", "income streams", streams, "0 vs >0", streams === 0,
    streams ? "exercises the income-stream paths" : "NONE — the income-stream paths are unexercised");

  // ── stream_kinds · ADDED at v5.63, under the §K1 maintenance rule ──────────────────────
  // The defect v5.63 fixed was invisible to 2,934 green checks: the Roth comparator charged FICA
  // on EVERY ordinary stream, and no fixture in the suite carried a non-zero stream at all. But
  // `income_streams` above would not have been enough on its own — it counts streams, and a
  // WORK-only stream reads "exercised" there while never reaching the defect, because FICA on
  // wages is correct. What had to be non-zero was a NON-WORK stream. That is this row.
  //   The default is the app's own: `streamsAnnualAt` filters on `(s.kind || "other")`, so a
  // stream with no `kind` is non-work. Mirrored here rather than restated as a list of kinds —
  // if the app ever changes the default, this row must change with it and nothing else here
  // encodes a kind name.
  const kinds = (P.incomeStreams || []).map(s => s.kind || "other");
  const nonWork = kinds.filter(k => k !== "work").length;
  row("stream_kinds", "non-work streams", `${nonWork} of ${kinds.length}`,
    "0 vs >0 non-work", nonWork === 0,
    nonWork ? "exercises the non-work ordinary paths — FICA, and the work/non-work split"
            : (kinds.length ? "NONE — streams are work-only; the FICA split is unexercised"
                            : "NONE — no streams at all, so the FICA split is unexercised"));

  const wA = tl.rothLadderEndA, wB = tl.rothLadderEndB;
  row("ladder_windows", "ladder windows", single ? `A ends ${wA}` : `A ends ${wA}, B ends ${wB}`,
    "identical vs differing", single ? true : wA === wB,
    single ? "single filer — one window only"
           : (wA === wB ? "identical — the per-spouse window split is unexercised"
                        : "differ — the per-spouse window split is exercised"));

  // ── v5.75 (SCOPE_SURVIVOR_AGE_AND_GAINS_DEDUCTION) · two conditions the example data hides ────
  // Both defects this release fixed were $0 on the example household, for two different reasons,
  // and neither reason was visible in any row above.
  //
  // 1. THE SURVIVOR'S AGE. The §63(f) extra and the OBBBA bonus belong to the people ON the return;
  //    on a single return that is the FILER alone. The defect only shows when the first death
  //    leaves a survivor UNDER 65. The example household's first death leaves a survivor already
  //    past 65, so every widowed year takes the deduction legitimately and the defect is invisible.
  const firstDeathYr = single ? null : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
  if (single) {
    row("survivor_u65", "survivor age at first death", "n/a", "under 65 in a single-filing year", false,
      "single filer — no survivor transition");
  } else {
    // the survivor is whoever lives longer; ages are the model's own calendar-year arithmetic
    const survIsA = (tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB);
    const survDobYr = survIsA ? tl.dobA.year : tl.dobB.year;
    // filing turns single the year AFTER the death (Pub. 501), so that is the first exposed year
    const ageFirstSingleYr = (firstDeathYr + 1) - survDobYr;
    const exposed = ageFirstSingleYr < 65;
    row("survivor_u65", "survivor age, first single-filing year", `${ageFirstSingleYr} (in ${firstDeathYr + 1})`,
      "under 65", !exposed,
      exposed ? "exercises the survivor's own-age rule"
              : "DEGENERATE — the survivor is already 65+, so the filer-only rule cannot change any figure here");
  }

  // 2. AN UNUSED DEDUCTION AGAINST PREFERENTIAL INCOME. §1(h)(1) taxes gains at the preferential
  //    rates on gains "or, if less, taxable income", so a deduction ordinary income does not use
  //    absorbs the gains first. That can only change a figure when BOTH hold: ordinary income is
  //    below the deduction, AND preferential income reaches past the top of the 0% band (below it
  //    the rate is 0% either way, so a floored stack and a signed one agree).
  const stdNow = single ? T.SGL_STD : T.MFJ_STD;
  const seniorNow = (single ? T.SENIOR_EXTRA_SGL : T.SENIOR_EXTRA_MFJ) *
    ((tl.asOfYear - tl.dobA.year >= 65 ? 1 : 0) + (!single && tl.asOfYear - tl.dobB.year >= 65 ? 1 : 0));
  const dedNow = stdNow + seniorNow;
  const zeroTop = (single ? T.SGL_LTCG : T.MFJ_LTCG)[0].upper;
  // ordinary income as the plan states it today: Social Security is excluded (it has its own
  // inclusion rule), so this is pension + earned/other streams, read live through the shim.
  const ordNow = G.getPension() * 12 + G.streamsAnnualAt(tl.asOfYear);
  const belowDed = ordNow < dedNow;
  row("unused_ded_ord", "ordinary income vs deduction", `$${Math.round(ordNow).toLocaleString()} vs $${dedNow.toLocaleString()}`,
    "ordinary below the deduction", !belowDed,
    belowDed ? "leaves deduction unused — reachable"
             : "DEGENERATE — ordinary income covers the deduction, so nothing is left to absorb gains");
  row("unused_ded_pref", "0% band top (the other half of the condition)", `$${zeroTop.toLocaleString()}`,
    "preferential income above the 0% top", false,
    "BOTH halves are required: below the 0% top the rate is 0% either way. The example household's "
    + "preferential income is dividends on the taxable sleeve; pair this row with the one above when scoping.");

  // ── v6.08 (D-34 — SCOPE_D34_ENGINE_D_OTHER_IRA_V608) · two conditions the example data hides (§K1 maintenance rule) ────
  // Both read Engine D (the Withdrawal tab) itself, at the plan's retirement year and the BASE scenario.
  // 1. AN OTHER-ACCOUNT IRA THAT REACHES AN RMD THERE. The Withdrawal tab spends the Priority-1 pool first, so the example household's
  //    Other-account IRAs are gone years before RMD age — and the IRA tracker that never grew, and gave up its RMD pro rata (fixed
  //    v6.08), was $0 on it. Read with NO conversion, from `rmdSleeve_y` (published from v6.08; the row reads "n/a" on earlier builds).
  const _ryD = tl.targetRetireYear;
  const _wD0 = G.computeWithdrawalPlan ? G.computeWithdrawalPlan({ retireYear: _ryD, rothAmount: 0, scenarioPreset: "base" }) : null;
  const _hasS = !!(_wD0 && _wD0.schedule.length && "rmdSleeve_y" in _wD0.schedule[0]);
  const _rsbD = G.retireStartBalances ? G.retireStartBalances(_ryD) : null;
  const _othIra = _rsbD ? (_rsbD.othRmdA || 0) + (_rsbD.othRmdB || 0) : 0;
  const _sRmd = _hasS ? _wD0.schedule.reduce((t, r) => t + (r.rmdSleeve_y || 0), 0) : 0;
  row("oth_ira_rmd", "Other-account IRA RMD (Engine D)",
    _hasS ? `$${Math.round(_othIra).toLocaleString()} held; lifetime RMD on it $${Math.round(_sRmd).toLocaleString()}` : "n/a (pre-v6.08 build)",
    "an RMD figured on it", !_hasS || _sRmd < 1,
    !_hasS ? "this build does not publish the IRA's RMD"
      : _sRmd >= 1 ? "reachable — the IRA is still standing at RMD age"
      : _othIra > 0 ? "spent as Priority-1 money before RMD age, so its RMD rules are $0 here" : "no Traditional IRA under Other accounts");
  // 2. THE WITHDRAWAL TAB'S CONVERSION CAP BINDING. Engine D converts bucket money first, then that IRA; the cap only matters where the
  //    slider outruns what is left. $70,000 is the Roth tab's OPENING slider (a useState literal in the component, not readable through
  //    the shim — a structural value, like the January rows, kept honest by §K1).
  const _wD7 = G.computeWithdrawalPlan ? G.computeWithdrawalPlan({ retireYear: _ryD, rothAmount: 70000, scenarioPreset: "base" }) : null;
  const _lad = _wD7 ? _wD7.schedule.filter(r => r.yr <= _wD7._ladderEnd) : [];
  const _short = _lad.filter(r => r.conv_y < 70000 - 0.5).length;
  row("d_conv_cap", "Withdrawal-tab conversion cap", `${_short} of ${_lad.length} ladder years short of $70,000`,
    "the cap binds in a ladder year at the opening slider", _short === 0,
    _short === 0 ? "never binds at $70,000 — the cap's rules show only at higher sliders" : "reachable at the opening slider");

  // ── v6.09 (D-35 — SCOPE_D35_ENGINE_D_OTHER_ROTH_V609) · the condition that hid it (§K1) ────────────────────────────────────────
  // 3. A ROTH IRA ENTERED UNDER OTHER ACCOUNTS. Engine D held one in its Priority-1 pool as gains-bearing brokerage AND in the buckets' Roth share;
  //    the example household holds none, so both were $0 there. Structural — read from the rows, so it reads the same on any build.
  const _othRoth = (P.otherAccounts || []).reduce((t, a) => t + (a.taxType === "roth" ? (a.balance || 0) : 0), 0);
  row("oth_roth", "Roth IRA under Other accounts", `$${Math.round(_othRoth).toLocaleString()}`, "> $0 held", _othRoth <= 0,
    _othRoth > 0 ? "reachable — Engine D's Roth handling of Other accounts applies" : "none held, so Engine D's Roth handling of Other accounts is $0 here");

  // ── v6.13 (C-11 — SCOPE_C11_CROSSOVER_LABEL_V613) · the condition that hid it (§K1) ───────────────────────────────────────────
  // 4. THE ROTH TAB'S BREAK-EVEN CARD, AT THE OPENING SLIDER. The card has four outcomes; only the first ("recovered after a deficit")
  //    carried the sentence C-11 corrected, and on the example household the card shows the third ("does not break even") at every slider
  //    position measured, $5,000 to $200,000 — so the wrong sentence never rendered there. The inputs are the card's own (the component,
  //    ~L10600–10619): ⚠ a SECOND COPY of them, so t76 E-3 asserts this row's outcome equals the RENDERED card's on two households. Three
  //    are structural — useState defaults the shim cannot read, like d_conv_cap's $70,000: the slider ($70,000), the taxable yield (2%),
  //    the conversion-tax funding ("taxable") with a 0% gain share, and the scenario the draw series is built on (DEFAULT_SCENARIO_PRESET,
  //    "bull"). If one moves in the component, E-3 goes red rather than this row going quietly stale.
  let _xo = null, _curA = null;   // v6.30: the slider strategy's row, kept for the D-60 rows below
  if (G.runRothStrategies && G.rothCrossover && G.withdrawalPlanSeries) {
    const _ry = tl.targetRetireYear, _conv = 70000, _aca = P.acaBridge || {};
    const _PX = { single, asOfYr: tl.asOfYear, retireYr: _ry,
      horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), ladderEnd: tl.rothLadderEnd,
      dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
      deathYr1: single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ssA: G.getSSA(), ssB: single ? 0 : G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
      pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: P.stateCode || null,
      convTaxFunding: "taxable", taxableGainFrac: 0, acaPremium: _aca.premium || 0, acaSize: _aca.size || 0,
      ...G.retireStartBalances(_ry), ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
      survivor: single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
      taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: _conv,
      ordDrawByYr: G.withdrawalPlanSeries({ retireYear: _ry, rothAmount: _conv, scenarioPreset: "bull" }).ordDrawByYr };
    const _res = G.runRothStrategies(_PX), _n = _res.find(r => r.key === "none"), _c = _res.find(r => r.key === "current");
    if (_n && _c) _xo = G.rothCrossover(_n.wealthByYr, _c.wealthByYr);
    _curA = _c || null;
  }
  const _xoBranch = !_xo ? "n/a" : _xo.beYr !== null ? (_xo.beWasBehind ? "recovered" : "never behind")
    : (_xo.beWasBehind ? "does not break even" : "no measurable difference");
  row("crossover", "break-even card, $70K",
    _xoBranch + (_xo && _xo.beYr !== null ? ` (${_xo.beYr})` : ""),
    "the recovered-after-a-deficit outcome", _xoBranch !== "recovered",
    _xoBranch === "recovered" ? "reachable — the card's recovered sentence renders"
      : _xoBranch === "n/a" ? "this build does not export the crossover"
      : `the card shows "${_xoBranch}", so its recovered sentence (C-11's site) is not shown here`);

  // ── v6.14 (D-17, C-14 — SCOPE_D17_PAYROLL_TAX_V614) · the condition that hid them (§K1) ────────────────────────────────────────
  // 5. PAYROLL TAX THAT DEPENDS ON WHO EARNED IT. Two rules reach a household only with job income: the Additional Medicare Tax (0.9%
  //    above $200,000 single / $250,000 joint) and the Social Security wage cap applied PER EARNER. The example household has no job
  //    stream and B's built-in taper peaks at $20,000, so neither rule ever applied there. Read from the household's own job streams (or
  //    the taper when none is entered), joint rows split equally, over the plan years; thresholds and the 2026 base read live. The base is
  //    indexed at 2%/yr through v6.29 (the engines' TAX_INDEX_RATE) and at the plan's inflation from v6.30 (DU-3 (a)); t77 holds the engines to it.
  let _pay = null;
  if (T.ADDL_MED_SGL != null && T.ADDL_MED_MFJ != null) {
    const _streams = (P.incomeStreams || []).filter(s => (s.kind || "other") === "work" && (s.tax || "ordinary") === "ordinary" && (+s.monthly || 0) > 0);
    const _dA = tl.dobA.year + tl.lifeExpA, _dB = single ? Infinity : tl.dobB.year + tl.lifeExpB, _d1 = single ? Infinity : Math.min(_dA, _dB);
    const _end = Math.max(_dA, single ? 0 : _dB);
    // v6.30 (D-60, DU-3 (a)): the base follows the wage index, modelled at the plan's inflation (Σ prob × inflation over the scenario table) on a
    // build that indexes it so (marked by `inflateWageBase` on __g); 2%/yr before — the engines' old TAX_INDEX_RATE.
    const _wbRate = typeof G.inflateWageBase === "function" ? Object.values(G.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0) : 0.02;
    let maxW = 0, overThr = 0, pairOverBase = 0;
    for (let yr = tl.targetRetireYear; yr <= _end; yr++) {
      const aliveA = yr < _dA, aliveB = !single && yr < _dB, one = single || yr >= _d1;
      let a = 0, b = 0, j = 0;
      for (const s of _streams) { if (yr < (+s.startYear || 0) || yr > (+s.endYear || 9999)) continue; const amt = s.monthly * 12;
        if (s.owner === "A") { if (aliveA) a += amt; } else if (s.owner === "B") { if (aliveB) b += amt; } else j += amt; }
      // the built-in spouse-B work: read from the app's own spouseBWorkTaper where exported (v6.23 pays it to the example alone — D-49).
      // The shim exports it on the v6.22 leg too (its rule: every plan with no stream, single ones included), so from v6.23 that leg's row
      // reads the app's own rule as well. The structural fallback is this row's pre-v6.23 reading, which left single plans out — kept for
      // a leg with no export.
      if (typeof G.spouseBWorkTaper === "function") b += G.spouseBWorkTaper(yr, tl.targetRetireYear);
      else if (!_streams.length && !single) { const k = yr - tl.targetRetireYear; b += k === 0 ? 20000 : k === 1 ? 18000 : k === 2 ? 15000 : 0; }
      const W = a + b + j, thr = (single || yr > _d1) ? T.ADDL_MED_SGL : T.ADDL_MED_MFJ, base = T.SS_WAGE_BASE * Math.pow(1 + _wbRate, yr - tl.asOfYear);
      maxW = Math.max(maxW, W); if (W > thr) overThr++;
      if (!one && (a + j / 2) > 0 && (b + j / 2) > 0 && W > base) pairOverBase++;
    }
    _pay = { maxW, overThr, pairOverBase };
  }
  row("payroll", "payroll on job income",
    _pay ? `peak $${Math.round(_pay.maxW).toLocaleString()}; ${_pay.overThr} yr over $200K/$250K; ${_pay.pairOverBase} two-earner yr over the base` : "n/a (pre-v6.14 build)",
    "0.9% threshold or two earners over the wage base", !_pay || (_pay.overThr === 0 && _pay.pairOverBase === 0),
    !_pay ? "this build has no Additional Medicare constants"
      : (_pay.overThr || _pay.pairOverBase) ? "reachable — the Additional Medicare Tax or the per-earner cap applies"
      : "no year reaches the 0.9% threshold or puts two earners over the base, so both rules are $0 here");

  // ── v6.16 (D-36 — SCOPE_D36_SELF_EMPLOYMENT_V616) · the condition that hid it (§K1) ───────────────────────────────────────────────
  // 6. SELF-EMPLOYMENT. A "Job — self-employed (1099)" row owes both halves of payroll tax on 92.35% of its profit (§1401, §1402(a)(12)),
  //    but only once a person's net earnings reach $400 (§1402(b)(2)). The example household has no job stream at all, so the rule was
  //    never reached there. Read from the household's own self-employed rows, per person (a joint row counts half each), over the plan
  //    years; the floor and both rates read live. A build without `SE_MIN_NET` does not model self-employment: "n/a" (ON).
  let _se = null;
  if (T.SE_MIN_NET != null) {
    const _rows = (P.incomeStreams || []).filter(s => (s.kind || "other") === "work" && !!s.selfEmployed && (s.tax || "ordinary") === "ordinary" && (+s.monthly || 0) > 0);
    const _f = 1 - T.FICA_SS_RATE - T.FICA_MED_RATE;
    const _dA = tl.dobA.year + tl.lifeExpA, _dB = single ? Infinity : tl.dobB.year + tl.lifeExpB;
    const _end = Math.max(_dA, single ? 0 : _dB);
    let years = 0, peak = 0;
    for (let yr = tl.targetRetireYear; yr <= _end; yr++) {
      const aliveA = yr < _dA, aliveB = !single && yr < _dB;
      let a = 0, b = 0;
      for (const s of _rows) { if (yr < (+s.startYear || 0) || yr > (+s.endYear || 9999)) continue; const amt = s.monthly * 12;
        if (s.owner === "A") { if (aliveA) a += amt; } else if (s.owner === "B") { if (aliveB) b += amt; }
        else if (single) { if (aliveA) a += amt; } else { if (aliveA) a += amt / 2; if (aliveB) b += amt / 2; } }
      const nets = [a * _f, b * _f];
      if (nets.some(n => n >= T.SE_MIN_NET)) years++;
      peak = Math.max(peak, ...nets);
    }
    _se = { years, peak };
  }
  row("self_employed", "self-employment tax",
    _se ? `${_se.years} yr with a person's net earnings ≥ $${T.SE_MIN_NET}; peak net $${Math.round(_se.peak).toLocaleString()}` : "n/a (pre-v6.16 build)",
    "a self-employed job row at or above the $400 floor", !_se || _se.years === 0,
    !_se ? "this build does not model self-employment"
      : _se.years ? "reachable — a self-employed person owes both halves on 92.35% of the profit"
      : "no self-employed row reaches the $400 floor, so self-employment tax is $0 here");

  // ── v6.17 (D-38 — SCOPE_D38_HOME_SALE_CASH_V617) · the condition that hid it (§K1) ──────────────────────────────────────────────────
  // 7. THE CASH FROM A HOME MOVE. Through v6.16 every plan got a fixed $130,000 at retirement. The example still carries exactly that
  //    figure (DC-3 (a)), so on the example the field and the old constant are indistinguishable: a fix that silently restored the
  //    constant could not be seen. Read through the shim's accessor; a build without it reads "n/a" (ON). The 130,000 here is the old
  //    constant's value — the thing being compared against — not a figure this tool asserts about the law.
  const _hmAcc = typeof G.homeMoveCash === "function" ? G.homeMoveCash : null;
  const _hm = _hmAcc ? _hmAcc() : null;
  row("home_move", "cash from a home move",
    _hmAcc ? `${_hm < 0 ? "−" : ""}$${Math.abs(Math.round(_hm)).toLocaleString()} at retirement` : "n/a (pre-v6.17 build)",
    "a figure other than the old fixed $130,000", !_hmAcc || _hm === 130000,
    !_hmAcc ? "this build has no home-move field — every plan carries the constant"
      : _hm === 130000 ? "the household's figure equals the old constant, so the field and the constant cannot be told apart here"
      : _hm === 0 ? "reachable — no move: nothing is added at retirement" : _hm < 0 ? "reachable — the next home costs more: cash is taken at retirement" : "reachable — a figure of the household's own");

  // ── v6.21 (D-42 — SCOPE_D42_CAR_V621) · the condition that hid it (§K1) ──────────────────────────────────────────────────────────
  // 8. THE CARS. Through v6.20 the 30-year runs bought every plan a $40,000 car in March of retirement years 8, 16, 24 and 32. The example's
  //    table now carries exactly that schedule as rows (DC-1 (a)), so on the example the rows and the old fixed car are indistinguishable in
  //    the Monte Carlo: a fix that silently restored the constant could not be seen there. Car rows are the table's one-time rows whose
  //    label names a car; the old schedule is derived from the plan's own retirement year (the same rule the v6.21 migration uses). A build
  //    without CAR_SCHEDULE_V620 reads "n/a" (ON). The 40,000 here is the old constant's value, read from the build, not typed.
  const _cs = typeof G.CAR_SCHEDULE_V620 === "function" ? G.CAR_SCHEDULE_V620() : null;
  let _cars = null, _old = null;
  if (_cs) {
    _cars = (G.EXPENSES() || []).filter(e => e && e.freq === "once" && /\bcars?\b/i.test(String(e.label || "")));
    _old = [];
    const _asK = tl.asOf.year * 12 + ((tl.asOf.month || 1) - 1);
    for (let y = tl.retireDate.year + _cs.everyYears; y <= tl.asOf.year + 35; y += _cs.everyYears)
      if (y * 12 + _cs.month - 1 >= _asK) _old.push(`${y}-${String(_cs.month).padStart(2, "0")}`);
  }
  const _same = !!_cars && _cars.length === _old.length && _cars.every((e, i) => e.start === _old[i] && Number(e.amount) === _cs.cost);
  row("car_rows", "cars in the expense table",
    _cs ? `${_cars.length} one-time car row${_cars.length === 1 ? "" : "s"}` : "n/a (pre-v6.21 build)",
    "a car schedule other than the old fixed one", !_cs || _same,
    !_cs ? "this build buys every plan a fixed $40,000 car every 8 years of retirement"
      : _same ? "the table's cars are exactly the old fixed schedule, so the rows and the old constant cannot be told apart in the Monte Carlo here"
      : _cars.length === 0 ? "reachable — no car in the table: none is charged" : "reachable — a car schedule of the household's own");

  // ── v6.22 (D-53 — SCOPE_D53_PROMPT_V622) · the condition that hid it (§K1) ───────────────────────────────────────────────
  // 9. THE MASTER PROMPT HELD. Through v6.21 a plan that arrived without a master prompt kept the one already held — the example's — and
  //    read the example's dates of birth, plan-to ages, state and home from it. The example itself always holds its own prompt, whose facts
  //    are its own (from v6.22 equal to its fields), so a fix that let the demo prompt reach other plans again could not be seen on it. The
  //    demo prompt is recognised by its own "[DEMO / SAMPLE DATA]" title marker — a text marker read from the held prompt, not a figure.
  const _mpHeld = typeof G.MASTER_PROMPT === "function" ? (G.MASTER_PROMPT() || "") : "";
  const _isDemo = /\[DEMO \/ SAMPLE DATA\]/.test(_mpHeld);
  row("demo_prompt", "the master prompt held",
    _isDemo ? "the example's demo prompt" : _mpHeld ? "a prompt of the plan's own" : "none",
    "a prompt that is not the example's", _isDemo,
    _isDemo ? "the household holds the example's own prompt, whose facts are its own, so the example's facts reaching another plan cannot be seen here"
      : _mpHeld ? "reachable — a fact the plan lacks is read from its own prompt" : "reachable — no prompt: a fact the plan lacks is a placeholder");

  // ── v6.23 (D-49 — SCOPE_D49_WORK_TAPER_V623) · the condition that hid it (§K1) ───────────────────────────────────────────
  // 10. THE BUILT-IN SPOUSE-B WORK. Through v6.22 every plan with no income streams was paid $20,000, $18,000 and $15,000 of spouse-B wages
  //    in its retirement year and the two after (spouseBWorkTaper), single plans included. The example's spouse B does work, so on the
  //    example the wages are its own, and a fix that let them reach other plans again could not be seen there. Read from the app's own
  //    function (exported on every leg), at the plan's retirement year.
  const _tp = typeof G.spouseBWorkTaper === "function" ? G.spouseBWorkTaper(tl.targetRetireYear, tl.targetRetireYear) : null;
  row("example_work", "built-in spouse-B work",
    _tp === null ? "n/a (no export)" : _tp > 0 ? `$${_tp.toLocaleString()} in the retirement year` : "none",
    "a household that is not paid it", _tp === null || _tp > 0,
    _tp === null ? "this build exports no taper" : _tp > 0 ? "the household is paid the built-in work, so the example's wages reaching another plan cannot be seen here"
      : "reachable — the household is paid no built-in work");

  // ── v6.27 (F-22 — SCOPE_F22_GRADE_FINDINGS_V627) · the conditions that hid it (§K1) ─────────────────────────────────────────────
  // 11. AN LTC EXPENSE ROW. Through v6.26 the Grade tab told every plan WITHOUT an LTC / long-term-care expense row to "Secure hybrid LTC
  //    insurance policy for both spouses", single plans included, with a +0.20 grade lift the grading could not produce. The example
  //    carries one ("Long-Term Care (Hybrid)"), so that directive never appeared on it. Read with the Grade and Stress tabs' own test,
  //    /ltc|long.?term/i, against the expense table's labels — a label pattern, not a figure.
  // v6.28 (F-24): the leg's own shared test where it exports one (isLTCLabel, which no longer matches "long-term disability"); the
  // v6.27 pattern otherwise. So the census row reads exactly what the app reads, on either leg.
  const _ltcRows = (G.EXPENSES() || []).filter(e => e && ltcTest(G)(e.label));
  row("ltc_row", "an LTC expense row",
    _ltcRows.length ? `${_ltcRows.length} row${_ltcRows.length === 1 ? "" : "s"} (${String(_ltcRows[0].label)})` : "none",
    "a household with no LTC row", _ltcRows.length > 0,
    _ltcRows.length ? "the household carries an LTC expense row, so what the Grade tab says to a plan without one cannot be seen here"
      : "reachable — no LTC row: the Grade tab's no-row text shows");

  // 12. THE GUARDRAIL CUT POOL'S LABELS. The Grade tab's Guardrail Readiness counts rows labelled exactly "golf" and "Amazon" (anchored
  //    regexes, the first row of each) as the spending a cut could come from. The example carries an "Amazon" row, so it shows a real
  //    pool; a plan without either label shows "$0/mo" — which the example cannot show. The GRADE is B- either way on the example (its
  //    $400 is short of the cut), so this row hides the text, not a grade. (The example's own golf row is "Golf (monthly)": no match.)
  const _cutRows = (G.EXPENSES() || []).filter(e => e && /^(golf|amazon)$/i.test(String(e.label || "")));   // no trim: _amt does not trim
  row("cut_rows", "golf / Amazon expense rows",
    _cutRows.length ? _cutRows.map(e => String(e.label)).join(" + ") : "none",
    "a household with neither label", _cutRows.length > 0,
    _cutRows.length ? "the household carries a row the guardrail grade counts, so the $0 cut pool a plan without one shows cannot be seen here"
      : "reachable — no counted row: the guardrail grade has no cut pool");

  // ── v6.28 (F-24 — SCOPE_F23_F24_DIRECTIVES_V628) · the condition that hid it (§K1) ────────────────────────────────────────────────
  // 13. A LONG-TERM-DISABILITY ROW. Through v6.27 the Grade and Monte Carlo tabs' LTC test, /ltc|long.?term/i, also matched a
  //    "Long-term disability" row and told the plan an LTC line was in its expenses. The example has no such row (nor does any fixture),
  //    so the false match could not be seen there. ON when the household has NO label the v6.27 pattern matches and a care test does not.
  const _oldLT = (l) => /ltc|long.?term/i.test(String(l || "")), _care = (l) => /\bltc|long[\s\-\u2013\u2014]?term[\s\-\u2013\u2014]?care/i.test(String(l || ""));
  const _dis = (G.EXPENSES() || []).filter(e => e && _oldLT(e.label) && !_care(e.label));
  row("ltc_disability", "a long-term row that is not care",
    _dis.length ? _dis.map(e => String(e.label)).join(" + ") : "none",
    "a household with a long-term-disability row", _dis.length === 0,
    _dis.length ? "reachable — a long-term row that is not care: the v6.27 LTC test's false match shows"
      : "the household has no long-term row that is not care, so the v6.27 LTC test's false match cannot be seen here");

  // ── v6.29 (F-25 — SCOPE_F25_MODEL_CLAIMS_V629) · the condition that hid it (§K1) ─────────────────────────────────────────────────
  // 14. SPOUSE B CLAIMS AFTER A'S INCOME GAP STARTS. Through v6.28 the Income tab's gap draw subtracted spouse B's Social Security for every
  //    month of A's gap, even when B claims later. The example's B claims in the retirement month — at the gap's start — so the
  //    over-subtraction could not be seen there. ON when the plan is single, has no gap, or B's claim falls at or before the gap's start (the
  //    Income tab's retirement month, January of the retirement year). Read from the timeline; no build feature, so both legs agree.
  {
    const _retYM = tl.targetRetireYear * 12 + 1;
    const _aYM = tl.ssA_date.year * 12 + (tl.ssA_date.month || 1);
    const _bYM = single ? null : tl.ssB_date.year * 12 + (tl.ssB_date.month || 1);
    const _gap = _aYM > _retYM;
    const _ym = (v) => `${Math.floor((v - 1) / 12)}-${String(((v - 1) % 12) + 1).padStart(2, "0")}`;
    row("ss_claim_after_gap", "spouse B's claim vs A's income gap",
      single ? "n/a" : !_gap ? "no gap" : `B claims ${_ym(_bYM)}; A's gap ${_ym(_retYM)} to ${_ym(_aYM - 1)}`,
      "B claims after A's gap starts", single || !_gap || _bYM <= _retYM,
      single ? "single filer — no spouse B" : !_gap ? "no income gap before A's Social Security, so the gap draw is not reached"
        : _bYM <= _retYM ? "B's check flows for the whole gap, so subtracting it for every gap month is right here and the v6.28 over-subtraction cannot be seen"
        : "reachable — B claims inside or after A's gap: the gap draw pays B only from B's claim month");
  }

  // ── v6.30 (D-60 — SCOPE_D60_DOLLAR_UNITS_V630) · the boundaries the units fix turns on (§K1) ───────────────────────────────────
  // The fix changes figures only where a household reaches them, and the example household reaches three of these four not at all, so its own
  // figures cannot evidence them (scope §0.8). 15 — the two inflation clocks coincide when the plan retires in its as-of year (reb = 1): there
  // the v6.29 and v6.30 schedules are equal, so nothing about the clock can be seen. 16–18 read Engine A's slider strategy (the crossover
  // row's own run): a year with NIIT (an unindexed threshold crossed), a year with an IRMAA surcharge (the CPI-U tiers and the surcharge's
  // growth), and a bridge year with an ACA subsidy (the poverty line's CPI-U growth). Engine A exists on both legs, so both legs agree.
  { const _ry = tl.targetRetireYear, _as = tl.asOfYear;
    row("clock_coincide", "retirement year vs as-of year", `${_ry} vs ${_as}`, "retirement in the as-of year (the clocks coincide)", _ry === _as,
      _ry === _as ? "DEGENERATE — the retirement and as-of clocks are the same clock here, so D-60's clock change moves nothing"
        : `clear — ${_ry - _as} year(s) apart, so the clock moves Engine D and every fixed amount`);
    const _ni = _curA ? (_curA.totNiit || 0) : null, _ir = _curA ? (_curA.totIrmaa || 0) : null;
    const _sub = _curA ? Object.values(_curA.acaSubByYr || {}).filter(v => v > 0).length : null;
    row("niit_year", "NIIT, slider strategy", _ni === null ? "n/a" : `$${Math.round(_ni).toLocaleString()}`, "a year over the (unindexed) NIIT threshold", !(_ni > 0),
      _ni > 0 ? "reachable — an unindexed threshold is crossed" : "no NIIT year, so the unindexed threshold's creep cannot be seen here");
    row("irmaa_year", "IRMAA, slider strategy", _ir === null ? "n/a" : `$${Math.round(_ir).toLocaleString()}`, "a year with an IRMAA surcharge", !(_ir > 0),
      _ir > 0 ? "reachable — the CPI-U tiers and the surcharge's growth apply" : "no IRMAA year, so the tiers' indexing and the surcharge's growth cannot be seen here");
    row("aca_subsidy", "ACA subsidy years, slider strategy", _sub === null ? "n/a" : `${_sub} year(s) with a subsidy`, "a bridge year under the 400% cliff", !(_sub > 0),
      _sub > 0 ? "reachable — the poverty line's growth moves the subsidy" : "no subsidy year, so the poverty line's indexing cannot be seen here");
  }

  // ── v6.31 (D-51 — SCOPE_D51_AI6_V631) · the condition that hid it (§K1) ─────────────────────────────────────────────────────────
  // 19. THE MONTE CARLO'S SCHEDULE CARRIES A SURCHARGE. Through v6.30 the schedule both Monte Carlo engines pay was the Taxes tab's income tax
  //    alone; from v6.31 it adds Engine C's IRMAA surcharges in their premium years. The example at its opening $70,000 slider crosses no tier,
  //    so the fix moves nothing on it. ON when the schedule (the opening $70K slider, BULL — the preset a first visit opens on) has no premium
  //    year with a surcharge; a build whose schedule has no IRMAA part reads "n/a" (ON), so the v6.30 leg is ON on every household.
  { const _s = G.mcIncomeTaxSchedule ? G.mcIncomeTaxSchedule(tl.targetRetireYear, { rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "bull" }) : null;
    const _iy = _s && _s.irmaaByYr ? Object.keys(_s.irmaaByYr).map(Number).sort((a, b) => a - b) : null;
    row("irmaa_in_mc", "IRMAA in the Monte Carlo's schedule", _iy === null ? "n/a — the schedule has no IRMAA part" : _iy.length ? `${_iy.length} premium year(s), from ${_iy[0]}` : "none",
      "a premium year with a surcharge in the schedule", !(_iy && _iy.length > 0),
      _iy === null ? "this build's Monte Carlo pays no IRMAA, so there is nothing to see"
        : _iy.length ? "reachable — the Monte Carlo pays the IRMAA tab's surcharges in these years" : "no surcharge in the schedule, so the Monte Carlo's IRMAA charge cannot be seen here");
  }

  // ── v6.32 (D-61, F-26 — SCOPE_F26_D61_V632) · the conditions that hid them (§K1) ───────────────────────────────────────────────────────
  // 20. A SURVIVOR UNDER 71 AT THE FIRST DEATH. Through v6.31 a survivor could give from the IRA (a QCD) on the DECEASED spouse's age, and
  //    the IRMAA engine gave a survivor two caps. Both errors need a first death that leaves a survivor under 71 (or, for the second, a QCD
  //    above one indexed cap). The example's first death leaves a survivor already past 71 — and its QCD slider opens at $0 — so D-61 moves
  //    nothing on it. ON when the survivor is 71 or older in the first death year (the year the engines roll the IRA over).
  if (single) row("qcd_survivor", "survivor age at first death (QCD)", "n/a", "under 71 in the death year", false, "single filer — no survivor transition");
  else {
    const _survIsA = (tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB);
    const _age = firstDeathYr - (_survIsA ? tl.dobA.year : tl.dobB.year);
    row("qcd_survivor", "survivor age at first death (QCD)", `${_age} (${_survIsA ? "A" : "B"}, in ${firstDeathYr})`, "under 71 in the death year", _age >= 71,
      _age >= 71 ? "DEGENERATE for D-61's age rule — the survivor may already give, so only a QCD above one cap could show the fix (the QCD slider opens at $0)"
                 : "exercises the survivor's own-age QCD rule (with a QCD above $0)");
  }
  // 21. SPOUSE B'S BENEFIT IS THE LARGER. Through v6.31 the Stress tab's early-death card and the Social Security tab's survivor grid showed
  //    the survivor keeping spouse A's benefit; the engines pay the LARGER of the two. On the example A's is the larger, so the two agree.
  if (single) row("survivor_benefit_b", "the larger Social Security benefit", "n/a", "spouse B's the larger", false, "single filer — no spouse B");
  else row("survivor_benefit_b", "the larger Social Security benefit", `A $${(ssA / 12).toLocaleString()}, B $${(ssB / 12).toLocaleString()} /mo`, "spouse B's the larger", ssB <= ssA,
    ssB <= ssA ? "DEGENERATE — spouse A's benefit is the larger, so naming A's as the survivor's check reads right here" : "exercises the larger-benefit survivor rule");

  return rows;
}

export const onBoundary = rows => rows.filter(r => r.onBoundary);

// ── printing ─────────────────────────────────────────────────────────────────────────────
export function table(rows) {
  const cols = [
    ["parameter", r => r.param, 22],
    ["value", r => r.value, 24],
    ["boundary it could sit on", r => r.boundary, 40],
    ["verdict", r => (r.onBoundary ? "ON  " : "clear ") + r.note, 78],
  ];
  const out = [cols.map(([h, , w]) => h.padEnd(w)).join("")];
  out.push(cols.map(([, , w]) => "-".repeat(w - 1)).join(" "));
  for (const r of rows) out.push(cols.map(([, f, w]) => String(f(r)).padEnd(w)).join(""));
  const n = onBoundary(rows).length;
  out.push("");
  out.push(`${n} of ${rows.length} parameters sit on a boundary. Rows marked ON are behaviours this ` +
           `household CANNOT demonstrate.`);
  return out.join("\n");
}

// ── CLI ──────────────────────────────────────────────────────────────────────────────────
// Usage:  node boundaries.mjs <ver> [portfolio.json] [--json]
// Resolves the app module the same way t24/t27 resolve the §86 oracle, and SAYS WHICH COPY IT
// USED, because the pool is flat and the repo is not — a stale duplicate must be visible rather
// than silent.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { existsSync, readFileSync } = await import("fs");
  const { join, dirname } = await import("path");
  const { fileURLToPath, pathToFileURL } = await import("url");
  const HERE = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2).filter(a => a !== "--json");
  const asJson = process.argv.includes("--json");
  const VER = args[0] || "v546";
  const envCands = [join(HERE, "env_dom.mjs"), join(HERE, "..", "env_dom.mjs")];
  const env = envCands.find(existsSync);
  if (env) await import(pathToFileURL(env).href);
  let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
  const appCands = [join(HERE, "..", `app_${VER}.mjs`), join(HERE, `app_${VER}.mjs`)];
  const app = appCands.find(existsSync);
  if (!app) {
    console.error(`boundaries: no app_${VER}.mjs found. Looked in:\n` + appCands.map(c => "  " + c).join("\n"));
    process.exit(1);
  }
  const G = (await import(pathToFileURL(app).href)).__g;
  if (args[1]) G.applyLoadedData({ portfolio: JSON.parse(readFileSync(args[1], "utf8")) }); // WRAPPER — §C
  const rows = census(G);
  if (asJson) console.log(JSON.stringify({ version: VER, app, source: args[1] || "example household", rows }, null, 2));
  else {
    console.log(`boundary census — ${VER}`);
    console.log(`     app:       ${app}`);
    console.log(`     household: ${args[1] || "the shipped example household"}\n`);
    console.log(table(rows));
  }
}
