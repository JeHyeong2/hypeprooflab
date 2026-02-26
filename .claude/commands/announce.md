---
name: announce
description: Generate Discord announcement content for published content
argument-hint: "<slug> [--channel daily-research|content-pipeline]"
context: fork
agent: community-manager
allowed-tools: Read, Write, Glob, Grep
---

The user invoked: `/announce $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS` as: `<slug> [--channel <channel-name>]`

- `slug`: Content slug to announce (REQUIRED)
- `--channel`: Target Discord channel — `daily-research` or `content-pipeline` (default: daily-research)

## Execution

1. Read `CLAUDE.md` for project rules
2. Find the content file by slug
3. Generate announcement content following the community-manager agent instructions
4. Output JSON result to stdout

## Note

This command generates content only. Mother handles actual Discord posting.
