#!/usr/bin/env python3
# t48 — LEGIBLE TEXT AND USABLE TARGETS (F-3 / F-4) · real Chromium, the BUILT page (docs/SCOPE_TEXT_AND_TARGETS.md; v5.82).
#     python3 t48_legibility_targets.py v582 [path/to/built/index.html]        (default: ../index.html, the run folder's copy)
#     T48_SKINS=default,report  restricts §T/§R to those skin keys — for the negative controls ONLY; the suite never sets it.
#     T48_SOURCE_ONLY=1         stops after §X/§T (no browser) — also negative controls ONLY.
#
# WHAT v5.82 CHANGED. Secondary text (--ink-faint) reaches WCAG AA 4.5:1 in every skin, with --ink-dim kept at least 1.20x
# brighter (D-1); the type floor's leftovers (tab grid, chart labels, three data-row classes, Ask AI buttons) reach 11 px;
# hard-coded dark-theme text colours become skin tokens (D-3); every control is at least 24 x 24 px and five phone-critical
# controls 44 px tall below 600 px (D-2). The Field Manual's own styling is deferred (D-4): it is an iframe and is not measured.
#
# HOW IT MEASURES. HTML text by its computed `color`; SVG text by its `fill` (SVG does not paint with `color` — the scoping
# session's first probe read `color` and understated the chart). Opacity is multiplied up the tree; the background is every
# translucent layer composited down to the first opaque one. WCAG "large" text (>= 24 px, or bold >= 18.66 px) needs 3:1.
# Skins are chosen through the Skins tab (the stored value goes through window.storage; a localStorage write silently did
# nothing), and every switch is ASSERTED to have landed — a no-op switch would otherwise measure the default skin 13 times.
# Skin keys, labels and expected --bg come from SKINS in the run folder's source, parsed by acorn — no second copy here.
#
# Like t45/t47: current leg only; FAILS, never skips, without a browser or on another release's page; "passed" appears once,
# on the last line (tally sums them).
import os, sys, json, subprocess
VER = sys.argv[1] if len(sys.argv) > 1 else ""
KNOWN_VERSIONS = ["v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598"]
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, ".."))
PAGE = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(ROOT, "index.html")
ok = 0; bad = 0; fails = []
def T(name, cond, detail=""):
    global ok, bad
    if cond: ok += 1
    else: bad += 1; fails.append(f"  \u2717 {name}" + (f" — {detail}" if detail else ""))
def finish():
    print("\n".join(fails)); print(f"\nt48 SUITE ({VER}): {ok} passed, {bad} failed"); sys.exit(1 if bad else 0)
print(f"t48 — LEGIBLE TEXT AND USABLE TARGETS ({VER}) · page {os.path.basename(PAGE)}")
if VER not in KNOWN_VERSIONS: T(f"0-0 version tag {VER!r} is registered", False, f"registered: {KNOWN_VERSIONS}"); finish()
T("0-1 the built page exists", os.path.exists(PAGE), PAGE)
if not os.path.exists(PAGE): finish()
dotted = "v" + VER[1] + "." + VER[2:]
T(f"0-2 the page is THIS build: its footer names {dotted}", f"DANGER CLOSE {dotted} \u2502 Not financial advice" in open(PAGE, encoding="utf-8").read())
SRC = os.path.join(ROOT, f"{VER}.jsx")
T("0-3 the run folder's source for this tag exists", os.path.exists(SRC), SRC)
if not os.path.exists(SRC): finish()

