# SCOPE — D-10: the Roth tab's IRMAA verdict discloses that its MAGI is narrower than Engine C's

| Field | Value |
|---|---|
| Status | ✅ **ALL THREE DECISIONS RESOLVED 2026-08-26. BUILDABLE.** |
| Build | **v5.51** · `src/DangerClose.jsx` md5 `3cf497b834e545ce29c1945fb99ae09a` · repo `9762121` · premise verified against source 2026-08-26 |
| Parent | `MissingFeatures.md` **D-10**, re-homed from the deleted `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` (its D4) |
| Kind | **Disclosure only.** No engine change. No figure moves. Parity 10/10 and DOM diff STRICT 32 are the gate |
| Direction | ⚠ **Optimistic** — the omitted terms understate MAGI, understate the IRMAA trigger, and flatter the plan |
| Target | **v5.52** |

---

## 1. Premise — verified against v5.51, by content

The app renders **two different IRMAA MAGI figures under one label**, and says nothing about it.

| | Line | Terms | Expression |
|---|---|---|---|
| **Engine C** | **L4459** | **7** | `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` |
| **Roth ladder** | **L8997** | **5** | `pension + spouseBWork + taxableSS + conv_y + rmd_y` |

Still missing from the ladder: **`div_y` (dividends)** and **`capGain_y` (realized capital gains)**.
`work_y` vs `spouseBWork` is narrower again. v5.41 closed the RMD term only — its own comment at
L8995–8996 says so: *"Engine C … has always carried its `rmdTax_y` term; this render block did not,
and the two disagreed."* **The two still disagree.**

The ladder renders a per-year verdict at **L9216** — `⚠ {year}` or **`✓ {year}`** — computed from
`triggersIrmaa` (L9028) against the narrow MAGI. `MEASUREMENT_roth_tab_magi_v5_40.md` measured the
consequence: on a taxable-heavy household, **8 of 8 ladder years render the wrong IRMAA verdict** —
a green tick where a surcharge is due. On the shipped example household the understatement is about
**$45,000** in each of the two years after RMDs begin, without changing the tier shown.

**Nothing in the app cues the difference.** Zero hits for any phrase describing it.

> ⚠ **D4's original question is already answered and must not be re-litigated.** It asked
> *"disclose now, or wait until it is measured?"* — it **has** been measured, and
> `MEASUREMENT_roth_tab_magi_v5_40.md` §6 states disclosure *"is now writable with a number and a
> caveat that is honest in both directions,"* then drafts it. **If a build finds itself re-asking
> whether to disclose, that is this line firing. Stop and report.**

## 2. Site census — verified at v5.51, case-insensitively

| # | Site | Change |
|---|---|---|
| 1 | **L9296** — the ladder footnote block, which already explains *"IRMAA: 2-year lookback. MFJ threshold ~$XK+ (indexed to the premium year)"* | **APPEND** the divergence clause. This is the fix site: it sits directly under the table whose `IRMAA?` column carries the verdict |
| 2 | **`DOCS_HTML` §13** limitations register | **APPEND** a bullet. Anchor on `No estate tax or inheritance tax is modeled` — **1 occurrence**, quote-free |
| 3 | **`METHODOLOGY.md`** | **EXPAND** — both expressions term by term, the measured consequence, the direction |

⚠ **`DOCS_HTML` is now line 3616, not 3593** — it moved when v5.51 added the `HEIR_RATE` comment
block. **Resolve it by content (`startswith("const DOCS_HTML")`), never by index.** This scope's own
census hit that trap once before catching it. It measures **147,887 code points** as the string
literal's contents — state which span, not just which unit.

**Not the fix site:** L9216's verdict cell is a single glyph in a table row; there is no room, and a
footnote two lines below is where the table's other mechanics are already explained.

## 3. Tests it ships with

- **`t4_dom`** with **`single: false`** — the clause renders for a couple, gated on a `!P.single`
  witness in the same block, so the assertion cannot go vacuous.
- **`t1` STATIC** — pin the clause and pin **both** MAGI expressions, so a future edit that silently
  reconciles or further diverges them fails loudly. Nothing currently asserts either expression.
- **`t31`** — a fifth key, so both user surfaces and `METHODOLOGY.md` must name it.
- **Negative control, mandatory.** Version bump without the copy → `t31` must **fail**. ⚠ Key on the
  **new phrasing**, not on `MAGI` or `IRMAA`: both already appear on both surfaces, so keying on the
  subject would pass before the fix exists. That is exactly how the v5.51 key was vacuous.

## 4. Explicitly out of scope

- **Fixing the divergence.** `SCOPE_FIX_roth_tab_div_capgain.md` (written 2026-08-21, target v5.42)
  already scopes it and is marked **NOT BUILDABLE — four decisions open, one load-bearing**. It was
  never built. Disclosure does not close it, and **this scope must not be read as closing D-10's
  modelling half.**
- The SS-cliff term at L8841–8844 — the measurement's priority 3, cheap, low urgency, untouched.
- Any engine change. If a figure moves, the build has gone wrong.

## 5. Decisions — resolved 2026-08-26

| # | Decision |
|---|---|
| **D-1** | **Disclose now; fix later as its own build.** Disclosure moves no figure and closes the "green tick where a surcharge is due" gap today; the fix has real plumbing cost and four unresolved decisions |
| **D-2** | **Qualitative in-app; numbers in `METHODOLOGY.md`.** A figure derived from one household goes stale and nothing in-app carries a date — the same call made for D-7 and D-9 |
| **D-3** | **Both surfaces** — the ladder footnote *and* the Field Manual §13 register |

## 6. What this does not fix — say so in the CHANGELOG

The Roth tab's IRMAA verdict **remains wrong** for taxable-heavy households; it is now *disclosed* as
approximate. A user can still read a green tick in a year a surcharge is due. That is the reason the
fix is scheduled rather than dismissed, and the CHANGELOG must not imply otherwise.
