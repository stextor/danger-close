// t64 — D-22 OPTION 3, BATCH 1: TEN STATES ON THEIR OWN BRACKET SCHEDULES · docs/SCOPE_D22_BRACKETS_V600.md · v6.00
//
// Through v5.99 every state was taxed at ONE rate on the whole base: a statutory flat rate where the state has one, and elsewhere either
// the top rate (OK) or an "effective" rate of the model's own making (CA 6 %, NY 6 %, NJ 5.5 %, OR 8 %, ...). v6.00 gives a row a
// `brackets` field — the state's own schedule, single and joint — and the calculator taxes that row on it. Ten states, each schedule read
// at its primary source on 2026-10-09 (the scope's §0 cites each):
//   CA TY2025 Schedules X/Y (FTB; TY2026 unpublished) + the 1 % Behavioral Health Services Tax over $1,000,000 · MN TY2026 (MN DOR) ·
//   MS 0 % to $10,000, 4 % above (Miss. Code §27-7-5) · NJ N.J.S.A. 54A:2-1 (not indexed) · NY TY2026 (IT-2105-I) with the recapture ·
//   OK HB 2764 · OR TY2026 (OR-ESTIMATE) · SC Act 110 of 2026 · VA §58.1-320 (one schedule for every status) · WI TY2026 (Form 1-ES).
//
// Groups:  A the schedules — each equals its source; EXTINCTION over all rows: ascending, last row open, `rate` = the top rate
//          B each schedule against the state's PRINTED table (base + rate × excess): exact where the state prints cents; within $1 where
//            it rounds (NY, OR); New Jersey's joint $70,000-$80,000 row is the one place the statute is 50 cents above its own arithmetic
//          C hand cases to the cent through stateTaxAnnual, each computed independently (Decimal, from the printed tables) — the v599 leg
//            pins the flat-rate figures; New York's recapture worksheet, its boundaries, and a survivor's single schedule
//          D v5.99 -> v6.00 (v600 leg, needs app_v599.mjs): outside the ten the calculator is byte-identical; inside, it equals an
//            independent bracket implementation
//          E the display: My Data names the schedule and its year for a bracket state, keeps "effective rate" for the others; the AI
//            context line says "brackets"; the Field Manual's three sentences, each held to the code fact that makes it true
// BOTH LEGS. Run: node t64_state_brackets.mjs <tag>
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
import { d30Pins } from "./d30_ref.mjs";
import { existsSync, readFileSync } from "fs";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v599", "v600", "v601", "v602"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 260) : ""}`); } };
const EQ = (n, got, want, tol = 0.005) => CK(n + D30.tag(), typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, want ${want}`);
const done = () => { console.log(`\nt64 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t64 — STATE BRACKET SCHEDULES (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const BR = VER !== "v599";
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const g = window.__g, SR = g.STATE_RULES();
// v6.02 (D-30 batch 1 — docs/SCOPE_D30_DEDUCTIONS_V602.md, DD-14): the ten take their deductions, exemptions and credits. §C keeps each
// case's BASE (written beside it below) and on a D-30 leg expects it after them — qa/d30_ref.mjs, independent of the app, on the calculator's
// own record of the call; a different base fails. §E's display and Field Manual checks take the v6.02 forms (t66 F holds them). A version LIST.
const D30L = ["v602"].includes(VER), D30 = d30Pins((a) => g.stateTaxAnnual(a), SR, D30L), ST = D30.S;
const TEN = ["CA", "MN", "MS", "NJ", "NY", "OK", "OR", "SC", "VA", "WI"];

// ── A · the schedules ──
// Transcribed from the sources the header names (upper bounds inclusive: "not over"). CA's last two rows are Schedule X/Y's top row split
// at $1,000,000 by the Behavioral Health Services Tax (R&TC §17043: 1 % of taxable income over $1,000,000, every filing status).
const S = {
  CA: { single: [[11079, .01], [26264, .02], [41452, .04], [57542, .06], [72724, .08], [371479, .093], [445771, .103], [742953, .113], [1000000, .123], [null, .133]],
        joint: [[22158, .01], [52528, .02], [82904, .04], [115084, .06], [145448, .08], [742958, .093], [891542, .103], [1000000, .113], [1485906, .123], [null, .133]], year: 2025 },
  MN: { single: [[33310, .0535], [109430, .068], [203150, .0785], [null, .0985]], joint: [[48700, .0535], [193480, .068], [337930, .0785], [null, .0985]], year: 2026 },
  MS: { single: [[10000, 0], [null, .04]], joint: [[10000, 0], [null, .04]], year: 2026 },
  NJ: { single: [[20000, .014], [35000, .0175], [40000, .035], [75000, .05525], [500000, .0637], [1000000, .0897], [null, .1075]],
        joint: [[20000, .014], [50000, .0175], [70000, .0245], [80000, .035], [150000, .05525], [500000, .0637], [1000000, .0897], [null, .1075]], year: 2026 },
  NY: { single: [[8500, .039], [11700, .044], [13900, .0515], [80650, .054], [215400, .059], [1077550, .0685], [5000000, .0965], [25000000, .103], [null, .109]],
        joint: [[17150, .039], [23600, .044], [27900, .0515], [161550, .054], [323200, .059], [2155350, .0685], [5000000, .0965], [25000000, .103], [null, .109]], year: 2026 },
  OK: { single: [[3750, 0], [4900, .025], [7200, .035], [null, .045]], joint: [[7500, 0], [9800, .025], [14400, .035], [null, .045]], year: 2026 },
  OR: { single: [[4550, .0475], [11400, .0675], [125000, .0875], [null, .099]], joint: [[9100, .0475], [22800, .0675], [250000, .0875], [null, .099]], year: 2026 },
  SC: { single: [[30000, .0199], [null, .0521]], joint: [[30000, .0199], [null, .0521]], year: 2026 },
  VA: { single: [[3000, .02], [5000, .03], [17000, .05], [null, .0575]], joint: [[3000, .02], [5000, .03], [17000, .05], [null, .0575]], year: 2026 },
  WI: { single: [[15110, .035], [51950, .044], [332720, .053], [null, .0765]], joint: [[20150, .035], [69260, .044], [443630, .053], [null, .0765]], year: 2026 },
};
const OLD_RATE = { CA: 0.06, MN: 0.068, MS: 0.04, NJ: 0.055, NY: 0.06, OK: 0.045, OR: 0.08, SC: 0.06, VA: 0.0575, WI: 0.053 };
const withB = Object.keys(SR).filter(c => SR[c].brackets !== undefined).sort();
if (BR) {
  // v6.01 (D-22 batch 2) puts seventeen more rows on schedules; t65 A-1 pins the full set of twenty-seven. A LIST.
  if (["v600"].includes(VER)) CK(`A-1 exactly the ten rows carry a schedule (${withB.join(",")})`, withB.join(",") === TEN.join(","), withB.join(","));
  else CK(`A-1 the ten carry a schedule, among the ${withB.length} that do from v6.01 (t65 A-1 pins the set)`, TEN.every(c => withB.includes(c)), withB.join(","));
  for (const c of TEN) {
    const b = SR[c].brackets || {};
    CK(`A-2${c} ${SR[c].name}: single and joint schedules equal the source (${S[c].single.length} / ${S[c].joint.length} rows), dated ${S[c].year}`,
       JSON.stringify(b.single) === JSON.stringify(S[c].single) && JSON.stringify(b.joint) === JSON.stringify(S[c].joint) && SR[c].years && SR[c].years.brackets === S[c].year,
       JSON.stringify({ b, y: SR[c].years }).slice(0, 200));
  }
  CK("A-3 New York's recapture: from New York AGI $107,650 over $50,000, flat 5.9 % single to $215,400 / 5.4 % joint to $161,550 (IT-2105-I 2026 worksheets)",
     JSON.stringify(SR.NY.recapture) === JSON.stringify({ start: 107650, width: 50000, flat: { single: 0.059, joint: 0.054 }, flatUpTo: { single: 215400, joint: 161550 } }), JSON.stringify(SR.NY.recapture));
  CK("A-4 no other row carries a recapture", Object.keys(SR).filter(c => SR[c].recapture !== undefined).join(",") === "NY");
} else {
  CK("A-1 PIN v5.99: no row carries a schedule; the ten rates are v5.99's single rates", withB.length === 0 && TEN.every(c => SR[c].rate === OLD_RATE[c]), withB.join(","));
}
// EXTINCTION over every row that carries one (vacuous on v5.99 by construction; A-1 pins the set)
const shapeBad = [];
for (const c of withB) for (const k of ["single", "joint"]) {
  const rows = SR[c].brackets[k];
  if (!Array.isArray(rows) || rows.length < 2) { shapeBad.push(`${c}.${k} not a schedule`); continue; }
  rows.forEach(([u, r], i) => {
    if (i < rows.length - 1 && !(Number.isFinite(u) && u > (i ? rows[i - 1][0] : 0))) shapeBad.push(`${c}.${k}[${i}] upTo ${u} not ascending`);
    if (i === rows.length - 1 && u !== null) shapeBad.push(`${c}.${k} last row is not open`);
    if (!(r >= 0 && r < 0.2)) shapeBad.push(`${c}.${k}[${i}] rate ${r}`);
    if (i && r < rows[i - 1][1]) shapeBad.push(`${c}.${k}[${i}] rate falls`);
  });
  // v6.01: Maryland's `rate` is its top bracket plus its county rate (`local`); every other row's `local` is absent, so this is v6.00's test there.
  if (Math.abs(rows[rows.length - 1][1] + (SR[c].local || 0) - SR[c].rate) > 1e-12) shapeBad.push(`${c}.${k} top ${rows[rows.length - 1][1]} (+ local ${SR[c].local || 0}) != rate ${SR[c].rate}`);
}
CK(`A-5 EXTINCTION: every schedule ascends, its rates never fall, its last row is open, and its top rate (plus any county rate) IS the row's \`rate\` (${withB.length} rows)`, shapeBad.length === 0, shapeBad.join(" · "));
if (BR) {
  const RATE_CLAIM = /(\d+(?:\.\d+)?)\s?%\s*(?:flat\s+)?(?:for|effective|from)\s+(20\d\d)/;
  const silent = TEN.filter(c => !RATE_CLAIM.test(SR[c].note || "") || Math.abs(Number(SR[c].note.match(RATE_CLAIM)[1]) / 100 - SR[c].rate) > 1e-9);
  CK("A-6 each of the ten notes states its top rate for its year (t61 A-5 checks the value table-wide)", silent.length === 0, silent.join(","));
  const own = TEN.filter(c => c !== "MS" && c !== "OK" && !/own brackets/.test(SR[c].note));
  CK("A-7 eight notes say the state's own brackets are used; OK's says all three brackets are modelled; MS's names its untaxed $10,000",
     own.length === 0 && /all modelled from v6\.00/.test(SR.OK.note) && /first \$10,000 of taxable income is untaxed \(Miss\. Code §27-7-5\), modelled from v6\.00 as one band per return/.test(SR.MS.note), own.join(","));
  CK("A-8 the known simplifications are named in the notes: CA's 2025 schedule, NY's recapture end point, NJ's 50 cents, VA's one schedule, MS's band per return",
     /TY2025 Schedules X and Y/.test(SR.CA.note) && /phases it in over \$50,000 \(conservative\)/.test(SR.NY.note) && /50 cents is not modelled/.test(SR.NJ.note)
     && /one schedule for single and married returns/.test(SR.VA.note) && /one band per spouse, which is not modelled \(conservative\)/.test(SR.MS.note));
  CK("A-9 Oklahoma's note no longer claims the top-rate overstatement", !/\$214\.75/.test(SR.OK.note), SR.OK.note);
}

// ── B · each schedule against the state's printed table ──
// [threshold, printed base] pairs — the tax the state prints at each bracket's start. The model's schedule must reproduce them.
const sum = (rows, x) => { let t = 0, lo = 0; for (const [u, r] of rows) { const hi = u === null ? Infinity : u; if (x <= lo) break; t += (Math.min(x, hi) - lo) * r; lo = hi; } return t; };
const PRINTED = {
  CA: { tol: 0.02, single: [[11079, 110.79], [26264, 414.49], [41452, 1022.01], [57542, 1987.41], [72724, 3201.97], [371479, 30986.19], [445771, 38638.27], [742953, 72219.84]],
        joint: [[22158, 221.58], [52528, 828.98], [82904, 2044.02], [115084, 3974.82], [145448, 6403.94], [742958, 61972.37], [891542, 77276.52], [1485906, 144439.65 + 4859.06]] },
  WI: { tol: 0.006, single: [[15110, 528.85], [51950, 2149.81], [332720, 17030.62]], joint: [[20150, 705.25], [69260, 2866.09], [443630, 22707.70]] },
  NY: { tol: 1, single: [[8500, 332], [11700, 473], [13900, 586], [80650, 4191], [215400, 12141], [1077550, 71198], [5000000, 449714], [25000000, 2509714]],
        joint: [[17150, 669], [23600, 953], [27900, 1174], [161550, 8391], [323200, 17928], [2155350, 143430], [5000000, 417939], [25000000, 2477939]] },
  OR: { tol: 1, single: [[4550, 216], [11400, 678], [125000, 10618]], joint: [[9100, 432], [22800, 1357], [250000, 21237]] },
  OK: { tol: 0.006, single: [[4900, 28.75], [7200, 109.25]], joint: [[9800, 57.50], [14400, 218.50]] },
  // NJ prints "multiply by r, subtract k": the base at a threshold t is r·t − k of the row that starts there
  NJ: { tol: 0.006, single: [[20000, .0175 * 20000 - 70], [35000, .035 * 35000 - 682.5], [40000, .05525 * 40000 - 1492.5], [75000, .0637 * 75000 - 2126.25], [500000, .0897 * 500000 - 15126.25], [1000000, .1075 * 1000000 - 32926.25]],
        joint: [[20000, .0175 * 20000 - 70], [50000, .0245 * 50000 - 420], [80000, .05525 * 80000 - 2775], [150000, .0637 * 150000 - 4042.5], [500000, .0897 * 500000 - 17042.5], [1000000, .1075 * 1000000 - 34842.5]] },
  SC: { tol: 0.006, single: [[30000, .0521 * 30000 - 966]], joint: [[30000, .0521 * 30000 - 966]] },
};
// CA's joint Schedule Y top row starts at $1,485,906, above the $1,000,000 BHST line: the printed base there excludes the 1 % on the $485,906 above
// $1,000,000 ($4,859.06), which the model's combined schedule carries — so the printed base is lifted by exactly that amount above.
if (BR) {
  for (const [c, P] of Object.entries(PRINTED)) {
    const off = []; let worst = 0;
    for (const k of ["single", "joint"]) for (const [t, base] of P[k]) { const d = Math.abs(sum(SR[c].brackets[k], t) - base); worst = Math.max(worst, d); if (d > P.tol) off.push(`${k} ${t}: model ${sum(SR[c].brackets[k], t).toFixed(2)} printed ${base.toFixed(2)}`); }
    CK(`B-${c} the schedule reproduces ${c}'s printed bases ${P.tol < 0.01 ? "to the cent" : P.tol < 1 ? "within 2 cents (California rounds each base to the cent from its unrounded sum)" : "within $1 (the state rounds them)"} — largest gap $${worst.toFixed(2)}`, off.length === 0, off.join(" · "));
  }
  // New Jersey's one anomaly: the statute's joint $70,000-$80,000 row is "$1,295.50 plus 3.500% of the excess over $70,000" (Division of Taxation:
  // ".035, subtract $1,154.50"), where its own lower rows sum to $1,295.00. The model is the bracket sum, 50 cents below inside that row only.
  const nj = SR.NJ.brackets.joint;
  EQ("B-NJ2 New Jersey joint $75,000: the model's $1,470.00 is the statute's $1,470.50 less its 50-cent anomaly (disclosed in the note)", sum(nj, 75000), 0.035 * 75000 - 1154.5 - 0.5);
  EQ("B-NJ3 …and at $80,000 the statute returns to its own arithmetic: the model equals .05525 × $80,000 − $2,775", sum(nj, 80000), 0.05525 * 80000 - 2775);
}

// ── C · hand cases to the cent through stateTaxAnnual ──
// Each figure computed independently from the printed tables (Decimal arithmetic, session working /tmp/claude-0/sp/hand.py, recorded in the
// scope's §3); the v599 leg pins v5.99's single-rate figure for the same call.
const call = (code, o) => ST({ code, retIncome: 0, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: 66, ageB: null, single: true, ...o });
const J = { ageB: 66, single: false };
const HC = [
  // [label, code, args, v6.00 hand figure, v5.99 pin]
  ["CA single 66, IRA $60,000 — $1,987.41 + 8 % × $2,458", "CA", { retIncome: 60000 }, 2184.05, 3600],
  ["CA joint 66/66, IRA $1,200,000 — Schedule Y $112,132.274 + BHST 1 % × $200,000", "CA", { retIncome: 1200000, ...J }, 114132.274, 72000],
  ["CA single 66, IRA $800,000 — below the BHST line: the bracket sum $72,219.827 (printed $72,219.84, rounded) + 12.3 % × $57,047", "CA", { retIncome: 800000 }, 79236.608, 48000],
  ["MN single 66, IRA $40,000 — 5.35 % × $33,310 + 6.8 % × $6,690", "MN", { retIncome: 40000 }, 2237.005, 2720],
  ["MN joint 66/66, IRA $250,000 — three brackets", "MN", { retIncome: 250000, ...J }, 16887.31, 17000],
  ["MS single 45, wages $40,000 — the first $10,000 untaxed, 4 % above", "MS", { work: 40000, ageA: 45 }, 1200, 1600],
  ["NJ joint 66/66, pension $250,000 (above the exclusion's $150,000 cliff) — .0637 × $250,000 − $4,042.50", "NJ", { pen: 250000, ...J }, 11882.5, 13750],
  ["NJ single 66, wages $60,000 — .05525 × $60,000 − $1,492.50", "NJ", { work: 60000 }, 1822.5, 3300],
  ["OK single 66, IRA $50,000 — $10,000 excluded; $109.25 + 4.5 % × $32,800", "OK", { retIncome: 50000 }, 1585.25, 1800],
  ["OK joint 65/65, IRA $100,000 — $20,000 excluded; $218.50 + 4.5 % × $65,600", "OK", { retIncome: 100000, ageA: 65, ageB: 65, single: false }, 3170.5, 3600],
  ["OR joint 66/66, IRA $60,000 — $1,357 + 8.75 % × $37,200 (the chart's base is exact here)", "OR", { retIncome: 60000, ...J }, 4612, 4800],
  ["OR single 66, IRA $200,000 — bracket sum $18,043.50 (the chart prints $18,043: it rounds its base)", "OR", { retIncome: 200000 }, 18043.5, 16000],
  ["SC single 70, IRA $80,000 — $15,000 excluded; 5.21 % × $65,000 − $966", "SC", { retIncome: 80000, ageA: 70 }, 2420.5, 3900],
  ["VA joint 70/70, IRA $50,000 — $24,000 age deduction; ONE schedule for the couple: $720 + 5.75 % × $9,000", "VA", { retIncome: 50000, ageA: 70, ageB: 70, single: false }, 1237.5, 1495],
  ["WI single 68, IRA $60,000 — $24,000 excluded; $528.85 + 4.4 % × $20,890", "WI", { retIncome: 60000, ageA: 68 }, 1448.01, 1908],
  ["WI joint 60/60, IRA $500,000 — $22,707.70 + 7.65 % × $56,370", "WI", { retIncome: 500000, ageA: 60, ageB: 60, single: false }, 27020.005, 26500],
];
// each case's base, in HC's order: the IRA, pension or wages less the exclusion the label names
const HCB = [60000, 1200000, 800000, 40000, 250000, 40000, 250000, 60000, 40000, 80000, 60000, 200000, 65000, 26000, 36000, 500000];
HC.forEach(([lbl, code, o, nv, ov], i) => EQ(`C-${code} ${lbl}: ${BR ? `$${nv}` : `PIN v5.99 $${ov}`}`, call(code, o), D30L ? D30.B(code, HCB[i]) : BR ? nv : ov));
// New York: $20,000 pension exclusion per person from 65; the model's New York AGI is its state base. Worksheet 1 (IT-2105-I 2026): tax + (flat ×
// TI − tax) × round4((AGI − $107,650) / $50,000), capped at 1; above $215,400 single / $161,550 joint the bracket's own rate on all of it.
const NYC = [
  ["single, base $100,000 — below $107,650: the table alone", { retIncome: 100000 }, 5331.75],
  ["single, base $107,650 exactly — the worksheet starts ABOVE it", { retIncome: 107650 }, 5783.10],
  ["single, base $120,000 — fraction 0.2470 toward flat 5.9 %", { retIncome: 120000 }, 6652.1078],
  ["single, base $140,000 — fraction 0.6470", { retIncome: 140000 }, 8059.4078],
  ["single, base $157,650 — fraction 1: flat 5.9 % on all of it", { retIncome: 157650 }, 9301.35],
  ["single, base $300,000 — above $215,400: 6.85 % on all of it (the law phases this in; conservative)", { retIncome: 300000 }, 20550],
  ["joint, base $120,000 — fraction 0.2470 toward flat 5.4 %", { retIncome: 120000, ageA: 60, ageB: 60, single: false }, 6229.6275],
  ["joint, base $200,000 — above $161,550: 5.9 % on all of it", { retIncome: 200000, ageA: 60, ageB: 60, single: false }, 11800],
  ["joint 66/66, pension $160,000 — $40,000 excluded, base $120,000 (the measure is net of the exclusion)", { pen: 160000, ageA: 66, ...J }, 6229.6275],
];
const NYB = [100000, 107650, 120000, 140000, 157650, 300000, 120000, 200000, 120000];
for (const [i, [lbl, o, nv]] of NYC.entries()) EQ(`C-NY ${lbl}: ${BR ? `$${nv}` : "PIN v5.99: 6 % of the base"}`, call("NY", { ageA: 60, ...o }), D30L ? D30.B("NY", NYB[i]) : BR ? nv : 0.06 * Math.max(0, (o.retIncome || 0) + (o.pen || 0) - (o.pen ? 40000 : 0)));
// A survivor who is spouse B files single: the calculator moves B into A's slot, and the SINGLE schedule applies.
EQ(`C-SV a survivor (spouse B, 70) on a single return in Oregon, IRA $60,000: ${BR ? "the single chart, $678 + 8.75 % × $48,600 = $4,930.50 (bracket sum $4,931.00)" : "PIN v5.99 8 %"}`,
   call("OR", { retIncome: 60000, ageA: null, ageB: 70, single: true }), D30L ? D30.B("OR", 60000) : BR ? 4931 : 4800);
// Outside the ten, nothing changes: Georgia is flat, Utah keeps its credit (which reads `rate`).
EQ("C-GA Georgia (flat 4.99 %, not a schedule) single 66, IRA $100,000: $1,746.50 on both legs", call("GA", { retIncome: 100000 }), 1746.5);

// ── D · v5.99 -> v6.00: only the ten move, and each equals an independent bracket implementation ──
// Single-build by design: it needs app_v599.mjs, which only a v599 -> v600 run folder holds (t65 D owns v6.00 -> v6.01).
if (VER === "v600") {
  // From v6.01 the run folder is v600 -> v601 and holds no app_v599.mjs: the group is reported as not run (t63 C's convention), not failed.
  if (!existsSync(new URL("./app_v599.mjs", import.meta.url))) console.log("  – group D not run: app_v599.mjs is not in this run folder (a v599 -> v600 folder runs it)");
  else {
    const pm = await import("./app_v599.mjs"), PST = pm.__engines.stateTaxAnnual || pm.__g.stateTaxAnnual;
    let n = 0, same = 0, indep = 0; const bad = [];
    for (const code of Object.keys(SR)) for (const single of [true, false]) for (const age of [50, 62, 66, 72]) for (const ret of [0, 30000, 90000, 250000, 1500000])
      for (const pen of [0, 20000]) for (const ss of [0, 20000]) {
        const a = { code, retIncome: ret, pen, work: 5000, capGains: 3000, ssTaxableFed: ss, ssGrossA: ss ? 24000 : 0, ssGrossB: 0, ageA: age, ageB: single ? null : age, single };
        const x = PST({ ...a }), y = ST({ ...a }); n++;
        if (!TEN.includes(code)) { if (x === y) same++; else bad.push(`${code} moved ${x}->${y}`); continue; }
        // v5.99 taxed rate × base, so its base is x / rate (MS's v5.99 rate 4 % is nonzero); the schedule on that base is v6.00's tax.
        const base = x / OLD_RATE[code], rows = S[code][single ? "single" : "joint"];
        let want = sum(rows, base);
        if (code === "NY" && base > 107650) { const up = single ? 215400 : 161550, fl = single ? 0.059 : 0.054;
          want = base <= up ? want + (fl * base - want) * Math.min(1, Math.round((base - 107650) / 50000 * 1e4) / 1e4) : rows.find(([u]) => u === null || base <= u)[1] * base; }
        if (Math.abs(y - want) <= 1e-6 * Math.max(1, want)) indep++; else bad.push(`${code} ${JSON.stringify(a)} got ${y} want ${want}`);
      }
    CK(`D-1 the calculator: ${n} calls across all ${Object.keys(SR).length} rows — byte-identical outside the ten (${same}), equal to an independent schedule on v5.99's base inside (${indep})`,
       bad.length === 0 && same + indep === n, bad.slice(0, 3).join(" · "));
  }
}

// ── E · the display, the AI context line, the Field Manual ──
const src = readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
const ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module" });
const WB = { ...walk.base, JSXElement(n, s, c) { c(n.openingElement, s); n.children.forEach(x => c(x, s)); }, JSXFragment(n, s, c) { n.children.forEach(x => c(x, s)); },
  JSXOpeningElement(n, s, c) { n.attributes.forEach(a => c(a, s)); }, JSXAttribute(n, s, c) { if (n.value) c(n.value, s); }, JSXSpreadAttribute(n, s, c) { c(n.argument, s); },
  JSXExpressionContainer(n, s, c) { if (n.expression.type !== "JSXEmptyExpression") c(n.expression, s); }, JSXText() {}, JSXEmptyExpression() {} };
const quasis = []; walk.full(ast, n => { if (n.type === "TemplateLiteral") quasis.push(n.quasis.map(q => q.value.cooked).join("\u0000")); }, WB);
const aiLine = quasis.find(q => q.startsWith("Target retirement year: ")) || "";
// v6.01 splits the phrase around Maryland's county clause (t65 E-1 holds that form). A LIST.
const E1 = D30L ? quasis.some(q => q === "on the state's own brackets\u0000\u0000, top rate \u0000%") : ["v601", "v602"].includes(VER) ? quasis.some(q => q === "on the state's own brackets\u0000, top rate \u0000%") : quasis.some(q => q === "on the state's own brackets, top rate \u0000%");
CK(`E-1 the AI context's state line ${BR ? "says a bracket state is taxed on its own brackets, with its top rate" : "PIN v5.99: gives one income-tax rate"}`,
   BR ? E1 : /\(income tax \u0000%\)\.$/.test(aiLine), aiLine.slice(-80));
// The My Data line, rendered
const body = () => window.document.body;
let root, act, DangerClose;
const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
const click = async (x) => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
const stateSelect = () => [...body().querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "ME"));
const pick = async (code) => { const s = stateSelect(); if (!s) return false;
  try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(s, code); s.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
  await flush(); return true; };
const modelLine = () => { const n = [...body().querySelectorAll("div")].filter(d => /^Model: /.test(d.textContent || ""));
  return n.length ? n.sort((a, b) => a.textContent.length - b.textContent.length)[0].textContent : ""; };
{
  window.localStorage.clear();
  const el = window.document.createElement("div"); body().appendChild(el);
  ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(example); await flush();
  await click(tabBtn("my data")); await flush();
  CK("E-0 setup — My Data shows a state selector", !!stateSelect());
  await pick("NY"); const ny = modelLine();
  if (BR) {
    CK("E-2 New York: \"the state's own brackets, 3.90% to 10.90%\", no \"effective rate\", dated \"brackets 2026\"",
       /^Model: the state's own brackets, 3\.90% to 10\.90% · /.test(ny) && !/effective rate/.test(ny) && (D30L ? /Dollar figures by tax year: exclusion 2026 · brackets 2026 · deductions 2026\./ : /Dollar figures by tax year: exclusion 2026 · brackets 2026\./).test(ny), ny.slice(0, 160));
    await pick("CA"); const ca = modelLine();
    CK("E-3 California: \"1.00% to 13.30%\", dated \"brackets 2025\"", /^Model: the state's own brackets, 1\.00% to 13\.30% · /.test(ca) && (D30L ? /Dollar figures by tax year: brackets 2025 · deductions 2025\./ : /Dollar figures by tax year: brackets 2025\./).test(ca), ca.slice(0, 160));
    await pick("OK"); const ok = modelLine();
    CK("E-4 Oklahoma: \"0.00% to 4.50%\"", /^Model: the state's own brackets, 0\.00% to 4\.50% · /.test(ok), ok.slice(0, 120));
  } else CK("E-2 PIN v5.99: New York reads \"6.00% effective rate (an approximation)\"", /^Model: 6\.00% effective rate \(an approximation\)/.test(ny), ny.slice(0, 120));
  // v6.01 puts Maine on its schedule; the state without one is then a flat-rate state (Georgia). A LIST.
  if (["v601", "v602"].includes(VER)) { await pick("GA"); const ga = modelLine();
    CK("E-5 a state without a schedule (Georgia, flat) still reads \"effective rate (an approximation)\"", /^Model: 4\.99% effective rate \(an approximation\)/.test(ga), ga.slice(0, 120)); }
  else { await pick("ME"); const me = modelLine();
    CK("E-5 a state without a schedule (Maine) still reads \"effective rate (an approximation)\"", /^Model: 7\.15% effective rate \(an approximation\)/.test(me), me.slice(0, 120)); }
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}
// The Field Manual: three sentences, each held to the code fact that keeps it true (OPERATIONS §B2)
const DOCS = g.DOCS_HTML().replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
const named = (DOCS.match(/from v6\.00 ten states - ([A-Z, ]+) - are taxed on their own bracket schedules/) || [])[1];
if (BR) {
  // v6.01 rewrites the Taxes entry's list and the methodology sentence for twenty-seven states; t65 E-6 and E-8 hold the new forms. A LIST.
  if (["v600"].includes(VER)) CK(`E-6 the Taxes entry names the ten states on their own schedules, and the list IS the set of rows carrying one (${named})`,
     !!named && named.split(", ").sort().join(",") === withB.join(","), named);
  const noDed = Object.keys(SR).filter(c => Object.keys(SR[c]).some(k => /std|standard|deduct|exempt(?!Age|ion)|personal/i.test(k) && !/^retExempt/.test(k)));
  if (D30L) CK("E-7 (v6.02) the sentence \"no state's standard deduction or personal exemption is taken\" is gone, and the only deduction field is `deduct`, on exactly the 27 progressive rows (t66 A-1, F-5 hold the rest)",
     !/no state's standard deduction or personal exemption is taken/.test(DOCS) && noDed.join(",") === Object.keys(SR).filter(c => SR[c].brackets).join(",")
     && Object.keys(SR).every(c => Object.keys(SR[c]).filter(k => /std|standard|deduct|exempt(?!Age|ion)|personal/i.test(k) && !/^retExempt/.test(k)).every(k => k === "deduct")), noDed.join(","));
  else CK("E-7 \"no state's standard deduction or personal exemption is taken\" — and no row carries a field that could hold one",
     /no state's standard deduction or personal exemption is taken \(conservative\)/.test(DOCS) && noDed.length === 0, noDed.join(","));
  if (["v600"].includes(VER)) CK("E-8 the methodology entry: ten states on their own schedules, one rate for the other progressive states",
     /taxes ten states on their own bracket schedules \(v6\.00\) and uses one rate in place of the brackets for the other progressive states/.test(DOCS));
  CK("E-9 the old claims are gone: \"effective rates stand in for progressive brackets\", \"effective flat rates in place of progressive state brackets\"",
     !/effective rates stand in for progressive brackets/.test(DOCS) && !/effective flat rates in place of progressive state brackets/.test(DOCS));
} else CK("E-6 PIN v5.99: the Field Manual says effective rates stand in for progressive brackets", /effective rates stand in for progressive brackets/.test(DOCS) && !named);
done();
