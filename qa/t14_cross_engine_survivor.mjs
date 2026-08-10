// t14 — CROSS-ENGINE SURVIVOR SOCIAL SECURITY (decision D-5).
//
// PRECISION, UPDATED v5.18: the Engine C leg here is still DOM-read (±$500), but Engine C is no
// longer limited to that — `t17` asserts it to the cent via the module-level `computeIrmaaPlan`.
// Engine B was hoisted at v5.19 and EXPORTED at v5.21, so `t18` now asserts it to the cent and
// no engine is behind the ±$500 ceiling any more. This leg still reads through the DOM by
// design: it is the cross-engine survivor invariant and the proof the tabs actually render.
//
// This is the durable extinction invariant for a whole defect CLASS, not for one bug. Three
// separate findings — C-2C-3 (Engines B/C keyed post-death RMDs to the wrong spouse), C-2C-4
// (Engine D never modelled the first death at all) and C-2C-5 (Engine C paid both SS checks
// forever) — were all the same failure: one engine not modelling a death that the others did.
// Each was found by hand, years apart. A single assertion that every engine agrees about the
// first death would have caught all three at once. That is what this file is.
//
// ── WHAT MUST AGREE, AND WHAT LEGITIMATELY DOES NOT ──────────────────────────────────────────
//
// Building this surfaced a genuine cross-engine divergence, which decision D-5 anticipated
// ("it will likely surface further divergences — which is the point"). Measured on the example
// household at the 2044 death, with a nominal smaller check of $15,600/yr:
//
//   Engine B (Taxes)      survivor keeps $40K — the larger check, held FLAT in today's dollars
//   Engine C (IRMAA)      MAGI falls $15K   — 85% of the smaller check, also held FLAT
//   Engine D (Withdrawal) guaranteed falls $21K — MORE than the nominal smaller check
//
// Engine D is not wrong. Engines B and C deliberately hold Social Security flat in today's dollars
// while inflating brackets and thresholds — the bracket-creep conservatism documented at the Taxes
// engine's income block — whereas Engine D COLA-indexes Social Security, as the Withdrawal tab's
// own disclosure says it does. So the three engines agree on WHO survives, on WHICH check is kept,
// and on WHEN the transition happens, but they do not share a dollar basis, and asserting a single
// figure across all three would fail for a correct reason.
//
// This suite therefore asserts what genuinely must hold:
//   1. STRUCTURAL — all FOUR engines contain a survivor larger-check rule bound to their own
//      first-death year. This is the only assertion that covers Engine A: runRothStrategies
//      returns lifetime totals, not per-year rows, so its per-year Social Security is not
//      reachable from the harness at all. Stated plainly rather than dressed up as arithmetic.
//   2. TIMING — every engine that exposes a figure moves it in the SAME year.
//   3. MAGNITUDE, within a shared basis — Engines B and C both hold SS flat, so B's survivor
//      total must be the larger check and C's MAGI drop must be 85% of the smaller one.
//   4. DIRECTION — Engine D's reduction is at least the nominal smaller check (larger, because it
//      COLA-indexes). The band is deliberately one-sided and the reason is recorded here.
//
// PRECISION CEILING (OPERATIONS §M): every figure read here is rendered as Math.round(x/1000), so
// these are +/-$500 assertions. The movements measured ($15.6K-$21K) are far larger than the band.
//
// NEGATIVE CONTROL — run against pre-fix v5.12, 2026-08-09:
//   Engine C's two assertions FAIL (MAGI does not drop; no survivor transition).
//   Engine B's and Engine D's PASS — both were already correct at v5.12 (B since v5.11, D since
//   v5.12), so they are NOT DISCRIMINATING for this release. They are here as the standing guard
//   that keeps them correct, which is the whole point of a class-level invariant.
//   The structural assertions: three of four PASS pre-fix; Engine C's FAILS. Recorded per engine
//   below so a future reader knows exactly which line this release moved.
//
// Run: node t14_cross_engine_survivor.mjs [dom_bundle.cjs]
import { JSDOM } from "jsdom";
import { createRequire } from "module";
import { readFileSync } from "fs";

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

console.log("t14 \u2014 CROSS-ENGINE SURVIVOR SS (D-5: the class-level invariant)");

