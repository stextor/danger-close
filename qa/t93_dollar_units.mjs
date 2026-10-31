// t93_dollar_units.mjs — v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): ONE dollar unit and ONE inflation clock for the tax engines.
//
// WHAT IT PINS. Through v6.29 Engines A, B and C held Social Security, the pension, income streams and the spending draws in today's
// dollars while their RMDs and tax thresholds grew, so a Taxes-tab row was in neither today's dollars nor its own year's; the bridge
// deflated Engine D's draw but not its gain; Engine D and What Breaks priced from the retirement year while the Monte Carlo priced from
// the as-of date; and one fixed 2%/yr (declared twice, E-9) stood in for two statutory indexes. From v6.30 every engine computes each
// year in that year's own dollars on the as-of clock; the bracket family indexes at the plan's inflation less 0.25 point (C-CPI-U), IRMAA
// tiers and the FPL at the plan's inflation (CPI-U); today's balances reach retirement at inflation with cost basis left nominal; the
// Monte Carlo and What Breaks take tax in today's dollars (DU-1 to DU-9, all (a)).
//
// GROUPS. §A the rates (independent: the plan's inflation is read from the scenario table and the rate written out here); §B Engine B's
// units on the example, input by input; §C THE EXTINCTION INVARIANT — homogeneity: with the bracket rate forced to the plan's inflation
// (the shim's seam), a household of real income pays the same tax in today's dollars every year, which no mixed unit can survive; §D one
// clock — a fixed pension and stream are the amount paid in every engine, Engine D prices from the as-of year, and at the two-clock
// boundary (retirement in the as-of year) Engine D is v6.29's to the cent; §E the Monte Carlo's schedule is Engine B's tax in today's
// dollars; §F Engine A's today's-dollar fields; §G IRMAA surcharges grown to the premium year; §H the source, by AST (no 1.02 left; the
// carry moves the gain pool and not the basis; What Breaks' tax and pension); §I basis — the inflation carry is a realized gain later;
// §J copy (extinct and new phrases, by AST over every string); §K an ACA bridge household UNDER the cliff (none of the scope's seven
// fixtures reached it); §L the rendered tabs; §M the Monte Carlo's quarterly charges against Engine B within a computed compounding gap;
// §N statute oracles — the NIIT's unindexed threshold on the New York ×3 household, IRMAA tiers at CPI-U on the single filer; §W What
// Breaks' rendered tax estimate against Engine A in today's dollars; §O the planned-contribution accrual at face value (DU-7 (a)). §M, §N and
// §W were added at the build, after its own census of the scope's §3 found them missing; §O after the build review found the accrual carried
// with the holdings (scope §7).
//
// Both legs: node t93_dollar_units.mjs v629 | node t93_dollar_units.mjs v630. The v6.29 leg pins each defect as a dated
// [KNOWN DEFECT 2026-10-22, D-60]. Module-level facts run in a child process (--module); the rendered checks mount the DOM bundle with
// Math.random seeded before the bundle loads (t11's TRAP 1). Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v630";
const KNOWN_VERSIONS = ["v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639", "v640"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639", "v640"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-22, D-60 — flips at v6.30]";
const GAP = 0.0025;   // C-CPI-U below CPI-U, CBO Budget Options 12 Dec 2024 — typed here, not read from the app

// ══ CHILD MODE (--module) ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
if (process.argv.includes("--module")) {
  const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
  const G = M.__g, X = M.__test, E = M.__engines;
  const out = {};
  const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO())), BASE_E = JSON.parse(JSON.stringify(G.EXPENSES()));
  const load = (P, Ex) => G.applyLoadedData({ portfolio: P, expenses: Ex || BASE_E });
  const reset = () => load(JSON.parse(JSON.stringify(BASE)));
  const planI = () => Object.values(G.SCENARIOS()).reduce((s, sc) => s + sc.prob * sc.inflation, 0);   // the plan's CPI-U, read from the table
  const R0 = G.PLAN_TIMELINE().targetRetireYear, ASOF = G.PLAN_TIMELINE().asOfYear;
  const series = (R, roth) => (G.withdrawalPlanSeries ? G.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: "base" }) : { gainByYr: {}, ordDrawByYr: {} });
  const planB = (R, roth = 70000, qcd = 0, yld = 2.0) => E.computeTaxPlan({ retireYear: R, rothAmount: roth, qcdAnnual: qcd, taxYield: yld, ...series(R, roth) });

  // §A — the rates
  out.i = planI();
  out.has = { pdf: typeof X.planDollarFactor === "function", chained: typeof X.chainedCpiRate === "function", cpiu: typeof X.cpiuRate === "function",
    seam: typeof X.setChainedGap === "function", itc: typeof X.inflateTaxConst === "function" };
  if (out.has.chained) out.rates = { chained: X.chainedCpiRate(), cpiu: X.cpiuRate(), pdf10: X.planDollarFactor(2036, 2026), itc10: X.inflateTaxConst(100000, 2036, 2026),
    wb10: typeof X.inflateWageBase === "function" ? X.inflateWageBase(100000, 2036, 2026) : null };
  const TT = G.IRMAA_CONSTS();
  const thr = X.irmaaThresholdFor || ((u, top, p, b) => null);
  out.irmaa = { t1_2040: thr(TT.SGL[0], false, 2040, 2026), top_2027: thr(TT.SGL[4], true, 2027, 2026), top_2035: thr(TT.SGL[4], true, 2035, 2026) };
  out.fpl2036 = G.acaFplFor(2036, 2);
  out.fplLast = (() => { const A = G.ACA_CONSTS(); const ys = Object.keys(A.fplByGuidelineYear).map(Number); const y = Math.max(...ys); return { y, ...A.fplByGuidelineYear[y] }; })();
  const PB = X.projectBracketsAt;
  out.pb = PB ? PB(2040, { asOfYr: 2026, filingSingle: false, survivorIsA: true, ageA: 60, ageB: 60, irmaaUpper0: TT.MFJ[0] }) : null;
  out.TC = { MFJ_BR: G.TAX_CONSTS().MFJ_BR.map(b => b.upper), MFJ_STD: G.TAX_CONSTS().MFJ_STD };
  // the rates follow the preset (a mutation of the active prior must move them)
  { const PP = G.PROB_PRESETS(); G.applyScenarioProbs(PP.bull.probs); out.iBull = planI(); out.chainedBull = out.has.chained ? X.chainedCpiRate() : null;
    G.applyScenarioProbs(PP.base.probs); out.iBack = planI(); }

  // §B — Engine B's units on the example, input by input (BASE prior, $70K slider, 2% yield)
  reset();
  { const tl = G.PLAN_TIMELINE(), P = G.PORTFOLIO(); const b = planB(R0);
    out.B = { asOf: tl.asOfYear, ssA: G.getSSA(), ssB: G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
      deathYr1: b._deathYr1, pen: G.getPension(), taxInit: b._taxableInit, othHsa: G.retireStartBalances(R0).othHsa || 0, ladderEnd: tl.rothLadderEnd,
      rows: b.rows.map(r => ({ yr: r.yr, ssTotal: r.ssTotal, pen_y: r.pen_y, conv_y: r.conv_y, div_y: r.div_y, totalTax: r.totalTax, totalTaxToday: r.totalTaxToday, k: r.dollarFactor, rmd_y: r.rmd_y })),
      totAll: b.totAll, today: b.today || null };
    // §E the Monte Carlo's schedule
    const sch = G.mcIncomeTaxSchedule(R0, { rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "base" });
    out.E = { byYr: sch.byYr, charge: G.mcTaxCharge({ tax: { 7: 1000 } }, 7, 1.1, 0.25) };
    // §G IRMAA surcharges on the single filer (an IRMAA household)
  }
  // §C — homogeneity (the extinction invariant)
  const realOnly = (withSS) => ({ ...JSON.parse(JSON.stringify(BASE)), asOf: "2026-10-20", single: true, nameA: "Hana", nameB: "", dobA: withSS ? "1960-06-01" : "1985-06-01", dobB: "",
    retireYear: withSS ? 2030 : 2027, lifeExpA: withSS ? 85 : 55, stateCode: null, stateName: "", stateTaxRate: 0,
    positions: [], otherAccounts: [{ name: "Cash", balance: 50000, owner: "A", taxType: "hsa" }], total401k: 0, household: 50000, bucketActuals: { 1: 0, 2: 0, 3: 0, 4: 0 },
    contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
    incomeSources: { ssA: { tableByAge: {}, planned: withSS ? 3000 : 0, plannedAge: withSS ? 70 : 70 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 0 } },
    _incomeFromForm: true, homeMoveCash: 0, carRowsV621: true, workRowsV623: true,
    incomeStreams: [{ id: "h1", label: "Rental", kind: "rental", owner: "A", monthly: withSS ? 6000 : 5000, startYear: 2026, endYear: 2080, cola: true, tax: "ordinary" }] });
  const EXP_LOW = [{ cat: "Living", label: "Household", amount: 2000, freq: "monthly", start: "2026-01", end: "2090-12", deductible: false, phase: "both" }];
  out.C = {};
  for (const [nm, ss] of [["rental", false], ["rentalSS", true]]) {
    load(realOnly(ss), EXP_LOW);
    const R = G.PLAN_TIMELINE().targetRetireYear;
    const was = out.has.seam ? X.setChainedGap(0) : null;
    const b = planB(R, 0, 0, 2.0);
    if (out.has.seam) X.setChainedGap(was);
    const i = planI(); const hz = b._horizonYr;
    // whole years only: after the retirement (and claim) year, before the death year — a partial year is not a "same real inputs" year
    out.C[nm] = { R, rows: b.rows.filter(r => r.yr > Math.max(2028, R) && r.yr < hz).map(r => ({ yr: r.yr, today: r.totalTaxToday !== undefined ? r.totalTaxToday : r.totalTax / Math.pow(1 + i, r.yr - 2026),
      raw: r.totalTax, ssTaxable: r.ssTaxable, ssTotal: r.ssTotal, ageA: r.ageA })) };
  }
  // §D — one clock: a fixed pension and stream, a COLA stream, and Engine D's prices
  const clockHH = () => ({ ...JSON.parse(JSON.stringify(BASE)), incomeSources: { ...JSON.parse(JSON.stringify(BASE.incomeSources)), pension: { amount: 1000, owner: "A" } },
    incomeStreams: [{ id: "f1", label: "Annuity", kind: "annuity", owner: "joint", monthly: 500, startYear: 2026, endYear: 2080, cola: false, tax: "ordinary" },
                    { id: "c1", label: "Rental", kind: "rental", owner: "joint", monthly: 700, startYear: 2026, endYear: 2080, cola: true, tax: "ordinary" }] });
  load(clockHH());
  { const R = G.PLAN_TIMELINE().targetRetireYear; const b = planB(R); const d = G.computeWithdrawalPlan({ retireYear: R, rothAmount: 70000, scenarioPreset: "base" }).schedule;
    const deathYr1 = b._deathYr1;
    out.D = { R, asOf: G.PLAN_TIMELINE().asOfYear, deathYr1,
      B: b.rows.map(r => ({ yr: r.yr, pen_y: r.pen_y, otherOrd_y: r.otherOrd_y })),
      Dsch: d.map(r => ({ yr: r.yr, pen_y: r.pen_y, exp_y: r.exp_y, tbl: G.tableYearExpense ? G.tableYearExpense(r.yr, deathYr1) : null })),
      C: E.computeIrmaaPlan({ retireYear: R, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, ...series(R, 70000) }).rows.map(r => ({ yr: r.yr, magi: r.magi })),
      Bmagi: Object.fromEntries(b.rows.map(r => [r.yr, r.magi_y])) };
  }
  // §D boundary — retirement in the as-of year: Engine D is v6.29's to the cent (only on the current leg; it imports the prior module)
  // v6.31: a v6.30 → v6.31 run folder builds no v6.29 module. The v6.31 leg compares with v6.30's instead — Engine D is unchanged at v6.31, and
  // v6.30's release run proved it equal to v6.29's here — and the v6.30 leg, now the PRIOR leg, prints a skip. A keyed map, so the next
  // registration has to decide its entry rather than widen a condition.
  // v6.32: Engine D is unchanged at v6.32 too (D-61 touches Engines B and C; F-26 no engine), so the v6.32 leg compares with v6.31's module.
  // v6.33: Engine D's Bracket column now reads each year's own table (D-67), which for this household — dated 2026, retiring in 2026 — is
  // the same figure to the bit, so the v6.33 leg compares with v6.32's module.
  // v6.36: Engine D is untouched (D-66 changes What Breaks only), so the v6.36 leg compares with v6.35's module.
  const DREF_BY = { v631: "v630", v632: "v631", v633: "v632", v634: "v633", v635: "v634", v636: "v635", v637: "v636", v638: "v637", v639: "v638", v640: "v639" };
  const DREF = existsSync(join(HERE, "app_v629.mjs")) ? "v629" : (DREF_BY[VER] && existsSync(join(HERE, `app_${DREF_BY[VER]}.mjs`)) ? DREF_BY[VER] : null);
  if (POST && DREF) {
    const MP = await import(pathToFileURL(join(HERE, `app_${DREF}.mjs`)).href); const GP = MP.__g;
    const bHH = () => ({ ...JSON.parse(JSON.stringify(BASE)), retireYear: 2026 });
    load(bHH()); GP.applyLoadedData({ portfolio: bHH(), expenses: BASE_E });
    const Rn = G.PLAN_TIMELINE().targetRetireYear, Rp = GP.PLAN_TIMELINE().targetRetireYear;
    const dn = G.computeWithdrawalPlan({ retireYear: Rn, rothAmount: 70000, scenarioPreset: "base" }).schedule;
    const dp = GP.computeWithdrawalPlan({ retireYear: Rp, rothAmount: 70000, scenarioPreset: "base" }).schedule;
    out.Dbound = { ref: DREF, Rn, Rp, asOf: G.PLAN_TIMELINE().asOfYear, n: dn.map(r => [r.yr, r.portfolioTotal, r.exp_y, r.ordDraw_y]), p: dp.map(r => [r.yr, r.portfolioTotal, r.exp_y, r.ordDraw_y]) };
  }
  // Engine A's inputs as the Roth tab builds them (stateless example plan; the household currently loaded)
  const pOfA = (R, roth) => { const tl = G.PLAN_TIMELINE();
    return { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year, deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
      pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: G.taxableGainShare(),
      ...G.retireStartBalances(R), ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: "A", taxableInit: G.taxableInitAll(), taxYieldPct: 2, currentConv: roth,
      ordDrawByYr: series(R, roth).ordDrawByYr }; };
  // §F — Engine A's today's-dollar fields, on the example
  reset();
  { const tl = G.PLAN_TIMELINE();
    const P = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R0, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year, deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ssA: G.getSSA(), ssB: G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
      pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0,
      ...G.retireStartBalances(R0), ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: "A", taxableInit: G.taxableInitAll(), taxYieldPct: 2, currentConv: 70000,
      ordDrawByYr: series(R0, 70000).ordDrawByYr };
    const A = G.runRothStrategies(P);
    out.F = { horizon: P.horizonYr, asOf: P.asOfYr, rows: A.map(r => ({ key: r.key, estate: r.estate, estateToday: r.estateToday, totTax: r.totTax, totTaxToday: r.totTaxToday,
      totIrmaa: r.totIrmaa, totIrmaaToday: r.totIrmaaToday, endRoth: r.endRoth, endRothToday: r.endRothToday })) };
    // the read-only per-year seam (v6.30): Engine A's Social Security against Engine B's, year by year, on the example
    const cur = G.runRothStrategies(pOfA(R0, 70000), [{ key: "current", label: "C", policy: { kind: "fixed", amount: 70000 } }])[0];
    out.F.incA = cur.incomeByYr || null; out.F.ssB = Object.fromEntries(planB(R0).rows.map(r => [r.yr, r.ssTotal]));
  }
  // §F/§D — Engine A's fixed and COLA amounts on the clock household (a $1,000/mo pension, a fixed $500/mo annuity, a COLA $700/mo rental)
  load(clockHH());
  { const R = G.PLAN_TIMELINE().targetRetireYear; const cur = G.runRothStrategies(pOfA(R, 70000), [{ key: "current", label: "C", policy: { kind: "fixed", amount: 70000 } }])[0];
    out.FA = { asOf: G.PLAN_TIMELINE().asOfYear, inc: cur.incomeByYr || null }; }
  // §G — IRMAA on a single filer (Engine C, rows grown to the premium year)
  { const sg = { ...JSON.parse(JSON.stringify(BASE)), single: true, nameB: "", dobB: "", incomeSources: { ...JSON.parse(JSON.stringify(BASE.incomeSources)), ssB: { tableByAge: {}, planned: 0, plannedAge: 67 } } };
    load(sg); const R = G.PLAN_TIMELINE().targetRetireYear;
    const c = E.computeIrmaaPlan({ retireYear: R, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, ...series(R, 70000) });
    out.G = { asOf: G.PLAN_TIMELINE().asOfYear, SUR: G.IRMAA_CONSTS().SUR, totalIrmaa: c.totalIrmaa, totalIrmaaToday: c.totalIrmaaToday, yearsHit: c.yearsHit,
      rows: c.rows.map(r => ({ yr: r.yr, irmaaYr: r.irmaaYr, tier: r.tier, persons: r.personsOnMedicare, sur: r.surchargeAnnual, surToday: r.surchargeToday, magi: r.magi })),
      SGL: G.IRMAA_CONSTS().SGL };
  }
  // §I — basis: the example moved nine years later; realized gains (today's dollars) and the opening carry
  { const late = { ...JSON.parse(JSON.stringify(BASE)), dobA: "1973-01-01", dobB: "1975-01-01", retireYear: 2038 };
    const lateE = BASE_E.map(r => ({ ...r, start: String(r.start).replace(/^(\d{4})/, y => String(+y + 9)), end: String(r.end).replace(/^(\d{4})/, y => String(+y + 9)) }));
    load(late, lateE); const R = G.PLAN_TIMELINE().targetRetireYear; const i = planI();
    const s = series(R, 70000); const asOf = G.PLAN_TIMELINE().asOfYear;
    out.I = { R, asOf, gainsToday: Object.entries(s.gainByYr).reduce((a, [y, g]) => a + g / Math.pow(1 + i, +y - asOf), 0),
      gainsRaw: Object.values(s.gainByYr).reduce((a, g) => a + g, 0) };
    if (POST) { const PA = pOfA(R, 70000); const cur = G.runRothStrategies(PA, [{ key: "current", label: "C", policy: { kind: "fixed", amount: 70000 } }])[0];
      out.I.A = { open: cur._openA, taxableInit: PA.taxableInit, gainFrac: PA.taxableGainFrac }; }
  }
  // §K — an ACA bridge household under the 400% cliff
  { const aca = { ...JSON.parse(JSON.stringify(BASE)), acaBridge: { premium: 1800, size: 2 },
      incomeSources: { ...JSON.parse(JSON.stringify(BASE.incomeSources)), pension: { amount: 0 } }, retireYear: 2027,
      incomeStreams: [{ id: "k1", label: "Annuity", kind: "annuity", owner: "joint", monthly: 4000, startYear: 2026, endYear: 2080, cola: false, tax: "ordinary" }] };
    load(aca); const tl = G.PLAN_TIMELINE(); const R = tl.targetRetireYear;
    const P = { single: false, asOfYr: tl.asOfYear, retireYr: R, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year, deathYr1: Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ssA: G.getSSA(), ssB: G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
      pen: 0, penOwner: "A", stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0, acaPremium: 1800, acaSize: 2,
      ...G.retireStartBalances(R), ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: "A", taxableInit: G.taxableInitAll(), taxYieldPct: 0.5, currentConv: 0,
      ordDrawByYr: {} };
    const A = G.runRothStrategies(P, [{ key: "none", label: "NONE", policy: { kind: "fixed", amount: 0 } }]);
    out.K = { R, sub: A[0].acaSubByYr, floor: A[0].acaFloorYrs };
  }
  // §M — the Monte Carlo against Engine B, quarter by quarter, on the planned path: its inflator IS the plan's inflation (runExtendedMC's
  // `_plannedInfl`, (1 + i/4 × the quarter's fraction) a quarter from the as-of quarter), rebuilt here from the app's own quarter helpers.
  reset();
  { const tl = G.PLAN_TIMELINE(), ii = planI();
    const sch = G.mcIncomeTaxSchedule(R0, { rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "base" });
    const retireQ = G.mcQuarterOf(tl, { year: R0, month: 1 }), totalQ = G.mcQuarterOf(tl, { year: R0 + 12, month: 1 });
    const qs = G.mcQuarterSeries(tl, totalQ, retireQ, sch); let inf = 1; const byY = {};
    for (let q = 0; q < totalQ; q++) { const fq = G.mcQuarterFrac(tl, q); inf *= (1 + ii / 4 * fq); const y = G.mcQuarterDate(tl, q).calYear;
      const o = byY[y] || (byY[y] = { charge: 0, S: 0, n: 0 }); o.charge += G.mcTaxCharge(qs, q, inf, fq); o.S += inf * fq / 4; o.n += fq; }
    out.M = { asOf: tl.asOfYear, R: R0, i: ii, byY, rows: planB(R0).rows.filter(r => r.yr < R0 + 12).map(r => ({ yr: r.yr, totalTax: r.totalTax })) }; }
  // §N — the unindexed NIIT threshold on the scope's New York ×3 household (an NIIT household)
  { const ny = JSON.parse(JSON.stringify(BASE)); ny.positions.forEach(p => { for (const f of ["balance", "trad", "roth"]) if (typeof p[f] === "number") p[f] *= 3; });
    (ny.otherAccounts || []).forEach(a => a.balance *= 3); ny.total401k *= 3; ny.household *= 3; ny.stateCode = "NY"; ny.stateName = "New York";
    load(ny); const R = G.PLAN_TIMELINE().targetRetireYear; const b = planB(R);
    out.N = { R, deathYr1: b._deathYr1, single: !!G.PLAN_TIMELINE().single, rows: b.rows.map(r => ({ yr: r.yr, niit: r.niit_y, div: r.div_y, gain: r.capGains_y, magi: r.magi_y })) }; }
  // §O — the accrual at face value (DU-7 (a)): the late retiree (every date nine years later), whose twelve years of planned contributions
  // make the difference large. Hand inputs come from the raw PORTFOLIO and contribution fields, never from the constructor.
  { const late = { ...JSON.parse(JSON.stringify(BASE)), dobA: "1973-01-01", dobB: "1975-01-01", retireYear: 2038 };
    load(late); const tl = G.PLAN_TIMELINE(), R = tl.targetRetireYear, P = G.PORTFOLIO(), c = P.contributions || {};
    const own = (o, isB) => (o.owner === "B") === isB;
    const hold = isB => (P.positions || []).reduce((t, p) => t + (own(p, isB) ? (p.trad || 0) : 0), 0)
      + (P.otherAccounts || []).reduce((t, a) => t + (own(a, isB) && (a.taxType === "trad" || a.taxType === "annuity") ? (a.balance || 0) : 0), 0);
    const yA = Math.max(0, R - tl.asOfYear), yB = Math.max(0, (tl.single ? R : (tl.targetRetireYearB || R)) - tl.asOfYear);
    const bonus = (c.annualBonus || 0) * (((c.bonusDeferralPct || 0) + (c.bonusMatchPct || 0)) / 100);
    const b = POST ? planB(R) : null, cc = POST ? E.computeIrmaaPlan({ retireYear: R, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, ...series(R, 70000) }) : null;
    out.O = { R, asOf: tl.asOfYear, holdA: hold(false), holdB: hold(true), accA: 12 * (c.contribPreTaxA || 0) * yA + bonus * yA, accB: tl.single ? 0 : 12 * (c.contribPreTaxB || 0) * yB,
      B: b ? b._tradStart : null, C: cc ? cc._tradStart : null,
      unit: X.carryStartBalances ? X.carryStartBalances({ tradInitA: 100000, tradInitB: 0, rothInitA: 50000, rothInitB: 0, annShareA: 0.1, annShareB: 0, empShareA: 0.5, empShareB: 0,
        accTradA: 20000, accTradB: 0, accRothA: 10000, accRothB: 0, accTradEmpA: 5000 }, 1.1) : null }; }
  console.log("MODULE:" + JSON.stringify(out));
  process.exit(0);
}

