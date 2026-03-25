#!/usr/bin/env zsh
# run-job.sh — Cron wrapper for Claude Code headless execution
# Usage: run-job.sh <prompt-name>  (e.g., issue-solver, issue-filer)
# Called by launchd or manually.

set -euo pipefail

WORKSPACE="${HYPEPROOF_WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPT_DIR="$WORKSPACE/cron-prompts"
REPORT_DIR="$WORKSPACE/cron-reports"
DATE=$(date +%Y-%m-%d)

# Validate argument
if [[ $# -lt 1 ]]; then
  echo "Usage: run-job.sh <prompt-name>"
  echo "Available: issue-solver, issue-filer"
  exit 1
fi

PROMPT_NAME="$1"
PROMPT_FILE="$PROMPT_DIR/${PROMPT_NAME}.md"

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Error: Prompt file not found: $PROMPT_FILE"
  exit 1
fi

# Lock file — prevent concurrent runs of the same prompt
LOCK_FILE="/tmp/hypeproof-cron-${PROMPT_NAME}.lock"
if [[ -f "$LOCK_FILE" ]]; then
  LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null)
  if kill -0 "$LOCK_PID" 2>/dev/null; then
    echo "ERROR: $PROMPT_NAME already running (PID $LOCK_PID)" >&2
    exit 1
  fi
  rm -f "$LOCK_FILE"  # stale lock
fi
# Atomic create — noclobber ensures only one process wins
( set -C; echo $$ > "$LOCK_FILE" ) 2>/dev/null || {
  echo "ERROR: $PROMPT_NAME lock race lost" >&2; exit 1
}
trap "rm -f '$LOCK_FILE'" EXIT

# Ensure report directory exists
mkdir -p "$REPORT_DIR"

# Read prompt and replace {date} placeholder
PROMPT_CONTENT=$(sed "s/{date}/$DATE/g" "$PROMPT_FILE")

# Log file
LOG_FILE="$REPORT_DIR/cron-${PROMPT_NAME}-${DATE}.log"

echo "=== HypeProof Cron: $PROMPT_NAME ===" | tee "$LOG_FILE"
echo "Date: $DATE" | tee -a "$LOG_FILE"
echo "Start: $(date -Iseconds)" | tee -a "$LOG_FILE"
echo "---" | tee -a "$LOG_FILE"

# Per-prompt tool scoping
case "$PROMPT_NAME" in
  issue-filer)
    TOOL_SCOPE="--allowedTools Read,Glob,Grep,Bash"
    ;;
  issue-solver)
    TOOL_SCOPE="--allowedTools Read,Glob,Grep,Write,Edit,Bash,Agent"
    ;;
  *)
    TOOL_SCOPE="--allowedTools Read,Glob,Grep,Write,Edit,Agent"
    ;;
esac

# Per-job timeout (seconds)
set +u
declare -A JOB_TIMEOUT=(
  [issue-filer]=300
  [issue-solver]=600
)
TIMEOUT_SEC="${JOB_TIMEOUT[$PROMPT_NAME]:-600}"

declare -A JOB_MAX_TURNS=(
  [issue-filer]=40
  [issue-solver]=60
)
MAX_TURNS="${JOB_MAX_TURNS[$PROMPT_NAME]:-30}"
set -u

# Unset CLAUDE* env vars to prevent nested session detection
SAVE_TIMEOUT="${CLAUDE_TIMEOUT:-}"
SAVE_BUDGET="${CLAUDE_BUDGET_USD:-}"
unset ${(k)parameters[(R)*CLAUDE*]} 2>/dev/null || true
unset ${(k)parameters[(R)*OTEL*]} 2>/dev/null || true
[[ -n "$SAVE_TIMEOUT" ]] && export CLAUDE_TIMEOUT="$SAVE_TIMEOUT"
[[ -n "$SAVE_BUDGET" ]] && export CLAUDE_BUDGET_USD="$SAVE_BUDGET"

# Find Claude binary
# Source shell aliases (cc = personal Claude Code account)
[[ -f "$HOME/.shell_common" ]] && source "$HOME/.shell_common"
CLAUDE_BIN="${CLAUDE_BIN:-$(command -v cc 2>/dev/null || command -v claude 2>/dev/null || echo "$HOME/.local/bin/claude")}"
if [[ ! -x "$CLAUDE_BIN" ]] && ! type "$CLAUDE_BIN" &>/dev/null; then
  echo "FATAL: claude/cc not found" >&2
  exit 1
fi

echo "Claude: $CLAUDE_BIN ($($CLAUDE_BIN --version 2>/dev/null || echo 'version unknown'))" | tee -a "$LOG_FILE"
echo "Timeout: ${TIMEOUT_SEC}s | MaxTurns: ${MAX_TURNS}" | tee -a "$LOG_FILE"

# Run Claude Code headless
set +e
perl -e "alarm ${TIMEOUT_SEC}; exec @ARGV" -- \
  "$CLAUDE_BIN" -p "$WORKSPACE" \
  --print \
  ${=TOOL_SCOPE} \
  --max-turns "$MAX_TURNS" \
  <<< "$PROMPT_CONTENT" 2>&1 | tee -a "$LOG_FILE"
EXIT_CODE=${pipestatus[1]}

# Retry once on connection error
if [[ "$EXIT_CODE" -ne 0 ]] && grep -q "ConnectionRefused\|ECONNREFUSED\|Unable to connect" "$LOG_FILE" 2>/dev/null; then
  echo "RETRY: Connection error — waiting 60s and retrying..." | tee -a "$LOG_FILE"
  sleep 60
  perl -e "alarm ${TIMEOUT_SEC}; exec @ARGV" -- \
    "$CLAUDE_BIN" -p "$WORKSPACE" \
    --print \
    ${=TOOL_SCOPE} \
    --max-turns "$MAX_TURNS" \
    <<< "$PROMPT_CONTENT" 2>&1 | tee -a "$LOG_FILE"
  EXIT_CODE=${pipestatus[1]}
fi
set -e

echo "---" | tee -a "$LOG_FILE"
echo "Exit: $EXIT_CODE" | tee -a "$LOG_FILE"
echo "End: $(date -Iseconds)" | tee -a "$LOG_FILE"

# Log failures
FAILURE_DIR="$WORKSPACE/.claude/failures"
if [[ "$EXIT_CODE" -ne 0 ]]; then
  echo "WARN: Claude exited with code $EXIT_CODE" | tee -a "$LOG_FILE"
  mkdir -p "$FAILURE_DIR"
  cat > "$FAILURE_DIR/${DATE}-${PROMPT_NAME}.md" <<FAIL
# Cron Failure: $PROMPT_NAME
- **Date**: $DATE
- **Exit Code**: $EXIT_CODE
- **Log**: $LOG_FILE

## Last 20 lines of output
\`\`\`
$(tail -20 "$LOG_FILE")
\`\`\`
FAIL
fi

# Cleanup old logs (30+ days)
find "$REPORT_DIR" -name "cron-*.log" -mtime +30 -delete 2>/dev/null || true
find "$FAILURE_DIR" -name "*.md" -mtime +30 -delete 2>/dev/null || true

exit $EXIT_CODE
