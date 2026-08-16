# FIXUP — v5.36 suite commit completed, 2026-08-16

**What was wrong, and whose error it was.** The v5.36 release zip staged only the files session 2
changed, on an unexamined assumption that session 1's suite edits were already repo-homed — the
session brief said plainly they were not ("nothing from session 1 is committed"), and packaging never
re-checked. It also laid `t4_dom.mjs` flat under `qa/` when its home is `qa/qa-baseline/`. Result,
in the v5.36 commit as first pushed: `t1/t3/t5/t6` (qa-baseline) and `t20` were the PRE-session-1
copies, `dom_entry_v536.jsx` was absent, and `t4_dom.mjs` existed TWICE — the shipped copy at the
wrong path, the stale one at the right path (E-18's dual-homing defect class, introduced into the
repo itself). A clone-alone build could not reproduce the release: `t1`'s v536 leg fails at the
version tag and the v536 DOM bundle cannot build. The error was the packager's (the session), not
the maintainer's.

**Why the release's own packaging check missed it.** The "suite re-run from packaged copies" drew
`t1/t3/t5/t6/t20` and the `dom_entry` files from the project-knowledge pool, so it verified the
pool+package UNION — never "clone + package alone." The binding check is now stated correctly:
**reproduce the release run from a fresh clone with zero pool inputs.** That check was executed for
this fixup and passed — grand 1924/0, per-suite identical to the release record, with the prior
source taken from git history (`bec56f8`) rather than the pool.

**This commit.** Seven file operations, no source change, no version bump (`src/DangerClose.jsx`
and `index.html` are untouched at `b7396c1c…` / `c6d7474…`):

| Path | Action | md5 |
|---|---|---|
| `qa/qa-baseline/t1_units.mjs` | replace (session-1 copy) | `1fb0caf8075ff96686dd261e4d602b3d` |
| `qa/qa-baseline/t3_roth.mjs` | replace | `6fd3d14f0879917d60802f2ecfcb15b5` |
| `qa/qa-baseline/t4_dom.mjs` | replace with the shipped copy | `6056840ef19e25d4f29ffe79db009ad8` |
| `qa/t4_dom.mjs` | **DELETE** (the wrongly-placed duplicate) | — |
| `qa/qa-baseline/t5_storage.mjs` | replace | `29d7f809e9f5af6cbec89358b7040afd` |
| `qa/qa-baseline/t6_single.mjs` | replace | `d3b49873a73f336dbf7f3e3cd0da7597` |
| `qa/t20_other_taxtype.mjs` | replace | `bfa3227e90bb3acc16f0cde5e6770536` |
| `qa/qa-baseline/dom_entry_v536.jsx` | **ADD** (was missing) | `c387ed8b1e89fe598c1e4d91323eacf9` |

The pool needs NO refresh — every one of these files is already in knowledge at exactly these
hashes; only the repo was short. `STATUS_v5_36_shipped.md` §4 remains accurate as the hash record;
this fixup is the repo catching up to it. Process rule adopted from this: **the packaged-copy
re-run must source every input from the zip and the clone, nothing from the pool**, and the
release checklist gains a clone-alone reproduction step.
