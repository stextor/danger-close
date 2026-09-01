# SCOPE — the allowlist that excused itself, and the pool's inverted scope shelf

| Field | Value |
|---|---|
| Status | **PARTIALLY SHIPPED at v5.57.1 — the pool cleanup is DEFERRED by decision D-3(b)** |

> ## ⚠ PARTIALLY SHIPPED — v5.57.1, 2026-09-01. Read this before acting on anything below.
>
> **Decisions resolved:** D-1(a) one release · D-2(a) all retired scopes leave the pool ·
> **D-3(b) a later dedicated pass** · D-4(a) re-home to `MissingFeatures.md` ·
> **D-5(fold in)** the ops-gate items.
>
> **SHIPPED at v5.57.1:** both stale allowlist entries removed and the two scopes retired by
> content; the content-check rule recorded where the list lives; `package_check` gained **G-2**
> (the new-file case G-1 structurally cannot see), **`KIND: handover`**, and **section J**, a
> post-ship pool verification.
>
> **STILL OPEN — this is the whole of what remains:** the pool cleanup. §1b's inversion has
> **deepened** since this was written — measured 2026-09-01 the pool holds **20 retired scopes to
> 3 open**, against 15/2 at v5.53, and `SCOPE_v5_40_disclosures_and_mechanics` and
> `SCOPE_FIX_tidyup_six` are *still* absent from it. All 20 retired pool scopes also exist in the
> repo, so deleting the pool copy loses no content — but **all 20 carry decision language**, so
> §G's read is not optional. That read is the deferred work and it is a session of its own.
>
> ⚠ **One premise below is now WRONG and is corrected here rather than edited away:** §1a says the
> allowlist holds four entries. It held five by v5.57 — it gained this scope itself — and holds
> three after v5.57.1.
| Written | 2026-08-28 |
| Against | **v5.53** · `src/DangerClose.jsx` `12a007ed8e57a391acba67b799eb5a2f` · repo HEAD `46cc14a` |
| Shape | **Documentation and tooling only.** No `src/` change. No version bump. No figure moves |
| Freshness (§A/§A2) | Run this session against a fresh clone at `46cc14a`; source, built artifact and manifest all agree |

---

## 1 · Premise — verified this session, and one half is my own error

**1a · Two of the four entries on `package_check`'s OPEN allowlist are stale.** The allowlist shipped
at `46cc14a` holds four names (L427–430). Two of them name scopes whose work is **already shipped**:

| Allowlisted as open | Actually |
|---|---|
| `SCOPE_v5_40_disclosures_and_mechanics.md` — *"SCOPE ONLY, open decisions in its §7"* | **Fulfilled at v5.40.** All five premises resolved — verified below |
| `SCOPE_FIX_tidyup_six.md` — *"three decisions open in its §7"* | **Fulfilled across v5.42–v5.47.** All seven items shipped; all three decisions resolved by events |

**How they got there is the finding.** They were placed on the allowlist on the strength of
`SESSION_BRIEF_v5_54_hygiene.md`'s classification, **without the content check** — in the release
whose whole lesson is that a status line is evidence of what was true when it was written, and whose
own `OPERATIONS.md` §I text says exactly that. The brief even flagged the v5_40 row as one to read
first. **§I-2 would have caught both. The allowlist excused them.**

That is not an argument against having an allowlist — without one the sweep is noise, and noise gets
ignored, which is the `VERIFY.sh` failure by another road. It is an argument that **an allowlist
entry needs the same content check a retirement does**, and that the check must say so where the
list lives.

**1b · The pool's scope shelf is inverted.** `OPERATIONS.md` §G says project knowledge carries
*active* scope docs. Measured this session:

```
pool:  15 retired scopes,  2 open   (SCOPE_STATE_FIXTURES, SCOPE_STANDING_AUDIT)
repo:  28 scopes total
```

Two of the four scopes that read live — `SCOPE_v5_40_disclosures_and_mechanics` and
`SCOPE_FIX_tidyup_six` — **are not in the pool at all.** So a session working from project knowledge
is shown fifteen dead documents and cannot see half the live work. Exactly backwards. *(After the
retirements in §3 both of those become dead too, which is why this is one release and not two.)*

## 2 · Site census — every claim below printed by a command this session

**The two retirements, verified by content against v5.53, not by version heading:**

| Scope | Premise | State at v5.53 |
|---|---|---|
| `v5_40` S-1 | IRMAA tab named five MAGI components, Engine C summed seven | v5.40 entry names this defect verbatim |
| `v5_40` S-3 | `METHODOLOGY.md` says Engine B defaults gains to $0 in the present tense | now reads *"through v5.35"* — past tense, L729 |
| `v5_40` D-6 | SSA-44 covers survivor only; work stoppage undisclosed | closed v5.49; `t31` asserts both keys |
| `v5_40` F-2/F-8 | fixed-pixel grids outside any scroll wrapper | `t30` C-2 asserts every grid sits in an `overflowX` wrapper |
| `v5_40` F-6 | money fields are bare inputs | **48** `inputMode` attributes present |
| `tidyup_six` 1–7 | seven modelling corrections | 1→v5.42 · 2→v5.46 · 3→v5.44 · **4 and 7→v5.45** (*"the two places that dropped it"*) · 5 and 6→v5.47 |
| `tidyup_six` D-1/D-2/D-3 | three open decisions | D-1 resolved in the document · D-2 by v5.43's Engine C §86 · D-3 by item 5 at v5.47 |

