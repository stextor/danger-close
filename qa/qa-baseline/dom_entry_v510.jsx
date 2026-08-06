import { createRoot } from "react-dom/client";
import { act } from "react";
import { __g } from "./app_v510.jsx";
window.__mount = (el) => { const root = createRoot(el); return { root, act, DangerClose: __g.DangerClose }; };
window.__g = __g;
