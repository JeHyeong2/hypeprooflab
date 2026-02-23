# Proposal Generation System — Implementation Plan

> Google Slides API pipeline for Future AI Leader's Academy proposals
> Single source of truth for architecture, file map, and design decisions
> Agents: read this file to understand HOW the system works

---

## Architecture

```
SPEC.md (content source of truth)
    │
    ▼
[slide-planner agent]     → output/slide-plan.json
    │
    ▼
[content-writer agent]    → output/slide-content.json
    │
    ▼
[gslides-builder agent]   → Google Slides (via generate_gslides.py)
    │
    ▼
[proposal-qa agent]       → QA report (PASS/FAIL)
    │
    ▼
[export]                  → output/proposal.pptx
```

Orchestrated by `proposal-orchestrator` agent, invoked via `/proposal` command.

---

## File Map

### Content & Config
| Path | Role | Modify? |
|------|------|---------|
| `SPEC.md` | Content source of truth (324 lines) | READ ONLY during generation |
| `PPT_AGENT.md` | Design system, layouts, QA checklist | Reference only |
| `Plan.md` | This file — architecture reference | Update on arch changes |
| `Progress.md` | Living state tracker | Update after every step |

### Scripts
| Path | Role | Status |
|------|------|--------|
| `scripts/generate_gslides.py` | Google Slides API generator v5 (583 lines) | Working — DO NOT MODIFY |
| `scripts/google_auth.py` | OAuth2 helper (token at ~/.cm-tracker/config/) | Working |
| `scripts/parse_spec.py` | SPEC.md → slide-content.json parser | To be created |
| `scripts/validate_slides.py` | Text constraint & completeness checker | To be created |
| `scripts/export_pptx.py` | Google Slides → .pptx download | To be created |
| `scripts/generate_ppt.py` | Legacy python-pptx generator | Deprecated |
| `scripts/templates/styles.py` | Legacy python-pptx design system | Deprecated |
| `scripts/templates/layouts.py` | Legacy python-pptx layout builders | Deprecated |

### Claude Code Infrastructure
| Path | Role |
|------|------|
| `.claude/skills/proposal-slides/SKILL.md` | Technical reference (loaded into agent context) |
| `.claude/agents/slide-planner.md` | SPEC → slide-plan.json |
| `.claude/agents/content-writer.md` | Structure → Korean text optimization |
| `.claude/agents/gslides-builder.md` | Runs generate_gslides.py |
| `.claude/agents/proposal-qa.md` | Validates output |
| `.claude/agents/proposal-orchestrator.md` | Pipeline coordinator |
| `.claude/commands/proposal.md` | /proposal [generate\|sync\|export\|setup] |

### Output (gitignored)
| Path | Role |
|------|------|
| `output/slide-plan.json` | Intermediate: slide structure |
| `output/slide-content.json` | Intermediate: replacement data |
| `output/proposal.pptx` | Final deliverable |

---

## Design Decisions

| Decision | Why |
|----------|-----|
| Google Slides API over python-pptx | Korean font native support, collaborative editing, template cloning |
| OAuth Desktop flow (not service account) | Reuses existing gmail-credentials.json at ~/.cm-tracker/config/ |
| slide-content.json as intermediate | Decouples content authoring from API calls; enables partial re-generation |
| generate_gslides.py kept as-is | Working v5 with 9 slide builders; refactoring is a separate future task |
| Text constraints in agent, not code | Claude understands Korean char counting better than regex |
| Agents reference proposal-slides skill | Single source for design system, constraints, and schemas |

---

## Text Constraints (Korean)

| Element | Max Length | Example |
|---------|-----------|---------|
| title | 10 chars | "시장 기회" |
| subtitle | 25 chars | "글로벌 AI 교육 시장의 폭발적 성장" |
| stat_number | Number + unit | "430억$" |
| stat_label | 8 chars | "글로벌 AI 교육" |
| bullet_item | 15 chars, max 3 per slide | "기술 중심의 코딩 교육" |
| table_cell | 12 chars | "AI/ML 엔지니어" |
| quote | 40 chars | "코딩 문법을 외우게 할 것인가..." |

---

## Design System (from generate_gslides.py)

### Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| PRIMARY | #1B2A4A | (27,42,74) | Titles, emphasis |
| ACCENT | #FF6B35 | (255,107,53) | Numbers, CTA |
| WHITE | #FFFFFF | (255,255,255) | Background |
| DARK_GRAY | #4A4A4A | (74,74,74) | Body text |
| LIGHT_GRAY | #F5F5F5 | (245,245,245) | Cards, sections |

### Font
- **Noto Sans KR** (Google Fonts native — no CJK issues)
- Title: 36pt Bold
- Subtitle: 20pt SemiBold
- Body: 16pt Regular
- Stat number: 48pt ExtraBold
- Caption/source: 10pt Light

### Slide Size
- 10" × 5.625" (16:9)
- EMU: 9144000 × 5143500

---

## SPEC Section → Slide Mapping

| Slide | Layout | SPEC Section(s) | Key Message |
|-------|--------|-----------------|-------------|
| 1 | center-title | §1 Program Overview | Program name + subtitle + partner |
| 2 | three-column-stats | §2.1, §2.2, §2.3 | Market size, growth, awareness |
| 3 | bullet-minimal | §3 Problem | Coding ≠ AI talent |
| 4 | two-column | §4 Core Concept | Parent-child co-founding |
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
        "subtitle": "description text",
        "bottom": "partner line"
      }
    },
    {
      "index": 2,
      "layout": "three-column-stats",
      "content": {
        "title": "slide title",
        "columns": [
          {"stat": "430억$", "label": "label", "desc": "description"}
        ],
        "source": "Sources: ..."
      }
    }
  ]
}
```

Schema matches the SLIDES dict structure in generate_gslides.py (lines 486-543).

---

## Phase Definitions

### Phase 0: Foundation
- .gitignore updates for output/*.pptx, config/.env
- Verify OAuth credentials work: `python3 scripts/google_auth.py`

### Phase 1: Scripts
- parse_spec.py: SPEC.md → slide-content.json
- validate_slides.py: text constraint checks
- export_pptx.py: Drive API PPTX download

### Phase 2: Claude Code Infrastructure
- Skill: .claude/skills/proposal-slides/SKILL.md
- 5 Agents: slide-planner, content-writer, gslides-builder, proposal-qa, proposal-orchestrator
- Command: .claude/commands/proposal.md

### Phase 3: Integration
- CLAUDE.md update with proposal system section
- End-to-end test: /proposal generate
- Progress.md final update

---

## CLI Commands (Independent Execution)

```bash
# Auth setup / token refresh
python3 scripts/google_auth.py

# Parse SPEC into slide content
python3 scripts/parse_spec.py --spec SPEC.md --output output/slide-content.json

# Generate Google Slides (current: uses hardcoded content)
python3 scripts/generate_gslides.py --title "제안서 제목"

# Validate content JSON
python3 scripts/validate_slides.py --content output/slide-content.json

# Export to PPTX
python3 scripts/export_pptx.py --presentation-id <ID> --output output/proposal.pptx
```

---

*Created: 2026-02-23*
