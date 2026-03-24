---
name: diagram-export
description: >
  Extract Mermaid diagrams from markdown files, render to high-quality PNG/SVG,
  run visual QA with automated fix iterations, and generate an interactive HTML
  dashboard. Use when: user asks to export diagrams, visualize workflow diagrams,
  render mermaid, create diagram dashboard, or check diagram quality. Trigger
  phrases: /diagram-export, export diagrams, render diagrams, diagram dashboard,
  diagram QA, visualize workflow.
---

# diagram-export

Extract, render, QA, fix, and present Mermaid diagrams from any markdown file.

## Pipeline

```
0. Preflight (check mmdc, python3)
1. Extract .mmd files from markdown
2. Render PNG/SVG via mmdc
3. QA: visual inspect each PNG (sub-agent)
4. Fix: rewrite failing .mmd sources (escalating strategy, max 3 iter)
5. Dashboard: generate HTML with PNG display + mermaid source toggle
6. Open in browser
```

## Usage

Parse `$ARGUMENTS`:
- `<file>`: markdown file path (required)
- `--format png|svg|both` (default: `both`)
- `--no-dashboard`: skip HTML generation
- `--no-qa`: skip quality checks
- `--theme dark|light|neutral` (default: `dark`)
- `--open`: open dashboard in browser after

Output: `diagrams/` subdirectory next to input file.

## Execution Steps

### 0. Preflight

Verify `mmdc` is installed: `command -v mmdc` or check `/opt/homebrew/bin/mmdc`.
If missing, tell user: `npm install -g @mermaid-js/mermaid-cli`.

### 1. Extract

```bash
python3 .claude/skills/diagram-export/scripts/extract_mermaid.py <input.md> <output_dir>
```

Produces: `d1.mmd` ... `dN.mmd`, `manifest.json` (with `label`, `desc`, `type`, `node_count`).

### 2. Render

```bash
bash .claude/skills/diagram-export/scripts/render_diagrams.sh <output_dir> <format> <theme> 2400
```

Produces: PNGs, SVGs, `render-report.json`, `.err` files for failures.

### 3. QA (unless --no-qa)

Spawn a sub-agent using the Agent tool with this prompt:

```
You are a diagram QA critic. Read .claude/skills/diagram-export/references/qa-criteria.md first.

For each PNG file in {{OUTPUT_DIR}}:
1. Read the PNG image (you can see images natively)
2. Read the corresponding render-report.json entry — skip diagrams with status "failed"
3. Score on 3 axes:
   - Readability (1-10): Can all text be read at 100% zoom? Font size adequate? Contrast ok?
     Anchors: 10=perfect, 8=one minor overlap, 5=multiple overlaps but traceable, 3=most text unreadable, 1=illegible
   - Completeness (1-10): Are all nodes, edges, labels from the .mmd source visible?
     Anchors: 10=all present, 8=cosmetic issues only, 5=some nodes missing, 3=major gaps, 1=broken render
   - Layout (1-10): Is spacing balanced? Flow direction logical? Professional appearance?
     Anchors: 10=publication-ready, 8=good with one minor crowd, 5=overlaps but flow traceable, 3=chaotic, 1=unusable
4. Overall = round(mean of 3 axes)
5. If overall < 7, describe the specific issue and suggest a fix from qa-criteria.md
6. For diagrams with node_count > 25 (from manifest.json): flag as "high-node-count" even if passing

Write results to {{OUTPUT_DIR}}/qa-report.json:
[
  {
    "diagram": "d1",
    "type": "flowchart",
    "readability": 8,
    "completeness": 9,
    "layout": 7,
    "score": 8,
    "pass": true,
    "issues": null,
    "high_node_count": false
  }
]

PNG files to inspect: {{PNG_LIST}}
```

Replace `{{OUTPUT_DIR}}` and `{{PNG_LIST}}` with actual values.

### 4. Fix (if any score < 7)

Escalating strategy per iteration:

| Iteration | Strategy | Actions |
|-----------|----------|---------|
| 1 | Config changes | Increase spacing, change `LR` to `TB`, adjust font size |
| 2 | Label + grouping | Shorten labels with `<br/>`, group related nodes into subgraphs |
| 3 | Diagram splitting | Split into `d6a.mmd`, `d6b.mmd` etc. by natural clusters |

**Decision matrix** — which fix to apply based on failing axis:

| Failing Axis | Fix |
|-------------|-----|
| Only readability < 7 | Shorten labels, add `<br/>`, increase font — do NOT change direction |
| Only layout < 7 | Change direction (`LR` -> `TB`), increase spacing — do NOT touch labels |
| Both < 7 | Iteration 1: direction change. Iteration 2: labels. Iteration 3: split |
| node_count > 25 + layout < 5 | Skip to iteration 3 (split) immediately |

Write `fix-log.json` per diagram to track iteration state:
```json
[{"iteration": 1, "score_before": 5, "fix_applied": "LR->TB + spacing", "score_after": 6}]
```

After fix, re-render (step 2) and re-score (step 3). Max 3 iterations per diagram.

### 5. Dashboard (unless --no-dashboard)

Generate HTML dashboard that displays **PNG images** (not mermaid re-render) with mermaid source in expandable `<details>` elements.

Read `assets/dashboard-template.html` and inject:

| Token | Value |
|-------|-------|
| `{{TITLE}}` | Derived from input filename |
| `{{SUBTITLE}}` | "N diagrams from filename.md" |
| `{{DIAGRAM_COUNT}}` | Number of diagrams |
| `{{PASS_COUNT}}` | Number passing QA (or "N/A" if --no-qa) |
| `{{AVG_SCORE}}` | Average QA score (or "N/A") |
| `{{TIMESTAMP}}` | Current datetime |
| `{{THEME_CONFIG}}` | Mermaid theme JSON for --theme |
| `{{DIAGRAMS_JSON}}` | See schema below |
| `{{QA_JSON}}` | QA report array (empty `[]` if --no-qa) |

**DIAGRAMS_JSON schema:**
```json
[{
  "label": "D-1 — Overall Workflow Overview",
  "type": "flowchart",
  "desc": "Input Layer to Feedback Layer cycle",
  "mmd": "flowchart TB\\n  A-->B",
  "png": "d1.png"
}]
```

Note: JSON-encode the `mmd` string (escape newlines as `\\n`, quotes as `\\\"`).

**Dashboard displays `<img src="dN.png">` as primary view**, with mermaid source in a `<details><summary>View Source</summary>` block. This ensures the QA-validated render is what the user sees.

### 6. Open (if --open)

```bash
open <output_dir>/dashboard.html
```

## Abort Conditions

- If render produces 0 PNG files: stop, report render failures
- If qa-report.json is missing or unparseable: skip dashboard QA section, warn user
- If fix iteration produces worse score: revert to previous .mmd and stop fixing that diagram

## mmdc Settings

| Option | Value | Why |
|--------|-------|-----|
| `-w` | 2400 | Wide enough for complex charts |
| `-s` | 2 | Retina-crisp text |
| `-b` | theme-dependent | Dark: `#0d1117` |
| `-c` | auto-generated | Larger fonts (16px), wider spacing |
| `nodeSpacing` | 50 | Prevent overlap |
| `rankSpacing` | 60 | Vertical room |
| `barHeight` | 24 | Visible gantt bars |
