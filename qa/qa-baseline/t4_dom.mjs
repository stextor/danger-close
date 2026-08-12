// t4 — DOM TAB-WALK (baseline rebuild, 2026-08).
// Run: node t4_dom.mjs v592 | node t4_dom.mjs v510
// Mounts the real component in jsdom, loads the example household, clicks all 26 tabs,
// and asserts per-tab signature content plus cross-cutting UI contracts. Signature
// strings were grounded against a captured v5.9.2 DOM (cap_tabs.mjs), not guessed.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2] || "v510";

// ─── v5.22: VERSION-TAG REGISTRY GUARD ───
// An UNREGISTERED tag used to evaluate every ladder below as false and fall off the end of every
// ternary chain, silently running the OLDEST branch: pre-v5.11 expectations and v5.10 version
// strings. That is fail-OPEN — a new build got a WEAKER test, not a stronger one — and it could
// change the CHECK COUNT: with an unregistered tag t3 ran 35 checks instead of 36, and the count is
// the number that goes in the release headline. Registering a new version in the ladders below is
// now mandatory, and an unregistered tag stops the run instead of quietly testing the wrong thing.
const KNOWN_VERSIONS = ["v510", "v5101", "v5102", "v511", "v512", "v513", "v514", "v515", "v516", "v517", "v518", "v519", "v520", "v521", "v522", "v523", "v524", "v525", "v526", "v527", "v528", "v529", "v592"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log("\n  \u2717 FATAL: version tag \"" + VER + "\" is not registered in this suite.");
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to the version ladders in this file BEFORE running.");
  process.exit(1);
}

