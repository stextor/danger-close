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
const KNOWN_VERSIONS = ["v510", "v5101", "v5102", "v511", "v512", "v513", "v514", "v515", "v516", "v517", "v518", "v519", "v520", "v521", "v522", "v523", "v524", "v525", "v526", "v527", "v528", "v529", "v530", "v531", "v532", "v533", "v534", "v535", "v536", "v537", "v538", "v539", "v540", "v541", "v542", "v543", "v544", "v545", "v546", "v547", "v592"];
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
  const _badge = VER === "v547" ? "v5.47" : VER === "v546" ? "v5.46" : VER === "v545" ? "v5.45" : VER === "v544" ? "v5.44" : VER === "v543" ? "v5.43" : VER === "v542" ? "v5.42" : VER === "v541" ? "v5.41" : VER === "v540" ? "v5.40" : VER === "v539" ? "v5.39" : VER === "v538" ? "v5.38" : VER === "v537" ? "v5.37" : VER === "v536" ? "v5.36" : VER === "v535" ? "v5.35" : VER === "v534" ? "v5.34" : VER === "v533" ? "v5.33" : VER === "v532" ? "v5.32" : VER === "v531" ? "v5.31" : VER === "v530" ? "v5.30" : VER === "v529" ? "v5.29" : VER === "v528" ? "v5.28" : VER === "v527" ? "v5.27" : VER === "v526" ? "v5.26" : VER === "v525" ? "v5.25" : VER === "v524" ? "v5.24" : VER === "v523" ? "v5.23" : VER === "v522" ? "v5.22" : VER === "v521" ? "v5.21" : VER === "v520" ? "v5.20" : VER === "v519" ? "v5.19" : VER === "v518" ? "v5.18" : VER === "v517" ? "v5.17" : VER === "v516" ? "v5.16" : VER === "v515" ? "v5.15" : VER === "v514" ? "v5.14" : VER === "v513" ? "v5.13" : VER === "v512" ? "v5.12" : VER === "v511" ? "v5.11" : VER === "v5102" ? "v5.10.2"
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
if (VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
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

  // ══ v5.35 — the Withdrawal tab discloses the sourcing change, and the draw card is relabelled ══
  // GATED PER LEG (OPERATIONS §B2). This copy is TRUE at v5.35 and legitimately absent at v5.34, so
  // asserting it on every leg would break the frozen prior leg — the v5.28 defect. Decision 3 asked
  // for a `t4` assertion precisely so this cannot go stale unnoticed: the moment a later release
  // changes the sourcing again, these fail rather than standing as a false reassurance.
  //
  // ⚠ THE SENTENCE THIS ATTACHES TO WAS ALREADY THERE AND WAS FALSE. "RMDs treated as forced trad
  // withdrawals" shipped for many releases while the sequencer actually sold brokerage to satisfy
  // them. v5.35 is the release that makes an EXISTING disclosure true — the mirror image of the
  // §B2 lock hazard, and worth naming because the usual failure runs the other way.
  if (VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
    T("V535 withdrawal: says the RMD is now sourced from where the money lives",
      norm.includes("from v5.35 that is how they are actually sourced"));
    T("V535 withdrawal: names the taxable sleeve as funding only the remainder",
      norm.includes("funds only what the rmd did not already cover"));
    T("V535 withdrawal: names the OLD behaviour it replaced (sold brokerage, handed the cash back)",
      norm.includes("sold brokerage to satisfy the rmd and handed the same cash straight back"));
    T("V535 withdrawal: states the direction — ending balances fall",
      norm.includes("ending balances fall"));
    // DELIBERATELY NOT ASSERTED HERE: "if your numbers moved, that is why". The control proved it
    // does not discriminate — v5.26's own copy on this same tab contains the phrase, so reverting
    // the whole v5.35 disclosure left it green. It is already asserted above as a V526 check, and
    // a second copy would have been coverage theatre rather than coverage (OPERATIONS §B2).
    //
    // Decision 4 — label only, arithmetic unchanged. The figure still counts every distribution
    // including unspent RMD surplus, so the label must stop reading like "what you spent".
    // ⚠ THE EXTINCTION HALF IS THE DISCRIMINATING ONE. Reverting the label alone fails the
    // extinction check and NOTHING else, because the disclosure prose names "Total withdrawn"
    // twice, so a presence check is satisfied by the paragraph whether or not the card changed.
    // Both are kept: presence would catch the label AND the prose being dropped together.
    T("V535 withdrawal: the draw card label 'Total withdrawn' is on the tab", norm.includes("total withdrawn"));
    T("V535 withdrawal: and says plainly that it is NOT what you spent",
      norm.includes("it is not a measure of what you spent"));
    T("EXTINCTION: the old 'Total portfolio draw' label is GONE", !norm.includes("total portfolio draw"));
  }
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
if (VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
  const docsTab = tabs().find(b => b.textContent.trim() === "docs");
  await click(docsTab); await flush();
  const frame = body().querySelector('iframe[title="Danger Close Documentation"]');
  T("V524 docs: the Field Manual iframe is present", !!frame);
  const man = (frame && frame.getAttribute("srcdoc")) || "";
  T("V524 docs: srcdoc is substantial (the assertions below can actually fail)", man.length > 50000,
    String(man.length));
  T("V524 docs: 'non-retirement' mischaracterisation is GONE", !man.toLowerCase().includes("non-retirement"));

  // ── v5.39 EXTINCTION — attribute over-escaping in DOCS_HTML ────────────────────────────────
  // The defect class this catches (found in the Phase-4 usability audit, shipped since <=v5.37):
  // a `class=\"plain\"` / `class=\"lbl\"` pair in the §13 callout was escaped ONE LEVEL TOO DEEP in
  // the JS string literal, so the RUNTIME html carried literal backslashes, the class never
  // applied, and the callout rendered unstyled. It was invisible to this suite because every
  // assertion here reads TEXT, and the text was fine — only the markup was broken.
  // This assertion reads the markup itself. It must stay generic (any attribute, not just
  // `plain`), because the failure is a property of how the literal is written, not of one string.
  if ((VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
    const escAttrs = man.match(/[a-zA-Z-]+=\\+"/g) || [];
    if ((VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547")) {
      T("V539 docs: EXTINCTION — no attribute in the runtime manual carries a literal backslash",
        escAttrs.length === 0, `found ${escAttrs.length}: ${[...new Set(escAttrs)].join(" ")}`);
    } else {
      T("PRIOR LEG: v5.38 still carries the over-escaped attributes (the defect v5.39 fixes)",
        escAttrs.length === 2, `found ${escAttrs.length}`);
    }
    // The callout that was broken must now actually be a styled callout, not just present as text.
    // Count the CLASS, not one element shape: the manual applies `plain` to a <div> in most
    // places and to a <span style=...> in the Taxes entry, so a `<div class="plain">` literal
    // undercounts. Verified totals: 9 on v5.38 (one pair broken), 10 on v5.39.
    const plainDivs = (man.match(/class="plain"/g) || []).length;
    const plainLbls = (man.match(/class="lbl"/g) || []).length;
    if ((VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547")) {
      T("V539 docs: all 10 plain-English callouts carry the class", plainDivs === 10, String(plainDivs));
      T("V539 docs: all 10 callout labels carry the class", plainLbls === 10, String(plainLbls));
    } else {
      T("PRIOR LEG: v5.38 has only 9 classed plain callouts", plainDivs === 9, String(plainDivs));
      T("PRIOR LEG: v5.38 has only 9 classed callout labels", plainLbls === 9, String(plainLbls));
    }
  }

  // ── v5.39 DOCUMENTATION CORRECTNESS — each with its extinction pair ────────────────────────
  if ((VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547")) {
    T("V539 docs: tab count is 26 in the FIG.1 figure", man.includes(">26 TABS<"));
    T("V539 docs: EXTINCTION — no '25 TABS' anywhere", !man.includes("25 TABS"));
    T("V539 docs: §05 body text says 26", man.includes("Feeling like 26 is a lot"));
    T("V539 docs: EXTINCTION — 'Feeling like 25' is gone", !man.includes("Feeling like 25"));
    T("V539 docs: skin count matches the registry (13)", man.includes("Thirteen color palettes"));
    T("V539 docs: EXTINCTION — the stale 'Seven color palettes' is gone", !man.includes("Seven color palettes"));
    T("V539 docs: the three accessibility skins are named",
      man.includes("High Contrast Light") && man.includes("High Contrast Dark") && man.includes("Colorblind-Safe Light"));
    T("V539 docs: the UI SIZE control is documented", man.includes("UI SIZE"));
    T("V539 docs: the small-screen limitation is disclosed in §13",
      man.includes("Designed for a desktop browser"));
    T("V539 docs: TCJA entry records the OBBBA supersession", man.includes("superseded that sunset"));
    T("V539 docs: EXTINCTION — TCJA no longer says provisions simply expire after 2025",
      !man.includes("many individual provisions expire after 2025 unless extended"));
    T("V539 docs: Success Rate entry no longer hardcodes three thresholds",
      !man.includes("($500K/$800K/$1.5M here)"));
    T("V539 docs: ACA entry names the Roth tab as its home",
      man.includes("ACA Premium Subsidy (on the Roth tab)"));
    T("V539 docs: EXTINCTION — the false 'printable to PDF from the toolbar' claim is gone",
      !man.includes("printable to PDF from the toolbar"));
    // F-13: the first FAQ row shipped with 2 cells in a 3-column table. Assert the whole
    // FAQ table is uniform rather than pinning one row — a per-row pin would not catch the next one.
    const faq = man.slice(man.indexOf('id="faq"'));
    const faqRows = faq.match(/<tr><td>[\s\S]*?<\/tr>/g) || [];
    const cellCounts = [...new Set(faqRows.map(r => (r.match(/<td>/g) || []).length))];
    T("V539 docs: every FAQ row has exactly 3 cells (F-13)",
      faqRows.length > 10 && cellCounts.length === 1 && cellCounts[0] === 3,
      `rows=${faqRows.length} counts=${cellCounts.join(",")}`);
  }

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
  // ── v5.30: the OBBBA senior-bonus disclosure ────────────────────────────────────────────────
  // WHAT WAS WRONG. Through v5.29 §13 said the OBBBA bonus senior deduction "is NOT modeled" and
  // that omitting it made near-term projections "slightly conservative (overstated)". Engine B has
  // modelled it all along (computeTaxPlan, gated yr <= 2028), so BOTH clauses were false — and the
  // direction it claimed is the inverse of the truth, in the document users actually read.
  //
  // WHY THIS ASSERTION DID NOT EXIST BEFORE. It never did. The §B2 lock sweep for this release
  // found nothing guarding the sentence, which is precisely why it could drift for five releases.
  // The absence of a lock was the cause, not a convenience.
  //
  // GATED PER LEG (§B2, the rule added at v5.28). The v530 leg asserts the CORRECTED copy; every
  // earlier leg asserts the OLD copy, because those builds legitimately contain it. Inverting
  // without gating would break the frozen legs and make the release notes state a total the suite
  // will not produce.
  // v5.31 keeps this copy verbatim: D-4 declined touching DOCS_HTML, and §13 stays true.
  if (VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
    T("V530 docs: §13 states the bonus IS modeled on the Taxes tab",
      man.includes("is modeled on the Taxes tab, but not in the Roth conversion ladder"));
    T("V530 docs: §13 names the phase-out thresholds",
      man.includes("6% of MAGI above $75,000 single / $150,000 filing jointly"));
    T("V530 docs: §13 discloses the cross-tab divergence, with the year named (D-4)",
      man.includes("differ for any ladder year at or before 2028"));
    T("V530 EXTINCTION: the false 'is NOT modeled' claim is gone",
      !man.includes("deduction (up to $6,000/person 65+, tax years 2025\u20132028, income-phased) is NOT modeled"));
    T("V530 EXTINCTION: the inverted error-direction claim is gone",
      !man.includes("Its omission makes near-term tax projections slightly conservative"));
    T("V530 docs: the true closing sentence on the other 2026 constants SURVIVED the edit",
      man.includes("has been verified against IRS Rev. Proc. 2025-32, CMS, and SSA"));
  } else {
    // The old copy, asserted on the builds that legitimately carry it. This is NOT a defect pin:
    // it is the same statement being true of its own build and false of the next one.
    T("PRIOR LEG: this build still carries the pre-v5.30 'is NOT modeled' copy",
      man.includes("is NOT modeled"));
  }

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
if (VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
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

// ═══ v5.31 — the Taxes tab's own OBBBA disclosure ══════════════════════════════════════════════
// WHAT WAS WRONG. The Taxes tab said BOTH things about the same feature, ~240 source lines apart:
// its header listed the OBBBA $6K/person senior bonus deduction among what it models (true), its
// line-item row rendered sel.seniorExtra — which IS seniorBase + seniorBonus — and then its closing
// footnote said "the temporary OBBBA senior deduction is not [modeled]" (false). Engine B has
// applied it since v5.24.
//
// WHY v5.30 DID NOT CATCH IT. v5.30 corrected this same false claim in Field Manual §13 and ran a
// §B2 lock sweep — but swept DOCS_HTML, where the sentence never was. The false copy was in the
// render tree. Sweeping the manual is not sweeping the app.
//
// GATED PER LEG (§B2). v531 asserts the corrected copy; earlier legs assert the old copy, which
// those builds legitimately carry.
{
  const tx = per["taxes"] || "";
  T("TAXES TAB: the OBBBA deduction is named in the tab header", tx.includes("OBBBA $6K/person senior bonus deduction"));
  if (VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
    T("V531 taxes: the footnote states the OBBBA deduction IS modeled here",
      tx.includes("the temporary OBBBA senior deduction (through 2028) ARE modeled on this tab"));
    T("V531 taxes: the footnote discloses the Roth-ladder divergence",
      tx.includes("the Roth conversion ladder does not apply the OBBBA deduction"));
    T("V531 taxes: ...with the year named",
      tx.includes("differ for any ladder year at or before 2028"));
    T("V531 EXTINCTION: the false 'senior deduction is not [modeled]' claim is gone",
      !tx.includes("the temporary OBBBA senior deduction is not"));
    T("V531 taxes: the rest of the footnote survived the edit",
      tx.includes("Estimates only") && tx.includes("Actual filing requires a CPA"));
    // GATED PER LEG (§B2): v5.36 wires Engine D's gains into this tab, falsifying the
    // "$0 unless a sale is modeled" sentence those legs legitimately carry.
    if (VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
      T("V536 taxes: the footnote names the gains' SOURCE (the Withdrawal plan's sales)",
        tx.includes("Realized capital gains are the Withdrawal plan's own sales"));
      T("V536 taxes: ...and what sets their basis (the My Data embedded-gain share)",
        tx.includes("the embedded-gain share in My Data sets their opening basis"));
      T("V536 taxes: the footnote says provisional income COUNTS realized gains (E-16 fixed same release)",
        tx.includes("realized capital gains count toward it, as the statute requires"));
      T("V536 EXTINCTION: the short-lived omission disclosure is gone with the omission",
        !tx.includes("does not count realized capital gains"));
      T("V536 EXTINCTION: the '$0 unless a sale is modeled' claim is gone",
        !tx.includes("default to $0 unless a sale is modeled"));
      T("V536 taxes: the three-levers card discloses the outside input",
        tx.includes("One input arrives from outside this tab"));
    } else {
      T("PRIOR LEG: the footnote still carries the $0-gains default those builds are true to",
        tx.includes("Realized capital gains default to $0 unless a sale is modeled"));
    }
  } else {
    T("PRIOR LEG: this build still carries the false 'senior deduction is not' footnote",
      tx.includes("the temporary OBBBA senior deduction is not"));
  }
}

// ═══ Verify tab reflects the version's check count ═══
{
  const v = per["verify"] || "";
  // v5.14 adds three IRMAA-indexation checks to the Verify tab (see t1's note).
  const _vCount = (VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530") ? "57" : IS510 ? "54" : "53";
  const _vCountV = (VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) ? "66" : VER === "v531" ? "62" : _vCount;
  T(`VERIFY TAB: reports ${_vCountV} checks`, v.includes(_vCountV));
  T("VERIFY TAB: no failing marks rendered", !/✗/.test(v));
  // v5.31 — the four OBBBA constants become checkable here for the first time (E-2), plus the
  // D-2 dated sunset row. Gated: on earlier builds the tab correctly has no such category.
  if (VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
    T("V531 verify: the OBBBA senior-bonus category renders", v.includes("OBBBA SENIOR BONUS"));
    T("V531 verify: the per-person deduction row is present", v.includes("Deduction per person 65+"));
    T("V531 verify: both MAGI phase-out rows are present",
      v.includes("MAGI phase-out start (Single)") && v.includes("MAGI phase-out start (MFJ)"));
    T("V531 verify: the phase-out rate row is present", v.includes("Phase-out rate above the threshold"));
    T("V531 verify: the DATED sunset row is present and names 2028 (D-2)",
      v.includes("Last tax year the deduction exists (expires after 2028)"));
    T("V531 verify: the OBBBA rows carry their statutory citation", v.includes("P.L. 119-21"));
  } else {
    T("PRIOR LEG: no OBBBA category on the Verify tab (the E-2 gap)", !v.includes("OBBBA SENIOR BONUS"));
  }
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

// ═══ v5.33 — the embedded-gain control, in the DOM ════════════════════════════════════════════
// Same shape as the v5.25 block above and for the same reason: NO engine reads this field at
// v5.33, so no figure anywhere can witness it and the DOM is the only evidence the control
// exists. This block is therefore the sole coverage of the decision to ship the control a
// release ahead of the engines.
//
// !! DISCLOSURE LOCK (OPERATIONS B2) !! The label assertion below checks that copy saying the
// model does NOT use the field is PRESENT. v5.34 makes that copy FALSE, and this assertion will
// go green anyway, because the stale sentence survives. v5.34 must invert it in the same release
// that falsifies it, GATED PER LEG so v5.33 keeps asserting the copy that is true for v5.33.
// v5.34: the gate WIDENS rather than inverting. The v5.33 disclosure — "recorded, not yet used"
// — is still TRUE at v5.34, because the Engine D basis tracker that would have falsified it was
// backed out before shipping (it realized gain on an RMD that Engine D sources from the taxable
// sleeve). So this is a disclosure lock that must NOT be inverted yet; leaving it gated to v533
// alone would instead leave the CURRENT build with no coverage of this panel at all, which is
// how it stood before this release. INVERT AT v5.35, when an engine actually reads the field.
// Only the release NAMED in the copy differs between the legs, and that assertion is gated.
if (VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
  const _pfx = VER === "v536" ? "V536" : VER === "v533" ? "V533" : "V534";
  const _namesRel = VER === "v533" ? "no figure on any tab changes until v5.34"
                                   : "no figure on any tab changes until v5.35";
  await click(tabs().find(b => b.textContent.trim() === "my data")); await flush();
  const _cands = [...body().querySelectorAll("div")]
    .filter(d => (d.textContent || "").trim().startsWith("EMBEDDED GAIN IN TAXABLE ACCOUNTS"));
  T(`${_pfx} my data: the embedded-gain panel renders`, _cands.length > 0, `${_cands.length} candidates`);
  const panel = _cands.find(d => d.querySelector("input")) || null;
  T(`${_pfx} my data: the panel is scoped to its own input, not the card`, !!panel);
  const txt = panel ? (panel.textContent || "").replace(/\s+/g, " ") : "";

  // the label, asserted verbatim — this is the lock. GATED PER LEG (§B2): v5.36 is the
  // release that consumes the field, falsifying the recorded-not-used copy the earlier
  // legs legitimately carry, and landing scope v5.36 §9's label fix (brokerage, not pool).
  if (VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
    T(`${_pfx} my data: the panel is labelled IN USE FROM v5.36`, txt.includes("(in use from v5.36)"), txt.slice(0, 120));
    T(`${_pfx} my data: the label scopes the share to BROKERAGE money (scope §9)`,
      txt.includes("Embedded gain, % of brokerage money"), txt.slice(0, 200));
    T(`${_pfx} my data: it states plainly that the model now USES the number`,
      txt.includes("From v5.36 the model uses this number"), txt.slice(0, 240));
    T(`${_pfx} my data: it names WHERE the number lands (Withdrawal realizes; Taxes and IRMAA carry)`,
      txt.includes("the Withdrawal plan realizes gains when it sells brokerage money") &&
      txt.includes("Taxes and IRMAA tabs carry those gains"), txt.slice(0, 300));
    T(`${_pfx} my data: it scopes the pool (ordinary-taxed and HSA money excluded)`,
      txt.includes("brokerage money only"), txt.slice(0, 300));
    T(`${_pfx} my data: the share-0 disclosure — the share is the OPENING position and growth accrues gain`,
      txt.includes("OPENING position") && txt.includes("even a plan saved at 0 realizes gains"), txt.slice(0, 400));
    T(`${_pfx} my data: ...with the v5.35-precedent sentence, release named`,
      txt.includes("if your numbers moved at v5.36, that is why"), txt.slice(0, 400));
    T(`${_pfx} EXTINCTION: the recorded-not-yet-used copy is GONE`,
      !txt.includes("(recorded, not yet used)") && !txt.includes("The model does not use this yet"), txt.slice(0, 200));
    T(`${_pfx} EXTINCTION: the '% of taxable pool' label is GONE (it misstated the pool)`,
      !txt.includes("% of taxable pool"), txt.slice(0, 200));
  } else {
    T(`${_pfx} my data: the panel is labelled RECORDED, NOT YET USED`, txt.includes("(recorded, not yet used)"), txt.slice(0, 120));
    T(`${_pfx} my data: it states plainly that the model does not use it yet`,
      txt.includes("The model does not use this yet"), txt.slice(0, 200));
    T(`${_pfx} my data: it names the release that changes that`,
      txt.includes(_namesRel), txt.slice(0, 200));
  }
  T(`${_pfx} my data: it says where to find the number (1099-B / custodian basis)`,
    txt.includes("1099-B") && txt.includes("cost basis"), txt.slice(0, 200));
  T(`${_pfx} my data: it discloses that leaving it at 0 is the OPTIMISTIC assumption`,
    txt.includes("optimistic assumption"), txt.slice(0, 240));

  // the input itself
  const gi = panel ? [...panel.querySelectorAll("input")][0] : null;
  T(`${_pfx} my data: the panel carries an input`, !!gi);
  T(`${_pfx} my data: it starts at the shipped default 0`, gi && String(gi.value) === "0", gi && String(gi.value));

  const type = async (el, v) => {
    await act(async () => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      proto.set.call(el, String(v));
      el.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await flush();
  };
  const saveBtn = () => [...body().querySelectorAll("button")].find(b => /SAVE\s*&\s*APPLY/i.test(b.textContent || ""));
  // Re-query, never reuse: Save & Apply re-renders My Data and React replaces the input node,
  // so a held reference types into a detached element and the value silently does not move.
  // (Observed here: the 900 and -5 clamp cases both still read 40 off a stale node.)
  const gainInput = () => {
    const c = [...body().querySelectorAll("div")]
      .filter(d => (d.textContent || "").trim().startsWith("EMBEDDED GAIN IN TAXABLE ACCOUNTS"))
      .find(d => d.querySelector("input"));
    return c ? c.querySelector("input") : null;
  };

  if (gi) {
    // accepts a value, and Save & Apply writes it THROUGH to the module-level portfolio
    await type(gi, 40);
    T(`${_pfx} my data: the control accepts a typed value`, String(gi.value) === "40", String(gi.value));
    const sv = saveBtn();
    T(`${_pfx} my data: Save & Apply is reachable`, !!sv);
    if (sv) {
      await click(sv); await flush(); await flush();
      T(`${_pfx} my data: Save & Apply writes 40 through to PORTFOLIO.taxableGainPct`,
        window.__g.PORTFOLIO().taxableGainPct === 40, String(window.__g.PORTFOLIO().taxableGainPct));
      T(`${_pfx} my data: and the accessor now reads 0.40`,
        window.__g.taxableGainShare() === 0.40, String(window.__g.taxableGainShare()));

      // NOT asserted here: the exported backup bytes. t4 has no createObjectURL capture
      // harness (that lives in t5), and the export path is buildPortfolio() — the SAME
      // function whose write-through is asserted immediately above — so an export assertion
      // here would re-test proven code through an unproven harness. t5 owns the bytes.
    }

    // out-of-range input is CLAMPED ON SAVE, so the stored value is already in band and
    // taxableGainShare() is a second line of defence rather than the only one.
    const gi900 = gainInput();
    T(`${_pfx} my data: the control is still present after save`, !!gi900);
    await type(gi900, 900);
    const sv2 = saveBtn();
    if (sv2) {
      await click(sv2); await flush(); await flush();
      T(`${_pfx} my data: 900 is clamped to 95 on save`, window.__g.PORTFOLIO().taxableGainPct === 95, String(window.__g.PORTFOLIO().taxableGainPct));
      T(`${_pfx} my data: the accessor reads the clamped 0.95`, window.__g.taxableGainShare() === 0.95, String(window.__g.taxableGainShare()));
    }
    const giNeg = gainInput();
    await type(giNeg, -5);
    const sv3 = saveBtn();
    if (sv3) {
      await click(sv3); await flush(); await flush();
      T(`${_pfx} my data: a negative entry is clamped to 0 on save`, window.__g.PORTFOLIO().taxableGainPct === 0, String(window.__g.PORTFOLIO().taxableGainPct));
    }
  }
}

// ═══ v5.34 — THE CONVERSION-TAX FUNDING COPY, ON BOTH SURFACES ════════════════════════════════
// Why this block exists: a §B2 sweep found that NOTHING in the suite asserted any of this copy,
// which is how "no sale, no gains tax" survived from v5.9 to v5.33 while being false the whole
// time. Under `withhold` the conversion absorbs only min(conv, due) (source L4073) and any
// RESIDUAL falls through to the brokerage sale (L4087), which realizes gain and is taxed (L4103).
// Measured on the t3 fixture household at the shipped default share of 0: a $10K/yr conversion
// makes 19 funding sales realizing $111,359 of gain and $9,428 of LTCG tax.
//
// The second correction is one v5.34 caused rather than inherited: through v5.33 a declared 0%
// meant no gain ever (`_gf = P.taxableGainFrac`), so "modeled as tax-free" was TRUE. v5.34's
// tracker makes the declared share the OPENING basis only, and growth accrues gain from there —
// so the same sentence became false the moment the tracker landed. OPERATIONS §B2: gate per leg.
// Each leg asserts the copy ITS OWN build carries; the prior leg is not a defect pin.
if (VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"))) {
  const NEW = VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545" || VER === "v546" || VER === "v547"));

  // ── The Field Manual (iframe srcdoc — a textContent read passes vacuously, see L159) ──
  await click(tabs().find(b => b.textContent.trim() === "docs")); await flush();
  const _fr = body().querySelector('iframe[title="Danger Close Documentation"]');
  const _man = (_fr && _fr.getAttribute("srcdoc")) || "";
  T("V534 funding: PRECONDITION — the manual is readable and carries the funding control entry",
    _man.length > 50000 && _man.includes("conversion-tax funding"), String(_man.length));

  if (NEW) {
    T("V534 EXTINCTION: the manual no longer claims withholding means no sale and no gains tax",
      !_man.includes("no sale, no gains tax"));
    T("V534 EXTINCTION: the manual no longer calls the 0% case a sale that creates no profit",
      !_man.includes("a sale that creates no taxable profit"));
    T("V534 docs: the manual says the residual is still sold and still realizes gain",
      _man.includes("any remainder is still sold from the brokerage and still realizes gain"));
    T("V534 docs: the manual calls the share a running cost basis, not a fixed rate",
      _man.includes("carried as a running cost basis, not a fixed rate"));
    T("V534 docs: the manual says the entered share is the OPENING one",
      _man.includes("The share you enter is the OPENING one")
      && _man.includes("even a pool declared at 0 realizes gain on later sales"));
  } else {
    T("PRIOR LEG: this build still carries the pre-v5.34 no-sale-no-gains-tax copy",
      _man.includes("no sale, no gains tax"));
    T("PRIOR LEG: ...and still calls the 0% case a sale that creates no taxable profit",
      _man.includes("a sale that creates no taxable profit"));
  }

  // ── The live Roth tab, which the manual only describes ──
  await click(tabs().find(b => b.textContent.trim() === "roth")); await flush();
  const _fundSel = [...body().querySelectorAll("select")].find(s =>
    [...s.options].some(o => o.value === "taxable") && [...s.options].some(o => o.value === "withhold"));
  T("V534 funding: PRECONDITION — the funding selector is on the Roth tab",
    !!_fundSel, _fundSel ? [..._fundSel.options].map(o => o.value).join("|") : "not found");

  const rothTxt = () => (body().textContent || "").replace(/\s+/g, " ");
  T("V534 funding: PRECONDITION — the 0%-gains branch is the one rendered by default",
    rothTxt().includes("0% gains:"), rothTxt().slice(0, 0) || "");

  if (NEW) {
    T("V534 EXTINCTION: the Roth tab no longer says a 0% pool sells tax-free",
      !rothTxt().includes("selling from taxable is modeled as tax-free"));
    T("V534 roth: it says the pool STARTS as all cost basis",
      rothTxt().includes("the account starts as all cost basis, so selling it today realizes nothing"));
    T("V534 roth: ...and that growth accrues gain from there",
      rothTxt().includes("growth accrues as gain from there, so sales in later years can still be taxed"));
  } else {
    T("PRIOR LEG: this build still says a 0% pool sells tax-free",
      rothTxt().includes("selling from taxable is modeled as tax-free"));
  }

  if (_fundSel) {
    // React owns this select: set through the native setter, then dispatch change.
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")
        .set.call(_fundSel, "withhold");
      _fundSel.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    await flush();
    const wTxt = rothTxt();
    T("V534 funding: PRECONDITION — switching the selector actually renders withhold mode",
      wTxt.includes("Withhold mode:"), wTxt.includes("0% gains:") ? "still on the sale-mode copy" : "");
    if (NEW) {
      T("V534 EXTINCTION: withhold mode no longer claims no sale and no capital-gains tax",
        !wTxt.includes("No sale, no capital-gains tax"));
      T("V534 roth: withhold mode says the remainder is still sold and still realizes gains",
        wTxt.includes("the remainder is still sold from your taxable account and still realizes gains"));
      T("V534 roth: ...and still discloses the unmodelled under-59½ penalty",
        wTxt.includes("would also owe a 10% penalty"));
    } else {
      T("PRIOR LEG: this build's withhold mode still claims no sale and no capital-gains tax",
        wTxt.includes("No sale, no capital-gains tax"));
    }
  }
}

console.log(`\nt4 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
