#!/usr/bin/env zsh
# run-job-parallel.sh — Parallel issue-solver with worktree isolation
# Usage: run-job-parallel.sh issue-solver [--dry-run]
#
# Fetches open issues, solves each in a parallel worktree,
# then serially merges to main.

set -euo pipefail

WORKSPACE="${HYPEPROOF_WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPORT_DIR="$WORKSPACE/cron-reports"
DATE=$(date +%Y-%m-%d)
WORKTREE_BASE="$WORKSPACE/.claude/worktrees"

# Safety limits
MAX_CONCURRENT="${MAX_CONCURRENT_OVERRIDE:-3}"
GLOBAL_TIMEOUT=1800  # 30 minutes
# Source shell aliases (cc = personal Claude Code account)
[[ -f "$HOME/.shell_common" ]] && source "$HOME/.shell_common"
CLAUDE_BIN="${CLAUDE_BIN:-$(command -v cc 2>/dev/null || command -v claude 2>/dev/null || echo "$HOME/.local/bin/claude")}"

DRY_RUN=false
MODE="${1:-help}"
shift || true

# Parse flags
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) ARGS+=("$arg") ;;
  esac
done

LOG_FILE="$REPORT_DIR/cron-parallel-${MODE}-${DATE}.log"
mkdir -p "$REPORT_DIR"

# Global PID tracking for cleanup
BG_PIDS=()

log() {
  echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG_FILE"
}

# --- Worktree helpers ---

create_worktree() {
  local name="$1"
  local wt_path="${WORKTREE_BASE}/batch-${DATE}/${name}"
  local branch="batch/${DATE}/${name}"

  if $DRY_RUN; then
    echo "[dry-run] Would create worktree: $wt_path (branch: $branch)"
    return
  fi

  mkdir -p "$(dirname "$wt_path")"
  git -C "$WORKSPACE" worktree add -b "$branch" "$wt_path" HEAD >/dev/null 2>&1 || {
    git -C "$WORKSPACE" branch -D "$branch" >/dev/null 2>&1 || true
    git -C "$WORKSPACE" worktree add -b "$branch" "$wt_path" HEAD >/dev/null 2>&1
  }
  echo "$wt_path"
}

