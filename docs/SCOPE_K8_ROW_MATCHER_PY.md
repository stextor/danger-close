# SCOPE — `K-8`'s row matcher cannot see a `.py` row, and there are four copies of the expression

| | |
|---|---|
| Status | **OPEN — written 2026-09-08, not built. Decisions in §6 are unresolved; do not build.** |
| Premise verified against | v5.66 source `31b43e094307ef5f996570c090478e13`, tree `b822d3e`, pool 117 files |
| Owed by | The 2026-09-08 manifest hash-row repair, which raised it and declined to fold it in |
| Direction | **No user-visible figure moves, and no app source is touched.** Gate infrastructure |
| Shape | A one-token change to a regex, plus the question of how many copies of that regex exist |

## 1 · The premise, verified

**`package_check` `K-8`'s row matcher does not recognise `.py`.** Verified at
`qa/tools/package_check.mjs:756` in tree `b822d3e`:

```
/^\|\s*`?([A-Za-z0-9_.-]+\.(?:mjs|cjs|jsx|js|sh|md|html|json|txt))`?\s*\|\s*`?([0-9a-f]{32})`?\s*\|/gm
```

The pool holds **three** `.py` files — `oracle_nm.py`, `controls_v566_nm.py`,
`controls_manifest_rows.py` — and none of them has a hash row, because writing one would create a
maintenance obligation with no gate behind it. That is why the 2026-09-08 package gave all three an
index row and stated the reason in place rather than rowing them.

### 1a · The consequence, executed rather than argued

A scratch copy of the pool was given one extra row for `oracle_nm.py`, once correct and once
deliberately stale, and both matchers were run over it:

| manifest carries | current matcher | widened matcher |
|---|---|---|
| a **correct** `.py` row | 78 rows · reports nothing | 79 rows · reports nothing |
| a **stale** `.py` row | 78 rows · **reports nothing** | 79 rows · **fires, names `oracle_nm.py`** |

**A stale `.py` row is invisible to `K-8` today.** Not a wrong answer — no answer, which is the
same shape as the 37 unrowed files that decision D-3 closed.

### 1b · ⚠ The change is INERT on today's manifest, and that is the trap

Against the live manifest, **all three candidate matchers see exactly the same 78 rows**, with zero
rows naming a non-pool file:

```
current        rows= 78  unique= 78  rows naming a non-pool file=0
+py            rows= 78  unique= 78  rows naming a non-pool file=0
any-extension  rows= 78  unique= 78  rows naming a non-pool file=0
```

So this release **cannot be tested against the manifest as it stands** — a check written that way is
green under the old matcher and the new one alike and proves nothing. **This is the endpoint-only
table-test class**, found three times across two sessions and every time by a control rather than by
review. §4 is written around it.

It also means the widening **protects nothing by itself.** It removes a blind spot; it does not fill
it. Whether the same release also writes the three `.py` rows is **D-2**, and the two halves are
separable.

### 1c · `K-9` is NOT affected

`K-9` tests `M.includes(f)` over the pool listing — extension-agnostic. All three `.py` files are
already covered by it, which is why the missing rows were caught in the first place. **Only `K-8` is
blind, and only to the hash half.**

## 2 · The site census — FOUR live copies of one expression, and a fifth already stale

Resolved with an AST census (`row_census.cjs`, §4), not a grep: a grep cannot tell a regex
definition from a mention of one, cannot see the alternation inside a template literal, and cannot
**execute** the pattern to find out what it matches. The census admits a site only if its pattern,
executed, matches a canonical hash row.

