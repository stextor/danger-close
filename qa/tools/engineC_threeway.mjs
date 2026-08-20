import { runLadder } from "./ladder_hand.mjs";
import { __g, __engines } from "./qa/app_v540.mjs";
const usd=n=>(n<0?"-":"")+"$"+Math.round(Math.abs(n)).toLocaleString();
const taper=(yr,r)=>{const k=yr-r;return k===0?20000:k===1?18000:k===2?15000:0;};
const tl=__g.PLAN_TIMELINE();
console.log("RESOLVED household:", "dobA", tl.dobA.year+"-"+tl.dobA.month, "dobB", tl.dobB.year+"-"+tl.dobB.month,
  "| ladder", tl.rothLadderStart,"->",tl.rothLadderEnd, "| SS A", tl.ssA_date.year, "B", tl.ssB_date.year);

// HH1 CORRECTED: dobA 1964-01 (from MASTER_PROMPT, not the L641 fallback), dobB 1966-01
const HH1={dobA:1964,dobB:1966,retireYear:2029,ssAmo:3300,ssAage:67,ssAstartMonth:1,
  ssBmo:1300,ssBage:63,pensionMo:400,tradInitA:1180000,tradInitB:218600,
  rmdShareA:1.0,rmdShareB:0.967978,taxableSleeve:21000,divYieldPct:2.0,   // 21k brokerage + 15k HSA
  rothAmount:70000,workTaper:taper};

const r=runLadder({...HH1});
const _p=__engines.computeIrmaaPlan({retireYear:2029,rothAmount:70000,qcdAnnual:0,taxYield:2.0});
const plan=Array.isArray(_p)?_p:(_p.rows||_p.years||[]);
const C=Object.fromEntries(plan.map(x=>[x.yr,x]));

console.log(`\nladder ${HH1.retireYear}..${r.ladderEnd}  endA ${r.endA} endB ${r.endB}  SSA ${r.ssAyear} SSB ${r.ssByear}`);
console.log("\nyear   conv      RMD        taxSS app   taxSS law   MAGI app     MAGI law     EngineC      law-EngC   app-law");
for(const x of r.rows){
  const c=C[x.year];
  console.log(String(x.year).padEnd(6),usd(x.conv).padEnd(9),usd(x.rmd).padEnd(10),
    usd(x.taxableSS_apptab).padEnd(11),usd(x.taxableSS_hand).padEnd(11),
    usd(x.magi_apptab).padEnd(12),usd(x.magi_hand).padEnd(12),
    usd(c?c.magi:0).padEnd(12),
    (c?((x.magi_hand-c.magi>=0?"+":"")+usd(x.magi_hand-c.magi)):"-").padEnd(10),
    (x.delta>=0?"+":"")+usd(x.delta));
}
const s=k=>r.rows.reduce((a,b)=>a+b[k],0);
console.log("\nTERM DECOMPOSITION (app minus law), "+r.rows.length+" years:");
console.log("  SS treatment      "+usd(s("dSS")));
console.log("  omitted RMD       "+usd(s("dRMD")));
console.log("  omitted dividends "+usd(s("dDiv")));
console.log("  omitted gains     "+usd(s("dGain")));
console.log("  NET               "+((s("delta")>=0?"+":"")+usd(s("delta"))));
console.log("  years over/under/exact: "+r.rows.filter(x=>x.delta>0).length+"/"+r.rows.filter(x=>x.delta<0).length+"/"+r.rows.filter(x=>x.delta===0).length);
