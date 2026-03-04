---
name: gslides-kit
description: >
  Generic Google Slides generation toolkit. Covers the deck pipeline
  (plan, write, build, QA, critique), design system, text constraints,
  and deck.yaml configuration. Use for any /deck command work.
allowed-tools: Read Grep Glob Bash Write
---

# gslides-kit

> Generic Google Slides presentation generation toolkit
> Version: 2.0 | Updated: 2026-02-23

---

## Pipeline

```
deck.yaml (project config)
  + SPEC.md (content source)
  → [slide-planner]     → output/slide-plan.json
  → [content-writer]    → output/slide-content.json
  → [gslides-builder]   → Google Slides URL
  → [deck-qa]           → QA Report (PASS/FAIL)
  → [deck-critic]       → feedback.json (score + suggestions)
  → [export]            → output/deck.pptx
```

Orchestrated by `deck-orchestrator` agent via `/deck` command.

---

## deck.yaml Schema

```yaml
name: project-name              # unique project identifier
title: "Presentation Title"     # title for Google Slides
spec: SPEC.md                   # content source (relative path)
theme: navy-coral               # theme from scripts/gslides/themes.py
font: "Noto Sans KR"            # primary font family

audience:
  profile: "Target audience description"
  viewing: "Viewing conditions"
  concerns:                        # What worries the audience about this proposal?
    - "Concern 1"
  questions:                       # What specific questions must the deck answer?
    - "Question 1"
  success_criteria:                # What does "yes" look like for this audience?
    - "Criterion 1"

text_limits:
  title: 10                     # max Korean chars
  subtitle: 25
  stat_label: 8
  bullet: 15
  table_cell: 12
  quote: 40

slides_module: slides.py        # project-specific slide builders
output_dir: output/             # generated artifacts directory

layout_rules:
  max_same_layout_pct: 40       # no single layout >40% of slides
  max_consecutive_same: 2       # no more than 2 consecutive same-layout slides

quality_gate:
  min_critic_score: 7           # refine loop target (default threshold)
  max_warns: 3                  # QA warn budget — exceeding = FAIL
```

---

## Library: scripts/gslides/

| Module | Contents |
|--------|----------|
| `grid.py` | SW, SH, emu(), rgb(), MARGIN_*, COL*_W/GAP, col2/3/4, FONT_* |
| `themes.py` | Theme class + NAVY_CORAL preset |
| `primitives.py` | uid, tb, rect, rrect, card, section_header, bar_chart, flow_diagram, pie_segments, comparison_matrix, _sh, _img, _tx, _st, _pa, _fi, _bg |
| `api_client.py` | generate(title, slides, builders), update(pres_id, indices, slides, builders) |
| `auth.py` | get_credentials() — OAuth helper |
| `export_pptx.py` | export(presentation_id, output_path) |
| `validate.py` | validate(content, limits, expected_slides, layout_rules) — text constraint checker |
| `autofix.py` | autofix(content_path, feedback_path, limits, dry_run) — mechanical fix engine |
| `lint_typography.py` | lint_file(path) — detect tb() text overflow (supports --content flag) |
| `geometry_fix.py` | apply_geometry_fixes(slides_path, feedback_path) — auto-fix emu() values from feedback |
| `error_registry.py` | classify, accumulate, promote errors across iterations → known-bugs.json |
| `known-bugs.json` | Global bug pattern DB — prevention rules injected into agent prompts |

### Import pattern for slides.py:

```python
from scripts.gslides.grid import emu, MARGIN_L, col2, col3, col4, ...
from scripts.gslides.primitives import tb, rect, rrect, card, section_header, ...
from scripts.gslides.themes import NAVY_CORAL
from scripts.gslides.api_client import generate

T = NAVY_CORAL
PRIMARY = T.colors['primary']
ACCENT = T.colors['accent']
# ... extract colors as module-level vars
```

---

## Design System (navy-coral theme)

### Colors

