# SCOPE — Virginia's note states the wrong income thresholds

| Field | Value |
|---|---|
| Premise verified against | **v5.57** · source `0daebb4af466b9095db79117daefcd32` · tree `57575c6` |
| Written | 2026-09-01 |
| Origin | `AUDIT_STATE_EXCL65_ROUND3.md` §2a; decision **D-C** of its §6 |
| Shape | **Disclosure only. One string. No figure moves. No engine change.** |
| Status | **RETIRED — SHIPPED as v5.58, 2026-09-02.** Virginia's note now states the correct
$12,000 age-deduction income thresholds; the release is recorded in `CHANGELOG.md` under v5.58 and
in `METHODOLOGY.md`. Kept as the build record. Its §6 decisions were resolved as built; nothing in
it is awaiting a maintainer answer, which is why it also leaves `package_check`'s OPEN allowlist in
the same edit (v5.60 ops item 6.1). |
| Statute re-verified | 2026-09-02 against the **primary source** — `law.lis.virginia.gov` § 58.1-322.03, 2026-updated section (page dated 8/30/2026). See §1. |

---

## 1. Premise, verified against the statute and against the build

**The modelled note is wrong, and wrong in the optimistic direction.**

`STATE_RULES.VA.note` currently reads:

> `$12K 65+ age deduction (income-limited above ~$75K/$150K; approximated as unconditional)`

**Va. Code § 58.1-322.03(5):** the $12,000 age deduction for individuals born after 1 January 1939
who have attained 65 is reduced **$1 for every $1** that adjusted federal adjusted gross income
exceeds **$50,000 single / $75,000 married**.

> **⚠ Re-verified against the PRIMARY SOURCE on 2026-09-02**, not against this project's own audit.
> When this scope was written its only citation was `AUDIT_STATE_EXCL65_ROUND3.md` §2a — two project
> documents agreeing with each other, which is not a statutory check, and the whole release is a
> statutory claim entering user-facing copy. Read at `law.lis.virginia.gov`, § 58.1-322.03,
> **2026-updated section, page dated 8/30/2026**, subdivision 5.b. It states the $12,000 deduction
> for those born after 1 January 1939 who have attained 65, reduced $1 for every $1 that adjusted
> FAGI exceeds **$50,000 single / $75,000 married**, and defines adjusted FAGI as federal AGI minus
> Title II benefits and other benefits taxed solely under IRC § 86. **Both figures and the taper
> mechanic confirmed; the audit was right.** The section's amendment history runs through 2026, c. 7
> and 2026 Sp. Sess. I, c. 1 — subdivision 5's figures are untouched by them.
>
> Two details the primary source carries that §2a did not, neither of which changes this release:
> subdivision 5.**a** grants the $12,000 with **no income test** to those born on or before 1 January
> 1939 (immaterial — such a person is 87+); and for **married filing separately** the reduction runs
> against the **combined** adjusted FAGI of both spouses over $75,000. The app does not model MFS,
> so the shipped note correctly speaks only to single and married.

| | note says | statute says | direction of the error |
|---|---|---|---|
| single threshold | ~$75,000 | **$50,000** | overstated by $25,000 |
| married threshold | ~$150,000 | **$75,000** | overstated by $75,000 |

The note tells the reader the limit bites far later than it does. That **compounds** the underlying
D-3c defect (the deduction is applied unconditionally) rather than mitigating it — both errors run
the same way, and the same way is optimistic.

Two further statutory facts the current note does not carry, both relevant to a reader:

- The reduction is a **continuous dollar-for-dollar taper**, not a band or a cliff.
- The income measure is **adjusted** FAGI — federal AGI **minus** Social Security and other benefits
  taxed solely under IRC §86. Virginia's income test therefore does not count Social Security.

⚠ **Not established, and deliberately excluded from this scope:** whether, for a couple where both
spouses claim $12,000, the reduction applies once against the combined $24,000 or separately to each
$12,000. Secondary sources disagree on where a couple's deduction reaches zero. **No dollar-exact
Virginia figure may be asserted until this is settled against Schedule ADJ**, and this scope asserts
none.

## 2. Site census — run, not grepped (§B1)

Measured against v5.57 by executing the matchers and walking the suite by AST.

