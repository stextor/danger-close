import { createRoot } from "react-dom/client";
import { act } from "react";
import { __g, __test } from "./app_v521.jsx";
window.__mount = (el) => { const root = createRoot(el); return { root, act, DangerClose: __g.DangerClose }; };
window.__g = __g;
window.__test = __test; // feature suites (t9) read this; baseline suites ignore it
