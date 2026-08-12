# Changelog

## v5.30

**A false disclosure corrected. No engine change, no figure moves — parity 8/8 strict.**

Through v5.29 the Field Manual told users the OBBBA "senior bonus" deduction **was not modelled**,
and that leaving it out made near-term tax projections *"slightly conservative (overstated)."* Both
clauses were false. The Taxes engine has modelled the deduction all along — $6,000 per person 65+,
gated to tax years 2025–2028, phasing out at 6% of MAGI above $75,000 single / $150,000 filing
jointly. So a user reading §13 was told their near-term tax was overstated when the deduction had
already been taken.

The direction is what made this worth its own release. A deliberately pessimistic tool claiming to
be conservative in the one place it is not is the failure mode this project exists to avoid.

### 1. §13 of the Field Manual now says what the app does

The bullet states that the deduction is modelled on the Taxes tab, names the phase-out thresholds,
and — in one sentence — discloses that the Roth conversion ladder does **not** model it, so the two
tabs can differ for any ladder year at or before 2028. That divergence was real and undisclosed
before this release; it is now a disclosed limitation. METHODOLOGY §7 already carried the reasoning
(the deduction depends on MAGI, which depends on the conversion being solved for) and is unchanged.

The closing sentence about every other 2026 constant being verified against IRS Rev. Proc. 2025-32,
CMS and SSA survived the edit intact and is asserted by a new check — replacing half a sentence and
leaving the rest is a defect this project has shipped before.

### 2. METHODOLOGY §5 aligned to §7

§5 listed the deduction among "known simplifications" as deliberately omitted. It now states that it
is modelled, discloses the MAGI proxy the phase-out is computed against (gross ordinary income plus
qualified dividends and capital gains), records that the four OBBBA figures are statutory and
unindexed, and points at §7 for the ladder divergence.

### 3. A false source comment corrected — this closes **E-3**

The comment above `seniorExtraFor` claimed *"Engine A models it on the conversion side and Engine B
in the schedule."* Engine A does not model it, and says so correctly at its own deduction site — the
two comments contradicted each other about the same engine. Named here rather than folded silently
into "docs corrected", because a Section E finding being retired should be visible in the record.

### 4. Engine B's OBBBA arithmetic is now tested — it never was

Correcting copy that describes untested behaviour only moves the risk. `t18` gains **three** checks,
each hand-computed from the OBBBA rules **before** being compared to the engine: a 65+ MFJ household
below the $150,000 phase-out start (full $6,000 × 2), one above it (tapered to $3,000 × 2 by 6% of
the $50,000 excess), and one at `yr = 2029` proving the sunset fires. The sunset case is the load-
bearing one: both spouses are 70 and 71, so the zero can only come from the year gate. All three
matched to the cent.

`t4` gains **six** checks on the corrected §13 copy, read from the iframe `srcdoc` attribute rather
than `textContent` — a `textContent` read passes vacuously on every build. They are **gated per leg**:
the v5.30 leg asserts the corrected copy, earlier legs assert the old copy they legitimately contain,
so frozen legs keep replaying green.

**Negative-controlled.** Restoring the old §13 wording fails **5 of the 6** new `t4` checks. The
sixth passes on both, by design: it guards against *deleting* the true closing sentence, not against
the wrong lead-in.

### Counts — computed from suite output

| Leg | Checks |
|---|---|
| Baseline, current leg (v530) | **490** — t1 64 · t2 15 · t3 36 · t4 147 · t5 44 · t6 21 · t10 163 |
| Feature suites | **487** — t7 41 · t8 38 · t9 14 · t11 40 · t12 23 · t13 42 · t14 33 · t15 11 · t16 24 · t17 63 · t18 50 · t19 14 · t20 94 |
| MC parity (v529 → v530) | **8**, strict |
| **App total** | **985** |
| Tooling (`t21`) | 50, counted separately |
| Built artifact (`smoke_built.mjs`) | 16 |
| Withdrawal DOM diff | 10, re-pointed to v529 → v530 |

The prior leg replays at **980** — five fewer, which is the per-leg gating above (six new checks on
v5.30, one on earlier legs), not a regression.

### Limitations and things this release does NOT do

- **Engine A still does not model the deduction.** That is now disclosed rather than fixed. Whether
  it should model it is a live modelling question with a circularity objection on the record, and it
  needs its own scope.
- **The four OBBBA constants remain hardcoded** in the tax engine rather than living in
  `TAX_CONSTS`, and are therefore **not covered by the Verify tab or the public-constants suite** —
  which is what the surviving "every *other* 2026 constant" sentence now implies. Tracked as **E-2**.
- **The `yr <= 2028` fuse is asserted by exactly one test** (`t18` case 11c) and by nothing in the
  UI. Until E-2 lands, that check is what stands between the app and a wrong answer after 2028.
- **The phase-out is computed against a MAGI proxy**, not a statutory MAGI, and is disclosed as such
  in METHODOLOGY §5.
- **This build did not reproduce bit-identically.** Rebuilding v5.29 from the same scaffold this
  cycle produced `bccfd60d4afa19992d9c1f0c0713e4cb` rather than the published
  `fe6bf7d4230abdacbf7ce1171798feb3`, although all five toolchain versions recorded in OPERATIONS
  §N3a matched exactly. The differences are bundler identifier mangling; the floating dependency is
  **rollup** (a caret dependency of vite that §N3a does not pin). The binding evidence for this
  release is therefore `smoke_built.mjs` at 16/16 on the actual artifact, not a hash match.

**Provenance** — source `src/DangerClose.jsx` md5 `8fcc546263f59fb4a88c131e97f4c882` · built
`index.html` md5 `183b58b463fcd56dfb71311a4cd68caf`.

## v5.29

**Three open items closed. No figure moves — parity 8/8 strict.**

Two source changes and one tooling change, each closing something that had been left pinned or
stated rather than fixed.

### 1. Montana's note now discloses that Social Security is taxed

The state module taxes half of federally-taxable Social Security in Montana (`ss: 0.5`), and its
note said only *"$5,500 65+ subtraction"*. All seven other partial-SS states disclose the treatment;
Montana was the odd one out. Found by the 51-jurisdiction note scan in audit sub-phase 2E and pinned
there. **The modelling was always right — the disclosure was incomplete**, so a Montana user reading
the note would not have learned their Social Security was being taxed.

The replacement assertion is generalised rather than Montana-specific: **every** partial-SS state
must disclose the treatment, so a ninth added later cannot repeat the omission.

### 2. The Roth crossover is now testable, which closes audit 2D's residual gap

`beYr = beWasBehind ? firstRecover : firstAhead` lived in an anonymous closure inside
`DangerCloseMain`. Sub-phase 2D could verify the wealth series, the tax identity and the discounting
equivalence — but not this, because the suite had to reimplement it, and **a control that removed the
never-behind branch from the shipped source changed nothing.**

It is extracted to a module-level `rothCrossover()`. Behaviour is unchanged. The same control now
**fails two checks**, which is the difference between a gap described and a gap closed.

`t10` gains 8 assertions that call the shipped function: the three outcomes cross-checked against the
suite's own reimplementation, plus four unit cases on synthetic series that isolate the branch logic
from the engine entirely.

### 3. `census.cjs` reports both hit and site counts

Where two AST nodes share one source range — object shorthand `{ x }`, export specifiers
`export { x }` — the walk visits both, so the hit count exceeded the site count. Pinned at v5.28.
**Fixed by reporting both numbers rather than deduplicating**, which was one of three options and the
recommended one: every figure quoted in a shipped scope document stays valid, and the discrepancy
becomes visible where it is used. Deduplicating would have silently changed numbers already in print.

The second count is printed only when the two differ, so ordinary output gains no noise.

### Testing

**976 checks green** = 484 (current leg, incl. t10 163) + 8 (parity, strict) + 484 (feature suites),
plus 16 on the built artifact, 10 cross-version DOM-diff, and 50 tooling checks counted separately.

**Parity 8/8 strict.** The crossover extraction is a pure refactor and the note is a string; no
figure moves.

**The prior leg replays at 968** — 8 fewer, because the 8 assertions that call `rothCrossover` cannot
run against builds where the function does not exist. That is correct, and the shim entry is written
in the guarded `_g()` form so pre-v5.29 legs still load rather than throwing.

**Both pins flipped**, and each flip is verified by its own control: reverting Montana's note fails
the 2E scan; removing the never-behind branch fails the 2D shipped assertions.

**A prior-leg break was caught and fixed during the build.** The Montana assertion initially ran on
every leg, so v5.28 — which legitimately carries the old note — failed it. That is the same mistake
made at v5.27, and the rule added to `OPERATIONS.md` §B2 afterwards is what named it: gate the
inversion to the builds it is true for. History now asserts the pin; v5.29 asserts the fix.

**Provenance.** Source `src/DangerClose.jsx` md5 `4ef69e9a820fac18b99aa2aa46a8b2a1` · built
`index.html` md5 `fe6bf7d4230abdacbf7ce1171798feb3`.

## v5.28

**The Field Manual brought up to date with the model. Presentation only — no engine, no schema, no
figure moves.**

An audit of `DOCS_HTML` against shipped v5.27 behaviour found no false statement — v5.27 removed the
last of those — but three places where the manual was silent or stale about work the last six
releases did. All three are corrected here.

### What changed

**1. The Withdrawal Strategy entry described the pre-v5.26 model.** It gave the account-priority
order as *"Taxable → Traditional → Roth"* and never mentioned the pot that is actually drawn
**first**. Since v5.26 that pot contains Traditional, Annuity, Roth and HSA money taxed by type, and
a reader of this entry would not have learned that the IRA they entered there is now taxed. The entry
now names Priority 1, says how it is taxed, and keeps the bucketed order after it.

**2. §13 Limitations named none of the v5.26 simplifications.** `METHODOLOGY.md` carried all five;
the Field Manual — the document users actually read — carried none. All five are now stated there:
proportional taxation of the first-priority pot, HSA modelled as tax-free throughout, the annuity's
part-basis approximation, the qualified-annuity mis-classification, and the Traditional default for
unclassifiable names.

**3. "What's new in v5.7 / v5.7.1 (this build)" was twenty releases stale.** Everything in it was
historically true and none of it was recent. Across the whole manual, `v5.7` appeared three times to
`v5.27`'s two. It is replaced by a section covering v5.22–v5.28 that leads with the release which
moved figures, keeps the v5.7 history rather than deleting it, and no longer claims to be describing
"this build". A stale claim rode along inside it — a **"53-check validation suite"** where the Verify
tab reports 57 — and is gone with it.

**None of this changes what the app computes.** The engines were correct throughout; the manual was
incomplete.

### Testing

**928 checks green** = 436 (current leg, incl. t10) + 8 (parity, strict) + 484 (feature suites), plus
16 on the built artifact, 10 cross-version DOM-diff, and 49 tooling checks counted separately.

**Parity 8/8 strict, and every one of v5.27's 915 checks returns an identical figure** except t1's
four STATIC version strings. `t4` gains 13, one per corrected claim plus two extinction checks.

**The prior leg replays at 915, with `t4` at 128.** The new assertions are gated to v5.28+, because
v5.24–v5.27 legitimately lack this copy. That gate is the rule `OPERATIONS.md` §B2 gained after the
v5.27 harness patch, applied here for the first time — and it worked: the prior leg stayed green
without a second corrective commit.

**Negative controls: three, all firing.** Restoring the old priority-order sentence fails three
assertions; deleting the HSA limitation fails one; restoring the v5.7 heading fails the extinction
and coverage checks.

### A process note, recorded because it nearly shipped

The first attempt at the third edit used an end marker that was neither asserted unique nor
sanity-checked, and **silently deleted 25,000 characters** — a quarter of the Field Manual. It was
caught immediately by the parse check, because removing that much text left the string literal
unterminated. Had the deleted span happened to be balanced, it would have parsed and shipped.

The rewrite asserts the marker is unique, that the end follows the start, and prints both the span
length and the net file delta for a human to sanity-check. That is now how bounded edits inside
`DOCS_HTML` are made, alongside the §C0 read-back rule added at v5.27.

### Limitations

The audit did **not** cover the glossary term by term, §10's API-key material, or §14's FAQ beyond
spot checks. Those remain unverified against current behaviour.

**Provenance.** Source `src/DangerClose.jsx` md5 `9e06482087f415661196b1c47f7e8be0` · built
`index.html` md5 `d61c253f6e8fb82fe53cfdf8b59cab91`.


## v5.27

**Corrects a false statement about your money that v5.26 left in the Field Manual. Presentation
only — no engine, no schema, no figure moves.**

v5.26 made Other accounts taxable by type and rewrote the copy that described them. Its Field Manual
edit replaced the first half of a sentence and **left the second half standing.** The "What you
enter" table therefore shipped saying, one clause after its own correction, that Other accounts are
*"spent tax-free, never taxed on growth, and generating no RMD — even when what you entered there is
an IRA, annuity or state plan. That makes the Withdrawal tab optimistic."*

That was the v5.24 disclosure. It was true when written and false the moment v5.26 landed.

**This is the worst shape a documentation defect can take.** Not an omission but a contradiction, in
which the stale half is more specific and more alarming than the true half and names exactly the
accounts the release had just fixed. A user reading it would conclude their IRA was still being spent
tax-free. It was not — the engines were correct throughout.

### What changed

The false clause is replaced with what the model actually does. The two statements around it that
are **still true** — that Taxable and HSA balances are modelled as already-taxed cash, and that Other
accounts are still drawn first — are preserved. Deleting the passage wholesale would have replaced a
wrong statement with a missing one, and there is a negative control for exactly that.

### Why it survived, which matters more than the sentence

**Two guards failed, and the second is the real finding.**

`DOCS_HTML` is a single 141,091-character line. Project convention requires quote-free anchors when
editing inside it, and that was followed — but an anchored replacement is correct about the span it
replaces and **silent about the text that follows**, which on a line that long is invisible. The
convention gains a second half: after editing inside `DOCS_HTML`, read back the full surrounding
sentence.

**Three `t4` assertions were holding the false claim in place.** Dating from v5.24, they asserted the
*presence* of the three statements v5.26 falsified. The suite was green partly **because** the stale
copy survived, and would have failed had the Field Manual been corrected properly. v5.26 correctly
inverted the equivalent assertions for the Withdrawal tab and the My Data panel and missed this set —
and missing it is what let the source defect through.

A disclosure assertion that is not re-examined when its disclosure becomes false stops being a test
and becomes a lock. All three are now extinction checks.

### Testing

**915 checks green** = 423 (current leg, incl. t10) + 8 (parity, strict) + 484 (feature suites), plus
16 on the built artifact, 10 cross-version DOM-diff, and 49 tooling checks counted separately.

**Parity 8/8 strict, and every one of v5.26's 911 checks returns an identical figure** except t1's
four STATIC version strings (expected on any bump) and the three inverted t4 assertions. This release
changes text and nothing else.

`t4` gains 5 net: the three inverted, two guards that the surviving true statements are still there,
and a new **consistency** assertion — the manual must not simultaneously claim this money is taxed
and that it is spent tax-free. That assertion's absence is what allowed the contradiction to ship.

**`qa/domdiff_withdrawal.mjs` returns to strict identity.** At v5.25 it asserted identity, at v5.26
intended divergence, and now identity again, because v5.27 changes no withdrawal copy. The assertion
is meant to flip with each release; a diff harness that passes for every release measures nothing.

**Negative controls: two, both firing.** Restoring the exact v5.26 defect fails the extinction and
consistency assertions. Deleting the clause wholesale instead of replacing it fails the guards on the
two true statements — which is why that control exists.

