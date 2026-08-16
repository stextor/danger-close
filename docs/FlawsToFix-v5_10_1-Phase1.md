# FlawsToFix.md — Standing Code Audit, Phase 1 (Sections A + B)

**Build under audit:** v5.10.1
**Source:** `src/DangerClose.jsx` · md5 `2ee4d1e5d0f06fa89ee6980fd97984bc`
**Date:** 2026-08-07
**Sections covered:** A (creator-exposure flaws) · B (PII exposure)
**Sections NOT covered in this phase:** C (numerical validation), D, E, F — see *Scope* at the end.

---

## Summary of Phase 1

**One MEDIUM finding (B-2, confirmed defect — scoped for v5.10.2). No critical or high-severity findings.** The two highest-stakes vectors in an app of this
shape — credential handling and household-data exfiltration — are soundly designed, and
several classes of flaw the audit prompt asks about (HTML injection, code execution,
URL-borne data, key leakage into shared artifacts) are **structurally absent** rather than
merely unexploited today.

Four findings are recorded. **B-2 is a confirmed defect** — Clear All Data leaves three
storage keys behind, one holding third-party names and phone numbers — and is scoped for
v5.10.2. The other three are LOW/INFORMATIONAL: two hardening opportunities and one
disclosed-and-accepted limitation (B-1, closed by decision, no action).

---

## What was verified (not assumed)

Each of the following was checked against the source in this session.

| Check | Result |
|---|---|
| HTML-injection sinks (`dangerouslySetInnerHTML`, `innerHTML`, `document.write`) | **Zero occurrences** anywhere in the file |
| Code-execution sinks (`eval`, `new Function`) | **Zero occurrences** |
| Field Manual rendering | `<iframe srcDoc={DOCS_HTML…}>` — a build-time constant, no user data interpolated |
| Outbound network calls, total | **Exactly two** (Anthropic; optional local model) |
| API-key destinations | **One only** — `https://api.anthropic.com/v1/messages`, hardcoded literal |
| Key in request body | No — header only (`x-api-key`) |
| Key inside claude.ai artifact | Suppressed by `IS_CLAUDE_ARTIFACT` branch; header omitted entirely |
| Key in backup export | No — `STORAGE_KEYS.apikey` is touched only by its own save/load/forget/clear paths |
| Key in console/error output | No credential logging found (1 console call total in the file) |
| Key masking in UI | Yes — `sk-ant-••••••••` + last 4 only |
| URL-parameter data flow (`URLSearchParams`, `location.search`, `location.hash`) | **Zero occurrences** — no plan data or identifiers ever ride in a URL |
| Attachment limits | 5 MB per file, 8 files, enforced before base64 encoding |
| Request bounding | `max_tokens: 1000` fixed; history capped at last 12 messages; 45 s `AbortController` timeout |
| Offline mode | Hard-returns before the fetch; the call cannot fire |

---

## FINDING A-1 — Local Model endpoint receives full household context (LOW · user-side · by design, adequately disclosed)

**What.** When a Local Model is configured, the entire `aiSystemPrompt` — names, ages,
filing status, state, portfolio totals, asset mix, Social Security and pension amounts,
simulation results — is POSTed to a **user-supplied URL** (`localLLM.url`), with no
restriction to localhost or private address ranges.

**Where.** Send path at `DangerClose.jsx` ~line 4157 (`fetch(\`${base}/chat/completions\`)`);
value set in the LOCAL MODEL panel (~line 3702) and persisted under
`STORAGE_KEYS.localLLM`.

**Why this is NOT a defect.** The decisive question is whether the URL can be set *without
the user knowingly typing it* — specifically whether a malicious `.json` backup could plant
one. **It cannot.** `STORAGE_KEYS.localLLM` is written only by the panel's own setter; the
backup import path never touches it. There is no URL-parameter or hash reader anywhere in
the file. So the only way to point this at a remote host is for the user to type a remote
host into a panel whose entire documented purpose is choosing where their data goes. Field
Manual §10 states the destination plainly and contrasts it with the Anthropic route.

**Residual risk.** A user following a bad "set up your own AI" tutorial could paste a
third-party URL and send their financial summary there believing it stays local. The panel's
examples are all `localhost`, which mitigates this by convention rather than by control.

**Suggested hardening (optional, not required):** when the configured URL is neither
`localhost`/`127.0.0.1` nor an RFC-1918 address, show a one-time inline caution naming the
host that will receive the data. Cheap, non-blocking, preserves the feature for users who
genuinely run a model on another machine on their LAN.

**Severity:** LOW. Disclosed limitation, user-initiated, no silent path.

---

## FINDING A-2 — No integrity validation on imported backup structure (LOW · user-side)

**What.** Import Backup parses a user-supplied `.json` and applies it to the plan. The
audit found no evidence of a schema/type validation layer that would reject a structurally
hostile file (e.g. absurd array lengths, deeply nested objects, non-numeric values where
numbers are expected).

**Exposure.** This is **not** a code-execution or exfiltration risk — the parsed values feed
numeric engines and React text nodes, and React escapes text by default (confirmed: no
`innerHTML` sinks). The realistic worst case is a **denial-of-service against the user's own
browser tab**: a crafted file could drive a Monte Carlo over pathological inputs and hang or
crash the tab. Since the user supplies their own backup, this is largely self-inflicted.

**Why it still matters slightly.** Backups are described in the docs as shareable-safe and
users do pass them between their own devices; a corrupted (not malicious) file producing a
confusing hang rather than a clean "this backup is invalid" message is a usability and trust
cost.

