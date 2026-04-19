#!/usr/bin/env zsh
# notify-discord.sh — Send Discord message via HypeproofClaude bot
# Usage: notify-discord.sh "message text"                    # DM to Jay
#        notify-discord.sh --channel <id> "message text"     # post to channel
#   or:  echo "message" | notify-discord.sh [--channel <id>]
#
# Requires: HYPEPROOF_DISCORD_BOT_TOKEN in ~/.config/cron/env

set -euo pipefail

DISCORD_USER_ID="1186944844401225808"  # Jay
DISCORD_TOKEN="${HYPEPROOF_DISCORD_BOT_TOKEN:-}"
TARGET_CHANNEL=""

# Load token from cron env if not set
if [[ -z "$DISCORD_TOKEN" ]]; then
  source "$HOME/.config/cron/env" 2>/dev/null || true
  DISCORD_TOKEN="${HYPEPROOF_DISCORD_BOT_TOKEN:-}"
fi

if [[ -z "$DISCORD_TOKEN" ]]; then
  echo "WARN: HYPEPROOF_DISCORD_BOT_TOKEN not set — skipping notification" >&2
  exit 0
fi

# Parse --channel flag
if [[ "${1:-}" == "--channel" ]]; then
  TARGET_CHANNEL="${2:-}"
  shift 2
fi

# Get message from argument or stdin
MSG="${1:-}"
if [[ -z "$MSG" ]]; then
  MSG="$(cat)"
fi

if [[ -z "$MSG" ]]; then
  echo "WARN: empty message — skipping notification" >&2
  exit 0
fi

# Truncate to Discord limit (2000 chars)
MSG="${MSG:0:2000}"

if [[ -n "$TARGET_CHANNEL" ]]; then
  # Post to specified channel
  CHANNEL_ID="$TARGET_CHANNEL"
else
  # Create DM channel (original behavior)
  CHANNEL_ID=$(curl -sf -X POST "https://discord.com/api/v10/users/@me/channels" \
    -H "Authorization: Bot $DISCORD_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"recipient_id\": \"$DISCORD_USER_ID\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null) || {
    echo "WARN: failed to create DM channel" >&2
    exit 0
  }
fi

# Send message
PAYLOAD=$(echo "$MSG" | python3 -c "import sys,json; print(json.dumps({'content': sys.stdin.read().strip()}))")

curl -sf -X POST "https://discord.com/api/v10/channels/$CHANNEL_ID/messages" \
  -H "Authorization: Bot $DISCORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" >/dev/null 2>&1 || {
  echo "WARN: failed to send Discord message" >&2
  exit 0
}
