// Cross-version DOM comparison of the TAX-BEARING TABS (Engine D's Withdrawal tab, Engine B's
// Taxes tab, Engine C's IRMAA tab). Default pair v535 -> v536.
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
// THIS FILE'S ASSERTIONS FLIP WITH THE RELEASE, AND THAT IS DELIBERATE. At v5.25 it was
// strict identity (nothing moved). At v5.26, intended divergence. v5.27, identity again.
// v5.35, excise-by-anchor (three named regions moved by design). Do not carry either form
// forward by habit: the right assertion is the one that matches what the release actually
// claims to have done; a diff harness that passes for every release is measuring nothing.
//
// ── v5.36 RE-SCOPE, from measurement, and it INVERTED the session brief's premise ─────────
// The brief said "this release moves the schedule again." Measured against the pair before
// re-scoping: the Withdrawal tab is BYTE-IDENTICAL v535 -> v536 (all three v5.35 excise
// regions identical; remainder identical; both legs carry "Total withdrawn"). That is
// CORRECT: the v5.36 basis tracker is bookkeeping ON TOP of the schedule — capGain_y,
// taxBasis and taxGainPool ride the rows without changing any displayed dollar, and the
// sale / growth / RMD paths are untouched (t19 asserts the balances to the cent). So the
// Withdrawal section returns to STRICT IDENTITY — the strongest claim that is true — and
// the v5.35 excise machinery is retired (see git history for its form).
// What v5.36 DOES change is the Taxes tab (Engine B consumes Engine D's realized gains)
// and the IRMAA tab (Engine C's MAGI carries them) — through the CALL SITES, which no
// suite witnesses: t17/t18 call the engines directly, so a forgotten or broken call site
// leaves every suite green. The two new sections below are that witness: version tokens
// are stripped FIRST, so the version bump alone cannot satisfy a divergence check.
//
// usage: node domdiff_withdrawal.mjs <verA> <verB>
import { JSDOM } from "jsdom";
import { createRequire } from "module";

const [VA, VB] = [process.argv[2] || "v535", process.argv[3] || "v536"];

// One mount per leg; the three tabs are read by clicking through the mounted app (the t4
// idiom), because six separate jsdom mounts cost more time than this file is worth.
const renderTabs = async (ver) => {
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

  const readTab = async (name) => {
    const tab = [...body().querySelectorAll("button, div, span")]
      .find(e => (e.textContent || "").trim().toLowerCase() === name);
    tab.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await flush(); await flush(); await flush();
    return body().textContent || "";
  };
  const out = {};
  for (const name of ["withdrawal", "taxes", "irmaa"]) out[name] = await readTab(name);
  const w = out.withdrawal, i = w.indexOf("YearAge A/B");
  out.schedule = i < 0 ? null : w.slice(i, i + 12000);
  return out;
};

const A = await renderTabs(VA);
const B = await renderTabs(VB);

let pass = 0, fail = 0;
const ck = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
const stripV = s => s.replace(/v5\.\d+(\.\d+)?/g, "vX");
const firstDiff = (a, b) => { let k = 0; while (k < Math.min(a.length, b.length) && a[k] === b[k]) k++;
  return `at ${k}: ${VA} ...${a.slice(Math.max(0,k-50), k+60)}... / ${VB} ...${b.slice(Math.max(0,k-50), k+60)}...`; };

console.log(`TAX-BEARING TABS \u2014 cross-version DOM diff ${VA} \u2192 ${VB}\n`);

// ══ WITHDRAWAL — Engine D. v5.36 claim: bookkeeping only, NOTHING rendered moves. ══════════
ck(`${VA}: schedule table rendered`, !!A.schedule, "not found");
ck(`${VB}: schedule table rendered`, !!B.schedule, "not found");
{
  const wA = stripV(A.withdrawal), wB = stripV(B.withdrawal);
  ck("WITHDRAWAL: the tab is byte-identical across the pair (v5.36 touches no rendered figure or copy here)",
     wA === wB, firstDiff(wA, wB));
  // The v5.35 claims must still hold on BOTH sides — this is the assertion that would catch
  // the v5.36 work over-reaching into the prior release's disclosures.
  for (const [V, w] of [[VA, A.withdrawal], [VB, B.withdrawal]]) {
    ck(`${V} carries the v5.35 sourcing disclosure`, /that is how they are actually sourced/i.test(w));
    ck(`${V} carries the v5.35 draw-card label, and not the retired one`,
       /Total withdrawn/i.test(w) && !/Total portfolio draw/i.test(w));
    ck(`${V} still states the v5.26 tax treatment`, /taxed as ordinary income as it is spent/i.test(w));
    ck(`${V} still tells the user their figures moved`, /if your numbers moved, that is why/i.test(w));
  }
}

