# SCOPE — v5.34 · the engine half of realized capital gains

> ## ⚫ RETIRED 2026-08-28 — SUPERSEDED. The work here did NOT ship at v5.34; it shipped at **v5.36**.
>
> **Do not build from this document.** Its status line below still reads *"ALL DECISIONS RESOLVED.
> BUILD AUTHORISED"* and was true when written, on 2026-08-14, against shipped v5.33.
>
> ⚠ **Read the reason carefully, because the obvious test gives the wrong answer.** `## v5.34` is
> present in `CHANGELOG.md`, so a sweep that retires a scope whenever its named version shipped would
> retire this one as *"built at v5.34"* — and would be recording a false history. **v5.34 narrowed
> mid-build.** Its own entry says the capital-gains engine work *"is backed out and held for v5.35"*;
> what v5.34 actually shipped was the conversion-funding basis tracker, Engine A only. The work
> scoped here re-landed at **v5.36**, under `SCOPE_v5_36_drawdown_capital_gains.md` — whose title
> says *"(S-7, re-landed)"* for exactly this reason.
>
> **A version heading in the CHANGELOG proves a release happened, not that this scope's contents were
> in it.** That is the general lesson and it is why the 2026-08-28 sweep checked content rather than
> version numbers. Superseded by the v5.36 scope; body kept as the record of what was decided.
>
> *Retired 2026-08-28 by the second scope-retirement sweep. The first sweep (§I, 2026-08-26) found seven of nine stale; twelve had drifted again by v5.53. Confirmed by CONTENT against the release that shipped it — not by the presence of a version heading in the CHANGELOG, which is not evidence (see this file's note, and v5.34's).*

**Status — rev B, 2026-08-14: ALL DECISIONS RESOLVED. BUILD AUTHORISED.** No source has been
edited yet. §9 records each decision, who took it and why; §5's D-4 work is **discharged** by the
v5.33 D-4 test addendum, which shipped separately.

*(Rev A was scope-only with three decisions open. Nothing verified in rev A was changed by the
resolutions — only §5's status, §6's rider, and §9.)*

**Base:** shipped **v5.33**, source `df10c6226d7c4519919bb55238609a92`, built
`c998f5ff760c6c5e04ab6173a68f6421`, repo HEAD `2f931ec`. Prior build for the regression pair is
**v5.32** `7e7be3f869f298667fe994074cfffb06`. Freshness check run 2026-08-14: manifest, CHANGELOG and
committed tree agree; §A2 clone-and-diff 48 content-matched / 0 drift / 30 knowledge-only.

Every line number and offset below was **measured against shipped v5.33 in this session**, not
carried forward from an earlier document. Several carried-forward figures turned out to be stale —
see §5.

---

## 1 · What this release is

v5.33 shipped the storage foundation: `taxableGainPct` on the household, `taxableGainShare()` as the
one clamped reader, a schema default, and the My Data control. **Nothing reads the field.** The app
currently tells the user, in the panel, that the model does not use the value yet and that no figure
changes until v5.34.

v5.34 makes that false, deliberately, and must therefore falsify the disclosure in the same release
(§6). It is a **modelling release**: figures move for every household with a non-zero share, and by
the Option A growth component even at the default.

**This release cannot be split the way v5.33 was.** Until S-5/S-6/S-7 all land, the app realizes
gains in one engine and not the others, which is self-contradictory on screen. That is the standing
judgement in `STATUS_CAPGAINS_PARTIAL_for_v5_33.md` §6 and this scope does not reopen it.

---

## 2 · D-2's default — RESOLVED, and how

**The default stays 0. D-2 remains PARTIALLY ADDRESSED in `MissingFeatures.md`.**

The pre-fixed criterion was to re-run the six-household direction evidence from
`SCOPE_FIX_realized_capital_gains_v5_32.md` §2 with sub-floor years excluded via v5.32's
`acaFloorYrs`. **That re-run is not possible: the six households were never recorded.** §2.2 records
each household's *results* but not one parameter of its construction, and the harness that built them
is in neither the knowledge pool nor the committed tree nor git history (searched 2026-08-14; the
only probe ever committed is `probe_classify.mjs`, which is the `otherAccounts` tool and mentions no
pension, brokerage or FPL).