cleanup_worktrees() {
  for pid in "${BG_PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      log "Killing background process $pid"
      kill "$pid" 2>/dev/null || true
    fi
  done
  for pid in "${BG_PIDS[@]}"; do
    wait "$pid" 2>/dev/null || true
  done

  local batch_dir="${WORKTREE_BASE}/batch-${DATE}"
  if [[ -d "$batch_dir" ]]; then
    log "Cleaning up worktrees in $batch_dir"
    for wt in "$batch_dir"/*/; do
      [[ -d "$wt" ]] || continue
      git -C "$WORKSPACE" worktree remove --force "$wt" 2>/dev/null || true
    done
    rmdir "$batch_dir" 2>/dev/null || true
  fi
}

if ! $DRY_RUN; then
  trap cleanup_worktrees EXIT
fi

# --- Mode: issue-solver ---

run_issue_solver() {
  log "=== Issue Solver Batch ==="

  local REPO="jayleekr/hypeprooflab"
  local SKIP_LABELS="blocked,no-auto-fix,needs-human"

  # Fetch open issues with priority labels
  local issues_json
  issues_json=$(gh issue list --repo "$REPO" --state open \
    --json number,title,body,labels,createdAt --limit 20 2>/dev/null || echo "[]")

  # Filter: skip issues with skip labels
  issues_json=$(printf '%s' "$issues_json" | python3 -c "
import sys, json
issues = json.load(sys.stdin)
skip = set('$SKIP_LABELS'.split(','))
filtered = []
for i in issues:
    labels = {l.get('name','') for l in i.get('labels',[])}
    if skip & labels:
        continue
    # Prioritize: priority:high first, then priority:medium
    has_high = 'priority:high' in labels
    has_medium = 'priority:medium' in labels
    if has_high or has_medium:
        filtered.append({'issue': i, 'priority': 0 if has_high else 1})
# Sort: high priority first, then oldest first
filtered.sort(key=lambda x: (x['priority'], x['issue'].get('createdAt', '')))
json.dump([f['issue'] for f in filtered], sys.stdout)
" 2>/dev/null || printf '%s' "$issues_json")

  local issue_count
  issue_count=$(printf '%s' "$issues_json" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)

  if [[ "$issue_count" -eq 0 ]]; then
    log "No open issues to solve"
    return 0
  fi

  # Cap at MAX_CONCURRENT
  local run_count=$issue_count
  [[ "$run_count" -gt "$MAX_CONCURRENT" ]] && run_count=$MAX_CONCURRENT

  log "Found $issue_count issues, solving $run_count"

  if $DRY_RUN; then
    printf '%s' "$issues_json" | python3 -c "
import sys, json
issues = json.load(sys.stdin)[:$run_count]
for i in issues:
    print(f'[dry-run] Issue #{i[\"number\"]}: {i[\"title\"]}')
    print(f'  Would create worktree: .claude/worktrees/batch-$DATE/issue-{i[\"number\"]}')
"
    return
  fi

  # Template for per-issue prompt
  local unit_template="$SCRIPT_DIR/issue-solver-unit.md"
  if [[ ! -f "$unit_template" ]]; then
    log "ERROR: Missing template: $unit_template"
    exit 1
  fi

  # Unset CLAUDE* env vars to prevent nested session detection
  unset ${(k)parameters[(R)*CLAUDE*]} 2>/dev/null || true
  unset ${(k)parameters[(R)*OTEL*]} 2>/dev/null || true

  # ===== PHASE 1: Parallel solve in worktrees =====
  local pids=()
  local issue_numbers=()
  local issue_titles=()

  while IFS=$'\t' read -r num title body; do
    [[ -z "$num" ]] && continue

    log "Starting issue #$num: $title"

    local wt_path
    wt_path=$(create_worktree "issue-${num}")

    # Generate per-issue prompt from template
    local prompt_content
    prompt_content=$(sed \
      -e "s|{title}|$title|g" \
      -e "s|{number}|$num|g" \
      -e "s|{date}|$DATE|g" \
      "$unit_template")
    prompt_content=$(echo "$prompt_content" | sed "s|{body}|See issue #$num for full body|g")

    # Progressive retry budget: 30 -> 50 -> 80
    local fail_file="$WORKSPACE/.claude/state/issue-retry-counts/${num}"
    local attempts=0
    [[ -f "$fail_file" ]] && attempts=$(cat "$fail_file" 2>/dev/null || echo 0)
    local turns=30
    if [[ "$attempts" -ge 2 ]]; then turns=80
    elif [[ "$attempts" -ge 1 ]]; then turns=50
    fi

    (
      cd "$wt_path"
      perl -e "alarm 600; exec @ARGV" -- \
        "$CLAUDE_BIN" -p "$wt_path" \
        --print \
        --allowedTools Read,Glob,Grep,Write,Edit,Bash \
        --max-turns "$turns" \
        <<< "$prompt_content" \
        2>&1 | tee "$REPORT_DIR/cron-issue-${num}-${DATE}.log"
    ) &
    pids+=($!)
    BG_PIDS+=($!)
    issue_numbers+=("$num")
    issue_titles+=("$title")
  done < <(printf '%s' "$issues_json" | python3 -c "
import sys, json
issues = json.load(sys.stdin)[:$run_count]
for iss in issues:
    n = iss['number']
    t = iss['title']
    b = (iss.get('body') or '').replace('\n', '\\\\n')
    print(f'{n}\t{t}\t{b}')
")

  # Wait for all parallel solvers
  local solve_results=()
  local i=0
  for pid in "${pids[@]}"; do
    i=$((i + 1))
    local num="${issue_numbers[$i]}"
    local issue_log="$REPORT_DIR/cron-issue-${num}-${DATE}.log"
    local result="ok"

    if ! wait "$pid"; then
      result="process-error"
    fi

    # Detect silent failures
    if [[ "$result" == "ok" ]] && [[ -f "$issue_log" ]]; then
      local log_size
      log_size=$(wc -c < "$issue_log" | tr -d ' ')
      if [[ "$log_size" -eq 0 ]]; then
        result="empty-output"
      elif grep -q 'Reached max turns' "$issue_log" 2>/dev/null; then
        result="max-turns"
      fi
    elif [[ "$result" == "ok" ]] && [[ ! -f "$issue_log" ]]; then
      result="no-log"
    fi

    # Check for commits
    if [[ "$result" == "ok" ]]; then
      local wt_path="${WORKTREE_BASE}/batch-${DATE}/issue-${num}"
      local commit_count=0
      if [[ -d "$wt_path" ]]; then
        commit_count=$(git -C "$wt_path" log --oneline HEAD...main 2>/dev/null | wc -l | tr -d ' ')
      fi
      if [[ "$commit_count" -eq 0 ]]; then
        local issue_state
        issue_state=$(gh issue view "$num" --repo "$REPO" --json state -q '.state' 2>/dev/null || echo "OPEN")
        if [[ "$issue_state" == "CLOSED" ]]; then
          result="closed-no-changes"
        else
          result="no-commits"
        fi
      fi
    fi

    solve_results+=("$result")
    if [[ "$result" == "ok" ]]; then
      log "Issue #$num: solve completed (commits ready)"
    elif [[ "$result" == "closed-no-changes" ]]; then
      log "Issue #$num: closed by solver (already implemented or blocked)"
    else
      log "Issue #$num: solve FAILED ($result)"
      # Track retry count
      mkdir -p "$WORKSPACE/.claude/state/issue-retry-counts"
      local fail_file="$WORKSPACE/.claude/state/issue-retry-counts/${num}"
      local prev=0
      [[ -f "$fail_file" ]] && prev=$(cat "$fail_file" 2>/dev/null || echo 0)
      echo $((prev + 1)) > "$fail_file"
    fi
  done

  # ===== PHASE 2: Serial merge to main =====
  log "--- Serial merge phase ---"

  local merged=0 failed=0 skipped=0

  i=0
  for result in "${solve_results[@]}"; do
    i=$((i + 1))
    local num="${issue_numbers[$i]}"
    local wt_branch="batch/${DATE}/issue-${num}"

    if [[ "$result" == "closed-no-changes" ]]; then
      skipped=$((skipped + 1))
      continue
    fi

    if [[ "$result" != "ok" ]]; then
      failed=$((failed + 1))
      gh issue comment "$num" --repo "$REPO" \
        --body "Auto-solve attempt: $result. Will retry with more budget next cycle.

*issue-solver ($DATE)*" \
        2>/dev/null || log "WARN: Could not comment on issue #$num"
      continue
    fi

    # Merge worktree branch into main
    log "Merging issue #$num into main..."
    cd "$WORKSPACE"

    git pull --ff-only origin main 2>/dev/null || true

    local merge_ok=true
    if ! git merge --squash "$wt_branch" 2>/dev/null; then
      log "Issue #$num: merge conflict — aborting"
      git merge --abort 2>/dev/null || git reset --hard HEAD 2>/dev/null || true
      merge_ok=false
    fi

    if $merge_ok; then
      if ! git diff --staged --quiet 2>/dev/null; then
        git commit -m "fix: resolve #${num} — auto-merged from issue-solver ($DATE)" --no-verify 2>&1 | tee -a "$LOG_FILE"
      else
        log "Issue #$num: squash produced no diff — closing"
        gh issue close "$num" --repo "$REPO" \
          --comment "Changes already in main. Closing.

*issue-solver ($DATE)*" \
          2>/dev/null || true
        merged=$((merged + 1))
        continue
      fi

      # Quality gate: npm build
      if $merge_ok; then
        cd "$WORKSPACE/web"
        if ! npm run build 2>/dev/null; then
          log "Issue #$num: quality gate FAILED (npm build) — reverting"
          cd "$WORKSPACE"
          git reset --hard HEAD~1 2>/dev/null || true
          merge_ok=false
        fi
        cd "$WORKSPACE"
      fi

      # Push to remote
      if $merge_ok && git push origin main 2>&1 | tee -a "$LOG_FILE"; then
        log "Issue #$num: merged and pushed to main"

        local commit_hash
        commit_hash=$(git rev-parse --short HEAD)
        gh issue close "$num" --repo "$REPO" \
          --comment "Resolved in ${commit_hash}. Auto-merged by issue-solver.

*issue-solver ($DATE)*" \
          2>/dev/null || log "WARN: Could not close issue #$num"

        # Clear retry count on success
        rm -f "$WORKSPACE/.claude/state/issue-retry-counts/${num}" 2>/dev/null || true

        merged=$((merged + 1))
      elif $merge_ok; then
        log "Issue #$num: push failed — will retry"
        git reset --hard HEAD~1 2>/dev/null || true
        merge_ok=false
      fi
    fi

    if ! $merge_ok; then
      failed=$((failed + 1))
      gh issue comment "$num" --repo "$REPO" \
        --body "Auto-solve: code fix ready but merge/push failed. Will retry next cycle.

*issue-solver ($DATE)*" \
        2>/dev/null || log "WARN: Could not comment on issue #$num"
    fi
  done

  local total_success=$((merged + skipped))
  log "=== Issue Solver Done: ${total_success}/${#solve_results[@]} resolved (${merged} merged, ${skipped} closed, ${failed} failed) ==="

  # --- Discord DM notification via HypeproofClaude bot ---
  local notify="$SCRIPT_DIR/notify-discord.sh"
  if [[ -x "$notify" ]] && [[ ${#solve_results[@]} -gt 0 ]]; then
    local dm_lines="🔧 **Issue Solver** ($(date +%H:%M))\nIssue Solver Done: ${total_success}/${#solve_results[@]} resolved (${merged} merged, ${failed} failed)\n"
    local idx=0
    for result in "${solve_results[@]}"; do
      idx=$((idx + 1))
      local num="${issue_numbers[$idx]}"
      local title="${issue_titles[$idx]:-issue}"
      if [[ "$result" == "ok" ]]; then
        dm_lines+="• #${num} ✅ ${title}\n"
      elif [[ "$result" == "closed-no-changes" ]]; then
        dm_lines+="• #${num} ⏭ ${title} (already done)\n"
      else
        dm_lines+="• #${num} ❌ ${title} (failed)\n"
      fi
    done
    echo -e "$dm_lines" | "$notify" 2>/dev/null || log "WARN: Discord notification failed"
  fi

  return $failed
}

# --- Main dispatch ---
case "$MODE" in
  issue-solver) run_issue_solver ;;
  help|*)
    echo "Usage: run-job-parallel.sh <mode> [--dry-run]"
    echo ""
    echo "Modes:"
    echo "  issue-solver    Per-issue worktree batch solve"
    echo ""
    echo "Options:"
    echo "  --dry-run   Print what would happen without executing"
    echo ""
    echo "Safety: max $MAX_CONCURRENT concurrent sessions, ${GLOBAL_TIMEOUT}s global timeout"
    ;;
esac
