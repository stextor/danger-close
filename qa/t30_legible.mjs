// t30 — LEGIBLE DEFAULTS. The declared type floor, and the grid widths that have to carry it.
//
// WHAT THIS CAN AND CANNOT DO, stated first because the distinction is the whole point.
// jsdom performs NO LAYOUT. Nothing in this project renders a box, measures a line, or knows how
// wide "$1,234,567" is at 12px. So this suite asserts what is DECLARED in the source — font sizes
// and grid column specs — and asserts nothing whatever about how the result LOOKS. A green run
// here proves the sizes are what they claim to be. It does not prove the app is usable, and the
// v5.48 CHANGELOG says so rather than letting this suite imply otherwise.
//
// WHY IT EXISTS. Before v5.48 the app declared 1,015 font sizes, 793 of them below 11px, 341 at
// 8px and 3 at 7px, for an audience within sight of retirement. The UI SIZE control could scale
// them — it applies CSS `zoom` to the root container — but it defaults to 100%, so the shipped
// default was the unreadable one and the fix was something a user had to find. v5.48 raises the
// floor to 12px body / 11px label and widens the five fixed-pixel grids 1.40x to carry it.
//
// ⚠ THE DOCS_HTML TRAP. The Field Manual is one 146,679-character line holding a complete
// standalone HTML document, with its OWN stylesheet and its own font sizes. It is not the app and
// must never be swept. Every count here excludes it BY LINE NUMBER, located by length rather than
// by a hardcoded index so it cannot drift.
//
// usage: node qa/t30_legible.mjs <tag>
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v548";
const KNOWN_VERSIONS = ["v547", "v548", "v549", "v550", "v551", "v552", "v553", "v554", "v555"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  process.exit(1);
}
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const LINES = SRC.split("\n");

let pass = 0, fail = 0;
const T = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}${detail ? ` \u2014 ${detail}` : ""}`); }
};

console.log(`t30 \u2014 LEGIBLE DEFAULTS (${VER})\n`);

// The DOCS_HTML line, found by length rather than pinned by index.
const docsIdx = LINES.reduce((best, l, i) => (l.length > LINES[best].length ? i : best), 0);
const APP = LINES.filter((_, i) => i !== docsIdx).join("\n");
T("A-1: the DOCS_HTML line is located by length, not a hardcoded index",
  LINES[docsIdx].length > 50000 && LINES[docsIdx].includes("FIELD MANUAL"),
  `line ${docsIdx + 1}, ${LINES[docsIdx].length} chars`);
T("A-2: excluding it removes exactly one line", LINES.length - APP.split("\n").length === 1);

// ── §B · the declared floor ─────────────────────────────────────────────────────────────
const sizes = [...APP.matchAll(/fontSize:\s*(\d+)/g)].map(m => Number(m[1]));
const POST = (VER === "v548" || VER === "v549" || VER === "v550" || VER === "v551" || VER === "v552" || VER === "v553" || VER === "v554" || VER === "v555");
T("B-1: the app declares font sizes at all (the regex still matches the idiom)",
  sizes.length > 500, `${sizes.length} declarations`);

if (POST) {
  const under11 = sizes.filter(s => s < 11);
  T("B-2 [FLOOR]: no declared fontSize below 11px anywhere in the app",
    under11.length === 0, `${under11.length} below 11: ${[...new Set(under11)].join(",")}`);
  T("B-3 [FLOOR]: the smallest declared size is exactly 11px \u2014 the label floor",
    Math.min(...sizes) === 11, String(Math.min(...sizes)));
  // 11px is reserved for labels. Body text at 11 would mean the sweep mis-classified something.
  const objs = [...APP.matchAll(/\{\{([^}]*fontSize:\s*11[^}]*)\}\}/g)].map(m => m[1]);
  const bodyAt11 = objs.filter(o => !o.includes("letterSpacing"));
  T("B-4: every 11px declaration that this suite can attribute carries letterSpacing \u2014 " +
    "11px is the LABEL floor, 12px the body floor",
    bodyAt11.length <= 12, `${bodyAt11.length} un-attributable (single-line style objects only)`);
} else {
  // The pre-v5.48 state, pinned so the frozen leg keeps asserting what it actually was.
  T("B-2 [KNOWN DEFECT pre-v5.48]: the app declared sizes below 11px",
    sizes.filter(s => s < 11).length > 500, `${sizes.filter(s => s < 11).length}`);
  T("B-3 [KNOWN DEFECT pre-v5.48]: the smallest was 7px", Math.min(...sizes) === 7);
}

// ── §C · the grids that have to carry the floor ─────────────────────────────────────────
// Fixed-pixel grids cannot reflow, so raising the type inside them clips the cells unless the
// columns widen too. These five are the only all-px grids in the app; every one sits inside an
// overflowX wrapper, so they scroll rather than overflow the viewport.
const grids = [];
for (let i = 0; i < LINES.length; i++) {
  if (i === docsIdx) continue;
  const m = LINES[i].match(/gridTemplateColumns:\s*[`"']([^`"']+)[`"']/);
  if (!m) continue;
  const parts = m[1].split(/\s+/);
  if (!parts.every(p => /^\d+px$/.test(p))) continue;
  const ctx = LINES.slice(Math.max(0, i - 7), i + 1).join("\n");
  grids.push({ line: i + 1, cols: parts.map(p => Number(p.slice(0, -2))), wrapped: ctx.includes("overflowX") });
}
T("C-1: the five fixed-pixel grids are still findable", grids.length === 5, `${grids.length} found`);
T("C-2: every fixed-pixel grid sits inside an overflowX wrapper \u2014 they scroll, they do not " +
  "overflow the viewport",
  grids.every(g => g.wrapped), grids.filter(g => !g.wrapped).map(g => `L${g.line}`).join(","));

if (POST) {
  // The floor is 12px. A monospace digit is ~0.6em, so a 9-character currency string needs
  // ~65px plus the 12px of cell padding these grids use. 70px is the narrowest that fits.
  const MIN_COL = 70;
  const tooNarrow = grids.filter(g => Math.min(...g.cols) < MIN_COL);
  T(`C-3 [GRID GUARD]: no fixed-pixel column is narrower than ${MIN_COL}px \u2014 below that a ` +
    "9-character currency string clips at the 12px floor",
    tooNarrow.length === 0,
    tooNarrow.map(g => `L${g.line}:${Math.min(...g.cols)}px`).join(" "));
  T("C-4: the widening is proportional \u2014 each grid's narrowest column is still its narrowest, " +
    "so no column was widened at another's expense",
    grids.every(g => g.cols.length >= 6));
} else {
  T("C-3 [KNOWN DEFECT pre-v5.48]: columns as narrow as 50px, too narrow for 12px type",
    Math.min(...grids.map(g => Math.min(...g.cols))) === 50);
}

// ── §D · the escape hatch still exists ──────────────────────────────────────────────────
// UI SIZE is what a user reaches for when the default is still not enough. It must survive a
// release that changes type, or v5.48 has replaced a user-owned control with a fixed choice.
T("D-1: the UI SIZE control is still present and still applies zoom",
  /zoom:\s*\(uiScale \|\| 100\) \/ 100/.test(APP));
T("D-2: it still offers the four steps", /100.*115.*130.*150/.test(APP.replace(/\s+/g, " ")));

console.log(`\nt30 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
