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
KNOWN_VERSIONS = ["v579", "v580", "v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598", "v599", "v600", "v601", "v602", "v603", "v604", "v605", "v606", "v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639"]
HERE = os.path.dirname(os.path.abspath(__file__))
POSTF20 = VER in ["v638", "v639"]   # v6.38 (F-20): section S holds builds from v6.38 on; a list, so the next registration widens it by hand
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

        # ── S · v6.38 (F-20 — docs/SCOPE_F20_INCOME_TAB_PHONE_V638.md): a plan WITH income streams, and text that overprints ─────────
        # The checks above run on the example, which has no income stream (boundaries.mjs `income_streams` ON), so through v6.37 they never
        # saw the Income tab's stream list widen the page (504-627 px at 390). And a page that does not scroll sideways can still print text
        # over its neighbours — v6.37's Income tab did, on every plan, in its three income cards and each phase card's figure row — which
        # scrollWidth cannot see. OVERLAP counts pairs of visible text boxes from different elements overlapping by more than 3 px each way:
        # SVG text (d3 places chart labels on purpose) and text inside a collapsed <details> are skipped, and each box is first clipped to
        # every scrolling or clipping box around it, its own element included (a scrolling <pre>'s hidden lines are not visible text).
        # Only the Income tab is held to zero here: six other tabs still overprint on a phone (UsabilityFlaws F-30, disclosed in §13).
        OVERLAP = """() => { const clip = (e, r) => { let L = r.left, T = r.top, R = r.right, B = r.bottom;
            for (let a = e; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.display === 'none' || cs.visibility === 'hidden') return null;
              if (a !== e || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const q = a.getBoundingClientRect();
                if (cs.overflowX !== 'visible') { L = Math.max(L, q.left); R = Math.min(R, q.right); } if (cs.overflowY !== 'visible') { T = Math.max(T, q.top); B = Math.min(B, q.bottom); } } }
            return (R - L > 0 && B - T > 0) ? { left: L, top: T, right: R, bottom: B } : null; };
          const leaves = [...document.querySelectorAll('body *')].filter(e => !e.closest('svg') && !(e.closest('details:not([open])') && !e.closest('summary'))
            && !['OPTION', 'SELECT', 'SCRIPT', 'STYLE'].includes(e.tagName) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
          const R = []; for (const e of leaves) { const rg = document.createRange(); for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) {
            rg.selectNodeContents(n); for (const r0 of rg.getClientRects()) { const r = clip(e, r0); if (r) R.push({ t: n.textContent.trim().slice(0, 24), r, e }); } } }
          const hits = []; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { if (R[i].e === R[j].e) continue; const a = R[i].r, b = R[j].r;
            const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (ox > 3 && oy > 3) hits.push(R[i].t + ' / ' + R[j].t); } return hits; }"""
        # The page's own heading box ("Success rate" over its 30 px figure, line-height 1) touches by design; only the Income tab's card is read.
        INCOME_OVERLAP = OVERLAP.replace("document.querySelectorAll('body *')", "[...document.querySelectorAll('.card')].filter(c => (c.textContent || '').includes('INCOME SOURCES & PORTFOLIO DRAW ANALYSIS')).flatMap(c => [...c.querySelectorAll('*')])")
        FIX = os.path.join(HERE, "tools", "fixture", "f20_streams_plan.json")
        T("S-0 the stream-plan fixture exists (qa/tools/fixture/f20_streams_plan.json)", os.path.exists(FIX), FIX)
        import json as _json
        PLAN = _json.load(open(FIX, encoding="utf-8")) if os.path.exists(FIX) else None
        def open_plan(w, h, mobile, plan):
            pg = b.new_page(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile); pg.set_default_timeout(120000)
            pg.goto("file://" + PAGE); pg.wait_for_timeout(1200); pg.check("#dc-dg-check"); pg.click("#dc-dg-accept"); pg.wait_for_timeout(500)
            if plan is None:
                pg.get_by_text("Use example data", exact=False).first.click(); pg.wait_for_timeout(2500)
            else:
                pg.evaluate("([p, x]) => { localStorage.setItem('dc:danger_close:portfolio_v1', JSON.stringify(p)); localStorage.setItem('dc:danger_close:expenses_v1', JSON.stringify(x)); }", [plan["P"], plan["X"]])
                pg.reload(); pg.wait_for_timeout(2500)
                if pg.locator("#dc-dg-check").count() and pg.locator("#dc-dg-check").is_visible():
                    pg.check("#dc-dg-check"); pg.click("#dc-dg-accept"); pg.wait_for_timeout(500)
                pg.wait_for_timeout(1500)
            return pg
        def to_tab(pg, t):
            menu = pg.locator('select[aria-label="Choose a tab"]')
            if menu.count() == 1 and menu.is_visible(): menu.select_option(t)
            else:
                if pg.get_by_text("SHOW ALL TABS", exact=False).count(): pg.get_by_text("SHOW ALL TABS", exact=False).first.click()
                pg.locator("button.tab", has_text=t).first.click()
            pg.wait_for_timeout(600)
        if not POSTF20: print(f"  · S skipped: {VER} predates v6.38 (F-20)")
        if PLAN is not None and POSTF20:
            pg = open_plan(390, 844, True, PLAN)
            st = pg.evaluate("document.body.getAttribute('style')")
            T("S-1 phone, stream plan: the gate's scroll lock is released", st in ("", None), repr(st))
            tabs = pg.eval_on_selector_all('select[aria-label="Choose a tab"] option', "els => els.map(e => e.value)")
            T("S-2 phone, stream plan: the tab menu lists 26 tabs", len(tabs) == 26, str(len(tabs)))
            for t in tabs:
                to_tab(pg, t); m = pg.evaluate(MEASURE)
                T(f"S-3 phone, stream plan, '{t}': the page does not scroll sideways at 390 px (scrollWidth {m['sw']} vs {m['vw']})", m["sw"] <= m["vw"])
            to_tab(pg, "income")
            T("S-4 SETUP: the Income tab lists the plan's four streams", pg.locator(".dc-streamrow").count() == 4, str(pg.locator(".dc-streamrow").count()))
            hits = pg.evaluate(INCOME_OVERLAP)
            T(f"S-5 phone, stream plan: no text on the Income tab prints over other text ({len(hits)} pairs)", not hits, "; ".join(hits[:6]))
            pg.close()
            pg = open_plan(390, 844, True, None); to_tab(pg, "income"); hits = pg.evaluate(INCOME_OVERLAP)
            T(f"S-6 phone, the example: no text on the Income tab prints over other text ({len(hits)} pairs)", not hits, "; ".join(hits[:6]))
            pg.close()
            for w, h in ((820, 1180), (1440, 900)):
                pg = open_plan(w, h, False, PLAN); to_tab(pg, "income")
                rows = pg.evaluate("() => [...document.querySelectorAll('.dc-streamrow')].map(r => [...r.children].map(c => Math.round(c.getBoundingClientRect().top)))")
                T(f"S-7 {w} px, stream plan: each stream row's four parts share one line (the phone rules do not reach this width)",
                  len(rows) == 4 and all(len(r) == 4 and len(set(r)) == 1 for r in rows), str(rows))
                hits = pg.evaluate(INCOME_OVERLAP)
                T(f"S-8 {w} px, stream plan: no text on the Income tab prints over other text ({len(hits)} pairs)", not hits, "; ".join(hits[:6]))
                pg.close()
        b.close()
except SystemExit:
    raise
except Exception as e:
    T("0-5 the browser session completed", False, repr(e)[:300])
finish()