| Name | RGB | Usage |
|------|-----|-------|
| primary | (0.106, 0.165, 0.290) | Titles, emphasis |
| accent | (1.0, 0.420, 0.208) | Numbers, CTA, highlights |
| white | (1.0, 1.0, 1.0) | Background |
| dark_gray | (0.290, 0.290, 0.290) | Body text |
| light_gray | (0.945, 0.945, 0.945) | Cards, backgrounds |
| mid_gray | (0.700, 0.700, 0.700) | Borders, sources |
| navy_light | (0.180, 0.260, 0.420) | Secondary headings |
| accent_light | (1.0, 0.930, 0.890) | Warm backgrounds |

### Font Tokens (PT)

| Token | Size | Usage |
|-------|------|-------|
| FONT_TITLE | 18 | Section titles |
| FONT_CARD_TITLE | 12 | Card headers |
| FONT_BODY | 9 | Body text |
| FONT_CAPTION | 7 | Sources, footnotes |
| FONT_STAT_BIG | 28 | Hero numbers |
| FONT_STAT_MED | 16 | Secondary numbers |
| FONT_LABEL | 8 | Labels, badges |

### Slide Size
- 10" x 5.625" (16:9)
- EMU: 9,144,000 x 5,143,500

---

## Layout Types

| Layout | Required Fields |
|--------|----------------|
| `center-title` | title, subtitle, bottom |
| `three-column-stats` | title, columns[{stat, label, desc}], source |
| `bullet-minimal` | title, bullets[{head, desc}], quote? |
| `two-column` | title, left{header, bullets}, right{header, bullets}, callout? |
| `timeline` | title, phases[{name, period, items}], impact? |
| `table` | title, headers[], rows[][] |
| `stat-table-hybrid` | title, columns[{stat, label}], headers[], rows[][], callout? |
| `matrix` | title, items[{label, stat, desc}], callout? |
| `image-two-col` | title, image_url, bullets[{head, desc}], callout? |
| `bar-chart` | title, chart{bars[{label, value, display}]}, callout? |
| `flow-diagram` | title, steps[{label, desc}], callout? |

---

## CLI Commands

```bash
# Typography linting (with content-aware checking)
python3 -m scripts.gslides.lint_typography <project-dir>/slides.py --content <project-dir>/output/slide-content.json

# Validate content (with deck.yaml limits + layout_rules)
python3 -m scripts.gslides.validate --content <project-dir>/output/slide-content.json --deck-yaml <project-dir>/deck.yaml

# Auto-fix mechanical issues from critic feedback
python3 scripts/gslides/autofix.py \
  --content <project-dir>/output/slide-content.json \
  --feedback <project-dir>/output/feedback.json \
  --deck-yaml <project-dir>/deck.yaml

# Geometry fix (apply emu() corrections from feedback)
python3 -m scripts.gslides.geometry_fix \
  --slides <project-dir>/slides.py \
  --feedback <project-dir>/output/feedback.json

# OAuth setup
python3 -c "from scripts.gslides.auth import get_credentials; get_credentials()"

# Export PPTX
python3 -c "from scripts.gslides.export_pptx import export; export('<ID>', 'output/deck.pptx')"
```

---

## Adding a New Project

1. Create `products/new-project/deck.yaml` — 10 lines of config
2. Create `products/new-project/SPEC.md` — content source
3. Create `products/new-project/slides.py` — copy academy's, modify layouts
4. Run `/deck generate products/new-project`

No agents, commands, or skills need to change.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Token expired` | OAuth token expired | `python3 -c "from scripts.gslides.auth import get_credentials; get_credentials()"` |
| `HttpError 403` | Missing API scope | Check Slides API enabled in GCP |
| `HttpError 429` | Rate limit | Wait 60s, retry |
| `ModuleNotFoundError` | Missing package | `pip3 install google-api-python-client google-auth-oauthlib` |
| Text overflow in slides | tb() box too small | Run lint_typography, increase h or reduce text |
