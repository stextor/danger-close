// t6 — SINGLE-FILER BRANCH (baseline rebuild, 2026-08).
// Run: node t6_single.mjs v592 | node t6_single.mjs v510
// Seeds storage with a single-filer plan (the demo household mutated to single, all
// positions reassigned to A) BEFORE mount, so the app boots straight into the branch
// the couple-centric demo never exercises: no Spouse-B fields, no B breakeven card,
// engines running on a one-person household.
import { execSync } from "child_process";

const VER = process.argv[2] || "v510";

// ─── v5.22: VERSION-TAG REGISTRY GUARD ───
// An UNREGISTERED tag used to evaluate every ladder below as false and fall off the end of every
// ternary chain, silently running the OLDEST branch: pre-v5.11 expectations and v5.10 version
// strings. That is fail-OPEN — a new build got a WEAKER test, not a stronger one — and it could
// change the CHECK COUNT: with an unregistered tag t3 ran 35 checks instead of 36, and the count is
// the number that goes in the release headline. Registering a new version in the ladders below is
// now mandatory, and an unregistered tag stops the run instead of quietly testing the wrong thing.
const KNOWN_VERSIONS = ["v510", "v5101", "v5102", "v511", "v512", "v513", "v514", "v515", "v516", "v517", "v518", "v519", "v520", "v521", "v522", "v523", "v524", "v525", "v526", "v527", "v528", "v529", "v530", "v531", "v532", "v533", "v534", "v535", "v536", "v537", "v538", "v539", "v540", "v592"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log("\n  \u2717 FATAL: version tag \"" + VER + "\" is not registered in this suite.");
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to the version ladders in this file BEFORE running.");
  process.exit(1);
}

const IS510 = VER !== "v592"; // v5.10-family features (v510 and v5101)

// Dump the demo portfolio in a separate process (the app bundle must not run in this
// JSDOM environment twice), then mutate it to a single filer.
execSync(`node --input-type=module -e "
const m = await import('${new URL(`./app_${VER}.mjs`, import.meta.url).href}');
const fs = await import('fs');
fs.default.writeFileSync('/tmp/t6_demo_${VER}.json', JSON.stringify(m.__g.PORTFOLIO()));
"`, { stdio: "inherit" });

import { window } from "./env_dom.mjs";
import { createRequire } from "module";
import fs from "fs";
const require = createRequire(import.meta.url);

const demo = JSON.parse(fs.readFileSync(`/tmp/t6_demo_${VER}.json`, "utf8"));
const single = { ...demo, single: true, nameA: "Alex", nameB: "" };
single.positions = (demo.positions || []).map(p => ({ ...p, owner: "A" }));
single.otherAccounts = (demo.otherAccounts || []).map(a => ({ ...a, owner: "A" }));
single.incomeStreams = [];
single.contributions = { ...demo.contributions, spouseBMonthly: 0, ...(IS510 ? { contribPreTaxB: 0, contribRothB: 0 } : {}) };
if (single.incomeSources && single.incomeSources.ssB) single.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 67 };

// ── storage shim, pre-seeded so the app boots into the single plan ──
const PREFIX = "dc:";
window.storage = {
  async get(key) {
    const v = window.localStorage.getItem(PREFIX + key);
    if (v === null) throw new Error("key not found: " + key);
    return { key, value: v };
  },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { return { keys: [] }; },
};
window.localStorage.setItem(PREFIX + "danger_close:portfolio_v1", JSON.stringify(single));

