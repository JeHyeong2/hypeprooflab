#!/usr/bin/env bash
# verify-members.sh — Check that all active members from data/members.json
# appear in the Next.js build output. Exits non-zero on failure.
#
# Usage: bash scripts/verify-members.sh [--create-issue]
#   --create-issue  Auto-create a GitHub Issue on failure (requires gh CLI)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEMBERS_JSON="$REPO_ROOT/data/members.json"
BUILD_DIR="$REPO_ROOT/web/.next"
CREATE_ISSUE=false

for arg in "$@"; do
  case "$arg" in
    --create-issue) CREATE_ISSUE=true ;;
  esac
done

if [[ ! -f "$MEMBERS_JSON" ]]; then
  echo "ERROR: $MEMBERS_JSON not found"
  exit 1
fi

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "ERROR: Build output not found at $BUILD_DIR. Run 'cd web && npm run build' first."
  exit 1
fi

# Extract active member displayNames from members.json
MEMBERS=$(python3 -c "
import json, sys
with open('$MEMBERS_JSON') as f:
    data = json.load(f)
for m in data['members']:
    if m.get('status') == 'active':
        print(m['displayName'])
")

if [[ -z "$MEMBERS" ]]; then
  echo "ERROR: No active members found in $MEMBERS_JSON"
  exit 1
fi

echo "=== Member Verification ==="
echo "Checking build output for all active members..."
echo ""

MISSING=()
FOUND=0
TOTAL=0

while IFS= read -r name; do
  TOTAL=$((TOTAL + 1))
  # Search in pre-rendered HTML and RSC payload files
  if grep -rq "$name" "$BUILD_DIR/server" 2>/dev/null; then
    echo "  OK: $name"
    FOUND=$((FOUND + 1))
  else
    echo "  MISSING: $name"
    MISSING+=("$name")
  fi
done <<< "$MEMBERS"

echo ""
echo "Result: $FOUND/$TOTAL members found in build output"

if [[ ${#MISSING[@]} -gt 0 ]]; then
  MISSING_LIST=$(printf '- %s\n' "${MISSING[@]}")

  echo ""
  echo "FAIL: The following members are missing from build output:"
  echo "$MISSING_LIST"

  if [[ "$CREATE_ISSUE" == "true" ]]; then
    echo ""
    echo "Creating GitHub Issue..."
    gh issue create \
      --repo jayleekr/hypeprooflab \
      --title "[bug] Members missing from build output: ${MISSING[*]}" \
      --label "bug,area:data,agent:mother" \
      --body "$(cat <<EOF
## Auto-detected: Members missing from build output

The post-build verification found that the following members from \`data/members.json\` are **not present** in the build output:

$MISSING_LIST

### Expected
All active members should appear in the rendered dashboard/creators pages.

### Action Required
- Mother: verify \`data/members.json\` entries and rebuild
- If Mother cannot fix: escalate to Jay

> Auto-filed by \`verify-members.yml\` GitHub Action
EOF
)"
    echo "Issue created successfully."
  fi

  exit 1
fi

echo "PASS: All active members verified in build output."
exit 0
