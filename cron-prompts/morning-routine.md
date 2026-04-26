Read CLAUDE.md first. Mother morning routine for {date}.

1. Check recent git log (last 24h) for overnight changes
2. Check `cron-reports/` for any failed jobs from yesterday/overnight
   - Also flag logs that have "STARTED" but no "COMPLETED" line — these indicate crashed or killed runs
3. Detect SILENT cron failures — for each daily cron job listed under `cron.jobs` in
   `.claude/skills/config/config.yaml` (e.g., morning-routine, evening-routine, daily-research,
   issue-solver, column-nudge, column-deadline), check whether `cron-reports/cron-{name}-{YYYY-MM-DD}.log`
   exists for at least one of the past 2 days. Any daily cron with no log in 2+ days is a silent
   failure (launchd not firing or wrapper crashing before logging) — flag as CRITICAL with the cron name
   and the date of its last log.
4. Check `.claude/failures/` for unresolved failures
5. Scan `data/submissions.json` for pending content submissions
6. Summarize status in a morning briefing

Post briefing to Discord #daily-research (channel 1468135779271180502) via Discord MCP reply tool.
Format: concise, max 500 chars, highlight any issues needing attention.

Output JSON: {"status": "ok", "briefing": "...", "issues": [...]}

Date: {date}, Max turns: 15
