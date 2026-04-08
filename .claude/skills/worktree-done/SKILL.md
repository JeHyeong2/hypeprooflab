---
name: worktree-done
description: Merge current worktree changes to main and prepare for cleanup. Use when done working in a worktree and ready to merge — triggered by "done", "merge to main", "worktree done", "/worktree-done". Handles commit, merge, push, and safe worktree removal with confirmation.
---

# Worktree Done

Commit, merge to main, push, and optionally remove the current worktree.

## Pre-flight Checks

1. Confirm we are in a worktree (not main repo):
   ```bash
   git worktree list
   git rev-parse --abbrev-ref HEAD
   ```
   If on `main`, abort: "Already on main — nothing to merge."

2. Get the worktree branch [[workspace/stakeholders/stakeholder-map.md|name]] and main repo path:
   ```bash
   BRANCH=$(git rev-parse --abbrev-ref HEAD)
   MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
   ```

## Step 0.5: Session Knowledge Capture

Before committing, check if the session produced knowledge that should be ingested into the vault. This prevents data loss when worktrees are cleaned up.

**Detection**: Scan uncommitted/untracked files for vault-relevant content:
```bash
git status --porcelain | grep -E '(workspace/reports|data/meeting-notes|daily-retrospective)'
```

Also check: were there conversations in this session that produced insights, decisions, or signals not yet in the vault? (e.g., email analysis, brainstorm results, meeting prep findings)

**If vault-relevant content exists**:

1. Ask user via AskUserQuestion:
   ```
   This session produced vault-relevant content:
   - {list of new/modified report files}
   
   Ingest key findings before merging? [yes / skip]
   ```

2. If **yes**: Summarize the session's key findings (signals, actions, decisions, stakeholder updates) and run the ingest pipeline:
   - Dispatch extraction agents (signal-extractor, action-extractor, stakeholder-mapper, vault-differ)
   - Write to vault: signals → `workspace/signals/YYYY-MM.md`, knowledge updates → `knowledge/`
   - Rebuild index: `python3 .claude/skills/index/scripts/build_index.py`
   - Validate: `python3 -c "import yaml; yaml.safe_load(open('knowledge/ontology-index.yaml'))"`
   - Commit the ingest results as a separate commit before the merge

3. If **skip**: proceed directly to Step 1.

**If no vault-relevant content**: skip silently to Step 1.

## Step 1: Commit Uncommitted Changes

Check for uncommitted changes:
```bash
git status --porcelain
```

- If clean: skip to Step 2
- If changes exist: stage and commit with a descriptive message
  - Use `vault:` prefix for vault-only changes (signals, agendas, knowledge, ontology)
  - Use `fix:`, `feat:`, `docs:` for code/config changes
  - Ask user for commit message if changes are mixed or unclear

## Step 2: Merge to Main

From the **main repo directory** (not the worktree):
```bash
cd $MAIN_REPO
git merge $BRANCH --no-edit
```

- On success: proceed to Step 3
- On conflict: report conflicts, ask user how to proceed. Do NOT force-resolve.

## Step 3: Push

```bash
git push origin main
```

Report what was pushed (commit count, summary).

## Step 4: Worktree Removal

Ask user: "Worktree `{[[workspace/stakeholders/stakeholder-map.md|name]]}` merged and pushed. Remove it? (y/n)"

If yes, use ExitWorktree tool with `action: "remove"`.

If no, use ExitWorktree tool with `action: "keep"`.

## Safety Rules

- **Never** delete worktrees without explicit user confirmation
- **Never** force-push or reset --hard
- If merge conflicts: report and wait for guidance
- If worktree has unmerged commits from other branches: warn before proceeding
- Check `lsof +D <worktree_path>` if user wants to remove — warn if processes are active
