---
name: research
description: Run the daily research pipeline or topic-focused research
argument-hint: "[--date YYYY-MM-DD] [--topic <topic>]"
context: fork
agent: research-analyst
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch
---

The user invoked: `/research $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS`:

- `--date YYYY-MM-DD`: Target date for daily research (default: today)
- `--topic <topic>`: Focus on a specific topic instead of broad daily scan
- If no arguments, run today's daily research

## Execution

1. Read `CLAUDE.md` for project rules
2. Read `PHILOSOPHY.md` for HypeProof Lens
3. Run the research pipeline following the research-analyst agent instructions
4. Output JSON result to stdout
