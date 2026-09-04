# STOP REPORT — v5.63 FICA fix, built and green, tests and docs outstanding

> ## ⚠ SUPERSEDED 2026-09-04 — v5.63 SHIPPED. Retained as the record, not as an instruction.
>
> Source `b2deba49e68bee6c29300f2f8cf0a7e3` · built `index.html` `5998e8b60c5f45ded623d500fce09a86` ·
> 3,010 app checks, 0 failing · five negative controls all firing · `smoke_built` 16/16.
> **Nothing below is a live to-do.** `SCOPE_ROTH_FICA_OTHERORD.md` §7 is the build record and the
> v5.63 CHANGELOG entry is the account of what shipped.
>
> **Two things this report did not hand over, and they are why OPERATIONS §L gained a paragraph.**
> It listed the documents it had finished and named the modified app source, and the documents were
> committed. It did **not** enumerate the rest of the modified code: the suite's `v563` version-gate
> extensions across sixteen files and the new `qa/qa-baseline/dom_entry_v563.jsx` existed only in
> that session's workspace and survived nowhere. The next session found the repo registering `v562`
> in eighteen files and `v563` in two, redid the registration from scratch, and hit the `t24` `_k`
> trap this report had already documented — the trap note survived; the work it described did not.
> §L now requires a stop to end with a table of **every** file it modified or created, its md5, and
> where that file goes.
>
> ⚠ Its `mammoth` note — *"pin it to 1.12.1 with `package.json` kept byte-identical"* — was reported
> here as unverified and is now resolved, in a third way. No pin is needed for the build to succeed;
> the pin was about reproducibility, and it had **already landed** as the committed
> `package-lock.json`. What was missing was OPERATIONS §N3a using it. See the v5.63 CHANGELOG.

**Why this is a stop and not a release.** The engine fix is in, deliberately applied from canonical
v5.62, and the full suite is green on both legs. What a release also requires — new tests for new
behaviour, negative controls, `METHODOLOGY`, `CHANGELOG`, `TESTING`, the built `index.html`, and a
proper app-release package — is not done, and doing it badly to finish inside one session is the
thing this project's rules exist to prevent. **A thin pass presented as complete is worse than an
honest partial.**

## What is verified

| | |
|---|---|
| From | v5.62 `827566da23ba3f37a3d7a66432afddfe` (hash-checked before the first edit) |
| Candidate source | `v563.jsx` — see MANIFEST.txt for its md5 |
| Suite | **2,934 app checks, 0 failing** · v5.63 leg 1,126 · v5.62 leg 1,126 · run-once 672 · parity 10/10 |

Both legs were re-run **after** the suite files were edited, not before — a registration edit that
broke the frozen leg would otherwise be invisible.

⚠ **Parity 10/10 is EXPECTED AND BLIND here**, the same way it was at v5.62. The three parity
fixtures carry no income streams, so the changed code path is never entered. It is not evidence.

## The change

Five edits in `runRothStrategies`, plus two comments. **The two FICA lines are not touched** — they
become correct automatically once `work` stops carrying non-work income.

| site | change |
|---|---|
| L3767 | `annualWork` gains `kind: "work"`; new `annualOtherOrd` with `excludeKind: "work"` |
| L3861 | binds `otherOrd` |
| L3895 | `base = pen + work + otherOrd + rmd` — **same value**, decomposition explicit |
| L4005 | ACA sale sub-engine state base: `work + otherOrd` |
| L4124 | main state base: `work + otherOrd` |
| L4446, L8997 | comments only (decision D-3): unfiltered on purpose, nothing there charges FICA |

Four in-app version sites bumped to v5.63: footer, DATA LOAD header, Field Manual callsign, Field
Manual footer. Bump first, comments second — `t1`'s four STATIC checks pass.

## Two things found during registration, both worth keeping

**1. `t24`'s `_k` needed an EXTENSION, not a new arm, and the scripted pass missed it.** It ends
`... || VER === "v562" ? v553 : older` — a chain terminating in a ternary *condition*, which looks
like the `verStr` ladders that need a new arm and is not one. The run caught it: `t24` failed 3
before the fix. **This is why gates are extended and then run, never extended and assumed.**

**2. Four `KNOWN_VERSIONS` registries end in `"v592"`, the retired v5.9.2 leg**, not in the current
tag. A registration keyed on the current tag being last silently fails to register — which is
exactly the trap `TESTING.md` records. Registered counts: 15 files, 11+4 registries, 59 gate arms,
2 ternary arms, 1 hand-extended chain.

## ⚠ The coverage finding, and it is the real story

**No suite fixture carries a non-zero income stream.** Every `incomeStreams` in the suite is
`monthly: 0` or `[]`. That is why 2,934 checks were green against a live defect for as long as the
feature has existed, and why the same 2,934 are green after the fix: **the changed path is not
reachable by any existing fixture.**

The suite total being unchanged across this release is therefore not reassurance — it is the
measurement of the gap. Whatever tests get written next must introduce the first stream-bearing
fixtures this suite has ever had.

## What remains, in order

1. **New tests.** Four groups, per the scope: the rental-vs-wage extinction invariant (must FAIL on
   the frozen v5.62 leg — that is the proof); the executed complement identity with **non-zero
   readings on both sides asserted**; independent coverage of the second FICA site at L4008 via an
   ACA-bridge household; and a second-order pin on a household with `totIrmaa > 0`.
2. **Retire the `t10` §2E `[KNOWN DEFECT pre-otherOrd]` pin** (decision D-4) and delete its six-line
   comment block, which states the false gap.
3. **`METHODOLOGY`** — correct the residual paragraph, and record that the v5.62 disclosure was
   withdrawn (decision D-2). `t31` reads this file and will need its key.
4. **`CHANGELOG`, `TESTING`**, provenance line, and the manifest.
5. **`controls_v563.sh`** — at minimum one control per FICA site, reverting each separately, because
   a fix to only L4127 would otherwise pass.
6. **Build `index.html`** per §N3a (⚠ `mammoth` pinned to 1.12.1, `package.json` byte-identical),
   run `smoke_built`, then package as a normal app-release zip and run `package_check`.

## Do not

- **Do not reuse the measurement scripts from the previous session's run folder.** `roth_fica_measure.mjs`,
  `flip_hunt.mjs` and the probes produced the scope's evidence and are gone with the sandbox. Rewrite
  them if needed; do not half-remember their numbers.
- **Do not quote the measured figures from the scope without re-running them.** They were true against
  a scratch candidate, not against this source.
- **Do not treat parity 10/10 as evidence** that the engines are unchanged. It is blind here.
