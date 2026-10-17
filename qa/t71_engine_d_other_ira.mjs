// t71 — ENGINE D CONVERTS AN OTHER-ACCOUNTS TRADITIONAL IRA, AND CARRIES IT CORRECTLY (v6.08, D-34)
// Run: node t71_engine_d_other_ira.mjs v608   |   node t71_engine_d_other_ira.mjs v607
//
// THE DEFECTS THIS EXISTS FOR (docs/SCOPE_D34_ENGINE_D_OTHER_IRA_V608.md). Engine D — `computeWithdrawalPlan`, the Withdrawal tab, whose
// spending-draw series Engines A, B and C also read — holds a Traditional IRA entered under Other accounts in its Priority-1 pool, tracked
// by `taxOrd` (ordinary money) and `taxRmdA`/`taxRmdB` (the RMD-bearing part). Through v6.07:
//   · its Roth conversion was `min(slider, tradNotional_boy − rmd_y)`, figured BEFORE the draws: the cap subtracted that IRA's RMD from
//     bucket money, ignored the year's bucket spending draw (so where the slider outran the buckets it converted money already spent), and
//     the IRA itself was NEVER converted, though Engines B and C convert it;
//   · the IRA's RMD tracker had no growth site, so its RMD was figured on the opening balance less withdrawals — never on the account's
//     prior year-end balance (Treas. Reg. §1.408-8(b)(2)) — and its own RMD left it pro rata across the whole pool instead of whole.
// From v6.08 the conversion is figured after the draws, bucket money first and then the IRA (never annuity money); the tracker grows
// inside the ordinary sub-pool and the RMD leaves it as identified dollars.
//
// GATED PER LEG (OPERATIONS §B2). The v6.07 leg pins the defects ([KNOWN DEFECT]); the v6.08 leg asserts the fix.
// INDEPENDENCE (§B): an oracle re-implements the pool's trackers, the RMD and the conversion year by year with its OWN Uniform Lifetime
// divisors (Pub 590-B) and SECURE 2.0 start ages, in BOTH rule sets. It takes from the engine only the mechanical series — the bucket and
// pool draws and the published end-of-year balances — and must reproduce the engine to the cent under the leg's own rules, and FAIL to
// under the other leg's rules (so the fixtures exercise the change). The seeds are the portfolio rows and `retireStartBalances`' primitives.
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
const VER = process.argv[2] || "v608";
const KNOWN_VERSIONS = ["v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617"].includes(VER);   // an array, so register_tag2 widens it each release
const { __g: g, __engines: E } = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const usd = n => "$" + Math.round(n).toLocaleString();
const clone = o => JSON.parse(JSON.stringify(o));
const sum = (rows, k) => rows.reduce((s, r) => s + (r[k] || 0), 0);
console.log(`t71 — ENGINE D AND AN OTHER-ACCOUNTS TRADITIONAL IRA (${VER})\n`);

// ── fixtures ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// `household`, `total401k` and `bucketActuals` are re-derived the way My Data derives them (holdings + Other accounts), or Engine D would
// read a pool that does not match the rows. NO_PRETAX zeroes planned pre-tax contributions, which otherwise accrue Traditional money.
const BASE = clone(g.PORTFOLIO());
const consistent = p => { const t = (p.positions || []).reduce((s, r) => s + (r.balance || 0), 0), o = (p.otherAccounts || []).reduce((s, a) => s + (a.balance || 0), 0);
  const bs = { 1: 0, 2: 0, 3: 0, 4: 0 }; (p.positions || []).forEach(r => { if (r.bucket >= 1 && r.bucket <= 4) bs[r.bucket] += r.balance || 0; });
  return { ...p, total401k: t, household: t + o, bucketActuals: t > 0 ? { 1: bs[1] / t, 2: bs[2] / t, 3: bs[3] / t, 4: bs[4] / t } : p.bucketActuals }; };
