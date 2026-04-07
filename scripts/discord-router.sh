#!/usr/bin/env zsh
# discord-router.sh — Always-on Discord polling daemon
# Replaces OpenClaw gateway for inbound Discord message handling.
# Polls Discord API for new messages, routes to Claude Code headless.
#
# Usage: Run as LaunchAgent (KeepAlive) or manually:
#   ./scripts/discord-router.sh
#
# Env: DISCORD_BOT_TOKEN (from ~/.config/cron/env or ~/.claude/channels/discord/.env)

set -uo pipefail

WORKSPACE="${HYPEPROOF_WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_DIR="$WORKSPACE/.discord-router"
LOG_DIR="$WORKSPACE/cron-reports"
POLL_INTERVAL=30  # seconds

# Bot config
BOT_USER_ID="1468154508772114567"  # Mother bot
OWNER_USER_ID="1186944844401225808"  # Jay
GUILD_ID="1457738053895328004"  # HypeProof guild

# Channels to monitor (subset — high-value only)
MONITORED_CHANNELS=(
  "1468135779271180502"   # #daily-research
  "1471863670718857247"   # #content-pipeline
  "1486656329476210759"   # #mother-direct (no mention required)
)

# Load token
load_token() {
  if [[ -n "${DISCORD_BOT_TOKEN:-}" ]]; then
    return 0
  fi
  # Try cron env first
  if [[ -f "$HOME/.config/cron/env" ]]; then
    source "$HOME/.config/cron/env" 2>/dev/null
    if [[ -n "${HYPEPROOF_DISCORD_BOT_TOKEN:-}" ]]; then
      DISCORD_BOT_TOKEN="$HYPEPROOF_DISCORD_BOT_TOKEN"
      return 0
    fi
  fi
  # Try Claude Code channel config
  local env_file="$HOME/.claude/channels/discord/.env"
  if [[ -f "$env_file" ]]; then
    source "$env_file" 2>/dev/null
    return 0
  fi
  echo "FATAL: No DISCORD_BOT_TOKEN found" >&2
  return 1
}

# Discord API helper
discord_api() {
  local endpoint="$1"
  curl -sS -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
    -H "Content-Type: application/json" \
    "https://discord.com/api/v10${endpoint}"
}

discord_post() {
  local endpoint="$1"
  local data="$2"
  curl -sS -X POST \
    -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$data" \
    "https://discord.com/api/v10${endpoint}"
}

# State management
mkdir -p "$STATE_DIR" "$LOG_DIR"

get_last_message_id() {
  local channel="$1"
  local state_file="$STATE_DIR/last-${channel}.txt"
  if [[ -f "$state_file" ]]; then
    cat "$state_file"
  else
    echo ""
  fi
}

set_last_message_id() {
  local channel="$1"
  local msg_id="$2"
  echo "$msg_id" > "$STATE_DIR/last-${channel}.txt"
}

# Check if message mentions the bot or is a DM
should_process() {
  local msg="$1"
  local channel_id="$2"

  # Always process from #mother-direct (no mention required)
  if [[ "$channel_id" == "1486656329476210759" ]]; then
    return 0
  fi

  # Check for bot mention
  if echo "$msg" | python3 -c "
import json, sys
m = json.load(sys.stdin)
mentions = m.get('mentions', [])
content = m.get('content', '')
# Check direct mention
for u in mentions:
    if u.get('id') == '$BOT_USER_ID':
        sys.exit(0)
# Check role mention pattern
if '<@&1468156463032570052>' in content or '<@$BOT_USER_ID>' in content:
    sys.exit(0)
# Check keyword mention
import re
if re.search(r'\bmother\b', content, re.IGNORECASE) or '마더' in content:
    sys.exit(0)
sys.exit(1)
" 2>/dev/null; then
    return 0
  fi

  return 1
}

