import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// The HTML entry template and source live in src/. The build emits ONE
// self-contained file at dist/index.html (all JS/CSS inlined), matching the
// distributed artifact. Copy that file to the repo root as index.html to
// publish it.
export default defineConfig({
  root: "src",
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    // Dev-only convenience: lets Ask AI reach Anthropic without a user key
    // while developing locally. Not used by the static production build.
    proxy: {
      "/anthropic": {
        target: "https://api.anthropic.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/anthropic/, ""),
      },
    },
  },
});