// ══ PARENT ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const require = createRequire(import.meta.url);
let pass = 0, fail = 0; const fails = [];
const T = (name, ok, detail = "") => { if (ok) { pass++; console.log(`  ✓ ${name}`); } else { fail++; const m = `  ✗ ${name}${detail ? " — " + detail : ""}`; console.log(m); fails.push(m); } };
const near = (a, b, tol) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
console.log(`t93 — ONE DOLLAR UNIT AND ONE CLOCK (D-60) — ${VER}`);

let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
const reseed = () => { _s = 42; };
const ch = spawnSync(process.execPath, [fileURLToPath(import.meta.url), VER, "--module"], { cwd: HERE, encoding: "utf8", timeout: 900000, env: { ...process.env }, maxBuffer: 64 * 1024 * 1024 });
const mLine = (ch.stdout || "").split("\n").find(l => l.startsWith("MODULE:"));
const MD = mLine ? JSON.parse(mLine.slice(7)) : null;
T("0-1 setup: the module child ran", !!MD, MD ? "" : (ch.stderr || "").slice(0, 600));
if (!MD) { console.log(`\nt93: ${pass} passed, ${fail} failed`); process.exit(1); }
const i = MD.i;

// ── §A the rates ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("§A — the indexation rates, by statute");
if (POST) {
  T("A-1 the C-CPI-U rate is the plan's inflation less 0.25 point", near(MD.rates.chained, i - GAP, 1e-12), `${MD.rates.chained} vs ${i - GAP}`);
  T("A-2 the CPI-U rate is the plan's inflation", near(MD.rates.cpiu, i, 1e-12));
  T("A-3 today's dollars → 2036's: (1+i)^10", near(MD.rates.pdf10, Math.pow(1 + i, 10), 1e-12));
  T("A-4 an indexed figure grows at the C-CPI-U rate: $100,000 in 2036", near(MD.rates.itc10, 100000 * Math.pow(1 + i - GAP, 10), 1e-6), `${MD.rates.itc10}`);
  // A-4b — added at the v6.30 build, after t77/t79's law oracles found the first implementation indexing the wage base at the C-CPI-U rate
  // (through `inflateTaxConst`), against DU-3 (a): the wage base follows the wage index, modelled at CPI-U, the plan's own inflation.
  T("A-4b the Social Security wage base grows at the CPI-U rate, NOT the bracket family's (DU-3 (a)): $100,000 in 2036",
    MD.rates.wb10 !== null && near(MD.rates.wb10, 100000 * Math.pow(1 + i, 10), 1e-6) && !near(MD.rates.wb10, MD.rates.itc10, 1), `${MD.rates.wb10}`);
  T("A-5 the rates follow the preset (BULL's prior moves both)", MD.iBull !== MD.iBack && near(MD.chainedBull, MD.iBull - GAP, 1e-12), `bull i ${MD.iBull} base i ${MD.iBack}`);
} else {
  T(`A-1 ${KD}: no rate helper — one fixed 2%/yr for both indexes`, !MD.has.chained && !MD.has.cpiu && !MD.has.pdf);
}
const TT1 = 109000, TOP = 500000;
T(POST ? "A-6 IRMAA tier 1 indexes at CPI-U to the premium year (2040)" : `A-6 ${KD}: IRMAA tier 1 at the 2% proxy`,
  near(MD.irmaa.t1_2040, TT1 * Math.pow(POST ? 1 + i : 1.02, 14), 1e-6), `${MD.irmaa.t1_2040}`);
