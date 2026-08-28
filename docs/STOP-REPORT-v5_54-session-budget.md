# STOP-REPORT — v5.54 halted mid-build on session budget, 2026-08-28

| Field | Value |
|---|---|
| Base build | **v5.53** · source `12a007ed8e57a391acba67b799eb5a2f` · tree `abca6b2` |
| Working source | **`7f42dbf98125ce1425fdabe968b92c96`** — ⚠ **NOT VERIFIED. MUST NOT SHIP.** |
| Governing scope | `docs/SCOPE_v5_54_STATE_DISCLOSURE.md` — §6 decisions **RESOLVED**, see §1 |
| Reason for stopping | Session budget, against a cost the scope underestimated by ~60× — see §3 |
| Shipped by this package | **This report only.** No source, no suite file, no version bump |

**v5.53 remains current and is untouched.** Nothing in this package changes the app.

---

## 0 · Read this first

The source edits below are **complete and correct as far as they go**, and the JSX parses. They have
**not been through the suite**, `index.html` has not been rebuilt, and `smoke_built` has not run.
Under §L that means they are not shippable, and the working file is carried in `workbench/`
deliberately **outside** `github/` and `knowledge/` so it cannot be uploaded by reflex.

⚠ **Do not upload `workbench/` to anything.** It is the session's working tree, preserved so the next
session starts from verified state instead of rediscovering it.

## 1 · Decisions resolved — scope §6

All four were resolved and applied. Two were **amended** from the scope's own recommendation after
working them as copy rather than as findings; the amendments are the reason this build was worth
starting.

| | Resolution |
|---|---|
| **D-a** notes | **Accepted with two amendments.** Statutory figures are **DATED** (`$40,600 (2026)`, `$48,216 (2025, indexed)`) because both are indexed annually and an undated figure is a fresh staleness liability — the `OPERATIONS.md` §E failure this project corrected the same day. `— overstates it` → `— overstates the exclusion`, because the antecedent was ambiguous and the two readings mean opposite things to a worried user |
| **D-b** clause | **Accepted and WIDENED.** The scope reworded only the exclusion clause. The caption's *other* generated clause has the same defect: `ss ? " · partially taxes SS" : " · SS not taxed"` tells a Colorado user *"partially taxes SS"* (CO carries `ss: 0.5`) while CO fully exempts federally-taxed SS at 65+. Fixed once at the caption head — `Model (2026 approx): …` — which covers every generated clause including any added later |
| **D-c** METHODOLOGY | **Accepted, method changed.** The scope said mark which states are verified. That is a claim that expires. §6 now **routes** to `AUDIT_STATE_EXCL65_NOTES.md`, which is dated and owns coverage |
| **D-d** version | **Confirmed: v5.54, and it is a bump.** Four in-app sites |

⚠ **Why the figures were nearly dropped, and the check that stopped it.** Removing MD's and ME's
dollar figures would have broken **`t10` §2E L467**, which asserts that every state with `excl65 > 0`
names a dollar figure in its note. Dating them keeps that check green *and* honest. Worth knowing
before anyone "simplifies" the notes.

## 2 · What is built — all applied, all parsing, none verified

**`src/DangerClose.jsx`** (6 content edits + 4 version sites + Field Manual):

- Caption head → `Model (2026 approx): … effective rate` (D-b).
- Standing caveat appended, **carrying no count** by decision — a count would be true today and
  stale at the next audit.
- Four notes rewritten: **CO L1034 · ME L1048 · MD L1049 · NJ L1059** (line numbers as at v5.53;
  re-resolve, they move).
- Four version sites → v5.54: DATA LOAD header, footer, Field Manual callsign, Field Manual footer.
  ⚠ Two other `v5.53` occurrences are **not** version sites — a code comment at L8859 and prose
  *about* v5.53 inside `DOCS_HTML` at col 121231. Do not bump those.
- Field Manual **§13** gains the SS-offset disclosure, placed with a quote-free anchor inside the
  150,103-character `DOCS_HTML` line.

**`METHODOLOGY.md` §6** — NJ corrected to a household cap at 62+, the SS-offset class added to *Not
modeled*, the MD/ME stale-amount note added, and the routing pointer to the audit.

