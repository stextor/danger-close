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
// v5.47 ADDENDUM — A WIDE BAND IS NOT THE SAME AS A HEALTHY ONE. Engine C's two MAGNITUDE
// assertions differenced raw year-over-year MAGI and attributed all of it to the death, while
// this household's MAGI also rises ~$4K/yr from RMD growth. Their +/-$4,000 bands were absorbing
// that structural offset, so both sat far closer to failing than they read: at the v5.47 build
// the magnitude check had $740 of margin and the B/C reconcile check had $80. Both are now
// corrected for one year of drift; see the long note at the Engine C block. The lesson worth
// keeping is that a passing assertion with an unexamined tolerance can be measuring the wrong
// quantity for years — the tolerance hides the offset instead of reporting it.
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
  const region = (anchor, endMarker) => {
    const i = src.indexOf(anchor);
    if (i < 0) return null;
    // v5.33 addendum (D-4): the window is BOUNDED, not sized. A fixed character span
    // is the whole failure class — it silently goes stale as the engine grows around
    // the rule, and the failure reads like a regression in the app. Every engine's
    // window now runs from its anchor to the START OF THE NEXT TOP-LEVEL FUNCTION,
    // so the slice is "the rest of this engine" by construction and cannot drift.
    // Both markers are asserted unique before use; a missing end marker FAILS LOUDLY
    // rather than falling back to a span, because a silent fallback is how this got
    // missed the first time.
    if (!endMarker) return null;
    const j = src.indexOf(endMarker, i);
    if (j < 0) return null;
    return src.slice(i, j);
  };
  // v5.33 addendum (D-4): assert the BOUNDS before trusting any window. A window is only
  // as good as its markers: a duplicated anchor silently reads the wrong engine, and a
  // missing end marker used to fall back to a fixed span that could exclude the very rule
  // being asserted. Both are now checked explicitly, once, for every engine.
  const _markers = [
    ["Engine A anchor", 'const survivorIsA = P.survivor !== "B"'],
    ["Engine B anchor", "const _survivorIsA = _single || ((_dobAYr + _tlT.lifeExpA)"],
    ["Engine C anchor", "const _survivorIsA = _singleI || ((_dobAYr + _tlI.lifeExpA)"],
    ["Engine D anchor", "const _deathYr1D ="],
    ["end: computeIrmaaPlan", "function computeIrmaaPlan"],
    ["end: computeWithdrawalPlan", "function computeWithdrawalPlan"],
    ["end: computeTaxPlan", "function computeTaxPlan"],
    ["end: DangerCloseMain", "function DangerCloseMain"],
  ];
  for (const [nm, m] of _markers) {
    const n = src.split(m).length - 1;
    ck(`window bound is unique file-wide — ${nm}`, n === 1, `${n} occurrences`);
  }

  // ── v5.33 addendum · a NEGATIVE CONTROL THAT DID NOT FIRE, and what it exposed ──────────
  // Building the D-4 window fix, a control weakened ONE of Engine D's death guards
  // (`survAdj = yr >= _deathYr1D` -> `>`) and t14 stayed green at 41/0. The reason is that
  // the per-engine `death` regex is a PRESENCE check: Engine D has TWO death guards in its
  // window — `survAdj` (survivor spending factor) and `_widowedD` (the SS survivor flag) —
  // and any surviving copy keeps the pattern matched. The assertion reads as "Engine D's
  // death guard is correct" and actually means "at least one death guard exists somewhere".
  //
  // Engine D has NO filing concept — verified: it carries `_widowedD` and `_tlW.single`, but
  // no `yr > _deathYr1D` transition, because filing status is Engine B's job. That is why
  // Engine D is legitimately absent from filingEngines below, and it is what makes the fix
  // below sound: inside Engine D, a `>` against the death year can ONLY be a weakened guard,
  // never a filing switch. Asserting the ABSENCE of the weakened form is drift-proof in a way
  // that counting guards is not — a fifth correct guard added later does not break it.
  //
  // ⚠ If Engine D ever gains a filing concept, this assertion must MOVE to filingEngines
  // rather than being deleted, or the C-2C-6 class reopens silently on this engine.
  {
    const dWin = region("const _deathYr1D =", "function computeTaxPlan");
    ck("Engine D window resolves for the death-guard check", !!dWin);
    if (dWin) {
      const ge = (dWin.match(/yr >= _deathYr1D/g) || []).length;
      const gt = (dWin.match(/yr > _deathYr1D/g) || []).length;
      ck("Engine D: every death guard uses >= (the death YEAR counts)", ge >= 1, `${ge} found`);
      ck("Engine D [EXTINCTION]: NO weakened > guard — Engine D has no filing switch, so a > here is a defect",
        gt === 0, `${gt} weakened guard(s); Engine D carries ${ge} correct one(s)`);
    }
  }

  // NOTE for Engines A/B/C: their `death` regexes are presence checks too, but the
  // filingEngines block below asserts a MUCH more specific pattern for each
  // (`const widowed = !P.single && yr >= P.deathYr1` plus the paired `>` filing switch),
  // so the same blind spot is materially narrower there. It is not zero. Recorded rather
  // than fixed, because widening it is a scope of its own and this addendum is D-4.

  const engines = [
    { name: "Engine A (Roth strategy engine)", anchor: 'const survivorIsA = P.survivor !== "B"', endMarker: "function computeIrmaaPlan",
      rule: /const lg = Math\.max\(ssA_y, ssB_y\)/, death: /yr >= P\.deathYr1/ },
    { name: "Engine B (Taxes tab)", anchor: "const _survivorIsA = _single || ((_dobAYr + _tlT.lifeExpA)", endMarker: "function DangerCloseMain",
      rule: /const lg = Math\.max\(ssA_y, ssB_y\)/, death: /yr >= _deathYr1/ },
    { name: "Engine C (IRMAA planner)", anchor: "const _survivorIsA = _singleI || ((_dobAYr + _tlI.lifeExpA)", endMarker: "function computeWithdrawalPlan",
      rule: /const lg = Math\.max\(ssA_y, ssB_y\)/, death: /yr >= _deathYr1/ },
    { name: "Engine D (Withdrawal tab)", anchor: "const _deathYr1D =", endMarker: "function computeTaxPlan",
      rule: /Math\.max\(_ssA_full, _ssB_full\)/, death: /yr >= _deathYr1D/ },
  ];
  // v5.14 — THE GAP THIS SUITE HAD. t14 shipped at v5.13 asserting the Social Security survivor rule
  // across four engines, and it did NOT catch finding C-2C-6: Engine A carried the SS rule correctly
  // while filing Single a year too early, because filing-status TIMING was never asserted. Every
  // engine with a filing concept must separate the death event (`>=`) from the filing switch (`>`).
  // This is the invariant that would have caught C-2C-6 on the day the v5.12 fix created it.
  const filingEngines = [
    { name: "Engine A (Roth strategy engine)", anchor: 'const survivorIsA = P.survivor !== "B"', endMarker: "function computeIrmaaPlan",
      death: /const widowed\s*=\s*!P\.single && yr >= P\.deathYr1/, filing: /!P\.single && yr > P\.deathYr1/ },
    { name: "Engine B (Taxes tab)", anchor: "const _survivorIsA = _single || ((_dobAYr + _tlT.lifeExpA)", endMarker: "function DangerCloseMain",
      death: /const widowed\s*=\s*!_single && yr >= _deathYr1/, filing: /!_single && yr > _deathYr1/ },
    { name: "Engine C (IRMAA planner)", anchor: "const _survivorIsA = _singleI || ((_dobAYr + _tlI.lifeExpA)", endMarker: "function computeWithdrawalPlan",
      death: /const widowed\s*=\s*!_singleI && yr >= _deathYr1/, filing: /!_singleI && yr > _deathYr1/ },
  ];
  for (const e of filingEngines) {
    const r = region(e.anchor, e.endMarker);
    ck(`structural: ${e.name} region located (filing check)`, !!r);
    if (!r) continue;
    ck(`structural: ${e.name} keys the DEATH EVENT to >= (SS drop, rollover)`, e.death.test(r));
    ck(`structural [EXTINCTION]: ${e.name} keys FILING STATUS to > (Pub. 501 — the year AFTER)`,
      e.filing.test(r), "no strictly-greater filing flag found — filing may be switching in the death year");
  }

  for (const e of engines) {
    const r = region(e.anchor, e.endMarker);
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
    // ── v5.47 — DRIFT-CORRECTED. Read this before touching the tolerance. ────────────────────
    // `cRows[d-1] - cRows[d]` is a RAW year-over-year difference, and this household's MAGI is
    // ALSO rising ~$4K/yr for reasons that have nothing to do with the death (RMD growth on a
    // compounding Traditional balance). The raw difference therefore understates the death
    // effect by about one year of that drift — and it always has. On shipped v5.46 this check
    // read $10K against an expectation of $13.26K and passed with $740 of its $4,000 band left.
    // It was not measuring the quantity its own name claims; the band was absorbing a
    // STRUCTURAL offset, not noise, and that is why it looked healthy for eleven releases.
    //
    // MEASURED, not reasoned. `computeIrmaaPlan` was run on the same household with both deaths
    // pushed past the horizon and the SAME year differenced, which isolates the death and
    // nothing else:
    //     v5.46  isolated death effect $14,090.26   raw reading $10,130.79   drift $3,959.47
    //     v5.47  isolated death effect $13,835.26   raw reading  $9,875.79   drift $3,959.47
    // Both isolated figures sit just ABOVE 0.85 x the smaller check, and the excess is real:
    // the survivor is scored against SINGLE §86 thresholds, which tax the retained check harder.
    // The drift is identical on both builds, so it is not something v5.47 introduced.
    //
    // WHAT v5.47 ACTUALLY DID. Items 5 and 6 moved the isolated effect by exactly $255 — the
    // §86 phase-in multiplier applying to item 5's $300 before the death (1.85 x $300 = $555)
    // and not after it (single filer, out of the phase-in band). $255 of real movement crossed a
    // $1,000 DOM rounding boundary at d-1 and consumed the last $740 of margin. The invariant
    // did not detect a defect; it ran out of headroom it should never have been relying on.
    //
    // THE CORRECTION subtracts one year of drift, estimated from the immediately-prior year's
    // change. It uses only rows this file ALREADY parses — no new engine call, and in
    // particular no `applyLoadedData`, which would mutate module globals underneath the
    // already-mounted DOM (OPERATIONS §C) and silently corrupt every later assertion here.
    //
    // NEGATIVE CONTROL, run at the v5.47 build: with Engine C's survivor rule disabled (the
    // pre-v5.13 C-2C-5 defect — both checks paid for the whole horizon), the corrected form
    // reads $6K against $13.26K and FAILS by $3.26K. It still catches what it exists to catch.
    // Margins: v5.46 $3.26K · v5.47 $2.74K · C-2C-5 control −$3.26K (fires).
    const cDrift = cRows[d - 2] ? (cRows[d - 1].magi - cRows[d - 2].magi) : 0;
    const cDropAdj = cDrop + cDrift;
    ck("Engine C [EXTINCTION]: MAGI falls at the first death by 85% of the smaller check (drift-corrected)",
      Math.abs(cDropAdj - expected) <= 4,
      `drift-corrected drop $${cDropAdj}K (raw $${cDrop}K + one year of drift $${cDrift}K) vs expected ~$${expected.toFixed(1)}K`);
    // TIMING — the transition happens in the same year everywhere, not one year apart.
    if (dDrop !== null) {
      const cPrev = cRows[d - 2] ? cRows[d - 2].magi - cRows[d - 1].magi : 0;
      ck("cross-engine [EXTINCTION]: Engines C and D transition in the SAME year",
        cDrop > cPrev + 5 && dDrop * 1000 >= smaller - 500,
        `C: ${d - 2}->${d - 1} $${cPrev}K then ${d - 1}->${d} $${cDrop}K; D drop $${dDrop}K`);
    }
    // Engines B and C share a basis, so B's retained check and C's lost MAGI must reconcile:
    // (both checks) - (larger) = smaller, and C lost 85% of exactly that.
    // v5.47: reconciles against the DRIFT-CORRECTED figure for the reason recorded above. This
    // check inherited the same defect and was the more dangerous of the two, because it was
    // still passing: at the v5.47 build it had $80 of its $4,000 band left. It would have failed
    // on the next release to touch MAGI at all, and read as that release's regression.
    // Negative control (C-2C-5 disabled): off by $6,920 — fires.
    ck("cross-engine [EXTINCTION]: Engines B and C reconcile on the same flat-SS basis",
      Math.abs((ssA + ssB - bAtTotal) * 0.85 - cDropAdj * 1000) <= 4000,
      `B implies smaller $${ssA + ssB - bAtTotal}; C lost $${cDropAdj}K of MAGI (drift-corrected)`);
  }
} catch (e) {
  fail++; console.log(`  \u2717 t14 run threw: ${String(e).slice(0, 400)}`);
}

console.log(`\nt14 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
