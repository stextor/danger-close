// census.cjs — parser-based site census. NO GREPS.
// usage: node census.cjs <file> <name> [--kind=any|prop|ident]
const { Parser } = require('acorn');
const jsx = require('acorn-jsx');
const walk = require('acorn-walk');
const fs = require('fs');

const file = process.argv[2];
const target = process.argv[3];
const kindArg = (process.argv.find(a => a.startsWith('--kind=')) || '--kind=any').split('=')[1];

const src = fs.readFileSync(file, 'utf8');
const P = Parser.extend(jsx());
const ast = P.parse(src, { ecmaVersion: 2022, sourceType: 'module', locations: true, ranges: true });

// ---- build function-range index so every hit can be attributed to an enclosing scope ----
const funcs = [];
const base = walk.make({ JSXElement: () => {}, JSXFragment: () => {} });
// need to traverse JSX children too; supply visitors
const jsxBase = Object.assign({}, walk.base, {
  JSXElement(node, st, c) { (node.children || []).forEach(ch => c(ch, st)); if (node.openingElement) c(node.openingElement, st); },
  JSXFragment(node, st, c) { (node.children || []).forEach(ch => c(ch, st)); },
  JSXOpeningElement(node, st, c) { (node.attributes || []).forEach(a => c(a, st)); },
  JSXAttribute(node, st, c) { if (node.value) c(node.value, st); },
  JSXSpreadAttribute(node, st, c) { if (node.argument) c(node.argument, st); },
  JSXExpressionContainer(node, st, c) { c(node.expression, st); },
  JSXEmptyExpression() {},
  JSXText() {},
  JSXIdentifier() {},
  JSXMemberExpression() {},
});

function nameOfFunc(node, parent) {
  if (node.id && node.id.name) return node.id.name;
  if (parent) {
    if (parent.type === 'VariableDeclarator' && parent.id && parent.id.name) return parent.id.name;
    if (parent.type === 'Property' && parent.key) return parent.key.name || parent.key.value;
    if (parent.type === 'AssignmentExpression' && parent.left && parent.left.type === 'Identifier') return parent.left.name;
    if (parent.type === 'MethodDefinition' && parent.key) return parent.key.name;
  }
  return '<anon>';
}

(function collect(node, parent) {
  if (!node || typeof node.type !== 'string') return;
  if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(node.type)) {
    funcs.push({ name: nameOfFunc(node, parent), start: node.start, end: node.end,
                 line: node.loc.start.line, endLine: node.loc.end.line, type: node.type });
  }
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'range' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && collect(c, node));
    else if (v && typeof v.type === 'string') collect(v, node);
  }
})(ast, null);

funcs.sort((a, b) => (a.end - a.start) - (b.end - b.start)); // innermost first

function enclosing(pos) {
  const chain = funcs.filter(f => f.start <= pos && pos < f.end).slice(0, 3).map(f => `${f.name}@${f.line}`);
  return chain.length ? chain.join(' < ') : '<module>';
}

// ---- find hits ----
const hits = [];
(function find(node, parent) {
  if (!node || typeof node.type !== 'string') return;
  let match = null;
  if (node.type === 'Identifier' && node.name === target) {
    const isProp = parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed;
    const isKey = parent && parent.type === 'Property' && parent.key === node && !parent.computed;
    if (isProp) match = 'prop';
    else if (isKey) match = 'objkey';
    else match = 'ident';
  } else if (node.type === 'Literal' && typeof node.value === 'string' && node.value === target) {
    match = 'string';
  }
  if (match && (kindArg === 'any' || kindArg === match)) {
    const line = node.loc.start.line;
    const lineText = src.split('\n')[line - 1] || '';
    hits.push({ line, col: node.loc.start.column, kind: match, scope: enclosing(node.start),
                snippet: lineText.length > 4000 ? '[LONG LINE: ' + lineText.slice(Math.max(0, node.loc.start.column - 90), node.loc.start.column + 90) + ']' : lineText.trim().slice(0, 200) });
  }
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'range' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && find(c, node));
    else if (v && typeof v.type === 'string') find(v, node);
  }
})(ast, null);

hits.sort((a, b) => a.line - b.line || a.col - b.col);
console.log(`# census of "${target}" in ${file} — ${hits.length} AST hits (kind=${kindArg})`);
for (const h of hits) console.log(`L${String(h.line).padStart(5)}  ${h.kind.padEnd(6)}  ${h.scope.padEnd(46)}  ${h.snippet}`);
