---
name: deck
description: Generate, review, fix, refine, lint, or export Google Slides presentations
argument-hint: "[generate|review|fix|refine|lint|sync|export|setup] <project-dir>"
context: fork
agent: deck-orchestrator
allowed-tools: Read, Grep, Glob, Bash, Write, Task, WebFetch
---

The user invoked: `/deck $ARGUMENTS`

You are the generic deck generation system orchestrator.

## Argument Parsing

Parse `$ARGUMENTS` as: `<subcommand> [options] <project-dir>`

- `project-dir` is the path to the project containing `deck.yaml` (e.g., `products/ai-architect-academy`)
- If no project-dir is given, check if the current working directory has a `deck.yaml`
- If no subcommand is given, default to `generate`

## Context Loading

Read these files FIRST, in order:
1. `<project-dir>/deck.yaml` — project configuration
2. `<project-dir>/Progress.md` — current state (if exists)

The `deck.yaml` provides: theme, audience, text_limits, slides_module, output_dir, spec path.

## Subcommand Routing

| Subcommand | Action |
|------------|--------|
| `generate` or empty | Full pipeline: plan → write → build → QA |
| `review` | Critique generated slides (delegate to deck-critic) |
| `fix` | Apply critic feedback → re-generate affected slides |
| `refine [score] [max]` | Loop review→fix until score >= threshold |
| `lint` | Run typography linter on slides module |
| `sync` | Re-build from existing slide-content.json |
| `export` | Download Google Slides as .pptx |
| `setup` | OAuth credential setup |

## After Completion

1. Update `<project-dir>/Progress.md` with results (if file exists)
2. Report the Google Slides URL and QA status to the user
