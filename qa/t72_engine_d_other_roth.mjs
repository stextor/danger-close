// t72 — A ROTH IRA ENTERED UNDER OTHER ACCOUNTS IS COUNTED ONCE IN ENGINE D, AS ROTH MONEY (v6.09, D-35)
// Run: node t72_engine_d_other_roth.mjs v609   |   node t72_engine_d_other_roth.mjs v608
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_D35_ENGINE_D_OTHER_ROTH_V609.md). Engine D — `computeWithdrawalPlan`, the Withdrawal tab, whose spending-
// draw and realized-gain series Engines A, B and C also read — holds every Other account in its Priority-1 pool. Through v6.08 a Roth IRA there
// (`taxType: "roth"`) was counted TWICE:
//   · in the pool's gains-bearing part (`_gainPoolInit` took out ordinary and HSA money, not Roth), so its growth was booked as capital gain when
//     spent — wrong in law: a qualified Roth distribution is not income at all (26 U.S.C. §408A(d)(1));
//   · in the buckets' Roth share (`rothFrac = _rothInit / _t401kInit`, `_rothInit` including Other-account Roth), so the buckets' Traditional share
//     and every bucket RMD were understated.
// From v6.09 the Roth money sits in the pool's tax-free remainder and the buckets' Roth share is the holdings' Roth only.
//
// GATED PER LEG (OPERATIONS §B2). The v6.08 leg pins the defect ([KNOWN DEFECT]); the v6.09 leg asserts the fix.
// THE STRONGEST STATEMENT (§A): a Roth IRA under Other accounts and the SAME money entered as brokerage sit in the same pool and differ only in tax
// character, so on v6.09 their bucket side and pool balance must be identical year by year — and the Roth one must realize no gain on itself.
// INDEPENDENCE (§C): t71's oracle (own divisors and start ages; the engine's mechanical series only), extended to hold Roth money out of the gains
// part and out of the buckets' Roth share, with the Other-account Roth total summed from the portfolio ROWS, never read from the app.
import { createRequire } from "module";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v609";
const KNOWN_VERSIONS = ["v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631"].includes(VER);   // an array, so register_tag2 widens it each release
const { __g: g, __engines: E } = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
// v6.18 (D-41): Engine D reads the expense table year by year, which moved two §A/§B figures (a lifetime RMD and a realized gain). PIN18 picks the v6.18 figures (measured at the build);
// the v6.18 leg is ALSO run with DC_V617_SPENDING=1 — each plan loaded with v6.17's spending as a table (qa/tools/v617_spending.mjs, split
// at that plan's own Medicare year) — where every v6.17 figure must still come out exactly: the attribution of each move to the read.
const POST_D41 = ["v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631"].includes(VER);   // an array, so the registrar widens it
const SPEND17 = POST_D41 && process.env.DC_V617_SPENDING === "1";
const PIN18 = POST_D41 && !SPEND17;
const P41 = (v617, v618) => PIN18 ? v618 : v617;
// v6.21 (D-42): the example's table carries four $40,000 car rows from 2037, which Engine D now spends, so every example figure here that
// rides on its draws after 2036 moved. PIN21 picks the v6.21 figures (measured at the build). The v6.21 leg is ALSO run with
// DC_V620_TABLE=1 — the example's table without its car rows, which is v6.20's — and there every v6.20 figure must come out exactly: that
// second run attributes each move to the rows alone (runsuite.sh, "<suite>-<cur>-table620"; t84 C proves v6.21 on that table IS v6.20).
const POST_D42 = ["v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631"].includes(VER);   // an array, so the registrar widens it
const TABLE620 = POST_D42 && process.env.DC_V620_TABLE === "1";
const PIN21 = POST_D42 && !TABLE620;
const P42 = (v620, v621) => PIN21 ? v621 : v620;
const { v617Table } = await import(pathToFileURL(join(HERE, "tools", "v617_spending.mjs")).href);
if (SPEND17) console.log("  (DC_V617_SPENDING=1 — v6.17's spending, as a table: every v6.17 figure must come out exactly)");
if (TABLE620) console.log("  (DC_V620_TABLE=1 — v6.20's table, the car rows removed: every v6.20 figure must come out exactly)");
const EX0 = JSON.parse(JSON.stringify(g.EXPENSES())).filter(e => !(TABLE620 && e && e.label === "Replacement car"));   // v6.21: TABLE620 → v6.20's table

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const usd = n => "$" + Math.round(n).toLocaleString();
const clone = o => JSON.parse(JSON.stringify(o));
const sum = (rows, k) => rows.reduce((s, r) => s + (r[k] || 0), 0);
console.log(`t72 — ENGINE D AND A ROTH IRA UNDER OTHER ACCOUNTS (${VER})\n`);