One control initially appeared not to fire, and the cause was in the harness rather than the code:
`t4` loads its DOM bundle by version tag, so swapping the shared bundle file had no effect and the
control was never actually running. Recorded because it is a trap the next person will hit.

### Limitations

The rest of `DOCS_HTML` has **not** been audited against current behaviour. Only the falsified passage
was in scope. Given that this defect existed at all, a full pass of the Field Manual against the
v5.26 model is worth doing and is not this release.

**Provenance.** Source `src/DangerClose.jsx` md5 `5e1e81566fe4101eaf6bf584e38b1830` · built
`index.html` md5 `e476e180ee8b1034a92b5c36933bdba8`.


## v5.26

**Other accounts are now taxed according to their type. This is the release that moves figures —
and the first since v5.21 where that is the point rather than the risk.**

v5.24 disclosed that Engine D spends every Other account as already-taxed cash — including money the
user named as an IRA — and that this makes a plan look better than it is. v5.25 recorded what kind
of money each account holds and deliberately used it for nothing. **v5.26 uses it.**

### What changed for users

- **Traditional and Annuity balances are taxed as ordinary income as they are spent.** Through
  v5.25 they were spent tax-free.
- **Traditional balances now count toward RMDs.** A named IRA entered under Other accounts
  previously generated none.
- **Taxable and HSA balances are unchanged** — still spent as already-taxed cash.
- **A fifth tax type: Annuity.** A non-qualified annuity is taxed like pre-tax money but carries no
  required distribution. v5.25 recorded these as Traditional, which was conservative for tax and
  **wrong for RMD** — it manufactured an obligation the owner does not have. Plans are re-classified
  once, and every row changed is named in the review notice.
- **The Roth tab's funding gate stopped counting IRA money as spendable.** It summed every Other
  account when deciding whether you had outside money to pay conversion tax. You never did —
  spending that money is itself a taxable event.
- **The review notice re-fires once**, and now leads with the fact that figures moved rather than
  with the guess that was made.

**If your numbers got worse, that is the correction.** The Withdrawal tab was optimistic by the
amount v5.24 described, and it no longer is.

### What deliberately did not change

The **draw order** — Other accounts are still spent first. **HSA** stays outside the tax split
(decision C-4), consistent with the v5.10 contribution-accrual treatment. And the **Monte Carlo is
untouched**: cross-version engine parity is **8/8 strict**, which is the mechanical statement that
this fix did not overreach.

### Two defects found during the build, both in this release's own new code

- **The annuity was still fabricating RMDs in three of the five engines** after the schema was
  already correct. Engines A, B and C compute RMDs from a running pre-tax balance, so excluding the
  annuity at the schema level was not enough.
- **The annuity exemption was mis-applied after a spousal rollover** — carried as a share, it was
  then applied to the merged balance and exempted far more than the annuity was worth. Caught by an
  existing cross-check comparing the MAGI drop in both death directions, which diverged by $6K.

A third was caught before it could ship: the first implementation of the owner split dropped any row
with no owner, silently removing $111,000 from the pre-tax basis — the optimistic direction. It now
uses the fail-safe convention the position code already used.

### Testing

**911 checks green** = 419 (current leg, incl. t10) + 8 (parity, strict) + 484 (feature suites),
plus 16 on the built artifact, 13 cross-version DOM-diff, and 49 tooling checks counted separately.
Every figure read from parsed suite output rather than restated by hand.

| | |
|---|---|
| current leg | 419 — t1 64 · t2 15 · t3 36 · t4 124 · t5 44 · t6 21 · t10 115 |
| parity v5.25 → v5.26 | **8, strict, no INTENDED_DIFFS** |
| feature | 484 — t7 41 · t8 38 · t9 14 · t11 40 · t12 23 · t13 42 · t14 33 · t15 11 · t16 24 · t17 63 · t18 47 · t19 14 · **t20 94** |
| built artifact | 16 |
| withdrawal DOM diff | 13 — now asserts **intended divergence**, not identity |

**`t19`'s defect pin flipped, and that is this release's own verification.** It asserted, dated and
in place since v5.21, that adding $100K to a named IRA left the pre-tax basis untouched. It now
asserts the opposite and passes.

**`t20`'s extinction assertion inverted.** Through v5.25 it proved that permuting every tax type
changed no engine output — the claim that made "every figure identical" meaningful. That assertion
is now false by design, so it was replaced rather than deleted: engine output must now **change**,
asserted per engine at its own basis, with three engines named as ones that must **not** move and
why. Its new extinction is that annuity money never generates an RMD anywhere.

**Every figure that moved was hand-verified before any expectation was edited.** One movement did
not fit its first explanation — a survivor-year RMD that rose by 18% where the arithmetic predicted
8.5% — and the build stopped rather than recalibrating. Investigation showed the effect is an
**absolute** addition of ~$8.3K, stable across conversion levels; the ratio climbs only because Roth
conversions shrink the denominator. The full sweep is recorded in the suite.

**Negative controls: eight, all firing.** Making the annuity RMD-bearing, removing the rollover
rescale, removing the ordinary-income term from MAGI, reverting the bucket ratio, dropping the
re-classification, removing the owner fail-safe, restoring the Roth gate's raw sum, and letting an
annuity be held jointly each fail specific checks.

**Three did not fire on the first attempt, and each exposed a real gap** — closed by strengthening
the tests, never by weakening the control:

- Deleting the term that makes a spent IRA taxable — *the entire point of the release* — broke
  nothing. The permutation check passed for the wrong reason. Now asserted exactly: an annuity's
  lifetime MAGI excess over a brokerage account equals its balance to the dollar.
- The owner fail-safe was unreachable through the tested path, because migration back-fills the
  owner. Now tested where it actually applies.
- No fixture held a jointly-entered annuity, so that promotion was never exercised.

**Three of the suite's own fixtures were found to be vacuous** while writing this release: an
account owned by a spouse whose RMD age falls outside the plan horizon (identical results for every
tax type, passing while testing nothing), a hand-built engine input that bypassed the shared basis
constructor and so could not see the field it was asserting about, and a fixture whose `household`
did not contain its own account.

### Limitations, stated plainly

- **The RMD effect inside the Withdrawal tab is small** (~$900 of lifetime RMD on $600,000) because
  Other accounts are spent first and are mostly gone before RMDs begin. The larger effect is in the
  Roth, Taxes and IRMAA tabs.
- **A draw from the first-priority pot is taxed in proportion** to what the pool holds, not by
  draining one type before another.
- **An annuity is part after-tax basis and cannot be expressed** by a single label; all of it is
  treated as ordinary income, the pessimistic direction.
- **A qualified annuity inside an IRA does have an RMD** and will be mis-classified by name
  inference. The field is user-correctable and the notice names every row it changed.
- **HSA money is only tax-free for qualified medical costs**; it is modelled as tax-free throughout.
- **Unclassifiable account names default to Traditional** (decision C-2), which over-taxes a
  brokerage account nobody renamed. The conservative direction, and a guess either way.

**Provenance.** Source `src/DangerClose.jsx` md5 `0d219f87f8bc9d7e44f8703c35efee92` · built
`index.html` md5 `b7a3ec26eab40e176d4b731fd069c52c`.


## v5.25

**Other accounts now record what kind of money they hold. Nothing uses it yet — and the app says so.
No engine is touched, and all 787 pre-existing checks return identical figures.**

v5.24 disclosed that Engine D treats every account entered under Other accounts as already-taxed
brokerage cash — drawn first, spent tax-free, growth never taxed, no RMD — including money the user
named as an IRA. On the example household that is $111,000 of a $147,000 pot. The fix for the
*modelling* is a later release, and it cannot happen at all until the data records the
classification: through v5.24 `buildPortfolio` emitted these accounts as exactly
`{ name, balance, owner }`. There was nothing to classify from.

This release adds that field, migrates existing plans onto it, and does nothing else with it.

### What ships

- **A `taxType` on each Other account** — `taxable` | `trad` | `roth` | `hsa` — persisted, exported
  and imported.
- **A selector in My Data**, with a disclosure line stating plainly that the type is recorded, drives
  nothing today, and will not move a figure until a later release.
- **Migration for existing plans.** A backup with no `taxType` has one inferred from each account
  name, using the same idiom the file already used to back-fill a missing `owner`. A one-time My
  Data notice lists what was guessed, **what could not be guessed**, and any account whose owner was
  reassigned.
- **Traditional and Roth accounts can no longer be jointly owned.** An IRA cannot be held jointly,
  and a jointly-owned pre-tax account has no RMD age for a later release to compute on. Migration
  promotes such a row to person A and names it in the notice; the editor stops offering Joint on
  those rows. A single filer sees a fixed owner rather than a one-item dropdown.
- **Every entry path sets the type explicitly** — the example household, both spreadsheet-parser
  paths, and the guided wizard — so inference is reserved for old backups, where nothing else is
  available.

### The correction to the tooltip, which was the opposite of what the app does

The owner selector told users: *"Retirement accounts (IRA/401k) live in the Holdings table above."*
The app does not honour that. The shipped example household carries a Rollover IRA and a Traditional
IRA as Other accounts, and the spreadsheet parser **actively creates** annuity and state-plan rows
there. The instruction and the behaviour had contradicted each other for some time. The decision was
to make the tooltip true rather than migrate the data: an annuity is not a holding, and forcing it
into the Holdings table would require `bucket`, `type` and `er` values, none of which are meaningful
for it. The true half of the old tooltip — that retirement accounts are individually owned by law —
is kept, and is now enforced rather than merely advised.

A second line, above the Other accounts card, said these accounts "aren't classified". That is now
false and has been corrected.

### A defect introduced by v5.24, found and fixed here

The v5.24 edit that added the Field Manual disclosure left a stray editing anchor in the document:
the "What you enter" table ended with a dangling quoted phrase, `"other accounts"`, visible to
anyone reading the manual. It is absent from v5.23 and present in v5.24, so it shipped with that
release. Removed. The same table now also describes the tax-type field, which it otherwise would
have understated.

### The known approximation, disclosed at the field

`taxType` is a single label, so a genuinely mixed account cannot be expressed. The real case is a
**non-qualified annuity** — after-tax basis, tax-deferred growth, gains taxed as ordinary income on
the way out — which is neither `taxable` nor `trad`. It is recorded as `trad`, which will treat all
of it as ordinary income once a later release uses the field. That is the conservative direction and
therefore the right way to be wrong, but it is an approximation and the field's help text says so.
It will be recorded in METHODOLOGY when it starts to bite; today it changes nothing.

### What this release deliberately does NOT do

No engine reads `taxType`. Nothing about MAGI, RMDs, `_taxInit`, `_tradInit` or the draw order
changes. Every Other account is still drawn first and spent as already-taxed cash, exactly as at
v5.24, and the Withdrawal tab is still optimistic by the amount v5.24 disclosed. **METHODOLOGY is
unchanged, because the modelling is unchanged** — this release records a fact, it does not use one.

### Testing

**872 checks green** = 423 (current leg, incl. t10) + 8 (parity, strict) + 441 (feature suites),
every figure read from parsed suite output rather than restated by hand.

| | |
|---|---|
| current leg | 423 — t1 64 · t2 15 · t3 36 · t4 123 · t5 49 · t6 21 · t10 115 |
| parity v5.24 → v5.25 | 8, strict, no INTENDED_DIFFS |
| feature | 441 — t7 37 · t8 35 · t9 14 · t11 40 · t12 23 · t13 40 · t14 33 · t15 11 · t16 24 · t17 63 · t18 47 · t19 13 · **t20 61** |
| built artifact | 16 — `qa/smoke_built.mjs` |
| withdrawal DOM diff | 9 — `qa/domdiff_withdrawal.mjs`, now **strict identity** |

**All 787 pre-existing checks return identical figures.** Every per-suite count is unchanged from
v5.24 except the four suites this release extends. The 85 new checks are `t20` (61), `t4` (+16),
`t5` (+5) and `t6` (+3).

**`qa/domdiff_withdrawal.mjs` is stronger than it was.** At v5.24 it excised the deliberately
reworded Priority 1 panel by anchor and required everything else to match. v5.25 changes no
withdrawal copy, so the excision was removed and the whole tab is now required to be byte-identical
apart from the version string. That is the direct proof that no figure moved.

**Negative controls (OPERATIONS §B2).** A green suite is not evidence of coverage, so every new
assertion was broken on purpose:

| Control | Result |
|---|---|
| `t20` against the frozen v5.24 build | 42 of 59 fail |
| Engine D patched to actually read `taxType` | the extinction assertion fires |
| one inference rule (annuity) broken | trad total drops to $104,000 — short by exactly the $7,000 annuity |
| the owner promotion removed | the schema invariant, both promotions, the ordering check and the notice all fail |
| back-fill order swapped | the ordering assertion fires |
| the disclosure text altered | the `t4` disclosure assertion fires |
| Joint restored on retirement rows | three `t4` D-5 assertions fire |

**Two of the new assertions were found to be vacuous during that process and were fixed.** The
schema invariant and the extinction check both passed on v5.24 for the wrong reason — where the
field does not exist, a condition about the field is never true. Both now assert their precondition
first. This is recorded because it is the same failure the negative-control rule exists to catch,
reproducing itself inside the tests written to obey that rule.

**A required equality.** v5.24 told users, in the app, that $111,000 of the example household's
$147,000 first-draw pot is not already-taxed money. The inference rules are asserted to reproduce
that split to the dollar — $111,000 `trad`, $21,000 `taxable`, $15,000 `hsa` — because if the
classification and the shipped disclosure ever disagree, one of them is lying to somebody.

**The built artifact was verified against a control.** Before trusting the new build hash, v5.24 was
rebuilt from the same scaffold and reproduced its published `index.html` byte-for-byte
(`d959019388994da4e25f153f220d7593`), which is what distinguishes "the scaffold is complete" from
"the hash looks plausible".

### Limitations, stated plainly

- **The inference is a guess.** An account named `Fidelity ...4471` carries no signal and is left as
  Taxable — optimistic, and the reason the notice reports what it *could not* classify rather than
  only what it could.
- **Promoting a jointly-owned retirement account to person A is also a guess**, and will sometimes
  be wrong. It is tolerable only because the notice names the row. If that notice is ever dropped,
  this behaviour has to be reconsidered.
- **A mixed-basis account cannot be represented at all** (see the annuity note above).
- **Nothing here makes the Withdrawal tab less optimistic.** It records the information needed to
  fix that later. Users who read the v5.24 disclosure and expected v5.25 to correct the figures
  should know that it does not, by design.

**Provenance.** Source `src/DangerClose.jsx` md5 `590f6e31641561d343e7a544e889d0f7` · built
`index.html` md5 `722fa8e03f830ed772e522802af3b8cf`.


## v5.24

**The Withdrawal tab was telling users something false about $147,000 of the example household.
This release stops it. No engine is touched, and all 770 pre-existing checks return identical figures.**

The Withdrawal tab's Priority 1 panel called its first-draw pot "Emergency Fund and any after-tax /
taxable brokerage" and explained it as "Already-taxed principal. Only the gains are taxed (long-term
cap gains: 0% / 15% / 20%)." Both halves were false. Engine D derives that pot as
`household − total401k`, which sweeps in **every** account entered under Other accounts — the
example household's Rollover IRA, Traditional IRA, annuity and state plan among them. And no gains
are taxed anywhere in Engine D, at any rate. The Field Manual made the matching error, describing
those accounts as "non-retirement."

On the shipped example household the pot is $147,000, of which **$111,000 — 76% — is not
already-taxed money**. It is drawn first, spent entirely tax-free, its growth is never taxed, and it
never reaches the balance RMDs are computed on.

