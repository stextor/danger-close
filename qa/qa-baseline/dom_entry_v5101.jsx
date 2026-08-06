import React from "react";
import { createRoot } from "react-dom/client";
import * as TestUtils from "react-dom/test-utils";
import DangerClose, { __g, __test } from "../testable_v5101.jsx";
const act = React.act || TestUtils.act;
window.__g = __g;
window.__test = __test;
window.__mount = (el) => ({ root: createRoot(el), act, DangerClose });
