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
const TYPES = ["taxable", "trad", "roth", "hsa", "annuity"];
// v5.26 semantics, derived once so no assertion has to remember which type means what.
const ORDINARY = ["trad", "annuity"];   // taxed as ordinary income when spent
const RMD_BEARING = ["trad"];           // subject to an RMD — annuity and roth are NOT
const INDIVIDUAL = ["trad", "roth", "annuity"];  // cannot be held jointly

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
  if (/\bannuit(y|ies)\b/i.test(s)) return "annuity";   // ORDER: before the pre-tax rule
  if (/\bira\b|\brollover\b|401\s*\(?k\)?|403\s*\(?b\)?|\b457\b|\bpension\b|state\s+plan|\bsep\b|\bsimple\b/i.test(s)) return "trad";
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
// v5.26 SPLIT THE $111,000. It is still $111,000 of ordinary-income money — the figure v5.24
// published — but only $104,000 of it carries an RMD. The $7,000 annuity is taxed the same way
// and forced out at no age. Both halves are asserted, because the whole point of the split is
// that these two questions have different answers.
ck("ordinary-income money still totals exactly $111,000 (what v5.24 published)",
   ORDINARY.reduce((t, k) => t + sum(k), 0) === 111000,
   `trad ${sum("trad")} + annuity ${sum("annuity")}`);
ck("RMD-bearing money is $104,000 — the annuity is NOT forced out", sum("trad") === 104000, `got ${sum("trad")}`);
ck("the annuity is exactly the $7,000 difference", sum("annuity") === 7000, `got ${sum("annuity")}`);
ck("taxable totals exactly $21,000", sum("taxable") === 21000, `got ${sum("taxable")}`);
ck("hsa totals exactly $15,000", sum("hsa") === 15000, `got ${sum("hsa")}`);
ck("roth totals exactly $0", sum("roth") === 0, `got ${sum("roth")}`);
ck("the five buckets still sum to the $147,000 pot v5.24 named",
   TYPES.reduce((t, k) => t + sum(k), 0) === 147000,
   TYPES.map(k => `${k} ${sum(k)}`).join(" "));

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
P("Spouse B - Annuity", "annuity");   // v5.26: its own type, because it carries no RMD
P("Variable Annuities", "annuity");
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
  { name: "Spouse B - Annuity", balance: 7000 },              // annuity, owner B by name -> untouched
  { name: "Big Contract", balance: 30000, owner: "JT", taxType: "annuity" },  // JT ANNUITY -> promote
] } });
const d5 = g.PORTFOLIO().otherAccounts;
const byName = Object.fromEntries(d5.map(a => [a.name, a]));

// The invariant below is worthless unless the fixture actually CONTAINS trad/roth rows: on a build
// with no taxType at all the condition is never true and the assertion passes while testing nothing.
// That is the OPERATIONS §B2 failure exactly, so the precondition is asserted first.
// v5.26: `annuity` joined the individually-owned set. An annuity has no RMD, so the original
// rationale (an RMD needs a person's age) does not apply — but survivor treatment at the first
// death still has to know whose contract it is, and a mixed rule would be arbitrary in the UI.
const _retRows = d5.filter(a => INDIVIDUAL.includes(a.taxType));
ck("PRECONDITION: the fixture really does contain individually-owned rows (invariant is not vacuous)",
   _retRows.length === 4, `found ${_retRows.length}, expected 4`);
ck("PRECONDITION: and one of them is an ANNUITY entered as Joint (the NC-8 gap)",
   d5.some(a => a.taxType === "annuity" && a.name === "Big Contract"), "no JT annuity in the fixture");
ck("a jointly-entered ANNUITY is promoted to A, like trad and roth",
   (byName["Big Contract"] || {}).owner === "A", (byName["Big Contract"] || {}).owner);
