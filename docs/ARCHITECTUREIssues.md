# ARCHITECTURE ISSUES — Section E of the standing code audit

| Field | Value |
|---|---|
| Build under audit | **v5.29** (findings as audited) |
| Source md5 | **`4ef69e9a820fac18b99aa2aa46a8b2a1`** |
| Built `index.html` md5 | `fe6bf7d4230abdacbf7ce1171798feb3` |
| Prior build (comparison) | v5.28 · `9e06482087f415661196b1c47f7e8be0` |
| Phase | 3 (Sections D + E) · governing doc `SCOPE_STANDING_AUDIT.md` §E |
| Date | 2026-08-12 · **updated 2026-08-13 after v5.30** |
| Status | **Section E covered.** See §0 for what was and was not reached. |

**Post-audit updates (2026-08-13, after v5.30 shipped).** The findings below were written against
v5.29 and are left as written — an audit record is not rewritten to match later work. What has changed
since is recorded in place: **E-3 is CLOSED**, **E-11's measurement question is resolved** (the figure
was right, the unit label was wrong), and one finding is **added — E-14**, surfaced by the v5.30 build
rather than by the audit. Current build is **v5.30**, source `8fcc546263f59fb4a88c131e97f4c882`, built
`183b58b463fcd56dfb71311a4cd68caf`.

Every claim below was checked against the v5.29 source or executed in this session. Site counts come
from `qa/tools/` (OPERATIONS §B1), never greps. Where a figure recorded elsewhere in the project
disagrees with what was measured here, the measured figure is given and the discrepancy is named.

---

## 0. Coverage statement

**Reached and verified:** test-suite health (stale pins, coverage blindness, orphaned branches),
duplication of the jsdom environment, hard-coded law-dependent constants and statutory sunsets,
cross-engine consistency of the OBBBA deduction, the version-identity standing requirement, and
dangling references to documents absent from project knowledge.

**Not reached:** a full structural review of the 12,151-line single file (component decomposition,
state management, render-cost hot spots); `DOCS_HTML` internal structure beyond its size; the
`validation/` suite's relationship to `qa/`; and the Field Manual glossary / §10 / §14, which
`AUDIT_DOCS_HTML_v5_27.md` records as never audited and which belong to Section F.

**Negative controls run this session:** one (E-1). It fired in `t20` and did *not* fire in `t19`;
that split is the finding, and it was investigated rather than adjusted (OPERATIONS §B2).

---

## E-1 · Two `[KNOWN DEFECT]` pins in `t19` assert behaviour that v5.26 made correct

**What.** `t19_engineD_exact.mjs` carries two pins tagged `[KNOWN DEFECT 2026-08-11 | rel c]`.
Release (c) of the `otherAccounts` plan — "fold and classify" — shipped as **v5.26**. Its third pin
(B-3) was flipped there and reads `[FIXED v5.26, was KNOWN DEFECT]`. B-1 and B-2 were not, so two
pins now label correct, intended behaviour as a defect, and instruct the next session to break it.

**Where.**
- `qa/t19_engineD_exact.mjs` L73 (B-1) and L100 (B-2); governing comments L68–72 and L78–101.
- Engine D: `src/DangerClose.jsx` L4197 `_taxInit`, L4198 `_taxOrdInit`, L4338–4341 the proportional
  draw, L4387 `magi`.

**Verified this session.** `t19` runs **14 passed, 0 failed** against v5.29, matching `VERIFY.sh`.
On the shipped example household:

| Quantity | Value | Meaning |
|---|---|---|
| `_taxInit` (L4197) | **$147,000** | the Priority-1 pool — unchanged since the pin was written |
| `otherAccounts` total | **$147,000** | equal by design; the draw ORDER was never revisited |
| `_taxOrdInit` (L4198) | **$111,000** | the ordinary-taxed share, added at v5.26 |

`_taxOrdInit` is `_rsbW.othOrdA + _rsbW.othOrdB` = $90,000 (Rollover IRA $70K + Traditional IRA $20K)
+ $21,000 (State Plan $14K + Annuity $7K). Every `otherAccounts` row now carries a `taxType`
(`trad` / `taxable` / `hsa` / `annuity`). So **76% of the pot is no longer spent as already-taxed
cash**, which is exactly what B-1's comment says is wrong.

**B-1** asserts `_taxInit === oaTotal`. That still passes — but it now measures *pool size*, not tax
treatment, and pool size equalling the `otherAccounts` total is **correct and required**: B-3's own
flipped assertion at L136 demands `_taxInit` grow by $100K when a named IRA does, "because the DRAW
ORDER is unchanged." B-1's instruction — *"RELEASE (c) FIXES THIS — this assertion must then FAIL and
be replaced"* — therefore instructs a future session to break an invariant the same file asserts
twelve lines later. **The two pins now contradict each other.**

**B-2** asserts the `magi` expression omits `drawFromTaxable`. That is correct and must stay (a
brokerage draw is mostly return of basis). But its label says "misclassified pot", and the pot is no
longer misclassified: L4387 reads
`const magi = taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + othOrdDraw + conv_y;`
— **`othOrdDraw` is present**, so the classified ordinary share does reach MAGI. Its instruction
("re-point this pin at `tradDraw`") was never carried out, and the mechanism turned out to be
`othOrdDraw`, not `tradDraw`.

**Negative control (the more important half).** Removing `+ othOrdDraw` from L4387 — one site,
asserted unique before editing:

| Suite | Result |
|---|---|
| `t19_engineD_exact` (14) | **14 passed, 0 failed — did not fire** |
| `t20_other_taxtype` (94) | **fired**, 1 failure (annuity lifetime MAGI excess) |
| `t18_engineB_exact` (47) | unaffected (correct — different engine) |

So the behaviour *is* covered, by `t20`. But **`t19` — the suite whose pin claims to guard it — is
blind to it.** A reader trusting the pin's label would believe `t19` witnesses Engine D's MAGI
wiring. It does not. This is OPERATIONS §B2's rule "a suite's name is not a coverage claim,"
recurring one level down: a *pin* is not a coverage claim either.

*(`t12_engineD_survivor` could not be run — it requires `qa/dom_bundle.cjs`, which I did not build.
Its behaviour under this control is unknown and is not claimed either way.)*

