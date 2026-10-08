// t39 — MAINE'S PENSION-DEDUCTION PHASEOUT, AND MONTANA'S 65+ SUBTRACTION AND SOCIAL SECURITY
// (SCOPE_ME_PHASEOUT_MT_CORRECTIONS; added for v5.73). Runs on BOTH legs:
//     node t39_me_mt.mjs v572   |   node t39_me_mt.mjs v573
//
// SOURCES (read 2026-09-15). Maine: 36 M.R.S. §5122(2)(M-2) and (M-3), Revisor's text — the M-2(1)(a)
// deduction, already reduced by each person's Social Security, is reduced by itself times
// (federal AGI − $250,000 joint / $125,000 single) / $100,000, the fraction floored at 0 and capped at 1.
// Montana: DOR 2025 Form 2 line 6 ($5,660 per person 65+) and the DOR Tax Simplification Hub (taxable SS
// is included "to the extent that [it is] included in federal taxable income").
//
// EVERY EXPECTED FIGURE IS WORKED BY HAND BELOW, then compared to engine output — never read back.
// The engine's state measure `agi` = retIncome + pen + work + capGains + ssTaxableFed; Maine taxes no SS
// (ss 0), so a Maine cell is 0.0715 × (max(0, retIncome + pen − exclusion) + work + capGains).
//
// ⚠ THE PRIOR LEG PINS WHAT MOVES: on v572 Maine's exclusion is never phased out, Montana subtracts $5,500
//   and taxes half of federally taxable SS. Gate per leg; never soften a figure so both legs agree.
// ⚠ THE ORDERING CELL (M-7) IS THE ONE THAT MAKES THE ORDER A TEST. Applying the phaseout BEFORE the Social
//   Security offset gives $4,108 there instead of $23,216; a phaseout that ignored order would pass M-1…M-6.
import { createRequire } from "module";

