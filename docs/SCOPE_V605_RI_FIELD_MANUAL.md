# SCOPE — v6.05 · the Field Manual's income-limited exclusions (E-29 (e)) and METHODOLOGY's stale lines (E-29 (f))

**FULFILLED — shipped as v6.05 (2026-10-12).** Repo-only. §6 is the build record. E-29 (d), (e), (f) and (k) close.

*(Superseded status line, retained:)* **READY — 2026-10-12.** Repo-only. A TEXT-ONLY release: no figure moves, no engine or table changes. Decisions are taken (§5); the build follows directly.
**Stop only where §4's conditions fire.**

## 0 · Premise (verified against v6.04 this session, not assumed)

Freshness (OPERATIONS §A): repo `16dcba4` = `origin/main`, full clone; source `8226b20b62334074606993d411bb0fb1` in the clone and in the pool
(the pool copy hashed after `project_read`); the manifest names the same hash. No suite or harness file has changed since v6.04 shipped
(`git diff --stat a6bc77a HEAD` lists documents and three tools only, all verified in the pool after the 2026-10-11 ops uploads).

### 0.1 · What the Field Manual says (AST: `DOCS_HTML` is one double-quoted string of 156,591 characters; tags stripped, split into sentences)

Two sentences count and list the exclusions known to be income-limited in law:

1. Taxes tab entry: *"…and the **five** state exclusions known to be income-limited in law are conditioned on an approximate income measure — verify your state."*
2. Field Manual changelog/limits: *"…conditions the **five** exclusions known to be income-limited in law on an income measure (Connecticut at v5.65, New Mexico at
   v5.66, New Jersey at v5.67, Virginia at v5.68 and Rhode Island at v5.69, whose $50,000 pension/401k exclusion is lost entirely at its AGI cliff
   **but is still applied to IRA money the statute does not cover**)…"*

These are the two Rhode Island sentences v5.69 rewrote and asked Steve to read (E-29 (e)). Both are now false in two ways:

- **The count.** `STATE_RULES` evaluated by AST: `incomeLimitedInLaw: true` on **CT ME NJ NM RI VA** (six), and `exclTest` on the same six. Git history,
  same parser: Maine gained `incomeLimitedInLaw` at **v5.72** (`e29a741`, "Maine joins the income-limited list") and its `exclTest` at **v5.73**
  (`7220b96`). The Field Manual's own sentence elsewhere says *"Maine's income phaseout is modelled from v5.73"*, so the manual contradicts itself.
- **The IRA clause.** From v5.95 (D-12 Phase 3) Rhode Island's exclusion reaches only each qualifying person's own pension, annuity and employer-plan
  income. AST census of `stateTaxAnnual` calls: **three**, in `stateC`, `state` and `stateTax`, and **all three pass `byPerson`** — so every in-app
  figure takes the per-person, per-plan-type path. Through the v6.04 calculator (`r604f` run folder): a 70/70 couple with $30,000 IRA (A) and $30,000
  401(k) (B) leaves a Rhode Island base of **$30,000** (the IRA stays taxable); 70/60 with $30,000 of 401(k) each leaves **$30,000** (B is under 67);
  without `byPerson` the household path excludes all $60,000 (base **$0**) — reachable only by direct callers, not the app.

`t35` RI-7 asserts the false wording on every leg from v5.69 (`/Rhode Island at v5\.69/` and `/still applied to IRA money/i`): an OPERATIONS §B2
disclosure LOCK. It is why the sentence survived v5.95.

### 0.2 · What METHODOLOGY says (a prose document; read, not censused)

- **(f)** L285: *"Thirteen of the nineteen exclusion states remain unverified, so more thresholds may differ from 65 than are modelled here."* — directly
  before its own v5.86 update saying D-18 read every exclusion state's figure against a primary source.
- L148–150: *"Five states condition their exclusion on income in law — New Mexico, Rhode Island, Virginia, New Jersey and Connecticut."* — Maine is the
  sixth (above); §11 has *Maine's phaseout and Montana's corrections (v5.73)*.
- L247–251 (the v5.69 Rhode Island paragraph): *"Four things remain unmodelled…: IRA distributions…; the cap of each person's $50,000…, and the rule that
  only a spouse at full retirement age counts…; and dividend and interest income"* — the first three are modelled from v5.95 (the calculator probe above;
  METHODOLOGY's own v5.95 D-12 note).
- L338, the *Not modeled* list: *"Rhode Island's IRA distinction and per-person cap"* — modelled from v5.95; and its conditioned-state list stops at five.

The last three were found while scoping (e) and (f); they are the same staleness in the same document, so they ride along (§5, DD-4).

### 0.3 · Found at the ship's §I re-read (a case-insensitive search of the tree for each phrasing this release retires)