const NO_PRETAX = p => ({ ...p, contributions: { ...p.contributions, monthly401k: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribPreTaxB: 0 } });
const scale = f => BASE.positions.map(p => ({ ...p, balance: p.balance * f, trad: (p.trad || 0) * f, roth: (p.roth || 0) * f }));
const F = {
  EXAMPLE: BASE,                                                        // $104,000 of Other-account IRA, spent before RMD age
  NAMED_IRA: consistent(NO_PRETAX({ ...BASE, positions: [               // a $900,000 rollover IRA; $150,000 of holdings
    { ticker: "VMFXX", owner: "A", name: "MM", balance: 100000, bucket: 1, type: "cash", roth: 100000, trad: 0, er: 0.1, planType: "ira" },
    { ticker: "BND", owner: "A", name: "Bond", balance: 50000, bucket: 2, type: "bond", roth: 0, trad: 50000, er: 0.03, planType: "ira" }],
    otherAccounts: [{ name: "Cash", balance: 300000, owner: "JT", taxType: "taxable" },
                    { name: "Rollover IRA", balance: 900000, owner: "A", taxType: "trad", planType: "ira" }] })),
  MIXED: consistent(NO_PRETAX({ ...BASE, positions: scale(0.2), otherAccounts: [   // both spouses' IRAs, an annuity, little cash
    { name: "Cash", balance: 40000, owner: "JT", taxType: "taxable" },
    { name: "Rollover IRA A", balance: 700000, owner: "A", taxType: "trad", planType: "ira" },
    { name: "IRA B", balance: 200000, owner: "B", taxType: "trad", planType: "ira" },
    { name: "Annuity B", balance: 100000, owner: "B", taxType: "annuity" }] })),
  ANN_ONLY: consistent(NO_PRETAX({ ...BASE, positions: scale(0.2), otherAccounts: [   // the pool's pre-tax money is ALL annuity
    { name: "Cash", balance: 40000, owner: "JT", taxType: "taxable" },
    { name: "Contract A", balance: 900000, owner: "A", taxType: "annuity" }] })),
  NO_OTHER_TRAD: consistent({ ...BASE, otherAccounts: BASE.otherAccounts.filter(a => a.taxType !== "trad") }),
  SINGLE: { ...BASE, single: true },
};
const load = p => { g.applyLoadedData({ portfolio: clone(p) }); return g.buildPlanTimeline(); };
const plan = (p, amt) => { const tl = load(p); return { tl, W: g.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: amt, scenarioPreset: "base" }), P: g.PORTFOLIO(), rsb: g.retireStartBalances(tl.targetRetireYear) }; };

// ── the oracle ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const DIV = { 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8,
  85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0 };   // IRS Pub 590-B, Uniform Lifetime Table (Appendix B, Table III)
