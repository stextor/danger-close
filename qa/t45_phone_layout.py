#!/usr/bin/env python3
# t45 — THE APP FITS A PHONE (F-11) · real Chromium, the BUILT page (docs/SCOPE_PHONE_LAYOUT.md; added for v5.79).
#     python3 t45_phone_layout.py v579 [path/to/built/index.html]        (default: ../index.html, the run folder's copy)
#
# WHY A BROWSER. jsdom does no layout, so "no tab scrolls sideways at 390 px" cannot be tested there — and a structural
# check can pass while the page still overflows: the v5.73 audit's own fix shape (the selector grid → minmax(0, 1fr)) was
# measured at the v5.79 scope to leave all 26 tabs overflowing. The claim is tested where it lives.
#
# FAILS, NEVER SKIPS (decision D-2). If Chromium cannot launch, or the page is missing, or the page is not THIS build (its
# footer must name the tag), this suite reports a failure — a session without a browser cannot report green.
#
# THE GATE TRAP (UsabilityFlaws.md, v5.38 errata): the disclaimer gate sets overflow:hidden on html/body and releases it
# only in #dc-dg-accept's click handler, which is disabled until #dc-dg-check is ticked; a harness that clicks past it any
# other way measures the gate's scroll lock and reads it as an app defect. G-2 asserts the lock is released first.
#
# RUNS ON THE CURRENT LEG ONLY, by construction: it needs a built page, and the run folder carries exactly one (the tree's).
# The prior build's behaviour is recorded in the scope (every tab overflowed at 390 on v5.78) and was re-run at the build.
#
# ⚠ OUTPUT: runsuite.sh's `tally` SUMS every "<n> passed" in the output — so the word appears on the final line only.
import os, sys, re

VER = sys.argv[1] if len(sys.argv) > 1 else ""
KNOWN_VERSIONS = ["v579", "v580", "v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598", "v599", "v600"]
HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(HERE, "..", "index.html")
ok = 0; bad = 0; fails = []
def T(name, cond, detail=""):
    global ok, bad
    if cond: ok += 1
    else: bad += 1; fails.append(f"  \u2717 {name}" + (f" — {detail}" if detail else ""))
def finish():
    print("\n".join(fails)); print(f"\nt45 SUITE ({VER}): {ok} passed, {bad} failed"); sys.exit(1 if bad else 0)

print(f"t45 — THE APP FITS A PHONE ({VER}) · page {os.path.basename(PAGE)}")
if VER not in KNOWN_VERSIONS:
    T(f"0-0 version tag {VER!r} is registered in this suite", False, f"registered: {KNOWN_VERSIONS}"); finish()
T("0-1 the built page exists", os.path.exists(PAGE), PAGE)
if not os.path.exists(PAGE): finish()
html = open(PAGE, encoding="utf-8").read()
dotted = "v" + VER[1] + "." + VER[2:]
T(f"0-2 the page is THIS build: its footer names {dotted}", f"DANGER CLOSE {dotted} \u2502 Not financial advice" in html,
  "a page left over from another release is not tested by mistake")
try:
    from playwright.sync_api import sync_playwright
except Exception as e:
    T("0-3 Playwright imports (a browser is REQUIRED; this suite never skips)", False, repr(e)); finish()

VIEWS = [("phone", 390, 844, True, True), ("tablet", 820, 1180, False, True), ("desktop", 1440, 900, False, False)]
MEASURE = """() => { const d = document.documentElement; return { vw: d.clientWidth, sw: d.scrollWidth }; }"""
try:
    with sync_playwright() as p:
        try:
            b = p.chromium.launch()
        except Exception as e:
            T("0-3 Chromium launches (a browser is REQUIRED; this suite never skips)", False, repr(e)[:200]); finish()
        T("0-3 Chromium launches", True)
        tabsSeen = {}
        for name, w, h, mobile, touch in VIEWS:
            pg = b.new_page(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=touch)
            # "Use example data" starts the Monte Carlo on the page's main thread; under a loaded machine (the full suite
            # running alongside) that measured past Playwright's 30 s click default and failed a correct page at the
            # v5.79 build. 120 s is a deliberate ceiling for a test that must not fail on load, only on layout.
            pg.set_default_timeout(120000)
            pg.goto("file://" + PAGE); pg.wait_for_timeout(1200)
            gate = pg.evaluate(MEASURE)
            T(f"G-1 {name}: the disclaimer gate fits ({gate['sw']} ≤ {gate['vw']})", gate["sw"] <= gate["vw"])
            pg.check("#dc-dg-check"); pg.click("#dc-dg-accept"); pg.wait_for_timeout(600)
            st = pg.evaluate("document.body.getAttribute('style')")
            T(f"G-2 {name}: the gate's scroll lock is RELEASED before anything is measured", st in ("", None), repr(st))
            if st not in ("", None): pg.close(); continue
            pg.get_by_text("Use example data", exact=False).first.click(); pg.wait_for_timeout(2200)
            # From v5.81 (F-12) a phone below 600 px has no tab grid — it has ONE tab menu — so move between tabs the way a user
            # of this viewport does. At v5.81 this suite still clicked the hidden grid buttons on the phone and timed out.
            menu = pg.locator('select[aria-label="Choose a tab"]')
            use_menu = menu.count() == 1 and menu.is_visible()
            if use_menu: tabs = pg.eval_on_selector_all('select[aria-label="Choose a tab"] option', "els => els.map(e => e.value)")
            else: tabs = pg.eval_on_selector_all("button.tab", "els => els.map(e => e.textContent.trim())")
            tabsSeen[name] = len(tabs)
            over = []
            for t in tabs:
                if use_menu: menu.select_option(t)
                else: pg.locator("button.tab", has_text=t).first.click()
                pg.wait_for_timeout(500)
                m = pg.evaluate(MEASURE)
                if m["sw"] > m["vw"]: over.append(f"{t} {m['sw']}")
                T(f"L-{name} '{t}': the page does not scroll sideways at {w} px (scrollWidth {m['sw']} vs {m['vw']})", m["sw"] <= m["vw"])
            if name == "phone":
                print(f"  measured at 390: {len(tabs) - len(over)} of {len(tabs)} tabs fit" + (f"; over: {over}" if over else ""))
            pg.close()
        T("0-4 every viewport found the full tab strip (26 tabs)", all(v == 26 for v in tabsSeen.values()) and len(tabsSeen) == 3, str(tabsSeen))
        b.close()
except SystemExit:
    raise
except Exception as e:
    T("0-5 the browser session completed", False, repr(e)[:300])
finish()
