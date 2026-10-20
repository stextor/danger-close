// t70 — A ROTH CONVERSION, A QCD AND AN RMD NEVER TAKE NON-QUALIFIED ANNUITY MONEY (v6.07, D-33)
// Run: node t70_annuity_conversion.mjs v607   |   node t70_annuity_conversion.mjs v606
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_D33_ANNUITY_CONVERSION_V607.md). The Other-accounts type `annuity` — a commercial,
// non-qualified contract — rides inside each person's Traditional pool as a SHARE (`annShareA/B`), and through v6.06 that share was
// CONSTANT. Every engine capped a Roth conversion and a QCD at the whole pool and debited RMDs and conversions from it pro rata, so
//   · annuity money was CONVERTED, which the law does not allow: 26 U.S.C. §408A(c)(5)(A), (e)(1) and (d)(3)(B) admit a rollover to a
//     Roth IRA only from an eligible retirement plan as §402(c)(8)(B) lists them, and a §72 annuity is none of them;
//   · annuity money made QCDs, which only an IRA can (§408(d)(8)(B));
//   · every RMD and conversion drained annuity dollars with it, so the share understated the annuity and overstated every later RMD.
// From v6.07 the engines carry the annuity dollars: the share is re-taken each year on what is actually left.
//
// GATED PER LEG (OPERATIONS §B2). The v6.06 leg pins the defect as it was ([KNOWN DEFECT] pins); the v6.07 leg asserts the fix.
// PRECISION: dollar-exact. Engines B and C are module-level (`__engines`); the Roth tab's RMD cards render full dollars.
// INDEPENDENCE: §C and §E re-implement the balance recursions here from the rules in the scope, seeded from `retireStartBalances`'
// PRIMITIVES (`tradInit*`, `rmdInit*` — the annuity is their difference), never from the app's `annShare*` round trip (t26's reasoning).
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
const VER = process.argv[2] || "v607";
const KNOWN_VERSIONS = ["v606", "v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622"].includes(VER);   // an array, so register_tag2 widens it each release
const { __g: g, __engines: E } = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const usd = n => "$" + Math.round(n).toLocaleString();
const clone = o => JSON.parse(JSON.stringify(o));
console.log(`t70 — ANNUITY MONEY IS NEVER CONVERTED (${VER})\n`);

const BASE = clone(g.PORTFOLIO());
const load = p => { g.applyLoadedData({ portfolio: clone(p) }); return g.buildPlanTimeline(); };
const engines = (p, o = {}) => {
  const tl = load(p), retireYear = tl.targetRetireYear;
  const A = { retireYear, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, ...o };
  const S = o.noDraw ? { gainByYr: {}, ordDrawByYr: {} } : g.withdrawalPlanSeries({ retireYear, rothAmount: A.rothAmount, scenarioPreset: "base" });
  const B = E.computeTaxPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr });
  const C = E.computeIrmaaPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr });
  return { tl, B: B.rows, C: C.rows, deathYr1: C._deathYr1 };
};
const strategies = (p) => {
  const tl = load(p), retireYear = tl.targetRetireYear;
  const P = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: retireYear,
    horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), ladderEnd: tl.rothLadderEnd,
    dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ssA: g.getSSA(), ssB: tl.single ? 0 : g.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
    pen: g.getPension(), penOwner: g.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: g.PORTFOLIO().stateCode || null,
    convTaxFunding: "taxable", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, ...g.retireStartBalances(retireYear),
    ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
    survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    taxableInit: g.taxableInitAll(), taxYieldPct: 2.0, currentConv: 70000,
    ordDrawByYr: g.withdrawalPlanSeries({ retireYear, rothAmount: 70000, scenarioPreset: "base" }).ordDrawByYr };
  return g.runRothStrategies(P);
};
const sum = (rows, k) => rows.reduce((s, r) => s + (r[k] || 0), 0);

