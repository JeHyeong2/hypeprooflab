---
name: load
description: Session health check + context load — verify dependencies and summarize current HypeProof state. Use when starting a session or checking system health.
user_invocable: true
triggers:
  - "load"
  - "health check"
  - "session start"
---

## Purpose

30-second session startup: verify all dependencies work, check cron health, then load a situational summary. Read-only — no file writes.

## Workflow

### Phase 1: Health Check

Run the health check script:

```bash
python3 .claude/skills/load/scripts/health_check.py
```

Print the output directly. If exit code is non-zero, warn Jay but continue to Phase 1.5.

### Phase 1.5: Cron Recovery Check

Run the failure scanner:

```bash
python3 .claude/skills/load/scripts/check_failures.py
```

Parse the JSON output. If `failures` array is non-empty:

1. **Present summary** using AskUserQuestion:
   ```
   {N} cron jobs failed in last 48h

   Recoverable now:
     - {job} — {reason} (→ {skill})
     - ...
   Not recoverable / stale:
     - {job} — {reason}
     - ...

   Re-run recoverable jobs? [all / pick / skip]
   ```

2. **Handle response**:
   - `all` → Run each recoverable job's skill sequentially (use the `skill` field from JSON)
   - `pick` → Ask which specific jobs to re-run via AskUserQuestion, then run only those
   - `skip` → Continue to Phase 2

If `failures` array is empty, print "No cron failures detected" and continue.

### Phase 2: Context Load

Read-only data gathering (no agents — direct file reads and commands only):

1. **Git activity** — `git log --oneline -10` for recent commits

2. **Cron status** — For each job in config, find the most recent log in `cron-reports/` matching `cron-{job}-*.log`. Report last run date and whether it contains "Error" or non-zero exit.

3. **Content counts**:
   - Columns: count `.md` files in `web/src/content/columns/ko/`
   - Daily research: count `.md` files in `research/daily/` (exclude `en/` subdir)
   - Novels: count chapter `.md` files in `novels/simulacra/`
   - Members: count entries in `data/members.json`

4. **Content freshness**:
   - Latest column: `ls -t web/src/content/columns/ko/*.md | head -1`, extract date from filename
   - Latest research: `ls -t research/daily/*.md | head -1`, extract date
   - Research gap: days since last research

5. **Open issues** — `gh issue list --repo jayleekr/hypeprooflab --limit 5 --state open` (if `gh` is available, skip gracefully if not)

6. **Build health** — Check if `web/` has a recent build by looking for `.next/` directory existence (don't run build)

### Phase 3: Print Summary

Format and print directly to conversation (not to file). Target <3000 chars.

```markdown
# HypeProof Load — YYYY-MM-DD HH:MM

## Health Check
| Check | Status | Detail |
|-------|--------|--------|
| PyYAML | [OK] | ... |
| ... | ... | ... |

## Cron Recovery
{if failures detected, show summary here}
{if no failures: "No cron failures detected (48h window)"}

## Content
| Type | Count | Latest |
|------|-------|--------|
| Columns (KO) | N | YYYY-MM-DD |
| Research | N | YYYY-MM-DD (Nd gap) |
| Novels | N chapters | — |
| Members | N | — |

## Cron Status
| Job | Last Run | Status |
|-----|----------|--------|
| morning-routine | YYYY-MM-DD | OK/ERROR |
| ... | ... | ... |

## Open Issues (top 5)
1. #N title (label)
2. ...

## Recent Commits
1. abc1234 commit message
2. ...
```

## Dependencies

- Script: `.claude/skills/load/scripts/health_check.py`
- Script: `.claude/skills/load/scripts/check_failures.py`
- Config: `.claude/skills/config/config.yaml`
- Logs: `cron-reports/`
- Failures: `.claude/failures/`

## Notes

- This skill is **read-only** — no files are written or modified (except when re-running recovered jobs via their skills)
- Health check targets <3 seconds (no API calls)
- Keep total output under 3000 chars for quick scanning
- Cron recovery uses AskUserQuestion — Jay always decides whether to re-run
- Generic scripts (`health_check.py`, `check_failures.py`) are config-driven and shareable across projects