The Field Manual carries METHODOLOGY's (f) sentence too, in its state-age paragraph (parser, tags stripped): *"One threshold remains deliberately NOT applied:
South Carolina's under-65 tier, which is a second amount rather than an earlier start. Both are stated in their own state notes. Thirteen of the nineteen
states remain unverified, so more thresholds may differ from 65 than are modelled here."* Against the v6.04 table (AST): Georgia's note says *"the law's
$35K at 62–64 is not modelled (conservative)"* (since v5.87), so two lower tiers are unapplied, not one; *"Both"* names one thing; and Arkansas's and New
York's notes say the model applies them *"from 65, although the law allows it from 59½"* — the two D-18 found (v5.86). No suite literal reads the paragraph
(literal census: no change of outcome), so nothing locked it and nothing pinned it. Same staleness, same release: S-4 (DD-4).

## 1 · The change

**Source** (`src/DangerClose.jsx`, inside `DOCS_HTML`, quote-free anchors, each occurring once):

| | Old | New |
|---|---|---|
| S-1 | `and the five state exclusions known to be income-limited in law` | `and the six state exclusions known to be income-limited in law` |
| S-2 | `conditions the five exclusions known to be income-limited in law on an income measure (Connecticut at v5.65, New Mexico at v5.66, New Jersey at v5.67, Virginia at v5.68 and Rhode Island at v5.69, whose $50,000 pension/401k exclusion is lost entirely at its AGI cliff but is still applied to IRA money the statute does not cover)` | `conditions the six exclusions known to be income-limited in law on an income measure (Connecticut at v5.65, New Mexico at v5.66, New Jersey at v5.67, Virginia at v5.68, Rhode Island at v5.69 and Maine at v5.73; Rhode Island's $50,000 pension/401k exclusion is lost entirely at its AGI cliff and, from v5.95, reaches only each person's own pension, annuity and employer-plan income — never IRA money, which the statute does not cover)` |
| S-4 | `One threshold remains deliberately NOT applied: South Carolina's under-65 tier, which is a second amount rather than an earlier start. Both are stated in their own state notes. Thirteen of the nineteen states remain unverified, so more thresholds may differ from 65 than are modelled here.` | `Two thresholds remain deliberately NOT applied, each a second, smaller amount rather than an earlier start: South Carolina's under-65 tier and Georgia's $35,000 at 62–64 (conservative). Since v5.86 every exclusion state's figure has been read against a primary source: two start earlier in law than the model applies — Arkansas (IRAs from 59½, employer plans at any age) and New York (59½) — and both are applied from 65, which overstates their tax (conservative). Each is stated in its own state note.` |
| S-3 | the four version sites | v6.04 → v6.05 |

**METHODOLOGY.md** — M-1 annotates L148 (Maine the sixth, from v5.72/v5.73); M-2 annotates the v5.69 paragraph (the first three modelled from v5.95, the
fourth stands); M-3 rewrites the L285 sentence and records the correction in place; M-4 moves L338's Rhode Island item to what is still unmodelled
(the dividend and interest income its AGI measure omits) and adds Maine to the conditioned list. Each correction is annotated where it stands, the
file's convention, so the old claim and its correction stay visible together.

**Registers.** `ARCHITECTUREIssues.md` E-29: (d) CLOSED by decision, (e) and (f) FIXED v6.05, (k) CLOSED by decision; its census row and count.

## 2 · Site census

- Source strings (`strwalk.cjs`, every string-bearing node, case-insensitive): *income-limited* — 6 nodes, 2 of them the `DOCS_HTML` sentences above (the
  other four are state notes, unchanged); *IRA money* — 2, one is S-2, the other an unrelated v5.x Roth-tab sentence; *five* — 11, two are S-1/S-2.
- Suite: every string, template and regex literal in `qa/` evaluated against the old and new source and METHODOLOGY (`literal_census.cjs`, §B1a) —
  run after staging; result in §6. Expected: `t35` RI-7's `/still applied to IRA money/i` changes outcome, nothing else.

## 3 · Tests (`t35`, both legs)

- **Current leg (`_vt >= 605`)** — RI-5 and RI-6 unchanged; **RI-7** asserts the new wording (Rhode Island at v5.69, Maine at v5.73, *never IRA money*);
  **RI-8** (extinction) the IRA over-grant sentence is gone; **RI-9** (extinction) every Field Manual count of *exclusions known to be income-limited
  in law* equals the number of `STATE_RULES` rows with `incomeLimitedInLaw: true`, as a word, with at least one count found (anti-vacuity) — so the
  next state added to the table fails until the manual is changed; **RI-10** every state with an `exclTest` is named in the list as *Name at v…*.
- **`t52` (current leg only, as it runs)** — **F-1** (extinction) the Field Manual no longer says thirteen of the nineteen states remain unverified;
  **F-2** it names both unapplied lower tiers (South Carolina's under-65, Georgia's $35,000 at 62–64), each still disclosed in its note; **F-3** every state
  whose note says the model applies it from 65 although the law starts earlier is named in the Field Manual's sentence — derived from the notes. On a
  pre-v6.05 tag **F-1 [KNOWN STALE]** pins the old sentence.