### What this release does and does not do

**It does not fix the modelling.** The pot is still misclassified; that fix is a later release. What
changes is that the app now says so, in the app's own disclosed-limitations voice, in both places
that previously denied it — including the direction of the error: **this makes the plan look better
than it is.** For a tool whose stated identity is deliberate pessimism, that is the wrong way to be
wrong, and shipping the disclosure before the fix means users are told the tool is optimistic here
before it stops being optimistic.

**A correction to how this defect was previously described.** Earlier documents — this changelog
included — recorded the defect as "Engine D's `magi` omits `drawFromTaxable`" and implied the fix
was to add it. That is wrong and would have introduced a defect. A withdrawal from a taxable
brokerage account is mostly return of basis; only realized gain is income, at preferential rates.
Adding the whole draw to MAGI would tax returned principal as ordinary income. The source says so at
the line, and Engine B agrees — it sets realized capital gains to $0 unless a sale is modeled. The
omission is deliberate, documented, correct, and consistent across engines. The defect is the
**classification feeding** MAGI, not MAGI itself. `t19`'s pin carried the wrong framing and has been
re-tagged and reworded; its assertion was correct and is unchanged. This finding has now been stated
wrongly four times across three documents, which is recorded here because it will be read again.

### Testing

**787 checks green**, every figure parsed from suite output rather than hand-totalled:

```
baseline 399 (t1 64 · t2 15 · t3 36 · t4 107 · t5 44 · t6 18 · t10 115)
parity     8 (v5.23 -> v5.24, strict, no intended diffs)
feature  380 (t7 37 · t8 35 · t9 14 · t11 40 · t12 23 · t13 40 · t14 33
              t15 11 · t16 24 · t17 63 · t18 47 · t19 13)
TOTAL    787 = 770 pre-existing returning IDENTICAL figures + 17 new t4
```

Plus **16 checks against the built `index.html`** (`qa/smoke_built.mjs`) and **8 cross-version
DOM-diff checks** (`qa/domdiff_withdrawal.mjs`, up from 4), which are cross-version by nature and so
are not counted in the release headline.

**The 17 new checks are extinction assertions on the corrected copy**, in `t4`, so the false wording
cannot return. **Negative-controlled:** restoring the old copy fails **15 of the 17**. The two that
still pass are deliberate — they assert the Field Manual iframe exists and that its `srcdoc` is
substantial, which is what proves the four assertions reading it are capable of failing at all.

**`qa/domdiff_withdrawal.mjs` is the proof that no figure moved.** It renders the Withdrawal tab on
both builds and requires everything outside the Priority 1 copy block to be byte-identical, with the
copy block excised by anchor rather than by loosening the comparison — so a change elsewhere cannot
hide inside a relaxed test. It also asserts the copy block **did** change, and that v5.23 carries the
old false claim while v5.24 does not.

**Build control.** Before building v5.24, v5.23 was rebuilt from the same scaffold and reproduced its
published `index.html` md5 byte-identically. That is what makes the new build hash below trustworthy
rather than merely plausible.

### Limitations disclosed

- **The modelling is unchanged and still wrong.** Tax-deferred money entered under Other accounts is
  still spent tax-free, still untaxed on growth, and still generates no RMD. This release only
  removes the false claim that it is already-taxed principal.
- **The corrected copy describes the class, not the amount.** It does not print how much of a given
  user's pot is misclassified, because the app does not classify those accounts — that is the defect.
  The 76% figure is specific to the shipped example household.
- **`t4`'s new checks are copy assertions, not modelling assertions.** They prove the app says the
  right thing. Nothing in this release proves Engine D computes the right thing, and `t19` continues
  to pin three known Engine D defects as unfixed.
- **The phrase "non-retirement" still appears three times outside the Field Manual** — twice in code
  comments and once on the Taxes tab. All three describe a different quantity (the part of a bucketed
  position that is neither Roth nor Traditional) and are accurate. They were checked, not missed.

### Provenance

Source `src/DangerClose.jsx` md5 `a0d33a885c29e86493a614b44060ed41` ·
built `index.html` md5 `d959019388994da4e25f153f220d7593`.


## v5.23

**The last engine computed inside the component body is now a module-level function — and the
Withdrawal tab renders byte-identically.**

Engine D, the Withdrawal tab's projection, was an arrow IIFE embedded in JSX inside the component
body. It is now `computeWithdrawalPlan({ retireYear, rothAmount, scenarioPreset })`, sited beside
`computeTaxPlan`. 226 lines moved verbatim; the JSX return half is untouched; the three values it
used to read from the surrounding component scope are now parameters, and **no component-scope read
remains**. This release fixes nothing and changes no output — that is the whole claim.

### Why this release exists

An engine computed inside the component body has no module-level binding, so the test harness cannot
reach its row array. Its only output path is the rendered DOM, which prints every figure rounded to
the nearest $1,000 — a ±$500 measurement ceiling. Engine D was the last engine behind that ceiling;
Engine C left at v5.17–v5.18 and Engine B at v5.19–v5.21 by the same route.

The hoist and the dollar-exact assertions stay in **separate releases**, as they did both previous
times. A refactor that ships new assertions is one whose safety can no longer be checked, because
green stops distinguishing "the code is unchanged" from "the tests were written to match whatever it
now does."

### What the proof is — and what it is not

**The green suite is not the proof, and this release is the reason to say so plainly.** While this
work was being prepared, a +10% inflation perturbation inside Engine D moved `totalDrawn` by
**$50,320** — and the entire 757-check suite stayed green. `t4` (90 checks, which walks the
Withdrawal tab) passed. `t12` (23 checks, *named* `t12_engineD_survivor`) passed. Engine D had never
had discriminating coverage, and nothing in the suite's output said so.

The proof is instead `qa/domdiff_withdrawal.mjs`, which renders the Withdrawal tab on both builds and
diffs the text. Before normalising version strings, the **only** divergence in the entire tab was the
footer's `v5.22` → `v5.23`. Every schedule row byte-identical.

### Testing

**770 checks green**, every figure parsed from suite output rather than hand-totalled:

```
baseline 382 (t1 64 · t2 15 · t3 36 · t4 90 · t5 44 · t6 18 · t10 115)
parity     8 (v5.22 -> v5.23, strict, no intended diffs)
feature  380 (t7 37 · t8 35 · t9 14 · t11 40 · t12 23 · t13 40 · t14 33
              t15 11 · t16 24 · t17 63 · t18 47 · t19 13)
TOTAL    770 = 757 pre-existing returning IDENTICAL figures + 13 new t19
```

Plus **16 checks against the built `index.html`** (`qa/smoke_built.mjs`) — the artifact boots,
dismisses its gate, mounts React from the inlined bundle, loads the example household, reaches the
Taxes tab, and round-trips the `window.storage` shim. Plus **4 cross-version DOM-diff checks**
(`qa/domdiff_withdrawal.mjs`), which are cross-version by nature and so are not counted in the
release headline.

**New: `t19` — Engine D's first real coverage**, 13 checks. Five are structural (reachability, the
17-key return contract, determinism, parameter purity) and eight are fixture or pinned. It carries
three dated `[KNOWN DEFECT]` pins asserting today's wrong behaviour, so each fails the moment the
defect is fixed and that flip becomes the fix's own verification.

### Limitations disclosed

- **`t19` is not dollar-exact against hand-computed law.** It asserts structure, determinism and
  three pinned defects. Removing the ±$500 ceiling is what makes dollar-exact assertions *possible*;
  writing them is the next release's work, not this one's.
- **Engine D's known defects are pinned, not fixed.** `otherAccounts` is treated wholly as taxable;
  withdrawals from the taxable pot are absent from MAGI; money in a named traditional IRA never
  reaches the balance RMDs are computed on. All three remain in this build.
- **One carry-forward pin claim was wrong as specified and was corrected before pinning.** It read
  "the named IRA produces no RMD anywhere." That is false: RMDs *do* move, indirectly — a larger
  taxable pot means less traditional drawdown, so more traditional balance survives to RMD age
  (lifetime RMD $151,662 → $218,941 on a $100K addition). The defect is that the traditional balance
  never sees the money, not that RMDs are unaffected. Pinned as corrected.
- **Coverage before `t19` was assumed, not measured.** The scope for this release asserted that `t4`
  and `t12` would witness the hoist. Both claims were false, and were caught only because the
  negative control was actually run rather than taken on trust.

### Provenance

Source `src/DangerClose.jsx` md5 `bce4bd537a498df5b489ea5702e3eb44` ·
built `index.html` md5 `0a14dc285936c0f84440554893cf3086`.

## v5.22

**One expression, written seven times, is now written once — and every figure in the app is unchanged.**

The taxable-residual expression `Math.max(0, balance − roth − trad)` was duplicated across seven sites
(finding D-2D-2). It is now a single module-level helper, `taxableInitFromPositions(P = PORTFOLIO)`. This
release is the first of three; it deliberately changes **no output at all**, and that is the whole proof.

### What changed

`taxableInitFromPositions` is sited **beside** `retireStartBalances`, not inside it. That constructor
applies `contribAccrual`, and no accrual flows to taxable money — folding the residual in would either
apply accrual it must not have, or add a field bypassing the constructor's own invariant. The header
comment that read *"those reduces stay inline at their sites"* was amended in the same edit, because it
became false the moment this shipped. Leaving a now-false comment beside a new helper is precisely the
defect class the next release exists to fix.

**One call site was deliberately not consolidated.** The Roth funding gate combines the positions
residual with every dollar of `otherAccounts`. Only the positions half was replaced; the `otherAccounts`
term stays exactly as written. Folding it in would change what that warning gate measures — a behaviour
change in a release whose entire claim is that nothing changed. It is the site most likely to be tidied
by accident, and `t8` now fails if it is.

### Testing

**757 checks green**, every figure parsed from suite output rather than hand-totalled:

```
baseline 382 (t1 64 · t2 15 · t3 36 · t4 90 · t5 44 · t6 18 · t10 115)
parity     8   (v5.21 -> v5.22, strict)
feature  367 (t7 37 · t8 35 · t9 14 · t11 40 · t12 23 · t13 40 · t14 33 · t15 11 · t16 24 · t17 63 · t18 47)
TOTAL    757 = 751 pre-existing returning IDENTICAL figures + 6 new t8 assertions
```

Plus **16 checks against the built `index.html`** (`qa/smoke_built.mjs`) — the artifact boots, dismisses
its gate, mounts React from the inlined bundle, loads the example household, reaches the Taxes tab, and
round-trips the `window.storage` shim.

**Parity is 8/8 strict** with no `INTENDED_DIFFS` entry. Needing one would have meant the change
overreached.

**Negative controls.** Re-inlining one copy of the residual at the Taxes engine fails `t8` 2 of 35
(the extinction assertion and the count); flattening the funding gate's `otherAccounts` term fails 1 of
35; restored, 35/0. The new version-guard registry exits 1 on an unregistered tag.

### A test-harness fix that shipped with this release

Five version-keyed suites (`t1`, `t3`, `t4`, `t5`, `t6`) gated behaviour on enumerated version tags, and
an **unregistered tag silently fell through every ternary to the oldest branch** — running pre-v5.11
expectations and v5.10 version strings against a new build. Fail-open: a newer build got a *weaker* test,
and the check count moved with it (`t3` ran 35 instead of 36). All five now share a `KNOWN_VERSIONS`
registry that hard-exits on an unknown tag. This adds zero assertions and changes zero figures for
registered tags. No ladder had already missed a roll-forward — the exposure was prospective, not
historical.

`qa/tools/` is added: four AST-based parser tools (`funcmap`, `census`, `diverge`, `residual`) used to
resolve the site census for this release. They live outside the suite directory because they assert
nothing and must never be countable as checks. **They are not themselves tested** — their output was
corroborated against hand-read facts, which is not the same thing, and a fixture for them is outstanding.

### Limitations, unchanged by this release

The four modeling engines remain parallel implementations of overlapping statute. Engine D (the
Withdrawal tab) is still computed inside the component body, so it is observable only through the
rendered DOM at **±$500**, and its known defects — `otherAccounts` treated wholly as taxable, draws from
it contributing nothing to MAGI, and a named traditional IRA producing no RMD — are **not fixed here.**
They are the subject of releases (b) and (c). No `[KNOWN DEFECT]` pin was added for them in this release;
see TESTING for why that requires an instrumentation change first.

METHODOLOGY is unchanged — this is the one release of the three that alters no modeling.

**Provenance.** Source `src/DangerClose.jsx` md5 `aac6851f91860edc8341dd44a2c35424` · built `index.html`
md5 `34450fb1513117c9b47c1584028e8d72`. Built with vite 5.4.21 / @vitejs/plugin-react 4.7.0 /
vite-plugin-singlefile 2.3.3 / react 18.3.1 on node 22; the build is byte-reproducible on that toolchain.

## v5.21

**Engine B is now checked to the cent — and Engines A and B have been compared for the first time.**

The Taxes planner, hoisted to module level at v5.19, is exported to the test harness and asserted
against IRS figures by a new suite. **No engine in the app is behind the ±$500 measurement ceiling
any more.** Every pre-existing check returns the figure it did at v5.20, and parity is 8/8 strict.
The only source edit is the version string.

### What this closes

Engine B produces the lifetime tax estimate and is what the Roth conversion decision leans on. Until
now the only way to observe it was the rendered DOM, where every figure is `Math.round(x / 1000)`.

**`t18_engineB_exact.mjs` — 47 checks.** Federal ordinary tax against a hand bracket walk at three
income levels in both filing statuses; the §63(f) age-65 additional deduction counted per spouse,
including the pre-65 boundary; Social Security taxability at the IRC §86 provisional-income tiers,
which are statutorily unindexed; and the agreement invariant below. Brackets, deductions and the
age-65 extra are typed from IRS Rev. Proc. 2025-32, not read from the app.

**Negative-controlled at 24 of 47.** The injected defect was the v5.20 Roth-ladder bug transplanted
into Engine B — dropping the age-65 extra from `totalDeductions`.

### The finding this release went looking for

Engines A and B are **parallel implementations of the same statute**. Verified by counting call
sites inside each function:

| shared helper | Engine A | Engine B |
|---|---|---|
| `fedOrdinaryTax` | **0** | 1 |
| `ltcgTax` | **0** | 2 |
| `marginalBracket` | **0** | 1 |
| `taxFactsFor` | 1 | **9** |

Engine A calls **none** of the shared bracket, LTCG or marginal-rate helpers — it carries its own
inline copies. AMT differs too: A reads `TAX_CONSTS.SGL_AMT_EXEMPT` directly; B goes through
`inflate(taxFactsFor(effSingle).amtEx, yr)`. v5.16's consolidation reached B thoroughly and A barely.
`t10` asserted A to the dollar, nothing asserted B, and **nothing checked they agree.**

**They agree, on the path tested.** Case 10 drives both on the same household across six
configurations — three income levels, both filing statuses — with Engine A's inputs derived from
Engine B's own reported row so a misconfiguration cannot manufacture a divergence. Federal tax
matches within a dollar in every case. (Within a dollar rather than a cent because Engine A rounds
its reported total once; Engine B returns cents.)

**Be precise about what that covers.** All six cases run pure ordinary income: `ssTaxable`,
`capGains_y`, `niit_y`, `amt_y`, `fica` and `stateTax` are **zero in every one**, and all are the
2029 row. So what is established is that the bracket walk, the standard deduction and the age-65
extra agree — the highest-traffic path, and good evidence the shared constants hold even where the
code is duplicated. It is **not** a clean bill of health for the engine pair. In particular the AMT
difference documented above — A reading `TAX_CONSTS.SGL_AMT_EXEMPT` directly, B going through
`inflate(taxFactsFor(effSingle).amtEx, yr)` — is the one concrete structural divergence found, and
the agreement test never reaches it, because these households are nowhere near the exemption.
Extending the comparison to AMT should come first when t18's remaining cases are written.

