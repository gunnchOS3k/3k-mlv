#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
tracked="$(git ls-files | grep -E '(^|/)node_modules/' || true)"
if [[ -n "$tracked" ]]; then
  echo "FAIL: node_modules is tracked:"
  echo "$tracked" | head -n 20
  echo "(showing first 20 paths)"
  exit 1
fi
echo "OK: no tracked node_modules"
