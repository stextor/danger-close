// Cross-version DOM comparison of the WITHDRAWAL tab (Engine D), v522 vs v523.
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

const [VA, VB] = [process.argv[2] || "v523", process.argv[3] || "v524"];

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

// ── v5.24: the Priority 1 panel copy is the ONE intended divergence ─────────────
// v5.23 -> v5.24 is a disclosure-only release: no engine is touched, but the Withdrawal
// tab's Priority 1 panel is deliberately reworded (it called the taxable pot "already-taxed
// principal", which is false for ~76% of it on the example household). So a strict
// whole-tab identity check would fail BY DESIGN and prove nothing.
//
// Rather than loosen the comparison, excise exactly that panel body from both sides and
// require everything else to be byte-identical. The excision is anchored, bounded, and
// asserted on both sides, so it cannot quietly swallow a change somewhere else: if either
// anchor goes missing the excision check fails loudly instead of passing vacuously.
const P1_START = "Emergency Fund";
const P1_END = "Years active:";
const excise = (s) => {
  if (!s) return { ok: false, rest: s, block: "" };
  const a = s.indexOf(P1_START);
  if (a < 0) return { ok: false, rest: s, block: "" };
  const b = s.indexOf(P1_END, a);
  if (b < 0) return { ok: false, rest: s, block: "" };
  return { ok: true, rest: s.slice(0, a) + "[[P1-COPY]]" + s.slice(b), block: s.slice(a, b) };
};

const schedA = excise(A.schedule), schedB = excise(B.schedule);
ck("Priority 1 panel located on both builds (the excision is anchored, not blind)",
   schedA.ok && schedB.ok, `${VA} ${schedA.ok} / ${VB} ${schedB.ok}`);

ck("schedule text identical apart from the Priority 1 copy block",
   schedA.ok && schedB.ok && stripV(schedA.rest) === stripV(schedB.rest),
   `lengths ${schedA.rest.length} vs ${schedB.rest.length}`);

if (schedA.ok && schedB.ok && stripV(schedA.rest) !== stripV(schedB.rest)) {
  const a = stripV(schedA.rest), b = stripV(schedB.rest);
  for (let k = 0; k < Math.min(a.length, b.length); k++) {
    if (a[k] !== b[k]) {
      console.log(`\n  UNEXPECTED divergence outside the copy block, at char ${k}:`);
      console.log(`    ${VA}: ...${a.slice(Math.max(0,k-60), k+60)}...`);
      console.log(`    ${VB}: ...${b.slice(Math.max(0,k-60), k+60)}...`);
      break;
    }
  }
}

// The copy block MUST have changed — if it hasn't, the release didn't land.
ck("the Priority 1 copy block DID change (this release's whole visible effect)",
   schedA.block !== schedB.block,
   "copy identical across builds — the disclosure fix did not reach the DOM");
ck(`${VA} carries the OLD false claim`, /Already-taxed principal/i.test(schedA.block));
ck(`${VB} no longer carries it`, !/Already-taxed principal/i.test(schedB.block));

// Whole-tab check, same treatment: version strings and the one intended block excluded.
const fullA = excise(A.full), fullB = excise(B.full);
ck("entire tab text identical apart from version strings and the Priority 1 copy",
   fullA.ok && fullB.ok && stripV(fullA.rest) === stripV(fullB.rest),
   `lengths ${fullA.rest.length} vs ${fullB.rest.length}`);

console.log(`\nDOM DIFF: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