That was not the expected result. The scope put the odds the other way, and the release was
authorised on the basis that a divergence would be reported and deferred rather than fixed. There
was nothing to report. **The invariant now stands as insurance:** these two implementations cannot
drift apart in future without a test saying so, which is the outcome that matters given this
project's history with duplicated arithmetic.

### A check that reported coverage without running

An early draft asserted the pre-65 boundary by reading a 2028 row from a plan whose rows begin at
2029. It got `undefined`, sat behind an `if`, and reported nothing — while appearing in the file as
coverage. Engine B's rows start at `retireYear`, so the year is only reachable by passing
`retireYear` explicitly. Corrected, and the case now confirms both spouses' ages before asserting
the deduction, so it cannot pass for the wrong reason.

### Testing

**751 checks green** — 704 of them returning figures identical to v5.20: baseline **382** (t1 64 ·
t2 15 · t3 36 · t4 90 · t5 44 · t6 18 · t10 115) + engine parity **8** + t7 37 · t8 29 · t9 14 ·
t11 40 · t12 23 · t13 40 · t14 33 · t15 11 · t16 24 · t17 63 · **t18 47**. Plus **16** against the
built `index.html`.

**Parity is 8/8 in its strict form** — the mechanical proof that exporting the engine did not change
it.

### What t18 does NOT yet cover

Named rather than implied. The scope listed ten case groups and this release ships four of them, the
core: federal ordinary tax, the age-65 deduction, SS taxability, and the A/B agreement invariant.
**Not yet covered: LTCG stacking, NIIT, AMT, FICA, state tax, and the survivor filing transition.**
Engine B computes all six and each is now reachable — they were left out because verifying their
independent references properly did not fit this release, and thin coverage asserted from unverified
figures would be worse than none.

### What did NOT change

**`otherAccounts` remains the open HIGH finding** (D-2D-3): the same account treated as fully taxable
by the Withdrawal engine and invisible to Engines A, B, C and the Roth ladder — $147,000 on the
example household, 8.9% of net worth. It was held until Engine B was dollar-exact, which it now is.

**Engine A still bypasses the shared helpers.** Consolidating it is a real cleanup and is not scoped;
the agreement invariant makes it safe to defer.

**Provenance:** source `src/DangerClose.jsx` md5 `0c3cf58994326a5eda39f7ec46957f51` · built
`index.html` md5 `e3e2e380f68e6deabae6ed03371f2c09`.

## v5.20

**A real correction to a number on screen.** The Roth conversion ladder was subtracting the base
standard deduction and nothing else — omitting the §63(f) age-65 additional standard deduction that
both tax engines apply. It overstated the tax on every conversion made at 65 or older.

On the shipped example household this is **$5,300 of overstated federal tax across the 2029–2040
ladder**; for a single filer, $5,300 across 2029–2038.

### The defect

`projectBrackets(year)` computed `stdDed: Math.round(std * inflator)` from the base figure alone.
There are exactly two calls to `seniorExtraFor` in the application — one in Engine A
(`runRothStrategies`), one in Engine B (`computeTaxPlan`) — and neither was in the ladder.

**It was a same-screen contradiction.** The strategy comparator sits directly below the ladder on the
Roth tab and calls Engine A, which applies the extra. Same household, same screen, two different
standard deductions. That is the shape of finding C-2B-3, fixed at v5.15 — one tab, two tax pictures.

**Why it survived five releases.** The comment above the code discussed the *OBBBA $6,000 bonus*
senior deduction (2025–2028, phasing out over $150K MFJ MAGI), analysed it correctly, concluded "for
2029+: no senior deduction" — and never mentioned the permanent §63(f) extra at all. It read like a
considered decision about the omission while addressing a different provision. It also hardcoded one
household's birthday ("Spouse A turns 65 in 2028"), which was wrong on its own terms by v5.19.

### Direction — conservative, but biased

Omitting a deduction raises taxable income, so the ladder overstated conversion tax. Against the
house rule that an unavoidable assumption should make the plan look slightly worse, that is
conservative. **But this tab exists to answer "should I convert, and how much,"** and an overstated
conversion tax biases the answer toward not converting. Filing it under "conservative, therefore
harmless" would have been the wrong reading.

### The fix

`projectBrackets` now calls the same shared `seniorExtraFor` helper the engines use, with the same
age arithmetic and the same base year, and combines it the way Engine A does (`stdD + senior`) so the
ladder and the comparator cannot drift apart again. Per-spouse for MFJ: the example household gets
one extra from 2029 (spouse A turns 65) and two from 2031 (spouse B).

The displayed assumption line now reads the full deduction — "$32,200 (2026) + $1,650 per spouse age
65+" — rather than showing a figure that no longer matches the arithmetic beneath it.

### What is deliberately still NOT modelled

The **OBBBA $6,000 bonus** senior deduction stays out of the ladder, matching Engine A and its stated
reasoning: it expires before typical conversion windows, and modelling it would make the bracket-fill
solver circular, because the deduction depends on MAGI which depends on the conversion being solved
for. **Engine B does model it**, so the Roth and Taxes tabs differ for any ladder year at or before
2028. That divergence was silent; METHODOLOGY §7 now states it.

### Testing

**704 checks green** (701 + 3 net new). `t16` grows from 21 to 24 and now asserts, against IRS
Rev. Proc. 2025-32 figures typed into the test rather than read from the app:

- 2029 carries **exactly one** age-65 extra (spouse B is still 63) — the case a naive fix that adds
  the extra whenever a household is 65+ would fail
- 2031 carries **two**
- the 2029→2031 rise exceeds two years of indexation, separating "per spouse" from "once, then
  inflated"
- the single filer's deduction includes the single extra

**Negative-controlled: 5 of t16's 24 checks fail against v5.19.**

**One pre-existing check could not see this defect.** Case 2's tolerance was ±$3K while the single
age-65 extra is ~$2.2K — inside it. That check passed identically before and after the fix, proving
nothing about the deduction it named. Tolerance tightened to ±$1.5K. A comment beside it also
described the pre-v5.15 gap of ~$34K as "MFJ_STD + senior"; $34K is MFJ_STD indexed and nothing else,
and MFJ_STD plus two extras would be ~$38K. Corrected.

**Parity is 8/8 strict** and every other suite returns figures identical to v5.19 — t16 is the only
one that moved, which is the evidence that this touched the Roth tab's private arithmetic and nothing
else.

### A process failure worth recording

Partway through this build, `t16` in the session workspace was found to differ from the shipped and
knowledge copies: 29 `ck()` calls against 24, carrying assertions lifted from this release's own
scope document that had never been written. **This is the third recorded instance of unreviewed
"phantom" edits appearing in a session workspace.** The file was quarantined, reverted to the shipped
hash, and the changes re-applied deliberately with hand-verified expected values.

It is worth being precise about the danger. Those phantom assertions produced 19/7 against v5.19 and
25/1 against v5.20 — the exact profile of a working fix with one loose end. Nothing about the output
looked wrong. Only a hash comparison caught it.

**Provenance:** source `src/DangerClose.jsx` md5 `9b6780ddfe4e769457969b7c0324393e` · built
`index.html` md5 `90fda60518fc7df50108e203816c9b1e`.

## v5.19

**Nothing changed. That is the entire point, for the third time — and the last time it will be
needed for this class of problem.**

Engine B, the Taxes planner, moved out of the React component body to module level. All **701**
checks return the figure they did at v5.18, and cross-version engine parity is byte-identical in its
strict form. **If any number had moved, this release would be a bug.**

**With this, no engine in the app is computed inside the render.**

### Why bother

Engine B was the last one the test harness could not reach. Computed inline, its per-year rows had
no module-level binding, so the only way to observe them was the rendered DOM — where every figure
prints as `Math.round(x / 1000)`, capping verification at **±$500**.

That matters more here than anywhere else it has mattered: the Taxes tab produces the lifetime tax
estimate, and it is the engine the Roth conversion decision leans on. Sub-phase 2A recorded the
ceiling explicitly in an amendment on 2026-08-08. It has been the open item ever since.

### What moved

- **`computeTaxPlan({ retireYear, rothAmount, qcdAnnual, taxYield })`** — the 286-line compute block,
  lifted verbatim to module level beside `computeIrmaaPlan`. Those four arguments were its only
  dependencies on component state — **the same four Engine C takes**, which is the clearest evidence
  that these two tabs were always the same shape of problem. The 15 other things it reads were
  already module-level and are still read at call time. It writes nothing outside itself, calls no
  React hook, sets no state.

The JSX destructures 28 values from one call and is otherwise untouched. Two things deliberately
stayed behind in the render: `_selYr` and `sel`, which pick *which* row the detail panel shows from
the `taxDetailYear` UI state. That is presentation, not modelling.

The arithmetic was not edited. The move was scripted: every anchor asserted before anything was
written, the block dedented by exactly eight spaces, and the result proven by comparing the
relocated lines to the originals with whitespace stripped — 286 lines each side, identical.

### The 28 returned values are flat, deliberately

A 28-name destructure is unwieldy and honestly signals that this block does more than one job.
Grouping it into `{ rows, totals, meta }` reads better and is recorded as the intended direction —
but it would require editing the render, and "the render is untouched" is the property that makes a
no-behaviour-change refactor checkable by inspection at all. Flat now, grouped in a later pass where
the diff is small and readable.

### Hoisted is not yet dollar-exact

`computeTaxPlan` is **not** in `shim.txt` yet, so Engine B is still *measured* at ±$500. Exporting it
and writing the exact-figure assertions is the next release — the same one-release gap Engine C had
between v5.17 and v5.18, and separate for the same reason: a refactor that ships new assertions is
one whose safety you can no longer check, because you can no longer tell whether green means the
code is unchanged or means the new tests were written to match whatever it now does.

### A stale claim caught in this release's own headers

`t14`'s header, added at v5.18, said "Engine B (Taxes) IS still inline and still ±$500." True when
written, false three weeks later. Corrected here. Worth noting because it is the fourth time this
project has recorded a comment that described a fixed state: comments have no guard rail, and a line
that names *another* component's status ages fastest of all.

### Testing

**701 checks green**, every figure identical to v5.18: baseline **382** (t1 64 · t2 15 · t3 36 ·
t4 90 · t5 44 · t6 18 · t10 115) + engine parity **8** + t7 37 · t8 29 · t9 14 · t11 40 · t12 23 ·
t13 40 · t14 33 · t15 11 · t16 21 · t17 63. Plus **16** against the built `index.html`.

**Parity is 8/8 in its strict form** — no intended-difference entry was needed.

Verified *before* the version bump, against a build still carrying the v5.18 version strings, so
"did a figure move?" was answered separately from "was the version bumped?" In that state t7, t8,
t11, t12, t13, t14, t16 and t17 all produced **byte-identical output**, and parity between pristine
v5.18 and the hoisted build was 8/8.

No new tests ship with this release, and that is correct.

### What deliberately did NOT change

**The Roth ladder's standard deduction still omits the age-65 extra.** Probably a defect, still
unverified, now carried for five releases.

**`otherAccounts` remains the open HIGH finding** (D-2D-3): the same account is treated as fully
taxable by the Withdrawal engine and is invisible to Engines A, B, C and the Roth ladder. On the
example household that is $147,000 — 8.9% of net worth — including $90,000 named as traditional IRA
money that produces no RMD anywhere. Non-conservative in both directions, and undisclosed. Scoped,
with decisions outstanding.

**Provenance:** source `src/DangerClose.jsx` md5 `3f152d70aa713fc4cd5891bb777ad742` · built
`index.html` md5 `9f6af63040f92dfcf7ea78efaab4d316`.

## v5.18

**Engine C is now checked to the cent.** The IRMAA planner, hoisted to module level at v5.17, is
exported to the test harness and asserted against CMS figures by a new suite. Every pre-existing
check returns the figure it did at v5.16 and v5.17, and cross-version engine parity is 8/8 strict.
**The app's arithmetic did not change** — the only source edit in this release is the version string.

### What this closes

v5.17 moved the engine somewhere testable. This collects the debt.

Until now the only way to observe Engine C was the rendered DOM, where every figure is printed as
`Math.round(x / 1000)` — a **±$500** ceiling on MAGI and **±$50** on the surcharge. That is wider
than the thing being measured: an IRMAA threshold is a **cliff**, where one dollar of MAGI costs a
four-figure sum for the whole year. On the example household the engine computes a 2039 MAGI of
$159,598.05 where the DOM showed "$160K" — $402 of error nothing could see.

**`t17_engineC_exact.mjs` — 63 checks.** Tier borders at ±$1 on all five boundaries in both filing
statuses (20 checks — the cliff, testable for the first time), the premium-year indexation rule, the
statutory top-tier freeze, the 2-year lookback, the per-person surcharge count, the survivor filing
switch, and QCD exclusion. Thresholds are typed from the CMS figures published 2025-11-14, not read
from the app.

**It was negative-controlled.** Reintroducing finding F-2B-1 — indexing thresholds to the income
year instead of the premium year, the defect fixed at v5.14 — fails **23 of its 63 checks**. A suite
that has never been shown to fail is a suite that has never been shown to work.

### The surcharge constants: a bounded approximation, not a defect

`IRMAA_CONSTS.SUR` is rounded to the nearest $10, and the source has said so on the line above it
since long before this release: *"SUR = approximate annual Part B + Part D surcharge per person."*
The Phase 2B audit derived the per-tier deltas (≤$5) and closed them as a **disclosed rounding**.

So `t17` does **not** assert CMS-exact surcharges, and does **not** pin the rounding as a defect —
either would assert that correct, documented behaviour is wrong. Instead it adds the guard that was
missing: every tier's constant must sit **within $5 of the CMS-exact figure**, computed from the
published monthly Part B and Part D amounts. That is derived from the primary source rather than
from the app, it documents the approximation as a *bounded* one, and it fails loudly if a constant
drifts or a future CMS update is transcribed wrongly.

**This is a correction to an earlier claim in this project's own working notes**, which described
the rounding as an undisclosed finding. It was disclosed, in the source and in the audit record. The
scope document carries the correction and the reason: "undisclosed" is a claim about *everywhere*,
and it had been checked in two places.

### METHODOLOGY

§8 said "2026 tiers per CMS" without qualification, which claimed more precision than the constants
carry. It now states that the thresholds are exact, the surcharges are rounded to the nearest $10
and within $5/person/year of CMS, and that `t17` asserts that bound. No in-app text changed — the
tab footnote already says the figures are approximate, and a $4.80/yr caveat on screen would cost
more attention than it is worth.

### A test that had stopped testing anything

`t15` resolved its build from a hardcoded version tag, defaulting to `v514`. That leg stopped being
built two releases ago, so running it without an explicit tag died with `ERR_MODULE_NOT_FOUND`.

The obvious fix is a trap: bump the default to the current tag and it will keep resolving *last*
release's bundle next time, pass green, and quietly stop testing the build it guards. It now
defaults to `app_testable.mjs` — the current leg's bundle, copied during setup — which is how `t7`
and `t8` have always resolved theirs and cannot go stale. An explicit tag still drives a frozen leg.
`t17` follows the same convention. Every other tag-driven suite also carries a retired default, but
those are unreachable dead code because `run_all.sh` always passes the tag.

### Testing

