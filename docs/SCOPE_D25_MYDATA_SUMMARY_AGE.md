# SCOPE — D-25 · My Data's summary says the age the model applies (v5.88)

**FULFILLED — shipped as v5.88 (2026-10-01).** Retired to repo-only at the ship (OPERATIONS §G). §7 is the build record.

*(Superseded status line, retained:)* **DRAFT — 2026-10-01. Decisions D25-A and D25-B (§5) need Steve's answer before any build.** Steve chose to fix D-25 in v5.88
(option (a), 2026-10-01). Presentation-only: no figure, rate, rule or age in the engine moves.

## 0 · Premise (verified against v5.87, not assumed)

Freshness check first (OPERATIONS §A): repo `622d0ec`; all 116 pool files match committed content; source
`3bb42add57012e0e8a9d6df350afd0df` = pool = manifest = CHANGELOG newest.

My Data's state line opens with a generated summary, built in `MyDataEditor` (L12932) from `STATE_RULES`, not from the note.
For every row with a dollar exclusion it renders the literal `` `$${(excl65/1000).toFixed(0)}K/person 65+ exclusion` `` — "65+"
whatever age the engine applies (`stateTaxAnnual`: `_floor = exclAge ?? 65`).

**Measured through the DOM bundle (`dom_v587.cjs`)**, all 18 rows with `excl65 > 0`. The rendered summary was compared with the
engine's measured onset, meaning the youngest age at which a single filer's state tax drops:

| Row | Summary shows | Engine applies it from | |
|---|---|---|---|
| **DE** | $13K/person 65+ | **60** | ✗ |
| **KY** | $31K/person 65+ | **any age** (`exclAge: 0`) | ✗ |
| **RI** | $50K/person 65+ | **67** | ✗ |
| **WI** | $24K/person 65+ | **67** | ✗ |
| other 14 | …65+ | 65 | ✓ |

New Mexico first appeared wrong because its $8K exemption is income-limited and the probe household ($50,000) was above the limit.
At $15,000 the onset is exactly 65 ($735 → $343). It is not a finding.

**Second, smaller defect at the same site:** `toFixed(0)` on thousands. It rounds four figures **up**, so the label shows a bigger
exclusion than the engine applies: DE $12,500 → "$13K", ME $49,824 → "$50K", MD $40,600 → "$41K", MT $5,660 → "$6K". It rounds two
down: KY $31,110 → "$31K", LA $12,324 → "$12K". The note on each row carries the exact, dated figure.

Pre-existing since `exclAge` arrived (v5.55). Found at the v5.87 build by `t52`'s DOM read; deliberately not widened into then.

## 1 · Change

One site: the `excl65` branch of the summary template in `MyDataEditor`, L12932. It changes to render the age from the **same rule the
engine uses** (`exclAge ?? 65`; 0 → "any age"). How it reads depends on D25-A, and the dollar figure on D25-B. The `retExempt`
branch ("retirement income exempt") names no age and is true of the model (any age), so it is unchanged. Version bump at the four
in-app sites.

## 2 · Site census (AST, `census.cjs` / `strwalk.cjs`, v5.87)

