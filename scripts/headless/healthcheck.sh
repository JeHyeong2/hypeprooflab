#!/usr/bin/env bash
# Full healthcheck orchestrator.
# Runs T1-T3 via the healthcheck agent, then T4 (agent dry-runs) and T5 (E2E)
# via individual `claude -p` calls at level 0, bypassing sub-agent nesting limits.
#
# Usage: healthcheck.sh [--level unit|integration|e2e|all] [--fix] [--verbose]
set -euo pipefail

# Prevent nested Claude Code session detection — unset ALL Claude env vars
for _v in $(env | grep -E '^CLAUDE|^OTEL' | cut -d= -f1); do unset "$_v"; done

HYPEPROOF_DIR="/Users/jaylee/CodeWorkspace/hypeproof"
cd "$HYPEPROOF_DIR"

LEVEL="${1:-all}"
# Strip leading --level if passed as flag
if [[ "$LEVEL" == "--level" ]]; then
  LEVEL="${2:-all}"
  shift 2 || true
elif [[ "$LEVEL" == --level=* ]]; then
  LEVEL="${LEVEL#--level=}"
  shift || true
fi

DATE=$(date +%Y-%m-%d)
REPORT_FILE="reports/healthcheck-${DATE}.md"
RESULTS_DIR=$(mktemp -d)
trap 'rm -rf "$RESULTS_DIR"' EXIT

# Portable timeout: use GNU timeout if available, else bash background+wait
_timeout() {
  local secs="$1"; shift
  if command -v timeout &>/dev/null; then
    timeout "$secs" "$@"
    return $?
  fi
  "$@" &
  local pid=$!
  ( sleep "$secs" && kill "$pid" 2>/dev/null ) &
  local watchdog=$!
  wait "$pid" 2>/dev/null
  local rc=$?
  kill "$watchdog" 2>/dev/null
  wait "$watchdog" 2>/dev/null || true
  if [ "$rc" -gt 128 ]; then rc=124; fi
  return "$rc"
}

echo "=== HypeProof Healthcheck — $DATE ==="
echo "Level: $LEVEL"
echo ""

# ─────────────────────────────────────────────
# Phase 1: Static checks via healthcheck agent (T1, T2, T3)
# ─────────────────────────────────────────────
echo "▶ Phase 1: Static checks (T1-T3) via healthcheck agent..."

STATIC_LEVEL="all"
if [[ "$LEVEL" == "unit" ]]; then
  STATIC_LEVEL="unit"
elif [[ "$LEVEL" == "e2e" ]]; then
  STATIC_LEVEL="unit"  # E2E-only: skip build in static phase
fi

_timeout 600 claude --print --dangerously-skip-permissions \
  --output-format json \
  --max-budget-usd 2.00 \
  "/healthcheck --level $STATIC_LEVEL" \
  > "$RESULTS_DIR/static.json" 2>&1 || true

echo "  Static checks complete."
echo ""

# ─────────────────────────────────────────────
# Phase 2: Agent dry-runs (T4) — each at level 0
# ─────────────────────────────────────────────
if [[ "$LEVEL" == "unit" ]]; then
  echo "▶ Phase 2: Agent dry-runs SKIPPED (level=unit)"
  echo '{"status":"skip","reason":"level=unit"}' > "$RESULTS_DIR/t4.json"
