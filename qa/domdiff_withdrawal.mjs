// Cross-version DOM comparison of the TAX-BEARING TABS (Engine D's Withdrawal tab, Engine B's
// Taxes tab, Engine C's IRMAA tab). Default pair v539 -> v540.
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

const [VA, VB] = [process.argv[2] || "v539", process.argv[3] || "v540"];

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
  ck("WITHDRAWAL: the tab is byte-identical across the pair (v5.40 is disclosure + mechanics; no rendered cell moves \u2014 measured)",
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
  // v5.37 FLIP: at the v535\u2192v536 pair this asserted the figures DIFFER (the wiring landing).
  // At v536\u2192v537 Engine B's inputs are byte-identical by census, so the honest claim is
  // IDENTITY \u2014 and it still witnesses the wiring: kill the call site on either leg and that
  // leg's figures lose the gains, desynchronize from the other's, and fail here.
  ck("TAXES: the year-table FIGURES are IDENTICAL across the pair (v5.40 does not move Engine B\u2019s inputs; a dead call site on either leg fails this)",
     figA.length > 0 && figA === figB, figA.length ? firstDiff(figA, figB) : "region not found");
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
  const ENGINE_C_CHANGED = (VA === "v542" && VB === "v543");
  if (!ENGINE_C_CHANGED) {
    ck("IRMAA: the MAGI-table FIGURES are IDENTICAL across the pair (no release in this span touches Engine C's arithmetic \u2014 a dead call site on either leg fails this)",
       magA.length > 0 && magA === magB, magA.length ? firstDiff(magA, magB) : "region not found");
  } else {
    // INTENDED DIFFERENCE, bounded rather than waved through: the table must still render on both
    // legs, must differ, and must differ ONLY downward \u2014 §86 can never raise includible benefits
    // above the flat 85% rule, so an increase anywhere means the fix reached past its scope.
    ck("IRMAA: both legs still render the MAGI table", magA.length > 0 && magB.length > 0);
    ck("IRMAA (v542\u2192v543): the MAGI figures DIFFER \u2014 this release changes Engine C's \u00a786 arithmetic", magA !== magB);
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
    ck("IRMAA (v542\u2192v543): exactly 6 figures move \u2014 3 years \u00d7 (MAGI + headroom)",
       moves.length === 6, `${moves.length} moved`);
    ck("IRMAA (v542\u2192v543): no figure moves by more than $9,000 (t25 pins the largest at $8,256)",
       moves.every(d => d <= 9000), moves.filter(d => d > 9000).join(", "));
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
