# SCOPE — three housekeeping items: D-10's stale row, `t21` coverage, the 42 missing md5 rows

| Field | Value |
|---|---|
| Premise verified against | **v5.58** · source `6690b2c78953a7a4a1cee413d3523b59` · tree `2c3ebc9` |
| Written | 2026-09-02 |
| Status | **AWAITING DECISIONS in §5 — do not build yet** |
| Shape | **Item A** documentation · **Item B** a real build with new checks · **Item C** documentation, mechanically generated |

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

## 3 · Item C — 42 pool files carry no md5 row

Measured 2026-09-02 against the live pool: 107 files, **72 md5 rows**, **42 files with no row**
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
than no answer. That is exactly what happened to `t8`. **Adding 42 rows adds 42 chances to do that**,
which is the argument for a narrower set.

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
