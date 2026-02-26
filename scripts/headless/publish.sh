#!/usr/bin/env bash
# Full publish pipeline. Usage: publish.sh "<topic>" [--skip-research] [--skip-deploy] [--author <name>]
# On success, automatically credits points to the author.
set -euo pipefail

HYPEPROOF_DIR="/Users/jaylee/CodeWorkspace/hypeproof"
cd "$HYPEPROOF_DIR"

export CLAUDE_TIMEOUT="${CLAUDE_TIMEOUT:-1800}"
export CLAUDE_BUDGET_USD="${CLAUDE_BUDGET_USD:-5.00}"

SCRIPT_DIR="$(dirname "$0")"

# Run the publish pipeline via run-command.sh
OUTPUT=$("$SCRIPT_DIR/run-command.sh" publish "$@")
EXIT_CODE=$?

echo "$OUTPUT"

# On success, credit points to the author
if [[ "$EXIT_CODE" -eq 0 ]]; then
  # Extract author and slug from the JSON output
  # --output-format json wraps agent output in {"type":"result","result":"..."}
  # The agent's JSON is inside .result as a string, so we parse the wrapper first
  AUTHOR=$(echo "$OUTPUT" | python3 -c "
import sys, json, re
wrapper = json.load(sys.stdin)
result_text = wrapper.get('result', '')
m = re.search(r'\{[^{}]*\"author\"[^{}]*\}', result_text)
if m:
    inner = json.loads(m.group())
    print(inner.get('author', 'JY'))
else:
    print('JY')
" 2>/dev/null || echo "JY")
  SLUG=$(echo "$OUTPUT" | python3 -c "
import sys, json, re
wrapper = json.load(sys.stdin)
result_text = wrapper.get('result', '')
m = re.search(r'\{[^{}]*\"slug\"[^{}]*\}', result_text)
if m:
    inner = json.loads(m.group())
    print(inner.get('slug', ''))
else:
    print('')
" 2>/dev/null || echo "")

  if [[ -n "$SLUG" && -n "${CREDIT_API_SECRET:-}" ]]; then
    echo "Crediting points to $AUTHOR for $SLUG..." >&2
    "$SCRIPT_DIR/credit-points.sh" "$AUTHOR" "COLUMN_PUBLISH" "$SLUG" 2>&1 || \
      echo "Warning: Point credit failed (non-fatal)" >&2
  elif [[ -z "${CREDIT_API_SECRET:-}" ]]; then
    echo "Skipping point credit: CREDIT_API_SECRET not set" >&2
  fi
fi

exit "$EXIT_CODE"
