# SCOPE — D-51: the Monte Carlo pays IRMAA surcharges · AI-6: Ask AI uses Claude Opus 4.8 at medium effort (target v6.31)

| Field | Value |
|---|---|
| Build scoped against | **v6.30** · `src/DangerClose.jsx` md5 `f2d3f578492279eac501eef6bdda058f` · built `index.html` `3d013b092b612442b35e2ec02163010d` · repo `2d41b26` (full clone) |
| Freshness (§A) | Pool source = manifest Current = clone = workspace = `f2d3f578…`, checked 2026-10-24 after the v6.30 upload; the 16 pool files byte-identical to the package and the clone |
| Register items | MissingFeatures **D-51** (filed at v6.20). `ARCHITECTUREIssues.md` **E-30 (c)** (AI-6, Steve's decision, open since v6.02). UsabilityFlaws **F-26**'s token-count item (L605–606: the cost note's counts *"look estimated at about four characters a token … may read about 14% low"*). Files **D-65** (§0.4) |
| Version | **v6.31**, tag `v631` — free: `vercensus.cjs v631` counts 0 literals in `qa/`, `qa/qa-baseline/`, `qa/tools/`; no `.py` suite names it; no `dom_entry_v631.jsx` in history |
| Status | **FULFILLED 2026-10-24 — built as v6.31 (§7).** Was: DECIDED 2026-10-24 — building as v6.31. Steve: *"all as recommended"* — DS-1 to DS-5 (a), AI-1 (a), AI-3 (a), AI-4 (a); AI-6 itself Claude Opus 4.8 at medium effort (his revision of Opus 5.5 after the first draft). Reviewed once (§6), on the Opus 5.5 draft |
| Measurements | Session-only probes against the v6.30 module (`app_v630.mjs` from the packaged run folder), never shipped. 30-year Monte Carlo: 3,000 paths, one seeded generator per pair, so each pair differs only by the schedule |

Steve, 2026-10-24: *"D-51 and AI-6. The decision for AI-6 — make it Opus 5.5."* Then, on this scope's first draft: *"Let's use Opus 4.8 in medium effort for AI-6."* On the revised draft: *"all as recommended"*.

---

## 0 · Premise — verified against v6.30

### 0.1 D-51: what the Monte Carlo pays, and what it leaves out

**Confirmed in source.** Both Monte Carlo engines take their income tax from one schedule, `mcIncomeTaxSchedule` (L116–122). It calls the
bridge and Engine B exactly as the Taxes tab does and keeps each row's `totalTaxToday` — federal, capital gains, NIIT, AMT, payroll tax on
job income and state, in today's dollars. `mcQuarterSeries` (L148–166) charges a quarter of each retirement year's figure; past the
schedule's last year, the last row's (`mcTaxForYear`, L133–136). **No IRMAA surcharge enters it.** The surcharges live in Engine C
(`computeIrmaaPlan`, L5766–5974), which the IRMAA tab renders; its one call site is that tab (L11628).

Engine C's rows already carry what the Monte Carlo would need, in the units it uses since v6.30: for each MAGI year `yr`, the premium year
`irmaaYr = yr + 2`, the tier, the persons on Medicare in the premium year (the decedent through the premium year of the death), and
`surchargeToday` — the surcharge in today's dollars (L5965). Engine C runs on the same inputs as the schedule (slider, QCD, yield, the
bridge's draws and gains). `t93` D-7 checks its MAGI against Engine B's on one household, to $1, in the years both have.

**Disclosed today**, each to be rewritten (full list §2.1): the Field Manual's Monte Carlo entry (*"Not in it: IRMAA (a Medicare premium, on
its own tab), …"*), METHODOLOGY's v6.20 section (*"IRMAA is not in it (DC-2 (a))"*), and What Breaks' two *"Not modeled: … IRMAA
surcharges … (the Monte Carlo models market sequence, not IRMAA)"* — the Field Manual's What Breaks entry and the tab itself (L12530).

### 0.2 D-51: a sibling in What Breaks

What Breaks charges a yearly average tax, `estAnnualTax = totTaxToday / planYears` from Engine A's current-strategy run (L12441). Engine
A's `tax` is federal + capital gains + NIIT + AMT + state + payroll (L5526); its IRMAA is kept apart (`totIrmaa`, L5547–5548), and Engine A
also returns `totIrmaaToday` (L5723). So What Breaks leaves out IRMAA too, and says so. Fixing it is one term. It is not D-51's mechanism, so
it is a decision (DS-3). Engine A and Engine C are separate IRMAA projections; on the example at a $250,000 slider both give $24,180 in
today's dollars (review N10), and nothing checks that they stay equal (§3 §D adds a check).

### 0.3 D-51: measured (prototype — Engine C's `surchargeToday` added to the schedule in its premium year)

| Household (preset, slider) | IRMAA, today's $ (years) | MC 30 yr > $500K | > $800K | median end |
|---|---|---|---|---|
| example (BULL, $70K) | $0 | 95.67% → 95.67% | 91.27 → 91.27 | $1,963K → $1,963K |
| example (BULL, $250K) | $24,180 (6) | 93.50 → 93.50 | 85.87 → 84.77 | $1,675K → $1,619K |
| example made single (BULL, $70K) | $12,080 (9) | 97.40 → 97.40 | 90.87 → 90.87 | $1,523K → $1,496K |
| example ×1.6, Georgia (BULL, $70K) | $0 | 100.00 → 100.00 | 100.00 → 100.00 | $4,666K → $4,666K |
| example, holdings ×3, New York (BULL, $70K) | $10,350 (9) | 100.00 → 100.00 | 100.00 → 100.00 | $10,642K → $10,629K |
| example, holdings ×3, New York (BULL, $250K) | $47,300 (7) | 100.00 → 100.00 | 100.00 → 100.00 | $10,314K → $10,186K |
| example (BASE, $70K) | $0 | 80.50 → 80.50 | 67.50 → 67.50 | $1,188K → $1,188K |
| example (BASE, $250K) | $24,180 (6) | 75.13 → **74.03** | 62.07 → 61.00 | $1,038K → $983K |
| example made single (BASE, $70K) | $12,080 (9) | 91.53 → 91.53 | 77.13 → 76.50 | $1,206K → $1,188K |

**What it moves.** Nothing on the example as it opens ($0 IRMAA at the $70,000 slider), so the headline, the example's pins and, very
likely, MC parity (its fingerprint households run at the defaults) do not move — to be confirmed by running `t2`, not assumed. Where a plan
reaches a tier, the 30-year success rates fall by up to about one point and the median by up to about **5%** (BASE, $250K: −5.3%) in the
households measured. The direction is always down: D-51 was optimistic, as filed.

**Not measured:** the 6-year headline. `runMonteCarlo` draws through `Math.random`, which d3-random captures at load (OPERATIONS §C), so a
reseed between two runs in one process does not reproduce the paths; two runs of identical schedules differed by up to 0.3 point in the
probe. Its effect is unmeasured, and the release notes will say so.

The "holdings ×3" rows scale the example's positions and Other accounts by 3. They are **not** the suites' New York ×3 household (`t93` §N,
IRMAA $43,880 today); they only show a plan that crosses tiers. The build measures on `t93`'s household instead (review N6).

### 0.4 D-51: found while scoping — the first two premium years carry no surcharge anywhere (filed as **D-65**)

Engine C's loop starts at the retirement year (L5840, `for (let yr = _retireYr; …)`), and Engine A's IRMAA reads its lookback from
retirement too (`magiHist[yr − 2]`, L5529–5544). So the premium years of retirement and the year after — whose MAGI is the last two working
years — carry **no surcharge on the IRMAA tab, in the Roth comparator's "lifetime tax + IRMAA", or (from this release) in the Monte Carlo or
What Breaks**. For a household on Medicare at retirement with wages above a tier, that is optimistic. In life it is softened by the SSA-44
work-stoppage appeal, which METHODOLOGY and the Field Manual describe — but the app charges every other surcharge in full and never prices an
appeal, so the omission is not the same thing as that disclosure. **Not D-51's mechanism**: modelling it needs the working years' MAGI in
Engines A and C. Filed as D-65; how to treat it is DS-5.

### 0.5 AI-6: what changes when the model is Claude Opus 4.8 at medium effort

*Re-decided 2026-10-24 (Steve, after the first draft, which scoped Claude Opus 5.5): "Let's use Opus 4.8 in medium effort for AI-6." The
first draft's Opus 5.5 analysis is summarised in §6; what of it still applies is kept below.*

Ask AI has three routes and **one** set of limits:

| | claude.ai artifact | self-hosted, user's key | Local Model (self-hosted) |
|---|---|---|---|
| request | `api.anthropic.com/v1/messages`, the platform authenticates | the same request with `x-api-key` | the user's own OpenAI-compatible server |
| model | `"claude-sonnet-4-6"` (L7532, one literal for both) | ← same | `localLLM.model \|\| "llama3.1"` |
| limit | `max_tokens: AI_MAX_TOKENS` (4,096, L523) | ← same | **the same constant** (L7516) |
| timeout | `AI_TIMEOUT_MS` (120 s, L524, one `setTimeout` at L7490) | ← same | ← same |
| cut-off | `stop_reason === "max_tokens"` (L7561) | ← same | `finish_reason === "length"` (L7561) |
| notice | `AI_CUTOFF_NOTICE` (L545, *"reached the length limit (4,096 tokens)"*), shown for any cut answer (L13222) | ← same | ← same |

The Anthropic request sends no `thinking`, no effort, no sampling parameters and no prefill. It reads every block that has a `text` field
(L7558 — by field, not by `type`). A reply is marked cut only when it has text: `cut: _cut && !!text` (L7562), and a reply with no text reads
*"No response received. Try rephrasing the question."* Error replies are marked `err`, and the conversation memory re-sends the last 12
non-`err` messages (L7494).

Read on 2026-10-24 from Anthropic's documentation (sources in §8):

| Fact | Consequence for Ask AI |
|---|---|
| Model ID `claude-opus-4-8`, no date suffix; **Active**, retirement *"not sooner than May 28, 2027"* (Opus 5.5: not sooner than September 22, 2027; Sonnet 4.6: February 17, 2027) | the one string to change; a later release will have to move it again, no earlier than mid-2027 |
| **$5 / $25** per million input / output tokens (Opus 5.5 $4 / $20; Sonnet 4.6 $3 / $15) | every cost sentence changes; per token this is the dearest of the three |
| **Thinking is off unless asked for**: *"On Claude Opus 4.8, thinking is off unless you ask for it"* (the Opus 5.5 migration guide) | Ask AI sends no `thinking` field, so it does not think: `max_tokens` holds the answer alone, as today. The first draft's two blockers that came from always-on thinking (answers cut off by their own thinking; a reply stopped at the limit with no text) **do not arise**, and the Local Model need not be split from the Anthropic routes |
| `effort` (`output_config.effort`) is supported on `claude-opus-4-8`; its default is **`high`** | **medium must be sent explicitly** — omitting it runs at `high`. Effort *"affects all tokens in the response"* — with thinking off, it shapes how long and thorough the answer is. Anthropic's note for Opus 4.8 starts intelligence-sensitive work at `high` and steps down to `medium` *"only when you've measured that the lower level holds quality"*: medium is the cheaper, terser choice, and no quality comparison is run here |
| `temperature`, `top_p`, `top_k` are rejected from Claude Opus 4.7 on; a prefilled assistant turn from Opus 4.6 on | Ask AI sends none |
| The newer tokenizer (Claude 4.7 and later) yields **about 30% more tokens** for the same text (the migration guide: *"roughly 1x to 1.35x"*) | every token count the Field Manual gives is low for this model (§0.6) |
| `stop_reason: "refusal"` can be returned (real-time safeguards from Opus 4.7 on, with a `stop_details.category`) | today a refusal without text reads "No response received" — AI-4 |
| Read text from blocks whose `type` is `"text"` | L7558 works today by reading `c.text`; the build makes it read by `type` (review N1) |

**Not verifiable from here:** whether the claude.ai artifact environment serves `claude-opus-4-8`, or accepts `output_config`. Anthropic's
article on artifacts that use Claude names no model (AI-1). **Not measured:** real token counts, latency, throughput and cost of an Opus 4.8
answer — that needs an API key, which this session does not have. Every cost figure below is computed from published prices and the app's own
request sizes, and the copy will say so.

Already inconsistent today, found by the census: the Field Manual's API-key introduction says a question costs *"a fraction of a cent"*,
while its cost note says *"about one to five cents"*. Both are rewritten.

### 0.6 AI-6: what a question costs on Opus 4.8 (computed, not measured)

**The token basis.** The cost note's sizes — 600–1,500 tokens for an entered plan, about 4,500 for the example — were derived at
**characters ÷ 4** (`t89` L289, `t66` L389/391), not at the 3½ characters the note itself states (the gap F-26 recorded). Restated for Opus
4.8: characters ÷ 3.5 for the older tokenizer (× 1.14), then × 1.35 for the newer one at the migration guide's upper figure — × 1.54 in all.

| | entered plan | the example |
|---|---|---|
| request size (ground rules + plan + live context), first question | ≈ 925–2,315 tokens | ≈ 6,940 tokens |
| input cost at $5 per million | ≈ 0.5–1.2 ¢ | ≈ 3.5 ¢ |

Output at $25 per million (no thinking, so this is the answer itself): 1,000 tokens 2.5 ¢; 2,500 tokens 6.3 ¢; the whole 4,096-token limit
10.2 ¢.

So **a first question costs about 3 to 10 cents** if the answer runs 1,000–2,500 tokens — an assumption, stated as one, which medium effort
makes likelier than the default — and one whose answer uses the whole limit about 11–14 cents. **Every later question costs more**, because
the last 12 messages ride along as input: twelve long messages can add 30,000–50,000 input tokens, 15–25 ¢. The copy will say what a first
question costs, that a conversation grows, and that the figures are estimates from published prices.

---

## 1 · What changes

### D-51

1. `mcIncomeTaxSchedule` also runs Engine C on the same inputs and adds each row's `surchargeToday` to the schedule **in its premium year**
   (DS-1). The schedule keeps its two parts beside the total (`taxByYr`, `irmaaByYr`), so the display and the tests can read each.
2. Edges (DS-2): a premium year before retirement is never charged (Engine C starts at retirement; the engines charge nothing before it); a
   premium year after the schedule's last year is left to the tail rule, which repeats the last year's total — tax plus that year's surcharge.
3. What Breaks (DS-3): its estimated tax adds Engine A's `totIrmaaToday`.
4. D-65 (DS-5).
5. Copy: every site in §2.1 that says what the Monte Carlo or What Breaks pays.

### AI-6

6. The Anthropic request: `model: "claude-opus-4-8"`; `output_config: { effort: "medium" }` (decided); **no `thinking` field** (so the model
   does not think, and the limit holds the answer alone); text read from blocks whose `type` is `"text"`.
7. The limit stays 4,096 tokens on every route; the timeout is one constant for every route (AI-3).
8. A refusal says so (AI-4), kept out of the conversation memory; a refusal that carries text shows the text and the notice.
9. Copy: every Ask AI site in §2.1 — prices, the tokenizer, the costs as computed, the timeout if it changes, the API-key introduction's
   *"fraction of a cent"*, the glossary's Token entry. The cut-off notice and the Field Manual's *"about 3,000 words (4,096 tokens)"* stay
   true of the answer (no thinking shares the limit); the comments at L512–513 and L520–522 are corrected for the newer tokenizer.
10. Version v6.31 at the four sites; §13 records both changes.

The example's sample briefing stays byte-identical (v6.26 DC-3; `t89` pins its md5). Its *"An answer may run to about 4,000 tokens"* is an
instruction to be concise and stays true of a 4,096-token limit that holds the answer alone.

---

## 2 · Site census

### 2.1 Source (parser: `funcmap.cjs`, an acorn walk over every string literal, template element and JSX text, `census.cjs`)

**D-51 — code**

| Site | What | Change |
|---|---|---|
| `mcIncomeTaxSchedule` L116–122 | the schedule | + Engine C, premium-year surcharges, the two parts |
| `mcTaxScheduleOf` L124–129, `mcTaxForYear` L133–136 | the map form, the tail | carry the parts; tail = last year's total |
| `computeIrmaaPlan` L5766–5974 | Engine C | **unchanged** (read only) |
| the four call sites of `mcIncomeTaxSchedule` — L174 (`mcResolveTaxSchedule`, the engines' default), L7168 (the 6-year runs), L7190 (the 30-year runs and the stress set), L7222 (the mortgage what-if) | unchanged arguments | none; each call now also runs Engine C — the time for a slider or preset change is re-measured at the build (review N9) |
| What Breaks L12425–12441 | `estAnnualTax` | DS-3 |

**D-51 — copy** (each also listed under the suites that pin it, §2.2)

| Site | Text today |
|---|---|
| Income tab card L8771–8775 (`data-dc-mc-tax-card`) | *"Income tax the Monte Carlo pays"*, the schedule's first year — DS-4 |
| Monte Carlo tab L11817 (`data-dc-mc-tax`) | *"Every run pays, in each year of retirement, the income tax the Taxes tab computes …"* |
| Backtest L12278 | *"… they also charge long-term care and the Taxes tab's income tax, which this backtest omits"* |
| L8026 | *"the Monte Carlo's draw also pays the Taxes tab's income tax"* |
| What Breaks L12530 | *"estimated taxes (~$XK/yr average from the Roth tab's strategy engine, incl. Roth-conversion taxes) … Not modeled: recurring LTC, IRMAA surcharges, … (the Monte Carlo models market sequence, not IRMAA)"* |
| What Breaks footer L12542 | *"(the Monte Carlo also pays the Taxes tab's tax year by year)"* |
| Field Manual (L4967): the Monte Carlo entry | the parts of the tax (*"federal, capital gains, NIIT, AMT, payroll tax on job income and state"*) and *"Not in it: IRMAA …"* |
| Field Manual: the What Breaks entry | *"Not modeled: … IRMAA surcharges … though not IRMAA"* |
| Field Manual: the Social Security cut-toggle answer | *"… as does the income tax each Monte Carlo path is charged"* |
| Field Manual: §13 | new v6.31 entry |
| METHODOLOGY: the v6.20 section | *"IRMAA is not in it (DC-2 (a))"*; a new v6.31 section |

**AI-6 — code and copy**

| Site | What |
|---|---|
| L7532 | `model: "claude-sonnet-4-6"` — the one model literal |
| L523–524, L7490, L7516, L7533 | `AI_MAX_TOKENS`, `AI_TIMEOUT_MS`, the timer, both routes' `max_tokens` — AI-3 |
| L7558, L7561–7562 | reading the reply; `cut`; *"No response received"* — AI-4, review N1 |
| L545, L13222 | `AI_CUTOFF_NOTICE` *"(4,096 tokens)"*, shown for any cut answer |
| comments L512–513 (*"Roughly 5,000 tokens"* for 20,000 characters), L520–522 (*"4,096 tokens is roughly 3,000 words"*) | corrected with the code they describe |
| Field Manual: the API-key introduction | *"typically a fraction of a cent per question"* |
| Field Manual: the cost note | *"a token is roughly 3½ characters …"*, the request sizes, *"up to 4,096 tokens"*, *"At the Claude Sonnet 4.6 prices … ($3 … $15 …)"*, *"about one to five cents"*, *"adds about six cents"*, *"$5 of credit covers roughly one hundred to several hundred questions"* |
| Field Manual: the Ask AI length sentence | *"An answer can run to about 3,000 words (4,096 tokens) … may still mention a 1,000-token cap; the request asks for 4,096 either way"* |
| Field Manual: troubleshooting rows | *"REQUEST TIMED OUT (120s)"*; *"The answer reached the 4,096-token limit and was cut off"* |
| Field Manual: glossary, Token | *"roughly 3½ characters … about one to five cents at the October 2026 rates"* |

### 2.2 Suites that read what changes (AST: `census.cjs` per file; the copy by an acorn walk over every literal in `qa/`)

- **The schedule:** `t83` (16 references — §A asserts the schedule equals the Taxes tab's rows **exactly**; on a household with IRMAA it
  becomes the Taxes row plus Engine C's premium-year surcharge, exactly), `t93` §E and §M (the schedule to the cent; the quarterly charges
  against Engine B), `t20` (3), `t56`, `t82`, `t84`, `t86`, `t87` (1 each) — all on households with $0 IRMAA at their sliders, to be confirmed
  by running. `t2` calls the engines with their defaults; its fingerprint households sit at the $70,000 default.
- **The schedule's copy:** `t83` §I — I-1 the card label (L558), I-5 the Monte Carlo tab's sentence, I-6 the Backtest sentence, I-7 *"the
  Monte Carlo models market sequence, not IRMAA"* (L588), I-8 *"Not in it: IRMAA …"* (L596), I-10 (L604).
- **What Breaks:** `t93` H-7 (L459, a source regex on `estAnnualTax = _cT.totTaxToday / planYears`, which DS-3 (a) breaks), `t93` §W and
  `t81` E-8 (its rendered estimate), `t92` (its copy).
- **Ask AI:** `t66` E-1 (*"4,096 tokens, 120 seconds"*), E-3, E-4, E-7, E-9 and E-10 (the Local Model asks for 4,096 — kept by AI-3's split),
  E-11 (the timeout message), E-12, E-14, E-15, E-15b, E-16 (the Field Manual's limit, timeout and troubleshooting rows), E-17, E-18 (*"the
  model id the request names is the one the sentence prices (claude-sonnet-4-6 — AI-6: unchanged)"*); `t89` (the request's parts; E-6 and
  E-7, request sizes at characters ÷ 4); `t92` (*"a token is about 3½ characters"*).
- Each is re-gated per leg (§B2): the v6.30 leg keeps its assertion; the v6.31 leg asserts the new fact, re-derived, never pasted.

---

## 3 · Tests (new suite `t94_mc_irmaa_ai.mjs`, both legs; the v6.30 leg pins each defect as `[KNOWN DEFECT 2026-10-24, D-51]` / `[…, AI-6]`)

- **§A the schedule's parts, exactly.** On five households — the example at $70K and $250K, the example made single, `t93`'s New York ×3
  household at $70K (it has a surcharge in its horizon year, $4,620 in 2053, and $9,240 dated after it — review S9), and one with none — the
  schedule's `taxByYr` equals Engine B's `totalTaxToday` row for row and its `irmaaByYr` equals Engine C's `surchargeToday` moved two years
  forward, to the cent; the total is their sum; a premium year before retirement is absent; a premium year after the horizon is absent; the
  tail is the last year's total (tax + that year's surcharge, read on the New York household, where it is not zero).
- **§B the paths pay it.** On a household with surcharges, both planned paths move by the compounded surcharge series and nothing else (the
  `t83` §B method), with a hand pin of one premium quarter computed from the 2026 surcharge, the persons, the plan's inflation and the
  quarter's inflator, in exact arithmetic.
- **§C the extinction invariant.** With the surcharge table forced to zero through a test seam, the v6.31 schedule equals v6.30's to the cent
  on every household; with it restored, every household with a surcharge **in a premium year inside the schedule's years** has a schedule
  that differs, and only in those years (review S9).
- **§D What Breaks** (if DS-3 (a)): its rendered estimate equals (Engine A's `totTaxToday` + `totIrmaaToday`) ÷ the plan's years; and Engine
  A's lifetime IRMAA in today's dollars is compared with Engine C's on each §A household — equal, or the difference printed and disclosed.
- **§E by AST:** `mcIncomeTaxSchedule` calls Engine C once; no IRMAA figure is typed; the Anthropic request names `claude-opus-4-8`, sets
  `output_config.effort` to `"medium"`, and sends no `thinking`, `temperature`, `top_p`, `top_k` or prefill; one Anthropic model literal in
  the source; every `max_tokens` reads `AI_MAX_TOKENS` (as `t66` E-12 already asserts).
- **§F the request** through a recording `fetch`, on the self-hosted route, the claude.ai route (child process, the `t89` way) and the Local
  Model: each body's model, effort and limit, and the timeout. Mocked replies: a `thinking` block with **non-empty** `thinking` text before
  the text block shows only the text (so a `c.text || c.thinking` mutation fails — review N1); `stop_reason: "max_tokens"` with text shows the
  cut-off notice; `"refusal"` with no text shows the refusal notice, with text shows both; the notice is not re-sent in the next request's
  history.
- **§G copy:** the extinction of every replaced sentence in §2.1 across every string; the prices typed in the suite from the pricing page,
  not read from the app; METHODOLOGY's section.
- **Controls** `qa/tools/controls_v631_mc_irmaa_ai.py`: the surcharge dropped from the schedule; charged in the MAGI year; not inflated (the
  today's-dollar restatement dropped); charged before retirement; the tail without its surcharge (fires on the New York household); What
  Breaks without the term; the old model string; effort removed (it would then run at `high`); a `thinking` field sent; a refusal read as no
  response; the notice re-sent in history; and the unmutated run.
- **Census row (OPERATIONS §K1):** `irmaa_in_mc` — ON when the household's schedule carries a surcharge. The example at its default is OFF,
  which is why D-51 was invisible on it; the row's fixture is the example at a $250,000 slider.

---

## 4 · Out of scope

- **D-65** (§0.4) — filed; DS-5 decides whether it is disclosed or approximated.
- **The surcharge does not follow the path.** Like the tax since v6.20, one schedule from the plan's own projection is paid on every path:
  a path that cuts spending at a guardrail still pays the plan's surcharge. Stated, not changed.
- **Engine C's own simplifications** (its hard-coded 1.045 balance growth, unrounded projected tiers C-13, Part B premium growth beyond
  inflation not modelled) carry into the Monte Carlo as they are — stated in METHODOLOGY.
- **Streaming, prompt caching, fast mode, per-message effort** for Ask AI. (Streaming would remove the timeout risk in AI-3; it changes how
  the reply is read and shown, which is its own scope.)
- **The example's sample briefing** stays byte-identical (§1).
- **The Local Model route's model and limits** (kept, AI-3).

---

## 5 · Decisions for Steve

**DS-1 · When a surcharge is charged.** (a) **Recommended:** in its premium year, two years after the MAGI that sets it — when Medicare bills
it. (b) In the MAGI year (two years early; it would read as tax on that year's income, which it is not).

**DS-2 · The edges.** (a) **Recommended:** nothing before retirement (the engines charge no tax before it, and Engine C starts at retirement);
past the schedule's last year, the tail repeats the last year's tax and that year's surcharge, and premiums dated after the horizon are not
charged separately (they belong to a survivor who outlives the plan, whom the tail already covers). (b) Add the after-horizon premiums to the
tail's first years.

**DS-3 · What Breaks.** (a) **Recommended:** add Engine A's IRMAA (`totIrmaaToday`) to its estimated tax, name it in the estimated-taxes line,
and drop *"IRMAA surcharges"* from its *Not modeled* list. One term; the same reasoning as D-51; moves What Breaks only for plans with a
surcharge. (b) Leave it, and keep the disclosure.

**DS-4 · The Income tab's card.** Its figure is the schedule's first year, and the first surcharge can come no earlier than two years after
retirement — so a card that showed only the first year would never show IRMAA (review S1). (a) **Recommended:** keep the card's figure as the
first year's income tax, and add a line under it when the plan has any surcharge: *"plus IRMAA from {year}: ${amount} in its first year
(today's dollars), {N} years in all"*. (b) Show the plan's lifetime IRMAA in today's dollars on the line instead. (c) Leave the card to income
tax, and say on the Monte Carlo tab only that IRMAA is added.

**DS-5 · D-65, the first two premium years.** (a) **Recommended:** file it and say so — in the IRMAA tab's note, the Monte Carlo entry and
METHODOLOGY: *"the first two years' premiums, set by income in your last two working years, are not charged; if those years' income is
above a tier, the model reads low there"*. Charging them would need the working years' MAGI, and most such surcharges are reduced on appeal
for work stoppage (SSA-44), which the model never prices either way. (b) File it only. (c) The conservative approximation: charge each of
those two years at the tier of the first retirement year's MAGI. It errs high for most retirees (whose working-year income was higher than
their first retirement year's, so the real tier is at least that) but charges a premium many would have removed on appeal. *I recommend (a)
over (c) because the appeal is the common outcome for exactly the households (c) would charge; (c) is the house rule's direction if you
prefer it.*

**AI-6 · DECIDED (Steve, 2026-10-24): Claude Opus 4.8 at medium effort.** The first draft scoped Opus 5.5 with effort as AI-2; both are now
settled. With Opus 4.8 and no `thinking` field the model does not think, so the first draft's AI-3 (a longer limit to make room for thinking,
split from the Local Model) and the limit half of AI-4 fall away. What remains:

**AI-1 · Which route uses Opus 4.8.** (a) **Recommended:** both Anthropic routes — the request is shared, and one model keeps one cost note.
If claude.ai does not serve `claude-opus-4-8` (or `output_config`) to artifacts, a question asked there shows the existing `ERROR [4xx]`
message until a one-line follow-up; please ask one question in claude.ai after the upload so we know. Most visitors use the GitHub Pages
copy, where the route is documented. (b) Opus 4.8 for the self-hosted route only; claude.ai stays on Sonnet 4.6 until checked. (c) Both, and
if claude.ai answers with an error naming the model, retry once on Sonnet 4.6.

**AI-3 · The timeout.** The limit stays 4,096 tokens (it holds the answer alone). The reply arrives all at once, so a timeout throws the whole
answer away (and the tokens already generated may still be billed). Finishing 4,096 tokens in 120 s needs about 34 tokens a second; Opus 4.8's
speed is not measured here. (a) **Recommended:** raise the one timeout to 180 s (about 23
tokens a second for a full-length answer), for every route — a local model simply waits longer before giving up. (b) Keep 120 s.

**AI-4 · A refusal.** (a) **Recommended:** when Anthropic declines a question (`stop_reason: "refusal"`), say so — *"The model declined to
answer this question. Rephrasing it as a question about your plan's figures may help."* — instead of *"No response received"*, keep the
notice out of the conversation memory, and show any text the refusal carries with it. (b) Leave it.

## 6 · Review

An agent that had not seen this scope read it against the source, the suites and Anthropic's pages before Steve saw it: **2 blockers, 11
should-fix, 10 notes.** Every line number, the IRMAA totals in §0.3, every Anthropic fact in §0.5 and the arithmetic of the first draft's §0.6
reproduced. Taken, in this revision:

- **B1** — the Local Model shares the Anthropic route's limit, timeout and cut-off notice; the first draft called it untouched. AI-3 now
  splits the limits by route; `t66` E-9/E-10's 4,096 stays true for it.
- **B2** — with thinking on, a reply can stop at the limit with no text and read "No response received", silently. AI-4 now covers it, with
  a test and a control.
- **S1** — DS-4 (a) as first written could never show IRMAA (the card reads the first year; the first surcharge is two years later). Reframed.
- **S2** — the median moves by up to about 5%, not 3%. Corrected.
- **S3, S4, S5** — copy sites, Ask AI sites and suite pins the census missed (the Monte Carlo tab's own sentence, the Backtest and two What
  Breaks sentences, the Field Manual's tax-parts and toggle sentences, three Field Manual Ask AI rows, two stale comments; `t83` §I, eight
  `t66` checks, `t93` H-7, `t89` E-6/E-7; `t83`'s count, 16, and `t20`'s, 3). Added to §2.
- **S6** — the cost note's sizes were derived at characters ÷ 4, not 3½, so the Opus factor is about × 1.54, not × 1.3; F-26's open item
  says the same and is now cited. §0.6 recomputed.
- **S7** — the "worst case" ignored the conversation's growth, and the Sonnet comparison did not reproduce (it gives 2.4–7.4 ¢, not 1–5 ¢).
  §0.6 states the first question and the growth separately; the comparison is dropped.
- **S8** — 16,000 tokens in 240 s needs about 67 tokens a second, unmeasured, and a timeout drops the whole answer. AI-3 now shows the speed
  each option needs.
- **S9** — the tail control would have survived on the first draft's households (their surcharges end before the horizon), and §C's
  invariant was false for a household whose only surcharges fall after it. §A and the controls now use `t93`'s New York household; §C is
  restricted.
- **S10** — AI-1 gains option (c), a runtime fallback.
- **S11** — AI-4 now keeps its notices out of the conversation memory and says what a refusal with text shows.
- **Notes:** N1 (read text by `type`; a non-empty mocked thinking block), N2 (D-65 reaches Engine A too; L5965), N3 (`t93` D-7's real
  scope), N4 (the 6-year effect is unmeasured, not bounded), N5 (DS-5 (c), the conservative option), N6 (measure on `t93`'s household), N7
  (AI-2's citation), N8 (the ground rules say nothing about length), N9 (re-time the schedule at the build), N10 (Engine A's and Engine C's
  IRMAA compared in §D) — all taken.

**After the review, AI-6 was re-decided** (Opus 4.8, medium effort). The review's B1, B2, S8 and the thinking half of S6 concerned Opus 5.5's always-on thinking; with Opus 4.8 sending no `thinking` field they no longer arise, and §0.5, §0.6, §1, §3 and §5 were rewritten for Opus 4.8. The rest of its findings stand as taken. The Opus 4.8 facts (ID, $5 / $25, thinking off unless requested, effort supported with a `high` default, Active to May 2027) were read on the same pages and were not reviewed.

## 7 · Build record

**Built 2026-10-24 as v6.31** on v6.30 (`f2d3f578…`). Source `d729d028d26f4c5b73996099dae4fd2f` · built `index.html`
`7a52c128fa0c77029a63114f4db320f8` (vite 5.4.21, `npm ci`; v6.30 rebuilt byte-identically to `3d013b09…` on the same toolchain) ·
`smoke_built` 22/22. Every decision built as recorded in §5 (DS-1 to DS-5, AI-1, AI-3, AI-4 — all (a)) except where a line below says
otherwise. The premise held: no evidence at the build contradicted §0.

**Measured at the build** (the v6.31 module, 30-year runs, 3,000 paths, seeded, with and without the surcharges): the example at $250,000
— BULL-LEANING above $800K 85.87% → 84.77%, median $1,675K → $1,619K; BASE above $500K 75.13% → 74.03%, median $1,038K → $983K; the single
example BULL median $1,523K → $1,496K; the example as it opens unchanged. These reproduce §0.3's prototype figures exactly.

**Found at the build, and what was done.**
1. **The IRMAA tab contradicted the Field Manual on D-65.** The tab said the first years "err high" because every surcharge is charged in
   full; the Field Manual's IRMAA entry already said those premiums are not projected at all. The tab's sentence was replaced (DS-5's
   disclosure), and the Field Manual's entry now also says the Monte Carlo and What Breaks do not charge them.
2. **Engines A and C disagree on IRMAA (filed as MissingFeatures D-66).** §3 D planned *"equal, or the difference printed and disclosed"*.
   Equal on the example at $70,000 and $250,000; different on the single example (A $10,930, C $12,080, BASE), New York ×3 (A $50,270, C
   $32,340 inside the horizon, BASE) and the example at $0 (A $8,050, C $0, BULL). Printed and pinned (`t94` D-2), disclosed in METHODOLOGY
   and — after the review (below) — on What Breaks' own line and in the Field Manual.
3. **§1 item 9 kept "about 3,000 words (4,096 tokens)" as true. It is not, on Opus 4.8's tokenizer**: 4,096 × 0.75 ÷ 1.35 ≈ 2,300 words.
   The Field Manual's sentence and the source comment say about 2,300.
4. **The census row's polarity.** §3 wrote `irmaa_in_mc` as *"ON when the schedule carries a surcharge … the example OFF"*. The census's
   convention is the reverse (ON = on the boundary, where the fix cannot be seen), so the row is ON when there is no surcharge (the example
   ON, `t29` B-25). Its fixture is the example filed single, built inline in `t29` (the census reads the opening $70,000 slider, so the
   $250,000 example could not be its fixture; adding a shared fixture household would have grown every suite that iterates them).
5. **`t93`'s v6.29 differential needs a v6.29 module**, which a v6.30 → v6.31 run folder does not build, so `t93` died on both legs. It now
   compares the v6.31 leg with v6.30's module (Engine D unchanged; v6.30's release run proved v6.30 equal to v6.29 there) through a keyed map
   the next registration must decide; the v6.30 leg, now the prior leg, prints a skip (95 checks there, 97 on v6.31).
6. **The credit sentence** was first written *"fifty to one hundred fifty"*; the arithmetic gives 51 to 169. Corrected to *"one hundred
   seventy"* while writing `t94` G-7.
7. **Control C2** expected `B-1`; B-1 checks the paths against the schedule's own parts and so cannot see a wrong year, while A-2, A-4 and
   B-2 do. The expected list was corrected, not the test. **Control "charged before retirement"** (§3) has no mutation that can express it:
   Engine C starts at the retirement year, so no surcharge row is dated before it. C4 (premium years after the horizon kept) takes its place
   — the same filter guards both edges.
8. **Re-gated suites:** `t66` E-1, E-7, E-15, E-16, E-17, E-18; `t83` A-1 (the tax part, and from the review the total and the tail), I-5,
   I-6, I-7, I-8, I-10; `t89` E-6, E-7 (the token basis); `t93` H-7 and the D-5/D-6 reference; `t29` A-3, B-25, C-irmaa-1 added. `t45`, `t47`,
   `t48` and `t78` read the built page and went green once it was rebuilt. v631 registered by AST in 79 files (252 ladder entries, 186 gates,
   2 map arms), `t33` PINS (unchanged values) and the three `.py` suites by hand.

**The build review** (an agent that had not seen the build; given the two sources, the diff, the scope, the new suite, its controls, the
re-gates and METHODOLOGY) found **no blocker, 4 should-fix and 5 notes**. Every one was taken or answered:
- *Should-fix 1 — a refused question stayed in the conversation memory.* Anthropic's refusal guidance (read at the build): *"you must reset
  the conversation context before continuing … Attempting to continue without resetting will result in continued refusals."* AI-4 (a) kept
  the notice out of the memory; the declined exchange — the question and any text — is now left out too (`noMem`), and the Field Manual
  says so. `t94` F-6 asserts it (it had asserted the opposite); controls C11, C19. *Steve: this goes one step past AI-4's wording, on
  Anthropic's stated requirement; say if you want the refused text kept.*
- *Should-fix 2 — §0.6's conversation-growth figure was wrong.* *"Twelve long messages can add 30,000–50,000 input tokens, 15–25 ¢"* assumed
  questions as long as answers. The memory is the last 12 messages — about six questions and six answers — so six full-length answers re-sent
  at $5 per million add about 12 cents. The Field Manual now says so; `t94` G-13, control C21. Owned: it is this scope's arithmetic.
- *Should-fix 3 — D-66 had no in-app disclosure.* What Breaks' line and the Field Manual's What Breaks entry now say its IRMAA comes from
  the Roth tab's engine and can differ from the IRMAA tab's. `t94` D-5, control C20.
- *Should-fix 4 — `t83` A-1's re-gate checked the tax part only.* It now also checks the total charged (tax + surcharge, every year) and
  the tail on t83's whole grid.
- *Notes:* METHODOLOGY's SSA-44 paragraph called the omission conservative without qualification — corrected with a D-65 cross-reference;
  the dropped "before retirement" control — recorded above (item 7); an expense row for IRMAA would now be charged twice — the Field
  Manual says so beside the income-tax warning; the Income card's year count is within the plan — its line now says *"within the plan"*;
  a source comment's token arithmetic — corrected. Answered, not changed: the review read `t83` I-5's v6.31 regex as dropping the "Before
  v6.20" clause; it keeps it. It also read the Field Manual's *"Roth tab's IRMAA verdict … narrower MAGI … optimistic"* limitation as
  contradicted by D-66; that limitation is about the conversion ladder's table, not Engine A, and stands.

**Counts and controls.** The full suite from the packaged copies: **9,640 app checks across 93 app suites, 0 failed, 0 DIED** (5,223
current-leg, 3,946 on the v6.30 leg, 234 and 237 in the two attribution runs); MC parity 10/10, every fingerprint byte-identical; tooling
120; GRAND 9,770. `t94` 99 on v6.31, 53 on v6.30. `qa/tools/controls_v631_mc_irmaa_ai.py` on a copy of that run folder: 22 of 22 as
expected (C19–C21 added after the review), every file restored and hash-checked.

## 8 · Sources (read 2026-10-24)

- Anthropic, Models overview — <https://platform.claude.com/docs/en/models/overview> (the current models; Opus 5.5's always-on thinking)
- Anthropic, Claude Opus 5.5 migration guide — <https://platform.claude.com/docs/en/models/opus-5-5/migration-guide> (its section *Migrating to
  Claude Opus 5.5 from Claude Opus 4.8*: on Opus 4.8 thinking is off unless asked for and effort defaults to `high`; refusals and `stop_details`)
- Anthropic, Effort — <https://platform.claude.com/docs/en/build-with-claude/effort> (`output_config.effort`; supported on `claude-opus-4-8`, whose default is `high`; Opus 5.5 defaults to medium;
  set effort explicitly; a disabled-thinking request returns 400)
- Anthropic, Thinking — <https://platform.claude.com/docs/en/build-with-claude/thinking> (thinking billed as output and counted in `max_tokens`)
- Anthropic, Pricing — <https://platform.claude.com/docs/en/about-claude/pricing> (Opus 4.8 $5 / $25; Opus 5.5 $4 / $20; Sonnet 4.6
  $3 / $15; the newer tokenizer, from Claude 4.7, about 30% more tokens)
- Anthropic, Model deprecations — <https://platform.claude.com/docs/en/about-claude/model-deprecations> (`claude-opus-4-8` Active, not retired
  before 28 May 2027; `claude-sonnet-4-6` not before 17 February 2027)
- Anthropic support, What are artifacts — <https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them> (artifacts
  that use Claude: no model named)
