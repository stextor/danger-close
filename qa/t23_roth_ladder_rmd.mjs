// t23 — ROTH TAB LADDER: the omitted-RMD term (v5.41 extinction invariants)
// Run: node t23_roth_ladder_rmd.mjs v541   |   node t23_roth_ladder_rmd.mjs v540
//
// WHAT THIS PINS, AND AT WHAT PRECISION (OPERATIONS §M).
// The Roth ladder is a COMPONENT-INLINE engine: it is computed inside the DangerClose
// component body, so it has no module-level binding and `shim.txt` cannot reach its row
// array. Its only output path is the rendered DOM. That splits this suite in two:
//
//   · MAGI and the balance column render as `Math.round(x / 1000)` + "K" → ceiling ±$500.
//     Stated rather than wished away. The effect being measured is +$44,991 / +$46,902,
//     which exceeds that ceiling by ~90x, so the ceiling does not threaten the finding —
//     but a dollar-exact MAGI assertion is NOT available without hoisting the block to
//     module level, and §M requires that hoist to be its own release.
//   · The RMD CARDS render `toLocaleString()` — FULL DOLLARS. So the RMD itself, its
//     Pub. 590-B basis, and the recursion unification ARE pinned to the dollar here.
//
// GATED PER LEG (OPERATIONS §B2). v5.40 and earlier legitimately omit the term; each leg
// asserts what was true for its own build. This is not a defect pin dressed up — the v540
// leg asserts the PRE-FIX figures deliberately, and its greenness is the before/after
// witness for the release.
import { createRequire } from "module";
import "./env_dom.mjs";
// TRAP (OPERATIONS §C): seed Math.random BEFORE importing the bundle.
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;

