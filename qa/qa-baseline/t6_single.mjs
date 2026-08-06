// t6 — SINGLE-FILER BRANCH (baseline rebuild, 2026-08).
// Run: node t6_single.mjs v592 | node t6_single.mjs v510
// Seeds storage with a single-filer plan (the demo household mutated to single, all
// positions reassigned to A) BEFORE mount, so the app boots straight into the branch
// the couple-centric demo never exercises: no Spouse-B fields, no B breakeven card,
// engines running on a one-person household.
import { execSync } from "child_process";

const VER = process.argv[2] || "v510";
const IS510 = VER === "v510";

// Dump the demo portfolio in a separate process (the app bundle must not run in this
// JSDOM environment twice), then mutate it to a single filer.
execSync(`node --input-type=module -e "
const m = await import('/home/claude/baseline/qa/app_${VER}.mjs');
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
  T("SS [KNOWN DEFECT]: phantom Spouse-B claiming card renders for a single household (fix pending)",
    /SPOUSE B — BENEFIT BY CLAIMING AGE/i.test(t));
  T("SS [KNOWN DEFECT]: engine honestly models the phantom at $0 while the card shows a derived benefit",
    /models Spouse B at \$0\/mo/i.test(t));
}

// ═══ Engines walk: the sites that consume per-owner balances must not crash ═══
for (const name of ["roth", "withdrawal", "taxes", "irmaa", "monte carlo", "survivor", "what breaks"]) {
  const b = tabBtn(name);
  if (b) { await click(b); await flush(); }
  T(`ENGINE: ${name} renders on a single household`, !!b && (body().textContent || "").length > 6000);
}

console.log(`\nt6 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