Reconstructing six households from one-line descriptions would make every resulting number a property
of my reconstruction rather than of the recorded evidence — and §2.4 records that the original author
mis-built two of these same six on the first attempt. Worse, a criterion fixed in advance only
constrains the answer if the *evidence* is fixed too; if the same session both builds the households
and applies the criterion, the choice has been handed back.

**Decision taken 2026-08-14 (Steve): default stays 0, and the direction harness gets built and
committed anyway — as v5.35 work alongside A3.** Measuring direction *before* A3 removes the
sub-floor artifact means measuring through a known distortion, so its conclusions wait. The
specification for that harness is §10, recorded here so it cannot be lost a second time.

This is not a dodge: moving a default off 0 requires positive evidence, and the only evidence
pointing that way is households E and F, which `SCOPE_FIX_realized_capital_gains_v5_32.md` §2.3
itself disowns as an ACA-floor artifact.

---

## 3 · Source work — sites verified against v5.33

### 3a · Engine D — the four hunks that already exist in the partial

`DangerClose-CAPGAINS-PARTIAL.jsx` (`229191d697e3a1156128d2277c3d5601`) carries these against a
**v5.31** base. Offsets have moved twice since. **Port deliberately, hunk by hunk — do not
`git apply`, and do not diff the file whole** (that prints the 143K-character `DOCS_HTML` line and
cost most of a context window on 2026-08-14; suppress lines over ~400 chars).

| Hunk | What it does | Partial | Lands near, in v5.33 |
|---|---|---|---|
| 6 | `taxBasis` tracker initialised from the share | P-L4317 | `_taxInit` at **L4296** |
| 7 | proportional gain on draw; RMD inflow at **full basis** | P-L4425–4435 | `drawFromTaxable` **L4420–4422**, `_taxBoy` **L4437**, `rmdToTaxable` **L4431/4447** |
| 8 | `capGain_y` into MAGI, comment rewritten | P-L4426/4477 | `const magi =` **L4486** |
| 9 | D-4 schedule-row hook (`capGain_y`, `taxBasis` on the row) | P-L4500 | row object **L4499–4500** |

**The partial's comments say v5.32.** That string now means the shipped ACA-floor release. Rewrite to
v5.34 — and note hunk 8's comment is *falsified* by its own hunk and must be rewritten, not carried.

### 3b · S-5 / S-6 / S-7 — cross-engine consumption

⚠ **S-6 is the highest-risk edit in the project right now, and this session found a sharper reason
than "it has two branches".**

The ACA cliff solver has a plain solve **and** an 8-pass contraction, and **the contraction
overwrites the plain solve's result**:

- **L3812** — plain solve: `conv = Math.max(0, Math.min(cliff - (base + div_y + ss) - ACA_CONSTS.solverMargin, headroomTrad));`
- **L3873–3876** — the 8-pass loop, recomputing at **L3875** with `+ gC` added.

The contraction runs only when `P.convTaxFunding !== "withhold" && _cgf > 0 && taxBal > 0`
(**L3827**). So the two ways to get this wrong are *not symmetric*, and each is invisible to the
other's test case:

- **Add the spending gain only at L3812** → the contraction silently discards it for every household
  that funds conversions by selling with an embedded gain.
- **Add it only at L3875** → every household that funds by withholding, or has `rothGainPct` 0, or
  has an empty taxable balance, never gets it at all.

**Therefore the release needs TWO hand-computed cases, not one:** one household where the contraction
runs, and one where it provably does not (`convTaxFunding: "withhold"` is the cleanest switch). A
single case passes while half the edit is missing. No existing test covers either.

### 3c · S-8

**L4914** — `const [rothGainPct, setRothGainPct] = useState(0);` reads the persisted
`PORTFOLIO.taxableGainPct` instead. Note `rothGainPct` feeds `taxableGainFrac: rothGainPct / 100` at
**L8792** and **L8938** — a *different quantity on a different surface* from `taxableGainPct`. S-8
makes them agree at initialisation; it does not merge them. Do not conflate.

---

## 4 · Site census

By AST (`qa/tools/census.cjs`), against v5.33 — not greps:

| Identifier | AST hits | Note |
|---|---|---|
| `taxableGainPct` | 4 | field, accessor read, schema default, save-back |
| `taxableGainShare` | 1 decl, **0 call sites** | v5.34 makes this non-zero; `t1` asserts 0 today and must be flipped |
| `taxableGainFrac` | 5 code sites | L3826, L3943, L4910(≈), L8792, L8938 — the conversion-funding quantity |
| `rothGainPct` | 8 | incl. L4914 (S-8) and two `taxableGainFrac` feeds |

*(A raw text count of `taxableGainFrac` returns 8; three of those are comments. The earlier
"8 uses" figure in circulation is the text count.)*

---

## 5 · D-4 — DISCHARGED 2026-08-14 by the v5.33 test addendum

✅ **This section is done and is retained as the record of why.** `t14`'s windows are now **bounded**
by the engine (anchor → start of the next top-level function) rather than sized by a fixed character
span, both bounds asserted unique, with a loud failure on a missing end marker. `t14` **33 → 44**,
app total **1136**. Four negative controls fire; the decisive check is that `t14` runs **44/0 against
`DangerClose-CAPGAINS-PARTIAL.jsx`** — the exact source on which the old `span: 8000` failed 32/1.

⚠ **Carry into the build:** a negative control that did *not* fire exposed that the per-engine
`death` check was a **presence** test — Engine D has two death guards and any survivor kept it
green. It now asserts the **absence of the weakened `>` form**, which is sound only because Engine D
has **no filing concept**. If v5.34 gives Engine D one, that assertion must MOVE to `filingEngines`,
not be deleted.

The original analysis follows, unchanged.

### 5a · The measurements that justified it

`t14` slices a fixed span after an anchor and regex-matches the survivor rule inside it. Measured
this session:

| Engine | Anchor→rule offset | Span | Headroom, **v5.33** | Headroom in the PARTIAL |
|---|---|---|---|---|
| Engine A | +3,101 | 4,000 | **899** | 1,494 |
| Engine D | +7,412 | 8,000 | **588** | **+8,499 → OUTSIDE. WINDOW FAILS.** |

Two things follow, and the second is new:

1. **Engine D's window breaks the moment the hunks land** — confirmed by measurement against the
   partial, not predicted. It must be resized pre-emptively, per decision D-4.
2. ⚠ **Engine A's window is also at risk, and the figure in circulation understates it.** The
   "1,494 characters of headroom" recorded in the v5.33 brief was measured against the **partial**
   (a v5.31 base). Against shipped v5.33 the headroom is **899**, because v5.32 added the ACA floor
   code inside that same window. **S-6 edits the cliff solver, which sits inside Engine A's
   window** — so S-6 spends the very headroom that is already the smaller of the two figures.

**Engine A's fail-open ceiling is +29,908** (measured): widen the span past that and it matches the
*next engine's* copy of the same rule text and **passes vacuously**. Engine D has no second copy, so
no fail-open ceiling — it simply fails.

Size both against the real function boundary (`qa/tools/funcmap.cjs`), and **negative-control both**:
a window that cannot fail is not a test.

---

## 6 · S-10 — the disclosure sweep, with the locks named

v5.34 falsifies *"realized capital gains default to $0 unless a sale is modeled"*. Surfaces carrying
that claim in v5.33, verified:

| # | Site | Kind |
|---|---|---|
| 1 | **L4709** `const capGains_y = 0; // conservatively 0 unless a sale is modeled` | Engine B behaviour + comment |
| 2 | **L9302** Taxes-tab footnote | user-visible |
| 3 | `DOCS_HTML` ×1 — the Field Manual "Honest limits" paragraph | user-visible, inside the blob |

**Assertions that become §B2 LOCKS the moment the copy is falsified:**

- **`t4_dom.mjs:396`** — asserts the Taxes-tab footnote *contains* the sentence. Goes green
  *because* the stale copy survived. **Invert, gated per leg.**
- **`t19_engineD_exact.mjs:86`** — a comment citing the same claim; not an assertion, but it will
  read as authoritative to the next session. Rewrite.