T("A-7 the top tier is frozen through 2027 (BBA-2018 §53114) on both legs", MD.irmaa.top_2027 === TOP);
T(POST ? "A-8 the top tier indexes at CPI-U from 2028" : `A-8 ${KD}: the top tier at the 2% proxy from 2028`, near(MD.irmaa.top_2035, TOP * Math.pow(POST ? 1 + i : 1.02, 8), 1e-6));
{ const L = MD.fplLast, base2 = L.base + L.perPerson; const exp = base2 * Math.pow(POST ? 1 + i : 1.02, 2035 - L.y);
  T(POST ? "A-9 the poverty line grows at CPI-U past the last published guideline year (2036 coverage)" : `A-9 ${KD}: the poverty line at a 2% proxy`, near(MD.fpl2036, exp, 1e-6), `${MD.fpl2036} vs ${exp}`); }
if (MD.pb) {
  const f = Math.pow(POST ? 1 + i - GAP : 1.02, 14);
  T(POST ? "A-10 the Roth tab's projection: every MFJ bracket top at C-CPI-U (2040)" : `A-10 ${KD}: the projection's brackets at 1.02`,
    // JSON carries Infinity as null: the open top band is null on both sides
    MD.pb.brackets.every((b, k) => (b.upper === null || MD.TC.MFJ_BR[k] === null) ? b.upper === MD.TC.MFJ_BR[k] : b.upper === Math.round(MD.TC.MFJ_BR[k] * f)));
  T(POST ? "A-11 its standard deduction at C-CPI-U (no one 65 yet)" : `A-11 ${KD}: its deduction at 1.02`, MD.pb.stdDed === Math.round(MD.TC.MFJ_STD * f), `${MD.pb.stdDed}`);
}

