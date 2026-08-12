// t10 — SECTION C / PHASE 2A: FEDERAL CORE, dollar-exact against Engine A (runRothStrategies).
// Build under audit: v5.10.2 (md5 7ddda3585abb9dc2c40fa4fbfc46967a).
// Constants verified against IRS Rev. Proc. 2025-32 (IR-2025-103), IRC §1411 (NIIT), IRC §86 (SS).
// The engine accumulates EXACT per-year tax and Math.round()s the reported total once (L3640),
// so expected values are Math.round(exact) — the engine's whole-dollar output must equal the
// hand figure rounded to whole dollars. See FlawsToFix-v5_10_2-Phase2A.md appendix for longhand.
//
// HARNESS (D-1): single-year isolation. retireYr=horizonYr=asOfYr=2026 => one loop pass, so a
// strategy's totTax == that year's total tax. Neutralized so totTax == the federal figure tested:
//   streams: one {monthly:0} stream => spouseBWorkTaper() suppressed AND $0 added
//   state 0, no work (no FICA), income below AMT exemption, no MAGI two years prior (no IRMAA),
//   tradInit 0 => conv 0 for every policy (read strategy "none").
let seed = 1;
Math.random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const VER = process.argv[2] || "v5102";
const g = (await import(`./app_${VER}.mjs`)).__g;
g.setPortfolio({ positions: [], stateCode: null,
  incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });

let pass = 0, fail = 0; const fails = [];
const EPS = 0.01;
const T = (name, got, exp) => { const ok = Math.abs(got - exp) < EPS;
  if (ok) pass++; else { fail++; fails.push(`  ✗ ${name}: got ${got}  exp ${exp}  Δ ${(got-exp).toFixed(4)}`); } };
const R = Math.round;

// ── IRS-verified 2026 constants (independent copy from primary source, NOT from the app) ──
const STD = { S: 16100, M: 32200 }, SR = { S: 2050, M: 1650 };
const BR = {
  S: [[0.10,12400],[0.12,50400],[0.22,105700],[0.24,201775],[0.32,256225],[0.35,640600],[0.37,Infinity]],
  M: [[0.10,24800],[0.12,100800],[0.22,211400],[0.24,403550],[0.32,512450],[0.35,768700],[0.37,Infinity]] };
const LT = { S:[[0.0,49450],[0.15,545500],[0.20,Infinity]], M:[[0.0,98900],[0.15,613700],[0.20,Infinity]] };
const NIIT = { S: 200000, M: 250000 };
const SS_T1 = { S: 25000, M: 32000 }, SS_T2 = { S: 34000, M: 44000 };
const fedRef = (ti, st) => { if (ti<=0) return 0; let tax=0, prev=0; for (const [r,u] of BR[st]) { const s=Math.min(ti,u)-prev; if (s>0) tax+=s*r; prev=u; if (ti<=u) break; } return tax; };
const ltcgRef = (gg, ord, st) => { if (gg<=0) return 0; let tax=0, stk=ord, rem=gg; for (const [r,u] of LT[st]) { if (stk>=u) continue; const s=Math.min(rem,u-stk); if (s>0){tax+=s*r; rem-=s; stk+=s;} if (rem<=0) break; } return tax; };
const ssRef = (ss, other, st) => { const p=other+0.5*ss, t1=SS_T1[st], t2=SS_T2[st]; if (p<=t1) return 0; if (p<=t2) return Math.min(0.5*(p-t1),0.5*ss); return Math.min(0.85*ss, 0.5*Math.min(p-t1,t2-t1)+0.85*(p-t2)); };

console.log(`t10 — SECTION C 2A federal core (${VER})`);
// Longhand literal anchors: cumulative tax at each bracket top, hand-worked in the appendix.
for (const [ti,lit] of [[12400,1240],[50400,5800],[105700,17966],[201775,41024],[256225,58448],[640600,192979.25]])
  T(`ANCHOR SGL fedRef(${ti})=${lit}`, fedRef(ti,"S"), lit);
for (const [ti,lit] of [[24800,2480],[100800,11600],[211400,35932],[403550,82048],[512450,116896],[768700,206583.5]])
  T(`ANCHOR MFJ fedRef(${ti})=${lit}`, fedRef(ti,"M"), lit);

const baseSingle = (o={}) => ({ single:true, asOfYr:2026, retireYr:2026, horizonYr:2026, ladderEnd:2026, ladderEndA:2026, ladderEndB:2026,
  dobAYr:1966, dobBYr:1966, deathYr1:Infinity, survivor:"A", ssA:0, ssB:0, ssAYr:2040, ssAMo:1, ssBYr:2040, ssBMo:1,
  pen:0, stateRate:0, stateCode:null, convTaxFunding:"withhold", taxableGainFrac:0, acaPremium:0, acaSize:0, taxYieldPct:0, currentConv:0,
  tradInit:0, rothInit:0, tradInitA:0, tradInitB:0, rothInitA:0, rothInitB:0, taxableInit:0, ...o });
