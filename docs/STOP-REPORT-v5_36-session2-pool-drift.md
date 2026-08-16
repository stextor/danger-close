# STOP REPORT — v5.36 session 2: six session-1 suite files are missing from the pool

**Date:** 2026-08-16 · **Status: build not started; no file edited.** Freshness check (OPERATIONS
§A/§A2) failed its suite half, and the failure contradicts the session brief's premise, so per the
ground rules this session stops and reports rather than adapting.

---

## What the brief asserts

`SESSION_BRIEF_v5_36_SESSION2.md` states:

> **Everything you need is in project knowledge — no uploads.** That was verified, not assumed …
> **Seven suite files in the pool DIFFER from repo HEAD, and that is INTENDED, not drift:**
> `t1_units.mjs` `t3_roth.mjs` `t4_dom.mjs` `t5_storage.mjs` `t6_single.mjs`
> `t19_engineD_exact.mjs` `t20_other_taxtype.mjs`. Take those from the **pool**.

## What measurement shows

Clone-and-diff against `bec56f8` (fresh clone 2026-08-16; HEAD confirmed `bec56f8`, "v5.35";
`src/DangerClose.jsx` = `a28843d3e1f441e90c765419264954ff`, the shipped v5.35 — both match the brief).

| File | Brief says | Measured |
|---|---|---|
| `t1_units.mjs` | differs (session-1 copy) | **DIFFERS — session-1 copy confirmed.** md5 `1fb0caf8075ff96686dd261e4d602b3d`; registers `"v536"`; carries the v5.36 third branch (one call site, caller `computeWithdrawalPlan` by name) |
| `t3_roth.mjs` | differs | **byte-identical to repo HEAD** (`045cc3f9…`, the manifest's v5.35-era row). No `v536` registration |
| `t4_dom.mjs` | differs | **byte-identical to repo HEAD** (`da8e9385…`). Version ladder ends at `"v535"`; the L537-area disclosure block gates `v533/v534/v535` only |
| `t5_storage.mjs` | differs | **byte-identical to repo HEAD** (`557c921c…`). No `v536` |
| `t6_single.mjs` | differs | **byte-identical to repo HEAD** (`186720f0…`). No `v536` |
| `t19_engineD_exact.mjs` | differs (32 → 56 checks) | **byte-identical to repo HEAD** (`934d8182…`) — the 32-check pre-session-1 file. Zero occurrences of `taxGainPool`, `gainBasis`, or a mixed-pool block |
| `t20_other_taxtype.mjs` | differs (94 → 99 checks) | **byte-identical to repo HEAD** (`8bb23022…`) — no ordinary/gain decomposition rewrite, no HSA split |

Exhaustive scan for the session-1 copies under any other name: `grep -l taxGainPool` across all 85
pool files hits only `DangerClose-v5_36-WIP.jsx` and `STATUS_v5_36_partial.md`; `grep -l '"v536"'`
hits only `t1_units.mjs`. **The session-1 versions of the six files are not in the pool under any
name.**

What DID survive the session-1 refresh, verified by hash against the brief:

- `DangerClose-v5_36-WIP.jsx` = `c5d9253c44a39bd0c1eb3300e94666a3` ✓ (the WIP engine work is intact)
- `DangerClose-v5_35.jsx` = `a28843d3…` ✓ · scope rev 3 = `49f9e8a9…` ✓ · STATUS = `c508089…` ✓
- `t1_units.mjs` (session-1 copy) ✓ · `dom_entry_v536.jsx` ✓ · `dom_entry_v535.jsx` = `74992ed2…` ✓
- Pool count 85 ✓ (which is why a count check could not have caught this)

## Consequence

**The documented base (leg 588 / prior 587 / parity 9 / feature 622 / APP TOTAL 1219) cannot be
reproduced from the pool as it stands.** Concretely, without running anything: the v536 leg fails
t3/t4/t5/t6 version-registration checks (the "version tax" edits are absent); t19 runs 32 checks,
not 56 — the entire v5.36 block (discriminating mixed-pool case, hand-computed sale, full-basis
surplus, basis conservation, exact-zero exclusion comparison, sub-pool-as-balance) is gone; t20
runs 94, not 99 — the E2 ordinary/gain decomposition and the HSA split are gone. The negative-control
verdicts in STATUS §7 (C1–C7 all fire) were demonstrated **against the 56/99 files** and are not
currently demonstrable.

The brief's "reproduced from a pool-reconstructed folder at the end of session 1" claim was
presumably true when written; it is false against the pool this session sees. The likely mechanism
is the known one (§G): knowledge is flat and add-only, refreshes are delete-then-upload, and a
partial refresh is invisible — some uploads took (WIP jsx, t1, dom_entry_v536), six did not, and
the pool count landed back on 85 either way. This is the **fourth** recorded pool-drift block.

Also confirmed while checking: the manifest's already-known drift (row lists `dom_entry_v533.jsx`,
omits `dom_entry_v535.jsx` `74992ed2…`) — no new information, already owed in this release's
manifest refresh. The manifest's t19/t20 prose is v5.34-era, a smaller instance of the same
never-rolled-forward failure.

## What was NOT lost

The engine work itself — Finding 1's option (B), the sub-pool, the banked-surplus decision, the
MAGI wiring — is all inside `DangerClose-v5_36-WIP.jsx`, whose hash matches. Only the **test-side**
session-1 work is missing: t19 +24, t20 +5, and the mechanical version-tax registrations in
t3/t4/t5/t6 (t1's survived).

## Recovery options

1. **Re-upload the six session-1 files (recommended, if they exist).** Session 1's run folder, a
   deliverable zip, or Steve's local archive (which the brief confirms holds at least the
   never-committed CAPGAINS partial) may hold them. Verification after re-upload: no md5s were
   recorded for these six files anywhere (STATUS records the source hash only), so the binding
   check is the base reproduction itself — the run must parse to exactly 588 / 587 / 9-strict /
   622 / 1219 with t1 94 · t19 56 · t20 99, and the C1–C7 controls must all fire.
2. **Rebuild them in-session from STATUS §8's specification.** Recoverable but expensive: every
   hand-verified figure must be recomputed independently (not copied from STATUS), the mixed-pool
   fixture rebuilt explicitly, and the full negative-control program re-run to prove the rebuilt
   tests still catch C1–C7. This re-does a substantial part of session 1 and forfeits byte-exact
   continuity with what session 1 verified.
3. Option 2 only for t3/t4/t5/t6 if only those are unrecoverable — their edits are mechanical and
   fully specified (the version-tax shape, OPERATIONS §I) — combined with option 1 for t19/t20,
   whose content is the hand-verified substance.

**Process fix this exposes** (for the release's docs, not for now): end-of-session STATUS should
record the md5 of every file the session changed — source AND suites — exactly as E-14 proposes
having packaging emit the §A2 hash table. Session 1 recorded `c5d9253c…` for the source, which is
why the engine work is provably intact, and recorded nothing for the suites, which is why this
report has to ask for the files instead of validating them.

## State of this session

No edits made anywhere. Clone at `/home/claude/ship` (HEAD `bec56f8`). Decisions from the brief's
§Decisions were ratified by Steve before the freshness check ran (banked surplus ratified; copy to
be reviewed mid-build; `runsuite.sh`/`controls.sh` adopted; pool-only docs to be committed) — all
still stand; none is affected by this stop.