// ── §B Engine B's units on the example ─────────────────────────────────────────────────────────────────────────────────────────────
console.log("§B — Engine B, input by input, on the example");
{ const B = MD.B; const k = yr => Math.pow(1 + i, yr - B.asOf);
  const ssOf = yr => { const a = yr > B.ssAYr ? B.ssA * 12 : yr === B.ssAYr ? B.ssA * Math.max(0, 13 - B.ssAMo) : 0; const b = yr > B.ssBYr ? B.ssB * 12 : yr === B.ssBYr ? B.ssB * Math.max(0, 13 - B.ssBMo) : 0;
    return yr >= B.deathYr1 ? Math.max(a, b) : a + b; };
  const late = B.rows.filter(r => r.yr >= Math.max(B.ssAYr, B.ssBYr) + 1 && r.yr < B.deathYr1);   // both claimed, both alive
  if (POST) {
    T("B-1 Social Security is each year's dollars: today's benefit × (1+i)^(yr − as-of), every year", B.rows.every(r => near(r.ssTotal, ssOf(r.yr) * k(r.yr), 0.01)));
    T("B-2 the pension is the amount paid: flat, every year", B.rows.every(r => r.pen_y === B.pen * 12));
    T("B-3 the slider is that year's dollars: $70,000 in every early ladder year", B.rows.filter(r => r.yr <= B.ladderEnd).slice(0, 3).every(r => r.conv_y === 70000));
    T("B-4 dividends are a real balance's yield in each year's dollars", B.rows.every(r => r.div_y === Math.round(Math.max(0, B.taxInit - B.othHsa) * 0.02 * k(r.yr))));
    T("B-5 each row's tax in today's dollars is its tax ÷ (1+i)^(yr − as-of)", B.rows.every(r => near(r.k, k(r.yr), 1e-12) && near(r.totalTaxToday, r.totalTax / k(r.yr), 1e-6)));
    T("B-6 the lifetime total in today's dollars is the sum of the rows'", near(B.today.totAll, B.rows.reduce((a, r) => a + r.totalTaxToday, 0), 1e-6));
  } else {
    T(`B-1 ${KD}: Social Security held flat in today's dollars against thresholds growing 2%/yr`, late.length > 3 && late.every(r => near(r.ssTotal, ssOf(r.yr), 0.01)) && late[late.length - 1].ssTotal === late[1].ssTotal);
    T(`B-5 ${KD}: no today's-dollar figure — a row is in neither unit`, B.rows.every(r => r.totalTaxToday === undefined));
  }
}

// ── §C homogeneity — the extinction invariant ──────────────────────────────────────────────────────────────────────────────────────
console.log("§C — homogeneity: real income, rates forced to the plan's inflation, the same tax in today's dollars every year");
for (const [nm, label] of [["rental", "a COLA rental only, under 65"], ["rentalSS", "a COLA rental and Social Security on §86's 85% limb"]]) {
  const C = MD.C[nm]; const v = C.rows.map(r => r.today); const span = Math.max(...v) - Math.min(...v);
  T(`C-0 setup (${label}): the household pays tax (${C.rows.length} years)`, C.rows.length >= 5 && Math.min(...v) > 1000, `min ${Math.min(...v)}`);
  if (nm === "rentalSS") T("C-0b setup: §86 binds at 85% of benefits in every year (the unindexed base drops out)", C.rows.every(r => r.ssTotal > 0 && near(r.ssTaxable, 0.85 * r.ssTotal, 0.5)));
  if (POST) T(`C-1 ${label}: the tax in today's dollars is constant to $2 a year (span $${span.toFixed(2)})`, span <= 2 * 1);
  else T(`C-1 ${KD}: ${label} — the tax in today's dollars drifts (span $${span.toFixed(0)})`, span > 50);
}