ck("SCHEMA INVARIANT: no trad/roth/annuity row is owned JT after migration",
   _retRows.length > 0 && d5.every(a => !(INDIVIDUAL.includes(a.taxType) && a.owner === "JT")),
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

// GAP CLOSED AFTER A NEGATIVE CONTROL DID NOT FIRE (§B2). Breaking the owner split back to the
// naive `owner === "A"` form broke nothing, because every fixture here already carried an owner.
// The fail-safe exists precisely for rows that do NOT — a plan restored from a draft, or any path
// that skips the back-fill. Money falling out of the pre-tax basis is the OPTIMISTIC direction:
// less trad means less tax and a smaller RMD, so the plan looks better than it is.
// Set DIRECTLY, bypassing applyLoadedData — which is the only way to reach this. The migration
// back-fills a missing owner, so a loaded plan never has one absent; the fail-safe protects the
// paths that skip migration (a draft restore, a direct state write, a future entry path). That is
// exactly why the first attempt at this test passed under the broken build: it went through
// applyLoadedData and never produced the shape it was meant to test.
g.setPortfolio({ positions: [], total401k: 0, household: 50000, asOfYr: 2026, otherAccounts: [
  { name: "Mystery Account", balance: 50000, taxType: "trad" },   // NO owner at all
] });
{
  const rsb = g.retireStartBalances(2027);
  ck("CONSERVATION: a row with NO owner still reaches the pre-tax basis (it is not lost)",
     rsb.othOrdA + rsb.othOrdB === 50000, `A ${rsb.othOrdA} B ${rsb.othOrdB}`);
  ck("...and it lands on A, not nowhere", rsb.othOrdA === 50000, `${rsb.othOrdA}`);
  ck("CONSERVATION: the same holds for the RMD basis",
     rsb.othRmdA + rsb.othRmdB === 50000, `A ${rsb.othRmdA} B ${rsb.othRmdB}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// E. THE INVERSION — every engine now READS taxType, and the annuity still has no RMD
// ─────────────────────────────────────────────────────────────────────────────
// THIS SECTION ASSERTED THE EXACT OPPOSITE THROUGH v5.25, DELIBERATELY. Until this release no
// engine read the field, and that was provable by permuting every type and requiring byte-
// identical output. It was what made "all 787 checks return identical figures" mean something.
//
// v5.26 is the release that reads the field, so the old assertion must FAIL — and leaving it in
// place would have kept the suite green while testing the reverse of the truth. It is replaced,
// not deleted, by three assertions that are harder to satisfy than the one they retire.
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
  // dobA/dobB are the "YYYY-MM-DD" STRINGS the My Data form writes — the only shape
  // `buildPlanTimeline` reads (`_ymd` returns null for anything else). Through v5.36 these lines
  // were OBJECTS labelled 1962/1964, silently ignored; the suite ran the resolved defaults,
  // 1964-01-01 / 1966-01-01, while declaring a different household (E-17, found at v5.35).
  // CORRECTED AT v5.37 TO DECLARE THE HOUSEHOLD THAT RUNS. Measured, not assumed: with these
  // strings all five engines are value-identical to the object-dob run across all eight t20
  // households (canonical-JSON hashes equal; the sole raw-byte delta is dob key order inside the
  // `_tlW` debug echo, {month,day,year} from the master-prompt parse vs {year,month,day} from
  // `_ymd`). The labelled 1962/1964 household was also measured, and REJECTED for a reason: it
  // does not exhaust the Priority-1 pool in-horizon, and outside the full-exhaustion regime the
  // E2 exact invariants are undefined — both pins fail on the unchanged v5.36 engine (excess
  // $457,490 not $600,000; trad−ann $135,282 not $0). Keeping the resolved dates keeps the
  // invariants meaningful. If a future edit changes these dobs, section E2's exacts MUST be
  // re-derived in the regime the new household actually occupies.
  // `t7_accrual.mjs` carried the same object shape and was swept the same way at v5.37.
  single: false, nameA: "A", nameB: "B",
  dobA: "1964-01-01", dobB: "1966-01-01",
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
    // FROM THE SHARED CONSTRUCTOR, exactly as the app builds it. Hand-rolling these from
    // `positions` — which this suite did through v5.25, when it made no difference — silently
    // excludes every Other account, so Engine A would be handed a basis that cannot see the field
    // and would "prove" it does not read it. The trap is that such a P looks entirely reasonable.
    ...g.retireStartBalances(2027),
    taxableInit: g.taxableInitAll ? g.taxableInitAll() : sum(p => Math.max(0, (p.balance || 0) - (p.roth || 0) - (p.trad || 0))),
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

ck("INVERSION: permuting every taxType now CHANGES engine output",
   asIs !== flipped,
   asIs === flipped ? "no engine reads taxType \u2014 the v5.26 wiring is missing or unreached" : "");
ck("the comparison is not vacuous (engines actually produced output)",
   asIs.length > 2000, `serialized length ${asIs.length}`);

// PER ENGINE, AT ITS OWN BASIS. The parent scope required this explicitly: a single combined
// fingerprint can go green because ONE engine moved while the other four never read the field.
// Each is therefore asserted separately, on its own output, never through a shared helper.
{
  const eng = ["withdrawal", "roth", "mc", "stress", "checks"];
  const A = JSON.parse(asIs), B = JSON.parse(flipped);
  for (const k of eng) {
    const moved = JSON.stringify(A[k]) !== JSON.stringify(B[k]);
    // THREE of these must NOT move, and each for its own stated reason. Asserting "everything
    // moves" would have been wrong, and asserting it loosely ("something moved") would pass while
    // four of the five ignored the field. Verified against the source, not assumed:
    //   mc      — runMonteCarlo reads PORTFOLIO.household and bucketActuals. Classification
    //             touches neither. This is the mechanical statement of "the fix has not
    //             overreached", and the reason parity stays 8/8 strict.
    //   stress  — runStressTests is runExtendedMC with forced scenario years. Same basis as mc.
    //   checks  — buildVerificationChecks compares published tax constants against IRS Rev. Proc.
    //             sources. It contains no household money at all.
    const MUST_NOT_MOVE = { mc: "reads household and bucketActuals, not taxType",
                            stress: "is the Monte Carlo under forced scenarios — same basis",
                            checks: "asserts IRS constants, not this household's money" };
    if (MUST_NOT_MOVE[k]) {
      ck(`GUARD: "${k}" does NOT move \u2014 ${MUST_NOT_MOVE[k]}`, !moved, "it moved; the fix has reached further than intended");
    } else {
      ck(`engine "${k}" reads taxType at its own basis`, moved, "did not move under permutation");
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// E2. THE NEW EXTINCTION — annuity money never generates an RMD, in ANY engine.
// ─────────────────────────────────────────────────────────────────────────────
// This is the assertion that replaces the old one as the thing that must never come back.
// v5.25 recorded annuities as `trad`, which was conservative for tax and WRONG for RMD: it
// manufactured a legal obligation the owner does not have and forced money out early. During
// this build the defect was found still live in three of the five engines AFTER the schema was
// correct, because Engines A, B and C compute RMDs from a running trad balance. It was found a
// second time in the spousal-rollover path, where the exempt SHARE was applied to the merged
// balance and exempted far more than the annuity was worth. Twice in one release is why this
// is pinned rather than trusted.
console.log("\nE2. The annuity carries NO RMD \u2014 in any engine");
{
  const mkHH = (t) => ({ ...HH, otherAccounts: [
    { name: "Rollover IRA (A)", balance: 200000, owner: "A", taxType: "trad" },
    { name: "Big Contract", balance: 400000, owner: "B", taxType: t },
  ] });
  const asTrad = mkHH("trad"), asAnn = mkHH("annuity");

  g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(asTrad)) });
  const rT = g.retireStartBalances(2027);
  g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(asAnn)) });
  const rA = g.retireStartBalances(2027);

  ck("PRECONDITION: the two fixtures differ ONLY in that one row's type (not vacuous)",
     rT.tradInit === rA.tradInit && rT.tradInit > 0, `${rT.tradInit} vs ${rA.tradInit}`);
  ck("TAX basis is IDENTICAL \u2014 an annuity is ordinary income just like Traditional",
     rT.tradInit === rA.tradInit && rT.tradInitB === rA.tradInitB, `${rT.tradInitB} vs ${rA.tradInitB}`);
  ck("RMD basis is LOWER by exactly the annuity balance",
     rT.rmdInit - rA.rmdInit === 400000, `delta ${rT.rmdInit - rA.rmdInit}`);
  ck("the RMD-exempt share carries the annuity exactly",
     Math.round(rA.annShareB * rA.tradInitB) === 400000, `${Math.round(rA.annShareB * rA.tradInitB)}`);
  ck("a household with NO annuity has a zero exempt share (not vacuous)",
     rT.annShareA === 0 && rT.annShareB === 0, `${rT.annShareA}/${rT.annShareB}`);

  // AND IN ENGINE D, END TO END. Two things had to be got right here, and both were got wrong first:
  //
  //   OWNERSHIP. The row must be owned by A. On the example household B's RMD age falls outside
  //   the plan horizon, so a B-owned account produces no RMD for ANY type and the comparison is
  //   vacuous — it passed while testing nothing. That is the §B2 failure, caught here by the
  //   numbers being identical to the dollar across all three types.
  //
  //   MAGNITUDE. The effect in Engine D is SMALL (~$900 of lifetime RMD on $600,000), because the
  //   draw order spends Other accounts FIRST and this release deliberately did not change it. By
  //   the time RMDs begin, most of the money is gone. The bulk of the annuity's effect lands in
  //   Engines A/B/C, which read the basis at retirement. A threshold assertion here would be
  //   arbitrary, so the strong EXACT statement is used instead: an annuity produces precisely the
  //   same lifetime RMD as a brokerage account — that is, none of its own.
  const rmdOf = (p) => { g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(p)) });
    const r = g.computeWithdrawalPlan({ retireYear: 2027, rothAmount: 0, scenarioPreset: "base" });
    return r.schedule.reduce((s, x) => s + (x.rmd_y || 0), 0); };
  // `household` must include the row, or Engine D's Priority-1 pool (household - total401k) is
  // smaller than the account it is supposed to contain and the RMD tracker is capped away.
  const ownedA = (t) => ({ ...HH, household: HH.total401k + 600000,
    otherAccounts: [{ name: "Big Contract", balance: 600000, owner: "A", taxType: t }] });
  const lifeTax = rmdOf(ownedA("taxable")), lifeTrad = rmdOf(ownedA("trad")), lifeAnn = rmdOf(ownedA("annuity"));
  ck("Engine D: a TRADITIONAL Other account RAISES lifetime RMD above a brokerage one",
     lifeTrad > lifeTax, `trad ${Math.round(lifeTrad)} vs taxable ${Math.round(lifeTax)}`);
  ck("Engine D: an ANNUITY produces EXACTLY the same lifetime RMD as a brokerage account \u2014 none",
     lifeAnn === lifeTax, `annuity ${Math.round(lifeAnn)} vs taxable ${Math.round(lifeTax)}`);
  ck("PRECONDITION: the trad case really does differ (the comparison is not vacuous)",
     lifeTrad !== lifeTax, "all three identical \u2014 the RMD path is unreached for this fixture");

  // ───────────────────────────────────────────────────────────────────────────
  // AND THE HEADLINE BEHAVIOUR ITSELF: spending this money produces TAXABLE INCOME.
  // ───────────────────────────────────────────────────────────────────────────
  // ADDED BECAUSE A NEGATIVE CONTROL DID NOT FIRE (§B2). Deleting `othOrdDraw` from Engine D's
  // magi — the single line that makes a spent IRA taxable, and the entire point of this release —
  // broke NOTHING in the suite. The permutation assertion above still passed, because the
  // withdrawal output also moves via the RMD base, so "the engine moved" was true for the wrong
  // reason. That is the §B2 failure exactly: a coarse assertion standing in for a specific one.
  //
  // The exact statement, as first written: every dollar of ordinary-income money is taxed ONCE
  // on its way out, so the lifetime MAGI difference between an all-Traditional and an all-Taxable
  // Other account is the account balance itself. Hand-verified at $600,000 when written.
  // v5.36: MAGI is now TWO things — ordinary income and realized capital gain — so the
  // decomposition is taken here rather than comparing the blended total. That is not a
  // convenience: the ordinary invariant this block exists to state is only visible once the
  // gain series is separated out, and comparing totals would have silently absorbed a gain
  // difference into a statement about income tax.
  // v5.37: the statement itself is AMENDED — "the balance itself" was E-15's optimistic
  // fingerprint (growth escaped tax). It is now: every ordinary dollar INCLUDING ITS GROWTH is
  // taxed once on its way out, so the excess is the balance plus the growth recognised. The
  // exact figures are pinned below.
  const planOf = (p) => { g.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(p)) });
    const r = g.computeWithdrawalPlan({ retireYear: 2027, rothAmount: 0, scenarioPreset: "base" });
    const magi = r.schedule.reduce((s, x) => s + (x.magi || 0), 0);
    const gain = r.schedule.reduce((s, x) => s + (x.capGain_y || 0), 0);
    return { magi, gain, ord: magi - gain }; };
  const pTax = planOf(ownedA("taxable")), pTrad = planOf(ownedA("trad")), pAnn = planOf(ownedA("annuity"));
  const magiTax = pTax.magi, magiTrad = pTrad.magi, magiAnn = pAnn.magi;
  ck("Engine D: a TRADITIONAL Other account is taxed as ordinary income when spent",
     magiTrad > magiTax, `trad ${Math.round(magiTrad)} vs taxable ${Math.round(magiTax)}`);
  ck("PRECONDITION: the taxable baseline really is lower (not vacuous)",
     magiTax > 0 && magiTax < magiTrad, `${Math.round(magiTax)}`);
  // THE EXACT ONE — and at v5.37 the figure it pins CHANGED, deliberately. Through v5.36 this
  // asserted the excess is EXACTLY the $600,000 opening balance, and that exactness was E-15's
  // fingerprint: `taxOrd` was depleted but never grown, so only the dollars the account STARTED
  // with were ever recognised as ordinary income — every dollar the money grew escaped tax
  // entirely (optimistic, the direction this app exists to avoid). v5.37 grows the ordinary
  // sub-pool at the sleeve's own rate, so the lifetime excess is now the balance PLUS the growth
  // recognised on the way out: $600,000 + $124,266 = $724,266 on this household. Derived by an
  // independent simulator (its own IRS Pub 590-B divisor table, its own ledger) BEFORE the
  // engine was edited, and matched by the edited engine to six decimals (724,266.004427 both).
  // If this reads 600000 again, E-15 is back — see the extinction below.
  ck("Engine D: an ANNUITY's lifetime ORDINARY excess is the balance PLUS its growth \u2014 EXACTLY $724,266 (v5.37)",
     Math.round(pAnn.ord - pTax.ord) === 724266, `delta ${Math.round(pAnn.ord - pTax.ord)}`);
  // THE E-15 EXTINCTION, as the inequality that survives future re-derivations: ordinary money
  // must recognise MORE than it started with, because it grew before it left. A release that
  // stops growing `taxOrd` collapses the excess back to exactly the opening balance and fails
  // here even if the exact pin above were re-derived for some other legitimate reason.
  ck("EXTINCTION (E-15): the ordinary excess EXCEEDS the opening balance \u2014 growth is taxed on the way out",
     (pAnn.ord - pTax.ord) > 600000.005, `excess ${(pAnn.ord - pTax.ord).toFixed(2)} vs opening balance 600000`);
  // ⚠ REWRITTEN AT v5.36, NOT RELAXED — and the reason is the point of the assertion.
  // Through v5.35 this asserted `magiTrad > magiAnn` and explained the gap as the RMD forcing
  // extra taxable withdrawals. That explanation was ALREADY FALSE when it was written: lifetime
  // `drawFromTaxable` is identical to the dollar across all four tax types (730,062), so no extra
  // withdrawal was ever forced. The real gap was $102.34 of clamp artifact — the `Math.max(0,…)`
  // floor on `taxOrd` biting once `taxRmdA` outlived it, which v5.35's own release notes
  // identified correctly while this assertion kept the wrong reason.
  // v5.36 measures the ordinary fraction on the post-sleeve-RMD pool, which reserves the sleeve's
  // RMD out of `taxOrd` BEFORE the spending draw takes its share, so the floor can no longer bite
  // and the residual goes to zero. The invariant this block exists to state — every dollar of
  // ordinary money is taxed exactly ONCE on its way out — therefore becomes EXACT, and is
  // asserted as such. A stronger statement replacing a weaker one that was true for a wrong
  // reason; if a future release reintroduces a gap, this fails rather than absorbing it.
  // v5.37: measured SURVIVING the ordinary-growth edit to six decimals (0.000000) — both rows'
  // sub-pools grow at the same rate and exhaust within the horizon, so growing them changes
  // WHAT is recognised, not whether the two recognise the same total. NOTE THE REGIME BOUND:
  // this exactness (and the $724,266 pin above) is a property of FULL POOL EXHAUSTION in-horizon.
  // On a household whose pool outlives the plan, trad's forced RMD recognises ordinary income
  // the annuity legitimately defers past the horizon, and the honest figure is nonzero — measured
  // at v5.37 on a 1962/1964 household: $135,282 on the unchanged v5.36 engine. If these dobs or
  // balances ever change, re-derive in the new regime; do not carry these exacts.
  ck("Engine D: TRADITIONAL and ANNUITY recognise IDENTICAL lifetime ORDINARY income \u2014 the $102 clamp residual is GONE",
     Math.round(pTrad.ord - pAnn.ord) === 0, `excess ${Math.round(pTrad.ord - pAnn.ord)} (was $102 through v5.35)`);
  ck("PRECONDITION: the two really are being compared (both above the brokerage case)",
     pTrad.ord > pTax.ord && pAnn.ord > pTax.ord, `trad ${Math.round(pTrad.ord)} ann ${Math.round(pAnn.ord)} tax ${Math.round(pTax.ord)}`);
  // What IS left between them is capital gain, and it has a mechanism: the forced distribution
  // pulls ordinary dollars out of the Priority-1 pool faster, so a proportionally larger share of
  // what remains is gains-bearing and accrues gain on growth. Small, and in the conservative
  // direction (the RMD-bearing household is taxed slightly more, not less).
  ck("Engine D: the whole trad-vs-annuity MAGI difference is CAPITAL GAIN, not a second taxation",
     Math.round(pTrad.magi - pAnn.magi) === Math.round(pTrad.gain - pAnn.gain),
     `magi delta ${Math.round(pTrad.magi - pAnn.magi)} vs gain delta ${Math.round(pTrad.gain - pAnn.gain)}`);
  ck("Engine D: and it is second-order against the $600,000 balance",
     Math.abs(pTrad.magi - pAnn.magi) < 5000, `delta ${Math.round(pTrad.magi - pAnn.magi)}`);
  ck("Engine D: TRADITIONAL still raises the lifetime RMD (the forced distribution is real)",
     lifeTrad > lifeTax, `trad ${Math.round(lifeTrad)} vs taxable ${Math.round(lifeTax)}`);
  // v5.36 SPLIT IN TWO — and this is the assertion that discriminates decision 7 (scope §5a).
  // Through v5.35 an HSA row and a brokerage row produced identical MAGI, because neither
  // produced anything. They must NOT be identical now: both are free of ordinary income, but a
  // brokerage row's growth is a capital gain and an HSA's is not. If these two ever converge
  // again, the HSA share has stopped being excluded from the gains-bearing pool.
  const pHsa = planOf(ownedA("hsa"));
  ck("Engine D: an HSA row is NOT taxed as ordinary income on the way out (decision C-4)",
     Math.round(pHsa.ord) === Math.round(pTax.ord), `hsa ${Math.round(pHsa.ord)} vs taxable ${Math.round(pTax.ord)}`);
  ck("Engine D: and an HSA row generates STRICTLY LESS capital gain than a brokerage row (scope decision 7)",
     pHsa.gain < pTax.gain - 1000, `hsa gain ${Math.round(pHsa.gain)} vs taxable gain ${Math.round(pTax.gain)}`);
  ck("PRECONDITION: the brokerage comparator really does generate gain (not a vacuous inequality)",
     pTax.gain > 1000, `taxable gain ${Math.round(pTax.gain)}`);
}

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
// G2. THE v5.26 RE-MIGRATION — recovering what v5.25's schema flattened
// ─────────────────────────────────────────────────────────────────────────────
// v5.25 had no `annuity` type, so it stored annuities as `trad`. After that migration the data
// cannot distinguish "trad because annuity" from "trad because 401k" — the information is gone
// and only the NAME can recover it. Reading the name HERE is not a breach of "engines trust the
// stored field only": migration is not an engine, and back-filling from names is this file's
// established idiom. It is bounded, one-time, and reported, which is what makes it acceptable.
console.log("\nG2. Re-migration of v5.25-shaped annuities");

g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [
  { name: "Spouse B - Annuity", balance: 7000, owner: "B", taxType: "trad" },   // re-classify
  { name: "Rollover IRA (A)", balance: 70000, owner: "A", taxType: "trad" },    // leave alone
  { name: "The Annuity Fund 401k", balance: 5000, owner: "A", taxType: "trad" },// FALSE POSITIVE
  { name: "Joint brokerage", balance: 9000, owner: "JT", taxType: "taxable" },  // untouched
] } });
const rm = g.PORTFOLIO(), rmBy = Object.fromEntries(rm.otherAccounts.map(a => [a.name, a]));
ck("a v5.25 annuity stored as trad is re-classified", rmBy["Spouse B - Annuity"].taxType === "annuity",
   rmBy["Spouse B - Annuity"].taxType);
ck("a genuine Traditional account is NOT touched", rmBy["Rollover IRA (A)"].taxType === "trad",
   rmBy["Rollover IRA (A)"].taxType);
ck("a taxable account is NOT touched", rmBy["Joint brokerage"].taxType === "taxable",
   rmBy["Joint brokerage"].taxType);
ck("the re-classification is REPORTED, both rows", (rm._otherTypeMigrated.reclassified || []).length === 2,
   JSON.stringify(rm._otherTypeMigrated && rm._otherTypeMigrated.reclassified));
// The false positive is the reason the notice has to name what it changed. A 401k that happens to
// be called "The Annuity Fund" is re-classified and would lose its RMD — so the user is told.
ck("a FALSE POSITIVE is named in the notice so the user can put it back",
   (rm._otherTypeMigrated.reclassified || []).includes("The Annuity Fund 401k"),
   JSON.stringify(rm._otherTypeMigrated && rm._otherTypeMigrated.reclassified));
// ONE TIME ONLY: a plan already carrying `annuity` must not raise the notice again, or the
// warning becomes furniture and stops being read.
g.applyLoadedData({ portfolio: { positions: [], otherAccounts: [
  { name: "Spouse B - Annuity", balance: 7000, owner: "B", taxType: "annuity" },
] } });
ck("an already-re-classified plan raises NO notice (one time only)",
   !g.PORTFOLIO()._otherTypeMigrated, JSON.stringify(g.PORTFOLIO()._otherTypeMigrated));

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
  ["Spouse B - Annuity", "annuity"], ["Spouse B - State Plan", "trad"],
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
