const { JSDOM } = require("jsdom");
// "file" mode points jsdom at a locally-built HTML copy. Set LOCAL_HTML to its
// absolute path (e.g. file:///path/to/DangerClose_Local.html) when using TEST_MODE=file.
const url = process.env.TEST_MODE === "artifact" ? "https://abc123.claudeusercontent.com/artifact" : process.env.TEST_MODE === "file" ? (process.env.LOCAL_HTML || "file:///path/to/DangerClose_Local.html") : "http://localhost:5173/";
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url, pretendToBeVisual: true });
const { window } = dom;
const g = { window, document: window.document,
  HTMLElement: window.HTMLElement, HTMLCanvasElement: window.HTMLCanvasElement,
  Element: window.Element, Node: window.Node, location: window.location,
  getComputedStyle: window.getComputedStyle.bind(window),
  requestAnimationFrame: (cb) => setTimeout(cb, 16), cancelAnimationFrame: clearTimeout,
  FileReader: window.FileReader, Blob: window.Blob, URL: window.URL,
  matchMedia: () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }),
  IS_REACT_ACT_ENVIRONMENT: true,
};
for (const k of Object.keys(g)) { try { global[k] = g[k]; } catch (e) { Object.defineProperty(global, k, { value: g[k], configurable: true }); } }
// Node 21+ ships its own read-only global `navigator` (a getter-only accessor property).
// A plain `global.navigator = window.navigator` assignment is a SILENT no-op against a
// getter-only property in sloppy mode (no throw), so bundled app code referencing bare
// `navigator` would keep resolving to Node's built-in object instead of jsdom's — silently
// breaking any navigator.* mock. Force the override with defineProperty instead.
Object.defineProperty(global, "navigator", { get: () => window.navigator, configurable: true });
window.requestAnimationFrame = global.requestAnimationFrame;
window.cancelAnimationFrame = global.cancelAnimationFrame;
window.matchMedia = global.matchMedia;
window.IS_REACT_ACT_ENVIRONMENT = true;
const ctxStub = new Proxy({}, { get(t, p){ if (p === "canvas") return null; if (!(p in t)) t[p] = p === "measureText" ? () => ({ width: 10 }) : () => {}; return t[p]; }, set(){ return true; } });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;

// jsdom doesn't implement real Blob URLs (URL.createObjectURL) or File-from-Blob plumbing —
// stub them so we can test OUR branching/messaging logic without fighting jsdom's gaps.
// (Real Safari/Chrome fully implement both; this is a test-environment shim only.)
if (!global.File) {
  global.File = class MockFile { constructor(parts, name, opts) { this.name = name; this.type = (opts && opts.type) || ""; this.size = 0; } };
  window.File = global.File;
}
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = () => "blob:mock-url";
  window.URL.revokeObjectURL = () => {};
  global.URL.createObjectURL = window.URL.createObjectURL;
  global.URL.revokeObjectURL = window.URL.revokeObjectURL;
}
const mem = new Map();
window.storage = {
  async get(k){ if (!mem.has(k)) throw new Error("key not found"); return { key: k, value: mem.get(k) }; },
  async set(k, v){ mem.set(k, v); return { key: k, value: v }; },
  async delete(k){ mem.delete(k); return { key: k, deleted: true }; },
  async list(p=""){ return { keys: [...mem.keys()].filter(k => k.startsWith(p)) }; },
};
require(process.argv[2] || "./bundle.js");