**701 checks green** — 638 of them returning figures identical to v5.17: baseline **382** (t1 64 ·
t2 15 · t3 36 · t4 90 · t5 44 · t6 18 · t10 115) + engine parity **8** + t7 37 · t8 29 · t9 14 ·
t11 40 · t12 23 · t13 40 · t14 33 · t15 11 · t16 21 · **t17 63**. Plus **16** against the built
`index.html`.

**Parity is 8/8 in its strict form** — no intended-difference entry, which is the mechanical proof
that exporting the engine did not change it.

### What did NOT change

**Engine B (Taxes) is still computed inline and still verifiable only to ±$500.** Hoisting it the
same way is scoped and not started. `t13` and `t14` still read Engine C through the DOM and still
say so in their headers — they are kept deliberately: `t17` checks the arithmetic, `t13` remains the
survivor extinction invariant and the only thing proving the tab renders those numbers to a user.

**The Roth ladder's standard deduction still omits the age-65 extra.** Still open, still unverified.

**Provenance:** source `src/DangerClose.jsx` md5 `45376b843608916cea9a8021153e1bca` · built
`index.html` md5 `eb0b7f4ce170525d89b881dd83e5ff9b`.

## v5.17

**Nothing changed. That is again the entire point.**

The IRMAA engine moved out of the React component body and became a module-level function. Every
one of the **638** checks returns the same figure it did at v5.16, and cross-version engine parity
is byte-identical in its strict form. **If any number had moved, this release would be a bug.**

### Why bother

v5.16 started consolidating duplicated tax facts. This continues the same work from the other
direction: not "the same fact written in many places," but "an engine written where nothing can
test it."

Engines B (Taxes) and C (IRMAA) were computed *inline*, inside the component's render. Their
per-year rows therefore had no module-level binding, and the test harness — which reaches the app
by exporting module-level names — could not touch them. Their only observable output was the
rendered DOM, where every figure is printed as `Math.round(x / 1000)`. That capped verification of
both engines at **±$500 of MAGI and ±$50 of surcharge**, which is wider than several of the effects
the suite is trying to hold in place. Engine A, which has always been module-level, is checked to
the dollar.

An earlier plan proposed lifting that ceiling by splicing a test-only rows hook into the copy of
the source the harness builds. That approach is dropped. Hoisting the engine needs no fragile
anchor into a moving source file, and it makes Engine C reachable the same way Engine A already is.

### What moved

- **`computeIrmaaPlan({ retireYear, rothAmount, qcdAnnual, taxYield })`** — the 135-line compute
  block, lifted verbatim to module level and given the four arguments that were its only
  dependencies on component state. Everything else it reads was already module-level and is read at
  call time, exactly as before. It writes nothing outside itself, calls no React hook, and sets no
  state. The JSX below it now destructures eight values from one call and is otherwise untouched.

The engine's arithmetic was not edited. The move was performed by a script that verified every
anchor before writing, dedented the block by exactly eight spaces, and then proved the result by
comparing the moved lines to the originals with whitespace stripped.

**This does not yet make Engine C dollar-exact — it makes it dollar-exact *able*.** Exporting
`computeIrmaaPlan` through the test shim and writing the exact-figure assertions is deliberately a
separate release, for the same reason no tests are added here.

### One comment corrected

A comment inside the engine still said it "pays BOTH SS benefits and does not switch filing at
death." That was true at v5.11. All three claims in it were fixed at v5.13, so for four releases the
comment described a defect that was no longer there — the same stale-header failure recorded against
finding C-2C-4. It is comment-only; no code near it changed.

### A count correction

**The suite has 638 checks, not 634.** The headline figure in the v5.15 and v5.16 entries was wrong.
The per-suite numbers in both entries were right, and their own breakdowns sum to 638; the error was
a sub-total in `TESTING.md`, which added the nine feature suites to **244** where they sum to **248**.
That understatement then propagated into two release headlines. No test was missing and no check
changed — only the arithmetic reporting them. `TESTING.md` is corrected in this release.

This is the third recorded instance of a hand-computed total in project documentation being wrong,
which is why the counts below are parsed from suite output.

### What deliberately did NOT change

**The Roth ladder's standard deduction still omits the age-65 extra entirely.** It is very likely a
defect and it is noted for a future release. Fixing it here would have destroyed this release's only
safety property — that nothing moved.

**Engine B (Taxes) is still inline, and still ±$500.** Only Engine C was hoisted. Doing both in one
pass would have doubled the surface of a change whose entire correctness argument is that the output
is unchanged.

### Testing

**638 checks green**, every figure identical to v5.16: baseline **382** (t1 64 · t2 15 · t3 36 ·
t4 90 · t5 44 · t6 18 · t10 115) + engine parity **8** + t7 37 · t8 29 · t9 14 · t11 40 · t12 23 ·
t13 40 · t14 33 · t15 11 · t16 21. Plus **16** against the built `index.html`.

**Parity is 8/8 in its strict form** — no intended-difference entry was needed.

The refactor was additionally verified *before* the version bump, against a build carrying the
v5.16 version strings, so that "did a figure move?" was answered separately from "was the version
bumped?" In that state t7, t8, t11, t12, t13, t14 and t16 produced **byte-identical output** to
v5.16, and parity between pristine v5.16 and the hoisted build was 8/8.

No new tests ship with this release, and that is correct: a refactor that adds assertions is a
refactor whose safety you cannot check.

**Known harness wart, not fixed here:** `t15` defaults to the version tag `v514` and fails outright
if run without an explicit tag. It is the version-tag trap the release checklist already warns
about, and it will need the same one-line treatment every release until it is changed. It was left
alone because editing the suite during a refactor weakens the proof the refactor depends on.

**Provenance:** source `src/DangerClose.jsx` md5 `b466b02f3a10d1993a6e345f8070d8b3` · built
`index.html` md5 `1f580be324d4c2dc0557d56c0c8b743b`.

## v5.16

**Nothing changed. That is the entire point of this release.**

A refactor with no behaviour change: federal tax facts now live in one place instead of being written
out again at every site that needs them. Every one of the 634 checks returns the same figure it did at
v5.15, and cross-version engine parity is byte-identical in its strict form. **If any number had
moved, this release would be a bug.**

### Why bother

Four of the last six defects were the same shape. The IRMAA threshold arithmetic was copied into five
places and two of the copies drifted — one to a different inflation rate entirely (C-2B-3), one
missing a statutory freeze (F-2B-2). The taxable-balance residual is copied five times. The rule that
a survivor keeps the larger Social Security check had to be written into six engines independently,
and one of them was missed for two releases (C-2C-6).

The pattern is not carelessness. It is that **the same fact is written down in many places**, so
correcting one copy leaves the others behind, and an audit has to check every copy to be sure.

### What moved into one place

- **`taxFactsFor(filingSingle)`** — the eight filing-status-dependent federal facts: brackets, standard
  deduction, LTCG brackets, NIIT threshold, both AMT figures, both Social Security provisional-income
  thresholds. Frozen, so a caller cannot mutate shared facts. **16 call sites** across four tax
  engines now read from it.
- **`seniorExtraFor(...)`** — the age-65 additional standard deduction. Engines A and B each carried a
  verbatim copy, differing only in what their local inflator was *named* (`infl` vs `inflate`; both
  `base × 1.02^(yr − asOfYr)`).
- **`inflateTaxConst(...)`** — that inflator, once.

### What deliberately did NOT move into it

**Which facts get inflated.** NIIT and the Social Security provisional thresholds are statutory and
**not** indexed (IRC §1411, §86); brackets, deductions and AMT figures **are**. Folding inflation into
the accessor would have buried that distinction — and it is precisely the distinction finding F-2B-2
turned on, where the top IRMAA tier was inflated despite being frozen by statute. Callers still
inflate what they should.

**The Roth ladder's standard deduction.** It computes a deduction with no age-65 extra at all. That may
well be a defect, but "fixing" it here would have destroyed this release's only safety property — that
nothing changed. It is left exactly as it was and is noted for a future look.

### Testing

**634 checks green**, every figure identical to v5.15: baseline **382** (t1 64 · t2 15 · t3 36 · t4 90
· t5 44 · t6 18 · t10 115) + engine parity **8** + t7 37 · t8 29 · t9 14 · t11 40 · t12 23 · t13 40 ·
t14 33 · t15 11 · t16 21. Plus **16** against the built `index.html`.

**Parity is 8/8 in its strict form** — no intended-difference entry was needed, which is the mechanical
proof that no engine's output moved.

No new tests ship with this release, and that is correct: a refactor that adds assertions is a refactor
whose safety you cannot check, because you can no longer tell whether the suite passing means the code
is unchanged or means the new tests were written to match whatever it now does.

**Provenance:** source `src/DangerClose.jsx` md5 `f78c128b5620f12313057c98e76f253b` · built
`index.html` md5 `45e18d1632775955259a01d8c06d0ba0`.

## v5.15

**The Roth tab was showing single filers married tax figures. This release corrects that, and their
projected tax goes UP.**

Read that direction first, because v5.14 moved the other way. Every defect fixed here was
understating what a single filer owes.

### The Roth ladder ran its own tax engine, and it assumed you were married

The conversion-ladder table on the Roth tab carries tax arithmetic separate from every engine in the
rest of the app. It hardcoded the **married** standard deduction, the **married** brackets, the
**married** Social Security provisional thresholds, and the **married** IRMAA cliff — with no
single-filer branch anywhere in the block. It rendered for single filers regardless.

The result compounded: roughly half the correct deduction was subtracted, and the remainder was then
taxed at brackets twice as wide.

**Measured on the example household forced to single, 2029 row:**

| | v5.14 | v5.15 |
|---|---|---|
| Taxable income | $61K | **$78K** |
| Marginal rate | 12% | **22%** |
| Federal tax | $6.7K | **$11.5K** |

That is a **72% increase**, and it is the correct figure. The finding that opened this work estimated
"~40% understated" from hand arithmetic on rounded display values and labelled it indicative; the
executed number is larger. **Couples see no change at all** — the married household's ladder is
identical before and after, which is what proves the fix touched only the branch it was meant to.

### And the cliff it warned you about was wrong for everyone

The same block inflated its IRMAA threshold at **3%/yr**, where the entire rest of the app uses 2%.
The tab's own assumptions box told the reader "thresholds indexed ~2%/yr" while two lines of its
arithmetic did something else. An overstated cliff means the tab **under-warns** about crossings that
will actually happen — by 21.5% at 2046 and 34% at 2056, compounding.

Both errors ran the same direction: *convert more than you should*.

### Three loose literals, and why they mattered

The Social Security provisional thresholds were hardcoded as bare `32000` and `44000` — the married
figures — bypassing the shared `TAX_CONSTS` block entirely. The Verify tab asserts those constants
and stays green, because it checks the constants, not which constant an engine reaches for. That is
the third time this pattern has produced a defect, and every threshold in this block now comes from
the shared blocks.

### Survivor years

The ladder now switches to Single brackets, deduction and IRMAA thresholds the year **after** the
first projected death (IRS Pub. 501), matching the Taxes tab, the IRMAA planner and the Roth strategy
engine. The tab's whole argument is *convert while you still file jointly* — it can now show the year
that stops being true, and names it in the assumptions box.

### What this release deliberately did NOT do

The strategy comparator directly below the ladder, on the same screen, builds proper inputs and calls
the shared Roth engine — it was correct throughout. So the tab has been showing two different tax
pictures for the same household, and this release makes them agree by fixing the wrong one rather
than by deleting it. **Routing the ladder through the shared engine entirely** is the right end state
and is recorded as the intended direction; doing it here would have turned a correctness fix into a
642-line rewrite. It is scoped as its own task.

### Engines unchanged, proven

Cross-version parity (v5.14 → v5.15) is **8/8 in its strict form** — no intended-difference entry was
needed, which is the mechanical proof this fix stayed inside the Roth tab's own block and never
reached the shared engines.

### Testing

**634 checks green** against this source, run from a clean tree: v5.15 baseline **382** (t1 64 · t2 15
· t3 36 · t4 90 · t5 44 · t6 18 · t10 115) + engine parity **8** + t7 37 · t8 29 · t9 14 · t11 40 ·
t12 23 · t13 40 · t14 33 · t15 11 · **t16 21**. The built `index.html` is separately exercised by
`qa/smoke_built.mjs` — **16 checks**.

**`t16` is new.** It asserts the single filer's deduction, bracket and tax against an **independent**
hand computation from IRS Rev. Proc. 2025-32 rather than against the app's own tables, checks that
the couple's ladder does not move, and pins the survivor switch. Negative-controlled against v5.14,
where it fails **9** of 21.

One test was rewritten during the build and the reason is recorded in the file: its first version
computed an expected IRMAA threshold from constants and compared it to itself — a tautology that
passed on both builds. A test that never touches the app cannot fail for the right reason. It is now
a source assertion that fails four ways against v5.14.

### A census correction worth recording

The scope listed ten sites to change. There were **thirteen**. The Social Security threshold was
three lines rather than one, and the two loose literals were not visible in the original census at
all. That is the third consecutive release where verifying a site census before writing code found
more than the document listed — which is why the step exists.

**Provenance:** source `src/DangerClose.jsx` md5 `f915dd8c71142bcf16aeb00a6d56c403` · built
`index.html` md5 `2e9a51e3bd6c955c5a18240c143a4c98`.

## v5.14

**Two corrections to the Roth strategy engine, and one to the IRMAA planner. This release makes plans
look slightly BETTER — read that first.**

Every correction since v5.11 has moved figures in the pessimistic direction. This one moves them the
other way, because all three defects it fixes were over-charging. That is the correct outcome, not a
softening of the model, but it deserves to be said at the top rather than discovered in a table.

### 1. IRMAA thresholds were indexed to the wrong year (finding F-2B-1)

Medicare sets your surcharge by applying **this year's** income brackets to the tax return from **two
years ago**. The lookback shifts the *income*, not the *table*. Both engines shifted both — so every
tier boundary sat two years of inflation too low (~3.9%), and households were pushed into a surcharge
tier sooner than the law does.

Worked example: at premium year 2046 the first Single boundary was modeled at **$155,679**; the law
puts it at **$161,968**. A household with $158,000 of MAGI owed **$0** and was charged **$1,150**.

### 2. The top tier is frozen by statute, and wasn't (finding F-2B-2)

BBA-2018 §53114 created the $500,000 / $750,000 tier, **froze it through 2027**, and indexes it by
CPI-U only **from 2028**. The engines inflated it every year like the others. The Verify tab has
labelled this constant "top tier fixed by law" since v5.7 — a claim the arithmetic quietly
contradicted. It is now **asserted** on that tab rather than merely printed.

**These two shipped together and that was mandatory, not tidy.** Fixing the indexation alone would
have pushed the top threshold a year *above* correct and flipped it from over-charging to
under-charging — introducing the very optimism the other fix removes.

### 3. The Roth comparator filed a survivor Single a year too early (finding C-2C-6)

v5.12 corrected the Taxes tab and v5.13 the IRMAA planner: under IRS Pub. 501 a surviving spouse is
treated as married for the **whole** year of death and may file jointly for it, with Single beginning
the year after. The Roth strategy comparator was the last engine still switching in the death year —
so for two releases the same household was filed two different ways in the same year depending on
which tab you opened. **This release created that divergence and this release closes it.**

Measured, dollar-exact: the death year was over-taxed by **$3,537** at a $100K pension, **$8,537** at
$150K, and **$15,467** at $300K.

