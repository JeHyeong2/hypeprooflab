---
name: issue-solver
description: Fetch open issues, resolve them autonomously (fixes, enhancements), validate with npm build, and commit. Use when resolving GitHub issues autonomously.
user_invocable: true
disable-model-invocation: true
---

# issue-solver

## Purpose

Read open issues from `jayleekr/hypeprooflab` and resolve them autonomously. Handles all issue types — mechanical fixes, enhancements, and judgment calls. Only issues labeled `no-auto-fix`, `blocked`, or `needs-human` are skipped.

## Config

Read `.claude/skills/config/config.yaml` for:
- `github.repos` — repo full name, auto-fix labels, max issues per run
- `github.skip_labels` — labels to skip

## Workflow

### Phase 0: Fetch Open Issues

```bash
gh issue list --repo jayleekr/hypeprooflab --label "priority:high" --state open \
  --json number,title,body,labels,createdAt --limit 10
```

Also fetch `priority:medium` if fewer than 3 high-priority issues found.

Sort by severity (high first), then by creation date (oldest first).
Limit to `max_issues_per_run` (default 3).

Skip issues with labels: `blocked`, `no-auto-fix`, `needs-human`.

**Dependency check**: For each issue, scan body for `blocked by #N` or `Depends on #N`. If the referenced issue is still open, add `blocked` label and skip.

**Special cases** (batch mode):
- **Already implemented**: Close the issue directly with explanation. Do not commit.
- **Blocked by another issue**: Add `blocked` label and comment. Do not commit.
- **Cannot determine fix**: Exit without committing. The system retries with more budget next cycle.

**Scope guard**: Read `## Max Files` from issue body (default: 5). Before committing, run `git diff --stat` and count changed files. If exceeded, revert extra changes and only commit the minimal fix.

### Phase 1: Per-Issue Analysis

For each issue:

1. **Read CLAUDE.md first** — understand project rules
2. **Read body** — parse `## Problem`, `## Recommendation`, `## References`, `## Acceptance Criteria` sections
3. **Read referenced files** — understand current state
4. **Classify issue type**:

| Type | Examples | Approach |
|------|----------|----------|
| **Mechanical** | Config edit, YAML fix, typo, build error | Direct fix |
| **Enhancement** | New feature, new component, new content | Design -> implement -> test |
| **Judgment** | Architecture decision, design choice | Analyze context -> decide -> implement -> document rationale |

All types proceed to Phase 2. The only skip condition is the skip labels.

### Phase 2: Resolution

#### Mechanical Issues
1. Apply fix following the recommendation in the issue body
2. Validate with `cd web && npm run build`

#### Enhancement Issues
1. **Design**: Read existing patterns in the codebase to establish conventions
2. **Implement**: Create new files / modify existing ones following project conventions
3. **Test**: Run `cd web && npm run build`
4. **Document**: Update relevant docs as needed

#### Judgment Issues
1. **Analyze**: Read CLAUDE.md, related files to understand tradeoffs
2. **Decide**: Choose the most conservative option that resolves the issue
3. **Implement**: Apply the chosen approach
4. If genuinely ambiguous, implement the simpler option and note the alternative in commit body.

### Phase 3: Validate

1. Run `cd web && npm run build` — **must pass**
2. For content changes: verify frontmatter has required fields (title, slug, date)
3. For config changes: validate YAML syntax
4. Check `git diff --stat` against Max Files limit

**If build fails**: revert changes, add comment to issue explaining the failure, move to next issue.

### Phase 4: Commit

**Interactive mode** (Jay running directly): Commit directly to main.

**Batch mode** (cron/worktree): Commit to the worktree branch only. Do NOT push or create a PR — the merge-to-main step is handled by `run-job-parallel.sh`.

1. **Stage specific files** (never `git add -A`):
   ```bash
   git add {specific_files_changed}
   ```

2. **Commit** with descriptive message:
   ```bash
   git commit -m "fix: resolve #{number} — {short description}"
   ```
   For enhancements: `feat: resolve #{number} — {short description}`
   For judgment calls: include rationale in commit body

3. **Close the issue** (interactive mode only):
   ```bash
   gh issue close {number} --repo jayleekr/hypeprooflab \
     --comment "Resolved in {commit_hash}: {summary of changes}"
   ```
   In batch mode, issue closing is handled by `run-job-parallel.sh` after successful merge.

### Phase 5: Summary

Output JSON to stdout:

```json
{
  "skill": "issue-solver",
  "status": "ok",
  "timestamp": "ISO-8601",
  "summary": "Resolved N issues: X fixes, Y enhancements",
  "issues_resolved": [1, 2, 3],
  "issues_skipped": [4]
}
```

## Batch Mode

When running in batch mode, each issue is processed in an isolated git worktree for parallel execution.

### Interactive (Jay)

Use `/issue-solver` to invoke directly. Claude Code handles the full workflow.

### Cron (headless)

`run-job-parallel.sh issue-solver` handles the full lifecycle:

1. **Phase 0** runs on main worktree — fetch issues via `gh issue list`
2. **Phase 1-4** runs per-issue in isolated worktrees (`.claude/worktrees/batch-{date}/issue-{N}`)
3. Each worktree gets a dedicated `claude -p` process with the `issue-solver-unit.md` template
4. Max 3 concurrent worktrees (one per issue)
5. Worktrees are cleaned up automatically on exit

### Per-issue prompt

Template: `cron-prompts/issue-solver-unit.md` — injected with issue number, title, body, and branch name.