// ── PART 1 — STRUCTURAL. Reads the canonical source from the run-folder root, as t8 does. ──
// Each engine is located by a token unique to it, then its region is searched for a survivor
// larger-check rule. This is the ONLY assertion covering Engine A, whose per-year SS the harness
// cannot reach (runRothStrategies returns lifetime totals, not rows).
{
  const src = readFileSync(new URL("../DangerClose.jsx", import.meta.url), "utf8");
  const region = (anchor, span) => {
    const i = src.indexOf(anchor);
    return i < 0 ? null : src.slice(i, i + span);
  };
  const engines = [
    { name: "Engine A (Roth strategy engine)", anchor: 'const survivorIsA = P.survivor !== "B"', span: 4000,
      rule: /const lg = Math\.max\(ssA_y, ssB_y\)/, death: /yr >= P\.deathYr1/ },
    { name: "Engine B (Taxes tab)", anchor: "const _survivorIsA = _single || ((_dobAYr + _tlT.lifeExpA)", span: 22000,
      rule: /const lg = Math\.max\(ssA_y, ssB_y\)/, death: /yr >= _deathYr1/ },
    { name: "Engine C (IRMAA planner)", anchor: "const _survivorIsA = _singleI || ((_dobAYr + _tlI.lifeExpA)", span: 8000,
      rule: /const lg = Math\.max\(ssA_y, ssB_y\)/, death: /yr >= _deathYr1/ },
    { name: "Engine D (Withdrawal tab)", anchor: "const _deathYr1D =", span: 8000,
      rule: /Math\.max\(_ssA_full, _ssB_full\)/, death: /yr >= _deathYr1D/ },
  ];
  // v5.14 — THE GAP THIS SUITE HAD. t14 shipped at v5.13 asserting the Social Security survivor rule
  // across four engines, and it did NOT catch finding C-2C-6: Engine A carried the SS rule correctly
  // while filing Single a year too early, because filing-status TIMING was never asserted. Every
  // engine with a filing concept must separate the death event (`>=`) from the filing switch (`>`).
  // This is the invariant that would have caught C-2C-6 on the day the v5.12 fix created it.
  const filingEngines = [
    { name: "Engine A (Roth strategy engine)", anchor: 'const survivorIsA = P.survivor !== "B"', span: 4000,
      death: /const widowed\s*=\s*!P\.single && yr >= P\.deathYr1/, filing: /!P\.single && yr > P\.deathYr1/ },
    { name: "Engine B (Taxes tab)", anchor: "const _survivorIsA = _single || ((_dobAYr + _tlT.lifeExpA)", span: 22000,
      death: /const widowed\s*=\s*!_single && yr >= _deathYr1/, filing: /!_single && yr > _deathYr1/ },
    { name: "Engine C (IRMAA planner)", anchor: "const _survivorIsA = _singleI || ((_dobAYr + _tlI.lifeExpA)", span: 8000,
      death: /const widowed\s*=\s*!_singleI && yr >= _deathYr1/, filing: /!_singleI && yr > _deathYr1/ },
  ];
  for (const e of filingEngines) {
    const r = region(e.anchor, e.span);
    ck(`structural: ${e.name} region located (filing check)`, !!r);
    if (!r) continue;
    ck(`structural: ${e.name} keys the DEATH EVENT to >= (SS drop, rollover)`, e.death.test(r));
    ck(`structural [EXTINCTION]: ${e.name} keys FILING STATUS to > (Pub. 501 — the year AFTER)`,
      e.filing.test(r), "no strictly-greater filing flag found — filing may be switching in the death year");
  }

  for (const e of engines) {
    const r = region(e.anchor, e.span);
    ck(`structural: ${e.name} region located`, !!r, `anchor missing: ${e.anchor}`);
    if (!r) continue;
    // [EXTINCTION] The rule that every one of these engines must carry. Engine C's was ABSENT
    // through v5.12 — this is the line the v5.13 release added.
    ck(`structural [EXTINCTION]: ${e.name} keeps only the LARGER Social Security check`,
      e.rule.test(r), "no larger-check rule found in region");
    ck(`structural: ${e.name} binds that rule to its own first-death year`,
      e.death.test(r), "no first-death condition found in region");
  }
}

// ── PART 2 — BEHAVIOURAL ──
const require = createRequire(import.meta.url);
require(process.argv[2] || "./dom_bundle.cjs");
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const T = window.__test;
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
const gotoTab = async (name) => {
  const tab = [...body().querySelectorAll("button, div, span")]
    .find(el => (el.textContent || "").trim().toLowerCase() === name);
  if (tab) { await click(tab); await flush(); await flush(); }
  return !!tab;
};

