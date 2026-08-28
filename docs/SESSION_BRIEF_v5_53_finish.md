# SESSION BRIEF — finish and ship v5.53

**Written** 2026-08-27, at the end of the session that built it. **This is a brief, not the scope.**
`SCOPE_D10_MODELLING_v5_53.md` is the scope; read its **§9 and §10** in full before touching
anything — they were written at the end of the build and carry what the build actually found.
**Every number below was printed by a command in the session that wrote it, per §A0.**

---

## 0. The state you start from

**Shipped build v5.52** — `src/DangerClose.jsx` md5 `40fd122d557a4fb00653c3e4384e1650`, built
`index.html` `f1944c844d7b9b603ac977da4e58b77f`, repo **`8acc62f`**.

**v5.53 is BUILT and the suite is GREEN. It is not shipped.** Source md5
**`12a007ed8e57a391acba67b799eb5a2f`**. Suite **2,718 app checks / 0 failing** (prior leg v5.52
**1,018** · current leg v5.53 **1,022** · parity **10/10** · feature suites run once **668**) ·
tooling **82** · **2,800 total**.

⚠ **The work exists only in a session workspace at `/home/claude/vrun3` and you should assume it is
gone.** If it is, the source changes are small and fully described in the scope's §1–§4 plus §9.4;
the suite changes are described in §3 below. Rebuilding them is a morning, not a week — but
**re-derive, do not retype from memory.**

## 1. What is DONE

- **The fix.** `_divLadder` computed once (D-4 constant base, HSA held out, mirroring Engine C's
  L4432), added to `nonSSincome` and `magi`. `grossTaxable` untouched *and pinned as untouched*.
- **The disclosure narrowed in the SAME release** (scope §8), both surfaces, with the v5.52 sentence
  pinned extinct on both.
- **The health warning** — `IRMAA? †` plus the footnote's *"† The IRMAA? column is an indication,
  not a verdict."* Permanent qualifier, not interim. Scope §9.4 says why.
- **`METHODOLOGY.md`** carries the measured section.
- **`t32_ladder_dividend.mjs`** — new suite, the engine-layer witness, near-cliff fixture, four
  negative controls.
- **v553 registered across 14 suites**, four shapes; `t24`, `t28`, `t8` corrected (scope §9.2, §9.3).

## 2. What is LEFT — in order

1. **§A / §A0 / §A2 freshness check.** Clone fresh; diff pool against tree **both directions**.
   Confirm `8acc62f` is still HEAD and no one has shipped in between.
2. **Rebuild the run folder** and re-run the full suite from it. **Do not trust the totals above
   without reproducing them** — they were true in the build session.
3. **`package-lock.json`** — Steve's decision 2. Commit one so artifact reproduction is by
   construction rather than registry luck. Generate it from the scaffold `npm install`, not by hand.
4. **Build `index.html` per §N** — ⚠ the **real `src/main.jsx`** (`d9eca7b469a3fb7ec1c5325fd4bf8145`),
   never a reconstructed one. Then `smoke_built`, expecting **16/16**.
5. **OPERATIONS §L, one line** — Steve's decision 5. How files reach the repo, not just what goes in
   the zip: **GitHub's drag-and-drop upload silently renames dotfiles.** It landed a `.gitignore` as
   a file called `download` and cost two commits this week. Edit-in-place is the safe route.
6. **CHANGELOG · METHODOLOGY (done) · manifest · rotation** (drop v5.51, add v5.53).
7. **Retire the scope AT the ship** (§I) — the item most often reached last and skipped.
8. **Re-read every document this release creates or touches** (§I). Grep the whole tree
   case-insensitively. ⚠ **Exclude `src/DangerClose.jsx` from every grep** — the `DOCS_HTML` blob is
   one 149k-character line and pulling it back cost real budget twice in the build session.
9. **Package per §L**, `KIND: app-release`, then `qa/tools/package_check.mjs <zip> <tree> <workspace>`
   — **all three arguments.**

## 3. ⚠ Traps this build hit — every one cost time

**The DOM diff cannot witness this release.** It reports **32**, the "nothing moved" reading, and it
is blind to the Roth tab. **Do not read 32 as evidence the release is inert, and do not chase it as
a defect.** Scope §9.1. `t32` is the witness.

**Two §86 statute models needed the same correction.** `t24` failed 7, `t28` failed 12, and neither
was a defect — both models lacked the dividend term Engine C has always had. **Correct the ORACLE
first, then the frozen spot figures.** In `t24` that ordering fixed 4 of 7 outright and left 3 spot
pins on rows the corrected oracle then validated. Scope §9.2.

**`t8` has no version tag.** It reads the root `DangerClose.jsx` alias and always describes the
CURRENT build, so its census counts are **not** gated per leg. Rolled 8 → 9.

**`t31` now has an `until` field.** The v5.52 key expires at v5.52 because v5.53 falsified its copy;
past `until`, the assertion inverts to absence. If a later release falsifies another key, use the
same mechanism rather than deleting the key.

**The equality invariant in `t1` is a LOCK.** It asserts the ladder's term set equals Engine C's
**minus `{capGain_y}`**. It goes green *because* the term stayed out. If a later release adds
`capGain_y`, tighten it in the same release or it holds the omission in place.

**Run-folder mechanics.** Aliases: `qa/app_<cur>.mjs`→`app_testable.mjs`, `qa/dom_<cur>.cjs`→
`dom_bundle.cjs`, `<cur>.jsx`→`DangerClose.jsx` at the ROOT, `METHODOLOGY.md` at the ROOT.
⚠ `t19` runs from `qa/`. ⚠ `t22` defaults to `v532` — pass the prior tag. ⚠ `t31`/`t32` take tags.
⚠ **The DOM mount is slow — one probe exceeded the execution limit.** Budget for `t4` taking minutes
and run it alone.
**Deps:** `esbuild react react-dom d3 xlsx mammoth jsdom acorn acorn-jsx acorn-walk`.

## 4. What v5.53 does NOT fix — the CHANGELOG must say so

The ladder's MAGI is still narrower than Engine C's by **`capGain_y`** (decision D-2 — $342 across
the whole ladder) and by the **`work_y` / `spouseBWork`** difference (out of scope). Both can only
add to MAGI, so the residual error is still **optimistic**. Both are named on both user surfaces.
**A release that fixes most of a disclosed defect must not let the CHANGELOG imply it fixed all of
it.**

## 5. Still open elsewhere

- `TESTING.md`'s cross-version table: three disagreeing totals (1059 / 740 / 450), missing t23–t32.
  Steve's decision 3 was **not yet** — fold it into a quiet release, don't make work for it.
- The §F live-page gap: the committed tree can be verified, the served page cannot.
- `SCOPE_STATE_FIXTURES.md` and `SCOPE_v5_40_disclosures_and_mechanics.md` both await decisions.

## 6. Patterns worth carrying in

> **A gate that cannot see the thing it gates reports green either way.** The DOM diff said 32 on a
> release built to move a figure. Read what a suite *asserts*, never what it is *called* — and check
> which surface it actually walks.

> **When a model and the app disagree, ask which one is wrong.** Twice this build the model was.
> Correcting the oracle is the fix; adjusting the frozen figures first is adjusting until it matches.

> **A census pin going red is the census pin working.** `t8` caught a call site the release added.

> **State nothing a command has not printed this session.**
