// ─────────────────────────────────────────────────────────────────────────
// Browser bootstrap for the standalone Danger Close build.
//
// The app component calls window.storage.* (a persistence API that exists in
// the Claude artifact environment but NOT in a normal browser). Before the app
// mounts we install a localStorage-backed shim with the same async shape, so a
// self-hosted build persists to the visitor's own browser and nothing leaves
// their machine. We also install the Anthropic fetch wrapper the artifact build
// uses. Then we render the app.
// ─────────────────────────────────────────────────────────────────────────
import React from "react";
import { createRoot } from "react-dom/client";
import DangerClose from "./DangerClose.jsx";

// ── window.storage: localStorage-backed, matches the artifact API contract ──
const PREFIX = "dc:";
if (!window.storage) {
  window.storage = {
    async get(key) {
      const v = localStorage.getItem(PREFIX + key);
      if (v === null) throw new Error("key not found: " + key);
      return { key, value: v };
    },
    async set(key, value) {
      localStorage.setItem(PREFIX + key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) {
          keys.push(k.slice(PREFIX.length));
        }
      }
      return { keys };
    },
  };
}

// ── Anthropic fetch wrapper ──
// In artifact/dev mode (no user-supplied key), route api.anthropic.com calls
// through a same-origin /anthropic proxy (configured in vite.config.js for dev).
// When the visitor supplies their own key (BYOK), an x-api-key header is present
// and the call passes straight through to Anthropic. On a static GitHub Pages
// host there is no proxy, so Ask AI requires a user key — which is the intended
// bring-your-own-key behavior.
const _fetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  if (
    url &&
    url.startsWith("https://api.anthropic.com") &&
    location.protocol.startsWith("http")
  ) {
    const headers = (init && init.headers) || {};
    const hasKey = Object.keys(headers).some(
      (h) => h.toLowerCase() === "x-api-key"
    );
    if (!hasKey) {
      return _fetch(url.replace("https://api.anthropic.com", "/anthropic"), init);
    }
  }
  return _fetch(input, init);
};

createRoot(document.getElementById("root")).render(
  React.createElement(DangerClose)
);