| Question | Answer | How |
|---|---|---|
| Where is the string? | `STATE_RULES.VA.note`, one site | live read through the shim |
| Does any suite file assert VA text? | **No** — `t31` 0 hits, `t10` 0 `"VA"` assertions | AST/grep over `qa/` |
| Does `METHODOLOGY.md` state VA thresholds? | **No thresholds — but see the correction below.** ⚠ The justification originally given here, *"Virginia is not mentioned at all"*, is **FALSE** | corrected 2026-09-02 |
| Is the note rendered to the user? | **Yes** — `src/DangerClose.jsx` **L12137**, beside a clause generated from `excl65` itself | source read |

> ### ⚠ CORRECTION 2026-09-02 — this census row was wrong, and §4 rested on it
>
> **`METHODOLOGY.md` L152 names VA explicitly:** *"income limits on several exclusions (NJ, VA, RI
> approximated as unconditional)"*. The search that produced the original zero looked for the word
> **"Virginia"**; the document uses the two-letter code. That is the OPERATIONS §A0 failure repeating
> as a property of the search rather than of the searcher — a form-sensitive query returning a
> confident zero, with no output to sanity-check.
>
> **What it cost.** §4 excluded `METHODOLOGY.md` from this release *because of this row*, reasoning
> that there was "no creator-side copy to correct." There is. The direction of this error is the
> dangerous one: it removed a needed edit from a release rather than adding a spurious one, and it
> would have shipped a user-facing statutory figure with no creator-side counterpart — which is
> precisely the condition `t31` exists to prevent.
>
> **The creator-side sentence was not inaccurate** — VA's limit genuinely is approximated as
> unconditional — so no correction was owed to its *truth*. What was owed is the figure: it names the
> approximation without ever saying what the limit is, the same gap this release closes user-side.
> Resolved by decision below; `METHODOLOGY.md` §6 now carries the thresholds.

**⚠ The one real risk, and it is measured rather than assumed.** `t29_boundaries.mjs` **L212**
selects the D-3c guarded set with `/income[- ]limited|income limit/i` over the note. Rewriting the
note can silently drop Virginia from that set — the §B1a failure exactly, where a release rewrote
NJ's note and F-6's set fell from five members to four without failing.

**The proposed text was executed against the live matcher before this scope was written:**

```
current note matches F-6 : true
DRAFT   note matches F-6 : true
```

So the guarded set stays at **five** (NJ, NM, RI, VA, WI). This must be **re-executed against the
final approved wording**, not assumed from the draft.

**Two further whole-table assertions the new text must satisfy**, both in `t10` §2E:

- **L470** — every state with `excl65 > 0` names a dollar figure in its note (`/\$\d/`). The draft
  carries `$12K`, `$50K`, `$75K`. Holds.
- **L497** — a state with `ss: 0` must not claim Social Security is taxed. VA is `ss: 0`; the draft
  mentions Social Security only as an **exclusion** from the income measure and does not match
  `/\bss (is )?taxed|taxes social security/i`. Holds.

## 3. What this ships

**A · One string.** `STATE_RULES.VA.note`, replaced with wording that states the statutory thresholds
and the taper. Draft for approval — the exact text is decision **D-1**:

> `$12K 65+ age deduction, income-limited: reduced $1 for every $1 of adjusted federal AGI above $50K single/$75K married (the measure excludes Social Security); the model applies it unconditionally — overstates the deduction`

**B · A `t31` disclosure-parity key**, so the corrected copy is pinned and cannot silently revert.
⚠ `t31` matches **literal substrings**, so the key must be an exact substring of the shipped string
and **must be negative-controlled before it is believed** — the risk `SCOPE_v5_54_STATE_DISCLOSURE`
§3 named and the one that earns its keep here.

**C · Version bump to v5.58.** ⚠ **CORRECTED 2026-09-01 — this scope originally priced this as
"four in-app sites" and that was wrong**, in the same way and by the same factor as the v5.54 scope
the stop-report criticised. Four sites is the SOURCE cost. Measured with `qa/tools/vercensus.cjs`
against v5.57, the SUITE cost is **15 files to register the tag, 16 ladder entries, and 62 gated
expressions** — 78 judgement points, `t4` alone holding 21. The registries are fail-closed and halt
the suite with FATAL if missed; this was confirmed empirically by running `t1` against an
unregistered `v558`.

