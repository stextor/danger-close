# SCOPE — three housekeeping items: D-10's stale row, `t21` coverage, the 42 missing md5 rows

| Field | Value |
|---|---|
| Premise verified against | **v5.58** · source `6690b2c78953a7a4a1cee413d3523b59` · tree `2c3ebc9` |
| Written | 2026-09-02 |
| Status | ◑ **ITEMS A AND C BUILT AND SHIPPED 2026-09-07. ITEM B REMAINS OPEN, on a CORRECTED premise.** All five §5 decisions answered: **D-1 split**, **D-2 build it**, **D-3 six documents rowed and the rest named as deliberately unrowed**, **D-4 no self-row**, **D-5 the command with a dated measurement beside it**. ⚠ **D-B-1 resolved 2026-09-07 as (c) then (a):** §2’s *"three tools added at v5.58"* is wrong — **it is NINE**, four of them predating v5.58 and one postdating it, and **six cannot be reached by a `.jsx` fixture at all.** See the banner in §2. **This scope stays on `package_check`’s I-2 OPEN allowlist** until Item B builds. *(Superseded: "AWAITING DECISIONS in §5 — do not build yet.")* |
| Shape | **Item A** documentation · **Item B** a real build with new checks · **Item C** documentation, mechanically generated |
| Premises re-checked | **2026-09-07** by the third scope-status sweep, against v5.65 `7604fac5dab891bb31905544d11072f8`, repo `2c20873`. **A was TRUE and is worse than stated · B was TRUE · C's numbers were WRONG.** See the banner below |

> ## ⚠ PREMISE RE-CHECK, 2026-09-07 — nothing here is built; two items are confirmed and one was wrong
>
> The handover into that session recorded Items A and B as **unverified** and Item C as carrying a
> stale figure. All three were checked. **No item was built and no decision was resolved** — that is
> still gated on §5.
>
> | | Verdict |
> |---|---|
> | **Item A** — `MissingFeatures.md` D-10 advertises a fix as open | ✅ **TRUE, and worse than §1 states.** Still stale on the live tree twelve releases after v5.53 |
> | **Item B** — `t21` does not cover the tools added at v5.58 | ✅ **TRUE.** The three tools appear in `t21_tools.mjs` **zero times** |
> | **Item C** — "42 pool files carry no md5 row" | ❌ **WRONG. It is 37**, and §3's *"107 files, 72 rows"* is wrong too |
>
> ⚠ **A live scope reasoning from a wrong number is the failure §2 of
> `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` demonstrates on itself** — the number that would have
> justified a deletion was wrong by a factor of thirteen. Item C's figure has now gone stale **twice
> in five days**. That is what **D-5** is about.

**Why one scope for three items.** They were raised together and they share a destination, but they
are **not one job** — B changes the check count and A and C do not, and B alone needs negative
controls. §5 asks whether to split them. **Read §4 before assuming they ship together.**

---

## 1 · Item A — `MissingFeatures.md` D-10 advertises a fix as open

**Verified against source, not recalled.** D-10's row (L810) states that the Roth tab's IRMAA MAGI
omits *"dividends and realized capital gains"* and calls the modelling half open, pointing at
`SCOPE_FIX_roth_tab_div_capgain.md` as **"NOT BUILDABLE, four decisions open."**

Read by AST on the shipped v5.58 source:

| | line | expression |
|---|---|---|
| Engine C | 4491 | `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` — **7 terms** |
| Roth tab | 9047 | `pension + spouseBWork + taxableSS + conv_y + rmd_y + _divLadder` — **6 terms** |