const baseMFJ = (o={}) => baseSingle({ single:false, dobBYr:1966, ...o });
const none = (P) => g.runRothStrategies(P).find(r=>r.key==="none").totTax;
const noneNiit = (P) => g.runRothStrategies(P).find(r=>r.key==="none").totNiit;
const noneIrmaa = (P) => g.runRothStrategies(P).find(r=>r.key==="none").totIrmaa;
const penFor = (T_, D) => (T_ + D) / 12;
const out = {};

// ═══ 1–2. Ordinary brackets, both statuses, every boundary ±$1 ═══
for (const [st, base, bounds] of [["S", baseSingle, [12400,50400,105700,201775,256225,640600]],
                                  ["M", baseMFJ,     [24800,100800,211400,403550,512450,768700]]])
  for (const b of bounds) for (const d of [-1,0,1]) { const ti=b+d;
    const got = none(base({ pen: penFor(ti, STD[st]) })); const exp = R(fedRef(ti, st));
    T(`${st} bracket ti=${ti}`, got, exp); out[`${st}_${ti}`]={got,exp}; }

// ═══ 3. Age-65 extra standard deduction ═══
{ const p1 = baseSingle({ dobAYr:1960, pen: penFor(40000, STD.S + SR.S) });
  T(`DED SGL age65 (ti40000)`, none(p1), R(fedRef(40000,"S"))); out.DED_S={got:none(p1),exp:R(fedRef(40000,"S"))};
  const p2 = baseMFJ({ dobAYr:1960, dobBYr:1960, pen: penFor(60000, STD.M + 2*SR.M) });
  T(`DED MFJ both age65 (ti60000)`, none(p2), R(fedRef(60000,"M"))); out.DED_M2={got:none(p2),exp:R(fedRef(60000,"M"))};
  const p3 = baseMFJ({ dobAYr:1960, dobBYr:1966, pen: penFor(60000, STD.M + SR.M) });
  T(`DED MFJ one age65 (ti60000)`, none(p3), R(fedRef(60000,"M"))); out.DED_M1={got:none(p3),exp:R(fedRef(60000,"M"))}; }

// ═══ 4. OBBBA: Engine A deliberately OMITS the $6K bonus (documented; D-3 cross-engine item) ═══
{ const p = baseSingle({ dobAYr:1960, pen: penFor(30000, STD.S + SR.S) }); // 65+, MAGI<75k => bonus would apply if modeled
  T(`OBBBA SGL: Engine A omits bonus (ti30000)`, none(p), R(fedRef(30000,"S"))); out.OBBBA={got:none(p),exp:R(fedRef(30000,"S"))}; }

// ═══ 5. LTCG stacking — 0%/15% straddle & fill, both statuses ═══
{ const mk = (st, base, ti, div) => { const taxableInit=1_000_000; const pct=(div/taxableInit)*100;
    return (st==="S"?baseSingle:baseMFJ)({ pen: penFor(ti, STD[st]), taxYieldPct: pct, taxableInit }); };
  for (const [st,ti,div,tag] of [["S",20000,30000,"0/15 straddle"],["S",20000,29450,"fills 0% exactly"],
                                 ["M",40000,70000,"0/15 straddle"],["M",40000,58900,"fills 0% exactly"]]) {
    const got = none(mk(st,null,ti,div)); const exp = R(fedRef(ti,st) + ltcgRef(div, ti, st));
    T(`LTCG ${st} ${tag}`, got, exp); out[`LTCG_${st}_${div}`]={got,exp}; } }

// ═══ 6. NIIT — MAGI borders + interior, both statuses ═══
{ const mk = (st, magi, div) => { const taxableInit=1_000_000; const pct=(div/taxableInit)*100;
    return (st==="S"?baseSingle:baseMFJ)({ pen: (magi-div)/12, taxYieldPct: pct, taxableInit }); };
  for (const [st,div,pts] of [["S",20000,[199999,200000,200001,200100,220000]],
                              ["M",30000,[249999,250000,250001,250100,300000]]])
    for (const m of pts) { const got = noneNiit(mk(st,m,div));
      const exp = R(0.038 * Math.min(div, Math.max(0, m - NIIT[st])));
      T(`NIIT ${st} magi=${m}`, got, exp); out[`NIIT_${st}_${m}`]={got,exp}; } }

