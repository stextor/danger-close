# SCOPE — ops package · E-29 (b), (c), (g) and (i): four tooling and suite threads

**FULFILLED — shipped as the ops package of 2026-10-12.** Repo-only. §6 is the build record.

*(Superseded status line, retained:)* **READY — 2026-10-12.** All four decisions taken (§5) — Steve took every recommendation. Repo-only. An OPS package: no app source change, no version bump, no figure moves.
Steve, 2026-10-12: *"let's do the E-29 housekeeping package for items (b), (c), (g) and (i)"*; D-34 kept out (it changes Engine D — its own release).

## 0 · Premise (verified at v6.07, not assumed)

Freshness (OPERATIONS §A): `origin/main` = `a7de0b9` (v6.07 and its chmod), fresh clone; source `ee557028aba1dfb1acb5bb647f6c5630` = repo = pool
(hashed after `project_read`) = CHANGELOG newest; built `5b444023ed72ebca40c9d0443b2ddf05` = live Pages. Pool: 127 files (Projects listing, 2026-10-12).

### (b) `t13`'s survivor check measures more than its name says

`t13` case 1/case 2 assert *"MAGI falls at the first death by the smaller SS check (85% taxable)"* — a year-over-year DOM read (death year
against the year before) within ±$4K of $13,260. Measured at v6.07, engine level (`computeIrmaaPlan`, the tab's own inputs):

| | year-over-year drop (what the check reads) | death effect, counterfactual (no death − death, same year) | SS term (both alive, smaller check removed) | rollover RMD change |
|---|---|---|---|---|
| case 1 (A dies, 2044) | $14,965.90 | $17,082.82 | **$13,260.00** | $3,822.82 |
| case 2 (B dies, 2042) | $10,675.39 | $12,653.31 | **$13,260.00** | −$606.69 |

The death effect is **exactly** the SS term plus the RMD change the rollover causes (the survivor's divisor applies to the merged balance) —
to the cent in both cases. So the check is named for the SS loss while measuring SS + rollover + a year of drift; the ±$4K band absorbs it
(margins 2.29 and 1.42 at v6.07). Its comment still calls the 85 % "the engine's flat SS-taxability approximation" — stale since v5.43
(§86; here the household is past convergence, which is why 85 % holds).

### (c) `package_check` E-1b skips renamed pool files silently

E-1b resolves a `knowledge/` file to its repo path by **basename**; zero candidates → skipped without a word; several → skipped and announced.
Census of the pool against `git ls-files` (2026-10-12): **zero candidates** — `qa-baseline-README.md` (repo `qa/qa-baseline/README.md`),
`tools_fixture.jsx` (repo `qa/tools/fixture/fixture.jsx`) and the versioned source (E-2's, excluded by design); **several** — `README.md` (3
paths), `index.html` (2). Four pool files E-1b cannot see. The manifest's hash rows already carry each file's repo path in their third cell
(e.g. `| tools_fixture.jsx | … | qa/tools/fixture/fixture.jsx |`, `| index.html | … | src/index.html |`).

### (g) No check runs manifest → pool for rows without a hash

K-8 checks hashed rows with a plain filename; K-9 runs pool → manifest. A row naming a file that has left the pool, with no hash, is seen by
nothing. Census of the three indexing sections (rows `| \`name\` | …`, the Retirement list excluded) against the pool: **49 rows** name a file
not in the pool and carry no repo-only wording — 27 audit/scope rows, 12 `qa/tools/` rows under a "Repo-only" sub-heading, 6 under
*Everything else* (`dom_entry_v546/552/553.jsx`, three scope files), 1 `vite_config.js` (in the pool — the mount's name; the Projects
listing shows `vite.config.js`, OPERATIONS §N's gotcha), and **3 scope files that exist in neither the repo nor the pool**
(`SCOPE_CONSOLIDATE_taxable_residual_v5_22.md`, `SCOPE_FIX_irmaa_indexation_v5_13.md`, `SCOPE_FIX_roth_tab_filing_status_v5_14.md`, never
committed). The ID `K-10` that E-29 named is taken (TESTING's Current-build line), and so is `K-11`; a new check is **`K-12`**.

### (i) The suite's harness dependencies float

`mk_runfolder.sh` runs one `npm install esbuild react react-dom d3 xlsx mammoth jsdom acorn acorn-jsx acorn-walk` with no versions, then
restores the committed `package.json`/`package-lock.json` (which carry no `jsdom`, `esbuild` or `acorn*`). Every run folder resolves them
fresh. v6.07's resolved: jsdom 29.1.1, esbuild 0.28.2, acorn 8.19.0, acorn-jsx 5.3.2, acorn-walk 8.3.5, react / react-dom 18.3.1, d3 7.9.0,
xlsx 0.18.5, **mammoth 1.13.0** (the app's lock pins 1.8.x — the run folder does not even use the app's own resolution). Transitive
dependencies float too.

## 1 · The change (recommended options)

- **(b)** `t13` gains an engine-level section on both cases: the death effect (counterfactual, same year) equals the SS term **plus** the
  rollover's RMD change to the cent, and the SS term equals 85 % of the smaller annual check to the cent (this household is past §86
  convergence — asserted, not assumed: the counterfactual itself is the evidence). The DOM check keeps its ±$4K band but is renamed to what it
  reads (year over year: the SS loss, the rollover's RMD change and a year's drift), and the stale comment is corrected.
- **(c)** E-1b resolves a name with zero or several basename candidates through the manifest's hash-row path cell, checking that the path exists
  in the clone; anything still unresolved is announced, never skipped silently. New controls in `package_check_controls.sh`: a renamed pool file
  that differs and is absent from `github/` must fire E-1b.
- **(g)** **K-12:** every row in the three indexing sections either names a pool file or carries the marker `repo-only` (or, for the three that
  exist nowhere, `in neither the repo nor the pool`). The 49 rows are marked in the same package — a marker, not a deletion. A §B2 control: an
  unmarked row naming a file not in the pool must fire K-12, and a marked one must not.
- **(i)** A committed harness lock — `qa/harness/package.json` + `package-lock.json` pinning the ten packages at v6.07's versions — installed by
  `mk_runfolder.sh` with `npm ci`; the scaffold copies are restored as today. `controls_runfolder_prior.sh` gains a check that the run folder's
  `jsdom` is the locked version.

## 2 · Site census (parser, at the build)

`t13` (one suite; its count rises), `qa/tools/package_check.mjs` (E-1b, K-12), `qa/tools/package_check_controls.sh` (new P-controls),
`qa/mk_runfolder.sh`, `qa/tools/controls_runfolder_prior.sh`, the new `qa/harness/` pair, `PROJECT_KNOWLEDGE_INDEX.md` (49 markers, the new rows),
OPERATIONS (§B2a's t13 note, E-1b's notes, K-12, §B / §N3a's install), `docs/ARCHITECTUREIssues.md` E-29, TESTING, CHANGELOG (an ops entry).
**App source: zero edits** — the package changes no `.jsx` and no figure.

## 3 · Tests

The full suite from the packaged copies (no app change: every count equal to v6.07's but `t13`'s). `package_check_controls.sh` in both phases,
with the new controls firing; `controls_runfolder_prior.sh` green; `row_census.cjs` if any of K-8's three row expressions is touched (they are not
planned to be).

## 4 · Out of scope, and stop conditions

Out: E-29 (a), (h), (j); D-34; the app's own `package.json`/lock (untouched — the build keeps its lock and the built page its md5).
Stop: any figure or app check moving; `npm ci` failing to reproduce v6.07's run (the suite must stay green on the locked versions); E-1b or
K-12 going red on the v6.07 package as shipped once the markers land.

## 5 · Decisions for Steve — **taken 2026-10-12: DD-b (a), DD-c (a), DD-g (a), DD-i (a)**

- **DD-b · `t13`.** (a) **Add the engine-level counterfactual and rename the DOM check** *(recommended)*. (b) Rename and re-comment only.
  (c) Leave it recorded.
- **DD-c · E-1b.** (a) **Resolve renamed and multi-path names through the manifest's path cell; announce the rest** *(recommended)*.
  (b) Announce the zero-candidate skip only (no new coverage, no silence). (c) Leave it.
- **DD-g · K-12.** (a) **Build K-12 and mark the 49 rows** (the three that exist nowhere marked as such, not deleted) *(recommended)*.
  (b) Build it as a printed report, not a gate. (c) Leave it.
- **DD-i · the harness.** (a) **A committed harness lock installed with `npm ci`** — everything pinned, transitive too *(recommended)*.
  (b) Exact versions in the install line — the ten pinned, their dependencies still float. (c) Leave it; print the resolved versions in each run.

## 6 · Build record (2026-10-12)

- **(i)** The lock was generated from v6.07's run folder (`npm install --package-lock-only` over its installed tree): 184 entries, every version equal
  to the run's own record. A run folder built from it by `npm ci` matched v6.07's tree entry for entry, and its app modules and DOM bundles were
  byte-identical to v6.07's. `controls_runfolder_prior.sh` 8 passed, 0 failed (G, H new).
- **(b)** `t13` §E as measured in §0, now in the suite: case 1 (A dies) $17,082.82 = $13,260.00 + $3,822.82; case 2 (B dies) $12,653.31 = $13,260.00 − $606.69; E-5 ties
  each engine run to the DOM's death-year row ($201K both cases). `t13` 42 → 53.
- **(c)** `qa-baseline-README.md`'s pool copy was read through the Projects tool and hashed: `9289a5b407061e76d94bc0c5812f8f71`, byte-identical to
  `qa/qa-baseline/README.md` — then its row was written. P72 and P73 fire on the new matcher.
- **(g)** 50 rows marked by script (47 `repo-only`, 3 `in neither the repo nor the pool`); the pool listing of 2026-10-12 (127 names) was the
  reference; `vite_config.js` is the mount's name for the listing's `vite.config.js` and counts as present. P74 fires, P75 is silent.
- **Suite:** 6,442 app checks, 69 suites, 0 failed, 0 DIED; GRAND 6,577. Run from the PACKAGED copies as two concurrent halves (the v5.87 method): run folders built by the PACKAGED mk_runfolder.sh v606 v607 — so installed from the packaged harness lock — from the workspace, a full clone of a7de0b9 carrying exactly the packaged changes, each changed suite and tool hash-checked against its run-folder copy. Half A GRAND 6355, half B GRAND 222; none DIED.
