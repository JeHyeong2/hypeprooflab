# System Evaluation — {date}

Run a comprehensive 4-axis evaluation of the HypeProof system.

## Instructions

1. Read `CLAUDE.md` first
2. Read `data/known-issues.json` — match findings against known patterns
3. Read most recent `reports/evaluation-*.md` for trend comparison
4. Run the evaluator agent in **quick mode** (skip build and live URL check)
5. Lookback period: 7 days

## Axis 1: Agent Performance
- Check all `.claude/agents/*.md` files have valid frontmatter
- Parse `cron-reports/discord-router.log` for recent activity
- Check `data/submissions.json` for Herald output
- Verify agent tool scopes match security policy

## Axis 2: Content Impact
- Count new columns in `web/src/content/columns/ko/` from last 7 days (git log)
- Count new research in `research/daily/` from last 7 days
- Check KO/EN pair completeness
- Validate frontmatter on 5 most recent files

## Axis 3: Cron Health
- `plutil -lint` all `~/Library/LaunchAgents/com.hypeproof.*.plist`
- Check `cron-reports/` for today's expected logs
- Check for `.err` files with content
- Verify discord-router is running: `launchctl list | grep discord-router`

## Axis 4: System Health
- `git status` — clean repo check
- Validate `data/submissions.json` JSON
- Check memory files in `.claude/projects/*/memory/`
- Check disk usage of `.next/`, `node_modules/`, `cron-reports/`

## Feedback Loop

- Match every finding against `data/known-issues.json`
- If a finding matches a known pattern: mark `recurred`, increment `times_seen`
- If a previously-fixed issue recurs: escalate to `error`, clear `fix_applied`
- New patterns: add to `data/known-issues.json` with status `open`
- Issues not seen for 4+ weeks since fix: mark `resolved`

## Output

Write report to `reports/evaluation-{date}.md` and output JSON to stdout.
Update `data/known-issues.json` with new/updated patterns.
If a previous evaluation report exists in `reports/`, include trend comparison.
