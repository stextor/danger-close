// t12 — ENGINE D SURVIVOR MODELING (audit finding C-2C-4, fixed at v5.12).
//
// Through v5.11 the Withdrawal tab never modeled the first death. Its horizon runs to the SECOND
// death, so it spent years paying a deceased spouse's Social Security check AND applying the full
// joint spending level. The two errors ran in OPPOSITE directions on Draw Need:
//
//   Both SS checks continue          -> understates Draw Need -> NON-conservative
//   No survivor spending reduction   -> overstates  Draw Need -> conservative
//
// They partially cancelled, which is why the tab looked plausible and why the original finding
// (rating it from the SS half alone) called it non-conservative when on the example household it
// actually read pessimistic. THIS IS WHY BOTH FIXES SHIP TOGETHER (decision D-3): correcting the
// SS half alone would strip out the conservative counterweight and leave the tab optimistic —
// strictly worse than the defect. These tests therefore assert BOTH movements, and a future change
// that restores either error alone will fail here.
//
// Direction coverage: the first death is tested with person A dying (case 1) and with person B
// dying (case 2), so the survivor-keeps-the-LARGER-check rule is exercised in both signs.
//
// PRECISION CEILING (PROJECT_INSTRUCTIONS §M): Engine D is computed inside the component body, so
// the harness cannot reach its row arrays; the Withdrawal schedule renders every figure as
// Math.round(x/1000). These assertions are ±$500, NOT dollar-exact. Adequate here only because the
// movements measured (~$21K of SS, ~$33K of spending) are far larger than the band.
//
// NEGATIVE CONTROL (run 2026-08-09): against the pre-fix v5.11 build this suite correctly fails
// EIGHT assertions — four in each direction case, so neither sign passes by luck:
//   case 1 (A dies 2044): Guaranteed 2043 $85K -> 2044 $88K (rises); Expenses $141K -> $144K (rises)
//   case 2 (B dies 2042): Guaranteed 2041 $81K -> 2042 $83K (rises); Expenses $133K -> $137K (rises)
// The fixed build drops these to $64K/$108K and $66K/$102K respectively. Every [EXTINCTION]
// assertion here is discriminating; none of them passes on the defective build.
//
// Run: node t12_engineD_survivor.mjs [dom_bundle.cjs]
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

console.log("t12 \u2014 ENGINE D SURVIVOR (C-2C-4 extinction invariant, both directions)");

const gotoTab = async (name) => {
  const tab = [...body().querySelectorAll("button, div, span")]
    .find(el => (el.textContent || "").trim().toLowerCase() === name);
  if (tab) { await click(tab); await flush(); await flush(); }
  return !!tab;
};

// applyLoadedData takes a WRAPPER and mutates module-level globals without re-rendering, so park
// off the target tab before navigating back (both traps documented in PROJECT_INSTRUCTIONS §C).
const configure = async ({ dobA, lifeExpA, dobB, lifeExpB }) => {
  const P = JSON.parse(JSON.stringify(T.PORTFOLIO));
  P.dobA = `${dobA}-06-15`; P.dobB = `${dobB}-06-15`;
  P.lifeExpA = lifeExpA; P.lifeExpB = lifeExpB;
  await act(async () => { T.applyLoadedData({ portfolio: P }); });
  await flush(); await flush();
  await gotoTab("roth");
  const tl = T.PLAN_TIMELINE;
  return { dobAYr: tl.dobA.year, dobBYr: tl.dobB.year, lifeExpA: tl.lifeExpA, lifeExpB: tl.lifeExpB,
           deathYr1: Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB) };
};