Its IRMAA half did not share that direction, which is worth stating plainly. Filing Single both
narrows the thresholds (raising the tier) *and* halves the person count (lowering the charge). Below
about $500K of MAGI the first effect dominates and the death year was over-charged; above it the
second takes over and the death year was **under**-charged — by $5,780 at $700K and $6,940 at $1.2M.
The suite now pins that corner specifically.

### One place, not five

All three fixes route through a **single shared threshold helper**. The arithmetic had been copied
into four separate loops across two engines, which is how these defects survived three releases —
two of the four sites were not even in the fix's original site census and were found by verifying it
before writing code. A fifth copy has drifted to a **3%/yr** inflator instead of 2% and hardcodes the
married threshold; that is a different defect in a different engine, recorded as **finding C-2B-3**
and deliberately **not** fixed here, because folding an optimistic correction in with three
pessimistic ones would make the net effect on any household unreadable.

### Engines: one changed on purpose, three proven unchanged

Cross-version parity (v5.13 → v5.14, common seeded random numbers, identical inputs) is **8/8** — but
its meaning changed this release. The Roth strategy engine is one of the four engines the guardrail
watches, and this release **corrects it deliberately**, so its two legs are now asserted to *differ*
rather than to match. The Monte Carlo, extended MC and stress legs remain byte-identical. Asserting
the intended change is a stronger statement than skipping it: if a later edit silently reverted these
fixes, the guardrail would fail.

### Testing

**617 checks green** against this source, run from a clean tree: v5.14 baseline **382** (t1 64 · t2 15
· t3 36 · t4 90 · t5 44 · t6 18 · **t10 115**) + engine parity **8** + t7 37 · t8 29 · t9 14 · t11 40 ·
t12 23 · t13 40 · **t14 33** · **t15 11**. The built `index.html` is separately exercised by
`qa/smoke_built.mjs` — **16 checks**, including the `window.storage` round-trip.

**`t10` is adopted into the routine run.** Written during the v5.10.2 audit and held since for "the
next release with an independent reason to exist," it carried two dated `[KNOWN DEFECT]` pins
asserting the wrong-but-real indexation behaviour. Those pins are now **flipped** to the CMS-correct
answers — written from primary source before the fix existed, so they cannot have been
reverse-engineered from it. Its 30 tier-border cases were **re-derived**: they had compared income
against the 2026 base thresholds, which was only valid because the old engine indexed to the MAGI
year. Ten correctly failed on the first run after the fix. Negative-controlled against v5.13, where
t10 fails **23** assertions.

**`t15` is new** — the extinction invariant for C-2C-6, and the first survivor suite that is
**dollar-exact**. The Roth engine is module-level, so it can be driven directly instead of read
through rendered figures rounded to the nearest $1,000. Negative-controlled against v5.13, where it
fails **8** of 11; the three that pass there are named in the file as not discriminating rather than
counted as wins.

**`t14` was strengthened, because it had a hole this release exposed.** It shipped at v5.13 asserting
the Social Security survivor rule across four engines — and it did not catch C-2C-6, because Engine A
carried the SS rule correctly while filing a year early. It now also asserts that every engine with a
filing concept keeps the death event (`>=`) and the filing switch (`>`) as two distinct flags.
Against v5.13 that new assertion fails on exactly one engine: the one that was wrong.

**`t13`'s test household was re-tuned**, and the reason is recorded in the file. Re-indexing lifted
every boundary, and its survivor household's final year slipped just under the risen Single cliff —
$193K of income against a $193.6K threshold. The engine was right; the fixture had lost its margin.
The indexation scope had predicted this re-verification would *probably* pass, and said so as
"expect, not know." It did not, which is why it was written that way.

### Still open, and disclosed rather than implied fixed

**Finding C-2B-3** — the Roth ladder table's 3%/yr IRMAA inflator and hardcoded married threshold.
Non-conservative: it overstates the cliff by 21.5% by 2046 and 34% by 2056, so the tab under-warns
about crossings that will actually happen. Scoped for its own release.

**Provenance:** source `src/DangerClose.jsx` md5 `452626b89c509e44d0a1ccf4ec33cda2` · built
`index.html` md5 `c94449e0ac8e18e6d05a22591b88a2c7`.

## v5.13

**The IRMAA planner now models the first death. Three corrections that had to ship together.**

The Withdrawal and Taxes tabs learned to model a surviving spouse at v5.12. The IRMAA planner did
not, and it turned out to have not one omission but three — found by reading the surcharge line
closely while designing the fix for the other two.

### The three omissions, and why none could ship alone

| Omission | Effect on the surcharge | Direction |
|---|---|---|
| Both Social Security checks paid for the full horizon | MAGI overstated by the smaller check | conservative |
| Married thresholds retained for a survivor | tier boundary too high by $109,000 at tier 1 | **non-conservative** |
| The deceased spouse still counted per person | surcharge multiplied by two instead of one | conservative |

They do not share a direction, and the threshold one is roughly **eight times** the size of the
Social Security one, so the net effect was to **understate** what a survivor pays — the wrong
direction for a tool whose whole identity is pessimism.

**Fixing the thresholds on their own would have been worse than the defect.** It would have moved
survivors into higher tiers while still charging both of them, roughly doubling the surcharge. The
new tests pin all three together so a future change cannot restore one without the others.

### What changed, and which year each part takes effect

These are not all keyed to the same year, which is the subtle part:

- **The survivor keeps only the larger Social Security check** — from the year of death, matching
  the Taxes tab.
- **The survivor is scored against the Single thresholds** — from the year *after* the death. IRMAA
  is assessed against the return it is scoring, and IRS Pub. 501 permits a joint return for the year
  of death itself. The Taxes tab was corrected to the same rule at v5.12, so the two tabs now agree.
- **The surcharge is charged for one person, not two** — and this one follows the **premium** year
  rather than the income year, because IRMAA is billed two years in arrears and the bill is paid by
  whoever is alive to pay it. A row whose "Affects" year falls after the death charges one person
  even though both spouses were alive in the income year.

That last point looks like an inconsistency in the table if it is not explained, so it is explained:
survivor rows carry a `· single` marker in the tier column, and a line beneath the table sets out
both rules. The tier reference table above still shows the household's current status and says so.

### What this changes on screen

Nothing at all for the example household, and that is worth being blunt about. Its survivor income
(~$96K) never approaches even the Single threshold (~$156K by 2044), so its surcharge is $0 before
and after. **The defect only bites for households whose survivor income lands between the Single
and married thresholds — a band $109,000 wide at the first tier.** Inside that band the change is
large: on the test household built for it, a survivor who previously showed no surcharge at all now
shows $1,150/yr from the year after the death.

### Engines unchanged, proven

Cross-version engine parity (v5.12 → v5.13, common seeded random numbers, identical inputs) is
byte-identical at **8/8**. The IRMAA planner is computed inside the component body; the Monte Carlo,
extended MC, stress, and Roth engines were not touched.

### Testing

**482 checks green** against this source, run from a clean tree: v5.13 baseline **267** (t1 64 ·
t2 15 · t3 36 · t4 90 · t5 44 · t6 18) + engine parity **8** + t7 37 · t8 29 · t9 14 · t11 40 ·
t12 23 · **t13 40** · **t14 24**. The built `index.html` is separately exercised by `qa/smoke_built.mjs` — **16 checks**, including the `window.storage` round-trip that a wrong bootstrap would fail.

**t13** is new — the extinction invariant for the IRMAA planner. The example household cannot
demonstrate this defect at all, so every case runs a purpose-built household whose survivor income
lands inside the band where it lives. It asserts all three omissions, in both directions (either
spouse dying first), and includes a case that isolates the person count on its own by holding the
tier constant across the fix. Negative-controlled against v5.12, where it fails **14** assertions.
The six substantive assertions that *pass* pre-fix are listed in the file as not discriminating,
rather than counted as wins.

**t14** is new — the cross-engine invariant (audit decision D-5). Three separate findings over two
releases were all the same failure: one engine not modelling a death the others did. t14 asserts
that all four engines carry the survivor rule and that those exposing a figure move it in the same
year. Building it surfaced a real divergence, recorded rather than smoothed over: the Taxes and
IRMAA engines hold Social Security flat in today's dollars while the Withdrawal engine COLA-indexes
it, so they agree on the rule and the timing but not on a single dollar figure. Negative-controlled
against v5.12, where it fails **4** assertions — all of them Engine C. The other 20 pass because
Engines A, B and D were already correct, which is exactly what a class-level guard should look like.

### Honest limitations added

Social Security's **life-changing-event redetermination** — a survivor asking SSA to reassess IRMAA
on current income instead of the two-year-old joint return — is not modeled. A household that files
one may pay less than projected, so the omission runs conservative. It is now stated in METHODOLOGY
rather than left silent.

**Provenance:** source `src/DangerClose.jsx` md5 `0ed9e140cd9163e4523d8ff71959d56c` · built `index.html` md5 `364fa4dcab05243b3c65b44a8b452d7e`.

## v5.12

**Survivor modeling in the Withdrawal and Taxes tabs. A visible-numbers release for any couple.**

Two corrections, both from the standing audit's Phase 2C, both changing figures users will see.

### The Withdrawal tab never modeled the first death (finding C-2C-4)

Its projection horizon runs to the **second** death, so it spent years modeling a surviving spouse — and for all of those years it paid **both** Social Security checks and applied the **full joint spending level**. Neither is right, and the two errors ran in opposite directions:

- Paying both checks **understated** the draw need — non-conservative.
- Skipping the survivor spending reduction **overstated** it — conservative.

They partially cancelled, which is exactly why the tab looked plausible for so long. On the example household the spending error was the larger of the two, so the tab was reading **pessimistic** — the opposite of what the original finding concluded from the Social Security half alone. That correction is recorded in the finding document rather than quietly dropped.

**Both are fixed together, and that pairing is deliberate.** Correcting the Social Security half on its own would have removed the conservative counterweight and left the tab optimistic — strictly worse than the defect it replaced. The new test suite pins them together so a future change cannot restore one without the other.

The survivor now keeps only the larger of the two benefits, and survivor-year spending uses the same `SURVIVOR_SPEND_FACTOR` (75%) the Survivor tab, Monte Carlo, and What-Breaks have always used. On the example household, at the first death: guaranteed income $85K → $64K, expenses $141K → $108K, draw need $55K → $44K. Under v5.11 all three *rose* straight through the death.

### The Taxes tab filed Single a year too early (finding C-2C-1)

v5.11 disclosed this as a simplification: the model filed Single for the **whole** year of death, where IRS Pub. 501 treats the survivor as married for that entire year and generally permits a joint return, with Single beginning the year after. That disclosure is now **retired, because the behavior is corrected** rather than merely explained.

The fix required separating two things that had been one flag. The **death event** — the survivor dropping to one Social Security check, and the decedent's IRA rolling over — still takes effect in the year of death. **Filing status** now moves a year later. Getting this wrong in the other direction would have delayed the IRA rollover by a year and changed every RMD from the death year onward, so the suite now pins the rollover to the death year explicitly.

The death year is still flagged as a survivor year in the schedule; it simply reads "MFJ (survivor)" rather than "Single (survivor)". Expect the death year's tax to fall and the following year's to rise.

**A simplification remains, and is now stated in its place:** Social Security drops to a single check for the whole year of death, where the deceased's benefit actually runs through the month of death. That overstates the loss slightly — the conservative direction.

### Engines unchanged, proven

Cross-version engine parity (v5.11 → v5.12, common seeded random numbers, identical inputs) is byte-identical at **8/8**. Both engines changed here are computed inside the component body; the Monte Carlo, extended MC, stress, and Roth engines were not touched.

### Testing

**418 checks green** against this source, run from a clean clone: v5.12 baseline **267** (t1 64 · t2 15 · t3 36 · t4 90 · t5 44 · t6 18) + engine parity **8** + t7 37 · t8 29 · t9 14 · **t11 40** · **t12 23**.

**t12** is new — the extinction invariant for the Withdrawal tab. It asserts both movements (income drop *and* spending drop) in **both** direction configurations, verifies the drop is specifically the 0.75 factor rather than an arbitrary reduction, and checks that nothing changes while both spouses are alive. Negative-controlled against v5.11, where it correctly fails **eight** assertions — four per direction, so neither sign passes by luck.

**t11** grew 38 → 40: its death-year assertions were rewritten for the corrected filing rule, and one was added pinning the spousal rollover to the death year rather than to the filing switch.

**Stated limitation — verification precision.** Both engines are computed inside the component body, so the harness cannot reach their intermediate values; their only output path is a DOM that rounds to the nearest $1,000. These assertions are accurate to **±$500, not to the dollar** — adequate only because the movements measured (~$21K of Social Security, ~$33K of spending) are far larger than the band.

### Known limitation carried forward

**The IRMAA planner still does not model the first death.** It pays both Social Security benefits for the full horizon, never switches to Single thresholds, and continues charging a Medicare surcharge for the deceased spouse. Those three errors do not share a direction, and the threshold one dominates: retaining the married thresholds understates a survivor's surcharge by up to a full tier. It is **not** fixed here — it needs a restructure of the tier table plus a visible marker on affected rows, which is scoped separately and ships next. Households whose survivor income stays well below the Single threshold see no effect either way.

---

**Provenance.** Source `src/DangerClose.jsx` md5 `2ebfccb0ea9744c1015693badace4984` · built `index.html` md5 `b10d9efb7f12341810b901c29928c4e0`.

*This line is new as of v5.12. This project does not use git tags, and TESTING.md only ever carries the current build's hash — so from here on each entry records its own, making the CHANGELOG the durable record of what every version actually was. Earlier entries have no recorded md5; identify those sources by reading them out of the commit that shipped them.*

## v5.11

**Modeling-correction release — survivor RMDs on the Taxes and IRMAA tabs, and nothing else.** The Phase 2C standing audit found that the Taxes engine and the IRMAA engine each held a **single pooled Traditional balance and keyed its RMD to person A's age unconditionally**. Because that age keeps incrementing after person A has died, every post-death year computed required distributions on the **deceased** spouse's age rather than the survivor's — and, before either death, ran RMDs on the younger spouse's money starting at the *older* spouse's start age.

**Why this mattered more than a rounding difference.** The sign of the error depends on which spouse is younger, because the engines always used person A:

- **A older, A dies first** — the decedent's smaller divisor made the engines *overstate* the RMD, overstating tax. Conservative, and therefore invisible.
- **A younger, A dies first** — the decedent's larger divisor made the engines *understate* the RMD, understating taxable income, understating tax, and **overstating plan survival**. Non-conservative. That configuration needs nothing exotic: only that the first-listed spouse be the younger one and die first.

A deliberately pessimistic stress-tester producing an over-optimistic number contradicts the app's stated purpose, which is why this was fixed rather than disclosed. The divergence runs roughly **$4,050/yr per $1M of Traditional balance** at the ages tested.

**The fix.** Both engines now mirror the pattern the Roth engine has used since v5.8 and which METHODOLOGY already described: per-person Traditional balances seeded from the same shared constructor (which already returned the per-person split — the engines were discarding it), a **spousal rollover into the survivor at the first death**, and RMDs computed on **each spouse's own age and own SECURE 2.0 start age**. A pooled view is retained for the QCD cap, the conversion cap, and MAGI, so nothing downstream changed except through the corrected RMD. This also fixes the pre-death case, where a mixed-age couple's start ages differ (a 1959 vs 1960 birth splits 73 vs 75).

**Numbers users will see change.** This is a visible-numbers release for any household with an age gap: the Taxes tab's RMD, taxable income, and tax figures move, and because the IRMAA engine's RMD feeds MAGI, surcharge tiers can move with them. On the example household (first death 2044) the survivor-year RMD went from $47K to $44K with the older spouse listed first, and from $48K to $51K in the mirror configuration.

