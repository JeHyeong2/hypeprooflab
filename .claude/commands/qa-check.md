---
name: qa-check
description: Run QA validation on content files
argument-hint: "<file-or-glob> [--type column|novel|research]"
context: fork
agent: qa-reviewer
allowed-tools: Read, Glob, Grep, Bash, WebFetch
---

The user invoked: `/qa-check $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS` as: `<file-or-glob> [--type column|novel|research]`

- `file-or-glob`: File path or glob pattern to check (REQUIRED)
- `--type`: Content type hint — `column`, `novel`, or `research` (auto-detected if omitted)

## Execution

1. Read `CLAUDE.md` for project rules
2. Resolve the file-or-glob to actual file paths
3. Run all QA checks following the qa-reviewer agent instructions
4. Output JSON result to stdout