**This is the single largest line item in the release and it is not mechanical.** Each gate asks
whether v5.58 makes that assertion false; extending them blindly is the v5.28 defect applied 62
times. Budget the build accordingly — v5.54 halted mid-build on exactly this.

⚠ **Most of those 62 should be cheap for THIS release**, because §2's census found no suite file
asserts VA text and this release rewrites no DOM copy — but *cheap* is a prediction, and it must be
confirmed gate by gate rather than assumed. That assumption is what the v5.54 scope made.

**D · A negative control.** Revert the note and require the new `t31` key to fail. Per §B2 a green
suite is not coverage; the v5.57 rate assertion passed against a deliberately reverted build.

## 4. Explicitly out of scope

- **Any fix to the unconditional application of `excl65`.** That is the D-3c modelling change, it is
  a data-model change rather than a formula tweak (`AUDIT_STATE_EXCL65_ROUND3.md` §4), and it needs
  its own scope. This release corrects what the app *says*, not what it *computes*. Figures do not move.
- **Virginia's married-couple taper endpoint** (§1) — unresolved, and nothing here depends on it.
- **The other four members of the guarded set.** NJ's note is already accurate; WI is a separate and
  opposite-direction defect (D-B); NM and RI are unverified.
- ~~**`METHODOLOGY.md`.** It does not mention Virginia, so there is no creator-side copy to correct —
  verified, not assumed.~~ ⚠ **STRUCK 2026-09-02 — the premise was false (see §2).** `METHODOLOGY.md`
  L152 names VA. It is **IN SCOPE** and was edited: the existing clause now carries the statutory
  thresholds, verbatim in the form `$50K single/$75K married`, so the `t31` key has a creator-side
  half. This remains a disclosure release and §METHODOLOGY's *modelling* update rule still does not
  bite — the edit is disclosure parity, not a modelling change.

## 5. How it will be verified

1. Full suite, both legs, from a clean clone plus the prior source leg. Baseline to beat: **2,858 app
   checks, 0 failing**, parity **10/10**, measured 2026-09-01 at tree `742f77d`. Recompute, do not quote.
2. **Parity 10/10 is the hard line.** `STATE_RULES` is read by every engine. A drop means an engine
   diverged and is a stop, not a rebaseline — even though this release should move no figure at all.
3. Re-execute the F-6 matcher against the final wording and confirm the guarded set is still five.
4. Run the §3D negative control and confirm it fires.
5. `smoke_built` against the rebuilt `index.html`.

## 5b. BUILD RECORD — what was actually done, 2026-09-02

Source **v5.58** `6690b2c78953a7a4a1cee413d3523b59` · built `index.html` `ae9ac897595bba39785f8a6e04bd9e1a`
(built from the §N1 scaffold, `src/main.jsx` taken from the pool and **not** reconstructed).

| Verification | Result |
|---|---|
| Full suite, both legs | **2,864 app checks, 0 failing** (v5.57 leg 1,092 · v5.58 leg 1,092 · parity **10/10** · feature once 670) |
| Tooling | 82 (`t21` 50 · domdiff 32) · GRAND **2,946** |
| `smoke_built` vs the NEW artifact | **16/16**, including the `window.storage` round-trip (§N3 check 4) |
| F-6 guarded set | **5** before and after (NJ, NM, RI, VA, WI); re-executed against the string as recorded in §6, not the draft |
| Frozen v5.57 leg | replays **unchanged** at 1,092 — no new expectation leaked onto an old build (§B2 / the v5.27 defect) |

