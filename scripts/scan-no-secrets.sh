#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
# Scan tracked source only. Do not invent or print secret values.
hits="$(git grep -nI -E 'SERVICE_ROLE|BEGIN OPENSSH PRIVATE KEY|client_secret|JWT_SECRET|SUPABASE_SERVICE' -- \
  ':!docs/**' ':!*.md' ':!infra/**' ':!*.example' ':!node_modules/**' ':!**/node_modules/**' || true)"
if [[ -n "$hits" ]]; then
  echo "FAIL: possible secret material in tracked files"
  echo "$hits"
  exit 1
fi
echo "OK: no obvious service-role / OAuth / JWT secrets in tracked source"
