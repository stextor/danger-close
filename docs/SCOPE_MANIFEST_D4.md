# SCOPE — the manifest went stale at v5.61, and D-4 as written would not have caught it

| Field | Value |
|---|---|
| Premise verified against | pool as of 2026-09-03 post-v5.61 · clone `8bd0282` · source `7e1a02881256142c5b9206045e76e2ec` |
| Written | 2026-09-03 |
| Origin | post-ship verification of v5.61; open ops item **D-4**, deferred eleven releases |
| Shape | **Ops package.** No app source, no rebuild, no version bump. One document corrected, one gate extended, controls added. |
| Status | **AWAITING MAINTAINER DECISION** — §6. Not built. |
| Precedent | `SCOPE_OPS_PROCESS_FIX.md`; `OPERATIONS.md` §L "Ops packages (added 2026-08-26)" |

---

## 1. Premise — two defects, both measured

### 1a. `PROJECT_KNOWLEDGE_INDEX.md` was not updated at the v5.61 ship

**It was omitted from the release package. That is my error, not a process gap.** §G calls the
manifest mandatory and step 1 of the freshness check, so the next session's first action reads a
document naming the wrong build.

Measured against the pool and the clone, not recalled:

| claim | manifest says | truth |
|---|---|---|
| current version | **v5.60** | v5.61 |
| current source md5 | `23877f90…` | `7e1a0288…` |
| current built md5 | `278cb053…` | `ba3968f2…` |
| prior version | **v5.59** | v5.60 |
| prior source file | `DangerClose-v5_59.jsx` | **no longer in the pool** — rotated out |

And the drift is wider than the two tables. Of **72 manifest rows carrying an md5**:

- **50** still correct
- **21 STALE** — 20 caused by v5.61 (16 suite files, `package_check.mjs`, `MissingFeatures.md`,
  `AUDIT_STATE_EXCL65_ROUND4.md`, `SCOPE_EXCL65_STALE_RI_WI.md`) and **1 that was already stale
  before this release**: `SCOPE_VA_NOTE_CORRECTION.md`
- **1** names a file no longer in the pool: `dom_entry_v559.jsx`

⚠ **This is the §A2 fallback table.** It exists because a stale pool file was once invisible by
construction, and its own header already records a 2026-08-28 incident where *"the table VOUCHED for
two stale pool files, and the freshness check passed on them."* Twenty-one wrong hashes is that
failure mode at scale.

Separately, **14 pool files are never named anywhere in the manifest** — 3 from v5.61
(`DangerClose-v5_61.jsx`, `controls_v561.sh`, `dom_entry_v561.jsx`) and **11 that predate it**:
`AUDIT_STATE_INCOME_BASES_ROUND5.md`, `SCOPE_HOUSEKEEPING_THREE.md`, `SCOPE_INCOME_CONDITIONING.md`,
`SCOPE_RI_THRESHOLD_CORRECTION.md`, `STATUS_v5_50_shipped.md`, `controls_v557.sh`,
`controls_v5571.sh`, `copylock.cjs`, `lits.cjs`, `notes_probe.cjs`, `vergates.cjs`. §G requires every
file listed explicitly.

### 1b. ⚠ D-4, as recorded for eleven releases, does not catch this

D-4 has been carried as *"nothing compares the manifest's two build tables."* The manifest's own
Prior-build table proposes the remedy: *"A one-line `package_check` assertion would close it."*

**Run against the actual defect, that assertion passes.** Neither table rolled, so Current v5.60 /
Prior v5.59 remains a perfectly self-consistent pair. Probe output, this session:

| candidate | fires on the real defect? |
|---|---|
| Current version == newest CHANGELOG entry | **FIRES** |
| Current source md5 == clone `src/DangerClose.jsx` | **FIRES** |
| Current built md5 == clone `index.html` | **FIRES** |
| **Prior is one release below Current — the two tables compared to each other** | **passes — does NOT fire** |
| both named source files exist in the pool | **FIRES** |
| the pool's two legs are the two the manifest names | **FIRES** |
| Current source md5 == md5 of the pool file it names | **passes — does NOT fire** |
| Prior source md5 == md5 of the pool file it names | **FIRES** |

