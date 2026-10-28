// t42 — A SINGLE HOUSEHOLD IS NOT PAID SPOUSE B'S SOCIAL SECURITY (C-7)
// (SCOPE_SINGLE_HOUSEHOLD_SPOUSE_B_SS; added for v5.76). Runs on BOTH legs:
//     node t42_single_spouse_b_ss.mjs v575   |   node t42_single_spouse_b_ss.mjs v576
//
// THE RULE. Social Security retirement benefits belong to the worker who earned them (42 U.S.C.
// §402(a)). A single household has no spouse B, so there is no spouse-B benefit to pay. v5.75 already
// said so at 12 of 25 `getSSB()` call sites and in both in-app save paths; v5.76 puts the rule in the
// getter itself (D-1), stops the loader inventing a $1,300/mo benefit for a single plan with no spouse-B
// block (D-3), and shows a one-line note when a single plan carries a stored figure it ignores (D-2c).
//
// THE HOUSEHOLD is the shipped example made single (retirement 2029, base preset, no conversions).
// "Correct" is the same household with spouse B's benefit zeroed: a single household's figures must
// not depend on a spouse-B figure at all, so the zeroed case IS the statutory answer, and every
// assertion below compares against it TO THE DOLLAR, not to a tolerance.
//
// HAND CHECKS, worked independently of the engine (2035, single, correct case):
//   Withdrawal plan: draw needed = spending 113,186 − (SS 46,573 + pension 4,800) = 61,813.
//     v5.75 paid the phantom spouse-B benefit that year (18,347), so it drew 61,813 − 18,347 = 43,466.
//   Taxes tab: provisional income 4,800 + 42,146.09 (Traditional draw) + ½ × 39,600 = 66,746.09;
//     taxable SS = 0.85 × (66,746.09 − 34,000) + 4,500 = 32,334.17 (under the 0.85 × 39,600 cap);
//     deduction 16,100 × 1.02^9 = 19,241 + age-65 extra 2,050 × 1.02^9 = 2,450 (bonus expired 2028);
//     taxable income 79,280.26 − 21,691 = 57,589.26, in the 12% band (10% top 12,400 × 1.02^9 = 14,819.15)
//     -> 1,481.92 + 0.12 × 42,770.11 = 6,614.33.
//   v6.18 (D-41), the same year re-derived: Engine D now spends 2035's own table — $7,620 a month (the $400 car payment ended April
//   2034) × 12 = 91,440 × 1.0274^6 (base-scenario inflation from 2029) = 107,540.88 — so draw needed = 107,541 − 51,373 = 56,168.
//   Taxes tab: the bridge's Traditional draw is now 38,297.03; provisional 4,800 + 38,297.03 + 19,800 = 62,897.03; taxable SS
//   0.85 × (62,897.03 − 34,000) + 4,500 = 29,062.48; taxable income 4,800 + 38,297.03 + 29,062.48 − 21,691 = 50,468.51 (12% band)
//   -> 1,481.92 + 0.12 × (50,468.51 − 14,819.15) = 5,759.84. (The DC_V617_SPENDING=1 run still reproduces 61,813 and 6,614.33.)
//
// ⚠ MONTE CARLO SEEDING TRAP. The simulation's market noise comes from `d3.randomNormal`, and d3
//   captures its own reference to Math.random WHEN IT LOADS. Replacing Math.random after the import
//   seeds only half the randomness; identical runs then differ by ~$3,000 and a comparison reads noise
//   as signal (a first measurement for this scope was contaminated exactly so). The resettable seeded
//   source below is installed BEFORE the app module is imported, and M-0 asserts the harness itself is
//   deterministic before any Monte Carlo comparison is trusted.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2];
const KNOWN_VERSIONS = ["v575", "v576", "v577", "v578", "v579", "v580", "v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598", "v599", "v600", "v601", "v602", "v603", "v604", "v605", "v606", "v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.\n    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST = VER === "v576" || VER === "v577" || VER === "v578" || VER === "v579" || VER === "v580" || VER === "v581" || VER === "v582" || VER === "v583" || VER === "v584" || VER === "v585" || VER === "v586" || VER === "v587" || VER === "v588" || VER === "v589" || VER === "v590" || VER === "v591" || VER === "v593" || VER === "v594" || VER === "v595" || VER === "v596" || VER === "v597" || VER === "v598" || VER === "v599" || VER === "v600" || VER === "v601" || VER === "v602" || VER === "v603" || VER === "v604" || VER === "v605" || VER === "v606" || VER === "v607" || VER === "v608" || VER === "v609" || (VER === "v610" || (VER === "v611" || (VER === "v612" || (VER === "v613" || (VER === "v614" || (VER === "v615" || (VER === "v616" || (VER === "v617" || (VER === "v618" || (VER === "v619" || (VER === "v620" || (VER === "v621" || (VER === "v622" || (VER === "v623" || (VER === "v624" || (VER === "v625" || VER === "v626" || VER === "v627" || (VER === "v628" || (VER === "v629" || VER === "v630" || (VER === "v631" || VER === "v632" || VER === "v633" || VER === "v634"))))))))))))))))))) || VER === "v604" || VER === "v605" || VER === "v606" || VER === "v607" || VER === "v608" || VER === "v609" || (VER === "v610" || (VER === "v611" || (VER === "v612" || (VER === "v613" || (VER === "v614" || (VER === "v615" || (VER === "v616" || (VER === "v617" || (VER === "v618" || (VER === "v619" || (VER === "v620" || (VER === "v621" || (VER === "v622" || (VER === "v623" || (VER === "v624" || (VER === "v625" || VER === "v626" || VER === "v627" || (VER === "v628" || (VER === "v629" || VER === "v630" || (VER === "v631" || VER === "v632" || VER === "v633" || VER === "v634")))))))))))))))))));

// resettable seeded source, installed BEFORE the import (see the seeding trap above)
const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(1); const _realRandom = Math.random; Math.random = () => _src();
const mod = await import(process.argv[3] || `./app_${VER}.mjs`);
const G = mod.__g, E = mod.__engines;

let pass = 0, fail = 0; const fails = [];
const T = (name, got, exp) => { const ok = typeof exp === "number" ? Math.abs(got - exp) < 0.005 : got === exp;
  if (ok) pass++; else { fail++; fails.push(`  \u2717 ${name}: got ${got}  exp ${exp}`); } };
console.log(`t42 — SINGLE HOUSEHOLD, SPOUSE-B SOCIAL SECURITY (${VER})`);

const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
// v6.18 (D-41): Engine D reads the expense table year by year, which moved this suite's spending-borne figures (2035's spending: the car
// payment is paid off by then). PIN18 picks the v6.18 figures; the v6.18 leg is ALSO run with DC_V617_SPENDING=1 — every household here
// loaded with v6.17's spending as a table (qa/tools/v617_spending.mjs, split at that household's own Medicare year) — where every v6.17
// figure must still come out exactly. That run attributes each move to the spending read alone.
const POST_D41 = ["v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER);   // an array, so the registrar widens it
const SPEND17 = POST_D41 && process.env.DC_V617_SPENDING === "1";
const PIN18 = POST_D41 && !SPEND17;
const P41 = (v617, v618) => PIN18 ? v618 : v617;
// v6.21 (D-42): the example's table carries four $40,000 car rows from 2037, which Engine D now spends, so every example figure here that
// rides on its draws after 2036 moved. PIN21 picks the v6.21 figures (measured at the build). The v6.21 leg is ALSO run with
// DC_V620_TABLE=1 — the example's table without its car rows, which is v6.20's — and there every v6.20 figure must come out exactly: that
// second run attributes each move to the rows alone (runsuite.sh, "<suite>-<cur>-table620"; t84 C proves v6.21 on that table IS v6.20).
const POST_D42 = ["v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER);   // an array, so the registrar widens it
const TABLE620 = POST_D42 && process.env.DC_V620_TABLE === "1";
const PIN21 = POST_D42 && !TABLE620;
const P42 = (v620, v621) => PIN21 ? v621 : v620;
const EX0 = JSON.parse(JSON.stringify(G.EXPENSES())).filter(e => !(TABLE620 && e && e.label === "Replacement car"));   // v6.21: TABLE620 → v6.20's table
const { v617Table } = await import("./tools/v617_spending.mjs");
if (SPEND17) console.log("  (DC_V617_SPENDING=1 — v6.17's spending, as a table: every v6.17 figure must come out exactly)");
if (TABLE620) console.log("  (DC_V620_TABLE=1 — v6.20's table, the car rows removed: every v6.20 figure must come out exactly)");
const RY = G.PLAN_TIMELINE().targetRetireYear;
// v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): Engine D's inflation clock starts at the as-of year (it started at retirement), and the
// tax engines state each year in its own dollars. On the v6.30 leg the hand checks are re-derived on those rules: A-1 is the year's table
// spending less the benefit, both × (1+i)^(2035 − as-of), less the fixed pension; A-2 and D-3 are the shared federal oracle
// (qa/tools/fed_oracle_v630.mjs — Rev. Proc. 2025-32 at chained CPI-U, the §86 statute) on each Engine B row's own income legs; D-1 is
// spouse B's check, × (1+i)^(y − as-of), summed over the years Engine D pays it. `i` is the base preset's inflation (this module's
// SCENARIOS table). D-2 (Engine D's lifetime draw) and D-4 (the Monte Carlo planned path) have no oracle and are re-pinned BY MEASUREMENT,
// disclosed in the CHANGELOG; the v6.17-spending and v6.20-table legs skip those two (the units end their exact reproduction).
const U630 = ["v630", "v631", "v632", "v633", "v634"].includes(VER);   // an array, so register_tag2 widens it each release
const I30 = Object.values(G.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0);
const K30 = y => Math.pow(1 + I30, y - G.PLAN_TIMELINE().asOfYear);
let FED30 = null;
if (U630) { const { existsSync } = await import("fs");
  const _f = [new URL("./tools/fed_oracle_v630.mjs", import.meta.url), new URL("./fed_oracle_v630.mjs", import.meta.url)].find(u => existsSync(u));
  FED30 = (await import(_f.href)).makeFedOracle; }
const A = { retireYear: RY, rothAmount: 0, qcdAnnual: 0, taxYield: 0, scenarioPreset: "base" };
const sum = (r, k) => r.reduce((s, x) => s + (x[k] || 0), 0);
const load = (edit) => { const P = JSON.parse(JSON.stringify(BASE)); edit(P); G.applyLoadedData({ portfolio: P, expenses: JSON.parse(JSON.stringify(EX0)) });
  if (SPEND17) G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(P)), expenses: v617Table(G, EX0) }); };
