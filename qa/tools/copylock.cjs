// copylock.cjs — the §B1a instrument. Extracts every regex literal in the suite by AST and
// EXECUTES each against the old and the new copy. A grep can find a matcher; it cannot evaluate one.
// usage: node copylock.cjs <oldSrc.jsx> <newSrc.jsx> <suiteDir> [suiteDir2 ...]
const fs = require('fs'), path = require('path');
const acorn = require('acorn'), jsx = require('acorn-jsx'), walk = require('acorn-walk');
const P = acorn.Parser.extend(jsx());
const jsxBase = Object.assign({}, walk.base, {
  JSXElement(node, st, c) { (node.children || []).forEach(ch => c(ch, st)); if (node.openingElement) c(node.openingElement, st); },
  JSXFragment(node, st, c) { (node.children || []).forEach(ch => c(ch, st)); },
  JSXOpeningElement(node, st, c) { (node.attributes || []).forEach(a => c(a, st)); },
  JSXClosingElement() {}, JSXAttribute(node, st, c) { if (node.value) c(node.value, st); },
  JSXSpreadAttribute(node, st, c) { if (node.argument) c(node.argument, st); },
  JSXExpressionContainer(node, st, c) { c(node.expression, st); },
  JSXEmptyExpression() {}, JSXText() {}, JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {},
});

const [, , OLD, NEW, ...DIRS] = process.argv;

// ---- gather the copy strings that v5.56 touched, from BOTH builds ----
function strings(file) {
  const src = fs.readFileSync(file, 'utf8');
  const out = [];
  const ast = P.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  walk.simple(ast, {
    Literal(n) { if (typeof n.value === 'string') out.push(n.value); },
    TemplateElement(n) { if (n.value && n.value.cooked) out.push(n.value.cooked); },
  }, jsxBase);
  return out;
}
const oldS = strings(OLD), newS = strings(NEW);
const oldSet = new Set(oldS), newSet = new Set(newS);
// copy that EXISTS on one build only = the text this release added or removed
const removed = oldS.filter(s => !newSet.has(s) && s.length > 40);
const added = newS.filter(s => !oldSet.has(s) && s.length > 40);

// ---- collect every regex literal in the suite ----
const files = [];
for (const d of DIRS) for (const f of fs.readdirSync(d)) {
  if (!/\.(mjs|cjs|js|jsx)$/.test(f)) continue;
  // exclude build artifacts and the app copy that sits at the run-folder qa/ root
  if (/^(DangerClose|app_|dom_|fixture)/.test(f)) continue;
  files.push(path.join(d, f));
}
const regexes = [];
for (const f of files) {
  let ast;
  try { ast = P.parse(fs.readFileSync(f, 'utf8'), { ecmaVersion: 'latest', sourceType: 'module', locations: true }); }
  catch (e) { console.log(`!! unparsed ${f}: ${e.message}`); continue; }
  walk.simple(ast, {
    Literal(n) {
      if (n.regex) regexes.push({ file: path.basename(f), line: n.loc.start.line, src: n.raw, re: n.regex });
    },
  }, jsxBase);
}
console.log(`# ${regexes.length} regex literals across ${files.length} suite files`);
console.log(`# copy strings >40 chars: ${removed.length} removed by this release, ${added.length} added\n`);

function build(r) { try { return new RegExp(r.re.pattern, r.re.flags.replace('g', '')); } catch { return null; } }

// A matcher is a CANDIDATE LOCK if it matched text the release REMOVED and matches nothing added.
console.log('== CANDIDATE LOCKS: matcher hits copy this release DELETED ==');
let n = 0;
for (const r of regexes) {
  const re = build(r); if (!re) continue;
  const hitOld = removed.filter(s => re.test(s));
  if (!hitOld.length) continue;
  const hitNew = added.filter(s => re.test(s));
  n++;
  console.log(`\n[${n}] ${r.file}:${r.line}  ${r.src}`);
  console.log(`    matched ${hitOld.length} removed string(s); ${hitNew.length} added string(s)`);
  for (const s of hitOld.slice(0, 2)) console.log(`    OLD> ${s.slice(0, 150).replace(/\s+/g, ' ')}`);
  if (!hitNew.length) console.log(`    ⚠ NO added string matches — this matcher has lost its text.`);
  else for (const s of hitNew.slice(0, 1)) console.log(`    NEW> ${s.slice(0, 150).replace(/\s+/g, ' ')}`);
}
if (!n) console.log('  (none)');