- **The five v5.33 panel assertions in `t4`** — "recorded, not yet used", "The model does not use
  this yet", "no figure on any tab changes until v5.34". These are locks by construction and were
  shipped knowing it. **Invert all five, gated per leg**, so v5.33 keeps asserting what was true
  for v5.33.

⚠ **One of those five is WRONG, not merely stale — and it is my error (rider to D-34-2).** The
v5.33 panel says *"Leaving it at 0 says the pool is all basis and selling it triggers no tax."*
Under Option A the second clause is **false**: at share 0 the model still realizes gain accrued by
growth ($30,821 of lifetime gain on the example household). It is harmless at v5.33 because nothing
reads the field, and actively misleading the moment v5.34 lands. **This copy needs a CORRECTION, not
an inversion** — the two are different operations, and inverting a false sentence yields another
false sentence. Correct it to say that leaving the share at 0 assumes no embedded gain *today*,
while growth between now and each sale still accrues gain regardless of the share.

Editing surface 3 is a `DOCS_HTML` edit: quote-free anchors, assert the anchor's hit count first,
and **print the full surrounding sentence back afterwards** — a v5.26 edit replaced half a sentence
and left the false half standing one clause after its own correction.

---

## 7 · Tests

**The test work did not survive and is a genuine rebuild**, not a port. Pool `t19_engineD_exact.mjs`
is byte-identical to shipped at **14 checks**; the 35-check version (Section D, the independent
per-year replay, the rewritten B-2 pin, four negative controls) and the `t14` H-1 window fix are
gone. `STATUS_CAPGAINS_PARTIAL_for_v5_33.md` §4–§5 is a sufficient spec to rebuild from.

- **`t19`** — rebuild to the 35-check shape. **D3 is the only guard on the 1:1 RMD-inflow-at-full-basis
  rule; do not weaken it.**
- **`t22`/parity** — since the E-15 addendum, the premium-positive household means **parity can now
  see the ACA path**, so parity is real evidence for S-6 for the first time. It is not a substitute
  for the two hand-computed cases in §3b.
- **`t18`** — LTCG breakpoints need a *purpose-built* household: every LTCG figure is $0 on the
  example household, so it would assert nothing.
- **`t17`/`t13`** — IRMAA two-year lag against a gain-bearing year.
- **`t5`/`t4`** — persistence and prompt rendering already shipped at v5.33; extend for the
  inverted copy only.
- **`t1`** — the AST assertion "no engine calls `taxableGainShare()`" **must flip** from 0 call
  sites to the real count, gated per leg.

Negative controls, mandatory: one per §3b branch (each must fire *alone*), one per resized `t14`
window, and one on the basis tracker.

---

## 8 · Explicitly out of scope

A3 / the ACA sub-floor toggle (v5.35) · the direction harness §10 (v5.35) · the enhanced-regime half
of E-15 (folds into A3) · E-6 the jsdom duplication audit · audit Phase 4 · Section D sweep S-1
(IRMAA MAGI enumeration) · any change to the `taxableGainFrac` conversion-funding model beyond S-8's
initialisation.

---

## 9 · DECISIONS — all resolved 2026-08-14, build against these

| | Decision | Resolution |
|---|---|---|
| **D-34-1** | Migration notice content | **Reads the user's own share; states NO dollar delta.** Permanent standing notice, no new persisted state |
| **D-34-2** | Option A at the default | **CONFIRMED — accept and disclose**, with three riders |
| **D-34-3** | Release size | **SPLIT.** D-4 harness work shipped first as a v5.33 addendum (done); the engine is this release |

### D-34-1 · The migration notice

**Reads the live `taxableGainPct` and names the two components; states no dollar delta.**

The app cannot compute *their* before-and-after without storing the pre-v5.34 result, and D-3
forbids new persisted state — so any dollar figure would be the **example household's**, displayed
on someone else's plan. The v5.25/v5.26 precedent agrees: that notice named *what* changed and
*where*, and never quantified a delta.

Reading the live value serves **both migration populations with one text**: a user at 0 sees "0%"
and the growth explanation; a user who set 40% at v5.33 sees "40%" and both components. Personalised
exactly as far as the data honestly allows, at zero state cost.