const STORED = P => { P.single = true; };
const ZEROED = P => { P.single = true; P.incomeSources.ssB.planned = 0; for (const k in P.incomeSources.ssB.tableByAge || {}) P.incomeSources.ssB.tableByAge[k] = 0; };
const NOBLOCK = P => { P.single = true; delete P.incomeSources.ssB; };
const MARRIED = P => {};
const figures = () => {
  const D = G.computeWithdrawalPlan(A).schedule, S = G.withdrawalPlanSeries(A);
  const B = E.computeTaxPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows;
  const C = E.computeIrmaaPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows || [];
  // The Monte Carlo reads the expense table itself and did not change at v6.18, so under DC_V617_SPENDING=1 it runs on the REAL table.
  let _keep = null; if (SPEND17) { _keep = { P: JSON.parse(JSON.stringify(G.PORTFOLIO())), X: JSON.parse(JSON.stringify(G.EXPENSES())) }; G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(_keep.P)), expenses: JSON.parse(JSON.stringify(EX0)) }); }
  const pp = G.runMonteCarlo(RY, 50).plannedPath;
  _src = mulberry(2026); const arr = G.runMonteCarlo(RY, 800).results;
  if (_keep) G.applyLoadedData({ portfolio: _keep.P, expenses: _keep.X });
  const med = Math.round(arr.map(x => x[x.length - 1]).sort((a, b) => a - b)[arr.length >> 1]);
  const d35 = D.find(x => x.yr === 2035), b35 = B.find(x => x.yr === 2035);
  const _o = FED30 ? FED30(I30, G.PLAN_TIMELINE()) : null;
  return { b35o: _o ? Math.round(_o(b35).fed * 100) / 100 : null, fedO: _o ? Math.round(B.reduce((t, r) => t + _o(r).fed, 0)) : null,
           ssBpaid: D.filter(x => x.ssB_y > 0).map(x => x.yr),
           ssB: Math.round(sum(D, "ssB_y")), draws: Math.round(sum(D, "totalDraw")), end: Math.round(D[D.length - 1].portfolioTotal),
           fed: Math.round(sum(B, "fedTax")), irmaa: Math.round(sum(C, "surchargeAnnual")), pp: Math.round(pp[pp.length - 1]), med,
           d35need: Math.round(d35.drawNeeded), d35ssB: Math.round(d35.ssB_y), b35fed: Math.round(b35.fedTax * 100) / 100 };
};

