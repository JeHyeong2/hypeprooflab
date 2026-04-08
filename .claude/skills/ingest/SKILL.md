---
name: ingest
description: Ingest documents (meeting notes, PDFs, free text) through parallel analysis agents into the knowledge vault. Use when ingesting meeting notes, PDFs, or documents into the vault.
user_invocable: true
triggers:
  - "ingest"
  - "process meeting notes"
  - "analyze document"
---

## Purpose
Full ingestion pipeline: document → parallel agent extraction → vault mapping → knowledge write → index rebuild.

## Mode Detection

- **Single document**: `/ingest <file>` or `/ingest` (prompted for file)
- **Batch**: `/ingest --batch <file1> <file2> ...` — process multiple documents sequentially
- **Auto**: Headless via cron — scan `data/meeting-notes/` for unprocessed files

## Workflow

### Phase 0: Document Identification

Identify input document(s). For each document, determine:
- Source type: meeting notes, PDF, email, free text
- Customer/product context (match against `config/config.yaml`)
- Processing date

### Phase 1: Parallel Agent Extraction

Dispatch **6 agents** per [Agent Dispatch Pattern](../config/references/agent-dispatch.md#phase-1-parallel-extraction):
- signal-extractor, maturity-assessor, action-extractor, stakeholder-mapper, decision-extractor
- **demo-state-extractor** — dispatch when document relates to workshop/demo prep (keywords: demo, workshop, dry run, testbed, slide, presentation)

### Phase 2: Sequential Mapping

Per [Agent Dispatch Pattern](../config/references/agent-dispatch.md#phase-2-sequential-mapping):
1. **agenda-mapper** — map results to UC Status Cards
2. **vault-differ** — classify as new/update/known

### Phase 2.5: Demo Tracker Verification (interactive only)

If demo-state-extractor produced output:
1. Read `workspace/agendas/demo-tracker.md`
2. Compare extraction against tracker — identify `[UPDATE]`, `[NEW CONFIRMATION]`, `[RESOLVED]` changes
3. Present changes to user via AskUserQuestion:
   ```
   Demo tracker updates from "{meeting name}":
   - [NEW] Topic 3 demo: Compredict on CCU2 confirmed by Itay
   - [UPDATE] Topic 5 blocker resolved: Rust component complete
   - [UNCONFIRMED] Topic 4 setup details inferred, not confirmed
   
   Apply these updates? [all / pick / skip]
   ```
4. Apply confirmed updates to `workspace/agendas/demo-tracker.md`
5. In headless/cron mode: skip verification, apply only `[confirmed]` items automatically

### Phase 3: Vault Writes

Per [Vault Write Rules](../config/references/vault-write-rules.md):
- Signals → `workspace/signals/YYYY-MM.md` (append)
- Actions → relevant agenda cards (update)
- Maturity → agenda cards (update D-level)
- Stakeholders → `workspace/stakeholders/stakeholder-map.md` (merge)
- Decisions → `workspace/decisions/DEC-YYYY-MMDD-NN.md` (create)
- Knowledge → `knowledge/` (create or update)

### Phase 4: Index Rebuild

```bash
python3 .claude/skills/index/scripts/build_index.py
```

Validate: `python3 -c "import yaml; yaml.safe_load(open('knowledge/ontology-index.yaml'))"`

### Output

Print ingestion summary: documents processed, signals/actions/decisions extracted, vault files updated.

## Error Handling

Read [references/error-handling.md](references/error-handling.md) for retry and partial failure rules.

## Dependencies
- Agents: signal-extractor, maturity-assessor, action-extractor, stakeholder-mapper, decision-extractor, demo-state-extractor, agenda-mapper, vault-differ
- Scripts: `index/scripts/build_index.py`
- References: [agent-dispatch](../config/references/agent-dispatch.md), [vault-write-rules](../config/references/vault-write-rules.md)