const dv = age => DIV[Math.min(120, age)];
const startAge = by => by <= 1950 ? 72 : by <= 1959 ? 73 : 75;            // SECURE 2.0 §107
function oracle({ W, P, rsb }, amt, rules) {
  const R608 = rules === "v608";
  const dobA = W._dobAYr, dobB = W._tlW.dobB.year, single = !!W._tlW.single, rA = startAge(dobA), rB = startAge(dobB), gr = W.growth.tax;
  const oth = P.otherAccounts || [], bal = f => oth.filter(f).reduce((s, a) => s + (a.balance || 0), 0);
  const taxInit = Math.max(0, (P.household || 0) - (P.total401k || 0));
  const ordInit = bal(a => a.taxType === "trad" || a.taxType === "annuity"), hsaInit = bal(a => a.taxType === "hsa");
  const shareOpen = (P.taxableGainPct != null ? P.taxableGainPct : 40) / 100;
  let T = taxInit, taxOrd = Math.min(ordInit, taxInit);
  let tA = bal(a => a.taxType === "trad" && a.owner !== "B"), tB = bal(a => a.taxType === "trad" && a.owner === "B");   // "B or else A"
  let gp = Math.max(0, Math.min(taxInit, Math.max(0, taxInit - ordInit - hsaInit))), basis = Math.max(0, gp * (1 - shareOpen));
  const fracB = rsb.posTrad > 0 ? rsb.posTradB / rsb.posTrad : 0;
  const b0 = [1, 2, 3, 4].map(i => P.bucketActuals[i] * P.total401k), bsum0 = b0[0] + b0[1] + b0[2] + b0[3];
  let tradBoy = bsum0 * (bsum0 > 0 ? rsb.posTrad / bsum0 : 0), rothBoy = bsum0 * (bsum0 > 0 ? rsb.rothInit / bsum0 : 0), bsumBoy = bsum0;
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
    basis = Math.max(0, basis - sale * bFrac); gp = Math.max(0, gp - sale);
    taxOrd = Math.max(0, taxOrd - othOrd - sleeve);
    if (R608) {
      const k = rmdS > 0 ? sleeve / rmdS : 0; tA = Math.max(0, tA - sRA * k); tB = Math.max(0, tB - sRB * k);
      const sh = post > 0 ? Math.max(0, spend) / post : 0; tA = Math.max(0, tA - tA * sh); tB = Math.max(0, tB - tB * sh);
    } else {
      const sh = T_boy > 0 ? R.drawFromTaxable / T_boy : 0; tA = Math.max(0, tA - tA * sh); tB = Math.max(0, tB - tB * sh);
    }
    const on = R.yr <= W._ladderEnd;
    let capB, capS, cB, cS;
    if (R608) {
      capB = Math.max(0, tradBoy - bkRmdTaken - spendBk * tradFracBoy); capS = Math.max(0, tA + tB);
      cB = on ? Math.min(amt, capB) : 0; cS = on ? Math.min(amt - cB, capS) : 0;
      if (cS > 0) { const cA = tA / (tA + tB); tA = Math.max(0, tA - cS * cA); tB = Math.max(0, tB - cS * (1 - cA)); taxOrd = Math.max(0, taxOrd - cS); }
    } else { capB = Math.max(0, tradBoy - rmd); capS = 0; cB = on ? Math.min(amt, capB) : 0; cS = 0; }
    // the buckets' Traditional share after the year: only the BUCKET part of the conversion moves it (v6.08; on v6.07 that was all of it)
    const rothFracBoy = bsumBoy > 0 ? rothBoy / bsumBoy : 0, conv = cB + cS;
    const tAmt = Math.max(0, tradBoy - bkRmdTaken - spendBk * tradFracBoy - cB), rAmt = Math.max(0, rothBoy - spendBk * rothFracBoy + cB);
    const bsumPost = bsumBoy - bkDraw, fracNew = bsumPost > 0 ? (tAmt + rAmt > 0 ? tAmt / (tAmt + rAmt) : 0) : tradFracBoy;
    const tradEoy = (R.b1 + R.b2 + R.b3 + R.b4) * fracNew;
    T = T_boy - R.drawFromTaxable;
    const u = Math.max(0, R.taxable / (1 + gr) - T); T += u; gp += u; basis += u;
    T *= (1 + gr); gp = Math.min(T, gp * (1 + gr)); taxOrd = Math.min(T - gp, taxOrd * (1 + gr));
    if (R608) { const gR = (tA + tB) * (1 + gr), kG = gR > taxOrd && gR > 0 ? Math.max(0, taxOrd) / gR : 1; tA *= (1 + gr) * kG; tB *= (1 + gr) * kG; }
    out.push({ yr: R.yr, rmd, rmdS, rmdBk, conv, cB, cS, capB, capS, T, taxOrd, tIra: tA + tB, on, tradBoy, othOrd, tradEoy });
    tradBoy = R.tradNotional; rothBoy = R.rothNotional; bsumBoy = R.b1 + R.b2 + R.b3 + R.b4;
  }
  return out;
}
// worst per-year gap between the oracle and the engine on the fields both rule sets define (and, on v6.08, the IRA's own parts)
const gap = (W, O, withParts) => W.schedule.reduce((m, R, i) => Math.max(m, Math.abs(R.conv_y - O[i].conv), Math.abs(R.rmd_y - O[i].rmd),
  Math.abs(R.taxable - O[i].T), Math.abs(R.othOrdDraw - O[i].othOrd), Math.abs(R.tradNotional - O[i].tradEoy), withParts ? Math.abs((R.convSleeve_y || 0) - O[i].cS) : 0, withParts ? Math.abs((R.rmdSleeve_y || 0) - O[i].rmdS) : 0), 0);
