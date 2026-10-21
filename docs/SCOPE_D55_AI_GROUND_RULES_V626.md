# SCOPE — v6.26 · D-55: Ask AI's ground rules reach every plan

**FULFILLED at v6.26 (2026-10-21; build record §7). DECIDED 2026-10-21 — all six as recommended:** DC-1 (a) *"Every plan"*, DC-2 (a) *"No directives"*, DC-3 (a) *"Leave it, header wins"*, DC-4 to DC-6 (a) *"All as recommended"*. Steve, 2026-10-21: *"go D-55"*. Built against **v6.25** (source
`d7df32a9a3091fc550eb1a56646c4270`, repo `c94a346`). Repo-only (`docs/`). Not a modelling release: no figure, engine or stored field
changes. Reviewed before Steve saw it (§6).

## 0 · Premise (verified at v6.25)

### 0.1 What Ask AI sends

One builder, `aiSystemPrompt` (a `useMemo` in the main component, L7227–7255), makes the system text for both routes:
`${MASTER_PROMPT}` followed by a *LIVE PORTFOLIO CONTEXT* block built at question time (L7253–7254). Parser census (acorn, `w626/src`):
the app has exactly **two** `fetch` calls that reach a model, both in `askAI` — Anthropic's `/v1/messages` (L7312, `system:
aiSystemPrompt`, L7324) and a Local Model's `/chat/completions` (L7300, `{ role: "system", content: aiSystemPrompt }`, L7308). No XHR,
WebSocket or beacon. Inside claude.ai the same L7312 call goes out without a key; `src/main.jsx` rewrites only the URL of a keyless
request, never its body. The Ask AI tab shows the system text verbatim under *EXACTLY WHAT'S SENT* (L12888). Follow-up questions send
the conversation without repeating it.

`MASTER_PROMPT` is one of four things:
- **the demo briefing** (`DEFAULT_MASTER_PROMPT`, L232) — while the example is loaded and unsaved, including after *Reload sample*
  (L14709, which also stores it);
- **the plan summary** `genAIContext()` (L13482) — written by My Data's Save & Apply (L13526) and Export Backup (L13609);
- **empty** — Start Fresh, the guided setup, a backup without a prompt (the loader, L4225–4231, v6.22);
- **the plan's own text** — a backup's prompt, or one stored by an older version, accepted as plain text up to 20,000 characters.

### 0.2 Measured — Chromium, the built v6.25 page, the *EXACTLY WHAT'S SENT* text

| Plan | Characters sent | Opens with | Carries ground rules? |
|---|---|---|---|
| Example, as loaded | 16,166 | *RETIREMENT ANALYSIS MASTER PROMPT — … [DEMO / SAMPLE DATA]* | **yes** — Section 1, *Educational Only* |
| Example, after one Save & Apply | 2,087 | *RETIREMENT ANALYSIS CONTEXT — Spouse A & Spouse B* | **no** |
| Start Fresh, before any save | 1,258 | the *LIVE PORTFOLIO CONTEXT* rule line | **no** |
| Start Fresh, after Save & Apply | 1,912 | *RETIREMENT ANALYSIS CONTEXT* | **no** |

So **every real plan sends no ground rules**, and so does the example once saved. The one guard any of them carries is a clause inside
the live context's asset-mix line: *"(401k-relative, descriptive — do not recommend allocation changes)"*. Wider than the register's
wording (*"a plan saved from My Data"*): it is every plan but the unsaved example. (All four rows re-measured independently by the review.)

### 0.3 Siblings found reading it

1. **The example's own briefing pulls the other way.** Beside *"Educational Only: Describe and analyze — do NOT recommend target asset
   allocations or specific securities to buy, sell, or trim"* (L258–260) it casts the model as *"a seasoned Senior Portfolio Manager
   acting as my fiduciary thought partner"*, says *"Every recommendation must prioritize my financial well-being"* and *"If a strategy is
   suboptimal, explain why and propose an alternative"* (L249–257). And it tells the model to *"execute Section X exactly as written"*
   (L242), where several sections ask for what a no-directives rule forbids: *"Hedging Strategy Recommendations"* (L338), *"Design
   year-by-year Roth conversion plan … Target: $60K–$80K/yr"* (L393–396), *"Optimal order across accounts"* (L416), *"Annuitize or lump
   sum?"* (L475), *"need vs drop?"* (L485).
2. **The live context names a section most plans do not have**: *"LIVE PORTFOLIO CONTEXT (as of …) — supersedes Section 2 balances"*
   (L7254). Only the demo briefing has a Section 2.
3. **The live context states three things as facts for every plan** (L7253): *"Hybrid LTC insurance per master prompt"* — the app has no
   LTC field, and most plans have no master prompt (the Ranking tab dropped the same claim at v6.11, L9713's comment); *"pension $… 
   (joint&survivor, full to survivor)"* — the model's assumption, not something the plan entered; and *"… & Spouse B"* / *"Investor
   names: … & … (spouse)"* for a single household.
4. **The app itself prints directives** — found by the review, out of this release (§4). The Grade tab's *"PATH TO {grade} — RECOMMENDED
   ACTIONS"* (L9565) lists items such as *"Secure hybrid LTC insurance policy for both spouses"* (L9461) and *"Execute Roth conversion
   ladder … (fill 22% bracket each year)"* (L9465). Elsewhere the app's comparisons report *"the model's best cell"* (L9226, L9258,
   L11141).

### 0.4 What the app says about it

- **Field Manual**, *master prompt & AI context*: the briefing *"has two parts: a plan summary … and a live context"* — no ground rules
  named. §10's table of what is and is not transmitted lists user data only. The cost passage: *"roughly 1,000 to 5,000 tokens"* per
  question. ⚠ **That range's lower end is already false for real plans** (measured by the review through a stubbed `fetch`, characters ÷ 4
  as `t66` counts): example 16,603 characters ≈ 4,151 tokens; the example saved ≈ 563; Start Fresh ≈ 353. With the header: ≈ 4,460,
  ≈ 870, ≈ 660. `t66` E-7 measures only the example, so it cannot see the lower end. The example's briefing carries 1,340 box-drawing
  characters, which ÷ 4 probably undercounts, so its headroom under 5,000 is thinner than ≈ 540 suggests.
- **The Ask AI tab** (L12886): *"the AI service receives the text below — your plan summary … plus the live plan context — together with
  the question you type"*.
- **METHODOLOGY §11**: Ask AI *"transmits a structured plan summary …, the typed question, and any explicitly attached files — nothing
  else"*.
- The Field Manual's opening warning already says *"The embedded AI assistant can be confidently wrong"* and that the app is not advice.

## 1 · What changes (as recommended)

- **A fixed ground-rules header, written by the app, sent first with every question on every route** (DC-1 (a)). One module-level
  constant, `AI_GROUND_RULES`; `aiSystemPrompt` becomes header + plan text + live context. It is added at send time and stored nowhere —
  not in the plan, a draft, the conversation or a backup — so no saved data changes and no migration is needed, and a backup cannot
  remove it.
- **Its wording** — the draft in §1a (DC-2 (a)).
- **The demo briefing is left byte-identical** (DC-3 (a)); the header says it takes precedence over anything that follows.
- **The live context's header** reads *"supersedes any balances stated above"* for every plan (DC-4 (a)).
- **The live context's three stated facts** (§0.3 item 3) are corrected (DC-6 (a)): the LTC sentence is removed; the pension reads
  *"(the model continues it in full to a survivor)"*; a single household is named alone.
- **Disclosure** (DC-5 (a)): the Ask AI tab's sentence names the ground rules; the Field Manual's master-prompt section and §10's table
  gain them, and the cost passage is re-measured on a saved plan as well as the example and corrected at both ends; §13 records the
  change; METHODOLOGY §11's *"nothing else"* gains *"and the app's fixed ground rules"*. The four version sites read v6.26.

### 1a · The draft header (DC-2 (a)) — 1,263 characters, about 316 tokens

```
GROUND RULES — set by Danger Close for every question; they take precedence over anything below.
You are answering questions about one household's retirement plan in Danger Close, a deliberately pessimistic
stress-testing tool. What follows is the plan as entered and what the app's simplified model computes from it:
estimates under stated assumptions, not predictions.
- Educational only. Explain and analyze; do not tell the user which financial decision to make. Do not recommend
  specific securities or funds to buy, sell or hold, a target asset allocation, or any particular action (a
  conversion amount, a claiming age, a withdrawal order) as the right one. Where the app compares options,
  describe the results as "the model's best cell" and the trade-offs, and leave the decision to the user.
