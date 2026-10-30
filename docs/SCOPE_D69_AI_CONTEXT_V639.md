# SCOPE — D-69 · Ask AI is not told what accounts the plan holds, or what it contributes

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — FULFILLED AT v6.39 (2026-10-30).** DA-1 to DA-6 taken as recommended (Steve, 2026-10-30: *"Live context"*, *"All, by type"*, *"Reword"*, *"v6.39; tax → v6.40"*; DA-5 follows from DA-3); the build review's six fixes taken (Steve: *"Fix 1–6, file the RMD one"*). §8 is the build record |
| Build scoped against | **v6.38** · source `src/DangerClose.jsx` md5 `b82ede24ad13456587358fc2e272c323` · built `index.html` `a405b665d7b33d70a5f6afe31fdea805` · repo `f291975` |
| Freshness | Pool `DangerClose-v6_38.jsx` = manifest = clone; the seven pool documents replaced at the v6.38 upload are byte-identical to the package, and the other nine to the pool as verified after v6.37 (2026-10-30, this session). `package_check` 54/0 post-upload; §F clone diff clean (104 of 104); Pages serves `a405b665…`. |
| Kind | An **Ask AI** release: what the request tells the model about the plan, and the copy that says what is sent. No engine, table, stored field or computed figure changes. |
| Register | Files and closes **MissingFeatures D-69** (new). Not previously registered (§2). |
| Version | Proposed **v6.39**; the 2027 tax figures become **v6.40** (DA-6). |
| Found | Reported by the maintainer from his own plan, 2026-10-30. He asked Ask AI whether to keep contributing to his HSA. The answer opened: *"Your plan as entered doesn't mention an HSA at all — no HSA balance, no HDHP … enrollment, and no HSA contributions."* His plan holds an HSA. |

---

## 0 · Premise — executed on v6.38, not read

