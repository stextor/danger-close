// t13 — ENGINE C (IRMAA PLANNER) SURVIVOR MODELING (audit finding C-2C-5, fixed at v5.13).
//
// PRECISION, UPDATED v5.18. This file reads Engine C through the rendered DOM, where every figure
// is Math.round(x / 1000) — so its own ceiling is ±$500 of MAGI and ±$50 of surcharge, and that
// has not changed. What HAS changed is that the ceiling is no longer the project's ceiling for
// this engine: v5.17 hoisted Engine C to module level and v5.18 exports it, so `t17` now asserts
// its arithmetic to the cent. The two files are kept deliberately and do different jobs — t17
// checks the numbers against statute; t13 remains the survivor EXTINCTION invariant and is also
// the only thing proving the tab actually renders those numbers to a user. Add arithmetic cases
// to t17, not here. (v5.21: Engine B got the same treatment via `t18`, so every engine is now
// dollar-exact tested somewhere and the DOM legs are corroboration rather than the only source.)
//
// Through v5.12 the IRMAA planner had THREE survivor omissions, and — unlike Engine D — they did
// not share a direction:
//
//   1. Both Social Security checks paid for the whole horizon  -> MAGI too high  -> conservative
//   2. MFJ thresholds retained for a survivor                  -> tier too low   -> NON-conservative
//   3. The deceased spouse still counted for the per-person
//      surcharge                                               -> surcharge x2   -> conservative
//
// #2 dominates #1 by roughly 8:1 (the MFJ/Single gap is $109,000 at tier 1 against ~$14,000 of
// phantom SS), so the net defect UNDERSTATED survivor surcharges. ALL THREE SHIP TOGETHER, and the
// reason is arithmetic rather than tidiness: correcting #2 alone would move survivors into higher
// tiers while still charging both of them, roughly DOUBLING the surcharge — worse than the defect
// it replaced. These tests therefore assert all three, and a future change that restores any one of
// them in isolation fails here.
//
// THE EXAMPLE HOUSEHOLD CANNOT DEMONSTRATE ANY OF THIS. Its survivor MAGI (~$96K) never approaches
// even the Single threshold (~$156K by 2044), so the surcharge is $0 before and after the fix. A
// test written against it would pass on both builds while proving nothing. Every case below
// therefore runs a PURPOSE-BUILT household: the example household with its pension raised, which
// is the one lever that moves MAGI without drifting year to year. The pension figures are frankly
// synthetic — their only job is to land survivor MAGI inside the $109K-wide band between the Single
// and MFJ thresholds where the defect actually lives.
//
// PRECISION CEILING (OPERATIONS §M): Engine C is computed inside the component body, so the harness
// cannot reach its row array; the tab renders MAGI as Math.round(x/1000) and the surcharge as
// toFixed(1) on thousands. These assertions are +/-$500 on MAGI and +/-$50 on the surcharge, NOT
// dollar-exact. Adequate here only because every movement measured (~$13K of MAGI, $1,150 of
// surcharge) is far larger than the band.
//
// NEGATIVE CONTROL — run against pre-fix v5.12, 2026-08-09, recorded per case:
//
//   CASE 1 (A dies 2044, pension $8,300/mo)
//     MAGI across the death   v5.12: 207 -> 205 -> 207 (drifts, no SS drop)   fixed: 208 -> 193 -> 195
//     survivor tier/marker    v5.12: Standard, unmarked, forever              v5.13: T1 · single from 2045
//     survivor surcharge      v5.12: $0 for the whole plan                    v5.13: $1.1K/yr
//     -> DISCRIMINATING on MAGI drop, tier, marker and surcharge.
//
//   ASSERTIONS THAT PASS PRE-FIX — recorded in full, because a suite that only lists its wins is
//   not a negative control (the t11 case-3 lesson). 26 of 40 pass on v5.12. Besides the harness
//   and constants checks, these are the substantive ones:
//     "the death year is still MFJ"          — true on both builds; v5.12 never switched AT ALL,
//        so it is right for the wrong reason. Kept: it is what stops a future fix switching a year
//        too early, which is exactly the error v5.11 made in Engine B.
//     "MAGI does not collapse"               — a sanity bound, not a discriminator.
//     "both-alive years are unmarked"        — true on both builds; guards against an early trigger.
//     case 3 "a premium year before the death still charges TWO people" — true on both; guards
//        against a fix that blanket-halves every row instead of gating on the death.
//     case 3 "that row's MAGI is unchanged"  — true by construction; it is what MAKES case 3 an
//        isolation, so it is asserted rather than assumed.
//     "both directions lose the same MAGI"   — passes pre-fix only marginally (drift of +2K and
//        -2K falls inside the +/-4K band). Weak on its own; meaningful once the magnitude
//        assertions above have fired.
//
//   CASE 2 (B dies 2042, same pension) — the other direction of the larger-check rule
//     MAGI across the death   v5.12: no drop                                  fixed: 204 -> 193
//     survivor tier           v5.12: Standard                                 v5.13: T1 · single from 2043
//     -> DISCRIMINATING. MAGI only ever sees the TOTAL, and total - max = min whichever spouse
//        dies, so both cases must show the same drop. What differs is which spouse's check is
//        zeroed, and an implementation that always zeroed the same one would pass case 2 and fail
//        case 1. Both signs are therefore run.
//
//   CASE 3 (A dies 2044, pension $20,300/mo) — isolates omission 3 with the tier HELD CONSTANT
//     row 2043 (both alive, MAGI $336K, tier T1 on BOTH builds — a both-alive year, so the SS fix
//     cannot touch it and the threshold fix cannot touch it)
//                             v5.12: $2.3K (two people)   v5.13: $1.1K (one person)
//     -> DISCRIMINATING, and the ONLY assertion here that isolates the person count: identical
//        MAGI, identical tier, surcharge exactly halved. Nothing but omission 3 can explain it.
//
// FIXTURE NOTE (v5.14): cases 1 and 2 use a $9,600/mo pension, raised from $8,300 at v5.14. That
// release re-indexed IRMAA thresholds to the PREMIUM year (F-2B-1), lifting every boundary by two
// years of inflation, and at $8,300 the household's final survivor year (2053, premium 2055) fell
// just under the risen Single cliff — $193K of MAGI against a $193.6K threshold — so its surcharge
// correctly lapsed and the persistence assertion failed. The ENGINE was right; the fixture had lost
// its margin. Raising the pension restores clearance at both ends of the horizon. This is exactly
// the re-verification the indexation scope flagged as owed and predicted would probably pass — it
// did not, which is why "expect, not know" was the right way to write it down.
//
// A NOTE ON WHICH YEAR THE PERSON COUNT FOLLOWS. The surcharge is billed in the "Affects" year
// (MAGI + 2), so the count follows who is alive THEN — the same year basis the Medicare-start gates
// beside it already use. The filing status follows the MAGI year. The two therefore change in
// different rows, which is why case 3's row 2043 charges one person while still showing MFJ tier
// and no survivor marker. Case 3 asserts both halves of that on purpose.
//
// Run: node t13_engineC_irmaa.mjs [dom_bundle.cjs]
import { JSDOM } from "jsdom";
import { createRequire } from "module";