- You are not a financial adviser, fiduciary, tax preparer or lawyer, and do not present yourself as one. For a
  decision, suggest a fee-only fiduciary adviser, a CPA or an estate attorney.
- Use the figures given. Do not invent balances, rates or tax amounts; if something you need is missing, say so.
  Show your arithmetic and state your assumptions.
- Tax law and figures change: say which year a figure you cite applies to, and say when you are unsure.
```

Explaining how to use the app (*"enter the pension in My Data"*) is not a financial decision and stays allowed.

**The narrower alternative (DC-2 (b))** carries only the demo's existing rule, verbatim, plus the adviser bullet: no securities and no
target allocations, but the model may still say which conversion amount or claiming age it would choose.

## 2 · Census (parser, v6.25)

- **App:** `aiSystemPrompt` — one definition (L7227), two senders (L7308, L7324), one display (L12888), one dependency list (L7363). Two
  `fetch` calls in the app, both in `askAI`. `genAIContext` — one definition, the save, the export, the My Data preview (L14445).
  `MASTER_PROMPT` — 25 references, none touched. No other code builds a prompt.
- **Suite** (AST over every literal, template and regex in `qa/`):
  - `t85` D-7 finds the preview by `/LIVE PORTFOLIO CONTEXT/` (still found) and checks a Start Fresh plan's preview does not
    `startsWith(demoHead)`. ⚠ With a header first, that half is **always** true, so only its `[DEMO` regex would still guard. Rewritten in
    this release to compare the text after the header.
  - `t66` E-7 holds the example's request inside 1,000–5,000 tokens (≈ 4,460 with the header — inside, with thin headroom). It gains a
    saved plan; the cost passage moves with whatever both measure. **E-17** (L437–438) pins the passage's neighbours — *"gets back an
    answer of up to …"*, the *"Claude Sonnet 4.6 prices … October 2026"* sentence, *"about six cents"*, and the glossary's *"runs a few
    thousand tokens — about one to five cents"*; **E-15b** pins the *"older backup keeps its own wording"* sentence. The edit keeps every
    pinned phrase or re-gates the pin per leg.
  - `t4` (*EXACTLY WHAT*, a tab signature) unchanged; `t36` reads routes, not text. No suite reads `.system` or `aiSystemPrompt`, hashes
    the demo text, or pins *supersedes*, *Section 2*, *Hybrid LTC*, *joint&survivor*, METHODOLOGY §11's *"nothing else"*, *"plan summary"*
    or *"two parts"*; no `t31` key reaches §11.
  - `t85` B-3 reads `DEFAULT_MASTER_PROMPT` from source as a template literal and parses the example's facts from it — another reason for
    DC-3 (a).

## 3 · Tests

New suite **`t89_ai_ground_rules.mjs`**, both legs (the v6.25 leg pins the absence as a dated `[KNOWN DEFECT 2026-10-21, D-55]`):
- **§A by AST:** `AI_GROUND_RULES` is a module-level string literal; `aiSystemPrompt` starts with it; both senders send `aiSystemPrompt`
  and nothing else as the system text; exactly two model `fetch` calls exist; no store, draft, export or loader writes the header.
- **§B rendered, every route into a plan:** the example as loaded, after *Reload sample*, and saved; Start Fresh before and after a save;
  the guided setup; a backup with its own prompt text; a backup without one — the *EXACTLY WHAT'S SENT* text starts with the header,
  carries it exactly once, and still carries the plan text and live context after it.
- **§C the request itself**, through a stubbed `fetch`: Anthropic with a key — `body.system` starts with the header; the claude.ai route
  (no key, `IS_CLAUDE_ARTIFACT` on) — the same; a Local Model — `messages[0]` is `role: "system"` and starts with it; a follow-up sends it
  once.
- **§D nothing else moves:** `DEFAULT_MASTER_PROMPT` byte-identical to v6.25's; a saved plan and an exported backup carry no header; the
  v6.22 demo-text rule (a stored demo briefing beside other holdings is dropped) still holds; the live context's new header, the LTC
  sentence gone, the pension wording, a single household named alone.
- **§E copy:** the Ask AI tab's sentence, the Field Manual's master-prompt section, §10's row, the cost passage against both measured
  requests, §13, METHODOLOGY §11.
- **Existing suites:** `t85` D-7 compares after the header; `t66` E-7 gains the saved plan.
Controls: the header dropped from one route, sent twice, stored into a backup, the precedence line removed, the old *Section 2* header
back, the LTC sentence back, each disclosure removed, and the unmutated run.

⚠ **What no test can show:** whether a model obeys the rules. The suite proves the text is sent, first, on every route; it cannot prove
the answer that comes back follows it, and no live model call runs in the suite. The Field Manual's *"can be confidently wrong"* stands.

## 4 · Out of scope

- **The Grade tab's *RECOMMENDED ACTIONS*** (§0.3 item 4) — the app's own directives, among them LTC insurance *"for both spouses"* on
  every plan. Filed with this release as **UsabilityFlaws F-22**, not fixed; it is the same question as DC-2 asked of the app's own copy,
  and deserves its own scope.
- Which model Ask AI uses (**AI-6**, `ARCHITECTUREIssues.md` E-30 (c) — Steve's open decision, separate).
- Rewriting the demo briefing (DC-3 (b)); the 20,000-character cap on an imported prompt; filtering or checking answers; what plan data
  is sent, beyond DC-4 and DC-6.

## 5 · Decisions for Steve

**DC-1 · Who gets the ground rules.** (a) **Recommended.** Every plan, the example included, first in every request, stating that they
take precedence over what follows. (b) Only plans that do not carry the demo briefing — the unsaved example keeps its own Section 1 alone.

**DC-2 · How strict.** (a) **Recommended.** The §1a draft: no financial directives — results described as the model's, the decision left
to the user. It is the rule the Roth and Social Security comparisons already follow (*"the model's best cell"*). ⚠ It is **not** what the
Grade tab does (F-22): under (a), Ask AI would decline the kind of directive that tab prints. (b) The demo's narrower rule: no securities
or target allocations, otherwise free to recommend.

**DC-3 · The demo briefing's own voice** (§0.3 item 1). (a) **Recommended.** Leave it byte-identical; the header's precedence line governs,
and the Field Manual says the sample briefing is older text the ground rules override. Trade-off, visible: on the example, *"Run Section
6"* or *"Run Section 7"* asks for a plan the header forbids, so the answer will come back as trade-offs or partly declined. Changing the
demo text instead would break v6.22's recognition of a stored demo briefing (the loader compares by equality with
`DEFAULT_MASTER_PROMPT`, L4229 and L4262) unless every past version were also recognised, and `t85` B-3 parses facts from it. (b) Rewrite
Section 1 and the directive sections, and teach the loader the old text.

**DC-4 · The *"supersedes Section 2 balances"* line.** (a) **Recommended.** *"supersedes any balances stated above"*, for every plan.
(b) Leave it.

**DC-5 · Where it is described.** (a) **Recommended.** The Ask AI tab's sentence, the Field Manual (master-prompt section, §10's table,
the cost passage corrected at both ends, §13), and the one clause in METHODOLOGY §11 — so *"nothing else"* stays true. No in-app notice:
nothing a user saved changes. (b) The Field Manual only.

**DC-6 · The live context's three stated facts** (§0.3 item 3) — found by the review. The header tells the model to use the figures given,
so a sentence that is false for the plan becomes something the model is told to trust. (a) **Recommended.** Fix them in this release:
drop the LTC sentence, word the pension as the model's assumption, name a single household alone. (b) File them for later.

## 6 · Review

The scope was reviewed by an agent that had not seen it written: no blocker; six should-fix findings and four notes, all taken. It found
the Grade tab's directives (§0.3 item 4, F-22) — which corrected this draft's claim that "no directives" is already the app's rule; the
example's directive sections (§0.3 item 1, DC-3's trade-off); the cost passage's false lower end (§0.4); `t66` E-15b and E-17 and the
weakened `t85` D-7 (§2); the live context's stated facts and an inaccurate second sentence in the header (DC-6, §1a); a too-broad *"do not
tell the user what to do"*; the claude.ai route missing from §3 C; and the fourth source of `MASTER_PROMPT` (§0.1). It confirmed every line
number, quote and count it checked, all four rows of §0.2 in Chromium, the two-sender census, that the header would be stored nowhere,
and the equality test behind DC-3.

## 7 · Build record (v6.26)

Built as decided. Source `6173cbbacee22df0896fd41351ce1314`, built `index.html` `23407af94f3b82197e7ddf1f09840264`; the CHANGELOG's v6.26 entry is the release record.

**As built.** `AI_GROUND_RULES` (1,263 characters, ≈ 316 tokens by characters ÷ 4) is a module-level template literal before
`AI_CUTOFF_NOTICE`, read in one place: `aiSystemPrompt`'s own return, which starts with it, then the plan's briefing if any, then the live
context. The live context's changes (DC-4, DC-6) are as §1, plus two the build review found (below): each retirement year's *"success"*
now says it means ending above $800K, and the Roth line names the slider amount the results ran at, or says there are no conversions at $0.

**Measured** (the built page in Chromium, `t66`'s method — request characters ÷ 4; `t89` prints them):
| Plan | v6.25 | v6.26 |
|---|---|---|
| The example | ≈ 4,137 | ≈ 4,480 |
| Entered and saved | ≈ 564 | ≈ 907 |
| Single, saved | ≈ 546 | ≈ 861 |
| Blank, saved | ≈ 524 | ≈ 866 |
| Entered, unsaved | ≈ 350 | ≈ 691 |

The Field Manual's cost passage reads *"roughly 600 to 1,500 tokens for a plan you entered yourself, and about 4,500 for the example's
longer sample briefing"*. The 1,500 is a margin for longer plans, not a measurement. Characters ÷ 4 is an estimate; the live context's
box-drawing characters may tokenize differently.

**Departures from §3, each deliberate:**
- The guided setup is exercised as what it stores — a plan with no prompt (`t89` B-6) — not driven through its screens.
- `t66` E-7 was re-gated to the example's new size (4,000–5,000 on v6.26) rather than given a saved plan; `t89` E-6 measures entered plans
  against the new range instead.
- The controls cover the rules written into the stored summary rather than into a backup (the export reads the same summary; `t89` B-3 and
  B-5 both fire on it).

**Tests:** `t89` **43** current, **34** on the v6.25 leg. **Controls:** `qa/tools/controls_v626_ai_rules.py`, **19 of 19 as expected**.

**Build review.** By an agent that had not seen the build: no blocker; three should-fix and five notes, all taken or recorded.
- The Field Manual said the assistant *is* educational and *is not* an adviser — a claim about a model's behaviour no test can make.
  Reworded to what it is *told*, with *"A model can still ignore an instruction"*.
- A single household's pension still carried *"to a survivor"* — removed; `t89` D-4, control C16.
- *"success="* and the Roth line stated figures without their meaning — fixed; `t89` D-6 and D-7, controls C17 and C18.
- `t89` B-9 could pass with no preview, and A-7 with no v6.25 source — both now fail closed.
- The controls lacked the master-prompt section and §10's row — added (C14, C15).
- METHODOLOGY §11's *"nothing else"* still omitted the conversation and the briefing's other forms — rewritten as a complete list.
- The ÷ 4 token estimate is unverified against a tokenizer — recorded above. That the single-household flag cannot go stale after a save
  was checked and needs no action.
- The review named checks with no control. B-7, B-8 and C-2 turn red under C1 or C3; D-5 (a couple named as two) and E-7 (the example's
  cost figure) still have none.

⚠ **Owned.** This scope's first draft said a no-directives rule is already the app's own rule; the Grade tab's *RECOMMENDED ACTIONS* is
not (F-22, §6).

