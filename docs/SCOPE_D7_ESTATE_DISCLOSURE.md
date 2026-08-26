# SCOPE — D-7: the estate figure discloses no estate or inheritance tax

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — BUILT AND SHIPPED AS v5.50 on 2026-08-26.** Do not build from this document; it is the record of what was decided, not live work. What actually shipped is in `CHANGELOG.md` under v5.50, and it differs from §3 below — see the RETIREMENT NOTE. *(Previously: all four decisions resolved, BUILDABLE.)* See §6 — D-2 was decided **against** the recommendation, deliberately; read its note before writing copy |
| Build | **v5.49** · `src/DangerClose.jsx` md5 `2ccc62b669f6ee52c6a0be1709c967a5` · repo `5f145f7` · premise verified against source 2026-08-26 |
| Parent | `MissingFeatures.md` D-7 (assessed at the v5.48 re-pin, 2026-08-25) |
| Kind | **Disclosure only.** No engine change. No figure moves. Parity 10/10 and the DOM diff's STRICT branch at 32 are the gate |
| Direction | ⚠ **Optimistic** — the modelled estate is larger than reality for affected households. This project treats optimistic as the wrong way to be wrong |

---

> ### ☑ RETIREMENT NOTE — added at the v5.50 ship, 2026-08-26
>
> **This scope was built. It is retired. Its §3 census was incomplete and is left uncorrected below
> as the record of what was believed at drafting.**
>
> **§3 listed two sites carrying `after-tax estate`. There were five.** The three it missed:
> **L9412**, the comparator description (`Ranked by ending after-tax estate`), which renders inside
> the *same bordered card* as the L9485 site §3 did list; the **objective list in the Field Manual**,
> where §3's site 4 said only "APPEND"; and **L9460**, the results-table **column header**
> (`After-tax estate`) — the heading directly above the ranked figure, and the most prominent of the
> five. The header was found only when the new DOM extinction check ran: the census greps in this
> document *and* in the build session were **case-sensitive**, and the header is capitalised.
>
> **The pattern worth carrying forward.** A census is a claim about absence, and absence is the one
> thing a table cannot show you. §3's rows were each individually correct; re-checking them would
> never have found the sites it omitted. **Re-resolve a census by re-running the search, not by
> confirming its entries** — and make the search case-insensitive.
>
> Two smaller corrections to this document: the Build row cites repo `5f145f7`, which had moved to
> `9b8dbe8` by the ship (source md5 identical — doc commits, not source drift); and the `DOCS_HTML`
> measurements in §3 are of the **whole source line**, not the string literal, which measures 21
> code points fewer. Both truthful; state which span, not just which unit.
>
> A scope status line is evidence of what was true when it was written, not of what is true now.


---

## 1. Premise — verified against v5.49 source this session, not carried from the audit

Per *if mid-build evidence contradicts the scope's premise, STOP and report*: every line below was
re-resolved at v5.49. The v5.48 addresses in `MissingFeatures.md` happen to be unchanged, because
v5.49's edits landed inside the single-line `DOCS_HTML` and on one existing line (L9973).

**1.1 · The estate figure contains no estate or inheritance tax of any kind.** L4251:

```js
estate: Math.round(taxBal + rothA + rothB + (tradA + tradB) * (1 - HEIR_RATE)),
```

`HEIR_RATE = 0.22` (L3689) is commented *"assumed heir tax on inherited Traditional"* — an **income**
tax on the beneficiary drawing down an inherited Traditional balance. It is not an estate tax, not an
inheritance tax, and it touches only the Traditional terms. Taxable and Roth balances pass through
whole.

**1.2 · That figure is the comparator's DEFAULT ranking objective.** L5386:
`const [rothSolveObj, setRothSolveObj] = useState("estate")`. A household that never touches the
objective selector is ranked on it.

**1.3 · ⚠ It is labelled "after-tax," which is the part that misleads.** L9518 sets
`noun: "after-tax estate"` and `label: "MAX AFTER-TAX ESTATE (leave the most behind)"`. L9485 tells
the user a strategy *"projects the largest after-tax estate."* **"After-tax" states that tax has been
accounted for.** For estate and inheritance tax it has not been, and the phrase is doing the opposite
of disclosure — it actively assures the reader of the thing that is untrue.

**1.4 · The only estate-limitation text in the app is gated to single households.** L10786–10789 sits
inside a `_tlS.single` branch and opens *"For a single person, the relevant end-of-life question is
the legacy / estate you leave…"* A **couple never renders it** — and couples are this app's primary
audience, the household type the comparator defaults to.

**1.5 · ⚠ `METHODOLOGY.md` says NOTHING about it either — this is worse than D-6 was.** Zero matches
for `estate tax` or `inheritance tax`. D-6 at least had a correct creator-side half and a missing
user-side half. **D-7 has neither half.** There is no document in this project stating that estate
tax is unmodelled.

