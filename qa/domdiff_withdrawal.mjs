// Cross-version DOM comparison of the WITHDRAWAL tab (Engine D). Default pair v524 -> v525.
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

const [VA, VB] = [process.argv[2] || "v526", process.argv[3] || "v527"];

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

// ── v5.27: BACK TO STRICT IDENTITY, because this release changes no withdrawal copy ──
// THIS ASSERTION FLIPS WITH THE RELEASE, AND THAT IS DELIBERATE. At v5.25 it was strict identity
// (nothing moved). At v5.26 it was intended divergence (figures moved by design). v5.27 is a
// Field Manual correction only, so the Withdrawal tab must be byte-identical again — and asserting
// that DIRECTLY is stronger than any looser check that would survive both cases.
//
// Do not carry either form forward by habit. The right assertion is the one that matches what the
// release actually claims to have done; a diff harness that passes for every release is measuring
// nothing.
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

ck("schedule text identical, with NOTHING excised",
   stripV(A.schedule || "") === stripV(B.schedule || ""),
   `lengths ${(A.schedule || "").length} vs ${(B.schedule || "").length}`);

ck("entire tab text identical apart from the version string",
   stripV(A.full) === stripV(B.full), `lengths ${A.full.length} vs ${B.full.length}`);

if (stripV(A.full) !== stripV(B.full)) {
  const a = stripV(A.full), b = stripV(B.full);
  for (let k = 0; k < Math.min(a.length, b.length); k++) {
    if (a[k] !== b[k]) {
      console.log(`\n  DIVERGENCE at char ${k}:`);
      console.log(`    ${VA}: ...${a.slice(Math.max(0, k - 60), k + 60)}...`);
      console.log(`    ${VB}: ...${b.slice(Math.max(0, k - 60), k + 60)}...`);
      break;
    }
  }
}

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
