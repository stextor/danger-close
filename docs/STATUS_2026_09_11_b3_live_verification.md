# STATUS 2026-09-11 — B-3 re-verified at v5.70: the live site and a clean clone

**Kind: verification record. No source change, no version bump, no fixes to the app or the suite.** Written by the
session that ran the checks below on 2026-09-11, after the v5.70 ship; every number here was printed by a command in
that session (OPERATIONS §A0) and the command is named. Repo-only (`docs/`, the H-2 class). The CHANGELOG ops entry
of the same date summarises this file; this file is the full record.

**Decisions taken (2026-09-11, on the session's recommendations):** D-1 (a) — this file plus the CHANGELOG ops entry,
not a section of `VERIFICATION_REPORT.md` (F-6); D-2 — `smoke_built`'s two vacuous checks are fixed with the next
release (A-3), suite-only, with a scripts-disabled negative control; D-3 — no second full-suite run on record (nothing
changed since the packaged-copies run in CHANGELOG v5.70); D-4 — `TESTING.md`'s stale "Current build" sentence rolled
in the same package (F-5); D-5 — OPERATIONS §I's false "cannot reach the live host" paragraph corrected in the same
package (F-7).

**Steve's real-browser check: not yet received when this record was packaged** — see §4; add the result here when it
arrives, in one line, dated.

---

## 0 · Result in one paragraph

GitHub Pages serves the tested v5.70 build: `https://stextor.github.io/danger-close/index.html` returned HTTP 200,
1,428,589 bytes, md5 `372d066cf4fc7115ebdae9fc9d6f35d1`, an origin fetch (`x-cache: MISS`, `age: 0`,
`last-modified` 14:56:18 GMT, one minute after the `1f1e837` commit). The same bytes come back from the directory URL.
Rebuilt in this session from the canonical source, v5.70 is byte-identical to that live copy, and v5.69 rebuilt
byte-identically to its published hash first (the §N3a scaffold check). Driven through the real bootstrap under
jsdom, the live copy sends **nothing** with neither a key nor a Local Model, one request to `api.anthropic.com` with a
key, and one request to the Local Model URL with a Local Model; the v5.69 rebuild sends one keyless request that
resolves to the page's own host. `smoke_built` 20/20 on the live copy; `t36` 23 on v5.69 and 24 on v5.70 from a
clean clone; its controls 4 of 4. **F-1 is confirmed by demonstration.** Nothing was measured in a real browser —
that check is Steve's (§4).

## 1 · Freshness (OPERATIONS §A, §A2) — T1

| Measured | Result |
|---|---|
| Manifest Current | v5.70 · source `df3e5d7599277ae1bb1afc216d318baf` · built `372d066cf4fc7115ebdae9fc9d6f35d1` |
| Pool `DangerClose-v5_70.jsx` (`md5sum`) | `df3e5d7599277ae1bb1afc216d318baf` — matches |
| Pool `DangerClose-v5_69.jsx` | `76a35ba283ed5153ff257106e7ccfc10` — the prior leg, matches the manifest's Prior |
| Pool `main.jsx` / `index.html` (= `src/index.html`) / `vite_config.js` / `package.json` / `package-lock.json` | `d9eca7b469a3fb7ec1c5325fd4bf8145` / `52ef2be3080352df6198ee3b8c3507ad` / `30da5708038a1d7c97a4b06777ea8e8a` / `9ee8d745bc9f32d6e8fa02e623603423` / `2978c390c08ee9bb2aa813e69c5eeec1` |
| CHANGELOG newest entry | v5.70, same two hashes |
| Clone HEAD (`git log -1`) | `1f1e837` "v5.70", 2026-09-11 10:55:49 -0400 |
| Clone `index.html` / `src/DangerClose.jsx` / `src/main.jsx` / `src/index.html` | `372d066c…` / `df3e5d75…` / `d9eca7b4…` / `52ef2be3…` |
| **Pool count** (`ls -1 \| wc -l`) | **130** |
| **`SCOPE_B3_KEYLESS_AI_ROUTE.md` in the pool** | **Absent.** The only `B3` name in the pool is `controls_v570_b3.sh`. The repo's RETIRED copy hashes `8bcb7aefea73fdfd13bfcd29be2d9e26`. The deletion asked for at the v5.70 ship took. |
| §A2 diff, pool → clone (content match, both directions) | **129 of 130 pool files are byte-identical to a committed file.** The one pool-only file is `DangerClose-v5_69.jsx` — the prior leg, which is not in the repo by design (§B). **No drift.** |
| §A2 diff, clone → pool | 204 repo-only files: 7 root, 7 `.github/`, 89 `docs/`, 91 `qa/` (61 superseded `dom_entry_*`, 28 retired `qa/tools/` probes, `qa/controls_v556.sh`, `qa/tools/probe_ai_route.mjs`), 10 `validation/`. **Nothing in `src/` is repo-only** — every build input is in the pool. |
| Pool legs / dom entries | exactly `DangerClose-v5_69.jsx`, `DangerClose-v5_70.jsx`; exactly `dom_entry_v569.jsx`, `dom_entry_v570.jsx`. `DangerClose-v5_68.jsx` and `dom_entry_v568.jsx` are gone. |
| K-8 / K-9 / J-3 / J-4, replicated against the pool as it stood after the deletion (their expressions copied verbatim from `package_check.mjs` L791, L816, L657–658 — a replica, not the tool) | K-8: 83 hashed rows, **0 stale, 0 naming a file not in the pool**. K-9: 130 pool files, **0 unnamed**. 47 pool files carry no hash row (the classes the manifest's D-3 note says are unrowed — not re-adjudicated here). |

What the v5.70 shipping session's chat claimed that this session could **not** re-verify: byte-identity of the 32
packaged paths and the 29 `knowledge/` files *to the package* — no zip was available. The stronger statement above
(pool ≡ clone for 129/130) covers what matters.

## 2 · The live site — T2

```
curl -s -m 60 -D /tmp/live_headers.txt -o /tmp/live_index.html https://stextor.github.io/danger-close/index.html
HTTP/2 200 · last-modified: Fri, 11 Sep 2026 14:56:18 GMT · etag "6aa41692-15cc6d" · cache-control: max-age=600
age: 0 · x-cache: MISS · content-length: 1428589 · fetched 20:12:41 GMT
md5 372d066cf4fc7115ebdae9fc9d6f35d1   (v5.70 built)      — NOT 86703918db247e3284752f0f1cc1f6d5 (v5.69 built)
https://stextor.github.io/danger-close/  →  200, same last-modified, md5 372d066cf4fc7115ebdae9fc9d6f35d1
```

The allowlist change took: `stextor.github.io` was reachable from `bash` in this session — the first session opened
after the maintainer added the host on 2026-09-11 (a sandbox's list is issued at chat start). OPERATIONS §I said a
session could not reach it; corrected in the same package (F-7).

**Provenance closed by rebuild, not by recorded number** (§N3a, from the clone's five scaffold files + the pool source;
`npm ci`, then `npm install --no-save jsdom`; node 22.22.2, vite 5.4.21, @vitejs/plugin-react 4.7.0,
vite-plugin-singlefile 2.3.3, rollup 4.63.1, react/react-dom 18.3.1, jsdom 30.0.1, mammoth 1.12.1 from the lockfile):

- v5.69 from `76a35ba2…` → `dist/index.html` 1,428,339 bytes, **`86703918db247e3284752f0f1cc1f6d5`, byte-identical to
  the published v5.69** — the scaffold is complete.
- v5.70 from `df3e5d75…` (pool copy `cmp`-identical to the clone's `src/DangerClose.jsx`) → 1,428,589 bytes,
  **`372d066cf4fc7115ebdae9fc9d6f35d1`; `cmp` against the live download: identical.**

So: pool source = clone source → rebuild = committed `index.html` = what GitHub Pages serves, all measured this session.

**`node qa/smoke_built.mjs /tmp/live_index.html` → 20 passed, 0 failed, exit 0.** Against the v5.69 rebuild:
17 passed, 3 failed — exactly the three B-3 checks — and its Enter loop recorded 20 keyless requests to
`/anthropic/v1/messages` (one per press).

**The probe** (`verify_built.mjs`, session-only, reproduced verbatim in §8 so it can be recreated; it duplicates
`smoke_built`'s relocation on purpose so it runs alone), against the live download:

| Configuration | Send button before → after | Refusal notice (rendered root) | COMMS ERROR | Requests | Where |
|---|---|---|---|---|---|
| live v5.70 · no key · no Local Model | "🔑 Add your API key to use Ask AI", disabled → same, disabled | **shown** | none | **0** | — |
| live v5.70 · saved key | ▶ EXECUTE (disabled until typed) → ▶ EXECUTE, enabled | none | shown (the stub's rejection) | 1 | `https://api.anthropic.com/v1/messages` · headers `content-type`, `x-api-key`, `anthropic-version`, `anthropic-dangerous-direct-browser-access` · 16,530 body chars |
| live v5.70 · Local Model | ▶ EXECUTE → ▶ EXECUTE, enabled | none | shown | 1 | `http://localhost:11434/v1/chat/completions` · `content-type` only · 16,528 body chars |
| **control:** v5.69 rebuild · no key | ▶ EXECUTE → ▶ EXECUTE, enabled | none | shown | 1 | `/anthropic/v1/messages` → resolves to `https://localhost/anthropic/v1/messages` (the page's own host) · `content-type` only · 16,530 body chars |

The typed question stayed in the box in every case; the LOCAL API KEY panel was on screen in every case (the
self-hosted branch, because the page has a hostname). Nothing left the machine: the recording `fetch` always rejects.

*An observation from the shipping session's chat is explained and is not a finding.* The probe's heuristic "key panel
says a key is saved" tested `/FORGET KEY/` on the rendered text and was true with no key. That string is rendered in
**two** places (AST substring walk over `v570.jsx`): the button at L11589, inside the saved-key branch, and the help
text at L11610 — *"…press FORGET KEY whenever you leave the app on a shared or work machine"* — which is in the no-key
SAVE KEY panel. The heuristic was wrong; the panel is right.

## 3 · The clean clone — T3

From `/tmp/ship` (`1f1e837`): `qa/mk_runfolder.sh v569 v570 /mnt/project/DangerClose-v5_69.jsx /tmp/run` — 60 files
assembled, one `npm install`, both legs bundled, "run folder ready".

| Run | Result |
|---|---|
| `node t36_ai_route.mjs v569` | **23 passed, 0 failed** |
| `node t36_ai_route.mjs v570` | **24 passed, 0 failed** |
| `bash qa/tools/controls_v570_b3.sh /tmp/run` | **4 of 4 met expectation** — C0 unmutated green (24/0); C1 the refusal deleted → R-1 fired; C2 guard narrowed to "no key" → R-3 fired; C3 claude.ai term dropped → R-4 fired |

The full two-leg suite was **not** run (D-3). `package_check` was run on **this package** (see the CHANGELOG ops
entry and the package's `MANIFEST.txt`); §1's K/J replicas are the pool-side re-check after the leftover's deletion.

## 4 · Not done, and what only Steve can do

- **Nothing was measured in a real browser.** All behaviour above is jsdom. The check still owed: private window →
  live site → accept the notice → *use example data* → **ask AI** → F12 → Network (Fetch/XHR) → type a question →
  Enter → try the button. Expected: footer **v5.70**; button **🔑 Add your API key to use Ask AI**, grey; *"Nothing
  was sent — add your API key above, or set up a Local Model."*; **no new row** in the Network tab. Hard-refresh first.
  **Result: (not yet received — record it here, dated.)**
- The public note (Steve's; draft and wording constraints in the retired scope's §5) — the live confirmation it was
  waiting for is in hand.
- Removing `main.jsx`'s rewrite (D-B3-1 (b)); A-3; pool pruning — unchanged from the queue.

## 5 · Findings

**F-1 · CONFIRMED. Two `smoke_built.mjs` text checks are vacuous.** `qa/smoke_built.mjs` L67 is
`const txt = () => window.document.body.textContent || ""`, and the harness relocates the app's inline bundle to just
before `</body>`, so the bundle's *source* is part of `body.textContent`. Counts: the literal `Nothing was sent` occurs
**once** in the v5.70 built file (byte 968,262, inside the inlined module script — the string
`"Nothing was sent — add your API key above, or set up a Local Model."`) and **zero** times in the v5.69 built file;
in the sources, by AST walk over every `Literal`, `TemplateElement` and `JSXText` node, v5.69 has **0** string nodes
containing it and v5.70 has **1** (a `Literal` at L6020 inside `DangerCloseMain`). Demonstration (session-only probe
using smoke_built's exact relocation and bootstrap):

| State of the page | `/Nothing was sent/` on `body` | on `#root` | `includes("v5.70")` on `body` | on `#root` |
|---|---|---|---|---|
| v5.70, **scripts disabled** — root has 0 children, 0 rendered chars | **true** | false | **true** | false |
| v5.70, live, Ask AI tab open, **no Enter yet** | true | false | true | true |
| v5.70, live, after one Enter | true | **true** | true | true |
| v5.69, scripts disabled | false | false | true (`v5.69`) | false |
| v5.69, live, after one Enter | false | false | true | true |

So *"B-3: … Ask AI refuses (notice shown)"* passes on a v5.70 page in which no script ran, and *"built app renders its
own declared version"* passes the same way; on v5.69 the notice check fails whether or not anything rendered. Read
`#root` and both become real. **B-3 coverage is intact:** the zero-request and disabled-button checks read real state,
and `t36`'s notice check runs in the DOM-bundle harness (loaded by `require`, not a script element) where it is real.
The v5.70 shipping session wrote the newer check and owns it; the version check predates it. **Fix per D-2:** L67
reads `#root`; the negative control is the first row of the table — load the relocated file with scripts disabled and
require both checks to **fail**.

**F-2 · A fresh INSTANCE of a gap OPERATIONS §G already records — not a new finding.** §G, *"Section J cannot see a
DELETION"* (added 2026-09-01): *"The check that would have caught them does not exist yet."* Read against
`qa/tools/package_check.mjs`: J-1/J-2 compare the package's `knowledge/` to the pool (arrivals, staleness); J-3/J-4
count legs and dom entries by filename pattern; K-8 checks rows that exist (a retired scope's row is deleted); **K-9
tests `M.includes(f)` — "named somewhere" — and the manifest names `SCOPE_B3_KEYLESS_AI_ROUTE.md` nine times, six of them
in the sentence saying it leaves the pool.** A leftover therefore satisfies K-9 by the very line announcing its
departure, which is why the v5.70 post-ship run read 45/1 "D-1 only" with the pool one file over. The check §G asks
for — every file the manifest's newest retirement section says leaves is absent from the pool — is the right shape.
For the housekeeping scope, with F-3, F-4, and the `package_check` §H comment named under F-7.

**F-3 · CONFIRMED and located. The first-open notice contradicts the Field Manual's own qualification.**
`src/index.html` L21 (the gate, inline, independent of React): *"Your inputs stay in **your own browser**. Nothing is
uploaded or seen by anyone else."* — unconditional. The Field Manual (`DOCS_HTML`, `src/DangerClose.jsx` L3844, one
line) says, in its intro: *"Nothing is uploaded to any server except the calls you explicitly send from the Ask AI
tab,"* and in §10's destination row: *"…api.anthropic.com over HTTPS — or, if you've configured a Local Model,
your-machine/v1/chat/completions… With neither a key nor a Local Model set, Ask AI sends nothing."* The gate is a
**scaffold** file (pool + repo), so a rewording is not an app-source edit, but it does change the built artifact and
therefore takes a version bump and a rebuild. Wording is Steve's call; it should land before or with the public note.

**F-4 · NEW, small, and an instance of a hazard §L already records. `qa/tools/controls_v570_b3.sh` is committed
without the executable bit.** `git ls-files -s`: `100644` — the only `.sh` in the tree without it; the other nineteen
are `100755`. Its own usage line (`qa/tools/controls_v570_b3.sh <run-folder>`) therefore fails from a fresh clone
with "Permission denied"; `bash qa/tools/controls_v570_b3.sh …` runs it (that is how §3 ran it). The cause is the one
OPERATIONS §L names: GitHub's upload path drops the executable bit on any **new** shell script, and this one was new at
v5.70. Pool copies carry no mode bits, so this is repo-only. Fix: `git update-index --chmod=+x`, or edit in place; then
`git ls-files -s` shows `100755`. Housekeeping scope.

**F-5 · `TESTING.md` and OPERATIONS §G disagreed, and `TESTING.md`'s "Current build" line was three releases
stale — rolled in this package (D-4).** `TESTING.md` L5 (pool copy `cmp`-identical to the clone's) contained
*"**Current build: v5.67** · source `ca05b2ece1af9dac3851837a0e96fbfa` · built `35fcca203418e3e10b11765e2c6ade93` · a
full run is **3,377 app checks**"*, present tense. `df3e5d75…`, `372d066c…` and `3,576` occurred **0** times in the
file, while L25 carried the v5.70 per-suite tally. OPERATIONS §G L524–525 says *"TESTING.md only ever holds the
CURRENT build's md5."* The sentence is rolled to v5.70 with a note recording the stale span; the release checklist
that rolls the tally must roll the sentence with it.

**F-6 · `VERIFICATION_REPORT.md` is a frozen document, and had no manifest row.** Its header (repo,
`6a593142e96356500ca6ab2628ae3c76`): *"⚠ THIS IS A FROZEN HISTORICAL RECORD. IT IS NOT THE CURRENT VERIFICATION
STATE. This file stopped being maintained after v5.9.2… Deliberately no current figures are repeated here"* — corrected
2026-08-23 because a header claiming currency had asserted v5.9.2 was current for 37 releases, and it routes readers to
`CHANGELOG.md` as the maintained record. The verification brief proposed appending a v5.70 section to it; doing so
would falsify that header or require re-wording it into "frozen except…", the second-copy problem it was frozen to
end. Hence D-1 (a): this file, in `docs/`, where the project's other verification records live. The manifest gains a
REPO-ONLY inventory row for `VERIFICATION_REPORT.md` in this package so the next reader who checks finds its class.

**F-7 · OPERATIONS §I said a session cannot reach the live host; it can — corrected in this package (D-5).** §I
L807–808 read *"A session cannot reach `stextor.github.io` (HTTP 403 — not in the egress allowlist)"* and concluded
that only the maintainer can verify the served bytes. §2 above did it from a session. The paragraph is rolled; the
same sentence survives as a **code comment** in `package_check.mjs`'s §H block and is left for the change that next
touches the tool (a comment edit alone would roll a tool's hash row for no behaviour change). Consequence worth a
scope of its own: §H could compare Pages against `raw.githubusercontent.com` directly, which would make the
served-bytes check a gate rather than a habit.

## 6 · Decisions — as taken

| | Decision | Taken |
|---|---|---|
| D-1 | Durable record: (a) this file + CHANGELOG ops entry · (b) `VERIFICATION_REPORT.md` section · (c) none | **(a)** |
| D-2 | Fix `smoke_built` L67 and its two checks | **With A-3**, suite-only, scripts-disabled negative control |
| D-3 | Second full-suite run on record | **No** — nothing changed since the packaged-copies run |
| D-4 | Roll `TESTING.md` L5 in this package | **Yes** |
| D-5 | Correct OPERATIONS §I in this package | **Yes** |

## 7 · Session artefacts and where they went

| Artefact | Destination |
|---|---|
| This file | `docs/STATUS_2026_09_11_b3_live_verification.md` — repo-only, H-2 class; manifest inventory row |
| `SESSION-BRIEF-verify-B3-v570.md` (the uploaded brief) | Discard — F-1 to F-3 are carried here; F-4 to F-7 are new here |
| `verify_built.mjs`, `f1_probe.mjs`, `lit_substr_probe.cjs` | None — session-only probes. The first is reproduced in §8; the second is F-1's demonstration (smoke_built's relocation and bootstrap, then `body.textContent` vs `#root.textContent` with scripts disabled, before Enter, after Enter); the third is §B1a's twenty-line AST walk collecting every `Literal` / `TemplateElement` / `JSXText` whose value contains a substring, with line and enclosing function |
| The live download, the two rebuilds, the clone, the run folder, the build folder | None — rebuildable |

## 8 · Appendix — `verify_built.mjs` (session-only probe; recreate, do not ship)

Runs from a build folder with `jsdom` installed (§N3a). `usage: node verify_built.mjs <index.html> nokey|key|local`.
Storage seeds use `src/main.jsx`'s shim keys with the `dc:` prefix and must be set in `beforeParse`, before the bundle
runs; `txt()` reads the React root, not the body (F-1).

```javascript
// verify_built.mjs — SESSION-ONLY (not shipped, destination none). Drives a BUILT artifact — the real bootstrap, not the
// suite's DOM bundle — through Ask AI, recording every fetch the page makes. jsdom cannot run module scripts, so the
// inlined module script is relocated to a classic one exactly as qa/smoke_built.mjs does (its comment explains why).
// usage: node verify_built.mjs <index.html> nokey|key|local
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "fs";
const [SRC_HTML, MODE] = process.argv.slice(2);
const _real = fs.readFileSync(SRC_HTML, "utf8");
const m = _real.match(/<script type="module"[^>]*>/);
if (!m) { console.log("no inlined module script"); process.exit(1); }
const a = _real.indexOf(m[0]); const b = _real.indexOf("</script>", a + m[0].length) + "</script>".length;
const block = _real.slice(a, b).replace(m[0], "<script>");
const html = (_real.slice(0, a) + _real.slice(b)).replace("</body>", () => block + "\n</body>");
const calls = [];
const vc = new VirtualConsole();
const dom = new JSDOM(html, {
  runScripts: "dangerously", resources: undefined, pretendToBeVisual: true, url: "https://localhost/", virtualConsole: vc,
  beforeParse(w) {
    // Seed storage BEFORE any script runs: the key / Local Model load effects read it at mount. Same keys and "dc:" prefix
    // as src/main.jsx's storage shim.
    try {
      if (MODE === "key") w.localStorage.setItem("dc:danger_close:api_key_v1", "sk-ant-VERIFY-00000000");
      if (MODE === "local") w.localStorage.setItem("dc:danger_close:local_llm_v1", JSON.stringify({ url: "http://localhost:11434/v1", model: "verify" }));
    } catch (e) { console.log("  seed failed:", e.message); }
    // The RECORDING fetch. main.jsx binds whatever window.fetch is when it loads, so its wrapper sits ON TOP of this —
    // what lands here is what the wrapper would have sent to the network. Always rejects; nothing leaves this machine.
    w.fetch = (u, init) => {
      calls.push({ url: String((u && u.url) || u), headers: Object.keys((init && init.headers) || {}).map(h => h.toLowerCase()), bodyChars: String((init && init.body) || "").length });
      return Promise.reject(new Error("verify stub"));
    };
  },
});
const { window } = dom;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.scrollTo = () => {};
window.HTMLCanvasElement.prototype.getContext = () => ({ fillRect() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {}, arc() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, fillText() {}, measureText: () => ({ width: 10 }), setLineDash() {}, closePath() {}, rect() {}, clip() {}, createLinearGradient: () => ({ addColorStop() {} }) });
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = () => (window.document.getElementById("root") || window.document.body).textContent || ""; // RENDERED text only — body.textContent would include the relocated bundle source
const q = s => window.document.querySelector(s);
const click = el => el && el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

console.log(`verify_built — ${SRC_HTML} — mode ${MODE}`);
console.log(`  artifact footer version: ${(_real.match(/DANGER CLOSE (v5\.[0-9.]+) \u2502 Not financial advice/) || [])[1]} · bootstrap rewrite present: ${/\/anthropic/.test(_real)}`);
await wait(3000);
const gate = window.document.getElementById("dc-disclaimer-gate");
if (gate) { const btn = [...gate.querySelectorAll("button")].pop(); const chk = gate.querySelector("input[type=checkbox]"); if (chk) { chk.checked = true; chk.dispatchEvent(new window.Event("change", { bubbles: true })); } if (btn) { btn.disabled = false; click(btn); } await wait(500); }
await wait(2000);
const findByText = (re, tags = "button, div, span") => [...window.document.body.querySelectorAll(tags)].find(el => re.test((el.textContent || "").trim()) && el.children.length === 0);
click(findByText(/use example data/i)); await wait(4000);
click([...window.document.body.querySelectorAll("button.tab")].find(x => (x.textContent || "").trim() === "ask AI")); await wait(1500);
console.log(`  self-hosted branch taken (LOCAL API KEY panel on screen): ${/LOCAL API KEY/.test(txt())} · key panel says a key is saved: ${/FORGET KEY/.test(txt())}`);
const sendBtn = () => [...window.document.querySelectorAll("button.ai-btn")].find(x => !/attach|clear/i.test(x.textContent || ""));
console.log(`  send button before: ${JSON.stringify(sendBtn() && sendBtn().textContent.trim())} disabled=${sendBtn() && sendBtn().disabled}`);
const before = calls.length; let noticed = false;
for (let i = 0; i < 20 && calls.length === before && !noticed; i++) {
  const ta = q("textarea.ai-in");
  if (ta && !ta.value) { Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set.call(ta, "How does my plan look?"); ta.dispatchEvent(new window.Event("input", { bubbles: true })); await wait(150); }
  const s = sendBtn();
  if (s && !s.disabled) click(s);
  else if (ta) ta.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  await wait(1000);
  noticed = /Nothing was sent/.test(txt());
}
await wait(1500);
const sent = calls.slice(before);
console.log(`  refusal notice shown: ${noticed}`);
console.log(`  requests the page made: ${sent.length}`);
sent.forEach((c, i) => console.log(`   #${i + 1} requested=${c.url} → resolved=${new window.URL(c.url, window.location.href).href} headers=${JSON.stringify(c.headers)} bodyChars=${c.bodyChars}`));
console.log(`  question still in the box: ${JSON.stringify(q("textarea.ai-in") && q("textarea.ai-in").value)}`);
console.log(`  send button after: ${JSON.stringify(sendBtn() && sendBtn().textContent.trim())} disabled=${sendBtn() && sendBtn().disabled}`);
console.log(`  COMMS ERROR shown (the stub's rejection surfaced to the user): ${/COMMS ERROR/.test(txt())}`);
process.exit(0);
```
