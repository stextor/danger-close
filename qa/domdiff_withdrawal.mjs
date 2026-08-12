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

const [VA, VB] = [process.argv[2] || "v525", process.argv[3] || "v526"];

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

// ── v5.26: INTENDED DIVERGENCE. Identity is no longer the right assertion ──────
// v5.25 required this whole tab to be byte-identical, because that release recorded a
// classification and used it for nothing. v5.26 USES it, so the tab moves BY DESIGN and an
// identity assertion would fail for the right reason while proving nothing about what moved.
//
// What replaces it is harder to satisfy than identity: the tab must diverge, the divergence must
// be confined to FIGURES rather than structure (no year lost, no row dropped), and the three
// statements v5.24/v5.25 made about this money must be gone on the new side and present on the
// old — so the disclosure is proven to have moved WITH the model rather than lagging it.
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

ck("the tab DIVERGES — this release moves figures by design",
   stripV(A.full) !== stripV(B.full), "identical; the v5.26 wiring is unreached");

// STRUCTURE PRESERVED. Divergence must be in the numbers, not in the shape: same years, same
// number of rows. A fix that silently dropped a row would also "diverge", and would pass a
// looser check.
const yearsOf = (s) => (s.match(/\b20\d\d\b/g) || []).join(",");
ck("every schedule YEAR is preserved across the pair (figures moved, structure did not)",
   yearsOf(A.schedule) === yearsOf(B.schedule),
   `${VA} ${(A.schedule.match(/\b20\d\d\b/g) || []).length} yrs vs ${VB} ${(B.schedule.match(/\b20\d\d\b/g) || []).length}`);

// THE DISCLOSURE MOVED WITH THE MODEL. Each of these was true when written and false the moment
// this release landed; a stale disclosure is worse than none, because it states the opposite.
for (const [claim, label] of [
  ["growth is never taxed", "growth is never taxed"],
  ["produces no RMD", "produces no RMD"],
  ["A future release will classify", "the promise of a later fix"],
]) {
  ck(`${VA} carried "${label}"`, p1A.block.includes(claim), "not present on the OLD build — anchor is stale");
  ck(`${VB} no longer carries it`, !p1B.block.includes(claim), "a falsified disclosure survived the release");
}
ck(`${VB} states the new treatment instead`,
   /taxed as ordinary income as it is spent/i.test(p1B.block));
ck(`${VB} tells the user their figures moved`, /if your numbers moved, that is why/i.test(p1B.block));

console.log(`\nDOM DIFF: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
