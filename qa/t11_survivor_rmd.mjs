// t11 — SURVIVOR RMD (audit finding C-2C-3, fixed at v5.11).
//
// THE EXTINCTION INVARIANT. Engines B (Taxes) and C (IRMAA) used to hold ONE pooled
// Traditional balance and key its RMD to person A's age unconditionally — so after the
// first death, RMDs ran on the DECEASED spouse's age. The sign of the resulting error
// depends on which spouse is younger, which is why BOTH configurations are asserted here:
//
//   Case 1 — A older, A dies first, B survives: decedent's smaller divisor
//            => old code OVERSTATED the RMD (conservative).
//   Case 2 — A younger, A dies first, B survives: decedent's larger divisor
//            => old code UNDERSTATED the RMD (NON-conservative — the reason C-2C-3 is HIGH).
//
// A one-directional test would have passed against the defect in the other sign, so the
// pair is the point: the defect class cannot return in EITHER direction.
//
// PRECISION CEILING (PROJECT_INSTRUCTIONS §M, STOP-REPORT-EngineBC-render-precision).
// Engines B and C are computed inside the DangerClose component body, so the shim (which
// exports module-level bindings only) cannot reach their row arrays. Their sole output path
// is the rendered DOM, which emits every figure as Math.round(x / 1000). These assertions
// are therefore ±$500 — NOT dollar-exact. That is adequate here only because the effect
// (~$4,050/yr per $1M of Traditional balance) exceeds the band roughly eightfold. Lifting
// the ceiling requires the test-only rows hook, which is a separate scoped harness task.
//
// NEGATIVE CONTROL (run 2026-08-08 — a test that cannot fail proves nothing). This suite was
// executed against the PRE-FIX build (v5.10.2, dom_v5102.cjs) and correctly failed 5 of 26:
//   case 1 [EXTINCTION] 2044 ($47K) · case 1 [EXTINCTION] 2045 ($49K) · case 1 boundary
//   case 2 [EXTINCTION] 2044 ($48K) · case 2 [EXTINCTION] 2045 ($50K)
// Those five are the DISCRIMINATING assertions. Note honestly that the two cross-checks PASS
// on the defective build too: the pooled ageA model still returns different figures for the
// two configurations (ageA is 80 in case 1 but 78 in case 2), so the cross-checks are
// supporting context, not proof. Do not weaken the [EXTINCTION] assertions on the strength
// of the cross-checks being green.
//
// Run: node t11_survivor_rmd.mjs [dom_bundle.cjs]
import { JSDOM } from "jsdom";
import { createRequire } from "module";

// ── TRAP 1 (do not "simplify" away): seed Math.random BEFORE importing the app bundle.
//    d3-random captures Math.random at module load; a post-import override silently leaves
//    the Monte Carlo's noise draws on the real RNG and destroys determinism. ──
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
// ── TRAP 2: the CJS DOM bundle runs in Node scope, so a bare `URL` resolves to Node's
//    global, not window's. Stub globalThis, not just window. ──
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";

process.env.IS_REACT_ACT_ENVIRONMENT = "true";
window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let pass = 0, fail = 0;
const ck = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
};

const require = createRequire(import.meta.url);
require(process.argv[2] || "./dom_bundle.cjs");
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const T = window.__test;
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };

// The IRS Uniform Lifetime Table divisors this suite reasons about. Asserted against the
// engine's own shared table below so a table edit cannot silently invalidate the math.
const DIV = { 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4 };

console.log("t11 — SURVIVOR RMD (C-2C-3 extinction invariant, both directions)");

// ── Read the $K RMD figure out of the Taxes-tab detail panel for a given year ──
const detailText = () => {
  const tx = body().textContent || "";
  const i = tx.indexOf("DETAIL —");
  // Window must comfortably clear the panel's prose: the v5.11 survivor disclosures sit
  // between the header and the income rows, and the death year carries BOTH of them, so a
  // short slice silently truncates the RMD line and reads null. Sized with headroom.
  return i >= 0 ? tx.slice(i, i + 2400) : "";
};
const selectYear = async (yr) => {
  const cands = [...body().querySelectorAll("tr, div, td, span, button")]
    .filter(el => (el.textContent || "").trim().startsWith(String(yr)) && el.children.length <= 6);
  for (const el of cands.slice(0, 6)) {
    await click(el);
    const d = detailText();
    if (d.includes(`DETAIL — ${yr} `)) return d;
  }
  return null;
};
// Returns { rmdK, header } — rmdK in THOUSANDS as rendered (Math.round(x/1000)).
const rmdForYear = async (yr) => {
  const d = await selectYear(yr);
  if (!d) return null;
  const m = d.match(/RMD \(Traditional withdrawal\)\$(-?\d+)K/);
  return m ? { rmdK: Number(m[1]), header: d.slice(0, 60) } : { rmdK: null, header: d.slice(0, 60) };
};