**Suspected cause.** v5.26 was a large figure-moving release. The session flipped the pin whose
assertion *failed* under the fix (B-3, which had to change) and left the two whose assertions still
*passed*. Passing pins are invisible at flip time — nothing goes red to prompt the edit. This is the
inverse of the v5.27 disclosure defect recorded in OPERATIONS §B2: there, an assertion held stale
copy in place by going green; here, a stale label survives for the same reason.

**Severity.** Medium. No user-visible figure is wrong. The exposure is that the suite mis-describes
its own coverage and carries a forward instruction that would introduce a defect.

**Exposure.** **Creator-side.** No user-facing effect.

---

## ~~E-2~~ · ~~Three OBBBA constants and a statutory sunset live outside the single source of truth~~

> **CLOSED at v5.31 (2026-08-13).** The four figures (there are four, not three — the per-person
> amount, both MAGI phase-out thresholds and the 6% rate) plus the sunset year now live in a named
> `OBBBA_CONSTS` block, a sibling of `IRMAA_CONSTS` inside the shared-constants banner region, each
> carrying its P.L. 119-21 §70103 citation and a `// statutory, unindexed` marker. `computeTaxPlan`
> reads the named constants; the arithmetic is byte-for-byte unchanged, proven by parity 8/8 strict
> and `t18`'s three OBBBA cases passing with identical figures. The Verify tab gained five rows — the
> four values checked against statute plus a dated row naming 2028 — so the tab no longer renders
> green on constants it has never checked, which was the actual harm. Verified in the committed tree
> at `17636ea1b24ea37c806008e7a6b1a32f`. `t1` asserts the block against statute (not against the
> source), asserts the four literals are extinct inside `computeTaxPlan`, and asserts the sunset stays
> independent of `TAX_CONSTANTS_YEAR`; both negative controls fired.
>
> **Two things this finding got wrong, recorded rather than quietly dropped.** Its stated cause — that
> the figures sat outside the block because anything needing an indexation decision is excluded — is
> contradicted by the source: `niit`, `ssThr1` and `ssThr2` are unindexed statutory values already
> living there under an established convention, and `TOP_TIER_FROZEN_THROUGH: 2027` is a statutory
> year fuse already living in a constants block. There was no design obstacle, only a pattern to
> follow, which made the fix far smaller than the finding implied. Its line numbers were also off by
> one. And its framing of the sunset as an urgent time fuse does not hold — the fuse **fails safe**:
> if the provision expires as written the model is correct, and if Congress extends it the model omits
> the deduction and overstates tax, the conservative direction. **This shipped for the verification
> gap, not the sunset.**
>
> A **new** finding surfaced while verifying this one's blast radius and was fixed in the same
> release: the Taxes tab's closing footnote said the OBBBA senior deduction was not modelled, while
> the same tab's header listed it and its "Senior deduction (65+)" line item rendered a figure that
> includes it. False since v5.24. v5.30 corrected this same claim in Field Manual §13 and swept for
> assertions locking the old copy — but swept the manual, where the sentence never was. Sweeping the
> documentation is not sweeping the app.

<details><summary>Original finding, as written</summary>


**What.** The `TAX_CONSTS` block declares itself the sole place to update when the law changes:
*"When the IRS/CMS publish next year's figures, update THIS BLOCK ONLY"* (L777–780). Three
statutory OBBBA figures and one statutory expiry date are **not** in it — they are inline literals
inside Engine B.

**Where.** `src/DangerClose.jsx` L4626–4636 (`computeTaxPlan`):

| Literal | Value | Statutory meaning |
|---|---|---|
| `yr <= 2028` (L4629) | 2028 | last tax year the bonus deduction exists |
| `bonusThr` (L4630) | 75000 / 150000 | MAGI phase-out start, single / MFJ — **unindexed** |
| `6000` (L4631) | $6,000 | per-person deduction |
| `0.06` (L4631) | 6% | phase-out rate |

**Suspected cause.** The bonus is MAGI-phased, so it cannot be expressed as a flat `TAX_CONSTS`
entry the way `SENIOR_EXTRA_MFJ` can, and `taxFactsFor` deliberately excludes anything requiring a
decision about indexation (L842–845). The figures were placed where the arithmetic is instead of
where the contract says constants live.

**Why it matters beyond tidiness.** This is the only law-dependent arithmetic in the app whose
constants are invisible to the two mechanisms that exist to catch staleness: the **Verify tab**
re-checks `TAX_CONSTS` and `IRMAA_CONSTS` against cited primary sources on every load, and the
**⌛ STALE DATA strip** keys off `TAX_CONSTANTS_YEAR`. Neither sees these four values. If Congress
extends the provision past 2028 — or lets it expire and the model should stop applying it — nothing
in the app flags it, and the Verify tab still reads green.

**Severity.** Medium-high, and it is **time-fused**: the `yr <= 2028` condition silently changes the
app's behaviour at a date certain, three tax years out, with no alarm attached.

**Exposure.** **User-side.** A stale or extended provision changes projected tax for every 65+
household with MAGI under the phase-out ceiling.

</details>

---

## ~~E-3~~ · ~~Two source comments disagree about which engine models the OBBBA bonus, and one is false~~

> **CLOSED at v5.30 (2026-08-13).** The false comment at L829–831 was corrected: it now states that
> Engine B applies the bonus in the tax schedule and that Engine A does **not** model it, which agrees
> with Engine A's own comment at its deduction site. Verified in the committed tree at
> `8fcc546263f59fb4a88c131e97f4c882`, with an extinction check confirming the phrase *"Engine A models
> it on the conversion side"* no longer appears anywhere in source. The same release corrected the two
> **user-facing** statements this finding sat beside (Field Manual §13 and METHODOLOGY §5), and added
> three hand-computed `t18` cases so Engine B's OBBBA arithmetic is asserted rather than merely
> described. Closure named explicitly in the v5.30 CHANGELOG.
>
> *Retained rather than deleted, per the precedent set by E-10: a closed finding stays visible so the
> record shows it existed and how it was resolved.*

**The finding as audited at v5.29 follows.**

**What.** Three statements exist in-source about where the bonus deduction is implemented. They are
not consistent.

**Where and what each says.**