const RULES = POST ? "v608" : "v607", OTHER = POST ? "v607" : "v608";

// ── §A · the engine publishes what the oracle reads ──────────────────────────────────────────────────────────────────────────
{
  const { W } = plan(F.EXAMPLE, 70000), r = W.schedule[0];
  T(POST ? "A-1: each schedule row publishes `convSleeve_y` and `rmdSleeve_y` (v6.08: the IRA's parts of conv_y and rmd_y)"
         : "A-1 (prior leg): the schedule publishes neither `convSleeve_y` nor `rmdSleeve_y`",
    POST ? "convSleeve_y" in r && "rmdSleeve_y" in r : !("convSleeve_y" in r) && !("rmdSleeve_y" in r), Object.keys(r).filter(k => /Sleeve/.test(k)).join(","));
}

// ── §B · THE ORACLE: the leg's own rules reproduce the engine to the cent; the other leg's do not ──────────────────────────────
for (const [name, amt] of [["NAMED_IRA", 0], ["NAMED_IRA", 70000], ["NAMED_IRA", 200000], ["MIXED", 0], ["MIXED", 70000], ["MIXED", 200000],
                           ["EXAMPLE", 70000], ["EXAMPLE", 200000], ["ANN_ONLY", 400000], ["SINGLE", 200000]]) {
  const run = plan(F[name], amt), O = oracle(run, amt, RULES), w = gap(run.W, O, POST);
  T(`B-${name}@${amt / 1000}K: the ${RULES} oracle reproduces conv_y, rmd_y, the pool, its ordinary draw and the buckets' Traditional share${POST ? " (and the IRA's parts)" : ""} to the cent, every year`,
    w < 0.01, `worst |Δ| ${w.toFixed(6)}`);
}
{
  const disc = ["NAMED_IRA", "MIXED"].map(name => { const run = plan(F[name], 70000); return gap(run.W, oracle(run, 70000, OTHER), false); });
  T(`B-X: DISCRIMINATION — the ${OTHER} oracle misses this leg by more than $1,000 in some year on both IRA fixtures (they exercise the change)`,
    disc.every(x => x > 1000), disc.map(x => usd(x)).join(", "));
}

