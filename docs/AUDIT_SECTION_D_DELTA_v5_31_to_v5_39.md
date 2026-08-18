# AUDIT — Section D delta sweep · v5.31 → v5.39

| Field | Value |
|---|---|
| Build under audit | **v5.39** · source md5 `7070018f2699503dfac4ca8e0e1b2feb` |
| Built `index.html` | `0563e2f6db79c19b4729bec6e09a458a` |
| Verified against | the **committed tree** (fresh clone, commit `d18f7cc`), not a working copy |
| Predecessor | `AUDIT_PHASE3_SECTION_D_SWEEP.md` — same objective, anchored to **v5.31** |
| Objective | re-run that sweep's method over the six **modelling** releases shipped since it |
| Result | **Two live findings**, both the "two surfaces disagree" shape. **S-1 has widened.** One new: **S-3**, in `METHODOLOGY.md`. Two delta subjects **cleared**. |
| Fixes made | **None.** This is an audit. |

---

## 1. Why a delta sweep, and why now

The v5.31 sweep concluded that the rendered surfaces and the documentation agree. That was **measured
against v5.31**. Six modelling releases have shipped since:

| Release | What it added to the model |
|---|---|
| v5.32 | ACA FPL sub-floor (enhanced scenario no longer pays full premium to zero income) |
| v5.34 | conversion-funding **basis tracker** — effective gain fraction, not the declared one |
| v5.35 | **RMD sourced from the retirement account**, not the taxable sleeve |
| v5.36 | **the drawdown realizes capital gains, and the tax engines consume them** |
| v5.37 | **ordinary money grows, and its growth is taxed** (E-15) |
| v5.38 | the ACA-premium sale's gain is taxed, and **the IRMAA lookback sees it** |

Every one adds a *term* to the model. The failure this project actually suffers is not a missing
disclosure but **a surface still describing the model in its pre-release form** — the v5.31 defect
(Taxes tab header, line item and footnote disagreeing about OBBBA) and the sweep's own S-1 are both
that shape. Six new terms is six new chances for it.

**It had already happened.** S-1 was open when this sweep started and had widened without being
touched — see §3.1.

## 2. Method, and how it differs from the v5.31 sweep

**Corpus — three surfaces, captured from the shipped build:**

1. **The render tree** — 715 distinct user-facing string literals ≥40 chars, extracted from the
   docs-stripped source (`DOCS_HTML` is one line, L3593; removed to a working copy first).
2. **The Field Manual** — `DOCS_HTML` **decoded to runtime bytes** with a JS evaluator, not
   `JSON.parse` (it carries a `\'` escape: valid JS, invalid JSON). 143,529 bytes decoded.
3. **`METHODOLOGY.md`** — 894 lines, from the committed tree.

**Passes:** sentence-split each surface, then filter to sentences that (a) name a delta subject
(capital gains, cost basis, realized gain, RMD, growth, ACA, MAGI, IRMAA, sale) **and** (b) carry a
negative or limiting marker (*not modeled, never, no, default to $0, excluded, only, assumes,
simplified, approximate, treated as, stand in*). Every surviving claim was then compared against the
**engine expression that implements it**, located by line.

### 2.1 How this is weaker than the v5.31 sweep — stated, not buried

- **This is not the 28-surface capture.** The v5.31 sweep drove the DOM harness and captured
  *rendered* text per tab with the example household loaded. This sweep reads **string literals from
  source**. A claim assembled at runtime from fragments, or one living in a template expression rather
  than a literal, would be missed here and would not have been missed there.
- **Pass C is weaker.** The v5.31 sweep verified by **driving the engines and perturbing inputs**,
  with control arms. This sweep compares each claim to the **engine expression**, read at a named
  line. That is stronger than reading prose and judging it plausible, and it is weaker than
  measurement. **Where a finding below states what an engine computes, it is quoting the expression,
  not a measured output.**
- **Scope is the delta, by decision.** Subjects outside the six releases were not re-examined; the
  v5.31 sweep covers them and its result stands for them.

**Consequence:** a null result here is weaker evidence than a null result there. The two findings are
positive results and do not depend on the method's ceiling.

## 3. Findings

### 3.1 S-1 · The IRMAA tab's MAGI enumeration now omits **two** components — Low, user-side

