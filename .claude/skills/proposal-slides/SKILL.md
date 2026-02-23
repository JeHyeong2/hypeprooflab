---
name: proposal-slides
description: >
  Google Slides API proposal generation system for AI Architect Academy.
  Covers 4-stage pipeline (plan, write, build, QA), design system, text
  constraints, and SPEC-to-slide mapping. Use when creating or updating
  academy proposals via /proposal command.
allowed-tools: Read Grep Glob Bash Write
---

# proposal-slides

> Google Slides API-based proposal generator
> Version: 1.0 | Updated: 2026-02-23

---

## Pipeline

```
SPEC.md
  → [slide-planner]     → output/slide-plan.json
  → [content-writer]    → output/slide-content.json
  → [gslides-builder]   → Google Slides URL
  → [proposal-qa]       → QA Report (PASS/FAIL)
  → [export]            → output/proposal.pptx
```

All orchestrated by `proposal-orchestrator` agent.

---

## Before You Start

1. Read `products/ai-architect-academy/Progress.md` — current state
2. Read `products/ai-architect-academy/Plan.md` — architecture and file map
3. Read `products/ai-architect-academy/SPEC.md` — content source (DO NOT MODIFY)

---

## File Map

| Path | Role |
|------|------|
| `products/ai-architect-academy/SPEC.md` | Content source of truth |
| `products/ai-architect-academy/PPT_AGENT.md` | Design system, QA checklist |
| `products/ai-architect-academy/Plan.md` | Architecture reference |
| `products/ai-architect-academy/Progress.md` | State tracker (read first, update after) |
| `products/ai-architect-academy/scripts/generate_gslides.py` | Working Google Slides generator v5 |
| `products/ai-architect-academy/scripts/google_auth.py` | OAuth2 helper |
| `products/ai-architect-academy/scripts/parse_spec.py` | SPEC parser |
| `products/ai-architect-academy/scripts/validate_slides.py` | QA validator |
| `products/ai-architect-academy/scripts/export_pptx.py` | PPTX exporter |
| `products/ai-architect-academy/output/` | All generated artifacts |

---

## Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| PRIMARY | #1B2A4A | Titles, emphasis |
| ACCENT | #FF6B35 | Numbers, CTA, highlights |
| WHITE | #FFFFFF | Background |
| DARK_GRAY | #4A4A4A | Body text |
| LIGHT_GRAY | #F5F5F5 | Cards, section backgrounds |
| MID_GRAY | #E0E0E0 | Borders, dividers |
| NAVY_LIGHT | #2D4A7A | Secondary headings |
| WARM_BG | #FFF8F5 | Warm section backgrounds |
| ACCENT_LIGHT | #FFE8DC | Accent backgrounds |

### Font
**Noto Sans KR** (Google Fonts native — zero CJK issues)

| Usage | Size | Weight |
|-------|------|--------|
| Slide title | 36pt | Bold |
| Subtitle | 20pt | SemiBold |
| Body | 16pt | Regular |
| Stat number | 48pt | ExtraBold |
| Caption/source | 10pt | Light |

### Slide Size
- 10" × 5.625" (16:9)
- EMU: 9,144,000 × 5,143,500

---

## Text Constraints (Korean)

| Element | Max Length | Example |
|---------|-----------|---------|
| title | 10 chars | "시장 기회" |
| subtitle | 25 chars | "글로벌 AI 교육 시장의 폭발적 성장" |
| stat_number | Number + unit | "430억$" |
| stat_label | 8 chars | "글로벌 AI 교육" |
| bullet_item | 15 chars, max 3/slide | "기술 중심의 코딩 교육" |
| table_cell | 12 chars | "AI/ML 엔지니어" |
| quote | 40 chars | "코딩 문법을 외우게 할 것인가..." |

---

## Slide Mapping (9 slides)

| # | Layout | SPEC Section | Key Message |
|---|--------|-------------|-------------|
| 1 | center-title | §1 Overview | Program name + partner |
| 2 | three-column-stats | §2 Market | Market size, growth, awareness |
| 3 | bullet-minimal | §3 Problem | Coding ≠ AI talent |
| 4 | two-column | §4 Concept | Parent-child co-founding |
| 5 | bullet-minimal | §5 Curriculum | 4 parts, 4 hours |
| 6 | two-column | §6 Partnership | Give/Get structure |
| 7 | timeline | §7 Roadmap | 3 phases |
| 8 | table | §8 Team | 4 faculty members |
| 9 | bullet-minimal | §9-10 Track Record | Achievements + pricing |

---

## slide-content.json Schema

```json
{
  "title": "presentation title",
  "slides": [
    {
      "index": 1,
      "layout": "center-title",
      "content": {
        "title": "Future AI Leader's Academy",
        "subtitle": "subtitle text",
        "bottom": "partner line"
      }
    },
    {
      "index": 2,
      "layout": "three-column-stats",
      "content": {
        "title": "slide title",
        "columns": [
          {"stat": "430억$", "label": "label text", "desc": "description"}
        ],
        "source": "Sources: ..."
      }
    },
    {
      "index": 3,
      "layout": "bullet-minimal",
      "content": {
        "title": "slide title",
        "bullets": [
          {"head": "bold heading", "desc": "description text"}
        ],
        "quote": "optional quote text"
      }
    },
    {
      "index": 4,
      "layout": "two-column",
      "content": {
        "title": "slide title",
        "left": {"header": "left title", "bullets": ["item1", "item2"]},
        "right": {"header": "right title", "bullets": ["item1", "item2"]},
        "callout": "optional callout text"
      }
    }
  ]
}
```

This schema matches the SLIDES dict format in `generate_gslides.py`.

---

## Layout Types

| Layout | Fields Required |
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
# OAuth setup / token refresh
python3 scripts/google_auth.py

# Generate Google Slides (currently uses hardcoded content)
cd products/ai-architect-academy && python3 scripts/generate_gslides.py

# Parse SPEC (when implemented)
python3 scripts/parse_spec.py --spec SPEC.md --output output/slide-content.json

# Validate content
python3 scripts/validate_slides.py --content output/slide-content.json

# Export PPTX
python3 scripts/export_pptx.py --id <PRESENTATION_ID> --output output/proposal.pptx
```

---

## QA Checklist (from PPT_AGENT.md §3.4)

- [ ] No text overflow
- [ ] Font size consistency
- [ ] Margins ≥ 1 inch from edges
- [ ] Number emphasis visually prominent
- [ ] 9-slide story flow is natural
- [ ] No typos
- [ ] Sources cited

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Token expired` | OAuth token at ~/.cm-tracker/config/ expired | Run `python3 scripts/google_auth.py` |
| `HttpError 403` | Missing API scope or template not shared | Check Slides API enabled, share template |
| `HttpError 429` | Rate limit exceeded | Wait 60s, retry |
| `KeyError in SLIDES` | slide-content.json missing required field | Check schema above |
| `Empty slide` | Content writer produced empty string | Re-run content-writer with feedback |
