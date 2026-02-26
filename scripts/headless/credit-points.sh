#!/usr/bin/env bash
# Credit points to a creator after successful content publish.
# Usage: credit-points.sh <creator> <action> <slug>
# Actions: CONTENT_GEO_70, COLUMN_PUBLISH, RESEARCH_PUBLISH
# Requires: CREDIT_API_SECRET env var
set -euo pipefail

CREATOR="${1:?Usage: credit-points.sh <creator> <action> <slug>}"
ACTION="${2:?Usage: credit-points.sh <creator> <action> <slug>}"
SLUG="${3:?Usage: credit-points.sh <creator> <action> <slug>}"

if [[ -z "${CREDIT_API_SECRET:-}" ]]; then
  echo '{"status":"error","error":"CREDIT_API_SECRET not set"}' >&2
  exit 1
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://hypeproof-ai.xyz/api/points/credit" \
  -H "Content-Type: application/json" \
  -H "x-credit-secret: $CREDIT_API_SECRET" \
  -d "{\"creator\": \"$CREATOR\", \"action\": \"$ACTION\", \"slug\": \"$SLUG\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
  echo "{\"status\":\"ok\",\"creator\":\"$CREATOR\",\"action\":\"$ACTION\",\"slug\":\"$SLUG\",\"response\":$BODY}"
else
  echo "{\"status\":\"fail\",\"http_code\":$HTTP_CODE,\"error\":\"API returned $HTTP_CODE\",\"body\":\"$BODY\"}" >&2
  exit 1
fi
