#!/bin/bash
# $1 = version tag (v592|v510)
set -e
cd /home/claude/baseline
python3 - "$1" << 'PY'
import sys
tag = sys.argv[1]
src = open(f"{tag}.jsx").read()
shim = open("qa/shim.txt").read()
body = src.replace("export default function DangerClose()", "function DangerClose()")
assert body != src, "default export not found"
open(f"qa/app_{tag}.jsx", "w").write(body + shim)
print(f"qa/app_{tag}.jsx written")
PY
/home/claude/build/node_modules/.bin/esbuild qa/app_$1.jsx --loader:.jsx=jsx --jsx=automatic --format=esm --outfile=qa/app_$1.mjs --log-level=warning
echo "qa/app_$1.mjs built"
