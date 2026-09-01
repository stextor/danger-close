// Extract every regex literal + string literal across the suite by AST, then EXECUTE the
// regexes against a supplied old text and new text. §B1a: a grep can find a matcher but can
// never evaluate it. ASSERTS NOTHING.
// usage: node suite_regex_probe.cjs <oldTextFile> <newTextFile> <dir> [dir...]
const fs=require('fs'),path=require('path');
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
const OLD=fs.readFileSync(process.argv[2],'utf8').replace(/\n$/,'');
const NEW=fs.readFileSync(process.argv[3],'utf8').replace(/\n$/,'');
const regexes=[], vaStrings=[];
for(const d of process.argv.slice(4)){
 for(const f of fs.readdirSync(d)){
  if(!/\.(mjs|cjs)$/.test(f)) continue;
  if(/^(app_|dom_|fixture|DangerClose)/.test(f)) continue;
  const p=path.join(d,f); let ast;
  try{ ast=P.parse(fs.readFileSync(p,'utf8'),{ecmaVersion:'latest',sourceType:'module',locations:true}); }
  catch(e){ console.log(`  !! parse fail ${p}: ${e.message}`); continue; }
  walk.simple(ast,{
    Literal(n){
      if(n.regex){ regexes.push({file:f,line:n.loc.start.line,src:n.raw,
        pattern:n.regex.pattern,flags:n.regex.flags}); }
      else if(typeof n.value==='string' && /\bVA\b|Virginia/.test(n.value)){
        vaStrings.push({file:f,line:n.loc.start.line,val:n.value}); }
    },
    TemplateElement(n){
      const v=n.value&&n.value.cooked;
      if(v && /\bVA\b|Virginia/.test(v)) vaStrings.push({file:f,line:n.loc.start.line,val:v});
    }
  },B);
 }
}
console.log(`regex literals found across the suite: ${regexes.length}`);
const changed=[];
for(const r of regexes){
  let re; try{ re=new RegExp(r.pattern, r.flags.replace('g','')); }catch(e){ continue; }
  const a=re.test(OLD), b=re.test(NEW);
  if(a!==b) changed.push({...r,old:a,neu:b});
}
console.log(`\n== MATCHERS WHOSE VERDICT CHANGES between the old note and the new note ==`);
if(!changed.length) console.log('  (none)');
for(const c of changed) console.log(`  ${c.file}:${c.line}  ${c.src}   old=${c.old} new=${c.neu}`);
console.log(`\n== SUITE STRING/TEMPLATE LITERALS MENTIONING "VA" or "Virginia" ==`);
if(!vaStrings.length) console.log('  (none)');
for(const s of vaStrings) console.log(`  ${s.file}:${s.line}  ${JSON.stringify(s.val.slice(0,110))}`);
