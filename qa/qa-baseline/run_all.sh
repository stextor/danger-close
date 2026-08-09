#!/bin/bash
# Baseline regression driver. Usage: ./run_all.sh v513 | ./run_all.sh v514 | ./run_all.sh parity
# v5.14: t10 adopted into the routine run (scope decision D-4). It had been held since v5.10.2 for
# "the next release with an independent reason to exist" — this is that release, because the two
# [KNOWN DEFECT] pins it carried are the very defects v5.14 fixes, so its flip IS the verification.
set -e
V=${1:-v514}
if [ "$V" = "parity" ]; then node t2_engines.mjs compare "${2:-v513}" "${3:-v514}"; exit $?; fi
node t1_units.mjs $V && node t2_engines.mjs $V && node t3_roth.mjs $V && \
timeout 900 node t4_dom.mjs $V && timeout 900 node t5_storage.mjs $V && timeout 900 node t6_single.mjs $V && \
node t10_taxcases.mjs $V
