// t28 — ROTH TAB: spouse B's Social Security is gated by B's CLAIM DATE (v5.46 extinction invariants)
// Run: node t28_ssB_claim_gate.mjs v546  |  node t28_ssB_claim_gate.mjs v545  |  ... v544
//
// THE DEFECT THIS EXISTS FOR. Through v5.45 the conversion ladder read, as one expression:
//     const spouseBSS = _rsSsB * 12;
// B's benefit was added to `totalSS` for EVERY ladder year regardless of when B actually
// claimed. Spouse A's term four lines below was gated by A's claim date and is the shape this
// release mirrors. The consequence is phantom Social Security in B's pre-claim years, which
// inflates provisional income, taxable SS under §86, MAGI, tax and the marginal rate.
//
// WHY A FIXTURE IS THE RELEASE. On the EXAMPLE household B claims in **January 2029** and the
// ladder starts in 2029, so B is already claiming in every ladder year AND the claim-year
// partial-month branch is a full twelve months. The defect is worth exactly $0 there, in every
// year, at every slider position. **Assertions on the example household prove nothing about
// this defect** — they are carried in §C for the opposite purpose: to prove the fix did not
// reach a household it must not touch.
//
// THE TWO FIXTURES, AND WHY THERE ARE TWO.
//   FIXTURE 1 — B delays to 70 (claim January 2036), ladder 2029-2040. Seven pre-claim years.
//   FIXTURE 2 — the same, but B's DOB month is July, so the claim lands mid-year. This exists
//     because FIXTURE 1 CANNOT TEST THE CHOSEN BEHAVIOUR: with a January claim, a partial-month
//     gate and a whole-year gate produce identical figures, so the release's actual modelling
//     decision (D-2a: B mirrors A's partial-month credit) would ship unverified. In 2036 the
//     three candidate behaviours separate cleanly — partial-month $119,935, whole-year
//     $131,410, no-claim-year-credit $108,460 — and §B asserts all three, not just the one
//     that is right, so a regression toward either wrong branch is caught by name.
//
// THE ORACLE. Expectations are NOT hardcoded. The ladder recursion below is the transcription
// t24 introduced and its `ss` term now carries B's gate; §86 comes from `statute86` in
// `hand_86.mjs`, transcribed from the statutory text and not from any app expression. The
// transcription was validated before the fix was written: driven UNGATED it reproduces the
// pre-fix rendered figures on the example household AND on both fixtures, to the rendered
// rounding. That is what makes the gated expectations trustworthy rather than a restatement of
// whatever the new code happens to do.
//
// PRECISION (OPERATIONS §M). The ladder is component-inline: its only output path is the
// rendered DOM, and MAGI renders as `Math.round(x / 1000)` + "K" — a ±$500 ceiling. The effect
// measured here is $11,475-$22,950 per year, which clears that ceiling by 23x-45x.
//
// GATED PER LEG (OPERATIONS §B2). v5.45 and earlier legitimately contain the ungated term; each
// leg asserts what was true for its own build, so the prior legs are dated [KNOWN DEFECT] pins
// (OPERATIONS §D) and the before/after witness for this release.
import { createRequire } from "module";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
// TRAP (OPERATIONS §C): seed Math.random BEFORE importing the bundle.
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v546";
const KNOWN_VERSIONS = ["v544", "v545", "v546", "v547", "v548", "v549", "v550", "v551", "v552", "v553", "v554", "v555", "v556"];
// The dividend term the ladder carries from v5.53, read from the app's own accessors rather than
// hardcoded so it tracks the example household instead of freezing a figure into the model.
const _appD = (await import(`./app_${VER}.mjs`)).__g;
const _tlD = typeof _appD.PLAN_TIMELINE === "function" ? _appD.PLAN_TIMELINE() : _appD.PLAN_TIMELINE;
const DIV = (VER === "v553" || VER === "v554" || VER === "v555" || VER === "v556")
  ? Math.round(Math.max(0, _appD.taxableInitAll()
      - (_appD.retireStartBalances(_tlD.rothLadderStart).othHsa || 0)) * (2.0 / 100))
  : 0;
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST_FIX = VER === "v546" || VER === "v547" || (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552" || VER === "v553" || VER === "v554" || VER === "v555" || VER === "v556");

// The repo keeps the oracle at qa/tools/hand_86.mjs; PROJECT KNOWLEDGE IS FLAT and holds it
// beside the suites. Resolve rather than assume, and say which copy was used (the t21/t24
// pattern), so a stale duplicate is visible instead of silent.
const ORACLE_CANDIDATES = [join(HERE, "hand_86.mjs"), join(HERE, "tools", "hand_86.mjs")];
const ORACLE = ORACLE_CANDIDATES.find(p => existsSync(p));
if (!ORACLE) {
  console.log("t28 SUITE: 0 passed, 1 failed\n  \u2717 \u00a786 oracle not found. Looked in:\n" +
    ORACLE_CANDIDATES.map(c => "      " + c).join("\n"));
  process.exit(1);
}
const { statute86 } = await import(pathToFileURL(ORACLE).href);

let pass = 0, fail = 0;
const T = (name, ok, detail = "") => {
  if (ok) { pass++; } else { fail++; console.log(`  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`); }
};

// ── the ladder recursion (t24's transcription; the `ss` term now carries B's gate) ────────
const G = 0.045, ULT = { 75: 24.6, 76: 23.7 };
const A0 = 1180000, B0 = 218600, PEN = 4800;
const SSA = 39600, SSA_YR = 2031, SSA_MO = 1;             // spouse A, example household
const dobA = 1964, dobB = 1966, START = 2029, END = 2040, endA = 2038, endB = 2040;
const taper = y => (y === 2029 ? 20000 : y === 2030 ? 18000 : y === 2031 ? 15000 : 0);
const partialMonths = m => Math.max(0, 12 - m + 1);       // the app's own formula, mirrored

function ladder(rothAmount, ssTerm) {
  let a = A0, b = B0; const out = [];
  for (let y = START; y <= END; y++) {
    const ageA = y - dobA, ageB = y - dobB;
    const rA = ageA >= 75 ? a / (ULT[ageA] || 6.4) : 0;   // prior 31 Dec basis (Pub. 590-B)
    const rB = ageB >= 75 ? b / (ULT[ageB] || 6.4) : 0;
    const rmd = Math.round(rA + rB);
    const gA = a * (1 + G), gB = b * (1 + G);
    const capA = Math.max(0, (y <= endA ? gA : 0) - rA);
    const capB = Math.max(0, (y <= endB ? gB : 0) - rB);
    const conv = Math.min(rothAmount, capA + capB);
    const cA = (capA + capB) > 0 ? conv * (capA / (capA + capB)) : 0;
    a = Math.max(0, gA - cA - rA); b = Math.max(0, gB - (conv - cA) - rB);
    const ss = ssTerm(y);
    // v5.53 (D-10 modelling half): the taxable sleeve's DIVIDENDS enter the §86 provisional base
    // and magi. Engine C's `_prov86` has always carried `div_y`; the ladder does from v5.53, so
    // this model must too or it asserts the PRE-FIX expression. Same correction as t24's oracle.
    // ⚠ Gated: v5.52 and earlier legitimately carry no such term (OPERATIONS §B2).
    const nonSS = PEN + taper(y) + conv + rmd + DIV;
    const taxableSS = Math.round(statute86(ss, nonSS, true));
    out.push({ y, ss, magi: PEN + taper(y) + taxableSS + conv + rmd + DIV });
  }
  return out;
}
const aTerm = y => y > SSA_YR ? SSA : y === SSA_YR ? SSA / 12 * partialMonths(SSA_MO) : 0;
// The four candidate behaviours for B's term. Only `bGated` is correct; the others exist so the
// assertions below can name what a regression would look like instead of merely failing.
const bUngated  = (mo, yr, amt) => () => amt * 12;                                   // the defect
const bGated    = (mo, yr, amt) => y => y > yr ? amt * 12 : y === yr ? amt * partialMonths(mo) : 0;
const bWholeYr  = (mo, yr, amt) => y => y >= yr ? amt * 12 : 0;                      // D-2a's rejected branch
const bNoClaimY = (mo, yr, amt) => y => y > yr ? amt * 12 : 0;                       // claim year dropped entirely
const K = n => Math.round(n / 1000);
const magiK = rows => rows.map(r => K(r.magi));

// ── mount ────────────────────────────────────────────────────────────────────────────────
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
const tabBy = name => [...body().querySelectorAll("button,div,span")]
  .find(el => (el.textContent || "").trim().toLowerCase() === name);

const rowRe = /(20\d\d)\$(-?\d+)K\$(-?\d+)K(\d+)%\$(-?[\d.]+)K\$(-?\d+)K/g;
const readRows = () => {
  const txt = body().textContent || ""; const out = []; let m; rowRe.lastIndex = 0;
  while ((m = rowRe.exec(txt)) !== null)
    out.push({ year: +m[1], conv: +m[2], taxable: +m[3], rate: +m[4], tax: +m[5], magi: +m[6] });
  return out;
};

console.log(`t28 \u2014 ROTH TAB SPOUSE-B SS CLAIM GATE (${VER})`);
console.log(`     oracle: ${ORACLE}\n`);

await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
const ex = [...body().querySelectorAll("button,[role=button],div")]
  .filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
T("SETUP: landing offers Use Example Data", !!ex);
await click(ex); await flush(); await flush();
T("SETUP: Roth tab reachable", !!tabBy("roth"));
await click(tabBy("roth")); await flush(); await flush();

const Gx = window.__g;
const BASE = JSON.parse(JSON.stringify(Gx.PORTFOLIO()));
// TRAP (OPERATIONS §C): `applyLoadedData` takes a WRAPPER and mutates module globals without
// re-rendering, so park off the target tab, install, then navigate back.
const install = async portfolio => {
  await click(tabBy("dashboard"));
  Gx.applyLoadedData({ portfolio });
  await flush();
  await click(tabBy("roth")); await flush(); await flush();
  return readRows();
};
const ssTable = { 62: 1200, 63: 1300, 64: 1400, 65: 1550, 67: 1800, 70: 2250 };
const withB = (over = {}) => {
  const P = JSON.parse(JSON.stringify(BASE));
  P.incomeSources.ssB = { tableByAge: ssTable, planned: 2250, plannedAge: 70 };
  Object.assign(P, over);
  return P;
};

// ── §A · the example household is a NO-OP, asserted separately ───────────────────────────
// This is not evidence the fix works. It is evidence the fix stayed inside its blast radius —
// the check that would catch a gate firing where B is already claiming.
{
  const rows = readRows();
  T("A-1: the example ladder renders 12 years", rows.length === 12, `${rows.length}`);
  const tl = Gx.PLAN_TIMELINE();
  T("A-2: on the example household B claims JANUARY of the ladder's first year",
    tl.ssB_date.year === tl.rothLadderStart && tl.ssB_date.month === 1,
    JSON.stringify(tl.ssB_date) + " vs start " + tl.rothLadderStart);
  T("A-3: so B's claim-year partial credit is a FULL twelve months \u2014 the reason this " +
    "household cannot see the defect at all", partialMonths(tl.ssB_date.month) === 12);
  const b = bGated(1, 2029, 1300), u = bUngated(1, 2029, 1300);
  const gatedM = magiK(ladder(70000, y => b(y) + aTerm(y)));
  const ungatedM = magiK(ladder(70000, y => u(y) + aTerm(y)));
  T("A-4: gated and ungated models agree on this household in all 12 years \u2014 $0, by construction",
    JSON.stringify(gatedM) === JSON.stringify(ungatedM));
  T("A-5: rendered MAGI matches, and is therefore IDENTICAL on every leg",
    JSON.stringify(magiK(rows.map(r => ({ magi: r.magi * 1000 })))) === JSON.stringify(gatedM),
    JSON.stringify(rows.map(r => r.magi)) + " vs " + JSON.stringify(gatedM));
}

// ── §B · FIXTURE 1 — B delays to 70, January claim: the seven pre-claim years ────────────
{
  const rows = await install(withB());
  const tl = Gx.PLAN_TIMELINE();
  T("B-1: the fixture installed \u2014 B now claims 2036, seven years after the ladder starts",
    tl.ssB_date.year === 2036 && tl.rothLadderStart === 2029, JSON.stringify(tl.ssB_date));
  T("B-2: it renders 12 years", rows.length === 12, `${rows.length}`);
  const gated = magiK(ladder(70000, y => bGated(1, 2036, 2250)(y) + aTerm(y)));
  const ungated = magiK(ladder(70000, y => bUngated(1, 2036, 2250)(y) + aTerm(y)));
  const got = rows.map(r => r.magi);
  // NEGATIVE CONTROL, and it must FIRE: if these two models agreed, the fixture would be
  // exercising nothing and every assertion below would be vacuous (OPERATIONS §B2).
  T("B-3: CONTROL \u2014 gated and ungated models DISAGREE on this fixture (7 years)",
    gated.filter((v, i) => v !== ungated[i]).length === 7,
    `${gated.filter((v, i) => v !== ungated[i]).length} years differ`);
  T(`B-4: rendered MAGI matches the ${POST_FIX ? "GATED" : "UNGATED [KNOWN DEFECT 2026-08-22]"} model`,
    JSON.stringify(got) === JSON.stringify(POST_FIX ? gated : ungated),
    JSON.stringify(got) + " vs " + JSON.stringify(POST_FIX ? gated : ungated));
  T(`B-5: and does NOT match the ${POST_FIX ? "ungated" : "gated"} one`,
    JSON.stringify(got) !== JSON.stringify(POST_FIX ? ungated : gated));
  for (let y = 2029; y <= 2035; y++) {
    const i = y - 2029;
    T(`B-6.${y}: pre-claim year ${y} carries ${POST_FIX ? "NO" : "PHANTOM"} spouse-B benefit`,
      got[i] === (POST_FIX ? gated[i] : ungated[i]), `${got[i]}K`);
  }
  for (let y = 2036; y <= 2040; y++) {
    const i = y - 2029;
    T(`B-7.${y}: post-claim year ${y} is UNCHANGED by this release`,
      got[i] === gated[i] && got[i] === ungated[i], `${got[i]}K`);
  }
}

// ── §C · FIXTURE 2 — mid-year claim: the branch D-2a actually chose ──────────────────────
// FIXTURE 1 cannot distinguish partial-month from whole-year. This one can, and names all
// three candidates so a regression toward either wrong branch fails by name rather than by
// a number nobody can interpret.
{
  const rows = await install(withB({ dobB: "1966-07-01" }));   // §C trap: DOB must be a YYYY-MM-DD string
  const tl = Gx.PLAN_TIMELINE();
  T("C-1: B's claim now lands in JULY 2036, mid-ladder",
    tl.ssB_date.year === 2036 && tl.ssB_date.month === 7, JSON.stringify(tl.ssB_date));
  T("C-2: it renders 12 years", rows.length === 12, `${rows.length}`);
  const got = rows.map(r => r.magi);
  const gated   = magiK(ladder(70000, y => bGated(7, 2036, 2250)(y) + aTerm(y)));
  const ungated = magiK(ladder(70000, y => bUngated(7, 2036, 2250)(y) + aTerm(y)));
  const whole   = magiK(ladder(70000, y => bWholeYr(7, 2036, 2250)(y) + aTerm(y)));
  const noClaim = magiK(ladder(70000, y => bNoClaimY(7, 2036, 2250)(y) + aTerm(y)));
  const i36 = 2036 - 2029;
  // CONTROL: the three candidate behaviours must be mutually distinguishable in 2036, or this
  // fixture proves nothing either.
  T("C-3: CONTROL \u2014 partial-month, whole-year and no-claim-year all DIFFER in 2036",
    new Set([gated[i36], whole[i36], noClaim[i36]]).size === 3,
    `partial ${gated[i36]}K / whole ${whole[i36]}K / none ${noClaim[i36]}K`);
  T(`C-4: rendered MAGI matches the ${POST_FIX ? "GATED" : "UNGATED [KNOWN DEFECT 2026-08-22]"} model`,
    JSON.stringify(got) === JSON.stringify(POST_FIX ? gated : ungated),
    JSON.stringify(got) + " vs " + JSON.stringify(POST_FIX ? gated : ungated));
  if (POST_FIX) {
    T("C-5: the claim year credits a PARTIAL six months, per D-2a (mirroring spouse A)",
      got[i36] === gated[i36], `${got[i36]}K, expected ${gated[i36]}K`);
    T("C-6: it is NOT a whole-year gate", got[i36] !== whole[i36], `whole-year would be ${whole[i36]}K`);
    T("C-7: it does NOT drop the claim year entirely", got[i36] !== noClaim[i36],
      `dropping it would be ${noClaim[i36]}K`);
  } else {
    T("C-5: [KNOWN DEFECT 2026-08-22] the claim year is credited in full, ungated",
      got[i36] === ungated[i36], `${got[i36]}K`);
  }
}

// ── §D · the single-filer gate, by DIFFERENTIAL \u2014 no transcription required ──────────
// `ssB_date` is constructed unconditionally, so a date-only gate would still credit a single
// filer whose stored `ssB.planned` is non-zero. That state is not reachable through either of
// the app's two plan-writing forms, both of which zero `ssB` when `single` is set \u2014 but it IS
// reachable through a restored or hand-edited backup, which is the same path this fixture uses.
// Asserted as a DIFFERENCE rather than against a model: a single-filer ladder is a different
// recursion (own thresholds, no B balance), and transcribing it would add far more surface than
// the claim justifies. If B's term is properly gated, a non-zero stored ssB CANNOT matter.
{
  const withSSB = await install(withB({ single: true }));
  const zeroSSB = await install(withB({ single: true, incomeSources: { ...JSON.parse(JSON.stringify(BASE.incomeSources)),
    ssB: { tableByAge: {}, planned: 0, plannedAge: 70 } } }));
  T("D-1: both single-filer renders produced a ladder", withSSB.length > 0 && zeroSSB.length > 0,
    `${withSSB.length} / ${zeroSSB.length}`);
  const a = JSON.stringify(withSSB.map(r => r.magi)), b = JSON.stringify(zeroSSB.map(r => r.magi));
  if (POST_FIX) {
    T("D-2: a single filer's ladder is IDENTICAL whether or not a stale spouse-B benefit is stored",
      a === b, `${a} vs ${b}`);
  } else {
    T("D-2: [KNOWN DEFECT 2026-08-22] a stored spouse-B benefit leaks into a single filer's ladder",
      a !== b, `${a} vs ${b}`);
  }
  T("D-3: CONTROL \u2014 the stored benefit really was non-zero in the first render, so D-2 is not vacuous",
    JSON.parse(JSON.stringify(withB({ single: true }))).incomeSources.ssB.planned === 2250);
}

console.log(`\nt28 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
