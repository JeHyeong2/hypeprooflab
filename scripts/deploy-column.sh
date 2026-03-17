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
MIN_BODY_LINKS=3
if [ "$BODY_LINKS" -ge "$MIN_BODY_LINKS" ]; then
  echo -e "  [inline links] ${GREEN}PASS${NC} ($BODY_LINKS body links)"
  ((PASS++))
elif [ "$BODY_LINKS" -ge 1 ]; then
  echo -e "  [inline links] ${YELLOW}WARN${NC} ($BODY_LINKS body links < $MIN_BODY_LINKS minimum)"
  echo "  → 자동 주입 시도: python3 scripts/inject-inline-links.py"
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  python3 "$SCRIPT_DIR/inject-inline-links.py" "$KO_FILE" 2>/dev/null
  # Re-count
  LINK_COUNT2=$(grep -c '\[.*\](http' "$KO_FILE" 2>/dev/null || echo 0)
  TABLE_LINKS2=$(grep '^\s*|' "$KO_FILE" | grep -c '\[.*\](http' 2>/dev/null || echo 0)
  BODY_LINKS2=$((LINK_COUNT2 - TABLE_LINKS2))
  if [ "$BODY_LINKS2" -ge "$MIN_BODY_LINKS" ]; then
    echo -e "  [inline links] ${GREEN}PASS${NC} (auto-injected: $BODY_LINKS → $BODY_LINKS2 body links)"
    ((PASS++))
  else
    echo -e "  [inline links] ${RED}FAIL${NC} ($BODY_LINKS2 body links after injection — need $MIN_BODY_LINKS+)"
    ((FAIL++))
  fi
else
  echo -e "  [inline links] ${YELLOW}WARN${NC} (0 body links — auto-injecting from Sources table)"
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  python3 "$SCRIPT_DIR/inject-inline-links.py" "$KO_FILE" 2>/dev/null
  # Re-count
  LINK_COUNT2=$(grep -c '\[.*\](http' "$KO_FILE" 2>/dev/null || echo 0)
  TABLE_LINKS2=$(grep '^\s*|' "$KO_FILE" | grep -c '\[.*\](http' 2>/dev/null || echo 0)
  BODY_LINKS2=$((LINK_COUNT2 - TABLE_LINKS2))
  if [ "$BODY_LINKS2" -ge "$MIN_BODY_LINKS" ]; then
    echo -e "  [inline links] ${GREEN}PASS${NC} (auto-injected: 0 → $BODY_LINKS2 body links)"
    ((PASS++))
  else
    echo -e "  [inline links] ${RED}FAIL${NC} ($BODY_LINKS2 body links after injection — need $MIN_BODY_LINKS+)"
    ((FAIL++))
  fi
fi

# ── Step 7: Sources URL check ──
echo ""
echo "🔗 Step 7: Sources have full URLs?"
# Check if Sources table has actual URLs (not just domain names)
if grep -A 50 '## Sources\|### Sources\|🔗 Sources\|## 출처\|### 출처\|🔗 출처\|참고 출처' "$KO_FILE" | grep -q 'https\?://[a-zA-Z0-9]'; then
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
  echo -e "  ${GREEN}📦 Git pushed. Running Vercel prod deploy...${NC}"

  # Vercel prod deploy (git push alone is unreliable)
  cd "$ROOT/web"
  VERCEL_OUT=$(npx vercel --prod --yes 2>&1)
  VERCEL_EXIT=$?
  cd "$ROOT"

  if [ "$VERCEL_EXIT" -eq 0 ]; then
    echo -e "  ${GREEN}🚀 Vercel deploy complete!${NC}"
  else
    echo -e "  ${RED}⚠️ Vercel deploy failed (exit $VERCEL_EXIT)${NC}"
    echo "$VERCEL_OUT" | tail -5
    exit 1
  fi

  echo "  → https://hypeproof-ai.xyz/columns/$SLUG"

  # Verify: check response body, not just HTTP status (SPA returns 200 for 404s)
  echo "  Verifying (10s)..."
  sleep 10
  VERIFY_BODY=$(curl -s "https://hypeproof-ai.xyz/columns/$SLUG")
  HTTP_CODE=$(echo "$VERIFY_BODY" | head -1 | grep -c "<!DOCTYPE")

  # Check 1: No client-side 404
  if echo "$VERIFY_BODY" | grep -q 'NEXT_HTTP_ERROR_FALLBACK;404'; then
    echo -e "  ${RED}⛔ VERIFY FAILED — Next.js 404 detected${NC}"
    echo "  Page returns 200 but renders 404 client-side."
    echo "  Check: content collection, slug format, Vercel build."
    exit 1
  fi

  # Check 2: Title contains column title (not generic site title)
  PAGE_TITLE=$(echo "$VERIFY_BODY" | grep -o '<title>[^<]*</title>' | head -1)
  if echo "$PAGE_TITLE" | grep -qi "We Don't Chase Hype"; then
    echo -e "  ${RED}⛔ VERIFY FAILED — Generic title detected (column not rendered)${NC}"
    echo "  Got: $PAGE_TITLE"
    exit 1
  fi

  echo -e "  ${GREEN}✅ Live! ${PAGE_TITLE}${NC}"
else
  echo "  배포 취소됨."
fi

echo ""
