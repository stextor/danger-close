# STATUS — knowledge-hygiene refresh: the missing entry template and four stale records, 2026-08-20

| Field | Value |
|---|---|
| Build worked against | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · built `index.html` md5 `17867edb9af4c5e7e3542aeade594f24` |
| Prior build | v5.39 · `7070018f2699503dfac4ca8e0e1b2feb` / `0563e2f6db79c19b4729bec6e09a458a` |
| Committed tree | **`5df541d`** (2026-08-20 11:02 -0400) |
| Source changed | **None.** No `.jsx`, no test, no harness, no build. Knowledge and documentation only. |
| Tests run | **None, and none were required** — see §6. |
| Version bump | **None.** No in-app string moved; the four version sites and `t1`'s STATIC checks are untouched. |

---

## 1. The freshness check that opened this

Clone-and-diff (OPERATIONS §A2) against `github.com/stextor/danger-close` at `5df541d`. Pool = **80
files; 78 match a committed file byte-for-byte.** Zero suite drift — every suite, the harness, both
`dom_entry_*` files, the parser toolkit and the fixture are at their committed hashes, including
`t1_units.mjs` at `5d205a18…` (the 108-check post-structural-session copy).

The build anchor was confirmed rather than recalled: pool `DangerClose-v5_40.jsx`, the manifest, and
clone `src/DangerClose.jsx` all hash `6b7cebb1…`. HEAD had moved five commits past `027fbd2`; the diff
is the structural-S-1 session landing itself (`t1` +48 lines, CHANGELOG, TESTING, two scope docs, one
status doc, manifest) with **no `src/` change**, so the build being worked against had not moved.

Two files did not match, and only one of them was benign:

| File | Verdict |
|---|---|
| `DangerClose-v5_39.jsx` | **Not drift.** Retained prior source under the §G rotation, confirmed against the CHANGELOG provenance line for v5.39 (`7070018f2699503dfac4ca8e0e1b2feb`). |
| `README-FIRST.md` | **Drift.** F-1 below. |

## 2. F-2 — `src/index.html` was absent from the pool, and had been for eleven releases

*(Listed first because it is the only finding with a live consequence.)*

OPERATIONS §G and the manifest's build-scaffold row both assert knowledge holds **all four** scaffold
files. It held three: `main.jsx`, `vite.config.js`, `package.json`. The Vite HTML entry template was
never there — md5 `52ef2be3080352df6198ee3b8c3507ad`, 5,029 bytes.

**Why this one matters more than a missing file usually would.** That template carries the entire
first-open **disclaimer gate** — the no-credentials disclosure, the deliberately-pessimistic notice,
the acknowledgement checkbox, the as-is warranty language — as plain inline script that runs
independently of React (OPERATIONS §N1). None of that markup exists anywhere in `DangerClose.jsx`. A
session rebuilding `index.html` from knowledge alone would have published the app **with no gate**:
the compliance-facing half of the v5.11 failure mode, in a project whose in-app disclosure is the
thing standing between a hobbyist tool and something that reads as advice.

**It would have failed loudly, not silently.** `qa/smoke_built.mjs` asserts the gate renders and that
it dismisses after acknowledgement (2 of its 16 checks), and §N3 check 4 runs it before any zip is
cut. So the mechanism designed to catch a bad bootstrap also covers a missing gate. The gap was in
the *inputs*, and every guard sat downstream of the build.

**Why no check saw it.** The scaffold row asserted four files; the §A2 hash table had no row for the
template, so there was nothing to compare the assertion against. The manifest was, in effect, the
only witness to its own claim. `src/index.html` has now been given a hash row of its own, which is
what makes the claim falsifiable.

## 3. F-1 — `README-FIRST.md` was the v5.36 edition, and the manifest said it wasn't

The pool copy opens *"danger-close-v5.36 … This IS a release. v5.36 shipped 2026-08-16"*. The v5.37
retirement list records the v5.36 edition as *"replaced in place by the v5.37 edition."* It was not.
The delete-then-upload did not take — the **§G write hazard**, and by my count the third recorded
occurrence of that specific failure (after `dom_entry_v529.jsx` and `DangerClose-v5_36-WIP.jsx`).

Compounding it: this file is one of only two pool files with no committed counterpart, so the
clone-and-diff structurally *cannot* adjudicate it. Three consecutive freshness checks logged it as
"knowledge-only by design" and moved on — true of the name, false of the contents, and nothing in the
process was positioned to notice the difference.

**Retired outright rather than rolled**, per your call. It is a per-delivery upload sheet whose
durable content now lives in the repo: the release story is the CHANGELOG entry, the per-file story is
that release's `STATUS_*.md`. Retiring it also removes a permanent blind spot from the §A2 check. The
**delivery-zip** convention in OPERATIONS §L is unchanged — a zip still ships with a `README-FIRST.md`
inside it; what goes away is the stale copy loose in the pool.

## 4. F-3 — OPERATIONS §A2 was inverted on `probe_classify.mjs`