⚠ **The v5_40 row is the mirror of the v5.34 case and both belong in the record.** At v5.34 the
version heading was *misleading* — the release narrowed and the work landed at v5.36. At v5.40 the
heading is *accurate*. The lesson is not "headings lie"; it is **read the content either way**.

**The pool deletions — screened, not assumed.** §G requires checking for **unresolved decisions**
before removing anything, because a `CHANGELOG` records what shipped, which is precisely what an
open question is not. The prescribed grep (`no recommendation`, `awaiting`, `open decision`,
`for steve`, `unresolved`) was run over all 15:

```
13 of 15 return at least one hit.   2 screen clean:
   SCOPE_D10_MODELLING_v5_53.md · SCOPE_FIX_realized_capital_gains_v5_32.md
```

Spot-checking two of the hits shows the screen cannot tell a resolved decision table from a live
one: `SCOPE_OPS_PROCESS_FIX.md` hits on a `## 5. Open decisions` heading whose contents are
resolved, while `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` D-C — *"if the fix turns out to be large, is it
in the product boundary at all?"* — reads like a live product question.

**So the screen is a candidate finder, not a resolver — the same shape as §I-2, and it takes the
same answer: a person reads them.** ⚠ **This is thirteen documents of careful reading, not a
sweep.** Budget it as such, or do not start. `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` was deleted on
2026-08-26 after a correct check that what it *built* survived — and it carried **D4, an open
product-voice decision marked "no recommendation offered"** that nothing else held. It was recovered
from git history and re-homed as `MissingFeatures.md` D-10. That is the failure this step exists to
prevent, and it has happened once already.

## 3 · What this ships

1. **Retire** `SCOPE_v5_40_disclosures_and_mechanics.md` and `SCOPE_FIX_tidyup_six.md` in place
   (§I idiom: keep the body, annotate the status, leave the wrong recommendation visible beside its
   correction).
2. **Cut the OPEN allowlist from four entries to two**, and add a line at the list telling the next
   session that an entry is a claim with the same expiry as a status line — the omission that put
   the two stale names there.
3. **Remove the retired scopes from the pool**, keeping them in the repo (§G: deletion is defensible
   only when the outcome is preserved elsewhere, confirmed by command — the repo is that place).
   **Three-place operation**: repo keeps, pool drops, manifest row annotated.
4. **Any open decision found in step 2's reading gets re-homed before its document leaves the pool**,
   named explicitly in the release notes — not summarised.

## 4 · Tests

No new suite. The mechanism already exists and this release is its first real exercise:

- **`package_check` §I-2** turns red the moment a scope is neither retired nor allowlisted. After
  this release it should be green with a **two-entry** list, and the release is not done until it is.
- **`package_check` §I-3** turns red if the allowlist names a scope that no longer exists.
- **Controls P24–P27** already cover marker-stripping, new unclassified scopes, stale allowlist
  entries, and the false-positive case. **No new control is needed and none should be invented** to
  make this release look better tested than it is.
- ⚠ **This scope is itself an open scope, so §I-2 will flag it until it is retired.** It must be
  added to the allowlist in the same package that adds the document — which is the discipline
  working, and is the reason §I-2 reads the post-ship tree rather than the committed one.

## 5 · Explicitly out of scope

- Any `src/` change, any version bump, any figure. The app stays at **v5.53**.
- `SCOPE_STATE_FIXTURES.md` — genuinely open, four decisions in its §5, premise re-verified at v5.53
  (**one** fixture sets `stateCode: "GA"`, eleven set `null`; 50 of 51 jurisdictions unexercised).
  It stays on the allowlist. ⚠ Its D4 names **v5.50** as the target version and is stale.
- `SCOPE_STANDING_AUDIT.md` — not a build scope (§K). Stays on the allowlist, permanently.
- The D-10 residual, `KIND: handover`, `validation/deep_test`'s crash, and §C1's jsdom duplication.
  All real, none of them this.

## 6 · Open decisions — Steve

| | Decision | Options | Recommendation |
|---|---|---|---|
| **D-1** | Do the two retirements and the allowlist fix ship **now**, or wait and ride with the pool cleanup? | (a) one release · (b) allowlist fix first, pool cleanup later | **(a) one release.** The allowlist is wrong in shipped code today; splitting means two packaging cycles for four edits |
| **D-2** | How far does the pool cleanup go? | (a) all 15 retired scopes leave the pool · (b) only the 2 that screen clean · (c) leave the pool alone | **(a)**, conditional on D-3. (b) is the worst of both — the work of reading without the benefit |
| **D-3** | Who reads the 13, and when? | (a) this release, fully · (b) a later pass, cleanup deferred · (c) skip the read and delete anyway | **(a) if the budget is there, (b) if not. NEVER (c)** — that is precisely how D4 was nearly lost |
| **D-4** | Re-home found decisions where? | (a) `MissingFeatures.md`, as D4 was · (b) a new register · (c) case by case | **(a).** It already holds one rescued decision and is already read |

**Nothing builds until §6 is resolved.** If evidence contradicts §1 or §2 mid-build, stop and report.

## 7 · Honesty statement

Every count, hash, file state and line number above was printed by a command on 2026-08-28 (§A0).
The retirement verdicts in §2 were reached by reading what each release **shipped** and comparing it
to what the scope **proposed** — never from a version heading, which §2 shows failing in one
direction at v5.34 and holding in the other at v5.40. §1a is a plain account of my own error: I
built the allowlist and populated two of its four entries from a document instead of from the tree,
in the release that exists to stop exactly that.
