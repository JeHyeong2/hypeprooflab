#!/usr/bin/env bash
# verify_content.sh — Content integrity guardrail for HypeProof website
# Run before every deploy: npm run verify
# Exit code 1 = problems found, deployment should be blocked.

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m'

SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)/src"
PUBLIC_DIR="$(cd "$(dirname "$0")/.." && pwd)/public"
WARNINGS=0
ERRORS=0

warn()  { echo -e "${YELLOW}⚠  WARNING:${NC} $1"; ((WARNINGS++)); }
error() { echo -e "${RED}✖  ERROR:${NC} $1";   ((ERRORS++)); }
ok()    { echo -e "${GREEN}✔${NC} $1"; }

echo "═══════════════════════════════════════════"
echo " HypeProof Content Verification"
echo "═══════════════════════════════════════════"
echo ""

# ─── 1. Scan for suspicious numeric claims ───────────────────────
echo "▸ Scanning for unverified numeric claims..."

# Patterns: "N,NNN+", "N+", "N%", "N/5", "N/10"
# Extract user-facing strings (value: "...", label: "...", title: "...", description: "...")
# and check those for suspicious stats
HITS=$(grep -rnE '(value|label|title|description|href|children)\s*[:=]' "$SRC_DIR" --include='*.tsx' --include='*.ts' \
  | grep -Ei '[0-9],?[0-9]{2,}\+|[0-9]+\+.*(AI|전문가|expert|member|country|국가)|[0-9]{2,}%|[0-9]\.[0-9]/[0-9]' \
  | grep -v 'node_modules' \
  | grep -v '// verified:' \
  || true)

if [ -n "$HITS" ]; then
  echo "$HITS" | while IFS= read -r line; do
    error "Unverified numeric claim: $line"
  done
else
  ok "No suspicious numeric claims found"
fi

# ─── 2. Detect exaggeration keywords ─────────────────────────────
echo ""
echo "▸ Scanning for exaggeration keywords..."

# Korean + English exaggeration words in user-facing strings
EXAG_PATTERNS='글로벌 커뮤니티|global community|world-class|industry.leading|thousands of|수천|세계 최고|업계 최고'

EXAG_HITS=$(grep -rniE "$EXAG_PATTERNS" "$SRC_DIR" --include='*.tsx' --include='*.ts' \
  | grep -v 'node_modules' \
  | grep -v '\.test\.' \
  | grep -v 'verify_content' \
  | grep -v '// exag-ok:' \
  || true)

if [ -n "$EXAG_HITS" ]; then
  echo "$EXAG_HITS" | while IFS= read -r line; do
    warn "Possible exaggeration: $line"
  done
else
  ok "No exaggeration keywords detected"
fi

# ─── 3. Team member count consistency ────────────────────────────
echo ""
echo "▸ Checking team member count consistency..."

KNOWN_MEMBERS=6  # Jay, JY, Kiwon, Ryan, Sebastian, TJ

if [ -d "$PUBLIC_DIR/members" ]; then
  FILE_COUNT=$(find "$PUBLIC_DIR/members" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.svg' -o -name '*.webp' \) | wc -l | tr -d ' ')
  if [ "$FILE_COUNT" -ne "$KNOWN_MEMBERS" ]; then
    warn "public/members/ has $FILE_COUNT files but expected $KNOWN_MEMBERS members. Update KNOWN_MEMBERS in this script if the team changed."
  else
    ok "Team member files match expected count ($KNOWN_MEMBERS)"
  fi
else
  warn "public/members/ directory not found"
fi

# Check if any source file claims a different team size
TEAM_SIZE_CLAIMS=$(grep -rnoEi '[0-9]+\s*(명|members|팀원|researchers|리서처)' "$SRC_DIR" --include='*.tsx' --include='*.ts' \
  | grep -v 'verify_content' \
  || true)

if [ -n "$TEAM_SIZE_CLAIMS" ]; then
  echo "  Found team size references (verify these are accurate):"
  echo "$TEAM_SIZE_CLAIMS" | while IFS= read -r line; do
    echo "    $line"
  done
fi

# ─── 4. SocialProofBar resurrection check ────────────────────────
echo ""
echo "▸ Checking for SocialProofBar usage..."

# Only flag if SocialProofBar is imported in page/layout files (actual usage)
SPB_ACTIVE=$(grep -rn 'import.*SocialProofBar\|MemoizedSocialProofBar' "$SRC_DIR/app" --include='*.tsx' --include='*.ts' 2>/dev/null \
  | grep -v '// deprecated' \
  | grep -vi 'removed\|disabled' \
  || true)

if [ -n "$SPB_ACTIVE" ]; then
  error "SocialProofBar is being used again! This component contained fabricated stats."
  echo "$SPB_ACTIVE"
else
  ok "SocialProofBar not actively used"
fi

# ─── 5. Check for "verified" / safe-listed numbers ───────────────
echo ""
echo "▸ Summary"
echo "───────────────────────────────────────────"
echo "  Errors:   $ERRORS"
echo "  Warnings: $WARNINGS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}✖ Content verification FAILED — fix errors before deploying.${NC}"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠ Warnings found — review before deploying.${NC}"
  echo "  To suppress a false positive, add '// verified: <reason>' on that line."
  echo "  For exaggeration: '// exag-ok: <reason>'"
  exit 0
else
  echo -e "${GREEN}✔ All checks passed.${NC}"
  exit 0
fi
