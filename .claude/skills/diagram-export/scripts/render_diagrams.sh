#!/bin/bash
# Render all .mmd files in a directory to PNG and/or SVG using mmdc
# Usage: render_diagrams.sh <diagrams_dir> [format: png|svg|both] [theme: dark|light|neutral] [width: 2400]
# Outputs: render-report.json with per-diagram status

set -euo pipefail

DIR="${1:?Usage: render_diagrams.sh <diagrams_dir> [format] [theme] [width]}"
FORMAT="${2:-both}"
THEME="${3:-dark}"
WIDTH="${4:-2400}"

# Preflight: check mmdc
MMDC="/opt/homebrew/bin/mmdc"
if ! command -v "$MMDC" &>/dev/null; then
  MMDC="mmdc"
fi
if ! command -v "$MMDC" &>/dev/null; then
  echo "ERROR: mmdc not found. Install: npm install -g @mermaid-js/mermaid-cli"
  exit 2
fi

# Create mermaid config for theme
CONFIG_FILE="$DIR/.mermaid-config.json"
trap 'rm -f "$CONFIG_FILE"' EXIT

case "$THEME" in
  dark)
    cat > "$CONFIG_FILE" <<'CONF'
{
  "theme": "dark",
  "themeVariables": {
    "primaryColor": "#1f6feb",
    "primaryTextColor": "#e6edf3",
    "primaryBorderColor": "#388bfd",
    "lineColor": "#8b949e",
    "secondaryColor": "#161b22",
    "tertiaryColor": "#0d1117",
    "noteBkgColor": "#161b22",
    "noteTextColor": "#e6edf3",
    "fontSize": "16px"
  },
  "flowchart": { "curve": "basis", "padding": 20, "nodeSpacing": 50, "rankSpacing": 60 },
  "gantt": { "fontSize": 14, "barHeight": 24, "sectionFontSize": 14 }
}
CONF
    BG="#0d1117"
    ;;
  light)
    cat > "$CONFIG_FILE" <<'CONF'
{
  "theme": "default",
  "themeVariables": { "fontSize": "16px" },
  "flowchart": { "curve": "basis", "padding": 20, "nodeSpacing": 50, "rankSpacing": 60 },
  "gantt": { "fontSize": 14, "barHeight": 24, "sectionFontSize": 14 }
}
CONF
    BG="white"
    ;;
  neutral)
    cat > "$CONFIG_FILE" <<'CONF'
{
  "theme": "neutral",
  "themeVariables": { "fontSize": "16px" },
  "flowchart": { "curve": "basis", "padding": 20, "nodeSpacing": 50, "rankSpacing": 60 },
  "gantt": { "fontSize": 14, "barHeight": 24, "sectionFontSize": 14 }
}
CONF
    BG="white"
    ;;
esac

# Build render report
REPORT="$DIR/render-report.json"
echo "[" > "$REPORT"
FIRST=true

for mmd in "$DIR"/*.mmd; do
  [ -f "$mmd" ] || continue
  base=$(basename "$mmd" .mmd)
  status="ok"
  files=()
  err_msg=""

  if [[ "$FORMAT" == "png" || "$FORMAT" == "both" ]]; then
    if "$MMDC" -i "$mmd" -o "$DIR/${base}.png" -w "$WIDTH" -b "$BG" -c "$CONFIG_FILE" -s 2 -q 2>"$DIR/${base}.png.err"; then
      files+=("${base}.png")
    else
      status="failed"
      err_msg=$(cat "$DIR/${base}.png.err" 2>/dev/null | head -5 | tr '\n' ' ')
    fi
  fi

  if [[ "$FORMAT" == "svg" || "$FORMAT" == "both" ]]; then
    if "$MMDC" -i "$mmd" -o "$DIR/${base}.svg" -b "$BG" -c "$CONFIG_FILE" -q 2>"$DIR/${base}.svg.err"; then
      files+=("${base}.svg")
    else
      [ "$status" = "ok" ] && status="partial"
      err_msg="${err_msg}$(cat "$DIR/${base}.svg.err" 2>/dev/null | head -5 | tr '\n' ' ')"
    fi
  fi

  # Clean up empty error files
  for ef in "$DIR/${base}".*.err; do
    [ -s "$ef" ] || rm -f "$ef"
  done

  # Append to report
  $FIRST || echo "," >> "$REPORT"
  FIRST=false
  files_json=$(printf '"%s",' "${files[@]}" | sed 's/,$//')
  printf '{"diagram":"%s","status":"%s","files":[%s],"error":"%s"}' \
    "$base" "$status" "$files_json" "$(echo "$err_msg" | sed 's/"/\\"/g')" >> "$REPORT"
done

echo "]" >> "$REPORT"

# Summary
ok=$(grep -c '"ok"' "$REPORT" || true)
failed=$(grep -c '"failed"' "$REPORT" || true)
echo "Rendered: $ok ok, $failed failed (report: $REPORT)"
