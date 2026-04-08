# Batch Mode

When processing multiple documents at once, ingest supports batch execution via isolated worktrees.

## Interactive (Jay)

Use `/batch` to invoke ingest with `--batch` flag. Claude Code creates one worktree per document and runs ingestion in parallel. Example:

```
/batch ingest doc1.md doc2.md doc3.md
```

Or via shell: `run-job-parallel.sh ingest-batch doc1.md doc2.md doc3.md`

## How it works

1. Each document gets an isolated worktree (`.claude/worktrees/batch-{date}/ingest-{[[workspace/stakeholders/stakeholder-map.md|name]]}`)
2. Phase 1-3 runs independently per worktree — no vault conflicts during extraction
3. After all worktrees complete, results are merged back to main sequentially
4. Phase 4 (index rebuild) runs once after all merges complete

## Vault merge strategy

- Each worktree writes to its own copy of vault files (signals, agendas, knowledge)
- Merge step cherry-picks commits from each worktree branch into main
- If merge conflicts occur (e.g., both docs append to same signal file), manual resolution is flagged
- Index rebuild runs last to capture all new entities

## Limitations

- Interactive only — not used in cron (Jay decides what to ingest)
- Max 3 concurrent documents (safety limit)
- Large PDFs should be ingested sequentially to avoid memory pressure
