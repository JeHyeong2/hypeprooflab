#!/usr/bin/env bash
# Academy Case Generation — Self-Evolving HITL Pipeline
#
# Orchestrates the full case generation loop:
#   Phase 0: SEED    → generate case registry → critic → HITL gate
#   Phase 1: GENERATE → for each case: plan → critic → test → fix loop
#                      → partner-reviewer (동아 perspective)
#                      → HITL if score < threshold
#   Phase 2: INTEGRATE → portfolio packaging → cross-case test → HITL final
#
# Usage:
#   academy-casegen.sh                      # full pipeline
#   academy-casegen.sh --phase seed         # seed only
#   academy-casegen.sh --phase generate     # generate only (requires seed)
#   academy-casegen.sh --cases "pediatric-ward,corporate-csr"  # specific cases
#   academy-casegen.sh --max-loops 3        # override loop count
#
# HITL gates pause and wait for user input via stdin.
# In headless mode (--no-hitl), gates are skipped and defaults used.
set -euo pipefail

# ── Config ────────────────────────────────────────────
HYPEPROOF_DIR="/Users/jaylee/CodeWorkspace/hypeproof"
CASES_DIR="$HYPEPROOF_DIR/products/ai-architect-academy/cases"
CONFIG="$CASES_DIR/casegen.yaml"
RESULTS_DIR=$(mktemp -d)
trap 'rm -rf "$RESULTS_DIR"' EXIT

# Defaults (overridable by flags)
PHASE="all"
SPECIFIC_CASES=""
MAX_LOOPS=5
CRITIC_THRESHOLD=7
NO_HITL=false

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --phase)       PHASE="$2"; shift 2 ;;
    --cases)       SPECIFIC_CASES="$2"; shift 2 ;;
    --max-loops)   MAX_LOOPS="$2"; shift 2 ;;
    --threshold)   CRITIC_THRESHOLD="$2"; shift 2 ;;
    --no-hitl)     NO_HITL=true; shift ;;
    *)             echo "Unknown flag: $1"; exit 1 ;;
  esac
done

# Prevent nested Claude Code session detection
for _v in $(env | grep -E '^CLAUDE|^OTEL' | cut -d= -f1); do unset "$_v"; done

cd "$HYPEPROOF_DIR"

DATE=$(date +%Y-%m-%d)
LOG_FILE="$CASES_DIR/pipeline-log-${DATE}.md"

# Portable timeout
_timeout() {
  local secs="$1"; shift
  if command -v timeout &>/dev/null; then
    timeout "$secs" "$@"; return $?
  fi
  "$@" &
  local pid=$!
  ( sleep "$secs" && kill "$pid" 2>/dev/null ) &
  local watchdog=$!
  wait "$pid" 2>/dev/null; local rc=$?
  kill "$watchdog" 2>/dev/null; wait "$watchdog" 2>/dev/null || true
  if [ "$rc" -gt 128 ]; then rc=124; fi
  return "$rc"
}

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG_FILE"; }

# ── HITL Gate ─────────────────────────────────────────
# Pauses for human input. In --no-hitl mode, auto-approves.
hitl_gate() {
  local gate_name="$1"
  local prompt="$2"
  local context_file="${3:-}"

  if [[ "$NO_HITL" == true ]]; then
    log "HITL [$gate_name]: AUTO-APPROVED (--no-hitl mode)"
    echo "approved"
    return 0
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧑 HITL GATE: $gate_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [[ -n "$context_file" && -f "$context_file" ]]; then
    echo ""
    cat "$context_file"
    echo ""
  fi
  echo "$prompt"
  echo ""
  echo "입력 옵션:"
  echo "  승인          → 다음 단계로 진행"
  echo "  수정: <내용>  → 수정사항 반영 후 재생성"
  echo "  중단          → 파이프라인 중단"
  echo ""
  read -r -p "▶ " HITL_RESPONSE

  case "$HITL_RESPONSE" in
    승인|approve|yes|y|"")
      log "HITL [$gate_name]: APPROVED"
      echo "approved"
      ;;
    중단|stop|abort|q)
      log "HITL [$gate_name]: ABORTED by user"
      echo "aborted"
      ;;
    *)
      log "HITL [$gate_name]: REVISION requested: $HITL_RESPONSE"
      echo "$HITL_RESPONSE"
      ;;
  esac
}

