#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
# Scan tracked source only. Do not invent or print secret values.
# The scanner file is excluded so its own pattern list cannot self-match.
# Patterns are assembled so this file does not contain the contiguous tokens.
p1='SERVICE''_ROLE'
p2='BEGIN OPENSSH PRIVATE KEY'
p3='client''_secret'
p4='JWT''_SECRET'
p5='SUPABASE''_SERVICE'
hits="$(git grep -nI -E "${p1}|${p2}|${p3}|${p4}|${p5}" -- \
  ':!docs/**' ':!*.md' ':!infra/**' ':!*.example' \
  ':!scripts/scan-no-secrets.sh' \
  ':!node_modules/**' ':!**/node_modules/**' || true)"
if [[ -n "$hits" ]]; then
  echo "FAIL: possible secret material in tracked files"
  echo "$hits"
  exit 1
fi
echo "OK: no obvious dashboard / OAuth / JWT signing secrets in tracked source"
