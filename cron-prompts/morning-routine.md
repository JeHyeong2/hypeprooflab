Read CLAUDE.md first. Mother morning routine for {date}.

1. Check recent git log (last 24h) for overnight changes
2. Check `cron-reports/` for any failed jobs from yesterday/overnight
   - Also flag logs that have "STARTED" but no "COMPLETED" line — these indicate crashed or killed runs
3. Check `.claude/failures/` for unresolved failures
4. Scan `data/submissions.json` for pending content submissions
5. Summarize status in a morning briefing

Post briefing to Discord #daily-research (channel 1468135779271180502) via Discord MCP reply tool.
Format: concise, max 500 chars, highlight any issues needing attention.

Output JSON: {"status": "ok", "briefing": "...", "issues": [...]}

Date: {date}, Max turns: 15
