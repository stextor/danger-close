// t20 — OTHER ACCOUNTS: THE TAX TYPE (schema, migration, and the extinction invariant).
//
// WHY THIS SUITE EXISTS. v5.24 disclosed that Engine D treats every Other account as already-taxed
// brokerage cash — drawn first, spent tax-free, growth never taxed, no RMD — including money the
// user named as an IRA. Release (c) fixes the modelling, but (c) CANNOT CLASSIFY WHAT THE DATA DOES
// NOT RECORD: through v5.24 `buildPortfolio` emitted Other accounts as exactly {name, balance,
// owner}. v5.25 adds `taxType` so the classification exists before anything depends on it.
//
// WHAT THIS RELEASE IS, AND THEREFORE WHAT THIS SUITE MUST PROVE. v5.25 is schema + UI + migration.
// NO ENGINE READS taxType. That is not a stylistic claim — it is the reason the whole release can be
// proven by "every one of the pre-existing checks returns an identical figure", and it is the LAST
// release in this sequence that can make that claim, because (c) moves figures by design. Section E
// is therefore an EXTINCTION assertion (OPERATIONS §D): it fails the moment an engine starts reading
// the field, so release (c) cannot land here by accident.
//
// ON THE INFERENCE (Section C). Back-filling a type by parsing the account name is a GUESS. It is
// used because the alternative — defaulting every legacy account to "taxable" — is a silent guess in
// the OPTIMISTIC direction, which is the failure mode this app exists to avoid. The guess is
// disclosed to the user in a one-time notice that lists what it inferred AND what it could not, and
// the rules reuse the `owner` back-fill idiom already in the file rather than inventing a second one.
//
// THE D-3 EQUALITY (Section C, and the point of the whole suite). v5.24 told users, in the app, that
// $111,000 of the example household's $147,000 first-draw pot is not already-taxed money. If the
// inference rules do not reproduce that split to the dollar, then either the shipped disclosure or
// the shipped classification is lying to somebody. Asserted exactly, not to a tolerance.
//
// usage: node t20_other_taxtype.mjs        (reads the fixed app_testable.mjs, like t7/t8/t15)
//        node t20_other_taxtype.mjs v524   (explicit tag — how a frozen leg is driven for a
//                                           negative control; v5.24 is EXPECTED to fail Sections
//                                           B–D, because the field does not exist there.)
import { readFileSync } from "fs";

let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

const VER = process.argv[2] || null;
const { __g: g } = await import(VER ? `./app_${VER}.mjs` : "./app_testable.mjs");

