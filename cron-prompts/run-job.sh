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
# Ensure report directory exists
mkdir -p "$REPORT_DIR"

# Log file (defined early so trap handler can use it)
LOG_FILE="$REPORT_DIR/cron-${PROMPT_NAME}-${DATE}.log"

# EXIT trap — always writes termination status to log, even on crash/kill
_cleanup() {
  local rc=$?
  if [[ -f "$LOG_FILE" ]] && ! grep -q '^COMPLETED$' "$LOG_FILE" 2>/dev/null; then
    echo "---" >> "$LOG_FILE"
    echo "INTERRUPTED (signal or crash)" >> "$LOG_FILE"
    echo "Exit: $rc" >> "$LOG_FILE"
    echo "End: $(date -Iseconds)" >> "$LOG_FILE"
  fi
  rm -f "$LOCK_FILE"
}
trap _cleanup EXIT INT TERM

# Read prompt and replace {date} placeholder
PROMPT_CONTENT=$(sed "s/{date}/$DATE/g" "$PROMPT_FILE")

echo "=== HypeProof Cron: $PROMPT_NAME ===" | tee "$LOG_FILE"
echo "Date: $DATE" | tee -a "$LOG_FILE"
echo "Start: $(date -Iseconds)" | tee -a "$LOG_FILE"
echo "---" | tee -a "$LOG_FILE"
echo "STARTED" | tee -a "$LOG_FILE"

# Per-job timeout (seconds) — bash 3.x compatible (no associative arrays)
case "$PROMPT_NAME" in
  issue-filer)     TIMEOUT_SEC=300 ;;
  issue-solver)    TIMEOUT_SEC=600 ;;
  daily-research)  TIMEOUT_SEC=900 ;;
  morning-routine) TIMEOUT_SEC=300 ;;
  evening-routine) TIMEOUT_SEC=300 ;;
  weekly-purge)    TIMEOUT_SEC=600 ;;
  weekly-report)   TIMEOUT_SEC=600 ;;
  column-nudge)    TIMEOUT_SEC=300 ;;
  column-deadline) TIMEOUT_SEC=300 ;;
  evaluate)        TIMEOUT_SEC=600 ;;
  *)               TIMEOUT_SEC=600 ;;
esac

case "$PROMPT_NAME" in
  issue-filer)     MAX_TURNS=40 ;;
  issue-solver)    MAX_TURNS=60 ;;
  daily-research)  MAX_TURNS=25 ;;
  morning-routine) MAX_TURNS=15 ;;
  evening-routine) MAX_TURNS=10 ;;
  weekly-purge)    MAX_TURNS=20 ;;
  weekly-report)   MAX_TURNS=15 ;;
  column-nudge)    MAX_TURNS=15 ;;
  column-deadline) MAX_TURNS=10 ;;
  evaluate)        MAX_TURNS=25 ;;
  *)               MAX_TURNS=30 ;;
esac

# Unset CLAUDE* env vars to prevent nested session detection (portable bash)
SAVE_TIMEOUT="${CLAUDE_TIMEOUT:-}"
SAVE_BUDGET="${CLAUDE_BUDGET_USD:-}"
while IFS='=' read -r key _; do
  case "$key" in CLAUDE*|OTEL*) unset "$key" ;; esac
done < <(env)
[[ -n "$SAVE_TIMEOUT" ]] && export CLAUDE_TIMEOUT="$SAVE_TIMEOUT"
[[ -n "$SAVE_BUDGET" ]] && export CLAUDE_BUDGET_USD="$SAVE_BUDGET"

# Find Claude binary
CLAUDE_BIN="${CLAUDE_BIN:-$HOME/.local/bin/claude}"
if [[ ! -x "$CLAUDE_BIN" ]]; then
  echo "FATAL: claude not found at $CLAUDE_BIN" >&2
  exit 1
fi

echo "Claude: $CLAUDE_BIN ($($CLAUDE_BIN --version 2>/dev/null || echo 'version unknown'))" | tee -a "$LOG_FILE"
echo "Timeout: ${TIMEOUT_SEC}s | MaxTurns: ${MAX_TURNS}" | tee -a "$LOG_FILE"

# Pre-flight API health check — skip run if API is unreachable
API_STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
  -H "x-api-key: ${ANTHROPIC_API_KEY:-dummy}" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":1,"messages":[{"role":"user","content":"ping"}]}' \
  https://api.anthropic.com/v1/messages 2>/dev/null || echo "000")

if [[ "$API_STATUS" == "000" ]]; then
  echo "SKIP: Anthropic API unreachable (pre-flight check failed)" | tee -a "$LOG_FILE"
  EXIT_CODE=2
  echo "COMPLETED" | tee -a "$LOG_FILE"
  echo "---" | tee -a "$LOG_FILE"
  echo "Exit: $EXIT_CODE" | tee -a "$LOG_FILE"
  echo "End: $(date -Iseconds)" | tee -a "$LOG_FILE"
  # Log failure
  FAILURE_DIR="$WORKSPACE/.claude/failures"
  mkdir -p "$FAILURE_DIR"
  cat > "$FAILURE_DIR/${DATE}-${PROMPT_NAME}.md" <<FAIL
