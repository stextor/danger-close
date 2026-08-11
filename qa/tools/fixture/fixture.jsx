// ═══════════════════════════════════════════════════════════════════════════════════════════
// FIXTURE — a file with KNOWN ANSWERS for the qa/tools parser toolkit.
//
// NOT AN APP SOURCE. This is never built, never imported by the app, and never version-bumped.
// Its only job is to contain, deliberately, every case where a grep and an AST walk disagree —
// so that `t21_tools.mjs` can assert what the tools report and a wrong answer becomes a FINDING
// rather than something a human has to notice.
//
// EVERY EXPECTED COUNT IN `t21_tools.mjs` WAS HAND-COUNTED FROM THIS FILE, then compared to tool
// output. Where they disagreed, the disagreement was adjudicated by reading this file — not by
// editing the expectation until it matched. See t21's header for the two that were adjudicated.
//
// The target identifier is `widget`. The target for the residual tools is the
// `balance - roth - trad` shape. Line numbers are load-bearing: t21 asserts them, so
// DO NOT reflow this file. Add new cases at the END only.
// ═══════════════════════════════════════════════════════════════════════════════════════════

// --- TRAP 1: a comment. A grep finds widget here. The AST must not. ------------------------
// widget widget widget

const widget = 1;                                   // L21  ident   (declaration)
const sum = widget + widget;                        // L22  ident x2

// --- TRAP 2: object keys vs values --------------------------------------------------------
const longhand = { widget: 2 };                     // L25  objkey  (value is a Literal, not our id)
const shorthand = { widget };                       // L26  SHORTHAND: ONE source occurrence
const renamed = { other: widget };                  // L27  ident   (value position only)

// --- TRAP 3: member access ----------------------------------------------------------------
const dotted = longhand.widget;                     // L30  prop
const computed = longhand["widget"];                // L31  string  (Literal, not an Identifier)
const dynamic = longhand[widget];                   // L32  ident   (computed -> NOT a prop)

// --- TRAP 4: strings ----------------------------------------------------------------------
const exact = "widget";                             // L35  string  (exact match)
const substring = "the widget lives here";          // L36  ZERO — substring, not an exact match
const templated = `widget`;                         // L37  ZERO — a TemplateLiteral is not a Literal

// --- TRAP 5: shadowing. Both hits below belong to shadower(), not to <module>. -------------
function shadower() {                               // L40
  const widget = 3;                                 // L41  ident, scope = shadower
  return widget;                                    // L42  ident, scope = shadower
}

// --- TRAP 6: nesting. funcmap must report BOTH, at the right depths and ranges. ------------
function outerFn() {                                // L46  depth 1
  const innerFn = () => {                           // L47  depth 2
    const deepest = function () { return 0; };      // L48  depth 3
    return deepest;
  };
  return innerFn;
}                                                   // L52  outerFn ends

// --- TRAP 7: JSX --------------------------------------------------------------------------
const element = <div title={widget} data-x="widget">{widget}</div>;  // L55  ident x2 + string x1

// --- TRAP 8: THE ONE-LINE BLOB. This is the DOCS_HTML hazard in miniature: a single enormous line holding markup, in which the word widget appears many times as SUBSTRINGS of a larger string literal. A grep reports this line once and cannot say how many. The AST must report ZERO identifier hits and ZERO exact-string hits, because no Literal on this line is EQUAL to "widget". If a future change makes the tools stumble on long lines, this is the case that catches it. widget widget widget ---
const BLOB = "<!doctype html><html><body><h1>widget report</h1><p>the widget is a widget-shaped widget</p><table><tr><td>widget</td><td>widget</td></tr></table><footer>end of widget</footer></body></html>";  // L58

// --- TRAP 9: the residual shape, for residual.cjs and diverge.cjs -------------------------
// Two structurally IDENTICAL reduces with different accumulator/param names — diverge must
// group them under ONE fingerprint. The third is deliberately DIFFERENT (no Math.max floor).
const resA = (P) => (P.positions || []).reduce((s, p) => s + Math.max(0, (p.balance || 0) - (p.roth || 0) - (p.trad || 0)), 0);   // L63
const resB = (Q) => (Q.positions || []).reduce((t, q) => t + Math.max(0, (q.balance || 0) - (q.roth || 0) - (q.trad || 0)), 0);   // L64
const resC = (R) => (R.positions || []).reduce((u, r) => u + ((r.balance || 0) - (r.roth || 0) - (r.trad || 0)), 0);              // L65

export { widget, sum, longhand, shorthand, renamed, dotted, computed, dynamic, exact, substring, templated, shadower, outerFn, element, BLOB, resA, resB, resC };

// --- TRAP 10: DECOYS. Added 2026-08-11 because a negative control DID NOT FIRE. ------------
// Breaking residual.cjs's `balance` requirement changed nothing, which meant the fixture tested
// only that the tool FINDS the three true sites — never that it REJECTS a near-miss. It was
// blind to the over-matching direction entirely. Per OPERATIONS §B2 the fixture was strengthened
// rather than the control weakened. These two must NOT be reported by residual.cjs.
const decoyNoBalance = (P) => (P.positions || []).reduce((s, p) => s + (p.roth || 0) - (p.trad || 0), 0);   // L74 roth+trad, NO balance
const decoyNoTrad = (P) => (P.positions || []).reduce((s, p) => s + ((p.balance || 0) - (p.roth || 0)), 0);  // L75 balance+roth, NO trad
