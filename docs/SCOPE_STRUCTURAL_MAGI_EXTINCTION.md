# SCOPE — the structural extinction assertion for S-1 (Engine C's IRMAA MAGI)

| Field | Value |
|---|---|
| Status | **BUILT 2026-08-20.** D1–D3 decided 2026-08-20; applied and verified the same day. **D4 remains open** (§5). |
| Build | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · tree **`ffb8bd3`** |
| Asked for by | `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md` §6; carried in the v5.40 CHANGELOG as outstanding |
| Changes | **`qa/qa-baseline/t1_units.mjs` only.** No `src/`, no constant, no prose, no version bump. |
| New checks | **6**, taking t1 from 102 → **108** and the suite total from 1,344 → **1,350** — **confirmed at build from captured suite output**, not restated. |
| Built in this session? | **Yes, 2026-08-20.** Applied to `qa/qa-baseline/t1_units.mjs` (md5 `768e9fe22882babe6f262ca55282b2a8` → `5d205a18b18af683f4f7c71f824ee8ac`, a single 48-line insertion and no other change). NC1–NC5 re-run against reverted copies; full 22-suite baseline re-run both legs plus parity, **1,350 passed / 0 failed**, parity **9/9**. See the `Unreleased` CHANGELOG entry. |

---

## 1. What is being closed

v5.40 fixed **S-1** — the IRMAA tab described MAGI as five components while Engine C summed seven —
and pinned it with four **source-text** checks in t1's `if (V540)` block. They assert the corrected
sentence is present, names dividends and realized capital gains, and that the falsified enumeration is
gone.

**What they cannot see is the engine.** Add an eighth term to Engine C's `magi` tomorrow and all four
stay green, because none of them reads the expression the sentence is about. That is exactly how S-1
arrived **twice** in the same sentence. The structural assertion binds the two together, in both
directions, so a change on either side fails a test.

## 2. Premise, verified — including the part that failed

**Verified and holding — re-verified independently at build, 2026-08-20.** Engine C is
`function computeIrmaaPlan({...})` at **L4272**; its `magi` declarator at **L4399** sums exactly seven
terms:

⚠ **A third citation correction, this scope's own.** §2 above originally read **L4271** for
`computeIrmaaPlan`. The AST resolves the `FunctionDeclaration` to **L4272**; L4271 is the last line of
the preceding comment block. Off by one, non-substantive — the checks resolve by enclosing function and
never by line — but recorded rather than quietly corrected, since §2b records the same class of error
against another file.

```
ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y
```

The CHANGELOG's "seven" is confirmed. The sentence it describes is at **L9800**.

⚠ **Two premise corrections came out of verification.**

**(a) There are four `magi` declarators, and two are labelled for IRMAA.** AST-resolved:

| Line | Enclosing function | Terms | Count |
|---|---|---|---|
| L4033 | `runRothStrategies` → `run` | `grossOrd + qdcg` | 2 |
| **L4399** | **`computeIrmaaPlan`** (Engine C) — *this scope's target* | 7 terms as above | **7** |
| L4860 | `computeWithdrawalPlan` | `taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + othOrdDraw + conv_y + capGain_y` | 9 |
| **L8847** | **`DangerCloseMain` → the `activeTab === "roth"` block** | `pension + spouseBWork + taxableSS + conv_y` | **4** |

L8847's own comment reads `// MAGI (for IRMAA lookback)`, and it is live and on screen: compared to a
lookback threshold at **L8876** (`triggersIrmaa`), exported at **L8895**, rendered as a table cell
coloured `var(--crit)` when over threshold at **L9017**, and printed as `MAGI $XXXK` at **L9118**. So
the app shows the user **two different MAGI figures under the IRMAA label**. This is why D1 was decided
as it was, and it becomes its own item (§6).

**(b) `AUDIT_TOP_FIVE_SUMMARY.md` row 1 cites the wrong line for S-1.** It reads *"L9792 vs L4399
(S-1)"*. At v5.40, **L9792 is a bare `</div>`**; the S-1 sentence is at **L9800**. L4399 is correct.
Fix the citation when that file is next opened — it is a stale-by-8 line reference, not a substantive
error, and it is recorded here so it is not rediscovered.

## 3. Decisions — resolved 2026-08-20

| # | Decision | Resolution |
|---|---|---|
| **D1** | What does the assertion bind? | **B — L4399 now; L8847 measured separately.** The checks are named for **Engine C**, not for "IRMAA MAGI", so the test's name does not overstate its coverage. L8847 opens as §6. |
| **D2** | Exact term set, or a floor? | **Exact set.** A floor would let a new eighth term pass silently, which is the failure being closed. Accepted cost: this is a change-detector and adds a per-release tax (see §7). |
| **D3** | Which suite? | **`t1_units.mjs`.** It already parses the AST (its L33–35), already owns the v5.40 extinction block, and is **version-gated** — which an exact term set requires, since it would otherwise fail every prior leg. `t13` owns Engine C behaviourally but takes no version argument and cannot gate. |
| **D4** | Disclose L8847 while unmeasured? | **OPEN — see §5.** Does not block this build. |