**Carried forward from the v5.31 sweep, and it has widened.** Recorded there as a single omission
(`div_y`), Low, *"one clause, no engine change, candidate for whatever release next opens that file."*

**What.** The IRMAA tab prints (**L9791**, verbatim):

> *"MAGI here uses the simplified 85%-of-SS assumption plus pension, earned income, RMDs, and
> conversions."*

Five components. Engine C's MAGI (**L4398**) sums seven:

```js
const magi = ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y;
```

| Component | Named on the tab? |
|---|---|
| `ssTaxable`, `pen_y`, `work_y`, `rmdTax_y`, `conv_y` | yes |
| `div_y` — taxable-sleeve dividends (**L4394**) | **no** — the original S-1 |
| `capGain_y` — realized capital gains (**L4397**) | **no** — **new since v5.31** |

**Why the second omission matters more than the first.** The source comment directly above `capGain_y`
(**L4395**) reads: *"v5.36: realized capital gains ARE MAGI — Engine D's per-year gain."* Making
realized gains visible to the IRMAA lookback was the **stated purpose** of v5.36 and v5.38. The tab
whose entire job is explaining IRMAA still tells the user those gains are not in the calculation.

**Severity: Low, unchanged, and for the same reason the v5.31 sweep gave.** The direction is safe: the
app *counts* the income, so no surcharge is understated and the plan shown is correct. Only the
explanation is incomplete. But a user reading it could conclude their brokerage dividends and drawdown
gains don't bear on IRMAA — the opposite of true, and now doubly so.

**Exposure:** user-side. **Suspected cause:** an enumeration written once and never re-opened, in a
file four subsequent releases modified around. **The same sentence has now been left behind twice.**

**Fix shape.** One clause, no engine change. **Recommend naming the components generically** rather
than re-enumerating — an enumeration is a hostage to the next release, which is how this recurred.

---

### 3.2 S-3 · `METHODOLOGY.md` states, in the present tense, that Engine B defaults realized gains to $0 — Low, creator-side (published)

**New. This is the v5.31 defect's exact shape: two surfaces disagreeing, the stale one optimistic.**

**What.** `METHODOLOGY.md` **L537–538** reads:

> *"Engine B applies the same simplification (realized capital gains default to $0 unless a sale is
> modeled), so the two engines are consistent here."*

Present tense, uncaveated, inside the v5.24/v5.26-era section on the Engine D `otherAccounts`
classification. **It is false as of v5.36.** Engine B (**L5095**):

```js
const capGains_y = Math.round(_gainByYr[yr] || 0); // shown as its own column for transparency
```

fed from the withdrawal schedule at the call site (**L9426–9433**), which Engine D populates from
ordinary spending against the taxable sleeve (**L4741–4742**).

**The same document contradicts itself.** A later section — *"Capital gains in the drawdown, and where
they are taxed (v5.36)"* — states correctly that *through v5.35* the Taxes tab carried a hardcoded $0
and IRMAA MAGI never saw a gain, and describes the change. So the current behaviour **is disclosed**;
what is wrong is that the older passage was never retired and still reads as current.

**Why it is a finding and not a nit.** Two reasons, both from the sweep's own framing:

1. The v5.31 sweep's whole thesis is that this project's failure mode is *"not a missing disclosure,
   but two surfaces disagreeing."* This is that, inside a single document, where a reader has no cue
   which passage governs.
2. **`METHODOLOGY.md` is the modelling reference** and updates *"whenever a release changes modeling."*
   Six modelling releases shipped in this window. The v5.36 section was added; the passage it
   falsified was not removed.

**Direction.** The stale statement describes the app as **more optimistic than it is** — claiming no
capital-gains tax where the model now charges one. It understates the model's conservatism rather than
overstating it, so no user is shown a rosier plan. That is why this is Low and not Medium.

**Exposure:** creator-side in the first instance, but `METHODOLOGY.md` ships in the repo and is the
document a reviewer reads to understand the model — so a reviewer could correctly conclude the app
does not tax drawdown gains, and be wrong.

**Suspected cause.** The v5.36 release added a new section rather than auditing existing ones for
statements it falsified. The passage sits ten lines above an unrelated merge-verification note and is
easy to miss when working forward.

