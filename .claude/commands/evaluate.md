---
name: evaluate
description: Run comprehensive 4-axis system evaluation — agents, content, cron, system health
argument-hint: "[--full] [--axis 1|2|3|4] [--period <days>]"
context: fork
agent: evaluator
allowed-tools: Read, Glob, Grep, Bash, WebFetch
---

The user invoked: `/evaluate $ARGUMENTS`

## Argument Parsing

Parse `$ARGUMENTS`:

- `--full`: Run all checks including build and live URL (slower)
- `--axis <N>`: Run only axis N (1=Agent, 2=Content, 3=Cron, 4=System)
- `--period <days>`: Lookback window (default: 7)

If no arguments, run quick mode (all 4 axes, skip build/deploy check).

## Execution

1. Read `CLAUDE.md` for project rules
2. Run evaluation following the evaluator agent instructions
3. Write report to `reports/evaluation-YYYY-MM-DD.md`
4. Output JSON summary to stdout
5. If previous evaluation report exists, include trend comparison
