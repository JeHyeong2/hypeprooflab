---
name: brainstorm
description: >
  Interactive brainstorming and co-creation with vault context and structured decision points via AskUserQuestion.
user_invocable: true
triggers:
  - "brainstorm"
  - "co-create"
  - "같이 생각해보자"
  - "브레인스토밍"
---

# brainstorm

## Purpose

Co-create documents with Jay through structured decision-making. Jay provides direction and judgment; the system provides vault context, structured options, and document synthesis.

**Core loop**: Topic → Context scan → Decision point identification → Interactive Q&A → Synthesis → Review

Follows the **Interactive Checkpoint Pattern** (CLAUDE.md) and **Human Judgment + Machine Execution** principle.

**Routing**: Triggers include Korean phrases (같이 생각해보자, 브레인스토밍, 결정 도와줘, 같이 써보자). Do NOT use for simple vault queries (use /ask), meeting prep (use /meeting-prep), or document ingestion (use /ingest).

## Workflow

### Phase 0: Topic Intake

Accept Jay's natural language description. Parse for:

- **Goal**: What document/output is needed
- **Audience**: Who will read it (CEO, customer, internal team)
- **Scope**: Specific product, customer, or cross-cutting topic

If the trigger message contains enough detail (e.g., `/brainstorm Jeff에게 줄 제품 미션 문서 만들자`), proceed directly to Phase 1. Otherwise, ask 1-2 clarifying questions max via AskUserQuestion. Do NOT over-ask — infer what you can.

### Phase 1: Context Resolution

Automatically detect and load relevant vault context. See [Context Resolution](../config/references/context-resolution.md) for the full strategy.

**Quick summary**:
1. Extract entities (customers, products, stakeholders) from Jay's input
2. Match against `knowledge/index-routing.yaml` (preferred) or `ontology-index.yaml`
3. Load files in priority order: P0 (routing table) → P1 (matched cards) → P2 (signals) → P3 (agendas) → P4 (retros) → P5 (stakeholders) → P6 (calendar)
4. Stay within ~15K token budget

After loading, print a brief summary:
```
[context] Loaded: hkmc.md, ai-technician.md, stakeholder-map.md (Jeff), signals/2026-03.md (12 matches), uc-ai-diagnostics.md
```

### Phase 2: Decision Point Identification

Analyze topic + loaded context to identify **3-5 key decisions** where:

1. Vault contains **conflicting signals** or multiple valid positions
2. Jay's **personal judgment** is required (not derivable from data)
3. The answer **materially changes** the output document

Prioritize by impact on final document. Skip obvious/derivable questions.

### Phase 3: Interactive Q&A

Present each decision point using **AskUserQuestion, one at a time**:

- 2-3 options per question (max 4), each with description grounded in vault evidence
- Mark one as `(Recommended)` when vault evidence clearly favors it
- Keep `header` short (max 12 chars)
- Match language to Jay's input (Korean trigger → Korean questions)

**Rules**:
- One AskUserQuestion per decision. Wait for answer before next.
- If Jay adds context beyond options (notes field), treat it as strongest signal.
- If Jay rejects AskUserQuestion tool, switch to free-text for remaining decisions.
- **3-5 questions total. Never more than 5.**

### Phase 4: Synthesis

Combine Jay's decisions + vault context into a document draft. Auto-detect or let Jay specify output type:

| Type | Structure | When |
|------|-----------|------|
| Strategy/Executive | Narrative 5-7p, 6-pager style | Audience is C-level |
| Customer Proposal | Problem → Solution → Pricing → Timeline | External customer |
| Decision Memo | Context → Options → Recommendation → Risk | Internal decision |
| Email Draft | Subject → Body → CTA | Communication |
| Talking Points | Context → Messages → Questions → Avoid | Meeting prep |

**Synthesis principles**:
- Lead with Jay's bet/conviction, not analysis
- Include numbers (even estimates)
- Use vault evidence as support, not structure
- Match audience expectations
- Write in Jay's trigger language

### Phase 5: Review Checkpoint

1. Write draft to `workspace/reports/YYYY-MM-DD-{slug}.md`
2. Show full document in conversation
3. Ask: "Review and give feedback, or done?"
4. On feedback: apply edits, re-show
5. On "done": confirm file path, exit
6. If Jay asks for Korean version too: generate `{slug}-ko.md` alongside

## Error Handling

| Failure | Action |
|---------|--------|
| No entities detected | Ask: "What product, customer, or person is this about?" |
| Index missing/stale | Print warning, fall back to Glob/Grep |
| Jay rejects AskUserQuestion | Switch to free-text conversation |
| Jay says "stop"/"quit" | Summarize decisions so far, offer partial draft |
| Context too large (>15K) | Use P0-P2 only, note exclusions |

## Usage Examples

```
/brainstorm Jeff에게 줄 제품 미션 문서 만들자
/brainstorm Genesis PoC proposal 같이 써보자
/brainstorm 내일 David와 미팅에서 뭘 이야기할지
/brainstorm AIT vs Collector priority — help me decide
/brainstorm Frontier Lab defense strategy memo
```

## Dependencies

- `knowledge/index-routing.yaml` or `ontology-index.yaml` — entity resolution
- `workspace/signals/`, `workspace/agendas/`, `workspace/stakeholders/`, `knowledge/` — vault context
- AskUserQuestion tool — interactive decision collection
- Context resolution: [shared reference](../config/references/context-resolution.md)
