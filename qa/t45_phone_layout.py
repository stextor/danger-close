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
KNOWN_VERSIONS = ["v579", "v580", "v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598", "v599", "v600", "v601", "v602", "v603", "v604", "v605", "v606", "v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639", "v640", "v641", "v642", "v643", "v644"]
HERE = os.path.dirname(os.path.abspath(__file__))
def _vnum(v):   # "v640" -> 640; anything else -> -1. From v6.40 the two gates below compare numbers, so a registration that forgets them cannot
    m = re.fullmatch(r"v(\d+)", v or "")   # turn section S into a silent skip (through v6.39 they were hand-widened lists)
    return int(m.group(1)) if m else -1
F30 = _vnum(VER) >= 640       # v6.40 (F-30, docs/SCOPE_F30_ROTH_STRESS_PHONE_V640.md): section S also holds the Roth and Stress tabs
POSTF20 = _vnum(VER) >= 638   # v6.38 (F-20): section S holds builds from v6.38 on
F30B = _vnum(VER) >= 641      # v6.41 (F-30 second part, F-31, docs/SCOPE_F30B_PHONE_V641.md): section S also holds My Data, SS, Expenses, Taxes
F32 = _vnum(VER) >= 642       # v6.42 (F-32, F-33, docs/SCOPE_F32_UI_SIZE_V642.md): section S also holds UI SIZE above 100% and phones under 360 px
PAGE = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(HERE, "..", "index.html")
# v6.41: the tallies have names no check would reuse. The first v6.41 build set a module-level `ok = <bool>` in S-10, which replaced the
# pass counter and printed "8 passed" for about 220 checks (found by the build review); a failure still counted, so only the tally lied.
_N_PASS = 0; bad = 0; fails = []
def T(name, cond, detail=""):
    global _N_PASS, bad
    if cond: _N_PASS += 1
    else: bad += 1; fails.append(f"  \u2717 {name}" + (f" — {detail}" if detail else ""))
