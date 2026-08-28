# Danger Close — Operations

**What this file is.** The operational appendix to the project instructions: concrete mechanics
discovered or confirmed while shipping releases, so a future session doesn't relearn them the hard
way. The ground rules, conventions, cautions, and voice live in the **project instructions**, which
are injected into every conversation; this file is the executable half and lives in project
knowledge.

**Read this before any build, fix, scope, or release — starting with §A.** Where a section repeats
a ground rule from the instructions, it is making that rule executable, not restating it.

## A. Anchoring to builds — by role, not by frozen hash

> ### ⚠ A0 · State nothing a command has not printed *this session* (added 2026-08-26)
>
> **No count, hash, file list, status line or test result goes into a deliverable, a chat message or
> a scope unless a command in the current session produced it.** Not "the suite was 2,641" — run it.
> Not "that scope is buildable" — open it. Not "the pool matches" — diff it. Recall is not evidence,
> and neither is a number that was true one release ago.
>
> This is a rule rather than advice because the week of 2026-08-26 produced **five** instances in one
> project, every one caught by a command and none by memory:
>
> | Asserted | Actually |
> |---|---|
> | a site census listed every place a label appeared | it was case-sensitive; the most prominent site was capitalised and missed |
> | a release had corrected its documents | `METHODOLOGY.md` still used the label the release deleted, three times |
> | a pool-vs-tree check was reporting drift | the script's `REPO` still pointed at a two-release-old clone |
> | `TAX_CONSTS` was the right home for a constant | that block is statutory-only and says so in its own header |
> | *"the previous doc-fix passed package_check 25/25"* | it was **never run on that package at all** |
>
> The last one shipped. The tell is always the same: a claim that feels settled enough not to check,
> which is exactly the claim that has gone stale. **Cheapest possible test — if a sentence contains a
> number or a state, name the command that printed it.**

The suite always compares two builds **by ROLE**, and the roles roll forward every release — so never
hardcode a specific version or hash as "the baseline." The live values live in the manifest and the
CHANGELOG, not in this file.

- **Current build** — the release being worked on / just shipped. The canonical working source. All edits,
  verification, and scope premises are against this.
- **Prior build** — the immediately-prior shipped release. The regression comparison baseline.

Every shipped release is frozen the moment it ships — you never edit a released build in place, you
supersede it with the next version. A frozen build's test legs are expected to show current defects as
their pre-fix state; that's correct, not a regression.

### A pre-build FRESHNESS CHECK is the first step of any build

Project knowledge is a flat pool with no version awareness: a stale `DangerClose.jsx` looks byte-for-byte
like a current one until you hash it. Before any work:

1. Read `PROJECT_KNOWLEDGE_INDEX.md` — it names the current version + its md5.
2. Hash the current `.jsx` in knowledge (`md5sum DangerClose-<current>.jsx`).
3. Compare to the manifest's md5, and cross-check the manifest version against what `CHANGELOG.md` says is
   newest.
4. **Hash the test and harness files too — see §A2. This step is not optional.**
5. **Match → proceed. Mismatch → knowledge is stale; refresh it before doing anything else.**

State the confirmed version + hash at the start of substantive work.

### A2. The freshness check covers the SUITE as well as the source (added v5.30)

**Why this exists.** Until v5.30 steps 1–3 above hashed the `.jsx` sources and nothing else. No test
file had a recorded hash anywhere — not in the manifest, not in `TESTING.md`, not here. So a stale
test in the pool was invisible by construction, and one was: at the v5.30 build the pool's
`t8_invariant.mjs` was an older 35-check copy with 3 failing assertions, while the committed file had
38 and was green. The build halted at the baseline run and cost a session's budget to diagnose. The
app was never defective and the repo was always correct — **only the pool had drifted**, and the
freshness check as written could not see it.

A stale *source* is loud: the hash check catches it immediately. A stale *test* is quiet in the worst
way — it either fails against correct code and looks like a regression, or passes vacuously and hides
one. Treat the suite as part of the build's identity, not as scaffolding around it.

**Primary check — clone and diff. Zero maintenance, and it is what actually found the drift.**

```bash
git clone --depth 1 https://github.com/stextor/danger-close.git /tmp/ship
# for each test/harness file in the pool, compare to its committed counterpart
```

Any file that differs is either legitimately being changed by this release or is stale. **Say which,
before doing anything else.** This costs one command and needs no recorded numbers, so it cannot
itself go stale — which matters in a project where three separate blocks have drifted.

**Two mapping caveats, both real:**

- **The pool flattens repo paths.** `tools_fixture.jsx` in knowledge is `qa/tools/fixture/fixture.jsx`
  in the repo; the baseline suites live under `qa/qa-baseline/`. Match by content, not by path. The
  manifest's repo-path column is the map.
- **A file on one side only is not automatically drift — but ask why.** Both directions occur, and this
  bullet has been wrong in both. It read *"`probe_classify.mjs` exists only in knowledge"* until
  2026-08-20; the truth is the reverse and has been since v5.30 — that file was retired from the pool and
  now lives only in the repo at `qa/tools/probe_classify.mjs` (the manifest recorded this correctly while
  this line did not). **Run the comparison in both directions.** Pool-only files are usually
  packaging leftovers; repo-only files are usually history the pool deliberately doesn't keep
  (superseded `dom_entry_*`, retired probes, `validation/`, the built `index.html`) — but a *build input*
  showing up as repo-only is a defect, which is how `src/index.html` was found absent from the pool on
  2026-08-20 after §G had required it for eleven releases.

**Fallback when there is no network:** the manifest carries a per-file md5 table for the test and
harness files the pool holds. It is authoritative only as of the release that wrote it; prefer the
clone. Hashes live in the **manifest**, which is rewritten every release — not in this file, which is
only touched when mechanics change.

## B. The regression suite — layout and how to run it

The suite lives **in the repo**, not only in a sandbox. (It was lost once precisely because an earlier
version lived only in a session sandbox and was never committed.)

**Repo layout:** `qa/qa-baseline/` holds t1–t6 plus the harness (`env_dom.mjs`, `shim.txt`,
`mk_testable.sh`, `dom_entry_*.jsx`, `run_all.sh`, `cap_tabs.mjs`, `README.md`); `qa/` holds the feature
suites; `qa/tools/` holds the parser toolkit (§B1 — **not** suites, they assert nothing); `validation/` is
the older, separate public-constants suite (kept; different purpose). **It is NOT part of the release gate and §I does not ask for it** — that is deliberate, and stated here so nobody re-derives it as a missed step, the way `VERIFY.sh` read as one. ⚠ **Its runner is `run.cjs`.** It was `run.js` and could not run at all once `package.json` gained `"type": "module"` — node treats `.js` as ESM and rejects the CommonJS runner. Renaming was the whole fix; the file is byte-identical. Found 2026-08-25 during the Section E remainder sweep. At v5.49 the constants layer passes **48/48**, and **five of six** behavioral tests run (`smoke_entry` 26/26 tabs) — ⚠ **`deep_test` CRASHES** against a moved Roth solve-for button, leaving that directory's only modelling assertions unchecked; repairing it was deliberately out of scope. ⚠ `run.cjs` is a **tenth** jsdom environment — E-6 counts nine, correct for `qa/`; project-wide it is ten, and this copy has never been audited against §C's traps.

**Setup** (from a folder holding the two version `.jsx` files next to `qa/`):

1. `npm i esbuild react react-dom d3 xlsx mammoth jsdom acorn acorn-jsx acorn-walk`
   *(the three acorn packages added v5.31 — `qa/tools/*.cjs` require them, so `t21` dies at
   module load without them. They were missing from this line through v5.30.)*