**Engines untouched, proven.** Cross-version engine parity (v5.10.2 -> v5.11, common seeded random numbers, identical inputs) is byte-identical at **8/8**. The Monte Carlo, extended MC, stress, and Roth engines were not modified; the Roth engine is the reference implementation this fix copies and was deliberately left alone.

**Disclosures bundled with this release (text only, no arithmetic change).** Two lower-severity audit findings that touch the same survivor machinery are now stated rather than left implicit: the **entire year of death files Single**, where the law allows the survivor to file jointly for that year (a simplification that over-taxes the death year — conservative, and it partially offset the RMD error described above, which is why both are described together); and the **Social Security survivor benefit is modeled as the larger of the two actual checks**, without the RIB-LIM floor (20 CFR 404.410(c)) that can raise a survivor's benefit to 82.5% of the deceased's PIA where the deceased claimed before full retirement age — so a survivor's income can be understated. Conservative.

**Testing.** The suite re-baselines per release: the active pair is now v5.10.2 (prior) -> v5.11 (current). Counts, computed from suite output: **v5.11 current leg 267** (t1 64 · t2 15 · t3 36 · t4 90 · t5 44 · t6 18) **+ engine parity 8 + t7 37 · t8 29 · t9 14 · t11 26 = 381 checks verifying this build.**

A new suite, **t11**, is the extinction invariant for this defect class. It asserts the survivor-year RMD in **both** direction configurations — A older and A younger — because a one-directional test would have passed against the defect in the other sign. It was run as a **negative control against the pre-fix v5.10.2 build and correctly failed its five discriminating assertions**, so it is known to have teeth rather than assumed to. t8 grew from 27 to 29: its two source invariants asserting the old pooled seed were updated to assert the per-person split explicitly, which is a strictly stronger check.

**Stated limitation — verification precision.** The Taxes and IRMAA engines are computed inside the app's component body, so the test harness (which reaches module-level bindings only) cannot read their intermediate values. Their sole output path is the rendered DOM, which prints every figure rounded to the nearest $1,000. **These assertions are therefore accurate to ±$500, not to the dollar** — adequate here only because the effect being measured is roughly eight times that band, and stated plainly rather than implied away. Making these two engines dollar-exact testable requires a new harness capability, which is scoped separately.

**Known limitation carried forward, undisclosed until now.** While implementing the rollover it became clear that the **IRMAA engine does not model the first death at all** beyond this RMD fix: it pays **both** Social Security benefits for the entire horizon, and it never switches filing status, so a surviving spouse continues to be scored against the married thresholds. Those two errors push in **opposite** directions — paying both checks overstates MAGI (conservative), while keeping the married thresholds is too generous (non-conservative) — so the net effect on a household's surcharge is **not known without executing it**, and this release does not claim a direction. It is an inconsistency with the Taxes and Roth engines, which both model the first death, and it is recorded here rather than left silent. It is not fixed in this release; a separate scope covers it alongside the related Withdrawal-tab finding.

**METHODOLOGY updated** (modeling changed): the per-spouse RMD and survivor-rollover section previously described the correct model as though it applied to every engine. It now states which engines implement it, and from which version.

## v5.10.2

