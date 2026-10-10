# SCOPE — v6.02 · Ask AI's cut-off answers, and D-30 batch 1: the 27 progressive states' deductions, exemptions and personal credits

**FULFILLED — shipped as v6.02 (2026-10-09).** Repo-only. §7 is the build record. D-30 batch 2 (the flat-rate states) is v6.03; D-31 opened.

*(Superseded status line, retained:)* **READY — 2026-10-09.** Repo-only. Steve, 2026-10-09: "one thing I've noticed in "ASK AI", the response field seems not to be long (big) enough.
Some of the answers given out get's cutoff. Can you fix this along with D-30?" Under his standing instruction every decision below carries a
recommendation the build takes and records. **Stop only where §6's conditions fire.** A MODELLING release (D-30): METHODOLOGY changes.

## 0 · Premise (verified against v6.01, not assumed)

Freshness (OPERATIONS §A): repo `9b531a1` (source commit `1c2674e`… the v6.01 commits), full clone; source `b7eb4dcb32795a35c5026953a5a31b68`
= repo = pool (verified 2026-10-09 at the v6.01 check: source, manifest and dom entry by hash, the 129-name listing exact, every packaged
knowledge file equal to a committed file) = CHANGELOG newest; built `55cae3ab526d114eaaa89a6d890d8a8e` = live Pages. Pool 129.

### 0.1 · Ask AI (read by AST in `askAI`)

- **The cause is the request, not the box.** Both routes ask for `max_tokens: 1000` (the Anthropic call and the Local Model call). An answer
  longer than ~750 words is cut off by the API mid-sentence (`stop_reason: "max_tokens"`; OpenAI-style `finish_reason: "length"`). The app
  never reads either field, so a cut-off answer looks finished. The transcript's message boxes have no height limit and `pre-wrap` text: the
  whole returned text is shown.
- A **45-second timeout** aborts the request; a longer answer takes longer, so raising the cap alone would trade cut-offs for time-outs.
- The default master prompt tells the model "Responses are shown in a terminal UI with ~1000 token cap."
- The Field Manual's BYOK section says a typical question "costs **well under a cent**". The default master prompt alone is 14,811 characters
  (≈ 3,700 tokens) and the live plan context rides on every question; at the Sonnet 4.6 rates on Anthropic's pricing page ($3 per million
  input tokens, $15 per million output — read 2026-10-09) the input alone is over a cent. The claim was already low; a longer cap raises the
  ceiling further.

### 0.2 · D-30 — read at primary sources on 2026-10-09 (a research pass, then each figure re-read by me at its source)

Federal TY2026 (Rev. Proc. 2025-32 §4.14): standard deduction $16,100 single / $32,200 joint; additional for 65+ or blind $1,650 (married),
$2,050 (unmarried). Used by the four states that start from the federal deduction (MO, MT, ND, NM).

