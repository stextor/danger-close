// t31 — CROSS-SURFACE DISCLOSURE PARITY. If METHODOLOGY.md names a limitation, the user must be
// able to find it too.
//
// WHY THIS EXISTS. D-6 (the IRMAA SSA-44 relief) sat "partially disclosed" for seven releases and
// was then recorded as CLOSED because METHODOLOGY.md had been fixed. It had not been closed. The
// creator-side half was written and the user-side half never was, and D-6's own entry sets its
// exposure as user-side. Nothing could catch that, because NO TEST IN THIS PROJECT READ
// METHODOLOGY.md — every occurrence of that filename across t1–t30 is a code comment. The two
// surfaces were asserted independently or not at all, so a limitation could be documented in one
// and absent from the other forever and the suite would report green.
//
// That is the project's own recorded pattern one level up: a fixture that cannot reach a behaviour
// makes every assertion about it vacuous. Here there was no fixture at all. This suite is the
// extinction invariant for the CLASS, not a check on the D-6 instance — the instance is two
// sentences of copy and would not be worth a suite on its own.
//
// ⚠ THIS TEST MATCHES LITERAL STRINGS IN THE **RAW** DOCS_HTML, AND THAT IS DELIBERATE.
// It will go red on copy that is visually correct but raw-different. The Field Manual heading
//     <h3>IRMAA Cliff <span class="tag" ...>strategy</span></h3>
// renders as "IRMAA Cliff strategy" but contains no such substring — ~80 characters of badge
// markup sit between the two words. That exact difference invalidated this scope's own site
// anchor on 2026-08-25 (SCOPE_D6_SSA44_USER_SIDE.md §7.1), and it is the FOURTH recorded instance
// of one class: a DERIVED ARTIFACT MISTAKEN FOR THE PRIMARY SOURCE.
//
// So when a key fails here, there are two candidate causes and only one correct response:
//   (a) the clause is genuinely absent user-side          -> write the clause. This is the point.
//   (b) the clause is present but split by a tag          -> fix the COPY, not this test.
// DO NOT "fix" a failure by decoding DOCS_HTML and matching the rendered text. Stripping tags with
// a regex is what produced false zeros during the v5.48 verification — an unmatched `<` consumed
// spans of real text and `OBBBA`, `senior` and `standard deduction` all returned 0 hits against a
// string that held 2, 1 and 4 (MissingFeatures.md errata, 2026-08-25). Decoding is the failure
// mode, not the remedy. Keys are kept short, plain and markup-free so that (b) stays rare.
//
// ⚠ WHAT THIS SUITE DOES NOT CLAIM. It asserts that a NAMED STRING appears on both surfaces. It
// says nothing about whether the two say the same thing, whether the user-side wording is
// accurate, or whether it is comprehensible. A key can pass here against a sentence that is
// misleading. Parity of vocabulary is the floor, not the ceiling.
//
// ⚠ THE KEY SET IS DELIBERATELY SMALL. Two keys. A list that grows carelessly is how a green
// check stops meaning anything, and every key added is a claim that the string is load-bearing on
// both surfaces. Widening it is a scope, not a convenience (SCOPE_D6_SSA44_USER_SIDE.md §5).
//
// usage: node qa/t31_disclosure_parity.mjs <tag>
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v549";
const KNOWN_VERSIONS = ["v548", "v549", "v550", "v551"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  process.exit(1);
}

const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const LINES = SRC.split("\n");

// METHODOLOGY.md is a NEW harness input — no suite before t31 read it, so the flat run folder was
// never required to contain it. Resolve across the plausible shapes and FAIL LOUDLY if absent.
// A skipped check that reports green is the exact defect this suite exists to prevent, so a
// missing file is a hard exit, never a silent pass.
const METH_CANDIDATES = [
  join(HERE, "..", "METHODOLOGY.md"),
  join(HERE, "METHODOLOGY.md"),
  join(HERE, "..", "..", "METHODOLOGY.md"),
];
const METH_PATH = METH_CANDIDATES.find(p => existsSync(p));
if (!METH_PATH) {
  console.log("  \u2717 FATAL: METHODOLOGY.md not found. t31 is the first suite to read it, so the");
  console.log("    flat run folder must now contain it alongside the sources. Tried:");
  METH_CANDIDATES.forEach(p => console.log(`      ${p}`));
  process.exit(1);
}
const METH = readFileSync(METH_PATH, "utf8");

