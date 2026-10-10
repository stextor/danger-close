// d30_ref.mjs — an INDEPENDENT implementation of D-30 batch 1 (docs/SCOPE_D30_DEDUCTIONS_V602.md, added v6.02): the 27 progressive states'
// standard deductions, personal exemptions and personal credits, and the state tax they produce. Imported by t66 (groups B–D) and by the
// suites whose derived pins price one of the 27 (DD-14: a pin keeps its BASE and, on a v6.02+ leg, expects that base after the state's
// deductions and credits — computed HERE, not by the app).
//
// INDEPENDENCE. The deduction figures are transcribed below from the scope's §0.2 primary sources and written as one plain function per
// state — deliberately NOT the app's data shape (`deduct` components evaluated by `stateDeductions`), so a slip in the app's evaluator or in
// a component's encoding cannot be reproduced here by construction. The schedules are read from STATE_RULES (`brackets`): t64 §A and t65 §A
// hold every row to its source, so reading them adds no circularity for what this file checks. Arkansas's upper table, Connecticut's added
// amounts, New York's recapture and Maryland's county and capital-gains taxes are transcribed here (t65 §A holds the app's copies).
//
// MEASURES. `base` is the state AGI the calculator builds (after its retirement exclusions); `agi` its federal-AGI measure. A caller with
// only work income and no Social Security, pension, retirement income or gains has base == agi == work (t66 §C's hand cases do that).
const cnt = (ageA, ageB, single, k) => ((ageA != null && ageA >= k) ? 1 : 0) + ((!single && ageB != null && ageB >= k) ? 1 : 0);
const FEDSTD = (s, n65) => (s ? 16100 : 32200) + (s ? 2050 : 1650) * n65;   // Rev. Proc. 2025-32 §4.14 (TY2026)
const CT_E = {   // C.G.S. §12-703 Table E: [upTo inclusive, decimal]
  s: [[18800, .75], [19300, .70], [19800, .65], [20300, .60], [20800, .55], [21300, .50], [21800, .45], [22300, .40], [25000, .35], [25500, .30], [26000, .25],
      [26500, .20], [31300, .15], [31800, .14], [32300, .13], [32800, .12], [33300, .11], [60000, .10], [60500, .09], [61000, .08], [61500, .07], [62000, .06],
      [62500, .05], [63000, .04], [63500, .03], [64000, .02], [64500, .01], [Infinity, 0]],
  j: [[30000, .75], [30500, .70], [31000, .65], [31500, .60], [32000, .55], [32500, .50], [33000, .45], [33500, .40], [40000, .35], [40500, .30], [41000, .25],
      [41500, .20], [50000, .15], [50500, .14], [51000, .13], [51500, .12], [52000, .11], [96000, .10], [96500, .09], [97000, .08], [97500, .07], [98000, .06],
      [98500, .05], [99000, .04], [99500, .03], [100000, .02], [100500, .01], [Infinity, 0]] };
