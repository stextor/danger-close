# SCOPE — process: package_check must cover ops packages, and documents must be re-read at the ship

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — BUILT AND SHIPPED 2026-08-26** as an ops package against v5.51. Decisions resolved as recommended: **D-1 (a)** no suite check, **D-2 (a)** the standing rule in §A, **D-4** ops package, no version bump. D-3 did not arise. `OPERATIONS.md` §A0, §I and §L carry the change. *(Previously: SCOPE ONLY, do not build.)* |
| Build | **v5.51** · `src/DangerClose.jsx` md5 `3cf497b834e545ce29c1945fb99ae09a` · repo `8ed291c` · verified 2026-08-26 |
| Kind | **`OPERATIONS.md` only** on the recommended path. No source, no test, no figure. Version stays v5.51 |
| Parent | Two defects that shipped this week, both recorded in `CHANGELOG.md` under v5.50 and v5.51 |

---

> ### ☑ RETIREMENT NOTE — added at the ship, 2026-08-26
>
> Built. What landed: **§A0** (state nothing a command has not printed, with the five-instance
> table), **§I** (re-read every document the release creates or touches, with both defects named),
> and **§L** (ops packages, the `KIND: ops` declaration, the unversioned folder name, and `F-1`
> applying in both modes because the pool is add-only).
>
> **§3's recommendation against building the suite check was taken.** That is the part of this scope
> most likely to be re-proposed by a later session, so the reasoning is worth keeping: the failure is
> a reader landing mid-document on a stale recommendation, and no mechanical predicate catches that.
> A status-line check would not have caught it — the document that failed *had* a status line.
>
> §0's correction stands as written: the "8 of 11 scopes missing retirement notes" figure that
> motivated this scope was **wrong**, an artifact of grepping for headings only this week's documents
> use. It is left in place because it is itself an instance of §A0.

---

## 0. ⚠ Correction to the framing that produced this scope

I proposed this job saying *"a suite check for retirement notes — `SCOPE_D7` got one, `SCOPE_D9`
didn't"*, and then that **8 of 11 retired scopes were missing notes**. **That count was wrong.** It
came from grepping for the specific headings `RETIREMENT NOTE` / `SUPERSEDED IN PART`, which only
this week's documents use. Checked properly, the 2026-08-26 retirement sweep gave every one of those
scopes an informative status line — `SCOPE_D6` reads *"RETIRED — FULFILLED AND SHIPPED AT v5.49. All
four decisions were resolved, both clauses shipped, `t31` shipped with them."* That is retirement
information. It is not missing.

The correction matters because it shrinks the job. **Most of what I proposed as a suite change is
not mechanically checkable, and saying so is more useful than building a weak test that looks
rigorous.** See §3.

## 1. What actually went wrong — two defects, verified

**1.1 · `package_check` was never run on the v5.50 doc-fix.** Re-run afterwards, that zip fails
**21 passed / 4 failed**. The cause is in `OPERATIONS.md` §L: it describes `package_check` entirely
in app-release terms — *"`knowledge/` … holds exactly one `DangerClose-v5_*.jsx`"*, *"`MANIFEST.txt`
records that the suite was run from the packaged copies"* — neither of which a documentation package
can satisfy. **§L does not know ops packages exist, although `package_check` does**: the tool has a
`KIND: ops` mode, declared in `MANIFEST.txt`, with its own predicates. Nothing in `OPERATIONS.md`
mentions it. A reader shipping a doc-only package meets a section that visibly does not apply, and
skips it. That is what I did.

One of the four failures was **real in either mode**: `F-1` requires the README to carry an explicit
delete-first list, because **the pool is add-only** — a same-name upload creates a second copy rather
than replacing. Neither doc-fix README said so. No harm landed (the pool holds one copy of each), but
that was Steve doing the right thing unprompted, not the package instructing it.

**1.2 · `ASSESSMENT_HEIR_RATE.md` shipped already stale**, inside the v5.51 package that fixed what
it describes, with an §8 recommendation — move `HEIR_RATE` into `TAX_CONSTS` — that the scope had
examined and **rejected**. Not drift over time: wrong at the moment of shipping. §I's checklist
covers retiring fulfilled scopes but says nothing about re-reading the documents a release
**creates**, which are the easiest to assume are current precisely because the ink is wet.

## 2. Recommended change — `OPERATIONS.md` only

**§L gains an ops-package paragraph:** that `package_check` runs on **every** package, that a package
shipping no app source and no built `index.html` declares `KIND: ops` in `MANIFEST.txt`, that ops
packages take an unversioned `danger-close-<slug>` folder name, and that `F-1`'s delete-first list is
required in both modes because the pool is add-only.

**§I gains one release-close step:** re-read every document the release **creates or touches**
against what actually shipped — including documents the release itself authored. With the concrete
instance named, because a rule without its defect drifts.

**§A or §L gains the standing rule** this week produced five instances of: *state no count, hash,
status or test result that a command in the session has not printed.* Every one of the five was
caught, none by memory: the case-sensitive census miss, the `METHODOLOGY` label drift, the stale
`REPO` variable, the `TAX_CONSTS` recommendation, and *"the previous doc-fix passed 25/25"* — which
it did not, because it was never run.

## 3. The suite check — proposed, and honestly weak

The failure worth preventing is a reader landing **mid-document**, on a recommendation table, and
implementing something that was rejected. What is mechanically checkable is much less than that:

| Candidate invariant | Checkable? | Would it have caught 1.2? |
|---|---|---|
| A retired document has a status line saying so | yes | **no** — the assessment had one |
| A retired document carries a body-level marker | yes | **partly** — only if the reader scrolls up |
| A retired document contains no recommendation contradicting what shipped | **no** — this is prose contradiction | would have, but cannot be written |

It also costs a real harness change: no suite reads `docs/` today, so the run folder would have to
carry it, and `TESTING.md`'s setup section would grow a fourth alias. **My recommendation is to skip
it** and take the `OPERATIONS.md` changes, which address the defect that actually shipped twice
(1.1) and the one no test could have caught (1.2). If a check is wanted anyway, the middle row is the
only honest version, and it needs the harness decision in D-3.

## 4. Out of scope

- **Backfilling retirement notes into the eight older scopes.** They are not missing information —
  see §0.
- **Changing `package_check` itself.** Its `ops` mode already works and caught all four defects the
  moment it was pointed at the package. The gap was documentation, not tooling.
- Any source, engine, test or figure change.

## 5. Open decisions

**D-1 · Does the suite check get built?**
&nbsp;&nbsp;(a) **No — `OPERATIONS.md` only** — *recommended*, per §3.
&nbsp;&nbsp;(b) Yes, the body-marker version, accepting the harness change.

**D-2 · Where does the standing verify-don't-assert rule live?**
&nbsp;&nbsp;(a) **§A, beside the freshness check** — *recommended*; §A is already the "check before you
claim" section and is read first every session.
&nbsp;&nbsp;(b) §L, next to *"The shape of the zip is CHECKED, not remembered."*

**D-3 · If D-1 is (b): does `docs/` go into the run folder for every run, or only when the doc suite
is invoked?** Recommend the latter — the run folder is already four aliases deep and `t19`'s
working-directory trap is what that complexity costs.

**D-4 · Ship as a `KIND: ops` package at v5.51, no version bump** — recommended, since no source
changes. It would be the first package to declare `KIND: ops` under a rule it is itself adding.