# ── X · extinction invariants, from the SOURCE by AST (acorn from the run folder's node_modules) ─────────────────────────────
AST_JS = r"""
const fs = require('fs'), acorn = require('acorn'), jsx = require('acorn-jsx'), walk = require('acorn-walk');
const src = fs.readFileSync(process.argv[1], 'utf8');
const ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true, ranges: true });
const base = { ...walk.base };
base.JSXElement = (n, s, c) => { c(n.openingElement, s); n.children.forEach(ch => c(ch, s)); };
base.JSXOpeningElement = (n, s, c) => n.attributes.forEach(a => c(a, s));
base.JSXAttribute = (n, s, c) => { if (n.value) c(n.value, s); };
base.JSXExpressionContainer = (n, s, c) => c(n.expression, s);
base.JSXFragment = (n, s, c) => n.children.forEach(ch => c(ch, s));
base.JSXText = () => {}; base.JSXEmptyExpression = () => {}; base.JSXSpreadAttribute = (n, s, c) => c(n.argument, s);
const decl = name => { for (const n of ast.body) if (n.type === 'VariableDeclaration') for (const d of n.declarations) if (d.id.name === name) return d.init; return null; };
const docs = decl('DOCS_HTML'), skins = decl('SKINS');
const inside = (n, r) => r && n.range[0] >= r.range[0] && n.range[1] <= r.range[1];
const SKINS = Function('return ' + src.slice(skins.range[0], skins.range[1]))();
const out = { skins: Object.entries(SKINS).map(([k, s]) => ({ key: k, label: s.label, t: s.tokens })),
  d3size: [], d3sizeNonLit: [], d3lineFill: [], cssSmall: [], objSmall: [], hexColor: [], alphaCat: [], rgba: [], retireColors: null, docs: '' };
const RGBA = (n, s) => { if (inside(n, skins) || inside(n, docs)) return; for (const m of String(s).matchAll(/rgba\([^)]*\)/g)) out.rgba.push(n.loc.start.line + ':' + m[0].replace(/\s/g, '')); };
walk.simple(ast, {
  CallExpression(n) {
    const c = n.callee; if (c.type !== 'MemberExpression' || !c.property || (c.property.name !== 'attr' && c.property.name !== 'style')) return;
    const a = n.arguments[0], v = n.arguments[1]; if (!a || a.type !== 'Literal') return;
    if (a.value === 'font-size') { if (!v || v.type !== 'Literal') out.d3sizeNonLit.push(n.loc.start.line); else if (parseFloat(v.value) < 11) out.d3size.push(n.loc.start.line + ':' + v.value); }
    if (a.value === 'fill' && v && v.type === 'Literal' && /^var\(--line/.test(String(v.value))) out.d3lineFill.push(n.loc.start.line);
  },
  Literal(n) {
    if (typeof n.value !== 'string' || inside(n, docs)) return;
    RGBA(n, n.value);
    if (!inside(n, skins) && /^\s*#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\s*$/.test(n.value)) out.hexColor.push(n.loc.start.line + ':' + n.value);
    for (const m of n.value.matchAll(/font-size\s*:\s*([0-9.]+)px/g)) if (parseFloat(m[1]) < 11) out.cssSmall.push(n.loc.start.line + ':' + m[1]);
  },
  TemplateElement(n) {
    if (inside(n, docs)) return;
    RGBA(n, n.value.cooked || '');
    for (const m of (n.value.cooked || '').matchAll(/font-size\s*:\s*([0-9.]+)px/g)) if (parseFloat(m[1]) < 11) out.cssSmall.push(n.loc.start.line + ':' + m[1]);
  },
  TemplateLiteral(t) {   // `${colour}33` — a hex alpha glued on: invalid CSS the moment the colour is a token (E-1)
    t.expressions.forEach((x, i) => { if (/^[0-9a-fA-F]{2}(?![0-9a-zA-Z])/.test(t.quasis[i + 1].value.raw)) out.alphaCat.push(x.loc.start.line); });
  },
  Property(n) {
    const k = n.key && (n.key.name || n.key.value);
    if (k === 'fontSize' && n.value.type === 'Literal' && parseFloat(n.value.value) < 11) out.objSmall.push(n.loc.start.line + ':' + n.value.value);
    if (k === 'color' && !inside(n, skins) && n.value.type === 'Literal' && /^\s*rgb/i.test(String(n.value.value))) out.hexColor.push(n.loc.start.line + ':' + n.value.value);
  },
}, base);
// The retirement-date colours: the array literal that buildRetireOptions indexes. Every element must be a skin token.
walk.simple(ast, { FunctionDeclaration(f) { if (f.id && f.id.name === 'buildRetireOptions') walk.simple(f, { VariableDeclarator(d) {
  if (d.id.name === 'colors' && d.init && d.init.type === 'ArrayExpression') out.retireColors = d.init.elements.map(e => e.value); } }, base); } }, base);
out.docs = docs && docs.type === 'Literal' ? docs.value : '';
process.stdout.write(JSON.stringify(out));
"""
try:
    r = subprocess.run(["node", "-e", AST_JS, SRC], cwd=ROOT, capture_output=True, text=True, timeout=300)
    A = json.loads(r.stdout)