// ══ TAXES — Engine B. v5.36 claim: the call site feeds Engine D's gains in, so the rendered
//    figures MOVE (version tokens stripped first — the bump alone cannot satisfy this). ═════
{
  // ⚠ The naive whole-tab DIFFERS check was run as its own negative control (both call
  // sites reverted, engines and copy untouched) and DID NOT FIRE: the v5.36 COPY differs
  // across the pair, so the whole tab diverges with the wiring dead. The witness must be a
  // FIGURES-ONLY region — the year table, anchored past every piece of changed copy.
  const region = (s, start, end, label) => {
    const nS = s.split(start).length - 1, nE = s.split(end).length - 1;
    ck(`${label}: region anchors are unique`, nS === 1 && nE === 1, `start x${nS} / end x${nE}`);
    const a = s.indexOf(start), b = s.indexOf(end, a);
    ck(`${label}: start resolves before end`, a >= 0 && b > a, `${a}..${b}`);
    return a >= 0 && b > a ? s.slice(a, b) : "";
  };
  const tA = stripV(A.taxes), tB = stripV(B.taxes);
  const figA = region(tA, "Eff RateBracket", "Estimates only", `${VA} taxes year-table`);
  const figB = region(tB, "Eff RateBracket", "Estimates only", `${VB} taxes year-table`);
  ck("TAXES: the year-table FIGURES differ across the pair \u2014 the call-site wiring is live (control-verified: this region is identical when the call site is dead)",
     figA.length > 0 && figA !== figB, "figures identical: the gainByYr map is not reaching Engine B from the app");
  ck(`${VB} taxes: footnote names the gains' source (the Withdrawal plan's sales)`,
     B.taxes.includes("Realized capital gains are the Withdrawal plan's own sales"));
  ck(`${VB} taxes: the footnote says provisional income counts realized gains (E-16 fixed in-release)`,
     B.taxes.includes("realized capital gains count toward it, as the statute requires"));
  ck(`${VB} EXTINCTION: the '$0 unless a sale is modeled' claim is gone`,
     !B.taxes.includes("default to $0 unless a sale is modeled"));
  ck(`${VA} taxes: the prior leg still carries the $0-gains default it is true to`,
     A.taxes.includes("Realized capital gains default to $0 unless a sale is modeled"));
}

// ══ IRMAA — Engine C. Same claim: realized gains reach IRMAA MAGI through the call site. ════
{
  const iA = stripV(A.irmaa), iB = stripV(B.irmaa);
  const region2 = (s, start, end, label) => {
    const nS = s.split(start).length - 1, nE = s.split(end).length - 1;
    ck(`${label}: region anchors are unique`, nS === 1 && nE === 1, `start x${nS} / end x${nE}`);
    const a = s.indexOf(start), b = s.indexOf(end, a);
    ck(`${label}: start resolves before end`, a >= 0 && b > a, `${a}..${b}`);
    return a >= 0 && b > a ? s.slice(a, b) : "";
  };
  const magA = region2(iA, "Tax YrAffectsMAGI", "Not tax advice", `${VA} irmaa MAGI-table`);
  const magB = region2(iB, "Tax YrAffectsMAGI", "Not tax advice", `${VB} irmaa MAGI-table`);
  ck("IRMAA: the MAGI-table FIGURES differ across the pair \u2014 gains reach IRMAA MAGI through the call site",
     magA.length > 0 && magA !== magB, "figures identical: the gainByYr map is not reaching Engine C from the app");
  ck(`${VB} irmaa: the tab still renders its cliff framing`, /cliff/i.test(B.irmaa));
}

console.log(`\nDOM DIFF: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