// ── fixtures (household / total401k / bucketActuals re-derived the way My Data derives them) ─────────────────────────────────────
const BASE = clone(g.PORTFOLIO());
const consistent = p => { const t = (p.positions || []).reduce((s, r) => s + (r.balance || 0), 0), o = (p.otherAccounts || []).reduce((s, a) => s + (a.balance || 0), 0);
  const bs = { 1: 0, 2: 0, 3: 0, 4: 0 }; (p.positions || []).forEach(r => { if (r.bucket >= 1 && r.bucket <= 4) bs[r.bucket] += r.balance || 0; });
  return { ...p, total401k: t, household: t + o, bucketActuals: t > 0 ? { 1: bs[1] / t, 2: bs[2] / t, 3: bs[3] / t, 4: bs[4] / t } : p.bucketActuals }; };
const add = (accts, p = BASE) => consistent({ ...p, otherAccounts: [...p.otherAccounts, ...accts] });
const scale = f => BASE.positions.map(p => ({ ...p, balance: p.balance * f, trad: (p.trad || 0) * f, roth: (p.roth || 0) * f }));
const F = {
  EXAMPLE: BASE,
  EX_ROTH200: add([{ name: "Roth IRA (A)", balance: 200000, owner: "A", taxType: "roth" }]),
  EX_BROK200: add([{ name: "Brokerage X", balance: 200000, owner: "JT", taxType: "taxable" }]),   // the Roth fixture's twin
  EX_ROTH500: add([{ name: "Roth IRA (A)", balance: 300000, owner: "A", taxType: "roth" }, { name: "Roth IRA (B)", balance: 200000, owner: "B", taxType: "roth" }]),
  SINGLE_ROTH: { ...add([{ name: "Roth IRA (A)", balance: 200000, owner: "A", taxType: "roth" }]), single: true },
  ROTH_ONLY: consistent({ ...BASE, positions: scale(0.4), otherAccounts: [{ name: "Roth IRA (A)", balance: 400000, owner: "A", taxType: "roth" }] }),
  NAMED_IRA: consistent({ ...BASE, positions: scale(0.2), otherAccounts: [{ name: "Cash", balance: 60000, owner: "JT", taxType: "taxable" },
    { name: "Rollover IRA", balance: 700000, owner: "A", taxType: "trad", planType: "ira" }] }),                                  // no Roth: must not move
  SINGLE: { ...BASE, single: true },
};
const load = p => { g.applyLoadedData({ portfolio: clone(p), expenses: clone(EX0) });
  if (SPEND17) g.applyLoadedData({ portfolio: clone(p), expenses: v617Table(g, EX0) }); return g.buildPlanTimeline(); };
const plan = (p, amt) => { const tl = load(p); return { tl, W: g.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: amt, scenarioPreset: "base" }), P: g.PORTFOLIO(), rsb: g.retireStartBalances(tl.targetRetireYear) }; };

// ── the oracle (t71's, v6.08 tracker rules on both legs; `rules` decides only how the Roth money is held) ────────────────────────
const DIV = { 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8,
  85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0 };   // IRS Pub 590-B, Uniform Lifetime Table
