// t24 — ROTH TAB §86: the upper tier is a PHASE-IN, not a cliff (v5.42 extinction invariants)
// Run: node t24_ss86_phasein.mjs v542   |   node t24_ss86_phasein.mjs v541
//
// THE DEFECT THIS EXISTS FOR. Through v5.41 the ladder's upper tier read, as one expression:
//     if (provisional > _ssT2) taxableSS = Math.round(totalSS * 0.85);
// 26 U.S.C. §86(a)(2) does not do that — it phases in above the adjusted base amount:
//     includible = min( 0.85 × SS, 0.85 × (prov − adjbase) + min( para1, ½(adjbase − base) ) )
//     para1      = min( ½ × SS, ½ × (prov − base) )                              [§86(a)(1)]
// The app jumped straight to the full 85% of benefits the moment provisional crossed the
// adjusted base, overstating taxable Social Security by up to 5.3×. The two converge only at
// provisional ≈ $92,141 on the example household.
//
// WHY THE SLIDER MUST BE DRIVEN. At the $70,000 conversion DEFAULT every ladder year is
// already past convergence, so the defect is worth exactly $0 there — which is how it
// survived every release that only ever looked at the default. **Assertions at the default
// prove nothing about this defect.** This suite drives the conversion slider to five
// positions, four of which move and one ($70,000) which must NOT.
//
// THE ORACLE. Expectations are NOT hardcoded: each is computed here from `statute86` in
// `hand_86.mjs`, transcribed from the statutory text at law.cornell.edu/uscode/text/26/86 and
// NOT from any app expression. The same oracle produced the release's expected figures
// (`tools/derive_v542.mjs`). That is deliberate — at v5.41 the expectations came from a
// second, independently written script which had silently drifted from the release's own
// scope, and the brief's table shipped wrong twice over. One oracle used for both the
// expectation and the assertion cannot drift from itself.
//
// WHAT VALIDATES THE LADDER TRANSCRIPTION. The recursion below (balances, growth, RMDs,
// conversion caps, income streams) is transcribed from v5.41 src and is UNCHANGED by v5.42 —
// only `taxableSS` moves. The PRIOR leg asserts the rendered figures against that recursion
// driven by the OLD cliff expression. If the transcription were wrong, the v541 leg would go
// red. So its greenness is the proof that the v542 leg's expectations rest on a faithful
// model, not on a coincidence.
//
// PRECISION (OPERATIONS §M). The Roth ladder is component-inline: no module-level binding
// exists, so its only output path is the rendered DOM, and MAGI renders as
// `Math.round(x / 1000)` + "K" — a ±$500 ceiling. Stated, not wished away. The effect being
// measured is $4,200–$38,030, which clears that ceiling by 8×–76×, so it does not threaten
// the finding. A dollar-exact MAGI assertion is NOT available without hoisting the block to
// module level, and §M requires that hoist to be its own release.
//
// GATED PER LEG (OPERATIONS §B2). v5.41 and earlier legitimately contain the cliff; each leg
// asserts what was true for its own build. The prior leg is a dated [KNOWN DEFECT] pin
// (OPERATIONS §D) asserting the wrong behaviour on purpose, and it is the before/after
// witness for this release.
import { createRequire } from "module";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
// TRAP (OPERATIONS §C): seed Math.random BEFORE importing the bundle.
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v542";
const KNOWN_VERSIONS = ["v540", "v541", "v542", "v543", "v544", "v545", "v546", "v547"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST_FIX = VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547";

// The repo keeps the oracle at qa/tools/hand_86.mjs; PROJECT KNOWLEDGE IS FLAT and holds it
// beside the suites. Resolve rather than assume, and say which copy was used, so a stale
// duplicate is visible instead of silent (the t21 pattern).
const ORACLE_CANDIDATES = [join(HERE, "hand_86.mjs"), join(HERE, "tools", "hand_86.mjs")];
const ORACLE = ORACLE_CANDIDATES.find(p => existsSync(p));
if (!ORACLE) {
  console.log("t24 SUITE: 0 passed, 1 failed\n  \u2717 §86 oracle not found. Looked in:\n" +
    ORACLE_CANDIDATES.map(c => "      " + c).join("\n"));
  process.exit(1);
}
const { statute86 } = await import(pathToFileURL(ORACLE).href);

let pass = 0, fail = 0;
const T = (name, ok, detail = "") => {
  if (ok) { pass++; } else { fail++; console.log(`  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`); }
};

// ── the SHIPPED (pre-fix) upper tier, transcribed verbatim from v5.41 L8880-8883 ──────────
// Kept so the prior leg can be asserted positively and so §C can name the exact wrong number
// the fix must no longer produce. NOT used to compute any v542 expectation.
function cliff86(ss, nonSS, T1, T2) {
  const prov = nonSS + ss * 0.5;
  if (prov > T2) return Math.round(ss * 0.85);
  if (prov > T1) return Math.round(Math.min((prov - T1) * 0.5, ss * 0.85));
  return 0;
}

// ── the ladder recursion, transcribed from v5.41 src; UNCHANGED by v5.42 ─────────────────
// Example-household constants: retireStartBalances(2029).tradInitA/B, getPension()*12,
// getSSA()*12, getSSB()*12, and the spouse-B part-time work taper.
const G = 0.045, ULT = { 75: 24.6, 76: 23.7 };
const A0 = 1180000, B0 = 218600;
const PEN = 4800, SSA = 39600, SSB = 15600;
const SSA_YR = 2031, T1 = 32000, T2 = 44000;              // joint thresholds; example is MFJ
// v5.46: spouse B's benefit is gated by B's OWN claim date, mirroring A. On the example
// household B claims JANUARY 2029 — the ladder's first year — so the partial-month credit is a
// full twelve months and every figure below is unchanged by that release. The gate is carried
// here anyway: without it this transcription is wrong for any household where B claims later,
// and a future fixture would inherit the defect this suite is supposed to model faithfully.
// (Spouse A's term keeps its whole-year form: A's claim month is January too, so the two agree
// on this household. t28 carries the partial-month case on a purpose-built fixture.)
const SSB_YR = 2029, SSB_MO = 1;
const bTerm = y => y > SSB_YR ? SSB : y === SSB_YR ? SSB / 12 * Math.max(0, 12 - SSB_MO + 1) : 0;
const dobA = 1964, dobB = 1966, START = 2029, END = 2040, endA = 2038, endB = 2040;
const taper = y => (y === 2029 ? 20000 : y === 2030 ? 18000 : y === 2031 ? 15000 : 0);

function ladder(rothAmount, ssFn) {
  let a = A0, b = B0; const out = [];
  for (let y = START; y <= END; y++) {
    const ageA = y - dobA, ageB = y - dobB;
    const rA = ageA >= 75 ? a / (ULT[ageA] || 6.4) : 0;    // prior 31 Dec basis (Pub. 590-B)
    const rB = ageB >= 75 ? b / (ULT[ageB] || 6.4) : 0;
    const rmd = Math.round(rA + rB);
    const gA = a * (1 + G), gB = b * (1 + G);
    const capA = Math.max(0, (y <= endA ? gA : 0) - rA);
    const capB = Math.max(0, (y <= endB ? gB : 0) - rB);
    const conv = Math.min(rothAmount, capA + capB);
    const cA = (capA + capB) > 0 ? conv * (capA / (capA + capB)) : 0;
    a = Math.max(0, gA - cA - rA); b = Math.max(0, gB - (conv - cA) - rB);

    const ss = (y >= SSA_YR ? SSA : 0) + bTerm(y);
    const nonSS = PEN + taper(y) + conv + rmd;
    const taxableSS = ssFn(ss, nonSS);
    out.push({
      y, prov: nonSS + ss * 0.5, ss, taxableSS,
      magi: PEN + taper(y) + taxableSS + conv + rmd,
    });
  }
  return out;
}
const statuteLeg = p => ladder(p, (ss, nonSS) => Math.round(statute86(ss, nonSS, true)));
const cliffLeg   = p => ladder(p, (ss, nonSS) => cliff86(ss, nonSS, T1, T2));
const K = n => Math.round(n / 1000);

// ── mount ────────────────────────────────────────────────────────────────────────────────
const require = createRequire(import.meta.url);
require(`./dom_${VER}.cjs`);
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async el => {
  await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); });
  await flush();
};

