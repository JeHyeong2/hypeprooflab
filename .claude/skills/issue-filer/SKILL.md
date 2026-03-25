---
name: issue-filer
description: Scan review reports, cron failures, and QA results — file deduplicated GitHub issues with proper routing. Use when filing GitHub issues from automated findings.
user_invocable: true
disable-model-invocation: true
---

# issue-filer

## Purpose

Read findings from review reports, build failures, and QA results, then file as GitHub issues with dedup against existing open issues. Follows the issue-ops label scheme.

## Config

Read `.claude/skills/config/config.yaml` for:
- `github.repos` — repo full name, labels, max issues per run
- `github.skip_labels` — labels that mark issues as non-auto-fixable

## Mode Detection

- **Interactive** (default): Show each proposed issue to user for approval before filing
- **Auto** (cron/headless): File directly without confirmation

Detect mode: if running headless (no user interaction possible), use auto mode.

## Workflow

### Phase 1: Parallel Source Scan

Scan 3 sources in parallel:

#### (a) Build / QA Results

Check for recent build or QA failures:
```bash
# Recent build logs
find web/ -name "*.log" -mtime -7 2>/dev/null
# Test results
find web/test-results/ -name "*.json" -mtime -7 2>/dev/null
```

#### (b) Cron Failures (last 7 days)

```bash
find .claude/failures/ -name "*.md" -mtime -7 2>/dev/null
```

Group failures by prompt name — if same prompt failed 3+ times, elevate to CRITICAL.

#### (c) Agent Logs

```bash
find agent-logs/ -name "*.log" -mtime -7 2>/dev/null
```

Parse ERROR and FAIL lines as potential findings.

### Phase 2: Dedup + Classify

#### Step 1: Fetch all open issues (dedup reference)

```bash
gh issue list --repo jayleekr/hypeprooflab --state open \
  --json number,title,body,labels --limit 100
```

Do this ONCE, not per finding.

#### Step 2: Semantic Dedup (per finding)

For each proposed issue, compare against ALL open issues:

1. **Title match**: If an open issue title is >80% similar -> **DUPLICATE**
2. **Problem match**: If `## Problem` describes the same root cause -> **DUPLICATE**
3. **Scope overlap**: If references point to the same files -> **RELATED**

Decision:
- **DUPLICATE** -> Do NOT create. Add comment to existing issue with new finding details.
- **RELATED** -> Create with `Related: #{existing_number}` in body
- **DISTINCT** -> Create normally

Log each dedup decision.

#### Step 3: Classify complexity

| Complexity | Criteria | Max Files |
|-----------|----------|-----------|
| **S** (small) | 1-2 files, clear fix | 3 |
| **M** (medium) | 3-5 files, clear spec | 6 |
| **L** (large) | 6+ files, architectural | 10 |

#### Step 4: Assign labels

Follow issue-ops label scheme:
- **Type**: `bug` | `enhancement` | `content`
- **Area**: `web` | `columns` | `research` | `docs` | `area:pipeline`
- **Priority**: `priority:high` (CRITICAL findings) | `priority:medium` (HIGH findings)
- **Agent**: `agent:claude-code`

### Phase 3: File Issues

For each DISTINCT finding (max 3 per run):

```bash
gh issue create \
  --repo jayleekr/hypeprooflab \
  --title "[{type}] {description}" \
  --label "{type},{area},{priority},{agent}" \
  --body "$(cat <<'EOF'
## Problem
{problem description}

## Recommendation
{suggested fix}

## References
- {file paths}

## Source
- Report: {source file}
- Date: {date}
- Severity: {CRITICAL|HIGH}

## Max Files
{complexity max}

## Acceptance Criteria
- [ ] Fix applied
- [ ] `cd web && npm run build` passes
EOF
)"
```

### Phase 4: Summary

Output JSON to stdout:

```json
{
  "skill": "issue-filer",
  "status": "ok",
  "timestamp": "ISO-8601",
  "summary": "Filed N issues, M duplicates skipped",
  "filed": [{"number": 1, "title": "..."}],
  "duplicates": [{"title": "...", "existing": 5}]
}
```
