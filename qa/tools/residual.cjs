// residual.cjs — find every "taxable residual" expression structurally: a subtraction
// whose operand set mentions both `roth` and `trad` properties. NO GREPS.
const { Parser } = require('acorn');
const jsx = require('acorn-jsx');
const fs = require('fs');
const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');
const lines = src.split('\n');
const P = Parser.extend(jsx());
const ast = P.parse(src, { ecmaVersion: 2022, sourceType: 'module', locations: true });

// index enclosing functions
const funcs = [];
function nameOfFunc(node, parent) {
  if (node.id && node.id.name) return node.id.name;
  if (parent && parent.type === 'VariableDeclarator' && parent.id && parent.id.name) return parent.id.name;
  return '<anon>';
}
(function collect(node, parent) {
  if (!node || typeof node.type !== 'string') return;
  if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(node.type))
    funcs.push({ name: nameOfFunc(node, parent), start: node.start, end: node.end, line: node.loc.start.line });
  for (const k of Object.keys(node)) {
    if (k === 'loc') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && collect(c, node));
    else if (v && typeof v.type === 'string') collect(v, node);
  }
})(ast, null);
funcs.sort((a, b) => (a.end - a.start) - (b.end - b.start));
const enclosing = pos => (funcs.filter(f => f.start <= pos && pos < f.end).slice(0, 2).map(f => `${f.name}@${f.line}`).join(' < ') || '<module>');

// collect property names mentioned inside a subtree
function propsIn(node, acc = new Set()) {
  if (!node || typeof node.type !== 'string') return acc;
  if (node.type === 'MemberExpression' && !node.computed && node.property && node.property.name) acc.add(node.property.name);
  if (node.type === 'Identifier') acc.add(node.name);
  for (const k of Object.keys(node)) {
    if (k === 'loc') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && propsIn(c, acc));
    else if (v && typeof v.type === 'string') propsIn(v, acc);
  }
  return acc;
}

const hits = [];
(function find(node) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'BinaryExpression' && node.operator === '-') {
    const names = propsIn(node);
    if (names.has('roth') && names.has('trad') && names.has('balance')) {
      const line = node.loc.start.line;
      const raw = lines[line - 1] || '';
      hits.push({ line, scope: enclosing(node.start),
        text: raw.length > 3000 ? '[LONG LINE @col' + node.loc.start.column + '] ' + raw.slice(Math.max(0, node.loc.start.column - 60), node.loc.start.column + 140) : raw.trim().slice(0, 190) });
    }
  }
  for (const k of Object.keys(node)) {
    if (k === 'loc') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && find(c));
    else if (v && typeof v.type === 'string') find(v);
  }
})(ast);

// de-dupe nested subtractions on the same line+scope (a-b-c parses as two BinaryExpressions)
const seen = new Set();
const uniq = hits.filter(h => { const k = h.line + '|' + h.scope; if (seen.has(k)) return false; seen.add(k); return true; });
uniq.sort((a, b) => a.line - b.line);
console.log(`# taxable-residual expressions (balance − roth − trad) in ${file}: ${uniq.length} distinct sites (${hits.length} raw nodes)`);
for (const h of uniq) console.log(`L${String(h.line).padStart(5)}  ${h.scope.padEnd(44)}  ${h.text}`);