require(`./dom_${VER}.cjs`);
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const React = require("react");

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + String(detail).slice(0, 160) : ""}`); }
};
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); };
const body = () => window.document.body;
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);

console.log(`t6 — SINGLE-FILER BRANCH (${VER})`);

await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush(); await flush();

{
  T("BOOT: cached single plan skips the landing screen", [...body().querySelectorAll("button.tab")].length === 26, String([...body().querySelectorAll("button.tab")].length));
  T("BOOT: single filer's name shows", (body().textContent || "").includes("Alex"));
}

// ═══ My Data: the B column must be gone ═══
await click(tabBtn("my data")); await flush();
{
  const t = (body().textContent || "");
  T("MYDATA: no Spouse-B salary field", !/Spouse B annual salary/.test(t));
  T("MYDATA: no Spouse-B contribution fields", !/Spouse B.*\$\/month/.test(t));
  if (IS510) {
    T("MYDATA (V510): A's Roth field still present", t.includes("Roth (401k/IRA) $/month"));
    const i = t.indexOf("Projected added by retirement:");
    T("MYDATA (V510): accrual readout renders for a single filer", i >= 0);
    if (i >= 0) {
      const seg = t.slice(i, i + 200);
      T("MYDATA (V510): readout carries no B segment (no ' · ' separator)", !seg.includes(" · "), seg.slice(0, 120));
    }
  }
}

// ═══ SS tab: couple-only machinery absent ═══
await click(tabBtn("ss")); await flush();
{
  const t = (body().textContent || "");
  T("SS: renders for a single filer", t.length > 6000);
  // ── KNOWN DEFECT PIN #3 (pre-existing; v5.9.2 and v5.10 identically) ──
  // The SS tab does not gate its Spouse-B sections on the household's `single` flag:
  // a single filer sees a phantom "SPOUSE B — BENEFIT BY CLAIMING AGE" card whose
  // benefit is INVENTED by the spousal-top-up derivation (50% of A's FRA) against a
  // $0 record and a placeholder DOB. The engines correctly model B at $0 (the tab even
  // prints a note saying so); the display layer conjures a spouse anyway. Found
  // 2026-08-06 by this suite. Pin documents today's behavior; when the SS tab's B
  // sections are gated on tl.single, flip these expectations.
  if (VER === "v5101" || VER === "v5102" || VER === "v511" || VER === "v512" || VER === "v513" || VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540"))) { // fixed at v5.10.1; holds for all later builds
    // ── FIXED in v5.10.1: the SS tab's Spouse-B sections are gated on the household's
    // single flag — no phantom claiming card, and the self-contradicting "$0/mo" note
    // goes with it (the engines were already correct: B modeled at $0). Also fixed:
    // the Post-car shortfall no longer subtracts the phantom B benefit for singles —
    // pinned below as a source invariant. Prior legs keep the dated pins (found
    // 2026-08-06; fixed v5.10.1). ──
    T("SS: no phantom Spouse-B claiming card for a single household", !/SPOUSE B — BENEFIT BY CLAIMING AGE/i.test(t));
    T("SS: no self-contradicting 'models Spouse B at $0' note", !/models Spouse B at \$0\/mo/i.test(t));
    const SRC = fs.readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
    T("SS: Post-car shortfall zeroes the B benefit for singles (source invariant)",
      SRC.split("(_single ? 0 : spouseBActual.benefit)").length === 3, "expected exactly 2 gated uses");
  } else {
  T("SS [KNOWN DEFECT]: phantom Spouse-B claiming card renders for a single household (fixed in v5.10.1; pre-fix state pinned here)",
    /SPOUSE B — BENEFIT BY CLAIMING AGE/i.test(t));
  T("SS [KNOWN DEFECT]: engine honestly models the phantom at $0 while the card shows a derived benefit (fixed in v5.10.1)",
    /models Spouse B at \$0\/mo/i.test(t));
  }
}

// ═══ v5.25 D-5: a single filer's retirement Other account has ONE possible owner ═══
// Consequence 3 of decision D-5. A one-item dropdown pretends to be a choice, so the owner is
// rendered fixed instead. This is the degenerate case the couple suites cannot see.
if (VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540"))) {
  await click(tabBtn("my data")); await flush();
  const sels = [...body().querySelectorAll("select")];
  const typeSels = sels.filter(s => [...s.options].some(o => o.value === "trad") && [...s.options].some(o => o.value === "hsa"));
  T("V525 SINGLE: the Other-accounts tax-type selector is present", typeSels.length > 0, `found ${typeSels.length}`);
  // No owner selector anywhere may offer B on a single household — the pre-existing rule — and
  // none may offer B on a retirement row, which is the new one.
  const ownerSels = sels.filter(s => [...s.options].some(o => o.value === "JT") || [...s.options].some(o => o.value === "A"));
  T("V525 SINGLE: no owner selector offers a B option",
    ownerSels.every(s => ![...s.options].some(o => o.value === "B")));
  // The example household's Rollover IRA is a trad row, so at least one row must render its owner
  // as fixed text rather than as a <select>. Count type selectors vs owner selectors: a fixed
  // owner means FEWER owner selectors than type selectors.
  const t = body().textContent || "";
  T("V526 SINGLE: the drives-tax disclosure is shown",
    t.includes("TAX TYPE DRIVES TAX, RMDs AND THE WITHDRAWAL TAB"));
}

// ═══ Engines walk: the sites that consume per-owner balances must not crash ═══
for (const name of ["roth", "withdrawal", "taxes", "irmaa", "monte carlo", "survivor", "what breaks"]) {
  const b = tabBtn(name);
  if (b) { await click(b); await flush(); }
  T(`ENGINE: ${name} renders on a single household`, !!b && (body().textContent || "").length > 6000);
}

console.log(`\nt6 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