const dv = age => DIV[Math.min(120, age)];
const startAge = by => by <= 1950 ? 72 : by <= 1959 ? 73 : 75;            // SECURE 2.0 §107
// v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): Engine D carries today's balances to the retirement year at the plan's inflation (DU-7
// (a)) and leaves the cost basis nominal; the oracle seeds the same way, × RB = (1+i)^(retire − as-of), i the base preset's inflation (Σ prob
// × inflation over this module's SCENARIOS table), never the engine's helper; 1 on every earlier leg. An array, so register_tag2 widens it.
const U630 = ["v630", "v631"].includes(VER);
const RBof = W => U630 ? Math.pow(1 + Object.values(g.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0), W._tlW.targetRetireYear - W._tlW.asOfYear) : 1;
function oracle({ W, P, rsb }, amt, rules) {
  const R609 = rules === "v609";
  const dobA = W._dobAYr, dobB = W._tlW.dobB.year, single = !!W._tlW.single, rA = startAge(dobA), rB = startAge(dobB), gr = W.growth.tax;
  const oth = P.otherAccounts || [], bal = f => oth.filter(f).reduce((s, a) => s + (a.balance || 0), 0);
  const roth = bal(a => a.taxType === "roth");                                  // from the ROWS, not from the app
  const taxInit = Math.max(0, (P.household || 0) - (P.total401k || 0));
  const ordInit = bal(a => a.taxType === "trad" || a.taxType === "annuity"), hsaInit = bal(a => a.taxType === "hsa");
  const shareOpen = (P.taxableGainPct != null ? P.taxableGainPct : 40) / 100;
  const RB = RBof(W);   // v6.30: the carry to retirement (1 before)
  let T = taxInit * RB, taxOrd = Math.min(ordInit, taxInit) * RB;
  let tA = bal(a => a.taxType === "trad" && a.owner !== "B") * RB, tB = bal(a => a.taxType === "trad" && a.owner === "B") * RB;
  const gp0 = Math.max(0, Math.min(taxInit, Math.max(0, taxInit - ordInit - hsaInit - (R609 ? roth : 0))));
  let gp = gp0 * RB, basis = Math.max(0, gp0 * (1 - shareOpen));   // the basis is nominal: opened on today's money, never carried
  const fracB = rsb.posTrad > 0 ? rsb.posTradB / rsb.posTrad : 0;
  const b0 = [1, 2, 3, 4].map(i => P.bucketActuals[i] * P.total401k * RB), bsum0 = b0[0] + b0[1] + b0[2] + b0[3], bsumU = bsum0 / RB;
  let tradBoy = bsum0 * (bsumU > 0 ? rsb.posTrad / bsumU : 0), rothBoy = bsum0 * (bsumU > 0 ? (rsb.rothInit - (R609 ? roth : 0)) / bsumU : 0), bsumBoy = bsum0;
  const out = [];
  for (const R of W.schedule) {
    const ageA = R.yr - dobA, ageB = R.yr - dobB, tradFracBoy = bsumBoy > 0 ? tradBoy / bsumBoy : 0;
    const baseA = tradBoy * (1 - fracB) + tA, baseB = tradBoy * fracB + tB;
    const onA = ageA >= rA && baseA > 0, onB = !single && ageB >= rB && baseB > 0;
    const rmdBk = (onA ? tradBoy * (1 - fracB) / dv(ageA) : 0) + (onB ? tradBoy * fracB / dv(ageB) : 0);
    const sRA = onA ? tA / dv(ageA) : 0, sRB = onB ? tB / dv(ageB) : 0, rmdS = sRA + sRB, rmd = rmdBk + rmdS;
    const bkRmdTaken = Math.min(rmdBk, bsumBoy), bkDraw = R.drawFromB1 + R.drawFromB2 + R.drawFromB3 + R.drawFromB4, spendBk = bkDraw - bkRmdTaken;
    const T_boy = T, sleeve = Math.min(Math.max(0, rmdS), T_boy), spend = R.drawFromTaxable - sleeve, post = Math.max(0, T_boy - sleeve);
    const ordFrac = post > 0 ? Math.min(1, Math.max(0, taxOrd - sleeve) / post) : 0, othOrd = Math.max(0, spend) * ordFrac;
    const gShare = post > 0 ? Math.min(1, gp / post) : 0, sale = Math.max(0, spend) * gShare, bFrac = gp > 0 ? Math.min(1, basis / gp) : 1;
    const gain = Math.max(0, sale * (1 - bFrac));
    basis = Math.max(0, basis - sale * bFrac); gp = Math.max(0, gp - sale);
    taxOrd = Math.max(0, taxOrd - othOrd - sleeve);
    { const k = rmdS > 0 ? sleeve / rmdS : 0; tA = Math.max(0, tA - sRA * k); tB = Math.max(0, tB - sRB * k);
      const sh = post > 0 ? Math.max(0, spend) / post : 0; tA = Math.max(0, tA - tA * sh); tB = Math.max(0, tB - tB * sh); }
    const on = R.yr <= W._ladderEnd;
    const capB = Math.max(0, tradBoy - bkRmdTaken - spendBk * tradFracBoy), capS = Math.max(0, tA + tB);
    const cB = on ? Math.min(amt, capB) : 0, cS = on ? Math.min(amt - cB, capS) : 0;
    if (cS > 0) { const cA = tA / (tA + tB); tA = Math.max(0, tA - cS * cA); tB = Math.max(0, tB - cS * (1 - cA)); taxOrd = Math.max(0, taxOrd - cS); }
    const rothFracBoy = bsumBoy > 0 ? rothBoy / bsumBoy : 0;
    const tAmt = Math.max(0, tradBoy - bkRmdTaken - spendBk * tradFracBoy - cB), rAmt = Math.max(0, rothBoy - spendBk * rothFracBoy + cB);
    const bsumPost = bsumBoy - bkDraw, fracNew = bsumPost > 0 ? (tAmt + rAmt > 0 ? tAmt / (tAmt + rAmt) : 0) : tradFracBoy;
    const tradEoy = (R.b1 + R.b2 + R.b3 + R.b4) * fracNew;
    T = T_boy - R.drawFromTaxable;
    const u = Math.max(0, R.taxable / (1 + gr) - T); T += u; gp += u; basis += u;
    T *= (1 + gr); gp = Math.min(T, gp * (1 + gr)); taxOrd = Math.min(T - gp, taxOrd * (1 + gr));
    { const gR = (tA + tB) * (1 + gr), kG = gR > taxOrd && gR > 0 ? Math.max(0, taxOrd) / gR : 1; tA *= (1 + gr) * kG; tB *= (1 + gr) * kG; }
    out.push({ yr: R.yr, rmd, conv: cB + cS, T, othOrd, tradEoy, gain, gp });
    tradBoy = R.tradNotional; rothBoy = R.rothNotional; bsumBoy = R.b1 + R.b2 + R.b3 + R.b4;
  }
  return out;
}
const gap = (W, O) => W.schedule.reduce((m, R, i) => Math.max(m, Math.abs(R.conv_y - O[i].conv), Math.abs(R.rmd_y - O[i].rmd), Math.abs(R.taxable - O[i].T),
  Math.abs(R.othOrdDraw - O[i].othOrd), Math.abs(R.tradNotional - O[i].tradEoy), Math.abs((R.capGain_y || 0) - O[i].gain), Math.abs(R.taxGainPool - O[i].gp)), 0);