// ── §D one clock ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("§D — one clock: a fixed amount is the amount paid; Engine D prices from the as-of year");
{ const D = MD.D; const k = yr => Math.pow(1 + i, yr - D.asOf);
  if (POST) {
    T("D-1 Engine B: the $1,000/mo pension is $12,000 in every year", D.B.every(r => r.pen_y === 12000));
    T("D-2 Engine B: the fixed $500/mo annuity is $6,000 and the COLA $700/mo rental grows from the as-of year", D.B.every(r => r.otherOrd_y === Math.round(6000 + 8400 * k(r.yr))));
    T("D-3 Engine D: the pension is $12,000 in every year", D.Dsch.every(r => r.pen_y === 12000));
    T("D-4 Engine D: expenses are the table × (1+i)^(yr − as-of)", D.Dsch.every(r => near(r.exp_y, r.tbl * k(r.yr), 0.01)));
    // D-7 (added with the build review): Engine C on the same clock — its MAGI is Engine B's, year by year, on this household (B's pension and
    // streams are pinned by D-1/D-2 above); a flat stream or Social Security in C would part them.
    T("D-7 Engine C: its MAGI is Engine B's in every year (the fixed amounts and the COLA rental on one clock in C too)", D.C.length > 10 && D.C.every(r => D.Bmagi[r.yr] === undefined || near(r.magi, D.Bmagi[r.yr], 1)),
      D.C.filter(r => D.Bmagi[r.yr] !== undefined && !near(r.magi, D.Bmagi[r.yr], 1)).slice(0, 3).map(r => `${r.yr}: ${Math.round(r.magi)} vs ${Math.round(D.Bmagi[r.yr])}`).join("; "));
  } else {
    T(`D-1 ${KD}: Engine B holds the COLA rental flat in today's dollars`, D.B.every(r => r.otherOrd_y === 14400));
    T(`D-4 ${KD}: Engine D prices from the retirement year`, D.Dsch.every(r => near(r.exp_y, r.tbl * Math.pow(1 + i, r.yr - D.R), 0.01)));
  }
  if (POST && !MD.Dbound) console.log("  D-5/D-6 — skipped: this run folder has no v6.29 module and this leg has no reference module (the v6.31 leg runs them against v6.30)");
  if (POST && MD.Dbound) { const Bd = MD.Dbound, refV = Bd.ref.replace(/^v(\d)(\d\d)$/, "v$1.$2");
    T("D-5 setup: the boundary household retires in the as-of year on both legs", Bd.Rn === Bd.asOf && Bd.Rp === Bd.asOf);
    T(`D-6 at the two-clock boundary Engine D is ${refV}'s to the cent (balance, expenses, ordinary draw, every year)`,
      Bd.n.length === Bd.p.length && Bd.n.every((r, j) => r.every((x, c) => near(x, Bd.p[j][c], 0.005))));
  }
}

// ── §E the Monte Carlo's schedule ──────────────────────────────────────────────────────────────────────────────────────────────────
console.log("§E — the Monte Carlo takes Engine B's tax in today's dollars");
{ const B = MD.B, E = MD.E;
  T(POST ? "E-1 mcIncomeTaxSchedule is each row's tax in today's dollars, to the cent" : `E-1 ${KD}: the schedule is the row's mixed-unit total`,
    B.rows.every(r => near(E.byYr[r.yr], POST ? r.totalTaxToday : r.totalTax, 0.005)));
  T("E-2 the charge mechanism is unchanged: schedule × the path's inflation × the quarter's fraction", near(E.charge, 1000 * 1.1 * 0.25, 1e-9)); }

// ── §F Engine A ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("§F — Engine A's today's-dollar fields");
{ const F = MD.F; const kH = Math.pow(1 + i, F.horizon - F.asOf);
  if (POST) {
    T("F-1 every strategy's estate in today's dollars is its estate ÷ the horizon year's factor (to $1)", F.rows.every(r => near(r.estateToday, r.estate / kH, 1)));
    T("F-2 the same for the ending Roth", F.rows.every(r => near(r.endRothToday, r.endRoth / kH, 1)));
    T("F-3 lifetime tax in today's dollars is below the sum of each year's dollars, and positive", F.rows.every(r => r.totTaxToday > 0 && r.totTaxToday < r.totTax));
    T("F-4 the ranking by estate is the ranking by estate in today's dollars", JSON.stringify([...F.rows].sort((a, b) => b.estate - a.estate).map(r => r.key)) === JSON.stringify([...F.rows].sort((a, b) => b.estateToday - a.estateToday).map(r => r.key)));
    // F-5/F-6 (added with the build review; F-1 to F-4 are consistency checks of the restatement, true by construction): Engine A's own units,
    // through its read-only per-year seam.
    const ys = Object.keys(F.incA || {}).map(Number);
    T("F-5 Engine A's Social Security is Engine B's in every year — each year's dollars (B-1 pins B's by hand)", ys.length > 10 && ys.every(y => F.ssB[y] === undefined || near(F.incA[y].ss, F.ssB[y], 0.01)),
      ys.filter(y => F.ssB[y] !== undefined && !near(F.incA[y].ss, F.ssB[y], 0.01)).slice(0, 3).map(y => `${y}: ${F.incA[y].ss} vs ${F.ssB[y]}`).join("; "));
    const FA = MD.FA, kA = y => Math.pow(1 + i, y - FA.asOf), yA = Object.keys(FA.inc || {}).map(Number);
    T("F-6 Engine A: the $1,000/mo pension is $12,000, the fixed annuity $6,000 and the COLA rental $8,400 × (1+i)^(yr − as-of), every year",
      yA.length > 10 && yA.every(y => FA.inc[y].pen === 12000 && near(FA.inc[y].otherOrd, 6000 + 8400 * kA(y), 1)),
      yA.filter(y => !(FA.inc[y].pen === 12000 && near(FA.inc[y].otherOrd, 6000 + 8400 * kA(y), 1))).slice(0, 3).map(y => `${y}: ${FA.inc[y].pen} / ${FA.inc[y].otherOrd}`).join("; "));
  } else T(`F-1 ${KD}: no today's-dollar fields`, F.rows.every(r => r.estateToday === undefined && r.totTaxToday === undefined));
}

// ── §G IRMAA surcharges ────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("§G — IRMAA surcharges grown to the premium year");
{ const Gd = MD.G; const k = yr => Math.pow(1 + i, yr - Gd.asOf); const hit = Gd.rows.filter(r => r.sur > 0);
  T("G-0 setup: the single filer is hit in several years", hit.length >= 3, `${hit.length}`);
  if (POST) {
    T("G-1 each surcharge is 2026's × persons × (1+i)^(premium year − as-of)", hit.every(r => near(r.sur, Gd.SUR[Math.min(r.tier, Gd.SUR.length - 1)] * r.persons * k(r.irmaaYr), 1e-6)));
    T("G-2 in today's dollars each surcharge is 2026's", hit.every(r => near(r.surToday, Gd.SUR[Math.min(r.tier, Gd.SUR.length - 1)] * r.persons, 1e-6)));
    T("G-3 the lifetime total in today's dollars sums the rows", near(Gd.totalIrmaaToday, Gd.rows.reduce((a, r) => a + r.surToday, 0), 1e-6));
  } else T(`G-1 ${KD}: surcharges flat at 2026's amount`, hit.every(r => r.sur === Gd.SUR[Math.min(r.tier, Gd.SUR.length - 1)] * r.persons));
}

// ── §I basis ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("§I — the inflation carry is a gain when sold");
T(POST ? `I-1 retiring twelve years out, the plan realizes more gain (today's $${Math.round(MD.I.gainsToday)}) than the retirement clock let it`
       : `I-1 ${KD}: retiring twelve years out, almost no realized gain (today's $${Math.round(MD.I.gainsToday)}) — the clock priced today's basis at retirement`,
  POST ? MD.I.gainsToday > 5000 : MD.I.gainsToday < 2000);
if (POST) { const IA = MD.I.A, RB = Math.pow(1 + i, MD.I.R - MD.I.asOf);
  T("I-2 Engine A opens the late retiree's taxable account carried to retirement while its basis stays at today's nominal figure",
    near(IA.open.taxBal, IA.taxableInit * RB, 1e-6) && near(IA.open.basis, IA.taxableInit * (1 - Math.max(0, Math.min(0.95, IA.gainFrac))), 1e-6) && IA.open.basis < IA.open.taxBal,
    `${IA.open.taxBal} / ${IA.open.basis} vs ${IA.taxableInit * RB} / ${IA.taxableInit * (1 - IA.gainFrac)}`); }