except Exception as e:
    T("X-0 the source parses (acorn, run folder's node_modules)", False, (r.stderr if 'r' in dir() else repr(e))[:300]); finish()
T("X-0 the source parses, and SKINS holds 13 skins", len(A["skins"]) == 13, str(len(A["skins"])))
T("X-1 no d3 font-size below 11 px", not A["d3size"], ", ".join(A["d3size"]))
T("X-2 every d3 font-size is a literal (so X-1 can see it)", not A["d3sizeNonLit"], str(A["d3sizeNonLit"]))
T("X-3 no chart fill is a line token (--line*, a border colour, painted axis text at 1.4–3.2:1)", not A["d3lineFill"], str(A["d3lineFill"]))
T("X-4 no CSS rule under 11 px outside the Field Manual (DOCS_HTML is deferred, D-4)", not A["cssSmall"], ", ".join(A["cssSmall"]))
T("X-5 no style-object fontSize under 11", not A["objSmall"], ", ".join(A["objSmall"][:8]))
T("X-6 no hex colour literal outside SKINS (and no rgb `color:`) — every colour is a skin token (D-3, E-2)", not A["hexColor"], f"{len(A['hexColor'])}: " + ", ".join(A["hexColor"][:8]))
T("X-11 no hex alpha glued onto a colour in a template (`${c}33`) — use color-mix (E-1)", not A["alphaCat"], str(A["alphaCat"]))
_rg = [x for x in A["rgba"] if not x.split(":", 1)[1].startswith("rgba(128,128,128,")]
_rim = [x for x in A["rgba"] if x.split(":", 1)[1].startswith("rgba(128,128,128,")]
T("X-12 no rgba() literal outside SKINS and the Field Manual — every surface is a skin token (G-1); only the 2 neutral swatch rims remain",
  not _rg and len(_rim) == 2, f"{len(_rg)} tinted: " + ", ".join(_rg[:6]) + f" | rims {len(_rim)}")
rc = A["retireColors"]
T("X-7 the retirement-date colours are skin tokens", bool(rc) and all(isinstance(c, str) and c.startswith("var(--") for c in rc), str(rc))
d = A["docs"]
T("X-8 the Field Manual no longer says the smallest text is below AA", bool(d) and "below the WCAG AA contrast threshold" not in d)
T("X-9 …nor that the tab strip wraps heavily and fills the first screen (v5.81 fixed that)", bool(d) and "wraps heavily and fills the first screen" not in d)
import re as _re
_b = _re.search(r"Designed for a desktop browser\.</strong>(.*?)</li>", d, _re.S)
T("X-10 …and the same §13 bullet says what remains: the Field Manual's own small print is not yet fixed (D-4)",
  bool(_b) and "Field Manual" in _b.group(1) and "not yet fixed" in _b.group(1), (_b.group(1)[:120] if _b else "bullet not found"))

# ── T · tokens, every skin, computed from the SOURCE's values (no browser needed; R below proves them in the page) ─────────
def parse(c):
    c = c.strip()
    if c.startswith("#"): return [int(c[i:i + 2], 16) for i in (1, 3, 5)] + [1.0]
    v = [float(x) for x in c[c.index("(") + 1:c.index(")")].split(",")]; return v[:3] + [v[3] if len(v) > 3 else 1.0]