const VER = process.argv[2] || "v541";
const KNOWN_VERSIONS = ["v539", "v540", "v541", "v542", "v543", "v544", "v545", "v546", "v547", "v548", "v549", "v550", "v551", "v552"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST_FIX = VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552"); // v5.42 carries v5.41's RMD term forward; the §86 fix is $0 at this suite's $70,000 default

let pass = 0, fail = 0;
const T = (name, ok, detail = "") => {
  if (ok) { pass++; } else { fail++; console.log(`  \u2717 ${name}${detail ? " — " + detail : ""}`); }
};

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

console.log(`t23 — ROTH LADDER RMD TERM (${VER})\n`);

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

const txt = body().textContent || "";

// ─── the ladder table, as rendered ───────────────────────────────────────────────────
const rowRe = /(20\d\d)\$(-?\d+)K\$(-?\d+)K(\d+)%\$(-?[\d.]+)K\$(-?\d+)K/g;
const rows = []; let m;
while ((m = rowRe.exec(txt)) !== null)
  rows.push({ year: +m[1], conv: +m[2], taxable: +m[3], rate: +m[4], tax: +m[5], magi: +m[6] });
T("LADDER: 12 rows render (2029–2040)", rows.length === 12, `got ${rows.length}`);
const byYear = Object.fromEntries(rows.map(r => [r.year, r]));

// A-1 · NON-RMD YEARS ARE UNMOVED. This is what keeps the release honest about being the
// RMD term ONLY: if these move, something else came along with it. Identical on both legs.
for (const y of [2032, 2033, 2034, 2035, 2036, 2037, 2038]) {
  T(`A-1: ${y} MAGI unmoved at $122K (pre-RMD year, both legs)`,
    byYear[y] && byYear[y].magi === 122, byYear[y] ? `$${byYear[y].magi}K` : "row missing");
}
T("A-1: 2029 MAGI $108K (spouse-B work taper year, both legs)", byYear[2029] && byYear[2029].magi === 108);
T("A-1: 2030 MAGI $106K (both legs)", byYear[2030] && byYear[2030].magi === 106);
T("A-1: 2031 MAGI $137K (taper + spouse-A SS starts, both legs)", byYear[2031] && byYear[2031].magi === 137);

// A-2 · THE TAIL YEARS — the defect itself.
// Spouse A attains 75 in 2039 (dobA 1964, SECURE 2.0 §107: 75 for 1960+), so the RMD tail
// inside the ladder is 2039–2040, TWO years. Derived before the code existed.
//   post-fix 2039: $121,720 + $44,991 = $166,711 → renders $167K
//   post-fix 2040: $121,720 + $46,902 = $168,622 → renders $169K
//   pre-fix  both: $121,720                       → renders $122K
if (POST_FIX) {
  T("A-2 (V541): 2039 MAGI includes the RMD — $167K (=$166,711 ±$500)",
    byYear[2039] && byYear[2039].magi === 167, byYear[2039] ? `$${byYear[2039].magi}K` : "row missing");
  T("A-2 (V541): 2040 MAGI includes the RMD — $169K (=$168,622 ±$500)",
    byYear[2040] && byYear[2040].magi === 169, byYear[2040] ? `$${byYear[2040].magi}K` : "row missing");
  // Direction and size, not just the value: the tail must EXCEED the pre-RMD plateau by
  // roughly the RMD. A term added with the wrong sign still lands on some number.
  T("A-2 (V541): the tail rises above the plateau by $40K–$50K (the RMD's size)",
    byYear[2039] && byYear[2039].magi - byYear[2032].magi >= 40 && byYear[2039].magi - byYear[2032].magi <= 50,
    byYear[2039] ? `+$${byYear[2039].magi - byYear[2032].magi}K` : "");
  T("A-2 (V541): 2040 exceeds 2039 (the second RMD year is larger, smaller divisor)",
    byYear[2040] && byYear[2039] && byYear[2040].magi > byYear[2039].magi);
} else {
  T("A-2 (PRIOR LEG): 2039 MAGI still omits the RMD — $122K",
    byYear[2039] && byYear[2039].magi === 122, byYear[2039] ? `$${byYear[2039].magi}K` : "row missing");
  T("A-2 (PRIOR LEG): 2040 MAGI still omits the RMD — $122K",
    byYear[2040] && byYear[2040].magi === 122, byYear[2040] ? `$${byYear[2040].magi}K` : "row missing");
  T("A-2 (PRIOR LEG): the tail is FLAT against the plateau — the defect, pinned",
    byYear[2039] && byYear[2032] && byYear[2039].magi === byYear[2032].magi);
}

// A-3 · TAX MOVES WITH IT. An RMD is ordinary income, so it enters grossTaxable, hence
// taxableIncome / tax / marginalRate / headroom24. Pinning this is what stops a future
// edit adding the term to `magi` alone and re-opening the compounding omission.
if (POST_FIX) {
  T("A-3 (V541): 2039 taxable income rises with the RMD (>$110K, was $76K)",
    byYear[2039] && byYear[2039].taxable > 110, byYear[2039] ? `$${byYear[2039].taxable}K` : "");
  T("A-3 (V541): 2039 tax rises above the plateau year's",
    byYear[2039] && byYear[2032] && byYear[2039].tax > byYear[2032].tax);
} else {
  T("A-3 (PRIOR LEG): 2039 taxable income still excludes the RMD (<$85K)",
    byYear[2039] && byYear[2039].taxable < 85, byYear[2039] ? `$${byYear[2039].taxable}K` : "");
}

// ─── the RMD cards — FULL DOLLARS, so these are dollar-exact ─────────────────────────
// Format: "Name: $44,991 at 75 (2039)". Capture the amount and its year together so a
// card cannot pass by matching the right number against the wrong spouse or year.
const cardRe = /\$([\d,]+)\s*at\s*(\d+)\s*\((20\d\d)\)/g;
const cards = []; let c;
while ((c = cardRe.exec(txt)) !== null)
  cards.push({ amt: +c[1].replace(/,/g, ""), age: +c[2], yr: +c[3] });
T("CARDS: RMD cards render (no-conversion and with-conversion, per spouse)",
  cards.length >= 4, `got ${cards.length}`);
// The with-conversion pair is the second half; take the LAST card whose year is 2039.
const a2039 = cards.filter(x => x.yr === 2039);
const b2041 = cards.filter(x => x.yr === 2041);
T("CARDS: spouse A's RMD year is 2039 at age 75 (dobA 1964 → SECURE 2.0 age 75)",
  a2039.length > 0 && a2039.every(x => x.age === 75));
T("CARDS: spouse B's RMD year is 2041 at age 75 (dobB 1966)",
  b2041.length > 0 && b2041.every(x => x.age === 75));

if (POST_FIX) {
  const withA = a2039.length ? a2039[a2039.length - 1].amt : null;
  // B-1 · DOLLAR-EXACT. $1,106,774 (spouse A's 31 Dec 2038 balance) / 24.6 = $44,991.
  // This single number pins THREE things at once:
  //   · the Pub. 590-B BASIS — dividing the GROWN balance instead gives $47,016, a 4.5%
  //     inflation that is otherwise silent (nothing throws, the figures stay plausible);
  //   · the D-1 recursion — convert-then-grow gives a materially smaller balance;
  //   · the D-2 unification — this card is now derived from the ladder loop's own
  //     per-person balance, not from a separate replay of it.
  T("B-1 (V541): spouse A's with-conversion RMD is EXACTLY $44,991 (prior 31 Dec basis ÷ 24.6)",
    withA === 44991, `got ${withA}`);
  // B-2 · the basis error, excluded by name. The grown-balance mistake lands here.
  T("B-2 (V541): the card is NOT the grown-balance figure ($47,016)", withA !== 47016, `got ${withA}`);
  // B-3 · RECURSION UNIFICATION. The card's figure must equal the RMD the ladder loop
  // itself charged in 2039 — i.e. the tab now carries ONE Traditional balance, not two.
  // The loop's 2039 RMD shows up as the MAGI step over the plateau, so cross-check the
  // card against the rendered step (K precision on that side).
  const step = byYear[2039] && byYear[2032] ? (byYear[2039].magi - byYear[2032].magi) * 1000 : null;
  T("B-3 (V541): the card's RMD agrees with the ladder's own MAGI step (±$500, §M ceiling)",
    step !== null && Math.abs(step - withA) <= 500, `card ${withA} vs step ${step}`);
} else {
  const withA = a2039.length ? a2039[a2039.length - 1].amt : null;
  // The pre-fix card came from the retired convert-then-grow replay AND read the balance
  // at the END of 2040 for a 2039 distribution. Pinned as the before-state, not endorsed.
  T("B-1 (PRIOR LEG): spouse A's with-conversion RMD is the pre-unification figure (≠ $44,991)",
    withA !== null && withA !== 44991, `got ${withA}`);
}

console.log(`\nt23 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