def finish():
    print("\n".join(fails)); print(f"\nt45 SUITE ({VER}): {_N_PASS} passed, {bad} failed"); sys.exit(1 if bad else 0)

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
        # S-5/S-6 hold the Income tab to zero; S-9 (v6.40) adds the Roth and Stress tabs and S-10 (v6.41) the other four F-30 tabs.
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
        # v6.40: the same, for the whole page less that heading box (the h1's block, whose right side holds "Success rate" and its figure). The
        # pair it makes is a line-box touch, not overprinting: it crosses the 3 px threshold only when the web fonts load or UI SIZE is 150%.
        PAGE_OVERLAP = OVERLAP.replace("document.querySelectorAll('body *')", "(() => { const h = document.querySelector('h1'), hd = h && h.parentElement && h.parentElement.parentElement; return [...document.querySelectorAll('body *')].filter(e => !(hd && hd.contains(e))); })()")
        HEADER_OK = "() => { const h = document.querySelector('h1'), hd = h && h.parentElement && h.parentElement.parentElement; return !!hd && /DANGER CLOSE/.test(h.textContent) && /Success rate/.test(hd.textContent) && !/Monte Carlo|Roth|IRMAA/.test(hd.textContent.replace(/Monte Carlo tab/g, '')); }"
        ZOOM = "() => { const d = [...document.querySelectorAll('#root div')].find(e => e.style.zoom); return d ? d.style.zoom : ''; }"
        INCOME_OVERLAP = OVERLAP.replace("document.querySelectorAll('body *')", "[...document.querySelectorAll('.card')].filter(c => (c.textContent || '').includes('INCOME SOURCES & PORTFOLIO DRAW ANALYSIS')).flatMap(c => [...c.querySelectorAll('*')])")
        FIX = os.path.join(HERE, "tools", "fixture", "f20_streams_plan.json")
        T("S-0 the stream-plan fixture exists (qa/tools/fixture/f20_streams_plan.json)", os.path.exists(FIX), FIX)
        import json as _json
        PLAN = _json.load(open(FIX, encoding="utf-8")) if os.path.exists(FIX) else None
        SEED = "(() => { let a = 105; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })()"
        def open_plan(w, h, mobile, plan, zoom=None, seed=False):
            pg = b.new_page(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile); pg.set_default_timeout(120000)
            if seed: pg.add_init_script(SEED)   # v6.41: S-10 seeds Math.random, so its Monte Carlo figures are the same every run
            if zoom: pg.add_init_script("localStorage.setItem('dc:danger_close:ui_scale_v1', '" + str(zoom) + "')")   # UI SIZE, read at load
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
            # v6.40 (F-30): the Roth and Stress tabs. Through v6.39 six of their grids printed text over itself below 600 px (Roth 70 and Stress 30
            # pairs at 390 on the example), the Stress scenario table at 600-679 px too, and at UI SIZE above 100% in any narrow window. The whole
            # page is read except the heading box (PAGE_OVERLAP above), and each zoomed case first checks that UI SIZE took effect.
            if F30:
                cases = [(w, None, True, pl) for pl in (None, PLAN) for w in (360, 390, 430)] + [(w, None, False, None) for w in (600, 640)] \
                      + [(w, 130, w < 600, None) for w in (390, 600, 800)]
                first = True
                for w, zoom, mobile, pl in cases:
                    pg = open_plan(w, 844 if mobile else 900, mobile, pl, zoom)
                    if first:
                        T("S-9 SETUP: the heading box S-9 leaves out is found, and holds only the heading (no tab content)", pg.evaluate(HEADER_OK)); first = False
                    if zoom:
                        z = pg.evaluate(ZOOM)
                        T(f"S-9 SETUP {w} px: UI SIZE {zoom}% took effect (the app's zoom reads {z!r})", z == str(zoom / 100).rstrip("0").rstrip("."), z)
                    for t in ("roth", "stress"):
                        to_tab(pg, t); pg.wait_for_timeout(900); hits = pg.evaluate(PAGE_OVERLAP); m = pg.evaluate(MEASURE)
                        T(f"S-9 {w} px{' at UI SIZE ' + str(zoom) + '%' if zoom else ''}, {'stream plan' if pl else 'the example'}: no text on the {t} tab prints over other text ({len(hits)} pairs), and the page does not scroll sideways ({m['sw']} vs {m['vw']})",
                          not hits and m["sw"] <= m["vw"], "; ".join(hits[:6]))
                    pg.close()
            else:
                print(f"  · S-9 skipped: {VER} predates v6.40 (F-30's Roth and Stress tabs)")
            # v6.41 (F-30 second part): My Data, Social Security, Expenses and Taxes, and the Income tab beside them. Through v6.40 their v5.79
            # grids printed text over itself on a phone (My Data 8, SS 10, Expenses 4, Taxes 2 pairs at 390 px; 12/19/18/4 at 360), the Expenses
            # category column ran Transportation under its item at every width, the Roth calendar's CONVERT labels ran past their cards below
            # about 690 px, a Withdrawal panel widened a 360 px page and a Monte Carlo panel overprinted there, and the stream plan's Income tab
            # was 626 px wide in a 600 px window (F-31). Tabs are clicked by their exact label on a desktop (has_text would match "ss" in "stress").
            def to_tab_x(pg, t):
                menu = pg.locator('select[aria-label="Choose a tab"]')
                if menu.count() == 1 and menu.is_visible(): menu.select_option(t)
                else:
                    if pg.get_by_text("SHOW ALL TABS", exact=False).count(): pg.get_by_text("SHOW ALL TABS", exact=False).first.click()
                    lab = {"mydata": "my data", "montecarlo": "monte carlo"}.get(t, t)
                    found = pg.evaluate("(l) => { const b = [...document.querySelectorAll('button.tab')].find(x => x.textContent.trim().toLowerCase() === l); if (b) b.click(); return !!b; }", lab)
                    T(f"S-10 SETUP: the {t} tab button was found by its label", found)
                pg.wait_for_timeout(900)
                if t == "montecarlo":   # v6.42: the mortgage what-if renders its results later; measure once nothing is re-running
                    for _ in range(120):
                        if not pg.evaluate("() => /Recalculating both scenarios|RE-RUNNING/.test(document.body.innerText)"): break
                        pg.wait_for_timeout(500)
            if F30B:
                F5 = ("mydata", "ss", "expenses", "taxes", "income")
                cases = [(w, None, True, pl, F5) for pl in (None, PLAN) for w in (360, 390, 430)] + [(w, None, False, None, F5) for w in (600, 640)] \
                      + [(390, 130, True, None, F5), (360, None, True, None, ("withdrawal", "montecarlo"))] \
                      + [(w, None, False, None, ("expenses",)) for w in (1024, 1440)]
                for w, zoom, mobile, pl, tabs5 in cases:
                    pg = open_plan(w, 844 if mobile else 900, mobile, pl, zoom, seed=True)
                    if zoom:
                        z = pg.evaluate(ZOOM)
                        T(f"S-10 SETUP {w} px: UI SIZE {zoom}% took effect (the app's zoom reads {z!r})", z == str(zoom / 100).rstrip("0").rstrip("."), z)
                    for t in tabs5:
                        to_tab_x(pg, t); hits = pg.evaluate(PAGE_OVERLAP); m = pg.evaluate(MEASURE)
                        T(f"S-10 {w} px{' at UI SIZE ' + str(zoom) + '%' if zoom else ''}, {'stream plan' if pl else 'the example'}: no text on the {t} tab prints over other text ({len(hits)} pairs), and the page does not scroll sideways ({m['sw']} vs {m['vw']})",
                          not hits and m["sw"] <= m["vw"], "; ".join(hits[:6]))
                    pg.close()
                # The Roth calendar: below 700 px the phone's card layout (several cards a row, each at least 84 px wide), from 700 px its nine columns.
                CAL = """() => { const g = [...document.querySelectorAll('div')].find(d => (d.className || '').toString().includes('dc-cards-sub700')); if (!g) return null;
                  const tops = [...g.children].map(c => Math.round(c.getBoundingClientRect().top)); const first = tops.filter(t => t === tops[0]).length;
                  return { first, minw: Math.min(...[...g.children].map(c => c.getBoundingClientRect().width)) }; }"""
                for w, want in ((640, "cards"), (700, "nine")):
                    pg = open_plan(w, 900, False, None, seed=True); to_tab_x(pg, "roth"); c = pg.evaluate(CAL)
                    cal_ok = c is not None and ((want == "cards" and 2 <= c["first"] < 9 and c["minw"] >= 84) or (want == "nine" and c["first"] == 9))
                    T(f"S-10 {w} px: the Roth calendar shows {'its card layout (several cards a row, each 84 px or more)' if want == 'cards' else 'its nine columns'} ({c})", cal_ok, str(c))
                    pg.close()
                # E2: the one-time list's box scrolls below a 390 px phone and not at 390 (the first v6.41 build's floor ignored the row's padding and
                # scrolled to about 410 px, hiding part of the year at 390 and 393 — found by the build review; overlap clipped to the box cannot see it).
                BOX = """() => { const r = document.querySelector('.erow'); const b = r && r.parentElement; return b && (b.className || '').toString().includes('dc-scrollx') ? { cw: b.clientWidth, sw: b.scrollWidth } : null; }"""
                for w, want in ((360, True), (390, False), (393, False)):
                    pg = open_plan(w, 844, True, None, seed=True); to_tab_x(pg, "expenses"); bx = pg.evaluate(BOX)
                    T(f"S-10 {w} px: the one-time list's box {'scrolls' if want else 'does not scroll (every column shows)'} ({bx})", bx is not None and ((bx["sw"] > bx["cw"]) == want), str(bx))
                    pg.close()
                # F-31: the stream plan's Income tab fits its window from 600 px (v6.40: 626 px wide at 600 and 620).
                for w in (600, 610, 620):
                    pg = open_plan(w, 900, False, PLAN, seed=True); to_tab_x(pg, "income"); m = pg.evaluate(MEASURE)
                    T(f"S-10 {w} px, stream plan: the Income tab does not scroll sideways ({m['sw']} vs {m['vw']}) — F-31", m["sw"] <= m["vw"])
                    pg.close()
            else:
                print(f"  · S-10 skipped: {VER} predates v6.41 (F-30's other four tabs, F-31)")
            # v6.42 (F-32, F-33): the layout follows the room UI SIZE leaves (the window's width / UI SIZE), not the window. Through v6.41 a
            # zoomed window got the layout for its own width: at 150% a 600 px window overprinted 52 pairs on six tabs, and a 390 px phone 163 pairs on
            # eight (Monte Carlo 133) with eight pages scrolling sideways; below 360 px at 100% Monte Carlo overprinted and Grade and Verify scrolled
            # (F-33). All 26 tabs, seeded, at the cases DH-1 (a) promises: every phone 360 px or wider at every UI SIZE (240 px of room at 360 / 150%),
            # 320 px at 100-130%. Windows of 600 and 700 px at 150% (400 and 467 px of room) get the phone layout: the tab menu, not the grid.
            ROOTCLS = "() => { const d = [...document.querySelectorAll('#root div')].find(e => e.style.zoom); return d ? (d.getAttribute('class') || '') : null; }"
            if F32:
                ALL26 = ("mydata", "dashboard", "trajectory", "expenses", "income", "ss", "grade", "ranking", "guardrails", "withdrawal", "roth", "taxes",
                         "irmaa", "montecarlo", "backtest", "whatbreaks", "survivor", "stress", "checklist", "exitplan", "positions", "command", "skins",
                         "docs", "verify", "events")
                # (window, UI SIZE, mobile, plan, the classes the root must carry)
                # 360/150 is the floor (240 px of room); 320/130 the Field Manual's other bound (246); 412/115 the most common Android width just under
                # 360 px of room (358); 430/115 a phone that keeps the phone layout without dc-xs (374); 320/100 F-33.
                cases = [(360, 150, True, None, "dc-narrow dc-sub700w dc-xs"), (390, 130, True, None, "dc-narrow dc-sub700w dc-xs"),
                         (320, 130, True, None, "dc-narrow dc-sub700w dc-xs"), (412, 115, True, None, "dc-narrow dc-sub700w dc-xs"),
                         (430, 115, True, None, "dc-narrow dc-sub700w"), (320, None, True, None, "dc-narrow dc-sub700w dc-xs"),
                         (360, 150, True, PLAN, "dc-narrow dc-sub700w dc-xs"), (600, 150, False, None, "dc-narrow dc-sub700w")]
                for w, zoom, mobile, pl, want in cases:
                    pg = open_plan(w, 844 if mobile else 900, mobile, pl, zoom, seed=True)
                    if zoom:
                        z = pg.evaluate(ZOOM)
                        T(f"S-11 SETUP {w} px: UI SIZE {zoom}% took effect (the app's zoom reads {z!r})", z == str(zoom / 100).rstrip("0").rstrip("."), z)
                    rc = pg.evaluate(ROOTCLS)
                    T(f"S-11 {w} px{' at UI SIZE ' + str(zoom) + '%' if zoom else ''}: the app's root carries {want!r} ({rc!r})", rc == want, repr(rc))
                    menu = pg.locator('select[aria-label="Choose a tab"]')
                    T(f"S-11 {w} px{' at UI SIZE ' + str(zoom) + '%' if zoom else ''}: the tabs sit in one menu (the phone layout)", menu.count() == 1 and menu.is_visible())
                    for t in (ALL26 if pl is None else ("mydata", "ss", "expenses", "taxes", "income", "montecarlo")):
                        to_tab_x(pg, t); hits = pg.evaluate(PAGE_OVERLAP); m = pg.evaluate(MEASURE)
                        if t == "grade":   # the large letter's glyph box touches its label by design (the known false positive): that one pair only
                            hits = [h for h in hits if not h.startswith("Overall grade / ")]
                        T(f"S-11 {w} px{' at UI SIZE ' + str(zoom) + '%' if zoom else ''}, {'stream plan' if pl else 'the example'}: no text on the {t} tab prints over other text ({len(hits)} pairs), and the page does not scroll sideways ({m['sw']} vs {m['vw']})",
                          not hits and m["sw"] <= m["vw"], "; ".join(hits[:6]))
                    pg.close()
                # A desktop window at 100%: no class at all (not an empty attribute); at 150% the root follows a resize both ways.
                pg = open_plan(1024, 900, False, None, None, seed=True)
                T("S-11 1024 px at UI SIZE 100%: the app's root carries no class attribute", pg.evaluate("() => { const d = [...document.querySelectorAll('#root div')].find(e => e.style.zoom); return !!d && !d.hasAttribute('class'); }"))
                pg.close()
                pg = open_plan(1024, 900, False, None, 150, seed=True)
                seen = [pg.evaluate(ROOTCLS)]
                for w in (800, 1100):
                    pg.set_viewport_size({"width": w, "height": 900}); pg.wait_for_timeout(500); seen.append(pg.evaluate(ROOTCLS))
                T(f"S-11 UI SIZE 150%: the root's class follows the window as it is resized, 1024 -> 800 -> 1100 px ({seen})",
                  seen == ["dc-sub700w", "dc-narrow dc-sub700w", ""], str(seen))
                pg.close()
                # The tables (DH-2 (a)) keep their columns: at 240 px of room the percentile and IRMAA tables scroll in their own box; at 358 px (412 px
                # at 115%) none of the three boxes scrolls — the first build's 300 px floors hid the percentile table's last column there (found by the
                # build review); the Verify tables fit at every room (a long citation breaks); at 100% on a phone each box is a plain box.
                SBOX = """(sel) => { const b = [...document.querySelectorAll('.dc-scrollx-xs')].find(x => x.querySelector(sel)); if (!b) return null;
                  const cs = getComputedStyle(b); return { ox: cs.overflowX, cw: b.clientWidth, sw: b.scrollWidth }; }"""
                VALL = "() => [...document.querySelectorAll('.dc-scrollx-xs')].filter(b => b.querySelector('table')).map(b => b.scrollWidth - b.clientWidth)"
                for w, zoom, want in ((360, 150, "scroll"), (412, 115, "fit"), (390, None, "plain")):
                    pg = open_plan(w, 844, True, None, zoom, seed=True)
                    to_tab_x(pg, "montecarlo"); mc = pg.evaluate(SBOX, "div.dc-tight-xs")
                    to_tab_x(pg, "irmaa"); ir = pg.evaluate(SBOX, "div")
                    to_tab_x(pg, "verify"); vt = pg.evaluate(VALL)
                    at = f"{w} px{' at UI SIZE ' + str(zoom) + '%' if zoom else ''}"
                    for nm, bx in (("Monte Carlo's percentile table", mc), ("the IRMAA tier table", ir)):
                        ok_ = bx is not None and (bx["ox"] == "auto" and bx["sw"] > bx["cw"] if want == "scroll" else bx["ox"] == "auto" and bx["sw"] <= bx["cw"] if want == "fit" else bx["ox"] == "visible")
                        T(f"S-11 {at}: {nm}'s box {dict(scroll='scrolls in its own box', fit='shows every column without scrolling', plain='is a plain box (overflow visible)')[want]} ({bx})", ok_, str(bx))
                    if want != "plain":
                        T(f"S-11 {at}: none of the Verify tab's {len(vt)} check tables scrolls ({max(vt) if vt else None} px hidden at most)", len(vt) >= 10 and max(vt) <= 0, str(vt))
                    pg.close()
            else:
                print(f"  · S-11 skipped: {VER} predates v6.42 (F-32, F-33)")
        b.close()
except SystemExit:
    raise
except Exception as e:
    T("0-5 the browser session completed", False, repr(e)[:300])
finish()
