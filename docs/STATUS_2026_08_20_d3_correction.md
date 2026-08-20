# STATUS — D-3 disclosure correction, and two freshness findings, 2026-08-20

| Field | Value |
|---|---|
| Build worked against | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · built `index.html` md5 `17867edb9af4c5e7e3542aeade594f24` · committed tree **`c7c8156`** |
| Prior build | v5.39 · `7070018f2699503dfac4ca8e0e1b2feb` / `0563e2f6db79c19b4729bec6e09a458a` |
| Source changed | **None.** No `.jsx`, no test, no build. Documentation only. |
| Tests run | **None, and none were required** — see §4. |

---

## 1. Freshness check (OPERATIONS §A / §A2) — two findings, both real

Clone-and-diff against `github.com/stextor/danger-close` at `c7c8156`. Pool = 76 files; **69 match a
committed file byte-for-byte, 7 do not.**

**Finding 1 — the v5.40 post-ship knowledge refresh did not run.** The manifest's *Current build*
table still read **v5.39** a day after v5.40 shipped, and its test-hash table still carried the v5.39
hashes. The pool agrees with the manifest, so nothing had *drifted* from its own record — the whole
knowledge record was one release behind the committed tree.

Five pool suite files are pre-v5.40 copies:

| Pool file | Pool md5 | Committed md5 |
|---|---|---|
| `t1_units.mjs` | `f1f60537…` | `768e9fe2…` |
| `t3_roth.mjs` | `2c21b54e…` | `7a82453f…` |
| `t4_dom.mjs` | `d613beeb…` | `6592892e…` |
| `t5_storage.mjs` | `f02dba0d…` | `96fb8a1f…` |
| `t6_single.mjs` | `d91ee96d…` | `2f76a8f1…` |

Every difference is v5.40 ladder registration — `"v540"` added to `KNOWN_VERSIONS`, `v540` folded
into the version clauses — plus t1's eight new v5.40 extinction invariants. **The pool copy of `t1`
therefore holds 94 checks where the committed file holds 102.**

The other two non-matching files are **not** drift: `DangerClose-v5_39.jsx` is the retained prior
source (§G rotation) and `README-FIRST.md` is knowledge-only by design.

**This drift is loud, not silent** — the one saving grace. `t1/t3/t4/t5/t6` abort with *"version tag
is not registered in this suite"* the moment they are handed `v540`, so a session running the pool
suite against the current build fails at the first suite rather than passing vacuously. Contrast E-14,
where a stale `t8` failed *against correct code* and read as a regression.

**Finding 2 — the session brief's freshness claim is stale.** It records *"51 files, zero drift"* as
of 2026-08-19. Measured today: 76 files, 5 stale. Not an error in the brief so much as a snapshot
that the v5.40 ship then invalidated by not refreshing the pool.

### What was done about it

`PROJECT_KNOWLEDGE_INDEX.md` in this delivery has been rolled: current-build table to v5.40, the five
suite hashes to their committed values, and a `dom_entry_v540.jsx` row added (it was missing
entirely). **All 39 hash rows in the delivered manifest were then re-verified against the clone —
39/39 match, 0 mismatches.**

**This does not fix the pool.** Five files must be re-uploaded to project knowledge from the repo:
`qa/qa-baseline/{t1_units,t3_roth,t4_dom,t5_storage,t6_single}.mjs`. Until that happens the delivered
manifest correctly reports the pool as stale, which is the intended behaviour of the §A2 fallback.

---

## 2. The correction — `AUDIT_D3_STATE_TAX_DIRECTION.md` §3

**The claim being corrected.** §3 held that six states (HI, MN, NJ, NY, VT, WI) collapse a graduated
schedule as an **"undisclosed simplification"**, that four (CA, DC, MD, OR) disclose it, and that this
was *"D-3's defensible core."*

**What was executed, and what it showed.** All of the following was read out of v5.40 source in this
session, not recalled:

1. **The approximation is disclosed in three places.** Field Manual §13 and the manual's Taxes tab
   entry, both decoded from the one-line `DOCS_HTML` blob at **L3593** (143,529 runtime bytes; a JS
   evaluator, not `JSON.parse` — it carries a `\'`); and `src/DangerClose.jsx` **L11889**, which
   renders *"2026 approx: X.XX% effective … — [note]. Verify against your state's rules."* beneath the
   My Data state selector for every jurisdiction in `STATE_RULES`. So "undisclosed" is false.
2. **Maryland was misfiled.** Its note says *"state+county effective"* and never says *progressive*.
   By §3's own discriminator MD belongs with the silent group. **The disclosing set is three: CA, DC,
   OR** — and they disagree with each other: CA names a range (*1–13.3%*), OR a ceiling (*to 9.9%*),
   DC neither.
3. **"With no note" is false.** All six named states carry notes. §3's own table said as much in its
   right-hand column, contradicting the sentence above it.
4. **Six was a sample, not a census.** `STATE_RULES` (**L1005–L1057**) holds 51 entries, every one with
   a single scalar `rate`, so the collapse is universal by construction. Measured: 9 states at
   `rate === 0`, 9 whose note says "flat", 3 that name progressivity, **30 silent on schedule shape**
   (26 excluding the four `retExempt` states IL/IA/MI/PA). The exact count of genuinely-graduated
   schedules inside that 30 is **unmeasured** and needs a sourced census.

**One new item, found while checking.** The **setup wizard's** state picker (**L3393**, step 5) offers
the same 51-entry dropdown with no note beneath it. Severity **Low**, recorded in §3.0 rather than
opened as a numbered defect.

**Restated finding: inconsistent per-state `note` detail, severity Low, exposure user-side and
bounded.** Not an undisclosed simplification.

**Consequence.** D-3 has **no live high-priority half**. The precision half (§2) is conservative and
held; this half is Low. The note tidy should ride along with the next release that opens
`STATE_RULES`, not drive one.

---

## 3. Files changed

| File | Change |
|---|---|
| `docs/AUDIT_D3_STATE_TAX_DIRECTION.md` | §3 rewritten (§3.0 the three disclosure sites, §3.1 the measured breakdown, §3.2 the restated finding, §3.3 **the original §3 preserved verbatim** for audit); NJ item renumbered §3.4; header, §4 limits and §5 recommendations followed; §6 extended |
| `docs/AUDIT_TOP_FIVE_SUMMARY.md` | Correction box, narrative paragraph and evidence-table row 2 amended; item 2 marked as no longer belonging at rank 2 |
| `docs/MissingFeatures.md` | D-3 box, D-3 re-pin row and D-3 ranking-table row amended to Low |
| `PROJECT_KNOWLEDGE_INDEX.md` | D-3 row amended; **plus** current-build table rolled to v5.40, five suite hashes rolled, `dom_entry_v540.jsx` row added (§1) |

---

## 4. What was NOT done, and why

- **No test run.** Nothing in this delivery touches `src/`, `qa/`, or the build. The suite's last
  recorded state is the v5.40 baseline (1,344 / 0 across 22 suites, plus 16 built-artifact smoke
  checks); this delivery does not move it and does not restate it as re-verified.
- **No version bump.** No in-app string changed, so the four version sites are untouched and t1's
  STATIC checks are unaffected.
- **No CHANGELOG entry.** These are repo documentation records, not shipped app behaviour. If you'd
  rather it appear, the natural home is a line in the next release's entry.
- **The census of genuinely-graduated schedules among the 30 was not run.** Stated as unmeasured
  rather than estimated.
- **The top-marginal rates in the original §3 were never sourced** and are carried into the preserved
  quotation unchanged, flagged as unverified.
- **Task 2 (structural extinction assertion) and Task 3 (E-7 version-ladder registry) were not
  started.** Both are `qa/` changes needing their own scope.

## 5. One error made and caught inside this session

While rolling the manifest I typed a placeholder md5 for `dom_entry_v540.jsx` instead of the computed
one. It was caught within the same step by hashing the file and diffing against what had been written,
and then every one of the 39 hash rows was re-verified against the clone rather than only the changed
ones. Recorded because a fabricated hash in a manifest is precisely the failure this project keeps
paying for, and because catching it by execution — not by re-reading — is the point of §6 of the
audit document this delivery corrects.