# ═════════════════════════════════════════════════════
# PHASE 0: SEED — Generate Case Registry
# ═════════════════════════════════════════════════════
phase_seed() {
  log "═══ Phase 0: SEED — Case Registry Generation ═══"

  log "Generating initial case registry..."
  _timeout 300 claude --print --dangerously-skip-permissions \
    --output-format json \
    --max-budget-usd 1.00 \
    "Read CLAUDE.md and products/ai-architect-academy/SPEC.md first.

You are designing the case portfolio for the Future AI Leader's Academy.
Based on the SPEC, generate a YAML case registry with 6-8 deployment scenarios.

For each case, define:
  case_id, name, context (venue, participants, constraints, partner, funding, goal), priority (1-3)

MUST include these categories:
- Standard paid workshop (동아일보 기본)
- Hospital/medical (소아암 병동 등 치료 환경)
- Corporate CSR (기업 임직원 자녀 대상)
- School partnership (학교 정규/방과후)
- Local government (지자체 공모사업)
- Premium/small-group

Each case must have UNIQUE constraints that force curriculum adaptation.

Output ONLY valid YAML to stdout. No markdown fences, no explanation." \
    > "$RESULTS_DIR/seed-registry.yaml" 2>&1 || true

  # Self-critique the registry
  log "Self-critiquing registry..."
  _timeout 180 claude --print --dangerously-skip-permissions \
    --output-format json \
    --max-budget-usd 0.50 \
    "Read the case registry below and critique it:

$(cat "$RESULTS_DIR/seed-registry.yaml")

Check:
1. Are all cases truly DIFFERENT? (not just name changes)
2. Are constraints specific enough to force curriculum changes?
3. Is there market demand for each case?
4. Are any obvious scenarios missing?
5. Priority ranking — does it match Korean market reality?

Output a revised YAML registry (same format) with improvements.
Add a _critique_notes field at the top with what you changed and why.
Output ONLY YAML. No markdown fences." \
    > "$RESULTS_DIR/seed-registry-v2.yaml" 2>&1 || true

  # Prepare HITL summary
  cat > "$RESULTS_DIR/seed-summary.txt" << 'HEADER'
📋 생성된 케이스 레지스트리 (자체 비평 반영 후)
────────────────────────────────────────────
HEADER
  cat "$RESULTS_DIR/seed-registry-v2.yaml" >> "$RESULTS_DIR/seed-summary.txt"

  # HITL Gate: approve case list
  local response
  response=$(hitl_gate "SEED" \
    "위 케이스 목록을 검토해주세요. 추가/삭제/수정할 케이스가 있나요?" \
    "$RESULTS_DIR/seed-summary.txt")

  if [[ "$response" == "aborted" ]]; then
    log "Pipeline aborted at SEED gate."
    exit 0
  elif [[ "$response" == "approved" ]]; then
    cp "$RESULTS_DIR/seed-registry-v2.yaml" "$CASES_DIR/registry.yaml"
    log "Registry approved and saved to cases/registry.yaml"
  else
    # User provided modifications — regenerate with feedback
    log "Regenerating registry with user feedback: $response"
    _timeout 300 claude --print --dangerously-skip-permissions \
      --output-format json \
      --max-budget-usd 0.50 \
      "Here is the current case registry:
$(cat "$RESULTS_DIR/seed-registry-v2.yaml")

The reviewer (Jay) requested these changes:
$response

Apply the changes and output the revised YAML registry.
Output ONLY YAML. No markdown fences." \
      > "$CASES_DIR/registry.yaml" 2>&1 || true
    log "Revised registry saved."
  fi
}