const RULES = POST ? "v609" : "v608", OTHER = POST ? "v608" : "v609";

// ── §A · THE EQUIVALENCE: a Roth IRA and the same money as brokerage — the same pool, a different tax character only ──────────────
for (const amt of [0, 70000]) {
  const r = plan(F.EX_ROTH200, amt).W.schedule, b = plan(F.EX_BROK200, amt).W.schedule;
  const bucketDiff = r.filter((x, i) => ["b1", "b2", "b3", "b4", "tradNotional", "rothNotional", "rmd_y"].some(k => Math.abs(x[k] - b[i][k]) > 0.005)).length;
  T(POST ? `A-1@${amt / 1000}K: a $200,000 Roth IRA under Other accounts and the same money as brokerage — identical buckets, Traditional share and RMD, every year`
         : `A-1@${amt / 1000}K [KNOWN DEFECT D-35]: the Roth IRA's buckets differ from its brokerage twin's — it is counted in the buckets' Roth share too`,
    POST ? bucketDiff === 0 : bucketDiff > 0, `${bucketDiff} years differ; lifetime RMD ${usd(sum(r, "rmd_y"))} vs ${usd(sum(b, "rmd_y"))}`);
  if (POST) T(`A-2@${amt / 1000}K: …and an identical pool balance and ordinary draw, every year (the money is the same; only its character differs)`,
    r.every((x, i) => Math.abs(x.taxable - b[i].taxable) < 0.005 && Math.abs(x.othOrdDraw - b[i].othOrdDraw) < 0.005));
}
{
  const _p3 = plan(F.EX_ROTH200, 70000), r = _p3.W.schedule;
  if (U630) T("A-3 (v6.30): the Roth fixture's lifetime RMD at $70,000 is the validated oracle's ($541,480 on the example's table) — its brokerage twin's (A-1)",
    Math.abs(sum(r, "rmd_y") - sum(oracle(_p3, 70000, RULES), "rmd")) < 0.01 && (SPEND17 || TABLE620 || Math.round(sum(r, "rmd_y")) === 541480), usd(sum(r, "rmd_y")));
  else
  T(POST ? `A-3: the Roth fixture's lifetime RMD is EXACTLY ${P41("$470,488", P42("$479,123 (v6.18, D-41; $470,488 at v6.09–v6.17)", "$449,041 (v6.21, D-42: the car rows; $479,123 at v6.18–v6.20)"))} at $70,000 — its brokerage twin's`
         : "A-3 [KNOWN DEFECT D-35]: the Roth fixture's lifetime RMD is $343,192 at $70,000 — understated against its brokerage twin's $470,488",
    Math.round(sum(r, "rmd_y")) === (POST ? P41(470488, P42(479123, 449041)) : 343192), usd(sum(r, "rmd_y")));
}