**Source diff: four lines.** `STATE_RULES.VA.note` (L1075) and the four version sites — two of which
are single characters inside the one-line `DOCS_HTML` blob. ⚠ That blob holds a **third** `v5.57`
string which is **prose recording what happened at v5.57** ("two figures were re-checked against the
legislatures themselves at v5.57"). It is history and was left alone; a substitution would have
rewritten it.

**Version-bump cost, re-derived not quoted:** `vercensus.cjs` → 15 files, 16 ladder, 62 gated, **78
judgement points**. All 78 landed: 16 ladder insertions, **2 version-string NEW ARMS** (`t1` `verStr`,
`t4` `_badge`), 60 gate-chain extensions. ⚠ `t1`/`t4`/`t5`/`t6` ladders end in the **retired `v592`
tag**, so v558 was inserted positionally — a blind append files it out of sequence. Zero gates
contained `&&`, so no precedence hazard; verified before editing rather than after.

### §3B — the t31 key, and why the scope's own §3B/§4 could not both hold

`t31`'s **C-0 is ungated**: every declared key must appear in `METHODOLOGY.md` on *every* leg. §3B
asked for a key while §4 forbade touching that file. Demonstrated rather than argued — a trial key
failed C-0 on both legs (`meth=false app=true docs=false`). Resolved by correcting §4's false premise.

**Key shipped: `$50K single/$75K married`**, gated `since: "v558"` with a pre-v5.58 branch so the
frozen leg pins its own truth. ⚠ **The key choice was measured, not chosen.** Against the realistic
future regression — thresholds reverted, surrounding prose intact — `reduced $1 for every $1`,
`adjusted federal AGI` and `overstates the deduction` **all still pass**. Only the figures catch it.
`income-limited` (8 hits at v5.57) and `unconditional` (4) are vacuous outright.

### §3D — the negative controls, all three firing

1. **Note fully reverted** → key fails (`app=false docs=false`). ✔
2. **Thresholds reverted, prose intact** — the regression the other candidates miss → key fails. ✔
3. **`METHODOLOGY.md` reworded to house style** (`$50,000 single / $75,000 married`) → **C-0 and the
   parity check both fail.** ✔ This is the trap the key's own comment warns about, and it fires.

Before the key existed, the §7 control was run and **744 checks across `t10`, `t29`, `t30`, `t31`,
`t4` and `t1` passed against a build with the wrong thresholds restored.** Without §3B this release
had literally no coverage — which is what made resolving the §3B/§4 conflict mandatory rather than
optional.

## 6. Decisions — RESOLVED 2026-09-02

**All four confirmed by the maintainer in session, and written here in the same session they were
given.** They were previously approved in conversation on 2026-09-01 and that approval was never
recorded, leaving this document reading *"do not build yet"* while a chat log held the answers — the
failure mode this project loses things to. The resolutions are below; the deliberation that produced
them is kept underneath, unedited, because a decision without its reasoning is the next thing to go
stale.

| | Decision | Resolved |
|---|---|---|
| **D-1** | Wording | **Approve the §3A draft as-is**, unchanged |
| **D-2** | Name the taper endpoint? | **No** |
| **D-3** | Ride with Wisconsin? | **No — ship alone** |
| **D-4** | Version | **v5.58** |

**The approved string, verbatim and final:**

```
$12K 65+ age deduction, income-limited: reduced $1 for every $1 of adjusted federal AGI above $50K single/$75K married (the measure excludes Social Security); the model applies it unconditionally — overstates the deduction
```

⚠ Re-execute the F-6 matcher against **this** string, not the draft as quoted elsewhere — they are
the same text and that is exactly the assumption worth spending one command to retire.

### The deliberation, as written before the decisions were taken

**D-1 · The exact wording.** The §3A draft is a proposal, not an approved string. It is long; the
note renders at 12px beside the `excl65` clause at L12137. *Recommendation: approve the draft or
shorten it, but keep the phrase `income-limited` — dropping it removes Virginia from `t29`'s F-6
guarded set, which is the §B1a trap this scope exists to avoid.*

**D-2 · Does the note name the taper's endpoint?** Saying where the deduction reaches zero would be
more useful to a reader than naming the threshold alone — but the couple's endpoint is unresolved
(§1). *Recommendation: no. State the threshold and the $1-for-$1 rule, which are certain, and omit
the endpoint until Schedule ADJ settles it. Naming a figure this project has not verified is how the
KY/DE round went wrong.*

**D-3 · Does this ride with Wisconsin (D-B) or ship alone?** Both are note corrections. *Recommendation:
ship alone.* WI's error runs conservative and VA's runs optimistic; bundling them means one CHANGELOG
entry reporting movement in two directions, and this project's disclosure discipline is per-direction.

**D-4 · Version.** Next is **v5.58** on the current sequence. Confirm, or reorder if the Wisconsin or
NM/RI work should land first.
