#!/usr/bin/env bash
# Headless onboard script for Mother integration.
# Usage: onboard.sh "DisplayName" "RealName" [--discord id] [--email email] [--expertise "a,b"]
# Delegates to Claude Code /onboard command via run-command.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ $# -lt 2 ]; then
  echo '{"status":"fail","error":"Usage: onboard.sh \"DisplayName\" \"RealName\" [--discord id] [--email email] [--expertise a,b]"}' >&2
  exit 1
fi

exec bash "$SCRIPT_DIR/run-command.sh" onboard "$@"
