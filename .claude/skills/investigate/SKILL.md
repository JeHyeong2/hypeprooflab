---
name: investigate
description: Enhanced root-cause debugging — structured hypothesis tracking, evidence collection, git bisect, timeline reconstruction. Use when a bug needs systematic investigation.
user_invocable: true
triggers:
  - "investigate"
  - "root cause"
  - "debug"
  - "bisect"
---

## Purpose
Systematic root-cause debugging beyond trial-and-error. Use when bug resists simple debugging, need to find regression point, or want documented investigation trail. For simpler cases, use `/debug-loop`.

## Workflow

### Phase 1: Reproduce
Run failing command, capture error output, confirm reproducibility. Record: command, error, environment, timestamp.

### Phase 2: Hypothesize
Generate 3-5 ranked hypotheses. Each must be falsifiable.

| # | Hypothesis | Likelihood | Evidence For/Against | Status |
|---|-----------|------------|---------------------|--------|

### Phase 3: Test Hypotheses
Test highest likelihood first. Stop when confirmed. If all eliminated: widen search, new hypotheses (max 3 rounds).

### Phase 4: Git Bisect (optional, for regressions)
```bash
git bisect start && git bisect bad HEAD && git bisect good <known-good>
# Test each step, mark good/bad
git bisect reset
```

### Phase 5: Timeline Reconstruction
```
YYYY-MM-DD HH:MM  Last known working state
YYYY-MM-DD HH:MM  Change introduced (commit abc1234)
YYYY-MM-DD HH:MM  First failure observed
```

### Phase 6: Fix + Regression Test
Minimal fix → verify → add regression guard (test case/validation) → document in commit.

### Phase 7: Report
Structured report: symptom, root cause, introducing commit, fix, hypothesis log, timeline.

## Environment Checklist (Check FIRST)
Shell, PATH, working directory, permissions, recent changes, cron env.

## Limits
- Hypothesis testing: max 3 rounds (5 each)
- Git bisect: max 20 steps
- Overall: 15 test actions before escalating to user
