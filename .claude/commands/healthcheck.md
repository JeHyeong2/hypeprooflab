---
name: healthcheck
description: Test all content pipeline agents, commands, and scripts — produce E2E report
argument-hint: "[--level unit|integration|e2e|all] [--fix] [--verbose]"
context: fork
agent: healthcheck
allowed-tools: Read, Write, Glob, Grep, Bash, Task
---

The user invoked: `/healthcheck $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS`:

- `--level <level>`: Test depth — `unit`, `integration`, `e2e`, or `all` (default: `all`)
- `--fix`: Auto-fix trivial issues found during checks
- `--verbose`: Include per-file details in the report

If no arguments, run with `--level all`.

## Execution

1. Read `CLAUDE.md` for project rules
2. Run the full test suite following the healthcheck agent instructions
3. Write report to `reports/healthcheck-YYYY-MM-DD.md`
4. Output JSON summary to stdout