The model was right about what it was sent: the request never named the HSA. Everything below comes from scratch probes run this session in the
DOM harness (`t89`'s mount and storage, `v638` bundle). Each probe saved a plan through My Data's real **Save & Apply** and read the
**EXACTLY WHAT'S SENT** panel on the Ask AI tab, which shows the system text verbatim. The probes asserted nothing and were deleted after the run.

**0.1 · The reported case, reproduced.** A couple with $900,000 of Traditional holdings, a $100,000 joint brokerage account, a **$40,000 HSA** under
Other accounts and **$650 a month** in *HSA contributions $/month*:

| What the request carries | |
|---|---|
| the word "HSA" (or "health savings") | **0 times** |
| the HSA balance | folded into **"$140,000 other"** (the plan description) and **"other accts add $140K"** (the live context) |
| the HSA contribution | **absent**. The only contribution sent is *"401(k) contribs $1500/mo"* |
| Traditional or Roth balances, by person | **absent**. *"$900,000 in retirement accounts"* and a cash/bonds/equity/hedge mix |

**0.2 · The example loses its HSA after one save.** The example as it opens sends its sample briefing (17,520 characters), which names the HSA
three times and carries the Roth/Traditional split. After **one unedited Save & Apply**, the plan description is My Data's own summary
(3,444 characters): HSA 0 times, Traditional 0, Roth balances 0, *"$147,000 other"*. So since v6.22 every plan a user enters sends Ask AI less
about its accounts than the example's sample text does.

**0.3 · Why: the two texts the request is built from — census by parser** (`s639/ai_census.cjs`, acorn, on the shipped source).

- **`genAIContext`** (L14173–L14203), the plan description My Data writes at Save & Apply. It reads `household`, `total401k` and `otherTotal`
  (three totals), the bucket mix, `wtdER`, the people, state, Social Security, pension, streams, home, home move and `workMagi`. It never reads
  `others` (the Other-accounts rows), `rows` (the holdings), or any contribution field.
- **`aiSystemPrompt`** (L7810–L7843), the live context rebuilt from `PORTFOLIO` on every question. Its `PORTFOLIO` reads are exactly
  `asOf`, `bucketActuals`, `contributions.monthly401k`, `household` and `total401k`. It never reads `otherAccounts`, `positions`, or any other
  contribution field.

**0.4 · What My Data saves and Ask AI never sees** (`s639/bp_keys.cjs`: every key `buildPortfolio`, L13975, returns, checked against §0.3):

| Saved field | Sent? | Read by the model's engines? |
|---|---|---|
| `otherAccounts[]` — type (taxable / Traditional / Roth / **HSA** / annuity), owner, balance | **total only** | yes (Engines A–D, Monte Carlo; HSA held out of tax: `othHsa`, L2930) |
| `positions[]` — Traditional / Roth split, owner, plan type | **total and bucket mix only** | yes (per-person RMDs, conversions, plan-type state rules) |
| `contributions.hsaMonthly` | **no** | yes — the Monte Carlo's accumulation (`primaryContrib`, L3030) |
| `contributions.contribPreTaxA` / `contribRothA` | as one figure, labelled *"401(k) contribs"* | yes (the split seeds Traditional vs Roth) |
| `contributions.contribPreTaxB` / `contribRothB` / `spouseBMonthly` | **no** | yes |
| `contributions.annualBonus` / `bonusDeferralPct` / `bonusMatchPct` | **no** | yes (accrual) |
| `salaryA` / `salaryB` | **no** | the D-65 flag only (`workMagiFlag`: the IRMAA tab and My Data). *Corrected at the build: this cell first said "payroll tax" too; payroll tax is figured on job rows, not on these fields. Sent anyway — DA-3 (a) as decided listed them* |
| `incomeSources.pension.owner` | **no** | yes (survivor years) |
| `acaBridge.premium` / `acaBridge.size` | **no** | yes (the ACA strategy) |
| `taxableGainPct` | **no** | yes (realized gains) |

Not a gap, and listed as exclusions in §4: the paycheck inputs (`employeePer`, `matchPer`, `supplementalPer`, `contribFreq`), whose result
`contribPreTaxA` is what the engines read; `contributions.allocations` and position tickers, names, `er`, `bucket` and `type`, which reach the
text as the mix and the weighted expense ratio; `tableByAge`, which is derived from the planned benefit and age; `pension.note`; and the internal
flags `_stateFromForm`, `_incomeFromForm`, `carRowsV621` and `workRowsV623`.

**0.5 · The ground rules turned the gap into a false statement.** `AI_GROUND_RULES` (L590) says: *"Use the figures given … if something you need
is missing, say so."* The model did that. It said the plan has no HSA, when what was missing was the plan's HSA from the text. The rule
cannot tell "the user did not enter it" from "the app did not send it".

**0.6 · The copy that says what is sent.** Four lists describe the request, and each would need the new facts:
- the landing screen (L5233);
- My Data's note (L14422), which ends *"Nothing else from your plan is transmitted"*;
- the Field Manual §10 table's *Your structured plan summary* row, which today says *"the split between retirement and other accounts"*;
- METHODOLOGY §11, which says *"… balances/mix, SS/pension … nothing else"*.

`t92` §E and `t89` E-5 hold these lists to the request today.

---

## 1 · Site census (parser)

**Source** (`b82ede24…`):

| Site | Line | Change |
|---|---|---|
| `AI_GROUND_RULES` | L590 | DA-4: the *"missing, say so"* sentence |
| `aiSystemPrompt` (live context) | L7810–L7843 | DA-1/DA-3: the accounts and contributions block; *"401(k) contribs"* replaced |
| new module-level helper `aiPlanFacts(P)` | — | builds the block from `PORTFOLIO` alone, so the suite can call it on fixtures through `__g` |
| `genAIContext` | L14173–L14203 | DA-1 (c) only |
| landing list | L5233 | DA-5 |
| My Data note | L14422 | DA-5 |
| Field Manual §10 row and §13 note (`DOCS_HTML`, L5241 — edited with quote-free anchors) | — | DA-5; v6.39 note |
| version sites | 4 | v6.39 |

**Suite literals that touch the changed copy** (`s639/suite_lits.cjs`, acorn over every `qa/` and `qa/tools/` suite; generated bundles excluded):
- `t89_ai_ground_rules.mjs` L193, L196 — A-6 requires *"Use the figures given"*. The DA-4 wording keeps that phrase.
- `t92_model_claims.mjs` L499 — E-3 requires the live context to contain *"401(k) contribs"*. It needs a v6.39 arm.
- `t89` E-5 (METHODOLOGY §11's sentence, pinned verbatim) and E-6 (the Field Manual's *"roughly 900 to 2,300 tokens"*, against measured request sizes). Both need re-measuring at the build. At v6.38 an entered plan measured about 1,080 to 1,412 tokens, so the new block (about 300–600 characters, roughly 120–230 tokens) should stay inside the range. That is a prediction for the build to check.

**What does not move.** No engine reads `aiSystemPrompt`, `genAIContext` or `AI_GROUND_RULES`. MC parity should stay 10/10, and `t102`, `t101` and
the engine suites unchanged. A §F check holds Engines B, C and D and the Monte Carlo's schedule bit-identical to v6.38's module.

---

## 2 · Register sweep (§K2) — by mechanism

Searched for anything that describes Ask AI's context as complete, or the request's contents:
- the pool's registers (`MissingFeatures.md`, `ARCHITECTUREIssues.md`, `UsabilityFlaws.md`, `FlawsToFix-v5_73-Phase2.md`);
- the repo's scopes that read `genAIContext`: D-52, D-53, D-55, D-62/D-65/D-44, and `FlawsToFix-v5_69-Phase1.md`.

**No entry registers this.** D-55 (v6.26) fixed the ground rules and three false statements in the live context; it did not ask what the
context leaves out. D-53 (v6.22) gave every entered plan its own description; that is the change that ended the sample briefing's account list
for entered plans (§0.2). Neither was wrong. Nothing tested coverage.

**Nearest neighbours, not folded in** (§6): the expense table reaches Ask AI as two monthly figures; the plan events (among them *"HSA
contribution cutoff"*) and the app's own computed answers (the Roth tab's best cell) are not sent.

---

## 3 · The fix (recommended shapes)

**The block (DA-1 (a), DA-2 (a), DA-3 (a)).** One helper, `aiPlanFacts(P)`, called once by `aiSystemPrompt` and reading only the saved plan. It
adds two lines to the live context after *"Portfolio $X as of …"*, and replaces *"401(k) contribs $N/mo"*. Illustration, on the §0.1 plan:

> *Accounts: retirement holdings $900,000 — Ann: Traditional $600,000 (IRA); Bo: Traditional $300,000 (employer plan). Other accounts
> $140,000 — Taxable $100,000 (joint); HSA $40,000 (Ann). Taxable brokerage: 0% of it is unrealized gain (as entered).*
> *Contributions until each retires, per month: Ann pre-tax $1,500, Roth $0; Bo pre-tax $0, Roth $0; HSA $650. Bonus none. Salaries: Ann
> $X, Bo $Y. Pension owner: Ann. ACA bridge: premium $0, household 0 (not used).*

Totals are by **tax type and owner**: no account names, tickers or fund names (DA-2). A type the plan does not hold is left out. A blank section
says so (*"Other accounts: none"*) rather than vanishing, because a missing line is what read as "no HSA". A single plan names one person.

**The ground rules (DA-4 (a)).** *"… if something you need is missing, say so"* becomes something like *"if something you need is not in what you
were sent, say that it was not sent and ask — do not conclude the plan lacks it."* *"Use the figures given"* stays.

**The lists (DA-5).** All four name the new facts: account totals by type and owner, contributions, salaries, and the pension owner. My Data's
*"Nothing else from your plan is transmitted"* stays true by construction (§4 B).

**Stored plans.** Nothing to migrate. The block is built from the saved plan on every question, so every plan, saved before v6.39 or not, sends it
from the first question after the upload (DA-1 (a)).

---

## 4 · Tests

New suite **`t103_ai_context.mjs`**, both legs. The v6.38 leg pins each defect as `[KNOWN DEFECT 2026-10-30, D-69 — flips at v6.39]`.

- **§A the source (AST).** `aiPlanFacts` is module-level, reads its parameter only (no form state, no `PORTFOLIO` global inside it), and is called
  exactly once, from `aiSystemPrompt`. *"401(k) contribs"* is gone. The ground-rules sentence is as decided (DA-4).
- **§B EXTINCTION — completeness.**
  - The suite enumerates by AST every key `buildPortfolio` returns, nested ones included.
  - Each key must be either reached in the sent text, or on a **named exclusion list in the suite, with a reason** (§0.4's list).
  - "Reached" is proved on a fixture whose every value is distinct (e.g. HSA $40,123, Roth B $7,341), so a value can only appear if its own field put it there.
  - A key added to `buildPortfolio` later, with neither, fails. This is the test that would have caught D-69.
- **§C rendered** (EXACTLY WHAT'S SENT, after Save & Apply), on these plans:
  - the reported plan: HSA named with $40,000 and $650/mo;
  - each Other-account type;
  - Traditional and Roth by person, with plan type;
  - a single plan (one person, no spouse B line);
  - the example as loaded and after one save (its HSA and Roth present after the save);
  - a blank plan (*"Other accounts: none"*);
  - a plan with Roth-only holdings.
- **§D the request.** Through the recording `fetch` on the key route and the Local Model route: `body.system` / `messages[0]` carries the block once.
- **§E the copy.**
  - The four lists name the new facts.
  - `t92` E-2/E-3 extended rather than duplicated.
  - The Field Manual's cost range against re-measured sizes (`t89` E-6).
  - §13's v6.39 note.
  - METHODOLOGY §11 (current leg).
- **§F nothing computed moves.** On the example and three fixtures:
  - Engines B, C and D, the Monte Carlo's schedule and both seeded Monte Carlo engines are bit-identical to v6.38's module;
  - MC parity 10/10.

**Census row:** `boundaries.mjs` gains `ai_account_types`. *(Corrected at the build: this line first said the row is ON when the plan holds a
non-taxable type, with the example ON. In this census ON means degenerate — the condition under which a test cannot see the defect — so the
row is ON when the plan holds NO type beyond taxable money and Traditional holdings; the example, with an HSA, Traditional and an annuity
under Other accounts and Roth holdings, is clear, `t29` B-34, and C-d69-1 shows a plan made all-taxable reads ON.)*

**Controls:** `qa/tools/controls_v639_ai_context.py`.
- Drop the HSA type from the block; drop `hsaMonthly`; drop one person's Roth.
- Add a key to `buildPortfolio` that is neither sent nor excluded (§B must fire).
- Revert the ground-rules sentence; remove one list's new clause.
- Restore *"401(k) contribs"*; read the global `PORTFOLIO` inside the helper (§A).

**Registered:** `v639` through the AST registration. By hand: `t33` PINS, `t93`'s Engine D reference (v638), and `t45`/`t47`/`t48`. Plus `t92` E-3 and
`t89` E-5/E-6 re-gated as above.

---

## 5 · What the model is not told, after this release

Recorded so the next reader does not take *"complete"* to mean everything:
- the expense table's rows (only the before and after monthly figures);
- the plan events (the HSA cutoff among them);
- the app's computed comparisons;
- anything the app does not collect — HDHP coverage, for one, which HSA eligibility turns on.

DA-4's wording is what keeps the model from reading any of these absences as a fact about the plan.

---

## 6 · Out of scope

- The expense table's rows, and the plan events, in the request (each a privacy and size question of its own; filed as notes under D-69).
- Sending account or fund **names** (DA-2 (b)).
- Any change to My Data's fields or to an engine.
- The *"HSA contribution cutoff"* event's own wording.
- The `UsabilityFlaws.md` F-30 entry's stale *"My Data 21"* is a one-line correction that ships in the same package: a known error in a shipped document, found at the v6.38 verification.

---

## 7 · Decisions for Steve

| ID | Question | Options | Recommendation |
|---|---|---|---|
| **DA-1** | Where the missing facts go | (a) the live context, rebuilt from the saved plan on every question · (b) My Data's plan description (reaches a plan only after its next Save & Apply) · (c) both | **(a)** — one source, every plan at once, and the text already says it supersedes the description above it |
| **DA-2** | How much detail | (a) totals by tax type and owner, no account or fund names · (b) each account by its name | **(a)** — answers every type question (an HSA, a rollover IRA, a Roth), and sends nothing you typed as a label |
| **DA-3** | Which fields | (a) every saved field the engines read that is not sent today (§0.4), with §4 B's completeness test · (b) the HSA balance and contribution only | **(a)** — the Traditional/Roth split and the contributions matter to most tax questions as much as the HSA does, and (b) leaves the class open |
| **DA-4** | The ground rules' *"if something you need is missing, say so"* | (a) reword: say it was not sent, and ask, rather than conclude the plan lacks it · (b) leave it | **(a)** — it is what turned the gap into "your plan has no HSA", and the app still sends less than My Data holds (§5) |
| **DA-5** | The four lists of what is sent | (a) name the new facts in all four, held by `t92` §E and `t89` E-5 · (b) no other option: sending more without saying so breaks *"Nothing else from your plan is transmitted"* | **(a)** |
| **DA-6** | Version | (a) v6.39; the 2027 tax figures become v6.40 (the TY2027 scope renumbered a sixth time; suite stays `t99`; the 15 December deadline unchanged) · (b) other | **(a)** — none of the three 2027 publications is out yet |

---

## 8 · Build record (2026-10-30)

**8.1 · Built as decided.**
- **Source.** `edit_src639.py` makes the twelve edits of §1 (the helper, the live context, the ground rule, the three in-source lists, the §13 note and
  the four version sites); `edit_src639b.py` makes the build review's ten (§8.3). Both are scratch, kept with the session; their result is the
  shipped source.
- **The live context.** On the reported plan it now reads *"Accounts: Retirement holdings $900,000 — Ann: Traditional $600,000 (IRA), Roth $0; Bo:
  Traditional $300,000 (IRA), Roth $0. Other accounts $140,000 — Taxable $100,000 (joint); HSA $40,000 (Ann)."* and *"Contributions per month until
  each retires: Ann pre-tax $1,500, Roth $0; Bo pre-tax $0, Roth $0; HSA $650 (until Ann retires)."*
- **The example.** Measured in the harness, it sends its HSA, its Roth balances and its annuity both as loaded and after a Save & Apply; through
  v6.38 the save lost them (§0.2).
- **Request size** (`t89`'s measure, characters ÷ 3.5 × 1.35): an entered plan rose from about 1,080–1,412 tokens to about 1,265–1,590, the
  example from about 6,924 to 7,109. Both are inside the Field Manual's stated *"roughly 900 to 2,300"* and *"about 7,000"*, so the cost sentence
  is unchanged.

**8.2 · Departures from the scope's text, recorded.**
- **The block's wording differs from §3's illustration.**
  - The plan type prints in full only when an employer plan is present (*"(IRA)"* alone otherwise).
  - The optional lines (salaries, bonus, pension owner, ACA bridge, gain share) print only when set.
  - The two sections themselves always print, *"none"* when empty, as §3 required. Absence of an optional line is what the reworded rule covers.
- **The census row's meaning** is corrected in §4.
- **§F.** It holds Engines B and C, Engine D's series, the Monte Carlo's tax schedule and the opening balances bit-identical to v6.38's module. It does not run the two seeded Monte Carlo engines §4 named. Their identity rests on the source diff (no engine line changed) and on MC parity 10/10 in the full run.
- **§0.4's salary cell** said the salaries are read for payroll tax. They are read only by the D-65 flag. Corrected in place; they are sent as DA-3 (a) listed them.

**8.3 · Found by the independent build review, and fixed** (Steve: *"Fix 1–6, file the RMD one"*). An agent given the code and the scope reviewed the first build. Every finding below was checked against the source before any was acted on.
1. **An ACA household size left at 0 was sent as *"household of 0"*.** 0 means automatic in My Data, and the ACA engine takes 1 for a single plan, 2 for a couple. It now prints the model's figure and says it was set automatically (`t103` C-5f).
2. **A holding with no Traditional/Roth split was called *"no tax type recorded"*.** The engines take that money as taxable (`taxableInitFromPositions`), so it is now described so, and the gain share prints when it is the plan's only taxable money (C-5c). Only a legacy or hand-edited backup can reach it.
3. **The HSA contribution was labelled the household's.** The Monte Carlo adds it to spouse A's contributions, so it stops at A's retirement. It now reads *"(until {A} retires)"*.
4. **The live context still called the retirement total a *"401k subtotal"*, and its mix *"401k-relative"*.** Both now name the retirement holdings (A-4).
5. **The lists did not name the ACA household size, the bonus or the IRA/employer split.** A fifth list, the Field Manual §09 table *"What the AI sees about your plan"*, was missing from the census. All five now name them (E-1 to E-3b, `t92` E-2).
6. **`t103` §B treated each account array as one key.** A field added to a row would have passed unseen. It now enumerates each array's row fields by AST (B-1, B-2), and control K5 shows it fires.
- **Filed, not fixed** (Steve): a single plan's money stored under spouse B gets no RMD — **MissingFeatures D-70**. The helper reports such money as the one person's; its comment, which said it followed the engines' convention there, is corrected.
- **Not taken:**
  - two names that collide (a person named *"joint"*, or both spouses with one name), which is cosmetic;
  - negative balances, which only hand-edited backups can carry.

**8.4 · Tests as built.**
- `t103`: v6.39 39, v6.38 19 at the build's development run. The counts in the CHANGELOG are the packaged run's.
- `t29`: B-34, C-d69-1, and A-3 + 1.
- `t92`: E-2 and E-3 re-gated at the same count.
- Controls: `qa/tools/controls_v639_ai_context.py`, C0 and K1–K16. Results are in the CHANGELOG.

