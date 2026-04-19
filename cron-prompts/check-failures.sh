#!/usr/bin/env zsh
# check-failures.sh — Daily failure digest for Discord #content-pipeline
# Usage: check-failures.sh [--days N]  (default: 1 = last 24h)
# Called by morning-routine or manually.
# Posts a consolidated summary if any failures exist; silent otherwise.

set -euo pipefail

WORKSPACE="${HYPEPROOF_WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FAILURE_DIR="$WORKSPACE/.claude/failures"
CONTENT_PIPELINE_CHANNEL="1471863670718857247"
NOTIFY="$SCRIPT_DIR/notify-discord.sh"

# Parse --days flag (default: 1)
DAYS=1
if [[ "${1:-}" == "--days" ]]; then
  DAYS="${2:-1}"
fi

# Find failure files from the last N days
FAILURES=()
while IFS= read -r f; do
  FAILURES+=("$f")
done < <(find "$FAILURE_DIR" -name "*.md" -mtime -"$DAYS" 2>/dev/null | sort)

COUNT=${#FAILURES[@]}

if [[ "$COUNT" -eq 0 ]]; then
  echo "No failures in last ${DAYS} day(s)"
  exit 0
fi

# Build digest
DIGEST="📋 **Daily Failure Digest** (last ${DAYS}d): **${COUNT}** failure(s)
"

for f in "${FAILURES[@]}"; do
  BASENAME=$(basename "$f" .md)
  # Extract job name and date from filename: YYYY-MM-DD-jobname.md
  JOB_DATE=$(echo "$BASENAME" | grep -oE '^[0-9]{4}-[0-9]{2}-[0-9]{2}' || echo "?")
  JOB_NAME=$(echo "$BASENAME" | sed "s/^${JOB_DATE}-//" || echo "?")
  EXIT_CODE=$(grep -oP '(?<=\*\*Exit Code\*\*: )\d+' "$f" 2>/dev/null || echo "?")
  DIGEST="${DIGEST}• \`${JOB_NAME}\` (${JOB_DATE}) — exit ${EXIT_CODE}
"
done

# Escalation for 3+
if [[ "$COUNT" -ge 3 ]]; then
  DIGEST="${DIGEST}
⚠️ **${COUNT} failures** — <@1186944844401225808> review recommended"
fi

# Post to #content-pipeline
if [[ -x "$NOTIFY" ]]; then
  "$NOTIFY" --channel "$CONTENT_PIPELINE_CHANNEL" "$DIGEST" 2>/dev/null || {
    echo "WARN: failed to post digest to Discord" >&2
  }
  echo "Posted digest (${COUNT} failures) to #content-pipeline"
else
  echo "WARN: notify-discord.sh not found — printing digest instead" >&2
  echo "$DIGEST"
fi
