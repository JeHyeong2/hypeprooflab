#!/usr/bin/env bash
# column-qa-gate.sh — Deterministic QA gate for column deployment
# Usage: bash scripts/column-qa-gate.sh <slug> [--fix]
# Exit 0 = ALL PASS, Exit 1 = FAIL (deploy blocked)
#
# This script MUST be run before any git commit/push of column files.
# It produces a QA report at scripts/.qa-results/<slug>.json
# deploy-column.sh should check this report exists and passed.

set -euo pipefail

SLUG="${1:?Usage: column-qa-gate.sh <YYYY-MM-DD-slug> [--fix]}"
FIX_MODE="${2:-}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COLUMNS_KO="$REPO_ROOT/web/src/content/columns/ko"
COLUMNS_EN="$REPO_ROOT/web/src/content/columns/en"
QA_DIR="$REPO_ROOT/scripts/.qa-results"
KO_FILE="$COLUMNS_KO/$SLUG.md"
EN_FILE="$COLUMNS_EN/$SLUG.md"

mkdir -p "$QA_DIR"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
RESULTS=()

log_pass() { RESULTS+=("✅ PASS: $1"); ((PASS_COUNT++)); }
log_fail() { RESULTS+=("❌ FAIL: $1"); ((FAIL_COUNT++)); }
log_warn() { RESULTS+=("⚠️ WARN: $1"); ((WARN_COUNT++)); }

echo "═══════════════════════════════════════════"
echo "  Column QA Gate — $SLUG"
echo "═══════════════════════════════════════════"
echo ""

# ─── CHECK 1: Files exist ───
echo "📄 Check 1: File existence"
if [[ -f "$KO_FILE" ]]; then
  log_pass "KO file exists: $KO_FILE"
else
  log_fail "KO file missing: $KO_FILE"
fi

if [[ -f "$EN_FILE" ]]; then
  log_pass "EN file exists: $EN_FILE"
else
  log_fail "EN file missing: $EN_FILE"
fi

# ─── CHECK 2: Frontmatter required fields ───
echo "📋 Check 2: Frontmatter validation"
if [[ -f "$KO_FILE" ]]; then
  REQUIRED_FIELDS=(title creator creatorImage date category tags slug readTime excerpt lang authorType)
  for field in "${REQUIRED_FIELDS[@]}"; do
    if head -50 "$KO_FILE" | grep -q "^${field}:"; then
      log_pass "Frontmatter: $field present"
    else
      log_fail "Frontmatter: $field MISSING in KO"
    fi
  done
fi

# ─── CHECK 3: ASCII diagram detection ───
echo "🎨 Check 3: ASCII art in code blocks"
for f in "$KO_FILE" "$EN_FILE"; do
  [[ -f "$f" ]] || continue
  fname=$(basename "$f")
  # Extract code blocks and check for arrow/box chars
  if grep -Pzo '(?s)```[^`]*?[→←↑↓│└┘┌┐┤├┬┴╭╮╯╰][^`]*?```' "$f" > /dev/null 2>&1; then
    log_fail "ASCII art in code block: $fname"
  else
    log_pass "No ASCII art in code blocks: $fname"
  fi
done

# ─── CHECK 4: Link validation ───
echo "🔗 Check 4: Link validation"
if [[ -f "$KO_FILE" ]]; then
  LINK_SCRIPT="$REPO_ROOT/research/scripts/validate_links.py"
  if [[ -f "$LINK_SCRIPT" ]]; then
    if python3 "$LINK_SCRIPT" "$KO_FILE" 2>/dev/null; then
      log_pass "All links valid (KO)"
    else
      log_fail "Broken links detected (KO) — run: python3 $LINK_SCRIPT $KO_FILE"
    fi
  else
    log_warn "validate_links.py not found — skipping link check"
  fi
fi

# ─── CHECK 5: Quality score ───
echo "📊 Check 5: Quality evaluation"
if [[ -f "$KO_FILE" ]]; then
  EVAL_SCRIPT="$REPO_ROOT/research/scripts/eval_research.py"
  if [[ -f "$EVAL_SCRIPT" ]]; then
    SCORE=$(python3 "$EVAL_SCRIPT" "$KO_FILE" --quick --score-only 2>/dev/null || echo "0")
    if [[ "$SCORE" -ge 70 ]]; then
      log_pass "Quality score: $SCORE/100"
    else
      log_warn "Quality score: $SCORE/100 (threshold: 70)"
    fi
  else
    log_warn "eval_research.py not found — skipping quality check"
  fi
fi

# ─── CHECK 6: Creator image exists ───
echo "🖼️ Check 6: Creator image"
if [[ -f "$KO_FILE" ]]; then
  IMG=$(head -20 "$KO_FILE" | grep "^creatorImage:" | sed 's/creatorImage: *"//' | sed 's/"//')
  if [[ -n "$IMG" ]]; then
    FULL_IMG="$REPO_ROOT/web/public$IMG"
    if [[ -f "$FULL_IMG" ]]; then
      log_pass "Creator image exists: $IMG"
    else
      log_fail "Creator image missing: $FULL_IMG"
    fi
  fi
fi

# ─── CHECK 7: Build test ───
echo "🏗️ Check 7: Build test"
cd "$REPO_ROOT/web"
if npm run build > /dev/null 2>&1; then
  log_pass "Build succeeded"
else
  log_fail "Build failed"
fi

# ─── CHECK 8: Source URLs not section-level (must be specific articles) ───
echo "🔍 Check 8: Source URL specificity"
if [[ -f "$KO_FILE" ]]; then
  # Detect generic section-level URLs in Sources table
  GENERIC_URLS=$(awk '/^## Sources/,0' "$KO_FILE" | grep -oP 'https?://[^\s|)]+' | grep -E '(reuters\.com/(business|world)/?$|investing\.com/news/?$|businesskorea\.co\.kr/news/?$)' || true)
  if [[ -n "$GENERIC_URLS" ]]; then
    log_fail "Generic section-level URLs in Sources (not specific articles):"
    while IFS= read -r url; do
      RESULTS+=("   → $url")
    done <<< "$GENERIC_URLS"
  else
    log_pass "All source URLs are specific articles"
  fi
fi

# ─── RESULTS ───
echo ""
echo "═══════════════════════════════════════════"
echo "  RESULTS: $PASS_COUNT pass / $FAIL_COUNT fail / $WARN_COUNT warn"
echo "═══════════════════════════════════════════"
for r in "${RESULTS[@]}"; do
  echo "  $r"
done
echo ""

# Write JSON report
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$QA_DIR/$SLUG.json" << EOF
{
  "slug": "$SLUG",
  "timestamp": "$TIMESTAMP",
  "pass": $PASS_COUNT,
  "fail": $FAIL_COUNT,
  "warn": $WARN_COUNT,
  "verdict": "$([ $FAIL_COUNT -eq 0 ] && echo 'PASS' || echo 'FAIL')",
  "checks": [
$(printf '    "%s",\n' "${RESULTS[@]}" | sed '$ s/,$//')
  ]
}
EOF

if [[ $FAIL_COUNT -gt 0 ]]; then
  echo "❌ QA GATE: FAIL — $FAIL_COUNT issues must be fixed before deployment"
  echo "   Report: $QA_DIR/$SLUG.json"
  exit 1
else
  echo "✅ QA GATE: PASS — Ready for deployment"
  echo "   Report: $QA_DIR/$SLUG.json"
  exit 0
fi
