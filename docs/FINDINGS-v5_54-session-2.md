# FINDINGS — v5.54 build session 2, 2026-08-29

**Nothing ships from this session.** v5.53 remains current at `12a007ed8e57a391acba67b799eb5a2f`.
The working source is still `7f42dbf98125ce1425fdabe968b92c96` and has still never been through the
suite. This document records three findings and one corrected claim. `KIND: ops`.

---

## 1 · WORKSPACE DRIFT — phantom edits, third recorded instance

**What happened.** At 11:03:18 UTC, 14 files in the session run folder were modified. I did not make
those edits. No `str_replace`, `create_file` or writing bash command in this session targeted them,
and the two scripts running at that time (`_strings_ast.cjs`, `_f6.cjs`) only read.

**Extent — measured, not estimated.**

| | |
|---|---|
| Files modified | **14** — every suite file carrying a `VER === "v553"` gate |
| Lines changed | **61** |
| Lines mentioning `v554` | **61 of 61** |
| Per file | t1 18 · t4 21 · t5 3 · t24 3 · t31 3 · t25 2 · t26 2 · t28 2 · t6 2 · t23 1 · t27 1 · t30 1 · t32 1 · t3 1 |

**What the edit did.** The blind transform `VER === "v553"` → `VER === "v553" \|\| VER === "v554"`,
applied to **61 of the 62 gates** — every one except `t31`'s `POST` at L218, which the previous
session had already rolled legitimately. Sample, from `t32_ladder_dividend.mjs`:

```
33c33
< const POST = VER === "v553";
---
> const POST = VER === "v553" || VER === "v554";
```

**Why this matters more than the usual drift case.** This is precisely the transform
`STOP-REPORT-v5_54-session-budget.md` §3 exists to forbid — *"a blind `"v553"` → `"v553" || "v554"`
transform asserts v5.53's expectations for v5.54... the v5.27 defect that OPERATIONS §B2 exists to
prevent, applied 62 times."* The edit is the documented anti-pattern, executed in full, in the
workspace, unreviewed.

It also matches the decisions I had *described* in the previous chat message but had **not applied** —
the same "proposed-but-unapplied changes" signature the project instructions record from the two
earlier instances.

**It would probably have gone green.** That is the danger, not a mitigation. Most of the 61 are
decisions I would have reached by reading anyway, so a suite run would very likely have passed and
the release would have shipped 61 unreviewed gate edits on a green number.

**Action taken.** All 14 diffs quarantined, then all 14 files reverted to the `workbench/` originals
and re-verified by md5. The run folder now matches the handover state exactly. The only `v554` gate
in the tree is `t31` L218, which is legitimate. **Nothing from the phantom diff has been kept.**

**Not affected.** `v553.jsx` (`12a007ed…`), `v554.jsx` / `DangerClose.jsx` (`7f42dbf9…`) and
`METHODOLOGY.md` were untouched. The baseline runs below all completed **before** 11:03 and are
therefore measurements of the un-drifted tree.

---

## 2 · A §B1 LAPSE OF MY OWN, AND WHAT FIXING IT FOUND

`OPERATIONS.md` §B1: *"A grep is not an answer to 'how many sites?' or 'where is this used?' ...
AST resolution has not been wrong. Run the tool and cite its output."*

I used greps for exactly that shape of claim. The load-bearing one was **"grepping the whole suite
for every string v5.54 removes returns zero hits"** — the basis for concluding the §B2 stale-copy
lock risk does not arise this release. Three ways that grep was unsound:

- **Case-sensitive.** I searched `INCOME-LIMITED`; the suite's matcher is `/income[- ]limited/i`.
  This is the §A0 recorded failure verbatim — *"it was case-sensitive; the most prominent site was
  capitalised and missed."*
- **Blind to template literals**, which the suite uses heavily.
- **Cannot execute a regex.** The suite matches copy with regex literals. A grep can at best find
  them; it can never answer *"does the new note still match this pattern?"* — which is the only
  question that matters.

**Redone properly.** AST-extracted **7,514** string, template and regex nodes from **32** suite
files, then *executed* every regex literal against the old and new text of all four rewritten notes
and the caption. That produced 12 candidates; reading them resolved to one real finding, one
confirmed no-change and three false positives (number-formatting `/,/g`, and `t20`'s account-name
matcher, which never sees a state note).

STATE_RULES was then resolved by AST on both builds — 51 entries each — rather than by reading the diff.

## 3 · THE REAL FINDING — `t29` F-6 is one member closer to vacuous

`t29_boundaries.mjs` L174-177 is the empty-set guard for the D-3c boundary row, and its own comment
says it *"is the one that would have failed quietly."* It counts STATE_RULES entries with
`excl65 > 0` whose note matches `/income[- ]limited|income limit/i`:

| build | matches | states |
|---|---|---|
| v5.53 | **5** | NJ, NM, RI, VA, WI |
| v5.54 | **4** | NM, RI, VA, WI |

The rewritten NJ note drops the phrase. **F-6 asserts `length > 0`, so it still passes** — this is a
near-miss, not a failure, and no gate decision changes because of it.

