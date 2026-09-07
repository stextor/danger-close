# STOP REPORT — New Mexico (v5.66), halted at the note rewrite

> ## ☑ D-NM-1 ANSWERED 2026-09-07 — (c). THIS REPORT IS NO LONGER THE ENTRY POINT.
>
> **Read `STOP-REPORT-v5_66-nm-session2.md` instead.** That is the live handover for New Mexico;
> this document is the record of how the release was stopped the first time and why.
>
> §4's decision is **RESOLVED as (c)**: ship New Mexico on a note that RETAINS the phrase
> *"income-limited"* so the guarded set survives, and scope the selector fix separately. **The note
> half is built** — NM's row now carries the phrase plus a comment at the site saying it is
> load-bearing, and `t35` **D-7a** pins it: NM must leave the income-limited set by CONVERTING, not
> by rewording. A negative control fires on the reword.
>
> ⚠ **THE SECOND HALF OF (c) IS STILL OWED.** (c) was *"ship the safe note AND scope the selector
> fix in the same session, not as an intention."* **That scope is not written.** A test that selects
> a state set by executing a regex against user-facing copy will break again the next time the copy
> improves, and this is already the second occurrence. **Until it is written, (c) has quietly become
> (a)** — which §4 explicitly says is not an acceptable final answer.
>
> ⚠ **Nothing else in this document is live.** §3's finding stands as the record of the defect;
> §4's options (a) and (b) are spent. Retired as an entry point 2026-09-07, one day after it was
> written — which is the point of retiring a document AT the moment its decision lands rather than a
> release later.

> ## ⚠ FILED 2026-09-07 — this report's own destination line was WRONG, and is corrected here
>
> **It read *"Session-only. Nothing shipped."*** It was then filed in `docs/` and the pool anyway,
> which was the right call and the opposite of what it said. **A document instructing its reader to
> let it expire, from inside the pool it is sitting in, is a document arguing with the shelf it is
> on.**
>
> The recommendation was made without checking precedent, and precedent contradicts it: the repo
> holds **eight** stop reports in `docs/`, and the one describing still-live work —
> `STOP-REPORT-v5_63-fica-workbench.md` — is **also in the pool with a manifest row**. Seven
> completed ones are repo-only. That is H-2's settled shape: **a live handover goes to both; it
> rotates to repo-only when the work it hands over has shipped.**
>
> **It was also renamed in the same package**, from `STOP-REPORT-NM-note-guarded-set.md`. All eight
> siblings carry the version they stopped in; this one did not, and a file that sorts away from its
> siblings is a file the next sweep reads as something else.
>
> **Current destination: `docs/` AND the pool, with a manifest row, until New Mexico ships.** At that
> ship it rotates to repo-only under H-2 and its row is annotated rather than deleted.

**Nothing was shipped by the session that wrote this. No package was cut for the NM build itself.**
**D-NM-1 in §4 is still open and is the reason the build stopped.**

| | |
|---|---|
| Kind | **STOP mid-build**, per OPERATIONS §L's stop rule. Not a release |
| Base build | **v5.65** · source `7604fac5dab891bb31905544d11072f8` · artifact `b4ea0bd1d6993aadd0b7fedcfe47e580` · repo `a1cef19` |
| Target | v5.66 — **not reached.** No version bump was made |
| Reason for the stop | A **decision for the maintainer** surfaced mid-build, and OPERATIONS forbids adapting silently when evidence meets a judgement call |

---

## 1 · The premise, verified before anything was edited

**The machinery New Mexico needs already exists and is already tested.** This was resolved against
source with `qa/tools/census.cjs`, not recalled:

- `_fromTest` at **L1253–1266** supports `kind: "bands"` with rows carrying **either** `pct` **or**
  `amount`. Its own comment names New Mexico's **nine amount rows** as the case it was built for.
- `cmp` defaults to **`lte`** — inclusive — which is what NM's *"not over $30,000"* wording requires.
  Only Connecticut sets `lt`. **No `cmp` key is needed on NM.**