**`qa/t31_disclosure_parity.mjs`** — new key `reduced by Social Security`, `since: "v554"`, with its
rationale recorded in full. **Measured before any copy was written:** that phrase, `Social Security
offset` and `offset by Social Security` all returned **0 hits in `METHODOLOGY.md` and 0 in source**,
so the key cannot pass before the fix exists. After the edits it is **1 in `METHODOLOGY.md`, 3 in
source**. `KNOWN_VERSIONS`, `POST` and `ORDER` all rolled.

⚠ **The key takes no `until`, deliberately.** Unlike v5.52's key, this sentence does not expire when
a modelling fix lands: it states what the model does *not* do, so it stays true until the offset is
actually modelled. **The release that models it must INVERT this key, not expire it.**

**All 14 `KNOWN_VERSIONS` registries** rolled to `v554` (t1, t3, t4, t5, t6, t23–t32).

## 3 · Why this stopped — and it is a scope defect, not just a budget one

The scope's §4 site census said the suite cost was *"`qa/t31_disclosure_parity.mjs` — one key;
`ORDER` gains `v554`."*

**Measured during the build: 62 version-gate expressions across the suite name `VER === "v553"`**,
spread over t1 (18), t4 (21), t5 (3), t6 (2), t23–t28 (11) and the rest. Each encodes which builds an
expectation is true for.

**They cannot be extended mechanically, and that is the whole problem.** A blind
`"v553"` → `"v553" || "v554"` transform asserts v5.53's expectations for v5.54 — correct for most
gates and **wrong for every gate covering copy this release changes**. `t4` walks the DOM, the state
selector is in the DOM, and the state selector is exactly what v5.54 rewrites. Extending those gates
without reading them is the v5.27 defect that OPERATIONS §B2 exists to prevent, applied 62 times.

So the remaining work is 62 individual judgements, not a script. The scope was wrong by roughly a
factor of sixty about the cost of a version bump in this suite, and **no document in this project
records that cost anywhere** — which is why the scope could be written without it.

> **The finding worth keeping:** a version bump is priced in this project as *"four in-app sites"*.
> That is the **source** cost. The **suite** cost is 62 gated expressions and 14 registries, and
> nothing said so. Every previous bump paid it and none recorded it.

**Second, smaller finding.** `t31` has **three** version lists — `KNOWN_VERSIONS` (L50), `POST`
(L199) and `ORDER` (L206). The scope named one. Its fail-closed guard caught the omission on the
first run, which is it working exactly as designed.

## 4 · What remains

1. **The 62 gates, decided individually.** Start with `t4`'s 21 — they are the ones most likely to
   cover changed copy. For each, ask what the assertion claims and whether v5.54 makes it false.
2. **`t1`'s STATIC version strings.** They read a `verStr` variable (L231, L235) rather than a
   literal, so they *should* follow the bump automatically. **Confirm it; do not assume it.**
3. **Full suite, both legs**, v553 → v554. Parity must stay **10/10** — a disclosure release that
   moves an engine fingerprint has overreached.
4. **Rebuild `index.html`** (§N) and run **`smoke_built`** against it with the artifact path as
   `argv[2]`.
5. **Package** per §L, `package_check` on the zip.
6. **At the ship:** retire `SCOPE_v5_54_STATE_DISCLOSURE.md`, delete its `package_check` OPEN-allowlist
   entry in the same edit, and **delete this report from the pool** — it is a handover, not history.

⚠ **`t4` and the DOM diff will move legitimately**, because items D-a and D-b change rendered text.
A moved figure *there* is expected; a moved figure anywhere else is not. And the DOM diff's ±$500
render ceiling means it cannot see this release at all — a STRICT "nothing moved" reading is not
evidence of correctness here. **`t31` is the witness.**

## 5 · Run-folder state

`/tmp/run` holds a working v554 leg built from the working source: `app_v554.mjs`, `dom_v554.cjs`,
`dom_entry_v554.jsx` (generated from `dom_entry_v553.jsx`). It does **not** survive the session and is
recorded only so the next session knows the shape rather than deriving it.

⚠ **The v553 leg's `dom_entry_v554.jsx` was generated by `sed 's/v553/v554/g'`.** That worked, but it
is a derived artifact and should be read before it is trusted — this project has four recorded
instances of a derived artifact mistaken for a primary source.

## 6 · A process note this is the eighth instance of

`package_check` still accepts only `KIND: app-release|ops` and fails closed. **This package is
neither** — it is a handover, and it is riding in the `ops` shape with a `workbench/` folder that no
check inspects, because no better mode exists. Work has now crossed a session boundary eight times
with no supported mode. Recorded again rather than worked around silently.