**Fix shape.** Either strike the parenthetical and its "so the two engines are consistent here" clause,
or date-stamp the passage (*"through v5.35…"*) as the v5.36 section already does. **Recommend
date-stamping** — the passage's surrounding argument about Engine D's MAGI excluding brokerage
withdrawals is still correct and worth keeping.

---

### 3.3 Cleared by comparison — recorded so they are not re-investigated

**v5.37 · ordinary-money growth.** No surface asserts that Other-accounts money is static or does not
grow. Searched the render tree and `METHODOLOGY.md` for negative growth claims against that subject:
**zero hits.** E-15's fix did not leave a contradicting claim behind.

**v5.35 · RMD sourcing.** The two RMD claims in the render tree concern **ownership** (which spouse's
RMD age and survivor rollover apply, and that IRAs cannot be held jointly). Both are accurate and
neither touches which account the RMD is drawn *from*. No surface asserts the pre-v5.35 sourcing.

**v5.34 · the basis tracker.** The render tree's 0%-gains explainer is correct and explicitly current:
it states the declared share is *"the opening position, not a permanent one: growth accrues as gain
from there, so sales in later years can still be taxed"* — the v5.34 behaviour, correctly described.
`METHODOLOGY.md` also carries the retraction of its own earlier statement. **This subject was handled
properly and is the counter-example** to S-3: v5.34 retracted what it falsified, v5.36 did not.

**v5.32 / v5.38 · ACA.** The manual's ACA entry names the sub-floor and its law-scenario scope, and
dates it (*"Through v5.31 the enhanced scenario applied no floor at all… v5.32 fixed that"*). The
conversion-funding passage correctly describes the appreciated-brokerage sale feeding realized gains
into MAGI for the two-year IRMAA lookback. Both current.

## 4. The headline result

**The delta sweep found what the v5.31 sweep predicted it would.** Its §5 said the method was built to
catch surfaces that fall behind the engines, and that the same method aimed at v5.30 would have caught
the Taxes-tab contradiction. Aimed at the v5.31 → v5.39 delta, it catches two — and **one of them is
its own S-1, which it had already found and which then widened while nobody was looking.**

That is the result worth recording. Not the two findings, which are Low and cheap to fix, but the
pattern: **an enumeration and a present-tense parenthetical, each written once, each falsified by a
later release, neither revisited.** Both fixes are one sentence. Both would have been prevented by the
same habit — when a release adds a term to an engine, grep the surfaces for the term it replaces.

**Direction of both findings is safe.** Neither shows a user a rosier plan; both understate what the
model actually does. For a tool whose identity is deliberate pessimism, that is the correct side to err
on, and it is why neither is above Low.

## 5. Scope — what this sweep did NOT do

Per the standing requirement, stated explicitly.

- **Not the 28-surface DOM capture.** Source string literals, not rendered text. See §2.1 — this is
  the material limitation and it makes a null result weaker than the v5.31 sweep's null result.
- **No engine was driven.** Findings compare claims to **engine expressions at named lines**. Nothing
  here is a measured output, and no figure in this document is a computed dollar amount.
- **No suite was run, no source edited, nothing built.** No version bump; v5.39 stands.
- **Delta subjects only.** The six releases' terms. Everything else rests on the v5.31 sweep.
- **`MissingFeatures.md` was not re-pinned.** D-2 is marked closed there with evidence; D-1 and
  D-3…D-8 were **not** re-verified against v5.39 and may have moved the same way D-2 did.
- **`validation/` untouched**, as in the v5.31 sweep.

## 6. Recommended next work

1. **Fix S-1 and S-3 together**, in one small docs release. Two sentences, no engine change, no
   modelling change — so `METHODOLOGY.md` needs the edit but not a modelling-release treatment.
   Shipping them together matters: a sweep that finds a second instance of a pattern and fixes only
   one is the weaker outcome.
2. **Add an extinction assertion** for the S-1 class. The suite could assert that the IRMAA tab's MAGI
   sentence names every term in Engine C's `magi` expression — a real guard, since the whole defect is
   the two drifting apart. This is a `qa/` change and needs its own scope.
3. **Re-pin `MissingFeatures.md`** against v5.39. D-2 was closed four releases before anyone noticed;
   the other items are pinned to the same stale build and carry the same risk.
4. **The top-five summary is unblocked** and both its stated blockers were already closed. It can be
   written now, drawing on all four documents plus this one.