§A2's mapping caveat read *"`probe_classify.mjs` exists only in knowledge."* The reverse has been true
since v5.30: it was retired from the pool and committed to `qa/tools/probe_classify.mjs`. The manifest
recorded this correctly the whole time. **Two documents disagreed for ten releases and nothing
compared them** — which is the same shape as F-2, where the manifest was the only witness to its own
claim.

Rewritten to state the general rule instead of one example: run the comparison **in both directions**,
pool-only files are usually packaging leftovers, repo-only files are usually history the pool
deliberately doesn't keep — **but a repo-only *build input* is a defect**, and the bullet now names
F-2 as the case in point so the correction carries its own evidence.

## 5. Files changed

| File | Change |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | §A2 table: two dead `dom_entry_*` rows pruned, six *"not yet committed"* notes corrected, `index.html` row added, preamble re-dated to the 2026-08-20 verification. Inventory: build-scaffold row records the missing template and its restoration; two harness-entry rows corrected; `SITE_CENSUS_v5_10.md` marked repo-only; probe_classify paragraph cross-references the OPERATIONS correction. Retirement list: `README-FIRST.md` entry added. |
| `docs/OPERATIONS.md` | §A2 mapping caveat rewritten (F-3). **One bullet; nothing else in the file was touched.** |
| `docs/STATUS_2026_08_20_knowledge_refresh.md` | This file. |
| *(pool only)* `index.html` | The Vite entry template, restored from the committed tree. **The repo already has it at `src/index.html` and is unchanged.** |

### Three edits beyond the literal request — flagged for veto

You approved five items. I made three further corrections in the same files, each because leaving a
*false* row in a manifest whose whole purpose is to stop a session guessing seemed worse than the
scope discipline of not touching it. Say the word and any of them comes back out:

1. **The two harness-entry inventory rows named `dom_entry_v536.jsx` and `dom_entry_v537.jsx`** —
   both rotated out of the pool three releases ago. The manifest was listing two files that do not
   exist and calling one of them "current leg." Corrected to `v539` (prior) and `v540` (current),
   with a note that rotation and manifest-rolling are two acts and the second is the one that gets
   skipped. Same defect class as the two hash rows you asked me to prune, just in a second table.
2. **`SITE_CENSUS_v5_10.md`** — inventory row for a file the pool does not hold (it is in the repo at
   `docs/`). **Marked, not deleted**, because whether the pool should carry it is your call and a
   silently-dropped row is exactly how a file becomes invisible.
3. **The probe_classify paragraph in the manifest** — already correct; I added a parenthetical
   recording that OPERATIONS contradicted it for ten releases, so the next reader sees why the two
   documents now agree.

### One workspace incident, caught and reverted

My first pass at pruning the two hash rows used a filename-anchored bulk edit. `dom_entry_v537.jsx`
appears in **two** tables, so it removed the inventory row as well — an unreviewed deletion I had not
decided on. Caught immediately (the edit reported two matches where one was expected), reverted to the
shipped file, and re-applied line-by-line with each anchor asserted before the write. No deliverable
was built on the bad state. Recording it because it is the §"workspace drift" caution arriving from a
new direction: not a phantom edit, but a *correct-looking* edit with a wider blast radius than
intended, and the only thing that caught it was the match count.

## 6. What was NOT done, and why

- **No test run.** Nothing here touches `src/`, `qa/`, or the build. The suite's last recorded state
  is **1,350 / 0 across 22 suites, parity 9/9** (the structural-S-1 session); this delivery does not
  move it and does not restate it as re-verified.
- **No CHANGELOG entry**, following the precedent of the D-3 correction: these are knowledge and
  documentation records, not shipped app behaviour. If you'd rather it appear, the natural home is a
  line in the next release's entry.
- **The `index.html` template was copied byte-for-byte from the committed tree, not reconstructed.**
  §N2 forbids inferring `main.jsx`; the same reasoning covers the template, and more so, because a
  hand-rebuilt gate would be a *disclosure* written from memory.
- **No verification that a build from the refreshed pool produces the published artifact.** It should
  now be possible for the first time in eleven releases, but I did not run it, so it is unproven. It
  is the natural first task of the next session that has a build folder open.

## 7. Open decision for Steve

**The pool name for the entry template.** OPERATIONS §L warns that there are three `index.html`-shaped
files — the built app, the Vite template, and a test-only copy — and says to name them distinctly. The
pool is flat, so the template lands there as bare `index.html`, which is what the manifest's scaffold
row has always called it and what §N's build recipe expects. I delivered it under that name to keep
both documents true without editing them.

The residual risk is a session pulling `index.html` from a flat pool and taking it for the built app.
Its hash row now says in bold that it is not, and the built artifact never enters the pool — so the
collision is theoretical. If you'd rather remove it entirely, the alternative is `src_index.html`,
which costs one added line in §N1's build recipe (copy it to `src/index.html`, exactly like the
`vite_config.js` dot gotcha). **I did not make that call unilaterally because it changes a documented
build step.**