const VER = process.argv[2];
const KNOWN_VERSIONS = ["v572", "v573", "v574", "v575", "v576", "v577", "v578", "v579", "v580", "v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.\n    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST = VER === "v573" || (VER === "v574" || (VER === "v575" || VER === "v576" || VER === "v577" || VER === "v578" || VER === "v579" || VER === "v580" || VER === "v581" || VER === "v582" || VER === "v583" || VER === "v584" || VER === "v585" || VER === "v586" || VER === "v587" || VER === "v588" || VER === "v589" || VER === "v590" || VER === "v591" || VER === "v593" || VER === "v594" || VER === "v595" || VER === "v596" || VER === "v597"));

// v5.86 (D-18): Maine's cap is $49,824 (TY2026, MRS 2026 Form 1040ES-ME line 2) from v586; every case below that derives from
// the cap is gated so each earlier leg keeps the $48,216 it shipped with. Recomputed by hand at the build (fractions, not floats).
const CAP586 = (Number(String(VER).replace(/[^0-9]/g, "")) || 0) >= 586;
const g = (await import(`./app_${VER}.mjs`)).__g;
const S = g.stateTaxAnnual, R = g.STATE_RULES();

let pass = 0, fail = 0; const fails = [];
const EPS = 0.01;
const T = (name, got, exp) => {
  const ok = typeof exp === "number" ? Math.abs(got - exp) < EPS : got === exp;
  if (ok) pass++; else { fail++; fails.push(`  \u2717 ${name}: got ${got}  exp ${exp}`); }
};
console.log(`t39 \u2014 MAINE PHASEOUT / MONTANA (${VER})`);

// ── Maine ────────────────────────────────────────────────────────────────────────────────────────
// A household is given by its AGI; all non-SS income is retirement income so the base stays linear.
//   joint, both 67, SS received $30,000 and $20,000, federally taxable SS $42,500 (85% of $50,000)
//   offset caps: (48,216 − 30,000) + (48,216 − 20,000) = 18,216 + 28,216 = 46,432
//   v586+: (49,824 − 30,000) + (49,824 − 20,000) = 19,824 + 29,824 = 49,648
const ME_J = (agi) => S({ code: "ME", retIncome: agi - 42500, ssTaxableFed: 42500,
  ssGrossA: 30000, ssGrossB: 20000, ageA: 67, ageB: 67, single: false });
//   single, 67, SS received $24,000, taxable $20,400; offset cap 48,216 − 24,000 = 24,216 (v586+: 49,824 − 24,000 = 25,824)
const ME_S = (agi) => S({ code: "ME", retIncome: agi - 20400, ssTaxableFed: 20400,
  ssGrossA: 24000, ageA: 67, single: true });

// M-1 · joint, AGI $249,999 — below the threshold, identical on both legs
//   0.0715 × (207,499 − 46,432) = 0.0715 × 161,067 = 11,516.2905
//   v586+: 0.0715 × (207,499 − 49,648) = 0.0715 × 157,851 = 11,286.3465
T("M-1 joint AGI $249,999: the full offset-reduced deduction (both legs)", ME_J(249999), CAP586 ? 11286.3465 : 11516.2905);
// M-2 · joint, AGI $250,000 — AT the threshold the numerator is zero: still the full $46,432
//   0.0715 × (207,500 − 46,432) = 0.0715 × 161,068 = 11,516.362
//   v586+: 0.0715 × (207,500 − 49,648) = 0.0715 × 157,852 = 11,286.418
T("M-2 joint AGI $250,000: at the threshold, nothing is phased out (both legs)", ME_J(250000), CAP586 ? 11286.418 : 11516.362);
if (POST) {
  // M-3 · AGI $300,000: fraction 50,000 / 100,000 = 0.5 → 46,432 × 0.5 = 23,216
  //   0.0715 × (257,500 − 23,216) = 0.0715 × 234,284 = 16,751.306
  //   v586+: 49,648 × 0.5 = 24,824; 0.0715 × (257,500 − 24,824) = 0.0715 × 232,676 = 16,636.334
  T("M-3 joint AGI $300,000: half phased out", ME_J(300000), CAP586 ? 16636.334 : 16751.306);
  // M-4 · AGI $350,000: fraction 1 → deduction 0
  //   0.0715 × 307,500 = 21,986.25
  T("M-4 joint AGI $350,000: fully phased out", ME_J(350000), 21986.25);
  // M-5 · AGI $400,000: the fraction is capped at one — still 0, never negative
  //   0.0715 × 357,500 = 25,561.25
  T("M-5 joint AGI $400,000: the fraction is capped at one (no negative deduction)", ME_J(400000), 25561.25);
  // M-6 · single: $125,000 → full $24,216; $175,000 → half, $12,108; $225,000 → 0
  //   0.0715 × (104,600 − 24,216) = 0.0715 × 80,384  = 5,747.456
  //   0.0715 × (154,600 − 12,108) = 0.0715 × 142,492 = 10,188.178
  //   0.0715 × 204,600                                 = 14,628.9
  //   v586+: 0.0715 × (104,600 − 25,824) = 0.0715 × 78,776 = 5,632.484; 0.0715 × (154,600 − 12,912) = 0.0715 × 141,688 = 10,130.692
  T("M-6a single AGI $125,000: at the single threshold, the full offset-reduced deduction", ME_S(125000), CAP586 ? 5632.484 : 5747.456);
  T("M-6b single AGI $175,000: half phased out", ME_S(175000), CAP586 ? 10130.692 : 10188.178);
  T("M-6c single AGI $225,000: fully phased out", ME_S(225000), 14628.9);
  // M-7 · ORDER. At AGI $300,000 the statute's order (offset, then phaseout) gives $23,216 (M-3).
  //   Phaseout first would give 48,216 × 0.5 = 24,108 per person, then offsets: max(0, 24,108 − 30,000) = 0
  //   and 24,108 − 20,000 = 4,108 → $4,108, tax 0.0715 × (257,500 − 4,108) = 18,117.528. It must NOT be that.
  //   v586+: phaseout first gives 24,912 per person → offsets 0 and 4,912 → 0.0715 × 252,588 = 18,060.042. It must NOT be that.
  T("M-7 the phaseout applies AFTER the Social Security offset (not the phaseout-first figure)",
    Math.abs(ME_J(300000) - (CAP586 ? 18060.042 : 18117.528)) > 1 ? 1 : 0, 1);
} else {
  // prior leg: no phaseout at any AGI — the deduction stays $46,432
  //   0.0715 × (257,500 − 46,432) = 0.0715 × 211,068 = 15,091.362
  //   0.0715 × (307,500 − 46,432) = 0.0715 × 261,068 = 18,666.362
  //   0.0715 × (154,600 − 24,216) = 0.0715 × 130,384 = 9,322.456
  T("M-3 [KNOWN DEFECT pre-v5.73] joint AGI $300,000: deduction NOT phased out", ME_J(300000), 15091.362);
  T("M-4 [KNOWN DEFECT pre-v5.73] joint AGI $350,000: deduction still whole", ME_J(350000), 18666.362);
  T("M-6b [KNOWN DEFECT pre-v5.73] single AGI $175,000: deduction still whole", ME_S(175000), 9322.456);
}
// M-8 · composition: Social Security above the cap zeroes the offset; the phaseout cannot resurrect it.
//   SS $50,000 and $60,000, taxable $93,500 (85% of $110,000), AGI $100,000 → retirement $6,500
//   0.0715 × 6,500 = 464.75 on both legs
T("M-8 offset already zero: stays zero, whatever the phaseout says (both legs)",
  S({ code: "ME", retIncome: 6500, ssTaxableFed: 93500, ssGrossA: 50000, ssGrossB: 60000, ageA: 67, ageB: 67, single: false }), 464.75);
// M-9 · the scalar still equals what the row yields below the threshold, with no SS (the D-3(b) rule)
//   AGI $100,000 all retirement, joint, no SS: 0.0715 × (100,000 − 96,432) = 0.0715 × 3,568 = 255.112
//   v586+: 0.0715 × (100,000 − 99,648) = 0.0715 × 352 = 25.168
T("M-9 below the threshold with no SS, two people exclude twice the cap (both legs)",
  S({ code: "ME", retIncome: 100000, ageA: 67, ageB: 67, single: false }), CAP586 ? 25.168 : 255.112);
T(CAP586 ? "M-10 the scalar is the statutory $49,824 (TY2026)" : "M-10 the scalar is still the statutory $48,216", R.ME.excl65, CAP586 ? 49824 : 48216);

// ── Montana ──────────────────────────────────────────────────────────────────────────────────────
const MT = (o) => S(Object.assign({ code: "MT" }, o));
if (POST) {
  // single 67, retirement $40,000, taxable SS $20,000
  //   0.0565 × ((40,000 − 5,660) + 20,000) = 0.0565 × 54,340 = 3,070.21
  T("T-1 single 67 with SS: $5,660 off, ALL taxable SS in the base", MT({ retIncome: 40000, ssTaxableFed: 20000, ageA: 67, single: true }), 3070.21);
  // joint 67/67, retirement $60,000, work $10,000, gains $5,000, taxable SS $30,000
  //   0.0565 × ((60,000 − 11,320) + 10,000 + 30,000 + 5,000) = 0.0565 × 93,680 = 5,292.92
  T("T-2 joint 67/67: $11,320 off, all taxable SS", MT({ retIncome: 60000, work: 10000, capGains: 5000, ssTaxableFed: 30000, ageA: 67, ageB: 67 }), 5292.92);
  // joint 67/63: one person qualifies
  //   0.0565 × ((60,000 − 5,660) + 10,000 + 30,000 + 5,000) = 0.0565 × 99,340 = 5,612.71
  T("T-3 joint 67/63: one subtraction", MT({ retIncome: 60000, work: 10000, capGains: 5000, ssTaxableFed: 30000, ageA: 67, ageB: 63 }), 5612.71);
  // single 67, no SS: 0.0565 × (40,000 − 5,660) = 0.0565 × 34,340 = 1,940.21
  T("T-4 single 67, no SS: only the subtraction moved", MT({ retIncome: 40000, ageA: 67, single: true }), 1940.21);
  T("T-5 the row carries $5,660 and ss 1", (R.MT.excl65 === 5660 && R.MT.ss === 1) ? 1 : 0, 1);
} else {
  //   0.0565 × ((40,000 − 5,500) + 10,000) = 0.0565 × 44,500 = 2,514.25
  //   0.0565 × ((60,000 − 11,000) + 10,000 + 15,000 + 5,000) = 0.0565 × 79,000 = 4,463.5
  //   0.0565 × (40,000 − 5,500) = 0.0565 × 34,500 = 1,949.25
  T("T-1 [KNOWN DEFECT pre-v5.73] single 67 with SS: $5,500 and HALF of taxable SS", MT({ retIncome: 40000, ssTaxableFed: 20000, ageA: 67, single: true }), 2514.25);
  T("T-2 [KNOWN DEFECT pre-v5.73] joint 67/67", MT({ retIncome: 60000, work: 10000, capGains: 5000, ssTaxableFed: 30000, ageA: 67, ageB: 67 }), 4463.5);
  T("T-4 [KNOWN DEFECT pre-v5.73] single 67, no SS: $5,500", MT({ retIncome: 40000, ageA: 67, single: true }), 1949.25);
}

// ── Extinction: a row with `ssOffset` may carry no condition shape except `phaseout` ─────────────
const bad = Object.keys(R).filter(c => R[c].ssOffset && R[c].exclTest && R[c].exclTest.kind !== "phaseout");
T("X-1 no ssOffset row carries a bands/taper table (their composition was never decided)", bad.join(","), "");
const phased = Object.keys(R).filter(c => R[c].exclTest && R[c].exclTest.kind === "phaseout").join(",");
T(`X-2 the phaseout shape is on exactly ${POST ? "Maine" : "no row"}`, phased, POST ? "ME" : "");
// X-3: the notes say what the model does
if (POST) {
  T("X-3 Maine's note no longer says the phaseout is not modelled", /phaseout[^.]*not modelled/i.test(R.ME.note) ? 1 : 0, 0);
  T("X-4 Montana's note no longer claims an income-based SS exemption", /income-based exemption/i.test(R.MT.note) ? 1 : 0, 0);
  T("X-5 Montana's note names the 2025 figure", /\$5,660/.test(R.MT.note) ? 1 : 0, 1);
}

console.log(`t39 SUITE (${VER}): ${pass} passed, ${fail} failed`);
if (fails.length) console.log(fails.join("\n"));
process.exit(fail ? 1 : 0);