- **Prior leg (v6.04)** — RI-7 as before (it pins v6.04's wording); **RI-9 [KNOWN STALE v6.04]** pins the defect: the count word is not the table's.
- **Controls** (`qa/tools/controls_v605_fm.py`, repo-only): restore S-2's old text → RI-7, RI-8, RI-9, RI-10 red; restore S-1 only → RI-9; drop
  Maine from the list → RI-7, RI-10; add a seventh `incomeLimitedInLaw` row → RI-9; restore S-4's old text → F-1, F-2, F-3; drop New York from the
  S-4 sentence → F-3; unmutated → `t35` and `t52` green.
- Version tag `v605` registered in every suite registry (`register_tag2.cjs`, `tagsites.cjs`, `tagkeys.cjs`; `t33` PINS and the `.py` suites by hand).

## 4 · Out of scope, and stop conditions

**Out:** E-29's other items — (a), (b), (c), (g), (h), (i), (j) stay open; MissingFeatures' *Summary at v5.39* table (history); METHODOLOGY's v5.59
section on the RI amount (dated history); the in-app Rhode Island note (already right). **No figure moves.**

**Stop if:** any suite count moves other than `t35`'s (+3 current, +1 prior) and `t52`'s (+3, after §0.3); the MC-parity guardrail is not 10/10; the
literal census shows any other assertion changing outcome; or any staged anchor does not occur exactly once.

## 5 · Decisions (Steve, 2026-10-12)

- **DD-1 (E-29 (e))** — *"Fix in a small v6.05"*: correct the Field Manual, change the test to check the new wording, fold in (f). Text only.
- **DD-2 (E-29 (d))** — *"Leave as is"*: the v5.69 Roth best-cell move stays disclosed (METHODOLOGY, CHANGELOG), unpinned. Closed.
- **DD-3 (E-29 (k))** — *"Keep it"*: an unsaved My Data draft survives a rejected import (`t38` I-5 pins it). Closed.
- **DD-4 (the build's call, recorded)** — M-1, M-2 and M-4 ride along with (f): the same staleness (v5.73 and v5.95 not carried into METHODOLOGY),
  found while verifying (e)'s premise, no figure involved. **S-4** likewise (§0.3): (f)'s sentence in the Field Manual, found at the ship's re-read.

## 6 · Build record (v6.05, 2026-10-12)

- **Source** `f230ffbbd4f2773f7816769bb726d975` (seven anchored edits, each counted once on v6.04: S-1, S-2, S-4 and the four version sites; printed back by the parser after the
  edit). S-4 was added after the first full run, when the §I re-read found the paragraph (§0.3); the source was restaged from v6.04, rebuilt and the
  whole suite run again — the counts here are that second run's.
  **Built** `1c3d9f3a83bcdd6c09fe99fc574b5085` (v6.04 rebuilt byte-identical first, `71f4ada6…`; `smoke_built` 22 passed, 0 failed). **METHODOLOGY** four anchored edits (M-1–M-4), made before the run.
- **Literal census** (§2): `t35` RI-7's two regexes and RI-8's, and `t52` F-1–F-3's, change outcome against the new source, as intended; `t34` L68's `", Rhode Island at v5.69"` is a
  label fragment, not a matcher; the version strings in `t1` / `t4`. Against METHODOLOGY: RI-7's `/never IRA money/` only (DOCS reads the Field Manual,
  not METHODOLOGY, so that hit is inert). The three Python suites' literals: no change.
- **Stop conditions:** none fired — every count equals v6.04's except `t35`, `t52` and `t68` (§4 named `t35`'s and `t52`'s; `t68`'s −4 is its v6.03 → v6.04 group D, which
  reports itself not run without `app_v603.mjs`, the shape `t66` and `t67` already have); MC parity 10/10.
- **`t35`** 117 (v6.05) / 115 (v6.04); **`t52`** 37 (v6.05; on a v6.04 tag F-1 pins the old sentence — run by hand, 35 passed). **Controls 9 of 9** — K5 (a seventh row marked income-limited) also turns `t35` D-7 and D-8 red,
  which is right: that row is income-limited in law and unconditioned.
- **Found by the build, fixed before the run:** the prior-leg pin was first numbered RI-8, the ID the current leg gives the IRA extinction; renumbered RI-9,
  the check it pairs with.
- **Found at the ship, fixed in the package:** `package_check_controls.sh` skipped P56/P57 on this release because its app-release test grepped the
  CHANGELOG for `^## v5`, which the CHANGELOG archive of 2026-10-11 (second) emptied; now `^## v[0-9]`, recorded in OPERATIONS §G. And `package_check`
  H-1/H-2 read past the newest entry into the `## ops` entries below it (which quote v6.04's md5s), so in the rehearsal P20/P21 could not fire; the
  window now ends at the next heading, recorded in OPERATIONS §I. And `controls_manifest_rows.py`'s B1 found no target before the upload of a release
  that rotates the dom entry (my derivation of 2026-10-11); it now falls back to another pooled row named elsewhere.
- **Suite:** 6,329 app checks, 67 suites, 0 failed, 0 DIED; GRAND 6,459. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v604 v605 from the build workspace — a full clone of 16dcba4 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.04 resolved from history, commit a923332) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6237, half B GRAND 222; none DIED.