def over(f, b): return [f[i] * f[3] + b[i] * (1 - f[3]) for i in range(3)] + [1.0]
def lum(c):
    s = [(v / 255) / 12.92 if v / 255 <= 0.03928 else ((v / 255 + 0.055) / 1.055) ** 2.4 for v in c[:3]]
    return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]
def cr(a, b): x, y = lum(a), lum(b); return (max(x, y) + 0.05) / (min(x, y) + 0.05)
ONLY = [s for s in os.environ.get("T48_SKINS", "").split(",") if s]
# KNOWN DEFECT (F-1 (b), OPERATIONS §D): the six LIGHT skins still fail AA on tinted panels — hard-coded dark-theme rgba() surfaces
# (366 literals, 65 values) that v5.83's surface pass replaces. Counts are distinct failing elements over all 26 tabs, measured on
# the v5.82 build; each may only FALL. A dark skin is never pinned: it must be 0. Which skins are dark is derived (bg luminance).
KNOWN_DEFECT = {} if VER != "v582" else {   # v5.83 (SCOPE_LIGHT_SKIN_SURFACES) deletes every pin: all skins must be 0. v5.82: measured on the v5.82 build (725bde15…), pointer parked, animations frozen; identical across two desktop runs
    (1440, "fieldPaper"): 288, (1440, "paperSepia"): 716, (1440, "inkGray"): 269, (1440, "highLight"): 106,
    (1440, "cbSafe"): 144, (1440, "report"): 198, (390, "paperSepia"): 665,
}
SK = [s for s in A["skins"] if not ONLY or s["key"] in ONLY]
if VER != "v582":
    _light = [s for s in A["skins"] if lum(parse(s["t"]["bg"])) >= 0.18]; _dark = [s for s in A["skins"] if lum(parse(s["t"]["bg"])) < 0.18]
    T("X-13 every LIGHT skin defines onRing = its own ink, and no dark skin defines it (G-2: default and dark skins unchanged)",
      all(s["t"].get("onRing", "").lower() == s["t"]["ink"].lower() for s in _light) and not any("onRing" in s["t"] for s in _dark),
      ", ".join(f"{s['key']}={s['t'].get('onRing')}" for s in _light))
    _src = open(SRC, encoding="utf-8").read()
    import re as _r2
    _rule = lambda sel: (_r2.search(_r2.escape(sel) + r"\s*\{([^}]*)\}", _src) or [None, ""])[1]
    T("X-14 selected states read var(--on-ring, …): .tab.on and .rbtn.sel", "var(--on-ring" in _rule(".tab.on") and "var(--on-ring" in _rule(".rbtn.sel"),
      f".tab.on {{{_rule('.tab.on')[:80]}}} | .rbtn.sel {{{_rule('.rbtn.sel')[:80]}}}")
    T("X-15 hovered rows are not washed with --ring (G-3)", "var(--ring)" not in _rule(".prow:hover") and "var(--ring)" not in _rule(".erow:hover")
      and _rule(".prow:hover") != "" and _rule(".erow:hover") != "", f"{_rule('.prow:hover')} | {_rule('.erow:hover')}")
for s in SK:
    t = s["t"]; bg = parse(t["bg"]); surf = [bg, over(parse(t["panel"]), bg), over(parse(t["panel2"]), bg)]
    f = [cr(parse(t["inkFaint"]), x) for x in surf]; dm = [cr(parse(t["inkDim"]), x) for x in surf]
    T(f"T-1 {s['key']}: --ink-faint >= 4.5:1 on bg, panel and panel2", min(f) >= 4.5, " / ".join(f"{x:.2f}" for x in f))
    T(f"T-2 {s['key']}: --ink-dim >= 1.20x --ink-faint on every surface (D-1)", min(a / b for a, b in zip(dm, f)) >= 1.20,
      " / ".join(f"{a / b:.2f}" for a, b in zip(dm, f)))

