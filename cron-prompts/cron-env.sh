#!/usr/bin/env zsh
# cron-env.sh — Environment bootstrap for hypeproof launchd cron jobs
# Source this before run-job.sh in every launchd plist.
# Uses PERSONAL Claude Code account (cc alias).

# PATH
export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:$HOME/Library/Python/3.9/bin:$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

# Secrets (personal account token)
if [[ -f "$HOME/.config/cron/env" ]]; then
  source "$HOME/.config/cron/env"
fi

# Shell aliases (cc = personal Claude Code)
[[ -f "$HOME/.shell_common" ]] && source "$HOME/.shell_common"

# Claude Code settings
unset CLAUDECODE 2>/dev/null || true
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=true
export CLAUDE_CODE_ENABLE_TELEMETRY=0

# IMPORTANT: Use PERSONAL token, NOT SNT token
# If SNT token is loaded from cron/env, unset it to ensure cc alias uses personal
unset SNT_CLAUDE_CODE_OAUTH_TOKEN 2>/dev/null || true

# Workspace
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export HYPEPROOF_WORKSPACE="$(dirname "$SCRIPT_DIR")"

# Reports directory
mkdir -p "$HYPEPROOF_WORKSPACE/workspace/reports" 2>/dev/null
