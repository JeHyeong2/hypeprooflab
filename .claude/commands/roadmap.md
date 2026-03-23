---
name: roadmap
description: Review and adjust the HypeProof roadmap with live data
argument-hint: "[--quick] [--data-only]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, AskUserQuestion
---

The user invoked: `/roadmap $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS`:
- `--quick`: Skip AskUserQuestion challenges, just pull data and report status
- `--data-only`: Only pull live traffic data and update the traffic section, no review

## Instructions

Read `.claude/skills/roadmap-review/SKILL.md` first, then follow the Review Pipeline defined there.

### Step-by-step

1. **Read** `products/hypeproof-roadmap-2026Q2.md` (the roadmap)
2. **Read** `PHILOSOPHY.md` and `members.md` for context
3. **Pull live data**:
   - Collect slugs from `web/src/content/columns/ko/`, `web/src/content/research/ko/`, `web/src/content/novels/ko/`
   - Fetch view counts from `https://hypeproof-ai.xyz/api/views?slugs=...`
   - Count content inventory
   - Check recent git activity
4. **Progress check**: Score each action item in the roadmap
5. **Challenge** (skip if `--quick`): Use AskUserQuestion to probe assumptions
6. **Update** the roadmap file with new data and adjustments
7. **Summarize** changes to the user

### Output

Always end with:
- Traffic snapshot (vs last review)
- Action item scorecard
- Top 3 recommended adjustments
- Next review date suggestion
