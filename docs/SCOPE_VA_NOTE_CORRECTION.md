# SCOPE — Virginia's note states the wrong income thresholds

| Field | Value |
|---|---|
| Premise verified against | **v5.57** · source `0daebb4af466b9095db79117daefcd32` · tree `57575c6` |
| Written | 2026-09-01 |
| Origin | `AUDIT_STATE_EXCL65_ROUND3.md` §2a; decision **D-C** of its §6 |
| Shape | **Disclosure only. One string. No figure moves. No engine change.** |
| Status | **AWAITING DECISIONS in §6 — do not build yet** |

---

## 1. Premise, verified against the statute and against the build

**The modelled note is wrong, and wrong in the optimistic direction.**

`STATE_RULES.VA.note` currently reads:

> `$12K 65+ age deduction (income-limited above ~$75K/$150K; approximated as unconditional)`

**Va. Code § 58.1-322.03(5):** the $12,000 age deduction for individuals born after 1 January 1939
who have attained 65 is reduced **$1 for every $1** that adjusted federal adjusted gross income
exceeds **$50,000 single / $75,000 married**.

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
| Does `METHODOLOGY.md` state VA thresholds? | **No** — Virginia is not mentioned at all | search of the file |
| Is the note rendered to the user? | **Yes** — `src/DangerClose.jsx` **L12137**, beside a clause generated from `excl65` itself | source read |

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

**C · Version bump**, four in-app sites (footer, DATA LOAD header, Field Manual callsign, Field
Manual footer), asserted by `t1` STATIC.

**D · A negative control.** Revert the note and require the new `t31` key to fail. Per §B2 a green
suite is not coverage; the v5.57 rate assertion passed against a deliberately reverted build.

## 4. Explicitly out of scope

- **Any fix to the unconditional application of `excl65`.** That is the D-3c modelling change, it is
  a data-model change rather than a formula tweak (`AUDIT_STATE_EXCL65_ROUND3.md` §4), and it needs
  its own scope. This release corrects what the app *says*, not what it *computes*. Figures do not move.
- **Virginia's married-couple taper endpoint** (§1) — unresolved, and nothing here depends on it.
- **The other four members of the guarded set.** NJ's note is already accurate; WI is a separate and
  opposite-direction defect (D-B); NM and RI are unverified.
- **`METHODOLOGY.md`.** It does not mention Virginia, so there is no creator-side copy to correct —
  verified, not assumed. This is a disclosure release, so §METHODOLOGY's update rule does not bite.

## 5. How it will be verified

1. Full suite, both legs, from a clean clone plus the prior source leg. Baseline to beat: **2,858 app
   checks, 0 failing**, parity **10/10**, measured 2026-09-01 at tree `742f77d`. Recompute, do not quote.
2. **Parity 10/10 is the hard line.** `STATE_RULES` is read by every engine. A drop means an engine
   diverged and is a stop, not a rebaseline — even though this release should move no figure at all.
3. Re-execute the F-6 matcher against the final wording and confirm the guarded set is still five.
4. Run the §3D negative control and confirm it fires.
5. `smoke_built` against the rebuilt `index.html`.

## 6. Open decisions — build only after these are resolved

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
