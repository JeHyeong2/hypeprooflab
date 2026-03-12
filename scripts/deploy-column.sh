#!/bin/bash
# deploy-column.sh — Column QA Gate + Deploy
# Mother는 이 스크립트 없이 칼럼을 배포할 수 없음
# Usage: ./scripts/deploy-column.sh <slug> [--skip-en]

set -uo pipefail

SLUG="${1:?Usage: deploy-column.sh <slug> [--skip-en] [--auto]}"
SKIP_EN=""
AUTO=""
for arg in "${@:2}"; do
  case "$arg" in
    --skip-en) SKIP_EN="yes" ;;
    --auto) AUTO="yes" ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KO_DIR="$ROOT/web/src/content/columns/ko"
EN_DIR="$ROOT/web/src/content/columns/en"
SCRIPTS="$ROOT/research/scripts"

KO_FILE="$KO_DIR/$SLUG.md"
EN_FILE="$EN_DIR/$SLUG.md"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

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
echo "╔══════════════════════════════════════════════╗"
echo "║        COLUMN QA GATE — $SLUG"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Step 1: File existence ──
echo "📁 Step 1: File Check"
check "ko exists" test -f "$KO_FILE"
if [ "$SKIP_EN" != "yes" ]; then
  check "en exists" test -f "$EN_FILE"
else
  echo -e "  [en exists] ${YELLOW}SKIPPED (--skip-en)${NC}"
fi

# ── Step 2: Frontmatter validation ──
echo ""
echo "📋 Step 2: Frontmatter"
REQUIRED_FIELDS=("title" "creator" "creatorImage" "date" "category" "tags" "slug" "readTime" "excerpt" "lang" "authorType")
for field in "${REQUIRED_FIELDS[@]}"; do
  check "fm:$field" grep -q "^${field}:" "$KO_FILE"
done

# ── Step 3: Link validation ──
echo ""
echo "🔗 Step 3: Link Validation"
check "validate_links" python3 "$SCRIPTS/validate_links.py" "$KO_FILE"

# ── Step 4: Quality score ──
echo ""
echo "📊 Step 4: Quality Score (≥70)"
check "eval_research" python3 "$SCRIPTS/eval_research.py" "$KO_FILE" --quick

# ── Step 5: Build test ──
echo ""
echo "🔨 Step 5: Build Test"
check "npm build" bash -c "cd '$ROOT/web' && npm run build"

# ── Step 6: Inline links check ──
echo ""
echo "🔵 Step 6: Inline Links (body has clickable links?)"
LINK_COUNT=$(grep -c '\[.*\](http' "$KO_FILE" 2>/dev/null || echo 0)
# Subtract sources table links (lines starting with |)
TABLE_LINKS=$(grep '^\s*|' "$KO_FILE" | grep -c '\[.*\](http' 2>/dev/null || echo 0)
BODY_LINKS=$((LINK_COUNT - TABLE_LINKS))
if [ "$BODY_LINKS" -ge 1 ]; then
  echo -e "  [inline links] ${GREEN}PASS${NC} ($BODY_LINKS body links)"
  ((PASS++))
else
  echo -e "  [inline links] ${YELLOW}WARN${NC} (0 body links — sources only in table)"
  echo "  → 본문에 인라인 링크 추가 권장 (3-10 스타일)"
fi

# ── Step 7: Sources URL check ──
echo ""
echo "🔗 Step 7: Sources have full URLs?"
# Check if Sources table has actual URLs (not just domain names)
if grep -A 50 '## Sources\|### Sources\|🔗 Sources' "$KO_FILE" | grep -q 'https\?://[a-zA-Z0-9]'; then
  echo -e "  [source URLs] ${GREEN}PASS${NC}"
  ((PASS++))
else
  echo -e "  [source URLs] ${RED}FAIL${NC} (Sources에 full URL 없음 — 도메인명만 있음)"
  ((FAIL++))
fi

# ── Result ──
echo ""
echo "══════════════════════════════════════════════"
TOTAL=$((PASS + FAIL))
echo -e "  Results: ${GREEN}$PASS PASS${NC} / ${RED}$FAIL FAIL${NC} / $TOTAL total"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo -e "  ${RED}⛔ QA FAILED — 배포 차단${NC}"
  echo ""
  echo "  🔧 Mother 수정 가능:"
  echo "     - fm:lang, fm:authorType 등 frontmatter → 직접 추가"
  echo "     - inline links 부족 → 본문에 링크 삽입"
  echo "     - npm build 실패 → 코드 수정"
  echo ""
  echo "  👤 크리에이터 확인 필요:"
  echo "     - source URLs 없음 → 원본 링크 요청"
  echo "     - validate_links 깨짐 → 대체 링크 요청"
  echo ""
  echo "  Mother 수정 가능한 건 바로 고치고 재실행."
  echo "  크리에이터 필요한 건 DM으로 구체적 요청."
  echo ""
  exit 1
fi

echo ""
echo -e "  ${GREEN}✅ QA ALL PASS — 배포 진행${NC}"
echo ""

# ── Deploy ──
if [ "$AUTO" = "yes" ]; then
  REPLY="y"
else
  read -p "  Git push + deploy? (y/N) " -n 1 -r
  echo ""
fi
if [[ $REPLY =~ ^[Yy]$ ]]; then
  cd "$ROOT"
  git add -A
  git commit -m "column: $SLUG — QA passed (${PASS}/${TOTAL})"
  git push
  echo ""
  echo -e "  ${GREEN}🚀 Deployed!${NC}"
  echo "  → https://hypeproof-ai.xyz/columns/$SLUG"
  
  # Wait and verify
  echo "  Verifying (15s)..."
  sleep 15
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://hypeproof-ai.xyz/columns/$SLUG")
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "  ${GREEN}✅ HTTP $HTTP_CODE — Live!${NC}"
  else
    echo -e "  ${RED}⚠️ HTTP $HTTP_CODE — 확인 필요${NC}"
  fi
else
  echo "  배포 취소됨."
fi

echo ""