**It is PERMANENT, and that governs the wording.** Static + non-dismissible + no new persisted state
means it never goes away, and it cannot be targeted at migrating plans: v5.34 adds no new persisted
field, so the v5.25 schema-detection trick (accounts lacking `taxType`) has no analogue here, and
**E-5** — the exported backup does not identify the build that produced it — rules out a version
stamp. Fixing E-5 would not rescue this migration anyway, since plans saved before a stamp exists
still lack one.

⚠ **Therefore the notice MUST NOT be phrased as an event.** *"Your numbers have moved"* is true for
a week and false for every user who arrives afterwards. Write it as a **standing statement of what
the model does** — the Withdrawal tab realizes capital gains on sales from the taxable pool, the
household's embedded-gain share is X%, and growth accrues gain regardless of that share — with one
dated line recording that this began at v5.34. It has to survive becoming furniture, because by
v5.36 that is what it will be.

*Alternatives considered and declined (Steve, 2026-08-14): a dismissible notice, and one that clears
on the next Save & Apply. Both cost a persisted field — which here means a schema default, backup
round-tripping, Clear All Data coverage and `t5` checks — to buy the ability to hide an explanation
the user may later need. Dismissing the notice does not make the tab stop realizing gains; a
permanent property of the model belongs in permanent copy. If it ever grates, a standing note can be
made dismissible later, whereas persisted state cannot easily be removed once it is in backups.*

### D-34-2 · Option A — CONFIRMED, accept and disclose

Growth accrues gain; no basis is added on growth. **Figures move for every household at the default,
with no user action.**

The reasoning, recorded so it is not relitigated: **share 0 is a statement about today, not about
the next thirty years.** A user entering 0% means "my brokerage is all cost basis right now". Holding
basis constant while the pool grows for twenty-five years would assert that the pool grows without
appreciating — contradicting the model's own growth assumptions. The alternative treats all
appreciation as freshly contributed after-tax money: economically false, and it errs **optimistic**
(less gain, less tax, better-looking plan), which is the wrong direction for this app.

**Rider 1 — the v5.33 panel copy is wrong and needs CORRECTION, not inversion.** See §6.

**Rider 2 — the "conservative direction" claim has a live exception, and it is not fixed until
v5.35.** More gain → more tax → worse plan, *except* through the ACA-floor artifact, where realizing
gains lifts a household back over 100% FPL and appears to restore a full benchmark premium. v5.34
therefore ships a change that is conservative for most households and **anti-conservative for those
near the floor, for reasons the app already knows are an artifact.** State this explicitly in the
CHANGELOG and METHODOLOGY — not as a footnote.

**Rider 3 — do not publish $30,821 as though it generalises.** It is the example household at
`rothAmount 0`, where 85.3% of draws are recycled RMD cash. `t19`'s standard ARGS convert $70K/yr and
suppress recycling **entirely** — same household, different configuration, effect largely gone. Lead
with the ratio (**3.09% of lifetime Priority-1 draws**) and the mechanism (it scales with how much of
the plan runs through the taxable pool); give the dollar figure as one worked example.

### D-34-3 · Release size — SPLIT (done)

The D-4 harness work shipped as the v5.33 test addendum, ahead of the code that breaks it. That
ordering is now vindicated by measurement rather than argument: the bounded windows were verified
**44/0 against the partial** before the partial's code exists in a release. Fixing a window in the
same release as the code that breaks it would have meant testing the fix only against the new
behaviour.

## 10 · The direction harness — specification for v5.35

Committed this time, as `qa/tools/probe_gain_direction.mjs`. **A probe, not a suite: it asserts
nothing and must never be counted in a total.**

- Six households defined **explicitly in the file**, each with a one-line rationale and full
  parameters, in the `t22` `BRIDGE` literal style — never derived from `PORTFOLIO()`, so example-data
  changes cannot silently rewrite the evidence.
- For each: real gains, federal LTCG, NIIT, IRMAA and ACA deltas at shares 0 / 25 / 40 / 75, run
  through the shipped engines.
- **Sub-floor years identified via `acaFloorYrs` and reported both included and excluded**, so the
  artifact is visible rather than assumed.
- Its conclusions are read **after A3**, not before.

The definitions should be reviewed before the first run, precisely because whoever writes them can
otherwise choose the answer.
