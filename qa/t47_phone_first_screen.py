#!/usr/bin/env python3
# t47 — A PHONE'S FIRST SCREEN SHOWS THE PLAN (F-12) · real Chromium, the BUILT page (docs/SCOPE_PHONE_FIRST_SCREEN.md; v5.81).
#     python3 t47_phone_first_screen.py v581 [path/to/built/index.html]        (default: ../index.html, the run folder's copy)
#
# WHAT v5.81 CHANGED. Below 600 px wide (D-1) the 26-tab grid gives way to ONE native tab menu (D-2), and the retirement cards and
# allocation strip fold into one line that keeps the chosen date and success rate (D-3), collapsed on every visit (D-4). On
# v5.80 the selected tab's content began at y = 1005 of an 844 px screen (measured on the live build); on v5.81 at 582 with the
# example data's banner. Desktop and tablet must not change: phone-only elements have no box there.
#
# THE GUARD. Leaving My Data with unsaved edits raises "You have unsaved edits in My Data". The phone menu goes through the same
# selectTab as the grid; G-1 proves it by editing a field and choosing another tab FROM THE MENU.
#
# Like t45: current leg only (it needs the built page); FAILS, never skips, without a browser or on another release's page; the
# gate is released the only way that releases its scroll lock; "passed" appears once, on the last line (tally sums them).
import os, sys, re
VER = sys.argv[1] if len(sys.argv) > 1 else ""
KNOWN_VERSIONS = ["v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598", "v599", "v600"]
HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(HERE, "..", "index.html")
ok = 0; bad = 0; fails = []
def T(name, cond, detail=""):
    global ok, bad
    if cond: ok += 1
    else: bad += 1; fails.append(f"  \u2717 {name}" + (f" — {detail}" if detail else ""))
def finish():
    print("\n".join(fails)); print(f"\nt47 SUITE ({VER}): {ok} passed, {bad} failed"); sys.exit(1 if bad else 0)
print(f"t47 — A PHONE'S FIRST SCREEN SHOWS THE PLAN ({VER}) · page {os.path.basename(PAGE)}")
if VER not in KNOWN_VERSIONS: T(f"0-0 version tag {VER!r} is registered", False, f"registered: {KNOWN_VERSIONS}"); finish()
T("0-1 the built page exists", os.path.exists(PAGE), PAGE)
if not os.path.exists(PAGE): finish()
dotted = "v" + VER[1] + "." + VER[2:]
T(f"0-2 the page is THIS build: its footer names {dotted}", f"DANGER CLOSE {dotted} \u2502 Not financial advice" in open(PAGE, encoding="utf-8").read())
try:
    from playwright.sync_api import sync_playwright
except Exception as e:
    T("0-3 Playwright imports (a browser is REQUIRED; this suite never skips)", False, repr(e)); finish()
BOX = "(sel) => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length"
def open_app(p, w, h, mobile):
    pg = p.new_page(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile); pg.set_default_timeout(120000)
    pg.goto("file://" + PAGE); pg.wait_for_timeout(1200)
    pg.check("#dc-dg-check"); pg.click("#dc-dg-accept"); pg.wait_for_timeout(600)
    st = pg.evaluate("document.body.getAttribute('style')")
    T(f"0-4 {w}px: the gate's scroll lock is released before anything is measured", st in ("", None), repr(st))
    pg.get_by_text("Use example data", exact=False).first.click(); pg.wait_for_timeout(2500)
    return pg