| State | Taken from v6.02 (per return unless "each") | Year | Source |
|---|---|---|---|
| AL | standard $3,000 / $8,500 under AL AGI $25,500, less $25 / $175 per full $500 above, floor $2,500 / $5,000; exemption $1,500 / $3,000 | 2026 (statute fixed) | §40-18-15(b)(4) (HB163, 2022); §40-18-19 |
| AR | standard $2,470 each; credit $29 each + $29 each 65+ | 2025 (2026 unpublished) | 2025 AR1000F instructions; §26-51-430, -501 |
| CA | standard $5,706 / $11,412; credit $153 each + $153 each 65+, less $6 per credit per $2,500 (or fraction) of federal AGI over $252,203 / $504,411 | 2025 (2026 unpublished) | 2025 Form 540 and booklet; R&TC §17054.1 |
| CT | exemption $15,000 / $24,000, less $1,000 per $1,000 (or fraction) of CT AGI over $30,000 / $48,000; personal credit = Table E decimal × tax | 2026 (statute fixed) | C.G.S. §12-702, §12-703 (every row read) |
| DC | standard $15,000 / $30,000 + $2,000 (unmarried) / $1,600 (married) each 65+ | 2025 (2026 law unsettled) | 2025 D-40 booklet; D.C. Act 26-214 |
| DE | standard $3,250 / $6,500 + $2,500 each 65+; credit $110 each + $110 each 60+ | 2026 (statute fixed) | 30 Del. C. §1108, §1110 |
| HI | standard $8,000 / $16,000 (no 65+ addition); exemption $1,144 each + $1,144 each 65+ | 2026 | HRS §235-2.4 (Act 46, 2024), §235-54 |
| KS | standard $3,605 / $8,240 + $850 (single) / $700 (married) each 65+; exemption $9,160 / $18,320 | 2026 (not indexed) | K.S.A. 79-32,119, -121 |
| MD | standard $3,350 / $6,700; exemption $3,200 each, $1,600 / $800 / $0 as federal AGI passes $100k / $125k / $150k single ($150k / $175k / $200k joint); + $1,000 each 65+; senior credit, reduced schedule (§4 MD-3) | 2025 (2026 indexed, joint unpublished) | Tax-Gen. §10-217, §10-211, §10-754 |
| ME | standard $15,700 / $31,400 + $2,050 / $1,650 each 65+, phased out over $75,000 / $150,000 of Maine AGI above $102,250 / $204,550; exemption $5,300 each, phased out over $125,000 above $341,000 / $409,150 | 2026 | 36 M.R.S. §5124-C, §5126-A; MRS 2026 worksheets |
| MN | standard $15,300 / $30,600 + $2,000 / $1,600 each 65+, less 3 % of federal AGI over $244,400 to $337,800 + 10 % above, at most 80 % (80 % above $1,107,750) | 2026 | Minn. Stat. §290.0123; MN DOR 2026 amounts |
| MO | the federal standard deduction (above) | 2026 (statutory link) | RSMo 143.131(2) |
| MS | standard $2,300 / $4,600; exemption $6,000 / $12,000 + $1,500 each 65+ | 2026 (statute fixed) | Miss. Code §27-7-17, §27-7-21 |
| MT | the federal standard deduction (Montana starts from federal taxable income) | 2026 | MCA §15-30-2101(22); Rev. Proc. 2025-32 |
| ND | the federal standard deduction (starts from federal taxable income) | 2026 | N.D.C.C. §57-38-30.3; Rev. Proc. 2025-32 |
| NE | standard $8,850 / $17,700 + $2,050 / $1,700 each 65+; credit $176 each | 2026 | 2026 Form 1040N-ES |
| NJ | exemption $1,000 each + $1,000 each 65+ | 2026 | NJ Division of Taxation |
| NM | the federal standard deduction; low- and middle-income exemption $2,500 each, less 15 % (single) / 10 % (joint) of federal AGI over $20,000 / $30,000 | 2026 | PIT-1 instructions (line 12); NMSA §7-2-5.8 |
| NY | standard $8,000 / $16,050 | 2026 | IT-2105-I (2026) |
| OK | standard $6,350 / $12,700; exemption $1,000 each; + $1,000 each 65+ when federal AGI ≤ $15,000 / $25,000 | 2026 (fixed) | Form 511 packet |
| OR | standard $2,835 / $5,670 + $1,200 (single) / $1,000 (married) each 65+; exemption credit $256 each, none above federal AGI $100,000 / $200,000 | 2025 (the published return year) | OR-40 2025 instructions; ORS 316.085, 316.695 |
| RI | standard $11,200 / $22,400; exemption $5,250 each; both less 20 % per $7,450 (or fraction) of modified AGI over $261,000 | 2026 | ADV 2025-22 |
| SC | the SC Income Adjusted Deduction $15,000 / $30,000, less its fraction of federal AGI over $40,000 / $80,000 out of $55,000 / $110,000, the reduction rounded down to $10 | 2026 | Act 110 of 2026, §12-6-1140(15) |
| VA | standard $8,750 / $17,500; exemption $930 each + $800 each 65+ | 2026 | Va. Code §58.1-322.03 |
| VT | standard $7,650 / $15,300 + $1,250 each 65+; exemption $5,300 each | 2025 (2026 unpublished) | IN-111 instructions 2025 |
| WI | sliding standard $13,960 / $25,840, less 12 % / 19.778 % of Wisconsin income over $20,120 / $29,040; exemption $700 each + $250 each 65+ | 2026 | 2026 Form 1-ES instructions |
| WV | exemption $2,000 each | 2026 (statute fixed) | W. Va. Code §11-21-16 |