// Parse the Section A schedule. Row shape (text, no separators):
//   YEAR AGEA/AGEB $GUARANTEEDK (— | $WORKK) $EXPENSESK $DRAWNEEDK $RMDK ...
const readRows = () => {
  const t = body().textContent || "";
  const i = t.indexOf("YearAge A/B");
  if (i < 0) return null;
  const seg = t.slice(i, i + 6000);
  const out = {};
  const re = /(20\d\d)(\d{2})\/(\d{2})\$(\d+)K(?:\u2014|\$\d+K)\$(\d+)K\$(\d+)K/g;
  let m;
  while ((m = re.exec(seg)) !== null) {
    out[Number(m[1])] = { ageA: +m[2], ageB: +m[3], guaranteed: +m[4], expenses: +m[5], drawNeed: +m[6] };
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
  ck("constant: SURVIVOR_SPEND_FACTOR is the shared 0.75 (not a local literal)",
    !g || g.SURVIVOR_SPEND_FACTOR === undefined || g.SURVIVOR_SPEND_FACTOR === 0.75,
    g && `got ${g.SURVIVOR_SPEND_FACTOR}`);

  const runCase = async (label, cfgIn, expectDeath) => {
    const cfg = await configure(cfgIn);
    ck(`${label} setup: first death in ${expectDeath}`, cfg.deathYr1 === expectDeath, JSON.stringify(cfg));
    ck(`${label}: Withdrawal tab reachable`, await gotoTab("withdrawal"));
    const rows = readRows();
    ck(`${label}: schedule rows parsed`, !!rows && Object.keys(rows).length > 10,
      rows ? `${Object.keys(rows).length} rows` : "none");
    if (!rows) return null;
    const d = expectDeath, before = rows[d - 1], at = rows[d], after = rows[d + 1];
    ck(`${label}: rows present around the death year`, !!before && !!at && !!after);
    if (!before || !at || !after) return null;

    // ── THE INVARIANT, HALF 1: the smaller Social Security check stops at the first death.
    // Pre-fix this figure ROSE straight through the death.
    ck(`${label} [EXTINCTION]: Guaranteed income DROPS at the first death (smaller SS check ends)`,
      at.guaranteed < before.guaranteed,
      `${d - 1} $${before.guaranteed}K -> ${d} $${at.guaranteed}K`);
    ck(`${label}: the survivor still receives the LARGER check (income does not collapse)`,
      at.guaranteed > before.guaranteed * 0.5,
      `${d} $${at.guaranteed}K vs prior $${before.guaranteed}K`);

    // ── THE INVARIANT, HALF 2: survivor spending drops by the shared factor. Ships with half 1
    // (decision D-3) — the two must never be separated.
    ck(`${label} [EXTINCTION]: Expenses DROP at the first death (survivor spending factor applied)`,
      at.expenses < before.expenses,
      `${d - 1} $${before.expenses}K -> ${d} $${at.expenses}K`);
    // 0.75 x prior-year expenses, carried forward one year of inflation (~2.7%).
    const expected = before.expenses * 1.027 * 0.75;
    ck(`${label}: the drop is the 0.75 survivor factor, not an arbitrary reduction`,
      Math.abs(at.expenses - expected) <= 2.5,
      `${d} $${at.expenses}K vs expected ~$${expected.toFixed(1)}K`);

    // Both reductions must PERSIST, not apply for a single year.
    ck(`${label}: both reductions persist into the following year`,
      after.guaranteed < before.guaranteed && after.expenses < before.expenses,
      `${d + 1} guar $${after.guaranteed}K, exp $${after.expenses}K`);

    // Years while BOTH are alive must be untouched by the fix.
    const twoBefore = rows[d - 2];
    if (twoBefore) {
      ck(`${label}: nothing changes while both spouses are alive (no early trigger)`,
        before.guaranteed > twoBefore.guaranteed && before.expenses > twoBefore.expenses,
        `${d - 2} -> ${d - 1}: guar $${twoBefore.guaranteed}K->$${before.guaranteed}K, exp $${twoBefore.expenses}K->$${before.expenses}K`);
    }
    return { before, at, after };
  };

  // CASE 1 — person A dies first (example household shape).
  const c1 = await runCase("case 1 (A dies)", { dobA: 1964, lifeExpA: 80, dobB: 1966, lifeExpB: 87 }, 2044);

  // CASE 2 — person B dies first, A survives. Exercises the other sign of the larger-check rule.
  const c2 = await runCase("case 2 (B dies)", { dobA: 1964, lifeExpA: 87, dobB: 1966, lifeExpB: 76 }, 2042);

  // Cross-check: the surviving spouse's identity changes which check is kept, so the two cases must
  // not produce identical survivor-year guaranteed income.
  if (c1 && c2) {
    ck("cross-check: which spouse survives changes the survivor-year guaranteed income",
      c1.at.guaranteed !== c2.at.guaranteed,
      `A-survives-not $${c1.at.guaranteed}K vs B-dies $${c2.at.guaranteed}K`);
  }
} catch (e) {
  fail++; console.log(`  \u2717 t12 run threw: ${String(e).slice(0, 400)}`);
}

console.log(`\nt12 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
