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

text_limits:
  title: 10                     # max Korean chars
  subtitle: 25
  stat_label: 8
  bullet: 15
  table_cell: 12
  quote: 40

slides_module: slides.py        # project-specific slide builders
output_dir: output/             # generated artifacts directory
```

---

## Library: scripts/gslides/

| Module | Contents |
|--------|----------|
| `grid.py` | SW, SH, emu(), rgb(), MARGIN_*, COL*_W/GAP, col2/3/4, FONT_* |
| `themes.py` | Theme class + NAVY_CORAL preset |
| `primitives.py` | uid, tb, rect, rrect, card, section_header, _sh, _img, _tx, _st, _pa, _fi, _bg |
| `api_client.py` | generate(title, slides, builders) |
| `auth.py` | get_credentials() — OAuth helper |
| `export_pptx.py` | export(presentation_id, output_path) |
| `validate.py` | validate(content, limits) — text constraint checker |
| `lint_typography.py` | lint_file(path) — detect tb() text overflow |

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

---

## CLI Commands

```bash
# Typography linting
python3 -m scripts.gslides.lint_typography <project-dir>/slides.py

# Validate content
python3 -m scripts.gslides.validate --content <project-dir>/output/slide-content.json

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