**The dividend term landed.** `_divLadder` is present. v5.53 shipped the modelling half in part, and
`t31`'s v5.53 key (`counts the taxable sleeve's dividends`) records it. D-10's row is stale in the
direction that matters: it advertises work as outstanding that is done, which is how a register stops
being trusted.

**What is genuinely still open**, and the corrected row must say exactly this and no more:

- **`capGain_y` is absent** from the ladder expression — and its absence is a **resolved decision**
  (`SCOPE_D10_MODELLING_v5_53.md` D-2), not an oversight. A register entry must not re-open a settled
  call; that is what D-10's own ⚠ warns about.
- **The earned-income term is narrower** — `spouseBWork` against Engine C's `work_y`. Narrower by
  scope, per the same release.
- Direction remains **optimistic**: omitting income terms understates MAGI and the IRMAA trigger.

⚠ **`SCOPE_FIX_roth_tab_div_capgain.md` is SUPERSEDED and was never built** — established by the
2026-09-01 pool read, which confirmed its four decisions resolved in `SCOPE_D10_MODELLING_v5_53.md`.
D-10 still cites it as the live route. **That pointer is stale too** and must be repointed in the
same edit, or the row sends a reader to a superseded document.

**Sites: 1** (`MissingFeatures.md` L810). No suite asserts D-10's text — **to be confirmed by AST
before editing**, not assumed; use `qa/tools/suite_regex_probe.cjs`.

> ### ✅ VERIFIED 2026-09-07 — still stale, and stale in three ways rather than one
>
> Re-read on the live tree at v5.65 (`2c20873`). **The row is at L815, not L810** — it moved when
> D-11 was written; find it by the string `| **D-10** |`, not by line. Everything §1 above says
> about it holds, and there is one more error than §1 records:
>
> 1. *"MODELLING HALF STILL OPEN"* — half of it shipped at **v5.53**, 2026-08-28.
> 2. *"dividends and realized capital gains remain absent"* — dividends are present as `_divLadder`.
> 3. It points at `SCOPE_FIX_roth_tab_div_capgain.md` as *"NOT BUILDABLE, four decisions open."*
>    That document is **SUPERSEDED and was never built**; the live successor is
>    `SCOPE_D10_MODELLING_v5_53.md`, which shipped.
> 4. ⚠ **Not recorded in §1:** it also describes the Roth tab as *"**five** (L8997)"* terms. It is
>    **six** since v5.53, and that line number is dead too.
>
> **So the corrected row must fix four things, not three.** ⚠ And it must say — as §1 already
> insists — that `capGain_y`'s absence is a **resolved decision**, not an oversight. A register that
> re-opens a settled call is the failure D-10's own warning is about.
>
> **Not corrected here.** Correcting it *is* Item A, and Item A is gated on **D-1**.

## 2 · Item B — `t21` does not cover the three tools added at v5.58

`qa/tools/vercensus_list.cjs`, `f6_probe.cjs`, `suite_regex_probe.cjs` shipped at v5.58 as uncounted
tooling. `t21` covers the original four (`funcmap`, `census`, `diverge`, `residual`) against
`qa/tools/fixture/fixture.jsx`, 50 checks, negative-controlled six ways.

**Why this matters and is not bookkeeping.** §B1 sells an unexpected tool result as *a finding on its
own — provided `t21` is green*. That warrant does not extend to the three new tools, so today they
produce numbers with no standing. `t21` exists because the original four **were** wrong in ways only
a purpose-built fixture caught. These three do the same class of work with none of that scrutiny.

**They were hand-controlled once**, which is evidence and not coverage: `vercensus` returns 63 for
v556 against 62 for v557 and refuses an unknown tag; `f6_probe` drops the guarded set to four when
`income-limited` is removed and trips `t10` L497 on a note claiming SS is taxed; `suite_regex_probe`
surfaced seven candidate matchers of which all seven proved false positives on reading. **A control
run once is not a suite.**

**What this ships.** New `t21` cases for each tool, expectations **hand-counted from the fixture
first** and adjudicated by reading where tool and hand disagree — never by editing the expectation
until it matches. Negative controls that fire per tool.

⚠ **`fixture.jsx`'s line numbers are load-bearing. Add cases at the END only.**

⚠ **`f6_probe` and `suite_regex_probe` do not take `DangerClose.jsx` as their subject** — one reads
`STATE_RULES` and executes a regex against candidate strings, the other walks the `qa/` suite. The
existing fixture may not exercise them at all. **Establish what each tool's subject is before
designing a case**; a fixture that cannot reach the behaviour makes every assertion about it vacuous,
which is the §B2 failure this suite was written to prevent.

⚠ **This changes the check count** (`t21` 50 → higher), which cascades into `CHANGELOG.md`,
`TESTING.md` and the manifest. **No version bump** — the app source does not change, so this is an
`ops` package and none of §5's 78 judgement points apply.

> ### ⚠ PREMISE CORRECTED 2026-09-07 (D-B-1 (c)) — IT IS NINE TOOLS, NOT THREE

> §2 above says *"the three tools added at v5.58."* **Measured from a FULL-history clone (750
> commits) rather than a shallow one, and by a crisp definition — tools that parse with `acorn`, the
> class §B1's warrant actually covers — `t21` fails to reach NINE:**
>
> | Not covered by `t21` | First committed | |
> |---|---|---|
> | `copylock.cjs`, `lits.cjs`, `notes_probe.cjs`, `vergates.cjs` | 2026-08-31 | pool |
> | `f6_probe.cjs`, `suite_regex_probe.cjs`, `vercensus.cjs`, `vercensus_list.cjs` | 2026-09-01 | mixed |
> | `state_rows.cjs` | 2026-09-04 | repo-only |
>
> `t21` covers `census.cjs`, `funcmap.cjs`, `diverge.cjs` and `residual.cjs`, all committed
> 2026-08-10.
>
> ⚠ **The dating was wrong in BOTH directions, which is why the count could not be right.** Four of
> the nine **predate** v5.58 — they arrived 2026-08-31, around v5.57 — and one **postdates** it by
> three days. §2 named a three-shaped slice of a nine-file set and dated all of it to one release.
>
> ⚠ **THE HARDER HALF, AND IT IS WHY THIS ITEM IS NOT BUILT.** §2 already warned that `f6_probe` and
> `suite_regex_probe` *"do not take `DangerClose.jsx` as their subject"* and that the fixture may not
> exercise them. **That is true of SIX of the nine**, read from their own usage lines: `copylock`
> takes two sources plus suite directories; `lits` takes numbers and directories; `suite_regex_probe`
> takes two text files and directories; `vercensus` and `vercensus_list` take a version tag and
> directories. **`f6_probe` is the only clean fit for a `.jsx` fixture.**
>
> `qa/tools/fixture/fixture.jsx` is one `.jsx` file. **Extending it does not reach six of the nine** —
> they need a purpose-built *directory* fixture, and a shared one would have to satisfy a
> suite-walker, a text-differ and a version-tag census at once. That is a second fixture KIND with
> its own negative controls, plus an unanswered question about whether repo-only tools belong in a
> pool-facing suite at all.
>
> **This is exactly the stop condition D-2 named:** *"if the fixture work turns out to need its own
> design, STOP and report rather than writing thin cases to reach a number."* It was reported, not
> worked around.
>
> **D-B-1 resolved 2026-09-07: (c) then (a).** Correct the premise first — this note — then build
> coverage only for the tools the existing fixture can actually reach, and **disclose the rest in
> `TESTING.md` rather than covering them thinly.** The directory-fixture work is a separate scope if
> it is ever wanted.
>
> ⚠ **`t21`'s check count will therefore rise by less than §2 implies**, and `TESTING.md` will carry
> a named list of uncovered tools rather than silence. A suite that says what it does not cover is
> worth more than one that appears to cover everything.

> ### ✅ VERIFIED 2026-09-07 — the gap is real and unchanged
>
> Read on the live tree at v5.65. **`qa/t21_tools.mjs` references `funcmap`, `census.cjs`, `diverge`
> and `residual` and nothing else.** `vercensus_list.cjs`, `f6_probe.cjs` and `suite_regex_probe.cjs`
> occur in it **zero times**. All three exist in `qa/tools/`. §B1's warrant does not reach them, as
> §2 says.
>
> ⚠ **ONE THING THIS SESSION COULD NOT SETTLE, recorded rather than assumed.** §2 says *"the three
> tools added at v5.58."* `qa/tools/` now holds **39 entries**, and a `--depth 1` clone carries no
> history to date them against. **Whether three is still the right number, or is the number as of
> v5.58, is UNKNOWN.** Resolve it before building — with a full-history clone, not by inspection —
> because a scope that ships coverage for three tools when five need it produces exactly the partial
> green §B2 exists to prevent. This does not change **D-2**; it changes the size of the answer to it.

## 3 · Item C — the pool files that carry no md5 row

> ### ❌ THE FIGURE BELOW IS STALE. Corrected 2026-09-07 — and this is the second time.
>
> **Measured against the live pool on 2026-09-07 with K-8's own regex** (not a hand count, not a
> grep): **110 pool files · 73 hashed rows · 37 files with no row · 0 stale · 0 ghost · 0 unlisted.**
>
> The number moved because the four ops packages of 2026-09-07 added rows. It had already moved once
> before that: §3's own header and first line disagree with each other's vintage. **The figure in
> this item has now been wrong twice in five days**, which is the whole of **D-5** below.
>
> **Derive it, do not read it.** The command is in §3a; it is the same expression `package_check`'s
> K-8 uses, so it cannot drift from the gate:
>
> ```bash
> node --input-type=module -e '
> import {readFileSync,readdirSync,existsSync} from "fs"; import {join} from "path";
> const POOL=process.argv[1];
> const M=readFileSync(join(POOL,"PROJECT_KNOWLEDGE_INDEX.md"),"utf8");
>
> ⚠ **ANNOTATED 2026-09-08 (D-5), NOT CORRECTED. The expression below is TWO generations stale, and it is kept exactly as written because it is the evidence.**
> 
> It is the **pre-`D-C-1`** loose matcher: `[^|]*\|?\s*` between the filename and the hash let ANY prose sit in the gap, so a hash merely QUOTED in a description was read as that file's live row. That is the defect the eighth package of 2026-09-07 fixed, and rewriting this block would erase the only readable record that the matcher was once loose. It is also missing `py`, added 2026-09-08.
> 
> **The live expression is `package_check.mjs`'s K-8 and the manifest's D-5 block.** `qa/tools/row_census.cjs` checks those against each other and **excludes this block by name** as history. Do not paste and run what follows.
>
> const rows=[...M.matchAll(/\|\s*`?([A-Za-z0-9_.-]+\.(?:mjs|cjs|jsx|js|sh|md|html|json|txt))`?\s*\|[^|]*\|?\s*`?([0-9a-f]{32})`?/g)];
> const hashed=new Set(rows.map(r=>r[1])); const pool=readdirSync(POOL);
> console.log(pool.length,"files ·",hashed.size,"hashed rows ·",pool.filter(f=>!hashed.has(f)).length,"with no row");
> ' /mnt/project
> ```
>
> ⚠ **The composition of the 37, not just the count, is what D-3 needs.** The named files below are
> still in the unrowed set — that part of §3 did not go stale, and it is the part the argument rests
> on.

*(As written 2026-09-02, and wrong:)* Measured 2026-09-02 against the live pool: 107 files, **72 md5 rows**, **42 files with no row**
(`vite_config.js` excluded as the known mount artifact). Among them: **`CHANGELOG.md`, `TESTING.md`,
`OPERATIONS.md`, `METHODOLOGY.md`, `PROJECT_KNOWLEDGE_INDEX.md`, `README.md`,
`MissingFeatures.md`**, both current sources, both current dom entries, and 20-odd audits and status
documents.

**The consequence is precise.** §A2's offline fallback compares pool files to the manifest's table. A
file with no row cannot be compared, so a stale copy of `OPERATIONS.md` or `TESTING.md` in the pool is
**invisible by construction** — the same shape as the `t8` defect that opened the v5.58 session, where
the manifest's own row carried the stale hash and returned a false green. Here there is no row to be
wrong; the check simply cannot see the file.

**It is the reason §A2 says prefer the clone**, and the clone is what has caught every instance.

**What this ships.** Rows for the files that warrant one, **generated from the pool** rather than
typed. ⚠ **Not all 42 obviously warrant one** — a row for `PROJECT_KNOWLEDGE_INDEX.md` inside
`PROJECT_KNOWLEDGE_INDEX.md` is self-referential and cannot be right at the moment it is written.
That is decision **D-3**.

⚠ **A row is a maintenance obligation, not a free check.** Every release that edits a listed file
must rewrite its row, and a row that goes stale is worse than no row: it returns a false green rather
than no answer. That is exactly what happened to `t8`. **Adding 42 rows adds 42 chances to do that**
*(read 37 — see the banner)*, which is the argument for a narrower set.

⚠ **That argument got a fresh instance on 2026-09-07 and it cuts toward the narrow set.** The first
of that day's four ops packages changed `package_check.mjs` and **did not roll that file's own hash
row**; K-8 passed pre-ship and went red the moment the package landed. **The row most likely to need
rolling is the row for a file the package itself changes**, and it was the one row K-8 structurally
could not check until it was fixed the same day. Every row added is a row with that property.

## 4 · Explicitly out of scope

- **Any modelling change to D-10.** Item A corrects a register row. The capital-gains term stays out
  by resolved decision.
- **Fixing `package_check`'s split-release gap**, section `J`'s blindness to deletions, or `P17`.
  Filed, and each needs its own scope.
- **`validation/deep_test`.**
- **Automating the manifest's md5 table.** Generating rows *this once* is Item C; a generator that
  keeps them fresh is a different and larger idea, and it is the honest answer to §3's maintenance
  objection. Raise it, do not build it here.

## 5 · Open decisions — build only after these are resolved

**D-1 · Do these ship together or separately?** A and C are documentation with no check-count change;
B is a build with new tests and controls. *Recommendation: **split**. Ship A + C as one small `ops`
package — they are both "a document says something untrue" and neither touches the suite. Ship B on
its own, because a release whose only risk is new test code should not be reviewed alongside two doc
edits, and because B's check-count change is the kind of thing that gets lost in a mixed entry.*

**D-2 · Is `t21` coverage worth its cost, or is disclosure enough?** The alternative is to leave the
three tools uncovered and keep saying so in `TESTING.md`. *Recommendation: **build it**, but expect
it to be larger than it looks — the fixture may not exercise these tools' subjects at all, and
extending `fixture.jsx` is the load-bearing part. If the fixture work turns out to need its own
design, **stop and report** rather than writing thin cases to reach a number.*

**D-3 · Which of the 42 get rows?** *Recommendation: **not all 42.** Row the files whose staleness
would mislead a session: `OPERATIONS.md`, `TESTING.md`, `METHODOLOGY.md`, `CHANGELOG.md`,
`MissingFeatures.md`, `README.md`, both current sources, both current dom entries — roughly a dozen.
Leave the frozen `STATUS_*` and `AUDIT_*` documents unrowed: they are historical, nothing reads them
for build state, and rowing them buys 20 maintenance obligations for no protection. **Say in the
manifest which files are deliberately unrowed and why**, or the next session reads the gap as an
oversight and re-opens this.*

**D-4 · Does the manifest carry a row for itself?** *Recommendation: **no.** It cannot be correct at
the moment it is written. State that explicitly in the table's header rather than leaving a
conspicuous absence.*

**D-5 · Should Item C ship a NUMBER or a COMMAND? (raised 2026-09-07 by the third scope-status
sweep.)** Item C as written states a count. That count has been wrong twice in five days — 42 when
it was 37, and 107/72 when it was 110/73 — both times because an ops package added rows between the
writing and the reading. The alternative is that the item ships **no count at all**: the manifest's
table header names the derivation command (the one in §3's banner, which is K-8's own expression),
and the count is produced on demand by whoever needs it.

*Recommendation: **the command, and keep a dated measurement beside it, not instead of it.** The
count is genuinely useful — it is what makes the gap legible at a glance, and D-3 cannot be reasoned
about without knowing roughly how many files are in play. But a bare number in a document that
nothing re-runs is a second answer, which is this project's recurring failure. Write it as
`37 as of 2026-09-07 — derive with: <command>`, so the figure carries its own expiry and the reader
can settle it in one command rather than trusting it. This costs one line and resolves nothing else;
**it does not touch D-3**, which is still about which files get rows.*

⚠ **This is a decision, not a correction, which is why it is here and not applied.** Changing what
Item C ships changes the shape of the item, and §5 gates that on Steve.

---

*Destination: **project knowledge, AND `docs/` in the repo**, as `SCOPE_HOUSEKEEPING_THREE.md` —
standard scope handling. It stays on `package_check`'s **I-2 OPEN allowlist**: its decisions are
unresolved, which is the allowlist's own criterion, and its work is unbuilt.*

---

## 6 · Build record — Items A and C, 2026-09-07

**Shipped as one ops package, per D-1.** No version bump, no suite: neither item touches source,
`t*.mjs` or a fixture.

### ⚠ A PREREQUISITE NOBODY FORESAW, and it cost a package

**Item A could not ship until `package_check` was fixed first.** Editing `MissingFeatures.md` turned
**K-8 red** — its matcher allowed prose between a filename and an md5, so this file's own index row,
which quotes the historical *"RE-PINNED TO v5.48 on 2026-08-25 (`6b30580a…`)"*, was read as its live
hash row. Accidentally correct for two weeks; red on the first edit. Decided as **D-C-1 (a)** and
shipped as its own package ahead of this one, with controls **P42** and **P43**.

⚠ **The quieter half is the one to remember.** Because K-8 saw a row there, `MissingFeatures.md` did
**not** appear in the no-row set — so **§3 of this scope listed it as unrowed while the gate saw it
as rowed.** A human and a check disagreed about one file and neither could see the other. §3's
premise was wrong for a reason §3 could not have detected.

### Item A — what actually shipped

**Five corrections, not the four §1 listed.** The fifth was found while editing: the row's ranking
cell still read *"Unranked — awaiting the product call"* when that call was made and shipped at v5.52.
It now reads **Low**, because the one remaining term is a resolved decision and nothing in the row is
awaiting an answer.

The corrected row states the position re-resolved **by AST against v5.65**, not by line number, and
says exactly what is still open and no more: `capGain_y` absent **by resolved decision D-2 (c)**, and
the narrower earned-income term. It points at `SCOPE_D10_MODELLING_v5_53.md` and marks
`SCOPE_FIX_roth_tab_div_capgain.md` superseded.

⚠ **Confirmed before editing, as §1 required: no suite asserts D-10's text.** `t31` is the only
suite that mentions `MissingFeatures.md` and only in a comment; it reads `METHODOLOGY.md`, never this
file.

### Item C — six rows, and a deviation from D-3 stated rather than taken quietly

Rowed: `OPERATIONS.md`, `TESTING.md`, `METHODOLOGY.md`, `CHANGELOG.md`, `MissingFeatures.md`,
`README.md`. The unrowed sets are named **in the manifest** with reasons, per D-3's second half.

⚠ **D-3's recommendation also named both app sources. They were EXCLUDED, on evidence found while
building it.** The two build tables already carry `Source md5` for both, and `package_check` **K-4,
K-5 and K-6** already assert those against the pool. A second row would be **a second copy of a fact
the build tables own**, free to drift from it — this project's defining failure. **Covered, not
skipped**, and written into the manifest as reasoning.

**D-4 honoured:** the manifest carries no row for itself, and says why rather than leaving a
conspicuous absence. **D-5 honoured:** the count ships as *"37 as of 2026-09-07"* beside K-8's own
derivation command, so the figure carries its own expiry.

### What Item B still needs before it can start

⚠ **D-2's prerequisite is unanswered.** §2 says *"the three tools added at v5.58"*; `qa/tools/` holds
**39 entries** and a `--depth 1` clone carries no history to date them. **Whether three is still the
right number is UNKNOWN.** Settle it with a full-history clone first — coverage for three when five
need it is the partial green §B2 exists to prevent.