else
  echo "▶ Phase 2: Agent dry-runs (T4)..."

  # T4.1 content-columnist — outline only
  echo "  T4.1 content-columnist..."
  _timeout 120 claude --print --dangerously-skip-permissions \
    --agent content-columnist \
    --output-format json \
    --max-budget-usd 0.50 \
    "Read CLAUDE.md first. Dry run: for topic 'AI safety testing', output ONLY a JSON outline with title_ko, title_en, slug, sections (array of section titles). Do NOT write any files. Output the JSON to stdout." \
    > "$RESULTS_DIR/t4.1.json" 2>&1 || echo '{"status":"fail","error":"timeout or crash"}' > "$RESULTS_DIR/t4.1.json"

  # T4.2 qa-reviewer — check one column
  echo "  T4.2 qa-reviewer..."
  _timeout 120 claude --print --dangerously-skip-permissions \
    --agent qa-reviewer \
    --output-format json \
    --max-budget-usd 0.50 \
    "Read CLAUDE.md first. QA check the column at web/src/content/columns/ko/ — pick the most recent .md file. Run --type column checks. Output JSON with a verdict field (PASS or FAIL) to stdout." \
    > "$RESULTS_DIR/t4.2.json" 2>&1 || echo '{"status":"fail","error":"timeout or crash"}' > "$RESULTS_DIR/t4.2.json"

  # T4.3 community-manager — announce dry-run
  echo "  T4.3 community-manager..."
  _timeout 120 claude --print --dangerously-skip-permissions \
    --agent community-manager \
    --output-format json \
    --max-budget-usd 0.50 \
    "Read CLAUDE.md first. Generate a Discord announcement for the most recently published column in web/src/content/columns/ko/. Target channel: daily-research. Output JSON with post_content field to stdout. Do NOT actually post anything." \
    > "$RESULTS_DIR/t4.3.json" 2>&1 || echo '{"status":"fail","error":"timeout or crash"}' > "$RESULTS_DIR/t4.3.json"

  # T4.4 research-analyst — topic scan
  echo "  T4.4 research-analyst..."
  _timeout 120 claude --print --dangerously-skip-permissions \
    --agent research-analyst \
    --output-format json \
    --max-budget-usd 0.50 \
    "Read CLAUDE.md first. Dry run: for topic 'AI code generation', output ONLY a JSON with search_queries (array of 3 queries you would use) and column_candidates (array of 2 candidate topics). Do NOT write any files. Output the JSON to stdout." \
    > "$RESULTS_DIR/t4.4.json" 2>&1 || echo '{"status":"fail","error":"timeout or crash"}' > "$RESULTS_DIR/t4.4.json"

  # T4.5 web-developer — build only
  echo "  T4.5 web-developer..."
  _timeout 180 claude --print --dangerously-skip-permissions \
    --agent web-developer \
    --output-format json \
    --max-budget-usd 0.50 \
    "Read CLAUDE.md first. Run build only (no deploy): cd web && npm run build. Report the result as JSON to stdout with a build_passed field (true/false) and an error field if failed. Do NOT deploy." \
    > "$RESULTS_DIR/t4.5.json" 2>&1 || echo '{"status":"fail","error":"timeout or crash"}' > "$RESULTS_DIR/t4.5.json"

  echo "  Agent dry-runs complete."
  echo ""
fi

# ─────────────────────────────────────────────
# Phase 3: E2E Pipeline (T5)
# ─────────────────────────────────────────────
if [[ "$LEVEL" == "e2e" || "$LEVEL" == "all" ]]; then
  echo "▶ Phase 3: E2E pipeline dry-run (T5)..."

  _timeout 300 claude --print --dangerously-skip-permissions \
    --agent publish-orchestrator \
    --output-format json \
    --max-budget-usd 3.00 \
    "Read CLAUDE.md first. Dry-run the full publish pipeline for topic 'healthcheck test column — delete after'. Use flags: --skip-deploy --author JY. After writing files, report JSON output with status, slug, and pipeline_stages fields. Do NOT deploy. Clean up any test files created." \
    > "$RESULTS_DIR/t5.json" 2>&1 || echo '{"status":"fail","error":"timeout or crash"}' > "$RESULTS_DIR/t5.json"

  echo "  E2E pipeline complete."
  echo ""
else
  echo "▶ Phase 3: E2E pipeline SKIPPED (level=$LEVEL)"
  echo '{"status":"skip","reason":"level not e2e or all"}' > "$RESULTS_DIR/t5.json"
fi

# ─────────────────────────────────────────────
# Phase 4: Aggregate results
# ─────────────────────────────────────────────
echo "▶ Phase 4: Aggregating results..."

# Collect all result files and generate summary
claude --print --dangerously-skip-permissions \
  --output-format json \
  --max-budget-usd 0.50 \
  "You are a report aggregator. Read the healthcheck result files in $RESULTS_DIR/ (static.json, t4.*.json, t5.json). Parse each and produce:
1. A markdown report at $REPORT_FILE following the format in .claude/agents/healthcheck.md
2. A JSON summary to stdout

For each T4.N file, check if the JSON contains the expected fields:
- T4.1: title_ko, title_en, slug, sections → PASS if present
- T4.2: verdict → PASS if present
- T4.3: post_content → PASS if present
- T4.4: search_queries, column_candidates → PASS if present
- T4.5: build_passed → PASS if present
If a file contains {\"status\":\"fail\"} or {\"status\":\"skip\"}, mark accordingly.

For T5, check for status, slug, pipeline_stages fields.

Output the final JSON summary to stdout." \
  2>&1 || true

echo ""
echo "=== Healthcheck complete ==="
echo "Report: $REPORT_FILE"