// ── §C · extinction invariants (v6.08): every fixture × four sliders, through the validated oracle ────────────────────────────
if (POST) {
  const viol = { over: [], short: [], ann: [], cons: [], late: [] };
  for (const [name, p] of Object.entries(F)) for (const amt of [0, 70000, 200000, 400000]) {
    const run = plan(p, amt), O = oracle(run, amt, "v608");
    run.W.schedule.forEach((R, i) => { const o = O[i], tag = `${name}@${amt / 1000}K ${R.yr}`;
      if (R.conv_y > amt + 0.005 || o.cB > o.capB + 0.005 || o.cS > o.capS + 0.005) viol.over.push(tag);
      if (o.on && R.conv_y < amt - 0.005 && o.capB + o.capS >= amt - 0.005) viol.short.push(tag);
      if (name === "ANN_ONLY" && (R.convSleeve_y > 0 || o.tIra > 0)) viol.ann.push(tag);
      if (o.tIra > o.taxOrd + 0.01) viol.cons.push(tag);
      if (!o.on && R.conv_y > 0) viol.late.push(tag); });
  }
  T("C-1: a conversion never exceeds the slider, nor what is left of the bucket money or the IRA after the year's RMD and draws", !viol.over.length, viol.over.slice(0, 3).join("; "));
  T("C-2: a conversion never falls short of the slider while non-annuity pre-tax money remains (buckets + the Other-account IRA)", !viol.short.length, viol.short.slice(0, 3).join("; "));
  T("C-3: an all-annuity pool converts nothing — annuity money is never in the IRA's tracker (D-33 holds in Engine D)", !viol.ann.length, viol.ann.slice(0, 3).join("; "));
  T("C-4: the IRA's RMD-bearing money never exceeds the pool's ordinary money (a dollar cannot be RMD-bearing and not ordinary)", !viol.cons.length, viol.cons.slice(0, 3).join("; "));
  T("C-5: nothing converts after the ladder window", !viol.late.length, viol.late.slice(0, 3).join("; "));
}

// ── §D · the defects, pinned on v6.07 and flipped on v6.08 (dollar-exact; the oracle in §B is what makes these figures trustworthy) ──
{
  const n70 = plan(F.NAMED_IRA, 70000), o70 = oracle(n70, 70000, RULES);
  const standing = o70.filter(o => o.on && o.conv < 70000 - 0.5 && o.tIra > 1000).length;
  T(POST ? "D-1: NAMED_IRA at $70,000 converts $840,000 — every ladder year, the rollover IRA included"
         : "D-1 [KNOWN DEFECT D-34]: NAMED_IRA at $70,000 converts $50,000 — the bucket money only, while the $900,000 rollover IRA stands",
    Math.round(n70.W.totalConverted) === (POST ? 840000 : 50000) && (POST ? standing === 0 : standing > 0),
    `${usd(n70.W.totalConverted)}; ladder years short with the IRA standing: ${standing}`);
  const n0 = plan(F.NAMED_IRA, 0);
  T(POST ? "D-2: NAMED_IRA with no conversion — lifetime RMD $653,901: the IRA's RMD is figured on a balance that grows"
         : "D-2 [KNOWN DEFECT D-34]: NAMED_IRA with no conversion — lifetime RMD $430,216: the IRA's RMD tracker never grows",
    Math.round(sum(n0.W.schedule, "rmd_y")) === (POST ? 653901 : 430216), usd(sum(n0.W.schedule, "rmd_y")));
  // The identified RMD, separated from growth: MIXED's pool holds an annuity and cash beside the IRAs, so a pro-rata shrink takes LESS than
  // the RMD out of the IRA. The oracle's v6.08 rules with the shrink swapped back would give a different figure — asserted in §B (B-X).
  const m0 = plan(F.MIXED, 0);
  T(POST ? "D-3: MIXED with no conversion — lifetime RMD $792,387 (the IRA grows, and its RMD leaves it whole)"
         : "D-3 [KNOWN DEFECT D-34]: MIXED with no conversion — lifetime RMD $576,672",
    Math.round(sum(m0.W.schedule, "rmd_y")) === (POST ? 792387 : 576672), usd(sum(m0.W.schedule, "rmd_y")));
  // The cap-year over-conversion: at $200,000 the example household's buckets run out in 2035; the year's spending draw has already taken
  // $2,672 of the pre-tax money v6.07's cap counted.
  const e2 = plan(F.EXAMPLE, 200000), r35 = e2.W.schedule.find(r => r.yr === 2035), oe = oracle(e2, 200000, "v608").find(o => o.yr === 2035);
  T(POST ? "D-4: the example at $200,000 converts $103,185 in 2035 — what the year's spending draw left, not $105,857"
         : "D-4 [KNOWN DEFECT D-34]: the example at $200,000 converts $105,857 in 2035 — $2,672 more than the spending draw left",
    !!r35 && Math.round(r35.conv_y) === (POST ? 103185 : 105857) && Math.round(oe.capB) === 103185, r35 ? `${usd(r35.conv_y)}, left ${usd(oe.capB)}` : "row missing");
  // The IRA's RMD inside the bucket cap. It can bind only in an RMD year inside the ladder window (2039–2040 here: A's first RMD year is
  // 2039, the window ends 2040), with the buckets' pre-tax money between the slider and the slider plus the whole RMD — so this needs its own
  // fixture (found by a sweep at the build; the IRA-heavy fixtures above run out of bucket money first). Holdings at 40 %, a $900,000 IRA, a
  // $50,000 slider.
  const RC = consistent(NO_PRETAX({ ...BASE, positions: scale(0.4), otherAccounts: [{ name: "Cash", balance: 40000, owner: "JT", taxType: "taxable" },
    { name: "Rollover IRA A", balance: 900000, owner: "A", taxType: "trad", planType: "ira" }] }));
  const rc = plan(RC, 50000), r39 = rc.W.schedule.find(r => r.yr === 2039), o39 = oracle(rc, 50000, RULES).find(o => o.yr === 2039);
  const onlyRmd = !!o39 && o39.tradBoy - o39.rmdBk >= 50000 && o39.tradBoy - o39.rmd < 50000 && o39.rmdS > 0;
  T("D-5a: PRECONDITION — in 2039 the bucket money after its own RMD covers the $50,000 slider, and the bucket money less BOTH RMDs does not", onlyRmd,
    o39 ? `buckets ${usd(o39.tradBoy)}, their RMD ${usd(o39.rmdBk)}, the IRA's ${usd(o39.rmdS)}` : "row missing");
  // On v6.08 the IRA would top up any shortfall, so the full $50,000 alone cannot show the fix — that it is ALL bucket money does.
  T(POST ? "D-5: …and 2039 converts the full $50,000, all of it bucket money — the IRA's RMD no longer comes off it, so the IRA is not needed"
         : "D-5 [KNOWN DEFECT D-34]: …yet 2039 converts only the bucket money less BOTH RMDs — the IRA's RMD taken off bucket money",
    !!r39 && (POST ? Math.abs(r39.conv_y - 50000) < 0.005 && r39.convSleeve_y === 0
                   : Math.abs(r39.conv_y - (o39.tradBoy - o39.rmd)) < 0.01 && r39.conv_y < 50000 - 1),
    r39 ? `${usd(r39.conv_y)}${POST ? `, from the IRA ${usd(r39.convSleeve_y)}` : ""}` : "row missing");
}

