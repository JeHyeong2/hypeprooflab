# Ingest Error Handling

## Agent Failures

| Scenario | Action |
|----------|--------|
| 1 agent fails | Continue with remaining results. Note missing agent in summary. |
| All Phase 1 agents fail | Abort. Print error with agent names and errors. |
| Phase 2 agent fails | Skip mapping, write Phase 1 results directly (less precise but better than nothing). |

## File Issues

| Scenario | Action |
|----------|--------|
| File not found | Error immediately. Suggest checking path. |
| File too large (>100KB) | Warn user. Process first 50KB with truncation note. |
| Binary/unsupported format | Error. Suggest converting to text/PDF first. |

## Vault Write Conflicts

| Scenario | Action |
|----------|--------|
| Signal already exists | Skip (idempotent). Note in summary. |
| Stakeholder [[workspace/stakeholders/stakeholder-map.md|name]] ambiguity | Flag for Jay's review instead of auto-merging. |
| UC card not found | Create signal entry without UC mapping. Note gap. |

## Batch Mode Errors

In batch mode, if one document fails:
1. Log the error
2. Continue processing remaining documents
3. Include failed document in final summary with error reason