**One refinement made during execution, not a reversal of D2.** The set comparison is
**order-insensitive** (both sides sorted before comparing). Reordering `a + b` to `b + a` changes
neither the arithmetic nor the sentence, so failing on it would be pure noise; membership and count
changes still fail. This was found by running the reorder as a negative control (§4, NC3) and watching
it fire when it should not have.

## 4. The checks, executed and negative-controlled

Six checks, to be added inside t1's existing `if (V540) { … }` block. **These were run against v5.40
and against five deliberately reverted builds before being written down** — v5.40's practice of proving
each new check fails before accepting it.

```js
    // ─── STRUCTURAL S-1 (scoped 2026-08-20) ───
    // The four EXT S-1 checks above are source-text: they prove the SENTENCE is right and cannot see
    // the ENGINE. S-1 arrived twice by the engine gaining a term while the prose stood still, so
    // these bind the two together in both directions. Scoped to Engine C only — computeIrmaaPlan —
    // because a second, four-term MAGI at L8847 also reaches the screen under the IRMAA label and is
    // deliberately NOT covered here (see SCOPE_STRUCTURAL_MAGI_EXTINCTION.md §6).
    //
    // acorn-walk cannot walk this file (it throws on the first JSXElement), so the walk is manual.
    // Resolution is by ENCLOSING FUNCTION, never by line number, so a reflow cannot move the target.
    const _findNode = (root, pred) => {
      let hit = null;
      (function w(n) {
        if (hit || !n || typeof n !== "object") return;
        if (Array.isArray(n)) { for (const c of n) { w(c); if (hit) return; } return; }
        if (typeof n.type === "string" && pred(n)) { hit = n; return; }
        for (const k in n) { if (k === "start" || k === "end" || k === "loc") continue; w(n[k]); if (hit) return; }
      })(root);
      return hit;
    };
    const _addTerms = (e) => {
      const out = [];
      (function f(x) {
        if (x.type === "BinaryExpression" && x.operator === "+") { f(x.left); f(x.right); }
        else out.push(SRC.slice(x.start, x.end));
      })(e);
      return out;
    };

    const _engineC = _findNode(AST, n => n.type === "FunctionDeclaration" && n.id && n.id.name === "computeIrmaaPlan");
    T("STRUCT S-1: Engine C computeIrmaaPlan resolves in the AST", !!_engineC);
    const _magiC = _engineC && _findNode(_engineC.body, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "magi");
    T("STRUCT S-1: Engine C declares magi", !!_magiC);

    const _terms = _magiC ? _addTerms(_magiC.init) : [];
    const _EXPECT = ["ssTaxable", "pen_y", "work_y", "rmdTax_y", "conv_y", "div_y", "capGain_y"];
    T(`STRUCT S-1: Engine C magi sums exactly ${_EXPECT.length} terms`, _terms.length === _EXPECT.length, _terms.join(" + "));
    T("STRUCT S-1: Engine C magi term set is exactly the registered set (order-insensitive)",
      _terms.length === _EXPECT.length &&
      JSON.stringify([..._terms].sort()) === JSON.stringify([..._EXPECT].sort()), _terms.join(" + "));

    // Bidirectional: the two terms that historically falsified the prose must be in the ENGINE and
    // named in the SENTENCE. Removing either from either side fails.
    const _magiSentenceStruct = (SRC.match(/MAGI here is[^<]*/) || [""])[0];
    T("STRUCT S-1: div_y is in the engine AND dividends is in the sentence",
      _terms.includes("div_y") && /dividends/.test(_magiSentenceStruct));
    T("STRUCT S-1: capGain_y is in the engine AND realized capital gains is in the sentence",
      _terms.includes("capGain_y") && /realized capital gains/.test(_magiSentenceStruct));
```

**Negative controls — all five executed against v5.40, results as shown:**

| # | Revert applied | Expected | Observed |
|---|---|---|---|
| NC1 | Add an 8th term (`+ dummy_y`) to L4399 — **the exact defect class being closed** | fail | **2 checks fail** ✅ |
| NC2 | Remove `div_y` from L4399 | fail | **3 checks fail** ✅ |
| NC3 | Reorder two terms (`rmdTax_y + conv_y` → `conv_y + rmdTax_y`) | **pass** — semantically harmless | **6/6 pass** ✅ |
| NC4 | Strip *"including dividends and realized capital gains"* from L9800 | fail | **2 checks fail** ✅ |
| NC5 | Rename a term (`work_y` → `earned_y`) | fail | **1 check fails** ✅ |

