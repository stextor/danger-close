// Cross-version DOM comparison of the TAX-BEARING TABS (Engine D's Withdrawal tab, Engine B's
// Taxes tab, Engine C's IRMAA tab). Default pair v565 -> v566.
// RE-POINT THE DEFAULT EVERY RELEASE — it is hardcoded, and a stale default dies at module
// load looking for a bundle the run folder does not contain (observed at the v5.34 build:
// the committed default was still v529 -> v530, four releases behind).
// ⚠ AND THE HEADER IS PART OF THE DEFAULT. Through v5.40 this line read "v536 -> v537" while
// the code read v537 -> v538 — the file contradicted itself, so neither statement could be
// trusted and a reader had to run it to find out. Roll BOTH in the same edit.
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
// ── v5.37 RE-SCOPE, from measurement — and it inverted the SESSION's OWN stop-report ───────
// The v5.37 stop report predicted the Withdrawal tab "can move" (it renders r.bracket, and
// Engine D's MAGI rises on every ordinary-bearing household). Measured on this pair before
// re-scoping: lifetime MAGI DOES move on the shipped example household (+$3,333.04 — the
// growth line is live at the app's own call path), but the per-year deltas never cross a
// bracket edge, so the bracket column — the only MAGI-derived thing this tab renders — is
// IDENTICAL, and the whole tab is byte-identical. Taxes and IRMAA are identical BY CENSUS:
// their inputs are the capGain_y series, which the v5.37 edit cannot reach (taxOrd is
// write-only into MAGI). So ALL THREE tabs return to STRICT IDENTITY — the strongest claim
// that is true — and the release's divergence witness lives at the engine level, in t19's
// MAGI pin ($3,162,820 exactly) and t20's $724,266 pin, per E-20's rule that a witness must
// be anchored to a region only the claimed mechanism can move; no such DOM region exists.
// The identity form remains CONTROL-COMPATIBLE: a dead Engine B/C call site on either leg
// desynchronizes that leg's figures from the other's and fails the identity check loudly.
// ── v5.40 RE-POINT + IRMAA ANCHOR FIX (2026-08-20) — three releases of neglect ─────────────
// This file was left pointing at v536→v537 through v5.38, v5.39 AND v5.40, against its own
// "re-point every release" rule three lines up. Run on the v539→v540 pair it failed ONE
// check — IRMAA figures-identity — and the failure was NOT a regression: v5.40 deliberately
// rewrote the IRMAA MAGI sentence (the S-1 disclosure fix, in that release's CHANGELOG).
//
// The real defect it exposed is an ASYMMETRY between the two figures-only regions, and it
// had been latent since v5.36. Both are meant to be anchored PAST every piece of changed
// copy (see the E-20 note in the Taxes section). Measured on this pair:
//   TAXES  "Eff RateBracket" → "Estimates only"     = 1,739 chars, ends on the last figure.
//                                                     Its footnote sits OUTSIDE the region.
//   IRMAA  "Tax YrAffectsMAGI" → "Not tax advice"   = 1,972 chars, of which the last ~1,070
//                                                     are PROSE: the "Affects"/headroom
//                                                     explainer AND the CMS/MAGI footnote.
// So the Taxes anchor was placed correctly and the IRMAA one never was — it stopped after
// the footnote instead of before it, making a FIGURES check hostage to any disclosure edit.
// The end anchor moves to the first prose token, giving a 913-char region that is figures
// and nothing else, byte-identical across the pair, and still control-compatible: a dead
// Engine C call site on either leg desynchronizes that leg's MAGI column and fails it.
// Verified: the divergence sat at offset 1,734 of 1,972 — every figure ahead of it matched.
//
// The copy change itself is now witnessed EXPLICITLY rather than incidentally, one assertion
// per leg. ⚠ Those two are PAIR-SPECIFIC and must be re-pointed with the default (they are
// the §B2 "gate the inversion to the builds it is true for" rule: each leg asserts the copy
// that was true for its own build, so the frozen v5.39 leg keeps replaying green).
//
// usage: node domdiff_withdrawal.mjs <verA> <verB>
import { JSDOM } from "jsdom";
import { createRequire } from "module";

const [VA, VB] = [process.argv[2] || "v565", process.argv[3] || "v566"];

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
  // v5.80 (SCOPE_SCENARIO_DEFAULT): the DEFAULT scenario preset changed (BASE → BULL-LEANING), and Engine D's draws follow the
  // preset, so rendering each leg at its own default compares different INPUTS, not different engines. Pin BASE — the only
  // preset v5.79 knows — through the one storage key v5.80 restores; v5.79 never reads it. Everything else in storage stays
  // absent, as it was before this line. Both legs then render from identical inputs and every check here stays byte-strict.
  window.storage = { async get(k) { if (k === "danger_close:scenario_v1") return { key: k, value: "base" }; throw new Error("key not found: " + k); },
                     async set(k, v) { return { key: k, value: v }; }, async delete(k) { return { key: k, deleted: true }; }, async list() { return { keys: [] }; } };
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
    // v5.81: capture what is RENDERED on this desktop viewport, not everything in the DOM. <style> text is never displayed,
    // and .dc-phone-only elements (v5.81's tab menu and plan-summary line) have no box at desktop width. Both were in
    // body.textContent, so every CSS addition (v5.79, v5.81) and every phone-only element broke the byte-identity check with
    // no rendered cell moving. Excluded for EVERY pair; everything else stays byte-strict.
    const clone = body().cloneNode(true);
    clone.querySelectorAll("style, .dc-phone-only").forEach(n => n.remove());
    return clone.textContent || "";
  };
  const out = {};
  for (const name of ["withdrawal", "taxes", "irmaa"]) out[name] = await readTab(name);
  const w = out.withdrawal, i = w.indexOf("YearAge A/B");
  out.schedule = i < 0 ? null : w.slice(i, i + 12000);
  // v6.30 (D-60): the rendered plan's inflation and clock, read from the leg's own scenario table and timeline (Σ prob × inflation)
  { const G = window.__g, tl = G.PLAN_TIMELINE(); out.units = { i: Object.values(G.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0), asOf: tl.asOfYear, R: tl.targetRetireYear }; }
  return out;
};

const A = await renderTabs(VA);
const B = await renderTabs(VB);

let pass = 0, fail = 0;
const ck = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
const stripV = s => s.replace(/v\d\.\d+(\.\d+)?/g, "vX"); // v6.00: any major, not v5 only
const firstDiff = (a, b) => { let k = 0; while (k < Math.min(a.length, b.length) && a[k] === b[k]) k++;
  return `at ${k}: ${VA} ...${a.slice(Math.max(0,k-50), k+60)}... / ${VB} ...${b.slice(Math.max(0,k-50), k+60)}...`; };

console.log(`TAX-BEARING TABS \u2014 cross-version DOM diff ${VA} \u2192 ${VB}\n`);

