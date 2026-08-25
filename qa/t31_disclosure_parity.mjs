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
// anchor on 2026-08-25 (SCOPE_D6_SSA44_USER_SIDE.md §7.1), and it is the third recorded instance
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
const KNOWN_VERSIONS = ["v548", "v549"];
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

T("A-1: the DOCS_HTML line is located by length and is the Field Manual",
  DOCS.length > 100000 && DOCS.includes("FIELD MANUAL"),
  `line ${docsIdx + 1}, ${DOCS.length} code points`);
T("A-2: excluding it leaves the render tree intact",
  LINES.length - APP.split("\n").length === 1);
T("A-3: METHODOLOGY.md resolved and is the real document",
  METH.length > 40000 && /Danger Close/i.test(METH),
  `${METH_PATH}, ${METH.length} code points`);

// The parity predicate. Creator-side names it -> at least one user-facing surface names it.
const inMeth = k => METH.includes(k);
const inApp  = k => APP.includes(k);
const inDocs = k => DOCS.includes(k);
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
  { key: "SSA-44",
    why: "the form number is the only searchable handle a household has for IRMAA relief" },
  { key: "work stoppage",
    why: "the enumerated trigger that applies to most newly retired households" },
];

T("C-0: every declared key is named in METHODOLOGY.md \u2014 parity is only owed for limitations " +
  "the creator side actually claims",
  KEYS.every(k => inMeth(k.key)),
  KEYS.filter(k => !inMeth(k.key)).map(k => k.key).join(", "));

const POST = VER === "v549";
for (const { key, why } of KEYS) {
  if (POST) {
    T(`C [PARITY]: "${key}" is named creator-side AND user-side \u2014 ${why}`,
      inMeth(key) && userSide(key),
      `meth=${inMeth(key)} app=${inApp(key)} docs=${inDocs(key)}`);
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
  T("D-4 [DIRECTION]: the user-side copy states the model charges the full surcharge regardless",
    /charges the full surcharge/.test(APP) && /charges the full surcharge/.test(DOCS));
} else {
  T("D-1 [KNOWN DEFECT pre-v5.49]: neither surface names SSA-44",
    !inDocs("SSA-44") && !inApp("SSA-44"));
}

console.log(`\nt31 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
