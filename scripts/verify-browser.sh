#!/bin/sh
set -eu

base_url=${1:-http://127.0.0.1:4173/helper/}
evidence_dir=${2:-browser-evidence}

node scripts/verify-browser.mjs "$base_url" "$evidence_dir"