// Fixtures. NO_PRETAX zeroes the planned pre-tax contributions, which otherwise accrue Traditional money to the retirement year.
const NO_PRETAX = p => ({ ...p, contributions: { ...p.contributions, monthly401k: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribPreTaxB: 0 } });
const ALL_ANNUITY = NO_PRETAX({ ...BASE, positions: [], otherAccounts: [
  { name: "Cash", balance: 300000, owner: "JT", taxType: "taxable" },
  { name: "Big Contract A", balance: 250000, owner: "A", taxType: "annuity" },
  { name: "Big Contract B", balance: 400000, owner: "B", taxType: "annuity" }] });
const EX150 = { ...BASE, otherAccounts: BASE.otherAccounts.map(a => a.taxType === "annuity" ? { ...a, balance: 150000 } : a) };
const NO_ANN = { ...BASE, otherAccounts: BASE.otherAccounts.filter(a => a.taxType !== "annuity") };

// ── §A · attributeRetIncome: a conversion carries no annuity money; a draw keeps the share ──────────────────────────────
{
  const at = g.attributeRetIncome;
  const c = at({ convA: 10000, annShareA: 0.4, empShareA: 0.5 });
  T(POST ? "A-1: a $10,000 conversion at annuity share 0.4 carries $0 of annuity — none is convertible (§408A)"
         : "A-1 [KNOWN DEFECT D-33]: a $10,000 conversion at annuity share 0.4 carries $4,000 of annuity",
    Math.round(c.A.annuity) === (POST ? 0 : 4000), JSON.stringify(c.A));
  T(POST ? "A-2: the conversion splits IRA / employer by the employer share alone: $5,000 / $5,000"
         : "A-2 (prior leg): the conversion's non-annuity $6,000 splits $3,000 / $3,000",
    POST ? Math.round(c.A.ira) === 5000 && Math.round(c.A.employer) === 5000 : Math.round(c.A.ira) === 3000 && Math.round(c.A.employer) === 3000,
    JSON.stringify(c.A));
  const d = at({ drawA: 10000, annShareA: 0.4, empShareA: 0.5 });
  T("A-3: a $10,000 DRAW still takes annuity money at the share — $4,000 (DD-2: pro rata, unchanged)",
    Math.round(d.A.annuity) === 4000 && Math.round(d.A.employer) === 3000 && Math.round(d.A.ira) === 3000, JSON.stringify(d.A));
  const m = at({ rmdA: 3000, rmdB: 2000, convA: 7000, convB: 1000, drawA: 4000, drawB: 500, annShareA: 0.3, annShareB: 0.8, empShareA: 0.25, empShareB: 1 });
  const tot = ["A", "B"].reduce((s, w) => s + m[w].ira + m[w].employer + m[w].annuity, 0);
  T("A-4: identity — ira + employer + annuity over both persons = RMD + conversion + draw, to the cent", Math.abs(tot - 17500) < 0.005, String(tot));
}