if os.environ.get("T48_SOURCE_ONLY"): finish()   # negative controls ONLY (source mutations need no browser); the suite never sets it
# ── browser legs ────────────────────────────────────────────────────────────────────────────────────────────────────────────
SEED = "(()=>{let s=12345;Math.random=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();"
MEASURE = r"""(rootSel) => {
 const P = c => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; };
 const L = c => { const s = c.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return .2126 * s[0] + .7152 * s[1] + .0722 * s[2]; };
 const CR = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
 const bgOf = e => { const st = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const c = P(getComputedStyle(n).backgroundColor); if (c && c[3] > 0) { st.push(c); if (c[3] >= 1) break; } }
   let b = [255, 255, 255, 1]; for (let i = st.length - 1; i >= 0; i--) { const f = st[i]; b = [0, 1, 2].map(k => f[k] * f[3] + b[k] * (1 - f[3])).concat(1); } return b; };
 const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
 const text = []; let logo = 0;
 const root = rootSel ? (document.querySelector(rootSel) || document.createElement('div')) : document.body;
 for (const e of root.querySelectorAll('*')) {
   if (!vis(e)) continue; const isSvg = e instanceof SVGElement; if (isSvg && e.tagName.toLowerCase() !== 'text' && e.tagName.toLowerCase() !== 'tspan') continue;
   const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); if (own.length < 2) continue;
   if (e.closest(':disabled,[aria-disabled="true"]')) continue;   // WCAG 1.4.3: inactive components are exempt
   if (e.tagName === 'H1' && own === '\u25C9 DANGER CLOSE') { logo++; continue; }   // WCAG 1.4.3: logotypes are exempt (E-3)
   const s = getComputedStyle(e), fg = P(isSvg ? s.fill : s.color); if (!fg) continue;
   let o = fg[3]; for (let n = e; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
   const b = bgOf(e), c = [0, 1, 2].map(k => fg[k] * o + b[k] * (1 - o)); const fs = parseFloat(s.fontSize), bold = parseInt(s.fontWeight) >= 700;
   const need = (fs >= 24 || (bold && fs >= 18.66)) ? 3 : 4.5, ratio = CR(c, b);
   if (fs < 11 || ratio < need) text.push({ t: own.slice(0, 26), fs, cr: +ratio.toFixed(2), svg: isSvg });
 }
 const ctl = [];
 for (const e of document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button]')) {
   if (!vis(e)) continue; const tgt = (e.tagName === 'INPUT' && e.closest('label')) || e; const r = tgt.getBoundingClientRect();
   if (r.width < 24 || r.height < 24) ctl.push({ t: (e.getAttribute('aria-label') || e.textContent || e.type || '').trim().slice(0, 26), w: Math.round(r.width), h: Math.round(r.height) });
 }
 return { text, ctl, logo, bg: getComputedStyle(document.querySelector('[style*="--bg"]')).getPropertyValue('--bg').trim() };
}"""
def open_app(b, w, h, mobile):
    pg = b.new_page(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile); pg.set_default_timeout(120000)
    pg.add_init_script(SEED); pg.goto("file://" + PAGE); pg.wait_for_timeout(1200)
    return pg
# Animations are frozen at their FIRST keyframe, so a pulsing element is measured at a fixed point — and breathe-text starts at
# its faintest (0% = 0.85), so that point is its worst case. Without this a reading depends on when it was taken.
FREEZE = "*, *::before, *::after { animation-delay: 0s !important; animation-play-state: paused !important; }"
def enter(pg):
    pg.check("#dc-dg-check"); pg.click("#dc-dg-accept"); pg.wait_for_timeout(600)
    pg.get_by_text("Use example data", exact=False).first.click(); pg.wait_for_timeout(2500)
    pg.add_style_tag(content=FREEZE); pg.wait_for_timeout(200)