**1.6 · The Field Manual is silent too.** In the raw `DOCS_HTML`: `estate tax` 0, `inheritance` 0.
(`heir` appears 13 times, all about heir income tax and Roth ordering — a different subject.)

### Why this is material rather than academic

**Checked against current sources 2026-08-26, not asserted from memory.** Twelve states plus DC levy
an estate tax (CT, HI, IL, ME, MD, MA, MN, NY, OR, RI, VT, WA + DC) and five levy an inheritance tax
(KY, MD, NE, NJ, PA). Several thresholds sit far below the federal exemption of **$15M** — Oregon
**$1M**, Massachusetts **$2M**, Washington ~**$2.19M**.

⚠ **The clinching example is a couple, which is exactly the household the disclosure is gated away
from.** Oregon's $1M exemption is **per person and has no spousal portability**: at the first death
the marital deduction applies, but at the second death the combined estate gets **one** $1M
exemption. A couple with a **$2.5M** combined estate may owe roughly **$205,000** in Oregon estate
tax with no planning — on an estate this app would display as "after-tax" with none of it deducted,
and would rank strategies by.

Two further points the copy may want. Oregon's $1M is **not indexed** and has not moved in over a
decade. New York applies a **cliff**: above 105% of its exemption the entire estate becomes taxable
from the first dollar — a structure this app already models elsewhere for IRMAA, so the concept is
not foreign to its audience.

⚠ **Figures change and sources disagree at the margins** (some list Massachusetts at $1M, pre-2023).
Whatever ships must carry the year and a "verify current figures" pointer — the pattern the app
already uses for IRMAA tiers. **The scope does not depend on any single threshold being exact**; it
depends on the thresholds being far below federal, which every source agrees on.

This is squarely inside the product boundary: a mainstream couple within sight of retirement, and a
correction to an output the app already produces.

---

## 2. What is explicitly OUT of scope

- **Modelling estate or inheritance tax.** Not proposed, not here, and arguably not ever inside a
  drawdown stress-tester — 18 jurisdictions, each with its own thresholds, exemptions, portability
  and rate ladders, all indexed differently. **Disclosing that it is unmodelled is the fix.**
- **Changing `HEIR_RATE`.** 0.22 is an assumption about heir *income* tax and is a separate question.
- **Changing the default objective away from `estate`.** That is a product-direction decision, not a
  correctness one, and it would move rankings.
- **Any engine change.** If a figure moves, the build has gone wrong and must stop.

---

## 3. Site census — verified at v5.49

| # | Site | Anchor | Change |
|---|---|---|---|
| 1 | **The objective label + noun**, L9518 | `MAX AFTER-TAX ESTATE (leave the most behind)` and `noun: "after-tax estate"` | **NARROW both** per D-1 → `MAX ESTATE AFTER HEIR INCOME TAX` / `estate after heir income tax` |
| 2 | **The winner sentence**, L9485 | `projects the largest after-tax estate` | **NARROW** — ⚠ this is **hard-coded literal JSX text**, NOT derived from the `noun`. Editing L9518 alone leaves this one saying "after-tax" |
| 3 | **Comparator note**, L9488 | begins `This is a deterministic comparison at a fixed` | **APPEND** the limitation clause — this note already carries the comparator's caveats |
| 4 | **Field Manual**, inside `DOCS_HTML` (L3593) | ⚠ anchor to be resolved **by content at build time**, never by index | **APPEND** to the strategy-comparator entry |
| 5 | **`METHODOLOGY.md`** | the limitations section | **ADD** — no estate/inheritance tax is modelled, and the direction is optimistic |
| 6 | Version ×4 | footer · DATA LOAD · callsign · manual footer | bump |

⚠ **`DOCS_HTML` discipline.** One line, and at v5.49 it measures **146,374 code points / 146,377
UTF-16 units / 147,515 bytes** — three truthful numbers; state which one you used. Locate it **by
length, not index**, and anchor **by content**. The v5.49 scope's anchor was read off the *rendered*
manual and did not exist in the source; the near-miss `cliff strategy` matched a different entry
entirely. See `SCOPE_D6_SSA44_USER_SIDE.md` §7.

---

## 4. Tests

**`t31` already covers this class** — it did not exist when D-6 was scoped and had to be built then.
This scope reuses it.

1. **Add `estate tax` to `t31`'s key set**, taking it from two keys to three. Per
   `SCOPE_D6_SSA44_USER_SIDE.md` §5 the key set widens only by scope; this is that scope. It stays
   small deliberately.
2. **The negative control must be re-proven.** Build the version bump **without** the clauses and run
   `t31` first: it must fail. A key added to a list that was already satisfied proves nothing.
3. ⚠ **`t31` alone is not sufficient here**, and this is the honest gap. It asserts a string appears
   on both surfaces. It cannot see that site 4's text is inside the *right* Field Manual entry, nor
   that a couple actually renders site 3. **Add a `t4_dom` assertion that the comparator note renders
   the clause with `single: false`** — the gate at L10786 is exactly the defect, so a test that only
   runs single households would reproduce it.
