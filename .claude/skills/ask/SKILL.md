---
name: ask
description: Ask natural language questions about the PM knowledge vault. Use when querying vault, asking about customers/products/decisions.
user_invocable: true
triggers:
  - "ask vault"
  - "query vault"
  - "vault question"
---

# ask

## Purpose

Answer natural language questions about the PM knowledge vault using the ontology index and source files.

## Inputs

`/ask <question>` — The question can be in Korean or English.

Example questions:
- "CCU2의 현재 maturity gap은?"
- "[[workspace/stakeholders/stakeholder-map.md|이동열]] 상무가 가장 우려하는 것은?"
- "다음 워크샵까지 해결해야 할 P0 액션은?"
- "AI Director와 AI Collector의 CES 2026 데모 결과는?"
- "경쟁사 대비 우리 약점은?"
- "지난주 대비 새로운 시그널은?"
- "[[workspace/agendas/uc-log-aggregation.md|CCU2]] maturity는 언제 D3가 됐어?"

## Workflow

### 1. Index Freshness Check

Read `knowledge/ontology-index.yaml` and check `meta.generated` timestamp.
- If older than 24 hours: print warning "Index is {N} hours old. Run `/index` to refresh."
- Continue with existing index regardless.

### 2. Simple Lookup (no agent needed)

For these question types, answer directly from the index without spawning an agent:

- **Maturity level**: "What is {product}'s maturity?" → `products[id].maturity`
- **P0 count**: "How many P0 actions?" → `actions_summary.by_priority.P0`
- **Signal stats**: "How many signals this month?" → `signals_summary.total_count`
- **Entity list**: "What products do we have?" → list `products[].[[workspace/stakeholders/stakeholder-map.md|name]]`
- **Alias resolution**: "Who is [[workspace/stakeholders/stakeholder-map.md|권해윤]]?" → `alias_map` lookup → `stakeholders[id]`

### 3. Complex Questions (multi-channel retrieval + qa agent)

For questions requiring cross-entity reasoning, file reading, or synthesis:

1. Run multi-channel retrieval to find relevant files:
   ```bash
   python3 .claude/skills/ask/scripts/vault_search.py --json "<question>"
   ```
   This scores files across 4 channels (keyword, BM25, graph, temporal) and returns a merged ranking.

2. Dispatch to the `qa` agent using the Task tool with the original question, the ranked file list from step 1, and any relevant context from the index lookup.

### 4. Response

- Answer in the same language as the question
- Include source citations
- For actionable findings, suggest next steps

## Multi-Channel Retrieval

The `vault_search.py` script provides 4 retrieval channels that are merged with weighted scoring:

| Channel | Weight | Source | Purpose |
|---------|--------|--------|---------|
| Keyword | 1.0 | ontology-index / routing table | Entity resolution -> file lookup |
| BM25 | 0.8 | All vault .md files | TF-IDF lexical match for terms not in entities |
| Graph | 0.6 | graph-edges.yaml | Relationship traversal (sponsors, dependencies, influences) |
| Temporal | 0.3 | File modification times | Boost recently updated files (14-day decay) |

Run individual channels with `--channel`:
```bash
python3 .claude/skills/ask/scripts/vault_search.py --channel bm25 "diagnostic integration"
```

## Dependencies

- Index: `knowledge/ontology-index.yaml` (run `/index` to generate)
- Changelog: `knowledge/ontology-changelog.yaml`
- Graph: `knowledge/graph-edges.yaml` (built by `/index`)
- Retrieval: `.claude/skills/ask/scripts/vault_search.py`
- Agent: `qa` (for complex questions)
- Source files: `workspace/agendas/`, `workspace/signals/`, `workspace/stakeholders/`, `knowledge/`
