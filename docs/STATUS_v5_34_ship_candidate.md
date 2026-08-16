# STATUS — v5.34 ship candidate. Package cut, fully green, NOT yet pushed.

**Written:** 2026-08-15 · **Source:** `db5efe3ccbdbacc05e7c76a8c31e74a0` · **Built:**
`94c41e9c58dfb1371bc0ec3f075576a6`
**Received:** `3bd5c37bab79bb8ab734bc1a08df6c97` · **Prior build:** v5.33 `df10c622…` / `c998f5ff…`
**This supersedes `STATUS_v5_34_option_C_backout.md`, which is retired with this release.**

---

## 0 · Freshness (OPERATIONS §A / §A2) — clean, checked first

Clone-and-diff against repo HEAD `2c79a34`. `src/DangerClose.jsx` = `df10c622…` = shipped v5.33 =
manifest = the pool's copy. All 13 handoff uploads matched the previous status doc's §7 hash table
byte-for-byte. Pool: 82 files, **48 content-matched to the repo, 34 knowledge-only** (three more
than the previous session recorded — the three v5.34 documents it added).

The handed-off WIP reproduced exactly before any edit: **1155 / 0 · tooling 50 · parity 9/9 · prior
leg 565.**

⚠ **Two pool notes carried forward into the refresh instructions.** The pool's `METHODOLOGY.md` is
the v5.33 copy (correct for what is shipped, stale for v5.34 — the v5.34 file arrived as an upload).
And the pool's `STATUS_v5_34_option_C_backout.md` is an **earlier revision** than the one handed to
this session: it lacks the METHODOLOGY-done note, the §B2 sweep result and the DOCS_HTML item. Both
are handled in `README-FIRST.md`.

---

## 1 · What this session did

The previous session left four items owed: the `DOCS_HTML` correction, the CHANGELOG, the build,
and packaging. All four are done. The first one grew.

### 1a · The copy correction was scoped as one site and is four

The scope premise was *"a one-line-blob edit"* of the Field Manual. Censused against source, the
false claim lived at **three** sites, and v5.34 falsified a **fourth** statement the scope never
named:

| Site | Text | Status |
|---|---|---|
| `DOCS_HTML`, Taxes-tab entry | *no sale, no gains tax* | false, and false at v5.33 |
| **L8930, the live Roth tab** | *No sale, no capital-gains tax* | false, and false at v5.33 |
| L4067–4068, Engine A comment | *no sale, no gains tax, smaller Roth forever* | false (comment only) |
| **L8933 + `DOCS_HTML`** | *0% gains: selling from taxable is modeled as tax-free* | **true at v5.33, falsified by v5.34** |

**Measured, not read.** Under `withhold`, `due` is the year's *whole* tax+IRMAA bill; the conversion
absorbs `min(conv, due)` (L4073–4077) and any residual falls through to the brokerage sale (L4087),
realizing gain (L4100) and paying LTCG tax (L4103). On the `t3` fixture household at the **shipped
default share of 0**, v5.34 makes **19 funding sales realizing $111,359 of gain and $9,428 of LTCG
tax**. On v5.33 the same household at a declared 50% paid **$10,686 more lifetime tax** under
withholding than at 0. The claim holds only while the conversion is big enough to swallow the whole
bill — at $70K/yr on that household it is, which is why it was plausible for nine releases.

Reproduce with `qa/probe_withhold_gain.mjs`, which ships with the release.

### 1b · §C0 caught two silent defects in my own edits, and it took three passes

Both times the anchored replacement was correct about the span it replaced and **wrong about the
text that followed** — precisely the failure §C0 documents. Pass 1: the first list item's em-dash
aside ran into the list's second item (*"…growth accrues gain from there, an appreciated brokerage
sale…"*). Pass 2: the same aside, moved, ran into the approximations list. Pass 3 puts the caveat
in its own sentence and parses. **Only the mandated read-back caught either** — both parsed, both
would have shipped, and on a 143,000-character line neither is visible in any normal view.

Blob delta reconciles exactly: sub-edits sum to **+355 chars**, measured **+355**. Nothing was
silently deleted.

⚠ **One addition to §C0 worth recording.** Character counts differ between tools: the blob measures
**143,489 chars in Python and 143,492 in Node**, same 144,615 bytes, because JavaScript counts
UTF-16 units and the manual holds three astral characters. **The byte count is the unambiguous
one.** §C0 already warns that chars and bytes differ; it does not say that *chars* differ too.

### 1c · The coverage that was missing

