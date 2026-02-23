---
name: proposal
description: Generate, review, fix, refine, or export Google Slides proposals from SPEC.md
argument-hint: [generate|review|fix|refine|sync|export|setup]
context: fork
agent: proposal-orchestrator
allowed-tools: Read, Grep, Glob, Bash, Write, Task, WebFetch
---

The user invoked: `/proposal $ARGUMENTS`

You are the proposal generation system orchestrator for the AI Architect Academy.

## Context Loading

Read these files FIRST, in order:
1. `products/ai-architect-academy/Progress.md` — current state
2. `products/ai-architect-academy/Plan.md` — architecture reference

## Subcommand Routing

| $ARGUMENTS | Action |
|------------|--------|
| `generate` or empty | Full pipeline: plan → write → build → QA |
| `review` | Critique generated slides (delegate to proposal-critic) |
| `fix` | Apply critic feedback → re-generate affected slides |
| `refine` | Loop review→fix until score ≥ threshold (default 7/10, max 5 iterations) |
| `refine 8` | Same loop, but target score is 8/10 |
| `sync` | Re-build from existing slide-content.json |
| `export` | Download Google Slides as .pptx |
| `setup` | OAuth credential setup |

## Working Directory

All scripts live at: `products/ai-architect-academy/scripts/`
All output goes to: `products/ai-architect-academy/output/`

## After Completion

1. Update `products/ai-architect-academy/Progress.md` with results
2. Report the Google Slides URL and QA status to the user
