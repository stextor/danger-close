// t16 — ROTH LADDER FILING STATUS (finding C-2B-3 as amended, fixed at v5.15).
//
// The Roth tab's conversion-ladder projection carried its own private tax arithmetic — separate from
// every engine the rest of the app uses — and hardcoded the MARRIED constants throughout:
//
//     const stdDed2026 = TAX_CONSTS.MFJ_STD;      // half again too large for a single filer
//     const brackets2026 = TAX_CONSTS.MFJ_BR;     // twice as wide as Single's
//     const irmaaBase = IRMAA_CONSTS.MFJ[0];      // twice the Single cliff
//     if (provisional > 44000) …                  // loose literals, bypassing TAX_CONSTS entirely
//     irmaaThreshold: … Math.pow(1.03, …)         // and at a rate the whole app doesn't use
//
// There was no single-filer gate anywhere in the block, so a single filer was shown married figures
// on every row: roughly half the correct deduction subtracted, then taxed at brackets twice as wide.
// Both error channels ran the same way — understated tax makes conversions look cheaper, and the
// overstated IRMAA cliff means fewer crossings get flagged. The tab's whole job is sizing that
// decision.
//
// MEASURED (example household forced to single, 2029 ladder row):
//     v5.14   TAXABLE $61K · RATE 12% · FED TAX $6.7K
//     v5.15   TAXABLE $78K · RATE 22% · FED TAX $11.5K
// Taxable rises by ~$17K (the deduction correction), the marginal rate crosses a bracket, and
// federal tax rises 72%. The original finding estimated "~40% understated" from hand arithmetic on
// rounded display values and labelled it indicative; the executed figure is larger.
//
// THE MFJ HOUSEHOLD MUST NOT MOVE. Case 1 asserts that, and it is what proves the fix touches only
// the branch it was meant to.
//
// PRECISION: the ladder renders $NNK and $N.NK, so these are ±$500 assertions (OPERATIONS §M). The
// movements measured (~$17K of taxable income, ~$4.8K of tax, a whole bracket) dwarf that band.
//
// NEGATIVE CONTROL — run against pre-fix v5.14, 2026-08-09: recorded per case inline.
//
// A LIMITATION, STATED RATHER THAN PAPERED OVER. The scope proposed asserting that the ladder and the
// strategy comparator below it agree for the same household. That is not directly implementable: the
// ladder reports per-year figures across the conversion window, the comparator reports lifetime
// totals across the full horizon, and there is no shared quantity to compare. This suite therefore
// checks the ladder against an INDEPENDENT hand reference built from IRS Rev. Proc. 2025-32 (the
// same approach t10 takes with Engine A), which is arguably stronger than comparing two of the app's
// own engines. Making the two engines directly comparable would mean routing the ladder through
// Engine A — the scope's D-2 option 2, deliberately deferred.
//
// Run: node t16_roth_ladder_filing.mjs [dom_bundle.cjs]
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

console.log("t16 \u2014 ROTH LADDER FILING STATUS (C-2B-3 extinction invariant)");

// Ladder row shape: YEAR $CONVK $TAXABLEK RATE% $FEDK $MAGIK <irmaa flag> <trad> <roth>
const readLadder = () => {
  const t = body().textContent || "";
  const i = t.indexOf("TRAD BALROTH BAL");
  if (i < 0) return null;
  const seg = t.slice(i, i + 6000);
  const re = /(20\d\d)\$(\d+)K\$(\d+)K(\d+)%\$([\d.]+)K\$(\d+)K/g;
  const out = {}; let m;
  while ((m = re.exec(seg)) !== null)
    out[+m[1]] = { conv: +m[2], taxable: +m[3], rate: +m[4], fed: parseFloat(m[5]), magi: +m[6] };
  return out;
};