| # | Site | Extension set | Sees a `.py` row? |
|---|---|---|---|
| 1 | `qa/tools/package_check.mjs:756` — **the gate itself** | `mjs cjs jsx js sh md html json txt` | no |
| 2 | `PROJECT_KNOWLEDGE_INDEX.md:650` — the **D-5 count command** | identical to the gate | no |
| 3 | `qa/tools/controls_manifest_rows.py:103` — `ROW`, which **derives the control's target** | identical to the gate | no |
| 4 | `qa/tools/package_check_controls.sh:443` — `P32`'s target selector | `mjs cjs sh` — **narrower still** | no |
| 5 | `docs/SCOPE_HOUSEKEEPING_THREE.md:200` | the **pre-`D-C-1` loose matcher** | n/a — already stale |

**Site 2 is the one that matters.** The manifest introduces that block with the claim that it *"is
`package_check` K-8's own expression so it cannot drift away from the gate."* **That claim is only
true while both are edited together.** Widening the gate and not the block falsifies a sentence the
manifest makes about itself — the project's defining failure, in the document that exists to prevent
it.

**Site 3 is load-bearing for the tests.** `controls_manifest_rows.py` picks its `C1` target by
scanning rows with its own copy of the expression. If the gate widens and `ROW` does not, the
control **can never select a `.py` row**, so the new behaviour would ship with a control that
structurally cannot exercise it — a control that passes while measuring nothing, which is the
`P32`/`P42` defect this project has now recorded three times.

**Site 4 is a different, narrower set and may be correct as it is.** `P32` only needs *some* row it
can corrupt; it does not need the widest possible set. Whether it should widen is **D-4**.

⚠ **Site 5 has already drifted and is evidence, not a task.** `SCOPE_HOUSEKEEPING_THREE.md` carries
the **pre-`D-C-1`** matcher — the loose one that let any prose sit between the filename and the
hash, which is the exact defect the eighth package of 2026-09-07 fixed. It sits inside a blockquote
recording what was proposed, so it is history; but it is a fifth copy, it disagrees with the gate
today, and **nothing noticed.** Its handling is **D-5**.

## 3 · What this would change, stated as a diff

- `package_check.mjs:756` — one token added to an alternation. **No check is added, removed or
  softened**; `K-8`'s predicate is unchanged in every other respect.
- Sites 2 and 3 — the same token, so the three copies continue to agree.
- Possibly three new hash rows in the manifest (**D-2**).

Nothing else. No app source, no suite, no fixture, no figure, no version bump.

## 4 · Tests and controls this must ship with

**No suite covers `package_check`** — it is tooling and is counted in no check total (§B1), so
controls are the only evidence it works. This ships:

1. **`P44` in `package_check_controls.sh` — a `.py` row goes stale, `K-8` must fire and must NAME
   the file.** Carries a **needle**, because a control that passes on somebody else's stale row has
   measured nothing.
2. **`P45` — the paired positive**: a `.py` row that is CORRECT must leave `K-8` green. Without it,
   `P44` would still pass if the widened matcher simply fired on everything.
3. **A null control**: with no mutation, `K-8` green.
4. **⚠ The anti-endpoint control, which is the point.** Per §1b the change is inert on today's
   manifest, so **every control above must INJECT a `.py` row into a scratch copy.** A control that
   runs against the manifest as it stands is green before and after the change and is worth nothing.
   State this at the top of the control file, or the next session will "simplify" it away.
5. **A drift control on the copies**: assert that sites 1, 2 and 3 carry the **same** extension set,
   by parsing each and comparing — so the next widening cannot move one and leave two. This is the
   check that would have made §2 unnecessary.

`row_census.cjs` (written for this scope, currently session-only) is the instrument behind §2 and
should ship to `qa/tools/` if the build proceeds — a census that found the four copies is worth
keeping, and this project's rule is that a control script is evidence, not scaffolding.

## 5 · Explicitly out of scope

- **`K-9`.** Already extension-agnostic (§1c). Untouched.
- **The `K-1`–`K-3` pre-ship/post-ship split**, and the related discovery that `P29` is blind on any
  package whose `K-1` is already red. Diagnosed in `OPERATIONS.md` §I on 2026-09-08; it needs its
  own scope and is **not** folded in here.
