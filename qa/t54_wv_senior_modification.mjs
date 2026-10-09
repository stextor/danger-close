// t54 — WEST VIRGINIA'S $8,000 SENIOR MODIFICATION IS REDUCED BY THE PERSON'S TAXABLE SOCIAL SECURITY (D-21) · docs/SCOPE_D21_WV_SENIOR_MODIFICATION.md · v5.89
//
// THE LAW (read 2026-10-01). W. Va. Code §11-21-12(c)(9)(ii): where a person's other modifications under (c)(1), (2), (5), (6), (7) and
// (8) are under "$8,000 per person", the (c)(9) modification "for all gross income received by that person" is limited to $8,000 minus
// them; at $8,000 or more, none. (c)(8)(E) makes 100 % of the Social Security "included in federal adjusted gross income" — TAXABLE SS —
// a decreasing modification from TY2026. The WV Tax Division: "the higher of the $8,000 modification or the sum of" the others.
//
// THE MODEL. Through v5.88 `stateTaxAnnual` exempted SS (`ss: 0`) AND granted the full $8,000 per person 65+ — optimistic by up to $8,000
// of income per person ($385.60/yr at 4.82 %). v5.89 adds `seniorVsTaxableSS` (WV only; not `ssOffset`, which is gross and reserved for
// MD/ME, and not `ssSharesCap`, CO's): each person 65+ gets max(0, $8,000 − their share of taxable SS), the household's taxable SS split by
// gross benefit (the v5.85 `_txA`/`_txB`). A count-only caller gets the household form, max(0, $8,000 × n − taxable SS): never more generous.
// Not modelled (disclosed in the note): the law's other offsets — WV public/federal pensions' first $2,000, police/fire pensions,
// military retirement, U.S. obligation interest — and the cap at "gross income received by that person" (no per-person income: D-12).
//
// Every expected figure below is computed BY HAND at WV's 4.82 % (asserted first), not read back from the engine.
// Run: node t54_wv_senior_modification.mjs <tag>   Current leg. v588 is registered ONLY so the pre-fix failure stays reproducible.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598", "v599", "v600", "v601"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + String(d).slice(0, 240) : ""}`); } };
const done = () => { console.log(`\nt54 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t54 \u2014 WEST VIRGINIA'S SENIOR MODIFICATION AND TAXABLE SOCIAL SECURITY (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const g = window.__g; const SR = g.STATE_RULES();
const EQ = (n, got, exp) => CK(n, Math.abs(got - exp) <= 0.005, `engine ${Number(got).toFixed(4)}, hand ${Number(exp).toFixed(4)}`);
const T = (code, o) => g.stateTaxAnnual({ code, pen: 0, work: 0, capGains: 0, ssGrossA: 0, ssGrossB: 0, ageB: null, single: true, ...o });
// v6.01 (D-22 batch 2, SCOPE_D22_BRACKETS_V601): West Virginia, Maryland and Maine move to their own schedules (Maryland with its 3.30 % county
// tax). Every hand figure keeps its BASE — the modification arithmetic this suite pins — and, on the v6.01 leg, expects that base on the state's
// schedule, computed here from t65 §A's transcription (`SX`, a v6.00 figure rate × base -> the base's tax). §X recovers the relief by inverting
// the schedule (`SBASE`, bisection: each schedule is strictly increasing) instead of dividing by the rate. A version LIST.
const BR2 = ["v601"].includes(VER);
const _bs = (rows, x) => { let t = 0, lo = 0; for (const [u, r] of rows) { const hi = u === null ? Infinity : u; if (x <= lo) break; t += (Math.min(x, hi) - lo) * r; lo = hi; } return t; };
const _S2 = { WV: [0.0482, [[10000, .0211], [25000, .0281], [40000, .0316], [60000, .0422], [null, .0458]], [[10000, .0211], [25000, .0281], [40000, .0316], [60000, .0422], [null, .0458]], 0],
  MD: [0.075, [[1000, .02], [2000, .03], [3000, .04], [100000, .0475], [125000, .05], [150000, .0525], [250000, .055], [500000, .0575], [1000000, .0625], [null, .065]],
              [[1000, .02], [2000, .03], [3000, .04], [150000, .0475], [175000, .05], [225000, .0525], [300000, .055], [600000, .0575], [1200000, .0625], [null, .065]], 0.033],
  ME: [0.0715, [[27400, .058], [64850, .0675], [1000000, .0715], [null, .0915]], [[54850, .058], [129750, .0675], [1500000, .0715], [null, .0915]], 0] };
const EQ2 = (n, got, exp) => EQ(BR2 ? `${n} [v6.01: the same base on the state's own brackets -> $${exp.toFixed(2)}]` : n, got, exp);
const SCHT = (code, base, single) => { const [, sg, jt, loc] = _S2[code]; return _bs(single ? sg : jt, base) + loc * base; };
const SX = (code, flat, single = true) => BR2 ? SCHT(code, flat / _S2[code][0], single) : flat;
const SBASE = (code, tax, single) => { if (!BR2) return tax / _S2[code][0]; let lo = 0, hi = 1e8;
  for (let i = 0; i < 200 && hi - lo > 1e-7; i++) { const m = (lo + hi) / 2; if (SCHT(code, m, single) < tax) lo = m; else hi = m; } return (lo + hi) / 2; };

// ── 0 · the inputs the hand figures rest on ─────────────────────────────────────────────────────────────────────────────────
CK(BR2 ? "0-1 WV on its own schedule (top rate 4.58 %), cap $8,000, floor 65, SS untaxed (the hand figures assume these)" : "0-1 WV rate is 4.82 %, cap $8,000, floor 65, SS untaxed (the hand figures assume these)", (BR2 ? SR.WV.rate === 0.0458 && !!SR.WV.brackets : SR.WV.rate === 0.0482) && SR.WV.excl65 === 8000 && (SR.WV.exclAge ?? 65) === 65 && SR.WV.ss === 0, JSON.stringify({ rate: SR.WV.rate, excl65: SR.WV.excl65, ss: SR.WV.ss }));

// ── H · the law, case by case (single filer unless stated; $ = 0.0482 × taxable base) ───────────────────────────────────────
EQ2("H-1 single 66, $30,000 IRA, taxable SS $20,400: SS uses the whole $8,000 — 0.0482 × 30,000 = $1,446.00",
   T("WV", { retIncome: 30000, ssTaxableFed: 20400, ssGrossA: 24000, ageA: 66 }), SX("WV", 1446.00));
EQ2("H-2 single 66, taxable SS $3,000: $5,000 left — 0.0482 × 25,000 = $1,205.00",
   T("WV", { retIncome: 30000, ssTaxableFed: 3000, ssGrossA: 14000, ageA: 66 }), SX("WV", 1205.00));
EQ2("H-3 single 66, no taxable SS: the full $8,000 — 0.0482 × 22,000 = $1,060.40",
   T("WV", { retIncome: 30000, ssTaxableFed: 0, ssGrossA: 12000, ageA: 66 }), SX("WV", 1060.40));
EQ2("H-4 single 66, taxable SS exactly $8,000: none left — 0.0482 × 30,000 = $1,446.00",
   T("WV", { retIncome: 30000, ssTaxableFed: 8000, ssGrossA: 15000, ageA: 66 }), SX("WV", 1446.00));
EQ2("H-5 single 64, taxable SS $20,400: under 65, no modification — $1,446.00",
   T("WV", { retIncome: 30000, ssTaxableFed: 20400, ssGrossA: 24000, ageA: 64 }), SX("WV", 1446.00));
EQ2("H-6 joint 66/66, $60,000 IRA, taxable SS $40,000 split 24,000/16,000: none left — 0.0482 × 60,000 = $2,892.00",
   T("WV", { retIncome: 60000, ssTaxableFed: 40000, ssGrossA: 30000, ssGrossB: 20000, ageA: 66, ageB: 66, single: false }), SX("WV", 2892.00, false));
EQ2("H-7 joint 66/66, taxable SS $18,000 split 15,000/3,000 (gross 30,000/6,000): PER PERSON — A none, B $5,000 — 0.0482 × 55,000 = $2,651.00",
   T("WV", { retIncome: 60000, ssTaxableFed: 18000, ssGrossA: 30000, ssGrossB: 6000, ageA: 66, ageB: 66, single: false }), SX("WV", 2651.00, false));
EQ2("H-8 joint 66/64, taxable SS $4,000 split 2,000/2,000: A $6,000, B under 65 — 0.0482 × 54,000 = $2,602.80",
   T("WV", { retIncome: 60000, ssTaxableFed: 4000, ssGrossA: 12000, ssGrossB: 12000, ageA: 66, ageB: 64, single: false }), SX("WV", 2602.80, false));
EQ2("H-9 count-only caller (no ages, two 65+), taxable SS $10,000: household form — 16,000 − 10,000 → 0.0482 × 54,000 = $2,602.80",
   g.stateTaxAnnual({ code: "WV", retIncome: 60000, pen: 0, work: 0, capGains: 0, ssTaxableFed: 10000, ssGrossA: 0, ssGrossB: 0, ageA: null, ageB: null, single: false, persons65: 2 }), SX("WV", 2602.80, false));

// ── P · the other offset states keep their own rules (hand) ─────────────────────────────────────────────────────────────────
EQ2("P-MD single 66, $50,000 IRA, GROSS SS $24,000: 40,600 − 24,000 = 16,600 excluded — 0.075 × 33,400 = $2,505.00",
   T("MD", { retIncome: 50000, ssTaxableFed: 20400, ssGrossA: 24000, ageA: 66 }), SX("MD", 2505.00));
EQ2("P-ME single 66, $50,000 IRA, GROSS SS $24,000: 49,824 − 24,000 = 25,824 excluded — 0.0715 × 24,176 = $1,728.584",
   T("ME", { retIncome: 50000, ssTaxableFed: 20400, ssGrossA: 24000, ageA: 66 }), SX("ME", 1728.584));
CK("P-flags only West Virginia carries seniorVsTaxableSS; MD/ME keep ssOffset; CO keeps ssSharesCap",
   Object.keys(SR).filter(c => SR[c].seniorVsTaxableSS).join(",") === "WV" && SR.MD.ssOffset && SR.ME.ssOffset && SR.CO.ssSharesCap && !SR.WV.ssOffset && !SR.WV.ssSharesCap,
   Object.keys(SR).filter(c => SR[c].seniorVsTaxableSS).join(","));

// ── X · extinction: across a grid, the relief WV grants is EXACTLY the per-person rule — never the old additive one ─────────
// relief = (0.0482 × retIncome − tax) / 0.0482; expected = Σ over persons 65+ of max(0, 8,000 − their taxable SS share).
let n = 0; const bad = []; const badMD = [];
for (const single of [true, false]) for (const aA of [60, 64, 65, 70]) for (const aB of single ? [null] : [null, 60, 66, 72])
for (const tx of [0, 3000, 7999, 8000, 20000]) for (const [gA, gB] of single ? [[24000, 0]] : [[24000, 0], [15000, 9000], [12000, 12000]]) {
  const o = { retIncome: 60000, ssTaxableFed: tx, ssGrossA: gA, ssGrossB: gB, ageA: aA, ageB: aB, single };
  const relief = 60000 - SBASE("WV", T("WV", o), single);   // v6.01: the base recovered from the schedule (v6.00: from the 4.82 % rate)
  const shA = single ? 1 : (gA + gB > 0 ? gA / (gA + gB) : 0.5); const txA = tx * shA, txB = tx - txA;
  const want = (aA >= 65 ? Math.max(0, 8000 - txA) : 0) + (!single && aB !== null && aB >= 65 ? Math.max(0, 8000 - txB) : 0);
  if (Math.abs(relief - want) > 0.01) bad.push(`${single ? "S" : "J"} ${aA}/${aB} tx${tx} g${gA}/${gB}: ${relief.toFixed(2)} vs ${want.toFixed(2)}`);
  // Maryland on the same grid: its GROSS-SS rule, unchanged
  const rMD = 60000 - SBASE("MD", T("MD", o), single);
  const wMD = (aA >= 65 ? Math.max(0, 40600 - gA) : 0) + (!single && aB !== null && aB >= 65 ? Math.max(0, 40600 - gB) : 0);
  if (Math.abs(rMD - wMD) > 0.01) badMD.push(`${single ? "S" : "J"} ${aA}/${aB} g${gA}/${gB}: ${rMD.toFixed(2)} vs ${wMD.toFixed(2)}`);
  n++;
}
CK(`X-0 not vacuous: ${n} grid households (≥ 100)`, n >= 100, n);
CK("X-1 West Virginia: relief = Σ max(0, $8,000 − that person's taxable SS), every grid household", bad.length === 0, `${bad.length} off: ${bad.slice(0, 3).join(" · ")}`);
CK("X-2 Maryland on the same grid: relief = Σ max(0, $40,600 − that person's GROSS SS) — untouched", badMD.length === 0, `${badMD.length} off: ${badMD.slice(0, 3).join(" · ")}`);

// ── N · the note says what is and is not modelled ───────────────────────────────────────────────────────────────────────────
const note = SR.WV.note || "";
CK("N-1 WV's note: reduced by that person's taxable SS, citing §11-21-12(c)(9), modelled per person",
   /reduced by that person's taxable Social Security/.test(note) && /§11-21-12\(c\)\(9\)/.test(note) && /modelled per person/.test(note), note.slice(0, 200));
CK("N-2 WV's note discloses the unmodelled offsets: public pensions (optimistic) and military retirement (conservative)",
   /public or federal pensions/.test(note) && /optimistic/.test(note) && /military retirement/.test(note) && /conservative/.test(note), note.slice(0, 200));
done();
