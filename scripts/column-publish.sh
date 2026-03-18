#!/bin/bash
# column-publish.sh — Single entry point for column publishing
# Combines: content-gate + deploy-column.sh + verify
# Mother MUST use this script. Direct git push is blocked by pre-commit hook.
#
# Usage: ./scripts/column-publish.sh <slug> --creator <NAME> [--skip-en]
#
# Flow: SUBMIT → REVIEW → QA → DEPLOY → VERIFY (all enforced)

set -euo pipefail

SLUG="${1:?Usage: column-publish.sh <slug> --creator <NAME> [--skip-en]}"
shift

CREATOR=""
SKIP_EN=""
for arg in "$@"; do
  case "$arg" in
    --creator) shift; CREATOR="${1:-}" ;;
    --skip-en) SKIP_EN="yes" ;;
    *) CREATOR="${CREATOR:-$arg}" ;;
  esac
  shift 2>/dev/null || true
done

if [ -z "$CREATOR" ]; then
  echo "❌ --creator is required"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GATE="python3 $HOME/.openclaw/workspace/skills/content-gate/scripts/gate.py"
DEPLOY="$ROOT/scripts/deploy-column.sh"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Column Publishing Pipeline${NC}"
echo -e "${BLUE}  Slug: ${SLUG}${NC}"
echo -e "${BLUE}  Creator: ${CREATOR}${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Step 1: Register in gate
echo -e "${YELLOW}▶ STEP 1: Gate Submit${NC}"
$GATE submit "$SLUG" --creator "$CREATOR" 2>&1 || true
echo ""

# Step 2: Review
echo -e "${YELLOW}▶ STEP 2: Gate Review${NC}"
$GATE review "$SLUG" 2>&1
echo ""

# Step 3: QA Gate (the critical step)
echo -e "${YELLOW}▶ STEP 3: QA Gate${NC}"
if ! $GATE qa "$SLUG" 2>&1; then
  echo -e "${RED}❌ QA FAILED — fix issues and re-run${NC}"
  echo -e "${RED}   Do NOT proceed to deployment!${NC}"
  $GATE status "$SLUG"
  exit 1
fi
echo ""

# Step 4: Deploy
echo -e "${YELLOW}▶ STEP 4: Deploy via deploy-column.sh${NC}"
DEPLOY_ARGS="$SLUG --auto"
if [ -n "$SKIP_EN" ]; then
  DEPLOY_ARGS="$DEPLOY_ARGS --skip-en"
fi
if ! bash "$DEPLOY" $DEPLOY_ARGS 2>&1; then
  echo -e "${RED}❌ Deploy failed${NC}"
  exit 1
fi
echo ""

# Step 5: Update gate to DEPLOYED
echo -e "${YELLOW}▶ STEP 5: Gate Deploy${NC}"
$GATE deploy "$SLUG" 2>&1
echo ""

# Step 6: Verify
echo -e "${YELLOW}▶ STEP 6: Verify${NC}"
sleep 10  # Wait for Vercel propagation
if $GATE verify "$SLUG" 2>&1; then
  echo -e "${GREEN}═══════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✅ PUBLISHED & VERIFIED${NC}"
  echo -e "${GREEN}  https://hypeproof-ai.xyz/columns/${SLUG}${NC}"
  echo -e "${GREEN}═══════════════════════════════════════${NC}"
else
  echo -e "${YELLOW}⚠️  Deploy ok but verify pending — check URL manually${NC}"
fi