// ── §K an ACA bridge household under the cliff ─────────────────────────────────────────────────────────────────────────────────────
console.log("§K — an ACA bridge household under the 400% cliff");
{ const sub = Object.values(MD.K.sub || {}); T("K-1 setup: a subsidy is paid in at least one bridge year (the FPL rate is exercised)", sub.some(v => v > 0), JSON.stringify(MD.K.sub)); }

// ── §M the Monte Carlo against Engine B (scope §3 D (3)) ─────────────────────────────────────────────────────────────────────────────
// The planned path's inflation is fixed at the plan's, so a retirement year's four charges must be Engine B's tax for that year in its own
// dollars, apart from the compounding gap — the MC compounds by quarter from the as-of month, Engine B by year from the as-of year. The gap is
// COMPUTED for each year (today's tax × |Σ the quarters' inflators × their share − (1+i)^(year − as-of)|), never typed. On v6.29 the schedule
// is the row's own figure and the path grows it again, which no such gap explains.
console.log("§M — the Monte Carlo's quarterly charges against Engine B's year");
{ const Md = MD.M; const k = y => Math.pow(1 + Md.i, y - Md.asOf);
  const yrs = Md.rows.filter(r => r.yr > Md.asOf && r.yr >= Md.R && Md.byY[r.yr] && Math.abs(Md.byY[r.yr].n - 4) < 1e-9 && r.totalTax > 0);
  T("M-0 setup: ten or more whole retirement years with tax", yrs.length >= 10, `${yrs.length}`);
  const gap = r => (r.totalTax / k(r.yr)) * Math.abs(Md.byY[r.yr].S - k(r.yr));
  const off = yrs.filter(r => !(Math.abs(Md.byY[r.yr].charge - r.totalTax) <= gap(r) + 0.01));
  if (POST) {
    // M-1 is a restatement-consistency check: given E-1 (the schedule is the row ÷ its factor) it holds by algebra — it pins that the
    // quarter series and the charge compose with Engine B's figure. M-2 is the clock test.
    T("M-1 each year's four charges are Engine B's tax for that year within the year's compounding gap", off.length === 0, off.slice(0, 3).map(r => `${r.yr}: ${Md.byY[r.yr].charge.toFixed(2)} vs ${r.totalTax} (gap ${gap(r).toFixed(2)})`).join("; "));
    // M-2: the quarters of year Y sit after the as-of year's anniversary and before the next, so their average inflator lies between
    // (1+i)^(Y − as-of) and (1+i)^(Y − as-of + 1): the offset, in years, is in [0, 1). A clock one year off in either direction moves it out.
    const off2 = r => Math.log(Md.byY[r.yr].S / k(r.yr)) / Math.log(1 + Md.i);
    T("M-2 the two clocks are one: each year's quarterly inflator lies between that year's annual factor and the next (offset in [0, 1) year)",
      yrs.every(r => off2(r) >= 0 && off2(r) < 1), yrs.slice(0, 2).map(r => `${r.yr}: ${off2(r).toFixed(3)}`).join("; "));
  } else T(`M-1 ${KD}: the Monte Carlo grows the row's figure again — outside every year's compounding gap`, yrs.length > 0 && off.length === yrs.length, `${off.length} of ${yrs.length}`);
}

// ── §N statute oracles for the thresholds this release turns on (scope §3 A) ──────────────────────────────────────────────────────────
console.log("§N — the NIIT's unindexed threshold and the IRMAA tiers, against the statutes");
{ const N = MD.N; const NIIT_JOINT = 250000, NIIT_SINGLE = 200000;   // 26 U.S.C. §1411(b) — not indexed
  const law = r => Math.round(0.038 * Math.min(r.div + r.gain, Math.max(0, r.magi - ((N.single || r.yr > N.deathYr1) ? NIIT_SINGLE : NIIT_JOINT))));
  const hit = N.rows.filter(r => r.niit > 0);
  T("N-0 setup: the New York ×3 household pays NIIT in at least one year", hit.length >= 1, `${hit.length}`);
  T("N-1 every year's NIIT is 3.8% × min(NII, MAGI − $250,000 joint / $200,000 single), the thresholds NOT indexed — to the dollar", N.rows.every(r => r.niit === law(r)),
    N.rows.filter(r => r.niit !== law(r)).slice(0, 3).map(r => `${r.yr}: ${r.niit} vs ${law(r)}`).join("; "));
  const idx = r => Math.round(0.038 * Math.min(r.div + r.gain, Math.max(0, r.magi - ((N.single || r.yr > N.deathYr1) ? NIIT_SINGLE : NIIT_JOINT) * Math.pow(1 + i - GAP, r.yr - 2026))));
  T("N-1b the check discriminates: thresholds indexed at the bracket rate would give different NIIT in at least one year", N.rows.some(r => idx(r) !== law(r)));
  const Gd = MD.G; const SGL26 = [109000, 137000, 171000, 205000], TOP = 500000;   // 2026 single tiers (CMS) — typed here, not read from the app
  T("N-2 setup: the app's 2026 single tiers are the typed ones", JSON.stringify(Gd.SGL.slice(0, 4)) === JSON.stringify(SGL26) && Gd.SGL[4] === TOP);
  const rate = POST ? i : 0.02;
  const tierLaw = r => { const g = Math.pow(1 + rate, r.irmaaYr - 2026), gTop = Math.pow(1 + rate, Math.max(0, r.irmaaYr - 2027));   // the top tier frozen through 2027
    return SGL26.filter(t => r.magi > t * g).length + (r.magi >= TOP * gTop ? 1 : 0); };   // §1395r(i)(3): "exceeds" each tier; the top is "at least"
  const bad = Gd.rows.filter(r => r.tier !== tierLaw(r));
  T(POST ? "N-3 every IRMAA row's tier is the statute's at CPI-U, the plan's inflation, to the premium year (single filer)" : `N-3 ${KD}: the tiers at the 2% proxy`,
    Gd.rows.length > 0 && bad.length === 0, bad.slice(0, 3).map(r => `${r.yr}: ${r.tier} vs ${tierLaw(r)} (magi ${Math.round(r.magi)})`).join("; "));
}

// ── §O the planned-contribution accrual at face value (DU-7 (a)) ───────────────────────────────────────────────────────────────────
// Added after the build review (scope §7): the first v6.30 build carried the accrual to retirement with the holdings, at every engine's seed —
// against DU-7 (a) and the v5.10 rule. The scope's prototype did the same, so its figures and every oracle built from them agreed with it.
console.log("§O — today's holdings carried, the contribution accrual at face value");
{ const O = MD.O;
  if (POST) {
    const RB = Math.pow(1 + i, O.R - O.asOf), hA = O.holdA * RB + O.accA, hB = O.holdB * RB + O.accB;
    T("O-0 setup: the late retiree accrues contributions, and carrying them would move the opening balance by over $1,000", O.accA > 0 && (O.accA + O.accB) * (RB - 1) > 1000, `${O.accA} / ${RB}`);
    T("O-1 Engine B's opening Traditional balances are today's holdings × (1+i)^(retire − as-of) plus the accrual at face value", near(O.B.A, hA, 1e-6) && near(O.B.B, hB, 1e-6), `A ${O.B.A} vs ${hA}; B ${O.B.B} vs ${hB}`);
    T("O-2 Engine C's the same", near(O.C.A, hA, 1e-6) && near(O.C.B, hB, 1e-6), `A ${O.C.A} vs ${hA}`);
    const u = O.unit;   // by hand: (100,000 − 20,000) × 1.1 + 20,000 = 108,000; annuity 10,000 × 1.1 = 11,000; employer (45,000 − 5,000) × 1.1 + 5,000 = 49,000
    T("O-3 carryStartBalances on typed figures: balance, Roth, annuity and employer shares re-taken on the carried amounts", !!u && near(u.tradInitA, 108000, 1e-9) && near(u.rothInitA, 54000, 1e-9)
      && near(u.annShareA, 11000 / 108000, 1e-12) && near(u.empShareA, 49000 / 97000, 1e-12), JSON.stringify(u));
  } else T(`O-0 ${KD}: no carry — Engine D prices from the retirement year, so the accrual question does not arise`, O.B === null && !O.unit);
}

