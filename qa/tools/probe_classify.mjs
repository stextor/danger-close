// ─────────────────────────────────────────────────────────────────────────────
// PROBE — NOT A TEST SUITE. Asserts nothing. NEVER count it in a suite total.
//
// WHAT IT IS. A one-off investigative probe written while scoping the
// otherAccounts tax-treatment work (release c, findings C-1/C-2/C-4/C-5). It
// prints the shipped composition of the demo household and what reclassifying
// the Other accounts WOULD move, so the change could be sized before it was
// built. It is the tool that produced the $111,000 / $21,000 / $15,000 split
// that v5.24 published.
//
// ITS CONCLUSIONS HAVE SINCE SHIPPED. The reclassification it models as
// hypothetical landed at v5.25/v5.26 and is now asserted by t20 (94 checks) and
// by t8's invariants. Read its "WHAT (c) WOULD MOVE" section as history: the
// deltas it prints describe a transformation that has ALREADY happened, so on a
// current build those "would move" figures no longer mean what they say.
//
// KEPT for provenance, not for use. For the current composition read t20, which
// asserts the same numbers and cannot silently go stale.
//
// RUN FROM qa/tools/:   node probe_classify.mjs
// The import below is ../app_testable.mjs because this probe originally lived in
// qa/ and was moved to qa/tools/ when it was first committed (2026-08-13).
//
// Provenance: unversioned until 2026-08-13 — it existed only in project
// knowledge and was never committed. Pool copy md5 1ccf9c8bfcda83b4c0880456a8e716c5.
// ─────────────────────────────────────────────────────────────────────────────
// PROBE — what does classify-in-place actually move? No source modification.
let _s=123456789; Math.random=()=>{_s=(1103515245*_s+12345)%2147483648; return _s/2147483648;};
const {__g:g} = await import("../app_testable.mjs");
const P = g.PORTFOLIO();
const oa = P.otherAccounts;
const by = t => oa.filter(a=>a.taxType===t).reduce((s,a)=>s+a.balance,0);
console.log("SHIPPED v5.25 composition");
console.log("  household   ", P.household);
console.log("  total401k   ", P.total401k);
console.log("  otherAccounts", oa.reduce((s,a)=>s+a.balance,0));
console.log("  by type: trad",by("trad"),"taxable",by("taxable"),"hsa",by("hsa"),"roth",by("roth"));
const rsb = g.retireStartBalances(2027);
console.log("\nretireStartBalances(2027) — the shared basis Engines A/B/C/D read");
console.log(" ", JSON.stringify(rsb));
console.log("  taxableInitFromPositions:", g.taxableInitFromPositions ? g.taxableInitFromPositions() : "(not exported)");
console.log("\nEngine D today");
const r = g.computeWithdrawalPlan({retireYear:2027, rothAmount:0, scenarioPreset:"base"});
console.log("  _taxInit (household - total401k):", r._taxInit);
console.log("  _tradInit:", r._tradInit, " _rothInit:", r._rothInit);
console.log("  totalDrawn:", Math.round(r.totalDrawn));
console.log("\nWHAT (c) WOULD MOVE, under C-1/C-2/C-4/C-5");
const tradAdd = by("trad");   // note: includes the annuity, which C-5 splits out
const taxKeep = by("taxable") + by("hsa");
console.log("  _taxInit  ", r._taxInit, "->", taxKeep, " (delta", taxKeep-r._taxInit, ")");
console.log("  _tradInit ", r._tradInit, "->", r._tradInit + tradAdd, " (delta +", tradAdd, ")");
console.log("  conservation:", (taxKeep + tradAdd) === r._taxInit ? "OK — 147,000 preserved" : "BROKEN");
console.log("\n  of the trad add, the ANNUITY (C-5 splits out):", oa.filter(a=>/annuit/i.test(a.name)).map(a=>a.name+"="+a.balance).join(", "));
