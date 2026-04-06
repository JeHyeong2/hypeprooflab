Read CLAUDE.md first. Weekly consolidated report for {date}.

1. Aggregate cron results from `cron-reports/` for the past 7 days
2. Count: successful runs, failures, retries
3. Content stats: columns published, research published, submissions processed
4. System health: build status, deploy status, recurring issues
5. Archive failure files older than 30 days

Format a summary report and post to Discord #daily-research.

Output JSON: {"status": "ok", "week_summary": {...}, "health_score": N}

Date: {date}, Max turns: 15