- `unit` is per person unless the string is `"household"`, so `unit: "person"` gives NM's *per
  qualifying individual*.
- `_floor` defaults to **65** when a row carries no `exclAge`, which is exactly NM's statutory floor.

**So this release is a table transcription into a tested mechanism, not new machinery.** The table
comes from `docs/FINDINGS-v5_63-state-statutes.md` §2 (NMSA 1978 § 7-2-5.2) and was encoded, not
re-derived, as §9 of that document requires.

**Direction: the current model is OPTIMISTIC and the fix is conservative.** NM today grants a flat
`excl65: 8000` at every income level; the statute steps it to **$0 above $51,000 MFJ / $28,500
single AGI**, and has never been indexed since Laws 1987, ch. 264, § 6. For a mainstream household
near retirement the provision effectively does not exist, and the model grants it in full.

## 2 · The environment was proven, not assumed

Full toolchain installed and the harness run before any edit:

- `mk_testable` on both legs, both DOM bundles built.
- **`run_all.sh v565` green**, `t10` **244 passed / 0 failed**, `t29` **61 passed / 0 failed**.

That baseline is the thing the stop is measured against.

## 3 · ⚠ THE FINDING — the note rewrite silently drops NM out of a guarded set

The edit changed NM's user-facing note from
*"…$8K 65+ exemption **income-limited**"* to
*"…$8K 65+ exemption **phases to $0 above $51K MFJ/$28.5K single AGI**"* — which is more accurate,
more useful, and **breaks a test-set membership that nothing reports.**

`qa/tools/boundaries.mjs` L117 and `t10` L921–923 both select the income-limited state set with the
same regex, `/income[- ]limited|income limit/i`, executed against each state's own `note` string.
Measured on both sources:

| | v5.65 note | v5.66 draft note |
|---|---|---|
| **NM** | **IN** the set | ⚠ **OUT** — note changed |
| RI | IN | IN |
| VA | IN | IN |
| NJ | IN | IN |
| WI | out (correct — no income limit) | out |

⚠ **`t10` still reports 244 passed / 0 failed against the edited source.** The suite does not fail;
the guarded set just gets smaller, and every assertion over it goes quiet. **A shrinking set is
invisible to a green suite** — that is §B2's whole subject.

**This is a recurrence, not a novelty.** `PROJECT_KNOWLEDGE_INDEX.md` and `OPERATIONS.md` §B1a both
record it from v5.54: *"it did not foresee that rewording NJ's note would drop it out of `t29`'s
`state_excl_limited` boundary set."* `boundaries.mjs`'s own comment at L129 names that same incident.
**The mechanism that caught it then was a person noticing. Nothing was built to catch it since**, and
here it is again, on a different state, in the release that populates it.

## 4 · The decision — D-NM-1, for Steve

**The note is user-facing copy and the regex is a test selector, and right now the copy is load-bearing
for the test.** Three routes:

**(a) Keep "income-limited" in the note, alongside the new detail.**
*e.g. "…$8K 65+ exemption is income-limited: phases to $0 above $51K MFJ/$28.5K single AGI."*
Cheapest, ships today, no suite change. ⚠ **But it leaves the trap armed** — the next note rewrite,
on any of the four states, re-arms it, and this is the second time.

**(b) Keep the note as drafted and add NM to the guarded set explicitly**, by state code rather than
by prose match. Correct in the long run: a test that selects on user-facing copy will keep breaking
when the copy improves. ⚠ Larger — it touches `boundaries.mjs`, `t10` §2E and `t29`, and
`boundaries.mjs`'s own header says *"no state code is written down in the tool, per §K1"*, so this
route argues against a stated design rule and needs that rule revisited rather than quietly broken.

**(c) (a) now, (b) as its own scope.** Ship NM on the safe note today; scope the selector fix
separately, with a control that fires when a state silently leaves the set.

