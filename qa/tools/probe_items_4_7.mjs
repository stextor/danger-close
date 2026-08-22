// PROBE — measure tidy-up items 4 and 7 against v5.44. Both are the SAME defect (§86's
// ½-benefits cap) in two places, and they are mirror images of each other.
// Scoping evidence only. TOOLING — asserts nothing, counted in NO check total (§B1).
import { statute86 } from "./hand_86.mjs";

const usd = n => "$" + Math.round(n).toLocaleString();
const PAIR = { joint: [32000, 44000], single: [25000, 34000] };

// ── ITEM 4 · Engine B `taxableSSPortion`, transcribed VERBATIM from v5.44 L4990 ─────────
// Middle tier is CORRECT (caps at ½ of benefits). The UPPER tier's `lower` term is not:
// the statute's para1 = min(½SS, ½(prov−base)) and Engine B omits the ½SS half.
function engineB(ss, other, T1, T2) {
  const provisional = other + 0.5 * ss;
  if (provisional <= T1) return 0;
  if (provisional <= T2) return Math.min(0.5 * (provisional - T1), 0.5 * ss);
  const lower = 0.5 * Math.min(provisional - T1, T2 - T1);     // ← the defect
  const upper = 0.85 * (provisional - T2);
  return Math.min(ss * 0.85, lower + upper);
}

// ── ITEM 7 · the Roth tab, transcribed VERBATIM from v5.44 L8903-8907 ───────────────────
// Upper tier is CORRECT since v5.42. The MIDDLE tier caps at 85% of benefits, not ½.
function rothTab(ss, other, T1, T2) {
  const provisional = other + ss * 0.5;
  if (provisional > T2) {
    const para1 = Math.min(ss * 0.5, (provisional - T1) * 0.5);
    return Math.round(Math.min((provisional - T2) * 0.85 + Math.min(para1, (T2 - T1) * 0.5), ss * 0.85));
  }
  if (provisional > T1) return Math.round(Math.min((provisional - T1) * 0.5, ss * 0.85));  // ← the defect
  return 0;
}

function sweep(fn, label) {
  console.log(`\n── ${label} ──`);
  for (const [who, [T1, T2]] of Object.entries(PAIR)) {
    let worst = 0, at = null, n = 0, maxSS = 0, minSS = Infinity, tierLo = Infinity, tierHi = 0;
    for (let ss = 0; ss <= 40000; ss += 25) {
      for (let other = 0; other <= 150000; other += 25) {
        const app = Math.round(fn(ss, other, T1, T2));
        const law = Math.round(statute86(ss, other, who === "joint"));
        const err = app - law;
        if (err === 0) continue;
        n++;
        if (ss > maxSS) maxSS = ss;
        if (ss < minSS) minSS = ss;
        const prov = other + ss * 0.5;
        tierLo = Math.min(tierLo, prov); tierHi = Math.max(tierHi, prov);
        if (err > worst) { worst = err; at = { ss, other, prov, app, law }; }
      }
    }
    console.log(`  ${who.padEnd(6)} diverging cells ${String(n).padStart(7)} | worst overstatement ${usd(worst)}`);
    if (at) console.log(`         worst at benefits ${usd(at.ss)}, other income ${usd(at.other)}, provisional ${usd(at.prov)} ` +
      `→ app ${usd(at.app)} vs statute ${usd(at.law)}`);
    if (n) console.log(`         band: benefits ${usd(minSS)}–${usd(maxSS)}, provisional ${usd(tierLo)}–${usd(tierHi)}`);
  }
}

sweep(engineB, "ITEM 4 — Engine B `taxableSSPortion` (upper tier's `lower` term omits the ½SS cap)");
sweep(rothTab, "ITEM 7 — Roth tab MIDDLE tier (caps at 85% of benefits, statute caps at ½)");

// ── do they overlap, or are they mirror images? ─────────────────────────────────────────
console.log("\n── are the two defects in the SAME provisional-income band? ──");
for (const [who, [T1, T2]] of Object.entries(PAIR)) {
  let b4 = 0, b7 = 0, both = 0;
  for (let ss = 0; ss <= 40000; ss += 50)
    for (let other = 0; other <= 150000; other += 50) {
      const law = Math.round(statute86(ss, other, who === "joint"));
      const e4 = Math.round(engineB(ss, other, T1, T2)) !== law;
      const e7 = Math.round(rothTab(ss, other, T1, T2)) !== law;
      if (e4) b4++; if (e7) b7++; if (e4 && e7) both++;
    }
  console.log(`  ${who.padEnd(6)} item4-only ${b4 - both} | item7-only ${b7 - both} | BOTH ${both}`);
}

// ── the shipped example household ───────────────────────────────────────────────────────
console.log("\n── does the example household exercise either? ──");
for (const [lbl, ss] of [["both alive (2031+)", 55200], ["pre-2031 (B only)", 15600]]) {
  const [T1, T2] = PAIR.joint;
  let hit4 = 0, hit7 = 0;
  for (let other = 0; other <= 200000; other += 100) {
    const law = Math.round(statute86(ss, other, true));
    if (Math.round(engineB(ss, other, T1, T2)) !== law) hit4++;
    if (Math.round(rothTab(ss, other, T1, T2)) !== law) hit7++;
  }
  console.log(`  benefits ${usd(ss)} (${lbl}): item 4 diverges in ${hit4} cells, item 7 in ${hit7}`);
}
console.log("  (>= $12,000 of benefits puts a joint household outside BOTH bands — the 85% cap binds first)");