4. Version ×4 is asserted by `t1` STATIC; parity 10/10 and the DOM diff STRICT at 32 gate "no figure
   moved."

5. ⚠ **Nothing currently asserts the objective label at all.** Grepping `qa/` for `AFTER-TAX ESTATE`
   returns **zero hits**, so no suite would have caught this string being wrong, and none will catch
   the new one drifting. **Pin the narrowed label in `t1`'s STATIC block** alongside the version
   strings. This is the extinction invariant for D-1: without it, the label can silently revert to a
   claim the app cannot support, and the only thing standing between a user and that claim is
   nobody having edited the line.

6. ⚠ **The `noun` at L9518 feeds four render sites** (L9555, L9559, L9568, L9583) — the "Model's best
   cell" line, the how-to-read-a-card legend, and both per-card figures. Narrowing the noun fixes all
   four in one edit, but it also means **a careless noun edit changes five things at once**. Check all
   four render correctly, not just the objective selector.

---

## 5. What this fix does NOT achieve — state it in the release

The estate figure stays **wrong for affected households**; it becomes *disclosed* as wrong. A couple
in Oregon still sees an overstated estate and still gets a strategy ranked on it. This is the same
shape as D-8b's ACA sub-floor: the honest disclosure of a known simplification, not its removal.

---

## 6. Decisions for Steve — **build only after these are resolved**

### ✅ RESOLVED 2026-08-26 — all four

| # | Decision |
|---|---|
| **D-1** | ✅ **(b) NARROW the label** → `MAX ESTATE AFTER HEIR INCOME TAX`, noun → `estate after heir income tax`. The label carries its own limit, so the correction cannot be skipped by a reader who reads only the label — which, on a comparison table, is most of them. **The disclosure clause still ships**; what changes is that it explains rather than corrects. |
| **D-2** | ✅ **KEEP IT GENERAL — no state names, no thresholds.** ⚠ **Decided against the recommendation, and the reasoning is worth keeping:** a clause naming Oregon at $1M and Massachusetts at $2M is a clause that goes stale, and this project has spent three days repairing documents that went stale exactly that way. Oregon's SB 1511 was already pending as of mid-2026 and would move its threshold. A general clause is durable and needs no "verify current figures" pointer because it quotes no figure. |
| **D-3** | ✅ **One key — `estate tax`.** `t31`'s set goes from two to three, no further. |
| **D-4** | ✅ **v5.50.** |

⚠ **What D-2 forbids in the shipped copy.** §1's Oregon/Massachusetts figures and the $205,000 couple
example are **scope rationale, for deciding whether this was worth building. They must NOT appear in
the app.** The clause says that some states levy estate or inheritance tax at thresholds well below
the federal exemption, that the model applies none of them, and that the direction is optimistic —
without naming a state, a threshold, or a dollar figure. **A build session that copies §1's numbers
into the Field Manual has broken D-2.**

---

### The original D-1 framing, kept as the record of what was weighed

**D-1 · The "after-tax" label (L9518, L9485).**
The phrase asserts something untrue. Three options:
- **(a) Leave it, disclose beside it.** Smallest change; the label keeps saying "after-tax" while a
  clause nearby explains what that excludes.
- **(b) Narrow it** to `MAX ESTATE AFTER HEIR INCOME TAX` — accurate, self-limiting, no separate
  disclosure needed to prevent the misread. Longer, and changes a label users may recognise.
- **(c) Drop the qualifier** to `MAX ESTATE (leave the most behind)`, disclosing the rest in the note.
- **Recommendation: (b).** The label is the thing doing the misleading; a disclosure elsewhere asks
  the reader to correct a claim they have already accepted. (b) also survives someone reading only
  the label, which (a) and (c) do not. ⚠ It touches a user-facing string, so it is your call.

**D-2 · Does the Field Manual entry name specific states?**
Naming Oregon at $1M and Massachusetts at $2M makes it concrete, but the app models neither and the
thresholds change. **Recommendation: name them, with the year and "verify current figures"** — the
app already does exactly this for IRMAA tiers.

**D-3 · Does `t31`'s third key stay `estate tax`, or also `inheritance`?**
Five states levy inheritance rather than estate tax and the distinction is real.
**Recommendation: one key, `estate tax`.** Keep the set small; the copy can name both.

**D-4 · Version — v5.50?** Assumes nothing else ships first.

---

## 7. Risks

- **The `single`-gated card at L10786 is not the fix site.** It is correct for single households and
  should stay. Adding to it does nothing for couples. ⚠ The temptation is to edit the text that is
  already there.
- **Scope creep into modelling.** The moment anyone reaches for a state estate-tax table, stop: that
  is §2's boundary and a different product.
- **`t31` going green without the DOM assertion** would repeat the v5.47 lesson recorded in the
  manifest — *a fixture that cannot reach a behaviour makes every assertion about it vacuous.*
