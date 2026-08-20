// Hand implementation of 26 U.S.C. Sec.86, written from the statutory text
// (Cornell LII, fetched 2026-08-20), NOT copied from any app expression.
//
// Sec.86(b)(1): taxpayer is described if MAGI + 1/2 SS > base amount.
//   Call that sum "provisional".
// Sec.86(a)(1): includible = lesser of
//     (A) 1/2 of SS benefits, or
//     (B) 1/2 of the excess described in (b)(1)   [= 1/2 (provisional - base)]
// Sec.86(a)(2): if provisional > adjusted base amount, includible = lesser of
//     (A) 85% of (provisional - adjusted base)
//         + lesser of [ the (a)(1) amount , 1/2 (adjusted base - base) ]
//     (B) 85% of SS benefits
// Sec.86(c): base = 25,000 (32,000 joint); adjusted base = 34,000 (44,000 joint)

export function statute86(ss, otherIncome, joint) {
  const base    = joint ? 32000 : 25000;
  const adjbase = joint ? 44000 : 34000;
  const prov = otherIncome + 0.5 * ss;
  if (prov <= base) return 0;                       // (b)(1) not met
  const para1 = Math.min(0.5 * ss, 0.5 * (prov - base));   // (a)(1)
  if (prov <= adjbase) return para1;
  const a = 0.85 * (prov - adjbase) + Math.min(para1, 0.5 * (adjbase - base)); // (a)(2)(A)
  const b = 0.85 * ss;                                                        // (a)(2)(B)
  return Math.min(a, b);
}

// ---- the three in-app copies, transcribed verbatim from v5.40 source ----

// Roth tab, L8841-8844 (the target of this scope)
export function rothTab(ss, otherIncome, joint) {
  const T1 = joint ? 32000 : 25000, T2 = joint ? 44000 : 44000 - 10000; // 34000 single
  const prov = otherIncome + ss * 0.5;
  if (prov > T2) return Math.round(ss * 0.85);
  if (prov > T1) return Math.round(Math.min((prov - T1) * 0.5, ss * 0.85));
  return 0;
}

// Engine B, L4990-4997  (taxableSSPortion)
export function engineB(ss, otherIncome, joint) {
  const T1 = joint ? 32000 : 25000, T2 = joint ? 44000 : 34000;
  const prov = otherIncome + 0.5 * ss;
  if (prov <= T1) return 0;
  if (prov <= T2) return Math.min(0.5 * (prov - T1), 0.5 * ss);
  const lower = 0.5 * Math.min(prov - T1, T2 - T1);
  const upper = 0.85 * (prov - T2);
  return Math.min(ss * 0.85, lower + upper);
}

// Engine C, L4394
export function engineC(ss) { return ss * 0.85; }

// ── Provenance ────────────────────────────────────────────────────────────────
// Written 2026-08-20 against v5.40 (src md5 6b7cebb1476ee66e57079b713b94ba75) for
// SCOPE_ROTH_TAB_MAGI_MEASUREMENT §3 step 2. statute86() is transcribed from the
// statutory text at law.cornell.edu/uscode/text/26/86, NOT from any app expression.
// The three app copies below are transcribed verbatim from v5.40 source and exist
// only so the comparison is reproducible.
//
// TOOLING. Asserts nothing. Counted in NO release check total (OPERATIONS §B1).
