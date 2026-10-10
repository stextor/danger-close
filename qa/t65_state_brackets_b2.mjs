// t65 — D-22 OPTION 3, BATCH 2: THE SEVENTEEN REMAINING PROGRESSIVE STATES ON THEIR OWN SCHEDULES · docs/SCOPE_D22_BRACKETS_V601.md · v6.01
//
// v6.00 put ten states on their own bracket schedules (t64). v6.01 puts the other seventeen there, each read at its primary source on
// 2026-10-09 (the scope's §0 cites each): AL §40-18-5 · AR Act 1 of the 2026 First Extraordinary Session (with its table above $94,700 and
// the bracket adjustment) · CT §12-700(a)(10) (with the 2 % phase-out and the recapture amounts) · DE 30 Del. C. §1102(a)(14) · DC §47-1806.03
// · HI §235-51 (2026) with Act 24 of 2026's 13 % bracket from 2027 · KS K.S.A. 79-32,110 · ME 2026 schedule with the 2 % surcharge ·
// MD Tax-Gen. §10-105 with the county tax at 3.30 % and the 2 % capital-gains tax · MO 2026 · MT HB 337 · NE 2026 (draft) · NM Laws 2024
// ch. 67 · ND 2026 · RI 2026 with the 2027+ surtax at 3 % · VT 2026 (preliminary) · WV §11-21-4j (SB 392).
//
// Groups:  A the schedules and their extra fields, each equal to its source; the D-22 EXTINCTION (every taxing row is on a schedule or is a
//            flat-rate state); the claims the notes make that are about the code, each held to it (HI/RI/MT/NE "the later schedule is lower",
//            VT "the minimum tax cannot bind")
//          B each schedule against the state's PRINTED bases: to the cent where it prints cents; within $1 where it rounds (HI, ME, VT)
//          C hand cases to the cent through stateTaxAnnual (Decimal, session working hand601.py, recorded in the scope §3); v600 pins the old rate
//          D v6.00 -> v6.01 (v601 leg, needs app_v600.mjs): outside the seventeen byte-identical; inside, equal to an independent implementation
//          E the display: My Data (Maryland's county clause), the AI context line, the Field Manual's sentences, each held to its code fact
// BOTH LEGS. Run: node t65_state_brackets_b2.mjs <tag>
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
import { d30Pins } from "./d30_ref.mjs";
import { existsSync, readFileSync } from "fs";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v600", "v601", "v602"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 260) : ""}`); } };
const EQ = (n, got, want, tol = 0.005) => CK(n + D30.tag(), typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, want ${want}`);
const done = () => { console.log(`\nt65 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t65 — STATE BRACKET SCHEDULES, BATCH 2 (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const BR = VER !== "v600";
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const g = window.__g, SR = g.STATE_RULES();
// v6.02 (D-30 batch 1 — docs/SCOPE_D30_DEDUCTIONS_V602.md, DD-14): the seventeen take their deductions, exemptions and credits. §C keeps each
// case's BASE (its last column) and on a D-30 leg expects it after them — qa/d30_ref.mjs, independent of the app, on the calculator's own record
// of the call; a different base fails. B-AR2/3 hold Arkansas's DFA formula at the same NET income (wages + the $2,470 deduction). §A-9 and §E
// take the v6.02 forms (t66 A-5, F hold them). Group D (v6.00 -> v6.01) runs in a v600 -> v601 folder only. A version LIST.
const D30L = ["v602"].includes(VER), D30 = d30Pins((a) => g.stateTaxAnnual(a), SR, D30L), ST = D30.S;
const SEV = ["AL", "AR", "CT", "DC", "DE", "HI", "KS", "MD", "ME", "MO", "MT", "ND", "NE", "NM", "RI", "VT", "WV"];
const TEN = ["CA", "MN", "MS", "NJ", "NY", "OK", "OR", "SC", "VA", "WI"];
const FLAT = ["AZ", "CO", "GA", "IA", "ID", "IL", "IN", "KY", "LA", "MA", "MI", "NC", "OH", "PA", "UT"];

// ── A · the schedules (upper bounds inclusive, "not over"; transcribed from the sources the header names) ──
const same = (x) => ({ single: x, joint: x });
const S = {
  AL: { single: [[500, .02], [3000, .04], [null, .05]], joint: [[1000, .02], [6000, .04], [null, .05]] },
  AR: same([[5599, 0], [11199, .02], [15999, .03], [26399, .034], [null, .037]]),
  CT: { single: [[10000, .02], [50000, .045], [100000, .055], [200000, .06], [250000, .065], [500000, .069], [null, .0699]],
        joint: [[20000, .02], [100000, .045], [200000, .055], [400000, .06], [500000, .065], [1000000, .069], [null, .0699]] },
  DE: same([[2000, 0], [5000, .022], [10000, .039], [20000, .048], [25000, .052], [60000, .0555], [null, .066]]),
  DC: same([[10000, .04], [40000, .06], [60000, .065], [250000, .085], [500000, .0925], [1000000, .0975], [null, .1075]]),
  // HI: the 2026 schedule (§235-51 as amended by Act 46 of 2024) with Act 24 of 2026's 13 % bracket above $500,000 / $1,000,000 added
  HI: { single: [[9600, .014], [14400, .032], [19200, .055], [24000, .064], [36000, .068], [48000, .072], [125000, .076], [175000, .079], [225000, .0825], [275000, .09], [325000, .1], [500000, .11], [null, .13]],
        joint: [[19200, .014], [28800, .032], [38400, .055], [48000, .064], [72000, .068], [96000, .072], [250000, .076], [350000, .079], [450000, .0825], [550000, .09], [650000, .1], [1000000, .11], [null, .13]] },
  KS: { single: [[23000, .052], [null, .0558]], joint: [[46000, .052], [null, .0558]] },
  // ME: the 2026 schedule with the 2 % surcharge above $1,000,000 / $1,500,000 (36 M.R.S. §5111(7)) as a fourth bracket
  ME: { single: [[27400, .058], [64850, .0675], [1000000, .0715], [null, .0915]], joint: [[54850, .058], [129750, .0675], [1500000, .0715], [null, .0915]] },
  MD: { single: [[1000, .02], [2000, .03], [3000, .04], [100000, .0475], [125000, .05], [150000, .0525], [250000, .055], [500000, .0575], [1000000, .0625], [null, .065]],
        joint: [[1000, .02], [2000, .03], [3000, .04], [150000, .0475], [175000, .05], [225000, .0525], [300000, .055], [600000, .0575], [1200000, .0625], [null, .065]] },
  MO: same([[1348, 0], [2696, .02], [4044, .025], [5392, .03], [6740, .035], [8088, .04], [9436, .045], [null, .047]]),
  MT: { single: [[47500, .047], [null, .0565]], joint: [[95000, .047], [null, .0565]] },
  NE: { single: [[4130, .0246], [24760, .0351], [null, .0455]], joint: [[8250, .0246], [49530, .0351], [null, .0455]] },
  NM: { single: [[5500, .015], [16500, .032], [33500, .043], [66500, .047], [210000, .049], [null, .059]], joint: [[8000, .015], [25000, .032], [50000, .043], [100000, .047], [315000, .049], [null, .059]] },
  ND: { single: [[49575, 0], [250400, .0195], [null, .025]], joint: [[82800, 0], [304850, .0195], [null, .025]] },
  // RI: the 2026 uniform schedule with the surtax H 7127 (Article 6) imposes from 2027 above $1,000,000, taken at its 2029+ 3 %
  RI: same([[82050, .0375], [186450, .0475], [1000000, .0599], [null, .0899]]),
  VT: { single: [[50750, .0335], [122850, .066], [256300, .076], [null, .0875]], joint: [[84700, .0335], [204750, .066], [312050, .076], [null, .0875]] },
  WV: same([[10000, .0211], [25000, .0281], [40000, .0316], [60000, .0422], [null, .0458]]),
};
const TOP = { AL: .05, AR: .037, CT: .0699, DE: .066, DC: .1075, HI: .13, KS: .0558, ME: .0915, MD: .098, MO: .047, MT: .0565, NE: .0455, NM: .059, ND: .025, RI: .0899, VT: .0875, WV: .0458 };
const OLD_RATE = { AL: .045, AR: .039, CT: .05, DE: .055, DC: .065, HI: .0675, KS: .0558, ME: .0715, MD: .075, MO: .047, MT: .0565, NE: .052, NM: .049, ND: .02, RI: .05, VT: .066, WV: .0482 };
const AR_UPPER = { over: 94700, brackets: [[4700, 0.02], [null, 0.037]], adjust: { to: 97600, width: 100, first: 290, step: 10 } };
const CT_ADDS = { single: [[56500, 5000, 25, 250], [105000, 5000, 25, 250], [200000, 5000, 90, 2700], [500000, 5000, 50, 450]],
                  joint: [[100500, 5000, 50, 500], [210000, 10000, 50, 500], [400000, 10000, 180, 5400], [1000000, 10000, 100, 900]] };
const withB = Object.keys(SR).filter(c => SR[c].brackets !== undefined).sort();
if (BR) {
  const want = [...TEN, ...SEV].sort();
  CK(`A-1 exactly the twenty-seven rows carry a schedule — v6.00's ten and these seventeen (${withB.length})`, withB.join(",") === want.join(","), withB.join(","));
  for (const c of SEV) {
    const b = SR[c].brackets || {};
    CK(`A-2${c} ${SR[c].name}: single and joint schedules equal the source (${S[c].single.length} / ${S[c].joint.length} rows), dated 2026, top rate ${(TOP[c] * 100).toFixed(2)}%`,
       JSON.stringify(b.single) === JSON.stringify(S[c].single) && JSON.stringify(b.joint) === JSON.stringify(S[c].joint) && SR[c].years && SR[c].years.brackets === 2026
       && Math.abs(SR[c].rate - TOP[c]) < 1e-12, JSON.stringify({ b, y: SR[c].years, r: SR[c].rate }).slice(0, 220));
  }
  CK("A-3 Arkansas's table above $94,700 (2 % on the first $4,700, 3.7 % above) and its bracket adjustment ($290 at $94,701, $10 less per $100, nothing above $97,600)",
     JSON.stringify(SR.AR.upper) === JSON.stringify(AR_UPPER), JSON.stringify(SR.AR.upper));
  CK("A-4 Connecticut's added amounts: the 2 % phase-out ($25 / $50 a step above $56,500 / $100,500) and the three recapture tiers, with their steps and maximums",
     JSON.stringify(SR.CT.stepAdds) === JSON.stringify(CT_ADDS), JSON.stringify(SR.CT.stepAdds));
  CK("A-5 Maryland: county tax 3.30 % (the highest county rate), 2 % capital-gains tax above $350,000 of federal AGI; `rate` = 6.5 % + 3.3 %",
     SR.MD.local === 0.033 && JSON.stringify(SR.MD.cgSurtax) === JSON.stringify({ rate: 0.02, agiOver: 350000 }) && Math.abs(SR.MD.rate - 0.098) < 1e-12, JSON.stringify([SR.MD.local, SR.MD.cgSurtax, SR.MD.rate]));
  const own = k => Object.keys(SR).filter(c => SR[c][k] !== undefined).sort().join(",");
  CK("A-6 EXTINCTION: only Arkansas carries `upper`, only Connecticut `stepAdds`, only Maryland `local` and `cgSurtax`, only New York `recapture`",
     own("upper") === "AR" && own("stepAdds") === "CT" && own("local") === "MD" && own("cgSurtax") === "MD" && own("recapture") === "NY",
     [own("upper"), own("stepAdds"), own("local"), own("cgSurtax"), own("recapture")].join(" | "));
  // D-22 is closed by this release: every row that taxes income is either on its own schedule or is a flat-rate state.
  const loose = Object.keys(SR).filter(c => SR[c].rate > 0 && !SR[c].brackets && !FLAT.includes(c));
  const flatWrong = FLAT.filter(c => !(SR[c].rate > 0) || SR[c].brackets);
  CK(`A-7 EXTINCTION (D-22): no taxing row lacks a schedule unless it is one of the fifteen flat-rate states (${FLAT.join(" ")})`, loose.length === 0 && flatWrong.length === 0,
     `loose ${loose.join(",")} · flat list wrong ${flatWrong.join(",")}`);
  const RATE_CLAIM = /(\d+(?:\.\d+)?)\s?%\s*(?:flat\s+)?(?:for|effective|from)\s+(20\d\d)/;
  const silent = SEV.filter(c => !RATE_CLAIM.test(SR[c].note || "") || Math.abs(Number(SR[c].note.match(RATE_CLAIM)[1]) / 100 - SR[c].rate) > 1e-9);
  CK("A-8 each of the seventeen notes states its top rate for its year (t61 A-5 checks the value table-wide)", silent.length === 0, silent.join(","));
  const noOwn = SEV.filter(c => !/own brackets/.test(SR[c].note));
  if (D30L) CK("A-9 (v6.02) each of the seventeen notes says the state's own brackets are used, and what it takes from v6.02",
     noOwn.length === 0 && SEV.every(c => /from v6\.02/i.test(SR[c].note)), noOwn.join(",") + " / " + SEV.filter(c => !/from v6\.02/i.test(SR[c].note)).join(","));
  else CK("A-9 each of the seventeen notes says the state's own brackets are used, and that no standard deduction or exemption is taken (conservative)",
     noOwn.length === 0 && SEV.every(c => /not taken \(conservative\)/.test(SR[c].note)), noOwn.join(",") + " / " + SEV.filter(c => !/not taken \(conservative\)/.test(SR[c].note)).join(","));
  const NAMED = {
    AL: /deduction of federal income tax that Alabama allows/, AR: /bracket adjustment from \$94,701 to \$97,600 — all modelled/,
    CT: /phase-out of the 2% bracket and the benefit recapture amounts/, DE: /combined-separate on one return, which is not modelled \(conservative\)/,
    HI: /13% bracket that Act 24 of 2026 adds above \$500,000 single \/ \$1,000,000 joint from 2027, applied here in every year/,
    MD: /taken at the highest county rate, 3\.30%/, ME: /2% surcharge on Maine taxable income over \$1,000,000 single \/ \$1,500,000 joint/,
    MO: /overstating by up to \$180\.63 a year: conservative/, MT: /3% \/ 4\.1% rates on net long-term capital gains are not modelled/,
    NE: /a draft dated August 2026/, ND: /40% exclusion of net long-term capital gains/, RI: /taken at 3% in every year/,
    VT: /minimum tax of 3% of federal AGI over \$150,000 cannot bind in the model/, WV: /SB 392 of 2026, retroactive to 1 January 2026/,
  };
  const unnamed = Object.keys(NAMED).filter(c => !NAMED[c].test(SR[c].note));
  CK("A-10 each named simplification or added rule is stated in its note (AL AR CT DE HI MD ME MO MT NE ND RI VT WV)", unnamed.length === 0, unnamed.join(","));
  CK("A-11 Missouri's per-spouse figure: $180.63 IS the chart's own low-band saving (4.7 % × $9,436 − the bracket sum to $9,436)",
     Math.abs((0.047 * 9436 - sum(S.MO.single, 9436)) - 180.632) < 1e-6, (0.047 * 9436 - sum(S.MO.single, 9436)));
} else {
  CK("A-1 PIN v6.00: none of the seventeen carries a schedule; their rates are v6.00's single rates; exactly ten rows carry one",
     SEV.every(c => !SR[c].brackets && SR[c].rate === OLD_RATE[c]) && withB.join(",") === TEN.join(","), withB.join(","));
}
function sum(rows, x) { let t = 0, lo = 0; for (const [u, r] of rows) { const hi = u === null ? Infinity : u; if (x <= lo) break; t += (Math.min(x, hi) - lo) * r; lo = hi; } return t; }

// Claims about LATER schedules, held to the code: holding the 2026 schedule (with Hawaii's and Rhode Island's added top brackets) is at or
// above every schedule the law has enacted for the model's later years, at every income. Act 24 of 2026 (HI) for 2027 and 2029; MT 2027
// (HB 337); NE 2027 (LB 754: 3.99 % in the third and fourth brackets); RI 2026 without the surtax, and 2027 / 2028 at 1 % / 2 %.
if (BR) {
  const LATER = {
    HI: { single: [[[14400, .014], [19200, .025], [24000, .05], [36000, .064], [48000, .068], [125000, .072], [175000, .076], [225000, .0825], [275000, .09], [325000, .1], [500000, .11], [null, .13]],
                   [[19200, .014], [24000, .025], [36000, .05], [48000, .064], [125000, .068], [175000, .072], [225000, .0825], [275000, .09], [325000, .1], [500000, .11], [null, .13]],
                   [[9600, .014], [14400, .032], [19200, .055], [24000, .064], [36000, .068], [48000, .072], [125000, .076], [175000, .079], [225000, .0825], [275000, .09], [325000, .1], [null, .11]]],
          joint: [[[28800, .014], [38400, .025], [48000, .05], [72000, .064], [96000, .068], [250000, .072], [350000, .076], [450000, .0825], [550000, .09], [650000, .1], [1000000, .11], [null, .13]],
                  [[38400, .014], [48000, .025], [72000, .05], [96000, .064], [250000, .068], [350000, .072], [450000, .0825], [550000, .09], [650000, .1], [1000000, .11], [null, .13]],
                  [[19200, .014], [28800, .032], [38400, .055], [48000, .064], [72000, .068], [96000, .072], [250000, .076], [350000, .079], [450000, .0825], [550000, .09], [650000, .1], [null, .11]]] },
    MT: { single: [[[65000, .047], [null, .054]]], joint: [[[130000, .047], [null, .054]]] },
    NE: { single: [[[4130, .0246], [24760, .0351], [null, .0399]]], joint: [[[8250, .0246], [49530, .0351], [null, .0399]]] },
    RI: { single: [[[82050, .0375], [186450, .0475], [null, .0599]], [[82050, .0375], [186450, .0475], [1000000, .0599], [null, .0699]], [[82050, .0375], [186450, .0475], [1000000, .0599], [null, .0799]]],
          joint: [[[82050, .0375], [186450, .0475], [null, .0599]], [[82050, .0375], [186450, .0475], [1000000, .0599], [null, .0699]], [[82050, .0375], [186450, .0475], [1000000, .0599], [null, .0799]]] },
  };
  const under = [];
  for (const [c, L] of Object.entries(LATER)) for (const k of ["single", "joint"]) for (const sch of L[k])
    for (let x = 0; x <= 3000000; x += x < 200000 ? 250 : 5000) if (sum(SR[c].brackets[k], x) < sum(sch, x) - 1e-6) { under.push(`${c} ${k} $${x}`); break; }
  CK("A-12 the notes' claim: the model's HI, MT, NE and RI schedules are at or above every later schedule the law enacts, at every income to $3M (Act 24 2027 / 2029 and the 2026 table for HI; MT and NE 2027; RI 2026, 2027, 2028)",
     under.length === 0, under.join(" · "));
  // Vermont: the 3 % minimum tax on federal AGI over $150,000 (32 V.S.A. §5822(a)(6)) cannot bind in the model — its tax on every such household is
  // at least 3 % of the federal AGI measure (no deduction or exclusion is taken that could bring it under).
  const vtLow = [];
  for (const single of [true, false]) for (const age of [50, 66, 72]) for (const ret of [0, 100000, 160000, 400000, 2000000]) for (const ss of [0, 40000]) for (const cg of [0, 50000, 300000]) {
    const a = { code: "VT", retIncome: ret, pen: 0, work: 20000, capGains: cg, ssTaxableFed: ss, ssGrossA: ss ? 48000 : 0, ssGrossB: 0, ageA: age, ageB: single ? null : age, single };
    const agi = ret + 20000 + cg + ss;
    if (agi > 150000 && ST(a) < 0.03 * agi - 1e-6) vtLow.push(JSON.stringify(a));
  }
  CK("A-13 the note's claim: Vermont's minimum tax (3 % of federal AGI over $150,000) cannot bind in the model — every household above $150,000 already pays more", vtLow.length === 0, vtLow.slice(0, 2).join(" · "));
}

// ── B · each schedule against the state's printed bases ──
const PRINTED = {
  CT: { tol: 0.006, single: [[10000, 200], [50000, 2000], [100000, 4750], [200000, 10750], [250000, 14000], [500000, 31250]], joint: [[20000, 400], [100000, 4000], [200000, 9500], [400000, 21500], [500000, 28000], [1000000, 62500]] },
  DC: { tol: 0.006, single: [[10000, 400], [40000, 2200], [60000, 3500], [250000, 19650], [500000, 42775], [1000000, 91525]], joint: [[10000, 400], [40000, 2200], [60000, 3500], [250000, 19650], [500000, 42775], [1000000, 91525]] },
  KS: { tol: 0.006, single: [[23000, 1196]], joint: [[46000, 2392]] },
  NM: { tol: 0.006, single: [[5500, 82.5], [16500, 434.5], [33500, 1165.5], [66500, 2716.5], [210000, 9748]], joint: [[8000, 120], [25000, 664], [50000, 1739], [100000, 4089], [315000, 14624]] },
  ND: { tol: 0.006, single: [[250400, 3916.09]], joint: [[304850, 4329.98]] },
  NE: { tol: 0.006, single: [[4130, 101.60], [24760, 825.71], [39900, 1514.58]], joint: [[8250, 202.95], [49530, 1651.88], [79800, 3029.16]] },
  RI: { tol: 0.006, single: [[82050, 3076.88], [186450, 8035.88]], joint: [[82050, 3076.88], [186450, 8035.88]] },
  WV: { tol: 0.006, single: [[10000, 211], [25000, 632.5], [40000, 1106.5], [60000, 1950.5]], joint: [[10000, 211], [25000, 632.5], [40000, 1106.5], [60000, 1950.5]] },
  // Arkansas prints "rate × net income − subtraction" (DFA withholding formula, effective 1 January 2026): the base at a threshold t is r·t − k of the row above it
  AR: { tol: 0.006, single: [[11199, .03 * 11199 - 223.97], [15999, .034 * 15999 - 287.97], [26399, .037 * 26399 - 367.16]], joint: [[11199, .03 * 11199 - 223.97], [15999, .034 * 15999 - 287.97], [26399, .037 * 26399 - 367.16]] },
  // The three that print rounded bases: Hawaii's statute, Maine's schedule and Vermont's preliminary rates print whole dollars
  HI: { tol: 1, single: [[9600, 134], [14400, 288], [19200, 552], [24000, 859], [36000, 1675], [48000, 2539], [125000, 8391], [175000, 12341], [225000, 16466], [275000, 20966], [325000, 25966]],
        joint: [[19200, 269], [28800, 576], [38400, 1104], [48000, 1718], [72000, 3350], [96000, 5078], [250000, 16782], [350000, 24682], [450000, 32932], [550000, 41932], [650000, 51932]] },
  ME: { tol: 1, single: [[27400, 1589], [64850, 4117]], joint: [[54850, 3181], [129750, 8237]] },
  VT: { tol: 1, single: [[50750, 1700], [122850, 6459], [256300, 16601]], joint: [[84700, 2837], [204750, 10761], [312050, 18916]] },
};
if (BR) {
  for (const [c, P] of Object.entries(PRINTED)) {
    const off = []; let worst = 0;
    for (const k of ["single", "joint"]) for (const [t, base] of P[k]) { const d = Math.abs(sum(SR[c].brackets[k], t) - base); worst = Math.max(worst, d); if (d > P.tol) off.push(`${k} ${t}: model ${sum(SR[c].brackets[k], t).toFixed(2)} printed ${base.toFixed(2)}`); }
    CK(`B-${c} the schedule reproduces ${c}'s printed bases ${P.tol < 1 ? "to the cent" : "within $1 (the source prints whole dollars)"} — largest gap $${worst.toFixed(2)}`, off.length === 0, off.join(" · "));
  }
  // Arkansas's table above $94,700, against the DFA formula: 3.7 % × NI − $79.90, less the adjustment ($369.90 − $290 = $79.90 + $290)
  const arB = x => 0.037 * x - 79.90;
  const NI = D30L ? 2470 : 0, CR = D30L ? 29 : 0, nt = D30L ? " [v6.02: wages + the $2,470 standard deduction reach the same net income; less the $29 credit]" : "";
  EQ("B-AR2 Arkansas above $97,600: the model is the DFA's 3.7 % × net income − $79.90 (at $150,000)" + nt, ST({ code: "AR", work: 150000 + NI, ageA: 45, single: true }), arB(150000) - CR, 0.006);
  EQ("B-AR3 …and inside the adjustment band the DFA's subtraction is $369.90 at $94,701-$94,800 (at $94,750)" + nt, ST({ code: "AR", work: 94750 + NI, ageA: 45, single: true }), 0.037 * 94750 - 369.90 - CR, 0.006);
}

// ── C · hand cases to the cent through stateTaxAnnual ──
// Each figure computed independently (Decimal, session working hand601.py, from the printed tables); the v600 leg pins v6.00's rate × base.
const call = (code, o) => ST({ code, retIncome: 0, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: 45, ageB: null, single: true, ...o });
const J = { ageB: 45, single: false };
const HC = [
  // [id, label, code, args, v6.01 hand figure, v6.00 base (the pin is OLD_RATE × base)]
  ["AL-1", "single 45, wages $50,000 — 2 % / 4 % / 5 %", "AL", { work: 50000 }, 2460, 50000],
  ["AL-2", "joint 66/66, IRA $100,000 — $12,000 excluded; joint schedule on $88,000", "AL", { retIncome: 100000, ageA: 66, ageB: 66, single: false }, 4320, 88000],
  ["AR-1", "single 45, wages $50,000 — the low table: bracket sum (DFA: 3.7 % − $367.16)", "AR", { work: 50000 }, 1482.837, 50000],
  ["AR-2", "$94,700 — the last dollar of the low table", "AR", { work: 94700 }, 3136.737, 94700],
  ["AR-3", "$94,750 — the high table less the full $290 adjustment", "AR", { work: 94750 }, 3135.85, 94750],
  ["AR-4", "$95,050 — the fourth band, $260", "AR", { work: 95050 }, 3176.95, 95050],
  ["AR-5", "$97,600 — the last band, $10", "AR", { work: 97600 }, 3521.3, 97600],
  ["AR-6", "$97,601 — no adjustment", "AR", { work: 97601 }, 3531.337, 97601],
  ["AR-7", "joint 45/45, wages $120,000 — ONE table for every status", "AR", { work: 120000, ...J }, 4360.1, 120000],
  ["CT-1", "single 45, wages $60,000 — schedule + one $25 phase-out step", "CT", { work: 60000 }, 2575, 60000],
  ["CT-2", "single 45, wages $300,000 — phase-out $250, recapture $250 + $1,800", "CT", { work: 300000 }, 19750, 300000],
  ["CT-3", "joint 45/45, wages $250,000 — phase-out $500, first recapture $200", "CT", { work: 250000, ...J }, 13200, 250000],
  ["CT-4", "joint 45/45, wages $1,100,000 — every add at its maximum: $500 + $500 + $5,400 + $900", "CT", { work: 1100000, ...J }, 76790, 1100000],
  ["CT-5", "single 45, wages $56,500 exactly — the phase-out starts ABOVE it", "CT", { work: 56500 }, 2357.5, 56500],
  ["CT-6", "single 45, wages $56,501 — one dollar over: a whole $25 step (\"or fraction thereof\")", "CT", { work: 56501 }, 2382.555, 56501],
  ["CT-7", "single 66, IRA $80,000 — 55 % pension exemption (AGI under $82,500), base $36,000: no add-back (the measure is Connecticut AGI)", "CT", { retIncome: 80000, ageA: 66 }, 1370, 36000],
  ["DE-1", "joint 45/45, wages $70,000 — ONE schedule for every status", "DE", { work: 70000, ...J }, 3603.5, 70000],
  ["DC-1", "single 45, wages $300,000", "DC", { work: 300000 }, 24275, 300000],
  ["HI-1", "single 45, wages $60,000 — bracket sum (the statute prints $3,451)", "HI", { work: 60000 }, 3451.2, 60000],
  ["HI-2", "single 45, wages $600,000 — the 13 % bracket above $500,000", "HI", { work: 600000 }, 58216.2, 600000],
  ["HI-3", "joint 45/45, wages $1,200,000 — the 13 % bracket above $1,000,000", "HI", { work: 1200000, ...J }, 116432.4, 1200000],
  ["KS-1", "single 45, wages $50,000", "KS", { work: 50000 }, 2702.6, 50000],
  ["KS-2", "joint 45/45, wages $50,000 — the joint schedule's $46,000 line", "KS", { work: 50000, ...J }, 2615.2, 50000],
  ["ME-1", "single 45, wages $100,000", "ME", { work: 100000 }, 6630.3, 100000],
  ["ME-2", "single 45, wages $1,200,000 — the 2 % surcharge above $1,000,000", "ME", { work: 1200000 }, 89280.3, 1200000],
  ["ME-3", "single 70, IRA $100,000, SS $30,000 (taxable $25,500) — pension deduction $19,824 phased by 0.5 %, then the schedule", "ME", { retIncome: 100000, ssGrossA: 30000, ssTaxableFed: 25500, ageA: 70 }, 5219.97108, 100000 - 19824 * 0.995],
  ["MD-1", "single 45, wages $120,000 — the state schedule + 3.30 % county", "MD", { work: 120000 }, 9657.5, 120000],
  ["MD-2", "single 45, wages $300,000 + gains $100,000 — federal AGI $400,000: + 2 % of the gain", "MD", { work: 300000, capGains: 100000 }, 36585, 400000],
  ["MD-3", "single 45, wages $250,000 + gains $100,000 — federal AGI exactly $350,000: no capital-gains tax (\"in excess of\")", "MD", { work: 250000, capGains: 100000 }, 30060, 350000],
  ["MD-4", "single 45, wages $260,000 + gains $80,000 + taxable SS $20,000 — base $340,000 but federal AGI $360,000: the tax applies", "MD", { work: 260000, capGains: 80000, ssTaxableFed: 20000 }, 30755, 340000],
  ["MD-5", "joint 70/70, pension $90,000, SS $20,000 / $15,000 — exclusions $20,600 + $25,600, base $43,800", "MD", { pen: 90000, ssGrossA: 20000, ssGrossB: 15000, ssTaxableFed: 25000, ageA: 70, ageB: 70, single: false }, 3473.4, 43800],
  ["MO-1", "single 45, wages $50,000", "MO", { work: 50000 }, 2169.368, 50000],
  ["MT-1", "single 45, wages $60,000", "MT", { work: 60000 }, 2938.75, 60000],
  ["MT-2", "joint 45/45, wages $120,000", "MT", { work: 120000, ...J }, 5877.5, 120000],
  ["NE-1", "single 45, wages $50,000", "NE", { work: 50000 }, 1974.131, 50000],
  ["NE-2", "joint 45/45, wages $100,000", "NE", { work: 100000, ...J }, 3948.263, 100000],
  ["NM-1", "single 45, wages $250,000 — the 5.9 % bracket above $210,000", "NM", { work: 250000 }, 12108, 250000],
  ["NM-2", "joint 45/45, wages $80,000", "NM", { work: 80000, ...J }, 3149, 80000],
  ["ND-1", "single 45, wages $49,575 — the whole 0 % band", "ND", { work: 49575 }, 0, 49575],
  ["ND-2", "single 45, wages $100,000", "ND", { work: 100000 }, 983.2875, 100000],
  ["ND-3", "joint 45/45, wages $400,000", "ND", { work: 400000, ...J }, 6708.725, 400000],
  ["RI-1", "single 45, wages $100,000", "RI", { work: 100000 }, 3929.5, 100000],
  ["RI-2", "single 45, wages $1,500,000 — the surtax at 3 % above $1,000,000", "RI", { work: 1500000 }, 101717.52, 1500000],
  ["VT-1", "single 45, wages $100,000", "VT", { work: 100000 }, 4950.625, 100000],
  ["VT-2", "joint 45/45, wages $300,000", "VT", { work: 300000, ...J }, 17999.75, 300000],
  ["WV-1", "joint 45/45, wages $80,000 — ONE schedule for single and joint", "WV", { work: 80000, ...J }, 2866.5, 80000],
];
for (const [id, lbl, code, o, nv, base] of HC) EQ(`C-${id} ${lbl}: ${BR ? `$${nv}` : `PIN v6.00 ${(OLD_RATE[code] * 100).toFixed(2)}% × $${Math.round(base * 100) / 100}`}`, call(code, o), D30L ? D30.B(code, base, o.capGains) : BR ? nv : OLD_RATE[code] * base, BR ? 0.005 : 0.01);
// A survivor who is spouse B files single: the calculator moves B into A's slot, and the SINGLE schedule applies (Kansas: $23,000, not $46,000).
EQ(`C-SV a survivor (spouse B, 70) on a single return in Kansas, IRA $60,000: ${BR ? "the single schedule, $1,196 + 5.58 % × $37,000 = $3,260.60" : "PIN v6.00 5.58 %"}`,
   call("KS", { retIncome: 60000, ageA: null, ageB: 70, single: true }), D30L ? D30.B("KS", 60000) : BR ? 3260.6 : 3348);
EQ("C-GA Georgia (flat 4.99 %, not a schedule) single 66, IRA $100,000: $1,746.50 on both legs", call("GA", { retIncome: 100000, ageA: 66 }), 1746.5);

// ── D · v6.00 -> v6.01: only the seventeen move, and each equals an independent implementation on v6.00's base ──
// From v6.02 the run folder is v601 -> v602 and holds no app_v600.mjs: the group is reported as not run on either leg (t64 D's convention); t66 D owns v6.01 -> v6.02.
if (BR && !existsSync(new URL("./app_v600.mjs", import.meta.url))) console.log("  – group D not run: app_v600.mjs is not in this run folder (a v600 -> v601 folder runs it)");
else if (BR) {
  if (!existsSync(new URL("./app_v600.mjs", import.meta.url))) CK("D-0 app_v600.mjs is in this run folder (group D needs it)", false, "missing");
  else {
    const pm = await import("./app_v600.mjs"), PST = pm.__engines.stateTaxAnnual || pm.__g.stateTaxAnnual;
    const indepTax = (code, base, a) => {
      const k = a.single ? "single" : "joint";
      let t = sum(S[code][k], base);
      if (code === "AR" && base > 94700) { t = sum(AR_UPPER.brackets, base); if (base <= 97600) t -= Math.max(0, 290 - 10 * (Math.ceil((base - 94700) / 100) - 1)); }
      if (code === "CT") for (const [over, per, each, mx] of CT_ADDS[k]) if (base > over) t += Math.min(mx, each * Math.ceil((base - over) / per));
      if (code === "MD") { t += 0.033 * base; if (a.retIncome + a.pen + a.work + a.capGains + a.ssTaxableFed > 350000) t += 0.02 * a.capGains; }
      return t;
    };
    let n = 0, same = 0, indep = 0; const bad = [];
    for (const code of Object.keys(SR)) for (const single of [true, false]) for (const age of [50, 62, 66, 72]) for (const ret of [0, 30000, 90000, 96000, 250000, 1500000])
      for (const pen of [0, 20000]) for (const ss of [0, 20000]) {
        const a = { code, retIncome: ret, pen, work: 5000, capGains: 3000, ssTaxableFed: ss, ssGrossA: ss ? 24000 : 0, ssGrossB: 0, ageA: age, ageB: single ? null : age, single };
        const x = PST({ ...a }), y = ST({ ...a }); n++;
        if (!SEV.includes(code)) { if (x === y) same++; else bad.push(`${code} moved ${x}->${y}`); continue; }
        // v6.00 taxed rate × base, so its base is x / rate; the schedule (and its added rules) on that base is v6.01's tax.
        const want = indepTax(code, x / OLD_RATE[code], a);
        if (Math.abs(y - want) <= 1e-6 * Math.max(1, want)) indep++; else bad.push(`${code} ${JSON.stringify(a)} got ${y} want ${want}`);
      }
    CK(`D-1 the calculator: ${n} calls across all ${Object.keys(SR).length} rows — byte-identical outside the seventeen (${same}), equal to an independent implementation on v6.00's base inside (${indep})`,
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
CK(`E-1 the AI context's state line ${BR ? "adds Maryland's county tax to \"on the state's own brackets\" where a row carries one" : "PIN v6.00: has no county clause"}`,
   BR ? quasis.some(q => q === (D30L ? "on the state's own brackets\u0000\u0000, top rate \u0000%" : "on the state's own brackets\u0000, top rate \u0000%")) && quasis.some(q => q === " plus a \u0000% county tax")
      : quasis.some(q => q === "on the state's own brackets, top rate \u0000%") && !quasis.some(q => q === " plus a \u0000% county tax"));
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
  await pick("MD"); const md = modelLine();
  if (BR) {
    CK("E-2 Maryland: \"the state's own brackets, 2.00% to 6.50%, plus a 3.30% county tax\", dated \"brackets 2026\"",
       /^Model: the state's own brackets, 2\.00% to 6\.50%, plus a 3\.30% county tax · /.test(md) && (D30L ? /Dollar figures by tax year: exclusion 2026 · brackets 2026 · deductions 2025\./ : /Dollar figures by tax year: exclusion 2026 · brackets 2026\./).test(md), md.slice(0, 200));
    await pick("HI"); const hi = modelLine();
    CK("E-3 Hawaii: \"1.40% to 13.00%\", no county clause", /^Model: the state's own brackets, 1\.40% to 13\.00% · /.test(hi) && !/county/.test(hi), hi.slice(0, 140));
    await pick("ND"); const nd = modelLine();
    CK("E-4 North Dakota: \"0.00% to 2.50%\", dated \"brackets 2026\"", /^Model: the state's own brackets, 0\.00% to 2\.50% · /.test(nd) && (D30L ? /brackets 2026 · deductions 2026\./ : /brackets 2026\./).test(nd), nd.slice(0, 160));
  } else CK("E-2 PIN v6.00: Maryland reads \"7.50% effective rate (an approximation)\"", /^Model: 7\.50% effective rate \(an approximation\)/.test(md), md.slice(0, 120));
  await pick("GA"); const ga = modelLine();
  CK("E-5 a flat-rate state (Georgia) is unchanged: \"4.99% effective rate (an approximation)\"", /^Model: 4\.99% effective rate \(an approximation\)/.test(ga), ga.slice(0, 120));
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}
const DOCS = g.DOCS_HTML().replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
const named = (DOCS.match(/from v6\.01 every progressive state - ([A-Z, ]+) - is taxed on its own bracket schedule/) || [])[1];
if (BR) {
  CK(`E-6 the Taxes entry lists every progressive state on its own schedule, and the list IS the set of rows carrying one (${named ? named.split(", ").length : 0})`,
     !!named && named.split(", ").sort().join(",") === withB.join(","), named);
  CK("E-7 …and names the added rules, each of which a row carries: New York's recapture, Connecticut's added amounts, Arkansas's high-income table, Maryland's county tax",
     /with New York's tax-benefit recapture, Connecticut's phase-out and recapture amounts, Arkansas's high-income table and Maryland's county tax at its highest rate; the flat-rate states keep their one rate/.test(DOCS)
     && !!SR.NY.recapture && !!SR.CT.stepAdds && !!SR.AR.upper && SR.MD.local === 0.033);
  CK("E-8 the methodology entry: every progressive state on its own schedule (ten at v6.00, seventeen at v6.01); the flat-rate states at one rate",
     /taxes every progressive state on its own bracket schedule \(ten at v6\.00, the other seventeen at v6\.01\) and each flat-rate state at its one rate/.test(DOCS) && withB.length === 27);
  CK("E-9 county taxes: skipped except Maryland's, at the highest county rate — and Maryland is the only row carrying one",
     /skips county\/city taxes except Maryland's county tax, taken at the highest county rate \(from v6\.01\)/.test(DOCS) && Object.keys(SR).filter(c => SR[c].local !== undefined).join(",") === "MD");
  CK("E-10 the old claims are gone: \"for the other progressive states one rate stands in for the brackets\", \"ten states on their own bracket schedules\"",
     !/for the other progressive states one rate stands in for the brackets/.test(DOCS) && !/taxes ten states on their own bracket schedules/.test(DOCS) && !/from v6\.00 ten states/.test(DOCS));
} else CK("E-6 PIN v6.00: the Field Manual names ten states on their own schedules and skips every county tax",
          /from v6\.00 ten states - CA, MN, MS, NJ, NY, OK, OR, SC, VA, WI - are taxed on their own bracket schedules/.test(DOCS) && /and skips county\/city taxes\./.test(DOCS) && !named);
done();