// ── §B · an all-annuity Traditional pool: nothing to convert, nothing to give by QCD (EXTINCTION) ──────────────────────
{
  const tl = load(ALL_ANNUITY); const r = g.retireStartBalances(tl.targetRetireYear);
  T("B-0: PRECONDITION — both pools are 100 % annuity and non-empty (the section is not vacuous)",
    r.annShareA === 1 && r.annShareB === 1 && r.tradInitA > 0 && r.tradInitB > 0, JSON.stringify([r.tradInitA, r.tradInitB, r.annShareA, r.annShareB]));
  const e = engines(ALL_ANNUITY, { qcdAnnual: 10000 });
  const cB = sum(e.B, "conv_y"), cC = sum(e.C, "conv_y"), qB = sum(e.B, "qcd_y"), qC = sum(e.C, "qcd_y");
  T(POST ? "B-1 [EXTINCTION]: Engine B (Taxes tab) converts $0 from an all-annuity pool"
         : "B-1 [KNOWN DEFECT D-33]: Engine B converts annuity money", POST ? cB === 0 : cB > 0, usd(cB));
  T(POST ? "B-2 [EXTINCTION]: Engine C (IRMAA tab) converts $0 from an all-annuity pool"
         : "B-2 [KNOWN DEFECT D-33]: Engine C converts annuity money", POST ? cC === 0 : cC > 0, usd(cC));
  T(POST ? "B-3 [EXTINCTION]: no QCD is made from annuity money, in Engine B or C (§408(d)(8)(B): an IRA only)"
         : "B-3 [KNOWN DEFECT D-33]: QCDs are taken from annuity money", POST ? qB === 0 && qC === 0 : qB > 0 && qC > 0, `${usd(qB)} / ${usd(qC)}`);
  T("B-4: NEGATIVE CONTROL — an annuity carries no RMD in either engine, on BOTH legs (v5.26, unchanged)",
    sum(e.B, "rmd_y") === 0 && sum(e.C, "rmd_y") === 0, `${usd(sum(e.B, "rmd_y"))} / ${usd(sum(e.C, "rmd_y"))}`);
  const S = strategies(ALL_ANNUITY), conv = S.map(s => `${s.key} ${usd(s.totConv)}`).join(", ");
  T(POST ? "B-5 [EXTINCTION]: Engine A (strategy comparison) — every strategy converts $0"
         : "B-5 [KNOWN DEFECT D-33]: Engine A's strategies convert annuity money", POST ? S.every(s => s.totConv === 0) : S.some(s => s.totConv > 0), conv);
}

