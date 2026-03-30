#!/bin/bash
# deploy-column.sh — Single entry point: Gate + QA + Deploy + Verify
# Mother는 이 스크립트 없이 칼럼을 배포할 수 없음 (pre-commit hook 강제)
# Usage: ./scripts/deploy-column.sh <slug> --creator <NAME> [--skip-en] [--auto]

set -uo pipefail

SLUG="${1:?Usage: deploy-column.sh <slug> --creator <NAME> [--skip-en] [--auto]}"
shift

CREATOR=""
SKIP_EN=""
AUTO=""
for arg in "$@"; do
  case "$arg" in
    --creator) ;;
    --skip-en) SKIP_EN="yes" ;;
    --auto) AUTO="yes" ;;
    *) [ -z "$CREATOR" ] && CREATOR="$arg" ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KO_DIR="$ROOT/web/src/content/columns/ko"
EN_DIR="$ROOT/web/src/content/columns/en"
SCRIPTS="$ROOT/research/scripts"
GATE="python3 $HOME/.openclaw/workspace/skills/content-gate/scripts/gate.py"

KO_FILE="$KO_DIR/$SLUG.md"
EN_FILE="$EN_DIR/$SLUG.md"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

# ═══════════════════════════════════════════════
# PRE-CHECK: QA Gate result must exist and PASS
# ═══════════════════════════════════════════════
QA_RESULT="$ROOT/scripts/.qa-results/$SLUG.json"
if [[ -f "$QA_RESULT" ]]; then
  QA_VERDICT=$(python3 -c "import json; print(json.load(open('$QA_RESULT'))['verdict'])" 2>/dev/null || echo "UNKNOWN")
  if [[ "$QA_VERDICT" != "PASS" ]]; then
    echo -e "${RED}❌ QA Gate verdict: $QA_VERDICT — run column-qa-gate.sh first${NC}"
    echo -e "${RED}   bash scripts/column-qa-gate.sh $SLUG${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ QA Gate: PASS (from $QA_RESULT)${NC}"
else
  echo -e "${RED}❌ No QA Gate result found at $QA_RESULT${NC}"
  echo -e "${RED}   Run: bash scripts/column-qa-gate.sh $SLUG${NC}"
  exit 1
fi

