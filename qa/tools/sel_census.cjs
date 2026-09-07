// AST census: every regex literal in the suite + tools whose source mentions "income limit"
// or "income-limited", i.e. every site that selects a state set by executing a pattern against
// user-facing copy. A grep cannot tell a definition from a mention or execute the pattern.
const fs=require('fs'),path=require('path');
const acorn=require('acorn'),jsx=require('acorn-jsx'),walk=require('acorn-walk');
const P=acorn.Parser.extend(jsx());
const hits=[];
for(const d of process.argv.slice(2)){
  for(const f of fs.readdirSync(d)){
    if(!/\.(mjs|cjs|jsx|js)$/.test(f)) continue;
    const p=path.join(d,f); let src;
    try{src=fs.readFileSync(p,'utf8');}catch{continue;}
    let ast; try{ast=P.parse(src,{ecmaVersion:'latest',sourceType:'module',locations:true});}catch{
      try{ast=P.parse(src,{ecmaVersion:'latest',sourceType:'script',locations:true});}catch{continue;}}
    walk.simple(ast,{Literal(n){
      if(n.regex && /income[\s\-\[\]\\]*limit/i.test(n.regex.pattern))
        hits.push(`${p}:${n.loc.start.line}  ${n.raw}`);
    }},Object.assign({},walk.base,{JSXElement(n,s,c){(n.children||[]).forEach(x=>c(x,s));if(n.openingElement)c(n.openingElement,s);},JSXFragment(n,s,c){(n.children||[]).forEach(x=>c(x,s));},JSXOpeningElement(n,s,c){(n.attributes||[]).forEach(a=>c(a,s));},JSXClosingElement(){},JSXAttribute(n,s,c){if(n.value)c(n.value,s);},JSXSpreadAttribute(n,s,c){if(n.argument)c(n.argument,s);},JSXExpressionContainer(n,s,c){c(n.expression,s);},JSXEmptyExpression(){},JSXText(){},JSXIdentifier(){},JSXMemberExpression(){},JSXNamespacedName(){}}));
  }
}
console.log(`sites executing an income-limit matcher: ${hits.length}`);
hits.forEach(h=>console.log('  '+h));