# Cron Failure: $PROMPT_NAME
- **Date**: $DATE
- **Exit Code**: $EXIT_CODE
- **Reason**: API unreachable (pre-flight health check)
- **Log**: $LOG_FILE
FAIL
  rm -f "$LOCK_FILE"
  exit $EXIT_CODE
fi
echo "Pre-flight: API reachable (HTTP $API_STATUS)" | tee -a "$LOG_FILE"

# Run Claude Code headless with exponential backoff retry + jitter
RETRY_DELAYS=(30 60 120 180 300)
MAX_ATTEMPTS=$(( ${#RETRY_DELAYS[@]} + 1 ))
ATTEMPT=1

set +e
while true; do
  echo "ATTEMPT $ATTEMPT/$MAX_ATTEMPTS" | tee -a "$LOG_FILE"
  perl -e "alarm ${TIMEOUT_SEC}; exec @ARGV" -- \
    "$CLAUDE_BIN" -p "$WORKSPACE" \
    --dangerously-skip-permissions \
    --print \
    --max-turns "$MAX_TURNS" \
    <<< "$PROMPT_CONTENT" 2>&1 | tee -a "$LOG_FILE"
  EXIT_CODE=${pipestatus[1]}

  if [[ "$EXIT_CODE" -eq 0 ]]; then
    break
  fi

  # 401 auth errors: do not retry, alert immediately
  if grep -q "401\|authentication_error\|Invalid authentication" "$LOG_FILE" 2>/dev/null; then
    echo "FATAL: Authentication error (401) — not retrying. Check ANTHROPIC_API_KEY." | tee -a "$LOG_FILE"
    break
  fi

  if ! grep -q "ConnectionRefused\|ECONNREFUSED\|Unable to connect\|ETIMEDOUT\|socket hang up" "$LOG_FILE" 2>/dev/null; then
    break
  fi

  if [[ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]]; then
    echo "FATAL: All $MAX_ATTEMPTS attempts failed with connection errors" | tee -a "$LOG_FILE"
    break
  fi

  DELAY=${RETRY_DELAYS[$ATTEMPT]}
  # Add jitter: +/- 20% randomness to prevent thundering herd
  JITTER=$(( (RANDOM % (DELAY / 5 + 1)) - DELAY / 10 ))
  DELAY=$(( DELAY + JITTER ))
  [[ "$DELAY" -lt 10 ]] && DELAY=10
  echo "RETRY: Connection error on attempt $ATTEMPT — waiting ${DELAY}s before retry..." | tee -a "$LOG_FILE"
  sleep "$DELAY"
  ATTEMPT=$((ATTEMPT + 1))
done
set -e

echo "COMPLETED" | tee -a "$LOG_FILE"
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

# --- Discord DM notification via HypeproofClaude bot ---
NOTIFY="$SCRIPT_DIR/notify-discord.sh"
if [[ -x "$NOTIFY" ]]; then
  if [[ "$EXIT_CODE" -eq 0 ]]; then
    ICON="✅"
  else
    ICON="❌"
  fi
  CLAUDE_OUTPUT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)
  START_TS=$(grep '^Start:' "$LOG_FILE" | head -1 | grep -oE '[0-9]{2}:[0-9]{2}' || true)
  END_TS=$(date +%H:%M)
  "$NOTIFY" "${ICON} **${PROMPT_NAME}** (${START_TS}→${END_TS})
exit=${EXIT_CODE}, output=${CLAUDE_OUTPUT_SIZE}B" 2>/dev/null || true

  # --- Channel alert on failure (#content-pipeline) ---
  if [[ "$EXIT_CODE" -ne 0 ]]; then
    CONTENT_PIPELINE_CHANNEL="1471863670718857247"
    LAST_LINES=$(tail -5 "$LOG_FILE" 2>/dev/null | head -3 || true)
    ALERT_MSG="🚨 **Cron failure: ${PROMPT_NAME}**
• Date: ${DATE}  Time: ${START_TS:-?}→${END_TS}
• Exit code: ${EXIT_CODE}
\`\`\`
${LAST_LINES}
\`\`\`"

    # Escalation: count today's failures — if 3+, tag Jay
    TODAY_FAILURES=$(find "$FAILURE_DIR" -name "${DATE}-*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$TODAY_FAILURES" -ge 3 ]]; then
      ALERT_MSG="${ALERT_MSG}
⚠️ **Escalation**: ${TODAY_FAILURES} failures today — <@1186944844401225808> please check"
    fi

    "$NOTIFY" --channel "$CONTENT_PIPELINE_CHANNEL" "$ALERT_MSG" 2>/dev/null || true
  fi
fi

exit $EXIT_CODE
