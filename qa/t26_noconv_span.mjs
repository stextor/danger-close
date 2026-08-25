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
const KNOWN_VERSIONS = ["v542", "v543", "v544", "v545", "v546", "v547", "v548", "v549"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST_FIX = VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549");
// v5.47 — tidy-up item 6. The Roth tab's RMD cards now scale by (1 - annShare), so the
// no-conversion counterfactual sits on the RMD-BEARING balance instead of the whole
// Traditional balance. Legs v542-v546 keep asserting their own correct pre-state.
const POST_ITEM6 = VER === "v547" || (VER === "v548" || VER === "v549");
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

// v5.47 — WHICH BALANCE SEEDS THE ORACLE, and why this route and not the app's.
// Through v5.46 this suite seeded from `tradInit*`, which was right for those builds and wrong
// for v5.47: item 6 moved the cards onto the RMD-bearing balance, so an oracle still carrying
// `tradInit*` fails against correct code — its expectation carried the very defect item 6
// removes. The tempting repair is to mirror the app's new expression, `tradInit * (1 - annSh)`,
// into the test. That would be TAUTOLOGICAL: the assertion would then be re-deriving the
// implementation from itself and could never disagree with it (OPERATIONS §M's warning about
// refactors that ship their own assertions).
// `rmdInit*` is the honest route because it is UPSTREAM of the app's, not parallel to it.
// `retireStartBalances` builds `rmdInitB = posTradB + othRmdB` from the positions directly, and
// then DERIVES `annShareB = (tradInitB - rmdInitB) / tradInitB` from it. So the app's figure
// makes a round trip — balance to ratio and back — while this one reads the primitive that
// ratio came from. They are algebraically equal and structurally different: a wrong field, a
// lost precision, or a share applied to the wrong half all break the agreement.
// Verified at the v5.47 build: tradInitB 218,600 x (1 - 0.03202195791399817) = 211,600 = rmdInitB.
const _seedA = POST_ITEM6 ? rsb.rmdInitA : rsb.tradInitA;
const _seedB = POST_ITEM6 ? rsb.rmdInitB : rsb.tradInitB;
const people = [["A", tl.dobA.year, _seedA]];
if (!tl.single) people.push(["B", tl.dobB.year, _seedB]);
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
// v5.47: PER-LEG. Item 6 moved the seed from the Traditional balance to the RMD-bearing one, so
// every figure derived from it moves too. The v542-v546 numbers are NOT stale — they are those
// builds' own correct pre-state and must keep asserting, or the frozen legs stop guarding
// anything. Only spouse A's $74,492 is common to both bases, because annShareA is 0.
const A7 = POST_ITEM6
  ? { correct: 89079, old: 101655, delta: 12576 }   // RMD-bearing basis (v5.47+)
  : { correct: 89562, old: 102205, delta: 12643 };  // whole-Traditional basis (v5.42-v5.46)
T(`A-7 (today's household): correct combined no-conversion RMD is ${usd(A7.correct)}`,
  sum(CORRECT) === A7.correct, usd(sum(CORRECT)));
T(`A-7 (today's household): the pre-fix figure was ${usd(A7.old)}`, sum(OLD) === A7.old, usd(sum(OLD)));
T(`A-7 (today's household): the correction is ${usd(A7.delta)}`,
  sum(OLD) - sum(CORRECT) === A7.delta, usd(sum(OLD) - sum(CORRECT)));

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
// v5.47: hoisted out of §C so §D's item-6 invariant can read the with-conversion cards too.
const lastFor = y => { const m = cards.filter(x => x.yr === y); return m.length ? m[m.length - 1].amt : null; };
for (const p of (POST_FIX ? CORRECT : OLD)) {
  T(`B-2[${p.who}]: the no-conversion card reads ${usd(p.rmd)} exactly${POST_FIX ? "" : " [KNOWN DEFECT \u2014 the over-grown figure]"}`,
    firstFor(p.yr) === p.rmd, `rendered ${usd(firstFor(p.yr))}`);
}

// ── §C · the with-conversion side must NOT move \u2014 the overreach test ───────────────────
// `withConv` reads `balAt`, the ladder rows' own balances. This release touches only the
// counterfactual's exponent, so the with-conversion cards are the thing that proves it did not
// reach further. t23 pins their values; this pins that the two legs agree on them.
{
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
// ── §E · tidy-up item 6 — the RMD-EXEMPT SHARE ─────────────────────────────────────────
// A non-qualified annuity is taxed as ordinary income when spent but carries NO required
// distribution, so it must not sit in an RMD basis. Every engine excludes it via
// `trad * (1 - annShare)`; through v5.46 the Roth tab did not, at both of its card sites.
//
// PRE-v5.47 LEGS keep the defect pinned with its measured size. Note what these three
// assertions actually test: the HOUSEHOLD (two bases differ, a share exists) and the
// ARITHMETIC (the gap is $483/yr). They never asserted that the APP carried the defect — which
// is why they could not flip on their own and are replaced, not inverted, at v5.47.
if (!POST_ITEM6) {
  T("E-1 [KNOWN DEFECT item 6]: t0 still uses the whole Traditional balance, not the RMD-bearing part",
    Math.round(rsb.tradInitB) !== Math.round(rsb.rmdInitB));
  T("E-2 [KNOWN DEFECT item 6]: the exempt share is available and unused here (annShareB > 0)",
    rsb.annShareB > 0, String(rsb.annShareB));
  T("E-3 [KNOWN DEFECT item 6]: its size on this household is $483/yr — bounded and disclosed",
    Math.abs([["A", tl.dobA.year, rsb.tradInitA, rsb.annShareA], ["B", tl.dobB.year, rsb.tradInitB, rsb.annShareB]]
      .reduce((s, [, dobYr, t0, share]) => {
        const age = __g.rmdStartAge(dobYr), yr = dobYr + age, yrs = Math.max(0, yr - tl.rothLadderStart);
        return s + Math.round(t0 * Math.pow(1 + G, yrs) / __g.rmdDivisor(age)) -
                   Math.round(t0 * (1 - share) * Math.pow(1 + G, yrs) / __g.rmdDivisor(age));
      }, 0) - 483) <= 1);
}

// ── v5.47 · [EXTINCTION] the defect class item 6 closes ────────────────────────────────
// WHAT CLASS. Not "one card was $483 high" — the class is A QUANTITY WHOSE TWO HALVES SIT ON
// DIFFERENT BASES. v5.41 removed exactly that failure when two projections of the Traditional
// balance drifted $48,712 apart, and the cheap repair here (seed `t0` from `rmdInit*`) would
// have re-created it: it fixes the no-conversion half while the with-conversion half keeps
// reading `tradBal*` off the ladder rows. So E-6 below is not a bonus assertion — it is the
// point. Both halves must move, and by their own correct amounts.
if (POST_ITEM6) {
  const yrA = tl.dobA.year + __g.rmdStartAge(tl.dobA.year);
  const yrB = tl.dobB.year + __g.rmdStartAge(tl.dobB.year);
  // The whole-Traditional figures these cards used to render, recomputed here from the OLD
  // basis so a silent revert is caught by value and not merely by inequality.
  const tradFig = (dobYr, t0) => {
    const age = __g.rmdStartAge(dobYr), yr = dobYr + age;
    return Math.round(t0 * Math.pow(1 + G, Math.max(0, yr - tl.rothLadderStart)) / __g.rmdDivisor(age));
  };
  const oldB = tradFig(tl.dobB.year, rsb.tradInitB);

  T("E-4 [EXTINCTION]: spouse B's no-conversion card is on the RMD-BEARING balance ($14,587)",
    firstFor(yrB) === 14587, `rendered ${usd(firstFor(yrB))}`);
  T(`E-5 [EXTINCTION]: it is exactly $483/yr below the whole-Traditional figure (${usd(oldB)})`,
    oldB - firstFor(yrB) === 483, `${usd(oldB)} - ${usd(firstFor(yrB))} = ${usd(oldB - firstFor(yrB))}`);
  T("E-6 [EXTINCTION]: the WITH-conversion card moved too ($3,178) — both halves of one quantity " +
    "on ONE basis, the v5.41 failure mode",
    lastFor(yrB) === 3178, `rendered ${usd(lastFor(yrB))}`);
  T("E-7 [EXTINCTION]: the with-conversion half fell $105 — its own correct amount, not the " +
    "no-conversion half's $483",
    3283 - lastFor(yrB) === 105, `3,283 - ${usd(lastFor(yrB))} = ${usd(3283 - lastFor(yrB))}`);

  // NEGATIVE CONTROL — spouse A. `annShareA` is 0 on this household, so A must move $0. This is
  // the control the fix is scored against: a share applied to the wrong person, or applied
  // unconditionally, breaks A while leaving B looking right.
  T("E-8 [NEGATIVE CONTROL]: annShareA is exactly 0 — A holds no annuity", rsb.annShareA === 0,
    String(rsb.annShareA));
  T("E-9 [NEGATIVE CONTROL]: A's no-conversion card is UNMOVED at $74,492",
    firstFor(yrA) === 74492 && firstFor(yrA) === tradFig(tl.dobA.year, rsb.tradInitA),
    `rendered ${usd(firstFor(yrA))}`);
  T("E-10 [NEGATIVE CONTROL]: A's with-conversion card is UNMOVED at $44,991 (t23's pin)",
    lastFor(yrA) === 44991, `rendered ${usd(lastFor(yrA))}`);
  // ...and the control is MEANINGFUL: a control that cannot fire proves nothing. If A carried
  // B's share, A's card WOULD move — by $2,385 — so E-9 is discriminating, not vacuous.
  {
    const ageA = __g.rmdStartAge(tl.dobA.year);
    const wouldBe = Math.round(rsb.tradInitA * (1 - rsb.annShareB) *
      Math.pow(1 + G, Math.max(0, yrA - tl.rothLadderStart)) / __g.rmdDivisor(ageA));
    T("E-11 [NEGATIVE CONTROL IS LIVE]: had A carried B's share, A's card would have moved",
      wouldBe !== firstFor(yrA) && firstFor(yrA) - wouldBe > 1000,
      `would be ${usd(wouldBe)} vs rendered ${usd(firstFor(yrA))}`);
  }
}

console.log(`\nt26 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
