# Standing audit Phase 4 (Section F) at v5.73 — usability metrics per tab and viewport, in real Chromium.
# ASSERTS NOTHING and is counted in no total. Evidence for UsabilityFlaws.md's v5.73 block.
# usage: python3 probe_ux.py <path-to-built-index.html>      (needs: pip install playwright; a Chromium Playwright can launch)
# Writes metrics.json and PNG screenshots into the current directory.
import json, sys, os
PAGE = "file://" + os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "index.html")
from playwright.sync_api import sync_playwright
VIEWS = {"desktop": (1440, 900), "tablet": (820, 1180), "phone": (390, 844)}
METRICS_JS = r"""
() => {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const els = [...document.querySelectorAll('body *')];
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const wide = els.filter(e => vis(e) && e.getBoundingClientRect().right > vw + 2 && !e.closest('[style*="overflow"]'));
  const clickable = els.filter(e => vis(e) && (e.tagName === 'BUTTON' || e.tagName === 'A' || e.tagName === 'INPUT' || e.tagName === 'SELECT' || e.getAttribute('role') === 'button'));
  const small = clickable.filter(e => { const r = e.getBoundingClientRect(); return r.height < 44 || r.width < 44; });
  const tiny = els.filter(e => vis(e) && e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2) && parseFloat(getComputedStyle(e).fontSize) < 12);
  const describe = e => (e.tagName + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '') + ' "' + (e.textContent || '').trim().slice(0, 30) + '" w=' + Math.round(e.getBoundingClientRect().width));
  return { vw, sw, overflowX: sw > vw + 1, wideCount: wide.length, wideSample: wide.slice(0, 4).map(describe),
           clickables: clickable.length, smallTargets: small.length, smallSample: small.slice(0, 3).map(describe),
           tinyText: tiny.length, tinyFonts: [...new Set(tiny.map(e => getComputedStyle(e).fontSize))].slice(0, 5) };
}
"""
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (w, h) in VIEWS.items():
        pg = b.new_page(viewport={"width": w, "height": h}, is_mobile=(name == "phone"), has_touch=(name != "desktop"))
        pg.goto(PAGE); pg.wait_for_timeout(1500)
        gate = pg.evaluate(METRICS_JS)
        pg.screenshot(path=f"{name}_gate.png")
        pg.check("#dc-disclaimer-gate input[type=checkbox]"); pg.click("#dc-disclaimer-gate button"); pg.wait_for_timeout(800)
        land = pg.evaluate(METRICS_JS)
        pg.screenshot(path=f"{name}_landing.png")
        pg.get_by_text("Use example data", exact=False).first.click(); pg.wait_for_timeout(2500)
        tabs = pg.eval_on_selector_all("button.tab", "els => els.map(e => e.textContent.trim())")
        res = {"gate": gate, "landing": land, "tabCount": len(tabs), "tabs": {}}
        for t in tabs:
            pg.locator("button.tab", has_text=t).first.click(); pg.wait_for_timeout(700)
            res["tabs"][t] = pg.evaluate(METRICS_JS)
            if t in ("dashboard", "my data", "taxes", "withdrawal", "roth", "montecarlo", "monte carlo"):
                pg.screenshot(path=f"{name}_{t.replace(' ', '_')}.png")
        out[name] = res
        pg.close()
    b.close()
json.dump(out, open("metrics.json", "w"), indent=1)
for name, res in out.items():
    ts = res["tabs"]; ov = [t for t, m in ts.items() if m["overflowX"]]
    print(f"{name}: {res['tabCount']} tabs; page scrolls sideways on {len(ov)} ({', '.join(ov[:8])}); "
          f"landing overflow {res['landing']['overflowX']}; median small targets {sorted(m['smallTargets'] for m in ts.values())[len(ts)//2]}; "
          f"max tiny-text nodes {max(m['tinyText'] for m in ts.values())}")
