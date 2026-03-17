#!/bin/bash
# column-metrics.sh — Column Pipeline Dashboard
# Reads column-results.tsv and shows key metrics
# Usage: ./scripts/column-metrics.sh [--json]

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TSV="$ROOT/metrics/column-results.tsv"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

JSON_MODE=""
[ "${1:-}" = "--json" ] && JSON_MODE="yes"

if [ ! -f "$TSV" ] || [ "$(wc -l < "$TSV")" -le 1 ]; then
  if [ "$JSON_MODE" = "yes" ]; then
    echo '{"total":0,"message":"No data yet"}'
  else
    echo "📊 No column metrics data yet."
    echo "   Deploy a column with deploy-column.sh to start tracking."
  fi
  exit 0
fi

# Skip header, read data lines
DATA=$(tail -n +2 "$TSV" | grep -v '^$')
TOTAL=$(echo "$DATA" | wc -l | tr -d ' ')

if [ "$TOTAL" -eq 0 ]; then
  if [ "$JSON_MODE" = "yes" ]; then
    echo '{"total":0,"message":"No data yet"}'
  else
    echo "📊 No column metrics data yet."
  fi
  exit 0
fi

# Average total_score
AVG_SCORE=$(echo "$DATA" | awk -F'\t' '{sum+=$11; n++} END {if(n>0) printf "%.1f", sum/n; else print "0"}')

# Last 5 vs previous 5 trend
if [ "$TOTAL" -ge 10 ]; then
  LAST5=$(echo "$DATA" | tail -5 | awk -F'\t' '{sum+=$11} END {printf "%.1f", sum/5}')
  PREV5=$(echo "$DATA" | tail -10 | head -5 | awk -F'\t' '{sum+=$11} END {printf "%.1f", sum/5}')
  TREND_DIFF=$(echo "$LAST5 $PREV5" | awk '{printf "%.1f", $1-$2}')
elif [ "$TOTAL" -ge 5 ]; then
  LAST5=$(echo "$DATA" | tail -5 | awk -F'\t' '{sum+=$11} END {printf "%.1f", sum/5}')
  PREV5="N/A"
  TREND_DIFF="N/A"
else
  LAST5="N/A"
  PREV5="N/A"
  TREND_DIFF="N/A"
fi

# Worst performing metric (columns 4-10: qa_score, link_count, body_links, source_urls, build_pass, deploy_pass, verify_pass)
# Count failures (0 or FAIL) per metric
METRIC_NAMES=("qa_score" "link_count" "body_links" "source_urls" "build_pass" "deploy_pass" "verify_pass")
WORST_METRIC=""
WORST_FAILS=0

for i in 4 5 6 7 8 9 10; do
  FAILS=$(echo "$DATA" | awk -F'\t' -v col="$i" '{if($col == "0" || $col == "FAIL" || $col == "fail") count++} END {print count+0}')
  IDX=$((i - 4))
  if [ "$FAILS" -gt "$WORST_FAILS" ]; then
    WORST_FAILS=$FAILS
    WORST_METRIC="${METRIC_NAMES[$IDX]}"
  fi
done

# Pass rate
PASS_COUNT=$(echo "$DATA" | awk -F'\t' '{if($11 == 100) count++} END {print count+0}')
PASS_RATE=$(echo "$PASS_COUNT $TOTAL" | awk '{printf "%.0f", ($1/$2)*100}')

# Recent 5 columns
RECENT=$(echo "$DATA" | tail -5)

if [ "$JSON_MODE" = "yes" ]; then
  cat <<EOF
{
  "total": $TOTAL,
  "avg_score": $AVG_SCORE,
  "pass_rate": $PASS_RATE,
  "last5_avg": "$LAST5",
  "prev5_avg": "$PREV5",
  "trend_diff": "$TREND_DIFF",
  "worst_metric": "$WORST_METRIC",
  "worst_metric_fails": $WORST_FAILS,
  "perfect_deploys": $PASS_COUNT
}
EOF
  exit 0
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║        📊 COLUMN PIPELINE METRICS            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo -e "  Total columns tracked:  ${CYAN}$TOTAL${NC}"
echo -e "  Average total score:    ${CYAN}$AVG_SCORE${NC}"
echo -e "  Perfect deploys (100):  ${GREEN}$PASS_COUNT${NC} / $TOTAL (${PASS_RATE}%)"
echo ""

# Trend
if [ "$TREND_DIFF" != "N/A" ]; then
  if (( $(echo "$TREND_DIFF > 0" | bc -l 2>/dev/null || echo 0) )); then
    echo -e "  Trend (last 5 vs prev 5): ${GREEN}↑ +${TREND_DIFF}${NC} ($PREV5 → $LAST5)"
  elif (( $(echo "$TREND_DIFF < 0" | bc -l 2>/dev/null || echo 0) )); then
    echo -e "  Trend (last 5 vs prev 5): ${RED}↓ ${TREND_DIFF}${NC} ($PREV5 → $LAST5)"
  else
    echo -e "  Trend (last 5 vs prev 5): ${YELLOW}→ stable${NC} ($LAST5)"
  fi
elif [ "$LAST5" != "N/A" ]; then
  echo -e "  Last 5 avg: ${CYAN}$LAST5${NC} (need 10+ for trend)"
else
  echo -e "  Trend: ${YELLOW}need 5+ columns for trend${NC}"
fi
echo ""

# Worst metric
if [ -n "$WORST_METRIC" ] && [ "$WORST_FAILS" -gt 0 ]; then
  echo -e "  ⚠️  Worst metric: ${RED}$WORST_METRIC${NC} ($WORST_FAILS failures)"
else
  echo -e "  ✅ No recurring failures detected"
fi
echo ""

# Recent 5
echo "  ── Recent Deploys ──"
echo "$RECENT" | while IFS=$'\t' read -r date slug creator qa lc bl su bp dp vp score; do
  if [ "$score" = "100" ]; then
    ICON="✅"
  else
    ICON="⚠️"
  fi
  printf "  %s %s  %-35s %s  score:%s\n" "$ICON" "$date" "$slug" "$creator" "$score"
done

echo ""