# ═════════════════════════════════════════════════════
# PHASE 1: GENERATE — Per-Case Plan Generation Loop
# ═════════════════════════════════════════════════════
generate_single_case() {
  local case_yaml="$1"
  local case_id
  case_id=$(echo "$case_yaml" | grep 'case_id:' | head -1 | sed 's/.*case_id: *//' | tr -d '"' | tr -d "'")

  log "── Generating case: $case_id ──"
  mkdir -p "$CASES_DIR/$case_id"

  local iteration=0
  local score=0

  while [[ $iteration -lt $MAX_LOOPS ]]; do
    iteration=$((iteration + 1))
    log "  [$case_id] Iteration $iteration/$MAX_LOOPS"

    # ─── Step 1: Generate (or revise) ───
    local revision_prompt=""
    if [[ -f "$CASES_DIR/$case_id/critic-log.json" && $iteration -gt 1 ]]; then
      revision_prompt=$(python3 -c "
import json
with open('$CASES_DIR/$case_id/critic-log.json') as f:
    data = json.load(f)
print(data.get('revision_prompt', ''))
" 2>/dev/null || echo "")
    fi

    log "  [$case_id] Step 1: Generating plan..."
    _timeout 600 claude --print --dangerously-skip-permissions \
      --agent academy-case-planner \
      --output-format json \
      --max-budget-usd 2.00 \
      "Read CLAUDE.md first.

Generate a complete case plan for:
$case_yaml

Case directory: products/ai-architect-academy/cases/$case_id/

$(if [[ -n "$revision_prompt" ]]; then echo "REVISION from previous critique:
$revision_prompt"; fi)

Generate ALL 5 files: plan.md, timeline.md, budget.md, logistics.md, partner-brief.md" \
      > "$RESULTS_DIR/$case_id-gen-$iteration.json" 2>&1 || true

    # ─── Step 2: Test ───
    log "  [$case_id] Step 2: Running tests..."
    _timeout 180 claude --print --dangerously-skip-permissions \
      --agent academy-case-tester \
      --output-format json \
      --max-budget-usd 0.50 \
      "Read CLAUDE.md first.
Run all tests on case: $case_id
Case directory: products/ai-architect-academy/cases/$case_id/
Write results to products/ai-architect-academy/cases/$case_id/test-report.json" \
      > "$RESULTS_DIR/$case_id-test-$iteration.json" 2>&1 || true

    # Check test results
    local test_pass_rate
    test_pass_rate=$(python3 -c "
import json
try:
    with open('$CASES_DIR/$case_id/test-report.json') as f:
        data = json.load(f)
    print(data.get('summary', {}).get('pass_rate', 0))
except: print(0)
" 2>/dev/null || echo "0")
    log "  [$case_id] Test pass rate: $test_pass_rate"

    # ─── Step 3: Self-Critique ───
    log "  [$case_id] Step 3: Self-critique..."
    _timeout 300 claude --print --dangerously-skip-permissions \
      --agent academy-case-critic \
      --output-format json \
      --max-budget-usd 1.00 \
      "Read CLAUDE.md first.
Critique case: $case_id (iteration $iteration)
Case directory: products/ai-architect-academy/cases/$case_id/
Write results to products/ai-architect-academy/cases/$case_id/critic-log.json" \
      > "$RESULTS_DIR/$case_id-critic-$iteration.json" 2>&1 || true

    # Extract score
    score=$(python3 -c "
import json
try:
    with open('$CASES_DIR/$case_id/critic-log.json') as f:
        data = json.load(f)
    print(data.get('overall_score', 0))
except: print(0)
" 2>/dev/null || echo "0")
    log "  [$case_id] Critic score: $score/10 (threshold: $CRITIC_THRESHOLD)"

    # ─── Decision: continue loop or exit? ───
    if [[ $score -ge $CRITIC_THRESHOLD ]]; then
      log "  [$case_id] ✅ Score meets threshold. Moving to partner review."
      break
    fi

    if [[ $iteration -ge $MAX_LOOPS ]]; then
      log "  [$case_id] ⚠️ Max loops reached with score $score."
    fi
  done

  # ─── Step 4: Partner Review (동아일보 perspective) ───
  log "  [$case_id] Step 4: Partner review (동아일보 perspective)..."
  _timeout 300 claude --print --dangerously-skip-permissions \
    --agent academy-partner-reviewer \
    --output-format json \
    --max-budget-usd 1.50 \
    "Read CLAUDE.md first.
Review case from 동아일보's perspective: $case_id
Case directory: products/ai-architect-academy/cases/$case_id/
Write results to products/ai-architect-academy/cases/$case_id/partner-review.json" \
    > "$RESULTS_DIR/$case_id-partner-$iteration.json" 2>&1 || true

  # Extract partner verdict
  local partner_verdict
  partner_verdict=$(python3 -c "
import json
try:
    with open('$CASES_DIR/$case_id/partner-review.json') as f:
        data = json.load(f)
    print(data.get('verdict', 'unknown'))
except: print('unknown')
" 2>/dev/null || echo "unknown")
  log "  [$case_id] Partner verdict: $partner_verdict"

  # ─── HITL Escalation (if needed) ───
  if [[ $score -lt $CRITIC_THRESHOLD || "$partner_verdict" == "reject" ]]; then
    # Prepare escalation summary
    cat > "$RESULTS_DIR/$case_id-escalation.txt" << EOF
📊 Case: $case_id — 검토 필요
────────────────────────────────────────
자체 평가: $score/10 (기준: $CRITIC_THRESHOLD)
파트너 평가: $partner_verdict
반복 횟수: $iteration/$MAX_LOOPS

── 자체 비평 요약 ──
$(cat "$CASES_DIR/$case_id/critic-log.json" 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for issue in data.get('issues', [])[:5]:
        print(f\"  [{issue['severity']}] {issue['problem']}\")
except: print('  (파싱 실패)')
" 2>/dev/null || echo "  (데이터 없음)")

── 동아일보 관점 요약 ──
$(cat "$CASES_DIR/$case_id/partner-review.json" 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f\"  추천: {data.get('recommendation', 'N/A')}\")
    for q in data.get('hard_questions', [])[:3]:
        print(f\"  Q: {q['question']}\")
except: print('  (파싱 실패)')
" 2>/dev/null || echo "  (데이터 없음)")
EOF

    local response
    response=$(hitl_gate "CASE-$case_id" \
      "이 케이스가 기준에 미달합니다. 계속 수정할까요, 스킵할까요, 방향을 바꿀까요?" \
      "$RESULTS_DIR/$case_id-escalation.txt")

    if [[ "$response" == "aborted" ]]; then
      log "  [$case_id] Skipped by user."
      return 1
    elif [[ "$response" != "approved" ]]; then
      log "  [$case_id] User feedback received. Running one more revision..."
      _timeout 600 claude --print --dangerously-skip-permissions \
        --agent academy-case-planner \
        --output-format json \
        --max-budget-usd 2.00 \
        "Read CLAUDE.md first.
Revise case plan: $case_id
Case directory: products/ai-architect-academy/cases/$case_id/
User feedback: $response
Regenerate ALL 5 files incorporating this feedback." \
        > "$RESULTS_DIR/$case_id-final.json" 2>&1 || true
    fi
  fi

  log "  [$case_id] ✅ Complete. Score: $score, Partner: $partner_verdict"
}

phase_generate() {
  log "═══ Phase 1: GENERATE — Per-Case Plan Generation ═══"

  if [[ ! -f "$CASES_DIR/registry.yaml" ]]; then
    log "ERROR: No registry.yaml found. Run --phase seed first."
    exit 1
  fi

  # Parse case list from registry
  local case_list_str
  if [[ -n "$SPECIFIC_CASES" ]]; then
    case_list_str="$SPECIFIC_CASES"
  else
    case_list_str=$(python3 -c "
import yaml, sys
with open('$CASES_DIR/registry.yaml') as f:
    data = yaml.safe_load(f)
cases = data if isinstance(data, list) else data.get('cases', [])
ids = [c.get('case_id', '') for c in cases if isinstance(c, dict) and c.get('case_id')]
print(','.join(ids))
" 2>/dev/null || echo "")
  fi

  if [[ -z "$case_list_str" ]]; then
    log "ERROR: No cases found in registry."
    exit 1
  fi

  IFS=',' read -ra case_list <<< "$case_list_str"
  log "Cases to generate: ${case_list[*]}"

  for case_id in "${case_list[@]}"; do
    [[ -z "$case_id" ]] && continue

    # Extract full case YAML for this case_id
    local case_yaml
    case_yaml=$(python3 -c "
import yaml
with open('$CASES_DIR/registry.yaml') as f:
    data = yaml.safe_load(f)
cases = data if isinstance(data, list) else data.get('cases', [])
for c in cases:
    if isinstance(c, dict) and c.get('case_id') == '$case_id':
        print(yaml.dump(c, allow_unicode=True, default_flow_style=False))
        break
" 2>/dev/null || echo "case_id: $case_id")

    generate_single_case "$case_yaml" || true
  done
}

# ═════════════════════════════════════════════════════
# PHASE 2: INTEGRATE — Portfolio Packaging
# ═════════════════════════════════════════════════════
phase_integrate() {
  log "═══ Phase 2: INTEGRATE — Portfolio Packaging ═══"

  # Cross-case tests
  log "Running cross-case consistency tests..."
  _timeout 300 claude --print --dangerously-skip-permissions \
    --agent academy-case-tester \
    --output-format json \
    --max-budget-usd 0.50 \
    "Read CLAUDE.md first.
Run CROSS-CASE tests across all cases in products/ai-architect-academy/cases/.
Check: portfolio_coverage, no_cannibal, consistent_branding.
Write results to products/ai-architect-academy/cases/cross-case-report.json" \
    > "$RESULTS_DIR/cross-case.json" 2>&1 || true

  # Generate portfolio summary
  log "Generating portfolio summary..."
  _timeout 300 claude --print --dangerously-skip-permissions \
    --output-format json \
    --max-budget-usd 1.00 \
    "Read CLAUDE.md first.
Read ALL case directories under products/ai-architect-academy/cases/ (skip registry.yaml and casegen.yaml).

Generate a portfolio summary at products/ai-architect-academy/cases/PORTFOLIO.md:

Structure:
1. Executive Summary (1 paragraph)
2. Case Comparison Table (case_id | name | audience | duration | price | funding model | partner)
3. Per-case 1-paragraph summary
4. Cross-case synergies (how cases feed into each other)
5. Recommended rollout order with rationale
6. Aggregate financial projection (all cases combined Year 1)

Also generate products/ai-architect-academy/cases/PORTFOLIO-SUMMARY.md:
A 1-page executive brief for 동아일보 decision-makers. Concise, professional, action-oriented." \
    > "$RESULTS_DIR/integrate.json" 2>&1 || true

  # HITL Final Gate
  local response
  response=$(hitl_gate "FINAL" \
    "전체 포트폴리오가 완성되었습니다. products/ai-architect-academy/cases/PORTFOLIO.md를 확인해주세요." \
    "$CASES_DIR/PORTFOLIO-SUMMARY.md")

  if [[ "$response" == "aborted" ]]; then
    log "Pipeline completed (final review pending)."
  elif [[ "$response" == "approved" ]]; then
    log "✅ Portfolio approved. Ready for 동아일보 제출."
  else
    log "Final revision requested: $response"
    # One more pass with feedback
    _timeout 300 claude --print --dangerously-skip-permissions \
      --output-format json \
      --max-budget-usd 1.00 \
      "Read products/ai-architect-academy/cases/PORTFOLIO.md and PORTFOLIO-SUMMARY.md.
Apply this feedback from Jay: $response
Rewrite both files." \
      > "$RESULTS_DIR/integrate-final.json" 2>&1 || true
  fi
}

# ═════════════════════════════════════════════════════
# Main Execution
# ═════════════════════════════════════════════════════
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Academy Case Generation Pipeline"
echo " Date: $DATE | Phase: $PHASE | Max Loops: $MAX_LOOPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "" | tee -a "$LOG_FILE"

case "$PHASE" in
  seed)      phase_seed ;;
  generate)  phase_generate ;;
  integrate) phase_integrate ;;
  all)
    phase_seed
    phase_generate
    phase_integrate
    ;;
  *)
    echo "Unknown phase: $PHASE"
    echo "Usage: academy-casegen.sh --phase [seed|generate|integrate|all]"
    exit 1
    ;;
esac

echo ""
log "━━━ Pipeline Complete ━━━"
log "Log: $LOG_FILE"
log "Cases: $CASES_DIR/"
