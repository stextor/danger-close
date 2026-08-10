// diverge.cjs — are the 7 taxable-residual sites the SAME expression?
// Normalizes away parameter/accumulator names, then hashes the structure.
// A pure-refactor consolidation is only safe if they are.
const { Parser } = require('acorn');
const jsx = require('acorn-jsx');
const fs = require('fs');
const crypto = require('crypto');

const src = fs.readFileSync(process.argv[2], 'utf8');
const P = Parser.extend(jsx());
const ast = P.parse(src, { ecmaVersion: 2022, sourceType: 'module', locations: true });

// Find every `.reduce(...)` CallExpression whose body mentions balance/roth/trad
const hits = [];
(function find(node, parent) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'CallExpression' && node.callee && node.callee.type === 'MemberExpression'
      && node.callee.property && node.callee.property.name === 'reduce') {
    const text = src.slice(node.start, node.end);
    if (/balance/.test(text) && /roth/.test(text) && /trad/.test(text)) {
      hits.push({ line: node.loc.start.line, node, text });
    }
  }
  for (const k of Object.keys(node)) {
    if (k === 'loc') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && find(c, node));
    else if (v && typeof v.type === 'string') find(v, node);
  }
})(ast, null);

// structural fingerprint: node types + operators + property names + literals,
// with all Identifier NAMES dropped (so s/t, p/q, acc naming can't create a false difference)
function fingerprint(node) {
  const parts = [];
  (function walk(n) {
    if (!n || typeof n.type !== 'string') return;
    parts.push(n.type);
    if (n.operator) parts.push('op:' + n.operator);
    if (n.type === 'MemberExpression' && !n.computed && n.property && n.property.name) parts.push('.' + n.property.name);
    if (n.type === 'Literal') parts.push('lit:' + JSON.stringify(n.value));
    for (const k of Object.keys(n)) {
      if (k === 'loc' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && walk(c));
      else if (v && typeof v.type === 'string') walk(v);
    }
  })(node);
  return crypto.createHash('md5').update(parts.join('|')).digest('hex').slice(0, 12);
}

console.log(`# ${hits.length} residual reduce() expressions\n`);
const groups = {};
for (const h of hits) {
  const fp = fingerprint(h.node);
  (groups[fp] = groups[fp] || []).push(h.line);
  const src1 = h.text.replace(/\s+/g, ' ');
  console.log(`L${String(h.line).padStart(5)}  fp=${fp}  ${src1.slice(0, 120)}${src1.length > 120 ? '…' : ''}`);
}
console.log('\n# grouped by structural fingerprint');
for (const [fp, lines] of Object.entries(groups)) {
  console.log(`  ${fp}  ×${lines.length}  lines ${lines.join(', ')}`);
}
console.log(`\nDISTINCT FORMS: ${Object.keys(groups).length}`);

// what does each site do with the value / what is it named?
console.log('\n# consumer of each site');
const lines = src.split('\n');
for (const h of hits) {
  const ln = lines[h.line - 1] || '';
  const m = ln.match(/(?:const|let)\s+(\w+)\s*=/) || ln.match(/(\w+)\s*:/);
  console.log(`  L${String(h.line).padStart(5)}  bound as: ${m ? m[1] : '(inline expression, not bound)'}`);
}