// ── §C · HAND CASE: Engines B and C's RMD and conversion, year by year, against an independent recursion ─────────────────
// Household EX150: the shipped example with spouse B's annuity at $150,000 (B's pool ~41 % annuity). Draws and gains off (`{}`), no QCD,
// so the recursion below is the whole of what moves the Traditional balances. Compared up to the year before the first death — the merge is
// t13/t14's subject, not this one's. RULES (scope §1): RMD on the non-annuity dollars; the conversion capped at the non-annuity total less
// the RMD and split between the legs by each leg's non-annuity balance after its RMD; the annuity untouched; 4.5 % growth.
// MODE "share" is v6.06's rule (constant share, pooled pro-rata debit), reproduced so the prior leg pins the defect by the same method.
for (const [FX, LBL] of [[EX150, "EX150"], [BASE, "the shipped example (t25's household)"]]) {
  const tl = load(FX); const ry = tl.targetRetireYear; const r = g.retireStartBalances(ry);
  const nA0 = r.tradInitA - r.rmdInitA, nB0 = r.tradInitB - r.rmdInitB;
  T(`C-0 ${LBL}: PRECONDITION — B holds annuity money and A holds none (the hand case exercises both)`, nB0 > 0 && Math.abs(nA0) < 1e-6, `${usd(nA0)} / ${usd(nB0)}`);
  const e = engines(FX, { noDraw: true });
  const replica = (mode) => {
    let tA = r.tradInitA, tB = r.tradInitB, nA = nA0, nB = nB0; const sA = nA0 / r.tradInitA, sB = nB0 / r.tradInitB; const out = {};
    for (let yr = ry; yr < e.deathYr1; yr++) {
      const ageA = yr - tl.dobA.year, ageB = yr - tl.dobB.year;
      const qA = mode === "carry" ? tA - nA : tA * (1 - sA), qB = mode === "carry" ? tB - nB : tB * (1 - sB);
      const rA = ageA >= g.rmdStartAge(tl.dobA.year) && qA > 0 ? qA / g.rmdDivisor(ageA) : 0;
      const rB = !tl.single && ageB >= g.rmdStartAge(tl.dobB.year) && qB > 0 ? qB / g.rmdDivisor(ageB) : 0;
      const win = yr >= ry && yr <= tl.rothLadderEnd ? 70000 : 0;
      const conv = Math.min(win, Math.max(0, (mode === "carry" ? qA + qB : tA + tB) - (rA + rB)));
      const pA = Math.max(0, tA - rA), pB = Math.max(0, tB - rB);
      let fA;
      if (mode === "carry") { const xA = Math.max(0, qA - rA), xB = Math.max(0, qB - rB); fA = xA + xB > 0 ? xA / (xA + xB) : 0; }
      else fA = pA + pB > 0 ? pA / (pA + pB) : 0;
      tA = Math.max(0, pA - conv * fA) * 1.045; tB = Math.max(0, pB - conv * (1 - fA)) * 1.045;
      nA *= 1.045; nB *= 1.045;
      out[yr] = { rmd: rA + rB, conv };
    }
    return out;
  };
  const want = replica(POST ? "carry" : "share");
  const yrs = Object.keys(want).map(Number);
  console.log(`  C ${LBL}: ${yrs[0]}–${yrs[yrs.length - 1]}, conversions ${usd(yrs.reduce((t, y) => t + want[y].conv, 0))}, RMDs ${usd(yrs.reduce((t, y) => t + want[y].rmd, 0))} (${POST ? "carried" : "constant share"})`);
  T(`C-1 ${LBL}: PRECONDITION — the comparison spans conversion years AND RMD years before the first death`,
    yrs.some(y => want[y].conv > 0) && yrs.some(y => want[y].rmd > 0), `${yrs[0]}–${yrs[yrs.length - 1]}`);
  for (const [name, rows] of [["Engine B", e.B], ["Engine C", e.C]]) {
    const by = Object.fromEntries(rows.map(x => [x.yr, x]));
    const bad = yrs.filter(y => !by[y] || Math.round(by[y].rmd_y) !== Math.round(want[y].rmd) || Math.round(by[y].conv_y) !== Math.round(want[y].conv));
    T(`C-2 ${LBL}, ${name}: every year's RMD and conversion equal the ${POST ? "carried-annuity" : "constant-share (v6.06)"} recursion to the dollar (${yrs.length} years)`,
      bad.length === 0, bad.slice(0, 3).map(y => `${y}: rmd ${by[y] && Math.round(by[y].rmd_y)} vs ${Math.round(want[y].rmd)}, conv ${by[y] && Math.round(by[y].conv_y)} vs ${Math.round(want[y].conv)}`).join(" | "));
  }
  const other = replica(POST ? "share" : "carry"), dif = yrs.filter(y => Math.round(other[y].rmd) !== Math.round(want[y].rmd));
  T(`C-3 ${LBL}: DISCRIMINATION — the other rule gives different RMDs in this window (C-2 could not pass under both)`, dif.length > 0, `${dif.length} years differ`);
}

// ── §G · Engine A's RMD path: with no conversion, the annuity dollars carry over whole (the share is re-taken every year) ───────────
// The strategy comparison's "none" strategy converts nothing, so its Traditional balances move only by RMD and growth — and Engine A taxes
// the spending draw without draining it (v5.84). Run with no death (deathYr1 Infinity) so the recursion below is the whole of it.
{
  const tl = load(EX150), ry = tl.targetRetireYear, r = g.retireStartBalances(ry), H = ry + 30;
  const P = { single: false, asOfYr: tl.asOfYear, retireYr: ry, horizonYr: H, ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    deathYr1: Infinity, survivor: "A", ssA: g.getSSA(), ssB: g.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year,
    ssBMo: tl.ssB_date.month, pen: g.getPension(), penOwner: "A", stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0,
    acaPremium: 0, acaSize: 0, ...r, ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, taxableInit: 200000, taxYieldPct: 2.0, currentConv: 70000 };
  const none = g.runRothStrategies(P).find(x => x.key === "none");
  const rep = (mode) => {
    const out = {};
    for (const [w, dob, t0, q0] of [["A", tl.dobA.year, r.tradInitA, r.rmdInitA], ["B", tl.dobB.year, r.tradInitB, r.rmdInitB]]) {
      let t = t0, n = t0 - q0; const sh = t0 > 0 ? n / t0 : 0;
      for (let yr = ry; yr <= H; yr++) {
        const age = yr - dob, q = mode === "carry" ? t - n : t * (1 - sh);
        const rmd = age >= g.rmdStartAge(dob) && q > 0 ? q / g.rmdDivisor(age) : 0;
        t = Math.max(0, t - rmd) * 1.045; n = Math.min(n * 1.045, t);
      }
      out[w] = t;
    }
    return out;
  };
  const want = rep(POST ? "carry" : "share"), other = rep(POST ? "share" : "carry");
  T(`G-1: Engine A "none" — end-of-horizon Traditional balances equal the ${POST ? "carried-annuity" : "constant-share (v6.06)"} recursion to the dollar`,
    Math.abs(none.endTradA - want.A) < 1 && Math.abs(none.endTradB - want.B) < 1,
    `A ${usd(none.endTradA)} vs ${usd(want.A)}, B ${usd(none.endTradB)} vs ${usd(want.B)}`);
  T("G-2: DISCRIMINATION — the other rule ends B more than $1,000 apart (G-1 could not pass under both)", Math.abs(other.B - want.B) > 1000,
    `${usd(other.B)} vs ${usd(want.B)}`);
}