*Recommendation: **(c).*** It gets the conservative figure correction to users this release without
bundling a test-architecture change into a state-population release — the pattern §5's *"do not
bundle"* keeps recommending, and the one this project keeps being glad of. ⚠ **But (a) alone is not
acceptable as a final answer**, because the second occurrence of a defect is the one that predicts a
third. Route (b) should be scoped in the same session that ships (a), not left as an intention.

## 5 · A second, smaller item found and NOT decided

**`t34` is version-gated and does not know `v566`:** *"FATAL: version tag `v566` is not registered in
this suite. Registered: v564, v565."* This is OPERATIONS §I's *"teach the suite the new version tag —
expect this every release"* working exactly as designed. It is not a defect and it is not blocking;
it is listed so the next session budgets for it. **The v5.65 entry records that this trap class has
now been hit three times and that only a parser sweep afterwards counts as evidence** — a blanket
pattern is the wrong instrument.

**Also still owed and untouched by this session:** `t10` §2E's `2E age control` currently asserts a
**five**-state `exclAge` set gated at `v565`. NM as drafted carries **no** `exclAge` key (it relies on
the correct default of 65), so that assertion is unaffected — **but that was a design choice, made to
keep the diff minimal, and it is worth a look.** The v5.65 lesson cuts the other way: Connecticut's
missing `exclAge` defaulted to 65 when 0 was wanted, and was found *by reading the row rather than the
handover*. Here 65 is what the statute says, so the default is right — but an explicit `exclAge: 65`
would be more legible at the cost of gating that assertion at `v566`.

## 6 · What was NOT done

No version bump at any of the four in-app sites. No `METHODOLOGY.md` update. No new tests or negative
controls. **No full suite run against the edited source** — only `t10` and the baseline. No
`index.html` rebuild, no `smoke_built`, no package. **Nothing was uploaded anywhere.**

## 7 · Every file this session modified or created — §L's stop table

| File | md5 | Destination |
|---|---|---|
| `v566.jsx` (the NM edit, in the run folder) | `75ac18aff85cd3460aec1f2a5af24e54` | ⚠ **SESSION-ONLY, and it will be lost.** It is one localized edit to `STATE_RULES.NM` plus a rewritten note, reproducible in minutes from §2 of the statutory findings — **it is not the v5.63 case where sixteen files of version-gate work survived nowhere.** If D-NM-1 resolves as (a), the note text changes anyway, so preserving this draft would preserve the wrong string |
| This stop report | `a2a9b408a94e6192eef396b646a0c880` *(as first filed, before the rename and this correction)* | ⚠ **CORRECTED 2026-09-07 — this row said "session-only" and was wrong.** It is filed in **`docs/` AND the pool, with a manifest row**, matching `STOP-REPORT-v5_63-fica-workbench.md`, because it hands over live work and the session that resumes NM needs §3 and §4. **Rotates to repo-only when NM ships**, under H-2. §3's finding and §4's decision are the durable half; if D-NM-1 resolves as (b) or (c), re-home them into the new scope rather than leaving the only copy in a stop report |

**Nothing else was modified.** The clone at `/tmp/ship3` is unmodified except for `node_modules`,
`package.json` and `package-lock.json`, which carry this session's `npm i` and **must not be shipped**
— they are the same G-1 artifact flagged earlier today.

## 8 · Where to resume

1. **Resolve D-NM-1.**
2. Re-apply the NM row from §2 of `FINDINGS-v5_63-state-statutes.md` — encode, do not re-derive.
3. Register `v566` in `t34` and sweep for other gates **with a parser, not a pattern**.
4. New `t34`/`t35` assertions for NM's nine bands and both filing statuses, hand-computed first, with
   a negative control per assertion.
5. Version bump at all four in-app sites, `METHODOLOGY`, full suite both legs + parity, `index.html`
   rebuild, `smoke_built`, then §L.

⚠ **And before any of it: P1–P28.** See the note in the covering message — the ordering as previously
stated was not executable, and the corrected form is that they run against **NM's own package**,
before its zip is sent.
