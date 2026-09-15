// Execute t29's F-6 selection against STATE_RULES read by AST, with VA's note swapped for a
// candidate string. ASSERTS NOTHING — reports set membership so a wording choice can be checked
// before it ships. usage: node f6_probe.cjs <source.jsx> [candidateNoteFile]
//
// ⚠ REPAIRED 2026-09-15 (SCOPE_STATE_SET_SELECTOR §7.3). From v5.68 to this date the probe reported the
//   COMPLEMENT of the gate it probes: t29 gained `!r.exclTest` at v5.68 (D-VA-3) and this copy never did —
//   and it COULD not have, because the reader below kept only Literal values, so `exclTest` (an object or
//   function) was never recorded at all. Against v5.71 it printed "NM, RI, VA" while t29 F-6 was EMPTY.
//   Two fixes, both needed: the reader now records a non-literal value as a truthy marker, and the
//   selection is the SHARED one — `unconverted()` from state_sets.cjs — not a local copy.
//   qa/state_sets_check.mjs asserts this probe and t29 agree on each leg's source.
//
// ⚠ WHAT THE CANDIDATE NOTE CAN STILL TELL YOU. F-6 membership no longer depends on any note, so a
//   candidate VA note cannot move the F-6 set. What it can break is the PIN: t35 D-7c requires VA's note
//   to keep matching NOTE_MATCHER, and the drift guard requires no state OUTSIDE the in-law list to match.
const fs=require('fs');
const path=require('path');
const SETS=require([path.join(__dirname,'state_sets.cjs'),path.join(__dirname,'tools','state_sets.cjs')].find(fs.existsSync)||'./state_sets.cjs');
const acorn=require('acorn'),jsx=require('acorn-jsx'),walk=require('acorn-walk');
const P=acorn.Parser.extend(jsx());
const B=Object.assign({},walk.base,{
  JSXElement(n,s,c){(n.children||[]).forEach(x=>c(x,s));if(n.openingElement)c(n.openingElement,s);},
  JSXFragment(n,s,c){(n.children||[]).forEach(x=>c(x,s));},
  JSXOpeningElement(n,s,c){(n.attributes||[]).forEach(a=>c(a,s));},
  JSXClosingElement(){},JSXAttribute(n,s,c){if(n.value)c(n.value,s);},
  JSXSpreadAttribute(n,s,c){if(n.argument)c(n.argument,s);},
  JSXExpressionContainer(n,s,c){c(n.expression,s);},
  JSXEmptyExpression(){},JSXText(){},JSXIdentifier(){},JSXMemberExpression(){},JSXNamespacedName(){}});
const ast=P.parse(fs.readFileSync(process.argv[2],'utf8'),{ecmaVersion:'latest',sourceType:'module'});
let RULES=null;
walk.simple(ast,{VariableDeclarator(n){
  if(n.id&&n.id.name==='STATE_RULES'&&n.init&&n.init.type==='ObjectExpression'){
    RULES={};
    for(const p of n.init.properties){
      const code=p.key.name||p.key.value; const o={};
      if(p.value.type!=='ObjectExpression') continue;
      for(const q of p.value.properties){
        const k=q.key.name||q.key.value;
        if(q.value.type==='Literal') o[k]=q.value.value;
        else if(q.value.type==='UnaryExpression'&&q.value.argument.type==='Literal')
          o[k]=q.value.operator==='-'?-q.value.argument.value:q.value.argument.value;
        else o[k]={astNode:q.value.type};   // present but not a literal (e.g. exclTest) — truthy, as at runtime
      }
      RULES[code]=o;
    }
  }}},B);
if(!RULES){ console.log('STATE_RULES not found as a VariableDeclarator'); process.exit(1); }
console.log(`STATE_RULES entries parsed: ${Object.keys(RULES).length}`);
const F6=SETS.NOTE_MATCHER;
const sel=r=>SETS.unconverted(r);
const before=sel(RULES);
console.log(`\nF-6 guarded set, AS SHIPPED : ${before.length} -> ${before.join(', ')}`);
const drift=SETS.proseSelected(RULES);
console.log(`drift (outside IN_LAW, excl65>0, note matches) : ${drift.length} -> ${drift.join(', ')}`);
if(process.argv[3]){
  const cand=fs.readFileSync(process.argv[3],'utf8').replace(/\n$/,'');
  const R2=JSON.parse(JSON.stringify(RULES)); R2.VA.note=cand;
  const after=sel(R2);
  console.log(`F-6 guarded set, WITH CANDIDATE VA NOTE : ${after.length} -> ${after.join(', ')}`);
  console.log(`\ncandidate matches NOTE_MATCHER    : ${F6.test(cand)}  (must be true — t35 D-7c)`);
  console.log(`candidate matches t10 L470 /\\$\\d/ : ${/\$\d/.test(cand)}`);
  console.log(`candidate trips t10 L497 ss-taxed: ${/\bss (is )?taxed|taxes social security/i.test(cand)}  (must be false)`);
  console.log(`VA in F-6 set (expected false once VA carries exclTest): ${after.includes('VA')}`);
  console.log(`set size unchanged               : ${before.length===after.length}`);
}