console.log(`t24 \u2014 \u00a786 UPPER-TIER PHASE-IN (${VER})`);
console.log(`     oracle: ${ORACLE}\n`);

await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
const ex = [...body().querySelectorAll("button,[role=button],div")]
  .filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
T("SETUP: landing offers Use Example Data", !!ex);
await click(ex); await flush(); await flush();
const tab = [...body().querySelectorAll("button,div,span")]
  .find(el => (el.textContent || "").trim().toLowerCase() === "roth");
T("SETUP: Roth tab reachable", !!tab);
await click(tab); await flush(); await flush();

// ── §A · the slider, and the fact that it can be driven ──────────────────────────────────
// TRAP: this is a REACT CONTROLLED input. Assigning `.value` does nothing — React's own
// value tracker swallows the change and no onChange fires. The assignment must go through
// the native prototype setter, then an `input` event is dispatched.
const slider = [...body().querySelectorAll("input[type=range]")]
  .find(s => s.max === "400000" && s.step === "5000");
T("A-1: the conversion slider is on the Roth tab (0\u2013400,000 step 5,000)", !!slider,
  slider ? "" : "not found");
T("A-1: it starts at the $70,000 default \u2014 the position where this defect is worth $0",
  !!slider && slider.value === "70000", slider ? slider.value : "");
