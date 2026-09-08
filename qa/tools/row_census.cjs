// row_census.cjs — the manifest hash-row expression exists in more than one place. This is the
// check that they still AGREE.
//
// WHY THIS EXISTS. On 2026-09-08 an AST census found FOUR live copies of `package_check` K-8's row
// matcher, plus a fifth that had already drifted:
//
//   1. qa/tools/package_check.mjs        — the gate itself
//   2. PROJECT_KNOWLEDGE_INDEX.md        — the D-5 "derive the count, do not read it" block
//   3. qa/tools/controls_manifest_rows.py — ROW, which picks the C1 control's target
//   4. qa/tools/package_check_controls.sh — P32's selector, NARROWER ON PURPOSE (D-4), excluded
//   5. docs/SCOPE_HOUSEKEEPING_THREE.md   — the pre-D-C-1 loose form, HISTORY, excluded
//
// The manifest introduces copy 2 with the claim that it "is package_check K-8's own expression so
// it cannot drift away from the gate." That was true only while somebody remembered to edit both.
// Copy 3 is worse than cosmetic: it selects the control's target, so a gate widened without it
// ships new behaviour with a control that structurally cannot exercise it — a control that passes
// while measuring nothing, which is the P32/P42 defect this project has recorded three times.
//
// Decision D-3 (2026-09-08) kept copy 2 rather than replacing it with a pointer, because a block a
// session can PASTE AND RUN with no clone is worth something a pointer cannot give. That decision
// was taken ON CONDITION that this check ships with it. Without this file, D-3 was the wrong call.
//
// ⚠ IT IS A PARSER, NOT A GREP, AND THAT IS THE POINT (§B1). A grep cannot tell a regex DEFINITION
// from a mention of one in prose, cannot see an alternation inside a template literal, and cannot
// EXECUTE a pattern to find out what it actually matches. A site is admitted here only if its
// pattern, executed, matches a canonical hash row AND encodes the extension set — a first draft
// required only the first condition and reported 35 sites, most of them generic patterns like
// /\d+/ that match the specimen by accident.
//
//   usage: node qa/tools/row_census.cjs [repo-root]      (default: two levels up from this file)
//   exit 0 = the copies agree · exit 1 = they have drifted · exit 2 = a site could not be found
//
// TOOLING. Asserts about the TREE, not the app. Counted in NO release check total (OPERATIONS §B1).
const fs = require("fs"), path = require("path");

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, "..", ".."));

// The specimen is a real row shape. Every admitted site must match it when executed.
const SPECIMEN = "| `t1_units.mjs` | `a707bbc47b28ba07f1e8dbdf3e9dd7fd` |";
const PY_SPEC  = "| `oracle_nm.py` | `49ea4b6a9d7661f87e190ff2d94c138b` |";

// The three copies that MUST agree, and where to find the alternation in each.
const SITES = [
  { name: "the gate",              file: "qa/tools/package_check.mjs" },
  { name: "manifest D-5 block",    file: "PROJECT_KNOWLEDGE_INDEX.md" },
  { name: "control ROW selector",  file: "qa/tools/controls_manifest_rows.py" },
];

// Pull the extension alternation out of a row-matching expression, wherever it lives. The anchor
// is the row SHAPE — a pipe, a backtick-quoted filename, a pipe, 32 hex — not the file's syntax,
// so this works identically in JS, in a Markdown code fence and in a Python raw string.
const EXTRACT = /\(\?:([A-Za-z0-9|]+)\)\)`\?\\s\*\\\|\\s\*`\?\(\[0-9a-f\]\{32\}\)/;

let fail = 0, sites = [];
for (const s of SITES) {
  const p = path.join(ROOT, s.file);
  if (!fs.existsSync(p)) { console.log(`  ✗ ${s.name}: ${s.file} not found`); process.exit(2); }
  const src = fs.readFileSync(p, "utf8");
  const m = src.match(EXTRACT);
  if (!m) {
    console.log(`  ✗ ${s.name}: no row-matching expression found in ${s.file}`);
    console.log(`     The expression moved or changed shape. This check is now blind to that site —`);
    console.log(`     repair it here rather than deleting the site from SITES.`);
    process.exit(2);
  }
  const exts = m[1];
  // Confirm the extracted set is real by BUILDING the matcher and executing it.
  const re = new RegExp("^\\|\\s*`?([A-Za-z0-9_.-]+\\.(?:" + exts + "))`?\\s*\\|\\s*`?([0-9a-f]{32})`?\\s*\\|");
  const line = src.split("\n").findIndex(l => l.includes("(?:" + exts + ")")) + 1;
  sites.push({ ...s, exts, line, matchesRow: re.test(SPECIMEN), matchesPy: re.test(PY_SPEC) });
}

console.log("row-matcher parity — the copies of K-8's hash-row expression");
for (const s of sites)
  console.log(`  ${s.file}:${s.line}\n     ${s.name.padEnd(22)} [${s.exts}]  executes-on-a-row=${s.matchesRow}  sees-.py=${s.matchesPy}`);

const distinct = [...new Set(sites.map(s => s.exts))];
if (distinct.length !== 1) {
  console.log(`\n  ✗ DRIFT: the ${sites.length} copies carry ${distinct.length} different extension sets.`);
  distinct.forEach(d => console.log(`      [${d}]  <- ${sites.filter(s => s.exts === d).map(s => s.file).join(", ")}`));
  console.log("  Widening one copy and not the others is the failure this file exists to catch.");
  fail = 1;
} else {
  console.log(`\n  ✓ all ${sites.length} copies carry the same set: [${distinct[0]}]`);
}

const bad = sites.filter(s => !s.matchesRow);
if (bad.length) {
  console.log(`  ✗ ${bad.length} site(s) do not match a canonical row when EXECUTED: ${bad.map(s => s.file).join(", ")}`);
  fail = 1;
}

// P32's selector is deliberately narrower (D-4). Named here so a future reader does not
// "fix" it, and so this check is not quietly widened to include it.
console.log("\n  (excluded, deliberately: qa/tools/package_check_controls.sh — P32's selector is");
console.log("   NARROWER on purpose; it only needs SOME corruptible row, not the widest set.");
console.log("   docs/SCOPE_HOUSEKEEPING_THREE.md carries the pre-D-C-1 loose form as history.)");

process.exit(fail);