check() {
  local label="$1"
  shift
  echo -n "  [$label] "
  if "$@" > /tmp/qa-output.txt 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
  else
    echo -e "${RED}FAIL${NC}"
    cat /tmp/qa-output.txt | head -5
    ((FAIL++))
  fi
}

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Column Pipeline: $SLUG${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════
# PHASE 0: Content Gate Registration
# ═══════════════════════════════════════════════
echo -e "${BLUE}▶ PHASE 0: Content Gate${NC}"

if [ -n "$CREATOR" ]; then
  $GATE submit "$SLUG" --creator "$CREATOR" 2>&1 || true
  $GATE review "$SLUG" 2>&1 || true
else
  echo -e "  ${YELLOW}⚠️  --creator 미지정 — gate 등록 스킵 (이미 등록된 경우만 OK)${NC}"
fi
echo ""

# ═══════════════════════════════════════════════
# PHASE 1: QA Gate
# ═══════════════════════════════════════════════
echo -e "${BLUE}▶ PHASE 1: QA Checks${NC}"

# File existence
echo "📁 Files"
check "ko exists" test -f "$KO_FILE"
if [ "$SKIP_EN" != "yes" ]; then
  check "en exists" test -f "$EN_FILE"
else
  echo -e "  [en exists] ${YELLOW}SKIPPED${NC}"
fi

# Frontmatter
echo "📋 Frontmatter"
REQUIRED_FIELDS=("title" "creator" "creatorImage" "date" "category" "tags" "slug" "readTime" "excerpt" "lang" "authorType")
for field in "${REQUIRED_FIELDS[@]}"; do
  check "fm:$field" grep -q "^${field}:" "$KO_FILE"
done

# Links
echo "🔗 Links"
check "validate_links" python3 "$SCRIPTS/validate_links.py" "$KO_FILE"

# Quality
echo "📊 Quality (≥70)"
check "eval_research" python3 "$SCRIPTS/eval_research.py" "$KO_FILE" --quick

# Build
echo "🔨 Build"
check "npm build" bash -c "cd '$ROOT/web' && npm run build"

# Inline links (dynamic minimum based on word count)
echo "🔵 Inline Links"
WORD_COUNT=$(cat "$KO_FILE" | wc -w | tr -d ' ')
LINK_COUNT=$(grep -c '\[.*\](http' "$KO_FILE" 2>/dev/null || echo 0)
TABLE_LINKS=$(grep '^\s*|' "$KO_FILE" | grep -c '\[.*\](http' 2>/dev/null || echo 0)
BODY_LINKS=$((LINK_COUNT - TABLE_LINKS))
# Dynamic: ~150w/link target
if [ "$WORD_COUNT" -ge 1000 ]; then
  MIN_BODY_LINKS=7
elif [ "$WORD_COUNT" -ge 500 ]; then
  MIN_BODY_LINKS=5
else
  MIN_BODY_LINKS=3
fi
echo -e "  [word count] ${BLUE}${WORD_COUNT}w → min ${MIN_BODY_LINKS} links${NC}"
if [ "$BODY_LINKS" -ge "$MIN_BODY_LINKS" ]; then
  echo -e "  [inline links] ${GREEN}PASS${NC} ($BODY_LINKS)"
  ((PASS++))
else
  # Try auto-injection
  python3 "$ROOT/scripts/inject-inline-links.py" "$KO_FILE" 2>/dev/null || true
  LINK_COUNT2=$(grep -c '\[.*\](http' "$KO_FILE" 2>/dev/null || echo 0)
  TABLE_LINKS2=$(grep '^\s*|' "$KO_FILE" | grep -c '\[.*\](http' 2>/dev/null || echo 0)
  BODY_LINKS2=$((LINK_COUNT2 - TABLE_LINKS2))
  if [ "$BODY_LINKS2" -ge "$MIN_BODY_LINKS" ]; then
    echo -e "  [inline links] ${GREEN}PASS${NC} (injected: $BODY_LINKS→$BODY_LINKS2)"
    ((PASS++))
  else
    echo -e "  [inline links] ${RED}FAIL${NC} ($BODY_LINKS2 < $MIN_BODY_LINKS)"
    ((FAIL++))
  fi
fi

# Footnote-style link warning (e.g. [[1]], [[2]])
echo "📎 Link Style"
FOOTNOTE_LINKS=$(grep -v '^\s*|' "$KO_FILE" | grep -cE '\[\[?\d+\]?\]\(http' 2>/dev/null || echo 0)
if [ "$FOOTNOTE_LINKS" -eq 0 ]; then
  echo -e "  [link style] ${GREEN}PASS${NC} (no footnote-style links)"
  ((PASS++))
else
  echo -e "  [link style] ${RED}FAIL${NC} — 각주번호 링크 ${FOOTNOTE_LINKS}개 발견 ([[N]] 스타일 → 키워드 링크로 변경 필요)"
  ((FAIL++))
fi

# Sources URLs
echo "🔗 Sources"
if grep -A 50 '## Sources\|### Sources\|🔗 Sources\|## 출처\|### 출처\|🔗 출처\|참고 출처' "$KO_FILE" | grep -q 'https\?://[a-zA-Z0-9]'; then
  echo -e "  [source URLs] ${GREEN}PASS${NC}"
  ((PASS++))
else
  echo -e "  [source URLs] ${RED}FAIL${NC}"
  ((FAIL++))
fi

echo ""
TOTAL=$((PASS + FAIL))
echo "══════════════════════════════════════════════"
echo -e "  QA: ${GREEN}$PASS PASS${NC} / ${RED}$FAIL FAIL${NC} / $TOTAL total"

if [ "$FAIL" -gt 0 ]; then
  echo -e "  ${RED}⛔ QA FAILED — 배포 차단${NC}"
  # Update gate
  $GATE qa "$SLUG" 2>&1 || true
  exit 1
fi

echo -e "  ${GREEN}✅ QA ALL PASS${NC}"

# Update gate to QA_PASS
$GATE qa "$SLUG" 2>&1 || true
echo ""

# ═══════════════════════════════════════════════
# PHASE 2: Deploy
# ═══════════════════════════════════════════════
echo -e "${BLUE}▶ PHASE 2: Deploy${NC}"

if [ "$AUTO" != "yes" ]; then
  read -p "  Git push + deploy? (y/N) " -n 1 -r
  echo ""
  [[ ! $REPLY =~ ^[Yy]$ ]] && { echo "  취소됨."; exit 0; }
fi

cd "$ROOT"
git add -A
git commit -m "column: $SLUG — QA passed (${PASS}/${TOTAL})" || echo "  (nothing to commit)"
git push

echo -e "  ${GREEN}📦 Git pushed. Vercel deploy...${NC}"
cd "$ROOT/web"
VERCEL_OUT=$(npx vercel --prod --yes 2>&1)
VERCEL_EXIT=$?
cd "$ROOT"

if [ "$VERCEL_EXIT" -ne 0 ]; then
  echo -e "  ${RED}⚠️ Vercel failed${NC}"
  echo "$VERCEL_OUT" | tail -5
  exit 1
fi

# Gate → DEPLOYED
$GATE deploy "$SLUG" 2>&1 || true
echo ""

# ═══════════════════════════════════════════════
# PHASE 3: Verify
# ═══════════════════════════════════════════════
echo -e "${BLUE}▶ PHASE 3: Verify${NC}"
sleep 10

VERIFY_BODY=$(curl -s "https://hypeproof-ai.xyz/columns/$SLUG")

# SPA 404 check
if echo "$VERIFY_BODY" | grep -q 'NEXT_HTTP_ERROR_FALLBACK;404'; then
  echo -e "  ${RED}⛔ 404 detected${NC}"
  exit 1
fi

# Generic title check
PAGE_TITLE=$(echo "$VERIFY_BODY" | grep -o '<title>[^<]*</title>' | head -1)
if echo "$PAGE_TITLE" | grep -qi "We Don't Chase Hype"; then
  echo -e "  ${RED}⛔ Generic title — column not rendered${NC}"
  exit 1
fi

# Gate → VERIFIED
$GATE verify "$SLUG" 2>&1 || true

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ PUBLISHED & VERIFIED${NC}"
echo -e "${GREEN}  https://hypeproof-ai.xyz/columns/$SLUG${NC}"
echo -e "${GREEN}  $PAGE_TITLE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# ── Metrics ──
METRICS_FILE="$ROOT/metrics/column-results.tsv"
if [ -d "$ROOT/metrics" ]; then
  M_CREATOR=$(grep '^creator:' "$KO_FILE" 2>/dev/null | sed 's/^creator:[[:space:]]*//' | tr -d '"' | tr -d "'")
  [ -z "$M_CREATOR" ] && M_CREATOR="unknown"
  TODAY=$(date +%Y-%m-%d)
  if [ ! -f "$METRICS_FILE" ]; then
    printf "date\tslug\tcreator\tpass\tfail\ttotal\n" > "$METRICS_FILE"
  fi
  printf "%s\t%s\t%s\t%s\t%s\t%s\n" "$TODAY" "$SLUG" "$M_CREATOR" "$PASS" "$FAIL" "$TOTAL" >> "$METRICS_FILE"
  echo -e "  📊 Metrics logged"
fi