export const D30_STATES = ["AL", "AR", "CA", "CT", "DC", "DE", "HI", "KS", "MD", "ME", "MN", "MO", "MS", "MT", "ND", "NE", "NJ", "NM", "NY", "OK", "OR", "RI", "SC", "VA", "VT", "WI", "WV"];
// Each returns { ded, credit, pct } for a return: s = single, p = filers (1 or 2), n65 / n60 = filers at or above that age.
export const D30 = {
  AL: ({ s, base }) => { const k = base > 25500 ? Math.floor((base - 25500) / 500) : 0;
    return { ded: Math.max(s ? 2500 : 5000, (s ? 3000 : 8500) - (s ? 25 : 175) * k) + (s ? 1500 : 3000) }; },
  AR: ({ p, n65 }) => ({ ded: 2470 * p, credit: 29 * p + 29 * n65 }),
  CA: ({ s, p, n65, agi }) => { const thr = s ? 252203 : 504411, k = agi > thr ? Math.ceil((agi - thr) / 2500) : 0;
    return { ded: s ? 5706 : 11412, credit: Math.max(0, 153 - 6 * k) * (p + n65) }; },
  CT: ({ s, base }) => { const thr = s ? 30000 : 48000, k = base > thr ? Math.ceil((base - thr) / 1000) : 0;
    return { ded: Math.max(0, (s ? 15000 : 24000) - 1000 * k), pct: (s ? CT_E.s : CT_E.j).find(([u]) => base <= u)[1] }; },
  DC: ({ s, n65 }) => ({ ded: (s ? 15000 : 30000) + (s ? 2000 : 1600) * n65 }),
  DE: ({ s, p, n65, n60 }) => ({ ded: (s ? 3250 : 6500) + 2500 * n65, credit: 110 * p + 110 * n60 }),
  HI: ({ s, p, n65 }) => ({ ded: (s ? 8000 : 16000) + 1144 * (p + n65) }),
  KS: ({ s, n65 }) => ({ ded: (s ? 3605 : 8240) + (s ? 850 : 700) * n65 + (s ? 9160 : 18320) }),
  MD: ({ s, p, n65, agi }) => {
    const [a, b, c] = s ? [100000, 125000, 150000] : [150000, 175000, 200000];
    const each = agi <= a ? 3200 : agi <= b ? 1600 : agi <= c ? 800 : 0;
    const full = s ? [0, 1000][n65] : [0, 1000, 1750][n65], [lo, hi] = s ? [50000, 100000] : [100000, 150000];
    return { ded: (s ? 3350 : 6700) + each * p + 1000 * n65, credit: agi < lo ? full : agi <= hi ? full / 2 : 0 }; },
  ME: ({ s, p, n65, base }) => {
    const sd = (s ? 15700 : 31400) + (s ? 2050 : 1650) * n65, ex = 5300 * p;
    const r1 = Math.min(1, Math.round(Math.max(0, base - (s ? 102250 : 204550)) / (s ? 75000 : 150000) * 1e4) / 1e4);
    const r2 = Math.min(1, Math.round(Math.max(0, base - (s ? 341000 : 409150)) / 125000 * 1e4) / 1e4);
    return { ded: (sd - sd * r1) + (ex - ex * r2) }; },
  MN: ({ s, n65, agi }) => { const sd = (s ? 15300 : 30600) + (s ? 2000 : 1600) * n65;
    const cut = 0.03 * Math.max(0, Math.min(agi, 337800) - 244400) + 0.10 * Math.max(0, agi - 337800);
    return { ded: sd - Math.min(cut, 0.8 * sd) }; },
  MO: ({ s, n65 }) => ({ ded: FEDSTD(s, n65) }),
  MS: ({ s, n65 }) => ({ ded: (s ? 2300 : 4600) + (s ? 6000 : 12000) + 1500 * n65 }),
  MT: ({ s, n65 }) => ({ ded: FEDSTD(s, n65) }),
  ND: ({ s, n65 }) => ({ ded: FEDSTD(s, n65) }),
  NE: ({ s, p, n65 }) => ({ ded: (s ? 8850 : 17700) + (s ? 2050 : 1700) * n65, credit: 176 * p }),
  NJ: ({ p, n65 }) => ({ ded: 1000 * p + 1000 * n65 }),
  NM: ({ s, p, n65, agi }) => ({ ded: FEDSTD(s, n65) + p * Math.max(0, 2500 - (s ? 0.15 : 0.10) * Math.max(0, agi - (s ? 20000 : 30000))) }),
  NY: ({ s }) => ({ ded: s ? 8000 : 16050 }),
  OK: ({ s, p, n65, agi }) => ({ ded: (s ? 6350 : 12700) + 1000 * p + (agi <= (s ? 15000 : 25000) ? 1000 * n65 : 0) }),
  OR: ({ s, p, n65, agi }) => ({ ded: (s ? 2835 : 5670) + (s ? 1200 : 1000) * n65, credit: agi <= (s ? 100000 : 200000) ? 256 * p : 0 }),
  RI: ({ s, p, base }) => { const k = base > 261000 ? Math.ceil((base - 261000) / 7450) : 0, f = Math.max(0, 1 - 0.2 * k);
    return { ded: (s ? 11200 : 22400) * f + 5250 * p * f }; },
  SC: ({ s, agi }) => { const full = s ? 15000 : 30000, f = Math.min(1, Math.max(0, agi - (s ? 40000 : 80000)) / (s ? 55000 : 110000));
    return { ded: full - Math.floor(full * f / 10) * 10 }; },
  VA: ({ s, p, n65 }) => ({ ded: (s ? 8750 : 17500) + 930 * p + 800 * n65 }),
  VT: ({ s, p, n65 }) => ({ ded: (s ? 7650 : 15300) + 1250 * n65 + 5300 * p }),
  WI: ({ s, p, n65, base }) => ({ ded: Math.max(0, (s ? 13960 : 25840) - (s ? 0.12 : 0.19778) * Math.max(0, base - (s ? 20120 : 29040))) + 700 * p + 250 * n65 }),
  WV: ({ p }) => ({ ded: 2000 * p }),
};
export function d30Deductions(code, { single = false, ageA = null, ageB = null, base = 0, agi = 0 }) {
  const f = D30[code]; if (!f) return { ded: 0, credit: 0, pct: 0 };
  return { ded: 0, credit: 0, pct: 0, ...f({ s: single, p: single ? 1 : 2, n65: cnt(ageA, ageB, single, 65), n60: cnt(ageA, ageB, single, 60), base, agi }) };
}
const bsum = (rows, x) => { let t = 0, lo = 0; for (const [u, r] of rows) { const hi = u === null ? Infinity : u; if (x <= lo) break; t += (Math.min(x, hi) - lo) * r; lo = hi; } return t; };
const rateAt = (rows, x) => { for (const [u, r] of rows) if (u === null || x <= u) return r; return rows[rows.length - 1][1]; };
const CT_ADD = { s: [[56500, 5000, 25, 250], [105000, 5000, 25, 250], [200000, 5000, 90, 2700], [500000, 5000, 50, 450]],
                 j: [[100500, 5000, 50, 500], [210000, 10000, 50, 500], [400000, 10000, 180, 5400], [1000000, 10000, 100, 900]] };
