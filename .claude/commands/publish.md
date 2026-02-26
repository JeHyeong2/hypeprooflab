---
name: publish
description: End-to-end content publishing pipeline (research → column → QA → deploy → announce)
argument-hint: "<topic> [--skip-research] [--skip-deploy] [--author <name>] [--from-research <date>]"
context: fork
agent: publish-orchestrator
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, WebSearch, WebFetch
---

The user invoked: `/publish $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS` as: `<topic> [options]`

- `topic`: The subject to publish about (REQUIRED — everything before the first `--` flag)
- `--skip-research`: Skip research stage, go straight to column writing
- `--skip-deploy`: Skip deployment, write content only
- `--author <name>`: Author override (default: JY)
- `--from-research <date>`: Use specific daily research as column source

## Execution

1. Read `CLAUDE.md` for project rules
2. Run the full pipeline following the publish-orchestrator agent instructions:
   - Research → Column → QA → Deploy → Announce
3. Output JSON result to stdout

## Pipeline Behavior

- Stages run sequentially — each depends on the previous
- QA failures get 2 retry loops before aborting
- Build failures abort immediately (no forced deploy)
- Final output includes Discord announcement content for Mother to post