// ── §D · DIFFERENTIAL v6.06 → v6.07: annuity-free households bit-identical; the example moves only where the annuity is ───────────
const PRIOR = join(HERE, "app_v606.mjs");
if (POST && existsSync(PRIOR)) {
  const { __g: g0, __engines: E0 } = await import(pathToFileURL(PRIOR).href);
  const run = (G, EE, p, qcd) => {
    G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline(), retireYear = tl.targetRetireYear;
    const A = { retireYear, rothAmount: 70000, qcdAnnual: qcd, taxYield: 2.0 };
    const S = G.withdrawalPlanSeries({ retireYear, rothAmount: 70000, scenarioPreset: "base" });
    return { B: EE.computeTaxPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows,
             C: EE.computeIrmaaPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows,
             D: G.computeWithdrawalPlan({ retireYear, rothAmount: 70000, scenarioPreset: "base" }).schedule };
  };
  let n = 0; const diff = [];
  for (const p of [NO_ANN, { ...BASE, otherAccounts: BASE.otherAccounts.map(a => a.taxType === "annuity" ? { ...a, taxType: "taxable" } : a) }])
    for (const st of [null, "PA", "MD", "CA"]) for (const qcd of [0, 10000]) {
      const q = st ? { ...p, stateCode: st, _stateFromForm: true } : p; n++;
      if (JSON.stringify(run(g0, E0, q, qcd)) !== JSON.stringify(run(g, E, q, qcd))) diff.push(`${st || "own"}/${qcd}`);
    }
  T(`D-1 NEGATIVE CONTROL: ${n} annuity-free runs — Engines B, C and D bit-identical to v6.06, every row`, diff.length === 0, diff.join(", "));
  const a0 = run(g0, E0, BASE, 0), a1 = run(g, E, BASE, 0);
  console.log(`  D: example household, Engine B lifetime RMD ${usd(sum(a0.B, "rmd_y"))} -> ${usd(sum(a1.B, "rmd_y"))}, conversions ${usd(sum(a1.B, "conv_y"))}`);
  T("D-2: the example household ($7,000 annuity) — Engine D's schedule is bit-identical (Engine D was never affected: scope §0.2)",
    JSON.stringify(a0.D) === JSON.stringify(a1.D));
  T("D-3: the example household — Engine B's lifetime RMD falls (no RMD drains the annuity) and its conversions are unchanged",
    sum(a1.B, "rmd_y") < sum(a0.B, "rmd_y") && Math.round(sum(a1.B, "conv_y")) === Math.round(sum(a0.B, "conv_y")),
    `RMD ${usd(sum(a0.B, "rmd_y"))} → ${usd(sum(a1.B, "rmd_y"))}, conv ${usd(sum(a0.B, "conv_y"))} → ${usd(sum(a1.B, "conv_y"))}`);
} else if (POST) {
  console.log("  (§D skipped: app_v606.mjs not in this run folder — the differential needs the prior leg)");
}

