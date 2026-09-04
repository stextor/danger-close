// state_rows.cjs — AST dump of `STATE_RULES` rows and field frequencies. NO GREPS.
//
// WHAT IT ANSWERS. "What does state X actually carry?", "how many entries are there?", "which
// optional fields exist and on how many states?" — and it answers them by parsing, so a note
// containing a brace, a dollar sign or an apostrophe reads correctly, and a field name that also
// appears in a comment or inside the one-line DOCS_HTML blob is not counted.
//
// WHY IT EXISTS. `census.cjs` finds identifiers with their scope chain and `funcmap.cjs` finds
// function ranges, but neither prints the CONTENTS of a table entry. Every state-tax scope so far
// has needed exactly that — the shipped note text, the excl65 figure, which states carry `exclAge`
// — and has otherwise got it from a grep, which cannot see where one entry ends and the next
// begins. The v5.54 INCOME-LIMITED miss (OPERATIONS §B1a) is the same class of error one level up.
//
// ⚠ NOT COVERED BY `t21`. OPERATIONS §B1 says an unexpected result from a `qa/tools/` script is a
// finding on its own — but ONLY while that script's own suite is green, and `t21` covers the four
// original tools against `qa/tools/fixture/fixture.jsx`, not this one. So treat what this prints as
// a LEAD, not a verdict: read the source at the line numbers it gives you before quoting it in a
// scope. Adopting it properly means adding fixture cases and t21 expectations, hand-counted first;
// that has not been done. (`t21`'s fixture line numbers are load-bearing — append only.)
//
// ASSERTS NOTHING. Counted in no release's check total (OPERATIONS §B1).
//
// USAGE
//   node qa/tools/state_rows.cjs <file.jsx> [CODE ...]
//     node qa/tools/state_rows.cjs src/DangerClose.jsx            # every entry
//     node qa/tools/state_rows.cjs src/DangerClose.jsx NM RI VA   # just these
//     node qa/tools/state_rows.cjs src/DangerClose.jsx --fields   # frequencies only, no rows
//   Run from a directory where `acorn`, `acorn-jsx` and `acorn-walk` resolve (OPERATIONS §B setup
//   step 1 installs all three).

const fs = require("fs");
const acorn = require("acorn");
const jsx = require("acorn-jsx");
const walk = require("acorn-walk");

const TABLE = "STATE_RULES";

const argv = process.argv.slice(2);
const file = argv[0];
if (!file) {
  console.error("usage: node state_rows.cjs <file.jsx> [CODE ...] [--fields]");
  process.exit(2);
}
const fieldsOnly = argv.includes("--fields");
const want = new Set(argv.slice(1).filter((a) => !a.startsWith("--")));

let src;
try {
  src = fs.readFileSync(file, "utf8");
} catch (e) {
  console.error(`cannot read ${file}: ${e.message}`);
  process.exit(2);
}

const ast = acorn.Parser.extend(jsx()).parse(src, {
  ecmaVersion: "latest",
  sourceType: "module",
  locations: true,
});

// acorn-walk has no visitors for JSX nodes and throws on the first one it meets. Same base
// visitor census.cjs uses — traverse children and attributes, ignore the leaf JSX node types.
const jsxBase = Object.assign({}, walk.base, {
  JSXElement(n, st, c) { (n.children || []).forEach((ch) => c(ch, st)); if (n.openingElement) c(n.openingElement, st); },
  JSXFragment(n, st, c) { (n.children || []).forEach((ch) => c(ch, st)); },
  JSXOpeningElement(n, st, c) { (n.attributes || []).forEach((a) => c(a, st)); },
  JSXClosingElement() {},
  JSXAttribute(n, st, c) { if (n.value) c(n.value, st); },
  JSXSpreadAttribute(n, st, c) { if (n.argument) c(n.argument, st); },
  JSXExpressionContainer(n, st, c) { c(n.expression, st); },
  JSXEmptyExpression() {}, JSXText() {}, JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {},
});

// The table is `const STATE_RULES = { ... }`. Collect every match rather than the first, so a
// second declaration anywhere in the file is visible instead of silently shadowed.
const found = [];
walk.simple(ast, {
  VariableDeclarator(n) {
    if (n.id.type === "Identifier" && n.id.name === TABLE && n.init && n.init.type === "ObjectExpression") found.push(n.init);
  },
}, jsxBase);

if (found.length === 0) {
  console.error(`no \`const ${TABLE} = { ... }\` object literal found in ${file}`);
  process.exit(1);
}
if (found.length > 1) {
  console.log(`⚠ ${found.length} \`${TABLE}\` object literals found, at L${found.map((f) => f.loc.start.line).join(", L")} — dumping the FIRST. That is a finding; read the source.`);
}
const table = found[0];

// A literal prints as its value; anything else prints as its node type in angle brackets, so a
// computed or spread value is visible as "not a literal" rather than rendered as undefined.
const show = (v) => {
  if (v.type === "Literal") return JSON.stringify(v.value);
  if (v.type === "UnaryExpression" && v.argument.type === "Literal") return `${v.operator}${JSON.stringify(v.argument.value)}`;
  return `<${v.type}>`;
};
const keyOf = (p) => (p.key.type === "Identifier" ? p.key.name : p.key.value);

console.log(`${TABLE} at L${table.loc.start.line} in ${file} — ${table.properties.length} entries`);

const freq = Object.create(null);
const shapes = Object.create(null); // field -> set of value node types, so a non-scalar is obvious
let dumped = 0;

for (const entry of table.properties) {
  if (entry.type !== "Property" || entry.value.type !== "ObjectExpression") {
    console.log(`\n⚠ L${entry.loc.start.line}: entry is a ${entry.type}/${entry.value ? entry.value.type : "?"}, not a plain object — read it by hand`);
    continue;
  }
  const code = keyOf(entry);
  for (const f of entry.value.properties) {
    const k = keyOf(f);
    freq[k] = (freq[k] || 0) + 1;
    (shapes[k] || (shapes[k] = new Set())).add(f.value.type);
  }
  if (fieldsOnly) continue;
  if (want.size && !want.has(code)) continue;
  dumped++;
  console.log(`\n=== ${code} (L${entry.loc.start.line}) ===`);
  for (const f of entry.value.properties) console.log(`  ${keyOf(f)} = ${show(f.value)}`);
}

if (want.size && !fieldsOnly) {
  const missing = [...want].filter((c) => !table.properties.some((p) => p.type === "Property" && keyOf(p) === c));
  if (missing.length) console.log(`\n⚠ requested but NOT PRESENT in ${TABLE}: ${missing.join(", ")}`);
  console.log(`\n(${dumped} of ${want.size} requested entries dumped)`);
}

console.log(`\n-- field frequencies over ${table.properties.length} entries --`);
Object.entries(freq)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .forEach(([k, n]) => {
    const types = [...shapes[k]].sort();
    const flag = types.some((t) => t !== "Literal" && t !== "UnaryExpression") ? "  ⚠ non-scalar" : "";
    console.log(`  ${k}: ${n}${n === table.properties.length ? " (all)" : ""}  [${types.join("|")}]${flag}`);
  });
