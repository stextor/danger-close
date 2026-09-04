# SCOPE — repo and pool housekeeping

| | |
|---|---|
| Status | **OPEN — decisions resolved 2026-09-04, NOT YET BUILT.** H-1, H-2 and H-3 are answered; the work itself (the duplicate delete, the pool move, the scope sweep) is a later package. |
| Premise measured against | shipped **v5.63**, source `b2deba49e68bee6c29300f2f8cf0a7e3`, repo HEAD **`37cea89`**, pool as refreshed at the v5.63 ship |
| Kind | **Housekeeping.** No engine code. No modelling change. `METHODOLOGY` is not touched. |
| Requested by | the maintainer, 2026-09-04 — *"the pool and the repo have a lot of files that may not be necessary"* |

> **Every count in §1 was printed by a command on 2026-09-04, at `37cea89`.** Re-run them before
> building; §A0 applies to this file exactly as to any other. ⚠ **Two counts in the 2026-09-04 draft
> of this scope were wrong and one of them carried the whole argument — see §2.**

---

## 1 · What is actually there — measured, not estimated

| | |
|---|---|
| Repo tracked files | **293** |
| `docs/` | **110** |
| `qa/qa-baseline/` | **69**, of which **57** are `dom_entry_*.jsx` |
| `qa/` top level | 40 · `qa/tools/` **39** · `validation/` 10 |
| Pool | **123 files, 5.1 MB** |
| Pool markdown | **47 files, 1,569,000 bytes** |
| …of which `AUDIT_*` / `STATUS_*` / `STOP-REPORT-*` / `FINDINGS-*` | **24 files, 283,558 bytes** |

`docs/` by prefix: 43 `SCOPE_*` · 18 `STATUS_*` · 13 `AUDIT_*` · 8 `STOP-REPORT-*` ·
5 `FlawsToFix*` · 4 `FINDING-*` · 3 `BUILD_BRIEF*` · 2 `FINDINGS-*` · 2 `DERIVATION_*` ·
2 `.diff` · plus `MissingFeatures.md`, `UsabilityFlaws.md`, `ARCHITECTUREIssues.md`,
`OPERATIONS.md`, `SITE_CENSUS_v5_10.md`, `qa-baseline-README.md`.

### 1a · ⚠ The pool has NO orphans, and that is a finding in the useful direction

Checked in both directions on 2026-09-04, by content hash rather than by name. **Every pool file has
a byte-identical repo counterpart except four, and all four are correct:**

| Pool file | Why it is right |
|---|---|
| `DangerClose-v5_62.jsx`, `DangerClose-v5_63.jsx` | the rotated pair — these live in the pool **by design** and are not committed |
| `tools_fixture.jsx` | the mount's flattening of `qa/tools/fixture/fixture.jsx` — `3602b615b65f09995a9eb1fa17fe4175` on both sides (§A2's mapping caveat) |
| `vite_config.js` | the mount's renaming of `vite.config.js` — `30da5708038a1d7c97a4b06777ea8e8a` on both sides (§G's stem-dot gotcha) |

**So "the pool is full of junk" is false and must not be the premise of this work.** The pool's cost
is not stray files; it is that 1.57 MB of markdown loads into every session, of which 283,558 bytes
is completed history that also lives durably in the repo. That is a *placement* question, not a
deletion one, and it is H-2.

---

## 2 · ⚠ Two measurements in this scope's own first draft were wrong

Recorded here rather than quietly corrected, because §A0 exists for exactly this and because the
larger of the two was the entire quantitative case for H-1.

| Claim in the 2026-09-04 draft | What a command printed |
|---|---|
| the 57 `dom_entry_*.jsx` are **251 KB** | **18,913 bytes** (`git ls-files … \| xargs wc -c`) |
| `qa/tools/` holds **37** files | **39** (`git ls-files qa/tools`) |