// ═══ 7. SS taxability — tier borders (t1,t2) + interior with nonzero fed flow-through ═══
{ const mk = (st, ss, other) => (st==="S"?baseSingle:baseMFJ)({ ssA: ss/12, ssAYr:2020, ssAMo:1, pen: other/12 });
  const cases = {
    S: [[10000,18000,"tier0 interior fed>0"],[20000,15000,"t1 border"],[10000,25000,"tier1 interior fed>0"],
        [20000,24000,"t2 border"],[30000,40000,"tier2 interior fed>0"]],
    M: [[10000,25000,"tier0 interior fed>0"],[20000,22000,"t1 border"],[10000,32000,"tier1 interior fed>0"],
        [30000,29000,"t2 border"],[40000,50000,"tier2 interior fed>0"]] };
  for (const st of ["S","M"]) for (const [ss,other,tag] of cases[st]) {
    const taxSS = ssRef(ss, other, st); const grossOrd = other + taxSS;
    const taxableOrd = Math.max(0, grossOrd - STD[st]); const exp = R(fedRef(taxableOrd, st));
    const got = none(mk(st, ss, other));
    T(`SS ${st} ${tag} (ss${ss},oth${other})`, got, exp);
    out[`SS_${st}_${other}`]={got,exp,taxSS:+taxSS.toFixed(2),taxableOrd:+taxableOrd.toFixed(2)}; } }

// ═══════════════════════════════════════════════════════════════════════════════════════════
// PHASE 2B — IRMAA + indexation discipline (dollar-exact against Engine A / runRothStrategies).
// Constants verified vs CMS 2026 (published 2025-11-14, eff 2026-01-01): thresholds EXACT;
// per-person combined Part B+D surcharges are the app's disclosed "approximate annual" values
// (CMS-exact differ ≤$5; see FlawsToFix-v5_10_2-Phase2B.md appendix). SUR_R below = the app's
// constants, so these cases assert the ENGINE selects the right tier and multiplies by persons.
//
// HARNESS: IRMAA needs MAGI two years prior in-window, so a 3-year window (retireYr..retireYr+2)
// puts exactly ONE surcharge year at the end (only it has magiHist[yr-2]); totIrmaa == that year.
// At premium year 2028 (window 2026→2028) the inflator exponent (yr-2-asOfYr) is 0, so thresholds
// are the base CMS values — the clean place to test tier selection. Both spouses 65+ via dob 1958.
const pass2A = pass, fail2A = fail;
const SGL_R = [109000,137000,171000,205000,500000,Infinity];
const MFJ_R = [218000,274000,342000,410000,750000,Infinity];
const SUR_R = [0,1150,2880,4620,6360,6940];
const tierR = (magi, ups) => { for (let i=0;i<ups.length;i++) if (magi<=ups[i]) return i; return ups.length-1; };
const irmaaRef = (magi, single, persons) => SUR_R[tierR(magi, single?SGL_R:MFJ_R)] * persons;
// IRMAA isolation builder: 3-year window ending at `premiumYr`, both 65+ that year, MAGI = pen.
const irmaaP = (single, magi, premiumYr=2028, o={}) =>
  (single?baseSingle:baseMFJ)({ retireYr:premiumYr-2, horizonYr:premiumYr, asOfYr:2026,
    dobAYr:premiumYr-70, dobBYr:premiumYr-70, ladderEnd:premiumYr-3, pen:magi/12, ...o });

// ═══ 8. IRMAA tier borders ±$1, both statuses, PREMIUM-YEAR thresholds (premium year 2028) ═══
// REWRITTEN AT v5.14. These 30 cases previously compared MAGI against the BASE 2026 thresholds,
// which was valid only because the pre-fix engine indexed to the MAGI year — at premium year 2028
// that meant 2026, exponent 0. v5.14 indexes to the PREMIUM year (F-2B-1), so exponent 2 applies and
// every boundary moves up ~4%. Ten of these cases correctly failed on the first run after the fix.
//
// The reference below is an INDEPENDENT re-derivation of the CMS rule (premium-year indexing, plus
// the BBA-2018 top-tier freeze), written from the statute — not a copy of the engine's helper. The
// borders are taken at floor(threshold) so the ±$1 cliff test stays exact against a float boundary.
const IDX_R = 1.02, TOP_FROZEN_R = 2027, BASE_YR_R = 2026;
const thrRef = (upper, isTop, premiumYr) => !isFinite(upper) ? upper
  : upper * Math.pow(IDX_R, isTop ? Math.max(0, premiumYr - TOP_FROZEN_R) : premiumYr - BASE_YR_R);
const tierRefY = (magi, ups, premiumYr) => {
  for (let i = 0; i < ups.length; i++) if (magi <= thrRef(ups[i], i === ups.length - 2, premiumYr)) return i;
  return ups.length - 1; };
const irmaaRefY = (magi, single, persons, premiumYr) =>
  SUR_R[tierRefY(magi, single ? SGL_R : MFJ_R, premiumYr)] * persons;
const PY = 2028;
for (const [st, single, ups, persons] of [["SGL",true,SGL_R,1],["MFJ",false,MFJ_R,2]])
  for (let i = 0; i < 5; i++) {
    const edge = Math.floor(thrRef(ups[i], i === ups.length - 2, PY));
    for (const d of [-1,0,1]) { const magi = edge + d;
      const got = noneIrmaa(irmaaP(single, magi, PY));
      const exp = irmaaRefY(magi, single, persons, PY);
      T(`IRMAA ${st} magi=${magi} (border, premiumYr ${PY})`, got, exp);
      out[`IRMAA_${st}_${magi}`]={got,exp}; } }