// ── M-0 · the harness is deterministic, or no Monte Carlo line below means anything ──────────────
load(ZEROED); const z1 = figures(), z2 = figures();
T("M-0 the seeded Monte Carlo harness is deterministic (two identical runs agree to the dollar)", z1.med, z2.med);

// ── A · the correct case, and the hand checks ────────────────────────────────────────────────────
const OK = z1;
if (U630) {
  // 2035's table spending is $7,620/mo (v6.18's note above; the example's table, with or without the car rows, carries that in 2035);
  // the v6.17 table's 2035 figure is 113,186 / 1.0274^6 a year in 2029 dollars — the same rule reads it from that leg's own table.
  const spend35 = SPEND17 ? 113186 / Math.pow(1 + I30, 6) : 7620 * 12, need = Math.round((spend35 - G.getSSA() * 12) * K30(2035) - G.getPension() * 12);
  T(`A-1 2035 Withdrawal plan (v6.30 units): draw needed = (${Math.round(spend35).toLocaleString()} − ${(G.getSSA() * 12).toLocaleString()}) × (1+i)^9 − ${(G.getPension() * 12).toLocaleString()} = ${need.toLocaleString()}, no spouse-B income`,
    OK.d35need, need);
  T(`A-2 2035 Taxes tab (v6.30 units): federal tax is the oracle's on the row's own legs — $${OK.b35o}`, OK.b35fed, OK.b35o);
} else {
T(P41("A-1 2035 Withdrawal plan: draw needed = 113,186 - (46,573 + 4,800), no spouse-B income",
        "A-1 2035 Withdrawal plan: draw needed = 107,541 - (46,573 + 4,800), no spouse-B income (v6.18, see header)"), OK.d35need, P41(61813, 56168));
T("A-2 2035 Taxes tab: federal tax by hand (see header)", OK.b35fed, P41(6614.33, 5759.84));
}