// applyLoadedData takes a WRAPPER and does not re-render, so park off the target tab first (§C).
const configure = async ({ single, lifeExpA, lifeExpB }) => {
  const P = JSON.parse(JSON.stringify(T.PORTFOLIO));
  P.single = single;
  if (lifeExpA !== undefined) P.lifeExpA = lifeExpA;
  if (lifeExpB !== undefined) P.lifeExpB = lifeExpB;
  if (single) P.incomeSources.ssB = { ...(P.incomeSources.ssB || {}), planned: 0, plannedAge: 67, tableByAge: {} };
  await act(async () => { T.applyLoadedData({ portfolio: P }); });
  await flush(); await flush();
  await gotoTab("taxes");
  return T.PLAN_TIMELINE;
};

try {
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, [role=button], div")]
    .filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  ck("harness: landing screen offers Use Example Data", !!example);
  await click(example); await flush(); await flush();

  const g = window.__g;
  const TC = g.TAX_CONSTS();
  const IC = g.IRMAA_CONSTS();
  ck("constants: Single standard deduction is half MFJ (the gap the defect lived in)",
    TC.SGL_STD * 2 === TC.MFJ_STD, `SGL ${TC.SGL_STD} vs MFJ ${TC.MFJ_STD}`);
  ck("constants: shared SS provisional thresholds exist for BOTH statuses",
    TC.SS_THR2_SGL === 34000 && TC.SS_THR2_MFJ === 44000,
    `SGL ${TC.SS_THR2_SGL} / MFJ ${TC.SS_THR2_MFJ} — the ladder used to hardcode 44000`);

  // ── CASE 1 — the MARRIED household must be untouched by this fix ────────────────────────────
  await configure({ single: false });
  ck("case 1: Roth tab reachable (couple)", await gotoTab("roth"));
  const mfj = readLadder();
  ck("case 1: ladder rows parsed (couple)", !!mfj && Object.keys(mfj).length > 3,
    mfj ? `${Object.keys(mfj).length} rows` : "none");
  if (mfj && mfj[2029]) {
    ck("case 1: the couple's ladder is unchanged by the fix (no collateral movement)",
      mfj[2029].taxable === 74 && mfj[2029].rate === 12 && Math.abs(mfj[2029].fed - 8.3) < 0.2,
      `2029 taxable $${mfj[2029].taxable}K rate ${mfj[2029].rate}% fed $${mfj[2029].fed}K`);
  }

  // ── CASE 2 — the SINGLE filer, which is the whole finding ───────────────────────────────────
  await configure({ single: true });
  ck("case 2: Roth tab reachable (single filer) — it is NOT gated off", await gotoTab("roth"));
  const sgl = readLadder();
  ck("case 2: ladder rows parsed (single)", !!sgl && Object.keys(sgl).length > 3);
  if (sgl && sgl[2029]) {
    const r = sgl[2029];
    // The deduction is the MAGI-to-taxable gap. Pre-fix it was ~$34K (MFJ_STD + senior); post-fix it
    // must be roughly half that. 2029 inflator is 1.02^3.
    const gap = r.magi - r.taxable;
    const expSgl = (TC.SGL_STD * Math.pow(1.02, 3)) / 1000;
    ck("case 2 [EXTINCTION]: the deduction is the SINGLE standard deduction, not the married one",
      Math.abs(gap - expSgl) <= 3,
      `MAGI $${r.magi}K - taxable $${r.taxable}K = $${gap}K, expected ~$${expSgl.toFixed(0)}K (pre-fix ~$34K)`);
    // The bracket. $78K of taxable income is in Single's 22% band and MFJ's 12% band.
    ck("case 2 [EXTINCTION]: the marginal rate is scored against SINGLE brackets",
      r.rate === 22, `rate ${r.rate}% on $${r.taxable}K taxable (pre-fix 12%, the MFJ band)`);
    // Independent hand reference from IRS Rev. Proc. 2025-32, NOT the app's own tables.
    const BR_S = [[0.10, 12400], [0.12, 50400], [0.22, 105700], [0.24, 201775]];
    const infl = Math.pow(1.02, 3);
    let ti = r.taxable * 1000, tax = 0, prev = 0;
    for (const [rate, up] of BR_S) { const u = up * infl; const seg = Math.min(ti, u) - prev; if (seg > 0) tax += seg * rate; prev = u; if (ti <= u) break; }
    ck("case 2 [EXTINCTION]: federal tax matches an independent Single-bracket computation",
      Math.abs(r.fed * 1000 - tax) <= 500,
      `shown $${r.fed}K vs hand-computed $${(tax / 1000).toFixed(1)}K`);
    ck("case 2: the correction RAISES the single filer's tax (non-conservative defect removed)",
      r.fed > 9, `$${r.fed}K — pre-fix showed $6.7K`);
  }

  // ── CASE 3 — the shared IRMAA threshold helper, not a fifth private copy ────────────────────
  // STRUCTURAL, and deliberately so. The ladder only renders its cliff figure on rows that actually
  // trigger IRMAA, which the example household never does, so there is no rendered number to read
  // without inventing a second high-income fixture. Asserting the SOURCE is the honest alternative:
  // the block must hold no private copy of the threshold arithmetic and must call the shared helper.
  // (An earlier draft of this case computed the expected threshold from constants and compared it to
  // itself — a tautology that passed on both builds. Recorded because the failure mode is easy to
  // repeat: a test that never touches the app cannot fail for the right reason.)
  {
    const src = readFileSync(new URL("../DangerClose.jsx", import.meta.url), "utf8");
    const i = src.indexOf('activeTab === "roth"');
    const j = src.indexOf("single: !!_tlR.single", i);
    const ladder = i >= 0 && j > i ? src.slice(i, j) : null;
    ck("case 3: ladder block located in canonical source", !!ladder);
    if (ladder) {
      ck("case 3 [EXTINCTION]: the ladder holds NO private IRMAA inflator (was Math.pow(1.03, ...))",
        !/Math\.pow\(1\.03/.test(ladder), "a 1.03 inflator is still present in the ladder block");
      ck("case 3 [EXTINCTION]: the ladder calls the shared irmaaThresholdFor helper",
        (ladder.match(/irmaaThresholdFor\(/g) || []).length >= 2,
        "expected both the projection and the lookback site to use the shared helper");
      ck("case 3 [EXTINCTION]: the ladder no longer hardcodes the married SS provisional literals",
        !/provisional > 44000/.test(ladder) && !/provisional > 32000/.test(ladder),
        "loose 32000/44000 literals still present, bypassing TAX_CONSTS");
      ck("case 3: the ladder no longer hardcodes married brackets or deduction",
        !/const stdDed2026 = TAX_CONSTS\.MFJ_STD/.test(ladder)
        && !/const brackets2026 = TAX_CONSTS\.MFJ_BR/.test(ladder));
    }
  }

  // ── CASE 4 — the survivor transition (scope change 3) ───────────────────────────────────────
  // A couple whose first death lands inside the ladder window: years after it must switch to Single.
  const tl = await configure({ single: false, lifeExpA: 66, lifeExpB: 87 });
  const dY = Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
  ck("case 4 setup: first death falls inside the conversion window", dY < 2040, `deathYr1 ${dY}`);
  ck("case 4: Roth tab reachable", await gotoTab("roth"));
  const surv = readLadder();
  if (surv && surv[dY] && surv[dY + 1]) {
    const before = surv[dY], after = surv[dY + 1];
    // Pub. 501: the death year still files jointly; the year after switches. With income roughly
    // flat, the Single switch narrows the deduction and the brackets, so tax jumps.
    // NOT DISCRIMINATING on its own: tax also rose across this boundary pre-fix, because income
    // moves there anyway. It earns its place paired with the deduction assertion below, which is
    // what isolates the filing switch.
    ck("case 4: the year after the first death shows a tax step-up",
      after.fed > before.fed, `${dY} $${before.fed}K -> ${dY + 1} $${after.fed}K`);
    const g2 = after.magi - after.taxable, g1 = before.magi - before.taxable;
    ck("case 4 [EXTINCTION]: the survivor's deduction drops to the Single figure",
      g2 < g1 - 8, `deduction gap $${g1}K -> $${g2}K`);
  } else {
    ck("case 4: rows present around the death year", false, `deathYr1 ${dY}; rows ${surv ? Object.keys(surv).join(",") : "none"}`);
  }
} catch (e) {
  fail++; console.log(`  \u2717 t16 run threw: ${String(e).slice(0, 400)}`);
}

console.log(`\nt16 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
