---
name: write-novel
description: Write a SIMULACRA novel chapter
argument-hint: "[vol<N>-ch<NN>] [--continue]"
context: fork
agent: content-novelist
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

The user invoked: `/write-novel $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS`:

- `vol<N>-ch<NN>`: Specific volume and chapter (e.g., `vol1-ch07`)
- `--continue`: Auto-detect the next chapter to write
- If no arguments, default to `--continue`

## Execution

1. Read `CLAUDE.md` for project rules
2. Read all previous chapter summaries for continuity
3. Write the chapter following the content-novelist agent instructions
4. Output JSON result to stdout