def tabs(pg): return pg.eval_on_selector_all('select[aria-label="Choose a tab"] option', "els => els.map(e => e.value)")
def go(pg, i, tid, phone):
    if phone: pg.select_option('select[aria-label="Choose a tab"]', tid)
    else: pg.locator("button.tab").nth(i).click()
    # Park the pointer in the corner: .prow:hover / .erow:hover tint a row with --ring, and on a touch screen hover STICKS where
    # the last tap landed — a reading then depended on an earlier tap (seen at the v5.82 build: two phone rows at 3.22:1).
    # Hover states are NOT measured by this suite; that is a disclosed limitation, owned by the v5.83 surface pass.
    pg.mouse.move(0, 0); pg.wait_for_timeout(800)
def set_skin(pg, s, phone):
    ids = tabs(pg); go(pg, ids.index("skins"), "skins", phone)
    pg.locator("button", has_text=s["label"]).first.click(); pg.wait_for_timeout(700)
    got = pg.evaluate("getComputedStyle(document.querySelector('[style*=\"--bg\"]')).getPropertyValue('--bg').trim()")
    return got.lower() == s["t"]["bg"].lower(), got
LOGO_SEEN = [0]
ROW_AT = """() => { const r = [...document.querySelectorAll('.prow, .erow')].find(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; });
  if (!r) return null; r.scrollIntoView({ block: 'center' }); const b = r.getBoundingClientRect(); return [b.left + Math.min(40, b.width / 2), b.top + b.height / 2]; }"""
HOVER_SEEN = [0]
def sweep(pg, phone):
    fails_t, fails_c = {}, {}
    for i, tid in enumerate(tabs(pg)):
        go(pg, i, tid, phone); m = pg.evaluate(MEASURE); LOGO_SEEN[0] += m["logo"]
        for x in m["text"]: fails_t.setdefault((x["t"], x["fs"], x["cr"]), tid)
        # H · a HOVERED table row (v5.83, G-3): .prow/.erow wash on hover; measure the hovered row's own text, then park again.
        if VER != "v582":
            at = pg.evaluate(ROW_AT)
            if at:
                pg.mouse.move(at[0], at[1]); pg.wait_for_timeout(450)
                h = pg.evaluate(MEASURE, ":is(.prow, .erow):hover"); HOVER_SEEN[0] += 1
                for x in h["text"]: fails_t.setdefault(("HOVER " + x["t"], x["fs"], x["cr"]), tid)
                pg.mouse.move(0, 0); pg.wait_for_timeout(300)
        for x in m["ctl"]: fails_c.setdefault((x["t"], x["w"], x["h"]), tid)
    return fails_t, fails_c
def show(dct, n=6): return "; ".join(f"{k[0]!r} {k[1]}/{k[2]} @{v}" for k, v in list(dct.items())[:n])
try:
    from playwright.sync_api import sync_playwright