// ── §E · the Roth tab: the RMD cards, DOLLAR-EXACT against an independent ladder recursion ──────────────────────────────────
// Two households: the shipped example (B's $7,000 annuity), and the example with a $150,000 annuity for spouse A too. The second is the
// only one that exercises the ladder's OWN RMD on annuity money: A's first RMD year (2039) falls inside the ladder (which runs to B's
// window end, 2040), while B's (2041) does not. A's in-ladder RMD then moves A's 2039–2040 cap, so B's conversion and B's card.
const deriveCards = (tl, r) => {
  const ann = { A: r.tradInitA - r.rmdInitA, B: r.tradInitB - r.rmdInitB }, G = 0.045;
  let bal = { A: r.tradInitA, B: r.tradInitB }, an = { ...ann }; const rows = {};
  for (let y = tl.rothLadderStart; y <= tl.rothLadderEnd; y++) {
    const age = { A: y - tl.dobA.year, B: y - tl.dobB.year }, end = { A: tl.rothLadderEndA, B: tl.rothLadderEndB };
    const rmd = {}, grown = {}, cap = {};
    for (const w of ["A", "B"]) {
      const dob = w === "A" ? tl.dobA.year : tl.dobB.year;
      const base = POST ? Math.max(0, bal[w] - an[w]) : Math.max(0, bal[w]);
      rmd[w] = age[w] >= g.rmdStartAge(dob) ? base / g.rmdDivisor(age[w]) : 0;
      grown[w] = Math.max(0, bal[w]) * (1 + G);
      cap[w] = Math.max(0, (y <= end[w] ? grown[w] - (POST ? an[w] * (1 + G) : 0) : 0) - rmd[w]);
    }
    const conv = Math.min(70000, cap.A + cap.B), cA = cap.A + cap.B > 0 ? conv * cap.A / (cap.A + cap.B) : 0, cv = { A: cA, B: conv - cA };
    for (const w of ["A", "B"]) { bal[w] = Math.max(0, grown[w] - cv[w] - rmd[w]); an[w] = Math.min(an[w] * (1 + G), bal[w]); }
    rows[y] = { bal: { ...bal }, an: { ...an }, rmdA: rmd.A };
  }
  const last = Math.max(...Object.keys(rows).map(Number));
  const card = (w) => {
    const dob = w === "A" ? tl.dobA.year : tl.dobB.year, age = g.rmdStartAge(dob), yr = dob + age;
    const at = (k) => rows[yr - 1] ? rows[yr - 1][k][w] : rows[last][k][w] * Math.pow(1 + G, Math.max(0, (yr - 1) - last));
    const sh = (w === "A" ? ann.A / r.tradInitA : ann.B / r.tradInitB) || 0;
    return { yr, amt: Math.round(POST ? Math.max(0, at("bal") - at("an")) / g.rmdDivisor(age) : at("bal") * (1 - sh) / g.rmdDivisor(age)) };
  };
  return { A: card("A"), B: card("B"), rows };
};
const A_ANN = { ...BASE, otherAccounts: [...BASE.otherAccounts, { name: "Contract A", balance: 150000, owner: "A", taxType: "annuity" }] };
const tl0 = load(BASE);
const want0 = (() => { const tl = load(BASE); return deriveCards(tl, g.retireStartBalances(tl.rothLadderStart)); })();
const want1 = (() => { const tl = load(A_ANN); return { tl, ...deriveCards(tl, g.retireStartBalances(tl.rothLadderStart)) }; })();
load(BASE);
console.log(`  E: derived with-conversion cards — example A ${usd(want0.A.amt)} (${want0.A.yr}), B ${usd(want0.B.amt)} (${want0.B.yr}); ` +
  `with A's annuity A ${usd(want1.A.amt)}, B ${usd(want1.B.amt)}`);