// ═══ 9. Per-person surcharge: MFJ one spouse <65 (×1), neither 65 (×0) ═══
{ const g1 = noneIrmaa(irmaaP(false, 300000, 2028, { dobBYr:1970 })); // B age 58 in 2028
  T(`IRMAA MFJ one-65 magi=300000 (×1)`, g1, SUR_R[tierR(300000,MFJ_R)]*1); out.IRMAA_MFJ_one65={got:g1,exp:SUR_R[tierR(300000,MFJ_R)]};
  const g0 = noneIrmaa(irmaaP(false, 300000, 2028, { dobAYr:1970, dobBYr:1970 })); // both <65
  T(`IRMAA MFJ neither-65 magi=300000 (×0)`, g0, 0); out.IRMAA_MFJ_none65={got:g0,exp:0}; }

// ═══ 10. [FIXED v5.14] indexation — pins flipped from the defect to the CMS-correct answer ═══
// Both were opened 2026-08-07 as dated [KNOWN DEFECT] pins asserting the wrong-but-real behaviour,
// and both are corrected in v5.14 by a single shared threshold helper. The flip is the fix's own
// verification: these expectations were written from primary source BEFORE the fix existed, so they
// cannot have been reverse-engineered from it.
//
// F-2B-1 — thresholds now index to the PREMIUM year, not the MAGI year. The 2-year lookback shifts
//   the INCOME, not the table. SGL tier-1 at premium year 2046 = 109000·1.02^20 = 161,968 (was
//   109000·1.02^18 = 155,679). A household with 2044 MAGI of 158,000 sits between the two: it owed
//   $1,150 under the defect and owes $0 under the law.
{ const got = noneIrmaa(irmaaP(true, 158000, 2046));
  T(`IRMAA [FIXED F-2B-1] SGL premiumYr2046 magi=158000 => $0 (premium-year index; was 1150)`, got, 0);
  out.IRMAA_FIX_premise2 = { got, exp:0, preFix:1150 };
  // Still a cliff, just in the right place: one dollar over the CORRECT threshold charges in full.
  const gHi = noneIrmaa(irmaaP(true, 161969, 2046));
  T(`IRMAA [FIXED F-2B-1] SGL premiumYr2046 magi=161969 (one $ over the correct thr) => 1150`, gHi, 1150);
  const gAt = noneIrmaa(irmaaP(true, 161968, 2046));
  T(`IRMAA [FIXED F-2B-1] SGL premiumYr2046 magi=161968 (AT the correct thr) => 0`, gAt, 0); }
//
// F-2B-2 — the top tier is frozen through 2027 and indexes only from 2028, off the frozen base
//   (BBA-2018 §53114). SGL top at premium year 2046 = 500000·1.02^19 = 728,406 (was 500000·1.02^18
//   = 714,123). A household with 2044 MAGI of 720,000 is tier 4 under the law, not the top tier.
{ const got = noneIrmaa(irmaaP(true, 720000, 2046));
  T(`IRMAA [FIXED F-2B-2] SGL premiumYr2046 magi=720000 => 6360 (tier 4, not top; was 6940)`, got, 6360);
  out.IRMAA_FIX_premise1 = { got, exp:6360, preFix:6940 };
  const gTop = noneIrmaa(irmaaP(true, 728407, 2046));
  T(`IRMAA [FIXED F-2B-2] SGL premiumYr2046 magi=728407 (one $ over the correct top) => 6940`, gTop, 6940); }
//
// The FREEZE ITSELF — the boundary no earlier case covered. The top tier must not move at all before
// 2028, then index off the frozen base. Premium years 2027/2028/2029, one dollar over $500,000:
// frozen years charge the top tier; from 2028 the threshold rises, so the same income falls to tier 4.
{ const at2027 = noneIrmaa(irmaaP(true, 500001, 2027));
  T(`IRMAA [FIXED F-2B-2] top tier FROZEN at premiumYr2027: magi=500001 => 6940`, at2027, 6940);
  const at2029 = noneIrmaa(irmaaP(true, 500001, 2029));
  T(`IRMAA [FIXED F-2B-2] top tier INDEXED by premiumYr2029: magi=500001 => 6360 (thr risen)`, at2029, 6360);
  out.IRMAA_FIX_freeze = { at2027, at2029 }; }


// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 2D — THE ROTH BREAK-EVEN CROSSOVER.  Audit sub-phase 2D owed these and never had them.
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// WHY THESE EXIST. `FlawsToFix-v5_15-Phase2D.md` §6 recorded, across three revisions, that the
// break-even half of 2D "remains a premise reading, not a verification": the code had been read
// and judged plausible, which the project standard explicitly does not accept. It owed three
// things — hand-verify the crossover on a household that runs a real deficit before recovering,
// hand-verify one that is never behind, and verify the discounting-equivalence claim asserted in
// the comment at the wealth line. All three are discharged here.
//
// WHAT THE CROSSOVER IS. `runRothStrategies` records per-year FACE-VALUE wealth
// (taxable + rothA + rothB + tradA + tradB) for every policy. The Roth tab subtracts the
// no-conversion run from the current-conversion run and reports the first year the difference
// turns non-negative — after a deficit if there was one, otherwise the first year ahead.
//
// THE IDENTITY BEING ASSERTED, which is what makes this a verification rather than a re-reading:
//
//     wealth delta in the conversion year  ==  -(incremental federal tax) x (1 + GROWTH)
//
// The deficit IS the conversion tax, compounded once. Nothing else can produce it, because both
// runs grow every balance at the same rate and differ only by the dollars the tax removed.
const pass2C = pass, fail2C = fail;
{
  // t10 runs on a DELIBERATELY EMPTY portfolio, because 2A/2B test tax functions in isolation.
  // The crossover needs balances to convert, so this block installs its own explicit fixture and
  // restores the empty one afterwards. Stated because a hand-built fixture that silently inherits
  // an empty portfolio returns zeros and every assertion below passes vacuously — which is what
  // the first version of this block did.
  const SAVED = JSON.parse(JSON.stringify(g.PORTFOLIO()));
  g.setPortfolio({
    positions: [{ ticker: "T", owner: "A", name: "Trad", balance: 900000, bucket: 3,
                  type: "equity-lb", roth: 0, trad: 900000, er: 0.03 }],
    total401k: 900000, household: 1000000, stateCode: null, asOfYr: 2026,
    otherAccounts: [{ name: "Brokerage", balance: 100000, owner: "JT", taxType: "taxable" }],
    incomeStreams: [], incomeSources: {}, single: false,
    contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0,
                     contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  });
  const rsb = g.retireStartBalances(2027);
  const BASE = {
    single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2052,
    ladderEnd: 2040, ladderEndA: 2040, ladderEndB: 2040,
    dobAYr: 1970, dobBYr: 1972, deathYr1: 2060, survivor: "B",
    ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 6, ssBYr: 2042, ssBMo: 6,
    pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.5,
    acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0, ...rsb,
    taxableInit: g.taxableInitAll ? g.taxableInitAll() : 0,
  };
  // ── WHAT THESE CASES DO AND DO NOT REACH — established by negative control, not by assumption.
  // The wealth series below is genuine ENGINE output: `runRothStrategies` computes wealthByYr, and
  // corrupting it (crediting Roth above Traditional via the heir rate) fails 7 of these assertions.
  //
  // The SELECTION logic — `beYr = beWasBehind ? firstRecover : firstAhead` — is NOT reached. It
  // lives inline in an anonymous closure three levels inside DangerCloseMain (source ~L8686-8699)
  // and is exported nowhere, so `cross()` below REIMPLEMENTS it. A control that removed the
  // never-behind branch from the shipped source changed nothing here, which is how this was found
  // rather than assumed. What that means precisely:
  //   VERIFIED  — the wealth series, the tax identity, the discounting equivalence, and that
  //               inputs producing each of the three outcomes exist and behave as claimed.
  //   NOT VERIFIED — that the SHIPPED selection expression picks the same year this one does.
  // Closing it needs the expression extracted to a callable function, which is a source change and
  // was out of scope for the audit that produced these cases. Recorded in the 2D deliverable.
  const GROWTH = 1.045;
  const cross = (P, conv) => {
    const menu = [{ key: "none", policy: { kind: "fixed", amount: 0 } },
                  { key: "cur",  policy: { kind: "fixed", amount: conv } }];
    const r = g.runRothStrategies({ ...P, currentConv: conv }, menu);
    const none = r.find(x => x.key === "none"), cur = r.find(x => x.key === "cur");
    const yrs = Object.keys(none.wealthByYr).map(Number).sort((a, b) => a - b);
    let firstAhead = null, firstRecover = null, wasBehind = false, deficitMax = 0;
    const delta = {};
    for (const y of yrs) {
      const d = (cur.wealthByYr[y] || 0) - (none.wealthByYr[y] || 0);
      delta[y] = d;
      if (d < -1) { wasBehind = true; deficitMax = Math.min(deficitMax, d); }
      if (wasBehind && firstRecover === null && d >= 0) firstRecover = y;
      if (firstAhead === null && d > 1) firstAhead = y;
    }
    return { beYr: wasBehind ? firstRecover : firstAhead, wasBehind, deficitMax, delta,
             incTax: cur.totTax - none.totTax, yrs, none, cur };
  };

  // NOT VACUOUS. If the fixture failed to install, every figure below is zero and the assertions
  // pass by accident. Assert the preconditions first.
  T("2D fixture: the pre-tax basis is non-zero", rsb.tradInit > 0 ? 1 : 0, 1);
  T("2D fixture: the taxable basis is non-zero", BASE.taxableInit > 0 ? 1 : 0, 1);

  // ── CASE 1 — a real deficit, then recovery ─────────────────────────────────────────────────
  // THE IDENTITY, asserted rather than a household-specific dollar figure: the year-one wealth
  // deficit IS the incremental federal tax, compounded once at the portfolio growth rate. Both
  // runs grow every balance at the same rate and differ only by the dollars the tax removed, so
  // nothing else can produce it. This is what makes the crossover a cash answer rather than an
  // assumption about opportunity cost.
  const one = cross({ ...BASE, horizonYr: 2027, ladderEnd: 2027, ladderEndA: 2027, ladderEndB: 2027 }, 60000);
  T("2D case 1: a $60K conversion IS taxed", one.incTax > 0 ? 1 : 0, 1);
  T("2D case 1: year-one deficit == incremental tax x GROWTH (within rounding)",
    Math.abs(one.delta[2027] + one.incTax * GROWTH) <= 2 ? 1 : 0, 1);
  T("2D case 1: and the household is behind in year one", one.delta[2027] < 0 ? 1 : 0, 1);

  // $30K/yr over the ladder runs a deficit and recovers at 2048; $60K/yr never recovers inside
  // the horizon and is case 3 below. Both on ONE fixture, so the difference is the conversion
  // size and nothing else — which is the point.
  const full = cross(BASE, 30000);
  T("2D case 1: over the full horizon it runs a real deficit", full.wasBehind ? 1 : 0, 1);
  T("2D case 1: and recovers inside the horizon", full.beYr !== null ? 1 : 0, 1);
  T("2D case 1: the reported year is the RECOVERY year, not the first ahead",
    full.delta[full.beYr] >= 0 && full.delta[full.beYr - 1] < 0 ? 1 : 0, 1);

  // ── CASE 2 — never behind ──────────────────────────────────────────────────────────────────
  // A conversion small enough to sit under the standard deduction costs ZERO incremental tax, so
  // there is no deficit and the reported year is the first year AHEAD. This is the branch
  // `beWasBehind ? firstRecover : firstAhead` exists for, and 2D could not confirm it was
  // reachable. It is.
  const never = cross(BASE, 10000);
  T("2D case 2: a $10K conversion costs ZERO incremental tax", never.incTax <= 0 ? 1 : 0, 1);
  T("2D case 2: no year is ever behind", never.wasBehind ? 1 : 0, 0);
  T("2D case 2: year-one delta is exactly zero", never.delta[2027], 0);
  T("2D case 2: a crossover year is still reported", never.beYr !== null ? 1 : 0, 1);

  // ── CASE 3 — does not break even ───────────────────────────────────────────────────────────
  // v5.7.1 made "does not break even" a possible answer; nothing tested that it can still occur.
  const nope = cross(BASE, 60000);
  T("2D case 3: an over-large conversion reports NO break-even (same fixture, size alone)",
    nope.beYr === null ? 1 : 0, 1);
  T("2D case 3: ...and its lifetime tax is HIGHER, unlike the recovering case",
    nope.incTax > full.incTax ? 1 : 0, 1);
  T("2D case 3: ...and it is behind, not merely flat", nope.wasBehind ? 1 : 0, 1);

  // ── THE DISCOUNTING-EQUIVALENCE CLAIM ──────────────────────────────────────────────────────
  // The source comment asserts "comparing same-year wealth = discounting cash flows at the
  // portfolio's own growth rate". VERIFIED, not read: with conversions confined to one year and
  // zero taxable yield, the two runs differ thereafter ONLY by balances, so the delta must
  // compound at exactly GROWTH. A dollar of difference introduced in year Y therefore appears at
  // year N as (1+GROWTH)^(N-Y) — which is precisely discounting at that rate.
  const iso = cross({ ...BASE, horizonYr: 2038, ladderEnd: 2027, ladderEndA: 2027, ladderEndB: 2027 }, 60000);
  let ratiosOK = 1, worst = 0, checked = 0;
  for (let y = 2029; y <= 2038; y++) {
    if (!iso.delta[y - 1]) continue;
    const r = iso.delta[y] / iso.delta[y - 1];
    checked++; worst = Math.max(worst, Math.abs(r - GROWTH));
    if (Math.abs(r - GROWTH) > 0.002) ratiosOK = 0;
  }
  T("2D equivalence: the isolated delta is non-zero (control)", iso.delta[2027] !== 0 ? 1 : 0, 1);
  T("2D equivalence: enough years were actually compared (control)", checked >= 9 ? 1 : 0, 1);
  T("2D equivalence: an isolated delta compounds at GROWTH every year", ratiosOK, 1);
  T("2D equivalence: worst deviation from 1.045 is rounding-scale", worst < 0.002 ? 1 : 0, 1);

  g.setPortfolio(SAVED);   // restore t10's empty portfolio for anything added after this block
}
const pass2D = pass - pass2C, fail2D = fail - fail2C;

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 2E — THE STATE-TAX MODULE.  The last sub-phase of Phase 2 (Section C).
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCOPE, per decision D-5 of SCOPE_AUDIT_PHASE2_v5_10_2.md: verify `stateTaxAnnual` against one
// jurisdiction of each of the five archetypes — no-tax, flat, retExempt, excl65, partial-SS — plus
// the maintainer's own state, which is Florida and is already the no-tax case.
//
// THE SCOPE BOUNDARY MATTERS AND IS NOT A DODGE. 2E asks whether the code implements the
// DOCUMENTED APPROXIMATION correctly. Whether an effective flat rate is a good stand-in for a
// progressive state schedule is a disclosed limitation (Field Manual §13 and the module's own
// header), and is therefore not a defect. A state whose modelled treatment contradicts its own
// `note` string IS one.
//
// Every expected figure below was computed by hand from the rule table first, then compared to
// engine output — not read back from the engine. The arithmetic is written out so it can be
// re-checked without running anything.
const pass2E = pass, fail2E = fail;
{
  const S = g.stateTaxAnnual, R = g.STATE_RULES ? g.STATE_RULES() : null;
  if (S && R) {
    // One income shape for every archetype, so the only variable is the jurisdiction.
    const IN = { fallbackRate: 0.05, retIncome: 40000, pen: 20000, work: 10000,
                 capGains: 5000, ssTaxableFed: 30000 };
    const run = (code, persons65) => S({ code, ...IN, persons65 });

    T("2E: the rule table carries all 51 jurisdictions", Object.keys(R).length, 51);

    // ── ARCHETYPE 1 — no tax. FL is also the maintainer's state, so D-5's two requirements meet.
    // Branch: `if (r.rate === 0) return 0`, taken before any other term is evaluated.
    T("2E no-tax (FL): returns zero", run("FL", 2), 0);

    // ── ARCHETYPE 2 — plain flat rate, no exclusions, no SS. AZ at 2.5%.
    // hand: 0.025 x ((40,000 + 20,000) + 10,000 + 0 + 5,000) = 0.025 x 75,000 = 1,875
    T("2E flat (AZ 2.5%): taxes retirement, work and gains alike", run("AZ", 2), 1875);

    // ── ARCHETYPE 3 — retExempt. MS at 4%: ALL retirement income exempt, everything else taxed.
    // hand: 0.04 x (0 + 10,000 + 0 + 5,000) = 600
    T("2E retExempt (MS 4%): retirement excluded, work and gains still taxed", run("MS", 2), 600);

    // ── ARCHETYPE 4 — per-person 65+ exclusion. AL at 4.5%, $6,000 each.
    // hand MFJ:    0.045 x ((60,000 - 12,000) + 10,000 + 0 + 5,000) = 0.045 x 63,000 = 2,835
    // hand single: 0.045 x ((60,000 -  6,000) + 10,000 + 0 + 5,000) = 0.045 x 69,000 = 3,105
    T("2E excl65 (AL 4.5%, MFJ): exclusion applied per person", run("AL", 2), 2835);
    T("2E excl65 (AL 4.5%, single): exclusion is half the MFJ amount", run("AL", 1), 3105);

    // ── ARCHETYPE 5 — partial-SS. MT at 5.65%: ss factor 0.5 AND a $5,500 65+ subtraction, so it
    // exercises two branches at once.
    // hand MFJ:    0.0565 x ((60,000 - 11,000) + 10,000 + 15,000 + 5,000) = 0.0565 x 79,000 = 4,463.50
    // hand single: 0.0565 x ((60,000 -  5,500) + 10,000 + 15,000 + 5,000) = 0.0565 x 84,500 = 4,774.25
    T("2E partial-SS (MT 5.65%, MFJ): half of federally-taxable SS enters the base", run("MT", 2), 4463.5);
    T("2E partial-SS (MT 5.65%, single)", run("MT", 1), 4774.25);
    // NOT VACUOUS: a state with ss=0 on the same inputs must exclude SS entirely, or the assertion
    // above would pass on any implementation that simply ignored the flag.
    T("2E control: an ss=0 state excludes SS from the base",
      run("AZ", 2), 0.025 * 75000);

    // ── ARCHETYPE 6 — the fallback path for an unknown/absent code.
    // hand: 0.05 x ((40,000 + 20,000 + 10,000) + 5,000) = 0.05 x 75,000 = 3,750
    T("2E fallback (no code): flat rate on ordinary + gains", S({ code: null, ...IN, persons65: 2 }), 3750);
    T("2E fallback: an unrecognised code takes the same path",
      S({ code: "ZZ", ...IN, persons65: 2 }), 3750);

    // ── CLAMPS. Each of these is a place a sign error would silently produce a negative tax, and
    // none of them is exercised by the archetype cases above.
    T("2E clamp: an exclusion larger than retirement income cannot go negative",
      S({ code: "AL", fallbackRate: 0, retIncome: 3000, pen: 0, work: 20000, capGains: 0,
          ssTaxableFed: 0, persons65: 2 }), 900);
    T("2E clamp: a capital LOSS is ignored, not deducted",
      S({ code: "AZ", fallbackRate: 0, retIncome: 50000, pen: 0, work: 0, capGains: -30000,
          ssTaxableFed: 0, persons65: 0 }), 1250);
    T("2E clamp: a negative persons65 cannot create a negative exclusion",
      S({ code: "AL", fallbackRate: 0, retIncome: 60000, pen: 0, work: 0, capGains: 0,
          ssTaxableFed: 0, persons65: -5 }), 2700);
    T("2E clamp: a no-tax state ignores the fallback rate entirely",
      S({ code: "FL", fallbackRate: 0.9, retIncome: 1e6, pen: 1e6, work: 1e6, capGains: 1e6,
          ssTaxableFed: 1e6, persons65: 0 }), 0);
    T("2E: a retExempt state exempts retirement income at ANY size",
      S({ code: "MS", fallbackRate: 0, retIncome: 5e5, pen: 2e5, work: 0, capGains: 0,
          ssTaxableFed: 0, persons65: 0 }), 0);

    // ── THE DEFECT TEST D-5 ACTUALLY NAMES: a state whose behaviour contradicts its own note.
    // Scanned across all 51. Seven candidates surfaced; six were dollar figures in the note that
    // are AGI THRESHOLDS or explicitly unmodelled provisions, not exclusions — correct as written.
    // One is a genuine documentation gap and is pinned below.
    let noTaxOK = 0, exclOK = 0;
    for (const c of Object.keys(R)) {
      const r = R[c], n = (r.note || "").toLowerCase();
      if (/no (state )?income tax/.test(n) && r.rate !== 0) noTaxOK++;
      if (r.excl65 > 0 && !/\$\d/.test(n)) exclOK++;
    }
    T("2E notes: every state claiming no income tax really has rate 0", noTaxOK, 0);
    T("2E notes: every state with a 65+ exclusion names a figure in its note", exclOK, 0);

    // [KNOWN DEFECT 2026-08-12 | MT note omits SS] — OPERATIONS §D pin.
    // Montana carries ss: 0.5, so the model taxes half of federally-taxable Social Security there.
    // Its note reads only "$5,500 65+ subtraction" and never mentions Social Security. Every OTHER
    // partial-SS state (CO, CT, MN, NM, RI, UT, VT) says so in its note. The modelling is right and
    // the disclosure is incomplete — the mild form of the defect D-5 names, which is why it is
    // pinned rather than treated as a stop. FLIP THIS PIN when the note is corrected.
    const mtSaysSS = /social security|\bss\b/i.test(R.MT.note || "");
    T("[KNOWN DEFECT 2026-08-12] MT taxes SS but its note does not say so", mtSaysSS ? 1 : 0, 0);
    T("2E control: the other seven partial-SS states DO mention it",
      ["CO","CT","MN","NM","RI","UT","VT"].filter(c => !/social security|\bss\b/i.test(R[c].note || "")).length, 0);
  }
}
const pass2Ecount = pass - pass2E, fail2Ecount = fail - fail2E;


