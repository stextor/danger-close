# SCOPE — D-22 batch 1 · the thirteen flat-rate states, read for TY2026 (v5.99)

**FULFILLED — shipped as v5.99 (2026-10-09).** Repo-only. §7 is the build record. D-22 itself stays open for 27 rows.

*(Superseded status line, retained:)* **READY — 2026-10-09.** Steve: "Let's continue with D-22" (2026-10-09). Under his standing instruction every decision below carries a recommendation
the build takes and records. **A MODELLING release** (METHODOLOGY updated). D-22 stays open for the progressive-rate states (§4).

## 0 · Premise (verified against v5.98, not assumed)

Freshness: repo `24ef3af`, full clone; source `240f5ae6e56bd5d5662891ceec60fbbb` = repo = pool (hashed through the Projects tool, 2026-10-09);
built `11518a499200afb433f11bcb23a2317b`. Pool 126 (Projects listing).

**Why these thirteen first.** Their tax is a single rate (Mississippi and Ohio with a zero band below it), so the model's one rate can be checked
against the law exactly; the progressive states need a convention decision first (§4). Read at primary sources on 2026-10-09 (a helper read all
thirteen; the three that move were re-read in this session):

| State | Model | TY2026 law | Source read | Verdict |
|---|---|---|---|---|
| AZ | 2.5 % | 2.5 % | A.R.S. §43-1011(A)(9) (legislative summaries of SB1318 2025, HB2636 2026) | match |
| CO | 4.4 % | 4.4 % — no TABOR reduction for 2026 | Colorado DOR guide; Legislative Council forecast, Sept 2026 (Controller: revenue $175.9M under the cap) | match |
| ID | 5.695 % | **5.3 %** | Idaho Code §63-3024(2)(a), am. 2025 ch. 13 (HB 40) — re-read this session | **moves** |
| IL | 4.95 % | 4.95 % | Illinois DOR rates page | match |
| IN | 3.0 % | **2.95 %** (2.90 % in 2027) | Indiana DOR rates page — re-read this session; IC 6-3-2-1(b) | **moves** |
| IA | 3.8 % | 3.8 % | Iowa Code §422.5(1)(a); IDR release 21 Oct 2025 | match |
| LA | 3 % | 3 % | R.S. 47:32(A) (2024 3rd Ex. Sess. Act 11); LDR RIB 25-012 | match |
| MA | 5 % | 5 % (+4 % surtax above $1,107,750, TY2026) | Massachusetts DOR rates page | match |
| MI | 4.25 % | 4.25 % | Treasury notice, 15 April 2026 (MCL 206.51 trigger not met) | match |
| MS | 4 % | 4 % above the first $10,000 (3.75 % in 2027) | HB 1 (2025) as sent to the Governor, Miss. Code §27-7-5; DOR table (its own 4.4 % line is stale) | match |
| NC | 3.99 % | 3.99 % (3.49 % from 2027, S.L. 2026-41) | NCDOR rate schedules; Fiscal Research note on SB 257 v7 | match |
| OH | 3.1 % | **$332 + 2.75 % above $26,050** | R.C. 5747.02(A)(3)(c), am. HB 96 (2025), eff. 30 Sept 2025 — re-read this session | **moves** |
| PA | 3.07 % | 3.07 % | Pennsylvania DOR rates page | match |

**Direction:** all three moves lower modelled tax — the old rates were stale, conservative. Correct beats conservative (Kentucky v5.57; D-22 v5.97).

## 1 · Decisions (taken on recommendation)

- **D22-8 — Ohio keeps a flat rate, the top one** (as Oklahoma at v5.97): 2.75 % on all taxable income overstates the law by exactly
  0.0275 × $26,050 − $332 = **$384.38** a year above $26,050 (and by 2.75 % of income below it). Disclosed in the note.
- **D22-9 — zero bands are taxed here** (Ohio, Mississippi's first $10,000, Idaho's small indexed band), each disclosed as conservative.
- **D22-10 — the reading is recorded in all thirteen notes** (rate, tax year, act or source), so `t61`'s guard that a note's stated rate equals the
  row's rate covers them; `t61`'s expected set widens for v5.99.
- **D22-11 — scheduled later cuts are not applied** (Indiana 2027, Mississippi 2027, North Carolina 2027), said in each note.
- Out of the notes: Massachusetts' surtax (very high incomes) stays unmodelled, now with its TY2026 threshold named.

## 2 · Site census

Source: the thirteen `STATE_RULES` rows (three rates, thirteen notes) and the four version sites. Suite: an AST census of literals found no pin of
the three old rates; figures derived from them, if any, are found by the run and gated per build.

## 3 · Tests

New suite **`t63_flat_rates.mjs`** (both legs): the thirteen rates per leg; each note states its rate (v5.99); hand cases for ID, IN and OH to the
cent; Ohio's overstatement recomputed from the statute's formula; a v5.98 → v5.99 comparison — the calculator moves only in ID, IN and OH and there
by exactly the rate ratio; Engine B moves only those rows' state-tax fields, never up; Engines C and D byte-identical; Engine A never rises.
Controls `qa/tools/controls_v599_flat_rates.py` (repo-only).

## 4 · Out of scope — and the decision the next batch needs

The 27 other nonzero rates. **Most are progressive, and the table mixes conventions**: some rows hold the top rate (OK, OH from now), some a
"mid-range effective" rate (CA 6 %, OR 8 %, DC), some a middle bracket. Re-reading them needs one convention first — the next scope asks Steve.

## 5 · Stop conditions

Any jurisdiction other than ID, IN, OH moves; Engine A rises anywhere; MC parity moves (its state key is Georgia's).

## 7 · Build record (v5.99, 2026-10-09)

- **Source** `8c02876e4841e638a1a83425314586f4` (17 edits: thirteen rows — three rates, thirteen notes — and four version sites). **Built** `8047df4c66caab74d43ec42541f65d3d` (v5.98 rebuilt byte-identical first;
  `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — only ID, IN, OH move (by exactly the rate ratio); Engine A never rises; MC parity 10/10 with no declared diff.
- **`t63`** 18 (v5.99) / 6 (v5.98). **Controls 7 of 7.** Registration found no manual site (v5.98's array form held).
- **Sources:** a helper read all thirteen at primary sources; the three that move were re-read in the session (Idaho Code §63-3024 on legislature.idaho.gov;
  the Indiana DOR rates page; R.C. 5747.02 on codes.ohio.gov). Not read directly, agency pages cited instead: the statutes for IL, PA, MA and CO's base rate;
  North Carolina's S.L. 2026-41 schedule rests on the General Assembly's fiscal note.
- **Suite:** 5,302 app checks, 62 suites, 0 failed, 0 DIED; GRAND 5,432. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v598 v599 from a full clone of 24ef3af with the github/ files overlaid (v5.98 resolved from history, commit 9945d3c), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5210, half B GRAND 222; none DIED.
