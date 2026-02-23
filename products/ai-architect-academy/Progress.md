# Proposal System — Progress Tracker

> Living document. Agents: read this FIRST to know current state.
> Update checkboxes and notes after completing each step.

## Status Legend
- [ ] Pending
- [~] In progress
- [x] Done

---

## Phase 0: Foundation
- [x] .claude/settings.json — removed broken moai hook references
- [x] OAuth credentials verified (google_auth.py works, token at ~/.cm-tracker/config/)
- [x] generate_gslides.py v5 working (9 slides, Google Slides API)

## Phase 1: Scripts
- [x] parse_spec.py — SPEC.md → slide-content.json (15 sections parsed, 9 slides)
- [x] validate_slides.py — text constraint checker (PASS)
- [x] export_pptx.py — Google Slides → .pptx download (CLI verified)
- [x] End-to-end: parse_spec.py output matches generate_gslides.py SLIDES format

## Phase 2: Claude Code Infrastructure
- [x] Skill: .claude/skills/proposal-slides/SKILL.md
- [x] Agent: .claude/agents/slide-planner.md
- [x] Agent: .claude/agents/content-writer.md
- [x] Agent: .claude/agents/gslides-builder.md
- [x] Agent: .claude/agents/proposal-qa.md
- [x] Agent: .claude/agents/proposal-orchestrator.md
- [x] Command: .claude/commands/proposal.md

## Phase 3: Integration
- [x] CLAUDE.md updated with proposal system section
- [x] End-to-end test: /proposal generate completes successfully
- [x] Progress.md updated

---

## Blockers & Notes

(Agents: add dated entries here when encountering issues)

- 2026-02-23: Project initialized. generate_gslides.py is the working baseline.
  Content is hardcoded in the script (SLIDES dict, lines 524-547).
  Future: make it read from slide-content.json.
- 2026-02-23: All infrastructure created. parse_spec.py, validate_slides.py,
  export_pptx.py working. 5 agents, 1 skill, 1 command created.
  CLAUDE.md updated with proposal system section.
  Remaining: end-to-end test via /proposal generate.
- 2026-02-23: /proposal review completed. CRITICAL: slide-content.json is only 44%
  complete. Slides 02, 03, 04, 06, 09 are empty (build key only, no content).
  Feedback written to output/feedback.json. Overall score: 3/10.
  Next: run /proposal fix to fill in the 5 missing slides.
- 2026-02-23: /proposal refine 8 10 completed. Iteration 1 achieved 8/10.
  All 9 slides fully populated. Text constraints validated (PASS).
  Target 8/10 reached in 1 iteration.

---

## Next Steps (for fresh session)

When starting a new session, run these commands in order:

```
/proposal setup      <- verify OAuth token
/proposal generate   <- full pipeline (SPEC -> Google Slides)
/proposal review     <- critic evaluates quality
/proposal fix        <- apply feedback, re-generate
/proposal export     <- download final .pptx
```

Repeat `review -> fix` cycle until overall_score >= 8 in feedback.json.

---

## Last Run

| Field | Value |
|-------|-------|
| Date | 2026-02-23 |
| Command | refine 8 10 |
| Google Slides URL | https://docs.google.com/presentation/d/1NauHOj2q-SXSeC9g8SLX1pDeNUB2YBFNqdfIcMjXHAw/edit |
| PPTX Path | — |
| QA Status | PASS — overall_score: 8/10 (all 9 slides complete) |
| Feedback Path | output/feedback.json |

---

## Revision History

| # | Date | Trigger | Changes | Slides |
|---|------|---------|---------|--------|
| 1 | 2026-02-23 | e2e test | Initial generation with hardcoded SLIDES dict | 9 |
| 2 | 2026-02-23 | /proposal review | Critic review — 5 slides empty, feedback.json created | 9 |
| 3 | 2026-02-23 | refine iter 1 | score 3→8, filled slides 02,03,04,06,09, fixed subtitle/labels | 9 |

---

*Updated: 2026-02-23 — /proposal refine 8 10 complete, overall_score 8/10, target reached in 1 iteration*