2. `./qa/mk_testable.sh <prior> && ./qa/mk_testable.sh <current>`
3. `npx esbuild qa/dom_entry_<ver>.jsx --bundle --format=cjs --platform=browser --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_<ver>.cjs`
4. `./qa/run_all.sh <prior>` · `./qa/run_all.sh <current>` · `./qa/run_all.sh parity`

**Run layout gotcha:** the repo stores the baseline at `qa/qa-baseline/`, but the harness runs from a
**flat working folder** — sources at the root, every test + harness file together in a single `qa/`.
Copying the repo layout verbatim and running it fails. The qa-baseline README carries the exact shape.

### B1. Census and site-count questions go through `qa/tools/`, never greps

**A grep is not an answer to "how many sites?" or "where is this used?"** Grep line-number and identifier
claims in this project have been wrong repeatedly — a grep cannot see scope, cannot tell a definition from
a reference, cannot tell live code from a string literal, and silently mis-reads the one-line `DOCS_HTML`
blob. AST resolution has not been wrong. Run the tool and cite its output.

| Tool | What it answers |
|---|---|
| `funcmap.cjs` | where functions begin and end — line numbers move every release, this is how you re-find things |
| `census.cjs` | identifier / property / string hits **with the enclosing scope chain** |
| `diverge.cjs` | normalized-fingerprint comparison — aimed at this project's recurring duplicated-expression failure |
| `residual.cjs` | narrow: hardcoded to `balance − roth − trad`. Ages out once that consolidation lands |

They live in `qa/tools/` deliberately, **not** top-level `qa/`: they assert nothing and must never be
countable as checks. A release's check count includes zero of them.

**These tools are now tested.** `qa/t21_tools.mjs` runs all four against
`qa/tools/fixture/fixture.jsx`, a file built to contain every case where a line-grep and an AST walk
disagree: identifiers in comments, substrings inside strings, template literals, computed vs dotted
member access, object shorthand, shadowed scopes, nested function depths, JSX attributes and children,
a one-line blob standing in for `DOCS_HTML`, and two decoys the residual matcher must REJECT. Every
expectation was hand-counted from the fixture first and adjudicated by reading it where tool and hand
disagreed — never by editing the expectation until it matched. **49 checks, negative-controlled six
ways** (breaking kind classification, scope attribution, depth tracking, fingerprint normalisation and
the residual matcher each fire; so does reflowing the fixture by one line).

So an unexpected result from these tools IS now a finding on its own — provided `t21` is green. The
fixture's line numbers are load-bearing; add cases at the END only.

⚠ **One defect is pinned, not fixed** (`t21` §A4, OPERATIONS §D). `census.cjs` reports a position
TWICE where two AST nodes share one source range — object shorthand `{ x }` and export specifiers
`export { x }`. Its output is literally accurate (it says "AST hits", and there are two nodes) but
§B1 sells it as a SITE count and scope documents quote it as one. On v5.25: `otherAccounts` 17 AST
hits → **15 distinct source sites**; `positions` 49 → 46; `taxType` 56 → 55; `total401k` 44 → 43.
"17 hits" is quoted in `SCOPE_OTHERACCOUNTS_TAXTYPE_v5_25.md` §3 and the v5.26 scope §4. **The error
direction is safe** — it over-reports, sending a reader to more sites than exist, never fewer.

### B2. A green suite is not evidence of coverage — measure it, don't infer it

**A suite passing tells you nothing about what it would have caught.** Coverage is a property that has
to be *demonstrated per claim*, and the only demonstration is a negative control: break the thing on
purpose and watch the suite fail. If nothing fails, the coverage was imaginary.

The case that established this, 2026-08-11: preparing the Engine D hoist, a **+10% inflation
perturbation inside Engine D moved `totalDrawn` by $50,320 — and the entire 757-check suite stayed
green.** `t4` (90 checks, walks the DOM including the Withdrawal tab) passed. `t12` (23 checks, *named*
`t12_engineD_survivor`) passed. Engine D's figures had never had discriminating coverage, and nothing
in the suite's output said so.

Three rules follow:

- **A suite's name is not a coverage claim.** `t12_engineD_survivor` discriminates on *survivor*
  behaviour — its header records failing 8 assertions against pre-fix v5.11 — but not on Engine D's
  figures generally. Read what a suite asserts, never what it is called.
- **A scope must not assert that an existing suite witnesses a change without testing that it does.**
  The v5.23 scope claimed `t4` and `t12` would witness the hoist. Both claims were false, and were
  caught only because the negative control was actually run rather than assumed.
- **When a negative control does not fire, that is the finding** — stop and investigate. Do not adjust
  the control until it fires; work out what the suite is actually blind to, and say so in the release
  notes rather than shipping on a green number that means less than it looks like.
- **A disclosure assertion becomes a LOCK the moment its disclosure becomes false.** Added v5.27,
  from a defect it caused. Assertions that check copy is PRESENT — "states no RMD is generated",
  "names the direction of the error" — are correct while the disclosure is true and actively harmful
  afterwards: they hold the stale text in place and go green *because* it survived. v5.26 falsified
  three such statements, inverted the ones guarding the Withdrawal tab and My Data, and missed the
  Field Manual set — and that miss is what let a self-contradicting manual ship. **When a release
  falsifies a disclosure, find EVERY assertion that asserts its presence and invert them in the same
  release.** Grep the suite for the sentence, not just the source.
  **And gate the inversion to the builds it is true for.** (Added v5.28, from the defect the v5.27
  fix itself caused.) Inverting an assertion without gating it applies the NEW expectation to EVERY
  frozen leg, including builds that legitimately still contain the old copy — the prior leg then
  stops replaying green and the release notes state a total the suite will not produce. A defect PIN
  asserts old behaviour on an old build deliberately; this is the opposite, and the two are easy to
  confuse. Each leg asserts the copy that was true for its own build.

This is the same failure class as §M's instrumentation ceiling, one level up: **§M is about what
*cannot* be measured, B2 is about assuming something *is* being measured when it is not.**

## C. Environment traps encoded in the harness — do not "simplify" them away


**C0. `DOCS_HTML` is one line, and an anchored edit is only half the job.** (Added v5.27.) The Field
Manual blob is a single line of **142,990 characters — 144,111 UTF-8 bytes — at v5.30** (it was
142,885 chars / 144,008 bytes at v5.29). **Re-measure it rather than quoting these**; they move with
every edit inside the blob.

⚠ **Characters and bytes are not the same number here, and the gap has caused confusion.** The manual
is full of en-dashes and em-dashes, which are three bytes each in UTF-8, so the byte count runs about
1,100 higher than the character count. The v5.30 scope recorded "144,008 characters" — that was the
**byte** count, correctly measured and wrongly labelled. When you record a figure, say which one:
`node -e 'const L=...; console.log(L.length, Buffer.byteLength(L,"utf8"))'`. Convention already requires quote-free anchors when
editing inside it. That is necessary and NOT sufficient: an anchored replacement is correct about the
span it replaces and **silent about the text that follows it**, which on a line that long is invisible
in every normal view. v5.26 replaced the first half of a sentence and left the second half — the
v5.24 disclosure, now false — standing one clause after its own correction.