- `excl65`: 74 AST hits; three are behavioural or display. `stateTaxAnnual` L1367 (engine, untouched),
  `buildVerificationChecks` L1727 (Georgia's figure, floor 65, label correct), and **`MyDataEditor` L12932 (this change)**.
  The rest are `STATE_RULES` object keys.
- `exclAge`: only `stateTaxAnnual` L1355 reads it. The display will read it too, by the same `?? 65` rule. A shared helper is
  the build's call; it is not a decision.
- `"65+"` strings, 24 hits. Every one other than L12932 is out of scope and correct as it stands:
  - state notes, which `t52` already holds to the model's age;
  - the federal OBBBA senior deduction, which is 65+;
  - Georgia's verification label, where Georgia's floor is 65;
  - three Field Manual sentences. "major 65+ exclusions (e.g. Georgia's…)" uses a 65-floor example. "Several 65+ exclusions are also
    reduced by Social Security" covers ME and MD, the only rows with `ssOffset`, both floor 65. "As of v5.54, six of the nineteen
    states…" is a dated historical statement and stays.
- **Suite:** no suite string or regex reads this summary text (`strwalk` over every `qa/*.mjs`, `qa-baseline/*.mjs` and
  `qa/tools/*`). The wording is unconstrained by existing assertions. §B1a's literal census reruns against the staged source at
  the build.

## 3 · Tests

**New suite `t53_mydata_summary_age.mjs`** (current leg, node + DOM). It is shown failing on v5.87 first.

- **S · all 18 rows through the DOM:**
  - the summary names the age the engine applies, checked against the same rule **and** against a measured onset. Income-limited
    rows (NM) are measured at an income below their limit.
  - the dollar figure: exact, or as D25-B decides.
- **X · extinction:**
  - no row's summary names an age the engine doesn't apply;
  - the summary and the note can't disagree. Where the note names a start age via `t52`'s canonical forms, the two must match;
  - empty-set guard: at least 18 rows are read.
- **Controls `controls_v588_summary_age.py`** (repo-only):
  - the template reverted to "65+";
  - a row's `exclAge` changed under an unchanged summary;
  - `toFixed` rounding restored, if D25-B (a);
  - the 0 → "any age" mapping broken;
  - the unmutated run.

Full suite after, run as two concurrent halves as at v5.87.

## 4 · Out of scope

- **D-24** (Iowa and Pennsylvania's `retExempt` with no age gate; Oklahoma's law age).
- The notes themselves (v5.87).
- New Mexico's income limit in the summary (its note states it).
- Field Manual prose (§2).
- Any engine change.

## 5 · Open decisions (for Steve)

- **D25-A · How the age reads.**
  - **(a) recommended:** "$12,500/person exclusion **from 60**", "…**at any age**". This is the same phrasing as the notes'
    "applied here from …", so the line reads consistently. It changes the text on all 18 rows, the 14 correct ones included.
  - (b) minimal: keep the pattern, with "60+", "67+" and "any-age". Only four rows' text changes.
- **D25-B · The dollar figure.**
  - **(a) recommended:** exact dollars, as the engine uses them ("$12,500", "$49,824"). The summary would never show a figure the
    model doesn't apply. Four rows currently round up, a small overstatement in a label meant to describe the model.
  - (b) keep the "$NK" rounding, since the note beside it carries the exact figure.

## 6 · Status

DRAFT. Destination: repo `docs/SCOPE_D25_MYDATA_SUMMARY_AGE.md` and the knowledge pool once D25-A/B are answered (the active
scope, OPERATIONS §G). Retire to repo-only when v5.88 ships.

## 7 · Build record (v5.88, 2026-10-01)

- **Decisions:** D25-A (a) and D25-B (a), Steve 2026-10-01 ("continue with your recommendations").
- **Source** `9843bd1747a24af2791e4ba0fa94ab7f`: the one template in `MyDataEditor` and the four version sites, each anchor asserted once. **Built** `115b688347e671716f6f562d57608e0b`; v5.87
  rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed. Display only — the engine's `_floor` line is untouched; the display uses `exclAge ?? 65`.
- **Census (§B1a):** the literal census against the staged source changed only the version-string arms (`t1`:241, `t4`:65); the METHODOLOGY
  annotation moved nothing in `t31`.
- **Tests:** `t53` 43 checks — v5.87 38 failed, v5.88 43/43. Two test defects found and fixed before the run: X-2 first scanned the
  whole line and tripped on New York's and Georgia's notes ("$20K/person"); S-age would have accepted "from 0" for Kentucky (now must read
  "at any age"; control C3 proves it). Controls 7 of 7. Registration: 33 ladders + 79 gated by `register_tag2`, `t33`'s pin, three Python lists.
- **Repo moved during the build:** `be8ec7c` (this scope's draft, uploaded) landed after the freshness check; it touches none of the release's
  files or any suite input, and the run used it.
- **Suite:** 4,909 app checks, 52 suites, 0 failed, 0 DIED; GRAND 5,039. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: two run folders built by mk_runfolder.sh v587 v588 from a fresh clone of be8ec7c with the github/ files overlaid; each ran the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). The first half A was cut off at a turn boundary after t38 and was re-run alone in a freshly built folder from the same inputs; half B's completed run stands. Half A GRAND 4817, half B GRAND 222, both exit 0, no suite in both, none DIED.