Findings that bear on the design: AL, MO and OR also deduct **federal income tax paid** (OR up to $8,500, phased out by federal AGI; MO a
percentage capped at $5,000 / $10,000; AL in full) — the calculator is never passed federal tax. MT and ND start from federal taxable income,
so the **federal senior deduction** ($6,000 each 65+, 2025–2028, phased out above $75,000 / $150,000 of MAGI) flows into both — the
calculator has no year. Several states also give **low-income refundable credits or rebates** (HI food/excise, ME sales-tax fairness, OK sales
tax relief, NM rebate, WV family credit, NY household credit). Maryland's senior credit has a reduced schedule that applies in a year whose
September revenue estimate falls 3.75 % below March's; whether TY2026 qualifies is not published. Arkansas's "65 Special" credit is only for a
retiree who does not take the retirement exemption the model applies.

**Measured** in §7 (the build's probe; Engines A and B over the 27 states).

## 1 · Decisions — Ask AI (taken on recommendation)

- **AI-1 — the cap is 4,096 tokens on both routes** (one constant, `AI_MAX_TOKENS`). Roughly 3,000 words: no normal answer reaches it.
  *Alternative:* 8,192 — rejected: doubles the worst-case cost for no answer anyone reads in a console.
- **AI-2 — a cut-off is said, never silent.** When the API reports `stop_reason: "max_tokens"` (or the Local Model `finish_reason: "length"`),
  the answer is shown with a closing notice: the answer reached the length limit; type "continue" for the rest (the conversation memory
  carries it).
- **AI-3 — the timeout is 120 seconds** (`AI_TIMEOUT_MS`), and the timeout message and the Field Manual's error row say so.
- **AI-4 — the default master prompt's behavior note** says answers may run to about 4,000 tokens but most should be far shorter. A master
  prompt a user loaded from a backup keeps its own text (disclosed in the Field Manual entry).
- **AI-5 — the cost sentence is corrected** to what the request actually carries, with the rates and the date read.
- **AI-6 — the model id is unchanged** (`claude-sonnet-4-6`). Anthropic now lists newer Sonnet models at lower prices; changing the model
  changes every answer and is Steve's call (§5).

## 2 · Decisions — D-30 batch 1 (taken on recommendation)

- **DD-1 — the batch is the 27 progressive states**, read with v6.00 and v6.01. The fifteen flat-rate states are batch 2 (v6.03): Georgia is
  among them, and it is the example household's state and the MC parity fingerprint's, so batch 2 re-baselines the parity guardrail and the
  example-household pins on its own.
- **DD-2 — one field, `deduct`: a list of components**, each `{ kind: "ded" | "credit" | "pct", per: "return" | "person" | "age", age?,
  amt, phase? }`. `per` counts the units: one per return, one per filer (two on a joint return), or one per filer at or above `age` (65 unless
  stated; Delaware's credit uses 60). `amt` is a number or `{ single, joint }`. `phase` reduces it on a named measure — `base` (the state AGI
  the calculator already builds) or `agi` (its federal-AGI measure) — by one of six shapes: `steps`, `linear`, `rate`, `tiers`, `table`,
  `cliff`, each the statute's own arithmetic. One evaluator (`stateDeductions`) serves every row.
- **DD-3 — the order is the forms':** state AGI (after the retirement exclusions, as today) − deductions and exemptions = taxable income,
  floored at zero; the schedule (and Arkansas's high-income table) on taxable income; New York's recapture fraction and Connecticut's added
  amounts on AGI, as their statutes measure them; Connecticut's personal-credit decimal, then the dollar credits, against the state tax
  (nonrefundable, floored at zero); Maryland's county tax on taxable income and its capital-gains tax after.
- **DD-4 — federal-tax deductions (AL, MO, OR) are not taken** — they need federal tax passed into the calculator from three engines, which is
  its own change: logged as **D-31**. Conservative, disclosed in each note.
- **DD-5 — the federal senior deduction is not taken (MT, ND)** — it needs the model year and a MAGI test; part of D-31. Conservative, disclosed.
- **DD-6 — low-income refundable credits and rebates are not taken** (HI, ME, OK, NM, WV, NY's household credit): each disappears well below a
  retiree's typical income. Conservative, disclosed.
- **DD-7 — Maryland's senior credit at its reduced schedule** ($1,000 single below federal AGI $50,000, $500 to $100,000; joint both 65+ $1,750
  below $100,000, $875 to $150,000; one 65+ $1,000 / $500): the full schedule applies only in years the revenue trigger does not fire, and
  TY2026's status is unpublished. Conservative, disclosed.
- **DD-8 — latest published figures, held** for every model year (v6.00 BR-4): 2025 where 2026 is unpublished (AR, CA, DC, MD, OR, VT), so
  every held figure is at or below its later indexed value (conservative). DC's 2026 law is unsettled; its 2025 decoupled amounts are used.
- **DD-9 — Arkansas's "65 Special" credit is not taken** (the model applies the retirement exemption that disqualifies it).
- **DD-10 — Maine's ratio is rounded to four places** (the worksheet's line 5); New York's recapture keeps its own.
- **DD-11 — itemizing is not modelled**: the standard deduction stands in (the model carries no itemizable expenses).
- **DD-12 — dated figures:** `years.deduct` on all 27 rows; `STATE_FIGURE_LABELS` gains `deduct: "deductions"`.
- **DD-13 — the display:** My Data's model line adds "· deductions and exemptions taken" for a row with `deduct`; the Field Manual's
  "no state's standard deduction or personal exemption is taken" becomes the true sentence for each group, held to the code by `t66`.
- **DD-14 — derived pins (v6.00 BR-16, unchanged):** hand figures elsewhere that price one of the 27 keep their BASE and on the v6.02 leg
  expect it with the state's deductions and credits, computed in the suite independently; labels say so.
- **DD-15 — the version is v6.02, tag `v602`** (free: vercensus 0 sites, the three `.py` lists, no `dom_entry_v602.jsx` in history).

## 3 · Site census (AST)

**Source** (`stage_v602.py`, anchors counted once on v6.01): the 27 rows (`deduct`, `years.deduct`) and their notes; `STATE_FIGURE_LABELS`; a
new helper `stateDeductions`; the calculator (deduction before the schedule; New York's recapture split into its AGI measure and taxable
income; Arkansas's table and Maryland's county tax on taxable income; credits); a test seam `_onDetail` (an argument no engine passes,
called with the calculator's intermediate values); My Data's model line; the Field Manual's sentences (state tax; Ask AI cost and timeout);
the master prompt's behavior note; `askAI` (two `max_tokens`, the timeout, the cut-off notice, the timeout message); four version sites.

**Suite:** derived pins found by running the full suite on the staged build and gated per DD-14.

## 4 · Tests

New suite **`t66_deductions_askai.mjs`**, both legs (the v6.01 leg pins the absence of `deduct` and the 1,000-token request):
- **A** — the 27 rows' components equal §0.2 (every amount, measure, threshold), dated; EXTINCTION: exactly the 27 carry `deduct`, every
  component is well formed (a known kind, unit and phase shape; nonnegative amounts), and each note names what is taken and what is not
  (federal-tax deduction AL/MO/OR, senior deduction MT/ND, the low-income credits).
- **B** — the phase shapes at their edges, through `stateDeductions` and the calculator: AL at $25,999 / $26,000 / the floor; CT at $30,000 /
  $30,001 and its credit table rows; CA one dollar over its threshold; ME and MN inside their phase-outs; MD's exemption table and senior
  credit bands; OK's and OR's cliffs; RI's steps; SC's $10 rounding; WI's slide; NM's per-exemption rate.
- **C** — hand cases to the cent through `stateTaxAnnual`, computed independently in Decimal (session working, figures in §7): every state at
  least once; joint and single; 65+ additions; the survivor on a single return.
- **D** — v6.01 → v6.02 (v602 leg, needs `app_v601.mjs`): every jurisdiction × a household grid: with `deduct` removed from every row the
  calculator is byte-identical to v6.01's; with it, the 27 equal an independent implementation (deductions, schedules, added rules, credits)
  on the calculator's own AGI (`_onDetail`), and the other 24 rows are byte-identical.
- **E** — Ask AI: the request carries `max_tokens` 4,096 (the claude.ai route, through the DOM with a recording stub); a reply with
  `stop_reason: "max_tokens"` shows the cut-off notice and an `end_turn` reply does not; the Local Model branch reads `finish_reason`; the
  timeout is 120 s and its message says so; the master prompt's note; the Field Manual's cost and timeout lines held to the constants.
- **F** — the display and the Field Manual's state-tax sentences, each held to its code fact.
- Controls `qa/tools/controls_v602_deduct.py` (repo-only), §4.1.

### 4.1 · Controls (each mutation must turn the named check red)

K1 a deduction amount moved (VA single) · K2 a phase threshold moved (ME) · K3 `ceil` → `floor` in the steps shape (CT's "or fraction") ·
K4 the deduction applied after the schedule (taxable income = AGI) · K5 credits refundable (no floor) · K6 the cut-off notice removed · K7
`max_tokens` back to 1,000 · K8 the timeout back to 45 s · K9 a state outside the 27 moves (Georgia) — t2 parity must fire · K10 the
Field Manual's deduction sentence reverted · K0 unmutated.

## 5 · Out of scope

The fifteen flat-rate states' deductions (D-30 batch 2, v6.03); federal-tax deductions and the federal senior deduction (D-31); low-income
refundable credits; itemized deductions; dependents; the Ask AI model choice (AI-6 — an option for Steve: Anthropic's pricing page lists Sonnet
5.5 at $2 / $10 per million tokens against Sonnet 4.6's $3 / $15); streaming answers.

## 6 · Stop conditions

Stop and report if: a primary source contradicts §0.2; anything outside the 27 rows moves (`t66` D, MC parity); with `deduct` removed the
calculator differs from v6.01; a suite asserts an old figure on purpose in a way DD-14 cannot gate honestly.

## 7 · Build record (v6.02, 2026-10-09)

- **Source** `d76dddc6381041c987fc5c87b8edad53` (83 anchored edits, each counted once on v6.01: the 27 rows' `deduct` and `years.deduct`, the 27 notes, `STATE_FIGURE_LABELS`, the
  evaluator, the calculator's seven sites (the seam, the measures, taxable income, Arkansas's table, Connecticut's comment, New York's split, the credits,
  Maryland's county tax and the seam's call), My Data's line, the AI context line, two Field Manual state-tax sentences, the Ask AI constants and its four sites
  (two `max_tokens`, the timer, the cut-off), the notice in the transcript, the timeout message, the master prompt's note, the Ask AI entry, the cost
  paragraph, the error table, the glossary's Token entry, four version sites). **Built** `16a4a850e5a10582b91eb98ea9b32ce5` (v6.01 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — with `deduct` removed the calculator is v6.01's byte for byte, and with it the other 24 rows are (`t66` D-1, D-2); MC parity
  10/10 with no declaration; no source contradicted §0.2; every derived pin was gated honestly (each keeps its base; none was re-derived from the app).
- **Measured** (scratch probe, v6.01 against the staged v6.02; not shipped): Engine B's lifetime state tax on the example household falls in all 27 and is
  byte-identical in the other 24 and "none" (the figures are in the CHANGELOG); Engine A's strategy tax falls in every changed run (example 160 / H1 158 / H2
  160 runs), and the estate-best strategy changes in three cells — H2 (B dies 2030) MD irmaa1 → fill22, ND and RI fill22 → irmaa1. Reported, not a stop
  condition (§6): a conversion's state cost now depends on how much of the deduction it uses.
- **Ask AI measured:** the example plan's request is 16,603 characters (about 4,150 tokens) — inside the cost sentence's "roughly 1,000 to 5,000" (`t66` E-7).
- **`t66`** 194 (v6.02) / 54 (v6.01). **Controls 12 of 12.**
- **Hand cases** (session working `hand602.py`, Decimal, not shipped): 37, every state at least once — e.g. AL single 50, $40,000: $1,760.00; CA joint 66/66,
  $520,000 (credits 7 steps in): $39,731.96; CT single 50, $40,000: $1,192.50; ME joint 66/66, $250,000 (ratio 0.3030): $14,347.73; MN joint 66/66,
  $300,000: $18,289.95; NY single 50, $120,000 (fraction 0.2470): $6,180.11; OK single 66 at $15,000 / $15,001: $90.00 / $129.55; RI single 50, $280,000
  (three steps): $13,245.38; SC joint 66/66 at federal AGI $115,000: $3,959.53; VT joint 66/66, $150,000: $5,272.85 (above the 3 % minimum tax, $4,500).
- **Build decisions recorded** (within DD-2): a component may carry `add` (the 65+ amount inside the same deduction, so a phase measures the whole — Maine,
  Minnesota) and `byAge` (Maryland's senior credit, whose joint amount is not twice the single); a table row may carry `"lt"` (Maryland's "at least $50,000").
  The seam `_onDetail` also reports the filing status and ages applied, which the derived pins read. Notes say "for each filer 65 or older", never "at 65":
  `t52`'s extinction reads "at NN" as an exclusion's age.
- **Corrections found by the run, owned here:**
  - `t66` E-17 found the glossary's Token entry still saying a question costs "well under a cent"; it was corrected with the BYOK paragraph and the source restaged.
  - `t52` X-1 read the first notes' "more each at 65 or older" as an exclusion age claim (DE 60, NJ 62, WI 67 apply theirs at other ages); the notes were
    reworded and `t66` A-10 now holds each deduction age a note names to its component.
  - Scope AI-4 promised a Field Manual disclosure for master prompts restored from older backups; the first staging omitted it. Added before the package
    (`t66` E-15b).
  - The first `t66` E-16 read the error table with its cell boundaries collapsed and failed on correct text; it now reads the cells apart.
  - `t65`'s group D failed on the v6.01 leg of a v6.01 → v6.02 folder (it needs `app_v600.mjs`); it now reports itself not run, as `t64` D does.
- **Sources** (§0.2) re-read in the session after a research pass: Rev. Proc. 2025-32 §4.14; Code of Ala. §40-18-15, -19 (HB163 of 2022); A.C.A. §26-51-430,
  -501 and the 2025 AR1000F instructions; the 2025 Form 540 booklet and R&TC §17054.1; C.G.S. §12-702, §12-703 (every Table E row); the 2025 D-40 booklet;
  30 Del. C. §1108, §1110; HRS §235-2.4, §235-54; K.S.A. 79-32,119, -121; Tax-Gen. §10-211, §10-217, §10-754; MRS's 2026 worksheets and 36 M.R.S. §5124-C,
  §5126-A; Minn. Stat. §290.0123 and the DOR's 2026 amounts; RSMo 143.131; Miss. Code §27-7-17, -21; the 2026 Form 1040N-ES; N.J.S.A. 54A:3-1; NMSA
  §7-2-5.8 and PIT-1 line 12; IT-2105-I (2026); the Form 511 packet; the OR-40 2025 instructions and ORS 316.085, .695; RI ADV 2025-22; Act 110 of 2026
  (S.C.); Va. Code §58.1-322.03; VT IN-111 (2025); the 2026 Form 1-ES instructions; W. Va. Code §11-21-16. Ask AI: Anthropic's pricing page and the
  Messages API's `stop_reason` (read 2026-10-09).
- **Suite:** 5,872 app checks, 65 suites, 0 failed, 0 DIED; GRAND 6,002. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v601 v602 from a full clone of 9b531a1 with the github/ files overlaid (v6.01 resolved from history, commit 1c2674e), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5780, half B GRAND 222; none DIED.