// ── §H the source, by AST ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("§H — the source, by AST");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = []) => { if (pred(root)) out.push(root); for (const c of kids(root)) all(c, pred, out); return out; };
const topFn = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
const srcOf = n => SRC.slice(n.start, n.end);
{ const lits = all(AST, n => n.type === "Literal" && n.value === 1.02);
  const ids = all(AST, n => n.type === "Identifier" && /^(TAX_INDEX_RATE|IRMAA_INDEX_RATE|fplInflProxy)$/.test(n.name));
  if (POST) {
    T("H-1 no numeric 1.02 anywhere in the source (E-9, E-22)", lits.length === 0, lits.map(n => SRC.slice(0, n.start).split("\n").length).join(","));
    T("H-2 TAX_INDEX_RATE, IRMAA_INDEX_RATE and fplInflProxy are gone", ids.length === 0);
  } else T(`H-1 ${KD}: the 2%/yr proxy is a literal at ${lits.length} sites (two declarations, E-9)`, lits.length >= 4 && ids.length >= 3);
  const D = topFn("computeWithdrawalPlan"), Dsrc = D ? srcOf(D) : "";
  if (POST) {
    T("H-3 Engine D's inflator runs from the as-of year", /_wInflator = \(yr\) => Math\.pow\(1 \+ _wInfl, Math\.max\(0, yr - _tlW\.asOfYear\)\)/.test(Dsrc));
    // v6.35 (D-44): the carry is a `*= _rb`. Through v6.34 every `*=` in Engine D was the carry; v6.35 scales the gain basis pro rata when a
    // one-time row before retirement is paid from the gain pool (`gainBasis *= …`, the gain share kept) — a spend, not a carry, so the
    // check reads the carry's own multiplier rather than every `*=`. Its claim is unchanged: the basis is never carried at inflation.
    const carry = all(D, n => n.type === "AssignmentExpression" && n.operator === "*=" && srcOf(n.right) === "_rb").map(n => srcOf(n.left));
    T("H-4 the carry moves the balances and the gain pool …", ["b1", "b2", "b3", "b4", "taxable", "taxGainPool"].every(x => carry.includes(x)));
    T("H-5 … and never the gain basis", !carry.includes("gainBasis"));
    const bridge = topFn("withdrawalPlanSeries");
    T("H-6 the bridge passes Engine D's figures through (no inflation arithmetic)", bridge && all(bridge, n => n.type === "CallExpression" && /Math\.pow|planDollarFactor/.test(srcOf(n.callee))).length === 0);
    // v6.31 (D-51, DS-3 (a)): What Breaks adds Engine A's IRMAA, also in today's dollars (t94 D-4 holds the rendered figure). An array, so the registrar widens it.
    // v6.36 (D-66): What Breaks reads the Monte Carlo's schedule instead — `whatBreaksAnnualTax`, in today's dollars (t100 holds it).
    T(`H-7 What Breaks reads ${["v636", "v637", "v638", "v639", "v640"].includes(VER) ? "the Monte Carlo's schedule" : "Engine A's tax"} in today's dollars`, ["v636", "v637", "v638", "v639", "v640"].includes(VER)
      ? /const _wbT = whatBreaksAnnualTax\(_retireYr, _horizonYr, \{ rothAmount, qcdAnnual, taxYield, scenarioPreset \}\);/.test(SRC) && /estAnnualTax = _wbT\.annual;/.test(SRC)
      : ["v631", "v632", "v633", "v634", "v635"].includes(VER)
      ? /estAnnualTax = \(_cT\.totTaxToday \+ \(Number\.isFinite\(_cT\.totIrmaaToday\) \? _cT\.totIrmaaToday : 0\)\) \/ planYears/.test(SRC)
      : /estAnnualTax = _cT\.totTaxToday \/ planYears/.test(SRC));
    T("H-8 What Breaks values a fixed pension at its real worth at retirement", /const annualPenGuar = \(\) => _pen \* 12 \/ _rbWB;/.test(SRC));
    T("H-9 the Verify tab's IRMAA checks compute their expected values from the scenario table, not from the helper", /const _cpiuV = Object\.values\(SCENARIOS\)\.reduce/.test(SRC));
    // H-10 (added with §O): the carry has ONE home — no constructor balance is multiplied by a carry factor at a call site, and Engines A, B
    // and C, the Roth ladder and its RMD cards all call `carryStartBalances`.
    const mulInit = all(AST, n => n.type === "BinaryExpression" && n.operator === "*" && /(tradInit|rothInit)[AB]?\b/.test(srcOf(n.left)) && /^_rb[A-Za-z0-9]*$/.test(srcOf(n.right).trim()));
    const callers = all(AST, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "carryStartBalances").length;
    T("H-10 no call site multiplies a constructor balance by the carry factor itself; five sites call carryStartBalances", mulInit.length === 0 && callers >= 5,
      `${mulInit.map(n => SRC.slice(0, n.start).split("\n").length).join(",")} / ${callers} calls`);
    // H-11 (added after the build review, scope §3 F): the figures the law does NOT index — §86's thresholds, the NIIT's, the Additional
    // Medicare Tax's, the OBBBA senior deduction and its phase-out, the self-employment floor — never reach an inflator.
    const INFL = /^(inflateTaxConst|inflateWageBase|irmaaThresholdFor|infl|inflate|planDollarFactor|_kY|_kYL)$/, FIXED = /NIIT|\.niit\b|SS_THR|ADDL_MED|SENIOR_BONUS|SE_MIN_NET/;   // `taxFactsFor(…).niit` is how Engines A and B read the NIIT threshold
    const fixedIn = all(AST, n => n.type === "CallExpression" && n.callee.type === "Identifier" && INFL.test(n.callee.name) && n.arguments.some(a => FIXED.test(srcOf(a))));
    T("H-11 no unindexed statutory figure (§86, NIIT, Additional Medicare, the OBBBA deduction, the SE floor) is passed to an inflator", fixedIn.length === 0,
      fixedIn.map(n => SRC.slice(0, n.start).split("\n").length).join(","));
  } else T(`H-6 ${KD}: the bridge deflates the draw and not the gain`, /ordDrawByYr\[r\.yr\] = \(r\.ordDraw_y \|\| 0\) \/ Math\.pow/.test(SRC));
}

// ── §J copy, by AST over every string ──────────────────────────────────────────────────────────────────────────────────────────────
console.log("§J — copy");
{ const strs = all(AST, n => (n.type === "Literal" && typeof n.value === "string") || n.type === "TemplateElement" || n.type === "JSXText")
    .map(n => n.type === "TemplateElement" ? (n.value.cooked || n.value.raw) : n.type === "JSXText" ? n.value : n.value).join("\n");
  const NW = s => s.replace(/\s+/g, " ");
  const S = NW(strs);
  const GONE = ["so read as each year's own dollars these rows run", "brackets indexed 2%/yr from", "thresholds indexed ~2%/yr", "Thresholds inflate ~2%/yr in the projection below",
    "bracket inflation is modeled at 2%/yr", "which the Monte Carlo treats as today's dollars", "Amounts are today's dollars.", "today's dollars per month",
    "the imported draws are restated in today's dollars while this tab's RMDs are not", "(§06's inflation map gives the measurement)", "Making the units consistent is filed as its own fix"];
  const NEW = ["Every figure is in that year's own dollars.", "Every dollar figure in the table is in", "One dollar unit and one inflation clock for the tax engines (v6.30).",
    "The amount paid each month, as the pension statement gives it", "Tax-threshold indexation, by statute"];
  for (const g of GONE) T(POST ? `J-gone: "${g.slice(0, 60)}"` : `J ${KD}: still says "${g.slice(0, 50)}"`, POST ? !S.includes(g) : S.includes(g));
  for (const g of NEW) T(POST ? `J-new: "${g.slice(0, 60)}"` : `J-new absent on the prior leg: "${g.slice(0, 50)}"`, POST ? S.includes(g) : !S.includes(g));
}