// ── §B · no capital gain on Roth money ─────────────────────────────────────────────────────────────────────────────────────────
{
  const o = plan(F.ROTH_ONLY, 70000).W.schedule;
  T(POST ? "B-1: a pool that is all Roth IRA realizes $0 of capital gain in every year, and its gains-bearing part is $0 throughout"
         : "B-1 [KNOWN DEFECT D-35]: a pool that is all Roth IRA realizes capital gain — its growth is booked as gain when spent",
    POST ? o.every(x => (x.capGain_y || 0) === 0 && x.taxGainPool === 0) : sum(o, "capGain_y") > 1000, `lifetime gain ${usd(sum(o, "capGain_y"))}`);
  const _p5 = plan(F.EX_ROTH500, 70000), r5 = _p5.W.schedule;
  if (U630) T("B-2 (v6.30): $500,000 of Roth IRAs at $70,000 — lifetime realized gain is the validated oracle's ($7,424 on the example's table), the example's own brokerage only",
    Math.abs(sum(r5, "capGain_y") - sum(oracle(_p5, 70000, RULES), "gain")) < 0.01 && (SPEND17 || TABLE620 || Math.round(sum(r5, "capGain_y")) === 7424), usd(sum(r5, "capGain_y")));
  else
  T(POST ? `B-2: $500,000 of Roth IRAs at $70,000 — lifetime realized gain ${P41("$4,909", P42("$3,249 (v6.18, D-41; $4,909 at v6.09–v6.17)", "$6,195 (v6.21, D-42: the car rows; $3,249 at v6.18–v6.20)"))}, the example's own brokerage only`
         : "B-2 [KNOWN DEFECT D-35]: $500,000 of Roth IRAs at $70,000 — lifetime realized gain $196,853, nearly all of it on Roth money",
    Math.round(sum(r5, "capGain_y")) === (POST ? P41(4909, P42(3249, 6195)) : 196853), usd(sum(r5, "capGain_y")));
}

// ── §C · THE ORACLE: each leg reproduced to the cent under its own rules, and missed under the other's ─────────────────────────────
for (const [name, amt] of [["EX_ROTH200", 0], ["EX_ROTH200", 70000], ["EX_ROTH500", 70000], ["EX_ROTH500", 200000], ["SINGLE_ROTH", 70000], ["ROTH_ONLY", 70000],
                           ["EX_BROK200", 70000], ["NAMED_IRA", 70000]]) {
  const run = plan(F[name], amt), w = gap(run.W, oracle(run, amt, RULES));
  T(`C-${name}@${amt / 1000}K: the ${RULES} oracle reproduces RMD, conversion, pool, ordinary draw, the buckets' Traditional share, the gain and the gains part — to the cent, every year`,
    w < 0.01, `worst |Δ| ${w.toFixed(6)}`);
}
{
  const disc = ["EX_ROTH200", "EX_ROTH500"].map(name => { const run = plan(F[name], 70000); return gap(run.W, oracle(run, 70000, OTHER)); });
  T(`C-X: DISCRIMINATION — the ${OTHER} oracle misses this leg by more than $1,000 in some year on both Roth fixtures`, disc.every(x => x > 1000), disc.map(usd).join(", "));
}