# Process a message through Claude Code
process_message() {
  local msg_json="$1"
  local channel_id="$2"

  local author=$(echo "$msg_json" | python3 -c "import json,sys; m=json.load(sys.stdin); print(m.get('author',{}).get('username','unknown'))")
  local content=$(echo "$msg_json" | python3 -c "import json,sys; m=json.load(sys.stdin); print(m.get('content',''))")
  local msg_id=$(echo "$msg_json" | python3 -c "import json,sys; m=json.load(sys.stdin); print(m.get('id',''))")

  # Skip bot messages
  local is_bot=$(echo "$msg_json" | python3 -c "import json,sys; m=json.load(sys.stdin); print(m.get('author',{}).get('bot', False))")
  if [[ "$is_bot" == "True" ]]; then
    return 0
  fi

  # Skip if from non-owner in DM context
  local author_id=$(echo "$msg_json" | python3 -c "import json,sys; m=json.load(sys.stdin); print(m.get('author',{}).get('id',''))")
  # Only process from allowed users (Jay for now)
  if [[ "$author_id" != "$OWNER_USER_ID" ]]; then
    return 0
  fi

  local timestamp=$(date -Iseconds)
  echo "[$timestamp] Processing: $author in $channel_id: ${content:0:80}..." >> "$LOG_DIR/discord-router.log"

  # Build prompt for Claude Code
  local prompt="You received a Discord message. Read CLAUDE.md first.

Channel: $channel_id
Author: $author (Discord ID: $author_id)
Message: $content

Respond appropriately based on context. If this is a content submission (keywords: 제출, submit, 새 글, 리뷰), delegate to Herald agent for GEO QA scoring.
If this is a general question about HypeProof, answer directly.
If this requires an action (deploy, write column, research), execute the appropriate skill.

Output your Discord reply text. Keep it concise (under 2000 chars)."

  # Unset Claude env vars
  unset ${(k)parameters[(R)*CLAUDE*]} 2>/dev/null || true
  unset ${(k)parameters[(R)*OTEL*]} 2>/dev/null || true

  # Run Claude Code headless
  local claude_bin="${CLAUDE_BIN:-$HOME/.local/bin/claude}"
  local response
  response=$(perl -e "alarm 120; exec @ARGV" -- \
    "$claude_bin" -p "$WORKSPACE" \
    --dangerously-skip-permissions \
    --print \
    --allowedTools "Read,Glob,Grep,Bash,WebFetch,Agent" \
    --max-turns 10 \
    <<< "$prompt" 2>/dev/null) || true

  # Post response back to Discord
  if [[ -n "$response" && ${#response} -gt 5 ]]; then
    # Truncate to Discord limit
    if [[ ${#response} -gt 1900 ]]; then
      response="${response:0:1900}..."
    fi

    # Escape for JSON
    local escaped_response
    escaped_response=$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))" <<< "$response")

    discord_post "/channels/${channel_id}/messages" \
      "{\"content\": ${escaped_response}}" > /dev/null 2>&1

    echo "[$timestamp] Replied to $msg_id (${#response} chars)" >> "$LOG_DIR/discord-router.log"
  fi
}

# Main polling loop
main() {
  load_token || exit 1

  echo "Discord Router started at $(date -Iseconds)"
  echo "Monitoring ${#MONITORED_CHANNELS[@]} channels, polling every ${POLL_INTERVAL}s"
  echo "Bot: $BOT_USER_ID, Owner: $OWNER_USER_ID"

  # Initialize last message IDs on first run
  for ch in "${MONITORED_CHANNELS[@]}"; do
    if [[ -z "$(get_last_message_id "$ch")" ]]; then
      # Get the latest message to set baseline (don't process history)
      local latest
      latest=$(discord_api "/channels/${ch}/messages?limit=1" 2>/dev/null)
      local latest_id
      latest_id=$(echo "$latest" | python3 -c "import json,sys; msgs=json.load(sys.stdin); print(msgs[0]['id'] if msgs else '')" 2>/dev/null)
      if [[ -n "$latest_id" ]]; then
        set_last_message_id "$ch" "$latest_id"
      fi
    fi
  done

  while true; do
    for ch in "${MONITORED_CHANNELS[@]}"; do
      local last_id
      last_id=$(get_last_message_id "$ch")

      local url="/channels/${ch}/messages?limit=10"
      if [[ -n "$last_id" ]]; then
        url="${url}&after=${last_id}"
      fi

      local messages
      messages=$(discord_api "$url" 2>/dev/null) || continue

      # Process messages (oldest first)
      local count
      count=$(echo "$messages" | python3 -c "import json,sys; msgs=json.load(sys.stdin); print(len(msgs) if isinstance(msgs, list) else 0)" 2>/dev/null)

      if [[ "$count" -gt 0 ]]; then
        # Process in reverse (oldest first)
        for i in $(seq $((count - 1)) -1 0); do
          local msg
          msg=$(echo "$messages" | python3 -c "import json,sys; msgs=json.load(sys.stdin); print(json.dumps(msgs[$i]))" 2>/dev/null) || continue

          local msg_id
          msg_id=$(echo "$msg" | python3 -c "import json,sys; m=json.load(sys.stdin); print(m['id'])" 2>/dev/null) || continue

          if should_process "$msg" "$ch"; then
            process_message "$msg" "$ch"
          fi

          # Update last seen ID (always, even if not processed)
          set_last_message_id "$ch" "$msg_id"
        done
      fi
    done

    sleep "$POLL_INTERVAL"
  done
}

main "$@"
