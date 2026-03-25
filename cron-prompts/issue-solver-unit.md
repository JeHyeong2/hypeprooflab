You are running in an isolated git worktree. Resolve this single GitHub issue:

**Issue**: #{number}
**Title**: {title}
**Body**: {body}
**Date**: {date}

## Instructions

Read CLAUDE.md first, then follow the full workflow in `.claude/skills/issue-solver/SKILL.md` (Phase 1 through Phase 3).

Apply it to this single issue only. Key constraints:

- Read CLAUDE.md and relevant SKILL.md before making changes
- Only fix this one issue — do not touch unrelated code
- Never `git add -A` or `git add .`
- Stage specific files and commit with a descriptive message
- Do NOT push or create a PR — the merge-to-main step is handled externally

## Validation

Before committing, you MUST:
1. Run `cd web && npm run build` — must pass
2. Run `git diff --stat` and count files changed
3. If the issue body has a `## Max Files` line, enforce that limit
4. If no Max Files specified, default limit is **5 files**
5. If you exceed the limit: **stop, revert extra changes, and only commit the minimal fix**

## Special Cases

**Already implemented**: If the fix is already present in the codebase, close the issue:
```bash
gh issue close {number} --repo jayleekr/hypeprooflab --comment "Already implemented — no code changes needed. [details]"
```

**Blocked by another issue**: If this issue depends on an unresolved issue:
```bash
gh issue edit {number} --repo jayleekr/hypeprooflab --add-label "blocked"
gh issue comment {number} --repo jayleekr/hypeprooflab --body "Blocked by #N — [reason]."
```
Do NOT commit any changes in this case.

**Cannot determine fix**: If the issue is ambiguous or requires design decisions, commit nothing and exit.
