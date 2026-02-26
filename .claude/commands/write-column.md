---
name: write-column
description: Write a bilingual column (KO/EN) on a given topic
argument-hint: "<topic> [--from-research <date>] [--author <name>]"
context: fork
agent: content-columnist
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch
---

The user invoked: `/write-column $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS` as: `<topic> [--from-research <date>] [--author <name>]`

- `topic`: The column subject (REQUIRED — everything before the first `--` flag)
- `--from-research <date>`: Use daily research from this date as source material
- `--author <name>`: Author name (default: JY)

## Execution

1. Read `CLAUDE.md` for project rules
2. If `--from-research` provided, read `research/daily/<date>-daily-research.md`
3. Write the column following the content-columnist agent instructions
4. Output JSON result to stdout