**After any edit inside `DOCS_HTML`, print the full surrounding sentence back and read it.** And for a BOUNDED edit — one that replaces a SPAN between two markers rather than a single string —
**assert both markers are unique, assert the end follows the start, and print the span length and the
net file delta before writing.** (Added v5.28.) A bounded edit whose end marker resolves somewhere
unexpected deletes everything between, silently: the first attempt at v5.28's third edit removed
25,000 characters, a quarter of the manual. The parse check caught it only because the deleted span
left the string literal unterminated — a balanced deletion would have parsed and shipped. Not the
replaced span — the passage. One `node -e` slice of ±400 characters around the edit point is enough,
and it is the only thing that would have caught this.

- **Seed `Math.random` BEFORE importing the app bundle.** d3-random captures `Math.random` at module-load
  time; a post-import override leaves the Monte Carlo's noise draws on the real RNG and silently destroys
  determinism, making "parity" tests meaningless.
- **Stub `globalThis.URL.createObjectURL`, not just `window.URL`.** The CJS DOM bundle runs in Node scope,
  so the backup-export handler resolves bare `URL` to Node's global; stub both or the export-capture never
  fires.
- **`applyLoadedData` takes a WRAPPER object — `applyLoadedData({ portfolio: P })`.** Passing the portfolio
  bare is a **silent no-op**: nothing throws, and the test runs against the previous household while
  appearing to configure a new one. (Cost a full probe cycle at v5.11.)
- **`applyLoadedData` mutates module-level globals, so React does not re-render.** If the target tab is
  already active, clicking it again changes no state and the panel keeps rendering the PREVIOUS
  household's figures — a test that passes while comparing a configuration against itself. Park on a
  different tab after reconfiguring, so navigating back forces the re-render.
- **Read windows must clear the panel's prose.** DOM assertions that slice N characters after a header
  break silently when disclosure text is added between the header and the numbers: the figure falls
  outside the window and parses as null. Size windows with headroom.
- **Anything added to `shim.txt` MUST use the guarded `_g("name")` form.** `mk_testable.sh` splices the
  shim into **every** version, including prior-release legs that predate whatever you just exported. A
  bare shorthand (`myNewThing,`) throws `ReferenceError` on any build where that identifier does not
  exist, and the leg will not load at all. Use `myNewThing: _g("myNewThing")`, as `contribAccrual` and
  `retireStartBalances` already do. *Observed 2026-08-11 exporting a newly-hoisted engine: the current
  leg was fine, the prior leg's CJS DOM bundle died on import.* **Note what did NOT catch it — parity
  passed 8/8 first**, because `t2` uses the ESM bundle and only the CJS bundle threw. A green parity is
  not evidence that the harness is intact.

**C2. `dobA` / `dobB` must be `"YYYY-MM-DD"` STRINGS — an object is silently ignored.** (Added
v5.35.) `buildPlanTimeline` parses them with a helper that returns `null` unless the value is a
string, then falls through to the master-prompt parse and finally to a hardcoded default. A fixture
supplying `{ year: 1962, month: 6, day: 1 }` therefore plans a DIFFERENT household than it declares,
with no error and no warning — measured at v5.35: `t20`'s `ownedA` block resolves to dobA 1964 /
dobB 1966 against the 1962 / 1964 it writes. **The app is correct** — it reads the shape its own My
Data form produces — so this is a fixture trap, not a defect, and it belongs with the `asOfYr` and
wrapper-object traps above rather than in the findings list. Two suites carried it (`t20`, `t7`);
both were converted at v5.37 to the strings their runs resolve to (`"1964-01-01"`/`"1966-01-01"`,
measured value-identical — E-17 closure records the method and figures). The trap itself is
unchanged in the app, so the rule stands: **sweep any fixture for object-shaped dates before
trusting an age-keyed expectation**, and use the string form in anything new. If `t20`'s dobs are
ever changed again, its E2 exact invariants are regime-bound (full pool exhaustion) and MUST be
re-derived, not carried.

### C1. The jsdom environment is duplicated EIGHT times — audit outstanding

`env_dom.mjs` exists but is imported by only four files: `cap_tabs.mjs`, `t4`, `t5`, `t6`. The other
seven stand up their own inline jsdom: `smoke_built.mjs`, `t9`, `t11`, `t12`, `t13`, `t14`, `t16` —
eight copies of the environment setup in total, counting `env_dom.mjs` itself.

**This matters because every trap above would need fixing in eight places to hold everywhere, and
which copies carry which fix has never been audited.** A suite running without the `Math.random`
seeding fix, or without the `globalThis.URL` stub, fails in ways that look like defects in the app.

Counted by AST 2026-08-11. *(An earlier note said seven and listed only three importers — it missed
`smoke_built.mjs` and `cap_tabs.mjs`. Recount before relying on the figure; the point is the
duplication, not the exact number.)* The audit is cheap now that `qa/tools/diverge.cjs` exists and is
a candidate for its own small scope.

### C3. The run folder IS a clone, so its artifacts get committed (added 2026-08-27)

**The flat working folder of §B and the repo checkout are the same directory**, so `git add .` in a
run folder sweeps the aliases and build products in with the real changes. This is not hypothetical:
at the **v5.52 ship the root `DangerClose.jsx` alias was committed**, and it was caught only because
the §F verification diffed two clones file-by-file — 24 files had changed where the package held 23.
Nothing in the release path would have reported it.

**Why that one mattered more than it looks.** `t8`, `t14`, `t16`, `t19` and `t22` read
`../DangerClose.jsx`. With a copy committed, those five suites run from a clean clone against
*whatever that copy holds* — identical to `src/DangerClose.jsx` on the day it lands, and **stale from
the next release onward**, reporting green against an old build. Same shape as the v5.30
`t8_invariant` drift (§A2) and the same reason: a test input that can go stale silently. The
missing-file error IS the signal — TESTING.md says so — and a committed copy deletes it.

`.gitignore` now carries root-anchored rules for the four artifact classes, verified three ways:
zero of 232 tracked files become ignored, every artifact is caught, and a seeded run folder that
staged **8 files** before the rules stages **none** after. ⚠ **The leading slashes are load-bearing**
— `/DangerClose.jsx` must not become `DangerClose.jsx`, which would also ignore `src/`.

⚠ **The baseline files are NOT in this set and must never be added to it.** `qa/t1_units.mjs`,
`qa/env_dom.mjs`, `qa/shim.txt`, `qa/dom_entry_*.jsx` and the rest look like run-folder artifacts
because the run folder is flat — but they are real repo files at `qa/qa-baseline/`. A rule matching
them would make the suite uncommittable. The first census of this ran to 68 candidates; **64 were
that false positive.**

## D. Defect-pin discipline

When a bug is found but not yet fixed, it gets a dated `[KNOWN DEFECT]` test that asserts **today's wrong
behavior** — so the defect stays visible and the suite stays honest (green describes reality, it doesn't
hide the bug). Each pin names, in a comment: what's wrong, whether it's pre-existing or a regression, the
date found, and the instruction to flip the expectation when fixed. Fixing a defect then means: change the
code, flip its pin to a positive assertion, and the fix is self-verifying.

## E. The MC-parity guardrail (the hard line for "engines unchanged")

`t2_engines.mjs compare` asserts that under common seeded random numbers with identical inputs, the Monte
Carlo, extended MC, stress, and Roth engines produce **byte-identical** output across the active version
pair. Any release claiming "engines unchanged" must keep this **9/9**. If a fix that shouldn't touch the
engines breaks parity, **the fix has overreached — stop and narrow it.**

⚠ **The figure is 9/9, not 8/8 — corrected 2026-08-21.** The fingerprint carries **nine** keys; it has
since the E-15 addendum, and `qa/qa-baseline/README.md` has said 9/9 for several releases while this
section said 8/8. Build briefs inherited the wrong number from here and had to correct it inline,
release after release, without anyone changing the source they were correcting. Verified at the v5.42
ship: `node t2_engines.mjs compare v541 v542` returns **9 passed, 0 failed**.