| Site | Claim | True? |
|---|---|---|
| L829–831 (beside `seniorExtraFor`) | *"**Engine A models it on the conversion side** and Engine B in the schedule"* | **FALSE** |
| L3677–3679 (inside `runRothStrategies` = Engine A) | *"modeled on the Taxes tab but **not here** — it expires before typical conversion windows and would make the bracket-fill solver circular"* | **TRUE** |
| L4626–4636 (inside `computeTaxPlan` = Engine B) | implements it | **TRUE** |

AST census of the phase-out arithmetic (`6000 - 0.06 *`, `bonusThr`) returns **exactly two sites,
both inside `computeTaxPlan`** (L4630, L4631). `seniorExtraFor` is called at four sites — L832
(definition), L3676 (Engine A), L4625 (Engine B), L8280 (`projectBrackets`) — and supplies only the
*ordinary* age-65 extra at all of them.

So: **Engine B models the bonus. Engine A and `projectBrackets` do not.** L829–831 asserts the
opposite of L3677–3679 about the same engine.

**Suspected cause.** L829–831 was written during the v5.16 `taxFactsFor` extraction, describing an
intended split; Engine A's own comment records the decision actually taken (circularity in the
bracket-fill solver) and was written later. Nothing reconciles the two — OPERATIONS §D notes that
comments have no guard rail, and this is the C-2C-4 stale-header class recurring.

**Severity.** Medium. Comment-only in itself, but it is the comment a future session would read first
when deciding whether Engine A needs the deduction, and it would tell them the work is already done.