let pass = 0, fail = 0;
const T = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}${detail ? ` \u2014 ${detail}` : ""}`); }
};

console.log(`t31 \u2014 CROSS-SURFACE DISCLOSURE PARITY (${VER})\n`);

// ── §A · the two user-facing surfaces, separated ────────────────────────────────────────
// Located by length, not by index, per the standing DOCS_HTML rule. The Field Manual is a
// complete standalone HTML document living on one line; the render tree is everything else.
const docsIdx = LINES.reduce((best, l, i) => (l.length > LINES[best].length ? i : best), 0);
const DOCS = LINES[docsIdx];                                             // raw, undecoded
const APP = LINES.filter((_, i) => i !== docsIdx).join("\n");            // the render tree
// ⚠ THREE different numbers describe this one line and they are all "its length":
//   146,374 code points  (Python len)   146,377 UTF-16 units (JS .length)   147,515 bytes (utf-8)
// JS .length counts UTF-16 units, so the 3 non-BMP emoji in the manual (a key, a monitor and a
// compass) make it exceed the code-point count. Always say WHICH measure you recorded; a
// session comparing one against another reads drift that is not there.

T("A-1: the DOCS_HTML line is located by length and is the Field Manual",
  DOCS.length > 100000 && DOCS.includes("FIELD MANUAL"),
  `line ${docsIdx + 1}, ${DOCS.length} UTF-16 units / ${Buffer.byteLength(DOCS, "utf8")} bytes`);
T("A-2: excluding it leaves the render tree intact",
  LINES.length - APP.split("\n").length === 1);
T("A-3: METHODOLOGY.md resolved and is the real document",
  METH.length > 40000 && /Danger Close/i.test(METH),
  `${METH_PATH}, ${METH.length} code points`);

// The parity predicate. Creator-side names it -> at least one user-facing surface names it.
//
// ⚠ MATCHING IS CASE-INSENSITIVE, AND THAT IS A DELIBERATE NARROWING OF THE LITERAL RULE ABOVE.
// The claim under test is "this surface NAMES the limitation", not "this surface contains this
// exact byte sequence". Case is not semantically load-bearing in prose: the approved v5.49 Field
// Manual copy opens a sentence with "Work stoppage or reduction is one of eight..." while the
// IRMAA tab note says "work stoppage is one of eight...". Both name it. A case-sensitive check
// would fail on correct copy and the only way to satisfy it would be to contort a sentence-initial
// capital out of user-facing English — the test wagging the product.
//
// This is NOT a licence to loosen further. Everything else stays strict: the phrase must still be
// CONTIGUOUS and MARKUP-FREE in the raw string, which is the property that actually catches the
// failure mode (<strong>work</strong> stoppage names nothing a reader can search for). The
// negative control in §B-3 still has to detect absence, so case-folding cannot make this suite
// pass vacuously — if CTRL_NONE ever resolves, the run goes red regardless of case.
const norm = s => s.toLowerCase();
const METH_L = norm(METH), APP_L = norm(APP), DOCS_L = norm(DOCS);
const inMeth = k => METH_L.includes(norm(k));
const inApp  = k => APP_L.includes(norm(k));
const inDocs = k => DOCS_L.includes(norm(k));
const userSide = k => inApp(k) || inDocs(k);

// ── §B · CONTROLS. Run BEFORE the real keys, and on every leg. ───────────────────────────
// Three controls, chosen so that no constant-return bug can satisfy all three:
//   B-1 resolves only through the render tree  -> a checker ignoring APP fails it
//   B-2 resolves only through the raw manual   -> a checker ignoring DOCS fails it
//   B-3 resolves on NEITHER surface            -> a checker stuck on `true` fails it
// B-1 and B-2 together also fail any checker stuck on `false`. This is what makes a green run
// here evidence rather than decoration (OPERATIONS §B2).
const CTRL_APP  = "Uniform Lifetime Table divisors";
const CTRL_DOCS = "Roth break-even";
const CTRL_NONE = "Seeded common-random-numbers";

T("B-0: all three controls are present in METHODOLOGY.md \u2014 they are only controls if the " +
  "creator-side half is true",
  [CTRL_APP, CTRL_DOCS, CTRL_NONE].every(inMeth));
T(`B-1 [CONTROL/app arm]: "${CTRL_APP}" resolves through the RENDER TREE only`,
  inApp(CTRL_APP) && !inDocs(CTRL_APP) && userSide(CTRL_APP));
T(`B-2 [CONTROL/manual arm]: "${CTRL_DOCS}" resolves through the RAW MANUAL only`,
  inDocs(CTRL_DOCS) && !inApp(CTRL_DOCS) && userSide(CTRL_DOCS));
T(`B-3 [NEGATIVE CONTROL]: "${CTRL_NONE}" is named creator-side and reachable on NEITHER user ` +
  "surface \u2014 the predicate can still detect absence",
  inMeth(CTRL_NONE) && !userSide(CTRL_NONE),
  "if this fires, the phrase reached the UI: pick a new sentinel, do NOT loosen the predicate");

// ── §C · the declared key set ────────────────────────────────────────────────────────────
// Each key is a string a user would plausibly search for, kept short and markup-free.
const KEYS = [
  { key: "SSA-44", since: "v549",
    why: "the form number is the only searchable handle a household has for IRMAA relief" },
  { key: "work stoppage", since: "v549",
    why: "the enumerated trigger that applies to most newly retired households" },
  // Added v5.50 (D-7). The comparator's estate figure carries NO estate or inheritance tax of any
  // kind — HEIR_RATE is an heir INCOME tax on Traditional balances only — and that figure is the
  // DEFAULT ranking objective. Before v5.50 neither surface said so: METHODOLOGY.md had zero
  // mentions and the raw Field Manual had zero, while the only in-app estate-limitation text was
  // gated to single households, so a couple never rendered it. Direction: OPTIMISTIC.
  // ⚠ The key is the DISCLOSURE PHRASE, not the word "heir". "heir" was already on both surfaces
  // at v5.50 (the estate figure names "heirs' taxes"), so keying on it passed before the fix
  // existed - the negative control caught that and this is the repair. Key on what CHANGED.
  { key: "assumption with no statutory source", since: "v551",
    why: "the estate figure's ONLY deduction is an assumed heir rate that no source supports" },
  { key: "estate tax", since: "v550",
    why: "the default ranking objective is an estate figure that deducts no estate tax at all" },
];

T("C-0: every declared key is named in METHODOLOGY.md \u2014 parity is only owed for limitations " +
  "the creator side actually claims",
  KEYS.every(k => inMeth(k.key)),
  KEYS.filter(k => !inMeth(k.key)).map(k => k.key).join(", "));

const POST = VER === "v549" || VER === "v550" || VER === "v551";
// EACH KEY IS GATED TO THE RELEASE THAT LANDED IT, not to the shared POST flag above.
// Found at the v5.50 build. Under one shared gate the v549 leg went GREEN on v5.50's expectation
// for the wrong reason twice over - METHODOLOGY.md is ONE shared file at the run-folder root, so a
// frozen leg is read against the CURRENT document; and inApp is a source-text search that cannot
// see JSX gating, so v5.49's single-household-gated estate card satisfied it even though a COUPLE
// never rendered a word of it - while the v548 leg FAILED outright, invisibly, because runsuite.sh
// only runs t31 for the prior and current tags.
const ORDER = ["v548", "v549", "v550", "v551"];
const post = k => ORDER.indexOf(VER) >= ORDER.indexOf(k.since);
for (const k of KEYS) {
  const { key, why, since } = k;
  if (post(k)) {
    T(`C [PARITY]: "${key}" is named creator-side AND user-side \u2014 ${why}`,
      inMeth(key) && userSide(key),
      `meth=${inMeth(key)} app=${inApp(key)} docs=${inDocs(key)}`);
  } else if (since === "v551") {
    // Pre-v5.51 heir-rate state. The word appears on both surfaces at v5.50 already (the estate
    // figure names "heirs' taxes"), so an appears/does-not-appear pin would be vacuous. What was
    // true, and what v5.51 changed, is that NEITHER surface said the rate is an ASSUMPTION rather
    // than a computed or statutory figure.
    T(`C [KNOWN DEFECT pre-v5.51]: "${key}" is named but never disclosed as an assumption`,
      !/assumption with no statutory source/i.test(APP + DOCS),
      `app=${inApp("assumption with no statutory source")} docs=${inDocs("assumption with no statutory source")}`);
  } else if (since === "v550") {
    // Pre-v5.50 estate-tax state, pinned to what was ACTUALLY true of those builds. The render tree
    // DID carry the phrase - inside a single-household branch - so a !userSide pin would be false.
    // What was true, and what v5.50 changed, is that the FIELD MANUAL never named it at all.
    T(`C [KNOWN DEFECT pre-v5.50]: "${key}" never reaches the FIELD MANUAL, and the only ` +
      "render-tree mention is gated to single households, so a couple sees nothing",
      !inDocs(key),
      `app=${inApp(key)} docs=${inDocs(key)}`);
  } else {
    // The pre-v5.49 state, PINNED so the frozen leg keeps asserting what was actually true of it.
    // Inverting an assertion without gating it applies the new expectation to every frozen leg and
    // stops the prior leg replaying green (OPERATIONS §B2, the defect the v5.27 fix itself caused).
    T(`C [KNOWN DEFECT pre-v5.49]: "${key}" is named in METHODOLOGY.md and reaches NEITHER user ` +
      "surface \u2014 this is D-6's open half",
      inMeth(key) && !userSide(key),
      `app=${inApp(key)} docs=${inDocs(key)}`);
  }
}

// ── §D · both surfaces carry the clause, asserted SEPARATELY ─────────────────────────────
// The parity predicate in §C is an OR, so one surface alone satisfies it. D-6 is owed on both:
// the Field Manual entry and the IRMAA tab note are different readers arriving different ways.
// Asserting them separately means removing one cannot hide behind the other.
if (POST) {
  T("D-1: the FIELD MANUAL names SSA-44 \u2014 the IRMAA Cliff entry carries the clause",
    inDocs("SSA-44"));
  T("D-2: the RENDER TREE names SSA-44 \u2014 the IRMAA tab note carries the clause",
    inApp("SSA-44"));
  T("D-3: both surfaces name the trigger, not just the form number",
    inDocs("work stoppage") && inApp("work stoppage"),
    `docs=${inDocs("work stoppage")} app=${inApp("work stoppage")}`);
  // Direction. The clause must not imply the model prices an appeal in; it does not, and the
  // conservative direction is the reason the omission was acceptable in the first place.
  // ⚠ The phrase is a PARAMETER, set from the APPROVED COPY, not from a draft. It read
  // "charges the full surcharge" while the wording was still provisional; the copy approved
  // 2026-08-25 says "charges every surcharge in full" on both surfaces. Updating this to track
  // approved copy is correct; weakening it to something both a conservative and a non-conservative
  // sentence would satisfy is not.
  const DIRECTION = "charges every surcharge in full";
  if (VER === "v550" || VER === "v551") {
    // The C predicate is an OR, and for this key the app arm was ALREADY satisfied before the fix
    // by single-gated text. Asserting the manual arm separately is what makes the key mean anything.
    T("D-5: the FIELD MANUAL names estate tax - the arm that was empty before v5.50",
      inDocs("estate tax"));
    T("D-6: the RENDER TREE names it outside the single-household branch",
      inApp("no estate tax and no inheritance tax"));
    T("D-7 [DIRECTION]: both surfaces name the direction of the error as optimistic",
      inDocs("optimistic") && inApp("optimistic"),
      `docs=${inDocs("optimistic")} app=${inApp("optimistic")}`);
  }
  if (VER === "v550" || VER === "v551") {
    // E · CREATOR-SIDE LABEL DRIFT. Added after the v5.50 ship, when a sweep found METHODOLOGY.md
    // still describing the objective list as "max after-tax estate" in three places while its own
    // new section 12 explained why that phrase was wrong. The document contradicted itself, and
    // nothing caught it: the t1 extinction pin reads the .jsx SOURCE only, and this suite asked
    // whether a key APPEARS, never whether a retired label had stopped appearing.
    //
    // One occurrence is legitimate and expected - the sentence recording that the figure was called
    // "after-tax estate" before v5.50. More than one means a live description drifted back.
    const stale = (METH.match(/after-tax estate/gi) || []).length;
    T("E-1: METHODOLOGY.md describes the objective by its CURRENT label",
      /estate after heir income tax/i.test(METH));
    T("E-2 [EXTINCTION]: METHODOLOGY.md carries the retired label at most once, as history",
      stale <= 1, `occurrences=${stale}`);
  }
  T(`D-4 [DIRECTION]: both surfaces state the model ${DIRECTION}`,
    inApp(DIRECTION) && inDocs(DIRECTION),
    `app=${inApp(DIRECTION)} docs=${inDocs(DIRECTION)}`);
} else {
  T("D-1 [KNOWN DEFECT pre-v5.49]: neither surface names SSA-44",
    !inDocs("SSA-44") && !inApp("SSA-44"));
}

console.log(`\nt31 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