**Do not hardcode this count in a build brief.** Read it off the run. The number has moved once and
will move again if the fingerprint gains a key — and a brief that carries a stale expectation invites
someone to "fix" a passing guardrail to match it.

## F. Ship-verification ritual

After Steve pushes, verify against the **committed tree**, not the working copy: clone fresh; `md5sum
src/DangerClose.jsx` must equal the canonical hash the suite ran against; confirm `index.html` was built
from that source; re-run the full suite from the clone. The prior-build comparison source is a local-only
file the maintainer supplies — prior-leg failures right after a clone usually mean that file is missing,
not a real regression.

## G. Storage strategy — repo vs project knowledge vs neither

- **Repo (mandatory, durable):** `src/DangerClose.jsx`, `CHANGELOG.md`, `METHODOLOGY.md`, `TESTING.md`,
  `README.md`, `SITE_CENSUS_*.md`, all of `qa/`, `validation/`, built `index.html` via the publish flow,
  scope docs while active. **Release history lives in the repo's commit history.** This project does
  NOT use git tags (decided 2026-08-09): there are none, for any version, and none are planned.
  Recovering an old source means finding the commit that shipped it — archaeology rather than a
  bookmark. That is an accepted trade for a solo maintainer, not an oversight.

  **Provenance line (from v5.12 forward).** Because there are no tags, and because TESTING.md only
  ever holds the CURRENT build's md5, every CHANGELOG entry ends with the source and built md5s for
  that release. That line is the only durable record of what a given version actually was. It is
  written during packaging, so it costs nothing to maintain. Entries before v5.12 do not have it —
  for those, identify a retired source by reading it out of the commit that shipped it.
- **Project knowledge:** the versioned-source pair plus CHANGELOG, METHODOLOGY, TESTING, README, the test
  files, harness, site census, active scope docs, this file, and the manifest.