// ── B · a single household WITH a stored spouse-B benefit ────────────────────────────────────────
load(STORED); const st = figures();
if (POST) {
  T("B-1 spouse-B SS paid over the plan", st.ssB, 0);
  for (const k of ["draws", "end", "fed", "irmaa", "pp", "med", "d35need"])
    T(`B-2 ${k}: identical to the correct case`, st[k], OK[k]);
  T("B-3 D-2: the stored value is LEFT in the plan (not silently cleared)", G.PORTFOLIO().incomeSources.ssB.planned, 1300);
} else {
  // v5.75, pinned as dated known defects. Every error runs optimistic.
  T("B-1 [KNOWN DEFECT pre-v5.76] Withdrawal plan pays spouse B's SS to a single household", st.ssB, 308076);
  T("B-2 [KNOWN DEFECT pre-v5.76] spending draws understated by 301,146", st.draws, 767892);
  T("B-3 [KNOWN DEFECT pre-v5.76] ending portfolio overstated by 427,269", st.end, 1807137);
  T("B-4 [KNOWN DEFECT pre-v5.76] Taxes tab lifetime federal understated by 38,916 (via v5.74's bridge)", st.fed, 105390);
  T("B-5 [KNOWN DEFECT pre-v5.76] Monte Carlo planned path overstated by 62,007", st.pp, 2128443);
  T("B-6 [KNOWN DEFECT pre-v5.76] Monte Carlo seeded median overstated", st.med, 1948298);
  T("B-7 [KNOWN DEFECT pre-v5.76] 2035: 61,813 - 18,347 of phantom spouse-B SS", st.d35need, 43466);
}

// ── C · a single household's plan with NO spouse-B block (the natural shape) ────────────────────
load(NOBLOCK);
if (POST) {
  T("C-1 D-3: loads with spouse-B benefit 0, not the married placeholder", G.PORTFOLIO().incomeSources.ssB.planned, 0);
  T("C-2 and not flagged as example data (it is the correct value)", !!G.PORTFOLIO().incomeSources.ssB.isDefault, false);
  T("C-3 getSSB() is 0", G.getSSB(), 0);
  const nb = figures(); T("C-4 spouse-B SS paid", nb.ssB, 0); T("C-5 draws identical to the correct case", nb.draws, OK.draws);
} else {
  T("C-1 [KNOWN DEFECT pre-v5.76] the loader INVENTS a $1,300/mo spouse-B benefit", G.PORTFOLIO().incomeSources.ssB.planned, 1300);
  T("C-3 [KNOWN DEFECT pre-v5.76] getSSB() is 1300", G.getSSB(), 1300);
}