// ══ WITHDRAWAL — Engine D. v5.36 claim: bookkeeping only, NOTHING rendered moves. ══════════
ck(`${VA}: schedule table rendered`, !!A.schedule, "not found");
ck(`${VB}: schedule table rendered`, !!B.schedule, "not found");
{
  // v5.79 (SCOPE_PHONE_LAYOUT) added CSS rules to the shell's <style> block, and this capture is body.textContent, which
  // INCLUDES that CSS as text. For THIS pair only, exactly those two inserted passages are removed from the v5.79 side
  // (each must occur exactly once, or the check fails) and nothing else — any other difference still fails. Applied
  // BEFORE stripV, which would otherwise rewrite the "v5.79" inside them. The claim behind this check (no rendered cell
  // moves) was proved at that build in real Chromium, element by element at 1440 and 820 px.
  const _p579 = VA === "v578" && VB === "v579";
  const _cut = (s, re, what) => { const m = s.match(re); if (!m || s.split(m[0]).length !== 2) { ck(`v5.79 CSS passage found exactly once (${what})`, false, m ? "more than once" : "absent"); return s; } return s.replace(m[0], ""); };
  const _n579 = (s) => !_p579 ? s : _cut(_cut(s, /\s*select \{ max-width: 100%; \}\s*\/\* v5\.79 \(F-11\)[^*]*\*\//, "select cap"),
                                     /\s*\/\* v5\.79 \(F-11, decision D-1\)[\s\S]*?per table where 600 is wider than its tablet column \*\//, "scroll-box rules");
  // v6.08 (D-34 — docs/SCOPE_D34_ENGINE_D_OTHER_IRA_V608.md) adds ONE sentence to Section A's note, saying where a conversion comes from.
  // For THIS pair only, exactly that sentence is removed from the v6.08 side (it must occur exactly once, or the check fails) and nothing
  // else: the release's claim is that on the example household at the opening slider no rendered cell of this tab moves (t71 §E proves it
  // at engine level, field by field). A single-pair gate on purpose — the next pair has the sentence on both sides.
  const _p608 = VA === "v607" && VB === "v608";
  const _n608 = (s) => !_p608 ? s : _cut(s, / ?A conversion takes the buckets' pre-tax money first, then a Traditional IRA you entered under Other accounts, and never annuity money — that order is the model's assumption, not a rule\./, "v6.08 Conv sentence");
  // v6.09 (D-35 — docs/SCOPE_D35_ENGINE_D_OTHER_ROTH_V609.md) adds ONE sentence to the Priority-1 card's tax treatment (a Roth IRA entered
  // under Other accounts is spent tax-free, with no RMD, and counted there only) and changes the Roth card's balance to the holdings' Roth
  // money. The example household holds no Roth IRA under Other accounts, so that balance reads the same; for THIS pair only the one sentence
  // is set aside (it must occur exactly once) and nothing else — no rendered cell of this tab moves on the example (t72 §D, at engine level).
  const _p609 = VA === "v608" && VB === "v609";
  const _n609 = (s) => !_p609 ? s : _cut(s, / ?A Roth IRA you entered under Other accounts sits here too: it is spent tax-free and carries no RMD, and it is counted here only, not again in the Roth line below\./, "v6.09 Priority-1 sentence");
  // v6.10 (the 2025 SCF refresh — docs/SCOPE_PEER_DATA_SCF2025_V610.md) clears the Events tab's peer-benchmark alarm, which v6.09 raises
  // from October 2026. The shell's action banner sits above every tab, so it is inside this capture, and it names the most urgent open event
  // on the RUN DATE, so on this pair it can differ for that reason alone (measured 2026-10-13: v6.09 "ACTION WINDOW OPEN: Peer-benchmark
  // data refresh", v6.10 "GETTING CLOSE: Annual tax-data refresh"). For THIS pair only, the one banner line is set aside on BOTH sides and
  // nothing else; on a run date with no open event neither side has one, and the replace is a no-op. The tab itself is still compared whole.
  const _p610 = VA === "v609" && VB === "v610";
  const _BAN = /(?:⚠ ACTION REQUIRED|▶ ACTION WINDOW OPEN|◔ GETTING CLOSE):[\s\S]{1,400}?\s+—\s+open the EVENTS tab for instructions/;
  const _n610 = (s) => !_p610 ? s : s.replace(_BAN, "");
  // v6.15 (docs/SCOPE_EVENTS_USER_FACING_V615.md) rebuilds the Events tab: the tax card becomes a NOTICE that never raises the action
  // banner, the backtest and peer chores leave, and the ⌛ STALE DATA strip loses its maintainer sentence. Both lines sit above every tab,
  // so they are inside this capture, and both depend on the RUN DATE (measured 2026-10-16: v6.14 "GETTING CLOSE: Annual tax-data
  // refresh", v6.15 no banner; the STALE strip renders only from the January after the figures' year). For THIS pair only, the two
  // lines are set aside on BOTH sides and nothing else; on a run date with neither, the replaces are no-ops. The two checks keep the mask
  // honest: whatever v6.15 shows, its banner never names the tax notice and its STALE strip never carries the maintainer workflow.
  const _p615 = VA === "v614" && (VB === "v615" || (VB === "v616" || (VB === "v617" || (VB === "v618" || (VB === "v619" || (VB === "v620" || (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))))))))))))));
  const _STALE = /⌛ STALE DATA:[\s\S]{1,900}?(?:constant-update workflow\.|brings it across\.)/;
  const _n615 = (s) => !_p615 ? s : s.replace(_BAN, "").replace(_STALE, "");
  if (_p615) {
    const banB = (B.withdrawal.match(_BAN) || [""])[0];
    ck("WITHDRAWAL (v614\u2192v615): the v6.15 action banner, if any, never names the tax-figures notice", !/Tax figures in this copy|tax-data refresh/.test(banB), banB.slice(0, 120));
    ck("WITHDRAWAL (v614\u2192v615): the v6.15 side carries no maintainer workflow in the STALE strip", !/Maintaining the file yourself/.test(B.withdrawal));
  }
  // v6.12 (C-5 — docs/SCOPE_C5_ENGINE_D_SS86_V612.md) re-figures the Bracket column (Social Security by the §86 worksheet, the year's
  // filing status, the table indexed) and adds ONE sentence to the table's note saying what the column is. For THIS pair only: that
  // sentence is set aside on the v6.12 side (exactly once), and every Bracket cell — a one- or two-digit rate immediately followed by the
  // row's EOY Portfolio "$N.NNM" — is masked on BOTH sides, the same number on each, or the check fails. Everything else in the tab must
  // still be byte-identical: the release's claim is that nothing but the column moves (t75 C-1 proves it field by field, and t75 E-2
  // checks every cell's value). The two checks after the identity keep the mask honest: it bit, and the masked cells really did move.
  const _p612 = VA === "v611" && VB === "v612";
  const _BR612 = /\d{1,2}%(?=\$\d+\.\d{2}M)/g;
  const _n612 = (s) => !_p612 ? s : _cut(s, / ?The Bracket column is the federal marginal rate on the year's ordinary income:[^.]*\. State tax and capital-gains rates are on the Taxes tab\./, "v6.12 Bracket sentence");
  const _m612 = (s) => !_p612 ? s : s.replace(_BR612, "#%");
  if (_p612) {
    const cA = (A.withdrawal.match(_BR612) || []), cB = (B.withdrawal.match(_BR612) || []);
    ck("WITHDRAWAL (v611→v612): the Bracket cells are masked — the same number on each side, one per schedule row", cA.length > 0 && cA.length === cB.length, `${cA.length} vs ${cB.length}`);
    ck("WITHDRAWAL (v611→v612): …and the masked cells DIFFER — the column was re-figured (a v6.12 still on the flat-85% column fails here)", cA.join() !== cB.join(), cA.join(","));
  }
  // v6.18 (D-41 — docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md): Engine D reads the expense table year by year, so on the example the
  // schedule's spending, draws and balances move BY DESIGN (2029 carries the golf cart and closing costs; from May 2034 the car payment is
  // gone), with the two summary figures computed from them, and the tab gains ONE sentence saying where its spending comes from. For THIS
  // pair only: that sentence is set aside on the v6.18 side (exactly once); the schedule grid ("EOY Portfolio" to "Section B"), Total
  // withdrawn and the 10-year average withdrawal rate are masked on BOTH sides; everything else must still be byte-identical (measured at
  // the build: nothing else differs). The checks after the identity keep the mask honest: each mask bit once a side, the masked text
  // differs, and 2029's Expenses cell is the June 2029 snapshot's $98K on v6.17 and $126K on v6.18. Engine-level figures are t81's and t40's.
  const _p618 = VA === "v617" && (VB === "v618" || (VB === "v619" || (VB === "v620" || (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635")))))))))));
  const _M618 = [[/EOY Portfolio[\s\S]*?Section B/, "EOY Portfolio#Section B"], [/Total withdrawn\$[\d.]+[KM]/, "Total withdrawn#"], [/Avg wr \(first 10 yr\)[\d.]+%/, "Avg wr (first 10 yr)#"]];
  const _n618 = (s) => !_p618 ? s : _cut(s, / ?Expenses are your expense table at each year's own dates[\s\S]*?for every plan\./, "v6.18 spending sentence");
  const _m618 = (s) => !_p618 ? s : _M618.reduce((t, [re, to]) => t.replace(re, to), s);
  if (_p618) {
    for (const [re] of _M618) for (const [V, w] of [[VA, A.withdrawal], [VB, B.withdrawal]])
      ck(`WITHDRAWAL (v617\u2192v618): the ${String(re).slice(1, 22)}\u2026 mask bites exactly once on ${V}`, (w.match(new RegExp(re.source, "g")) || []).length === 1);
    const gA = (A.withdrawal.match(_M618[0][0]) || [""])[0], gB = (B.withdrawal.match(_M618[0][0]) || [""])[0];
    ck("WITHDRAWAL (v617\u2192v618): \u2026and the masked schedule DIFFERS \u2014 the year-by-year read reached the tab (a v6.18 still on the snapshots fails here)", gA.length > 0 && gA !== gB);
    const c29 = g => (g.match(/EOY Portfolio2029\d{2}\/\d{2}\$[\d.]+K(?:\$[\d.]+K|\u2014)(\$[\d.]+K)/) || [])[1];
    ck("WITHDRAWAL (v617\u2192v618): 2029's Expenses cell is $98K on v6.17 (the June 2029 snapshot) and $126K on v6.18 (the one-time rows in)", c29(gA) === "$98K" && c29(gB) === "$126K", `${c29(gA)} / ${c29(gB)}`);
  }
  // v6.19 (D-46 — docs/SCOPE_D46_MC_CALENDAR_V619.md): the Monte Carlo's quarter calendar. In this harness every simulation draws from ONE
  // seeded Math.random stream, and the app opens on the Dashboard, whose 30-year runs and stress set run BEFORE the 6-year runs that feed the
  // header. v6.19 changes how many numbers those runs consume (run A now runs 11 quarters to the retirement quarter, not 12; the stress
  // set draws its random regime every fourth quarter even inside a forced year), so the 6-year runs read a shifted stream: the header's
  // success rate and the three retirement cards' success rates and medians differ although the 6-year engine is bit-identical given the
  // same stream (t82 C). MEASURED at the build: v6.19 with v6.18's run A length and draw-skipping restored renders this tab byte-identical
  // to v6.18 (DOM DIFF 32 of 32). For THIS pair only those Monte Carlo figures are masked on both sides; each mask must bite exactly as
  // often as stated, and everything else must still be byte-identical.
  const _p619 = VA === "v618" && (VB === "v619" || (VB === "v620" || (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))))))))));
  const _M619 = [[/Success rate\d+(?:\.\d)?%/g, "Success rate#", 1], [/(\d+-month gap before [^.]+\.)\d+(?:\.\d)?%median@retire: \$[\d.]+[KM]/g, "$1#median@retire: #", 3]];
  const _m619 = (s) => !_p619 ? s : _M619.reduce((t, [re, to]) => t.replace(re, to), s);
  if (_p619) for (const [re, , n] of _M619) for (const [V, w] of [[VA, A.withdrawal], [VB, B.withdrawal]])
    ck(`WITHDRAWAL (v618\u2192v619): the ${String(re).slice(1, 24)}\u2026 mask bites exactly ${n}\u00d7 on ${V} (the shared random stream; see above)`, (w.match(re) || []).length === n);
  // v6.20 (D-40, D-44, D-45 — docs/SCOPE_D40_MC_TAX_V620.md): both Monte Carlo engines now pay the Taxes tab's tax and charge one-time
  // rows in their own quarter, so the header's success rate and the three retirement cards' success rates and medians move BY DESIGN —
  // the figures, not the stream this time. For THIS pair the same masks as v6.19's are applied on both sides; each must bite exactly as
  // often as stated, and everything else on the tab must still be byte-identical (the Withdrawal tab's own figures do not move: Engine D
  // is untouched, t83 H).
  const _p620 = VA === "v619" && (VB === "v620" || (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635")))))))));
  const _m620 = (s) => !_p620 ? s : _M619.reduce((t, [re, to]) => t.replace(re, to), s);
  if (_p620) for (const [re, , n] of _M619) for (const [V, w] of [[VA, A.withdrawal], [VB, B.withdrawal]])
    ck(`WITHDRAWAL (v619\u2192v620): the ${String(re).slice(1, 24)}\u2026 mask bites exactly ${n}\u00d7 on ${V} (the Monte Carlo pays the Taxes tab's tax)`, (w.match(re) || []).length === n);
  if (_p620) ck("WITHDRAWAL (v619\u2192v620): \u2026and the header's success rate DIFFERS across the pair (a v6.20 still on the flat drag fails here)",
    (A.withdrawal.match(/Success rate\d+(?:\.\d)?%/) || [""])[0] !== (B.withdrawal.match(/Success rate\d+(?:\.\d)?%/) || [""])[0]);
  // v6.21 (D-42 — docs/SCOPE_D42_CAR_V621.md): the example's table gains four $40,000 car rows, March 2037, 2045, 2053 and 2061, and Engine
  // D spends them, so the schedule moves BY DESIGN from 2037 on — and only from 2037: every earlier year's row must still be byte-identical.
  // For THIS pair only: each schedule row whose year is 2037 or later is masked on BOTH sides (the year kept), and so are the two summary
  // figures computed from the whole schedule (Total withdrawn; the 10-year average withdrawal rate, whose window reaches 2038). Everything
  // else on the tab must still be byte-identical — bar the footer's count of expense lines, 31 → 35 (the four rows), checked exactly and set
  // aside. The checks keep the masks honest: the same rows are masked on each side, the masked rows
  // DIFFER (a v6.21 whose Engine D never charges the rows fails here), and the first masked row is 2037. Engine-level figures are t84's.
  const _p621 = VA === "v620" && (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))))))));
  const _ROW = /(?=20[2-9]\d\d{2}\/\d{2})/;   // a schedule row opens with its year then the ages, "2037" + "73/71"
  const _grid621 = s => (s.match(/EOY Portfolio[\s\S]*?Section B/) || [""])[0];
  const _late621 = s => _grid621(s).split(_ROW).filter(r => /^20[2-9]\d\d{2}\//.test(r) && +r.slice(0, 4) >= 2037);
  const _m621 = (s) => {
    if (!_p621) return s;
    const g = _grid621(s); if (!g) return s;
    const g2 = g.split(_ROW).map(r => /^20[2-9]\d\d{2}\//.test(r) && +r.slice(0, 4) >= 2037 ? r.slice(0, 4) + "#" : r).join("");
    return s.replace(g, () => g2).replace(/Total withdrawn\$[\d.]+[KM]/, "Total withdrawn#").replace(/Avg wr \(first 10 yr\)[\d.]+%/, "Avg wr (first 10 yr)#").replace(/│ (31|35) expense lines │/, "│ # expense lines │");
  };
  if (_p621) {
    const nL = w => (w.match(/│ (\d+) expense lines │/g) || []);
    ck("WITHDRAWAL (v620\u2192v621): the footer counts 31 expense lines on v6.20 and 35 on v6.21 (the four car rows), once each", nL(A.withdrawal).join() === "│ 31 expense lines │" && nL(B.withdrawal).join() === "│ 35 expense lines │", nL(A.withdrawal).join() + " / " + nL(B.withdrawal).join());
    const lA = _late621(A.withdrawal), lB = _late621(B.withdrawal);
    ck("WITHDRAWAL (v620\u2192v621): the same schedule rows from 2037 are masked on each side, the first of them 2037",
       lA.length > 0 && lA.length === lB.length && lA[0].slice(0, 4) === "2037" && lA.every((r, i) => r.slice(0, 4) === lB[i].slice(0, 4)), `${lA.length} vs ${lB.length}`);
    ck("WITHDRAWAL (v620\u2192v621): \u2026and the masked rows DIFFER, 2037's among them \u2014 the car rows reached Engine D (a v6.21 that never charges them fails here)",
       lA.join("|") !== lB.join("|") && lA[0] !== lB[0], (lA[0] || "").slice(0, 60) + " / " + (lB[0] || "").slice(0, 60));
  }
  // v6.23 (D-49 — docs/SCOPE_D49_WORK_TAPER_V623.md, DC-4 (a)): the Withdrawal tab's Step 1 told every plan, single ones included, that it
  // takes "Spouse B work income"; from v6.23 it reads "other income (income streams)", and on the example "other income (income streams and
  // the example's built-in work)". The note under the table names the example's built-in work in the Work column too. On the example no
  // figure moves (the built-in work is still its own; t86 §B, every engine bit for bit). For THIS pair only, Step 1's income clause and the
  // note's added clause are masked — each must bite exactly once a side (the note's clause on v6.23 only) — and everything else is identical.
  // A single-pair gate on purpose: the next pair has the new sentence on both sides.
  const _p623 = VA === "v622" && (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))))));
  const _STEP1 = /Take Social Security \+ pension \+ (?:Spouse B work income|other income \(income streams and the example's built-in work\)) — guaranteed floor\./g;
  const _WNOTE = /, and the example household's built-in part-time work for spouse B(?=\) separately)/g;
  const _m623 = (s) => !_p623 ? s : s.replace(_STEP1, "Take Social Security + pension + # — guaranteed floor.").replace(_WNOTE, "");
  if (_p623) {
    const sA = A.withdrawal.match(_STEP1) || [], sB = B.withdrawal.match(_STEP1) || [];
    ck("WITHDRAWAL (v622\u2192v623): Step 1's mask bites exactly once a side — \"Spouse B work income\" on v6.22, the example's streams and built-in work on v6.23",
       sA.length === 1 && sB.length === 1 && /Spouse B work income/.test(sA[0]) && /income streams and the example's built-in work/.test(sB[0]), `${sA.join("|")} / ${sB.join("|")}`);
    const nA = A.withdrawal.match(_WNOTE) || [], nB = B.withdrawal.match(_WNOTE) || [];
    ck("WITHDRAWAL (v622\u2192v623): the Work-column note's added clause bites once on v6.23 and not on v6.22", nA.length === 0 && nB.length === 1, `${nA.length} / ${nB.length}`);
  }
  // v6.28 (F-23 — docs/SCOPE_F23_F24_DIRECTIVES_V628.md, DF-3 (a), V-3 to V-6, V-9): Section B's cards, the order of operations and Section C
  // are rewritten — they claimed a Traditional-then-Roth order, harvesting, a bracket fill, conversion tax and guardrails this schedule does not
  // have, and Section C carried ratings and a "Recommendation:". The header's subtitle names the sections. For THIS pair only, the subtitle and
  // the whole span from Section B to the footer caveat are masked — each must bite exactly once a side — and everything else, Section A's
  // schedule included, must be byte-identical: the witness that no figure of the schedule moved. A single-pair gate on purpose.
  const _p628 = VA === "v627" && (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635")));
  const _SUB628 = /Year-by-year operational schedule │ (?:Account priority sequencing │ Three-strategy comparison|The order it draws from │ What the schedule models)/g;
  const _SEC628 = /Section B — account priority sequencing[\s\S]*?(?=Schedule is deterministic \(single path\))/g;
  const _m628 = (s) => !_p628 ? s : s.replace(_SUB628, "#SUB").replace(_SEC628, "#SECTIONS-B-C ");
  if (_p628) {
    const cnt = (w, re) => (w.match(re) || []).length;
    ck("WITHDRAWAL (v627\u2192v628): the subtitle and the Section B–C span each bite exactly once a side",
       cnt(A.withdrawal, _SUB628) === 1 && cnt(B.withdrawal, _SUB628) === 1 && cnt(A.withdrawal, _SEC628) === 1 && cnt(B.withdrawal, _SEC628) === 1,
       `${cnt(A.withdrawal, _SUB628)}/${cnt(B.withdrawal, _SUB628)} · ${cnt(A.withdrawal, _SEC628)}/${cnt(B.withdrawal, _SEC628)}`);
    ck("WITHDRAWAL (v627\u2192v628): the masked span did change — v6.27 carries Step 7's instruction and the \"Recommendation:\", v6.28 neither, and its own Section C",
       /Execute planned Roth conversion/.test(A.withdrawal) && /Recommendation:/.test(A.withdrawal) && !/Execute planned Roth conversion|Recommendation:/.test(B.withdrawal)
       && /Section C — what this schedule models/.test(B.withdrawal));
  }
  // v6.29 (F-25 — docs/SCOPE_F25_MODEL_CLAIMS_V629.md, V-2 and the Withdrawal-tab copy items): the header chip says which run the success rate
  // is ("(6 YRS)" — it is the 6-year Monte Carlo's, not the planned path's), the RMD clause names each person's own RMD age on a couple, and the
  // Tax line and Step 6 say the Taxes tab computes from this schedule's spending draws and gains with its own RMD and conversion figures. For
  // THIS pair only, each changed phrase is masked by a pair of patterns (old on v6.28, new on v6.29) that must each bite exactly once on its own
  // side and not at all on the other — and everything else, Section A's schedule included, must be byte-identical. A single-pair gate on purpose.
  const _p629 = VA === "v628" && (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"));
  const _MK629 = [
    ["header chip", /@ END · PLANNED PATH \(NO LTC\/MORTALITY SHOCK\)/g, /@ END \(6 YRS\) · NO LTC\/MORTALITY SHOCK/g],
    ["RMD clause", /starting at RMD age \(\d+ — SECURE 2\.0\)\./g, /starting at each person's own RMD age \([^()]*— SECURE 2\.0\)\./g],
    ["Tax line", /The Taxes tab computes it from these draws\./g, /The Taxes tab computes it from this schedule's spending draws and gains, with its own RMD and conversion figures\./g],
    ["Step 6", /the Taxes tab computes it from these draws\./g, /the Taxes tab computes it from this schedule's spending draws and gains, with its own RMD and conversion figures\./g],
  ];
  const _m629a = (s) => !_p629 ? s : _MK629.reduce((t, [k, a]) => t.replace(a, `#629-${k}`), s);
  const _m629b = (s) => !_p629 ? s : _MK629.reduce((t, [k, , b]) => t.replace(b, `#629-${k}`), s);
  if (_p629) {
    const cnt = (w, re) => (w.match(re) || []).length;
    for (const [k, a, b] of _MK629)
      ck(`WITHDRAWAL (v628\u2192v629): the ${k} mask bites exactly once a side — the old wording on v6.28 only, the new on v6.29 only`,
         cnt(A.withdrawal, a) === 1 && cnt(B.withdrawal, b) === 1 && cnt(A.withdrawal, b) === 0 && cnt(B.withdrawal, a) === 0,
         `${cnt(A.withdrawal, a)}/${cnt(B.withdrawal, b)} · cross ${cnt(A.withdrawal, b)}/${cnt(B.withdrawal, a)}`);
  }
  // v6.35 (D-44 — docs/SCOPE_D62_D65_D44_V635.md, DE-3 (a)): a one-time row dated before retirement now comes out of the schedule's start, and
  // the tab says so in two places — the spend-source clause (it said such a row "is not in this schedule") and the Starting balance (now
  // "today", with a clause naming those rows only when there are any). For THIS pair only, each changed phrase is masked by a pair of patterns
  // (old on v6.34, new on v6.35) that must each bite exactly once on its own side and not at all on the other; the masks KEEP the year and the
  // starting-balance figure, so a moved figure still fails. The example at its planned year has no such row, so the naming clause must be
  // absent and everything else, Section A's schedule included, must be byte-identical. A single-pair gate on purpose.
  const _p635 = VA === "v634" && VB === "v635";
  const _MK635 = [
    ["one-time clause", /a one-time row dated before (\d{4}) is not in this schedule\./g,
      /a one-time row dated before (\d{4}) is paid from your savings before it: the schedule starts from today's holdings less those rows, after-tax money first, with no tax on anything taken from your retirement accounts \(from v6\.35; before, such a row was not charged at all\)\./g],
    ["starting balance", /Starting balance: (\$\d+K)\./g, /Starting balance: (\$\d+K) today\./g],
  ];
  const _m635a = (s) => !_p635 ? s : _MK635.reduce((t, [k, a]) => t.replace(a, (_, x) => `#635-${k} ${x}`), s);
  const _m635b = (s) => !_p635 ? s : _MK635.reduce((t, [k, , b]) => t.replace(b, (_, x) => `#635-${k} ${x}`), s);
  if (_p635) {
    const cnt = (w, re) => (w.match(re) || []).length;
    for (const [k, a, b] of _MK635)
      ck(`WITHDRAWAL (v634\u2192v635): the ${k} mask bites exactly once a side — the old wording on v6.34 only, the new on v6.35 only`,
         cnt(A.withdrawal, a) === 1 && cnt(B.withdrawal, b) === 1 && cnt(A.withdrawal, b) === 0 && cnt(B.withdrawal, a) === 0,
         `${cnt(A.withdrawal, a)}/${cnt(B.withdrawal, b)} · cross ${cnt(A.withdrawal, b)}/${cnt(B.withdrawal, a)}`);
    ck("WITHDRAWAL (v634\u2192v635): the example at its planned year has no one-time row before retirement — the naming clause is absent on both sides",
       !/of one-time expenses dated before/.test(A.withdrawal) && !/of one-time expenses dated before/.test(B.withdrawal));
  }
  // v6.30 (D-60 — docs/SCOPE_D60_DOLLAR_UNITS_V630.md, DU-1 (a)): ONE inflation clock — Engine D now prices its schedule from the as-of year,
  // as the Monte Carlo does, so for THIS pair the schedule moves BY DESIGN and identity is false. Bounded instead, as C-8 was: the same year
  // rows render, the tab differs, every Expenses cell is v6.29's × (1+i)^(retirement − as-of) to the $K rounding of the two sides (i the
  // rendered plan's own inflation, the same on both legs), and the units sentence is on v6.30 only. A single-pair gate on purpose.
  const _p630 = VA === "v629" && (VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"));
  if (_p630) {
    const rowRe = /(20\d\d)(\d{2})\/(\d{2})\$(\d+)K(?:\u2014|\$\d+K)\$(\d+)K/g, rowsW = t => { const o = []; let m; rowRe.lastIndex = 0; while ((m = rowRe.exec(t)) !== null) o.push({ yr: +m[1], exp: +m[5] }); return o; };
    const ra = rowsW(A.schedule || ""), rb = rowsW(B.schedule || ""), RB = Math.pow(1 + B.units.i, B.units.R - B.units.asOf);
    ck("WITHDRAWAL (v629\u2192v630): both legs render the plan on the same inflation and clock inputs", A.units.i === B.units.i && A.units.asOf === B.units.asOf && A.units.R === B.units.R, JSON.stringify([A.units, B.units]));
    ck("WITHDRAWAL (v629\u2192v630): the same year rows render on both legs", ra.length > 10 && ra.map(r => r.yr).join() === rb.map(r => r.yr).join(), `${ra.length} vs ${rb.length}`);
    const off = ra.filter((r, k) => !rb[k] || Math.abs(rb[k].exp - r.exp * RB) > 1.5);
    ck(`WITHDRAWAL (v629\u2192v630): every Expenses cell is v6.29's × ${RB.toFixed(5)} — (1+i)^(${B.units.R} − ${B.units.asOf}) — to the $K rounding (a v6.30 still on the retirement clock fails here)`,
      off.length === 0, off.slice(0, 3).map(r => `${r.yr}: ${r.exp}K`).join(", "));
    ck("WITHDRAWAL (v629\u2192v630): the tab differs (the schedule moved)", stripV(A.withdrawal) !== stripV(B.withdrawal));
    const US = "Every figure is in that year's own dollars: the schedule starts from today's balances carried to";
    ck("WITHDRAWAL (v629\u2192v630): the units sentence is on v6.30 once and absent on v6.29", B.withdrawal.split(US).length === 2 && !A.withdrawal.includes(US));
  } else {
  const wA = stripV(_m635a(_m629a(_m628(_m623(_m621(_m620(_m619(_m618(_n615(_m612(_n610(A.withdrawal)))))))))))), wB = stripV(_m635b(_m629b(_m628(_m623(_m621(_m620(_m619(_m618(_n618(_n615(_m612(_n612(_n610(_n609(_n608(_n579(B.withdrawal)))))))))))))))));
  ck("WITHDRAWAL: the tab is byte-identical across the pair (v5.40 is disclosure + mechanics; no rendered cell moves \u2014 measured)",
     wA === wB, firstDiff(wA, wB));
  }
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
  // v6.23 (D-49, DC-4 (a)): the detail panel's earned-income line was named for spouse B whoever earned it ("Spouse B earned income"); from
  // v6.23 it reads "Earned income (job rows)", and on the example "Earned income (job rows and the example's built-in work)". For THIS pair
  // only, that label is masked on BOTH sides (exactly once a side, the old label on v6.22 and the new on v6.23); its figure is not masked,
  // and every figure must still be identical — the example's wages are its own at both builds.
  const _p623t = VA === "v622" && (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))))));
  const _EARN = /Spouse B earned income|Earned income \(job rows and the example's built-in work\)/g;
  // v6.33 (F-28): the detail panel's bracket-by-bracket drawing reads the selected year's own table and filing status (through v6.32 the
  // 2026 table at the plan's LAST year's status), so for THIS pair only the panel — from its heading to the region's end — is masked on both
  // sides, every year-table figure before it must still be identical (D-67 moves nothing for the example, dated 2026), and the panel must
  // DIFFER (a v6.33 still drawing Single bounds on a joint year renders v6.32's panel and fails). t96 F-1/F-2 pin the panel's content.
  const _p633t = VA === "v632" && (VB === "v633" || VB === "v634" || VB === "v635");
  const _PANEL = /NET TAXABLE INCOME BY FEDERAL BRACKET — [\s\S]*$/;
  if (_p633t) {
    const pA = (figA.match(_PANEL) || [""])[0], pB = (figB.match(_PANEL) || [""])[0];
    ck("TAXES (v632\u2192v633): both legs render the bracket panel, and it DIFFERS — the selected year's own table and status (F-28)", pA.length > 0 && pB.length > 0 && pA !== pB, `${pA.slice(0, 80)} / ${pB.slice(0, 80)}`);
  }
  const mfig = (x) => { if (_p633t) x = x.replace(_PANEL, "#bracket panel#"); return !_p623t ? x : x.replace(_EARN, "#earned income#"); };
  if (_p623t) {
    const eA = figA.match(_EARN) || [], eB = figB.match(_EARN) || [];
    ck("TAXES (v622\u2192v623): the earned-income label's mask bites exactly once a side — spouse B's on v6.22, the example's built-in work on v6.23",
       eA.length === 1 && eB.length === 1 && eA[0] === "Spouse B earned income" && eB[0] === "Earned income (job rows and the example's built-in work)", `${eA.join("|")} / ${eB.join("|")}`);
  }
  // v5.37 FLIP: at the v535\u2192v536 pair this asserted the figures DIFFER (the wiring landing).
  // At v536\u2192v537 Engine B's inputs are byte-identical by census, so the honest claim is
  // IDENTITY \u2014 and it still witnesses the wiring: kill the call site on either leg and that
  // leg's figures lose the gains, desynchronize from the other's, and fail here.
  // v5.47 follows the ENGINE_C_CHANGED precedent below: when a release legitimately moves an
  // engine's figures, the honest treatment is a BOUNDED intended-difference branch, not a
  // suppressed check and not a softened one. Item 5 held the HSA out of the dividend base in
  // Engines A, B and C, so the Taxes table's MAGI column moves by design at this pair.
  const ENGINE_B_CHANGED = (VA === "v546" && VB === "v547");
  // v5.74 (C-8) joins the precedent at v573\u2192v574: Engines B and C now consume Engine D's spending draws, so the
  // Taxes and IRMAA year tables move BY DESIGN. Identity is false for this pair and a softened check is not the
  // answer. The bound kept is the one identity existed for: an UNWIRED v5.74 call site renders v5.73's table
  // byte-for-byte, so "the figures DIFFER" still fails on a dead call site. Dollar-level bounds are pinned to the
  // dollar in t40 (A\u2013E), not re-derived from rounded DOM text.
  // \u26a0 The bound is ROWS, not a count of $-figures. Measured 2026-09-21: v5.74 renders more $-figures than
  // v5.73 \u2014 cells that were exactly $0 ("\u2014") now carry a sub-$1K amount, and the detail panel gains lines
  // \u2014 so "same number of figures" is false about the model. What the draws cannot change is the rows.
  const C8_PAIR = (VA === "v573" && VB === "v574");
  // v6.07 (D-33 — docs/SCOPE_D33_ANNUITY_CONVERSION_V607.md) joins the precedent at v606→v607: Engines B and C carry the example
  // household's $7,000 annuity, so no RMD or conversion drains it and the RMD-bearing figures move BY DESIGN. Bounded as v5.47 was:
  // the table differs, the rows are the same, and the blast radius is pinned by the engine-measured size (t40: every lifetime move is
  // under $2,100; per year it is under $1K, so a rendered $K figure holds or steps exactly one $K).
  const D33_PAIR = (VA === "v606" && VB === "v607");
  // v6.18 (D-41): Engine B is fed Engine D's draws through the bridge, and those move with the year-by-year spending read — so the Taxes
  // year table differs BY DESIGN at v617→v618. Bounded as C-8 was: it differs (a v6.18 still on the snapshots renders v6.17's table and
  // fails), and the same year rows render on both legs. Dollar figures are pinned in t40 (both legs, and the v6.17 table run).
  // v6.21 (D-42): the car rows reach Engine B through Engine D's draws from 2037, so the Taxes year table differs BY DESIGN at v620→v621 —
  // and only from 2037. Bounded tighter than C-8: every row before 2037 is byte-identical, the same rows render, and 2037's row differs.
  // v6.30 (D-60): every row is in its own year's dollars on one clock, so the Taxes year table differs BY DESIGN at v629→v630 — bounded as
  // C-8 was: it differs (a v6.30 still in mixed units renders v6.29's table and fails) and the same year rows render. Dollar figures are
  // pinned against the independent federal oracle in t40 (to the cent, every row) and t93.
  if (VA === "v629" && (VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))) {
    const rowsOf = s => (s.match(/20[2-6]\d(?=\d{2}\/\d{2})/g) || []).join();
    ck("TAXES: both legs still render the year table", figA.length > 0 && figB.length > 0);
    ck("TAXES (v629\u2192v630): the figures DIFFER \u2014 each row now in its own year's dollars", figA !== figB);
    ck("TAXES (v629\u2192v630): the same year rows render on both legs \u2014 the units move values, never rows", rowsOf(figA).length > 0 && rowsOf(figA) === rowsOf(figB), `${rowsOf(figA).length} vs ${rowsOf(figB).length}`);
  } else if (VA === "v620" && (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))))))))) {
    const rows = s => s.split(/(?=20[2-9]\d\d{2}\/\d{2})/).filter(r => /^20[2-9]\d\d{2}\//.test(r));
    const rA = rows(figA), rB = rows(figB), early = rs => rs.filter(r => +r.slice(0, 4) < 2037).join("|"), y37 = rs => rs.find(r => r.startsWith("2037"));
    ck("TAXES: both legs still render the year table", figA.length > 0 && figB.length > 0);
    ck("TAXES (v620\u2192v621): the same year rows render on both legs", rA.length > 0 && rA.map(r => r.slice(0, 4)).join() === rB.map(r => r.slice(0, 4)).join(), `${rA.length} vs ${rB.length}`);
    ck("TAXES (v620\u2192v621): every row before 2037 is byte-identical \u2014 the car rows move nothing before the first car", early(rA).length > 0 && early(rA) === early(rB), firstDiff(early(rA), early(rB)));
    ck("TAXES (v620\u2192v621): 2037's row DIFFERS \u2014 the first car reaches Engine B through the draws (a v6.21 that never charges it fails here)", !!y37(rA) && y37(rA) !== y37(rB), `${(y37(rA) || "").slice(0, 50)} / ${(y37(rB) || "").slice(0, 50)}`);
  } else if (VA === "v617" && (VB === "v618" || (VB === "v619" || (VB === "v620" || (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635")))))))))))) {
    const rowsOf = s => (s.match(/20[2-6]\d(?=\d{2}\/\d{2})/g) || []).length;
    ck("TAXES: both legs still render the year table", figA.length > 0 && figB.length > 0);
    ck("TAXES (v617\u2192v618): the figures DIFFER \u2014 the year-by-year spending read reaches Engine B through the bridge", figA !== figB);
    ck("TAXES (v617\u2192v618): the same year rows render on both legs \u2014 the draws move values, never rows", rowsOf(figA) > 0 && rowsOf(figA) === rowsOf(figB), `${rowsOf(figA)} vs ${rowsOf(figB)}`);
  } else if (D33_PAIR) {
    const nA = (figA.match(/\$[\d,]+K?/g) || []), nB = (figB.match(/\$[\d,]+K?/g) || []);
    const val = t => Number(String(t).replace(/[$,K]/g, "")) * (String(t).endsWith("K") ? 1000 : 1);
    const rowsOf = s => (s.match(/20[2-6]\d(?=\d{2}\/\d{2})/g) || []).length;
    ck("TAXES: both legs still render the year table", figA.length > 0 && figB.length > 0);
    ck("TAXES (v606\u2192v607): the figures DIFFER \u2014 the annuity is no longer drained by RMDs or converted", figA !== figB);
    ck("TAXES (v606\u2192v607): the same year rows render on both legs", rowsOf(figA) > 0 && rowsOf(figA) === rowsOf(figB), `${rowsOf(figA)} vs ${rowsOf(figB)}`);
    const steps = nA.length === nB.length ? nA.map((t, i) => Math.abs(val(nB[i]) - val(t))).filter(d => d > 0) : [-1];
    ck("TAXES (v606\u2192v607): same SHAPE, and every moved figure moves exactly one $K step \u2014 a sub-$1K yearly change cannot do more",
       steps.length > 0 && steps.every(d => d === 1000), `${nA.length} vs ${nB.length}; steps ${[...new Set(steps)].join(",")}`);
  } else if (C8_PAIR) {
    const rowsOf = s => (s.match(/20[2-6]\d(?=\d{2}\/\d{2})/g) || []).length;       // "2029" + ages "65/63"
    ck("TAXES: both legs still render the year table", figA.length > 0 && figB.length > 0);
    ck("TAXES (v573\u2192v574): the figures DIFFER \u2014 the plan's spending draws now reach Engine B (a dead v5.74 call site renders v5.73's table and fails here)",
       figA !== figB);
    ck("TAXES (v573\u2192v574): the same year rows render on both legs \u2014 the draws move values, never rows",
       rowsOf(figA) > 0 && rowsOf(figA) === rowsOf(figB), `${rowsOf(figA)} vs ${rowsOf(figB)}`);
  } else if (!ENGINE_B_CHANGED) {
    ck("TAXES: the year-table FIGURES are IDENTICAL across the pair (v5.40 does not move Engine B\u2019s inputs; a dead call site on either leg fails this)",
       figA.length > 0 && mfig(figA) === mfig(figB), figA.length ? firstDiff(mfig(figA), mfig(figB)) : "region not found");
  } else {
    ck("TAXES: both legs still render the year table", figA.length > 0 && figB.length > 0);
    ck("TAXES (v546\u2192v547): the figures DIFFER \u2014 item 5 removes the HSA from the dividend base", figA !== figB);
    const nA = (figA.match(/\$[\d,]+K?/g) || []), nB = (figB.match(/\$[\d,]+K?/g) || []);
    const val = t => Number(String(t).replace(/[$,K]/g, "")) * (String(t).endsWith("K") ? 1000 : 1);
    ck("TAXES (v546\u2192v547): same SHAPE \u2014 same number of figures, only their values move",
       nA.length === nB.length, `${nA.length} vs ${nB.length}`);
    // The blast radius. Every rendered figure here is Math.round(x/1000), and item 5 is worth
    // $300/yr (or $555 inside the \u00a786 phase-in), so a move can only ever be ONE $K step. A
    // larger step means the change reached past the dividend base.
    const steps = nA.map((t, i) => Math.abs(val(nB[i]) - val(t))).filter(d => d > 0);
    ck("TAXES (v546\u2192v547): every moved figure moves exactly one $K step \u2014 a sub-$1K input cannot do more",
       steps.length > 0 && steps.every(d => d === 1000), `steps ${[...new Set(steps)].join(",")}`);
    // Every $-figure in this table is an income or tax amount, so removing income can only hold
    // or lower them. (Unlike the IRMAA table, there is no headroom column here to move the other
    // way \u2014 which is why an all-downward claim is sound here and was NOT sound there.)
    ck("TAXES (v546\u2192v547): no $ figure RISES \u2014 removing income cannot raise income or tax",
       nA.every((t, i) => val(nB[i]) <= val(t)),
       nA.filter((t, i) => val(nB[i]) > val(t)).join(", "));
  }
  // The v5.36 copy now rides on BOTH legs \u2014 the prior-leg $0-default branch is retired with v5.35.
  for (const [V, t] of [[VA, A.taxes], [VB, B.taxes]]) {
    ck(`${V} taxes: footnote names the gains' source (the Withdrawal plan's sales)`,
       t.includes("Realized capital gains are the Withdrawal plan's own sales"));
    ck(`${V} taxes: the footnote says provisional income counts realized gains (E-16)`,
       t.includes("realized capital gains count toward it, as the statute requires"));
    ck(`${V} EXTINCTION: the '$0 unless a sale is modeled' claim is gone`,
       !t.includes("default to $0 unless a sale is modeled"));
  }
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
  // ⚠ END ANCHOR IS THE FIRST PROSE TOKEN, NOT THE FOOTNOTE. It read "Not tax advice" until
  // 2026-08-20, which sits AFTER the explainer and the CMS/MAGI footnote — so ~1,070 chars of
  // disclosure copy rode inside a check whose name says FIGURES, and the v5.40 MAGI-sentence
  // fix failed it. Anchored here the region is the year table and nothing else.
  const magA = region2(iA, "Tax YrAffectsMAGI", '"Affects" = the calendar year', `${VA} irmaa MAGI-table`);
  const magB = region2(iB, "Tax YrAffectsMAGI", '"Affects" = the calendar year', `${VB} irmaa MAGI-table`);
  // v5.37 FLIP \u2014 same reasoning as the Taxes section: identity is the strongest true claim
  // for this pair, and a dead Engine C call site on either leg fails it. Still true at v5.40:
  // that release changed the SENTENCE describing MAGI, not the MAGI arithmetic.
  // ⚠ GATED BY PAIR at v5.43 (OPERATIONS §B2). Identity was the strongest TRUE claim for every
  // pair up to v5.42, because no release in that span touched Engine C's arithmetic. **v5.43 does**
  // — it replaces the flat 85%-of-benefits rule with §86 — so identity became FALSE for this pair
  // by design, and asserting it would have turned an intended difference into a red suite. The
  // rule is the same one applied to the S-1 disclosure check below: assert what is true for the
  // pair in hand, and name the intended difference rather than suppressing the check.
  // v5.47 joins v5.43 here: item 5 moves Engine C's dividend term, so the MAGI column differs by
  // design at the v546\u2192v547 pair too. Bounded below rather than suppressed.
  const ENGINE_C_CHANGED = (VA === "v542" && VB === "v543") || (VA === "v546" && VB === "v547");
  // v5.74 (C-8, decision D-6): Engine C takes the same draw series in the same release \u2014 see the Taxes note above.
  const C8_PAIR_I = (VA === "v573" && VB === "v574");
  // v6.07 (D-33): see the Taxes note above. MAGI falls where an RMD falls and headroom rises by the same amount, so no direction is
  // asserted (the v5.43 lesson); the blast radius is: same shape, every moved figure one $K step.
  // v6.18 (D-41): see the Taxes note above — Engine C takes the same bridge, so its MAGI table differs by design at v617→v618; no
  // direction is asserted (the draws rise in some years and fall in others).
  // v6.21 (D-42): see the Taxes note above — Engine C takes the same draws; rows open with the tax year then the premium year ("2037" "2039 prem").
  // v6.30 (D-60): see the Taxes note above — Engine C states each year in its own dollars, so its MAGI table differs by design; no direction.
  if (VA === "v629" && (VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))) {
    const rows = s => (s.match(/20[2-9]\d(?=20[2-9]\d prem|pre-MC)/g) || []).join();
    ck("IRMAA: both legs still render the MAGI table", magA.length > 0 && magB.length > 0);
    ck("IRMAA (v629\u2192v630): the MAGI figures DIFFER \u2014 each row now in its own year's dollars", magA !== magB);
    ck("IRMAA (v629\u2192v630): the same year rows render on both legs", rows(magA).length > 0 && rows(magA) === rows(magB), `${rows(magA).length} vs ${rows(magB).length}`);
  } else if (VA === "v620" && (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635"))))))))) {
    const rows = s => s.split(/(?=20[2-9]\d20[2-9]\d prem)/).filter(r => /^20[2-9]\d20[2-9]\d prem/.test(r));
    const rA = rows(magA), rB = rows(magB), early = rs => rs.filter(r => +r.slice(0, 4) < 2037).join("|"), y37 = rs => rs.find(r => r.startsWith("2037"));
    ck("IRMAA: both legs still render the MAGI table", magA.length > 0 && magB.length > 0);
    ck("IRMAA (v620\u2192v621): the same year rows render on both legs", rA.length > 0 && rA.map(r => r.slice(0, 4)).join() === rB.map(r => r.slice(0, 4)).join(), `${rA.length} vs ${rB.length}`);
    ck("IRMAA (v620\u2192v621): every row before 2037 is byte-identical \u2014 the car rows move nothing before the first car", early(rA).length > 0 && early(rA) === early(rB), firstDiff(early(rA), early(rB)));
    ck("IRMAA (v620\u2192v621): 2037's row DIFFERS \u2014 the first car reaches Engine C through the draws", !!y37(rA) && y37(rA) !== y37(rB), `${(y37(rA) || "").slice(0, 50)} / ${(y37(rB) || "").slice(0, 50)}`);
  } else if (VA === "v617" && (VB === "v618" || (VB === "v619" || (VB === "v620" || (VB === "v621" || (VB === "v622" || (VB === "v623" || (VB === "v624" || (VB === "v625" || VB === "v626" || VB === "v627" || (VB === "v628" || (VB === "v629" || VB === "v630" || (VB === "v631" || VB === "v632" || VB === "v633" || VB === "v634" || VB === "v635")))))))))))) {
    ck("IRMAA: both legs still render the MAGI table", magA.length > 0 && magB.length > 0);
    ck("IRMAA (v617\u2192v618): the MAGI figures DIFFER \u2014 the year-by-year spending read reaches Engine C through the bridge", magA !== magB);
    const cA = (magA.match(/\$[\d,]+K?/g) || []).length, cB = (magB.match(/\$[\d,]+K?/g) || []).length;
    ck("IRMAA (v617\u2192v618): same SHAPE \u2014 the same number of figures", cA > 0 && cA === cB, `${cA} vs ${cB}`);
  } else if (VA === "v606" && VB === "v607") {
    const numsA = (magA.match(/\$[\d,]+K?/g) || []), numsB = (magB.match(/\$[\d,]+K?/g) || []);
    const val = t => Number(String(t).replace(/[$,K]/g, "")) * (String(t).endsWith("K") ? 1000 : 1);
    ck("IRMAA: both legs still render the MAGI table", magA.length > 0 && magB.length > 0);
    ck("IRMAA (v606\u2192v607): the MAGI figures DIFFER \u2014 Engine C carries the annuity dollars", magA !== magB);
    const moves = numsA.length === numsB.length ? numsA.map((t, i) => Math.abs(val(numsB[i]) - val(t))).filter(d => d > 0) : [-1];
    ck("IRMAA (v606\u2192v607): same SHAPE, and every moved figure moves exactly one $K step",
       moves.length > 0 && moves.every(d => d === 1000), `${numsA.length} vs ${numsB.length}; steps ${[...new Set(moves)].join(",")}`);
  } else if (C8_PAIR_I) {
    ck("IRMAA: both legs still render the MAGI table", magA.length > 0 && magB.length > 0);
    ck("IRMAA (v573\u2192v574): the MAGI figures DIFFER \u2014 the spending draws now reach Engine C (a dead v5.74 call site renders v5.73's table and fails here)",
       magA !== magB);
    const cA = (magA.match(/\$[\d,]+K?/g) || []).length, cB = (magB.match(/\$[\d,]+K?/g) || []).length;
    ck("IRMAA (v573\u2192v574): same SHAPE \u2014 same number of figures (measured: this table has no exact-zero cells to fill)",
       cA > 0 && cA === cB, `${cA} vs ${cB}`);
  } else if (!ENGINE_C_CHANGED) {
    ck("IRMAA: the MAGI-table FIGURES are IDENTICAL across the pair (no release in this span touches Engine C's arithmetic \u2014 a dead call site on either leg fails this)",
       magA.length > 0 && magA === magB, magA.length ? firstDiff(magA, magB) : "region not found");
  } else {
    // INTENDED DIFFERENCE, bounded rather than waved through: the table must still render on both
    // legs, must differ, and must differ ONLY downward \u2014 §86 can never raise includible benefits
    // above the flat 85% rule, so an increase anywhere means the fix reached past its scope.
    ck("IRMAA: both legs still render the MAGI table", magA.length > 0 && magB.length > 0);
    ck(`IRMAA (${VA}\u2192${VB}): the MAGI figures DIFFER \u2014 this release changes Engine C's inputs`, magA !== magB);
    const numsA = (magA.match(/\$[\d,]+K?/g) || []), numsB = (magB.match(/\$[\d,]+K?/g) || []);
    const val = t => Number(String(t).replace(/[$,K]/g, "")) * (String(t).endsWith("K") ? 1000 : 1);
    ck("IRMAA (v542\u2192v543): the table has the same SHAPE \u2014 same number of figures, only their values move",
       numsA.length === numsB.length, `${numsA.length} vs ${numsB.length}`);
    // ⚠ NOT "every figure moves down". The rendered table carries MAGI **and** headroom, and
    // headroom = threshold \u2212 MAGI, so when MAGI falls headroom RISES by the same amount. An
    // all-downward assertion is wrong about the model and went red on the correct build \u2014 the
    // check was wrong, not the code. What is actually invariant is the blast radius: exactly the
    // three affected years move, on both columns, and no move exceeds the largest engine-measured
    // delta ($8,256, pinned to the dollar in t25 \u00a7B).
    const moves = numsA.map((t, i) => Math.abs(val(numsB[i]) - val(t))).filter(d => d > 0);
    if (VB === "v543") {
      ck("IRMAA (v542\u2192v543): exactly 6 figures move \u2014 3 years \u00d7 (MAGI + headroom)",
         moves.length === 6, `${moves.length} moved`);
      ck("IRMAA (v542\u2192v543): no figure moves by more than $9,000 (t25 pins the largest at $8,256)",
         moves.every(d => d <= 9000), moves.filter(d => d > 9000).join(", "));
    } else {
      // v5.47's blast radius is the OPPOSITE shape from v5.43's and that is the point of pinning
      // it. v5.43 moved three years by up to $8,256; item 5 moves EVERY year, by $300 (or $555
      // inside the \u00a786 phase-in) \u2014 sub-$1K inputs seen through Math.round(x/1000), so any
      // individual figure either holds or steps exactly one $K. A two-step move here means the
      // change reached past the dividend base.
      ck("IRMAA (v546\u2192v547): every moved figure moves exactly one $K step \u2014 a sub-$1K input cannot do more",
         moves.length > 0 && moves.every(d => d === 1000), `distinct steps ${[...new Set(moves)].join(",")}`);
      ck("IRMAA (v546\u2192v547): the move is BROAD, not local \u2014 item 5 touches every year, unlike v5.43's three",
         moves.length > 6, `${moves.length} figures moved`);
    }
  }
  // The v5.40 S-1 fix, witnessed per leg.
  // GATED PER LEG (OPERATIONS §B2) at v5.42. This was written for the v5.39→v5.40 pair and
  // was left PAIR-SPECIFIC with a note to re-point it. It was not re-pointed, so as the pair
  // rolled forward it kept asserting that the OLD leg carries the PRE-v5.40 sentence — false
  // for every prior leg from v5.40 onward, and it went red at the v5.42 pair with no code
  // change. The fix is the §B2 one: assert the copy that was true for each leg's own build,
  // rather than assuming the old leg predates the change.
  const PRE_S1 = v => ["v510", "v5101", "v5102", "v592"].includes(v) ||
    (/^v5(\d\d)$/.test(v) && Number(RegExp.$1) <= 39);
  if (PRE_S1(VA)) {
    ck(`${VA} irmaa: carries the PRE-v5.40 MAGI sentence (the narrow component list)`,
       /MAGI here uses the simplified 85%-of-SS assumption plus pension, earned income, RMDs, and conversions/.test(A.irmaa));
  } else {
    ck(`${VA} irmaa: carries the v5.40 MAGI sentence (this leg post-dates the S-1 fix)`,
       /MAGI here is the model's own projected income for the year/.test(A.irmaa));
  }
  ck(`${VB} irmaa: carries the v5.40 MAGI sentence, naming dividends and realized gains (S-1)`,
     /MAGI here is the model's own projected income for the year/.test(B.irmaa) &&
     /including dividends and realized capital gains/.test(B.irmaa));
  ck(`${VB} EXTINCTION: the narrow pre-v5.40 MAGI component list is gone`,
     !/plus pension, earned income, RMDs, and conversions/.test(B.irmaa));
  ck(`${VA} irmaa: the tab still renders its cliff framing`, /cliff/i.test(A.irmaa));
  ck(`${VB} irmaa: the tab still renders its cliff framing`, /cliff/i.test(B.irmaa));
}

console.log(`\nDOM DIFF: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
