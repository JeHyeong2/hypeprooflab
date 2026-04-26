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

## Discord Posting — Failure Surfacing

If the Discord post is blocked (e.g., "channel ... not in allowlist", "blocked by access policy",
MCP `reply` returns an access/permission error, or any other failure):

- DO NOT silently swallow the error. The previous behavior caused a 15-day publishing drought
  because failures were buried in narrative summary text (see issue #38).
- Treat this as a HIGH-priority issue and prepend it to the `issues` array.
- Set `discord.blocked: true` and `discord.posted: false` in the output JSON.
- Capture the raw error string in `discord.error` so future automation can pattern-match
  (e.g., "not in allowlist" → escalate to Jay for `/discord:access` approval).

If the Discord post succeeds, set `discord.posted: true` and `discord.blocked: false`.

> Note: agents must NEVER invoke `/discord:access` or edit `access.json` — that is a human-only
> action per the discord MCP rules. Surfacing the flag is the agent's only job here.

## Output JSON

```json
{
  "status": "ok",
  "briefing": "...",
  "issues": [...],
  "discord": {
    "posted": true | false,
    "blocked": true | false,
    "channel_id": "1468135779271180502",
    "error": "<raw error string if blocked, else null>"
  }
}
```

Date: {date}, Max turns: 15