**The 251 KB figure is the whole `qa/qa-baseline/` directory** — 257,413 bytes, 251.4 KB —
attributed to the 57-file subset inside it. Each `dom_entry` is a four-line shim: `dom_entry_v510.jsx`
is 243 bytes and `dom_entry_v563.jsx` is 335. The likely mechanism is a `du` reading, which reports
4 KB blocks and gives 228 KB for the same 57 files.

**The lesson is not "check your arithmetic."** It is that a directory-level measurement was carried
into a file-level claim without the units being re-read, in a document whose own §6 warns that a
cleanup pass makes everything look redundant. The number that would have justified the deletion was
an artifact of how it was measured.

---

## 3 · The `dom_entry_*.jsx` set — H-1, RESOLVED: keep all 57

One per release since v5.10. Tags present: `v510, v5101, v5102, v511`…`v563, v592`.

**Only three are reachable:** `v562` and `v563` (the live comparison pair) and `v592` (the retired
v5.9.2 leg the suites still understand). The remaining **54** import `./app_vXXX.jsx`, which
`mk_testable.sh` builds from `<tag>.jsx` at the run-folder root — and those sources are
**deliberately not committed**.

**The census question §B1 requires, answered by parse rather than grep.** An AST walk over `qa/`
collecting every `Literal` and `TemplateElement` matching `/^v5\d{2,3}$/` (excluding `dom_entry_*`,
`app_*` and `DangerClose*` files) returns **57 distinct tags, every one of them registered**.
`t1_units.mjs` L17 and `t4_dom.mjs` L19 each carry the full `KNOWN_VERSIONS` array from `v510`
through `v563` plus `v592`, behind a fail-closed guard that exits rather than running an unregistered
tag through the oldest branch.

**So the registries name TAGS, not FILES.** Deleting `dom_entry` files would not break a run and
would not force a suite edit — which matters, because editing a `t*.mjs` is out of this scope's lane
by §4. But it would leave 57 tags registered against three runnable legs, which is a worse state to
hand a future session than the one that exists now.

### H-1 · RESOLVED 2026-09-04 — **(b), keep all 57**

With the size corrected from 251 KB to 18,913 bytes, the entire saving from deleting 54 files is
about 18 KB and 54 directory entries, set against a capability §F and this README both describe.
§G's standing instruction is **prefer retiring to deleting**, and there is no longer a cost argument
strong enough to override it.

**What ships instead of a deletion:** one annotation in `qa/qa-baseline/README.md` naming which three
tags are reachable and what the other 54 need, so the directory reads as history rather than as
clutter. That is reversible, costs nothing, and answers the question the files raise.

> ⚠ **A second finding, made while writing that annotation.** `qa/qa-baseline/README.md` L48 said
> `v510.jsx` was *"recoverable from its git tag."* **There is no such tag.** `git ls-remote --tags
> origin` returns nothing — the repo has no tags at all, for any version, which OPERATIONS §G has
> stated since 2026-08-09 and which this README contradicted in the one place a session would look
> while hunting for a missing file. Corrected in the same edit.

---

## 3a · ⚠ H-3, found 2026-09-04 while packaging: the repo carries the qa-baseline README TWICE

`qa/qa-baseline/README.md` and `docs/qa-baseline-README.md` are **byte-identical**
(`605c263afbe2f30a3fc2ba720aba1925`, both 5,913 bytes). The `docs/` copy landed at `dcc14c1`, the
v5.61 commit, in a single-file addition of 90 lines — the shape of the pool's *flattened* name being
uploaded into `docs/` as though it were a document. **Nothing points at that path.** The only two
textual references to the name are the manifest's pool row and one scope, and both mean the pool
file.

**This is the class §G names under *One manifest, one copy*.** The recorded instance there is
`validation/PROJECT_KNOWLEDGE_INDEX.md`, which sat frozen at v5.49 and drifted 47 lines. A duplicate
does not announce itself; it goes stale the first time the real file is edited — **and it would have
done so in this very package**, whose H-1 annotation and git-tag correction touch
`qa/qa-baseline/README.md` and would have left the `docs/` copy still asserting a git tag that does
not exist.