// ── §E · cross-leg invariance (v6.08 run beside v6.07): the households the release must not move ──────────────────────────────
const PRIOR = join(HERE, "app_v607.mjs");
if (POST && existsSync(PRIOR)) {
  const M0 = await import(pathToFileURL(PRIOR).href);
  const strat = (G, p, amt) => { G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline(), retireYear = tl.targetRetireYear;
    return G.runRothStrategies({ single: !!tl.single, asOfYr: tl.asOfYear, retireYr: retireYear,
      horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
      deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
      pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: G.PORTFOLIO().stateCode || null,
      convTaxFunding: "taxable", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, ...G.retireStartBalances(retireYear),
      ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
      survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
      taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: amt,
      ordDrawByYr: G.withdrawalPlanSeries({ retireYear, rothAmount: amt, scenarioPreset: "base" }).ordDrawByYr }); };
  const engines = (M, p, amt) => { const G = M.__g, EE = M.__engines; G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline(), retireYear = tl.targetRetireYear;
    const A = { retireYear, rothAmount: amt, qcdAnnual: 0, taxYield: 2.0 }, S = G.withdrawalPlanSeries({ retireYear, rothAmount: amt, scenarioPreset: "base" });
    return { D: G.computeWithdrawalPlan({ retireYear, rothAmount: amt, scenarioPreset: "base" }).schedule.map(({ convSleeve_y, rmdSleeve_y, ...k }) => k),
             B: EE.computeTaxPlan({ ...A, ...S }).rows, C: EE.computeIrmaaPlan({ ...A, ...S }).rows, A: strat(G, p, amt) }; };
  for (const [name, amt] of [["EXAMPLE", 0], ["EXAMPLE", 70000], ["NO_OTHER_TRAD", 70000], ["SINGLE", 70000]]) {
    const a = engines(M0, F[name], amt), b = engines({ __g: g, __engines: E }, F[name], amt);
    T(`E-${name}@${amt / 1000}K: Engine D's schedule is bit-identical to v6.07 (the two new fields set aside)`, JSON.stringify(a.D) === JSON.stringify(b.D));
    T(`E-${name}@${amt / 1000}K: the Taxes and IRMAA tabs' engines are bit-identical to v6.07`, JSON.stringify([a.B, a.C]) === JSON.stringify([b.B, b.C]));
    T(`E-${name}@${amt / 1000}K: the Roth tab's strategies are bit-identical to v6.07`, JSON.stringify(a.A) === JSON.stringify(b.A));
  }
  const a = engines(M0, F.EXAMPLE, 200000), b = engines({ __g: g, __engines: E }, F.EXAMPLE, 200000);
  const moved = []; a.D.forEach((r, i) => Object.keys(r).forEach(k => { if (r[k] !== b.D[i][k]) moved.push(`${r.yr}:${k}`); }));
  T("E-EXAMPLE@200K: Engine D moves in ONE year only (2035), and only its conversion, MAGI and bracket", moved.length > 0 &&
    moved.every(m => m.startsWith("2035:") && /:(conv_y|magi|bracket)$/.test(m)), moved.join(" "));
  T("E-EXAMPLE@200K: the Taxes and IRMAA tabs and the strategies do not move (Engine D's conversion is not in the series they read)",
    JSON.stringify([a.B, a.C, a.A]) === JSON.stringify([b.B, b.C, b.A]));
} else if (POST) {
  console.log("  (§E skipped: app_v607.mjs not in this run folder — the differential needs the prior leg)");
}