// The state tax for one of the 27 from the calculator's own measures: deductions off the base, the schedule (and its added rules) on taxable
// income — New York's recapture fraction and Connecticut's added amounts on the base — then the credits, then Maryland's county tax on taxable
// income and its 2 % capital-gains tax on federal AGI over $350,000. Utah's credit never applies (Utah is not among the 27).
export function d30Tax(SR, code, { base, agi, single = false, ageA = null, ageB = null, capGains = 0 }) {
  const d = d30Deductions(code, { single, ageA, ageB, base, agi }), ti = Math.max(0, base - d.ded);
  const sch = single ? SR[code].brackets.single : SR[code].brackets.joint;
  let t = bsum(sch, ti);
  if (code === "AR" && ti > 94700) { t = bsum([[4700, 0.02], [null, 0.037]], ti); if (ti <= 97600) t -= Math.max(0, 290 - 10 * (Math.ceil((ti - 94700) / 100) - 1)); }
  if (code === "CT") for (const [over, per, each, mx] of (single ? CT_ADD.s : CT_ADD.j)) if (base > over) t += Math.min(mx, each * Math.ceil((base - over) / per));
  if (code === "NY" && base > 107650) {
    const up = single ? 215400 : 161550, fr = single ? 0.059 : 0.054;
    if (ti <= up) t += (fr * ti - t) * Math.min(1, Math.round((base - 107650) / 50000 * 1e4) / 1e4); else t = rateAt(sch, ti) * ti;
  }
  t = Math.max(0, t * (1 - d.pct) - d.credit);
  if (code === "MD") { t += 0.033 * ti; if (agi > 350000) t += 0.02 * Math.max(0, capGains); }
  return { tax: t, ti, ...d };
}

// ── DD-14: derived pins elsewhere ──
// A pin that priced one of the 27 keeps its hand BASE `x`. On a D-30 leg it expects that base after the state's deductions and credits:
// d30Want(SR, code, x, d), where `d` is the calculator's own `_onDetail` record of the very call being pinned (its federal-AGI measure, the
// filing status and the ages it applied). If the calculator built a DIFFERENT base, the answer is NaN and the pin fails — the old pin's
// claim about the base is kept, not re-derived from the app. Maryland's capital-gains tax (federal AGI over $350,000) needs the pin's own
// `capGains`; without it the answer there is NaN.
export function d30Want(SR, code, x, d, capGains) {
  if (!d || Math.abs(d.base - x) > 0.01 || (code === "MD" && d.agi > 350000 && capGains === undefined)) return NaN;
  return d30Tax(SR, code, { base: x, agi: d.agi, single: d.single, ageA: d.ageA, ageB: d.ageB, capGains: capGains || 0 }).tax;
}
// Wrap a stateTaxAnnual so every call records its detail in `.last` (the seam is ignored by a build without it).
export function d30Recorder(fn) { const r = { last: null }; r.call = (a) => fn({ ...a, _onDetail: (d) => { r.last = d; } }); return r; }
// One-line adoption for a suite whose pins are written as an old flat figure (rate × base): `d30Pins(stateTaxAnnual, SR, on)` gives
//   .S             the calculator — recording each call's detail when `on` (a D-30 leg), the plain function otherwise
//   .X(code, flat, rate)   the pin's v6.02 expectation: base = flat / rate, after the state's deductions and credits (d30Want)
//   .B(code, base, cg?)    the same from a base written directly (cg: Maryland's capital gains, where its 2 % tax applies)
//   .tag()         the label the last .X / .B left (" [v6.02: …]"), cleared on read, for the check that prints the pin.
export function d30Pins(fn, SR, on) {
  const rec = d30Recorder(fn); let tag = "";
  const B = (code, base, capGains) => { const w = d30Want(SR, code, base, rec.last, capGains);
    tag = ` [v6.02: the same base, $${base.toFixed(2)}, after the state's deductions and credits -> $${(+w).toFixed(2)}]`; return w; };
  return { S: on ? rec.call : fn, rec, B, X: (code, flat, rate) => B(code, flat / rate), tag: () => { const t = tag; tag = ""; return t; } };
}
