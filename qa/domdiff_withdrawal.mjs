// Cross-version DOM comparison of the WITHDRAWAL tab (Engine D). Default pair v533 -> v534.
// RE-POINT THE DEFAULT EVERY RELEASE — it is hardcoded, and a stale default dies at module
// load looking for a bundle the run folder does not contain (observed at the v5.34 build:
// the committed default was still v529 -> v530, four releases behind).
//
// WHY THIS EXISTS: the release scope assumed t4 and t12 would witness the hoist.
// They do not — a +10% inflation perturbation inside the hoisted function moves
// totalDrawn by $50,320 and BOTH suites still pass. So neither is a witness.
// Engine D was not observable at module level before the hoist, so "every figure
// identical" cannot be proven engine-to-engine across the boundary. What CAN be
// proven is that the RENDERED tab is byte-identical between the two builds.
//
// usage: node domdiff_withdrawal.mjs <verA> <verB>
import { JSDOM } from "jsdom";
import { createRequire } from "module";

const [VA, VB] = [process.argv[2] || "v533", process.argv[3] || "v534"];

const renderWithdrawal = async (ver) => {
  // Seed Math.random BEFORE the bundle import — d3-random captures it at module
  // load (OPERATIONS section C).
  let _s = 123456789;
  Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

  const dom = new JSDOM("<!doctype html><html><body><div id=root></div></body></html>",
    { runScripts: "dangerously", pretendToBeVisual: true, url: "https://localhost/" });
  const { window } = dom;
  global.window = window; global.document = window.document;
  try { Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true }); } catch {}
  global.HTMLElement = window.HTMLElement;
  global.Element = window.Element; global.Node = window.Node;
  global.getComputedStyle = window.getComputedStyle;
  window.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
  window.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
  window.scrollTo = () => {};
  window.HTMLCanvasElement.prototype.getContext = () => ({
    fillRect(){}, clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fill(){}, arc(){},
    save(){}, restore(){}, translate(){}, rotate(){}, scale(){}, fillText(){}, measureText: () => ({ width: 10 }),
    setLineDash(){}, closePath(){}, rect(){}, clip(){}, createLinearGradient: () => ({ addColorStop(){} }),
  });
  // Stub globalThis.URL, not just window.URL — the CJS bundle runs in Node scope.
  if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";

  const require = createRequire(import.meta.url);
  delete require.cache[require.resolve(`./dom_${ver}.cjs`)];
  require(`./dom_${ver}.cjs`);

  const el = window.document.getElementById("root");
  const { root, act, DangerClose } = window.__mount(el);
  const React = require("react");
  const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 60)); }); };
  const body = () => window.document.body;

  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();

  const ex = [...body().querySelectorAll("button, [role=button], div")]
    .filter(e => /use example data/i.test(e.textContent || "") && e.children.length === 0)[0];
  ex.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await flush(); await flush();

  const tab = [...body().querySelectorAll("button, div, span")]
    .find(e => (e.textContent || "").trim().toLowerCase() === "withdrawal");
  tab.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await flush(); await flush(); await flush();

  const t = body().textContent || "";
  const i = t.indexOf("YearAge A/B");
  return { full: t, schedule: i < 0 ? null : t.slice(i, i + 12000) };
};

const A = await renderWithdrawal(VA);
const B = await renderWithdrawal(VB);

let pass = 0, fail = 0;
const ck = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };

console.log(`WITHDRAWAL TAB \u2014 cross-version DOM diff ${VA} \u2192 ${VB}\n`);
ck(`${VA}: schedule table rendered`, !!A.schedule, "not found");
ck(`${VB}: schedule table rendered`, !!B.schedule, "not found");
const stripV = s => s.replace(/v5\.\d+(\.\d+)?/g, "vX");

// ── v5.35: EXCISE-BY-ANCHOR, because this release changes the tab's figures AND its copy ──
// THIS ASSERTION FLIPS WITH THE RELEASE, AND THAT IS DELIBERATE. At v5.25 it was strict identity
// (nothing moved). At v5.26 it was intended divergence (figures moved by design). v5.27 is a
// Field Manual correction only, so the Withdrawal tab must be byte-identical again — and asserting
// that DIRECTLY is stronger than any looser check that would survive both cases.
//
// Do not carry either form forward by habit. The right assertion is the one that matches what the
// release actually claims to have done; a diff harness that passes for every release is measuring
// nothing.
// v5.35 re-scope, following the v5.24 precedent. Strict identity is the WRONG assertion here and
// keeping it would have been a stale lock: v5.35 re-sources the RMD, so every schedule figure
// moves by design, and decisions 3 and 4 change the method note and the draw card's label. Run
// against the pair before re-scoping, it failed exactly where it should — 8 passed / 2 failed,
// with the divergence dump reading "Total portfolio draw$1.55M" vs "Total withdrawn$1.21M".
//
// What is excised is named, bounded and asserted, not waved away:
//   1. the year-by-year schedule table   — every figure moves
//   2. the summary-card row              — the label AND the value move
//   3. the Section A method note         — decision 3's disclosure is appended to it
// Everything else on the tab must still be byte-identical, which is the real claim: this release
// touched Engine D's sourcing and two pieces of copy, and NOTHING ELSE on the tab.
//
// ⚠ An excision can hide a no-op, so each region is also asserted to have ACTUALLY changed. An
// excise-by-anchor that quietly removed an unchanged region would go green while measuring less
// than the strict form it replaced — the failure this file's own header warns about.
const P1_START = "Emergency Fund";
const P1_END = "Years active:";
const locate = (s) => {
  if (!s) return { ok: false, block: "" };
  const a = s.indexOf(P1_START); if (a < 0) return { ok: false, block: "" };
  const b = s.indexOf(P1_END, a); if (b < 0) return { ok: false, block: "" };
  return { ok: true, block: s.slice(a, b) };
};
const p1A = locate(A.schedule), p1B = locate(B.schedule);
ck("Priority 1 panel located on both builds (the comparison is anchored, not blind)",
   p1A.ok && p1B.ok, `${VA} ${p1A.ok} / ${VB} ${p1B.ok}`);