**Suggested hardening:** a bounded validation pass at import — type checks on scalar fields,
sane maximum row counts for positions/expenses/income streams — failing to a clear error
message rather than a partial apply.

**Severity:** LOW. Creator-side exposure: none. User-side: self-inflicted DoS only.

---

## FINDING B-1 — Household financial data is stored unencrypted in browser storage (INFORMATIONAL · disclosed, inherent to the design)

**What.** The full plan — names, birth dates, balances, income, expenses — persists as
plaintext JSON under the `danger_close:*` keys, alongside the API key under
`danger_close:api_key_v1`.

**Assessment: disclosed limitation, not a defect.** Field Manual §10 and §11 are explicit
that anyone with access to the browser profile can read what the app can read, and §10 names
the exact threat set (family member on the same login, extensions with page access, managed
IT software, malware). Encrypting at rest without a passphrase would be theatre — the key
would have to live beside the data. Adding a passphrase would be a genuine feature decision
with real usability cost, not a bug fix.

**Recorded because** the audit asks for PII exposure that exists today. It exists, it is
inherent to a browser-local app, and it is honestly documented — which is the correct
handling. **No action recommended.**

---

## FINDING B-2 — "Clear All Data" leaves three storage keys behind, one holding third-party PII (MEDIUM · user-side · CONFIRMED DEFECT)

**Status: CONFIRMED and escalated.** Originally flagged as a possible documentation gap.
Tracing `clearStorage()` line-by-line showed it is a real defect: the function deletes
**10 of the 13** keys defined in `STORAGE_KEYS`.

**Not deleted:** `checklist`, `simple`, `ssCut`.

**Why `checklist` matters.** Per-item state is `{ done, notes, contact }` (~line 11340,
persisted ~line 11371), and the item metadata defines contact fields labelled
`"Name / phone"` for the estate attorney, tax advisor/CPA, and insurance contact (~line
2078+). So after a user confirms "Yes, delete everything," their **attorney's and CPA's
names and phone numbers** — plus free-text notes that may name executors, beneficiaries, or
family — remain in browser storage. These are people who never used the app and never
consented to anything.

**Docs promises violated.** §11: "Clear All Data — wipes the browser cache and returns you
to the landing screen." §10 frames it as the deliberate everything-wipe. Neither states
that checklist notes and contacts survive.

**Relationship to D1 (fixed in v5.10.1).** Same family — a Clear All Data promise the code
does not keep — and arguably more sensitive, since D1 exposed the user's *own* credential
while this exposes *third parties*. Not a regression: these keys have never been in the
wipe list. v5.10.1 correctly wired `clearStorage()` into the button; it did not change
which keys `clearStorage()` deletes.

**Fix:** add the three missing deletes, and convert the t5 assertion to a loop over
`STORAGE_KEYS` so the wipe list can never again drift out of sync with the key map.

**Scoped for v5.10.2** — see `SCOPE_DEFECT_B2_v5_10_2.md`. One open decision for Steve
recorded there (whether `simple`/`ssCut` should reset like the other preferences, or be
preserved as device settings).

**Severity:** MEDIUM. Creator-side exposure: none. User-side: undisclosed retention of
third-party PII after an explicit delete-everything action.

---

## Positive findings worth recording

These are not flaws; they are the reasons Phase 1 came back clean, and they are worth
protecting in future releases.

1. **The API key has exactly one destination, written as a literal.** There is no
   configurable base URL for the Anthropic route, so no configuration change — by the user
   or by an imported file — can redirect the credential.
2. **The artifact/self-hosted split is enforced at the header level.** Inside claude.ai the
   key is never attached, which is both a policy requirement and a leak-surface reduction.
3. **The key is excluded from backups by construction, not by filtering.** It lives under
   its own storage key that the export path never reads — a design that cannot regress
   through an oversight in a field list.
4. **No URL-parameter surface at all.** Nothing about the plan can leak via a shared link,
   browser history, or referer header, because nothing is ever read from or written to the
   URL.
5. **The AI request is bounded on every axis** — token cap, history cap, file count, file
   size, wall-clock timeout — which limits both runaway cost on the user's key and hung
   requests.

---

## Scope and honesty statement

This is **Phase 1 of 4** and covers Sections A and B only.

Within Phase 1, the following were examined directly: all injection and code-execution
sinks; both network call sites and their headers; every use of the `apikey` and `localLLM`
storage keys; the storage key map; attachment handling; offline enforcement; URL-parameter
surface; and console output. The audit prompt's example vectors (AI-key hijack, backend
poisoning, injection-for-malicious-purposes) were each tested against this source and found
inapplicable or absent.

**Not examined in this phase**, and therefore not cleared: the full import/apply code path
line-by-line (Finding A-2 and B-2 are flagged from partial tracing and warrant a dedicated
pass); the checklist key's exact disposition in the wipe list; and anything requiring
runtime instrumentation rather than source inspection.

**Sections C, D, E, and F remain outstanding.** Section C (numerical validation to the
dollar) is the largest by a wide margin and requires a full session of hand-computed cases
from primary-source law — it cannot be satisfied by inspection, per the audit's standing
methodology.

**Known candidate finding for `ARCHITECTUREIssues.md` (Section E, not yet run):** the
standing version-visibility requirement asks that the monotonic version be written into
**exported data files** and that a copyable version+hash bug-report affordance exist. Both
appeared absent during the v5.10.1 build work. This should be confirmed and recorded when
Phase 3 runs.