T("E-0a: PRECONDITION — with A's annuity, A takes an RMD inside the ladder (the in-ladder RMD path is exercised)",
  Object.values(want1.rows).some(x => x.rmdA > 0), "");
T(`E-0b: the A-annuity fixture ${POST ? "leaves both cards where they are" : "moves both cards"} (the expectation is not the example's by accident of the fixture)`,
  POST ? want1.A.amt === want0.A.amt && want1.B.amt === want0.B.amt : want1.A.amt !== want0.A.amt && want1.B.amt !== want0.B.amt, "");
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
  const readCards = () => { const txt = body().textContent || ""; const re = /\$([\d,]+)\s*at\s*(\d+)\s*\((20\d\d)\)/g; const cards = []; let m;
    while ((m = re.exec(txt)) !== null) cards.push({ amt: +m[1].replace(/,/g, ""), yr: +m[3] }); return cards; };
  const withConv = (cards, yr) => { const c = cards.filter(x => x.yr === yr); return c.length >= 2 ? c[1].amt : null; };
  // The ladder table (t16's reader): YEAR $CONVK $TAXABLEK RATE% $FEDK $MAGIK — figures in $K.
  const readLadder = () => { const t = body().textContent || ""; const i = t.indexOf("TRAD BALROTH BAL"); if (i < 0) return null;
    const seg = t.slice(i, i + 6000), re = /(20\d\d)\$(\d+)K\$(\d+)K(\d+)%\$([\d.]+)K\$(\d+)K/g, out = {}; let m;
    while ((m = re.exec(seg)) !== null) out[+m[1]] = { conv: +m[2], magi: +m[6] }; return out; };
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const ex = [...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  await click(ex); await flush(); await flush();
  await gotoTab("roth");
  const c0 = readCards(), L0 = readLadder();
  T("E-0: the four RMD cards render (no-conversion pair, then with-conversion pair)", c0.length >= 4, `got ${c0.length}`);
  T(`E-1: spouse B's WITH-conversion card is ${usd(want0.B.amt)} (${want0.B.yr}) — ${POST ? "the balance less the CARRIED annuity" : "the static share (v6.06)"}`,
    withConv(c0, want0.B.yr) === want0.B.amt, `rendered ${withConv(c0, want0.B.yr)}`);
  T(`E-2: spouse A's WITH-conversion card is ${usd(want0.A.amt)} (${want0.A.yr}) — A holds no annuity, but ${POST ? "B's smaller convertible balance moves conversion onto A" : "the cap still counts B's annuity"}`,
    withConv(c0, want0.A.yr) === want0.A.amt, `rendered ${withConv(c0, want0.A.yr)}`);
  // applyLoadedData takes a WRAPPER and does not re-render, so park off the target tab first (t16's §C pattern).
  await gotoTab("taxes");
  await act(async () => { window.__test.applyLoadedData({ portfolio: clone(A_ANN) }); });
  await flush(); await flush(); await gotoTab("roth");
  const c1 = readCards(), L1 = readLadder();
  T(`E-3: with A's annuity, spouse A's WITH-conversion card is ${usd(want1.A.amt)} — ${POST ? "unmoved by A's $150,000 annuity: never converted, and the card subtracts it" : "the static share (v6.06)"}`,
    withConv(c1, want1.A.yr) === want1.A.amt, `rendered ${withConv(c1, want1.A.yr)}`);
  T(`E-4: with A's annuity, spouse B's WITH-conversion card is ${usd(want1.B.amt)} — ${POST ? "unmoved: A's in-ladder RMD is on the non-annuity balance, so A's cap and B's conversion do not change" : "A's in-ladder RMD on the whole balance moves it (v6.06)"}`,
    withConv(c1, want1.B.yr) === want1.B.amt, `rendered ${withConv(c1, want1.B.yr)}`);
  // A's first RMD year sits inside the ladder; A's window has closed, so the RMD moves no conversion — only the table's own RMD, hence MAGI.
  const yA = tl0.dobA.year + g.rmdStartAge(tl0.dobA.year), annA = 150000 / g.rmdDivisor(g.rmdStartAge(tl0.dobA.year)) / 1000;
  T("E-5a: PRECONDITION — the ladder table renders A's first RMD year on both plans", !!(L0 && L1 && L0[yA] && L1[yA]), `${yA}`);
  T(POST ? `E-5: the ladder's own RMD takes nothing from A's annuity — ${yA}'s MAGI is the same with and without it`
         : `E-5 [KNOWN DEFECT D-33, open since v5.44]: the ladder's own RMD counts A's annuity — ${yA}'s MAGI rises by more than $150,000 / divisor`,
    !!(L0 && L1 && L0[yA] && L1[yA]) && (POST ? L1[yA].magi === L0[yA].magi : L1[yA].magi - L0[yA].magi > annA),
    L0 && L1 && L0[yA] && L1[yA] ? `$${L0[yA].magi}K -> $${L1[yA].magi}K` : "row not found");
  root.unmount();
}

