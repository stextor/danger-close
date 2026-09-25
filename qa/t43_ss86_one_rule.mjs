// t43 — ONE §86 RULE FOR EVERY ENGINE (C-4 + §1f)
// (SCOPE_SS86_ONE_RULE; added for v5.77). Runs on BOTH legs:
//     node t43_ss86_one_rule.mjs v576   |   node t43_ss86_one_rule.mjs v577
//
// THE LAW. 26 U.S.C. §86(a), and its executable form, the Social Security Benefits Worksheet in the
// 2025 Form 1040 instructions (lines 6a/6b). Re-read from irs.gov (i1040gi.pdf) at the v5.77 build:
// line 8 base $25,000 single / $32,000 joint; line 9 stops at zero when line 7 does not exceed it;
// line 10 $9,000 / $12,000; line 14 "the smaller of line 2 or line 13" (½ of benefits vs ½ of the
// capped excess); line 18 "the smaller of line 16 or line 17" (85% of benefits).
//
// WHAT v5.77 CHANGED. Through v5.76 the rule was written out four times (Engines A, B, C and the
// Roth tab). Engine A's copy dropped line 14's ½-of-benefits limb in the upper tier (C-4,
// pessimistic). Engine C's copy was right but was handed the JOINT thresholds for a household single
// from the start (§1f, optimistic — it hid an IRMAA surcharge). v5.77 replaces all four with one
// module-level `taxableSS86(ss, other, filingSingle)`.
//
// THE ORACLES are written HERE, independently of the app: `worksheet` follows the IRS lines with
// the dollar amounts typed in (not read from TAX_CONSTS), and `statute` follows §86(a)'s own
// wording. Section B asserts the two agree with each other before either is used as a reference.
//
// ⚠ ENGINE A'S RESOLUTION. Engine A (runRothStrategies) returns only totals, not per-year taxable
//   SS. It is measured through its tax on a one-year household whose only other income is a pension
//   (no state tax, no investment income): totTax must equal the ordinary tax on
//   pension + worksheet − deductions, to the dollar. That resolves taxable SS to about $10 at the
//   10% rate — far finer than the defect (up to $1,838 single / $2,463 joint) — but it is not "to
//   the cent", and cells with no taxable income carry no information; section C counts those out.
//   Engines B and C are read directly and compared to the cent.
//
// HAND CHECKS (worked from the worksheet, not from the oracle below; single, born 1958, 2026,
// deductions 16,100 + 2,050 = 18,150; 10% to 12,400 then 12%):
//   A-1  SS 6,000, pension 32,000: line 7 = 35,000; line 9 = 10,000; line 11 = 1,000; line 13 = 4,500;
//        line 14 = min(3,000, 4,500) = 3,000; line 15 = 850; line 18 = min(3,850, 5,100) = 3,850.
//        Tax on 32,000 + 3,850 − 18,150 = 17,700 → 1,240 + 0.12 × 5,300 = 1,876.
//        Engine A through v5.76 used 0.5 × min(10,000, 9,000) + 850 = 5,350 → capped 5,100 → 2,026.
//   A-2  SS 8,000, pension 31,000: line 14 = min(4,000, 4,500) = 4,000; + 850 = 4,850 (cap 6,800).
//        31,000 + 4,850 − 18,150 = 17,700 → 1,876. v5.76: 5,350 → 18,200 → 1,936.
//   D-1  single, SS 60,000, pension 62,500: line 7 = 92,500; line 11 = 58,500 → line 15 = 49,725;
//        line 14 = min(30,000, 4,500) = 4,500; line 16 = 54,225 > line 17 = 51,000 → 51,000.
//        MAGI = 62,500 + 51,000 = 113,500. With the joint amounts (v5.76's Engine C): line 11 = 48,500
//        → 41,225; line 14 = 6,000; 47,225 → MAGI 109,725. The TIER and the $1,150 lifetime surcharge
//        are MEASURED engine output (IRMAA tables and lookback), pinned, not hand-derived.
//
// GATED PER LEG (OPERATIONS §B2). The v576 leg asserts what was true for v5.76, as dated
// [KNOWN DEFECT 2026-09-24] pins; it is the before/after witness for this release.
import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2];
const KNOWN_VERSIONS = ["v576", "v577"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.\n    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST = VER === "v577";

// Optional third argument: a module path, for the negative controls (qa/tools/controls_v577_ss86.py). The parser
// check reads the .jsx beside it, so a control's mutant is what the structural check sees too.
const MODPATH = process.argv[3] || `./app_${VER}.mjs`;
const mod = await import(MODPATH);
const G = mod.__g, E = mod.__engines;
const EXAMPLE = JSON.parse(JSON.stringify(G.PORTFOLIO()));   // captured before section A replaces the portfolio

let pass = 0, fail = 0; const fails = [];
const T = (name, got, exp) => { const ok = typeof exp === "number" ? Math.abs(got - exp) < 0.005 : got === exp;
  if (ok) pass++; else { fail++; fails.push(`  \u2717 ${name}: got ${got}  exp ${exp}`); } };
const OK = (name, cond, detail = "") => { if (cond) pass++; else { fail++; fails.push(`  \u2717 ${name}${detail ? " — " + detail : ""}`); } };
console.log(`t43 — ONE §86 RULE FOR EVERY ENGINE (${VER})`);

// ── the two independent oracles ────────────────────────────────────────────────────────────────
const worksheet = (L1, L3, joint) => {                 // lines 4 and 6 are zero for these households
  const L2 = 0.5 * L1, L7 = L2 + L3, L8 = joint ? 32000 : 25000;
  if (!(L8 < L7)) return 0;                            // line 9: "Is line 8 less than line 7?" No → 0
  const L9 = L7 - L8, L10 = joint ? 12000 : 9000;
  const L11 = Math.max(0, L9 - L10), L12 = Math.min(L9, L10), L13 = 0.5 * L12, L14 = Math.min(L2, L13);
  const L15 = 0.85 * L11, L16 = L14 + L15, L17 = 0.85 * L1;
  return Math.min(L16, L17);                           // line 18
};
const statute = (ss, other, joint) => {                // §86(a)(1) and (a)(2), §86(c) amounts
  const base = joint ? 32000 : 25000, adj = joint ? 44000 : 34000, prov = other + ss / 2;
  const a1 = Math.min(ss / 2, Math.max(0, prov - base) / 2);
  if (prov <= adj) return a1;
  return Math.min(0.85 * ss, 0.85 * (prov - adj) + Math.min(a1, (adj - base) / 2));
};

// ── A · Engine A's worked cases (the audit probe's household) ─────────────────────────────────
G.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const baseA = (o) => ({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2026, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1958, dobBYr: 1958, survivor: "A", deathYr1: 2099, ssA: 0, ssB: 0, ssAYr: 2025, ssAMo: 1, ssBYr: 2025, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
  tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const taxA = (ss, pen, joint) => G.runRothStrategies(baseA({ single: !joint, ssA: ss / 12, pen: pen / 12 })).find(x => x.key === "none").totTax;
if (POST) {
  T("A-1 Engine A, SS 6,000 / pension 32,000: tax $1,876 (worksheet, hand-checked)", taxA(6000, 32000, false), 1876);
  T("A-2 Engine A, SS 8,000 / pension 31,000: tax $1,876 (hand-checked)", taxA(8000, 31000, false), 1876);
} else {
  T("A-1 [KNOWN DEFECT 2026-09-24, C-4] Engine A overstates by $150: tax $2,026", taxA(6000, 32000, false), 2026);
  T("A-2 [KNOWN DEFECT 2026-09-24, C-4] Engine A overstates by $60: tax $1,936", taxA(8000, 31000, false), 1936);
}
T("A-3 control (85% cap binds), SS 6,000 / pension 34,000: $2,266 on every leg", taxA(6000, 34000, false), 2266);
T("A-4 control (large benefits), SS 24,000 / pension 40,000: $4,750 on every leg", taxA(24000, 40000, false), 4750);

// ── B · the helper against both oracles, across every border ──────────────────────────────────
const H = G.taxableSS86;
const SS = [0, 1, 2999.99, 3000, 6000, 8000, 8999, 9000, 9001, 11999, 12000, 12001, 15600, 18000, 24000, 36000, 55200, 80000];
const OTH = [0, 5000, 12345.67, 20000, 24999, 25000, 28000, 30000, 31999.5, 34000, 38000, 44000, 50000, 62500, 90000, 150000];
const cells = [];
for (const joint of [false, true]) {
  const base = joint ? 32000 : 25000, adj = joint ? 44000 : 34000;
  for (const ss of SS) {
    const extra = [base, adj].flatMap(t => [t - ss / 2 - 1, t - ss / 2, t - ss / 2 + 0.01, t - ss / 2 + 1]);
    // where line 16 meets line 17 (the 85% cap starts to bind), and a dollar either side
    const l14 = Math.min(ss / 2, (adj - base) / 2), capP = adj + (0.85 * ss - l14) / 0.85;
    if (capP > adj) extra.push(capP - ss / 2 - 1, capP - ss / 2, capP - ss / 2 + 1);
    for (const o of [...OTH, ...extra]) if (o >= 0) cells.push([ss, o, joint]);
  }
}
let agreeOr = 0; const region = { none: 0, middle: 0, limbBinds: 0, capBinds: 0, upperOther: 0 };
for (const [ss, o, j] of cells) {
  const w = worksheet(ss, o, j), s = statute(ss, o, j); if (Math.abs(w - s) < 1e-9) agreeOr++;
  const base = j ? 32000 : 25000, adj = j ? 44000 : 34000, prov = o + ss / 2;
  if (prov <= base) region.none++; else if (prov <= adj) region.middle++;
  else if (w === 0.85 * ss) region.capBinds++; else if (ss / 2 < (adj - base) / 2) region.limbBinds++; else region.upperOther++;
}
T("B-0 the worksheet and statute oracles agree on every cell (the reference is sound)", agreeOr, cells.length);
for (const k of Object.keys(region)) OK(`B-0 the sweep reaches the ${k} region (no border left unpriced)`, region[k] > 0, `${region[k]} cells`);
if (POST) {
  OK("B-1 taxableSS86 is exported by this build", typeof H === "function");
  let bad = 0, worst = 0, ex = "";
  for (const [ss, o, j] of cells) { const d = Math.abs(H(ss, o, !j) - worksheet(ss, o, j)); if (d >= 0.005) { bad++; if (d > worst) { worst = d; ex = `SS ${ss}, other ${o}, ${j ? "joint" : "single"}`; } } }
  OK(`B-2 taxableSS86 = the worksheet to the cent on all ${cells.length} cells, single and joint`, bad === 0, `${bad} disagree, worst ${worst.toFixed(2)} at ${ex}`);
  T("B-3 line 14 binds: single SS 6,000 / other 32,000 → 3,850 (not 5,100)", H(6000, 32000, true), 3850);
  T("B-4 line 14 binds: joint SS 8,000 / other 42,000 → 4,850", H(8000, 42000, false), worksheet(8000, 42000, true));
  T("B-5 at the base amount exactly (single, provisional 25,000) nothing is taxable", H(10000, 20000, true), 0);
} else {
  OK("B-1 [pre-v5.77] no shared §86 helper exists on this build (four private copies)", typeof H === "undefined");
}

// ── C · Engines A, B and C on one grid, against the worksheet ─────────────────────────────────
const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
const load = (S, P, joint) => { const X = JSON.parse(JSON.stringify(BASE));
  Object.assign(X, { positions: [], otherAccounts: [], stateCode: null, _incomeFromForm: true, single: !joint,
    dobA: "1958-01-01", dobB: "1958-01-01", lifeExpA: 95, lifeExpB: 95,
    incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
  X.incomeSources = { ...X.incomeSources, pension: { amount: P / 12 },
    ssA: { tableByAge: {}, planned: S / 12, plannedAge: 62 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 62 } };
  G.applyLoadedData({ portfolio: X }); };
const TC = G.TAX_CONSTS();
const ordTax = (ti, joint) => { let t = 0, lo = 0; for (const b of joint ? TC.MFJ_BR : TC.SGL_BR) { const up = b.upper == null ? Infinity : b.upper;
  if (ti > lo) t += (Math.min(ti, up) - lo) * b.rate; lo = up; } return t; };
const dedA = (joint) => joint ? TC.MFJ_STD + 2 * TC.SENIOR_EXTRA_MFJ : TC.SGL_STD + TC.SENIOR_EXTRA_SGL;   // both 68 in 2026; Engine A omits the OBBBA bonus
const AA = { retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0 };
let n = 0, bB = 0, bC = 0, wC = 0, bCj = 0, bA = 0, infoA = 0, overA = 0, infoLimbA = 0;
for (const joint of [false, true]) for (const S of [3000, 6000, 8000, 9000, 11000, 12500, 20000, 40000])
  for (const P of [10000, 20000, 25000, 28000, 30000, 32000, 34000, 38000, 44000, 60000]) {
    load(S, P, joint); n++;
    const b = E.computeTaxPlan(AA).rows.find(r => r.yr === 2026), c = E.computeIrmaaPlan(AA).rows.find(r => r.yr === 2026);
    const law = worksheet(b.ssTotal, P, joint);
    if (Math.abs(b.ssTaxable - law) >= 0.005) bB++;
    const dC = Math.abs((c.magi - P) - law);             // Engine C: MAGI minus the only other income
    if (dC >= 0.005) { bC++; wC = Math.max(wC, dC); if (joint) bCj++; }
    const ti = P + law - dedA(joint);
    if (ti > 0) {                                        // a cell with no taxable income says nothing about Engine A
      infoA++; const a = taxA(S, P, joint), exp = Math.round(ordTax(ti, joint));
      if (worksheet(S, P, joint) < 0.85 * S && S / 2 < (joint ? 6000 : 4500) && P + S / 2 > (joint ? 44000 : 34000)) infoLimbA++;
      if (a !== exp) { bA++; if (a > exp) overA++; }
    }
  }
console.log(`  measured: sweep ${cells.length} cells ${JSON.stringify(region)} | grid: B off ${bB}, C off ${bC} (joint ${bCj}, worst ${wC.toFixed(2)}), A informative ${infoA} (line-14 ${infoLimbA}), A off ${bA} (over ${overA})`);
T("C-0 the grid is 160 households (8 benefits × 10 pensions × 2 filing statuses)", n, 160);
T("C-1 Engine B = the worksheet on all 160, to the cent (correct since v5.45)", bB, 0);
OK("C-2 Engine A is measurable on this grid (cells with taxable income, including line-14 cells)", infoA >= 100 && infoLimbA > 0, `${infoA} informative, ${infoLimbA} where line 14 binds`);
if (POST) {
  T("C-3 Engine C = the worksheet on all 160, single AND joint, to the cent (D-5)", bC, 0);
  T("C-4 Engine A's tax = tax on the worksheet's figure, to the dollar, on every informative cell", bA, 0);
} else {
  T("C-3 [KNOWN DEFECT 2026-09-24, §1f] Engine C disagrees on 55 cells", bC, 55);
  T("C-3a [KNOWN DEFECT §1f] every disagreement is a SINGLE household (joint 80/80 agree)", bCj, 0);
  T("C-3b [KNOWN DEFECT §1f] worst disagreement $7,000 of taxable SS", Math.round(wC), 7000);
  OK("C-4 [KNOWN DEFECT 2026-09-24, C-4] Engine A disagrees on some cells, and only by OVERSTATING", bA > 0 && overA === bA, `${bA} disagree, ${overA} over`);
}

// C-5 · Engine A where line 14 BINDS — the region C-4 lives in. It is NARROW: from the adjusted base to
// the point where the 85% cap takes over, i.e. provisional income adj … adj + (0.85 − 0.5)/0.85 × SS
// (about 0.41 × benefits wide — $412 of pension for a $1,000 benefit). A pension grid in round steps
// jumps straight over it (a first draft of this section did, and reached 2 cells), so the cells are
// PLACED inside it, at fixed fractions of its width, for benefits under the line-10 half-gap.
{ let cellsL = 0, badL = 0, overL = 0, inRegion = 0, oldMatch = 0;
  // Engine A's pre-v5.77 upper tier, transcribed so the v576 leg can assert the defect's exact shape.
  const oldA = (ss, o, j) => { const t1 = j ? 32000 : 25000, t2 = j ? 44000 : 34000, p = o + 0.5 * ss;
    if (p <= t1) return 0; if (p <= t2) return Math.min(0.5 * (p - t1), 0.5 * ss);
    return Math.min(0.85 * ss, 0.5 * Math.min(p - t1, t2 - t1) + 0.85 * (p - t2)); };
  const G5 = [[false, [1000, 2500, 4000, 5500, 7000, 8500, 8990]], [true, [1000, 3000, 5000, 7000, 9000, 11000, 11990]]];
  for (const [joint, SSs] of G5) for (const S of SSs) for (const f of [0.05, 0.25, 0.5, 0.75, 0.95]) {
    const adj = joint ? 44000 : 34000, P = Math.round(adj - S / 2 + f * (0.35 / 0.85) * S);
    const law = worksheet(S, P, joint), ti = P + law - dedA(joint); if (ti <= 0) continue;
    cellsL++; if (P + S / 2 > adj && S / 2 < (joint ? 6000 : 4500) && law < 0.85 * S) inRegion++;
    const a = taxA(S, P, joint), exp = Math.round(ordTax(ti, joint)); if (a !== exp) { badL++; if (a > exp) overL++; }
    if (a === Math.round(ordTax(P + oldA(S, P, joint) - dedA(joint), joint))) oldMatch++; }
  console.log(`  measured: Engine A line-14 grid ${cellsL} cells (${inRegion} inside the region), off ${badL} (over ${overL})`);
  T("C-5 the line-14 grid: 70 cells, every one inside the region where line 14 binds", `${cellsL}/${inRegion}`, "70/70");
  if (POST) T("C-5 Engine A's tax = tax on the worksheet's figure on every line-14 cell, single and joint", badL, 0);
  // 66, not 70: the four cells with benefits $10 under the half-gap ($8,990 single, $11,990 joint)
  // overstate taxable SS by exactly $5.00 — at most 60 cents of tax, which rounds to the same dollar.
  // Measured at the v5.77 build; a first draft of this pin said 60, typed before the run.
  else { T("C-5 [KNOWN DEFECT 2026-09-24, C-4] Engine A's tax is wrong on 66 of the 70 cells (measured)", badL, 66);
         T("C-5 [KNOWN DEFECT C-4] …and on ALL 70 it equals the tax on the pre-v5.77 formula (the defect's exact shape)", oldMatch, 70);
         T("C-5 [KNOWN DEFECT C-4] …and every one is an OVERSTATEMENT (pessimistic)", overL, badL); }
}

// ── D · the IRMAA consequence of §1f (Engine C, single household) ─────────────────────────────
load(60000, 62500, false); { const C = E.computeIrmaaPlan(AA), r = C.rows.find(x => x.yr === 2026);
  if (POST) {
    T("D-1 single SS 60,000 / pension 62,500: MAGI 113,500 (hand-checked)", Math.round(r.magi), 113500);
    T("D-2 …which is tier 1 (measured)", r.tier, 1);
    T("D-3 …and $1,150 of lifetime IRMAA (measured)", Math.round(C.totalIrmaa), 1150);
  } else {
    T("D-1 [KNOWN DEFECT §1f] MAGI 109,725 — joint thresholds on a single return", Math.round(r.magi), 109725);
    T("D-2 [KNOWN DEFECT §1f] tier 0", r.tier, 0);
    T("D-3 [KNOWN DEFECT §1f] no surcharge", Math.round(C.totalIrmaa), 0);
  } }

// ── F · §1f on a realistic household: the shipped example, made SINGLE ────────────────────────
// Added at the build, after measuring that v5.77 raises this household's Engine C MAGI in eight years
// while t6 and t42 — which both run it — stayed green on both legs: they compare cases or pin other
// outputs, so neither witnesses §1f. Where the 85% cap binds under NEITHER pair of thresholds, the single
// form minus the joint form is [0.85(p − 34,000) + 4,500] − [0.85(p − 44,000) + 6,000] = 8,500 − 1,500
// = $7,000 exactly, whatever p is — so the two legs' pins below differ by exactly $7,000 (hand-derived);
// the figures themselves are measured. 2030 and 2039 are controls: unchanged on both legs.
{ const X = JSON.parse(JSON.stringify(EXAMPLE)); X.single = true; G.applyLoadedData({ portfolio: X });
  const RY = G.PLAN_TIMELINE().targetRetireYear, AF = { retireYear: RY, rothAmount: 0, qcdAnnual: 0, taxYield: 0, scenarioPreset: "base" };
  const S = G.withdrawalPlanSeries(AF), C = E.computeIrmaaPlan({ ...AF, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr });
  const mg = (y) => Math.round(C.rows.find(x => x.yr === y).magi * 100) / 100;
  T(`F-1 example made single, 2032 Engine C MAGI${POST ? "" : " [KNOWN DEFECT §1f — $7,000 low]"}`, mg(2032), POST ? 78768.81 : 71768.81);
  T(`F-2 example made single, 2038 Engine C MAGI${POST ? "" : " [KNOWN DEFECT §1f — $7,000 low]"}`, mg(2038), POST ? 79751.88 : 72751.88);
  T("F-3 control: 2030 unchanged on every leg", mg(2030), 79075.84);
  T("F-4 control: 2039 unchanged on every leg (the 85% cap binds under either pair)", mg(2039), 109408.26);
  T("F-5 lifetime IRMAA $0 on every leg — on this household the correction moves MAGI, not the surcharge", Math.round(C.totalIrmaa), 0);
}

// ── E · structural extinction, by parser (census.cjs, tested by t21) ──────────────────────────
// The census reads the testable copy app_<ver>.jsx (source + test shim; the shim reads no threshold).
const TOOL = [join(HERE, "tools", "census.cjs"), join(HERE, "census.cjs")].find(p => existsSync(p));
OK("E-0 census.cjs is present (qa/tools/, or beside the suites in the flat pool)", !!TOOL);
if (TOOL) {
  const outer = (name, kind) => execFileSync("node", [TOOL, join(HERE, MODPATH.replace(/\.mjs$/, ".jsx")), name, `--kind=${kind}`], { encoding: "utf8" })
    .split("\n").filter(l => /^L\s*\d+/.test(l)).map(l => { const cols = l.replace(/^L\s*\d+\s+\S+\s+/, "").split(/\s{2,}/)[0].split(" < ");
      return cols[cols.length - 1].split("@")[0]; });
  const readers = [...outer("ssThr1", "prop"), ...outer("ssThr2", "prop")];
  if (POST) {
    OK("E-1 the §86 thresholds are read ONLY inside taxableSS86 (a fifth private copy fails here)",
      readers.length > 0 && readers.every(f => f === "taxableSS86"), [...new Set(readers)].join(","));
    const callers = new Set(outer("taxableSS86", "ident").filter(f => f !== "taxableSS86"));
    for (const f of ["runRothStrategies", "computeIrmaaPlan", "computeTaxPlan", "DangerCloseMain"])
      OK(`E-2 ${f} calls the shared helper`, callers.has(f), [...callers].join(","));
    T("E-3 Engine A's private ssTaxF is gone", outer("ssTaxF", "any").length, 0);
  } else {
    const fns = [...new Set(readers)].sort().join(",");
    T("E-1 [pre-v5.77] the thresholds are read in four functions — the four copies", fns, "DangerCloseMain,computeIrmaaPlan,computeTaxPlan,runRothStrategies");
  }
}

console.log(fails.join("\n"));
console.log(`\nt43 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