**Defect-fix release — audit Finding B-2, and nothing else.** The Phase 1 standing code audit traced Clear All Data's wipe path and found that `clearStorage()` deleted only 10 of the 13 keys defined in `STORAGE_KEYS`. The three it missed were `checklist`, `simple`, and `ssCut` — and `checklist` is the serious one: it holds **third-party names and phone numbers** (the estate attorney, tax advisor/CPA, and insurance contacts entered on the Checklist tab) plus free-text notes that may name executors or family members. So after "Yes, delete everything," other people's contact details remained in browser storage — contrary to Docs §10/§11, and the same defect family as the v5.10.1 API-key fix (a Clear All Data promise the wipe list didn't keep), arguably more sensitive because it exposes people who never used the app.

**The fix:** `clearStorage()` now deletes all 13 keys. Simple Mode and the SS depletion scenario reset along with everything else — consistent with how the theme, UI scale, and ACA scenario already behaved (maintainer decision, 2026-08-07: a partial wipe list is precisely the condition that produced this defect and its predecessor, so no key is exempt). Not a regression: these three keys had never been in the wipe list in any release. The v5.10.1 fix correctly wired `clearStorage()` into the button; it did not change which keys the function deletes. Docs §11's Clear All Data entry now states explicitly that the wipe covers everything, including checklist notes and contacts, display preferences, and any saved API key.

**The extinction invariant (the real point of this release):** t5 now seeds **every** key in `STORAGE_KEYS` before the wipe and, after it, asserts absence by **looping the key map itself** rather than an enumerated list — so any key added in a future release is covered automatically, and a wipe list that drifts out of sync with the map fails loudly. The seeded checklist entry carries a recognizable third-party contact, and a dedicated check proves that content is gone from all surviving storage — the key's PII, not just the key. This converts the recurring defect class (wipe list ≠ key map, which produced both this finding and the v5.10.1 credential leak) into a permanent invariant.

**Also in this release (suite hardening, no app change):** t1 now asserts the version string at all four in-app sites exactly (the DATA LOAD header and app footer joined the two Field Manual sites already asserted — TESTING.md had claimed four; now the suite delivers four), and two harness files that had gone stale in project knowledge (t6's subprocess path fix and the v5.10.1 DOM entry) were re-synced from the committed repo, which remains their source of truth.

**Engines untouched, proven:** the complete v5.10.1 → v5.10.2 source diff is 14 lines — the three added deletes with comments, the four version-site strings, and one Docs §11 sentence. Cross-version engine parity (v5.10.1 → v5.10.2, common seeded random numbers, identical inputs) is byte-identical at **8/8**. No modeling change; METHODOLOGY unchanged.

**Testing.** The suite re-baselines per release: the active pair is now v5.10.1 (prior) → v5.10.2 (current), with v5.10 retiring from the pair (its history remains at its git tag). Counts, computed from suite output: **v5.10.2 current leg 267** (t1 64 · t2 15 · t3 36 · t4 90 · t5 44 · t6 18) **+ engine parity 8 + t7 37 · t8 27 · t9 14 = 353 checks verifying this build.** The frozen legs were re-proven green under the updated suites: v5.10.1 at 254 and v5.10 at 252. Frozen-leg counts rose from their published 248/246 because the suite itself grew: +2 in t1 (the two new version-site assertions run on every leg) and +4 in t5 (the all-keys pre-wipe seed check plus three dated [KNOWN DEFECT] pins recording the pre-fix B-2 state — checklist, simple, and ssCut surviving the wipe — kept as frozen history per the standing pin discipline; the current leg instead runs the 16-check loop invariant, +17 over the old t5). The current leg's t5 pins for the three v5.10.1 fixes remain positive assertions.

**Limitations carried forward unchanged:** the checklist (including its contacts and notes) still legitimately travels in exported backups — that is documented and wanted; the wipe covers browser storage, not files the user has exported.

## v5.10.1

**Defect-fix release — the three pre-existing defects found by the rebuilt regression baseline, and nothing else.** All three were present identically in v5.9.2 and v5.10 (not v5.10 regressions); each was pinned by a dated KNOWN-DEFECT test that documented the wrong behavior, and each fix is verified by that pin flipped to a positive assertion. No new features, no engine changes beyond what the ACA fix strictly needs — cross-version engine parity (v5.10 → v5.10.1, common seeded random numbers, identical inputs) remains byte-identical at 8/8.

1. **Clear All Data now wipes everything, including the API key, and returns to the landing screen** (P0 — broken privacy promise). The button's confirm handler previously overwrote the plan with a blank one and never called the storage wipe: the `sk-ant-…` credential (and skin/UI-scale/offline/local-LLM/ACA-scenario preferences) survived "delete everything," and the next mount reopened into a cached blank plan instead of the landing screen — on a shared machine, the credential the user believed wiped was still in browser storage. The handler now runs the same full wipe the docs (§10/§11) always promised: every storage key is deleted, credentials never survive, and the app returns to the landing screen. The confirmation dialog is unchanged.

2. **The STAY UNDER ACA CLIFF solver now accounts for the MAGI its own funding sale creates.** When conversion tax is funded by selling appreciated brokerage, the sale's realized gains land in ACA MAGI — and the solver previously left no room for them: it converted right up to the cliff and its own sale pushed the household over, forfeiting the entire subsidy the strategy exists to protect. The solver now estimates the year's full tax bill at the candidate conversion (mirroring the engine's own tax math), grosses the sale up exactly as the funding model does, and subtracts the implied gain from the cliff headroom (a small fixed-point solve), so the post-sale MAGI lands at cliff − margin. On the test fixture the strategy's forfeited subsidy falls from $54,719 (full forfeit) to $18,326, with per-year subsidies now identical to gain-free funding ($14,052 / $14,952 / $3,490 / $3,899) — and the 2027 figure was hand-verified to the dollar against the HHS poverty guideline and the Rev. Proc. applicable-percentage table at exactly cliff − $500. Withholding and gain-free funding paths are unchanged (verified byte-identical to v5.10). Still one blended gain share: no per-lot selection, loss harvesting, or wash-sale logic (METHODOLOGY updated).

3. **No more phantom Spouse B on the SS tab for single filers.** A single household saw a "SPOUSE B — BENEFIT BY CLAIMING AGE" card whose benefit was invented by the spousal-top-up derivation against a $0 record and a placeholder DOB — while the engines (correctly) modeled B at $0 and the tab printed a note admitting the mismatch directly below the card. The tab's Spouse-B sections (the claiming card with its self-contradicting note, the B date-of-birth placeholder, and the B-referencing survivor lines in Key Assumptions) are now gated on the household's single flag; the B breakeven card and joint claiming grid were already gated. Additionally, the Post-car shortfall figure no longer subtracts the phantom B benefit for single filers (it had been quietly understating a single household's shortfall by the invented amount — roughly $1,900/mo on the placeholder fallback). The couples path is unchanged.

**Testing.** The regression suite re-baselines per release: the active pair is now v5.10 (prior) → v5.10.1 (current), with v5.9.2 retiring from the pair (its full history remains at its git tag). The three defect pins were flipped to positive assertions on the current leg and kept as dated pre-fix pins on the frozen prior legs, so every leg stays green and honest. Counts: **v5.10.1 current leg 248** (t1 62 · t2 15 · t3 36 · t4 90 · t5 27 · t6 18 — the deltas over v5.10's 246 are one extra flipped-pin assertion in t3 and the new Post-car source invariant in t6) **+ engine parity 8 + t7 37 · t8 27 · t9 14 = 334 checks verifying this build**, with the frozen v5.10 leg (246) and v5.9.2 leg (234) additionally re-proven green as history.

**Also in this build (from the committed page template):** a **first-open disclaimer notice** now gates the standalone page — a plain-language "educational tool, not financial advice" summary with an explicit acknowledgment checkbox, shown once per browser and dismissible only after checking it. It runs before and independently of the app itself, stores only a local acknowledgment flag, and never reappears once accepted. This is presentation-layer only (no modeling change); it had been staged in the repo's page template and ships here for the first time.

**Limitations carried forward unchanged:** the ACA fix estimates the funding-sale gain with the same blended-gain approximation the funding model itself uses; Clear All Data's wipe covers the keys the storage contract owns (plan, prompt, meta, credentials, and display/scenario preferences — the same set the RELOAD path has always wiped).

## v5.10

**Contributions now reach the retirement-start snapshot — split pre-tax vs Roth.** Every engine that starts from retirement-day balances (Roth ladder, strategy comparator, solve-for grid, Withdrawal schedule, Taxes schedule, IRMAA planner, What-Breaks) previously seeded from TODAY'S positions, ignoring every contribution between now and the retirement date. The scoped fix from the v5.9.1 review lands whole:

- **Four monthly contribution fields** — pre-tax and Roth for each spouse, with hybrid labels ("Pre-tax (Traditional 401k/IRA)" / "Roth (401k/IRA)") — replace the two combined amounts. Old plans migrate on load as 100% pre-tax (the historically correct reading) with a one-time notice in My Data; Save & Apply writes the explicit split.
- **A shared accrual helper** adds `12 x monthly x years` per bucket, per owner, to the retirement-start balances — nominal dollars, no growth, so nothing the Monte Carlo already compounds gets counted twice (rationale in METHODOLOGY). Person A accrues to the selected retirement year; Person B to the timeline's own B stop year — the same field the MC's accumulation phase already uses.
- **One choke point, nine consumers.** A site census before any edit found nine seeding sites, three of them missed by the original scope list (the Roth-tab ladder seeds, the Taxes-tab schedule, and the IRMAA planner). All nine now call one constructor; raw Traditional/Roth position reduces exist nowhere else in the source, and a test greps for exactly that.
- **Monte Carlo and Trajectory unchanged by construction.** They read mirror totals recomputed on every load and save, so a migrated plan's MC inputs are byte-identical to v5.9.2 — asserted by test, not assumed — and a v5.10 backup opened in v5.9.x still reads finite totals.
- **My Data additions:** a live accrual readout previewing what the unsaved form would add by retirement (the one whitelisted inline accrual — its formula mirrors the helper and is pinned by test), a framing line stating the nominal-dollars rule and the HSA exclusion, and a soft 402(g) elective-deferral warning ($24,500 for 2026, cited on the Verify tab — now 54 checks — and deliberately not enforced, since catch-ups vary).
- **Known behavior carried forward:** the Person-A pre-tax amount derives from the v5.9.1 per-paycheck machinery, so a plan holding only a monthly total shows $0 in that rollup until paycheck detail is entered — unchanged from v5.9.2, but now visible in the readout rather than silent.
- Out of scope, unchanged: working-year taxation, an employer-match field, the Roth-401(k)/IRA distinction, an HSA accrual bucket.

**The regression baseline was rebuilt for this release.** The original t1–t6 harness (597 checks) lived only in prior build sessions' sandboxes and was never delivered into the repo, so it could not be re-run — a process failure this release corrects by shipping the suite as repo files. The rebuilt baseline (t1 units/statics · t2 engines + a seeded cross-version parity harness · t3 Roth engine · t4 DOM tab-walk · t5 persistence/storage contract · t6 single-filer branch) was **proven green against pristine v5.9.2 first (234 checks)**, then against v5.10 (**246 checks**, the delta being v5.10-conditional assertions), plus **8/8 engine-parity checks**: under common random numbers with identical inputs, the Monte Carlo, extended MC, stress, and Roth engines produce byte-identical output in both versions — the strongest form of this release's "engines unchanged" claim. With the feature suites (t7 accrual 37, hand-verified cases exact: $96,000 / $24,000 / $72,000 · t8 invariants + Verify 27 · t9 DOM smoke 14), **332 checks verify this build**.

**Three pre-existing defects found by the rebuilt baseline** (each identical in v5.9.2 and v5.10 — not regressions — and each pinned by a dated KNOWN-DEFECT test that documents today's behavior and flips when fixed):
1. **ACA cliff solver ignores its own funding sale** (t3): with conversion tax funded by selling appreciated brokerage, the sale's realized gains land in ACA MAGI and push the household over the cliff the STAY UNDER ACA CLIFF strategy exists to stay under — full subsidy forfeit instead of the partial loss gain-free funding achieves.
2. **Clear All Data does not honor its documented contract** (t5): the button overwrites the plan with a blank one but never calls `clearStorage()` — the API key survives "delete everything" (Docs §10 explicitly promises the opposite), and the app does not return to the landing screen (Docs §03/§11 say it does). On a shared machine the credential the user believes wiped is still in browser storage.
3. **SS tab renders a phantom Spouse B for single filers** (t6): the tab's B sections aren't gated on `single`, so a single household sees a "SPOUSE B — BENEFIT BY CLAIMING AGE" card with a benefit invented by the spousal-top-up derivation against a $0 record — while the engine (correctly) models B at $0 and the tab even prints a note admitting the mismatch.

These are scoped for a v5.10.1 fix release; the defect pins in the suite make the fixes self-verifying.

## v5.9.2

**The save is now wherever you are** (follow-up to the v5.9.1 data-loss guard, from Steve's own field report).

The v5.9.1 flow had a friction bug: the leave-warning made you cancel, scroll to the bottom of My Data, and save — three steps to do the thing you obviously wanted. Two changes, no new data paths:

- **The sticky "unsaved changes" chip now contains a SAVE & APPLY NOW button.** The chip follows you down the page, so a save is always one click away from any section — no scrolling, ever. Its tooltip states plainly that it is identical to the main button at the bottom; every save in the app runs the same single commit path.
- **The leave warning is now a three-way choice: SAVE & APPLY, THEN LEAVE / DISCARD & LEAVE / STAY.** Saving from the dialog invokes the editor's own registered save function — the exact same `buildPortfolio()`/`buildExpenses()` commit as the buttons, nothing new serialized or stored, so there is no new surface that could leak. Discarding still leaves the auto-saved draft recoverable on your next visit, and the dialog says so.

Suite: 597 checks green (t1 287 · t2 44 · t3 66 · t4 171 · t5 24 · t6 9).

## v5.9.1

**Data-loss guard + contribution clarity** (reported by evening_warthog).

- **Unsaved My Data edits are no longer silently destroyed.** Previously, entering data and switching tabs discarded everything with no warning — the most severe reviewer finding to date, because the loss was invisible. Four layers now: an amber **● Unsaved changes** chip appears the moment you edit; leaving the tab while dirty asks first; closing the browser tab while dirty asks too; and — the real fix — a **draft auto-saves every few seconds** to separate storage, so on your next visit a banner offers RESTORE & APPLY DRAFT with a timestamp. Drafts never travel in backups (they're uncommitted by definition), die on Clear All Data, and yield to an imported backup. (The Clear All Data deletion was added by a pre-release leak review — the first cut cleared drafts on save and import but left them alive after "delete everything," which would have offered a "deleted" plan back to the next user of a shared machine.)
- **"Contrib %" renamed "Contrib split %"** with a tooltip and a smarter total readout. The column is how each year's contribution dollars *divide* across holdings — a split, not a savings rate — and the reviewer read it the other way because nothing said so. Verified during the build: totals that don't reach 100% are **scaled to the entered proportions** (60/40 and 6/4 are identical), and the readout now says exactly that; leaving every row blank makes contributions follow your current balance mix.
- **Import sanity clamps** (from the standing security audit): a hand-edited backup with an absurd retirement year or life expectancy could previously hang the tab, because engine loop bounds come from imported values. Years and life expectancies are now clamped to sane ranges on import, at the exact top-level fields the timeline reads.

Pre-tax vs Roth contribution modeling (the reviewer's third finding) is scoped separately as v5.10 — it's a real tax-engine feature, not a form fix.

Suite: 593 checks green (t1 283 · t2 44 · t3 66 · t4 171 · t5 24 · t6 9).

## v5.9

**Skins become interface personalities.** Previously a skin could change 18 color tokens and nothing else, so all eleven were the same tactical-console interface in different paint — which is why none of them satisfied. A skin now also carries **typography and density**: font family, label casing, type scale, letter-spacing, and table density.

- **REPORT** — sans, sentence case, roomier spacing, paper surfaces with a blue accent. The business-document register.
- **QUIET DARK** — the same typography on soft charcoal (deliberately not OLED black) with a desaturated blue accent. Evening reading without glare.
- **CONSOLE unchanged.** All eleven existing palettes declare `mono / caps / tight`, so anyone happy with Tactical Green sees exactly what they saw before, down to the pixel.

**The architectural change underneath:** 222 label strings were hand-typed in capitals, which CSS cannot undo without destroying acronyms (ACA, IRMAA, RMD). Labels are now stored in canonical **sentence case** — the lossless form — and the console personality re-applies uppercase via CSS. Casing is a real toggle now rather than a per-theme find-and-replace, and every acronym survived (protected-word list, reviewed as a diff).

A contrast invariant caught a real defect during the build: REPORT's first surface palette had panel and background too close to distinguish (1.04 ratio). Corrected before shipping.

Suite: 580 checks green (t1 273 · t2 44 · t3 66 · t4 168 · t5 24 · t6 9), including new invariants that every skin declares all five typography tokens, that the eleven legacy skins remain console-identical, and that the two new personalities share one spine.

## v5.8.2

**Update instructions corrected — the app now points at its own home.** Three places told users that getting a current copy meant asking whoever gave them the file, who might have to ask *their* source in turn, because "there is no download site yet." That stopped being true once the app went live on GitHub Pages. All three now name the site directly:

- the **⌛ STALE DATA banner** — the highest-impact one, since it is shown precisely to the users whose copy is out of date and who need the update path to work;
- the Field Manual §13 maintenance table;
- the §13 plain-English paragraph.

A permanent test invariant now fails the build if "person to person" or "no download site yet" reappears anywhere in the source.

Suite: 562 checks green (t1 251 · t2 44 · t3 66 · t4 168 · t5 24 · t6 9).

## v5.8.1

**Per-person displays completed + header decluttered.**

- **STEP-1 RMD cards rebuilt per-person** (gap found by the v5.8 headless ownership-flip verification): each spouse's own Traditional now grows to *that spouse's* first RMD year and divides at *that person's* starting divisor, shown as two stacked figures with each person's age and year — for the demo couple, 2039 and 2041 instead of one pooled figure at 2039. The with-conversion card replays the ladder per person using the engine's own proportional-allocation rule.
- **Withdrawal-tab schedule: two RMD streams.** Each spouse's slice starts RMDs at that person's own SECURE 2.0 age. Owner shares are held at their initial proportions in this schedule view (the Roth engine reallocates dynamically) — stated here rather than implied. The "RMDs active" phase and legend now name both ages. This closes the v5.8 staging note, which is deleted rather than amended.
- **Header decluttered:** the animated allocation radar is gone — it duplicated the allocation strip below it, its caption still described a retired grading version ("Ring = target … Number = deviation" on a radar that had neither), and its sweep redrew at 60fps on every tab for the whole session, so removal is also a battery/CPU fix. The scanline (the slow-moving horizontal line) is gone too. The header is ~100px shorter; the success rate keeps its size and becomes the top-right's sole focus.

Suite: 558 checks green (t1 247 · t2 44 · t3 66 · t4 168 · t5 24 · t6 9).

## v5.8

**Per-spouse ownership** (reported by AffectionateTap730 — his #1, #2, and the foundation for #5). The largest engine change since the merge.

- **Every retirement holding now has an OWNER.** The Holdings table's Owner column (teased in v5.7.2) is live, labeled with your household's names. Other Accounts gain an owner too, with **Joint** available there — and only there, because IRAs and 401(k)s are individual by law.
- **RMDs run as two streams.** Each spouse's Required Minimum Distributions start at *their own* SECURE 2.0 age (73 for 1951–59 births, 75 for 1960+) on *their own* balance. Previously the entire household pot took RMDs at Spouse A's age — overstating early RMDs and understating the conversion window for mixed-age couples. The Events tab always announced two RMD dates; the engines now agree with it.
- **Conversions are per-person.** A conversion lands in the converter's own Roth — there is no such thing as a spousal conversion, and the model no longer implies one. Each spouse converts only inside their own window (retirement → the year before their own RMDs); the household ladder runs to the LATER of the two, so a younger spouse's dollars stay convertible after the older spouse's window closes.
- **Solver allocation is proportional to convertible headroom** — a representation choice, not advice; per-spouse sequencing (e.g. draining the older spouse first) is deliberately not optimized and is documented as such.
- **Survivor rollover:** on the first death, the decedent's retirement accounts roll to the survivor (the standard spousal election) and the survivor's own RMD age governs the merged pot from then on. Joint taxable simply continues.
- **Old backups migrate safely:** retirement rows default to Person A with a one-time review notice in My Data; other accounts use their names as hints ("(A)", "Spouse B …") and default to Joint. Saving writes explicit owners and clears the notice.

Suite: 542 checks green (t1 242 · t2 44 · t3 66 · t4 163 · t5 24 · t6 9), including 10 new hand-verified per-spouse cases: RMD-at-own-age to the dollar, window legality, proportional allocation, survivor rollover (merged pot correctly waits for the survivor's age), and a pooled-fallback equivalence proof that keeps every pre-v5.8 test meaningful.

## v5.7.2

**Readability pass** (reported independently by AffectionateTap730 and scooter2013). No engine, schema, or persisted-field changes — if any number differs from v5.7.1, that is a bug; please report it.

- **Size floor raised.** The app's dominant text size was 8px, with 125 elements at 7px and four at 6px hiding in the claiming grid and IRMAA rows. New floor: nothing below 8px anywhere (guarded by a permanent test invariant); explanatory prose raised to 9px minimum (58 blocks).
- **Letter-spacing reduced on small text** (118 sites): wide tracking on 8–9px capitals was inflating letterform gaps ~25% at exactly the sizes where it hurts most. Headers at 10px+ keep their tracking — that's where it works.
- **What stayed uppercase, on purpose:** section headers, column headers, card titles, and status labels — the console identity one reviewer complimented. A census found the app's actual prose was already sentence case; the "wall of caps" experience came from the density of tiny tracked labels, which the size and tracking changes address directly.
- **Holdings table prepared for v5.8:** Ticker/Name/Asset columns narrowed to make room, and a dimmed **OWNER (v5.8)** teaser column now marks where per-spouse ownership will land — the answer to AffectionateTap730's #1/#2/#5 is scoped and next.
- Fonts verified: JetBrains Mono loads at weights 300–700, so no synthetic bolding was in play — the "thin" reading was size and tracking, now fixed.

Suite: 527 checks green (t1 234 · t2 44 · t3 56 · t4 160 · t5 24 · t6 9).

## v5.7.1

**Roth break-even rebuilt** (reported by AffectionateTap730). The old card divided undiscounted conversion tax by flat-24%-assumed RMD savings and rendered a hardcoded demo age (`63 + 12 + years`). It is replaced by a **WEALTH CROSSOVER** card under the strategy comparator: the slider strategy and NO CONVERSIONS both run through the full 30-year deterministic engine (brackets, SS taxation, NIIT, AMT, state, IRMAA lookback, ACA when configured), and the card reports the first year the strategy's after-tax wealth catches the no-conversion path — at **face value**, deliberately, so the cash question ("when does the tax I paid come back?") isn't masked by the heirs'-tax credit, which the ESTATE ranking captures separately. Discounting is implicit (same-year comparison ≡ discounting at the portfolio's growth rate) and the opportunity cost of conversion tax is mechanical: paid dollars leave the taxable balance in the engine and stop compounding. Four honest outcomes are distinguished: recovered after a deficit (with the deepest shortfall shown), never behind (early conversions under the standard deduction cost ~$0 — common before Social Security starts), never recovers within the plan (real for large conversions with little outside money — the demo household's FILL-24% loses the cash race by up to $514K while still competing on estate), and no measurable difference. Guarded by 11 exact-dollar engine tests including a case that pulls ahead precisely at RMD start.

Also in v5.7.1:
- **Pension lump-sum guard** (asked by Evening_Warthog): the monthly pension fields (My Data + Guided Setup) now warn when an entry above $25,000/mo looks like a lump sum, and point to the correct homes (Holdings row for a rollover; Other Accounts for after-tax cash). Previously a lump sum entered there silently modeled as that amount *per month, for life*.
- **Conversion-tax funding notice** (AffectionateTap730 #6): selecting "pay from cash/savings/brokerage" with almost no money outside retirement accounts now says the engine will fall back to paying from the Roth, then the Traditional — previously a silent fallback.
- **"Mixed" relabeled** to **"Trad + Roth (split)"** (AffectionateTap730 #3).
- **Stale Taxes-tab disclaimer corrected**: it claimed NIIT and AMT were not modeled (both are) and that state tax came from the master prompt (it uses the 51-jurisdiction module).

Suite: 523 checks green (t1 230 · t2 44 · t3 56 · t4 160 · t5 24 · t6 9).

## v5.7 — 2026-08

- **Fixed: overlapping input fields in My Data tables (reported by scooter2013, 4K displays).** Form inputs declared `width:100%` plus padding/border without `box-sizing:border-box` (the app has no global border-box rule), so each input rendered ~16px wider than its table cell and bled into the neighbor column at wide window widths. Fixed at all four affected style sites (both shared `inp` objects and the mortgage what-if RATE/TERM inputs); guarded by 7 new tests including a source-level invariant that no `width:100%`+padding form style may ever lack `boxSizing` again.
### ACA premium subsidy modeling (new)
- **My Data → ACA BRIDGE**: enter your household's benchmark silver premium ($/mo) and FPL household size. Blank = feature off; pre-v5.7 backups import cleanly and default to off.
- **Roth tab**: strategies are now charged for the marketplace subsidy they destroy in pre-Medicare bridge years (new **ACA SUB LOST** column, charged against the taxable balance so estates reflect it). The NO CONVERSIONS row loses $0 by construction.
- **STAY UNDER ACA CLIFF** strategy: bridge years convert up to 400% of the prior-year FPL minus other ACA income minus a $500 margin; post-Medicare years fill the 24% bracket.
- **Law scenario toggle**: CURRENT LAW (the 400%-FPL cliff that returned when the enhanced credits expired end-2025) vs ENHANCED EXTENDED (the ARPA 8.5%-cap structure, should Congress restore it). Persisted like the SS depletion scenario. Under ENHANCED the cliff solver is hidden — no cliff exists to stay under.
- Modeling notes: ACA MAGI counts **full** Social Security (the untaxed part adds back — a different MAGI than IRMAA's); bridge premiums grow at household inflation + 2 points (medical trend); years with one spouse already on Medicare use half the household premium; below 100% FPL the model shows $0 and defers to Medicaid rules it does not model.
- Constants verified against primary sources at build time: IRS Rev. Proc. 2025-25 (2026 applicable-percentage table), HHS/ASPE poverty guidelines (2025 and 2026 vintages), Rev. Proc. 2021-36 (ARPA table for the ENHANCED scenario). 8 new checks on the in-app Verify tab (53 total).

### Since v5.6 (merged build)
- Income streams as a first-class module (rental / work / annuity / other; owner, window, COLA, tax treatment) flowing through every engine.
- Verify tab: every statutory constant asserted against IRS/CMS/SSA on-screen.
- Social Security trust-fund depletion scenario (year + percentage) threaded through all engines and the claiming grid.
- First-open disclaimer gate, baked into the build template so rebuilds can't drop it.
- Fixed: Monte Carlo percentile bands broke under stochastic longevity (post-death snapshots were recorded quarterly instead of annually).
- Fixed: SS-tab spousal-benefit sentence asserted a comparison it never computed; now computed, with an explicit "spousal benefit not modeled" disclosure when it governs.
- Roth what-if slider cap raised $120K → $400K (no IRS limit exists; solver strategies were never capped).
- Four readability skins (High Contrast Light/Dark, Midnight Blue, Colorblind-Safe Okabe–Ito) with WCAG contrast enforced by tests; UI scale control (100–150%); landing-screen readability hint.
- Backup-filename guidance and gitignore-aligned default name.