// ── §F · STRUCTURE (source text, anchored): the caps read the non-annuity balance; Engine D is untouched ────────────────────
{
  const SRC = (await import("fs")).readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
  const capB = /const conv_y = Math\.min\(conv\(yr\), Math\.max\(0, _rmdBaseA \+ _rmdBaseB - Math\.max\(rmd_y, qcd_y\)\)\);/.test(SRC);
  const capC = /const conv_y = Math\.min\(\(yr >= _retireYr && yr <= _ladderEnd\) \? rothAmount : 0, Math\.max\(0, _rmdBaseA \+ _rmdBaseB - Math\.max\(rmd_y, qcd_y\)\)\);/.test(SRC);
  const headA = /const headA = yr <= ladderEndA \? Math\.max\(0, tradA \* \(1 - _annShA\) - rmdA\) : 0;/.test(SRC);
  const attr = /fromEmp = rd - fromIra, cs = split\(c, 0, e\);/.test(SRC);
  T(POST ? "F-1: Engines A, B and C cap the conversion at the non-annuity balance; the attribution gives a conversion no annuity"
         : "F-1 (prior leg): none of the four D-33 expressions is present", POST ? capB && capC && headA && attr : !capB && !capC && !headA && !attr,
    JSON.stringify({ capB, capC, headA, attr }));
  // v6.08 (D-34) rewrote Engine D's conversion (docs/SCOPE_D34_ENGINE_D_OTHER_IRA_V608.md; t71 carries it): figured after the draws, bucket
  // money first, then a Traditional IRA entered under Other accounts — never annuity money, which is not in that IRA's tracker. Gated per leg.
  const D34 = ["v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622"].includes(VER);   // an array, so register_tag2 widens it each release
  const capD607 = /const conv_y = yr <= _ladderEnd \? Math\.min\(rothAmount, Math\.max\(0, tradNotional_boy - rmd_y\)\) : 0;/.test(SRC);
  const capD608 = /const _bucketConvCap = Math\.max\(0, tradNotional_boy - _bucketRmdTaken - _spendFromBuckets \* tradFrac\);/.test(SRC)
    && /const _sleeveConvCap = Math\.max\(0, taxRmdA \+ taxRmdB\);/.test(SRC);
  T(D34 ? "F-2 (v6.08+): Engine D's conversion is figured after the draws — bucket money, then the Other-account IRA's RMD-bearing money (never annuity)"
        : "F-2: Engine D's conversion is bucket money only, unchanged on both legs (annuity sits in the Priority-1 sleeve there)",
    D34 ? capD608 && !capD607 : capD607 && !capD608, JSON.stringify({ capD607, capD608 }));
}

console.log(`\nt70 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
