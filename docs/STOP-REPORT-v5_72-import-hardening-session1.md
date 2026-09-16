# STOP REPORT — v5.72 import hardening, SESSION 1 (a planned handover, D-6)

| | |
|---|---|
| KIND | **handover** — a workbench, not a release. **v5.71 stays current**: source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html` `e1bd283b638cdab74941804708987bb2` |
| Scope | `SCOPE_IMPORT_HARDENING.md` — its §9 is this session's build record; its §3a records D-4's measurement; its §7a opens **D-10** |
| Built against | repo `f77361c`, pool 125 files, §A/§A2 clean (below) |
| Workbench source | `handover/DangerClose-v5_72-WORKBENCH.jsx` — **`e819493421b0283965de7b06f497af43`**. Still says v5.71 at all four in-app sites; **no version bump** |
| Destination of this file | `docs/` **and** the pool, with a manifest description row (the NM-handover shape). Rotates to repo-only when v5.72 ships |

## 1 · What this session did, in the brief's order

1. **§A freshness — clean.** Source md5 identical in manifest, CHANGELOG, pool and repo. By content,
   every one of the 125 pool files has a byte-identical committed copy **except `DangerClose-v5_70.jsx`**
   (expected — the prior leg is never in the repo), and every pool file is named in the manifest.
   ⚠ **The scope package's post-ship `package_check` (four arguments) was NOT run**: the package zip was not
   uploaded to this session. The pool-vs-clone and hash-row comparison above covers the substance of its
   sections J and K; it is not the tool. **Session 2: run it if the zip is still to hand.**
2. **Prior-leg truth.** `probe_import_hostile.mjs` on the unmodified v5.71 reproduced the scope's §1 table
   on every case run (`valid`, `portfolio-string`, `positions-null`, `other-null`, `expenses-bad`,
   `skin-constructor`, both paths), each log read whole, memory read **after** `[after import]`.
   Baseline suite on the unmodified v5.71, from the run's output: **app 3,647 · tooling 108 · GRAND 3,755 ·
   0 failing · parity 10/10.**
3. **The source-traced claim, RUN.** A stored plan with `positions: [null]` on v5.71 lands on the landing
   screen **with the rejected plan in memory**, and Start Fresh then overwrites the stored copy **without
   asking** (the loader believes no plan exists). Both now pinned (`t38` L-1, L-4).
4. **D-4 measured**, caps chosen — scope §3a. 500 rows per list, 5 MB.
5. **H-1 … H-6 built** — scope §9. **The birth-year half of H-6 is NOT built** (D-10, §2 below).
6. **`t38_import_hardening.mjs`** and **`controls_v572_import.py`** written and run (§3).
7. **Full suite**, both legs, with the workbench as the `v571` current leg (§3).

## 2 · The STOP: D-10

The scope's H-6 says *"delete a non-numeric birth year, like its neighbours."* Its neighbour is the v5.9.1
clamp `for (k of ["dobA","dobB"]) if (PORTFOLIO[k] && PORTFOLIO[k].year != null) …`. **`census.cjs dobA`
shows the field is only ever written as a STRING** (wizard L3581 `` `${byA}-06` ``, My Data `buildPortfolio`
`dobA: dobA || undefined`), and `buildPlanTimeline` reads it through `_ymd(string)`. So `.year` is always
undefined and **the v5.9.1 birth-year clamp has never fired on a real plan.** Adding an `else` would add dead
code and let the scope read as done. `probe_import_hostile`'s `years-absurd` did not test birth year either
— it built `dobA` with `Object.assign({}, <string>, …)`, which the app ignores.

Measured on v5.71: `"9999-01-01"` reaches the timeline as year 9999 (Social Security dated 10066);
`"9999-01-01"` and `"0001-01-01"` import and render with no hang and no error. A latent correctness gap, not
a crash. **The decision, with a recommendation, is the scope's §7a D-10.** `t38` Y-1 / Y-2 pin today's
behaviour on both legs; when D-10 is taken they are **re-gated, not deleted**.

## 3 · Verification

| What | Result | Source |
|---|---|---|
| `t38` v571 (prior leg: every defect pinned) | **83 passed, 0 failed** — run from the packaged copy | `node t38_import_hardening.mjs v571` |
| `t38` v572 workbench | **184 passed, 0 failed** — run from the packaged copy | `node t38_import_hardening.mjs v572` |
| Negative controls | **13 of 13 fired; V1 fired; watched md5s unchanged** | `python3 tools/controls_v572_import.py v572 1`, then `… v572 V1` |
| Full suite, workbench as `v571`, **both legs rebuilt with the new shim** | **app 3,647 · tooling 108 · GRAND 3,755 · 0 failing · parity 10/10** — identical to the unmodified baseline, as it must be: no existing assertion changed | `runsuite.sh v570 v571` |
| `package_check` (pre-ship: package, clone `f77361c`, run folder) | **38 passed, 1 failed, 1 skipped.** The skip is K's pool half, which is post-upload by definition. **The failure is G-1 naming `DangerClose.jsx -> src/DangerClose.jsx`: the workbench, which this handover deliberately carries in `handover/` and not in `github/`.** It is recorded, not exempted — G-1 does not know `handover/`, and teaching it to (under `KIND: handover`, accept `handover/*-WORKBENCH.jsx` as the home of a differing source) is a tooling item for session 2, not something to patch into the gate that is judging this package. G-1 also caught two real things first, both fixed: the run folder's `package.json`/`package-lock.json` had drifted under `npm install` (reverted to the committed copies, per the check's own comment), and a scratch `qa/t38_pkg.mjs` was left behind (deleted) | `node qa/tools/package_check.mjs <pkg> <clone> <run>` |
| §B1a — does any assertion read the removed wording? | **No.** 600 regex literals executed against the old and new copy; the candidates were number/parser helpers and `t38` itself. The one live reader was `probe_import_hostile.mjs`'s error matcher — **updated** | `tools/suite_regex_probe.cjs` + an AST string walk |

**The controls, one reversion each.** C1 validation only · C2 rollback only · C3 page-load flag · C4 the
missing `await` · C5 `skinVars`'s truthy fallback · C6a/b/c each skin gate **alone** · C7 no error boundary ·
C8 row cap off by one · C8b byte cap on both paths · C9 claim-age clamp · C10 adjustments unrecorded · **V1:
a render throw inside My Data, boundary present, must still turn `t4` and `t9` red** (the brief's trap 3).
Each control lists its collateral failures for reading, and each was read: C1's are the shapes that do not
throw, now accepted (memory replaced); C4's are the draft dropped before the unawaited import, so storage
differs; C9's are the same unclamped ages, unreported; C7's is B-6, which needs the fallback's button.

⚠ **V1 was first reported SILENT, and that was the control's fault, not the app's.** `t4` does not count a
failure here — React rethrows the render error out of `act()`, `t4` dies with the injected error in its stack,
and `runsuite` reports it as DIED. That is loud. The predicate accepted only a failure count; it now accepts a
failure count **or** a non-zero exit that names the injected error, and was re-run alone: `t4` DIED rc=1
naming it, `t9` 4 passed / 10 failed. **C1–C10 ran under the revision just before that fix** — the control
definitions are identical; only V1's rule and print line changed.

**Why each skin gate needed its own witness.** Once `skinVars` falls back safely, reverting any one gate still
*renders*, so a render check cannot see it. `t38` K-2 / R-7 / S-7 count the **selected** skin in the theme
picker (exactly one, the default), and S-8 is that witness's own positive control (a real skin is selected).

### Limitations, disclosed

- **The Reload navigation is not observed.** jsdom's `location` is unforgeable; `t38` B-6 asserts only that
  pressing Reload changes no data.
- **D-4 timings are jsdom's**, not a browser's.
- **`t38` is not in `runsuite.sh`** (below), so a runner total does not include it yet.
- **Process lessons, for the next session on this sandbox:** it has **one CPU and 3 GB**, so parallel mutants
  gain nothing; the 300 s tool limit and the turn boundary both **kill background jobs** (a controls run and two
  suite runs were lost that way — finish and read inside one turn, poll in ≤ 250 s steps); and
  `pkill -f <pattern>` matches its own command line and kills the calling shell (use `grep '[p]attern'`).
- **Two harness lessons from this session**, both now encoded: an `uncaughtException` handler that only
  records turned a crashed `t38` into a silent 0/0 — `t38` now prints DIED and exits non-zero; and a skin
  witness that searched every tab ran the harness out of heap — it now opens the `skins` tab by name.
- **Behaviour change beyond the scope's letter (H-2):** an unsaved My Data draft is dropped only AFTER an
  import succeeds. v5.71 dropped it first, so a rejected file cost the user their edits. `t37` IM-1 still
  holds; `t38` I-5 pins the new behaviour. **Flagged for the maintainer.**
- **New user-facing copy, for the maintainer's eye:** the landing-screen notice for an unreadable stored
  plan, the error-boundary screen, the adjustment notice, and the over-cap message. The D-2 sentence is used
  verbatim. The three flash notices follow their siblings' uppercase form.

## 4 · What session 2 owes

1. **D-10** — build it if the maintainer takes (a); re-gate `t38` Y-1/Y-2 either way.
2. **S-2** (stage 2 + Maine, D-7 / D-8), and `t29` F-6 / `t35` D-8 re-inverted at `v572`.
3. **V** — the bump, priced by `vercensus.cjs` (86 points **plus `t38`'s own ladder**, which is `v571`/`v572`
   and `POST_FIX = VER === "v572"`). Rename the workbench to `src/DangerClose.jsx` only then.
4. **Register `t38` in `runsuite.sh`** on both legs, under the APP total, and update `TESTING.md`'s counts
   from suite output.
5. Rebuild `index.html`, `smoke_built`, the rotation, CHANGELOG / METHODOLOGY (**no modelling change:
   METHODOLOGY is not owed** unless D-10 moves figures — its year clamp would, for impossible years only).
6. Re-run `controls_v572_import.py` against the bumped source; its anchors are source text and one may move.
7. **After uploading this package**, run `package_check` with all four arguments (pool fourth) to close K's pool
   half and J — and do the same for the scope package, whose post-ship run is also still owed (§1).
8. Consider teaching `package_check` G-1 about `handover/` (§3).

## 5 · Every file this session modified or created — §L's stop table

**Committing the `github/` files is SAFE and was checked, not assumed:** `t38`, the controls and the probe
are run by nothing in `runsuite.sh`; `dom_entry_v572.jsx` is dormant until a `v572` leg exists; and the
**shim change was exercised on every leg** — v570 and v571 by the full run above, v572 by `t38`.
**Nothing code-shaped goes to the pool** — no rotation until v5.72 ships, and the pool's `shim.txt` hash row
stays true because the pool copy is unchanged.

| File | md5 | Destination |
|---|---|---|
| `handover/DangerClose-v5_72-WORKBENCH.jsx` | `e819493421b0283965de7b06f497af43` | ⚠ **HOLD — not `src/`, not the pool.** The unshipped workbench. Keep the zip until session 2 |
| `github/qa/t38_import_hardening.mjs` | `d040db28d02a9bb1f5d18896cb0a8b89` | `qa/` — **NEW.** Not in `runsuite.sh` yet (§4 item 4) |
| `github/qa/qa-baseline/shim.txt` | `8317755b414ff55775a08705a89996f7` | `qa/qa-baseline/` — **repo only until v5.72 ships**; the pool keeps v5.71's copy and its hash row |
| `github/qa/qa-baseline/dom_entry_v572.jsx` | `37ad4028ba6a60b6a9701d0faf975070` | `qa/qa-baseline/` — **NEW**, dormant |
| `github/qa/tools/controls_v572_import.py` | `ba4951026e8e8b9ef28f2b844673bc9e` | `qa/tools/` — **NEW.** Python, no shebang |
| `github/qa/tools/probe_import_hostile.mjs` | `e9c24d46c8d6201682ce2ff89c23f6d5` | `qa/tools/` — never pooled |
| `SCOPE_IMPORT_HARDENING.md` | `f568eb10106478e56ddf42255cf0cf0c` | `docs/` **and** the pool (replace). Description row only |
| `CHANGELOG.md` | `aeaf3333fb97e97ac64b86e92b0c5a50` | repo root **and** the pool (replace); hash row rolled |
| `PROJECT_KNOWLEDGE_INDEX.md` | `a5753532d2f685de1745d61e94ded3ca` | repo root **and** the pool (replace) |
| This stop report | — | **`docs/` AND the pool**, with the manifest description row. **No md5 row** (D-3 excludes this class) |
| Session scratch: `probe_dob_scratch.mjs`, `/tmp/mp.mjs`, `/tmp/dobprobe.mjs`, the D-4 logs | — | **session-only** — folded into the probe or recorded in scope §3a; discard |

