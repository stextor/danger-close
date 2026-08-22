// PROBE — measure tidy-up items 3 and 6 against v5.43, rather than inheriting the v5.41
// figures from SCOPE_FIX_tidyup_six.md. Scoping evidence only.
// TOOLING. Asserts nothing. Counted in NO check total (OPERATIONS §B1).
import { __g } from "../app_v543.mjs";

const usd = n => (n < 0 ? "-" : "") + "$" + Math.round(Math.abs(n)).toLocaleString();
const tl = __g.PLAN_TIMELINE();
const G = 0.045;                                   // tradGrowth, the tab's own rate

console.log("timeline: asOfYear", tl.asOfYear, "| rothLadderStart", tl.rothLadderStart,
  "| dobA", tl.dobA.year, "dobB", tl.dobB.year, "| single", !!tl.single);

const rsb = __g.retireStartBalances(tl.rothLadderStart);
console.log("\nretireStartBalances(" + tl.rothLadderStart + "):");
for (const k of ["tradInitA", "tradInitB", "annShareA", "annShareB", "rmdInitA", "rmdInitB"])
  if (k in rsb) console.log(`   ${k.padEnd(11)} ${typeof rsb[k] === "number" && Math.abs(rsb[k]) > 2 ? usd(rsb[k]) : rsb[k]}`);

// ── ITEM 3 · the noConv basis-year / growth-period mismatch ─────────────────────────────
// Shipped:  noConvTrad = t0 * (1+G)^yrs   where t0 = balance at ROTH LADDER START
//                                         and  yrs = rmdYear − AS-OF YEAR
// The seed is measured at ladder start; the exponent counts from the as-of year. The gap
// between those two dates is compounded twice over.
console.log("\n── ITEM 3 — noConv grows the ladder-start balance from the AS-OF year ──");
const rows = [];
for (const [who, dobYr] of [["A", tl.dobA.year], ["B", tl.single ? null : tl.dobB.year]]) {
  if (dobYr == null) continue;
  const age = __g.rmdStartAge(dobYr), yr = dobYr + age;
  const yrsShipped = Math.max(0, yr - tl.asOfYear);          // as shipped
  const yrsCorrect = Math.max(0, yr - tl.rothLadderStart);   // matches where t0 is measured
  const t0 = who === "A" ? rsb.tradInitA : rsb.tradInitB;
  const div = __g.rmdDivisor(age);
  const shippedTrad = t0 * Math.pow(1 + G, yrsShipped);
  const correctTrad = t0 * Math.pow(1 + G, yrsCorrect);
  const shippedRmd = Math.round(shippedTrad / div), correctRmd = Math.round(correctTrad / div);
  rows.push({ who, age, yr, yrsShipped, yrsCorrect, shippedRmd, correctRmd });
  console.log(`  ${who}: RMD age ${age} in ${yr} | exponent shipped ${yrsShipped} vs ${yrsCorrect} correct ` +
    `(${yrsShipped - yrsCorrect} extra years of growth)`);
  console.log(`     noConv RMD ${usd(shippedRmd)} -> ${usd(correctRmd)}   delta ${usd(correctRmd - shippedRmd)} ` +
    `(${(((shippedRmd - correctRmd) / correctRmd) * 100).toFixed(1)}% overstated)`);
}
const shipTot = rows.reduce((s, r) => s + r.shippedRmd, 0), corrTot = rows.reduce((s, r) => s + r.correctRmd, 0);
console.log(`  COMBINED "no conversions" RMD: ${usd(shipTot)} -> ${usd(corrTot)}   delta ${usd(corrTot - shipTot)}` +
  `  (${(((shipTot - corrTot) / corrTot) * 100).toFixed(1)}% overstated)`);
console.log(`  This is the figure behind the tab's "Combined RMDs reduced by $X/yr" line.`);

// ── ITEM 6 · annuity money inside the RMD basis ─────────────────────────────────────────
// A non-qualified annuity in Other accounts carries no RMD, but t0 is the WHOLE Traditional
// balance. retireStartBalances already computes the RMD-bearing share.
console.log("\n── ITEM 6 — annuity money inside the noConv RMD basis ──");
if (!("annShareA" in rsb)) { console.log("  annShareA/B not exposed — cannot measure here"); }
else {
  let sA = 0, sB = 0;
  for (const r of rows) {
    const share = r.who === "A" ? rsb.annShareA : rsb.annShareB;
    const t0 = r.who === "A" ? rsb.tradInitA : rsb.tradInitB;
    const div = __g.rmdDivisor(r.age);
    const withAnnuity = Math.round(t0 * Math.pow(1 + G, r.yrsCorrect) / div);
    const rmdBearing = Math.round(t0 * (1 - share) * Math.pow(1 + G, r.yrsCorrect) / div);  // annShare is the EXEMPT share
    console.log(`  ${r.who}: annShare ${share} | ${usd(withAnnuity)} -> ${usd(rmdBearing)}  delta ${usd(rmdBearing - withAnnuity)}`);
    if (r.who === "A") sA = withAnnuity - rmdBearing; else sB = withAnnuity - rmdBearing;
  }
  console.log(`  COMBINED overstatement from annuity money: ${usd(sA + sB)}/yr`);
}

// ── the two together ────────────────────────────────────────────────────────────────────
console.log("\n── BOTH ITEMS, on the same block ──");
let both = 0;
for (const r of rows) {
  const share = r.who === "A" ? rsb.annShareA : rsb.annShareB;
  const t0 = r.who === "A" ? rsb.tradInitA : rsb.tradInitB;
  const div = __g.rmdDivisor(r.age);
  both += Math.round(t0 * (1 - (share ?? 0)) * Math.pow(1 + G, r.yrsCorrect) / div);
}
console.log(`  shipped ${usd(shipTot)} -> both fixed ${usd(both)}   combined delta ${usd(both - shipTot)} ` +
  `(${(((shipTot - both) / both) * 100).toFixed(1)}% overstated)`);
