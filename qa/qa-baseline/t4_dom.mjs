// t4 — DOM TAB-WALK (baseline rebuild, 2026-08).
// Run: node t4_dom.mjs v592 | node t4_dom.mjs v510
// Mounts the real component in jsdom, loads the example household, clicks all 26 tabs,
// and asserts per-tab signature content plus cross-cutting UI contracts. Signature
// strings were grounded against a captured v5.9.2 DOM (cap_tabs.mjs), not guessed.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2] || "v510";
const IS510 = VER !== "v592"; // v5.10-family features (v510 and v5101)
require(`./dom_${VER}.cjs`);
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const g = window.__g;
const React = require("react");

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + String(detail).slice(0, 160) : ""}`); }
};
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
const has = (txt, s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(txt);

console.log(`t4 — DOM TAB-WALK (${VER})`);

// ═══ Landing screen ═══
await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
{
  const t = body().textContent || "";
  T("LANDING: guided setup offered", has(t, "Guided Setup"));
  T("LANDING: start fresh offered", has(t, "start fresh"));
  T("LANDING: restore backup offered", has(t, "Restore from Backup") || has(t, "restore a backup"));
  T("LANDING: example data offered", has(t, "example data"));
  T("LANDING: privacy statement present", has(t, "nothing leaves this browser") || has(t, "cached locally"));
}

// ═══ Load the example household ═══
const example = [...body().querySelectorAll("button, div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
T("LOAD: example-data control found", !!example);
await click(example); await flush(); await flush();
{
  const t = body().textContent || "";
  // Exact per-tag string: "v5.10" is a PREFIX of v5.10.1/v5.10.2, so a substring test
  // passed for the whole v5.10 family by luck and broke at v5.11. Map the tag explicitly.
  const _badge = VER === "v520" ? "v5.20" : VER === "v519" ? "v5.19" : VER === "v518" ? "v5.18" : VER === "v517" ? "v5.17" : VER === "v516" ? "v5.16" : VER === "v515" ? "v5.15" : VER === "v514" ? "v5.14" : VER === "v513" ? "v5.13" : VER === "v512" ? "v5.12" : VER === "v511" ? "v5.11" : VER === "v5102" ? "v5.10.2"
    : VER === "v5101" ? "v5.10.1" : IS510 ? "v5.10" : "v5.9.2";
  T(`SHELL: version badge reads ${_badge}`, t.includes(_badge));
  T("SHELL: amber example-data banner fires", has(t, "EXAMPLE DATA MODE") || has(t, "built-in example household"));
  T("SHELL: no red substitution warning on the demo", !has(t, "USING EXAMPLE NUMBERS, NOT YOUR DATA"));
  T("SHELL: no staleness strip on a current-year build", !has(t, "STALE DATA"));
}

// ═══ Tab strip ═══
const tabs = () => [...body().querySelectorAll("button.tab")];
{
  T("TABS: 26 tabs in full mode", tabs().length === 26, String(tabs().length));
  const labels = tabs().map(b => b.textContent.trim());
  T("TABS: canonical order starts my data → dashboard", labels[0] === "my data" && labels[1] === "dashboard");
  T("TABS: ask AI present", labels.includes("ask AI"));
}

// ═══ Walk every tab; capture text ═══
const per = {};
for (const b of tabs()) {
  await click(b); await flush();
  per[b.textContent.trim()] = (body().textContent || "").replace(/\s+/g, " ");
}
T("WALK: every tab rendered substantial content", Object.entries(per).every(([k, v]) => v.length > 6000),
  Object.entries(per).filter(([k, v]) => v.length <= 6000).map(([k, v]) => `${k}:${v.length}`).join(","));

const sig = (tab, strings) => { for (const s of strings) T(`${tab}: "${s.length > 34 ? s.slice(0, 34) + "…" : s}"`, has(per[tab] || "", s)); };

sig("my data", ["SALARY & 401(k) CONTRIBUTIONS", "SAVE & APPLY", "OTHER INCOME STREAMS", "EXPORT BACKUP"]);
sig("dashboard", ["Will my money last", "How much can I spend", "Can I survive a crash"]);
sig("trajectory", ["Guyton"]);
sig("expenses", ["drops off"]);
sig("income", ["INCOME FLOOR", "PENSION"]);
sig("ss", ["TRUST-FUND DEPLETION", "BREAKEVEN"]);
sig("grade", ["ESTATE READINESS"]);
sig("ranking", ["SCF", "Empower"]);
sig("guardrails", ["GUYTON-KLINGER", "80%", "120%"]);
sig("withdrawal", ["ORDER OF OPERATIONS", "Traditional"]);
sig("roth", ["WEALTH CROSSOVER", "CONVERSION", "RMD"]);
sig("taxes", ["QCD", "bracket"]);
sig("irmaa", ["lookback", "Affects"]);
sig("monte carlo", ["STOCHASTIC LONGEVITY", "LTC DISTRIBUTION", "SUCCESS"]);
sig("backtest", ["1966", "1929"]);
sig("what breaks", ["shock"]);
sig("survivor", ["widow", "years alone"]);
sig("stress", ["LTC MARATHON", "STAGFLATION", "Sharpe"]);
sig("checklist", ["Beneficiary", "SURVIVOR-CRITICAL"]);
sig("exit plan", ["CONFIRM THE MONEY WORKS", "LOCK IN HEALTH COVERAGE", "LANDMINE"]);
sig("positions", ["TICKER", "BALANCE"]);
sig("ask AI", ["EXECUTE", "OFFLINE", "EXACTLY WHAT"]);
sig("skins", ["TACTICAL", "paper"]);
sig("docs", ["FIELD MANUAL"]);
sig("verify", ["IRS Rev. Proc", "IRMAA"]);
sig("events", ["MEDICARE", "RMD", "HSA", "BACKUP"]);

// ═══ Verify tab reflects the version's check count ═══
{
  const v = per["verify"] || "";
  // v5.14 adds three IRMAA-indexation checks to the Verify tab (see t1's note).
  const _vCount = (VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520") ? "57" : IS510 ? "54" : "53";
  T(`VERIFY TAB: reports ${_vCount} checks`, v.includes(_vCount));
  T("VERIFY TAB: no failing marks rendered", !/✗/.test(v));
}

// ═══ v5.10 My Data contract (the accrual feature's visible surface) ═══
if (IS510) {
  const md = per["my data"] || "";
  T("V510 my data: hybrid pre-tax label", md.includes("Pre-tax (Traditional 401k/IRA)"));
  T("V510 my data: Roth monthly inputs", md.includes("Roth (401k/IRA) $/month"));
  T("V510 my data: accrual framing line", md.includes("the model still taxes nothing before retirement"));
  T("V510 my data: accrual readout renders", md.includes("Projected added by retirement:"));
  T("V510 my data: readout states the nominal-dollars rule", md.includes("no growth applied"));
  T("V510 my data: HSA exclusion stated", md.includes("neither Traditional nor Roth"));
  T("V510 verify: 402(g) line present", (per["verify"] || "").includes("402(g)"));
} else {
  const md = per["my data"] || "";
  T("V592 my data: no accrual readout yet", !md.includes("Projected added by retirement:"));
  T("V592 my data: no hybrid labels yet", !md.includes("Pre-tax (Traditional 401k/IRA)"));
}

// ═══ Simple Mode round-trip ═══
{
  const toggle = [...body().querySelectorAll("button")].find(b => /SHOW FEWER TABS/.test(b.textContent || ""));
  T("SIMPLE: toggle present", !!toggle);
  if (toggle) {
    await click(toggle);
    T("SIMPLE: six core tabs", tabs().length === 6, String(tabs().length));
    T("SIMPLE: exit control appears", [...body().querySelectorAll("button")].some(b => /SHOW ALL TABS/.test(b.textContent || "")));
    const back = [...body().querySelectorAll("button")].find(b => /SHOW ALL TABS/.test(b.textContent || ""));
    await click(back);
    T("SIMPLE: full strip restored", tabs().length === 26, String(tabs().length));
  }
}

// ═══ Unsaved-edits leave guard (v5.9.1/2 contract) ═══
{
  const myData = tabs().find(b => b.textContent.trim() === "my data");
  await click(myData); await flush();
  const input = [...body().querySelectorAll("input")].find(i => i.value !== "");
  T("GUARD: an editable field exists on My Data", !!input);
  if (input) {
    await act(async () => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      proto.set.call(input, String(input.value) + "1");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await flush();
    const chip = (body().textContent || "").includes("Unsaved changes");
    T("GUARD: dirty chip appears on edit", chip);
    const dash = tabs().find(b => b.textContent.trim() === "dashboard");
    await click(dash);
    const t = body().textContent || "";
    T("GUARD: leaving dirty My Data asks first", t.includes("You have unsaved edits in My Data"));
    T("GUARD: three-way choice offered", t.includes("SAVE & APPLY, THEN LEAVE") && t.includes("DISCARD & LEAVE") && t.includes("STAY"));
    const discard = [...body().querySelectorAll("button")].find(b => b.textContent.trim() === "DISCARD & LEAVE");
    if (discard) await click(discard);
    const active = [...body().querySelectorAll("button.tab.on")].map(b => b.textContent.trim());
    T("GUARD: discard proceeds to the target tab", active.includes("dashboard"), active.join(","));
  }
}

console.log(`\nt4 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
