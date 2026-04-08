---
name: diagram
description: >
  Generate publication-quality SVG diagrams from natural language descriptions.
  Supports V-Model, architecture, flow, escalation, timeline templates.
  Outputs self-contained HTML with inline SVG to workspace/reports/.
  Use when: diagram, draw, visualize, 그림, 다이어그램, workflow chart, architecture diagram
user_invocable: true
triggers:
  - "diagram"
  - "draw"
  - "visualize"
argument_hint: "<description, e.g. 'AIT diagnostic escalation flow for HKMC'>"
---

# diagram

Generate publication-quality SVG diagrams for workshop presentations and stakeholder communication.

## Why SVG (not Mermaid)

Mermaid cannot achieve:
- Precise positional control (AI badges, V-Model layout)
- Korean + English bilingual labels with proper spacing
- Color-coded phase groups with rounded corners
- Dashed feedback loops (field monitoring, fail→retry)
- Drop shadows and visual hierarchy

## Inputs

`/diagram <description>` or `/diagram <description> --ref <path-to-reference-image>`

Examples:
- `/diagram [[knowledge/products/ai-technician.md|AIT]] diagnostic escalation L0-L4 with intervention point`
- `/diagram ASPICE V-Model with AI traceability for HKMC`
- `/diagram Collector AI edge-to-cloud data flow`
- `/diagram [[workspace/agendas/uc-log-aggregation.md|CCU2]] deployment architecture --ref workspace/reports/existing.html`

## Workflow

### Phase 1: Intent & Template Selection

1. Parse the user description
2. Select the best-fit template type from the SVG component library
3. If `--ref` is provided, read the reference file for style matching
4. Load relevant vault context (products, customers, maturity levels from `knowledge/`)

Template types:

| Template | When to use |
|----------|-------------|
| `v-model` | ASPICE V-Model with specification ↔ verification traceability |
| `flow` | Linear or branching process flows (Collect → Analyze → Develop) |
| `architecture` | System architecture with layers (UI, backend, AI, memory) |
| `escalation` | Before/after tier comparison (L0-L4 diagnostic escalation) |
| `timeline` | Roadmap or milestone visualization |
| `data-flow` | Edge → cloud → analysis pipeline |
| `comparison` | Side-by-side before/after or competitive comparison |

### Phase 2: Generate SVG

Use the component library (`scripts/svg_components.py`) to build the diagram:

```bash
python3 .claude/skills/diagram/scripts/svg_components.py --help
```

The component library provides:
- `rounded_rect(x, y, w, h, rx, fill, stroke, label, sublabel)` — Phase nodes
- `pill(x, y, w, h, fill, stroke, label)` — Rounded pill shapes
- `ai_badge(cx, cy)` — Purple AI marker circle
- `arrow(x1, y1, x2, y2, style, color)` — Solid/dashed arrows with markers
- `traceability_line(x1, y1, x2, y2)` — Brown dashed bidirectional lines
- `phase_group(x, y, w, h, label, stroke_color)` — Dashed rectangle grouping
- `text_block(x, y, lines, styles)` — Multi-line text with configurable styles
- `vertical_label(x, y, text, color)` — Rotated text for side labels
- `legend(x, y, items)` — Color-coded legend bar
- `trigger_pill(x, y, label)` — Top-row trigger event pills

**IMPORTANT**: The component library is a helper — Claude generates the final SVG directly as HTML. The library provides consistent styling constants and reusable fragments. Claude composes the full `<svg>` by combining components + custom positioning.

### Phase 3: Assemble HTML

Write a self-contained HTML file:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<style>
  body { margin: 0; background: #fff; font-family: 'Pretendard', -apple-system, sans-serif; }
  svg { display: block; margin: 0 auto; }
</style>
</head>
<body>
<svg viewBox="0 0 {width} {height}" width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    {arrow_markers}
    {filters}
  </defs>
  {svg_content}
</svg>
</body>
</html>
```

### Phase 4: Output

1. Write to `workspace/reports/{topic}-diagram.html`
2. Print the full file path for browser opening
3. Summarize what was generated

## Style Guide

### Colors (consistent across all diagrams)

| Purpose | Fill | Stroke | Text |
|---------|------|--------|------|
| Collect / Green phase | `#d4edda` | `#28a745` | `#1a1a2e` |
| Analyze / Blue phase | `#d6eaf8` | `#5dade2` | `#1a1a2e` |
| Develop / Purple phase | `#d6c8f0` | `#8e44ad` | `#1a1a2e` |
| Verify / Yellow phase | `#fef9e7` | `#f39c12` | `#1a1a2e` |
| Report / Red phase | `#fce4ec` | `#e74c3c` | `#1a1a2e` |
| Deploy / Red phase | `#fce4ec` | `#e74c3c` | `#1a1a2e` |
| AI badge | — | — | `#5b5fc7` fill, white text |
| Traceability | — | `#8d6e63` dashed | — |
| Trigger pills | `none` | `#999` | `#555` |
| Error / Fail | — | `#d63031` dashed | `#d63031` |
| Success / Monitor | — | `#28a745` dashed | `#28a745` |

### Typography

- Main node title: 20px, weight 700
- Node subtitle (Korean): 12px, `#555`
- Detail text: 11px, `#777`
- Badge labels: 10px, weight 600
- AI badge: 9px, weight 700, white on `#5b5fc7`

### Layout Rules

- Minimum node size: 140×42 for small, 190×70 for main phase nodes
- Phase nodes use `rx="35"` (pill shape) for main flow, `rx="8"` for V-Model items
- Arrow marker: 8×6 with refX=9
- Drop shadow: `feDropShadow dx=1 dy=1 stdDeviation=2 flood-opacity=0.12`
- V-Model: specification items descend left, verification items align right
- Feedback loops: dashed paths with curved Q-points

### Korean/English Bilingual

- Primary label: Korean (larger)
- Sublabel: English (smaller, gray)
- Exception: Technical terms (ASPICE, SWE.x, OTA) stay English

## Reference Diagrams

Existing diagrams in `workspace/reports/` for style consistency:
- `[[knowledge/products/ai-technician.md|ait]]-hkmc-dev-workflow.html` — Full ASPICE V-Model integrated workflow
- `ait-feature-stability-diagram.html` — Feature stability impact analysis (Mermaid-based, older style)

## Dependencies

- Python 3.10+
- Script: `.claude/skills/diagram/scripts/svg_components.py`
- No external dependencies (pure SVG generation)

## Notes

- All output is self-contained HTML — no external CSS/JS dependencies
- SVG viewBox should be calculated based on content, not hardcoded
- Korean text requires proper font-family fallback chain
- For print: `@media print { body { margin: 0; } }`