let pass = 0, fail = 0; const fails = [];
const ck = (n, ok, d = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${n}`); }
  else { fail++; const m = `  \u2717 ${n}${d ? " \u2014 " + d : ""}`; console.log(m); fails.push(m); }
};
const TYPES = ["taxable", "trad", "roth", "hsa"];

console.log("t20 \u2014 OTHER ACCOUNTS TAX TYPE (schema / migration / extinction)\n");

// ─────────────────────────────────────────────────────────────────────────────
// A. The example household ships with EXPLICIT types — it must not rely on inference
// ─────────────────────────────────────────────────────────────────────────────
console.log("A. DEFAULT_PORTFOLIO \u2014 explicit, not inferred");

g.setPortfolio(JSON.parse(JSON.stringify(g.PORTFOLIO())));
const dp = g.PORTFOLIO().otherAccounts || [];
ck("example household has Other accounts", Array.isArray(dp) && dp.length === 9, `len=${dp.length}`);
ck("every shipped row declares a taxType", dp.every(a => TYPES.includes(a.taxType)),
   JSON.stringify(dp.map(a => a.taxType)));

// The shipped labels must equal what the inference WOULD have produced. If these ever diverge, the
// example household stops being an honest demonstration of what a real user's migration will do.
const infer = (name) => {
  const s = String(name || "");
  if (/\broth\b/i.test(s)) return "roth";
  if (/\bhsa\b|health\s+savings/i.test(s)) return "hsa";
  if (/\bira\b|\brollover\b|401\s*\(?k\)?|403\s*\(?b\)?|\b457\b|\bpension\b|state\s+plan|\bannuit(y|ies)\b|\bsep\b|\bsimple\b/i.test(s)) return "trad";
  return "taxable";
};
ck("shipped types agree with what inference would have chosen",
   dp.every(a => a.taxType === infer(a.name)),
   dp.filter(a => a.taxType !== infer(a.name)).map(a => `${a.name}:${a.taxType}!=${infer(a.name)}`).join(", "));

// ─────────────────────────────────────────────────────────────────────────────
// B. Migration from a v5.24-shaped backup (no taxType anywhere)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nB. Migration \u2014 a v5.24-shaped backup");

const V524_SHAPED = {
  positions: [], total401k: 0, household: 147000,
  otherAccounts: [
    { name: "Rollover IRA (A)", balance: 70000 },
    { name: "Traditional IRA (A)", balance: 20000 },
    { name: "Brokerage - Growth", balance: 5000 },
    { name: "Brokerage - Speculative", balance: 5000 },
    { name: "Brokerage - Reserve", balance: 5000 },
    { name: "HSA", balance: 15000 },
    { name: "Taxable Brokerage", balance: 6000 },
    { name: "Spouse B - Annuity", balance: 7000 },
    { name: "Spouse B - State Plan", balance: 14000 },
  ],
};
// applyLoadedData takes a WRAPPER object (OPERATIONS §C): passing the portfolio bare is a SILENT
// no-op, and the suite would then be asserting against the previous household while appearing to
// configure a new one.
g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(V524_SHAPED)) });
const mig = g.PORTFOLIO().otherAccounts;

ck("every migrated row has a valid taxType", mig.every(a => TYPES.includes(a.taxType)),
   JSON.stringify(mig.map(a => `${a.name}=${a.taxType}`)));
ck("no balance was altered by the migration",
   mig.every((a, i) => a.balance === V524_SHAPED.otherAccounts[i].balance));
ck("no name was altered by the migration",
   mig.every((a, i) => a.name === V524_SHAPED.otherAccounts[i].name));

// ─────────────────────────────────────────────────────────────────────────────
// C. THE D-3 EQUALITY — the inference must reproduce what v5.24 published
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nC. The D-3 equality \u2014 $111,000 / $21,000 / $15,000");

const sum = (t) => mig.filter(a => a.taxType === t).reduce((s, a) => s + a.balance, 0);
ck("trad totals exactly $111,000", sum("trad") === 111000, `got ${sum("trad")}`);
ck("taxable totals exactly $21,000", sum("taxable") === 21000, `got ${sum("taxable")}`);
ck("hsa totals exactly $15,000", sum("hsa") === 15000, `got ${sum("hsa")}`);
ck("roth totals exactly $0", sum("roth") === 0, `got ${sum("roth")}`);
ck("the four buckets still sum to the $147,000 pot v5.24 named",
   sum("trad") + sum("taxable") + sum("hsa") + sum("roth") === 147000);

// Each rule at its boundary, including the ordering that makes "Roth IRA" resolve roth, not trad.
console.log("\nC2. Inference rules at their boundaries");
const P = (name, want) => {
  g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [{ name, balance: 1000 }] } });
  const got = g.PORTFOLIO().otherAccounts[0].taxType;
  ck(`"${name}" \u2192 ${want}`, got === want, `got ${got}`);
};
P("Roth IRA", "roth");                 // ORDER: roth is tested before the IRA rule
P("Roth 401(k)", "roth");
P("Rollover IRA", "trad");
P("Traditional IRA", "trad");
P("My 401k", "trad");
P("403(b) plan", "trad");
P("457 deferred comp", "trad");
P("State Plan", "trad");
P("Spouse B - Annuity", "trad");
P("SEP IRA", "trad");
P("SIMPLE IRA", "trad");
P("Teachers pension", "trad");
P("HSA", "hsa");
P("Health Savings Account", "hsa");
P("Fidelity ...4471", "taxable");      // the real-user case the inference CANNOT read
P("Brokerage - Growth", "taxable");
// Word boundaries: these must NOT false-positive into trad.
P("Sepulveda Growth Fund", "taxable"); // contains "sep"
P("Simpleton Savings", "taxable");     // contains "simple"

// ─────────────────────────────────────────────────────────────────────────────
// D. D-5 — a Traditional or Roth account cannot be jointly owned
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nD. D-5 \u2014 no jointly-owned retirement account survives migration");

// The example household never exercises this (every retirement row resolves to A or B by name),
// which is exactly why it needs a fixture of its own: leaving the constraint out would have passed
// every existing test and then surfaced in release (c) as a mystery.
g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [
  { name: "Vanguard Rollover", balance: 50000 },              // trad, name gives no owner -> JT -> promote
  { name: "Roth account at Schwab", balance: 30000 },         // roth, no owner hint      -> JT -> promote
  { name: "Joint brokerage", balance: 10000 },                // taxable                  -> JT stays
  { name: "HSA", balance: 5000 },                             // hsa                      -> JT stays
  { name: "Spouse B - Annuity", balance: 7000 },              // trad, owner B by name    -> untouched
] } });
const d5 = g.PORTFOLIO().otherAccounts;
const byName = Object.fromEntries(d5.map(a => [a.name, a]));

// The invariant below is worthless unless the fixture actually CONTAINS trad/roth rows: on a build
// with no taxType at all the condition is never true and the assertion passes while testing nothing.
// That is the OPERATIONS §B2 failure exactly, so the precondition is asserted first.
const _retRows = d5.filter(a => a.taxType === "trad" || a.taxType === "roth");
ck("PRECONDITION: the fixture really does contain trad/roth rows (invariant is not vacuous)",
   _retRows.length === 3, `found ${_retRows.length}, expected 3`);
ck("SCHEMA INVARIANT: no trad/roth row is owned JT after migration",
   _retRows.length > 0 && d5.every(a => !((a.taxType === "trad" || a.taxType === "roth") && a.owner === "JT")),
   JSON.stringify(d5.map(a => `${a.name}:${a.taxType}/${a.owner}`)));
ck("an inferred-trad JT row is promoted to A", byName["Vanguard Rollover"].owner === "A",
   byName["Vanguard Rollover"].owner);
ck("an inferred-roth JT row is promoted to A", byName["Roth account at Schwab"].owner === "A",
   byName["Roth account at Schwab"].owner);
ck("a taxable row KEEPS Joint ownership", byName["Joint brokerage"].owner === "JT",
   byName["Joint brokerage"].owner);
ck("an HSA row KEEPS Joint ownership (D-5 constrains trad/roth only)",
   byName["HSA"].owner === "JT", byName["HSA"].owner);
ck("a name-resolved owner is not overwritten by the promotion",
   byName["Spouse B - Annuity"].owner === "B", byName["Spouse B - Annuity"].owner);

// BACK-FILL ORDER. The promotion is conditional on the type, so the type must be inferred FIRST.
// If the two were swapped, a JT-defaulted retirement row would be evaluated before it had a type
// and would keep JT — which the assertion below detects.
ck("ORDER: type is inferred before the owner promotion that depends on it",
   byName["Vanguard Rollover"].taxType === "trad" && byName["Vanguard Rollover"].owner === "A");

// An EXPLICIT owner on a retirement row must still be honoured — the promotion only rescues JT.
g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [
  { name: "Rollover", balance: 1000, owner: "B" },
  { name: "Rollover two", balance: 1000, owner: "JT" },
] } });
const d5b = g.PORTFOLIO().otherAccounts;
ck("an explicit B owner on a trad row is preserved", d5b[0].owner === "B", d5b[0].owner);
ck("an explicit JT owner on a trad row IS corrected", d5b[1].owner === "A", d5b[1].owner);

// ─────────────────────────────────────────────────────────────────────────────
// E. EXTINCTION — no engine reads taxType (this is what makes the parity claim true)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nE. EXTINCTION \u2014 no engine reads taxType");
//
// HOW THIS IS TESTED, AND WHY IT IS NOT A NAME CHECK. OPERATIONS §B2: a suite's name is not a
// coverage claim, and asserting "no engine reads it" by grepping would prove nothing. Instead the
// SAME household is run twice with the taxTypes PERMUTED to their worst-case opposite — every
// taxable becomes trad and every trad becomes taxable — and every engine's output must be
// byte-identical. If any engine has begun reading the field, these differ and the suite fails.
const HH = {
  positions: [
    { ticker: "VTI", owner: "A", name: "Total US", balance: 600000, bucket: 3, type: "equity-lb", roth: 200000, trad: 400000, er: 0.03 },
    { ticker: "BND", owner: "A", name: "Bonds", balance: 400000, bucket: 2, type: "bond", roth: 0, trad: 400000, er: 0.03 },
  ],
  total401k: 1000000, household: 1147000,
  otherAccounts: [
    { name: "Rollover IRA (A)", balance: 70000, taxType: "trad" },
    { name: "Traditional IRA (A)", balance: 20000, taxType: "trad" },
    { name: "Brokerage", balance: 21000, taxType: "taxable" },
    { name: "HSA", balance: 15000, taxType: "hsa" },
    { name: "Spouse B - Annuity", balance: 21000, taxType: "trad" },
  ],
  asOfYr: 2026,   // OPERATIONS §C: omitting asOfYr silently NaNs every tax figure
  single: false, nameA: "A", nameB: "B",
  dobA: { year: 1962, month: 6, day: 1 }, dobB: { year: 1964, month: 6, day: 1 },
  retireYear: 2027, lifeExpA: 90, lifeExpB: 92,
  bucketActuals: { 1: 0, 2: 0.4, 3: 0.6, 4: 0 },
  contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  incomeStreams: [],  // engine tests must neutralise global income streams
  incomeSources: {},
  stateCode: null, stateTaxRate: 0,
};
const FLIP = { taxable: "trad", trad: "taxable", roth: "hsa", hsa: "roth" };

const runAll = (portfolio) => {
  g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(portfolio)) });
  const tl = g.buildPlanTimeline();
  const pos = g.PORTFOLIO().positions || [];
  const sum = (f) => pos.reduce((s, p) => s + f(p), 0);
  // An EXPLICIT P, exactly as t2 builds one. Engine A takes its inputs by argument, so this object
  // is identical across both runs by construction — which is the point: any difference that shows up
  // can only have come from an engine reaching into PORTFOLIO.otherAccounts itself.
  const P = {
    single: !!tl.single, asOfYr: tl.asOfYear, retireYr: 2027,   // §C: omitting asOfYr NaNs every tax
    horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ladderEnd: tl.rothLadderEnd, ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
    dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    ssA: g.getSSA(), ssB: tl.single ? 0 : g.getSSB(),
    ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month,
    ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
    pen: g.getPension(), stateRate: tl.stateTaxRate || 0, stateCode: g.PORTFOLIO().stateCode || null,
    convTaxFunding: "taxable", taxableGainFrac: 0.5,
    acaPremium: 0, acaSize: 0, taxYieldPct: 1.5, currentConv: 70000,
    tradInit: sum(p => p.trad || 0), rothInit: sum(p => p.roth || 0),
    tradInitA: sum(p => p.owner === "B" ? 0 : (p.trad || 0)),
    tradInitB: sum(p => p.owner === "B" ? (p.trad || 0) : 0),
    rothInitA: sum(p => p.owner === "B" ? 0 : (p.roth || 0)),
    rothInitB: sum(p => p.owner === "B" ? (p.roth || 0) : 0),
    taxableInit: sum(p => Math.max(0, (p.balance || 0) - (p.roth || 0) - (p.trad || 0))),
  };
  const seeded = (fn) => { _s = 123456789; return fn(); };
  const out = {};
  out.withdrawal = seeded(() => g.computeWithdrawalPlan({ retireYear: 2027, rothAmount: 0, scenarioPreset: "base" }));
  out.roth       = seeded(() => g.runRothStrategies(P));
  out.mc         = seeded(() => g.runMonteCarlo(2027, 200));
  out.stress     = seeded(() => g.runStressTests(2027));
  out.checks     = seeded(() => g.buildVerificationChecks());
  return JSON.stringify(out);
};

// Same §B2 hazard as Section D: on a build with no taxType, permuting a field that does not exist
// changes nothing and this passes while proving nothing. Assert the field is really there first.
const _flipFixture = HH.otherAccounts.map(a => ({ ...a, taxType: FLIP[a.taxType] }));
g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify({ ...HH, otherAccounts: _flipFixture })) });
ck("PRECONDITION: the permuted fixture really carries taxTypes (extinction is not vacuous)",
   g.PORTFOLIO().otherAccounts.every(a => TYPES.includes(a.taxType))
   && g.PORTFOLIO().otherAccounts.some(a => a.taxType !== HH.otherAccounts.find(h => h.name === a.name).taxType),
   JSON.stringify(g.PORTFOLIO().otherAccounts.map(a => `${a.name}=${a.taxType}`)));

const asIs = runAll(HH);
const flipped = runAll({ ...HH, otherAccounts: _flipFixture });

ck("EXTINCTION: permuting every taxType changes NO engine output",
   asIs === flipped,
   asIs === flipped ? "" : "an engine has begun reading taxType \u2014 that is release (c), and it must not land here");
ck("the extinction control is not vacuous (engines actually produced output)",
   asIs.length > 2000, `serialized length ${asIs.length}`);

// ─────────────────────────────────────────────────────────────────────────────
// F. Round trip — editor shape survives buildPortfolio -> export -> applyLoadedData
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nF. Round trip \u2014 the field survives a save/export/load cycle");

const ROUND = { positions: [], total401k: 0, household: 100000, otherAccounts: [
  { name: "Rollover IRA (A)", balance: 60000, owner: "A", taxType: "trad" },
  { name: "Joint brokerage", balance: 25000, owner: "JT", taxType: "taxable" },
  { name: "My HSA", balance: 15000, owner: "JT", taxType: "hsa" },
] };
g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(ROUND)) });
const afterLoad = g.PORTFOLIO().otherAccounts.map(a => `${a.name}|${a.balance}|${a.owner}|${a.taxType}`);
// A backup is JSON — round-trip it exactly as Export/Import does.
const blob = JSON.stringify({ portfolio: g.PORTFOLIO() });
g.applyLoadedData({ portfolio: JSON.parse(blob).portfolio });
const afterTrip = g.PORTFOLIO().otherAccounts.map(a => `${a.name}|${a.balance}|${a.owner}|${a.taxType}`);
ck("JSON round trip preserves name, balance, owner and taxType exactly",
   afterLoad.join(";") === afterTrip.join(";"), afterTrip.join(";"));
ck("an EXPLICIT taxType is never re-inferred over the top",
   g.PORTFOLIO().otherAccounts[1].taxType === "taxable",
   g.PORTFOLIO().otherAccounts[1].taxType);
// A row the user deliberately typed against its own name must survive: an account called
// "Rollover" that the user set to taxable stays taxable. Inference is for ABSENT values only.
g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [
  { name: "Rollover IRA", balance: 1000, owner: "A", taxType: "taxable" },
] } });
ck("a user's explicit choice overrides what the NAME would have inferred",
   g.PORTFOLIO().otherAccounts[0].taxType === "taxable",
   g.PORTFOLIO().otherAccounts[0].taxType);

// ─────────────────────────────────────────────────────────────────────────────
// G. The review notice — it must report what it could NOT do, not only what it did
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nG. The review notice payload");

g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [
  { name: "Rollover IRA", balance: 50000 },     // inferred trad + promoted JT->A
  { name: "Fidelity ...4471", balance: 20000 }, // NOTHING inferable — must be reported as such
  { name: "HSA", balance: 5000 },               // inferred hsa
] } });
const n1 = g.PORTFOLIO()._otherTypeMigrated;
ck("a migration produces a notice payload", !!n1);
ck("the notice lists what it INFERRED", !!n1 && n1.inferred.length === 2,
   n1 ? JSON.stringify(n1.inferred) : "none");
ck("the notice lists what it could NOT classify", !!n1 && n1.unclassified.length === 1 && n1.unclassified[0] === "Fidelity ...4471",
   n1 ? JSON.stringify(n1.unclassified) : "none");
ck("the notice names the row whose owner it reassigned", !!n1 && n1.promoted.length === 1 && n1.promoted[0] === "Rollover IRA",
   n1 ? JSON.stringify(n1.promoted) : "none");

// A plan that already carries types must NOT raise the notice — otherwise it never goes away and
// users learn to ignore it, which is how a warning stops being a warning.
g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [
  { name: "Rollover IRA", balance: 50000, owner: "A", taxType: "trad" },
  { name: "Brokerage", balance: 20000, owner: "JT", taxType: "taxable" },
] } });
ck("a fully-typed plan raises NO notice", !g.PORTFOLIO()._otherTypeMigrated,
   JSON.stringify(g.PORTFOLIO()._otherTypeMigrated));
// An empty list must also be quiet.
g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [] } });
ck("a plan with no Other accounts raises NO notice", !g.PORTFOLIO()._otherTypeMigrated);

// ─────────────────────────────────────────────────────────────────────────────
// H. Entry paths other than a backup
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nH. Entry-path defaults");

// startFresh yields an empty array — nothing to type, and nothing to warn about.
g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [] } });
ck("startFresh shape (empty array) migrates without error",
   Array.isArray(g.PORTFOLIO().otherAccounts) && g.PORTFOLIO().otherAccounts.length === 0);

// GuidedWizard.build creates one row labelled as taxable-only. Whether it sets the field explicitly
// or leaves it to inference, the RESULT must be taxable — that is the contract this asserts.
g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [
  { name: "Cash & taxable outside retirement (entered)", balance: 80000 },
] } });
ck("GuidedWizard's row resolves to taxable",
   g.PORTFOLIO().otherAccounts[0].taxType === "taxable",
   g.PORTFOLIO().otherAccounts[0].taxType);

// _parseSpreadsheet's generated rows. The annuity/state-plan pair is the case that matters: this is
// the ONE entry path that knowingly manufactures retirement-shaped accounts.
for (const [name, want] of [
  ["Spouse B - Annuity", "trad"], ["Spouse B - State Plan", "trad"],
  ["Outside Account (total)", "taxable"], ["Brokerage - Growth", "taxable"],
  ["Brokerage - Speculative", "taxable"], ["Brokerage - Reserve", "taxable"],
  ["Taxable Brokerage (all accts)", "taxable"], ["HSA", "hsa"],
]) {
  g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [{ name, balance: 1000 }] } });
  ck(`_parseSpreadsheet row "${name}" resolves ${want}`,
     g.PORTFOLIO().otherAccounts[0].taxType === want, g.PORTFOLIO().otherAccounts[0].taxType);
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\nt20 SUITE${VER ? ` (${VER})` : ""}: ${pass} passed, ${fail} failed`);
if (fails.length) { console.log("\nFAILURES:"); fails.forEach(f => console.log(f)); }
process.exit(fail ? 1 : 0);
