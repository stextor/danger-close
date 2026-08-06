#!/bin/bash
# Baseline regression driver. Usage: ./run_all.sh v592 | ./run_all.sh v510 | ./run_all.sh parity
set -e
V=${1:-v510}
if [ "$V" = "parity" ]; then node t2_engines.mjs compare; exit $?; fi
node t1_units.mjs $V && node t2_engines.mjs $V && node t3_roth.mjs $V && \
timeout 900 node t4_dom.mjs $V && timeout 900 node t5_storage.mjs $V && timeout 900 node t6_single.mjs $V