// ── D · the married example household is untouched by this release (the control) ───────────────
load(MARRIED); const mar = figures();
if (U630) {
  const want = Math.round(mar.ssBpaid.reduce((t, y) => t + G.getSSB() * 12 * K30(y), 0));
  T(`D-1 married (v6.30 units): spouse-B SS still paid — $${(G.getSSB() * 12).toLocaleString()}/yr × (1+i)^(y − as-of) over ${mar.ssBpaid[0]}–${mar.ssBpaid[mar.ssBpaid.length - 1]} = $${want.toLocaleString()} ($284,676 at v6.29)`,
    mar.ssB, want);
  { const tlm = G.PLAN_TIMELINE(), d1 = Math.min(tlm.dobA.year + tlm.lifeExpA, tlm.dobB.year + tlm.lifeExpB);
    T(`D-1b married: B's own check is paid every year from its claim year (${tlm.ssB_date.year}) to the year before the first death (${d1 - 1}), and only those`,
      mar.ssBpaid.length > 0 && mar.ssBpaid[0] === tlm.ssB_date.year && mar.ssBpaid[mar.ssBpaid.length - 1] === d1 - 1
      && mar.ssBpaid.every((y, k) => k === 0 || y === mar.ssBpaid[k - 1] + 1), true); }
  if (!SPEND17 && !TABLE620) T("D-2 married: draws (v6.30 — MEASURED, D-60: Engine D's clock from the as-of year; 1,567,766 at v6.21–v6.29)", mar.draws, 1703565);
  else console.log("  \u25cb SKIPPED (v6.30, measured exact of a pre-v6.30 build): D-2 draws");
  T(`D-3 married (v6.30 units): lifetime federal is the oracle's, Σ over Engine B's rows — $${mar.fedO.toLocaleString()}${!SPEND17 && !TABLE620 ? " ($288,603 on the example's table; $207,059 at v6.21–v6.29)" : ""}`,
    mar.fed, mar.fedO);
  if (!SPEND17 && !TABLE620) T("D-3b married: the oracle's figure on the example's table is $288,603 (t40 A5's, the same household and basis)", mar.fedO, 288603);
} else {
T("D-1 married: spouse-B SS still paid", mar.ssB, 284676);
T("D-2 married: draws" + (PIN18 ? P42(" (v6.18, D-41: the year-by-year read; 1,469,176 through v6.17)", " (v6.21, D-42: the car rows; 1,463,097 at v6.18–v6.20)") : ""), mar.draws, P41(1469176, P42(1463097, 1567766)));
// v6.07 (D-33): the married example carries spouse B's $7,000 annuity, which no RMD or conversion drains from v6.07 — lifetime federal
// $208,445 -> $208,000 (the same figure and basis as t40 A5's call-site pin). An array, so register_tag2 widens it each release.
T("D-3 married: lifetime federal" + (["v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER) ? (PIN18 ? P42(" (v6.18, D-41: $205,423; $208,000 at v6.07–v6.17)", " (v6.21, D-42: the car rows; $205,423 at v6.18–v6.20)") : " (D-33: −$445)") : ""), mar.fed, ["v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER) ? P41(208000, P42(205423, 207059)) : 208445);
// v6.20 (D-40, D-44, D-45): the Monte Carlo pays the Taxes tab's tax (its default schedule: $70K, BASE) and the example's April 2029
// one-time rows, inflated, so the 6-year planned path moves $2,128,443 → $2,083,910 (−$44,533). Re-pinned only with its attribution,
// step by step and each exact, in the same run: t83 R (the drag +$56,285, the quarter read −$375, the one-time rows −$34,995, the tax
// −$65,449). An array, so the registrar widens it.
}
const POST_D40 = ["v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634"].includes(VER);
if (U630) { if (!SPEND17 && !TABLE620) T("D-4 married: Monte Carlo planned path (v6.30 — MEASURED, D-60: the MC tax schedule is Engine B's today's-dollar tax; $2,083,910 at v6.20–v6.29)", mar.pp, 2084618);
  else console.log("  \u25cb SKIPPED (v6.30, measured exact of a pre-v6.30 build): D-4 planned path"); } else
T("D-4 married: Monte Carlo planned path" + (POST_D40 ? " (v6.20, D-40/44/45: $2,128,443 through v6.19; attributed in t83 R)" : ""), mar.pp, POST_D40 ? 2083910 : 2128443);
T("D-5 married: getSSB() returns the stored benefit", G.getSSB(), 1300);

// ── X · EXTINCTION: no single-household output depends on ANY stored spouse-B figure ──────────
// Defect class: any read of spouse B's benefit, anywhere, that skips the single test. The sweep varies
// the stored benefit AND its table, so a future unguarded read — through getSSB() or straight off the
// data — shows up here even if it is not one of today's 25 call sites.
if (POST) {
  const sweep = [0, 1300, 4000].map(v => { load(P => { P.single = true; P.incomeSources.ssB.planned = v;
    for (const k in P.incomeSources.ssB.tableByAge || {}) P.incomeSources.ssB.tableByAge[k] = v; }); return figures(); });
  for (const k of ["ssB", "draws", "end", "fed", "irmaa", "pp", "med"])
    T(`X-1 sweep ${k}: identical for stored spouse-B benefit 0 / 1,300 / 4,000`, (sweep[0][k] === sweep[1][k] && sweep[1][k] === sweep[2][k]) ? 1 : 0, 1);
  // D-2: switching the plan back to married restores the stored figure — it was never lost
  load(P => { P.single = false; }); T("X-2 D-2: back to married, the stored benefit is paid again", G.getSSB(), 1300);
}
Math.random = _realRandom;

// ── N · the on-screen note (D-2c), rendered ──────────────────────────────────────────────────────
// Mounted exactly as t37 boots (example data -> the main view), then the plan is replaced and the
// view re-rendered by switching tab. The note must appear for a single plan carrying a stored
// spouse-B figure, and must NOT appear for the married example or a single plan without one.
// A mutated module (argv[3]) has no DOM bundle of its own unless the controls pass one in T42_DOM.
if (POST && (!process.argv[3] || process.env.T42_DOM)) {
  const { window } = await import("./env_dom.mjs");
  window.storage = { async get(k) { throw new Error("none"); }, async set(k, v) { return { key: k, value: v }; },
                     async delete(k) { return { key: k, deleted: true }; }, async list() { return { keys: [] }; } };
  console.error = () => {}; console.warn = () => {};
  require(process.env.T42_DOM || `./dom_${VER}.cjs`); const React = require("react"); const W = window.__g;
  const body = () => window.document.body;
  const el = window.document.createElement("div"); body().appendChild(el);
  const { root, act, DangerClose } = window.__mount(el);
  const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
  const click = async (x) => { if (!x) return; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} };
  const tabBtn = (n) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === n);
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(example); await flush(); await flush();
  const NOTE = /is not used in any calculation/;
  // ⚠ The note reads PORTFOLIO (a module global) at render, so the view must genuinely re-render: click
  // a DIFFERENT tab and then another. Clicking the tab already showing changes no state, React skips
  // the render, and the previous note stays on screen — which is how N-4 first failed on a stale DOM.
  const rerender = async () => { await click(tabBtn("taxes")); await flush(); await click(tabBtn("dashboard")); await flush(); };
  const WB = JSON.parse(JSON.stringify(W.PORTFOLIO()));
  T("N-1 married example: no note", NOTE.test(body().textContent || ""), false);
  { const P = JSON.parse(JSON.stringify(WB)); P.single = true; W.applyLoadedData({ portfolio: P }); await rerender(); }
  T("N-2 single plan carrying a stored spouse-B figure: the note is shown", NOTE.test(body().textContent || ""), true);
  T("N-3 and it names the ignored figure", /\$1,300\/mo\) is not used/.test(body().textContent || ""), true);
  { const P = JSON.parse(JSON.stringify(WB)); P.single = true; delete P.incomeSources.ssB; W.applyLoadedData({ portfolio: P }); await rerender(); }
  T("N-4 single plan with no spouse-B block: no note (nothing is being ignored)", NOTE.test(body().textContent || ""), false);
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

console.log(`t42 SUITE (${VER}): ${pass} passed, ${fail} failed`);
if (fails.length) console.log(fails.join("\n"));
process.exit(fail ? 1 : 0);
