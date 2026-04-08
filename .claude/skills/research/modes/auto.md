# Auto Mode (for cron)

When invoked with `--auto` flag or via cron prompt.

## Behavior

1. Skip Phase 1 interactive checkpoint — proceed directly to research
2. Read `config.yaml` competitors list
3. For each competitor: check `*Updated:` timestamp in vault file
4. If stale (>1 day since last update): trigger refresh research
5. Limit to 3 competitors per run (token budget control)
6. Write results to vault, print summary to stdout
7. Do NOT attempt Confluence publish