- **Build scaffold (project knowledge, all four):** `src/index.html` (the Vite HTML entry template),
  `src/main.jsx` (the browser bootstrap), `vite.config.js`, and `package.json`. Without all four, a session
  working from knowledge **cannot produce the published `index.html`** — which is exactly what happened at
  v5.11. The *built* `index.html` stays repo-only: it is output, not input. (The older "index.html is
  repo-only" line was correct about the output and was wrongly read as covering the inputs too.)
- **Neither (rebuildable):** `node_modules/`, generated `app_*.mjs` / `dom_*.cjs`, scratch files.
  Built `index.html` is repo-only. Rebuilding generated bundles each session is deliberate — a stored
  bundle can go stale against its source, which is the failure the freshness check exists to prevent.

### One manifest, one copy, at the repo root (added 2026-08-26)

**`PROJECT_KNOWLEDGE_INDEX.md` exists exactly once, at the repo root.** No second copy, in any
subfolder, for any reason.

This is a rule because a second copy existed. `validation/PROJECT_KNOWLEDGE_INDEX.md` arrived in an
"Add files via upload" commit, was referenced by nothing, and sat frozen at **v5.49** — naming
`2ccc62b6…` as the current source two releases after it stopped being. It had drifted 47 lines from
the real manifest by the time it was found.

**The manifest is the worst possible document to have a stale twin of**, because §A's freshness
check — the first step of all substantive work — reads it to learn which build is current. A session
that opened the copy would anchor to a two-release-old source and be wrong in a way that looks
entirely right, with every downstream check passing against the wrong baseline. If a subfolder needs
build context, it gets a pointer to the root manifest, never a copy. *(`validation/README.md` is not
a violation: it is that suite's own README, and its "last verified against v5.49" is a true statement
about when the validation suite last ran, not a claim about the current build.)*

### Deleting a document is a THREE-place operation (added 2026-08-26)

A document deleted from the repo is not deleted. It also lives in the flat knowledge pool, and it is
probably named in the manifest. **Delete from the repo, delete from the pool, and clear or annotate
its manifest row** — otherwise §A2's both-direction check reports it as a pool-only file, which is
drift, and the manifest keeps advertising a file nobody can open.

⚠ **Before deleting, check for UNRESOLVED DECISIONS — not just built outcomes.** A `CHANGELOG`
records what shipped, which is precisely what an open question is not. Grep the document for `OPEN`,
`awaiting`, `yours`, `no recommendation`, and its decision table, and confirm every decision in it is
either resolved or re-homed somewhere that survives. **An open decision is the one thing deletion
destroys that nothing else carries.**

This is a rule because it was got wrong the day the rule above was written. On 2026-08-26
`SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` was deleted after confirming — correctly — that what it *built*
survived in the CHANGELOG and four suites. It also carried **D4, an open product-voice decision for
the maintainer**, explicitly marked *"no recommendation offered."* Nothing else held it. It was
recovered from git history and re-homed as `MissingFeatures.md` **D-10**; had the deletion gone
unexamined for longer, the only record would have been a commit nobody had a reason to look for.

**Prefer retiring to deleting.** A retired scope keeps the record of what was decided and why, which
is the thing future sessions actually need; deletion keeps only the outcome. Deletion is defensible
when the outcome is preserved elsewhere — before deleting, confirm it, by command. When
`SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` was deleted on 2026-08-26 the check passed: `CHANGELOG.md`
carries the full entry for what it built and four suites still assert the invariant, so only the
decision record was lost. That check is the precondition, not a formality — this project has already
deleted a manifest section rather than repairing it once.

### Project knowledge is flat, add-only — so delete-first

Uploading a file whose name already exists creates a **second copy** rather than replacing the first. Two
hazards, one property: a stale copy is byte-indistinguishable from a current one (the read hazard §A
guards), and a re-uploaded copy sits beside the old one (the write hazard). **The refresh deletes before
it uploads.** After a refresh the pool must hold exactly two `.jsx` sources and one of every other file —
any name appearing twice means a delete didn't take. *Renaming a file is also a delete-plus-upload: if the
old name isn't removed, the pool holds the same document twice under two names (observed 2026-08).*

### The versioned-source rotation

Knowledge holds **exactly two** app sources: `DangerClose-<current>.jsx` and `DangerClose-<prior>.jsx`.
Rotate on every release; never let a third accumulate — older sources live in commit history. From
v5.12 forward their identity is pinned by the provenance line at the end of that release's CHANGELOG
entry (§G); for earlier releases there is no recorded md5, so identification means reading the file
out of the commit that shipped it. Only
`DangerClose.jsx` gets a version suffix; everything else is single-and-current, except `SITE_CENSUS_*`,
`SCOPE_*`, and `FlawsToFix-*`, which carry a version by nature.

### The manifest is mandatory

A model doesn't reliably infer "v5.11 > v5.10 so v5.11 is canonical" from filenames.
`PROJECT_KNOWLEDGE_INDEX.md` states it in plain text and is step 1 of the freshness check. **List every
file explicitly — never elide a range with "…", because a file inside the ellipsis becomes invisible.**

### Filenames read from the session mount are NOT authoritative

**The mount rewrites dots in filename stems to underscores.** Before recording any filename in any
document — a manifest row, a scope, a finding, a CHANGELOG line — verify it against the pool itself or a
repo clone. Never transcribe a filename from the mount path.

This is invisible to every check the project has: file *content* is not mangled, only names, so a hash
comparison passes while the name is wrong. Established 2026-08-10 — `/mnt/project/vite_config.js` and the
repo's `vite.config.js` are byte-identical (md5 `30da5708038a1d7c97a4b06777ea8e8a`), and not one of the 55
files then mounted had a stem dot, which is implausible for a pool containing `vite.config.js`.
Re-verified 2026-08-11: still zero stem dots across 63 mounted files.

**Today the blast radius is exactly one file: `vite.config.js`** (verified against the pool: the versioned
sources genuinely are `DangerClose-v5_21.jsx` with underscores, so §A step 2 and the existing manifest
entries are correct as written). The rule is stated generally because the next file with a dotted stem
will not announce itself.

A repo clone settles these questions cheaply and settles related ones at the same time — it is also the
fastest way to check whether project knowledge has drifted from what is actually committed.

## H. GitHub folder creation

No standalone "create folder." Type `folder/file.md` in the filename field when creating a file, drag a
folder in Upload files, or `mkdir` + `git add` locally. Git won't track an empty folder.

## I. Release mechanics checklist

Bump the version at all four in-app sites · CHANGELOG entry newest-first with per-suite counts and
disclosed limitations · METHODOLOGY if modeling changed · rebuild `index.html` from canonical and verify it
per §N (self-contained except the intentional Google Fonts link, **and smoke-tested**) · re-run the full
suite from a clean clone · refresh project knowledge once with the final state, delete-first · retire
fulfilled `SCOPE_*.md` · if this release fixed a defect that was invisible in the example data, add the
boundary that hid it to the census (**§K1** — the rule lives there, deliberately not repeated here) · publish on GitHub (a normal commit — no tag; see §G) · end the CHANGELOG
entry with the source and built md5s (the provenance line, §G — this replaces what a tag would
have given us) · **re-read every document this release CREATES or TOUCHES against what actually
shipped** (see below) · **package per §L — one zip, two destinations, with the suite re-run from the
packaged copies before the zip is cut.**

**Re-read the documents the release itself authored.** The checklist above already retires fulfilled
scopes; this is the wider case, and it is the one that has bitten twice. v5.50 fixed the app and left
`METHODOLOGY.md` describing the label it had just deleted, in three places, while its own new section
explained why that label was wrong. v5.51 then shipped `ASSESSMENT_HEIR_RATE.md` — **written for that
release, packaged in that release** — still describing the pre-fix code in the present tense, and
still recommending in its options table the option the scope had examined and **rejected**. Neither
was drift over time; both were wrong at the moment of shipping.

The practical form is a search, not a proofread: **grep the whole tree, case-insensitively, for any
term the release retired or any state it changed**, and read every hit that is not explicitly marked
as history. A document created by the release is the *most* likely to be stale and the *least* likely
to be checked, because the ink is wet and it feels current. A retired document keeps its body as the
record of what was believed — but anything in it that reads as a live instruction gets annotated in
place, so the wrong recommendation and its correction stay visible together.

**§L is the last step, and it is where the SESSION's work ends.** Everything after it — uploading to
the repo, deleting and re-uploading the pool, making the commit — is the maintainer's, done FROM the
zip. That boundary is why this step gets skipped: the list above ends in "publish on GitHub," which a
session cannot do, so there is no natural marker for "my part is finished." The marker is the zip. A
release is not done when the suite is green; it is done when the zip is cut and verified.

**Added 2026-08-21, after the step was missed at the v5.42 ship.** §L was reachable from nowhere —
no section cross-referenced it — while the project instructions, which are injected into every
conversation, described a *different* deliverable layout (`repo-update/`, no zip). The session
followed the always-present instruction and packaging was never read. Both halves are now fixed: the
instructions route here instead of competing, and this checklist names the step. Third recorded
instance of two documents disagreeing with nothing to compare them (cf. §A2 vs the manifest on
`probe_classify`, and the manifest's deleted rotation-state section). **`qa/tools/package_check.mjs`
is the executable half — run it on the zip before sending, per §L.**

**`VERIFY.sh` is RETIRED (2026-08-25, v5.49) and no longer runs.** It sat at the repo root calling
itself "release verification" while pinned to `v537`/`v538` — **eleven releases stale** — and while
**this file referenced it exactly zero times.** It was not a step anyone skipped; it was a gate that
had quietly stopped being one, and it read as though any release that did not run it was incomplete.
The three checks that replace it are already named in this checklist: the **full suite from a clean
clone**, **`smoke_built`** on the built artifact, and **`package_check`** on the zip. ⚠ **Do not
revive it by rolling its version pair forward** — that recreates a second release gate nothing
cross-references, which is the failure this section already records three times. Fourth recorded
instance of two artifacts disagreeing with nothing to compare them.

**Retire fulfilled `SCOPE_*.md` AT the ship, not after it.** The checklist item above is the one most
often reached last and skipped. `SCOPE_D6_SSA44_USER_SIDE.md` still read *"Awaiting decisions — do not
build yet"* for a full day after v5.49 shipped, was verified, and had its documentation follow-up
land. A fulfilled scope left in that state is indistinguishable from live work.

⚠ **Swept 2026-08-26, and the step was not merely slipping — it had stopped happening.** Of the nine
`SCOPE_*.md` carrying live-looking status lines, **seven were already built and shipped**:

| Scope | Status line said | Actually shipped |
|---|---|---|
| `FIX_realized_capital_gains_v5_32` | "Ready to build" | **v5.36** — 13 releases earlier |
| `FIX_docs_v5_39` | "DRAFT — **do not build**" | **v5.39** |
| `FIX_roth_tab_rmd_magi` | "BUILDABLE… **not yet built**" | **v5.41** |
| `ENGINE_C_SS86` | "Buildable" | **v5.43** |
| `ITEMS_3_6_perRmd` | "**NOT BUILDABLE** — two blocking" | items at **v5.44** and **v5.47** |
| `ENGINE_B_ROTH_HALF_CAP` | "two decisions open, **both blocking**" | **v5.45** |
| `ROTH_TAB_MAGI_MEASUREMENT` | "measured and validated" | fulfilled; never retired |

**Two of them said DO NOT PROCEED about work already shipped.** A session picking up work by scanning
status lines would have skipped exactly those, and skipped them for the strongest-sounding reason.

⚠ **The information already existed and nothing compared it.** The manifest's own rows described
`ENGINE_C_SS86` as *"fulfilled at the ship"* and `ITEMS_3_6_perRmd` as shipped — **while the scopes
themselves said Buildable and NOT BUILDABLE.** This is the two-documents-disagree failure again, with
the answer sitting in the file that indexes the other one.

**What to do about it.** A scope's status line is written by the session that *drafts* it and read by
sessions that come *later*; nothing in the release path makes the drafting session's claim expire.
Until something checks it, the honest reading is: **treat any scope status line as evidence of what
was true when it was written, not of what is true now** — and confirm against the CHANGELOG and the
source before believing either "buildable" or "blocked."

⚠ **Swept again 2026-08-28, and the rule above held while nothing enforced it.** Twenty-odd releases
after the first sweep, **twelve** scopes carried live-looking status lines again. Eight were retired;
four are genuinely open. The worst read **BUILD GATE OPEN** about `SCOPE_ENGINE_D_MAGI_v5_24.md`,
shipped at v5.24 — **twenty-nine releases earlier**, and the strongest "pick me up" signal in the
tree. The first sweep did not fail; it simply was not repeated, because nothing repeats it.

⚠ **A version heading in the CHANGELOG is NOT evidence that a scope's work shipped.** This is the
sharp lesson of the second sweep and it disqualifies the obvious automation. `## v5.34` is in the
CHANGELOG, so the test *"named version shipped → retire"* marks `SCOPE_CAPGAINS_ENGINE_v5_34.md`
built at v5.34. **It was not.** v5.34 narrowed mid-build — its own entry says the capital-gains
engine work *"is backed out and held for v5.35"* — and the work re-landed at **v5.36**. That test
would have written a false history into the record, automatically, at every ship. A second brief
error found the same day: four scopes were classified as unconfirmable because they *"predate the
CHANGELOG's oldest entry (`## v5.7`)"* — v5.10.1, v5.10.2, v5.21 and v5.24 all **postdate** v5.7 and
all have entries. Decimal sort is not version sort.

**The sound test is the expensive one: read what the release actually shipped and compare it to what
the scope proposed.** Automation can find candidates; it cannot resolve them. A parent scope needs
every child confirmed, not one release — `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` defined
three, which landed at v5.22, v5.24 and v5.25, and one of its seven decisions (D-2, on HSA) did not
ship as decided. Retiring on the parent's name alone would have buried that. The standing options
for making any of this expire automatically are scoped, undecided, in
`docs/SCOPE_CLAIM_EXPIRY_VERIFICATION.md` — which also covers the served-page half of the same
failure class, deliberately, so this project does not acquire two more gates nothing runs.

**Teach the suite the new version tag — expect this every release.** Several suites gate behavior on an
enumerated list of version tags, and a new tag falls through to the wrong branch. At v5.11 six such
edits were needed. Two shapes to look for:

- **Enumerated tag lists** whose comment says "and later" but whose code says `VER === "v5101" || VER ===
  "v5102"` (t3, t5 ×2, t6). Add the new tag.
- **Substring version checks** that passed by prefix luck: `"v5.10"` is a prefix of `v5.10.1` and
  `v5.10.2` but not of `v5.11` (t4, t9). Prefer an exact per-tag map, or a shape-only check
  (`/v5\.\d+/`) where the suite isn't the one asserting the exact version.

These failures are the reminder working, not a regression — but budget for them.

## J. Re-baseline the regression suite each build

The suite compares immediately-prior → current, and re-baselines every build. There is no permanent floor:
the MC-parity guardrail (§E) already proves the engines haven't drifted release over release, which is
what a permanent baseline would otherwise guard.

## K. The standing code audit (run on command; nudge, never gate)

Specified in `SCOPE_STANDING_AUDIT.md`. Triggered two ways only: **on Steve's command**, or **as a soft
reminder** from Claude that never blocks a release. The audit is explicitly **NOT a release gate** — a
release ships on its own scope + green suite. When running it: "Section C means arithmetic, not
inspection" (compute the expected figure by hand from primary-source law, then compare to engine output),
and "border cases are the point" (one dollar below and one dollar above every threshold). Distinguish a
disclosed limitation from an undisclosed defect; only the undisclosed one is a finding.

### K1. The boundary census — run it at SCOPE time (added 2026-08-23)

`qa/tools/boundaries.mjs`. Answers one question about a household: **does it exercise the behaviour
a scope is about to describe, or is that behaviour $0 there?** Run it two ways:

- **On the example household, before writing a brief.** If the row for the behaviour reads ON, the
  brief cannot quote example-household figures as evidence and must say so up front instead of
  discovering it mid-build.
- **On a PROPOSED FIXTURE, before writing any test code.** This is the more valuable use. At v5.46
  the fixture built for the spouse-B claim gate exercised seven ladder years and looked complete,
  but B claimed in **January**, so a pro-rata gate and a whole-year gate produced identical figures
  and the release's actual modelling decision would have shipped **unverified**. A second fixture was
  needed. The census reports `dobB_month` as ON for that fixture in about five seconds.

**It nudges; it never gates** — the same standing as the audit in §K. A release ships on its own scope
and a green suite, not on a clean census. And per §B1 an unexpected result is a finding on its own
**only while `t29` is green**.

**It hardcodes no constant.** Every numeric threshold is read live through the shim, so the tool
cannot disagree with the app about what a threshold is; `t29` §F pins that, including a check that the
tool's source contains no §86 threshold literal at all — because a band hardcoded to the
currently-correct value passes every comparison until the day the constant moves.

**THE MAINTENANCE RULE — this is the only place it is written down.** *When a release fixes a defect
that was invisible in the example data, the boundary that hid it is added to the census in the same
release.* The structural rows (is the DOB month January; does B's claim year equal the ladder start)
have no source of truth to read and cannot be derived, so growth is what keeps them honest. A census
that never grows is a list of yesterday's blind spots.

**What it does NOT catch, stated so nobody reads more into a clean run.** Two recent defects were not
of this kind and this tool would not have found either: v5.42 was non-zero on the example household
and hid behind the **default slider position** (a view, not a household), and v5.44 was visible on the
example household and simply **unnoticed**. The v5.46 build brief called these part of a four-release
streak of $0-on-example defects; that was wrong, and the honest streak is two — v5.45 and v5.46.

## L. Release packaging — one zip, two destinations

Deliverables reach Steve as a **single zip per release**, never as individual files across messages.

```
danger-close-<version>/
├── README-FIRST.md      <- what to upload where, the delete-first list, the commit message
├── MANIFEST.txt         <- every file + md5
├── COMMIT_MESSAGE.txt   <- title + description, pre-split for GitHub's two boxes
├── github/              <- loose files go to repo root; folder names ARE repo paths
└── knowledge/           <- flat; knowledge has no folders
```

Rules: versioned outer folder · loose files at the top of `github/`, no `root/` wrapper · **changed files
only** (for the repo, differs from what's committed; for knowledge, differs from *or is absent from* the
pool) · knowledge files ride in the same zip · **one zip, cut once, at the end** — if anything changes,
regenerate the whole zip, never a patch file on the side · **test the packaged files before zipping** (run
the suite from the packaged copies; not green → no zip) · the manifest is the authority · name the
`index.html`-shaped files distinctly — there are **three**: the built app (ships to repo root),
`src/index.html` (the Vite template), and a **test-only** rewritten copy that exists during §N verification
and never ships · **`qa/smoke_built.mjs` runs after the build and before the zip is cut** — a release is
not verified until the built artifact has been *exercised*, not merely inspected.

**The shape of the zip is CHECKED, not remembered** (added 2026-08-21). `qa/tools/package_check.mjs`
takes the built zip and a fresh clone and verifies what this section requires: the three index files
are present; every `MANIFEST.txt` md5 matches the file it names; `github/` holds **exactly** the
files that differ from the committed tree — so both a *missing* file and a needlessly-shipped
*unchanged* one fail; `knowledge/` is flat, carries no built `index.html`, and holds exactly one
`DangerClose-v5_*.jsx`; and `MANIFEST.txt` records that the suite was run from the packaged copies.
Run it before sending — **on EVERY package, including ones that ship no app source.**

**Ops packages (added 2026-08-26).** Not every zip is a release. A documentation or tooling package
ships no `DangerClose-v5_*.jsx` and no built `index.html`, so the app-release predicates above cannot
apply to it — and `package_check` knows this even though this section previously did not. Such a
package **declares `KIND: ops` on its own line in `MANIFEST.txt`**; undeclared, the tool fails closed
to `app-release` and reports failures that are artifacts of the mis-declaration rather than real
defects. An ops package also takes an **unversioned** outer folder name, `danger-close-<slug>`, so it
cannot be mistaken for a release, and its manifest still has to record how it *was* verified — the
standard does not lapse just because no app suite applies.

⚠ **Upload by editing in place, not by drag-and-drop (added 2026-08-28).** §L has always described
what goes in the zip and never how the files reach the repo, and that gap has now cost two commits
twice over. **GitHub's drag-and-drop upload silently renames dotfiles** — it landed a `.gitignore` as
a file called `download`, which then had to be found and deleted. The same upload path **drops the
executable bit on any NEW shell script**, which lands as `100644` and cannot be run as
`./script.sh`; replacing an *existing* tracked file preserves its mode, which is why
`qa/runsuite.sh` survived the v5.53 upload at `100755` while a new script would not have. Edit in
place for dotfiles and for any new `.sh`, and check `git ls-files -s` afterwards — the repo's shell
scripts are all `100755` and a `100644` among them is the tell.

⚠ **`F-1` runs in BOTH modes and is not a formality: the pool is ADD-ONLY.** A same-name upload
creates a *second* copy rather than replacing the first, so every package — release or ops — must
name its delete-first list explicitly in `README-FIRST.md`.

This paragraph exists because the v5.50 documentation package was **shipped without `package_check`
being run at all**. The cause was legible in hindsight: this section described the tool purely in
release terms — one versioned source in `knowledge/`, a suite run from the packaged copies — none of
which a doc package can satisfy, so it read as a section that did not apply. Re-run afterwards, that
zip failed **4 of 25**, and one failure (the missing delete-first list) was real in either mode.
**A section that visibly does not apply to the package in hand will be skipped, so it has to say
which packages it covers.**

This exists because §L was skipped at v5.42 while being perfectly legible —
a rule nothing checks is a rule this project has now watched drift five separate times (§B2), and
the answer here is the same as everywhere else: make it fail loudly.

**Never ship a reconstructed file.** If a needed input is missing from knowledge, stop and ask for it
rather than inferring it. At v5.11 a reconstructed `src/main.jsx` produced a build that rendered perfectly
and was silently unable to persist data (§N2). A reconstruction also must not be packaged, because
uploading it would overwrite the real file in the repo.

## M. Engine instrumentation ceiling (added 2026-08-08)

Not every engine is testable to the dollar, and a scope must not assume otherwise.

- **Module-level engines are dollar-exact testable.** `shim.txt` exports module-level bindings, so
  `runRothStrategies` and friends can be driven headlessly and compared to the cent.
- **Component-inline engines are NOT.** An engine computed inside the `DangerClose` component body has
  no module-level binding, so the shim cannot reach its row array. Its only output path is the rendered
  DOM — which formats every figure as `Math.round(x / 1000)` (`toFixed(1)` on the IRMAA surcharge).
  **Ceiling: ±$500, and ±$50 for the IRMAA surcharge.**
- **This category is NOT empty, and the sentence that said it was stood for 25 releases.** ⚠ From
  v5.21 until 2026-08-23 this bullet read *"This category is now EMPTY … Every engine is module-level
  AND dollar-exact tested."* **That was false**, and it was contradicted the whole time by the
  manifest (which says the conversion ladder is component-inline, twice) and by five suites that run
  at ±$500 citing this very section. Corrected at the v5.47 freshness check.
  - **What is true.** The four DRAWDOWN engines left the category and are dollar-exact: Engine C at
    v5.17–v5.18 (hoisted, exported, asserted by `t17`), **Engine B at v5.19–v5.21** (hoisted to
    `computeTaxPlan`, exported, asserted by `t18`), alongside Engine A (`runRothStrategies`) and
    Engine D (`computeWithdrawalPlan`, hoisted v5.23).
  - **What remains inline.** The **Roth tab's conversion ladder** — `_perRmd` and the ladder loop
    around it, computed inside `DangerCloseMain`. It appears in NONE of the shim's three export
    surfaces (`__g`, `__test`, `__engines`) and never has. `runRothStrategies` being exported is not
    the same thing: it is the strategy COMPARISON, not the tab's per-year ladder.
  - **How the error was made, because the shape recurs.** The claim traces to a comment in
    `shim.txt` at the `__engines` export — *"which empties the ±$500 category in OPERATIONS §M — no
    engine is now both inline AND unreachable."* True **of the four drawdown engines**; this section
    generalised it to "every engine." ⚠ **That comment is still uncorrected** — it is a harness file
    spliced into every leg by `mk_testable.sh`, so amending it requires a full suite run and belongs
    to a release that is running the suite anyway.
- **TWO different reasons a suite reads at ±$500 — do not conflate them.** `t13`, `t14`, `t16` read
  the DOM **by design**: the engine behind them IS reachable, and these suites exist to prove the
  tabs render what it computes. `t23`, `t24`, `t26`, `t27`, `t28` read the DOM **by necessity**:
  there is no module-level binding to read. Only the second group is a measurement gap.
  - ⚠ **The ladder's RMD cards are the exception, and they matter.** They render
    `_perRmd.A.noConv.toLocaleString()` — **full dollars, no `/1000`** — so RMD figures on that tab
    ARE dollar-exact pinnable (`t23` pins $44,991). MAGI and the balance columns are not. A scope
    touching the ladder should say which of the two it is measuring rather than assuming ±$500
    across the tab.

- **Hoist and export stay in SEPARATE releases.** Run twice now (C at v5.17/v5.18, B at v5.19/v5.21)
  and it held both times: a refactor that ships new assertions is one whose safety you can no longer
  check, because green stops distinguishing "the code is unchanged" from "the tests were written to
  match whatever it now does". Do not read "the Taxes and IRMAA engines" anywhere as a permanent
  pairing; it was true through v5.16 only.
- **Consequence for scopes:** never write "dollar-exact confirmation pending a jsdom render" for the
  four drawdown engines — they are reachable, so drive them. State the achievable precision, and
  state whether the effect being measured **exceeds** it. ⚠ **An effect smaller than the ceiling is
  the trap**: a $300/yr change to a figure rendered at `Math.round(x/1000)` is invisible, so a
  DOM-based invariant for it passes vacuously. Measure it at the engine or do not claim to have
  measured it.
- Lifting the ceiling does **not** require a new harness capability, which is what the v5.17/v5.18 pair
  demonstrated. The earlier plan here — splicing a test-only rows hook into the `app_<tag>.jsx` copy —
  was **superseded**: it needed a reliable anchor into a file that changes every release. Hoisting the
  engine to module level needs no anchor, is provable by "every figure identical", and leaves the engine
  reachable permanently. **That pattern has now been run three times** — `taxFactsFor` (v5.16),
  Engine C (v5.17/v5.18), Engine B (v5.19) — and is the default approach for anything computed inside
  the component body: hoist with no behaviour change, prove it by every figure returning identical,
  then export and test in a SEPARATE release.

*(Background: `STOP-REPORT-EngineBC-render-precision.md`.)*

## N. Building and verifying `index.html` (added 2026-08-08)

The published artifact is built, not hand-assembled, and a green source suite says **nothing** about it.
Both failures below are structural — they recur in any session starting from knowledge alone.

### N1. The scaffold, and what each file does

| File | Role |
|---|---|
| `src/DangerClose.jsx` | The canonical app source. |
| `src/index.html` | Vite HTML entry template. Carries the first-open **disclaimer gate**, which is plain inline script and runs independently of React. |
| `src/main.jsx` | **The browser bootstrap — not a trivial mount.** Installs a `window.storage` localStorage shim and an Anthropic fetch wrapper *before* rendering. |
| `vite.config.js` | `root: "src"`, `viteSingleFile()`, output to `../dist`. |
| `package.json` | Pins the toolchain. |

Build: copy the four scaffold files plus canonical source into a scratch folder, `npm install`, then
`npx vite build` → `dist/index.html`. Publish by copying that file over the repo-root `index.html`.

**Mount-name gotcha:** project knowledge presents the config to a session as **`vite_config.js`** (the
mount rewrites the inner dot; it is correctly named `vite.config.js` in the pool and the repo). Copy it to
`vite.config.js` in the build folder — Vite silently ignores a differently-named config and falls back to
defaults, which produces a `dist/` with separate JS files instead of one self-contained file.

### N2. NEVER reconstruct `src/main.jsx`

If it is missing, **stop and ask for it.** Do not infer it from the template's `<script src>`.

The app calls `window.storage.*`, an API that exists in the artifact environment but **not** in a normal
browser; `main.jsx` supplies the localStorage-backed shim. A build made from a plain
`createRoot(...).render(<App/>)` entry:

- renders correctly,
- loads the example household,
- passes every source-level suite (they test the source, not the bootstrap),
- and **cannot save or reload a plan.**

The failure is invisible to inspection and to any test that doesn't exercise persistence. This happened at
v5.11 and was caught only when the real file arrived and was compared by hash. The same caution applies to
any bootstrap-shaped file: reconstructing an entry point is guessing, and guessing is what "verify, don't
recall" forbids.

### N3. Verify the built artifact, not just the source

Run all four against `dist/index.html`:

1. **Version:** all four in-app strings present exactly once; zero stale prior-version strings.
2. **Self-containment:** no `<script src=...>`; the only external reference is the intentional Google
   Fonts `<link>`.
3. **Provenance:** built from the canonical md5 the suite ran against; record source **and** built md5s in
   the CHANGELOG and commit message.
4. **Behavior:** run `qa/smoke_built.mjs` — boots, gate renders and dismisses, React mounts, example
   household loads, a data tab renders, and **the `window.storage` shim round-trips** (set/get/list/delete,
   the `dc:`-prefixed localStorage write-through, and get-throws-on-missing).

**Check 4 is the one that catches a wrong bootstrap; 1–3 all pass on a broken build.**

### N3a. The runnable recipe (executed 2026-08-11, not inferred)

From a clean folder holding the four §N1 scaffold files plus the canonical source as
`src/DangerClose.jsx`. Copy the config to **`vite.config.js` — with the dot** (§N1 gotcha; §G).

```
npm install
npm install --no-save jsdom     # harness dep, deliberately NOT in package.json; --no-save
                                # keeps the scaffold package.json byte-identical to knowledge
npx vite build                  # -> dist/index.html, the ONLY output
node qa/smoke_built.mjs         # -> 16 checks. An optional first argument overrides the
                                # input path: `node qa/smoke_built.mjs some/other.html`
```

**The build emits `dist/index.html` and nothing else.** `qa/smoke_built.mjs` derives its own
classic-script copy in-process, writes it beside the input as `*.__smoketest__.html`, and unlinks it on
exit. It is not a file that is kept, committed, or carried between sessions — do not add a build output
to produce one.

**Recorded so this is not re-solved a third time.** Before commit `455a2f1` the script read a hand-made
`dist/index_classicscript_TESTONLY.html` that **no build step ever produced** — so a check added because a
build passed every source check while being unable to save a plan had itself depended on an
unreproducible input from v5.11 until 2026-08-10. If a session ever again finds this test unable to
locate its input, the fix is in the test, not in `vite.config.js`. Rewriting the `<script type="module">`
tag *in place* is not an acceptable substitute for the relocation in §N4 — recorded 2026-08-10 (and not
re-reproduced since): a partial pass with React never mounting, the #299 signature.

**Expected result: 16 passed, 0 failed, exit 0.** Negative-controlled 2026-08-11 — building with a plain
`createRoot(...).render(<App/>)` entry gives **10 passed, 2 failed**, failing only the two
bootstrap-contract checks while still rendering, loading the example household and reaching the Taxes tab.
Note the denominator moves: with the shim absent the four `window.storage` round-trip checks sit inside
`if (window.storage)` and do not run at all, so the run reports out of 12, not 16. The run still exits
non-zero, so nothing escapes — but do not read a ratio without reading the total.

**Bit-reproducibility — LOST at v5.30, RESTORED at v5.31, and the v5.30 diagnosis was wrong.**
On this recipe both v5.21 and the v5.22 candidate rebuilt **byte-identical** to their published
artifacts. At v5.30 that appeared to break: rebuilding **v5.29 from its own unmodified source**
produced `bccfd60d4afa19992d9c1f0c0713e4cb` against the published `fe6bf7d4230abdacbf7ce1171798feb3`,
with the source hash verified identical and all five recorded toolchain versions matching. That
session blamed **rollup**, an unpinned transitive caret dependency of vite (`^4.20.0`), and recorded
the loss as permanent absent a lockfile.

⚠ **That diagnosis does not hold.** At v5.31, rebuilding **v5.30 from its own unmodified source**
reproduced its published artifact EXACTLY — `183b58b463fcd56dfb71311a4cd68caf` — while resolving
**rollup 4.62.4, the very version blamed**. Rollup was not the cause. The v5.30 session was comparing
across a toolchain *generation*: it rebuilt v5.29, an artifact produced by an older dependency tree.
Reproducibility holds release over release when the tree matches, and breaks when you reach back past
a tree change — which is a different and much less alarming property than "reproducibility is gone."

**So the useful check is to rebuild the IMMEDIATELY-PRIOR release, not an older one.** If that
reproduces, the scaffold is complete and the current build's hash is trustworthy. If it does not,
suspect the tree before suspecting the source.

Toolchain resolved at v5.31, and byte-identical to what produced v5.30: vite 5.4.21,
@vitejs/plugin-react 4.7.0, vite-plugin-singlefile 2.3.3, **rollup 4.62.4 (still unpinned)**, react
and react-dom 18.3.1, node 22.22.2, jsdom 30.

**What this means in practice.** A matching built md5 is strong confirmation the scaffold is
complete, and after v5.31 a mismatch against the *immediately-prior* release is worth investigating
rather than shrugging at — but a mismatch against an *older* release is expected and means little.
**The binding check on a built artifact is `smoke_built.mjs` at 16/16 plus the §N3 checks — not the
hash.** Record the built md5 for provenance, and do not hold a release for it. If byte-identical
rebuilds are ever wanted back, the fix is a committed lockfile, not a longer list here.

### N4. Three jsdom traps when testing the built file

Both cost real time at v5.11; neither indicates a defect in the build.

- **jsdom does not execute `<script type="module">`.** The app appears never to mount. Workaround used by
  `qa/smoke_built.mjs`: rewrite the inlined module to a classic `<script>` **and relocate it to just before
  `</body>`**. The relocation is not optional — module scripts are *deferred*, classic ones are not, so
  running it in place executes before `<div id="root">` exists and throws **React error #299**. This is a
  test-only transform on a copy; never modify the shipped file.
- **jsdom ships no `fetch`.** The bootstrap calls `window.fetch.bind(window)` before mounting, so it throws
  and the app never mounts. Stub `fetch` in JSDOM's **`beforeParse`** hook — anything later is too late,
  because the inline scripts have already parsed.
- **The tag rewrite must use a *function* replacement.** `String.prototype.replace` with a string
  replacement interprets `$&`, `` $` ``, `$'` and `$1` inside the *replacement* text — and the minified
  bundle is full of them, so the script is silently corrupted. Symptom: "Unexpected end of input" and a
  gate that will not dismiss, which reads like a broken build rather than a broken test. Pass a function
  (`.replace("</body>", () => block + "\n</body>")`) and the replacement text is taken literally.