A §B2 sweep confirmed independently: **no suite asserted any of this copy** — the two textual hits
(`t22` line 361, `t4`'s HSA checks) are unrelated. That is why a false statement survived nine
releases. `t4` now asserts the Field Manual (via the `srcdoc` attribute — a `textContent` read
passes vacuously) and the live Roth tab, driving the funding selector to reach withhold mode.
**Gated per leg**: each leg asserts the copy its own build carries. `t4` **176 → 191** current,
**176 → 184** prior.

**Two negative controls, both firing, each only on the surface it corrupted:**

| control | edit | result |
|---|---|---|
| C3 | the manual's two old clauses restored | `t4` fails **3**, all in the docs block |
| C4 | the Roth tab's two old clauses restored | `t4` fails **5**, all on the tab |

### 1d · `domdiff_withdrawal.mjs` was broken, not stale-passing

Its hardcoded default pair was **four releases behind** (v5.29 → v5.30) and it **died at module
load** looking for `dom_v529.cjs`. Re-pointed to v5.33 → v5.34, where it passes **10/10**: the
Withdrawal tab is identical across the pair apart from the version string. A stale default here
fails loudly — but as a missing module, which reads like a broken harness rather than a stale test.
The manifest row now says so.

---

## 2 · Verification

**1170 passed / 0 failed**, parsed from suite output and **re-run from the packaged files**, not the
working copies (§L).

| | |
|---|---|
| baseline current leg | **580** — t1 93 · t2 18 · t3 36 · t4 191 · t5 58 · t6 21 · t10 163 |
| parity | **9/9 strict** |
| feature | **581** — t7 41 · t8 38 · t9 14 · t11 40 · t12 23 · t13 42 · t14 44 · t15 11 · t16 24 · t17 63 · t18 50 · t19 22 · t20 94 · t22 75 |
| **APP TOTAL** | **1170** |
| prior leg (v5.33) | **573**, counted separately |
| tooling (`t21`) | **50**, counted separately |
| built artifact | **16/16** |
| Withdrawal DOM diff | **10/10** |

**The build was validated before its hash was trusted (§N3a):** v5.33 rebuilt from its own
unmodified source to `c998f5ff760c6c5e04ab6173a68f6421`, **byte-identical to the published
artifact**. §N3 on the new file: four `v5.34` strings and **zero stale `v5.33` strings**; no
`<script src>`; only the intentional Google Fonts links (the two `v5.32` occurrences are historical
references inside the manual's own prose, checked individually); `smoke_built.mjs` 16/16.

---

## 3 · What remains

- **The push, and §F ship verification after it.** Nothing in this package has been committed.
- **The knowledge refresh**, delete-first, per `README-FIRST.md` §2.
- **A decision that is yours, not mine:** the wording of the corrected copy. It is isolated in five
  small replacements and cheap to change — the edit script is reproducible and each anchor is
  asserted unique.
- **v5.35 needs its own scope.** Fix the sequencer so the RMD draws from the Traditional buckets and
  the taxable sleeve funds only `max(0, drawNeeded − rmd_y)`; then re-land the drawdown gain
  routing. Expect parity to move and many pinned figures with it, each needing independent
  hand-computation. Flip `t19`'s pin and its extinction set together. Engine C's QCD-blindness
  (STOP report §4) resolves for `t17` once this lands but stays latent generally.
- **Not done, and not owed by this release:** the ACA-premium sale's gain reaches MAGI but is still
  untaxed while the funding sale's is charged. Disclosed in the CHANGELOG and METHODOLOGY, optimistic
  in direction, recorded for the next step.

---

## 4 · Hashes to hand forward

```
src/DangerClose.jsx              db5efe3ccbdbacc05e7c76a8c31e74a0   <- CHANGED this session
index.html (built)               94c41e9c58dfb1371bc0ec3f075576a6   <- NEW
CHANGELOG.md                     see MANIFEST.txt                   <- CHANGED
TESTING.md                       see MANIFEST.txt                   <- CHANGED
VERIFY.sh                        see MANIFEST.txt                   <- CHANGED
PROJECT_KNOWLEDGE_INDEX.md       see MANIFEST.txt                   <- CHANGED
METHODOLOGY.md                   4f941d6c1c79ce97cf3b4f3a16273445   unchanged (prior session)
qa/qa-baseline/t4_dom.mjs        0f16ce11ea892be6b8b70467143bd7e7   <- CHANGED this session
qa/domdiff_withdrawal.mjs        a8b3922a1875aee174013530d9ccce8a   <- CHANGED this session
qa/probe_withhold_gain.mjs       b7fbc3fc34a0684c88b79123ddcda57c   <- NEW this session
qa/qa-baseline/t1_units.mjs      3d2583693475187681a050c47443baa6   unchanged (prior session)
qa/qa-baseline/t2_engines.mjs    769bc6a60b1b58ae385e5b2d9a7cc24a   unchanged (prior session)
qa/qa-baseline/t3_roth.mjs       1ee958134c1236e22847d7a9647cdcf2   unchanged (prior session)
qa/qa-baseline/t5_storage.mjs    f1b0072bf7cb72a2e387bad52a0132e9   unchanged (prior session)
qa/qa-baseline/t6_single.mjs     5a28799680adb9dc4660b27fc954d29e   unchanged (prior session)
qa/qa-baseline/shim.txt          fec4551cd77cb2d4be0b19f6c54bb621   unchanged (prior session)
qa/qa-baseline/dom_entry_v534.jsx a5db4a5643f2433fa994ea6758b308db  unchanged (prior session)
qa/t19_engineD_exact.mjs         0f300d46480013cf8b515735cd8816d8   unchanged (prior session)
qa/t22_aca_floor.mjs             2f626831143668ac86818ceac77c2465   unchanged (prior session)
qa/capture_gain_fp.mjs           99f096c7c332b5ec7a87949681386a71   unchanged (prior session)
```

`MANIFEST.txt` in the package is the authority; the rows above are the ones a next session most
often needs. Run `t22` as `node t22_aca_floor.mjs v533` — its committed default is still `v532`.

**Expected on arrival: 1170 passed / 0 failed · tooling 50 · parity 9/9 · prior leg 573.** If that
does not reproduce, it is the workspace, not the release.
