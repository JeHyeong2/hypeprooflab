#!/usr/bin/env bash
# Core runner for Claude Code headless commands.
# Usage: run-command.sh <command> [args...]
# Env: CLAUDE_TIMEOUT (override timeout), CLAUDE_BUDGET_USD (override budget)
set -euo pipefail

HYPEPROOF_DIR="/Users/jaylee/CodeWorkspace/hypeproof"
COMMAND="${1:?Usage: run-command.sh <command> [args...]}"
shift
ARGS="${*:-}"

# Capture user overrides BEFORE wiping Claude env vars
_USER_TIMEOUT="${CLAUDE_TIMEOUT:-}"
_USER_BUDGET="${CLAUDE_BUDGET_USD:-}"

# Prevent nested Claude Code session detection — unset ALL Claude env vars
for _v in $(env | grep -E '^CLAUDE|^OTEL' | cut -d= -f1); do unset "$_v"; done

# Per-command default budget and timeout (user overrides take priority)
case "$COMMAND" in
  write-column)  TIMEOUT="${_USER_TIMEOUT:-600}";  BUDGET="${_USER_BUDGET:-2.00}" ;;
  write-novel)   TIMEOUT="${_USER_TIMEOUT:-900}";  BUDGET="${_USER_BUDGET:-5.00}" ;;
  publish)       TIMEOUT="${_USER_TIMEOUT:-1800}"; BUDGET="${_USER_BUDGET:-5.00}" ;;
  qa-check)      TIMEOUT="${_USER_TIMEOUT:-300}";  BUDGET="${_USER_BUDGET:-1.00}" ;;
  research)      TIMEOUT="${_USER_TIMEOUT:-600}";  BUDGET="${_USER_BUDGET:-2.00}" ;;
  deploy)        TIMEOUT="${_USER_TIMEOUT:-600}";  BUDGET="${_USER_BUDGET:-2.00}" ;;
  announce)      TIMEOUT="${_USER_TIMEOUT:-180}";  BUDGET="${_USER_BUDGET:-0.50}" ;;
  healthcheck)   TIMEOUT="${_USER_TIMEOUT:-600}";  BUDGET="${_USER_BUDGET:-3.00}" ;;
  *)             TIMEOUT="${_USER_TIMEOUT:-600}";  BUDGET="${_USER_BUDGET:-1.00}" ;;
esac

cd "$HYPEPROOF_DIR"

# Portable timeout: use GNU timeout if available, else bash background+wait
_run_with_timeout() {
  local secs="$1"; shift
  if command -v timeout &>/dev/null; then
    timeout "$secs" "$@"
    return $?
  fi
  # Fallback: background process with kill after timeout
  "$@" &
  local pid=$!
  ( sleep "$secs" && kill "$pid" 2>/dev/null ) &
  local watchdog=$!
  wait "$pid" 2>/dev/null
  local rc=$?
  kill "$watchdog" 2>/dev/null
  wait "$watchdog" 2>/dev/null || true
  # Killed by signal = 128+signal. Map to 124 (GNU timeout convention)
  if [ "$rc" -gt 128 ]; then rc=124; fi
  return "$rc"
}

# Run claude in headless mode with JSON output
_run_with_timeout "$TIMEOUT" claude --print --dangerously-skip-permissions \
  --output-format json \
  --max-budget-usd "$BUDGET" \
  "/$COMMAND $ARGS"

EXIT_CODE=$?

# Map timeout exit code (124) to our convention (2)
if [ "$EXIT_CODE" -eq 124 ]; then
  echo '{"status":"error","error":"timeout after '"$TIMEOUT"'s"}' >&2
  exit 2
fi

exit "$EXIT_CODE"
