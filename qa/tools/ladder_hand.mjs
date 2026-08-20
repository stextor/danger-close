// Per-ladder-year IRMAA MAGI hand computation.
//
// SCOPE_ROTH_TAB_MAGI_MEASUREMENT sec.3 steps 1-2, against v5.40
// (src md5 6b7cebb1476ee66e57079b713b94ba75).
//
// WHAT IS INDEPENDENT AND WHAT IS NOT — read this before trusting a number.
//
//   INDEPENDENT (from primary sources, written here, not copied from the app):
//     - the Sec.86 taxable-SS fraction            -> statute86() in hand_86.mjs
//     - the Uniform Lifetime Table divisor         -> IRS Pub. 590-B App. B Table III
//     - the RMD applicable age                     -> SECURE 2.0 sec.107
//     - what belongs in IRMAA MAGI                 -> 42 U.S.C. 1395r(i)(4)(A):
//           AGI (sec.62) + tax-exempt interest.  AGI carries pension, wages/ordinary
//           streams, the Sec.86 taxable portion of benefits, Roth conversions, taxable
//           IRA distributions (RMDs), ordinary+qualified dividends and net capital gain.
//
//   NOT INDEPENDENT, and deliberately so — these are MODELING choices, not tax law,
//   and they are COMMON INPUTS to both figures being compared, so reusing them
//   isolates the MAGI-assembly divergence instead of confounding it:
//     - the ladder window            (rothLadderStart .. rothLadderEnd, L663-668)
//     - the balance recursion        (grownTrad = bal*1.045; conv = min(rothAmount, grownTrad))
//     - BASE_GROWTH = 0.045          (L985)
//     - spouseBWorkTaper             (20k/18k/15k/0, L1354 region)
//     - the seed balances            (retireStartBalances, hand-evaluated below)
//     - SS start-year gating         (L8824)
//
// NO ENGINE WAS RUN AND NO ENGINE OUTPUT WAS READ to produce any figure here.

import { statute86 } from "./hand_86.mjs";

const ULT = {72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22.0,79:21.1,
             80:20.2,81:19.4,82:18.5,83:17.7,84:16.8,85:16.0,86:15.2,87:14.4,
             88:13.7,89:12.9,90:12.2,91:11.5,92:10.8,93:10.1,94:9.5,95:8.9,
             96:8.4,97:7.8,98:7.3,99:6.8,100:6.4};                 // Pub. 590-B App. B Table III
const rmdAge = by => by <= 1950 ? 72 : by <= 1959 ? 73 : 75;        // SECURE 2.0 sec.107
const GROWTH = 0.045;

// The Roth tab's own SS expression (v5.40 L8841-8844), transcribed for comparison only.
function rothTabSS(totalSS, nonSS, joint) {
  const T1 = joint ? 32000 : 25000, T2 = joint ? 44000 : 34000;
  const prov = nonSS + totalSS * 0.5;
  if (prov > T2) return Math.round(totalSS * 0.85);
  if (prov > T1) return Math.round(Math.min((prov - T1) * 0.5, totalSS * 0.85));
  return 0;
}

export function runLadder(hh) {
  const { dobA, dobB, retireYear, ssAmo, ssAage, ssBmo, ssBage, pensionMo,
          tradInitA, tradInitB, rmdShareA, rmdShareB, taxableSleeve, divYieldPct,
          realizedGainByYear = {}, rothAmount, workTaper } = hh;

  const endA = dobA + (rmdAge(dobA) - 1);
  const endB = dobB + (rmdAge(dobB) - 1);
  const ladderEnd = Math.max(endA, endB);
  const ssAyear = dobA + ssAage, ssByear = dobB + ssBage;
  const ssApartial = Math.max(0, 12 - ssAmo + 1);
  const pension = pensionMo * 12;

  let balA = tradInitA, balB = tradInitB;
  const rows = [];

  for (let year = retireYear; year <= ladderEnd; year++) {
    const grownA = balA * (1 + GROWTH), grownB = balB * (1 + GROWTH);
    const grown = grownA + grownB;
    const conv = Math.min(rothAmount, grown);
    const convA = grown > 0 ? conv * (grownA / grown) : 0;
    const convB = conv - convA;

    // --- income facts for the year ---
    const ageA = year - dobA, ageB = year - dobB;
    const ssA = year > ssAyear ? ssAmo * 12 : year === ssAyear ? ssAmo * ssApartial : 0;
    // NOTE: the Roth tab pays spouse B's benefit in EVERY ladder year with no start-year
    // gating (L8822: `const spouseBSS = _rsSsB * 12;`). The hand figure gates it, per SSA
    // entitlement. For the example household the two coincide (ladder starts the same year
    // B claims), so this cannot move that result; it can move a constructed one.
    const ssB_hand = year >= ssByear ? ssBmo * 12 : 0;
    const ssB_apptab = ssBmo * 12;
    const work = workTaper(year, retireYear);

    // RMD: Pub. 590-B — PRIOR year-end balance / divisor for the age attained this year.
    const rmdA = ageA >= rmdAge(dobA) ? (balA * rmdShareA) / (ULT[Math.min(ageA,100)] || 6.4) : 0;
    const rmdB = ageB >= rmdAge(dobB) ? (balB * rmdShareB) / (ULT[Math.min(ageB,100)] || 6.4) : 0;
    const rmd = rmdA + rmdB;

    const dividends = taxableSleeve * (divYieldPct / 100);
    const gains = realizedGainByYear[year] || 0;

    // --- (1) the app's Roth-tab expression, L8847 ---
    const ss_apptab = ssA + ssB_apptab;
    const nonSS_apptab = pension + work + conv;                 // L8834: omits RMD/div/gain
    const taxableSS_apptab = rothTabSS(ss_apptab, nonSS_apptab, true);
    const magi_apptab = pension + work + taxableSS_apptab + conv;

    // --- (2) IRMAA MAGI per 42 U.S.C. 1395r(i)(4), Sec.86 for the SS fraction ---
    const ss_hand = ssA + ssB_hand;
    const nonSS_hand = pension + work + conv + rmd + dividends + gains;  // full AGI ex-SS
    const taxableSS_hand = statute86(ss_hand, nonSS_hand, true);
    const magi_hand = nonSS_hand + taxableSS_hand;

    rows.push({
      year, ageA, ageB, conv, ssTotal: ss_hand, work, rmd, dividends, gains,
      taxableSS_apptab, taxableSS_hand, magi_apptab, magi_hand,
      delta: magi_apptab - magi_hand,
      dSS: taxableSS_apptab - taxableSS_hand, dRMD: -rmd, dDiv: -dividends, dGain: -gains,
    });

    balA = grownA - convA - rmdA;
    balB = grownB - convB - rmdB;
  }
  return { rows, ladderEnd, endA, endB, ssAyear, ssByear };
}

// ── Provenance ────────────────────────────────────────────────────────────────
// Written 2026-08-20 against v5.40 (src md5 6b7cebb1476ee66e57079b713b94ba75) for
// SCOPE_ROTH_TAB_MAGI_MEASUREMENT sec.3 steps 1-2. Results in
// docs/MEASUREMENT_roth_tab_magi_v5_40.md. Depends on qa/tools/hand_86.mjs.
//
// TOOLING. Asserts nothing. Counted in NO release check total (OPERATIONS sec.B1).