- **Rowing the `.md` documents.** Decision D-3 of `SCOPE_HOUSEKEEPING_THREE.md` settled that
  deliberately; nothing here reopens it.
- **`t10_taxcases.mjs:1133`**, which names its oracle `qa/oracle_nm.py` when the file is at
  `qa/tools/oracle_nm.py`. A one-line comment fix, owed to a release that is already touching the
  suite. Recorded, not built here.
- Any change to what `K-8` asserts beyond which filenames it can see.

## 6 · Open decisions — UNRESOLVED. Do not build until these are answered.

**D-1 · Which matcher?**

- **(a) Add `py` to the alternation.** Smallest change; the set stays an explicit allowlist, so a
  file type nobody intended cannot acquire a row silently.
- **(b) Accept any extension** — `[A-Za-z0-9_.-]+\.[A-Za-z0-9]+`. Measured against the live
  manifest it sees **exactly the same 78 rows and introduces no false positive** (§1b), and it never
  needs widening again.
- (c) Do not widen; instead state in the manifest that `.py` files are permanently unrowed.

⚠ **The argument against (b) is not false positives — it is that the allowlist is documentation.**
The current set tells a reader which files the table is *for*. **My recommendation is (a)**: it
fixes the case in hand, keeps that signal, and the drift control in §4 item 5 makes the "needs
widening again" objection cheap. Where (b) wins is that it makes item 5 nearly unnecessary — if you
would rather have one fewer moving part than one more piece of documentation, (b) is defensible and
I would not argue hard against it.

**D-2 · Does the same release also write the three `.py` hash rows?**

- (a) Widen only. The gate stops being blind; nothing is protected yet, and the next session must
  remember to row them — which is the shape that produced this whole class.
- (b) Widen **and** row all three.
- (c) Widen and row **`oracle_nm.py` only** — it is a statutory transcription that `t10` depends on,
  so a silent change to it is the one that could move a user's number. The two control scripts change
  only when their release's controls change, which D-3 already calls "a row on a file that never
  changes protects nothing."

**Recommendation: (c).** It is the only option whose rows earn their maintenance, and it keeps
faith with D-3 rather than quietly overturning it. ⚠ Note that (a) leaves the release **untestable
against the real manifest** — §4's controls would have to inject a row that does not exist in the
tree, which is legitimate but weaker evidence than rowing one for real.

**D-3 · The D-5 count block in the manifest (site 2) — widen it, or replace it with a pointer?**

- (a) Widen it in the same edit. Two copies, kept in step by hand.
- (b) Replace the inline regex with a pointer to `package_check.mjs:756` as the authority, so there
  is one copy.

**Recommendation: (a), and I want to flag that I am recommending the weaker-looking option.** The
block's value is that it can be **pasted and run** by a session with no clone; a pointer cannot be.
That is worth one copy, but only if §4 item 5's drift control ships in the same release — otherwise
(b) is the right answer and the block should become prose.

**D-4 · `P32`'s narrower selector (site 4) — widen it too?**

- (a) Leave it. It only needs *a* corruptible row, and `mjs|cjs|sh` finds one.
- (b) Widen for consistency.

**Recommendation: (a)**, with a comment at the site saying the narrowness is deliberate — otherwise
a future census reports it as drift, which is how site 5 got its reputation.

**D-5 · Site 5, the already-stale copy in `SCOPE_HOUSEKEEPING_THREE.md`.**

- (a) Annotate in place: mark the block as the pre-`D-C-1` matcher, kept as the record.
- (b) Update it to the current expression.
- (c) Leave it.

**Recommendation: (a).** §G prefers retiring to deleting and §I requires a live-reading instruction
inside a historical document to be annotated rather than rewritten. Rewriting it (b) would erase the
evidence that the matcher was once loose, which is the thing that makes the `D-C-1` story legible.

## 7 · Build record

*(empty — nothing built. Fill this at the ship, per §I.)*