console.log(`\nt10 2A: ${pass2A} passed, ${fail2A} failed`);
console.log(`t10 2B: ${pass-pass2A} passed, ${fail-fail2A} failed  (IRMAA tier selection + 7 indexation assertions, pins FLIPPED at v5.14)`);
console.log(`t10 2D: ${pass2D} passed, ${fail2D} failed  (Roth break-even crossover \u2014 the three cases sub-phase 2D owed)`);
console.log(`t10 2E: ${pass2Ecount} passed, ${fail2Ecount} failed  (state-tax module \u2014 five archetypes, both statuses, clamps, note scan)`);
console.log(`t10 total: ${pass} passed, ${fail} failed`);
if (fails.length) console.log(fails.join("\n"));
console.log("\n--- captured (engine vs independent hand reference) ---");
for (const k of ["S_50400","S_105700","M_100800","DED_S","OBBBA","LTCG_S_30000","LTCG_M_70000",
                 "NIIT_S_220000","NIIT_M_300000","SS_S_18000","SS_S_40000","SS_M_50000"])
  if (out[k]) console.log(`${k}: got=${out[k].got} exp=${out[k].exp}`+(out[k].taxSS!==undefined?` (taxableSS=${out[k].taxSS}, taxableOrd=${out[k].taxableOrd})`:""));
process.exit(fail ? 1 : 0);
