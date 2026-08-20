import { runLadder } from "./ladder_hand.mjs";
const usd=n=>(n<0?"-":"")+"$"+Math.round(Math.abs(n)).toLocaleString();
const taper=()=>0;   // no example-data taper: HH3 uses explicit streams
// The app's OWN rendered tier-1 thresholds for ladder years 2029..2040 ($K), read off the
// Roth tab this session ("Thr $XXXK"). Using these instead of my own indexation makes the
// tier test a statement about the app's behaviour rather than about my assumptions.
const THR = {2029:241e3,2030:246e3,2031:250e3,2032:255e3,2033:261e3,2034:266e3,
             2035:271e3,2036:276e3,2037:282e3,2038:288e3,2039:293e3,2040:299e3};

// HH3 — built to STRADDLE. Same 1959/1962 split RMD ages as HH2 (five tail years), but
// scaled so the app's figure sits UNDER the tier-1 edge while the statutory figure sits OVER.
const HH3={dobA:1959,dobB:1962,retireYear:2029,ssAmo:3800,ssAage:67,ssAstartMonth:1,
  ssBmo:2000,ssBage:63,pensionMo:3000,tradInitA:2600000,tradInitB:400000,
  rmdShareA:1.0,rmdShareB:1.0,taxableSleeve:1500000,divYieldPct:2.0,
  realizedGainByYear:Object.fromEntries([...Array(8)].map((_,i)=>[2029+i,60000])),
  rothAmount:120000,workTaper:taper};

const r=runLadder(HH3);
console.log("HH3 — constructed to straddle the tier-1 edge");
console.log(`ladder ${HH3.retireYear}..${r.ladderEnd}  endA ${r.endA} endB ${r.endB}  RMD tail years: ${r.rows.filter(x=>x.rmd>0).map(x=>x.year).join(", ")}`);
console.log("\nyear   RMD        div      gain     MAGI app     MAGI law     app thr      app>thr?  law>thr?  VERDICT DIFFERS");
let differ=0;
for(const x of r.rows){
  const t=THR[x.year];
  const a=x.magi_apptab>t, l=x.magi_hand>t;
  if(a!==l) differ++;
  console.log(String(x.year).padEnd(6),usd(x.rmd).padEnd(10),usd(x.dividends).padEnd(8),usd(x.gains).padEnd(8),
    usd(x.magi_apptab).padEnd(12),usd(x.magi_hand).padEnd(12),usd(t).padEnd(12),
    (a?"YES":"no").padEnd(9),(l?"YES":"no").padEnd(9), a!==l?"*** YES ***":"");
}
console.log(`\nladder years where the IRMAA WARNING DIFFERS: ${differ} of ${r.rows.length}`);
const s=k=>r.rows.reduce((a,b)=>a+b[k],0);
console.log(`net MAGI error ${usd(s("delta"))}  (SS ${usd(s("dSS"))}, RMD ${usd(s("dRMD"))}, div ${usd(s("dDiv"))}, gain ${usd(s("dGain"))})`);
