// Execute t29's F-6 selection against STATE_RULES read by AST, with VA's note swapped for a
// candidate string. ASSERTS NOTHING — reports set membership so a wording choice can be checked
// before it ships. usage: node f6_probe.cjs <source.jsx> [candidateNoteFile]
const fs=require('fs');
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
      }
      RULES[code]=o;
    }
  }}},B);
if(!RULES){ console.log('STATE_RULES not found as a VariableDeclarator'); process.exit(1); }
console.log(`STATE_RULES entries parsed: ${Object.keys(RULES).length}`);
const F6=/income[- ]limited|income limit/i;
const sel=r=>Object.entries(r).filter(([,v])=>(v.excl65||0)>0 && F6.test(v.note||'')).map(([c])=>c);
const before=sel(RULES);
console.log(`\nF-6 guarded set, AS SHIPPED : ${before.length} -> ${before.join(', ')}`);
if(process.argv[3]){
  const cand=fs.readFileSync(process.argv[3],'utf8').replace(/\n$/,'');
  const R2=JSON.parse(JSON.stringify(RULES)); R2.VA.note=cand;
  const after=sel(R2);
  console.log(`F-6 guarded set, WITH CANDIDATE VA NOTE : ${after.length} -> ${after.join(', ')}`);
  console.log(`\ncandidate matches F-6            : ${F6.test(cand)}`);
  console.log(`candidate matches t10 L470 /\\$\\d/ : ${/\$\d/.test(cand)}`);
  console.log(`candidate trips t10 L497 ss-taxed: ${/\bss (is )?taxed|taxes social security/i.test(cand)}  (must be false)`);
  console.log(`VA membership preserved          : ${after.includes('VA')}`);
  console.log(`set size unchanged               : ${before.length===after.length}`);
}