NC3 is the one that changed the design: on an order-*sensitive* comparison it failed, which would have
shipped a check that fires on edits needing no response.

✅ **Re-run at build, 2026-08-20 — the table reproduces, with one reading made explicit.** NC1 2,
NC2 3, NC3 0, NC5 1, all exactly as above. **NC4 fails 4 checks in the whole suite, not 2**: the two
new STRUCT checks *plus* the two v5.40 source-text checks (`names dividends`, `names realized capital
gains`), which the same revert also breaks. The table's counts are **failures among the six new
checks**; every other row happens to have no overlap with the older checks, so the two readings
coincide there and diverge only at NC4. That is stronger coverage than the row claimed, not weaker —
but the row was ambiguous and is now disambiguated.

## 5. D4 — still open, and it is yours

**The app shows two MAGI figures under one IRMAA label with no cue that they are computed differently.**
Options: say nothing until L8847 is measured; or add a line to Field Manual §13 now.

**No recommendation offered.** It turns on whether you want an *unmeasured* divergence disclosed, which
is a product-voice call about the app's contract with its user, not a technical one. It does not block
this build. If the answer is "disclose," that is a `src/` change and therefore a different scope with a
version bump.

## 6. The item this scope opens rather than closes — L8847

**Not a finding. A thing to measure.** The four-term MAGI in the Roth tab omits RMDs, dividends,
realized capital gains, and spouse A's earned income relative to Engine C's seven.

- **Not claimed to be a defect.** The Roth ladder is a self-contained projection with its own
  documented history and may be deliberately simplified. **No arithmetic was run against it.**
- **Not claimed to be new.** It may predate v5.40 by many releases. Not established either way.
- **Direction is a hypothesis, not a measurement.** Omitting income terms would *understate* MAGI,
  understate the IRMAA trigger, and therefore **flatter the plan** — the non-conservative direction, in
  a tool whose identity is deliberate pessimism. **That is a reason to measure it, not a finding.**

**What measuring it looks like:** one household, hand-computed MAGI from primary-source rules, compared
to both the Roth tab's rendered figure and Engine C's to the dollar. Section C standard — arithmetic,
not inspection.

This is the duplicated-expression-drifting-apart class `qa/tools/diverge.cjs` exists for (OPERATIONS
§B1), and it was found by an AST walk during premise verification.

## 7. Costs and risks, stated

- **A per-release maintenance tax, accepted knowingly.** The exact-set check fires on *any* membership
  change to Engine C's `magi`, including legitimate ones. That is the tripwire working — but it is one
  more thing to hand-service, in a suite where E-7 already measures 433 version comparisons with 35
  needing a clause each release. **This adds exactly one more version-gated site**, which is worth
  naming rather than absorbing quietly.
- **The registered term set is a fact about v5.40 and must be version-gated.** It lives inside
  `if (V540)`; a future build that legitimately changes `magi` registers a new expected set for its own
  tag rather than editing v5.40's.
- **Coverage is narrower than "IRMAA MAGI."** By design (D1). The check names say Engine C.

## 8. Out of scope

- Any change to `src/DangerClose.jsx` — no engine, no constant, no prose, no version bump, so the four
  in-app version sites and t1's STATIC checks are untouched.
- **Measuring L8847** (§6) — named, deliberately not measured.
- Fixing `AUDIT_TOP_FIVE_SUMMARY.md`'s L9792 citation (§2b) — record it, fix it when that file next
  opens.
- Real small-screen verification of F-2/F-6/F-8, still outstanding from v5.40.
- E-7's version-ladder registry, which this adds one site to.

## 9. Build checklist for whoever picks this up

1. §A freshness check first — clone-and-diff pool against the committed tree. It was clean at
   2026-08-20 (75 of 77 matching, the two exceptions being the retained prior source and
   `README-FIRST.md`).
2. Stand up the run folder and build `app_v540.mjs`; t1 takes a version argument (`node t1_units.mjs v540`).
3. Apply §4's block inside the existing `if (V540)`. **No new version tag**, so no `KNOWN_VERSIONS` edit.
4. Re-run NC1–NC5 against reverted copies and confirm the table in §4 reproduces.
5. Run the **full** suite, both legs plus parity. **Compute every total from captured output** — the
   102 → 108 and 1,344 → 1,350 figures above are provisional and must not be restated from this file.
6. CHANGELOG: a `qa/`-only entry. No version bump, so no release; it rides with the next one.