**Exposure.** **Creator-side.** (The *modelling* consequence of the divergence is D-1 in
`MissingFeatures.md`; the *disclosure* consequence is D-1's second half.)

---

## E-4 · The version tag is a repeated string literal in four places, with no constant

**What.** There is **no `APP_VERSION` constant** — AST census returns **0 hits**. The four in-app
version sites the release checklist requires bumping (OPERATIONS §I) are four independent string
literals.

**Where.** `src/DangerClose.jsx` L3402 (DATA LOAD header), L10731 (footer), and two occurrences
inside the `DOCS_HTML` blob at L3464 (Field Manual callsign and Field Manual footer). Two further
`v5.29` occurrences at L981 and L8713 are code comments, not user-visible sites.

**Suspected cause.** The Field Manual is a frozen HTML string rather than rendered markup, so two of
the four sites cannot read a JS constant without templating the blob. The other two could, and never
were.

**Severity.** Low-medium. `t1`'s STATIC checks assert all four, so a partial bump fails loudly — the
guard rail works. But the guard rail exists *because* of the duplication.

**Exposure.** **Creator-side.**

---

## E-5 · The exported backup does not identify the build that produced it

**What.** `SCOPE_STANDING_AUDIT.md`'s standing requirement states the version must be *"written into
any exported data file, so a user's export identifies the build that produced it"*, and that **"any
of these missing is itself a finding for `.planning/ARCHITECTUREIssues.md`."** It is missing.

**Where.** `src/DangerClose.jsx` L11176:

```js
app: "DangerClose", version: 5, exportedAt: new Date().toISOString(),
```

`version: 5` is a **schema** version, not the build version. It has been `5` across at least v5.22–v5.29.

**Why this is worse than a plain omission.** The field is named `version` and holds `5`, while the
app's own version is `v5.29` — so a reader inspecting a backup will reasonably read `5` as "version
5.x" and conclude the build is identified when it is not. A user reporting "the Withdrawal tab shows
X" with a backup attached cannot be pinned to a build, which is precisely the failure the standing
requirement was written to prevent — and this project has shipped **four releases since v5.24 that
changed what `otherAccounts` money costs**, so "which build produced this file" is a live question,
not a hypothetical one.

**Severity.** Medium-high against the standing requirement, which treats it as mandatory.

**Exposure.** **Creator-side** (bug reports cannot be pinned), with a **user-side** edge: a user
restoring an old backup gets no signal about which modelling generation it was built under.

**Note on the other four clauses of the standing requirement**, all of which pass: the version is
visible in the running app (footer + DATA LOAD header), appears in the embedded manual and the
CHANGELOG, a source hash is recorded per release (the provenance line, OPERATIONS §G), and the footer
line is copyable. **Only the export clause fails.**

---

## E-6 · The jsdom environment is duplicated **nine** times, not eight

**What.** `qa/env_dom.mjs` exists as the shared environment but is imported by only four files. The
rest stand up their own inline `new JSDOM(...)`.

**Where.** Measured this session against the v5.29 `qa/` set:

| | Files |
|---|---|
| **Import `env_dom.mjs` (4)** | `cap_tabs.mjs`, `t4_dom.mjs`, `t5_storage.mjs`, `t6_single.mjs` |
| **Own inline JSDOM (8)** | `domdiff_withdrawal.mjs`, `smoke_built.mjs`, `t9_dom_smoke.mjs`, `t11_survivor_rmd.mjs`, `t12_engineD_survivor.mjs`, `t13_engineC_irmaa.mjs`, `t14_cross_engine_survivor.mjs`, `t16_roth_ladder_filing.mjs` |
| **The shared copy itself** | `env_dom.mjs` |

**Total distinct environment setups: 9.** OPERATIONS §C1 records eight and lists seven inline
importers — it **omits `domdiff_withdrawal.mjs`**. §C1 anticipates this ("an earlier note said seven
… Recount before relying on the figure"); this is that recount, and the figure moved again.

**Why it matters.** Every trap in OPERATIONS §C — seeding `Math.random` *before* import, stubbing
`globalThis.URL.createObjectURL` rather than `window.URL`, the `applyLoadedData` wrapper, parking on
a different tab to force re-render, read-window headroom — must hold in **nine** places to hold
everywhere, and **which copies carry which fix has still never been audited.** A suite missing the
`Math.random` seeding produces non-deterministic Monte Carlo output that reads as an app defect.

`domdiff_withdrawal.mjs` is the newest omission and the most consequential one to have missed: it is
the *cross-version DOM diff* — the artifact OPERATIONS §B2 calls "the proof the hoist changed
nothing." A determinism trap in that file would undermine the one test the project points to when it
needs to prove an engine did not move.

**Suspected cause.** `env_dom.mjs` was introduced after several suites already existed and was never
retrofitted; each new suite since has copied the nearest existing sibling rather than the shared file.

**Severity.** **High** — this is the largest structural item in the suite, and OPERATIONS itself
names it as an outstanding audit. `qa/tools/diverge.cjs` exists precisely to compare these
normalised fingerprints, and running it across the nine copies is a small, well-defined scope.

**Exposure.** **Creator-side.**

---

## E-7 · The version-tag gates are 202 hard-coded comparisons across five suites

**What.** Five suites branch on an enumerated list of version tags. Every release must add the new
tag to each, or the leg falls through to the wrong branch. This is the tax OPERATIONS §I warns about;
it is measured here.

**Where.** Count of `VER === "v5nn"` comparisons at v5.29:

| Suite | Comparisons |
|---|---|
| `t4_dom.mjs` | 57 |
| `t1_units.mjs` | 56 |
| `t5_storage.mjs` | 42 |
| `t6_single.mjs` | 26 |
| `t3_roth.mjs` | 21 |
| **Total** | **202** |

`t3_roth.mjs` L133 is representative — a single `if` chain enumerating **21 tags** from `v5101`
through `v529`, whose comment reads "fixed at v5.10.1; holds for all later builds" while its code
enumerates every build individually.

**Suspected cause.** The chains encode "this build is v5.10.1 or later," which is a *predicate on
ordering*, expressed as membership in a hand-maintained set. No tag-ordering helper exists, so the
set grows by one entry per suite per release.

**Severity.** Medium. Failures are loud rather than silent (a missed tag flips a whole branch), and
the release checklist budgets for them — but the cost is monotonic and the shape actively invites the
substring-prefix bug §I records (`"v5.10"` prefixes `v5.10.1` but not `v5.11`).

**Exposure.** **Creator-side.**

---

## E-8 · Orphaned pin branches for builds that can no longer be run

**What.** Several `[KNOWN DEFECT]` pins sit in `else` branches reachable only by version tags older
than v5.10.1 or v5.10.2. Project knowledge holds exactly two sources (current + prior, §G rotation),
so those legs cannot be built without archaeology through commit history. The branches are dead.

**Where.** `t3_roth.mjs` L134 · `t5_storage.mjs` L244, L245, L273, L274, L275 · `t6_single.mjs`
L130, L132.

**Important distinction.** These are **correctly written** — they are the legitimate §B2 pattern
("each leg asserts the copy that was true for its own build"), and `t10_taxcases.mjs` L491's Montana
pin gated at pre-v5.29 is the same pattern working as intended for a *live* pair. The finding is not
that they are wrong; it is that eight assertions are permanently unreachable while remaining in the
enumerated chains of E-7, which they lengthen at every release.

**Suspected cause.** No retirement policy for pins whose builds have rotated out of knowledge. §J
re-baselines the *suite*; nothing re-baselines the *pins*.

**Severity.** Low. They cost maintenance, not correctness, and they are honest history.

**Exposure.** **Creator-side.**

**Assessed and deliberately excluded:** `t21_tools.mjs` L147/L150. These pin `census.cjs`'s
double-reporting of object shorthand and export specifiers, which v5.29 addressed by *reporting both
counts* rather than deduplicating. L135–146 states this in full and explains why the two assertions
still assert 2 hits each. That is a documented, current, deliberate retention — **not stale**, and
not a finding.

---

## E-9 · Two independent copies of the same indexation proxy

**What.** The 2%/yr threshold-indexation proxy is declared twice as two constants.

**Where.** `src/DangerClose.jsx` L825 `const TAX_INDEX_RATE = 1.02;` and L879
`const IRMAA_INDEX_RATE = 1.02;`. Both comments cross-reference the same source ("the same 2%/yr
proxy the tax brackets use — see METHODOLOGY §6").

**Assessment — weaker than it looks.** These are arguably two *facts* that happen to share a value:
tax thresholds and IRMAA tiers are indexed under different statutes and could legitimately diverge.
Keeping them separate is defensible. But nothing in the source says which reading is intended, and
the project has a recorded history of exactly this shape drifting (finding C-2B-3: a fifth IRMAA
site "drifted to a different inflation rate entirely").

**Severity.** Low. Recommend a comment stating whether they are intentionally independent, rather
than a merge.

**Exposure.** **Creator-side.**

---

## E-10 · Two governing scope documents referenced by the suite are absent from project knowledge

> ✅ **CLOSED 2026-08-12 — Steve restored both to project knowledge.** `t19`'s two references now
> resolve. **The closure is conditional:** these are *fulfilled* scopes, and OPERATIONS §I's release
> checklist retires fulfilled scopes by default, so the next release will delete them and re-open
> this finding unless the manifest's "retain deliberately" marking is honoured. The durable fix is to
> re-point `t19` L61 and L96 at the v5.24 and v5.26 CHANGELOG entries, which record the same outcomes
> and are never retired. **Recommend doing that when E-1 is scoped**, since it touches the same lines.
>
> Reading the restored `SCOPE_ENGINE_D_MAGI_v5_24.md` **strengthens E-1**: its §8 re-tagged the B-2
> pin `| rel c` and stated that *"the assertion itself can stand; only its label and comment are
> wrong"* — so the label was already identified as the fragile part before v5.26 shipped. §8 closes by
> warning that this finding *"is unusually good at being restated wrongly,"* counting three prior
> wrong statements. E-1 is the next instance: not a wrong restatement this time, but a label left
> standing when the release that falsified it shipped.

**What.** `t19_engineD_exact.mjs` directs a future session to two documents that are not in the pool.

**Where.**
- `qa/t19_engineD_exact.mjs` L61: *"Governing scope: `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md`
  (releases b and c)"* — **not in project knowledge.**
- `qa/t19_engineD_exact.mjs` L96–97: *"if you are about to 'fix' magi, read
  `SCOPE_ENGINE_D_MAGI_v5_24.md` §1 before touching anything"* — **not in project knowledge.**

The pool holds four `SCOPE_*` files: `SCOPE_AUDIT_PHASE2_v5_10_2.md`, `SCOPE_DEFECTS_v5_10_1.md`,
`SCOPE_FIX_docs_disclosure_v5_27.md`, `SCOPE_STANDING_AUDIT.md`.

**Why it matters.** L96 is a **stop-instruction** guarding a finding the file itself says "has now
been stated wrongly four times across three documents." The one document a session is told to read
before touching `magi` cannot be read. Under OPERATIONS §L ("never ship a reconstructed file") the
correct response is to stop and ask for it — but nothing tells the session it is missing until they
go looking.

**Suspected cause.** OPERATIONS §I retires *fulfilled* scope docs at release. Releases (a) and (b)
fulfilled parts of the `otherAccounts` scope and v5.26 fulfilled (c), so it was retired as complete —
but its text is still load-bearing for the pins that outlived it (E-1).

**Severity.** Medium. Compounds E-1: a session correcting the stale pins is pointed at two absent
documents for the reasoning.

**Exposure.** **Creator-side.**

---

## E-11 · `DOCS_HTML` is a single 144,008-character line, and the figures on record understate it

**What.** The Field Manual is one string literal on one source line.

**Where.** `src/DangerClose.jsx` **L3464**, measured at **144,008** — 1.2% of the file's
12,151 lines carrying a double-digit percentage of its bytes.

> **PARTIALLY RESOLVED at v5.30 (2026-08-13) — the unit, not the finding.** The 144,008 figure is the
> **UTF-8 byte** count, not the character count. At v5.29 the line was **142,885 characters** (142,882
> code points) and **144,008 bytes**; at v5.30 it is **142,990 characters / 144,111 bytes**. Both
> numbers were always correct measurements — of different things — and the ~1,100 gap is the manual's
> en- and em-dashes at three bytes each. OPERATIONS §C0 now carries both figures and says which is
> which. **The finding itself stands:** the line is still one line, still enormous, still edited only
> through anchored bounded edits, and the recorded figures still go stale on every edit inside it.

**Figures on record are stale.** OPERATIONS §C0 says "~141,000"; the Phase 3 session brief says
"~142,000". Neither is wrong by much, and neither has been re-measured since the manual grew at
v5.27 and v5.28. Any document quoting a character count should re-measure.

**Assessment.** OPERATIONS §C0 already governs editing it — quote-free anchors, print the full
surrounding sentence back after any edit, assert both markers unique and print span length and net
file delta for bounded edits — and those rules were written from two real incidents (a half-replaced
sentence at v5.26; a 25,000-character silent deletion at v5.28). **The controls are adequate and
proven.** The structural point is that they are *procedural* controls around a shape no tooling can
check, and the shape is growing.

**Severity.** Medium, and rising with the manual's size. Not actionable as a defect; recorded because
§C0's cost scales with this number and the number is no longer what the documents say.

**Exposure.** **Creator-side.**

---

## E-12 · Engines take their parameters three different ways

**What.** The four hoisted engines have three different calling conventions.

**Where.**
- **Engine A** `runRothStrategies` (L3554) — takes a single `P` object; reads `P.asOfYr`, `P.single`,
  `P.taxYieldPct` internally.
- **Engine B** `computeTaxPlan` (L4419) and **Engine C** `computeIrmaaPlan` — destructured parameters.
- **Engine D** `computeWithdrawalPlan` (L4151) — takes `{ retireYear, rothAmount, scenarioPreset }`
  and reads module-level `PORTFOLIO` for the rest.

**Consequence, and it is already documented as a harness trap.** The `P`-object convention is the
reason OPERATIONS §C carries *two* separate warnings: engine tests must supply `asOfYr` or every tax
figure silently becomes `NaN`, and hand-built `P` objects bypass `retireStartBalances` and silently
exclude Other accounts — the second of which "produced a vacuous assertion during v5.26" and is
recorded in `t20`. Engine D's module-global read is why `t19` must call `g.setPortfolio()` and
restore it afterwards (L116, L138).

**Assessment — do not unify on this finding alone.** OPERATIONS §M records that hoist-and-export was
deliberately split across releases three times, on the reasoning that a refactor shipping new
assertions is one whose safety can no longer be checked. A calling-convention change is the same
shape, and the MC-parity guardrail (§E) would be the only thing standing behind it. This is worth a
scope of its own, or worth leaving alone with the traps documented — which they are.

**Severity.** Low-medium. The inconsistency has *already* produced two silent-failure classes; both
are now documented and pinned.

**Exposure.** **Creator-side.**

---

## E-13 · `t15` has no default version tag and dies if run bare

**What.** `t15_engineA_death_filing.mjs` L56 reads `const VER = process.argv[2] || null;`.

**Assessment — this has been FIXED and the record is stale.** Manifest item 11 (in
`PROJECT_KNOWLEDGE_INDEX.md`) states that *"`t15` defaults to the version tag `v514`
(`process.argv[2] || "v514"`) and dies with a module-not-found error if run bare"*, and flags it as
"the enumerated-tag trap in its most brittle form … should be fixed in the next release that touches
the harness." **The source now reads `|| null`, not `|| "v514"`.** The brittle default is gone.

**The finding is therefore the record, not the code:** manifest item 11 describes v5.17-era behaviour
and has not been updated. `VERIFY.sh` passes no argument to `t15` (step 4 runs every feature suite
bare), so whatever `null` does there is exercised on every release — but manifest item 11 would send
a reader looking for a defect that is not present.

**Severity.** Low.

**Exposure.** **Creator-side.**

---

## Summary table

| # | Finding | Severity | Exposure |
|---|---|---|---|
**Open findings**, highest severity first:

| # | Finding | Severity | Exposure |
|---|---|---|---|
| E-6 | jsdom environment duplicated **9×**, never audited | **High** | Creator |
| ~~**E-15**~~ | ~~MC-parity fingerprint runs premium-zero, so no ACA code executes inside the guardrail at all~~ — **DOWNGRADED 2026-08-14**: current regime now inside the guardrail (parity 9/9); enhanced regime still outside | **Low** | Creator |
| E-14 | Freshness check hashed sources only; a stale test in the pool was invisible | **High** | Creator |
| ~~E-2~~ | ~~OBBBA constants + 2028 sunset outside `TAX_CONSTS`, invisible to Verify tab and stale-data strip~~ | **CLOSED at v5.31** — named `OBBBA_CONSTS` block, five Verify rows incl. a dated sunset row, extinction-checked, both negative controls fired | — |
| E-5 | Exported backup does not identify the build (standing requirement) | Med-High | Creator (+User) |
| E-1 | Two stale `rel c` pins in `t19`; `t19` blind to the MAGI wiring it claims to guard | Medium | Creator |
| E-11 | `DOCS_HTML` one line, ~143,000 chars; recorded figures go stale on every edit | Medium | Creator |
| E-7 | 202 hard-coded version-tag comparisons across five suites | Medium | Creator |
| E-12 | Three engine calling conventions; two documented silent-failure classes | Low-Med | Creator |
| E-4 | Version is a repeated literal ×4, no `APP_VERSION` constant | Low-Med | Creator |
| E-8 | Eight orphaned pin branches for unbuildable legs | Low | Creator |
| E-9 | Two independent copies of the 1.02 indexation proxy | Low | Creator |
| E-13 | Manifest item 11 describes a `t15` defect that no longer exists | Low | Creator |

**Closed** — retained so the record shows they existed and how they were resolved:

| # | Finding | Resolution |
|---|---|---|
| ~~E-3~~ | ~~Source comments disagree on which engine models OBBBA; one is false~~ | **CLOSED at v5.30** — comment corrected, extinction-checked, named in the CHANGELOG |
| ~~E-10~~ | ~~Two governing scope docs referenced by `t19` absent from knowledge~~ | **CLOSED 2026-08-12** — restored; **must not be re-retired** |

**E-11 note.** Severity unchanged, but its measurement dispute is settled: 144,008 was the UTF-8 *byte*
count, not characters. See the finding for both figures.

**No fixes were made in the audit session itself.** Each finding above is written as a finding;
several imply work that should be scoped separately, one release at a time, as Phase 2's findings
were. Two have since been closed by release: **E-10** (2026-08-12) and **E-3** (v5.30). **E-14 was
added after the audit**, having been surfaced by the v5.30 build.

---

## E-14 · The freshness check hashed the sources only, so a stale test file was invisible

*Added 2026-08-13. Not found by the audit — found by the v5.30 build, the hard way.*

**Severity.** High. **Exposure.** Creator-side, but it consumes build budget and can mislead a session
into believing the shipped app is broken.

**What.** OPERATIONS §A's pre-build freshness check hashed `DangerClose-<current>.jsx` and compared it
to the manifest. It did not hash anything else. **No test or harness file had a recorded md5 anywhere**
— not in the manifest, not in `TESTING.md`, not in OPERATIONS. Project knowledge is a flat, add-only
pool where a stale file is byte-indistinguishable from a current one, so a drifted test could sit in
the pool indefinitely and no procedure would detect it.

**How it surfaced.** At the v5.30 build the pool's `t8_invariant.mjs` was an older copy: 35 checks, 3
of them failing against correct v5.29 source. The committed `qa/t8_invariant.mjs` had 38 and was green.
The three failures were stale assertions naming `taxableInitFromPositions` after the consolidation
choke point had moved up a level to `taxableInitAll` — the invariant was intact under a new name, and
the app was never defective. The build halted at the baseline run, and diagnosis consumed most of a
session before a repo clone settled it.

**Why it is High despite being creator-side.** The failure mode is not "a test is missing." It is
**"the suite lies about the build."** A stale test fails against correct code and looks exactly like a
regression — which is what happened — or, worse, passes vacuously and conceals one. Every downstream
guarantee this project makes rests on "the full suite is green", and until now that phrase could be
true of a pool that did not match the shipped tree. The published `976 green` for v5.29 was not
reproducible from project knowledge, though it was reproducible from the repo.

**Evidence it was a single-file problem, not systemic rot.** All 33 shared test and harness files were
compared against a fresh clone: **`t8_invariant.mjs` was the only one that had drifted.** Two files
are knowledge-only by design or accident — `tools_fixture.jsx` (which is `qa/tools/fixture/fixture.jsx`
in the repo, byte-identical, merely flattened) and `probe_classify.mjs` (genuinely unversioned).

**Fixed at v5.30 (procedure).** OPERATIONS **§A2** now extends the freshness check to test and harness
files, with clone-and-diff as the primary method — zero maintenance, and it is what actually found the
drift — and a per-file md5 table in the manifest as the offline fallback. Two mapping caveats are
recorded there: the pool flattens repo paths, and not every pool file exists in the repo.

**Residual risk.** The fallback table is only as current as the release that wrote it, and this project
has three separate documented cases of a recorded block going stale. Prefer the clone. The deeper fix
— which is **not** done — is for the packaging step to emit the hash table automatically rather than
relying on it being hand-maintained.


---

## E-15 · The MC-parity fingerprint household is premium-zero, so the guardrail cannot see the ACA path at all

> ### DOWNGRADED High → Low, 2026-08-14, by the E-15 test addendum
>
> A second, premium-positive household now sits in `t2`'s fingerprint under the key `rothAca`,
> and parity is **9/9**. The current regime is inside the guardrail. **What remains open is the
> enhanced regime only** — see "What remains" at the end of this entry.
>
> **The gap was demonstrated, not argued.** Deleting the 100%-of-FPL floor constant outright — a
> one-line change reproducing the pre-v5.32 defect exactly — was run against both versions of the
> guardrail on the same pair of builds:
>
> | Guardrail | Result on a build with the ACA floor deleted |
> |---|---|
> | `t2` as shipped through v5.32 | **8 passed, 0 failed** — completely silent |
> | `t2` with the E-15 addendum | **8 passed, 1 failed** — fails on `rothAca`, and nothing else |
>
> The first row is this entry's claim, measured rather than reasoned. The second row is also the
> discrimination test: a guardrail that fired on everything would be no more useful than one that
> fired on nothing.
>
> The analysis below is kept as originally written, because it is the record of how the gap was
> found and why it went unnoticed for the life of the ACA feature.

**Found at v5.32, verified at the line.** `t2_engines.mjs` L128 builds the Roth fingerprint
household with `acaPremium: 0, acaSize: 0`. `acaHeads` returns 0 whenever `acaPrem <= 0`, so
`bridgeInWindow` is false, `baselineSubByYr` is null, and `acaSubByYr` is never populated.

**No ACA code executes inside the MC-parity guardrail — in either law regime.**

### Why this is worse than the note it replaces

The v5.32 scope described the blind spot as *current-regime*: the fingerprint runs with
`ACA_REGIME` at its default of `"current"`, so a change confined to the enhanced branch is
invisible to it. That is true and it understates the problem by a wide margin. The regime never
comes into it, because the ACA path is not reached at all. The correct description is
**premium-zero**, and the consequence is that an entire feature area — every line of the subsidy
machinery, both regimes, the bridge detection, the baseline run, the per-year charge against
conversions — sits outside the strongest guarantee this project has.

### Why it matters more than an ordinary coverage gap

§E states the guardrail's role plainly: any release claiming "engines unchanged" must keep parity
at 8/8. That sentence is load-bearing in every scope document, and on any release touching the ACA
path it is **true but not evidence**. The v5.32 scope initially assigned parity the job of proving
that release's no-movement claim; that assignment was wrong, and it was caught only because
someone read the fixture rather than the result.

This is the **third** instance of the class in this project:

| | Guardrail | What it was blind to | Found |
|---|---|---|---|
| 1 | The whole 757-check suite | A +10% inflation perturbation inside Engine D moving `totalDrawn` by $50,320 | v5.23 prep |
| 2 | `t2` parity | Engine D moving while the v5.33 capital-gains partial passed 8/8 | v5.33 partial |
| 3 | `t2` parity | **The entire ACA feature area, both regimes** | v5.32 |

§B2 already says a green suite is not evidence of coverage and that coverage must be demonstrated
per claim by negative control. E-15 is what that rule looks like when the guardrail everybody
trusts is the one that is blind.

### Mitigation shipped at v5.32 — narrow, not a fix

`t22` group F runs Engine A on a genuine ACA-bridge household across the version pair and requires
`acaSubByYr`, `totAcaLoss` and `estate` to be byte-identical on every strategy. That covers the
claim v5.32 needed to make and nothing more. It is a per-release check, not a guardrail.

### The actual fix — DONE 2026-08-14 for the current regime

Added a **second fingerprint household with a positive benchmark premium and a real bridge
window** to `t2`'s `compare` set, so the ACA path is inside the guardrail permanently and every
future release gets the same protection the non-ACA engines have had since v5.10.

Three design points are worth carrying forward, because each was a live way to get it wrong:

1. **The fingerprint records the subsidy map, `totAcaLoss` AND `estate` — all three.** Measured
   on the floor-deletion corruption: **estate alone catches 5 of 7 strategies, the subsidy map
   alone catches 4 of 7, the union catches 7 of 7.** They are complementary, not nested. The
   `none` and `current` rows are invisible to estate because with no incremental conversions
   `lost = baselineSubByYr − subY` is zero either way, so the subsidy moves and the loss does
   not; `fill12`/`fill22`/`irmaa1` are invisible to the subsidy map because their own subsidy
   is unchanged while the **baseline** run's moved. Copying `fp.roth`'s estates-only shape — the
   obvious design — would have left the no-conversion baseline row uncovered, which is the row
   every improvement claim in the app is measured against.
2. **The household is fully explicit and must stay that way.** It does not derive from
   `PORTFOLIO()`/`PLAN_TIMELINE()` like the original, so a future example-data change cannot
   silently rewrite the fingerprint. A guardrail household should be inert.
3. **A coverage assertion guards the guard.** `t2` asserts the subsidy map is non-empty before
   fingerprinting it. Without that, a future change to `acaHeads`, the bridge window or the
   retirement year could empty it and the key would fingerprint `{}` forever while staying
   green — which is precisely how this entry came to exist in the first place.

`acaFloorYrs` is deliberately excluded from the fingerprint: it does not exist before v5.32, and
including it would have forced an `INTENDED_DIFFS` entry on a release that changes no engine.

### What remains

**The enhanced regime is still outside this guardrail.** `ACA_REGIME` is a module-level `let`
(L1197 at v5.32) whose only assignment is inside a React toggle handler (L4932), and nothing
exports it — so a module-level harness cannot switch regimes without a source change, and the
addendum was deliberately test-only. Two sites are `ACA_REGIME === "current"` gated (L3786, the
cliff solver; L4032, the baseline subsidy run), so the enhanced paths through them are unfingerprinted.

Coverage there is currently `t22` groups A, B and D, which assert the enhanced branch directly
against the statute. **Scheduled to fold into the A3 release**, which is entirely about sub-floor
behaviour, will touch this code anyway, and by then a regime setter is justified by the feature
rather than added solely for a test.

### Superseded — the original "not done" reasoning, kept for the record

Two things make this more than a one-line change and are why it is recorded rather than done
here. First, it moves the parity check count off 8, which several documents and `VERIFY.sh` state
as a literal — so it is a release with its own scope, not a ride-along. Second, and more
importantly, **a release that adds a guardrail must not also change what the guardrail measures**:
adding the household in the same release as the ACA fix would have meant the new fingerprint was
first recorded against already-changed code, which proves nothing. Same reasoning as the
hoist-then-export separation in §M. The right sequencing is to add the household on a release that
touches no ACA code, so its first recorded value is a known-good baseline.

**Until then:** on any release touching the ACA path, state explicitly in the release notes that
parity does not cover it, and carry the claim with its own check. `t22`'s header says this in the
file itself so the group is not deleted as redundant.

---

# Post-audit additions — 2026-08-16, surfaced by the v5.36 build (session 2)

Current build at the time of writing: **v5.36 ship candidate**, source `b7396c1c14861dc149b71e8edb1a00d5`,
built `c6d7474725d150a616a8ee8d389e8c72` (E-16 was fixed in-release after these entries were first drafted; its closure is recorded in place). Prior shipped: v5.35 · `a28843d3e1f441e90c765419264954ff`.
Written in the E-14 form: findings surfaced by build work rather than by the standing audit, recorded
here so they do not live only in a session transcript. Measurements are from this session's suite runs
and probes, parsed, never restated.

## E-15 · `taxOrd` never grows, so growth on Other-account ordinary money is never taxed

A $600,000 Traditional IRA entered under Other accounts produces **exactly $600,000** of lifetime
ordinary income however much it compounds — `t20` asserts this as an exact invariant (`annuity −
taxable` ordinary excess is exactly $600,000; `trad − annuity` exactly $0). The invariant is correct
about today's code and useful precisely because it pins the omission: growth on that money escapes
ordinary-income recognition entirely. **Understates lifetime tax — the wrong direction for this
app.** Pre-existing (v5.26 onward), measured at v5.36. Fixing it moves `t20`'s hand-verified exact
figures and raises MAGI across most Other-account households, dragging IRMAA and ACA with it — **its
own release**, per STATUS v5.36 §6's agreed disposition. Severity: High. Direction: optimistic.

## E-16 · Engine B's provisional-income test omits realized capital gains (IRC §86 includes them)

`ssTaxable = taxableSSPortion(ssTotal, ordinaryIncome + div_y)` — realized gains are absent from the
proxy. Under IRC §86, provisional income includes capital gains, so on a gain-bearing household with
SS in the phase-in range the taxable share of SS is **understated**. Vacuously harmless from v5.10
through v5.35 while `capGains_y` was hardcoded 0; **live from v5.36**, the release that wires real
gains in. Pinned in `t18` as a dated `[DISCLOSED LIMITATION 2026-08-16]` (a $100K injected gain
leaves `ssTaxable` unchanged, asserted exactly), disclosed in the Taxes-tab footer and the Field
Manual's Honest-limits line. The fix is one expression (`ordinaryIncome + qdcg_y`) but moves SS
taxability on many households — **own release, decision pending the maintainer**. Note Engine D's
`magi` shares the same simplification family (its `taxableSS` proxy); scope the fix cross-engine.
Severity: High. Direction: optimistic.

**CLOSED same day, in-release (2026-08-16).** Presented to the maintainer with a recommendation of
own-release; he chose fix-now. `qdcg_y` now feeds `taxableSSPortion`. The `t18` pin flipped in place
to five exact assertions (the $100K gain drives `ssTaxable` to precisely `round(0.85 × ssTotal)` —
the §86(a)(2) cap, COLA-robust because it is computed from the row's own published `ssTotal` — and
MAGI rises by exactly gain + ΔssTaxable), the short-lived omission copy was corrected on both
surfaces in the same session that wrote it, and control **C12** reverts the term and fires t18(3)
with a fingerprint that moves only the SS-phase-in probe households — the capped and no-SS
households are unmoved, which is what the statute predicts. The cross-engine question was then MEASURED and closed: Engine D has no provisional-income test
at all — its `taxableSS` is the flat 85% maximum (L4809), the conservative simplification — so
E-16 never extended to it. The stale Engine D comment found during that measurement (claiming
gains are "ignored here," one line above the code that carries them — the E-3 defect class) was
corrected in the same release.

## E-17 · Object-shaped `dobA`/`dobB` are silently ignored — a fixture plans a different household than it declares

`buildPlanTimeline`'s date helper returns `null` unless the value is a string, then falls through to
defaults, with no error. A fixture supplying `{ year: 1962, month: 6, day: 1 }` runs at the default
ages. The app is correct — its own form produces strings — so this is a **fixture trap**, already in
OPERATIONS §C2 (added v5.35); recorded here because two suites (`t20`, `t7`) carry object-shaped
dates and any age-keyed expectation in them is a property of the default household. Standing rule:
sweep new fixtures for object dates; prefer strings. Severity: Medium (test-integrity, not app).

## E-18 · Dual-homed files drift, and the fourth recorded block was nearly fatal to a release

Project knowledge and the repo each hold copies of the suite; the pool is flat, add-only, and a
partial refresh is invisible (the count comes back right either way). At the v5.36 session-2 start,
**six of the seven suite files the session brief said carried session-1 edits were the pre-session-1
repo copies** — the session-1 versions existed nowhere in the pool, under any name. Only the
maintainer's local archive recovered them. Fourth recorded drift block (v5.11 amendment, v5.30
`t8`, the manifest's dom_entry row, now this). Mitigation adopted this release: end-of-session
STATUS records the md5 of **every file the session changed** — source and suites — extending E-14's
hash-table principle from packaging to session close. Severity: High (process).

## E-19 · Verdict-instrument failures: a dead probe and a no-op patch both read as green

Three instances now on record, two of them this session, all the same shape — the *instrument*
fails and its silence is read as a verdict. (1) Session 1's control harness ran suites from the
wrong cwd; they died at module load and "no `N failed` line" was read as UNCAUGHT-is-wrong /
nothing-failed. (2) This session's widened fingerprint probe called `computeTaxPlan` on `__g` when
engines live on `__engines`; it died silently and empty-vs-empty compared as **NO-OP**. (3) This
session's C10/C11 control patched the source but skipped `mk_testable.sh`, so the DOM bundle was
built from the **stale splice** and the control was a no-op at the bundle level — it "passed" twice
before the miss was caught. Codified in the adopted `qa/controls.sh`: exit status checked, a dead
probe reports `PROBE DIED` (never NO-OP), rebuild regenerates the splice before bundling, and a
fingerprint-unchanged-but-suite-caught state is reported as probe-blindness, not no-op.
Severity: High (test-integrity).

## E-20 · Homogeneous fixtures hide proportional bugs; witnesses satisfied by the wrong difference hide dead wiring

Two instances of one failure class: coverage that exists only when the fixture can express the
defect. (1) Session 1's C7 (sale never depletes the sub-pool) did not fire because every fixture
was all-ordinary, all-HSA or all-brokerage — the mixed pool (brokerage + IRA + HSA, the shipped
example's own shape) was the discriminating case, and reverting the depletion moved lifetime gain
$89,673 → $194,928 with the whole suite green until it was added (`t19` carries it now). (2) This
session's first call-site witness asserted the Taxes/IRMAA tabs DIFFER across the version pair —
run as its own negative control with both call sites dead, it **did not fire**, because the v5.36
copy differs across the pair regardless: the check was satisfied by the wrong difference. Re-anchored
to figures-only regions (year tables, past all changed copy); the control now fails exactly the two
witness checks. Standing rule, both halves: the discriminating fixture is the heterogeneous one, and
a divergence witness must be anchored to a region only the claimed mechanism can move.
Severity: Medium (test-integrity).
