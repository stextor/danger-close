// spousal_oracle.mjs — SSA's spousal (excess) benefit, written in the suite from the primary sources (docs/SCOPE_D77_SPOUSAL_BENEFIT_V647.md
// §0.1), never from the app's helper. NEW at v6.47 (t110's re-gate, t111). Exact where its inputs are whole dollars: the reduction is done in
// integers and the dollar rounded half up, so a top-up of exactly $x.50 is never decided by floating point.
//
//   excess   = ½ × PIA_W − PIA_S, nothing when it is not positive                               (POMS RS 00615.250)
//   reduced  25/36 of 1% for each of the first 36 months before 67, 5/12 of 1% for each beyond   (POMS RS 00615.201 B)
//   from     the later of S's own filing and W's (deemed filing; W must have filed)             (POMS GN 00204.035; ssa.gov applying7)
//   67 is reached on the day before the 67th birthday, so in that day's month                    (20 CFR 404.102)
//   no delayed credits on it; S's own delayed credits are subtracted from it                     (20 CFR 404.313(a), (e)(2); POMS RS 00615.694 A)
//
// Months are absolute: year × 12 + (month − 1). A date of birth is { year, month, day }.
export const ym = (year, month) => year * 12 + (month - 1);
export const fraMonth = dob => {   // the month of the day before the 67th birthday — by the calendar, not by the app's "born on the 1st" shortcut
  const d = new Date(Date.UTC(dob.year + 67, (dob.month || 1) - 1, dob.day || 1));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
};
// { monthly, start } — monthly in whole dollars (0 when none), start an absolute month (null when none).
export function spousalOracle({ piaW, piaS, ownS, dobS, ymS, ymW }) {
  const whole = [piaW, piaS, ownS].every(v => Number.isInteger(Number(v) || 0));
  const twice = (Number(piaW) || 0) - 2 * (Number(piaS) || 0);   // 2 × excess
  if (!(twice > 0)) return { monthly: 0, start: null };
  const start = Math.max(ymS, ymW), fra = fraMonth(dobS), m = Math.max(0, fra - start);
  const drc = ymS > fra ? Math.max(0, (Number(ownS) || 0) - (Number(piaS) || 0)) : 0;
  let monthly;
  if (whole) {
    // 2 × excess × (1 − 25/3600 × min(m, 36) − 5/1200 × max(0, m − 36)), over a common denominator of 7200
    const num = twice * (7200 - 50 * Math.min(m, 36) - 30 * Math.max(0, m - 36)) - 2 * 7200 * drc;   // over 2 × 7200
    monthly = num <= 0 ? 0 : Math.floor((num + 7200) / 14400);                                      // half up
  } else {
    const red = Math.min(m, 36) * 25 / 3600 + Math.max(0, m - 36) * 5 / 1200;
    monthly = Math.max(0, Math.round(twice / 2 * (1 - red) - drc));
  }
  return monthly > 0 ? { monthly, start } : { monthly: 0, start: null };
}
// A plan's date of birth from its "YYYY-MM-DD" field (the app's default when absent is not this oracle's business: callers pass plans that hold one).
export const dobOf = s => { const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s || "")); return m ? { year: +m[1], month: +m[2], day: +m[3] } : null; };