ck("Priority 1 copy block is IDENTICAL across the pair (v5.27 changes no withdrawal copy)",
   p1A.ok && p1B.ok && stripV(p1A.block) === stripV(p1B.block),
   `lengths ${p1A.block.length} vs ${p1B.block.length}`);

// Bounded excision. Both markers asserted unique and ordered before anything is cut — the
// OPERATIONS §C0 rule for bounded edits, which applies to a harness that CUTS a span just as it
// does to one that replaces it. An end marker resolving to the wrong occurrence would silently
// excise half the tab and turn this file green.
// Listed in DOCUMENT ORDER, which was MEASURED rather than assumed — the first draft closed the
// schedule region with "Legend" and failed, because Legend renders BEFORE the schedule, not after.
// Offsets on the v5.34 leg: Years modeled 7033 · Legend 7117 · Sleeve sequencing 7261 · the
// deterministic-path warning 8026 · YearAge A/B 8372 · Emergency Fund 9992.
const REGIONS = [
  ["the summary-card row (label and value both move)", "Years modeled", "Legend"],
  ["the Section A method note (decision 3's disclosure)", "Sleeve sequencing", "⚠ This is a single deterministic path"],
  ["the year-by-year schedule (every figure moves)", "YearAge A/B", "Emergency Fund"],
];
const cutOne = (s, start, end) => {
  const a = s.indexOf(start); if (a < 0) return { ok: false, s };
  const b = s.indexOf(end, a); if (b < 0) return { ok: false, s };
  return { ok: true, s: s.slice(0, a) + s.slice(b), cut: s.slice(a, b) };
};
let remA = stripV(A.full), remB = stripV(B.full);
for (const [label, start, end] of REGIONS) {
  const uA = remA.split(start).length - 1, uB = remB.split(start).length - 1;
  ck(`excision anchor is UNIQUE on both builds \u2014 ${label}`, uA === 1 && uB === 1, `${VA} x${uA} / ${VB} x${uB}`);
  const cA = cutOne(remA, start, end), cB = cutOne(remB, start, end);
  ck(`excision resolves start-before-end on both builds \u2014 ${label}`, cA.ok && cB.ok,
     `${VA} ${cA.ok} / ${VB} ${cB.ok}`);
  if (cA.ok && cB.ok) {
    // The region must ACTUALLY differ, or the excision is hiding a no-op.
    ck(`the excised region really did change \u2014 ${label}`, cA.cut !== cB.cut,
       `identical across the pair: ${cA.cut.length} chars \u2014 excising it measures nothing`);
    remA = cA.s; remB = cB.s;
  }
}

// THE CLAIM: with the three named regions removed, the tab is byte-identical. This release
// touched Engine D's sourcing and two pieces of copy, and nothing else.
ck("the REST of the tab is byte-identical across the pair (excise-by-anchor)",
   remA === remB, `lengths ${remA.length} vs ${remB.length}`);

if (remA !== remB) {
  for (let k = 0; k < Math.min(remA.length, remB.length); k++) {
    if (remA[k] !== remB[k]) {
      console.log(`\n  UNEXPECTED DIVERGENCE outside the excised regions, at char ${k}:`);
      console.log(`    ${VA}: ...${remA.slice(Math.max(0, k - 60), k + 60)}...`);
      console.log(`    ${VB}: ...${remB.slice(Math.max(0, k - 60), k + 60)}...`);
      break;
    }
  }
}

// The two copy changes are asserted POSITIVELY here as well, so the excision above cannot be the
// only thing standing between a dropped disclosure and a green run.
ck(`${VB} carries the v5.35 sourcing disclosure`,
   /that is how they are actually sourced/i.test(B.full), "the decision 3 disclosure is missing");
ck(`${VB} carries the relabelled draw card, and ${VA} still carries the old one`,
   /Total withdrawn/i.test(B.full) && /Total portfolio draw/i.test(A.full),
   `${VB} relabelled: ${/Total withdrawn/i.test(B.full)} / ${VA} old label: ${/Total portfolio draw/i.test(A.full)}`);

// The v5.26 treatment must still be described on BOTH sides — v5.27 must not have undone it while
// correcting the Field Manual. This is the assertion that would catch a copy fix over-reaching.
for (const V of [[VA, p1A.block], [VB, p1B.block]]) {
  ck(`${V[0]} still states the v5.26 tax treatment`,
     /taxed as ordinary income as it is spent/i.test(V[1]));
  ck(`${V[0]} still tells the user their figures moved`,
     /if your numbers moved, that is why/i.test(V[1]));
}

console.log(`\nDOM DIFF: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
