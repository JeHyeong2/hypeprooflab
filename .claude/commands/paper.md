---
name: paper
description: Lens-driven research paper pipeline — discover topics, survey literature, draft, review, and publish to arXiv
argument-hint: "[discover|survey|draft|review|refine|publish|status|lenses] [--paper-id <id>] [--lens <lens-id>]"
context: fork
allowed-tools: Read, Grep, Glob, Bash, Write, Task, WebSearch, WebFetch
---

The user invoked: `/paper $ARGUMENTS`

You orchestrate the HypeProof research paper pipeline.

## First: Read Context

1. `.claude/skills/paper-lab/SKILL.md` — full pipeline spec, 7 lenses, schemas
2. `CLAUDE.md` — project rules
3. `PHILOSOPHY.md` — HypeProof core values (source of the lenses)

## Argument Parsing

Parse `$ARGUMENTS` as: `<subcommand> [options]`

Options:
- `--paper-id <id>`: Target paper project in `papers/<id>/`
- `--lens <lens-id>`: Focus on a specific lens (for discover)
- `--phenomenon <topic>`: Focus on a specific phenomenon (for discover)
- `--section <name>`: Target section (for draft)
- `--perspective <type>`: Reviewer perspective (for review)

If `--paper-id` is not provided:
- Check `papers/` directory for existing projects
- If exactly one exists, use it
- If multiple exist, ask the user which one
- If none exist, create one (for discover subcommand)

## Subcommand Routing

| Subcommand | Phase | Action |
|------------|-------|--------|
| `discover` | 0 | Delegate to `paper-scout` agent — lens x phenomenon matrix → 3 candidates |
| `survey` | 1 | Delegate to `paper-surveyor` agent — literature review + taxonomy |
| `draft` | 2 | Delegate to `paper-drafter` agent — section-by-section writing |
| `review` | 3 | Delegate to `paper-critic` agent x3 (methodology/novelty/readability) in parallel |
| `refine [N]` | 3→2 | Loop: review → revise draft → review, max N times (default: 3) |
| `publish` | 4 | Delegate to `paper-publisher` agent — LaTeX + arXiv prep |
| `status` | - | Report current pipeline state from paper.yaml + existing outputs |
| `lenses` | - | Display all 7 lenses with descriptions |
| (empty) | all | Run full pipeline: discover → survey → draft → review → publish |

## HITL Gates

At these points, STOP and ask the user before continuing:

| Gate | After | Ask |
|------|-------|-----|
| DISCOVER | paper-scout returns 3 candidates | "Which topic do you want to pursue?" |
| SURVEY | paper-surveyor returns taxonomy | "Does this research question look right?" |
| REVIEW (conditional) | review score < threshold after max loops | "Review is stuck. How should we proceed?" |
| PUBLISH | paper-publisher generates submission files | "Ready to submit. Review the checklist." |

## Creating a New Paper Project

If no paper project exists and subcommand is `discover`:

1. Ask user for a paper-id (short slug, e.g., `mirror-agent-drift`)
2. Create `papers/<id>/paper.yaml` from template in SKILL.md
3. Create `papers/<id>/output/` directory
4. Create `papers/<id>/references/` directory
5. Proceed with discover

## Review Aggregation (for `review` and `refine`)

After all 3 critics complete, aggregate into `review-summary.json`:

```json
{
  "average_score": (methodology + novelty + readability) / 3,
  "verdict": "accept" | "revise" | "reject",
  "critical_issues": [combined required_changes],
  "revision_prompt": "synthesized guidance for drafter"
}
```

Verdict rules:
- average >= threshold (from paper.yaml) → "accept"
- average >= threshold - 2 → "revise"
- average < threshold - 2 → "reject" (escalate to HITL)

## After Completion

Report to user:
- Current phase and status
- Key outputs generated
- Next recommended action
- If full pipeline: link to final PDF and submission checklist
