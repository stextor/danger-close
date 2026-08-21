// PROBE — is the Roth tab's MIDDLE tier (86(a)(1)) actually correct, as the v5.42
// brief 3 asserts? Sweeps app expression vs statute86 across the middle tier only.
// TOOLING. Asserts nothing. Counted in NO check total (OPERATIONS B1).
import { statute86 } from "./hand_86.mjs";

// transcribed VERBATIM from v5.41 src L8880-8883
function rothTabMid(totalSS, nonSSincome, T1, T2) {
  const provisional = nonSSincome + totalSS * 0.5;
  let taxableSS = 0;
  if (provisional > T2) taxableSS = Math.round(totalSS * 0.85);
  else if (provisional > T1) taxableSS = Math.round(Math.min((provisional - T1) * 0.5, totalSS * 0.85));
  else taxableSS = 0;
  return taxableSS;
}

for (const joint of [true, false]) {
  const T1 = joint ? 32000 : 25000, T2 = joint ? 44000 : 34000;
  let worst = 0, at = null, n = 0;
  for (let ss = 0; ss <= 30000; ss += 25) {
    for (let other = 0; other <= 60000; other += 25) {
      const prov = other + 0.5 * ss;
      if (prov <= T1 || prov > T2) continue;          // MIDDLE TIER ONLY
      const app = rothTabMid(ss, other, T1, T2);
      const law = Math.round(statute86(ss, other, joint));
      const err = app - law;
      if (err !== 0) n++;
      if (err > worst) { worst = err; at = { ss, other, prov, app, law }; }
    }
  }
  console.log(`${joint ? "JOINT " : "SINGLE"}  middle-tier cells diverging: ${n}   worst overstatement: $${worst}`);
  if (at) console.log(`         worst at SS=$${at.ss} other=$${at.other} prov=$${at.prov} -> app $${at.app} vs statute $${at.law}`);
}