except Exception as e:
    T("0-4 Playwright imports (a browser is REQUIRED; this suite never skips)", False, repr(e)); finish()
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        # R · rendered text, every tab: all 13 skins at 1440 (desktop); default and Reading Paper at 390 (phone)
        PHONE_SKINS = [s for s in SK if s["key"] in ("default", "paperSepia")]
        for w, h, phone, skins in [(1440, 900, False, SK), (390, 844, True, PHONE_SKINS)]:
            pg = open_app(b, w, h, phone); enter(pg)
            for s in skins:
                landed, got = set_skin(pg, s, phone)
                T(f"R-0 {w}px {s['key']}: the skin switch landed (--bg is the skin's own)", landed, f"--bg {got}, expected {s['t']['bg']}")
                if not landed: continue
                ft, fc = sweep(pg, phone)
                small = {k: v for k, v in ft.items() if k[1] < 11}
                T(f"R-1 {w}px {s['key']}: no visible text on any tab is under 11 px (never pinned)", not small, f"{len(small)}: " + show(small))
                if lum(parse(s["t"]["bg"])) < 0.18:
                    T(f"R-2 {w}px {s['key']} (dark): every visible text element on every tab meets AA", not ft, f"{len(ft)}: " + show(ft))
                else:
                    pin = KNOWN_DEFECT.get((w, s["key"]))
                    if pin is None:
                        T(f"R-2 {w}px {s['key']} (light): every visible text element on every tab meets AA (no pin from v5.83)", not ft, f"{len(ft)}: " + show(ft))
                    else:
                        T(f"R-2 {w}px {s['key']} (light): AA failures <= the pinned KNOWN DEFECT ({pin}) — may only fall",
                          len(ft) <= pin, f"{len(ft)} measured: " + show(ft))
                    if pin is not None and len(ft) < pin: print(f"  NOTE {w}px {s['key']}: {len(ft)} < pin {pin} — LOWER THE PIN")
                if s["key"] == "default": T(f"C-1 {w}px: every control is at least 24 x 24 px (a checkbox counts its label)", not fc, f"{len(fc)}: " + show(fc))
            pg.close()
        if VER != "v582": T("H-1 the hover leg ran (a row was hovered on at least one tab per sweep)", HOVER_SEEN[0] > 0, str(HOVER_SEEN[0]))
        T("R-3 the one exemption (the logotype) still matches an element — an allowlist entry that matches nothing is stale", LOGO_SEEN[0] > 0, str(LOGO_SEEN[0]))
        # C · the tablet width, controls only; and the tab grid keeps its row count (measured on v5.81: 2 / 3 / 3)
        for w, rows in [(1440, 2), (1024, 3), (820, 3)]:
            pg = open_app(b, w, 900, False); enter(pg)
            n = pg.evaluate("new Set([...document.querySelectorAll('button.tab')].map(e => Math.round(e.getBoundingClientRect().top))).size")
            T(f"C-2 {w}px: the tab grid keeps {rows} rows at 11 px", n == rows, str(n))
            if w == 820:
                _, fc = sweep(pg, False); T("C-1 820px: every control is at least 24 x 24 px", not fc, f"{len(fc)}: " + show(fc))
            pg.close()
        # P · the five phone-critical controls are 44 px tall at 390 (D-2) — measured where each first appears
        pg = open_app(b, 390, 844, True)
        hgt = lambda sel: pg.evaluate("(s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : -1; }", sel)
        T("P-1 'Enter the tool' is >= 44 px tall", hgt("#dc-dg-accept") >= 44, str(hgt("#dc-dg-accept")))
        pg.check("#dc-dg-check"); pg.click("#dc-dg-accept"); pg.wait_for_timeout(600)
        ex = pg.get_by_text("Use example data", exact=False).first
        T("P-2 'Use example data' is >= 44 px tall", ex.bounding_box()["height"] >= 44, str(ex.bounding_box()["height"]))
        ex.click(); pg.wait_for_timeout(2500)
        T("P-3 the tab menu is >= 44 px tall", hgt('select[aria-label="Choose a tab"]') >= 44, str(hgt('select[aria-label="Choose a tab"]')))
        T("P-4 the plan-summary toggle is >= 44 px tall", hgt("button.dc-phone-only[aria-expanded]") >= 44, str(hgt("button.dc-phone-only[aria-expanded]")))
        few = pg.get_by_role("button", name=__import__("re").compile("FEWER")).first
        T("P-5 the Simple Mode toggle is >= 44 px tall", few.bounding_box()["height"] >= 44, str(few.bounding_box()["height"]))
        pg.close()
        # G · raised row text does not clip in the fixed-width grids
        pg = open_app(b, 1440, 900, False); enter(pg); clipped = []
        for i, tid in enumerate(tabs(pg)):
            go(pg, i, tid, False)
            clipped += [f"{x} @{tid}" for x in pg.evaluate("""() => [...document.querySelectorAll('.erow > *, .grow > *, .prow > *')]
              .filter(e => e.getBoundingClientRect().width > 0 && e.scrollWidth > e.clientWidth + 1).map(e => (e.textContent || '').trim().slice(0, 20))""")]
        T("G-1 no cell of an .erow / .grow / .prow row clips its text", not clipped, f"{len(clipped)}: " + "; ".join(clipped[:6]))
        pg.close(); b.close()
except SystemExit:
    raise
except Exception as e:
    T("0-5 the browser session completed", False, repr(e)[:300])
finish()
