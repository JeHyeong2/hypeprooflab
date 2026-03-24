# Diagram QA Criteria

## Pre-QA Validation

Before scoring visuals, validate data integrity:
- **Member name consistency**: Cross-check member names in diagrams against `members.md`. Flag any name that appears in diagrams but not in members.md (phantom member).
- **Member count**: Count unique member names in diagram. Must match `members.md` active count.
- **Color assignment**: Each member must have exactly one color. No member should appear with two different colors.

## Scoring Axes (each 1-10)

### Readability
- **10**: All text legible at 100% zoom, clear font size, good contrast
- **7**: Minor text overlap but still readable
- **4**: Some labels truncated or unreadable
- **1**: Most text illegible, tiny font, poor contrast

### Completeness
- **10**: All nodes, edges, and labels from source .mmd are visible
- **7**: Minor cosmetic issues but all data present
- **4**: Some nodes or edges missing or malformed
- **1**: Diagram failed to render or is mostly broken

### Layout Quality
- **10**: Professional layout, balanced spacing, logical flow direction
- **7**: Acceptable layout with minor crowding
- **4**: Nodes overlap, poor use of space, confusing flow
- **1**: Chaotic layout, unusable

## Overall Score
`round((readability + completeness + layout) / 3)`

## Pass/Fail
- **PASS**: overall >= 7
- **FAIL**: overall < 7 -> trigger fix iteration

## Common Issues and Fixes

| Issue | Detection | Fix |
|-------|-----------|-----|
| Text too small | Labels unreadable at 100% | Increase width (-w 2400+), use shorter labels, add `\n` line breaks |
| Horizontal overflow | Diagram wider than viewport | Change `flowchart LR` to `flowchart TB`, or split into subdiagrams |
| Overlapping nodes | Nodes touching/covering each other | Add `nodeSpacing`/`rankSpacing` in config, reduce node count per subgraph |
| Broken arrows | Edges not connecting properly | Check mermaid syntax for missing node IDs |
| Color contrast | Text invisible on background | Use dark theme with light text, avoid similar-hue bg+text |
| Gantt too dense | Bars overlap | Increase `barHeight`, reduce sections, or split into multiple charts |
| Pie chart labels cut | Labels outside viewport | Shorten label text, use legend instead |
| Subgraph title missing | No visible subgraph boundary | Add explicit subgraph titles |

## Fix Strategy per Diagram Type

### Flowchart
- Prefer `TB` (top-bottom) for complex diagrams
- Max 15 nodes per subgraph
- Use `<br/>` for multi-line labels instead of long text
- Set `nodeSpacing: 50` and `rankSpacing: 60` minimum

### Gantt
- Max 10 sections per chart (split if more)
- `barHeight: 24` minimum
- `fontSize: 14` minimum
- Avoid overlapping date ranges

### Pie
- Max 10 slices
- Keep label text under 20 chars
- Use theme-appropriate colors