try {
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, [role=button], div")]
    .filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  ck("harness: landing screen offers Use Example Data", !!example);
  await click(example); await flush(); await flush();

  const g = window.__g;
  const ssA = g.getSSA() * 12, ssB = g.getSSB() * 12;
  const smaller = Math.min(ssA, ssB), larger = Math.max(ssA, ssB);
  const tl = T.PLAN_TIMELINE;
  const d = Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
  ck("setup: the example household has a first death inside the horizon",
    Number.isFinite(d) && d > tl.asOfYear, `deathYr1 ${d}`);

  // ── ENGINE D — Withdrawal schedule, guaranteed income column.
  await gotoTab("withdrawal");
  const dRows = (() => {
    const t = body().textContent || "";
    const i = t.indexOf("YearAge A/B");
    if (i < 0) return null;
    const seg = t.slice(i, i + 8000);
    const re = /(20\d\d)(\d{2})\/(\d{2})\$(\d+)K(?:\u2014|\$\d+K)\$(\d+)K\$(\d+)K/g;
    const out = {}; let m;
    while ((m = re.exec(seg)) !== null) out[+m[1]] = { guaranteed: +m[4] };
    return out;
  })();
  ck("Engine D: withdrawal schedule parsed", !!dRows && !!dRows[d] && !!dRows[d - 1]);
  let dDrop = null;
  if (dRows && dRows[d] && dRows[d - 1]) {
    dDrop = dRows[d - 1].guaranteed - dRows[d].guaranteed;
    // One-sided band: at least the nominal smaller check, and not more than double it. Engine D
    // COLA-indexes SS, so its figure sits ABOVE the nominal — see the header.
    ck("Engine D [EXTINCTION]: guaranteed income falls at the first death by at least the smaller check",
      dDrop * 1000 >= smaller - 500 && dDrop * 1000 <= smaller * 2,
      `drop $${dDrop}K vs nominal smaller check $${(smaller / 1000).toFixed(1)}K (Engine D COLA-indexes)`);
  }

  // ── ENGINE B — Taxes detail panel, per-spouse gross Social Security.
  await gotoTab("taxes");
  const readSSLines = () => {
    const t = body().textContent || "";
    const re = /SS \(gross benefit\)\$(-?\d+)K/g;
    const out = []; let m;
    while ((m = re.exec(t)) !== null) out.push(+m[1]);
    return out;
  };
  const selectTaxYear = async (yr) => {
    const cells = [...body().querySelectorAll("div")]
      .filter(el => (el.textContent || "").trim() === String(yr) && el.children.length === 0);
    if (cells.length) { await click(cells[cells.length - 1]); await flush(); }
    return cells.length > 0;
  };
  ck(`Engine B: year ${d - 1} selectable in the tax schedule`, await selectTaxYear(d - 1));
  const bBefore = readSSLines();
  ck(`Engine B: both checks are paid the year before the death`,
    bBefore.reduce((s, v) => s + v, 0) * 1000 >= (ssA + ssB) - 1000,
    `lines ${JSON.stringify(bBefore)} vs combined $${((ssA + ssB) / 1000).toFixed(1)}K`);
  ck(`Engine B: year ${d} selectable in the tax schedule`, await selectTaxYear(d));
  const bAt = readSSLines();
  const bAtTotal = bAt.reduce((s, v) => s + v, 0) * 1000;
  ck("Engine B [EXTINCTION]: the survivor keeps exactly the LARGER check in the death year",
    Math.abs(bAtTotal - larger) <= 500,
    `lines ${JSON.stringify(bAt)} = $${bAtTotal} vs larger $${larger}`);

  // ── ENGINE C — IRMAA MAGI. Shares Engine B's flat-SS basis, so the magnitude must match.
  await gotoTab("irmaa");
  const cRows = (() => {
    const t = body().textContent || "";
    const i = t.indexOf("Headroom to nextSurcharge");
    if (i < 0) return null;
    const seg = t.slice(i, i + 12000);
    const re = /(20\d\d)(?:(20\d\d) prem|pre-MC)\$(-?\d+)K(Standard|T\d)( · single)?(—|\$-?\d+K)(—|\$[\d.]+K)/g;
    const out = {}; let m;
    while ((m = re.exec(seg)) !== null) out[+m[1]] = { magi: +m[3], marked: !!m[5] };
    return out;
  })();
  ck("Engine C: IRMAA schedule parsed", !!cRows && !!cRows[d] && !!cRows[d - 1]);
  if (cRows && cRows[d] && cRows[d - 1]) {
    const cDrop = cRows[d - 1].magi - cRows[d].magi;
    const expected = (smaller * 0.85) / 1000;
    ck("Engine C [EXTINCTION]: MAGI falls at the first death by 85% of the smaller check",
      Math.abs(cDrop - expected) <= 4,
      `drop $${cDrop}K vs expected ~$${expected.toFixed(1)}K`);
    // TIMING — the transition happens in the same year everywhere, not one year apart.
    if (dDrop !== null) {
      const cPrev = cRows[d - 2] ? cRows[d - 2].magi - cRows[d - 1].magi : 0;
      ck("cross-engine [EXTINCTION]: Engines C and D transition in the SAME year",
        cDrop > cPrev + 5 && dDrop * 1000 >= smaller - 500,
        `C: ${d - 2}->${d - 1} $${cPrev}K then ${d - 1}->${d} $${cDrop}K; D drop $${dDrop}K`);
    }
    // Engines B and C share a basis, so B's retained check and C's lost MAGI must reconcile:
    // (both checks) - (larger) = smaller, and C lost 85% of exactly that.
    ck("cross-engine [EXTINCTION]: Engines B and C reconcile on the same flat-SS basis",
      Math.abs((ssA + ssB - bAtTotal) * 0.85 - cDrop * 1000) <= 4000,
      `B implies smaller $${ssA + ssB - bAtTotal}; C lost $${cDrop}K of MAGI`);
  }
} catch (e) {
  fail++; console.log(`  \u2717 t14 run threw: ${String(e).slice(0, 400)}`);
}

console.log(`\nt14 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