// ── §L the rendered tabs ───────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("§L — the rendered tabs (example household)");
const noop = async () => ({ ok: false, status: 599, json: async () => ({}), text: async () => "" });
window.fetch = noop; globalThis.fetch = noop; window.confirm = () => true;
window.URL.createObjectURL = () => "blob:t93"; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = () => "blob:t93"; globalThis.URL.revokeObjectURL = () => {};
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
let root = null, act, DangerClose, el;
const body = () => window.document.body;
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button")].find(b => (b.textContent || "").trim().toLowerCase() === name);
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const render = async () => { el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let k = 0; k < 4; k++) await flush(); };
const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); await flush(); await flush(); };
const txt = () => (el.textContent || "").replace(/\s+/g, " ");
reseed(); window.localStorage.clear(); await render();
if (btn(/USE EXAMPLE DATA/)) { await click(btn(/USE EXAMPLE DATA/)); for (let k = 0; k < 6; k++) await flush(); }   // the DATA LOAD screen first
await go("taxes"); const tx = txt(); const qcdUnits = !!el.querySelector('[data-dc-input-units="qcd"]'); if (process.env.T93_DEBUG) console.log("DEBUG taxes:", tx.slice(0, 1500)); const todayCards = el.querySelectorAll("[data-dc-today]").length;
await go("irmaa"); const ir = txt();
await go("withdrawal"); const wd = txt(); const wdUnits = !!el.querySelector('[data-dc-units="withdrawal"]');
const qtxt = sel => { const n = el.querySelector(sel); return n ? (n.textContent || "").replace(/\s+/g, " ").trim() : null; };
const wdToday = { drawn: qtxt('[data-dc-today-wd="drawn"]'), conv: qtxt('[data-dc-today-wd="conv"]') };
await go("roth"); for (let k = 0; k < 20 && !/Estate after heir income tax/.test(txt()); k++) await flush(250); const ro = txt();
const convUnits = !!el.querySelector('[data-dc-input-units="conversion"]');
const ladT = ["conv", "tax"].map(w => { const n = el.querySelector(`[data-dc-today-ladder="${w}"]`); return n ? { today: (n.textContent || "").trim(), each: (n.previousElementSibling ? n.previousElementSibling.textContent : "").trim() } : null; });
// the expected Withdrawal totals in today's dollars, computed in this window from Engine D's schedule under the DOM's own prior (BULL-LEANING)
const wdExp = (() => { try { const g = window.__g, tl = g.PLAN_TIMELINE(), iD = Object.values(g.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0);
  const sch = g.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: 70000, scenarioPreset: "bull" }).schedule, f = y => Math.pow(1 + iD, y - tl.asOfYear);
  return { iD, asOf: tl.asOfYear, start: tl.rothLadderStart, end: tl.rothLadderEnd, drawn: sch.reduce((a, r) => a + r.totalDraw / f(r.yr), 0), conv: sch.reduce((a, r) => a + r.conv_y / f(r.yr), 0) }; } catch (e) { return { err: String(e) }; } })();
await go("my data"); const md = !!el.querySelector("[data-dc-pension-units]");
// §W What Breaks (scope §3 E): its estimate is Engine A's lifetime tax in TODAY's dollars spread over the plan years — the projector grows it
// with inflation, so a tax already in each year's dollars would be grown twice. Expected computed here in the same window from Engine A, with
// the inputs What Breaks passes (read from the app's own getters).
await go("what breaks"); for (let k = 0; k < 20 && !/estimated taxes/.test(txt()); k++) await flush(250); const wbTxt = txt();
const wbExp = (() => { try { const g = window.__g, tl = g.PLAN_TIMELINE(), P = g.PORTFOLIO(); const R = tl.targetRetireYear;
  const hz = Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), planYears = hz - R + 1;
  const pT = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R, horizonYr: hz, ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ssA: g.getSSA(), ssB: tl.single ? 0 : g.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month || 1, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month || 1,
    pen: g.getPension(), penOwner: g.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: P.stateCode || null, ...g.retireStartBalances(R),
    ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    taxableInit: g.taxableInitAll(), taxYieldPct: 2.0, currentConv: 70000,
    ordDrawByYr: g.withdrawalPlanSeries({ retireYear: R, rothAmount: 70000, scenarioPreset: "bull" }).ordDrawByYr };
  const c = g.runRothStrategies(pT).find(r => r.key === "current");
  // v6.36 (D-66): what What Breaks now charges — the Monte Carlo's schedule at the page's settings (the DOM opens on BULL-LEANING)
  const sch = g.whatBreaksAnnualTax ? g.whatBreaksAnnualTax(R, hz, { rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "bull" }).annual : null;
  return { planYears, today: c.totTaxToday, each: c.totTax, sch }; } catch (e) { return { err: String(e) }; } })();
const wbShown = (wbTxt.match(/estimated taxes \(~\$(\d+)K\/yr/) || [])[1];   // v6.36: no longer followed by "average" (the copy reads "K/yr, the average of…")
if (POST) {
  // the NIIT card carries no today's line when the plan pays no NIIT (the example pays none), so five or six
  T("L-1 the Taxes tab's lifetime cards give today's dollars (the NIIT card only when there is NIIT)", todayCards >= 5, `${todayCards}`);
  T("L-2 the Taxes tab says its rows are each year's own dollars", tx.includes("Every figure is in that year's own dollars"));
  T("L-3 the IRMAA tab's table says each year's own dollars", ir.includes("— each year's own dollars"));
  T("L-4 the Withdrawal tab says what its dollars are", wdUnits);
  T("L-5 the Roth comparator says it is in today's dollars", ro.includes("Every dollar figure in the table is in today's dollars"));
  T("L-6 My Data says the pension is the amount paid", md);
  // L-7 to L-9 (added after the build review's re-check: the new displays shipped untested). Exact for the Withdrawal tab (Engine D is
  // module-level, read in this window); bounded for the ladder (component-inline): its today's figure must lie between its own total ÷ the
  // ladder's last year's factor and ÷ its first year's — a total not restated, or restated on another clock, falls outside.
  T("L-7 the Withdrawal tab's Total withdrawn in today's dollars is Σ each year's draw ÷ (1+i)^(yr − as-of), to the display's $0.01M",
    wdToday.drawn === `$${(wdExp.drawn / 1e6).toFixed(2)}M in today's dollars`, `${wdToday.drawn} vs ${(wdExp.drawn / 1e6).toFixed(2)} ${wdExp.err || ""}`);
  T("L-7b … and Roth converted, to the display's $1K", wdToday.conv === `$${(wdExp.conv / 1000).toFixed(0)}K in today's dollars`, `${wdToday.conv} vs ${(wdExp.conv / 1000).toFixed(0)}K`);
  const num = t => +String(t || "").replace(/[^0-9.]/g, "") * (/M\b/.test(t || "") ? 1e6 : 1);
  const ladOk = l => !!l && (() => { const e = num(l.each), d = num(l.today), kS = Math.pow(1 + wdExp.iD, wdExp.start - wdExp.asOf), kE = Math.pow(1 + wdExp.iD, wdExp.end - wdExp.asOf);
    return e > 0 && d >= e / kE * 0.99 && d <= e / kS * 1.01; })();
  T("L-8 the Roth ladder's Total conversion and Total tax cost each carry a today's-dollar figure between the total ÷ its last year's factor and ÷ its first",
    ladOk(ladT[0]) && ladOk(ladT[1]), JSON.stringify(ladT));
  T("L-9 the conversion slider and the QCD modeler say what kind of dollars they hold", convUnits && qcdUnits, `${convUnits} / ${qcdUnits}`);
  const kToday = Math.round(wbExp.today / wbExp.planYears / 1000), kEach = Math.round(wbExp.each / wbExp.planYears / 1000);
  T("W-0 setup: What Breaks renders its tax estimate, and today's and each year's readings differ by at least $1K a year", wbShown !== undefined && kToday !== kEach, `${wbShown} / ${kToday} / ${kEach} ${wbExp.err || ""}`);
  if (["v636", "v637", "v638", "v639", "v640"].includes(VER)) T(`W-1 What Breaks' estimate is the Monte Carlo's schedule, in today's dollars, averaged over the plan years (~$${Math.round(wbExp.sch / 1000)}K/yr, ±$500 — the display rounds to $1K; v6.36, D-66)`,
    wbExp.sch != null && +wbShown === Math.round(wbExp.sch / 1000), `shown ${wbShown}`);
  else T(`W-1 What Breaks' estimate is Engine A's lifetime tax in today's dollars over the plan years (~$${kToday}K/yr, ±$500 — the display rounds to $1K)`, +wbShown === kToday, `shown ${wbShown}`);
} else {
  T(`L-2 ${KD}: the Taxes tab describes two readings of one figure`, tx.includes("read as each year's own dollars these rows run") || tx.replace(/\s/g, "").includes("readaseachyear'sowndollarstheserowsrun"));
  T("L-1 no today's-dollar cards on the prior leg", todayCards === 0);
  T(`W-1 ${KD}: What Breaks grows Engine A's mixed-unit total (~$${Math.round(wbExp.each / wbExp.planYears / 1000)}K/yr)`, wbShown !== undefined && +wbShown === Math.round(wbExp.each / wbExp.planYears / 1000), `shown ${wbShown}`);
}

console.log(`\nt93: ${pass} passed, ${fail} failed`);
if (fails.length) { console.log("FAILURES:"); fails.forEach(f => console.log(f)); }
process.exit(fail ? 1 : 0);