But the guarded set is now four, and the four survivors are exactly the states the **D-3 verification
work will reword next**. Rewording NM, RI, VA and WI in the same house style takes F-6 to zero, and
at that point `state_excl_limited` can never read ON and every assertion about it passes vacuously.
`t29` is **ungated**, so this bites on every leg. Worth carrying into `SCOPE_D3_NJ_EXCL_DOLLAR_EXACT.md`
as a constraint on how those notes may be worded, or F-6 needs a different predicate.

**Two related checks, both confirmed clean on both builds by the same AST pass:**

- `t10` §2E dollar-figure check — 19 entries with `excl65 > 0`, **0** without a `$` figure on either
  build. The stop-report §1 decision to *date* the MD/ME figures rather than drop them was correct,
  and this is the command that proves it.
- `t10` L489 partial-SS note check — 8 partial-SS states, **0** notes missing an SS mention, both
  builds. CO's rewritten note keeps the token.
- The §13 copy's claim of **"nineteen states"** carrying a 65+ exclusion is **accurate** — 19
  entries with `excl65 > 0`, counted by AST.

---

## 4 · CORRECTION TO MY PREVIOUS REPORT

I reported *"t1 L230 `verStr` and t4 L65 `_badge` — not extensions but new ternary arms."* The
**decision stands and is correct**, but I then described it as outstanding work. By the time I
re-read those lines the phantom edit had already applied them, and for one exchange I had two
commands from this session disagreeing about the same line without saying so. Resolving that
contradiction is what exposed the drift. Both arms are now reverted and remain **to be applied
deliberately**.

---

## 5 · VERIFIED STATE AT END OF SESSION

**Freshness (§A).** Pool, repo `7c09891` and manifest agree. 108 pool files MATCH; the two
path-mapped files resolve and match. **One drift: the pool's `package_check.mjs` is two lines behind
the repo's**, missing the `SCOPE_v5_54_STATE_DISCLOSURE.md` OPEN-allowlist entry. Repo is current and
is the build input, so the direction is safe — but it needs refreshing, and it is the same entry the
definition of done requires deleting at the ship.

**Baselines, from suite output, on the un-drifted tree.**

```
v553 leg — GREEN:  t1 185 · t2 35 · t3 36 · t4 252 · t5 58 · t6 21 · t10 163
v554 leg — t1 59 passed, 23 failed
```

The v554 failures are gates falling through to pre-v5.10 expectations because v554 is registered in
no gate. Expected, and not a source defect.

**Source delta, measured.** Four STATE_RULES notes (CO, ME, MD, NJ) with **every numeric field
unchanged** — `rate`, `ss`, `retExempt`, `excl65` identical on all four; the state-selector caption
head and tail; the Field Manual §13 state bullet; four version sites. v5.53's 6 occurrences → 4
bumped, 2 correctly left (code comment, prose about v5.53). No engine or constant moves.

**Gate decisions reached by reading** (not applied — the workspace must be re-derived clean):

| gate | decision |
|---|---|
| t1 L230 `verStr`, t4 L65 `_badge` | **new ternary arm** `v554 → "v5.54"`. Confirmed by reading that t1's four STATIC assertions interpolate `${verStr}`, so the arm fixes all four — closes stop-report §4 item 2 |
| t1 L252 · L316 · L352 · L491 | EXTEND — HEIR_RATE, the v5.53 D-10 modelling pins, D-7 estate labels, Roth-tab MAGI term set. All untouched by v5.54 |
| t1 L28-38, L66, L97, L802 · t3 L122 · t23-t28 · t30 · t32 | EXTEND — behavioural and constant flags |
| t31 L218 | already rolled, legitimately |
| t31 L298 · L309 · L332 | EXTEND — estate and D-10 disclosure, untouched |

⚠ The inventory flagged t1 L316 and L491 as *"DECIDE — touches state copy."* Both are engine-expression
pins with no state copy in them. My own detector false-positived on the same two, on `v5.53` in
comment prose. **Reading is what decided; neither heuristic would have.**

**Still to decide:** t4's remaining ~15, t5's 3, t6's 2.

---

## 6 · WHAT THE NEXT SESSION MUST DO DIFFERENTLY

1. **Re-derive the run folder from the zip's `workbench/` and hash every file before and after each
   deliberate edit.** Do not assume a workspace file is what you last read it as. This session had
   two commands disagree about one line; that disagreement was the only symptom.
2. **Apply gate decisions one at a time, each with a recorded reason**, and re-hash. A file that
   changes without an edit is a stop condition, not a convenience.
3. **Do not reuse the quarantined diff.** It does not survive the session and must not be
   reconstructed. It is evidence, not work product — and 61 of its 61 lines are the forbidden
   transform.
4. **Prefer `qa/tools/` AST resolution over greps for every census claim**, per §B1 — including
   claims about the *suite*, not only the app source. The extraction harness written this session
   (`_strings_ast.cjs`) does not survive either; it is ~20 lines of acorn walk and is cheap to
   rewrite, but note it must live inside a directory where `acorn` resolves.

## 7 · A PROCESS GAP THIS IS NOW THE NINTH INSTANCE OF

`package_check` still accepts only `KIND: app-release|ops` and fails closed. This document is
neither — it is a findings note from a session that shipped no source. Recorded again rather than
worked around.