// ── Load the example household, then reconfigure the two spouses' DOB/life expectancy.
//    applyLoadedData takes a WRAPPER ({ portfolio }) and rebuilds PLAN_TIMELINE at its end;
//    passing the portfolio bare is a silent no-op (learned 2026-08-08). ──
//
//    SECOND TRAP (found by this suite's own cross-check, 2026-08-08): applyLoadedData
//    mutates MODULE-LEVEL globals (PORTFOLIO / PLAN_TIMELINE). React re-renders only on a
//    state change, so if the Taxes tab is already active, clicking it again is a no-op and
//    the panel keeps rendering the PREVIOUS household's figures. Reading them would silently
//    compare a configuration against itself — a test that passes while proving nothing.
//    configure() therefore parks on a neutral tab, which guarantees the activeTab state
//    changes when the caller navigates back to Taxes. ──
const gotoTab = async (name) => {
  const tab = [...body().querySelectorAll("button, div, span")]
    .find(el => (el.textContent || "").trim().toLowerCase() === name);
  if (tab) { await click(tab); await flush(); await flush(); }
  return !!tab;
};
const configure = async ({ dobA, lifeExpA, dobB, lifeExpB }) => {
  const P = JSON.parse(JSON.stringify(T.PORTFOLIO));
  P.dobA = `${dobA}-06-15`; P.dobB = `${dobB}-06-15`;
  P.lifeExpA = lifeExpA; P.lifeExpB = lifeExpB;
  await act(async () => { T.applyLoadedData({ portfolio: P }); });
  await flush(); await flush();
  await gotoTab("roth"); // park off Taxes so the next navigation forces a re-render
  const tl = T.PLAN_TIMELINE;
  return {
    dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    lifeExpA: tl.lifeExpA, lifeExpB: tl.lifeExpB,
    deathYr1: Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
  };
};