const IS510 = VER !== "v592"; // v5.10-family features (v510 and v5101)
require(`./dom_${VER}.cjs`);
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const g = window.__g;
const React = require("react");

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + String(detail).slice(0, 160) : ""}`); }
};
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
const has = (txt, s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(txt);

console.log(`t4 — DOM TAB-WALK (${VER})`);

// ═══ Landing screen ═══
await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
{
  const t = body().textContent || "";
  T("LANDING: guided setup offered", has(t, "Guided Setup"));
  T("LANDING: start fresh offered", has(t, "start fresh"));
  T("LANDING: restore backup offered", has(t, "Restore from Backup") || has(t, "restore a backup"));
  T("LANDING: example data offered", has(t, "example data"));
  T("LANDING: privacy statement present", has(t, "nothing leaves this browser") || has(t, "cached locally"));
}

// ═══ Load the example household ═══
const example = [...body().querySelectorAll("button, div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
T("LOAD: example-data control found", !!example);
await click(example); await flush(); await flush();
{
  const t = body().textContent || "";
  // Exact per-tag string: "v5.10" is a PREFIX of v5.10.1/v5.10.2, so a substring test
  // passed for the whole v5.10 family by luck and broke at v5.11. Map the tag explicitly.
  const _badge = VER === "v529" ? "v5.29" : VER === "v528" ? "v5.28" : VER === "v527" ? "v5.27" : VER === "v526" ? "v5.26" : VER === "v525" ? "v5.25" : VER === "v524" ? "v5.24" : VER === "v523" ? "v5.23" : VER === "v522" ? "v5.22" : VER === "v521" ? "v5.21" : VER === "v520" ? "v5.20" : VER === "v519" ? "v5.19" : VER === "v518" ? "v5.18" : VER === "v517" ? "v5.17" : VER === "v516" ? "v5.16" : VER === "v515" ? "v5.15" : VER === "v514" ? "v5.14" : VER === "v513" ? "v5.13" : VER === "v512" ? "v5.12" : VER === "v511" ? "v5.11" : VER === "v5102" ? "v5.10.2"
    : VER === "v5101" ? "v5.10.1" : IS510 ? "v5.10" : "v5.9.2";
  T(`SHELL: version badge reads ${_badge}`, t.includes(_badge));
  T("SHELL: amber example-data banner fires", has(t, "EXAMPLE DATA MODE") || has(t, "built-in example household"));
  T("SHELL: no red substitution warning on the demo", !has(t, "USING EXAMPLE NUMBERS, NOT YOUR DATA"));
  T("SHELL: no staleness strip on a current-year build", !has(t, "STALE DATA"));
}

// ═══ Tab strip ═══
const tabs = () => [...body().querySelectorAll("button.tab")];
{
  T("TABS: 26 tabs in full mode", tabs().length === 26, String(tabs().length));
  const labels = tabs().map(b => b.textContent.trim());
  T("TABS: canonical order starts my data → dashboard", labels[0] === "my data" && labels[1] === "dashboard");
  T("TABS: ask AI present", labels.includes("ask AI"));
}

// ═══ Walk every tab; capture text ═══
const per = {};
for (const b of tabs()) {
  await click(b); await flush();
  per[b.textContent.trim()] = (body().textContent || "").replace(/\s+/g, " ");
}
T("WALK: every tab rendered substantial content", Object.entries(per).every(([k, v]) => v.length > 6000),
  Object.entries(per).filter(([k, v]) => v.length <= 6000).map(([k, v]) => `${k}:${v.length}`).join(","));

const sig = (tab, strings) => { for (const s of strings) T(`${tab}: "${s.length > 34 ? s.slice(0, 34) + "…" : s}"`, has(per[tab] || "", s)); };

sig("my data", ["SALARY & 401(k) CONTRIBUTIONS", "SAVE & APPLY", "OTHER INCOME STREAMS", "EXPORT BACKUP"]);
sig("dashboard", ["Will my money last", "How much can I spend", "Can I survive a crash"]);
sig("trajectory", ["Guyton"]);
sig("expenses", ["drops off"]);
sig("income", ["INCOME FLOOR", "PENSION"]);
sig("ss", ["TRUST-FUND DEPLETION", "BREAKEVEN"]);
sig("grade", ["ESTATE READINESS"]);
sig("ranking", ["SCF", "Empower"]);
sig("guardrails", ["GUYTON-KLINGER", "80%", "120%"]);
sig("withdrawal", ["ORDER OF OPERATIONS", "Traditional"]);

// ═══ v5.24 EXTINCTION — the Priority 1 panel must not claim the taxable pot is already-taxed ═══
// Same shape t8 uses for source invariants, applied to rendered text. Engine D's `_taxInit`
// (L4003 at v5.23/v5.24) is `household - total401k`, so it swallows every "Other account" —
// named IRAs, annuities and state plans included. Engine D then spends that pot with no entry in
// `magi` (L4162), no tax on its growth (L4151) and no RMD (RMD basis is buckets only, L4095-4103).
// The old copy called it "Already-taxed principal. Only the gains are taxed", which was false in
// both halves. These assertions FAIL if either false claim returns, in any casing or spacing.
// NOT pinned defects: the modelling is unchanged and remains wrong. Release (c) fixes the model;
// this release only stops the app from denying it. Flip nothing here when (c) lands — instead
// re-point these at whatever (c) makes true.
if (VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529") {
  const w = per["withdrawal"] || "";
  const norm = w.toLowerCase();
  T("V524 withdrawal: 'already-taxed principal' claim is GONE", !norm.includes("already-taxed principal"));
  T("V524 withdrawal: 'only the gains are taxed' claim is GONE", !norm.includes("only the gains are taxed"));
  T("V524 withdrawal: no LTCG rate table on the taxable panel", !norm.includes("long-term cap gains: 0%"));
  T("V524 withdrawal: pot is described as including Other accounts",
    norm.includes("everything you entered under other accounts"));
  // v5.26 REPLACED THIS COPY, and the replacement is asserted rather than the assertions deleted.
  // Through v5.25 this panel disclosed a known limitation: the whole pot was spent tax-free with
  // no RMD, and it promised a later release would fix it. THIS is that release, so every one of
  // those statements is now false and had to move with the model.
  T("V526 withdrawal: names what is taxed as ordinary income",
    norm.includes("traditional and annuity money is taxed as ordinary income"));
  T("V526 withdrawal: says Traditional money now counts toward the RMD",
    norm.includes("traditional balances count toward your rmd"));
  T("V526 withdrawal: Taxable and HSA are still spent tax-free", norm.includes("spent tax-free"));
  T("V526 withdrawal: tells the user their figures moved, and why",
    norm.includes("if your numbers moved, that is why"));
  T("V526 withdrawal: names the remaining simplification (proportional, not sequential)",
    norm.includes("in proportion to what the pool holds"));
  // EXTINCTION: the three v5.24/v5.25 statements this release falsified must not survive anywhere
  // on the tab. A stale disclosure is worse than none — it tells the user the opposite of the truth.
  T("EXTINCTION: 'growth is never taxed' is GONE", !norm.includes("growth is never taxed"));
  T("EXTINCTION: 'produces no RMD' is GONE", !norm.includes("produces no rmd"));
  T("EXTINCTION: the promise of a future fix is GONE", !norm.includes("a future release will classify"));
}
sig("roth", ["WEALTH CROSSOVER", "CONVERSION", "RMD"]);
sig("taxes", ["QCD", "bracket"]);
sig("irmaa", ["lookback", "Affects"]);
sig("monte carlo", ["STOCHASTIC LONGEVITY", "LTC DISTRIBUTION", "SUCCESS"]);
sig("backtest", ["1966", "1929"]);
sig("what breaks", ["shock"]);
sig("survivor", ["widow", "years alone"]);
sig("stress", ["LTC MARATHON", "STAGFLATION", "Sharpe"]);
sig("checklist", ["Beneficiary", "SURVIVOR-CRITICAL"]);
sig("exit plan", ["CONFIRM THE MONEY WORKS", "LOCK IN HEALTH COVERAGE", "LANDMINE"]);
sig("positions", ["TICKER", "BALANCE"]);
sig("ask AI", ["EXECUTE", "OFFLINE", "EXACTLY WHAT"]);
sig("skins", ["TACTICAL", "paper"]);
sig("docs", ["FIELD MANUAL"]);
sig("verify", ["IRS Rev. Proc", "IRMAA"]);
sig("events", ["MEDICARE", "RMD", "HSA", "BACKUP"]);

// ═══ v5.24 EXTINCTION — the Field Manual carries the same correction ═══
// DOCS_HTML reaches the DOM ONLY through <iframe srcDoc={...}> (v5.24 L5625), and jsdom does not
// fold iframe srcdoc into body.textContent. Reading per["docs"] here would make every assertion
// below pass vacuously on BOTH builds — the OPERATIONS section B2 failure. Read the attribute.
if (VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529") {
  const docsTab = tabs().find(b => b.textContent.trim() === "docs");
  await click(docsTab); await flush();
  const frame = body().querySelector('iframe[title="Danger Close Documentation"]');
  T("V524 docs: the Field Manual iframe is present", !!frame);
  const man = (frame && frame.getAttribute("srcdoc")) || "";
  T("V524 docs: srcdoc is substantial (the assertions below can actually fail)", man.length > 50000,
    String(man.length));
  T("V524 docs: 'non-retirement' mischaracterisation is GONE", !man.toLowerCase().includes("non-retirement"));
  // ── INVERTED AT v5.27, AND THESE THREE ARE WHY THE DEFECT SHIPPED ──────────────────────────
  // Through v5.26 this block asserted the PRESENCE of three v5.24 statements: that Other accounts
  // are modelled as already-taxed cash, generate no RMD, and make the Withdrawal tab optimistic.
  // Each was true when written and FALSE the moment v5.26 landed. v5.26 correctly inverted the
  // equivalent assertions for the Withdrawal tab and the My Data panel and MISSED this set — so
  // the suite stayed green partly BECAUSE the stale copy survived, and would have failed had the
  // Field Manual been corrected properly. A disclosure assertion that is not re-examined when its
  // disclosure becomes false stops being a test and becomes a lock.
  // GATED PER BUILD, AND THIS SPLIT IS THE POINT. v5.27 inverted these three assertions but left
  // them running on v5.24-v5.26 as well, so the NEW extinction checks were applied retroactively to
  // builds that legitimately still contained the old copy — and the frozen prior leg stopped
  // replaying green. A defect PIN asserts old behaviour on an old build deliberately; this was the
  // opposite, a new expectation imposed on history. Each leg must assert the copy that was TRUE
  // for its own build, which is how the v5.24 block above already works.
  if (VER === "v524" || VER === "v525" || VER === "v526") {
    // TRUE FOR THESE BUILDS. Through v5.26 the Field Manual carried the v5.24 disclosure: this
    // money is spent as already-taxed cash, generates no RMD, and the tab is optimistic as a
    // result. v5.26 falsified it in the model and failed to correct it here; v5.27 corrected it.
    T("V524-V526 docs: states Other accounts are modelled as already-taxed cash",
      man.includes("modelled as already-taxed cash"));
    T("V524-V526 docs: states no RMD is generated", man.includes("generating no RMD"));
    T("V524-V526 docs: names the direction of the error",
      man.includes("makes the Withdrawal tab optimistic"));
  } else {
    T("EXTINCTION: the manual no longer claims these accounts generate no RMD",
      !man.includes("generating no RMD"));
    T("EXTINCTION: the manual no longer calls the Withdrawal tab optimistic",
      !man.includes("makes the Withdrawal tab optimistic"));
    T("V527 docs: states the new treatment instead",
      man.includes("taxed as ordinary income as it is spent"));
    T("V527 docs: states Traditional counts toward the RMD",
      man.includes("counts toward your RMD"));
  }
  // The two statements that are STILL TRUE must survive. Deleting the false clause wholesale would
  // have replaced a wrong statement with a missing one.
  if (VER !== "v524" && VER !== "v525" && VER !== "v526") {
    T("V527 docs: KEEPS the true statement about Taxable and HSA balances",
      man.includes("Taxable and HSA balances are still modelled as already-taxed cash"));
    T("V527 docs: KEEPS the true statement that Other accounts are drawn first",
      man.includes("Other accounts are still drawn first"));
  }
  // THE ASSERTION WHOSE ABSENCE LET THE CONTRADICTION SHIP. The manual must not simultaneously say
  // this money is taxed and that it is spent tax-free in the present tense. The surviving v5.24
  // clause did exactly that, sitting one sentence after its own correction.
  // ── v5.28: the three sections the DOCS_HTML audit found stale or silent ──────────────────────
  // GATED TO v527+ / v528+ PER OPERATIONS §B2, which now requires the gate as well as the
  // inversion. v5.24-v5.27 legitimately lack this copy and must keep replaying green.
  if (VER !== "v524" && VER !== "v525" && VER !== "v526" && VER !== "v527") {
    // FINDING 1 — §07's Withdrawal Strategy entry described the pre-v5.26 model. It gave the
    // priority order as "Taxable -> Traditional -> Roth" and never mentioned the pot that is
    // actually drawn FIRST. Not false, but a reader would not learn their IRA is now taxed.
    T("V528 docs: Withdrawal entry names the Other-accounts pot as Priority 1",
      man.includes("Priority 1 is everything you entered under Other accounts"));
    T("V528 docs: ...and says how it is taxed",
      man.includes("taxed by the tax type on each row"));
    T("V528 docs: ...and still describes the bucketed order after it",
      man.includes("bucketed portfolio then follows in Taxable"));

    // FINDING 2 — §13 Limitations named none of the v5.26 simplifications, though METHODOLOGY
    // carried all five. The Field Manual is the one users actually read.
    T("V528 docs: limitations name the Other-accounts simplifications",
      man.includes("Other accounts are taxed by type, with five simplifications"));
    T("V528 docs: limitation — proportional taxation of the pot",
      man.includes("in proportion") && man.includes("not by draining one tax type before another"));
    T("V528 docs: limitation — HSA modelled tax-free throughout",
      man.includes("HSA balances are modelled as tax-free throughout"));
    T("V528 docs: limitation — the annuity is part after-tax basis",
      man.includes("annuity is part after-tax basis"));
    T("V528 docs: limitation — a QUALIFIED annuity does have an RMD",
      man.includes("annuity held inside an IRA does have an RMD"));
    T("V528 docs: limitation — unclassifiable names default to Traditional",
      man.includes("cannot classify defaults to"));

    // FINDING 3 — the what's-new section announced v5.7 as "this build" at v5.27, twenty releases
    // on, and never mentioned the three releases that changed how a user's money is taxed.
    T("EXTINCTION: the manual no longer announces v5.7 as 'this build'",
      !man.includes("What's new in v5.7") && !man.includes("(this build)"));
    T("V528 docs: what's-new covers the releases that moved figures",
      man.includes("v5.22 through v5.28") && man.includes("the one that moved figures"));
    T("V528 docs: ...and keeps the v5.7 history rather than deleting it",
      man.includes("v5.7 / v5.7.1") && man.includes("Guided Setup"));
    // The stale check-count claim that rode along in that section.
    T("EXTINCTION: the stale '53-check validation suite' claim is gone",
      !man.includes("53-check validation suite"));
  }

  if (VER !== "v524" && VER !== "v525" && VER !== "v526") {
    const claimsTaxed = /taxed as ordinary income as it is spent/i.test(man);
    const claimsFreeNow = /still drawn first — spent tax-free/i.test(man)
      || /generating no RMD — even when/i.test(man);
    T("CONSISTENCY: the manual does not both tax this money and spend it tax-free",
      claimsTaxed && !claimsFreeNow, `taxed=${claimsTaxed} tax-free-present-tense=${claimsFreeNow}`);
  }
}

// ═══ v5.25 — the Other-accounts tax type, in the DOM ═══════════════════════════════════════════
// The field is RECORDED and read by no engine, so no figure anywhere can witness it. The only
// evidence that the UI exists at all is the DOM, which makes this block the sole coverage of
// decisions D-1, D-2, D-4 and D-5 as the user actually meets them.
if (VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529") {
  await click(tabs().find(b => b.textContent.trim() === "my data")); await flush();
  const md = (body().textContent || "").replace(/\s+/g, " ");
  // Scope to the Other accounts CARD. A page-wide select query also catches the Holdings table's
  // five owner selectors, which offer A/B and are indistinguishable by shape — a filter written
  // page-wide reported 14 owner rows for a 9-row list and would have asserted against the wrong set.
  const _hdr = [...body().querySelectorAll("div")]
    .find(d => (d.textContent || "").trim().startsWith("OTHER ACCOUNTS (HSA"));
  const card = _hdr ? _hdr.closest(".card") : null;
  T("V525 my data: the Other accounts card is locatable", !!card);
  const sels = card ? [...card.querySelectorAll("select")] : [];
  const typeSels = sels.filter(x => [...x.options].some(o => o.value === "trad")
                                 && [...x.options].some(o => o.value === "hsa")
                                 && [...x.options].some(o => o.value === "taxable"));

  T("V525 my data: a tax-type selector exists on Other accounts", typeSels.length > 0, `found ${typeSels.length}`);
  T("V525 my data: one selector per Other account row", typeSels.length === 9, `found ${typeSels.length}, expected 9`);
  T("V526 my data: the selector offers exactly the FIVE types",
    typeSels.every(x => x.options.length === 5), typeSels.map(x => x.options.length).join(","));
  T("V525 my data: the selector's labels are human, not enum keys",
    typeSels.length > 0 && [...typeSels[0].options].map(o => o.textContent).join("|") === "Taxable|Traditional (pre-tax)|Roth|HSA|Annuity (non-qualified)",
    typeSels.length ? [...typeSels[0].options].map(o => o.textContent).join("|") : "");

  // D-4: the field must SAY it does nothing yet. A field that silently does nothing implies the
  // money is already handled correctly, which is the misconception v5.24 was shipped to remove.
  T("V526 my data: discloses the type now DRIVES tax and RMDs",
    md.includes("TAX TYPE DRIVES TAX, RMDs AND THE WITHDRAWAL TAB"));
  T("V526 my data: says Traditional and Annuity are taxed as ordinary income",
    md.includes("Traditional and Annuity money is taxed as ordinary"));
  T("V526 my data: says changing the field WILL move figures",
    md.includes("Changing this field WILL move your figures"));
  T("V525 my data: discloses the non-qualified annuity approximation",
    md.includes("non-qualified annuity"));

  // D-1: the old tooltip told users retirement accounts do NOT belong here, while the app itself
  // puts two IRAs, an annuity and a state plan here. That contradiction is resolved, not repeated.
  const owners = sels.filter(x => x.options.length > 0
                               && [...x.options].every(o => ["JT", "A", "B"].includes(o.value)));
  const allTitles = sels.map(x => x.getAttribute("title") || "").join(" ");
  T("V525 my data: the false 'retirement accounts live in Holdings' claim is GONE",
    !allTitles.includes("live in the Holdings table above"));
  T("V525 my data: the surviving true half — individually owned by law — is kept",
    allTitles.includes("individually owned by law"));

  // D-5: no owner selector on a trad/roth row may offer Joint. The example household has four
  // retirement rows, so this is not vacuous — asserted by counting them first.
  const jointCapable = owners.filter(x => [...x.options].some(o => o.value === "JT"));
  T("V525 my data: PRECONDITION — the household really has both row kinds",
    owners.length === 9 && jointCapable.length === 5,
    `owners=${owners.length} jointCapable=${jointCapable.length}`);
  T("V525 my data: exactly the 5 non-retirement rows offer Joint", jointCapable.length === 5,
    String(jointCapable.length));
  T("V525 my data: the 4 retirement rows offer no Joint option",
    owners.length - jointCapable.length === 4, String(owners.length - jointCapable.length));

  // The stale line above the card, which used to say Other accounts "aren't classified".
  T("V525 my data: the 'aren't classified' line is GONE", !md.includes("below aren't classified"));

  // The migration notice must NOT fire on the shipped example household — it ships fully typed.
  // If this ever goes true, every user sees a warning about data that was never migrated.
  T("V525 my data: no migration notice on the fully-typed example household",
    !md.includes("THIS PLAN PREDATES TAX TYPES"));
}

// ═══ Verify tab reflects the version's check count ═══
{
  const v = per["verify"] || "";
  // v5.14 adds three IRMAA-indexation checks to the Verify tab (see t1's note).
  const _vCount = (VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529") ? "57" : IS510 ? "54" : "53";
  T(`VERIFY TAB: reports ${_vCount} checks`, v.includes(_vCount));
  T("VERIFY TAB: no failing marks rendered", !/✗/.test(v));
}

// ═══ v5.10 My Data contract (the accrual feature's visible surface) ═══
if (IS510) {
  const md = per["my data"] || "";
  T("V510 my data: hybrid pre-tax label", md.includes("Pre-tax (Traditional 401k/IRA)"));
  T("V510 my data: Roth monthly inputs", md.includes("Roth (401k/IRA) $/month"));
  T("V510 my data: accrual framing line", md.includes("the model still taxes nothing before retirement"));
  T("V510 my data: accrual readout renders", md.includes("Projected added by retirement:"));
  T("V510 my data: readout states the nominal-dollars rule", md.includes("no growth applied"));
  T("V510 my data: HSA exclusion stated", md.includes("neither Traditional nor Roth"));
  T("V510 verify: 402(g) line present", (per["verify"] || "").includes("402(g)"));
} else {
  const md = per["my data"] || "";
  T("V592 my data: no accrual readout yet", !md.includes("Projected added by retirement:"));
  T("V592 my data: no hybrid labels yet", !md.includes("Pre-tax (Traditional 401k/IRA)"));
}

// ═══ Simple Mode round-trip ═══
{
  const toggle = [...body().querySelectorAll("button")].find(b => /SHOW FEWER TABS/.test(b.textContent || ""));
  T("SIMPLE: toggle present", !!toggle);
  if (toggle) {
    await click(toggle);
    T("SIMPLE: six core tabs", tabs().length === 6, String(tabs().length));
    T("SIMPLE: exit control appears", [...body().querySelectorAll("button")].some(b => /SHOW ALL TABS/.test(b.textContent || "")));
    const back = [...body().querySelectorAll("button")].find(b => /SHOW ALL TABS/.test(b.textContent || ""));
    await click(back);
    T("SIMPLE: full strip restored", tabs().length === 26, String(tabs().length));
  }
}

// ═══ Unsaved-edits leave guard (v5.9.1/2 contract) ═══
{
  const myData = tabs().find(b => b.textContent.trim() === "my data");
  await click(myData); await flush();
  const input = [...body().querySelectorAll("input")].find(i => i.value !== "");
  T("GUARD: an editable field exists on My Data", !!input);
  if (input) {
    await act(async () => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      proto.set.call(input, String(input.value) + "1");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await flush();
    const chip = (body().textContent || "").includes("Unsaved changes");
    T("GUARD: dirty chip appears on edit", chip);
    const dash = tabs().find(b => b.textContent.trim() === "dashboard");
    await click(dash);
    const t = body().textContent || "";
    T("GUARD: leaving dirty My Data asks first", t.includes("You have unsaved edits in My Data"));
    T("GUARD: three-way choice offered", t.includes("SAVE & APPLY, THEN LEAVE") && t.includes("DISCARD & LEAVE") && t.includes("STAY"));
    const discard = [...body().querySelectorAll("button")].find(b => b.textContent.trim() === "DISCARD & LEAVE");
    if (discard) await click(discard);
    const active = [...body().querySelectorAll("button.tab.on")].map(b => b.textContent.trim());
    T("GUARD: discard proceeds to the target tab", active.includes("dashboard"), active.join(","));
  }
}

console.log(`\nt4 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