// ── §F · the Withdrawal tab: the new sentence, and the conversion it now reports ──────────────────────────────────────────────
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
  const SENT = /A conversion takes the buckets' pre-tax money first, then a Traditional IRA you entered under Other accounts, and never annuity money — that order is the model's assumption, not a rule\./;
  T("F-0: PRECONDITION — the Withdrawal tab opens and renders its Section A note", onTab && /Conv\s*column reflects the annual Roth conversion/.test(txt0));
  T(POST ? "F-1: the Withdrawal tab says where a conversion comes from (bucket money first, then the IRA, never an annuity — the model's assumption)"
         : "F-1 (prior leg): the Withdrawal tab carries no such sentence", POST ? SENT.test(txt0) : !SENT.test(txt0));
  // applyLoadedData takes a WRAPPER and does not re-render, so park off the target tab first (t16's §C pattern).
  await gotoTab("taxes");
  await act(async () => { window.__test.applyLoadedData({ portfolio: clone(F.NAMED_IRA) }); });
  await flush(); await flush(); await gotoTab("withdrawal");
  const txt1 = body().textContent || "", m = txt1.match(/Roth converted\s*\$([\d,]+)K/);
  T(POST ? "F-2: on NAMED_IRA at the opening $70,000 slider the Withdrawal tab reports $840K converted — the rollover IRA included"
         : "F-2 [KNOWN DEFECT D-34]: on NAMED_IRA at the opening $70,000 slider the Withdrawal tab reports $50K converted — the IRA never converts",
    !!m && +m[1].replace(/,/g, "") === (POST ? 840 : 50), m ? `$${m[1]}K` : "card not found");
  root.unmount();
}

console.log(`\nt71 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
