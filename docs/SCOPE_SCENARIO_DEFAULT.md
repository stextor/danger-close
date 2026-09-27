# SCOPE — Bull-leaning becomes the default scenario, and each user's chosen preset is remembered

**Status: SCOPED 2026-09-27 — direction decided by Steve (Bull-leaning default; remember the choice); awaiting decisions
D-1 to D-4 (§6). No code written.** Target **v5.80**, built from **v5.79** (source `b06841a0c23f6451ca60c66755355567`, built
`index.html` `137a992f43e5a7d013d67e7ee959c31e`, repo `bf56c35`). This changes a **modeling default**: METHODOLOGY is updated.

---

## 1 · Premise — verified against v5.79

**The control.** "Scenario Probability Stress" on the Monte Carlo tab chooses how often each of six return regimes occurs
(`PROB_PRESETS`, L780): Base 45/20/15/10/7/3, Bear-leaning, Bull-leaning 35/40/10/8/5/2, Historical 15/78/3/2/1/1 (base /
optimistic / pessimistic / recession / stagflation / crisis). **Today's default is Base** — `useState("base")`, L5915 — and
**the choice is not saved**: every visit starts on Base.

**What each preset means**, computed exactly as the tab's own "expected equity return" panel does (L10872–10895):

| Preset | Expected equity return | Years below −10% | Years below −25% |
|---|---|---|---|
| **History, 1928–2025** (the app's `HISTORICAL_RETURNS`) | 11.9% arithmetic mean | **12%** | **5%** |
| Base (today) | 3.1% nominal / 0.4% real | 13% | 3% |
| **Bull-leaning (new default)** | 5.2% nominal / 2.6% real | **10%** | 2% |
| Historical | 9.1% nominal / 6.9% real | 3% | 1% |

Bull-leaning keeps history's frequency of bad years while lifting Base's very bleak average; it still sits ~5 pp below
history's average, so the project's "conservative direction" design default holds. (Historical reaches the average by making
bad years ~4× rarer than history — optimistic in exactly the dimension a drawdown stress-tester exists to test.)

**Effect on the example household, measured** (built v5.79 page in Chromium, `Math.random` seeded, 10,000 runs): the
displayed success rate is **99.6% under Base, 99.8% under Bull-leaning** (99.9% Historical). The headline barely moves because
the example is well funded; the visible change is in balances — `runMonteCarlo`'s median 25-year balance **$1.96M → $2.11M**,
10th percentile $1.37M → $1.52M. Households nearer the edge will move more.

## 2 · Site census (parser: `census.cjs scenarioPreset`, 32 references)

- **Engines take the preset as an argument** (`computeWithdrawalPlan` L5055, `withdrawalPlanSeries` L5555), and the Monte
  Carlo reads module-level weights the UI applies on change (L6078, `applyScenarioProbs`). **No engine changes.** Suites that
  call engines with an explicit preset are unaffected; the change is the UI's default and its persistence.
- **One site assumes Base IS the default:** L10904, `scenarioPreset !== "base"` shows "⚠ Non-base scenario active. Compare
  success rate vs BASE…". (D-3.)
- **Copy that describes the default** — to be re-read at the build and corrected where it names Base as the default or quotes
  Base's return: the header's scenario chip (L6560, reads the active preset — likely fine), the "Why this number may look
  low" note (L10764), the conservative-model banner (L6570; Bull-leaning is still below history, so "conservative" stays
  true), the Field Manual, and METHODOLOGY. Located by case-insensitive search and the AST literal census, not by memory.
- **Persistence precedent:** `STORAGE_KEYS` (L2661) already persists two other scenario settings the same way —
  `ssCut` and `acaRegime` — read once on mount, written on change, every call failing quietly if storage is unavailable
  (L6039–6058). The preset follows that pattern: a new key `scenario: "danger_close:scenario_v1"`.
- **The "delete everything" wipe list is hand-enumerated** (L3752+), and **`t5` loops `STORAGE_KEYS` and fails** if any key
  is missing from it — so the new key must be added to the wipe, and the existing guard enforces it.

## 3 · The change

1. The default becomes `"bull"` — one named constant (`DEFAULT_SCENARIO_PRESET`), used by the state initialiser, the
   restore path and the non-default notice, so there is one place that says what the default is.
2. **Restore on mount:** read `STORAGE_KEYS.scenario`; apply it only if it is one of `PROB_PRESETS`' keys — any other value
   (corrupt, or a preset removed in a future release) falls back to the default, silently.
3. **Save on change:** every preset click writes the key.
4. **Wipe:** "delete everything" deletes the key (`t5` enforces it).
5. Copy and METHODOLOGY updated (§2); the CHANGELOG states that every user's numbers change on their next visit.

## 4 · Tests — `t46_scenario_default.mjs`, both legs

- **v5.79 leg (dated pins):** the default is Base and nothing is written or read.
- **v5.80 leg:** a first visit (empty storage) starts on Bull-leaning, and the Monte Carlo runs with Bull-leaning's weights
  (asserted on `SCENARIOS[*].prob`, not on a label); choosing Base writes the key; a **new session** with the key present
  starts on Base; a stored invalid value falls back to Bull-leaning; the non-default notice follows the new default.
- **Existing suites:** any that render the default UI and pin Monte Carlo-driven figures will move by design — found by
  running the full suite on the change and by the AST literal census, and **gated per leg**, never re-pinned blind.
- **Negative controls:** the default reverted; the restore ignored; an invalid stored value accepted; the key dropped
  from the wipe list (`t5` must fire).

## 5 · Folded in

- **`qa/t45_phone_layout.py` is still 100644** in the repo (v5.79's chmod commit covered only the controls script).
  v5.80's `COMMIT_MESSAGE.txt` carries its `git update-index --chmod=+x` line.

## 6 · Open decisions for Steve

**D-1 · Returning users.** Nobody has a saved preset today, so on their first visit after v5.80 (a) **everyone without a
stored choice gets Bull-leaning** — simple, consistent, and the header chip shows the active scenario; or (b) users who
already have a saved plan stay on Base until they choose. **Recommend (a):** (b) needs a "had a plan before v5.80" signal
the app does not keep, and it would split the user base on an invisible criterion. The CHANGELOG and a Field Manual line say
the default changed and how to go back.

**D-2 · Backups.** Whether the chosen preset travels in the plan's backup file or stays a per-browser setting like the
theme. **Recommend: follow `acaRegime` and `ssCut` exactly** — verified at the build; if they are per-browser, so is this.

**D-3 · The non-default notice (L10904).** Its advice — compare against another preset to gauge model uncertainty — is still
good. **Recommend:** show it whenever the active preset is not the default, naming the default ("Compare against
BULL-LEANING, the default…").

**D-4 · Version and METHODOLOGY.** **v5.80**; METHODOLOGY's description of the default scenario weights is updated, because
this changes what every run assumes unless the user chooses otherwise. **Recommend** yes.

## 7 · Out of scope

The presets' weights themselves; the Historical preset's thin tails (worth its own note in the Field Manual, not a change
here); F-12, F-3/F-4, C-13.

## 8 · Build order (after decisions)

1. Freshness (OPERATIONS §A). 2. `t46` first, run against v5.79 — its v5.80 checks must fail. 3. The change (§3).
4. Full suite; census and per-leg gating of anything the default moves; `t5`'s wipe guard. 5. Controls. 6. Copy,
METHODOLOGY, CHANGELOG, TESTING, manifest; bump; build; `smoke_built`; `t45`; package per §L; `package_check`.
