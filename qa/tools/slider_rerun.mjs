// Slider sensitivity, RE-RUN 2026-08-20 with dobA = 1964 (MASTER_PROMPT L151 via _parseDOB)
// and the ssAstartMonth fix. Supersedes MEASUREMENT rev 1 §3, which used dobA 1963 and the
// buggy `12 - ssAmo + 1` partial-month expression.
import { runLadder } from "./ladder_hand.mjs";
const usd=n=>(n<0?"-":"")+"$"+Math.round(Math.abs(n)).toLocaleString();
const taper=(yr,r)=>{const k=yr-r;return k===0?20000:k===1?18000:k===2?15000:0;};
const HH1={dobA:1964,dobB:1966,retireYear:2029,ssAmo:3300,ssAage:67,ssAstartMonth:1,
  ssBmo:1300,ssBage:63,pensionMo:400,tradInitA:1180000,tradInitB:218600,
  rmdShareA:1.0,rmdShareB:0.967978,taxableSleeve:21000,divYieldPct:2.0,workTaper:taper};
// App's OWN rendered tier-1 thresholds, read off the Roth tab this session
const THR={2029:241e3,2030:246e3,2031:250e3,2032:255e3,2033:261e3,2034:266e3,
           2035:271e3,2036:276e3,2037:282e3,2038:288e3,2039:293e3,2040:299e3};

console.log("SLIDER SENSITIVITY — shipped example household, dobA 1964 (CORRECTED)");
console.log("slider      net error      SS term      RMD term     yrs over  yrs under  tier flips");
for(const amt of [0,5000,10000,15000,20000,25000,30000,40000,50000,60000,70000,100000,150000,200000,300000,400000]){
  const r=runLadder({...HH1,rothAmount:amt});
  const s=k=>r.rows.reduce((a,b)=>a+b[k],0);
  const over=r.rows.filter(x=>x.delta>0).length, under=r.rows.filter(x=>x.delta<0).length;
  const flips=r.rows.filter(x=>(x.magi_apptab>THR[x.year])!==(x.magi_hand>THR[x.year])).length;
  console.log((usd(amt)+(amt===70000?"*":"")).padEnd(12),
    ((s("delta")>=0?"+":"")+usd(s("delta"))).padEnd(15),
    ((s("dSS")>=0?"+":"")+usd(s("dSS"))).padEnd(13),
    usd(s("dRMD")).padEnd(13), String(over).padEnd(10), String(under).padEnd(11), String(flips));
}
console.log("* = shipped default\n");
console.log("Sign changes across the full slider range ($0-$400,000, step $5,000 per L8974):");
let prev=null; const flips=[];
for(let a=0;a<=400000;a+=5000){
  const r=runLadder({...HH1,rothAmount:a});
  const net=r.rows.reduce((s,x)=>s+x.delta,0);
  if(prev!==null && Math.sign(net)!==Math.sign(prev.net)) flips.push([prev.amt,prev.net,a,net]);
  prev={amt:a,net};
}
if(flips.length) flips.forEach(([a1,n1,a2,n2])=>
  console.log(`   between ${usd(a1)} (${(n1>=0?"+":"")+usd(n1)}) and ${usd(a2)} (${(n2>=0?"+":"")+usd(n2)})`));
else console.log("   NONE — the net error keeps one sign across the whole slider range");
