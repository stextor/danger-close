// fed_oracle_v630.mjs — v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): an INDEPENDENT federal-income-tax computation for one Engine B
// row, written from the statutes, never from the app's code. It takes the row's income legs as INPUTS (pension, work, the taxable RMD, the
// conversion, the drawdown bridge's ordinary draw, other ordinary streams, qualified dividends, realized gains, benefits — as the t19
// ledger takes Engine D's draws) and computes, in the row's own year's dollars:
//   · taxable Social Security by 26 U.S.C. §86 (hand_86.mjs, the statute oracle) on the year's filing status;
//   · the standard deduction (§63(c)) and the age-65 extra (§63(f)) — Rev. Proc. 2025-32 — rounded to the dollar, as the IRS tables are;
//   · ordinary tax on the 2026 brackets and the LTCG stack (§1(h)) on the 0/15/20 bands, all indexed at §1(f)(3)'s chained CPI-U, modelled
//     as the plan's inflation less 0.25 points (CBO, 12 December 2024).
// Filing: joint through the first death year, Single after it (IRS Pub. 501); a Single survivor counts only their own age. Out of scope
// (the caller's household must not need them): the temporary OBBBA senior bonus (2025–2028), AMT, NIIT. Used by t40 and t42.
import { existsSync } from "fs";
const _here = new URL(".", import.meta.url);
const _o = [new URL("./hand_86.mjs", _here), new URL("../hand_86.mjs", _here)].find(u => existsSync(u));
const { statute86 } = await import(_o.href);

const BR = { M: [[0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550], [0.32, 512450], [0.35, 768700], [0.37, Infinity]],
             S: [[0.10, 12400], [0.12, 50400], [0.22, 105700], [0.24, 201775], [0.32, 256225], [0.35, 640600], [0.37, Infinity]] };   // §2.01
const LT = { M: [[0, 98900], [0.15, 613700], [0.20, Infinity]], S: [[0, 49450], [0.15, 545500], [0.20, Infinity]] };                     // §2.03
const STD = { M: 32200, S: 16100 }, SR = { M: 1650, S: 2050 };                                                                           // §2.15

// i: the plan's inflation; tl: { dobA:{year}, dobB:{year}, lifeExpA, lifeExpB, single }; asOf: the constants' base year (2026) — the year
// the tables above were published for, NOT the plan's as-of date (v6.33, D-67: t96 §D passes 2026 for a plan dated 2027).
export function makeFedOracle(i, tl, asOf = 2026) {
  const IX = yr => Math.pow(1 + i - 0.0025, yr - asOf);
  const prog = (ti, tbl, yr) => { let t = 0, p = 0; for (const [r, u0] of tbl) { const u = u0 === Infinity ? Infinity : u0 * IX(yr); if (ti <= p) break; t += (Math.min(ti, u) - p) * r; p = u; } return t; };
  const d1 = tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
  const survA = tl.dobA.year + tl.lifeExpA >= tl.dobB.year + tl.lifeExpB;
  return (r) => {
    const single = !!tl.single || r.yr > d1, st = single ? "S" : "M";
    const other = r.pen_y + r.work_y + r.rmdTax_y + r.conv_y + r.ordDraw_y + (r.otherOrd_y || 0), pref = (r.div_y || 0) + (r.capGains_y || 0);
    const ssT = statute86(r.ssA_y + r.ssB_y, other + pref, !single);
    const n65 = tl.single ? (r.ageA >= 65 ? 1 : 0) : single ? ((survA ? r.ageA : r.ageB) >= 65 ? 1 : 0) : (r.ageA >= 65 ? 1 : 0) + (r.ageB >= 65 ? 1 : 0);
    const ded = Math.round(STD[st] * IX(r.yr)) + n65 * Math.round(SR[st] * IX(r.yr));
    const ord = other + ssT, tiO = Math.max(0, ord - ded), tiAll = Math.max(0, ord + pref - ded);
    return { fed: prog(tiO, BR[st], r.yr), cg: prog(tiAll, LT[st], r.yr) - prog(tiO, LT[st], r.yr), magi: ord + pref, ssT, ded };
  };
}