try {
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, [role=button], div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0]
    || [...body().querySelectorAll("*")].find(el => /example data/i.test(el.textContent || "") && el.tagName === "BUTTON");
  ck("harness: landing screen offers Use Example Data", !!example);
  await click(example); await flush(); await flush();

  // Ground the divisor table against the engine's own shared helper (never assumed).
  const g = window.__g;
  if (g && g.rmdDivisor) {
    for (const [age, d] of Object.entries(DIV)) {
      ck(`table: rmdDivisor(${age}) === ${d} (IRS Uniform Lifetime Table)`, g.rmdDivisor(Number(age)) === d, `got ${g.rmdDivisor(Number(age))}`);
    }
  } else {
    ck("table: rmdDivisor reachable for grounding", false, "window.__g.rmdDivisor missing");
  }
  // SECURE 2.0 §107 start ages — the straddle the pre-death assertions rely on.
  if (g && g.rmdStartAge) {
    ck("SECURE 2.0: 1959 birth → RMD start age 73", g.rmdStartAge(1959) === 73, `got ${g.rmdStartAge(1959)}`);
    ck("SECURE 2.0: 1960 birth → RMD start age 75", g.rmdStartAge(1960) === 75, `got ${g.rmdStartAge(1960)}`);
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 1 — A OLDER (1964, dies 2044) · B younger (1966) survives.
  // Old code keyed RMDs to A's age after death: A's divisor is SMALLER than the
  // survivor's, so the RMD was OVERSTATED. Post-fix it must DROP across the boundary.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const cfg = await configure({ dobA: 1964, lifeExpA: 80, dobB: 1966, lifeExpB: 87 });
    ck("case 1 setup: A older (1964) and dies first in 2044, B survives",
      cfg.dobAYr === 1964 && cfg.dobBYr === 1966 && cfg.deathYr1 === 2044, JSON.stringify(cfg));
    ck("harness: Taxes tab reachable", await gotoTab("taxes"));

    const y43 = await rmdForYear(2043); // last MFJ year, both alive
    const y44 = await rmdForYear(2044); // first survivor year
    const y45 = await rmdForYear(2045);
    ck("case 1: 2043 detail panel reachable and reports an RMD", !!y43 && y43.rmdK !== null, JSON.stringify(y43));
    ck("case 1: 2044 panel is a survivor year (Single)", !!y44 && /Single \(survivor\)/.test(y44.header), y44 && y44.header);
    ck("case 1: 2045 panel is a survivor year (Single)", !!y45 && /Single \(survivor\)/.test(y45.header), y45 && y45.header);

    // THE INVARIANT. Survivor is B (younger, larger divisor) → the survivor-year RMD must be
    // materially BELOW what the decedent's age would have produced. Under the old pooled/ageA
    // model the 2044 figure was ~$47K; the survivor-based figure is ~$43-44K.
    ck("case 1 [EXTINCTION]: survivor-year RMD is NOT keyed to the deceased (older) spouse's age",
      !!y44 && y44.rmdK < 46, `2044 RMD $${y44 && y44.rmdK}K — pre-fix ageA-keyed value was ~$47K`);
    ck("case 1 [EXTINCTION]: the correction persists a year later (2045)",
      !!y45 && y45.rmdK < 48, `2045 RMD $${y45 && y45.rmdK}K — pre-fix ageA-keyed value was ~$49K`);
    // Direction check: with the older spouse gone, the surviving younger spouse's larger
    // divisor means the RMD must not jump upward across the death boundary.
    ck("case 1: RMD does not rise across the death boundary (younger survivor, larger divisor)",
      !!y43 && !!y44 && y44.rmdK <= y43.rmdK + 1, `2043 $${y43 && y43.rmdK}K → 2044 $${y44 && y44.rmdK}K`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 2 — MIRROR. A YOUNGER (1966, dies 2044) · B older (1964) survives.
  // This is the NON-CONSERVATIVE direction: the old code keyed RMDs to the younger,
  // dead spouse's LARGER divisor, UNDERSTATING the RMD, understating tax, and
  // overstating plan survival. Post-fix the survivor-year RMD must RISE.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const cfg = await configure({ dobA: 1966, lifeExpA: 78, dobB: 1964, lifeExpB: 87 });
    ck("case 2 setup: A younger (1966) and dies first in 2044, B (older) survives",
      cfg.dobAYr === 1966 && cfg.dobBYr === 1964 && cfg.deathYr1 === 2044, JSON.stringify(cfg));
    ck("harness: Taxes tab reachable", await gotoTab("taxes"));

    const y43 = await rmdForYear(2043);
    const y44 = await rmdForYear(2044);
    const y45 = await rmdForYear(2045);
    ck("case 2: 2043 detail panel reachable and reports an RMD", !!y43 && y43.rmdK !== null, JSON.stringify(y43));
    ck("case 2: 2044 panel is a survivor year (Single)", !!y44 && /Single \(survivor\)/.test(y44.header), y44 && y44.header);
    ck("case 2: 2045 panel is a survivor year (Single)", !!y45 && /Single \(survivor\)/.test(y45.header), y45 && y45.header);

    // THE INVARIANT, OPPOSITE SIGN. Survivor is B (OLDER, smaller divisor) → the survivor-year
    // RMD must be materially ABOVE the deceased-keyed figure. Pre-fix 2044 read ~$48K
    // (understated); the survivor-based figure is ~$51-52K.
    ck("case 2 [EXTINCTION]: survivor-year RMD is NOT keyed to the deceased (younger) spouse's age",
      !!y44 && y44.rmdK > 49, `2044 RMD $${y44 && y44.rmdK}K — pre-fix ageA-keyed value was ~$48K (understated)`);
    ck("case 2 [EXTINCTION]: the correction persists a year later (2045)",
      !!y45 && y45.rmdK > 51, `2045 RMD $${y45 && y45.rmdK}K — pre-fix ageA-keyed value was ~$50K (understated)`);
    // Direction check: the older survivor's smaller divisor must push the RMD UP.
    ck("case 2: RMD rises across the death boundary (older survivor, smaller divisor)",
      !!y43 && !!y44 && y44.rmdK > y43.rmdK, `2043 $${y43 && y43.rmdK}K → 2044 $${y44 && y44.rmdK}K`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // The two cases must DISAGREE. Same portfolio, same death year, same ages on the
  // panel — only which spouse survives differs. Under the old pooled/ageA model both
  // configurations produced a figure driven by person A, so this is the cross-check
  // that most directly proves the survivor now governs.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const c1 = await configure({ dobA: 1964, lifeExpA: 80, dobB: 1966, lifeExpB: 87 });
    await gotoTab("taxes");
    const a44 = await rmdForYear(2044);
    const c2 = await configure({ dobA: 1966, lifeExpA: 78, dobB: 1964, lifeExpB: 87 });
    await gotoTab("taxes");
    const b44 = await rmdForYear(2044);
    ck("cross-check: the two survivor configurations produce DIFFERENT survivor-year RMDs",
      !!a44 && !!b44 && a44.rmdK !== b44.rmdK,
      `A-older $${a44 && a44.rmdK}K vs A-younger $${b44 && b44.rmdK}K (deathYr1 ${c1.deathYr1}/${c2.deathYr1})`);
    ck("cross-check: the older-survivor case carries the HIGHER RMD (smaller divisor)",
      !!a44 && !!b44 && b44.rmdK > a44.rmdK, `A-older $${a44 && a44.rmdK}K vs A-younger $${b44 && b44.rmdK}K`);
  }
} catch (e) {
  fail++; console.log(`  ✗ t11 run threw: ${String(e).slice(0, 400)}`);
}

console.log(`\nt11 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
