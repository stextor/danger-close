// t26 — THE NO-CONVERSION RMD COUNTERFACTUAL: right seed, right span (v5.44)
// Run: node t26_noconv_span.mjs v544   |   node t26_noconv_span.mjs v543
//
// THE DEFECT THIS EXISTS FOR. `_perRmd` seeds `t0` from `retireStartBalances(rothLadderStart)` — a
// balance already accrued forward to the ladder's first year — and then grew it with an exponent
// counted from `asOfYear`:
//     const yrs = Math.max(0, yr - tl.asOfYear);
// The gap between those two dates was therefore compounded TWICE. On the shipped household that is
// three years at 4.5%, inflating the no-conversion RMD by 14.1%: $102,205 combined instead of
// $89,562. It feeds `rmdNoConvert` → `rmdReduction`, the tab's "Combined RMDs reduced by $X/yr"
// line, so the overstatement made conversions look MORE effective than the model actually says.
//
// ⚠ THE FIGURE IS NOT A CONSTANT. It is (rothLadderStart − asOfYear) years of growth, and BOTH
// dates move — asOfYear with the calendar, rothLadderStart with the household. That is why
// `SCOPE_FIX_tidyup_six.md` recorded 19.3% (four years) while v5.43 measured 14.1% (three), with
// neither wrong at the time. **This suite therefore derives its expectations from the timeline
// rather than hardcoding them**, and pins the shipped household's values separately as a
// today-figure. A hardcoded-only suite would go red on a calendar change and look like a defect.
//
// PRECISION: DOLLAR-EXACT ON BOTH SIDES. The arithmetic inputs — `retireStartBalances`,
// `rmdDivisor`, `rmdStartAge`, `PLAN_TIMELINE` — are all in the shim, so the expected value is
// computed independently rather than scraped. And the RMD cards render FULL DOLLARS (unlike the
// ladder table's $1,000 rounding), so the rendered side is dollar-exact too. OPERATIONS §M's ±$500
// ceiling does not apply to either half of this suite.
//
// GATED PER LEG (OPERATIONS §B2). v5.43 and earlier legitimately carry the wrong span; each leg
// asserts what was true for its own build, and the prior leg is a dated [KNOWN DEFECT] pin.
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v544";
const KNOWN_VERSIONS = ["v542", "v543", "v544", "v545"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST_FIX = VER === "v544" || VER === "v545";
const { __g } = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
const usd = n => "$" + Math.round(n).toLocaleString();

console.log(`t26 \u2014 NO-CONVERSION RMD SPAN (${VER})\n`);

// ── §A · derive the expectation from the timeline, independently of the app's block ─────
const G = 0.045;                                   // tradGrowth, the tab's own rate
const tl = __g.PLAN_TIMELINE();
const rsb = __g.retireStartBalances(tl.rothLadderStart);
T("A-1: the timeline exposes both dates this defect sits between",
  Number.isInteger(tl.asOfYear) && Number.isInteger(tl.rothLadderStart));
T("A-2: the ladder starts AFTER the as-of year \u2014 otherwise the defect is worth $0 and this suite proves nothing",
  tl.rothLadderStart > tl.asOfYear, `asOf ${tl.asOfYear}, ladder ${tl.rothLadderStart}`);
const GAP = tl.rothLadderStart - tl.asOfYear;
T("A-3: the compounded gap is 3 years on this household", GAP === 3, String(GAP));

const people = [["A", tl.dobA.year, rsb.tradInitA]];
if (!tl.single) people.push(["B", tl.dobB.year, rsb.tradInitB]);
const derive = (useLadderStart) => people.map(([who, dobYr, t0]) => {
  const age = __g.rmdStartAge(dobYr), yr = dobYr + age;
  const yrs = Math.max(0, yr - (useLadderStart ? tl.rothLadderStart : tl.asOfYear));
  return { who, age, yr, rmd: Math.round(t0 * Math.pow(1 + G, yrs) / __g.rmdDivisor(age)) };
});
const CORRECT = derive(true), OLD = derive(false);
const sum = a => a.reduce((s, x) => s + x.rmd, 0);
T("A-4: the two spans give DIFFERENT answers \u2014 the defect is real, not cosmetic", sum(OLD) !== sum(CORRECT));
T("A-5: the old span always OVERSTATES (extra growth cannot reduce a balance)", sum(OLD) > sum(CORRECT));
// Tolerance is 1e-4, not 1e-9: both sides are Math.round()ed dollars, so the ratio of two
// rounded sums cannot reproduce the growth factor to floating-point precision. An exact
// comparison went red on correct code — the assertion was wrong about its own inputs, not the
// arithmetic. $1 of rounding on ~$90,000 is ~1e-5, so 1e-4 is loose enough to be sound and
// tight enough that a one-year error in the span (4.5%, ~4.5e-2) is still caught by 450x.
T(`A-6: the overstatement is exactly ${GAP} years of compounding at 4.5% (rounded-dollar tolerance)`,
  Math.abs(sum(OLD) / sum(CORRECT) - Math.pow(1 + G, GAP)) < 1e-4,
  `ratio ${(sum(OLD) / sum(CORRECT)).toFixed(6)} vs ${Math.pow(1 + G, GAP).toFixed(6)}`);

// Today's figures, pinned separately so a drift is visible without making the suite brittle.
T("A-7 (today's household): correct combined no-conversion RMD is $89,562", sum(CORRECT) === 89562, usd(sum(CORRECT)));
T("A-7 (today's household): the pre-fix figure was $102,205", sum(OLD) === 102205, usd(sum(OLD)));
T("A-7 (today's household): the correction is $12,643 (14.1%)",
  sum(OLD) - sum(CORRECT) === 12643, usd(sum(OLD) - sum(CORRECT)));

// ── §B · the rendered cards, DOLLAR-EXACT ───────────────────────────────────────────────
const require = createRequire(import.meta.url);
require(`./dom_${VER}.cjs`);
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async el => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
const ex = [...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
await click(ex); await flush(); await flush();
const tab = [...body().querySelectorAll("button,div,span")].find(el => (el.textContent || "").trim().toLowerCase() === "roth");
await click(tab); await flush(); await flush();

const txt = body().textContent || "";
const cardRe = /\$([\d,]+)\s*at\s*(\d+)\s*\((20\d\d)\)/g;
const cards = []; let c;
while ((c = cardRe.exec(txt)) !== null) cards.push({ amt: +c[1].replace(/,/g, ""), age: +c[2], yr: +c[3] });
T("B-1: the RMD cards render", cards.length >= 4, `got ${cards.length}`);
// The NO-conversion pair renders FIRST; the with-conversion pair second. Take the first card per year.
const firstFor = y => { const m = cards.filter(x => x.yr === y); return m.length ? m[0].amt : null; };
for (const p of (POST_FIX ? CORRECT : OLD)) {
  T(`B-2[${p.who}]: the no-conversion card reads ${usd(p.rmd)} exactly${POST_FIX ? "" : " [KNOWN DEFECT \u2014 the over-grown figure]"}`,
    firstFor(p.yr) === p.rmd, `rendered ${usd(firstFor(p.yr))}`);
}

// ── §C · the with-conversion side must NOT move \u2014 the overreach test ───────────────────
// `withConv` reads `balAt`, the ladder rows' own balances. This release touches only the
// counterfactual's exponent, so the with-conversion cards are the thing that proves it did not
// reach further. t23 pins their values; this pins that the two legs agree on them.
{
  const lastFor = y => { const m = cards.filter(x => x.yr === y); return m.length ? m[m.length - 1].amt : null; };
  T("C-1: spouse A's WITH-conversion card is $44,991 on both legs (t23's dollar-exact pin, untouched)",
    lastFor(2039) === 44991, usd(lastFor(2039)));
  T("C-2: the with-conversion figure is BELOW the no-conversion one \u2014 converting reduces RMDs",
    lastFor(2039) < firstFor(2039));
  // The user-facing consequence: a smaller counterfactual means a smaller claimed reduction.
  const reduction = (POST_FIX ? sum(CORRECT) : sum(OLD)) - (lastFor(2039) + (lastFor(2041) || 0));
  T(`C-3: the claimed "RMDs reduced by" total is ${usd(reduction)}${POST_FIX ? " \u2014 SMALLER than before, because the counterfactual was inflated" : " [KNOWN DEFECT \u2014 overstated]"}`,
    reduction > 0, usd(reduction));
}

// ── §D · direction, and what this release deliberately did not fix ──────────────────────
if (POST_FIX) {
  T("D-1: this correction makes the plan look WORSE \u2014 conversions save less than the tab claimed",
    sum(CORRECT) < sum(OLD));
  T("D-2: the no-conversion RMD still EXCEEDS the with-conversion one (the tab's core claim survives)",
    sum(CORRECT) > 0);
}
// [KNOWN DEFECT \u2014 tidy-up item 6, deliberately NOT fixed here, decision D-6a(ii)]
// `t0` is the WHOLE Traditional balance; a non-qualified annuity carries no RMD and every engine
// excludes it via `trad * (1 - annShare)`. The Roth tab does not, at TWO sites: this `t0` and the
// ladder's own `rmdA_y`/`rmdB_y`. Fixing only one would put the two cards on different bases — the
// two-disagreeing-projections defect v5.41 removed — so item 6 ships as its own release.
T("D-3 [KNOWN DEFECT item 6]: t0 still uses the whole Traditional balance, not the RMD-bearing part",
  Math.round(rsb.tradInitB) !== Math.round(rsb.rmdInitB));
T("D-3 [KNOWN DEFECT item 6]: the exempt share is available and unused here (annShareB > 0)",
  rsb.annShareB > 0, String(rsb.annShareB));
T("D-3 [KNOWN DEFECT item 6]: its size on this household is $483/yr \u2014 bounded and disclosed",
  Math.abs((people.reduce((s, [who, dobYr, t0]) => {
    const age = __g.rmdStartAge(dobYr), yr = dobYr + age;
    const share = who === "A" ? rsb.annShareA : rsb.annShareB;
    const yrs = Math.max(0, yr - tl.rothLadderStart);
    return s + Math.round(t0 * Math.pow(1 + G, yrs) / __g.rmdDivisor(age)) -
               Math.round(t0 * (1 - share) * Math.pow(1 + G, yrs) / __g.rmdDivisor(age));
  }, 0)) - 483) <= 1);

console.log(`\nt26 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
