#!/usr/bin/env bash
# track-contribution.sh — Append a contribution entry to products/contributions.json
# Usage:
#   track-contribution.sh --creator "Ryan" --type "column" --slug "my-slug" \
#     --contribution "wrote" [--channel "#daily-research"] [--summary "..."] \
#     [--date "2026-03-25"] [--points 5] [--dry-run]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LEDGER="$REPO_ROOT/products/contributions.json"

# Defaults
CREATOR=""
TYPE=""
CONTRIBUTION=""
SLUG=""
CHANNEL=""
SUMMARY=""
DATE="$(date +%Y-%m-%d)"
POINTS=0
POINTS_EXPLICIT=false
DRY_RUN=false

usage() {
  cat <<'USAGE'
track-contribution.sh — Record a creator contribution

Required:
  --creator NAME        Creator name (e.g. "Ryan", "Jay", "JY")
  --type TYPE           column|feedback|topic|comment|meeting|idea|review
  --contribution VERB   wrote|gave|suggested|commented|attended|proposed|reviewed

Optional:
  --slug SLUG           Content slug (for columns/reviews)
  --channel CHANNEL     Discord channel name
  --summary TEXT        Short description
  --date YYYY-MM-DD     Date (default: today)
  --points N            Credit points (default: 0)
  --dry-run             Print the entry without writing to the ledger
USAGE
  exit 1
}

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --creator)       CREATOR="$2"; shift 2 ;;
    --type)          TYPE="$2"; shift 2 ;;
    --contribution)  CONTRIBUTION="$2"; shift 2 ;;
    --slug)          SLUG="$2"; shift 2 ;;
    --channel)       CHANNEL="$2"; shift 2 ;;
    --summary)       SUMMARY="$2"; shift 2 ;;
    --date)          DATE="$2"; shift 2 ;;
    --points)        POINTS="$2"; POINTS_EXPLICIT=true; shift 2 ;;
    --dry-run)       DRY_RUN=true; shift ;;
    -h|--help)       usage ;;
    *)               echo "Unknown option: $1"; usage ;;
  esac
done

# Validate required fields
if [[ -z "$CREATOR" || -z "$TYPE" || -z "$CONTRIBUTION" ]]; then
  echo "Error: --creator, --type, and --contribution are required." >&2
  usage
fi

# Validate type
VALID_TYPES="column feedback topic comment meeting idea review"
if ! echo "$VALID_TYPES" | tr ' ' '\n' | grep -qx "$TYPE"; then
  echo "Error: --type must be one of: $VALID_TYPES" >&2
  exit 1
fi

# Validate contribution verb
VALID_VERBS="wrote gave suggested commented attended proposed reviewed"
if ! echo "$VALID_VERBS" | tr ' ' '\n' | grep -qx "$CONTRIBUTION"; then
  echo "Error: --contribution must be one of: $VALID_VERBS" >&2
  exit 1
fi

# Auto-calculate points if not explicitly set
if [[ "$POINTS_EXPLICIT" == false ]]; then
  case "$TYPE" in
    column)   POINTS=10 ;;
    feedback) POINTS=5 ;;
    review)   POINTS=5 ;;
    topic)    POINTS=3 ;;
    meeting)  POINTS=3 ;;
    idea)     POINTS=3 ;;
    comment)  POINTS=2 ;;
  esac
fi

# Validate date format
if ! [[ "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Error: --date must be YYYY-MM-DD format" >&2
  exit 1
fi

# Check jq
if ! command -v jq &>/dev/null; then
  echo "Error: jq is required but not installed." >&2
  exit 1
fi

# Check ledger exists
if [[ ! -f "$LEDGER" ]]; then
  echo "Error: Ledger not found at $LEDGER" >&2
  exit 1
fi

# Build the new entry
NEW_ENTRY=$(jq -n \
  --arg creator "$CREATOR" \
  --arg type "$TYPE" \
  --arg contribution "$CONTRIBUTION" \
  --arg slug "$SLUG" \
  --arg channel "$CHANNEL" \
  --arg summary "$SUMMARY" \
  --arg date "$DATE" \
  --argjson points "$POINTS" \
  '{creator: $creator, type: $type, contribution: $contribution} +
   (if $slug != "" then {slug: $slug} else {} end) +
   (if $channel != "" then {channel: $channel} else {} end) +
   (if $summary != "" then {summary: $summary} else {} end) +
   {date: $date, points: $points}')

if [[ "$DRY_RUN" == true ]]; then
  echo "[dry-run] Would append to $LEDGER:"
  echo "$NEW_ENTRY" | jq .
  exit 0
fi

# Append entry and update timestamp
UPDATED=$(jq \
  --argjson entry "$NEW_ENTRY" \
  --arg today "$(date +%Y-%m-%d)" \
  '.updatedAt = $today | .contributions += [$entry]' \
  "$LEDGER")

echo "$UPDATED" > "$LEDGER"
echo "Recorded: $CREATOR ($TYPE/$CONTRIBUTION) on $DATE"