// ── TRAP 1 (do not "simplify" away): seed Math.random BEFORE importing the app bundle. ──
let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "https://localhost/", pretendToBeVisual: true,
});
const { window } = dom;
global.window = window; global.document = window.document;
Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
global.HTMLElement = window.HTMLElement; global.Element = window.Element; global.Node = window.Node;
global.getComputedStyle = window.getComputedStyle;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = clearTimeout;
window.requestAnimationFrame = global.requestAnimationFrame;
window.cancelAnimationFrame = global.cancelAnimationFrame;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
global.ResizeObserver = window.ResizeObserver;
window.scrollTo = () => {};
window.HTMLCanvasElement.prototype.getContext = () => ({
  fillRect() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {}, arc() {},
  save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, fillText() {}, measureText: () => ({ width: 10 }),
  setLineDash() {}, closePath() {}, rect() {}, clip() {}, createLinearGradient: () => ({ addColorStop() {} }),
});
// ── TRAP 2: the CJS DOM bundle runs in Node scope — stub globalThis, not just window. ──
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";

process.env.IS_REACT_ACT_ENVIRONMENT = "true";
window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let pass = 0, fail = 0;
const ck = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`); }
};

const require = createRequire(import.meta.url);
require(process.argv[2] || "./dom_bundle.cjs");
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const T = window.__test;
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };

console.log("t13 \u2014 ENGINE C IRMAA SURVIVOR (C-2C-5 extinction invariant, three omissions)");

const gotoTab = async (name) => {
  const tab = [...body().querySelectorAll("button, div, span")]
    .find(el => (el.textContent || "").trim().toLowerCase() === name);
  if (tab) { await click(tab); await flush(); await flush(); }
  return !!tab;
};

// applyLoadedData takes a WRAPPER and mutates module-level globals without re-rendering, so park
// off the target tab before navigating back (both traps documented in OPERATIONS §C).
const configure = async ({ lifeExpA, lifeExpB, pension }) => {
  const P = JSON.parse(JSON.stringify(T.PORTFOLIO));
  if (lifeExpA !== undefined) P.lifeExpA = lifeExpA;
  if (lifeExpB !== undefined) P.lifeExpB = lifeExpB;
  P.incomeSources = P.incomeSources || {};
  P.incomeSources.pension = { ...(P.incomeSources.pension || {}), amount: pension };
  await act(async () => { T.applyLoadedData({ portfolio: P }); });
  await flush(); await flush();
  await gotoTab("roth");
  const tl = T.PLAN_TIMELINE;
  return { deathYr1: Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB) };
};

// Parse the year-by-year table. Row shape (text, no separators):
//   TAXYR (PREMYR " prem" | "pre-MC") $MAGIK TIER[" · single"] HEADROOM SURCHARGE
const readRows = () => {
  const t = body().textContent || "";
  const i = t.indexOf("Headroom to nextSurcharge");
  if (i < 0) return null;
  const seg = t.slice(i, i + 12000); // generous window: disclosure prose sits after the rows
  const re = /(20\d\d)(?:(20\d\d) prem|pre-MC)\$(-?\d+)K(Standard|T\d)( · single)?(—|\$-?\d+K)(—|\$[\d.]+K)/g;
  const out = {};
  let m;
  while ((m = re.exec(seg)) !== null) {
    out[+m[1]] = {
      premYr: m[2] ? +m[2] : null,
      magi: +m[3],                                   // $K
      tier: m[4],
      marked: !!m[5],                                // the "· single" survivor marker
      surcharge: m[7] === "\u2014" ? 0 : Math.round(parseFloat(m[7].replace(/[$K]/g, "")) * 1000),
    };
  }
  return out;
};

try {
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, [role=button], div")]
    .filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  ck("harness: landing screen offers Use Example Data", !!example);
  await click(example); await flush(); await flush();

  const g = window.__g;
  const SUR = g.IRMAA_CONSTS().SUR;
  const SGL = g.IRMAA_CONSTS().SGL, MFJ = g.IRMAA_CONSTS().MFJ;
  ck("constants: tier-1 surcharge is the shared IRMAA_CONSTS value ($1,150/person)", SUR[1] === 1150, `got ${SUR[1]}`);
  ck("constants: Single thresholds are half MFJ at tier 1 (the gap the defect lived in)",
    MFJ[0] === SGL[0] * 2, `SGL ${SGL[0]} vs MFJ ${MFJ[0]}`);

  // The smaller check is what a survivor LOSES; 85% of it is what MAGI loses (the engine's flat
  // SS-taxability approximation, which is pre-existing and out of scope here).
  const ssA = g.getSSA(), ssB = g.getSSB();
  const smallerAnnual = Math.min(ssA, ssB) * 12;
  const expectedMagiDropK = (smallerAnnual * 0.85) / 1000;
  ck("setup: the example household's two SS checks differ (a survivor rule needs two sizes)",
    ssA !== ssB && smallerAnnual > 0, `A $${ssA}/mo, B $${ssB}/mo`);

  // ── CASES 1 AND 2 — the survivor transition, in both directions ──────────────────────────
  const runCase = async (label, cfg, expectDeath) => {
    const c = await configure(cfg);
    ck(`${label} setup: first death in ${expectDeath}`, c.deathYr1 === expectDeath, JSON.stringify(c));
    ck(`${label}: IRMAA tab reachable`, await gotoTab("irmaa"));
    const rows = readRows();
    ck(`${label}: year-by-year rows parsed`, !!rows && Object.keys(rows).length > 10,
      rows ? `${Object.keys(rows).length} rows` : "none");
    if (!rows) return null;
    const d = expectDeath, before = rows[d - 1], at = rows[d], after = rows[d + 1];
    ck(`${label}: rows present around the death year`, !!before && !!at && !!after);
    if (!before || !at || !after) return null;

    // ── OMISSION 1: the smaller SS check stops at the death, so MAGI falls by 85% of it.
    // Pre-fix MAGI drifted across this boundary by a couple of $K in either direction, so a bare
    // "MAGI drops" assertion would not discriminate — the MAGNITUDE is the test.
    const dropK = before.magi - at.magi;
    ck(`${label} [EXTINCTION]: MAGI falls at the first death by the smaller SS check (85% taxable)`,
      Math.abs(dropK - expectedMagiDropK) <= 4,
      `${d - 1} $${before.magi}K -> ${d} $${at.magi}K = $${dropK}K, expected ~$${expectedMagiDropK.toFixed(1)}K`);
    ck(`${label}: MAGI does not collapse — the LARGER check is retained`,
      at.magi > before.magi * 0.7, `${d} $${at.magi}K vs prior $${before.magi}K`);

    // ── The death year keeps MFJ (IRS Pub. 501). NOT DISCRIMINATING on its own — see the header.
    ck(`${label}: the death year itself is still scored MFJ (Pub. 501 permits a joint return)`,
      at.marked === false && at.tier === "Standard",
      `${d} tier ${at.tier}, marked ${at.marked}`);

    // ── OMISSION 2: the year AFTER the death switches to the Single tier table, and this
    // household is built so that switch crosses a real tier boundary.
    ck(`${label} [EXTINCTION]: the year after the death is marked as a survivor year`,
      after.marked === true, `${d + 1} marked ${after.marked}`);
    ck(`${label} [EXTINCTION]: the survivor year is scored against SINGLE thresholds (tier rises)`,
      after.tier === "T1" && before.tier === "Standard",
      `${d - 1} ${before.tier} -> ${d + 1} ${after.tier} on MAGI $${before.magi}K -> $${after.magi}K`);

    // ── OMISSION 3: the tier is T1, so the surcharge pins the person count. One person is
    // $1,150; the deceased spouse still counted would render $2,300.
    ck(`${label} [EXTINCTION]: the survivor surcharge is ONE person's, not two`,
      Math.abs(after.surcharge - SUR[1]) <= 60,
      `${d + 1} $${after.surcharge} vs one person $${SUR[1]}, two would be $${SUR[1] * 2}`);

    // The tier rise is NOT explained by MAGI growth — MAGI is lower after the death than before it.
    ck(`${label}: the tier rise comes from the threshold switch, not from rising MAGI`,
      after.magi < before.magi, `${d - 1} $${before.magi}K vs ${d + 1} $${after.magi}K`);

    // Both-alive years are untouched: no marker, no surcharge.
    const early = rows[d - 2];
    if (early) {
      ck(`${label}: years with both spouses alive are unmarked and unsurcharged (no early trigger)`,
        early.marked === false && early.surcharge === 0 && early.tier === "Standard",
        `${d - 2} tier ${early.tier}, marked ${early.marked}, surcharge $${early.surcharge}`);
    }
    // The survivor state persists rather than applying for a single year.
    const yrs = Object.keys(rows).map(Number).filter(y => y > d).sort((a, b) => a - b);
    const last = rows[yrs[yrs.length - 1]];
    ck(`${label}: the survivor treatment persists to the end of the horizon`,
      yrs.every(y => rows[y].marked === true) && Math.abs(last.surcharge - SUR[1]) <= 60,
      `${yrs.length} survivor years, last $${last.surcharge}`);
    return { before, at, after, dropK };
  };

  // CASE 1 — person A (the LARGER check) dies first. The survivor inherits the decedent's benefit.
  const c1 = await runCase("case 1 (A dies)", { lifeExpA: 80, lifeExpB: 87, pension: 9600 }, 2044);
  // CASE 2 — person B (the SMALLER check) dies first. The survivor keeps their own.
  const c2 = await runCase("case 2 (B dies)", { lifeExpA: 87, lifeExpB: 76, pension: 9600 }, 2042);

  if (c1 && c2) {
    // total - max = min whichever spouse dies, so the MAGI drop must MATCH across directions.
    // An implementation that always zeroed the same spouse would break exactly one of the two.
    ck("cross-check: both directions lose the same amount of MAGI (total minus larger = smaller)",
      Math.abs(c1.dropK - c2.dropK) <= 4, `A-dies $${c1.dropK}K vs B-dies $${c2.dropK}K`);
  }

  // ── CASE 3 — the person count, ISOLATED with the tier held constant ──────────────────────
  // A higher pension puts the BOTH-ALIVE years into MFJ tier 1. Those rows cannot be touched by
  // the SS fix (nobody has died) or by the threshold fix (still MFJ), so any change in their
  // surcharge is the person count and nothing else.
  const c3 = await configure({ lifeExpA: 80, lifeExpB: 87, pension: 20300 });
  ck("case 3 setup: first death in 2044", c3.deathYr1 === 2044, JSON.stringify(c3));
  ck("case 3: IRMAA tab reachable", await gotoTab("irmaa"));
  const r3 = readRows();
  ck("case 3: year-by-year rows parsed", !!r3 && Object.keys(r3).length > 10);
  if (r3) {
    const early = r3[2041], pre = r3[2043], surv = r3[2045];
    ck("case 3: the reference rows are present", !!early && !!pre && !!surv);
    if (early && pre && surv) {
      // A premium year BEFORE the death — both spouses alive to pay it, so still two people.
      ck("case 3: a premium year before the death still charges TWO people",
        early.premYr === 2043 && Math.abs(early.surcharge - SUR[1] * 2) <= 60,
        `${2041} affects ${early.premYr}, $${early.surcharge} vs two people $${SUR[1] * 2}`);
      // A premium year AFTER the death, on a MAGI year where both were alive: MFJ tier, unmarked,
      // but only one person left to bill. This is the row that isolates omission 3.
      ck("case 3 [EXTINCTION]: a premium year after the death charges ONE person, tier unchanged",
        pre.tier === "T1" && pre.marked === false && Math.abs(pre.surcharge - SUR[1]) <= 60,
        `${2043} affects ${pre.premYr}, tier ${pre.tier}, marked ${pre.marked}, $${pre.surcharge} (pre-fix $${SUR[1] * 2})`);
      ck("case 3: that row's MAGI is unchanged by the fix (a both-alive year, $336K)",
        Math.abs(pre.magi - 336) <= 1, `$${pre.magi}K`);
      // And the survivor year moves up the SINGLE ladder, well past where MFJ would have put it.
      ck("case 3 [EXTINCTION]: the survivor year climbs the Single ladder (T1 -> T4)",
        surv.marked === true && surv.tier === "T4" && Math.abs(surv.surcharge - SUR[4]) <= 60,
        `${2045} tier ${surv.tier}, marked ${surv.marked}, $${surv.surcharge} vs one person $${SUR[4]}`);
      ck("case 3: the survivor surcharge is still ONE person's, not two, at the higher tier",
        surv.surcharge < SUR[4] * 2 - 60, `$${surv.surcharge} vs two people $${SUR[4] * 2}`);
    }
  }
} catch (e) {
  fail++; console.log(`  \u2717 t13 run threw: ${String(e).slice(0, 400)}`);
}

console.log(`\nt13 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