// ── §D · cross-leg invariance (v6.09 run beside v6.08): no Roth IRA under Other accounts, no movement ──────────────────────────────
const PRIOR = join(HERE, "app_v608.mjs");
if (POST && existsSync(PRIOR)) {
  const M0 = await import(pathToFileURL(PRIOR).href);
  const strat = (G, p, amt) => { G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline(), retireYear = tl.targetRetireYear;
    const rsb = G.retireStartBalances(retireYear); delete rsb.othRoth;   // v6.09's new field; Engine A does not read it
    return G.runRothStrategies({ single: !!tl.single, asOfYr: tl.asOfYear, retireYr: retireYear,
      horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
      deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
      pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: G.PORTFOLIO().stateCode || null,
      convTaxFunding: "taxable", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, ...rsb,
      ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
      survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
      taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: amt,
      ordDrawByYr: G.withdrawalPlanSeries({ retireYear, rothAmount: amt, scenarioPreset: "base" }).ordDrawByYr }); };
  const engines = (M, p, amt) => { const G = M.__g, EE = M.__engines; G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline(), retireYear = tl.targetRetireYear;
    const A = { retireYear, rothAmount: amt, qcdAnnual: 0, taxYield: 2.0 }, S = G.withdrawalPlanSeries({ retireYear, rothAmount: amt, scenarioPreset: "base" });
    return { D: G.computeWithdrawalPlan({ retireYear, rothAmount: amt, scenarioPreset: "base" }).schedule,
             B: EE.computeTaxPlan({ ...A, ...S }).rows, C: EE.computeIrmaaPlan({ ...A, ...S }).rows, A: strat(G, p, amt) }; };
  for (const [name, amt] of [["EXAMPLE", 0], ["EXAMPLE", 70000], ["SINGLE", 70000], ["EX_BROK200", 70000], ["NAMED_IRA", 70000]]) {
    const a = engines(M0, F[name], amt), b = engines({ __g: g, __engines: E }, F[name], amt);
    T(`D-${name}@${amt / 1000}K: Engine D's schedule is bit-identical to v6.08`, JSON.stringify(a.D) === JSON.stringify(b.D));
    T(`D-${name}@${amt / 1000}K: the Taxes and IRMAA tabs' engines and the Roth tab's strategies are bit-identical to v6.08`,
      JSON.stringify([a.B, a.C, a.A]) === JSON.stringify([b.B, b.C, b.A]));
  }
} else if (POST) {
  console.log("  (§D skipped: app_v608.mjs not in this run folder — the differential needs the prior leg)");
}

// ── §E · the Withdrawal tab: each dollar shown once, where the engine holds it ──────────────────────────────────────────────────
{
  const require = createRequire(import.meta.url);
  require(`./dom_${VER}.cjs`);
  const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
  const React = require("react");
  const flush = async () => { await act(async () => { await new Promise(res => setTimeout(res, 30)); }); };
  const body = () => window.document.body;
  const click = async el => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
  const gotoTab = async (name) => { const t = [...body().querySelectorAll("button,div,span")].find(el => (el.textContent || "").trim().toLowerCase() === name);
    if (t) { await click(t); await flush(); await flush(); } return !!t; };
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const ex = [...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  await click(ex); await flush(); await flush();
  const onTab = await gotoTab("withdrawal");
  const txt0 = body().textContent || "";
  const SENT = /A Roth IRA you entered under Other accounts sits here too: it is spent tax-free and carries no RMD, and it is counted here only, not again in the Roth line below\./;
  // v6.28 (F-23, V-9): the Traditional and Roth cards became one holdings card; its Roth figure is the same expression (_rothInit − _rothOth)
  const card = t => { const m = t.match(/After-tax retirement accounts\. Starting balance: \$([\d,]+)K/) || t.match(/Starting Traditional: \$[\d,]+K; Roth: \$([\d,]+)K/); return m ? +m[1].replace(/,/g, "") : null; };
  T("E-0: PRECONDITION — the Withdrawal tab renders the Roth card", onTab && card(txt0) !== null, `card ${card(txt0)}`);
  T(POST ? "E-1: the Priority-1 card says a Roth IRA under Other accounts is spent tax-free with no RMD, and counted there only"
         : "E-1 (prior leg): the Priority-1 card carries no such sentence", POST ? SENT.test(txt0) : !SENT.test(txt0));
  // applyLoadedData takes a WRAPPER and does not re-render, so park off the target tab first (t16's §C pattern).
  await gotoTab("taxes");
  await act(async () => { window.__test.applyLoadedData({ portfolio: clone(F.EX_ROTH200) }); });
  await flush(); await flush(); await gotoTab("withdrawal");
  const c1 = card(body().textContent || "");
  T(POST ? "E-2: with a $200,000 Roth IRA under Other accounts, the Roth card shows the holdings' Roth money only — $315K"
         : "E-2 [KNOWN DEFECT D-35]: with a $200,000 Roth IRA under Other accounts, the Roth card counts it again — $515K",
    c1 === (POST ? 315 : 515), `$${c1}K`);
  root.unmount();
}

console.log(`\nt72 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
