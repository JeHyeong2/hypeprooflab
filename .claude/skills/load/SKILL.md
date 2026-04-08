---
name: load
description: Session health check + context load — verify dependencies and summarize current PM state. Use when starting a session or checking system health.
user_invocable: true
triggers:
  - "load"
  - "health check"
  - "session start"
---

## Purpose

30-second session startup: verify all PM dependencies work, then load a situational summary from the vault. Read-only — no file writes.

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
zsh cron-prompts/check-failures.sh
```

Parse the JSON output. If `failures` array is non-empty:

1. **Present summary** using AskUserQuestion:
   ```
   {N} cron jobs failed in last 48h (root cause: {root_cause})

   Recoverable now:
     - /{job1} ({reason})
     - /{job2} ({reason})
   Stale (skip):
     - /{job3} ({date} — no longer meaningful)

   Re-run recoverable jobs? [all / pick / skip]
   ```

2. **Handle response**:
   - `all` → Run each recoverable job sequentially. For each job, map the job [[workspace/stakeholders/stakeholder-map.md|name]] to the corresponding skill command:
     - `morning` → `/morning`
     - `weekly` → `/weekly`
     - `index` → `/index`
     - `retro-auto` → `/retro`
     - `review` → `/review`
     - `issue-solver` → `/issue-solver`
     - `issue-filer` → `/issue-filer`
     - Other jobs → skip with note
   - `pick` → Ask which specific jobs to re-run via AskUserQuestion, then run only those
   - `skip` → Continue to Phase 2

If `failures` array is empty, print "No cron failures detected" and continue.

### Phase 2: Context Load

Read-only data gathering (no agents — direct file reads only):

1. **Vault freshness** — Run `git log -1 --format='%ci %s' -- workspace/ knowledge/ daily-retrospective/` to get last vault commit date. Calculate days since.

2. **Actions summary** — Read `knowledge/ontology-index.yaml`, extract:
   - `actions_summary.by_priority` → P0/P1/P2/P3 counts
   - `actions_summary.due_this_week` → top 3 items
   - `actions_summary.overdue` count

3. **Signals summary** — From same index file, extract:
   - `signals_summary.total_count`
   - `signals_summary.by_customer` → top 3 customers
   - `signals_summary.recent_7d` → top 3 most recent signals

4. **Today's retro** — Check if `daily-retrospective/YYYY-MM-DD.md` exists (today's date). If not, check yesterday's. Report which exists or "none".

5. **Cron status** — Use `Glob` for `workspace/reports/cron-*.log`, read last 3 lines of the most recent log per job type (morning, retro, weekly, review, index). Report last run date and whether it contains "error" or "fail".

6. **Workshop countdown** — Read `config.yaml`, extract `milestones.workshop_date`, calculate days until.

### Phase 3: Print Summary

Format and print directly to conversation (not to file). Target <3000 chars.

```markdown
# PM Load — YYYY-MM-DD HH:MM

## Health Check
| Check | Status | Detail |
|-------|--------|--------|
| PyYAML | [OK] | ... |
| ... | ... | ... |

## Cron Recovery
{if failures detected, show summary here before asking}
{if no failures: "No cron failures detected (48h window)"}

## Current State
**Actions**: P0:N P1:N P2:N P3:N | Overdue: N
**Signals (7d)**: N total — HKMC:N, ...
**Vault**: Last updated YYYY-MM-DD (Nd ago)
**Index age**: Nh old
**Today's retro**: exists / yesterday's / none

## Workshop Countdown
**HKMC Workshop**: YYYY-MM-DD (Nd away)

## Cron Status
| Job | Last Run | Status |
|-----|----------|--------|
| morning | YYYY-MM-DD | OK/ERROR |
| ... | ... | ... |

## Top Actions Due This Week
1. [P1] Description — Owner (due: ...)
2. ...
3. ...

## Recent Signals (top 3)
1. [YYYY-MM-DD] type — Customer: detail
2. ...
3. ...
```

## Dependencies

- Script: `.claude/skills/load/scripts/health_check.py`
- Script: `cron-prompts/check-failures.sh`
- Config: `.claude/skills/config/config/config.yaml`
- Index: `knowledge/ontology-index.yaml`
- Storage: `workspace/reports/`, `daily-retrospective/`, `.claude/failures/`

## Notes

- This skill is **read-only** — no files are written or modified (except when re-running recovered jobs)
- Health check targets <3 seconds (no API calls)
- If ontology-index.yaml is missing or unparseable, skip Phase 2 context sections that depend on it and note the issue
- Keep total output under 3000 chars for quick scanning
- Cron recovery uses AskUserQuestion — Jay always decides whether to re-run