const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
const drive = async v => {
  await act(async () => {
    setNative.call(slider, String(v));
    slider.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
  await flush(); await flush();
};

const rowRe = /(20\d\d)\$(-?\d+)K\$(-?\d+)K(\d+)%\$(-?[\d.]+)K\$(-?\d+)K/g;
const readRows = () => {
  const txt = body().textContent || ""; const out = []; let m; rowRe.lastIndex = 0;
  while ((m = rowRe.exec(txt)) !== null)
    out.push({ year: +m[1], conv: +m[2], taxable: +m[3], rate: +m[4], tax: +m[5], magi: +m[6] });
  return out;
};

await drive(15000);
T("A-2: driving the slider actually re-renders the ladder (the native-setter route works)",
  readRows().length === 12 && readRows()[3].magi !== 122, JSON.stringify(readRows().map(r => r.magi)));

// ── §B · MAGI at five slider positions, every year, against the oracle ───────────────────
// $70,000 is included precisely because it is the $0 case that made this defect look
// harmless: it must be IDENTICAL on both legs.
const POSITIONS = [15000, 20000, 30000, 50000, 70000];
const EXPECTED_MOVERS = { 15000: 10, 20000: 9, 30000: 8, 50000: 7, 70000: 0 };
for (const pos of POSITIONS) {
  await drive(pos);
  const rows = readRows();
  const byYear = Object.fromEntries(rows.map(r => [r.year, r]));
  T(`B[$${pos / 1000}K]: 12 ladder rows render (2029\u20132040)`, rows.length === 12, `got ${rows.length}`);
  const model = POST_FIX ? statuteLeg(pos) : cliffLeg(pos);
  let bad = [];
  for (const row of model) {
    const got = byYear[row.y];
    if (!got || got.magi !== K(row.magi)) bad.push(`${row.y}: want $${K(row.magi)}K got ${got ? "$" + got.magi + "K" : "no row"}`);
  }
  T(`B[$${pos / 1000}K]: every ladder year's MAGI matches the ${POST_FIX ? "\u00a786 statute" : "shipped cliff"} model (\u00b1$500, \u00a7M)`,
    bad.length === 0, bad.join(" | "));

  // How many years the fix moves at this position — an independent shape check on the same
  // data. A fix that reached too far or not far enough lands on a different count.
  const moved = statuteLeg(pos).filter((r, i) => K(r.magi) !== K(cliffLeg(pos)[i].magi)).length;
  T(`B[$${pos / 1000}K]: the \u00a786 correction moves ${EXPECTED_MOVERS[pos]} of 12 years`,
    moved === EXPECTED_MOVERS[pos], `model says ${moved}`);
}

// ── §C · EXTINCTION — the cliff's numbers must no longer appear where they differed ──────
// A value assertion alone can pass by luck. This names the specific wrong figures the old
// expression produced and requires their absence, so the cliff cannot come back quietly.
if (POST_FIX) {
  await drive(15000);
  const by = Object.fromEntries(readRows().map(r => [r.year, r.magi]));
  // 2032–2038 plateau: the peak of the defect. Cliff $66,720 → $67K; statute $28,690 → $29K.
  let allPlateau = [2032, 2033, 2034, 2035, 2036, 2037, 2038].every(y => by[y] === 29);
  T("C-1 (V542): at $15K the 2032\u20132038 plateau reads $29K, not the cliff's $67K (\u2212$38,030)",
    allPlateau, JSON.stringify(by));
  T("C-2 (V542): 2031 reads $56K, not the cliff's $82K (\u2212$25,280)", by[2031] === 56, `$${by[2031]}K`);
  T("C-3 (V542): 2029 reads $49K, not the cliff's $53K (\u2212$4,200)", by[2029] === 49, `$${by[2029]}K`);
  T("C-4 (V542): 2030 reads $45K, not the cliff's $51K (\u2212$5,900)", by[2030] === 45, `$${by[2030]}K`);
  // The tail is PAST convergence even at this slider position, so it must NOT move. This is
  // the guard against a fix that simply scaled everything down.
  T("C-5 (V542): 2039 is unchanged at $135K \u2014 past convergence, the fix must not touch it",
    by[2039] === 135, `$${by[2039]}K`);
  T("C-6 (V542): 2040 is unchanged at $138K \u2014 past convergence", by[2040] === 138, `$${by[2040]}K`);
  // DIRECTION. Every affected figure must FALL. A sign error still lands on some number.
  await drive(20000);
  const by20 = Object.fromEntries(readRows().map(r => [r.year, r.magi]));
  T("C-7 (V542): the correction moves MAGI DOWN, never up (all 12 years, $20K slider)",
    cliffLeg(20000).every((r, i) => by20[r.y] <= K(r.magi)), JSON.stringify(by20));
} else {
  await drive(15000);
  const by = Object.fromEntries(readRows().map(r => [r.year, r.magi]));
  // [KNOWN DEFECT — pre-v5.42] pinned as the before-state, not endorsed.
  T("C-1 (PRIOR LEG) [KNOWN DEFECT]: at $15K the 2032\u20132038 plateau still reads the cliff's $67K",
    [2032, 2033, 2034, 2035, 2036, 2037, 2038].every(y => by[y] === 67), JSON.stringify(by));
  T("C-2 (PRIOR LEG) [KNOWN DEFECT]: 2031 still reads $82K", by[2031] === 82, `$${by[2031]}K`);
  T("C-3 (PRIOR LEG) [KNOWN DEFECT]: the plateau is FLAT across 2032\u20132038 \u2014 the cliff's signature",
    new Set([2032, 2033, 2034, 2035, 2036, 2037, 2038].map(y => by[y])).size === 1);
}

// ── §D · the MIDDLE tier — [KNOWN DEFECT], found 2026-08-21, pinned NOT fixed ────────────
// The v5.42 build brief asserted the middle tier was correct. It is not. §86(a)(1) caps the
// includible amount at ½ of benefits; the app caps it at 85%:
//     app     Math.min((provisional - _ssT1) * 0.5, totalSS * 0.85)
//     statute Math.min( ½(prov − base),             totalSS * 0.5 )
// It therefore overstates for households whose provisional income lands BETWEEN the two
// thresholds AND whose benefits are small. This is the same defect class as Engine B's
// omitted ½-benefits cap (tidy-up item 4) and was not on that list.
//
// It is $0 on the example household — total benefits are $15,600 then $55,200, both outside
// the affected band — which is why no figure above moves. Pinned here with its measured
// bounds so it stays visible and cannot be mistaken for correct. FLIP THIS PIN WHEN FIXED.
{
  const midApp = (ss, nonSS) => {                       // transcribed from v5.41/v5.42 source
    const prov = nonSS + ss * 0.5;
    if (prov > T2 || prov <= T1) return null;           // middle tier only
    return Math.round(Math.min((prov - T1) * 0.5, ss * 0.85));
  };
  let worstJ = 0, worstS = 0, diverged = 0;
  for (const joint of [true, false]) {
    const t1 = joint ? 32000 : 25000, t2 = joint ? 44000 : 34000;
    for (let ss = 0; ss <= 30000; ss += 25) {
      for (let other = 0; other <= 60000; other += 25) {
        const prov = other + ss * 0.5;
        if (prov <= t1 || prov > t2) continue;
        const app = Math.round(Math.min((prov - t1) * 0.5, ss * 0.85));
        const law = Math.round(statute86(ss, other, joint));
        if (app !== law) diverged++;
        if (joint) worstJ = Math.max(worstJ, app - law); else worstS = Math.max(worstS, app - law);
      }
    }
  }
  T("D-1 [KNOWN DEFECT 2026-08-21]: the middle tier diverges from \u00a786(a)(1) \u2014 it caps at 85%, not \u00bd, of benefits",
    diverged > 0, `${diverged} cells`);
  T("D-2 [KNOWN DEFECT]: joint overstatement is bounded at $2,468", worstJ === 2468, `$${worstJ}`);
  T("D-3 [KNOWN DEFECT]: single overstatement is bounded at $1,850", worstS === 1850, `$${worstS}`);
  T("D-4 [KNOWN DEFECT]: it needs joint benefits under $12,000 \u2014 above that the 85% cap binds first",
    midApp(12500, 34000) === Math.round(statute86(12500, 34000, true)));
  T("D-5: it is $0 on the example household (benefits $15,600 / $55,200, both outside the band)",
    midApp(15600, 30000) === Math.round(statute86(15600, 30000, true)));
  // The finding is BOUNDED to the middle tier: every diverging cell sits at or below the
  // adjusted base amount. The upper tier's own para1 uses the statutory ½ cap (pinned
  // structurally in t1 STRUCT S-3), so the two tiers of the same function disagree — which
  // is the inconsistency this pin records.
  {
    let leaked = 0;
    for (let ss = 0; ss <= 30000; ss += 25) {
      for (let other = 0; other <= 120000; other += 25) {
        const prov = other + ss * 0.5;
        if (prov <= T2) continue;                       // upper tier only
        if (Math.round(statute86(ss, other, true)) !== cliff86(ss, other, T1, T2)) continue;
        leaked++;                                       // counts only agreeing upper-tier cells
      }
    }
    T("D-6: the middle-tier defect does not leak into the upper tier (its band ends at the adjusted base)",
      (() => {
        for (let ss = 0; ss <= 30000; ss += 25)
          for (let other = 0; other <= 120000; other += 25) {
            const prov = other + ss * 0.5;
            if (prov <= T2) continue;
            const withHalf = Math.round(statute86(ss, other, true));
            const withEightyFive = (() => {              // the middle tier's wrong cap, applied above
              const p1 = Math.min(ss * 0.85, (prov - T1) * 0.5);
              return Math.round(Math.min((prov - T2) * 0.85 + Math.min(p1, (T2 - T1) * 0.5), ss * 0.85));
            })();
            if (withHalf !== withEightyFive) return true; // the caps ARE distinguishable up here…
          }
        return false;
      })() && leaked > 0);
  }

  // D-7 · WHAT THIS SUITE CANNOT WITNESS, stated rather than left as folklore (§B2).
  // Negative control C21 perturbs para1's cap from ½ of benefits to 85% and does NOT fire
  // this suite — only t1's STRUCT S-3. That is a behavioural NO-OP, not a blind spot: para1
  // enters the phase-in as `min(para1, ½(adjbase − base))` = min(para1, $6,000), and the
  // ½-benefits cap can only change that when ½ × benefits < $6,000 — the SAME "benefits
  // under $12,000" condition as the D-1 middle-tier defect. The example household's benefits
  // are $15,600 then $55,200, so the perturbation cannot move any figure it renders.
  // The structural pin in t1 is the coverage for that term. Asserted so the reasoning is
  // checked rather than remembered.
  T("D-7: para1's ½-benefits cap is unobservable on the example household (swallowed by the $6,000 term)",
    Math.min(15600 * 0.5, 6000) === Math.min(15600 * 0.85, 6000) &&
    Math.min(55200 * 0.5, 6000) === Math.min(55200 * 0.85, 6000));
  T("D-7: it IS observable below $12,000 of benefits — where t1 STRUCT S-3 carries the coverage",
    Math.min(11000 * 0.5, 6000) !== Math.min(11000 * 0.85, 6000));
}

// ── §E · convergence — the property that made the defect invisible at the default ────────
// Above provisional \u2248 $92,141 on this household the 85%-of-benefits cap binds and the two
// formulas agree exactly. Pinning it stops a future "fix" from breaking the high end, and it
// documents WHY the default slider showed nothing.
{
  const ss = SSA + SSB;                                  // $55,200 once spouse A claims
  let cross = null;
  for (let nonSS = 0; nonSS <= 200000; nonSS += 1) {
    const law = Math.round(statute86(ss, nonSS, true)), old = cliff86(ss, nonSS, T1, T2);
    if (nonSS + ss * 0.5 > T2 && law === old) { cross = nonSS + ss * 0.5; break; }
  }
  T("E-1: the two formulas converge at provisional \u2248 $92,141 (\u00b1$2)",
    cross !== null && Math.abs(cross - 92141) <= 2, String(cross));
  T("E-2: above convergence the statute returns exactly 85% of benefits",
    Math.round(statute86(ss, 120000, true)) === Math.round(ss * 0.85));
  T("E-3: below the base amount the statute returns zero (\u00a786(b)(1) not met)",
    statute86(ss, 0, true) === 0 || statute86(10000, 20000, true) === 0);
}

console.log(`\nt24 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