# ── S · structure, from the run folder's source (../<tag>.jsx): ONE tab list, ONE way to change tab ────────────────────────
SRC = os.path.join(HERE, "..", f"{VER}.jsx")
T("S-0 the run folder's source for this tag exists", os.path.exists(SRC), SRC)
if os.path.exists(SRC):
    src = open(SRC, encoding="utf-8").read()
    # The COMPLETE list, taken from its own definition: SIMPLE_TABS starts with the same three tab names, so a prefix count
    # reported a second copy of correct source (a first draft of this check did exactly that).
    mdef = re.search(r"const TAB_IDS = (\[[^\]]*\]);", src); full = mdef.group(1) if mdef else None
    T("S-1 the tab list is defined ONCE (TAB_IDS), and that complete list appears nowhere else",
      src.count("const TAB_IDS = ") == 1 and full is not None and src.count(full) == 1,
      f"TAB_IDS defs {src.count('const TAB_IDS = ')}, copies of the full list {src.count(full) if full else 'n/a'}")
    T("S-2 ONE tab-selection function, and the unsaved-My-Data guard exists exactly once", src.count("const selectTab = ") == 1 and src.count("MYDATA_DIRTY) { setLeaveTarget(t); return; }") == 1)
    T("S-3 the phone menu changes tab THROUGH selectTab (so the guard cannot be bypassed)", "onChange={e => selectTab(e.target.value)}" in src)
    T("S-4 the phone menu's options come from visibleTabs (Simple Mode cannot desync it)", "{visibleTabs.map(t => <option key={t} value={t}>" in src)
    T("S-5 the grid reads the same list and the same function", "{visibleTabs.map(t => (" in src and "onClick={() => selectTab(t)}>{tabLabel(t)}</button>" in src)
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch()
        except Exception as e: T("0-3 Chromium launches (REQUIRED; never skips)", False, repr(e)[:200]); finish()
        T("0-3 Chromium launches", True)
        # ── PHONE ─────────────────────────────────────────────────────────────────────────────────────────────────────
        pg = open_app(b, 390, 844, True)
        T("P-1 at 390 px the 26-tab grid has no box", pg.evaluate(BOX, "button.tab") == 0, f"{pg.evaluate(BOX, 'button.tab')} tab buttons visible")
        sel = pg.locator('select[aria-label="Choose a tab"]')
        T("P-2 the tab menu is visible", sel.count() == 1 and sel.is_visible())
        n_all = pg.evaluate("document.querySelectorAll('select[aria-label=\"Choose a tab\"] option').length")
        T("P-3 the menu lists all 26 tabs", n_all == 26, str(n_all))
        pg.get_by_role("button", name=re.compile("FEWER")).click(); pg.wait_for_timeout(500)
        n_simple = pg.evaluate("document.querySelectorAll('select[aria-label=\"Choose a tab\"] option').length")
        T("P-4 Simple Mode from the phone: the menu lists only the six core tabs", n_simple == 6, str(n_simple))
        pg.get_by_role("button", name=re.compile("ALL")).click(); pg.wait_for_timeout(500)
        sel.select_option("montecarlo"); pg.wait_for_timeout(1500)
        on = pg.evaluate("(() => { const b = document.querySelector('button.tab.on'); return b ? b.textContent.trim() : ''; })()")
        T("P-5 choosing MONTE CARLO in the menu switches to it", on == "monte carlo", on)
        line = pg.get_by_role("button", name=re.compile(r"^PLAN: RETIRE"))
        T("P-6 the plan-summary line shows the chosen date and a success rate", line.count() == 1 and re.search(r"PLAN: RETIRE .+ · (\d+\.\d%|\.\.\.) ", line.inner_text() + " ") is not None, line.inner_text() if line.count() else "(none)")
        T("P-7 the summary starts COLLAPSED (no retirement card has a box)", pg.evaluate(BOX, ".rbtn") == 0)
        line.click(); pg.wait_for_timeout(400)
        T("P-8 one tap opens it (three retirement cards visible)", pg.evaluate(BOX, ".rbtn") == 3, str(pg.evaluate(BOX, ".rbtn")))
        line.click(); pg.wait_for_timeout(400)
        T("P-9 another tap closes it", pg.evaluate(BOX, ".rbtn") == 0)
        sel.select_option("dashboard"); pg.wait_for_timeout(1500)
        top = pg.evaluate("(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (/THE THREE QUESTIONS/i.test(n.textContent)) { const r = document.createRange(); r.selectNodeContents(n); return Math.round(r.getBoundingClientRect().top); } } return -1; })()")
        ban = pg.evaluate("(() => { const e = [...document.querySelectorAll('div')].find(d => /^ⓘ EXAMPLE DATA MODE/.test((d.innerText||'').trim()) && d.children.length < 12); return e ? Math.round(e.getBoundingClientRect().height) : 0; })()")
        T("P-10 the selected tab's content begins on the FIRST screen (example mode; v5.80: 1005)", 0 < top < 700, f"y = {top}")
        T("P-11 …and in the top half without the example banner (content top minus the banner's height)", 0 < top - ban < 450, f"y = {top} − {ban}")
        print(f"  measured at 390: content begins at y = {top} (example mode; banner {ban} px)")
        # G · the unsaved-My-Data guard, reached through the MENU
        sel.select_option("mydata"); pg.wait_for_timeout(1500)
        inp = pg.locator("input[type=text], input:not([type])").first
        if inp.count():
            inp.click(); inp.press("End"); inp.type("x"); pg.wait_for_timeout(600)
        sel.select_option("dashboard"); pg.wait_for_timeout(800)
        # innerText applies the label's CSS text-transform (uppercase), so compare case-insensitively.
        prompt = "you have unsaved edits in my data" in pg.evaluate("document.body.innerText").lower()
        on = pg.evaluate("(() => { const b = document.querySelector('button.tab.on'); return b ? b.textContent.trim() : ''; })()")
        T("G-1 with unsaved My Data edits, leaving through the phone MENU raises the same prompt, and the tab does not change", prompt and on == "my data", f"prompt={prompt}, on={on!r}")
        pg.close()
        # ── TABLET and DESKTOP: nothing phone-only has a box; the grid and the cards are there ─────────────────────────────
        for w, h in [(820, 1180), (1440, 900)]:
            pg = open_app(b, w, h, False)
            T(f"D-1 {w}px: no phone-only element has a box", pg.evaluate(BOX, ".dc-phone-only") == 0, str(pg.evaluate(BOX, ".dc-phone-only")))
            T(f"D-2 {w}px: the tab grid is visible (26 tabs)", pg.evaluate(BOX, "button.tab") == 26, str(pg.evaluate(BOX, "button.tab")))
            T(f"D-3 {w}px: the retirement cards are visible, uncollapsed", pg.evaluate(BOX, ".rbtn") == 3, str(pg.evaluate(BOX, ".rbtn")))
            pg.close()
        b.close()
except SystemExit:
    raise
except Exception as e:
    T("0-5 the browser session completed", False, repr(e)[:300])
finish()
