---
name: research
description: Competitive intelligence and market research with vault integration. Use when researching competitors, market landscape, or industry trends.
user_invocable: true
triggers:
  - "research"
  - "competitive intelligence"
  - "market research"
argument_hint: "<topic, e.g. 'AI routine recommendation competitive landscape'>"
---

# research

## Purpose

Run structured competitive intelligence and market research. Spawns parallel web research agents, synthesizes findings, and writes results to the vault.

## Mode Detection

Detect execution mode and load the appropriate mode file:
- **Interactive** (Jay runs `/research <topic>`): Read `modes/interactive.md` for plan checkpoint + Confluence publish
- **Auto** (`--auto` flag or cron): Read `modes/auto.md` for stale competitor refresh

## Inputs

`/research <topic or question> [--append-to <file>] [--republish]`

**Flags**:
- `--append-to <file>` — instead of writing a standalone report, append synthesized findings to an existing file
- `--republish` — after appending, re-publish the target file to Confluence (only valid with `--append-to`)

Example topics:
- "[[workspace/agendas/uc-ai-routine.md|AI routine]] recommendation competitive landscape for HKMC workshop"
- "[[knowledge/products/sdn-platform.md|SDN platform]] competitors and pricing models"
- "ADAS Level 3 OEM comparison 2026"
- `"SOVD monitoring capabilities" --append-to workspace/reports/2026-03-25-uvas-counter-proposal.md`

## Workflow

### Phase 1: Scope & Plan

1. Parse the research topic from user input
2. Read `config.yaml` for entity context (customers, products, competitors)
3. Scan existing vault knowledge for the topic:
   - `knowledge/competitors/` — existing competitor profiles
   - `knowledge/products/` — existing product context
   - `workspace/signals/` — recent related signals
   - `knowledge/specs/` — relevant spec summaries
4. Generate a research plan with 3-5 parallel agent scopes
5. **Interactive mode only**: present plan checkpoint (see `modes/interactive.md`)

### Phase 2: Parallel Web Research

Spawn 3-5 agents in parallel using the Agent tool. Each agent gets this prompt template:

```
You are a {domain} researcher. Your task: research and compile findings on:
{specific_questions}

## Research Method: ReACT Iterative Loop

### Round 1 — Broad Search
1. Act: Run a broad web search on your research dimension
2. Observe: Record raw findings (claims, data points, sources)
3. Reflect: Are all sub-questions answered with sourced data?

### Round 2 — Targeted Follow-up (REQUIRED)
4. Act: Run targeted follow-up addressing gaps from Round 1
5. Observe: Record additional findings
6. Reflect: Cross-reference against Round 1

### Round 3+ — Optional Deepening
7. If significant gaps remain, run additional targeted searches

### Vault Cross-Reference (REQUIRED)
After all search rounds, cross-reference findings against existing vault data.
Flag: [NEW] vs [CONFIRMED] vs [CONTRADICTS VAULT]

### Synthesis
Compile final structured output after at least 2 rounds + vault cross-reference.

## Output Rules
- Structured markdown: tables and bullets, not prose
- Every factual claim MUST have a source URL
- Keep output under 3000 words
- Include a "Research Log" section listing each search query used
```

**Agent scoping**: split by dimension (feature comparison, business model, market context, technology trends, regulatory).

### Phase 3: Synthesis

1. Merge agent outputs into structured report (Executive Summary, Comparison Table, Key Statistics, Positioning Recommendations, Sources)
2. Cross-reference with existing vault knowledge
3. Generate topic slug for file naming

### Phase 3.5: Internal Content Tagging (REQUIRED)

Wrap internal-only content with `<!-- INTERNAL -->` / `<!-- /INTERNAL -->` markers:
- Unverified claims from internal meetings
- Internal stakeholder names/roles
- References to internal decisions
- Pricing/contract details from internal documents

### Phase 4: Vault Write

**If `--append-to` flag is set:**

1. Read the target file specified by `--append-to`
2. Find insertion point: scan for a trailing `## Risk` or `## Conclusion` section — insert before it. If none found, append at EOF.
3. Synthesize research findings as new numbered section(s) matching the target document's style
4. Write the updated file
5. Still update competitor/signal/product vault files as normal (steps 3-5 below)
6. If `--republish` flag is also set, re-publish the target file to Confluence:
   ```bash
   python3 .claude/skills/confluence-publish/scripts/publish.py \
     <append-to-file> --json
   ```
7. Append timestamp footer to the inserted section: `*Research appended: {date} by /research*`

**Otherwise (default — standalone report):**

Write results following idempotent append-only rules:

1. **Report — English**: `workspace/reports/{date}-{topic-slug}.md`
2. **Report — Korean**: `workspace/reports/{date}-{topic-slug}-ko.md` (translate prose, keep technical terms in English)
3. **Competitor intelligence**: `knowledge/competitors/{competitor-[[workspace/stakeholders/stakeholder-map.md|name]]}.md` (append new sections)
4. **Signals**: `workspace/signals/{YYYY-MM}.md` (append competitive signals)
5. **Product context**: `knowledge/products/{product-name}.md` (append new intel)

Append timestamp footer: `*Updated: {date} by research*`

Then follow mode-specific steps (Confluence publish in interactive; stdout-only in auto).

## Dependencies

- Config: `.claude/skills/config/config/config.yaml`
- Storage: `workspace/reports/`, `workspace/signals/`, `knowledge/competitors/`, `knowledge/products/`
- Tools: Agent (parallel web research), WebSearch (via agents), Read/Write (vault)
- Chaining: `publish_markdown_file()` from `.claude/skills/confluence-publish/scripts/publish.py` (for `--republish`)

## Notes

- Token efficiency: each agent capped at ~3000 words output. Total budget ~120K tokens for 4 agents.
- All agents run in parallel — wall-clock time is determined by the slowest agent.
- Never fabricate data. If sources conflict, present both with citations.
- Reports are point-in-time snapshots. Include the research date prominently.