**H-3 · RESOLVED 2026-09-04 — delete `docs/qa-baseline-README.md`, keep the other two.**
`qa/qa-baseline/README.md` is the real file (§F and the suites' own docs point there) and the pool's
flattened `qa-baseline-README.md` is legitimate and has a manifest row. §G's deletion precondition is
met in its strongest form: the outcome is preserved **byte-identically** at another path, and the
document carries no decision of its own.

> ### ⚠ Why H-3 was NOT executed in the package that found it
>
> `package_check`'s **E-1b** resolves a `knowledge/` file to its repo counterpart **by basename
> against the CLONE** — the pre-ship tree. Deleting `docs/qa-baseline-README.md` cannot be expressed
> in a zip (a deletion is an instruction in `README-FIRST.md`), so the clone keeps the file, the
> basename keeps resolving to it, and E-1b reports the package as red **because of the deletion the
> package is shipping**.
>
> **That is exactly the defect I-2 was fixed for**, and its own comment states the principle: *the
> question worth asking is not "is the tree clean now" but "will the tree be clean once this lands."*
> **E-1b was left reading the pre-ship tree alone.** So it is a second instance of a known shape, in
> the same file, and it is a tooling finding rather than a packaging mistake.
>
> **What the 2026-09-04 package did instead:** shipped the corrected README to **both** repo paths,
> so the tree is consistent and no copy carries the false git-tag sentence. The duplicate survives
> one more package, deliberately and on the record.
>
> **Two ways to close H-3, and the choice is a real one:**
> **(a)** Teach E-1b to evaluate the tree *as the package will leave it*, reading `README-FIRST.md`'s
> declared deletions the way D-2 already does — the correct fix, but it is a change to a gate and
> needs its own negative control, so it is not free.
> **(b)** Delete the file in a package that ships nothing else touching that basename, and
> hand-verify E-1b. Cheap, and it leaves the gap in place for the next occurrence.
> **Recommendation: (a)**, because §G's three-place rule is already the one part of §G no check
> enforces, and this is the second time the tooling has been unable to see a departure.

---

## 4 · Completed history in the pool — H-2, RESOLVED: move it, keep it in the repo

`AUDIT_*`, `STATUS_*`, `STOP-REPORT-*` and `FINDINGS-*` are all durably in the repo. In the pool they
load into every session's context: **24 files, 283,558 bytes**, about 18% of the pool's markdown.

### H-2 · RESOLVED 2026-09-04 — **(b), repo-only with a manifest row, with two carve-outs**

Remove completed audits and status reports from the pool, keep them in the repo, and give each a
manifest row saying *repo-only, and where to find it*. A session that needs one is pointed at
`docs/<name>` and fetches it.

**Carve-outs that stay in the pool:** `FINDINGS-v5_63-otherOrd.md`, and any audit a **live** scope
cites — a session reading a live scope must be able to open its evidence without a fetch. As of
2026-09-04 that means `AUDIT_STATE_INCOME_BASES_ROUND5.md` stays, because
`SCOPE_INCOME_CONDITIONING.md` is approved-and-unbuilt and its build session must read ROUND5 §2e
before quoting a Rhode Island figure. **The carve-out list is re-derived at build time, not copied
from here** — a scope that retires between now and then changes the answer.

**Option (c), removing them from both, was named only to reject it.** These are the evidence behind
shipped statutory figures.

⚠ **Whichever files move, the manifest rows move with them** — §G's three-place rule, which
`package_check` **K-9** enforces from the pool side. Note the ordering property that makes this safe
in either state: a row that *names* a file satisfies K-9 whether or not the file is still in the
pool, and **K-8 only checks rows that carry a hash**, so a history row rewritten as *repo-only, no
hash* passes before and after the maintainer's deletes.

---

## 5 · What building this scope would do

1. Apply the `qa/qa-baseline/README.md` annotation and git-tag correction (H-1). **Done in the
   2026-09-04 ops package** — it was one edit and holding it back would have left a false statement
   about git tags in the tree.
2. **Execute H-3** — delete `docs/qa-baseline-README.md`, by whichever of §3a's two routes is
   chosen. If (a), the `package_check` change ships with its own negative control asserting E-1b
   still fires on a genuine v5.47-shaped omission.
3. Execute H-2: rewrite the 24 manifest rows as repo-only, name all 24 in the package's
   `README-FIRST.md` delete-first list, and run `package_check` with the pool argument **before and
   after** the maintainer's deletion pass.
4. **A third scope-status sweep.** 43 `SCOPE_*` files. The 2026-08-26 sweep found **seven of nine**
   live-looking status lines describing already-shipped work, two of them saying *do not proceed*;
   the 2026-08-28 sweep found **twelve** more, the worst reading **BUILD GATE OPEN** about work
   shipped twenty-nine releases earlier. §I is explicit that the sound test is the expensive one —
   read what each release actually shipped — and that automation can find candidates but cannot
   close them. **The sweep is the work; the retirement markers are the easy part.** It is also the
   single largest item here and should not be bundled with H-2 if budget is tight.

## 6 · Explicitly OUT of scope

- **Anything under `qa/tools/` or `validation/`.** `validation/` is documented as kept-on-purpose and
  explicitly not a release gate (§B); `qa/tools/` is what §B1 requires be used instead of greps.
  Neither is clutter.
- **`CHANGELOG.md` (468 KB).** It is the release history and the only durable record this project
  has, since it uses no git tags. It does not get trimmed.
- **Any engine, suite, or modelling change.** If this scope finds itself editing a `t*.mjs`
  assertion, it has left its lane — stop and report.
- **Deleting `AUDIT_*` documents from the repo.** They are the evidence behind shipped statutory
  figures. H-2 is about the *pool*, not the repo.

## 7 · Tests this ships with

Housekeeping still ships verification, and most of it already exists:

- **`package_check` K-9** asserts every pool file is named somewhere in the manifest, and **K-8**
  that every hashed row matches its pool file. **This is the gate that makes H-2 safe**, and it must
  be run with the pool argument before and after the deletion pass.
- **`package_check` I-3** catches an OPEN-allowlist entry naming a scope that no longer exists.
- ⚠ **What no check covers: the deletion itself.** §G records that `package_check` section `J` sees
  arrivals and not departures, so the three-place rule is a manual discipline. The 24 rows are
  hand-verified against the pool listing, both before and after.
- **No app suite applies.** No source, no `t*.mjs` and no fixture is touched, so a green suite would
  be a green reading from an unrelated set. Say that in the CHANGELOG rather than quoting a total.

## 8 · ⚠ The risk this scope carries, stated up front

**This project's recorded failure mode is deleting a document for looking redundant and losing the
reasoning with it.** The manifest's rotation-state section was *deleted rather than repaired*.
§A2's `probe_classify` bullet was wrong in both directions for months and nothing compared it. §G
says **prefer retiring to deleting** for exactly this reason.

A cleanup release is the highest-risk possible moment for that failure, because every file it looks
at looks redundant by construction — that is the lens it is holding. **The bias must be: move it,
annotate it, mark it retired. Delete only what has been shown unusable, and say in the CHANGELOG
what was removed and why, file by file.** §2 above is this scope demonstrating the failure on itself
before it touched anything: the number that would have justified a deletion was wrong by a factor of
thirteen.

## 9 · Build record

*(H-1's annotation shipped in the 2026-09-04 ops package. H-2 and the sweep are not built.)*

---

*Destination: **project knowledge, AND `docs/` in the repo**, as `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md`
— standard scope handling. ⚠ **It must also be added to `package_check`'s I-2 OPEN allowlist in the
same pass**, or the next `package_check` run reports it as a scope carrying no retirement marker.
Its decisions are resolved but its work is not built, so the allowlist note names the unbuilt items
rather than open decisions.*