**The framing was wrong, not just the priority.** Internal consistency is the one property the
defect preserves. The check has to anchor the manifest to **external truth** — the clone and the
pool — and the two assertions that test only internal coherence are exactly the two that stay green.

This is §B2 one level up: an unbuilt check was carried for eleven releases on a description of what
it would catch, and the description was never tested. **Had D-4 been built as written, it would have
shipped green through this defect and been trusted.**

### 1c. The deferral reason dissolves here

D-4 was deferred on a real objection: *"the tool that verifies a release should not change inside the
release it verifies."* **An ops package is not a release.** It ships no app source and no artifact,
so `package_check` is not gating its own release. That is why this work belongs in an ops package and
not bundled into v5.62.

---

## 2. Site census — run, not grepped

Code claims by direct execution of a probe against the real files; prose claims by literal search,
which is not a census and is not covered by §B1.

| site | what | scale |
|---|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` — Current build table (**L24–32**) | version, source file, source md5, built md5, shipped date | 5 rows + a rolled note |
| — Prior build table (**L620–627**) | same, one release back | 4 rows + a rolled note |
| — hash table (**L359+**) | 21 stale rows, 1 row for a departed file | 22 rows |
| — file listings | 14 pool files unnamed | 14 additions |
| — Retirement list (**L832+**) | needs the v5.61 rotation entries | 1 new block |
| `qa/tools/package_check.mjs` | **new section K**; sections A–J exist, `ck`/`skipped` at L34/L38, `POOL` is already `argv[5]` | ~40 lines |
| `qa/tools/package_check_controls.sh` | 14 controls today; new ones for section K | +N controls |
| `OPERATIONS.md` | §L should name the manifest as a release deliverable; §G should say what does **not** rotate | 2 edits |
| `CHANGELOG.md` | ops packages get an entry | 1 |

**Inputs already exist.** `package_check` takes `CLONE` (`argv[3]`) and `POOL` (`argv[5]`), and the
manifest is in both the repo and the pool — so section K needs no new arguments.

⚠ **`package_check.mjs` is a `.mjs` and `t21` covers `qa/tools/*.cjs` only.** It has no unit suite;
its test vehicle is `package_check_controls.sh`. Anything added here is tested there or it is untested.

---

## 3. What this ships

1. **`PROJECT_KNOWLEDGE_INDEX.md` corrected** — both build tables rolled, 21 hashes refreshed, the
   departed row removed, the v5.61 rotation recorded, and the unlisted pool files added (scope per
   **D-a**).
2. **`package_check.mjs` section K** — the manifest checked against external truth. Candidate set,
   each already proved to fire:
   - **K-1** Current version == newest CHANGELOG entry version
   - **K-2** Current source md5 == clone `src/DangerClose.jsx`
   - **K-3** Current built md5 == clone `index.html`
   - **K-4** every pool file the two tables name still exists in the pool
   - **K-5** each table's md5 == the actual md5 of the pool file it names
   - **K-6** the pool's two legs are exactly the two the tables name
   - **K-7** Prior is exactly one release below Current *(kept, but labelled as the weak one — it is
     the assertion that does not fire, and shipping it silently would repeat the original error)*
   - **K-8** every hash-table row matches its pool file *(gated on **D-b**)*
   - **K-9** every pool file is named somewhere in the manifest *(gated on **D-c**)*
   K-1..K-3 require `CLONE`; K-4..K-9 require `POOL`. Absent either, they **skip loudly** — §L
   already warns that a skipped check is not a passed one.
3. **New controls in `package_check_controls.sh`** — one per shipped K assertion, each perturbing the
   manifest in a scratch copy and requiring that check to fail. **Including a control that reproduces
   the v5.61 defect exactly** (roll neither table) and requires section K to catch it — the point
   being that this control is the one D-4-as-written fails.
4. **`OPERATIONS.md` §L** — add `PROJECT_KNOWLEDGE_INDEX.md` to what a release package must contain.
   The rule exists in §G; §L is the packaging checklist and does not name it, which is how it was
   omitted.
5. **`OPERATIONS.md` §G** — state what does **not** rotate. §G's rotation rule covers app sources
   only; I read it as covering controls scripts and told you to delete `controls_v559.sh`, which was
   wrong. The pool held `controls_v557.sh` and `controls_v5571.sh` in plain sight, contradicting the
   instruction.
6. **`CHANGELOG.md`** — an ops entry recording the defect, that D-4 as framed would not have caught
   it, and the correction.

---

## 4. Explicitly out of scope

- **Any app source change, rebuild, or version bump.** v5.61 stays the current build; its source and
  artifact are verified correct and are not touched.
- **The income-conditioning field** and Connecticut — still gated on their own D-2/D-3.
- **A committed lockfile** for the `mammoth` reproducibility problem. Real, recorded at v5.61, and a
  different job.
- **Rewriting the manifest's historical rolled-notes.** They were true when written; the correction
  is a new note, as with CHANGELOG entries.
- **A `qa/tools/` home for the note-vs-code probe**, and `ri_probe.cjs`. Adjacent ops items, but
  bundling them destroys attribution for this one.
- **Auto-generating the manifest.** Tempting and much larger; the check is the cheap fix and it is
  what makes a hand-edit safe.

---

## 5. How it will be verified

- **Section K run against the manifest AS IT STANDS** — the fired/passed table in §1b must reproduce
  exactly. This is the negative control the release exists for, and it is available *before* the fix.
- **Section K run against the CORRECTED manifest** — all green.
- **Every new control fires.** A control that does not fire is the finding (§B2), and the whole point
  here is that one plausible check has already been shown not to.
- **The existing 14 controls still fire**, so section K did not disturb sections A–J.
- **`package_check` on this very package**, `KIND: ops`, unversioned folder name per §L. Remember
  `J-1`/`J-2` fail before upload and `D-1` after; neither is a defect.
- **No app suite is run and no count is claimed**, because no app file changes. §L still requires the
  manifest to record how the package *was* verified.

---

## 6. Decisions for the maintainer

**D-a · How wide is the manifest correction?**
(i) The two build tables and this release's rows only. (ii) Those, plus the 21 stale hashes and the
departed row. (iii) Full reconciliation — also the 11 pool files that were unlisted before v5.61 and
the pre-existing stale `SCOPE_VA_NOTE_CORRECTION.md` hash.
**Recommendation: (iii).** A half-corrected manifest is the condition that produced this, and (iii)
is the only option that lets K-8 and K-9 ship green rather than as known-failing checks. The extra
work is mechanical — the probe already emits the exact list.

**D-b · Does K-8 (every hash-table row matches its pool file) ship?**
It is the assertion that would have caught the 2026-08-28 incident the table's own header records.
**Recommendation: yes**, conditional on D-a (iii). Under (i) or (ii) it ships red on day one, which
trains it into noise.

**D-c · Does K-9 (every pool file is named in the manifest) ship, and as a check or a warning?**
It currently has 14 violations. **Recommendation: ship it as a full check under D-a (iii)**, where
it starts green. If you pick (i) or (ii), make it informational instead — a permanently red check is
worse than no check.

**D-d · Does K-7 ship at all, given it does not fire?**
**Recommendation: ship it, explicitly labelled** as the assertion that cannot catch a both-tables-
stale defect, with the reason in a comment. It does catch a real case — one table rolled and not the
other, which is what happened for seven releases before v5.59. The danger was never the assertion; it
was believing it was sufficient.

**D-e · Should the manifest correction and the check ship together, or the manifest first?**
Shipping the manifest alone is faster and leaves the gap open a twelfth time.
**Recommendation: together**, which is what you asked for. The correction is small; the check is what
stops the twelfth recurrence, and building it against a live defect is the best evidence available
that it works.

**D-f · `OPERATIONS.md` §G — record what does not rotate?**
**Recommendation: yes.** My misreading cost you a wasted delete instruction. One sentence.

---

## 7. Build record

*(empty — this scope has not been built)*

---

*Destination: `docs/SCOPE_MANIFEST_D4.md` in the repo, and the knowledge pool. It should be committed
now, before the build, as `SCOPE_RI_THRESHOLD_CORRECTION.md` was — a scope that exists only in a chat
is not a scope. If you would rather not commit until the decisions are made, it is session-only and
will expire.*
